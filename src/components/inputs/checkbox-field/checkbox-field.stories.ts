import { html, nothing } from 'lit';
import './checkbox-field.js';
import '../../layout/container/container.js';

/**
 * De Checkbox Field component is een checkbox met een inline label voor gebruik in formulieren.
 */
export default {
	title: 'Components/Inputs/Checkbox Field',
	component: 'nldd-checkbox-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/checkbox-field/checkbox-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		color: {
			control: 'select',
			options: ['(auto)', 'content'],
			mapping: { '(auto)': '' },
			description: 'Met content krijgt de control de tekstkleur eromheen, voor een gekleurd vlak zoals het paneel van een hero. Anders het accent.',
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
		indeterminate: {
			control: 'boolean',
			description: 'Onbepaalde toestand (gedeeltelijk geselecteerd)',
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
		label: 'Checkbox field',
		name: '',
		value: 'on',
		checked: false,
		indeterminate: false,
		invalid: false,
		disabled: false,
		required: false,
	},
};

const Template = ({ color, label, name, value, checked, indeterminate, invalid, disabled, required }: Record<string, any>) => html`
	<nldd-checkbox-field
		color=${color || nothing}
		label=${label}
		name=${name || nothing}
		?checked=${checked}
		?indeterminate=${indeterminate}
		?invalid=${invalid}
		?required=${required}
		?disabled=${disabled}
		value=${value}
	></nldd-checkbox-field>
`;

export const Standaard = {
	render: Template,
	args: {},
};

export const KleurContent = {
	name: 'Kleur content',
	render: () => html`
		<nldd-container
			layout="wrap"
			gap="32"
			padding="24"
			style="--context-background-color: var(--semantics-surfaces-accent-filled-background-color); background-color: var(--semantics-surfaces-accent-filled-background-color); color: var(--semantics-content-on-accent-filled-color); --context-content-color: var(--semantics-content-on-accent-filled-color);"
		>
			<nldd-checkbox-field
				color="content"
				label="Stuur me een bevestiging"
			></nldd-checkbox-field>
			<nldd-checkbox-field
				color="content"
				label="Bewaar mijn gegevens"
				checked
			></nldd-checkbox-field>
		</nldd-container>
	`,
};

export const AlleToestanden = {
	render: () => html`
	<nldd-container gap="8">
		<nldd-checkbox-field
			label="Niet aangevinkt"
			value="1"
		></nldd-checkbox-field>
		<nldd-checkbox-field
			label="Aangevinkt"
			value="2"
			checked
		></nldd-checkbox-field>
		<nldd-checkbox-field
			label="Onbepaald"
			value="3"
			indeterminate
		></nldd-checkbox-field>
		<nldd-checkbox-field
			label="Uitgeschakeld"
			value="4"
			disabled
		></nldd-checkbox-field>
		<nldd-checkbox-field
			label="Aangevinkt en uitgeschakeld"
			value="5"
			checked
			disabled
		></nldd-checkbox-field>
		<nldd-checkbox-field
			label="Onbepaald en uitgeschakeld"
			value="6"
			indeterminate
			disabled
		></nldd-checkbox-field>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};
