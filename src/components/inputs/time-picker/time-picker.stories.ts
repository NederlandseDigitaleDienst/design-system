import { html, nothing } from 'lit';
import './time-picker.ts';
import '../../layout/container/container.js';
import '../../content/text/text.js';
import '../../layout/spacer/spacer.js';

/**
 * `nldd-time-picker` is een tijdkiezer met 2 kolommen, uren en minuten, die als
 * een wieltje langs de selectie in het midden schuiven. Je gebruikt hem los op een
 * pagina of in een filterpaneel, en hij zit in de popover van `nldd-time-field`.
 */
export default {
	title: 'Components/Inputs/Time Picker',
	component: 'nldd-time-picker',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/time-picker/time-picker.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
	},
	args: {
		rows: 7,
		width: '',
		value: '09:30',
		min: '',
		max: '',
		step: 1,
		accessibleLabel: '',
		accessibleDescription: '',
		accessibleDescribedBy: '',
		invalid: false,

	},
	argTypes: {
		rows: {
			control: 'number',
			description: 'Hoogte van de kolommen in rijen; oneven toont hele rijen, even kapt de randen af',
			table: { defaultValue: { summary: '7' } },
		},
		width: {
			control: 'text',
			description: "Breedte: 'full' of een eigen CSS-lengte. Leeg is de intrinsieke breedte van twee kolommen.",
		},
		value: {
			control: 'text',
			description: 'De gekozen tijd als HH:mm (24-uurs)',
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
			description: 'Minutenstap: bepaalt welke minuten in de kolom staan',
			table: { defaultValue: { summary: '1' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van de picker',
			table: { defaultValue: { summary: 'Tijd kiezen' } },
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

	},
};

const Template = ({
	rows,
	width,
	value,
	min,
	max,
	step,
	accessibleLabel, accessibleDescription,
	invalid,
}: Record<string, any>) => html`
	<nldd-time-picker
		?invalid=${invalid}
		rows=${rows || nothing}
		width=${width || nothing}
		value=${value || nothing}
		min=${min || nothing}
		max=${max || nothing}
		step=${step || nothing}
		accessible-label=${accessibleLabel || nothing}
		accessible-description=${accessibleDescription || nothing}
	></nldd-time-picker>
`;

export const Standaard = Template.bind({});

export const Kwartieren = () => html`
	<nldd-time-picker
		value="09:30"
		step="15"
		accessible-label="Starttijd"
	></nldd-time-picker>
`;

export const Kantooruren = () => html`
	<nldd-text>
		<p>Buiten <code>min</code> en <code>max</code> staat geen enkele waarde in de kolommen, dus een ongeldige tijd is niet te kiezen.</p>
	</nldd-text>
	<nldd-spacer size="16"></nldd-spacer>
	<nldd-time-picker
		value="09:00"
		min="09:00"
		max="17:00"
		step="30"
		accessible-label="Afspraak"
	></nldd-time-picker>
`;

export const StapVanafMin = () => html`
	<nldd-text>
		<p>De stap telt vanaf <code>min</code>, dus de minuten lopen 07, 22, 37, 52.</p>
	</nldd-text>
	<nldd-spacer size="16"></nldd-spacer>
	<nldd-time-picker
		value="09:07"
		min="09:07"
		step="15"
		accessible-label="Vertrektijd"
	></nldd-time-picker>
`;

export const MinderRijen = () => html`
	<nldd-text>
		<p>Met <code>rows</code> bepaalt de consument hoe hoog de kolommen zijn, in rijen. De gekozen waarde staat altijd in het midden, dus een oneven aantal toont hele rijen en een even aantal kapt boven en onder een halve rij af.</p>
	</nldd-text>
	<nldd-spacer size="16"></nldd-spacer>
	<nldd-container
		layout="row"
		gap="48"
		vertical-alignment="top"
	>
		<nldd-container width="fit-content">
			<nldd-text>
				<p><code>rows="5"</code>, hele rijen</p>
			</nldd-text>
			<nldd-spacer size="16"></nldd-spacer>
			<nldd-time-picker
				rows="5"
				value="09:30"
				step="15"
				accessible-label="Vijf rijen"
			></nldd-time-picker>
		</nldd-container>
		<nldd-container width="fit-content">
			<nldd-text>
				<p><code>rows="6"</code>, halve rij aan de randen</p>
			</nldd-text>
			<nldd-spacer size="16"></nldd-spacer>
			<nldd-time-picker
				rows="6"
				value="09:30"
				step="15"
				accessible-label="Zes rijen"
			></nldd-time-picker>
		</nldd-container>
		<nldd-container width="fit-content">
			<nldd-text>
				<p><code>rows="7"</code> (standaard)</p>
			</nldd-text>
			<nldd-spacer size="16"></nldd-spacer>
			<nldd-time-picker
				value="09:30"
				step="15"
				accessible-label="Zeven rijen"
			></nldd-time-picker>
		</nldd-container>
	</nldd-container>
`;
