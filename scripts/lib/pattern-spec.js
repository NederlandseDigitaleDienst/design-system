/**
 * The structured part of a pattern: its composition, in <slug>.pattern.yaml.
 *
 * The tree on a pattern page used to be hand-drawn, so nothing noticed when a
 * component was renamed or when the example stopped matching it. As data it is
 * drawn from one source and checked against the components and the example.
 *
 * A node is a component (`tag`) or something the app chooses (`label`):
 *
 *   tag        the element
 *   label      a place in the tree that is no single element
 *   attrs      attributes worth naming here; `name="value"` shows a fixed value
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
	for (const root of nodes) {
		lines.push({ start: root.tag ?? root.label, detail: detailOf(root) });
		collectLines(root.children ?? [], '  ', Boolean(root.flat), lines);
	}
	const column = Math.max(...lines.filter(({ detail }) => detail).map(({ start }) => start.length)) + 2;
	return lines.map(({ start, detail }) => (detail ? start.padEnd(column) + detail : start)).join('\n');
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

	const visit = (node, parent) => {
		if (Boolean(node.tag) === Boolean(node.label)) problems.push(`A node needs a tag or a label: ${JSON.stringify(node)}`);
		for (const tag of node['any-of'] ?? []) {
			if (!tags[tag]) problems.push(`any-of names ${tag}, which does not exist.`);
		}
		const owner = node.tag ?? parent;
		if (node.tag && !tags[node.tag]) problems.push(`Names ${node.tag}, which does not exist.`);
		else if (node.tag) {
			const known = [...Object.keys(tags[node.tag].attrs), ...Object.keys(tags[parent]?.childAttrs ?? {})];
			for (const attribute of [...(node.attrs ?? []), ...(node['one-of'] ?? [])]) {
				const name = attributeName(attribute);
				if (!known.includes(name) && !GLOBAL_ATTRIBUTES.has(name)) problems.push(`${node.tag} has no attribute ${name}.`);
			}
			const shown = elements.filter((element) => element.name === node.tag);
			if (shown.length === 0) problems.push(`No example shows ${node.tag}.`);
			const needed = requiredTags(node.children ?? []);
			for (const element of shown) {
				const inside = new Set(descendants(element).map(({ name }) => name));
				for (const tag of needed) {
					if (!inside.has(tag)) problems.push(`An example has ${node.tag} without ${tag}.`);
				}
			}
		}
		for (const child of node.children ?? []) visit(child, owner);
	};
	for (const root of nodes) visit(root);
	return [...new Set(problems)];
}
