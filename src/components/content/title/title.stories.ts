import { html, nothing } from 'lit';
import './title.js';
import '../../actions/button/button.js';
import '../../layout/spacer/spacer.js';

/**
 * Gebruik een title bar om een paginatitel of sectietitel te tonen met
 * optionele overline, ondertitel en acties. De titel geef je mee met `text`,
 * en `heading-level` bepaalt welke kop het is. `size` bepaalt alleen hoe groot
 * hij eruitziet. Zonder `heading-level` wordt het een alinea, voor een titel
 * die geen kop is.
 *
 * ## Gebruik
 * ```html
 * <nldd-title
 *   size="3"
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
 * met een eigen h1–h6. Die neemt de plaats in van `text`. Voor `overline` en
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
		size: 3,
		color: 'content',
		text: 'Paginatitel',
		supportingText: '',
		overline: '',
		headingLevel: 1,
	},
	argTypes: {
		size: {
			control: { type: 'select' },
			options: [1, 2, 3, 4, 5, 6],
			description: 'Visuele grootte van de titel',
			table: { defaultValue: { summary: '3' } },
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
			description: 'Kopniveau van de titel. Zonder niveau wordt het een alinea.',
			table: { defaultValue: { summary: '(geen)' } },
		},
	},
};

export const Standaard = ({ size, color, text, supportingText, overline, headingLevel }: Record<string, any>) => html`
	<div style="display: block; padding: 24px; container-type: inline-size; container-name: layout-container;">
		<nldd-title
			size=${size}
			color=${color || nothing}
			text=${text || nothing}
			supporting-text=${supportingText || nothing}
			overline=${overline || nothing}
			heading-level=${headingLevel ?? nothing}
		>
			<nldd-button slot="end" variant="secondary" size="sm" text="Actie"></nldd-button>
		</nldd-title>
	</div>
`;

export const MetOverline = {
	render: () => html`
	<div style="display: block; padding: 24px; container-type: inline-size; container-name: layout-container;">
		<nldd-title
			text="Artikel 1"
			overline="Wet op de zorgtoeslag"
			heading-level="1"
		></nldd-title>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const MetSupportingText = {
	render: () => html`
	<div style="display: block; padding: 24px; container-type: inline-size; container-name: layout-container;">
		<nldd-title
			text="Wet op de zorgtoeslag"
			supporting-text="Laatste wijziging: 1 januari 2024"
			heading-level="1"
		></nldd-title>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const MetOverlineEnSupportingText = {
	render: () => html`
	<div style="display: block; padding: 24px; container-type: inline-size; container-name: layout-container;">
		<nldd-title
			text="Begripsbepalingen"
			supporting-text="Ingangsdatum: 1 januari 2024"
			overline="Hoofdstuk 1"
			heading-level="1"
		></nldd-title>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const MetActies = {
	render: () => html`
	<div style="display: block; padding: 24px; container-type: inline-size; container-name: layout-container;">
		<nldd-title
			text="Wet op de zorgtoeslag"
			heading-level="1"
		>
			<nldd-button slot="end" variant="secondary" size="sm" text="Bewerken"></nldd-button>
			<nldd-spacer slot="end" size="8"></nldd-spacer>
			<nldd-button slot="end" size="sm" text="Opslaan"></nldd-button>
		</nldd-title>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const AlleGrootten = {
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 24px; padding: 24px; container-type: inline-size; container-name: layout-container;">
		${[1, 2, 3, 4, 5, 6].map(s => html`
			<nldd-title
				size=${s}
				text="Grootte ${s}"
				heading-level="2"
			></nldd-title>
		`)}
	</div>
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
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<div style="background: var(--semantics-categories-donkerblauw-filled-background-color); color: var(--semantics-categories-donkerblauw-filled-content-color); padding: 24px; border-radius: var(--primitives-corner-radius-md);">
				<nldd-title
					color="inherit"
					size="2"
					text="Titel volgt de contentkleur"
					supporting-text="Ondersteunende tekst op verlaagde dekking"
					overline="Donker vlak"
					heading-level="2"
				></nldd-title>
			</div>
			<div style="background: var(--semantics-categories-oranje-filled-background-color); color: var(--semantics-categories-oranje-filled-content-color); padding: 24px; border-radius: var(--primitives-corner-radius-md);">
				<nldd-title
					color="inherit"
					size="2"
					text="Zwarte content op oranje"
					supporting-text="Ondersteunende tekst op verlaagde dekking"
					overline="Middenton"
					heading-level="2"
				></nldd-title>
			</div>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Is de titel meer dan tekst, zoals een link, zet hem dan in de standaardslot
 * met een eigen h1–h6. Die neemt de plaats in van `text`.
 */
export const MetEigenInhoud = {
	render: () => html`
	<div style="display: block; padding: 24px; container-type: inline-size; container-name: layout-container;">
		<nldd-title supporting-text="Laatste wijziging: 1 januari 2024">
			<h1><a href="https://wetten.overheid.nl/BWBR0018451">Wet op de zorgtoeslag</a></h1>
		</nldd-title>
	</div>
`,
	parameters: { controls: { disable: true } },
};
