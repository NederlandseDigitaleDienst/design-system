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

export function templateSlots(source) {
	const found = new Set();
	// [^>]*? rather than \s+: the name does not have to be the first attribute,
	// and a slot tag regularly spans several lines.
	for (const match of stripComments(source).matchAll(/<slot\b[^>]*?\sname=(["'])(.*?)\1/g)) {
		const name = match[2];
		if (name === '' || name.includes('${')) continue;
		found.add(name);
	}
	return found;
}
