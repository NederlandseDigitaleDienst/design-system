/**
 * Tests for the release rules in .releaserc.json, run through the commit
 * analyzer semantic-release itself uses, so a change to the rules, the header
 * patterns or the parser version shows up here before it shows up in a
 * release number.
 *
 *   node --test scripts/release-rules.test.mjs
 * or via `npm run test:scripts`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { analyzeCommits } from '@semantic-release/commit-analyzer';

const root = join(import.meta.dirname, '..');
const config = JSON.parse(readFileSync(join(root, '.releaserc.json'), 'utf8'));
const analyzer = config.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === '@semantic-release/commit-analyzer')[1];
const logger = { log() {}, error() {} };

/** The release type semantic-release picks for these commit messages. */
async function release(...messages) {
	const commits = messages.map((message, i) => ({ hash: String(i), message }));
	return analyzeCommits(analyzer, { cwd: root, commits, logger });
}

test('a breaking change bumps the minor version, below 1.0', async () => {
	assert.equal(await release('feat!: rename an attribute'), 'minor');
	assert.equal(await release('fix(button)!: drop an alias'), 'minor');
	assert.equal(await release('refactor: rename\n\nBREAKING CHANGE: the attribute is gone'), 'minor');
	assert.equal(await release('an unprefixed message\n\nBREAKING CHANGE: the attribute is gone'), 'minor');
});

test('a squash commit with "!" and a Breaking section bumps the minor version', async () => {
	assert.equal(await release('feat!: a corner for the hero (#298)\n\n## Breaking\n\n- item-width is now item-min-width'), 'minor');
});

test('one breaking commit makes the whole release a minor', async () => {
	assert.equal(await release('feat: add something', 'fix!: break something'), 'minor');
});

test('everything else that releases is a patch', async () => {
	for (const message of ['feat: add an attribute', 'fix: a focus ring', 'perf: faster', 'refactor: tidy', 'style: format', 'docs: a guideline', 'build: a script', 'revert: undo', 'an unprefixed message']) {
		assert.equal(await release(message), 'patch', message);
	}
});

test('chore, ci and test release nothing, also when breaking', async () => {
	for (const message of ['chore: deps', 'ci: a workflow', 'test: a case', 'chore!: drop a script', 'ci(release)!: change the rules', 'test!: a new runner']) {
		assert.equal(await release(message), null, message);
	}
});

// The analyzer takes the highest release among all matching rules, so a
// single breaking rule would outrank "release: false" for chore, ci and
// test. Breaking is therefore one rule per releasing type, and a type added
// without its breaking twin would quietly release a patch for a breaking change.
test('every type that releases also has a breaking rule', () => {
	const rules = analyzer.releaseRules;
	const releasing = rules.filter((rule) => !rule.breaking && rule.release).map((rule) => rule.type);
	const breaking = new Set(rules.filter((rule) => rule.breaking).map((rule) => rule.type));
	for (const type of releasing) {
		assert.ok(breaking.has(type), `no breaking rule for type ${type}`);
	}
});
