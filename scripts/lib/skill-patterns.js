/**
 * Turns a pattern's page into the Markdown page the skill ships.
 *
 * A pattern lives in src/patterns/<slug>/: the example markup as .html, a
 * stories file that renders it through patternStory(), and a .md page with the
 * prose around it. That page is Markdown plus two things that only mean
 * something on the website, and each is translated here:
 *
 * - the line `<!-- voorbeeld: X -->`, which the website turns into a live
 *   example and which becomes an html code block here, holding the markup file
 *   that story renders, so the skill shows exactly what the live example runs;
 * - links to a page of the website (`/componenten/sheet/`), which become links
 *   a reader of the skill can follow: another pattern, the component in
 *   reference.md, or the design guidelines.
 *
 * The rules that point at the pattern follow the page, as they do on the
 * website.
 */

const SITE = 'https://design.digitaledienst.overheid.nl';
const REPO_BLOB = 'https://github.com/NederlandseDigitaleDienst/design-system/blob/main/skills/nldd-design-build/';

/**
 * The set of patterns: the title of its stories to the file name in the skill, which is
 * also the directory in src/patterns/ and the path on the website. The order
 * here is the order the website lists them in.
 */
export const PATTERNS = {
	"Patronen/Pagina's/Paginaopbouw": 'page-structure',
	"Patronen/Pagina's/Home": 'home-page',
	"Patronen/Pagina's/Onderwerppagina": 'topic-page',
	"Patronen/Pagina's/Navigatiepagina": 'navigation-page',
	"Patronen/Pagina's/Contentpagina": 'content-page',
	'Patronen/Applicatie': 'application',
	'Patronen/Werkbalk met acties': 'toolbar-with-actions',
	'Patronen/Lijst': 'list',
	'Patronen/Filteren': 'filtering',
	'Patronen/Formulier': 'form',
	'Patronen/Menu bij een knop': 'menu-from-a-button',
	'Patronen/Bewerken in een sheet': 'edit-in-a-sheet',
	'Patronen/Lezen in een sheet': 'read-in-a-sheet',
	'Patronen/Onomkeerbare actie': 'irreversible-action',
};

/**
 * The id Storybook gave a title. A story keeps the id it had, so an address
 * of an example stays what it was.
 */
export function storybookId(title) {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Reads which markup file each story of a pattern renders.
 *
 * @param {string} stories - source of the pattern's .stories.ts
 * @returns {{ title: string, markup: Record<string, string> }} the story title
 *   and, per exported story, the file name of its markup
 */
export function parsePatternStories(stories) {
	const title = stories.match(/^\s*title:\s*(['"])(.+?)\1/m)?.[2];
	if (!title) throw new Error('Geen title gevonden in het stories-bestand.');
	const imports = Object.fromEntries(
		[...stories.matchAll(/^import (\w+) from '\.\/([\w.-]+\.html)\?raw';/gm)].map((m) => [m[1], m[2]]),
	);
	const markup = {};
	for (const m of stories.matchAll(/^export const (\w+) = patternStory\((\w+)/gm)) {
		if (!imports[m[2]]) throw new Error(`Story ${m[1]} rendert ${m[2]}, maar dat is geen geïmporteerd .html-bestand.`);
		markup[m[1]] = imports[m[2]];
	}
	return { title, markup };
}

/**
 * Rewrites one link target into a link for the skill.
 *
 * @param {string} target - the link target as written in the pattern's page
 * @param {{ patterns: Set<string>, tags: Set<string> }} context - the slugs of
 *   the patterns, and the tags that have a section in reference.md
 */
export function rewriteLink(target, { patterns, tags }) {
	if (target.startsWith(REPO_BLOB)) return `../${target.slice(REPO_BLOB.length)}`;
	if (target.startsWith('?path=')) throw new Error(`Storybook-link: ${target}. Link naar de pagina op de website.`);
	if (!target.startsWith('/')) return target;
	const [path, anchor = ''] = target.split(/(?=#)/);
	if (path === '/richtlijnen/') return `../../nldd-design/design-guidelines.md${anchor}`;
	const pattern = path.match(/^\/patronen\/([a-z0-9-]+)\/$/);
	if (pattern) {
		if (!patterns.has(pattern[1])) throw new Error(`Geen patroon voor ${target}`);
		return `${pattern[1]}.md${anchor}`;
	}
	const component = path.match(/^\/componenten\/([a-z0-9-]+)\/$/);
	if (component) {
		const tag = `nldd-${component[1]}`;
		if (!tags.has(tag)) throw new Error(`Geen component in reference.md voor ${target}`);
		return `../../nldd-design/reference.md#${tag}`;
	}
	// Any other page has no copy in the skill, so the link goes to the website.
	return `${SITE}${target}`;
}

/** The section "Regels" of a pattern, as Markdown lines. */
export function renderRules(rules) {
	const line = (rule) => `- \`${rule.id}\`: ${rule.message}`;
	const required = rules.filter((rule) => rule.severity !== 'hint');
	const hints = rules.filter((rule) => rule.severity === 'hint');
	return [
		'## Regels',
		...(required.length ? ['', '`nldd lint` controleert dit:', '', ...required.map(line)] : []),
		...(hints.length ? ['', 'Hints: zo is het bedoeld. Die laten niets falen.', '', ...hints.map(line)] : []),
	];
}

/**
 * @param {object} input
 * @param {string} input.page - source of the pattern's .md page
 * @param {Record<string, string>} input.markup - story name to markup source
 * @param {{ patterns: Set<string>, tags: Set<string> }} input.context
 * @param {object[]} [input.rules] - the lint rules that point at this pattern
 * @returns {string} the Markdown body for the skill
 */
export function patternToMarkdown({ page, markup, context, rules = [] }) {
	let inFence = false;
	const lines = [];
	for (const line of page.split('\n')) {
		if (/^```/.test(line)) inFence = !inFence;
		if (inFence || /^```/.test(line)) {
			lines.push(line);
			continue;
		}
		const example = line.match(/^<!--\s*voorbeeld:\s*(\w+)\s*-->$/);
		if (example) {
			const source = markup[example[1]];
			if (source === undefined) throw new Error(`Geen markup voor story ${example[1]}.`);
			lines.push('```html', source.trimEnd(), '```');
			continue;
		}
		// A leftover from the time these pages were MDX would end up in the skill
		// as a broken example, so it is an error rather than passed through.
		if (/^\s*<[A-Z]/.test(line)) throw new Error(`Geen Markdown: ${line.trim()}`);
		const heading = line.match(/^# (.+)$/);
		if (heading) {
			lines.push(`# Patroon: ${heading[1].charAt(0).toLowerCase()}${heading[1].slice(1)}`);
			continue;
		}
		lines.push(line.replace(/\]\(([^)\s]+)\)/g, (_, target) => `](${rewriteLink(target, context)})`));
	}
	if (rules.length > 0) lines.push('', ...renderRules(rules));
	return `${lines.join('\n').replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

/** The tags that have a section of their own in reference.md. */
export function referenceTags(reference) {
	return new Set([...reference.matchAll(/^### `<(nldd-[a-z0-9-]+)>`/gm)].map((m) => m[1]));
}
