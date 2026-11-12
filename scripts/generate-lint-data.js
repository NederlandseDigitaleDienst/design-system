/**
 * Writes lint/data.generated.json from custom-elements.json, the icon set,
 * src/rules/ and the stylesheets the package ships, plus the same rules as plain
 * CSS for the browser. Both are committed and CI checks them for drift, like the
 * manifest.
 *
 * A token that was in the previous data and is gone now is added to
 * src/assets/styles/removed-tokens.json, with the last version that had it. That
 * file is the history the linter names a removed token from, and the changelog
 * check reads it.
 *
 * Usage: node scripts/generate-lint-data.js
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aliases } from '../src/components/content/icon/icon-aliases.js';
import { cssRules, declarations, TOKEN_PREFIX } from '../lint/css.js';
import { booleanAttributes, buildClasses, buildContract, buildDevRules, loadRules, normalizeSelectors, seeUrl } from './lib/lint-data.js';

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
const patternTitle = (slug) => {
	const stories = readFileSync(resolve(repoRoot, `src/patterns/${slug}/${slug}.stories.ts`), 'utf8');
	return stories.match(/title: (['"])(.+?)\1/)[2];
};
const rules = loadRules(resolve(repoRoot, 'src/rules'), read('lint/rule.schema.json')).map((rule) => {
	const url = seeUrl(rule.see, patternTitle);
	return { ...normalizeSelectors(rule, booleans), ...(url && { url }) };
});
const tags = buildContract(manifest);

/** The stylesheets build:styles copies to dist/css, so the list has one source. */
const pkg = read('package.json');
const shippedCss = [...pkg.scripts['build:styles'].matchAll(/src\/[^\s]+?\.css/g)].flatMap(([path]) => {
	if (!path.includes('*')) return [resolve(repoRoot, path)];
	const directory = resolve(repoRoot, dirname(path));
	const pattern = new RegExp(`^${basename(path).replace(/\./g, '\\.').replace('*', '.*')}$`);
	return readdirSync(directory).filter((file) => pattern.test(file)).sort().map((file) => resolve(directory, file));
});
const stylesheets = shippedCss.map((file) => readFileSync(file, 'utf8'));
// A context variable is API only where variables.css gives it a default; the rest is wiring between components.
const contextDefaults = new Set(declarations(readFileSync(resolve(repoRoot, 'src/assets/styles/variables.css'), 'utf8')).map(({ name }) => name).filter((name) => name.startsWith('--context-')));
const isToken = (name) => TOKEN_PREFIX.test(name) && (!name.startsWith('--context-') || contextDefaults.has(name));
const tokens = [...new Set(stylesheets.flatMap((css) => declarations(css).map(({ name }) => name)).filter(isToken))].sort();
const systemRules = new Map();
for (const css of stylesheets) {
	for (const [key, names] of cssRules(css)) systemRules.set(key, new Set([...(systemRules.get(key) ?? []), ...names]));
}
const systemCss = Object.fromEntries([...systemRules.keys()].sort().map((key) => [key, [...systemRules.get(key)].sort()]));

const removedPath = resolve(repoRoot, 'src/assets/styles/removed-tokens.json');
const removedTokens = read('src/assets/styles/removed-tokens.json');
const previousData = resolve(repoRoot, 'lint/data.generated.json');
const previousTokens = existsSync(previousData) ? (JSON.parse(readFileSync(previousData, 'utf8')).tokens ?? []) : [];
const current = new Set(tokens);
for (const name of previousTokens) if (!current.has(name) && !removedTokens[name]) removedTokens[name] = { last: pkg.version };
for (const name of tokens) delete removedTokens[name];
const removedLines = Object.keys(removedTokens).sort().map((name) => `\t${JSON.stringify(name)}: ${JSON.stringify(removedTokens[name])}`);
writeFileSync(removedPath, `{\n${removedLines.join(',\n')}\n}\n`);

const data = { tags, classes, icons, rules, tokens, removedTokens: Object.fromEntries(Object.keys(removedTokens).sort().map((name) => [name, removedTokens[name]])), systemCss };

writeFileSync(resolve(repoRoot, 'lint/data.generated.json'), `${JSON.stringify(data)}\n`);
writeFileSync(
	resolve(repoRoot, 'src/utilities/dev-rules.generated.ts'),
	`// Generated from src/rules/ by scripts/generate-lint-data.js. Do not edit.
import type { DevRule } from './dev-checks.js';

export const devRules: DevRule[] = ${JSON.stringify(buildDevRules(rules, classes, tags), null, '\t')};
`,
);
console.log(`lint data: ${Object.keys(data.tags).length} tags, ${data.rules.length} rules, ${tokens.length} tokens, ${systemRules.size} rules of system CSS`);
