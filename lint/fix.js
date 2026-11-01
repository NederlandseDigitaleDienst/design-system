/**
 * Applies what `--fix` may do without anyone looking. A rule says what changes, in
 * its `fix`; this file knows how that is written in each framework. A fix works on
 * the text of the file, so the rest of it stays exactly as it was.
 */

const toCamelCase = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/** The start tag from `start`, with strings and `{ }` blanked: a value can hold anything. */
function maskedTag(source, start) {
	let masked = '';
	let quote = '';
	let depth = 0;
	for (let at = start; at < source.length; at++) {
		const char = source[at];
		if (quote) {
			if (char === quote) quote = '';
			masked += ' ';
		} else if (char === '"' || char === "'" || char === '`') {
			quote = char;
			masked += ' ';
		} else if (char === '{') {
			depth += 1;
			masked += ' ';
		} else if (char === '}') {
			depth -= 1;
			masked += ' ';
		} else if (depth > 0) {
			masked += ' ';
		} else if (char === '>') {
			return masked;
		} else {
			masked += char;
		}
	}
	return masked;
}

/** Vue, Alpine, Lit and Angular write a name with a prefix, and JSX bare. */
function attributePattern(name) {
	const names = [...new Set([name, toCamelCase(name)])].join('|');
	return new RegExp(`(?<=\\s)(:|v-bind:|x-bind:|\\.|\\?|\\[attr\\.|\\[\\(?)?(${names})(?=[\\s=/\\])]|$)`);
}

/** Where the attribute stands in the start tag at `offset`, if it does. */
function findAttribute(source, offset, name) {
	const match = attributePattern(name).exec(maskedTag(source, offset));
	if (!match) return undefined;
	const [, prefix = '', written] = match;
	const start = offset + match.index + prefix.length;
	return { prefix, written, start, end: start + written.length };
}

function renameEdits(source, offset, from, to) {
	const found = findAttribute(source, offset, from);
	if (!found || findAttribute(source, offset, to)) return [];
	const { prefix, written, start, end } = found;
	const isProperty = prefix === '.' || (prefix.startsWith('[') && prefix !== '[attr.');
	return [{ from: start, to: end, text: isProperty || written !== from ? toCamelCase(to) : to }];
}

/** Only a value written out in the markup: a bound one can hold anything. */
function valueEdits(source, offset, name, values) {
	const found = findAttribute(source, offset, name);
	if (!found || found.prefix) return [];
	const opening = /^\s*=\s*(["']?)/.exec(source.slice(found.end));
	if (!opening) return [];
	const at = found.end + opening[0].length;
	return Object.entries(values).flatMap(([from, to]) => {
		const after = source[at + from.length];
		const whole = opening[1] ? after === opening[1] : /[\s/>]/.test(after ?? ' ');
		return source.startsWith(from, at) && whole ? [{ from: at, to: at + from.length, text: to }] : [];
	});
}

/** The end of an attribute's value, or undefined when it is not closed. */
function endOfValue(source, name) {
	const closers = /^[\])]*/.exec(source.slice(name))[0].length;
	const equals = /^\s*=\s*/.exec(source.slice(name + closers));
	if (!equals) return name + closers;
	const start = name + closers + equals[0].length;
	const first = source[start];
	if (first === '"' || first === "'") {
		const closing = source.indexOf(first, start + 1);
		return closing === -1 ? undefined : closing + 1;
	}
	if (first !== '{') return start + /^[^\s/>]*/.exec(source.slice(start))[0].length;
	let depth = 0;
	for (let at = start; at < source.length; at++) {
		if (source[at] === '{') depth += 1;
		if (source[at] === '}' && --depth === 0) return at + 1;
	}
	return undefined;
}

function removeEdits(source, offset, name) {
	const found = findAttribute(source, offset, name);
	const end = found && endOfValue(source, found.end);
	if (end === undefined) return [];
	let from = found.start - found.prefix.length;
	while (/\s/.test(source[from - 1])) from -= 1;
	return [{ from, to: end, text: '' }];
}

function closingTag(source, offset, name) {
	const tags = new RegExp(`<(/?)${name}(?=[\\s/>])`, 'g');
	tags.lastIndex = offset + 1;
	let depth = 1;
	for (let match = tags.exec(source); match; match = tags.exec(source)) {
		if (match[1]) depth -= 1;
		else if (!maskedTag(source, match.index).trimEnd().endsWith('/')) depth += 1;
		if (depth === 0) return match.index + 2;
	}
	return undefined;
}

/** A wrapper such as `<NlddAppView>` has the name of its own, and stays as it is. */
function tagEdits(source, offset, name, to) {
	if (!source.startsWith(`<${name}`, offset)) return [];
	const open = { from: offset + 1, to: offset + 1 + name.length, text: to };
	if (maskedTag(source, offset).trimEnd().endsWith('/')) return [open];
	const closing = closingTag(source, offset, name);
	if (closing === undefined) return [];
	return [open, { from: closing, to: closing + name.length, text: to, closing: true }];
}

/** An edit is `{ from, to, text }` in the source. What is not certain makes none. */
function editsOf(source, { fix, offset, tag }) {
	return [
		...Object.entries(fix.rename ?? {}).flatMap(([from, to]) => renameEdits(source, offset, from, to)),
		...Object.entries(fix.value ?? {}).flatMap(([name, values]) => valueEdits(source, offset, name, values)),
		...(fix.remove ?? []).flatMap((name) => removeEdits(source, offset, name)),
		...(fix.tag ? tagEdits(source, offset, tag, fix.tag) : []),
	];
}

/**
 * @returns {{ source: string, fixed: number, renamedTags: Map<string, string> }}
 */
export function applyFixes(source, findings) {
	const renamedTags = new Map();
	const edits = findings
		.filter(({ fix }) => fix)
		.flatMap((finding) => {
			const found = editsOf(source, finding);
			if (found.length > 0 && finding.fix.tag) renamedTags.set(finding.tag, finding.fix.tag);
			return found;
		});
	const seen = new Set();
	const unique = edits.filter(({ from }) => !seen.has(from) && seen.add(from));
	let fixed = source;
	for (const { from, to, text } of unique.sort((a, b) => b.from - a.from)) {
		fixed = fixed.slice(0, from) + text + fixed.slice(to);
	}
	return { source: fixed, fixed: unique.filter(({ closing }) => !closing).length, renamedTags };
}
