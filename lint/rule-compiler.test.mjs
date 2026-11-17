import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertProperties, compileForBrowser, favorableName, forBrowser, ruleProblems, runsInBrowser, sourcePseudos } from './rule-compiler.js';

const classes = { 'form-input': ['input', 'nldd-text-field'], cell: ['nldd-text-cell'] };

describe('forBrowser', () => {
	it('turns a class of tags into :is() of its tags', () => {
		assert.equal(forBrowser('nldd-row > :cell', classes), 'nldd-row > :is(nldd-text-cell)');
	});

	it('leaves a hidden input out of the form inputs', () => {
		assert.equal(forBrowser('nldd-form-field > :form-input', classes), 'nldd-form-field > :is(input:not([type="hidden"]), nldd-text-field)');
	});

	it('expands a class inside :not() and :has()', () => {
		assert.equal(forBrowser('nldd-row:not(:has(:cell))', classes), 'nldd-row:not(:has(:is(nldd-text-cell)))');
	});

	it('leaves CSS and :state() as they are', () => {
		assert.equal(forBrowser('nldd-sheet:state(no-width):not([hidden])', classes), 'nldd-sheet:state(no-width):not([hidden])');
	});

	it('drops :named-by-field from its list: on a page the field set the attribute', () => {
		assert.equal(forBrowser('[accessible-label], :named-by-field', classes), '[accessible-label]');
		assert.equal(forBrowser(':is([text], :named-by-field)', classes), ':is([text])');
	});

	it('refuses :named-by-field that cannot be left out', () => {
		assert.throws(() => forBrowser(':named-by-field', classes), /nothing is left/);
		assert.throws(() => forBrowser('nldd-switch:named-by-field', classes), /on its own/);
	});

	it('refuses what only source can judge', () => {
		assert.throws(() => forBrowser('p:not(:accepted)', classes), /no :accepted/);
	});
});

describe('assertProperties', () => {
	it('names the property of each attribute that must be there', () => {
		assert.deepEqual(assertProperties('[accessible-label], [text]'), ['accessibleLabel', 'text']);
	});

	it('leaves out what may not be there, and counts a double negation', () => {
		assert.deepEqual(assertProperties('[text]:not([icon-start])'), ['text']);
		assert.deepEqual(assertProperties(':not(:not([accessible-label]))'), ['accessibleLabel']);
	});

	it('leaves out an attribute compared to a value', () => {
		assert.deepEqual(assertProperties('[href]:not([href=""])'), ['href']);
	});
});

describe('runsInBrowser', () => {
	it('runs the rules a page can judge', () => {
		assert.equal(runsInBrowser({ group: 'a11y', severity: 'warn' }), true);
	});

	it('leaves out hints, opt-in groups and refs', () => {
		assert.equal(runsInBrowser({ group: 'a11y', severity: 'hint' }), false);
		assert.equal(runsInBrowser({ group: 'pure', severity: 'error' }), false);
		assert.equal(runsInBrowser({ group: 'a11y', severity: 'warn', ref: { attr: 'for', target: '*' } }), false);
	});
});

describe('compileForBrowser', () => {
	it('compiles every selector of a rule', () => {
		const rule = { id: 'x', message: 'm', group: 'a11y', severity: 'warn', context: ':form-input', assert: '[accessible-label], :named-by-field' };
		assert.deepEqual(compileForBrowser(rule, classes), {
			id: 'x', message: 'm', context: ':is(input:not([type="hidden"]), nldd-text-field)', assert: '[accessible-label]', properties: ['accessibleLabel'],
		});
	});

	it('gives nothing for a rule that only runs on source', () => {
		assert.equal(compileForBrowser({ id: 'x', group: 'pure', severity: 'error', context: 'p:not(:accepted)' }, classes), null);
	});
});

describe('ruleProblems', () => {
	it('knows CSS, the classes and the vocabulary', () => {
		assert.deepEqual(ruleProblems({ group: 'a11y', severity: 'warn', context: ':cell:state(x)', assert: '[text], :named-by-field' }, classes), []);
	});

	it('reports a pseudo-class that does not exist', () => {
		assert.deepEqual(ruleProblems({ group: 'a11y', severity: 'warn', context: ':form-inptu' }, classes), [':form-inptu does not exist.']);
	});

	it('keeps the source-only pseudo-classes to opt-in groups', () => {
		assert.match(ruleProblems({ group: 'structure', severity: 'warn', context: 'p:not(:accepted)' }, classes)[0], /opt-in/);
		assert.deepEqual(ruleProblems({ group: 'pure', severity: 'error', context: 'p:not(:accepted)' }, classes), []);
	});

	it('reports a selector the browser cannot run', () => {
		assert.match(ruleProblems({ group: 'a11y', severity: 'warn', context: 'nldd-switch:named-by-field' }, classes)[0], /on its own/);
	});
});

describe('sourcePseudos', () => {
	it('has a W+ form for what may hold when unknown', () => {
		const pseudos = sourcePseudos({ classes });
		assert.equal(favorableName('accepted'), 'may-be-accepted');
		assert.equal(favorableName('state'), 'state');
		for (const name of ['form-input', 'cell', 'state', 'named-by-field', 'may-be-named-by-field', 'accepted', 'may-be-accepted', 'written', 'blank', 'within', 'design-system']) {
			assert.equal(typeof pseudos[name], 'function', name);
		}
		assert.equal(pseudos.state(), false);
	});

	it('takes no hidden input for a form input', () => {
		const pseudos = sourcePseudos({ classes });
		const input = (type) => ({ name: 'input', attrs: new Map(type ? [['type', type]] : []) });
		assert.equal(pseudos['form-input'](input()), true);
		assert.equal(pseudos['form-input'](input('text')), true);
		assert.equal(pseudos['form-input'](input('hidden')), false);
	});
});
