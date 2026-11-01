/**
 * Applies what `--fix` may do without anyone looking. A rule says what changes, in
 * its `fix`; this file knows how that is written in each framework. A fix works on
 * the text of the file, so the rest of it stays exactly as it was.
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

/** Where the attribute stands in the start tag at `offset`, if it does. */
function findAttribute(source, offset, name) {
	const masked = maskedTag(source, offset);
	// A comment in a tag can hold anything, and a line comment takes what follows it.
	if (/\/[*/]/.test(masked)) return undefined;
	const match = attributePattern(name).exec(masked);
	if (!match) return undefined;
	const [, prefix = '', written] = match;
	const start = offset + match.index + prefix.length;
	return { prefix, written, start, end: start + written.length };
}

function renameEdits(source, offset, from, to) {
	const found = findAttribute(source, offset, from);
	if (!found || findAttribute(source, offset, to)) return [];
	const { prefix, written, start, end } = found;
	const isProperty = prefix === '.' || (prefix.startsWith('[') && prefix !== '[attr.');
	return [{ from: start, to: end, text: isProperty || written !== from ? toCamelCase(to) : to }];
}

/** Only a value written out in the markup: a bound one can hold anything. */
function valueEdits(source, offset, name, values) {
	const found = findAttribute(source, offset, name);
	if (!found || found.prefix) return [];
	const opening = /^\s*=\s*(["']?)/.exec(source.slice(found.end));
	if (!opening) return [];
	const at = found.end + opening[0].length;
	return Object.entries(values).flatMap(([from, to]) => {
		const after = source[at + from.length];
		const whole = opening[1] ? after === opening[1] : /[\s/>]/.test(after ?? ' ');
		return source.startsWith(from, at) && whole ? [{ from: at, to: at + from.length, text: to }] : [];
	});
}

/** The end of an attribute's value, or undefined when it is not closed. */
function endOfValue(source, name) {
	const closers = /^[\])]*/.exec(source.slice(name))[0].length;
	const equals = /^\s*=\s*/.exec(source.slice(name + closers));
	if (!equals) return name + closers;
	const start = name + closers + equals[0].length;
	const first = source[start];
	if (first === '"' || first === "'") {
		const closing = source.indexOf(first, start + 1);
		return closing === -1 ? undefined : closing + 1;
	}
	// A bare value ends at a space, but `${a && b}` and `{a && b}` hold spaces of their own.
	let depth = 0;
	let quote = '';
	for (let at = start; at < source.length; at++) {
		const char = source[at];
		if (quote) {
			if (char === '\\') at += 1;
			else if (char === quote) quote = '';
		} else if (depth > 0 && /["'`]/.test(char)) quote = char;
		else if (char === '{') depth += 1;
		else if (char === '}') depth -= 1;
		else if (depth === 0 && (/[\s>]/.test(char) || source.startsWith('/>', at))) return at;
	}
	return undefined;
}

function removeEdits(source, offset, name) {
	const found = findAttribute(source, offset, name);
	const end = found && endOfValue(source, found.end);
	if (end === undefined) return [];
	let from = found.start - found.prefix.length;
	while (/\s/.test(source[from - 1])) from -= 1;
	return [{ from, to: end, text: '' }];
}

/**
 * The parser says where an element ends: a comment or a string that looks like its
 * closing tag does not count. Without a closing tag of its own it stays as it is.
 */
function tagEdits(source, offset, endOffset, name, to) {
	// An element the file never closes ends past the last character.
	if (endOffset === undefined || endOffset >= source.length || !source.startsWith(`<${name}`, offset)) return [];
	const open = { from: offset + 1, to: offset + 1 + name.length, text: to };
	const startTag = maskedTag(source, offset);
	if (startTag.trimEnd().endsWith('/') && offset + startTag.length === endOffset) return [open];
	const closing = source.lastIndexOf('</', endOffset);
	if (closing <= offset || !new RegExp(`^</${name}\\s*>$`).test(source.slice(closing, endOffset + 1))) return [];
	return [open, { from: closing + 2, to: closing + 2 + name.length, text: to, closing: true }];
}

/** An edit is `{ from, to, text }` in the source. What is not certain makes none. */
function editsOf(source, { fix, offset, endOffset, tag }) {
	return [
		...Object.entries(fix.rename ?? {}).flatMap(([from, to]) => renameEdits(source, offset, from, to)),
		...Object.entries(fix.value ?? {}).flatMap(([name, values]) => valueEdits(source, offset, name, values)),
		...(fix.remove ?? []).flatMap((name) => removeEdits(source, offset, name)),
		...(fix.tag ? tagEdits(source, offset, endOffset, tag, fix.tag) : []),
	];
}

/** False when a finding has a fix that does not apply here, such as with both names present. */
export const canFix = (source, finding) => editsOf(source, finding).length > 0;

const toClass = (tag) => `NLDD${toCamelCase(tag.replace(/^nldd-/, '-'))}`;
const entryPoint = (tag) => `@nldd/design-system/${tag.replace(/^nldd-/, '')}`;
const translationKey = (tag) => `components.${tag.replace(/^nldd-/, '')}`;

const escaped = (name) => name.replace(/[/@.-]/g, '\\$&');
const nameIn = (name) => new RegExp(`(?<![\\w-])${escaped(name)}(?![\\w-])`, 'g');

/** Not `.nldd-x`, `#nldd-x` or `./nldd-x.css`: those are a class, an id and a file of the app. */
const tagIn = (tag) => new RegExp(`(?<![\\w.#-])(?<!(?:^|[^<])/)${escaped(tag)}(?![\\w-]|\\.(?:css|scss|less|js|mjs|cjs|ts|vue)\\b)`, 'g');

/** A bundle of the design system itself, which a text rename would only break. */
const DEFINES_ELEMENT = /(customElements\.define|customElement)\(\s*['"`]nldd-/;

function replaceAll(source, pattern, to) {
	let count = 0;
	const text = source.replace(pattern, () => {
		count += 1;
		return to;
	});
	return { text, count };
}

/**
 * Renames what names a renamed tag outside its markup. An import, a class and a
 * translation key are unmistakable anywhere; the bare tag only outside markup, and
 * not in a file with a suppression, which may be about that tag.
 * @returns {{ source: string, fixed: number }}
 */
export function renameReferences(source, renamedTags, { bareTags }) {
	if (DEFINES_ELEMENT.test(source)) return { source, fixed: 0 };
	const withTags = bareTags && !source.includes('nldd-lint-disable');
	const names = [...renamedTags].flatMap(([from, to]) => [
		[nameIn(entryPoint(from)), entryPoint(to)],
		[nameIn(toClass(from)), toClass(to)],
		[nameIn(translationKey(from)), translationKey(to)],
		...(withTags ? [[tagIn(from), to]] : []),
	]);
	let text = source;
	let fixed = 0;
	for (const [pattern, to] of names) {
		const replaced = replaceAll(text, pattern, to);
		text = replaced.text;
		fixed += replaced.count;
	}
	return { source: text, fixed };
}

/** Lines that still name a renamed tag: a string or a `<style>` that markup does not cover. */
export function linesNaming(source, renamedTags) {
	const tags = [...renamedTags.keys()].map((tag) => tagIn(tag));
	return source.split('\n').flatMap((line, index) => (tags.some((tag) => line.search(tag) !== -1) ? [index + 1] : []));
}

/**
 * @returns {{ source: string, fixed: number, renamedTags: Map<string, string> }}
 */
export function applyFixes(source, findings) {
	const renamedTags = new Map();
	const edits = findings
		.filter(({ fix }) => fix)
		.flatMap((finding) => {
			const found = editsOf(source, finding);
			if (found.length > 0 && finding.fix.tag) renamedTags.set(finding.tag, finding.fix.tag);
			return found;
		});
	const seen = new Set();
	const unique = edits.filter(({ from }) => !seen.has(from) && seen.add(from));
	let fixed = source;
	for (const { from, to, text } of unique.sort((a, b) => b.from - a.from)) {
		fixed = fixed.slice(0, from) + text + fixed.slice(to);
	}
	return { source: fixed, fixed: unique.filter(({ closing }) => !closing).length, renamedTags };
}
