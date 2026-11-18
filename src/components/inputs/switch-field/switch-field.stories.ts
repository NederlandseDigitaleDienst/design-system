import { html, nothing } from 'lit';
import './switch-field.js';
import '../../layout/container/container.js';

/**
 * `nldd-switch-field` is een switch met een inline label, voor gebruik in formulieren.
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
		accessibleDescription: '',
		accessibleDescribedBy: '',
	},
};

const Template = ({ color, label, name, value, checked, invalid, disabled, required, accessibleDescription }: Record<string, any>) => html`
	<nldd-switch-field
		color=${color || nothing}
		label=${label}
		name=${name || nothing}
		?checked=${checked}
		?invalid=${invalid}
		?required=${required}
		?disabled=${disabled}
		value=${value}
		accessible-description=${accessibleDescription || nothing}
	></nldd-switch-field>
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
			<nldd-switch-field
				color="content"
				label="Meldingen"
			></nldd-switch-field>
			<nldd-switch-field
				color="content"
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
