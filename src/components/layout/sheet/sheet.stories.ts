import { html, nothing } from 'lit';
import { useArgs } from 'storybook/preview-api';
import './sheet.js';
import '../../navigation/top-title-bar/top-title-bar.js';
import '../../layout/page/page.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';
import '../../content/rich-text/rich-text.js';
import '../../layout/page-sections/simple-section/simple-section.js';
import '../../layout/container/container.js';

/**
 * De Sheet is een overlay-component die vanuit een zijkant of de onderkant van
 * het scherm inschuift. Hij is gebaseerd op het native `<dialog>`-element.
 */
export default {
	title: 'Components/Layout/Sheet',
	component: 'nldd-sheet',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/sheet/sheet.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	args: {
		width: '',
		height: '',
		placement: 'right',
		accessibleLabel: '',
		open: false,
	},
	argTypes: {
		width: {
			control: 'text',
			description: 'Breedte van een zijsheet (`left`/`right`) als CSS-lengte, bijvoorbeeld `480px` of `32rem`. Geldt vanaf md, en niet bij `placement="bottom"`. Nooit breder dan het scherm min de marges.',
		},
		height: {
			control: 'text',
			description: 'Hoogte van een bottom sheet, en van elke sheet op sm: `full`, `fit-content`, of een CSS-lengte zoals `50dvh`, `480px` of `50%`. Nooit hoger dan het scherm min de bovenmarge. Geldt niet voor een zijsheet vanaf md.',
			table: { defaultValue: { summary: 'full' } },
		},
		placement: {
			control: 'select',
			options: ['left', 'right', 'bottom'],
			description: 'Van welke kant de sheet inschuift. Op sm is elke sheet een bottom sheet.',
			table: { defaultValue: { summary: 'right' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van de sheet. Zonder label neemt de sheet de tekst van zijn titelbalk over.',
			table: { defaultValue: { summary: 'titelbalk, anders "Venster"' } },
		},
		open: {
			control: 'boolean',
			description: 'Of de sheet open is. Aanzetten opent de sheet; sluit de sheet zichzelf (Escape, de achtergrond, de sluitknop), dan gaat `open` vanzelf weer uit.',
			table: { defaultValue: { summary: false } },
		},
	},
};

const openNext = (e: Record<string, any>) => e.currentTarget.nextElementSibling.show();

// Sets the property rather than the arg: a story further down a docs page renders
// with its initial args and does not redraw when they change. The open and close
// events keep the control in step.
const setNextOpen = (e: Record<string, any>) => { e.currentTarget.nextElementSibling.open = true; };

const pageContent = html`
	<nldd-simple-section>
		<nldd-rich-text>
			<p>Dit is de inhoud van de sheet.</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
			<p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
			<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
			<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.</p>
			<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa.</p>
		</nldd-rich-text>
	</nldd-simple-section>
`;

const Template = (args: Record<string, any>) => {
	const [, updateArgs] = useArgs();
	return html`
		<nldd-button text="Open sheet" @click=${setNextOpen}></nldd-button>
		<nldd-sheet
			width=${args.width || nothing}
			height=${args.height || nothing}
			placement=${args.placement}
			accessible-label=${args.accessibleLabel || nothing}
			?open=${args.open}
			@open=${() => updateArgs({ open: true })}
			@close=${() => updateArgs({ open: false })}
		>
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Sheet titel"
					dismiss-text="Sluit"
				></nldd-top-title-bar>
				${pageContent}
			</nldd-page>
		</nldd-sheet>
	`;
};

export const Standaard = {
	render: Template,
};

export const Rechts = {
	render: Template,
	args: { placement: 'right' },
	parameters: { controls: { disable: true } },
};

export const Links = {
	render: Template,
	args: { placement: 'left' },
	parameters: { controls: { disable: true } },
};

export const Onder = {
	render: Template,
	args: { placement: 'bottom' },
	parameters: { controls: { disable: true } },
};

export const MetTerugknop = {
	render: () => html`
		<nldd-button text="Open sheet" @click=${openNext}></nldd-button>
		<nldd-sheet placement="right">
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Detailpagina"
					back-text="Overzicht"
					dismiss-text="Sluit"
				></nldd-top-title-bar>
				${pageContent}
			</nldd-page>
		</nldd-sheet>
	`,
	parameters: {
		controls: { disable: true },
		docs: { description: { story: 'Sheet met terugknop in de werkbalk.' } },
	},
};


export const MetStickyFooter = {
	render: () => html`
		<nldd-button text="Open sheet" @click=${openNext}></nldd-button>
		<nldd-sheet placement="right">
			<nldd-page sticky-header sticky-footer>
				<nldd-top-title-bar
					slot="header"
					text="Sheet met footer"
					dismiss-text="Sluit"
				></nldd-top-title-bar>
				${pageContent}
				<nldd-container slot="footer" padding="16">
					<nldd-button-group orientation="vertical">
						<nldd-button variant="primary" text="Opslaan" width="full"></nldd-button>
						<nldd-button variant="secondary" text="Annuleer" width="full"></nldd-button>
					</nldd-button-group>
				</nldd-container>
			</nldd-page>
		</nldd-sheet>
	`,
	parameters: {
		controls: { disable: true },
		docs: { description: { story: 'Sheet met een sticky footer voor acties.' } },
	},
};
