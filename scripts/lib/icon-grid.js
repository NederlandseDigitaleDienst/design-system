/**
 * The icon grid: every icon is drawn on a 96×96 canvas. Regular icons used to
 * be 24×24 and light icons 32×32; on 96 both share one grid, with whole units
 * where the old grids had half and quarter pixels.
 */
import { parsePathData, stringifyPathData } from '../../node_modules/svgo/lib/path.js';

export const GRID = 96;

/** The old canvases this script knows how to bring to the grid. */
const OLD_GRIDS = [24, 32];

const VIEWBOX = /viewBox="([^"]*)"/;

/** Returns the size of a square viewBox starting at 0 0, or null for any other viewBox. */
export function viewBoxSize(svg) {
	const match = svg.match(VIEWBOX);
	if (!match) return null;
	const [x, y, w, h] = match[1].trim().split(/[\s,]+/).map(Number);
	if (x !== 0 || y !== 0 || w !== h || !Number.isFinite(w)) return null;
	return w;
}

/** Whether a file at this viewBox size can be brought to the grid. */
export function canScale(size) {
	return size === GRID || OLD_GRIDS.includes(size);
}

// Float noise only: 0.28 * 4 gives 1.1200000000000001.
const clean = (n) => Math.round(n * 1e6) / 1e6;

/**
 * Scales path data by a factor. An arc's radii and end point scale, its
 * rotation and flags do not.
 */
export function scalePathData(d, factor) {
	const data = parsePathData(d).map(({ command, args }) => {
		const scaled = /a/i.test(command)
			? args.map((n, i) => (i === 2 || i === 3 || i === 4 ? n : clean(n * factor)))
			: args.map((n) => clean(n * factor));
		return { command, args: scaled };
	});
	return stringifyPathData({ pathData: data });
}

/**
 * Brings an optimized icon (paths, perhaps in a group) to the grid
 * by rewriting its numbers in place, so the file keeps its formatting. Exact:
 * a two-decimal value times 3 or 4 still has two decimals, so nothing rounds.
 */
export function scaleIcon(svg) {
	const size = viewBoxSize(svg);
	if (size === GRID) return svg;
	if (!canScale(size)) throw new Error(`viewBox is not 0 0 ${OLD_GRIDS.join(', 0 0 ')} or 0 0 ${GRID}`);
	const factor = GRID / size;
	if (/<(?!\/|svg\b|path\b|g\b)[a-z]/i.test(svg)) throw new Error('has elements other than <path> and <g>');
	if (/\stransform=/.test(svg)) throw new Error('has a transform');
	return svg
		.replace(VIEWBOX, `viewBox="0 0 ${GRID} ${GRID}"`)
		.replace(/\sd="([^"]*)"/g, (_, d) => ` d="${scalePathData(d, factor)}"`);
}
