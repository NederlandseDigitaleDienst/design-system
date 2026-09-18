/**
 * Checks the nldd-* markup in the hand-written skill docs against the real API.
 *
 * reference.md is generated, so it cannot drift: a stale attribute there fails
 * the drift check in CI. SKILL.md, patterns/*.md and examples/*.md are written
 * by hand and nothing checked them, so a renamed attribute could sit in the
 * consumer skill until someone hit it in their own app. Those code blocks are
 * what a consumer (or an agent reading the skill) copies, so a tag or attribute
 * that does not exist is a bug we ship.
 *
 * It reads the same JSDoc as generate-component-reference.js and
 * validate-component-api.js, through the same parser, so the three cannot
 * disagree about what the API is. The checking itself lives in
 * lib/skill-markup.js so it can be unit-tested without this file walking.
 *
 * What it flags: an unknown `<nldd-*>` tag, an attribute the tag does not
 * document (mixin attributes included), a `slot=` the surrounding component does
 * not declare, and an `<nldd-icon name>` outside the icon set.
 *
 * Usage: node scripts/validate-skill-markup.js
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractComponentBlocks, parseComponent } from './lib/component-jsdoc.js';
import { declaredAttributes } from './lib/declared-attributes.js';
import { checkMarkup } from './lib/skill-markup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const componentsDir = resolve(repoRoot, 'src/components');
const skillDir = resolve(repoRoot, 'skills/nldd');

const SKIP_SUFFIXES = ['.styles.ts', '.template.ts', '.test.ts', '.stories.ts', '.i18n.ts'];

function collectFiles(dir) {
	const found = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...collectFiles(full));
		else if (entry.name.endsWith('.ts') && !SKIP_SUFFIXES.some((s) => entry.name.endsWith(s)))
			found.push(full);
	}
	return found;
}

/** The public API per tag, straight from the component JSDoc. */
function collectApi() {
	const api = new Map();
	for (const file of collectFiles(componentsDir)) {
		const source = readFileSync(file, 'utf8');
		for (const block of extractComponentBlocks(source)) {
			for (const component of parseComponent(block, file) ?? []) {
				if (!component.tag) continue;
				api.set(component.tag, {
					attrs: new Set(component.attrs.map((a) => a.name)),
					slots: new Set(component.slots.map((s) => s.name)),
				});
			}
		}
	}
	return api;
}

/** Attributes the shared mixins bring in; documented with the mixin, not per component. */
function mixinAttributes() {
	const utilities = resolve(repoRoot, 'src/utilities');
	const names = new Set();
	for (const file of readdirSync(utilities)) {
		if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;
		for (const name of declaredAttributes(readFileSync(join(utilities, file), 'utf8')))
			names.add(name);
	}
	return names;
}

/** Icon names plus aliases, the same set the reference publishes. */
function collectIconNames() {
	const iconsDir = resolve(componentsDir, 'content/icon/icons');
	const aliasesFile = resolve(componentsDir, 'content/icon/icon-aliases.js');
	const names = new Set(
		readdirSync(iconsDir)
			.filter((f) => f.endsWith('.svg'))
			.map((f) => f.slice(0, -4)),
	);
	try {
		const src = readFileSync(aliasesFile, 'utf-8');
		for (const m of src.matchAll(/^\s*['"]([^'"]+)['"]\s*:/gm)) names.add(m[1]);
	} catch (err) {
		// The aliases file is optional; only a missing file is tolerated.
		if (err.code !== 'ENOENT') throw err;
	}
	return names;
}

/** The hand-written skill files. reference.md and changelog.md are generated. */
function skillFiles() {
	const files = [join(skillDir, 'SKILL.md')];
	for (const sub of ['patterns', 'examples']) {
		const dir = join(skillDir, sub);
		let entries;
		try {
			entries = readdirSync(dir);
		} catch (err) {
			if (err.code === 'ENOENT') continue;
			throw err;
		}
		for (const name of entries.filter((f) => f.endsWith('.md')).sort())
			files.push(join(dir, name));
	}
	return files;
}

const api = collectApi();
const options = {
	api,
	mixinAttrs: mixinAttributes(),
	iconNames: collectIconNames(),
};

const errors = [];
let checked = 0;

for (const file of skillFiles()) {
	const rel = relative(repoRoot, file);
	let source;
	try {
		source = readFileSync(file, 'utf8');
	} catch (err) {
		if (err.code === 'ENOENT') continue;
		throw err;
	}
	const problems = checkMarkup(source, options);
	checked += (source.match(/<nldd-[a-z0-9-]*[^>]*>/g) ?? []).filter(
		(t) => !t.startsWith('</'),
	).length;
	for (const { line, message } of problems) errors.push(`${rel}:${line}: ${message}`);
}

if (errors.length > 0) {
	console.error(`${errors.length} fout(en) in de hand-geschreven skill-documentatie:\n`);
	for (const error of errors) console.error(`  ${error}`);
	console.error(
		'\nDeze bestanden worden door consumenten en agents gekopieerd, dus een tag of\n' +
			'attribuut dat niet bestaat is een fout die we uitleveren. De huidige API\n' +
			'staat in skills/nldd/reference.md.',
	);
	process.exit(1);
}

console.log(
	`skill-markup in orde: ${checked} nldd-elementen gecontroleerd tegen ${api.size} componenten.`,
);
