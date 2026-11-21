/**
 * Lints one source text: parse, built-in checks from the component contract,
 * rules from src/rules/, then the suppressions written in the file.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { declarationsIn, designSystemTester, enclosingBlock, TOKEN_PREFIX, tokenReferencesIn, withoutComments } from './css.js';
import { createEngine } from './engine.js';
import { canFix, stuckTags } from './fix.js';
import { applyWrappers, parseSource, parseStylesheet, readerOf } from './frontends.js';
import { BUILT_IN_RULES, createCanonical, loadData, OPT_IN_GROUPS } from './rule-data.js';
import { BOUND, walk } from './tree.js';

export { BUILT_IN_RULES, createCanonical, loadData };


/** Valid on any element, so the manifest does not list them per component. */
const GLOBAL_ATTRIBUTE =
	/^(id|class|style|slot|hidden|lang|dir|title|role|tabindex|part|inert|draggable|contenteditable|spellcheck|translate|accesskey|autofocus|enterkeyhint|inputmode|is|nonce|popover|key|ref|exportparts|item(prop|scope|type|id|ref)|i18n(-.*)?|data-.*|aria-.*|hx-.*|x-.*|on(?!ly$)[a-z]+)$/;

/** Set as a property on any element: in markup these are bindings, not attributes. */
const DOM_PROPERTY = /^(textContent|innerHTML|innerText|outerHTML|className|tabIndex|aria[A-Z].*)$/;

/** An Angular directive of the app. Angular's own, such as `ngIf` and `routerLink`, take no inputs here. */
const APP_DIRECTIVE = /^(?!(ng|router|form)[A-Z])[a-z]+[A-Z]/;
const hasAppDirective = (node) => [...node.attrs.keys()].some((name) => APP_DIRECTIVE.test(name));

const ICON_ATTRIBUTES = new Set(['icon', 'start-icon', 'end-icon', 'selected-icon']);


const toCamelCase = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/** `[accessibleLabel]` and `:accessibleLabel` set the same thing as `accessible-label`. */
function readPropertyNames(roots, tags, isPlainHtml) {
	const visit = (node) => {
		const contract = tags[node.name];
		for (const [name, value] of contract ? [...node.attrs] : []) {
			const attribute = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
			// In HTML itself a capital means nothing: the browser lowercases the name.
			if (attribute === name || !contract.attrs[attribute] || (isPlainHtml && value !== BOUND)) continue;
			node.attrs.delete(name);
			node.attrs.set(attribute, value);
		}
	};
	for (const root of roots) walk(root, visit);
	return roots;
}

/** What the components around a node read off anything inside them, such as `sidebar-section-only`. */
function fromAncestors(node, tags, anyDescendantAttrs) {
	const attrs = {};
	for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
		// An ancestor in another file may be the one reading it.
		if (ancestor.opaque) return { ...anyDescendantAttrs, ...attrs };
		Object.assign(attrs, tags[ancestor.name]?.descendantAttrs);
	}
	return attrs;
}

/** Per tag and attribute, the rules in `api` about a name that is gone: `nldd-text-editor` → `appearance` → its two rules. */
function removedAttributeRules(rules) {
	const by = {};
	for (const rule of rules) {
		if (rule.group !== 'api' || !rule.removed) continue;
		for (const [tag] of rule.context.matchAll(/\bnldd-[\w-]+/g)) {
			for (const name of rule.removed) ((by[tag] ??= {})[name] ??= new Set()).add(rule.id);
		}
	}
	return by;
}

function checkAttributes(node, { tags, icons, anyChildAttrs, anyDescendantAttrs, globalAttrs, isPlainHtml, removedBy = {} }, report) {
	if (node.templated) return;
	const contract = tags[node.name];
	// A parent in another file may be the one reading it, so any child attribute goes.
	const fromParent = {
		...globalAttrs,
		...fromAncestors(node, tags, anyDescendantAttrs),
		...(node.parent.opaque ? anyChildAttrs : (tags[node.parent.name]?.childAttrs ?? {})),
	};
	for (const [name, value] of node.attrs) {
		const attribute = contract.attrs[name] ?? fromParent[name];
		if (ICON_ATTRIBUTES.has(name) && attribute && typeof value === 'string' && value !== '') {
			if (!icons.has(value)) report('unknown-icon', `There is no icon named "${value}".`);
		}
		if (attribute?.deprecated) {
			const detail = attribute.deprecated === true ? '' : ` ${attribute.deprecated}`;
			report('deprecated', `\`${name}\` on ${node.name} is deprecated.${detail}`, name);
		}
		if (attribute) {
			if (attribute.values && typeof value === 'string' && !attribute.values.includes(value)) {
				const allowed = attribute.values.filter(Boolean).join(', ');
				report('invalid-value', `\`${name}="${value}"\` is not valid on ${node.name}: use ${allowed}.`, name);
			}
		} else if (value === BOUND && contract.props.includes(toCamelCase(name))) {
			// A property without an attribute, which only a binding can reach.
		} else if (value === BOUND && DOM_PROPERTY.test(name)) {
			// Every element has this one.
		} else if (isPlainHtml && /[A-Z]/.test(name)) {
			// HTML has no capitals, so in an .html file this is a template directive.
		} else if (contract.attrs[name.toLowerCase()]) {
			// `maxLength`: no such property, so it ends up as the attribute, in lowercase.
		} else if (!GLOBAL_ATTRIBUTE.test(name.toLowerCase()) && !node.wrapped) {
			// `[show]` next to `appSheetSync` may be an input of that directive, or a typo.
			const maybeInput = isPlainHtml && value === BOUND && hasAppDirective(node);
			if (maybeInput) report('unknown-attribute', `${node.name} has no attribute \`${name}\`. That is fine if a directive on this element takes it.`, name, 'hint');
			else {
				// A bound value of a name that is gone: the rules about its values say what took its place.
				const gone = [...(removedBy[node.name]?.[name] ?? [])];
				const see = gone.length > 0 ? ` It was removed: see ${gone.map((id) => `\`nldd explain ${id}\``).join(' and ')}.` : '';
				report('unknown-attribute', `${node.name} has no attribute \`${name}\`.${see}`, name);
			}
		}
	}
}

/**
 * The keys in a `translations` attribute written as JSON. An element reads only its
 * own keys, so a key another component has, or one that was renamed, does nothing.
 */
function checkTranslationKeys(node, { translations, removedKeys }, report) {
	const value = node.attrs.get('translations');
	const own = translations[node.name];
	if (typeof value !== 'string' || !own) return;
	let keys;
	try {
		const parsed = JSON.parse(value);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;
		keys = Object.keys(parsed);
	} catch {
		return;
	}
	for (const key of keys) {
		if (own.includes(key)) continue;
		const removed = removedKeys[key];
		const owner = Object.keys(translations).find((tag) => translations[tag].includes(key));
		const message = removed
			? `\`${key}\` was removed after ${removed.last}.${removed.use && own.includes(removed.use) ? ` Use \`${removed.use}\`.` : ''}`
			: owner
				? `\`${key}\` belongs to ${owner}, so ${node.name} does not read it.`
				: `${node.name} has no translation key \`${key}\`.`;
		report('translation-key-not-found', message, 'translations');
	}
}

function checkSlot(node, tags, report) {
	const slot = node.attrs.get('slot');
	const parent = node.parent;
	if (typeof slot !== 'string' || !slot || parent.opaque || !parent.name.startsWith('nldd-')) return;
	const contract = tags[parent.name];
	if (contract && !contract.anySlot && !contract.slots.includes(slot)) {
		report('unknown-slot', `${parent.name} has no slot "${slot}".`, 'slot');
	}
}

function builtInFindings(root, context) {
	const { tags } = context;
	const findings = [];
	walk(root, (node) => {
		// `<nldd-*>` in running text names a family of tags and is none itself.
		if (!/^nldd-[a-z0-9-]+$/.test(node.name)) return;
		const report = (rule, message, attribute, severity = BUILT_IN_RULES[rule].severity) =>
			findings.push({ rule, severity, message, node, attribute });
		const contract = tags[node.name];
		if (!contract) {
			report('unknown-element', `${node.name} does not exist in this version.`, node.name);
			return;
		}
		checkAttributes(node, context, report);
		checkTranslationKeys(node, context, report);
		checkSlot(node, tags, report);
	});
	return findings;
}

const SUPPRESSION = /nldd-lint-disable-next-line\s+([\w-]+(?:\s*,\s*[\w-]+)*)(?:\s+--(?!-*>)\s*(\S.*?))?\s*(?:-->|\*\/|-?#\}|$)/;

function readSuppressions(source, canonical) {
	const suppressed = new Map();
	const missingReason = [];
	source.split('\n').forEach((text, index) => {
		const match = text.trimEnd().match(SUPPRESSION);
		if (!match) return;
		if (!match[2]) missingReason.push(index + 1);
		suppressed.set(index + 2, new Set(match[1].split(',').map((id) => canonical(id.trim()))));
	});
	return { suppressed, missingReason };
}

function syntaxError({ message, offset }, position) {
	const rule = 'syntax-error';
	const { severity, description } = BUILT_IN_RULES[rule];
	return { rule, severity, message: `${description} ${message}`, tag: '', ...position(offset) };
}

function createPositions(source) {
	const starts = [0];
	for (let i = 0; i < source.length; i++) if (source[i] === '\n') starts.push(i + 1);
	return (offset) => {
		let low = 0;
		let high = starts.length - 1;
		while (low < high) {
			const middle = Math.ceil((low + high) / 2);
			if (starts[middle] <= offset) low = middle;
			else high = middle - 1;
		}
		return { line: low + 1, column: offset - starts[low] + 1 };
	};
}


/** Files where `//` is no comment: in markup it starts a url, and a built page is one line. */
const MARKUP_FILE = /\.(html?|j2|jinja2?|tmpl|gohtml|vue|astro|md)$/;

const STYLESHEET_FILE = /\.(css|scss|sass|less|styl|pcss)$/;

/** Inside markup, `//` is a comment again in the script of a component and in Sass, Less and Stylus. */
const LINE_COMMENT_STYLE = /\blang\s*=\s*["']?(scss|sass|less|stylus)\b/i;

/**
 * The source with its comments blanked, region by region, and where its stylesheets are:
 * a whole stylesheet file, or each `<style>` in markup.
 * @returns {{ plain: string, sheets: [number, number][] }}
 */
function codeRegions(source, filename) {
	if (STYLESHEET_FILE.test(filename)) return { plain: withoutComments(source), sheets: [[0, source.length]] };
	if (!MARKUP_FILE.test(filename)) return { plain: withoutComments(source), sheets: [] };
	const markup = withoutComments(source, false);
	const component = /\.(vue|astro)$/.test(filename);
	const sheets = [];
	const parts = [];
	let at = 0;
	const region = (start, end, lineComments) => {
		parts.push(markup.slice(at, start), withoutComments(source.slice(start, end), lineComments, true));
		at = end;
	};
	const frontmatter = /\.astro$/.test(filename) && /^---\r?\n[\s\S]*?\n---/.exec(source);
	if (frontmatter) region(4, frontmatter[0].length - 3, true);
	for (const match of source.matchAll(/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi)) {
		// A tag inside an HTML comment is blanked in the markup.
		if (match.index < at || markup[match.index] !== '<') continue;
		const start = match.index + match[1].length + match[2].length + 2;
		const end = start + match[3].length;
		if (match[1].toLowerCase() === 'style') {
			sheets.push([start, end]);
			region(start, end, LINE_COMMENT_STYLE.test(match[2]));
		} else if (component) region(start, end, true);
	}
	parts.push(markup.slice(at));
	return { plain: parts.join(''), sheets };
}

/**
 * A stylesheet a page links to, on disk next to it: relative to the page, or from the
 * root of the site for a path that starts with a slash, as in a built site.
 */
function linkedFile(href, filename) {
	if (typeof href !== 'string' || !href || /^([a-z]+:|\/\/)/i.test(href)) return undefined;
	let path;
	try {
		path = decodeURI(href.replace(/[?#].*$/, ''));
	} catch {
		return undefined;
	}
	if (extname(path) !== '.css') return undefined;
	if (!path.startsWith('/')) {
		const file = join(dirname(filename), path);
		return existsSync(file) ? file : undefined;
	}
	for (let directory = dirname(filename); ; directory = dirname(directory)) {
		const file = join(directory, path);
		if (existsSync(file)) return file;
		if (dirname(directory) === directory) return undefined;
	}
}

export function createLinter(data = loadData(), { wrappers = {}, severities: configured = {}, projectTokens = [], undecided = () => false, types } = {}) {
	const canonical = createCanonical(data);
	const severities = Object.fromEntries(Object.entries(configured).map(([id, level]) => [canonical(id), level]));
	const context = {
		tags: data.tags,
		icons: new Set(data.icons),
		anyChildAttrs: Object.assign({}, ...Object.values(data.tags).map((tag) => tag.childAttrs)),
		anyDescendantAttrs: Object.assign({}, ...Object.values(data.tags).map((tag) => tag.descendantAttrs ?? {})),
		// Set on any element, such as `text-editor-for` on a toolbar elsewhere on the page.
		globalAttrs: Object.assign({}, ...Object.values(data.tags).map((tag) => tag.globalAttrs ?? {})),
		translations: data.translations ?? {},
		removedKeys: data.removedKeys ?? {},
		removedBy: removedAttributeRules(data.rules),
	};
	const tokens = new Set([...(data.tokens ?? []), ...projectTokens]);
	const tokenList = [...tokens];
	const removedTokens = data.removedTokens ?? {};
	const internalContext = new Set(data.internalContext ?? []);
	const isDesignSystemBlock = designSystemTester(data.designSystemCss ?? {}, (name) => tokens.has(name) || internalContext.has(name));
	const engine = createEngine({ classes: data.classes, tags: data.tags, designSystemCss: data.designSystemCss, isDesignSystemCss: isDesignSystemBlock });
	const internalMessage = (name, verb) => `\`${name}\` is wiring between design system components, so ${verb} it is not supported.`;
	// Longest first, so --_button-group-gap belongs to button-group and not to button.
	const components = Object.keys(data.tags)
		.filter((tag) => tag.startsWith('nldd-'))
		.map((tag) => tag.slice('nldd-'.length))
		.sort((a, b) => b.length - a.length);

	/** A stylesheet on disk is the design system's when every block in it is. */
	const linkedSheets = new Map();
	function isDesignSystemSheet(file) {
		if (!linkedSheets.has(file)) {
			const blocks = parseStylesheet(readFileSync(file, 'utf8')).flatMap((root) => root.children);
			linkedSheets.set(file, blocks.every((block) => isDesignSystemBlock(block.css)));
		}
		return linkedSheets.get(file);
	}

	/** A link to a stylesheet this page ships itself is judged by what is in that file, not by its name. */
	function readLinkedStylesheets(roots, filename) {
		for (const root of roots) {
			walk(root, (node) => {
				if (node.name !== 'link' || !/(^|\s)stylesheet(\s|$)/i.test(String(node.attrs.get('rel') ?? ''))) return;
				const file = linkedFile(node.attrs.get('href'), filename);
				if (file) node.designSystem = isDesignSystemSheet(file);
			});
		}
	}

	/** Where the design system's own CSS sits in this file: a bundle or a page can hold it next to the app's. */
	function designSystemRanges(roots) {
		const ranges = [];
		for (const root of roots) {
			walk(root, (node) => {
				if (node.name === 'style' && node.css !== undefined && isDesignSystemBlock(node.css)) {
					ranges.push([node.offset, node.offset + node.css.length]);
				}
			});
		}
		return (offset) => ranges.some(([start, end]) => offset >= start && offset < end);
	}

	/**
	 * What a name that stops short can be: the tokens that are this name with one more
	 * word, such as the line height a font token ends in, or the one token that starts with it.
	 */
	function longerNames(name) {
		const longer = tokenList.filter((token) => token.startsWith(`${name}-`) && !token.slice(name.length + 1).includes('-'));
		// `--primitives-font-family-mono` for `-monospace`: one token starts with what was written.
		// Not after a number: `--primitives-area-16` is no short `--primitives-area-160`.
		const starting = /\d$/.test(name) ? [] : tokenList.filter((token) => token.startsWith(name));
		if (longer.length < 2 && starting.length === 1) return ` The closest is \`${starting[0]}\`.`;
		if (longer.length < 2 || longer.length > 6) return '';
		return ` The tokens with this name end in ${longer.map((token) => `\`${token.slice(name.length)}\``).join(', ').replace(/, ([^,]*)$/, ' or $1')}.`;
	}

	const LINK_CONTEXT = ['--context-link-color', '--context-link-is-hovered-color', '--context-link-is-active-color'];

	const removedEvents = data.removedEvents ?? {};
	const eventPatterns = (() => {
		const names = Object.keys(removedEvents).sort((a, b) => b.length - a.length).map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
		if (names.length === 0) return [];
		const name = `(${names.join('|')})`;
		return [
			// addEventListener('tabchange').
			{ pattern: new RegExp(`\\b(?:add|remove)EventListener\\(\\s*(['"\`])${name}\\1`, 'dg'), fixable: true },
			// An emitter's on('tabchange'), once(…) or off(…): the same name may belong to another library, so no fix.
			{ pattern: new RegExp(`(?<![\\w$])(?:on|once|off)\\(\\s*(['"\`])${name}\\1`, 'dg'), fixable: false },
			// @tabchange and v-on: in Vue, Lit and Alpine, hx-on in htmx.
			{ pattern: new RegExp(`(?<![\\w-])(?:@|v-on:|x-on:|(?:data-)?hx-on(?::|::|-|--))${name}(?![\\w-])`, 'dg'), fixable: true },
			// (tabchange)="…" in Angular: an attribute with a quoted value, so `(tabchange) => …` in a script is not one.
			{ pattern: new RegExp(`(?<=\\s)\\(${name}\\)\\s*=\\s*['"]`, 'dg'), fixable: true },
			// A function of the app's own that takes the name, such as a hook: useEvent(ref, 'tabchange', show).
			// Its name says it is about events. That is not enough for a fix: the function may send the name
			// on a bus of the app's own, or log it, and renaming one end of that breaks it. So this reports,
			// and leaves out a function whose name says it sends, logs or builds (see SENDS below).
			{ pattern: new RegExp(`(?<![\\w$])(?<!\\bnew\\s+)(?!(?:add|remove)EventListener\\()([\\w$]*(?:[Ee]vent|[Ll]isten)[\\w$]*)\\(\\s*(?:[^()'"\`]*?,\\s*)?(['"\`])${name}\\2`, 'dg'), fixable: false, callee: 1 },
		];
	})();

	/** A function of the app that sends, logs or builds an event rather than listening to one: emitEvent, trackEvent, createEvent. */
	const SENDS = /^(?:emit|dispatch|fire|trigger|raise|send|publish|post|notify|track|log|record|report|create|make|build)/i;

	/** A listener on the name of an event a component no longer fires: it is never called, and nothing says so. */
	function eventFindings(source, filename) {
		if (eventPatterns.length === 0) return [];
		const { plain } = codeRegions(source, filename);
		const findings = [];
		for (const { pattern, fixable, callee } of eventPatterns) {
			for (const match of plain.matchAll(pattern)) {
				if (callee && SENDS.test(match[callee])) continue;
				const group = match.length - 1;
				const name = match[group];
				const [offset, endOffset] = match.indices[group];
				const { last, use } = removedEvents[name];
				const message = use
					? `\`${name}\` was renamed to \`${use}\` after ${last}, so a listener on the old name is never called.`
					: `\`${name}\` is no longer fired after ${last}, so this listener is never called.`;
				findings.push({ rule: 'event-renamed', severity: BUILT_IN_RULES['event-renamed'].severity, message, tag: name, offset, endOffset, ...(use && fixable ? { fix: { event: use } } : {}) });
			}
		}
		return findings;
	}

	/**
	 * The design system's tokens the app names, and the internal variables of a component it
	 * sets. Read from the text, so a stylesheet, a style attribute and a style object
	 * in a script all count. A token the file or the project declares itself is its own.
	 */
	function cssFindings(source, filename, roots) {
		const { plain, sheets } = codeRegions(source, filename);
		const inDesignSystemCss = designSystemRanges(roots);
		const allDeclared = declarationsIn(plain);
		const declared = allDeclared.filter((each) => !inDesignSystemCss(each.offset));
		const ownTokens = new Set(declared.map(({ name }) => name).filter((name) => TOKEN_PREFIX.test(name)));
		const findings = [];
		const report = (rule, message, { name, offset }, fix) =>
			findings.push({ rule, severity: BUILT_IN_RULES[rule].severity, message, tag: name, offset, endOffset: offset + name.length, fix });
		for (const reference of tokenReferencesIn(plain)) {
			const { name, offset, fallback } = reference;
			if (tokens.has(name) || ownTokens.has(name) || inDesignSystemCss(offset)) continue;
			if (internalContext.has(name)) {
				report('internal-context-no-use', internalMessage(name, 'reading'), reference);
				continue;
			}
			const removed = removedTokens[name];
			// A successor that left in a later release is no advice, and no fix.
			const use = removed?.use && tokens.has(removed.use) ? removed.use : undefined;
			// With a fallback the page shows that now, so the new name would change what it looks like.
			const shown = use && fallback ? ' The fallback shows until you do, so `--fix` leaves this one.' : '';
			const instead = use ? ` Use \`${use}\`.${shown}` : longerNames(name);
			const message = removed
				? `\`${name}\` was removed after ${removed.last}.${instead}`
				: `There is no token \`${name}\` in this version.${instead}`;
			report('token-not-found', message, reference, use && !fallback ? { token: use } : undefined);
		}
		for (const declaration of declared) {
			if (internalContext.has(declaration.name)) report('internal-context-no-use', internalMessage(declaration.name, 'setting'), declaration);
			if (!declaration.name.startsWith('--_')) continue;
			const component = components.find((name) => declaration.name.startsWith(`--_${name}-`));
			if (!component) continue;
			report('local-variable-no-override', `\`${declaration.name}\` is internal to nldd-${component}, so setting it is not supported.`, declaration);
		}
		const linkBlocks = new Set();
		// Also in a block that looks like the design system's: it sets all three, so `:root { --context-link-color: red }` is the app's.
		for (const declaration of allDeclared) {
			if (!LINK_CONTEXT.includes(declaration.name)) continue;
			const { offset, name } = declaration;
			const sheet = sheets.find(([from, to]) => offset >= from && offset < to);
			const quotedKey = /["'`]/.test(plain[offset - 1] ?? '') && /["'`]/.test(plain[offset + name.length] ?? '');
			const scope = sheet ? { quotes: false, strings: true, from: sheet[0], to: sheet[1] } : quotedKey ? { quotes: false } : {};
			const { start, end } = enclosingBlock(plain, offset, scope);
			if (linkBlocks.has(start)) continue;
			linkBlocks.add(start);
			const set = new Set(allDeclared.filter(({ offset }) => offset >= start && offset < end).map(({ name }) => name));
			const missing = LINK_CONTEXT.filter((name) => !set.has(name));
			if (missing.length === 0) continue;
			report('link-context-needs-states', `Set ${missing.map((name) => `\`${name}\``).join(' and ')} here too, or a link on this surface turns back to the default color.`, declaration);
		}
		return findings;
	}

	/**
	 * Markup of ours in a file the linter cannot read: a type it has no parser for, or a
	 * script without an `html` template, where `<nldd-` sits in a plain string. What a
	 * markup parser skips on purpose, such as a comment or an inert template, is not this.
	 */
	function unreadMarkup(source, filename, roots) {
		const rule = 'file-not-read';
		const finding = (offset) => [{ rule, severity: BUILT_IN_RULES[rule].severity, message: BUILT_IN_RULES[rule].description, tag: '', offset }];
		// A reader that knows what it left unread says so itself.
		if (roots.unread !== undefined) return roots.unread < 0 ? [] : finding(roots.unread);
		const reader = readerOf(filename);
		if (reader === 'markup' || (reader === 'templates' && roots.length > 0)) return [];
		const offset = withoutComments(source, !MARKUP_FILE.test(filename)).search(/<nldd-[a-z]/);
		if (offset < 0) return [];
		return finding(offset);
	}

	// An opt-in group runs only where a level was given for it, never by default.
	const isOn = (rule) => (OPT_IN_GROUPS.includes(rule.group) ? Boolean(severities[rule.id]) : true) && severities[rule.id] !== 'off';
	const rules = data.rules.filter((rule) => !rule.runtime && isOn(rule));
	const ranInSource = (id) => severities[id] !== 'off' && (rules.some((rule) => rule.id === id) || id in BUILT_IN_RULES);
	const isRule = (id) => id in BUILT_IN_RULES || data.rules.some((rule) => rule.id === id);

	/** A rule about a name or value that is gone says what to use instead; the generic finding adds nothing. */
	function withoutCovered(findings) {
		return findings.filter(
			({ attribute, node }) =>
				!attribute || !findings.some((other) => other.node === node && other.covers?.includes(attribute)),
		);
	}

	/** A wrapper has an API of its own, and a bound name can be the input of a directive. */
	function isOurs(node, rule, isPlainHtml) {
		const maybeInput = isPlainHtml && hasAppDirective(node) && rule.removed?.some((name) => node.attrs.has(name));
		return !node.wrapped && !maybeInput;
	}

	/** A rule whose context picks a value of a name that is gone: its fix is only right for that value. */
	const testsRemovedValue = (rule) =>
		rule.removed?.some((name) => new RegExp(`\\[${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[~|^$*]?=`).test(rule.context));

	/** The attributes whose value, as written here, a rule in `api` names: that value is what the rule is about. */
	const goneValues = (rule, node) =>
		rule.group === 'api' ? [...node.attrs].filter(([name, value]) => typeof value === 'string' && rule.context.includes(`[${name}="${value}"]`)).map(([name]) => name) : [];

	function lintRoots(roots, isPlainHtml) {
		const findings = [];
		const open = [];
		const counts = { failed: 0, passed: 0, cantTell: 0 };
		for (const root of roots) {
			findings.push(...builtInFindings(root, { ...context, isPlainHtml }));
			for (const rule of rules) {
				for (const { node, outcome } of engine.evaluate(rule, root)) {
					counts[outcome]++;
					// A name that is gone is wrong whatever the binding holds, but not for a rule about one of its values.
					const namesRemoved = !testsRemovedValue(rule) && rule.removed?.some((name) => node.attrs.get(name) === BOUND);
					if (outcome !== 'failed' && !(outcome === 'cantTell' && namesRemoved)) {
						// Content that a variable or a component of the app fills in decides this one: no finding, and
						// a place to look for whoever asks. A bound or spread attribute is not: that is open everywhere.
						if (outcome === 'cantTell' && undecided(rule) && !node.spread && node.children.some((child) => child.opaque)) open.push({ rule: rule.id, node });
						continue;
					}
					findings.push({
						rule: rule.id,
						severity: rule.severity,
						message: rule.message,
						node,
						covers: [...(rule.removed ?? []), ...Object.keys(rule.fix?.value ?? {}), ...goneValues(rule, node)],
						fix: isOurs(node, rule, isPlainHtml) && !(outcome === 'cantTell' && testsRemovedValue(rule)) ? rule.fix : undefined,
					});
				}
			}
		}
		return { findings: withoutCovered(findings), counts, open };
	}

	/** @returns {Promise<{ findings: object[], counts: object }>} */
	async function lintSource(source, filename, { only, rendered } = {}) {
		if (only === 'events') return lintEvents(source, filename);
		const parsed = applyWrappers(await parseSource(source, filename, { rendered, types }), wrappers);
		const isPlainHtml = /\.(html?|j2|jinja2?|tmpl|gohtml)$/.test(filename);
		const roots = readPropertyNames(parsed, data.tags, isPlainHtml);
		readLinkedStylesheets(roots, filename);
		const { findings, counts, open } = lintRoots(roots, isPlainHtml);
		const { suppressed, missingReason } = readSuppressions(source, canonical);
		const position = createPositions(source);
		const aboutSuppression = (rule, line, detail = BUILT_IN_RULES[rule].description) => ({
			rule,
			severity: BUILT_IN_RULES[rule].severity,
			message: detail,
			tag: '',
			line,
			column: 1,
		});
		const jsx = /\.[jt]sx$/.test(filename) || Boolean(parsed.jsx);
		const all = findings
			.map(({ node, severity, covers, attribute, ...finding }) => ({
				...finding,
				severity,
				tag: node.name,
				offset: node.offset,
				endOffset: node.endOffset,
				mention: node.mention,
				startTag: node.startTag,
				jsx,
				// A finding about text was decided with every hole read: as text, or it would not be one.
				holesAreText: jsx || /\.vue$/.test(filename),
				inString: Boolean(parsed.strings),
				escaped: Boolean(node.escaped),
				...position(node.offset),
			}))
			.concat(
				[...cssFindings(source, filename, roots), ...eventFindings(source, filename), ...unreadMarkup(source, filename, parsed)]
					.filter(({ rule }) => ranInSource(rule))
					.map((finding) => ({ ...finding, ...position(finding.offset) })),
			);
		const stuck = stuckTags(source, all, jsx);
		for (const finding of all) {
			if (finding.fix && (finding.escaped || !canFix(source, finding) || (finding.fix.tag && stuck.has(finding.tag)))) finding.fix = undefined;
		}
		const fires = (line, id) => all.some((finding) => finding.line === line && finding.rule === id);
		// A rule that did not run here says nothing, and Markdown shows a suppression as an example.
		const unneeded = /\.mdx?$/.test(filename) || parsed.length === 0 || parsed.syntaxError
			? []
			: [...suppressed].flatMap(([line, ids]) =>
					[...ids]
						.filter((id) => !isRule(id) || (ranInSource(id) && !fires(line, id)))
						.map((id) => {
							const detail = isRule(id) ? 'does not fire on the next line, so this suppression can go.' : 'is not a rule, so this suppression does nothing.';
							return aboutSuppression('suppression-not-needed', line - 1, `\`${id}\` ${detail}`);
						}),
				);
		const located = all
			.filter((finding) => !suppressed.get(finding.line)?.has(finding.rule))
			.concat(missingReason.map((line) => aboutSuppression('suppression-needs-reason', line)), unneeded)
			.concat(parsed.syntaxError ? [syntaxError(parsed.syntaxError, position)] : [])
			.map((finding) => ({ ...finding, severity: severities[finding.rule] ?? finding.severity }))
			.filter((finding) => finding.severity !== 'off');
		located.sort((a, b) => a.line - b.line || a.column - b.column);
		const stillOpen = open
			.map(({ rule, node }) => ({ rule, tag: node.name, ...position(node.offset) }))
			.filter(({ rule, line }) => !suppressed.get(line)?.has(rule) && severities[rule] !== 'off');
		return { findings: located, counts, undecided: stillOpen };
	}

	/** A script the scan reads only for the events it listens to, such as a `.ts` file. */
	function lintEvents(source, filename) {
		const { suppressed } = readSuppressions(source, canonical);
		const position = createPositions(source);
		const findings = eventFindings(source, filename)
			.map((finding) => ({ ...finding, ...position(finding.offset) }))
			.filter((finding) => !suppressed.get(finding.line)?.has(finding.rule))
			.map((finding) => ({ ...finding, severity: severities[finding.rule] ?? finding.severity }))
			.filter((finding) => finding.severity !== 'off');
		for (const finding of findings) if (finding.fix && !canFix(source, finding)) finding.fix = undefined;
		return { findings, counts: {} };
	}

	/** Evaluates one rule on a snippet, for the examples of that rule. */
	async function outcomesOf(rule, snippet) {
		const isDocument = snippet.startsWith('<html');
		const parsed = isDocument
			? await parseSource(snippet, 'example.html')
			: await parseSource(`<template>${snippet}</template>`, 'example.vue');
		return parsed.flatMap((root) => engine.evaluate(rule, root).map(({ outcome }) => outcome));
	}

	return { lintSource, outcomesOf };
}

export { BOUND };
