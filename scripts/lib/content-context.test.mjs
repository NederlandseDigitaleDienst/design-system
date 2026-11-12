import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findContentColorWithoutContext } from './content-context.js';

test('a content color with its context passes', () => {
	const css = '.button {\n\t--context-content-color: var(--_button-content-color);\n\tcolor: var(--_button-content-color);\n}';
	assert.deepEqual(findContentColorWithoutContext(css), []);
});

test('a content color without its context fails, with its line', () => {
	const css = '.tag {\n\tdisplay: flex;\n\tcolor: var(--_tag-content-color);\n}';
	assert.deepEqual(findContentColorWithoutContext(css), [{ line: 3, text: 'color: var(--_tag-content-color);' }]);
});

test('the context of another rule does not count', () => {
	const css = '.a {\n\t--context-content-color: red;\n}\n.b {\n\tcolor: var(--_b-content-color);\n}';
	assert.equal(findContentColorWithoutContext(css).length, 1);
});

test('a color that is not a content color passes', () => {
	assert.deepEqual(findContentColorWithoutContext('.a {\n\tcolor: var(--_a-icon-color);\n\tcolor: inherit;\n}'), []);
});
