import { html, nothing } from 'lit';
import './number-field.js';

/**
 * De Number Field component is een numeriek invoerveld met decrement en increment knoppen.
 */
export default {
	title: 'Components/Inputs/Number Field',
	component: 'nldd-number-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/number-field/number-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Grootte van het veld',
			table: { defaultValue: { summary: 'md' } },
		},
		width: {
			control: 'text',
			description: 'Width mode: "full" (stretches to container) or any CSS length (e.g. "240px")',
		},
		hideSpinButtons: {
			name: 'hide-spin-buttons',
			control: 'boolean',
			description: 'Verbergt de plus- en minknoppen',
			table: { defaultValue: { summary: false } },
		},
		name: {
			control: 'text',
			description: 'Naam voor formulierverwerking',
		},
		value: {
			control: { type: 'number' },
			description: 'Huidige waarde',
			table: { defaultValue: { summary: 0 } },
		},
		min: {
			control: { type: 'number' },
			description: 'Minimale waarde',
			table: { defaultValue: { summary: '-∞' } },
		},
		max: {
			control: { type: 'number' },
			description: 'Maximale waarde',
			table: { defaultValue: { summary: '∞' } },
		},
		step: {
			control: { type: 'number' },
			description: 'Stapgrootte',
			table: { defaultValue: { summary: 1 } },
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
	},
	args: {
		size: 'md',
		width: '',
		hideSpinButtons: false,
		name: '',
		value: 1,
		min: 0,
		max: 10,
		step: 1,
		accessibleLabel: '',
		invalid: false,
		disabled: false,
	},
};

const Template = ({ size, hideSpinButtons, name, value, min, max, step, width, accessibleLabel, invalid, disabled }: Record<string, any>) => html`
	<nldd-number-field
		value=${value}
		min=${min}
		max=${max}
		step=${step}
		size=${size}
		?invalid=${invalid}
		?disabled=${disabled}
		name=${name}
		?hide-spin-buttons=${hideSpinButtons}
		width=${width || nothing}
		accessible-label=${accessibleLabel || nothing}
	></nldd-number-field>
`;

export const Standaard = {
	render: Template,
	args: {},
};

export const AlleToestanden = {
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			size="sm"
		></nldd-number-field>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			size="md"
		></nldd-number-field>
		<nldd-number-field
			value="0"
			min="0"
			max="10"
		></nldd-number-field>
		<nldd-number-field
			value="10"
			min="0"
			max="10"
		></nldd-number-field>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			disabled
		></nldd-number-field>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			hide-spin-buttons
		></nldd-number-field>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			hide-spin-buttons
			disabled
		></nldd-number-field>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			size="sm"
			hide-spin-buttons
		></nldd-number-field>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			width="240px"
		></nldd-number-field>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			hide-spin-buttons
			width="240px"
		></nldd-number-field>
		<div style="width: 400px;">
			<nldd-number-field
				value="5"
				min="0"
				max="10"
				width="full"
			></nldd-number-field>
		</div>
		<div style="width: 400px;">
			<nldd-number-field
				value="5"
				min="0"
				max="10"
				hide-spin-buttons
				width="full"
			></nldd-number-field>
		</div>
	</div>
`,
	parameters: { controls: { disable: true } },
};
