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
import { tagsOf } from '../lint/rule-index.js';

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

function checkTokens(tokens, ruleId) {
	for (const token of tokens) {
		if (token.type === 'tag' && token.name.startsWith('nldd-') && !data.tags[token.name]) {
			problems.push(`${ruleId}: selector names ${token.name}, which does not exist.`);
		}
		if (token.type === 'attribute' && !allAttributes.has(token.name) && !GLOBAL_IN_SELECTORS.has(token.name)) {
			problems.push(`${ruleId}: selector names attribute ${token.name}, which no component has.`);
		}
		if (token.type === 'pseudo' && Array.isArray(token.data)) {
			for (const inner of token.data) checkTokens(inner, ruleId);
		}
	}
}

function selectorsOf(rule) {
	return [rule.context, rule.assert, rule.report, rule.count?.of, rule.ref?.target].filter(Boolean);
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
			for (const finding of findings) {
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

for (const rule of data.rules) {
	for (const selector of selectorsOf(rule)) {
		for (const tokens of parse(selector)) checkTokens(tokens, rule.id);
	}
	checkSee(rule);
	checkReflected(rule);
	await checkExamples(rule);
}
const patterns = await checkPatterns();

if (problems.length > 0) {
	console.error(problems.join('\n'));
	console.error(`\n${problems.length} problem(s).`);
	process.exit(1);
}
console.log(`${data.rules.length} rules hold, ${patterns} pattern examples are clean.`);
