import { html, nothing } from 'lit';
import './simple-section.js';
import '../../../content/title/title.js';
import '../../../content/rich-text/rich-text.js';
import '../../container/container.js';
import '../../box/box.js';
import { pageSectionArgTypes, pageSectionArgs, pageSectionAttrs } from '../page-section-controls.js';

/**
 * Gebruik een simple section als bouwsteen voor paginainhoud.
 * De sectie past padding en ruimte tussen header, inhoud en footer automatisch
 * aan op basis van de beschikbare breedte via container queries — geen attribuut nodig.
 *
 * ## Gebruik
 * ```html
 * <nldd-simple-section>
 *   <nldd-title slot="header" text="Sectietitel" heading-level="2"></nldd-title>
 *   <nldd-rich-text><p>Inhoud van de sectie.</p></nldd-rich-text>
 *   <nldd-rich-text slot="footer"><p>Voetnoot of actie.</p></nldd-rich-text>
 * </nldd-simple-section>
 * ```
 */
export default {
	title: 'Components/Layout/Page Sections/Simple Section',
	component: 'nldd-simple-section',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/page-sections/simple-section/simple-section.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		...pageSectionArgs,
		horizontalAlignment: 'left',
		verticalAlignment: 'top',
	},
	argTypes: {
		...pageSectionArgTypes,
		horizontalAlignment: {
			name: 'horizontal-alignment',
			control: { type: 'select' },
			options: ['left', 'center', 'right'],
			description: 'Waar de kinderen van de sectie horizontaal staan, voor iets dat smaller is dan de body',
			table: { defaultValue: { summary: 'left' } },
		},
		verticalAlignment: {
			name: 'vertical-alignment',
			control: { type: 'select' },
			options: ['top', 'center', 'bottom'],
			description: 'Waar de kinderen verticaal staan; alleen zichtbaar als de sectie hoger is dan de inhoud',
			table: { defaultValue: { summary: 'top' } },
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-simple-section
			${pageSectionAttrs(args)}
			horizontal-alignment=${args.horizontalAlignment === 'left' ? nothing : args.horizontalAlignment}
			vertical-alignment=${args.verticalAlignment === 'top' ? nothing : args.verticalAlignment}
		>
			<nldd-title
				slot="header"
				text="Sectietitel"
				heading-level="2"
			></nldd-title>
			<nldd-rich-text>
				<p>Dit is de hoofdinhoud van de sectie. Voeg hier tekst, formulieren of andere componenten toe.</p>
				<p>De ruimte tussen header, inhoud en footer wordt bepaald door de breedte van de sectie.</p>
			</nldd-rich-text>
			<nldd-rich-text slot="footer">
				<p>Voetnoot of aanvullende informatie.</p>
			</nldd-rich-text>
		</nldd-simple-section>
	`,
};

/**
 * `background` tekent een oppervlak ("base" of "tinted") en cascadet
 * `--context-parent-background-color` naar afstammelingen. Combineer met
 * `scheme="dark"` voor een donkere band op een lichte pagina.
 */
export const Oppervlak = {
	render: () => html`
		<nldd-simple-section background="tinted" scheme="dark">
			<nldd-title
				slot="header"
				text="Donkere, getinte sectie"
				heading-level="2"
			></nldd-title>
			<nldd-rich-text>
				<p>Deze sectie forceert <code>scheme="dark"</code> en een getint oppervlak — bruikbaar voor een hero-band.</p>
			</nldd-rich-text>
		</nldd-simple-section>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * `height` accepteert elke CSS-length en zet de minimale sectiehoogte.
 */
export const MinimaleHoogte = {
	render: () => html`
		<nldd-simple-section background="tinted" height="320px">
			<nldd-rich-text>
				<p>Deze sectie is minimaal 320px hoog, ook met weinig inhoud.</p>
			</nldd-rich-text>
		</nldd-simple-section>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * `horizontal-alignment` en `vertical-alignment` plaatsen de inhoud in de body.
 * Ze lijnen de kinderen van de sectie uit, niet de sectie zelf, dus zo zet je
 * iets dat smaller is dan de body in het midden: een paneel dat zijn eigen
 * breedte draagt (hier een container met `max-width`) en een sectie die zegt
 * waar het staat.
 */
export const Uitlijning = {
	render: () => html`
		<nldd-simple-section
			background="tinted"
			height="320px"
			horizontal-alignment="center"
			vertical-alignment="center"
		>
			<nldd-container max-width="320px">
				<nldd-box>
					<nldd-container padding="16">
						<nldd-rich-text spacing="flat">
							<p>Een paneel midden in de sectie.</p>
						</nldd-rich-text>
					</nldd-container>
				</nldd-box>
			</nldd-container>
		</nldd-simple-section>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Block-padding overschrijven: `padding-block="0"` verwijdert de verticale
 * padding; `padding-top` / `padding-bottom` regelen één zijde.
 */
export const BlockPadding = {
	render: () => html`
		<nldd-simple-section background="base" padding-bottom="0">
			<nldd-rich-text>
				<p>Deze sectie laat de standaard bovenpadding staan maar verwijdert de onderpadding (<code>padding-bottom="0"</code>), zodat ze strak aansluit op de volgende sectie.</p>
			</nldd-rich-text>
		</nldd-simple-section>
		<nldd-simple-section background="tinted" padding-top="0">
			<nldd-rich-text>
				<p>De volgende sectie verwijdert juist haar bovenpadding (<code>padding-top="0"</code>).</p>
			</nldd-rich-text>
		</nldd-simple-section>
	`,
	parameters: { controls: { disable: true } },
};

export const ZonderHeaderEnFooter = {
	render: () => html`
	<nldd-simple-section>
		<nldd-rich-text>
			<p>Een sectie zonder header en footer. Alleen de hoofdinhoud wordt getoond.</p>
		</nldd-rich-text>
	</nldd-simple-section>
`,
	parameters: { controls: { disable: true } },
};
