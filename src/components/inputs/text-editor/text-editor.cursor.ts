import { Annotation, EditorSelection, Prec, type Extension } from '@codemirror/state';
import { EditorView, RectangleMarker, getDrawSelectionConfig, keymap, layer, type Command } from '@codemirror/view';
import { bareUrlEndsAt, linkEndsAt } from './text-editor.links.js';

/* The caret, drawn on a side that does not depend on how it got there.
 *
 * CodeMirror draws a cursor at `coordsAtPos(head, assoc)`, and `assoc` records
 * the direction the caret arrived from: from the left it measures the right edge
 * of the glyph before the position, from the right the left edge of the glyph
 * after it. For upright text those edges coincide. For italics they do not, since
 * a slanted glyph overhangs its own advance, and Safari rounds each edge to a
 * whole pixel on top of that. Arrow left and arrow right onto the same position
 * then land the caret a pixel apart, which reads as a caret that will not stay
 * put.
 *
 * At a widget (a link badge) or a line wrap the two sides are genuinely
 * different places and the direction must decide. So the rule is not "always
 * one side" but "one side, unless the sides are far enough apart to mean
 * something". And a link badge, a widget on one document position, is made to
 * feel like a character of its own that cannot be edited: a click lands on the
 * side you clicked, the arrow keys step from one side of it to the other,
 * Backspace and Delete step over it rather than eating past it, and text goes
 * to the side of the badge it was typed on. */

/** Below this the two edges of one position are the same place drawn twice, and
 *  only glyph overhang and pixel rounding tell them apart. A widget is a full
 *  icon wide and a line wrap is a line away, so neither comes near it. */
const GLYPH_NOISE_PX = 2;

/** The side the main caret is drawn on at `head`, when that is not for the
 *  selection's own assoc to say. Set by a step-over (its assoc does not survive
 *  the transaction: a later filter rebuilds the selection without it), by a
 *  click (CodeMirror reads the side of a click from the line, not from the
 *  pointer, and would land left of a badge you clicked right of), and by an
 *  edit: typing and a backward delete leave the caret at the end of what was
 *  just edited, so on the side that text is, the left; a forward delete leaves
 *  it where the removed text began, the right. */
const sideHint = new WeakMap<EditorView, { head: number; side: -1 | 1 | 'pointer' }>();

/** The side a step-over asks for, carried as an annotation. */
const caretSide = Annotation.define<-1 | 1>();

/** Where the pointer last went down or dragged, to read the side of a click. */
const lastPointer = new WeakMap<EditorView, { x: number; y: number }>();

interface Edges {
	before: { left: number; top: number };
	after: { left: number; top: number };
}

function edges(view: EditorView, head: number): Edges | null {
	const before = view.coordsAtPos(head, -1);
	const after = view.coordsAtPos(head, 1);
	return before && after ? { before, after } : null;
}

/** A line wrap puts the two sides a whole line apart. A few pixels is not that:
 *  a syntax marker is set in monospace, whose glyph box sits a little higher or
 *  lower than the body text's, and Safari rounds each edge to a whole pixel. */
const WRAP_PX = 8;

function onOneLine(e: Edges): boolean {
	return Math.abs(e.before.top - e.after.top) < WRAP_PX;
}

/** The side the caret is drawn on at `head`: 1 unless the two sides are
 *  genuinely apart and a hint, or else the arrival direction, says "before". */
export function drawnAssoc(view: EditorView, head: number, assoc: number): -1 | 1 {
	const e = edges(view, head);
	if (e && onOneLine(e) && Math.abs(e.before.left - e.after.left) <= GLYPH_NOISE_PX) return 1;
	const hint = sideHint.get(view);
	if (hint && hint.head === head) {
		if (hint.side !== 'pointer') return hint.side;
		// The side of a click: the one the pointer was nearer to. Measured here,
		// at drawing time, since the layout may not be read during an update.
		const p = lastPointer.get(view);
		if (p && e) return Math.abs(p.x - e.before.left) <= Math.abs(p.x - e.after.left) ? -1 : 1;
	}
	if (assoc) return assoc < 0 ? -1 : 1;
	return 1;
}

const pointerTracker = EditorView.domEventHandlers({
	mousedown(event, view) {
		lastPointer.set(view, { x: event.clientX, y: event.clientY });
		return false;
	},
	mousemove(event, view) {
		if (event.buttons) lastPointer.set(view, { x: event.clientX, y: event.clientY });
		return false;
	},
	touchstart(event, view) {
		const touch = event.touches[0];
		if (touch) lastPointer.set(view, { x: touch.clientX, y: touch.clientY });
		return false;
	},
});

/** Puts the caret on `side` of the link badge it stands at, without moving it in
 *  the document. Nothing to do (so the key falls through to its usual command)
 *  when there is no badge here, or the caret is on that side already. Only a
 *  link badge qualifies: a mention token or an annotation badge keeps its own
 *  Backspace and arrow behavior. The badge's two sides are not asked to share a
 *  line: the marker before it may measure a rounded pixel off in Safari, and a
 *  wrap can fall between the two. */
function stepOver(side: -1 | 1): Command {
	return (view) => {
		const { main } = view.state.selection;
		if (!main.empty || !linkEndsAt(view.state, main.head) || !edges(view, main.head)) return false;
		if (drawnAssoc(view, main.head, main.assoc) === side) return false;
		view.dispatch({ selection: EditorSelection.cursor(main.head, side), annotations: caretSide.of(side), userEvent: 'select' });
		return true;
	};
}

const stepOverKeymap = Prec.high(keymap.of([
	{ key: 'ArrowLeft', run: stepOver(-1) },
	{ key: 'ArrowRight', run: stepOver(1) },
	{ key: 'Backspace', run: stepOver(-1) },
	{ key: 'Delete', run: stepOver(1) },
]));

/** Characters that end a bare URL by themselves (GFM: whitespace, `<`, and the
 *  punctuation it leaves off the end), so text starting with one lands after
 *  the badge on its own. Anything else would join the URL. */
const ENDS_URL = /^[\s<?!.,:*_~)]/;

/** Text typed right of the badge of a bare URL lands right of the badge. There
 *  is no boundary in markdown to put it behind: `www.apple.comx` is one URL. A
 *  space is that boundary, so the editor writes it before the text. */
const typePastBadge = EditorView.inputHandler.of((view, from, to, text) => {
	if (from !== to || !text || view.composing || ENDS_URL.test(text)) return false;
	const { main } = view.state.selection;
	if (!main.empty || main.head !== from || !bareUrlEndsAt(view.state, from) || !edges(view, from)) return false;
	if (drawnAssoc(view, from, main.assoc) !== 1) return false;
	view.dispatch({
		changes: { from, insert: ` ${text}` },
		selection: { anchor: from + 1 + text.length },
		userEvent: 'input.type',
		scrollIntoView: true,
	});
	return true;
});

const cursorLayer = layer({
	above: true,
	class: 'cm-nldd-cursorLayer',
	markers(view) {
		const { state } = view;
		const conf = getDrawSelectionConfig(state);
		const out: RectangleMarker[] = [];
		for (const r of state.selection.ranges) {
			if (!r.empty && !conf.drawRangeCursor) continue;
			const prim = r === state.selection.main;
			const className = prim ? 'cm-cursor cm-cursor-primary' : 'cm-cursor cm-cursor-secondary';
			const cursor = EditorSelection.cursor(r.head, drawnAssoc(view, r.head, r.assoc));
			out.push(...RectangleMarker.forRange(view, className, cursor));
		}
		return out;
	},
	update(update, dom) {
		if (update.docChanged || update.selectionSet) {
			const { view } = update;
			const head = update.state.selection.main.head;
			const kept = sideHint.get(view);
			let hint: { head: number; side: -1 | 1 | 'pointer' } | null = kept ? { ...kept, head: update.changes.mapPos(kept.head) } : null;
			const oldHead = update.startState.selection.main.head;
			for (const tr of update.transactions) {
				const asked = tr.annotation(caretSide);
				if (asked) hint = { head, side: asked };
				else if (tr.isUserEvent('select.pointer')) hint = { head, side: 'pointer' };
				else if (tr.isUserEvent('input') || tr.isUserEvent('delete.backward')) {
					// Deleting the text between the caret and a badge brings the caret
					// back to the badge from the right, so it stays on the right: the
					// period after a link goes, the caret does not hop over the badge.
					// Editing at the badge itself keeps the side it was on, which is the
					// URL being typed.
					//
					// A link that only now ends here is one the edit just made, and what
					// it is decides where the caret belongs. A `[text](url)` link is
					// finished by its `)`, so the caret goes after the badge. A bare URL
					// is still growing: `www.apple.c` parses as a whole link the moment
					// it is typed, while the user is on their way to `.com`, so the caret
					// stays on the link's side and the next letter extends the URL. A
					// space, or anything else that ends a URL, is what puts you outside.
					// Only while typing: a Backspace that eats the period behind a URL
					// arrives at the badge from the right and stays there.
					const grew = tr.isUserEvent('input') && bareUrlEndsAt(update.state, head);
					const fromOutside = linkEndsAt(update.state, head)
						&& !linkEndsAt(update.startState, oldHead)
						&& !grew;
					hint = { head, side: fromOutside ? 1 : -1 };
				}
				else if (tr.isUserEvent('delete.forward')) hint = { head, side: 1 };
				else if (tr.selection) hint = null;
			}
			if (hint) sideHint.set(view, hint);
			else sideHint.delete(view);
		}
		// Restart the blink on a selection change, the way CodeMirror's own layer
		// does, by flipping between its two identical keyframe sets.
		if (update.transactions.some((tr) => tr.selection)) {
			dom.style.animationName = dom.style.animationName === 'cm-blink' ? 'cm-blink2' : 'cm-blink';
		}
		return update.docChanged || update.selectionSet;
	},
	mount(dom, view) {
		dom.style.animationDuration = `${getDrawSelectionConfig(view.state).cursorBlinkRate}ms`;
	},
});

export const stableCursor: Extension = [cursorLayer, pointerTracker, stepOverKeymap, typePastBadge];
