/**
 * `nldd upgrade`: brings a project to the version of this package.
 *
 * It does what is certain and writes down the rest. Certain: the version,
 * wherever the project names it, the lockfile, and every fix of `nldd lint
 * --fix`. The rest is a worklist: what the linter still finds, each with its
 * place, and the breaking changes on the way that name something this project
 * uses. A person or an agent takes it from there; nothing here guesses.
 *
 * The target is not an option. A linter knows the API of its own version, so
 * `npx @nldd/design-system@<version> upgrade` upgrades to that version.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { BUILT_IN_RULES } from './rule-data.js';
import { applyBaseline, findFiles, readBaseline, relativePath } from './project.js';
import { lintProject } from './session.js';
import { createTypes } from './types.js';

export const PACKAGE = '@nldd/design-system';

const VERSION = /^\d+\.\d+\.\d+$/;

/** Negative when `a` is the older one. Only plain `x.y.z`: a prerelease is no upgrade target. */
export function compareVersions(a, b) {
	const [left, right] = [a, b].map((version) => version.split('.').map(Number));
	return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

/** Where a project can name the version, besides its manifests. */
const PIN_EXTENSIONS = ['.json', '.yml', '.yaml', '.toml', '.html', '.htm', '.md', '.mdx', '.py', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue', '.astro', '.j2', '.jinja', '.jinja2', '.sh', '.txt'];

/** Written by a package manager or a release, not by hand: the first follows the manifest, the second is history. */
const NOT_A_PIN = /^(package-lock\.json|npm-shrinkwrap\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lock|changelog.*)$/i;

/** `^0.13.2`, `~0.13.2` or `0.13.2`: a range this can raise and keep its meaning. */
const SIMPLE_RANGE = /^([\^~]?)(\d+\.\d+\.\d+)$/;

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const lineOf = (source, offset) => source.slice(0, offset).split('\n').length;

/**
 * The package's name as a key, with a range as its value: a dependency in a
 * manifest, and just as much an override, a resolution or a catalog. In a
 * manifest, a value that is no plain range is reported; elsewhere it is not a pin.
 */
function keyedPins(source, isManifest) {
	const edits = [];
	const left = [];
	for (const match of source.matchAll(new RegExp(`(${escapeRegExp(JSON.stringify(PACKAGE))}\\s*:\\s*")([^"\\n]*)"`, 'g'))) {
		const simple = SIMPLE_RANGE.exec(match[2]);
		if (simple) edits.push({ kind: isManifest ? 'manifest' : 'record', at: match.index + match[1].length, length: match[2].length, from: simple[2], write: (target) => simple[1] + target });
		// `workspace:*`, a tag, a git address, `>=0.13`: the project chose something else than a version.
		else if (isManifest) left.push({ line: lineOf(source, match.index), text: match[2] });
	}
	return { edits, left };
}

/** A hash as a registry and a lockfile write it: `sha512-…`, or hex digits from a SHA-1 up. Taken wide: one that is missed would stay behind with a version it does not belong to. */
const HASH = /^(sha\d+-\S+|[0-9a-f]{40,128})$/;

/**
 * A record of the package in a JSON file of the project's own: an object with a
 * `version` that says it is about the package, by its `name` or `package`, or by
 * the key it stands under. It may hold the hash of that version too.
 */
function recordPins(source) {
	let parsed;
	try {
		parsed = JSON.parse(source);
	} catch {
		return { edits: [], left: [] };
	}
	const records = [];
	(function walk(value, key) {
		if (value === null || typeof value !== 'object') return;
		const about = key === PACKAGE || value.name === PACKAGE || value.package === PACKAGE;
		if (about && !Array.isArray(value) && typeof value.version === 'string' && VERSION.test(value.version)) {
			records.push({ version: value.version, hashes: Object.values(value).filter((held) => typeof held === 'string' && HASH.test(held)) });
		}
		for (const [name, held] of Object.entries(value)) walk(held, name);
	})(parsed);
	const edits = [];
	const left = [];
	const once = (text) => source.indexOf(text) >= 0 && source.indexOf(text, source.indexOf(text) + 1) < 0;
	for (const { version, hashes } of records) {
		const places = [...source.matchAll(new RegExp(`("version"\\s*:\\s*")${escapeRegExp(version)}"`, 'g'))];
		// Two versions written the same way, or a hash that stands twice: which one is the record's is a guess.
		if (records.length !== 1 || places.length !== 1 || !hashes.every(once)) {
			left.push({ line: places[0] ? lineOf(source, places[0].index) : 1, text: `"version": "${version}"` });
			continue;
		}
		edits.push({ kind: 'record', at: places[0].index + places[0][1].length, length: version.length, from: version, write: (target) => target, hashes: hashes.map((hash) => ({ at: source.indexOf(hash), text: hash })) });
	}
	return { edits, left };
}

/** The tag a place stands in, when it stands in one: from its `<` to its `>`. */
function tagAround(source, at) {
	const open = source.lastIndexOf('<', at);
	const close = source.indexOf('>', at);
	return open >= 0 && close >= 0 && source.lastIndexOf('>', at) < open ? source.slice(open, close + 1) : '';
}

/**
 * `@nldd/design-system@0.13.2`: a CDN address, an `npx` line in a workflow, an
 * import map. And the address of the tarball, which names the version without the `@`.
 */
function referencePins(source) {
	const name = PACKAGE.split('/')[1];
	const written = new RegExp(`${escapeRegExp(PACKAGE)}(?:@|/-/${escapeRegExp(name)}-)(\\d+\\.\\d+\\.\\d+)(?![\\w-]|\\.\\d)`, 'g');
	return [...source.matchAll(written)].map((match) => ({
		kind: 'reference',
		at: match.index + match[0].length - match[1].length,
		length: match[1].length,
		from: match[1],
		write: (target) => target,
		// A tag with `integrity` holds the hash of the one file it loads, and that is not ours to recompute.
		guarded: /\sintegrity\s*=/.test(tagAround(source, match.index)),
	}));
}

/**
 * Every place in one file that names the version, and what there could not be raised.
 * @returns {{ edits: object[], left: { line: number, text: string }[] }}
 */
export function pinsIn(filename, source) {
	if (!source.includes(PACKAGE)) return { edits: [], left: [] };
	const name = basename(filename);
	const sets = extname(name) === '.json' ? [keyedPins(source, name === 'package.json'), recordPins(source)] : [];
	return { edits: [...sets.flatMap(({ edits }) => edits), ...referencePins(source)], left: sets.flatMap(({ left }) => left) };
}

/**
 * Raises every pin in a source to `target`. A pin that is already there, or past
 * it, stays. A version next to a hash changes with that hash or not at all: a
 * record is raised only when each hash in it is the one the registry gives for
 * the old version, and then it gets the one for the new.
 * @param {(version: string) => { integrity?: string, shasum?: string } | undefined} [dist] - what the registry says about a version
 * @returns {{ source: string, raised: { kind: string, from: string, line: number }[], left: { line: number, text: string }[] }}
 */
export function raisePins(filename, source, target, dist = () => undefined) {
	const { edits, left } = pinsIn(filename, source);
	const raised = [];
	const changes = [];
	for (const edit of edits) {
		if (compareVersions(edit.from, target) >= 0) continue;
		const line = lineOf(source, edit.at);
		if (edit.guarded) {
			left.push({ line, text: `${PACKAGE}@${edit.from} with the integrity hash of one file` });
			continue;
		}
		const swaps = [];
		if (edit.hashes?.length) {
			const [old, next] = [dist(edit.from), dist(target)];
			for (const { at, text } of edit.hashes) {
				const field = ['integrity', 'shasum'].find((name) => old?.[name] === text);
				if (field && next?.[field]) swaps.push({ at, length: text.length, text: next[field] });
			}
			if (swaps.length !== edit.hashes.length) {
				left.push({ line, text: `${edit.from} with a hash that is not the registry's for that version` });
				continue;
			}
		}
		changes.push({ at: edit.at, length: edit.length, text: edit.write(target) }, ...swaps);
		raised.push({ kind: edit.kind, from: edit.from, line });
	}
	let result = source;
	for (const { at, length, text } of changes.sort((a, b) => b.at - a.at)) result = result.slice(0, at) + text + result.slice(at + length);
	return { source: result, raised, left };
}

const isBerry = (directory) => existsSync(join(directory, '.yarnrc.yml'));

/**
 * The lockfile a manifest's directory falls under, and what its package manager
 * runs to rewrite only that, or to install what it lists as well. Neither runs a
 * script of a dependency.
 */
const LOCKFILES = [
	['package-lock.json', () => ({ lockfile: ['npm', ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund']], full: ['npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund']] })],
	['pnpm-lock.yaml', () => ({ lockfile: ['pnpm', ['install', '--lockfile-only', '--ignore-scripts']], full: ['pnpm', ['install', '--ignore-scripts']] })],
	['yarn.lock', (directory) => (isBerry(directory) ? { lockfile: ['yarn', ['install', '--mode', 'update-lockfile']], full: ['yarn', ['install', '--mode', 'skip-build']] } : { lockfile: ['yarn', ['install', '--ignore-scripts']], full: ['yarn', ['install', '--ignore-scripts']] })],
	['bun.lock', () => ({ lockfile: ['bun', ['install', '--lockfile-only']], full: ['bun', ['install', '--ignore-scripts']] })],
	['bun.lockb', () => ({ lockfile: ['bun', ['install', '--lockfile-only']], full: ['bun', ['install', '--ignore-scripts']] })],
];

/** @param {'lockfile' | 'full'} [mode] */
export function lockfileCommand(directory, root, mode = 'lockfile') {
	for (let at = directory; ; at = dirname(at)) {
		for (const [name, commands] of LOCKFILES) {
			if (existsSync(join(at, name))) return { directory: at, lockfile: name, command: commands(at)[mode] };
		}
		if (at === root || dirname(at) === at) return undefined;
	}
}

/** Runs a command and says how it went, in one line: a failed install is something to report, not to stop on. */
function runQuietly(command, args, cwd) {
	try {
		return { ok: true, output: execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }) };
	} catch (error) {
		return { ok: false, error: String(error.stderr || error.message).trim().split('\n').slice(-1)[0] };
	}
}

/**
 * The breaking changes after `from`, up to `target`, that name a component the
 * project uses: what to read, also where no rule can find the place. `uses` are
 * those components.
 * @param {Record<string, string[]>} breaking - entries per version, from breaking.generated.json
 * @param {string} text - the project's files that hold a component, as one text
 */
export function breakingFor(breaking, from, target, text) {
	const used = new Set(text.match(/nldd-[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? []);
	const versions = Object.keys(breaking).filter((version) => compareVersions(version, from) > 0 && compareVersions(version, target) <= 0);
	const entries = versions.sort(compareVersions).flatMap((version) => breaking[version].map((entry) => ({ version, text: entry })));
	const touching = entries.flatMap((entry) => {
		const quoted = [...entry.text.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
		const uses = [...new Set(quoted.flatMap((piece) => piece.match(/nldd-[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? []))].filter((tag) => used.has(tag));
		return uses.length > 0 ? [{ ...entry, uses }] : [];
	});
	return { total: entries.length, touching };
}

/**
 * Which rules the upgrade brings to a project that comes from `from`: what no
 * longer exists or has no effect, and every rule that came after that version.
 * A finding of another rule the project had already, with the linter it has now.
 */
function upgradeRules(data, from) {
	const byId = new Map(data.rules.map((rule) => [rule.id, rule]));
	const isNew = (rule) => rule.group === 'api' || (rule.after !== undefined && compareVersions(from, rule.after) <= 0);
	return { isNew, of: (id) => (byId.has(id) ? isNew(byId.get(id)) : id in BUILT_IN_RULES) };
}

const bySize = (a, b) => Number(b.severity === 'error') - Number(a.severity === 'error') || b.places.length - a.places.length;

/**
 * Adds what a running page shows to the result of an upgrade: the places the
 * source could not decide, per rule and per component of the app that rendered them.
 * @param {object} result - from upgradeProject()
 * @param {object} session - from lintRendered()
 */
export function withRendered(result, session, root) {
	const rules = new Map();
	for (const { filename, findings } of session.results) {
		for (const finding of findings) {
			const entry = rules.get(finding.rule) ?? { rule: finding.rule, severity: finding.severity, message: finding.message, places: [] };
			entry.places.push({ file: relativePath(root, filename), line: finding.line, tag: finding.tag || undefined, renderedBy: finding.renderedBy?.split(' < ')[0] });
			rules.set(finding.rule, entry);
		}
	}
	return { ...result, rendered: { pages: session.files, failed: session.failed, rules: [...rules.values()].sort(bySize) } };
}

/**
 * @param {object} data - lint data
 * @param {object} options
 * @param {string} options.root - the project
 * @param {string} options.target - the version to upgrade to: that of this package
 * @param {Record<string, string[]>} options.breaking - the breaking changes per version
 * @param {object} options.config - the project's lint config
 * @param {object} options.severities - from resolveSeverities()
 * @param {(id: string) => string} [options.canonical] - a rule id under its current name, for the baseline
 * @param {boolean | 'full'} [options.install] - rewrite the lockfiles (default true), or with `full` install what they list too, so the project's types can be read
 * @param {(command: string, args: string[], cwd: string) => { ok: boolean, output?: string, error?: string }} [options.run]
 * @returns {Promise<object>} what was done and what is left, as the report and the worklist read it
 */
export async function upgradeProject(data, { root, target, breaking, config, severities, canonical, install = true, run = runQuietly }) {
	// 1. The version, wherever the project names it.
	const pinned = [];
	const notRaised = [];
	const manifestDirectories = new Set();
	// What the registry says about a version, asked once and only where a record holds a hash.
	const asked = new Map();
	const dist = (version) => {
		if (!asked.has(version)) {
			const answer = run('npm', ['view', `${PACKAGE}@${version}`, 'dist', '--json'], root);
			let parsed;
			try {
				parsed = answer.ok ? JSON.parse(answer.output) : undefined;
			} catch {
				parsed = undefined;
			}
			asked.set(version, parsed);
		}
		return asked.get(version);
	};
	for (const filename of findFiles([], root, config.exclude, PIN_EXTENSIONS)) {
		if (NOT_A_PIN.test(basename(filename))) continue;
		const source = readFileSync(filename, 'utf8');
		const found = pinsIn(filename, source);
		if (found.edits.length === 0 && found.left.length === 0) continue;
		const change = raisePins(filename, source, target, dist);
		const file = relativePath(root, filename);
		if (change.source !== source) writeFileSync(filename, change.source);
		for (const pin of change.raised) pinned.push({ file, ...pin });
		for (const place of change.left) notRaised.push({ file, ...place });
		if (basename(filename) === 'package.json' && change.raised.some(({ kind }) => kind === 'manifest')) manifestDirectories.add(dirname(filename));
	}
	const from = pinned.map((pin) => pin.from).sort(compareVersions)[0];

	// 2. The lockfile of each manifest that changed.
	const lockfiles = [];
	const seen = new Set();
	for (const directory of manifestDirectories) {
		const lock = lockfileCommand(directory, root, install === 'full' ? 'full' : 'lockfile');
		if (!lock || seen.has(lock.directory)) continue;
		seen.add(lock.directory);
		const [command, args] = lock.command;
		const outcome = install ? run(command, args, lock.directory) : { ok: false, error: 'not run' };
		lockfiles.push({ file: relativePath(root, join(lock.directory, lock.lockfile)), command: [command, ...args].join(' '), ok: outcome.ok, error: outcome.error });
	}

	// 3. Every fix that is certain. A first pass without writing says which rules they come from.
	const brings = upgradeRules(data, from ?? target);
	// Where the syntax leaves an expression open, the project's types may settle it. What stays open
	// is listed for the rules that can fail a build: there the upgrade can break without a finding.
	const types = createTypes();
	const canBreak = (rule) => rule.severity === 'error' && brings.isNew(rule);
	const lint = (fix) => lintProject(data, { root, config, severities, fix, markdown: true, undecided: canBreak, types });
	const before = await lint(false);
	const fixedByRule = {};
	for (const finding of before.results.flatMap(({ findings }) => findings)) {
		if (finding.fix) fixedByRule[finding.rule] = (fixedByRule[finding.rule] ?? 0) + 1;
	}
	const session = await lint(true);

	// 4. What is left, without what the project accepted in its baseline.
	const baseline = readBaseline(root, canonical);
	const work = new Map();
	const standing = new Map();
	const undecided = new Map();
	const unread = [];
	const messages = new Map(data.rules.map((rule) => [rule.id, rule]));
	for (const { filename, findings, undecided: open = [] } of session.results) {
		const file = relativePath(root, filename);
		for (const { rule, line, tag } of open) {
			const { severity, message } = messages.get(rule);
			const entry = undecided.get(rule) ?? { rule, severity, message, places: [] };
			entry.places.push({ file, line, tag });
			undecided.set(rule, entry);
		}
		for (const finding of applyBaseline(filename, findings, baseline, root)) {
			if (finding.severity === 'hint') continue;
			if (finding.rule === 'file-not-read') unread.push(file);
			else {
				const list = finding.severity === 'error' || brings.of(finding.rule) ? work : standing;
				const entry = list.get(finding.rule) ?? { rule: finding.rule, severity: finding.severity, message: finding.message, places: [] };
				entry.places.push({ file, line: finding.line, tag: finding.tag || undefined });
				list.set(finding.rule, entry);
			}
		}
	}

	// 5. The breaking changes on the way that name something this project uses.
	const text = session.results.map(({ source }) => source).join('\n');
	const changes = from ? breakingFor(breaking, from, target, text) : { total: 0, touching: [] };

	return {
		package: PACKAGE,
		from,
		to: target,
		pinned,
		notRaised,
		lockfiles,
		fixed: { total: session.fixed, files: session.fixedFiles, byRule: fixedByRule, references: session.references?.fixed ?? 0, stillNamed: session.references?.remaining ?? [] },
		files: session.files,
		work: [...work.values()].sort(bySize),
		undecided: [...undecided.values()].sort(bySize),
		standing: [...standing.values()].sort(bySize),
		unread,
		breaking: { total: changes.total, touching: changes.touching },
		types: { projects: types.projects(), without: types.without() },
	};
}
