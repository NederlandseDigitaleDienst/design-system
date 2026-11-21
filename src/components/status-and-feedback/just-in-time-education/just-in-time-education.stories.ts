import { html, nothing } from 'lit';
import './just-in-time-education.js';
import '../../inputs/search-field/search-field.js';

/**
 * `nldd-just-in-time-education` is een coach mark: een kaartje met een tip dat
 * naar een control wijst, zoals een `nldd-search-field`. De app zet hem aan met
 * `active`, en de pagina eromheen blijft bruikbaar.
 */
export default {
	title: 'Components/Status & Feedback/Just in Time Education',
	component: 'nldd-just-in-time-education',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/status-and-feedback/just-in-time-education/just-in-time-education.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
	},
	args: {
		placement: 'auto',
		text: 'Zoek een aanvraag om te openen',
		supportingText: 'Markeer een aanvraag als favoriet om die later snel terug te vinden.',
		noArrow: false,
		arrowLength: '',
		dismissable: false,
		active: true,
	},
	argTypes: {
		placement: {
			control: 'select',
			options: ['auto', 'top', 'bottom', 'left', 'right'],
			description: 'Kant van de callout ten opzichte van het control',
			table: { defaultValue: { summary: 'auto' } },
		},
		text: {
			control: 'text',
			description: 'Titel van de callout',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Ondersteunende tekst onder de titel',
		},
		noArrow: {
			name: 'no-arrow',
			control: 'boolean',
			description: 'Verberg de pijl; de card staat dan dicht tegen het control',
			table: { defaultValue: { summary: false } },
		},
		arrowLength: {
			name: 'arrow-length',
			control: 'text',
			description: 'Pijllengte / afstand tussen card en control, als CSS-lengte (bijv. 333px, 30vh); leeg = DS-standaard. Onder 40px wordt geklemd.',
			table: { defaultValue: { summary: '64px' } },
		},
		dismissable: {
			control: 'boolean',
			description: 'Toon de dismiss-knop en sta sluiten toe via 1 klik/toets buiten de coach-mark',
			table: { defaultValue: { summary: false } },
		},
		active: {
			control: 'boolean',
			description: 'Toon de coach-mark (app-gestuurd)',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = ({
	placement,
	text,
	supportingText,
	noArrow,
	arrowLength,
	dismissable,
	active,
}: {
	placement: string;
	text: string;
	supportingText: string;
	noArrow: boolean;
	arrowLength: string;
	dismissable: boolean;
	active: boolean;
}) => html`
	<div style="display: flex; justify-content: center; padding-block: 48px; background: var(--semantics-surfaces-tinted-background-color); --context-background-color: var(--semantics-surfaces-tinted-background-color);">
		<nldd-just-in-time-education
			placement=${placement || nothing}
			text=${text || nothing}
			supporting-text=${supportingText || nothing}
			?no-arrow=${noArrow}
			arrow-length=${arrowLength || nothing}
			?dismissable=${dismissable}
			?active=${active}
		>
			<nldd-search-field
				placeholder="Zoeken"
				width="320px"
			></nldd-search-field>
		</nldd-just-in-time-education>
	</div>
`;

export const Standaard = Template.bind({});
