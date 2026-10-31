import { html, nothing } from 'lit';
import './title-cell.js';
import '../../../content/tag/tag.js';
import '../../../layout/container/container.js';
import '../../list/list.js';
import '../../list-item/list-item.js';
import '../../../content/text/text.js';
import '../../../layout/spacer/spacer.js';

export default {
	title: 'Components/Lists & Tables/Cells/Title Cell',
	component: 'nldd-title-cell',
	tags: ['autodocs'],
	args: {
		size: 5,
		color: 'content',
		width: '',
		minWidth: '',
		maxWidth: '',
		minHeight: '',
		horizontalAlignment: 'left',
		verticalAlignment: 'center',
		text: 'Titelcel',
		supportingText: '',
		overline: '',
		headingLevel: undefined,
		hideBelow: '',
		hideAbove: '',
	},
	argTypes: {
		size: {
			control: 'select',
			options: [1, 2, 3, 4, 5, 6],
			description: 'Visuele grootte van de titel',
			table: { defaultValue: { summary: '5' } },
		},
		color: {
			control: 'select',
			options: ['content', 'secondary', 'accent', 'success', 'warning', 'critical'],
			description: 'Tekstkleurvariant. `secondary` maakt de titel rustiger; `accent`, `success`, `warning` en `critical` kleuren alle drie de gebieden.',
			table: { defaultValue: { summary: 'content' } },
		},
		width: {
			control: 'text',
			description: "'full', 'fit-content', of een CSS-lengte (bv. '200px', '20rem')",
			table: { defaultValue: { summary: 'full' } },
		},
		minWidth: {
			name: 'min-width',
			control: 'text',
			description: "Minimale breedte als CSS-lengte (bv. '80px', '5rem')",
		},
		maxWidth: {
			name: 'max-width',
			control: 'text',
			description: "Maximale breedte als CSS-lengte (bv. '300px', '20rem')",
		},
		minHeight: {
			name: 'min-height',
			control: 'text',
			description: "Minimale hoogte als CSS-lengte (bv. '44px', '3rem')",
		},
		horizontalAlignment: {
			name: 'horizontal-alignment',
			control: 'select',
			options: ['left', 'center', 'right'],
			description: 'Horizontale uitlijning van de tekst',
			table: { defaultValue: { summary: 'left' } },
		},
		verticalAlignment: {
			name: 'vertical-alignment',
			control: 'select',
			options: ['top', 'center', 'bottom'],
			description: 'Verticale uitlijning van de cel',
			table: { defaultValue: { summary: 'center' } },
		},
		text: {
			control: 'text',
			description: 'Titeltekst. Ondersteunt **vet**-markeringen. Valt terug op de default-slot als deze leeg is.',
		},
		supportingText: {
			control: 'text',
			name: 'supporting-text',
			description: 'Optionele ondersteunende tekst onder de titel. Ondersteunt **vet**-markeringen. Valt terug op de `supporting-text`-slot als deze leeg is.',
		},
		overline: {
			control: 'text',
			description: 'Optionele overline-tekst boven de titel. Ondersteunt **vet**-markeringen. Valt terug op de `overline`-slot als deze leeg is.',
		},
		headingLevel: {
			control: 'select',
			options: ['(geen)', 1, 2, 3, 4, 5, 6],
			mapping: { '(geen)': undefined },
			name: 'heading-level',
			description: 'Heading-niveau (1–6). Zonder waarde wordt een &lt;p&gt; gerenderd.',
			table: { defaultValue: { summary: '(geen)' } },
		},
		hideBelow: {
			name: 'hide-below',
			control: 'text',
			description: 'Verberg wanneer cells-container smaller is dan deze CSS-lengte (bv. "320px", "20rem")',
		},
		hideAbove: {
			name: 'hide-above',
			control: 'text',
			description: 'Verberg wanneer cells-container breder is dan deze CSS-lengte (bv. "1200px")',
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-title-cell
			size=${args.size}
			color=${args.color}
			width=${args.width || nothing}
			horizontal-alignment=${args.horizontalAlignment}
			vertical-alignment=${args.verticalAlignment}
			text=${args.text}
			supporting-text=${args.supportingText}
			overline=${args.overline}
			heading-level=${args.headingLevel ?? nothing}
			hide-below=${args.hideBelow || nothing}
			hide-above=${args.hideAbove || nothing}
		></nldd-title-cell>
	`,
};

export const Secundair = {
	render: () => html`
		<nldd-title-cell
			color="secondary"
			overline="Overline"
			text="Titelcel (secondary)"
			supporting-text="Ondertitel"
		></nldd-title-cell>
	`,
	parameters: {
		docs: {
			description: {
				story: 'De secondary-variant maakt de titel rustiger zodat hij aansluit op de gedempte overline/supporting-text — handig voor minder belangrijke rijen.',
			},
		},
	},
};

export const Accent = {
	render: () => html`
		<nldd-title-cell
			color="accent"
			overline="Overline"
			text="Titelcel (accent)"
			supporting-text="Ondertitel"
		></nldd-title-cell>
	`,
	parameters: {
		docs: {
			description: {
				story: 'De accent-variant kleurt alle drie tekstvelden (overline, titel, supporting-text) zodat de cel als één samenhangende highlight leest.',
			},
		},
	},
};

export const Statuskleuren = {
	render: () => html`
		<nldd-list accessible-label="Statuskleuren">
			<nldd-list-item>
				<nldd-title-cell
					color="success"
					overline="Status"
					text="Goedgekeurd"
					supporting-text="Verwerkt op 9 mei 2026"
				></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-title-cell
					color="warning"
					overline="Status"
					text="Wacht op actie"
					supporting-text="Reactie binnen 5 werkdagen"
				></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-title-cell
					color="critical"
					overline="Status"
					text="Afgewezen"
					supporting-text="Bekijk de toelichting"
				></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Status varianten tinten alle drie de tekstvelden zodat de hele titel-cel als de status leest. Combineer altijd met een tekstuele indicator — kleur alleen is geen toegankelijke status-aanduiding.',
			},
		},
	},
};

export const MetOverline = {
	render: () => html`
		<nldd-title-cell
			overline="Overline"
			text="Titelcel"
		></nldd-title-cell>
	`,
};

export const MetSupportingText = {
	render: () => html`
		<nldd-title-cell
			text="Titelcel"
			supporting-text="Ondertitel"
		></nldd-title-cell>
	`,
};

export const MetOverlineEnSupportingText = {
	render: () => html`
		<nldd-title-cell
			overline="Overline"
			text="Titelcel"
			supporting-text="Ondertitel"
		></nldd-title-cell>
	`,
};

export const AlleGrootten = {
	render: () => html`
		<nldd-list accessible-label="Grootten">
			${[1, 2, 3, 4, 5, 6].map(s => html`
				<nldd-list-item>
					<nldd-title-cell
						size=${s}
						text="Titelcel (grootte ${s})"
					></nldd-title-cell>
				</nldd-list-item>
			`)}
		</nldd-list>
	`,
};

export const HorizontaleUitlijning = {
	render: () => html`
		<nldd-list accessible-label="Horizontale uitlijning">
			<nldd-list-item>
				<nldd-title-cell
					horizontal-alignment="left"
					class="cell-bounds"
					overline="Overline"
					text="Titelcel (links)"
					supporting-text="Ondertitel"
				></nldd-title-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-title-cell
					horizontal-alignment="right"
					class="cell-bounds"
					overline="Overline"
					text="Titelcel (rechts)"
					supporting-text="Ondertitel"
				></nldd-title-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const VerticaleUitlijning = {
	render: () => html`
		<div style="display: flex; gap: 8px; height: 80px;">
			<nldd-title-cell
				vertical-alignment="top"
				class="cell-bounds"
				text="Boven"
			></nldd-title-cell>
			<nldd-title-cell
				vertical-alignment="center"
				class="cell-bounds"
				text="Midden"
			></nldd-title-cell>
			<nldd-title-cell
				vertical-alignment="bottom"
				class="cell-bounds"
				text="Onder"
			></nldd-title-cell>
		</div>
	`,
};

export const TagInDeSlot = {
	render: () => html`
		<nldd-container
			gap="16"
			max-width="480px"
		>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					Overline slot — tag als statuslabel boven de titel.
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-list accessible-label="Overline slot">
					<nldd-list-item>
						<nldd-title-cell
							text="Aanvraag huurtoeslag"
							supporting-text="Ingediend op 9 mei 2026"
						>
							<nldd-tag
								slot="overline"
								color="success"
								size="sm"
								text="Goedgekeurd"
							></nldd-tag>
						</nldd-title-cell>
					</nldd-list-item>
				</nldd-list>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					Default slot — inline tag binnen de titel.
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-list accessible-label="Default slot">
					<nldd-list-item>
						<nldd-title-cell
							overline="Sectie"
							supporting-text="3 items"
						>
							Aardappelen <nldd-tag color="accent" size="sm" text="Nieuw"></nldd-tag>
						</nldd-title-cell>
					</nldd-list-item>
				</nldd-list>
			</nldd-container>
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: `
Elk tekstgebied (overline, default, supporting-text) accepteert óf een attribuut óf slotted DOM. Wanneer een slot gevuld is, vervangt het de attribuut-render voor dat gebied.

Gebruik dit voor zelfdragende custom elementen zoals \`<nldd-tag>\`, \`<nldd-icon>\` of \`<nldd-badge>\` — die hebben hun eigen shadow DOM en zien er overal goed uit. Voor rauwe inline elementen zoals \`<a>\`, \`<strong>\` of \`<code>\` styled een title-cell niets — gebruik \`<nldd-cell>\` met \`<nldd-rich-text>\` voor rijke content.

\`query\` highlighting en \`**bold**\` parsing zijn alleen actief op de attribuut-route — slotted content wordt as-is getoond.
				`.trim(),
			},
		},
	},
};

export const ZoektermMarkeren = {
	render: () => html`
		<nldd-container
			gap="16"
			max-width="480px"
		>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					predictive (default) — vet de niet-gematchte rest.
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-list accessible-label="Predictive">
					<nldd-list-item>
						<nldd-title-cell
							text="Aardappelen"
							query="aa"
						></nldd-title-cell>
					</nldd-list-item>
				</nldd-list>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					match — vet de gematchte query.
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-list accessible-label="Match">
					<nldd-list-item>
						<nldd-title-cell
							text="Aardappel knolgewas"
							query="aar"
							query-mark-mode="match"
						></nldd-title-cell>
					</nldd-list-item>
				</nldd-list>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					Werkt op text, overline en supporting-text.
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-list accessible-label="Alle tekstvelden">
					<nldd-list-item>
						<nldd-title-cell
							overline="Groente"
							text="Aardappelen"
							supporting-text="Ook: pieper, knol"
							query="ap"
						></nldd-title-cell>
					</nldd-list-item>
				</nldd-list>
			</nldd-container>
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: `
Zet \`query\` op een substring en de cel vet automatisch de match in \`text\`, \`overline\` en \`supporting-text\`. Gebruik \`query-mark-mode\` om de strategie te kiezen:

- \`'predictive'\` (default): vet de niet-gematchte rest — het ARIA APG combobox-patroon.
- \`'match'\`: vet de gematchte query — handig om zoektermen in langere tekst te markeren.
				`.trim(),
			},
		},
	},
};
