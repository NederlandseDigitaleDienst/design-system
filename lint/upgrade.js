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

const DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

/** `^0.13.2`, `~0.13.2` or `0.13.2`: a range this can raise and keep its meaning. */
const SIMPLE_RANGE = /^([\^~]?)(\d+\.\d+\.\d+)$/;

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const lineOf = (source, offset) => source.slice(0, offset).split('\n').length;

/** A manifest: the range of the dependency, in each section that has it. */
function manifestPins(source) {
	let manifest;
	try {
		manifest = JSON.parse(source);
	} catch {
		return { edits: [], left: [] };
	}
	const edits = [];
	const left = [];
	for (const section of DEPENDENCY_SECTIONS) {
		const range = manifest?.[section]?.[PACKAGE];
		if (typeof range !== 'string') continue;
		const simple = SIMPLE_RANGE.exec(range);
		const written = new RegExp(`("${escapeRegExp(PACKAGE)}"\\s*:\\s*")${escapeRegExp(range)}"`).exec(source);
		// `workspace:*`, a tag, a git address, `>=0.13`: the project chose something else than a version.
		if (!simple || !written) left.push({ line: written ? lineOf(source, written.index) : 1, text: `${section}: ${range}` });
		else edits.push({ kind: 'manifest', at: written.index + written[1].length, length: range.length, from: simple[2], write: (target) => simple[1] + target });
	}
	return { edits, left };
}

/** A record of the package in a JSON file of the project's own: its name (as `name` or `package`), its version, and maybe the hash of that version. */
function recordPins(source) {
	let parsed;
	try {
		parsed = JSON.parse(source);
	} catch {
		return { edits: [], left: [] };
	}
	const records = [];
	(function walk(value) {
		if (value === null || typeof value !== 'object') return;
		if ((value.name === PACKAGE || value.package === PACKAGE) && typeof value.version === 'string' && VERSION.test(value.version)) records.push(value);
		Object.values(value).forEach(walk);
	})(parsed);
	const edits = [];
	const left = [];
	for (const record of records) {
		const places = [...source.matchAll(new RegExp(`("version"\\s*:\\s*")${escapeRegExp(record.version)}"`, 'g'))];
		const hash = typeof record.integrity === 'string' ? source.indexOf(record.integrity) : -1;
		const hashIsOnce = hash >= 0 && source.indexOf(record.integrity, hash + 1) < 0;
		// Two versions written the same way, or a hash that stands twice: which one is the record's is a guess.
		if (records.length !== 1 || places.length !== 1 || (record.integrity !== undefined && !hashIsOnce)) {
			left.push({ line: places[0] ? lineOf(source, places[0].index) : 1, text: `"version": "${record.version}"` });
			continue;
		}
		const version = { kind: 'record', at: places[0].index + places[0][1].length, length: record.version.length, from: record.version, write: (target) => target };
		if (record.integrity === undefined) edits.push(version);
		// A version with the hash of another one is a broken record, so the two change together or not at all.
		else edits.push({ ...version, with: { at: hash, length: record.integrity.length } });
	}
	return { edits, left };
}

/** `@nldd/design-system@0.13.2`: a CDN address, an `npx` line in a workflow, an import map. */
function referencePins(source) {
	return [...source.matchAll(new RegExp(`${escapeRegExp(PACKAGE)}@(\\d+\\.\\d+\\.\\d+)(?![\\w.-])`, 'g'))].map((match) => ({
		kind: 'reference',
		at: match.index + PACKAGE.length + 1,
		length: match[1].length,
		from: match[1],
		write: (target) => target,
	}));
}

/**
 * Every place in one file that names the version, and what there could not be raised.
 * @returns {{ edits: object[], left: { line: number, text: string }[] }}
 */
export function pinsIn(filename, source) {
	if (!source.includes(PACKAGE)) return { edits: [], left: [] };
	const name = basename(filename);
	const own = name === 'package.json' ? manifestPins(source) : extname(name) === '.json' ? recordPins(source) : { edits: [], left: [] };
	return { edits: [...own.edits, ...referencePins(source)], left: own.left };
}

/**
 * Raises every pin in a source to `target`. A pin that is already there, or past
 * it, stays. `integrity` gives the hash of the target for a record that has one;
 * without it such a record is left as it is.
 * @returns {{ source: string, raised: { kind: string, from: string, line: number }[], left: { line: number, text: string }[] }}
 */
export function raisePins(filename, source, target, integrity) {
	const { edits, left } = pinsIn(filename, source);
	const raised = [];
	const changes = [];
	for (const edit of edits) {
		if (compareVersions(edit.from, target) >= 0) continue;
		if (edit.with && !integrity) {
			left.push({ line: lineOf(source, edit.at), text: `"version": "${edit.from}" with an integrity hash` });
			continue;
		}
		changes.push({ at: edit.at, length: edit.length, text: edit.write(target) });
		if (edit.with) changes.push({ at: edit.with.at, length: edit.with.length, text: integrity });
		raised.push({ kind: edit.kind, from: edit.from, line: lineOf(source, edit.at) });
	}
	let result = source;
	for (const { at, length, text } of changes.sort((a, b) => b.at - a.at)) result = result.slice(0, at) + text + result.slice(at + length);
	return { source: result, raised, left };
}

/** The lockfile a manifest's directory falls under, and how its package manager rewrites only that. */
const LOCKFILES = [
	['package-lock.json', () => ['npm', ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund']]],
	['pnpm-lock.yaml', () => ['pnpm', ['install', '--lockfile-only', '--ignore-scripts']]],
	['yarn.lock', (directory) => (existsSync(join(directory, '.yarnrc.yml')) ? ['yarn', ['install', '--mode', 'update-lockfile']] : ['yarn', ['install', '--ignore-scripts']])],
	['bun.lock', () => ['bun', ['install', '--lockfile-only']]],
	['bun.lockb', () => ['bun', ['install', '--lockfile-only']]],
];

export function lockfileCommand(directory, root) {
	for (let at = directory; ; at = dirname(at)) {
		for (const [name, command] of LOCKFILES) {
			if (existsSync(join(at, name))) return { directory: at, lockfile: name, command: command(at) };
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

const groupOf = (data, id) => data.rules.find((rule) => rule.id === id)?.group ?? (BUILT_IN_RULES[id] ? 'api' : undefined);

/**
 * What the upgrade certainly asks for: what no longer exists or has no effect,
 * and every error. Whether another warning is new with this version or was there
 * already, the linter cannot tell, so those are listed apart.
 */
const isWork = (data, finding) => finding.severity === 'error' || groupOf(data, finding.rule) === 'api';

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
 * @param {boolean} [options.install] - rewrite the lockfiles (default true)
 * @param {(command: string, args: string[], cwd: string) => { ok: boolean, output?: string, error?: string }} [options.run]
 * @returns {Promise<object>} what was done and what is left, as the report and the worklist read it
 */
export async function upgradeProject(data, { root, target, breaking, config, severities, canonical, install = true, run = runQuietly }) {
	// 1. The version, wherever the project names it.
	const pinned = [];
	const notRaised = [];
	const manifestDirectories = new Set();
	let integrity;
	const integrityOf = () => {
		if (integrity === undefined) {
			const asked = run('npm', ['view', `${PACKAGE}@${target}`, 'dist.integrity'], root);
			integrity = asked.ok && /^sha\d+-/.test(asked.output.trim()) ? asked.output.trim() : null;
		}
		return integrity;
	};
	for (const filename of findFiles([], root, config.exclude, PIN_EXTENSIONS)) {
		if (NOT_A_PIN.test(basename(filename))) continue;
		const source = readFileSync(filename, 'utf8');
		const found = pinsIn(filename, source);
		if (found.edits.length === 0 && found.left.length === 0) continue;
		const needsHash = found.edits.some((edit) => edit.with && compareVersions(edit.from, target) < 0);
		const change = raisePins(filename, source, target, needsHash ? integrityOf() : undefined);
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
		const lock = lockfileCommand(directory, root);
		if (!lock || seen.has(lock.directory)) continue;
		seen.add(lock.directory);
		const [command, args] = lock.command;
		const outcome = install ? run(command, args, lock.directory) : { ok: false, error: 'not run' };
		lockfiles.push({ file: relativePath(root, join(lock.directory, lock.lockfile)), command: [command, ...args].join(' '), ok: outcome.ok, error: outcome.error });
	}

	// 3. Every fix that is certain. A first pass without writing says which rules they come from.
	const lint = (fix) => lintProject(data, { root, config, severities, fix, markdown: true });
	const before = await lint(false);
	const fixedByRule = {};
	for (const finding of before.results.flatMap(({ findings }) => findings)) {
		if (finding.fix) fixedByRule[finding.rule] = (fixedByRule[finding.rule] ?? 0) + 1;
	}
	const session = await lint(true);

	// 4. What is left, without what the project accepted in its baseline.
	const baseline = readBaseline(root, canonical);
	const work = new Map();
	const other = new Map();
	const unread = [];
	for (const { filename, findings } of session.results) {
		const file = relativePath(root, filename);
		for (const finding of applyBaseline(filename, findings, baseline, root)) {
			if (finding.severity === 'hint') continue;
			if (finding.rule === 'file-not-read') unread.push(file);
			else {
				const list = isWork(data, finding) ? work : other;
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
		other: [...other.values()].sort(bySize),
		unread,
		breaking: { total: changes.total, touching: changes.touching },
	};
}
