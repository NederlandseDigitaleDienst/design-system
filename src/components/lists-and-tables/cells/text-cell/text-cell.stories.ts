import { html, nothing } from 'lit';
import './text-cell.js';
import '../../../content/tag/tag.js';
import '../../../layout/container/container.js';
import '../../list/list.js';
import '../../list-item/list-item.js';
import '../../../content/text/text.js';
import '../../../layout/spacer/spacer.js';

export default {
	title: 'Components/Lists & Tables/Cells/Text Cell',
	component: 'nldd-text-cell',
	tags: ['autodocs'],
	args: {
		size: 'md',
		color: 'content',
		width: '',
		minWidth: '',
		maxWidth: '',
		minHeight: '',
		horizontalAlignment: 'left',
		verticalAlignment: 'center',
		text: 'Tekstcel',
		supportingText: '',
		overline: '',
		hideBelow: '',
		hideAbove: '',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Grootte van de tekstcel',
			table: { defaultValue: { summary: 'md' } },
		},
		color: {
			control: 'select',
			options: ['content', 'secondary', 'accent', 'success', 'warning', 'critical'],
			description: 'Kleurvariant. `accent`, `success`, `warning` en `critical` gelden voor alle drie tekstvelden zodat de cel als één samenhangende status leest.',
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
			description: "Maximale breedte als CSS-lengte (bv. '200px', '20rem')",
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
			description: 'Hoofdtekst. Ondersteunt **vet**-markeringen. Valt terug op de default-slot als deze leeg is.',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Optionele ondersteunende tekst. Ondersteunt **vet**-markeringen. Valt terug op de `supporting-text`-slot als deze leeg is.',
		},
		overline: {
			control: 'text',
			description: 'Optionele overline-tekst. Ondersteunt **vet**-markeringen. Valt terug op de `overline`-slot als deze leeg is.',
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
		<nldd-text-cell
			size=${args.size}
			color=${args.color}
			width=${args.width || nothing}
			horizontal-alignment=${args.horizontalAlignment}
			vertical-alignment=${args.verticalAlignment}
			text=${args.text}
			supporting-text=${args.supportingText}
			overline=${args.overline}
			hide-below=${args.hideBelow || nothing}
			hide-above=${args.hideAbove || nothing}
		></nldd-text-cell>
	`,
};

export const MetOverline = {
	render: () => html`
		<nldd-text-cell
			overline="Overline"
			text="Tekstcel"
		></nldd-text-cell>
	`,
};

export const MetSupportingText = {
	render: () => html`
		<nldd-text-cell
			text="Tekstcel"
			supporting-text="Ondersteunende tekst"
		></nldd-text-cell>
	`,
};

export const MetOverlineEnSupportingText = {
	render: () => html`
		<nldd-text-cell
			overline="Overline"
			text="Tekstcel"
			supporting-text="Ondersteunende tekst"
		></nldd-text-cell>
	`,
};

export const Secundair = {
	render: () => html`
		<nldd-text-cell
			color="secondary"
			text="Tekstcel (secondary)"
		></nldd-text-cell>
	`,
};

export const Accent = {
	render: () => html`
		<nldd-text-cell
			color="accent"
			overline="Overline"
			text="Tekstcel (accent)"
			supporting-text="Ondersteunende tekst"
		></nldd-text-cell>
	`,
	parameters: {
		docs: {
			description: {
				story: 'De accent-variant kleurt alle drie tekstvelden (overline, hoofdtekst, supporting-text) zodat de cel als één samenhangende highlight leest.',
			},
		},
	},
};

export const Statuskleuren = {
	render: () => html`
		<nldd-list accessible-label="Statuskleuren">
			<nldd-list-item>
				<nldd-text-cell
					color="success"
					overline="Status"
					text="Goedgekeurd"
					supporting-text="Verwerkt op 9 mei 2026"
				></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell
					color="warning"
					overline="Status"
					text="Wacht op actie"
					supporting-text="Reactie binnen 5 werkdagen"
				></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell
					color="critical"
					overline="Status"
					text="Afgewezen"
					supporting-text="Bekijk de toelichting"
				></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Status varianten tinten alle drie de tekstvelden (overline, hoofdtekst, supporting-text) zodat de hele cel als de status leest. Combineer altijd met een tekstuele indicator — kleur alleen is geen toegankelijke status-aanduiding.',
			},
		},
	},
};

export const Grootten = {
	render: () => html`
		<nldd-list accessible-label="Grootten">
			<nldd-list-item>
				<nldd-text-cell
					size="md"
					overline="Overline"
					text="Tekstcel (md)"
					supporting-text="Ondersteunende tekst"
				></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell
					size="sm"
					overline="Overline"
					text="Tekstcel (sm)"
					supporting-text="Ondersteunende tekst"
				></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const Breedte = {
	render: () => html`
		<div style="width: 300px; border: 1px dashed var(--primitives-color-neutral-150); padding: 8px;">
			<nldd-list accessible-label="Breedtes">
				<nldd-list-item>
					<nldd-text-cell
						width="full"
						text="Volledig (default)"
					></nldd-text-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-text-cell
						width="fit-content"
						text="Past zich aan"
					></nldd-text-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-text-cell
						width="120px"
						text="120px vast"
					></nldd-text-cell>
				</nldd-list-item>
			</nldd-list>
		</div>
	`,
};

export const MinimaleHoogte = {
	render: () => html`
		<nldd-list accessible-label="Minimale hoogte">
			<nldd-list-item>
				<nldd-text-cell
					vertical-alignment="top"
					min-height="44px"
					style="border: 1px dashed var(--primitives-color-neutral-150);"
					text="Min-hoogte 44px"
				></nldd-text-cell>
				<nldd-text-cell
					vertical-alignment="top"
					min-height="44px"
					style="border: 1px dashed var(--primitives-color-neutral-150);"
					text="Met ondersteunende tekst"
					supporting-text="Ondersteunende tekst"
				></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const HorizontaleUitlijning = {
	render: () => html`
		<nldd-list accessible-label="Horizontale uitlijning">
			<nldd-list-item>
				<nldd-text-cell
					horizontal-alignment="left"
					style="border: 1px dashed var(--primitives-color-neutral-150);"
					overline="Overline"
					text="Tekstcel (links)"
					supporting-text="Ondersteunende tekst"
				></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell
					horizontal-alignment="right"
					style="border: 1px dashed var(--primitives-color-neutral-150);"
					overline="Overline"
					text="Tekstcel (rechts)"
					supporting-text="Ondersteunende tekst"
				></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const VerticaleUitlijning = {
	render: () => html`
		<div style="display: flex; gap: 8px; height: 80px;">
			<nldd-text-cell
				vertical-alignment="top"
				style="border: 1px dashed var(--primitives-color-neutral-150);"
				text="Boven"
			></nldd-text-cell>
			<nldd-text-cell
				vertical-alignment="center"
				style="border: 1px dashed var(--primitives-color-neutral-150);"
				text="Midden"
			></nldd-text-cell>
			<nldd-text-cell
				vertical-alignment="bottom"
				style="border: 1px dashed var(--primitives-color-neutral-150);"
				text="Onder"
			></nldd-text-cell>
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
					Default slot — inline tag tussen tekst.
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-list accessible-label="Default slot">
					<nldd-list-item>
						<nldd-text-cell
							overline="Aanvraag"
							supporting-text="Laatst bijgewerkt vandaag"
						>
							Status: <nldd-tag color="success" size="sm" text="Goedgekeurd"></nldd-tag>
						</nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					Overline slot — tag als label.
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-list accessible-label="Overline slot">
					<nldd-list-item>
						<nldd-text-cell
							text="Aardappelen kweken in de zomer"
							supporting-text="Tuinieren · 4 min lezen"
						>
							<nldd-tag
								slot="overline"
								color="accent"
								size="sm"
								text="Nieuw"
							></nldd-tag>
						</nldd-text-cell>
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

Gebruik dit voor zelfdragende custom elementen zoals \`<nldd-tag>\`, \`<nldd-icon>\` of \`<nldd-badge>\` — die hebben hun eigen shadow DOM en zien er overal goed uit. Voor rauwe inline elementen zoals \`<a>\`, \`<strong>\` of \`<code>\` styled een cell niets — gebruik daar \`<nldd-cell>\` met \`<nldd-rich-text>\` voor.

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
					predictive (default) — vet de niet-gematchte rest. Geschikt voor korte labels in combobox-lijsten.
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-list accessible-label="Predictive">
					<nldd-list-item>
						<nldd-text-cell
							text="Aardappelen"
							query="aa"
						></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					match — vet de gematchte query. Geschikt voor lange inhoud in zoekresultaten.
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-list accessible-label="Match">
					<nldd-list-item>
						<nldd-text-cell
							text="De aardappel is een knolgewas en een belangrijk voedingsmiddel in de Nederlandse keuken."
							query="aardappel"
							query-mark-mode="match"
						></nldd-text-cell>
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
						<nldd-text-cell
							overline="Groente"
							text="Aardappelen"
							supporting-text="Ook: pieper, knol"
							query="ap"
						></nldd-text-cell>
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
