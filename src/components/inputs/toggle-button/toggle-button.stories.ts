import { html, nothing } from 'lit';
import './toggle-button.js';
import { ICONS } from './../../content/icon/icon.js';

/**
 * De Toggle Button component is een selecteerbare knop die tussen aan/uit kan schakelen.
 * Beschikbaar als `button` (met `aria-pressed`), `checkbox` of `radio` als onderliggend element,
 * zodat de semantiek aansluit bij het gebruik.
 *
 * ## Gebruik
 * ```html
 * <nldd-toggle-button text="Label"></nldd-toggle-button>
 * <nldd-toggle-button
 * 	text="Favoriet"
 * 	icon="heart"
 * 	selected-icon="heart-filled"
 * ></nldd-toggle-button>
 * ```
 */
export default {
	title: 'Components/Inputs/Toggle Button',
	component: 'nldd-toggle-button',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/toggle-button/toggle-button.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['(auto)', 'text', 'icon', 'icon-and-text'],
			mapping: { '(auto)': '' },
			description: 'Wat zichtbaar is. Bij "(auto)" bepaalt de knop dat zelf op basis van text/icon.',
			table: { defaultValue: { summary: '(auto)' } },
		},
		appearance: {
			control: 'select',
			options: ['neutral-tinted', 'neutral-base', 'neutral-transparent', 'accent-transparent'],
			description: 'Visuele stijl, inclusief kleur. Geselecteerd is altijd gevuld.',
			table: { defaultValue: { summary: 'neutral-tinted' } },
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg'],
			description: 'Grootte',
			table: {
				defaultValue: { summary: 'md' },
			},
		},
		text: {
			control: 'text',
			description: 'Tekst van de knop',
		},
		icon: {
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon naam voor nldd-icon',
			table: { defaultValue: { summary: '(geen)' } },
		},
		selectedIcon: {
			name: 'selected-icon',
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon in plaats van <code>icon</code> zolang de knop aan staat. Met een vlak vult het vlak; bij de transparante appearances draagt alleen het icoon de toestand.',
			table: { defaultValue: { summary: '(geen)' } },
		},
		type: {
			control: 'select',
			options: ['button', 'checkbox', 'radio'],
			description: 'Onderliggend element',
			table: {
				defaultValue: { summary: 'button' },
			},
		},
		selected: {
			control: 'boolean',
			description: 'Geselecteerde toestand',
			table: {
				defaultValue: { summary: false },
			},
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers (verplicht voor icon-only)',
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
			description: 'Uitgeschakelde toestand',
			table: {
				defaultValue: { summary: false },
			},
		},
	},
	args: {
		variant: '',
		appearance: 'neutral-tinted',
		size: 'md',
		text: 'Toggle',
		icon: '',
		selectedIcon: '',
		type: 'button',
		selected: false,
		accessibleLabel: '',
		invalid: false,
		required: false,
		disabled: false,
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-toggle-button
		variant=${args.variant || nothing}
		appearance=${args.appearance}
		type=${args.type}
		size=${args.size}
		?selected=${args.selected}
		?invalid=${args.invalid}
		?required=${args.required}
		?disabled=${args.disabled}
		text=${args.text}
		icon=${args.icon}
		selected-icon=${args.selectedIcon || nothing}
		accessible-label=${args.accessibleLabel || nothing}
	></nldd-toggle-button>
`;

export const Standaard = {
	render: Template,
	args: {
		text: 'Toggle button',
	},
	parameters: {
		docs: {
			description: {
				story: 'Standaard toggle button met `type="button"` (de default). Gebruikt `aria-pressed` voor de geselecteerde toestand en neemt niet deel aan formulierverwerking.',
			},
	},
},
};


/* ============================================================
   Types
   ============================================================ */

export const AlleTypes = {
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 1.5rem;">
		<div>
			<p style="font: var(--primitives-font-body-sm-regular-snug); color: var(--semantics-content-secondary-color); margin: 0 0 0.5rem;">
				type="button" (standaard) — aria-pressed, geen formulierparticipatie
			</p>
			<div style="display: flex; gap: 0.5rem;">
				<nldd-toggle-button
					type="button"
					text="Voorbeeld"
					icon="eye"
				></nldd-toggle-button>
				<nldd-toggle-button
					type="button"
					text="Meldingen"
					icon="notifications"
					selected
				></nldd-toggle-button>
			</div>
		</div>
		<div>
			<p style="font: var(--primitives-font-body-sm-regular-snug); color: var(--semantics-content-secondary-color); margin: 0 0 0.5rem;">
				type="checkbox" — native checkbox input, meerdere tegelijk selecteerbaar
			</p>
			<div style="display: flex; gap: 0.5rem;">
				<nldd-toggle-button
					type="checkbox"
					name="filter"
					value="mijn-zaken"
					text="Mijn zaken"
					icon="person"
				></nldd-toggle-button>
				<nldd-toggle-button
					type="checkbox"
					name="filter"
					value="inbox"
					text="Inbox"
					icon="inbox"
					selected
				></nldd-toggle-button>
				<nldd-toggle-button
					type="checkbox"
					name="filter"
					value="agenda"
					text="Agenda"
					icon="calendar-event"
				></nldd-toggle-button>
			</div>
		</div>
		<div>
			<p style="font: var(--primitives-font-body-sm-regular-snug); color: var(--semantics-content-secondary-color); margin: 0 0 0.5rem;">
				type="radio" — native radio input, wederzijdse uitsluiting via name-groep
			</p>
			<div
				style="display: flex; gap: 0.5rem;"
				role="radiogroup"
				aria-label="Sortering"
			>
				<nldd-toggle-button
					type="radio"
					name="sortering"
					value="oplopend"
					text="Oplopend"
					icon="sort-ascending"
				></nldd-toggle-button>
				<nldd-toggle-button
					type="radio"
					name="sortering"
					value="aflopend"
					text="Aflopend"
					icon="sort-descending"
					selected
				></nldd-toggle-button>
				<nldd-toggle-button
					type="radio"
					name="sortering"
					value="relevant"
					text="Relevant"
					icon="sort"
				></nldd-toggle-button>
			</div>
		</div>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Overzicht van alle drie de types. Gebruik `type="button"` voor UI-acties, `type="checkbox"` voor multi-select filters en `type="radio"` voor single-select keuzes met formulierparticipatie.',
			},
	},
},
};


/* ============================================================
   Toestanden
   ============================================================ */

export const AlleToestanden = {
	render: () => html`
	<div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
		<nldd-toggle-button
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
		></nldd-toggle-button>
		<nldd-toggle-button
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
			selected
		></nldd-toggle-button>
		<nldd-toggle-button
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
			disabled
		></nldd-toggle-button>
		<nldd-toggle-button
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
			selected
			disabled
		></nldd-toggle-button>
	</div>
`,
	parameters: { controls: { disable: true } },
};


/* ============================================================
   Appearances
   ============================================================ */

export const Appearances = {
	render: () => html`
	<div style="display: grid; grid-template-columns: repeat(2, max-content); gap: 1rem; align-items: center;">
		<nldd-toggle-button
			appearance="neutral-tinted"
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="neutral-tinted"
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
			selected
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="neutral-base"
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="neutral-base"
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
			selected
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="neutral-transparent"
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="neutral-transparent"
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
			selected
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="accent-transparent"
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="accent-transparent"
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
			selected
		></nldd-toggle-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met een vlak wordt het vlak gevuld als de knop aan staat. <code>neutral-transparent</code> en <code>accent-transparent</code> zijn de rustige, voor een toggle tussen transparante knoppen. Ze hebben geen vlak: met een <code>selected-icon</code>, hier het gevulde hartje, draagt het icoon de toestand, en zonder vullen ze als ze aan staan. <code>neutral-base</code> staat op een getint vlak.',
			},
		},
	},
};

export const MetSelectedIcon = {
	name: 'Met selected-icon',
	render: () => html`
	<div style="display: grid; grid-template-columns: repeat(2, max-content); gap: 1rem; align-items: center;">
		<nldd-toggle-button
			appearance="neutral-tinted"
			text="Volgen"
			icon="plus"
			selected-icon="check-mark"
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="neutral-tinted"
			text="Volgen"
			icon="plus"
			selected-icon="check-mark"
			selected
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="neutral-base"
			text="Volgen"
			icon="plus"
			selected-icon="check-mark"
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="neutral-base"
			text="Volgen"
			icon="plus"
			selected-icon="check-mark"
			selected
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="neutral-transparent"
			text="Volgen"
			icon="plus"
			selected-icon="check-mark"
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="neutral-transparent"
			text="Volgen"
			icon="plus"
			selected-icon="check-mark"
			selected
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="accent-transparent"
			text="Volgen"
			icon="plus"
			selected-icon="check-mark"
		></nldd-toggle-button>
		<nldd-toggle-button
			appearance="accent-transparent"
			text="Volgen"
			icon="plus"
			selected-icon="check-mark"
			selected
		></nldd-toggle-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met een vlak wordt het vlak gevuld als de knop aan staat, en verandert het icoon mee. Zonder vlak, bij de transparante appearances, blijft de knop rustig en draagt alleen het icoon de toestand. Het label blijft gelijk, de toestand zit in <code>aria-pressed</code>.',
			},
		},
	},
};

/* ============================================================
   Grootten
   ============================================================ */

export const AlleGrootten = {
	render: () => html`
	<div style="display: flex; gap: 1rem; align-items: center;">
		<nldd-toggle-button
			size="xs"
			text="Meldingen"
			icon="notifications"
		></nldd-toggle-button>
		<nldd-toggle-button
			size="sm"
			text="Meldingen"
			icon="notifications"
		></nldd-toggle-button>
		<nldd-toggle-button
			size="md"
			text="Meldingen"
			icon="notifications"
		></nldd-toggle-button>
		<nldd-toggle-button
			size="lg"
			text="Meldingen"
			icon="notifications"
		></nldd-toggle-button>
	</div>
`,
	parameters: { controls: { disable: true } },
};


/* ============================================================
   Groot (lg)
   ============================================================ */

export const Groot = {
	render: () => html`
	<div style="display: flex; gap: 1rem; align-items: flex-start;">
		<nldd-toggle-button
			size="lg"
			variant="text"
			text="Favoriet"
		></nldd-toggle-button>
		<nldd-toggle-button
			size="lg"
			variant="icon"
			icon="heart"
			selected-icon="heart-filled"
			accessible-label="Favoriet"
		></nldd-toggle-button>
		<nldd-toggle-button
			size="lg"
			variant="icon-and-text"
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
		></nldd-toggle-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'In `size="lg"` bepaalt de `variant` de presentatie: `text` is een grote tekstknop, `icon` een vierkante knop met groot icoon (28px), en `icon-and-text` stapelt een icoon (24px) met klein tekstlabel eronder — een actiebalk-affordance.',
			},
	},
},
};


/* ============================================================
   Met icoon
   ============================================================ */

export const MetIcoon = {
	render: () => html`
	<div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
		<nldd-toggle-button
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
		></nldd-toggle-button>
		<nldd-toggle-button
			text="Favoriet"
			icon="heart"
			selected-icon="heart-filled"
			selected
		></nldd-toggle-button>
		<nldd-toggle-button
			text="Bladwijzer"
			icon="bookmark"
			selected-icon="bookmark-filled"
		></nldd-toggle-button>
		<nldd-toggle-button
			text="Meldingen"
			icon="notifications"
			selected
		></nldd-toggle-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Gebruik het `icon` attribute om een icoon toe te voegen.',
			},
	},
},
};

export const AlleenIcoon = {
	render: () => html`
	<div style="display: flex; gap: 0.5rem; align-items: center;">
		<nldd-toggle-button
			size="md"
			icon="bold"
			accessible-label="Vet"
		></nldd-toggle-button>
		<nldd-toggle-button
			size="md"
			icon="italic"
			accessible-label="Cursief"
			selected
		></nldd-toggle-button>
		<nldd-toggle-button
			size="md"
			icon="underlined"
			accessible-label="Onderstreept"
		></nldd-toggle-button>
		<nldd-toggle-button
			size="md"
			icon="bullet-list"
			accessible-label="Opsomming"
		></nldd-toggle-button>
		<nldd-toggle-button
			size="md"
			icon="numbered-list"
			accessible-label="Genummerde lijst"
		></nldd-toggle-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Zonder tekst wordt de knop automatisch vierkant. Het `accessible-label` attribuut is verplicht voor toegankelijkheid.',
			},
	},
},
};


/* ============================================================
   Type: button
   ============================================================ */

export const TypeButton = {
	name: 'Type button',
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 0.75rem;">
		<p style="font: var(--primitives-font-body-md-regular-snug); margin: 0;">
			<code>type="button"</code> is de standaard. Gebruikt <code>aria-pressed</code> voor de geselecteerde toestand en neemt niet deel aan formulierverwerking.
		</p>
		<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
			<nldd-toggle-button
				type="button"
				icon="bullet-list"
				accessible-label="Opsomming"
			></nldd-toggle-button>
			<nldd-toggle-button
				type="button"
				icon="numbered-list"
				accessible-label="Genummerde lijst"
				selected
			></nldd-toggle-button>
			<nldd-toggle-button
				type="button"
				text="Voorbeeld"
				icon="eye"
			></nldd-toggle-button>
			<nldd-toggle-button
				type="button"
				text="Meldingen"
				icon="notifications"
				selected
			></nldd-toggle-button>
		</div>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: '`type="button"` (de default) — `aria-pressed` geeft de geselecteerde toestand door aan hulptechnologie.',
			},
	},
},
};


/* ============================================================
   Type: checkbox
   ============================================================ */

export const TypeCheckbox = {
	name: 'Type checkbox',
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 0.75rem;">
		<p style="font: var(--primitives-font-body-md-regular-snug); margin: 0;">
			<code>type="checkbox"</code> voor filter-chips en multi-select acties met formulierparticipatie.
		</p>
		<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
			<nldd-toggle-button
				type="checkbox"
				name="filter"
				value="mijn-zaken"
				text="Mijn zaken"
				icon="person"
			></nldd-toggle-button>
			<nldd-toggle-button
				type="checkbox"
				name="filter"
				value="inbox"
				text="Inbox"
				icon="inbox"
				selected
			></nldd-toggle-button>
			<nldd-toggle-button
				type="checkbox"
				name="filter"
				value="agenda"
				text="Agenda"
				icon="calendar-event"
				selected
			></nldd-toggle-button>
			<nldd-toggle-button
				type="checkbox"
				name="filter"
				value="documenten"
				text="Documenten"
				icon="file-text"
			></nldd-toggle-button>
		</div>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: '`type="checkbox"` — meerdere knoppen kunnen tegelijk geselecteerd zijn.',
			},
	},
},
};


/* ============================================================
   Type: radio
   ============================================================ */

export const TypeRadio = {
	name: 'Type radio',
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 0.75rem;">
		<p style="font: var(--primitives-font-body-md-regular-snug); margin: 0;">
			<code>type="radio"</code> voor single-select keuzes. Gebruik <code>nldd-toggle-button-group</code> voor beheer via JavaScript.
		</p>
		<div
			style="display: flex; gap: 0.5rem;"
			role="radiogroup"
			aria-label="Sortering"
		>
			<nldd-toggle-button
				type="radio"
				name="sortering"
				value="oplopend"
				text="Oplopend"
				icon="sort-ascending"
			></nldd-toggle-button>
			<nldd-toggle-button
				type="radio"
				name="sortering"
				value="aflopend"
				text="Aflopend"
				icon="sort-descending"
				selected
			></nldd-toggle-button>
			<nldd-toggle-button
				type="radio"
				name="sortering"
				value="relevant"
				text="Relevant"
				icon="sort"
			></nldd-toggle-button>
		</div>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: '`type="radio"` — native browser-gedrag zorgt voor wederzijdse uitsluiting binnen dezelfde `name`-groep.',
			},
	},
},
};
