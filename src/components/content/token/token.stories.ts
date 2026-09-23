import { action } from 'storybook/actions';
import { html, nothing } from 'lit';
import './token.js';
import '../../actions/menu/menu.js';

/**
 * De Token is zelfstandige data waar de gebruiker mee werkt: een persoon in een
 * adresveld, een actieve filterwaarde. Als enige van de drie kun je hem bedienen,
 * dus hij is optioneel verwijderbaar of interactief via een contextueel menu.
 *
 * Lees je het alleen maar, kijk dan naar `nldd-tag` voor een toegekend kenmerk of
 * `nldd-badge` voor een toestand of aantal dat het systeem bijhoudt.
 *
 * ## Gebruik
 * ```html
 * <nldd-token text="Label"></nldd-token>
 * <nldd-token control="dismiss" text="Verwijderbaar"></nldd-token>
 * <nldd-token control="menu" text="Kies optie"></nldd-token>
 * ```
 */
export default {
	title: 'Components/Content/Token',
	component: 'nldd-token',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/token/token.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		text: 'Token',
		control: 'none',
		dismissText: '',
		menuText: '',
		disabled: false,
	},
	argTypes: {
		text: {
			control: 'text',
			description: 'Tekst van het token',
		},
		control: {
			control: 'select',
			options: ['none', 'dismiss', 'menu'],
			description: 'Welke knop het token heeft: geen, verwijderen of een menu',
			table: { defaultValue: { summary: 'none' } },
		},
		dismissText: {
			name: 'dismiss-text',
			control: 'text',
			description: 'Toegankelijke naam van de verwijderknop (control="dismiss")',
			table: { defaultValue: { summary: 'Verwijder "{text}"' } },
		},
		menuText: {
			name: 'menu-text',
			control: 'text',
			description: 'Toegankelijke naam van de menuknop (control="menu")',
			table: { defaultValue: { summary: 'Toon opties voor "{text}"' } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde toestand',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-token
		text=${args.text}
		control=${args.control}
		dismiss-text=${args.dismissText || nothing}
		menu-text=${args.menuText || nothing}
		?disabled=${args.disabled}
		@dismiss=${action('dismiss')}
	></nldd-token>
`;

export const Standaard = {
	render: Template,
};


/* ============================================================
   Controls
   ============================================================ */

export const AlleControls = {
	render: () => html`
	<div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
		<nldd-token text="Geen control"></nldd-token>
		<nldd-token control="dismiss" text="Met dismiss"></nldd-token>
		<nldd-token control="menu" text="Met menu">
			<nldd-menu slot="menu">
				<nldd-menu-item text="Bewerken" @select=${action('select')}></nldd-menu-item>
				<nldd-menu-item text="Verwijder" destructive @select=${action('select')}></nldd-menu-item>
			</nldd-menu>
		</nldd-token>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Overzicht van alle drie de control-varianten.',
			},
	},
},
};

export const MetMenu = {
	render: () => html`
		<nldd-token control="menu" text="jan.devries@example.nl">
			<nldd-menu slot="menu">
				<nldd-menu-item text="Stuur een e-mail" @select=${action('select: e-mail')}></nldd-menu-item>
				<nldd-menu-item text="Toon contactgegevens" @select=${action('select: contactgegevens')}></nldd-menu-item>
				<nldd-menu-item text="Kopieer e-mailadres" @select=${action('select: kopieer')}></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item text="Verwijder" destructive @select=${action('select: verwijder')}></nldd-menu-item>
			</nldd-menu>
		</nldd-token>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een token met een contextueel menu — bijvoorbeeld een e-mailadres met acties: een e-mail sturen, contactgegevens tonen, het adres kopiëren of de token verwijderen. Klik op de chevron; het menu opent als popover en de menu-items handelen zelf hun `select` af.',
			},
		},
	},
};


/* ============================================================
   Toestanden
   ============================================================ */

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: () => html`
	<div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
		<nldd-token disabled text="Geen control"></nldd-token>
		<nldd-token control="dismiss" disabled text="Met dismiss"></nldd-token>
		<nldd-token control="menu" disabled text="Met menu"></nldd-token>
	</div>
`,
	parameters: { controls: { disable: true } },
};


/* ============================================================
   Gebruik
   ============================================================ */

export const FilterVoorbeeld = {
	render: () => {
	const handleDismiss = (e: Record<string, any>) => {
		(e.target).closest('nldd-token')?.remove();
	};

	return html`
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<p style="margin: 0; font: var(--primitives-font-body-md-regular-snug); color: var(--semantics-content-color);">
				Actieve tokens — klik op × om een waarde te verwijderen:
			</p>
			<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
				<nldd-token control="dismiss" text="Status: Actief" @dismiss=${handleDismiss}></nldd-token>
				<nldd-token control="dismiss" text="Type: Document" @dismiss=${handleDismiss}></nldd-token>
				<nldd-token control="dismiss" text="Datum: Vandaag" @dismiss=${handleDismiss}></nldd-token>
				<nldd-token control="dismiss" text="Auteur: Jan de Vries" @dismiss=${handleDismiss}></nldd-token>
			</div>
		</div>
	`;
},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Voorbeeld van verwijderbare tokens die een stuk data representeren.',
			},
	},
},
};
