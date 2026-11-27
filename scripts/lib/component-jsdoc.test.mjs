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

test('reads the plain HTML an element styles itself from @accepts', () => {
	const [component] = parse(['@element nldd-thing', '', '@slot - A native select.', '@accepts select, option optgroup'].join('\n'));
	assert.deepEqual(component.accepts, ['select', 'option', 'optgroup']);
});

test('refuses a description after @accepts, which would read as element names', () => {
	assert.throws(() => parse(['@element nldd-thing', '@accepts select - the native one'].join('\n')), /takes element names only/);
});

test('reads a custom property an app may use from @cssprop, with a description over more lines', () => {
	const [component] = parse(['@element nldd-thing', '@cssprop --context-inset-top - Height of the bars', 'above the content'].join('\n'));
	assert.deepEqual(component.cssProperties, [{ name: '--context-inset-top', description: 'Height of the bars above the content' }]);
	assert.throws(() => parse(['@element nldd-thing', '@cssprop inset-top - no dashes'].join('\n')), /takes a custom property name/);
});

test('reads a JavaScript-only property from @prop, with its type', () => {
	const [component] = parse(['@element nldd-thing', '@prop {(iso: string) => boolean} isDateUnavailable - Marks dates', 'as unselectable'].join('\n'));
	assert.deepEqual(component.properties, [{ name: 'isDateUnavailable', type: '(iso: string) => boolean', description: 'Marks dates as unselectable' }]);
});

test('reads search words from @keywords, lower case, and other components from @related', () => {
	const [component] = parse(['@element nldd-thing', '@keywords Toast, snackbar', '@related nldd-banner, nldd-status-bar'].join('\n'));
	assert.deepEqual(component.keywords, ['toast', 'snackbar']);
	assert.deepEqual(component.related, ['nldd-banner', 'nldd-status-bar']);
});

test('refuses a @related that is not a tag', () => {
	assert.throws(() => parse(['@element nldd-thing', '@related banner'].join('\n')), /takes element tags only/);
});

test('keeps a code fence in the description as a block of its own', () => {
	const block = ['A thing. Put a cell in it:', '```html', '<nldd-thing>', '\t<nldd-cell></nldd-cell>', '</nldd-thing>', '```', 'Any cell will do.', '', '@element nldd-thing'].join('\n');
	const [component] = parse(block);
	assert.equal(component.summary, 'A thing. Put a cell in it:\n\n```html\n<nldd-thing>\n\t<nldd-cell></nldd-cell>\n</nldd-thing>\n```\n\nAny cell will do.');
});

test('keeps a code fence in the prose under an element, with an @ in the code', () => {
	const block = ['@element nldd-thing', '', 'Listen for it:', '```js', 'thing.addEventListener("change", () => {});', '@attr not-a-tag', '```', '', '@attr {string} text - Its text.'].join('\n');
	const [component] = parse(block);
	assert.equal(component.summary, 'Listen for it:\n\n```js\nthing.addEventListener("change", () => {});\n@attr not-a-tag\n```');
	assert.deepEqual(component.attrs.map((a) => a.name), ['text']);
});

test('keeps the indentation of the code, from the JSDoc source', async () => {
	const { extractComponentBlocks } = await import('./component-jsdoc.js');
	const source = ['/**', ' * A thing:', ' * ```html', ' * <nldd-thing>', ' *   <nldd-cell></nldd-cell>', ' * </nldd-thing>', ' * ```', ' *', ' * @element nldd-thing', ' */'].join('\n');
	const [component] = parse(extractComponentBlocks(source)[0]);
	assert.match(component.summary, /\n {2}<nldd-cell><\/nldd-cell>\n/);
});

test('keeps a code fence in the description of a tag on one line, for its table cell', () => {
	const block = ['@element nldd-thing', '', '@attr {string} text - Its text, such as:', '```html', '<nldd-thing', '\ttext="Hallo"', '></nldd-thing>', '```', '', 'A thing.'].join('\n');
	const [component] = parse(block);
	assert.equal(component.attrs[0].description, 'Its text, such as: ```html <nldd-thing text="Hallo" ></nldd-thing> ```');
	assert.equal(component.summary, '');
});
