/**
 * Writes lint/data.generated.json from custom-elements.json, the icon set,
 * src/rules/ and the stylesheets the package ships, plus the same rules as plain
 * CSS for the browser. Both are committed and CI checks them for drift, like the
 * manifest.
 *
 * A token that was in the previous data and is gone now is added to
 * src/assets/styles/removed-tokens.json, with the last version that had it. That
 * file is the history the linter names a removed token from, and the changelog
 * check reads it. A translation key that disappears goes the same way, into
 * src/translations/removed-keys.json, and an event a component no longer fires
 * into src/components/removed-events.json.
 *
 * Usage: node scripts/generate-lint-data.js
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cssRules, declarations, TOKEN_PREFIX, withoutComments } from '../lint/css.js';
import { shippedStylesheets } from './build-styles.js';
import { booleanAttributes, buildClasses, buildContract, buildDevRules, loadRules, normalizeSelectors, seeUrl } from './lib/lint-data.js';
import { iconCatalog, loadComponentModel } from './lib/component-model.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'));

const elements = loadComponentModel();
const catalog = iconCatalog();
const icons = [...catalog.names, ...catalog.aliases].sort();

const booleans = booleanAttributes(elements);
const classes = buildClasses(elements);
const patternTitle = (slug) => {
	const stories = readFileSync(resolve(repoRoot, `src/patterns/${slug}/${slug}.stories.ts`), 'utf8');
	return stories.match(/title: (['"])(.+?)\1/)[2];
};
const rules = loadRules(resolve(repoRoot, 'src/rules'), read('lint/rule.schema.json')).map((rule) => {
	const url = seeUrl(rule.see);
	return { ...normalizeSelectors(rule, booleans), ...(url && { url }) };
});
const tags = buildContract(elements);

/**
 * The translation keys each element reads from its own `translations`: the defaults
 * it passes to translate() or withTranslations(), read from the .i18n.ts they come from.
 */
function translationKeys() {
	const keys = {};
	for (const { tag: tagName, className, path } of elements) {
		const file = existsSync(resolve(repoRoot, path)) ? readFileSync(resolve(repoRoot, path), 'utf8') : '';
		// A file can hold more than one element: read the class, with the imports above it.
		const start = file.search(new RegExp(`class ${className}\\b`));
		const next = file.slice(start + 1).search(/\nexport class /);
		const source = file.slice(0, file.search(/\n(export )?(abstract )?class /) + 1) + file.slice(start, next < 0 ? undefined : start + 1 + next);
		const name = source.match(/translate\(\s*this\.translations,\s*(nldd\w+Translations)/)?.[1] ?? source.match(/withTranslations(?:<[^>]*>)?\([^)]*?(nldd\w+Translations),?\s*\)/)?.[1];
		if (!name) continue;
		const from = source.match(new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from '([^']+)'`))?.[1];
		if (!from) throw new Error(`No import of ${name} in ${path}`);
		const i18n = readFileSync(resolve(repoRoot, dirname(path), from.replace(/\.js$/, '.ts')), 'utf8');
		const body = i18n.slice(i18n.indexOf(`export const ${name}`)).match(/=\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
		keys[tagName] = [...body.matchAll(/^\s*'([^']+)'\s*:/gm)].map((match) => match[1]).sort();
	}
	return Object.fromEntries(Object.keys(keys).sort().map((tag) => [tag, keys[tag]]));
}
const translations = translationKeys();

const pkg = read('package.json');
const stylesheets = shippedStylesheets().map((file) => readFileSync(file, 'utf8'));
// A context variable is API where variables.css gives it a default, or where a component documents it
// with @cssprop; the rest is wiring between components.
const contextDefaults = new Set(declarations(readFileSync(resolve(repoRoot, 'src/assets/styles/variables.css'), 'utf8')).map(({ name }) => name).filter((name) => name.startsWith('--context-')));
const isToken = (name) => TOKEN_PREFIX.test(name) && (!name.startsWith('--context-') || contextDefaults.has(name));
const stylesheetNames = new Set(stylesheets.flatMap((css) => declarations(css).map(({ name }) => name)));

/** Every custom property a component's source names outside a comment, skipping tests, stories and generated files. */
function sourceNames() {
	const names = new Set();
	const walk = (dir) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const path = resolve(dir, entry.name);
			if (entry.isDirectory()) walk(path);
			// dev-rules.generated.ts holds rule messages and is written below: reading it would make this run depend on the last one.
			else if (/\.ts$/.test(entry.name) && !/\.(test|stories|generated)\.ts$/.test(entry.name)) {
				for (const [name] of withoutComments(readFileSync(path, 'utf8')).matchAll(/--[a-z][a-z0-9-]*[a-z0-9](?![a-z0-9*-])/g)) names.add(name);
			}
		}
	};
	walk(resolve(repoRoot, 'src'));
	return names;
}
const inSource = sourceNames();

// A component documents the context variables an app may read with @cssprop, such as --context-inset-top on nldd-page.
const documented = elements.flatMap(({ tag, declaration }) => (declaration.cssProperties ?? []).map(({ name }) => ({ tag, name }))).filter(({ name }) => TOKEN_PREFIX.test(name));
const unused = documented.filter(({ name }) => !stylesheetNames.has(name) && !inSource.has(name));
if (unused.length > 0) throw new Error(`@cssprop names a custom property no stylesheet or component uses: ${unused.map(({ tag, name }) => `${name} on ${tag}`).join(', ')}`);
const tokens = [...new Set([...[...stylesheetNames].filter(isToken), ...documented.map(({ name }) => name)])].sort();
const tokenSet = new Set(tokens);
const designSystemRules = new Map();
for (const css of stylesheets) {
	for (const [key, names] of cssRules(css)) designSystemRules.set(key, new Set([...(designSystemRules.get(key) ?? []), ...names]));
}
const designSystemCss = Object.fromEntries([...designSystemRules.keys()].sort().map((key) => [key, [...designSystemRules.get(key)].sort()]));

const previousData = resolve(repoRoot, 'lint/data.generated.json');
const previous = existsSync(previousData) ? JSON.parse(readFileSync(previousData, 'utf8')) : {};

/**
 * Keeps a removal ledger: a name that was in the previous data and is gone now
 * gets the version that last had it; a name that came back leaves the ledger.
 */
function updateLedger(path, before, now) {
	const file = resolve(repoRoot, path);
	const ledger = existsSync(file) ? read(path) : {};
	const current = new Set(now);
	const added = before.filter((name) => !current.has(name) && !ledger[name]);
	for (const name of added) ledger[name] = { last: pkg.version };
	for (const name of current) delete ledger[name];
	// Only a person knows whether a name that left got another one, and `--fix` renames on it.
	if (added.length > 0) console.log(`${path}: added ${added.join(', ')}. Add "use" to each that got another name with the same meaning.`);
	const lines = Object.keys(ledger).sort().map((name) => `\t${JSON.stringify(name)}: ${JSON.stringify(ledger[name])}`);
	writeFileSync(file, `{\n${lines.join(',\n')}\n}\n`);
	return ledger;
}

const removedTokens = updateLedger('src/assets/styles/removed-tokens.json', previous.tokens ?? [], tokens);
const removedKeys = updateLedger('src/translations/removed-keys.json', Object.values(previous.translations ?? {}).flat(), Object.values(translations).flat());
// The events a component fires, from its @fires. An app listens by name, so a renamed event fails silently.
const events = [...new Set(elements.flatMap(({ declaration }) => (declaration.events ?? []).map(({ name }) => name)).filter((name) => /^[a-z][a-z0-9-]*$/.test(name)))].sort();
const removedEvents = updateLedger('src/components/removed-events.json', previous.events ?? [], events);
/**
 * Every other --context-* variable a component names outside a comment is wiring between components, which can
 * change in any release. A removed token stays out, so the linter keeps naming it as removed, with its successor.
 */
const internalContext = [...inSource].filter((name) => name.startsWith('--context-') && !tokenSet.has(name) && !removedTokens[name]).sort();

/**
 * Since when a rule exists: the last release without it, so `nldd upgrade` can tell
 * a finding that is new for a project from one it had already. A rule that is not
 * in the ledger yet came after the version this package has now.
 */
function updateIntroduced(path) {
	const file = resolve(repoRoot, path);
	const ledger = existsSync(file) ? read(path) : {};
	const lines = rules.map(({ id }) => `\t${JSON.stringify(id)}: ${JSON.stringify(ledger[id] ?? { after: pkg.version })}`).sort();
	writeFileSync(file, `{\n${lines.join(',\n')}\n}\n`);
	return Object.fromEntries(rules.map(({ id }) => [id, (ledger[id] ?? { after: pkg.version }).after]));
}
const introduced = updateIntroduced('src/rules/introduced.json');
for (const rule of rules) rule.after = introduced[rule.id];

const sorted = (object) => Object.fromEntries(Object.keys(object).sort().map((name) => [name, object[name]]));
const data = { tags, classes, icons, rules, tokens, internalContext, removedTokens: sorted(removedTokens), translations, removedKeys: sorted(removedKeys), events, removedEvents: sorted(removedEvents), designSystemCss };

writeFileSync(resolve(repoRoot, 'lint/data.generated.json'), `${JSON.stringify(data)}\n`);
writeFileSync(
	resolve(repoRoot, 'src/utilities/dev-rules.generated.ts'),
	`// Generated from src/rules/ by scripts/generate-lint-data.js. Do not edit.
import type { DevRule } from './dev-checks.js';

export const devRules: DevRule[] = ${JSON.stringify(buildDevRules(rules, classes, tags), null, '\t')};
`,
);
console.log(`lint data: ${Object.keys(data.tags).length} tags, ${data.rules.length} rules, ${tokens.length} tokens, ${designSystemRules.size} rules of design system CSS`);
