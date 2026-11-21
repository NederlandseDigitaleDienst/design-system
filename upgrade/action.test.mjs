/**
 * The steps of the action, run as the action runs them, against a repository on disk. GitHub,
 * npm and the sandbox are stand-ins (upgrade/test/); git, jq and the linter are the real ones.
 * The scripts use GNU tools, as a runner has them, so this runs on Linux only: in CI, and on a
 * Mac with `docker run --rm -v "$PWD":/w -w /w node:24 sh -c 'apt-get -qq update && apt-get -qq
 * install -y jq >/dev/null && node --test upgrade/action.test.mjs'`.
 */

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const action = dirname(fileURLToPath(import.meta.url));
const cli = join(action, '..', 'lint', 'cli.js');
const version = JSON.parse(readFileSync(join(action, '..', 'package.json'), 'utf8')).version;
const BRANCH = 'nldd/design-system-upgrade';

/** A command in a directory of stand-ins. */
function stub(dir, name, script) {
	writeFileSync(join(dir, name), script);
	chmodSync(join(dir, name), 0o755);
}

/** The key=value lines and the name<<EOF blocks of a file the runner reads after a step. */
function readCommands(file) {
	const values = {};
	if (!existsSync(file)) return values;
	const lines = readFileSync(file, 'utf8').split('\n');
	for (let at = 0; at < lines.length; at++) {
		const heredoc = /^(\w+)<<(\w+)$/.exec(lines[at]);
		if (heredoc) {
			const end = lines.indexOf(heredoc[2], at + 1);
			values[heredoc[1]] = lines.slice(at + 1, end).join('\n');
			at = end;
		} else if (lines[at].includes('=')) values[lines[at].slice(0, lines[at].indexOf('='))] = lines[at].slice(lines[at].indexOf('=') + 1);
	}
	return values;
}

/** A GitHub on disk with one repository, and the runner around the steps. */
function world() {
	const root = mkdtempSync(join(tmpdir(), 'nldd-action-'));
	const github = join(root, 'github');
	const origin = join(github, 'team', 'app');
	const stubs = join(root, 'stubs');
	mkdirSync(stubs);
	writeFileSync(join(root, 'gitconfig'), `[url "file://${github}/"]\n\tinsteadOf = https://github.com/\n[init]\n\tdefaultBranch = main\n[user]\n\tname = Team\n\temail = team@example.org\n`);
	stub(stubs, 'gh', `#!/bin/sh\nexec node ${join(action, 'test', 'gh.mjs')} "$@"\n`);
	stub(stubs, 'npm', `#!/bin/sh\nif [ "$1" = view ]; then echo ${version}; fi\nexit 0\n`);
	stub(stubs, 'npx', `#!/bin/sh\nshift 2\nexec node ${cli} "$@"\n`);
	// The sandbox stands back: what it keeps out is not what these tests are about.
	stub(stubs, 'bwrap', '#!/bin/sh\nwhile [ "$1" != -- ]; do shift; done\nshift\nexec "$@"\n');
	stub(stubs, 'sudo', '#!/bin/sh\nexit 0\n');
	const env = {
		...process.env,
		HOME: root,
		GIT_CONFIG_GLOBAL: join(root, 'gitconfig'),
		PATH: `${stubs}:${process.env.PATH}`,
		NLDD_SYSTEM_PATH: `${stubs}:${process.env.PATH}`,
		GH_STATE: join(root, 'gh.json'),
	};
	const git = (cwd, ...args) => execFileSync('git', args, { cwd, env, encoding: 'utf8' }).trim();

	// The project: on an old version, with one thing a fix takes care of and one that asks for a choice.
	mkdirSync(origin, { recursive: true });
	git(origin, 'init', '--quiet', '--bare');
	const seed = join(root, 'seed');
	git(root, 'clone', '--quiet', 'https://github.com/team/app', seed);
	writeFileSync(join(seed, 'package.json'), `${JSON.stringify({ name: 'app', dependencies: { '@nldd/design-system': '^0.20.0' } }, null, 2)}\n`);
	writeFileSync(join(seed, 'page.html'), '<nldd-title size="2" heading-level="2" text="Aanvraag A-1042"></nldd-title>\n<nldd-title color="inherit" heading-level="2" text="Dossier D-318"></nldd-title>\n');
	writeFileSync(join(seed, 'notes.md'), 'Aantekeningen.\n');
	git(seed, 'add', '.');
	git(seed, 'commit', '--quiet', '-m', 'start');
	git(seed, 'push', '--quiet', 'origin', 'main');

	/** One run of the action, its steps in order, as action.yml has them. */
	function run() {
		const tools = mkdtempSync(join(root, 'run-'));
		const files = { GITHUB_ENV: join(tools, 'env'), GITHUB_OUTPUT: join(tools, 'out'), GITHUB_PATH: join(tools, 'path'), GITHUB_STEP_SUMMARY: join(tools, 'summary') };
		let stepEnv = { ...env, ...files, REPOSITORY: 'team/app', ACTION: action, TOOLS: join(tools, 'nldd'), WORK: join(tools, 'work'), PROJECT: join(tools, 'project'), GH_TOKEN: 'token' };
		const outputs = {};
		const step = (name, extra) => {
			for (const file of Object.values(files)) writeFileSync(file, '');
			const result = spawnSync('bash', [join(action, name)], { env: { ...stepEnv, ...extra }, encoding: 'utf8' });
			assert.equal(result.status, 0, `${name}:\n${result.stdout}\n${result.stderr}`);
			stepEnv = { ...stepEnv, ...readCommands(files.GITHUB_ENV) };
			const added = readFileSync(files.GITHUB_PATH, 'utf8').trim();
			if (added) stepEnv.PATH = `${added}:${stepEnv.PATH}`;
			return Object.assign(outputs, { [name]: readCommands(files.GITHUB_OUTPUT) })[name];
		};
		const upgrade = step('upgrade.sh', { APP: '', BASE: '', WANTED: 'latest', FROM_SOURCE: 'false' });
		if (upgrade.changed === 'true') step('report.sh', {});
		const deliver = step('deliver.sh', { VERSION: upgrade.version, CHANGED: upgrade.changed, NUMBER: upgrade.number ?? '' });
		return { upgrade, deliver };
	}

	const state = () => JSON.parse(readFileSync(env.GH_STATE, 'utf8'));
	const editState = (change) => {
		const now = state();
		change(now);
		writeFileSync(env.GH_STATE, JSON.stringify(now));
	};
	/** A commit on a branch of the origin, as a team or the default branch moves on. */
	function commit(branch, file, text, message) {
		const work = mkdtempSync(join(root, 'commit-'));
		git(root, 'clone', '--quiet', '--branch', branch, 'https://github.com/team/app', work);
		writeFileSync(join(work, file), text(readFileSync(join(work, file), 'utf8')));
		git(work, 'commit', '--quiet', '-am', message);
		git(work, 'push', '--quiet', 'origin', branch);
		return git(work, 'rev-parse', 'HEAD');
	}
	const show = (ref, file) => git(origin, 'show', `${ref}:${file}`);
	return { run, state, editState, commit, show, git: (...args) => git(origin, ...args) };
}

describe('the action, step by step', { skip: process.platform !== 'linux' && 'the scripts use GNU tools: run this on Linux' }, () => {
	it('opens a pull request with the version, the fixes, what is left and its state', () => {
		const { run, state, show } = world();
		const { upgrade } = run();
		assert.equal(upgrade.changed, 'true');
		const [pr] = state().prs;
		assert.equal(pr.title, `chore: designsysteem naar ${version}`);
		assert.match(pr.body, new RegExp(`^# Designsysteem van 0\\.20\\.0 naar ${version.replaceAll('.', '\\.')}\\n\\n- \\*\\*1 plek vraagt om een keuze`));
		assert.match(pr.body, /<!-- nldd-upgrade-state \{"from":"0\.20\.0","places":\{"title-color-no-effect\|page\.html\|nldd-title":1\}\} -->\n$/);
		assert.match(show(BRANCH, 'page.html'), /size="display-2"/);
		assert.match(show(BRANCH, 'package.json'), new RegExp(`"\\^${version}"`));
	});

	it('continues an open pull request: the team\'s commit stays, the default branch comes in, nothing is forced', () => {
		const { run, state, commit, show, git } = world();
		run();
		const team = commit(BRANCH, 'page.html', (text) => text.replace(' color="inherit"', ''), 'De kleur volgt het vlak');
		commit('main', 'notes.md', (text) => `${text}Een regel van main.\n`, 'Iets op main');
		const { upgrade } = run();
		assert.deepEqual([upgrade.changed, upgrade.agent], ['true', 'false'], 'no new place, so no agent');
		assert.equal(git('merge-base', '--is-ancestor', team, BRANCH), '', 'the commit of the team is still on the branch');
		assert.match(show(BRANCH, 'notes.md'), /Een regel van main/);
		const [pr] = state().prs;
		assert.equal(state().prs.length, 1);
		assert.match(pr.body, /^# Designsysteem van 0\.20\.0 naar [^\n]*\n\n> Deze pull request liep al\./);
		assert.match(pr.body, /- \*\*Klaar om te mergen\*\*/);
	});

	it('takes a conflict in the manifest from the default branch and raises it again', () => {
		const { run, state, commit, show } = world();
		run();
		commit('main', 'package.json', (text) => text.replace('^0.20.0', '^0.20.1'), 'Dependabot');
		run();
		assert.match(show(BRANCH, 'package.json'), new RegExp(`"\\^${version}"`));
		assert.match(state().prs[0].body, /gaf een conflict in de lockfile of `package\.json`/);
	});

	it('goes on without the default branch at a conflict elsewhere, and says where it is', () => {
		const { run, state, commit, show } = world();
		run();
		commit('main', 'page.html', (text) => text.replace('Aanvraag A-1042', 'Aanvraag A-1043'), 'Een andere aanvraag');
		run();
		assert.match(show(BRANCH, 'page.html'), /Aanvraag A-1042/, 'the branch did not take main');
		assert.match(state().prs[0].body, /Deze branch loopt achter op `main`\.[^]*> - `page\.html`/);
	});

	it('closes a pull request the project no longer needs', () => {
		const { run, state, show, commit } = world();
		run();
		commit('main', 'package.json', () => show(BRANCH, 'package.json') + '\n', 'Zelf geüpgraded');
		commit('main', 'page.html', () => show(BRANCH, 'page.html') + '\n', 'Zelf aangepast');
		run();
		assert.equal(state().prs[0].state, 'closed');
		assert.match(state().prs[0].closing, /Het project staat al op/);
	});

	it('does not ask again in the same minor when the team closed the pull request, and does when the action closed it', () => {
		const { run, state, editState } = world();
		run();
		editState((now) => Object.assign(now.prs[0], { state: 'closed', closedBy: 'teamlid' }));
		assert.equal(run().upgrade.changed, 'false');
		assert.equal(state().prs.length, 1, 'no new pull request in the same minor');
		editState((now) => Object.assign(now.prs[0], { closedBy: 'github-actions[bot]' }));
		run();
		assert.equal(state().prs.length, 2, 'a pull request the action closed itself is no answer of the team');
	});
});
