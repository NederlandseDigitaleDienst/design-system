/**
 * Turns source files into normalised trees. One function per template language;
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
	'Fragment',
	'React.Fragment',
	'ng-container',
]);

const CONDITIONAL = new Set(['v-if', 'v-else', 'v-else-if', 'v-show', '*ngIf']);
const REPEATED = new Set(['v-for', '*ngFor']);

/** Anything else cannot be an attribute, so a template language is writing into the tag. */
const PLAIN_ATTRIBUTE = /^[a-zA-Z_][\w:.-]*$/;

function readAttribute(element, name, value) {
	if (CONDITIONAL.has(name)) element.conditional = true;
	else if (REPEATED.has(name)) element.repeated = true;
	else if (name === 'v-bind') element.spread = true;
	else if (name === 'v-model') element.attrs.set('value', BOUND);
	else if (name.startsWith('v-model:')) element.attrs.set(name.slice(8), BOUND);
	else if (name.startsWith(':') || name.startsWith('v-bind:') || name.startsWith('.')) {
		const bare = name.replace(/^(v-bind)?[:.]/, '').replace(/\.(prop|attr|camel)$/, '');
		element.attrs.set(bare, BOUND);
	} else if (/^\[.+\]$/.test(name)) {
		element.attrs.set(name.slice(1, -1).replace(/^attr\./, ''), BOUND);
	} else if (/^(@|#|v-|\(|\*)/.test(name)) {
		// Listeners, directives and template references add no attribute.
	} else if (!PLAIN_ATTRIBUTE.test(name)) element.spread = true;
	else element.attrs.set(name, value.includes('{{') ? BOUND : value);
}

function hasSlotName(attribs) {
	return Object.keys(attribs).some((name) => name.startsWith('#') || name.startsWith('v-slot'));
}

function readHtmlChildren(children, parent, inherited) {
	for (const node of children) {
		if (node.type !== 'tag') continue;
		const { name, attribs } = node;
		const isWrapper = (name === 'template' && !hasSlotName(attribs)) || TRANSPARENT.has(name);
		if (isWrapper) {
			readHtmlChildren(node.children, parent, {
				conditional:
					inherited.conditional || Object.keys(attribs).some((key) => CONDITIONAL.has(key)),
				repeated: inherited.repeated || Object.keys(attribs).some((key) => REPEATED.has(key)),
			});
			continue;
		}
		const element = createNode(name, node.startIndex ?? 0);
		for (const [key, value] of Object.entries(attribs)) readAttribute(element, key, value);
		element.conditional ||= inherited.conditional;
		element.repeated ||= inherited.repeated;
		element.opaque = isOpaqueTag(name) || name === 'template';
		appendChild(parent, element);
		readHtmlChildren(node.children, element, { conditional: false, repeated: false });
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

export function parseHtml(source) {
	const root = createRoot({ closed: /<html[\s>]/i.test(source) });
	readHtmlChildren(parseMarkup(source, { selfClosing: false }).children, root, {});
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

/** Every fenced html/vue block in a Markdown file is a tree of its own. */
export function parseMarkdown(source) {
	const roots = [];
	for (const match of source.matchAll(/^```(html|vue)[^\n]*\n([\s\S]*?)^```/gm)) {
		const offset = match.index + match[0].indexOf('\n') + 1;
		const padded = ' '.repeat(offset) + match[2];
		roots.push(...parseHtml(padded).map((root) => ((root.opaque = true), root)));
	}
	return roots;
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

function staticJsxValue(value) {
	if (value === null) return '';
	if (value.type === 'Literal') return String(value.value);
	if (value.type !== 'JSXExpressionContainer') return BOUND;
	const { expression } = value;
	if (expression.type === 'Literal') return String(expression.value);
	if (expression.type === 'TemplateLiteral' && expression.expressions.length === 0) {
		return expression.quasis[0].value.cooked;
	}
	return BOUND;
}

function readJsxAttributes(element, attributes, roots) {
	for (const attribute of attributes) {
		if (attribute.type === 'JSXSpreadAttribute') {
			element.spread = true;
			continue;
		}
		const name = jsxName(attribute.name);
		const isHandler = /^on[A-Z]/.test(name) || name === 'key' || name === 'ref';
		if (!isHandler) {
			element.attrs.set(name === 'className' ? 'class' : name, staticJsxValue(attribute.value));
		}
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
			readJsxExpression(expression.left, parent, conditional, roots);
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
	'.vue': parseVue,
	'.md': parseMarkdown,
	'.jsx': parseJsx,
	'.tsx': parseJsx,
};

export const SUPPORTED_EXTENSIONS = Object.keys(PARSERS);

/** @returns {Promise<import('./tree.js').TreeNode[]>} */
export async function parseSource(source, filename) {
	const extension = filename.slice(filename.lastIndexOf('.'));
	const parser = PARSERS[extension];
	return parser ? parser(source, filename) : [];
}
