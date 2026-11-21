/**
 * Fails when a block of CHANGELOG.md has its `###` sections out of order, an
 * unknown one, or one twice, when the upcoming release does not name a
 * token it removes, and when one of its breaking changes neither names the
 * rule that finds it nor says why there is none. `--fix` puts the known
 * sections in order.
 *
 * Usage: node scripts/validate-changelog.js [--fix]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sectionOrderErrors, sortSections } from './lib/changelog-sections.js';
import { unmentionedRemovals } from './lib/removed-tokens.js';
import { uncoveredBreaking } from './lib/breaking-coverage.js';
import { BUILT_IN_RULES } from '../lint/rule-data.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const path = resolve(root, 'CHANGELOG.md');
const readJson = (file) => JSON.parse(readFileSync(resolve(root, file), 'utf8'));
let changelog = readFileSync(path, 'utf8');

if (process.argv.includes('--fix')) {
	changelog = sortSections(changelog);
	writeFileSync(path, changelog);
}

const errors = sectionOrderErrors(changelog);
if (errors.length) {
	console.error(`CHANGELOG.md:\n${errors.map((error) => `  ${error}`).join('\n')}\n\nRun \`npm run validate:changelog -- --fix\` to put the sections in order.`);
	process.exit(1);
}

const unmentioned = unmentionedRemovals(changelog, readJson('src/assets/styles/removed-tokens.json'), readJson('package.json').version);
if (unmentioned.length) {
	console.error(
		`CHANGELOG.md: the upcoming release removes these tokens without naming them:\n${unmentioned.map((name) => `  ${name}`).join('\n')}\n\nName each under ### Breaking, with what to use instead. An app that uses one loses the declaration without an error.`,
	);
	process.exit(1);
}
// What a rule reports by itself: its id, its old names, and a token, event or translation key that is gone.
const known = [
	...readJson('lint/data.generated.json').rules.flatMap((rule) => [rule.id, ...(rule.aliases ?? [])]),
	...Object.keys(BUILT_IN_RULES),
	...Object.keys(readJson('src/assets/styles/removed-tokens.json')),
	...Object.keys(readJson('src/components/removed-events.json')),
	...Object.keys(readJson('src/translations/removed-keys.json')),
];
const uncovered = uncoveredBreaking(changelog, known);
if (uncovered.length) {
	console.error(
		`CHANGELOG.md: these breaking changes of the upcoming release do not say how an upgrade finds them:\n${uncovered.map((lead) => `  ${lead}`).join('\n')}\n\nName the rule that finds each place, in backticks, such as \`title-size-renamed\`. Where no rule can, write \`No rule:\` and why: \`nldd upgrade\` lists the change, and someone finds each place by hand.`,
	);
	process.exit(1);
}
console.log('✅ CHANGELOG.md sections are in order, it names every removed token, and each breaking change says how an upgrade finds it.');
