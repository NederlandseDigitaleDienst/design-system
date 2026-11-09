import { html, nothing } from 'lit';
import './switch.js';
import '../../layout/container/container.js';

/**
 * De Switch component is een toggle control voor aan/uit instellingen.
 */
export default {
	title: 'Components/Inputs/Switch',
	component: 'nldd-switch',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/switch/switch.ts',
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
		size: {
			control: 'select',
			options: ['xs', 'sm'],
			description: 'Grootte van de switch',
			table: { defaultValue: { summary: 'sm' } },
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

	},
	args: {
		color: '',
		size: 'sm',
		checked: false,
		accessibleLabel: 'Switch',
		invalid: false,
		disabled: false,
		required: false,
	},
};

const Template = ({ color, size, checked, accessibleLabel, invalid, disabled, required }: Record<string, any>) => html`
	<nldd-switch
		color=${color || nothing}
		?checked=${checked}
		?invalid=${invalid}
		?required=${required}
		?disabled=${disabled}
		size=${size}
		accessible-label=${accessibleLabel || nothing}
	></nldd-switch>
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
			<nldd-switch
				color="inherit"
				accessible-label="Uit"
			></nldd-switch>
			<nldd-switch
				color="inherit"
				checked
				accessible-label="Aan"
			></nldd-switch>
		</nldd-container>
	`,
};

export const AlleToestanden = {
	render: () => html`
	<nldd-container gap="16">
		<nldd-container
			layout="row"
			gap="32"
		>
			<nldd-switch
				accessible-label="Niet aan"
				size="sm"
			></nldd-switch>
			<nldd-switch
				accessible-label="Aan"
				size="sm"
				checked
			></nldd-switch>
			<nldd-switch
				accessible-label="Uitgeschakeld"
				size="sm"
				disabled
			></nldd-switch>
			<nldd-switch
				accessible-label="Aan en uitgeschakeld"
				size="sm"
				checked
				disabled
			></nldd-switch>
		</nldd-container>
		<nldd-container
			layout="row"
			gap="32"
		>
			<nldd-switch
				accessible-label="Niet aan klein"
				size="xs"
			></nldd-switch>
			<nldd-switch
				accessible-label="Aan klein"
				size="xs"
				checked
			></nldd-switch>
			<nldd-switch
				accessible-label="Uitgeschakeld klein"
				size="xs"
				disabled
			></nldd-switch>
			<nldd-switch
				accessible-label="Aan en uitgeschakeld klein"
				size="xs"
				checked
				disabled
			></nldd-switch>
		</nldd-container>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};
