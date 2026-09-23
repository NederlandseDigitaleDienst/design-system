import { html } from 'lit';
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
 * <nldd-page sticky-header sticky-footer>
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
		stickyHeader: false,
		stickyFooter: false,
	},
	argTypes: {
		background: {
			control: { type: 'select' },
			options: ['inherit', 'base', 'tinted'],
			description: 'Grijze achtergrond',
			table: { defaultValue: { summary: 'false' } },
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
	},
};

const header = html`
	<nldd-top-title-bar
		slot="header"
		text="Paginatitel"
		back-text="Overzicht"
		collapse-anchor="page-title"
	></nldd-top-title-bar>
`;

const footer = html`
	<nldd-container padding="16">
		<nldd-button-group orientation="horizontal">
			<nldd-button variant="primary" text="Opslaan"></nldd-button>
			<nldd-button variant="secondary" text="Annuleren"></nldd-button>
		</nldd-button-group>
	</nldd-container>
`;

const content = html`
	<nldd-simple-section>
		<nldd-title id="page-title"
			size="2"
			text="Paginatitel"
			heading-level="1"
		></nldd-title>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-rich-text>
			<p>
				Dit is het scrollbare hoofdgebied van de pagina. Voeg hier de inhoud van de pagina toe.
				Wanneer de inhoud langer is dan de viewport, wordt het gebied scrollbaar.
			</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
			<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
			<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
			<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
			<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
			<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
			<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
			<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
		</nldd-rich-text>
	</nldd-simple-section>
`;

export const Standaard = ({ background, stickyHeader, stickyFooter }: Record<string, any>) => html`
	<nldd-page
		?sticky-header=${stickyHeader}
		?sticky-footer=${stickyFooter}
		background=${background}
		style="height: 400px;"
	>
		${header}
		${content}
		<div slot="footer">${footer}</div>
	</nldd-page>
`;

export const StickyHeader = {
	render: () => html`
	<nldd-page sticky-header style="height: 400px;">
		${header}
		${content}
		<div slot="footer">${footer}</div>
	</nldd-page>
`,
	parameters: { controls: { disable: true } },
};

export const StickyFooter = {
	render: () => html`
	<nldd-page sticky-footer style="height: 400px;">
		${header}
		${content}
		<div slot="footer">${footer}</div>
	</nldd-page>
`,
	parameters: { controls: { disable: true } },
};

export const StickyBeide = {
	render: () => html`
	<nldd-page sticky-header sticky-footer style="height: 400px;">
		${header}
		${content}
		<div slot="footer">${footer}</div>
	</nldd-page>
`,
	parameters: { controls: { disable: true } },
};

export const Tinted = {
	render: () => html`
	<nldd-page sticky-header sticky-footer background="tinted" style="height: 400px;">
		${header}
		${content}
		<div slot="footer">${footer}</div>
	</nldd-page>
`,
	parameters: { controls: { disable: true } },
};

export const GecentreerdeDialoog = {
	render: () => html`
	<nldd-page sticky-header sticky-footer style="height: 400px;">
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
