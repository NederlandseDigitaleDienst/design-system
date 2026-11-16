import { html } from 'lit';
import './accordion.js';
import './accordion-item.js';
import '../rich-text/rich-text.js';

/**
 * Een accordion stapelt items die elk hun inhoud op hun plek in- en
 * uitklappen. Klap alleen korte, aanvullende inhoud uit, zoals het antwoord op
 * een vraag. Is de inhoud lang, staat er een formulier in of is het een taak op
 * zich, zet dan rijen in een `nldd-list` die elk een `nldd-sheet` openen.
 */
export default {
	title: 'Components/Content/Accordion',
	component: 'nldd-accordion',
	subcomponents: { 'nldd-accordion-item': 'nldd-accordion-item' },
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/accordion/accordion.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
	},
	args: {
		exclusive: false,
	},
	argTypes: {
		exclusive: {
			control: 'boolean',
			description: 'Er staat maar één item tegelijk open',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = ({ exclusive }: Record<string, any>) => html`
	<nldd-accordion ?exclusive=${exclusive}>
		<nldd-accordion-item text="Welke stukken horen bij de aanvraag?">
			<nldd-rich-text>
				<p>De offerte van het isolatiebedrijf en een foto van het dak voor de isolatie.</p>
			</nldd-rich-text>
		</nldd-accordion-item>
		<nldd-accordion-item text="Hoe lang duurt de beoordeling?">
			<nldd-rich-text>
				<p>Team Uitvoering neemt binnen acht weken een besluit over de aanvraag.</p>
			</nldd-rich-text>
		</nldd-accordion-item>
		<nldd-accordion-item text="Kan ik de aanvraag later aanvullen?">
			<nldd-rich-text>
				<p>Ja, zolang de aanvraag in behandeling is, kun je stukken toevoegen.</p>
			</nldd-rich-text>
		</nldd-accordion-item>
	</nldd-accordion>
`;

export const Standaard = {
	render: Template,
};

export const EenTegelijk = {
	name: 'Eén tegelijk open',
	render: () => Template({ exclusive: true }),
};
