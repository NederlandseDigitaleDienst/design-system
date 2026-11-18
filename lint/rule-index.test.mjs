import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tagsOf } from './rule-index.js';

test('a rule is about the tags it names, not the ones it excludes', () => {
	assert.deepEqual(tagsOf({ context: 'nldd-navigation-split-view nldd-page:not([landmarks="page"], nldd-navigation-split-view nldd-sheet *)' }), ['nldd-navigation-split-view', 'nldd-page']);
	assert.deepEqual(tagsOf({ context: 'nldd-split-button > :not(nldd-menu, nldd-popover)' }), ['nldd-split-button']);
});

test('what a :not() requires still counts', () => {
	assert.deepEqual(tagsOf({ context: 'nldd-page:not(:has(nldd-breadcrumbs))' }), ['nldd-page', 'nldd-breadcrumbs']);
	assert.deepEqual(tagsOf({ context: 'nldd-form', assert: ':has(nldd-form-actions)' }), ['nldd-form', 'nldd-form-actions']);
});
