/** The `nldd` command, started from cli.js. */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { applyFixes, linesNaming, renameReferences } from './fix.js';
import { formatGithub, formatJson, formatStatistics, formatText } from './format.js';
import { BUILT_IN_RULES, createCanonical, loadData, GROUPS, OPT_IN_GROUPS, resolveSeverities } from './rule-data.js';
import { rulesAboutTag } from './rule-index.js';
import { applyBaseline, DEFAULT_EXTENSIONS, looseInBaseline, tightenBaseline, findFiles, IGNORED_DIRECTORIES, readBaseline, readConfig, REFERENCE_EXTENSIONS, STYLESHEET_EXTENSIONS, writeBaseline } from './project.js';

const USAGE = `Usage:
  nldd lint [paths...]              check files; without paths, the whole project
    --format text|json|github       default: text
    --fix                           apply the fixes that are certain: what only got another name
    --pure                          also check that everything comes from the system: no class,
                                    style, plain HTML or stylesheet of your own (the group pure)
    --update-baseline               accept what is there now, report only new findings
    --tighten-baseline              lower the baseline to what is still there; never raises it
    --max-warnings <n>              exit 1 above this number of warnings
    --select <groups or rules>      only these, comma separated
    --ignore <groups or rules>      all but these
    --statistics                    count per rule instead of listing every finding
    --stdin --filename <name>       check a snippet instead of files
  nldd explain <rule>               what a rule checks, and why
  nldd rules [--for <tag>] [--group <group>] [--json]
                                    list the rules, or those about one component or group
                                    groups: api, a11y, copy, structure, pattern, pure (opt-in)
`;

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function findRule(data, id) {
	const rule = data.rules.find((r) => r.id === id || r.aliases?.includes(id));
	if (rule) return rule;
	return BUILT_IN_RULES[id] ? { id, group: 'api', ...BUILT_IN_RULES[id], message: BUILT_IN_RULES[id].description } : undefined;
}

function explain(data, id) {
	const rule = findRule(data, id);
	if (!rule) {
		console.error(`Unknown rule: ${id}`);
		return 2;
	}
	const lines = [`${rule.id}  (${rule.group}, ${rule.severity})`, '', rule.message];
	if (rule.url) lines.push('', `Why: ${rule.url}`);
	if (rule.runtime) lines.push('', 'Only the running page can tell, so this runs in the browser while developing.');
	if (rule.examples) {
		lines.push('', 'Fine:', ...rule.examples.passed.map((example) => `  ${example}`));
		lines.push('', 'Wrong:', ...rule.examples.failed.map((example) => `  ${example}`));
	}
	console.log(lines.join('\n'));
	return 0;
}

function listRules(data, { tag, group, json }) {
	if (group && !GROUPS.includes(group)) throw new Error(`Unknown group: ${group}. Use one of ${GROUPS.join(', ')}.`);
	const rules = (tag ? rulesAboutTag(data.rules, tag) : data.rules).filter((rule) => !group || rule.group === group);
	if (json) console.log(JSON.stringify(rules, null, 2));
	else for (const rule of rules) console.log(`${rule.id}  (${rule.group}, ${rule.severity})  ${rule.message}`);
	return 0;
}

/** Walks up, so a package in a monorepo finds the version hoisted to the root. */
function installedVersion(directory) {
	for (;;) {
		const path = join(directory, 'node_modules/@nldd/design-system/package.json');
		if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8')).version;
		const parent = dirname(directory);
		if (parent === directory) return undefined;
		directory = parent;
	}
}

/**
 * The linter knows the API of its own version, so a project's own `nldd` is always
 * right. A newer one, through `npx @nldd/design-system@latest`, is how you see what
 * an upgrade will break: useful, as long as it is clear that is what you are looking at.
 */
function noteOtherVersion(root) {
	const installed = installedVersion(root);
	if (installed && installed !== pkg.version) {
		console.error(`Checking against ${pkg.version}, and this project has ${installed}: findings say what changes on upgrading.`);
	}
}

/** Writing back what was read as UTF-8 would destroy any other encoding. */
function isUtf8(filename) {
	const bytes = readFileSync(filename);
	return bytes.equals(Buffer.from(bytes.toString('utf8')));
}

/** The tag is gone from the markup; what still names it would break or stop matching. */
function fixReferences(renamedTags, paths, root, exclude) {
	const isBuilt = (file) => relative(root, file).split(sep).some((part) => IGNORED_DIRECTORIES.has(part));
	const inMarkup = findFiles(paths, root, exclude);
	const elsewhere = findFiles(paths, root, exclude, REFERENCE_EXTENSIONS).filter((file) => REFERENCE_EXTENSIONS.includes(extname(file)));
	let fixed = 0;
	let files = 0;
	const remaining = [];
	const kindOf = (file) => (inMarkup.includes(file) ? 'markup' : /\.(css|scss|less)$/.test(file) ? 'styles' : 'script');
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

async function runLint(data, paths, options) {
	if (!/^\d+$/.test(options['max-warnings'] ?? '0')) throw new Error('--max-warnings takes a whole number, 0 or more.');
	const formatName = options.format ?? 'text';
	const chosen = { text: formatText, json: formatJson, github: formatGithub }[formatName];
	if (!chosen) throw new Error(`Unknown format: ${formatName}`);
	if (options.statistics && formatName !== 'text') throw new Error('--statistics is plain text, so it takes no --format.');
	for (const flag of ['update-baseline', 'tighten-baseline']) {
		if (options[flag] && (options.select || options.ignore)) {
			throw new Error(`--${flag} takes no --select or --ignore: it would forget every finding outside them.`);
		}
	}
	if (options['update-baseline'] && options['tighten-baseline']) throw new Error('Choose --update-baseline or --tighten-baseline.');
	if (options['tighten-baseline'] && options.stdin) throw new Error('--tighten-baseline reads the project, so it takes no --stdin.');
	const root = process.cwd();
	const started = performance.now();
	if (options.fix && (options.stdin || options['update-baseline'])) {
		throw new Error('--fix writes files, so it takes no --stdin or --update-baseline.');
	}
	const known = new Set([...data.rules.flatMap((r) => [r.id, ...(r.aliases ?? [])]), ...Object.keys(BUILT_IN_RULES), ...GROUPS]);
	const list = (value) => value?.split(',').map((key) => key.trim());
	const select = list(options.select);
	const ignore = list(options.ignore);
	for (const key of [...(select ?? []), ...(ignore ?? [])]) {
		if (!known.has(key)) throw new Error(`Unknown rule or group: ${key}`);
	}
	const config = readConfig(root, known);
	noteOtherVersion(root);
	const canonical = createCanonical(data);

	const severities = resolveSeverities(data, config.rules, { select, ignore, optIn: options.pure ? OPT_IN_GROUPS : [] });
	// An app that is to be pure has to be read in full: a file without a single component
	// is the least pure of all, and a stylesheet is one too.
	const pure = data.rules.some((rule) => OPT_IN_GROUPS.includes(rule.group) && severities[rule.id] !== 'off');
	const extensions = pure ? [...DEFAULT_EXTENSIONS, ...STYLESHEET_EXTENSIONS] : DEFAULT_EXTENSIONS;

	const inputs = options.stdin
		? [{ filename: resolve(root, options.filename ?? 'stdin.html'), source: readFileSync(0, 'utf8') }]
		: findFiles(paths, root, config.exclude, extensions).map((filename) => ({
				filename,
				source: readFileSync(filename, 'utf8'),
			}));

	// Most files in an app use no component at all, and those need no parser either.
	// Tightening has to see every file the baseline names, also one without a component left.
	const inBaseline = options['tighten-baseline'] ? new Set(Object.keys(readBaseline(root, canonical))) : new Set();
	const relevant = pure ? inputs : inputs.filter(({ filename, source }) => /nldd-|Nldd/.test(source) || config.wrappers || inBaseline.has(relative(root, filename)));
	const results = [];
	let fixed = 0;
	let fixedFiles = 0;
	const renamedTags = new Map();
	if (relevant.length > 0) {
		const { createLinter } = await import('./linter.js');
		const linter = createLinter(data, { wrappers: config.wrappers, severities });
		for (const { filename, source } of relevant) {
			const canWrite = options.fix && isUtf8(filename);
			if (options.fix && !canWrite) console.error(`Skipped ${relative(root, filename)}: it is not UTF-8.`);
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
	if (options.fix) console.error(`Fixed ${fixed} in ${fixedFiles} of ${inputs.length} files.`);
	if (renamedTags.size > 0) {
		const references = fixReferences(renamedTags, paths, root, config.exclude);
		if (references.fixed > 0) console.error(`Renamed ${references.fixed} imports, classes and selectors of old tags in ${references.files} files.`);
		for (const place of references.remaining) console.error(`Still names an old tag: ${place}`);
		if (paths.some((path) => resolve(root, path) !== root)) {
			console.error('Only in the paths you named: run it without paths to reach the rest of the project.');
		}
	}

	// What a rule that did not run accepted stays accepted: one that is off, or the
	// group pure in a run without it.
	const ran = (id) => severities[id] !== 'off' && (!OPT_IN_GROUPS.includes(findRule(data, id)?.group) || Boolean(severities[id]));
	if (options['tighten-baseline']) {
		const dropped = tightenBaseline(results, root, canonical, ran);
		console.log(dropped === undefined ? 'No baseline to tighten.' : `Baseline tightened: ${dropped} fewer findings accepted.`);
		return 0;
	}
	if (options['update-baseline']) {
		writeBaseline(results, root, canonical, ran);
		const accepted = results.flatMap(({ findings }) => findings).filter(({ severity }) => severity !== 'hint').length;
		console.log(`Baseline updated: ${accepted} findings accepted.`);
		return 0;
	}

	const baseline = readBaseline(root, canonical);
	let skipped = 0;
	const reported = results.map((result) => {
		const fresh = applyBaseline(result.filename, result.findings, baseline, root);
		skipped += result.findings.length - fresh.length;
		return { ...result, findings: fresh };
	});

	const context = {
		root,
		files: inputs.length,
		ms: Math.round(performance.now() - started),
		skipped,
		loose: looseInBaseline(results, baseline, root, ran),
		explainRule: (id) => findRule(data, id),
	};
	const format = options.statistics ? formatStatistics : chosen;
	const output = format(reported, context);
	if (output) console.log(output);

	const all = reported.flatMap((result) => result.findings);
	const errors = all.filter((finding) => finding.severity === 'error').length;
	const warnings = all.filter((finding) => finding.severity === 'warn').length;
	const tooManyWarnings =
		options['max-warnings'] !== undefined && warnings > Number(options['max-warnings']);
	return errors > 0 || tooManyWarnings ? 1 : 0;
}

async function main() {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
			format: { type: 'string' },
			'update-baseline': { type: 'boolean' },
			'tighten-baseline': { type: 'boolean' },
			'max-warnings': { type: 'string' },
			stdin: { type: 'boolean' },
			filename: { type: 'string' },
			for: { type: 'string' },
			group: { type: 'string' },
			select: { type: 'string' },
			ignore: { type: 'string' },
			statistics: { type: 'boolean' },
			fix: { type: 'boolean' },
			pure: { type: 'boolean' },
			json: { type: 'boolean' },
			version: { type: 'boolean', short: 'v' },
			help: { type: 'boolean', short: 'h' },
		},
	});
	if (values.version) {
		console.log(pkg.version);
		return 0;
	}
	const [command, ...rest] = positionals;
	if (values.help || !command) {
		console.log(USAGE);
		return command || values.help ? 0 : 2;
	}
	const data = loadData();
	if (command === 'lint') return runLint(data, rest, values);
	if (command === 'explain' && rest[0]) return explain(data, rest[0]);
	if (command === 'rules') return listRules(data, { tag: values.for, group: values.group, json: values.json });
	console.error(USAGE);
	return 2;
}

main().then(
	(code) => {
		process.exitCode = code;
	},
	(error) => {
		console.error(error.message);
		process.exitCode = 2;
	},
);
