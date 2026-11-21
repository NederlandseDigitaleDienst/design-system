/**
 * JSX, as React writes it in a `.tsx`, a `.jsx` or a `.js` file. Every tree a
 * file builds is a root: what an exported component returns is what the file
 * renders, and any other tree is placed where the file uses its name.
 *
 * `reading` goes through every function here: the roots found so far, and what
 * the types of the project say an expression renders, where someone asked.
 */

import { BOUND, TRANSPARENT, appendChild, appendUnknown, createNode, createRoot, isOpaqueTag, walk } from './tree.js';

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
export const REACT_ONLY = new Set(['key', 'ref', 'dangerouslySetInnerHTML', 'suppressHydrationWarning', 'suppressContentEditableWarning']);

function readJsxAttributes(element, attributes, reading) {
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
		for (const { node } of nested) reading.roots.push(jsxTree(node, reading, true));
	}
}

/**
 * An expression the syntax does not settle. The types of the project may: a
 * string is text, `undefined` renders nothing, and anything else stays unknown.
 * @returns the unknown child, where it stayed unknown
 */
function readUnsettled(expression, parent, reading) {
	const kind = reading.rendersAs?.(expression.start, expression.end);
	if (kind === 'text') parent.text = true;
	return kind ? undefined : appendUnknown(parent, expression.start);
}

function readJsxExpression(expression, parent, flags, reading) {
	const conditional = { ...flags, conditional: true };
	switch (expression.type) {
		case 'JSXElement':
		case 'JSXFragment':
			readJsxNode(expression, parent, flags, reading);
			break;
		case 'JSXEmptyExpression':
			break;
		case 'Literal':
			// `{true}`, `{false}` and `{null}` render nothing; a string or a number is text.
			if ((typeof expression.value === 'string' && expression.value.trim()) || typeof expression.value === 'number') parent.text = true;
			break;
		case 'TemplateLiteral':
			if (expression.expressions.length > 0 || expression.quasis.some((quasi) => (quasi.value.cooked ?? quasi.value.raw).trim())) parent.text = true;
			break;
		case 'LogicalExpression':
			// The left of `a && <x />` renders nothing worth counting.
			if (expression.operator !== '&&') readJsxExpression(expression.left, parent, conditional, reading);
			readJsxExpression(expression.right, parent, conditional, reading);
			break;
		case 'ConditionalExpression':
			readJsxExpression(expression.consequent, parent, conditional, reading);
			readJsxExpression(expression.alternate, parent, conditional, reading);
			break;
		case 'ParenthesizedExpression':
		case 'TSAsExpression':
		case 'TSSatisfiesExpression':
		case 'TSNonNullExpression':
			readJsxExpression(expression.expression, parent, flags, reading);
			break;
		case 'ChainExpression':
			// `items?.map(...)`: what it renders is there only when `items` is.
			readJsxExpression(expression.expression, parent, conditional, reading);
			break;
		case 'CallExpression': {
			const found = [];
			collectJsx(expression, found);
			if (found.length === 0) readUnsettled(expression, parent, reading);
			for (const { node } of found) {
				readJsxNode(node, parent, { ...flags, repeated: true }, reading);
			}
			break;
		}
		case 'Identifier': {
			// `{items}`: whatever the file bound to that name renders here.
			const unknown = readUnsettled(expression, parent, reading);
			if (unknown) unknown.ref = expression.name;
			break;
		}
		default:
			readUnsettled(expression, parent, reading);
	}
}

function readJsxChildren(children, parent, flags, reading) {
	for (const child of children) {
		if (child.type === 'JSXText' && child.value.trim()) parent.text = true;
		if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
			readJsxNode(child, parent, flags, reading);
		} else if (child.type === 'JSXExpressionContainer') {
			readJsxExpression(child.expression, parent, flags, reading);
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

function readJsxNode(node, parent, flags, reading) {
	if (node.type === 'JSXFragment') {
		readJsxChildren(node.children, parent, flags, reading);
		return;
	}
	const name = jsxName(node.openingElement.name);
	if (TRANSPARENT.has(name)) {
		readJsxChildren(node.children, parent, flags, reading);
		return;
	}
	const element = createNode(name, node.start);
	element.endOffset = node.end - 1;
	element.conditional = Boolean(flags.conditional);
	element.repeated = Boolean(flags.repeated);
	element.opaque = isOpaqueTag(name);
	element.startTag = jsxStartTag(node.openingElement);
	readJsxAttributes(element, node.openingElement.attributes, reading);
	appendChild(parent, element);
	readJsxChildren(node.children, element, {}, reading);
}

function jsxTree(node, reading, detached = true) {
	const root = createRoot();
	if (detached) root.detached = true;
	readJsxNode(node, root, {}, reading);
	return root;
}

let oxcParser;

/** The JSX parser, an optional dependency: without it a file with JSX cannot be read, and the run says why. */
export async function loadOxc(filename) {
	oxcParser ??= await import('oxc-parser').catch(() => {
		throw new Error(`Reading ${filename} needs the optional dependency oxc-parser, which needs Node 20.19 or newer.`);
	});
}

/**
 * @param {{ types?: (filename: string, source: string) => Function | undefined }} [options]
 *   `types` answers what an expression renders, from the types of the project
 * @returns {Promise<{ roots: object[], kind: 'jsx', syntaxError?: { message: string, offset: number } }>}
 */
export async function parseJsx(source, filename, { types } = {}) {
	await loadOxc(filename);
	// A .js file takes JSX only when asked: React apps write it there too.
	const options = /\.[cm]?js$/.test(filename) ? { lang: 'jsx' } : {};
	const { program, errors } = oxcParser.parseSync(filename, source, options);
	const found = [];
	collectJsx(program, found, {}, exportedNamesOf(program));
	const bindings = bindingCounts(program);
	const reading = { roots: [], rendersAs: types?.(filename, source) };
	const owners = new Map();
	for (const { node, detached, owner } of found) {
		const root = jsxTree(node, reading, detached);
		reading.roots.push(root);
		// A name bound more than once (a parameter that shadows it, two components with
		// the same local) might be the other one where it is used: then it stays unknown.
		if (detached && owner && bindings.get(owner) === 1) owners.set(root, owner);
	}
	placeDetachedRoots(reading.roots, owners);
	const syntaxError = errors?.length ? { message: errors[0].message, offset: errors[0].labels?.[0]?.start ?? 0 } : undefined;
	return { roots: reading.roots, kind: 'jsx', syntaxError };
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
