import { html, nothing } from 'lit';
import './checkbox.js';
import '../../layout/container/container.js';

/**
 * `nldd-checkbox` laat gebruikers een of meerdere opties selecteren.
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
	},
	argTypes: {
		color: {
			control: 'select',
			options: ['(auto)', 'content'],
			mapping: { '(auto)': '' },
			description: 'Met content krijgt de control de tekstkleur eromheen, voor een gekleurd vlak zoals het paneel van een hero. Anders het accent.',
			table: { defaultValue: { summary: '(auto)' } },
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
		color: '',
		name: '',
		value: 'on',
		checked: false,
		indeterminate: false,
		accessibleLabel: 'Checkbox',
		accessibleDescription: '',
		accessibleDescribedBy: '',
		invalid: false,
		disabled: false,
		required: false,
		decorative: false,
	},
};

const Template = ({ color, name, value, checked, indeterminate, accessibleLabel, accessibleDescription, invalid, disabled, required, decorative }: Record<string, any>) => html`
	<nldd-checkbox
		color=${color || nothing}
		?checked=${checked}
		?indeterminate=${indeterminate}
		?invalid=${invalid}
		?required=${required}
		?disabled=${disabled}
		?decorative=${decorative}
		value=${value}
		name=${name}
		accessible-label=${accessibleLabel || nothing}
		accessible-description=${accessibleDescription || nothing}
	></nldd-checkbox>
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
			<nldd-checkbox
				color="content"
				accessible-label="Niet aangevinkt"
			></nldd-checkbox>
			<nldd-checkbox
				color="content"
				checked
				accessible-label="Aangevinkt"
			></nldd-checkbox>
		</nldd-container>
	`,
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
	<nldd-container
		layout="wrap"
		gap="32"
	>
		<nldd-checkbox accessible-label="Niet aangevinkt"></nldd-checkbox>
		<nldd-checkbox
			checked
			accessible-label="Aangevinkt"
		></nldd-checkbox>
		<nldd-checkbox
			indeterminate
			accessible-label="Onbepaald"
		></nldd-checkbox>
		<nldd-checkbox
			disabled
			accessible-label="Uitgeschakeld"
		></nldd-checkbox>
		<nldd-checkbox
			checked
			disabled
			accessible-label="Aangevinkt en uitgeschakeld"
		></nldd-checkbox>
		<nldd-checkbox
			indeterminate
			disabled
			accessible-label="Onbepaald en uitgeschakeld"
		></nldd-checkbox>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};
