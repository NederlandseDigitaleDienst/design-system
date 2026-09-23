import { html, nothing } from 'lit';
import { useArgs } from 'storybook/preview-api';
import './window.js';
import '../../layout/page/page.js';
import '../../navigation/top-title-bar/top-title-bar.js';
import '../../content/rich-text/rich-text.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';
import '../../layout/page-sections/simple-section/simple-section.js';
import '../../layout/container/container.js';

/**
 * Een zwevend venster gebaseerd op het native `<dialog>`-element.
 * Kan modaal of niet-modaal worden weergegeven. Positioneerbaar via
 * CSS-waarden.
 *
 * ## Gebruik
 * ```html
 * <nldd-window>
 *   <nldd-page sticky-header>
 *     <nldd-top-title-bar slot="header" text="Venster" dismiss-text="Sluit"></nldd-top-title-bar>
 *     <nldd-simple-section>
 *       <p>Inhoud</p>
 *     </nldd-simple-section>
 *   </nldd-page>
 * </nldd-window>
 * ```
 */
export default {
	title: 'Components/Layout/Window',
	component: 'nldd-window',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/window/window.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'experimental' },
	},
	args: {
		scheme: 'inherit',
		width: '',
		height: '',
		top: '',
		right: '',
		bottom: '',
		left: '',
		centered: false,
		accessibleLabel: '',
		noLightDismiss: false,
		open: false,
	},
	argTypes: {
		scheme: {
			control: 'select',
			options: ['inherit', 'light', 'dark'],
			description: 'Kleurschema. `inherit` volgt de omgeving, `light` en `dark` zetten het vast.',
			table: { defaultValue: { summary: 'inherit' } },
		},
		width: {
			control: 'text',
			description: 'Breedte als CSS-lengte. Nooit breder dan het scherm.',
			table: { defaultValue: { summary: '640px' } },
		},
		height: {
			control: 'text',
			description: 'Hoogte als CSS-lengte. Zonder hoogte is het venster zo hoog als zijn inhoud.',
		},
		top: {
			control: 'text',
			description: 'Afstand tot de bovenrand van het scherm, als CSS-waarde.',
		},
		right: {
			control: 'text',
			description: 'Afstand tot de rechterrand van het scherm, als CSS-waarde.',
		},
		bottom: {
			control: 'text',
			description: 'Afstand tot de onderrand van het scherm, als CSS-waarde.',
		},
		left: {
			control: 'text',
			description: 'Afstand tot de linkerrand van het scherm, als CSS-waarde.',
		},
		centered: {
			control: 'boolean',
			description: 'Centreert het venster op beide assen. Een rand die je zet wint op zijn eigen as: `centered top="0"` staat bovenaan, horizontaal gecentreerd.',
			table: { defaultValue: { summary: false } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van het venster. Zonder label neemt het venster de tekst van zijn titelbalk over.',
			table: { defaultValue: { summary: 'titelbalk, anders "Venster"' } },
		},
		noLightDismiss: {
			name: 'no-light-dismiss',
			control: 'boolean',
			description: 'Een klik naast het venster sluit het niet. Escape en de sluitknop blijven werken.',
			table: { defaultValue: { summary: false } },
		},
		open: {
			control: 'boolean',
			description: 'Of het venster open is. Aanzetten opent het venster; sluit het venster zichzelf (Escape, de achtergrond, de sluitknop), dan gaat `open` vanzelf weer uit.',
			table: { defaultValue: { summary: false } },
		},
	},
};

const openNext = (e: Event) => ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement & { show(): void }).show();

// Sets the property rather than the arg: a story further down a docs page renders
// with its initial args and does not redraw when they change. The open and close
// events keep the control in step.
const setNextOpen = (e: Event) => { ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement & { open: boolean }).open = true; };

const pageContent = html`
	<nldd-simple-section>
		<nldd-rich-text>
			<p>Dit is de inhoud van het venster.</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
			Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
		</nldd-rich-text>
	</nldd-simple-section>
`;

const Template = (args: Record<string, unknown>) => {
	const [, updateArgs] = useArgs();
	return html`
		<nldd-button text="Open venster" @click=${setNextOpen}></nldd-button>
		<nldd-window
			scheme=${args.scheme || nothing}
			width=${args.width || nothing}
			height=${args.height || nothing}
			top=${args.top || nothing}
			right=${args.right || nothing}
			bottom=${args.bottom || nothing}
			left=${args.left || nothing}
			?centered=${args.centered}
			accessible-label=${args.accessibleLabel || nothing}
			?no-light-dismiss=${args.noLightDismiss}
			?open=${args.open}
			@open=${() => updateArgs({ open: true })}
			@close=${() => updateArgs({ open: false })}
		>
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Venstertitel"
					dismiss-text="Sluit"
				></nldd-top-title-bar>
				${pageContent}
			</nldd-page>
		</nldd-window>
	`;
};

export const Standaard = {
	render: Template,
};


export const Gepositioneerd = {
	render: () => html`
		<nldd-button text="Open rechtsonder" @click=${openNext}></nldd-button>
		<nldd-window
			right="32px"
			bottom="32px"
			width="400px"
			accessible-label="Gepositioneerd venster"
		>
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Rechtsonder"
					dismiss-text="Sluit"
				></nldd-top-title-bar>
				${pageContent}
			</nldd-page>
		</nldd-window>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Venster gepositioneerd rechtsonder via `right` en `bottom` attributen.',
			},
		},
	},
};

export const MetFooter = {
	render: () => html`
		<nldd-button text="Open venster met footer" @click=${openNext}></nldd-button>
		<nldd-window
			height="400px"
			accessible-label="Venster met footer"
		>
			<nldd-page sticky-header sticky-footer>
				<nldd-top-title-bar
					slot="header"
					text="Venster met acties"
					dismiss-text="Sluit"
				></nldd-top-title-bar>
				${pageContent}
				<nldd-container slot="footer" padding-inline="16" padding-bottom="16">
					<nldd-button-group orientation="horizontal">
						<nldd-button variant="primary" text="Opslaan"></nldd-button>
						<nldd-button variant="secondary" text="Annuleer"></nldd-button>
					</nldd-button-group>
				</nldd-container>
			</nldd-page>
		</nldd-window>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Modaal venster met sticky footer voor acties, via nldd-page met sticky-footer. Hier is `height` gezet zodat de footer onderaan kleeft.',
			},
		},
	},
};
