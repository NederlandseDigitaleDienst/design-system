/**
 * Writes lint/data.generated.json from custom-elements.json, the icon set and
 * src/rules/, plus the same rules as plain CSS for the browser. Both are committed
 * and CI checks them for drift, like the manifest.
 *
 * Usage: node scripts/generate-lint-data.js
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aliases } from '../src/components/content/icon/icon-aliases.js';
import { booleanAttributes, buildClasses, buildContract, buildDevRules, loadRules, normalizeSelectors } from './lib/lint-data.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'));

const manifest = read('custom-elements.json');
const iconFiles = readdirSync(resolve(repoRoot, 'src/components/content/icon/icons'));
const icons = iconFiles
	.filter((file) => file.endsWith('.svg'))
	.map((file) => file.slice(0, -4))
	.concat(Object.keys(aliases))
	.sort();

const booleans = booleanAttributes(manifest);
const classes = buildClasses(manifest);
const rules = loadRules(resolve(repoRoot, 'src/rules'), read('lint/rule.schema.json')).map((rule) =>
	normalizeSelectors(rule, booleans),
);
const tags = buildContract(manifest);
const data = { tags, classes, icons, rules };

writeFileSync(resolve(repoRoot, 'lint/data.generated.json'), `${JSON.stringify(data)}\n`);
writeFileSync(
	resolve(repoRoot, 'src/utilities/dev-rules.generated.ts'),
	`// Generated from src/rules/ by scripts/generate-lint-data.js. Do not edit.
import type { DevRule } from './dev-checks.js';

export const devRules: DevRule[] = ${JSON.stringify(buildDevRules(rules, classes, tags), null, '\t')};
`,
);
console.log(`lint data: ${Object.keys(data.tags).length} tags, ${data.rules.length} rules`);
