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
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { rulesAboutTag, rulesOfPattern, tagsOf } from '../../lint/rule-index.js';
import { runsInBrowser } from '../../lint/rule-compiler.js';
import { OPT_IN_GROUPS } from '../../lint/rule-data.js';
import { WCAG, compareCriteria } from '../../lint/wcag.js';
import { WCAG_NL, WCAG_NL_URL } from './wcag.js';
import { loadData } from '../../lint/linter.js';
import { collectComponents, collectPatterns, parseStoryFile, repoRoot } from './sources.js';
import { codeViewer, escapeHtml, headingId, renderMarkdown } from './markdown.js';
import { controlFor } from './attribute-values.js';
import { readCanon, sortByCanon } from '../../scripts/check-control-order.js';
import { MARKDOWN_INSERTS } from './skills.js';
import { DEFAULT_THEME, themesByHue } from '../../scripts/lib/themes.js';

const SITE_NAME = 'NLDD Designsysteem';

/**
 * The pages that are prose: where they live on the site and their source.
 * `stories` is the file the examples on the page come from; with `examples`
 * every story of that file follows the text, under that heading. With `rules`
 * the lint rules follow it: all of them by group, or with 'wcag' those that
 * name a success criterion, by criterion. With `fills` the one example on the
 * page fills a sidebar section of its own, with the text before it as the
 * header: a gallery and its filters.
 */
const PROSE = [
	{ path: '/aan-de-slag/', file: 'www/content/aan-de-slag.md', description: 'Installeer het pakket en zet je eerste component neer.' },
	{ path: '/aan-de-slag/ai-assistent/', file: 'www/content/ai-assistent.md', description: 'Skills voor Claude Code en Cursor.' },
	{ path: '/richtlijnen/', file: 'src/docs/design-guidelines.md', description: 'De ontwerpkeuzes van het systeem en de redenen erachter.' },
	{ path: '/themas/', file: 'src/docs/themes.md', stories: 'src/docs/themes.stories.ts', examples: 'Elk thema op een pagina vol componenten', description: 'De accentkleur van je dienst, in licht en donker.' },
	{ path: '/iconen/', file: 'src/docs/icons.md', stories: 'src/components/content/icon/icon-gallery.stories.ts', fills: true, description: 'Alle iconen, met hun aliassen.' },
	{ path: '/linter/', file: 'www/content/linter.md', description: 'Controleer je code met nldd lint, en wat hij vindt.' },
	{ path: '/breakpoints/', file: 'src/docs/breakpoints.md', description: 'Bij welke breedtes de layout verandert.' },
	{ path: '/vertalingen/', file: 'src/docs/translations.md', description: 'Een interface in een andere taal dan Nederlands.' },
	{ path: '/toegankelijkheid/', file: 'docs/ACCESSIBILITY.md', rules: 'wcag', description: 'Wat het systeem voor toegankelijkheid regelt, en wat jij nog doet.' },
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
			['Lintregels', '/lintregels/', 'checkbox-list'],
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
			['AI-assistent', '/aan-de-slag/ai-assistent/'],
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

/** The sections on a page of their own, with nothing chosen yet. */
const DOCS_PATH = '/documentatie/';

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
				<nldd-spacer size="8"></nldd-spacer>
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
	).join('\n\t\t\t\t<nldd-spacer size="24"></nldd-spacer>\n\t\t\t\t');
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
function pane({ slot, id, title, back, landmarks = false, body, footer = '' }) {
	// A page that is a step below another in main keeps its way back on a wide
	// screen too, where the split view hides the back of a page beside its list.
	const backAttributes = back
		? `\n\t\t\t\tback-text="${escapeHtml(back.text)}"${back.href ? `\n\t\t\t\tback-href="${back.href}"` : ''}${back.always ? '\n\t\t\t\tdata-site-back-always' : ''}`
		: '';
	return `<nldd-page
			slot="${slot}"
			${landmarks ? 'landmarks="page"' : `accessible-label="${escapeHtml(title)}"`}
			sticky-header
		>
			<nldd-top-title-bar
				slot="header"
				text="${escapeHtml(title)}"${landmarks ? '' : '\n\t\t\t\theading-level="2"'}${backAttributes}${id ? `\n\t\t\t\tcollapse-anchor="${id}"` : ''}
			></nldd-top-title-bar>
${body}${footer ? `\n\t\t\t${footer}` : ''}
		</nldd-page>`;
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
function themePicker({ compact = false } = {}) {
	const id = compact ? '-compact' : '';
	return `${
		compact
			? `<nldd-icon-button
						appearance="secondary"
						icon="themes"
						text="Weergave"
						expandable
						tooltip-timing="never"
						data-site-theme-button
					>`
			: `<nldd-button
						appearance="secondary"
						start-icon="themes"
						text="${themeName(DEFAULT_THEME)}"
						expandable
						data-site-theme-button
					>`
	}
						<nldd-popover
							slot="popup"
							placement="bottom-end"
							width="360px"
							accessible-label="Weergave"
						>
							<nldd-page>
								<nldd-top-title-bar
									slot="header"
									text="Weergave"
									dismiss-text="Sluit"
								></nldd-top-title-bar>
								<nldd-container padding="16">
									<nldd-title
										id="site-thema-titel${id}"
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
										id="site-kleurmodus-titel${id}"
										size="display-5"
									>
										<h2>Kleurmodus</h2>
									</nldd-title>
									<nldd-spacer size="8"></nldd-spacer>
									<nldd-toggle-button-group
										type="radio"
										accessible-labeled-by="site-kleurmodus-titel${id}"
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
							</nldd-page>
						</nldd-popover>
					</${compact ? 'nldd-icon-button' : 'nldd-button'}>`;
}

/**
 * The main toolbar, around the panes: back to the landing page and the name
 * of the site at the start, the theme at the end. The way back shows where
 * both sidebars fit beside main; below that width it is in the title bar of
 * the sections, as on a phone (main.ts switches between the two). Up to md the
 * theme is an icon button, so the name has room.
 */
function toolbar({ compact = false } = {}) {
	return `<nldd-container
			slot="${compact ? 'toolbar-compact' : 'toolbar'}"
			${compact ? 'below="md"' : 'above="lg"'}
			padding="8"
		>
			<nldd-toolbar accessible-label="${SITE_NAME}">
				<nldd-toolbar-item
					slot="start"
					priority="3"
					data-site-home
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
					${themePicker({ compact })}
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
 * @param {{ title: string, path: string, nav: string, empty: string, opensFirst?: boolean }} [input.secondary] - the pages of the section
 * @param {string} [input.empty] - what main says to pick when there is neither content nor a section
 */
function layout({ title, description, path, main, secondary, empty, back }) {
	const mainPane = main
		? pane({
				slot: 'main',
				id: 'pagina-titel',
				title,
				// Main goes back to the list it was chosen from, or to the page it
				// hangs under. Without either, back goes to the sections.
				back: back ?? (secondary ? { text: secondary.title, href: secondary.path } : { text: DOCS, href: DOCS_PATH }),
				landmarks: true,
				body: main,
			})
		: // Nothing chosen yet: no title bar, only what to pick.
			`<nldd-page
			slot="main"
			empty${secondary?.opensFirst ? '\n\t\t\tdata-site-opens-first' : ''}
			landmarks="page"
		>
			<nldd-simple-section grow>
				<nldd-inline-dialog text="${escapeHtml(secondary?.empty ?? empty)}"></nldd-inline-dialog>
			</nldd-simple-section>
		</nldd-page>`;
	const panes = [
		sidebarPane({
			slot: 'primary-sidebar',
			id: 'secties-titel',
			title: DOCS,
			back: { text: 'Home', href: '/' },
			nav: primaryNavigation(path),
			footer: aboutLinks,
		}),
		secondary
			? sidebarPane({
					slot: 'secondary-sidebar',
					id: 'lijst-titel',
					title: secondary.title,
					back: { text: DOCS, href: DOCS_PATH },
					nav: secondary.nav,
				})
			: '',
		mainPane,
	].filter(Boolean);
	return `<!doctype html>
<html lang="nl">
${head({ title: secondary && secondary.title !== title ? `${title} · ${secondary.title}` : title, description, entry: 'main.ts' })}
<body class="site">
<nldd-shell>
	<nldd-bar-split-view>
		${toolbar()}
		${toolbar({ compact: true })}
		<nldd-navigation-split-view slot="main">
	${panes.join('\n\t')}
		</nldd-navigation-split-view>
	</nldd-bar-split-view>
</nldd-shell>
</body>
</html>
`;
}

/** The frame one live example stands on. */
function stage(storyFile, story, { primary = false, unwrap = false, controls } = {}) {
	const attributes = [
		`file="${storyFile.file}"`,
		`story="${story.exportName}"`,
		`story-id="${story.id}"`,
		`name="${escapeHtml(story.name)}"`,
		primary ? 'primary' : '',
		unwrap ? 'unwrap' : '',
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
	const known = loadData().tags[element.tagName]?.attrs ?? {};
	return {
		tag: element.tagName,
		attributes: sortByCanon(element.attributes ?? [], (a) => a.name, element.tagName.replace(/^nldd-/, ''))
			.map((a) => controlFor(file, a, known[a.name]?.values))
			.filter(Boolean),
		// The content of a slot comes from the story, so the client places it
		// among the attributes by the same canon.
		canon: readCanon(),
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

function renderProse(markdown, storyFile, { unwrap = false } = {}) {
	const example = storyFile
		? (name) => {
				const story = storyFile.stories.find((s) => s.exportName === name);
				if (!story) throw new Error(`Geen story ${name} in ${storyFile.file}`);
				return stage(storyFile, story, { unwrap });
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
	const body = stack([...(rendered.blocks ?? [rendered.html]), ...extra], 24);
	if (headings.length < 2 || headings.length > 24) {
		return `		<nldd-simple-section grow>
			${pageTitle(title)}
${body}
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
${body}
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
	const attributes = sortByCanon(element.attributes ?? [], (a) => a.name, element.tagName.replace(/^nldd-/, '')).map((a) => ({
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
	const cssProperties = (element.cssProperties ?? []).map((p) => ({ name: inlineCode(p.name), text: describe(p.description) }));
	const lists = [apiList('Attributen', attributes), apiList('Slots', slots), apiList('Events', events), apiList('CSS-variabelen', cssProperties)].filter(Boolean);
	// How the element works comes from the JSDoc of its class, above the tables.
	const about = element.about ? renderMarkdown(element.about, { href: identity, literalHtml: true }).blocks : [];
	if (!lists.length && !about.length) return '';
	const heading = `<nldd-rich-text>
<h2 id="${element.tagName}"><code>&lt;${element.tagName}&gt;</code></h2>
</nldd-rich-text>`;
	const tables = lists.length ? `<nldd-rich-text data-site-api>\n${lists.join('\n')}\n</nldd-rich-text>` : '';
	return stack([heading, ...about, tables], 16);
}

/**
 * The sidebar of a component, a pattern or a version: every sibling, by group.
 * With `search`, a field above the groups shortens the list as you type; each
 * row carries what it can be found by: its name, its slug (the tag) and its
 * group. When nothing is left, a message takes the height of the pane.
 * With `idle`, the groups only show while you search, and `idle` (another
 * list) stands in their place until then.
 */
function siblingNav(groups, current, hrefOf, { label, search, idle } = {}) {
	const lists = groups.map(
		([group, items]) => `<nldd-container${search ? ' data-site-filter-group' : ''}>
					${
						group
							? `<nldd-title size="display-5">
						<h3>${escapeHtml(group)}</h3>
					</nldd-title>
					<nldd-spacer size="8"></nldd-spacer>
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
								search ? `\n\t\t\t\t\t\t\tdata-site-search="${escapeHtml([item.name, item.slug, group, ...(item.keywords ?? [])].join(' ').toLowerCase())}"` : ''
							}${search ? `\n\t\t\t\t\t\t\tdata-site-slug="${item.slug}"` : ''}${
								search && item.related?.length ? `\n\t\t\t\t\t\t\tdata-site-related="${item.related.join(' ')}"` : ''
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
	// Under the matches, the search lists what they name as their alternatives,
	// so a search for one overlay also shows the others to weigh it against.
	const related = search
		? `<nldd-container
					data-site-filter-related
					hidden
				>
					<nldd-title size="display-5">
						<h3>Gerelateerd</h3>
					</nldd-title>
					<nldd-spacer size="8"></nldd-spacer>
					<nldd-list
						type="navigation"
						appearance="simple"
						dividers="never"
						accessible-label="Gerelateerd"
					></nldd-list>
				</nldd-container>`
		: '';
	const groupList = `<nldd-container gap="24"${idle ? '\n\t\t\t\tdata-site-filter-results\n\t\t\t\thidden' : ''}>
				${[...lists, related].filter(Boolean).join('\n\t\t\t\t')}
			</nldd-container>`;
	if (!search) return groupList;
	return `<nldd-search-field
					data-site-filter
					placeholder="${escapeHtml(search.placeholder)}"
					shortcut="/"
				></nldd-search-field>
				<nldd-spacer size="24"></nldd-spacer>${idle ? `\n\t\t\t\t<nldd-container data-site-filter-idle>\n\t\t\t\t${idle}\n\t\t\t\t</nldd-container>` : ''}
				${groupList}
				<nldd-inline-dialog
					data-site-filter-empty
					hidden
					text="${escapeHtml(search.none)}"
				></nldd-inline-dialog>`;
}

/**
 * A page whose example fills the section: the text is the header, and the
 * example puts its filters in the sidebar and its results in the main. It is
 * the section itself, so nothing stands between the page and the filters.
 */
function filledSection({ title, rendered }) {
	const blocks = rendered.blocks;
	const at = blocks.findIndex((block) => block.includes('<site-stage'));
	return `		<nldd-sidebar-section
			sidebar-label="Filters"
			translations='{"components.sidebar-section.sheet-dismiss-action": "Klaar"}'
			grow
		>
			${pageTitle(title)}
			<nldd-spacer slot="header" size="16"></nldd-spacer>
${inSlot(stack(blocks.slice(0, at), 12), 'header')}
			${blocks[at]}
		</nldd-sidebar-section>`;
}

/**
 * The body of a page in main: its title, and the blocks under it. The blocks
 * are of different kinds, so a spacer stands between each two.
 */
function docBody({ title, intro = [], tabs = '', blocks }) {
	// The introduction and the tabs belong to the title, in the header: the
	// section keeps its own distance between the header and what follows.
	const header = [
		intro.some((block) => block?.trim())
			? `
			<nldd-spacer slot="header" size="16"></nldd-spacer>
${inSlot(stack(intro, 12), 'header')}`
			: '',
		tabs
			? `
			<nldd-spacer slot="header" size="24"></nldd-spacer>
			${tabs.replace('navigation', 'navigation\n\t\t\t\t\tslot="header"')}`
			: '',
	].join('');
	return `		<nldd-simple-section grow>
			${title}${header}
${stack(blocks, 32)}
		</nldd-simple-section>`;
}

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/**
 * Puts every outermost element of `html` in `slot`. A section takes its header
 * from children of its own, so a container around them would only add a level.
 */
function inSlot(html, slot) {
	let depth = 0;
	return html.replace(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g, (tag, close, name, attributes, selfClosing) => {
		if (close) {
			depth--;
			return tag;
		}
		const outermost = depth === 0;
		if (!selfClosing && !VOID_ELEMENTS.has(name.toLowerCase())) depth++;
		return outermost ? `<${name} slot="${slot}"${attributes}${selfClosing}>` : tag;
	});
}

/** A block that ends in a heading: what comes next belongs to it. */
const endsInHeading = (block) => /<\/h[2-6]>\s*<\/nldd-rich-text>\s*$/.test(block);

/**
 * Blocks under each other, a spacer of `size` between each two, and a smaller
 * one after a heading, which stands closer to what it introduces.
 */
function stack(blocks, size) {
	return blocks
		.filter((block) => block?.trim())
		.map((block, index, all) =>
			index === all.length - 1 ? block : `${block}\n<nldd-spacer size="${endsInHeading(block) ? 12 : size}"></nldd-spacer>`,
		)
		.join('\n');
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
			? [{ path: `${base}lintregels/`, text: 'Lintregels', title: `${pattern.name}, lintregels`, body: [rulesSection(rules)] }]
			: []),
	];
	return tabs.map((tab) => ({
		path: tab.path,
		title: tab.title,
		main: docBody({
			title: pageTitle(pattern.name, { overline: pattern.group }),
			intro,
			tabs: tabs.length > 1 ? tabBar(pattern.name, tabs, tab) : '',
			blocks: tab.body,
		}),
	}));
}

/**
 * The components to weigh against this one, from `@related` in its JSDoc,
 * under the example: each with the first sentence of its introduction, so
 * the difference reads without opening it.
 */
function relatedSection(component, byTag) {
	const tags = [...new Set(component.elements.flatMap((element) => element.related ?? []))];
	const related = [...new Set(tags.map((tag) => byTag.get(tag)))].filter((other) => other && other !== component);
	if (!related.length) return '';
	return `<nldd-title size="display-4">
						<h2>Gerelateerd</h2>
					</nldd-title>
					<nldd-spacer size="12"></nldd-spacer>
					<nldd-list
						type="navigation"
						accessible-label="Gerelateerd"
					>
						${related
							.map(
								(other) => `<nldd-list-item href="/componenten/${other.slug}/">
							<nldd-text-cell
								text="${escapeHtml(other.name)}"
								supporting-text="${escapeHtml(firstSentence(other.description || other.name))}"
							></nldd-text-cell>
							<nldd-spacer-cell size="12"></nldd-spacer-cell>
							<nldd-icon-cell
								size="20"
								color="secondary"
								icon="chevron-right"
							></nldd-icon-cell>
						</nldd-list-item>`,
							)
							.join('\n\t\t\t\t\t\t')}
					</nldd-list>`;
}

/**
 * The pages of a component: one per tab, each with a URL of its own, so a link
 * can point at the examples, the API or the rules and the browser steps back
 * per tab. Above the tabs every page has the same header: the title, the
 * introduction, which starts with the tag, and a link to the source. A tab
 * with nothing on it is left out.
 */
function componentPages(component, lintRules, byTag) {
	const base = `/componenten/${component.slug}/`;
	const visible = component.stories.filter((s) => !s.hidden);
	const controls = controlsOf(component);
	// The introduction stands above the tabs. What follows its first heading is
	// the code under Gebruik, which the stage with the controls already shows.
	const markdown = component.description ?? '';
	const split = markdown.search(/^#{1,6} /m);
	const intro = split === -1 ? markdown : markdown.slice(0, split);
	const description = intro.trim() ? renderMarkdown(intro, { href: identity }).html : '';
	const api = component.elements.map(elementApi).filter(Boolean);
	const rules = [...new Set(component.elements.flatMap((element) => rulesAboutTag(lintRules, element.tagName)))];
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
			: `<nldd-title
						id="${story.id.split('--')[1]}"
						size="display-4"
					>
						<h2>${escapeHtml(story.name)}</h2>
					</nldd-title>`;
		return stack([heading, text, stage(component, story, options)], 12);
	};
	// With three examples or more, the tab starts with the way to each of them:
	// the names in a row that wraps, so the list stays as short as it can.
	const contents = (stories) =>
		stories.length < 3
			? ''
			: `<nldd-link-group accessible-label="Voorbeelden">
					${stories.map((story) => `<nldd-link href="#${story.id.split('--')[1]}" text="${escapeHtml(story.name)}"></nldd-link>`).join('\n\t\t\t\t\t')}
				</nldd-link-group>`;
	// The first story, with the controls, is where you try the component; the
	// others each show one case of it, on a tab of their own.
	const [first, ...others] = visible;
	const tabs = [
		{
			path: base,
			text: 'Gebruik',
			title: component.name,
			body: [first ? example(first, { primary: true, controls }) : '', relatedSection(component, byTag)],
			shown: true,
		},
		{
			path: `${base}voorbeelden/`,
			text: 'Voorbeelden',
			title: `${component.name}, voorbeelden`,
			body: [contents(others), ...others.map((story) => example(story))],
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
			title: pageTitle(component.name, { overline: component.category }),
			intro: [description, source],
			tabs: tabBar(component.name, tabs, tab),
			blocks: tab.body,
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

const changelogPath = (entry) => `/changelog/${entry.slug || 'komende-versie'}/`;

function changelogPage(entry) {
	const rendered = renderProse(absoluteLinks(entry.body || 'Geen beschrijving bij deze versie.', 'CHANGELOG.md'));
	return docBody({
		title: pageTitle(entry.name, { overline: entry.date ? `Changelog, ${entry.date}` : 'Changelog' }),
		blocks: rendered.blocks,
	});
}

/** How each level of the linter reads on a rule, strictest first. */
const SEVERITIES = {
	error: { label: 'Fout', color: 'critical', effect: 'Kan CI laten falen.' },
	warn: { label: 'Waarschuwing', color: 'warning', effect: 'Kan CI laten falen.' },
	hint: { label: 'Hint', color: 'neutral', effect: 'Laat CI nooit falen.' },
};

/** Where the reason behind a rule is written down: its pattern, its guideline or the component that explains it. */
function seePath(see) {
	const [kind, slug] = (see ?? '').split('/');
	if (kind === 'patronen') return `/patronen/${slug}/`;
	if (kind === 'ontwerprichtlijnen') return `/richtlijnen/#${slug}`;
	if (kind === 'componenten') return `/componenten/${slug}/`;
	return undefined;
}

const rulePath = (rule) => `/lintregels/${rule.id}/`;

/** A page that only sends the reader on, for an address that moved. */
const redirect = (to) => `<!doctype html>
<html lang="nl">
<head>
	<meta charset="utf-8">
	<meta name="robots" content="noindex">
	<meta http-equiv="refresh" content="0; url=${to}">
	<title>Verhuisd</title>
</head>
<body><p>Deze pagina staat nu op <a href="${to}">${to}</a>.</p></body>
</html>
`;

const countRules = (rules) => `${rules.length} ${rules.length === 1 ? 'regel' : 'regels'}`;

/** The rules of one group, in main beside the list of groups. */
function ruleGroupPage(group) {
	return docBody({
		title: pageTitle(group.name, { overline: 'Lintregels' }).replace('<h1>', '<h1 lang="en">'),
		blocks: [
			`<nldd-text text="${escapeHtml(`${group.question} ${countRules(group.rules)}.`)}"></nldd-text>`,
			ruleList(group.rules, { label: `Regels in ${group.name}` }),
		],
	});
}

/**
 * Lint rules as rows: the id, what is wrong, and the level. A row opens the
 * page of the rule. The id and the message are English, as the linter prints
 * them, and say so with `lang`.
 */
function ruleList(rules, { label } = {}) {
	const order = Object.keys(SEVERITIES);
	const sorted = [...rules].sort(
		(a, b) => order.indexOf(a.severity) - order.indexOf(b.severity) || a.id.localeCompare(b.id),
	);
	const bold = (message) => escapeHtml(message.replace(/\*\*/g, '').replace(/`([^`]+)`/g, '**$1**'));
	const rows = sorted.map((rule) => {
		const severity = SEVERITIES[rule.severity] ?? SEVERITIES.warn;
		const tag = `<nldd-tag
			lang="nl"
			size="sm"
			color="${severity.color}"
			text="${severity.label}"
		></nldd-tag>`;
		// On a narrow screen the level stands with the name, as in the list
		// pattern: beside the text it would leave the text half the row.
		return `<nldd-list-item href="${rulePath(rule)}">
	<nldd-text-cell
		lang="en"
		hide-below="md"
		text="${rule.id}"
		supporting-text="${bold(rule.message)}"
	></nldd-text-cell>
	<nldd-text-cell
		lang="en"
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
	</nldd-cell>
	<nldd-spacer-cell size="8"></nldd-spacer-cell>
	<nldd-icon-cell
		size="20"
		color="secondary"
		icon="chevron-right"
	></nldd-icon-cell>
</nldd-list-item>`;
	});
	return `<nldd-list
	appearance="box-tinted"
	accessible-label="${escapeHtml(label)}"
>
${rows.join('\n')}
</nldd-list>`;
}

/**
 * The section "Regels" of a pattern or a component: the lint rules that point
 * at the pattern with `see`, or that name the component.
 */
function rulesSection(rules) {
	if (!rules.length) return '';
	return `
<nldd-title
		id="regels"
		size="display-4"
		supporting-text="Wat nldd lint hier controleert. Een hint laat niets falen."
	>
		<h2>Lintregels</h2>
	</nldd-title>
	<nldd-spacer size="12"></nldd-spacer>
	${ruleList(rules, { label: 'Lintregels' })}
	<nldd-spacer size="12"></nldd-spacer>
	<nldd-link
		href="/linter/"
		text="Over de linter"
	></nldd-link>`;
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

/**
 * Many rules under one heading: a row per group, and the rules of a group in a
 * sheet. Folds of up to a hundred rows pushed the rest of the page away, and
 * closing one left the reader somewhere else.
 *
 * @param {object} options
 * @param {string} options.id - the anchor of the section, and the prefix of every sheet
 * @param {{ key: string, title: string, about: string, rules: object[] }[]} options.groups
 */
function ruleSheets({ id, heading, supporting, label, groups }) {
	const shown = groups.filter((group) => group.rules.length);
	const about = (group) => escapeHtml(`${group.about} ${countRules(group.rules)}.`);
	const rows = shown.map((group) => `<nldd-list-item
		button
		data-site-sheet="${id}-${group.key}"
	>
		<nldd-text-cell
			text="${escapeHtml(group.title)}"
			supporting-text="${about(group)}"
		></nldd-text-cell>
		<nldd-spacer-cell size="12"></nldd-spacer-cell>
		<nldd-icon-cell
			size="20"
			color="secondary"
			icon="chevron-right"
		></nldd-icon-cell>
	</nldd-list-item>`).join('\n');
	const sheets = shown.map((group) => `<nldd-sheet
	id="${id}-${group.key}"
	placement="right"
	width="640px"
>
	<nldd-page sticky-header>
		<nldd-top-title-bar
			slot="header"
			text="${escapeHtml(group.title)}"
			dismiss-text="Sluit"
			collapse-anchor="${id}-${group.key}-titel"
		></nldd-top-title-bar>
		<nldd-simple-section>
			<nldd-title
				id="${id}-${group.key}-titel"
				slot="header"
				size="display-2"
				text="${escapeHtml(group.title)}"
				supporting-text="${about(group)}"
				heading-level="1"
			></nldd-title>
			${ruleList(group.rules, { label: `Regels bij ${group.title}` })}
		</nldd-simple-section>
	</nldd-page>
</nldd-sheet>`).join('\n');
	const html = `
<nldd-title
		id="${id}"
		size="display-4"
		supporting-text="${escapeHtml(supporting)}"
	>
		<h2>${escapeHtml(heading)}</h2>
	</nldd-title>
	<nldd-spacer size="12"></nldd-spacer>
	<nldd-list
		appearance="box-tinted"
		accessible-label="${escapeHtml(label)}"
	>
	${rows}
	</nldd-list>
${sheets}`;
	return { html, headings: [{ id, text: heading }] };
}

/**
 * The rules that name a success criterion, by criterion, for the page about
 * accessibility. They come from every group: a link text is a rule of `copy`
 * and a control in a control one of `structure`. The rules of `a11y` that name
 * no criterion follow in a group of their own, so none of them goes missing.
 */
function rulesByCriterion(rules) {
	const criteria = [...new Set(rules.flatMap((rule) => rule.wcag ?? []))].sort(compareCriteria);
	const withCriterion = rules.filter((rule) => rule.wcag);
	return ruleSheets({
		id: 'lintregels-per-succescriterium',
		heading: 'Lintregels per succescriterium',
		supporting: `${withCriterion.length} regels uit alle groepen noemen het succescriterium van WCAG 2.2 dat ze bewaken.`,
		label: 'Succescriteria met lintregels',
		groups: [
			...criteria.map((criterion) => ({
				key: criterion.replaceAll('.', '-'),
				title: `${criterion} ${WCAG_NL[criterion].name}`,
				about: `Niveau ${WCAG[criterion].level}.`,
				rules: rules.filter((rule) => rule.wcag?.includes(criterion)),
			})),
			{
				key: 'goede-praktijk',
				title: 'Zonder succescriterium',
				about: 'Regels uit de groep a11y die verder gaan dan WCAG vraagt.',
				rules: rules.filter((rule) => rule.group === 'a11y' && !rule.wcag),
			},
		],
	});
}

/** Who sees to a success criterion, as the accessibility page names it, and the color of its tag. */
const RESPONSIBLE = { Systeem: 'success', Samen: 'accent', Jij: 'neutral' };

/** The four principles of WCAG, by the first digit of their success criteria. */
const PRINCIPLES = { 1: 'Waarneembaar', 2: 'Bedienbaar', 3: 'Begrijpelijk', 4: 'Robuust' };

/**
 * The supporting text of a row from a table cell in Markdown. Code becomes
 * bold, as the cell draws it from its attribute; a cell with a link takes a
 * paragraph of its own, with the link as a component.
 */
function supportingText(markdown) {
	const plain = (text) => escapeHtml(text.replace(/`([^`]+)`/g, '$1'));
	if (!/\]\(/.test(markdown)) return { attribute: escapeHtml(markdown.replace(/`([^`]+)`/g, '**$1**')) };
	const parts = markdown.split(/\[([^\]]+)\]\(([^)]+)\)/);
	const inline = parts.map((part, index) =>
		index % 3 === 0
			? plain(part)
			: index % 3 === 1
				? `<nldd-link href="${escapeHtml(parts[index + 1])}" text="${plain(part)}"></nldd-link>`
				: '',
	);
	return { slot: `\n\t\t<p slot="supporting-text">${inline.join('')}</p>\n\t` };
}

/**
 * The tables "who does what" of the accessibility page, as lists: a row per
 * success criterion, with who sees to it as a tag. In the repository the page
 * keeps its tables, which GitHub draws; here three columns leave a phone no
 * room for the text.
 */
function criteriaLists(markdown) {
	const table = /^\| Succescriterium \| Wie \| Wat \|\n\|[-| ]+\|\n((?:\|.*\|\n)+)/gm;
	return markdown.replace(table, (_, body) => {
		const rows = body
			.trim()
			.split('\n')
			.map((line) => {
				const [criterion, who, what] = line.slice(1, -1).split(' | ').map((cell) => cell.trim());
				if (!(who in RESPONSIBLE)) throw new Error(`Onbekende waarde "${who}" in de kolom Wie bij ${criterion}.`);
				const text = supportingText(what);
				const supporting = text.attribute ? `\n\t\tsupporting-text="${text.attribute}"` : '';
				const tag = `<nldd-tag
			size="sm"
			color="${RESPONSIBLE[who]}"
			text="${who}"
		></nldd-tag>`;
				// On a narrow screen the tag stands with the name, as in a list of rules.
				return `<nldd-list-item>
	<nldd-text-cell
		hide-below="md"
		text="${escapeHtml(criterion)}"${supporting}
	>${text.slot ?? ''}</nldd-text-cell>
	<nldd-text-cell
		hide-above="sm"${supporting}
	>
		<p>
			${escapeHtml(criterion)}
			${tag}
		</p>${text.slot ?? ''}</nldd-text-cell>
	<nldd-spacer-cell
		size="12"
		hide-below="md"
	></nldd-spacer-cell>
	<nldd-cell hide-below="md">
		${tag}
	</nldd-cell>
</nldd-list-item>`;
			});
		// On one line: Markdown only takes a block for HTML when its first line is a whole tag.
		return `<nldd-list appearance="box-tinted" accessible-label="Succescriteria van het principe ${PRINCIPLES[body.trim()[2]]}">
${rows.join('\n')}
</nldd-list>\n`;
	});
}

/** Where a rule runs, in a sentence or two. */
function whereRuleRuns(rule) {
	if (rule.runtime) return 'Alleen in de browser, tijdens het ontwikkelen. Hij leest iets wat pas op de draaiende pagina bestaat.';
	const source = 'In broncode en in gebouwde HTML.';
	if (OPT_IN_GROUPS.includes(rule.group)) return `${source} Alleen als je project de groep <code>${rule.group}</code> aanzet.`;
	return runsInBrowser(rule) ? `${source} Tijdens het ontwikkelen ook in de browser.` : source;
}

/** The selectors of a rule as it is written in src/rules/, without its message and examples. */
function ruleDefinition(rule) {
	const source = parseYaml(read(`src/rules/${rule.group}/${rule.id}.yaml`));
	const kept = Object.fromEntries(
		['context', 'assert', 'report', 'count', 'ref'].filter((key) => key in source).map((key) => [key, source[key]]),
	);
	return stringifyYaml(kept, { lineWidth: 0 });
}

/**
 * The page of one rule: what it says, how heavy it weighs, where it runs, the
 * success criteria it guards, markup that passes and markup that fails, and
 * the rule itself. It is what `nldd explain` prints, with the links a terminal
 * cannot follow.
 *
 * @param {object} rule
 * @param {{ byTag: Map<string, object>, patternNames: Map<string, string> }} names
 */
function rulePage(rule, { byTag, patternNames }) {
	const severity = SEVERITIES[rule.severity] ?? SEVERITIES.warn;
	const question = RULE_GROUPS.find(([group]) => group === rule.group)?.[1] ?? '';
	const [seeKind, seeSlug] = (rule.see ?? '').split('/');
	const seeText =
		seeKind === 'patronen'
			? `Patroon ${patternNames.get(seeSlug) ?? seeSlug}`
			: seeKind === 'ontwerprichtlijnen'
				? `Ontwerprichtlijnen, ${seeSlug.replaceAll('-', ' ')}`
				: `<code>nldd-${seeSlug}</code>`;
	const components = tagsOf(rule)
		.filter((tag) => byTag.has(tag))
		.map((tag) => `<a href="/componenten/${byTag.get(tag).slug}/"><code>${tag}</code></a>`);
	const criteria = (rule.wcag ?? []).map(
		(criterion) =>
			`<a href="${WCAG_NL_URL}#${WCAG_NL[criterion].anchor}" rel="noopener">${criterion} ${escapeHtml(WCAG_NL[criterion].name)}</a> (niveau ${WCAG[criterion].level})`,
	);
	const facts = [
		['Niveau', `${severity.label}. ${severity.effect}`],
		['Groep', `<code>${rule.group}</code>. ${escapeHtml(question)}`],
		['Draait', whereRuleRuns(rule)],
		criteria.length ? ['WCAG 2.2', criteria.join('<br>')] : undefined,
		rule.fix ? ['Herstel', '<code>nldd lint --fix</code> lost dit op.'] : undefined,
		components.length ? [components.length === 1 ? 'Component' : 'Componenten', components.join(', ')] : undefined,
		rule.see ? ['Waarom', `<a href="${seePath(rule.see)}">${seeText}</a>`] : undefined,
		rule.aliases?.length ? ['Heette eerder', rule.aliases.map(inlineCode).join(', ')] : undefined,
	].filter(Boolean);
	const heading = (text, about = '') =>
		`<nldd-rich-text>\n<h2 id="${headingId(text)}">${text}</h2>${about ? `\n<p>${about}</p>` : ''}\n</nldd-rich-text>`;
	const examples = (text, markup, about) =>
		markup?.length ? [stack([heading(text, about), ...markup.map((example) => codeViewer(example, 'html', { wrap: true }))], 12)] : [];
	return docBody({
		title: pageTitle(rule.id, { overline: 'Lintregel' }),
		intro: [`<nldd-rich-text>\n<p lang="en">${describe(rule.message)}</p>\n</nldd-rich-text>`],
		blocks: [
			`<nldd-rich-text data-site-api>
<dl>
${facts.map(([name, text]) => `<dt>${name}</dt>\n<dd>${text}</dd>`).join('\n')}
</dl>
</nldd-rich-text>`,
			...examples('Goed', rule.examples?.passed),
			...examples('Fout', rule.examples?.failed),
			...examples('Onzeker', rule.examples?.cantTell, 'Hier ziet de linter niet genoeg, en dan meldt hij niets.'),
			stack(
				[
					heading(
						'De regel',
						'Een regel is een selector. <code>context</code> kiest de elementen, <code>assert</code> zegt wat ze moeten zijn en <code>report</code> wat ze niet mogen zijn.',
					),
					codeViewer(ruleDefinition(rule), 'yaml', { wrap: true }),
					`<nldd-link
	href="${REPOSITORY}/blob/main/src/rules/${rule.group}/${rule.id}.yaml"
	text="Bekijk de regel op GitHub"
></nldd-link>`,
				],
				12,
			),
		],
	});
}

export function buildPages({ base = '/' } = {}) {
	const components = collectComponents();
	const patterns = collectPatterns();
	const lintRules = loadData().rules;
	const pages = {};
	const page = (path, title, description, main, secondary, back) => {
		pages[`${path.slice(1)}index.html`] = withBase(layout({ title, description, path, main, secondary, back }), base);
	};

	pages[`${DOCS_PATH.slice(1)}index.html`] = withBase(
		layout({
			title: DOCS,
			description: 'Componenten, patronen en handleidingen van het NLDD Designsysteem.',
			path: DOCS_PATH,
			empty: 'Kies een onderdeel',
		}),
		base,
	);

	pages['index.html'] = withBase(homePage(), base);

	let stories = 0;
	const versions = changelogEntries(read('CHANGELOG.md'));
	const changelogList = (current) => ({
		title: 'Changelog',
		path: '/changelog/',
		empty: 'Kies een versie',
		// Where main is in view beside the list, /changelog/ shows the newest version.
		opensFirst: true,
		nav: siblingNav([['', versions]], current, changelogPath, { label: 'Changelog' }),
	});
	page('/changelog/', 'Changelog', 'Wat er per versie is veranderd.', undefined, changelogList());
	for (const entry of versions) {
		page(
			changelogPath(entry),
			`Changelog ${entry.slug ? entry.name : entry.name.toLowerCase()}`,
			`Wat er in ${entry.slug ? `versie ${entry.name}` : 'de komende versie'} is veranderd.`,
			changelogPage(entry),
			changelogList(entry),
		);
	}

	for (const { path, file, title, description, stories: storiesPath, examples, rules, fills } of PROSE) {
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
		const rendered = renderProse(rules === 'wcag' ? criteriaLists(source) : source, storyFile, { unwrap: fills });
		const ruleIndex = rules === 'wcag' ? rulesByCriterion(lintRules) : undefined;
		if (ruleIndex) rendered.headings.push(...ruleIndex.headings);
		const extra = ruleIndex
			? [ruleIndex.html]
			: examples
			? [
					`<nldd-rich-text><h2 id="voorbeelden">${escapeHtml(examples)}</h2></nldd-rich-text>`,
					...storyFile.stories.map(
						(story) =>
							stack([`<nldd-title id="${story.id.split('--')[1]}" size="display-5"><h3>${escapeHtml(story.name)}</h3></nldd-title>`, stage(storyFile, story)], 12),
					),
				]
			: [];
		if (examples) rendered.headings.push({ id: 'voorbeelden', text: examples });
		page(
			path,
			title ?? rendered.title,
			description,
			fills ? filledSection({ title: title ?? rendered.title, rendered }) : prosePage({ title: title ?? rendered.title, rendered, extra }),
		);
	}

	const byTag = new Map(components.flatMap((c) => c.elements.map((element) => [element.tagName, c])));
	// The rules are a section of their own: the groups as its list, in the order
	// the linter asks them, the rules of a group in main, and a rule opens in
	// main with the way back to its group.
	const patternNames = new Map(patterns.map((pattern) => [pattern.slug, pattern.name]));
	const ruleGroups = RULE_GROUPS.map(([group, question]) => ({
		name: group,
		slug: group,
		question,
		rules: lintRules.filter((rule) => rule.group === group),
	})).filter((group) => group.rules.length);
	// A search finds a rule in any group, by its id and the words of its message.
	const ruleItems = new Map(lintRules.map((rule) => [rule, { name: rule.id, slug: rule.id, keywords: [rule.message.replace(/[`*]/g, '')] }]));
	const ruleNav = (current, currentRule) => ({
		title: 'Lintregels',
		path: '/lintregels/',
		empty: 'Kies een groep',
		opensFirst: true,
		nav: siblingNav(
			ruleGroups.map((group) => [group.name, group.rules.map((rule) => ruleItems.get(rule))]),
			currentRule && ruleItems.get(currentRule),
			(item) => `/lintregels/${item.slug}/`,
			{
				search: { placeholder: 'Regel zoeken', none: 'Geen regel gevonden' },
				idle: siblingNav([['', ruleGroups]], current, (group) => `/lintregels/${group.slug}/`, { label: 'Groepen van regels' }),
			},
		),
	});
	page('/lintregels/', 'Lintregels', `De ${lintRules.length} regels van nldd lint, in zes groepen.`, undefined, ruleNav());
	for (const group of ruleGroups) {
		page(`/lintregels/${group.slug}/`, group.name, `${group.question} ${countRules(group.rules)}.`, ruleGroupPage(group), ruleNav(group));
		for (const rule of group.rules) {
			page(
				rulePath(rule),
				rule.id,
				rule.message.replace(/`/g, ''),
				rulePage(rule, { byTag, patternNames }),
				ruleNav(group, rule),
				{ text: group.name, href: `/lintregels/${group.slug}/`, always: true },
			);
			// A rule had its page under the linter, and links to it are out there.
			pages[`linter/${rule.id}/index.html`] = redirect(`${base === '/' ? '' : base.replace(/\/$/, '')}${rulePath(rule)}`);
		}
	}
	// What the search shows under its matches: the pages they name in @related.
	for (const component of components) {
		const tags = component.elements.flatMap((element) => element.related ?? []);
		component.related = [...new Set(tags.map((tag) => byTag.get(tag)?.slug))].filter((slug) => slug && slug !== component.slug);
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
		for (const tab of componentPages(component, lintRules, byTag)) {
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
	// its frame, and what "Open in nieuw tabblad" on a stage leads to.
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
