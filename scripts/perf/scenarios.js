/**
 * What a perf page puts N times on the page. Each scenario returns the markup
 * for N rows; `html` is the baseline without the design system.
 *
 * Three groups:
 * - `list`: the list as in the patterns, against plain HTML.
 * - `single`: every component in the manifest, N times side by side. Catches a
 *   cost per instance, and instances that look each other up.
 * - `children`: every container with N of its children. Catches a parent that
 *   walks all its children once per child.
 * - `full`: components that fill their parent, stacked, against the same
 *   stack at their own width. A window resize then resizes every copy.
 * - `stories`: every story of every component, N times. The real markup, with
 *   every variant the site shows.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repeat = (n, row) => Array.from({ length: n }, (_, i) => row(i)).join('\n');

const listRow = (i) => `<nldd-list-item button>
<nldd-text-cell text="Aanvraag A-${1000 + i}" supporting-text="Dakisolatie, in behandeling"></nldd-text-cell>
<nldd-spacer-cell size="12"></nldd-spacer-cell>
<nldd-icon-cell size="20" color="secondary" icon="chevron-right"></nldd-icon-cell>
</nldd-list-item>`;

const list = {
	html: {
		group: 'list',
		body: (n) => `<ul>${repeat(n, (i) => `<li><button type="button"><strong>Aanvraag A-${1000 + i}</strong><br><span>Dakisolatie, in behandeling</span> ›</button></li>`)}</ul>`,
	},
	'list-text': {
		group: 'list',
		body: (n) => `<nldd-list accessible-label="Aanvragen">${repeat(n, (i) => `<nldd-list-item><nldd-text-cell text="Aanvraag A-${1000 + i}"></nldd-text-cell></nldd-list-item>`)}</nldd-list>`,
	},
	'list-pattern': {
		group: 'list',
		body: (n) => `<nldd-list accessible-label="Aanvragen">${repeat(n, listRow)}</nldd-list>`,
	},
};

/* Attributes a component needs to render something at all. */
const ATTRS = {
	'nldd-button': 'text="Opslaan"',
	'nldd-icon-button': 'icon="pencil" accessible-label="Bewerken"',
	'nldd-icon': 'icon="pencil"',
	'nldd-icon-cell': 'icon="chevron-right"',
	'nldd-badge': 'text="3"',
	'nldd-avatar': 'name="Mijn Dienst"',
	'nldd-checkbox-field': 'label="Akkoord"',
	'nldd-radio-button-field': 'label="Dakisolatie" name="perf" value="x"',
	'nldd-switch-field': 'label="Meldingen"',
	'nldd-text-field': 'label="Naam"',
	'nldd-number-field': 'label="Aantal"',
	'nldd-password-field': 'label="Wachtwoord"',
	'nldd-search-field': 'label="Zoeken"',
	'nldd-date-field': 'label="Datum"',
	'nldd-time-field': 'label="Tijd"',
	'nldd-multi-line-text-field': 'label="Toelichting"',
	'nldd-file-field': 'label="Bijlage"',
	'nldd-combo-box': 'label="Team"',
	'nldd-token-field': 'label="Labels"',
	'nldd-slider': 'label="Volume"',
	'nldd-stepper': 'label="Aantal"',
	'nldd-text-cell': 'text="Aanvraag A-1042" supporting-text="Dakisolatie, in behandeling"',
	'nldd-title-cell': 'text="Aanvraag A-1042"',
	'nldd-link': 'href="#" text="Aanvraag A-1042"',
	'nldd-tag': 'text="Dakisolatie"',
	'nldd-token': 'text="Dakisolatie"',
	'nldd-menu-item': 'text="Bewerken"',
	'nldd-menu-bar-item': 'text="Aanvragen" href="#"',
	'nldd-tab-bar-item': 'text="Aanvragen"',
	'nldd-document-tab-bar-item': 'text="Dossier D-318"',
	'nldd-breadcrumbs-item': 'text="Aanvragen" href="#"',
	'nldd-segmented-control-item': 'text="Lijst" value="x"',
	'nldd-toggle-button': 'text="Vet"',
	'nldd-step-bar-item': 'text="Gegevens"',
	'nldd-accordion-item': 'heading="Aanvraag A-1042"',
	'nldd-validation-item': 'text="Vul een naam in"',
	'nldd-notification': 'text="Opgeslagen"',
	'nldd-progress-bar': 'value="40"',
	'nldd-progress-circle': 'value="40"',
	'nldd-pagination': 'total="20" current="1"',
	'nldd-swatch-picker-item': 'color="#336699" value="x"',
	'nldd-image': 'src="/dist/favicon.svg" alt=""',
};

/* Containers and the child they hold N of. */
const CHILDREN = {
	'nldd-button-bar': 'nldd-button',
	'nldd-button-group': 'nldd-button',
	'nldd-menu': 'nldd-menu-item',
	'nldd-accordion': 'nldd-accordion-item',
	'nldd-avatar-group': 'nldd-avatar',
	'nldd-checkbox-group': 'nldd-checkbox-field',
	'nldd-radio-button-group': 'nldd-radio-button-field',
	'nldd-segmented-control': 'nldd-segmented-control-item',
	'nldd-swatch-picker': 'nldd-swatch-picker-item',
	'nldd-toggle-button-group': 'nldd-toggle-button',
	'nldd-collection': 'nldd-card',
	'nldd-kanban-column': 'nldd-card',
	'nldd-table': 'nldd-table-row',
	'nldd-breadcrumbs': 'nldd-breadcrumbs-item',
	'nldd-document-tab-bar': 'nldd-document-tab-bar-item',
	'nldd-link-group': 'nldd-link',
	'nldd-menu-bar': 'nldd-menu-bar-item',
	'nldd-tab-bar': 'nldd-tab-bar-item',
	'nldd-step-bar': 'nldd-step-bar-item',
	'nldd-progress-bar': 'nldd-progress-bar-segment-indicator',
	'nldd-validation-list': 'nldd-validation-item',
	'nldd-page-footer-legal-bar': 'nldd-page-footer-legal-bar-item',
	'nldd-form': 'nldd-text-field',
	'nldd-form-section': 'nldd-text-field',
	'nldd-box': 'nldd-text',
	'nldd-container': 'nldd-text',
	'nldd-page': 'nldd-text',
	'nldd-simple-section': 'nldd-text',
	'nldd-card': 'nldd-text',
	'nldd-rich-text': 'p',
	'nldd-toolbar': 'nldd-icon-button',
};

/* Children with what goes inside them. */
const CHILD_CONTENT = {
	'nldd-table-row': '<nldd-cell>Aanvraag A-1042</nldd-cell><nldd-cell>Dakisolatie</nldd-cell>',
	'nldd-card': '<nldd-text>Aanvraag A-1042</nldd-text>',
	p: 'Aanvraag A-1042, Dakisolatie, in behandeling.',
	'nldd-text': 'Aanvraag A-1042, Dakisolatie, in behandeling.',
};

/* Components that only exist once per page, or only as a part of another. */
const SKIP_SINGLE = new Set(['nldd-shell', 'nldd-window']);

const element = (tag, i) => {
	const attrs = ATTRS[tag] ? ` ${ATTRS[tag].replace('Aanvraag A-1042', `Aanvraag A-${1000 + i}`)}` : '';
	const content = CHILD_CONTENT[tag] ?? (ATTRS[tag] ? '' : 'Aanvraag A-1042');
	return `<${tag}${attrs}>${content}</${tag}>`;
};

const manifest = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../custom-elements.json'), 'utf8'));
const tags = manifest.modules
	.flatMap((mod) => mod.declarations ?? [])
	.map((declaration) => declaration.tagName)
	.filter(Boolean)
	.sort();

const single = Object.fromEntries(tags
	.filter((tag) => !SKIP_SINGLE.has(tag))
	.map((tag) => [tag.replace('nldd-', ''), {
		group: 'single',
		body: (n) => `<div>${repeat(n, (i) => element(tag, i))}</div>`,
	}]));

const children = Object.fromEntries(Object.entries(CHILDREN).map(([parent, child]) => [
	`${parent.replace('nldd-', '')}>${child.replace('nldd-', '')}`,
	{
		group: 'children',
		body: (n) => `<${parent}${ATTRS[parent] ? ` ${ATTRS[parent]}` : ''}>${repeat(n, (i) => element(child, i))}</${parent}>`,
	},
]));

/*
 * Components that fill their parent only when asked (`width="full"`), that
 * scale in both directions with it (an image, an icon or an avatar without a
 * size), that fit what they show to their width (an avatar group with a high
 * `max`, a step bar, a swatch picker), or that wrap their text (a long tag,
 * token, title or term). Most components already fill their parent as a
 * block, and the stories group resizes those. Each copy sits in a block of its
 * own, so the copies stack and a window resize changes the width of every one
 * of them. `<tag>/vast` is the same stack at the component's own width, or in
 * a parent of a fixed width, to compare against.
 */
const text = '<nldd-text><p>Aanvraag A-1042, Dakisolatie, in behandeling.</p></nldd-text>';
const long = 'Aanvraag A-1042 voor dakisolatie is in behandeling bij team Uitvoering van Mijn Dienst';
const inRow = (cell) => `<nldd-list accessible-label="Aanvragen"><nldd-list-item>${cell}<nldd-icon-cell icon="chevron-right"></nldd-icon-cell></nldd-list-item></nldd-list>`;
const inParent = (copy) => ({ full: '', fixed: ' style="width: 320px"', copy: (w) => `<div${w}>${copy()}</div>` });
const SWATCHES = ['bruin', 'donkerblauw', 'donkerbruin', 'donkergeel', 'donkergroen', 'geel', 'groen', 'hemelblauw', 'lichtblauw', 'lintblauw', 'mintgroen'];
const WIDTH_FULL = { full: ' width="full"', fixed: '' };
const FILLS = {
	'nldd-button': { ...WIDTH_FULL, copy: (w) => `<nldd-button text="Opslaan"${w}></nldd-button>` },
	'nldd-icon-button': { ...WIDTH_FULL, copy: (w) => `<nldd-icon-button icon="pencil" accessible-label="Bewerken"${w}></nldd-icon-button>` },
	'nldd-split-button': { ...WIDTH_FULL, copy: (w) => `<nldd-split-button text="Opslaan"${w}><nldd-menu slot="popup"><nldd-menu-item text="Bewerken"></nldd-menu-item></nldd-menu></nldd-split-button>` },
	'nldd-button-group': { ...WIDTH_FULL, copy: (w) => `<nldd-button-group${w}><nldd-button text="Opslaan"></nldd-button><nldd-button text="Annuleer"></nldd-button></nldd-button-group>` },
	'nldd-number-field': { ...WIDTH_FULL, copy: (w) => `<nldd-number-field accessible-label="Aantal"${w}></nldd-number-field>` },
	'nldd-segmented-control': { ...WIDTH_FULL, copy: (w) => `<nldd-segmented-control accessible-label="Weergave"${w}><nldd-segmented-control-item text="Lijst" value="a"></nldd-segmented-control-item><nldd-segmented-control-item text="Kaart" value="b"></nldd-segmented-control-item></nldd-segmented-control>` },
	'nldd-date-field': { ...WIDTH_FULL, copy: (w) => `<nldd-date-field accessible-label="Datum"${w}></nldd-date-field>` },
	'nldd-time-field': { ...WIDTH_FULL, copy: (w) => `<nldd-time-field accessible-label="Tijd"${w}></nldd-time-field>` },
	'nldd-date-picker': { ...WIDTH_FULL, copy: (w) => `<nldd-date-picker${w}></nldd-date-picker>` },
	'nldd-time-picker': { ...WIDTH_FULL, copy: (w) => `<nldd-time-picker${w}></nldd-time-picker>` },
	'nldd-page-footer': { ...WIDTH_FULL, copy: (w) => `<nldd-page-footer${w}>${text}</nldd-page-footer>` },
	'nldd-top-navigation-bar': { ...WIDTH_FULL, copy: (w) => `<nldd-top-navigation-bar${w}><nldd-menu-bar-item text="Aanvragen" href="#"></nldd-menu-bar-item></nldd-top-navigation-bar>` },
	'nldd-hero': { ...WIDTH_FULL, copy: (w) => `<nldd-hero${w}>${text}</nldd-hero>` },
	'nldd-simple-section': { ...WIDTH_FULL, copy: (w) => `<nldd-simple-section${w}>${text}</nldd-simple-section>` },
	'nldd-full-bleed-section': { ...WIDTH_FULL, copy: (w) => `<nldd-full-bleed-section${w}>${text}</nldd-full-bleed-section>` },
	'nldd-one-half-one-half-section': { ...WIDTH_FULL, copy: (w) => `<nldd-one-half-one-half-section${w}><div slot="left">${text}</div><div slot="right">${text}</div></nldd-one-half-one-half-section>` },
	'nldd-sidebar-section': { ...WIDTH_FULL, copy: (w) => `<nldd-sidebar-section${w}>${text}</nldd-sidebar-section>` },
	'nldd-cell': { ...WIDTH_FULL, copy: (w) => inRow(`<nldd-cell${w}>Aanvraag A-1042</nldd-cell>`) },
	'nldd-list-item-segment': { ...WIDTH_FULL, copy: (w) => inRow(`<nldd-list-item-segment${w}><nldd-text-cell text="Aanvraag A-1042"></nldd-text-cell></nldd-list-item-segment>`) },
	'nldd-toolbar-item': { full: ' width="40%"', fixed: '', copy: (w) => `<nldd-toolbar accessible-label="Acties"><nldd-toolbar-title slot="start" text="Aanvraag A-1042"></nldd-toolbar-title><nldd-toolbar-item slot="end"${w}><nldd-search-field accessible-label="Zoeken"></nldd-search-field></nldd-toolbar-item></nldd-toolbar>` },
	'nldd-toolbar-title': { full: ' width="60%"', fixed: '', copy: (w) => `<nldd-toolbar accessible-label="Acties"><nldd-toolbar-title slot="start" text="Aanvraag A-1042"${w}></nldd-toolbar-title><nldd-toolbar-item slot="end"><nldd-icon-button icon="pencil" accessible-label="Bewerken"></nldd-icon-button></nldd-toolbar-item></nldd-toolbar>` },
	'nldd-avatar-group': inParent(() => `<nldd-avatar-group max="50" accessible-label="Redactie">${Array.from({ length: 60 }, (_, i) => `<nldd-avatar name="Team ${i}"></nldd-avatar>`).join('')}</nldd-avatar-group>`),
	'nldd-tag': inParent(() => `<nldd-tag text="${long}"></nldd-tag>`),
	'nldd-token': inParent(() => `<nldd-token text="${long}"></nldd-token>`),
	'nldd-title': inParent(() => `<nldd-title heading-level="2" text="${long}" supporting-text="${long}"></nldd-title>`),
	'nldd-term': inParent(() => `<nldd-text><p>${long} <nldd-term definition="${long}">dakisolatie</nldd-term> ${long}</p></nldd-text>`),
	'nldd-one-time-code-field': inParent(() => '<nldd-one-time-code-field length="24" accessible-label="Code"></nldd-one-time-code-field>'),
	'nldd-swatch-picker': inParent(() => `<nldd-swatch-picker accessible-label="Kleur">${Array.from({ length: 60 }, (_, i) => `<nldd-swatch-picker-item color="${SWATCHES[i % SWATCHES.length]}" text="Kleur ${i}" value="${i}"></nldd-swatch-picker-item>`).join('')}</nldd-swatch-picker>`),
	'nldd-step-bar': inParent(() => `<nldd-step-bar accessible-label="Stappen">${['Gegevens', 'Woning', 'Maatregel', 'Kosten', 'Bijlagen', 'Controle', 'Indienen'].map((step, i) => `<nldd-step-bar-item text="${step}" status="${i < 2 ? 'past' : i === 2 ? 'current' : 'future'}"></nldd-step-bar-item>`).join('')}</nldd-step-bar>`),
	'nldd-image': { full: '', fixed: ' width="240"', copy: (w) => `<nldd-image src="/dist/favicon.svg" alt="" aspect-ratio="16/9"${w}></nldd-image>` },
	'nldd-avatar': { full: '', fixed: ' size="40"', copy: (w) => `<nldd-avatar name="Mijn Dienst"${w}></nldd-avatar>` },
	'nldd-icon': { full: '', fixed: ' size="24"', copy: (w) => `<nldd-icon icon="pencil"${w}></nldd-icon>` },
};
const full = Object.fromEntries(Object.entries(FILLS).flatMap(([tag, { full: wide, fixed, copy }]) => {
	const name = `full/${tag.replace('nldd-', '')}`;
	return [
		[name, { group: 'full', body: (n) => repeat(n, () => `<div>${copy(wide)}</div>`) }],
		[`${name}/vast`, { group: 'full', body: (n) => repeat(n, () => `<div>${copy(fixed)}</div>`) }],
	];
}));

const storiesFile = resolve(import.meta.dirname, 'out/stories.json');
const stories = existsSync(storiesFile)
	? Object.fromEntries(JSON.parse(readFileSync(storiesFile, 'utf8')).map((story) => [
		`${story.component}/${story.name}`,
		{ group: 'stories', component: story.component, body: (n) => repeat(n, () => story.markup) },
	]))
	: {};

export const scenarios = { ...list, ...single, ...children, ...full, ...stories };
