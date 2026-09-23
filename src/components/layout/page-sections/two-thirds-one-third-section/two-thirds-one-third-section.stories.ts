import { html } from 'lit';
import './two-thirds-one-third-section.js';
import '../../../content/title/title.js';
import '../../../content/rich-text/rich-text.js';
import { pageSectionArgTypes, pageSectionArgs, pageSectionAttrs } from '../page-section-controls.js';

/**
 * Gebruik een two-thirds one-third section wanneer de hoofdinhoud de meeste
 * aandacht verdient en de zijkolom ondersteunend is, zoals een artikel met
 * een gerelateerde-inhoudpaneel of een formulier met uitleg rechts.
 * De kolommen wrappen automatisch wanneer de beschikbare breedte kleiner
 * wordt dan 280px per kolom.
 *
 * ## Gebruik
 * ```html
 * <nldd-two-thirds-one-third-section>
 *   <nldd-title slot="header" text="Sectietitel" heading-level="2"></nldd-title>
 *   <nldd-rich-text><p>Hoofdinhoud.</p></nldd-rich-text>
 *   <nldd-rich-text slot="right"><p>Zijkolom.</p></nldd-rich-text>
 * </nldd-two-thirds-one-third-section>
 * ```
 */
export default {
	title: 'Components/Layout/Page Sections/Two Thirds One Third Section',
	component: 'nldd-two-thirds-one-third-section',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/page-sections/two-thirds-one-third-section/two-thirds-one-third-section.ts',
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
		<nldd-two-thirds-one-third-section ${pageSectionAttrs(args)}>
			<nldd-title slot="header"
				text="Sectietitel"
				heading-level="2"
			></nldd-title>
			<nldd-rich-text>
				<h3>Hoofdinhoud</h3>
				<p>Dit is de hoofdinhoud van de sectie. Deze kolom neemt twee derde van de breedte in.</p>
				<p>De kolommen wrappen automatisch wanneer de beschikbare breedte te klein wordt.</p>
			</nldd-rich-text>
			<nldd-rich-text slot="right">
				<h3>Zijkolom</h3>
				<p>Gebruik de zijkolom voor gerelateerde informatie, uitleg of aanvullende acties.</p>
			</nldd-rich-text>
			<nldd-rich-text slot="footer">
				<p>Voetnoot of aanvullende informatie.</p>
			</nldd-rich-text>
		</nldd-two-thirds-one-third-section>
	`,
};

export const ZonderHeaderEnFooter = {
	render: () => html`
	<nldd-two-thirds-one-third-section>
		<nldd-rich-text>
			<h3>Hoofdinhoud</h3>
			<p>De hoofdinhoud van de sectie zonder header en footer.</p>
		</nldd-rich-text>
		<nldd-rich-text slot="right">
			<h3>Zijkolom</h3>
			<p>Aanvullende informatie.</p>
		</nldd-rich-text>
	</nldd-two-thirds-one-third-section>
`,
	parameters: { controls: { disable: true } },
};
