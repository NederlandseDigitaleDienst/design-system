/**
 * Lints the Lit templates in the stories with every rule, hints included.
 *
 * Stories are the documentation people and agents read to see how a component is
 * used, so they hold to the same rules as the patterns. A story that shows on
 * purpose what not to do says so with a suppression and a reason.
 *
 * Usage: node scripts/lint-stories.js
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLinter, loadData } from '../lint/linter.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function storyFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return storyFiles(path);
		return entry.name.endsWith('.stories.ts') ? [path] : [];
	});
}

const linter = createLinter(loadData());
const problems = [];
const files = storyFiles(resolve(repoRoot, 'src')).sort();

for (const file of files) {
	const { findings } = await linter.lintSource(readFileSync(file, 'utf8'), file);
	for (const { line, severity, rule, message } of findings) {
		problems.push(`${relative(repoRoot, file)}:${line}: ${severity} ${rule}: ${message}`);
	}
}

if (problems.length > 0) {
	console.error(`${problems.length} problem(s) in the stories:\n`);
	for (const problem of problems) console.error(`  ${problem}`);
	process.exit(1);
}

console.log(`Stories hold in ${files.length} files.`);
