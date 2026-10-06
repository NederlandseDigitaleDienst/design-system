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
import { resolve } from 'node:path';
import { storybookId } from '../../scripts/lib/skill-patterns.js';
import { collectComponents, collectPatterns, readFacts, repoRoot } from './sources.js';
import { codeViewer, escapeHtml, renderMarkdown } from './markdown.js';
import { controlFor } from './attribute-values.js';

const SITE_NAME = 'NLDD Designsysteem';

const NAVIGATION = [
	{ path: '/aan-de-slag/', text: 'Aan de slag' },
	{ path: '/componenten/', text: 'Componenten' },
	{ path: '/patronen/', text: 'Patronen' },
	{ path: '/iconen/', text: 'Iconen' },
	{ path: '/richtlijnen/', text: 'Richtlijnen' },
];

const STATUS = {
	stable: 'Stabiel',
	beta: 'Bèta',
	experimental: 'Experimenteel',
	wip: 'In ontwikkeling',
};

/**
 * Prefixes the links between pages with the deploy base. The entry script and
 * the icons in the head are left alone: Vite resolves those itself and adds the
 * base when it builds.
 */
function withBase(html, base) {
	if (base === '/') return html;
	return html.replace(/<([a-z][a-z0-9-]*)\b([^>]*?)\bhref="\/(?!\/)/g, (match, tag, before) =>
		tag === 'link' ? match : `<${tag}${before}href="${base}`,
	);
}

function read(path) {
	return readFileSync(resolve(repoRoot, path), 'utf8');
}

const identity = (path) => path;

/** The page shell: header, navigation and footer around the main content. */
function layout({ title, description, path, main, facts, bodyClass = '' }) {
	const section = NAVIGATION.find((item) => path.startsWith(item.path));
	const items = NAVIGATION.map(
		(item) =>
			`<nldd-menu-bar-item text="${item.text}" href="${item.path}"${item === section ? ' current' : ''}></nldd-menu-bar-item>`,
	).join('\n\t\t\t\t\t');
	const pageTitle = title === SITE_NAME ? SITE_NAME : `${title} · ${SITE_NAME}`;
	return `<!doctype html>
<html lang="nl">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${escapeHtml(pageTitle)}</title>
	<meta name="description" content="${escapeHtml(description)}">
	<link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg">
	<link rel="apple-touch-icon" href="/touch-icon.png">
	<script type="module" src="/main.ts"></script>
</head>
<body class="site ${bodyClass}">
	<nldd-app-view>
		<nldd-page>
			<nldd-skip-link slot="header">
				<nldd-top-navigation-bar website-title="${SITE_NAME}" website-href="/">
					<nldd-menu-bar slot="global" accessible-label="Hoofdnavigatie">
					${items}
					</nldd-menu-bar>
					<nldd-menu-bar slot="utility" accessible-label="Hulpnavigatie">
						<nldd-menu-bar-item text="GitHub" href="${facts.repository}"></nldd-menu-bar-item>
					</nldd-menu-bar>
				</nldd-top-navigation-bar>
			</nldd-skip-link>

${main}

			<nldd-page-footer slot="footer">
				<nldd-container layout="grid" padding="24" gap="16">
					<nldd-container gap="8">
						<nldd-title size="5" text="Het systeem" heading-level="2"></nldd-title>
						<nldd-link size="sm" href="/componenten/" text="Componenten"></nldd-link>
						<nldd-link size="sm" href="/patronen/" text="Patronen"></nldd-link>
						<nldd-link size="sm" href="/iconen/" text="Iconen"></nldd-link>
						<nldd-link size="sm" href="/richtlijnen/" text="Ontwerprichtlijnen"></nldd-link>
					</nldd-container>
					<nldd-container gap="8">
						<nldd-title size="5" text="Bouwen" heading-level="2"></nldd-title>
						<nldd-link size="sm" href="/aan-de-slag/" text="Aan de slag"></nldd-link>
						<nldd-link size="sm" href="/aan-de-slag/ai-assistent/" text="Werken met een AI-assistent"></nldd-link>
						<nldd-link size="sm" href="/breakpoints/" text="Breakpoints"></nldd-link>
						<nldd-link size="sm" href="/vertalingen/" text="Vertalingen"></nldd-link>
					</nldd-container>
					<nldd-container gap="8">
						<nldd-title size="5" text="Meedoen" heading-level="2"></nldd-title>
						<nldd-link size="sm" href="${facts.repository}/issues" text="Meld een probleem of idee"></nldd-link>
						<nldd-link size="sm" href="${facts.repository}" text="Broncode op GitHub"></nldd-link>
						<nldd-link size="sm" href="/changelog/" text="Changelog"></nldd-link>
					</nldd-container>
				</nldd-container>
				<site-built-with pages="${facts.slugs}"></site-built-with>
				<nldd-page-footer-legal-bar slot="legal-bar">
					<nldd-page-footer-legal-bar-item slot="start" text="Nederlandse Digitale Dienst"></nldd-page-footer-legal-bar-item>
					<nldd-page-footer-legal-bar-item slot="end" href="/changelog/" text="Versie ${facts.version}"></nldd-page-footer-legal-bar-item>
					<nldd-page-footer-legal-bar-item slot="end" href="${facts.repository}/blob/main/LICENSE" text="EUPL-1.2"></nldd-page-footer-legal-bar-item>
				</nldd-page-footer-legal-bar>
			</nldd-page-footer>
		</nldd-page>
	</nldd-app-view>
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

function prosePage({ markdown, storyFile }) {
	const example = storyFile
		? (name) => {
				const story = storyFile.stories.find((s) => s.exportName === name);
				if (!story) throw new Error(`Geen story ${name} in ${storyFile.file}`);
				return stage(storyFile, story);
			}
		: undefined;
	return renderMarkdown(markdown, { href: identity, example });
}

function proseSection(html) {
	return `			<nldd-simple-section>
				<nldd-container gap="24" class="site-prose">
${html}
				</nldd-container>
			</nldd-simple-section>`;
}

/** The first sentence of a description, as plain text for a card. */
function firstSentence(markdown) {
	const paragraph = markdown.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').replace(/[`*_]/g, '');
	const sentence = paragraph.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? paragraph;
	return sentence.length > 160 ? `${sentence.slice(0, 157).trimEnd()}…` : sentence;
}

function card({ href, title, text, search }) {
	return `<nldd-card href="${href}"${search ? ` data-search="${escapeHtml(search)}"` : ''}>
						<nldd-container padding="16">
							<nldd-title size="5" text="${escapeHtml(title)}" heading-level="3"></nldd-title>
							${text ? `<nldd-spacer size="4"></nldd-spacer>\n\t\t\t\t\t\t\t<nldd-text size="sm" color="secondary">${escapeHtml(text)}</nldd-text>` : ''}
						</nldd-container>
					</nldd-card>`;
}

function groupBy(items, key) {
	const groups = new Map();
	for (const item of items) {
		if (!groups.has(item[key])) groups.set(item[key], []);
		groups.get(item[key]).push(item);
	}
	return [...groups].sort(([a], [b]) => a.localeCompare(b));
}

function componentsOverview(components) {
	const groups = groupBy(components, 'category')
		.map(
			([category, items]) => `			<nldd-simple-section data-filter-group>
				<nldd-title slot="header" size="3" text="${escapeHtml(category)}" heading-level="2"></nldd-title>
				<nldd-collection layout="grid" item-width="240px" max-items="999">
					${items
						.map((c) =>
							card({
								href: `/componenten/${c.slug}/`,
								title: c.name,
								text: firstSentence(c.description || c.elements[0]?.description || ''),
								search: `${c.name} ${c.tag ?? ''} ${c.elements.map((e) => e.tagName).join(' ')}`.toLowerCase(),
							}),
						)
						.join('\n\t\t\t\t\t')}
				</nldd-collection>
			</nldd-simple-section>`,
		)
		.join('\n');
	return `			<nldd-simple-section padding-bottom="0">
				<nldd-title size="1" text="Componenten" heading-level="1" supporting-text="${components.length} componenten. Elk is een gewoon HTML-element met een nldd-prefix."></nldd-title>
				<nldd-spacer size="24"></nldd-spacer>
				<nldd-search-field data-site-filter placeholder="Zoek een component" width="320px"></nldd-search-field>
				<p class="site-filter-empty" hidden>Geen component gevonden. Mis je er een? <a href="https://github.com/NederlandseDigitaleDienst/design-system/issues">Stel hem voor</a>.</p>
			</nldd-simple-section>
${groups}`;
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

/** Inline Markdown in a description from the JSDoc: code spans only. */
function describe(text = '') {
	return escapeHtml(text.replace(/\s+/g, ' ').trim()).replace(/`([^`]+)`/g, '<code>$1</code>');
}

function elementApi(element) {
	const attributes = (element.attributes ?? []).map((a) => [
		inlineCode(a.name),
		a.type?.text ? inlineCode(a.type.text) : '',
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
	return `<nldd-rich-text class="site-api">
<h3 id="${element.tagName}"><code>&lt;${element.tagName}&gt;</code></h3>
${tables.join('\n')}
</nldd-rich-text>`;
}

function componentNav(components, current) {
	return groupBy(components, 'category')
		.map(
			([category, items]) => `<nldd-container gap="4">
							<nldd-title size="6" text="${escapeHtml(category)}" heading-level="2"></nldd-title>
							${items
								.map(
									(c) =>
										`<a class="site-nav-link" href="/componenten/${c.slug}/"${c === current ? ' aria-current="page"' : ''}>${escapeHtml(c.name)}</a>`,
								)
								.join('\n\t\t\t\t\t\t\t')}
						</nldd-container>`,
		)
		.join('\n\t\t\t\t\t\t');
}

function componentPage(component, components, facts) {
	const visible = component.stories.filter((s) => !s.hidden);
	const controls = controlsOf(component);
	const description = component.description
		? renderMarkdown(component.description, { href: identity }).html
		: '';
	const stories = visible
		.map((story, index) => {
			const text = story.description ? renderMarkdown(story.description, { href: identity }).html : '';
			return `<section class="site-story" id="${story.id.split('--')[1]}">
						<nldd-title size="3" text="${escapeHtml(story.name)}" heading-level="2"></nldd-title>
						${text}
						${stage(component, story, index === 0 ? { primary: true, controls } : {})}
					</section>`;
		})
		.join('\n\t\t\t\t\t');
	const api = component.elements.map(elementApi).filter(Boolean).join('\n');
	const status = component.status
		? `<nldd-tag slot="end" text="${STATUS[component.status] ?? component.status}"></nldd-tag>`
		: '';
	const source = component.sourceFile
		? `<nldd-link size="sm" href="${facts.repository}/blob/main/${component.sourceFile}" text="Broncode"></nldd-link>`
		: '';
	return `			<nldd-sidebar-section sidebar-label="Componenten" class="site-docs">
				<nav slot="sidebar" aria-label="Componenten">
					<nldd-container padding="16" gap="20">
						${componentNav(components, component)}
					</nldd-container>
				</nav>
				<nldd-container gap="32" class="site-prose">
					<nldd-container gap="12">
						<nldd-button class="site-nav-trigger" size="sm" text="Alle componenten" start-icon="list" data-site-nav-trigger></nldd-button>
						<nldd-title size="1" text="${escapeHtml(component.name)}" heading-level="1" overline="${escapeHtml(component.category)}">${status}</nldd-title>
						<nldd-container layout="row" gap="16">
							${component.tag ? `<code class="site-tagname">&lt;${component.tag}&gt;</code>` : ''}
							${source}
						</nldd-container>
					</nldd-container>
					${description}
					${stories}
					${api ? `<nldd-title size="3" text="API" heading-level="2" id="api"></nldd-title>\n${api}` : ''}
				</nldd-container>
			</nldd-sidebar-section>`;
}

function patternsOverview(patterns) {
	return `			<nldd-simple-section>
				<nldd-title slot="header" size="1" text="Patronen" heading-level="1" supporting-text="Een component beschrijft één ding. Een patroon beschrijft hoe je componenten samenstelt tot iets dat een taak afhandelt."></nldd-title>
				<nldd-collection layout="grid" item-width="320px" max-items="999">
					${patterns
						.map((p) => card({ href: `/patronen/${p.slug}/`, title: p.name, text: firstSentence(p.summary) }))
						.join('\n\t\t\t\t\t')}
				</nldd-collection>
			</nldd-simple-section>`;
}

function landing(components, patterns, facts) {
	const snippet = read('site/pages/snippets/install.html').trimEnd();
	const replacements = {
		version: facts.version,
		releaseDate: facts.releaseDate,
		componentCount: components.length,
		patternCount: patterns.length,
		iconCount: facts.iconCount,
		repository: facts.repository,
		installCommand: codeViewer('npm install @nldd/design-system', 'bash'),
		installImports: codeViewer("import '@nldd/design-system/styles';\nimport '@nldd/design-system';", 'javascript'),
		installMarkup: codeViewer(snippet, 'html', { wrap: true }),
		installLive: `<site-stage name="Het resultaat" inline-markup>${snippet}</site-stage>`,
	};
	return read('site/pages/index.html').replace(/\{\{(\w+)\}\}/g, (_, key) => {
		if (!(key in replacements)) throw new Error(`Onbekende plaatshouder {{${key}}} in site/pages/index.html`);
		return replacements[key];
	});
}

/**
 * Where the former Storybook addresses went: `?path=/docs/<id>--docs` and
 * `?path=/story/<id>--<story>` on the root are sent on to the page that
 * replaced them.
 */
function redirects(components, patterns) {
	const map = {
		'docs-introductie': '/',
		'docs-ontwerprichtlijnen': '/richtlijnen/',
		'docs-breakpoints': '/breakpoints/',
		'docs-changelog': '/changelog/',
		'docs-vertalingen': '/vertalingen/',
	};
	for (const c of components) map[storybookId(c.title)] = `/componenten/${c.slug}/`;
	for (const p of patterns) map[storybookId(p.title)] = `/patronen/${p.slug}/`;
	return map;
}

/**
 * @param {{ base: string }} options
 * @returns {{ pages: Record<string, string>, counts: Record<string, number> }}
 *   every page by its output path relative to the site root
 */
export function buildPages({ base = '/' } = {}) {
	const components = collectComponents();
	const patterns = collectPatterns();
	const facts = { ...readFacts(), slugs: components.map((c) => c.slug).join(' ') };
	const pages = {};
	const page = (path, title, description, main, bodyClass) => {
		pages[`${path.slice(1)}index.html`] = withBase(
			layout({ title, description, path, main, facts, bodyClass }),
			base,
		);
	};

	const redirectMap = redirects(components, patterns);
	page(
		'/',
		SITE_NAME,
		'Web components en CSS-tokens voor websites en applicaties van de Rijksoverheid.',
		`${landing(components, patterns, facts)}
			<script type="application/json" id="site-redirects">${JSON.stringify(redirectMap)}</script>`,
		'site--landing',
	);

	const prose = [
		['/aan-de-slag/', 'site/content/aan-de-slag.md', 'Installeer het pakket en zet je eerste component neer.'],
		['/aan-de-slag/ai-assistent/', 'site/content/ai-assistent.md', 'Skills voor Claude Code en Cursor.'],
		['/richtlijnen/', 'src/docs/design-guidelines.md', 'De ontwerpkeuzes van het systeem en de redenen erachter.'],
		['/breakpoints/', 'src/docs/breakpoints.md', 'Bij welke breedtes de layout verandert.'],
		['/vertalingen/', 'src/docs/translations.md', 'Een interface in een andere taal dan Nederlands.'],
		['/changelog/', 'CHANGELOG.md', 'Wat er per versie is veranderd.'],
	];
	for (const [path, file, description] of prose) {
		const rendered = prosePage({ markdown: read(file) });
		page(path, rendered.title || 'Changelog', description, proseSection(rendered.html));
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
			componentPage(component, components, facts),
		);
	}

	page('/patronen/', 'Patronen', 'Hoe je componenten samenstelt.', patternsOverview(patterns));
	for (const pattern of patterns) {
		const rendered = prosePage({ markdown: pattern.prose, storyFile: pattern });
		page(`/patronen/${pattern.slug}/`, pattern.name, firstSentence(pattern.summary), proseSection(rendered.html));
	}

	const icon = components.find((c) => c.tag === 'nldd-icon');
	const gallery = icon?.stories.find((s) => s.exportName === 'Icoongalerij');
	if (!gallery) throw new Error('De story Icoongalerij ontbreekt in icon.stories.ts.');
	page(
		'/iconen/',
		'Iconen',
		`${facts.iconCount} iconen in de huisstijl.`,
		`			<nldd-simple-section>
				<nldd-title slot="header" size="1" text="Iconen" heading-level="1" supporting-text="${facts.iconCount} iconen. Gebruik de naam als waarde van het icon-attribuut, of in een nldd-icon."></nldd-title>
				${stage(icon, gallery, { bare: true })}
			</nldd-simple-section>`,
	);

	// One story on a bare page, without the site around it: what a stage shows in
	// its frame, and what "open in een nieuw tabblad" leads to.
	pages['voorbeeld/index.html'] = withBase(
		`<!doctype html>
<html lang="nl">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Voorbeeld · ${SITE_NAME}</title>
	<meta name="robots" content="noindex">
	<link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg">
	<script type="module" src="/frame.ts"></script>
</head>
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
			stories: [...components, ...patterns].reduce((n, c) => n + c.stories.length, 0),
		},
	};
}
