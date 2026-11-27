/**
 * The release notes semantic-release writes into CHANGELOG.md are only the
 * version heading; the sections under it are written by hand (see Changelog in
 * CLAUDE.md). CI never runs a release, so this runs the notes generator a
 * release would load, with the config in .releaserc.json, on made-up commits.
 *
 *   node --test scripts/release-notes.test.mjs
 * or via `npm run test:scripts`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importReleasePlugin } from './lib/release-plugin.js';

const { generateNotes } = await importReleasePlugin('@semantic-release/release-notes-generator');

const root = join(import.meta.dirname, '..');
const config = JSON.parse(readFileSync(join(root, '.releaserc.json'), 'utf8'));
const generator = config.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === '@semantic-release/release-notes-generator')[1];

test('the release notes are only the version heading, whatever the commits say', async () => {
	const messages = [
		'feat(card): add a variant',
		'fix(button): focus ring',
		'perf: faster',
		'docs: explain',
		'revert: undo',
		'feat(list)!: drop an attribute',
		'refactor(menu): rename\n\nBREAKING CHANGE: the old name is gone',
	];
	const notes = await generateNotes(generator, {
		cwd: root,
		logger: { log() {}, error() {} },
		commits: messages.map((message, i) => ({ hash: String(i + 1).padStart(40, '0'), message })),
		lastRelease: { version: '0.29.2', gitTag: 'v0.29.2' },
		nextRelease: { version: '0.30.0', gitTag: 'v0.30.0', type: 'minor' },
		options: { repositoryUrl: 'https://github.com/NederlandseDigitaleDienst/design-system.git' },
	});
	assert.match(
		notes.trim(),
		/^## \[0\.30\.0\]\(https:\/\/github\.com\/NederlandseDigitaleDienst\/design-system\/compare\/v0\.29\.2\.\.\.v0\.30\.0\) \(\d{4}-\d{2}-\d{2}\)$/,
	);
});
