import { html, nothing } from 'lit';
import './page.js';
import '../container/container.js';
import '../page-sections/simple-section/simple-section.js';
import '../../actions/button/button.js';
import '../../layout/spacer/spacer.js';
import '../../actions/button-group/button-group.js';
import '../../content/rich-text/rich-text.js';
import '../../status-and-feedback/inline-dialog/inline-dialog.js';
import '../../navigation/top-title-bar/top-title-bar.js';
import '../../content/title/title.js';

/**
 * Gebruik de page-component als buitenste wrapper van een pagina.
 * De page biedt een scrollbaar hoofdgebied met optionele sticky header en footer.
 * Sticky secties hebben een doorschijnende achtergrond met een vervagend verloop
 * dat buiten de sectie uitsteekt, zodat inhoud vloeiend achter ze door scrollt.
 * De header toont het verloop pas nadat er gescrolld is.
 *
 * ## Gebruik
 * ```html
 * <nldd-page
 * 	sticky-header
 * 	sticky-footer
 * >
 *   <nav slot="header">...</nav>
 *   <nldd-rich-text>...</nldd-rich-text>
 *   <div slot="footer">...</div>
 * </nldd-page>
 * ```
 */
export default {
	title: 'Components/Layout/Page',
	component: 'nldd-page',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		componentSource: {
			file: 'src/components/layout/page/page.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		background: 'inherit',
		accessibleLabel: '',
		stickyHeader: false,
		stickyFooter: false,
		landmarks: 'auto',
	},
	argTypes: {
		background: {
			control: { type: 'select' },
			options: ['inherit', 'base', 'tinted'],
			description: 'Grijze achtergrond',
			table: { defaultValue: { summary: 'false' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Naam van het landmark dat deze pagina is: de regio die hij wordt naast een andere pagina, of zijn main.',
		},
		stickyHeader: {
			name: 'sticky-header',
			control: 'boolean',
			description: 'Sticky header',
			table: { defaultValue: { summary: 'false' } },
		},
		stickyFooter: {
			name: 'sticky-footer',
			control: 'boolean',
			description: 'Sticky footer',
			table: { defaultValue: { summary: 'false' } },
		},
		landmarks: {
			control: 'select',
			options: ['auto', 'page', 'region'],
			description: 'Of deze pagina de landmarks van het document draagt: `auto` leidt het af uit waar de pagina staat, `page` houdt banner, main en contentinfo, `region` laat ze alle drie vallen.',
			table: { defaultValue: { summary: 'auto' } },
		},
	},
};

const header = html`
	<nldd-top-title-bar
		slot="header"
		text="Aanvraag A-1042"
		back-text="Aanvragen"
		collapse-anchor="page-title"
	></nldd-top-title-bar>
`;

const footer = html`
	<nldd-container padding="16">
		<nldd-button-group orientation="horizontal">
			<nldd-button
				appearance="primary"
				text="Bewaar"
			></nldd-button>
		</nldd-button-group>
	</nldd-container>
`;

const content = html`
	<nldd-simple-section>
		<nldd-title
			id="page-title"
			size="2"
			text="Aanvraag A-1042"
			heading-level="1"
		></nldd-title>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-rich-text>
			<p>
				Je aanvraag voor dakisolatie is binnen en staat op de lijst om beoordeeld te worden.
				Op deze pagina zie je wat er al bekend is en wat we nog van je nodig hebben.
			</p>
			<p>We kijken eerst of het dak in aanmerking komt. Daarvoor gebruiken we het oppervlak dat je hebt opgegeven en de offerte van het isolatiebedrijf.</p>
			<p>Klopt het oppervlak niet, of heb je een nieuwe offerte gekregen? Geef de wijziging dan door voordat de beoordeling begint.</p>
			<p>Tijdens de beoordeling kan een medewerker contact met je opnemen. Hij vraagt dan bijvoorbeeld om foto's van het dak of om een toelichting op de offerte.</p>
			<p>Is de beoordeling klaar, dan krijg je een bericht in Mijn Dienst. Daarin staat of je aanvraag is goedgekeurd en welk bedrag je ontvangt.</p>
			<p>Na goedkeuring heb je tijd om de isolatie te laten aanbrengen. Bewaar de factuur, want die heb je nodig om de aanvraag af te ronden.</p>
			<p>Je kunt Aanvraag A-1042 altijd terugvinden onder Aanvragen. Daar zie je ook je eerdere aanvraag voor een warmtepomp, die al is afgerond.</p>
			<p>Heb je een vraag over je aanvraag? Noem dan altijd het nummer A-1042, dan kunnen we je sneller helpen.</p>
			<p>Wil je de aanvraag intrekken? Dat kan zolang de beoordeling nog niet is afgerond. Daarna neem je contact op met team Uitvoering.</p>
			<p>Alle stukken die je hebt aangeleverd, staan in je dossier. Je kunt ze daar bekijken en downloaden.</p>
			<p>Verandert er iets aan je situatie, bijvoorbeeld omdat je verhuist? Geef dat dan zo snel mogelijk door.</p>
		</nldd-rich-text>
	</nldd-simple-section>
`;

export const Standaard = ({ background, accessibleLabel, stickyHeader, stickyFooter, landmarks }: Record<string, any>) => html`
	<nldd-page
		background=${background}
		accessible-label=${accessibleLabel || nothing}
		?sticky-header=${stickyHeader}
		?sticky-footer=${stickyFooter}
		landmarks=${landmarks}
		style="height: 400px;"
	>
		${header}
		${content}
		<div slot="footer">${footer}</div>
	</nldd-page>
`;

export const StickyHeader = {
	render: () => html`
	<nldd-page
		sticky-header
		style="height: 400px;"
	>
		${header}
		${content}
		<div slot="footer">${footer}</div>
	</nldd-page>
`,
	parameters: { controls: { disable: true } },
};

export const StickyFooter = {
	render: () => html`
	<nldd-page
		sticky-footer
		style="height: 400px;"
	>
		${header}
		${content}
		<div slot="footer">${footer}</div>
	</nldd-page>
`,
	parameters: { controls: { disable: true } },
};

export const StickyBeide = {
	render: () => html`
	<nldd-page
		sticky-header
		sticky-footer
		style="height: 400px;"
	>
		${header}
		${content}
		<div slot="footer">${footer}</div>
	</nldd-page>
`,
	parameters: { controls: { disable: true } },
};

export const Tinted = {
	render: () => html`
	<nldd-page
		sticky-header
		sticky-footer
		background="tinted"
		style="height: 400px;"
	>
		${header}
		${content}
		<div slot="footer">${footer}</div>
	</nldd-page>
`,
	parameters: { controls: { disable: true } },
};

export const GecentreerdeDialoog = {
	render: () => html`
	<nldd-page
		sticky-header
		sticky-footer
		style="height: 400px;"
	>
		${header}
		<nldd-simple-section>
			<nldd-inline-dialog
				icon="search"
				text="Geen resultaten"
				supporting-text="Probeer een andere zoekopdracht."
			></nldd-inline-dialog>
		</nldd-simple-section>
		<div slot="footer">${footer}</div>
	</nldd-page>
`,
	parameters: { controls: { disable: true } },
};
