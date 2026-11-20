/** The `nldd` command, started from cli.js: arguments in, formatted findings out. What it checks is lint/session.js. */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { formatGithub, formatJson, formatStatistics, formatText } from './format.js';
import { BUILT_IN_RULES, createCanonical, loadData, GROUPS, OPT_IN_GROUPS, resolveSeverities } from './rule-data.js';
import { rulesAboutTag } from './rule-index.js';
import { applyBaseline, looseInBaseline, tightenBaseline, readBaseline, readConfig, relativePath, writeBaseline } from './project.js';
import { knownKeys, lintProject } from './session.js';

const USAGE = `Usage:
  nldd lint [paths...]              check files; without paths, the whole project
    --format text|json|github       default: text
    --fix                           apply the fixes that are certain: what only got another name
    --pure                          also check that everything comes from the design system: no class,
                                    style, plain HTML or stylesheet of your own (the group pure).
                                    Reads every file, stylesheets included, so it takes longer
    --update-baseline               accept what is there now, report only new findings
    --tighten-baseline              lower the baseline to what is still there; never raises it
    --max-warnings <n>              exit 1 above this number of warnings
    --select <groups or rules>      only these, comma separated
    --ignore <groups or rules>      all but these
    --statistics                    count per rule instead of listing every finding
    --stdin --filename <name>       check a snippet instead of files
    --url <url> [paths...]          check pages as they run, in a browser: what an expression or a
                                    variable fills in, which the source does not show. Needs Playwright
      --crawl                       also the pages of the same site they link to
      --max <n>                     at most this many pages (default 40)
      --storage-state <file>        a Playwright storage state, for a site behind a login
      --playwright <module>         a playwright module, when the project has none
  nldd compare <before> <after> [paths...] --out <directory>
                                    photograph two versions of a site and outline every component that
                                    changed. A version is a built site in a directory, or the address of
                                    a running one. Needs Playwright
    --label-before <text>           what stands above the left half (default: Voor)
    --label-after <text>            and above the right half (default: Na)
    --storage-state, --playwright   as with lint --url
  nldd upgrade                      bring this project to the version of this command: raise the version
                                    wherever the project names it, rewrite the lockfile, apply every fix
                                    that is certain, and report what is left. Run the version you want:
                                    npx @nldd/design-system@latest upgrade
    --report <file>                 write the report there, as Markdown for a pull request
    --format json                   the same as data, for a script or an agent
    --no-install                    leave the lockfile to you
    --url <url> [--crawl]           also read the running app, as lint --url does, and add what it
                                    shows to the report
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
 * right. A newer one, through `npx @nldd/design-system@<version>`, is how you see what
 * an upgrade will break: useful, as long as it is clear that is what you are looking at.
 */
function noteOtherVersion(root) {
	const installed = installedVersion(root);
	if (installed && installed !== pkg.version) {
		console.error(`Checking against ${pkg.version}, and this project has ${installed}: findings say what changes on upgrading.`);
	}
}

/**
 * A running page instead of files. Nothing is written and nothing is accepted:
 * what the browser shows is not a file to fix, and a baseline holds files.
 */
async function lintPages(data, paths, options, { root, config, severities }) {
	for (const flag of ['fix', 'stdin', 'update-baseline', 'tighten-baseline']) {
		if (options[flag]) throw new Error(`--url reads a running page, so it takes no --${flag}.`);
	}
	if (!/^https?:\/\//.test(options.url)) throw new Error('--url takes an address that starts with http:// or https://.');
	if (options.max !== undefined && !/^[1-9]\d*$/.test(options.max)) throw new Error('--max takes a whole number above 0.');
	const { lintRendered } = await import('./rendered.js');
	const session = await lintRendered(data, {
		root,
		url: options.url,
		paths,
		crawl: options.crawl,
		max: options.max ? Number(options.max) : undefined,
		storageState: options['storage-state'],
		playwright: options.playwright,
		config,
		severities,
	});
	for (const { url, error } of session.failed) console.error(`Could not open ${url}: ${error}`);
	if (session.left > 0) console.error(`${session.left} more pages were found and not opened. Raise --max to open them.`);
	return session;
}

/** Two versions of a site, side by side. A report to look at, so it never fails a run. */
async function runCompare([before, after, ...paths], options) {
	if (!before || !after) throw new Error('nldd compare takes two versions: a directory with a built site, or an address, for each.');
	if (!options.out) throw new Error('nldd compare writes images, so it takes --out <directory>.');
	const { compareSites } = await import('./compare.js');
	const results = await compareSites({
		root: process.cwd(),
		before,
		after,
		paths,
		out: options.out,
		labels: { before: options['label-before'] ?? 'Voor', after: options['label-after'] ?? 'Na' },
		storageState: options['storage-state'],
		playwright: options.playwright,
		onPage: (line) => console.log(line),
	});
	const failed = results.filter((result) => result.error).length;
	const identical = results.filter((result) => result.identical).length;
	const images = results.filter((result) => result.file).length;
	console.log(`\n${results.length} comparisons, ${identical} identical, ${images} with an image in ${options.out}${failed ? `, ${failed} that could not be made` : ''}`);
	return 0;
}

/**
 * The whole project, to the version of this package. Always the whole project:
 * an upgrade that leaves a directory behind is not one.
 */
async function runUpgrade(data, paths, options) {
	if (paths.length > 0) throw new Error('nldd upgrade takes no paths: it upgrades the whole project.');
	if (options.format && options.format !== 'json') throw new Error('nldd upgrade writes Markdown, or JSON with --format json.');
	const root = process.cwd();
	const { upgradeProject, withRendered } = await import('./upgrade.js');
	const { formatReport, formatSummary } = await import('./upgrade-report.js');
	const config = readConfig(root, knownKeys(data));
	const severities = resolveSeverities(data, config.rules, {});
	const upgraded = await upgradeProject(data, {
		root,
		target: pkg.version,
		breaking: JSON.parse(readFileSync(new URL('./breaking.generated.json', import.meta.url), 'utf8')),
		config,
		severities,
		canonical: createCanonical(data),
		install: !options['no-install'],
	});
	// The running app, where the project has one up: the places the source left undecided.
	const result = options.url ? withRendered(upgraded, await lintPages(data, [], options, { root, config, severities }), root) : upgraded;
	if (options.report) {
		writeFileSync(resolve(root, options.report), formatReport(result));
		console.error(formatSummary(result));
	}
	if (options.format === 'json') console.log(JSON.stringify(result, null, 2));
	else if (!options.report) console.log(formatReport(result));
	return 0;
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
	const known = knownKeys(data);
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

	// Tightening has to see every file the baseline names, also one without a component left.
	const inBaseline = options['tighten-baseline'] ? new Set(Object.keys(readBaseline(root, canonical))) : new Set();
	const session = options.url ? await lintPages(data, paths, options, { root, config, severities }) : await lintProject(data, {
		root,
		paths,
		config,
		severities,
		input: options.stdin ? { filename: options.filename ?? 'stdin.html', source: readFileSync(0, 'utf8') } : undefined,
		fix: options.fix,
		keep: (filename) => inBaseline.has(relativePath(root, filename)),
	});
	const { results } = session;
	for (const filename of session.notUtf8) console.error(`Skipped ${relative(root, filename)}: it is not UTF-8.`);
	for (const { entry, file } of session.partialExcludes) {
		console.error(`"exclude" entry "${entry}" no longer leaves out ${file}: an entry is a whole file or directory name now.`);
	}
	for (const filename of session.symlinks) console.error(`Skipped ${relative(root, filename)}: it is a symbolic link.`);
	for (const filename of session.unstable) console.error(`Stopped fixing ${relative(root, filename)}: fixes kept changing it. Run --fix again, or look at the findings.`);
	if (options.fix) console.error(`Fixed ${session.fixed} in ${session.fixedFiles} of ${session.files} files.`);
	if (session.references) {
		const { references } = session;
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
		files: session.files,
		unread: session.unread,
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
			url: { type: 'string' },
			crawl: { type: 'boolean' },
			max: { type: 'string' },
			'storage-state': { type: 'string' },
			playwright: { type: 'string' },
			out: { type: 'string' },
			report: { type: 'string' },
			'no-install': { type: 'boolean' },
			'label-before': { type: 'string' },
			'label-after': { type: 'string' },
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
	if (command === 'compare') return runCompare(rest, values);
	const data = loadData();
	if (command === 'lint') return runLint(data, rest, values);
	if (command === 'upgrade') return runUpgrade(data, rest, values);
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
