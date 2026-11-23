import { html, nothing } from 'lit';
import './number-field.js';
import '../../layout/container/container.js';
import '../../layout/spacer/spacer.js';

/**
 * `nldd-number-field` is een numeriek invoerveld met knoppen om de waarde te
 * verlagen en te verhogen.
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
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
		},
		accessibleDescription: {
			name: 'accessible-description',
			control: 'text',
			description: 'Toegankelijke beschrijving voor screen readers, gelezen na de naam, de rol en de toestand. Vervangt nooit het label.',
		},
		accessibleDescribedBy: {
			name: 'accessible-described-by',
			control: false,
			description: "Id's van elementen elders op de pagina die dit element beschrijven, zoals `aria-describedby`, maar doorgegeven aan de control binnenin. Gaat voor `accessible-description`.",
		},
		hideSpinButtons: {
			name: 'hide-spin-buttons',
			control: 'boolean',
			description: 'Verbergt de plus- en minknoppen',
			table: { defaultValue: { summary: false } },
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige staat. Wordt aangekondigd met aria-invalid; er wordt niets voor getekend.',
			table: { defaultValue: { summary: false } },
		},
		name: {
			control: 'text',
			description: 'Naam voor formulierverwerking',
		},
		value: {
			control: { type: 'number' },
			description: 'Huidige waarde. Leeg is geen antwoord: dan gelden min en max niet, alleen required.',
			table: { defaultValue: { summary: '(leeg)' } },
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
		required: {
			control: 'boolean',
			description: 'Er moet een waarde ingevuld zijn; leeg is dan ongeldig',
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
		accessibleLabel: '',
		accessibleDescription: '',
		accessibleDescribedBy: '',
		hideSpinButtons: false,
		invalid: false,
		name: '',
		value: 1,
		min: 0,
		max: 10,
		step: 1,
		required: false,
		disabled: false,
	},
};

const Template = ({ size, width, accessibleLabel, accessibleDescription, hideSpinButtons, invalid, name, value, min, max, step, required, disabled }: Record<string, any>) => html`
	<nldd-number-field
		size=${size}
		width=${width || nothing}
		accessible-label=${accessibleLabel || nothing}
		accessible-description=${accessibleDescription || nothing}
		?hide-spin-buttons=${hideSpinButtons}
		?invalid=${invalid}
		name=${name}
		value=${value ?? nothing}
		min=${min}
		max=${max}
		step=${step}
		?required=${required}
		?disabled=${disabled}
	></nldd-number-field>
`;

export const Standaard = {
	render: Template,
	args: {},
};

export const AlleToestanden = {
	render: () => html`
	<nldd-container>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			size="sm"
		></nldd-number-field>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			size="md"
		></nldd-number-field>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-number-field
			value="0"
			min="0"
			max="10"
		></nldd-number-field>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-number-field
			value="10"
			min="0"
			max="10"
		></nldd-number-field>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			disabled
		></nldd-number-field>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			hide-spin-buttons
		></nldd-number-field>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			hide-spin-buttons
			disabled
		></nldd-number-field>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			size="sm"
			hide-spin-buttons
		></nldd-number-field>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			width="240px"
		></nldd-number-field>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-number-field
			value="5"
			min="0"
			max="10"
			hide-spin-buttons
			width="240px"
		></nldd-number-field>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-container width="400px">
			<nldd-number-field
				value="5"
				min="0"
				max="10"
				width="full"
			></nldd-number-field>
		</nldd-container>
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-container width="400px">
			<nldd-number-field
				value="5"
				min="0"
				max="10"
				hide-spin-buttons
				width="full"
			></nldd-number-field>
		</nldd-container>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};
