import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePatternStories, patternToMarkdown, referenceTags, rewriteLink, storybookId } from './skill-patterns.js';

const context = {
	patterns: { 'patronen-bevestigen': 'confirm', 'patronen-bewerken-in-een-sheet': 'edit-in-a-sheet' },
	tags: new Set(['nldd-sheet', 'nldd-title', 'nldd-top-title-bar']),
};

test('storybookId follows how Storybook sanitizes a title', () => {
	assert.equal(storybookId('Patronen/Bewerken in een sheet'), 'patronen-bewerken-in-een-sheet');
	assert.equal(storybookId('Docs/Ontwerprichtlijnen'), 'docs-ontwerprichtlijnen');
});

test('parsePatternStories maps each story to the markup file it renders', () => {
	const stories = `import markup from './a.html?raw';
import leeg from './a.leeg.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: 'Patronen/Bevestigen',
};

export const Standaard = patternStory(markup);
export const Leeg = patternStory(leeg, (root) => {});
`;
	assert.deepEqual(parsePatternStories(stories), {
		title: 'Patronen/Bevestigen',
		markup: { Standaard: 'a.html', Leeg: 'a.leeg.html' },
	});
});

test('parsePatternStories refuses a story that renders something other than an html file', () => {
	assert.throws(() => parsePatternStories(`export default {\n\ttitle: 'Patronen/X',\n};\nexport const A = patternStory(elders);\n`), /geen geïmporteerd/);
});

test('rewriteLink sends Storybook links to the page a skill reader can open', () => {
	assert.equal(rewriteLink('?path=/docs/patronen-bevestigen--docs', context), 'confirm.md');
	assert.equal(rewriteLink('?path=/docs/components-layout-sheet--docs', context), '../../nldd-design/reference.md#nldd-sheet');
	assert.equal(rewriteLink('?path=/docs/components-navigation-top-title-bar--docs', context), '../../nldd-design/reference.md#nldd-top-title-bar');
	assert.equal(rewriteLink('?path=/docs/docs-ontwerprichtlijnen--docs', context), '../../nldd-design/design-guidelines.md');
	assert.equal(
		rewriteLink('https://github.com/NederlandseDigitaleDienst/design-system/blob/main/skills/nldd-design-build/examples/bootstrap-vue.md', context),
		'../examples/bootstrap-vue.md',
	);
	assert.equal(rewriteLink('https://example.org/', context), 'https://example.org/');
});

test('rewriteLink fails on a Storybook link it cannot place', () => {
	assert.throws(() => rewriteLink('?path=/docs/components-layout-bestaat-niet--docs', context), /reference\.md/);
	assert.throws(() => rewriteLink('?path=/story/components-layout-sheet--standaard', context), /Onbekende/);
});

test('patternToMarkdown replaces the canvas with the markup and keeps code blocks as written', () => {
	const mdx = `import { Meta, Canvas } from '@storybook/addon-docs/blocks';
import * as Stories from './x.stories';

<Meta of={Stories} />

# Bewerken in een sheet

Zie de [sheet](?path=/docs/components-layout-sheet--docs).

\`\`\`html
<a href="?path=/docs/iets--docs">blijft staan</a>
\`\`\`

<Canvas of={Stories.Standaard} />
`;
	const out = patternToMarkdown({ mdx, markup: { Standaard: '<nldd-sheet></nldd-sheet>\n' }, context });
	assert.equal(out, `# Patroon: bewerken in een sheet

Zie de [sheet](../../nldd-design/reference.md#nldd-sheet).

\`\`\`html
<a href="?path=/docs/iets--docs">blijft staan</a>
\`\`\`

\`\`\`html
<nldd-sheet></nldd-sheet>
\`\`\`
`);
});

test('patternToMarkdown drops only real imports, not prose that starts with the word', () => {
	const mdx = "import * as Stories from './x.stories';\nimport { Meta } from '@storybook/addon-docs/blocks';\n\nimport lijkt kapot.\n";
	assert.equal(patternToMarkdown({ mdx, markup: {}, context }), 'import lijkt kapot.\n');
});

test('patternToMarkdown refuses MDX it cannot translate', () => {
	assert.throws(() => patternToMarkdown({ mdx: '<Source code="x" />\n', markup: {}, context }), /Niet te vertalen/);
	assert.throws(() => patternToMarkdown({ mdx: '<Canvas of={Stories.Weg} />\n', markup: {}, context }), /Geen markup/);
});

test('referenceTags lists the components reference.md has a section for', () => {
	assert.deepEqual([...referenceTags('### `<nldd-sheet>`\n\ntekst\n\n### `<nldd-title>`\n')], ['nldd-sheet', 'nldd-title']);
});
