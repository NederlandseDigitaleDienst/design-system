/**
 * The job after all repositories of the fleet: files what their agents found the design system
 * cannot do, once each, and tells every pull request that waits for it.
 *
 *   node file-issues.mjs <findings dir> <version> [<decisions.json>]
 *
 * It runs once at a time (the job has a concurrency group of its own), so it is the only one that
 * posts, and it reads what is there just before it posts. A finding is known by its fingerprint
 * (findings.mjs); an issue that stands for it carries the marker, in its text or in a comment, and
 * the label `uit-upgrade`, so the list of that label is the index, without the delay of a search.
 * A model may have said that a finding is the same as an issue with another title (decisions.json:
 * fingerprint to issue number); without one only the fingerprint counts.
 *
 * At most MAX new issues a run: a run that goes wrong stays small, and what waits comes back with
 * the next run of its repository, as a finding that still blocks it.
 *
 * Needs GH_TOKEN, a token that may write issues in the design system. With APP_ID and APP_KEY it
 * also writes on the pull requests, with a token of the app per organization.
 */

import { spawnSync } from 'node:child_process';
import { createSign } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { marker, markersIn } from './findings.mjs';

export const DESIGN = 'NederlandseDigitaleDienst/design-system';
export const MAX = 5;

/** The findings of every repository, one entry per fingerprint, with the pull requests it came from. */
export function gather(dir) {
	const byFingerprint = new Map();
	for (const run of readdirSync(dir).filter((name) => statSync(join(dir, name)).isDirectory())) {
		const sourceFile = join(dir, run, 'source.json');
		const source = existsSync(sourceFile) ? JSON.parse(readFileSync(sourceFile, 'utf8')) : undefined;
		for (const file of readdirSync(join(dir, run)).filter((name) => name.endsWith('.json') && name !== 'source.json')) {
			const finding = JSON.parse(readFileSync(join(dir, run, file), 'utf8'));
			const known = byFingerprint.get(finding.fingerprint) ?? { ...finding, blocking: false, sources: [] };
			known.blocking ||= finding.blocking;
			if (source) known.sources.push(source);
			byFingerprint.set(finding.fingerprint, known);
		}
	}
	return [...byFingerprint.values()];
}

/** Which issue already stands for each fingerprint: by its marker, or as a model decided. */
export function knownIssues(issues, decisions = {}) {
	const known = new Map();
	for (const issue of issues) for (const fingerprint of markersIn(issue.text)) if (!known.has(fingerprint)) known.set(fingerprint, issue.number);
	for (const [fingerprint, number] of Object.entries(decisions)) if (Number.isInteger(number) && !known.has(fingerprint)) known.set(fingerprint, number);
	return known;
}

/** What to do per finding: add to an issue that stands for it, file a new one, or wait for the next run. */
export function plan(findings, known, max = MAX) {
	let filed = 0;
	// What blocks goes first, then what most apps have.
	const ordered = [...findings].sort((a, b) => Number(b.blocking) - Number(a.blocking) || b.sources.length - a.sources.length);
	return ordered.map((finding) => {
		if (known.has(finding.fingerprint)) return { finding, action: 'comment', issue: known.get(finding.fingerprint) };
		if (filed < max) {
			filed++;
			return { finding, action: 'file' };
		}
		return { finding, action: 'wait' };
	});
}

const apps = (count) => (count === 1 ? 'één app' : `${count} apps`);

export const issueBody = (finding, version) =>
	`${finding.body}\n\n---\n\nGevonden door de agent die apps naar ${version} brengt, bij ${apps(finding.sources.length || 1)}.${finding.blocking ? ' Het blokkeert die upgrade: de pull request wacht tot een release dit oplost.' : ''}\n\n${marker(finding.fingerprint)}\n`;

export const commentBody = (finding, version) =>
	`Ook gevonden bij de upgrade naar ${version}, bij ${apps(finding.sources.length || 1)}.${finding.blocking ? ' Het blokkeert die upgrade.' : ''}\n\n${marker(finding.fingerprint)}\n`;

export const pullComment = (finding, number) =>
	finding.blocking
		? `Deze pull request wacht op ${DESIGN}#${number}: ${finding.title}. Hij blijft op concept tot een release dat oplost; de eerste run daarna zet hem op klaar.`
		: `Gemeld bij het designsysteem als ${DESIGN}#${number}: ${finding.title}. Dit blokkeert deze pull request niet.`;

function gh(args, { input, token = process.env.GH_TOKEN } = {}) {
	const result = spawnSync('gh', args, { input, encoding: 'utf8', env: { ...process.env, GH_TOKEN: token } });
	if (result.status !== 0) throw new Error(`gh ${args.slice(0, 3).join(' ')}: ${result.stderr.trim()}`);
	return result.stdout;
}

/** The issues of the label, open and closed, with the text of their comments: what stands for a finding now. */
function issuesOfLabel() {
	const issues = JSON.parse(gh(['api', '--paginate', '--slurp', `repos/${DESIGN}/issues?labels=uit-upgrade&state=all&per_page=100`])).flat();
	return issues.map((issue) => ({
		number: issue.number,
		text: [issue.body ?? '', ...JSON.parse(gh(['api', '--paginate', '--slurp', `repos/${DESIGN}/issues/${issue.number}/comments?per_page=100`])).flat().map(({ body }) => body ?? '')].join('\n'),
	}));
}

/** A token of the app for one organization, made here: the action that makes one takes a fixed owner. */
function appToken(owner) {
	const { APP_ID: id, APP_KEY: key } = process.env;
	if (!id || !key) return undefined;
	const now = Math.floor(Date.now() / 1000);
	const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
	const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iat: now - 60, exp: now + 540, iss: id })}`;
	const jwt = `${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(key, 'base64url')}`;
	try {
		const installation = JSON.parse(gh(['api', `orgs/${owner}/installation`], { token: jwt }));
		return JSON.parse(gh(['api', '--method', 'POST', `app/installations/${installation.id}/access_tokens`], { token: jwt })).token;
	} catch {
		return undefined;
	}
}

if (process.argv[1]?.endsWith('file-issues.mjs')) {
	const [dir, version, decisionsFile] = process.argv.slice(2);
	const findings = existsSync(dir) ? gather(dir) : [];
	if (findings.length === 0) {
		console.log('No findings for the design system.');
		process.exit(0);
	}
	const decisions = decisionsFile && existsSync(decisionsFile) ? JSON.parse(readFileSync(decisionsFile, 'utf8')) : {};
	for (const label of [['uit-upgrade', 'C5DEF5', 'Gevonden door een agent die een app upgradede'], ['blocking', 'B60205', 'Houdt de upgrade van een app tegen tot een release dit oplost']]) {
		try {
			gh(['label', 'create', label[0], '--repo', DESIGN, '--color', label[1], '--description', label[2]]);
		} catch {
			// It is there already.
		}
	}
	const steps = plan(findings, knownIssues(issuesOfLabel(), decisions));
	const tokens = new Map();
	const summary = [];
	for (const step of steps) {
		const { finding } = step;
		if (step.action === 'wait') {
			summary.push(`- Wacht op een volgende ronde: ${finding.title}`);
			continue;
		}
		// Just before posting, once more: what this job does not know could have come in since it started.
		let issue = step.issue ?? knownIssues(issuesOfLabel()).get(finding.fingerprint);
		const labels = finding.blocking ? ['uit-upgrade', 'blocking'] : ['uit-upgrade'];
		if (issue) {
			gh(['issue', 'comment', String(issue), '--repo', DESIGN, '--body-file', '-'], { input: commentBody(finding, version) });
			gh(['issue', 'edit', String(issue), '--repo', DESIGN, ...labels.flatMap((label) => ['--add-label', label])]);
			summary.push(`- Aangevuld: ${DESIGN}#${issue}, ${finding.title}`);
		} else {
			const url = gh(['issue', 'create', '--repo', DESIGN, '--title', finding.title, ...labels.flatMap((label) => ['--label', label]), '--body-file', '-'], { input: issueBody(finding, version) }).trim();
			issue = Number(url.split('/').pop());
			summary.push(`- Nieuw: ${DESIGN}#${issue}, ${finding.title}`);
		}
		// Every pull request that waits for it says so, and GitHub links the issue back to it.
		for (const { repository, number } of finding.sources) {
			const owner = repository.split('/')[0];
			if (!tokens.has(owner)) tokens.set(owner, appToken(owner));
			if (!tokens.get(owner) || !number) continue;
			try {
				gh(['pr', 'comment', String(number), '--repo', repository, '--body-file', '-'], { input: pullComment(finding, issue), token: tokens.get(owner) });
			} catch (error) {
				summary.push(`  - Niet op ${repository}#${number} gezet: ${error.message}`);
			}
		}
	}
	console.log(summary.join('\n'));
}
