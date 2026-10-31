/**
 * Writes lint/data.generated.json from custom-elements.json, the icon set and
 * src/rules/. The file is committed and CI checks it for drift, like the manifest.
 *
 * Usage: node scripts/generate-lint-data.js
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aliases } from '../src/components/content/icon/icon-aliases.js';
import { buildClasses, buildContract, loadRules } from './lib/lint-data.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'));

const manifest = read('custom-elements.json');
const iconFiles = readdirSync(resolve(repoRoot, 'src/components/content/icon/icons'));
const icons = iconFiles
	.filter((file) => file.endsWith('.svg'))
	.map((file) => file.slice(0, -4))
	.concat(Object.keys(aliases))
	.sort();

const data = {
	tags: buildContract(manifest),
	classes: buildClasses(manifest),
	icons,
	rules: loadRules(resolve(repoRoot, 'src/rules'), read('lint/rule.schema.json')),
};

writeFileSync(resolve(repoRoot, 'lint/data.generated.json'), `${JSON.stringify(data)}\n`);
console.log(`lint data: ${Object.keys(data.tags).length} tags, ${data.rules.length} rules`);
