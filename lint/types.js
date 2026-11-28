/**
 * What the types of a project say about an expression in JSX. `{row.label}` is
 * text when its type is a string, and then a rule about text can decide where
 * the syntax alone could not. The answer comes from the project's own
 * TypeScript, read from its `node_modules`: this package brings none, and a
 * project without it keeps the answer it had, which is "unknown".
 *
 * A type that did not resolve is `any`, and `any` is unknown. So a project
 * without its dependencies installed gets fewer answers, never a wrong one.
 */

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

/** The TypeScript a file's project installed, or nothing. */
function typescriptFor(filename, cache) {
	const directory = dirname(filename);
	if (!cache.has(directory)) {
		let found;
		try {
			const require = createRequire(filename);
			const ts = require(require.resolve('typescript'));
			if (typeof ts.createLanguageService === 'function') found = ts;
		} catch {
			// Not installed here, or a compiler without this API.
		}
		cache.set(directory, found);
	}
	return cache.get(directory);
}

/** The config a file is compiled with: the nearest one, or the project it refers to that lists the file. */
function configFor(ts, filename) {
	const nearest = ts.findConfigFile(dirname(filename), ts.sys.fileExists);
	if (!nearest) return undefined;
	const read = (path) => {
		const { config, error } = ts.readConfigFile(path, ts.sys.readFile);
		return error ? undefined : { path, parsed: ts.parseJsonConfigFileContent(config, ts.sys, dirname(path)) };
	};
	const first = read(nearest);
	if (!first) return undefined;
	const lists = (config) => config.parsed.fileNames.some((name) => resolve(name) === filename);
	if (lists(first)) return first;
	for (const reference of first.parsed.projectReferences ?? []) {
		const path = ts.resolveProjectReferencePath(reference);
		const referred = existsSync(path) ? read(path) : undefined;
		if (referred && lists(referred)) return referred;
	}
	return first;
}

/** One language service per config: it keeps the files that did not change between two questions. */
function createService(ts, config) {
	const edited = new Map();
	const versions = new Map();
	const roots = new Set(config.parsed.fileNames.map((name) => resolve(name)));
	const host = {
		getCompilationSettings: () => ({ ...config.parsed.options, noEmit: true }),
		getScriptFileNames: () => [...roots],
		getScriptVersion: (name) => String(versions.get(resolve(name)) ?? 0),
		getScriptSnapshot: (name) => {
			const text = edited.get(resolve(name)) ?? (existsSync(name) ? readFileSync(name, 'utf8') : undefined);
			return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
		},
		getCurrentDirectory: () => dirname(config.path),
		getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
		fileExists: ts.sys.fileExists,
		readFile: ts.sys.readFile,
		readDirectory: ts.sys.readDirectory,
		directoryExists: ts.sys.directoryExists,
		getDirectories: ts.sys.getDirectories,
	};
	const service = ts.createLanguageService(host, ts.createDocumentRegistry());
	return {
		/** The file as the linter holds it now: a fix changes it before it is written. */
		sourceFile(filename, source) {
			roots.add(filename);
			if (edited.get(filename) !== source) {
				edited.set(filename, source);
				versions.set(filename, (versions.get(filename) ?? 0) + 1);
			}
			const program = service.getProgram();
			return { program, file: program?.getSourceFile(filename) };
		},
	};
}

/** The node that spans exactly these offsets, the outermost one when more do. */
function nodeAt(ts, file, start, end) {
	let found;
	const visit = (node) => {
		if (found || node.end < end || node.pos > start) return;
		if (node.getStart(file) === start && node.end === end) {
			found = node;
			return;
		}
		ts.forEachChild(node, visit);
	};
	visit(file);
	return found;
}

/**
 * What a value of this type renders as a child in JSX: `text` for a string or a
 * number, `nothing` for what React leaves out, and nothing said for the rest:
 * an element, `ReactNode`, `any`.
 */
function rendered(ts, checker, type) {
	const { TypeFlags } = ts;
	if (type.flags & (TypeFlags.Any | TypeFlags.Unknown)) return undefined;
	if (type.flags & (TypeFlags.Undefined | TypeFlags.Null | TypeFlags.Void | TypeFlags.BooleanLike)) return 'nothing';
	if (type.flags & (TypeFlags.StringLike | TypeFlags.NumberLike | TypeFlags.BigIntLike)) return 'text';
	if (type.isUnion()) {
		const kinds = type.types.map((part) => rendered(ts, checker, part));
		if (kinds.some((kind) => kind === undefined)) return undefined;
		return kinds.includes('text') ? 'text' : 'nothing';
	}
	if (type.flags & TypeFlags.TypeParameter) {
		const constraint = checker.getBaseConstraintOfType(type);
		return constraint && constraint !== type ? rendered(ts, checker, constraint) : undefined;
	}
	return undefined;
}

/**
 * @returns {(filename: string, source: string) => ((start: number, end: number) => 'text' | 'nothing' | undefined) | undefined}
 *   for one file as it reads now, what the expression between two offsets renders; `projects()` on it counts the configs read.
 * @param {{ compiler?: object }} [options] - a TypeScript module to use instead of the project's own
 */
export function createTypes({ compiler } = {}) {
	const compilers = new Map();
	const configs = new Map();
	const services = new Map();
	const unanswered = new Set();
	const typesOf = (filename, source) => {
		try {
			const ts = compiler ?? typescriptFor(filename, compilers);
			if (!ts) {
				unanswered.add(filename);
				return undefined;
			}
			const directory = dirname(filename);
			if (!configs.has(directory)) configs.set(directory, configFor(ts, filename));
			const config = configs.get(directory);
			if (!config) return undefined;
			if (!services.has(config.path)) services.set(config.path, createService(ts, config));
			const { program, file } = services.get(config.path).sourceFile(filename, source);
			if (!file) return undefined;
			const checker = program.getTypeChecker();
			return (start, end) => {
				try {
					const node = nodeAt(ts, file, start, end);
					return node ? rendered(ts, checker, checker.getTypeAtLocation(node)) : undefined;
				} catch {
					return undefined;
				}
			};
		} catch {
			return undefined;
		}
	};
	typesOf.projects = () => services.size;
	/** How many files were asked about and had no compiler to answer. */
	typesOf.without = () => unanswered.size;
	return typesOf;
}
