/**
 * What a rule means where it runs: in source, through the engine, and on a
 * running page, as plain CSS for `el.matches()`.
 *
 * A rule is a selector, and most of it is CSS that means the same in both. The
 * pseudo-classes the design system adds are not: each one here says what it
 * means in source and what the browser gets instead. A class of tags becomes
 * `:is()` of its tags, `:named-by-field` is dropped because on a running page
 * the field has set the attribute, and what only source can judge has no
 * browser form at all. A selector that cannot be compiled is refused, so a rule
 * never silently stops running in the browser.
 */

import { parse, stringify } from 'css-what';
import { OPT_IN_GROUPS } from './rule-data.js';
import { isDesignSystemCss } from './css.js';
import { BOUND } from './tree.js';

/**
 * A member of a tag class that counts only in part. A hidden input has no box
 * and no place in the accessibility tree, so it is no form input, though its
 * tag is (#421).
 */
const CLASS_EXCEPTIONS = {
	'form-input': { input: { attribute: 'type', value: 'hidden' } },
};

function excepted(className, node) {
	const exception = CLASS_EXCEPTIONS[className]?.[node.name];
	return Boolean(exception) && node.attrs.get(exception.attribute) === exception.value;
}

/** Pseudo-classes of CSS itself, which mean the same everywhere. */
const CSS_PSEUDOS = new Set(['is', 'not', 'has', 'where', 'matches']);

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

function fieldLabelCheck(isInput, allowMaybe) {
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
 * inside an nldd-rich-text does not make plain HTML written here the design system's. A
 * tree the file builds under a name (a helper component, a variable) is judged where
 * the file uses that name. Used nowhere here, or under a component of the app, it is
 * unknown.
 */
function acceptedCheck(tags, allowUnknown) {
	// `chain` holds the plain elements between the node and the component: the
	// component styles its own children (::slotted) or descendants of what it styles,
	// so each of them has to be accepted too. `seen` keeps a component that places
	// itself from going round in circles.
	const accepted = (node, from, chain, seen) => {
		for (let parent = from; parent; parent = parent.parent) {
			if (parent.name === '#root') {
				if (!parent.detached) return false;
				if (!parent.placements) return allowUnknown;
				if (seen.has(parent)) return false;
				const next = new Set(seen).add(parent);
				// Accepted in any of the places the file uses it is enough.
				return parent.placements.some((place) => accepted(node, place.parent, chain, next));
			}
			if (parent.opaque) return allowUnknown;
			if (!parent.name.startsWith('nldd-')) {
				chain.push(parent.name);
				continue;
			}
			const accepts = tags[parent.name]?.accepts ?? [];
			return accepts.includes('*') || [node.name, ...chain].every((name) => accepts.includes(name));
		}
		return false;
	};
	return (node) => accepted(node, node.parent, [], new Set());
}

/**
 * The pseudo-classes a rule may use besides those of CSS and the tag classes.
 *
 * - `source` is what it means in the engine, made from the linter data.
 * - `favorable` is what it means in W+, where whatever is unknown may hold.
 * - `browser` is `native` (CSS knows it), `drop` (leave the alternative out of
 *   its list) or absent (source only).
 * - `optIn` keeps it to the groups a project turns on itself: it judges a file
 *   by itself, which a rule that runs unasked may not do.
 */
const VOCABULARY = {
	// Only exists on a running page, so in source it is never true.
	state: { source: () => () => false, browser: 'native' },
	// On a running page the field has set the attribute, so no exception is needed.
	'named-by-field': {
		source: ({ isInput }) => fieldLabelCheck(isInput, false),
		favorable: ({ isInput }) => fieldLabelCheck(isInput, true),
		browser: 'drop',
	},
	accepted: {
		source: ({ tags }) => acceptedCheck(tags, false),
		favorable: ({ tags }) => acceptedCheck(tags, true),
		optIn: true,
	},
	// The attribute is in the markup, with a value or bound to one. `[class]` asks for a
	// value we can read, so a bound class would only ever be cantTell.
	written: { source: () => (node, name) => node.attrs.has(name), optIn: true },
	// No element and no text: an empty mount point such as <div id="app"></div>.
	blank: { source: () => (node) => node.children.length === 0 && !node.text, optIn: true },
	// Inside an element of this name in this file. A drawing's own classes and styles are its business.
	within: {
		source: () => (node, name) => {
			for (let parent = node.parent; parent; parent = parent.parent) if (parent.name === name) return true;
			return false;
		},
		optIn: true,
	},
	// CSS the design system ships: a block it recognizes, or a stylesheet with nothing else in it.
	'design-system': {
		source: ({ designSystemCss }) => (node) => node.designSystem ?? (node.css !== undefined && isDesignSystemCss(node.css, designSystemCss)),
		optIn: true,
	},
};

/** The name a pseudo-class goes by in W+, or the name itself when unknown changes nothing. */
export function favorableName(name) {
	return VOCABULARY[name]?.favorable ? `may-be-${name}` : name;
}

/** What each pseudo-class means in source, for css-select. */
export function sourcePseudos({ classes = {}, tags = {}, designSystemCss = {} } = {}) {
	const shared = Object.fromEntries(
		Object.entries(classes).map(([name, members]) => {
			const set = new Set(members);
			return [name, (node) => set.has(node.name) && !excepted(name, node)];
		}),
	);
	const context = { tags, designSystemCss, isInput: shared['form-input'] ?? (() => false) };
	const own = Object.entries(VOCABULARY).flatMap(([name, entry]) => [
		[name, entry.source(context)],
		...(entry.favorable ? [[favorableName(name), entry.favorable(context)]] : []),
	]);
	return { ...shared, ...Object.fromEntries(own) };
}

/**
 * Whether a rule runs on a running page. A hint is advice for whoever writes the
 * source, and components write `style`, `id` and more on a live page that it would
 * take for the app's own. An opt-in group judges the app's own markup and is off
 * unless a project turns it on. A `ref` follows an id and is no selector.
 */
export function runsInBrowser(rule) {
	return !rule.ref && rule.severity !== 'hint' && !OPT_IN_GROUPS.includes(rule.group);
}

function pseudoNames(selector) {
	const names = [];
	const visit = (tokens) => {
		for (const token of tokens) {
			if (token.type !== 'pseudo') continue;
			names.push(token.name);
			if (Array.isArray(token.data)) token.data.forEach(visit);
		}
	};
	parse(selector).forEach(visit);
	return names;
}

function compileList(list, classes, selector) {
	const kept = list.filter((tokens) => {
		const [only] = tokens;
		return !(tokens.length === 1 && only.type === 'pseudo' && VOCABULARY[only.name]?.browser === 'drop');
	});
	if (kept.length === 0) throw new Error(`${selector}: nothing is left of it in the browser.`);
	return kept.map((tokens) => tokens.map((token) => compileToken(token, classes, selector)));
}

function compileToken(token, classes, selector) {
	if (token.type !== 'pseudo') return token;
	if (classes[token.name]) {
		return { type: 'pseudo', name: 'is', data: classes[token.name].map((name) => {
			const tag = { type: 'tag', name, namespace: null };
			const exception = CLASS_EXCEPTIONS[token.name]?.[name];
			if (!exception) return [tag];
			const attribute = { type: 'attribute', name: exception.attribute, action: 'equals', value: exception.value, namespace: null, ignoreCase: null };
			return [tag, { type: 'pseudo', name: 'not', data: [[attribute]] }];
		}) };
	}
	const browser = CSS_PSEUDOS.has(token.name) ? 'native' : VOCABULARY[token.name]?.browser;
	if (browser === 'drop') throw new Error(`${selector}: :${token.name} can only stand on its own in a list.`);
	if (browser !== 'native') throw new Error(`${selector}: the browser has no :${token.name}.`);
	return Array.isArray(token.data) ? { ...token, data: compileList(token.data, classes, selector) } : token;
}

/** The selector as plain CSS. Throws when the browser cannot run it. */
export function forBrowser(selector, classes = {}) {
	return stringify(compileList(parse(selector), classes, selector));
}

const toProperty = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/**
 * `[accessible-label]` in an assert also holds for the property `accessibleLabel`,
 * which a selector cannot see. Not inside a `:not()`: there the attribute is what may
 * not be there, and a property that is set does not excuse it.
 */
export function assertProperties(assert) {
	const names = [];
	const visit = (tokens, negated) => {
		for (const token of tokens) {
			if (token.type === 'attribute' && token.action === 'exists' && !negated) names.push(toProperty(token.name));
			if (token.type === 'pseudo' && Array.isArray(token.data)) {
				for (const inner of token.data) visit(inner, token.name === 'not' ? !negated : negated);
			}
		}
	};
	parse(assert).forEach((tokens) => visit(tokens, false));
	return [...new Set(names)];
}

/** A rule as the browser runs it, or null for one that only runs on source. */
export function compileForBrowser(rule, classes = {}) {
	if (!runsInBrowser(rule)) return null;
	const { id, message, context, assert, report, count } = rule;
	const css = (selector) => forBrowser(selector, classes);
	return {
		id,
		message,
		context: css(context),
		...(assert ? { assert: css(assert), properties: assertProperties(css(assert)) } : {}),
		...(report ? { report: css(report) } : {}),
		...(count ? { count: { ...count, of: css(count.of) } } : {}),
	};
}

/** What is wrong with the selectors of a rule, for where it runs. */
export function ruleProblems(rule, classes = {}) {
	const problems = [];
	const selectors = [rule.context, rule.assert, rule.report, rule.count?.of, rule.ref?.target].filter(Boolean);
	for (const name of new Set(selectors.flatMap(pseudoNames))) {
		if (CSS_PSEUDOS.has(name) || classes[name]) continue;
		const entry = VOCABULARY[name];
		if (!entry) problems.push(`:${name} does not exist.`);
		else if (entry.optIn && !OPT_IN_GROUPS.includes(rule.group)) {
			problems.push(`:${name} is for the opt-in groups (${OPT_IN_GROUPS.join(', ')}) only.`);
		}
	}
	if (problems.length === 0) {
		try {
			compileForBrowser(rule, classes);
		} catch (error) {
			problems.push(error.message);
		}
	}
	return problems;
}
