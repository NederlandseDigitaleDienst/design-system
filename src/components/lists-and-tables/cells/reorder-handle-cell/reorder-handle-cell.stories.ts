import { html } from 'lit';
import './reorder-handle-cell.js';
import '../text-cell/text-cell.js';
import '../spacer-cell/spacer-cell.js';
import '../../list/list.js';
import '../../list-item/list-item.js';

export default {
	title: 'Components/Lists & Tables/Cells/Reorder Handle Cell',
	component: 'nldd-reorder-handle-cell',
	tags: ['autodocs'],
	args: {
		size: 'md',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Handle size',
			table: {
				defaultValue: { summary: 'md' },
			},
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-reorder-handle-cell size=${args.size}></nldd-reorder-handle-cell>
	`,
};

export const AlleGrootten = {
	render: () => html`
		<nldd-list accessible-label="Grootten" reorderable>
			<nldd-list-item>
				<nldd-reorder-handle-cell size="md"></nldd-reorder-handle-cell>
				<nldd-spacer-cell
					reorder-handle
					size="8"
				></nldd-spacer-cell>
				<nldd-text-cell text="MD"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-reorder-handle-cell size="sm"></nldd-reorder-handle-cell>
				<nldd-spacer-cell
					reorder-handle
					size="8"
				></nldd-spacer-cell>
				<nldd-text-cell text="SM"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};
