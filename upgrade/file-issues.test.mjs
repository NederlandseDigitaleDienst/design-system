import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { commentBody, gather, issueBody, knownIssues, plan, pullComment } from './file-issues.mjs';
import { fingerprintOf, marker, namesApp, readDraft } from './findings.mjs';

const finding = (title, blocking = false, sources = []) => ({ fingerprint: fingerprintOf(title), title, body: `Wat ${title} doet.`, blocking, sources });

describe('a finding of an agent', () => {
	it('reads the title, whether it blocks, and the text', () => {
		const draft = readDraft('# nldd-sheet sluit niet met Escape in een nldd-window\nblocking: true\n\nWat er gebeurt.\n');
		assert.deepEqual(draft, { title: 'nldd-sheet sluit niet met Escape in een nldd-window', body: 'Wat er gebeurt.', blocking: true, fingerprint: fingerprintOf('nldd-sheet sluit niet met Escape in een nldd-window') });
		assert.equal(readDraft('# Iets\n\nZonder regel over blokkeren.').blocking, false);
		assert.equal(readDraft('\nGeen titel.'), undefined);
	});

	it('has one fingerprint for one title, whatever the case or the spaces', () => {
		assert.equal(fingerprintOf('nldd-sheet  sluit niet'), fingerprintOf('NLDD-sheet sluit niet'));
		assert.notEqual(fingerprintOf('nldd-sheet sluit niet'), fingerprintOf('nldd-sheet opent niet'));
	});

	it('names the app by its repository, its owner or a file it tracks, and not by the design system', () => {
		assert.equal(namesApp('Zie src/components/Lijst.tsx', 'team/app', ['src/components/Lijst.tsx']), true);
		assert.equal(namesApp('In de app van Team zie je', 'team/app', []), true);
		assert.equal(namesApp('Zie NederlandseDigitaleDienst/design-system#12', 'NederlandseDigitaleDienst/bouwmeester', []), false);
		assert.equal(namesApp('Een tabel met een knop in een cel.', 'team/portaal', ['README.md']), false);
	});
});

describe('the job that files the findings of the fleet', () => {
	it('gathers one entry per fingerprint, blocking when one repository found it blocking, with the pull requests', () => {
		const dir = mkdtempSync(join(tmpdir(), 'nldd-findings-'));
		const same = finding('nldd-table scrolt niet');
		for (const [run, blocking, number] of [['a', false, 4], ['b', true, 9]]) {
			mkdirSync(join(dir, run));
			writeFileSync(join(dir, run, `${same.fingerprint}.json`), JSON.stringify({ ...same, blocking }));
			writeFileSync(join(dir, run, 'source.json'), JSON.stringify({ repository: `team/${run}`, number }));
		}
		const [gathered] = gather(dir);
		assert.equal(gathered.blocking, true);
		assert.deepEqual(gathered.sources, [{ repository: 'team/a', number: 4 }, { repository: 'team/b', number: 9 }]);
	});

	it('knows an issue by the marker in its text or a comment, and by what a model decided', () => {
		const a = finding('A');
		const b = finding('B');
		const known = knownIssues([{ number: 12, text: `Iets\n${marker(a.fingerprint)}` }], { [b.fingerprint]: 30, nonsense: 'new' });
		assert.deepEqual([...known], [[a.fingerprint, 12], [b.fingerprint, 30]]);
	});

	it('adds to what is known, files the rest up to the limit, what blocks first and then what most apps have', () => {
		const findings = [finding('wens', false, [{}]), finding('vaak', false, [{}, {}, {}]), finding('blokkeert', true, [{}]), finding('bekend', true, [{}])];
		const known = new Map([[findings[3].fingerprint, 7]]);
		const steps = plan(findings, known, 2).map(({ finding: { title }, action, issue }) => [title, action, issue]);
		assert.deepEqual(steps, [['blokkeert', 'file', undefined], ['bekend', 'comment', 7], ['vaak', 'file', undefined], ['wens', 'wait', undefined]]);
	});

	it('writes the issue, the comment and the note on a pull request, with the marker and no app', () => {
		const blocking = finding('nldd-table scrolt niet', true, [{ repository: 'team/a', number: 4 }, { repository: 'team/b', number: 9 }]);
		assert.match(issueBody(blocking, '0.29.0'), /bij 2 apps\. Het blokkeert die upgrade[^]*<!-- nldd-finding [0-9a-f]{12} -->\n$/);
		assert.doesNotMatch(issueBody(blocking, '0.29.0'), /team\//);
		assert.match(commentBody(blocking, '0.29.0'), /^Ook gevonden bij de upgrade naar 0\.29\.0, bij 2 apps\. Het blokkeert die upgrade\./);
		assert.equal(pullComment(blocking, 31), 'Deze pull request wacht op NederlandseDigitaleDienst/design-system#31: nldd-table scrolt niet. Hij blijft op concept tot een release dat oplost; de eerste run daarna zet hem op klaar.');
	});
});
