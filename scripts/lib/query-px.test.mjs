import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findQueryPx } from './query-px.js';

test('a rem condition passes', () => {
	assert.deepEqual(findQueryPx('@container (max-width: 40rem) {\n}\n@media (min-width: 63rem) {}'), []);
});

test('a px condition fails, with its line', () => {
	assert.deepEqual(findQueryPx('a {}\n@container (max-width: 640px) {\n}'), [{ line: 2, text: '@container (max-width: 640px) {' }]);
	assert.equal(findQueryPx('@media (min-width: 401px) and (max-width: 720px) {}').length, 1);
});

test('a px length in a matchMedia() string fails', () => {
	assert.deepEqual(findQueryPx('const q = matchMedia(`(max-width: 640px)`);'), [{ line: 1, text: 'matchMedia(`(max-width: 640px)`)' }]);
	assert.equal(findQueryPx("matchMedia('(pointer: coarse), (max-width: 640px)')").length, 1);
});

test('a value built at runtime passes', () => {
	assert.deepEqual(findQueryPx('@container (max-width: ${queryBreakpoints.smMax}) {}\nmatchMedia(`(max-width: ${queryBreakpoints.smMax})`)'), []);
});

test('a mention in a comment does not count', () => {
	assert.deepEqual(findQueryPx('/* ## sm: an @media query at max-width 640px */\n/**\n * an @container query, e.g. 320px wide\n * {@link x}\n */'), []);
});

// The known limit, so a change that widens or narrows it shows up here.
test('a condition spread over more lines is not caught', () => {
	assert.deepEqual(findQueryPx('@container (min-width: 20rem)\n\tand (max-width: 640px) {}'), []);
});
