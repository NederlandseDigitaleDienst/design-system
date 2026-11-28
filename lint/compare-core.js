/**
 * What changed between two screenshots of the same page, per design system
 * element. The logic of `nldd compare`, without a browser: it takes pixels and
 * boxes, and returns what to mark.
 *
 * This file runs in two places. Node imports it for the tests. The command
 * hands its text to a page, where a canvas has the pixels. So it imports
 * nothing and touches no DOM.
 *
 * An image is `{ width, height, data }` with four bytes per pixel, as a canvas
 * gives it. A box is `{ tag, depth, x, y, w, h }`: an element in document
 * order, with how deep it sits and where it is on the page.
 */

/** How far a color channel may differ before two pixels count as different: font smoothing moves it a little. */
export const TOLERANCE = 24;

/** How many rows up or down a row of pixels may find its match. */
export const ROW_SHIFTS = [0, 1, -1, 2, -2, 3, -3, 4, -4];

export const isDrawn = (box) => box.w > 0 && box.h > 0;

/** Whether the pixel at byte `i` of one image differs from the one at byte `j` of the other. */
export function pixelsDiffer(a, i, b, j) {
	return Math.abs(a.data[i] - b.data[j]) > TOLERANCE || Math.abs(a.data[i + 1] - b.data[j + 1]) > TOLERANCE || Math.abs(a.data[i + 2] - b.data[j + 2]) > TOLERANCE;
}

/** How many pixels differ between two images of the same size, or -1 when the sizes differ. */
export function differingPixels(a, b) {
	if (a.width !== b.width || a.height !== b.height) return -1;
	let count = 0;
	for (let i = 0; i < a.data.length; i += 4) if (pixelsDiffer(a, i, b, i)) count++;
	return count;
}

/**
 * Lines up the elements of two pages on their tags: the longest run they have
 * in common, in order. A fix may replace an element or wrap one, so the two
 * lists need not be equal. What does not line up is gone or new.
 */
export function alignBoxes(before, after) {
	const table = Array.from({ length: before.length + 1 }, () => new Uint16Array(after.length + 1));
	for (let i = before.length - 1; i >= 0; i--) {
		for (let j = after.length - 1; j >= 0; j--) {
			table[i][j] = before[i].tag === after[j].tag ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
		}
	}
	const pairs = [];
	const gone = [];
	const added = [];
	for (let i = 0, j = 0; i < before.length || j < after.length;) {
		if (i < before.length && j < after.length && before[i].tag === after[j].tag) pairs.push([before[i++], after[j++]]);
		else if (j >= after.length || (i < before.length && table[i + 1][j] >= table[i][j + 1])) gone.push(before[i++]);
		else added.push(after[j++]);
	}
	return { pairs, gone, added };
}

/**
 * Whether two boxes show the same thing over the part they share.
 *
 * Lines of text inside an element may each sit a pixel or two higher or lower
 * after an upgrade, and not all by the same amount. That is not a different
 * look. So every row of pixels looks for its match a few rows up or down. A
 * color that changed has no match at any row.
 */
export function sameLook(a, box, b, other) {
	const w = Math.min(box.w, other.w, a.width - box.x, b.width - other.x);
	const h = Math.min(box.h, other.h, a.height - box.y, b.height - other.y);
	if (w <= 2 || h <= 4 || box.x < 0 || other.x < 0 || box.y < 0 || other.y < 0) return true;
	const rowLimit = Math.max(3, w * 0.015);
	let unmatched = 0;
	for (let y = 2; y < h - 2; y++) {
		let found = false;
		for (const shift of ROW_SHIFTS) {
			const row = y + shift;
			if (row < 0 || row >= h) continue;
			let count = 0;
			let i = ((box.y + y) * a.width + box.x + 1) * 4;
			let j = ((other.y + row) * b.width + other.x + 1) * 4;
			for (let x = 1; x < w - 1 && count <= rowLimit; x++, i += 4, j += 4) if (pixelsDiffer(a, i, b, j)) count++;
			if (count <= rowLimit) {
				found = true;
				break;
			}
		}
		if (!found) unmatched++;
	}
	return unmatched <= Math.max(3, h * 0.04);
}

/**
 * Whether the part of a box beyond `w` by `h` shows nothing: it has the color
 * of what lies just outside the box. Then a box that only lost that part shows
 * the same thing as before, such as a badge whose box no longer spans its row.
 * A button that grew is drawn in that part, and is not empty there.
 */
export function emptyBeyond(image, box, w, h) {
	const right = Math.min(box.x + box.w, image.width);
	const bottom = Math.min(box.y + box.h, image.height);
	// The surroundings: the first place just outside the box that is on the page.
	const around = [
		[box.x + box.w + 2, box.y + Math.floor(box.h / 2)],
		[box.x + Math.floor(box.w / 2), box.y + box.h + 2],
		[box.x - 3, box.y + Math.floor(box.h / 2)],
		[box.x + Math.floor(box.w / 2), box.y - 3],
	].find(([x, y]) => x >= 0 && y >= 0 && x < image.width && y < image.height);
	const empty = (x0, y0, x1, y1) => {
		if (x1 <= x0 || y1 <= y0) return true;
		const reference = around ? (around[1] * image.width + around[0]) * 4 : (y0 * image.width + x0) * 4;
		for (let y = y0; y < y1; y++) {
			for (let x = x0; x < x1; x++) if (pixelsDiffer(image, (y * image.width + x) * 4, image, reference)) return false;
		}
		return true;
	};
	// A few pixels in, past the soft edge of what is drawn.
	return empty(box.x + w + 3, box.y, right, bottom) && empty(box.x, box.y + h + 3, right, bottom);
}

/** What happened to one element that is on both pages: '' for nothing to see. */
export function changeOf(a, box, b, other) {
	if (!isDrawn(box) && !isDrawn(other)) return '';
	if (!isDrawn(other)) return 'gone';
	if (!isDrawn(box)) return 'new';
	if (Math.abs(box.w - other.w) > 1 || Math.abs(box.h - other.h) > 1) {
		const w = Math.min(box.w, other.w);
		const h = Math.min(box.h, other.h);
		return sameLook(a, box, b, other) && emptyBeyond(a, box, w, h) && emptyBeyond(b, other, w, h) ? '' : 'size';
	}
	return sameLook(a, box, b, other) ? '' : 'look';
}

/**
 * The elements to mark on a pair of screenshots.
 *
 * Of nested changes only the innermost is marked: that is where the change
 * starts, and its ancestors changed because of it. An element that made way
 * for another that shows the same thing in the same place, such as nldd-title
 * for nldd-text, is no visible change and counts as replaced.
 *
 * @returns {{ marks: { tag: string, kind: 'size' | 'look' | 'gone' | 'new', before: object, after: object }[], replaced: number, moved: object[] }}
 *   where `moved` holds the old and the new box of each element that only changed place
 */
export function changedElements(a, before, b, after) {
	const NONE = { x: 0, y: 0, w: 0, h: 0 };
	const { pairs, gone, added } = alignBoxes(before, after);
	const drawnGone = gone.filter(isDrawn);
	const taken = new Set();
	const marks = [];
	let replaced = 0;
	for (const box of drawnGone) {
		const twin = added.find((other) =>
			isDrawn(other) && !taken.has(other)
			&& Math.abs(other.w - box.w) <= 2 && Math.abs(other.h - box.h) <= 2 && Math.abs(other.x - box.x) <= 2
			&& sameLook(a, box, b, other));
		if (twin) {
			taken.add(twin);
			replaced++;
		} else {
			marks.push({ tag: box.tag, kind: 'gone', before: box, after: NONE });
		}
	}
	for (const box of added) if (isDrawn(box) && !taken.has(box)) marks.push({ tag: box.tag, kind: 'new', before: NONE, after: box });

	const kinds = pairs.map(([box, other]) => changeOf(a, box, b, other));
	const moved = pairs
		.filter(([box, other], index) => !kinds[index] && isDrawn(box) && (box.x !== other.x || box.y !== other.y))
		.flatMap((pair) => pair);
	for (let index = 0; index < kinds.length; index++) {
		if (!kinds[index]) continue;
		let inner = false;
		for (let next = index + 1; next < kinds.length && pairs[next][0].depth > pairs[index][0].depth; next++) {
			if (kinds[next]) {
				inner = true;
				break;
			}
		}
		if (!inner) marks.push({ tag: pairs[index][0].tag, kind: kinds[index], before: pairs[index][0], after: pairs[index][1] });
	}
	return { marks, replaced, moved };
}

/**
 * The differing pixels that nothing accounts for, grouped into blocks. Only
 * on pages of equal size, where a pixel is at the same place in both: on a
 * page that grew, everything below the change has moved.
 * @param {object[]} explained - the boxes of what is marked already, and of what only moved
 * @returns {{ x: number, y: number, w: number, h: number }[]}
 */
export function looseBlocks(a, b, explained, cell = 16) {
	if (a.width !== b.width || a.height !== b.height) return [];
	const columns = Math.ceil(a.width / cell);
	const rows = Math.ceil(a.height / cell);
	const cells = new Uint8Array(columns * rows);
	const boxes = explained.filter(isDrawn);
	const covered = (x, y) => boxes.some((box) => x >= box.x - 2 && x <= box.x + box.w + 2 && y >= box.y - 2 && y <= box.y + box.h + 2);
	for (let y = 0; y < a.height; y++) {
		for (let x = 0; x < a.width; x++) {
			const i = (y * a.width + x) * 4;
			if (pixelsDiffer(a, i, b, i) && !covered(x, y)) cells[Math.floor(y / cell) * columns + Math.floor(x / cell)] = 1;
		}
	}
	const blocks = [];
	for (let start = 0; start < cells.length; start++) {
		if (cells[start] !== 1) continue;
		let minX = columns;
		let maxX = 0;
		let minY = rows;
		let maxY = 0;
		const queue = [start];
		cells[start] = 2;
		while (queue.length > 0) {
			const at = queue.pop();
			const cx = at % columns;
			const cy = Math.floor(at / columns);
			minX = Math.min(minX, cx);
			maxX = Math.max(maxX, cx);
			minY = Math.min(minY, cy);
			maxY = Math.max(maxY, cy);
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					const nx = cx + dx;
					const ny = cy + dy;
					if (nx < 0 || ny < 0 || nx >= columns || ny >= rows || cells[ny * columns + nx] !== 1) continue;
					cells[ny * columns + nx] = 2;
					queue.push(ny * columns + nx);
				}
			}
		}
		blocks.push({ x: minX * cell, y: minY * cell, w: (maxX - minX + 1) * cell, h: (maxY - minY + 1) * cell });
	}
	return blocks;
}

/**
 * Everything about one pair of screenshots.
 * @returns {{ identical: boolean, marks: object[], replaced: number }} where a
 *   mark of kind 'pixels' is a block of differing pixels outside every element
 */
export function comparePages(a, before, b, after) {
	const differing = differingPixels(a, b);
	const { marks, replaced, moved } = changedElements(a, before, b, after);
	// An element that only moved differs from what stood there before, at its old place and at its new one.
	const explained = [...marks.flatMap((mark) => [mark.before, mark.after]), ...moved];
	const loose = differing > 0 ? looseBlocks(a, b, explained).map((block) => ({ tag: '', kind: 'pixels', before: block, after: block })) : [];
	return { identical: differing === 0, marks: [...marks, ...loose], replaced };
}
