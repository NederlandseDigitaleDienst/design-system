import { html, nothing } from 'lit';
import './menu.js';
import '../../actions/button/button.js';
import '../../content/identity/identity.js';
import '../../content/rich-text/rich-text.js';
import '../../layout/container/container.js';

// Self-contained SVG avatar (data URI) so the story needs no external image.
const AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23185FA5'/%3E%3Ctext x='20' y='25' font-family='sans-serif' font-size='14' fill='white' text-anchor='middle'%3EAV%3C/text%3E%3C/svg%3E`;

export default {
	title: 'Components/Actions/Menu',
	component: 'nldd-menu',
	tags: ['autodocs'],
};

export const Standaard = {
	tags: ['!autodocs'],
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Menu item"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
};

/**
 * `details` toont een secundair label rechts van het item — bijvoorbeeld de
 * huidige waarde of een aantal. Voor sneltoetsen is er het aparte
 * `shortcut`-attribuut (zie de story Sneltoetsen).
 */
export const MetDetails = {
	render: () => html`
		<nldd-button expandable text="Voorkeuren">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Taal" details="Nederlands"></nldd-menu-item>
				<nldd-menu-item text="Tijdzone" details="Amsterdam"></nldd-menu-item>
				<nldd-menu-item text="Thema" details="Systeem"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
};

/**
 * Met `shortcut` toont een item zijn sneltoets als nette `<kbd>`-toetsen (via
 * nldd-keyboard-shortcut) in plaats van platte `details`-tekst. Dit is puur ter
 * weergave — het component bindt de toets niet; koppel de afhandeling zelf in je
 * applicatie. Gebruik `shortcut-mac`/`shortcut-windows`/`shortcut-linux` voor
 * platform-specifieke weergave. Op touch-only apparaten verdwijnt de hint, want
 * daar is hij niet aanroepbaar.
 */
export const Sneltoetsen = {
	render: () => html`
		<nldd-button expandable text="Bewerken">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Ongedaan maken" shortcut="Ctrl+Z" shortcut-mac="Cmd+Z"></nldd-menu-item>
				<nldd-menu-item text="Knippen" shortcut="Ctrl+X" shortcut-mac="Cmd+X"></nldd-menu-item>
				<nldd-menu-item text="Kopiëren" shortcut="Ctrl+C" shortcut-mac="Cmd+C"></nldd-menu-item>
				<nldd-menu-item text="Plakken" shortcut="Ctrl+V" shortcut-mac="Cmd+V"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
};

export const MetIconen = {
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Bewerk" icon="pencil"></nldd-menu-item>
				<nldd-menu-item text="Dupliceer" icon="square-plus-on-square"></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item destructive text="Verwijder" icon="trash"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
};

/**
 * Met een `href` rendert een item als echte link (`<a>`), zodat middenklik,
 * "openen in nieuw tabblad" en "kopieer linkadres" werken. Een geselecteerd
 * link-item krijgt `aria-current="page"`. href wordt genegeerd voor
 * submenu-openers, checkbox/radio-items en uitgeschakelde items.
 */
export const Links = {
	render: () => html`
		<nldd-button expandable text="Account">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Mijn profiel" href="#profiel" icon="user"></nldd-menu-item>
				<nldd-menu-item text="Instellingen" href="#instellingen" icon="settings"></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item text="Log uit" href="#uitloggen" icon="logout"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
};

/**
 * Het menu groeit standaard mee met de breedste regel — handig voor lange
 * labels — tot een maximum van `min(100vw - inset, 640px)`. Korte menu's houden
 * de minimumbreedte aan; met een expliciete `width` zet je een vaste breedte.
 */
export const BredeInhoud = {
	render: () => html`
		<nldd-button expandable text="Acties">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Document downloaden als ondertekende PDF"></nldd-menu-item>
				<nldd-menu-item text="Deel met alle medewerkers van de afdeling"></nldd-menu-item>
				<nldd-menu-item text="Archiveer en verwijder uit het overzicht"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
};

/**
 * Met een expliciete `width` zet je het menu op een vaste breedte; leeg laten
 * laat het meegroeien met de inhoud (tussen een minimum en
 * `min(100vw - inset, 640px)`). Speel met de control.
 */
export const Breedte = {
	render: (args: Record<string, any>) => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup" width=${args.width || nothing}>
				<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
				<nldd-menu-item text="België" value="be"></nldd-menu-item>
				<nldd-menu-item text="Duitsland" value="de"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
	args: { width: '360px' },
	argTypes: {
		width: {
			control: 'text',
			description: 'Expliciete breedte (any CSS length, bv. "320px"). Leeg = mee met de inhoud.',
		},
	},
};

export const MetScheidingslijn = {
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Hernoemen" icon="write"></nldd-menu-item>
				<nldd-menu-item text="Dupliceren" icon="duplicate"></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item text="Verwijderen" icon="delete" destructive></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
};

export const Checkbox = {
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item type="checkbox" text="Optie 1" selected></nldd-menu-item>
				<nldd-menu-item type="checkbox" text="Optie 2"></nldd-menu-item>
				<nldd-menu-item type="checkbox" text="Optie 3"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
};

export const Radio = {
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item type="radio" text="Optie A" selected></nldd-menu-item>
				<nldd-menu-item type="radio" text="Optie B"></nldd-menu-item>
				<nldd-menu-item type="radio" text="Optie C"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
};

export const IconenEnVinkjes = {
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item type="checkbox" text="Vet" selected></nldd-menu-item>
				<nldd-menu-item type="checkbox" text="Cursief"></nldd-menu-item>
				<nldd-menu-item type="radio" text="Linksuitlijning" selected></nldd-menu-item>
				<nldd-menu-item type="radio" text="Centreren"></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item text="Bewerk citaat" icon="text-quote"></nldd-menu-item>
				<nldd-menu-item text="Voorbeeldweergave" icon="eye"></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item type="checkbox" text="Vet (met icoon)" icon="bold" selected></nldd-menu-item>
				<nldd-menu-item type="checkbox" text="Cursief (met icoon)" icon="italic"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Mix van items met checkbox/radio en items met alleen een icoon: hun teksten lijnen uit doordat het check-cel-blok en het icoon-cel-blok dezelfde leading-breedte hebben. Items die zowel een checkbox/radio als een icoon hebben zijn extra ingesprongen — dat is bewust.',
			},
		},
	},
};

export const ItemDisabled = {
	name: 'Item disabled',
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Bewerk"></nldd-menu-item>
				<nldd-menu-item text="Uitgeschakeld" disabled></nldd-menu-item>
				<nldd-menu-item text="Kopieer"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
};

export const Destructief = {
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Bewerk" icon="pencil"></nldd-menu-item>
				<nldd-menu-item text="Dupliceer" icon="square-plus-on-square"></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item destructive text="Verwijder" icon="trash"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Markeer onomkeerbare acties als `destructive` voor een rode tekstkleur en een rode highlight-achtergrond — zodat de actie visueel afwijkt van veilige items in dezelfde menu.',
			},
		},
	},
};

export const MetGroepen = {
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-group text="Bestand">
					<nldd-menu-item text="Nieuw"></nldd-menu-item>
					<nldd-menu-item text="Open…"></nldd-menu-item>
					<nldd-menu-item text="Opslaan"></nldd-menu-item>
				</nldd-menu-group>
				<nldd-menu-group text="Bewerken">
					<nldd-menu-item text="Knip"></nldd-menu-item>
					<nldd-menu-item text="Kopieer"></nldd-menu-item>
					<nldd-menu-item text="Plak"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-menu>
		</nldd-button>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Wrap items in `<nldd-menu-group text="…">` voor een gelabelde sectie. De groep krijgt automatisch een divider boven (behalve als het de eerste child van de menu is) en levert proper ARIA `role="group"` met `aria-labelledby` voor screen readers.',
			},
		},
	},
};

export const MetSubmenuOpMeerdereNiveaus = {
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Nieuw"></nldd-menu-item>
						<nldd-menu-item text="Open recent">
							<nldd-menu>
								<nldd-menu-item text="2026-Q2.xlsx"></nldd-menu-item>
								<nldd-menu-item text="Notulen.docx"></nldd-menu-item>
								<nldd-menu-item text="Plan.pdf"></nldd-menu-item>
							</nldd-menu>
						</nldd-menu-item>
						<nldd-menu-item text="Sluiten"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
				<nldd-menu-item text="Bewerken"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Submenus mogen recursief geneste submenus bevatten — geen diepte-limiet. Elk niveau opent z\'n eigen popover (cascade) of stapelt op dezelfde positie (drill-in mobiel). Toetsenbord: ArrowRight opent submenu en focust eerste item, ArrowLeft of Esc gaat één niveau terug.',
			},
		},
	},
};

export const MetSubmenu = {
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Nieuw"></nldd-menu-item>
				<nldd-menu-item text="Open recent">
					<nldd-menu>
						<nldd-menu-item text="2026-Q2.xlsx"></nldd-menu-item>
						<nldd-menu-item text="Notulen.docx"></nldd-menu-item>
						<nldd-menu-item text="Plan.pdf"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
				<nldd-menu-item text="Exporteer">
					<nldd-menu>
						<nldd-menu-item text="Als PDF"></nldd-menu-item>
						<nldd-menu-item text="Als CSV"></nldd-menu-item>
						<nldd-menu-item text="Als Excel"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item text="Sluiten"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Wrap een `<nldd-menu>` in een `<nldd-menu-item>` om er een submenu van te maken. Het item krijgt automatisch een chevron-rechts indicator en `aria-haspopup="menu"`. Klik op het item opent het submenu naast de parent (cascade). Een item is óf een actie óf een submenu-opener — geen beide. Selectie van een item ergens in de keten sluit alle popovers tegelijk.',
			},
		},
	},
};

export const DebugVeiligeDriehoek = {
	name: 'Debug: veilige driehoek',
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup" debug-safe-triangle>
				<nldd-menu-item text="Nieuw"></nldd-menu-item>
				<nldd-menu-item text="Open recent">
					<nldd-menu debug-safe-triangle>
						<nldd-menu-item text="2026-Q2.xlsx"></nldd-menu-item>
						<nldd-menu-item text="Notulen.docx"></nldd-menu-item>
						<nldd-menu-item text="Plan.pdf"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
				<nldd-menu-item text="Sluiten"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Schakel het `debug-safe-triangle` attribuut aan om de safe triangle als translucent roze overlay te visualiseren. Handig voor debugging en het tunen van padding-waardes — niet voor productie.',
			},
		},
	},
};

export const PlatEnGroepenGemengd = {
	render: () => html`
		<nldd-button expandable text="Open menu">
			<nldd-menu slot="popup">
				<nldd-menu-item text="Recent geopend"></nldd-menu-item>
				<nldd-menu-group text="Mappen">
					<nldd-menu-item text="Documenten" icon="folder"></nldd-menu-item>
					<nldd-menu-item text="Downloads" icon="folder"></nldd-menu-item>
				</nldd-menu-group>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item text="Sluiten"></nldd-menu-item>
			</nldd-menu>
		</nldd-button>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Flat items en groups kunnen door elkaar gebruikt worden. Een expliciete `<nldd-menu-divider>` direct vóór een groep wordt automatisch verborgen — de groep heeft al z\'n eigen divider boven.',
			},
		},
	},
};

/**
 * De `header`- en `footer`-slots plaatsen vrije content buiten `role="menu"`:
 * hier een account-header (een `nldd-identity` in een `nldd-container` voor de
 * padding) en een kort `nldd-rich-text`-tekstje onderin. Een link in de footer
 * is bereikbaar met Tab (niet met de pijltjes, die alleen de menu-items
 * aflopen). "Log uit" is gewoon een menu-item. Header en footer verschijnen
 * alleen op de root-menu, nooit in een submenu.
 */
export const MetHeaderEnFooter = {
	name: 'Met header en footer (account)',
	render: () => html`
		<nldd-button expandable text="Account">
			<nldd-menu slot="popup">
				<nldd-container slot="header" padding="16">
					<nldd-identity
						text="Anouk de Vries"
						supporting-text="anouk@rijksoverheid.nl"
						avatar-src=${AVATAR}
						avatar-alt=""
					></nldd-identity>
				</nldd-container>

				<nldd-menu-item text="Profiel" icon="person"></nldd-menu-item>
				<nldd-menu-item text="Instellingen" icon="gear"></nldd-menu-item>
				<nldd-menu-item text="Facturen" icon="file-text"></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item text="Log uit" icon="logout"></nldd-menu-item>

				<nldd-container slot="footer" padding="16">
					<nldd-rich-text spacing="flat">
						<p style="font: var(--primitives-font-body-sm-regular-tight);">Je bent ingelogd als beheerder. <a href="#">Wissel van account</a>.</p>
					</nldd-rich-text>
				</nldd-container>
			</nldd-menu>
		</nldd-button>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Vrije content in `header` / `footer` (buiten `role="menu"`): een `nldd-container` levert de padding, een link is bereikbaar met Tab, en de pijltjes navigeren alleen de menu-items. "Log uit" is een gewoon menu-item; header en footer tonen alleen op de root.',
			},
		},
	},
};

/**
 * Alle stories hierboven nesten het menu in de knop (`slot="popup"`): de knop
 * ankert en togglet het menu dan zelf, zonder `id`-boilerplate. Dat is de route
 * die je wilt bij `nldd-button`, `nldd-icon-button` en `nldd-split-button`.
 *
 * Is je anker géén van die drie — een eigen control, of een DS-component zonder
 * `popup`-slot zoals `nldd-list-item-segment` — dan is er nog `anchor`: zet het
 * op de id van het ankerelement. Het menu positioneert zichzelf ertegen en
 * luistert op document-clicks om zichzelf te openen en te sluiten.
 *
 * Wat je er dan zelf bij moet leveren: het anker moet een echt bedienbaar
 * element zijn (focusbaar, met een toegankelijke naam), en je zet zelf
 * `aria-expanded` bij. Die sync loopt alleen op ankers met een
 * `expanded`-property — dus wel op `nldd-button`, niet op een eigen control.
 * Hieronder gebeurt dat via het `toggle`-event van de popover.
 */
export const AnkerenViaId = {
	name: 'Ankeren via id',
	render: () => html`
		<button id="eigen-anker" type="button" aria-haspopup="menu" aria-expanded="false">Eigen control</button>
		<nldd-menu
			anchor="eigen-anker"
			@toggle=${(e: ToggleEvent) => {
				const anchor = (e.currentTarget as HTMLElement).getRootNode() as Document | ShadowRoot;
				anchor.getElementById?.('eigen-anker')?.setAttribute('aria-expanded', String(e.newState === 'open'));
			}}
		>
			<nldd-menu-item text="Bewerken" icon="pencil"></nldd-menu-item>
			<nldd-menu-item text="Dupliceren" icon="square-plus-on-square"></nldd-menu-item>
			<nldd-menu-divider></nldd-menu-divider>
			<nldd-menu-item destructive text="Verwijderen" icon="trash"></nldd-menu-item>
		</nldd-menu>
	`,
	parameters: {
		docs: {
			description: {
				story: 'De `anchor`-route voor ankers zonder `popup`-slot. Bij een `nldd-button` nest je het menu in de knop; dit is de uitweg voor alles daarbuiten.',
			},
		},
	},
};
