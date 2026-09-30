import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hiddenAttributeViolations, selectorTarget } from './hidden-attribute.js';

const messages = (css) => hiddenAttributeViolations(css).map((v) => v.message);

test('passes a host display followed by a hidden rule', () => {
	assert.deepEqual(messages(':host { display: block; } :host([hidden]) { display: none; }'), []);
});

test('flags a host display without a hidden rule', () => {
	assert.deepEqual(messages(':host { display: block; }'), [
		'`:host` sets display, but there is no `:host([hidden]) { display: none; }`',
	]);
});

test('flags an equally specific rule after the hidden rule', () => {
	const css = ':host { display: block; } :host([hidden]) { display: none; } :host([centered]) { display: flex; }';
	assert.deepEqual(messages(css), ['`:host([centered])` overrides `:host([hidden])` (line 1)']);
});

test('passes an equally specific rule before the hidden rule', () => {
	const css = ':host([centered]) { display: flex; } :host([hidden]) { display: none; }';
	assert.deepEqual(messages(css), []);
});

test('flags a more specific rule before the hidden rule', () => {
	const css = ':host([a][b]) { display: flex; } :host([hidden]) { display: none; }';
	assert.deepEqual(messages(css), ['`:host([a][b])` overrides `:host([hidden])` (line 1)']);
});

test('an important hidden rule wins from any later rule', () => {
	const css = ':host([hidden]) { display: none !important; } :host([a][b]) { display: flex; }';
	assert.deepEqual(messages(css), []);
});

test('ignores a component that never sets a display, or only hides itself', () => {
	assert.deepEqual(messages(':host { color: red; }'), []);
	assert.deepEqual(messages(':host(.is-blank) { display: none; }'), []);
});

test('ignores rules that reach into the component', () => {
	assert.deepEqual(messages(':host .inner { display: flex; } :host([open]) .inner { display: grid; }'), []);
});

test('reads a display inside a nested at-rule as belonging to the rule around it', () => {
	const css = ':host([hidden]) { display: none; } :host([wide]) { @media (min-width: 1px) { display: flex; } }';
	assert.deepEqual(messages(css), ['`:host([wide])` overrides `:host([hidden])` (line 1)']);
});

test('checks light-DOM components per element', () => {
	assert.deepEqual(messages('nldd-form { display: block; }'), [
		'`nldd-form` sets display, but there is no `nldd-form[hidden] { display: none; }`',
	]);
	assert.deepEqual(messages('nldd-form { display: block; } nldd-form[hidden] { display: none; }'), []);
	assert.deepEqual(messages('nldd-form > form { display: block; }'), []);
});

test('reports the line of the offending rule', () => {
	const css = ':host([hidden]) {\n\tdisplay: none;\n}\n\n:host([centered]) {\n\tdisplay: flex;\n}';
	assert.deepEqual(hiddenAttributeViolations(css).map((v) => v.line), [6]);
});

test('counts :not() by its argument', () => {
	assert.equal(selectorTarget(':host(:not(.has-items))').specificity, selectorTarget(':host([hidden])').specificity);
});
