/**
 * Applies what `--fix` may do without anyone looking. A rule says what changes, in
 * its `fix`; this file knows how that is written in each framework. A fix works on
 * the text of the file, so the rest of it stays exactly as it was.
 */

const toCamelCase = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/** Where a template language opens a hole in a string: `${ }`, `{{ }}` or `{% %}`. */
const isHole = (source, at) => source.startsWith('${', at) || source.startsWith('{{', at) || source.startsWith('{%', at);

/** The closing quote of the string at `start`, past the holes in it, which hold quotes of their own. */
function endOfString(source, start) {
	for (let at = start + 1; at < source.length; at++) {
		if (source[at] === source[start]) return at;
		if (isHole(source, at)) {
			at = endOfBraces(source, source.indexOf('{', at));
			if (at === undefined) return undefined;
		}
	}
	return undefined;
}

/** The last `}` of the braces at `start`. */
function endOfBraces(source, start) {
	let depth = 0;
	for (let at = start; at < source.length; at++) {
		const char = source[at];
		if (/["'`]/.test(char)) {
			at = endOfString(source, at);
			if (at === undefined) return undefined;
		} else if (char === '{') depth += 1;
		else if (char === '}' && --depth === 0) return at;
	}
	return undefined;
}

/** The start tag from `start`, with strings and `{ }` blanked: a value can hold anything. */
function maskedTag(source, start) {
	let masked = '';
	for (let at = start; at < source.length; at++) {
		const char = source[at];
		const quoted = /["'`]/.test(char);
		if (char === '>') return masked;
		if (quoted || char === '{') {
			const end = quoted ? endOfString(source, at) : endOfBraces(source, at);
			if (end === undefined) return masked;
			masked += ' '.repeat(end - at + 1);
			at = end;
		} else masked += char;
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

const endsValue = (source, at) => at >= source.length || /[\s>]/.test(source[at]) || source.startsWith('/>', at);

/** The end of an attribute's value, or undefined when it does not end where a value ends. */
function endOfValue(source, name) {
	const closers = /^[\])]*/.exec(source.slice(name))[0].length;
	const equals = /^\s*=\s*/.exec(source.slice(name + closers));
	if (!equals) return name + closers;
	const start = name + closers + equals[0].length;
	if (source.startsWith('{%', start)) return undefined;
	let at = start;
	while (at !== undefined && !endsValue(source, at)) {
		if (/["'`]/.test(source[at])) at = endOfString(source, at);
		else if (source[at] === '{') at = endOfBraces(source, at);
		if (at !== undefined) at += 1;
	}
	return at;
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

const withoutComments = (source) => source.replace(/<!--[^]*?-->|\{#[^]*?#\}|\{%\s*comment\s*%\}[^]*?\{%\s*endcomment\s*%\}/g, '');

/**
 * Half a rename breaks a template, so a tag goes everywhere in a file or nowhere.
 * Control flow in text is invisible to the parser, which sees one element in
 * `{% if a %}<x>{% else %}<x>{% endif %}</x>` and in the reverse with two closers.
 * JSX has no such thing: there the parser is enough.
 * @returns {Set<string>} Tags that stay as they are.
 */
export function stuckTags(source, findings, isJsx) {
	const stuck = new Set();
	const renamed = findings.filter(({ fix }) => fix?.tag);
	for (const tag of new Set(renamed.map((finding) => finding.tag))) {
		const edits = renamed.filter((finding) => finding.tag === tag).map((finding) => editsOf(source, finding));
		const closers = withoutComments(source).match(new RegExp(`</${tag}\\s*>`, 'g'))?.length ?? 0;
		const paired = edits.filter((list) => list.length === 2).length;
		if (edits.some((list) => list.length === 0) || (!isJsx && closers !== paired)) stuck.add(tag);
	}
	return stuck;
}

const toClass = (tag) => `NLDD${toCamelCase(tag.replace(/^nldd-/, '-'))}`;
const entryPoint = (tag) => `@nldd/design-system/${tag.replace(/^nldd-/, '')}`;
const translationKey = (tag) => `components.${tag.replace(/^nldd-/, '')}`;

const escaped = (name) => name.replace(/[/@.-]/g, '\\$&');
const nameIn = (name) => new RegExp(`(?<![\\w-])${escaped(name)}(?![\\w-])`, 'g');

/** Not `.nldd-x`, `#nldd-x` or a path: those are a class, an id and a file of the app. */
const tagName = (tag) => `(?<![\\w.#/-])${escaped(tag)}(?![\\w-])`;

/** The arguments that can only be a selector or a tag. */
const SELECTOR_CALL = /((?:querySelector(?:All)?|closest|matches|locator|createElement|getElementsByTagName)\(\s*)(["'`])([^"'`\n]*)\2/g;

function renameInScript(source, tag, to) {
	let count = 0;
	const inMarkup = source.replace(new RegExp(`(<\\\\?/?)${escaped(tag)}(?=[\\s/>])`, 'g'), (_, opening) => {
		count += 1;
		return opening + to;
	});
	const text = inMarkup.replace(SELECTOR_CALL, (call, name, quote, selector) => {
		const renamed = selector.replace(new RegExp(tagName(tag), 'g'), () => {
			count += 1;
			return to;
		});
		return `${name}${quote}${renamed}${quote}`;
	});
	return { text, count };
}

/** In a stylesheet a bare name is a selector, except on a line that loads a file. */
function renameInStyles(source, tag, to) {
	let count = 0;
	const text = source
		.split('\n')
		.map((line) => {
			if (/url\(|@import|@use/.test(line)) return line;
			return line.replace(new RegExp(tagName(tag), 'g'), () => {
				count += 1;
				return to;
			});
		})
		.join('\n');
	return { text, count };
}

function replaceAll(source, pattern, to) {
	let count = 0;
	const text = source.replace(pattern, () => {
		count += 1;
		return to;
	});
	return { text, count };
}

/**
 * Renames what names a renamed tag outside its markup, where that is certain: an
 * import and a class anywhere, a tag in a stylesheet, in a selector call or in
 * markup in a script. Not in a file with a suppression, which may be about that
 * tag, or one that defines the old tag. The rest, `linesNaming` points at.
 * @param {'markup' | 'script' | 'styles'} kind
 * @returns {{ source: string, fixed: number }}
 */
export function renameReferences(source, renamedTags, kind) {
	let text = source;
	let fixed = 0;
	const apply = ({ text: changed, count }) => {
		text = changed;
		fixed += count;
	};
	for (const [from, to] of renamedTags) {
		if (new RegExp(`(define|customElement)\\(\\s*["'\`]${from}["'\`]`).test(source)) continue;
		apply(replaceAll(text, nameIn(entryPoint(from)), entryPoint(to)));
		apply(replaceAll(text, nameIn(toClass(from)), toClass(to)));
		if (source.includes('nldd-lint-disable')) continue;
		if (kind === 'script') apply(renameInScript(text, from, to));
		if (kind === 'styles') apply(renameInStyles(text, from, to));
	}
	return { source: text, fixed };
}

/** Lines that still name a renamed tag or its translation keys, for someone to look at. */
export function linesNaming(source, renamedTags) {
	const names = [...renamedTags.keys()].flatMap((tag) => [new RegExp(tagName(tag)), nameIn(translationKey(tag))]);
	return source.split('\n').flatMap((line, index) => (names.some((name) => line.search(name) !== -1) ? [index + 1] : []));
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
