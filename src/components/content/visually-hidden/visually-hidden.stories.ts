import { html } from 'lit';
import './visually-hidden.js';
import '../../inputs/checkbox/checkbox.js';
import '../../lists-and-tables/table/table.js';
import '../../lists-and-tables/cells/cell/cell.js';
import '../../lists-and-tables/cells/text-cell/text-cell.js';

export default {
	title: 'Components/Content/Visually Hidden',
	component: 'nldd-visually-hidden',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/visually-hidden/visually-hidden.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
	},
};

/**
 * De kop van een kolom met selectievakjes. Wie kijkt, ziet aan de vakjes waar de
 * kolom voor is; een schermlezer heeft de naam van de kolom nodig om bij elke cel
 * te zeggen wat het vakje doet. Er staat niets in beeld en de tekst neemt geen
 * ruimte in.
 */
export const Standaard = {
	render: () => html`
		<nldd-table
			columns="40px minmax(160px, 1fr) 160px"
			accessible-label="Aanvragen"
		>
			<nldd-table-row slot="header">
				<nldd-cell>
					<nldd-visually-hidden>Toepassen</nldd-visually-hidden>
				</nldd-cell>
				<nldd-text-cell text="**Aanvraag**"></nldd-text-cell>
				<nldd-text-cell text="**Status**"></nldd-text-cell>
			</nldd-table-row>
			<nldd-table-row>
				<nldd-cell horizontal-alignment="center">
					<nldd-checkbox accessible-label="Aanvraag A-1042"></nldd-checkbox>
				</nldd-cell>
				<nldd-text-cell text="Aanvraag A-1042"></nldd-text-cell>
				<nldd-text-cell text="In behandeling"></nldd-text-cell>
			</nldd-table-row>
			<nldd-table-row>
				<nldd-cell horizontal-alignment="center">
					<nldd-checkbox accessible-label="Aanvraag A-1043"></nldd-checkbox>
				</nldd-cell>
				<nldd-text-cell text="Aanvraag A-1043"></nldd-text-cell>
				<nldd-text-cell text="Afgerond"></nldd-text-cell>
			</nldd-table-row>
		</nldd-table>
	`,
};
