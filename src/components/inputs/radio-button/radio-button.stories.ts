import { html, nothing } from 'lit';
import './radio-button.js';

/**
 * De Radio Button component wordt gebruikt voor exclusieve keuzes binnen een groep opties.
 * Slechts één radio button binnen een groep (met dezelfde `name`) kan tegelijkertijd geselecteerd zijn.
 *
 * Dit component tekent alleen de vorm. Wil je een zichtbaar label ernaast, gebruik
 * dan `nldd-radio-button-field`, en voor een hele groep `nldd-radio-button-group`.
 *
 * Zet de opties van een groep in een container met `role="radiogroup"` en een eigen
 * naam: een schermlezer telt de opties daar. Een kale `<fieldset>` is een group en
 * geen radiogroup, en dan blijven ze ongeteld.
 *
 * ## Gebruik
 * ```html
 * <fieldset role="radiogroup" aria-labelledby="optie-label">
 *   <legend id="optie-label">Kies een optie</legend>
 *   <nldd-radio-button name="option" value="1" accessible-label="Optie 1"></nldd-radio-button>
 *   <nldd-radio-button name="option" value="2" accessible-label="Optie 2"></nldd-radio-button>
 * </fieldset>
 * ```
 */
export default {
	title: 'Components/Inputs/Radio Button',
	component: 'nldd-radio-button',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/radio-button/radio-button.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		name: {
			control: 'text',
			description: 'Naam voor formulierverwerking (groepeert radio buttons)',
		},
		value: {
			control: 'text',
			description: 'Waarde voor formulierverwerking',
		},
		checked: {
			control: 'boolean',
			description: 'Aangevinkte toestand',
			table: { defaultValue: { summary: false } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige staat. Wordt aangekondigd met aria-invalid; er wordt niets voor getekend.',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde toestand',
			table: { defaultValue: { summary: false } },
		},
		required: {
			control: 'boolean',
			description: 'Verplichte staat.',
			table: { defaultValue: { summary: false } },
		},
		decorative: {
			control: 'boolean',
			description: 'Tekent de vorm zonder input: geen focus, geen naam/waarde, niets aangekondigd. Voor een control die zijn staat elders heeft, zoals een lijstrij die zelf de radio is.',
			table: { defaultValue: { summary: false } },
		},

	},
	args: {
		name: 'demo',
		value: 'option-1',
		checked: false,
		accessibleLabel: 'Radio button',
		invalid: false,
		disabled: false,
		required: false,
		decorative: false,
	},
};

const Template = ({ name, value, checked, accessibleLabel, invalid, disabled, required, decorative }: Record<string, any>) => html`
	<nldd-radio-button
		?checked=${checked}
		?invalid=${invalid}
		?required=${required}
		?disabled=${disabled}
		?decorative=${decorative}
		name=${name}
		value=${value}
		accessible-label=${accessibleLabel || nothing}
	></nldd-radio-button>
`;

export const Standaard = {
	render: Template,
	args: {},
};

/* Elke toestand krijgt een eigen naam. Op de docs-pagina staan deze voorbeelden
 * onder elkaar in één document, en radio buttons met dezelfde naam vormen daar
 * samen één groep: dan zou er van al deze demo's maar één aangevinkt kunnen
 * zijn en maar één te focussen met Tab. */
export const ToestandChecked = {
	name: 'Toestand checked',
	render: Template,
	args: { checked: true, name: 'demo-geselecteerd' },
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: Template,
	args: { disabled: true, name: 'demo-uitgeschakeld' },
};

export const ToestandCheckedEnDisabled = {
	name: 'Toestand checked en disabled',
	render: Template,
	args: { checked: true, disabled: true, name: 'demo-geselecteerd-uitgeschakeld' },
};

export const RadioGroep = {
	render: () => html`
	<fieldset role="radiogroup" aria-labelledby="radio-groep-label" style="border: none; padding: 0; margin: 0;">
		<legend id="radio-groep-label" style="font-size: 16px; font-weight: 550; margin-bottom: 12px;">Kies een optie</legend>
		<div style="display: flex; flex-direction: column; gap: 12px;">
			<nldd-radio-button name="groep" value="1" checked accessible-label="Optie 1"></nldd-radio-button>
			<nldd-radio-button name="groep" value="2" accessible-label="Optie 2"></nldd-radio-button>
			<nldd-radio-button name="groep" value="3" accessible-label="Optie 3"></nldd-radio-button>
			<nldd-radio-button name="groep" value="4" disabled accessible-label="Optie 4 (uitgeschakeld)"></nldd-radio-button>
		</div>
	</fieldset>
`,
	parameters: { controls: { disable: true } },
};

export const AlleToestanden = {
	render: () => html`
	<div style="display: flex; gap: 2rem; align-items: center;">
		<nldd-radio-button accessible-label="Niet geselecteerd"></nldd-radio-button>
		<nldd-radio-button checked accessible-label="Geselecteerd"></nldd-radio-button>
		<nldd-radio-button disabled accessible-label="Uitgeschakeld"></nldd-radio-button>
		<nldd-radio-button checked disabled accessible-label="Geselecteerd en uitgeschakeld"></nldd-radio-button>
	</div>
`,
	parameters: { controls: { disable: true } },
};
