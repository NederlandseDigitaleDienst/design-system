/**
 * Runs the linter over real consumer apps, to see what a rule does before it
 * ships. A rule that sounds right can fire on hundreds of correct lines.
 *
 * Reads a comma-separated list of directories from NLDD_LINT_CORPUS, so no local
 * path ends up in this repository.
 *
 * Usage: NLDD_LINT_CORPUS=../app-a/src,../app-b/src node scripts/lint-corpus.js [rule]
 */

import { readFileSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import { createLinter } from '../lint/linter.js';
import { findFiles } from '../lint/project.js';

const directories = (process.env.NLDD_LINT_CORPUS ?? '').split(',').filter(Boolean);
if (directories.length === 0) {
	console.error('Set NLDD_LINT_CORPUS to a comma-separated list of app directories.');
	process.exit(2);
}

const only = process.argv[2];
const linter = createLinter();
const perRule = new Map();
const totals = { failed: 0, passed: 0, cantTell: 0 };
let fileCount = 0;
const started = performance.now();

for (const directory of directories) {
	const root = resolve(directory);
	const app = basename(root.replace(/(\/(src|frontend|web))+$/, ''));
	for (const filename of findFiles([root], root)) {
		const source = readFileSync(filename, 'utf8');
		if (!source.includes('nldd-')) continue;
		fileCount++;
		const { findings, counts } = await linter.lintSource(source, filename);
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
