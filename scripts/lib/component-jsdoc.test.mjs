import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseComponent } from './component-jsdoc.js';

const parse = (block) => parseComponent(block, 'src/components/forms/thing/thing.ts', 'nldd-thing');

test('takes the prose before the first element as its description', () => {
	const [component] = parse(['A thing that does something.', '', '@element nldd-thing', '', '@attr {string} text - Its text.'].join('\n'));
	assert.equal(component.summary, 'A thing that does something.');
});

test('adds the prose under an element to that element, not to the first one', () => {
	const [list, item] = parse([
		'A list of requirements.',
		'',
		'@element nldd-list',
		'',
		'@attr {boolean} judging - Whether it has a verdict.',
		'',
		'────────────────',
		'',
		'@element nldd-item',
		'',
		'One requirement, with the rule that checks it.',
		'',
		'@attr {string} match - The rule.',
	].join('\n'));
	assert.equal(list.summary, 'A list of requirements.');
	assert.equal(item.summary, 'One requirement, with the rule that checks it.');
});

test('joins the shared prose with the prose under the first element', () => {
	const [component] = parse(['A thing.', '', '@element nldd-thing', '', 'Put an nldd-cell in it.', '', '@attr {string} text - Its text.'].join('\n'));
	assert.equal(component.summary, 'A thing. Put an nldd-cell in it.');
});

test('leaves the lines of a later tag out of the description', () => {
	const [component] = parse(['A thing.', '', '@element nldd-thing', '', '@attr {string} text - Its text.', '', '@example', '<nldd-thing text="Hello"></nldd-thing>'].join('\n'));
	assert.equal(component.summary, 'A thing.');
});
