/**
 * Turns source files into normalized trees. One function per template language;
 * rules never see the difference.
 *
 * Bound attributes keep their name and lose their value, so `:selected` on a tab
 * is still seen as `selected`. Wrappers that add nothing to the DOM disappear, or
 * `nldd-list > template[v-for] > nldd-list-item` would break every child selector.
 */

import { DomHandler, Parser } from 'htmlparser2';
import { cssBlocks } from './css.js';
import { REACT_ONLY, loadOxc, parseJsx } from './jsx.js';
import { HOLE, PERCENT_FORMAT, blank, boundFiller, endOfString, markupIn, pythonStrings, scriptLiterals } from './literals.js';
import {
	BOUND,
	TRANSPARENT,
	appendChild,
	attributeSpan,
	appendUnknown,
	createNode,
	createRoot,
	isOpaqueTag,
	walk,
} from './tree.js';

const CONDITIONAL = new Set(['v-if', 'v-else', 'v-else-if', '*ngIf']);
const REPEATED = new Set(['v-for', '*ngFor']);

/** What a template language writes to fill something in: `{{ x }}`, `{% x %}`, `${x}` or `<%= x %>`. */
const TEMPLATE_SYNTAX = /\{\{|\{%|\$\{|<%/;

/** A value a template language fills in, also a whole `{x}`. */
const TEMPLATE_VALUE = new RegExp(`${TEMPLATE_SYNTAX.source}|^\\{.*\\}$`);

/** A JSON object, such as a `translations` attribute, is written out and not filled in. */
const isJsonObject = (value) => {
	if (!/^\{\s*("|\})/.test(value)) return false;
	try {
		const parsed = JSON.parse(value);
		// A key the template fills in is no key anyone can check.
		return parsed !== null && !Object.keys(parsed).some((key) => TEMPLATE_SYNTAX.test(key));
	} catch {
		return false;
	}
};

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Jinja, Django, Handlebars and Angular control flow, written between the tags. */
const TEMPLATE_TEXT = /\{%|\{\{|@(if|else|for|switch|defer)\b/;

/** Angular markup in an .html file, where `<nldd-x />` does close the element. */
const ANGULAR = /\*ng[A-Z]|\[\(|\s\[[a-zA-Z.-]+\]=|\s\([a-zA-Z.-]+\)=["']|@(if|for|switch)\s*\(/;

/** Anything else cannot be an attribute, so a template language is writing into the tag. */
const PLAIN_ATTRIBUTE = /^[a-zA-Z_][\w:.-]*$/;

function readAttribute(element, name, value) {
	if (CONDITIONAL.has(name)) element.conditional = true;
	else if (REPEATED.has(name)) element.repeated = true;
	else if (name === 'v-show') element.toggled = true;
	else if (name === 'v-bind' || /^(v-bind)?:\[/.test(name)) element.spread = true;
	else if (name === 'v-model') element.attrs.set('value', BOUND);
	else if (name.startsWith('v-model:')) element.attrs.set(name.slice(8), BOUND);
	else if (/^(:|v-bind:|x-bind:|\.|\?)/.test(name)) {
		// Vue and Alpine take any modifier after the name, `:value.sync`; Lit takes none.
		const modifiers = /^(v-bind:|x-bind:|:)/.test(name) ? /(\.[a-zA-Z]+)+$/ : /\.(prop|attr|camel)$/;
		const bare = name.replace(/^(v-bind|x-bind)?[:.?]/, '').replace(modifiers, '');
		element.attrs.set(bare, BOUND);
	} else if (/^\[(class\.|style\.)/.test(name) || /^\[(ngClass|ngStyle|className)\]$/.test(name)) {
		// Angular's way to set one class or style, or a set of them. Not an attribute of
		// its own, but the element ends up with a class or a style, which the group pure asks.
		const attribute = /^\[(class\.|ngClass|className)/.test(name) ? 'class' : 'style';
		if (!element.attrs.has(attribute)) element.attrs.set(attribute, BOUND);
	} else if (/^\[@/.test(name)) {
		// An Angular animation: no attribute.
	} else if (/^\[.+\]$/.test(name)) {
		element.attrs.set(name.replace(/^\[\(?|\)?\]$/g, '').replace(/^attr\./, ''), BOUND);
	} else if (/^(@|#|v-|\(|\*)/.test(name)) {
		// Listeners, directives and template references add no attribute.
	} else if (!PLAIN_ATTRIBUTE.test(name)) {
		element.spread = true;
		element.templated = true;
	} else element.attrs.set(name, TEMPLATE_VALUE.test(value) && !isJsonObject(value) ? BOUND : value);
}

function hasSlotName(attribs) {
	return Object.keys(attribs).some((name) => name.startsWith('#') || name.startsWith('v-slot'));
}

function readHtmlChildren(children, parent, given) {
	// Control flow and includes are text in .html, so what is around them is uncertain.
	const templated = given.inert && children.some((node) => node.type === 'text' && TEMPLATE_TEXT.test(node.data));
	const inherited = templated ? { ...given, conditional: true } : given;
	if (templated) appendUnknown(parent, children[0].startIndex ?? 0);
	// A Lit hole between the tags can render anything, or nothing.
	const hole = given.lit && children.find((node) => node.type === 'text' && node.data.includes('${'));
	if (hole) appendUnknown(parent, hole.startIndex ?? 0);
	// In Markdown, text in an element can be a paragraph the renderer writes around it.
	const paragraphs = given.markdown && parent.name !== '#root' ? given.markdown(children) : null;
	for (const node of children) {
		// MDX marks an expression too short to stand as an element with a hole.
		const holeAt = (given.jsx || given.lit) && node.type === 'text' ? node.data.indexOf(HOLE) : -1;
		if (holeAt !== -1) appendUnknown(parent, (node.startIndex ?? 0) + holeAt);
		const data = holeAt === -1 ? node.data : node.data.replaceAll(HOLE, ' ');
		if (node.type === 'text' && data.trim()) {
			const paragraph = paragraphs?.(data);
			if (paragraph?.loose !== false) parent.text = true;
			if (paragraph?.at >= 0) {
				const p = createNode('p', (node.startIndex ?? 0) + paragraph.at);
				p.text = true;
				appendChild(parent, p);
			}
		}
		// htmlparser2 gives <style> a type of its own. The group pure reads every block in it.
		if (node.type === 'style') {
			for (const block of styleBlocks(node)) appendChild(parent, styleNode(block));
			continue;
		}
		// Content a frontend already knows nobody can read here.
		if (node.type === 'hole') appendUnknown(parent, node.startIndex);
		if (node.type !== 'tag') continue;
		const { name, attribs } = node;
		// In a document, a template is inert until something stamps it out, here or elsewhere.
		if (name === 'template' && inherited.inert) {
			appendUnknown(parent, node.startIndex ?? 0);
			continue;
		}
		// This one stamps out a template from somewhere else.
		if (name === 'ng-container' && Object.keys(attribs).some((key) => /ngTemplateOutlet\]?$/.test(key))) {
			appendUnknown(parent, node.startIndex ?? 0);
			continue;
		}
		const isWrapper = (name === 'template' && !hasSlotName(attribs)) || TRANSPARENT.has(name);
		if (isWrapper) {
			readHtmlChildren(node.children, parent, {
				conditional:
					inherited.conditional || Object.keys(attribs).some((key) => CONDITIONAL.has(key)),
				repeated: inherited.repeated || Object.keys(attribs).some((key) => REPEATED.has(key)),
				inert: inherited.inert,
				lit: inherited.lit,
				markdown: inherited.markdown,
				jsx: inherited.jsx,
			});
			continue;
		}
		const element = createNode(name, node.startIndex ?? 0);
		element.endOffset = node.endIndex ?? undefined;
		element.startTag = node.startTag;
		for (const [key, value] of Object.entries(attribs)) {
			// MDX writes JSX: a handler or a prop for React is no attribute.
			if (inherited.jsx && (/^on[A-Z]/.test(key) || REACT_ONLY.has(key))) continue;
			readAttribute(element, inherited.jsx && key === 'className' ? 'class' : key, value);
		}
		element.conditional ||= inherited.conditional;
		element.repeated ||= inherited.repeated;
		element.opaque = isOpaqueTag(name) || name === 'template';
		appendChild(parent, element);
		readHtmlChildren(node.children, element, { inert: inherited.inert, lit: inherited.lit, markdown: inherited.markdown, jsx: inherited.jsx });
	}
}

/**
 * A browser lowers every name in HTML. Only a name that is certainly the same in
 * lowercase is lowered here: a camelCase one may be an Angular directive, and a
 * PascalCase tag stays a component nobody can see into.
 */
const htmlName = (name, isTag) => {
	const same = isTag ? /^nldd-/i.test(name) || !/[a-z]/.test(name) : /^[A-Z]/.test(name);
	return same ? name.toLowerCase() : name;
};

/**
 * The document handler, plus where each attribute stands: the parser knows it
 * while it reads the tag, and the tree keeps it for `--fix`.
 */
class SpanHandler extends DomHandler {
	constructor(source, original, options, lowerCase) {
		super(undefined, options);
		this.source = source;
		this.original = original;
		this.lowerCase = lowerCase;
		this.pending = [];
	}

	onattribute(name) {
		const span = attributeSpan(this.source, this.lowerCase ? htmlName(name, false) : name, this.parser.startIndex, this.parser.endIndex);
		if (this.original !== this.source) span.templated = this.rewritten(span);
		this.pending.push(span);
	}

	/** Quieting a template keeps lengths, so a quoted value it filled in still ends where it did. */
	rewritten({ start, end, value }) {
		const [read, written] = [this.source, this.original].map((text) => text.slice(start, end));
		if (read === written) return false;
		const quote = value?.quote;
		const quoted = (quote === '"' || quote === "'") && this.original[value.start] === quote && this.original[end - 1] === quote;
		return !quoted || this.source.slice(start, value.start) !== this.original.slice(start, value.start);
	}

	onopentag(name, attribs) {
		if (this.lowerCase) {
			name = htmlName(name, true);
			attribs = Object.fromEntries(Object.entries(attribs).map(([key, value]) => [htmlName(key, false), value]));
		}
		super.onopentag(name, attribs);
		const end = this.parser.endIndex;
		this.tagStack.at(-1).startTag = { end, selfClosing: this.source[end - 1] === '/', attributes: this.pending };
		this.pending = [];
	}
}

/** `original` is the source before quieting a template, of the same length. */
function parseMarkup(source, { selfClosing, original = source, lowerCase = false }) {
	const options = {
		lowerCaseTags: false,
		lowerCaseAttributeNames: false,
		recognizeSelfClosing: selfClosing,
		withStartIndices: true,
		withEndIndices: true,
	};
	const handler = new SpanHandler(source, original, options, lowerCase);
	new Parser(handler, options).end(source);
	return handler.root;
}

// Every tag that has a `{% end… %}`: one missing here would end the `{% if %}` around it too early.
// `set` only in its block form, without `=`.
const OPENS_BLOCK = /^\{%-?\s*(?:(if|for|with|block|macro|call|filter|autoescape|trans|blocktrans|blocktranslate|raw|spaceless|verbatim|cache|language|localize|ifchanged)\b|set\b(?![^%]*=))/;
const CLOSES_BLOCK = /^\{%-?\s*end/;

/** The same for Go templates and Handlebars: `{{if}}…{{end}}`, `{{#if}}…{{/if}}`. */
// A Go action takes an argument, so `{{ block }}` alone is a value, not a block.
const OPENS_MUSTACHE = /^\{\{[-~]?\s*(#|\^\s*[^\s}~-]|(if|range|with|block|define)\s+[^\s}])/;
const CLOSES_MUSTACHE = /^\{\{[-~]?\s*(\/|end\b)/;

/** Another branch of a block: `{% elif %}`, `{% else %}`, `{% empty %}`, `{{else}}`, `{{^}}`. */
const ALTERNATIVE = /^\{%-?\s*(elif|else|empty)\b|^\{\{[-~]?\s*(else(?![\w.-])|\^\s*[-~]?\}\})/;

/** Where the branch ends that starts at `from`: the next `{% else %}` of its block, or the end of the block. */
function endOfBranch(text, from) {
	const tags = /\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}/g;
	tags.lastIndex = from;
	let depth = 0;
	for (let match = tags.exec(text); match; match = tags.exec(text)) {
		if (OPENS_BLOCK.test(match[0]) || OPENS_MUSTACHE.test(match[0])) depth += 1;
		else if (CLOSES_BLOCK.test(match[0]) || CLOSES_MUSTACHE.test(match[0])) {
			if (depth === 0) return match.index;
			depth -= 1;
		} else if (depth === 0 && ALTERNATIVE.test(match[0])) return match.index;
	}
	return text.length;
}

/** Elements whose end tag HTML may leave out: the next one of the kind closes them. */
const OPTIONAL_END = new Set(['li', 'p', 'dt', 'dd', 'option', 'optgroup', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'rt', 'rp', 'colgroup', 'caption']);

/**
 * True when every element the markup opens, it also closes, and it closes none it did not open.
 * An element whose end tag HTML may leave out (`<li>`) needs none (not `body`, `head` or `html`, rare in a branch), and `<x />` closes only where the
 * parser reads it so (`selfClosing`); in HTML it stays open. In doubt it says false: that
 * blanks a branch, which can miss a finding but never make one up.
 */
function isBalanced(markup, selfClosing = false) {
	const open = [];
	const tags = markup.replace(/<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1\s*>/gi, '');
	for (const [tag, slash, name] of tags.matchAll(/<(\/?)([a-zA-Z][\w-]*)(?:"[^"]*"|'[^']*'|[^'">])*>/g)) {
		const lower = name.toLowerCase();
		if (slash) {
			while (open.length > 0 && open.at(-1) !== lower && OPTIONAL_END.has(open.at(-1))) open.pop();
			if (open.pop() !== lower) return false;
		} else if (!VOID.has(lower) && !(selfClosing && tag.endsWith('/>'))) open.push(lower);
	}
	return open.every((name) => OPTIONAL_END.has(name));
}

/** Markup without its template tags, so `{% if a %}>{% endif %}` in a tag does not end it. */
const withoutTemplateTags = (text) => text.replace(/\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}|\{#[\s\S]*?#\}/g, '');

/**
 * Jinja and Django write into a tag, where an HTML parser reads them as markup:
 * `<nldd-field{% if x %} hidden{% endif %}>` would be a tag called `nldd-field{%`.
 * Between the quotes of a value this leaves something that reads as bound. Loose
 * in a tag it leaves a name that cannot be an attribute, so the element counts as
 * spread, and a whole `{% if %}` block goes: what is in it may not be there.
 */
function quietTemplateTags(source, blanked = new Set(), selfClosing = false) {
	const text = source
		.replace(/\{#[\s\S]*?#\}|\{%-?\s*comment\b[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, blank)
		// A name the template fills in is a tag nobody can check.
		.replace(/(<\/?)([a-zA-Z][\w-]*\{\{.*?\}\}[\w-]*)/g, (_, open, name) => `${open}x-${'x'.repeat(name.length - 2)}`);
	let out = '';
	let at = 0;
	let inTag = false;
	let quote = '';
	let depth = 0;
	while (at < text.length) {
		const close = text.startsWith('{%', at) ? '%}' : text.startsWith('{{', at) ? '}}' : '';
		const end = close ? text.indexOf(close, at) : -1;
		if (end !== -1) {
			const piece = text.slice(at, end + 2);
			if (!inTag && ALTERNATIVE.test(piece)) {
				// One branch renders. A branch that leaves an element open, as the first one may too,
				// goes, so the element in each does not nest in the other. A balanced branch stays.
				const stop = endOfBranch(text, end + 2);
				const branch = text.slice(end + 2, stop);
				out += piece.replace(/[<>]/g, ' ');
				at = end + 2;
				if (isBalanced(withoutTemplateTags(branch), selfClosing)) continue;
				for (const [, name] of branch.matchAll(/<([a-zA-Z][\w-]*)/g)) blanked.add(name.toLowerCase());
				out += blank(branch);
				at = stop;
				continue;
			}
			if (!inTag) out += piece.replace(/[<>]/g, ' ');
			else if (quote) out += `{{${'x'.repeat(piece.length - 4)}}}`;
			else {
				if (close === '%}' && OPENS_BLOCK.test(piece)) depth += 1;
				if (close === '%}' && CLOSES_BLOCK.test(piece)) depth = Math.max(0, depth - 1);
				out += ' {%%}'.slice(0, piece.length).padEnd(piece.length);
			}
			at = end + 2;
			continue;
		}
		const char = text[at];
		if (!inTag) {
			const raw = char === '<' && /^<(script|style)[\s>]/i.exec(text.slice(at, at + 8));
			let skip = text.startsWith('<!--', at) ? text.indexOf('-->', at) : -1;
			if (raw) {
				const closer = new RegExp(`</${raw[1]}`, 'gi');
				closer.lastIndex = at;
				skip = closer.exec(text)?.index ?? -1;
			}
			if (skip !== -1) {
				out += text.slice(at, skip);
				at = skip;
				continue;
			}
			inTag = char === '<' && /[a-zA-Z]/.test(text[at + 1] ?? '');
		} else if (quote) {
			if (char === quote) quote = '';
		} else if (char === '"' || char === "'") {
			quote = char;
		} else if (char === '>') {
			inTag = false;
			depth = 0;
		}
		out += depth > 0 && inTag && char !== '\n' ? ' ' : char;
		at += 1;
	}
	return out;
}

const quietIfTemplated = (source, blanked, selfClosing) => (/\{[%{#]/.test(source) ? quietTemplateTags(source, blanked, selfClosing) : source);

/**
 * A tag that also opens in a branch that went: which start tag its closing tag
 * belongs to is unknown, so its end is too, and `--fix` leaves it as it is.
 */
function forgetEnds(root, blanked) {
	if (blanked.size > 0) walk(root, (node) => blanked.has(node.name.toLowerCase()) && (node.endOffset = undefined));
}

export function parseHtml(source, filename = '') {
	const root = createRoot({ closed: /<html[\s>]/i.test(source) });
	const angular = ANGULAR.test(source) || filename.endsWith('.component.html');
	// A browser lowers the names in HTML; Angular's compiler keeps their case.
	const options = { selfClosing: angular, original: source, lowerCase: !angular };
	const blanked = new Set();
	readHtmlChildren(parseMarkup(quietIfTemplated(source, blanked, options.selfClosing), options).children, root, { inert: true });
	forgetEnds(root, blanked);
	return [root];
}

/** A `<` or `>` in an interpolation between the tags compares, and opens no element. */
const quietInterpolations = (source) => source.replace(/\{\{[\s\S]*?\}\}/g, (piece) => piece.replace(/[<>]/g, ' '));

export function parseVue(source) {
	const documentNode = parseMarkup(quietInterpolations(source), { selfClosing: true, original: source });
	const template = documentNode.children.find(
		(node) => node.type === 'tag' && node.name === 'template',
	);
	const roots = [];
	if (template) {
		const root = createRoot();
		readHtmlChildren(template.children, root, {});
		roots.push(root);
	}
	// A style block is the component's own stylesheet, so it stands as the element it is.
	const blocks = documentNode.children.filter((each) => each.name === 'style').flatMap(styleBlocks);
	if (blocks.length > 0) roots.push(stylesheetRoot(blocks));
	return roots;
}

/** Each block of a <style> element, at its place in the file. */
function styleBlocks(node) {
	const text = node.children?.find((child) => child.type === 'text');
	const start = text?.startIndex ?? 0;
	return text ? ownCssBlocks(text.data).map((block) => ({ ...block, offset: start + block.offset })) : [];
}

/** A block of CSS stands as a <style> element that carries its text, so the linter can tell whose it is. */
function styleNode({ offset, css }) {
	const node = createNode('style', offset);
	node.css = css;
	return node;
}

/** One <style> element per block, so a suppression or a baseline count covers one block and not the whole sheet. */
function stylesheetRoot(blocks) {
	const root = createRoot();
	for (const block of blocks) appendChild(root, styleNode(block));
	return root;
}

/**
 * The stylesheet with imports of the design system blanked out, so what is left is
 * the app's own and every offset still points at the source.
 */
const ownCss = (source) =>
	source.replace(/@(import|use|forward)\s+(url\()?['"]?[^'";)]*(@nldd\/design-system|\/nldd\/css\/)[^;]*;/g, (line) => ' '.repeat(line.length));

/** The top-level blocks of the app's own CSS, each with where it starts and its text. */
function ownCssBlocks(source, indented = false) {
	return cssBlocks(ownCss(source), indented).map(({ start, end }) => ({ offset: start, css: source.slice(start, end) }));
}

/**
 * A stylesheet file is a <style> element in a file of its own, so the rule about
 * one reads both. A file that only imports the design system's own CSS is not one.
 * Each block is an element of its own, starting where it does, so a comment above
 * a block suppresses that block.
 */
export function parseStylesheet(source, filename = '') {
	const blocks = ownCssBlocks(source, filename.endsWith('.sass'));
	return blocks.length === 0 ? [] : [stylesheetRoot(blocks)];
}

/** Where a `{…}` expression ends, from its opening brace, past strings and nested braces. */
function endOfExpression(source, start) {
	let depth = 0;
	for (let at = start; at < source.length; at += 1) {
		const char = source[at];
		if (char === '"' || char === "'" || char === '`') at = endOfString(source, at);
		else if (char === '{') depth += 1;
		else if (char === '}' && --depth === 0) return at;
	}
	return source.length - 1;
}

/**
 * MDX as HTML of the same length. An expression in a value reads as bound, a
 * spread as `v-bind`, an expression between the tags as a component of the app, and a
 * comment as nothing. ESM goes, so `import` and `export` are not prose.
 */
function mdxAsHtml(mdx) {
	const source = mdx.replace(/^(?:import|export)\s.*(?:\n.*\S.*)*/gm, blank).replaceAll(HOLE, ' ');
	const out = source.split('');
	let inTag = false;
	for (let at = 0; at < out.length; at += 1) {
		const char = out[at];
		if (inTag && (char === '"' || char === "'")) at = endOfString(source, at);
		else if (char === '<' && /[a-zA-Z/]/.test(source[at + 1] ?? '')) inTag = true;
		else if (char === '>') inTag = false;
		else if (char === '{') {
			const end = endOfExpression(source, at);
			const length = end - at + 1;
			let fill;
			let before = at - 1;
			while (/[ \t\n]/.test(source[before] ?? '')) before -= 1;
			const isComment = /^\{\s*\/\*/.test(source.slice(at, end));
			// An empty `{}` is no expression MDX accepts; it reads as an empty value.
			if (inTag && source[before] === '=') fill = length >= 3 ? boundFiller(length) : '""';
			else if (inTag) fill = length >= 6 ? 'v-bind'.padEnd(length) : `{${'x'.repeat(Math.max(length - 2, 0))}}`.slice(0, length);
			else if (length >= 4 && !isComment) fill = `<X${' '.repeat(length - 4)}/>`;
			// Too short for an element, `{t}`: a mark the tree reads as content nobody can see here.
			else if (!isComment && /\S/.test(source.slice(at + 1, end))) fill = HOLE.padEnd(length);
			else fill = blank(source.slice(at, end + 1));
			out.splice(at, length, ...fill);
			at = end;
		}
	}
	return out.join('');
}

/** Private-use characters that stand in the text for an expression, one per brace. */
const OPENS_CONDITION = '\uE001';
const OPENS_LOOP = '\uE002';
const OPENS_BOTH = '\uE003';
const CLOSES = '\uE004';
const MARKS = new Set([HOLE, OPENS_CONDITION, OPENS_LOOP, OPENS_BOTH, CLOSES]);

/** Elements HTML never closes, so they do not nest inside an expression either. */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/** Stands for an element in the script of an expression, when that script is judged. */
const ELEMENT = '\uE005';

const ONLY_COMMENTS = /^(\/\*[\s\S]*?\*\/\s*)+$/;

/**
 * Whether the script around the elements of an expression can render something
 * else: a branch of `? :`, `||` or `??` that is no element and not nothing.
 */
function rendersMore(script) {
	const parts = [];
	// The bracket depth of every `?` that waits for its `:`.
	const ternaries = [];
	let depth = 0;
	let glue = false;
	for (const piece of script.replace(/\s/g, '').split(/(\?\?|\|\||\?(?!\.)|:)/)) {
		// A `:` at another depth than the open `?` is a type or a key, `(item: Item) =>`: part of the operand.
		const isType = piece === ':' && ternaries.at(-1) !== depth;
		const part = piece.replace(/[()]/g, '');
		if (isType || glue) parts.push(parts.pop() + part);
		else parts.push(part);
		glue = isType;
		if (piece === '?') ternaries.push(depth);
		else if (piece === ':' && !isType) ternaries.pop();
		else depth += (piece.match(/[([{]/g)?.length ?? 0) - (piece.match(/[)\]}]/g)?.length ?? 0);
	}
	const rendersNothingElse = (part) => part.includes(ELEMENT) || /^(null|undefined|false|''|"")?[}\];,]*$/.test(part);
	for (let at = 1; at < parts.length; at += 2) {
		// What stands left of `||` and `??` is rendered when it is there.
		const leftRenders = parts[at] !== '?' && parts[at] !== ':' && !parts[at - 1].includes(ELEMENT);
		// Before a `?` stands a condition, `a ? <x /> : b ? <y /> : null`, not a branch.
		const isCondition = parts[at + 2] === '?';
		if (leftRenders || (!isCondition && !rendersNothingElse(parts[at + 1]))) return true;
	}
	return false;
}

/** After these a `<` starts an element; after any other word it compares. */
const BEFORE_ELEMENT = new Set(['return', 'yield', 'await', 'case', 'default', 'else', 'do', 'typeof', 'void', 'in', 'of']);

/**
 * Astro as HTML of the same length. The frontmatter goes. An expression in a value
 * reads as bound, a spread or a shorthand as a spread. An expression between the
 * tags keeps the elements it holds and loses its script: a mark where it starts
 * says whether they are behind a condition or in a loop, and one where it ends
 * closes that. An expression without elements leaves one mark, for content nobody
 * can read here.
 */
function astroAsHtml(source) {
	const out = source.split('');
	const { length } = source;
	const put = (at, text) => {
		for (let i = 0; i < text.length; i += 1) out[at + i] = text[i];
	};
	const clear = (from, to) => {
		for (let i = from; i < to; i += 1) if (out[i] !== '\n') out[i] = ' ';
	};
	const find = (text, from) => {
		const at = source.indexOf(text, from);
		return at === -1 ? length : at;
	};

	// The same characters in the file itself are no marks.
	for (let i = 0; i < length; i += 1) if (MARKS.has(out[i])) out[i] = ' ';

	const frontmatter = /^\s*---[ \t]*\r?\n(?:[\s\S]*?\n)?---[ \t]*\r?(?:\n|$)/.exec(source);
	if (frontmatter) clear(0, frontmatter[0].length);

	/**
	 * Whether the `<` here opens an element, going by the script before it: `last` is
	 * where that ends, past any comment and whitespace, or -1 at the start.
	 */
	function opensElement(at, last) {
		if (!/[a-zA-Z>]/.test(source[at + 1] ?? '')) return false;
		const before = source.slice(Math.max(0, last - 20), last + 1);
		const word = /(?<![\w$.])[a-z]+$/.exec(before)?.[0];
		if (word) return BEFORE_ELEMENT.has(word);
		// After a value, a `<` compares: a name, a call, an index or a string.
		return !/[\w$)\]'"`.]$/.test(before);
	}

	/** From the `/` of a regex to the one that closes it, on the same line; else nowhere. */
	function endOfRegex(start) {
		let inClass = false;
		for (let at = start + 1; at < length && source[at] !== '\n'; at += 1) {
			if (source[at] === '\\') at += 1;
			else if (source[at] === '[') inClass = true;
			else if (source[at] === ']') inClass = false;
			else if (source[at] === '/' && !inClass) return at;
		}
		return start;
	}

	/** From a backtick to the one that closes it, past every `${…}`. */
	function endOfTemplate(start) {
		let at = start + 1;
		while (at < length && source[at] !== '`') {
			if (source[at] === '\\') at += 1;
			else if (source.startsWith('${', at)) at = endOfScript(at + 1);
			at += 1;
		}
		return at;
	}

	/**
	 * From a `{` to the `}` that closes it, past strings, comments and nested braces.
	 * With `elements`, every element in it is read as markup and listed there.
	 */
	function endOfScript(start, elements) {
		let depth = 0;
		let at = start;
		// The last character of script so far: a comment says nothing about what follows it.
		let last = -1;
		while (at < length) {
			const char = source[at];
			const isComment = source.startsWith('/*', at) || source.startsWith('//', at);
			if (char === '"' || char === "'") at = endOfString(source, at);
			else if (char === '`') at = endOfTemplate(at);
			else if (isComment) at = source[at + 1] === '*' ? find('*/', at + 2) + 1 : find('\n', at);
			// After a value a `/` divides; anywhere else it opens a regex, which may hold a quote.
			else if (char === '/' && !/[\w$)\]'"`]/.test(source[last] ?? '')) at = endOfRegex(at);
			else if (char === '{') depth += 1;
			else if (char === '}' && --depth === 0) return at;
			else if (char === '<' && elements && opensElement(at, last)) {
				const end = readMarkup(at, true);
				elements.push([at, end]);
				at = end - 1;
			}
			if (!isComment && /\S/.test(source[at] ?? '') && at > start) last = at;
			at += 1;
		}
		return length - 1;
	}

	/** An expression as a value, or loose in a tag: a filler without spaces, so it stays one attribute. */
	function fillInTag(start, end, isValue) {
		const size = end - start + 1;
		// Straight before `/>` an unquoted value would swallow the slash.
		const room = isValue && source[end + 1] === '/' ? size - 1 : size;
		clear(start, end + 1);
		// A comment between the attributes sets nothing.
		if (!isValue && ONLY_COMMENTS.test(source.slice(start + 1, end).trim())) return;
		if (!isValue) put(start, size >= 3 ? `:[${'x'.repeat(size - 3)}]` : '');
		else if (room >= 3) put(start, boundFiller(room));
		else put(start, room === 2 && size === 3 ? '{{' : '""');
	}

	/** One start tag, from its `<`. Says where it ends and whether its content is raw text. */
	function readTag(start) {
		const name = /^[^\s/>]*/.exec(source.slice(start + 1))[0];
		let at = start + 1 + name.length;
		let raw = /^(script|style)$/i.test(name);
		while (at < length && source[at] !== '>') {
			const char = source[at];
			if (char === '{') {
				const end = endOfScript(at);
				fillInTag(at, end, false);
				at = end + 1;
				continue;
			}
			if (/[\s/]/.test(char)) {
				at += 1;
				continue;
			}
			const written = /^[^\s=/>{]+/.exec(source.slice(at))?.[0] ?? char;
			if (written === 'is:raw') raw = true;
			at += written.length;
			const equals = /^\s*=\s*/.exec(source.slice(at));
			if (!equals) continue;
			at += equals[0].length;
			const first = source[at];
			if (first === '"' || first === "'") at = find(first, at + 1) + 1;
			else if (first === '{' || first === '`') {
				const end = first === '{' ? endOfScript(at) : endOfTemplate(at);
				fillInTag(at, end, true);
				at = end + 1;
			} else at += /^[^\s>]*/.exec(source.slice(at))[0].length;
		}
		return { name, end: at, selfClosing: source[at - 1] === '/', raw };
	}

	/** What an expression between the tags leaves behind. */
	function fillExpression(start, end, elements) {
		const script = [];
		let from = start;
		// A place in the script, between the braces, where a mark can stand.
		let free = -1;
		for (const [elementStart, elementEnd] of [...elements, [end + 1, end + 1]]) {
			script.push(source.slice(from, elementStart));
			clear(from, elementStart);
			const first = Math.max(from, start + 1);
			if (free === -1 && first < Math.min(elementStart, end)) free = first;
			from = elementEnd;
		}
		if (elements.length > 0) {
			// A string goes first, so a `//` in `'https://…'` is no comment that eats the line.
			const strings = /'(?:\\.|[^'\\\n])+'|"(?:\\.|[^"\\\n])+"|`(?:\\.|[^`\\])+`/g;
			const text = script.map((part) => part.replace(strings, "'x'")).join(ELEMENT).replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
			// Only an element between the braces: it is there, as if written without them.
			if (!/[^\s(){}\uE005]/.test(text)) return;
			const loop = /=>|\bfunction\b/.test(text);
			const condition = /&&|\|\||\?/.test(text) || !loop;
			put(start, loop && condition ? OPENS_BOTH : loop ? OPENS_LOOP : OPENS_CONDITION);
			put(end, CLOSES);
			// `a ? 'tekst' : <x />` and `a || <x />` can render something that is no element.
			if (free !== -1 && rendersMore(text)) put(free, HOLE);
			return;
		}
		const inner = source.slice(start + 1, end).trim();
		const literal = /^(["'])([^"'<&{}\\\n]*)\1$/.exec(inner);
		// A string written out is text, and a comment renders nothing.
		if (literal) put(source.indexOf(literal[2], start), literal[2]);
		else if (inner !== '' && !ONLY_COMMENTS.test(inner)) put(start, HOLE);
	}

	/**
	 * Markup from `at`. Inside an expression it reads one element, or one fragment,
	 * and returns where that ends, so the script around it can go on.
	 */
	function readMarkup(start, oneElement = false) {
		let at = start;
		let depth = 0;
		while (at < length) {
			if (source.startsWith('<!--', at)) {
				at = Math.min(find('-->', at + 4) + 3, length);
			} else if (source.startsWith('</', at)) {
				const end = find('>', at);
				if (end === at + 2) clear(at, end + 1);
				at = end + 1;
				depth -= 1;
				if (oneElement && depth <= 0) return at;
			} else if (source.startsWith('<>', at)) {
				clear(at, at + 2);
				at += 2;
				depth += 1;
			} else if (source[at] === '<' && /[a-zA-Z]/.test(source[at + 1] ?? '')) {
				const tag = readTag(at);
				at = tag.end + 1;
				const closes = tag.selfClosing || VOID.has(tag.name.toLowerCase());
				if (!closes) depth += 1;
				if (tag.raw && !closes) {
					// Case-insensitive without lowering the source, which can change its length.
					const closer = new RegExp(`</${escapeRegExp(tag.name)}`, 'gi');
					closer.lastIndex = at;
					const end = closer.exec(source)?.index ?? length;
					// What `is:raw` holds is text as it stands, not elements and not expressions.
					if (!/^(script|style)$/i.test(tag.name)) for (let i = at; i < end; i += 1) if (/[<{}]/.test(out[i])) out[i] = ' ';
					at = end;
				}
				if (oneElement && depth <= 0) return at;
			} else if (source[at] === '{') {
				const elements = [];
				const end = endOfScript(at, elements);
				fillExpression(at, end, elements);
				at = end + 1;
			} else at += 1;
		}
		return length;
	}

	readMarkup(frontmatter ? frontmatter[0].length : 0);
	return out.join('');
}

/** Directives of Astro itself: they tell the compiler something and set no attribute. */
const ASTRO_DIRECTIVE = /^(client|set|is|define|transition|server|class):/;

/**
 * Turns the marks of `astroAsHtml` into what the tree builder already knows: a
 * wrapper with a condition or a loop around the elements of an expression, and a
 * hole for content that is filled in. `set:html` fills an element the same way.
 */
function liftAstro(children) {
	const out = [];
	const open = [out];
	const hole = (startIndex) => ({ type: 'hole', startIndex });
	for (const node of children) {
		if (node.type === 'text') {
			let from = 0;
			const flush = (to) => {
				if (to > from) open.at(-1).push({ type: 'text', data: node.data.slice(from, to), startIndex: (node.startIndex ?? 0) + from });
				from = to + 1;
			};
			for (let at = 0; at < node.data.length; at += 1) {
				const mark = node.data[at];
				if (!MARKS.has(mark)) continue;
				flush(at);
				const startIndex = (node.startIndex ?? 0) + at;
				if (mark === HOLE) open.at(-1).push(hole(startIndex));
				else if (mark === CLOSES) {
					if (open.length > 1) open.pop();
				} else {
					const attribs = {};
					if (mark !== OPENS_LOOP) attribs['v-if'] = '';
					if (mark !== OPENS_CONDITION) attribs['v-for'] = '';
					const wrapper = { type: 'tag', name: 'Fragment', attribs, children: [], startIndex };
					open.at(-1).push(wrapper);
					open.push(wrapper.children);
				}
			}
			flush(node.data.length);
			continue;
		}
		if (node.type === 'tag') {
			const names = Object.keys(node.attribs);
			const filled = names.some((name) => name === 'set:html' || name === 'set:text');
			// An inert template, and a fragment that is filled in: unknown here. A fragment
			// that names a slot of its component renders nothing itself, so it reads through.
			if (node.name === 'template' || (node.name === 'Fragment' && filled)) {
				open.at(-1).push(hole(node.startIndex ?? 0));
				continue;
			}
			if (names.includes('class:list')) node.attribs.class ??= '${}';
			for (const name of names) if (ASTRO_DIRECTIVE.test(name)) delete node.attribs[name];
			node.children = filled ? [hole(node.startIndex ?? 0)] : liftAstro(node.children);
		}
		open.at(-1).push(node);
	}
	return out;
}

/**
 * An Astro component: frontmatter, then a template that is HTML with expressions.
 * Its root stays open, also for a layout with an `<html>`: the page comes in
 * through a slot.
 */
export function parseAstro(source) {
	const root = createRoot();
	const document = parseMarkup(astroAsHtml(source), { selfClosing: true, original: source });
	readHtmlChildren(liftAstro(document.children), root, {});
	return [root];
}

/**
 * Which text in an element Markdown writes a paragraph around. Raw HTML in Markdown
 * runs to the first blank line, and what follows is Markdown again. In MDX, an
 * element whose content starts on a line of its own holds Markdown, so its text is
 * a paragraph; on the same line as the tag it is just text.
 */
const markdownParagraphs = (mdx) => (children) => {
	if (mdx) {
		const flow = children[0]?.type === 'text' && /^[ \t]*\n/.test(children[0].data);
		return (data) => (flow ? { loose: false, at: data.search(/\S/) } : { loose: true, at: -1 });
	}
	return (data) => {
		const paragraph = /\n[ \t]*\n\s*\S/.exec(data);
		return { loose: data.slice(0, paragraph?.index).trim() !== '', at: paragraph ? paragraph.index + paragraph[0].length - 1 : -1 };
	};
};

/** A tag in a mention that the source does not close is only its start tag. */
function markMentions(node, source) {
	for (const child of node.children) {
		const written = source.slice(child.offset, (child.endOffset ?? 0) + 1);
		if (child.name.startsWith('nldd-') && !new RegExp(`</${escapeRegExp(child.name)}\\s*>$`).test(written)) {
			child.mention = true;
			child.endOffset = undefined;
		}
		markMentions(child, source);
	}
}

/**
 * A Markdown or MDX file: every code block is a tree of its own, an inline tag a
 * mention, and the markup in the prose one tree, which is what the page renders.
 * With `rendered`, only that last one: a code block and a mention are documentation
 * about markup, and a scan of a project is about the markup it has.
 */
export function parseMarkdown(source, filename = '', { rendered = false } = {}) {
	const mdx = filename.endsWith('.mdx');
	const roots = [];
	const read = (text, offset, given = {}) => {
		const root = createRoot();
		const blanked = new Set();
		const padded = ' '.repeat(offset) + quietIfTemplated(text, blanked, true);
		readHtmlChildren(parseMarkup(padded, { selfClosing: true, original: ' '.repeat(offset) + text }).children, root, given);
		forgetEnds(root, blanked);
		roots.push(root);
	};
	const fences = /^( *)(```|~~~)[^\n]*\n([\s\S]*?)^ *\2/gm;
	for (const match of source.matchAll(fences)) {
		if (!rendered && match[3].includes('<nldd-')) read(match[3], match.index + match[0].indexOf('\n') + 1);
	}
	let prose = source.replace(fences, blank).replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/, blank);
	// A bare `<nldd-button>` in a sentence names the tag and says nothing about its attributes.
	for (const match of rendered ? [] : prose.matchAll(/`(<nldd-[^`\n]*)`/g)) {
		read(match[1].replace(/^<([a-z-]+)\s*\/?>$/, '<$1 v-bind="x"><Mention /></$1>'), match.index + 1);
		markMentions(roots.at(-1), source);
	}
	prose = prose.replace(/`[^`\n]*`/g, blank).replace(/<[a-z][a-z+.-]*:[^\s>]*>/gi, blank);
	if (mdx) prose = mdxAsHtml(prose);
	if (prose.includes('<nldd-')) read(prose, 0, { markdown: markdownParagraphs(mdx), jsx: mdx });
	return roots;
}

/**
 * Lit in a .ts file. A hole gets a filler of the same length without spaces, so
 * positions stay right, an unquoted value stays one value, and it reads as bound.
 */
export function parseLit(source) {
	return scriptLiterals(source).filter(({ html }) => html).flatMap(({ start, end, holes }) => {
		let text = source.slice(start, end);
		if (!text.includes('<nldd-')) return [];
		for (const [from, to] of holes) {
			const filler = boundFiller(to - from);
			text = text.slice(0, from - start) + filler + text.slice(to - start);
		}
		const root = createRoot();
		const padded = ' '.repeat(start) + text;
		readHtmlChildren(parseMarkup(padded, { selfClosing: false }).children, root, { lit: true });
		return [root];
	});
}

/**
 * Markup in string literals. Each literal with a component is a tree of its own,
 * and holds only part of what is rendered: a hole is a bound value, and an
 * element the literal does not close has children nobody can see here.
 * @param {string} source
 * @param {object[]} literals - from a scanner in literals.js
 * @returns {{ roots: object[], kind: 'strings', unread?: number }} `unread` is where markup stands that could not be read
 */
function readLiterals(source, literals) {
	const roots = [];
	let unread;
	for (const literal of literals) {
		const markup = markupIn(source, literal);
		if (!markup) continue;
		if (markup.unread !== undefined) {
			unread ??= markup.unread;
			continue;
		}
		const root = createRoot();
		readHtmlChildren(parseMarkup(markup.text, { selfClosing: false }).children, root, { lit: true });
		const settle = (node) => {
			// An edit would have to write the backslashes back.
			node.readOnly = markup.escaped;
			for (const [name, value] of node.attrs) {
				if (typeof value === 'string' && (value.includes(HOLE) || PERCENT_FORMAT.test(value))) node.attrs.set(name, BOUND);
			}
			const written = markup.text.slice(node.offset, (node.endOffset ?? 0) + 1);
			if (node.startTag && !new RegExp(`</${escapeRegExp(node.name)}\\s*>$`).test(written)) {
				// Closed in another literal, or never: what it holds is put together elsewhere.
				appendUnknown(node, node.offset);
				node.endOffset = undefined;
			}
			node.children.forEach(settle);
		};
		root.children.forEach(settle);
		roots.push(root);
	}
	return { roots, kind: 'strings', unread };
}

/** Markup in the string literals of a Python file. */
export function parsePython(source) {
	return readLiterals(source, pythonStrings(source));
}

/**
 * A script holds `html` templates, or JSX, as a React app writes in a `.js` file,
 * or markup in plain strings, as a script without a framework puts it together.
 * JSX is read only where no template holds our markup and the file parses as
 * JSX with an element in it. What is left is read as string literals.
 */
export async function parseScript(source, filename, options) {
	const templates = parseLit(source);
	if (templates.length > 0 || !/<(nldd-|Nldd)/.test(source)) return templates;
	await loadOxc(filename);
	try {
		const reading = await parseJsx(source, filename, options);
		if (!reading.syntaxError && reading.roots.length > 0) return reading;
	} catch {
		// Not JSX: its strings are still there to read.
	}
	return readLiterals(source, scriptLiterals(source).filter(({ html }) => !html));
}

/** Names a framework wrapper by the tag it renders, with kebab-case props. */
export function applyWrappers(roots, wrappers) {
	const visit = (node) => {
		const tag = wrappers[node.name];
		if (tag) {
			node.name = tag;
			node.opaque = false;
			node.wrapped = true;
			node.attrs = new Map(
				[...node.attrs].map(([name, value]) => [
					name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
					value,
				]),
			);
		}
		node.children.forEach(visit);
	};
	roots.forEach(visit);
	return roots;
}

const PARSERS = {
	'.html': parseHtml,
	'.htm': parseHtml,
	'.j2': parseHtml,
	'.tmpl': parseHtml,
	'.gohtml': parseHtml,
	'.jinja': parseHtml,
	'.jinja2': parseHtml,
	'.vue': parseVue,
	'.astro': parseAstro,
	'.md': parseMarkdown,
	'.mdx': parseMarkdown,
	'.jsx': parseJsx,
	'.tsx': parseJsx,
	'.ts': parseLit,
	'.py': parsePython,
	'.js': parseScript,
	'.mjs': parseScript,
	'.css': parseStylesheet,
	'.scss': parseStylesheet,
	'.sass': parseStylesheet,
	'.less': parseStylesheet,
};

/**
 * How much of a file the linter reads: all its markup, only the `html` templates in
 * a script, or nothing, for a file type it has no parser for.
 * @returns {'markup' | 'templates' | 'none'}
 */
export function readerOf(filename) {
	const parser = PARSERS[filename.slice(filename.lastIndexOf('.'))];
	if (!parser) return 'none';
	return parser === parseLit || parser === parseScript || parser === parsePython ? 'templates' : 'markup';
}

/**
 * What a fix may write in a file, by how it was read. A quote of ours could end
 * a string literal, and JSX takes no JSON in an attribute. A hole in text is text
 * in Vue, and in JSX where the finding was decided with every expression read.
 */
const WRITES = {
	markup: { quotes: true, aroundHoles: false },
	vue: { quotes: true, aroundHoles: true },
	jsx: { quotes: false, aroundHoles: true },
	strings: { quotes: false, aroundHoles: false },
};

/**
 * Reads one file. A reader gives its trees, and where it has more to say, an
 * object with those trees in it.
 * @returns {Promise<{ roots: import('./tree.js').TreeNode[], kind: 'markup' | 'vue' | 'jsx' | 'strings',
 *   writes: { quotes: boolean, aroundHoles: boolean }, syntaxError?: { message: string, offset: number }, unread?: number }>}
 */
export async function parseSource(source, filename, options) {
	const parser = PARSERS[filename.slice(filename.lastIndexOf('.'))];
	const given = parser ? await parser(source, filename, options) : [];
	const reading = Array.isArray(given) ? { roots: given, kind: parser === parseVue ? 'vue' : 'markup' } : given;
	return { ...reading, writes: WRITES[reading.kind] };
}
