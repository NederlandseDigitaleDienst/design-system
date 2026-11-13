/**
 * A rule that sets the text color also passes it on as `--context-content-color`.
 * Text, icons and spinners in the design system read that context, so without it
 * they take the default color instead of the one around them.
 *
 * Not for a color that only follows what is inherited (`inherit`, `currentColor`,
 * a mix with it, or the context itself), which needs nothing passed on, nor for the system colors
 * of forced colors mode.
 */

const COLOR = /(?<![\w(-])color\s*:\s*([^;{}]+)/g;

/** The start of the comment with which a rule says it passes no context on, followed by its reason. */
export const OPT_OUT = '/* No context:';

const PASSES_THROUGH = /^(inherit|initial|unset|revert|revert-layer|transparent)\b|currentColor|^var\(\s*--context-content-color\s*\)/i;
const SYSTEM_COLOR = /^(Canvas|CanvasText|LinkText|VisitedText|ActiveText|ButtonFace|ButtonText|ButtonBorder|Field|FieldText|Highlight|HighlightText|SelectedItem|SelectedItemText|Mark|MarkText|GrayText|AccentColor|AccentColorText)\b/;

/** Comments and `${…}` interpolations blanked out, so offsets still point at the source. */
const blank = (source) =>
	source
		.replace(/\/\*[\s\S]*?\*\//g, (text) => text.replace(/[^\n]/g, ' '))
		.replace(/\$\{[^}]*\}/g, (text) => ' '.repeat(text.length));

/**
 * Each `color` whose own rule does not set the context too. A nested rule (inside `@media`, or `&:hover`) is a rule of its own.
 * @returns {{ line: number, text: string }[]}
 */
export function findContentColorWithoutContext(source) {
	const plain = blank(source);
	const blocks = [];
	const open = [];
	for (let at = 0; at < plain.length; at++) {
		if (plain[at] === '{') open.push(at);
		else if (plain[at] === '}' && open.length > 0) blocks.push({ start: open.pop(), end: at });
	}
	const ownText = (block) => {
		const nested = blocks.filter((other) => other.start > block.start && other.end < block.end);
		let text = plain.slice(block.start + 1, block.end);
		for (const inner of nested) {
			const from = inner.start - block.start - 1;
			text = text.slice(0, from) + ' '.repeat(inner.end - inner.start + 1) + text.slice(from + inner.end - inner.start + 1);
		}
		return text;
	};
	const found = [];
	for (const match of plain.matchAll(COLOR)) {
		const value = match[1].trim();
		if (PASSES_THROUGH.test(value) || SYSTEM_COLOR.test(value)) continue;
		const rule = blocks
			.filter((block) => block.start < match.index && block.end > match.index)
			.sort((a, b) => b.start - a.start)[0];
		if (rule && ownText(rule).includes('--context-content-color')) continue;
		// A rule may say it passes nothing on, with a comment and its reason.
		if (rule && source.slice(rule.start, rule.end).includes(OPT_OUT)) continue;
		const line = plain.slice(0, match.index).split('\n').length;
		found.push({ line, text: source.split('\n')[line - 1].trim() });
	}
	return found;
}
