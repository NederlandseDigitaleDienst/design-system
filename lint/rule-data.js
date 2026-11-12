/** The rules as data: what a command needs before anything has to be parsed. */

import { readFileSync } from 'node:fs';

/** What a rule is about. The first that fits, top to bottom, is the group of a rule. */
export const GROUPS = ['api', 'a11y', 'copy', 'structure', 'pattern', 'pure'];

/**
 * Groups a project turns on itself, with `--pure` or a level in its config. They ask
 * more than using the components right, so they never fire unasked.
 */
export const OPT_IN_GROUPS = ['pure'];

/**
 * Turns config keys and --select and --ignore into a level per rule. A key is a
 * group or a rule, and a rule beats its group whatever the order.
 */
export function resolveSeverities(data, levels = {}, { select, ignore, optIn = [] } = {}) {
	const levelOf = new Map(data.rules.map((rule) => [rule.id, rule.severity]));
	const groupOf = new Map([
		...Object.keys(BUILT_IN_RULES).map((id) => [id, 'api']),
		...data.rules.map((rule) => [rule.id, rule.group]),
	]);
	const canonical = createCanonical(data);
	const matches = (id, keys) => keys.some((key) => key === groupOf.get(id) || canonical(key) === id);
	const severities = Object.fromEntries(
		Object.entries(levels)
			.filter(([key]) => !GROUPS.includes(key))
			.map(([key, level]) => [canonical(key), level]),
	);
	for (const [id, group] of groupOf) {
		if (!severities[id] && levels[group]) severities[id] = levels[group];
		if (OPT_IN_GROUPS.includes(group)) {
			// The command line beats the config for the group, not for a rule the config names.
			const namedInConfig = Object.keys(levels).some((key) => canonical(key) === id);
			if (optIn.includes(group) && !namedInConfig && severities[id] === 'off') delete severities[id];
			const chosen = severities[id] || optIn.includes(group) || (select?.length && matches(id, select));
			// The linter runs a rule of such a group only with a level written out.
			severities[id] = chosen ? (severities[id] ?? levelOf.get(id)) : 'off';
		}
		if (select?.length && !matches(id, select)) severities[id] = 'off';
		if (ignore?.length && matches(id, ignore)) severities[id] = 'off';
	}
	return severities;
}

export function loadData() {
	return JSON.parse(readFileSync(new URL('./data.generated.json', import.meta.url), 'utf8'));
}

/**
 * Kept in the code rather than src/rules/: they are generated from the contract,
 * for every component, without anyone writing a rule.
 */
export const BUILT_IN_RULES = {
	'unknown-element': {
		severity: 'error',
		description: 'The tag does not exist in this version of the design system.',
	},
	'unknown-attribute': {
		severity: 'warn',
		description: 'The component does not have this attribute, so setting it does nothing.',
	},
	'invalid-value': {
		severity: 'warn',
		description: 'The attribute only accepts a fixed set of values, and this is not one of them.',
	},
	'unknown-icon': {
		severity: 'warn',
		description: 'There is no icon with this name.',
	},
	'unknown-slot': {
		severity: 'warn',
		description: 'The parent component has no slot with this name, so the element does not render.',
	},
	deprecated: {
		severity: 'warn',
		description: 'This still works, but will go away in a later version.',
	},
	'token-not-found': {
		severity: 'warn',
		description: 'The design system has no token with this name, so the declaration that uses it does nothing.',
	},
	'local-variable-no-override': {
		severity: 'warn',
		description: 'A `--_` variable belongs to the inside of one component and can change in any release. Use the component\'s attributes, or open an issue for what is missing.',
	},
	'file-not-read': {
		severity: 'warn',
		description: 'This file has nldd-* markup the linter cannot read, so it was not checked.',
	},
	'suppression-needs-reason': {
		severity: 'warn',
		description: 'Say why after `--`, so the next reader knows why this rule is off here.',
	},
	'syntax-error': {
		severity: 'warn',
		description: 'This file could not be read, so most of it was not checked.',
	},
	'suppression-not-needed': {
		severity: 'warn',
		description: 'This rule does not fire on the next line, so the suppression can go.',
	},
};

/** A rule id is API: a former id keeps working wherever consumers wrote it down. */
export function createCanonical(data) {
	const former = new Map(data.rules.flatMap(({ id, aliases = [] }) => aliases.map((alias) => [alias, id])));
	return (id) => former.get(id) ?? id;
}
