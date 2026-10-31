/**
 * Compiles what the linter reads at runtime: the component contract from the
 * manifest, the icon names, and the rules from src/rules/.
 *
 * Generated once and shipped, so a pre-commit run does not parse a 2 MB manifest.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import Ajv from 'ajv';
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

function literalValues(text) {
	return [...text.matchAll(/'([^']*)'|(-?\d+(?:\.\d+)?)/g)].map((match) => match[1] ?? match[2]);
}

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
		const slots = (declaration.slots ?? []).map((slot) => slot.name);
		tags[declaration.tagName] = {
			attrs,
			childAttrs,
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
		'form-input': tags((element) => element.members?.some((member) => member.name === 'isFormInput')),
		cell: tags((element) => element.tagName.endsWith('-cell')),
	};
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
