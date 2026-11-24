/**
 * Parses the JSDoc block that documents a component's public API.
 *
 * Shared on purpose: generate-component-reference.js turns this into
 * skills/nldd-design/reference.md, and validate-component-api.js checks it against the
 * @property decorators. Two parsers would let the check pass while the
 * reference says something else.
 */

/** Extract the JSDoc block that documents the component(s). Prefers the first
 * block containing @element or @customElement so a license/module header before
 * it does not get picked by mistake; falls back to the first block. */
/** Every JSDoc block that documents an element, in source order.
 *
 * A file can register more than one element (nldd-menu also defines its item,
 * divider and group), and those blocks sit above their own class rather than at
 * the top of the file. Taking only the first block dropped them from the
 * reference entirely, so the generator reads them all; a block belongs to this
 * set when it names its element with @element. Falls back to the single leading
 * block for the common one-element file. */
function extractComponentBlocks(source) {
	const blocks = [...source.matchAll(/\/\*\*([\s\S]*?)\*\//g)].map((m) => cleanBlock(m[1]));
	const documented = blocks.filter((b) => /^@element\b/m.test(b));
	if (documented.length > 0) return documented;
	const leading = extractLeadingBlock(source);
	return leading ? [leading] : [];
}

/** Strip the leading " * " from each line. Use \s* (not \s?) after the star so
 *  JSDoc formatted with two or more spaces (" *  @attr …") still lands the tag
 *  at column 0, otherwise the @-tag regex would miss it and drop the entry. */
function cleanBlock(body) {
	let inFence = false;
	return body
		.split('\n')
		.map((line) => {
			const fence = /^\s*\*?\s*```/.test(line);
			// Inside a code fence only the star and one space go, so the code keeps its indentation.
			const cleaned = inFence && !fence ? line.replace(/^\s*\*? ?/, '') : line.replace(/^\s*\*?\s*/, '');
			if (fence) inFence = !inFence;
			return cleaned;
		})
		.join('\n')
		.trim();
}

/** Prose lines joined into one paragraph, with a code fence kept as a block of
 *  its own on its own lines, so it reads as code in markdown rather than inline. */
function joinProse(lines) {
	const parts = [];
	let prose = [];
	let fence = null;
	const flush = () => {
		const text = prose.join(' ').replace(/\s+/g, ' ').trim();
		if (text) parts.push(text);
		prose = [];
	};
	for (const line of lines) {
		if (fence) {
			fence.push(line);
			if (line.trim().startsWith('```')) {
				parts.push(fence.join('\n'));
				fence = null;
			}
		} else if (line.trim().startsWith('```')) {
			flush();
			fence = [line.trim()];
		} else {
			prose.push(line);
		}
	}
	if (fence) parts.push(fence.join('\n'));
	flush();
	return parts.join('\n\n');
}

function extractLeadingBlock(source) {
	const blocks = [...source.matchAll(/\/\*\*([\s\S]*?)\*\//g)];
	if (blocks.length === 0) return null;
	const chosen =
		blocks.find((m) => /@element\b|@customElement\b/.test(m[1])) ?? blocks[0];
	return cleanBlock(chosen[1]);
}

/**
 * Parse a single JSDoc tag line of the form
 *   @attr {type} name - description
 * The type is brace-balanced (so unions like {'a'|'b'} survive), the name is
 * the next whitespace-delimited token, and the description is the remainder
 * after an optional "-" separator.
 */
function parseTypedTag(rest) {
	let type = '';
	let remainder = rest.trim();
	if (remainder.startsWith('{')) {
		let depth = 0;
		let i = 0;
		for (; i < remainder.length; i++) {
			if (remainder[i] === '{') depth++;
			else if (remainder[i] === '}') {
				depth--;
				if (depth === 0) {
					i++;
					break;
				}
			}
		}
		type = remainder.slice(0, i).replace(/^\{|\}$/g, '').trim();
		remainder = remainder.slice(i).trim();
	}
	const nameMatch = remainder.match(/^(\S+)\s*(.*)$/s);
	if (!nameMatch) return { type, name: '', description: '' };
	// Strip the JSDoc `[optional]` bracket convention from the attribute name.
	// The trailing "-" is tolerated because "[name]- description" (no space
	// before the separator) is easy to write and used to yield the literal
	// attribute name "name]-" in the published reference.
	const name = nameMatch[1].replace(/^\[/, '').replace(/\]-?$/, '');
	const description = nameMatch[2].replace(/^-\s*/, '').replace(/\s+/g, ' ').trim();
	return { type, name, description };
}

/** Parse a @slot / @fires line: "name - description" (name optional for default slot). */
function parseNamedTag(rest) {
	const m = rest.trim().match(/^(\S+)?\s*-?\s*([\s\S]*)$/);
	if (!m) return { name: '', description: '' };
	let name = m[1] ?? '';
	let description = m[2] ?? '';
	// A leading "-" means the default (unnamed) slot.
	if (name === '-') {
		name = '';
	} else {
		description = description.replace(/^-\s*/, '');
	}
	return { name, description: description.replace(/\s+/g, ' ').trim() };
}

/** Parse one component file's JSDoc block into one or more records — a file may
 * document several custom elements (e.g. nldd-tab-bar + nldd-tab-bar-item), each
 * with its own @element. attrs/slots/events are assigned to the @element that
 * precedes them. The fallbackTag (from @customElement) is used only when the
 * JSDoc has no @element at all. Returns an array of components. */
/** A drawn line between two elements in a shared file, not prose. */
const SEPARATOR = /^[\s\u2500-\u257F\-=_]+$/;

function parseComponent(block, filePath, fallbackTag) {
	const lines = block.split('\n');
	// Derived from the path itself rather than from a base directory, so the
	// caller does not have to pass one and a test can use any fake path.
	const category = filePath.split(/[/\\]src[/\\]components[/\\]/)[1]?.split(/[/\\]/)[0] ?? '';
	const summaryLines = [];
	const components = [];

	const newComponent = (tag) => ({
		tag,
		summary: '',
		summaryLines: [],
		attrs: [],
		slots: [],
		events: [],
		accepts: [],
		cssProperties: [],
		keywords: [],
		related: [],
		category,
	});

	// The fallback element is created up front, not after the loop: tags are
	// assigned to `current`, so a block without @element used to drop every
	// @attr, @slot and @fires it had instead of falling back.
	let current = null;
	if (!/^@element\b/m.test(block) && fallbackTag) {
		current = newComponent(fallbackTag);
		components.push(current);
	}
	// The most recent description-bearing entry (attr/slot/event), so a
	// multi-line JSDoc tag's continuation lines append to it instead of dropping.
	let lastEntry = null;
	// Whether prose still counts as the current element's description: true
	// from its @element until its first tag of its own.
	let collecting = false;

	let inFence = false;
	const addProse = (line) => {
		if (!current) summaryLines.push(line);
		else if (collecting && (inFence || !SEPARATOR.test(line))) current.summaryLines.push(line);
	};

	for (const line of lines) {
		// A code fence in the prose is kept line by line: an @ or # in the code is not a tag or a heading.
		if (line.trim().startsWith('```') || inFence) {
			if (line.trim().startsWith('```')) inFence = !inFence;
			// In a tag's description a fence stays flat: it ends up in a table cell.
			if (lastEntry) lastEntry.description = `${lastEntry.description} ${line.trim()}`.trim();
			else addProse(line);
			continue;
		}
		const tagMatch = line.match(/^@(\w+)\s*([\s\S]*)$/);
		if (!tagMatch) {
			if (line.trim() === '') {
				lastEntry = null;
				continue;
			}
			if (lastEntry) {
				lastEntry.description = `${lastEntry.description} ${line.trim()}`.trim();
				continue;
			}
			if (line.startsWith('#')) continue;
			// Prose before the first @element is the shared summary. Prose
			// directly after an @element belongs to that element, which is how a
			// second element in a shared file gets a description at all. Once a
			// tag of its own has followed, prose is part of that tag's block
			// (an @example for instance) and not a description.
			addProse(line.trim());
			continue;
		}
		lastEntry = null;
		const [, tag, rest] = tagMatch;
		if (tag !== 'element') collecting = false;
		switch (tag) {
			case 'element':
				current = newComponent(rest.trim());
				components.push(current);
				collecting = true;
				break;
			case 'attr':
			case 'childattr':
			case 'descendantattr':
			case 'globalattr': {
				if (!current) break;
				const entry = parseTypedTag(rest);
				// Set on a child and read by this component, like `only` on a pane.
				if (tag === 'childattr') entry.forChildren = true;
				// Set on anything inside this component, at any depth.
				if (tag === 'descendantattr') entry.forDescendants = true;
				// Set on any element on the page, and read by this component.
				if (tag === 'globalattr') entry.global = true;
				current.attrs.push(entry);
				lastEntry = entry;
				break;
			}
			case 'slot': {
				if (!current) break;
				const entry = parseNamedTag(rest);
				current.slots.push(entry);
				lastEntry = entry;
				break;
			}
			case 'accepts': {
				// The plain HTML elements this component styles itself, such as the
				// <select> in nldd-dropdown, or * for any. Written as `@accepts select, option`.
				if (!current) break;
				const names = rest.split(/[\s,]+/).filter(Boolean);
				// A description after the names would read as more names, so nothing else goes here.
				const wrong = names.find((name) => !/^([a-z][a-z0-9]*|\*)$/.test(name));
				if (wrong) throw new Error(`${filePath}: @accepts on ${current.tag} takes element names only, not "${wrong}".`);
				current.accepts.push(...names);
				break;
			}
			case 'cssprop': {
				// A custom property an app may read or set, such as --context-inset-top,
				// which nldd-page passes to sticky content. Without this tag a
				// --context-* variable a component sets is wiring between components.
				if (!current) break;
				const entry = parseNamedTag(rest);
				if (!/^--[a-z][a-z0-9-]*$/.test(entry.name)) throw new Error(`${filePath}: @cssprop on ${current.tag} takes a custom property name, not "${entry.name}".`);
				current.cssProperties.push(entry);
				lastEntry = entry;
				break;
			}
			case 'keywords': {
				// What someone may search for who does not know the name: another
				// system's word (toast), the English one (heading), a broader one (modal).
				if (!current) break;
				current.keywords.push(...rest.split(',').map((word) => word.trim().toLowerCase()).filter(Boolean));
				break;
			}
			case 'related': {
				// The components to weigh against this one, written as tags.
				if (!current) break;
				const tags = rest.split(/[\s,]+/).filter(Boolean);
				const wrong = tags.find((tag) => !/^nldd-[a-z0-9-]+$/.test(tag));
				if (wrong) throw new Error(`${filePath}: @related on ${current.tag} takes element tags only, not "${wrong}".`);
				current.related.push(...tags);
				break;
			}
			case 'fires': {
				if (!current) break;
				const entry = parseNamedTag(rest);
				current.events.push(entry);
				lastEntry = entry;
				break;
			}
			default:
				break;
		}
	}

	// No @element at all: fall back to the @customElement decorator tag.
	if (components.length === 0) {
		if (!fallbackTag) return [];
		components.push(newComponent(fallbackTag));
	}

	// The shared prose summary (minus the boilerplate title line) goes to the
	// first element; sub-elements keep their own per-element prose if any.
	const summary = joinProse(summaryLines.filter((l) => !/Components? \(Lit \+ TypeScript\)\s*$/.test(l)));
	for (const component of components) {
		component.summary = joinProse(component.summaryLines);
		delete component.summaryLines;
	}
	// Joined, not assigned: the first element may also carry prose of its own,
	// written under its @element, and that would be overwritten here.
	if (components[0]) components[0].summary = [summary, components[0].summary].filter(Boolean).join(' ');

	return components;
}

export { extractComponentBlocks, extractLeadingBlock, parseTypedTag, parseNamedTag, parseComponent };
