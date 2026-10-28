import { ViewPlugin, type EditorView } from '@codemirror/view';

/* The selection as tall as the line, like the tokens (code, mention,
 * annotation) that fill it. CodeMirror measures each piece of a selection on
 * what it starts on: the letters (21.5px at the body size), a token (its own
 * height), and for the first and last row of a selection over several lines
 * something in between. So after every drawing, each piece of one row is set
 * to the line height, centered on its row. A piece over several whole lines,
 * or one taller already (a heading), is left as it is.
 *
 * And no wider than the text. A line selected to its end is drawn to the
 * right edge of the content, its padding included, since CodeMirror only takes
 * off the padding of a line. Each piece stops where the text column does, as a
 * selection on macOS stops short of the margin.
 *
 * And without seams. A row taller than the line height (a quote) keeps its
 * piece centered, a little below its top, so after a piece of one plain row
 * there was a strip of the page between the two. A piece that falls short of
 * the next one now runs down to it. */

function rowHeightPieces(view: EditorView): void {
	const layer = view.dom.querySelector('.cm-selectionLayer');
	if (!layer) return;
	const height = view.defaultLineHeight;
	const content = view.contentDOM;
	const textRight = content.getBoundingClientRect().right - (parseFloat(getComputedStyle(content).paddingRight) || 0);
	// All reads first, then all writes: a read after a write forces a layout, and
	// where each piece ends up follows from what is written.
	const reads = [...layer.querySelectorAll<HTMLElement>('.cm-selectionBackground')].map((piece) => {
		const box = piece.getBoundingClientRect();
		if (box.height >= height * 1.25) return { piece, box, row: null };
		const pos = view.posAtCoords({ x: box.left + 1, y: box.top + box.height / 2 }, false);
		return { piece, box, row: view.coordsAtPos(pos, 1) ?? view.coordsAtPos(pos, -1) };
	});
	const placed: Placed[] = reads.map(({ piece, box, row }) => {
		const overhang = box.right - textRight;
		if (overhang > 0.25) piece.style.width = `${Math.max(0, (parseFloat(piece.style.width) || box.width) - overhang)}px`;
		const at: Placed = { piece, top: box.top, height: box.height };
		if (!row) return at;
		// From the written value, not offsetTop: that one is rounded to whole pixels,
		// and on a half pixel the difference never went away.
		const current = parseFloat(piece.style.top) || 0;
		const top = current + ((row.top + row.bottom) / 2 - height / 2 - box.top);
		if (Math.abs(top - current) > 0.25) {
			piece.style.top = `${top}px`;
			at.top = box.top + (top - current);
		}
		if (Math.abs(box.height - height) > 0.25) {
			piece.style.height = `${height}px`;
			at.height = height;
		}
		return at;
	});
	closeSeams(placed, height);
}

/** A piece of a selection and where it stands on screen once corrected. */
interface Placed {
	piece: HTMLElement;
	top: number;
	height: number;
}

function closeSeams(placed: Placed[], height: number): void {
	const pieces = [...placed].sort((a, b) => a.top - b.top);
	for (let i = 1; i < pieces.length; i++) {
		const above = pieces[i - 1];
		const gap = pieces[i].top - (above.top + above.height);
		// Only a seam: a wider gap is between two selections.
		if (gap > 0.25 && gap < height / 2) above.piece.style.height = `${above.height + gap}px`;
	}
}

class LineHighSelection {
	// Its own writes are taken out of the queue, so they never come back as a
	// drawing to correct.
	private observer: MutationObserver = new MutationObserver(() => {
		rowHeightPieces(this.view);
		this.observer.takeRecords();
	});
	private observing = false;

	constructor(private view: EditorView) {
		// The selection layer is made by drawSelection, after this plugin.
		queueMicrotask(() => this.observe());
	}

	update(): void {
		this.observe();
	}

	private observe(): void {
		if (this.observing) return;
		const layer = this.view.dom.querySelector('.cm-selectionLayer');
		if (!layer) return;
		this.observer.observe(layer, { childList: true, subtree: true, attributes: true });
		this.observing = true;
	}

	destroy(): void {
		this.observer.disconnect();
	}
}

export const lineHighSelection = ViewPlugin.fromClass(LineHighSelection);
