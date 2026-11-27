import { html, nothing } from 'lit';
import './image.js';
import './lqip-encoder-element.js';
import '../../layout/container/container.js';
import { sampleImage } from '../../../sample-images.js';

const SAMPLE_SRC = sampleImage('butterfly-1200.jpg');
const SAMPLE_ALT = 'Klein koolwitje op een vlinderstruik';

const SAMPLE_SRCSET = [480, 960, 1600].map((width) => `${sampleImage(`butterfly-${width}.jpg`)} ${width}w`).join(', ');

/** LQIP CSV string berekend uit de bron (zeven 0-255 Oklab bytes). Regenereer
 *  via de story LQIP-encoder als je de afbeelding vervangt. */
const SAMPLE_LQIP = '28,28,164,164,106,170,99';

/**
 * `nldd-image` toont een afbeelding met de afronding, de achtergrond en het
 * onderschrift van het designsysteem. Gebruik het voor een foto of illustratie
 * in een pagina. Met `aspect-ratio` houdt het de ruimte vrij, zodat de pagina
 * niet verspringt terwijl de afbeelding laadt.
 */
export default {
	title: 'Components/Content/Image',
	component: 'nldd-image',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/image/image.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
	},
	args: {
		shape: 'square',
		width: 'full',
		src: SAMPLE_SRC,
		srcset: '',
		sizes: '',
		alt: SAMPLE_ALT,
		aspectRatio: '16/9',
		objectFit: 'cover',
		objectPosition: 'center',
		lqip: '',
		fetchPriority: '(auto)',
		caption: '',
		credit: '',
		decorative: false,
		loading: 'lazy',
	},
	argTypes: {
		shape: {
			control: 'select',
			options: ['square', 'rounded', 'circle'],
			description: 'Hoekvorm',
			table: { defaultValue: { summary: 'square' } },
		},
		width: {
			control: 'select',
			options: ['full', 160, 240, 320, 480, 640, '20rem', '50%'],
			description: 'Display-breedte, nooit breder dan de parent. `full` vult de parent, een getal is pixels en zet ook de img-hint, een andere CSS-lengte zet alleen de breedte.',
			table: { defaultValue: { summary: 'full' } },
		},
		height: {
			description: 'Hoogte in pixels als hint voor de `img`, geen getoonde hoogte. Met een `width` in pixels houdt de browser ruimte vrij in die verhouding; bij elke andere breedte doet hij niets, gebruik dan `aspect-ratio`.',
		},
		src: {
			control: 'text',
			description: 'Image URL',
		},
		srcset: {
			control: 'text',
			description: `Responsive bron-set met varianten per pixel-breedte. Voorbeeld: ${SAMPLE_SRCSET}`,
		},
		sizes: {
			control: 'text',
			description: 'Sizes hint voor srcset, bv. `100vw` of `(max-width: 640px) 100vw, 50vw`',
		},
		alt: {
			control: 'text',
			description: 'Alt-tekst voor de afbeelding uit `src`. Verplicht tenzij `decorative` is gezet; geslotte media heeft een eigen alt.',
		},
		aspectRatio: {
			name: 'aspect-ratio',
			control: 'select',
			options: ['(geen)', '21/9', '16/9', '3/2', '4/3', '1/1', '3/4', '2/3'],
			mapping: { '(geen)': '' },
			description: 'Reserveert ruimte tijdens laden om layout-shift te voorkomen',
			table: { defaultValue: { summary: '(geen)' } },
		},
		objectFit: {
			name: 'object-fit',
			control: 'select',
			options: ['cover', 'contain', 'fill', 'scale-down', 'none'],
			description: 'Hoe de afbeelding past binnen het kader',
			table: { defaultValue: { summary: 'cover' } },
		},
		objectPosition: {
			name: 'object-position',
			control: 'select',
			options: ['center', 'top', 'bottom', 'left', 'right'],
			description: 'Welk deel zichtbaar blijft bij `object-fit: cover`',
			table: { defaultValue: { summary: 'center' } },
		},
		lqip: {
			control: 'text',
			description: `CSS-only multi-color LQIP. CSV-string van 7 bytes (base + 6 cellen, 3×2 raster). Elke byte is een 8-bit Oklab triplet. Voorbeeld: \`${SAMPLE_LQIP}\`. Genereer eigen waarden via de story LQIP-encoder.`,
		},
		fetchPriority: {
			name: 'fetchpriority',
			control: 'select',
			options: ['(auto)', 'high', 'low'],
			mapping: { '(auto)': undefined },
			description: 'Fetch priority hint. Zet `high` op de LCP-image voor sterkste signaal naar de browser.',
			table: { defaultValue: { summary: '(auto)' } },
		},
		caption: {
			control: 'text',
			description: 'Caption tekst onder de afbeelding',
		},
		credit: {
			control: 'text',
			description: 'Kleinere credit/attributie naast de caption',
		},
		decorative: {
			control: 'boolean',
			description: 'Decoratieve afbeelding: alt wordt leeg en aria-hidden gezet',
			table: { defaultValue: { summary: false } },
		},
		loading: {
			control: 'select',
			options: ['lazy', 'eager'],
			description: 'Loading-strategie. `lazy` is goed voor below-the-fold; gebruik `eager` voor hero / LCP-kandidaat (anders silent Core Web Vitals regressie).',
			table: { defaultValue: { summary: 'lazy' } },
		},
	},
};

const Template = ({
	shape,
	width,
	src,
	srcset,
	sizes,
	alt,
	aspectRatio,
	objectFit,
	objectPosition,
	lqip,
	fetchPriority,
	caption,
	credit,
	decorative,
	loading,
}: Record<string, unknown>) => html`
	<nldd-image
		shape=${shape as string}
		width=${width as string}
		src=${src as string}
		srcset=${srcset as string}
		sizes=${sizes as string}
		alt=${alt as string}
		aspect-ratio=${aspectRatio as string}
		object-fit=${objectFit as string}
		object-position=${objectPosition as string}
		lqip=${(lqip as string) || nothing}
		fetchpriority=${(fetchPriority as string) || nothing}
		caption=${caption as string}
		credit=${credit as string}
		?decorative=${decorative}
		loading=${loading as string}
	></nldd-image>
`;

export const Standaard = {
	render: Template,
};

export const MetCaption = {
	render: Template,
	args: {
		caption: 'Klein koolwitje op een vlinderstruik.',
		credit: 'Foto: Bart van de Biezen',
	},
};

/**
 * Met `shape="circle"` en `aspect-ratio="1/1"` wordt de afbeelding rond. Gaat het om
 * een persoon of organisatie, gebruik dan `nldd-avatar`: die valt terug op de
 * initialen als de afbeelding niet laadt.
 */
export const Vormen = {
	render: () => html`
		<nldd-container
			layout="row"
			gap="24"
			vertical-alignment="bottom"
		>
			<nldd-container width="200px">
				<nldd-image
					src=${SAMPLE_SRC}
					alt=${SAMPLE_ALT}
					aspect-ratio="4/3"
					shape="square"
					caption="square"
				></nldd-image>
			</nldd-container>
			<nldd-container width="200px">
				<nldd-image
					src=${SAMPLE_SRC}
					alt=${SAMPLE_ALT}
					aspect-ratio="4/3"
					shape="rounded"
					caption="rounded"
				></nldd-image>
			</nldd-container>
			<nldd-container width="120px">
				<nldd-image
					src=${SAMPLE_SRC}
					alt=${SAMPLE_ALT}
					aspect-ratio="1/1"
					shape="circle"
					caption="circle"
				></nldd-image>
			</nldd-container>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

export const Beeldverhoudingen = {
	render: () => html`
		<nldd-container
			layout="wrap"
			gap="16"
		>
			${['21/9', '16/9', '3/2', '4/3', '1/1', '3/4', '2/3'].map(ratio => html`
				<nldd-container width="240px">
					<nldd-image
						src=${SAMPLE_SRC}
						alt=${SAMPLE_ALT}
						aspect-ratio=${ratio}
						caption=${ratio}
					></nldd-image>
				</nldd-container>
			`)}
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

export const ObjectFit = {
	name: 'Object-fit vergeleken',
	render: () => html`
		<nldd-container
			layout="wrap"
			gap="16"
		>
			${['cover', 'contain', 'fill', 'scale-down', 'none'].map(fit => html`
				<nldd-container width="180px">
					<nldd-image
						src=${SAMPLE_SRC}
						alt=${SAMPLE_ALT}
						aspect-ratio="1/1"
						object-fit=${fit}
						caption=${fit}
					></nldd-image>
				</nldd-container>
			`)}
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

export const Decoratief = {
	name: 'Met decorative (als achtergrond)',
	render: () => html`
		<nldd-container max-width="480px">
			<nldd-image
				src=${SAMPLE_SRC}
				aspect-ratio="16/9"
				decorative
			></nldd-image>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Zonder beeld (geen `src`, `srcset`, `lqip` of geslotte media) toont de
 * afbeelding een neutraal vlak met een icoon, in dezelfde verhouding, vorm en
 * met hetzelfde bijschrift als een echte afbeelding. Zo klopt de compositie van
 * een prototype of een patroon al voordat er beeld is, en valt een vergeten
 * afbeelding op. Zonder `aspect-ratio` is het vlak 16/9.
 */
export const ZonderBeeld = {
	name: 'Zonder beeld',
	render: () => html`
		<nldd-container
			layout="wrap"
			gap="24"
			vertical-alignment="top"
		>
			<nldd-container width="320px">
				<nldd-image></nldd-image>
			</nldd-container>
			<nldd-container width="200px">
				<nldd-image
					aspect-ratio="1/1"
					shape="rounded"
				></nldd-image>
			</nldd-container>
			<nldd-container width="120px">
				<nldd-image
					aspect-ratio="1/1"
					shape="circle"
				></nldd-image>
			</nldd-container>
			<nldd-container width="320px">
				<nldd-image
					aspect-ratio="4/3"
					caption="Een bijschrift blijft gewoon staan."
				></nldd-image>
			</nldd-container>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

export const EigenImgInDeSlot = {
	name: 'Eigen img in de slot',
	render: () => html`
		<nldd-container max-width="480px">
			<nldd-image
				aspect-ratio="16/9"
				shape="rounded"
			>
				<img
					src=${SAMPLE_SRC}
					alt=${SAMPLE_ALT}
					loading="lazy"
					decoding="async"
				>
			</nldd-image>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Een laadvoorbeeld: een vage voorproef in de kleuren van de echte foto, zolang
 * die laadt. Het is een CSS-only multi-color LQIP (low-quality image
 * placeholder), geïnspireerd op
 * https://leanrada.com/notes/css-only-lqip/, uitgebreid met per-cel kleur
 * (Lean's originele encoding heeft alleen grijswaarde-cellen rondom één
 * dominante hue). Onze versie encodeert 7 bytes: een base color + 6 per-cel
 * Oklab kleuren in een 3×2 raster. Zichtbaar tot het echte beeld is geladen.
 *
 * Links: alleen het laadvoorbeeld (geen src), zodat je het kleurverloop los
 * ziet. Rechts: met src, waar het laadvoorbeeld even zichtbaar is en verdwijnt
 * zodra de afbeelding geladen is. Zonder `lqip` toont een afbeelding die laadt
 * een neutraal vlak.
 */
export const Laadvoorbeeld = {
	name: 'Laadvoorbeeld (LQIP)',
	render: () => html`
		<nldd-container
			layout="wrap"
			gap="24"
		>
			<nldd-container width="320px">
				<nldd-image
					alt="Placeholder zonder image"
					aspect-ratio="16/9"
					lqip=${SAMPLE_LQIP}
					caption="Alleen LQIP (geen src)"
				></nldd-image>
			</nldd-container>
			<nldd-container width="320px">
				<nldd-image
					src=${SAMPLE_SRC}
					alt=${SAMPLE_ALT}
					aspect-ratio="16/9"
					lqip=${SAMPLE_LQIP}
					caption="LQIP + image"
				></nldd-image>
			</nldd-container>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Wanneer een image niet geladen kan worden (404, netwerk-fout, decode-fout)
 * toont het component een fallback: een icoon + de alt-tekst in een kleine
 * neutrale container, met de neutrale media-achtergrond erachter. Een
 * eventueel gezet `lqip` gradient wordt verborgen in error state: het
 * laadvoorbeeld dient alleen tijdens het laden, niet ná een mislukking.
 *
 * Een decoratieve afbeelding (`decorative`) toont alleen het icoon, geen tekst.
 */
export const AfbeeldingLaadtNiet = {
	name: 'Als de afbeelding niet laadt',
	render: () => html`
		<nldd-container
			layout="wrap"
			gap="24"
		>
			<nldd-container width="320px">
				<nldd-image
					src="/this-does-not-exist.jpg"
					alt="Klein koolwitje op een vlinderstruik"
					aspect-ratio="16/9"
					caption="Met alt-tekst"
				></nldd-image>
			</nldd-container>
			<nldd-container width="320px">
				<nldd-image
					src="/this-does-not-exist.jpg"
					aspect-ratio="16/9"
					decorative
					caption="Decoratief (alleen icoon)"
				></nldd-image>
			</nldd-container>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Encodeer je eigen afbeelding tot een LQIP integer. Volledig client-side:
 * niets wordt geüpload. De berekende waarde plak je in het `lqip` attribuut
 * van `nldd-image`.
 *
 * Mocht de [originele tool van Lean Rada](https://leanrada.com/notes/css-only-lqip/)
 * ooit offline gaan, dan kun je je laadvoorbeelden nog steeds genereren met dit
 * lokale alternatief.
 */
export const LqipEncoder = {
	name: 'LQIP-encoder',
	render: () => html`
		<!-- nldd-lint-disable-next-line unknown-element -- Developer tool registered by this story only, left out of the package on purpose. -->
		<nldd-lqip-encoder></nldd-lqip-encoder>
	`,
	parameters: { controls: { disable: true } },
};
