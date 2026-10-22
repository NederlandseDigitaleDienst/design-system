import { html } from 'lit';
import '../components/index.js';

/**
 * Veel controls op één pagina, om een thema of een wijziging in de tokens in
 * één keer te bekijken. Wissel het thema en licht/donker in de toolbar.
 */
export default {
	title: 'Docs/Overzicht controls',
	parameters: {
		layout: 'padded',
		controls: { disable: true },
	},
};

const section = (title: string, content: unknown) => html`
	<nldd-container gap="12">
		<nldd-title
			size="5"
			text=${title}
			heading-level="2"
		></nldd-title>
		${content}
	</nldd-container>
`;

const row = (content: unknown) => html`
	<nldd-container
		layout="wrap"
		gap="8"
		vertical-alignment="center"
	>
		${content}
	</nldd-container>
`;

export const Overzicht = {
	render: () => html`
	<nldd-container gap="40">
		${section('Knoppen', html`
			${row(html`
				<nldd-button appearance="primary" text="Opslaan" shortcut="Ctrl+S" shortcut-mac="Cmd+S"></nldd-button>
				<nldd-button appearance="secondary" text="Annuleer"></nldd-button>
				<nldd-button appearance="neutral-base" text="Bewerken"></nldd-button>
				<nldd-button appearance="neutral-transparent" text="Meer"></nldd-button>
				<nldd-button appearance="accent-transparent" text="Details"></nldd-button>
				<nldd-button appearance="critical-tinted" text="Verwijderen"></nldd-button>
				<nldd-button appearance="destructive" text="Definitief verwijderen"></nldd-button>
			`)}
			${row(html`
				<nldd-button appearance="primary" text="Open" expandable expanded></nldd-button>
				<nldd-button text="Open" expandable expanded></nldd-button>
				<nldd-button appearance="primary" text="Versturen" loading></nldd-button>
				<nldd-button text="Uitgeschakeld" disabled></nldd-button>
				<nldd-button text="Met ondersteunende tekst" supporting-text="Aanvraag A-1042"></nldd-button>
			`)}
			${row(html`
				<nldd-icon-button appearance="primary" icon="plus" text="Toevoegen"></nldd-icon-button>
				<nldd-icon-button icon="edit" text="Bewerken"></nldd-icon-button>
				<nldd-icon-button appearance="neutral-transparent" icon="more" text="Meer opties" shortcut="Alt+M"></nldd-icon-button>
				<nldd-icon-button appearance="neutral-transparent" icon="more" text="Meer opties" expandable expanded></nldd-icon-button>
				<nldd-icon-button appearance="critical-transparent" icon="trash" text="Verwijderen"></nldd-icon-button>
				<nldd-split-button appearance="primary" text="Bewaar" shortcut="Ctrl+S" shortcut-mac="Cmd+S">
					<nldd-menu slot="popup">
						<nldd-menu-item text="Bewaar als concept"></nldd-menu-item>
					</nldd-menu>
				</nldd-split-button>
			`)}
		`)}

		${section('Aan en uit', html`
			${row(html`
				<nldd-toggle-button-group type="button" accessible-label="Tekst opmaken">
					<nldd-toggle-button value="bold" accessible-label="Vet" icon="bold" selected shortcut="Ctrl+B" shortcut-mac="Cmd+B"></nldd-toggle-button>
					<nldd-toggle-button value="italic" accessible-label="Cursief" icon="italic"></nldd-toggle-button>
					<nldd-toggle-button value="underlined" accessible-label="Onderstreept" icon="underlined"></nldd-toggle-button>
				</nldd-toggle-button-group>
				<nldd-toggle-button text="Favoriet" icon="heart" selected-icon="heart-filled" selected></nldd-toggle-button>
				<nldd-toggle-button text="Favoriet" icon="heart" selected-icon="heart-filled"></nldd-toggle-button>
			`)}
			${row(html`
				<nldd-segmented-control value="list" accessible-label="Weergave">
					<nldd-segmented-control-item value="list" text="Lijst"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="kaarten" text="Kaarten"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="agenda" text="Agenda"></nldd-segmented-control-item>
				</nldd-segmented-control>
				<nldd-segmented-control type="checkbox" variant="icon" accessible-label="Nadruk">
					<nldd-segmented-control-item value="bold" text="Vet" icon="bold" selected></nldd-segmented-control-item>
					<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
				</nldd-segmented-control>
			`)}
			${row(html`
				<nldd-checkbox checked accessible-label="Aangevinkt"></nldd-checkbox>
				<nldd-checkbox accessible-label="Niet aangevinkt"></nldd-checkbox>
				<nldd-checkbox indeterminate accessible-label="Deels"></nldd-checkbox>
				<nldd-checkbox checked disabled accessible-label="Uitgeschakeld"></nldd-checkbox>
				<nldd-radio-button-group name="overzicht" accessible-label="Keuze">
					<nldd-radio-button value="1" checked accessible-label="Optie 1"></nldd-radio-button>
					<nldd-radio-button value="2" accessible-label="Optie 2"></nldd-radio-button>
				</nldd-radio-button-group>
				<nldd-switch checked accessible-label="Aan"></nldd-switch>
				<nldd-switch accessible-label="Uit"></nldd-switch>
			`)}
		`)}

		${section('Menu\'s', html`
			<nldd-text>Een menu is een popover: er staat er één tegelijk open. Klik op een knop om het te openen.</nldd-text>
			${row(html`
				<nldd-button text="Bewerken" expandable>
					<nldd-menu slot="popup">
						<nldd-menu-item text="Maak ongedaan" icon="undo" shortcut="Ctrl+Z" shortcut-mac="Cmd+Z"></nldd-menu-item>
						<nldd-menu-item text="Voer opnieuw uit" icon="redo" shortcut="Ctrl+Y" shortcut-mac="Cmd+Shift+Z" disabled></nldd-menu-item>
						<nldd-menu-divider></nldd-menu-divider>
						<nldd-menu-item text="Kopieer" icon="copy" shortcut="Ctrl+C" shortcut-mac="Cmd+C"></nldd-menu-item>
						<nldd-menu-item text="Plak" icon="paste" shortcut="Ctrl+V" shortcut-mac="Cmd+V"></nldd-menu-item>
						<nldd-menu-divider></nldd-menu-divider>
						<nldd-menu-item text="Verwijderen" icon="trash" destructive></nldd-menu-item>
					</nldd-menu>
				</nldd-button>
				<nldd-button text="Weergave" expandable>
					<nldd-menu slot="popup">
						<nldd-menu-group text="Sorteren">
							<nldd-menu-item type="radio" text="Nieuwste eerst" selected></nldd-menu-item>
							<nldd-menu-item type="radio" text="Oudste eerst"></nldd-menu-item>
						</nldd-menu-group>
						<nldd-menu-group text="Tonen">
							<nldd-menu-item type="checkbox" text="Afgerond" selected></nldd-menu-item>
							<nldd-menu-item type="checkbox" text="In behandeling" selected></nldd-menu-item>
							<nldd-menu-item type="checkbox" text="Archief"></nldd-menu-item>
						</nldd-menu-group>
					</nldd-menu>
				</nldd-button>
				<nldd-icon-button appearance="neutral-transparent" icon="more" text="Meer opties">
					<nldd-menu slot="popup">
						<nldd-menu-item text="Aanvraag A-1042" details="Dakisolatie"></nldd-menu-item>
						<nldd-menu-item text="Aanvraag A-1043" details="Warmtepomp"></nldd-menu-item>
						<nldd-menu-item text="Verplaats naar" icon="folder">
							<nldd-menu>
								<nldd-menu-item text="Dossier D-318"></nldd-menu-item>
								<nldd-menu-item text="Dossier D-319"></nldd-menu-item>
							</nldd-menu>
						</nldd-menu-item>
					</nldd-menu>
				</nldd-icon-button>
			`)}
		`)}

		${section('Velden', html`
			<nldd-container gap="12" max-width="480px">
				<nldd-text-field placeholder="Naam" accessible-label="Naam"></nldd-text-field>
				<nldd-search-field placeholder="Zoek een aanvraag" shortcut="/"></nldd-search-field>
				<nldd-number-field value="3" accessible-label="Aantal"></nldd-number-field>
				<nldd-dropdown>
					<select aria-label="Status">
						<option>In behandeling</option>
						<option>Afgerond</option>
					</select>
				</nldd-dropdown>
				<nldd-text-field value="Ongeldige waarde" invalid accessible-label="Ongeldig"></nldd-text-field>
			</nldd-container>
		`)}

		${section('Datum', html`
			<nldd-date-picker range start="2026-10-06" end="2026-10-17" accessible-label="Periode"></nldd-date-picker>
		`)}

		${section('Navigatie', html`
			<nldd-tab-bar accessible-label="Aanvragen">
				<nldd-tab-bar-item text="Open" current></nldd-tab-bar-item>
				<nldd-tab-bar-item text="Afgerond"></nldd-tab-bar-item>
				<nldd-tab-bar-item text="Archief"></nldd-tab-bar-item>
			</nldd-tab-bar>
			<nldd-document-tab-bar accessible-label="Documenten">
				<nldd-document-tab-bar-item selected text="Aanvraag A-1042" supporting-text="Dakisolatie"></nldd-document-tab-bar-item>
				<nldd-document-tab-bar-item text="Aanvraag A-1043" supporting-text="Warmtepomp"></nldd-document-tab-bar-item>
			</nldd-document-tab-bar>
			<nldd-step-bar>
				<nldd-step-bar-item text="Gegevens"></nldd-step-bar-item>
				<nldd-step-bar-item text="Controle" status="current"></nldd-step-bar-item>
				<nldd-step-bar-item text="Bevestigen"></nldd-step-bar-item>
			</nldd-step-bar>
			<nldd-text>
				<nldd-link href="#" text="Bekijk de aanvraag"></nldd-link>
				of ga naar
				<nldd-link href="https://www.rijksoverheid.nl" text="Rijksoverheid"></nldd-link>
			</nldd-text>
		`)}

		${section('Status', html`
			${row(html`
				<nldd-badge color="critical" number="3"></nldd-badge>
				<nldd-badge color="accent" text="Nieuw"></nldd-badge>
				<nldd-badge color="neutral" text="Concept"></nldd-badge>
				<nldd-tag color="accent" text="Dakisolatie"></nldd-tag>
				<nldd-tag color="neutral" text="Team Uitvoering"></nldd-tag>
				<nldd-tag color="success" text="Afgerond"></nldd-tag>
			`)}
			<nldd-status-bar variant="accent" text="Aanvraag A-1042 is in behandeling"></nldd-status-bar>
			<nldd-progress-bar value="60" text="Voortgang"></nldd-progress-bar>
			${row(html`
				<nldd-progress-circle value="60" text="Voortgang"></nldd-progress-circle>
				<nldd-progress-circle indeterminate text="Laden"></nldd-progress-circle>
			`)}
			<nldd-banner variant="accent" text="Mijn Dienst is vernieuwd" supporting-text="Bekijk wat er veranderd is."></nldd-banner>
			<nldd-banner variant="critical" text="Er ging iets mis" supporting-text="Probeer het later opnieuw."></nldd-banner>
		`)}

		${section('Kaarten', html`
			<nldd-container layout="grid" gap="16">
				<nldd-card href="#" accessible-label="Aanvraag A-1042">
					<nldd-container padding="16">
						<nldd-title size="5" text="Aanvraag A-1042" heading-level="3"></nldd-title>
					</nldd-container>
				</nldd-card>
				<nldd-card background="accent-tinted" accessible-label="Dossier D-318">
					<nldd-container padding="16">
						<nldd-title size="5" text="Dossier D-318" heading-level="3"></nldd-title>
					</nldd-container>
				</nldd-card>
			</nldd-container>
		`)}
	</nldd-container>
`,
};
