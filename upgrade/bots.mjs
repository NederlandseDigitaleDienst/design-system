/**
 * Dependabot and Renovate leave @nldd/design-system to the pull request of this action. They keep
 * every other dependency up to date; for this one they would raise the version without the fixes,
 * and a release that breaks something would break the build. So the configuration the project
 * already has gets an exception for this one package, in the pull request the team reviews.
 *
 *   node bots.mjs <project> <yaml module>    prints what changed, a line per file, as JSON
 *
 * The configuration is read as data and written back with its comments: YAML through the `yaml`
 * library, which the action installs next to it, and JSON with the indentation it had. A JSON5
 * file of Renovate is not written: the report names it, with the rule to add.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

export const PACKAGE = '@nldd/design-system';

const DEPENDABOT = ['.github/dependabot.yml', '.github/dependabot.yaml'];
const RENOVATE = ['renovate.json', '.github/renovate.json', '.gitlab/renovate.json', '.renovaterc', '.renovaterc.json'];
const RENOVATE_JSON5 = ['renovate.json5', '.github/renovate.json5', '.gitlab/renovate.json5', '.renovaterc.json5'];

/** A name in a list of Dependabot or Renovate that covers the package: itself, or a pattern such as @nldd/*. */
const covers = (name) => typeof name === 'string' && (name === PACKAGE || (name.endsWith('*') && PACKAGE.startsWith(name.slice(0, -1))));

/** Dependabot: an `ignore` for the package in each update of npm, the ecosystem of npm, yarn and pnpm. */
export function dependabotWithout(source, YAML) {
	const document = YAML.parseDocument(source);
	const updates = document.get('updates');
	if (!YAML.isSeq(updates)) return source;
	let changed = false;
	for (const update of updates.items) {
		if (!YAML.isMap(update) || update.get('package-ecosystem') !== 'npm') continue;
		const ignore = update.get('ignore');
		if (YAML.isSeq(ignore) && ignore.items.some((entry) => YAML.isMap(entry) && covers(entry.get('dependency-name')))) continue;
		const entry = document.createNode({ 'dependency-name': PACKAGE });
		entry.commentBefore = ' Comes as a pull request from the design system, with the fixes: https://design.digitaledienst.overheid.nl/upgraden/';
		if (YAML.isSeq(ignore)) ignore.items.push(entry);
		else update.set('ignore', document.createNode([entry]));
		changed = true;
	}
	return changed ? document.toString() : source;
}

/** Renovate: a rule that turns the package off, at the end of `packageRules`, where it wins. */
export function renovateWithout(config) {
	const rules = Array.isArray(config.packageRules) ? config.packageRules : [];
	if (rules.some((rule) => rule.enabled === false && (rule.matchPackageNames ?? []).some(covers))) return undefined;
	return { ...config, packageRules: [...rules, { description: 'Comes as a pull request from the design system, with the fixes: https://design.digitaledienst.overheid.nl/upgraden/', matchPackageNames: [PACKAGE], enabled: false }] };
}

const indentOf = (source) => /^\{\s*\n([ \t]+)"/.exec(source)?.[1] ?? '\t';

/**
 * @param {string} project - the clone
 * @param {object} YAML - the `yaml` library
 * @returns {{ file: string, bot: string, written: boolean }[]}
 */
export function leaveToAction(project, YAML) {
	const done = [];
	for (const file of DEPENDABOT.filter((name) => existsSync(join(project, name)))) {
		const source = readFileSync(join(project, file), 'utf8');
		const next = dependabotWithout(source, YAML);
		if (next !== source) {
			writeFileSync(join(project, file), next);
			done.push({ file, bot: 'Dependabot', written: true });
		}
	}
	for (const file of RENOVATE.filter((name) => existsSync(join(project, name)))) {
		const source = readFileSync(join(project, file), 'utf8');
		let config;
		try {
			config = JSON.parse(source);
		} catch {
			done.push({ file, bot: 'Renovate', written: false });
			continue;
		}
		const next = renovateWithout(config);
		if (next) {
			writeFileSync(join(project, file), `${JSON.stringify(next, null, indentOf(source))}\n`);
			done.push({ file, bot: 'Renovate', written: true });
		}
	}
	for (const file of RENOVATE_JSON5.filter((name) => existsSync(join(project, name)))) {
		if (!readFileSync(join(project, file), 'utf8').includes(PACKAGE)) done.push({ file, bot: 'Renovate', written: false });
	}
	// A package.json can hold the configuration of Renovate under `renovate`.
	const manifest = join(project, 'package.json');
	if (existsSync(manifest)) {
		const source = readFileSync(manifest, 'utf8');
		const parsed = JSON.parse(source);
		const next = parsed.renovate && renovateWithout(parsed.renovate);
		if (next) {
			writeFileSync(manifest, `${JSON.stringify({ ...parsed, renovate: next }, null, indentOf(source))}\n`);
			done.push({ file: 'package.json', bot: 'Renovate', written: true });
		}
	}
	return done;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
	const [project, yamlModule] = process.argv.slice(2);
	const YAML = createRequire(join(yamlModule, 'package.json'))(yamlModule);
	console.log(JSON.stringify(leaveToAction(project, YAML)));
}
