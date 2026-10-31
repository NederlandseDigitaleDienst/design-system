/** Everything about the consumer's project: its files, config and baseline. */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', '.next', '.nuxt']);
/** Markdown is linted on request: documentation is full of deliberately wrong examples. */
const DEFAULT_EXTENSIONS = ['.html', '.htm', '.j2', '.jinja', '.jinja2', '.vue', '.jsx', '.tsx'];

function walkDirectory(directory, found) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (!IGNORED_DIRECTORIES.has(entry.name)) walkDirectory(join(directory, entry.name), found);
		} else if (DEFAULT_EXTENSIONS.includes(extname(entry.name))) {
			found.push(join(directory, entry.name));
		}
	}
	return found;
}

/** `git ls-files` honors .gitignore without this tool parsing it. */
function trackedFiles(root) {
	try {
		const output = execFileSync('git', ['ls-files', '-coz', '--exclude-standard'], {
			cwd: root,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
			maxBuffer: 256 * 1024 * 1024,
		});
		return output
			.split('\0')
			.filter((file) => DEFAULT_EXTENSIONS.includes(extname(file)))
			.map((file) => join(root, file));
	} catch {
		return undefined;
	}
}

function matchesExclude(path, patterns) {
	return patterns.some((pattern) => path.includes(pattern));
}

export function findFiles(paths, root, exclude = []) {
	const files =
		paths.length === 0
			? (trackedFiles(root) ?? walkDirectory(root, []))
			: paths.flatMap((path) => {
					const full = resolve(root, path);
					if (!existsSync(full)) throw new Error(`No such file or directory: ${path}`);
					return statSync(full).isDirectory() ? walkDirectory(full, []) : [full];
				});
	return files.filter((file) => existsSync(file) && !matchesExclude(relative(root, file), exclude));
}

const CONFIG_FILE = '.nldd-lint.json';

export function readConfig(root, knownRules) {
	const path = join(root, CONFIG_FILE);
	if (!existsSync(path)) return {};
	const config = JSON.parse(readFileSync(path, 'utf8'));
	for (const [rule, level] of Object.entries(config.rules ?? {})) {
		if (!knownRules.has(rule)) throw new Error(`${CONFIG_FILE}: unknown rule "${rule}".`);
		if (!['off', 'hint', 'warn', 'error'].includes(level)) {
			throw new Error(`${CONFIG_FILE}: "${rule}" takes off, hint, warn or error, not ${JSON.stringify(level)}.`);
		}
	}
	return config;
}

export const BASELINE_FILE = '.nldd-lint-baseline.json';

/**
 * Counts per file, rule and tag rather than positions, so moving code around
 * does not turn accepted findings into new ones. The findings in a file beyond
 * the accepted count are the new ones.
 */
function mergeRenamed(entries, canonical) {
	const merged = {};
	for (const [key, count] of Object.entries(entries)) {
		const [rule, ...tag] = key.split('|');
		const renamed = [canonical(rule), ...tag].join('|');
		merged[renamed] = (merged[renamed] ?? 0) + count;
	}
	return merged;
}

export function readBaseline(root, canonical = (id) => id) {
	const path = join(root, BASELINE_FILE);
	if (!existsSync(path)) return {};
	const baseline = JSON.parse(readFileSync(path, 'utf8'));
	return Object.fromEntries(
		Object.entries(baseline).map(([file, entries]) => [
			file,
			mergeRenamed(entries, canonical),
		]),
	);
}

const baselineKey = ({ rule, tag }) => `${rule}|${tag}`;

export function applyBaseline(filename, findings, baseline, root) {
	const accepted = { ...baseline[relative(root, filename)] };
	return findings.filter((finding) => {
		const key = baselineKey(finding);
		if (!accepted[key]) return true;
		accepted[key]--;
		return false;
	});
}

export function writeBaseline(results, root, canonical) {
	const baseline = readBaseline(root, canonical);
	for (const { filename, findings } of results) {
		const key = relative(root, filename);
		delete baseline[key];
		if (findings.every(({ severity }) => severity === 'hint')) continue;
		baseline[key] = {};
		// A hint fails nothing, so there is nothing to accept.
		for (const finding of findings.filter(({ severity }) => severity !== 'hint')) {
			const entry = baselineKey(finding);
			baseline[key][entry] = (baseline[key][entry] ?? 0) + 1;
		}
	}
	const sorted = Object.fromEntries(Object.entries(baseline).sort(([a], [b]) => a.localeCompare(b)));
	writeFileSync(join(root, BASELINE_FILE), `${JSON.stringify(sorted, null, '\t')}\n`);
}
