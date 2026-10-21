/**
 * Finds a px length in an @container or @media condition, or in a
 * matchMedia() string. With page zoom, Safari measures a container that takes
 * its width from the layout in zoomed pixels, so a px condition keeps the wide
 * layout; rem scales along.
 *
 * A condition is read on one line, up to its opening brace, and the match
 * stops at a `;`, a `*` or a backtick, so a mention in a comment does not
 * count. A condition spread over more lines, one with a calc() that
 * multiplies, and a value built at runtime (`${below}`) are not caught.
 */

const QUERY_PX = /@(container|media)\b[^{\n;*`]*?\b\d+(\.\d+)?px\b[^{\n;*`]*\{/g;
const MATCH_MEDIA_PX = /matchMedia\(\s*['"`][^'"`]*?\b\d+(\.\d+)?px\b[^'"`]*['"`]\s*\)/g;

/**
 * @param {string} source - The text of a stylesheet or a script.
 * @returns {{ line: number, text: string }[]} Each match, with its 1-based line.
 */
export function findQueryPx(source) {
	return [...source.matchAll(QUERY_PX), ...source.matchAll(MATCH_MEDIA_PX)]
		.sort((a, b) => a.index - b.index)
		.map((match) => ({
			line: source.slice(0, match.index).split('\n').length,
			text: match[0].replace(/\s+/g, ' ').trim(),
		}));
}
