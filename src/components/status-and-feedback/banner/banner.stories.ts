import { html, nothing } from 'lit';
import './banner.js';
import '../../actions/button/button.js';
import '../../content/rich-text/rich-text.js';
import { ICONS } from '../../content/icon/icon.js';

/**
 * Een banner toont een persistente, inline notificatie met een getinte
 * achtergrond per variant. Gebruik voor pagina-niveau feedback zoals
 * een foutmelding aan de bovenkant van een formulier.
 *
 * `role`, `aria-live` en `aria-atomic` worden automatisch op basis van de
 * variant gezet (critical → `role="alert"`, overige → `role="status"` met
 * `aria-live="polite"`). Voeg deze niet zelf toe.
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
		status: { type: 'beta' },
		docs: {
			// role / aria-live / aria-atomic are set on the host by the component
			// itself (based on variant), so strip them from the shown code — a
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
		icon: {
			control: 'select',
			options: ['(auto)', ...ICONS],
			mapping: { '(auto)': '' },
			description: 'Override van het standaard-icoon',
			table: { defaultValue: { summary: '(auto)' } },
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
		dismissible: {
			control: 'boolean',
			description: 'Toon een sluit-knop rechtsboven; emits `dismiss` event bij klik',
			table: { defaultValue: { summary: false } },
		},
	},
	args: {
		variant: 'neutral',
		size: 'md',
		icon: '',
		text: 'Banner-tekst',
		supportingText: '',
		headingLevel: undefined,
		dismissible: false,
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-banner
		variant=${args.variant}
		size=${args.size}
		icon=${args.icon || nothing}
		text=${args.text}
		supporting-text=${args.supportingText || nothing}
		heading-level=${args.headingLevel || nothing}
		?dismissible=${args.dismissible}
	></nldd-banner>
`;

export const Standaard = {
	render: Template,
};

export const AlleVarianten = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<nldd-banner
				variant="neutral"
				text="Standaard mededeling"
				supporting-text="Met wat extra context."
			></nldd-banner>
			<nldd-banner
				variant="accent"
				text="Uitgelicht"
				supporting-text="Een geaccentueerde mededeling die de aandacht trekt."
			></nldd-banner>
			<nldd-banner
				variant="success"
				text="Opgeslagen"
				supporting-text="Je wijzigingen zijn bewaard."
			></nldd-banner>
			<nldd-banner
				variant="warning"
				text="Let op"
				supporting-text="Deze actie heeft gevolgen voor andere gebruikers."
			></nldd-banner>
			<nldd-banner
				variant="critical"
				text="Er ging iets mis"
				supporting-text="Controleer de gemarkeerde velden hieronder."
			></nldd-banner>
		</div>
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
				<p>Op zondag 28 mei wordt het systeem onderhouden tussen 02:00 en 04:00. Tijdens deze periode:</p>
				<ul>
					<li>Kun je niet inloggen</li>
					<li>Kunnen openstaande zaken niet worden bewerkt</li>
					<li>Zijn lopende meldingen tijdelijk niet zichtbaar</li>
				</ul>
			</nldd-rich-text>
			<nldd-button
				slot="actions"
				appearance="neutral-tinted"
				text="Meer informatie"
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
				story: 'Met `dismissible` verschijnt een sluit-knop rechtsboven. Bij klik wordt een `dismiss` event gevuurd — de consumer is verantwoordelijk voor het verbergen of verwijderen van de banner.',
			},
		},
	},
};
