/**
 * Runs `nldd upgrade` on a copy of real consumer apps, to see what the command
 * does before it ships. Two apps did not show three defects that eleven did, so
 * a change to the command or to a reader is tried here first.
 *
 * Reads a comma-separated list of directories from NLDD_UPGRADE_CORPUS, or from
 * NLDD_LINT_CORPUS, so no local path ends up in this repository. A directory
 * inside a project, such as its `src`, stands for the project it is in.
 *
 * Usage: NLDD_UPGRADE_CORPUS=../app-a,../app-b node scripts/upgrade-corpus.js [--install] [--strings]
 *
 * Each project is copied to a temporary directory first, without `node_modules`,
 * and the command runs on the copy: the corpus itself is never written to.
 * Without --install no package manager runs, so no lockfile is rewritten and no
 * types are read; with it both happen, and a run takes minutes.
 *
 * --strings lists every place the command found in a file it read as strings,
 * with the line: that is where a pattern or an example is easily taken for markup.
 */

import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { readConfig } from '../lint/project.js';
import { loadData, resolveSeverities } from '../lint/rule-data.js';
import { knownKeys } from '../lint/session.js';
import { upgradeProject } from '../lint/upgrade.js';

const listed = (process.env.NLDD_UPGRADE_CORPUS ?? process.env.NLDD_LINT_CORPUS ?? '').split(',').filter(Boolean);
if (listed.length === 0) {
	console.error('Set NLDD_UPGRADE_CORPUS to a comma-separated list of project directories.');
	process.exit(2);
}

const args = process.argv.slice(2);
const install = args.includes('--install') ? 'full' : false;
const data = loadData();
const known = knownKeys(data);
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const breaking = JSON.parse(readFileSync(new URL('../lint/breaking.generated.json', import.meta.url), 'utf8'));

/** The project a directory is in: the nearest one above it with a `.git`, or the directory itself. */
function projectOf(directory) {
	for (let at = resolve(directory); dirname(at) !== at; at = dirname(at)) {
		if (existsSync(join(at, '.git'))) return at;
	}
	return resolve(directory);
}

const SKIPPED = new Set(['node_modules', '.git', 'target', 'dist', 'build', '.venv']);
const count = (list) => list.reduce((sum, { places }) => sum + places.length, 0);
const projects = [...new Set(listed.map(projectOf))];
const totals = { pinned: 0, notRaised: 0, fixed: 0, work: 0, undecided: 0, standing: 0, unread: 0 };
const inStrings = [];

for (const project of projects) {
	const copy = mkdtempSync(join(tmpdir(), 'nldd-upgrade-corpus-'));
	const started = performance.now();
	try {
		cpSync(project, copy, { recursive: true, filter: (source) => !SKIPPED.has(basename(source)) });
		const config = readConfig(copy, known);
		const result = await upgradeProject(data, { root: copy, target: pkg.version, breaking, config, severities: resolveSeverities(data, config.rules, {}), install });
		const row = { pinned: result.pinned.length, notRaised: result.notRaised.length, fixed: result.fixed.total, work: count(result.work), undecided: count(result.undecided), standing: count(result.standing), unread: result.unread.length };
		for (const key of Object.keys(totals)) totals[key] += row[key];
		const failed = result.lockfiles.filter(({ ok, error }) => !ok && error !== 'not run').map(({ file, error }) => `${file}: ${error}`);
		console.log(`${basename(project).padEnd(24)} ${(result.from ?? '-').padEnd(8)} ${Object.entries(row).map(([key, value]) => `${key} ${value}`).join('  ')}  ${Math.round((performance.now() - started) / 1000)}s${failed.length ? `  LOCKFILE FAILED ${failed.join('; ')}` : ''}`);
		for (const list of ['work', 'undecided', 'standing']) {
			for (const { rule, places } of result[list]) {
				for (const { file, line } of places.filter((place) => /\.(py|[cm]?js)$/.test(place.file))) {
					const text = readFileSync(join(copy, file), 'utf8').split('\n')[line - 1] ?? '';
					inStrings.push(`${basename(project)}/${file}:${line}  ${rule}  ${text.trim().slice(0, 120)}`);
				}
			}
		}
	} catch (error) {
		console.log(`${basename(project).padEnd(24)} CRASHED ${String(error.stack ?? error).split('\n').slice(0, 2).join(' | ')}`);
		process.exitCode = 1;
	} finally {
		rmSync(copy, { recursive: true, force: true });
	}
}

console.log(`\n${projects.length} projects to ${pkg.version}: ${Object.entries(totals).map(([key, value]) => `${key} ${value}`).join('  ')}`);
console.log(`${inStrings.length} places in files read as strings${args.includes('--strings') ? ':' : ' (list them with --strings)'}`);
if (args.includes('--strings')) for (const place of inStrings) console.log(`  ${place}`);
