import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { alignBoxes, changeOf, changedElements, comparePages, differingPixels, looseBlocks, sameLook } from './compare-core.js';

const WHITE = [255, 255, 255];
const BLUE = [20, 60, 160];
const GRAY = [150, 150, 150];
const INK = [30, 30, 30];

/** A blank page, and a way to paint a rectangle on it. */
function page(width, height, color = WHITE) {
	const data = new Uint8ClampedArray(width * height * 4);
	const image = { width, height, data };
	paint(image, 0, 0, width, height, color);
	return image;
}

function paint(image, x, y, w, h, [r, g, b]) {
	for (let row = y; row < y + h; row++) {
		for (let column = x; column < x + w; column++) {
			const i = (row * image.width + column) * 4;
			image.data.set([r, g, b, 255], i);
		}
	}
	return image;
}

/** Lines of text: a dark bar every `pitch` rows, starting at `top`. */
function text(image, x, top, w, lines, pitch = 12) {
	for (let line = 0; line < lines; line++) paint(image, x, top + line * pitch, w - line * 7, 4, INK);
	return image;
}

const box = (tag, x, y, w, h, depth = 1) => ({ tag, depth, x, y, w, h });

describe('alignBoxes', () => {
	it('pairs what both pages have, in order', () => {
		const before = [box('nldd-page', 0, 0, 100, 100, 0), box('nldd-title', 0, 0, 100, 20), box('nldd-button', 0, 30, 40, 20)];
		const after = [box('nldd-page', 0, 0, 100, 100, 0), box('nldd-text', 0, 0, 100, 20), box('nldd-button', 0, 30, 40, 20)];
		const { pairs, gone, added } = alignBoxes(before, after);
		assert.deepEqual(pairs.map(([one]) => one.tag), ['nldd-page', 'nldd-button']);
		assert.deepEqual(gone.map((one) => one.tag), ['nldd-title']);
		assert.deepEqual(added.map((one) => one.tag), ['nldd-text']);
	});

	it('takes an element that is wrapped in a new one for the same element', () => {
		const before = [box('nldd-badge', 0, 0, 40, 16)];
		const after = [box('nldd-container', 0, 0, 40, 16), box('nldd-badge', 0, 0, 40, 16, 2)];
		const { pairs, added } = alignBoxes(before, after);
		assert.equal(pairs.length, 1);
		assert.deepEqual(added.map((one) => one.tag), ['nldd-container']);
	});
});

describe('changeOf', () => {
	it('sees nothing in two equal elements', () => {
		const a = paint(page(200, 100), 10, 10, 80, 30, BLUE);
		const b = paint(page(200, 100), 10, 10, 80, 30, BLUE);
		assert.equal(changeOf(a, box('nldd-button', 10, 10, 80, 30), b, box('nldd-button', 10, 10, 80, 30)), '');
	});

	it('sees an element that kept its size and changed color', () => {
		const a = paint(page(200, 100), 10, 10, 80, 30, BLUE);
		const b = paint(page(200, 100), 10, 10, 80, 30, GRAY);
		assert.equal(changeOf(a, box('nldd-button', 10, 10, 80, 30), b, box('nldd-button', 10, 10, 80, 30)), 'look');
	});

	it('sees nothing in an element that only moved down the page', () => {
		const a = paint(page(200, 200), 10, 10, 80, 30, BLUE);
		const b = paint(page(200, 200), 10, 110, 80, 30, BLUE);
		assert.equal(changeOf(a, box('nldd-button', 10, 10, 80, 30), b, box('nldd-button', 10, 110, 80, 30)), '');
	});

	it('sees nothing when lines of text each sit a pixel or two lower', () => {
		const a = text(page(300, 120), 10, 10, 200, 6);
		// The same lines with a wider gap between them: each is a bit further down than the one before.
		const b = page(300, 120);
		for (let line = 0; line < 6; line++) paint(b, 10, 10 + line * 12 + Math.min(line, 3), 200 - line * 7, 4, INK);
		assert.equal(changeOf(a, box('nldd-rich-text', 0, 0, 300, 90), b, box('nldd-rich-text', 0, 0, 300, 90)), '');
	});

	it('sees text that wraps differently as a different look', () => {
		const a = text(page(300, 120), 10, 10, 200, 2);
		const b = text(page(300, 120), 10, 10, 120, 4);
		assert.equal(changeOf(a, box('nldd-text', 0, 0, 300, 80), b, box('nldd-text', 0, 0, 300, 80)), 'look');
	});

	it('sees an element that grew', () => {
		const a = paint(page(200, 100), 10, 10, 60, 30, BLUE);
		const b = paint(page(200, 100), 10, 10, 64, 34, BLUE);
		assert.equal(changeOf(a, box('nldd-button', 10, 10, 60, 30), b, box('nldd-button', 10, 10, 64, 34)), 'size');
	});

	it('sees nothing in a box that shrank around the same drawing', () => {
		// A badge whose box spanned the row and now only holds the pill.
		const a = paint(page(300, 60), 10, 10, 70, 16, BLUE);
		const b = paint(page(300, 60), 10, 10, 70, 16, BLUE);
		assert.equal(changeOf(a, box('nldd-badge', 10, 10, 280, 20), b, box('nldd-badge', 10, 10, 70, 16)), '');
	});

	it('sees an element that is no longer drawn, and one that is new', () => {
		const a = paint(page(200, 100), 10, 10, 60, 30, BLUE);
		const b = page(200, 100);
		assert.equal(changeOf(a, box('nldd-badge', 10, 10, 60, 30), b, box('nldd-badge', 10, 10, 0, 0)), 'gone');
		assert.equal(changeOf(b, box('nldd-badge', 10, 10, 0, 0), a, box('nldd-badge', 10, 10, 60, 30)), 'new');
	});
});

describe('sameLook', () => {
	it('holds for boxes too small to tell', () => {
		const a = page(10, 10);
		assert.equal(sameLook(a, box('nldd-icon', 0, 0, 2, 2), a, box('nldd-icon', 0, 0, 2, 2)), true);
	});
});

describe('changedElements', () => {
	it('marks the innermost element of a change, not what holds it', () => {
		const a = paint(page(300, 200), 20, 20, 80, 30, BLUE);
		const b = paint(page(300, 200), 20, 20, 80, 30, GRAY);
		const boxes = [box('nldd-page', 0, 0, 300, 200, 0), box('nldd-card', 10, 10, 200, 100, 1), box('nldd-button', 20, 20, 80, 30, 2)];
		const { marks } = changedElements(a, boxes, b, boxes);
		assert.deepEqual(marks.map((mark) => `${mark.tag} ${mark.kind}`), ['nldd-button look']);
	});

	it('takes an element that made way for one that shows the same for no change', () => {
		const a = text(page(300, 100), 10, 10, 120, 1);
		const b = text(page(300, 100), 10, 10, 120, 1);
		const { marks, replaced } = changedElements(a, [box('nldd-title', 10, 5, 200, 20)], b, [box('nldd-text', 10, 5, 200, 20)]);
		assert.deepEqual(marks, []);
		assert.equal(replaced, 1);
	});

	it('marks an element that went, and one that came in another place', () => {
		const a = paint(page(300, 200), 10, 10, 100, 30, BLUE);
		const b = paint(page(300, 200), 10, 120, 100, 30, GRAY);
		const { marks } = changedElements(a, [box('nldd-banner', 10, 10, 100, 30)], b, [box('nldd-box', 10, 120, 100, 30)]);
		assert.deepEqual(marks.map((mark) => `${mark.tag} ${mark.kind}`).sort(), ['nldd-banner gone', 'nldd-box new']);
	});
});

describe('looseBlocks', () => {
	it('finds pixels that differ outside everything that is explained', () => {
		const a = page(200, 200);
		const b = paint(page(200, 200), 100, 100, 10, 10, INK);
		assert.deepEqual(looseBlocks(a, b, []), [{ x: 96, y: 96, w: 16, h: 16 }]);
	});

	it('leaves out what a box that is explained accounts for', () => {
		const a = page(200, 200);
		const b = paint(page(200, 200), 100, 100, 10, 10, INK);
		assert.deepEqual(looseBlocks(a, b, [box('nldd-icon', 96, 96, 20, 20)]), []);
	});

	it('does not look on pages of another size, where everything has moved', () => {
		assert.deepEqual(looseBlocks(page(200, 200), paint(page(200, 240), 0, 0, 50, 50, INK), []), []);
	});
});

describe('comparePages', () => {
	it('calls two equal screenshots identical', () => {
		const a = paint(page(100, 100), 10, 10, 30, 30, BLUE);
		const b = paint(page(100, 100), 10, 10, 30, 30, BLUE);
		assert.equal(differingPixels(a, b), 0);
		assert.deepEqual(comparePages(a, [box('nldd-box', 10, 10, 30, 30)], b, [box('nldd-box', 10, 10, 30, 30)]), { identical: true, marks: [], replaced: 0 });
	});

	it('does not take an element that was pushed down for other pixels', () => {
		// The banner grew, and the box under it moved. Both screenshots are as tall as the window.
		const a = paint(paint(page(300, 400), 10, 10, 200, 60, BLUE), 10, 70, 200, 60, GRAY);
		const b = paint(paint(page(300, 400), 10, 10, 200, 120, BLUE), 10, 130, 200, 60, GRAY);
		const { marks } = comparePages(a, [box('nldd-banner', 10, 10, 200, 60), box('nldd-box', 10, 70, 200, 60)], b, [box('nldd-banner', 10, 10, 200, 120), box('nldd-box', 10, 130, 200, 60)]);
		assert.deepEqual(marks.map((mark) => `${mark.tag} ${mark.kind}`), ['nldd-banner size']);
	});

	it('reports a block of pixels when nothing else explains a difference', () => {
		const a = page(100, 100);
		const b = paint(page(100, 100), 40, 40, 8, 8, INK);
		const { identical, marks } = comparePages(a, [], b, []);
		assert.equal(identical, false);
		assert.deepEqual(marks.map((mark) => mark.kind), ['pixels']);
	});
});
