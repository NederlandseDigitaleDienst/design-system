/**
 * String literals, and the markup in them. A site generator, a server-side app
 * or a script without a framework puts `nldd-*` markup together in strings. A
 * language gives only where its literals stand and where their holes are
 * (`scriptLiterals`, `pythonStrings`); what a literal holds is read the same
 * way for each (`markupIn`). A new language is a scanner here, and no reader.
 *
 * Nothing in this file knows about trees: it gives text an HTML parser can read,
 * at the offsets of the file.
 */

/** A private-use character that stands in the text for an expression, one per character it takes. */
export const HOLE = '\uE000';

/** A filler of `length` characters without spaces that reads as a bound value: `${xxx}`. */
export const boundFiller = (length) => `\${${'x'.repeat(length - 3)}}`;


/** Same length, so positions stay right. */
export const blank = (text) => text.replace(/[^\n]/g, ' ');

/**
 * Where a string in a script ends, from its opening quote. A template literal can
 * span lines, the others cannot.
 */
export function endOfString(source, start) {
	let at = start + 1;
	while (at < source.length && source[at] !== source[start] && (source[start] === '`' || source[at] !== '\n')) {
		at += source[at] === '\\' ? 2 : 1;
	}
	return at;
}

/**
 * Finds every string literal of a script, also inside the holes of a template:
 * `html` says it is an html`` template. A small scanner, so that a story needs
 * no TypeScript parser: it only tells strings, comments and templates apart.
 */
export function scriptLiterals(source) {
	const templates = [];
	const readTemplate = (start, isHtml) => {
		const holes = [];
		let at = start;
		while (at < source.length && source[at] !== '`') {
			if (source[at] === '\\') at += 2;
			else if (source.startsWith('${', at)) {
				const end = readCode(at + 2, true);
				holes.push([at, end + 1]);
				at = end + 1;
			} else at += 1;
		}
		templates.push({ start, end: at, holes, html: isHtml });
		return at;
	};
	function readCode(start, inHole) {
		let depth = 0;
		let at = start;
		while (at < source.length) {
			const char = source[at];
			if (char === "'" || char === '"') {
				const end = endOfString(source, at);
				templates.push({ start: at + 1, end, holes: [], html: false });
				at = end;
			} else if (source.startsWith('//', at)) at = source.indexOf('\n', at) >>> 0;
			else if (source.startsWith('/*', at)) at = source.indexOf('*/', at) >>> 0;
			else if (char === '`') at = readTemplate(at + 1, source.slice(at - 4, at) === 'html');
			else if (char === '{') depth += 1;
			else if (char === '}') {
				if (inHole && depth === 0) return at;
				depth -= 1;
			}
			at += 1;
		}
		return at;
	}
	readCode(0, false);
	return templates;
}

/**
 * Where the string literals of a Python file stand, each with the holes of an
 * f-string or of `.format()`. A small scanner: it only tells strings, comments
 * and brackets apart. A docstring is left out.
 */
export function pythonStrings(source) {
	const strings = [];
	let depth = 0;
	let at = 0;
	const endOfHole = (from) => {
		let nested = 0;
		for (let index = from; index < source.length; index++) {
			const char = source[index];
			if (char === '"' || char === "'") index = endOfString(source, index);
			else if (char === '{' || char === '[' || char === '(') nested += 1;
			else if (char === '}' && nested === 0) return index;
			else if (char === '}' || char === ']' || char === ')') nested -= 1;
		}
		return source.length;
	};
	while (at < source.length) {
		const char = source[at];
		if (char === '#') at = source.indexOf('\n', at) >>> 0;
		else if ('([{'.includes(char)) depth += 1;
		else if (')]}'.includes(char)) depth -= 1;
		else if (char === '"' || char === "'") {
			const prefix = /[a-zA-Z]{0,2}$/.exec(source.slice(Math.max(0, at - 2), at))[0];
			const formatted = /f/i.test(prefix);
			const delimiter = source.startsWith(char.repeat(3), at) ? char.repeat(3) : char;
			const start = at + delimiter.length;
			const holes = [];
			let end = start;
			while (end < source.length && !source.startsWith(delimiter, end)) {
				if (source[end] === '\\') end += 2;
				else if (source[end] === '{' && source[end + 1] === '{') end += 2;
				else if (formatted && source[end] === '{') {
					const close = endOfHole(end + 1);
					holes.push([end, close + 1]);
					end = close + 1;
				} else if (delimiter.length === 1 && source[end] === '\n') break;
				else end += 1;
			}
			const lineStart = source.lastIndexOf('\n', at) + 1;
			const lineEnd = source.indexOf('\n', end + delimiter.length) >>> 0;
			const alone = source.slice(lineStart, at - prefix.length).trim() === '' && /^\s*(#.*)?$/.test(source.slice(end + delimiter.length, lineEnd));
			// Without an `f`, a `{name}` is still a hole once `.format()` fills it.
			const filled = formatted ? holes : [...source.slice(start, end).matchAll(/\{[^{}\n]*\}/g)].map((match) => [start + match.index, start + match.index + match[0].length]);
			// A literal that is a line of its own is a docstring: it names markup and renders none.
			if (!(depth === 0 && alone)) strings.push({ start, end, holes: filled, raw: /r/i.test(prefix) });
			at = end + delimiter.length - 1;
		}
		at += 1;
	}
	return strings;
}

/** What `%` formatting fills in: `%s`, `%(name)s`, `%5.2f`. */
export const PERCENT_FORMAT = /%(\([^)]*\))?[-#0 +]*\d*(\.\d+)?[sdrifgx]/;

const OURS = /<nldd-[a-z]/;

/** What only a regular expression writes: `.*`, `.+`, `[^`, and a class such as `\s` or `\d`. */
const WILDCARD = /\.[*+]|\[\^|\\[sSdDwWbB]/;

/**
 * Whether a literal looks for markup instead of being markup, as a test has.
 * After the name of a tag comes white space, `/` or `>`, so `<nldd-card[^>]*>`
 * and `<nldd-menu-(item|divider)` are no tags. And `<nldd-menu slot="popup".*?</nldd-menu>`
 * reads as markup tag by tag, while its wildcard says what it is.
 */
function isPattern(written, text) {
	return WILDCARD.test(written) || [...text.matchAll(/<nldd-[a-z0-9-]*/g)].some((match) => /[^\s>/]/.test(text[match.index + match[0].length] ?? ' '));
}

/**
 * A literal as the markup in it reads, at the same offsets: each escape becomes
 * as many characters that mean the same to an HTML parser. A quote opens a value
 * right after `=`, and there the space goes before it; anywhere else it closes
 * one or stands in text, and the space goes behind. A newline or a tab is white
 * space either way.
 */
function unescaped(text) {
	return text.replace(/\\(['"nrt]|\r?\n)/g, (match, char, at) => {
		if (char === '"' || char === "'") return /=\s*$/.test(text.slice(0, at)) ? ` ${char}` : `${char} `;
		return char.length === 1 ? '  ' : ` ${char}`;
	});
}

/**
 * The markup one literal holds, as text an HTML parser reads at the offsets of
 * the file. A hole (`{name}`, `${name}`) becomes a filler that reads as a bound
 * value, and a start tag the literal does not finish is blanked: nothing about
 * it is certain here.
 *
 * Every doubt ends in "unknown" and never in a finding: a `{name}` that no
 * `.format()` fills is still read as a hole.
 *
 * @param {string} source
 * @param {{ start: number, end: number, holes: [number, number][], raw?: boolean }} literal
 * @returns {{ text: string, escaped: boolean } | { unread: number } | undefined}
 *   the text, padded up to where the literal starts, and whether it wrote a quote
 *   behind a backslash; or where markup stands that cannot be read, which is a raw
 *   literal with such a quote; or nothing, for a literal without markup of ours
 */
export function markupIn(source, { start, end, holes, raw }) {
	const written = source.slice(start, end);
	if (!OURS.test(written)) return undefined;
	const escaped = /\\['"]/.test(written);
	let text = raw ? written : unescaped(written);
	for (const [from, to] of holes) {
		// Right after a name, as in `<nldd-x{attrs}>`, the hole is not part of that name.
		const afterName = /[\w-]/.test(text[from - start - 1] ?? '');
		const room = to - from - (afterName ? 1 : 0);
		const filler = (afterName ? ' ' : '') + (room >= 3 ? boundFiller(room) : HOLE.repeat(room));
		text = text.slice(0, from - start) + filler + text.slice(to - start);
	}
	text = text.replace(/<[a-zA-Z][^<>]*$/, blank);
	if (isPattern(written, text)) return undefined;
	// In a raw string the backslash stays in the text, so the quote behind it is not markup's.
	if (escaped && raw) return { unread: start + text.search(OURS) };
	return { text: ' '.repeat(start) + text, escaped };
}
