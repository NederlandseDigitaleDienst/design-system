import { action } from 'storybook/actions';
import { html, nothing } from 'lit';
import './date-field.js';
import '../../forms/form-field/form-field.js';
import '../date-picker/date-picker.js';

/**
 * `nldd-date-field` is een tekstveld voor een datum, met een optionele kalender
 * in een popover. Gebruik het in een formulier, voor een datum die iemand typt of
 * kiest, of voor een periode. Wil je alleen de kalender, op een pagina of in een
 * filterpaneel, dan is er `nldd-date-picker`.
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
		name: 'date',
		value: '',
		range: false,
		min: '',
		max: '',
		required: false,
		autocomplete: '',
		readonly: false,
		disabled: false,
	},
	argTypes: {
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
		name: {
			control: 'text',
			description: 'Naam voor formulierverzending',
		},
		value: {
			control: 'text',
			description: 'De datum als ISO (jjjj-mm-dd)',
		},
		range: {
			control: 'boolean',
			description: 'Kies een periode: twee invoervelden en een kalender in bereikmodus',
			table: { defaultValue: { summary: false } },
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
	},
};

const Template = ({
	size,
	width,
	placeholder,
	accessibleLabel,
	accessibleDescription,
	noPicker,
	valid,
	invalid,
	name,
	value,
	range,
	min,
	max,
	required,
	autocomplete,
	readonly,
	disabled,
}: Record<string, unknown>) => html`
	<nldd-date-field
		size=${size || nothing}
		width=${width || nothing}
		placeholder=${placeholder || nothing}
		accessible-label=${accessibleLabel || nothing}
		accessible-description=${accessibleDescription || nothing}
		?no-picker=${noPicker}
		?valid=${valid}
		?invalid=${invalid}
		name=${name || nothing}
		value=${value || nothing}
		?range=${range}
		min=${min || nothing}
		max=${max || nothing}
		?required=${required}
		autocomplete=${autocomplete || nothing}
		?readonly=${readonly}
		?disabled=${disabled}
		@change=${action('change')}
	></nldd-date-field>
`;

export const Standaard = Template.bind({});

/**
 * Het verwachte formaat staat in de `supporting-label` van `nldd-form-field`,
 * niet in de placeholder. Een placeholder verdwijnt zodra iemand typt. Je mag
 * de datum ook als `31/12/2026` of `31122026` typen. Het veld zet hem om zodra
 * je het verlaat.
 */
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
		label="Startdatum"
		supporting-label="Vanaf vandaag tot uiterlijk een jaar vooruit"
	>
		<nldd-date-field
			min="today"
			max="today+1y"
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

const geenWeekend = (iso: string) => {
	const dag = new Date(`${iso}T00:00:00Z`).getUTCDay();
	return dag === 0 || dag === 6;
};

/**
 * Een eigen kalender in de slot, voor wat alleen een kalender weet: hier
 * weeknummers en geen weekenden. Het veld blijft de waarde en de grenzen zetten.
 */
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
