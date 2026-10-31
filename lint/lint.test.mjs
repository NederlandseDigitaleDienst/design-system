import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createEngine } from './engine.js';
import { parseHtml, parseJsx, parseMarkdown, parseVue } from './frontends.js';
import { createCanonical, createLinter, loadData } from './linter.js';
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
		assert.ok(!(await rulesIn(vue(`<nldd-tab-bar accessible-label="a" :navigation="n">${tabs}</nldd-tab-bar>`))).includes('tabs-with-href-need-navigation'));
		assert.ok(!(await rulesIn(vue(`<nldd-tab-bar accessible-label="a" v-bind="o">${tabs}</nldd-tab-bar>`))).includes('tabs-with-href-need-navigation'));
		assert.ok((await rulesIn(vue(`<nldd-tab-bar accessible-label="a">${tabs}</nldd-tab-bar>`))).includes('tabs-with-href-need-navigation'));
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
		assert.ok((await rulesIn(vue(`<nldd-button-group>${four}${repeated}</nldd-button-group>`))).includes('button-group-at-most-three'));
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
		assert.ok((await rulesIn(vue('<nldd-avatar-group><nldd-image></nldd-image></nldd-avatar-group>'))).includes('avatar-group-holds-avatars'));
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
		assert.match(output, /patronen\/toolbar-with-actions/);
	});

	it('lists the rules about a component, also where it is only mentioned', () => {
		const output = execFileSync(process.execPath, [cli, 'rules', '--for', 'nldd-toggle-button'], { encoding: 'utf8' });
		assert.match(output, /no-toggle-button-in-button-bar/);
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
