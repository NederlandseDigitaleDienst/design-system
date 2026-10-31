/**
 * Applies what `--fix` may do without anyone looking: an attribute that only got
 * another name. A fix works on the text of the file, so the rest of it stays
 * exactly as it was.
 */

const toCamelCase = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/** The start tag from `start`, with strings and `{ }` blanked: a value can hold anything. */
function maskedTag(source, start) {
	let masked = '';
	let quote = '';
	let depth = 0;
	for (let at = start; at < source.length; at++) {
		const char = source[at];
		if (quote) {
			if (char === quote) quote = '';
			masked += ' ';
		} else if (char === '"' || char === "'" || char === '`') {
			quote = char;
			masked += ' ';
		} else if (char === '{') {
			depth += 1;
			masked += ' ';
		} else if (char === '}') {
			depth -= 1;
			masked += ' ';
		} else if (depth > 0) {
			masked += ' ';
		} else if (char === '>') {
			return masked;
		} else {
			masked += char;
		}
	}
	return masked;
}

/** Vue, Alpine, Lit and Angular write a name with a prefix, and JSX bare. */
function attributePattern(name) {
	const names = [...new Set([name, toCamelCase(name)])].join('|');
	return new RegExp(`(?<=\\s)(:|v-bind:|x-bind:|\\.|\\?|\\[attr\\.|\\[\\(?)?(${names})(?=[\\s=/\\])]|$)`);
}

/** An edit is `{ from, to, text }` in the source, or nothing when it is not certain. */
function renameEdit(source, offset, from, to) {
	const masked = maskedTag(source, offset);
	const match = attributePattern(from).exec(masked);
	if (!match || attributePattern(to).test(masked)) return undefined;
	const [, prefix = '', written] = match;
	const isProperty = prefix === '.' || (prefix.startsWith('[') && prefix !== '[attr.');
	const start = offset + match.index + prefix.length;
	return { from: start, to: start + written.length, text: isProperty || written !== from ? toCamelCase(to) : to };
}

/** @returns {{ source: string, fixed: number }} */
export function applyFixes(source, findings) {
	const edits = findings.flatMap(({ offset, rename, rule }) =>
		Object.entries(rename ?? {}).flatMap(([from, to]) => {
			const edit = renameEdit(source, offset, from, to);
			return edit ? [{ ...edit, rule }] : [];
		}),
	);
	const seen = new Set();
	const unique = edits.filter(({ from }) => !seen.has(from) && seen.add(from));
	let fixed = source;
	for (const { from, to, text } of unique.sort((a, b) => b.from - a.from)) {
		fixed = fixed.slice(0, from) + text + fixed.slice(to);
	}
	return { source: fixed, fixed: unique.length };
}
