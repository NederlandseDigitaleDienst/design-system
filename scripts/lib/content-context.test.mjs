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

test('a rule on one line counts', () => {
	assert.equal(findContentColorWithoutContext('a { color: var(--_a-content-color); }').length, 1);
	assert.deepEqual(findContentColorWithoutContext('a { --context-content-color: var(--_a-content-color); color: var(--_a-content-color); }'), []);
});

test('a rule nested in @media is a rule of its own', () => {
	const css = '.a {\n\t--context-content-color: red;\n\t@media (hover: hover) {\n\t\t&:hover {\n\t\t\tcolor: var(--_a-is-hovered-content-color);\n\t\t}\n\t}\n}';
	assert.deepEqual(findContentColorWithoutContext(css), [{ line: 5, text: 'color: var(--_a-is-hovered-content-color);' }]);
	const fixed = css.replace('\t\t\tcolor:', '\t\t\t--context-content-color: var(--_a-is-hovered-content-color);\n\t\t\tcolor:');
	assert.deepEqual(findContentColorWithoutContext(fixed), []);
});

test('a brace in a comment or an interpolation does not move the rule', () => {
	const css = '.a {\n\t/* { not a rule } */\n\t${reset}\n\t--context-content-color: var(--_a-content-color);\n\tcolor: var(--_a-content-color);\n}';
	assert.deepEqual(findContentColorWithoutContext(css), []);
});

test('background-color is not a text color', () => {
	assert.deepEqual(findContentColorWithoutContext('a { background-color: var(--_a-content-color); }'), []);
});
