/**
 * Generates skills/nldd-design/reference.md from component JSDoc.
 *
 * Walks src/components, parses the leading JSDoc block of each component
 * entry file for @element, @attr, @slot and @fires tags, and emits one
 * markdown section per component, grouped by category. This keeps the
 * consumer-facing reference in sync with the source: the JSDoc is the
 * single source of truth.
 *
 * WARNING: this script overwrites skills/nldd-design/reference.md in-place.
 * After changing a component's public API (attributes, slots, events),
 * run `npm run generate:component-reference` and commit the result.
 *
 * Usage: node scripts/generate-component-reference.js
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedHeader, writeGenerated } from './lib/skill-doc.js';
import { extractComponentBlocks, extractLeadingBlock, parseComponent, parseTypedTag, parseNamedTag } from './lib/component-jsdoc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(__dirname, '../src/components');
const outputPath = resolve(__dirname, '../skills/nldd-design/reference.md');

// Human-readable titles for the category directories, in display order.
const CATEGORY_TITLES = {
	actions: 'Actions',
	content: 'Content',
	forms: 'Forms',
	inputs: 'Inputs',
	layout: 'Layout',
	'lists-and-menus': 'Lists & menus',
	navigation: 'Navigation',
	'status-and-feedback': 'Status & feedback',
};

// File suffixes that are never the component entry file.
const NON_ENTRY_SUFFIXES = [
	'.styles.ts',
	'.template.ts',
	'.stories.ts',
	'.test.ts',
	'.i18n.ts',
];

/** Recursively collect candidate component entry files (*.ts, excluding the non-entry suffixes). */
function collectEntryFiles(dir) {
	const files = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...collectEntryFiles(full));
			continue;
		}
		if (!entry.name.endsWith('.ts')) continue;
		if (NON_ENTRY_SUFFIXES.some((suffix) => entry.name.endsWith(suffix))) continue;
		if (entry.name === 'index.ts') continue;
		files.push(full);
	}
	return files;
}


function escapeCell(text) {
	return (text || '').replace(/\|/g, '\\|');
}

/** Render one component as a markdown section. */
function renderComponent(c) {
	const out = [`### \`<${c.tag}>\``, ''];
	if (c.summary) {
		out.push(c.summary, '');
	}
	if (c.attrs.length) {
		out.push('**Attributes**', '');
		out.push('| Attribute | Type | Description |');
		out.push('| --- | --- | --- |');
		for (const a of c.attrs) {
			out.push(
				`| \`${escapeCell(a.name)}\` | ${a.type ? `\`${escapeCell(a.type)}\`` : '—'} | ${escapeCell(a.description) || '—'} |`,
			);
		}
		out.push('');
	}
	if (c.slots.length) {
		out.push('**Slots**', '');
		out.push('| Slot | Description |');
		out.push('| --- | --- |');
		for (const s of c.slots) {
			out.push(
				`| ${s.name ? `\`${escapeCell(s.name)}\`` : '_(default)_'} | ${escapeCell(s.description) || '—'} |`,
			);
		}
		out.push('');
	}
	if (c.events.length) {
		out.push('**Events**', '');
		out.push('| Event | Description |');
		out.push('| --- | --- |');
		for (const e of c.events) {
			out.push(`| \`${escapeCell(e.name)}\` | ${escapeCell(e.description) || '—'} |`);
		}
		out.push('');
	}
	return out.join('\n');
}

// The pure parsing helpers (and componentsDir, for path-derived assertions) are
// exported so they can be unit-tested without triggering the file-walking and
// file-writing side effects of the main routine.
/**
 * Attributes a mixin adds, keyed by mixin name. Read from the `@mixin` /
 * `@attr` tags in the mixin's own JSDoc, so they are written once next to the
 * code that implements them instead of copied into every component.
 */
function collectMixinAttrs() {
	const dir = join(componentsDir, '..', 'utilities');
	const found = new Map();
	for (const entry of readdirSync(dir)) {
		if (!entry.endsWith('-mixin.ts')) continue;
		const source = readFileSync(join(dir, entry), 'utf-8');
		const name = source.match(/@mixin\s+(\w+)/)?.[1];
		if (!name) continue;
		const attrs = [];
		for (const line of source.split('\n')) {
			const rest = line.match(/^\s*\*\s*@attr\s+(.*)$/)?.[1];
			if (rest) attrs.push(parseTypedTag(rest));
		}
		if (attrs.length) found.set(name, attrs);
	}
	return found;
}

export { parseTypedTag, parseNamedTag, parseComponent, extractLeadingBlock, escapeCell, componentsDir };

// --- Main ---

// Internal helpers that ship a custom element but are not part of the public,
// consumer-facing surface. Exclude them from the reference.
const INTERNAL_TAGS = new Set(['nldd-lqip-encoder']);

// --- Icon names ---
// The valid `icon` values are the SVG filenames in the icon
// folder plus the aliases. Both are build inputs, so we read them directly to
// give consumers an offline, in-sync catalog instead of "see Storybook".

function collectIconNames() {
	const iconsDir = resolve(componentsDir, 'content/icon/icons');
	const aliasesFile = resolve(componentsDir, 'content/icon/icon-aliases.js');
	let entries;
	try {
		entries = readdirSync(iconsDir);
	} catch (err) {
		if (err.code === 'ENOENT') {
			throw new Error(`Icon directory not found at ${iconsDir}.`);
		}
		throw err;
	}
	const names = entries
		.filter((f) => f.endsWith('.svg'))
		.map((f) => f.slice(0, -4));
	let aliases = [];
	try {
		const src = readFileSync(aliasesFile, 'utf-8');
		// Match both single- and double-quoted keys so a formatter rewriting
		// icon-aliases.js to double quotes does not silently drop every alias.
		aliases = [...src.matchAll(/^\s*['"]([^'"]+)['"]\s*:/gm)].map((m) => m[1]);
	} catch (err) {
		// The aliases file is optional; only a missing file is tolerated.
		// Surface anything else (permission, read errors) instead of hiding it.
		if (err.code !== 'ENOENT') throw err;
	}
	return { names: names.sort(), aliases: aliases.sort() };
}

function renderIcons({ names, aliases }) {
	const out = [
		'## Iconen',
		'',
		`Geldige waarden voor \`icon\`, op \`<nldd-icon>\` en op elk component dat een icoon rendert (${names.length} iconen` +
			`${aliases.length ? ` + ${aliases.length} aliassen` : ''}). Verzin geen naam; kies er een uit deze set.`,
		'',
		'**Iconen**',
		'',
		names.map((n) => `\`${n}\``).join(', '),
		'',
	];
	if (aliases.length) {
		out.push('**Aliassen** (verwijzen naar een icoon hierboven)', '');
		out.push(aliases.map((n) => `\`${n}\``).join(', '), '');
	}
	return out.join('\n');
}

function main() {
	const entryFiles = collectEntryFiles(componentsDir);
	const mixinAttrs = collectMixinAttrs();
	const components = [];
	for (const file of entryFiles) {
		const source = readFileSync(file, 'utf-8');
		const ceMatch = source.match(/@customElement\(['"]([^'"]+)['"]\)/);
		const fallbackTag = ceMatch ? ceMatch[1] : null;
		for (const block of extractComponentBlocks(source)) {
			for (const parsed of parseComponent(block, file, fallbackTag)) {
				if (parsed.tag && !INTERNAL_TAGS.has(parsed.tag)) {
					// A mixin's attributes are as real to a consumer as the
					// component's own, but they live in another file, so the
					// component's JSDoc never mentions them and the table left
					// them out entirely.
					for (const [name, attrs] of mixinAttrs) {
						if (!source.includes(`${name}(`)) continue;
						for (const attr of attrs) {
							if (!parsed.attrs.some((a) => a.name === attr.name)) parsed.attrs.push(attr);
						}
					}
					components.push(parsed);
				}
			}
		}
	}

	// Group by category, in the declared order; unknown categories come last.
	const byCategory = new Map();
	for (const c of components) {
		if (!byCategory.has(c.category)) byCategory.set(c.category, []);
		byCategory.get(c.category).push(c);
	}

	const orderedCategories = [
		...Object.keys(CATEGORY_TITLES).filter((k) => byCategory.has(k)),
		...[...byCategory.keys()].filter((k) => !(k in CATEGORY_TITLES)).sort(),
	];

	const header = generatedHeader(
		[
			'Bron: de JSDoc (@element / @attr / @slot / @fires) van elk component in',
			'src/components, plus de iconnamen uit content/icon/icons en icon-aliases.',
		],
		'npm run generate:component-reference',
	);

	const intro = `# Componentreferentie — @nldd/design-system

Elk custom element met zijn attributen, slots en events. Dit is een offline
snelreferentie; de levende documentatie met voorbeelden staat in
[Storybook](https://nederlandsedigitaledienst.github.io/design-system/), en de exacte types staan in
de \`.d.ts\` bestanden van het pakket.

> Deze referentie komt uit de JSDoc van de componenten. Dat elk attribuut er
> in staat, wordt in CI afgedwongen: \`npm run validate:component-api\`
> vergelijkt de \`@property\`-decorators met de \`@attr\`-regels.

`;

	const sections = [];
	let total = 0;
	for (const cat of orderedCategories) {
		const list = byCategory.get(cat).sort((a, b) => a.tag.localeCompare(b.tag));
		total += list.length;
		const title = CATEGORY_TITLES[cat] || cat;
		sections.push(`## ${title}\n`);
		sections.push(list.map(renderComponent).join('\n'));
	}

	// Read the icon catalog once and reuse it for both rendering and the summary.
	const iconInfo = collectIconNames();
	sections.push(renderIcons(iconInfo));

	const body = header + intro + sections.join('\n');
	writeGenerated(outputPath, body.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
	console.log(`Components: ${total} across ${orderedCategories.length} categories`);
	console.log(`Icons: ${iconInfo.names.length} names + ${iconInfo.aliases.length} aliases`);
}

// Run the generator only when executed directly, not when imported for tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main();
}
