import { html } from 'lit';
import './navigation-split-view.js';
import '../../app-view/app-view.js';
import '../../page/page.js';
import '../../page-sections/simple-section/simple-section.js';
import '../../../content/rich-text/rich-text.js';
import '../../../actions/button/button.js';
import '../../../navigation/top-title-bar/top-title-bar.js';

/**
 * Gebruik een navigation split view voor een vierkoloms navigatiepatroon met
 * een zijbalk, secundaire zijbalk, inhoudsgebied en inspecteur.
 *
 * Gebruik <code>nldd-split-view-pane</code> als directe kinderen. De split view stelt
 * automatisch <code>hide-back</code> in op elk paneel op basis van de beschikbare ruimte.
 * Panelen worden automatisch getoond wanneer inhoud in de bijbehorende slot wordt geplaatst.
 *
 * ## Gebruik
 * ```html
 * <nldd-navigation-split-view>
 *   <nldd-split-view-pane slot="primary-sidebar">...</nldd-split-view-pane>
 *   <nldd-split-view-pane slot="secondary-sidebar">...</nldd-split-view-pane>
 *   <nldd-split-view-pane slot="main" has-content>...</nldd-split-view-pane>
 *   <nldd-split-view-pane slot="inspector">...</nldd-split-view-pane>
 * </nldd-navigation-split-view>
 * ```
 */
export default {
	title: 'Components/Layout/Split Views/Navigation Split View',
	component: 'nldd-navigation-split-view',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		componentSource: {
			file: 'src/components/layout/split-views/navigation-split-view/navigation-split-view.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		inspectorAsSheet: false,
		primarySidebarAsSheet: false,
	},
	argTypes: {
		inspectorAsSheet: {
			name: 'inspector-as-sheet',
			control: 'boolean',
			description: 'Toon de inspecteur altijd als sheet, ongeacht beschikbare ruimte',
			table: { defaultValue: { summary: 'false' } },
		},
		primarySidebarAsSheet: {
			name: 'primary-sidebar-as-sheet',
			control: 'boolean',
			description: 'Toon de zijbalk altijd als sheet, inhoudsgebied blijft altijd zichtbaar',
			table: { defaultValue: { summary: 'false' } },
		},
	},
};

export const Standaard = ({ inspectorAsSheet, primarySidebarAsSheet }: Record<string, any>) => {
	customElements.whenDefined('nldd-navigation-split-view').then(() => {
		const splitView = document.getElementById('split-view-demo') as (HTMLElement & { showInspectorSheet: () => void; showPrimarySidebarSheet: () => void }) | null;
		const inspectorButton = document.getElementById('inspector-toggle');
		const navButton = document.getElementById('sidebar-toggle');
		if (!splitView) return;

		const updateInspectorButton = () => {
			if (inspectorButton) {
				inspectorButton.hidden = !splitView.hasAttribute('inspector-auto-hidden') && !splitView.hasAttribute('inspector-as-sheet');
			}
		};

		const updateNavButton = () => {
			if (navButton) {
				navButton.hidden = !splitView.hasAttribute('primary-sidebar-as-sheet');
			}
		};

		updateInspectorButton();
		updateNavButton();

		new MutationObserver(() => { updateInspectorButton(); updateNavButton(); }).observe(splitView, {
			attributes: true,
			attributeFilter: ['inspector-auto-hidden', 'inspector-as-sheet', 'primary-sidebar-as-sheet'],
		});

		inspectorButton?.addEventListener('click', () => splitView.showInspectorSheet());
		navButton?.addEventListener('click', () => splitView.showPrimarySidebarSheet());
	});

	return html`
		<nldd-navigation-split-view
			id="split-view-demo"
			style="height: 600px;"
			?inspector-as-sheet=${inspectorAsSheet}
			?primary-sidebar-as-sheet=${primarySidebarAsSheet}
		>
			<nldd-split-view-pane slot="primary-sidebar">
				<nldd-page sticky-header accessible-label="Navigatie">
					<nldd-top-title-bar
						slot="header"
						text="Zijbalk"
						dismiss-text="Sluit"
					></nldd-top-title-bar>
					<nldd-simple-section>
						<nldd-rich-text>
							<h2>Navigatie</h2>
							<p>Wetten, regelingen en andere bronnen.</p>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
							<p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
							<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
							<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
							<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
							<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
							<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
							<p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
							<p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.</p>
							<p>Et harum quidem rerum facilis est et expedita distinctio.</p>
							<p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.</p>
						</nldd-rich-text>
					</nldd-simple-section>
				</nldd-page>
			</nldd-split-view-pane>

			<nldd-split-view-pane slot="secondary-sidebar" has-content>
				<nldd-page sticky-header accessible-label="Tweede navigatie">
					<nldd-top-title-bar
						slot="header"
						text="Secundaire zijbalk"
						back-text="Zijbalk"
						dismiss-text="Sluit"
					></nldd-top-title-bar>
					<nldd-simple-section>
						<nldd-rich-text>
							<h2>Subnavigatie</h2>
							<p>Artikelen, hoofdstukken of andere subitems.</p>
							<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem.</p>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
							<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
							<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
							<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
							<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
							<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
							<p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
							<p>At vero eos et accusamus et iusto odio dignissimos ducimus.</p>
						</nldd-rich-text>
					</nldd-simple-section>
				</nldd-page>
			</nldd-split-view-pane>

			<nldd-split-view-pane slot="main" has-content>
				<nldd-page sticky-header landmarks="page">
					<nldd-top-title-bar
						slot="header"
						text="Inhoud"
						back-text="Terug"
					>
						<nldd-button
							id="sidebar-toggle"
							slot="toolbar"
							variant="accent-transparent"
							text="Navigatie"
						></nldd-button>
						<nldd-button
							id="inspector-toggle"
							slot="toolbar"
							variant="accent-transparent"
							text="Inspecteur"
						></nldd-button>
					</nldd-top-title-bar>
					<nldd-simple-section>
						<nldd-rich-text>
							<h2>Primaire inhoud</h2>
							<p>Artikelen, artikellijsten en primaire weergave.</p>
							<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.</p>
							<p>Verklein het venster om de terugknopgedrag te zien.</p>
						</nldd-rich-text>
					</nldd-simple-section>
				</nldd-page>
			</nldd-split-view-pane>

			<nldd-split-view-pane slot="inspector">
				<nldd-page sticky-header accessible-label="Details">
					<nldd-top-title-bar
						slot="header"
						text="Inspecteur"
						dismiss-text="Sluit"
					></nldd-top-title-bar>
					<nldd-simple-section>
						<nldd-rich-text>
							<h2>Details</h2>
							<p>Eigenschappen en aanvullende informatie over de selectie.</p>
							<p>Excepteur sint occaecat cupidatat non proident.</p>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
							<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
							<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
							<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
							<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
							<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
							<p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
							<p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.</p>
							<p>Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio.</p>
							<p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates.</p>
						</nldd-rich-text>
					</nldd-simple-section>
				</nldd-page>
			</nldd-split-view-pane>
		</nldd-navigation-split-view>
	`;
};

/**
 * Split views can be nested. Here a bar split view is placed inside
 * the main pane of a navigation split view, creating an editor-like layout
 * with a sidebar, an editor area, and an output panel below it.
 */
export const GenestdeSplitView = {
	render: () => html`
	<nldd-navigation-split-view
		style="height: 600px;"
	>
		<nldd-split-view-pane slot="primary-sidebar">
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Zijbalk"
					dismiss-text="Sluit"
				></nldd-top-title-bar>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Navigatie</h2>
						<p>Wetten, regelingen en andere bronnen.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>
		</nldd-split-view-pane>

		<nldd-split-view-pane slot="main" has-content>
			<nldd-bar-split-view>
				<nldd-split-view-pane slot="main">
					<nldd-page sticky-header landmarks="page">
						<nldd-top-title-bar
							slot="header"
							text="Inhoud"
							back-text="Terug"
						></nldd-top-title-bar>
						<nldd-simple-section>
							<nldd-rich-text>
								<h2>Primaire inhoud</h2>
								<p>Het hoofdgebied voor bewerkbare of weer te geven inhoud.</p>
								<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
							</nldd-rich-text>
						</nldd-simple-section>
					</nldd-page>
				</nldd-split-view-pane>
				<nldd-split-view-pane slot="secondary-bar">
					<nldd-container padding="16">
						<nldd-button variant="primary" width="full" text="Secondaire balk"></nldd-button>
					</nldd-container>
				</nldd-split-view-pane>
			</nldd-bar-split-view>
		</nldd-split-view-pane>
	</nldd-navigation-split-view>
`,
	parameters: { controls: { disable: true } },
};
