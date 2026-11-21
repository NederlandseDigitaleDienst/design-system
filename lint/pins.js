/**
 * Where a project names the version of the package, and how to raise it there.
 *
 * A pin is known by what it is, not by where it stands: the name of the package
 * as a key in JSON, `@version` behind the name, the address of the tarball, and
 * an object that says it is about the package and has a `version`. A new place
 * is a function here.
 *
 * A version next to a hash changes with that hash or not at all.
 */

import { basename, extname } from 'node:path';

export const PACKAGE = '@nldd/design-system';

const VERSION = /^\d+\.\d+\.\d+$/;

/** Negative when `a` is the older one. Only plain `x.y.z`: a prerelease is no upgrade target. */
export function compareVersions(a, b) {
	const [left, right] = [a, b].map((version) => version.split('.').map(Number));
	return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

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

/** Where a project can name the version, besides its manifests. */
export const PIN_EXTENSIONS = ['.json', '.yml', '.yaml', '.toml', '.html', '.htm', '.md', '.mdx', '.py', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue', '.astro', '.j2', '.jinja', '.jinja2', '.sh', '.txt'];

/** Written by a package manager or a release, not by hand: the first follows the manifest, the second is history. */
export const NOT_A_PIN = /^(package-lock\.json|npm-shrinkwrap\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lock|changelog.*)$/i;
