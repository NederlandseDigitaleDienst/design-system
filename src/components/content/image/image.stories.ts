import { html, nothing } from 'lit';
import './image.js';
import './lqip-encoder-element.js';

// Lokale voorbeeldafbeelding (public/sample-images/), zodat de stories niet
// afhankelijk zijn van een externe host en consumers van offline Storybook-builds.
// Foto: Bart van de Biezen — Klein koolwitje op een vlinderstruik.
// Paden zijn RELATIEF (geen leading slash): de preview-iframe staat op
// `.../iframe.html`, dus `sample-images/...` resolvet correct onder de
// GitHub-Pages base-path (`/storybook/`) én op localhost (root). Een absoluut
// `/sample-images/...` zou op Pages tegen de origin resolven en 404'en.
const SAMPLE_SRC = 'sample-images/butterfly-1200.jpg';
const SAMPLE_ALT = 'Klein koolwitje op een vlinderstruik';

const SAMPLE_SRCSET =
	'sample-images/butterfly-480.jpg 480w, ' +
	'sample-images/butterfly-960.jpg 960w, ' +
	'sample-images/butterfly-1600.jpg 1600w';

/** LQIP CSV string berekend uit de bron (zeven 0-255 Oklab bytes). Regenereer
 *  via de "LQIP encoder tool" story als je de afbeelding vervangt. */
const SAMPLE_LQIP = '28,28,164,164,106,170,99';

/**
 * Een gestylede wrapper rond `<img>` met de tokens van het designsysteem voor radius,
 * achtergrond en caption. Reserveert ruimte via `aspect-ratio` om layout-shift
 * te voorkomen tijdens het laden. Voor avatars: `shape="circle"` met
 * `aspect-ratio="1/1"`.
 *
 * Slot je eigen `<img>` of `<picture>` (bv. met art-direction sources) in de
 * default slot om de interne fallback te overschrijven.
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
		status: { type: 'beta' },
	},
	args: {
		src: SAMPLE_SRC,
		alt: SAMPLE_ALT,
		width: 'full',
		aspectRatio: '16/9',
		objectFit: 'cover',
		objectPosition: 'center',
		shape: 'square',
		srcset: '',
		sizes: '',
		lqip: '',
		caption: '',
		credit: '',
		loading: 'lazy',
		fetchPriority: '(auto)',
		decorative: false,
	},
	argTypes: {
		src: {
			control: 'text',
			description: 'Image URL',
		},
		alt: {
			control: 'text',
			description: 'Alt-tekst voor de afbeelding uit `src`. Verplicht tenzij `decorative` is gezet; geslotte media heeft een eigen alt.',
		},
		width: {
			control: 'select',
			options: ['full', 160, 240, 320, 480, 640],
			description: 'Display-breedte. `full` vult de parent, een numerieke waarde zet max-width + img-hint.',
			table: { defaultValue: { summary: 'full' } },
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
		shape: {
			control: 'select',
			options: ['square', 'rounded', 'circle'],
			description: 'Hoekvorm',
			table: { defaultValue: { summary: 'square' } },
		},
		srcset: {
			control: 'text',
			description: `Responsive bron-set met varianten per pixel-breedte. Voorbeeld: ${SAMPLE_SRCSET}`,
		},
		sizes: {
			control: 'text',
			description: 'Sizes hint voor srcset — bv. `100vw` of `(max-width: 640px) 100vw, 50vw`',
		},
		lqip: {
			control: 'text',
			description: `CSS-only multi-color LQIP. CSV-string van 7 bytes (base + 6 cellen, 3×2 raster) — elke byte is een 8-bit Oklab triplet. Voorbeeld: \`${SAMPLE_LQIP}\`. Genereer eigen waarden via de "LQIP encoder tool" story.`,
		},
		caption: {
			control: 'text',
			description: 'Caption tekst onder de afbeelding',
		},
		credit: {
			control: 'text',
			description: 'Kleinere credit/attributie naast de caption',
		},
		loading: {
			control: 'select',
			options: ['lazy', 'eager'],
			description: 'Loading-strategie. `lazy` is goed voor below-the-fold; gebruik `eager` voor hero / LCP-kandidaat (anders silent Core Web Vitals regressie).',
			table: { defaultValue: { summary: 'lazy' } },
		},
		fetchPriority: {
			name: 'fetchpriority',
			control: 'select',
			options: ['(auto)', 'high', 'low'],
			mapping: { '(auto)': undefined },
			description: 'Fetch priority hint. Zet `high` op de LCP-image voor sterkste signaal naar de browser.',
			table: { defaultValue: { summary: '(auto)' } },
		},
		decorative: {
			control: 'boolean',
			description: 'Decoratieve afbeelding: alt wordt leeg en aria-hidden gezet',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = ({
	src,
	alt,
	width,
	aspectRatio,
	objectFit,
	objectPosition,
	shape,
	srcset,
	sizes,
	lqip,
	caption,
	credit,
	loading,
	fetchPriority,
	decorative,
}: Record<string, unknown>) => html`
	<nldd-image
		src=${src as string}
		alt=${alt as string}
		width=${width as string}
		aspect-ratio=${aspectRatio as string}
		object-fit=${objectFit as string}
		object-position=${objectPosition as string}
		shape=${shape as string}
		srcset=${srcset as string}
		sizes=${sizes as string}
		lqip=${(lqip as string) || nothing}
		caption=${caption as string}
		credit=${credit as string}
		loading=${loading as string}
		fetchpriority=${(fetchPriority as string) || nothing}
		?decorative=${decorative}
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

export const Vormen = {
	render: () => html`
		<div style="display: flex; gap: 24px; align-items: flex-end;">
			<div style="width: 200px;">
				<nldd-image
					src=${SAMPLE_SRC}
					alt=${SAMPLE_ALT}
					aspect-ratio="4/3"
					shape="square"
					caption="square"
				></nldd-image>
			</div>
			<div style="width: 200px;">
				<nldd-image
					src=${SAMPLE_SRC}
					alt=${SAMPLE_ALT}
					aspect-ratio="4/3"
					shape="rounded"
					caption="rounded"
				></nldd-image>
			</div>
			<div style="width: 120px;">
				<nldd-image
					src=${SAMPLE_SRC}
					alt=${SAMPLE_ALT}
					aspect-ratio="1/1"
					shape="circle"
					caption="circle"
				></nldd-image>
			</div>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const Beeldverhoudingen = {
	render: () => html`
		<div style="display: flex; gap: 16px; flex-wrap: wrap;">
			${['21/9', '16/9', '3/2', '4/3', '1/1', '3/4', '2/3'].map(ratio => html`
				<div style="width: 240px;">
					<nldd-image
						src=${SAMPLE_SRC}
						alt=${SAMPLE_ALT}
						aspect-ratio=${ratio}
						caption=${ratio}
					></nldd-image>
				</div>
			`)}
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const ObjectFit = {
	name: 'Object-fit vergeleken',
	render: () => html`
		<div style="display: flex; gap: 16px; flex-wrap: wrap;">
			${['cover', 'contain', 'fill', 'scale-down', 'none'].map(fit => html`
				<div style="width: 180px;">
					<nldd-image
						src=${SAMPLE_SRC}
						alt=${SAMPLE_ALT}
						aspect-ratio="1/1"
						object-fit=${fit}
						caption=${fit}
					></nldd-image>
				</div>
			`)}
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const Decoratief = {
	name: 'Met decorative (als achtergrond)',
	render: () => html`
		<div style="max-width: 480px;">
			<nldd-image
				src=${SAMPLE_SRC}
				aspect-ratio="16/9"
				decorative
			></nldd-image>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const EigenImgInDeSlot = {
	name: 'Eigen img in de slot',
	render: () => html`
		<div style="max-width: 480px;">
			<nldd-image aspect-ratio="16/9" shape="rounded">
				<img
					src=${SAMPLE_SRC}
					alt=${SAMPLE_ALT}
					loading="lazy"
					decoding="async"
				>
			</nldd-image>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * CSS-only multi-color Low Quality Image Placeholder — geïnspireerd op
 * https://leanrada.com/notes/css-only-lqip/, uitgebreid met per-cel kleur
 * (Lean's originele encoding heeft alleen grijswaarde-cellen rondom één
 * dominante hue). Onze versie encodeert 7 bytes: een base color + 6 per-cel
 * Oklab kleuren in een 3×2 raster. Zichtbaar tot het echte beeld is geladen.
 *
 * Links: alleen de placeholder (geen src) zodat je het LQIP gradient los ziet.
 * Rechts: met src — placeholder is even zichtbaar en wordt overlapt zodra de
 * afbeelding geladen is.
 */
export const PlaceholderMetLqip = {
	name: 'Placeholder met LQIP',
	render: () => html`
		<div style="display: flex; gap: 24px; flex-wrap: wrap;">
			<div style="width: 320px;">
				<nldd-image
					alt="Placeholder zonder image"
					aspect-ratio="16/9"
					lqip=${SAMPLE_LQIP}
					caption="Alleen LQIP (geen src)"
				></nldd-image>
			</div>
			<div style="width: 320px;">
				<nldd-image
					src=${SAMPLE_SRC}
					alt=${SAMPLE_ALT}
					aspect-ratio="16/9"
					lqip=${SAMPLE_LQIP}
					caption="LQIP + image"
				></nldd-image>
			</div>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Wanneer een image niet geladen kan worden (404, netwerk-fout, decode-fout)
 * toont het component een fallback: een icoon + de alt-tekst in een kleine
 * neutrale container, met de neutrale media-achtergrond erachter. Een
 * eventueel gezet `lqip` gradient wordt verborgen in error state — de
 * placeholder dient alleen tijdens het laden, niet ná een mislukking.
 *
 * Een decoratieve afbeelding (`decorative`) toont alleen het icoon, geen tekst.
 */
export const AfbeeldingLaadtNiet = {
	name: 'Als de afbeelding niet laadt',
	render: () => html`
		<div style="display: flex; gap: 24px; flex-wrap: wrap;">
			<div style="width: 320px;">
				<nldd-image
					src="/this-does-not-exist.jpg"
					alt="Klein koolwitje op een vlinderstruik"
					aspect-ratio="16/9"
					caption="Met alt-tekst"
				></nldd-image>
			</div>
			<div style="width: 320px;">
				<nldd-image
					src="/this-does-not-exist.jpg"
					aspect-ratio="16/9"
					decorative
					caption="Decoratief (alleen icoon)"
				></nldd-image>
			</div>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Encodeer je eigen afbeelding tot een LQIP integer. Volledig client-side —
 * niets wordt geüpload. De berekende waarde plak je in het `lqip` attribuut
 * van `nldd-image`.
 *
 * Mocht de [originele tool van Lean Rada](https://leanrada.com/notes/css-only-lqip/)
 * ooit offline gaan, dan kun je je placeholders nog steeds genereren met dit
 * lokale alternatief.
 */
export const LqipEncoder = {
	name: 'LQIP-encoder',
	render: () => html`<nldd-lqip-encoder></nldd-lqip-encoder>`,
	parameters: { controls: { disable: true } },
};
