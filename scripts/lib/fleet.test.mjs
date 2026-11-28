import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fleetErrors, fleetMarkdown, fleetMatrix } from './fleet.js';

describe('fleet.json', () => {
	const fleet = (...repositories) => ({ repositories });

	it('takes an entry with a name alone, and one with every field', () => {
		assert.deepEqual(fleetErrors(fleet({ repository: 'NederlandseDigitaleDienst/a-site', agent: true, build: 'npm run build', site: 'dist' }, { repository: 'NederlandseDigitaleDienst/b-app' })), []);
	});

	it('names what is wrong with an entry', () => {
		assert.deepEqual(fleetErrors(fleet({ repository: 'a-site', agent: 'yes', colour: 'red' })), [
			'repositories[0].agent is a boolean.',
			'repositories[0] has "colour", which is not one of repository, agent, sandbox, build, site.',
			'repositories[0].repository is owner/name, such as NederlandseDigitaleDienst/design-system.',
		]);
		assert.deepEqual(fleetErrors(fleet({ repository: 'o/a', build: 'make' })), ['repositories[0] needs both "build" and "site", or neither.']);
		assert.deepEqual(fleetErrors(fleet({ repository: 'o/a' }, { repository: 'O/A' })), ['O/A is on the list twice.']);
		assert.match(fleetErrors(fleet({ repository: 'o/b' }, { repository: 'o/a' })).join(), /alphabetical/);
		assert.deepEqual(fleetErrors({ list: [] }), ['fleet.json holds an object with a list "repositories".']);
	});

	it('fills in every field for the workflow, with the sandbox on unless an entry says otherwise', () => {
		assert.deepEqual(fleetMatrix(fleet({ repository: 'o/a' }, { repository: 'o/b', agent: true, sandbox: false })), [
			{ repository: 'o/a', agent: false, sandbox: true, build: '', site: '' },
			{ repository: 'o/b', agent: true, sandbox: false, build: '', site: '' },
		]);
	});

	it('writes the list as a table, and says so when it is empty', () => {
		assert.equal(fleetMarkdown(fleet()), 'Nog geen repository.');
		assert.match(fleetMarkdown(fleet({ repository: 'o/a', agent: true }, { repository: 'o/b', build: 'make', site: 'out' })), /\| \[o\/a\]\(https:\/\/github.com\/o\/a\) \| ja \| als de agent vindt hoe de site bouwt \|\n\| \[o\/b\]\(https:\/\/github.com\/o\/b\) \| nee \| ja \|/);
	});
});
