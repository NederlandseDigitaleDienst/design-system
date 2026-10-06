/**
 * Works out what kind of control an attribute gets, and which values it offers.
 *
 * custom-elements.json knows every attribute, but for most of them only the
 * name of its type: `Appearance`, `Size | undefined`. The values behind such a
 * name are in the source, as `type Appearance = 'primary' | 'secondary' | …`,
 * so they are read from there. Type names are not unique across the package
 * (many components have their own `Size`), which is why an alias is resolved
 * from the file that declares the element, following its imports.
 *
 * Where the type is just `string` the description often lists the values
 * (`'stack' | 'row' | 'wrap'`). Those are offered as suggestions, not as the
 * only choices, because prose is not a contract.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';

const parsed = new Map();

function parse(file) {
	if (!parsed.has(file)) {
		const source = existsSync(file)
			? ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ES2020, true)
			: null;
		parsed.set(file, source);
	}
	return parsed.get(file);
}

/** The file a relative import points at; the sources import `./x.js` for `x.ts`. */
function resolveImport(from, specifier) {
	if (!specifier.startsWith('.')) return null;
	const base = resolve(dirname(from), specifier);
	return [base.replace(/\.js$/, '.ts'), `${base}.ts`, base].find((candidate) => existsSync(candidate)) ?? null;
}

function findAlias(file, name, seen = new Set()) {
	const key = `${file}#${name}`;
	if (seen.has(key)) return null;
	seen.add(key);
	const source = parse(file);
	if (!source) return null;
	for (const statement of source.statements) {
		if (ts.isTypeAliasDeclaration(statement) && statement.name.text === name) {
			return { file, node: statement.type };
		}
	}
	for (const statement of source.statements) {
		const named =
			(ts.isImportDeclaration(statement) && statement.importClause?.namedBindings) ||
			(ts.isExportDeclaration(statement) && statement.exportClause);
		if (!named || !ts.isNamedImports(named) && !ts.isNamedExports(named)) continue;
		const match = named.elements.find((element) => element.name.text === name);
		if (!match || !statement.moduleSpecifier) continue;
		const target = resolveImport(file, statement.moduleSpecifier.text);
		if (target) return findAlias(target, (match.propertyName ?? match.name).text, seen);
	}
	return null;
}

/** The literal values of a type node, or null when it is not a closed set. */
function literalsOf(file, node, seen = new Set()) {
	if (ts.isParenthesizedTypeNode(node)) return literalsOf(file, node.type, seen);
	if (ts.isUnionTypeNode(node)) {
		const values = [];
		for (const member of node.types) {
			if (member.kind === ts.SyntaxKind.UndefinedKeyword) continue;
			if (ts.isLiteralTypeNode(member) && member.literal.kind === ts.SyntaxKind.NullKeyword) continue;
			const part = literalsOf(file, member, seen);
			if (!part) return null;
			values.push(...part);
		}
		return values;
	}
	if (ts.isLiteralTypeNode(node)) {
		if (ts.isStringLiteral(node.literal)) return [node.literal.text];
		if (ts.isNumericLiteral(node.literal)) return [node.literal.text];
		return null;
	}
	if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
		const alias = findAlias(file, node.typeName.text, seen);
		return alias ? literalsOf(alias.file, alias.node, seen) : null;
	}
	return null;
}

function typeValues(file, typeText) {
	const node = ts.createSourceFile('type.ts', `type T = ${typeText};`, ts.ScriptTarget.ES2020, true).statements[0];
	if (!node || !ts.isTypeAliasDeclaration(node)) return null;
	const values = literalsOf(file, node.type);
	return values && values.length > 1 ? [...new Set(values)] : null;
}

/** A run of quoted values in prose: `'stack' | 'row' | 'wrap'`. */
function proseValues(description = '') {
	const run = description.match(/'[^']*'(?:\s*\|\s*'[^']*')+/);
	if (!run) return null;
	return [...run[0].matchAll(/'([^']*)'/g)].map((m) => m[1]);
}

function unquote(text) {
	const match = text?.match(/^'(.*)'$|^"(.*)"$/);
	return match ? (match[1] ?? match[2]) : text;
}

/**
 * @param {string} file - absolute path of the module that declares the element
 * @param {{ name: string, type?: { text: string }, default?: string, description?: string }} attribute
 * @returns {{ name: string, kind: 'boolean'|'number'|'select'|'text', values?: string[],
 *   strict?: boolean, default?: string, description: string } | null} null for
 *   an attribute a control cannot set, such as an object
 */
export function controlFor(file, attribute) {
	const type = (attribute.type?.text ?? 'string').replace(/\s*\|\s*(undefined|null)\b/g, '').trim();
	const base = {
		name: attribute.name,
		default: attribute.default === undefined ? undefined : unquote(attribute.default),
		description: (attribute.description ?? '').replace(/\s+/g, ' ').trim(),
	};
	if (type === 'boolean') return { ...base, kind: 'boolean' };
	if (type === 'number') return { ...base, kind: 'number' };
	if (/^(object|Function|Partial<|Record<|Array<|\{)/.test(type) || type.endsWith('[]')) return null;
	if (type !== 'string') {
		const values = typeValues(file, type);
		if (values) return { ...base, kind: 'select', values, strict: true };
	}
	const suggested = proseValues(attribute.description);
	if (suggested) return { ...base, kind: 'select', values: suggested, strict: false };
	return { ...base, kind: 'text' };
}
