import { html } from 'lit';
import './bar-split-view.js';
import '../split-view-pane/split-view-pane.js';
import '../../page/page.js';
import '../../page-sections/simple-section/simple-section.js';
import '../../../content/rich-text/rich-text.js';
import '../../container/container.js';
import '../../../actions/toolbar/toolbar.js';
import '../../../inputs/segmented-control/segmented-control.js';
import '../../../inputs/search-field/search-field.js';

import '../../../actions/menu/menu.js';

/**
 * Gebruik een bar split view voor een verticale layout met een main-gebied en een
 * onbeperkt aantal balkpanelen. Geef elke balk een unieke slotnaam (bijv.
 * slot="toolbar", slot="status-bar"). Het main-paneel gebruikt altijd slot="main".
 *
 * Balken staan op elke viewport in de flow en stapelen verticaal. Er komt
 * alleen een scheidingslijn waar het main-paneel aan een balk grenst — direct
 * boven en/of onder main, óók op sm. Tussen twee gestapelde balken aan dezelfde
 * kant komt nooit een lijn, zodat bijv. een toolbar en tab-bar één geheel vormen.
 * De consument hoeft zelf geen dividers te plaatsen of te onderdrukken.
 *
 * Gebruik sm-order, md-order en lg-order om de volgorde per breekpunt te bepalen.
 * Zonder orderattributen wordt DOM-volgorde gebruikt.
 *
 * ## Gebruik
 * ```html
 * <nldd-bar-split-view>
 *   <nldd-split-view-pane slot="toolbar" sm-order="1" md-order="1">...</nldd-split-view-pane>
 *   <nldd-split-view-pane slot="main"    sm-order="2" md-order="2">...</nldd-split-view-pane>
 *   <nldd-split-view-pane slot="status-bar" sm-order="3" md-order="3">...</nldd-split-view-pane>
 * </nldd-bar-split-view>
 * ```
 */
export default {
	title: 'Components/Layout/Split Views/Bar Split View',
	component: 'nldd-bar-split-view',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		componentSource: {
			file: 'src/components/layout/split-views/bar-split-view/bar-split-view.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		background: 'inherit',
	},
	argTypes: {
		background: {
			control: { type: 'select' },
			options: ['inherit', 'base', 'tinted'],
			description: 'Achtergrondkleur — cascade van --context-parent-background-color naar alle afstammelingen inclusief nldd-page en de fade-overlays',
			table: { defaultValue: { summary: 'inherit' } },
		},
	},
};

// Reusable toolbar matching the WithPriority story from nldd-toolbar
const toolbar = html`
	<nldd-container
		padding-inline="16"
		padding-block="12"
	>
		<nldd-toolbar>
			<nldd-toolbar-item
				slot="start"
				label="Tekststijl"
				priority="1"
			>
				<nldd-segmented-control
					type="checkbox"
					variant="icon"
					accessible-label="Tekststijl"
				>
					<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="onderstrepen" text="Onderstrepen" icon="underlined"></nldd-segmented-control-item>
				</nldd-segmented-control>
				<nldd-menu-item
					slot="overflow"
					text="Vet"
					type="checkbox"
				></nldd-menu-item>
				<nldd-menu-item
					slot="overflow"
					text="Cursief"
					type="checkbox"
				></nldd-menu-item>
				<nldd-menu-item
					slot="overflow"
					text="Onderstrepen"
					type="checkbox"
				></nldd-menu-item>
			</nldd-toolbar-item>
			<nldd-toolbar-item
				slot="start"
				label="Lijst"
				priority="2"
			>
				<nldd-segmented-control
					type="radio"
					variant="icon"
					accessible-label="Lijsttype"
				>
					<nldd-segmented-control-item value="none" text="Geen" icon="minus-small"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="bullet" text="Lijst" icon="bullet-list"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="numbered" text="Genummerd" icon="numbered-list"></nldd-segmented-control-item>
				</nldd-segmented-control>
				<nldd-menu-item
					slot="overflow"
					text="Geen"
					type="checkbox"
				></nldd-menu-item>
				<nldd-menu-item
					slot="overflow"
					text="Lijst"
					type="checkbox"
				></nldd-menu-item>
				<nldd-menu-item
					slot="overflow"
					text="Genummerd"
					type="checkbox"
				></nldd-menu-item>
			</nldd-toolbar-item>
			<nldd-toolbar-title
				slot="center"
				text="Document titel"
				supporting-text="Laatste wijziging: vandaag"
				align="center"
			></nldd-toolbar-title>
			<nldd-toolbar-item
				slot="end"
				label="Annuleer"
				priority="3"
			>
				<nldd-button text="Annuleer"></nldd-button>
				<nldd-menu-item
					slot="overflow"
					text="Annuleer"
				></nldd-menu-item>
			</nldd-toolbar-item>
			<nldd-toolbar-item
				slot="end"
				label="Sla op"
				priority="10"
			>
				<nldd-button variant="primary" text="Sla op"></nldd-button>
				<nldd-menu-item
					slot="overflow"
					text="Sla op"
				></nldd-menu-item>
			</nldd-toolbar-item>
		</nldd-toolbar>
	</nldd-container>
`;

// Reusable main content
const mainContent = html`
	<nldd-page>
		<nldd-simple-section>
			<nldd-rich-text>
				<h2>Primaire inhoud</h2>
				<p>Het hoofdgebied voor bewerkbare of weer te geven inhoud.</p>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
				<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
				<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
				<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
				<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
			</nldd-rich-text>
		</nldd-simple-section>
	</nldd-page>
`;

export const Standaard = (args: Record<string, any>) => html`
	<nldd-bar-split-view
		style="height: 600px;"
		background=${args.background}
	>
		<nldd-split-view-pane
			slot="toolbar"
			sm-order="1"
			md-order="1"
			lg-order="1"
		>
			${toolbar}
		</nldd-split-view-pane>
		<nldd-split-view-pane
			slot="main"
			sm-order="2"
			md-order="2"
			lg-order="2"
		>
			${mainContent}
		</nldd-split-view-pane>
	</nldd-bar-split-view>
`;

export const MetStatusbalk = {
	render: (args: Record<string, any>) => html`
	<nldd-bar-split-view
		style="height: 600px;"
		background=${args.background}
	>
		<nldd-split-view-pane
			slot="toolbar"
			sm-order="1"
			md-order="1"
			lg-order="1"
		>
			${toolbar}
		</nldd-split-view-pane>
		<nldd-split-view-pane
			slot="main"
			sm-order="2"
			md-order="2"
			lg-order="2"
		>
			${mainContent}
		</nldd-split-view-pane>
		<nldd-split-view-pane
			slot="status-bar"
			sm-order="3"
			md-order="3"
			lg-order="3"
		>
			<nldd-container
				padding-inline="16"
				padding-block="12"
				sm-padding-bottom="none"
			>
				<nldd-toolbar>
					<nldd-toolbar-item
						slot="center"
						label="Zoeken"
						min-width="240px"
						width="70%"
						priority="3"
					>
						<nldd-search-field placeholder="Zoeken..."></nldd-search-field>
						<nldd-menu-item
							slot="overflow"
							text="Zoeken"
						></nldd-menu-item>
					</nldd-toolbar-item>
				</nldd-toolbar>
			</nldd-container>
		</nldd-split-view-pane>
	</nldd-bar-split-view>
`,
	parameters: { controls: { disable: true } },
};

// On sm: main is visible at top, toolbar moves to a bottom bar.
// On md/lg: toolbar is above main, matching DOM order.
export const WisselVolgorde = {
	render: () => html`
	<nldd-bar-split-view style="height: 600px;">
		<nldd-split-view-pane
			slot="toolbar"
			sm-order="2"
			md-order="1"
			lg-order="1"
		>
			${toolbar}
		</nldd-split-view-pane>
		<nldd-split-view-pane
			slot="main"
			sm-order="1"
			md-order="2"
			lg-order="2"
		>
			<nldd-page>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Primaire inhoud</h2>
						<p>Op sm staat de werkbalk onderaan als overlay. Op md en lg staat hij bovenaan in de flow.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>
		</nldd-split-view-pane>
	</nldd-bar-split-view>
`,
	parameters: { controls: { disable: true } },
};

// Toolbar only visible on md and lg; mobile bar only visible on sm.
export const ResponsieveBalken = {
	render: () => html`
	<nldd-bar-split-view style="height: 600px;">
		<nldd-split-view-pane
			slot="toolbar"
			above="md"
			sm-order="1"
			md-order="1"
			lg-order="1"
		>
			${toolbar}
		</nldd-split-view-pane>
		<nldd-split-view-pane
			slot="mobile-bar"
			only="sm"
			sm-order="3"
		>
			<nldd-container
				padding-inline="16"
				padding-block="12"
				sm-padding-bottom="none"
			>
				<nldd-toolbar>
					<nldd-toolbar-item
						slot="start"
						label="Sla op"
					>
						<nldd-button variant="primary" text="Sla op"></nldd-button>
						<nldd-menu-item
							slot="overflow"
							text="Sla op"
						></nldd-menu-item>
					</nldd-toolbar-item>
					<nldd-toolbar-item
						slot="end"
						label="Annuleer"
					>
						<nldd-button text="Annuleer"></nldd-button>
						<nldd-menu-item
							slot="overflow"
							text="Annuleer"
						></nldd-menu-item>
					</nldd-toolbar-item>
				</nldd-toolbar>
			</nldd-container>
		</nldd-split-view-pane>
		<nldd-split-view-pane
			slot="main"
			sm-order="2"
			md-order="2"
			lg-order="2"
		>
			${mainContent}
		</nldd-split-view-pane>
	</nldd-bar-split-view>
`,
	parameters: { controls: { disable: true } },
};
