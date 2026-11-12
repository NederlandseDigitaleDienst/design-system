/**
 * Proves every rule in src/rules/ before it can reach a consumer:
 *
 *  - each example gives the outcome it claims;
 *  - its selectors and examples only name tags and attributes that exist, so
 *    renaming a component fails here, in the same pull request;
 *  - its `see` points at something that exists;
 *  - every pattern's example passes every rule, so a pattern is always valid;
 *  - every state a rule reads is set, and every state that is set is read.
 *
 * Usage: node scripts/check-lint-rules.js
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'css-what';
import { applyFixes } from '../lint/fix.js';
import { BUILT_IN_RULES, createLinter, loadData } from '../lint/linter.js';
import { OPT_IN_GROUPS, resolveSeverities } from '../lint/rule-data.js';
import { selectorsOf } from '../lint/rule-index.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = loadData();
const linter = createLinter(data);
const problems = [];

const guidelines = readFileSync(join(repoRoot, 'src/docs/design-guidelines.mdx'), 'utf8');
const guidelineHeadings = new Set(
	[...guidelines.matchAll(/^#+ (.+)$/gm)].map(([, heading]) => heading.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')),
);

const allAttributes = new Set(Object.values(data.tags).flatMap((tag) => [...Object.keys(tag.attrs), ...Object.keys(tag.childAttrs)]));
const GLOBAL_IN_SELECTORS = new Set(['slot', 'id', 'class', 'hidden', 'role', 'style', 'lang', 'aria-label', 'aria-labelledby']);

function checkTokens(tokens, rule) {
	const ruleId = rule.id;
	for (const token of tokens) {
		if (token.type === 'tag' && token.name.startsWith('nldd-') && !data.tags[token.name] && !rule.removed?.includes(token.name)) {
			problems.push(`${ruleId}: selector names ${token.name}, which does not exist.`);
		}
		const known = allAttributes.has(token.name) || GLOBAL_IN_SELECTORS.has(token.name) || rule.removed?.includes(token.name);
		if (token.type === 'attribute' && !known) {
			problems.push(`${ruleId}: selector names attribute ${token.name}, which no component has.`);
		}
		if (token.type === 'pseudo' && Array.isArray(token.data)) {
			for (const inner of token.data) checkTokens(inner, rule);
		}
	}
}

function sourceFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return sourceFiles(path);
		const skip = /\.(test|stories)\.ts$|dev-checks\.ts$/;
		return entry.name.endsWith('.ts') && !skip.test(entry.name) ? [path] : [];
	});
}

/** Things a rule can be about that are no single component. */
const CONCEPTS = ['action', 'class', 'html', 'style', 'stylesheet', 'back-link', 'download', 'editor', 'filter', 'hide', 'label', 'language', 'login', 'logout', 'navigation', 'pane', 'row', 'section', 'slot', 'split-view', 'status-bar', 'status-dot', 'subpage', 'toc', 'variant', 'website'];
const FORM = /-(needs|no|max|goes)-/;
const API_ENDING = /-(renamed|invalid|no-effect|not-found)$/;

function checkName({ id, group }) {
	const subjects = [...Object.keys(data.tags).map((tag) => tag.replace(/^nldd-/, '')), ...CONCEPTS];
	if (!subjects.some((subject) => id.startsWith(`${subject}-`))) {
		problems.push(`${id}: a name starts with what it is about, a tag without nldd- or one of ${CONCEPTS.join(', ')}.`);
	}
	if (group === 'api' && !API_ENDING.test(id)) {
		problems.push(`${id}: a name in api ends in -renamed, -invalid, -no-effect or -not-found.`);
	}
	if (group !== 'api' && (!FORM.test(id) || API_ENDING.test(id))) {
		problems.push(`${id}: a name says -needs-, -no-, -max- or -goes-, and only a name in api ends in -renamed, -invalid, -no-effect or -not-found.`);
	}
}

const existsAsValue = (attribute, value) =>
	Object.values(data.tags).some((tag) => (attribute === 'slot' ? tag.slots.includes(value) : tag.attrs[attribute]?.values?.includes(value)));

/** A fix changes what the rule says is gone, into something that exists. */
function checkFix({ id, fix, removed = [] }) {
	for (const [from, to] of Object.entries(fix?.rename ?? {})) {
		if (!removed.includes(from)) problems.push(`${id}: the fix renames ${from}, which is not in removed.`);
		if (!allAttributes.has(to)) problems.push(`${id}: the fix renames to ${to}, which no component has.`);
	}
	for (const name of fix?.remove ?? []) {
		if (!removed.includes(name)) problems.push(`${id}: the fix removes ${name}, which is not in removed.`);
	}
	for (const [from, to] of Object.entries(fix?.flag ?? {})) {
		if (!removed.includes(from)) problems.push(`${id}: the fix turns ${from} into a flag, and ${from} is not in removed.`);
		if (!allAttributes.has(to)) problems.push(`${id}: the fix turns ${from} into ${to}, which no component has.`);
	}
	if (fix?.tag && !data.tags[fix.tag]) problems.push(`${id}: the fix renames to ${fix.tag}, which does not exist.`);
	if (fix?.tag && removed.length === 0) problems.push(`${id}: the fix renames a tag, and removed does not name it.`);
	for (const [attribute, values] of Object.entries(fix?.value ?? {})) {
		for (const to of Object.values(values)) {
			if (!existsAsValue(attribute, to)) problems.push(`${id}: the fix sets ${attribute} to ${to}, which no component has.`);
		}
	}
}

/** Lints an example as a file, which is how the linter meets it. */
const lintExample = (example) => {
	const isDocument = example.startsWith('<html');
	const filename = isDocument ? 'example.html' : 'example.vue';
	const source = isDocument ? example : `<template>${example}</template>`;
	return linter.lintSource(source, filename).then(({ findings }) => ({ source, filename, findings }));
};

/** A fix has to end the finding it answers, and leave nothing that no longer exists. */
async function checkFixEndsFinding(rule, example) {
	const { source, filename, findings } = await lintExample(example);
	const change = applyFixes(source, findings.filter(({ rule: id }) => id === rule.id));
	const after = await linter.lintSource(change.source, filename);
	if (change.fixed === 0) problems.push(`${rule.id}: the fix changes nothing in: ${example}`);
	for (const finding of after.findings) {
		if (finding.rule === rule.id || BUILT_IN_RULES[finding.rule]) {
			problems.push(`${rule.id}: after the fix, ${finding.rule}: ${change.source}`);
		}
	}
}

function checkSee(rule) {
	if (!rule.see) return;
	const [kind, slug] = rule.see.split('/');
	if (kind === 'patronen' && !existsSync(join(repoRoot, 'src/patterns', slug))) {
		problems.push(`${rule.id}: see points at pattern "${slug}", which does not exist.`);
	}
	if (kind === 'ontwerprichtlijnen' && !guidelineHeadings.has(slug)) {
		problems.push(`${rule.id}: see points at section "${slug}" of the guidelines, which does not exist.`);
	}
}

async function checkExamples(rule) {
	const expected = { passed: 'passed', failed: 'failed', cantTell: 'cantTell' };
	for (const [kind, outcome] of Object.entries(expected)) {
		for (const example of rule.examples[kind] ?? []) {
			const outcomes = await linter.outcomesOf(rule, example);
			const holds = outcome === 'passed' ? !outcomes.includes('failed') : outcomes.includes(outcome);
			if (!holds) {
				problems.push(`${rule.id}: ${kind} example gave [${outcomes}]: ${example}`);
			}
			// An example naming something that does not exist would prove nothing.
			const { findings } = await lintExample(example);
			// A failed example may show a name that is gone: that is what a rename rule is about.
			for (const finding of kind === 'failed' ? [] : findings) {
				if (BUILT_IN_RULES[finding.rule]) problems.push(`${rule.id}: example: ${finding.message}`);
			}
			if (kind === 'failed' && rule.fix) await checkFixEndsFinding(rule, example);
		}
	}
}

function patternFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return patternFiles(path);
		return entry.name.endsWith('.html') ? [path] : [];
	});
}

/** A pattern is what an app copies, so it has to be pure too. */
const pureLinter = createLinter(data, { severities: resolveSeverities(data, {}, { optIn: OPT_IN_GROUPS }) });

async function checkPatterns() {
	const files = patternFiles(join(repoRoot, 'src/patterns'));
	for (const file of files) {
		const { findings } = await pureLinter.lintSource(readFileSync(file, 'utf8'), file);
		for (const { rule, line, message } of findings) {
			problems.push(`${relative(repoRoot, file)}:${line} ${rule}: ${message}`);
		}
	}
	return files.length;
}

const componentSources = sourceFiles(join(repoRoot, 'src'))
	.map((file) => [file, readFileSync(file, 'utf8')]);

/** A file may name something else setState, so only an import of ours counts. */
const STATE_IMPORT = /import \{[^}]*\bsetState\b[^}]*\} from '[^']*element-state(\.js)?'/;
const STATE_CALL = /(?<![.\w])setState\(\s*[^,]+,\s*([^,]+),/g;

/** Every state a component sets. A name built at runtime cannot be checked, so it is not allowed. */
function readSetStates() {
	const states = new Set();
	for (const [file, source] of componentSources) {
		if (!STATE_IMPORT.test(source)) continue;
		for (const { 1: name, index } of source.matchAll(STATE_CALL)) {
			const literal = /^'([a-z0-9-]+)'$/.exec(name.trim());
			if (literal) states.add(literal[1]);
			else {
				const line = source.slice(0, index).split('\n').length;
				problems.push(`${relative(repoRoot, file)}:${line}: setState needs a literal name, got ${name.trim()}.`);
			}
		}
	}
	return states;
}

const setStates = readSetStates();
const readStates = new Set();

/** A rule on a state nothing sets would never fire, and look fine. */
function checkStates(rule) {
	const selectors = selectorsOf(rule).join(' ');
	for (const [, state] of selectors.matchAll(/:state\(([a-z0-9-]+)\)/g)) {
		readStates.add(state);
		if (!setStates.has(state)) problems.push(`${rule.id}: no component sets the state ${state}.`);
	}
}

/** A state no rule reads means a warning disappeared without anyone noticing. */
function checkStatesAreRead() {
	for (const state of setStates) {
		if (!readStates.has(state)) problems.push(`A component sets the state ${state}, which no rule reads.`);
	}
}

/** Text in a component is a second source. The only output left there is a real failure. */
function checkNoWarnings() {
	for (const [file, source] of componentSources) {
		// Without this, a component could be imported on its own with no checks at all.
		const registers = /@customElement\(|customElements\.define\(/.test(source);
		const inComponents = relative(repoRoot, file).startsWith('src/components/');
		if (inComponents && registers && !/^import [^\n]*\/custom-element\.js';$/m.test(source)) {
			problems.push(`${relative(repoRoot, file)}: registers a component without utilities/custom-element.js.`);
		}
		for (const match of source.matchAll(/console\.warn\(/g)) {
			const line = source.slice(0, match.index).split('\n').length;
			problems.push(`${relative(repoRoot, file)}:${line}: use a rule, not console.warn. See /rule.`);
		}
	}
}

/**
 * Pseudo-classes only the source linter knows. The browser rejects them and then
 * silently skips the rule, and :accepted judges a file by itself, which only an
 * opt-in group may do.
 */
const SOURCE_ONLY_PSEUDOS = ['accepted', 'written', 'blank', 'within', 'system'];

function checkSourceOnlyPseudos(rule) {
	if (OPT_IN_GROUPS.includes(rule.group)) return;
	for (const name of SOURCE_ONLY_PSEUDOS) {
		if (selectorsOf(rule).some((selector) => selector.includes(`:${name}`))) {
			problems.push(`${rule.id}: :${name} is for the opt-in groups (${OPT_IN_GROUPS.join(', ')}) only.`);
		}
	}
}

/** The browser rejects a pseudo it does not know, and then silently skips the rule. */
function checkBrowserSelectors() {
	const generated = readFileSync(join(repoRoot, 'src/utilities/dev-rules.generated.ts'), 'utf8');
	for (const name of ['named-by-field', ...SOURCE_ONLY_PSEUDOS]) {
		if (new RegExp(`:${name}\\b`).test(generated)) problems.push(`dev rules hold :${name}, which the browser does not know.`);
	}
}

/** The plain elements a selector reaches below the component it starts with: `nldd-rich-text > p`, `:is(h1, h2)`. */
function plainTagsAfterHost(selector) {
	const found = [];
	for (const tokens of parse(selector)) {
		const [first] = tokens;
		if (first?.type !== 'tag' || !first.name.startsWith('nldd-')) continue;
		const host = first.name;
		let below = false;
		const visit = (list) => {
			list.forEach((token, index) => {
				// `fieldset.form-section` is an element the component renders itself, not one it is given.
				const own = list[index + 1]?.type === 'attribute' && list[index + 1].name === 'class';
				if (['descendant', 'child', 'sibling', 'adjacent'].includes(token.type)) below = true;
				else if (below && token.type === 'tag' && !token.name.includes('-') && !own) found.push([host, token.name]);
				else if (token.type === 'pseudo' && Array.isArray(token.data)) token.data.forEach(visit);
			});
		};
		visit(tokens);
	}
	return found;
}

/**
 * A component that styles a plain element it is given says so with `@accepts`, or
 * `nldd-lint --pure` reports that element in every app as the app's own. Checked per
 * element: `::slotted(a)` in the styles it uses, and for a component without shadow
 * DOM (nldd-rich-text, nldd-form) the plain elements its stylesheet reaches.
 */
function checkSlottedIsAccepted() {
	const slottedByConst = new Map();
	for (const [file, source] of componentSources.filter(([name]) => name.endsWith('.styles.ts'))) {
		for (const block of source.split(/(?=export const \w+ = css`)/)) {
			const name = /^export const (\w+) = css`/.exec(block)?.[1];
			if (!name) continue;
			const tags = [...block.matchAll(/::slotted\(\s*([a-z][a-z0-9]*)(?![a-z0-9-])/g)].map(([, tag]) => tag);
			slottedByConst.set(name, { file, tags });
		}
	}
	const missing = (tag, element) => {
		const accepts = data.tags[tag]?.accepts ?? [];
		return !accepts.includes(element) && !accepts.includes('*');
	};
	for (const [file, source] of componentSources) {
		for (const part of source.split(/(?=@customElement\(')/).slice(1)) {
			const tag = /^@customElement\('(nldd-[a-z0-9-]+)'\)/.exec(part)?.[1];
			const styles = /\bstyles\s*=\s*([^;]+);/.exec(part)?.[1] ?? '';
			for (const name of styles.match(/\w+/g) ?? []) {
				for (const element of slottedByConst.get(name)?.tags ?? []) {
					if (tag && missing(tag, element)) problems.push(`${relative(repoRoot, file)}: ${tag} styles ::slotted(${element}) but has no @accepts ${element}.`);
				}
			}
		}
	}
	const lightDom = readdirSync(join(repoRoot, 'src/components'), { recursive: true }).filter((file) => file.endsWith('.css'));
	for (const file of lightDom) {
		const css = readFileSync(join(repoRoot, 'src/components', file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
		const preludes = [...css.matchAll(/([^{}]+)\{/g)].map(([, prelude]) => prelude.trim()).filter((prelude) => prelude.startsWith('nldd-'));
		const seen = new Set();
		for (const prelude of preludes) {
			for (const [tag, element] of plainTagsAfterHost(prelude)) {
				const key = `${tag} ${element}`;
				if (seen.has(key) || !data.tags[tag] || !missing(tag, element)) continue;
				seen.add(key);
				problems.push(`src/components/${file}: ${tag} styles <${element}> but has no @accepts ${element}.`);
			}
		}
	}
}

for (const rule of data.rules) {
	for (const selector of selectorsOf(rule)) {
		for (const tokens of parse(selector)) checkTokens(tokens, rule);
	}
	checkName(rule);
	checkFix(rule);
	checkSee(rule);
	checkStates(rule);
	checkSourceOnlyPseudos(rule);
	if (!rule.runtime) await checkExamples(rule);
}
const patterns = await checkPatterns();
checkStatesAreRead();
checkNoWarnings();
checkBrowserSelectors();
checkSlottedIsAccepted();

if (problems.length > 0) {
	console.error(problems.join('\n'));
	console.error(`\n${problems.length} problem(s).`);
	process.exit(1);
}
console.log(`${data.rules.length} rules hold, ${patterns} pattern examples are clean.`);
