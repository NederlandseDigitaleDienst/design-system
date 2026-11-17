/**
 * Runs the linter over real consumer apps, to see what a rule does before it
 * ships. A rule that sounds right can fire on hundreds of correct lines.
 *
 * Reads a comma-separated list of directories from NLDD_LINT_CORPUS, so no local
 * path ends up in this repository.
 *
 * Usage: NLDD_LINT_CORPUS=../app-a/src,../app-b/src node scripts/lint-corpus.js [--pure] [rule]
 *
 * With --pure the opt-in group pure runs too, over every file and stylesheet.
 *
 * Each app goes through lint/session.js, the same session `nldd lint` runs: the
 * same files, the tokens it declares itself, and the `wrappers` and `exclude`
 * from its .nldd-lint.json. Its rule levels are not taken over, so every rule
 * shows what it would find.
 */

import { existsSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { readConfig } from '../lint/project.js';
import { loadData, OPT_IN_GROUPS, resolveSeverities } from '../lint/rule-data.js';
import { knownKeys, lintProject } from '../lint/session.js';

const directories = (process.env.NLDD_LINT_CORPUS ?? '').split(',').filter(Boolean);
if (directories.length === 0) {
	console.error('Set NLDD_LINT_CORPUS to a comma-separated list of app directories.');
	process.exit(2);
}

const args = process.argv.slice(2);
const pure = args.includes('--pure');
const only = args.find((arg) => !arg.startsWith('--'));
const data = loadData();
const severities = resolveSeverities(data, {}, { optIn: pure ? OPT_IN_GROUPS : [] });
const known = knownKeys(data);

/** The app's .nldd-lint.json: in the directory itself or the nearest one above it
 *  that has one, without leaving the project (a package.json or .git ends it). */
function configFor(directory) {
	for (let dir = directory; ; dir = dirname(dir)) {
		if (existsSync(join(dir, '.nldd-lint.json'))) return readConfig(dir, known);
		if (existsSync(join(dir, 'package.json')) || existsSync(join(dir, '.git')) || dirname(dir) === dir) return {};
	}
}
const perRule = new Map();
const totals = { failed: 0, passed: 0, cantTell: 0 };
let fileCount = 0;
const started = performance.now();

for (const directory of directories) {
	const root = resolve(directory);
	const app = basename(root.replace(/(\/(src|frontend|web))+$/, ''));
	const config = configFor(root);
	const { results, files } = await lintProject(data, { root, paths: [root], config, severities });
	fileCount += files;
	for (const { filename, findings, counts } of results) {
		for (const key of Object.keys(totals)) totals[key] += counts[key];
		for (const finding of findings) {
			if (!perRule.has(finding.rule)) perRule.set(finding.rule, { count: 0, apps: new Set(), samples: [] });
			const entry = perRule.get(finding.rule);
			entry.count++;
			entry.apps.add(app);
			entry.samples.push(`${app}/${relative(root, filename)}:${finding.line}  ${finding.message}`);
		}
	}
}

const ms = Math.round(performance.now() - started);
console.log(`${fileCount} files in ${directories.length} apps, ${ms} ms`);
console.log(`rule outcomes: ${JSON.stringify(totals)}\n`);
const sorted = [...perRule].sort(([, a], [, b]) => b.count - a.count);
for (const [rule, { count, apps, samples }] of sorted) {
	if (only && rule !== only) continue;
	console.log(`${String(count).padStart(5)}  ${rule}  (${apps.size} apps)`);
	const shown = only ? samples.length : 3;
	for (const sample of samples.slice(0, shown)) console.log(`       ${sample}`);
}
