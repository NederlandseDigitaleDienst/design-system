import { html, nothing } from 'lit';
import './title.js';
import '../../actions/button/button.js';
import '../../layout/spacer/spacer.js';
import '../../layout/container/container.js';

/**
 * Gebruik een title bar om een paginatitel of sectietitel te tonen met
 * optionele overline, ondertitel en acties. De titel geef je mee met `text`,
 * en `heading-level` bepaalt welke kop het is. Het niveau bepaalt ook de
 * grootte: een h2 is `display-2`. Met `size` kies je een andere grootte, zoals
 * voor een sectiekop die kleiner moet dan zijn plek. Zonder niveau is de titel
 * geen kop en toont hij als gewone tekst, wat `size` ook zegt.
 *
 * ## Gebruik
 * ```html
 * <nldd-title
 *   text="Paginatitel"
 *   supporting-text="Ondertitel"
 *   overline="Overline"
 *   heading-level="1"
 * >
 *   <nldd-button slot="end" text="Actie"></nldd-button>
 * </nldd-title>
 * ```
 *
 * Is de titel meer dan tekst, zoals een link, zet hem dan in de standaardslot
 * met een eigen h1–h6. Die neemt de plaats in van `text`, en zijn niveau bepaalt
 * de grootte. Voor `overline` en
 * `supporting-text` werkt het net zo, met een slot van dezelfde naam.
 */
export default {
	title: 'Components/Content/Title',
	component: 'nldd-title',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/title/title.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		size: '',
		smCustomSize: '',
		mdCustomSize: '',
		lgCustomSize: '',
		color: 'content',
		text: 'Paginatitel',
		supportingText: '',
		overline: '',
		headingLevel: 1,
	},
	argTypes: {
		size: {
			control: { type: 'select' },
			options: ['(auto)', 'display-1', 'display-2', 'display-3', 'display-4', 'display-5', 'display-6'],
			mapping: { '(auto)': '' },
			description: 'Visuele grootte van de titel, als die moet afwijken van zijn niveau. Zonder volgt de titel zijn niveau. Zonder niveau doet `size` niets.',
			table: { defaultValue: { summary: '(auto)' } },
		},
		smCustomSize: {
			name: 'sm-custom-size',
			control: 'text',
			description: 'Eigen grootte bij sm, elke CSS-lengte, voor een statement groter dan `display-1`. Een breedte zonder waarde houdt `size`; nooit kleiner dan `display-1`. Gebruik voor koppen `size`.',
		},
		mdCustomSize: {
			name: 'md-custom-size',
			control: 'text',
			description: 'Eigen grootte bij md',
		},
		lgCustomSize: {
			name: 'lg-custom-size',
			control: 'text',
			description: 'Eigen grootte bij lg',
		},
		color: {
			control: 'select',
			options: ['content', 'inherit'],
			description: '`content` neemt de eigen tekstkleuren van het systeem. `inherit` laat de titel de tekstkleur van de ondergrond volgen (voor gekleurde vlakken).',
			table: { defaultValue: { summary: 'content' } },
		},
		text: {
			control: 'text',
			description: 'Tekst van de titel. Inhoud in de standaardslot neemt de plaats in.',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Tekst onder de titel. Inhoud in de slot `supporting-text` neemt de plaats in.',
		},
		overline: {
			control: 'text',
			description: 'Tekst boven de titel. Inhoud in de slot `overline` neemt de plaats in.',
		},
		headingLevel: {
			name: 'heading-level',
			control: 'select',
			options: ['(geen)', 1, 2, 3, 4, 5, 6],
			mapping: { '(geen)': undefined },
			description: 'Kopniveau van de titel, en daarmee zijn grootte. Zonder niveau wordt het een alinea in gewone tekst.',
			table: { defaultValue: { summary: '(geen)' } },
		},
	},
};

export const Standaard = ({ size, smCustomSize, mdCustomSize, lgCustomSize, color, text, supportingText, overline, headingLevel }: Record<string, any>) => html`
	<nldd-title
		size=${size || nothing}
		sm-custom-size=${smCustomSize || nothing}
		md-custom-size=${mdCustomSize || nothing}
		lg-custom-size=${lgCustomSize || nothing}
		color=${color || nothing}
		text=${text || nothing}
		supporting-text=${supportingText || nothing}
		overline=${overline || nothing}
		heading-level=${headingLevel ?? nothing}
	>
		<nldd-button
			slot="end"
			appearance="secondary"
			size="sm"
			text="Bewerken"
		></nldd-button>
	</nldd-title>
`;

export const MetOverline = {
	render: () => html`
	<nldd-title
		text="Aanvraag A-1042"
		overline="Dakisolatie"
		heading-level="1"
	></nldd-title>
`,
	parameters: { controls: { disable: true } },
};

export const MetSupportingText = {
	render: () => html`
	<nldd-title
		text="Aanvraag A-1042"
		supporting-text="Dakisolatie, in behandeling"
		heading-level="1"
	></nldd-title>
`,
	parameters: { controls: { disable: true } },
};

export const MetOverlineEnSupportingText = {
	render: () => html`
	<nldd-title
		text="Dossier D-318"
		supporting-text="Aanvraag A-1042 in behandeling"
		overline="Team Uitvoering"
		heading-level="1"
	></nldd-title>
`,
	parameters: { controls: { disable: true } },
};

export const MetActie = {
	render: () => html`
	<nldd-title
		text="Aanvraag A-1042"
		heading-level="1"
	>
		<nldd-button
			slot="end"
			size="sm"
			text="Bewerken"
		></nldd-button>
	</nldd-title>
`,
	parameters: { controls: { disable: true } },
};

export const AlleGrootten = {
	render: () => html`
	<nldd-container gap="24">
		${[1, 2, 3, 4, 5, 6].map(level => html`
			<nldd-title
				text="Kop ${level}, display-${level}"
				heading-level=${level}
			></nldd-title>
		`)}
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};

/**
 * Voor een statement dat groter moet dan `display-1` geef je per breedte een eigen
 * grootte, met `sm-`, `md-` en `lg-custom-size`. Een breedte zonder waarde houdt
 * de maat uit `size` of het niveau, dus een titel die op een breed scherm groot
 * is, breekt nooit op een smal scherm. De titel neemt het gewicht, het lettertype
 * en de regelhoogte van `display-1` over en wordt nooit kleiner dan `display-1`.
 * Voor koppen gebruik je `heading-level` en `size`.
 */
export const EigenGrootte = {
	name: 'Eigen grootte',
	render: () => html`
	<nldd-title
		sm-custom-size="56px"
		md-custom-size="80px"
		lg-custom-size="96px"
		text="Mijn Dienst"
		heading-level="1"
	></nldd-title>
`,
	parameters: { controls: { disable: true } },
};

/**
 * Met `color="inherit"` volgt de titel de tekstkleur van de ondergrond —
 * voor gekleurde vlakken zoals de filled-categories, die een puur witte of
 * zwarte contentkleur meeleveren. De overline en supporting-text krijgen dezelfde
 * kleur op de systeembrede secundaire dekking.
 */
export const OpKleurvlak = {
	render: () => html`
		<nldd-container gap="16">
			<div style="background: var(--semantics-categories-donkerblauw-filled-background-color); color: var(--semantics-categories-donkerblauw-filled-content-color); padding: 24px; border-radius: var(--primitives-corner-radius-md); --context-background-color: var(--semantics-categories-donkerblauw-filled-background-color); --context-content-color: var(--semantics-categories-donkerblauw-filled-content-color);">
				<nldd-title
					color="inherit"
					size="display-2"
					text="Titel volgt de contentkleur"
					supporting-text="Ondersteunende tekst op verlaagde dekking"
					overline="Donker vlak"
					heading-level="2"
				></nldd-title>
			</div>
			<div style="background: var(--semantics-categories-oranje-filled-background-color); color: var(--semantics-categories-oranje-filled-content-color); padding: 24px; border-radius: var(--primitives-corner-radius-md); --context-background-color: var(--semantics-categories-oranje-filled-background-color); --context-content-color: var(--semantics-categories-oranje-filled-content-color);">
				<nldd-title
					color="inherit"
					size="display-2"
					text="Zwarte content op oranje"
					supporting-text="Ondersteunende tekst op verlaagde dekking"
					overline="Middenton"
					heading-level="2"
				></nldd-title>
			</div>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Is de titel meer dan tekst, zoals een link, zet hem dan in de standaardslot
 * met een eigen h1–h6. Die neemt de plaats in van `text`, en zijn niveau bepaalt
 * de grootte, net als `heading-level`. Een link, `strong`, `em`, `code`, `mark`
 * en `q` in die kop zien eruit als in `nldd-text`. Die opmaak komt uit
 * `title.css`, dat in `global.css` zit.
 */
export const MetEigenInhoud = {
	render: () => html`
	<nldd-container gap="24">
		<nldd-title supporting-text="Dakisolatie, in behandeling">
			<h1><a href="#aanvraag-a-1042">Aanvraag A-1042</a></h1>
		</nldd-title>
		<nldd-title>
			<h2>Dossier <code>D-318</code> van <em>team Uitvoering</em></h2>
		</nldd-title>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};
