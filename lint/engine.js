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

const BUILT_IN_PSEUDOS = new Set(['is', 'not', 'has', 'where', 'matches']);

function classPseudos(classes) {
	return Object.fromEntries(
		Object.entries(classes).map(([name, tags]) => {
			const members = new Set(tags);
			return [name, (node) => members.has(node.name)];
		}),
	);
}

function widenTokens(tokens, classes) {
	const unknown = { type: 'pseudo', name: 'unknown', data: null };
	return tokens.map((token) => {
		if (token.type === 'tag' || (token.type === 'pseudo' && token.name in classes)) {
			return { type: 'pseudo', name: 'is', data: [[token], [unknown]] };
		}
		// "Not empty" is about a value we have, and a bound value is not empty.
		if (token.type === 'attribute' && token.action === 'equals' && token.value === '') return token;
		if (token.type === 'attribute') {
			const bound = { type: 'pseudo', name: 'bound', data: token.name };
			return { type: 'pseudo', name: 'is', data: [[token], [bound]] };
		}
		if (token.type === 'pseudo' && BUILT_IN_PSEUDOS.has(token.name) && Array.isArray(token.data)) {
			return { ...token, data: token.data.map((inner) => widenTokens(inner, classes)) };
		}
		return token;
	});
}

export function createEngine({ classes = {} } = {}) {
	const shared = classPseudos(classes);
	const pseudosFor = {
		'+': {
			...shared,
			unknown: (node) => node.opaque,
			bound: (node, name) => node.opaque || node.spread || node.attrs.get(name) === BOUND,
		},
		'-': { ...shared, unknown: () => false, bound: () => false },
	};
	const cache = new Map();

	function matches(node, selector, world) {
		const key = world + selector;
		let test = cache.get(key);
		if (!test) {
			const query =
				world === '+'
					? parse(selector).map((tokens) => widenTokens(tokens, classes))
					: selector;
			test = compile(query, { adapter, pseudos: pseudosFor[world], xmlMode: true });
			cache.set(key, test);
		}
		return test(node);
	}

	function countViolated(rule, node, world) {
		const { of, min, max } = rule.count;
		const counted = node.children.filter((child) => matches(child, of, world));
		const repeats = node.children.some((c) => c.repeated && matches(c, of, '+'));
		if (repeats) return false;
		const tooMany = max !== undefined && counted.length > max;
		const unknownChild = world === '+' && node.children.some((child) => child.opaque);
		const tooFew = min !== undefined && !unknownChild && counted.length < min;
		return tooMany || tooFew;
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
			const inPlus = inMinus || matches(node, rule.context, '+');
			if (!inPlus) return;
			if (rule.ref) {
				results.push({ node, outcome: refOutcome(rule, node, root) });
				return;
			}
			const minus = inMinus && isViolated(rule, node, '-');
			const plus = isViolated(rule, node, '+');
			const outcome = minus && plus ? 'failed' : !minus && !plus ? 'passed' : 'cantTell';
			results.push({ node, outcome });
		});
		return results;
	}

	return { evaluate };
}
