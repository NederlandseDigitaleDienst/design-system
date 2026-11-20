/**
 * What the linter reads in CSS: top-level blocks, the tokens a stylesheet names
 * or declares, and the rules that tell the design system's own CSS apart from an app's,
 * also after a bundler has flattened and minified it.
 */

/**
 * The prefixes of the tokens the design system ships, in variables.css. A context variable
 * is one only where variables.css gives it a default.
 */
export const TOKEN_PREFIX = /^--(primitives|semantics|components|context)-/;

const STRING = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/.source;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/.source;
const LINE_COMMENT = /(?<![:"'(=\\])\/\/[^\n]*/.source;
const COMMENTS = new Map();

/**
 * Comments blanked out, so every offset still points at the source. Line comments
 * only where they exist: in HTML `//` starts a url, and a built page is one line.
 * A quoted string is kept, so `"a // b"` or `"/*"` starts no comment. Prose in
 * markup has apostrophes, so there strings are off unless asked for.
 */
export const withoutComments = (source, lineComments = true, strings = lineComments) => {
	const key = `${lineComments}${strings}`;
	if (!COMMENTS.has(key)) COMMENTS.set(key, new RegExp([...(strings ? [STRING] : []), BLOCK_COMMENT, ...(lineComments ? [LINE_COMMENT] : [])].join('|'), 'g'));
	return source.replace(COMMENTS.get(key), (text) => (text[0] === '"' || text[0] === "'" ? text : text.replace(/[^\n]/g, ' ')));
};

/** Strings and url() can hold a brace or a semicolon, so their contents are blanked. */
const withoutStrings = (source) => source.replace(/(["'])(?:\\.|(?!\1).)*\1|url\([^)]*\)/g, (text) => text[0] + ' '.repeat(text.length - 1));

/**
 * Each top-level block of a stylesheet: a rule with its braces, or a statement up to
 * its semicolon. In Sass without braces a block is a line that starts at the margin.
 * @returns {{ start: number, end: number }[]}
 */
export function cssBlocks(source, indented = false) {
	const plain = withoutStrings(withoutComments(source));
	if (indented) {
		const starts = [...plain.matchAll(/^\S/gm)].map((match) => match.index);
		return starts.map((start, index) => ({ start, end: starts[index + 1] ?? plain.length }));
	}
	const blocks = [];
	let depth = 0;
	let start = -1;
	for (let at = 0; at < plain.length; at++) {
		const char = plain[at];
		if (start < 0 && depth === 0 && /\S/.test(char)) start = at;
		if (char === '{') depth += 1;
		else if (char === '}') {
			depth = Math.max(0, depth - 1);
			if (depth === 0 && start >= 0) {
				blocks.push({ start, end: at + 1 });
				start = -1;
			}
		} else if (char === ';' && depth === 0 && start >= 0) {
			blocks.push({ start, end: at + 1 });
			start = -1;
		}
	}
	if (start >= 0) blocks.push({ start, end: plain.length });
	return blocks;
}

/**
 * How a minifier writes a selector or an at-rule prelude: no quotes, no `*` before a
 * pseudo-class or attribute, single colons, no space around combinators, and media
 * ranges for min- and max-width.
 */
function normalizePrelude(prelude) {
	return prelude
		.toLowerCase()
		.replace(/["']/g, '')
		.replace(/::(before|after|first-line|first-letter)/g, ':$1')
		.replace(/\*(?=[:[.#])/g, '')
		.replace(/\s+/g, ' ')
		.replace(/\s*([>+~,(){};=])\s*/g, '$1')
		.replace(/:\s+/g, ':')
		.replace(/\((min|max)-(width|height|inline-size|block-size):([^)]+)\)/g, (_, bound, axis, value) => `(${axis}${bound === 'min' ? '>=' : '<='}${value})`)
		.replace(/\s*(>=|<=)\s*/g, '$1')
		.trim();
}

/** A selector list split at its own commas, not at those inside `:is()` or `:not()`. */
function splitList(list) {
	const parts = [];
	let depth = 0;
	let current = '';
	for (const char of list) {
		if (char === '(') depth += 1;
		if (char === ')') depth -= 1;
		if (char === ',' && depth === 0) {
			parts.push(current.trim());
			current = '';
		} else current += char;
	}
	if (current.trim()) parts.push(current.trim());
	return parts;
}

/** A nested selector written out in full, as a minifier does when it flattens nesting. */
function nest(parent, child) {
	if (!parent) return child;
	return child.includes('&') ? child.replaceAll('&', parent) : `${parent} ${child}`;
}

/** At-rules whose block holds descriptors or frames, not rules: one entry, by their prelude. */
const OPAQUE_AT_RULE = /^@(font-face|keyframes|-webkit-keyframes|property|page|counter-style|font-feature-values|view-transition)\b/;

/** What a bundler adds or rewrites, so it says nothing about whose CSS it is. */
const ADDED_PROPERTY = /^(-(webkit|moz|ms|o)-|--lightningcss-)/;

/**
 * Every rule in a stylesheet, flattened the way a bundler flattens nesting: its
 * conditions and full selector, with the properties it sets. A fallback a bundler
 * adds in `@supports` is not a condition of the source, so it is left out.
 * @returns {Map<string, Set<string>>}
 */
export function cssRules(source) {
	// The structure from the text with strings blanked, the selectors from the text itself.
	const text = withoutComments(source);
	const plain = withoutStrings(text);
	const rules = new Map();
	const add = (key, name) => {
		if (!rules.has(key)) rules.set(key, new Set());
		if (name && ADDED_PROPERTY.test(name)) rules.get(key).added = true;
		else if (name) rules.get(key).add(name);
	};
	const read = (from, to, conditions, selectors, flat = false) => {
		let at = from;
		while (at < to) {
			let end = at;
			while (end < to && plain[end] !== '{' && plain[end] !== ';' && plain[end] !== '}') end += 1;
			const head = text.slice(at, end).trim();
			if (end >= to || plain[end] !== '{') {
				const name = head.match(/^(--[\w-]+|-?[a-zA-Z][\w-]*)\s*:/)?.[1]?.toLowerCase();
				if (name) for (const selector of selectors) add(`${conditions}|${selector}`, name);
				at = end + 1;
				continue;
			}
			let depth = 1;
			let close = end + 1;
			for (; close < to && depth > 0; close += 1) {
				if (plain[close] === '{') depth += 1;
				if (plain[close] === '}') depth -= 1;
			}
			const prelude = normalizePrelude(head);
			if (flat) {
				// A frame of a @keyframes: what it animates is part of that one entry.
			} else if (OPAQUE_AT_RULE.test(prelude)) {
				// Stands for itself, also when its frames set nothing at its own level.
				add(`${conditions}|${prelude}`, prelude.slice(0, prelude.search(/\s|$/)));
				read(end + 1, close - 1, conditions, [prelude], true);
			} else if (prelude.startsWith('@')) {
				read(end + 1, close - 1, prelude.startsWith('@supports') ? conditions : `${conditions}${prelude}`, selectors.length > 0 ? selectors : ['']);
			} else {
				const nested = selectors.flatMap((parent) => splitList(prelude).map((child) => normalizePrelude(nest(parent, child))));
				for (const selector of nested) add(`${conditions}|${selector}`);
				read(end + 1, close - 1, conditions, nested);
			}
			at = close;
		}
	};
	read(0, plain.length, '', ['']);
	return rules;
}

/**
 * Whether CSS is the design system's own: every rule in it is one the design system has, with no
 * property the design system does not set there. Values do not count, since a bundler
 * rewrites colors, urls and units; what a rule selects and sets survives. A token that
 * `isKnown` does not know is never the design system's, so an app's override with a typo is not either.
 */
export function isDesignSystemCss(css, designSystemCss, isKnown) {
	const rules = [...cssRules(css)];
	return (
		rules.length > 0 &&
		rules.every(([key, names]) => {
			// A rule with only what a bundler adds, such as its light-dark() fallback, is not
			// anyone's. An empty one is the app's: a minifier drops the design system's empty rules.
			if (names.size === 0) return Boolean(names.added);
			return Boolean(designSystemCss[key]) && [...names].every((name) => designSystemCss[key].includes(name));
		}) &&
		(!isKnown || tokenReferences(css).every(({ name }) => isKnown(name)))
	);
}

/** isDesignSystemCss for one set of data, read once per CSS text: a `<style>` is asked more than once. */
export function designSystemTester(designSystemCss = {}, isKnown = undefined) {
	const seen = new Map();
	return (css) => {
		if (!seen.has(css)) seen.set(css, isDesignSystemCss(css, designSystemCss, isKnown));
		return seen.get(css);
	};
}

/** The design system's tokens a stylesheet names: `var(--semantics-…)`, without names built at runtime. */
export function tokenReferences(source, lineComments = true) {
	return tokenReferencesIn(withoutComments(source, lineComments));
}

/** tokenReferences in text whose comments are already blanked. */
export function tokenReferencesIn(plain) {
	return [...plain.matchAll(/var\(\s*(--(?:primitives|semantics|components|context)-[\w-]*)(?=\s*[,)])/g)]
		.filter((match) => !match[1].endsWith('-'))
		.map((match) => ({
			name: match[1],
			offset: match.index + match[0].indexOf(match[1]),
			// `var(--a, red)`: while the token does not exist, the fallback is what shows.
			fallback: /^\s*,/.test(plain.slice(match.index + match[0].length)),
		}));
}

/**
 * Where the rule, style attribute or style string around an offset starts and ends:
 * the nearest unmatched brace, or the quote that opens it. In a stylesheet or a style
 * object a quote is part of the rule, so `quotes: false` counts braces only, and
 * `strings: true` skips the braces in strings between `from` and `to`.
 */
export function enclosingBlock(plain, offset, { quotes = true, strings = false, from = 0, to = plain.length } = {}) {
	const QUOTES = quotes ? '"\'`' : '';
	const text = strings ? plain.slice(0, from) + withoutStrings(plain.slice(from, to)) + plain.slice(to) : plain;
	let start = offset;
	for (let depth = 0; start > from; start--) {
		const char = text[start - 1];
		if (char === '}') depth++;
		else if (char === '{' && depth-- === 0) break;
		else if (depth === 0 && QUOTES.includes(char)) break;
	}
	let end = offset;
	for (let depth = 0; end < to; end++) {
		const char = text[end];
		if (char === '{') depth++;
		else if (char === '}' && depth-- === 0) break;
		else if (depth === 0 && QUOTES.includes(char)) break;
	}
	return { start, end };
}

/**
 * Custom properties a stylesheet declares, such as `--semantics-…: red`, `--_button-gap: 0`
 * or `@property --context-…`, also as a quoted key of a style object or through `setProperty()`.
 */
export function declarations(source, lineComments = true) {
	return declarationsIn(withoutComments(source, lineComments));
}

/** declarations in text whose comments are already blanked. */
export function declarationsIn(plain) {
	return [...plain.matchAll(/(?:^|[;{\s"'`])(--[\w-]+)["'`]?\s*:(?!:)|@property\s+(--[\w-]+)|setProperty\(\s*["'`](--[\w-]+)["'`]/g)].map((match) => {
		const name = match[1] ?? match[2] ?? match[3];
		return { name, offset: match.index + match[0].indexOf(name) };
	});
}
