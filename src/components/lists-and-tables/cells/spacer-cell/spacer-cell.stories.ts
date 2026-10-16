import { html, nothing } from 'lit';
import './spacer-cell.js';
import '../text-cell/text-cell.js';
import '../../list/list.js';
import '../../list-item/list-item.js';

export default {
	title: 'Components/Lists & Tables/Cells/Spacer Cell',
	component: 'nldd-spacer-cell',
	tags: ['autodocs'],
	args: {
		size: '16',
		hideBelow: '',
		hideAbove: '',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['2', '4', '6', '8', '10', '12', '16', '20', '24', '28', '32', '40', '44', '48', '56', '64', '80', '96', 'flexible'],
			description: 'Spacer-grootte in pixels, of "flexible" om de resterende ruimte te vullen',
		},
		hideBelow: {
			name: 'hide-below',
			control: 'text',
			description: 'Verberg wanneer cells-container smaller is dan deze CSS-lengte (bv. "320px", "20rem")',
		},
		hideAbove: {
			name: 'hide-above',
			control: 'text',
			description: 'Verberg wanneer cells-container breder is dan deze CSS-lengte (bv. "1200px")',
		},
	},
};

const debugStyle = 'background: rgba(255, 36, 189, 0.2); outline: 1px dashed #ff24bd;';
const containerStyle = 'background: #f0f0f0; padding: 8px;';

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<div style=${containerStyle}>
			<nldd-list accessible-label="Spacer">
				<nldd-list-item>
					<nldd-text-cell
						width="fit-content"
						text="Voor"
					></nldd-text-cell>
					<nldd-spacer-cell
						size=${args.size}
						hide-below=${args.hideBelow || nothing}
						hide-above=${args.hideAbove || nothing}
						style=${debugStyle}
					></nldd-spacer-cell>
					<nldd-text-cell
						width="fit-content"
						text="Na"
					></nldd-text-cell>
				</nldd-list-item>
			</nldd-list>
		</div>
	`,
};

export const Flexibel = {
	render: () => html`
		<div style="${containerStyle} width: 400px;">
			<nldd-list accessible-label="Flexibele spacer">
				<nldd-list-item>
					<nldd-text-cell
						width="fit-content"
						text="Links"
					></nldd-text-cell>
					<nldd-spacer-cell
						size="flexible"
						style=${debugStyle}
					></nldd-spacer-cell>
					<nldd-text-cell
						width="fit-content"
						text="Rechts"
					></nldd-text-cell>
				</nldd-list-item>
			</nldd-list>
		</div>
	`,
};

export const AlleVasteGrootten = {
	render: () => html`
		<nldd-list accessible-label="Vaste grootten">
			${['2', '4', '6', '8', '10', '12', '16', '20', '24', '28', '32', '40', '44', '48', '56', '64', '80', '96'].map(size => html`
				<nldd-list-item>
					<nldd-text-cell
						width="40px"
						text="${size}px"
					></nldd-text-cell>
					<nldd-text-cell
						width="fit-content"
						text="|"
					></nldd-text-cell>
					<nldd-spacer-cell
						size=${size}
						style=${debugStyle}
					></nldd-spacer-cell>
					<nldd-text-cell
						width="fit-content"
						text="|"
					></nldd-text-cell>
				</nldd-list-item>
			`)}
		</nldd-list>
	`,
};
