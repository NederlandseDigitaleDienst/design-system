/**
 * Runs every producer in scripts/generated-files.js in order and reports each
 * entry whose files changed: a generated file that is not what its source
 * makes. With `--write` it only runs them (`npm run generate:all`).
 *
 * It compares the files before and after, not against git, so a regenerated
 * file that is correct but not yet committed is no drift locally either.
 *
 * Usage: node scripts/check-generated.js [--write]
 */

import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GENERATED, inOrder } from './generated-files.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** A hash of every file under `paths`, by path. */
function snapshot(paths) {
	const hashes = new Map();
	const walk = (path) => {
		const full = join(root, path);
		if (!existsSync(full)) return;
		if (statSync(full).isDirectory()) {
			for (const entry of readdirSync(full)) walk(join(path, entry));
			return;
		}
		hashes.set(path, createHash('sha1').update(readFileSync(full)).digest('hex'));
	};
	paths.forEach(walk);
	return hashes;
}

function changed(before, after) {
	return [...new Set([...before.keys(), ...after.keys()])]
		.filter((path) => before.get(path) !== after.get(path))
		.sort();
}

const write = process.argv.includes('--write');
const entries = inOrder().filter((entry) => entry.check === 'pr');
const before = new Map(entries.map((entry) => [entry.script, snapshot(entry.files)]));

for (const entry of entries) {
	console.log(`\n> npm run ${entry.script}`);
	execSync(`npm run --silent ${entry.script}`, { cwd: root, stdio: 'inherit' });
}

if (write) process.exit(0);

let drift = 0;
for (const entry of entries) {
	const files = changed(before.get(entry.script), snapshot(entry.files));
	if (files.length === 0) continue;
	drift++;
	const message = `${files.join(', ')} ${files.length === 1 ? 'is' : 'zijn'} verouderd. Draai 'npm run ${entry.script}' en commit het resultaat.`;
	console.error(process.env.GITHUB_ACTIONS ? `::error::${message}` : `\n${message}`);
}
if (drift === 0) console.log(`\nAlle gegenereerde bestanden zijn bij (${entries.length} scripts).`);
process.exit(drift ? 1 : 0);
