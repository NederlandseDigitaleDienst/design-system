import { html, nothing, render } from 'lit';
import './list.js';
import '../list-item/list-item.js';
import '../cells/title-cell/title-cell.js';
import '../cells/text-cell/text-cell.js';
import '../cells/spacer-cell/spacer-cell.js';
import '../cells/icon-cell/icon-cell.js';
import '../cells/drag-handle-cell/drag-handle-cell.js';
import '../../content/icon/icon.js';
import '../../content/title/title.js';
import '../../content/rich-text/rich-text.js';
import '../../status-and-feedback/inline-dialog/inline-dialog.js';
import '../../actions/button/button.js';
import '../../actions/icon-button/icon-button.js';
import '../../actions/menu/menu.js';
import '../cells/cell/cell.js';
import '../../inputs/toggle-button-group/toggle-button-group.js';
import '../../inputs/toggle-button/toggle-button.js';
import '../../layout/spacer/spacer.js';
import '../../layout/box/box.js';
import '../../inputs/date-field/date-field.js';
import '../../inputs/combo-box/combo-box.js';
import '../../inputs/radio-button/radio-button.js';

export default {
	title: 'Components/Lists & Tables/List',
	component: 'nldd-list',
	tags: ['autodocs'],
	args: {
		variant: 'simple',
		type: 'list',
		dividers: 'always',
		height: '',
		accessibleLabel: '',
		reorderable: false,
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['simple', 'box-tinted', 'box-base'],
			description: 'Visuele stijl: `simple` = platte strip, `box-tinted` = framed card met afgeronde hoeken en border ring, `box-base` dezelfde kaart maar op een al getinte parent',
			table: { defaultValue: { summary: 'simple' } },
		},
		type: {
			control: 'select',
			options: ['list', 'navigation', 'listbox', 'form'],
			description: 'A11y-semantiek: `list` (role="list"), `navigation` (landmark met `aria-current` op het actieve item), `listbox` (filterbare listbox met eigen zoekveld, combobox-patroon) of `form` (rijen die zelf geen actie zijn, met de controls erin; geen pijltjesnavigatie)',
			table: { defaultValue: { summary: 'list' } },
		},
		dividers: {
			control: 'select',
			options: ['always', 'on-touch', 'never'],
			description: 'Wanneer de scheidingslijnen tussen de items getekend worden. `on-touch` alleen waar met een vinger wordt bediend, onder `(pointer: coarse)`: een aanwijzer heeft de hover-highlight om het ene item van het andere te scheiden en een vinger heeft niets. `never` verbergt ze overal.',
			table: { defaultValue: { summary: 'always' } },
		},
		height: {
			control: 'text',
			description: 'Alleen bij `type="listbox"`: maximale hoogte van het scrollbare opties-gebied (elke CSS-lengte, bijv. "320px"). Het zoekveld blijft erboven staan en de opties scrollen. Leeg = geen limiet.',
			table: { type: { summary: 'string' } },
			if: { arg: 'type', eq: 'listbox' },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van de lijst, bij `type="listbox"` van het zoekveld. Bij `type="navigation"` zet je `aria-label` op het element zelf.',
		},
		reorderable: {
			control: 'boolean',
			description: 'Rijen verslepen om de volgorde te veranderen. Alleen bij `type="list"`: de pijltjes verplaatsen dan rijen in plaats van de focus.',
			table: { defaultValue: { summary: false } },
			if: { arg: 'type', eq: 'list' },
		},
	},
	parameters: {
		docs: {
			description: {
				component: `
**Wanneer welk \`type\`:**

- **\`list\`** (default) — semantische lijst (\`role="list"\`) zonder speciaal toetsenbordgedrag. Items kunnen individueel knoppen of links zijn. Gebruik dit voor instellingen-lijsten, data-overzichten en lijsten van kaarten.
- **\`navigation\`** — way-finding tussen pagina's of app-secties. Items zijn links of knoppen, elk afzonderlijk focusbaar via Tab. Het actieve item krijgt \`aria-current="page"\` op basis van de \`selected\`-prop. Gebruik dit voor sidebars, in-app menu's en master/detail pickers.
- **\`listbox\`** — een toegankelijke, filterbare listbox (combobox-patroon). De lijst rendert zijn **eigen zoekveld** (\`role="combobox"\`) bovenaan; \`.list__items\` wordt \`role="listbox"\` en items worden \`role="option"\`. Focus blijft in het zoekveld, de actieve optie verschuift via \`aria-activedescendant\` (pijltjes/Home/End), Enter activeert de actieve optie, Escape wist de zoekterm. Filteren is consumer-werk: luister naar het \`input\`-event (\`{ detail: { value } }\`) en zet \`[hidden]\` op items die niet matchen.

Selectie-state wordt **altijd door de consumer beheerd**: de lijst muteert nooit zelf \`selected\`.
				`.trim(),
			},
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-list
			variant=${args.variant}
			type=${args.type}
			dividers=${args.dividers}
			height=${args.type === 'listbox' && args.height ? args.height : nothing}
			accessible-label=${args.accessibleLabel || nothing}
			?reorderable=${args.type === 'list' && args.reorderable}
		>
			<nldd-list-item>
				<nldd-text-cell text="Item 1"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell text="Item 2"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell text="Item 3"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const Pijltjesnavigatie = {
	args: {
		variant: 'simple',
		type: 'list',
	},
	render: (args: Record<string, any>) => html`
		<nldd-list
			variant=${args.variant}
			type=${args.type}
		>
			<nldd-list-item button><nldd-text-cell text="Profiel"></nldd-text-cell></nldd-list-item>
			<nldd-list-item button selected><nldd-text-cell text="Meldingen"></nldd-text-cell></nldd-list-item>
			<nldd-list-item button><nldd-text-cell text="Beveiliging"></nldd-text-cell></nldd-list-item>
			<nldd-list-item button><nldd-text-cell text="Facturen"></nldd-text-cell></nldd-list-item>
			<nldd-list-item button><nldd-text-cell text="Voorkeuren"></nldd-text-cell></nldd-list-item>
		</nldd-list>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Elke lijst is één Tab-stop, zonder dat je er iets voor zet. Tab focust het eerste (of `selected`) item; ArrowUp/ArrowDown lopen door de items (wrappend), Home/End springen naar eerste/laatste, en Tab verlaat de lijst weer. Pijltjes verplaatsen alleen focus, niet de selectie. Een `reorderable` lijst bedoelt iets anders met dezelfde toetsen: daar verplaatsen de pijltjes rijen.',
			},
		},
	},
};

export const PijltjesnavigatieMetControls = {
	name: 'Pijltjesnavigatie met controls',
	args: {
		variant: 'simple',
		type: 'list',
	},
	render: (args: Record<string, any>) => html`
		<nldd-list
			variant=${args.variant}
			type=${args.type}
		>
			${['NL-00001', 'NL-00002', 'NL-00003'].map((label) => html`
				<nldd-list-item>
					<nldd-text-cell width="full" text=${label}></nldd-text-cell>
					<nldd-cell width="fit-content">
						<nldd-icon-button
							icon="ellipsis"
							size="sm"
							popup-type="menu"
							accessible-label="Acties voor ${label}"
						>
							<nldd-menu slot="popup">
								<nldd-menu-item text="Bewerken" icon="edit"></nldd-menu-item>
								<nldd-menu-item text="Verwijderen" icon="trash"></nldd-menu-item>
							</nldd-menu>
						</nldd-icon-button>
					</nldd-cell>
				</nldd-list-item>
			`)}
		</nldd-list>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Een rij hoeft niet uit één actie te bestaan. De rij is de Tab-stop, en binnen de huidige rij loopt Tab langs de controls erin; in de andere rijen zijn diezelfde controls uit de tabvolgorde gehaald. Dat werkt voor alles wat native focusbaar is en voor design-system-controls met `no-tab`. Een custom element dat z\'n tabstop in de eigen shadow root houdt en geen `no-tab` biedt, kan de rij niet dichtzetten; dat waarschuwt in dev.',
			},
		},
	},
};

export const Varianten = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 32px;">
			<nldd-list variant="simple">
				<nldd-list-item><nldd-text-cell text="Simple — item 1"></nldd-text-cell></nldd-list-item>
				<nldd-list-item><nldd-text-cell text="Simple — item 2"></nldd-text-cell></nldd-list-item>
				<nldd-list-item><nldd-text-cell text="Simple — item 3"></nldd-text-cell></nldd-list-item>
			</nldd-list>

			<nldd-list variant="box-tinted">
				<nldd-list-item><nldd-text-cell text="Box (default: tinted bg + border) — item 1"></nldd-text-cell></nldd-list-item>
				<nldd-list-item><nldd-text-cell text="Box — item 2"></nldd-text-cell></nldd-list-item>
				<nldd-list-item><nldd-text-cell text="Box — item 3"></nldd-text-cell></nldd-list-item>
			</nldd-list>

			<div style="background: var(--semantics-surfaces-tinted-background-color); padding: 24px;">
				<nldd-list variant="box-base">
					<nldd-list-item><nldd-text-cell text='variant="box-base" — item 1'></nldd-text-cell></nldd-list-item>
					<nldd-list-item><nldd-text-cell text="op een al getinte pagina — item 2"></nldd-text-cell></nldd-list-item>
					<nldd-list-item><nldd-text-cell text="item 3"></nldd-text-cell></nldd-list-item>
				</nldd-list>
			</div>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Drie varianten: `simple` (platte strip, geen chrome), `box-tinted` (framed card met afgeronde hoeken en border ring) en `box-base`, voor een lijst op een al getinte parent. Eén attribuut, omdat de drie elkaar uitsluiten.',
			},
		},
	},
};

export const MetMeerdereKolommen = {
	render: () => html`
		<nldd-list variant="box-tinted">
			<nldd-list-item button>
				<nldd-icon-cell size="24" vertical-alignment="top">
					<nldd-icon icon="calendar-event"></nldd-icon>
				</nldd-icon-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-text-cell text="Primaire titel" supporting-text="Ondersteunende tekst eronder"></nldd-text-cell>
				<nldd-spacer-cell></nldd-spacer-cell>
				<nldd-text-cell
					color="secondary"
					horizontal-alignment="right"
					width="fit-content"
					text="Detail"
				></nldd-text-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-icon-cell color="secondary" size="16">
					<nldd-icon icon="chevron-right"></nldd-icon>
				</nldd-icon-cell>
			</nldd-list-item>
			<nldd-list-item button>
				<nldd-icon-cell size="24" vertical-alignment="top">
					<nldd-icon icon="certificate"></nldd-icon>
				</nldd-icon-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-text-cell text="Andere titel" supporting-text="Meer beschrijving hier"></nldd-text-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-text-cell
					color="secondary"
					horizontal-alignment="right"
					width="fit-content"
					text="Meer detail"
				></nldd-text-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-icon-cell color="secondary" size="16">
					<nldd-icon icon="chevron-right"></nldd-icon>
				</nldd-icon-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const MetInteractieveRijen = {
	render: () => html`
		<nldd-list variant="box-tinted">
			<nldd-list-item button>
				<nldd-text-cell text="Knop-item"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item href="/settings">
				<nldd-text-cell text="Link-item"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell text="Niet-interactief item"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

// — Type: navigation ——————————————————————————————————————————————————————————

export const Navigatie = {
	render: () => {
		const onClick = (e: Record<string, any>) => {
			const item = e.target.closest('nldd-list-item');
			if (!item) return;
			e.preventDefault();
			const list = item.closest('nldd-list');
			list.querySelectorAll('nldd-list-item').forEach((i: any) => i.removeAttribute('selected'));
			item.setAttribute('selected', '');
		};
		return html`
			<nldd-list type="navigation" variant="box-tinted" aria-label="Hoofdmenu" @click=${onClick}>
				<nldd-list-item href="#dashboard"><nldd-text-cell text="Dashboard"></nldd-text-cell></nldd-list-item>
				<nldd-list-item href="#aanvragen" selected><nldd-text-cell text="Aanvragen"></nldd-text-cell></nldd-list-item>
				<nldd-list-item href="#meldingen"><nldd-text-cell text="Meldingen"></nldd-text-cell></nldd-list-item>
				<nldd-list-item href="#instellingen"><nldd-text-cell text="Instellingen"></nldd-text-cell></nldd-list-item>
			</nldd-list>
		`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Navigation-landmark. Items zijn links (of knoppen), elk afzonderlijk tab-focusbaar. Het actieve item krijgt `aria-current="page"` via `selected`. De host krijgt `role="navigation"` en een standaard `aria-label="Navigatie"` (te overschrijven via `aria-label`).',
			},
		},
	},
};


// — Type: listbox ——————————————————————————————————————————————————————————————

// Shared imperative builder for the listbox stories: the consumer's filter
// handler toggles [hidden] on items in response to the list's `input` event
// (a stateless Lit template cannot). Parameterised by variant so the box and
// simple stories share one implementation (search field, toolbar filter, scroll).
const buildListbox = (variant: 'box' | 'simple') => {
	// Consumer's own data: a searchable label plus a category the toolbar filters on.
	const data = [
		{ label: 'Aardappelen', category: 'groente' },
		{ label: 'Broccoli', category: 'groente' },
		{ label: 'Courgette', category: 'groente' },
		{ label: 'Doperwten', category: 'groente' },
		{ label: 'Erwten', category: 'groente' },
		{ label: 'Frambozen', category: 'fruit' },
		{ label: 'Granaatappel', category: 'fruit' },
		{ label: 'Honingmeloen', category: 'fruit' },
		{ label: 'IJsbergsla', category: 'groente' },
		{ label: 'Knoflook', category: 'groente' },
		{ label: 'Limoen', category: 'fruit' },
		{ label: 'Mango', category: 'fruit' },
		{ label: 'Nectarine', category: 'fruit' },
		{ label: 'Olijven', category: 'fruit' },
		{ label: 'Paprika', category: 'groente' },
	];

	const el = document.createElement('div');

	// Consumer-managed filtering: combine the search query with the toolbar's
	// category radio. An item stays visible when it matches the text AND the
	// selected category ("all" = no category filter). The list resets the
	// active option to the first visible one after the set changes.
	let query = '';
	let category = 'all';
	const apply = () => {
		el.querySelectorAll('nldd-list-item').forEach((item: Element, i: number) => {
			const matchesText = query === '' || data[i].label.toLowerCase().includes(query);
			const matchesCategory = category === 'all' || data[i].category === category;
			item.toggleAttribute('hidden', !(matchesText && matchesCategory));
		});
	};

	const onInput = (e: Record<string, any>) => {
		query = String(e.detail.value).toLowerCase();
		apply();
	};

	// Toolbar radio: nldd-toggle-button-group (type="radio") bubbles `change`
	// ({ selected, value }) for the newly selected button; switch the category.
	const onCategoryChange = (e: Record<string, any>) => {
		if (e.detail.selected) category = e.detail.value;
		apply();
	};

	// Consumer-managed selection: a click sets `selected` on the activated
	// option (Enter triggers the item's inner button, which clicks through here).
	const onClick = (e: Record<string, any>) => {
		const item = e.target.closest('nldd-list-item');
		if (!item) return;
		const list = item.closest('nldd-list');
		list.querySelectorAll('nldd-list-item').forEach((i: any) => i.removeAttribute('selected'));
		item.setAttribute('selected', '');
	};

	render(html`
		<nldd-list
			type="listbox"
			variant=${variant}
			height="280px"
			@input=${onInput}
			@click=${onClick}
		>
			<nldd-toggle-button-group
				slot="toolbar"
				type="radio"
				name="categorie"
				size="sm"
				accessible-label="Filter op categorie"
				@change=${onCategoryChange}
			>
				<nldd-toggle-button value="all" text="Alles" selected></nldd-toggle-button>
				<nldd-toggle-button value="groente" text="Groente"></nldd-toggle-button>
				<nldd-toggle-button value="fruit" text="Fruit"></nldd-toggle-button>
			</nldd-toggle-button-group>
			${data.map(({ label }) => html`
				<nldd-list-item button>
					<nldd-text-cell text="${label}"></nldd-text-cell>
				</nldd-list-item>
			`)}
			<nldd-inline-dialog
				slot="no-results"
				icon="magnifier"
				text="Niets gevonden"
				supporting-text="Probeer een andere zoekterm of een andere categorie."
			></nldd-inline-dialog>
		</nldd-list>
	`, el);
	return el;
};

export const Listbox = {
	render: () => buildListbox('box'),
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met `type="listbox"` rendert de lijst zijn eigen zoekveld (combobox-patroon) en wordt `.list__items` een `role="listbox"` met `role="option"`-items. Focus blijft in het zoekveld; ArrowUp/ArrowDown lopen door de zichtbare opties (wrappend), Home/End springen naar eerste/laatste, Enter activeert de actieve optie en Escape wist de zoekterm. De actieve optie verschuift via `aria-activedescendant` en blijft in beeld dankzij `scrollIntoView`. Filteren wordt door de consumer beheerd: deze story luistert naar `input` en zet `[hidden]` op niet-matchende items. `height` maakt van de opties een scrollgebied onder het gepinde zoekveld.',
			},
		},
	},
};

export const ListboxEenvoudig = {
	render: () => buildListbox('simple'),
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Dezelfde filterbare listbox als `Listbox` (inclusief de toolbar-filter en scroll), maar met `variant="simple"`: een platte strip zonder box-kader. Handig om de highlight-indicator, de afgeronde hoeken en de uitlijning van de opties t.o.v. het zoekveld in de simple-variant te vergelijken met de box-variant.',
			},
		},
	},
};


// — Reorderable ———————————————————————————————————————————————————————————————

export const Herschikbaar = {
	// Imperative render is intentional: the nldd-reorder handler needs to mutate
	// the DOM in-place to demonstrate actual reordering. A standard Storybook
	// render function cannot do this because Lit templates are stateless.
	render: () => {
		const onReorder = (e: Record<string, any>) => {
			const list = e.currentTarget;
			const { fromIndex, toIndex } = e.detail;
			const items = [...list.querySelectorAll('nldd-list-item')];
			const moved = items[fromIndex];
			if (toIndex === 0) {
				items[0].before(moved);
			} else {
				const ref = items.filter((_, i) => i !== fromIndex)[toIndex - 1];
				ref.after(moved);
			}
		};

		const labels = ['Aardappelen', 'Broccoli', 'Courgette', 'Doperwten', 'Erwten'];

		const el = document.createElement('div');
		render(html`
			<nldd-list variant="box-tinted" reorderable @nldd-reorder=${onReorder}>
				${labels.map((label) => html`
					<nldd-list-item>
						<nldd-drag-handle-cell size="sm" reorderable-only></nldd-drag-handle-cell>
						<nldd-spacer-cell reorderable-only size="8"></nldd-spacer-cell>
						<nldd-text-cell text="${label}"></nldd-text-cell>
					</nldd-list-item>
				`)}
			</nldd-list>
		`, el);
		return el;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Zet `reorderable` op een lijst van type default om drag-and-keyboard reorder te activeren. De lijst dispatcht `nldd-reorder` met `{ fromIndex, toIndex }` — de consumer is verantwoordelijk voor het muteren van de DOM (of het datamodel).',
			},
		},
	},
};




// — Empty slot ————————————————————————————————————————————————————————————————

export const Leeg = {
	render: () => html`
		<nldd-list variant="box-tinted">
			<nldd-inline-dialog
				slot="empty"
				icon="search"
				text="Geen resultaten"
				supporting-text="Pas de filters aan of probeer een andere zoekterm."
			>
				<nldd-button slot="actions" variant="neutral-tinted" text="Filters wissen"></nldd-button>
			</nldd-inline-dialog>
		</nldd-list>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een lege lijst tekent alleen z\'n eigen vlak. Wat daar hoort te staan weet alleen de app: "nog geen assets" en "niets gevonden" zijn twee verschillende zinnen met twee verschillende vervolgstappen. Zet er daarom zelf een `nldd-inline-dialog` in de `empty`-slot, met je eigen icoon, kop, ondersteunende tekst en knoppen.',
			},
		},
	},
};

export const LeegZonderSlot = {
	name: 'Leeg: slot niet gevuld',
	render: () => html`
		<nldd-list variant="box-tinted"></nldd-list>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Vergeet je die slot, dan blijft het vlak leeg, zoals hier. Dat is geen bedoelde staat: er staat niets op het scherm en niets in de accessibility tree. In development waarschuwt de lijst je er een keer over.',
			},
		},
	},
};

export const Radiogroep = {
	render: () => {
		// Consumer-managed selection, and this story is the example of it: a radio
		// row goes on and never off, not even when another is picked, because which
		// one is on is the app's state. Without this listener a second click leaves
		// two rows checked. The dot is a decorative glyph the row does not drive
		// either, so it is set here too.
		const onChange = (e: Record<string, any>) => {
			const picked = e.target.closest('nldd-list-item');
			if (!picked) return;
			picked.closest('nldd-list').querySelectorAll('nldd-list-item[radio]').forEach((row: any) => {
				const on = row === picked;
				row.checked = on;
				row.querySelector('nldd-radio-button').checked = on;
			});
		};

		return html`
		<nldd-list type="radiogroup" variant="box-tinted" accessible-label="Niveau" @change=${onChange}>
			<nldd-list-item radio checked>
				<nldd-cell width="fit-content">
					<nldd-radio-button decorative checked></nldd-radio-button>
				</nldd-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
				<nldd-text-cell width="full" text="Alle niveaus"></nldd-text-cell>
				<nldd-text-cell width="fit-content" color="secondary" text="30"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item radio>
				<nldd-cell width="fit-content">
					<nldd-radio-button decorative></nldd-radio-button>
				</nldd-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
				<nldd-text-cell width="full" text="Fouten"></nldd-text-cell>
				<nldd-text-cell width="fit-content" color="secondary" text="5"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item radio>
				<nldd-cell width="fit-content">
					<nldd-radio-button decorative></nldd-radio-button>
				</nldd-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
				<nldd-text-cell width="full" text="Waarschuwingen"></nldd-text-cell>
				<nldd-text-cell width="fit-content" color="secondary" text="6"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story:
					'Een keuze uit een handvol opties, als rijen. De rij is de radio: `radio` op het item maakt er een `role="radio"` van die bij activeren aangaat en niet meer uit, en de `nldd-radio-button` erin is `decorative`, want die tekent alleen de vorm. Rijen in plaats van een `nldd-radio-button-group` als een optie meer wil dragen dan een label, hier een aantal dat rechts uitlijnt en in secondary staat.\n\nWelke rij aan staat is de staat van je app, niet van de lijst: een rij zet zichzelf aan en nooit meer uit, en haalt `checked` ook niet bij zijn buren weg. Die bedrading staat in deze story en is niet meer dan dit: luister op de lijst naar `change`, zet `checked` op de gekozen rij en haal het bij de rest weg. De decoratieve `nldd-radio-button` erin gaat mee, want de rij tekent die stip niet zelf.',
			},
		},
	},
};

export const Formulier = {
	render: () => html`
		<nldd-list type="form" variant="box-tinted" accessible-label="Eigenschappen">
			<nldd-list-item>
				<nldd-text-cell width="full" text="Vervaldatum"></nldd-text-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
				<nldd-cell width="fit-content">
					<nldd-date-field size="sm" value="2026-08-23"></nldd-date-field>
				</nldd-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell width="full" text="Toegewezen aan"></nldd-text-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
				<nldd-cell width="180px">
					<nldd-combo-box size="sm" text="Yara Nijhuis" value="yara">
						<nldd-menu>
							<nldd-menu-item value="yara" text="Yara Nijhuis"></nldd-menu-item>
							<nldd-menu-item value="ruben" text="Ruben de Groot"></nldd-menu-item>
						</nldd-menu>
					</nldd-combo-box>
				</nldd-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell width="full" text="Prioriteit"></nldd-text-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
				<nldd-cell width="fit-content">
					<nldd-button variant="secondary" size="sm" expandable popup-type="menu" text="Hoog">
						<nldd-menu slot="popup" placement="bottom-end">
							<nldd-menu-item type="radio" text="Hoog" selected></nldd-menu-item>
							<nldd-menu-item type="radio" text="Laag"></nldd-menu-item>
						</nldd-menu>
					</nldd-button>
				</nldd-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell width="full" text="Aangemaakt"></nldd-text-cell>
				<nldd-text-cell text="24 juli 2026"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Rijen die zelf geen actie zijn: de controls erin wel. Tab gaat rechtstreeks naar de velden in bronvolgorde, zoals in elk formulier, en er is geen pijltjesnavigatie en dus ook geen tab-stop op de rij. Semantisch gelijk aan `type="list"`; alleen het toetsenbord van een lijst die je doorloopt valt weg. Rijen met `href`, `button`, `checkbox` of segmenten horen hier niet en waarschuwen in development.',
			},
		},
	},
};
