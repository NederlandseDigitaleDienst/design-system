import { ViewPlugin, type EditorView } from '@codemirror/view';

/* The selection as tall as the line, like the tokens (code, mention,
 * annotation) that fill it. CodeMirror measures each piece of a selection on
 * what it starts on: the letters (21.5px at the body size), a token (its own
 * height), and for the first and last row of a selection over several lines
 * something in between. So after every drawing, each piece of one row is set
 * to the line height, centered on its row. A piece over several whole lines,
 * or one taller already (a heading), is left as it is. */

function rowHeightPieces(view: EditorView): void {
	const layer = view.dom.querySelector('.cm-selectionLayer');
	if (!layer) return;
	const height = view.defaultLineHeight;
	for (const piece of layer.querySelectorAll<HTMLElement>('.cm-selectionBackground')) {
		const box = piece.getBoundingClientRect();
		if (box.height >= height * 1.25) continue;
		const pos = view.posAtCoords({ x: box.left + 1, y: box.top + box.height / 2 }, false);
		const row = view.coordsAtPos(pos, 1) ?? view.coordsAtPos(pos, -1);
		if (!row) continue;
		// From the written value, not offsetTop: that one is rounded to whole pixels,
		// and on a half pixel the difference never went away.
		const current = parseFloat(piece.style.top) || 0;
		const top = current + ((row.top + row.bottom) / 2 - height / 2 - box.top);
		if (Math.abs(top - current) > 0.25) piece.style.top = `${top}px`;
		if (Math.abs(box.height - height) > 0.25) piece.style.height = `${height}px`;
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
