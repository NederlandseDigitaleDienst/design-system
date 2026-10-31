/**
 * Proves every rule in src/rules/ before it can reach a consumer:
 *
 *  - each example gives the outcome it claims;
 *  - its selectors and examples only name tags and attributes that exist, so
 *    renaming a component fails here, in the same pull request;
 *  - its `see` points at something that exists;
 *  - every pattern's example passes every rule, so a pattern is always valid.
 *
 * Usage: node scripts/check-lint-rules.js
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'css-what';
import { BUILT_IN_RULES, createLinter, loadData } from '../lint/linter.js';
import { selectorsOf, tagsOf } from '../lint/rule-index.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = loadData();
const linter = createLinter(data);
const problems = [];

const allAttributes = new Set(Object.values(data.tags).flatMap((tag) => Object.keys(tag.attrs)));
const GLOBAL_IN_SELECTORS = new Set(['slot', 'id', 'class', 'hidden', 'role']);

/** The browser only sees attributes, so a value set as a property has to reflect. */
function checkReflected(rule) {
	const tags = tagsOf(rule);
	for (const selector of selectorsOf(rule)) {
		for (const [, name] of selector.matchAll(/\[([a-z-]+)/g)) {
			for (const tag of tags) {
				if (data.tags[tag]?.attrs[name]?.unreflected) {
					problems.push(`${rule.id}: ${name} on ${tag} needs reflect: true, or the browser check misses a property.`);
				}
			}
		}
	}
}

function checkTokens(tokens, rule) {
	const ruleId = rule.id;
	for (const token of tokens) {
		if (token.type === 'tag' && token.name.startsWith('nldd-') && !data.tags[token.name]) {
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

function checkSee(rule) {
	if (!rule.see) return;
	const [kind, slug] = rule.see.split('/');
	if (kind === 'patronen' && !existsSync(join(repoRoot, 'src/patterns', slug))) {
		problems.push(`${rule.id}: see points at pattern "${slug}", which does not exist.`);
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
			const wrapped = example.startsWith('<html') ? example : `<template>${example}</template>`;
			const { findings } = await linter.lintSource(wrapped, example.startsWith('<html') ? 'example.html' : 'example.vue');
			// A failed example may show a name that is gone: that is what a rename rule is about.
			for (const finding of kind === 'failed' ? [] : findings) {
				if (BUILT_IN_RULES[finding.rule]) problems.push(`${rule.id}: example: ${finding.message}`);
			}
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

async function checkPatterns() {
	const files = patternFiles(join(repoRoot, 'src/patterns'));
	for (const file of files) {
		const { findings } = await linter.lintSource(readFileSync(file, 'utf8'), file);
		for (const { rule, line, message } of findings) {
			problems.push(`${relative(repoRoot, file)}:${line} ${rule}: ${message}`);
		}
	}
	return files.length;
}

const componentSources = sourceFiles(join(repoRoot, 'src'))
	.map((file) => [file, readFileSync(file, 'utf8')]);

/** A rule on a state nothing sets would never fire, and look fine. */
function checkStates(rule) {
	const selectors = selectorsOf(rule).join(' ');
	for (const [, state] of selectors.matchAll(/:state\(([a-z-]+)\)/g)) {
		const set = `'${state}'`;
		if (!componentSources.some(([, source]) => source.includes('setState(') && source.includes(set))) {
			problems.push(`${rule.id}: no component sets the state ${state}.`);
		}
	}
}

/** Text in a component is a second source. The only output left there is a real failure. */
function checkNoWarnings() {
	for (const [file, source] of componentSources) {
		// Without this, a component could be imported on its own with no checks at all.
		if (!file.endsWith('custom-element.ts') && /\{[^}]*\bcustomElement\b[^}]*\} from 'lit\/decorators\.js'/.test(source)) {
			problems.push(`${relative(repoRoot, file)}: import customElement from utilities/custom-element.js.`);
		}
		for (const match of source.matchAll(/console\.warn\(/g)) {
			const line = source.slice(0, match.index).split('\n').length;
			problems.push(`${relative(repoRoot, file)}:${line}: use a rule, not console.warn. See /rule.`);
		}
	}
}

for (const rule of data.rules) {
	for (const selector of selectorsOf(rule)) {
		for (const tokens of parse(selector)) checkTokens(tokens, rule);
	}
	checkSee(rule);
	checkStates(rule);
	checkReflected(rule);
	if (!rule.runtime) await checkExamples(rule);
}
const patterns = await checkPatterns();
checkNoWarnings();

if (problems.length > 0) {
	console.error(problems.join('\n'));
	console.error(`\n${problems.length} problem(s).`);
	process.exit(1);
}
console.log(`${data.rules.length} rules hold, ${patterns} pattern examples are clean.`);
