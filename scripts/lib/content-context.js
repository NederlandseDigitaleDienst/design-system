/**
 * A rule that sets the text color from a component's content color also passes it
 * on as `--context-content-color`. Text in the system enforces its color and reads
 * that context, so without it an `nldd-text` or a spinner inside takes the default
 * color instead of the one around it.
 */

const CONTENT_COLOR = /(?<![\w-])color\s*:\s*var\(\s*(--_[\w-]*content-color)\s*\)/g;

/** Comments and `${…}` interpolations blanked out, so offsets still point at the source. */
const blank = (source) =>
	source
		.replace(/\/\*[\s\S]*?\*\//g, (text) => text.replace(/[^\n]/g, ' '))
		.replace(/\$\{[^}]*\}/g, (text) => ' '.repeat(text.length));

/**
 * Each `color: var(--_…-content-color)` whose own rule does not set the context
 * too. A nested rule (inside `@media`, or `&:hover`) is a rule of its own.
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
	for (const match of plain.matchAll(CONTENT_COLOR)) {
		const rule = blocks
			.filter((block) => block.start < match.index && block.end > match.index)
			.sort((a, b) => b.start - a.start)[0];
		if (rule && ownText(rule).includes('--context-content-color')) continue;
		const line = plain.slice(0, match.index).split('\n').length;
		found.push({ line, text: source.split('\n')[line - 1].trim() });
	}
	return found;
}
