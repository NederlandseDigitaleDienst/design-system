import { html } from 'lit';
import './app-view.js';
import '../split-views/navigation-split-view/navigation-split-view.js';
import '../page/page.js';
import '../page-sections/simple-section/simple-section.js';
import '../container/container.js';
import '../../content/rich-text/rich-text.js';

/**
 * De <code>nldd-app-view</code> is de verplichte root shell van elke Nederlandse Digitale Dienst applicatie.
 * Hij bevat altijd een split view of een <code>nldd-page</code> als directe inhoud.
 *
 * ## Gebruik
 * ```html
 * <nldd-app-view>
 *   <nldd-navigation-split-view>...</nldd-navigation-split-view>
 * </nldd-app-view>
 * ```
 */
export default {
	title: 'Components/Layout/App View',
	component: 'nldd-app-view',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		componentSource: {
			file: 'src/components/layout/app-view/app-view.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		background: 'base',
	},
	argTypes: {
		background: {
			control: { type: 'select' },
			options: ['base', 'tinted'],
			description: 'Tinted achtergrond — cascade van --context-parent-background-color naar alle afstammelingen',
			table: { defaultValue: { summary: 'base' } },
		},
	},
};

export const MetHorizontalSplitView = ({ background }: { background: string }) => html`
	<nldd-app-view style="height: 600px;" background=${background}>
		<nldd-navigation-split-view>
			<nldd-page sticky-header slot="primary-sidebar" accessible-label="Navigatie">
				<nldd-container slot="header" padding="16">
					<nldd-rich-text>
						<strong>Zijbalk</strong>
					</nldd-rich-text>
				</nldd-container>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Navigatie</h2>
						<p>Wetten, regelingen en andere bronnen.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>

			<nldd-page sticky-header slot="secondary-sidebar" accessible-label="Tweede navigatie">
				<nldd-container slot="header" padding="16">
					<nldd-rich-text>
						<strong>Secundaire zijbalk</strong>
					</nldd-rich-text>
				</nldd-container>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Subnavigatie</h2>
						<p>Artikelen, hoofdstukken of andere subitems.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>

			<nldd-page sticky-header slot="main" landmarks="page">
				<nldd-container slot="header" padding="16">
					<nldd-rich-text>
						<strong>Inhoud</strong>
					</nldd-rich-text>
				</nldd-container>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Primaire inhoud</h2>
						<p>Artikelen, artikellijsten en primaire weergave.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>

			<nldd-page sticky-header slot="inspector" accessible-label="Details">
				<nldd-container slot="header" padding="16">
					<nldd-rich-text>
						<strong>Inspecteur</strong>
					</nldd-rich-text>
				</nldd-container>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Details</h2>
						<p>Eigenschappen en aanvullende informatie over de selectie.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>
		</nldd-navigation-split-view>
	</nldd-app-view>
`;

export const MetPagina = () => html`
	<nldd-app-view style="height: 600px;">
		<nldd-page sticky-header>
			<nldd-container slot="header" padding="16">
				<nldd-rich-text>
					<strong>Pagina</strong>
				</nldd-rich-text>
			</nldd-container>
			<nldd-simple-section>
				<nldd-rich-text>
					<h2>Inhoud</h2>
					<p>Een enkelvoudige pagina zonder split view.</p>
				</nldd-rich-text>
			</nldd-simple-section>
		</nldd-page>
	</nldd-app-view>
`;

/**
 * Elk split-view-paneel kan een eigen achtergrondkleur hebben.
 * Het instellen van tinted op een paneel laat --context-parent-background-color alleen
 * doorwerken naar de afstammelingen van dat paneel. Naburige panelen blijven ongewijzigd.
 */
export const TintedPerPaneel = {
	render: () => html`
	<nldd-app-view style="height: 600px;">
		<nldd-navigation-split-view>
			<nldd-page sticky-header slot="primary-sidebar" background="tinted" accessible-label="Zijbalk">
				<nldd-container slot="header" padding="16">
					<nldd-rich-text>
						<strong>Zijbalk (tinted)</strong>
					</nldd-rich-text>
				</nldd-container>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Navigatie</h2>
						<p>Deze zijbalk heeft een tinted achtergrond.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>

			<nldd-page sticky-header slot="main" landmarks="page">
				<nldd-container slot="header" padding="16">
					<nldd-rich-text>
						<strong>Inhoud (normaal)</strong>
					</nldd-rich-text>
				</nldd-container>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Primaire inhoud</h2>
						<p>Dit paneel heeft een normale achtergrond.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>
		</nldd-navigation-split-view>
	</nldd-app-view>
`,
	parameters: { controls: { disable: true } },
};
