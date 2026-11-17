/**
 * The components as every generator and check reads them: one element per
 * custom element in custom-elements.json, with its attributes resolved.
 *
 * The analyzer has already applied inheritance: an element's `attributes` and
 * `members` hold what its mixins and superclasses bring in, marked with
 * `inheritedFrom`. Nothing here walks mixins again, so the linter, the
 * reference and the framework types agree on what a tag takes. Where the
 * manifest has no description for an inherited attribute, the `@attr` line in
 * the JSDoc of the mixin it comes from fills it in.
 *
 * The manifest is generated (`npm run generate:cem`), so whatever reads it runs
 * after that.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aliases } from '../../src/components/content/icon/icon-aliases.js';
import { parseTypedTag } from './component-jsdoc.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Ships a custom element but is not part of the consumer-facing API. */
export const INTERNAL_TAGS = new Set(['nldd-lqip-encoder']);

export function readManifest(root = repoRoot) {
	return JSON.parse(readFileSync(resolve(root, 'custom-elements.json'), 'utf8'));
}

/**
 * The `@attr` lines in the JSDoc of each mixin (`@mixin Name`), by mixin and
 * attribute name: where an inherited attribute gets its description when the
 * manifest has none.
 */
export function mixinAttributeDocs(root = repoRoot) {
	const dir = resolve(root, 'src/utilities');
	const docs = new Map();
	for (const entry of readdirSync(dir)) {
		if (!entry.endsWith('.ts') || entry.endsWith('.test.ts')) continue;
		const source = readFileSync(join(dir, entry), 'utf8');
		const name = source.match(/@mixin\s+(\w+)/)?.[1];
		if (!name) continue;
		const attrs = new Map();
		for (const line of source.split('\n')) {
			const rest = line.match(/^\s*\*\s*@attr\s+(.*)$/)?.[1];
			if (!rest) continue;
			const attr = parseTypedTag(rest);
			attrs.set(attr.name, attr);
		}
		if (attrs.size > 0) docs.set(name, attrs);
	}
	return docs;
}

/**
 * @typedef {object} Element
 * @property {string} tag
 * @property {string} className
 * @property {string} path - the module, as in the manifest (`src/…/button.ts`)
 * @property {string} subpath - the package export it comes from (`button`)
 * @property {boolean} anonymous - a class without a name of its own, so no type to import
 * @property {boolean} internal - shipped, but not part of the consumer-facing API
 * @property {object[]} attributes - own and inherited, one per name; an inherited one
 *   documented in its mixin carries that `@attr` as `doc` ({ name, type, description })
 * @property {object} declaration - the manifest declaration, for whatever else a reader needs
 */

/** @returns {Element[]} sorted by tag */
export function componentModel(manifest, { mixinDocs = new Map() } = {}) {
	const elements = [];
	for (const module of manifest.modules ?? []) {
		// Only the module is exported, not each element in it, so the type of
		// nldd-menu-item comes from the path of menu.ts.
		const subpath = module.path.split('/').pop().replace(/\.ts$/, '');
		for (const declaration of module.declarations ?? []) {
			if (!declaration.customElement || !declaration.tagName) continue;
			const seen = new Set();
			const attributes = [];
			for (const attribute of declaration.attributes ?? []) {
				if (seen.has(attribute.name)) continue;
				seen.add(attribute.name);
				const doc = attribute.inheritedFrom && mixinDocs.get(attribute.inheritedFrom.name)?.get(attribute.name);
				attributes.push(doc ? { ...attribute, description: attribute.description || doc.description, doc } : attribute);
			}
			elements.push({
				tag: declaration.tagName,
				className: declaration.name,
				path: module.path,
				subpath,
				anonymous: /^anonymous_/.test(declaration.name),
				internal: INTERNAL_TAGS.has(declaration.tagName),
				attributes,
				declaration,
			});
		}
	}
	return elements.sort((a, b) => a.tag.localeCompare(b.tag));
}

/** The model of this repository, with the mixin docs filled in. */
export function loadComponentModel(root = repoRoot) {
	return componentModel(readManifest(root), { mixinDocs: mixinAttributeDocs(root) });
}

/** The valid `icon` values: the SVG files and the aliases, each sorted. */
export function iconCatalog(root = repoRoot) {
	const names = readdirSync(resolve(root, 'src/components/content/icon/icons'))
		.filter((file) => file.endsWith('.svg'))
		.map((file) => file.slice(0, -4))
		.sort();
	return { names, aliases: Object.keys(aliases).sort() };
}

export const toCamel = (name) => name.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());

export const toPascal = (name) => {
	const camel = toCamel(name);
	return camel.charAt(0).toUpperCase() + camel.slice(1);
};

/** A boolean attribute, also one typed `boolean | undefined` for a third state. */
export function isBooleanAttribute(attribute) {
	const parts = (attribute.type?.text ?? '').split('|').map((part) => part.trim()).filter((part) => part && part !== 'undefined');
	return parts.length === 1 && parts[0] === 'boolean';
}

/** One JSDoc line, so hovering a prop in an editor shows what it does. */
export function docComment(text, indent) {
	return text ? `\n${indent}/** ${String(text).replace(/\s+/g, ' ').replace(/\*\//g, '*\\/')} */` : '';
}

/**
 * The type of an attribute as the reference shows it: what its `@attr` line says,
 * or else the type in the manifest, without the `undefined` of an optional one.
 */
export function attributeTypeText(attribute) {
	if (attribute.doc?.type) return attribute.doc.type;
	const text = attribute.expandedType?.text ?? attribute.type?.text ?? '';
	return text.split('|').map((part) => part.trim()).filter((part) => part && part !== 'undefined').join(' | ');
}
