import { html } from 'lit';
import './split-view-divider.js';

/**
 * Gebruik een split view divider als scheidingslijn tussen panelen in een
 * split view. De verdeler past zich automatisch aan de beschikbare ruimte aan.
 * Met `has-drag-handle` wordt een sleephandvat getoond voor toekomstige
 * sleepfunctionaliteit.
 *
 * ## Gebruik
 * ```html
 * <nldd-split-view-divider orientation="vertical"></nldd-split-view-divider>
 * ```
 */
export default {
	title: 'Components/Layout/Split Views/Split View Divider',
	component: 'nldd-split-view-divider',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/split-views/split-view-divider/split-view-divider.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		orientation: 'vertical',
		hasDragHandle: false,
	},
	argTypes: {
		orientation: {
			control: { type: 'select' },
			options: ['vertical', 'horizontal'],
			description: 'Oriëntatie van de verdeler',
			table: { defaultValue: { summary: 'vertical' } },
		},
		hasDragHandle: {
			name: 'has-drag-handle',
			control: 'boolean',
			description: 'Toon een sleephandvat',
			table: { defaultValue: { summary: 'false' } },
		},
	},
};

export const Verticaal = ({ orientation, hasDragHandle }: Record<string, any>) => html`
	<div style="display: flex; flex-direction: row; height: 200px;">
		<div style="flex-grow: 1; flex-shrink: 1; flex-basis: 0; background: var(--semantics-surfaces-tinted-background-color);">
		</div>
		<nldd-split-view-divider
			orientation=${orientation}
			?has-drag-handle=${hasDragHandle}
		></nldd-split-view-divider>
		<div style="flex-grow: 1; flex-shrink: 1; flex-basis: 0; background: var(--semantics-surfaces-tinted-background-color);">
		</div>
	</div>
`;

export const Horizontaal = {
	render: () => html`
	<div style="display: flex; flex-direction: column; width: 400px;">
		<div style="height: 100px; background: var(--semantics-surfaces-tinted-background-color);">
		</div>
		<nldd-split-view-divider orientation="horizontal"></nldd-split-view-divider>
		<div style="height: 100px; background: var(--semantics-surfaces-tinted-background-color);">
		</div>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const MetSleepHandvat = {
	render: () => html`
	<div style="display: flex; flex-direction: row; height: 200px;">
		<div style="flex-grow: 1; flex-shrink: 1; flex-basis: 0; background: var(--semantics-surfaces-tinted-background-color);">
		</div>
		<nldd-split-view-divider orientation="vertical" has-drag-handle></nldd-split-view-divider>
		<div style="flex-grow: 1; flex-shrink: 1; flex-basis: 0; background: var(--semantics-surfaces-tinted-background-color);">
		</div>
	</div>
`,
	parameters: { controls: { disable: true } },
};
