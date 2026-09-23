import { html, nothing } from 'lit';
import './status-bar.js';

/**
 * Een status bar is een smalle, paginabrede balk (24px) met een diepe
 * achtergrondkleur per variant. Gebruik voor persistente systeemtoestand:
 * een storing, gepland onderhoud, een conceptweergave of een lopende opname.
 *
 * De balk ondersteunt alleen tekst en toont bewust geen icoon. Laat de tekst
 * zelf de status benoemen ("Storing: …", "Gepland onderhoud …"), zodat de
 * betekenis niet alleen uit kleur volgt.
 *
 * Houd de tekst kort: de balk toont één regel en kapt af met ellipsis, zeker
 * op smallere schermen. Heb je een lang bericht met veel informatie, zet dan
 * alleen de kern in de balk en verwijs naar een losse pagina of sheet waar de
 * gebruiker verder kan lezen (bijvoorbeeld door de balk een `href` of `button`
 * te geven).
 *
 * De hele balk kan klikbaar zijn: zet `href` (link) of `button` (button;
 * luister naar `click`). Er verschijnt dan een chevron als affordance.
 * Maximaal één actie per balk — meer acties of links in lopende tekst horen
 * in een `nldd-banner`.
 *
 * `role`, `aria-live` en `aria-atomic` worden automatisch op basis van de
 * variant gezet (critical → `role="alert"`, overige → `role="status"` met
 * `aria-live="polite"`). Voeg deze niet zelf toe.
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
	args: {
		variant: 'neutral',
		text: 'Gepland onderhoud op zaterdag 14 juni, 22:00–00:00',
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
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<nldd-status-bar variant="neutral" text="Conceptversie — nog niet gepubliceerd"></nldd-status-bar>
			<nldd-status-bar variant="accent" text="U bekijkt een voorbeeldweergave"></nldd-status-bar>
			<nldd-status-bar variant="success" text="Alle systemen operationeel"></nldd-status-bar>
			<nldd-status-bar variant="warning" text="Gepland onderhoud op zaterdag 14 juni, 22:00–00:00"></nldd-status-bar>
			<nldd-status-bar variant="critical" text="Storing: inloggen met DigiD is op dit moment niet beschikbaar"></nldd-status-bar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const AlsLink = {
	render: () => html`
		<nldd-status-bar variant="critical"
			text="Storing: inloggen met DigiD is niet beschikbaar — bekijk de actuele status"
			href="#status"
		></nldd-status-bar>
	`,
	parameters: { controls: { disable: true } },
};

export const AlsKnop = {
	render: () => html`
		<nldd-status-bar variant="accent"
			text="U werkt in een testomgeving — terug naar de live-omgeving"
			button
		></nldd-status-bar>
	`,
	parameters: { controls: { disable: true } },
};

export const LangeTekst = {
	render: () => html`
		<div style="max-width: 360px;">
			<nldd-status-bar variant="warning" text="Gepland onderhoud op zaterdag 14 juni van 22:00 tot 00:00 — sommige onderdelen zijn dan tijdelijk niet bereikbaar"></nldd-status-bar>
		</div>
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
