import { html, nothing } from 'lit';
import './hero.js';
import '../../../content/title/title.js';
import '../../../content/rich-text/rich-text.js';
import '../../../actions/button/button.js';
import '../../../actions/button-group/button-group.js';
import '../../spacer/spacer.js';

const MEDIA = 'sample-images/butterfly-1200.jpg';

/**
 * Een paginakop met een afbeelding en een tekstpaneel erop, op acht mogelijke
 * posities. De afbeelding is sfeer en nooit de hoofdzaak, dus het paneel staat
 * er altijd op: op een sectie-gap van de randen, of met `main-width="full"` als
 * strook over de hele afbeelding. Het paneel is zo breed als de inhoud nodig
 * heeft, tussen 480 en 720px. Met `layout="overhang"` begint het op een vaste
 * plek in de afbeelding en loopt het eronder door. Op mobiel staat de
 * afbeelding bovenaan en het paneel eronder, ingesprongen en een stukje over
 * de afbeelding. Zonder media vult de main het volledige vlak.
 * `main-background` is standaard `accent`; met `base` krijgt het vlak zonder
 * media een rand zodat de vorm zichtbaar blijft op de base-surface. Zet
 * binnenin `color="inherit"` op title en rich-text voor gegarandeerd contrast
 * op de filled-kleuren.
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
		layout: 'contained',
		mainBackground: 'accent',
		mainWidth: 'auto',
		mainPosition: 'bottom-left',
		overhangSize: '',
		mediaAspectRatio: '',
		mediaHeight: '',
		mediaSrc: MEDIA,
		mediaSrcset: '',
		mediaSizes: '',
		mediaAlt: '',
	},
	argTypes: {
		layout: {
			control: 'select',
			options: ['contained', 'overhang'],
			description: 'Hoe het vlak zich tot de afbeelding verhoudt: contained houdt het op de afbeelding, overhang laat het overhang-size over de onderrand vallen en eronder doorlopen',
			table: { defaultValue: { summary: 'contained' } },
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
			options: ['auto', 'full'],
			description: 'Breedte van het paneel: auto volgt de inhoud tussen 480 en 720px, full maakt een strook over de hele afbeelding (genegeerd bij left/right)',
			table: { defaultValue: { summary: 'auto' } },
		},
		mainPosition: {
			name: 'main-position',
			control: 'select',
			options: ['bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right', 'left', 'right'],
			description: 'Positie van het tekstpaneel',
			table: { defaultValue: { summary: 'bottom-left' } },
		},
		overhangSize: {
			name: 'overhang-size',
			control: 'text',
			description: 'Alleen bij layout="overhang": hoe ver het vlak over de onderrand van de afbeelding valt, elke CSS-lengte',
			table: { defaultValue: { summary: '160px' } },
		},
		mediaAspectRatio: {
			name: 'media-aspect-ratio',
			control: 'select',
			options: ['21/9', '16/9', '3/2'],
			mapping: { '21/9': '' },
			description: 'Aspect ratio van het mediavlak; bepaalt op md/lg de hoogte van de hero',
			table: { defaultValue: { summary: '21/9' } },
		},
		mediaHeight: {
			name: 'media-height',
			control: 'text',
			description: 'Vaste hoogte van het mediavlak, elke CSS-lengte (bijv. 320px of 40vh); wint van media-aspect-ratio',
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
		layout=${args.layout === 'contained' ? nothing : args.layout}
		main-background=${args.mainBackground}
		main-width=${args.mainWidth === 'auto' ? nothing : args.mainWidth}
		main-position=${args.mainPosition}
		overhang-size=${args.overhangSize || nothing}
		media-aspect-ratio=${args.mediaAspectRatio || nothing}
		media-height=${args.mediaHeight || nothing}
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
				appearance="inherit-filled"
				text="Bekijk de regels"
			></nldd-button>
			<nldd-button
				appearance="inherit-tinted"
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
			${['bottom-left', 'bottom-center', 'bottom-right', 'top-left', 'top-center', 'top-right', 'left', 'right'].map((position) => html`
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
 * Met `layout="overhang"` valt het vlak `overhang-size` over de onderrand van
 * de afbeelding en loopt het eronder door, zo ver als de tekst nodig heeft. De
 * afbeelding houdt haar hoogte, hoeveel tekst er ook staat, en de overlap is
 * altijd even groot, ook bij een andere hoogte of verhouding. Een vlak dat
 * korter is dan `overhang-size` valt in de afbeelding; dat is aan de consument.
 * Hieronder weinig, gemiddeld en veel tekst onder elkaar; verschuif
 * `overhang-size` om te zien waar het omslaat.
 */
export const Overhang = {
	args: { overhangSize: '', mainPosition: 'bottom-left', mainWidth: 'auto' },
	render: (args: Record<string, any>) => html`
		<div style="display: flex; flex-direction: column; gap: 48px;">
			${[
				['Weinig tekst', null],
				['Gemiddeld', html`<nldd-rich-text color="inherit"><p>De Nederlandse Digitale Dienst maakt regels begrijpelijk en uitvoerbaar, voor wie ze maakt en voor wie ermee werkt.</p></nldd-rich-text>`],
				['Veel tekst', html`<nldd-rich-text color="inherit"><p>De Nederlandse Digitale Dienst maakt regels begrijpelijk en uitvoerbaar, voor wie ze maakt en voor wie ermee werkt.</p><p>Elke regel krijgt een vorm die mensen en systemen allebei kunnen lezen, zodat de uitvoering volgt wat er bedoeld is. Wie wil weten waarom een besluit zo uitvalt, kan het nalezen.</p></nldd-rich-text><nldd-spacer size="16"></nldd-spacer><nldd-button appearance="inherit-filled" text="Bekijk de regels"></nldd-button>`],
			].map(([title, body]) => html`
				<nldd-hero
					layout="overhang"
					main-background="donkerblauw"
					main-position=${args.mainPosition}
					main-width=${args.mainWidth === 'auto' ? nothing : args.mainWidth}
					overhang-size=${args.overhangSize || nothing}
				>
					<img
						slot="media"
						src=${MEDIA}
						alt=""
					>
					<nldd-title
						color="inherit"
						size="2"
						text=${title}
						heading-level="2"
					></nldd-title>
					${body ? html`<nldd-spacer size="16"></nldd-spacer>${body}` : nothing}
				</nldd-hero>
			`)}
		</div>
	`,
	argTypes: {
		overhangSize: {
			name: 'overhang-size',
			control: 'text',
			description: 'Hoe ver het vlak over de onderrand van de afbeelding valt, elke CSS-lengte',
			table: { defaultValue: { summary: '160px' } },
		},
	},
};

/**
 * `main-width="full"` maakt een strook over de hele breedte van de afbeelding,
 * onder- of bovenaan, op een sectie-gap van de randen. De afbeelding blijft
 * erachter: in een hero is die sfeer en nooit de hoofdzaak.
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
					supporting-text='main-position="bottom-left"'
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
					supporting-text='main-position="top-left"'
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
