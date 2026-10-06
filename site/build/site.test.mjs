import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildPages } from './site.js';
import { collectComponents, repoRoot, storyName } from './sources.js';
import { controlFor } from './attribute-values.js';
import { headingId, renderMarkdown } from './markdown.js';

function storyFiles(dir, found = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) storyFiles(full, found);
		else if (entry.name.endsWith('.stories.ts')) found.push(full);
	}
	return found;
}

const { pages, counts } = buildPages();

test('every component with stories gets a page', () => {
	const files = storyFiles(resolve(repoRoot, 'src/components'));
	assert.equal(counts.components, files.length);
	const componentPages = Object.keys(pages).filter((path) => /^componenten\/[^/]+\/index\.html$/.test(path));
	assert.equal(componentPages.length, files.length);
});

test('every pattern directory gets a page', () => {
	const directories = readdirSync(resolve(repoRoot, 'src/patterns'), { withFileTypes: true }).filter((e) => e.isDirectory());
	assert.equal(counts.patterns, directories.length);
	for (const { name } of directories) assert.ok(pages[`patronen/${name}/index.html`], name);
});

test('every link to a page of the site leads to a page that exists', () => {
	const broken = [];
	for (const [path, html] of Object.entries(pages)) {
		for (const [, target] of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
			if (/\.(svg|png|css)$/.test(target)) continue;
			if (!pages[`${target.slice(1)}index.html`]) broken.push(`${path} -> ${target}`);
		}
	}
	assert.deepEqual(broken, []);
});

test('no page still points into Storybook', () => {
	const stale = Object.entries(pages)
		.filter(([path, html]) => path !== 'changelog/index.html' && /\?path=\/|<Canvas|<Meta/.test(html))
		.map(([path]) => path);
	assert.deepEqual(stale, []);
});

test('a page under a deploy base links within that base', () => {
	const based = buildPages({ base: '/design-system/' }).pages['index.html'];
	assert.match(based, /href="\/design-system\/componenten\/"/);
	// Vite adds the base to the entry script and the icons itself.
	assert.match(based, /src="\/main\.ts"/);
	assert.match(based, /<link rel="icon"[^>]*href="\/favicon\.svg"/);
	assert.doesNotMatch(based, /href="\/componenten\//);
});

test('each example of a component stands on a stage, and the first one carries the controls', () => {
	const button = pages['componenten/button/index.html'];
	const stages = button.match(/<site-stage /g) ?? [];
	const component = collectComponents().find((c) => c.slug === 'button');
	assert.equal(stages.length, component.stories.filter((s) => !s.hidden).length);
	assert.equal((button.match(/<site-stage [^>]*primary/g) ?? []).length, 1);
	assert.match(button, /"name":"appearance"[^}]*"kind":"select","values":\["primary","secondary"/);
});

test('controlFor reads the values of a named type from the source', () => {
	const file = resolve(repoRoot, 'src/components/actions/button/button.ts');
	const size = controlFor(file, { name: 'size', type: { text: 'Size' }, default: "'md'" });
	assert.deepEqual(size, { name: 'size', default: 'md', description: '', kind: 'select', values: ['xs', 'sm', 'md', 'lg'], strict: true });
	assert.equal(controlFor(file, { name: 'disabled', type: { text: 'boolean' } }).kind, 'boolean');
	assert.equal(controlFor(file, { name: 'translations', type: { text: 'Partial<T>' } }), null);
});

test('controlFor offers values named in prose as suggestions, not as the only choices', () => {
	const control = controlFor('nowhere.ts', {
		name: 'layout',
		type: { text: 'string' },
		description: "'stack' | 'row' | 'wrap' (default: 'stack')",
	});
	assert.deepEqual(control.values, ['stack', 'row', 'wrap']);
	assert.equal(control.strict, false);
});

test('renderMarkdown keeps prose, code and examples apart', () => {
	const { title, html } = renderMarkdown('# Titel\n\nTekst met een [link](/componenten/).\n\n```html\n<nldd-tag></nldd-tag>\n```\n\n<!-- voorbeeld: Standaard -->\n', {
		href: (path) => `/base${path}`,
		example: (name) => `<site-stage story="${name}"></site-stage>`,
	});
	assert.equal(title, 'Titel');
	assert.match(html, /<nldd-rich-text><h1 id="titel">Titel<\/h1>/);
	assert.match(html, /<a href="\/base\/componenten\/">link<\/a>/);
	assert.match(html, /<nldd-code-viewer language="html">&lt;nldd-tag&gt;&lt;\/nldd-tag&gt;<\/nldd-code-viewer>/);
	assert.match(html, /<site-stage story="Standaard"><\/site-stage>/);
	assert.doesNotMatch(html, /<nldd-rich-text>[^]*<nldd-code-viewer[^]*<\/nldd-rich-text>/);
});

test('headingId matches the anchors the guidelines are linked by', () => {
	assert.equal(headingId('Visueel en layout'), 'visueel-en-layout');
	assert.equal(headingId('Feedback en state'), 'feedback-en-state');
});

test('storyName reads an export name as a heading', () => {
	assert.equal(storyName('KlikbareKaart'), 'Klikbare kaart');
	assert.equal(storyName('Standaard'), 'Standaard');
});

test('the skills the site names are the skills the plugin ships', async () => {
	const { SKILLS } = await import('./skills.js');
	const shipped = readdirSync(resolve(repoRoot, 'skills'), { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && entry.name !== 'nldd')
		.map((entry) => entry.name)
		.sort();
	assert.deepEqual(SKILLS.map((skill) => skill.name).sort(), shipped);
});

test('the landing page and the getting-started page both show how to install the skills', () => {
	for (const path of ['index.html', 'aan-de-slag/index.html', 'aan-de-slag/ai-assistent/index.html']) {
		assert.match(pages[path], /\/plugin install nldd-design-system@nldd/, path);
		assert.match(pages[path], /nldd-design-migrate/, path);
	}
});
