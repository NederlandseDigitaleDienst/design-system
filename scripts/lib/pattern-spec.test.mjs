import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import { parseHtml } from '../../lint/frontends.js';
import { checkComposition, renderComposition } from './pattern-spec.js';

const schema = JSON.parse(readFileSync(new URL('../../src/patterns/pattern.schema.json', import.meta.url), 'utf8'));
const validate = new Ajv({ allErrors: true }).compile(schema);

const component = (attrs = [], slots = ['']) => ({ attrs: Object.fromEntries(attrs.map((name) => [name, {}])), childAttrs: {}, slots });
const tags = {
	'nldd-form': component(['name', 'method'], ['', 'actions']),
	'nldd-form-field': component(['label']),
	'nldd-text-field': component(['href', 'button']),
	'nldd-form-field-help-text': component(),
	'nldd-dropdown': component(),
};
const composition = [{
	tag: 'nldd-form',
	attrs: ['name'],
	children: [{
		tag: 'nldd-form-field',
		attrs: ['label'],
		children: [
			{ label: 'het invoerveld', 'any-of': ['nldd-text-field'] },
			{ tag: 'nldd-form-field-help-text', optional: true, note: 'uitleg' },
		],
	}],
}];
const good = '<nldd-form><nldd-form-field><nldd-text-field></nldd-text-field><nldd-form-field-help-text></nldd-form-field-help-text></nldd-form-field></nldd-form>';
const example = (markup, file = 'a.html') => ({ file, roots: parseHtml(markup) });
const check = (nodes, ...markup) => checkComposition(nodes, { tags, examples: markup.map((source) => example(source)) });

test('renderComposition draws the tree with the details in one column', () => {
	assert.equal(renderComposition(composition), [
		'nldd-form                            name',
		'  └─ nldd-form-field                 label',
		'       ├─ het invoerveld             nldd-text-field, …',
		'       └─ nldd-form-field-help-text  uitleg; optioneel',
	].join('\n'));
});

test('renderComposition keeps a long line without details out of the column', () => {
	const drawn = renderComposition([{ tag: 'a', note: 'x', children: [{ label: 'een heel lange regel zonder iets erachter' }] }]);
	assert.equal(drawn.split('\n')[0], 'a  x');
});

test('renderComposition draws the children of a flat node without tree lines', () => {
	const drawn = renderComposition([{ tag: 'a', flat: true, children: [{ tag: 'b' }, { tag: 'c' }] }]);
	assert.equal(drawn, 'a\n  b\n  c');
});

test('renderComposition puts a blank line between roots', () => {
	assert.equal(renderComposition([{ tag: 'nldd-form' }, { tag: 'nldd-sheet' }]), 'nldd-form\n\nnldd-sheet');
});

test('renderComposition shows what is optional, a slot and another tag', () => {
	assert.equal(renderComposition([{ tag: 'a', optional: true }]).trim(), 'a  optioneel');
	assert.equal(renderComposition([{ slot: 'header', note: 'x' }]), 'slot="header"  x');
	assert.equal(renderComposition([{ tag: 'a', or: ['b'], slot: ['c', 'd'] }]), 'a (of b)  slot="c" | "d"');
});

test('checkComposition accepts a composition its example follows', () => {
	assert.deepEqual(check(composition, good), []);
});

test('checkComposition reports a tag or an attribute that does not exist', () => {
	const wrong = [{ tag: 'nldd-form', attrs: ['nope'], children: [{ tag: 'nldd-gone' }] }];
	const problems = check(wrong, '<nldd-form></nldd-form>');
	assert.ok(problems.includes('nldd-form has no attribute nope.'));
	assert.ok(problems.includes('Names nldd-gone, which does not exist.'));
});

test('checkComposition knows no attribute every component has', () => {
	assert.deepEqual(check([{ tag: 'nldd-form-field', attrs: ['name', 'type'] }], '<nldd-form-field></nldd-form-field>'), [
		'nldd-form-field has no attribute name.',
		'nldd-form-field has no attribute type.',
	]);
});

test('checkComposition reports a part no example shows', () => {
	const problems = check(composition, '<nldd-form></nldd-form>');
	assert.ok(problems.includes('No example shows nldd-form-field inside nldd-form.'));
	assert.ok(check([{ tag: 'nldd-dropdown' }], '<nldd-form></nldd-form>').includes('No example shows nldd-dropdown.'));
});

test('checkComposition leaves an optional child out of what an example needs', () => {
	const problems = check(composition, '<nldd-form><nldd-form-field><nldd-text-field></nldd-text-field></nldd-form-field></nldd-form>');
	assert.deepEqual(problems, ['No example shows nldd-form-field-help-text inside nldd-form-field.']);
});

test('checkComposition names the file of an example that leaves out a required part', () => {
	const examples = [example(good), example('<nldd-form></nldd-form>', 'b.html')];
	assert.deepEqual(checkComposition(composition, { tags, examples }), ['b.html: nldd-form without nldd-form-field.']);
});

test('checkComposition lets a partial example leave out a required part', () => {
	const examples = [example(good), example('<nldd-form></nldd-form>', 'b.html')];
	assert.deepEqual(checkComposition(composition, { tags, examples, partial: { 'b.html': ['nldd-form-field'] } }), []);
	assert.deepEqual(checkComposition(composition, { tags, examples: [example(good)], partial: { 'b.html': ['nldd-form-field'] } }), ['partial names b.html, which is no example.']);
});

test('checkComposition keeps the rest of a partial example required', () => {
	const nodes = [{ tag: 'nldd-form', children: [{ tag: 'nldd-form-field' }, { tag: 'nldd-dropdown' }] }];
	const examples = [
		example('<nldd-form><nldd-form-field></nldd-form-field><nldd-dropdown></nldd-dropdown></nldd-form>'),
		example('<nldd-form></nldd-form>', 'b.html'),
	];
	assert.deepEqual(checkComposition(nodes, { tags, examples, partial: { 'b.html': ['nldd-form-field'] } }), ['b.html: nldd-form without nldd-dropdown.']);
});

test('checkComposition wants a child directly under its parent', () => {
	const wrong = [{ tag: 'nldd-form', children: [{ tag: 'nldd-text-field' }] }];
	const problems = check(wrong, '<nldd-form><nldd-form-field><nldd-text-field></nldd-text-field></nldd-form-field></nldd-form>');
	assert.ok(problems.includes('No example shows nldd-text-field inside nldd-form.'));
});

test('checkComposition looks through a plain element', () => {
	const nodes = [{ tag: 'nldd-form', children: [{ tag: 'nldd-form-field' }] }];
	assert.deepEqual(check(nodes, '<nldd-form><form><nldd-form-field></nldd-form-field></form></nldd-form>'), []);
});

test('checkComposition reports a part that sits somewhere else than the tree says', () => {
	const reversed = [{ tag: 'nldd-form-field', children: [{ tag: 'nldd-form' }] }];
	const problems = check(reversed, '<nldd-form><nldd-form-field></nldd-form-field></nldd-form>');
	assert.ok(problems.includes('No example shows nldd-form inside nldd-form-field.'));
});

test('checkComposition looks through a plain element in a slot', () => {
	const nodes = [{ tag: 'nldd-form', children: [{ slot: 'actions', children: [{ tag: 'nldd-form-field' }] }] }];
	assert.deepEqual(check(nodes, '<nldd-form><div slot="actions"><nldd-form-field></nldd-form-field></div></nldd-form>'), []);
});

test('checkComposition wants every required root in every example', () => {
	const roots = [{ tag: 'nldd-form' }, { tag: 'nldd-dropdown' }];
	const examples = [example('<nldd-form></nldd-form><nldd-dropdown></nldd-dropdown>'), example('<nldd-form></nldd-form>', 'b.html')];
	assert.deepEqual(checkComposition(roots, { tags, examples }), ['b.html: misses nldd-dropdown.']);
	assert.deepEqual(checkComposition(roots, { tags, examples, partial: { 'b.html': ['nldd-dropdown'] } }), []);
});

test('checkComposition gives every element to one sibling', () => {
	const nodes = [{ tag: 'nldd-form', children: [
		{ tag: 'nldd-form-field' },
		{ tag: 'nldd-form-field', attrs: ['label="a"'] },
	] }];
	const problems = check(nodes, '<nldd-form><nldd-form-field label="a"></nldd-form-field></nldd-form>');
	assert.deepEqual(problems, ['No example shows nldd-form-field inside nldd-form.']);
});

test('checkComposition matches identical siblings to the one that fits', () => {
	const nodes = [{ tag: 'nldd-form', children: [
		{ tag: 'nldd-form-field', children: [{ tag: 'nldd-text-field' }] },
		{ tag: 'nldd-form-field', children: [{ tag: 'nldd-dropdown' }] },
	] }];
	const fields = '<nldd-form-field><nldd-dropdown></nldd-dropdown></nldd-form-field><nldd-form-field><nldd-text-field></nldd-text-field></nldd-form-field>';
	assert.deepEqual(check(nodes, `<nldd-form>${fields}</nldd-form>`), []);
});

test('checkComposition treats a tag without slot as the default slot', () => {
	const nodes = [{ tag: 'nldd-form', children: [{ tag: 'nldd-form-field', optional: true }] }];
	const problems = check(nodes, '<nldd-form><nldd-form-field slot="actions"></nldd-form-field></nldd-form>');
	assert.deepEqual(problems, ['No example shows nldd-form-field inside nldd-form.']);
});

test('checkComposition checks a slot under a slot against what fills the outer one', () => {
	const local = { ...tags, 'nldd-form-field': component(['label'], ['', 'inner']) };
	const nodes = [{ tag: 'nldd-form', children: [{ slot: 'actions', children: [{ slot: 'inner' }] }] }];
	const markup = '<nldd-form><nldd-form-field slot="actions"><nldd-text-field slot="inner"></nldd-text-field></nldd-form-field></nldd-form>';
	assert.deepEqual(checkComposition(nodes, { tags: local, examples: [example(markup)] }), []);
});

test('checkComposition checks the children of `or` against every tag', () => {
	const nodes = [{ tag: 'nldd-form', or: ['nldd-dropdown'], children: [{ slot: 'actions' }] }];
	const problems = check(nodes, '<nldd-form><nldd-text-field slot="actions"></nldd-text-field></nldd-form>');
	assert.ok(problems.includes('nldd-form, nldd-dropdown has no slot actions.'));
});

test('checkComposition wants a required any-of in every element', () => {
	const nodes = [{ tag: 'nldd-form-field', children: [
		{ label: 'x', 'any-of': ['nldd-text-field'] },
		{ tag: 'nldd-form-field-help-text', optional: true },
	] }];
	const filled = '<nldd-form-field><nldd-dropdown></nldd-dropdown><nldd-form-field-help-text></nldd-form-field-help-text></nldd-form-field><nldd-form-field><nldd-text-field></nldd-text-field></nldd-form-field>';
	assert.deepEqual(check(nodes, filled), []);
	assert.deepEqual(check(nodes, `${filled}<nldd-form-field><nldd-form-field-help-text></nldd-form-field-help-text></nldd-form-field>`), ['a.html: nldd-form-field without x.']);
});

test('checkComposition reports an any-of no example fills', () => {
	const nodes = [{ tag: 'nldd-form-field', children: [{ label: 'x', 'any-of': ['nldd-text-field'] }] }];
	assert.ok(check(nodes, '<nldd-form-field></nldd-form-field>').includes('No example shows any of nldd-text-field inside nldd-form-field.'));
	assert.deepEqual(check([{ label: 'x', 'any-of': ['nldd-text-field'] }], '<nldd-form></nldd-form>'), ['No example shows any of nldd-text-field.']);
});

test('checkComposition only looks inside the parent an element was matched in', () => {
	const nodes = [{ tag: 'nldd-form', children: [{ tag: 'nldd-form-field', children: [{ tag: 'nldd-text-field' }] }] }];
	const markup = '<nldd-form-field></nldd-form-field><nldd-form><nldd-form-field><nldd-text-field></nldd-text-field></nldd-form-field></nldd-form>';
	assert.deepEqual(check(nodes, markup), []);
});

test('checkComposition reads a fixed value as part of the node', () => {
	const nodes = [{ tag: 'nldd-form', attrs: ['name="zoek"'], children: [{ tag: 'nldd-form-field' }] }];
	assert.deepEqual(check(nodes, '<nldd-form name="zoek"><nldd-form-field></nldd-form-field></nldd-form><nldd-form name="ander"></nldd-form>'), []);
	assert.ok(check(nodes, '<nldd-form name="ander"></nldd-form>').includes('No example shows nldd-form.'));
});

test('checkComposition wants a required child with its fixed value', () => {
	const nodes = [{ tag: 'nldd-form', children: [
		{ tag: 'nldd-form-field', attrs: ['label="a"'] },
		{ tag: 'nldd-form-field', attrs: ['label="b"'] },
	] }];
	const both = '<nldd-form><nldd-form-field label="a"></nldd-form-field><nldd-form-field label="b"></nldd-form-field></nldd-form>';
	assert.deepEqual(check(nodes, both), []);
	assert.deepEqual(check(nodes, `${both}<nldd-form><nldd-form-field label="a"></nldd-form-field></nldd-form>`), ['a.html: nldd-form without nldd-form-field.']);
});

test('checkComposition checks a slot against its parent and an example', () => {
	const nodes = [{ tag: 'nldd-form', children: [{ slot: 'actions', children: [{ tag: 'nldd-form-field' }] }] }];
	assert.deepEqual(check(nodes, '<nldd-form><nldd-form-field slot="actions"></nldd-form-field></nldd-form>'), []);
	const typo = [{ tag: 'nldd-form', children: [{ slot: 'actoins' }] }];
	const problems = check(typo, '<nldd-form></nldd-form>');
	assert.ok(problems.includes('nldd-form has no slot actoins.'));
	assert.ok(problems.includes('No example shows slot="actoins" inside nldd-form.'));
});

test('checkComposition accepts any tag in `or`, and checks them all', () => {
	const nodes = [{ tag: 'nldd-text-field', or: ['nldd-dropdown'], attrs: ['href'] }];
	assert.deepEqual(check(nodes, '<nldd-dropdown></nldd-dropdown>'), ['nldd-dropdown has no attribute href.']);
});

test('checkComposition reports an element with more than one of `one-of`', () => {
	const nodes = [{ tag: 'nldd-text-field', 'one-of': ['href', 'button'] }];
	assert.deepEqual(check(nodes, '<nldd-text-field href="/x"></nldd-text-field>'), []);
	assert.deepEqual(check(nodes, '<nldd-text-field href="/x" button></nldd-text-field>'), ['a.html: nldd-text-field has more than one of href, button.']);
});

test('the schema refuses a field it does not know', () => {
	assert.equal(validate({ composition: [{ tag: 'nldd-form', optionl: true }] }), false);
});

test('the schema wants one kind of node', () => {
	assert.equal(validate({ composition: [{ note: 'iets' }] }), false);
	assert.equal(validate({ composition: [{ tag: 'nldd-form', label: 'iets' }] }), false);
	assert.equal(validate({ composition: [{ tag: 'nldd-form', slot: 'a', children: [{ label: 'iets' }, { slot: ['b', 'c'] }] }] }), true);
});

test('the schema refuses a field that would go unchecked on this kind of node', () => {
	assert.equal(validate({ composition: [{ label: 'x', attrs: ['a'] }] }), false);
	assert.equal(validate({ composition: [{ label: 'x', 'one-of': ['a'] }] }), false);
	assert.equal(validate({ composition: [{ tag: 'nldd-form', 'any-of': ['nldd-form'] }] }), false);
	assert.equal(validate({ composition: [{ tag: 'nldd-form', attrs: ['slot="a"'] }] }), true);
	assert.equal(validate({ composition: [{ tag: 'nldd-form', attrs: [] }] }), false);
	assert.equal(validate({ composition: [{ tag: 'nldd-form', 'one-of': [] }] }), false);
	assert.equal(validate({ composition: [{ tag: 'nldd-form', 'one-of': ['href="x"', 'button'] }] }), false);
});
