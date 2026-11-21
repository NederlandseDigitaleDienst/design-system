/**
 * What `nldd lint` checks in a project, without the command line around it:
 * which files it reads, which of them need a parser, the tokens the project
 * declares itself, and the fixes. The CLI parses its arguments, calls this and
 * formats what comes back; scripts/lint-corpus.js calls it the same way, so the
 * corpus measures the linter consumers run.
 */

import { lstatSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, relative, resolve, sep } from 'node:path';
import { applyFixes, linesNaming, renameReferences } from './fix.js';
import { BUILT_IN_RULES, GROUPS, OPT_IN_GROUPS } from './rule-data.js';
import { DEFAULT_EXTENSIONS, findFiles, IGNORED_DIRECTORIES, MARKDOWN_EXTENSIONS, STRING_EXTENSIONS, partialExcludes, isBundle, isRelevant, projectTokens, REFERENCE_EXTENSIONS, SCRIPT_EXTENSIONS, STYLESHEET_EXTENSIONS, UNREAD_EXTENSIONS } from './project.js';

/** Every name `--select`, `--ignore` and .nldd-lint.json may use: rule ids, aliases and groups. */
export function knownKeys(data) {
	return new Set([...data.rules.flatMap((rule) => [rule.id, ...(rule.aliases ?? [])]), ...Object.keys(BUILT_IN_RULES), ...GROUPS]);
}

/** Whether an opt-in group runs: then every file is read, stylesheets and files without a component too. */
export function readsEverything(data, severities) {
	return data.rules.some((rule) => OPT_IN_GROUPS.includes(rule.group) && severities[rule.id] !== 'off');
}

/** Writing back what was read as UTF-8 would destroy any other encoding. */
export function isUtf8(filename) {
	const bytes = readFileSync(filename);
	return bytes.equals(Buffer.from(bytes.toString('utf8')));
}

/** Writing through a link would change a file somewhere else, maybe outside the project. */
const isSymlink = (filename) => lstatSync(filename, { throwIfNoEntry: false })?.isSymbolicLink() ?? false;

const MAX_FIX_PASSES = 10;

/**
 * One fix can open the way for the next: a renamed tag has rules of its own.
 * `unstable` says the passes ran out with fixes still to apply.
 */
export async function fixUntilStable(linter, original, filename, options) {
	let source = original;
	let fixed = 0;
	const byRule = {};
	const renamedTags = new Map();
	for (let pass = 0; pass < MAX_FIX_PASSES; pass++) {
		const { findings, undecided } = await linter.lintSource(source, filename, options);
		const change = applyFixes(source, findings);
		if (change.fixed === 0) return { source, fixed, byRule, renamedTags, findings, undecided, unstable: false };
		source = change.source;
		fixed += change.fixed;
		for (const [rule, count] of Object.entries(change.byRule)) byRule[rule] = (byRule[rule] ?? 0) + count;
		for (const [from, to] of change.renamedTags) renamedTags.set(from, to);
	}
	const { findings, undecided } = await linter.lintSource(source, filename, options);
	return { source, fixed, byRule, renamedTags, findings, undecided, unstable: applyFixes(source, findings).fixed > 0 };
}

const isUnread = (filename) => UNREAD_EXTENSIONS.includes(extname(filename));
const hasOurMarkup = (source) => /<nldd-[a-z]/.test(source);

/** In a directory a build writes to, such as `dist`: output, not the app's own source. */
const isBuilt = (file, root) => relative(root, file).split(sep).some((part) => IGNORED_DIRECTORIES.has(part));

/**
 * A script a bundler wrote. Its chunks hold the design system's own component
 * styles and markup in strings, which read as an app overriding them. The pages
 * and stylesheets next to it are what a build has to show.
 */
const isBuiltScript = (file, root) => /\.[cm]?js$/.test(file) && isBuilt(file, root);

/** The tag is gone from the markup; what still names it would break or stop matching. */
function fixReferences(renamedTags, paths, root, exclude) {
	const inMarkup = findFiles(paths, root, exclude);
	const elsewhere = findFiles(paths, root, exclude, REFERENCE_EXTENSIONS).filter((file) => REFERENCE_EXTENSIONS.includes(extname(file)) && !inMarkup.includes(file));
	let fixed = 0;
	let files = 0;
	const remaining = [];
	const kindOf = (file) => (/\.(css|scss|less)$/.test(file) ? 'styles' : /\.[cm]?[jt]s$/.test(file) || !inMarkup.includes(file) ? 'script' : 'markup');
	for (const list of [inMarkup, elsewhere]) {
		for (const filename of list) {
			const source = readFileSync(filename, 'utf8');
			// The lint pass skips a bundle, so a rename leaves it alone too.
			if (isBundle(filename, source)) continue;
			const change = isBuilt(filename, root) ? { source, fixed: 0 } : renameReferences(source, renamedTags, kindOf(filename));
			if (change.fixed > 0 && !isSymlink(filename) && isUtf8(filename)) {
				writeFileSync(filename, change.source);
				fixed += change.fixed;
				files += 1;
			}
			for (const line of linesNaming(change.source, renamedTags)) remaining.push(`${relative(root, filename)}:${line}`);
		}
	}
	return { fixed, files, remaining };
}

/**
 * @param {object} data - the rule data, from loadData()
 * @param {object} options
 * @param {string} options.root - the project, for config-relative paths and the baseline
 * @param {string[]} [options.paths] - what to check; none is the whole project
 * @param {{ wrappers?: object, exclude?: string[] }} [options.config] - from .nldd-lint.json
 * @param {object} options.severities - from resolveSeverities()
 * @param {{ filename: string, source: string }} [options.input] - one snippet instead of files
 * @param {boolean} [options.fix] - write the fixes that are certain
 * @param {(filename: string) => boolean} [options.keep] - read this file even without a component
 * @param {boolean} [options.markdown] - a scan also reads Markdown and MDX, for the markup they render
 * @param {Function} [options.types] - from createTypes(): what the project's types say an expression in JSX renders
 * @param {(rule: object) => boolean} [options.undecided] - the rules whose undecided places each result lists
 * @returns {Promise<{ results: object[], files: number, unread: number, fixed: number, fixedFiles: number, fixedByRule: Record<string, number>,
 *   notUtf8: string[], symlinks: string[], unstable: string[], partialExcludes: { entry: string, file: string }[], references?: { fixed: number, files: number, remaining: string[] } }>}
 */
export async function lintProject(data, { root, paths = [], config = {}, severities, input, fix = false, keep = () => false, markdown = false, undecided, types }) {
	const everything = readsEverything(data, severities);
	const scanned = [...DEFAULT_EXTENSIONS, ...STYLESHEET_EXTENSIONS, ...UNREAD_EXTENSIONS, ...SCRIPT_EXTENSIONS, ...STRING_EXTENSIONS, ...(markdown ? MARKDOWN_EXTENSIONS : [])];
	const inStrings = (filename) => STRING_EXTENSIONS.includes(extname(filename));
	// Markdown a scan found is read for what it renders. One that is named is read in full, examples too.
	const scannedMarkdown = (filename) => MARKDOWN_EXTENSIONS.includes(extname(filename)) && !named.has(resolve(filename));
	// A script named on the command line is read, also in `dist`: only a scan skips it.
	const named = new Set(paths.map((path) => resolve(root, path)).filter((path) => statSync(path, { throwIfNoEntry: false })?.isFile()));
	const inputs = input
		? [{ filename: resolve(root, input.filename), source: input.source }]
		: findFiles(paths, root, config.exclude, scanned)
				.filter((filename) => named.has(resolve(filename)) || !isBuiltScript(filename, root))
				.map((filename) => ({ filename, source: readFileSync(filename, 'utf8') }))
				// A template the linter cannot read matters only with our markup; the rest is let go.
				.filter(({ filename, source }) => !(isUnread(filename) || inStrings(filename)) || hasOurMarkup(source))
				.filter(({ filename, source }) => !isBundle(filename, source));

	// Most files in an app use no component at all, and those need no parser either.
	// A stylesheet is still read for the tokens it declares.
	const isStylesheet = (filename) => STYLESHEET_EXTENSIONS.includes(extname(filename));
	// A script found by the scan is read only for a listener on a renamed event; one named on the command line is read in full.
	const removedEvents = Object.keys(data.removedEvents ?? {});
	const events = removedEvents.length > 0 ? new RegExp(removedEvents.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')) : undefined;
	const eventsOnly = (filename) => SCRIPT_EXTENSIONS.includes(extname(filename)) && !named.has(resolve(filename));
	const relevant = (everything ? inputs : inputs.filter((one) => isRelevant(one, { wrappers: config.wrappers, keep, events })))
		.filter((one) => !eventsOnly(one.filename) || events?.test(one.source));
	// A file without a parser was opened and not checked, so it does not count as one.
	const checked = inputs.filter(({ filename }) => !isUnread(filename));
	const countsWhenRelevant = (filename) => isStylesheet(filename) || eventsOnly(filename);
	const files = everything
		? checked.filter(({ filename }) => !eventsOnly(filename)).length + relevant.filter(({ filename }) => eventsOnly(filename)).length
		: checked.filter(({ filename }) => !countsWhenRelevant(filename)).length + relevant.filter(({ filename }) => countsWhenRelevant(filename)).length;

	const results = [];
	const notUtf8 = [];
	const symlinks = [];
	const unstable = [];
	const renamedTags = new Map();
	let fixed = 0;
	let fixedFiles = 0;
	const fixedByRule = {};
	if (relevant.length > 0) {
		const { createLinter } = await import('./linter.js');
		const linter = createLinter(data, { wrappers: config.wrappers, severities, projectTokens: projectTokens(inputs), undecided, types });
		for (const { filename, source } of relevant) {
			const options = eventsOnly(filename) ? { only: 'events' } : scannedMarkdown(filename) ? { rendered: true } : undefined;
			const linked = fix && isSymlink(filename);
			const canWrite = fix && !linked && isUtf8(filename);
			if (linked) symlinks.push(filename);
			else if (fix && !canWrite) notUtf8.push(filename);
			if (!canWrite) {
				results.push({ filename, source, ...(await linter.lintSource(source, filename, options)) });
				continue;
			}
			const change = await fixUntilStable(linter, source, filename, options);
			if (change.unstable) unstable.push(filename);
			if (change.fixed > 0) {
				writeFileSync(filename, change.source);
				fixed += change.fixed;
				fixedFiles += 1;
				for (const [rule, count] of Object.entries(change.byRule)) fixedByRule[rule] = (fixedByRule[rule] ?? 0) + count;
				for (const [from, to] of change.renamedTags) renamedTags.set(from, to);
			}
			results.push({ filename, source: change.source, findings: change.findings, undecided: change.undecided });
		}
	}
	const references = renamedTags.size > 0 ? fixReferences(renamedTags, paths, root, config.exclude) : undefined;
	// Not in `files`: what has our markup and was not read, so the summary can say so.
	// Counted on the markup, so a suppressed `file-not-read` does not make it read.
	const unread = inputs.filter(({ filename, source }) => isUnread(filename) && hasOurMarkup(source)).length;
	const partial = input ? [] : partialExcludes(paths, root, config.exclude, scanned);
	return { results, files, unread, fixed, fixedFiles, fixedByRule, notUtf8, symlinks, unstable, partialExcludes: partial, references };
}
