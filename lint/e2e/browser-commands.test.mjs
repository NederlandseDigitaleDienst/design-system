/**
 * The commands that open a browser, on small sites this test builds itself.
 * Not part of `test:scripts`: they need Chromium, which the job that runs the
 * component tests has. Run with `npm run test:lint-browser`.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { serveDirectory } from '../browser.js';
import { compareSites } from '../compare.js';
import { lintRendered } from '../rendered.js';
import { loadData, resolveSeverities } from '../rule-data.js';

const root = fileURLToPath(new URL('../..', import.meta.url));
const data = loadData();
const severities = resolveSeverities(data);

/** A site in a temporary directory: a path and its HTML per page. */
function site(pages) {
	const directory = mkdtempSync(join(tmpdir(), 'nldd-site-'));
	for (const [path, html] of Object.entries(pages)) {
		const target = join(directory, path);
		mkdirSync(target, { recursive: true });
		writeFileSync(join(target, 'index.html'), `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Test</title></head><body>${html}</body></html>`);
	}
	return directory;
}

/** An element that stands in for a component: a box of a size and a color. */
const block = (tag, color, size = 'width:200px;height:60px') => `<${tag} style="display:block;${size};background:${color}"></${tag}>`;

describe('nldd lint --url', () => {
	let server;
	before(async () => {
		server = await serveDirectory(site({
			'': `
				<nldd-text id="filled"></nldd-text>
				<nldd-text><p>Dakisolatie</p></nldd-text>
				<nldd-text id="stateful" style="color: red"><p>Warmtepomp</p></nldd-text>
				<nldd-accordion><nldd-accordion-item id="named"></nldd-accordion-item></nldd-accordion>
				<a href="/tweede/">Tweede</a>
				<style>nldd-text { --_text-color: red; }</style>
				<script>
					// As an expression in a framework fills it in: not in the source.
					document.getElementById('filled').textContent = 'In behandeling';
					// As a framework may set it: a property, and no attribute in the document.
					document.getElementById('named').text = 'Hoe lang duurt het?';
					// As a component keeps its own state: a variable of its own in the style attribute,
					// and an attribute that is not in its API.
					document.getElementById('stateful').style.setProperty('--_text-color', 'blue');
					document.getElementById('stateful').setAttribute('measured', '');
					document.getElementById('stateful').setAttribute('slot', 'internal');
				</script>`,
			tweede: '<nldd-text><p>Goed</p></nldd-text>',
		}));
	});
	after(() => server.close());

	const lint = (options) => lintRendered(data, { root, url: server.origin, config: {}, severities, ...options });
	const rulesOf = (session) => session.results.flatMap(({ findings }) => findings.map(({ rule }) => rule));

	it('finds what a script put on the page, which the source does not show', async () => {
		const session = await lint({});
		assert.deepEqual(rulesOf(session), ['text-needs-element']);
		const [{ filename, source, findings }] = session.results;
		assert.match(filename, /rendered[/\\]index\.html$/);
		// The line is in what the browser built, so a reader sees the element as it is.
		assert.match(source.split('\n')[findings[0].line - 1], /<nldd-text id="filled">/);
		assert.equal(findings[0].fix, undefined);
	});

	it('counts a property a framework set where a rule asks for the attribute', async () => {
		const session = await lint({});
		assert.ok(!rulesOf(session).includes('accordion-item-needs-name'));
	});

	it('leaves the stylesheets of the page alone: those are read from the source', async () => {
		const session = await lint({});
		assert.ok(!rulesOf(session).includes('local-variable-no-override'));
	});

	it('leaves out the variables a component keeps in a style attribute, and keeps the rest of it', async () => {
		const [{ source }] = (await lint({})).results;
		assert.match(source, /<nldd-text id="stateful" style="color: red" measured slot="internal">/);
	});

	it('does not report an attribute or a slot it does not know: a component may have written it', async () => {
		const rules = rulesOf(await lint({}));
		assert.ok(!rules.includes('unknown-attribute'));
		assert.ok(!rules.includes('unknown-slot'));
	});

	it('opens the pages it is given, and with crawl the ones they link to', async () => {
		assert.equal((await lint({})).files, 1);
		assert.equal((await lint({ paths: ['/', '/tweede/'] })).files, 2);
		const crawled = await lint({ crawl: true });
		assert.equal(crawled.files, 2);
		assert.equal((await lint({ crawl: true, max: 1 })).left, 1);
	});

	it('says which page it could not open', async () => {
		const session = await lintRendered(data, { root, url: 'http://127.0.0.1:9/', config: {}, severities });
		assert.equal(session.failed.length, 1);
		assert.deepEqual(session.results, []);
	});
});

describe('nldd compare', () => {
	const out = mkdtempSync(join(tmpdir(), 'nldd-compare-'));
	const compare = (beforeSite, afterSite, name) => compareSites({ root, before: beforeSite, after: afterSite, out: join(out, name) });

	it('writes no image for a page that is the same', async () => {
		const pages = { '': block('nldd-box', '#154273') };
		const results = await compare(site(pages), site(pages), 'same');
		assert.deepEqual(results.map(({ identical, file }) => [identical, file]), [[true, null], [true, null]]);
	});

	it('marks a component that kept its size and changed color, on each viewport', async () => {
		const results = await compare(site({ '': block('nldd-button', '#154273') }), site({ '': block('nldd-button', '#b4b4b4') }), 'look');
		assert.deepEqual(results.map(({ viewport, counts }) => [viewport, counts]), [['desktop', { 'nldd-button look': 1 }], ['mobile', { 'nldd-button look': 1 }]]);
		assert.ok(existsSync(join(out, 'look', 'home-desktop.png')));
		assert.equal(JSON.parse(readFileSync(join(out, 'look', 'results.json'), 'utf8')).length, 2);
	});

	it('marks what changed and not what only moved down because of it', async () => {
		const before = block('nldd-banner', '#154273') + block('nldd-box', '#39870c');
		const after = block('nldd-banner', '#154273', 'width:200px;height:120px') + block('nldd-box', '#39870c');
		const [desktop] = await compare(site({ '': before }), site({ '': after }), 'moved');
		assert.deepEqual(desktop.counts, { 'nldd-banner size': 1 });
	});

	it('compares running sites by their address, as it does directories', async () => {
		const one = await serveDirectory(site({ '': block('nldd-box', '#154273') }));
		const two = await serveDirectory(site({ '': '' }));
		try {
			const [desktop] = await compareSites({ root, before: one.origin, after: two.origin, paths: ['/'], out: join(out, 'urls') });
			assert.deepEqual(desktop.counts, { 'nldd-box gone': 1 });
		} finally {
			one.close();
			two.close();
		}
	});
});
