/**
 * Fails when a block of CHANGELOG.md has its `###` sections out of order, an
 * unknown one, or one twice. `--fix` puts the known sections in order.
 *
 * Usage: node scripts/validate-changelog.js [--fix]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sectionOrderErrors, sortSections } from './lib/changelog-sections.js';

const path = resolve(dirname(fileURLToPath(import.meta.url)), '../CHANGELOG.md');
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
console.log('✅ CHANGELOG.md sections are in order.');
