/**
 * The structured part of a pattern: its composition, in <slug>.pattern.yaml.
 *
 * The tree on a pattern page used to be hand-drawn, so nothing noticed when a
 * component was renamed or when the example stopped matching it. As data it is
 * drawn from one source and checked against the components and the example.
 *
 * src/patterns/pattern.schema.json holds the shape of the file. A node is a
 * component (`tag`) or something the app chooses (`label`):
 *
 *   tag        the element
 *   label      a place in the tree that is no single element
 *   attrs      attributes worth naming here; `name="value"` is a fixed value, and
 *              the node then only means elements with that value
 *   one-of     attributes of which at most one applies
 *   any-of     tags that can fill a `label`; the list is never complete
 *   note       what the node is for, in a few words
 *   optional   the pattern also holds without it
 *   flat       children are a sequence, drawn without tree lines
 *   children   the nodes inside it
 *
 * No Node imports here: Storybook draws the tree with this file too.
 */

const GLOBAL_ATTRIBUTES = new Set(['id', 'class', 'slot', 'hidden', 'role', 'lang', 'type', 'name']);

const attributeName = (attribute) => attribute.split('=')[0];

function detailOf(node) {
	const parts = [];
	if (node.attrs) parts.push(node.attrs.join(', '));
	if (node['one-of']) parts.push(`en hoogstens één van ${node['one-of'].join(', ')}`);
	const named = parts.join(', ');
	const anyOf = node['any-of'] ? `${node['any-of'].join(', ')}, …` : '';
	return [named, anyOf, node.note].filter(Boolean).join('; ');
}

function collectLines(nodes, prefix, flat, lines) {
	nodes.forEach((node, index) => {
		const last = index === nodes.length - 1;
		const branch = flat ? '' : last ? '└─ ' : '├─ ';
		const rest = flat ? '' : last ? '     ' : '│    ';
		lines.push({ start: `${prefix}${branch}${node.tag ?? node.label}`, detail: detailOf(node) });
		collectLines(node.children ?? [], prefix + rest, Boolean(node.flat), lines);
	});
}

/** @returns {string} the composition as a text tree, with the details in one column */
export function renderComposition(nodes) {
	const lines = [];
	for (const [index, root] of nodes.entries()) {
		if (index > 0) lines.push({ start: '', detail: '' });
		lines.push({ start: root.tag ?? root.label, detail: detailOf(root) });
		collectLines(root.children ?? [], '  ', Boolean(root.flat), lines);
	}
	const column = Math.max(...lines.filter(({ detail }) => detail).map(({ start }) => start.length)) + 2;
	return lines.map(({ start, detail }) => (detail ? start.padEnd(column) + detail : start)).join('\n');
}

/** A node with `name="value"` in its attrs is only the elements with that value. */
function matches(element, node) {
	if (element.name !== node.tag) return false;
	return (node.attrs ?? []).filter((attribute) => attribute.includes('=')).every((attribute) => {
		const [name, ...value] = attribute.split('=');
		return element.attrs.get(name) === value.join('=').replace(/^"|"$/g, '');
	});
}

function descendants(element) {
	return element.children.flatMap((child) => [child, ...descendants(child)]);
}

/** The tags a parent needs, through any `label` in between. */
function requiredTags(nodes) {
	return nodes.flatMap((node) => {
		if (node.optional) return [];
		return node.tag ? [node.tag] : requiredTags(node.children ?? []);
	});
}

/**
 * @param {object[]} nodes the composition
 * @param {object} context
 * @param {Record<string, { attrs: object, childAttrs: object }>} context.tags the components
 * @param {object[]} context.examples element roots, one per example of the pattern
 * @returns {string[]} what does not hold
 */
export function checkComposition(nodes, { tags, examples }) {
	const problems = [];
	const elements = examples.flatMap((root) => descendants(root));

	/** A node only looks inside what its parent matched, so a second nldd-page elsewhere is not its business. */
	const visit = (node, parent, scope) => {
		const pool = scope ?? elements;
		for (const tag of node['any-of'] ?? []) {
			if (!tags[tag]) problems.push(`any-of names ${tag}, which does not exist.`);
		}
		if (parent && node['any-of'] && !pool.some(({ name }) => node['any-of'].includes(name))) {
			problems.push(`No example shows any of ${node['any-of'].join(', ')} inside ${parent}.`);
		}
		const owner = node.tag ?? parent;
		let inner = pool;
		if (node.tag && !tags[node.tag]) problems.push(`Names ${node.tag}, which does not exist.`);
		else if (node.tag) {
			const known = [...Object.keys(tags[node.tag].attrs), ...Object.keys(tags[parent]?.childAttrs ?? {})];
			for (const attribute of [...(node.attrs ?? []), ...(node['one-of'] ?? [])]) {
				const name = attributeName(attribute);
				if (!known.includes(name) && !GLOBAL_ATTRIBUTES.has(name)) problems.push(`${node.tag} has no attribute ${name}.`);
			}
			const shown = pool.filter((element) => matches(element, node));
			if (shown.length === 0) {
				const elsewhere = parent && elements.some((element) => matches(element, node));
				problems.push(elsewhere ? `No example shows ${node.tag} inside ${parent}.` : `No example shows ${node.tag}.`);
			}
			const needed = requiredTags(node.children ?? []);
			for (const element of shown) {
				const inside = new Set(descendants(element).map(({ name }) => name));
				for (const tag of needed) {
					if (!inside.has(tag)) problems.push(`An example has ${node.tag} without ${tag}.`);
				}
			}
			inner = shown.flatMap((element) => descendants(element));
		}
		for (const child of node.children ?? []) visit(child, owner, inner);
	};
	for (const root of nodes) visit(root);
	return [...new Set(problems)];
}
