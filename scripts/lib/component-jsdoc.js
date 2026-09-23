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
	return body
		.split('\n')
		.map((line) => line.replace(/^\s*\*?\s*/, ''))
		.join('\n')
		.trim();
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
		attrs: [],
		slots: [],
		events: [],
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

	for (const line of lines) {
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
			// Prose before the first @element is the shared summary.
			if (!current && !line.startsWith('#')) {
				summaryLines.push(line.trim());
			}
			continue;
		}
		lastEntry = null;
		const [, tag, rest] = tagMatch;
		switch (tag) {
			case 'element':
				current = newComponent(rest.trim());
				components.push(current);
				break;
			case 'attr': {
				if (!current) break;
				const entry = parseTypedTag(rest);
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
	const summary = summaryLines
		.filter((l) => !/Components? \(Lit \+ TypeScript\)\s*$/.test(l))
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (components[0]) components[0].summary = summary;

	return components;
}

export { extractComponentBlocks, extractLeadingBlock, parseTypedTag, parseNamedTag, parseComponent };
