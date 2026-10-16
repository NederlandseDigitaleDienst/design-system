import { html } from 'lit';
import './drag-handle-cell.js';
import '../text-cell/text-cell.js';
import '../../list/list.js';
import '../../list-item/list-item.js';

export default {
	title: 'Components/Lists & Tables/Cells/Drag Handle Cell',
	component: 'nldd-drag-handle-cell',
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
		<nldd-drag-handle-cell size=${args.size}></nldd-drag-handle-cell>
	`,
};

export const AlleGrootten = {
	render: () => html`
		<nldd-list accessible-label="Grootten">
			<nldd-list-item>
				<nldd-drag-handle-cell size="md"></nldd-drag-handle-cell>
				<nldd-text-cell text="MD"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-drag-handle-cell size="sm"></nldd-drag-handle-cell>
				<nldd-text-cell text="SM"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};
