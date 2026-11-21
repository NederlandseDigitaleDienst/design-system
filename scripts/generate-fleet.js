/**
 * Checks fleet.json and writes its list into the README, between the markers
 * `<!-- fleet:start -->` and `<!-- fleet:end -->`. A wrong entry fails here,
 * and so in the pull request that adds it, not at the next release.
 *
 * Usage: node scripts/generate-fleet.js
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fleetErrors, fleetMarkdown } from './lib/fleet.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fleet = JSON.parse(readFileSync(resolve(root, 'fleet.json'), 'utf8'));
const errors = fleetErrors(fleet);
if (errors.length > 0) {
	console.error(`fleet.json:\n${errors.map((error) => `  ${error}`).join('\n')}`);
	process.exit(1);
}

const readme = resolve(root, 'README.md');
const text = readFileSync(readme, 'utf8');
const block = /(<!-- fleet:start -->)[^]*?(<!-- fleet:end -->)/;
if (!block.test(text)) {
	console.error('README.md has no <!-- fleet:start --> and <!-- fleet:end --> to write the list between.');
	process.exit(1);
}
writeFileSync(readme, text.replace(block, (_, start, end) => `${start}\n${fleetMarkdown(fleet)}\n${end}`));
console.log(`fleet.json: ${fleet.repositories.length} repositories, in the README.`);
