import { EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { StateEffect, StateField, type Extension } from '@codemirror/state';
import { stripSentinels, docToClean } from './text-editor.annotation-sentinels.js';
import { MENTION_TOKEN_RE } from './text-editor.mention.js';
import { annotationMove } from './text-editor.annotations.js';

/* Drag-to-move for selected text. The editor lives in a shadow DOM, where the
 * browser refuses to start a native drag of the selection (the document-level
 * selection is collapsed for shadow-tree selections), so the native HTML5 path
 * never fires. This reimplements it with pointer tracking: mousedown on the
 * selection → past a small threshold it becomes a drag → a drop cursor shows
 * where it will land → mouseup moves the text there. */

const setDropPos = StateEffect.define<number | null>();

// Holds the live drop position during a drag; the overlay plugin draws the cursor.
const dropPosField = StateField.define<number | null>({
	create: () => null,
	update(value, tr) {
		for (const effect of tr.effects) if (effect.is(setDropPos)) return effect.value;
		return value === null ? null : tr.changes.mapPos(value);
	},
});

interface DropRect { left: number; top: number; height: number }

// Draws the drop cursor as an absolutely-positioned overlay instead of an inline
// widget. An inline widget dropped inside an annotation splits its tint into two
// rounded pills; an overlay sits above the text, so the annotation stays whole and
// the cursor can be a clearly visible bar. The position is read in a measure pass,
// so coordsAtPos (a layout read) never runs mid-update.
class DropCursorLayer {
	private cursor: HTMLElement | null = null;

	constructor(private readonly view: EditorView) {}

	update(update: ViewUpdate): void {
		const pos = update.state.field(dropPosField);
		if (pos === null) {
			this.remove();
		} else if (
			update.startState.field(dropPosField) !== pos ||
			update.docChanged ||
			update.geometryChanged
		) {
			this.view.requestMeasure({ read: this.readPos, write: this.drawCursor });
		}
	}

	private readPos = (): DropRect | null => {
		const pos = this.view.state.field(dropPosField);
		if (pos === null) return null;
		const rect = this.view.coordsAtPos(pos, 1);
		if (!rect) return null;
		const base = this.view.scrollDOM.getBoundingClientRect();
		return {
			left: rect.left - base.left + this.view.scrollDOM.scrollLeft,
			top: rect.top - base.top + this.view.scrollDOM.scrollTop,
			height: rect.bottom - rect.top,
		};
	};

	private drawCursor = (rect: DropRect | null): void => {
		if (!rect) {
			this.remove();
			return;
		}
		if (!this.cursor) {
			this.cursor = document.createElement('div');
			this.cursor.className = 'cm-drag-and-drop-cursor';
			this.view.scrollDOM.appendChild(this.cursor);
		}
		this.cursor.style.left = `${rect.left}px`;
		this.cursor.style.top = `${rect.top}px`;
		this.cursor.style.height = `${rect.height}px`;
	};

	private remove(): void {
		this.cursor?.remove();
		this.cursor = null;
	}

	destroy(): void {
		this.remove();
	}
}

const dropCursorLayer = ViewPlugin.fromClass(DropCursorLayer);

interface DragState {
	startX: number;
	startY: number;
	from: number;
	to: number;
	dragging: boolean;
	/** A whole mention token is being dragged (a plain click keeps it selected). */
	isMention: boolean;
}

class DragMove {
	private state: DragState | null = null;
	private ghost: HTMLElement | null = null;

	constructor(private readonly view: EditorView) {}

	start(event: MouseEvent): boolean {
		if (event.button !== 0 || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return false;
		// Leave multi-click to CM (double = word, triple = line). Otherwise the third
		// click of a triple lands on the word the second click selected, starts a drag,
		// and collapses to a caret on release — so it took a fourth click to select.
		if (event.detail >= 2) return false;
		if (this.view.state.readOnly) return false;
		// Mentions own their own click (select-on-click); don't hijack it as a drag.
		if ((event.target as HTMLElement | null)?.closest?.('.cm-md-mention-token')) return false;
		const sel = this.view.state.selection.main;
		if (sel.empty) return false;
		const pos = this.view.posAtCoords({ x: event.clientX, y: event.clientY });
		if (pos === null || pos < sel.from || pos > sel.to) return false; // not on the selection
		this.state = { startX: event.clientX, startY: event.clientY, from: sel.from, to: sel.to, dragging: false, isMention: false };
		window.addEventListener('mousemove', this.onMove, true);
		window.addEventListener('mouseup', this.onUp, true);
		event.preventDefault(); // we own this press; CM shouldn't start a new selection
		return true;
	}

	/** Begin a drag of an explicit range (a mention token) seeded from a pointer
	 *  press the component already handled. The mention is selected on press, so a
	 *  plain release keeps it selected; dragging past the threshold moves the whole
	 *  token. mousemove/mouseup still fire after a prevented pointerdown. */
	startFor(seed: { clientX: number; clientY: number }, from: number, to: number): void {
		if (this.view.state.readOnly) return;
		this.state = { startX: seed.clientX, startY: seed.clientY, from, to, dragging: false, isMention: true };
		// Pointer events, not mouse: the component preventDefault'd the pointerdown to
		// own the press, which can suppress the compatibility mousemove/mouseup.
		window.addEventListener('pointermove', this.onMove, true);
		window.addEventListener('pointerup', this.onUp, true);
	}

	private removeListeners(): void {
		window.removeEventListener('mousemove', this.onMove, true);
		window.removeEventListener('mouseup', this.onUp, true);
		window.removeEventListener('pointermove', this.onMove, true);
		window.removeEventListener('pointerup', this.onUp, true);
	}

	private onMove = (event: MouseEvent): void => {
		const st = this.state;
		if (!st) return;
		if (!st.dragging) {
			if (Math.abs(event.clientX - st.startX) + Math.abs(event.clientY - st.startY) < 4) return;
			st.dragging = true;
			// Default cursor (no grab handle) plus a translucent copy of the text.
			this.view.scrollDOM.style.cursor = 'default';
			this.showGhost(st.from, st.to);
		}
		this.moveGhost(event.clientX, event.clientY);
		// No drop cursor when outside the editor (the drop would be undone) or while
		// hovering inside the dragged range (a no-op target).
		const pos = this.isInside(event.clientX, event.clientY)
			? this.view.posAtCoords({ x: event.clientX, y: event.clientY })
			: null;
		const drop = pos === null || (pos >= st.from && pos <= st.to) ? null : pos;
		this.view.dispatch({ effects: setDropPos.of(drop) });
	};

	private onUp = (event: MouseEvent): void => {
		this.removeListeners();
		this.view.scrollDOM.style.cursor = '';
		this.clearGhost();
		const st = this.state;
		this.state = null;
		this.view.dispatch({ effects: setDropPos.of(null) });
		if (!st) return;
		const pos = this.view.posAtCoords({ x: event.clientX, y: event.clientY });
		if (!st.dragging) {
			// A plain click on a mention keeps it selected (set on press); on a text
			// selection it collapses the caret where you clicked.
			if (!st.isMention && pos !== null) this.view.dispatch({ selection: { anchor: pos } });
			this.view.focus();
			return;
		}
		if (this.isInside(event.clientX, event.clientY) && pos !== null && (pos < st.from || pos > st.to)) {
			// Move clean text: any annotation sentinels in the slice are dropped here,
			// and the document filter re-adds the ones it needs at the new location.
			const doc = this.view.state.doc.toString();
			const text = stripSentinels(this.view.state.sliceDoc(st.from, st.to));
			const insertAt = pos > st.to ? pos - (st.to - st.from) : pos;
			// Clean-coordinate move info so annotations inside the block travel with it
			// (drop is always outside the block, so pos is before delFrom or after delTo).
			const delFrom = docToClean(doc, st.from);
			const delTo = docToClean(doc, st.to);
			const cleanPos = docToClean(doc, pos);
			const cleanInsertAt = cleanPos > delTo ? cleanPos - (delTo - delFrom) : cleanPos;
			this.view.dispatch({
				changes: [{ from: st.from, to: st.to }, { from: pos, insert: text }],
				selection: { anchor: insertAt, head: insertAt + text.length },
				effects: annotationMove.of({ from: delFrom, to: delTo, insertAt: cleanInsertAt }),
			});
		} else {
			// Dropped outside the editor (or back onto the selection): leave the text
			// where it was and keep it selected — effectively undoing the drag.
			this.view.dispatch({ selection: { anchor: st.from, head: st.to } });
		}
		this.view.focus();
	};

	private isInside(x: number, y: number): boolean {
		const r = this.view.scrollDOM.getBoundingClientRect();
		return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
	}

	// A translucent copy of the dragged text that follows the pointer.
	private showGhost(from: number, to: number): void {
		const ghost = document.createElement('div');
		ghost.className = 'cm-drag-ghost';
		// Show a mention as plain @Name — drop the markdown link wrapper and user id.
		ghost.textContent = stripSentinels(this.view.state.sliceDoc(from, to)).replace(MENTION_TOKEN_RE, '$1');
		this.view.dom.appendChild(ghost);
		this.ghost = ghost;
	}

	private moveGhost(x: number, y: number): void {
		if (this.ghost) {
			this.ghost.style.left = `${x + 12}px`;
			this.ghost.style.top = `${y + 12}px`;
		}
	}

	private clearGhost(): void {
		this.ghost?.remove();
		this.ghost = null;
	}

	destroy(): void {
		this.removeListeners();
		this.clearGhost();
	}
}

export const dragMovePlugin = ViewPlugin.fromClass(DragMove, {
	eventHandlers: {
		mousedown(this: DragMove, event: MouseEvent) {
			return this.start(event);
		},
	},
});

/** Drag selected text to move it (shadow-DOM-safe; native DnD won't start here). */
export const dragToMove: Extension = [dropPosField, dropCursorLayer, dragMovePlugin];
