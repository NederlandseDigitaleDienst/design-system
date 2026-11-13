/**
 * Fails when a block of CHANGELOG.md has its `###` sections out of order, an
 * unknown one, or one twice, and when the upcoming release does not name a
 * token it removes. `--fix` puts the known sections in order.
 *
 * Usage: node scripts/validate-changelog.js [--fix]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sectionOrderErrors, sortSections } from './lib/changelog-sections.js';
import { unmentionedRemovals } from './lib/removed-tokens.js';

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
console.log('✅ CHANGELOG.md sections are in order, and it names every removed token.');
