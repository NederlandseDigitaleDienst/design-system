/**
 * Reads the named slots off a component's render template.
 *
 * Shared so validate-component-api.js can be checked without running its
 * file-walking and process.exit. Only named slots are read: a consumer has to
 * spell the name to use one, so a named slot without an `@slot` line is the one
 * that cannot be found. A slot whose name is built at render time
 * (`name="pane-${n}"`) is skipped, because there is no single name to document.
 */

/** Comments hold example markup that renders nothing. */
function stripComments(source) {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/^\s*\/\/.*$/gm, '');
}

/**
 * The text of every `<slot …>` opening tag, with each `${…}` binding collapsed
 * to `${}`. Walked by hand rather than matched with [^>]*: a binding can hold a
 * `>` of its own (`@slotchange=${() => x}`), and a pattern that stops there
 * never reaches a `name` written after it. The slot would then be skipped
 * without a word, which is the very failure this check exists to catch.
 */
function slotTags(source) {
	const tags = [];
	for (const match of source.matchAll(/<slot\b/g)) {
		let text = '';
		let i = match.index + match[0].length;
		while (i < source.length && source[i] !== '>') {
			if (source[i] === '$' && source[i + 1] === '{') {
				let depth = 0;
				for (i += 1; i < source.length; i++) {
					if (source[i] === '{') depth++;
					else if (source[i] === '}' && --depth === 0) break;
				}
				text += '${}';
			} else {
				text += source[i];
			}
			i++;
		}
		tags.push(text);
	}
	return tags;
}

export function templateSlots(source) {
	const found = new Set();
	for (const tag of slotTags(stripComments(source))) {
		// The name does not have to be the first attribute, and a slot tag
		// regularly spans several lines.
		const name = tag.match(/\sname=(["'])(.*?)\1/)?.[2];
		if (!name || name.includes('${')) continue;
		found.add(name);
	}
	return found;
}
