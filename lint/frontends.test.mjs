import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyFixes } from './fix.js';
import { parseSource } from './frontends.js';
import { createLinter, loadData } from './linter.js';
import { BOUND, walk } from './tree.js';

const linter = createLinter(loadData());
const rules = async (source, filename) => (await linter.lintSource(source, filename)).findings.map(({ rule }) => rule);

const nodes = async (source, filename, name) => {
	const found = [];
	for (const root of (await parseSource(source, filename)).roots) walk(root, (node) => node.name === name && found.push(node));
	return found;
};

describe('frontend edge cases', () => {
	it('does not crash on a mention whose tag name is no valid regex', async () => {
		await assert.doesNotReject(linter.lintSource('Use `<nldd-x(>` here.\n', 'a.md'));
	});

	it('reads a translations key a template fills in as bound', async () => {
		const source = `<nldd-button text="a" translations='{"{{ k }}": "y"}'></nldd-button>`;
		assert.ok(!(await rules(source, 'a.html.j2')).includes('translation-key-not-found'));
		const [button] = await nodes(source, 'a.html.j2', 'nldd-button');
		assert.equal(button.attrs.get('translations'), BOUND);
	});

	it('closes a self-closing tag in an Angular component template without bindings', async () => {
		const source = '<nldd-list><nldd-list-item href="/a" /><nldd-list-item href="/b" /></nldd-list>';
		const items = await nodes(source, 'app.component.html', 'nldd-list-item');
		assert.deepEqual(items.map((item) => item.parent.name), ['nldd-list', 'nldd-list']);
	});

	for (const [language, filename, open, otherwise, close] of [
		['Jinja', 'a.html.j2', '{% if x %}', '{% else %}', '{% endif %}'],
		['Jinja elif', 'a.html.j2', '{% if x %}', '{% elif y %}<nldd-list-item>{% else %}', '{% endif %}'],
		['Go', 'a.gohtml', '{{if .X}}', '{{else}}', '{{end}}'],
		['Handlebars', 'a.html', '{{#if x}}', '{{else}}', '{{/if}}'],
	]) {
		it(`does not nest the start tags of two ${language} branches`, async () => {
			const source = `<nldd-list>${open}<nldd-list-item href="/a">${otherwise}<nldd-list-item>${close}a</nldd-list-item><nldd-list-item>b</nldd-list-item></nldd-list>`;
			assert.ok(!(await rules(source, filename)).includes('list-item-no-other-children'));
			const items = await nodes(source, filename, 'nldd-list-item');
			assert.ok(items.every((item) => item.parent.name === 'nldd-list'));
		});
	}

	for (const [language, filename, open, otherwise, close] of [
		['Jinja else', 'a.html.j2', '{% if x %}', '{% else %}', '{% endif %}'],
		['Jinja elif', 'a.html.j2', '{% if x %}', '{% elif y %}', '{% endif %}'],
		['Jinja empty', 'a.html.j2', '{% for x in y %}', '{% empty %}', '{% endfor %}'],
		['Go', 'a.gohtml', '{{if .X}}', '{{else}}', '{{end}}'],
		['Handlebars', 'a.html', '{{#if x}}', '{{else}}', '{{/if}}'],
		['Handlebars inverse', 'a.html', '{{#if x}}', '{{^}}', '{{/if}}'],
		['Mustache inverse section', 'a.html', '{{^x}}<p>a</p>{{/x}}{{#if y}}', '{{else}}', '{{/if}}'],
	]) {
		it(`reads a balanced later ${language} branch`, async () => {
			const source = `${open}\n<nldd-button text="V"></nldd-button>\n${otherwise}\n<nldd-bestaat-niet></nldd-bestaat-niet><img src="a.png">\n${close}`;
			assert.ok((await rules(source, filename)).includes('unknown-element'));
		});
	}

	it('reads a later branch whose <p> the next block closes, as HTML does', async () => {
		const source = '{% if a %}<p>a</p>{% else %}<p>b<div><nldd-bestaat-niet></nldd-bestaat-niet></div>{% endif %}';
		assert.ok((await rules(source, 'a.html.j2')).includes('unknown-element'));
	});

	it('reads a later branch with an element HTML closes itself, or a script', async () => {
		const source = '<ul>{% if a %}<li>a{% else %}<li>b<nldd-bestaat-niet></nldd-bestaat-niet><script>if (a < b) c();</script>{% endif %}</ul>';
		assert.ok((await rules(source, 'a.html.j2')).includes('unknown-element'));
	});

	it('takes `/>` on a custom element in HTML for an open element, as the parser does', async () => {
		const source = '<nldd-list>{% if x %}<nldd-list-item href="/a">{% else %}<nldd-list-item />{% endif %}a</nldd-list-item></nldd-list>';
		const items = await nodes(source, 'a.html.j2', 'nldd-list-item');
		assert.ok(items.every((item) => item.parent.name === 'nldd-list'));
	});

	for (const block of ['{% spaceless %}<p>a</p>{% endspaceless %}', '{% set x %}<p>a</p>{% endset %}', '{% raw %}<p>a</p>{% endraw %}']) {
		it(`reads a branch to its end past ${block.slice(0, 14)}`, async () => {
			const source = `<nldd-list>{% if x %}<nldd-list-item href="/a">{% else %}${block}{% set y = 1 %}<nldd-list-item>{% endif %}a</nldd-list-item></nldd-list>`;
			const items = await nodes(source, 'a.html.j2', 'nldd-list-item');
			assert.ok(items.every((item) => item.parent.name === 'nldd-list'));
		});
	}

	it('takes `{{ else.x }}` for a value, not another branch', async () => {
		const source = '{{#if x}}<div>{{ else.x }}<nldd-bestaat-niet></nldd-bestaat-niet></div>{{/if}}';
		assert.ok((await rules(source, 'a.html')).includes('unknown-element'));
	});

	it('takes `{{ block }}` without an argument for a value, not a Go block', async () => {
		const source = '{{if .X}}<p>a</p>{{else}}{{ block }}<nldd-bestaat-niet></nldd-bestaat-niet>{{end}}';
		assert.ok((await rules(source, 'a.gohtml')).includes('unknown-element'));
	});

	it('reads each branch after one that leaves an element open', async () => {
		const source = '{% if a %}<div class="a">{% elif b %}<div class="b">{% else %}<nldd-bestaat-niet></nldd-bestaat-niet>{% endif %}x</div>';
		assert.ok((await rules(source, 'a.html.j2')).includes('unknown-element'));
	});

	it('keeps a block nested in a blanked branch from ending it early', async () => {
		const source = '<nldd-list>{% if x %}<nldd-list-item href="/a">{% else %}{% if y %}<nldd-list-item>{% endif %}{% endif %}a</nldd-list-item></nldd-list>';
		const items = await nodes(source, 'a.html.j2', 'nldd-list-item');
		assert.equal(items.length, 1);
	});

	it('reads an MDX expression after `= ` as a bound value', async () => {
		const [button] = await nodes('<nldd-button appearance= {value} text="a" />\n', 'a.mdx', 'nldd-button');
		assert.equal(button.attrs.get('appearance'), BOUND);
	});

	it('reads a short MDX expression between the tags as unknown content', async () => {
		const source = '<nldd-text>{t}</nldd-text>\n';
		assert.ok(!(await rules(source, 'a.mdx')).includes('text-needs-element'));
		const [text] = await nodes(source, 'a.mdx', 'nldd-text');
		assert.equal(text.text, false);
		assert.deepEqual(text.children.map((child) => child.name), ['#unknown']);
	});

	it('strips any Vue modifier from a bound name, also for --fix', async () => {
		assert.ok(!(await rules('<template><nldd-button :appearance.sync="v" text="a" /></template>', 'a.vue')).includes('unknown-attribute'));
		const source = '<template><nldd-button :variant.sync="v" text="a" /></template>';
		const { findings } = await linter.lintSource(source, 'a.vue');
		assert.equal(applyFixes(source, findings).source, '<template><nldd-button :appearance.sync="v" text="a" /></template>');
	});

	it('lowers tag and attribute names in plain HTML, and --fix keeps the offsets', async () => {
		assert.ok(!(await rules('<nldd-button Text="x"></nldd-button>', 'a.html')).includes('button-needs-name'));
		const [button] = await nodes('<NLDD-BUTTON text="x"></NLDD-BUTTON>', 'a.html', 'nldd-button');
		assert.equal(button.opaque, false);
		const source = '<nldd-button VARIANT="primary" text="a"></nldd-button>';
		const { findings } = await linter.lintSource(source, 'a.html');
		assert.equal(applyFixes(source, findings).source, '<nldd-button appearance="primary" text="a"></nldd-button>');
	});

	it('keeps the case of names in Angular templates', async () => {
		const [button] = await nodes('<nldd-button [ngModel]="a" text="x" />', 'a.component.html', 'nldd-button');
		assert.equal(button.attrs.get('ngModel'), BOUND);
	});

	for (const filename of ['a.vue', 'app.component.html']) {
		it(`opens no element for a \`<\` in an interpolation (${filename})`, async () => {
			const markup = '<nldd-text><p>{{ a<b }}</p></nldd-text>';
			const [p] = await nodes(filename.endsWith('.vue') ? `<template>${markup}</template>` : markup, filename, 'p');
			assert.ok(p.children.every((child) => child.name === '#unknown'));
		});
	}

	it('strips Markdown frontmatter with CRLF and at the end of the file', async () => {
		assert.deepEqual(await rules('---\r\ntitle: <nldd-x>\r\n---\r\n\r\nHi\r\n', 'a.md'), []);
		assert.deepEqual(await rules('---\ntitle: <nldd-x>\n---', 'a.md'), []);
	});

	for (const child of ['{``}', '{false}', '{true}', '{null}', "{' '}"]) {
		it(`reads ${child} in JSX as no text`, async () => {
			const [text] = await nodes(`export const A = () => <nldd-text>${child}</nldd-text>;`, 'a.tsx', 'nldd-text');
			assert.equal(text.text, false);
		});
	}

	for (const child of ['{`a`}', '{`${a}`}', "{'a'}", '{0}']) {
		it(`reads ${child} in JSX as text`, async () => {
			const [text] = await nodes(`export const A = () => <nldd-text>${child}</nldd-text>;`, 'a.tsx', 'nldd-text');
			assert.equal(text.text, true);
		});
	}
});
