#!/usr/bin/env node
/**
 * Runs after an agent edits a file, and hands what nldd lint finds back to it.
 *
 * Only ever the project's own installed linter: an edit hook must not reach for
 * the network or run a package the project did not choose. It stops at once for
 * a file without nldd-* markup, so it costs nothing in any other project.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';

const EXTENSIONS = new Set(['.html', '.vue', '.jsx', '.tsx']);

function findProject(file) {
	let directory = dirname(file);
	for (;;) {
		if (existsSync(join(directory, 'node_modules/.bin/nldd'))) return directory;
		const parent = dirname(directory);
		if (parent === directory) return undefined;
		directory = parent;
	}
}

function main() {
	const input = JSON.parse(readFileSync(0, 'utf8'));
	const file = input.tool_input?.file_path;
	if (!file || !EXTENSIONS.has(extname(file)) || !existsSync(file)) return;
	if (!readFileSync(file, 'utf8').includes('nldd-')) return;
	const project = findProject(file);
	if (!project) return;

	const { stdout } = spawnSync(join(project, 'node_modules/.bin/nldd'), ['lint', '--format', 'json', file], {
		cwd: project,
		encoding: 'utf8',
		timeout: 5000,
	});
	const findings = JSON.parse(stdout || '{}').findings ?? [];
	if (findings.length === 0) return;

	const lines = findings.map(
		({ line, severity, rule, message }) => `${file}:${line} ${severity} ${rule}: ${message}`,
	);
	const additionalContext = `nldd lint found ${findings.length} problem(s). Fix them, or run \`npx @nldd/design-system explain <rule>\`.\n${lines.join('\n')}`;
	console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext } }));
}

try {
	main();
} catch {
	// A broken check must not get in the way of an edit.
}
