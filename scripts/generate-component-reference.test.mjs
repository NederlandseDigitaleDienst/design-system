/**
 * Unit tests for the JSDoc parser in generate-component-reference.js.
 *
 * Pure-logic tests, run with Node's built-in runner (no browser, no vitest):
 *   node --test scripts/generate-component-reference.test.mjs
 * or via `npm run test:scripts`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
	parseTypedTag,
	parseNamedTag,
	parseComponent,
	extractLeadingBlock,
	escapeCell,
	componentsDir,
} from './generate-component-reference.js';

test('parseTypedTag: simple type, name, description', () => {
	assert.deepEqual(parseTypedTag('{string} label - The label'), {
		type: 'string',
		name: 'label',
		description: 'The label',
	});
});

test('parseTypedTag: union type with quotes survives brace balancing', () => {
	assert.deepEqual(parseTypedTag("{'a'|'b'} variant - The variant"), {
		type: "'a'|'b'",
		name: 'variant',
		description: 'The variant',
	});
});

test('parseTypedTag: nested generic type', () => {
	assert.deepEqual(parseTypedTag('{Record<string, string>} t - Overrides'), {
		type: 'Record<string, string>',
		name: 't',
		description: 'Overrides',
	});
});

test('parseTypedTag: strips [optional] bracket convention from name', () => {
	assert.equal(parseTypedTag('{string} [background] - bg').name, 'background');
});

test('parseTypedTag: missing type', () => {
	assert.deepEqual(parseTypedTag('name - desc only'), {
		type: '',
		name: 'name',
		description: 'desc only',
	});
});

test('parseNamedTag: default slot via leading dash', () => {
	assert.deepEqual(parseNamedTag('- Default slot content'), {
		name: '',
		description: 'Default slot content',
	});
});

test('parseNamedTag: named slot', () => {
	assert.deepEqual(parseNamedTag('header - Header content'), {
		name: 'header',
		description: 'Header content',
	});
});

test('parseComponent: single element with attrs, slots, events', () => {
	const block = [
		'Some Component (Lit + TypeScript)',
		'',
		'A short summary.',
		'',
		'@element nldd-thing',
		'@attr {string} label - The label',
		'@slot - Default content',
		'@fires change - When it changes',
	].join('\n');
	const [c] = parseComponent(block, '/x/src/components/content/thing/thing.ts', null);
	assert.equal(c.tag, 'nldd-thing');
	assert.equal(c.summary, 'A short summary.');
	assert.deepEqual(c.attrs, [{ type: 'string', name: 'label', description: 'The label' }]);
	assert.equal(c.slots.length, 1);
	assert.equal(c.events[0].name, 'change');
});

test('parseComponent: multi-line tag description is joined, not truncated', () => {
	const block = [
		'@element nldd-thing',
		'@attr {string} size - First line',
		'  that wraps to a second line.',
	].join('\n');
	const [c] = parseComponent(block, '/x/src/components/a/b/b.ts', null);
	assert.equal(c.attrs[0].description, 'First line that wraps to a second line.');
});

test('parseComponent: multiple @element blocks split into separate components', () => {
	const block = [
		'@element nldd-group',
		'@attr {string} value - Group value',
		'@element nldd-group-item',
		'@attr {boolean} selected - Item selected',
	].join('\n');
	const result = parseComponent(block, '/x/src/components/a/group/group.ts', null);
	assert.equal(result.length, 2);
	assert.equal(result[0].tag, 'nldd-group');
	assert.equal(result[0].attrs[0].name, 'value');
	assert.equal(result[1].tag, 'nldd-group-item');
	assert.equal(result[1].attrs[0].name, 'selected');
});

test('parseComponent: drops plural boilerplate title from summary', () => {
	const block = [
		'Some Components (Lit + TypeScript)',
		'@element nldd-thing',
	].join('\n');
	const [c] = parseComponent(block, '/x/src/components/a/b/b.ts', null);
	assert.equal(c.summary, '');
});

test('parseComponent: falls back to @customElement tag when no @element', () => {
	const block = 'Just prose, no element tag.';
	const [c] = parseComponent(block, '/x/src/components/a/b/b.ts', 'nldd-fallback');
	assert.equal(c.tag, 'nldd-fallback');
});

test('parseComponent: category is derived from the path under componentsDir', () => {
	// Use a path actually under the real componentsDir so the prefix-slice that
	// derives the category lines up (a synthetic path would yield the wrong root).
	const filePath = join(componentsDir, 'status-and-feedback', 'badge', 'badge.ts');
	const [c] = parseComponent('@element nldd-badge', filePath, null);
	assert.equal(c.category, 'status-and-feedback');
});

test('extractLeadingBlock: prefers the block containing @element over a license header', () => {
	const source = [
		'/** Copyright 2026. License header, no tags. */',
		'import { LitElement } from "lit";',
		'/**',
		' * @element nldd-thing',
		' * @attr {string} label - x',
		' */',
		'@customElement("nldd-thing")',
		'export class X {}',
	].join('\n');
	const block = extractLeadingBlock(source);
	assert.match(block, /@element nldd-thing/);
	assert.doesNotMatch(block, /Copyright/);
});

test('extractLeadingBlock: tags with two spaces after the star still land at column 0', () => {
	// Some formatters align tags with two spaces; the strip must not leave a
	// leading space, or the @-tag regex misses it and the entry is dropped.
	const source = ['/**', ' *  @element nldd-thing', ' *  @attr {string} label - x', ' */'].join('\n');
	const block = extractLeadingBlock(source);
	const [c] = parseComponent(block, '/x/src/components/a/b/b.ts', null);
	assert.equal(c.tag, 'nldd-thing');
	assert.equal(c.attrs.length, 1);
	assert.equal(c.attrs[0].name, 'label');
});

test('escapeCell: escapes pipe characters so union types do not break the table', () => {
	assert.equal(escapeCell("'a'|'b'"), "'a'\\|'b'");
	assert.equal(escapeCell(''), '');
	assert.equal(escapeCell('no pipes here'), 'no pipes here');
});

test('integration: parses a real component file end to end', () => {
	// Exercises the full extract → parse pipeline against actual source, so a
	// break surfaces locally with `npm run test:scripts`, not only in CI.
	const file = join(componentsDir, 'actions', 'button', 'button.ts');
	const source = readFileSync(file, 'utf-8');
	const block = extractLeadingBlock(source);
	const ce = source.match(/@customElement\(['"]([^'"]+)['"]\)/);
	const [c] = parseComponent(block, file, ce ? ce[1] : null);
	assert.equal(c.tag, 'nldd-button');
	assert.equal(c.category, 'actions');
	// These two intentionally pin button's stable public API (appearance + click):
	// if a refactor accidentally stops parsing attrs/events, this fails loudly.
	// If button's JSDoc legitimately drops them, update this test alongside it.
	assert.ok(c.attrs.some((a) => a.name === 'appearance'), 'button should document an appearance attr');
	assert.ok(c.events.some((e) => e.name === 'click'), 'button should document a click event');
	// Every attribute must have a non-empty name (no parse drift to empty rows).
	assert.ok(c.attrs.every((a) => a.name.length > 0));
});

test('leest een attribuutnaam met [brackets] direct gevolgd door het streepje', () => {
	// "[name]- beschrijving" without a space used to yield the literal name
	// "name]-", which then ended up in the published reference.
	const block = '@element nldd-thing\n@attr {string} [sticky-bottom]- Sticky bottom inset.';
	const [c] = parseComponent(block, '/x/src/components/a/b/b.ts', null);
	assert.equal(c.attrs[0].name, 'sticky-bottom');
	assert.equal(c.attrs[0].description, 'Sticky bottom inset.');
});

test('behoudt tags in een blok zonder @element', () => {
	// Without @element every tag was thrown away, because they hang off `current`
	// and the fallback was only created after the loop. nldd-top-title-bar lost
	// six attributes, a slot and two events from the published reference that way.
	const block = 'Een titelbalk.\n@attr {string} text - De titel.\n@slot - Inhoud.\n@fires dismiss - Sluiten.';
	const [c] = parseComponent(block, '/x/src/components/a/b/b.ts', 'nldd-fallback');
	assert.equal(c.tag, 'nldd-fallback');
	assert.equal(c.attrs.length, 1);
	assert.equal(c.attrs[0].name, 'text');
	assert.equal(c.slots.length, 1);
	assert.equal(c.events.length, 1);
});
