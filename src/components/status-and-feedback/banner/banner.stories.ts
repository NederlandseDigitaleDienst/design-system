import { html, nothing } from 'lit';
import './banner.js';
import '../../actions/button/button.js';
import '../../content/rich-text/rich-text.js';
import { ICONS } from '../../content/icon/icon.js';
import '../../layout/container/container.js';

/**
 * `nldd-banner` toont een persistente, inline notificatie met een getinte
 * achtergrond per variant. Gebruik voor pagina-niveau feedback zoals
 * een foutmelding aan de bovenkant van een formulier.
 */
export default {
	title: 'Components/Status & Feedback/Banner',
	component: 'nldd-banner',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/status-and-feedback/banner/banner.ts',
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
	argTypes: {
		variant: {
			control: 'select',
			options: ['neutral', 'accent', 'success', 'warning', 'critical'],
			description: 'Kleur en standaard-icoon',
			table: { defaultValue: { summary: 'neutral' } },
		},
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Bannermaat; sm gebruikt 8px padding en een icoon van 24px',
			table: { defaultValue: { summary: 'md' } },
		},
		text: {
			control: 'text',
			description: 'Hoofdtekst',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Ondersteunende tekst onder de hoofdtekst',
		},
		headingLevel: {
			name: 'heading-level',
			control: 'select',
			options: ['(geen)', 1, 2, 3, 4, 5, 6],
			mapping: { '(geen)': undefined },
			description: 'Rendert hoofdtekst als h1–h6; afwezig rendert als p',
			table: { defaultValue: { summary: '(geen)' } },
		},
		icon: {
			control: 'select',
			options: ['(auto)', ...ICONS],
			mapping: { '(auto)': '' },
			description: 'Override van het standaard-icoon',
			table: { defaultValue: { summary: '(auto)' } },
		},
		dismissible: {
			control: 'boolean',
			description: 'Toon een sluit-knop rechtsboven; emits `dismiss` event bij klik',
			table: { defaultValue: { summary: false } },
		},
	},
	args: {
		variant: 'neutral',
		size: 'md',
		text: 'Aanvraag A-1042 is in behandeling',
		supportingText: '',
		headingLevel: undefined,
		icon: '',
		dismissible: false,
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-banner
		variant=${args.variant}
		size=${args.size}
		text=${args.text}
		supporting-text=${args.supportingText || nothing}
		heading-level=${args.headingLevel || nothing}
		icon=${args.icon || nothing}
		?dismissible=${args.dismissible}
	></nldd-banner>
`;

export const Standaard = {
	render: Template,
};

export const AlleVarianten = {
	render: () => html`
		<nldd-container gap="16">
			<nldd-banner
				variant="neutral"
				text="Aanvraag A-1042 is in behandeling"
				supporting-text="Je hoort binnen vijf werkdagen van ons."
			></nldd-banner>
			<nldd-banner
				variant="accent"
				text="Dossier D-319 is aan je toegewezen"
				supporting-text="Team Beleid vraagt je om het dossier deze week op te pakken."
			></nldd-banner>
			<nldd-banner
				variant="success"
				text="Aanvraag A-1043 is afgerond"
				supporting-text="Je wijzigingen zijn bewaard."
			></nldd-banner>
			<nldd-banner
				variant="warning"
				text="Let op"
				supporting-text="Deze wijziging raakt ook Dossier D-318 van team Uitvoering."
			></nldd-banner>
			<nldd-banner
				variant="critical"
				text="Er ging iets mis"
				supporting-text="Controleer de gemarkeerde velden hieronder."
			></nldd-banner>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

export const MetActies = {
	render: () => html`
		<nldd-banner
			variant="neutral"
			text="Nieuwe versie beschikbaar"
			supporting-text="Ververs de pagina om de laatste versie van de applicatie te laden."
		>
			<nldd-button
				slot="actions"
				appearance="accent-filled"
				text="Ververs nu"
			></nldd-button>
			<nldd-button
				slot="actions"
				appearance="neutral-tinted"
				text="Later"
			></nldd-button>
		</nldd-banner>
	`,
	parameters: { controls: { disable: true } },
};

export const MetRichContent = {
	render: () => html`
		<nldd-banner
			variant="warning"
			text="Onderhoud gepland"
			heading-level="2"
		>
			<nldd-rich-text spacing="flat">
				<p>Zondagnacht wordt Mijn Dienst onderhouden tussen 02:00 en 04:00. Tijdens deze periode:</p>
				<ul>
					<li>Kun je niet inloggen</li>
					<li>Kunnen openstaande zaken niet worden bewerkt</li>
					<li>Zijn lopende meldingen tijdelijk niet zichtbaar</li>
				</ul>
			</nldd-rich-text>
			<nldd-button
				slot="actions"
				appearance="neutral-tinted"
				text="Onderhoud bekijken"
			></nldd-button>
		</nldd-banner>
	`,
	parameters: { controls: { disable: true } },
};

export const Sluitbaar = {
	render: () => html`
		<nldd-banner
			variant="neutral"
			text="Nieuw in deze versie"
			supporting-text="Je kunt nu in je dossier filteren op type."
			dismissible
		></nldd-banner>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met `dismissible` verschijnt een sluit-knop rechtsboven. Bij klik wordt een `dismiss` event gevuurd. De consumer is verantwoordelijk voor het verbergen of verwijderen van de banner.',
			},
		},
	},
};
