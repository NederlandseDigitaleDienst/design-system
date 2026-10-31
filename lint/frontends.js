/**
 * Turns source files into normalized trees. One function per template language;
 * rules never see the difference.
 *
 * Bound attributes keep their name and lose their value, so `:selected` on a tab
 * is still seen as `selected`. Wrappers that add nothing to the DOM disappear, or
 * `nldd-list > template[v-for] > nldd-list-item` would break every child selector.
 */

import { parseDocument } from 'htmlparser2';
import {
	BOUND,
	appendChild,
	appendUnknown,
	createNode,
	createRoot,
	isOpaqueTag,
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

/** Jinja, Django, Handlebars and Angular control flow, written between the tags. */
const TEMPLATE_TEXT = /\{%|\{\{|@(if|else|for|switch|defer)\b/;

/** Angular markup in an .html file, where `<nldd-x />` does close the element. */
const ANGULAR = /\*ng[A-Z]|\[\(|\s\[[a-zA-Z.]+\]=|@(if|for|switch)\s*\(/;

/** Anything else cannot be an attribute, so a template language is writing into the tag. */
const PLAIN_ATTRIBUTE = /^[a-zA-Z_][\w:.-]*$/;

function readAttribute(element, name, value) {
	if (CONDITIONAL.has(name)) element.conditional = true;
	else if (REPEATED.has(name)) element.repeated = true;
	else if (name === 'v-show') element.toggled = true;
	else if (name === 'v-bind' || /^(v-bind)?:\[/.test(name)) element.spread = true;
	else if (name === 'v-model') element.attrs.set('value', BOUND);
	else if (name.startsWith('v-model:')) element.attrs.set(name.slice(8), BOUND);
	else if (/^(:|v-bind:|\.|\?)/.test(name)) {
		const bare = name.replace(/^(v-bind)?[:.?]/, '').replace(/\.(prop|attr|camel)$/, '');
		element.attrs.set(bare, BOUND);
	} else if (/^\[(class\.|style\.|@)/.test(name)) {
		// Angular's way to set one class, one style or an animation: no attribute.
	} else if (/^\[.+\]$/.test(name)) {
		element.attrs.set(name.replace(/^\[\(?|\)?\]$/g, '').replace(/^attr\./, ''), BOUND);
	} else if (/^(@|#|v-|\(|\*)/.test(name)) {
		// Listeners, directives and template references add no attribute.
	} else if (!PLAIN_ATTRIBUTE.test(name)) {
		element.spread = true;
		element.templated = true;
	} else element.attrs.set(name, TEMPLATE_VALUE.test(value) ? BOUND : value);
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
	for (const node of children) {
		if (node.type !== 'tag') continue;
		const { name, attribs } = node;
		// In a document, a template is inert until something stamps it out, here or elsewhere.
		if (name === 'template' && inherited.inert) {
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
			});
			continue;
		}
		const element = createNode(name, node.startIndex ?? 0);
		for (const [key, value] of Object.entries(attribs)) readAttribute(element, key, value);
		element.conditional ||= inherited.conditional;
		element.repeated ||= inherited.repeated;
		element.opaque = isOpaqueTag(name) || name === 'template';
		appendChild(parent, element);
		readHtmlChildren(node.children, element, { inert: inherited.inert, lit: inherited.lit });
	}
}

function parseMarkup(source, { selfClosing }) {
	return parseDocument(source, {
		lowerCaseTags: false,
		lowerCaseAttributeNames: false,
		recognizeSelfClosing: selfClosing,
		withStartIndices: true,
	});
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
	const text = source.replace(/\{#[\s\S]*?#\}/g, blank);
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

export function parseHtml(source) {
	const root = createRoot({ closed: /<html[\s>]/i.test(source) });
	const text = /\{[%{#]/.test(source) ? quietTemplateTags(source) : source;
	readHtmlChildren(parseMarkup(text, { selfClosing: ANGULAR.test(source) }).children, root, { inert: true });
	return [root];
}

export function parseVue(source) {
	const documentNode = parseMarkup(source, { selfClosing: true });
	const template = documentNode.children.find(
		(node) => node.type === 'tag' && node.name === 'template',
	);
	if (!template) return [];
	const root = createRoot();
	readHtmlChildren(template.children, root, {});
	return [root];
}

/** Every code block and inline tag in a Markdown file is a tree of its own. */
export function parseMarkdown(source) {
	const roots = [];
	const read = (text, offset) => {
		const root = createRoot();
		const padded = ' '.repeat(offset) + text;
		readHtmlChildren(parseMarkup(padded, { selfClosing: true }).children, root, {});
		roots.push(root);
	};
	const fences = /^( *)```[^\n]*\n([\s\S]*?)^ *```/gm;
	for (const match of source.matchAll(fences)) {
		if (match[2].includes('<nldd-')) read(match[2], match.index + match[0].indexOf('\n') + 1);
	}
	const prose = source.replace(fences, (block) => ' '.repeat(block.length));
	for (const match of prose.matchAll(/`(<nldd-[^`\n]*)`/g)) read(match[1], match.index + 1);
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

function jsxName(node) {
	if (node.type === 'JSXIdentifier') return node.name;
	if (node.type === 'JSXMemberExpression') return `${jsxName(node.object)}.${node.property.name}`;
	return `${node.namespace.name}:${node.name.name}`;
}

function collectJsx(node, found) {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node)) {
		for (const item of node) collectJsx(item, found);
	} else if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
		found.push(node);
	} else {
		for (const key of Object.keys(node)) collectJsx(node[key], found);
	}
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
		const value = staticJsxValue(attribute.value);
		if (!isHandler && value !== undefined) element.attrs.set(name === 'className' ? 'class' : name, value);
		// An element passed as a prop renders elsewhere, so it is a tree of its own.
		const nested = [];
		collectJsx(attribute.value, nested);
		for (const node of nested) roots.push(jsxTree(node, roots));
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
		case 'Literal':
		case 'TemplateLiteral':
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
			for (const node of found) {
				readJsxNode(node, parent, { ...flags, repeated: true }, roots);
			}
			break;
		}
		default:
			appendUnknown(parent, expression.start);
	}
}

function readJsxChildren(children, parent, flags, roots) {
	for (const child of children) {
		if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
			readJsxNode(child, parent, flags, roots);
		} else if (child.type === 'JSXExpressionContainer') {
			readJsxExpression(child.expression, parent, flags, roots);
		} else if (child.type === 'JSXSpreadChild') {
			appendUnknown(parent, child.start);
		}
	}
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
	element.conditional = Boolean(flags.conditional);
	element.repeated = Boolean(flags.repeated);
	element.opaque = isOpaqueTag(name);
	readJsxAttributes(element, node.openingElement.attributes, roots);
	appendChild(parent, element);
	readJsxChildren(node.children, element, {}, roots);
}

function jsxTree(node, roots) {
	const root = createRoot();
	readJsxNode(node, root, {}, roots);
	return root;
}

let oxcParser;

export async function parseJsx(source, filename) {
	oxcParser ??= await import('oxc-parser').catch(() => {
		throw new Error(`Reading ${filename} needs the optional dependency oxc-parser.`);
	});
	const { program } = oxcParser.parseSync(filename, source);
	const found = [];
	collectJsx(program, found);
	const roots = [];
	for (const node of found) roots.push(jsxTree(node, roots));
	return roots;
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
	'.jinja': parseHtml,
	'.jinja2': parseHtml,
	'.vue': parseVue,
	'.md': parseMarkdown,
	'.jsx': parseJsx,
	'.tsx': parseJsx,
	'.ts': parseLit,
};

/** @returns {Promise<import('./tree.js').TreeNode[]>} */
export async function parseSource(source, filename) {
	const extension = filename.slice(filename.lastIndexOf('.'));
	const parser = PARSERS[extension];
	return parser ? parser(source, filename) : [];
}
