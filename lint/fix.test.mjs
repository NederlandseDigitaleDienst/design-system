import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { applyFixes } from './fix.js';
import { formatGithub, formatStatistics } from './format.js';
import { findFiles, partialExcludes, readBaseline, readConfig } from './project.js';
import { loadData, resolveSeverities } from './rule-data.js';
import { fixUntilStable, lintProject } from './session.js';

const DATA = loadData();
const severities = resolveSeverities(DATA, {});

function project(files) {
	const root = mkdtempSync(join(tmpdir(), 'nldd-fix-'));
	for (const [name, source] of Object.entries(files)) {
		mkdirSync(dirname(join(root, name)), { recursive: true });
		writeFileSync(join(root, name), source);
	}
	return root;
}

async function fixed(source, name = 'a.html') {
	const root = project({ [name]: source });
	const result = await lintProject(DATA, { root, severities, fix: true });
	return { text: readFileSync(join(root, name), 'utf8'), result };
}

describe('--fix', () => {
	it('applies an edit inside another edit in the next pass, not over it', async () => {
		const { text } = await fixed('<nldd-text>Hallo <nldd-icon icon="check" color="primary-content"></nldd-icon> wereld</nldd-text>');
		assert.equal(text, '<nldd-text><p>Hallo <nldd-icon icon="check" color="content"></nldd-icon> wereld</p></nldd-text>');
	});

	it('makes no fix whose own edits overlap each other', () => {
		const source = 'a { color: var(--old); }';
		const offset = source.indexOf('--old');
		const finding = { tag: '--old', offset, endOffset: offset + 5, fix: { token: '--new', event: '--other' } };
		assert.deepEqual(applyFixes(source, [finding]), { source, fixed: 0, renamedTags: new Map() });
	});

	it('wraps text with the line endings of the file', async () => {
		const { text } = await fixed('<nldd-text>\r\n\tHallo\r\n\twereld\r\n</nldd-text>\r\n');
		assert.equal(text, '<nldd-text>\r\n\t<p>\r\n\t\tHallo\r\n\t\twereld\r\n\t</p>\r\n</nldd-text>\r\n');
	});

	it('does not wrap text with a blank line between CRLF lines', async () => {
		const source = '<nldd-text>\r\n\tHallo\r\n\r\n\twereld\r\n</nldd-text>\r\n';
		assert.equal((await fixed(source)).text, source);
	});

	it('takes a split view pane away, gives its child the slot and one indent less', async () => {
		const { text } = await fixed(
			'<nldd-navigation-split-view>\n\t<nldd-split-view-pane\n\t\tslot="main"\n\t\thas-content\n\t>\n\t\t<nldd-page\n\t\t\tlandmarks="page"\n\t\t>\n\t\t\t<nldd-simple-section></nldd-simple-section>\n\t\t</nldd-page>\n\t</nldd-split-view-pane>\n</nldd-navigation-split-view>\n',
		);
		assert.equal(
			text,
			'<nldd-navigation-split-view>\n\t<nldd-page\n\t\tslot="main"\n\t\tlandmarks="page"\n\t>\n\t\t<nldd-simple-section></nldd-simple-section>\n\t</nldd-page>\n</nldd-navigation-split-view>\n',
		);
	});

	it('keeps the indent inside a template literal or <pre> when it takes a pane away', async () => {
		const { text } = await fixed('<nldd-bar-split-view>\n\t<nldd-split-view-pane slot="main">\n\t\t<nldd-page>\n\t\t\t<pre>\n\t\t\tcode\n\t\t\t</pre>\n\t\t</nldd-page>\n\t</nldd-split-view-pane>\n</nldd-bar-split-view>\n');
		assert.equal(text, '<nldd-bar-split-view>\n\t<nldd-page slot="main">\n\t\t\t<pre>\n\t\t\tcode\n\t\t\t</pre>\n\t\t</nldd-page>\n</nldd-bar-split-view>\n');
	});

	it('moves a child with an expression in it without changing its indent', async () => {
		const { text } = await fixed('<nldd-bar-split-view>\n\t<nldd-split-view-pane slot="main">\n\t\t<nldd-page>\n\t\t\t<nldd-text>{{ name }}</nldd-text>\n\t\t</nldd-page>\n\t</nldd-split-view-pane>\n</nldd-bar-split-view>\n');
		assert.equal(text, '<nldd-bar-split-view>\n\t<nldd-page slot="main">\n\t\t\t<nldd-text>{{ name }}</nldd-text>\n\t\t</nldd-page>\n</nldd-bar-split-view>\n');
	});

	it('moves a child with an attribute value over more lines without changing its indent', async () => {
		const { text } = await fixed('<nldd-bar-split-view>\n\t<nldd-split-view-pane slot="main">\n\t\t<nldd-page>\n\t\t\t<nldd-text text="een\n\t\t\ttwee"></nldd-text>\n\t\t</nldd-page>\n\t</nldd-split-view-pane>\n</nldd-bar-split-view>\n');
		assert.equal(text, '<nldd-bar-split-view>\n\t<nldd-page slot="main">\n\t\t\t<nldd-text text="een\n\t\t\ttwee"></nldd-text>\n\t\t</nldd-page>\n</nldd-bar-split-view>\n');
	});

	it('leaves a split view pane with more than one child, or a background its child cannot take', async () => {
		for (const source of [
			'<nldd-bar-split-view><nldd-split-view-pane slot="main"><nldd-page></nldd-page><nldd-page></nldd-page></nldd-split-view-pane></nldd-bar-split-view>',
			'<nldd-bar-split-view><nldd-split-view-pane slot="main" background="tinted"><nldd-container></nldd-container></nldd-split-view-pane></nldd-bar-split-view>',
		]) {
			assert.equal((await fixed(source)).text, source);
		}
	});

	it('gives help text its new tag and its slot, and points at what names the old tag elsewhere', async () => {
		const root = project({
			'a.html': '<nldd-form-field label="E-mail"><nldd-text-field></nldd-text-field><nldd-form-field-help-text>Zie <a href="/p">privacy</a>.</nldd-form-field-help-text></nldd-form-field>',
			'app.css': 'nldd-form-field-help-text { color: red; }\n',
		});
		const result = await lintProject(DATA, { root, severities, fix: true });
		assert.equal(readFileSync(join(root, 'a.html'), 'utf8'), '<nldd-form-field label="E-mail"><nldd-text-field></nldd-text-field><nldd-text slot="help-text"><p>Zie <a href="/p">privacy</a>.</p></nldd-text></nldd-form-field>');
		// Renaming the selector would make it match every nldd-text on the page.
		assert.equal(readFileSync(join(root, 'app.css'), 'utf8'), 'nldd-form-field-help-text { color: red; }\n');
		assert.deepEqual(result.references.remaining, ['app.css:1']);
	});

	it('leaves help text that already has a slot of its own', async () => {
		const source = '<nldd-form-field label="E-mail"><nldd-text-field></nldd-text-field><nldd-form-field-help-text slot="x">Uitleg.</nldd-form-field-help-text></nldd-form-field>';
		assert.equal((await fixed(source)).text, source);
	});

	it('moves the title of a form section into a title in its header slot, on a line of its own', async () => {
		const { text } = await fixed('<nldd-form>\n\t<nldd-form-section\n\t\ttext="Adres"\n\t\tsupporting-text="Waar woon je?"\n\t>\n\t\t<nldd-form-field label="Straat"></nldd-form-field>\n\t</nldd-form-section>\n</nldd-form>\n');
		assert.equal(text, '<nldd-form>\n\t<nldd-form-section>\n\t\t<nldd-title slot="header" text="Adres" supporting-text="Waar woon je?"></nldd-title>\n\t\t<nldd-form-field label="Straat"></nldd-form-field>\n\t</nldd-form-section>\n</nldd-form>\n');
	});

	it('moves a bound title of a form section as it is written, and keeps the other attributes', async () => {
		const { text } = await fixed('<template><nldd-form-section id="adres" :text="titel"></nldd-form-section></template>', 'a.vue');
		assert.equal(text, '<template><nldd-form-section id="adres"><nldd-title slot="header" :text="titel"></nldd-title></nldd-form-section></template>');
	});

	it('moves no title of a form section when one of its attributes cannot leave the tag', async () => {
		const source = 'export const A = () => <nldd-form-section id="adres" /* titel */ text="Adres" supporting-text="Waar woon je?"></nldd-form-section>;\n';
		assert.equal((await fixed(source, 'a.tsx')).text, source);
	});

	it('leaves a bundle alone when it carries a renamed tag along', async () => {
		const bundle = `document.querySelector("nldd-app-view");${' '.repeat(1000)}\n`;
		const root = project({ 'a.html': '<nldd-app-view></nldd-app-view>', 'app.js': bundle });
		await lintProject(DATA, { root, severities, fix: true });
		assert.equal(readFileSync(join(root, 'a.html'), 'utf8'), '<nldd-shell></nldd-shell>');
		assert.equal(readFileSync(join(root, 'app.js'), 'utf8'), bundle);
	});

	it('does not write through a symbolic link', async () => {
		const outside = project({ 'target.html': '<nldd-app-view></nldd-app-view>' });
		const root = project({});
		symlinkSync(join(outside, 'target.html'), join(root, 'a.html'));
		const result = await lintProject(DATA, { root, severities, fix: true });
		assert.equal(readFileSync(join(outside, 'target.html'), 'utf8'), '<nldd-app-view></nldd-app-view>');
		assert.deepEqual(result.symlinks, [join(root, 'a.html')]);
		assert.ok(result.results[0].findings.some(({ rule }) => rule === 'shell-tag-renamed'));
	});

	it('says so when the passes run out with fixes left', async () => {
		// Each pass renames the token again, so the file never settles.
		const linter = {
			lintSource: async (source) => ({ findings: [{ fix: { token: `${source}x` }, tag: source, offset: 0, endOffset: source.length }] }),
		};
		const change = await fixUntilStable(linter, '--a', 'a.css');
		assert.equal(change.unstable, true);
		const settled = await fixUntilStable({ lintSource: async () => ({ findings: [] }) }, '--a', 'a.css');
		assert.equal(settled.unstable, false);
	});
});

describe('project paths', () => {
	it('excludes a name or a path of names, not every path that contains the text', () => {
		const root = project({ 'sub/map.html': '', 'src/legacy/a.html': '', 'src/legacy-new.html': '', 'b.html': '' });
		const found = (exclude) => findFiles([root], root, exclude).map((file) => file.slice(root.length + 1)).sort();
		assert.deepEqual(found(['a']), ['b.html', 'src/legacy-new.html', 'src/legacy/a.html', 'sub/map.html']);
		assert.deepEqual(found(['legacy']), ['b.html', 'src/legacy-new.html', 'sub/map.html']);
		assert.deepEqual(found(['legacy/a.html']), ['b.html', 'src/legacy-new.html', 'sub/map.html']);
		assert.deepEqual(found(['src/legacy/']), ['b.html', 'src/legacy-new.html', 'sub/map.html']);
		assert.deepEqual(found(['./src/legacy', 'b.html']), ['src/legacy-new.html', 'sub/map.html']);
	});

	it('names an exclude entry that only matched part of a name', () => {
		const root = project({ 'generated/a.html': '', 'legacy/b.html': '', 'c.test.html': '' });
		assert.deepEqual(partialExcludes([], root, ['./gen/']), [{ entry: './gen/', file: 'generated/a.html' }]);
		assert.deepEqual(partialExcludes([], root, ['gen', 'legacy', '.test.', 'dist']), [
			{ entry: 'gen', file: 'generated/a.html' },
			{ entry: '.test.', file: 'c.test.html' },
		]);
	});

	it('takes only paths in exclude', () => {
		const root = project({ '.nldd-lint.json': '{"exclude": ["src", 1]}' });
		assert.throws(() => readConfig(root, new Set()), /\.nldd-lint\.json: "exclude" takes a list of paths/);
	});

	it('names the baseline when it cannot be read', () => {
		const root = project({ '.nldd-lint-baseline.json': '{ broken' });
		assert.throws(() => readBaseline(root), /^Error: \.nldd-lint-baseline\.json: /);
	});

	it('reads a baseline key with backslashes as one with slashes', () => {
		const root = project({ '.nldd-lint-baseline.json': '{"src\\\\a.html": {"x|nldd-a": 1}}' });
		assert.deepEqual(readBaseline(root), { 'src/a.html': { 'x|nldd-a': 1 } });
	});

	it('annotates CI with a path from the root', () => {
		const root = project({});
		const output = formatGithub([{ filename: join(root, 'src', 'a.html'), findings: [{ severity: 'warn', line: 1, column: 1, rule: 'x', message: 'm' }] }], { root });
		assert.match(output, /file=src\/a\.html,/);
	});
});

describe('statistics', () => {
	it('marks a rule fixable when any of its findings is', () => {
		const findings = [
			{ rule: 'x', severity: 'warn', fix: { tag: 'nldd-a' } },
			{ rule: 'x', severity: 'warn' },
		];
		assert.match(formatStatistics([{ findings }], { files: 1, unread: 0, ms: 0 }), /x {2}\[--fix\]/);
	});
});
