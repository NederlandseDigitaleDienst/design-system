import { html, nothing } from 'lit';
import './side-by-side-split-view.js';
import '../../page/page.js';
import '../../page-sections/simple-section/simple-section.js';
import '../../container/container.js';
import '../../../content/rich-text/rich-text.js';

/**
 * Use a side-by-side split view to show multiple panes next to each other,
 * each with its own scrollable area. Typically used for editors where
 * the user needs two or more views at the same time.
 * The number of panes is set via the <code>panes</code> attribute.
 *
 * ## Gebruik
 * ```html
 * <nldd-side-by-side-split-view panes="2">
 *   <nldd-split-view-pane slot="pane-1">...</nldd-split-view-pane>
 *   <nldd-split-view-pane slot="pane-2">...</nldd-split-view-pane>
 * </nldd-side-by-side-split-view>
 * ```
 */
export default {
	title: 'Components/Layout/Split Views/Side-by-Side Split View',
	component: 'nldd-side-by-side-split-view',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		componentSource: {
			file: 'src/components/layout/split-views/side-by-side-split-view/side-by-side-split-view.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		background: 'inherit',
		panes: 2,
	},
	argTypes: {
		background: {
			control: { type: 'select' },
			options: ['inherit', 'base', 'tinted'],
			description: 'Tinted achtergrond — cascade van --context-parent-background-color naar alle afstammelingen inclusief nldd-page en de fade overlay',
			table: { defaultValue: { summary: 'inherit' } },
		},
		panes: {
			control: { type: 'number' },
			description: 'Aantal panelen',
			table: { defaultValue: { summary: '2' } },
		},
	},
};

/* Het eerste paneel draagt de hoofdinhoud en houdt daarmee de landmarks van het
   document; de andere panelen zijn benoemde regio's. */
const paneContent = (title: any, slot: any) => html`
	<nldd-split-view-pane slot=${slot}>
		<nldd-page sticky-header
			landmarks=${slot === 'pane-1' ? 'page' : nothing}
			accessible-label=${slot === 'pane-1' ? nothing : title}
		>
			<nldd-container slot="header" padding="16">
				<nldd-rich-text>
					<strong>${title}</strong>
				</nldd-rich-text>
			</nldd-container>
			<nldd-simple-section>
				<nldd-rich-text>
					<h2>Sectietitel</h2>
					<p>Dit is de inhoud van ${title}. Elke pagina heeft een eigen scrollbaar gebied.</p>
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
					<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
					<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
					<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
				</nldd-rich-text>
			</nldd-simple-section>
		</nldd-page>
	</nldd-split-view-pane>
`;

export const Standaard = ({ background, panes }: Record<string, any>) => html`
	<nldd-side-by-side-split-view panes=${panes} background=${background} style="height: 500px;">
		${Array.from({ length: panes }, (_, i) => paneContent(`Paneel ${i + 1}`, `pane-${i + 1}`))}
	</nldd-side-by-side-split-view>
`;

export const DrieKolommen = {
	render: () => html`
	<nldd-side-by-side-split-view panes="3" style="height: 500px;">
		${[1, 2, 3].map(n => paneContent(`Paneel ${n}`, `pane-${n}`))}
	</nldd-side-by-side-split-view>
`,
	parameters: { controls: { disable: true } },
};
