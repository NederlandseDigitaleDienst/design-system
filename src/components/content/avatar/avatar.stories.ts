import { html, nothing } from 'lit';
import './avatar.js';
import type { AvatarSize } from './avatar.js';
import { ICONS } from '../icon/icon.js';
import '../../layout/container/container.js';
import '../text/text.js';
import { VERMEER } from '../../../docs/story-portraits.js';

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
		<nldd-container
			layout="row"
			gap="32"
		>
			${[
				{ type: 'person', name: 'Bart van de Biezen', initials: '' },
				{ type: 'organization', name: 'Team Uitvoering', initials: 'TU' },
			].map(({ type, name, initials }) => html`
				<nldd-container
					layout="row"
					gap="12"
					width="fit-content"
				>
					<nldd-avatar
						type=${type}
						name=${name}
						initials=${initials || nothing}
						size="48"
					></nldd-avatar>
					<nldd-avatar
						type=${type}
						size="48"
					></nldd-avatar>
				</nldd-container>
			`)}
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * De maat gebruikt dezelfde spacer-uitgelijnde schaal als `nldd-icon`. De
 * initialen en het terugval-icoon schalen mee.
 */
export const Grootten = {
	render: () => html`
		<nldd-container
			layout="row"
			gap="16"
			vertical-alignment="center"
		>
			${[...SIZES].reverse().map(size => html`
				<nldd-avatar
					name="Bart van de Biezen"
					size=${size}
				></nldd-avatar>
			`)}
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Zonder `size` schaalt de avatar mee met zijn container (net als `nldd-icon`);
 * de initialen en het icoon schalen mee. Geef de container een maat.
 */
export const SchaaltMee = {
	render: () => html`
		<nldd-container
			layout="row"
			gap="16"
			vertical-alignment="bottom"
		>
			<nldd-container width="96px"><nldd-avatar name="Bart van de Biezen"></nldd-avatar></nldd-container>
			<nldd-container width="56px"><nldd-avatar name="Bart van de Biezen"></nldd-avatar></nldd-container>
			<nldd-container width="32px"><nldd-avatar name="Bart van de Biezen"></nldd-avatar></nldd-container>
		</nldd-container>
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
		<nldd-container
			layout="row"
			gap="20"
		>
			<span style="display: inline-flex; align-items: center; gap: 8px; color: var(--semantics-content-color);">
				<nldd-avatar
					name="Bart van de Biezen"
					color="inherit"
					size="24"
				></nldd-avatar>
				<nldd-text color="inherit">
					Bart van de Biezen
				</nldd-text>
			</span>
			<span style="display: inline-flex; align-items: center; gap: 8px; color: var(--semantics-content-accent-color);">
				<nldd-avatar
					name="Anna Ismaili"
					color="inherit"
					size="24"
				></nldd-avatar>
				<nldd-text color="inherit">
					Anna Ismaili
				</nldd-text>
			</span>
		</nldd-container>
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
		<nldd-container
			layout="row"
			gap="24"
		>
			<span style="display: inline-flex; flex-direction: column; gap: 6px; align-items: center; color: var(--semantics-content-secondary-color);">
				<nldd-text
					size="xs"
					line-height="flat"
					color="secondary"
				>
					icoon
				</nldd-text>
				<nldd-icon
					icon="person"
					size="24"
					style="outline: 1px dashed var(--semantics-dividers-color);"
				></nldd-icon>
			</span>
			<span style="display: inline-flex; flex-direction: column; gap: 6px; align-items: center; color: var(--semantics-content-secondary-color);">
				<nldd-text
					size="xs"
					line-height="flat"
					color="secondary"
				>
					avatar (edge-to-edge)
				</nldd-text>
				<nldd-avatar
					name="Bart van de Biezen"
					size="24"
					style="outline: 1px dashed var(--semantics-dividers-color);"
				></nldd-avatar>
			</span>
			<span style="display: inline-flex; flex-direction: column; gap: 6px; align-items: center; color: var(--semantics-content-secondary-color);">
				<nldd-text
					size="xs"
					line-height="flat"
					color="secondary"
				>
					avatar (icon-aligned)
				</nldd-text>
				<nldd-avatar
					name="Bart van de Biezen"
					size="24"
					icon-aligned
					style="outline: 1px dashed var(--semantics-dividers-color);"
				></nldd-avatar>
			</span>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Zonder afbeelding vallen de initialen in: afgeleid uit `name` (eerste letter
 * van het eerste en laatste woord) of expliciet via `initials`.
 */
export const Initialen = {
	render: () => html`
		<nldd-container
			layout="row"
			gap="16"
		>
			<nldd-avatar
				name="Bart van de Biezen"
				size="48"
			></nldd-avatar>
			<nldd-avatar
				name="Petra van der Berg"
				size="48"
			></nldd-avatar>
			<nldd-avatar
				initials="AI"
				name="Anna Ismaili"
				size="48"
			></nldd-avatar>
		</nldd-container>
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
		<nldd-container
			layout="row"
			gap="16"
		>
			<nldd-avatar
				initials="II"
				decorative
				size="48"
			></nldd-avatar>
			<nldd-avatar
				initials="AB"
				decorative
				size="48"
			></nldd-avatar>
			<nldd-avatar
				initials="WW"
				decorative
				size="48"
			></nldd-avatar>
			<nldd-avatar
				initials="MMM"
				decorative
				size="48"
			></nldd-avatar>
			<nldd-avatar
				initials="WWW"
				decorative
				size="48"
			></nldd-avatar>
		</nldd-container>
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
			src=${VERMEER}
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
		<nldd-container
			layout="row"
			gap="16"
		>
			<nldd-avatar size="48"></nldd-avatar>
			<nldd-avatar
				type="organization"
				size="48"
			></nldd-avatar>
			<nldd-avatar
				icon="star"
				size="48"
			></nldd-avatar>
		</nldd-container>
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
		<nldd-container
			layout="row"
			gap="24"
		>
			<nldd-avatar
				name="Bart van de Biezen"
				size="48"
				href="#profiel"
			></nldd-avatar>
			<nldd-avatar
				name="Anke Jacobs"
				size="48"
				button
				accessible-label="Profielmenu van Anke Jacobs openen"
			></nldd-avatar>
			<nldd-avatar
				type="organization"
				name="Team Beleid"
				size="48"
				href="#team-beleid"
			></nldd-avatar>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};
