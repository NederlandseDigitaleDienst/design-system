/** Everything about the consumer's project: its files, config and baseline. */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

export const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', '.next', '.nuxt']);
/** Markdown is linted on request: documentation is full of deliberately wrong examples. */
export const DEFAULT_EXTENSIONS = ['.html', '.htm', '.j2', '.jinja', '.jinja2', '.vue', '.jsx', '.tsx'];

/** Read only when a rule about an app's own stylesheets is on. */
export const STYLESHEET_EXTENSIONS = ['.css', '.scss', '.sass', '.less'];

/** Where a tag name stands outside markup: the linter does not read these, a renamed tag does. */
export const REFERENCE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts', '.css', '.scss', '.less'];

function walkDirectory(directory, found, extensions) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (!IGNORED_DIRECTORIES.has(entry.name)) walkDirectory(join(directory, entry.name), found, extensions);
		} else if (extensions.includes(extname(entry.name))) {
			found.push(join(directory, entry.name));
		}
	}
	return found;
}

/** `git ls-files` honors .gitignore without this tool parsing it. */
function trackedFiles(root, extensions) {
	try {
		const output = execFileSync('git', ['ls-files', '-coz', '--exclude-standard'], {
			cwd: root,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
			maxBuffer: 256 * 1024 * 1024,
		});
		return output
			.split('\0')
			.filter((file) => extensions.includes(extname(file)))
			.map((file) => join(root, file));
	} catch {
		return undefined;
	}
}

function matchesExclude(path, patterns) {
	return patterns.some((pattern) => path.includes(pattern));
}

export function findFiles(paths, root, exclude = [], extensions = DEFAULT_EXTENSIONS) {
	const files =
		paths.length === 0
			? (trackedFiles(root, extensions) ?? walkDirectory(root, [], extensions))
			: paths.flatMap((path) => {
					const full = resolve(root, path);
					if (!existsSync(full)) throw new Error(`No such file or directory: ${path}`);
					return statSync(full).isDirectory() ? walkDirectory(full, [], extensions) : [full];
				});
	return [...new Set(files)].filter((file) => existsSync(file) && !matchesExclude(relative(root, file), exclude));
}

const CONFIG_FILE = '.nldd-lint.json';

export function readConfig(root, knownRules) {
	const path = join(root, CONFIG_FILE);
	if (!existsSync(path)) return {};
	let config;
	try {
		config = JSON.parse(readFileSync(path, 'utf8'));
	} catch (error) {
		throw new Error(`${CONFIG_FILE}: ${error.message}`);
	}
	const isMap = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
	if (!isMap(config)) throw new Error(`${CONFIG_FILE}: expected an object.`);
	if (config.rules !== undefined && !isMap(config.rules)) throw new Error(`${CONFIG_FILE}: "rules" takes an object.`);
	if (config.wrappers !== undefined && (!isMap(config.wrappers) || !Object.values(config.wrappers).every((tag) => typeof tag === 'string'))) {
		throw new Error(`${CONFIG_FILE}: "wrappers" maps a component to a tag name.`);
	}
	if (config.exclude !== undefined && !Array.isArray(config.exclude)) throw new Error(`${CONFIG_FILE}: "exclude" takes a list.`);
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
		// A hint is never in a baseline, so it must not use up a warning of the same rule.
		if (finding.severity === 'hint' || !accepted[key]) return true;
		accepted[key]--;
		return false;
	});
}

const countFindings = (findings) => {
	const counts = {};
	for (const finding of findings.filter(({ severity }) => severity !== 'hint')) {
		counts[baselineKey(finding)] = (counts[baselineKey(finding)] ?? 0) + 1;
	}
	return counts;
};

/** How many accepted findings of the rules that ran are gone from the files that were read. */
export function looseInBaseline(results, baseline, root, ran) {
	let loose = 0;
	for (const { filename, findings } of results) {
		const found = countFindings(findings);
		for (const [entry, count] of Object.entries(baseline[relative(root, filename)] ?? {})) {
			if (ran(entry.split('|')[0])) loose += Math.max(0, count - (found[entry] ?? 0));
		}
	}
	return loose;
}

/**
 * Lowers what the baseline accepts to what is still there, and never raises or adds
 * anything: a ratchet. A file that is gone takes its entry along.
 */
export function tightenBaseline(results, root, canonical, ran) {
	if (!existsSync(join(root, BASELINE_FILE))) return undefined;
	const baseline = readBaseline(root, canonical);
	const read = new Map(results.map(({ filename, findings }) => [relative(root, filename), countFindings(findings)]));
	// Only the rules that ran can be compared; what the others accepted moves along as it is.
	const ranOnly = (entries) => Object.fromEntries(Object.entries(entries).filter(([entry]) => ran(entry.split('|')[0])));
	const sameCounts = (a, b) => {
		const left = ranOnly(a);
		const right = ranOnly(b);
		return Object.keys({ ...left, ...right }).every((key) => left[key] === right[key]);
	};
	let dropped = 0;
	for (const [file, entries] of Object.entries(baseline)) {
		if (!existsSync(join(root, file))) {
			// A file that moved takes its entry along, when it was read under its new name
			// and still has exactly what was accepted. Anything else drops it.
			const moved = [...read].find(([name, found]) => !baseline[name] && sameCounts(entries, found));
			if (moved) baseline[moved[0]] = entries;
			else dropped += Object.values(entries).reduce((sum, count) => sum + count, 0);
			delete baseline[file];
			continue;
		}
		const found = read.get(file);
		if (!found) continue;
		for (const [entry, count] of Object.entries(entries)) {
			if (!ran(entry.split('|')[0])) continue;
			const kept = Math.min(count, found[entry] ?? 0);
			dropped += count - kept;
			if (kept === 0) delete entries[entry];
			else entries[entry] = kept;
		}
		if (Object.keys(entries).length === 0) delete baseline[file];
	}
	writeFileSync(join(root, BASELINE_FILE), `${JSON.stringify(baseline, null, '\t')}\n`);
	return dropped;
}

/** `ran` says which rules this run checked: what another rule accepted stays accepted. */
export function writeBaseline(results, root, canonical, ran = () => true) {
	const baseline = readBaseline(root, canonical);
	for (const { filename, findings } of results) {
		const key = relative(root, filename);
		const kept = Object.entries(baseline[key] ?? {}).filter(([entry]) => !ran(entry.split('|')[0]));
		delete baseline[key];
		if (kept.length === 0 && findings.every(({ severity }) => severity === 'hint')) continue;
		baseline[key] = Object.fromEntries(kept);
		// A hint fails nothing, so there is nothing to accept.
		for (const finding of findings.filter(({ severity }) => severity !== 'hint')) {
			const entry = baselineKey(finding);
			baseline[key][entry] = (baseline[key][entry] ?? 0) + 1;
		}
	}
	const sorted = Object.fromEntries(Object.entries(baseline).sort(([a], [b]) => a.localeCompare(b)));
	writeFileSync(join(root, BASELINE_FILE), `${JSON.stringify(sorted, null, '\t')}\n`);
}
