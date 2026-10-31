/** The `nldd` command, started from cli.js. */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { formatGithub, formatJson, formatText } from './format.js';
import { BUILT_IN_RULES, createCanonical, loadData } from './rule-data.js';
import { rulesAboutTag } from './rule-index.js';
import { applyBaseline, findFiles, readBaseline, readConfig, writeBaseline } from './project.js';

const USAGE = `Usage:
  nldd lint [paths...]              check files; without paths, the whole project
    --format text|json|github       default: text
    --update-baseline               accept what is there now, report only new findings
    --max-warnings <n>              exit 1 above this number of warnings
    --stdin --filename <name>       check a snippet instead of files
  nldd explain <rule>               what a rule checks, and why
  nldd rules [--for <tag>] [--json] list the rules, or those about one component
`;

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function findRule(data, id) {
	const rule = data.rules.find((r) => r.id === id || r.aliases?.includes(id));
	if (rule) return rule;
	return BUILT_IN_RULES[id] ? { id, ...BUILT_IN_RULES[id], message: BUILT_IN_RULES[id].description } : undefined;
}

function explain(data, id) {
	const rule = findRule(data, id);
	if (!rule) {
		console.error(`Unknown rule: ${id}`);
		return 2;
	}
	const lines = [`${rule.id}  (${rule.severity})`, '', rule.message];
	if (rule.see) lines.push('', `Why: ${rule.see}`);
	if (rule.runtime) lines.push('', 'Only the running page can tell, so this runs in the browser while developing.');
	if (rule.examples) {
		lines.push('', 'Fine:', ...rule.examples.passed.map((example) => `  ${example}`));
		lines.push('', 'Wrong:', ...rule.examples.failed.map((example) => `  ${example}`));
	}
	console.log(lines.join('\n'));
	return 0;
}

function listRules(data, { tag, json }) {
	const rules = tag ? rulesAboutTag(data.rules, tag) : data.rules;
	if (json) console.log(JSON.stringify(rules, null, 2));
	else for (const rule of rules) console.log(`${rule.id}  (${rule.severity})  ${rule.message}`);
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

async function runLint(data, paths, options) {
	if (Number.isNaN(Number(options['max-warnings'] ?? 0))) throw new Error('--max-warnings takes a number.');
	const root = process.cwd();
	const started = performance.now();
	const known = new Set([...data.rules.flatMap((r) => [r.id, ...(r.aliases ?? [])]), ...Object.keys(BUILT_IN_RULES)]);
	const config = readConfig(root, known);
	noteOtherVersion(root);
	const canonical = createCanonical(data);

	const inputs = options.stdin
		? [{ filename: resolve(root, options.filename), source: readFileSync(0, 'utf8') }]
		: findFiles(paths, root, config.exclude).map((filename) => ({
				filename,
				source: readFileSync(filename, 'utf8'),
			}));

	// Most files in an app use no component at all, and those need no parser either.
	const relevant = inputs.filter(({ source }) => /nldd-|Nldd/.test(source) || config.wrappers);
	const results = [];
	if (relevant.length > 0) {
		const { createLinter } = await import('./linter.js');
		const linter = createLinter(data, { wrappers: config.wrappers, severities: config.rules });
		for (const { filename, source } of relevant) {
			const { findings } = await linter.lintSource(source, filename);
			results.push({ filename, source, findings });
		}
	}

	if (options['update-baseline']) {
		writeBaseline(results, root, canonical);
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
		explainRule: (id) => findRule(data, id),
	};
	const format = { text: formatText, json: formatJson, github: formatGithub }[options.format];
	if (!format) throw new Error(`Unknown format: ${options.format}`);
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
			format: { type: 'string', default: 'text' },
			'update-baseline': { type: 'boolean' },
			'max-warnings': { type: 'string' },
			stdin: { type: 'boolean' },
			filename: { type: 'string', default: 'stdin.html' },
			for: { type: 'string' },
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
	if (command === 'rules') return listRules(data, { tag: values.for, json: values.json });
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
