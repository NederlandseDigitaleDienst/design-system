import { LanguageDescription, LanguageSupport, StreamLanguage } from '@codemirror/language';

/* Lazy per-language loading: each grammar is a separate dynamic import, so a
 * page only downloads the grammars it actually renders (mirrors how the old
 * Prism-based code-viewer loaded grammars on demand). Shared by the editor
 * and the read-only viewer. */
type Loader = () => Promise<LanguageSupport>;

const loaders: Record<string, Loader> = {
	json: async () => (await import('@codemirror/lang-json')).json(),
	yaml: async () => (await import('@codemirror/lang-yaml')).yaml(),
	javascript: async () => (await import('@codemirror/lang-javascript')).javascript(),
	typescript: async () => (await import('@codemirror/lang-javascript')).javascript({ typescript: true }),
	css: async () => (await import('@codemirror/lang-css')).css(),
	html: async () => (await import('@codemirror/lang-html')).html(),
	xml: async () => (await import('@codemirror/lang-xml')).xml(),
	python: async () => (await import('@codemirror/lang-python')).python(),
	rust: async () => (await import('@codemirror/lang-rust')).rust(),
	sql: async () => (await import('@codemirror/lang-sql')).sql(),
	markdown: async () => (await import('@codemirror/lang-markdown')).markdown(),
	// No official lang-* package — wrap the legacy StreamLanguage modes.
	bash: async () => new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/shell')).shell)),
	toml: async () => new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/toml')).toml)),
	gherkin: async () => new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/gherkin')).gherkin)),
};

const cache = new Map<string, Promise<LanguageSupport>>();

export function isLanguageSupported(name: string): boolean {
	return Object.prototype.hasOwnProperty.call(loaders, name);
}

export function loadLanguage(name: string): Promise<LanguageSupport> | undefined {
	const loader = loaders[name];
	if (!loader) return undefined;
	let pending = cache.get(name);
	if (!pending) {
		// Drop the cache entry on failure so a later attempt can retry
		// (e.g. a transient chunk-load failure on a flaky network).
		pending = loader().catch((err) => {
			cache.delete(name);
			throw err;
		});
		cache.set(name, pending);
	}
	return pending;
}

/** Other names a code block may give for a supported language, as people write
 *  them after the backticks. */
const ALIASES: Record<string, string[]> = {
	javascript: ['js', 'jsx', 'mjs', 'cjs'],
	typescript: ['ts', 'tsx'],
	python: ['py'],
	bash: ['sh', 'shell', 'zsh', 'console'],
	yaml: ['yml'],
	markdown: ['md'],
	html: ['htm'],
	rust: ['rs'],
};

/** The supported languages as CodeMirror language descriptions, for a parser
 *  that highlights code nested in another language (a code block in markdown).
 *  Each one loads its grammar only when a block names it. */
export const nestedLanguages: LanguageDescription[] = Object.keys(loaders).map((name) => LanguageDescription.of({
	name,
	alias: ALIASES[name] ?? [],
	load: () => loadLanguage(name)!,
}));
