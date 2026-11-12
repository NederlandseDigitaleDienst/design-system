/**
 * A rule that sets the text color from a component's content color also passes it
 * on as `--context-content-color`. Text in the system enforces its color and reads
 * that context, so without it an `nldd-text` or a spinner inside takes the default
 * color instead of the one around it.
 */

const CONTENT_COLOR = /^\s*color:\s*var\((--_[\w-]*content-color)\)/;

/**
 * Each `color: var(--_…-content-color)` whose rule does not set the context too.
 * A rule is read from its opening brace to its closing one, without nested rules.
 * @returns {{ line: number, text: string }[]}
 */
export function findContentColorWithoutContext(source) {
	const lines = source.split('\n');
	const found = [];
	lines.forEach((text, index) => {
		if (!CONTENT_COLOR.test(text)) return;
		let start = index;
		while (start > 0 && !lines[start].includes('{')) start -= 1;
		let end = index;
		while (end < lines.length - 1 && !lines[end].includes('}')) end += 1;
		const rule = lines.slice(start, end + 1).join('\n');
		if (!rule.includes('--context-content-color')) found.push({ line: index + 1, text: text.trim() });
	});
	return found;
}
