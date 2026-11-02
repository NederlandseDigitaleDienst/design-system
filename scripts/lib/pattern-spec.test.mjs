import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import { parseHtml } from '../../lint/frontends.js';
import { checkComposition, renderComposition } from './pattern-spec.js';

const schema = JSON.parse(readFileSync(new URL('../../src/patterns/pattern.schema.json', import.meta.url), 'utf8'));
const validate = new Ajv({ allErrors: true }).compile(schema);

const tags = {
	'nldd-form': { attrs: { name: {} }, childAttrs: {} },
	'nldd-form-field': { attrs: { label: {} }, childAttrs: {} },
	'nldd-text-field': { attrs: {}, childAttrs: {} },
	'nldd-form-field-help-text': { attrs: {}, childAttrs: {} },
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

test('renderComposition draws the tree with the details in one column', () => {
	assert.deepEqual(renderComposition(composition).split('\n'), [
		`${'nldd-form'.padEnd(37)}name`,
		`${'  └─ nldd-form-field'.padEnd(37)}label`,
		`${'       ├─ het invoerveld'.padEnd(37)}nldd-text-field, …`,
		`${'       └─ nldd-form-field-help-text'.padEnd(37)}uitleg`,
	]);
});

test('renderComposition keeps a long line without details out of the column', () => {
	const tree = renderComposition([{ tag: 'a', note: 'x', children: [{ label: 'a very long label without details' }] }]);
	assert.equal(tree, 'a  x\n  └─ a very long label without details');
});

test('renderComposition draws the children of a flat node without tree lines', () => {
	const tree = renderComposition([{ tag: 'a', children: [{ label: 'cellen', flat: true, children: [{ tag: 'b' }, { tag: 'c' }] }] }]);
	assert.equal(tree, 'a\n  └─ cellen\n       b\n       c');
});

test('checkComposition accepts a composition its example follows', () => {
	assert.deepEqual(checkComposition(composition, { tags, examples: parseHtml(good) }), []);
});

test('checkComposition reports a tag or an attribute that does not exist', () => {
	const wrong = [{ tag: 'nldd-form', attrs: ['nope'], children: [{ tag: 'nldd-gone' }] }];
	const problems = checkComposition(wrong, { tags, examples: parseHtml('<nldd-form></nldd-form>') });
	assert.ok(problems.includes('nldd-form has no attribute nope.'));
	assert.ok(problems.includes('Names nldd-gone, which does not exist.'));
});

test('checkComposition reports a part no example shows', () => {
	const problems = checkComposition(composition, { tags, examples: parseHtml('<nldd-form></nldd-form>') });
	assert.ok(problems.includes('An example has nldd-form without nldd-form-field.'));
	assert.ok(problems.includes('No example shows nldd-form-field.'));
});

test('checkComposition leaves an optional child alone', () => {
	const examples = parseHtml('<nldd-form><nldd-form-field><nldd-text-field></nldd-text-field></nldd-form-field></nldd-form>');
	const problems = checkComposition(composition, { tags, examples });
	assert.deepEqual(problems, ['No example shows nldd-form-field-help-text.']);
});

test('checkComposition reports a required part an example leaves out', () => {
	const examples = parseHtml(`${good}<nldd-form></nldd-form>`);
	const problems = checkComposition(composition, { tags, examples });
	assert.deepEqual(problems, ['An example has nldd-form without nldd-form-field.']);
});

test('checkComposition reports a part that sits somewhere else than the tree says', () => {
	const reversed = [{ tag: 'nldd-form-field', children: [{ tag: 'nldd-form' }] }];
	const examples = parseHtml('<nldd-form><nldd-form-field></nldd-form-field></nldd-form>');
	const problems = checkComposition(reversed, { tags, examples });
	assert.ok(problems.includes('No example shows nldd-form inside nldd-form-field.'));
});

test('checkComposition reports an any-of no example fills', () => {
	const examples = parseHtml('<nldd-form><nldd-form-field></nldd-form-field></nldd-form>');
	const problems = checkComposition(composition.map((node) => ({ ...node, attrs: [] })), { tags, examples });
	assert.ok(problems.includes('No example shows any of nldd-text-field inside nldd-form-field.'));
});

test('checkComposition only looks inside the parent an element was matched in', () => {
	const sheet = [{ tag: 'nldd-form', children: [{ tag: 'nldd-form-field', children: [{ tag: 'nldd-text-field' }] }] }];
	const examples = parseHtml('<nldd-form-field></nldd-form-field><nldd-form><nldd-form-field><nldd-text-field></nldd-text-field></nldd-form-field></nldd-form>');
	assert.deepEqual(checkComposition(sheet, { tags, examples }), []);
});

test('checkComposition reads a fixed value as part of the node', () => {
	const fixed = [{ tag: 'nldd-form', attrs: ['name="zoek"'], children: [{ tag: 'nldd-form-field' }] }];
	const without = parseHtml('<nldd-form name="zoek"><nldd-form-field></nldd-form-field></nldd-form><nldd-form name="ander"></nldd-form>');
	assert.deepEqual(checkComposition(fixed, { tags, examples: without }), []);
	const other = parseHtml('<nldd-form name="ander"></nldd-form>');
	assert.ok(checkComposition(fixed, { tags, examples: other }).includes('No example shows nldd-form.'));
});

test('renderComposition puts a blank line between roots', () => {
	assert.equal(renderComposition([{ tag: 'nldd-form' }, { tag: 'nldd-sheet' }]), 'nldd-form\n\nnldd-sheet');
});

test('the schema refuses a field it does not know', () => {
	assert.equal(validate({ composition: [{ tag: 'nldd-form', optionl: true }] }), false);
});

test('the schema wants a tag or a label, not both', () => {
	assert.equal(validate({ composition: [{ note: 'iets' }] }), false);
	assert.equal(validate({ composition: [{ tag: 'nldd-form', label: 'iets' }] }), false);
	assert.equal(validate({ composition: [{ tag: 'nldd-form', children: [{ label: 'iets' }] }] }), true);
});
