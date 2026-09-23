import { html, nothing } from 'lit';
import './avatar.js';
import type { AvatarSize } from './avatar.js';
import { ICONS } from '../icon/icon.js';

// "Meisje met de parel" (Girl with a Pearl Earring), Johannes Vermeer, ca. 1665.
// Publiek domein (Wikimedia Commons), bijgesneden op het gezicht (200x200,
// top-gravity) en ingebed als data-URI zodat de story zelfvoorzienend is.
const PORTRAIT = 'data:image/jpeg;base64,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';

const SIZES: AvatarSize[] = ['24', '32', '40', '48', '64', '96'];

/**
 * Een avatar toont één persoon of organisatie. De inhoud volgt een vaste
 * terugvalketen: een afbeelding wanneer `src` laadt, anders de initialen (uit
 * `initials` of afgeleid uit `name`), en anders een terugval-icoon.
 *
 * `type` bepaalt de vorm en het terugval-icoon: `person` geeft een cirkel met
 * een person-icoon, `organization` een afgeronde vierkant met een
 * building-icoon. Zet `decorative` wanneer de naam er al als tekst naast
 * staat (bijvoorbeeld in een identity), zodat de avatar voor hulpsoftware
 * verborgen blijft.
 */
export default {
	title: 'Components/Content/Avatar',
	component: 'nldd-avatar',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/avatar/avatar.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
	},
	args: {
		name: 'Bart van de Biezen',
		initials: '',
		type: 'person',
		size: '40',
		color: 'neutral',
		iconAligned: false,
		src: '',
		icon: '',
		tooltipTiming: 'delay',
		decorative: false,
		href: '',
		button: false,
		target: '',
		accessibleLabel: '',
	},
	argTypes: {
		name: {
			control: 'text',
			description: 'Naam; levert de afgeleide initialen en het toegankelijke label',
		},
		initials: {
			control: 'text',
			description: 'Expliciete initialen (overschrijft de afleiding uit name)',
		},
		type: {
			control: 'select',
			options: ['person', 'organization'],
			description: 'Bepaalt vorm en terugval-icoon',
			table: { defaultValue: { summary: 'person' } },
		},
		size: {
			control: 'select',
			options: ['full', '16', '20', '24', '28', '32', '40', '44', '48', '56', '64', '80', '96'],
			description: 'full schaalt mee met de container, of een vaste maat in px (spacer-uitgelijnd)',
			table: { defaultValue: { summary: 'full' } },
		},
		color: {
			control: 'select',
			options: ['neutral', 'inherit'],
			description: 'neutral (neutrale vulling) of inherit (currentColor-vulling, contrasttekst)',
			table: { defaultValue: { summary: 'neutral' } },
		},
		iconAligned: {
			name: 'icon-aligned',
			control: 'boolean',
			description: 'Krimpt de schijf naar 5/6 zodat de avatar optisch met een icoon uitlijnt',
			table: { defaultValue: { summary: 'false' } },
		},
		src: {
			control: 'text',
			description: 'Afbeeldingsbron; valt bij een laadfout terug op initialen/icoon',
		},
		icon: {
			control: 'select',
			options: ICONS,
			description: 'Overschrijft het type-afhankelijke terugval-icoon',
		},
		tooltipTiming: {
			name: 'tooltip-timing',
			control: 'select',
			options: ['delay', 'instant', 'never'],
			description: 'Wanneer de naam als tooltip verschijnt bij hover of focus',
			table: {
				defaultValue: { summary: 'delay' },
			},
		},
		decorative: {
			control: 'boolean',
			description: 'Verbergt de avatar voor hulpsoftware',
			table: { defaultValue: { summary: 'false' } },
		},
		href: {
			control: 'text',
			description: 'Maakt de avatar een link naar deze URL; de vorm zelf wordt de link, dus het klikgebied en de focusring volgen hem',
		},
		button: {
			control: 'boolean',
			description: 'Maakt de avatar een knop; genegeerd zodra href is gezet',
			table: { defaultValue: { summary: 'false' } },
		},
		target: {
			control: 'select',
			options: ['(geen)', '_self', '_blank', '_parent', '_top'],
			mapping: { '(geen)': '' },
			description: 'Link target (alleen gebruikt als href is gezet)',
			table: { defaultValue: { summary: '(geen)' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Naam van de link of knop; zonder deze wordt name gebruikt',
		},
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-avatar
		name=${args.name || nothing}
		initials=${args.initials || nothing}
		type=${args.type || nothing}
		size=${args.size || nothing}
		color=${args.color || nothing}
		?icon-aligned=${args.iconAligned}
		src=${args.src || nothing}
		icon=${args.icon || nothing}
		tooltip-timing=${args.tooltipTiming || nothing}
		?decorative=${args.decorative}
		href=${args.href || nothing}
		?button=${args.button}
		target=${args.target || nothing}
		accessible-label=${args.accessibleLabel || nothing}
	></nldd-avatar>
`;

export const Standaard = {
	render: Template,
};

/**
 * Het type bepaalt de vorm en het terugval-icoon: een persoon krijgt een cirkel
 * met een person-icoon, een organisatie een afgeronde vierkant met een
 * building-icoon. De vorm is het verschil dat je in een rij ziet, ook zonder de
 * namen te lezen. Initialen werken bij allebei, bij een organisatie vaak als
 * acroniem.
 */
export const Types = {
	render: () => html`
		<div style="display: flex; gap: 32px; align-items: center;">
			${[
				{ type: 'person', name: 'Bart van de Biezen', initials: '' },
				{ type: 'organization', name: 'Kamer van Koophandel', initials: 'KvK' },
			].map(({ type, name, initials }) => html`
				<div style="display: flex; gap: 12px; align-items: center;">
					<nldd-avatar type=${type} name=${name} initials=${initials || nothing} size="48"></nldd-avatar>
					<nldd-avatar type=${type} size="48"></nldd-avatar>
				</div>
			`)}
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * De maat gebruikt dezelfde spacer-uitgelijnde schaal als `nldd-icon`. De
 * initialen en het terugval-icoon schalen mee.
 */
export const Grootten = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			${SIZES.map(size => html`
				<nldd-avatar name="Bart van de Biezen" size=${size}></nldd-avatar>
			`)}
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Zonder `size` schaalt de avatar mee met zijn container (net als `nldd-icon`);
 * de initialen en het icoon schalen mee. Geef de container een maat.
 */
export const SchaaltMee = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: flex-end;">
			<div style="width: 32px;"><nldd-avatar name="Bart van de Biezen"></nldd-avatar></div>
			<div style="width: 56px;"><nldd-avatar name="Bart van de Biezen"></nldd-avatar></div>
			<div style="width: 96px;"><nldd-avatar name="Bart van de Biezen"></nldd-avatar></div>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * `color="inherit"` vult de avatar met `currentColor` en zet de tekst in de
 * contrastkleur, zodat de avatar de omringende kleur overneemt (bijvoorbeeld
 * als vervanging van een account-icoon in een knop of naast tekst).
 */
export const KleurInherit = {
	render: () => html`
		<div style="display: flex; gap: 20px; align-items: center;">
			<span style="display: inline-flex; align-items: center; gap: 8px; color: var(--semantics-content-color);">
				<nldd-avatar name="Bart van de Biezen" color="inherit" size="24"></nldd-avatar>
				Bart van de Biezen
			</span>
			<span style="display: inline-flex; align-items: center; gap: 8px; color: var(--semantics-content-accent-color);">
				<nldd-avatar name="Anna Ismaili" color="inherit" size="24"></nldd-avatar>
				Anna Ismaili
			</span>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Een icoon-glyph heeft ingebouwde marge (op een 24px-grid is de glyph 20px,
 * dus 5/6), terwijl een avatar standaard edge-to-edge vult. `icon-aligned`
 * krimpt de zichtbare schijf naar 5/6, gecentreerd in dezelfde gridcel, zodat
 * de avatar optisch uitlijnt met een icoon wanneer je ze verwisselt. De stippel
 * toont de 24px-cel.
 */
export const IcoonUitlijning = {
	render: () => html`
		<div style="display: flex; gap: 24px; align-items: center;">
			<span style="display: inline-flex; flex-direction: column; gap: 6px; align-items: center; font: var(--primitives-font-body-xs-regular-flat); color: var(--semantics-content-secondary-color);">
				icoon
				<nldd-icon icon="person" size="24" style="outline: 1px dashed var(--semantics-dividers-color);"></nldd-icon>
			</span>
			<span style="display: inline-flex; flex-direction: column; gap: 6px; align-items: center; font: var(--primitives-font-body-xs-regular-flat); color: var(--semantics-content-secondary-color);">
				avatar (edge-to-edge)
				<nldd-avatar name="Bart van de Biezen" size="24" style="outline: 1px dashed var(--semantics-dividers-color);"></nldd-avatar>
			</span>
			<span style="display: inline-flex; flex-direction: column; gap: 6px; align-items: center; font: var(--primitives-font-body-xs-regular-flat); color: var(--semantics-content-secondary-color);">
				avatar (icon-aligned)
				<nldd-avatar name="Bart van de Biezen" size="24" icon-aligned style="outline: 1px dashed var(--semantics-dividers-color);"></nldd-avatar>
			</span>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Zonder afbeelding vallen de initialen in: afgeleid uit `name` (eerste letter
 * van het eerste en laatste woord) of expliciet via `initials`.
 */
export const Initialen = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-avatar name="Bart van de Biezen" size="48"></nldd-avatar>
			<nldd-avatar name="Petra van der Berg" size="48"></nldd-avatar>
			<nldd-avatar initials="AI" name="Anna Ismaili" size="48"></nldd-avatar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * De initialen vullen de schijf zo groot mogelijk; brede initialen (WW, MMM)
 * worden automatisch teruggeschaald zodat ze binnen de schijf blijven, terwijl
 * smalle initialen (II) op volle grootte blijven.
 */
export const BredeInitialen = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-avatar initials="II" decorative size="48"></nldd-avatar>
			<nldd-avatar initials="AB" decorative size="48"></nldd-avatar>
			<nldd-avatar initials="WW" decorative size="48"></nldd-avatar>
			<nldd-avatar initials="MMM" decorative size="48"></nldd-avatar>
			<nldd-avatar initials="WWW" decorative size="48"></nldd-avatar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Met een `src` toont de avatar de afbeelding, bijgesneden op een vierkant en
 * geklipt op de vorm van het `type`.
 */
export const MetAfbeelding = {
	render: () => html`
		<nldd-avatar
			name="Meisje met de parel"
			src=${PORTRAIT}
			size="64"
		></nldd-avatar>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Een dode `src` valt automatisch terug op de initialen (of het icoon), nooit
 * op een gebroken-afbeelding-icoon.
 */
export const DodeAfbeelding = {
	render: () => html`
		<nldd-avatar
			name="Bart van de Biezen"
			src="https://example.invalid/does-not-exist.jpg"
			size="64"
		></nldd-avatar>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Zonder afbeelding én zonder naam/initialen valt het terugval-icoon in: een
 * person-icoon (of building-icoon bij een organisatie). Zo'n naamloze avatar
 * is decoratief en blijft voor hulpsoftware verborgen. Overschrijf het icoon
 * met `icon`.
 */
export const TerugvalIcoon = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-avatar size="48"></nldd-avatar>
			<nldd-avatar type="organization" size="48"></nldd-avatar>
			<nldd-avatar icon="star" size="48"></nldd-avatar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Met `href` wordt de avatar één link, met `button` een knop. De schijf zelf is
 * de control, dus het klikgebied en de focusring volgen de ronde (of afgeronde)
 * vorm. De naam komt uit `accessible-label`, of anders uit `name` — een avatar
 * bevat immers geen tekst die de control kan benoemen.
 */
export const LinkOfKnop = {
	render: () => html`
		<div style="display: flex; gap: 24px; align-items: center;">
			<nldd-avatar name="Bart van de Biezen" size="48" href="#profiel"></nldd-avatar>
			<nldd-avatar name="Anke Jacobs" size="48" button accessible-label="Profielmenu van Anke Jacobs openen"></nldd-avatar>
			<nldd-avatar type="organization" name="Rijkswaterstaat" size="48" href="#organisatie"></nldd-avatar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
