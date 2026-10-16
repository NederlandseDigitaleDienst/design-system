import { html, nothing } from 'lit';
import './inline-dialog.js';
import '../../actions/button/button.js';
import '../../inputs/text-field/text-field.js';
import '../../forms/form-field/form-field.js';
import '../progress-circle/progress-circle.js';
import '../../layout/box/box.js';
import '../../layout/container/container.js';
import { ICONS } from '../../content/icon/icon.js';

/**
 * De Dialog is een inline statuscomponent voor lege toestanden, bevestigingen en feedback.
 * Hij vult zijn container en heeft geen overlay of backdrop.
 * Gebruik `nldd-modal-dialog` voor een modaal venster met backdrop.
 *
 * ## Gebruik
 * ```html
 * <nldd-inline-dialog
 *   variant="alert"
 *   text="Verwijder 'Dossier D-318'?"
 *   supporting-text="Dit dossier en alle documenten erin worden verwijderd. Dit kan niet ongedaan worden gemaakt."
 * >
 *   <nldd-button slot="actions" appearance="primary" text="Behoud dossier"></nldd-button>
 *   <nldd-button slot="actions" appearance="destructive" text="Verwijder dossier"></nldd-button>
 * </nldd-inline-dialog>
 * ```
 */
export default {
	title: 'Components/Status & Feedback/Inline Dialog',
	component: 'nldd-inline-dialog',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/status-and-feedback/inline-dialog/inline-dialog.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['(geen)', 'alert', 'success', 'loading'],
			mapping: { '(geen)': '' },
			description: 'Semantische variant — dwingt een icoon en kleur af',
			table: { defaultValue: { summary: '(geen)' } },
		},
		size: {
			control: 'select',
			options: ['md', 'lg'],
			description: 'Typografische maat — md (default) of lg voor een grotere kop + ondersteuning',
			table: { defaultValue: { summary: 'md' } },
		},
		text: {
			control: 'text',
			description: 'Hoofdtekst',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Ondersteunende tekst onder de heading',
		},
		icon: {
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Naam van het nldd-icon icoon; afwezig wanneer niet ingesteld. Overschrijft het variant-icoon.',
			table: { defaultValue: { summary: '(geen)' } },
		},
		iconColor: {
			name: 'icon-color',
			control: 'select',
			options: ['(geen)', 'secondary', 'accent', 'critical', 'warning', 'success'],
			mapping: { '(geen)': '' },
			description: 'Overschrijft de standaard icoonkleur (en die van een variant).',
			table: { defaultValue: { summary: '(geen)' } },
		},
		horizontalAlignment: {
			name: 'horizontal-alignment',
			control: 'select',
			options: ['(auto)', 'left', 'center'],
			mapping: { '(auto)': '' },
			description: 'Overschrijft de uitlijning. Bij "(auto)" bepaalt het component het zelf: inhoud in de default slot lijnt links uit, een kale melding blijft gecentreerd.',
			table: { defaultValue: { summary: '(auto)' } },
		},
	},
	args: {
		variant: '',
		size: 'md',
		text: "Verwijder 'Dossier D-318'?",
		supportingText: 'Dit dossier en alle documenten erin worden verwijderd. Dit kan niet ongedaan worden gemaakt.',
		icon: '',
		iconColor: '',
		horizontalAlignment: '',
	},
};

export const Standaard = (args: Record<string, any>) => html`
	<nldd-inline-dialog
		variant=${args.variant || nothing}
		size=${args.size}
		text=${args.text}
		supporting-text=${args.supportingText}
		icon=${args.icon || nothing}
		icon-color=${args.iconColor || nothing}
		horizontal-alignment=${args.horizontalAlignment || nothing}
	>
		<nldd-button
			slot="actions"
			appearance="primary"
			text="Behoud dossier"
		></nldd-button>
		<nldd-button
			slot="actions"
			appearance="destructive"
			text="Verwijder dossier"
		></nldd-button>
	</nldd-inline-dialog>
`;

export const ZonderIcoon = {
	render: () => html`
	<nldd-inline-dialog
		text="Aanvraag A-1042 versturen?"
		supporting-text="Na het versturen kun je de aanvraag niet meer wijzigen."
	>
		<nldd-button
			slot="actions"
			appearance="primary"
			text="Verstuur aanvraag"
		></nldd-button>
		<nldd-button
			slot="actions"
			appearance="neutral-tinted"
			text="Blijf bewerken"
		></nldd-button>
	</nldd-inline-dialog>
`,
	parameters: { controls: { disable: true } },
};

export const MetIcoon = {
	render: () => html`
	<nldd-inline-dialog
		icon="gear"
		text="Instellingen vereist"
		supporting-text="Stel eerst je voorkeuren in, dan kun je verder."
	>
		<nldd-button
			slot="actions"
			appearance="primary"
			text="Naar instellingen"
		></nldd-button>
	</nldd-inline-dialog>
`,
	parameters: { controls: { disable: true } },
};

export const IcoonKleur = {
	render: () => html`
	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px;">
		${(['secondary', 'accent', 'critical', 'warning', 'success'] as const).map(color => html`
			<nldd-inline-dialog
				icon="info-circle"
				icon-color=${color}
				text=${color.charAt(0).toUpperCase() + color.slice(1)}
				supporting-text="Icon in de ${color} kleur."
			></nldd-inline-dialog>
		`)}
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Gebruik `icon-color` om de icoonkleur te zetten naar één van de semantic content kleuren. Werkt ook met `variant="alert"` — `icon-color` overrulet dan de variant-kleur.',
			},
		},
	},
};

export const VariantAlert = {
	name: 'Variant alert',
	render: () => html`
	<nldd-inline-dialog
		variant="alert"
		text="Je wijzigingen zijn nog niet bewaard"
		supporting-text="Sluit je Aanvraag A-1042 nu, dan gaan ze verloren."
	>
		<nldd-button
			slot="actions"
			appearance="primary"
			text="Blijf bewerken"
		></nldd-button>
		<nldd-button
			slot="actions"
			appearance="destructive"
			text="Verwijder wijzigingen"
		></nldd-button>
	</nldd-inline-dialog>
`,
	parameters: { controls: { disable: true } },
};

export const VariantSuccess = {
	name: 'Variant success',
	render: () => html`
	<nldd-inline-dialog
		variant="success"
		text="Aanvraag A-1043 is afgerond"
		supporting-text="Je krijgt binnen twee weken bericht over de uitkomst."
	></nldd-inline-dialog>
`,
	parameters: { controls: { disable: true } },
};

/**
 * `variant="loading"` toont een `nldd-activity-indicator` in plaats van een
 * icoon — voor een lege toestand die nog aan het laden is. De spinner is een
 * `role="status"`-live-region die "Laden" aankondigt, en verschijnt direct
 * (`timing="instant"`, geen anti-flash-vertraging). Overrulet een expliciet
 * `icon`.
 */
export const VariantLoading = {
	name: 'Variant loading',
	render: () => html`
	<nldd-inline-dialog
		variant="loading"
		text="Gegevens laden"
		supporting-text="Even geduld, we halen de resultaten op."
	></nldd-inline-dialog>
`,
	parameters: { controls: { disable: true } },
};

/**
 * `size="lg"` bumpt de typografie een stap omhoog (body-lg-bold + body-md
 * voor de supporting-text). Bruikbaar voor prominentere lege-toestanden
 * of hero-achtige dialogen.
 */
export const Groot = {
	render: () => html`
		<nldd-inline-dialog
			size="lg"
			icon="info-circle"
			text="Grotere dialog"
			supporting-text="Met size=&quot;lg&quot; krijgt zowel de hoofdtekst als de supporting-text een stap grotere typografie."
		></nldd-inline-dialog>
	`,
	parameters: { controls: { disable: true } },
};

export const LegeToestand = {
	render: () => html`
	<nldd-box style="height: 400px;">
		<nldd-container
			padding="16"
			horizontal-alignment="center"
			vertical-alignment="center"
			style="height: 100%;"
		>
			<nldd-inline-dialog
				icon="inbox"
				text="Geen resultaten"
				supporting-text="Er zijn geen items gevonden die overeenkomen met je zoekopdracht."
			>
				<nldd-button
					slot="actions"
					appearance="neutral-tinted"
					text="Zoekopdracht wissen"
				></nldd-button>
			</nldd-inline-dialog>
		</nldd-container>
	</nldd-box>
`,
	parameters: { controls: { disable: true } },
};

/**
 * Zet je iets in de default slot, dan is de dialog geen melding meer maar een
 * taak. Tekst, icoon en knoppen lijnen dan links uit, en de knoppen komen naast
 * elkaar in plaats van gestapeld over de volle breedte. Je hoeft daar niets
 * voor te zetten: het component leidt het af uit de slot.
 *
 * De reden is de leesrichting. Een formulierveld begint links, en een kop die
 * daarboven gecentreerd staat legt een tweede as over dezelfde kolom.
 */
export const MetFormulier = {
	name: 'Met formulier (links uitgelijnd)',
	render: () => html`
		<nldd-inline-dialog
			icon="write"
			text="Dossier D-318 hernoemen"
			supporting-text="De nieuwe naam is meteen zichtbaar voor iedereen met toegang."
		>
			<nldd-form-field label="Naam">
				<nldd-text-field value="Dossier D-318"></nldd-text-field>
			</nldd-form-field>
			<nldd-button
				slot="actions"
				appearance="primary"
				text="Bewaar"
			></nldd-button>
			<nldd-button
				slot="actions"
				appearance="neutral-tinted"
				text="Annuleer"
			></nldd-button>
		</nldd-inline-dialog>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * De afgeleide regel dekt niet alles. Met `horizontal-alignment` overschrijf je
 * hem in beide richtingen: links voor een lange melding zonder slot, of
 * gecentreerd voor slot-inhoud die zelf al een gecentreerde figuur is,
 * bijvoorbeeld een illustratie.
 */
export const UitlijningOverschrijven = {
	name: 'Uitlijning overschrijven',
	render: () => html`
		<nldd-container gap="32">
			<nldd-inline-dialog
				horizontal-alignment="left"
				icon="alert"
				text="Deze aanvraag verloopt over 3 dagen"
				supporting-text="Na 12 maart vervalt de aanvraag en moet je opnieuw beginnen. Je ingevulde gegevens blijven tot die tijd bewaard."
			>
				<nldd-button
					slot="actions"
					appearance="primary"
					text="Aanvraag afronden"
				></nldd-button>
			</nldd-inline-dialog>

			<nldd-inline-dialog
				horizontal-alignment="center"
				text="Bijna klaar"
				supporting-text="Nog één stap te gaan."
			>
				<nldd-progress-circle
					value="80"
					max="100"
					size="64"
					value-display="inline"
				></nldd-progress-circle>
				<nldd-button
					slot="actions"
					appearance="primary"
					text="Afronden"
				></nldd-button>
			</nldd-inline-dialog>
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Boven: `left` op een melding zonder slot, want de tekst is te lang om gecentreerd prettig te lezen. Onder: `center` op slot-inhoud die zelf al symmetrisch is.',
			},
		},
	},
};
