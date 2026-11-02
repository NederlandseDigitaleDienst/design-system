import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

/* The full Dutch set is public, to start a language of your own from. These
 * pin that it is exported and has a source to be built from. */
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('the Dutch set is exported from the built nl.generated file', () => {
	assert.deepEqual(pkg.exports['./translations/nl'], {
		types: './dist/translations/nl.generated.d.ts',
		default: './dist/translations/nl.generated.js',
	});
	assert.ok(pkg.files.includes('dist'), 'dist ships in the package');
});

test('the Dutch set has a source', () => {
	assert.ok(existsSync(new URL('../src/translations/nl.generated.ts', import.meta.url)));
});
