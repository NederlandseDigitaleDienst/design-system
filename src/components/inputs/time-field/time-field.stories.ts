import { html, nothing } from 'lit';
import './time-field.ts';
import '../../forms/form-field/form-field.ts';
import '../../layout/container/container.js';
import '../../content/text/text.js';
import '../../layout/spacer/spacer.js';

/**
 * `nldd-time-field` is een tekstveld voor een tijd, met een tijdkiezer in een
 * popover. De waarde is altijd `HH:mm`, in 24 uur.
 */
export default {
	title: 'Components/Inputs/Time Field',
	component: 'nldd-time-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/time-field/time-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
	},
	args: {
		size: 'md',
		width: '',
		placeholder: '',
		accessibleLabel: '',
		accessibleDescription: '',
		accessibleDescribedBy: '',
		noPicker: false,
		valid: false,
		invalid: false,
		readonly: false,
		disabled: false,
		name: '',
		value: '09:30',
		min: '',
		max: '',
		step: 1,
		required: false,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Componentmaat',
			table: { defaultValue: { summary: 'md' } },
		},
		width: {
			control: 'text',
			description: "Breedte: 'full' of een eigen CSS-lengte. Leeg is precies breed genoeg voor een tijd. 'fit-content' laat de ruimte voor het validatie-icoon weg en groeit weer zodra het veld valid of invalid wordt.",
		},
		placeholder: {
			control: 'text',
			description: 'Placeholdertekst',
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor de interne input',
			table: { defaultValue: { summary: 'Tijd' } },
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
		noPicker: {
			name: 'no-picker',
			control: 'boolean',
			description: 'Verbergt de picker-knop',
			table: { defaultValue: { summary: false } },
		},
		valid: {
			control: 'boolean',
			description: 'Markeert het veld als geldig',
			table: { defaultValue: { summary: false } },
		},
		invalid: {
			control: 'boolean',
			description: 'Markeert het veld als ongeldig',
			table: { defaultValue: { summary: false } },
		},
		readonly: {
			control: 'boolean',
			description: 'Alleen-lezen staat',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat',
			table: { defaultValue: { summary: false } },
		},
		name: {
			control: 'text',
			description: 'Naam voor formulierverzending',
		},
		value: {
			control: 'text',
			description: 'De tijd als HH:mm (24-uurs)',
		},
		min: {
			control: 'text',
			description: 'Vroegst toegestane tijd; tevens de basis waarvandaan step telt',
		},
		max: {
			control: 'text',
			description: 'Laatst toegestane tijd',
		},
		step: {
			control: 'number',
			description: 'Minutenstap: bepaalt het afronden en hoe ver de pijltjestoetsen verspringen',
			table: { defaultValue: { summary: '1' } },
		},
		required: {
			control: 'boolean',
			description: 'Verplichte staat',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = ({
	size,
	width,
	placeholder,
	accessibleLabel, accessibleDescription,
	noPicker,
	valid,
	invalid,
	readonly,
	disabled,
	name,
	value,
	min,
	max,
	step,
	required,
}: Record<string, any>) => html`
	<nldd-time-field
		size=${size || nothing}
		width=${width || nothing}
		placeholder=${placeholder || nothing}
		accessible-label=${accessibleLabel || nothing}
		accessible-description=${accessibleDescription || nothing}
		?no-picker=${noPicker}
		?valid=${valid}
		?invalid=${invalid}
		?readonly=${readonly}
		?disabled=${disabled}
		name=${name || nothing}
		value=${value || nothing}
		min=${min || nothing}
		max=${max || nothing}
		step=${step || nothing}
		?required=${required}
	></nldd-time-field>
`;

export const Standaard = Template.bind({});

export const Kwartieren = () => html`
	<nldd-text text="Stap 15: bij verlaten van het veld rondt de invoer af op het dichtstbijzijnde kwartier, en de pijltjestoetsen verspringen met een kwartier."></nldd-text>
	<nldd-spacer size="16"></nldd-spacer>
	<nldd-time-field
		step="15"
		accessible-label="Starttijd"
	></nldd-time-field>
`;

export const StapVanafMin = () => html`
	<nldd-text>
		<p>De stap telt vanaf <code>min</code>, dus deze reeks loopt 09:07, 09:22, 09:37.</p>
	</nldd-text>
	<nldd-spacer size="16"></nldd-spacer>
	<nldd-time-field
		min="09:07"
		step="15"
		accessible-label="Vertrektijd"
	></nldd-time-field>
`;

export const Kantooruren = () => html`
	<nldd-text>
		<p>Buiten <code>min</code> en <code>max</code> blijft de getypte tekst staan, maar de waarde is leeg.</p>
	</nldd-text>
	<nldd-spacer size="16"></nldd-spacer>
	<nldd-time-field
		min="09:00"
		max="17:00"
		step="30"
		accessible-label="Afspraak"
	></nldd-time-field>
`;

export const MetPicker = () => html`
	<nldd-text text="De knop opent een popover met twee kolommen. Op een klein scherm wordt dat een bottom sheet met een titelbalk."></nldd-text>
	<nldd-spacer size="16"></nldd-spacer>
	<nldd-time-field
		value="09:30"
		step="15"
		accessible-label="Starttijd"
	></nldd-time-field>
`;

export const ZonderPicker = () => html`
	<nldd-text>
		<p>Met <code>no-picker</code> vervalt de knop; het veld blijft precies breed genoeg voor een tijd en het validatie-icoon.</p>
	</nldd-text>
	<nldd-spacer size="16"></nldd-spacer>
	<nldd-time-field
		value="09:30"
		no-picker
		accessible-label="Starttijd"
	></nldd-time-field>
`;

export const InEenFormField = () => html`
	<nldd-form-field
		label="Starttijd"
		supporting-label="Bijvoorbeeld 9:30 of 930"
	>
		<nldd-time-field step="5"></nldd-time-field>
	</nldd-form-field>
`;

export const Grootten = () => html`
	<nldd-container
		layout="row"
		gap="16"
		vertical-alignment="top"
	>
		<nldd-time-field
			size="md"
			value="09:30"
			accessible-label="Middel"
		></nldd-time-field>
		<nldd-time-field
			size="sm"
			value="09:30"
			accessible-label="Klein"
		></nldd-time-field>
	</nldd-container>
`;

export const AlleToestanden = () => html`
	<nldd-container
		layout="wrap"
		gap="16"
		vertical-alignment="top"
	>
		<nldd-time-field
			value="09:30"
			valid
			accessible-label="Geldig"
		></nldd-time-field>
		<nldd-time-field
			value="25:99"
			invalid
			accessible-label="Ongeldig"
		></nldd-time-field>
		<nldd-time-field
			value="09:30"
			readonly
			accessible-label="Alleen lezen"
		></nldd-time-field>
		<nldd-time-field
			value="09:30"
			disabled
			accessible-label="Uitgeschakeld"
		></nldd-time-field>
	</nldd-container>
`;
