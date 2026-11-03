/**
 * Checks the `###` sections of each block of CHANGELOG.md: only the known
 * ones, each once, in the order of the changelog skill. Highlights come
 * first, also when something breaks: a block that opens with Breaking hides
 * what the release is about.
 *
 * A block is the text above the first `## ` heading (what the next release
 * gets) or one version from its `## ` heading on. A list of commits that
 * semantic-release wrote under the last section (`* feat: …`) stays at the end
 * of the block when the sections are put in order.
 */

export const SECTION_ORDER = ['Highlights', 'Breaking', 'Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];

/** The blocks of a changelog, each with the line it starts on. */
function blocks(changelog) {
	const result = [];
	let line = 1;
	for (const text of changelog.split(/\n(?=## )/)) {
		result.push({ text, line });
		line += text.split('\n').length;
	}
	return result;
}

function blockName(text, line) {
	const version = text.match(/^## .*?(\d+\.\d+\.\d+)/m);
	return version ? version[1] : line === 1 ? 'the upcoming release' : `the block on line ${line}`;
}

/**
 * @param {string} changelog - The text of CHANGELOG.md.
 * @returns {string[]} One message for each block whose sections are wrong.
 */
export function sectionOrderErrors(changelog) {
	const errors = [];
	for (const { text, line } of blocks(changelog)) {
		const sections = [...text.matchAll(/^### (.+)$/gm)].map((match) => match[1].trim());
		const unknown = sections.filter((section) => !SECTION_ORDER.includes(section));
		const repeated = sections.filter((section, index) => sections.indexOf(section) !== index);
		const known = sections.filter((section) => SECTION_ORDER.includes(section));
		const sorted = [...known].sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b));
		const name = blockName(text, line);
		if (unknown.length) errors.push(`${name}: unknown section ${unknown.map((section) => `"### ${section}"`).join(', ')}; use ${SECTION_ORDER.join(', ')}`);
		if (repeated.length) errors.push(`${name}: ${[...new Set(repeated)].map((section) => `"### ${section}"`).join(', ')} more than once`);
		if (!repeated.length && known.join() !== sorted.join()) errors.push(`${name}: sections are ${known.join(', ')}; they go ${sorted.join(', ')}`);
	}
	return errors;
}

/**
 * Puts the known sections of every block in order, and leaves a block with an
 * unknown or repeated section as it is.
 *
 * @param {string} changelog - The text of CHANGELOG.md.
 * @returns {string} The changelog with its sections in order.
 */
export function sortSections(changelog) {
	return blocks(changelog).map(({ text }) => {
		const start = text.search(/^### /m);
		if (start < 0) return text;
		const head = text.slice(0, start);
		let body = text.slice(start);
		// Commits listed by semantic-release after the last section stay last.
		const tailAt = body.search(/\n\n(?=\* )/);
		const tail = tailAt < 0 ? '' : body.slice(tailAt);
		if (tailAt >= 0) body = body.slice(0, tailAt);
		const sections = body.split(/\n(?=### )/).map((section) => section.replace(/\n+$/, ''));
		const names = sections.map((section) => section.match(/^### (.+)$/m)[1].trim());
		if (names.some((name, index) => !SECTION_ORDER.includes(name) || names.indexOf(name) !== index)) return text;
		const ending = body.match(/\n*$/)[0];
		const sorted = sections
			.map((section, index) => ({ section, rank: SECTION_ORDER.indexOf(names[index]) }))
			.sort((a, b) => a.rank - b.rank)
			.map(({ section }) => section);
		return head + sorted.join('\n\n') + ending + tail;
	}).join('\n');
}
