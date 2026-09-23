import { html, nothing } from 'lit';
import './collection.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';
import '../../content/rich-text/rich-text.js';
import '../../content/title/title.js';
import '../card/card.js';
import '../container/container.js';
import '../spacer/spacer.js';
import '../page/page.js';
import '../page-sections/simple-section/simple-section.js';

/**
 * Gebruik een collection om een verzameling items weer te geven in een grid-,
 * lijst- of horizontale scrolllay-out. De koptekst is optioneel. Bij horizontale
 * scroll verschijnen navigatieknoppen (en een fade aan de randen) zodra de items
 * niet meer in de container passen; bij grid en lijst een optionele laad-meer-knop.
 *
 * ## Gebruik
 * ```html
 * <nldd-collection layout="grid">
 *   <nldd-card>...</nldd-card>
 * </nldd-collection>
 * ```
 */
/* One shape for the four gap controls, so a step added to the scale is added
   once. Mirrors sizeControl in the container stories. */
const GAP_STEPS = ['0', '4', '8', '12', '16', '24', '32', '48'];

const gapControl = (description: string) => ({
	control: 'select' as const,
	options: ['(auto)', ...GAP_STEPS],
	mapping: { '(auto)': '' },
	description,
	table: { defaultValue: { summary: '(auto)' } },
});

export default {
	title: 'Components/Layout/Collection',
	component: 'nldd-collection',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/collection/collection.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		layout: 'grid',
		itemWidth: '',
		gap: '',
		smGap: '',
		mdGap: '',
		lgGap: '',
		maxItems: 6,
		showLoadMore: false,
		lazyLoad: false,
	},
	argTypes: {
		layout: {
			control: { type: 'select' },
			options: ['grid', 'stack', 'lanes', 'horizontal-scroll'],
			description: 'Lay-outmodus',
			table: { defaultValue: { summary: 'grid' } },
		},
		itemWidth: {
			name: 'item-width',
			control: 'text',
			description: 'Gewenste breedte per item (bv. "280px", "20rem"). Bij grid wordt deze breedte geclamped op de container-breedte om horizontale overflow te voorkomen.',
			table: { defaultValue: { summary: '280px' } },
		},
		gap: gapControl('Ruimte tussen items, als stap op de spacing-schaal'),
		smGap: { name: 'sm-gap', ...gapControl('Ruimte tussen items bij sm') },
		mdGap: { name: 'md-gap', ...gapControl('Ruimte tussen items bij md') },
		lgGap: { name: 'lg-gap', ...gapControl('Ruimte tussen items bij lg') },
		maxItems: {
			name: 'max-items',
			control: { type: 'number' },
			description: 'Aantal items per pagina',
			table: { defaultValue: { summary: '24' } },
		},
		showLoadMore: {
			name: 'show-load-more',
			control: 'boolean',
			description: 'Toon laad-meer-knop (alleen bij grid, lanes en stack)',
			table: { defaultValue: { summary: 'false' } },
		},
		lazyLoad: {
			name: 'lazy-load',
			control: 'boolean',
			description: 'Laad automatisch meer wanneer de knop zichtbaar wordt',
			table: { defaultValue: { summary: 'false' } },
		},
	},
};

/* Descriptions of four lengths, because cards of one height make lanes look
   exactly like the grid it falls back to. Handing them out in order would put
   the same length in the same column on every row, and lanes would pack that
   into a staircase, so the order below is a fixed shuffle. */
const descriptions = [
	'Een korte omschrijving.',
	'Een omschrijving die wat langer is, zodat deze kaart hoger wordt dan de vorige.',
	'Een omschrijving die wat langer is, zodat deze kaart hoger wordt dan de vorige. Er staat een zin bij die er nog een regel of drie aan toevoegt.',
	'Een omschrijving die wat langer is, zodat deze kaart hoger wordt dan de vorige. Er staat een zin bij die er nog een regel of drie aan toevoegt. En een derde, zodat er ook een kaart tussen staat die er echt bovenuit steekt.',
];

const descriptionOrder = [0, 2, 3, 1, 2, 0, 1, 3, 3, 1, 0, 2];

const itemContent = (i: any) => html`
	<nldd-title
		size="4"
		text="Item ${i + 1}"
		heading-level="3"
	></nldd-title>
	<nldd-spacer size="4"></nldd-spacer>
	<nldd-rich-text spacing="flat">
		<p>${descriptions[descriptionOrder[i % descriptionOrder.length]]}</p>
	</nldd-rich-text>
	<nldd-spacer size="16"></nldd-spacer>
	<nldd-button-group orientation="horizontal">
		<nldd-button variant="primary" text="Bekijk"></nldd-button>
		<nldd-button variant="secondary" text="Meer info"></nldd-button>
	</nldd-button-group>
`;

const gradientPairs: [string, string][] = [
	['1b5fa8', '00a3a3'],
	['4338ca', '2563eb'],
	['0d9488', '16a34a'],
	['ea580c', 'dc2626'],
	['7c3aed', 'db2777'],
	['0891b2', '4f46e5'],
];

const gradientImage = (i: number, height = 200) => {
	const [from, to] = gradientPairs[i % gradientPairs.length];
	const src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='${height}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23${from}'/><stop offset='1' stop-color='%23${to}'/></linearGradient></defs><rect width='480' height='${height}' fill='url(%23g)'/></svg>`;
	return html`
		<img
			slot="header"
			src=${src}
			alt=""
			style="display: block; width: 100%; height: auto;"
		>
	`;
};

const gridItems = Array.from({ length: 12 }, (_, i) => html`
	<nldd-card>
		${gradientImage(i)}
		<nldd-container padding="16">${itemContent(i)}</nldd-container>
	</nldd-card>
`);

/* Lanes only shows itself on items that differ in height, so these images run
   from short to tall rather than all being the same 480x200. */
const laneItems = Array.from({ length: 12 }, (_, i) => html`
	<nldd-card>
		${gradientImage(i, 120 + ((i * 70) % 260))}
		<nldd-container padding="16">${itemContent(i)}</nldd-container>
	</nldd-card>
`);

const listItems = Array.from({ length: 12 }, (_, i) => html`
	<nldd-card>
		<nldd-container padding="16">${itemContent(i)}</nldd-container>
	</nldd-card>
`);

const scrollItems = Array.from({ length: 12 }, (_, i) => html`
	<nldd-card>
		${gradientImage(i)}
		<nldd-container padding="16">${itemContent(i)}</nldd-container>
	</nldd-card>
`);

export const Standaard = ({ layout, itemWidth, gap, smGap, mdGap, lgGap, maxItems, showLoadMore, lazyLoad }: Record<string, any>) => html`
	<nldd-collection
		layout=${layout}
		item-width=${itemWidth || nothing}
		gap=${gap || nothing}
		sm-gap=${smGap || nothing}
		md-gap=${mdGap || nothing}
		lg-gap=${lgGap || nothing}
		max-items=${maxItems}
		?show-load-more=${showLoadMore}
		?lazy-load=${lazyLoad}
	>
		${listItems}
	</nldd-collection>
`;

export const Grid = {
	render: () => html`
	<nldd-collection layout="grid" show-load-more max-items="6">
		${gridItems}
	</nldd-collection>
`,
	parameters: { controls: { disable: true } },
};

export const GridMetLazyLoad = {
	name: 'Grid met lazy-load',
	render: () => html`
	<nldd-collection layout="grid" show-load-more max-items="6" lazy-load>
		${gridItems}
	</nldd-collection>
`,
	parameters: { controls: { disable: true } },
};

export const Stapel = {
	render: () => html`
	<nldd-collection layout="stack" show-load-more max-items="6">
		${listItems}
	</nldd-collection>
`,
	parameters: { controls: { disable: true } },
};

export const Banen = {
	render: () => html`
	<nldd-collection layout="lanes" show-load-more max-items="6">
		${laneItems}
	</nldd-collection>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story:
					'Kaarten van ongelijke hoogte, in kolommen gepakt. Kent de browser `grid-lanes`, dan sluiten ze op elkaar aan. Zo niet, dan valt het terug op het raster hierboven en worden de kaarten per rij weer even hoog. Die terugval is bewust geen multicol, want die vult kolom voor kolom en verdeelt de hele set opnieuw zodra laad-meer erbij zet. Vandaag kent alleen Safari 26.4 en nieuwer `grid-lanes`, in Chrome en Firefox zit het achter een vlag.',
			},
		},
	},
};

export const HorizontaalScrollend = {
	render: () => html`
	<nldd-collection layout="horizontal-scroll">
		${scrollItems}
	</nldd-collection>
`,
	parameters: { controls: { disable: true } },
};

/**
 * Passen alle items samen binnen de container, dan is er niets te scrollen:
 * geen navigatieknoppen en geen fade. De items vullen de volle breedte.
 */
export const HorizontaalPassend = {
	render: () => html`
	<nldd-collection layout="horizontal-scroll">
		${scrollItems.slice(0, 2)}
	</nldd-collection>
`,
	parameters: { controls: { disable: true } },
};



export const InSimpleSectie = {
	render: () => html`
	<nldd-page background="tinted">
		<nldd-simple-section>
			<nldd-title
				slot="header"
				size="2"
				text="Sectietitel"
				heading-level="2"
			></nldd-title>
			<nldd-spacer slot="header" size="4"></nldd-spacer>
			<nldd-rich-text slot="header" spacing="flat">
				<p>Tekst boven de collectie om de uitlijning te zien.</p>
			</nldd-rich-text>
			<nldd-collection layout="horizontal-scroll">
				${scrollItems}
			</nldd-collection>
		</nldd-simple-section>
	</nldd-page>
`,
	parameters: { controls: { disable: true } },
};
