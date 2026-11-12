/**
 * Turns source files into normalized trees. One function per template language;
 * rules never see the difference.
 *
 * Bound attributes keep their name and lose their value, so `:selected` on a tab
 * is still seen as `selected`. Wrappers that add nothing to the DOM disappear, or
 * `nldd-list > template[v-for] > nldd-list-item` would break every child selector.
 */

import { parseDocument } from 'htmlparser2';
import { cssBlocks } from './css.js';
import {
	BOUND,
	appendChild,
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
		if (node.type === 'text' && node.data.trim()) parent.text = true;
		// htmlparser2 gives <style> a type of its own. The group pure reads every block in it.
		if (node.type === 'style') {
			for (const block of styleBlocks(node)) appendChild(parent, styleNode(block));
			continue;
		}
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
			});
			continue;
		}
		const element = createNode(name, node.startIndex ?? 0);
		element.endOffset = node.endIndex ?? undefined;
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
		withEndIndices: true,
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
	readHtmlChildren(parseMarkup(quietIfTemplated(source), { selfClosing: ANGULAR.test(source) }).children, root, { inert: true });
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

/** Every code block and inline tag in a Markdown file is a tree of its own. */
export function parseMarkdown(source) {
	const roots = [];
	const read = (text, offset) => {
		const root = createRoot();
		const padded = ' '.repeat(offset) + quietIfTemplated(text);
		readHtmlChildren(parseMarkup(padded, { selfClosing: true }).children, root, {});
		roots.push(root);
	};
	const fences = /^( *)```[^\n]*\n([\s\S]*?)^ *```/gm;
	for (const match of source.matchAll(fences)) {
		if (match[2].includes('<nldd-')) read(match[2], match.index + match[0].indexOf('\n') + 1);
	}
	const prose = source.replace(fences, (block) => ' '.repeat(block.length));
	// A bare `<nldd-button>` in a sentence names the tag and says nothing about its attributes.
	for (const match of prose.matchAll(/`(<nldd-[^`\n]*)`/g)) {
		read(match[1].replace(/^<([a-z-]+)\s*\/?>$/, '<$1 v-bind="x"><Mention /></$1>'), match.index + 1);
	}
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

export async function parseJsx(source, filename) {
	oxcParser ??= await import('oxc-parser').catch(() => {
		throw new Error(`Reading ${filename} needs the optional dependency oxc-parser, which needs Node 20.19 or newer.`);
	});
	const { program, errors } = oxcParser.parseSync(filename, source);
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
	'.md': parseMarkdown,
	'.jsx': parseJsx,
	'.tsx': parseJsx,
	'.ts': parseLit,
	'.js': parseLit,
	'.mjs': parseLit,
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
	return parser === parseLit ? 'templates' : 'markup';
}

/** @returns {Promise<import('./tree.js').TreeNode[]>} */
export async function parseSource(source, filename) {
	const extension = filename.slice(filename.lastIndexOf('.'));
	const parser = PARSERS[extension];
	return parser ? parser(source, filename) : [];
}
