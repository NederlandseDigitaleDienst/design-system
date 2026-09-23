import { html, nothing } from 'lit';
import { useArgs } from 'storybook/preview-api';
import './popover.js';
import '../container/container.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';
import '../../forms/form/form.js';
import '../../forms/form-field/form-field.js';
import '../../forms/form-actions/form-actions.js';
import '../../inputs/text-field/text-field.js';
import '../../content/rich-text/rich-text.js';

/**
 * Een non-modal floating panel verankerd aan een trigger-element.
 * Gebouwd op de native Popover API met Floating UI voor positionering.
 *
 * ## Gebruik
 * ```html
 * <nldd-button id="trigger" text="Open"></nldd-button>
 *
 * <nldd-popover anchor="trigger" accessible-label="Voorbeeld">
 *   <nldd-container padding="16">
 *     <nldd-rich-text><p>Inhoud</p></nldd-rich-text>
 *   </nldd-container>
 * </nldd-popover>
 * ```
 *
 * Klikken op het anchor-element opent of sluit de popover (toggle). Esc en
 * klik buiten sluiten ook (native popover light-dismiss). Voor een custom
 * focus-target binnen de popover: gebruik `autofocus` op het gewenste
 * child-element.
 */
export default {
	title: 'Components/Layout/Popover',
	component: 'nldd-popover',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/popover/popover.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'experimental' },
	},
	args: {
		width: '',
		smFullHeight: false,
		placement: 'bottom-start',
		top: '',
		right: '',
		bottom: '',
		left: '',
		centered: false,
		accessibleLabel: 'Voorbeeld popover',
		open: false,
	},
	argTypes: {
		width: {
			control: 'text',
			description: 'Breedte als CSS-lengte, bijvoorbeeld `400px`. Een breedte uit de inhoud (`fit-content`, `auto`) wordt genegeerd.',
			table: { defaultValue: { summary: '320px' } },
		},
		smFullHeight: {
			name: 'sm-full-height',
			control: 'boolean',
			description: 'Op sm, waar de popover een bottom sheet is, de volle hoogte vullen in plaats van mee te krimpen met de inhoud.',
			table: { defaultValue: { summary: false } },
		},
		placement: {
			control: 'select',
			options: [
				'bottom-start', 'bottom', 'bottom-end',
				'top-start', 'top', 'top-end',
				'right-start', 'right', 'right-end',
				'left-start', 'left', 'left-end',
			],
			description: 'Plaats ten opzichte van het anker.',
			table: { defaultValue: { summary: 'bottom-start' } },
		},
		top: {
			control: 'text',
			description: 'Afstand tot de bovenrand van het scherm. Met een rand of `centered` staat de popover los van zijn anker.',
		},
		right: {
			control: 'text',
			description: 'Afstand tot de rechterrand van het scherm. Zie `top`.',
		},
		bottom: {
			control: 'text',
			description: 'Afstand tot de onderrand van het scherm. Zie `top`.',
		},
		left: {
			control: 'text',
			description: 'Afstand tot de linkerrand van het scherm. Zie `top`.',
		},
		centered: {
			control: 'boolean',
			description: 'Centreert de popover op het scherm, los van zijn anker. Een rand die je zet wint op zijn eigen as.',
			table: { defaultValue: { summary: false } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van de popover. Verplicht: zonder label heet elke popover "Popover".',
			table: { defaultValue: { summary: 'Popover' } },
		},
		open: {
			control: 'boolean',
			description: 'Of de popover open is. Aanzetten opent hem bij zijn anker; sluit hij zichzelf (Escape, een klik erbuiten, het anker), dan gaat `open` vanzelf weer uit.',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = ({ width, smFullHeight, placement, top, right, bottom, left, centered, accessibleLabel, open }: Record<string, any>) => {
	const [, updateArgs] = useArgs();
	return html`
		<nldd-button id="trigger-default" text="Open popover"></nldd-button>
		<nldd-popover
			width=${width || nothing}
			?sm-full-height=${smFullHeight}
			anchor="trigger-default"
			placement=${placement}
			top=${top || nothing}
			right=${right || nothing}
			bottom=${bottom || nothing}
			left=${left || nothing}
			?centered=${centered}
			accessible-label=${accessibleLabel}
			?open=${open}
			@open=${() => updateArgs({ open: true })}
			@close=${() => updateArgs({ open: false })}
		>
			<nldd-container padding="16">
				<nldd-rich-text>
					<p>Dit is een eenvoudige popover. Klik buiten of druk op Esc om te sluiten.</p>
				</nldd-rich-text>
			</nldd-container>
		</nldd-popover>
	`;
};

export const Standaard = {
	render: Template,
};

/* eslint-disable lit-a11y/no-autofocus -- de popover leest [autofocus] als gedocumenteerde focus-target-API bij openen */
export const MetFormulier = {
	render: () => html`
		<nldd-button id="trigger-form" text="Open form"></nldd-button>

		<nldd-popover
			anchor="trigger-form"
			accessible-label="Filter instellingen"
		>
			<nldd-container padding="16">
				<nldd-form novalidate>
					<nldd-form-field label="Naam">
						<nldd-text-field autofocus></nldd-text-field>
					</nldd-form-field>
					<nldd-form-field label="E-mail">
						<nldd-text-field type="email"></nldd-text-field>
					</nldd-form-field>
					<nldd-form-actions>
						<nldd-button-group>
							<nldd-button variant="primary" type="submit" text="Pas toe"></nldd-button>
						</nldd-button-group>
					</nldd-form-actions>
				</nldd-form>
			</nldd-container>
		</nldd-popover>
	`,
	parameters: { controls: { disable: true } },
};
/* eslint-enable lit-a11y/no-autofocus */

export const Plaatsingen = {
	render: () => html`
		<div style="display: flex; gap: 1rem; align-items: center; justify-content: center; min-height: 320px;">
			<nldd-button id="trigger-placement-bottom-start" text="Bottom start"></nldd-button>
			<nldd-popover anchor="trigger-placement-bottom-start" placement="bottom-start" accessible-label="Bottom start">
				<nldd-container padding="16"><nldd-rich-text><p>placement="bottom-start"</p></nldd-rich-text></nldd-container>
			</nldd-popover>

			<nldd-button id="trigger-placement-top-start" text="Top start"></nldd-button>
			<nldd-popover anchor="trigger-placement-top-start" placement="top-start" accessible-label="Top start">
				<nldd-container padding="16"><nldd-rich-text><p>placement="top-start"</p></nldd-rich-text></nldd-container>
			</nldd-popover>

			<nldd-button id="trigger-placement-right" text="Right"></nldd-button>
			<nldd-popover anchor="trigger-placement-right" placement="right" accessible-label="Right">
				<nldd-container padding="16"><nldd-rich-text><p>placement="right"</p></nldd-rich-text></nldd-container>
			</nldd-popover>

			<nldd-button id="trigger-placement-left" text="Left"></nldd-button>
			<nldd-popover anchor="trigger-placement-left" placement="left" accessible-label="Left">
				<nldd-container padding="16"><nldd-rich-text><p>placement="left"</p></nldd-rich-text></nldd-container>
			</nldd-popover>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
