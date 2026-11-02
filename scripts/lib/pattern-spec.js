/**
 * The structured part of a pattern: its composition, in <slug>.pattern.yaml.
 *
 * The tree on a pattern page used to be hand-drawn, so nothing noticed when a
 * component was renamed or when the example stopped matching it. As data it is
 * drawn from one source and checked against the components and the examples.
 *
 * src/patterns/pattern.schema.json holds the shape of the file. A node is a
 * component (`tag`), a slot of its parent (`slot`), or something the app
 * chooses (`label`):
 *
 *   tag        the element
 *   or         other tags that can take its place
 *   slot       the slot it sits in; a list means any of them
 *   label      a place in the tree that is no single element
 *   attrs      attributes worth naming here; `name="value"` is a fixed value, and
 *              the node then only means elements with that value
 *   one-of     attributes of which at most one applies
 *   any-of     tags that can fill a `label` or `slot`; the list is never complete
 *   note       what the node is for, in a few words
 *   optional   the pattern also holds without it
 *   flat       children are a sequence, drawn without tree lines
 *   children   the nodes inside it
 *
 * A child sits directly under its parent, looking through `label` and `slot`
 * nodes in the tree and through plain elements such as `form` in the markup.
 * `partial` on the spec names examples that show only a part of the pattern:
 * they may leave out what is required.
 *
 * No Node imports here: Storybook draws the tree with this file too.
 */

const attributeName = (attribute) => attribute.split('=')[0];
const slotsOf = (node) => [node.slot ?? []].flat();

function slotText(node) {
	return slotsOf(node).map((slot, index) => (index === 0 ? `slot="${slot}"` : `"${slot}"`)).join(' | ');
}

function startOf(node) {
	if (node.tag) return node.or ? `${node.tag} (of ${node.or.join(', ')})` : node.tag;
	return node.label ?? slotText(node);
}

function detailOf(node) {
	const parts = [];
	if (node.tag && node.slot) parts.push(slotText(node));
	if (node.attrs) parts.push(node.attrs.join(', '));
	if (node['one-of']) parts.push(`en hoogstens één van ${node['one-of'].join(', ')}`);
	const named = parts.join(', ');
	const anyOf = node['any-of'] ? `${node['any-of'].join(', ')}, …` : '';
	return [named, anyOf, node.note, node.optional && 'optioneel'].filter(Boolean).join('; ');
}

function collectLines(nodes, prefix, flat, lines) {
	nodes.forEach((node, index) => {
		const last = index === nodes.length - 1;
		const branch = flat ? '' : last ? '└─ ' : '├─ ';
		const rest = flat ? '' : last ? '     ' : '│    ';
		lines.push({ start: `${prefix}${branch}${startOf(node)}`, detail: detailOf(node) });
		collectLines(node.children ?? [], prefix + rest, Boolean(node.flat), lines);
	});
}

/** @returns {string} the composition as a text tree, with the details in one column */
export function renderComposition(nodes) {
	const lines = [];
	for (const [index, root] of nodes.entries()) {
		if (index > 0) lines.push({ start: '', detail: '' });
		lines.push({ start: startOf(root), detail: detailOf(root) });
		collectLines(root.children ?? [], '  ', Boolean(root.flat), lines);
	}
	const column = Math.max(...lines.filter(({ detail }) => detail).map(({ start }) => start.length)) + 2;
	return lines.map(({ start, detail }) => (detail ? start.padEnd(column) + detail : start)).join('\n');
}

const isSlotted = (element, node) => slotsOf(node).includes(element.attrs.get('slot'));

/** A node with `name="value"` in its attrs is only the elements with that value. */
function matches(element, node) {
	if (element.name !== node.tag && !node.or?.includes(element.name)) return false;
	if (node.slot && !isSlotted(element, node)) return false;
	return (node.attrs ?? []).filter((attribute) => attribute.includes('=')).every((attribute) => {
		const [name, ...value] = attribute.split('=');
		return element.attrs.get(name) === value.join('=').replace(/^"|"$/g, '');
	});
}

function descendants(element) {
	return element.children.flatMap((child) => [child, ...descendants(child)]);
}

/** The components directly inside an element. A plain element such as `form` is no level. */
function direct(element) {
	return element.children.flatMap((child) => (child.name?.startsWith('nldd-') ? [child] : direct(child)));
}

/** What a slot node holds: the elements in that slot, and for a wrapper what is inside it. */
const slotted = (level, node) => {
	const inSlot = level.filter((element) => element.name && isSlotted(element, node));
	return [...inSlot, ...inSlot.flatMap(direct)];
};

/** The required nodes that are not there, as what the tree calls them. */
function missing(level, nodes) {
	return nodes.flatMap((node) => {
		if (node.optional) return [];
		if (node.tag) return level.some((element) => matches(element, node)) ? [] : [startOf(node)];
		if (node.slot) {
			const inside = slotted(level, node);
			if (inside.length === 0) return [startOf(node)];
			return missing(inside, node.children ?? []);
		}
		return missing(level, node.children ?? []);
	});
}

/**
 * @param {object[]} nodes the composition
 * @param {object} context
 * @param {Record<string, { attrs: object, childAttrs: object, slots: string[], anySlot?: boolean }>} context.tags the components
 * @param {{ file: string, roots: object[] }[]} context.examples the examples of the pattern
 * @param {string[]} [context.partial] files that show only a part of the pattern
 * @returns {string[]} what does not hold
 */
export function checkComposition(nodes, { tags, examples, partial = [] }) {
	const problems = [];
	const fileOf = new Map();
	const elements = examples.flatMap(({ file, roots }) => roots.flatMap((root) => {
		const found = descendants(root).filter((element) => element.name);
		for (const element of found) fileOf.set(element, file);
		return found;
	}));
	for (const file of partial) {
		if (!examples.some((example) => example.file === file)) problems.push(`partial names ${file}, which is no example.`);
	}

	const checkSlots = (node, parent) => {
		if (!parent || !tags[parent] || tags[parent].anySlot) return;
		for (const slot of slotsOf(node)) {
			if (!tags[parent].slots?.includes(slot)) problems.push(`${parent} has no slot ${slot}.`);
		}
	};

	const checkTag = (tag, node, parent) => {
		const known = [...Object.keys(tags[tag].attrs), ...Object.keys(tags[parent]?.childAttrs ?? {})];
		for (const attribute of [...(node.attrs ?? []), ...(node['one-of'] ?? [])]) {
			const name = attributeName(attribute);
			if (!known.includes(name)) problems.push(`${tag} has no attribute ${name}.`);
		}
	};

	const checkShown = (node, parent, shown) => {
		if (shown.length > 0) return;
		const elsewhere = parent && elements.some((element) => matches(element, node));
		problems.push(elsewhere ? `No example shows ${startOf(node)} directly inside ${parent}.` : `No example shows ${startOf(node)}.`);
	};

	const checkElement = (element, node) => {
		const file = fileOf.get(element);
		const set = (node['one-of'] ?? []).filter((attribute) => element.attrs.has(attribute));
		if (set.length > 1) problems.push(`${file}: ${element.name} has more than one of ${set.join(', ')}.`);
		if (partial.includes(file)) return;
		for (const name of missing(direct(element), node.children ?? [])) {
			problems.push(`${file}: ${element.name} without ${name}.`);
		}
	};

	/** @param {object[]} level the elements this node can be: under its parent, or anywhere for a root */
	const visit = (node, parent, level) => {
		checkSlots(node, parent);
		for (const tag of node['any-of'] ?? []) {
			if (!tags[tag]) problems.push(`any-of names ${tag}, which does not exist.`);
		}
		let inner = level;
		if (node.tag) {
			const names = [node.tag, ...(node.or ?? [])];
			const unknown = names.filter((tag) => !tags[tag]);
			for (const tag of unknown) problems.push(`Names ${tag}, which does not exist.`);
			if (unknown.length === 0) {
				for (const tag of names) checkTag(tag, node, parent);
				const shown = level.filter((element) => matches(element, node));
				checkShown(node, parent, shown);
				for (const element of shown) checkElement(element, node);
				inner = shown.flatMap(direct);
			}
		} else if (node.slot) {
			inner = slotted(level, node);
			if (inner.length === 0) problems.push(`No example shows ${startOf(node)}${parent ? ` inside ${parent}` : ''}.`);
		}
		if (node['any-of'] && !inner.some(({ name }) => node['any-of'].includes(name))) {
			problems.push(`No example shows any of ${node['any-of'].join(', ')}${parent ? ` inside ${parent}` : ''}.`);
		}
		for (const child of node.children ?? []) visit(child, node.tag ?? parent, inner);
	};
	for (const root of nodes) visit(root, undefined, elements);
	return [...new Set(problems)];
}
