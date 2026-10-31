/**
 * The normalized element tree every frontend produces and the engine reads.
 *
 * A template is not a document. Part of what ends up in the DOM is unknown when
 * reading the source: a bound value, a spread, a child component. The tree
 * records that instead of guessing, so a rule can tell "wrong" from "unknown".
 */

/** Marks an attribute whose value only exists at runtime. */
export const BOUND = Symbol('bound');

/**
 * @typedef {object} TreeNode
 * @property {string} name
 * @property {TreeNode | null} parent
 * @property {TreeNode[]} children
 * @property {Map<string, string | typeof BOUND>} attrs
 * @property {number} offset Position in the source file.
 * @property {boolean} spread Any attribute may be set (`v-bind="o"`, `{...p}`).
 * @property {boolean} opaque Stands for content this file cannot see.
 * @property {boolean} conditional Rendered only some of the time.
 * @property {boolean} repeated Rendered any number of times.
 * @property {boolean} toggled In the DOM, but maybe not visible (`v-show`).
 * @property {boolean} wrapped A framework wrapper standing in for this tag.
 * @property {boolean} templated A template language writes into the tag itself.
 */

/** @returns {TreeNode} */
export function createNode(name, offset = 0) {
	return {
		name,
		parent: null,
		children: [],
		attrs: new Map(),
		offset,
		spread: false,
		opaque: false,
		conditional: false,
		repeated: false,
		toggled: false,
		wrapped: false,
		templated: false,
	};
}

/**
 * The root of one tree. An open root stands for whatever renders this file: a
 * component's parent is in another file, so ancestors and siblings are unknown.
 * Only a full HTML document is closed.
 */
export function createRoot({ closed = false } = {}) {
	const root = createNode('#root');
	root.opaque = !closed;
	return root;
}

export function appendChild(parent, child) {
	child.parent = parent;
	parent.children.push(child);
	return child;
}

/** Calls `visit` for every node below `root`, in document order. */
export function walk(root, visit) {
	for (const child of root.children) {
		visit(child);
		walk(child, visit);
	}
}

/** Stands in the tree for content that cannot be read here, such as `{children}`. */
export function appendUnknown(parent, offset) {
	const node = createNode('#unknown', offset);
	node.opaque = true;
	return appendChild(parent, node);
}

/**
 * Whether a tag is a component this linter has no view into: PascalCase,
 * someone else's custom element, or a framework outlet.
 */
export function isOpaqueTag(name) {
	return (
		/^[A-Z]/.test(name) ||
		name.includes('.') ||
		(name.includes('-') && !name.startsWith('nldd-')) ||
		name === 'component' ||
		name === 'teleport' ||
		name === 'slot' ||
		name === 'ng-content'
	);
}

/** css-select adapter over this tree. Nothing here depends on a DOM. */
export const adapter = {
	isTag: (node) => Boolean(node) && typeof node === 'object',
	getAttributeValue(node, name) {
		const value = node.attrs.get(name);
		return typeof value === 'string' ? value : undefined;
	},
	hasAttrib: (node, name) => typeof node.attrs.get(name) === 'string',
	getChildren: (node) => node.children,
	getName: (node) => node.name,
	getParent: (node) => node.parent,
	getSiblings: (node) => (node.parent ? node.parent.children : [node]),
	getText: () => '',
	removeSubsets: (nodes) => nodes,
	existsOne(test, nodes) {
		return nodes.some((node) => test(node) || adapter.existsOne(test, node.children));
	},
	findAll(test, nodes) {
		const found = [];
		const visit = (list) => {
			for (const node of list) {
				if (test(node)) found.push(node);
				visit(node.children);
			}
		};
		visit(nodes);
		return found;
	},
	findOne(test, nodes) {
		for (const node of nodes) {
			if (test(node)) return node;
			const match = adapter.findOne(test, node.children);
			if (match) return match;
		}
		return null;
	},
};
