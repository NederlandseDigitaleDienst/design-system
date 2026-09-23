import { html } from 'lit';
import './split-view-pane.js';
import '../navigation-split-view/navigation-split-view.js';
import '../../page/page.js';
import '../../page-sections/simple-section/simple-section.js';
import '../../../content/rich-text/rich-text.js';
import '../../../navigation/top-title-bar/top-title-bar.js';

/**
 * Het <code>nldd-split-view-pane</code> is een eenvoudige paneel-container voor gebruik
 * binnen split views. De split view stelt automatisch <code>mode</code> en
 * <code>hide-back</code> in op basis van de beschikbare ruimte en de paneelconfiguratie.
 *
 * De consumer stelt <code>has-content</code> in en plaatst een <code>nldd-page</code>
 * met een <code>nldd-top-title-bar</code> binnenin. Wanneer <code>hide-back</code> actief is,
 * verbergt het paneel automatisch de terugknop via de <code>--context-back-button-display</code>
 * CSS-variabele.
 *
 * ## Gebruik
 * ```html
 * <nldd-split-view-pane slot="main" has-content>
 *   <nldd-page sticky-header>
 *     <nldd-top-title-bar slot="header" text="Inhoud" back-text="Terug"></nldd-top-title-bar>
 *     ...
 *   </nldd-page>
 * </nldd-split-view-pane>
 * ```
 */
export default {
	title: 'Components/Layout/Split Views/Split View Pane',
	component: 'nldd-split-view-pane',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		componentSource: {
			file: 'src/components/layout/split-views/split-view-pane/split-view-pane.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		hasContent: true,
	},
	argTypes: {
		hasContent: {
			name: 'has-content',
			control: 'boolean',
			description: 'Het paneel heeft inhoud',
			table: { defaultValue: { summary: 'false' } },
		},
	},
};

export const Standaard = ({ hasContent }: Record<string, any>) => html`
	<nldd-navigation-split-view
		style="height: 600px;"

	>
		<nldd-split-view-pane slot="primary-sidebar">
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Zijbalk"
				></nldd-top-title-bar>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Navigatie</h2>
						<p>Lorem ipsum dolor sit amet.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>
		</nldd-split-view-pane>

		<nldd-split-view-pane slot="secondary-sidebar">
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Secundaire zijbalk"
					back-text="Zijbalk"
				></nldd-top-title-bar>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Subnavigatie</h2>
						<p>Sed ut perspiciatis.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>
		</nldd-split-view-pane>

		<nldd-split-view-pane
			slot="main"
			?has-content=${hasContent}
		>
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Inhoud"
					back-text="Terug"
				></nldd-top-title-bar>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Primaire inhoud</h2>
						<p>Verklein het venster om de modi en terugknopgedrag te zien.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>
		</nldd-split-view-pane>

		<nldd-split-view-pane slot="inspector">
			<nldd-page sticky-header>
				<nldd-top-title-bar
					slot="header"
					text="Inspecteur"
					dismiss-text="Sluit"
				></nldd-top-title-bar>
				<nldd-simple-section>
					<nldd-rich-text>
						<h2>Details</h2>
						<p>Eigenschappen en aanvullende informatie.</p>
					</nldd-rich-text>
				</nldd-simple-section>
			</nldd-page>
		</nldd-split-view-pane>
	</nldd-navigation-split-view>
`;
