import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createEngine } from './engine.js';
import { parseHtml, parseJsx, parseMarkdown, parseVue } from './frontends.js';
import { createLinter } from './linter.js';
import { BOUND, walk } from './tree.js';

const first = (roots, name) => {
	let found;
	for (const root of roots) {
		walk(root, (node) => {
			if (node.name === name) found ??= node;
		});
	}
	return found;
};

describe('frontends', () => {
	it('keeps the name of a bound attribute and loses its value', () => {
		const node = first(parseVue('<template><nldd-tab :selected="a" text="b" /></template>'), 'nldd-tab');
		assert.equal(node.attrs.get('selected'), BOUND);
		assert.equal(node.attrs.get('text'), 'b');
	});

	it('lets a Vue template wrapper disappear and passes on its flags', () => {
		const source = '<template><nldd-list><template v-for="a in b"><nldd-list-item /></template></nldd-list></template>';
		const item = first(parseVue(source), 'nldd-list-item');
		assert.equal(item.parent.name, 'nldd-list');
		assert.equal(item.repeated, true);
	});

	it('does not let a self-closing tag swallow its siblings in Vue', () => {
		const list = first(parseVue('<template><nldd-a><nldd-b /><nldd-c /></nldd-a></template>'), 'nldd-a');
		assert.deepEqual(list.children.map((node) => node.name), ['nldd-b', 'nldd-c']);
	});

	it('marks a spread and an unknown component', () => {
		const spread = first(parseVue('<template><nldd-a v-bind="o" /></template>'), 'nldd-a');
		assert.equal(spread.spread, true);
		assert.equal(first(parseVue('<template><Foo /></template>'), 'Foo').opaque, true);
	});

	it('closes only a full document', () => {
		assert.equal(parseHtml('<html><body></body></html>')[0].opaque, false);
		assert.equal(parseHtml('<nldd-a></nldd-a>')[0].opaque, true);
	});

	it('reads JSX with conditions, lists, fragments and spreads', async () => {
		const roots = await parseJsx(
			'const a = <nldd-list {...p}><>{x && <nldd-a />}{y.map((i) => <nldd-b key={i} />)}{children}</></nldd-list>;',
			'a.tsx',
		);
		const list = first(roots, 'nldd-list');
		assert.equal(list.spread, true);
		assert.equal(first(roots, 'nldd-a').conditional, true);
		assert.equal(first(roots, 'nldd-b').repeated, true);
		assert.ok(list.children.some((node) => node.opaque));
	});

	it('reads an element passed as a prop as a tree of its own', async () => {
		const roots = await parseJsx('const a = <Foo icon={<nldd-icon icon="plus" />} />;', 'a.tsx');
		assert.ok(first(roots, 'nldd-icon'));
	});

	it('reads fenced blocks from Markdown at their real position', () => {
		const source = '# Kop\n\n```html\n<nldd-a></nldd-a>\n```\n';
		assert.equal(first(parseMarkdown(source), 'nldd-a').offset, source.indexOf('<nldd-a'));
	});

	it('reads inline tags from Markdown', () => {
		assert.ok(first(parseMarkdown('Gebruik `<nldd-a text="b">` hier.'), 'nldd-a'));
	});
});

describe('two worlds', () => {
	const engine = createEngine({ classes: { 'form-input': ['nldd-text-field'] } });
	const outcome = (rule, markup) =>
		engine.evaluate(rule, parseVue(`<template>${markup}</template>`)[0])[0]?.outcome;

	const named = { context: 'nldd-icon-button', assert: '[text], [accessible-label]' };
	const sticky = { context: 'nldd-page[sticky-header]:has(nldd-bar)' };
	const overflow = { context: 'nldd-item', assert: ':has(> [slot=overflow])' };
	const input = { context: 'nldd-field', assert: ':has(:form-input)' };

	it('fails what is wrong for certain', () => {
		assert.equal(outcome(named, '<nldd-icon-button />'), 'failed');
		assert.equal(outcome(overflow, '<nldd-item><nldd-button /></nldd-item>'), 'failed');
	});

	it('passes what is right', () => {
		assert.equal(outcome(named, '<nldd-icon-button text="a" />'), 'passed');
	});

	it('cannot tell when a value only exists at runtime', () => {
		assert.equal(outcome(named, '<nldd-icon-button :text="a" />'), 'cantTell');
		assert.equal(outcome(named, '<nldd-icon-button v-bind="o" />'), 'cantTell');
		assert.equal(outcome(sticky, '<nldd-page :sticky-header="s"><nldd-bar /></nldd-page>'), 'cantTell');
	});

	it('cannot tell when a child component might bring the element', () => {
		assert.equal(outcome(overflow, '<nldd-item><MyItem /></nldd-item>'), 'cantTell');
		assert.equal(outcome(input, '<nldd-field><MyInput /></nldd-field>'), 'cantTell');
	});

	it('still fails on what renders behind a condition', () => {
		assert.equal(outcome(sticky, '<nldd-page sticky-header><nldd-bar v-if="a" /></nldd-page>'), 'failed');
	});

	it('resolves a class of tags', () => {
		assert.equal(outcome(input, '<nldd-field><nldd-text-field /></nldd-field>'), 'passed');
		assert.equal(outcome(input, '<nldd-field><nldd-button /></nldd-field>'), 'failed');
	});

	it('does not count what repeats', () => {
		const count = { context: 'nldd-dialog', count: { of: '[slot=actions]', min: 2 } };
		assert.equal(outcome(count, '<nldd-dialog><nldd-b slot="actions" v-for="a in b" /></nldd-dialog>'), 'passed');
		assert.equal(outcome(count, '<nldd-dialog><nldd-b slot="actions" /></nldd-dialog>'), 'failed');
	});

	it('follows a reference within a whole document, and not across files', () => {
		const rule = { context: 'nldd-bar', ref: { attr: 'anchor', target: 'nldd-title', equal: 'text' } };
		const check = (html) => engine.evaluate(rule, parseHtml(html)[0])[0].outcome;
		const whole = (body) => `<html><body>${body}</body></html>`;
		assert.equal(check(whole('<nldd-bar anchor="t" text="a"></nldd-bar><nldd-title id="t" text="a"></nldd-title>')), 'passed');
		assert.equal(check(whole('<nldd-bar anchor="t" text="a"></nldd-bar><nldd-title id="t" text="b"></nldd-title>')), 'failed');
		assert.equal(check(whole('<nldd-bar anchor="t" text="a"></nldd-bar>')), 'failed');
		assert.equal(check('<nldd-bar anchor="t" text="a"></nldd-bar>'), 'cantTell');
	});
});

const DATA = {
	tags: {
		'nldd-button': { attrs: { appearance: { values: ['primary'] }, icon: {}, old: { deprecated: 'Use new.' }, text: {} }, childAttrs: {}, props: ['items', 'rowData'], slots: ['popup'], anySlot: false },
		'nldd-pane': { attrs: {}, childAttrs: {}, props: [], slots: [], anySlot: false },
		'nldd-view': { attrs: { own: {} }, childAttrs: { only: { values: ['sm', 'md'] } }, props: [], slots: ['main'], anySlot: false },
	},
	classes: {},
	icons: ['plus'],
	rules: [],
};

describe('built-in rules', () => {
	const rulesIn = async (markup, options) => {
		const { findings } = await createLinter(DATA, options).lintSource(`<template>${markup}</template>`, 'a.vue');
		return findings.map((finding) => finding.rule);
	};

	it('flags an element that does not exist', async () => {
		assert.deepEqual(await rulesIn('<nldd-gone />'), ['unknown-element']);
	});

	it('flags an unknown attribute, also when bound', async () => {
		assert.deepEqual(await rulesIn('<nldd-button nope="1" />'), ['unknown-attribute']);
		assert.deepEqual(await rulesIn('<nldd-button :nope="a" />'), ['unknown-attribute']);
	});

	it('accepts a binding to a property without an attribute, and only a binding', async () => {
		assert.deepEqual(await rulesIn('<nldd-button :items="a" :row-data="b" />'), []);
		assert.deepEqual(await rulesIn('<nldd-button items="a" />'), ['unknown-attribute']);
	});

	it('leaves global, data and aria attributes alone', async () => {
		assert.deepEqual(await rulesIn('<nldd-button id="a" data-x="1" aria-label="b" autoFocus />'), []);
	});

	it('flags a value outside the type, and not a bound one', async () => {
		assert.deepEqual(await rulesIn('<nldd-button appearance="nope" />'), ['invalid-value']);
		assert.deepEqual(await rulesIn('<nldd-button :appearance="a" />'), []);
	});

	it('flags an unknown icon', async () => {
		assert.deepEqual(await rulesIn('<nldd-button icon="plus" />'), []);
		assert.deepEqual(await rulesIn('<nldd-button icon="nope" />'), ['unknown-icon']);
	});

	it('flags a deprecated attribute', async () => {
		assert.deepEqual(await rulesIn('<nldd-button old="1" />'), ['deprecated']);
	});

	it('flags a slot the parent does not have', async () => {
		assert.deepEqual(await rulesIn('<nldd-view><nldd-pane slot="main" /></nldd-view>'), []);
		assert.deepEqual(await rulesIn('<nldd-view><nldd-pane slot="nope" /></nldd-view>'), ['unknown-slot']);
	});

	it('accepts on a child only what the parent documents for its children', async () => {
		assert.deepEqual(await rulesIn('<nldd-view><nldd-pane only="md" /></nldd-view>'), []);
		assert.deepEqual(await rulesIn('<nldd-view><nldd-pane only="xl" /></nldd-view>'), ['invalid-value']);
		assert.deepEqual(await rulesIn('<nldd-view><nldd-pane own="1" /></nldd-view>'), ['unknown-attribute']);
	});

	it('does not accept a child attribute under a parent that does not read it', async () => {
		assert.deepEqual(await rulesIn('<nldd-pane><nldd-pane only="md" /></nldd-pane>'), ['unknown-attribute']);
	});

	it('leaves a child attribute alone when the parent is in another file', async () => {
		assert.deepEqual(await rulesIn('<nldd-pane only="md" />'), []);
	});

	it('honours severities from the config', async () => {
		assert.deepEqual(await rulesIn('<nldd-gone />', { severities: { 'unknown-element': 'off' } }), []);
	});

	it('resolves a wrapper to its tag', async () => {
		const linter = createLinter(DATA, { wrappers: { MyButton: 'nldd-button' } });
		const { findings } = await linter.lintSource('<template><MyButton icon="nope" onClick="a" /></template>', 'a.vue');
		assert.deepEqual(findings.map((finding) => finding.rule), ['unknown-icon']);
	});
});

describe('suppressions', () => {
	const lint = (source) => createLinter(DATA).lintSource(source, 'a.vue');

	it('turns a rule off on the next line, with a reason', async () => {
		const { findings } = await lint('<template>\n<!-- nldd-lint-disable-next-line unknown-element -- komt in 0.14 -->\n<nldd-gone />\n</template>');
		assert.deepEqual(findings, []);
	});

	it('asks for a reason', async () => {
		const { findings } = await lint('<template>\n<!-- nldd-lint-disable-next-line unknown-element -->\n<nldd-gone />\n</template>');
		assert.deepEqual(findings.map((finding) => finding.rule), ['suppression-needs-reason']);
	});
});

describe('nldd command', () => {
	const cli = fileURLToPath(new URL('./cli.js', import.meta.url));
	const project = () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		mkdirSync(join(root, 'src'));
		writeFileSync(join(root, 'src/a.vue'), '<template><nldd-gone /></template>\n');
		return root;
	};
	const run = (root, ...args) =>
		spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });

	it('exits 1 on an error and says where', () => {
		const result = run(project(), 'lint');
		assert.equal(result.status, 1);
		assert.match(result.stdout, /src\/a\.vue:1:11 {2}error {2}unknown-element/);
	});

	it('reports only what is new after accepting a baseline', () => {
		const root = project();
		assert.equal(run(root, 'lint', '--update-baseline').status, 0);
		assert.equal(run(root, 'lint').status, 0);
		writeFileSync(join(root, 'src/a.vue'), '<template><nldd-gone /><nldd-gone /></template>\n');
		assert.equal(run(root, 'lint').status, 1);
	});

	it('gives an agent what it needs as JSON', () => {
		const { stdout } = run(project(), 'lint', '--format', 'json');
		const [finding] = JSON.parse(stdout).findings;
		assert.equal(finding.rule, 'unknown-element');
		assert.equal(finding.file, 'src/a.vue');
	});

	it('annotates a pull request', () => {
		assert.match(run(project(), 'lint', '--format', 'github').stdout, /^::error file=src\/a\.vue,line=1,col=11,title=unknown-element::/);
	});

	it('checks a snippet on stdin', () => {
		const result = spawnSync(process.execPath, [cli, 'lint', '--stdin', '--filename', 'a.vue'], {
			input: '<template><nldd-gone /></template>',
			encoding: 'utf8',
		});
		assert.equal(result.status, 1);
	});

	it('explains a rule', () => {
		const output = execFileSync(process.execPath, [cli, 'explain', 'toolbar-item-needs-overflow'], { encoding: 'utf8' });
		assert.match(output, /patronen\/toolbar-with-actions/);
	});

	it('lists the rules about a component, also where it is only mentioned', () => {
		const output = execFileSync(process.execPath, [cli, 'rules', '--for', 'nldd-toggle-button'], { encoding: 'utf8' });
		assert.match(output, /no-toggle-button-in-button-bar/);
	});

	it('refuses an unknown rule in the config', () => {
		const root = project();
		writeFileSync(join(root, '.nldd-lint.json'), '{ "rules": { "nope": "off" } }');
		const result = run(root, 'lint');
		assert.equal(result.status, 2);
		assert.match(result.stderr, /unknown rule "nope"/);
	});

	it('reads a built site as whole pages, when asked for the build directory', () => {
		const root = project();
		mkdirSync(join(root, 'dist'));
		writeFileSync(join(root, 'dist/index.html'), '<html><body><nldd-list-item></nldd-list-item></body></html>');
		assert.equal(run(root, 'lint').stdout.includes('dist/index.html'), false);
		assert.match(run(root, 'lint', 'dist').stdout, /dist\/index\.html:1:13 {2}warn {2}list-item-needs-list/);
	});

	it('says so when it checks against another version than the project has', () => {
		const root = project();
		const installed = join(root, 'node_modules/@nldd/design-system');
		mkdirSync(installed, { recursive: true });
		writeFileSync(join(installed, 'package.json'), '{ "version": "0.0.1" }');
		assert.match(run(root, 'lint').stderr, /this project has 0\.0\.1/);
	});

	it('ships a version', () => {
		const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
		assert.equal(run(project(), '--version').stdout.trim(), version);
	});
});
