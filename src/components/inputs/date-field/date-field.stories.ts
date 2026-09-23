import { action } from 'storybook/actions';
import { html, nothing } from 'lit';
import './date-field.js';
import '../../forms/form-field/form-field.js';
import '../date-picker/date-picker.js';

/**
 * `nldd-date-field` is een tekstveld voor een datum, met een optionele kalender in
 * een popover. De waarde is altijd ISO (`jjjj-mm-dd`) terwijl op het scherm de
 * Nederlandse notatie (`dd-mm-jjjj`) staat, zodat een formulier een stabiel
 * machineformaat krijgt en de gebruiker een vertrouwde notatie.
 *
 * Er wordt niet gemaskeerd tijdens het typen: invoer wordt royaal geaccepteerd
 * (`31-12-2026`, `31/12/2026`, `31122026`, ook ISO) en pas bij het verlaten van het
 * veld genormaliseerd, want maskeren per toetsaanslag laat de cursor springen, maakt
 * backspace onvoorspelbaar en verwart schermlezers. Zet het verwachte formaat niet in
 * de placeholder maar in de `supporting-label` van `nldd-form-field`, want een
 * placeholder verdwijnt zodra iemand typt, heeft te weinig contrast en wordt
 * wisselend voorgelezen.
 */
export default {
	title: 'Components/Inputs/Date Field',
	component: 'nldd-date-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/date-field/date-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		range: false,
		size: 'md',
		width: '',
		placeholder: '',
		accessibleLabel: '',
		noPicker: false,
		valid: false,
		invalid: false,
		readonly: false,
		disabled: false,
		name: 'date',
		value: '',
		min: '',
		max: '',
		required: false,
		autocomplete: '',
	},
	argTypes: {
		range: {
			control: 'boolean',
			description: 'Kies een periode: twee invoervelden en een kalender in bereikmodus',
			table: { defaultValue: { summary: false } },
		},
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Veldmaat',
			table: { defaultValue: { summary: 'md' } },
		},
		width: {
			control: 'text',
			description: 'Breedte: leeg past bij een datum plus iconen, "full" vult de container, of een eigen CSS-lengte. "fit-content" laat de ruimte voor het validatie-icoon weg en groeit weer zodra het veld valid of invalid wordt.',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholdertekst. Zet hier geen formaat in; gebruik de supporting-label van nldd-form-field.',
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label. Wordt automatisch gezet door nldd-form-field.',
			table: { defaultValue: { summary: 'Datum' } },
		},
		noPicker: {
			name: 'no-picker',
			control: 'boolean',
			description: 'Verbergt de kalenderknop. Standaard staat die knop er wel.',
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
			description: 'De datum als ISO (jjjj-mm-dd)',
		},
		min: {
			control: 'text',
			description: 'Vroegst toegestane datum als ISO (jjjj-mm-dd)',
		},
		max: {
			control: 'text',
			description: 'Laatst toegestane datum als ISO (jjjj-mm-dd)',
		},
		required: {
			control: 'boolean',
			description: 'Verplichte staat',
			table: { defaultValue: { summary: false } },
		},
		autocomplete: {
			control: 'text',
			description: 'Autocomplete-hint, bijvoorbeeld bday',
		},
	},
};

const Template = ({
	range,
	size,
	width,
	placeholder,
	accessibleLabel,
	noPicker,
	valid,
	invalid,
	readonly,
	disabled,
	name,
	value,
	min,
	max,
	required,
	autocomplete,
}: Record<string, unknown>) => html`
	<nldd-date-field
		?range=${range}
		size=${size || nothing}
		width=${width || nothing}
		placeholder=${placeholder || nothing}
		accessible-label=${accessibleLabel || nothing}
		?no-picker=${noPicker}
		?valid=${valid}
		?readonly=${readonly}
		?invalid=${invalid}
		?disabled=${disabled}
		name=${name || nothing}
		value=${value || nothing}
		min=${min || nothing}
		max=${max || nothing}
		?required=${required}
		autocomplete=${autocomplete || nothing}
		@change=${action('change')}
	></nldd-date-field>
`;

export const Standaard = Template.bind({});

export const InEenFormulierveld = () => html`
	<nldd-form-field
		label="Ophaaldatum"
		supporting-label="Bijvoorbeeld 15-07-2026"
	>
		<nldd-date-field name="ophaaldatum"></nldd-date-field>
	</nldd-form-field>
`;

export const MetBereik = () => html`
	<nldd-form-field
		label="Datum in 2026"
		supporting-label="Bijvoorbeeld 31-12-2026"
	>
		<nldd-date-field
			value="2026-06-15"
			min="2026-01-01"
			max="2026-12-31"
		></nldd-date-field>
	</nldd-form-field>
`;

export const Periode = () => html`
	<nldd-form-field
		label="Periode"
		supporting-label="Bijvoorbeeld 01-07-2026 t/m 14-07-2026"
	>
		<nldd-date-field
			range
			name="period"
			value="2026-07-01/2026-07-14"
		></nldd-date-field>
	</nldd-form-field>
`;

export const ZonderKiezer = () => html`
	<nldd-form-field
		label="Datum"
		supporting-label="Bijvoorbeeld 31-12-2026"
	>
		<nldd-date-field no-picker></nldd-date-field>
	</nldd-form-field>
`;

/**
 * Een eigen kalender in de slot, voor wat alleen een kalender weet: hier
 * weeknummers en geen weekenden. Het veld blijft de waarde en de grenzen zetten.
 */
const geenWeekend = (iso: string) => {
	const dag = new Date(`${iso}T00:00:00Z`).getUTCDay();
	return dag === 0 || dag === 6;
};

export const EigenKalender = () => html`
	<nldd-form-field
		label="Afspraak"
		supporting-label="Alleen op werkdagen"
	>
		<nldd-date-field
			min="today"
			max="today+3m"
		>
			<nldd-date-picker
				slot="picker"
				week-numbers
				.isDateUnavailable=${geenWeekend}
			></nldd-date-picker>
		</nldd-date-field>
	</nldd-form-field>
`;
