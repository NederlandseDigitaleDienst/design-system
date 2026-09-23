/**
 * Unit tests for the changelog header parser in sync-publiccode.js.
 *
 * Pure-logic tests, run with Node's built-in runner (no browser, no vitest):
 *   node --test scripts/sync-publiccode.test.mjs
 * or via `npm run test:scripts`.
 *
 * The script itself only runs from semantic-release's prepareCmd, so a broken
 * regex surfaces during a release and nowhere else. These tests are the only
 * place CI checks it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseReleaseDate } from './sync-publiccode.js';

const preamble = '# Changelog\n\nAll notable changes are documented here.\n\n';

const newStyle = (version, previous, date) =>
	`## [${version}](https://github.com/NederlandseDigitaleDienst/design-system/compare/v${previous}...v${version}) (${date})`;

test('reads the date from the newest version block', () => {
	const changelog = `${preamble}${newStyle('0.8.91', '0.8.90', '2026-09-20')}\n\n### Added\n- iets\n`;
	assert.equal(parseReleaseDate(changelog), '2026-09-20');
});

test('ignores older blocks, including ones in the pre-0.8.80 format', () => {
	const changelog = [
		preamble + newStyle('0.8.91', '0.8.90', '2026-09-20'),
		newStyle('0.8.90', '0.8.89', '2026-09-19'),
		'## <small>0.8.79 (2026-08-07)</small>',
	].join('\n\n');
	assert.equal(parseReleaseDate(changelog), '2026-09-20');
});

test('throws when the newest block is in the old format, instead of reaching past it', () => {
	// The regression this script was fixed for: the old header was skipped and
	// a later, newer-format block supplied a date from an earlier release.
	const changelog = [
		preamble + '## <small>0.8.91 (2026-09-20)</small>',
		newStyle('0.8.90', '0.8.89', '2026-09-19'),
	].join('\n\n');
	assert.throws(() => parseReleaseDate(changelog), /newest version block/);
});

test('throws when the newest block has no date', () => {
	const changelog = `${preamble}## [0.8.91](https://github.com/o/r/compare/v0.8.90...v0.8.91)\n`;
	assert.throws(() => parseReleaseDate(changelog), /newest version block/);
});

test('throws on a changelog without any version block', () => {
	assert.throws(() => parseReleaseDate(preamble), /newest version block/);
});

test('handwritten sections above the newest block do not shadow it', () => {
	// Manual entries go above the newest version block as `###` sections, per
	// CLAUDE.md. Only a stray `##` would be picked up in their place.
	const changelog = `${preamble}### Added\n- iets handmatigs\n\n${newStyle('0.8.91', '0.8.90', '2026-09-20')}\n`;
	assert.equal(parseReleaseDate(changelog), '2026-09-20');
});

test('accepts the real CHANGELOG.md in this repo', () => {
	const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf-8');
	assert.match(parseReleaseDate(changelog), /^\d{4}-\d{2}-\d{2}$/);
});
