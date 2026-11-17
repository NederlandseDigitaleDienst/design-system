import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { loadData, OPT_IN_GROUPS, resolveSeverities } from './rule-data.js';
import { knownKeys, lintProject } from './session.js';

const DATA = loadData();
const severities = resolveSeverities(DATA, {});

function project(files) {
	const root = mkdtempSync(join(tmpdir(), 'nldd-session-'));
	for (const [name, source] of Object.entries(files)) writeFileSync(join(root, name), source);
	return root;
}

const rules = (result) => result.results.flatMap(({ findings }) => findings.map((finding) => finding.rule));

describe('lint session', () => {
	it('reads only files with a component, and counts the rest', async () => {
		const root = project({ 'a.html': '<nldd-buton></nldd-buton>', 'b.html': '<p>plain</p>' });
		const result = await lintProject(DATA, { root, severities });
		assert.equal(result.results.length, 1);
		assert.equal(result.files, 2);
		assert.ok(rules(result).includes('unknown-element'));
	});

	it('takes a token the project declares itself as known', async () => {
		const root = project({
			'tokens.css': ':root { --semantics-own-color: red; }',
			'a.html': '<nldd-box></nldd-box><style>.a { color: var(--semantics-own-color) }</style>',
		});
		assert.ok(!rules(await lintProject(DATA, { root, severities })).includes('token-not-found'));
		writeFileSync(join(root, 'tokens.css'), '');
		assert.ok(rules(await lintProject(DATA, { root, severities })).includes('token-not-found'));
	});

	it('reads a wrapper of the app as the tag it wraps', async () => {
		const root = project({ 'a.jsx': 'export const A = () => <MyButton variant="nope" />;' });
		const config = { wrappers: { MyButton: 'nldd-button' } };
		assert.equal((await lintProject(DATA, { root, severities })).results.length, 0);
		assert.equal((await lintProject(DATA, { root, severities, config })).results.length, 1);
	});

	it('reads every file when an opt-in group runs', async () => {
		const root = project({ 'a.html': '<p class="x">plain</p>' });
		const pure = resolveSeverities(DATA, {}, { optIn: OPT_IN_GROUPS });
		assert.equal((await lintProject(DATA, { root, severities: pure })).results.length, 1);
	});

	it('fixes until nothing changes and writes the file', async () => {
		const renamed = DATA.rules.find((rule) => rule.fix?.tag);
		if (!renamed) return;
		const failed = renamed.examples.failed[0];
		const root = project({ 'a.html': failed });
		const result = await lintProject(DATA, { root, severities, fix: true });
		assert.ok(result.fixed > 0);
		assert.notEqual(readFileSync(join(root, 'a.html'), 'utf8'), failed);
	});

	it('knows every rule id, alias and group', () => {
		const known = knownKeys(DATA);
		assert.ok(known.has('api'));
		assert.ok(known.has('token-not-found'));
		for (const rule of DATA.rules) assert.ok(known.has(rule.id));
	});
});
