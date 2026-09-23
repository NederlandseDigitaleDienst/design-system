import { html, nothing } from 'lit';
import './just-in-time-education.js';
import '../../inputs/search-field/search-field.js';

export default {
	title: 'Components/Status & Feedback/Just in Time Education',
	component: 'nldd-just-in-time-education',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/status-and-feedback/just-in-time-education/just-in-time-education.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'experimental' },
	},
	args: {
		text: 'Zoek een wet om te openen',
		supportingText: 'Markeer een wet als favoriet om die later snel terug te vinden.',
		placement: 'auto',
		arrowLength: '',
		noArrow: false,
		dismissable: false,
		active: true,
	},
	argTypes: {
		text: {
			control: 'text',
			description: 'Titel van de callout',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Ondersteunende tekst onder de titel',
		},
		placement: {
			control: 'select',
			options: ['auto', 'top', 'bottom', 'left', 'right'],
			description: 'Kant van de callout ten opzichte van het control',
			table: { defaultValue: { summary: 'auto' } },
		},
		arrowLength: {
			name: 'arrow-length',
			control: 'text',
			description: 'Pijllengte / afstand tussen card en control, als CSS-lengte (bijv. 333px, 30vh); leeg = DS-standaard. Onder 40px wordt geklemd.',
			table: { defaultValue: { summary: '64px' } },
		},
		noArrow: {
			name: 'no-arrow',
			control: 'boolean',
			description: 'Verberg de pijl; de card staat dan dicht tegen het control',
			table: { defaultValue: { summary: false } },
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
	text,
	supportingText,
	placement,
	arrowLength,
	noArrow,
	dismissable,
	active,
}: {
	text: string;
	supportingText: string;
	placement: string;
	arrowLength: string;
	noArrow: boolean;
	dismissable: boolean;
	active: boolean;
}) => html`
	<div style="display: flex; justify-content: center; padding-block: 48px; background: var(--semantics-surfaces-tinted-background-color);">
		<nldd-just-in-time-education
			text=${text || nothing}
			supporting-text=${supportingText || nothing}
			placement=${placement || nothing}
			arrow-length=${arrowLength || nothing}
			?no-arrow=${noArrow}
			?dismissable=${dismissable}
			?active=${active}
		>
			<nldd-search-field placeholder="Zoeken" width="320px"></nldd-search-field>
		</nldd-just-in-time-education>
	</div>
`;

export const Standaard = Template.bind({});
