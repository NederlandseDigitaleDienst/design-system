import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
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
	// The icon gallery is a stories file among the components that belongs to
	// the icons page.
	const files = storyFiles(resolve(repoRoot, 'src/components')).filter((file) => !file.endsWith('icon-gallery.stories.ts'));
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

test('the landing page is the one written by hand, with the head every page has', () => {
	const written = readFileSync(resolve(repoRoot, 'www/index.html'), 'utf8');
	// Everything from the first section on is the file as it was written.
	const content = (html) => html.slice(html.indexOf('</nldd-skip-link>'));
	assert.equal(content(pages['index.html']), content(written));
	assert.match(pages['index.html'], /<link rel="stylesheet" href="\/home\.css">/);
	assert.match(pages['index.html'], /<script type="module" src="\/home\.ts"><\/script>/);
	// The page leads to the parts of the system itself: the bar has no menus.
	assert.doesNotMatch(pages['index.html'], /<nldd-menu-bar\b/);
});

test('every page behind the landing page is an application: a toolbar around a split view, without the bar of the landing page', () => {
	for (const path of ['componenten/button/index.html', 'patronen/form/index.html', 'richtlijnen/index.html']) {
		assert.match(pages[path], /<nldd-bar-split-view>[^]*<nldd-navigation-split-view slot="main">/, path);
		assert.match(pages[path], /data-site-home\s*>\s*<nldd-icon-button\s+icon="chevron-left"\s+text="Home"\s+href="\/"/, path);
		assert.match(pages[path], /text="Documentatie"\s+heading-level="2"\s+back-text="Home"\s+back-href="\/"/, path);
		assert.match(pages[path], /<nldd-toolbar-title\s+slot="start"\s+text="NLDD Designsysteem"\s+min-width="0"/, path);
		assert.match(pages[path], /<nldd-page[^]*?slot="footer"[^]*?<nldd-link-group accessible-label="Over deze site" size="sm">/, path);
		assert.doesNotMatch(pages[path], /nldd-top-navigation-bar|nldd-page-footer|nldd-breadcrumbs/, path);
		for (const href of ['/componenten/', '/patronen/', '/themas/', '/toegankelijkheid/', '/changelog/']) {
			assert.ok(pages[path].includes(`href="${href}"`), `${path} mist ${href}`);
		}
	}
});

test('the title of a page names its section, except on the section itself', () => {
	const title = (path) => pages[path].match(/<title>([^<]*)<\/title>/)[1];
	assert.equal(title('componenten/button/index.html'), 'Button · Componenten · NLDD Designsysteem');
	assert.equal(title('patronen/home-page/index.html'), 'Home · Patronen · NLDD Designsysteem');
	assert.equal(title('componenten/index.html'), 'Componenten · NLDD Designsysteem');
});

test('a page marks its section in the first sidebar, itself in the second, and goes back to that list', () => {
	const button = pages['componenten/button/index.html'];
	assert.match(button, /<nldd-list-item href="\/componenten\/" current>/);
	assert.match(button, /<nldd-list-item\s+href="\/componenten\/button\/"\s+current\s/);
	assert.match(button, /<nldd-search-field\s+data-site-filter\s+placeholder="Component zoeken"/);
	assert.match(button, /data-site-search="icon button icon-button acties icoonknop knop actions"/);
	// Each row names the pages it relates to, which the search lists under its matches.
	assert.match(button, /data-site-slug="sheet"\s+data-site-related="modal-dialog popover window"/);
	assert.match(button, /<nldd-container\s+data-site-filter-related\s+hidden\s*>/);
	// A keyword finds what its name does not: a toast is a notification.
	assert.match(button, /data-site-search="notification notification status en feedback toast snackbar melding status &amp; feedback"/);
	assert.match(button, /slot="main"\s+landmarks="page"[^]*back-text="Componenten"\s+back-href="\/componenten\/"/);
	// A page without a list of its own goes back to the sections.
	assert.match(pages['iconen/index.html'], /slot="main"\s+landmarks="page"[^]*back-text="Documentatie"\s+back-href="\/documentatie\/"/);
});

test('the sections have a page of their own, with only the first sidebar and nothing chosen', () => {
	const docs = pages['documentatie/index.html'];
	assert.match(docs, /slot="primary-sidebar"/);
	assert.doesNotMatch(docs, /slot="secondary-sidebar"/);
	assert.match(docs, /<nldd-page\s+slot="main"\s+empty\s[^]*text="Kies een onderdeel"/);
	assert.doesNotMatch(docs, / current[\s>]/);
});

test('an overview has the list and an empty main, so a phone opens on the list', () => {
	const overview = pages['componenten/index.html'];
	assert.match(overview, /slot="secondary-sidebar"/);
	assert.match(overview, /<nldd-page\s+slot="main"\s+empty\s/);
	assert.match(overview, /<nldd-inline-dialog text="Kies een component">/);
});

test('a page behind the landing page can be shown in another theme, set before the first paint', () => {
	const button = pages['componenten/button/index.html'];
	assert.match(button, /<script vite-ignore src="\/theme\.js"><\/script>\s*<script type="module"/);
	assert.match(button, /data-site-theme-picker[^]*<nldd-swatch-picker-item[^>]*value="groen"/);
	assert.match(button, /data-site-scheme[^]*value="dark"/);
	// The landing page has a picker of its own.
	assert.doesNotMatch(pages['index.html'], /data-site-theme|theme\.js/);
});

test('a component has a page per tab: usage, examples, API and lint rules', () => {
	const usage = pages['componenten/button/index.html'];
	const examples = pages['componenten/button/voorbeelden/index.html'];
	const api = pages['componenten/button/api/index.html'];
	const rules = pages['componenten/button/lintregels/index.html'];
	assert.match(usage, /<nldd-tab-bar\s+navigation[^]*href="\/componenten\/button\/"\s+text="Gebruik"\s+current/);
	assert.match(examples, /href="\/componenten\/button\/voorbeelden\/"\s+text="Voorbeelden"\s+current/);
	assert.match(api, /href="\/componenten\/button\/api\/"\s+text="API"\s+current/);
	assert.match(api, /<h2 id="nldd-button">/);
	assert.doesNotMatch(api, /<site-stage/);
	assert.match(rules, /text="Lintregels"\s+current[^]*<h2>Lintregels<\/h2>/);
	// The sidebar marks the component on every tab.
	for (const page of [usage, examples, api, rules]) assert.match(page, /href="\/componenten\/button\/"\s+current/);
});

test('a component opens with one paragraph, and the rest lives on a tab', () => {
	// What an attribute does is on API, how the component works is in the JSDoc
	// of its class, and a case is a story of its own. Only the code under
	// Gebruik may follow the introduction, and the stage already shows that.
	const wrong = [];
	for (const component of collectComponents()) {
		const markdown = (component.description ?? '').trim();
		const split = markdown.search(/^#{1,6} /m);
		const intro = (split === -1 ? markdown : markdown.slice(0, split)).trim();
		const rest = split === -1 ? '' : markdown.slice(split);
		const paragraphs = intro ? intro.split(/\n\s*\n/).length : 0;
		if (paragraphs > 1) wrong.push(`${component.slug}: ${paragraphs} paragraphs before the tabs`);
		const sections = [...rest.matchAll(/^#{1,6} (.*)$/gm)].map((m) => m[1].trim());
		const extra = sections.filter((heading) => heading !== 'Gebruik');
		if (extra.length) wrong.push(`${component.slug}: sections ${extra.join(', ')}`);
		const usage = rest.match(/^#{1,6} Gebruik\s*\n([^]*?)(?=^#{1,6} |$(?![^]))/m)?.[1] ?? '';
		if (usage.replace(/^```[^]*?^```\s*$/gm, '').trim()) wrong.push(`${component.slug}: prose under Gebruik`);
	}
	assert.deepEqual(wrong, []);
});

test('every @related names a component with a page, and that page lists it under the example', () => {
	const components = collectComponents();
	const tags = new Set(components.flatMap((c) => c.elements.map((e) => e.tagName)));
	const wrong = components.flatMap((c) =>
		c.elements.flatMap((e) => (e.related ?? []).filter((tag) => !tags.has(tag)).map((tag) => `${e.tagName} → ${tag}`)),
	);
	assert.deepEqual(wrong, []);
	const withRelated = components.find((c) => c.elements.some((e) => e.related?.length));
	if (withRelated) assert.match(pages[`componenten/${withRelated.slug}/index.html`], /<h2>Gerelateerd<\/h2>/);
});

test('a pattern has a tab with the lint rules that point at it', () => {
	const pattern = pages['patronen/form/index.html'];
	const rules = pages['patronen/form/lintregels/index.html'];
	assert.match(pattern, /href="\/patronen\/form\/"\s+text="Patroon"\s+current/);
	assert.doesNotMatch(pattern, /id="regels"/);
	assert.match(rules, /text="Lintregels"\s+current[^]*id="regels"[^]*<h2>Lintregels<\/h2>[^]*text="form-actions-needs-button-group"/);
});

test('a page under a deploy base links within that base', () => {
	const based = buildPages({ base: '/design-system/' }).pages;
	assert.match(based['index.html'], /href="\/design-system\/componenten\/"/);
	assert.match(based['componenten/button/index.html'], /back-href="\/design-system\/componenten\/"/);
	assert.match(based['componenten/index.html'], /back-text="Home"\s+back-href="\/design-system\/"/);
	assert.match(based['componenten/button/index.html'], /src="\/design-system\/theme\.js"/);
	// Vite adds the base to the entry script and the icons itself.
	assert.match(based['index.html'], /src="\/home\.ts"/);
	assert.match(based['index.html'], /<link rel="icon"[^>]*href="\/favicon\.svg"/);
	assert.doesNotMatch(based['index.html'], /href="\/componenten\//);
});

test('each example of a component stands on a stage, and the first one, on the usage tab, carries the controls', () => {
	const button = pages['componenten/button/index.html'];
	const examples = pages['componenten/button/voorbeelden/index.html'];
	const component = collectComponents().find((c) => c.slug === 'button');
	// The first story is on the usage tab, with the controls; the others are examples.
	assert.equal((button.match(/<site-stage /g) ?? []).length, 1);
	assert.equal((button.match(/<site-stage [^>]*primary/g) ?? []).length, 1);
	assert.equal((examples.match(/<site-stage /g) ?? []).length, component.stories.filter((s) => !s.hidden).length - 1);
	assert.equal((examples.match(/<site-stage [^>]*primary/g) ?? []).length, 0);
	// The stage shows the code and names the example, so neither is repeated above it.
	const usage = button.slice(button.indexOf('</nldd-tab-bar>'), button.indexOf('<site-stage'));
	assert.doesNotMatch(usage, /<nldd-code-viewer|<h2>/);
	assert.match(examples, /<h2>[^<]+<\/h2>[^]*<site-stage /);
	assert.match(button, /"name":"appearance"[^}]*"kind":"select","values":\["primary","secondary"/);
});

test('controlFor reads the values of a named type from the source', () => {
	const file = resolve(repoRoot, 'src/components/actions/button/button.ts');
	const size = controlFor(file, { name: 'size', type: { text: 'Size' }, default: "'md'" });
	assert.deepEqual(size, { name: 'size', default: 'md', description: '', kind: 'select', values: ['xs', 'sm', 'md', 'lg'], strict: true });
	assert.equal(controlFor(file, { name: 'disabled', type: { text: 'boolean' } }).kind, 'boolean');
	// A type the source cannot resolve, such as one imported from a dependency, takes the linter's values.
	const placement = controlFor(file, { name: 'placement', type: { text: 'Placement' } }, ['bottom', 'top']);
	assert.deepEqual([placement.kind, placement.strict, placement.values], ['select', true, ['bottom', 'top']]);
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
	// The title is the page's to show, so it is not repeated in the text.
	assert.doesNotMatch(html, /<h1/);
	assert.match(html, /<a href="\/base\/componenten\/">link<\/a>/);
	assert.match(html, /<nldd-code-viewer language="html">&lt;nldd-tag&gt;&lt;\/nldd-tag&gt;<\/nldd-code-viewer>/);
	assert.match(html, /<site-stage story="Standaard"><\/site-stage>/);
	assert.doesNotMatch(html, /<nldd-rich-text>[^]*<nldd-code-viewer[^]*<\/nldd-rich-text>/);
});

test('headingId matches the anchors the guidelines are linked by', () => {
	assert.equal(headingId('Visueel en layout'), 'visueel-en-layout');
	assert.equal(headingId('Feedback en state'), 'feedback-en-state');
});

test('a code block in a list stays in its item', () => {
	const { blocks } = renderMarkdown('- Stap een:\n\n  ```html\n  <nldd-tag></nldd-tag>\n  ```\n- Stap twee\n', { href: (path) => path });
	assert.equal(blocks.length, 1);
	assert.match(blocks[0], /<li>[^<]*<p>Stap een:<\/p>\s*<nldd-code-viewer[^]*?<\/li>\s*<li>/);
});

test('an example in a list is refused', () => {
	assert.throws(
		() => renderMarkdown('- Stap\n\n  <!-- voorbeeld: Standaard -->\n', { href: (path) => path, example: () => '' }),
		/in een list_item/,
	);
});

test('every heading gets an id of its own, from its text as a reader sees it', () => {
	const { html } = renderMarkdown('## Voorbeeld\n\n## Voorbeeld\n\n## Op `<html>`\n', { href: (path) => path });
	assert.match(html, /id="voorbeeld"/);
	assert.match(html, /id="voorbeeld-1"/);
	assert.match(html, /id="op-html"/);
});

test('HTML in a JSDoc is shown as text, as its author means it', () => {
	const { html } = renderMarkdown('Renders a real <form> around\n<nldd-form label-alignment="right">.', { href: (p) => p, literalHtml: true });
	assert.match(html, /a real &lt;form&gt; around/);
	assert.match(html, /&lt;nldd-form label-alignment=&quot;right&quot;&gt;/);
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

test('the getting-started pages show how to install the skills', () => {
	for (const path of ['aan-de-slag/index.html', 'aan-de-slag/ai-assistent/index.html']) {
		assert.match(pages[path], /\/plugin install nldd-design-system@nldd/, path);
		assert.match(pages[path], /nldd-design-migrate/, path);
	}
});
