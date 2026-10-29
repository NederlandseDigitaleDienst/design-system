import { html, nothing } from 'lit';
import './task-board.js';
import type { NLDDTaskBoard, NLDDMoveEventDetail } from './task-board.js';
import '../../layout/card/card.js';
import '../../layout/container/container.js';
import '../../layout/spacer/spacer.js';
import '../../content/text/text.js';
import '../../content/title/title.js';
import '../../content/tag/tag.js';
import '../../actions/button/button.js';
import '../../actions/icon-button/icon-button.js';
import '../../actions/menu/menu.js';

/**
 * Kolommen naast elkaar, met kaartjes die je ertussen verplaatst: een kanbanbord,
 * of elk bord waar de kolom van een kaartje een van zijn waarden is, zoals een
 * status of een team.
 *
 * Een kaartje verplaats je op drie manieren, en alle drie geven hetzelfde
 * `nldd-move`-event:
 *
 * - **Slepen.** Pak het hele kaartje. Een klik zonder beweging blijft een klik.
 *   Op een touchscreen hou je het kaartje even vast voor het loskomt, zodat vegen
 *   blijft scrollen.
 * - **Toetsenbord.** Met de focus op een kaartje verplaatst Alt met pijl omhoog
 *   of omlaag het binnen de kolom, en Alt met pijl links of rechts naar de kolom
 *   ernaast.
 * - **`moveItem()`.** Voor wie niet kan slepen (WCAG 2.5.7): geef elk kaartje
 *   een menu "Verplaatsen naar" en roep `moveItem()` aan. Het menu maak je zelf.
 *
 * Het bord verplaatst zelf niets. Je app verplaatst het kaartje in de handler
 * van `nldd-move`, in zijn data of in de DOM.
 *
 * ```js
 * board.addEventListener('nldd-move', (event) => {
 *   const { fromColumn, fromIndex, toColumn, toIndex } = event.detail;
 *   const [task] = columns[fromColumn].splice(fromIndex, 1);
 *   columns[toColumn].splice(toIndex, 0, task);
 * });
 * ```
 */
export default {
	title: 'Components/Layout/Task Board',
	component: 'nldd-task-board',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/task-board/task-board.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
		controls: { disable: true },
	},
	args: {
		accessibleLabel: 'Aanvragen',
		height: '',
		readonly: false,
	},
	argTypes: {
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van het bord',
			table: { defaultValue: { summary: 'Takenbord' } },
		},
		height: {
			control: 'text',
			description: 'Vaste hoogte als CSS-lengte; elke kolom vult die en scrollt daarbinnen',
		},
		readonly: {
			control: 'boolean',
			description: 'Niets kan worden gesleept of met het toetsenbord verplaatst; de kaartjes blijven werken',
			table: { defaultValue: { summary: false } },
		},
	},
};

/** Moves the item in the DOM, the way an app moves it in its data. */
function onMove(event: CustomEvent<NLDDMoveEventDetail>) {
	const board = event.currentTarget as NLDDTaskBoard;
	const { item, toColumn, toIndex } = event.detail;
	const column = board.columns.find((candidate) => candidate.value === toColumn)!;
	const rest = column.items.filter((el) => el !== item);
	column.insertBefore(item, rest[toIndex] ?? null);
}

const card = (title: string, text: string, tag?: string) => html`
	<nldd-card
		button
		accessible-label=${title}
	>
		<nldd-container
			padding="12"
			gap="4"
		>
			<nldd-text weight="bold">${title}</nldd-text>
			<nldd-text
				size="sm"
				color="secondary"
			>${text}</nldd-text>
			${tag ? html`<nldd-tag text=${tag}></nldd-tag>` : ''}
		</nldd-container>
	</nldd-card>
`;

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-task-board
			accessible-label=${args.accessibleLabel || nothing}
			height=${args.height || nothing}
			?readonly=${args.readonly}
			@nldd-move=${onMove}
		>
			<nldd-task-board-column
				value="nieuw"
				text="Nieuw"
			>
				${card('Aanvraag A-1044', 'Zonnepanelen')}
				${card('Aanvraag A-1045', 'Spouwmuurisolatie')}
			</nldd-task-board-column>
			<nldd-task-board-column
				value="in-behandeling"
				text="In behandeling"
			>
				${card('Aanvraag A-1042', 'Dakisolatie', 'Team Uitvoering')}
				${card('Dossier D-318', 'Bezwaar', 'Team Uitvoering')}
				${card('Dossier D-319', 'Beleidsadvies', 'Team Beleid')}
			</nldd-task-board-column>
			<nldd-task-board-column
				value="afgerond"
				text="Afgerond"
			>
				${card('Aanvraag A-1043', 'Warmtepomp')}
			</nldd-task-board-column>
			<nldd-task-board-column
				value="ingetrokken"
				text="Ingetrokken"
			></nldd-task-board-column>
		</nldd-task-board>
	`,
	parameters: { controls: { disable: false } },
};

/**
 * Met het `header`-slot is de kop van een kolom van jou, zoals een `nldd-title`
 * met een menu. `text` blijft de naam van de kolom voor een schermlezer. Het
 * `footer`-slot staat direct onder het laatste kaartje, voor een knop om er een
 * toe te voegen, en scrolt met de kaartjes mee.
 */
export const MetEigenKop = {
	name: 'Met eigen kop en voet',
	render: () => html`
		<nldd-task-board
			accessible-label="Dossiers"
			@nldd-move=${onMove}
		>
			${[['uitvoering', 'Team Uitvoering', 'Dossier D-318'], ['beleid', 'Team Beleid', 'Dossier D-319']].map(([value, text, item]) => html`
				<nldd-task-board-column
					value=${value}
					text=${text}
				>
					<nldd-container
						slot="header"
						layout="row"
						vertical-alignment="center"
					>
						<nldd-title
							size="5"
							heading-level="3"
							text=${text}
						></nldd-title>
						<nldd-spacer size="flexible"></nldd-spacer>
						<nldd-icon-button
							icon="ellipsis"
							text="Meer acties"
							size="sm"
							appearance="neutral-transparent"
						></nldd-icon-button>
					</nldd-container>
					${card(item, 'Bezwaar')}
					<nldd-button
						slot="footer"
						appearance="neutral-transparent"
						start-icon="plus"
						text="Dossier toevoegen"
						width="full"
						horizontal-alignment="left"
					></nldd-button>
				</nldd-task-board-column>
			`)}
		</nldd-task-board>
	`,
};

/**
 * Met `height` heeft het bord een vaste hoogte. Elke kolom is dan even hoog, ook
 * een lege, zodat je ook onderin iets kunt neerzetten. Passen de kaartjes niet,
 * dan scrollt de kolom zelf en vervaagt hij aan de kant waar meer staat. Moet het
 * bord een pagina of een pane vullen, zet de hoogte dan in je layout, met flex of
 * `height: 100%`.
 */
export const VasteHoogte = {
	name: 'Vaste hoogte',
	render: () => html`
		<nldd-task-board
			height="360px"
			accessible-label="Aanvragen"
			@nldd-move=${onMove}
		>
			<nldd-task-board-column
				value="nieuw"
				text="Nieuw"
			>
				${card('Aanvraag A-1044', 'Zonnepanelen')}
				${card('Aanvraag A-1045', 'Spouwmuurisolatie')}
				${card('Aanvraag A-1046', 'Vloerisolatie')}
				${card('Aanvraag A-1047', 'Warmtepomp')}
				${card('Aanvraag A-1048', 'Zonneboiler')}
			</nldd-task-board-column>
			<nldd-task-board-column
				value="in-behandeling"
				text="In behandeling"
			>
				${card('Aanvraag A-1042', 'Dakisolatie', 'Team Uitvoering')}
			</nldd-task-board-column>
			<nldd-task-board-column
				value="afgerond"
				text="Afgerond"
			></nldd-task-board-column>
		</nldd-task-board>
	`,
};

/**
 * Met `readonly` verplaatst niemand iets: geen slepen en geen Alt met de
 * pijltjes. De kaartjes blijven werken, dus een klik opent er nog steeds een.
 * Voor wie alleen mag kijken, of voor een bord dat is afgesloten. `moveItem()`
 * verplaatst nog wel, zodat je app een verplaatsing van een ander kan tonen.
 *
 * Probeert iemand toch te verplaatsen, dan staat "Dit bord is alleen-lezen" even
 * bij het kaartje, hoort een schermlezer hetzelfde en vuurt `nldd-move-denied`,
 * zodat je app in een `nldd-notification` kan zeggen waarom. Zeg het ook boven
 * het bord: alleen je app weet de reden, en dan hoeft niemand het te proberen.
 */
export const ToestandReadonly = {
	name: 'Toestand readonly',
	render: () => html`
		<nldd-task-board
			readonly
			accessible-label="Aanvragen"
			@nldd-move=${onMove}
		>
			<nldd-task-board-column
				value="nieuw"
				text="Nieuw"
			>
				${card('Aanvraag A-1044', 'Zonnepanelen')}
			</nldd-task-board-column>
			<nldd-task-board-column
				value="in-behandeling"
				text="In behandeling"
			>
				${card('Aanvraag A-1042', 'Dakisolatie', 'Team Uitvoering')}
				${card('Dossier D-318', 'Bezwaar', 'Team Uitvoering')}
			</nldd-task-board-column>
			<nldd-task-board-column
				value="afgerond"
				text="Afgerond"
			>
				${card('Aanvraag A-1043', 'Warmtepomp')}
			</nldd-task-board-column>
		</nldd-task-board>
	`,
};

/**
 * Voor wie niet kan slepen: een menu op elk kaartje dat `moveItem()` aanroept.
 * Het menu is van de app; het bord levert `columns` en `moveItem()`. De items
 * zijn radio-items, met de kolom waar het kaartje nu staat geselecteerd: je kiest
 * de plek van het kaartje, net zoals je een status kiest. Zet die keuze in de
 * handler van `nldd-move`, dan klopt hij ook na slepen of het toetsenbord.
 */
export const ZonderSlepen = {
	name: 'Zonder slepen',
	render: () => {
		const move = (event: Event) => {
			const chosen = event.target as HTMLElement & { value: string };
			const item = chosen.closest('nldd-card')!;
			(item.closest('nldd-task-board') as NLDDTaskBoard).moveItem(item, chosen.value);
		};
		// Every move, by the menu, by dragging or by the keyboard, marks the
		// item's new column in its menu.
		const moved = (event: CustomEvent<NLDDMoveEventDetail>) => {
			onMove(event);
			const { item, toColumn } = event.detail;
			for (const option of item.querySelectorAll<HTMLElement & { value: string }>('nldd-menu-item')) {
				option.toggleAttribute('selected', option.value === toColumn);
			}
		};
		const columns = [['nieuw', 'Nieuw'], ['in-behandeling', 'In behandeling'], ['afgerond', 'Afgerond']];
		const movable = (title: string, text: string, current: string) => html`
			<nldd-card accessible-label=${title}>
				<nldd-container
					padding="12"
					gap="4"
					layout="row"
					vertical-alignment="center"
				>
					<nldd-container gap="4">
						<nldd-text weight="bold">${title}</nldd-text>
						<nldd-text
							size="sm"
							color="secondary"
						>${text}</nldd-text>
					</nldd-container>
					<nldd-spacer size="flexible"></nldd-spacer>
					<nldd-icon-button
						icon="ellipsis"
						text="Verplaatsen naar"
						size="sm"
						appearance="neutral-transparent"
					>
						<nldd-menu slot="popup">
							${columns.map(([value, label]) => html`
								<nldd-menu-item
									type="radio"
									text=${label}
									value=${value}
									?selected=${value === current}
									@select=${move}
								></nldd-menu-item>
							`)}
						</nldd-menu>
					</nldd-icon-button>
				</nldd-container>
			</nldd-card>
		`;
		return html`
			<nldd-task-board
				accessible-label="Aanvragen"
				@nldd-move=${moved}
			>
				<nldd-task-board-column
					value="nieuw"
					text="Nieuw"
				>
					${movable('Aanvraag A-1044', 'Zonnepanelen', 'nieuw')}
				</nldd-task-board-column>
				<nldd-task-board-column
					value="in-behandeling"
					text="In behandeling"
				>
					${movable('Aanvraag A-1042', 'Dakisolatie', 'in-behandeling')}
				</nldd-task-board-column>
				<nldd-task-board-column
					value="afgerond"
					text="Afgerond"
				>
					${movable('Aanvraag A-1043', 'Warmtepomp', 'afgerond')}
				</nldd-task-board-column>
			</nldd-task-board>
		`;
	},
};
