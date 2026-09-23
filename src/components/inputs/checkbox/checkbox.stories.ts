import { html, nothing } from 'lit';
import './checkbox.js';

/**
 * De Checkbox component stelt gebruikers in staat om een of meerdere opties te selecteren.
 *
 * ## Gebruik
 * ```html
 * <nldd-checkbox accessible-label="Ik ga akkoord"></nldd-checkbox>
 * ```
 */
export default {
	title: 'Components/Inputs/Checkbox',
	component: 'nldd-checkbox',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/checkbox/checkbox.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		name: {
			control: 'text',
			description: 'Naam voor formulierverwerking',
		},
		value: {
			control: 'text',
			description: 'Waarde voor formulierverwerking',
			table: { defaultValue: { summary: 'on' } },
		},
		checked: {
			control: 'boolean',
			description: 'Aangevinkte toestand',
			table: { defaultValue: { summary: false } },
		},
		indeterminate: {
			control: 'boolean',
			description: 'Onbepaalde toestand (gedeeltelijk geselecteerd)',
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
			description: 'Tekent het vakje zonder input: geen focus, geen naam/waarde, niets aangekondigd. Voor een control die zijn staat elders heeft, zoals een lijstrij die zelf de checkbox is.',
			table: { defaultValue: { summary: false } },
		},

	},
	args: {
		name: '',
		value: 'on',
		checked: false,
		indeterminate: false,
		accessibleLabel: 'Checkbox',
		invalid: false,
		disabled: false,
		required: false,
		decorative: false,
	},
};

const Template = ({ name, value, checked, indeterminate, accessibleLabel, invalid, disabled, required, decorative }: Record<string, any>) => html`
	<nldd-checkbox
		?checked=${checked}
		?indeterminate=${indeterminate}
		?invalid=${invalid}
		?required=${required}
		?disabled=${disabled}
		?decorative=${decorative}
		value=${value}
		name=${name}
		accessible-label=${accessibleLabel || nothing}
	></nldd-checkbox>
`;

export const Standaard = {
	render: Template,
	args: {},
};

export const ToestandChecked = {
	name: 'Toestand checked',
	render: Template,
	args: { checked: true },
};

export const ToestandIndeterminate = {
	name: 'Toestand indeterminate',
	render: Template,
	args: { indeterminate: true },
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: Template,
	args: { disabled: true },
};

export const ToestandCheckedEnDisabled = {
	name: 'Toestand checked en disabled',
	render: Template,
	args: { checked: true, disabled: true },
};

export const AlleToestanden = {
	render: () => html`
	<div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
		<nldd-checkbox accessible-label="Niet aangevinkt"></nldd-checkbox>
		<nldd-checkbox checked accessible-label="Aangevinkt"></nldd-checkbox>
		<nldd-checkbox indeterminate accessible-label="Onbepaald"></nldd-checkbox>
		<nldd-checkbox disabled accessible-label="Uitgeschakeld"></nldd-checkbox>
		<nldd-checkbox checked disabled accessible-label="Aangevinkt en uitgeschakeld"></nldd-checkbox>
		<nldd-checkbox indeterminate disabled accessible-label="Onbepaald en uitgeschakeld"></nldd-checkbox>
	</div>
`,
	parameters: { controls: { disable: true } },
};
