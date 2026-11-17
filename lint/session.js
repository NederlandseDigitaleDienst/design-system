/**
 * What `nldd lint` checks in a project, without the command line around it:
 * which files it reads, which of them need a parser, the tokens the project
 * declares itself, and the fixes. The CLI parses its arguments, calls this and
 * formats what comes back; scripts/lint-corpus.js calls it the same way, so the
 * corpus measures the linter consumers run.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { extname, relative, resolve, sep } from 'node:path';
import { applyFixes, linesNaming, renameReferences } from './fix.js';
import { BUILT_IN_RULES, GROUPS, OPT_IN_GROUPS } from './rule-data.js';
import { DEFAULT_EXTENSIONS, findFiles, IGNORED_DIRECTORIES, isBundle, isRelevant, projectTokens, REFERENCE_EXTENSIONS, STYLESHEET_EXTENSIONS } from './project.js';

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

const MAX_FIX_PASSES = 10;

/** One fix can open the way for the next: a renamed tag has rules of its own. */
async function fixUntilStable(linter, original, filename) {
	let source = original;
	let fixed = 0;
	const renamedTags = new Map();
	for (let pass = 0; pass < MAX_FIX_PASSES; pass++) {
		const { findings } = await linter.lintSource(source, filename);
		const change = applyFixes(source, findings);
		if (change.fixed === 0) return { source, fixed, renamedTags, findings };
		source = change.source;
		fixed += change.fixed;
		for (const [from, to] of change.renamedTags) renamedTags.set(from, to);
	}
	return { source, fixed, renamedTags, findings: (await linter.lintSource(source, filename)).findings };
}

/** The tag is gone from the markup; what still names it would break or stop matching. */
function fixReferences(renamedTags, paths, root, exclude) {
	const isBuilt = (file) => relative(root, file).split(sep).some((part) => IGNORED_DIRECTORIES.has(part));
	const inMarkup = findFiles(paths, root, exclude);
	const elsewhere = findFiles(paths, root, exclude, REFERENCE_EXTENSIONS).filter((file) => REFERENCE_EXTENSIONS.includes(extname(file)) && !inMarkup.includes(file));
	let fixed = 0;
	let files = 0;
	const remaining = [];
	const kindOf = (file) => (/\.(css|scss|less)$/.test(file) ? 'styles' : /\.[cm]?[jt]s$/.test(file) || !inMarkup.includes(file) ? 'script' : 'markup');
	for (const list of [inMarkup, elsewhere]) {
		for (const filename of list.filter((file) => !/\.min\.[cm]?js$/.test(file))) {
			const source = readFileSync(filename, 'utf8');
			const change = isBuilt(filename) ? { source, fixed: 0 } : renameReferences(source, renamedTags, kindOf(filename));
			if (change.fixed > 0 && isUtf8(filename)) {
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
 * @returns {Promise<{ results: object[], files: number, fixed: number, fixedFiles: number,
 *   notUtf8: string[], references?: { fixed: number, files: number, remaining: string[] } }>}
 */
export async function lintProject(data, { root, paths = [], config = {}, severities, input, fix = false, keep = () => false }) {
	const everything = readsEverything(data, severities);
	const inputs = input
		? [{ filename: resolve(root, input.filename), source: input.source }]
		: findFiles(paths, root, config.exclude, [...DEFAULT_EXTENSIONS, ...STYLESHEET_EXTENSIONS])
				.map((filename) => ({ filename, source: readFileSync(filename, 'utf8') }))
				.filter(({ filename, source }) => !isBundle(filename, source));

	// Most files in an app use no component at all, and those need no parser either.
	// A stylesheet is still read for the tokens it declares.
	const isStylesheet = (filename) => STYLESHEET_EXTENSIONS.includes(extname(filename));
	const relevant = everything ? inputs : inputs.filter((one) => isRelevant(one, { wrappers: config.wrappers, keep }));
	const files = everything ? inputs.length : inputs.filter(({ filename }) => !isStylesheet(filename)).length + relevant.filter(({ filename }) => isStylesheet(filename)).length;

	const results = [];
	const notUtf8 = [];
	const renamedTags = new Map();
	let fixed = 0;
	let fixedFiles = 0;
	if (relevant.length > 0) {
		const { createLinter } = await import('./linter.js');
		const linter = createLinter(data, { wrappers: config.wrappers, severities, projectTokens: projectTokens(inputs) });
		for (const { filename, source } of relevant) {
			const canWrite = fix && isUtf8(filename);
			if (fix && !canWrite) notUtf8.push(filename);
			if (!canWrite) {
				results.push({ filename, source, ...(await linter.lintSource(source, filename)) });
				continue;
			}
			const change = await fixUntilStable(linter, source, filename);
			if (change.fixed > 0) {
				writeFileSync(filename, change.source);
				fixed += change.fixed;
				fixedFiles += 1;
				for (const [from, to] of change.renamedTags) renamedTags.set(from, to);
			}
			results.push({ filename, source: change.source, findings: change.findings });
		}
	}
	const references = renamedTags.size > 0 ? fixReferences(renamedTags, paths, root, config.exclude) : undefined;
	return { results, files, fixed, fixedFiles, notUtf8, references };
}
