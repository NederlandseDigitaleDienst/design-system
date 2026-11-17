/**
 * Applies what `--fix` may do without anyone looking. A rule says what changes, in
 * its `fix`; this file knows how that is written in each framework. A fix works on
 * the text of the file, so the rest of it stays exactly as it was. Where an
 * attribute stands comes from the parser (`startTag` on the node, see tree.js):
 * nothing here reads a tag again.
 */

const toCamelCase = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/** An attribute as the parser read it, under its own name or in camelCase. */
function findAttribute(startTag, name) {
	const names = [name, toCamelCase(name)];
	return startTag?.attributes.find((attribute) => names.includes(attribute.name));
}

function renameEdits(source, startTag, from, to) {
	const found = findAttribute(startTag, from);
	if (!found || findAttribute(startTag, to)) return [];
	const { prefix, name, nameStart, nameEnd } = found;
	const isProperty = prefix === '.' || (prefix.startsWith('[') && prefix !== '[attr.');
	return [{ from: nameStart, to: nameEnd, text: isProperty || name !== from ? toCamelCase(to) : to }];
}

/** Only a value written out in the markup: a bound one can hold anything. */
function valueEdits(source, startTag, name, values) {
	const found = findAttribute(startTag, name);
	const value = found?.value;
	if (!value || found.prefix || value.quote === '{') return [];
	const at = value.quote ? value.start + 1 : value.start;
	const end = value.quote ? value.end - 1 : value.end;
	return Object.entries(values).flatMap(([from, to]) =>
		at + from.length === end && source.startsWith(from, at) ? [{ from: at, to: end, text: to }] : [],
	);
}

/** What stands before an attribute, back to the one before it or the tag name. */
function gapBefore(source, { offset, tag, startTag }, found) {
	const previous = startTag.attributes.filter((attribute) => attribute.end <= found.start).at(-1);
	return source.slice(previous ? previous.end : offset + 1 + tag.length, found.start);
}

/** The whitespace before it goes too; a comment there would swallow what follows. */
function removeEdits(source, finding, name) {
	const found = findAttribute(finding.startTag, name);
	if (!found || found.templated || /\/[*/]/.test(gapBefore(source, finding, found))) return [];
	let from = found.start;
	while (/\s/.test(source[from - 1])) from -= 1;
	return [{ from, to: found.end, text: '' }];
}

/** A value written out in the markup that became a boolean: the whole attribute
 *  turns into the new name. The rule's context says which value that is. */
function flagEdits(source, startTag, from, to) {
	const found = findAttribute(startTag, from);
	if (!found || found.prefix || found.templated || findAttribute(startTag, to)) return [];
	return [{ from: found.start, to: found.end, text: to }];
}

/**
 * The parser says where an element ends: a comment or a string that looks like its
 * closing tag does not count. Without a closing tag of its own it stays as it is.
 */
function tagEdits(source, { offset, endOffset, tag: name, startTag }, to) {
	// An element the file never closes ends past the last character.
	if (!startTag || endOffset === undefined || endOffset >= source.length || !source.startsWith(`<${name}`, offset)) return [];
	const open = { from: offset + 1, to: offset + 1 + name.length, text: to };
	if (startTag.selfClosing && startTag.end === endOffset) return [open];
	const closing = source.lastIndexOf('</', endOffset);
	if (closing <= offset || !new RegExp(`^</${name}\\s*>$`).test(source.slice(closing, endOffset + 1))) return [];
	return [open, { from: closing + 2, to: closing + 2 + name.length, text: to, closing: true }];
}

/**
 * What stands between the start tag and the closing tag of an element, when the
 * file says it for certain: no hole a template fills (`{ }`, `${ }`, `{{ }}`)
 * and no comment, which could hold anything.
 */
function contentOf(source, { offset, endOffset, tag: name, startTag }) {
	if (!startTag || endOffset === undefined || endOffset >= source.length || !source.startsWith(`<${name}`, offset)) return undefined;
	if (startTag.selfClosing) return undefined;
	const start = startTag.end + 1;
	const closing = source.lastIndexOf('</', endOffset);
	if (closing < start || !new RegExp(`^</${name}\\s*>$`).test(source.slice(closing, endOffset + 1))) return undefined;
	const text = source.slice(start, closing);
	if (/[{}]|<!--/.test(text)) return undefined;
	return { start, end: closing, text };
}

/** Elements that stand in a line of text, and so in a `<p>`. */
const INLINE = new Set(['a', 'abbr', 'b', 'br', 'cite', 'code', 'del', 'em', 'i', 'ins', 'kbd', 'mark', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'nldd-avatar', 'nldd-badge', 'nldd-icon', 'nldd-link', 'nldd-status-dot', 'nldd-tag', 'nldd-term', 'nldd-token']);

/** Text, with or without inline elements, goes in an element of its own, such as a `<p>`. */
function wrapEdits(source, finding, wrapper) {
	const content = contentOf(source, finding);
	const inner = content?.text.trim();
	// A blank line ends raw HTML in Markdown, and indenting it leaves trailing space.
	if (!inner || /\n[ \t]*\n/.test(inner)) return [];
	const tags = [...inner.matchAll(/<\/?([a-zA-Z][\w-]*)/g)].map((match) => match[1].toLowerCase());
	if (tags.some((name) => !INLINE.has(name))) return [];
	const leading = /^\s*/.exec(content.text)[0];
	const trailing = /\s*$/.exec(content.text)[0];
	const base = leading.includes('\n') ? leading.slice(leading.lastIndexOf('\n') + 1) : undefined;
	let wrapped = `<${wrapper}>${inner}</${wrapper}>`;
	if (base !== undefined && inner.includes('\n')) {
		const unit = base.includes('\t') || !base ? '\t' : '  ';
		wrapped = `<${wrapper}>\n${base}${unit}${inner.replace(/\n/g, `\n${unit}`)}\n${base}</${wrapper}>`;
	}
	return [{ from: content.start, to: content.end, text: leading + wrapped + trailing }];
}

/** An edit is `{ from, to, text }` in the source. What is not certain makes none. */
function editsOf(source, finding) {
	const { fix, offset, tag, mention, startTag } = finding;
	return [
		...Object.entries(fix.rename ?? {}).flatMap(([from, to]) => renameEdits(source, startTag, from, to)),
		...Object.entries(fix.value ?? {}).flatMap(([name, values]) => valueEdits(source, startTag, name, values)),
		...(fix.remove ?? []).flatMap((name) => removeEdits(source, finding, name)),
		...Object.entries(fix.flag ?? {}).flatMap(([from, to]) => flagEdits(source, startTag, from, to)),
		...(fix.tag && mention ? [{ from: offset + 1, to: offset + 1 + tag.length, text: fix.tag }] : []),
		...(fix.tag && !mention ? tagEdits(source, finding, fix.tag) : []),
		...(fix.wrap ? wrapEdits(source, finding, fix.wrap) : []),
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

/** In a selector, a tag stands free: `[a="nldd-x"]` and `[a=nldd-x]` are values. */
const selectorName = (tag) => `(?<!["'=])${tagName(tag)}(?!["'])`;

/** The arguments that can only be a selector or a tag. */
const SELECTOR_CALL = /((?:querySelector(?:All)?|closest|matches|locator|createElement|getElementsByTagName)\(\s*)(["'`])([^"'`\n]*)\2/g;

function renameInScript(source, tag, to) {
	let count = 0;
	const inMarkup = source.replace(new RegExp(`(<\\\\?/?)${escaped(tag)}(?=[\\s/>])`, 'g'), (_, opening) => {
		count += 1;
		return opening + to;
	});
	const text = inMarkup.replace(SELECTOR_CALL, (call, name, quote, selector) => {
		const renamed = selector.replace(new RegExp(selectorName(tag), 'g'), () => {
			count += 1;
			return to;
		});
		return `${name}${quote}${renamed}${quote}`;
	});
	return { text, count };
}

/** A selector stands before the brace of a rule, or on a line of a list that ends in a comma. */
function renameInStyles(source, tag, to) {
	let count = 0;
	const text = source
		.split('\n')
		.map((line) => {
			const brace = line.indexOf('{');
			const selector = brace === -1 ? line : line.slice(0, brace);
			const opensRule = brace !== -1 || /,\s*$/.test(line);
			if (!opensRule || /^\s*@|:\s|url\(|image-set\(/.test(selector)) return line;
			const renamed = selector.replace(new RegExp(selectorName(tag), 'g'), () => {
				count += 1;
				return to;
			});
			return renamed + line.slice(selector.length);
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
