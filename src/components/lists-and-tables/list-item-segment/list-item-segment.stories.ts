import { html, nothing } from 'lit';
import './list-item-segment.js';
import '../list-item/list-item.js';
import '../list/list.js';
import '../cells/cell/cell.js';
import '../cells/text-cell/text-cell.js';
import '../cells/spacer-cell/spacer-cell.js';
import '../cells/icon-cell/icon-cell.js';
import '../../content/icon/icon.js';
import '../../inputs/checkbox/checkbox.js';
import '../../actions/icon-button/icon-button.js';
import '../../actions/menu/menu.js';

/** Stories are flat markup, so the demo state lives here: a disclosure segment
 *  flips the row's `expanded`, a checkbox segment mirrors its own state onto the
 *  decorative nldd-checkbox inside it. One listener per row, and the
 *  currentTarget check keeps a nested row from toggling its ancestors too. */
const demoToggle = (e: Event) => {
	const segment = (e.target as HTMLElement).closest('nldd-list-item-segment');
	const row = segment?.closest('nldd-list-item');
	if (!row || row !== e.currentTarget) return;
	const chevron = segment!.querySelector('nldd-icon[icon^="chevron"]');
	if (chevron) {
		const open = !row.hasAttribute('expanded');
		row.toggleAttribute('expanded', open);
		// With `disclosure` the component rotates the chevron from the row's state;
		// without it these stories swap the icon themselves.
		if (!segment!.hasAttribute('disclosure')) {
			chevron.setAttribute('icon', open ? 'chevron-down' : 'chevron-right');
			segment!.toggleAttribute('expanded', open);
		}
		return;
	}
	if (segment!.hasAttribute('checkbox')) {
		const box = segment!.querySelector('nldd-checkbox') as (HTMLElement & { checked: boolean }) | null;
		if (box) {
			queueMicrotask(() => {
				box.checked = segment!.hasAttribute('checked');
			});
		}
	}
};

export default {
	title: 'Components/Lists & Tables/List Item Segment',
	component: 'nldd-list-item-segment',
	tags: ['autodocs'],
	args: {
		width: 'fit-content',
		href: '',
		button: true,
		checkbox: false,
		disclosure: false,
		accessibleLabel: '',
		checked: false,
		expanded: false,
		current: false,
		disabled: false,
	},
	argTypes: {
		width: {
			control: 'select',
			options: ['fit-content', 'full'],
			description: '`full` laat het segment meegroeien met de rij.',
			table: { defaultValue: { summary: 'fit-content' } },
		},
		href: { control: 'text', description: 'Rendert het segment als link. Wint van `checkbox` en `button`.' },
		button: { control: 'boolean', description: 'Rendert het segment als button. De laatste van de drie: `href` en `checkbox` winnen er allebei van.' },
		checkbox: { control: 'boolean', description: 'Maakt het segment een role="checkbox" control. Wint van `button`, verliest van `href`.' },
		disclosure: {
			control: 'boolean',
			description: 'Maakt het segment de uitklapknop van de rij: `aria-expanded` komt van `expanded` op de rij, zodat de toestand op één plek staat. Een icooncel erin draait mee.',
			table: { defaultValue: { summary: false } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van de actie. Nodig als het segment alleen een icoon bevat, of als de tekst de actie niet beschrijft.',
		},
		checked: { control: 'boolean', description: 'Aangevinkt-status van een checkbox-segment' },
		expanded: { control: 'boolean', description: 'Uitklap-status; laat weg als het segment niets openklapt' },
		current: {
			control: 'boolean',
			description: 'De huidige pagina (`aria-current="page"`). Zet het hier en niet op de rij: een gesegmenteerde rij heeft geen eigen link, en de rij leest het van z\'n segmenten en kleurt zichzelf.',
			table: { defaultValue: { summary: false } },
		},
		disabled: { control: 'boolean', description: 'Uitgeschakelde staat' },
	},
};

export const Standaard = {
	render: (args: Record<string, unknown>) => html`
		<nldd-list accessible-label="Voorbeeld">
			<nldd-list-item>
				<nldd-list-item-segment
					width=${args.width as string}
					href=${(args.href as string) || nothing}
					?button=${args.button}
					?checkbox=${args.checkbox}
					?disclosure=${args.disclosure}
					accessible-label=${(args.accessibleLabel as string) || nothing}
					?checked=${args.checked}
					?expanded=${args.expanded}
					?current=${args.current}
					?disabled=${args.disabled}
				>
					<nldd-text-cell text="Segment" supporting-text="Het segment draagt zijn eigen inline padding, dus de vulling houdt vanzelf ruimte om de tekst"></nldd-text-cell>
				</nldd-list-item-segment>
			</nldd-list-item>
		</nldd-list>
	`,
};

/**
 * Twee onafhankelijke acties in één rij: de chevron klapt uit, de rest zet de
 * checkbox aan. Een echte `<input>` of een tweede knop binnen één actie zou
 * ongeldige HTML zijn — daarom splitsen we de rij in segmenten.
 *
 * De divider loopt standaard over de volle contentbreedte; markeer een cel met
 * `divider-start` of `divider-end` als hij later moet beginnen of eerder moet
 * stoppen.
 *
 * De inspringing per niveau is bewust NIET automatisch: nesting is semantiek,
 * inspringen is presentatie. Herhaal een spacer-cell per niveau, dan schaalt het
 * naar willekeurige diepte.
 */
export const Boomrij = {
	name: 'Boomrij (chevron + checkbox)',
	render: () => {
		// The chevron zone is one control width (44) on every row; a leaf row's
		// stand-in spacer matches it, at any depth.
		const LEAF_CHEVRON_ZONE = '44';
		const INDENT_STEP = '16';
		const cells = (label: string, count: string) => html`
			<nldd-list-item-segment checkbox width="full" accessible-label=${label}>
				<nldd-cell>
					<nldd-checkbox aria-hidden="true" tabindex="-1"></nldd-checkbox>
				</nldd-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-text-cell text=${label}></nldd-text-cell>
				<nldd-spacer-cell size="8"></nldd-spacer-cell>
				<nldd-text-cell width="fit-content" horizontal-alignment="right" color="secondary" text=${count}></nldd-text-cell>
			</nldd-list-item-segment>
		`;
		const branch = (label: string, count: string, level: number, expanded: boolean, children: unknown) => html`
			<nldd-list-item slot=${level ? 'children' : ''} ?expanded=${expanded} @click=${demoToggle}>
				${Array.from({ length: level }, () => html`<nldd-spacer-cell size=${INDENT_STEP}></nldd-spacer-cell>`)}
				<nldd-list-item-segment button disclosure accessible-label="${label} in- of uitklappen">
					<nldd-icon-cell size="20"><nldd-icon icon="chevron-right"></nldd-icon></nldd-icon-cell>
				</nldd-list-item-segment>
				${cells(label, count)}
				${children}
			</nldd-list-item>
		`;
		const leaf = (label: string, count: string, level: number) => html`
			<nldd-list-item slot="children" @click=${demoToggle}>
				${Array.from({ length: level }, () => html`<nldd-spacer-cell size=${INDENT_STEP}></nldd-spacer-cell>`)}
				<nldd-spacer-cell size=${LEAF_CHEVRON_ZONE}></nldd-spacer-cell>
				${cells(label, count)}
			</nldd-list-item>
		`;
		return html`
			<nldd-list type="tree" accessible-label="Opdrachtgevers">
				${branch('Agentschappen', '15', 0, false, leaf('Rijkswaterstaat', '15', 1))}
				${branch('Ministeries', '14', 0, true, html`
					${leaf('Ministerie van Algemene Zaken', '1', 1)}
					${branch('Ministerie van Financiën', '13', 1, true, leaf('Directoraat-generaal Belastingdienst', '13', 2))}
				`)}
			</nldd-list>
		`;
	},
};

/**
 * De rij navigeert, de knop erachter doet iets anders. Zonder segmenten kan dit
 * niet: een button in een link is ongeldige HTML.
 */
export const LinkMetSegmentAchteraan = {
	name: 'Linkrij met een segment achteraan',
	render: () => html`
		<nldd-list accessible-label="Opdrachten">
			${['Modernisering Inkoop', 'Open Data Architectuur'].map(name => html`
				<nldd-list-item>
					<nldd-list-item-segment href="#${name}" width="full">
						<nldd-text-cell text=${name} supporting-text="Rijkswaterstaat"></nldd-text-cell>
					</nldd-list-item-segment>
					<nldd-list-item-segment button accessible-label="Bewerk ${name}">
						<nldd-icon-cell size="20"><nldd-icon icon="edit"></nldd-icon></nldd-icon-cell>
					</nldd-list-item-segment>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
				</nldd-list-item>
			`)}
		</nldd-list>
	`,
};

/**
 * `expanded` op een segment zegt: wat dit segment opende staat op het scherm. Het
 * segment blijft dan opgelicht, één trede boven hover, zodat het menu leest als
 * iets dat aan deze rij hangt in plaats van erboven te zweven. Het menu zet die
 * staat zelf op z'n anchor, dus in de markup hieronder staat `expanded` nergens.
 *
 * Open een menu en beweeg de muis terug over de "..." : de vulling blijft, en
 * hover en indrukken komen daar bovenop.
 */
export const MetMenu = {
	name: 'Segment met een menu (expanded)',
	render: () => html`
		<nldd-list accessible-label="Kabels">
			${['NL-00001', 'NL-00002'].map(name => html`
				<nldd-list-item>
					<nldd-list-item-segment button width="full">
						<nldd-text-cell text=${name} supporting-text="NIC 1 · Network Interface"></nldd-text-cell>
					</nldd-list-item-segment>
					<nldd-list-item-segment button id="menu-anchor-${name}" accessible-label="Acties voor ${name}">
						<nldd-icon-cell size="20"><nldd-icon icon="ellipsis"></nldd-icon></nldd-icon-cell>
					</nldd-list-item-segment>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
				</nldd-list-item>
			`)}
		</nldd-list>
		${['NL-00001', 'NL-00002'].map(name => html`
			<nldd-menu anchor="menu-anchor-${name}" placement="bottom-end">
				<nldd-menu-item text="Bewerken" icon="edit"></nldd-menu-item>
				<nldd-menu-item text="Verwijderen" icon="trash"></nldd-menu-item>
			</nldd-menu>
		`)}
	`,
};

/**
 * In een `type="listbox"` lijst mag een `option` geen interactieve
 * afstammelingen hebben. Het segment rendert dan als platte container: de cellen
 * blijven staan, alleen de knop verdwijnt. Er verschijnt een DEV-waarschuwing in
 * de console.
 */
export const InEenListbox = {
	name: 'In een listbox (degradeert)',
	render: () => html`
		<nldd-list type="listbox" accessible-label="Opties">
			<nldd-list-item>
				<nldd-list-item-segment checkbox width="full">
					<nldd-text-cell text="Deze rij is een option, dus niet segmenteerbaar"></nldd-text-cell>
				</nldd-list-item-segment>
			</nldd-list-item>
		</nldd-list>
	`,
};

/**
 * Dezelfde segmenten in een `variant="box-tinted"` lijst. Twee soorten ruimte die je uit
 * elkaar moet houden: de boxed variant toont altijd zijn start- en end-area met
 * een spacer van 12, en dat is de afstand van het segment tot het KADER. De
 * spacers binnen het segment zijn de afstand van de inhoud tot de rand van de
 * VULLING. Laat je die laatste weg, dan plakt de telling tegen de hover-vorm.
 */
export const InEenBoxedList = {
	name: 'In een boxed list',
	render: () => html`
		<nldd-list variant="box-tinted" type="tree" accessible-label="Opdrachtgevers">
			<nldd-list-item @click=${demoToggle}>
				<nldd-list-item-segment button disclosure accessible-label="Agentschappen in- of uitklappen">
					<nldd-icon-cell size="20"><nldd-icon icon="chevron-right"></nldd-icon></nldd-icon-cell>
				</nldd-list-item-segment>
				<nldd-list-item-segment checkbox width="full" accessible-label="Agentschappen">
					<nldd-cell><nldd-checkbox aria-hidden="true" tabindex="-1"></nldd-checkbox></nldd-cell>
					<nldd-spacer-cell size="8"></nldd-spacer-cell>
					<nldd-text-cell text="Agentschappen"></nldd-text-cell>
					<nldd-spacer-cell size="8"></nldd-spacer-cell>
					<nldd-text-cell width="fit-content" horizontal-alignment="right" color="secondary" text="15"></nldd-text-cell>
				</nldd-list-item-segment>
				<nldd-list-item slot="children" @click=${demoToggle}>
					<nldd-spacer-cell size="16"></nldd-spacer-cell>
					<nldd-spacer-cell size="44"></nldd-spacer-cell>
					<nldd-list-item-segment checkbox width="full" accessible-label="Rijkswaterstaat">
						<nldd-cell><nldd-checkbox aria-hidden="true" tabindex="-1"></nldd-checkbox></nldd-cell>
						<nldd-spacer-cell size="8"></nldd-spacer-cell>
						<nldd-text-cell text="Rijkswaterstaat"></nldd-text-cell>
						<nldd-spacer-cell size="8"></nldd-spacer-cell>
						<nldd-text-cell width="fit-content" horizontal-alignment="right" color="secondary" text="15"></nldd-text-cell>
					</nldd-list-item-segment>
				</nldd-list-item>
			</nldd-list-item>
			<nldd-list-item expanded @click=${demoToggle}>
				<nldd-list-item-segment button disclosure accessible-label="Ministeries in- of uitklappen">
					<nldd-icon-cell size="20"><nldd-icon icon="chevron-right"></nldd-icon></nldd-icon-cell>
				</nldd-list-item-segment>
				<nldd-list-item-segment checkbox width="full" accessible-label="Ministeries">
					<nldd-cell><nldd-checkbox aria-hidden="true" tabindex="-1"></nldd-checkbox></nldd-cell>
					<nldd-spacer-cell size="8"></nldd-spacer-cell>
					<nldd-text-cell text="Ministeries"></nldd-text-cell>
					<nldd-spacer-cell size="8"></nldd-spacer-cell>
					<nldd-text-cell width="fit-content" horizontal-alignment="right" color="secondary" text="14"></nldd-text-cell>
				</nldd-list-item-segment>
				<nldd-list-item slot="children" @click=${demoToggle}>
					<nldd-spacer-cell size="16"></nldd-spacer-cell>
					<nldd-spacer-cell size="44"></nldd-spacer-cell>
					<nldd-list-item-segment checkbox width="full" accessible-label="Ministerie van Algemene Zaken">
						<nldd-cell><nldd-checkbox aria-hidden="true" tabindex="-1"></nldd-checkbox></nldd-cell>
						<nldd-spacer-cell size="8"></nldd-spacer-cell>
						<nldd-text-cell text="Ministerie van Algemene Zaken"></nldd-text-cell>
						<nldd-spacer-cell size="8"></nldd-spacer-cell>
						<nldd-text-cell width="fit-content" horizontal-alignment="right" color="secondary" text="1"></nldd-text-cell>
					</nldd-list-item-segment>
				</nldd-list-item>
			</nldd-list-item>
		</nldd-list>
	`,
};

/**
 * Een echte boom: `nldd-list type="tree"` met kindrijen in `slot="children"`.
 * De nesting IS de hiërarchie — `aria-level`, `aria-posinset` en `aria-setsize`
 * worden er door hulpsoftware uit afgeleid en staan dus nergens in de markup.
 *
 * `expanded` staat één keer, op de rij: het stuurt zowel de zichtbaarheid van de
 * groep als de `aria-expanded` van de chevron, doordat die met `disclosure` is
 * gemarkeerd. Inspringen blijft handwerk — herhaal een spacer-cell per niveau.
 */
export const GenesteBoom = {
	name: 'Geneste boom (type="tree")',
	render: () => {
		const branch = (label: string, level: number, expanded: boolean, children: unknown) => html`
			<nldd-list-item slot=${level ? 'children' : ''} ?expanded=${expanded} @click=${demoToggle}>
				${Array.from({ length: level }, () => html`<nldd-spacer-cell size="16"></nldd-spacer-cell>`)}
				<nldd-list-item-segment button disclosure accessible-label="${label} in- of uitklappen">
					<nldd-icon-cell size="20"><nldd-icon icon="chevron-right"></nldd-icon></nldd-icon-cell>
				</nldd-list-item-segment>
				<nldd-list-item-segment checkbox width="full" accessible-label=${label}>
					<nldd-cell><nldd-checkbox aria-hidden="true" tabindex="-1"></nldd-checkbox></nldd-cell>
					<nldd-spacer-cell size="8"></nldd-spacer-cell>
					<nldd-text-cell text=${label}></nldd-text-cell>

				</nldd-list-item-segment>
				${children}
			</nldd-list-item>
		`;
		const leaf = (label: string, level: number) => html`
			<nldd-list-item slot="children" @click=${demoToggle}>
				${Array.from({ length: level }, () => html`<nldd-spacer-cell size="16"></nldd-spacer-cell>`)}
				<nldd-spacer-cell size="44"></nldd-spacer-cell>
				<nldd-list-item-segment checkbox width="full" accessible-label=${label}>
					<nldd-cell><nldd-checkbox aria-hidden="true" tabindex="-1"></nldd-checkbox></nldd-cell>
					<nldd-spacer-cell size="8"></nldd-spacer-cell>
					<nldd-text-cell text=${label}></nldd-text-cell>

				</nldd-list-item-segment>
			</nldd-list-item>
		`;
		return html`
			<nldd-list type="tree" accessible-label="Opdrachtgevers">
				${branch('Agentschappen', 0, false, leaf('Rijkswaterstaat', 1))}
				${branch('Ministeries', 0, true, html`
					${leaf('Ministerie van Algemene Zaken', 1)}
					${branch('Ministerie van Financiën', 1, true, leaf('Directoraat-generaal Belastingdienst', 2))}
				`)}
			</nldd-list>
		`;
	},
};
