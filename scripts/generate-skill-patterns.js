/**
 * Generates the pattern pages of the nldd-design-build skill from their
 * Storybook pages.
 *
 * Every directory in src/patterns/ holds one pattern: its example markup as
 * .html, the stories that render it and the .mdx page around it. The
 * translation itself lives in scripts/lib/skill-patterns.js; this script finds
 * the files, supplies what the links resolve against and writes the result to
 * skills/nldd-design-build/patterns/<slug>.md.
 *
 * WARNING: overwrites those files in place. Run `npm run generate:skill-docs`
 * after editing a pattern and commit the result.
 *
 * Usage: node scripts/generate-skill-patterns.js
 */

import { existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedHeader, readSource, writeGenerated } from './lib/skill-doc.js';
import { parsePatternStories, patternToMarkdown, referenceTags, storybookId } from './lib/skill-patterns.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const patternsDir = resolve(__dirname, '../src/patterns');
const outputDir = resolve(__dirname, '../skills/nldd-design-build/patterns');
const referencePath = resolve(__dirname, '../skills/nldd-design/reference.md');

/** The set of patterns: Storybook title to the file name in the skill. */
const PATTERNS = {
	'Patronen/Pagina met secties': 'page-with-sections',
	'Patronen/Werkbalk met acties': 'toolbar-with-actions',
	'Patronen/Lijst met rijen': 'list-with-rows',
	'Patronen/Een lijst filteren': 'filter-a-list',
	'Patronen/Formulier': 'form',
	'Patronen/Menu bij een knop': 'menu-from-a-button',
	'Patronen/Bewerken in een sheet': 'edit-in-a-sheet',
	'Patronen/Bevestigen': 'confirm',
};

const context = {
	patterns: Object.fromEntries(Object.entries(PATTERNS).map(([title, slug]) => [storybookId(title), slug])),
	tags: referenceTags(readSource(referencePath, 'Draai eerst npm run generate:component-reference.')),
};

const slugs = readdirSync(patternsDir, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name);

for (const slug of slugs) {
	const dir = join(patternsDir, slug);
	const { title, markup: files } = parsePatternStories(readSource(join(dir, `${slug}.stories.ts`)));
	if (PATTERNS[title] !== slug) {
		console.error(`${slug}: de title "${title}" hoort niet bij deze map. Pas PATTERNS aan of de title.`);
		process.exit(1);
	}
	const markup = Object.fromEntries(
		Object.entries(files).map(([story, file]) => {
			const path = join(dir, file);
			if (!existsSync(path)) {
				console.error(`${slug}: ${file} bestaat niet.`);
				process.exit(1);
			}
			return [story, readSource(path)];
		}),
	);
	const body = patternToMarkdown({ mdx: readSource(join(dir, `${slug}.mdx`)), markup, context });
	const header = generatedHeader(`Bron: src/patterns/${slug}/ (de .mdx-pagina en de .html-voorbeelden ernaast).`);
	writeGenerated(join(outputDir, `${slug}.md`), header + body);
}
