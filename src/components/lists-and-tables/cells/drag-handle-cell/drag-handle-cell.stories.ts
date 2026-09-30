import { html } from 'lit';
import './drag-handle-cell.js';

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
		<div style="display: flex; gap: 16px; align-items: center;">
			<div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
				<nldd-drag-handle-cell size="md"></nldd-drag-handle-cell>
				<span style="font-size: 0.75rem; color: var(--semantics-content-color);">MD</span>
			</div>
			<div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
				<nldd-drag-handle-cell size="sm"></nldd-drag-handle-cell>
				<span style="font-size: 0.75rem; color: var(--semantics-content-color);">SM</span>
			</div>
		</div>
	`,
};
