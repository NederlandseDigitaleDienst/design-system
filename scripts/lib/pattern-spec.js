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
	const expand = (node, inShared, path) => {
		if (node.ref) {
			if (!define[node.ref]) throw new Error(`There is no definition ${node.ref}.`);
			if (path.includes(node.ref)) throw new Error(`Definition ${node.ref} refers to itself: a tree has to end.`);
			const own = spec.define?.[node.ref] !== undefined;
			const target = expand(define[node.ref], inShared || !own, [...path, node.ref]);
			return { ...target, ...(node.note && { note: node.note }), ...(node.optional && { optional: true }) };
		}
		const copy = { ...node, origin: node };
		if (inShared) copy.shared = true;
		if (node.children) copy.children = node.children.map((child) => expand(child, inShared, path));
		if (node.choice) copy.choice = node.choice.map((child) => expand(child, inShared, path));
		return copy;
	};
	return {
		composition: spec.composition.map((node) => expand(node, false, [])),
		define: Object.fromEntries(Object.keys(define).map((name) => [name, expand({ ref: name }, false, [])])),
		local: Object.keys(spec.define ?? {}),
		examples: spec.examples ?? {},
	};
}

const isComponent = (element) => element.name.startsWith('nldd-');
const slotOf = (element) => element.attrs.get('slot');
const isSlotted = (element, node) => slotsOf(node).includes(slotOf(element));
const fixedValues = (node) => (node.attrs ?? []).filter((attribute) => attribute.includes('='));
const keyOf = (node) => node.origin ?? node;
const specificity = (node) => fixedValues(node).length + (node.slot ? 1 : 0);
const childrenOf = (node) => [...(node.children ?? []), ...(node.choice ?? [])];

/**
 * A node with `name="value"` in its attrs is only the elements with that value.
 * @param {boolean} anySlot the level is already inside a slot, or has no parent
 */
function matches(element, node, anySlot) {
	if (element.name !== node.tag && !node.or?.includes(element.name)) return false;
	if (node.slot ? !isSlotted(element, node) : !anySlot && slotOf(element)) return false;
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

/**
 * The elements directly inside one. A plain element is no level, but only a
 * direct child of a host can fill a slot, so a slot below a plain element is none.
 */
function direct(element, throughPlain = false) {
	return element.children.flatMap((child) => {
		if (slotOf(child)) return throughPlain ? [] : [child];
		return isComponent(child) ? [child] : direct(child, true);
	});
}

/** What fills a slot, and what sits in it: the filler, or for a plain one what it holds. */
function slotted(level, node, fillers) {
	const base = fillers ? fillers.flatMap((filler) => direct(filler)) : level;
	const inSlot = base.filter((element) => isSlotted(element, node));
	return { inSlot, contents: inSlot.flatMap((element) => (isComponent(element) ? [element] : direct(element))) };
}

/** The parts of one level of the tree: a `label` is no level, and a `choice` offers its alternatives. */
function partsOf(nodes, parts = { tags: [], slots: [], open: [], choices: [], sequences: [] }, optional = false) {
	for (const node of nodes) {
		const skip = optional || Boolean(node.optional);
		if (node.tag) parts.tags.push({ node, optional: skip });
		else if (node.slot) parts.slots.push({ node, optional: skip });
		else if (node.choice) {
			parts.choices.push({ node, optional: skip });
			partsOf(node.choice, parts, true);
		} else {
			if (node['any-of']) parts.open.push({ node, optional: skip });
			if (node.flat) parts.sequences.push(node.children ?? []);
			partsOf(node.children ?? [], parts, skip);
		}
	}
	return parts;
}

/** The tags a sequence names, through labels. */
function tagsIn(nodes) {
	return nodes.flatMap((node) => (node.tag ? [node] : node.label ? tagsIn(node.children ?? []) : []));
}

/**
 * Matches one parent's children against one level of the tree. This is the only
 * place that decides what belongs to what. An element can only be a node of the
 * most specific kind that matches it, and a required node gets an element of its
 * own before anything else: a bipartite matching, as a grammar would find.
 * @returns {{ parts: object, claimed: Map<object, object[]>, missing: string[], order: object[], both: string[] }}
 */
function match(group, level, { anySlot = false, sequence, fillers } = {}) {
	const parts = partsOf(group);
	const options = new Map();
	for (const element of level) {
		const fitting = parts.tags.map(({ node }) => node).filter((node) => matches(element, node, anySlot));
		if (fitting.length === 0) continue;
		const top = Math.max(...fitting.map(specificity));
		const best = fitting.filter((node) => specificity(node) === top);
		const fit = best.filter((node) => match(node.children ?? [], direct(element), { sequence: node.flat ? node.children : undefined }).missing.length === 0);
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
	const required = parts.tags.toSorted((a, b) => Number(a.optional) - Number(b.optional));
	for (const { node } of required) take(node, new Set());
	const claimed = new Map(parts.tags.map(({ node }) => [node, []]));
	for (const [element, fitting] of options) claimed.get(owner.get(element) ?? fitting[0]).push(element);
	const taken = (node) => (node.tag ? claimed.get(node).length > 0 : node.slot ? slotted(level, node, fillers).inSlot.length > 0 : false);

	const missing = [];
	for (const { node, optional } of parts.tags) {
		if (!optional && !taken(node)) missing.push(startOf(node));
	}
	for (const { node, optional } of parts.slots) {
		const { inSlot, contents } = slotted(level, node, fillers);
		if (inSlot.length > 0) missing.push(...match(node.children ?? [], contents, { anySlot: true, fillers: inSlot }).missing);
		else if (!optional) missing.push(startOf(node));
	}
	for (const { node, optional } of parts.open) {
		const free = level.some((element) => isComponent(element) && !options.has(element) && (anySlot || !slotOf(element)));
		if (!optional && !free) missing.push(startOf(node));
	}
	const both = [];
	for (const { node, optional } of parts.choices) {
		const present = node.choice.filter(taken);
		if (present.length > 1) both.push(present.map(startOf).join(', '));
		if (!optional && present.length === 0 && !node.choice.some((alternative) => alternative.label)) missing.push(node.choice.map(startOf).join(' of '));
	}

	const order = [];
	for (const nodes of [...(sequence ? [sequence] : []), ...parts.sequences]) {
		const steps = tagsIn(nodes);
		let position = 0;
		for (const element of level) {
			const fitting = options.get(element)?.map((node) => steps.indexOf(node)).filter((index) => index >= 0) ?? [];
			if (fitting.length === 0) continue;
			const next = fitting.filter((index) => index >= position);
			if (next.length === 0) order.push(element);
			else position = Math.min(...next);
		}
	}
	return { parts, claimed, missing, order, both };
}

/** What can be said of nodes without any example. */
export function checkNodes(nodes, tags, parents = [], underSlot = false) {
	return nodes.flatMap((node) => {
		const problems = [];
		for (const tag of node['any-of'] ?? []) {
			if (!tags[tag]) problems.push(`any-of names ${tag}, which does not exist.`);
		}
		if (!underSlot) {
			for (const slot of slotsOf(node)) {
				const holds = (parent) => !tags[parent] || tags[parent].anySlot || tags[parent].slots?.includes(slot);
				if (!parents.every(holds)) problems.push(`${parents.join(', ')} has no slot ${slot}.`);
			}
		}
		const names = node.tag ? [node.tag, ...(node.or ?? [])] : [];
		for (const tag of names) {
			if (!tags[tag]) {
				problems.push(`Names ${tag}, which does not exist.`);
				continue;
			}
			const known = [...Object.keys(tags[tag].attrs), ...parents.flatMap((parent) => Object.keys(tags[parent]?.childAttrs ?? {}))];
			for (const attribute of [...(node.attrs ?? []), ...(node['one-of'] ?? [])]) {
				const name = attributeName(attribute);
				if (!known.includes(name)) problems.push(`${tag} has no attribute ${name}.`);
			}
		}
		const inner = node.tag ? names : parents;
		return [...problems, ...checkNodes(childrenOf(node), tags, inner, Boolean(node.slot) && !node.tag)];
	});
}

/**
 * @param {object[]} nodes the composition, with its `ref`s filled in
 * @param {object} context
 * @param {Record<string, { attrs: object, childAttrs: object, slots: string[], anySlot?: boolean }>} context.tags the components
 * @param {{ file: string, roots: object[] }[]} context.examples the examples of the pattern
 * @param {Record<string, object[]>} [context.fragments] per example that shows a part, the nodes it starts at
 * @param {object[]} [context.defined] definitions of this pattern, which have to hold too
 * @param {Set<object>} [context.shown] what examples showed, kept across patterns for shared definitions
 * @returns {string[]} what does not hold
 */
export function checkComposition(nodes, { tags, examples, fragments = {}, defined = [], shown = new Set() }) {
	const problems = [...checkNodes(nodes, tags), ...checkNodes(defined, tags)];

	for (const file of Object.keys(fragments)) {
		if (!examples.some((example) => example.file === file)) problems.push(`examples names ${file}, which is no example.`);
	}

	/** @param {{ file: string, parent?: string, parents: string[], anySlot?: boolean, sequence?: object[], fillers?: object[] }} where */
	const checkLevel = (group, level, where) => {
		const { file, parent } = where;
		const { parts, claimed, missing, order, both } = match(group, level, where);
		for (const name of missing) problems.push(parent ? `${file}: ${parent} without ${name}.` : `${file}: misses ${name}.`);
		for (const element of order) problems.push(`${file}: ${element.name} is out of order in ${parent}.`);
		for (const names of both) problems.push(`${file}: ${parent ?? 'the example'} has more than one of ${names}.`);

		for (const { node } of parts.tags) {
			for (const element of claimed.get(node)) {
				shown.add(keyOf(node));
				const set = (node['one-of'] ?? []).filter((attribute) => element.attrs.has(attribute));
				if (set.length > 1) problems.push(`${file}: ${element.name} has more than one of ${set.join(', ')}.`);
				const names = [node.tag, ...(node.or ?? [])];
				if (names.every((tag) => tags[tag])) {
					checkLevel(node.children ?? [], direct(element), { file, parent: element.name, parents: names, sequence: node.flat ? node.children : undefined });
				}
			}
		}
		for (const { node } of parts.slots) {
			const { inSlot, contents } = slotted(level, node, where.fillers);
			if (inSlot.length === 0) continue;
			shown.add(keyOf(node));
			if (contents.some(({ name }) => node['any-of']?.includes(name))) shown.add(node['any-of']);
			if (where.fillers) {
				const fillers = where.fillers.map(({ name }) => name);
				const holds = (slot) => fillers.some((name) => !tags[name] || tags[name].anySlot || tags[name].slots?.includes(slot));
				for (const slot of slotsOf(node).filter((each) => !holds(each))) problems.push(`${fillers.join(', ')} has no slot ${slot}.`);
			}
			checkLevel(node.children ?? [], contents, { file, parent, parents: where.parents, anySlot: true, fillers: inSlot, sequence: node.flat ? node.children : undefined });
		}
		for (const { node } of parts.open) {
			if (level.some(({ name }) => node['any-of'].includes(name))) shown.add(node['any-of']);
		}
	};

	for (const { file, roots } of examples) {
		if (fragments[file]) checkLevel(fragments[file], roots.flatMap(descendants), { file, parents: [], anySlot: true });
		else checkLevel(nodes, roots.flatMap((root) => direct(root)), { file, parents: [], anySlot: true });
	}

	const report = (node, parents) => {
		const where = parents.length > 0 ? ` inside ${parents.join(', ')}` : '';
		const known = !node.tag || (tags[node.tag] && (node.or ?? []).every((tag) => tags[tag]));
		if (!node.shared && known && (node.tag || node.slot) && !shown.has(keyOf(node))) problems.push(`No example shows ${startOf(node)}${where}.`);
		if (!node.shared && node['any-of'] && !shown.has(node['any-of'])) problems.push(`No example shows any of ${node['any-of'].join(', ')}${where}.`);
		for (const child of childrenOf(node)) report(child, node.tag ? [node.tag, ...(node.or ?? [])] : parents);
	};
	for (const node of [...nodes, ...defined]) report(node, []);
	return [...new Set(problems)];
}

/** Every part of a shared definition no example of any pattern showed. */
export function unshownParts(define, shown) {
	const found = [];
	const visit = (node) => {
		if ((node.tag || node.slot) && !shown.has(node)) found.push(startOf(node));
		if (node['any-of'] && !shown.has(node['any-of'])) found.push(`any of ${node['any-of'].join(', ')}`);
		childrenOf(node).forEach(visit);
	};
	Object.values(define).forEach(visit);
	return found;
}
