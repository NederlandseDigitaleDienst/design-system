import { html } from 'lit';
import '../components/index.js';
import { NLDDNotification } from '../components/status-and-feedback/notification/notification.js';

/**
 * Many controls on one page, light and dark side by side, to check a theme or
 * a token change at a glance. Each theme is its own story.
 */
export default {
	title: "Docs/Thema's",
	parameters: {
		layout: 'fullscreen',
		controls: { disable: true },
	},
};

const EDITOR_VALUE = [
	'Bespreek de **toegankelijkheid** met [@Anouk de Vries](user:1) en [@Bram Jansen](user:2).',
	'De `WCAG 2.2`-criteria zijn *leidend*, zie de [richtlijn](https://www.w3.org/TR/WCAG22/).',
	'',
	'- Contrast op de knoppen verhogen',
	'',
	'> Let op: de deadline is volgende week.',
].join('\n');

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

// A notification places itself outside the column, so it takes the column's
// scheme from the button that raised it.
const notify = (scheme: 'light' | 'dark') => {
	NLDDNotification.show({ text: 'Aanvraag A-1042 is opgeslagen', supportingText: 'Je vindt hem terug in Mijn Dienst.', variant: 'accent' });
	const shown = document.querySelectorAll('nldd-notification');
	(shown[shown.length - 1] as HTMLElement | undefined)?.style.setProperty('color-scheme', scheme);
};

const overview = (scheme: 'light' | 'dark') => html`
	<nldd-container gap="40">
		${section('Knoppen', html`
			${row(html`
				<nldd-button appearance="primary" text="Opslaan" shortcut="Ctrl+S" shortcut-mac="Cmd+S"></nldd-button>
				<nldd-button appearance="secondary" text="Annuleer"></nldd-button>
				<nldd-button appearance="accent-transparent" text="Details"></nldd-button>
				<nldd-button appearance="critical-tinted" text="Verwijderen"></nldd-button>
				<nldd-button appearance="primary" text="Versturen" loading></nldd-button>
			`)}
			${row(html`
				<nldd-icon-button appearance="primary" icon="plus" text="Toevoegen"></nldd-icon-button>
				<nldd-icon-button icon="edit" text="Bewerken"></nldd-icon-button>
				<nldd-split-button appearance="primary" text="Bewaar" shortcut="Ctrl+S" shortcut-mac="Cmd+S">
					<nldd-menu>
						<nldd-menu-item text="Bewaar als concept"></nldd-menu-item>
						<nldd-menu-item text="Bewaar en sluit" shortcut="Ctrl+Shift+S" shortcut-mac="Cmd+Shift+S"></nldd-menu-item>
						<nldd-menu-divider></nldd-menu-divider>
						<nldd-menu-item text="Verwijder concept" icon="trash" destructive></nldd-menu-item>
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
				<nldd-radio-button-group name=${`overzicht-${scheme}`} accessible-label="Keuze">
					<nldd-radio-button value="1" checked accessible-label="Optie 1"></nldd-radio-button>
					<nldd-radio-button value="2" accessible-label="Optie 2"></nldd-radio-button>
				</nldd-radio-button-group>
				<nldd-switch checked accessible-label="Aan"></nldd-switch>
				<nldd-switch accessible-label="Uit"></nldd-switch>
			`)}
		`)}

		${section('Menu\'s', html`
			${row(html`
				<nldd-button appearance="primary" text="Bewerken" expandable>
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
				<nldd-icon-button icon="more" text="Meer opties">
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

		${section('Datum', html`
			<nldd-date-picker range start="2026-10-06" end="2026-10-17" accessible-label="Periode"></nldd-date-picker>
		`)}

		${section('Navigatie', html`
			<nldd-menu-bar accessible-label="Menubalk">
				<nldd-menu-bar-item text="Aanvragen" current></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Dossiers"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Instellingen"></nldd-menu-bar-item>
			</nldd-menu-bar>
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

		${section('Tijdlijn', html`
			<nldd-list dividers="never" accessible-label="Voortgang aanvraag" style="max-width: 420px;">
				<nldd-list-item>
					<nldd-step-cell status="past" size="md" position="first" icon="check-mark"></nldd-step-cell>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
					<nldd-title-cell text="Gegevens" supporting-text="Afgerond"></nldd-title-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-step-cell status="past" size="md" level="minor"></nldd-step-cell>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
					<nldd-text-cell text="Contactgegevens"></nldd-text-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-step-cell status="past" size="md" level="minor"></nldd-step-cell>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
					<nldd-text-cell text="Bankrekening"></nldd-text-cell>
				</nldd-list-item>
				<nldd-list-item aria-current="step">
					<nldd-step-cell status="current" size="md" text="2"></nldd-step-cell>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
					<nldd-title-cell text="Controle" supporting-text="Huidige stap"></nldd-title-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-step-cell status="future" size="md" level="minor"></nldd-step-cell>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
					<nldd-text-cell text="Bijlagen"></nldd-text-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-step-cell status="future" size="md" position="last" text="3"></nldd-step-cell>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
					<nldd-title-cell text="Bevestigen" supporting-text="Nog te doen"></nldd-title-cell>
				</nldd-list-item>
			</nldd-list>
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
			<nldd-inline-dialog icon="info-circle-filled" icon-color="accent" text="Nog geen aanvragen" supporting-text="Een nieuwe aanvraag verschijnt hier."></nldd-inline-dialog>
			${row(html`<nldd-button text="Toon notification" @click=${() => notify(scheme)}></nldd-button>`)}
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

		${section('Velden', html`
			<nldd-container gap="12" max-width="480px">
				<nldd-text-field placeholder="Naam" accessible-label="Naam"></nldd-text-field>
				<nldd-search-field placeholder="Zoek een aanvraag" shortcut="/"></nldd-search-field>
				<nldd-number-field value="3" accessible-label="Aantal"></nldd-number-field>
				<nldd-dropdown>
					<!-- nldd-lint-disable-next-line dropdown-needs-six-options -- Specimen of every field type under a theme, not a choice someone makes. -->
					<select aria-label="Status">
						<option>In behandeling</option>
						<option>Afgerond</option>
					</select>
				</nldd-dropdown>
				<nldd-text-field value="Ongeldige waarde" invalid accessible-label="Ongeldig"></nldd-text-field>
			</nldd-container>
		`)}

		${section('Tekst', html`
			<nldd-container gap="12" max-width="480px">
				<nldd-text-editor
					appearance="input-field"
					accessible-label="Notitie"
					.value=${EDITOR_VALUE}
				></nldd-text-editor>
				<nldd-rich-text>
					<p>Bespreek dit met <a href="#" data-mention>Anouk de Vries</a> en <span data-mention>Bram Jansen</span>, zie de <a href="#">richtlijn</a>.</p>
				</nldd-rich-text>
			</nldd-container>
		`)}
	</nldd-container>
`;

const sideBySide = () => html`
	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr));">
		${(['light', 'dark'] as const).map((scheme) => html`
			<div style="color-scheme: ${scheme}; padding: var(--primitives-space-24); background-color: var(--semantics-surfaces-base-background-color); color: var(--semantics-content-color);">
				${overview(scheme)}
			</div>
		`)}
	</div>
`;

// One story per theme, in the order of the toolbar, so a theme is one click.
const theme = (nlddTheme: string) => ({ render: sideBySide, globals: { nlddTheme } });

export const Lintblauw = theme('lintblauw');
export const Paars = theme('paars');
export const Roze = theme('roze');
export const Violet = theme('violet');
export const Robijnrood = theme('robijnrood');
export const Rood = theme('rood');
export const Donkerbruin = theme('donkerbruin');
export const Oranje = theme('oranje');
export const Donkergeel = theme('donkergeel');
export const Bruin = theme('bruin');
export const Geel = theme('geel');
export const Mosgroen = theme('mosgroen');
export const Groen = theme('groen');
export const Donkergroen = theme('donkergroen');
export const Mintgroen = theme('mintgroen');
export const Lichtblauw = theme('lichtblauw');
export const Donkerblauw = theme('donkerblauw');
export const Hemelblauw = theme('hemelblauw');
