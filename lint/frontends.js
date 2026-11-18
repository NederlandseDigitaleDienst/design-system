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
import {
	BOUND,
	appendChild,
	attributeSpan,
	appendUnknown,
	createNode,
	createRoot,
	isOpaqueTag,
	walk,
} from './tree.js';

const TRANSPARENT = new Set([
	'Transition',
	'TransitionGroup',
	'KeepAlive',
	'Suspense',
	'transition',
	'transition-group',
	'keep-alive',
	'suspense',
	'Fragment',
	'React.Fragment',
	'ng-container',
]);

const CONDITIONAL = new Set(['v-if', 'v-else', 'v-else-if', '*ngIf']);
const REPEATED = new Set(['v-for', '*ngFor']);

/** A value a template language fills in: `{{ x }}`, `{% x %}`, `${x}`, `<%= x %>` or `{x}`. */
const TEMPLATE_VALUE = /\{\{|\{%|\$\{|<%|^\{.*\}$/;

/** A JSON object, such as a `translations` attribute, is written out and not filled in. */
const isJsonObject = (value) => {
	if (!/^\{\s*("|\})/.test(value)) return false;
	try {
		return JSON.parse(value) !== null;
	} catch {
		return false;
	}
};

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
		const bare = name.replace(/^(v-bind|x-bind)?[:.?]/, '').replace(/\.(prop|attr|camel)$/, '');
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
		if (node.type === 'text' && node.data.trim()) {
			const paragraph = paragraphs?.(node.data);
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
 * The document handler, plus where each attribute stands: the parser knows it
 * while it reads the tag, and the tree keeps it for `--fix`.
 */
class SpanHandler extends DomHandler {
	constructor(source, original, options) {
		super(undefined, options);
		this.source = source;
		this.original = original;
		this.pending = [];
	}

	onattribute(name) {
		const span = attributeSpan(this.source, name, this.parser.startIndex, this.parser.endIndex);
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
		super.onopentag(name, attribs);
		const end = this.parser.endIndex;
		this.tagStack.at(-1).startTag = { end, selfClosing: this.source[end - 1] === '/', attributes: this.pending };
		this.pending = [];
	}
}

/** `original` is the source before quieting a template, of the same length. */
function parseMarkup(source, { selfClosing, original = source }) {
	const options = {
		lowerCaseTags: false,
		lowerCaseAttributeNames: false,
		recognizeSelfClosing: selfClosing,
		withStartIndices: true,
		withEndIndices: true,
	};
	const handler = new SpanHandler(source, original, options);
	new Parser(handler, options).end(source);
	return handler.root;
}

const OPENS_BLOCK = /^\{%-?\s*(if|for|with|block|macro|call|filter|autoescape|trans|blocktrans)\b/;
const CLOSES_BLOCK = /^\{%-?\s*end/;

/** Same length, so positions stay right. */
const blank = (text) => text.replace(/[^\n]/g, ' ');

/**
 * Jinja and Django write into a tag, where an HTML parser reads them as markup:
 * `<nldd-field{% if x %} hidden{% endif %}>` would be a tag called `nldd-field{%`.
 * Between the quotes of a value this leaves something that reads as bound. Loose
 * in a tag it leaves a name that cannot be an attribute, so the element counts as
 * spread, and a whole `{% if %}` block goes: what is in it may not be there.
 */
function quietTemplateTags(source) {
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
			const skip = raw ? text.toLowerCase().indexOf(`</${raw[1].toLowerCase()}`, at) : text.startsWith('<!--', at) ? text.indexOf('-->', at) : -1;
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

const quietIfTemplated = (source) => (/\{[%{#]/.test(source) ? quietTemplateTags(source) : source);

export function parseHtml(source) {
	const root = createRoot({ closed: /<html[\s>]/i.test(source) });
	readHtmlChildren(parseMarkup(quietIfTemplated(source), { selfClosing: ANGULAR.test(source), original: source }).children, root, { inert: true });
	return [root];
}

export function parseVue(source) {
	const documentNode = parseMarkup(source, { selfClosing: true });
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

/**
 * Where a string in a script ends, from its opening quote. A template literal can
 * span lines, the others cannot.
 */
function endOfString(source, start) {
	let at = start + 1;
	while (at < source.length && source[at] !== source[start] && (source[start] === '`' || source[at] !== '\n')) {
		at += source[at] === '\\' ? 2 : 1;
	}
	return at;
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
	const source = mdx.replace(/^(?:import|export)\s.*(?:\n.*\S.*)*/gm, blank);
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
			// An empty `{}` is no expression MDX accepts; it reads as an empty value.
			if (inTag && out[at - 1] === '=') fill = length >= 3 ? `\${${'x'.repeat(length - 3)}}` : '""';
			else if (inTag) fill = length >= 6 ? 'v-bind'.padEnd(length) : `{${'x'.repeat(Math.max(length - 2, 0))}}`.slice(0, length);
			else if (length >= 4 && !/^\{\s*\/\*/.test(source.slice(at, end))) fill = `<X${' '.repeat(length - 4)}/>`;
			else fill = blank(source.slice(at, end + 1));
			out.splice(at, length, ...fill);
			at = end;
		}
	}
	return out.join('');
}

/** Private-use characters that stand in the text for an expression, one per brace. */
const HOLE = '';
const OPENS_CONDITION = '';
const OPENS_LOOP = '';
const OPENS_BOTH = '';
const CLOSES = '';

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
	const parts = script.replace(/[\s()]/g, '').split(/(\?\?|\|\||\?(?!\.)|:)/);
	const rendersNothingElse = (part) => part.includes(ELEMENT) || /^(null|undefined|false|''|"")?[}\];,]*$/.test(part);
	for (let at = 1; at < parts.length; at += 2) {
		// What stands left of `||` and `??` is rendered when it is there.
		const leftRenders = parts[at] !== '?' && parts[at] !== ':' && !parts[at - 1].includes(ELEMENT);
		if (leftRenders || !rendersNothingElse(parts[at + 1])) return true;
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
		else if (room >= 3) put(start, `\${${'x'.repeat(room - 3)}}`);
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
			const text = script.join(ELEMENT).replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
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
					const closing = source.toLowerCase().indexOf(`</${tag.name.toLowerCase()}`, at);
					const end = closing === -1 ? length : closing;
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
				if (mark < HOLE || mark > CLOSES) continue;
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
		if (child.name.startsWith('nldd-') && !new RegExp(`</${child.name}\\s*>$`).test(written)) {
			child.mention = true;
			child.endOffset = undefined;
		}
		markMentions(child, source);
	}
}

/**
 * A Markdown or MDX file: every code block is a tree of its own, an inline tag a
 * mention, and the markup in the prose one tree, which is what the page renders.
 */
export function parseMarkdown(source, filename = '') {
	const mdx = filename.endsWith('.mdx');
	const roots = [];
	const read = (text, offset, given = {}) => {
		const root = createRoot();
		const padded = ' '.repeat(offset) + quietIfTemplated(text);
		readHtmlChildren(parseMarkup(padded, { selfClosing: true, original: ' '.repeat(offset) + text }).children, root, given);
		roots.push(root);
	};
	const fences = /^( *)(```|~~~)[^\n]*\n([\s\S]*?)^ *\2/gm;
	for (const match of source.matchAll(fences)) {
		if (match[3].includes('<nldd-')) read(match[3], match.index + match[0].indexOf('\n') + 1);
	}
	let prose = source.replace(fences, blank).replace(/^---\n[\s\S]*?\n---(?=\n)/, blank);
	// A bare `<nldd-button>` in a sentence names the tag and says nothing about its attributes.
	for (const match of prose.matchAll(/`(<nldd-[^`\n]*)`/g)) {
		read(match[1].replace(/^<([a-z-]+)\s*\/?>$/, '<$1 v-bind="x"><Mention /></$1>'), match.index + 1);
		markMentions(roots.at(-1), source);
	}
	prose = prose.replace(/`[^`\n]*`/g, blank).replace(/<[a-z][a-z+.-]*:[^\s>]*>/gi, blank);
	if (mdx) prose = mdxAsHtml(prose);
	if (prose.includes('<nldd-')) read(prose, 0, { markdown: markdownParagraphs(mdx), jsx: mdx });
	return roots;
}

/**
 * Finds every html`` template, also inside the holes of another. A small scanner,
 * so that a story needs no TypeScript parser: it only tells strings, comments and
 * templates apart.
 */
function litTemplates(source) {
	const templates = [];
	const skipString = (start) => {
		let at = start + 1;
		while (at < source.length && source[at] !== source[start] && source[at] !== '\n') {
			at += source[at] === '\\' ? 2 : 1;
		}
		return at;
	};
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
		if (isHtml) templates.push({ start, end: at, holes });
		return at;
	};
	function readCode(start, inHole) {
		let depth = 0;
		let at = start;
		while (at < source.length) {
			const char = source[at];
			if (char === "'" || char === '"') at = skipString(at);
			else if (source.startsWith('//', at)) at = source.indexOf('\n', at) >>> 0;
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
 * Lit in a .ts file. A hole gets a filler of the same length without spaces, so
 * positions stay right, an unquoted value stays one value, and it reads as bound.
 */
export function parseLit(source) {
	return litTemplates(source).flatMap(({ start, end, holes }) => {
		let text = source.slice(start, end);
		if (!text.includes('<nldd-')) return [];
		for (const [from, to] of holes) {
			const filler = `\${${'x'.repeat(to - from - 3)}}`;
			text = text.slice(0, from - start) + filler + text.slice(to - start);
		}
		const root = createRoot();
		const padded = ' '.repeat(start) + text;
		readHtmlChildren(parseMarkup(padded, { selfClosing: false }).children, root, { lit: true });
		return [root];
	});
}

/**
 * A script holds `html` templates, or JSX, as a React app writes in a `.js` file.
 * JSX is read only where no template holds our markup and the file parses as
 * JSX: anything else stays unread, and says so.
 */
export async function parseScript(source, filename) {
	const templates = parseLit(source);
	if (templates.length > 0 || !/<(nldd-|Nldd)/.test(source)) return templates;
	await loadOxc(filename);
	try {
		const roots = await parseJsx(source, filename);
		if (roots.syntaxError) return [];
		roots.jsx = true;
		return roots;
	} catch {
		return [];
	}
}

function jsxName(node) {
	if (node.type === 'JSXIdentifier') return node.name;
	if (node.type === 'JSXMemberExpression') return `${jsxName(node.object)}.${node.property.name}`;
	return `${node.namespace.name}:${node.name.name}`;
}

/** Expressions a value passes through unchanged: `a ? <x /> : <y />`, `(<x />)`, `<x /> as JSX.Element`. */
const PASSES_ON_VALUE = new Set([
	'ConditionalExpression', 'LogicalExpression', 'ParenthesizedExpression', 'SequenceExpression',
	'TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion',
]);

/** Between `export` and the component it exports: `export const A = memo(() => ...)`, a class and its render. */
const PASSES_ON_EXPORT = new Set([
	...PASSES_ON_VALUE, 'VariableDeclaration', 'VariableDeclarator', 'CallExpression',
	'ClassDeclaration', 'ClassExpression', 'ClassBody', 'MethodDefinition', 'PropertyDefinition',
]);

const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

/**
 * Finds every JSX tree. What an exported component returns is what this file
 * renders. Any other tree is built to be placed somewhere, maybe inside a component
 * of this same file, and is marked detached. A tree that a function bound to a name
 * returns, or that a name is bound to directly, gets that name as its owner, so its
 * place can be looked up: `<Row />`, `{items}`. JSX assigned later or pushed into an
 * array has no owner and stays unknown.
 */
function collectJsx(node, found, state = {}, exportedNames = new Set()) {
	if (!node || typeof node !== 'object') return;
	const { exported = false, renders = false, returned = false, fnOwner, valueOwner } = state;
	if (Array.isArray(node)) {
		for (const item of node) collectJsx(item, found, state, exportedNames);
		return;
	}
	if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
		found.push({ node, detached: !(renders && returned), owner: returned ? fnOwner : valueOwner });
		return;
	}
	const isFunction = FUNCTIONS.has(node.type);
	// `function A() {}` with `export default A` further down, or `export { A }`.
	const named = (node.type === 'FunctionDeclaration' || node.type === 'VariableDeclarator' || node.type === 'ClassDeclaration') && exportedNames.has(node.id?.name);
	const isExported = exported || named;
	// The name a function returns its JSX under: its own, or the one it is bound to.
	const ownName = node.type === 'FunctionDeclaration' ? node.id?.name : isFunction ? valueOwner : fnOwner;
	for (const key of Object.keys(node)) {
		if (key === 'parent') continue;
		let nextValueOwner;
		if (node.type === 'VariableDeclarator' && key === 'init' && node.id?.type === 'Identifier') nextValueOwner = node.id.name;
		else if (PASSES_ON_VALUE.has(node.type)) nextValueOwner = valueOwner;
		// `memo(() => ...)`, `useMemo(() => ...)`, `xs.map((x) => ...)`: the callback is what the name holds.
		else if (node.type === 'CallExpression' && key === 'arguments') nextValueOwner = valueOwner;
		collectJsx(node[key], found, {
			exported: node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration' || (isExported && (named || PASSES_ON_EXPORT.has(node.type))),
			// A function renders when it is the exported one; a function inside it does not.
			renders: isFunction ? isExported : renders,
			returned: (node.type === 'ReturnStatement' && key === 'argument')
				|| (node.type === 'ArrowFunctionExpression' && key === 'body')
				|| (returned && PASSES_ON_VALUE.has(node.type)),
			fnOwner: isFunction ? ownName : fnOwner,
			valueOwner: nextValueOwner,
		}, exportedNames);
	}
}

/** Every name the file binds, with how often: a name bound twice cannot be looked up by name alone. */
function bindingCounts(program) {
	const counts = new Map();
	const add = (name) => name && counts.set(name, (counts.get(name) ?? 0) + 1);
	const pattern = (node) => {
		if (!node) return;
		if (node.type === 'Identifier') add(node.name);
		else if (node.type === 'ObjectPattern') node.properties.forEach((property) => pattern(property.value ?? property.argument));
		else if (node.type === 'ArrayPattern') node.elements.forEach(pattern);
		else if (node.type === 'AssignmentPattern') pattern(node.left);
		else if (node.type === 'RestElement') pattern(node.argument);
		else if (node.type === 'TSParameterProperty') pattern(node.parameter);
	};
	const visit = (node) => {
		if (!node || typeof node !== 'object') return;
		if (Array.isArray(node)) return node.forEach(visit);
		if (node.type === 'VariableDeclarator') pattern(node.id);
		if ((node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') && node.id) add(node.id.name);
		if (FUNCTIONS.has(node.type)) node.params?.forEach(pattern);
		for (const key of Object.keys(node)) if (key !== 'parent') visit(node[key]);
	};
	visit(program);
	return counts;
}

/** The names a module exports by reference rather than in place. */
function exportedNamesOf(program) {
	const names = new Set();
	for (const statement of program.body ?? []) {
		if (statement.type === 'ExportDefaultDeclaration' && statement.declaration?.type === 'Identifier') names.add(statement.declaration.name);
		// `export default withRouter(Page)`: the component inside the wrapper is what is exported.
		const wrapped = (call) => call?.type === 'CallExpression' && call.arguments.forEach((arg) => (arg.type === 'Identifier' ? names.add(arg.name) : wrapped(arg)));
		if (statement.type === 'ExportDefaultDeclaration') wrapped(statement.declaration);
		if (statement.type === 'ExportNamedDeclaration' && !statement.source) {
			for (const specifier of statement.specifiers ?? []) names.add(specifier.local?.name);
		}
	}
	return names;
}

/** `undefined` means the attribute is not there: `x={false}` and `x={null}` switch it off. */
function staticJsxValue(value) {
	if (value === null) return '';
	if (value.type === 'Literal') return String(value.value);
	if (value.type !== 'JSXExpressionContainer') return BOUND;
	const { expression } = value;
	if (expression.type === 'Literal') {
		if (expression.value === false || expression.value === null) return undefined;
		return expression.value === true ? '' : String(expression.value);
	}
	if (expression.type === 'TemplateLiteral' && expression.expressions.length === 0) {
		return expression.quasis[0].value.cooked;
	}
	return BOUND;
}

/**
 * `translations={{ 'components.x.y': '…' }}` as JSON, so its keys can be checked. Only
 * the keys need to be static; a value that is filled in counts as an empty text.
 */
function staticJsxObject(value) {
	const expression = value?.type === 'JSXExpressionContainer' ? value.expression : undefined;
	if (expression?.type !== 'ObjectExpression') return BOUND;
	const entries = [];
	for (const property of expression.properties) {
		if (property.type !== 'Property' || property.computed || property.key.type !== 'Literal') return BOUND;
		const text = property.value.type === 'Literal' ? property.value.value : '';
		entries.push([String(property.key.value), String(text)]);
	}
	return JSON.stringify(Object.fromEntries(entries));
}

/** Props React keeps to itself: they never reach the element. */
const REACT_ONLY = new Set(['key', 'ref', 'dangerouslySetInnerHTML', 'suppressHydrationWarning', 'suppressContentEditableWarning']);

function readJsxAttributes(element, attributes, roots) {
	for (const attribute of attributes) {
		if (attribute.type === 'JSXSpreadAttribute') {
			element.spread = true;
			continue;
		}
		const name = jsxName(attribute.name);
		const isHandler = /^on[A-Z]/.test(name) || REACT_ONLY.has(name);
		const value = name === 'translations' ? staticJsxObject(attribute.value) : staticJsxValue(attribute.value);
		if (!isHandler && value !== undefined) element.attrs.set(name === 'className' ? 'class' : name, value);
		// An element passed as a prop renders elsewhere, so it is a tree of its own.
		const nested = [];
		collectJsx(attribute.value, nested);
		for (const { node } of nested) roots.push(jsxTree(node, roots, true));
	}
}

function readJsxExpression(expression, parent, flags, roots) {
	const conditional = { ...flags, conditional: true };
	switch (expression.type) {
		case 'JSXElement':
		case 'JSXFragment':
			readJsxNode(expression, parent, flags, roots);
			break;
		case 'JSXEmptyExpression':
			break;
		case 'Literal':
		case 'TemplateLiteral':
			if (expression.value !== '' && expression.value !== null) parent.text = true;
			break;
		case 'LogicalExpression':
			// The left of `a && <x />` renders nothing worth counting.
			if (expression.operator !== '&&') readJsxExpression(expression.left, parent, conditional, roots);
			readJsxExpression(expression.right, parent, conditional, roots);
			break;
		case 'ConditionalExpression':
			readJsxExpression(expression.consequent, parent, conditional, roots);
			readJsxExpression(expression.alternate, parent, conditional, roots);
			break;
		case 'ParenthesizedExpression':
			readJsxExpression(expression.expression, parent, flags, roots);
			break;
		case 'CallExpression': {
			const found = [];
			collectJsx(expression, found);
			if (found.length === 0) appendUnknown(parent, expression.start);
			for (const { node } of found) {
				readJsxNode(node, parent, { ...flags, repeated: true }, roots);
			}
			break;
		}
		case 'Identifier':
			// `{items}`: whatever the file bound to that name renders here.
			appendUnknown(parent, expression.start).ref = expression.name;
			break;
		default:
			appendUnknown(parent, expression.start);
	}
}

function readJsxChildren(children, parent, flags, roots) {
	for (const child of children) {
		if (child.type === 'JSXText' && child.value.trim()) parent.text = true;
		if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
			readJsxNode(child, parent, flags, roots);
		} else if (child.type === 'JSXExpressionContainer') {
			readJsxExpression(child.expression, parent, flags, roots);
		} else if (child.type === 'JSXSpreadChild') {
			appendUnknown(parent, child.start);
		}
	}
}

/** What the parser of JSX says about the start tag, in the shape the HTML parsers give. */
function jsxStartTag(opening) {
	const attributes = opening.attributes
		.filter((attribute) => attribute.type === 'JSXAttribute')
		.map((attribute) => {
			const { value } = attribute;
			const quote = !value ? undefined : value.type === 'Literal' ? (value.raw?.[0] ?? '"') : '{';
			return {
				name: jsxName(attribute.name),
				prefix: '',
				start: attribute.start,
				end: attribute.end,
				nameStart: attribute.name.start,
				nameEnd: attribute.name.end,
				value: value ? { start: value.start, end: value.end, quote } : undefined,
			};
		});
	return { end: opening.end - 1, selfClosing: opening.selfClosing, attributes };
}

function readJsxNode(node, parent, flags, roots) {
	if (node.type === 'JSXFragment') {
		readJsxChildren(node.children, parent, flags, roots);
		return;
	}
	const name = jsxName(node.openingElement.name);
	if (TRANSPARENT.has(name)) {
		readJsxChildren(node.children, parent, flags, roots);
		return;
	}
	const element = createNode(name, node.start);
	element.endOffset = node.end - 1;
	element.conditional = Boolean(flags.conditional);
	element.repeated = Boolean(flags.repeated);
	element.opaque = isOpaqueTag(name);
	element.startTag = jsxStartTag(node.openingElement);
	readJsxAttributes(element, node.openingElement.attributes, roots);
	appendChild(parent, element);
	readJsxChildren(node.children, element, {}, roots);
}

function jsxTree(node, roots, detached = true) {
	const root = createRoot();
	if (detached) root.detached = true;
	readJsxNode(node, root, {}, roots);
	return root;
}

let oxcParser;

/** The JSX parser, an optional dependency: without it a file with JSX cannot be read, and the run says why. */
async function loadOxc(filename) {
	oxcParser ??= await import('oxc-parser').catch(() => {
		throw new Error(`Reading ${filename} needs the optional dependency oxc-parser, which needs Node 20.19 or newer.`);
	});
}

export async function parseJsx(source, filename) {
	await loadOxc(filename);
	// A .js file takes JSX only when asked: React apps write it there too.
	const options = /\.[cm]?js$/.test(filename) ? { lang: 'jsx' } : {};
	const { program, errors } = oxcParser.parseSync(filename, source, options);
	const found = [];
	collectJsx(program, found, {}, exportedNamesOf(program));
	const bindings = bindingCounts(program);
	const roots = [];
	const owners = new Map();
	for (const { node, detached, owner } of found) {
		const root = jsxTree(node, roots, detached);
		roots.push(root);
		// A name bound more than once (a parameter that shadows it, two components with
		// the same local) might be the other one where it is used: then it stays unknown.
		if (detached && owner && bindings.get(owner) === 1) owners.set(root, owner);
	}
	placeDetachedRoots(roots, owners);
	if (errors?.length) {
		roots.syntaxError = { message: errors[0].message, offset: errors[0].labels?.[0]?.start ?? 0 };
	}
	return roots;
}

/**
 * A tree bound to a name lands where this file uses that name: `<Row />` for a
 * component, `{items}` for a value. Those places tell what is around it, so a
 * rule can judge its plain HTML. Used nowhere in the file, it stays unknown.
 */
function placeDetachedRoots(roots, owners) {
	if (owners.size === 0) return;
	const uses = new Map();
	for (const root of roots) {
		walk(root, (node) => {
			const name = node.ref ?? (node.opaque ? node.name : undefined);
			if (name) uses.set(name, [...(uses.get(name) ?? []), node]);
		});
	}
	for (const [root, owner] of owners) {
		const places = uses.get(owner);
		if (places?.length) root.placements = places;
	}
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
	return parser === parseLit || parser === parseScript ? 'templates' : 'markup';
}

/** @returns {Promise<import('./tree.js').TreeNode[]>} */
export async function parseSource(source, filename) {
	const extension = filename.slice(filename.lastIndexOf('.'));
	const parser = PARSERS[extension];
	return parser ? parser(source, filename) : [];
}
