/**
 * Evaluates rules against a tree.
 *
 * Every rule runs in two worlds. In W+ whatever is unknown turns out in favour of
 * presence: a bound attribute is set to any value, unknown content matches
 * anything. In W- it all turns out absent. A violation in both worlds is
 * `failed`, in neither `passed`, and anything else is `cantTell`, the W3C ACT
 * outcome for a result that cannot be determined. Only `failed` is reported, so
 * a rule never fires on something that might be fine at runtime.
 */

import { compile } from 'css-select';
import { parse } from 'css-what';
import { BOUND, adapter, walk } from './tree.js';

/** In W+ a sibling behind a condition might not show, as with `v-if`, `v-else` and tabs on `v-show`. */
const favorableAdapter = {
	...adapter,
	getSiblings: (node) =>
		adapter.getSiblings(node).filter((each) => each === node || (!each.conditional && !each.repeated && !each.toggled)),
};

const BUILT_IN_PSEUDOS = new Set(['is', 'not', 'has', 'where', 'matches']);

/**
 * Whether a field hands its label to `target`, as _findInput in nldd-form-field does:
 * the first input in document order, helper text left out. The answer is `maybe` when
 * something before it may or may not be an input that renders.
 */
function findsInput(node, target, isInput, uncertain = false) {
	let maybe = uncertain;
	for (const child of node.children) {
		if (child.name === 'nldd-form-field-help-text') continue;
		const unsure = maybe || child.conditional || child.repeated;
		if (child === target) return maybe ? 'maybe' : 'yes';
		if (isInput(child)) {
			if (!unsure) return 'no';
			maybe = true;
		}
		if (child.opaque) maybe = true;
		const inside = findsInput(child, target, isInput, unsure);
		if (inside !== 'absent') return inside;
	}
	return 'absent';
}

/**
 * On a running page the attribute is simply there, so the browser checks leave this
 * out. In source it has to be worked out.
 */
function createFieldLabelCheck(isInput, allowMaybe) {
	return (node) => {
		for (let parent = node.parent; parent; parent = parent.parent) {
			if (parent.name === 'nldd-form-field') {
				const label = parent.attrs.get('label');
				const unknownLabel = label === BOUND || parent.spread;
				if (!unknownLabel && !label) return false;
				const found = findsInput(parent, node, isInput);
				if (found === 'yes' && !unknownLabel) return true;
				return allowMaybe && found !== 'no';
			}
			if (parent.opaque) return allowMaybe;
		}
		return false;
	};
}

/**
 * Whether the nearest component around a plain element styles it, as nldd-dropdown
 * does its <select> and nldd-rich-text everything in it. Each component says so
 * with `@accepts` in its JSDoc.
 *
 * What a file renders is judged in that file: that a parent elsewhere might put it
 * inside an nldd-rich-text does not make plain HTML written here the system's. A
 * tree the file builds under a name (a helper component, a variable) is judged where
 * the file uses that name. Used nowhere here, or under a component of the app, it is
 * unknown.
 */
function createAcceptedCheck(tags, allowUnknown) {
	const accepted = (node, from, depth) => {
		for (let parent = from; parent; parent = parent.parent) {
			if (parent.name === '#root') {
				if (!parent.detached) return false;
				// Placed where the file uses it: judged from each of those places. Accepted in
				// any of them is enough, so one that maybe accepts it keeps the rule quiet.
				if (!parent.placements || depth > 8) return allowUnknown;
				return parent.placements.some((place) => accepted(node, place.parent, depth + 1));
			}
			if (parent.opaque) return allowUnknown;
			if (!parent.name.startsWith('nldd-')) continue;
			const accepts = tags[parent.name]?.accepts ?? [];
			return accepts.includes('*') || accepts.includes(node.name);
		}
		return false;
	};
	return (node) => accepted(node, node.parent, 0);
}

function classPseudos(classes) {
	return Object.fromEntries(
		Object.entries(classes).map(([name, tags]) => {
			const members = new Set(tags);
			return [name, (node) => members.has(node.name)];
		}),
	);
}

/**
 * Rewrites a selector for one world. W+ lets what is unknown match, W- does not, and
 * `:not()` turns that around: unknown content that might be `x` makes `:not(x)` true
 * in W+ only because there it is not taken for an `x`.
 */
function forWorld(tokens, classes, widen) {
	const unknown = { type: 'pseudo', name: 'unknown', data: null };
	return tokens.map((token) => {
		if (token.type === 'pseudo' && BUILT_IN_PSEUDOS.has(token.name) && Array.isArray(token.data)) {
			const inner = token.name === 'not' ? !widen : widen;
			return { ...token, data: token.data.map((each) => forWorld(each, classes, inner)) };
		}
		if (!widen) return token;
		if (token.type === 'pseudo' && token.name === 'named-by-field') return { ...token, name: 'may-be-named-by-field' };
		if (token.type === 'pseudo' && token.name === 'accepted') return { ...token, name: 'may-be-accepted' };
		if (token.type === 'tag' || (token.type === 'pseudo' && token.name in classes)) {
			return { type: 'pseudo', name: 'is', data: [[token], [unknown]] };
		}
		// "Not empty" is about a value we have, and a bound value is not empty.
		if (token.type === 'attribute' && token.action === 'equals' && token.value === '') return token;
		if (token.type === 'attribute') {
			const bound = { type: 'pseudo', name: 'bound', data: token.name };
			return { type: 'pseudo', name: 'is', data: [[token], [bound]] };
		}
		return token;
	});
}

export function createEngine({ classes = {}, tags = {} } = {}) {
	const shared = classPseudos(classes);
	const pseudos = {
		...shared,
		'named-by-field': createFieldLabelCheck(shared['form-input'] ?? (() => false), false),
		'may-be-named-by-field': createFieldLabelCheck(shared['form-input'] ?? (() => false), true),
		accepted: createAcceptedCheck(tags, false),
		'may-be-accepted': createAcceptedCheck(tags, true),
		// Inside an element of this name in this file. A drawing's own classes and styles are its business.
		within: (node, name) => {
			for (let parent = node.parent; parent; parent = parent.parent) if (parent.name === name) return true;
			return false;
		},
		// No element and no text: an empty mount point such as <div id="app"></div>.
		blank: (node) => node.children.length === 0 && !node.text,
		// Only exists on a running page, so in source it is never true.
		state: () => false,
		unknown: (node) => node.opaque,
		// The attribute is in the markup, with a value or bound to one. `[class]` asks for a
		// value we can read, so a bound class would only ever be cantTell.
		written: (node, name) => node.attrs.has(name),
		bound: (node, name) => node.opaque || node.spread || node.attrs.get(name) === BOUND,
	};
	const cache = new Map();

	function matches(node, selector, world) {
		const key = world + selector;
		let test = cache.get(key);
		if (!test) {
			const query = parse(selector).map((tokens) => forWorld(tokens, classes, world === '+'));
			test = compile(query, { adapter: world === '+' ? favorableAdapter : adapter, pseudos, xmlMode: true });
			cache.set(key, test);
		}
		return test(node);
	}

	/**
	 * W- counts what certainly renders, W+ whatever might. So `v-if` and `v-else` do
	 * not add up, and four static buttons are too many, whatever a `v-for` adds.
	 */
	function countViolated(rule, node, world) {
		const { of, min, max } = rule.count;
		const counted = node.children.filter((child) => matches(child, of, world));
		if (world === '-') {
			const certain = counted.filter((child) => !child.conditional && !child.repeated && !child.toggled && !child.opaque).length;
			return (max !== undefined && certain > max) || (min !== undefined && certain < min);
		}
		const open = counted.some((child) => child.repeated) || node.children.some((child) => child.opaque);
		return (max !== undefined && counted.length > max) || (min !== undefined && !open && counted.length < min);
	}

	function isViolated(rule, node, world) {
		if (rule.assert) return !matches(node, rule.assert, world);
		if (rule.report) return matches(node, rule.report, world);
		if (rule.count) return countViolated(rule, node, world);
		return true;
	}

	function refOutcome(rule, node, root) {
		const { attr, target, equal } = rule.ref;
		const value = node.attrs.get(attr);
		if (value === undefined) return 'passed';
		if (value === BOUND || node.spread) return 'cantTell';
		const found = [];
		walk(root, (candidate) => {
			if (candidate.attrs.get('id') === value && matches(candidate, target, '-')) {
				found.push(candidate);
			}
		});
		// The target may be rendered by another file, unless this is a whole document.
		if (found.length === 0) return root.opaque ? 'cantTell' : 'failed';
		if (!equal) return 'passed';
		const expected = node.attrs.get(equal);
		const actual = found[0].attrs.get(equal);
		if (expected === BOUND || actual === BOUND) return 'cantTell';
		return expected === actual ? 'passed' : 'failed';
	}

	/** @returns {{ node: object, outcome: 'passed' | 'failed' | 'cantTell' }[]} */
	function evaluate(rule, root) {
		const results = [];
		walk(root, (node) => {
			if (node.opaque) return;
			const inMinus = matches(node, rule.context, '-');
			const inPlus = matches(node, rule.context, '+');
			if (!inMinus && !inPlus) return;
			if (rule.ref) {
				results.push({ node, outcome: refOutcome(rule, node, root) });
				return;
			}
			const minus = inMinus && isViolated(rule, node, '-');
			const plus = inPlus && isViolated(rule, node, '+');
			const outcome = minus && plus ? 'failed' : !minus && !plus ? 'passed' : 'cantTell';
			results.push({ node, outcome });
		});
		return results;
	}

	return { evaluate };
}
