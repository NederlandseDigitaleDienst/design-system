import { html } from 'lit';
import { ICONS } from '../../../content/icon/icon.js';
import './timeline-track-cell.js';
import '../../../layout/box/box.js';
import '../../../layout/container/container.js';
import '../../../content/title/title.js';
import '../../../content/text/text.js';
import '../cell/cell.js';
import '../../list/list.js';
import '../../list-item/list-item.js';
import '../spacer-cell/spacer-cell.js';
import '../text-cell/text-cell.js';
import '../title-cell/title-cell.js';

/**
 * De cel tekent het spoor van een tijdlijn of stappenlijst: een lijn met een
 * punt per rij. Hij hoort altijd in een `nldd-list-item` thuis — de rij levert
 * de blokpadding waarop de lijn zich uitlijnt (`--context-cell-padding-block`),
 * dus buiten een lijst sluiten opeenvolgende stappen niet op elkaar aan.
 */
export default {
	title: 'Components/Lists & Tables/Cells/Timeline Track Cell',
	component: 'nldd-timeline-track-cell',
	tags: ['autodocs'],

	args: {
		variant: 'major',
		status: 'current',
		size: 'md',
		direction: 'down',
		position: 'between',
		text: '2',
		icon: '',
		line: 'auto',
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['major', 'minor', 'none'],
			description: 'Wat er in de baan staat: een hele stip (major), een kleinere voor een rij die onder de vorige hoort (minor), of niets (none) voor een rij die draagt wat een stap bij zich heeft',
			table: { defaultValue: { summary: 'major' } },
		},
		status: {
			control: 'select',
			options: ['past', 'current', 'future'],
			description: 'Hoe ver deze rij is; kleurt de stip en het spoor eromheen',
			table: { defaultValue: { summary: 'past' } },
		},
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Hoe breed de baan is en dus hoe groot de stip: sm (16px) voor een tijdlijn van gebeurtenissen, md (24px) waar een cijfer of icoon in moet passen',
			table: { defaultValue: { summary: 'sm' } },
		},
		direction: {
			control: 'select',
			options: ['down', 'up'],
			description: 'Richting waarin de tijdlijn vooruit loopt; alleen de huidige stap heeft een half spoor, dus alleen daar doet het iets',
			table: { defaultValue: { summary: 'down' } },
		},
		position: {
			control: 'select',
			options: ['first', 'between', 'last', 'only'],
			description: 'Plek in de reeks; bepaalt waar de lijn doorloopt',
			table: { defaultValue: { summary: 'between' } },
		},
		line: {
			control: 'select',
			options: ['auto', 'top', 'bottom', 'both', 'none'],
			description: 'Het spoor rond de stip, als status, direction en position het samen mis hebben. De genoemde helften worden getekend als afgelegd, de rest wordt niet getekend. Een half spoor, boven afgelegd en onder open, is waar auto voor is',
			table: { defaultValue: { summary: 'auto' } },
		},
		text: {
			control: 'text',
			description: 'Cijfer of korte tekst in de stip',
		},
		icon: {
			control: 'select',
			options: ['', ...ICONS],
			description: 'Icoon in de stip; wint van text',
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-list dividers="never" accessible-label="Tijdlijn" style="max-width: 420px;">
			<nldd-list-item>
			<nldd-timeline-track-cell
				status=${args.status}
				size=${args.size}
				variant=${args.variant}
				direction=${args.direction}
				position=${args.position}
				line=${args.line}
				text=${args.text}
				icon=${args.icon}
			></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Aanvraag ingediend" supporting-text="3 maart 2026"></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

/**
 * Een tijdlijn van gebeurtenissen. Het spoor draagt de voortgang: accent tot en
 * met de stap waar je bent, daarna de rustige spoorkleur. Die overgang markeert
 * waar je staat, dus de stip zelf heeft geen extra ring nodig.
 */
export const Tijdlijn = {
	render: () => html`
		<nldd-list dividers="never" accessible-label="Verloop aanvraag" style="max-width: 420px;">
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" position="first"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Aanvraag ingediend" supporting-text="3 maart"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="past"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="In behandeling genomen" supporting-text="5 maart"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="current"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Beoordeling" supporting-text="Nu bezig"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="future" position="last"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Besluit" supporting-text="Verwacht 20 maart"></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Eén gebeurtenis is geen reeks. `position="only"` laat de lijn aan beide
 * kanten weg, want een spoor van één stip loopt nergens heen: met `first` of
 * `last` steekt er een stuk lijn uit dat niets verbindt.
 */
export const EnkeleRij = {
	render: () => html`
		<nldd-list dividers="never" accessible-label="Tijdlijn">
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" position="only"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Aanvraag ontvangen" supporting-text="1 maart"></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * `size="md"` maakt de baan 24px breed en de stip net zo groot, ruim genoeg voor
 * een cijfer of icoon. Eén maat per lijst: een baan die halverwege van breedte
 * verandert, knikt het spoor.
 *
 * Dit is de verticale tegenhanger van `nldd-step-indicator`. De semantiek hoort
 * bij de consument: `aria-current="step"` op de rij van de huidige stap, en de
 * status als tekst in de rij — kleur en vinkje alleen dragen hem niet.
 */
export const Stappenlijst = {
	render: () => html`
		<nldd-list dividers="never" accessible-label="Voortgang aanvraag" style="max-width: 420px;">
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" size="md" position="first" icon="check-mark"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Gegevens" supporting-text="Afgerond"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item aria-current="step">
			<nldd-timeline-track-cell status="current" size="md" text="2"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Controle" supporting-text="Huidige stap"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="future" size="md" position="last" text="3"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Bevestigen" supporting-text="Nog te doen"></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * `variant="minor"` zet een rij onder de vorige: dezelfde baan, een kleinere stip
 * (12px bij `size="md"`, 10px bij `sm`). Inspringen zou het spoor breken, en juist
 * dat spoor verbindt de rijen — de hiërarchie komt van de stipmaat en van gewone
 * tekst in plaats van een titel.
 */
/**
 * Een rij die zelf een groep opent, is niet het eind van de voortgang: de stap
 * waar je bent zit erin, verderop. De cel leest één rij tegelijk en kan dat niet
 * zien, dus zegt de consument het: `line="both"` maakt beide helften afgelegd,
 * terwijl de stip `current` blijft. De taakrij is bezig, en de lijn loopt door
 * naar de substap waar je echt staat.
 *
 * `line` gaat over de vulling, niet over de plek: welke helften er staan blijft
 * `position`. Noem je er één, dan is de andere helft de rustige spoorkleur; bij
 * `none` zijn ze dat allebei.
 */
export const GenesteVoortgang = {
	name: 'Geneste voortgang (line)',
	render: () => html`
		<nldd-list dividers="never" accessible-label="Werkorder" style="max-width: 420px;">
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" size="md" position="first" icon="check-mark"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Materiaal verzamelen" supporting-text="Afgerond"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="current" size="md" line="both" text="2"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Switch vervangen" supporting-text="Bezig"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" size="md" variant="minor"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-text-cell text="Apparaat spanningsloos maken"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item aria-current="step">
			<nldd-timeline-track-cell status="current" size="md" variant="minor"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-text-cell text="Oude onderdeel verwijderen"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="future" size="md" variant="minor"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-text-cell text="Nieuw onderdeel plaatsen"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="future" size="md" position="last" text="3"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Testen en afmelden" supporting-text="Nog te doen"></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Een rij die een kaart draagt is hoog, en dan staat de stip halverwege iets
 * aan te wijzen in plaats van naast de naam ervan. Zet de naam daarom in zijn
 * eigen rij met de stip, en de kaart in een rij eronder zonder stip.
 *
 * Die tweede rij houdt dezelfde `size` en `variant` als de rij erboven, anders
 * staat hij in een andere baan en knikt het spoor. Zijn `status` kleurt de hele
 * lijn: `past` als het verder naar beneden doorloopt, `current` als het werk
 * hier stopt.
 */
export const KaartOnderEenStap = {
	name: 'Kaart onder een stap',
	render: () => html`
		<nldd-list dividers="never" accessible-label="Werkorder" style="max-width: 420px;">
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" size="md" position="first" icon="check-mark"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Materiaal verzamelen"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" size="md" variant="none"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-cell width="full">
				<nldd-box background="base">
					<nldd-container padding="16">
						<nldd-text>Alles uit het magazijn meenemen voordat je de vloer op gaat.</nldd-text>
					</nldd-container>
				</nldd-box>
			</nldd-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="current" size="md" position="last" text="2"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Switch vervangen" supporting-text="Bezig"></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};

export const Substappen = {
	render: () => html`
		<nldd-list dividers="never" accessible-label="Voortgang aanvraag" style="max-width: 420px;">
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" size="md" position="first" icon="check-mark"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Gegevens" supporting-text="Afgerond"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" size="md" variant="minor"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-text-cell text="Contactgegevens"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" size="md" variant="minor"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-text-cell text="Bankrekening"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item aria-current="step">
			<nldd-timeline-track-cell status="current" size="md" text="2"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Controle" supporting-text="Huidige stap"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="future" size="md" position="last" text="3"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Bevestigen" supporting-text="Nog te doen"></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * De standaard: een kaal spoor van gebeurtenissen, stippen van 16px. Een
 * `variant="minor"` is hier 10px, voor een gebeurtenis die bij de vorige hoort.
 */
export const Tussenstappen = {
	render: () => html`
		<nldd-list dividers="never" accessible-label="Verloop aanvraag" style="max-width: 420px;">
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" position="first"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-text-cell text="Aanvraag ingediend" supporting-text="3 maart"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" variant="minor"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-text-cell text="Ontvangstbevestiging verstuurd"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="current"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-text-cell text="Beoordeling" supporting-text="Nu bezig"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="future" position="last"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-text-cell text="Besluit" supporting-text="Verwacht 20 maart"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * `variant="none"` laat de stip weg, voor een rij zonder eigen punt op de tijdlijn:
 * een tussenkop, een groep, of wat een stap bij zich draagt.
 *
 * De rij houdt zijn `size`, dus hij blijft in dezelfde baan staan en het spoor
 * loopt recht door. En hij houdt zijn `status`: zonder stip is er geen punt waar
 * de vulling kan omslaan, dus die kleurt de hele lijn. Een tussenkop tussen
 * afgelegde stappen is `past`, een rij onder de stap waar je nu bent `future`.
 */
export const ZonderStip = {
	render: () => html`
		<nldd-list dividers="never" accessible-label="Tijdlijn met tussenkop" style="max-width: 420px;">
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" position="first"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Aanvraag ingediend" supporting-text="3 maart"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell variant="none"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Maart"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" position="last"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="In behandeling genomen" supporting-text="5 maart"></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Met scheidingslijnen: die kruisen het spoor, want de rijen sluiten op elkaar
 * aan. Dat kan kloppen wanneer elke rij op zichzelf staat (een logboek dat je
 * per regel leest), maar voor een doorlopende tijdlijn leest `dividers="never"`
 * rustiger — daar hoort de lijn zelf het verband te leggen.
 */
export const MetDividers = {
	render: () => html`
		<nldd-list accessible-label="Verloop aanvraag" style="max-width: 420px;">
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" position="first"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Aanvraag ingediend" supporting-text="3 maart"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="current"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Beoordeling" supporting-text="Nu bezig"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="future" position="last"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Besluit" supporting-text="Verwacht 20 maart"></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Een tijdlijn met het nieuwste bovenaan. De cel weet alleen wat hij zelf is,
 * niet welke buur eerder kwam, dus die richting geef je mee met `direction="up"`:
 * dan ligt het afgelegde deel van het spoor onder de stip in plaats van erboven.
 *
 * Alleen de huidige stap heeft een half spoor, dus alleen daar doet `direction`
 * iets — een afgeronde stap is helemaal accent en een toekomstige helemaal
 * rustig, ongeacht de richting. Meegeven op elke rij mag, maar hoeft niet.
 */
export const NieuwsteBovenaan = {
	render: () => html`
		<nldd-list dividers="never" accessible-label="Verloop aanvraag" style="max-width: 420px;">
			<nldd-list-item>
			<nldd-timeline-track-cell status="future" position="first"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Besluit" supporting-text="Verwacht 20 maart"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="current" direction="up"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Beoordeling" supporting-text="Nu bezig"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="past"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="In behandeling genomen" supporting-text="5 maart"></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
			<nldd-timeline-track-cell status="past" position="last"></nldd-timeline-track-cell>
			<nldd-spacer-cell size="12"></nldd-spacer-cell>
			<nldd-title-cell text="Aanvraag ingediend" supporting-text="3 maart"></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: { controls: { disable: true } },
};
