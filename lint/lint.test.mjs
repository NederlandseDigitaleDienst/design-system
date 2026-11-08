import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createEngine } from './engine.js';
import { parseHtml, parseJsx, parseMarkdown, parseStylesheet, parseVue } from './frontends.js';
import { createCanonical, createLinter, loadData } from './linter.js';
import { resolveSeverities } from './rule-data.js';
import { readBaseline } from './project.js';
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

	it('cannot tell a minimum from what repeats', () => {
		const count = { context: 'nldd-dialog', count: { of: '[slot=actions]', min: 2 } };
		assert.equal(outcome(count, '<nldd-dialog><nldd-b slot="actions" v-for="a in b" /></nldd-dialog>'), 'cantTell');
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

describe('found in review', () => {
	const real = createLinter();
	const rulesIn = async (source, filename = 'a.vue') =>
		(await real.lintSource(source, filename)).findings.map((finding) => finding.rule);
	const vue = (markup) => `<template>${markup}</template>`;

	it('does not report on a bound value that decides the context', async () => {
		const tabs = '<nldd-tab-bar-item href="/a" text="A"></nldd-tab-bar-item>';
		assert.ok(!(await rulesIn(vue(`<nldd-tab-bar accessible-label="a" :navigation="n">${tabs}</nldd-tab-bar>`))).includes('tab-bar-href-needs-navigation'));
		assert.ok(!(await rulesIn(vue(`<nldd-tab-bar accessible-label="a" v-bind="o">${tabs}</nldd-tab-bar>`))).includes('tab-bar-href-needs-navigation'));
		assert.ok((await rulesIn(vue(`<nldd-tab-bar accessible-label="a">${tabs}</nldd-tab-bar>`))).includes('tab-bar-href-needs-navigation'));
	});

	it('maps a camelCase binding to its attribute', async () => {
		for (const markup of [
			'<nldd-icon-button icon="plus" [accessibleLabel]="l"></nldd-icon-button>',
			'<nldd-icon-button icon="plus" :accessibleLabel="l"></nldd-icon-button>',
			'<nldd-icon-button icon="plus" .accessibleLabel="l"></nldd-icon-button>',
		]) {
			assert.deepEqual(await rulesIn(vue(markup)), [], markup);
		}
		assert.deepEqual(await rulesIn('const a = <nldd-icon-button icon="plus" accessibleLabel={l} />;', 'a.tsx'), []);
	});

	it('counts a native control as a form input', async () => {
		assert.deepEqual(await rulesIn(vue('<nldd-form-field label="a"><input></nldd-form-field>')), []);
	});

	it('reads Angular bindings', async () => {
		const markup = '<nldd-text-field [(value)]="v" [(ngModel)]="m" [ngClass]="c" [class.a]="b" [style.width]="w" formControlName="x"></nldd-text-field>';
		assert.deepEqual((await rulesIn(markup, 'a.html')).filter((rule) => rule === 'unknown-attribute'), []);
	});

	it('does not add up branches of v-if and v-else', async () => {
		const buttons = '<nldd-button text="a"></nldd-button><nldd-button text="b"></nldd-button>';
		const branches = '<nldd-button v-if="x" text="c"></nldd-button><nldd-button v-else text="d"></nldd-button>';
		assert.deepEqual(await rulesIn(vue(`<nldd-button-group>${buttons}${branches}</nldd-button-group>`)), []);
	});

	it('still counts what certainly renders next to a v-for', async () => {
		const four = '<nldd-button text="a"></nldd-button>'.repeat(4);
		const repeated = '<nldd-button v-for="x in y" text="b"></nldd-button>';
		assert.ok((await rulesIn(vue(`<nldd-button-group>${four}${repeated}</nldd-button-group>`))).includes('button-group-max-three-buttons'));
	});

	it('allows a toggle button group in a button bar', async () => {
		const group = '<nldd-toggle-button-group accessible-label="a"><nldd-toggle-button text="b"></nldd-toggle-button></nldd-toggle-button-group>';
		assert.deepEqual(await rulesIn(vue(`<nldd-button-bar>${group}</nldd-button-bar>`)), []);
	});

	it('names only the input a form field hands its label to', async () => {
		const named = await rulesIn('<html><body><nldd-form-field label="a"><nldd-text-field></nldd-text-field><nldd-number-field></nldd-number-field></nldd-form-field></body></html>', 'a.html');
		assert.ok(named.includes('number-field-needs-name'));
		const nested = await rulesIn('<html><body><nldd-form-field label="a"><nldd-toggle-button-group accessible-label="b"><nldd-toggle-button icon="plus"></nldd-toggle-button></nldd-toggle-button-group></nldd-form-field></body></html>', 'a.html');
		assert.ok(nested.includes('toggle-button-needs-name'));
	});

	it('finds the input of a form field at any depth, as the field does', async () => {
		const markup = '<nldd-form-field label="a"><div><nldd-number-field></nldd-number-field></div></nldd-form-field>';
		assert.deepEqual(await rulesIn(`<html><body>${markup}</body></html>`, 'a.html'), []);
	});

	it('names the input exactly as nldd-form-field finds it', async () => {
		const page = (body) => `<html><body>${body}</body></html>`;
		const field = (body) => `<nldd-form-field label="a">${body}</nldd-form-field>`;
		const number = '<nldd-number-field></nldd-number-field>';
		const text = '<nldd-text-field></nldd-text-field>';
		const isNamed = async (body) => !(await rulesIn(page(body), 'a.html')).includes('number-field-needs-name');
		assert.equal(await isNamed(field(`<div>${number}</div>`)), true);
		assert.equal(await isNamed(field(`<div>${text}</div>${number}`)), false);
		assert.equal(await isNamed(field(`${text}<div>${number}</div>`)), false);
		assert.equal(await isNamed(field(`<div>${text}</div><div>${number}</div>`)), false);
		const inGroup = `<nldd-radio-button-group accessible-label="b">${field(number)}</nldd-radio-button-group>`;
		assert.equal(await isNamed(inGroup), true);
	});

	it('does not fail a control that is itself conditional in a labeled field', async () => {
		const field = (body) => vue(`<nldd-form-field label="a">${body}</nldd-form-field>`);
		for (const body of [
			'<nldd-number-field v-if="x"></nldd-number-field>',
			'<nldd-number-field v-for="x in y"></nldd-number-field>',
			'<nldd-text-field v-if="x" accessible-label="b"></nldd-text-field><nldd-number-field v-else></nldd-number-field>',
			'<div v-if="x"><nldd-text-field></nldd-text-field></div><nldd-number-field></nldd-number-field>',
		]) {
			assert.deepEqual(await rulesIn(field(body)), [], body);
		}
	});

	it('does not take an empty label for a name', async () => {
		const page = '<html><body><nldd-form-field label=""><nldd-number-field></nldd-number-field></nldd-form-field></body></html>';
		assert.ok((await rulesIn(page, 'a.html')).includes('number-field-needs-name'));
	});

	it('still fails what follows a certain input, whatever comes after', async () => {
		const page = '<html><body><nldd-form-field label="a"><nldd-text-field></nldd-text-field><nldd-number-field></nldd-number-field><slot></slot></nldd-form-field></body></html>';
		assert.ok((await rulesIn(page, 'a.html')).includes('number-field-needs-name'));
	});

	it('skips help text when looking for the input, as the field does', async () => {
		const page = '<html><body><nldd-form-field label="a"><nldd-form-field-help-text><input></nldd-form-field-help-text><nldd-number-field></nldd-number-field></nldd-form-field></body></html>';
		assert.deepEqual(await rulesIn(page, 'a.html'), []);
	});

	it('takes a camelCase attribute that the browser lowercases', async () => {
		assert.deepEqual(await rulesIn('const a = <nldd-text-field readOnly maxLength={3} />;', 'a.tsx'), []);
	});

	it('leaves the props of React itself alone', async () => {
		assert.deepEqual(await rulesIn('const a = <nldd-button text="a" suppressHydrationWarning />;', 'a.tsx'), []);
	});

	it('does not count both sides of a v-show as certain', async () => {
		const buttons = '<nldd-button v-show="a" text="b"></nldd-button>'.repeat(2) + '<nldd-button v-show="!a" text="c"></nldd-button>'.repeat(2);
		assert.deepEqual(await rulesIn(vue(`<nldd-button-group>${buttons}</nldd-button-group>`)), []);
	});

	it('takes no suppression from the end of a comment', async () => {
		const source = '<template>\n<!-- nldd-lint-disable-next-line unknown-element --->\n<nldd-gone />\n</template>';
		assert.ok((await rulesIn(source)).includes('unknown-element'));
	});

	it('takes text control flow in .html for what it is', async () => {
		const two = '<nldd-button text="a"></nldd-button><nldd-button text="b"></nldd-button>';
		assert.deepEqual(await rulesIn(`<nldd-button-group>@if (a) {${two}} @else {${two}}</nldd-button-group>`, 'a.html'), []);
		assert.deepEqual(await rulesIn('<nldd-form-actions>{{ form_actions|safe }}</nldd-form-actions>', 'a.html'), []);
		assert.deepEqual(await rulesIn('<nldd-toolbar-item>{% include "overflow.html" %}</nldd-toolbar-item>', 'a.html'), []);
	});

	it('does not count the condition of a JSX expression as a child', async () => {
		const parts = '{a && <nldd-button text="a" />}'.repeat(4);
		assert.deepEqual(await rulesIn(`const x = <nldd-button-group>${parts}</nldd-button-group>;`, 'a.tsx'), []);
	});

	it('reads self-closing components in an Angular template', async () => {
		const markup = '<nldd-modal-dialog *ngIf="a"><nldd-button slot="actions" text="a" /><nldd-button slot="actions" text="b" /></nldd-modal-dialog>';
		assert.deepEqual(await rulesIn(markup, 'a.html'), []);
	});

	it('takes the lowercase wrappers of Vue for wrappers', async () => {
		assert.deepEqual(await rulesIn(vue('<nldd-list accessible-label="a"><nldd-list-item><transition><nldd-text-cell text="b" /></transition></nldd-list-item></nldd-list>')), []);
	});

	it('knows every event handler and other global attribute', async () => {
		assert.deepEqual(await rulesIn('<nldd-button text="a" onpointerdown="b" itemscope i18n="@@c" i18n-text="@@d"></nldd-button>', 'a.html'), []);
	});

	it('still reports a field with only requirements in it', async () => {
		const page = '<html><body><nldd-form-field label="a"><nldd-validation-list></nldd-validation-list></nldd-form-field></body></html>';
		assert.ok((await rulesIn(page, 'a.html')).includes('form-field-needs-input'));
	});

	it('takes v-show for rendered, and a v-for for maybe nothing', async () => {
		const page = (body) => vue(`<nldd-form-field label="a">${body}<nldd-number-field></nldd-number-field></nldd-form-field>`);
		assert.ok((await rulesIn(page('<nldd-text-field v-show="x"></nldd-text-field>'))).includes('number-field-needs-name'));
		assert.deepEqual(await rulesIn(page('<nldd-text-field v-for="x in y"></nldd-text-field>')), []);
	});

	it('takes a static camelCase attribute in HTML for what the browser does with it', async () => {
		const found = await rulesIn('<html><body><nldd-icon-button icon="plus" accessibleLabel="Sluit"></nldd-icon-button></body></html>', 'a.html');
		assert.ok(found.includes('icon-button-needs-name'));
	});

	it('reports a typo in a camelCase name outside plain HTML', async () => {
		assert.ok((await rulesIn('const a = <nldd-button text="a" startIcom="plus" />;', 'a.tsx')).includes('unknown-attribute'));
	});

	it('treats a template inside a component as unknown content, not as absent', async () => {
		const found = await rulesIn('<nldd-modal-dialog><nldd-button slot="actions" text="a"></nldd-button><template x-if="b"><nldd-button slot="actions" text="b"></nldd-button></template></nldd-modal-dialog>', 'a.html');
		assert.deepEqual(found, []);
	});

	it('reads more template languages in a value', async () => {
		assert.deepEqual(await rulesIn('<nldd-button text="a" start-icon="${icon}"></nldd-button>', 'a.html'), []);
		assert.deepEqual(await rulesIn('<nldd-button text="a" start-icon="<%= icon %>"></nldd-button>', 'a.html'), []);
	});

	it('takes a reason without a space after the dashes', async () => {
		const source = '<template>\n<!-- nldd-lint-disable-next-line unknown-element --later -->\n<nldd-gone />\n</template>';
		assert.deepEqual(await rulesIn(source), []);
	});

	it('honors the config for the rule about suppressions', async () => {
		const linter = createLinter(undefined, { severities: { 'suppression-needs-reason': 'off' } });
		const source = '<template>\n<!-- nldd-lint-disable-next-line unknown-element -->\n<nldd-gone />\n</template>';
		assert.deepEqual((await linter.lintSource(source, 'a.vue')).findings, []);
	});

	it('does not take a v-else branch for a second control', async () => {
		const markup = '<nldd-text-field v-if="a"></nldd-text-field><nldd-number-field v-else></nldd-number-field>';
		assert.deepEqual(await rulesIn(vue(markup)), []);
	});

	it('treats a child component the same in :not as anywhere else', async () => {
		assert.deepEqual(await rulesIn(vue('<nldd-avatar-group><MyAvatar /></nldd-avatar-group>')), []);
		assert.ok((await rulesIn(vue('<nldd-avatar-group><nldd-image></nldd-image></nldd-avatar-group>'))).includes('avatar-group-no-other-children'));
	});

	it('takes false and null in JSX as off', async () => {
		assert.deepEqual(await rulesIn('const a = <nldd-page sticky-header={false}><nldd-top-navigation-bar /></nldd-page>;', 'a.tsx'), []);
		assert.deepEqual(await rulesIn('const a = <nldd-button text="a" appearance={null} />;', 'a.tsx'), []);
	});

	it('leaves a tag alone that a template language writes into', async () => {
		assert.deepEqual(await rulesIn('<nldd-button text="a" {% if x %}disabled{% endif %}></nldd-button>', 'a.html'), []);
		assert.deepEqual(await rulesIn('<nldd-button text="a" start-icon={name}></nldd-button>', 'a.html'), []);
	});

	it('skips the inert content of a template in a document', async () => {
		assert.deepEqual(await rulesIn('<html><body><template><nldd-list-item></nldd-list-item></template></body></html>', 'a.html'), []);
	});

	it('does not hide a bad slot behind an unrelated rule', async () => {
		const found = await rulesIn(vue('<nldd-page><nldd-modal-dialog slot="nope"><nldd-button slot="actions" text="a"></nldd-button></nldd-modal-dialog></nldd-page>'));
		assert.ok(found.includes('unknown-slot'));
	});

	it('honors a suppression in a line comment', async () => {
		const source = 'const a = (\n// nldd-lint-disable-next-line unknown-element -- komt nog\n<nldd-gone />\n);';
		assert.deepEqual(await rulesIn(source, 'a.tsx'), []);
	});

	it('explains its own rule about suppressions', () => {
		const cli = fileURLToPath(new URL('./cli.js', import.meta.url));
		assert.equal(spawnSync(process.execPath, [cli, 'explain', 'suppression-needs-reason']).status, 0);
	});
});

describe('a renamed rule', () => {
	const data = { ...DATA, rules: [{ id: 'new-id', aliases: ['old-id'], severity: 'warn', context: 'nldd-pane', message: 'm', examples: {} }] };

	it('keeps a suppression with the former id working', async () => {
		const { findings } = await createLinter(data).lintSource('<template>\n<!-- nldd-lint-disable-next-line old-id -- reden -->\n<nldd-pane />\n</template>', 'a.vue');
		assert.deepEqual(findings, []);
	});

	it('keeps a config with the former id working', async () => {
		const { findings } = await createLinter(data, { severities: { 'old-id': 'off' } }).lintSource('<template><nldd-pane /></template>', 'a.vue');
		assert.deepEqual(findings, []);
	});

	it('keeps a baseline with the former id working', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, '.nldd-lint-baseline.json'), '{ "a.vue": { "old-id|nldd-pane": 1 } }');
		assert.deepEqual(readBaseline(root, createCanonical(data))['a.vue'], { 'new-id|nldd-pane': 1 });
	});
});

describe('a rule about a removed name', () => {
	const rule = {
		id: 'old-name',
		severity: 'warn',
		context: 'nldd-button[old-name]',
		removed: ['old-name'],
		message: 'Use the new name.',
		examples: { passed: [], failed: [] },
	};

	it('replaces the generic finding about that attribute', async () => {
		const linter = createLinter({ ...DATA, rules: [rule] });
		const { findings } = await linter.lintSource('<template><nldd-button old-name="a" nope="b" /></template>', 'a.vue');
		assert.deepEqual(findings.map((finding) => finding.rule).sort(), ['old-name', 'unknown-attribute']);
		assert.ok(findings.some((finding) => finding.message.includes('nope')));
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

	it('says when a suppression does nothing', async () => {
		const { findings } = await lint('<template>\n<!-- nldd-lint-disable-next-line unknown-element -- komt in 0.14 -->\n<nldd-button text="a" />\n</template>');
		assert.deepEqual(findings.map(({ rule, line }) => [rule, line]), [['suppression-not-needed', 2]]);
	});

	it('names the one rule of two that does nothing', async () => {
		const { findings } = await lint('<template>\n<!-- nldd-lint-disable-next-line unknown-element, unknown-slot -- komt in 0.14 -->\n<nldd-gone />\n</template>');
		assert.equal(findings.length, 1);
		assert.match(findings[0].message, /unknown-slot/);
	});

	it('keeps quiet about a rule that did not run', async () => {
		const source = '<template>\n<!-- nldd-lint-disable-next-line tab-bar-needs-name -- x -->\n<nldd-button text="a" />\n</template>';
		const real = loadData();
		const { findings } = await createLinter(real, { severities: { 'tab-bar-needs-name': 'off' } }).lintSource(source, 'a.vue');
		assert.deepEqual(findings, []);
		const runtime = real.rules.find((rule) => rule.runtime).id;
		const onlyInBrowser = await createLinter(real).lintSource(`<template>\n<!-- nldd-lint-disable-next-line ${runtime} -- x -->\n<nldd-button text="a" />\n</template>`, 'a.vue');
		assert.deepEqual(onlyInBrowser.findings, []);
	});

	it('does not count an example in Markdown', async () => {
		const { findings } = await createLinter(DATA).lintSource('```html\n<!-- nldd-lint-disable-next-line unknown-element -- x -->\n```', 'a.md');
		assert.deepEqual(findings, []);
	});
});

describe('--fix', () => {
	const cli = fileURLToPath(new URL('./cli.js', import.meta.url));
	const run = (root, ...args) => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });
	const fixed = (name, text) => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, name), text);
		const result = run(root, 'lint', '--fix', name);
		return { text: readFileSync(join(root, name), 'utf8'), ...result };
	};

	it('renames an attribute and reports what is left', () => {
		const { text, stdout, stderr } = fixed('a.html', '<nldd-button text="a" variant="primary"></nldd-button>');
		assert.equal(text, '<nldd-button text="a" appearance="primary"></nldd-button>');
		assert.match(stderr, /Fixed 1 in 1 of 1 files/);
		assert.match(stdout, /0 errors, 0 warnings/);
	});

	it('keeps to the way a framework writes a name', () => {
		const rename = (name, attribute) => fixed(name, attribute).text;
		assert.equal(rename('a.vue', '<template><nldd-button text="a" :variant="b" /></template>'), '<template><nldd-button text="a" :appearance="b" /></template>');
		assert.equal(rename('a.html', '<nldd-toolbar [label]="a" (click)="b()" /><nldd-toolbar [attr.label]="c" />'), '<nldd-toolbar [accessibleLabel]="a" (click)="b()" /><nldd-toolbar [attr.accessible-label]="c" />');
		assert.equal(rename('a.tsx', 'const a = <nldd-toolbar label={b} />;'), 'const a = <nldd-toolbar accessible-label={b} />;');
		assert.equal(rename('a.html.j2', '<nldd-icon name="{{ a }}"{% if b %} size="16"{% endif %}></nldd-icon>'), '<nldd-icon icon="{{ a }}"{% if b %} size="16"{% endif %}></nldd-icon>');
	});

	it('finds the attribute after text with another width', () => {
		const { text } = fixed('a.tsx', 'const a = "é😀";\nconst b = <nldd-toolbar label="c" />;');
		assert.equal(text, 'const a = "é😀";\nconst b = <nldd-toolbar accessible-label="c" />;');
	});

	it('leaves the value and other elements alone', () => {
		const { text } = fixed('a.html', '<nldd-button text=" variant=x" variant="primary"></nldd-button><div variant="a"></div><nldd-progress-bar variant="b"></nldd-progress-bar>');
		assert.equal(text, '<nldd-button text=" variant=x" appearance="primary"></nldd-button><div variant="a"></div><nldd-progress-bar variant="b"></nldd-progress-bar>');
	});

	it('does not choose between two attributes', () => {
		const source = '<nldd-button text="a" variant="primary" appearance="secondary"></nldd-button>';
		assert.equal(fixed('a.html', source).text, source);
	});

	it('fixes nothing on a suppressed line', () => {
		const source = '<!-- nldd-lint-disable-next-line variant-renamed -- nog niet -->\n<nldd-button text="a" variant="primary"></nldd-button>';
		assert.equal(fixed('a.html', source).text, source);
	});

	it('renames a tag with its closing tag', () => {
		const { text, stderr } = fixed('a.vue', '<template><nldd-app-view background="tinted"><nldd-app-view></nldd-app-view></nldd-app-view></template>');
		assert.equal(text, '<template><nldd-shell background="tinted"><nldd-shell></nldd-shell></nldd-shell></template>');
		assert.match(stderr, /Fixed 2 in 1 of 1 files/);
	});

	describe('what names a renamed tag outside its markup', () => {
		const project = (files) => {
			const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
			for (const [name, text] of Object.entries(files)) writeFileSync(join(root, name), text);
			return root;
		};
		const read = (root, name) => readFileSync(join(root, name), 'utf8');

		it('follows along in imports, classes, selectors and strings', () => {
			const root = project({
				'a.vue': "<template><nldd-app-view></nldd-app-view></template>\n<script>import '@nldd/design-system/app-view';</script>",
				'main.ts': "import { NLDDAppView } from '@nldd/design-system/app-view';\nconst a = html`<nldd-app-view></nldd-app-view>`;",
				'style.css': 'nldd-app-view { color: red; }',
				'unrelated.ts': 'const a = 1;',
			});
			const { stderr } = run(root, 'lint', '--fix');
			assert.match(read(root, 'a.vue'), /import '@nldd\/design-system\/shell'/);
			assert.equal(read(root, 'main.ts'), "import { NLDDShell } from '@nldd/design-system/shell';\nconst a = html`<nldd-shell></nldd-shell>`;");
			assert.equal(read(root, 'style.css'), 'nldd-shell { color: red; }');
			assert.equal(read(root, 'unrelated.ts'), 'const a = 1;');
			assert.match(stderr, /Renamed 6 imports, classes and selectors of old tags in 3 files/);
		});

		it('leaves what only looks like the tag', () => {
			const css = "@import './nldd-app-view.css';\n.nldd-app-view { color: red; }\n#nldd-app-view { color: blue; }\na { background: url(nldd-app-view.png); }";
			const root = project({ 'a.html': '<nldd-app-view></nldd-app-view>', 'b.css': css });
			run(root, 'lint', '--fix');
			assert.equal(read(root, 'b.css'), css);
		});

		it('changes a tag only where it is a selector', () => {
			const css = '[data-component="nldd-app-view"] { color: red; }\n@keyframes nldd-app-view { to { opacity: 0; } }\na { background: image-set("nldd-app-view.png"); }\n@forward \'nldd-app-view\';\na { animation: nldd-app-view 1s; }\nb {\n  animation: nldd-app-view 1s\n}\n$a: (nldd-app-view: 1,\n  nldd-app-view: 2);';
			const script = "a.querySelector('[data-component=nldd-app-view]');";
			const root = project({ 'a.html': '<nldd-app-view></nldd-app-view>', 'b.scss': css, 'c.ts': script });
			run(root, 'lint', '--fix');
			assert.equal(read(root, 'b.scss'), css);
			assert.equal(read(root, 'c.ts'), script);
		});

		it('renames a selector before a brace and in a list', () => {
			const root = project({ 'a.html': '<nldd-app-view></nldd-app-view>', 'b.css': 'a,\nnldd-app-view,\n#c:has(> nldd-app-view) { color: red; }' });
			run(root, 'lint', '--fix');
			assert.equal(read(root, 'b.css'), 'a,\nnldd-shell,\n#c:has(> nldd-shell) { color: red; }');
		});

		it('leaves a bundle of the design system and what is built', () => {
			const define = "customElements.define('nldd-app-view', A);";
			const root = project({ 'a.html': '<nldd-app-view></nldd-app-view>', 'b.js': define, 'c.min.js': "a('nldd-app-view');" });
			mkdirSync(join(root, 'dist'));
			writeFileSync(join(root, 'dist/d.js'), "a('nldd-app-view');");
			run(root, 'lint', '--fix');
			assert.equal(read(root, 'b.js'), define);
			assert.equal(read(root, 'c.min.js'), "a('nldd-app-view');");
			assert.equal(read(root, 'dist/d.js'), "a('nldd-app-view');");
		});

		it('points at a translation key: its catalog may be anywhere', () => {
			const root = project({ 'a.html': '<nldd-step-indicator accessible-label="a"></nldd-step-indicator>', 'b.ts': "t('components.step-indicator.label');" });
			assert.match(run(root, 'lint', '--fix').stderr, /Still names an old tag: b\.ts:1/);
			assert.equal(read(root, 'b.ts'), "t('components.step-indicator.label');");
		});

		it('renames a selector or markup in a script, and points at any other string', () => {
			const script = "a.querySelector('body > nldd-app-view');\nb.innerHTML = '<nldd-app-view><\\/nldd-app-view>';\nc.classList.add('nldd-app-view');\nlocalStorage.setItem('nldd-app-view', 1);";
			const root = project({ 'a.html': '<nldd-app-view></nldd-app-view>', 'b.ts': script });
			const { stderr } = run(root, 'lint', '--fix');
			assert.equal(read(root, 'b.ts'), "a.querySelector('body > nldd-shell');\nb.innerHTML = '<nldd-shell><\\/nldd-shell>';\nc.classList.add('nldd-app-view');\nlocalStorage.setItem('nldd-app-view', 1);");
			assert.match(stderr, /b\.ts:3/);
			assert.match(stderr, /b\.ts:4/);
		});

		it('leaves a file that defines another nldd- element to the rest of the fix', () => {
			const root = project({ 'a.html': '<nldd-app-view></nldd-app-view>', 'b.ts': "import { NLDDAppView } from '@nldd/design-system/app-view';\n@customElement('nldd-app-header') class A {}" });
			run(root, 'lint', '--fix');
			assert.match(read(root, 'b.ts'), /NLDDShell.*design-system\/shell/);
		});

		it('keeps a tag out of a file with a suppression, and points at what is left', () => {
			const lit = "// nldd-lint-disable-next-line shell-tag-renamed -- nog niet\nconst a = html`<nldd-app-view></nldd-app-view>`;";
			const root = project({ 'a.vue': '<template><nldd-app-view></nldd-app-view></template>\n<style>nldd-app-view { color: red; }</style>', 'b.ts': lit });
			const { stderr } = run(root, 'lint', '--fix');
			assert.equal(read(root, 'b.ts'), lit);
			assert.match(stderr, /Still names an old tag: a\.vue:2/);
			assert.match(stderr, /Still names an old tag: b\.ts:2/);
		});

		it('keeps a longer name that starts the same', () => {
			const root = project({
				'a.html': '<nldd-step-indicator accessible-label="a"></nldd-step-indicator>',
				'b.css': 'nldd-step-indicator-item { color: red; }\nnldd-step-indicator { color: blue; }',
			});
			run(root, 'lint', '--fix');
			assert.equal(read(root, 'b.css'), 'nldd-step-indicator-item { color: red; }\nnldd-step-bar { color: blue; }');
		});

		it('leaves everything alone when no tag was renamed', () => {
			const root = project({ 'a.html': '<nldd-button text="a" variant="primary"></nldd-button>', 'b.css': 'nldd-app-view { color: red; }' });
			run(root, 'lint', '--fix');
			assert.equal(read(root, 'b.css'), 'nldd-app-view { color: red; }');
		});

		it('keeps a suppressed tag in markup', () => {
			const source = "<!-- nldd-lint-disable-next-line shell-tag-renamed -- nog niet -->\n<nldd-app-view></nldd-app-view>\n<nldd-app-view></nldd-app-view>";
			const root = project({ 'a.html': source });
			run(root, 'lint', '--fix');
			assert.equal(read(root, 'a.html'), "<!-- nldd-lint-disable-next-line shell-tag-renamed -- nog niet -->\n<nldd-app-view></nldd-app-view>\n<nldd-shell></nldd-shell>");
		});

		it('stays in the paths it was given, and says so', () => {
			const root = project({ 'a.html': '<nldd-app-view></nldd-app-view>', 'b.css': 'nldd-app-view { color: red; }' });
			assert.match(run(root, 'lint', '--fix', 'a.html').stderr, /Only in the paths you named/);
			assert.equal(read(root, 'b.css'), 'nldd-app-view { color: red; }');
		});
	});

	it('does not call a finding fixable when the fix would not apply', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.html'), '<nldd-button text="a" variant="primary" appearance="secondary"></nldd-button>');
		assert.equal(JSON.parse(run(root, 'lint', '--format', 'json', 'a.html').stdout).findings[0].fixable, false);
		assert.doesNotMatch(run(root, 'lint', 'a.html').stdout, /fixable with --fix/);
	});

	it('renames a self-closed tag', () => {
		assert.equal(fixed('a.vue', '<template><nldd-timeline-track-cell status="past" /></template>').text, '<template><nldd-step-cell status="past" /></template>');
	});

	it('leaves a tag without a closing tag alone', () => {
		const source = '<template><nldd-app-view></template>';
		assert.equal(fixed('a.html', source).text, source);
	});

	it('finds the closing tag the parser found, not text that looks like it', () => {
		assert.equal(fixed('a.html', '<nldd-app-view><!-- </nldd-app-view> --></nldd-app-view>').text, '<nldd-shell><!-- </nldd-app-view> --></nldd-shell>');
		assert.equal(
			fixed('a.tsx', 'const a = <nldd-app-view>{/* </nldd-app-view> */}{"</nldd-app-view>"}</nldd-app-view>;').text,
			'const a = <nldd-shell>{/* </nldd-app-view> */}{"</nldd-app-view>"}</nldd-shell>;',
		);
	});

	it('does not read a slash at the end of a value as a closed tag', () => {
		assert.equal(fixed('a.html', '<nldd-app-view class=/a/>x</nldd-app-view>').text, '<nldd-shell class=/a/>x</nldd-shell>');
		assert.equal(fixed('a.html', '<nldd-app-view />x</nldd-app-view>').text, '<nldd-shell />x</nldd-shell>');
	});

	it('renames every tag of a name or none: half a rename breaks the template', () => {
		const jinja = '{% if a %}<nldd-app-view class="a">{% else %}<nldd-app-view class="b">{% endif %}x</nldd-app-view>';
		assert.equal(fixed('a.j2', jinja).text, jinja);
		const angular = '@if (a) { <nldd-app-view class="a"> } @else { <nldd-app-view class="b"> } x</nldd-app-view>';
		assert.equal(fixed('a.html', angular).text, angular);
	});

	it('renames no tag when control flow gives it a second closing tag', () => {
		const jinja = '<nldd-app-view>{% if a %}b</nldd-app-view>{% else %}c</nldd-app-view>{% endif %}';
		assert.equal(fixed('a.j2', jinja).text, jinja);
		const angular = '<nldd-app-view>@if (a) { b</nldd-app-view> } @else { c</nldd-app-view> }';
		assert.equal(fixed('a.html', angular).text, angular);
	});

	it('removes a value with quotes in its holes whole, or not at all', () => {
		const django = '<nldd-sheet full-height="{{ a|default:"b" }}" accessible-label="c"></nldd-sheet>';
		assert.equal(fixed('a.j2', django).text, '<nldd-sheet accessible-label="c"></nldd-sheet>');
		const lit = 'const a = html`<nldd-sheet full-height="${b ? "c" : "d"}" accessible-label="e"></nldd-sheet>`;';
		assert.equal(fixed('a.ts', lit).text, 'const a = html`<nldd-sheet accessible-label="e"></nldd-sheet>`;');
		const block = '<nldd-sheet full-height={% if a %}b c{% endif %} accessible-label="d"></nldd-sheet>';
		assert.equal(fixed('a.j2', block).text, block);
	});

	it('reads an escaped quote in code as part of the string', () => {
		const props = "const a = <nldd-toolbar title={'foto\\'s'} label=\"a\"><nldd-toolbar-item label=\"b\" /></nldd-toolbar>;";
		assert.match(fixed('a.tsx', props).text, /<nldd-toolbar title=\{'foto\\'s'\} accessible-label="a"><nldd-toolbar-item label="b" \/>/);
		const removed = "const a = <nldd-sheet full-height={'foto\\'s'} accessible-label=\"b\">c</nldd-sheet>;";
		assert.equal(fixed('a.tsx', removed).text, 'const a = <nldd-sheet accessible-label="b">c</nldd-sheet>;');
	});

	it('skips a comment in code, whatever it holds', () => {
		const source = "const a = () => { return <nldd-sheet full-height={/* it's */ b} accessible-label=\"c\">d</nldd-sheet>; };";
		assert.equal(fixed('a.tsx', source).text, 'const a = () => { return <nldd-sheet accessible-label="c">d</nldd-sheet>; };');
	});

	it('removes a Lit hole with spaces whole', () => {
		const lit = (attribute) => `const a = html\`<nldd-sheet ${attribute} accessible-label="b"></nldd-sheet>\`;`;
		assert.equal(fixed('a.ts', lit('?full-height=${a && b}')).text, lit('').replace('  ', ' '));
		assert.equal(fixed('a.ts', lit('.full-height=${a ? "}" : 2}')).text, lit('').replace('  ', ' '));
	});

	it('leaves a tag with a comment in it alone', () => {
		const inside = 'const a = <nldd-button /* variant="old" */ variant="primary" text="b" />;';
		assert.equal(fixed('a.tsx', inside).text, inside);
		assert.match(fixed('a.tsx', inside).stderr, /Fixed 0/);
		const line = 'const a = <nldd-sheet // keep\n  full-height accessible-label="b" />;';
		assert.equal(fixed('a.tsx', line).text, line);
	});

	it('leaves a file in another encoding alone, and says so', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		const bytes = Buffer.from('<nldd-button text="caf\xe9" variant="primary"></nldd-button>', 'latin1');
		writeFileSync(join(root, 'a.html'), bytes);
		assert.match(run(root, 'lint', '--fix', 'a.html').stderr, /Skipped a\.html: it is not UTF-8/);
		assert.ok(readFileSync(join(root, 'a.html')).equals(bytes));
	});

	it('counts a path given twice once', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.html'), '<nldd-button text="a" variant="primary"></nldd-button>');
		assert.match(run(root, 'lint', '--fix', 'a.html', 'a.html').stderr, /Fixed 1 in 1 of 1 files/);
	});

	it('leaves the props of a wrapper alone: that API is not ours', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		const source = '<template><MyButton text="a" variant="primary" /></template>';
		writeFileSync(join(root, 'a.vue'), source);
		writeFileSync(join(root, '.nldd-lint.json'), '{ "wrappers": { "MyButton": "nldd-button" } }');
		run(root, 'lint', '--fix', 'a.vue');
		assert.equal(readFileSync(join(root, 'a.vue'), 'utf8'), source);
	});

	it('leaves a wrapper its own name', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.vue'), '<template><NlddAppView /></template>');
		writeFileSync(join(root, '.nldd-lint.json'), '{ "wrappers": { "NlddAppView": "nldd-app-view" } }');
		run(root, 'lint', '--fix', 'a.vue');
		assert.equal(readFileSync(join(root, 'a.vue'), 'utf8'), '<template><NlddAppView /></template>');
		const [finding] = JSON.parse(run(root, 'lint', '--format', 'json', 'a.vue').stdout).findings;
		assert.equal(finding.rule, 'shell-tag-renamed');
		assert.equal(finding.fixable, false);
	});

	it('goes on until nothing is left: a new tag has rules of its own', () => {
		const { text } = fixed('a.vue', '<template><nldd-timeline-track-cell status="past" variant="major" /></template>');
		assert.equal(text, '<template><nldd-step-cell status="past" level="major" /></template>');
	});

	it('changes a value only when it is written out', () => {
		assert.equal(fixed('a.html', '<nldd-list appearance="box" accessible-label="a"></nldd-list>').text, '<nldd-list appearance="box-tinted" accessible-label="a"></nldd-list>');
		assert.equal(fixed('a.html', "<nldd-list appearance='box' accessible-label=\"a\"></nldd-list>").text, "<nldd-list appearance='box-tinted' accessible-label=\"a\"></nldd-list>");
		assert.equal(fixed('a.html', '<nldd-list appearance=box accessible-label="a"></nldd-list>').text, '<nldd-list appearance=box-tinted accessible-label="a"></nldd-list>');
		const bound = '<template><nldd-list :appearance="box" accessible-label="a"></nldd-list></template>';
		assert.equal(fixed('a.vue', bound).text, bound);
	});

	it('does not choose a fill for a list with a background', () => {
		const source = '<nldd-list appearance="box" background="base" accessible-label="a"></nldd-list>';
		const { text, stdout } = fixed('a.html', source);
		assert.equal(text, source);
		assert.match(stdout, /invalid-value/);
	});

	it('renames a slot on the child that fills it', () => {
		const { text } = fixed('a.html', '<nldd-title text="a"><span slot="subtitle">b</span></nldd-title><div slot="subtitle"></div>');
		assert.equal(text, '<nldd-title text="a"><span slot="supporting-text">b</span></nldd-title><div slot="subtitle"></div>');
	});

	it('removes an attribute with its value, in every spelling', () => {
		const remove = (name, source) => fixed(name, source).text;
		assert.equal(remove('a.html', '<nldd-sheet full-height accessible-label="a"></nldd-sheet>'), '<nldd-sheet accessible-label="a"></nldd-sheet>');
		assert.equal(remove('a.vue', '<template><nldd-sheet\n  accessible-label="a"\n  :full-height="b > c"\n  @close="d"\n/></template>'), '<template><nldd-sheet\n  accessible-label="a"\n  @close="d"\n/></template>');
		assert.equal(remove('a.tsx', 'const a = <nldd-sheet accessible-label="a" full-height={b ? { c: 1 } : 2} />;'), 'const a = <nldd-sheet accessible-label="a" />;');
		assert.equal(remove('a.html', '<nldd-sheet accessible-label="a" [full-height]="b"></nldd-sheet>'), '<nldd-sheet accessible-label="a"></nldd-sheet>');
	});

	it('replaces a deprecated attribute, and the rule takes over its finding', () => {
		const { text, stdout } = fixed('a.html', '<nldd-navigation-split-view sidebar-accessible-label="a"></nldd-navigation-split-view>');
		assert.equal(text, '<nldd-navigation-split-view primary-sidebar-accessible-label="a"></nldd-navigation-split-view>');
		assert.doesNotMatch(stdout, /deprecated/);
	});

	it('reports a gone tag once, with what to use instead', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.html'), '<nldd-app-view></nldd-app-view>');
		const { findings } = JSON.parse(run(root, 'lint', '--format', 'json', 'a.html').stdout);
		assert.deepEqual(findings.map(({ rule }) => rule), ['shell-tag-renamed']);
	});

	it('leaves a file without a fix untouched', () => {
		const source = '<nldd-tab-bar></nldd-tab-bar>\r\n';
		assert.equal(fixed('a.html', source).text, source);
	});

	it('refuses what it cannot write back', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		assert.equal(run(root, 'lint', '--fix', '--update-baseline').status, 2);
		assert.equal(run(root, 'lint', '--fix', '--stdin').status, 2);
	});

	it('says what it can fix', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.html'), '<nldd-button text="a" variant="primary"></nldd-button>');
		assert.match(run(root, 'lint', 'a.html').stdout, /1 fixable with --fix/);
		assert.match(run(root, 'lint', '--statistics', 'a.html').stdout, /variant-renamed {2}\[--fix\]/);
		assert.equal(JSON.parse(run(root, 'lint', '--format', 'json', 'a.html').stdout).findings[0].fixable, true);
	});
});

describe('an Angular directive of the app', () => {
	const cli = fileURLToPath(new URL('./cli.js', import.meta.url));
	const rulesOf = (source) => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.html'), source);
		const { stdout } = spawnSync(process.execPath, [cli, 'lint', '--format', 'json', 'a.html'], { cwd: root, encoding: 'utf8' });
		return JSON.parse(stdout).findings.map(({ rule }) => rule);
	};
	const sheet = (attributes) => `<nldd-sheet accessible-label="a" ${attributes}></nldd-sheet>`;

	it('makes a bound name a hint: it is an input, or a typo', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.html'), sheet('#mySheet appSheetSync [show]="a"'));
		const { stdout, status } = spawnSync(process.execPath, [cli, 'lint', '--format', 'json', 'a.html'], { cwd: root, encoding: 'utf8' });
		assert.deepEqual(JSON.parse(stdout).findings.map(({ rule, severity }) => [rule, severity]), [['unknown-attribute', 'hint']]);
		assert.equal(status, 0);
	});

	it('leaves an accepted warning of the same rule in the baseline', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.html'), `${sheet('nope="a"')}${sheet('appSheetSync [show]="a"')}`);
		const lint = (...args) => spawnSync(process.execPath, [cli, 'lint', ...args, 'a.html'], { cwd: root, encoding: 'utf8' });
		lint('--update-baseline');
		const { findings } = JSON.parse(lint('--format', 'json').stdout);
		assert.deepEqual(findings.map(({ severity }) => severity), ['hint']);
	});

	it('takes no fix: a name that is gone can be its input', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		for (const source of ['<nldd-tab-bar-item appTabSync [selected]="a" text="b"></nldd-tab-bar-item>', '<nldd-tab-bar-item appTabSync selected text="b"></nldd-tab-bar-item>']) {
			writeFileSync(join(root, 'a.html'), source);
			spawnSync(process.execPath, [cli, 'lint', '--fix', 'a.html'], { cwd: root, encoding: 'utf8' });
			assert.equal(readFileSync(join(root, 'a.html'), 'utf8'), source);
		}
	});

	it('does not excuse a name written out', () => {
		assert.deepEqual(rulesOf(sheet('appSheetSync show="a"')), ['unknown-attribute']);
	});

	it('is not a template reference or an Angular directive of its own', () => {
		assert.deepEqual(rulesOf(sheet('#mySheet [show]="a"')), ['unknown-attribute']);
		assert.deepEqual(rulesOf(sheet('*ngIf="b" [show]="a"')), ['unknown-attribute']);
	});

	it('is not one of Angular itself: `routerLink` takes no `variant`', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.html'), '<nldd-button [routerLink]="a" text="b" variant="primary" [txet]="c"></nldd-button>');
		const { stdout } = spawnSync(process.execPath, [cli, 'lint', '--fix', '--format', 'json', 'a.html'], { cwd: root, encoding: 'utf8' });
		assert.match(readFileSync(join(root, 'a.html'), 'utf8'), /appearance="primary"/);
		assert.deepEqual(JSON.parse(stdout).findings.map(({ severity }) => severity), ['warn']);
	});
});

describe('what a typo in the options does', () => {
	const cli = fileURLToPath(new URL('./cli.js', import.meta.url));
	const lint = (source, ...args) => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.html'), source);
		return spawnSync(process.execPath, [cli, 'lint', ...args, 'a.html'], { cwd: root, encoding: 'utf8' });
	};

	it('says when a suppression names no rule', () => {
		const { stdout } = lint('<!-- nldd-lint-disable-next-line buton-no-vague-text -- reden -->\n<nldd-button text="a"></nldd-button>');
		assert.match(stdout, /`buton-no-vague-text` is not a rule/);
	});

	it('takes a rule of the browser as a rule', () => {
		const { stdout } = lint('<!-- nldd-lint-disable-next-line icon-not-found -- reden -->\n<nldd-button text="a"></nldd-button>');
		assert.doesNotMatch(stdout, /is not a rule/);
	});

	it('refuses a limit that is no whole number', () => {
		for (const limit of ['', '-1', '1.5', 'many']) {
			assert.equal(lint('<p></p>', `--max-warnings=${limit}`).status, 2, limit);
		}
		assert.equal(lint('<p></p>', '--max-warnings=0').status, 0);
	});
});

describe('statistics', () => {
	const cli = fileURLToPath(new URL('./cli.js', import.meta.url));

	it('counts per rule, most first', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.html'), '<nldd-gone></nldd-gone><nldd-gone></nldd-gone><nldd-tab-bar></nldd-tab-bar>');
		const { stdout, status } = spawnSync(process.execPath, [cli, 'lint', '--statistics', 'a.html'], { cwd: root, encoding: 'utf8' });
		assert.deepEqual(stdout.trim().split('\n').slice(0, 2).map((line) => line.trim().split(/\s+/).slice(0, 3)), [
			['2', 'error', 'unknown-element'],
			['1', 'error', 'tab-bar-needs-name'],
		]);
		assert.equal(status, 1);
	});
});

describe('a rule points at its page', () => {
	it('gives a link the Storybook of the design system opens', () => {
		const { rules } = loadData();
		const url = (id) => rules.find((rule) => rule.id === id).url;
		assert.equal(url('form-actions-needs-button-group'), 'https://nederlandsedigitaledienst.github.io/design-system/?path=/docs/patronen-formulier--docs');
		const guideline = rules.find((rule) => rule.see?.startsWith('ontwerprichtlijnen/'));
		assert.equal(guideline.url, `https://nederlandsedigitaledienst.github.io/design-system/?path=/docs/docs-ontwerprichtlijnen--docs#${guideline.see.split('/')[1]}`);
	});
});

describe('Lit in a .ts file', () => {
	const rulesIn = async (source) => {
		const { findings } = await createLinter(loadData()).lintSource(source, 'a.stories.ts');
		return findings.map(({ rule, line }) => [rule, line]);
	};

	it('finds a fault on its own line', async () => {
		const source = "const a = 1;\nexport const B = () => html`\n\t<nldd-tab-bar></nldd-tab-bar>\n`;";
		assert.deepEqual(await rulesIn(source), [['tab-bar-needs-name', 3]]);
	});

	it('reads a hole in a value as bound, also unquoted with spaces', async () => {
		assert.deepEqual(await rulesIn('html`<nldd-tab-bar accessible-label=${a ? "b" : "c"}></nldd-tab-bar>`'), []);
		assert.deepEqual(await rulesIn('html`<nldd-tab-bar accessible-label="${a}"></nldd-tab-bar>`'), []);
	});

	it('reads a hole between the tags as unknown', async () => {
		assert.deepEqual(await rulesIn('html`<nldd-form-actions>${buttons}</nldd-form-actions>`'), []);
	});

	it('lints a template inside a hole', async () => {
		const source = 'html`<div>${a.map(() => html`<nldd-tab-bar></nldd-tab-bar>`)}</div><nldd-pane></nldd-pane>`';
		assert.deepEqual((await rulesIn(source)).map(([rule]) => rule).includes('tab-bar-needs-name'), true);
	});

	it('leaves listeners, booleans and properties alone', async () => {
		const source = 'html`<nldd-button @click=${a} ?disabled=${b} .text=${c}></nldd-button><nldd-tab-bar .accessibleLabel=${c}></nldd-tab-bar>`';
		assert.deepEqual(await rulesIn(source), []);
	});

	it('is not fooled by strings, comments and plain templates', async () => {
		const source = "const a = 'html`<nldd-tab-bar>`'; // html`<nldd-tab-bar>`\nconst b = `<nldd-tab-bar></nldd-tab-bar>`;";
		assert.deepEqual(await rulesIn(source), []);
	});
});

describe('Jinja and Django', () => {
	const rulesIn = async (source, file = 'a.html.j2') => {
		const { findings } = await createLinter(loadData()).lintSource(source, file);
		return findings.filter(({ severity }) => severity !== 'hint').map(({ rule, line }) => [rule, line]);
	};

	it('reads a tag with a block right behind its name', async () => {
		const source = '<nldd-form-field{% if a %} hidden{% endif %}><nldd-text-field></nldd-text-field></nldd-form-field>';
		const field = first(parseHtml(source), 'nldd-text-field');
		assert.equal(field.parent.name, 'nldd-form-field');
		assert.deepEqual(await rulesIn(source), []);
	});

	it('does not know what a block in a tag sets', async () => {
		assert.deepEqual(await rulesIn('<nldd-tab-bar {% if a %}accessible-label="b"{% endif %}></nldd-tab-bar>'), []);
	});

	it('reads a value with quotes of its own as bound', async () => {
		assert.deepEqual(await rulesIn(`<nldd-tab-bar accessible-label="{{ a["b"] }}"></nldd-tab-bar>`), []);
		assert.deepEqual(await rulesIn(`<nldd-tab-bar accessible-label="{% trans "Tabs" %}"></nldd-tab-bar>`), []);
	});

	it('reads an expression loose in a tag as a spread', async () => {
		assert.deepEqual(await rulesIn('<nldd-tab-bar {{ attrs.as_html }}></nldd-tab-bar>'), []);
	});

	it('skips a comment', async () => {
		assert.deepEqual(await rulesIn('{# <nldd-tab-bar></nldd-tab-bar> #}'), []);
	});

	it('is not fooled by a comparison between the tags', async () => {
		assert.deepEqual(await rulesIn('{% if a <b %}<nldd-tab-bar></nldd-tab-bar>{% endif %}'), [['tab-bar-needs-name', 1]]);
	});

	it('still finds a fault on its own line, also in .html', async () => {
		const source = '{% set a = 1 %}\n<nldd-tab-bar></nldd-tab-bar>';
		assert.deepEqual(await rulesIn(source), [['tab-bar-needs-name', 2]]);
		assert.deepEqual(await rulesIn(source, 'a.html'), [['tab-bar-needs-name', 2]]);
	});

	it('leaves htmx alone', async () => {
		assert.deepEqual(await rulesIn('<nldd-button text="a" hx-get="/b" hx-swap="innerHTML"></nldd-button>', 'a.html'), []);
	});
});

describe('found in the sixth review', () => {
	const rulesIn = async (source, file) => {
		const { findings } = await createLinter(loadData()).lintSource(source, file);
		return findings.filter(({ severity }) => severity !== 'hint').map(({ rule }) => rule);
	};
	const cli = fileURLToPath(new URL('./cli.js', import.meta.url));
	const run = (root, ...args) => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });

	it('cannot check a tag whose name a template fills in', async () => {
		assert.deepEqual(await rulesIn('<nldd-{{ kind }} text="x"></nldd-{{ kind }}>', 'a.j2'), []);
	});

	it('skips a Django comment block', async () => {
		assert.deepEqual(await rulesIn('{% comment %}<nldd-gone></nldd-gone>{% endcomment %}', 'a.html'), []);
	});

	it('closes a self-closing tag in Angular with only listeners', async () => {
		const source = '<nldd-notification><nldd-button slot="actions" text="a" (click)="a()" /><nldd-button slot="actions" text="b" (click)="b()" /></nldd-notification>';
		assert.deepEqual(await rulesIn(source, 'a.html'), []);
	});

	it('does not count a template outlet as no content', async () => {
		const source = '<nldd-button text="a"><nldd-menu slot="popup"><ng-container [ngTemplateOutlet]="items"></ng-container></nldd-menu></nldd-button>';
		const { findings } = await createLinter(loadData()).lintSource(source, 'a.html');
		assert.equal(findings.some(({ rule }) => rule === 'menu-needs-two-actions'), false);
	});

	it('says nothing about suppressions when no tree was read', async () => {
		const source = '<template lang="pug">\n<!-- nldd-lint-disable-next-line tab-bar-needs-name -- x -->\nnldd-tab-bar\n</template>';
		assert.deepEqual(await rulesIn('<!-- nldd-lint-disable-next-line tab-bar-needs-name -- x -->', 'a.astro'), []);
		assert.equal((await rulesIn(source.replaceAll('template', 'script'), 'a.vue')).length, 0);
	});

	it('reports a file it cannot read', async () => {
		assert.deepEqual(await rulesIn('const a = <nldd-nope><<<', 'a.tsx'), ['syntax-error']);
	});

	it('refuses a baseline of part of the rules', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		assert.equal(run(root, 'lint', '--update-baseline', '--select', 'api').status, 2);
	});

	it('refuses a format it does not have, and statistics as json', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		assert.equal(run(root, 'lint', '--format', 'bogus').status, 2);
		assert.equal(run(root, 'lint', '--statistics', '--format', 'json').status, 2);
	});

	it('leaves properties of every element alone', async () => {
		assert.deepEqual(await rulesIn('<template><nldd-rich-text :innerHTML="a" /><nldd-title :textContent="b" /></template>', 'a.vue'), []);
	});

	it('leaves Alpine alone and reads its binding', async () => {
		assert.deepEqual(await rulesIn('<nldd-tab-bar x-show="a" x-on:click="b" x-bind:accessible-label="c"></nldd-tab-bar>', 'a.html'), []);
	});

	it('honors a suppression in a trimmed Jinja comment', async () => {
		const source = '{#- nldd-lint-disable-next-line tab-bar-needs-name -- x -#}\n<nldd-tab-bar></nldd-tab-bar>';
		assert.deepEqual(await rulesIn(source, 'a.j2'), []);
	});

	it('reads a tag named in a sentence as a mention', async () => {
		assert.deepEqual(await rulesIn('De `<nldd-button>` staat hier.', 'a.md'), []);
		assert.deepEqual(await rulesIn('De `<nldd-gone>` staat hier.', 'a.md'), ['unknown-element']);
	});

	it('finds nothing in a mention of any tag', async () => {
		const tags = Object.keys(loadData().tags);
		const found = await Promise.all(tags.map((tag) => rulesIn(`\`<${tag}>\` en \`<${tag} />\``, 'a.md')));
		assert.deepEqual(found.flat(), []);
	});

	it('closes a self-closing tag with a listener that has a dash', async () => {
		const source = '<nldd-notification><nldd-button slot="actions" text="a" (action-click)="a()" /><nldd-button slot="actions" text="b" (action-click)="b()" /></nldd-notification>';
		assert.deepEqual(await rulesIn(source, 'a.html'), []);
	});

	it('takes an arrow function in a script for no Angular', async () => {
		const source = '<nldd-notification><nldd-button slot="actions" text="a" /><nldd-button slot="actions" text="b" /></nldd-notification><script>const f = (e)=> e;</script>';
		assert.deepEqual(await rulesIn(source, 'a.html'), ['unknown-slot']);
	});

	it('wants a wrapper to name a tag', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, '.nldd-lint.json'), '{"wrappers":{"NlddX":1}}');
		assert.match(run(root, 'lint').stderr, /"wrappers" maps a component to a tag name/);
	});

	it('reads Jinja in a Markdown fence', async () => {
		assert.deepEqual(await rulesIn('```html\n<nldd-button{% if a %} text="b"{% endif %}></nldd-button>\n```', 'a.md'), []);
	});

	it('treats a capital in Jinja as in HTML', async () => {
		assert.deepEqual(await rulesIn('<nldd-button accessibleLabel="x"></nldd-button>', 'a.j2'), ['button-needs-name']);
	});

	it('says what is wrong with a config', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, '.nldd-lint.json'), '{"exclude":"a"}');
		assert.match(run(root, 'lint').stderr, /"exclude" takes a list/);
		writeFileSync(join(root, '.nldd-lint.json'), '{"rules":null}');
		assert.match(run(root, 'lint').stderr, /"rules" takes an object/);
		writeFileSync(join(root, '.nldd-lint.json'), '{nope');
		assert.match(run(root, 'lint').stderr, /\.nldd-lint\.json/);
	});

	it('sees a size the toolbar overwrites, also the default in a small toolbar', async () => {
		const source = '<nldd-toolbar size="sm"><nldd-toolbar-item><nldd-button text="a" size="md"></nldd-button><nldd-menu-item slot="overflow" text="a"></nldd-menu-item></nldd-toolbar-item></nldd-toolbar>';
		assert.deepEqual(await rulesIn(source, 'a.html'), ['toolbar-control-size-no-effect']);
	});

	it('gives a built-in rule a group in explain', () => {
		assert.match(execFileSync(process.execPath, [cli, 'explain', 'unknown-element'], { encoding: 'utf8' }), /\(api, error\)/);
	});
});

describe('sections on v-show', () => {
	it('does not count the tabs that are not showing', async () => {
		const section = '<nldd-simple-section v-show="a"><nldd-title heading-level="1" text="B"></nldd-title></nldd-simple-section>';
		const { findings } = await createLinter(loadData()).lintSource(`<template>${section}${section}</template>`, 'a.vue');
		assert.equal(findings.some(({ rule }) => rule === 'page-no-second-h1'), false);
	});
});

describe('groups', () => {
	const cli = fileURLToPath(new URL('./cli.js', import.meta.url));
	const run = (root, ...args) => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });
	const project = (config) => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		if (config) writeFileSync(join(root, '.nldd-lint.json'), JSON.stringify(config));
		writeFileSync(join(root, 'a.vue'), '<template><nldd-gone /><nldd-tab-bar /><nldd-title text="Klaar." /></template>');
		return root;
	};
	const rulesOf = (root, ...args) =>
		JSON.parse(run(root, 'lint', '--format', 'json', ...args, 'a.vue').stdout).findings.map(({ rule }) => rule).sort();

	it('selects a group', () => {
		assert.deepEqual(rulesOf(project(), '--select', 'a11y').includes('tab-bar-needs-name'), true);
		assert.deepEqual(rulesOf(project(), '--select', 'a11y').includes('unknown-element'), false);
	});

	it('ignores a group, built-in rules included', () => {
		assert.deepEqual(rulesOf(project(), '--ignore', 'api').includes('unknown-element'), false);
	});

	it('selects one rule', () => {
		assert.deepEqual(rulesOf(project(), '--select', 'title-no-full-stop'), ['title-no-full-stop']);
	});

	it('turns a group off in the config, and a rule beats its group', () => {
		const root = project({ rules: { a11y: 'off', 'tab-bar-needs-name': 'warn' } });
		assert.deepEqual(rulesOf(root).includes('tab-bar-needs-name'), true);
		assert.deepEqual(rulesOf(project({ rules: { a11y: 'off' } })).includes('tab-bar-needs-name'), false);
	});

	it('refuses what does not exist', () => {
		assert.equal(run(project(), 'lint', '--select', 'nope', 'a.vue').status, 2);
	});

	it('lists a group', () => {
		const { stdout } = run(project(), 'rules', '--group', 'copy');
		assert.match(stdout, /title-no-full-stop {2}\(copy, hint\)/);
		assert.doesNotMatch(stdout, /\(a11y, /);
	});
});

describe('the group pure', () => {
	const real = loadData();
	const pure = createLinter(real, { severities: resolveSeverities(real, {}, { optIn: ['pure'] }) });
	const rulesIn = async (linter, source, file = 'a.tsx') =>
		(await linter.lintSource(source, file)).findings.map(({ rule }) => rule).filter((rule) => rule.startsWith('html-')).sort();

	it('stays off unless a project turns it on', async () => {
		assert.deepEqual(await rulesIn(createLinter(real), '<div className="a"><p>x</p></div>'), []);
		assert.deepEqual(await rulesIn(createLinter(real, { severities: { 'title-no-full-stop': 'off' } }), '<p className="a">x</p>'), []);
	});

	it('finds a class whose value is bound, not only a written one', async () => {
		assert.deepEqual(await rulesIn(pure, 'export const A = () => <nldd-button text="a" className={cn(x)} />;'), ['html-no-class']);
	});

	it('leaves plain HTML alone where the component around it styles it', async () => {
		const source = '<nldd-container><nldd-rich-text><div><h2>a</h2><p>b</p></div></nldd-rich-text><nldd-text>c <a href="/d">d</a></nldd-text><nldd-dropdown><select><option>e</option></select></nldd-dropdown></nldd-container>';
		assert.deepEqual(await rulesIn(pure, source), []);
	});

	it('takes the file as the boundary, and is unsure inside a component of the app', async () => {
		assert.deepEqual(await rulesIn(pure, 'export const A = () => <p>x</p>;'), ['html-no-text']);
		assert.deepEqual(await rulesIn(pure, '<nldd-container><Card><p>x</p></Card></nldd-container>'), []);
	});

	it('finds an element with only text in it, and a rule, which is always empty', async () => {
		assert.deepEqual(await rulesIn(pure, '<nldd-container><span>Aanvraag</span><div>{naam}</div><hr /></nldd-container>'), ['html-no-container', 'html-no-container', 'html-no-container']);
	});

	it('lets a class or style be only where the component takes any HTML', async () => {
		assert.deepEqual(await rulesIn(pure, '<nldd-text><span className="rood">x</span></nldd-text>'), ['html-no-class']);
		assert.deepEqual(await rulesIn(pure, '<nldd-rich-text><pre className="language-js">x</pre></nldd-rich-text>'), []);
	});

	it('takes a form of the app in nldd-form, and a hidden field in it', async () => {
		assert.deepEqual(await rulesIn(pure, '<nldd-form><form onSubmit={save}><input type="hidden" name="csrf" /></form></nldd-form>'), []);
	});

	it('is unsure about JSX built to be placed elsewhere, as in a variable or a prop', async () => {
		assert.deepEqual(await rulesIn(pure, 'const A = () => { const b = <strong>x</strong>; return <nldd-text>{b}</nldd-text>; };'), []);
		assert.deepEqual(await rulesIn(pure, '<nldd-list renderItem={() => <p>x</p>} />'), []);
	});

	it('lets a bare carrier of a slot be', async () => {
		assert.deepEqual(await rulesIn(pure, '<nldd-title text="a"><span slot="supporting-text">b <nldd-link href="/c" text="c" /></span></nldd-title>'), []);
	});

	it('turns the group on from the command line, over a config that has it off', () => {
		const data = loadData();
		const severities = resolveSeverities(data, { pure: 'off', 'html-no-image': 'off' }, { optIn: ['pure'] });
		assert.equal(severities['html-no-text'], 'error');
		assert.equal(severities['html-no-image'], 'off');
	});

	it('judges what an exported component returns, and is unsure about helpers and callbacks', async () => {
		assert.deepEqual(await rulesIn(pure, 'export function A({ xs }) { const items = xs.map((x) => <li>{x}</li>); return <nldd-rich-text><ul>{items}</ul></nldd-rich-text>; }'), []);
		assert.deepEqual(await rulesIn(pure, 'const Item = ({ t }) => <strong>{t}</strong>; export const A = () => <nldd-text><Item t="a" /></nldd-text>;'), []);
		assert.deepEqual(await rulesIn(pure, 'function A() { return <p>x</p>; } export default A;'), ['html-no-text']);
		assert.deepEqual(await rulesIn(pure, 'export default class A extends Component { render() { return <h2>x</h2>; } }'), ['html-no-heading']);
	});

	it('judges a helper component or a variable where the file uses it', async () => {
		assert.deepEqual(await rulesIn(pure, 'const Row = () => <div className="row"><nldd-text>a</nldd-text></div>; export const A = () => <nldd-container><Row /></nldd-container>;'), ['html-no-class', 'html-no-container']);
		assert.deepEqual(await rulesIn(pure, 'const Item = ({ t }) => <strong>{t}</strong>; export const A = () => <nldd-container><Item t="a" /></nldd-container>;'), ['html-no-text']);
		assert.deepEqual(await rulesIn(pure, 'export function A() { const el = <p>a</p>; return <nldd-container>{el}</nldd-container>; }'), ['html-no-text']);
		assert.deepEqual(await rulesIn(pure, 'const Item = () => <strong>x</strong>; export const A = () => <nldd-container><nldd-text><Item /></nldd-text><Item /></nldd-container>;'), []);
		assert.deepEqual(await rulesIn(pure, 'const Item = () => <strong>x</strong>; export const A = () => <nldd-list renderItem={Item} />;'), []);
	});

	it('lets nldd-rich-text take its text, not a layout or a control', async () => {
		assert.deepEqual(await rulesIn(pure, '<nldd-rich-text><div className="grid"><button>a</button></div></nldd-rich-text>'), ['html-no-class', 'html-no-control']);
	});

	it('leaves the inside of a drawing to the drawing', async () => {
		assert.deepEqual(await rulesIn(pure, '<nldd-image><svg role="img" aria-label="a"><style>{".p{fill:red}"}</style><path className="p" /></svg></nldd-image>'), []);
	});

	it('finds the class and style bindings of Angular', async () => {
		assert.deepEqual(await rulesIn(pure, '<nldd-text [ngClass]="c">a</nldd-text><nldd-text [style.color]="c">b</nldd-text>', 'a.html'), ['html-no-class', 'html-no-style']);
	});

	it('reports a stylesheet block by block, and leaves an empty one or one with only the system alone', async () => {
		assert.deepEqual(await rulesIn(pure, '.a {}\n.b {}\n', 'a.css'), ['html-no-stylesheet', 'html-no-stylesheet']);
		assert.deepEqual(await rulesIn(pure, '<template><nldd-text>a</nldd-text></template><style></style><style>@import "@nldd/design-system/dist/css/global.css";</style>', 'a.vue'), []);
		assert.deepEqual(await rulesIn(pure, '@use "@nldd/design-system/styles";\n', 'a.scss'), []);
		assert.deepEqual(await rulesIn(pure, '@import "/static/nldd/overrides.css";\n', 'a.css'), ['html-no-stylesheet']);
	});

	it('lets an empty mount point be', async () => {
		assert.deepEqual(await rulesIn(pure, '<html><body><div id="app"></div></body></html>', 'index.html'), []);
	});

	it('reads a stylesheet as a style element, unless it only imports the design system', async () => {
		assert.equal(parseStylesheet("@import '@nldd/design-system/dist/css/global.css';\n/* app */").length, 0);
		assert.deepEqual(await rulesIn(pure, '.app { padding: 4px }', 'app.css'), ['html-no-stylesheet']);
		assert.deepEqual(await rulesIn(pure, '<template><nldd-text>a</nldd-text></template><style scoped>.a {}</style>', 'a.vue'), ['html-no-stylesheet']);
		assert.deepEqual(await rulesIn(pure, '<html><head><style>body {}</style></head></html>', 'a.html'), ['html-no-stylesheet']);
	});

	it('tightens a baseline and never raises it', () => {
		const cli = fileURLToPath(new URL('./cli.js', import.meta.url));
		const run = (root, ...args) => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		const write = (body) => writeFileSync(join(root, 'a.tsx'), body);
		write('export const A = () => <p>x</p>;\nexport const B = () => <p>y</p>;\n');
		run(root, 'lint', '--pure', '--update-baseline');
		write('export const A = () => <nldd-text>x</nldd-text>;\nexport const B = () => <p>y</p>;\n');
		assert.match(run(root, 'lint', '--pure').stdout, /1 accepted no longer found: run --tighten-baseline/);
		run(root, 'lint', '--pure', '--tighten-baseline');
		assert.deepEqual(readBaseline(root)['a.tsx'], { 'html-no-text|p': 1 });
		write('export const A = () => <p>x</p>;\nexport const B = () => <p>y</p>;\n');
		run(root, 'lint', '--pure', '--tighten-baseline');
		assert.equal(run(root, 'lint', '--pure').status, 1);
	});

	it('keeps a baseline entry with a file that moved, and of a rule that is off', () => {
		const cli = fileURLToPath(new URL('./cli.js', import.meta.url));
		const run = (root, ...args) => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		assert.match(run(root, 'lint', '--tighten-baseline').stdout, /No baseline to tighten/);
		writeFileSync(join(root, 'a.tsx'), 'export const A = () => <p>x</p>;\n');
		run(root, 'lint', '--pure', '--update-baseline');
		execFileSync('mv', [join(root, 'a.tsx'), join(root, 'b.tsx')]);
		run(root, 'lint', '--pure', '--tighten-baseline');
		assert.deepEqual(readBaseline(root)['b.tsx'], { 'html-no-text|p': 1 });
		writeFileSync(join(root, '.nldd-lint.json'), JSON.stringify({ rules: { pure: 'error', 'html-no-text': 'off' } }));
		run(root, 'lint', '--tighten-baseline');
		assert.deepEqual(readBaseline(root)['b.tsx'], { 'html-no-text|p': 1 });
		writeFileSync(join(root, 'b.tsx'), 'export const A = () => <nldd-text>x</nldd-text>;\n');
		writeFileSync(join(root, '.nldd-lint.json'), JSON.stringify({ rules: { pure: 'error' } }));
		assert.deepEqual(JSON.parse(run(root, 'lint', '--format', 'json').stdout).baseline, { accepted: 0, noLongerFound: 1 });
	});

	it('is turned on with --pure, and a baseline without it keeps what pure accepted', () => {
		const cli = fileURLToPath(new URL('./cli.js', import.meta.url));
		const run = (root, ...args) => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, 'a.tsx'), 'export const A = () => <p>x</p>;\n');
		writeFileSync(join(root, 'app.css'), '.a { color: red }\n');
		assert.equal(run(root, 'lint').status, 0);
		assert.equal(run(root, 'lint', '--pure').status, 1);
		run(root, 'lint', '--pure', '--update-baseline');
		run(root, 'lint', '--update-baseline');
		assert.equal(run(root, 'lint', '--pure').status, 0);
		writeFileSync(join(root, 'b.tsx'), 'export const B = () => <span className="b">x</span>;\n');
		assert.equal(run(root, 'lint', '--pure').status, 1);
	});
});

describe('a hint', () => {
	const hint = { id: 'try-this', severity: 'hint', context: 'nldd-pane', message: 'Have a look at the pattern.' };
	const data = { ...DATA, rules: [hint] };

	it('reaches the findings with its level', async () => {
		const { findings } = await createLinter(data).lintSource('<template><nldd-pane /></template>', 'a.vue');
		assert.deepEqual(findings.map(({ rule, severity }) => [rule, severity]), [['try-this', 'hint']]);
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

	it('does not exit 1 on hints alone', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, '.nldd-lint.json'), '{ "rules": { "unknown-element": "hint" } }');
		writeFileSync(join(root, 'a.vue'), '<template><nldd-gone /></template>');
		const result = run(root, 'lint', '--max-warnings', '0', 'a.vue');
		assert.equal(result.status, 0);
		assert.match(result.stdout, /✔ 0 errors, 0 warnings, 1 hint/);
		assert.match(run(root, 'lint', '--format', 'github', 'a.vue').stdout, /^::notice /);
	});

	it('summarizes a hint once, however often it applies', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, '.nldd-lint.json'), '{ "rules": { "unknown-element": "hint" } }');
		writeFileSync(join(root, 'a.vue'), '<template><nldd-gone /><nldd-gone /><nldd-gone /></template>');
		const { stdout } = run(root, 'lint', 'a.vue');
		assert.equal(stdout.match(/does not exist/g).length, 1);
		assert.match(stdout, /3× a\.vue:1, a\.vue:1, \+1/);
		assert.match(stdout, /3 hints/);
		assert.equal(JSON.parse(run(root, 'lint', '--format', 'json', 'a.vue').stdout).findings.length, 3);
	});

	it('keeps hints out of the baseline', () => {
		const root = mkdtempSync(join(tmpdir(), 'nldd-lint-'));
		writeFileSync(join(root, '.nldd-lint.json'), '{ "rules": { "unknown-element": "hint" } }');
		writeFileSync(join(root, 'a.vue'), '<template><nldd-gone /></template>');
		run(root, 'lint', '--update-baseline', 'a.vue');
		assert.equal(readFileSync(join(root, '.nldd-lint-baseline.json'), 'utf8').trim(), '{}');
	});

	it('explains a rule', () => {
		const output = execFileSync(process.execPath, [cli, 'explain', 'toolbar-item-needs-overflow'], { encoding: 'utf8' });
		assert.match(output, /patronen-werkbalk-met-acties--docs/);
	});

	it('lists the rules about a component, also where it is only mentioned', () => {
		const output = execFileSync(process.execPath, [cli, 'rules', '--for', 'nldd-toggle-button'], { encoding: 'utf8' });
		assert.match(output, /button-bar-no-toggle-button/);
	});

	it('refuses a level that does not exist', () => {
		const root = project();
		writeFileSync(join(root, '.nldd-lint.json'), '{ "rules": { "unknown-element": "none" } }');
		assert.match(run(root, 'lint').stderr, /takes off, hint, warn or error/);
	});

	it('refuses a max-warnings that is no number', () => {
		assert.equal(run(project(), 'lint', '--max-warnings', 'abc').status, 2);
	});

	it('finds a file with a name git would otherwise quote', () => {
		const root = project();
		spawnSync('git', ['init', '-q'], { cwd: root });
		writeFileSync(join(root, 'src/café.vue'), '<template><nldd-gone /></template>\n');
		assert.match(run(root, 'lint').stdout, /café\.vue/);
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
