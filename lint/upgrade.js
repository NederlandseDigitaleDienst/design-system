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

import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { lockfileCommand, runQuietly } from './lockfiles.js';
import { NOT_A_PIN, PACKAGE, PIN_EXTENSIONS, compareVersions, pinsIn, raisePins } from './pins.js';
import { BUILT_IN_RULES } from './rule-data.js';
import { applyBaseline, findFiles, readBaseline, relativePath } from './project.js';
import { lintProject } from './session.js';
import { createTypes } from './types.js';

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
	const session = await lintProject(data, { root, config, severities, fix: true, markdown: true, undecided: canBreak, types });

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
				const list = (messages.get(finding.rule)?.severity ?? finding.severity) === 'error' || brings.of(finding.rule) ? work : standing;
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
		fixed: { total: session.fixed, files: session.fixedFiles, byRule: session.fixedByRule, references: session.references?.fixed ?? 0, stillNamed: session.references?.remaining ?? [] },
		files: session.files,
		work: [...work.values()].sort(bySize),
		undecided: [...undecided.values()].sort(bySize),
		standing: [...standing.values()].sort(bySize),
		unread,
		breaking: { total: changes.total, touching: changes.touching },
		types: { projects: types.projects(), without: types.without() },
	};
}
