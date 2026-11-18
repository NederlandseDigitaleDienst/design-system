import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePatternStories, patternToMarkdown, referenceTags, rewriteLink, storybookId } from './skill-patterns.js';

const context = {
	patterns: new Set(['confirm', 'edit-in-a-sheet']),
	tags: new Set(['nldd-sheet', 'nldd-title', 'nldd-top-title-bar']),
};

test('storybookId gives a title the id its stories are addressed by', () => {
	assert.equal(storybookId('Patronen/Bewerken in een sheet'), 'patronen-bewerken-in-een-sheet');
	assert.equal(storybookId('Docs/Ontwerprichtlijnen'), 'docs-ontwerprichtlijnen');
	assert.equal(storybookId("Patronen/Pagina's/Home"), 'patronen-pagina-s-home');
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

test('parsePatternStories reads a title in double quotes, for one with an apostrophe', () => {
	const stories = `import markup from './a.html?raw';

export default {
	title: "Patronen/Pagina's/Home",
};

export const Standaard = patternStory(markup);
`;
	assert.equal(parsePatternStories(stories).title, "Patronen/Pagina's/Home");
});

test('parsePatternStories refuses a story that renders something other than an html file', () => {
	assert.throws(() => parsePatternStories(`export default {\n\ttitle: 'Patronen/X',\n};\nexport const A = patternStory(elders);\n`), /geen geïmporteerd/);
});

test('rewriteLink sends a link to the website to the page a skill reader can open', () => {
	assert.equal(rewriteLink('/patronen/confirm/', context), 'confirm.md');
	assert.equal(rewriteLink('/componenten/sheet/', context), '../../nldd-design/reference.md#nldd-sheet');
	assert.equal(rewriteLink('/componenten/top-title-bar/', context), '../../nldd-design/reference.md#nldd-top-title-bar');
	assert.equal(rewriteLink('/richtlijnen/#visueel-en-layout', context), '../../nldd-design/design-guidelines.md#visueel-en-layout');
	assert.equal(rewriteLink('/themas/', context), 'https://design.digitaledienst.overheid.nl/themas/');
	assert.equal(
		rewriteLink('https://github.com/NederlandseDigitaleDienst/design-system/blob/main/skills/nldd-design-build/examples/bootstrap-vue.md', context),
		'../examples/bootstrap-vue.md',
	);
	assert.equal(rewriteLink('https://example.org/', context), 'https://example.org/');
});

test('rewriteLink fails on a link it cannot place', () => {
	assert.throws(() => rewriteLink('/componenten/bestaat-niet/', context), /reference\.md/);
	assert.throws(() => rewriteLink('/patronen/bestaat-niet/', context), /Geen patroon/);
	assert.throws(() => rewriteLink('?path=/docs/components-layout-sheet--docs', context), /Storybook-link/);
});

test('patternToMarkdown replaces the example marker with the markup and keeps code blocks as written', () => {
	const page = `# Bewerken in een sheet

Zie de [sheet](/componenten/sheet/).

\`\`\`html
<a href="/componenten/sheet/">blijft staan</a>
\`\`\`

<!-- voorbeeld: Standaard -->
`;
	const out = patternToMarkdown({ page, markup: { Standaard: '<nldd-sheet></nldd-sheet>\n' }, context });
	assert.equal(out, `# Patroon: bewerken in een sheet

Zie de [sheet](../../nldd-design/reference.md#nldd-sheet).

\`\`\`html
<a href="/componenten/sheet/">blijft staan</a>
\`\`\`

\`\`\`html
<nldd-sheet></nldd-sheet>
\`\`\`
`);
});

test('patternToMarkdown ends with the rules that point at the pattern', () => {
	const rules = [{ id: 'sheet-needs-name', severity: 'warn', message: 'Add `accessible-label`.' }];
	const out = patternToMarkdown({ page: '# Sheet\n\nTekst.\n', markup: {}, context, rules });
	assert.match(out, /Tekst\.\n\n## Regels\n\n`nldd lint` controleert dit:\n\n- `sheet-needs-name`: Add `accessible-label`\.\n$/);
});

test('patternToMarkdown refuses what is left of MDX, and an example without markup', () => {
	assert.throws(() => patternToMarkdown({ page: '<Source code="x" />\n', markup: {}, context }), /Geen Markdown/);
	assert.throws(() => patternToMarkdown({ page: '<!-- voorbeeld: Weg -->\n', markup: {}, context }), /Geen markup/);
});

test('referenceTags lists the components reference.md has a section for', () => {
	assert.deepEqual([...referenceTags('### `<nldd-sheet>`\n\ntekst\n\n### `<nldd-title>`\n')], ['nldd-sheet', 'nldd-title']);
});
