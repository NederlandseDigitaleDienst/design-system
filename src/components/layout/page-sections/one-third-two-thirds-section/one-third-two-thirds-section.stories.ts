import { html } from 'lit';
import './one-third-two-thirds-section.js';
import '../../../content/title/title.js';
import '../../../content/rich-text/rich-text.js';
import { pageSectionArgTypes, pageSectionArgs, pageSectionAttrs } from '../page-section-controls.js';

/**
 * Gebruik een one-third two-thirds section voor inhoud waarbij een smalle
 * zijkolom (1/3) naast een brede hoofdinhoud (2/3) staat, zoals een
 * navigatiemenu naast een formulier of een inhoudsopgave naast een artikel.
 * De kolommen wrappen automatisch wanneer de beschikbare breedte kleiner
 * wordt dan 280px per kolom.
 *
 * ## Gebruik
 * ```html
 * <nldd-one-third-two-thirds-section>
 *   <nldd-title slot="header" text="Sectietitel" heading-level="2"></nldd-title>
 *   <nldd-rich-text slot="left"><p>Zijkolom.</p></nldd-rich-text>
 *   <nldd-rich-text><p>Hoofdinhoud.</p></nldd-rich-text>
 * </nldd-one-third-two-thirds-section>
 * ```
 */
export default {
	title: 'Components/Layout/Page Sections/One Third Two Thirds Section',
	component: 'nldd-one-third-two-thirds-section',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/page-sections/one-third-two-thirds-section/one-third-two-thirds-section.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: pageSectionArgs,
	argTypes: pageSectionArgTypes,
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-one-third-two-thirds-section ${pageSectionAttrs(args)}>
			<nldd-title slot="header"
				text="Sectietitel"
				heading-level="2"
			></nldd-title>
			<nldd-rich-text slot="left">
				<h3>Zijkolom</h3>
				<p>Gebruik de zijkolom voor navigatie, filters of aanvullende informatie.</p>
			</nldd-rich-text>
			<nldd-rich-text>
				<h3>Hoofdinhoud</h3>
				<p>Dit is de hoofdinhoud van de sectie. Deze kolom neemt twee derde van de breedte in.</p>
				<p>De kolommen wrappen automatisch wanneer de beschikbare breedte te klein wordt.</p>
			</nldd-rich-text>
			<nldd-rich-text slot="footer">
				<p>Voetnoot of aanvullende informatie.</p>
			</nldd-rich-text>
		</nldd-one-third-two-thirds-section>
	`,
};

export const ZonderHeaderEnFooter = {
	render: () => html`
	<nldd-one-third-two-thirds-section>
		<nldd-rich-text slot="left">
			<h3>Zijkolom</h3>
			<p>Aanvullende informatie.</p>
		</nldd-rich-text>
		<nldd-rich-text>
			<h3>Hoofdinhoud</h3>
			<p>De hoofdinhoud van de sectie zonder header en footer.</p>
		</nldd-rich-text>
	</nldd-one-third-two-thirds-section>
`,
	parameters: { controls: { disable: true } },
};
