import { html, nothing } from 'lit';
import './status-bar.js';
import '../../layout/container/container.js';

/**
 * `nldd-status-bar` is een smalle balk boven de hele app die de toestand van de
 * dienst meldt: een storing, gepland onderhoud, een conceptweergave of een
 * lopende opname. De balk toont alleen tekst, dus die tekst benoemt zelf de
 * status ("Storing: …"). Heb je meer te zeggen, of meer dan één actie, gebruik
 * dan een `nldd-banner`.
 */
export default {
	title: 'Components/Status & Feedback/Status Bar',
	component: 'nldd-status-bar',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/status-and-feedback/status-bar/status-bar.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		docs: {
			// role / aria-live / aria-atomic are set on the host by the component
			// itself (based on variant), so strip them from the shown code: a
			// consumer shouldn't think they need to add them by hand.
			source: {
				transform: (code: string) => code.replace(/\s+(?:role|aria-live|aria-atomic)="[^"]*"/g, ''),
			},
		},
	},
	args: {
		variant: 'neutral',
		text: 'Gepland onderhoud zaterdagavond, 22:00–00:00',
		href: '',
		target: '',
		button: false,
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['neutral', 'accent', 'success', 'warning', 'critical'],
			description: 'Kleur van de balk',
			table: { defaultValue: { summary: 'neutral' } },
		},
		text: {
			control: 'text',
			description: 'De statustekst (één regel; afgekapt met ellipsis)',
		},
		href: {
			control: 'text',
			description: 'Maakt de hele balk een link',
		},
		target: {
			control: 'select',
			options: ['(geen)', '_self', '_blank', '_parent', '_top'],
			mapping: { '(geen)': '' },
			description: 'Link target (alleen gebruikt als href is gezet)',
			table: { defaultValue: { summary: '(geen)' } },
		},
		button: {
			control: 'boolean',
			description: 'Maakt de hele balk een button; genegeerd als href is gezet',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-status-bar
		variant=${args.variant}
		text=${args.text}
		href=${args.href || nothing}
		target=${args.target || nothing}
		?button=${args.button}
	></nldd-status-bar>
`;

export const Standaard = {
	render: Template,
};

export const AlleVarianten = {
	render: () => html`
		<nldd-container gap="16">
			<nldd-status-bar
				variant="neutral"
				text="Conceptversie, nog niet gepubliceerd"
			></nldd-status-bar>
			<nldd-status-bar
				variant="accent"
				text="Je bekijkt een voorbeeldweergave"
			></nldd-status-bar>
			<nldd-status-bar
				variant="success"
				text="Alle systemen operationeel"
			></nldd-status-bar>
			<nldd-status-bar
				variant="warning"
				text="Gepland onderhoud zaterdagavond, 22:00–00:00"
			></nldd-status-bar>
			<nldd-status-bar
				variant="critical"
				text="Storing: inloggen bij Mijn Dienst is op dit moment niet mogelijk"
			></nldd-status-bar>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Met `href` wordt de hele balk een link naar de plek waar de gebruiker verder
 * leest, met een chevron erachter.
 */
export const AlsLink = {
	render: () => html`
		<nldd-status-bar
			variant="critical"
			text="Storing: inloggen bij Mijn Dienst is niet mogelijk, bekijk de actuele status"
			href="#status"
		></nldd-status-bar>
	`,
	parameters: { controls: { disable: true } },
};

export const AlsKnop = {
	render: () => html`
		<nldd-status-bar
			variant="accent"
			text="Je werkt in een testomgeving, ga terug naar de echte omgeving"
			button
		></nldd-status-bar>
	`,
	parameters: { controls: { disable: true } },
};

export const LangeTekst = {
	render: () => html`
		<nldd-container max-width="360px">
			<nldd-status-bar
				variant="warning"
				text="Gepland onderhoud zaterdagavond van 22:00 tot 00:00, sommige onderdelen van Mijn Dienst zijn dan tijdelijk niet bereikbaar"
			></nldd-status-bar>
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De balk toont één regel en kapt lange tekst af met ellipsis, hier op een smal scherm (360px). Heb je een lang bericht met veel informatie, verwijs dan naar een losse pagina of sheet waar de gebruiker verder kan lezen in plaats van te vertrouwen op de afgekapte balk.',
			},
		},
	},
};
