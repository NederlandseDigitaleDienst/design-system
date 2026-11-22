#!/usr/bin/env node
/**
 * A stand-in for `gh` in the tests of the action: the calls its scripts make, on pull requests
 * kept in a JSON file ($GH_STATE). `--jq` runs through the real jq, as gh does.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = process.env.GH_STATE;
const state = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { prs: [], next: 1, comment: 1 };
const save = () => writeFileSync(path, JSON.stringify(state, null, 2));
const args = process.argv.slice(2);
const option = (name) => {
	const at = args.indexOf(name);
	return at >= 0 ? args[at + 1] : undefined;
};
const body = () => {
	const file = option('--body-file');
	return file === '-' ? readFileSync(0, 'utf8') : file ? readFileSync(file, 'utf8') : option('--body');
};
const out = (value) => {
	const jq = option('--jq');
	if (!jq) return process.stdout.write(`${typeof value === 'string' ? value : JSON.stringify(value)}\n`);
	const run = spawnSync('jq', ['--raw-output', jq], { input: JSON.stringify(value), encoding: 'utf8' });
	// gh writes nothing for a null, where jq writes "null": `.[0].number` of no pull requests is empty.
	process.stdout.write(run.stdout.replace(/^null$/gm, '').replace(/^\n$/, ''));
	process.exit(run.status);
};
const pr = (ref) => state.prs.find(({ number, head }) => String(number) === String(ref) || head === ref);
const view = (p) => ({ number: p.number, title: p.title, body: p.body, author: { login: p.author ?? 'app/nldd' }, mergedAt: p.merged ? '2026-11-21T00:00:00Z' : null, url: `https://github.com/test/pull/${p.number}` });

const [group, verb] = args;
if (group === 'auth') process.exit(0);
if (group === 'api') {
	const route = args.find((arg) => arg.startsWith('repos/') || arg.startsWith('users/') || arg === 'user');
	if (route === 'user') process.exit(1);
	if (route.startsWith('users/')) out({ id: 1 });
	else if (/^repos\/[^/]+\/[^/]+$/.test(route)) out({ default_branch: 'main' });
	else if (/\/issues\/\d+\/events$/.test(route)) {
		const p = pr(route.split('/')[4]);
		out(p.closedBy ? [{ event: 'closed', actor: { login: p.closedBy } }] : []);
	} else if (/\/issues\/\d+\/comments$/.test(route)) out(pr(route.split('/')[4]).comments);
	else if (/\/issues\/comments\/\d+$/.test(route)) {
		for (const p of state.prs) p.comments = p.comments.filter(({ id }) => String(id) !== route.split('/').pop());
		save();
	} else throw new Error(`gh api ${route}: not stood in for`);
} else if (group === 'pr') {
	if (verb === 'list') {
		const wanted = option('--state');
		const head = option('--head');
		const list = state.prs.filter((p) => (!head || p.head === head) && (wanted === 'open' ? p.state === 'open' : p.state === 'closed')).reverse();
		out(list.slice(0, Number(option('--limit') ?? 30)).map(view));
	} else if (verb === 'view') out(view(pr(args[2])));
	else if (verb === 'create') {
		state.prs.push({ number: state.next++, head: option('--head'), base: option('--base'), title: option('--title'), body: body(), state: 'open', comments: [] });
		save();
		process.stdout.write(`https://github.com/test/pull/${state.next - 1}\n`);
	} else if (verb === 'edit') {
		Object.assign(pr(args[2]), { title: option('--title'), body: body() });
		save();
	} else if (verb === 'close') {
		Object.assign(pr(args[2]), { state: 'closed', closedBy: 'github-actions[bot]', closing: option('--comment') });
		save();
	} else if (verb === 'comment') {
		pr(args[2]).comments.push({ id: state.comment++, body: body() });
		save();
	} else throw new Error(`gh pr ${verb}: not stood in for`);
} else throw new Error(`gh ${group}: not stood in for`);
