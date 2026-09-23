import { html, nothing } from 'lit';
import './toggle-button-group.js';
import '../toggle-button/toggle-button.js';

/**
 * De Toggle Button Group component groepeert `nldd-toggle-button` elementen en beheert
 * selectie, toetsenbordnavigatie en de synchronisatie van `type`, `name` en `size`.
 *
 * ## Gebruik
 * ```html
 * <nldd-toggle-button-group type="radio" name="view">
 *   <nldd-toggle-button value="list" text="Lijst"></nldd-toggle-button>
 *   <nldd-toggle-button value="card" text="Kaart" selected></nldd-toggle-button>
 * </nldd-toggle-button-group>
 * ```
 */
export default {
	title: 'Components/Inputs/Toggle Button Group',
	component: 'nldd-toggle-button-group',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/toggle-button-group/toggle-button-group.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md'],
			description: 'Grootte, doorgestuurd naar alle knoppen',
			table: {
				defaultValue: { summary: 'md' },
			},
		},
		name: {
			control: 'text',
			description: 'Naam voor formulierverwerking, doorgestuurd naar alle knoppen',
		},
		type: {
			control: 'select',
			options: ['button', 'checkbox', 'radio'],
			description: 'Selectiemodus',
			table: {
				defaultValue: { summary: 'checkbox' },
			},
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers (aria-label van de groep)',
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige staat. Wordt aangekondigd met aria-invalid; er wordt niets voor getekend.',
			table: { defaultValue: { summary: false } },
		},
		required: {
			control: 'boolean',
			description: 'Verplichte staat.',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Schakelt alle knoppen uit',
			table: {
				defaultValue: { summary: false },
			},
		},
	},
	args: {
		size: 'md',
		name: 'groep',
		type: 'checkbox',
		accessibleLabel: '',
		invalid: false,
		required: false,
		disabled: false,
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-toggle-button-group
		type=${args.type}
		name=${args.name}
		size=${args.size}
		?invalid=${args.invalid}
		?required=${args.required}
		?disabled=${args.disabled}
		accessible-label=${args.accessibleLabel || nothing}
	>
		<nldd-toggle-button value="mijn-zaken" text="Mijn zaken" icon="person"></nldd-toggle-button>
		<nldd-toggle-button value="inbox" text="Inbox" icon="inbox" selected></nldd-toggle-button>
		<nldd-toggle-button value="agenda" text="Agenda" icon="calendar-event"></nldd-toggle-button>
	</nldd-toggle-button-group>
`;

export const Standaard = {
	render: Template,
	args: {},
};


/* ============================================================
   Selectiemodi
   ============================================================ */

export const TypeButton = {
	name: 'Type button',
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 0.5rem;">
		<p style="font: var(--primitives-font-body-md-regular-snug); margin: 0;">
			Met <code>type="button"</code> beheert elke knop zijn eigen <code>aria-pressed</code> toestand onafhankelijk. Ideaal voor teksteditor-toolbars.
		</p>
		<nldd-toggle-button-group type="button" aria-label="Tekst opmaken">
			<nldd-toggle-button value="bold" accessible-label="Vet" icon="bold"></nldd-toggle-button>
			<nldd-toggle-button value="italic" accessible-label="Cursief" icon="italic" selected></nldd-toggle-button>
			<nldd-toggle-button value="underlined" accessible-label="Onderstreept" icon="underlined"></nldd-toggle-button>
			<nldd-toggle-button value="bullet-list" accessible-label="Opsomming" icon="bullet-list"></nldd-toggle-button>
			<nldd-toggle-button value="numbered-list" accessible-label="Genummerde lijst" icon="numbered-list"></nldd-toggle-button>
		</nldd-toggle-button-group>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: '`type="button"` — knoppen zijn onafhankelijk van elkaar en kunnen tegelijk actief zijn. De groep biedt layout en synchronisatie van `size` en `disabled`.',
			},
	},
},
};

export const TypeCheckbox = {
	name: 'Type checkbox',
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 0.5rem;">
		<p style="font: var(--primitives-font-body-md-regular-snug); margin: 0;">
			Met <code>type="checkbox"</code> kunnen meerdere opties tegelijk geselecteerd zijn.
		</p>
		<nldd-toggle-button-group type="checkbox" name="filter" aria-label="Filters">
			<nldd-toggle-button value="mijn-zaken" text="Mijn zaken" icon="person" selected></nldd-toggle-button>
			<nldd-toggle-button value="inbox" text="Inbox" icon="inbox"></nldd-toggle-button>
			<nldd-toggle-button value="agenda" text="Agenda" icon="calendar-event" selected></nldd-toggle-button>
			<nldd-toggle-button value="documenten" text="Documenten" icon="file-text"></nldd-toggle-button>
		</nldd-toggle-button-group>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Multi-select met `type="checkbox"`. Meerdere opties kunnen tegelijk actief zijn.',
			},
	},
},
};

export const TypeRadio = {
	name: 'Type radio',
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 0.5rem;">
		<p style="font: var(--primitives-font-body-md-regular-snug); margin: 0;">
			Met <code>type="radio"</code> kan slechts één optie tegelijk geselecteerd zijn.
			Navigeer met de pijltoetsen.
		</p>
		<nldd-toggle-button-group type="radio" name="sortering" aria-label="Sortering">
			<nldd-toggle-button value="oplopend" text="Oplopend" icon="sort-ascending"></nldd-toggle-button>
			<nldd-toggle-button value="aflopend" text="Aflopend" icon="sort-descending" selected></nldd-toggle-button>
			<nldd-toggle-button value="relevant" text="Relevant" icon="sort"></nldd-toggle-button>
		</nldd-toggle-button-group>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Single-select met `type="radio"`. Pijltoetsen navigeren tussen opties en selecteren tegelijk.',
			},
	},
},
};


/* ============================================================
   Grootten
   ============================================================ */

export const Grootten = {
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<nldd-toggle-button-group type="radio" name="sortering-xs" size="xs" aria-label="Sortering (extra klein)">
			<nldd-toggle-button value="oplopend" text="Oplopend" icon="sort-ascending"></nldd-toggle-button>
			<nldd-toggle-button value="aflopend" text="Aflopend" icon="sort-descending" selected></nldd-toggle-button>
		</nldd-toggle-button-group>
		<nldd-toggle-button-group type="radio" name="sortering-sm" size="sm" aria-label="Sortering (klein)">
			<nldd-toggle-button value="oplopend" text="Oplopend" icon="sort-ascending"></nldd-toggle-button>
			<nldd-toggle-button value="aflopend" text="Aflopend" icon="sort-descending" selected></nldd-toggle-button>
		</nldd-toggle-button-group>
		<nldd-toggle-button-group type="radio" name="sortering-md" size="md" aria-label="Sortering (middel)">
			<nldd-toggle-button value="oplopend" text="Oplopend" icon="sort-ascending"></nldd-toggle-button>
			<nldd-toggle-button value="aflopend" text="Aflopend" icon="sort-descending" selected></nldd-toggle-button>
		</nldd-toggle-button-group>
	</div>
`,
	parameters: { controls: { disable: true } },
};


/* ============================================================
   Uitgeschakeld
   ============================================================ */

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<nldd-toggle-button-group type="checkbox" name="filter-uit" disabled aria-label="Filters (uitgeschakeld)">
			<nldd-toggle-button value="mijn-zaken" text="Mijn zaken" icon="person"></nldd-toggle-button>
			<nldd-toggle-button value="inbox" text="Inbox" icon="inbox" selected></nldd-toggle-button>
			<nldd-toggle-button value="agenda" text="Agenda" icon="calendar-event"></nldd-toggle-button>
		</nldd-toggle-button-group>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Het `disabled` attribuut op de groep schakelt alle knoppen tegelijk uit. Knoppen die al individueel uitgeschakeld waren, worden niet opnieuw ingeschakeld wanneer de groep weer actief wordt.',
			},
	},
},
};


/* ============================================================
   Met iconen (icon-only)
   ============================================================ */

export const MetIconen = {
	render: () => html`
	<nldd-toggle-button-group type="radio" name="view" aria-label="Weergave">
		<nldd-toggle-button value="list" accessible-label="Lijstweergave" icon="list" selected></nldd-toggle-button>
		<nldd-toggle-button value="compact" accessible-label="Compacte weergave" icon="list-decreasing-lines"></nldd-toggle-button>
		<nldd-toggle-button value="uitgebreid" accessible-label="Uitgebreide weergave" icon="stack"></nldd-toggle-button>
	</nldd-toggle-button-group>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Icoon-only knoppen in een groep. Elk `nldd-toggle-button` heeft een `accessible-label`.',
			},
	},
},
};
