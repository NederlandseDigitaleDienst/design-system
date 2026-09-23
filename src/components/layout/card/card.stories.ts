import { html, nothing } from 'lit';
import './card.js';
import '../../content/title/title.js';
import '../../content/rich-text/rich-text.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';
import '../../layout/container/container.js';

/**
 * Een visueel afgebakende kaart met optionele header, body en footer secties.
 * De kaart heeft een elevated look als standaard. Gebruik geneste containers
 * voor padding.
 *
 * ## Gebruik
 * ```html
 * <nldd-card>
 *   <nldd-container slot="header" padding-top="16" padding-inline="16">
 *     <nldd-title text="Titel" heading-level="3"></nldd-title>
 *   </nldd-container>
 *   <nldd-container padding="16">
 *     <p>Inhoud van de kaart.</p>
 *   </nldd-container>
 *   <nldd-container slot="footer" padding-inline="16" padding-bottom="16">
 *     <nldd-button-group orientation="horizontal">
 *       <nldd-button variant="primary" text="Actie"></nldd-button>
 *     </nldd-button-group>
 *   </nldd-container>
 * </nldd-card>
 * ```
 */
export default {
	title: 'Components/Layout/Card',
	component: 'nldd-card',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/card/card.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'experimental' },
	},
	args: {
		background: 'base',
		accessibleLabel: '',
		href: '',
		target: '',
		rel: '',
	},
	argTypes: {
		background: {
			control: 'select',
			options: ['base', 'tinted'],
			description: 'Vlakkleur van de kaart',
			table: { defaultValue: { summary: 'base' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
		},
		href: {
			control: 'text',
			description: 'Maakt de hele kaart een link naar deze URL (leeg = geen link)',
		},
		target: {
			control: 'select',
			options: ['(geen)', '_self', '_blank', '_parent', '_top'],
			mapping: { '(geen)': '' },
			description: 'Link target (alleen gebruikt als href is gezet)',
			table: { defaultValue: { summary: '(geen)' } },
		},
		rel: {
			control: 'text',
			description: 'Link rel voor href (bijv. noopener)',
		},
	},
};

export const Standaard = (args: Record<string, any>) => html`
	<nldd-card
		background=${args.background || nothing}
		accessible-label=${args.accessibleLabel || nothing}
	>
		<nldd-container slot="header" padding-top="16" padding-inline="16">
			<nldd-title size="4"
				text="Kaarttitel"
				heading-level="3"
			></nldd-title>
		</nldd-container>
		<nldd-container padding="16">
			<nldd-rich-text>
				<p>Dit is de inhoud van de kaart. Gebruik een card om gerelateerde informatie
				visueel te groeperen met een duidelijke structuur van header, body en footer.</p>
			</nldd-rich-text>
		</nldd-container>
		<nldd-container slot="footer" padding-inline="16" padding-bottom="16">
			<nldd-button-group orientation="horizontal">
				<nldd-button variant="primary" text="Bevestig"></nldd-button>
				<nldd-button variant="secondary" text="Annuleer"></nldd-button>
			</nldd-button-group>
		</nldd-container>
	</nldd-card>
`;

export const AlleenBody = () => html`
	<nldd-card>
		<nldd-container padding="16">
			<nldd-rich-text>
				<p>Een kaart zonder header of footer. De header- en footer-secties worden
				automatisch verborgen als er geen content in geplaatst is.</p>
			</nldd-rich-text>
		</nldd-container>
	</nldd-card>
`;

export const MetHeader = () => html`
	<nldd-card>
		<nldd-container slot="header" padding-top="16" padding-inline="16">
			<nldd-title size="4"
				text="Alleen header en body"
				heading-level="3"
			></nldd-title>
		</nldd-container>
		<nldd-container padding="16">
			<nldd-rich-text>
				<p>Een kaart met header en body, zonder footer.</p>
			</nldd-rich-text>
		</nldd-container>
	</nldd-card>
`;

export const VasteHoogte = () => html`
	<nldd-card style="height: 400px;">
		<nldd-container slot="header" padding-top="16" padding-inline="16">
			<nldd-title size="4"
				text="Vaste hoogte"
				heading-level="3"
			></nldd-title>
		</nldd-container>
		<nldd-container padding="16">
			<nldd-rich-text>
				<p>Bij een vaste hoogte blijft de footer altijd aan de onderkant
				dankzij flex-grow op de main sectie.</p>
			</nldd-rich-text>
		</nldd-container>
		<nldd-container slot="footer" padding-inline="16" padding-bottom="16">
			<nldd-button-group orientation="horizontal">
				<nldd-button variant="primary" text="Actie"></nldd-button>
			</nldd-button-group>
		</nldd-container>
	</nldd-card>
`;

export const MetAfbeelding = () => html`
	<nldd-card style="max-width: 360px;">
		<img
			slot="header"
			src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%231b5fa8'/><stop offset='1' stop-color='%2300a3a3'/></linearGradient></defs><rect width='480' height='200' fill='url(%23g)'/></svg>"
			alt=""
			style="display: block; width: 100%; height: auto;"
		>
		<nldd-container padding="16">
			<nldd-rich-text>
				<p>Een full-width afbeelding loopt door tot de rand van de kaart. De inner
				highlight-rand valt eroverheen, zodat de bovenrand subtiel oplicht in plaats
				van weg te vallen achter de afbeelding.</p>
			</nldd-rich-text>
		</nldd-container>
	</nldd-card>
`;

/**
 * Met `href` wordt de hele kaart een link (overlay-anchor). Klikken waar dan ook
 * volgt de link. Geneste interactieve content blijft klikbaar door 'm op te tillen
 * met `position: relative; z-index: 1` — zoals de "Markeer"-knop hieronder.
 */
export const KlikbareKaart = (args: Record<string, any>) => html`
	<nldd-card href=${args.href || nothing}
		target=${args.target || nothing}
		rel=${args.rel || nothing}
		accessible-label=${args.accessibleLabel || nothing}
		style="max-width: 360px;"
	>
		<nldd-container slot="header" padding-top="16" padding-inline="16">
			<nldd-title size="4"
				text="Dossier 2024-001"
				heading-level="3"
			></nldd-title>
		</nldd-container>
		<nldd-container padding="16">
			<nldd-rich-text>
				<p>De hele kaart is een link. Klik waar dan ook om het dossier te openen.</p>
			</nldd-rich-text>
		</nldd-container>
		<nldd-container slot="footer" padding-inline="16" padding-bottom="16">
			<nldd-button-group orientation="horizontal">
				<nldd-button variant="secondary"
					text="Markeer"
					style="position: relative; z-index: 1;"
				></nldd-button>
			</nldd-button-group>
		</nldd-container>
	</nldd-card>
`;
KlikbareKaart.args = {
	href: '#',
	accessibleLabel: 'Dossier 2024-001',
};

/**
 * Met `button` wordt de hele kaart een knop (overlay-button). De activatie komt
 * als gewone, composed `click` op de kaart aan — een listener of htmx-attribuut
 * op `nldd-card` zelf werkt dus direct, en Enter/Space doen het native.
 */
export const KaartAlsKnop = () => html`
	<nldd-card button
		accessible-label="Dossier 2024-001 openen"
		style="max-width: 360px;"
		@click=${() => window.alert('Kaart geactiveerd')}
	>
		<nldd-container slot="header" padding-top="16" padding-inline="16">
			<nldd-title size="4"
				text="Dossier 2024-001"
				heading-level="3"
			></nldd-title>
		</nldd-container>
		<nldd-container padding="16">
			<nldd-rich-text>
				<p>De hele kaart is een knop: klik, of Tab ernaartoe en druk Enter.</p>
			</nldd-rich-text>
		</nldd-container>
	</nldd-card>
`;
