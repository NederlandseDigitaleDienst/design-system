import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sectionOrderErrors, sortSections } from './changelog-sections.js';

const block = (...sections) => sections.map((section) => `### ${section}\n\n- ${section.toLowerCase()}`).join('\n\n');

test('sections in order pass, also with some left out', () => {
	assert.deepEqual(sectionOrderErrors(`${block('Highlights', 'Breaking', 'Fixed')}\n\n## [0.1.0](x) (date)\n\n${block('Added', 'Changed')}\n`), []);
});

test('Breaking above Highlights fails, with the block it is in', () => {
	assert.deepEqual(sectionOrderErrors(`# Changelog\n\n## [0.2.0](x) (date)\n\n${block('Breaking', 'Highlights')}\n`), [
		'0.2.0: sections are Breaking, Highlights; they go Highlights, Breaking',
	]);
	assert.match(sectionOrderErrors(block('Fixed', 'Changed'))[0], /^the upcoming release:/);
});

test('an unknown or repeated section fails', () => {
	assert.match(sectionOrderErrors(block('Breaking Changes'))[0], /unknown section "### Breaking Changes"/);
	assert.match(sectionOrderErrors(block('Fixed', 'Fixed'))[0], /"### Fixed" more than once/);
});

test('sorting puts the sections in order and keeps what is around them', () => {
	const head = '# Changelog\n\nIntro.\n\n';
	const sorted = sortSections(`${head}${block('Breaking', 'Highlights', 'Fixed', 'Changed')}\n\n## [0.1.0](x) (date)\n\n${block('Added')}\n`);
	assert.equal(sorted, `${head}${block('Highlights', 'Breaking', 'Changed', 'Fixed')}\n\n## [0.1.0](x) (date)\n\n${block('Added')}\n`);
	assert.deepEqual(sectionOrderErrors(sorted), []);
});

test('a list of commits under the last section stays last', () => {
	const commits = '\n\n* feat: something ([abc](x))\n';
	assert.equal(sortSections(`## 0.1.0\n\n${block('Fixed', 'Added')}${commits}`), `## 0.1.0\n\n${block('Added', 'Fixed')}${commits}`);
});

test('a block with an unknown section is left as it is', () => {
	const text = `## 0.1.0\n\n${block('Fixed', 'Odd')}\n`;
	assert.equal(sortSections(text), text);
});
