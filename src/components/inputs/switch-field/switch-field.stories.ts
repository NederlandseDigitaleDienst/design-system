import { html, nothing } from 'lit';
import './switch-field.js';
import '../../layout/container/container.js';

/**
 * De Switch Field component is een switch toggle met een inline label voor gebruik in formulieren.
 */
export default {
	title: 'Components/Inputs/Switch Field',
	component: 'nldd-switch-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/switch-field/switch-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		color: {
			control: 'select',
			options: ['(auto)', 'inherit'],
			mapping: { '(auto)': '' },
			description: 'Met inherit krijgt de control de tekstkleur eromheen, voor een gekleurd vlak zoals het paneel van een hero. Anders het accent.',
			table: { defaultValue: { summary: '(auto)' } },
		},
		label: {
			control: 'text',
			description: 'Label tekst',
		},
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

	},
	args: {
		color: '',
		label: 'Switch field',
		name: '',
		value: 'on',
		checked: false,
		invalid: false,
		disabled: false,
		required: false,
	},
};

const Template = ({ color, label, name, value, checked, invalid, disabled, required }: Record<string, any>) => html`
	<nldd-switch-field
		color=${color || nothing}
		label=${label}
		name=${name || nothing}
		?checked=${checked}
		?invalid=${invalid}
		?required=${required}
		?disabled=${disabled}
		value=${value}
	></nldd-switch-field>
`;

export const Standaard = {
	render: Template,
	args: {},
};

export const KleurInherit = {
	name: 'Kleur inherit',
	render: () => html`
		<nldd-container
			layout="wrap"
			gap="32"
			padding="24"
			style="--context-parent-background-color: var(--semantics-surfaces-accent-filled-background-color); background-color: var(--semantics-surfaces-accent-filled-background-color); color: var(--semantics-content-on-accent-filled-color);"
		>
			<nldd-switch-field
				color="inherit"
				label="Meldingen"
			></nldd-switch-field>
			<nldd-switch-field
				color="inherit"
				label="Herinneringen"
				checked
			></nldd-switch-field>
		</nldd-container>
	`,
};

export const AlleToestanden = {
	render: () => html`
	<nldd-container gap="8">
		<nldd-switch-field
			label="Niet aan"
			value="1"
		></nldd-switch-field>
		<nldd-switch-field
			label="Aan"
			value="2"
			checked
		></nldd-switch-field>
		<nldd-switch-field
			label="Uitgeschakeld"
			value="3"
			disabled
		></nldd-switch-field>
		<nldd-switch-field
			label="Aan en uitgeschakeld"
			value="4"
			checked
			disabled
		></nldd-switch-field>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};
