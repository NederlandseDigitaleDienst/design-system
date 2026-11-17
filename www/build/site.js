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
import { collectComponents, collectPatterns, parseStoryFile, readFacts, repoRoot } from './sources.js';
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
	{ path: '/changelog/', file: 'CHANGELOG.md', title: 'Changelog', description: 'Wat er per versie is veranderd.' },
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

/** The sections of the site, as the menu of every page behind the landing page. */
const SECTIONS = [
	['Aan de slag', '/aan-de-slag/'],
	['Componenten', '/componenten/'],
	['Patronen', '/patronen/'],
	['Iconen', '/iconen/'],
	['Richtlijnen', '/richtlijnen/'],
	['Linter', '/linter/'],
];

/**
 * The landing page is written by hand in www/index.html and is shown as it is,
 * with two things replaced: its head, so it loads from the same place as every
 * other page, and its bar, so it has the menu every page has. It keeps a
 * stylesheet and a script of its own.
 */
function homePage() {
	const html = read('www/index.html');
	const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? SITE_NAME;
	const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1] ?? '';
	const bar = /<nldd-skip-link slot="header">[^]*?<\/nldd-skip-link>/;
	if (!bar.test(html)) throw new Error('www/index.html heeft geen nldd-skip-link in de header.');
	return html
		.replace(/<head>[^]*?<\/head>/, head({ title, description, entry: 'home.ts', stylesheet: 'home.css', theme: false }))
		.replace(bar, header('/', []));
}

/**
 * The bar of every page, with the sections as its menu. The item of the
 * section a page is in is the current one, and behind the landing page the
 * name of the site leads back to it. There is no back button: the menu and the
 * breadcrumbs in the footer already say where a page is. Behind the landing
 * page the bar also has the menu that shows the site in
 * another theme; the landing page has a picker of its own for that.
 */
function header(path, trail) {
	const home = trail.length > 0 ? '\n\t\t\t\twebsite-href="/"' : '';
	const themeMenu =
		trail.length > 0
			? `
					<nldd-menu-bar-item
						text="Thema"
						icon="themes"
						expandable
						content-priority="text"
						data-site-theme
					>
						<nldd-menu>
							${THEMES.map(
								(theme) => `<nldd-menu-item
								text="${theme.charAt(0).toUpperCase()}${theme.slice(1)}"
								type="radio"
								value="${theme}"${theme === DEFAULT_THEME ? '\n\t\t\t\t\t\t\t\tselected' : ''}
							></nldd-menu-item>`,
							).join('\n\t\t\t\t\t\t\t')}
						</nldd-menu>
					</nldd-menu-bar-item>`
			: '';
	const items = SECTIONS.map(
		([text, href]) => `<nldd-menu-bar-item
						text="${text}"
						href="${href}"${path.startsWith(href) ? '\n\t\t\t\t\t\tcurrent' : ''}
					></nldd-menu-bar-item>`,
	).join('\n\t\t\t\t\t');
	return `<nldd-skip-link slot="header">
			<nldd-top-navigation-bar
				logo-title="Nederlandse Digitale Dienst"
				logo-subtitle="Ministerie van Economische Zaken en Klimaat"
				website-title="${SITE_NAME}"${home}
			>
				<!-- nldd-lint-disable-next-line top-navigation-bar-no-menu-row -- A reference site with a few fixed sections: a reader goes from a component to a pattern and back, and should not have to pass the landing page each time. -->
				<nldd-menu-bar slot="global">
					${items}
				</nldd-menu-bar>
				<nldd-menu-bar slot="utility">${themeMenu}
					<nldd-menu-bar-item
						text="GitHub"
						href="${REPOSITORY}"
					></nldd-menu-bar-item>
				</nldd-menu-bar>
			</nldd-top-navigation-bar>
		</nldd-skip-link>`;
}

/** The footer of every page behind the landing page: where it is, and the rest of the site. */
function footer(title, trail, facts) {
	return `<nldd-page-footer slot="footer">
			<nldd-breadcrumbs slot="breadcrumbs">
				${trail.map(([text, href]) => `<nldd-breadcrumbs-item text="${text}" href="${href}"></nldd-breadcrumbs-item>`).join('\n\t\t\t\t')}
				<nldd-breadcrumbs-item text="${escapeHtml(title)}" current></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>
			<nldd-container
				layout="grid"
				sm-column-count="2"
				md-column-count="2"
				lg-column-count="3"
				gap="24"
			>
				<nldd-container>
					<nldd-title size="display-5">
						<h2>Het systeem</h2>
					</nldd-title>
					<nldd-spacer size="8"></nldd-spacer>
					<nldd-link-group
						orientation="vertical"
						accessible-label="Het systeem"
					>
						<nldd-link
							href="/componenten/"
							text="Componenten"
						></nldd-link>
						<nldd-link
							href="/patronen/"
							text="Patronen"
						></nldd-link>
						<nldd-link
							href="/iconen/"
							text="Iconen"
						></nldd-link>
						<nldd-link
							href="/themas/"
							text="Thema's"
						></nldd-link>
						<nldd-link
							href="/richtlijnen/"
							text="Ontwerprichtlijnen"
						></nldd-link>
					</nldd-link-group>
				</nldd-container>
				<nldd-container>
					<nldd-title size="display-5">
						<h2>Bouwen</h2>
					</nldd-title>
					<nldd-spacer size="8"></nldd-spacer>
					<nldd-link-group
						orientation="vertical"
						accessible-label="Bouwen"
					>
						<nldd-link
							href="/aan-de-slag/"
							text="Aan de slag"
						></nldd-link>
						<nldd-link
							href="/aan-de-slag/ai-assistent/"
							text="Werken met een AI-assistent"
						></nldd-link>
						<nldd-link
							href="/linter/"
							text="Linter"
						></nldd-link>
						<nldd-link
							href="/breakpoints/"
							text="Breakpoints"
						></nldd-link>
						<nldd-link
							href="/vertalingen/"
							text="Vertalingen"
						></nldd-link>
						<nldd-link
							href="/changelog/"
							text="Changelog"
						></nldd-link>
					</nldd-link-group>
				</nldd-container>
				<nldd-container>
					<nldd-title size="display-5">
						<h2>Meedoen</h2>
					</nldd-title>
					<nldd-spacer size="8"></nldd-spacer>
					<nldd-link-group
						orientation="vertical"
						accessible-label="Meedoen"
					>
						<nldd-link
							href="${REPOSITORY}/issues"
							text="Meld een probleem of idee"
						></nldd-link>
						<nldd-link
							href="${REPOSITORY}"
							text="Broncode op GitHub"
						></nldd-link>
					</nldd-link-group>
				</nldd-container>
			</nldd-container>
			<nldd-page-footer-legal-bar slot="legal-bar">
				<nldd-page-footer-legal-bar-item
					slot="start"
					href="https://digitaledienst.overheid.nl/"
					text="Nederlandse Digitale Dienst"
				></nldd-page-footer-legal-bar-item>
				<nldd-page-footer-legal-bar-item
					slot="end"
					href="/toegankelijkheid/"
					text="Toegankelijkheid"
				></nldd-page-footer-legal-bar-item>
				<nldd-page-footer-legal-bar-item
					slot="end"
					href="https://digitaledienst.overheid.nl/over/privacy/"
					text="Privacy"
				></nldd-page-footer-legal-bar-item>
			</nldd-page-footer-legal-bar>
		</nldd-page-footer>`;
}

/**
 * The page shell around the main content.
 *
 * @param {object} input
 * @param {string} input.path - where the page lives, `/componenten/button/`
 * @param {[text: string, href: string][]} input.trail - the pages above this one, from the landing page down
 */
function layout({ title, description, path, trail, main, facts }) {
	return `<!doctype html>
<html lang="nl">
${head({ title, description, entry: 'main.ts' })}
<body class="site">
<nldd-shell>
	<nldd-page>
		${header(path, trail)}

${main}

		${footer(title, trail, facts)}
	</nldd-page>
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
	return `<nldd-title slot="header"${overline ? ` overline="${escapeHtml(overline)}"` : ''}>
				<h1>${escapeHtml(text)}</h1>${end}
			</nldd-title>`;
}

/**
 * A page of prose, as the content page pattern has it: the text in the main
 * column and, when the page has enough headings to get lost in, a table of
 * contents beside it. A page with a great many headings (the changelog) gets
 * none: a list that long is no shorter than the page.
 */
function prosePage({ title, rendered, extra = '' }) {
	const headings = rendered.headings;
	const body = `${rendered.html}${extra}`;
	if (headings.length < 3 || headings.length > 24) {
		return `		<nldd-simple-section grow>
			${pageTitle(title)}
			<nldd-container gap="24">
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
							(h) => `<nldd-list-item href="#${h.id}" current-type="location">
						<nldd-text-cell>
							<p>${h.text}</p>
						</nldd-text-cell>
					</nldd-list-item>`,
						)
						.join('\n\t\t\t\t\t')}
				</nldd-list>
			</nldd-container>
			<nldd-container gap="24">
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

function card({ href, title, text, search }) {
	// A card that is a link takes its name from its content, but that content
	// is more than the title, so the card is named after the title alone.
	return `<nldd-card
					href="${href}"
					accessible-label="${escapeHtml(title)}"${search ? `\n\t\t\t\t\tdata-search="${escapeHtml(search)}"` : ''}
				>
					<nldd-container padding="16">
						<nldd-title size="display-5">
							<h3>${escapeHtml(title)}</h3>
						</nldd-title>${
							text
								? `
						<nldd-spacer size="4"></nldd-spacer>
						<nldd-rich-text>
							<p>${escapeHtml(text)}</p>
						</nldd-rich-text>`
								: ''
						}
					</nldd-container>
				</nldd-card>`;
}

function groupBy(items, key) {
	const groups = new Map();
	for (const item of items) {
		if (!groups.has(item[key])) groups.set(item[key], []);
		groups.get(item[key]).push(item);
	}
	return [...groups];
}

function overviewIntro(title, text, extra = '') {
	return `		<nldd-simple-section padding-bottom="0">
			${pageTitle(title)}
			<nldd-rich-text>
				<p>${text}</p>
			</nldd-rich-text>${extra}
		</nldd-simple-section>`;
}

function cardGroup(heading, cards, last) {
	return `		<nldd-simple-section${last ? ' grow' : ' padding-bottom="0"'} data-filter-group>
			<nldd-title
				slot="header"
				size="display-4"
			>
				<h2>${escapeHtml(heading)}</h2>
			</nldd-title>
			<nldd-collection
				layout="grid"
				item-min-width="240px"
			>
				${cards.join('\n\t\t\t\t')}
			</nldd-collection>
		</nldd-simple-section>`;
}

function componentsOverview(components) {
	const groups = groupBy(components, 'category').sort(([a], [b]) => a.localeCompare(b));
	const sections = groups.map(([category, items], index) =>
		cardGroup(
			category,
			items.map((c) =>
				card({
					href: `/componenten/${c.slug}/`,
					title: c.name,
					text: firstSentence(c.description || c.elements[0]?.description || ''),
					search: `${c.name} ${c.tag ?? ''} ${c.elements.map((e) => e.tagName).join(' ')}`.toLowerCase(),
				}),
			),
			index === groups.length - 1,
		),
	);
	const filter = `
			<nldd-spacer size="24"></nldd-spacer>
			<nldd-search-field
				data-site-filter
				placeholder="Zoek een component"
				accessible-label="Zoek een component"
				width="320px"
			></nldd-search-field>
			<nldd-rich-text
				data-site-filter-empty
				hidden
			>
				<p>Geen component gevonden. Mis je er een? <a href="https://github.com/NederlandseDigitaleDienst/design-system/issues">Stel hem voor</a>.</p>
			</nldd-rich-text>`;
	return `${overviewIntro('Componenten', `${components.length} componenten. Elk is een gewoon HTML-element met een <code>nldd-</code>-prefix.`, filter)}
${sections.join('\n')}`;
}

function apiTable(heading, columns, rows) {
	if (!rows.length) return '';
	return `<h4>${heading}</h4>
<table>
<thead><tr>${columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
<tbody>
${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('\n')}
</tbody>
</table>`;
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
	const attributes = (element.attributes ?? []).map((a) => [
		inlineCode(a.name),
		a.type?.text ? typeCode(a.type.text) : '',
		a.default !== undefined ? inlineCode(a.default) : '',
		describe(a.description),
	]);
	const slots = (element.slots ?? []).map((s) => [s.name ? inlineCode(s.name) : '(standaard)', describe(s.description)]);
	const events = (element.events ?? []).map((e) => [inlineCode(e.name), describe(e.description)]);
	const tables = [
		apiTable('Attributen', ['Naam', 'Type', 'Standaard', 'Beschrijving'], attributes),
		apiTable('Slots', ['Naam', 'Beschrijving'], slots),
		apiTable('Events', ['Naam', 'Beschrijving'], events),
	].filter(Boolean);
	if (!tables.length) return '';
	return `<nldd-rich-text data-site-api>
<h3 id="${element.tagName}"><code>&lt;${element.tagName}&gt;</code></h3>
${tables.join('\n')}
</nldd-rich-text>`;
}

/** The sidebar of a component or a pattern: every sibling, by group. */
function siblingNav(groups, current, hrefOf) {
	return groups
		.map(
			([group, items]) => `${
				group
					? `<nldd-title size="display-6">
					<h3>${escapeHtml(group)}</h3>
				</nldd-title>
				<nldd-spacer size="4"></nldd-spacer>
				`
					: ''
			}<nldd-list
					type="navigation"
					appearance="simple"
					dividers="never"
					accessible-label="${escapeHtml(group || 'Patronen')}"
				>
					${items
						.map(
							(item) => `<nldd-list-item href="${hrefOf(item)}"${item === current ? ' current' : ''}>
						<nldd-text-cell>
							<p>${escapeHtml(item.name)}</p>
						</nldd-text-cell>
					</nldd-list-item>`,
						)
						.join('\n\t\t\t\t\t')}
				</nldd-list>`,
		)
		.join('\n\t\t\t\t<nldd-spacer size="16"></nldd-spacer>\n\t\t\t\t');
}

/** A page with its siblings beside it: a component among components, a pattern among patterns. */
function siblingPage({ label, title, nav, body }) {
	return `		<nldd-sidebar-section
			sidebar-label="${label}"
			grow
		>
			${title}
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
				text="${label}"
				popup-type="dialog"
				data-site-sidebar
			></nldd-button>
			<nldd-container
				slot="sidebar"
				padding="16"
				padding-bottom="8"
			>
				${nav}
			</nldd-container>
			<nldd-container gap="32">
${body}
			</nldd-container>
		</nldd-sidebar-section>`;
}

function componentPage(component, components, facts, lintRules) {
	const visible = component.stories.filter((s) => !s.hidden);
	const controls = controlsOf(component);
	const description = component.description ? renderMarkdown(component.description, { href: identity }).html : '';
	const stories = visible
		.map((story, index) => {
			const text = story.description ? renderMarkdown(story.description, { href: identity }).html : '';
			return `<nldd-container gap="12" id="${story.id.split('--')[1]}">
					<nldd-title size="display-4">
						<h2>${escapeHtml(story.name)}</h2>
					</nldd-title>
					${text}
					${stage(component, story, index === 0 ? { primary: true, controls } : {})}
				</nldd-container>`;
		})
		.join('\n\t\t\t\t');
	const api = component.elements.map(elementApi).filter(Boolean).join('\n');
	const rules = [...new Set(component.elements.flatMap((element) => rulesAboutTag(lintRules, element.tagName)))];
	const status = component.status
		? `\n\t\t\t\t<nldd-tag slot="end" text="${STATUS[component.status] ?? component.status}"></nldd-tag>`
		: '';
	const source = component.sourceFile
		? `<nldd-link href="${REPOSITORY}/blob/main/${component.sourceFile}" text="Broncode op GitHub"></nldd-link>`
		: '';
	const groups = groupBy(components, 'category').sort(([a], [b]) => a.localeCompare(b));
	return siblingPage({
		label: 'Componenten',
		title: pageTitle(component.name, { overline: component.category, end: status }),
		nav: siblingNav(groups, component, (c) => `/componenten/${c.slug}/`),
		body: `				${component.tag ? `<nldd-rich-text><p><code>&lt;${component.tag}&gt;</code></p></nldd-rich-text>` : ''}
				${description}
				${source}
				${stories}
				${api ? `<nldd-title size="display-4" id="api">\n\t\t\t\t\t<h2>API</h2>\n\t\t\t\t</nldd-title>\n${api}` : ''}
				${rulesSection(rules)}`,
	});
}

function patternsOverview(patterns) {
	const groups = groupBy(patterns, 'group');
	const sections = groups.map(([group, items], index) =>
		cardGroup(
			group || 'Onderdelen van een pagina',
			items.map((p) => card({ href: `/patronen/${p.slug}/`, title: p.name, text: firstSentence(p.summary) })),
			index === groups.length - 1,
		),
	);
	return `${overviewIntro('Patronen', 'Een component beschrijft één ding. Een patroon beschrijft hoe je componenten samenstelt tot iets dat een taak afhandelt.')}
${sections.join('\n')}`;
}

/** How each level of the linter reads on a rule, strictest first. */
const SEVERITIES = {
	error: { label: 'Fout', color: 'critical' },
	warn: { label: 'Waarschuwing', color: 'warning' },
	hint: { label: 'Hint', color: 'neutral' },
};

/** Where the reason behind a rule is written down: its pattern or its guideline. */
function seePath(see) {
	const [kind, slug] = (see ?? '').split('/');
	if (kind === 'patronen') return `/patronen/${slug}/`;
	if (kind === 'ontwerprichtlijnen') return `/richtlijnen/#${slug}`;
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
		return `<nldd-list-item${anchors ? ` id="${rule.id}"` : ''}${href ? ` href="${href}"` : ''}>
	<nldd-text-cell
		text="${rule.id}"
		supporting-text="${bold(rule.message)}"
	></nldd-text-cell>
	<nldd-spacer-cell size="12"></nldd-spacer-cell>
	<nldd-cell>
		<nldd-tag
			size="sm"
			color="${severity.color}"
			text="${severity.label}"
		></nldd-tag>
	</nldd-cell>${
		href
			? `
	<nldd-spacer-cell size="12"></nldd-spacer-cell>
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
<nldd-container gap="12" id="regels">
	<nldd-title
		size="display-4"
		supporting-text="Wat nldd lint hier controleert. Een hint laat niets falen."
	>
		<h2>Regels</h2>
	</nldd-title>
	${ruleList(rules, { label: 'Regels', link })}
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
<nldd-container gap="12" id="alle-regels">
	<nldd-title
		size="display-4"
		supporting-text="${rules.length} regels in zes groepen. De linter loopt ze in deze volgorde af."
	>
		<h2>Alle regels</h2>
	</nldd-title>
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
	const facts = readFacts();
	const lintRules = loadData().rules;
	const pages = {};
	const HOME = ['Home', '/'];
	const page = (path, title, description, main, trail = [HOME]) => {
		pages[`${path.slice(1)}index.html`] = withBase(layout({ title, description, path, trail, main, facts }), base);
	};

	pages['index.html'] = withBase(homePage(), base);

	let stories = 0;
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
			? ruleIndex.html
			: examples
			? `\n<nldd-rich-text><h2 id="voorbeelden">${escapeHtml(examples)}</h2></nldd-rich-text>\n${storyFile.stories
					.map(
						(story) =>
							`<nldd-container gap="12" id="${story.id.split('--')[1]}">\n<nldd-title size="display-5"><h3>${escapeHtml(story.name)}</h3></nldd-title>\n${stage(storyFile, story)}\n</nldd-container>`,
					)
					.join('\n')}`
			: '';
		if (examples) rendered.headings.push({ id: 'voorbeelden', text: examples });
		page(
			path,
			title ?? rendered.title,
			description,
			prosePage({ title: title ?? rendered.title, rendered, extra }),
			path.startsWith('/aan-de-slag/') && path !== '/aan-de-slag/' ? [HOME, ['Aan de slag', '/aan-de-slag/']] : [HOME],
		);
	}

	page(
		'/componenten/',
		'Componenten',
		`${components.length} web components voor de Rijksoverheid.`,
		componentsOverview(components),
	);
	for (const component of components) {
		page(
			`/componenten/${component.slug}/`,
			component.name,
			firstSentence(component.description || component.elements[0]?.description || component.name),
			componentPage(component, components, facts, lintRules),
			[HOME, ['Componenten', '/componenten/']],
		);
	}

	page('/patronen/', 'Patronen', 'Hoe je componenten samenstelt.', patternsOverview(patterns));
	const patternGroups = groupBy(patterns, 'group');
	for (const pattern of patterns) {
		const rendered = renderProse(read(relative(repoRoot, pattern.proseFile)), pattern);
		page(
			`/patronen/${pattern.slug}/`,
			pattern.name,
			firstSentence(pattern.summary),
			siblingPage({
				label: 'Patronen',
				title: pageTitle(pattern.name, { overline: pattern.group }),
				nav: siblingNav(patternGroups, pattern, (p) => `/patronen/${p.slug}/`),
				body: `${rendered.html}${rulesSection(rulesOfPattern(lintRules, pattern.slug), { link: false })}`,
			}),
			[HOME, ['Patronen', '/patronen/']],
		);
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
