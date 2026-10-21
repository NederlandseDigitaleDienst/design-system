import '../components/index.js';

/**
 * Every part of the interface a theme changes, on one page. The
 * "Themacontrole" docs page renders it once per mode, in an iframe with its own
 * data-nldd-theme on <html>: a theme applies to the whole page, so one page
 * cannot show two side by side. Kept out of the sidebar for that reason.
 */
export default {
	title: 'Docs/Themacontrole/Onderdelen',
	tags: ['!dev', '!autodocs'],
	parameters: { layout: 'fullscreen' },
};

const group = (title: string, content: string) => `
	<section style="display: flex; flex-direction: column; gap: 12px;">
		<nldd-text weight="bold">${title}</nldd-text>
		${content}
	</section>`;

const row = (content: string) => `<div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">${content}</div>`;

const markup = `
<div style="display: flex; flex-direction: column; gap: 32px; padding: 16px; font-family: var(--primitives-font-family-body); color: var(--semantics-content-color);">
	${group('Knoppen', row(`
		<nldd-button appearance="primary" text="Aanvraag starten"></nldd-button>
		<nldd-button appearance="accent-transparent" text="Bekijk je aanvraag"></nldd-button>
		<nldd-badge color="accent" text="Nieuw"></nldd-badge>
		<nldd-badge color="accent" number="3"></nldd-badge>
	`))}

	${group('Menu', row(`
		<nldd-button text="Nieuwste eerst" start-icon="sort" expandable>
			<nldd-menu slot="popup">
				<nldd-menu-item type="radio" text="Nieuwste eerst" selected></nldd-menu-item>
				<nldd-menu-item type="radio" text="Oudste eerst"></nldd-menu-item>
				<nldd-menu-item type="radio" text="Naam (A-Z)"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`))}

	${group('Selectie', `
		${row(`
			<nldd-segmented-control value="lijst">
				<nldd-segmented-control-item value="lijst" text="Lijst"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="kaart" text="Kaart"></nldd-segmented-control-item>
			</nldd-segmented-control>
			<nldd-toggle-button-group type="radio" accessible-label="Weergave">
				<nldd-toggle-button value="dag" text="Dag" selected></nldd-toggle-button>
				<nldd-toggle-button value="week" text="Week"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`)}
		<nldd-tab-bar variant="text">
			<nldd-tab-bar-item text="Dossiers" current></nldd-tab-bar-item>
			<nldd-tab-bar-item text="Aanvragen"></nldd-tab-bar-item>
		</nldd-tab-bar>
		${row(`
			<nldd-checkbox-field label="Afgerond" checked></nldd-checkbox-field>
			<nldd-switch-field label="Meldingen" checked></nldd-switch-field>
		`)}
		<nldd-radio-button-group accessible-label="Team">
			<nldd-radio-button-field label="Team Uitvoering" value="uitvoering" checked></nldd-radio-button-field>
			<nldd-radio-button-field label="Team Beleid" value="beleid"></nldd-radio-button-field>
		</nldd-radio-button-group>
	`)}

	${group('Lijst', `
		<nldd-list>
			<nldd-list-item checkbox checked>
				<nldd-cell><nldd-checkbox decorative checked></nldd-checkbox></nldd-cell>
				<nldd-spacer-cell></nldd-spacer-cell>
				<nldd-text-cell text="Dossier D-318" supporting-text="Geselecteerde rij"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item href="#" current>
				<nldd-text-cell text="Dossier D-319" supporting-text="Huidige rij"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item href="#">
				<nldd-text-cell text="Aanvraag A-1042" supporting-text="Accentkleur" color="accent"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`)}

	${group('Tekst', `
		<nldd-link href="#" text="Bekijk je aanvraag"></nldd-link>
		<nldd-rich-text><p>Je aanvraag voor dakisolatie is in behandeling. <a href="#">Lees hoe het verder gaat</a>.</p></nldd-rich-text>
		<nldd-text color="accent">Accenttekst</nldd-text>
	`)}

	${group('Meldingen en labels', `
		${row(`
			<nldd-tag color="accent" text="Dakisolatie"></nldd-tag>
			<nldd-tag text="Warmtepomp"></nldd-tag>
		`)}
		<nldd-banner variant="accent" text="Je aanvraag is ontvangen" supporting-text="We nemen binnen tien werkdagen contact met je op."></nldd-banner>
		<nldd-status-bar variant="accent" text="Testomgeving"></nldd-status-bar>
	`)}

	${group('Voortgang', row(`
		<div style="flex: 1 1 240px;"><nldd-progress-bar value="60" text="Aanvraag A-1042"></nldd-progress-bar></div>
		<nldd-progress-circle value="60" size="48" value-display="inline" text="Dossier D-318"></nldd-progress-circle>
	`))}

	${group('Vlakken', `
		<nldd-hero>
			<nldd-title color="inherit" size="3" text="Regel je aanvraag online" supporting-text="Accentvlak" heading-level="2"></nldd-title>
			<nldd-spacer size="16"></nldd-spacer>
			<div style="display: flex; flex-wrap: wrap; gap: 16px;">
				<nldd-checkbox-field color="inherit" label="Stuur me een bericht" checked></nldd-checkbox-field>
				<nldd-switch-field color="inherit" label="Meldingen" checked></nldd-switch-field>
				<nldd-radio-button-group accessible-label="Team">
					<nldd-radio-button-field color="inherit" label="Team Uitvoering" value="uitvoering" checked></nldd-radio-button-field>
				</nldd-radio-button-group>
			</div>
		</nldd-hero>
		<nldd-simple-section background="accent-tinted">
			<nldd-rich-text><p>Een sectie op <code>accent-tinted</code>, met <a href="#">een link</a>.</p></nldd-rich-text>
		</nldd-simple-section>
		${row(`
			<nldd-box background="accent-tinted"><nldd-container padding="16"><nldd-text>Box op accent-tinted</nldd-text></nldd-container></nldd-box>
			<nldd-card background="accent-tinted"><nldd-container padding="16"><nldd-text>Kaart op accent-tinted</nldd-text></nldd-container></nldd-card>
		`)}
	`)}
</div>
`;

export const AlleOnderdelen = {
	name: 'Alle onderdelen',
	render: () => {
		const root = document.createElement('div');
		root.innerHTML = markup;
		return root;
	},
};
