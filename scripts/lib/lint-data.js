/**
 * Compiles what the linter reads at runtime: the component contract from the
 * manifest, the icon names, and the rules from src/rules/.
 *
 * Generated once and shipped, so a pre-commit run does not parse a 2 MB manifest.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import Ajv from 'ajv';
import { parse as parseSelector, stringify } from 'css-what';
import { parse as parseYaml } from 'yaml';

function declarationsByName(manifest) {
	const declarations = new Map();
	for (const module of manifest.modules) {
		for (const declaration of module.declarations ?? []) declarations.set(declaration.name, declaration);
	}
	return declarations;
}

function inheritedAttributes(declaration, declarations, seen = new Set()) {
	if (seen.has(declaration.name)) return [];
	seen.add(declaration.name);
	const parents = [...(declaration.mixins ?? []), declaration.superclass].filter(Boolean);
	return [
		...(declaration.attributes ?? []),
		...parents.flatMap(({ name }) => {
			const parent = declarations.get(name);
			return parent ? inheritedAttributes(parent, declarations, seen) : [];
		}),
	];
}

function inheritedMembers(declaration, declarations, seen = new Set()) {
	if (seen.has(declaration.name)) return [];
	seen.add(declaration.name);
	const parents = [...(declaration.mixins ?? []), declaration.superclass].filter(Boolean);
	return [
		...(declaration.members ?? []),
		...parents.flatMap(({ name }) => {
			const parent = declarations.get(name);
			return parent ? inheritedMembers(parent, declarations, seen) : [];
		}),
	];
}

function literalValues(text) {
	return [...text.matchAll(/'([^']*)'|(-?\d+(?:\.\d+)?)/g)].map((match) => match[1] ?? match[2]);
}

/** Set on any form control and read by nldd-validation-list, which is its sibling. */
const FORM_INPUT_ATTRS = { unmet: {} };

/** @returns {Record<string, { attrs: object, slots: string[], anySlot: boolean }>} */
export function buildContract(manifest) {
	const declarations = declarationsByName(manifest);
	const tags = {};
	for (const declaration of declarations.values()) {
		if (!declaration.customElement || !declaration.tagName) continue;
		const attrs = {};
		const childAttrs = {};
		for (const attribute of inheritedAttributes(declaration, declarations)) {
			const target = attribute.forChildren ? childAttrs : attrs;
			if (target[attribute.name]) continue;
			const entry = {};
			const literals = attribute.expandedType?.text ?? (attribute.forChildren && attribute.type?.text);
			if (literals && literals.includes("'")) entry.values = literalValues(literals);
			if (attribute.deprecated) entry.deprecated = attribute.deprecated;
			target[attribute.name] = entry;
		}
		const members = inheritedMembers(declaration, declarations);
		if (members.some((member) => member.name === 'isFormInput')) Object.assign(attrs, FORM_INPUT_ATTRS);
		const slots = (declaration.slots ?? []).map((slot) => slot.name);
		tags[declaration.tagName] = {
			attrs,
			childAttrs,
			// Set from a framework, so `:annotations="a"` is fine without an attribute.
			props: members.filter((member) => member.kind === 'field' && !member.attribute).map((member) => member.name),
			slots: slots.filter((slot) => slot !== '*'),
			anySlot: slots.includes('*'),
			...(declaration.deprecated ? { deprecated: declaration.deprecated } : {}),
		};
	}
	return tags;
}

/** Tag classes rules can select on, so no rule carries its own list of tags. */
export function buildClasses(manifest) {
	const elements = manifest.modules
		.flatMap((module) => module.declarations ?? [])
		.filter((declaration) => declaration.customElement && declaration.tagName);
	const tags = (predicate) => elements.filter(predicate).map((element) => element.tagName).sort();
	return {
		// Native controls count too, as in nldd-form-field. Natives have no manifest entry.
		'form-input': [...tags((element) => element.members?.some((member) => member.name === 'isFormInput')), 'input', 'select', 'textarea'].sort(),
		cell: tags((element) => element.tagName.endsWith('-cell')),
	};
}

/** Attributes that mean something by being there, where `x=""` still counts. */
export function booleanAttributes(manifest) {
	const types = new Map();
	for (const declaration of manifest.modules.flatMap((module) => module.declarations ?? [])) {
		for (const attribute of declaration.attributes ?? []) {
			const isBoolean = attribute.type?.text === 'boolean';
			types.set(attribute.name, (types.get(attribute.name) ?? true) && isBoolean);
		}
	}
	return new Set([...types].filter(([, isBoolean]) => isBoolean).map(([name]) => name));
}

function requireValue(tokens, booleans) {
	return tokens.flatMap((token) => {
		if (token.type === 'pseudo' && Array.isArray(token.data)) {
			return [{ ...token, data: token.data.map((inner) => requireValue(inner, booleans)) }];
		}
		if (token.type !== 'attribute' || token.action !== 'exists' || booleans.has(token.name) || token.name === 'slot') {
			return [token];
		}
		// A component reflects an unset string as `href=""`, and that is no link.
		const empty = { ...token, action: 'equals', value: '', ignoreCase: null };
		return [token, { type: 'pseudo', name: 'not', data: [[empty]] }];
	});
}

/** Spells out in a rule that `[href]` means "has a value", in the linter and the browser alike. */
export function normalizeSelectors(rule, booleans) {
	const presence = new Set([...booleans, ...(rule.removed ?? [])]);
	const normalize = (selector) =>
		selector && stringify(parseSelector(selector).map((tokens) => requireValue(tokens, presence)));
	const normalized = { ...rule, context: normalize(rule.context) };
	if (rule.assert) normalized.assert = normalize(rule.assert);
	if (rule.report) normalized.report = normalize(rule.report);
	if (rule.count) normalized.count = { ...rule.count, of: normalize(rule.count.of) };
	return normalized;
}

/** The fixed values from the manifest as rules, so the browser checks them like the linter does. */
function valueRules(tags) {
	return Object.entries(tags).flatMap(([tag, { attrs }]) =>
		Object.entries(attrs)
			.filter(([, { values }]) => values)
			.map(([attribute, { values }]) => ({
				id: `invalid-value-${tag.replace('nldd-', '')}-${attribute}`,
				message: `\`${attribute}\` on ${tag} takes: ${values.filter(Boolean).join(', ')}.`,
				context: `${tag}[${attribute}]:not(${values.map((value) => `[${attribute}="${value}"]`).join(', ')})`,
			})),
	);
}

const toProperty = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/** `[accessible-label]` in an assert also holds for the property `accessibleLabel`. */
function propertiesIn(assert) {
	return [...new Set([...assert.matchAll(/\[([a-z-]+)\](?!:not)|\[([a-z-]+)\]:not/g)].map((match) => toProperty(match[1] ?? match[2])))];
}

/** The rules the browser runs: plain CSS, so class pseudos become lists of tags. */
export function buildDevRules(rules, classes, tags) {
	// On a running page the field has set the attribute, so no exception is needed.
	const expand = (selector) =>
		selector
		&& selector
			.replace(/, :named-by-field/, '')
			.replace(/:([a-z-]+)/g, (match, name) => (classes[name] ? `:is(${classes[name].join(', ')})` : match));
	const authored = rules
		.filter((rule) => !rule.ref)
		.map(({ id, context, assert, report, count, message }) => ({
			id,
			message,
			context: expand(context),
			...(assert ? { assert: expand(assert), properties: propertiesIn(expand(assert)) } : {}),
			...(report ? { report: expand(report) } : {}),
			...(count ? { count: { ...count, of: expand(count.of) } } : {}),
		}));
	return [...authored, ...valueRules(tags)];
}

export function loadRules(rulesDir, schema) {
	const validate = new Ajv({ allErrors: true }).compile(schema);
	const entries = readdirSync(rulesDir).filter((file) => file.endsWith('.yaml')).sort();
	return entries.map((file) => {
		const rule = parseYaml(readFileSync(join(rulesDir, file), 'utf8'));
		if (!validate(rule)) {
			const problems = validate.errors.map((error) => `${error.instancePath} ${error.message}`);
			throw new Error(`${file}: ${problems.join('; ')}`);
		}
		return { id: basename(file, '.yaml'), ...rule };
	});
}
