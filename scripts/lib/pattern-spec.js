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
 * nodes in the tree and through plain elements such as `form` in the markup. A
 * tag without `slot` means the default slot. Every element belongs to one
 * sibling: the most specific node that fits it.
 *
 * `partial` on the spec maps an example that shows only a part of the pattern
 * to what it leaves out. Everything else stays required in that example.
 *
 * No Node imports here: Storybook draws the tree with this file too.
 */

import { walk } from '../../lint/tree.js';

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
const fixedValues = (node) => (node.attrs ?? []).filter((attribute) => attribute.includes('='));

/**
 * A node with `name="value"` in its attrs is only the elements with that value.
 * @param {boolean} anySlot the level is already inside a slot, or has no parent
 */
function matches(element, node, anySlot) {
	if (element.name !== node.tag && !node.or?.includes(element.name)) return false;
	if (node.slot ? !isSlotted(element, node) : !anySlot && element.attrs.has('slot')) return false;
	return fixedValues(node).every((attribute) => {
		const [name, ...value] = attribute.split('=');
		return element.attrs.get(name) === value.join('=').replace(/^"|"$/g, '');
	});
}

function descendants(element) {
	const found = [];
	walk(element, (node) => found.push(node));
	return found;
}

/** The elements directly inside one. A plain element is no level, unless it fills a slot. */
function direct(element) {
	return element.children.flatMap((child) => (child.name.startsWith('nldd-') || child.attrs.has('slot') ? [child] : direct(child)));
}

/** What a slot node holds: the elements in that slot, and what a wrapper there holds. */
function slotted(level, node) {
	const inSlot = level.filter((element) => isSlotted(element, node));
	return [...inSlot, ...inSlot.flatMap(direct)];
}

/** The nodes at one level of the tree: a `label` is no level. */
function siblings(nodes) {
	return nodes.flatMap((node) => (node.label ? [node, ...siblings(node.children ?? [])] : [node]));
}

/** The required nodes that are not there, as what the tree calls them. */
function missing(level, nodes, anySlot) {
	const tagged = siblings(nodes).filter((node) => node.tag);
	return siblings(nodes).flatMap((node) => {
		if (node.optional) return [];
		if (node.tag) return level.some((element) => matches(element, node, anySlot)) ? [] : [startOf(node)];
		if (node.slot) {
			const inside = slotted(level, node);
			if (inside.length === 0) return [startOf(node)];
			return missing(inside, node.children ?? [], true);
		}
		if (!node['any-of']) return [];
		const free = level.some((element) => element.name.startsWith('nldd-') && !tagged.some((other) => matches(element, other, anySlot)));
		return free ? [] : [startOf(node)];
	});
}

/** Gives every element to one sibling: the most specific that fits it, and then the emptiest. */
function assign(nodes, level, anySlot) {
	const claimed = new Map(nodes.map((node) => [node, []]));
	const specificity = (node) => fixedValues(node).length + (node.slot ? 1 : 0);
	for (const element of level) {
		const fitting = nodes.filter((node) => matches(element, node, anySlot));
		if (fitting.length === 0) continue;
		const top = Math.max(...fitting.map(specificity));
		const best = fitting.filter((node) => specificity(node) === top);
		const fit = best.filter((node) => missing(direct(element), node.children ?? [], false).length === 0);
		const [chosen] = (fit.length > 0 ? fit : best).toSorted((a, b) => claimed.get(a).length - claimed.get(b).length);
		claimed.get(chosen).push(element);
	}
	return claimed;
}

/**
 * @param {object[]} nodes the composition
 * @param {object} context
 * @param {Record<string, { attrs: object, childAttrs: object, slots: string[], anySlot?: boolean }>} context.tags the components
 * @param {{ file: string, roots: object[] }[]} context.examples the examples of the pattern
 * @param {Record<string, string[]>} [context.partial] per example, what it leaves out
 * @returns {string[]} what does not hold
 */
export function checkComposition(nodes, { tags, examples, partial = {} }) {
	const problems = [];
	const fileOf = new Map();
	const inExample = examples.map(({ file, roots }) => {
		const found = roots.flatMap(descendants);
		for (const element of found) fileOf.set(element, file);
		return { file, found };
	});
	const elements = inExample.flatMap(({ found }) => found);
	const allowed = (file, name) => partial[file]?.includes(name);

	for (const file of Object.keys(partial)) {
		if (!examples.some((example) => example.file === file)) problems.push(`partial names ${file}, which is no example.`);
	}
	for (const { file, found } of inExample) {
		for (const name of missing(found, nodes, true)) {
			if (!allowed(file, name)) problems.push(`${file}: misses ${name}.`);
		}
	}

	/** @param {string[]} parents every tag this has to hold for; `some` when any of them will do */
	const checkSlots = (node, parents, some) => {
		for (const slot of slotsOf(node)) {
			const holds = (parent) => !tags[parent] || tags[parent].anySlot || tags[parent].slots?.includes(slot);
			if (!(some ? parents.some(holds) : parents.every(holds))) problems.push(`${parents.join(', ')} has no slot ${slot}.`);
		}
	};

	const checkAttributes = (tag, node, parents) => {
		const known = [...Object.keys(tags[tag].attrs), ...parents.flatMap((parent) => Object.keys(tags[parent]?.childAttrs ?? {}))];
		for (const attribute of [...(node.attrs ?? []), ...(node['one-of'] ?? [])]) {
			const name = attributeName(attribute);
			if (!known.includes(name)) problems.push(`${tag} has no attribute ${name}.`);
		}
	};

	const checkElement = (element, node) => {
		const file = fileOf.get(element);
		const set = (node['one-of'] ?? []).filter((attribute) => element.attrs.has(attribute));
		if (set.length > 1) problems.push(`${file}: ${element.name} has more than one of ${set.join(', ')}.`);
		for (const name of missing(direct(element), node.children ?? [], false)) {
			if (!allowed(file, name)) problems.push(`${file}: ${element.name} without ${name}.`);
		}
	};

	const inside = (parents) => (parents.length > 0 ? ` inside ${parents.join(', ')}` : '');

	/**
	 * @param {object[]} level the elements these nodes can be
	 * @param {string[]} parents the tags around them
	 * @param {boolean} anySlot see matches()
	 * @param {boolean} some the parents are what examples put in a slot, not what the tree names
	 */
	const visitLevel = (group, level, parents, anySlot, some) => {
		const claimed = assign(siblings(group).filter((node) => node.tag), level, anySlot);
		for (const node of group) {
			checkSlots(node, parents, some);
			for (const tag of node['any-of'] ?? []) {
				if (!tags[tag]) problems.push(`any-of names ${tag}, which does not exist.`);
			}
			if (node.tag) {
				const names = [node.tag, ...(node.or ?? [])];
				const unknown = names.filter((tag) => !tags[tag]);
				for (const tag of unknown) problems.push(`Names ${tag}, which does not exist.`);
				if (unknown.length > 0) continue;
				for (const tag of names) checkAttributes(tag, node, parents);
				const shown = claimed.get(node);
				if (shown.length === 0) problems.push(`No example shows ${startOf(node)}${inside(parents)}.`);
				for (const element of shown) checkElement(element, node);
				visitLevel(node.children ?? [], shown.flatMap(direct), names, false, false);
				continue;
			}
			const held = node.slot ? slotted(level, node) : level;
			if (node.slot && held.length === 0) problems.push(`No example shows ${startOf(node)}${inside(parents)}.`);
			if (node['any-of'] && !held.some(({ name }) => node['any-of'].includes(name))) {
				problems.push(`No example shows any of ${node['any-of'].join(', ')}${inside(parents)}.`);
			}
			if (node.slot) {
				const filling = [...new Set(held.filter((element) => isSlotted(element, node)).map(({ name }) => name))];
				visitLevel(node.children ?? [], held, filling.length > 0 ? filling : parents, true, filling.length > 0);
			} else {
				visitLevel(node.children ?? [], held, parents, anySlot, some);
			}
		}
	};
	visitLevel(nodes, elements, [], true, false);
	return [...new Set(problems)];
}
