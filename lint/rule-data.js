/** The rules as data: what a command needs before anything has to be parsed. */

import { readFileSync } from 'node:fs';

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
	'suppression-needs-reason': {
		severity: 'warn',
		description: 'Say why after `--`, so the next reader knows why this rule is off here.',
	},
};

/** A rule id is API: a former id keeps working wherever consumers wrote it down. */
export function createCanonical(data) {
	const former = new Map(data.rules.flatMap(({ id, aliases = [] }) => aliases.map((alias) => [alias, id])));
	return (id) => former.get(id) ?? id;
}
