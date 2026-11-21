import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { formatFleet, requestedEntry, withEntry } from './fleet-request.js';

const body = (repository, agent, build = '_No response_', site = '_No response_') =>
	`### Repository\n\n${repository}\n\n### Agent\n\n- [${agent ? 'X' : ' '}] Laat een agent de lijst afwerken voordat de pull request opengaat\n\n### Bouwcommando\n\n${build}\n\n### Map van de site\n\n${site}`;

describe('an issue that asks to be on fleet.json', () => {
	it('reads the form into an entry, and leaves out what was not answered', () => {
		assert.deepEqual(requestedEntry(body('jouw-organisatie/jouw-app', false)), { repository: 'jouw-organisatie/jouw-app' });
		assert.deepEqual(requestedEntry(body('https://github.com/o/site/', true, 'npm ci && npm run build', 'dist')), { repository: 'o/site', agent: true, build: 'npm ci && npm run build', site: 'dist' });
	});

	it('puts the entry in its place, and replaces one that is there', () => {
		const fleet = { repositories: [{ repository: 'o/a' }, { repository: 'o/c', agent: true }] };
		assert.deepEqual(withEntry(fleet, { repository: 'o/b' }).repositories.map(({ repository }) => repository), ['o/a', 'o/b', 'o/c']);
		assert.deepEqual(withEntry(fleet, { repository: 'O/C' }).repositories, [{ repository: 'o/a' }, { repository: 'O/C' }]);
	});

	it('writes the file as it is written by hand, one line per entry', () => {
		assert.equal(formatFleet(JSON.parse(readFileSync(new URL('../fleet.json', import.meta.url), 'utf8'))), readFileSync(new URL('../fleet.json', import.meta.url), 'utf8'));
		assert.equal(formatFleet({ repositories: [] }), '{\n\t"repositories": []\n}\n');
	});
});
