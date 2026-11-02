/**
 * The structured part of a pattern: its composition, in <slug>.pattern.yaml.
 *
 * The tree on a pattern page used to be hand-drawn, so nothing noticed when a
 * component was renamed or when the example stopped matching it. As data it is
 * drawn from one source and checked against the components and the examples.
 *
 * The model is RELAX NG's, written as YAML: a tree of named parts with `choice`,
 * `define` and `ref`, and an example can start at a definition. As in a grammar
 * with open content, an element no node names is left alone.
 *
 * src/patterns/pattern.schema.json holds the shape of the file. A node is a
 * component (`tag`), a slot of its parent (`slot`), alternatives (`choice`), a
 * definition (`ref`), or something the app chooses (`label`):
 *
 *   tag        the element
 *   or         other tags that can take its place
 *   slot       the slot it sits in; a list means any of them
 *   choice     nodes of which one has to be there
 *   ref        a name under `define`, here or in shared.pattern.yaml
 *   label      a place in the tree that is no single element
 *   attrs      attributes worth naming here; `name="value"` is a fixed value, and
 *              the node then only means elements with that value
 *   one-of     attributes of which at most one applies
 *   any-of     tags that can fill a `label` or `slot`; the list is never complete
 *   note       what the node is for, in a few words
 *   optional   the pattern also holds without it
 *   flat       children are a sequence in this order, drawn without tree lines
 *   children   the nodes inside it
 *
 * A child sits directly under its parent, looking through `label`, `slot` and
 * `choice` nodes in the tree and through plain elements such as `form` in the
 * markup. A tag without `slot` means the default slot. Every element belongs to
 * one node, the most specific that fits it.
 *
 * `examples` starts an example that shows only a part of the pattern at a
 * definition, instead of at the composition.
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
	if (node.choice) return 'één van';
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
		collectLines(node.children ?? node.choice ?? [], prefix + rest, Boolean(node.flat), lines);
	});
}

/** @returns {string} the composition as a text tree, with the details in one column */
export function renderComposition(nodes) {
	const lines = [];
	for (const [index, root] of nodes.entries()) {
		if (index > 0) lines.push({ start: '', detail: '' });
		lines.push({ start: startOf(root), detail: detailOf(root) });
		collectLines(root.children ?? root.choice ?? [], '  ', Boolean(root.flat), lines);
	}
	const column = Math.max(...lines.filter(({ detail }) => detail).map(({ start }) => start.length)) + 2;
	return lines.map(({ start, detail }) => (detail ? start.padEnd(column) + detail : start)).join('\n');
}

/**
 * Fills in every `ref`. A `ref` may add its own `note` and `optional`.
 * @param {object} spec a parsed <slug>.pattern.yaml
 * @param {object} [shared] the parsed shared.pattern.yaml
 * @returns {{ composition: object[], define: Record<string, object>, examples: Record<string, string> }}
 */
export function resolveSpec(spec, shared = {}) {
	const define = { ...shared.define, ...spec.define };
	const expand = (node, inShared) => {
		if (node.ref) {
			if (!define[node.ref]) throw new Error(`There is no definition ${node.ref}.`);
			const own = spec.define?.[node.ref] !== undefined;
			const target = expand(define[node.ref], inShared || !own);
			return { ...target, ...(node.note && { note: node.note }), ...(node.optional && { optional: true }) };
		}
		const copy = { ...node, origin: node };
		if (inShared) copy.shared = true;
		if (node.children) copy.children = node.children.map((child) => expand(child, inShared));
		if (node.choice) copy.choice = node.choice.map((child) => expand(child, inShared));
		return copy;
	};
	return {
		composition: spec.composition.map((node) => expand(node, false)),
		define: Object.fromEntries(Object.keys(define).map((name) => [name, expand({ ref: name }, false)])),
		examples: spec.examples ?? {},
	};
}

const isSlotted = (element, node) => slotsOf(node).includes(element.attrs.get('slot'));
const fixedValues = (node) => (node.attrs ?? []).filter((attribute) => attribute.includes('='));
const keyOf = (node) => node.origin ?? node;

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

/** The tags at one level: also what a `label` holds and what a `choice` offers. */
function tagsAt(nodes) {
	return nodes.flatMap((node) => {
		if (node.tag) return [node];
		if (node.choice) return tagsAt(node.choice);
		return node.label ? tagsAt(node.children ?? []) : [];
	});
}

/** The required nodes that are not there, as what the tree calls them. */
function missing(level, nodes, anySlot) {
	const tagged = tagsAt(nodes);
	return siblings(nodes).flatMap((node) => {
		if (node.optional) return [];
		if (node.tag) return level.some((element) => matches(element, node, anySlot)) ? [] : [startOf(node)];
		if (node.choice) {
			const filled = node.choice.some((alternative) => missing(level, [alternative], anySlot).length === 0);
			return filled ? [] : [node.choice.map(startOf).join(' of ')];
		}
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

/**
 * Gives every element to one node. An element can only be a node of the most
 * specific kind that matches it, and a node gets one element of its own before
 * any node gets a second: a bipartite matching, as a grammar would find.
 */
function assign(nodes, level, anySlot) {
	const specificity = (node) => fixedValues(node).length + (node.slot ? 1 : 0);
	const options = new Map();
	for (const element of level) {
		const fitting = nodes.filter((node) => matches(element, node, anySlot));
		if (fitting.length === 0) continue;
		const top = Math.max(...fitting.map(specificity));
		const best = fitting.filter((node) => specificity(node) === top);
		const fit = best.filter((node) => missing(direct(element), node.children ?? [], false).length === 0);
		options.set(element, fit.length > 0 ? fit : best);
	}
	const owner = new Map();
	const take = (node, seen) => [...options.keys()].some((element) => {
		if (seen.has(element) || !options.get(element).includes(node)) return false;
		seen.add(element);
		if (owner.has(element) && !take(owner.get(element), seen)) return false;
		owner.set(element, node);
		return true;
	});
	for (const node of nodes) take(node, new Set());
	const claimed = new Map(nodes.map((node) => [node, []]));
	for (const [element, fitting] of options) claimed.get(owner.get(element) ?? fitting[0]).push(element);
	return claimed;
}

/** Whether the children of a `flat` node stand in the order of the tree. */
function outOfOrder(element, sequence) {
	let position = 0;
	return direct(element).filter((child) => {
		const next = sequence.findIndex((node, index) => index >= position && matches(child, node, false));
		if (next >= 0) position = next;
		return next < 0 && sequence.some((node) => matches(child, node, false));
	});
}

/**
 * @param {object[]} nodes the composition, with its `ref`s filled in
 * @param {object} context
 * @param {Record<string, { attrs: object, childAttrs: object, slots: string[], anySlot?: boolean }>} context.tags the components
 * @param {{ file: string, roots: object[] }[]} context.examples the examples of the pattern
 * @param {Record<string, object[]>} [context.fragments] per example that shows a part, the nodes it starts at
 * @param {Set<object>} [context.shown] what examples showed, kept across patterns for shared definitions
 * @returns {string[]} what does not hold
 */
export function checkComposition(nodes, { tags, examples, fragments = {}, shown = new Set() }) {
	const problems = [];
	const fileOf = new Map();
	const inExample = examples.map(({ file, roots }) => {
		const found = roots.flatMap(descendants);
		for (const element of found) fileOf.set(element, file);
		return { file, found };
	});

	for (const file of Object.keys(fragments)) {
		if (!examples.some((example) => example.file === file)) problems.push(`examples names ${file}, which is no example.`);
	}
	for (const { file, found } of inExample) {
		for (const name of missing(found, fragments[file] ?? nodes, true)) problems.push(`${file}: misses ${name}.`);
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
			problems.push(`${file}: ${element.name} without ${name}.`);
		}
		const sequences = [node, ...(node.children ?? [])].filter((each) => each.flat);
		for (const { children } of sequences) {
			for (const child of outOfOrder(element, children)) problems.push(`${file}: ${child.name} is out of order in ${element.name}.`);
		}
	};

	/**
	 * @param {object[]} group the nodes of one level
	 * @param {object[]} level the elements these nodes can be
	 * @param {string[]} parents the tags around them
	 * @param {boolean} anySlot see matches()
	 * @param {boolean} some the parents are what examples put in a slot, not what the tree names
	 */
	const visitLevel = (group, level, parents, anySlot, some) => {
		const claimed = assign(tagsAt(group), level, anySlot);
		const visit = (node) => {
			checkSlots(node, parents, some);
			for (const tag of node['any-of'] ?? []) {
				if (!tags[tag]) problems.push(`any-of names ${tag}, which does not exist.`);
			}
			if (node.tag) {
				const names = [node.tag, ...(node.or ?? [])];
				const unknown = names.filter((tag) => !tags[tag]);
				for (const tag of unknown) problems.push(`Names ${tag}, which does not exist.`);
				if (unknown.length > 0) return;
				for (const tag of names) checkAttributes(tag, node, parents);
				const mine = claimed.get(node);
				if (mine.length > 0) shown.add(keyOf(node));
				for (const element of mine) checkElement(element, node);
				visitLevel(node.children ?? [], mine.flatMap(direct), names, false, false);
			} else if (node.choice) {
				node.choice.forEach(visit);
			} else if (node.slot) {
				const held = slotted(level, node);
				if (held.length > 0) shown.add(keyOf(node));
				if (held.some(({ name }) => node['any-of']?.includes(name))) shown.add(node['any-of']);
				const filling = [...new Set(held.filter((element) => isSlotted(element, node)).map(({ name }) => name))];
				visitLevel(node.children ?? [], held, filling.length > 0 ? filling : parents, true, filling.length > 0);
			} else {
				if (level.some(({ name }) => node['any-of']?.includes(name))) shown.add(node['any-of']);
				(node.children ?? []).forEach(visit);
			}
		};
		group.forEach(visit);
	};

	const startsAt = (file) => fragments[file];
	const whole = inExample.filter(({ file }) => !startsAt(file)).flatMap(({ found }) => found);
	visitLevel(nodes, whole, [], true, false);
	for (const { file, found } of inExample) {
		if (startsAt(file)) visitLevel(startsAt(file), found, [], true, false);
	}

	const report = (node, parents) => {
		const next = node.tag ? [node.tag, ...(node.or ?? [])] : parents;
		const where = parents.length > 0 ? ` inside ${parents.join(', ')}` : '';
		const known = !node.tag || (tags[node.tag] && (node.or ?? []).every((tag) => tags[tag]));
		if (!node.shared && known && (node.tag || node.slot) && !shown.has(keyOf(node))) problems.push(`No example shows ${startOf(node)}${where}.`);
		if (!node.shared && node['any-of'] && !shown.has(node['any-of'])) problems.push(`No example shows any of ${node['any-of'].join(', ')}${where}.`);
		for (const child of [...(node.children ?? []), ...(node.choice ?? [])]) report(child, next);
	};
	for (const node of nodes) report(node, []);
	return [...new Set(problems)];
}

/** Every part of a shared definition no example of any pattern showed. */
export function unshownParts(define, shown) {
	const found = [];
	const visit = (node) => {
		if ((node.tag || node.slot) && !shown.has(node)) found.push(startOf(node));
		for (const child of [...(node.children ?? []), ...(node.choice ?? [])]) visit(child);
	};
	Object.values(define).forEach(visit);
	return found;
}
