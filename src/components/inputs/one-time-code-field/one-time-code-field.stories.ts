import { action } from 'storybook/actions';
import { html, nothing } from 'lit';
import './one-time-code-field.js';
import '../../forms/form/form.js';
import '../../forms/form-field/form-field.js';
import '../../forms/form-actions/form-actions.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';
import '../../layout/container/container.js';

export default {
	title: 'Components/Inputs/One-Time Code Field',
	component: 'nldd-one-time-code-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/one-time-code-field/one-time-code-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	args: {
		size: 'md',
		centered: false,
		length: 6,
		format: '',
		accessibleLabel: 'Code uit de sms',
		invalid: false,
		readonly: false,
		disabled: false,
		value: '',
		type: 'numeric',
		uppercase: false,
		required: false,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Maat van de vakjes',
			table: { defaultValue: { summary: 'md' } },
		},
		centered: {
			control: 'boolean',
			description: 'Zet de vakjes in het midden van de rij',
			table: { defaultValue: { summary: false } },
		},
		length: {
			control: 'number',
			description: 'Aantal tekens van de code',
			table: { defaultValue: { summary: 6 } },
		},
		format: {
			control: 'text',
			description: 'Vorm van een code in groepen, zoals ###-###; elke # is een vakje en wint van length',
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam; een nldd-form-field zet hem zelf',
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige toestand',
			table: { defaultValue: { summary: false } },
		},
		readonly: {
			control: 'boolean',
			description: 'Alleen-lezen',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde toestand',
			table: { defaultValue: { summary: false } },
		},
		value: {
			control: 'text',
			description: 'De code',
		},
		type: {
			control: 'select',
			options: ['numeric', 'alphanumeric'],
			description: 'Alleen cijfers, of letters en cijfers',
			table: { defaultValue: { summary: 'numeric' } },
		},
		uppercase: {
			control: 'boolean',
			description: 'Maakt letters hoofdletters, in de vakjes en in de waarde; alleen bij alphanumeric',
			table: { defaultValue: { summary: false } },
		},
		required: {
			control: 'boolean',
			description: 'Verplicht; een code die niet af is telt ook als ongeldig',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = ({ size, centered, length, format, accessibleLabel, invalid, readonly, disabled, value, type, uppercase, required }: Record<string, any>) => html`
	<nldd-one-time-code-field
		size=${size || nothing}
		?centered=${centered}
		length=${length ?? nothing}
		format=${format || nothing}
		accessible-label=${accessibleLabel || nothing}
		?invalid=${invalid}
		?readonly=${readonly}
		?disabled=${disabled}
		.value=${value ?? ''}
		type=${type || nothing}
		?uppercase=${uppercase}
		?required=${required}
		@input=${action('input')}
		@change=${action('change')}
		@nldd-complete=${action('nldd-complete')}
	></nldd-one-time-code-field>
`;

export const Standaard = {
	render: Template,
};

export const Grootten = {
	render: () => html`
	<nldd-container gap="16">
		<nldd-one-time-code-field
			size="sm"
			accessible-label="Code uit de sms"
		></nldd-one-time-code-field>
		<nldd-one-time-code-field accessible-label="Code uit de sms"></nldd-one-time-code-field>
		<nldd-one-time-code-field
			size="lg"
			accessible-label="Code uit de sms"
		></nldd-one-time-code-field>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};

export const AlleToestanden = {
	render: () => html`
	<nldd-container gap="16">
		<nldd-one-time-code-field
			accessible-label="Neutraal"
			value="123"
		></nldd-one-time-code-field>
		<nldd-one-time-code-field
			accessible-label="Ongeldig"
			value="123456"
			invalid
		></nldd-one-time-code-field>
		<nldd-one-time-code-field
			accessible-label="Alleen-lezen"
			value="123456"
			readonly
		></nldd-one-time-code-field>
		<nldd-one-time-code-field
			accessible-label="Uitgeschakeld"
			value="123456"
			disabled
		></nldd-one-time-code-field>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};

export const MetFormat = {
	render: () => html`
	<nldd-container gap="16">
		<nldd-one-time-code-field
			accessible-label="Code uit de brief"
			format="###-###"
		></nldd-one-time-code-field>
		<nldd-one-time-code-field
			accessible-label="Activeringscode"
			type="alphanumeric"
			uppercase
			format="#### ####"
		></nldd-one-time-code-field>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};

export const TypeAlphanumeric = {
	name: 'Type alphanumeric',
	render: () => html`
	<nldd-one-time-code-field
		accessible-label="Activeringscode"
		type="alphanumeric"
		length="8"
		uppercase
	></nldd-one-time-code-field>
`,
	parameters: { controls: { disable: true } },
};

export const InEenFormulier = {
	render: () => html`
	<nldd-form novalidate>
		<nldd-form-field
			label="Code uit de sms"
			supporting-label="We hebben een code van 6 cijfers gestuurd"
		>
			<nldd-one-time-code-field
				name="code"
				required
			></nldd-one-time-code-field>
		</nldd-form-field>
		<nldd-form-actions>
			<nldd-button-group>
				<nldd-button
					appearance="primary"
					type="submit"
					text="Bevestig"
				></nldd-button>
			</nldd-button-group>
		</nldd-form-actions>
	</nldd-form>
`,
	parameters: { controls: { disable: true } },
};
