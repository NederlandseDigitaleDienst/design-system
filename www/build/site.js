/**
 * Builds every page of the site as an HTML string.
 *
 * A page is plain markup made of nldd-* components: the site documents the
 * system by being built with it. The one element that is not from the system
 * is `site-stage`, the frame a live example stands on (site/client/stage.ts),
 * so that an example can never be mistaken for the page around it.
 *
 * Links are written as site paths (`/componenten/button/`) everywhere, in the
 * templates here and in the Markdown sources, and get the deploy base in one
 * place: `withBase()`.
 */

import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { storybookId } from '../../scripts/lib/skill-patterns.js';
import { rulesAboutTag, rulesOfPattern } from '../../lint/rule-index.js';
import { loadData } from '../../lint/linter.js';
import { collectComponents, collectPatterns, parseStoryFile, repoRoot } from './sources.js';
import { codeViewer, escapeHtml, renderMarkdown } from './markdown.js';
import { controlFor } from './attribute-values.js';
import { MARKDOWN_INSERTS } from './skills.js';
import { DEFAULT_THEME, themesByHue } from '../../scripts/lib/themes.js';

const SITE_NAME = 'NLDD Designsysteem';

const STATUS = {
	stable: 'Stabiel',
	beta: 'Bèta',
	experimental: 'Experimenteel',
	wip: 'In ontwikkeling',
};

/**
 * The pages that are prose: where they live on the site and their source.
 * `stories` is the file the examples on the page come from; with `examples`
 * every story of that file follows the text, under that heading.
 */
const PROSE = [
	{ path: '/aan-de-slag/', file: 'www/content/aan-de-slag.md', description: 'Installeer het pakket en zet je eerste component neer.' },
	{ path: '/aan-de-slag/ai-assistent/', file: 'www/content/ai-assistent.md', description: 'Skills voor Claude Code en Cursor.' },
	{ path: '/richtlijnen/', file: 'src/docs/design-guidelines.md', description: 'De ontwerpkeuzes van het systeem en de redenen erachter.' },
	{ path: '/themas/', file: 'src/docs/themes.md', stories: 'src/docs/themes.stories.ts', examples: 'Elk thema op een pagina vol componenten', description: 'De accentkleur van je dienst, in licht en donker.' },
	{ path: '/iconen/', file: 'src/docs/icons.md', stories: 'src/components/content/icon/icon-gallery.stories.ts', description: 'Alle iconen, met hun aliassen.' },
	{ path: '/linter/', file: 'www/content/linter.md', rules: true, description: 'Controleer je code met nldd lint, en lees elke regel.' },
	{ path: '/breakpoints/', file: 'src/docs/breakpoints.md', description: 'Bij welke breedtes de layout verandert.' },
	{ path: '/vertalingen/', file: 'src/docs/translations.md', description: 'Een interface in een andere taal dan Nederlands.' },
	{ path: '/toegankelijkheid/', file: 'docs/ACCESSIBILITY.md', description: 'Wat het systeem voor toegankelijkheid regelt, en wat jij nog doet.' },
];

/**
 * Prefixes the links between pages with the deploy base. The entry script and
 * the icons in the head are left alone: Vite resolves those itself and adds the
 * base when it builds.
 */
function withBase(html, base) {
	if (base === '/') return html;
	// Every href in a tag, so the `website-href` and `back-href` of the bar too.
	return html
		.replace(/(<link\b[^>]*>)|\bhref="\/(?!\/)/g, (match, link) => link ?? `href="${base}`)
		.replace('src="/theme.js"', `src="${base}theme.js"`);
}

function read(path) {
	return readFileSync(resolve(repoRoot, path), 'utf8');
}

const identity = (path) => path;

function head({ title, description, entry, stylesheet = 'styles.css', robots = '', theme = true }) {
	const pageTitle = title === SITE_NAME ? SITE_NAME : `${title} · ${SITE_NAME}`;
	return `<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${escapeHtml(pageTitle)}</title>
	<meta name="description" content="${escapeHtml(description)}">${robots}
	<link rel="icon" type="image/svg+xml" href="/favicon.svg">
	<link rel="stylesheet" href="/${stylesheet}">${theme ? '\n\t<script vite-ignore src="/theme.js"></script>' : ''}
	<script type="module" src="/${entry}"></script>
</head>`;
}

const REPOSITORY = 'https://github.com/NederlandseDigitaleDienst/design-system';

/** Every theme, the default first, for the menu that shows the site in one. */
const THEMES = [
	DEFAULT_THEME,
	...themesByHue(JSON.parse(readFileSync(resolve(repoRoot, 'scripts/reference-colors.json'), 'utf8'))).map((theme) => theme.name),
];

/**
 * The landing page is written by hand in www/index.html and is shown as it is,
 * with its head replaced, so it loads from the same place as every other page.
 * It keeps a stylesheet and a script of its own, and a bar with only the logo
 * and the name: the page itself leads to the parts of the system, section by
 * section.
 */
function homePage() {
	const html = read('www/index.html');
	const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? SITE_NAME;
	const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1] ?? '';
	return html.replace(
		/<head>[^]*?<\/head>/,
		head({ title, description, entry: 'home.ts', stylesheet: 'home.css', theme: false }),
	);
}

/**
 * What the documentation lists in its first sidebar, by group, each with the
 * name of its list. A group without a title stands on its own above the rest.
 * Every item opens something; an item without an icon of its own is a page of
 * a guide.
 */
const NAVIGATION = [
	['', 'Nieuw', [['Changelog', '/changelog/', 'history']]],
	[
		'Bibliotheek',
		'Bibliotheek',
		[
			['Componenten', '/componenten/', 'blocks-9'],
			['Patronen', '/patronen/', 'tree-structure'],
			['Iconen', '/iconen/', 'triangle-square-circle'],
		],
	],
	[
		'Handleidingen',
		'Handleidingen',
		[
			['Aan de slag', '/aan-de-slag/'],
			['Ontwerprichtlijnen', '/richtlijnen/'],
			['Toegankelijkheid', '/toegankelijkheid/'],
			["Thema's", '/themas/'],
			['Werken met een AI-assistent', '/aan-de-slag/ai-assistent/'],
			['Linter', '/linter/'],
			['Breakpoints', '/breakpoints/'],
			['Vertalingen', '/vertalingen/'],
		],
	],
];

/** About the site, at the foot of the first sidebar. */
const ABOUT = [
	['Privacy', 'https://digitaledienst.overheid.nl/over/privacy/'],
	['Idee of probleem melden', `${REPOSITORY}/issues`],
	['GitHub', REPOSITORY],
];

const DOCS = 'Documentatie';

/** The section a page belongs to: the one whose path is the longest start of it. */
function currentSection(path) {
	const paths = NAVIGATION.flatMap(([, , items]) => items.map(([, href]) => href));
	return paths.filter((href) => path.startsWith(href)).sort((a, b) => b.length - a.length)[0];
}

function primaryNavigation(path) {
	const current = currentSection(path);
	return NAVIGATION.map(
		([group, label, items]) => `${
			group
				? `<nldd-title size="display-5">
					<h3>${escapeHtml(group)}</h3>
				</nldd-title>
				<nldd-spacer size="4"></nldd-spacer>
				`
				: ''
		}<nldd-list
					type="navigation"
					appearance="simple"
					dividers="never"
					accessible-label="${escapeHtml(label)}"
				>
					${items
						.map(
							([text, href, icon = 'file-text']) => `<nldd-list-item href="${href}"${href === current ? ' current' : ''}>
						<nldd-icon-cell
							size="20"
							icon="${icon}"
						></nldd-icon-cell>
						<nldd-spacer-cell size="8"></nldd-spacer-cell>
						<nldd-text-cell text="${escapeHtml(text)}"></nldd-text-cell>
						<nldd-spacer-cell size="12"></nldd-spacer-cell>
						<nldd-icon-cell
							size="20"
							color="secondary"
							icon="chevron-right"
						></nldd-icon-cell>
					</nldd-list-item>`,
						)
						.join('\n\t\t\t\t\t')}
				</nldd-list>`,
	).join('\n\t\t\t\t<nldd-spacer size="16"></nldd-spacer>\n\t\t\t\t');
}

const aboutLinks = `<nldd-container
				slot="footer"
				padding="16"
			>
				<nldd-link-group accessible-label="Over deze site" size="sm">
					${ABOUT.map(([text, href]) => `<nldd-link
						href="${href}"
						text="${escapeHtml(text)}"
					></nldd-link>`).join('\n\t\t\t\t\t')}
				</nldd-link-group>
			</nldd-container>`;

/**
 * A pane with a page in it: a title bar that takes over the title of the
 * section once it scrolls away, the content below it, and a footer if any.
 */
function pane({ slot, id, title, back, hasContent = true, landmarks = false, body, footer = '' }) {
	const backAttributes = back
		? `\n\t\t\t\tback-text="${escapeHtml(back.text)}"${back.href ? `\n\t\t\t\tback-href="${back.href}"` : ''}`
		: '';
	return `<nldd-split-view-pane
		slot="${slot}"${hasContent ? '\n\t\thas-content' : ''}
	>
		<nldd-page
			${landmarks ? 'landmarks="page"' : `accessible-label="${escapeHtml(title)}"`}
			sticky-header
		>
			<nldd-top-title-bar
				slot="header"
				text="${escapeHtml(title)}"${landmarks ? '' : '\n\t\t\t\theading-level="2"'}${backAttributes}${id ? `\n\t\t\t\tcollapse-anchor="${id}"` : ''}
			></nldd-top-title-bar>
${body}${footer ? `\n\t\t\t${footer}` : ''}
		</nldd-page>
	</nldd-split-view-pane>`;
}

/** A sidebar pane: its title as the header of the section, and the lists under it. */
function sidebarPane({ slot, id, title, back, nav, footer }) {
	return pane({
		slot,
		id,
		title,
		back,
		footer,
		body: `			<nldd-simple-section>
				<nldd-title
					id="${id}"
					slot="header"
					size="display-3"
					text="${escapeHtml(title)}"
					heading-level="2"
				></nldd-title>
				${nav}
			</nldd-simple-section>`,
	});
}

const themeName = (theme) => `${theme.charAt(0).toUpperCase()}${theme.slice(1)}`;

/**
 * The theme and the color scheme of the site, as on the landing page: the
 * colors as swatches, the scheme as three toggle buttons. The button shows the
 * scheme as its icon and the theme as its text; the script sets both to what
 * the visitor chose.
 */
function themePicker() {
	return `<nldd-button
						appearance="secondary"
						start-icon="themes"
						text="${themeName(DEFAULT_THEME)}"
						expandable
						data-site-theme-button
					>
						<nldd-popover
							slot="popup"
							placement="bottom-end"
							width="360px"
							accessible-label="Thema en kleurmodus"
						>
							<nldd-container padding="16">
								<nldd-title
									id="site-thema-titel"
									size="display-5"
								>
									<h2>Thema</h2>
								</nldd-title>
								<nldd-spacer size="8"></nldd-spacer>
								<nldd-swatch-picker
									accessible-label="Thema"
									value="${DEFAULT_THEME}"
									data-site-theme-picker
								>
									${THEMES.map(
										(theme) => `<nldd-swatch-picker-item
										custom-color="var(--primitives-color-reference-${theme})"
										text="${themeName(theme)}"
										value="${theme}"
									></nldd-swatch-picker-item>`,
									).join('\n\t\t\t\t\t\t\t\t\t')}
								</nldd-swatch-picker>
								<nldd-spacer size="16"></nldd-spacer>
								<nldd-title
									id="site-kleurmodus-titel"
									size="display-5"
								>
									<h2>Kleurmodus</h2>
								</nldd-title>
								<nldd-spacer size="8"></nldd-spacer>
								<nldd-toggle-button-group
									type="radio"
									accessible-labeled-by="site-kleurmodus-titel"
									data-site-scheme
								>
									<nldd-toggle-button
										text="Systeem"
										icon="display"
										value="system"
										selected
									></nldd-toggle-button>
									<nldd-toggle-button
										text="Donker"
										icon="moon"
										value="dark"
									></nldd-toggle-button>
									<nldd-toggle-button
										text="Licht"
										icon="sun"
										value="light"
									></nldd-toggle-button>
								</nldd-toggle-button-group>
							</nldd-container>
						</nldd-popover>
					</nldd-button>`;
}

/**
 * The main toolbar, around the panes: back to the landing page and the name
 * of the site at the start, the theme at the end.
 */
function toolbar() {
	return `<nldd-container padding="8">
			<nldd-toolbar accessible-label="${SITE_NAME}">
				<nldd-toolbar-item
					slot="start"
					priority="3"
				>
					<nldd-icon-button
						icon="chevron-left"
						text="Home"
						href="/"
					></nldd-icon-button>
					<nldd-menu-item
						slot="overflow"
						icon="chevron-left"
						text="Home"
						href="/"
					></nldd-menu-item>
				</nldd-toolbar-item>
				<nldd-toolbar-title
					slot="start"
					text="${SITE_NAME}"
					min-width="0"
				></nldd-toolbar-title>
				<nldd-toolbar-item
					slot="end"
					priority="2"
				>
					${themePicker()}
					<nldd-menu-group
						slot="overflow"
						text="Thema"
					>
						${THEMES.map(
							(theme) => `<nldd-menu-item
							text="${themeName(theme)}"
							type="radio"
							value="${theme}"${theme === DEFAULT_THEME ? '\n\t\t\t\t\t\t\tselected' : ''}
							data-site-theme-item
						></nldd-menu-item>`,
						).join('\n\t\t\t\t\t\t')}
					</nldd-menu-group>
				</nldd-toolbar-item>
			</nldd-toolbar>
		</nldd-container>`;
}

/**
 * Every page behind the landing page, as an application: the main toolbar
 * above a navigation split view. The first sidebar has the sections, the
 * second the pages of a section that has them, and main the page itself.
 * Where a pane falls away on a narrower screen, its title bar has a way back.
 *
 * @param {object} input
 * @param {string} input.path - where the page lives, `/componenten/button/`
 * @param {string} [input.main] - the content of the page; without it main is empty and says what to pick
 * @param {{ title: string, path: string, nav: string, empty: string }} [input.secondary] - the pages of the section
 */
function layout({ title, description, path, main, secondary }) {
	const mainPane = main
		? pane({
				slot: 'main',
				id: 'pagina-titel',
				title,
				// Main goes back to the list it was chosen from. Without one, back
				// shows the sections, which have no page of their own.
				back: secondary ? { text: secondary.title, href: secondary.path } : { text: DOCS },
				landmarks: true,
				body: main,
			})
		: // Nothing chosen yet: no title bar, only what to pick.
			`<nldd-split-view-pane slot="main">
		<nldd-page landmarks="page">
			<nldd-simple-section grow>
				<nldd-inline-dialog text="${escapeHtml(secondary.empty)}"></nldd-inline-dialog>
			</nldd-simple-section>
		</nldd-page>
	</nldd-split-view-pane>`;
	const panes = [
		sidebarPane({
			slot: 'primary-sidebar',
			id: 'secties-titel',
			title: DOCS,
			nav: primaryNavigation(path),
			footer: aboutLinks,
		}),
		secondary
			? sidebarPane({
					slot: 'secondary-sidebar',
					id: 'lijst-titel',
					title: secondary.title,
					back: { text: DOCS },
					nav: secondary.nav,
				})
			: '',
		mainPane,
	].filter(Boolean);
	return `<!doctype html>
<html lang="nl">
${head({ title, description, entry: 'main.ts' })}
<body class="site">
<nldd-shell>
	<nldd-bar-split-view>
		<nldd-split-view-pane slot="toolbar">
		${toolbar()}
		</nldd-split-view-pane>
		<nldd-split-view-pane slot="main">
			<nldd-navigation-split-view>
	${panes.join('\n\t')}
			</nldd-navigation-split-view>
		</nldd-split-view-pane>
	</nldd-bar-split-view>
</nldd-shell>
</body>
</html>
`;
}

/** The frame one live example stands on. */
function stage(storyFile, story, { primary = false, bare = false, controls } = {}) {
	const attributes = [
		`file="${storyFile.file}"`,
		`story="${story.exportName}"`,
		`story-id="${story.id}"`,
		`name="${escapeHtml(story.name)}"`,
		primary ? 'primary' : '',
		bare ? 'bare' : '',
	].filter(Boolean);
	// The controls of an example are the attributes of its element, so they are
	// handed to the stage as data rather than written per story.
	const data = controls
		? `<script type="application/json">${JSON.stringify(controls).replace(/</g, '\\u003c')}</script>`
		: '';
	return `<site-stage ${attributes.join(' ')}>${data}</site-stage>`;
}

/** The attributes of a component's own element, as controls. */
function controlsOf(component) {
	const element = component.elements.find((e) => e.tagName === component.tag);
	if (!element) return undefined;
	const file = resolve(repoRoot, element.module);
	return {
		tag: element.tagName,
		attributes: (element.attributes ?? []).map((a) => controlFor(file, a)).filter(Boolean),
	};
}

const REPO_BLOB = 'https://github.com/NederlandseDigitaleDienst/design-system/blob/main/';

/**
 * A link in a file that is shown as it is in the repository (the changelog,
 * the accessibility page) is relative to that file. On the site it goes to the
 * same file on GitHub.
 */
function absoluteLinks(markdown, file) {
	return markdown.replace(/\]\((?!https?:|mailto:|#|\/)([^)\s]+)\)/g, (_, target) => {
		const [path, anchor = ''] = target.split(/(?=#)/);
		return `](${REPO_BLOB}${relative(repoRoot, resolve(repoRoot, dirname(file), path))}${anchor})`;
	});
}

function renderProse(markdown, storyFile) {
	const example = storyFile
		? (name) => {
				const story = storyFile.stories.find((s) => s.exportName === name);
				if (!story) throw new Error(`Geen story ${name} in ${storyFile.file}`);
				return stage(storyFile, story, { bare: storyFile.file.endsWith('icon-gallery.stories.ts') });
			}
		: undefined;
	return renderMarkdown(markdown, { href: identity, example });
}

function pageTitle(text, { overline = '', end = '' } = {}) {
	return `<nldd-title
				id="pagina-titel"
				slot="header"${overline ? ` overline="${escapeHtml(overline)}"` : ''}>
				<h1>${escapeHtml(text)}</h1>${end}
			</nldd-title>`;
}

/**
 * A page of prose, as the content page pattern has it: the text in the main
 * column and, when the page has more than one heading, a table of contents
 * beside it, so every page of prose has the same columns. A page with a great
 * many headings (the changelog) gets none: a list that long is no shorter than
 * the page.
 */
function prosePage({ title, rendered, extra = [] }) {
	const headings = rendered.headings;
	// The blocks are of different kinds (prose, code, an example), so a spacer
	// stands between each two rather than a gap over all of them.
	const blocks = [...(rendered.blocks ?? [rendered.html]), ...extra].filter((block) => block.trim());
	const body = blocks.join('\n<nldd-spacer size="24"></nldd-spacer>\n');
	if (headings.length < 2 || headings.length > 24) {
		return `		<nldd-simple-section grow>
			${pageTitle(title)}
			<nldd-container>
${body}
			</nldd-container>
		</nldd-simple-section>`;
	}
	return `		<nldd-sidebar-section
			sidebar-label="Op deze pagina"
			grow
		>
			${pageTitle(title)}
			<nldd-spacer
				slot="header"
				sidebar-section-only="collapsed"
				size="16"
			></nldd-spacer>
			<nldd-button
				slot="header"
				sidebar-section-only="collapsed"
				appearance="secondary"
				start-icon="bullet-list"
				text="Op deze pagina"
				popup-type="dialog"
				data-site-sidebar
			></nldd-button>
			<nldd-container
				slot="sidebar"
				padding="16"
				padding-bottom="8"
			>
				<nldd-title
					sidebar-section-only="expanded"
					size="display-5"
				>
					<h2>Op deze pagina</h2>
				</nldd-title>
				<nldd-spacer
					sidebar-section-only="expanded"
					size="8"
				></nldd-spacer>
				<nldd-list
					type="navigation"
					appearance="simple"
					dividers="never"
					accessible-label="Op deze pagina"
				>
					${headings
						.map(
							(h, index) => `<nldd-list-item href="#${h.id}" current-type="location"${index === 0 ? ' current' : ''}>
						<nldd-text-cell>
							<p>${h.text}</p>
						</nldd-text-cell>
					</nldd-list-item>`,
						)
						.join('\n\t\t\t\t\t')}
				</nldd-list>
			</nldd-container>
			<nldd-container>
${body}
			</nldd-container>
		</nldd-sidebar-section>`;
}

/** The first sentence of a description, as plain text for a card. */
function firstSentence(markdown) {
	const paragraph = markdown
		.split(/\n\s*\n/)[0]
		.replace(/\s+/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[`*_]/g, '');
	const sentence = paragraph.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? paragraph;
	return sentence.length > 160 ? `${sentence.slice(0, 157).trimEnd()}…` : sentence;
}

function groupBy(items, key) {
	const groups = new Map();
	for (const item of items) {
		if (!groups.has(item[key])) groups.set(item[key], []);
		groups.get(item[key]).push(item);
	}
	return [...groups];
}

/**
 * One part of the API of an element, as a definition list: the name beside
 * what it does, and under each other on a narrow screen. A table with four
 * columns leaves the description a sliver, and on a phone none at all.
 */
function apiList(heading, entries) {
	if (!entries.length) return '';
	return `<h3>${heading}</h3>
<dl>
${entries
	.map(
		({ name, text, facts = [] }) =>
			`<dt>${name}</dt>\n<dd>${text || '&nbsp;'}</dd>${facts.length ? `\n<dd>${facts.join(' ')}</dd>` : ''}`,
	)
	.join('\n')}
</dl>`;
}

const inlineCode = (text) => `<code>${escapeHtml(text)}</code>`;

/**
 * A type, with each member of a union as a code span of its own. A span does
 * not break, so a long union wraps between its values and never inside one.
 */
const typeCode = (text) =>
	text
		.split(/\s*\|\s*/)
		.map((member) => inlineCode(member))
		.join(' | ');

/** Inline Markdown in a description from the JSDoc: code spans only. */
function describe(text = '') {
	return escapeHtml(text.replace(/\s+/g, ' ').trim()).replace(/`([^`]+)`/g, '<code>$1</code>');
}

function elementApi(element) {
	const attributes = (element.attributes ?? []).map((a) => ({
		name: inlineCode(a.name),
		text: describe(a.description),
		facts: [
			a.type?.text ? `Type: ${typeCode(a.type.text)}.` : '',
			a.default !== undefined && a.default !== "''" ? `Standaard: ${inlineCode(a.default)}.` : '',
		].filter(Boolean),
	}));
	const slots = (element.slots ?? []).map((s) => ({
		name: s.name ? inlineCode(s.name) : '(standaard)',
		text: describe(s.description),
	}));
	const events = (element.events ?? []).map((e) => ({ name: inlineCode(e.name), text: describe(e.description) }));
	const lists = [apiList('Attributen', attributes), apiList('Slots', slots), apiList('Events', events)].filter(Boolean);
	if (!lists.length) return '';
	return `<nldd-rich-text data-site-api>
<h2 id="${element.tagName}"><code>&lt;${element.tagName}&gt;</code></h2>
${lists.join('\n')}
</nldd-rich-text>`;
}

/**
 * The sidebar of a component, a pattern or a version: every sibling, by group.
 * With `search`, a field above the groups shortens the list as you type; each
 * row carries what it can be found by: its name, its slug (the tag) and its
 * group. When nothing is left, a message takes the height of the pane.
 */
function siblingNav(groups, current, hrefOf, { label, search } = {}) {
	const lists = groups.map(
		([group, items]) => `<nldd-container${search ? ' data-site-filter-group' : ''}>
					${
						group
							? `<nldd-title size="display-5">
						<h3>${escapeHtml(group)}</h3>
					</nldd-title>
					<nldd-spacer size="4"></nldd-spacer>
					`
							: ''
					}<nldd-list
						type="navigation"
						appearance="simple"
						dividers="never"
						accessible-label="${escapeHtml(group || label)}"
					>
						${items
							.map(
								(item) => `<nldd-list-item
							href="${hrefOf(item)}"${item === current ? '\n\t\t\t\t\t\t\tcurrent' : ''}${
								search ? `\n\t\t\t\t\t\t\tdata-site-search="${escapeHtml(`${item.name} ${item.slug} ${group}`.toLowerCase())}"` : ''
							}
						>
							<nldd-text-cell text="${escapeHtml(item.name)}"></nldd-text-cell>
							<nldd-spacer-cell size="12"></nldd-spacer-cell>
							<nldd-icon-cell
								size="20"
								color="secondary"
								icon="chevron-right"
							></nldd-icon-cell>
						</nldd-list-item>`,
							)
							.join('\n\t\t\t\t\t\t')}
					</nldd-list>
				</nldd-container>`,
	);
	const groupList = `<nldd-container gap="16">
				${lists.join('\n\t\t\t\t')}
			</nldd-container>`;
	if (!search) return groupList;
	return `<nldd-search-field
					data-site-filter
					placeholder="${escapeHtml(search.placeholder)}"
				></nldd-search-field>
				<nldd-spacer size="16"></nldd-spacer>
				${groupList}
				<nldd-inline-dialog
					data-site-filter-empty
					hidden
					text="${escapeHtml(search.none)}"
				></nldd-inline-dialog>`;
}

/**
 * The body of a page in main: its title, and the blocks under it. The blocks
 * are of different kinds, so a spacer stands between each two.
 */
function docBody({ title, blocks }) {
	return `		<nldd-simple-section grow>
			${title}
			<nldd-container>
${stack(blocks, 32)}
			</nldd-container>
		</nldd-simple-section>`;
}

/** Blocks under each other, a spacer of `size` between each two. */
function stack(blocks, size) {
	return blocks.filter((block) => block?.trim()).join(`\n<nldd-spacer size="${size}"></nldd-spacer>\n`);
}

/** The tabs of a component or a pattern, each a page of its own. */
function tabBar(name, tabs, current) {
	return `<nldd-tab-bar
					navigation
					accessible-label="Onderdelen van ${escapeHtml(name)}"
				>
					${tabs
						.map(
							(tab) => `<nldd-tab-bar-item
						href="${tab.path}"
						text="${escapeHtml(tab.text)}"${tab === current ? '\n\t\t\t\t\t\tcurrent' : ''}
					></nldd-tab-bar-item>`,
						)
						.join('\n\t\t\t\t\t')}
				</nldd-tab-bar>`;
}

/**
 * The pages of a pattern: the pattern itself and, when lint rules point at it,
 * the rules on a tab of their own. The examples stay in the text, beside what
 * they show. The introduction stands above the tabs.
 */
function patternPages(pattern, lintRules) {
	const base = `/patronen/${pattern.slug}/`;
	const markdown = read(relative(repoRoot, pattern.proseFile));
	const split = markdown.search(/^## /m);
	const intro = renderProse(split === -1 ? markdown : markdown.slice(0, split), pattern).blocks;
	const rest = split === -1 ? [] : renderProse(markdown.slice(split), pattern).blocks;
	const rules = rulesOfPattern(lintRules, pattern.slug);
	const tabs = [
		{ path: base, text: 'Patroon', title: pattern.name, body: rest },
		...(rules.length
			? [{ path: `${base}lintregels/`, text: 'Lintregels', title: `${pattern.name}, lintregels`, body: [rulesSection(rules, { link: false })] }]
			: []),
	];
	return tabs.map((tab) => ({
		path: tab.path,
		title: tab.title,
		main: docBody({
			title: pageTitle(pattern.name, { overline: pattern.group }),
			blocks: [...intro, tabs.length > 1 ? tabBar(pattern.name, tabs, tab) : '', ...tab.body],
		}),
	}));
}

/**
 * The pages of a component: one per tab, each with a URL of its own, so a link
 * can point at the examples, the API or the rules and the browser steps back
 * per tab. Above the tabs every page has the same header: the title, the
 * introduction, which starts with the tag, and a link to the source. A tab
 * with nothing on it is left out.
 */
function componentPages(component, lintRules) {
	const base = `/componenten/${component.slug}/`;
	const visible = component.stories.filter((s) => !s.hidden);
	const controls = controlsOf(component);
	// What the description says before its first heading is about the component
	// and stands above the tabs; what follows (Gebruik) belongs to the examples.
	const markdown = component.description ?? '';
	const split = markdown.search(/^#{1,6} /m);
	const intro = split === -1 ? markdown : markdown.slice(0, split);
	const usage = split === -1 ? '' : markdown.slice(split);
	const description = intro.trim() ? renderMarkdown(intro, { href: identity }).html : '';
	// The example with the controls shows the code, so the code under Gebruik
	// would say the same twice; its prose and the sections after it stay.
	const usageText = usage.replace(/^#{1,6} Gebruik\s*\n([^]*?)(?=^#{1,6} |$(?![^]))/m, (_, section) =>
		section.replace(/^```[^]*?^```\s*$/gm, ''),
	);
	const usageBlocks = usageText.trim() ? renderMarkdown(usageText, { href: identity }).blocks : [];
	const api = component.elements.map(elementApi).filter(Boolean);
	const rules = [...new Set(component.elements.flatMap((element) => rulesAboutTag(lintRules, element.tagName)))];
	const status = component.status
		? `\n\t\t\t\t<nldd-tag slot="end" text="${STATUS[component.status] ?? component.status}"></nldd-tag>`
		: '';
	const source = component.sourceFile
		? `<nldd-link
					href="${REPOSITORY}/blob/main/${component.sourceFile}"
					text="Bekijk broncode op GitHub"
				></nldd-link>`
		: '';
	const example = (story, options = {}) => {
		const text = story.description ? renderMarkdown(story.description, { href: identity }).html : '';
		// The example on the usage tab is the component itself, so it needs no heading.
		const heading = options.primary
			? ''
			: `<nldd-title size="display-4">
						<h2>${escapeHtml(story.name)}</h2>
					</nldd-title>`;
		return `<nldd-container id="${story.id.split('--')[1]}">
					${stack([heading, text, stage(component, story, options)], 12)}
				</nldd-container>`;
	};
	// The first story, with the controls, is where you try the component; the
	// others each show one case of it, on a tab of their own.
	const [first, ...others] = visible;
	const tabs = [
		{
			path: base,
			text: 'Gebruik',
			title: component.name,
			body: [...usageBlocks, first ? example(first, { primary: true, controls }) : ''],
			shown: true,
		},
		{
			path: `${base}voorbeelden/`,
			text: 'Voorbeelden',
			title: `${component.name}, voorbeelden`,
			body: others.map((story) => example(story)),
			shown: others.length > 0,
		},
		{ path: `${base}api/`, text: 'API', title: `${component.name}, API`, body: api, shown: api.length > 0 },
		{
			path: `${base}lintregels/`,
			text: 'Lintregels',
			title: `${component.name}, lintregels`,
			body: [rulesSection(rules)],
			shown: rules.length > 0,
		},
	].filter((tab) => tab.shown);
	return tabs.map((tab) => ({
		path: tab.path,
		title: tab.title,
		main: docBody({
			title: pageTitle(component.name, { overline: component.category, end: status }),
			blocks: [
				`<nldd-container>
					${stack([description, source], 12)}
				</nldd-container>`,
				tabBar(component.name, tabs, tab),
				...tab.body,
			],
		}),
	}));
}

/**
 * The changelog, cut into its versions. What stands above the first version
 * heading is the release that is coming: the introduction of the file, then
 * the entries that wait for a version number.
 */
function changelogEntries(markdown) {
	const [head, ...blocks] = markdown.split(/^(?=## )/m);
	const coming = head.slice(head.search(/^### /m) === -1 ? head.length : head.search(/^### /m)).trim();
	const entries = blocks.map((block) => {
		const [heading, ...body] = block.split('\n');
		const version = heading.match(/\d+\.\d+\.\d+/)?.[0] ?? heading.replace(/^## /, '');
		return {
			name: version,
			slug: version,
			date: heading.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '',
			body: body.join('\n').trim(),
		};
	});
	if (coming) entries.unshift({ name: 'Komende versie', slug: '', date: '', body: coming });
	return entries;
}

const changelogPath = (entry, entries) => (entry === entries[0] ? '/changelog/' : `/changelog/${entry.slug}/`);

function changelogPage(entry) {
	const rendered = renderProse(absoluteLinks(entry.body || 'Geen beschrijving bij deze versie.', 'CHANGELOG.md'));
	return docBody({
		title: pageTitle(entry.name, { overline: entry.date ? `Changelog, ${entry.date}` : 'Changelog' }),
		blocks: rendered.blocks,
	});
}

/** How each level of the linter reads on a rule, strictest first. */
const SEVERITIES = {
	error: { label: 'Fout', color: 'critical' },
	warn: { label: 'Waarschuwing', color: 'warning' },
	hint: { label: 'Hint', color: 'neutral' },
};

/** Where the reason behind a rule is written down: its pattern, its guideline or the component that explains it. */
function seePath(see) {
	const [kind, slug] = (see ?? '').split('/');
	if (kind === 'patronen') return `/patronen/${slug}/`;
	if (kind === 'ontwerprichtlijnen') return `/richtlijnen/#${slug}`;
	if (kind === 'componenten') return `/componenten/${slug}/`;
	return undefined;
}

/**
 * Lint rules as rows: the id, what is wrong, and the level. A row links to the
 * page with the reason when there is one and the list is not on that page.
 */
function ruleList(rules, { label, anchors = false, link = true, appearance = 'box-tinted' } = {}) {
	const order = Object.keys(SEVERITIES);
	const sorted = [...rules].sort(
		(a, b) => order.indexOf(a.severity) - order.indexOf(b.severity) || a.id.localeCompare(b.id),
	);
	const bold = (message) => escapeHtml(message.replace(/\*\*/g, '').replace(/`([^`]+)`/g, '**$1**'));
	const rows = sorted.map((rule) => {
		const severity = SEVERITIES[rule.severity] ?? SEVERITIES.warn;
		const href = link ? seePath(rule.see) : undefined;
		const tag = `<nldd-tag
			size="sm"
			color="${severity.color}"
			text="${severity.label}"
		></nldd-tag>`;
		// On a narrow screen the level stands with the name, as in the list
		// pattern: beside the text it would leave the text half the row.
		return `<nldd-list-item${anchors ? ` id="${rule.id}"` : ''}${href ? ` href="${href}"` : ''}>
	<nldd-text-cell
		hide-below="md"
		text="${rule.id}"
		supporting-text="${bold(rule.message)}"
	></nldd-text-cell>
	<nldd-text-cell
		hide-above="sm"
		supporting-text="${bold(rule.message)}"
	>
		<p>
			${rule.id}
			${tag}
		</p>
	</nldd-text-cell>
	<nldd-spacer-cell
		size="12"
		hide-below="md"
	></nldd-spacer-cell>
	<nldd-cell hide-below="md">
		${tag}
	</nldd-cell>${
		href
			? `
	<nldd-spacer-cell size="8"></nldd-spacer-cell>
	<nldd-icon-cell
		size="20"
		color="secondary"
		icon="chevron-right"
	></nldd-icon-cell>`
			: ''
	}
</nldd-list-item>`;
	});
	return `<nldd-list
	appearance="${appearance}"
	accessible-label="${escapeHtml(label)}"
>
${rows.join('\n')}
</nldd-list>`;
}

/**
 * The section "Regels" of a pattern or a component: the lint rules that point
 * at the pattern with `see`, or that name the component.
 */
function rulesSection(rules, { link = true } = {}) {
	if (!rules.length) return '';
	return `
<nldd-container id="regels">
	<nldd-title
		size="display-4"
		supporting-text="Wat nldd lint hier controleert. Een hint laat niets falen."
	>
		<h2>Lintregels</h2>
	</nldd-title>
	<nldd-spacer size="12"></nldd-spacer>
	${ruleList(rules, { label: 'Lintregels', link })}
	<nldd-spacer size="12"></nldd-spacer>
	<nldd-link
		href="/linter/"
		text="Over de linter"
	></nldd-link>
</nldd-container>`;
}

/** The question each group of rules answers, in the order the linter asks them. */
const RULE_GROUPS = [
	['api', 'Bestaat dit, en heeft het effect?'],
	['a11y', 'Mist hulptechnologie iets?'],
	['copy', 'Klopt de tekst?'],
	['structure', 'Klopt de samenstelling?'],
	['pattern', 'Is er een bedoelde manier?'],
	['pure', 'Komt alles uit het designsysteem?'],
];

/** Every rule of the linter, a group per fold, for the page about the linter. */
function allRules(rules) {
	const items = RULE_GROUPS.map(([group, question]) => {
		const inGroup = rules.filter((rule) => rule.group === group);
		if (!inGroup.length) return '';
		return `<nldd-accordion-item
	id="regels-${group}"
	text="${group}: ${escapeHtml(question.toLowerCase())} (${inGroup.length})"
>
${ruleList(inGroup, { label: `Regels in de groep ${group}`, anchors: true, appearance: 'simple' })}
</nldd-accordion-item>`;
	}).join('\n');
	const html = `
<nldd-container id="alle-regels">
	<nldd-title
		size="display-4"
		supporting-text="${rules.length} regels in zes groepen. De linter loopt ze in deze volgorde af."
	>
		<h2>Alle regels</h2>
	</nldd-title>
	<nldd-spacer size="12"></nldd-spacer>
	<nldd-accordion>
${items}
	</nldd-accordion>
</nldd-container>`;
	return { html, headings: [{ id: 'alle-regels', text: 'Alle regels' }] };
}

/**
 * @param {{ base: string }} options
 * @returns {{ pages: Record<string, string>, counts: Record<string, number> }}
 *   every page by its output path relative to the site root
 */
export function buildPages({ base = '/' } = {}) {
	const components = collectComponents();
	const patterns = collectPatterns();
	const lintRules = loadData().rules;
	const pages = {};
	const page = (path, title, description, main, secondary) => {
		pages[`${path.slice(1)}index.html`] = withBase(layout({ title, description, path, main, secondary }), base);
	};

	pages['index.html'] = withBase(homePage(), base);

	let stories = 0;
	const versions = changelogEntries(read('CHANGELOG.md'));
	for (const entry of versions) {
		const path = changelogPath(entry, versions);
		page(
			path,
			path === '/changelog/' ? 'Changelog' : `Changelog ${entry.name}`,
			path === '/changelog/' ? 'Wat er per versie is veranderd.' : `Wat er in versie ${entry.name} is veranderd.`,
			changelogPage(entry),
			{
				title: 'Changelog',
				path: '/changelog/',
				nav: siblingNav([['', versions]], entry, (other) => changelogPath(other, versions), { label: 'Changelog' }),
			},
		);
	}

	for (const { path, file, title, description, stories: storiesPath, examples, rules } of PROSE) {
		// A page written for the site can insert what is kept in one place, such
		// as the list of skills. A file that is shown as it is in the repository
		// has links relative to itself.
		const source = file.startsWith('www/content/')
			? read(file).replace(/^\{\{(\w+)\}\}$/gm, (_, key) => {
					if (!(key in MARKDOWN_INSERTS)) throw new Error(`Onbekende plaatshouder {{${key}}} in ${file}`);
					return MARKDOWN_INSERTS[key];
				})
			: absoluteLinks(read(file), file);
		const storyFile = storiesPath ? parseStoryFile(resolve(repoRoot, storiesPath)) : undefined;
		stories += storyFile?.stories.length ?? 0;
		const rendered = renderProse(source, storyFile);
		const ruleIndex = rules ? allRules(lintRules) : undefined;
		if (ruleIndex) rendered.headings.push(...ruleIndex.headings);
		const extra = ruleIndex
			? [ruleIndex.html]
			: examples
			? [
					`<nldd-rich-text><h2 id="voorbeelden">${escapeHtml(examples)}</h2></nldd-rich-text>`,
					...storyFile.stories.map(
						(story) =>
							`<nldd-container id="${story.id.split('--')[1]}">\n${stack([`<nldd-title size="display-5"><h3>${escapeHtml(story.name)}</h3></nldd-title>`, stage(storyFile, story)], 12)}\n</nldd-container>`,
					),
				]
			: [];
		if (examples) rendered.headings.push({ id: 'voorbeelden', text: examples });
		page(
			path,
			title ?? rendered.title,
			description,
			prosePage({ title: title ?? rendered.title, rendered, extra }),
		);
	}

	const componentGroups = groupBy(components, 'category').sort(([a], [b]) => a.localeCompare(b));
	const componentList = (current) => ({
		title: 'Componenten',
		path: '/componenten/',
		empty: 'Kies een component',
		nav: siblingNav(componentGroups, current, (c) => `/componenten/${c.slug}/`, {
			search: { placeholder: 'Component zoeken', none: 'Geen component gevonden' },
		}),
	});
	page('/componenten/', 'Componenten', `${components.length} web components voor de Rijksoverheid.`, undefined, componentList());
	for (const component of components) {
		const description = firstSentence(component.description || component.elements[0]?.description || component.name);
		for (const tab of componentPages(component, lintRules)) {
			page(tab.path, tab.title, description, tab.main, componentList(component));
		}
	}

	const patternGroups = groupBy(patterns, 'group');
	const patternList = (current) => ({
		title: 'Patronen',
		path: '/patronen/',
		empty: 'Kies een patroon',
		nav: siblingNav(patternGroups, current, (p) => `/patronen/${p.slug}/`, {
			label: 'Patronen',
			search: { placeholder: 'Patroon zoeken', none: 'Geen patroon gevonden' },
		}),
	});
	page('/patronen/', 'Patronen', 'Hoe je componenten samenstelt.', undefined, patternList());
	for (const pattern of patterns) {
		for (const tab of patternPages(pattern, lintRules)) {
			page(tab.path, tab.title, firstSentence(pattern.summary), tab.main, patternList(pattern));
		}
	}

	// One story on a bare page, without the site around it: what a stage shows in
	// its frame, and what "Open los" on a stage leads to.
	pages['voorbeeld/index.html'] = withBase(
		`<!doctype html>
<html lang="nl">
${head({ title: 'Voorbeeld', description: 'Een voorbeeld op een pagina van zichzelf.', entry: 'frame.ts', robots: '\n\t<meta name="robots" content="noindex">' })}
<body class="site-frame"></body>
</html>
`,
		base,
	);

	return {
		pages,
		counts: {
			components: components.length,
			patterns: patterns.length,
			stories: stories + [...components, ...patterns].reduce((n, c) => n + c.stories.length, 0),
		},
	};
}
