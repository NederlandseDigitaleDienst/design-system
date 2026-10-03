/**
 * Checks that every attribute and every named slot a component actually has is
 * documented.
 *
 * The JSDoc `@attr` block is hand-written and feeds skills/nldd-design/reference.md,
 * the plugin skill and anything generated from it. The existing drift check
 * only proves the generator ran: it compares generated output against generated
 * output, so a property that never reached the JSDoc stays invisible to it.
 * That is how nldd-top-title-bar ended up in the published reference with no
 * attributes at all while having seven.
 *
 * This script compares the other way round: from the `@property` decorators,
 * which are what the code really does, to the `@attr` lines. It reads the JSDoc
 * with the same parser as the reference generator, so the two cannot disagree.
 *
 * Only locally declared properties are required. Attributes a mixin brings in
 * belong to that mixin and are documented there, not copied into every
 * component that uses it.
 *
 * Documented-but-absent attributes are reported as a warning rather than an
 * error: some are plain attributes a parent sets on the host, without a
 * property behind them.
 *
 * Slots get the same treatment, from the `<slot name>` in the render template
 * to the `@slot` lines. nldd-top-navigation-bar shipped its `global` and
 * `utility` slots without either line, so the reference and the manifest listed
 * no slots for it and a consumer validating markup against them was told that
 * correct usage was wrong. The comparison is per file rather than per element:
 * a file with several elements shares one template file, and which template
 * belongs to which element is not something a regex should guess. The template
 * is read from the component file itself and from its `{name}.template.ts`
 * sibling, the structure every component follows. A component that renders from
 * a file named differently gets no slot check.
 *
 * Usage: node scripts/validate-component-api.js
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractComponentBlocks, extractLeadingBlock, parseComponent } from './lib/component-jsdoc.js';
import { declaredAttributes } from './lib/declared-attributes.js';
import { templateSlots } from './lib/template-slots.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const componentsDir = resolve(repoRoot, 'src/components');

const SKIP_SUFFIXES = ['.styles.ts', '.template.ts', '.test.ts', '.stories.ts', '.i18n.ts'];

/** Ships a custom element but is not consumer-facing; the reference skips it too. */
const INTERNAL_TAGS = new Set(['nldd-lqip-encoder']);

/**
 * Named slots a consumer never fills by name, keyed by the file's first element.
 * nldd-form-field-help-text assigns itself to `help`, so documenting that slot
 * would invite a `slot="help"` that the component overwrites anyway.
 *
 * The key is the first element because the comparison is per file. An internal
 * slot of a later element in a shared file is therefore listed under the first
 * element of that file, not under its own tag.
 */
const INTERNAL_SLOTS = new Map([['nldd-form-field', new Set(['help'])]]);

/**
 * Attributes the shared mixins bring in, read from the mixins themselves so the
 * list cannot go stale when one gains a property. They are documented with the
 * mixin, so a component neither has to repeat them nor is wrong for doing so.
 */
function mixinAttributes() {
	const utilities = resolve(repoRoot, 'src/utilities');
	const names = new Set();
	for (const file of readdirSync(utilities)) {
		if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;
		for (const name of declaredAttributes(readFileSync(join(utilities, file), 'utf8'))) names.add(name);
	}
	return names;
}

function collectFiles(dir) {
	const found = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...collectFiles(full));
		else if (entry.name.endsWith('.ts') && !SKIP_SUFFIXES.some((s) => entry.name.endsWith(s))) found.push(full);
	}
	return found;
}

/**
 * The class body belonging to each element. A file may ship several elements
 * (toolbar.ts has three), and reading it as a whole hands one element's
 * properties to another.
 */
function bodiesByTag(source) {
	const positions = [...source.matchAll(/@customElement\('([^']+)'\)/g)].map((m) => ({ tag: m[1], index: m.index }));
	const bodies = new Map();
	positions.forEach((position, i) => {
		bodies.set(position.tag, source.slice(position.index, positions[i + 1]?.index ?? source.length));
	});
	return bodies;
}

const MIXIN_ATTRIBUTES = mixinAttributes();

const problems = [];
const slotProblems = [];
const warnings = [];
let componentCount = 0;

for (const file of collectFiles(componentsDir)) {
	const source = readFileSync(file, 'utf8');
	const bodies = bodiesByTag(source);
	if (bodies.size === 0) continue;

	const block = extractLeadingBlock(source);
	const documentedByTag = new Map();
	if (block) {
		for (const parsed of parseComponent(block, file, [...bodies.keys()][0])) {
			documentedByTag.set(parsed.tag, new Set(parsed.attrs.map((a) => a.name)));
		}
	}

	for (const [tag, body] of bodies) {
		if (INTERNAL_TAGS.has(tag)) continue;
		componentCount += 1;
		const declared = declaredAttributes(body);
		const documented = documentedByTag.get(tag) ?? new Set();

		const undocumented = [...declared].filter((name) => !documented.has(name));
		if (undocumented.length > 0) {
			problems.push({ tag, file: file.replace(`${repoRoot}/`, ''), attributes: undocumented });
		}

		const absent = [...documented].filter((name) => !declared.has(name) && !MIXIN_ATTRIBUTES.has(name));
		if (absent.length > 0) warnings.push({ tag, attributes: absent });
	}

	const firstTag = [...bodies.keys()][0];
	if (INTERNAL_TAGS.has(firstTag)) continue;
	const templateFile = file.replace(/\.ts$/, '.template.ts');
	const rendered = templateSlots(source + (existsSync(templateFile) ? readFileSync(templateFile, 'utf8') : ''));
	const documentedSlots = new Set(
		extractComponentBlocks(source).flatMap((b) => parseComponent(b, file, firstTag).flatMap((c) => c.slots.map((slot) => slot.name))),
	);
	const internal = INTERNAL_SLOTS.get(firstTag) ?? new Set();
	const undocumentedSlots = [...rendered].filter((name) => !documentedSlots.has(name) && !internal.has(name));
	if (undocumentedSlots.length > 0) {
		slotProblems.push({ tag: [...bodies.keys()].join(', '), file: file.replace(`${repoRoot}/`, ''), slots: undocumentedSlots });
	}
}

console.log(`🔍 ${componentCount} componenten gecontroleerd\n`);

if (warnings.length > 0) {
	console.log('⚠️  Gedocumenteerd zonder eigen property (door een ouder gezet, of verouderd):');
	for (const { tag, attributes } of warnings) console.log(`   ${tag}: ${attributes.join(', ')}`);
	console.log('');
}

if (problems.length === 0 && slotProblems.length === 0) {
	console.log('✅ Elk attribuut heeft een @attr-regel en elk benoemd slot een @slot-regel.');
	process.exit(0);
}

if (problems.length > 0) {
	const total = problems.reduce((sum, p) => sum + p.attributes.length, 0);
	console.error(`❌ ${total} attributen in ${problems.length} componenten hebben geen @attr-regel:\n`);
	for (const { tag, file, attributes } of problems) {
		console.error(`   ${tag}  (${file})`);
		for (const name of attributes) console.error(`      @attr ${name}`);
	}
	console.error('');
}

if (slotProblems.length > 0) {
	const total = slotProblems.reduce((sum, p) => sum + p.slots.length, 0);
	console.error(`❌ ${total} benoemde slots in ${slotProblems.length} bestanden hebben geen @slot-regel:\n`);
	for (const { tag, file, slots } of slotProblems) {
		console.error(`   ${tag}  (${file})`);
		for (const name of slots) console.error(`      @slot ${name}`);
	}
	console.error('');
}

console.error('Voeg ze toe aan het JSDoc-blok van het component. Zonder die regel');
console.error('ontbreken ze in skills/nldd-design/reference.md, in custom-elements.json');
console.error('en in alles wat daaruit volgt.');
process.exit(1);
