/**
 * Checks the nldd-* markup in the skill docs with the linter's built-in rules.
 *
 * Those code blocks are what a consumer, or an agent reading the skill, copies,
 * so a tag or attribute that does not exist is a bug we ship. Rules from
 * src/rules/ stay off: a skill can show on purpose what not to do.
 *
 * Usage: node scripts/validate-skill-markup.js
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLinter, loadData } from '../lint/linter.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Generated from the components themselves, so already guarded against drift. */
const GENERATED = new Set(['reference.md', 'changelog.md', 'design-guidelines.md']);

function skillFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return skillFiles(path);
		return entry.name.endsWith('.md') && !GENERATED.has(entry.name) ? [path] : [];
	});
}

const linter = createLinter({ ...loadData(), rules: [] });
const errors = [];
const files = skillFiles(resolve(repoRoot, 'skills')).sort();

for (const file of files) {
	const { findings } = await linter.lintSource(readFileSync(file, 'utf8'), file);
	for (const { line, rule, message } of findings) {
		errors.push(`${relative(repoRoot, file)}:${line}: ${rule}: ${message}`);
	}
}

if (errors.length > 0) {
	console.error(`${errors.length} problem(s) in the skill docs:\n`);
	for (const error of errors) console.error(`  ${error}`);
	console.error('\nConsumers and agents copy these files. The API is in skills/nldd-design/reference.md.');
	process.exit(1);
}

console.log(`Skill markup holds in ${files.length} files.`);
