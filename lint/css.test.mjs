import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { declarations, designSystemTester, enclosingBlock, isDesignSystemCss, tokenReferences, withoutComments } from './css.js';
import { createLinter, loadData } from './linter.js';

const linter = createLinter(loadData());
const rulesIn = async (source, filename) => (await linter.lintSource(source, filename)).findings.map(({ rule }) => rule).sort();

describe('withoutComments', () => {
	it('starts no comment inside a string', () => {
		const source = '.x { content: "a // b"; color: var(--semantics-nope); }';
		assert.equal(withoutComments(source), source);
		assert.deepEqual(tokenReferences('.x { content: "/*"; color: var(--semantics-nope); } /* */').map(({ name }) => name), ['--semantics-nope']);
	});

	it('blanks comments to the same length and keeps their newlines', () => {
		assert.equal(withoutComments('a /* b\nc */ d // e\nf'), 'a     \n     d     \nf');
	});

	it('keeps `//` and apostrophes as they are in markup', () => {
		assert.equal(withoutComments("<p>it's</p><a href=//x>y</a><!-- 'z -->", false), "<p>it's</p><a href=//x>y</a>           ");
	});
});

describe('declarations', () => {
	it('reads a quoted key of a style object and setProperty()', () => {
		assert.deepEqual(declarations('<div style={{"--_button-gap": "0"}}/>').map(({ name }) => name), ['--_button-gap']);
		assert.deepEqual(declarations(`{'--_button-gap': x}`).map(({ name }) => name), ['--_button-gap']);
		assert.deepEqual(declarations(`el.style.setProperty('--_button-gap', '0')`).map(({ name }) => name), ['--_button-gap']);
	});
});

describe('enclosingBlock', () => {
	it('takes a quote in a stylesheet for part of the rule', () => {
		const css = '.x{a:1; background:url("a.png"); b:2}';
		assert.deepEqual(enclosingBlock(css, 4, { quotes: false, strings: true }), { start: 3, end: css.length - 1 });
		assert.notDeepEqual(enclosingBlock(css, 4), { start: 3, end: css.length - 1 });
	});
});

describe('isDesignSystemCss', () => {
	const system = { '|:root': ['--context-link-color'] };

	it('is never CSS that names a token the design system does not know', () => {
		const known = (name) => name === '--semantics-links-color';
		assert.equal(isDesignSystemCss(':root{--context-link-color:var(--semantics-links-color)}', system, known), true);
		assert.equal(isDesignSystemCss(':root{--context-link-color:var(--semantics-nope)}', system, known), false);
	});

	it('reads each CSS text once', () => {
		let asked = 0;
		const test = designSystemTester(system, () => (asked++, true));
		test(':root{--context-link-color:var(--semantics-a)}');
		test(':root{--context-link-color:var(--semantics-a)}');
		assert.equal(asked, 1);
	});
});

describe('CSS findings', () => {
	it('checks an app block that looks like the design system', async () => {
		assert.deepEqual(await rulesIn(':root { --context-link-color: var(--semantics-nope); }', 'a.css'), ['link-context-needs-states', 'token-not-found']);
		assert.deepEqual(await rulesIn(':root { --context-link-color: red; }', 'a.css'), ['link-context-needs-states']);
	});

	it('finds a token after a string with a comment marker in it', async () => {
		assert.deepEqual(await rulesIn('.x { content: "a // b"; color: var(--semantics-nope); }', 'a.css'), ['token-not-found']);
		assert.deepEqual(await rulesIn('.x { content: "/*"; color: var(--semantics-nope); }\n/* */', 'a.css'), ['token-not-found']);
	});

	it('reads `//` as a comment in the script of a component and in Sass, not in its markup', async () => {
		const vue = '<template><a href="//x">y</a></template>\n<script>\n// var(--semantics-nope)\n</script>\n<style lang="scss">\n// var(--semantics-nope)\n.x { color: var(--semantics-nope); }\n</style>';
		assert.deepEqual((await linter.lintSource(vue, 'a.vue')).findings.map(({ rule, line }) => `${rule}@${line}`), ['token-not-found@7']);
		const astro = '---\n// var(--semantics-nope)\n---\n<p>x</p>';
		assert.deepEqual(await rulesIn(astro, 'a.astro'), []);
		assert.deepEqual(await rulesIn('<style>\n.x { background: url(//cdn/a.png); color: var(--semantics-nope); }\n</style>', 'a.vue'), ['token-not-found']);
	});

	it('takes a string in a rule for part of that rule', async () => {
		const css = '.x{--context-link-color:red; background:url("a.png"); --context-link-is-hovered-color:red; --context-link-is-active-color:red}';
		assert.deepEqual(await rulesIn(css, 'a.css'), []);
		assert.deepEqual(await rulesIn(`<template><div :style="{'--context-link-color': a, '--context-link-is-hovered-color': a, '--context-link-is-active-color': a}"></div></template>`, 'a.vue'), []);
	});

	it('reads a quoted key in a style object', async () => {
		assert.deepEqual(await rulesIn('export const A = () => <div style={{"--_button-gap": "0"}}/>;', 'a.tsx'), ['local-variable-no-override']);
		assert.deepEqual(await rulesIn(`<template><div :style="{'--_button-gap': x}"></div></template>`, 'a.vue'), ['local-variable-no-override']);
		assert.deepEqual(await rulesIn(`export const A = () => <div style={{'--semantics-mine': 'red', color: 'var(--semantics-mine)'}}/>;`, 'a.tsx'), []);
	});

	it('survives a link to a stylesheet with a percent sign in its name', async () => {
		const page = join(mkdtempSync(join(tmpdir(), 'nldd-lint-')), 'index.html');
		assert.deepEqual(await rulesIn('<html><head><link rel="stylesheet" href="100%.css"></head><body></body></html>', page), []);
	});
});
