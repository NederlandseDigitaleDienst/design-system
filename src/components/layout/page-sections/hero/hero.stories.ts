import { html, nothing } from 'lit';
import './hero.js';
import '../../../content/title/title.js';
import '../../../content/rich-text/rich-text.js';
import '../../../actions/button/button.js';
import '../../../actions/button-group/button-group.js';
import '../../spacer/spacer.js';

const MEDIA = 'sample-images/butterfly-1200.jpg';

/**
 * Een paginakop met een mediavlak en een tekstpaneel op zes mogelijke
 * posities. Alle vlakken zijn rechthoekig.
 *
 * Beslaat het paneel een volledige rand (`left`/`right`, `main-width="full"`
 * of de gestapelde mobiele weergave), dan staat de media als losse strook
 * ernaast. Op mobiel stapelt de media altijd boven het paneel. Zonder media
 * vult de main het volledige vlak. `main-background` is standaard `accent`;
 * met `base` krijgt het vlak zonder media een rand zodat de vorm zichtbaar
 * blijft op de base-surface. Zet binnenin `color="inherit"` op title en
 * rich-text voor gegarandeerd contrast op de filled-kleuren.
 */
export default {
	title: 'Components/Layout/Page Sections/Hero',
	component: 'nldd-hero',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/page-sections/hero/hero.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
	},
	args: {
		height: '',
		mainBackground: 'accent',
		mainWidth: '1/2',
		mainPosition: 'bottom-left',
		mediaAspectRatio: '',
		mediaSrc: MEDIA,
		mediaSrcset: '',
		mediaSizes: '',
		mediaAlt: '',
	},
	argTypes: {
		height: {
			control: 'text',
			description: 'Minimale hoogte van de sectie, elke CSS-lengte (bijv. 600px of 100dvh); de hero groeit verder met de content',
		},
		mainBackground: {
			name: 'main-background',
			control: 'select',
			options: ['base', 'accent', 'lintblauw', 'donkerblauw', 'hemelblauw', 'lichtblauw', 'paars', 'violet', 'robijnrood', 'roze', 'rood', 'oranje', 'donkergeel', 'geel', 'donkerbruin', 'bruin', 'donkergroen', 'groen', 'mosgroen', 'mintgroen'],
			description: 'Vlakkleur van het paneel: base of een filled-category',
			table: { defaultValue: { summary: 'accent' } },
		},
		mainWidth: {
			name: 'main-width',
			control: 'select',
			options: ['1/2', '2/3', '3/4', 'full'],
			description: 'Breedte van het paneel; full maakt een volle strook (genegeerd bij left/right)',
			table: { defaultValue: { summary: '1/2' } },
		},
		mainPosition: {
			name: 'main-position',
			control: 'select',
			options: ['bottom-left', 'bottom-right', 'top-left', 'top-right', 'left', 'right'],
			description: 'Positie van het tekstpaneel',
			table: { defaultValue: { summary: 'bottom-left' } },
		},
		mediaAspectRatio: {
			name: 'media-aspect-ratio',
			control: 'select',
			options: ['21/9', '16/9', '3/2'],
			mapping: { '21/9': '' },
			description: 'Aspect ratio van het mediavlak; bepaalt op md/lg de hoogte van de hero',
			table: { defaultValue: { summary: '21/9' } },
		},
		mediaSrc: {
			name: 'media-src',
			control: 'text',
			description: 'Bron van het mediavlak (alternatief voor de media-slot)',
		},
		mediaSrcset: {
			name: 'media-srcset',
			control: 'text',
			description: 'Responsive source set voor media-src',
		},
		mediaSizes: {
			name: 'media-sizes',
			control: 'text',
			description: 'Source sizes-hint voor media-src',
		},
		mediaAlt: {
			name: 'media-alt',
			control: 'text',
			description: 'Alt-tekst voor media-src; leeg = decoratief',
		},
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-hero
		height=${args.height || nothing}
		main-background=${args.mainBackground}
		main-width=${args.mainWidth}
		main-position=${args.mainPosition}
		media-aspect-ratio=${args.mediaAspectRatio || nothing}
		media-src=${args.mediaSrc || nothing}
		media-srcset=${args.mediaSrcset || nothing}
		media-sizes=${args.mediaSizes || nothing}
		media-alt=${args.mediaAlt || nothing}
	>
		<nldd-title
			color="inherit"
			size="2"
			text="Regels die voor je werken"
			heading-level="1"
		></nldd-title>
		<nldd-spacer size="8"></nldd-spacer>
		<nldd-rich-text color="inherit">
			<p>De Nederlandse Digitale Dienst maakt regels begrijpelijk en uitvoerbaar.</p>
		</nldd-rich-text>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-button-group orientation="horizontal">
			<nldd-button
				variant="inherit-filled"
				text="Bekijk de regels"
			></nldd-button>
			<nldd-button
				variant="inherit-tinted"
				text="Meer informatie"
			></nldd-button>
		</nldd-button-group>
	</nldd-hero>
`;

export const Standaard = {
	render: Template,
};

export const AllePosities = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 24px;">
			${['bottom-left', 'bottom-right', 'top-left', 'top-right', 'left', 'right'].map((position) => html`
				<nldd-hero
					main-position=${position}
					main-background="donkerblauw"
				>
					<img
						slot="media"
						src=${MEDIA}
						alt=""
					>
					<nldd-title
						color="inherit"
						size="4"
						text='main-position="${position}"'
						heading-level="2"
					></nldd-title>
				</nldd-hero>
			`)}
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * `main-width="full"` maakt een volle boven- of onderstrook; het mediavlak
 * staat dan als losse strook boven of onder het paneel in plaats van erachter.
 */
export const VolleStrook = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 24px;">
			<nldd-hero
				main-position="bottom-left"
				main-width="full"
				main-background="lintblauw"
			>
				<img
					slot="media"
					src=${MEDIA}
					alt=""
				>
				<nldd-title
					color="inherit"
					size="3"
					text="Volle onderstrook"
					supporting-text='main-position="bottom-left" — het mediavlak staat erboven'
					heading-level="1"
				></nldd-title>
			</nldd-hero>
			<nldd-hero
				main-position="top-left"
				main-width="full"
				main-background="lintblauw"
			>
				<img
					slot="media"
					src=${MEDIA}
					alt=""
				>
				<nldd-title
					color="inherit"
					size="3"
					text="Volle bovenstrook"
					supporting-text='main-position="top-left" — het mediavlak staat eronder'
					heading-level="1"
				></nldd-title>
			</nldd-hero>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Zonder media vult de main het volledige vlak. Met `main-background="base"`
 * krijgt dat vlak een rand, anders zou de rechthoek onzichtbaar zijn op de
 * base-surface.
 */
export const ZonderMedia = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 24px;">
			<nldd-hero main-background="hemelblauw">
				<nldd-title
					color="inherit"
					size="2"
					text="Kleurvlak zonder fotografie"
					supporting-text="De main beslaat de volledige hero"
					heading-level="1"
				></nldd-title>
			</nldd-hero>
			<nldd-hero main-background="base">
				<nldd-title
					size="2"
					text="Base zonder media"
					supporting-text="Rand zodat de vorm zichtbaar blijft"
					heading-level="1"
				></nldd-title>
			</nldd-hero>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Rijkere invulling: rich-text met `color="inherit"` en een knop in het
 * paneel, op een middenton-vlakkleur met pure zwarte contentkleur.
 */
export const MetRichText = {
	render: () => html`
		<nldd-hero
			main-position="left"
			main-background="oranje"
		>
			<img
				slot="media"
				src=${MEDIA}
				alt=""
			>
			<nldd-title
				color="inherit"
				size="3"
				text="Volle hoogte links"
				heading-level="1"
			></nldd-title>
			<nldd-spacer size="8"></nldd-spacer>
			<nldd-rich-text color="inherit">
				<p>Het paneel beslaat de volle hoogte; het mediavlak staat ernaast. Ook <a href="#">links</a> erven de contentkleur.</p>
			</nldd-rich-text>
		</nldd-hero>
	`,
	parameters: { controls: { disable: true } },
};
