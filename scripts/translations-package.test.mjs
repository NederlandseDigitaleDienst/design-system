import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

/* setTranslations() checks keys in development against the full Dutch set,
 * which it imports from the package and fails quietly without. These pin
 * that the set is exported and has a source to be built from. */
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('the Dutch set is exported from the built nl.generated file', () => {
	assert.deepEqual(pkg.exports['./translations/nl'], {
		types: './dist/translations/nl.generated.d.ts',
		default: './dist/translations/nl.generated.js',
	});
	assert.ok(pkg.files.includes('dist'), 'dist ships in the package');
});

test('the Dutch set has a source, and translations.ts imports that file', () => {
	assert.ok(existsSync(new URL('../src/translations/nl.generated.ts', import.meta.url)));
	const source = readFileSync(new URL('../src/utilities/translations.ts', import.meta.url), 'utf8');
	assert.match(source, /import\('\.\.\/translations\/nl\.generated\.js'\)/);
});
