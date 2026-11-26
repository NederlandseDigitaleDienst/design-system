// CI never runs semantic-release, so a release config that drifts only shows on
// main, after the merge. These tests run the two plugins that read our config
// on made-up commits: the analyzer that picks the version, and the notes
// generator whose output lands in CHANGELOG.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { generateNotes } from '@semantic-release/release-notes-generator';

const root = fileURLToPath(new URL('..', import.meta.url));
const { plugins } = JSON.parse(readFileSync(new URL('../.releaserc.json', import.meta.url), 'utf8'));
const configOf = (name) => plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === name)[1];

const context = (...messages) => ({
	cwd: root,
	logger: { log() {}, error() {} },
	commits: messages.map((message, index) => ({ hash: String(index + 1).padStart(40, '0'), message })),
	lastRelease: { version: '0.29.2', gitTag: 'v0.29.2' },
	nextRelease: { version: '0.30.0', gitTag: 'v0.30.0', type: 'minor' },
	options: { repositoryUrl: 'https://github.com/NederlandseDigitaleDienst/design-system.git' },
});

const releaseOf = (message) => analyzeCommits(configOf('@semantic-release/commit-analyzer'), context(message));

test('the version follows the table in CLAUDE.md', async () => {
	const table = {
		'feat(card): add a variant': 'patch',
		'fix(button): focus ring': 'patch',
		'perf: faster': 'patch',
		'refactor(menu): rename': 'patch',
		'style: format': 'patch',
		'docs: explain': 'patch',
		'build(deps): bump': 'patch',
		'revert: undo': 'patch',
		'Add a thing': 'patch',
		'feat(list)!: drop an attribute': 'minor',
		'fix!: change a default': 'minor',
		'refactor(menu): rename\n\nBREAKING CHANGE: the old name is gone': 'minor',
		'chore: tidy': null,
		'ci: cache': null,
		'test: cover': null,
		'chore!: tidy': null,
	};
	for (const [message, release] of Object.entries(table)) {
		assert.equal(await releaseOf(message), release, message);
	}
});

test('the release notes are only the version heading, whatever the commits say', async () => {
	const notes = await generateNotes(configOf('@semantic-release/release-notes-generator'), context(
		'feat(card): add a variant',
		'fix(button): focus ring',
		'perf: faster',
		'docs: explain',
		'revert: undo',
		'feat(list)!: drop an attribute',
		'refactor(menu): rename\n\nBREAKING CHANGE: the old name is gone',
	));
	assert.match(
		notes.trim(),
		/^## \[0\.30\.0\]\(https:\/\/github\.com\/NederlandseDigitaleDienst\/design-system\/compare\/v0\.29\.2\.\.\.v0\.30\.0\) \(\d{4}-\d{2}-\d{2}\)$/,
	);
});
