/**
 * Checks that every component lists its attributes in the canonical control
 * order of the component skill (.claude/skills/component/SKILL.md, "Canonieke
 * control volgorde"): the `@attr` block in its JSDoc and its `@property`
 * declarations. The website shows the controls in the order of the
 * declarations, so that order is what a reader of the page sees.
 *
 * Properties without an attribute and those of a mixin are left out: only
 * what a component declares itself, with an attribute, has a place.
 *
 * Usage: node scripts/check-control-order.js [path…]
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/** The canon as one list of names, the groups one after the other. */
export function readCanon() {
	const skill = readFileSync(join(root, '.claude/skills/component/SKILL.md'), 'utf8');
	const start = skill.indexOf('[1. Visueel dominant]');
	if (start < 0) throw new Error('The canon is gone from .claude/skills/component/SKILL.md: no "[1. Visueel dominant]".');
	const block = skill.slice(start, skill.indexOf('```', start));
	const names = [];
	for (const line of block.split('\n')) {
		if (line.startsWith('[')) continue;
		for (const word of line.split(/[\s,+]+/)) if (/^[a-z][A-Za-z0-9]*$/.test(word)) names.push(word);
	}
	if (names.length < 100) throw new Error(`The canon in .claude/skills/component/SKILL.md has ${names.length} names; it could not be read.`);
	return names;
}

/** Where a name goes: its place in the canon; the breakpoint paddings after their group. */
function rankOf(canon, name) {
	// `fetchpriority` is spelled as the native attribute.
	const at = canon.findIndex((entry) => entry.toLowerCase() === name.toLowerCase());
	if (at >= 0) return at;
	const padding = name.match(/^(sm|md|lg)(Padding.*)$/);
	if (padding) {
		const base = canon.indexOf('paddingLeft');
		const sides = ['Padding', 'PaddingInline', 'PaddingBlock', 'PaddingTop', 'PaddingRight', 'PaddingBottom', 'PaddingLeft'];
		return base + 0.01 * (['sm', 'md', 'lg'].indexOf(padding[1]) * 10 + sides.indexOf(padding[2]) + 1);
	}
	if (name === 'translations') return canon.length;
	return -1;
}

/** Per `@element` in the JSDoc, the attribute names of its `@attr` lines. */
export function attrOrders(source) {
	const lists = [];
	for (const doc of source.match(/\/\*\*[\s\S]*?\*\//g) ?? []) {
		for (const part of doc.split(/@element\s/).slice(1)) {
			lists.push([...part.matchAll(/@attr\s+\{[^}]*\}\s+\[?([a-z][\w-]*)/g)].map((m) => camel(m[1])));
		}
	}
	return lists;
}

/** The text between the parentheses that open at `start`, nested ones included. */
function balanced(source, start) {
	let depth = 0;
	for (let i = start; i < source.length; i++) {
		if (source[i] === '(') depth++;
		else if (source[i] === ')' && --depth === 0) return source.slice(start + 1, i);
	}
	return '';
}

/** Per class, the attribute names of its `@property` declarations, in source order. */
export function propertyOrders(source) {
	return source.split(/^(?:export\s+)?(?:abstract\s+)?class\s/m).slice(1).map((body) => {
		const names = [];
		for (const m of body.matchAll(/@property\(/g)) {
			const options = balanced(body, m.index + m[0].length - 1);
			const rest = body.slice(m.index + m[0].length + options.length + 1);
			const field = rest.match(/^\s*(?:(?:public|protected|private|override|declare|readonly|accessor|get|set)\s+)*([A-Za-z_$][\w$]*)/);
			if (!field || /attribute:\s*false/.test(options)) continue;
			const named = options.match(/attribute:\s*['"]([^'"]+)['"]/);
			names.push(named ? camel(named[1]) : field[1]);
		}
		return names;
	});
}

/** The first pair of names out of order, or null. Unknown names are reported apart. */
export function firstViolation(canon, names, component) {
	const ranked = names.map((name, i) => ({ name, rank: rankIn(canon, names, i, component) }));
	const unknown = ranked.filter((r) => r.rank < 0).map((r) => r.name);
	const known = ranked.filter((r) => r.rank >= 0);
	for (let i = 1; i < known.length; i++) {
		if (known[i].rank < known[i - 1].rank) return { unknown, before: known[i - 1].name, after: known[i].name };
	}
	return unknown.length ? { unknown } : null;
}

/**
 * Names that mean something else in one component, and the name they go after.
 * The `max` of avatar-group decides how many avatars show: a group 1 choice.
 */
const MEANINGS = {
	'avatar-group': { max: 'size' },
	// The name of a person or organization is the content the initials come from.
	avatar: { name: 'text' },
	// The length and format of a code decide how many boxes there are and how they group.
	'one-time-code-field': { length: 'status', format: 'status' },
};

/** A `max` right after `number` caps how that number shows, and keeps its place (badge). */
function rankIn(canon, names, i, component) {
	const after = MEANINGS[component]?.[names[i]];
	if (after) return rankOf(canon, after) + 0.5;
	if (names[i] === 'max' && names[i - 1] === 'number') return rankOf(canon, 'number') + 0.5;
	return rankOf(canon, names[i]);
}

export function expectedOrder(canon, names, component) {
	const ranks = new Map(names.map((name, i) => [name, rankIn(canon, names, i, component)]));
	return [...names].sort((a, b) => ranks.get(a) - ranks.get(b));
}

let canonCache;

/**
 * Items in the canonical order of their attribute names, for a list that does
 * not come from the declarations, such as the manifest: it puts what a mixin
 * adds after the component's own attributes. Names outside the canon go last.
 */
export function sortByCanon(items, nameOf, component) {
	canonCache ??= readCanon();
	const canon = canonCache;
	const names = items.map((item) => camel(nameOf(item)));
	const rank = (i) => {
		const r = rankIn(canon, names, i, component);
		return r < 0 ? canon.length + 1 : r;
	};
	return items.map((item, i) => ({ item, r: rank(i), i })).sort((a, b) => a.r - b.r || a.i - b.i).map(({ item }) => item);
}

function componentFiles(dir) {
	const out = [];
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) out.push(...componentFiles(path));
		else if (/\.ts$/.test(entry) && !/\.(test|stories|styles|template|i18n)\.ts$/.test(entry)) {
			const source = readFileSync(path, 'utf8');
			if (/@element\s+nldd-/.test(source)) out.push(path);
		}
	}
	return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const canon = readCanon();
	const targets = process.argv.slice(2);
	const files = (targets.length ? targets : ['src/components']).flatMap((t) => {
		const path = join(root, t);
		return statSync(path).isDirectory() ? componentFiles(path) : [path];
	});
	let failures = 0;
	for (const file of files) {
		const source = readFileSync(file, 'utf8');
		const problems = [];
		for (const [what, names] of [
			...attrOrders(source).map((names) => ['@attr', names]),
			...propertyOrders(source).map((names) => ['@property', names]),
		]) {
			const component = basename(file, '.ts');
			const v = firstViolation(canon, names, component);
			if (!v) continue;
			if (v.unknown?.length) problems.push(`${what}: not in the canon: ${v.unknown.join(', ')}`);
			if (v.before) problems.push(`${what}: ${v.after} goes before ${v.before}; expected ${expectedOrder(canon, names.filter((n) => rankOf(canon, n) >= 0), component).join(', ')}`);
		}
		if (problems.length) {
			failures += 1;
			console.log(`${relative(root, file)}\n  ${problems.join('\n  ')}`);
		}
	}
	console.log(failures ? `\n${failures} of ${files.length} components out of order.` : `${files.length} components in canonical order.`);
	process.exitCode = failures ? 1 : 0;
}
