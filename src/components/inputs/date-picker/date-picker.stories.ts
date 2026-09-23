import { action } from 'storybook/actions';
import { html, nothing } from 'lit';
import './date-picker.js';

/**
 * `nldd-date-picker` is de kalender waarin een datum of een periode wordt gekozen.
 * Het component staat op zichzelf (inline op een pagina of in een filterpaneel) of
 * wordt door `nldd-date-field` in een popover getoond. Alles is ISO (`jjjj-mm-dd`):
 * zonder `range` in `value`, met `range` in `start` en `end`. `min` en `max` nemen
 * een ISO-datum of `today` met een optionele verschuiving (`d`, `w`, `m`, `y`), zodat
 * een grens niet veroudert zoals een vaste datum, en losse dagen blokkeer je met de
 * property `isDateUnavailable`, bijvoorbeeld voor weekenden of feestdagen; die
 * blijven met het toetsenbord bereikbaar zodat een pijltjestoets geen reeks stil
 * overslaat.
 *
 * Pijltjes verplaatsen per dag en per week, `Home` en `End` naar de weekgrenzen,
 * `PageUp` en `PageDown` per maand en met `Shift` per jaar; `Enter` en spatie kiezen.
 * De maandtitel is een live region, zodat een schermlezer bij het bladeren hoort in
 * welke maand de focus staat.
 */
export default {
	title: 'Components/Inputs/Date Picker',
	component: 'nldd-date-picker',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/date-picker/date-picker.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		range: false,
		firstDayOfWeek: 1,
		weekNumbers: false,
		width: '',
		accessibleLabel: '',
		value: '',
		start: '',
		end: '',
		min: '',
		max: '',
		invalid: false,

	},
	argTypes: {
		range: {
			control: 'boolean',
			description: 'Kies een periode in plaats van één datum',
			table: { defaultValue: { summary: false } },
		},
		firstDayOfWeek: {
			name: 'first-day-of-week',
			control: 'select',
			options: [0, 1, 2, 3, 4, 5, 6],
			description: 'Eerste dag van de week, 0 is zondag',
			table: { defaultValue: { summary: 1 } },
		},
		weekNumbers: {
			name: 'week-numbers',
			control: 'boolean',
			description: 'Toont ISO-weeknummers in een kolom links',
			table: { defaultValue: { summary: false } },
		},
		width: {
			control: 'text',
			description: 'Breedte: full (vult de container) of een CSS-lengte (bv. 560px); leeg is de intrinsieke zeven-cellen-breedte',
			table: { defaultValue: { summary: '(auto)' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van de kalender',
		},
		value: {
			control: 'text',
			description: 'De gekozen datum als ISO (jjjj-mm-dd). Alleen zonder range.',
		},
		start: {
			control: 'text',
			description: 'Begin van de periode als ISO. Alleen met range.',
		},
		end: {
			control: 'text',
			description: 'Einde van de periode als ISO. Alleen met range.',
		},
		min: {
			control: 'text',
			description: 'Vroegste datum: ISO, of today met een verschuiving (today-18y)',
		},
		max: {
			control: 'text',
			description: 'Laatste datum: ISO, of today met een verschuiving (today+1y)',
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige staat. Wordt aangekondigd met aria-invalid; er wordt niets voor getekend.',
			table: { defaultValue: { summary: false } },
		},

	},
};

const Template = ({
	range,
	firstDayOfWeek,
	weekNumbers,
	width,
	accessibleLabel,
	value,
	start,
	end,
	min,
	max,
	invalid,
}: Record<string, unknown>) => html`
	<nldd-date-picker
		?range=${range}
		first-day-of-week=${firstDayOfWeek}
		?week-numbers=${weekNumbers}
		width=${width || nothing}
		accessible-label=${accessibleLabel || nothing}
		value=${value || nothing}
		start=${start || nothing}
		end=${end || nothing}
		min=${min || nothing}
		max=${max || nothing}
		?invalid=${invalid}
		@change=${action('change')}
		@input=${action('input')}
	></nldd-date-picker>
`;

export const Standaard = Template.bind({});

export const Periode = () => html`
	<nldd-date-picker
		range
		accessible-label="Periode"
		@change=${action('change')}
	></nldd-date-picker>
`;

export const Geboortedatum = () => html`
	<nldd-date-picker
		accessible-label="Geboortedatum"
		max="today-18y"
		@change=${action('change')}
	></nldd-date-picker>
`;

export const AfspraakPlannen = () => html`
	<nldd-date-picker
		accessible-label="Datum van de afspraak"
		min="today"
		max="today+3m"
		@change=${action('change')}
	></nldd-date-picker>
`;

export const ZonderWeekenden = () => {
	const picker = document.createElement('nldd-date-picker');
	picker.accessibleLabel = 'Werkdag';
	// Zaterdag en zondag blijven zichtbaar en bereikbaar, maar zijn niet kiesbaar.
	picker.isDateUnavailable = (iso: string) => {
		const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
		return day === 0 || day === 6;
	};
	picker.addEventListener('change', action('change'));
	return picker;
};

// Via de args en niet als vaste markup, anders doen de controls op deze story
// niets: Storybook hertekent dan dezelfde hardgecodeerde attributen.
export const MetWeeknummers = {
	render: Template,
	args: {
		range: true,
		weekNumbers: true,
		accessibleLabel: 'Verslagperiode',
	},
};

export const VolleBreedte = () => html`
	<div style="width: 480px; outline: 1px dashed currentColor;">
		<nldd-date-picker
			style="width: 100%;"
			range
			week-numbers
			accessible-label="Periode"
			@change=${action('change')}
		></nldd-date-picker>
	</div>
`;

export const ZondagEerst = () => html`
	<nldd-date-picker
		first-day-of-week="0"
		accessible-label="Datum"
		@change=${action('change')}
	></nldd-date-picker>
`;
