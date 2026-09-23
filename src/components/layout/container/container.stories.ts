import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './container.js';
import '../../content/rich-text/rich-text.js';
import '../../content/tag/tag.js';
import '../card/card.js';

const SIZES = ['0', '2', '4', '6', '8', '10', '12', '16', '20', '24', '28', '32', '40', '44', '48', '56', '64', '80', '96'];

const sizeControl = (description: string) => ({
	control: 'select',
	options: ['(geen)', ...SIZES],
	mapping: { '(geen)': undefined },
	description,
	table: { defaultValue: { summary: '(geen)' } },
});

/**
 * Container is een eenvoudige layout-primitive: kies een layout-modus, geef
 * een gap, optioneel uitlijning, en padding. Padding kan per zijde, per as
 * (inline/block) of voor alle zijden tegelijk. Specifiekere instellingen
 * winnen: zijde > as > alle.
 *
 * Responsive padding en gap hebben `sm-` / `md-` / `lg-` varianten. Elke variant
 * werkt binnen een `layout-container` als container query, en valt buiten
 * een layout-container terug op een viewport media query.
 *
 * Layout-modi:
 *  - `stack` (default): items onder elkaar (normale DOM-flow).
 *  - `row`: flex-rij, geen wrap.
 *  - `wrap`: flex-rij die naar volgende regel wraps.
 *  - `grid`: CSS-grid, auto-fit kolommen van min 280px breed.
 *  - `columns`: CSS multicolumn, items flowen verticaal en lopen door naar
 *    de volgende kolom (krant-stijl); breaks binnen items worden vermeden.
 *
 * ## Gebruik
 * ```html
 * <nldd-container layout="wrap" gap="12" padding="16" sm-padding="8">
 *   <nldd-rich-text><p>Eerste item</p></nldd-rich-text>
 *   <nldd-rich-text><p>Tweede item</p></nldd-rich-text>
 * </nldd-container>
 * ```
 */
export default {
	title: 'Components/Layout/Container',
	component: 'nldd-container',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/container/container.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		layout: undefined,
		columnCount: undefined,
		smColumnCount: undefined,
		mdColumnCount: undefined,
		lgColumnCount: undefined,
		gap: undefined,
		smGap: undefined,
		mdGap: undefined,
		lgGap: undefined,
		padding: '16',
		paddingInline: undefined,
		paddingBlock: undefined,
		paddingTop: undefined,
		paddingRight: undefined,
		paddingBottom: undefined,
		paddingLeft: undefined,
		smPadding: undefined,
		smPaddingInline: undefined,
		smPaddingBlock: undefined,
		smPaddingTop: undefined,
		smPaddingRight: undefined,
		smPaddingBottom: undefined,
		smPaddingLeft: undefined,
		mdPadding: undefined,
		mdPaddingInline: undefined,
		mdPaddingBlock: undefined,
		mdPaddingTop: undefined,
		mdPaddingRight: undefined,
		mdPaddingBottom: undefined,
		mdPaddingLeft: undefined,
		lgPadding: undefined,
		lgPaddingInline: undefined,
		lgPaddingBlock: undefined,
		lgPaddingTop: undefined,
		lgPaddingRight: undefined,
		lgPaddingBottom: undefined,
		lgPaddingLeft: undefined,
		horizontalAlignment: undefined,
		verticalAlignment: undefined,
	},
	argTypes: {
		layout: {
			control: 'select',
			options: ['(geen)', 'stack', 'row', 'wrap', 'grid', 'columns', 'lanes'],
			mapping: { '(geen)': undefined },
			description: 'Layout-modus',
			table: { defaultValue: { summary: 'stack' } },
		},
		columnCount: {
			name: 'column-count',
			control: 'select',
			options: ['(geen)', 1, 2, 3, 4, 5, 6, 7, 8],
			mapping: { '(geen)': undefined },
			description: 'Aantal kolommen (grid/columns)',
			table: { defaultValue: { summary: '(geen)' } },
		},
		smColumnCount: {
			name: 'sm-column-count',
			control: 'select',
			options: ['(geen)', 1, 2, 3, 4, 5, 6, 7, 8],
			mapping: { '(geen)': undefined },
			description: 'Kolom-aantal bij sm container-breedte',
			table: { defaultValue: { summary: '(geen)' } },
		},
		mdColumnCount: {
			name: 'md-column-count',
			control: 'select',
			options: ['(geen)', 1, 2, 3, 4, 5, 6, 7, 8],
			mapping: { '(geen)': undefined },
			description: 'Kolom-aantal bij md container-breedte',
			table: { defaultValue: { summary: '(geen)' } },
		},
		lgColumnCount: {
			name: 'lg-column-count',
			control: 'select',
			options: ['(geen)', 1, 2, 3, 4, 5, 6, 7, 8],
			mapping: { '(geen)': undefined },
			description: 'Kolom-aantal bij lg container-breedte',
			table: { defaultValue: { summary: '(geen)' } },
		},

		gap: sizeControl('Gap tussen kinderen'),
		smGap: { name: 'sm-gap', ...sizeControl('Gap bij sm') },
		mdGap: { name: 'md-gap', ...sizeControl('Gap bij md') },
		lgGap: { name: 'lg-gap', ...sizeControl('Gap bij lg') },

		padding: sizeControl('Padding voor alle zijden'),
		paddingInline: { name: 'padding-inline', ...sizeControl('Padding links en rechts') },
		paddingBlock: { name: 'padding-block', ...sizeControl('Padding boven en onder') },
		paddingTop: { name: 'padding-top', ...sizeControl('Padding boven') },
		paddingRight: { name: 'padding-right', ...sizeControl('Padding rechts') },
		paddingBottom: { name: 'padding-bottom', ...sizeControl('Padding onder') },
		paddingLeft: { name: 'padding-left', ...sizeControl('Padding links') },

		smPadding: { name: 'sm-padding', ...sizeControl('Padding bij sm') },
		smPaddingInline: { name: 'sm-padding-inline', ...sizeControl('Padding inline bij sm') },
		smPaddingBlock: { name: 'sm-padding-block', ...sizeControl('Padding block bij sm') },
		smPaddingTop: { name: 'sm-padding-top', ...sizeControl('Padding top bij sm') },
		smPaddingRight: { name: 'sm-padding-right', ...sizeControl('Padding right bij sm') },
		smPaddingBottom: { name: 'sm-padding-bottom', ...sizeControl('Padding bottom bij sm') },
		smPaddingLeft: { name: 'sm-padding-left', ...sizeControl('Padding left bij sm') },

		mdPadding: { name: 'md-padding', ...sizeControl('Padding bij md') },
		mdPaddingInline: { name: 'md-padding-inline', ...sizeControl('Padding inline bij md') },
		mdPaddingBlock: { name: 'md-padding-block', ...sizeControl('Padding block bij md') },
		mdPaddingTop: { name: 'md-padding-top', ...sizeControl('Padding top bij md') },
		mdPaddingRight: { name: 'md-padding-right', ...sizeControl('Padding right bij md') },
		mdPaddingBottom: { name: 'md-padding-bottom', ...sizeControl('Padding bottom bij md') },
		mdPaddingLeft: { name: 'md-padding-left', ...sizeControl('Padding left bij md') },

		lgPadding: { name: 'lg-padding', ...sizeControl('Padding bij lg') },
		lgPaddingInline: { name: 'lg-padding-inline', ...sizeControl('Padding inline bij lg') },
		lgPaddingBlock: { name: 'lg-padding-block', ...sizeControl('Padding block bij lg') },
		lgPaddingTop: { name: 'lg-padding-top', ...sizeControl('Padding top bij lg') },
		lgPaddingRight: { name: 'lg-padding-right', ...sizeControl('Padding right bij lg') },
		lgPaddingBottom: { name: 'lg-padding-bottom', ...sizeControl('Padding bottom bij lg') },
		lgPaddingLeft: { name: 'lg-padding-left', ...sizeControl('Padding left bij lg') },

		horizontalAlignment: {
			name: 'horizontal-alignment',
			control: 'select',
			options: ['(geen)', 'left', 'center', 'right'],
			mapping: { '(geen)': undefined },
			description: 'Horizontale uitlijning',
			table: { defaultValue: { summary: '(geen)' } },
		},
		verticalAlignment: {
			name: 'vertical-alignment',
			control: 'select',
			options: ['(geen)', 'top', 'center', 'bottom'],
			mapping: { '(geen)': undefined },
			description: 'Verticale uitlijning',
			table: { defaultValue: { summary: '(geen)' } },
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-container
			layout=${ifDefined(args.layout)}
			column-count=${ifDefined(args.columnCount)}
			sm-column-count=${ifDefined(args.smColumnCount)}
			md-column-count=${ifDefined(args.mdColumnCount)}
			lg-column-count=${ifDefined(args.lgColumnCount)}
			gap=${ifDefined(args.gap)}
			sm-gap=${ifDefined(args.smGap)}
			md-gap=${ifDefined(args.mdGap)}
			lg-gap=${ifDefined(args.lgGap)}
			padding=${ifDefined(args.padding)}
			padding-inline=${ifDefined(args.paddingInline)}
			padding-block=${ifDefined(args.paddingBlock)}
			padding-top=${ifDefined(args.paddingTop)}
			padding-right=${ifDefined(args.paddingRight)}
			padding-bottom=${ifDefined(args.paddingBottom)}
			padding-left=${ifDefined(args.paddingLeft)}
			sm-padding=${ifDefined(args.smPadding)}
			sm-padding-inline=${ifDefined(args.smPaddingInline)}
			sm-padding-block=${ifDefined(args.smPaddingBlock)}
			sm-padding-top=${ifDefined(args.smPaddingTop)}
			sm-padding-right=${ifDefined(args.smPaddingRight)}
			sm-padding-bottom=${ifDefined(args.smPaddingBottom)}
			sm-padding-left=${ifDefined(args.smPaddingLeft)}
			md-padding=${ifDefined(args.mdPadding)}
			md-padding-inline=${ifDefined(args.mdPaddingInline)}
			md-padding-block=${ifDefined(args.mdPaddingBlock)}
			md-padding-top=${ifDefined(args.mdPaddingTop)}
			md-padding-right=${ifDefined(args.mdPaddingRight)}
			md-padding-bottom=${ifDefined(args.mdPaddingBottom)}
			md-padding-left=${ifDefined(args.mdPaddingLeft)}
			lg-padding=${ifDefined(args.lgPadding)}
			lg-padding-inline=${ifDefined(args.lgPaddingInline)}
			lg-padding-block=${ifDefined(args.lgPaddingBlock)}
			lg-padding-top=${ifDefined(args.lgPaddingTop)}
			lg-padding-right=${ifDefined(args.lgPaddingRight)}
			lg-padding-bottom=${ifDefined(args.lgPaddingBottom)}
			lg-padding-left=${ifDefined(args.lgPaddingLeft)}
			horizontal-alignment=${ifDefined(args.horizontalAlignment)}
			vertical-alignment=${ifDefined(args.verticalAlignment)}
			style="outline: 1px dashed var(--primitives-color-neutral-150);"
		>
			<nldd-rich-text><p>Eerste item.</p></nldd-rich-text>
			<nldd-rich-text><p>Tweede item.</p></nldd-rich-text>
		</nldd-container>
	`,
};

export const LayoutStack = {
	render: () => html`
		<nldd-container gap="12" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text><p>Eerste</p></nldd-rich-text>
			<nldd-rich-text><p>Tweede</p></nldd-rich-text>
			<nldd-rich-text><p>Derde</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Layout: stack (standaard)',
};

export const LayoutRow = {
	render: () => html`
		<nldd-container layout="row" gap="12" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text><p>Eerste</p></nldd-rich-text>
			<nldd-rich-text><p>Tweede</p></nldd-rich-text>
			<nldd-rich-text><p>Derde</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Layout: row',
};

export const LayoutWrap = {
	render: () => html`
		<nldd-container layout="wrap" gap="12" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150); max-width: 320px;">
			<nldd-tag>Item één</nldd-tag>
			<nldd-tag>Item twee</nldd-tag>
			<nldd-tag>Item drie</nldd-tag>
			<nldd-tag>Item vier</nldd-tag>
			<nldd-tag>Item vijf</nldd-tag>
		</nldd-container>
	`,
	name: 'Layout: wrap',
};

export const LayoutGrid = {
	render: () => html`
		<nldd-container layout="grid" gap="12" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text><p>Cell één</p></nldd-rich-text>
			<nldd-rich-text><p>Cell twee</p></nldd-rich-text>
			<nldd-rich-text><p>Cell drie</p></nldd-rich-text>
			<nldd-rich-text><p>Cell vier</p></nldd-rich-text>
			<nldd-rich-text><p>Cell vijf</p></nldd-rich-text>
			<nldd-rich-text><p>Cell zes</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Layout: grid (auto-fit, min 280px)',
};

export const LayoutColumns = {
	render: () => html`
		<nldd-container layout="columns" gap="24" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text><p>Eerste link in de lijst</p></nldd-rich-text>
			<nldd-rich-text><p>Tweede link</p></nldd-rich-text>
			<nldd-rich-text><p>Derde link in de lijst</p></nldd-rich-text>
			<nldd-rich-text><p>Vierde link</p></nldd-rich-text>
			<nldd-rich-text><p>Vijfde link in de lijst</p></nldd-rich-text>
			<nldd-rich-text><p>Zesde link</p></nldd-rich-text>
			<nldd-rich-text><p>Zevende link in de lijst</p></nldd-rich-text>
			<nldd-rich-text><p>Achtste link</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Layout: columns (multicol, min 280px)',
};

export const LayoutLanes = {
	render: () => html`
		<nldd-container layout="lanes" gap="16" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-card>
				<nldd-container padding="16">
					<nldd-rich-text><h3>Kort</h3><p>Een blok met een enkele regel.</p></nldd-rich-text>
				</nldd-container>
			</nldd-card>
			<nldd-card>
				<nldd-container padding="16">
					<nldd-rich-text><h3>Langer</h3><p>Dit blok heeft meer tekst zodat de hoogtes verschillen en het masonry-effect zichtbaar wordt.</p></nldd-rich-text>
				</nldd-container>
			</nldd-card>
			<nldd-card>
				<nldd-container padding="16">
					<nldd-rich-text><h3>Kort</h3><p>Ook een kort blok.</p></nldd-rich-text>
				</nldd-container>
			</nldd-card>
			<nldd-card>
				<nldd-container padding="16">
					<nldd-rich-text><h3>Lang</h3><p>Nog een blok met flink meer inhoud, meerdere zinnen achter elkaar, zodat de kolommen ongelijk vullen en items naar de kortste kolom schuiven (native) of in kolomvolgorde stromen (fallback).</p></nldd-rich-text>
				</nldd-container>
			</nldd-card>
			<nldd-card>
				<nldd-container padding="16">
					<nldd-rich-text><h3>Middel</h3><p>Een paar regels tekst hier, net iets meer dan kort.</p></nldd-rich-text>
				</nldd-container>
			</nldd-card>
			<nldd-card>
				<nldd-container padding="16">
					<nldd-rich-text><h3>Kort</h3><p>Laatste, kort.</p></nldd-rich-text>
				</nldd-container>
			</nldd-card>
		</nldd-container>
	`,
	name: 'Layout: lanes (grid-lanes, anders multicol)',
};

export const OrderRow = {
	render: () => html`
		<nldd-container layout="row" gap="12" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text order="4"><p>1 (order=4)</p></nldd-rich-text>
			<nldd-rich-text order="3"><p>2 (order=3)</p></nldd-rich-text>
			<nldd-rich-text order="2"><p>3 (order=2)</p></nldd-rich-text>
			<nldd-rich-text order="1"><p>4 (order=1)</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Order: row (omgekeerd via per-child order)',
};

export const OrderGrid = {
	render: () => html`
		<nldd-container layout="grid" gap="12" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text order="3"><p>1 (order=3)</p></nldd-rich-text>
			<nldd-rich-text order="1"><p>2 (order=1)</p></nldd-rich-text>
			<nldd-rich-text order="2"><p>3 (order=2)</p></nldd-rich-text>
			<nldd-rich-text order="4"><p>4 (order=4)</p></nldd-rich-text>
			<nldd-rich-text order="6"><p>5 (order=6)</p></nldd-rich-text>
			<nldd-rich-text order="5"><p>6 (order=5)</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Order: grid (per cel, de grid-tracks blijven intact)',
};

export const OrderResponsief = {
	render: () => html`
		<nldd-container layout="row" gap="12" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text order="1" sm-order="3"><p>A (lg=1, sm=3)</p></nldd-rich-text>
			<nldd-rich-text order="2" sm-order="1"><p>B (lg=2, sm=1)</p></nldd-rich-text>
			<nldd-rich-text order="3" sm-order="2"><p>C (lg=3, sm=2)</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Order: responsief (sm-order valt terug op order)',
};

export const OrderNegatief = {
	render: () => html`
		<nldd-container layout="row" gap="12" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text><p>Item</p></nldd-rich-text>
			<nldd-rich-text><p>Item</p></nldd-rich-text>
			<nldd-rich-text order="-1"><p>Eerste (order=-1)</p></nldd-rich-text>
			<nldd-rich-text><p>Item</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Order: negatieve waarde duwt item naar voren',
};

export const ColumnCountFooter = {
	render: () => html`
		<nldd-container layout="grid" column-count="4" md-column-count="2" sm-column-count="1" gap="32" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text><p>Kolom 1</p></nldd-rich-text>
			<nldd-rich-text><p>Kolom 2</p></nldd-rich-text>
			<nldd-rich-text><p>Kolom 3</p></nldd-rich-text>
			<nldd-rich-text><p>Kolom 4</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Column-count: footerpatroon (4 / md=2 / sm=1)',
};

export const ColumnCountGrid6 = {
	render: () => html`
		<nldd-container layout="grid" column-count="6" gap="12" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			${Array.from({ length: 12 }).map((_, i) => html`<nldd-rich-text><p>${i + 1}</p></nldd-rich-text>`)}
		</nldd-container>
	`,
	name: 'Column-count: grid 6 kolommen',
};

export const ColumnCountColumns = {
	render: () => html`
		<nldd-container layout="columns" column-count="3" gap="24" padding="16" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			${Array.from({ length: 9 }).map((_, i) => html`<nldd-rich-text><p>Item ${i + 1}</p></nldd-rich-text>`)}
		</nldd-container>
	`,
	name: 'Column-count: multicol 3 kolommen',
};

export const PaddingAlleZijden = {
	render: () => html`
		<nldd-container padding="24" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text><p>Padding aan alle zijden.</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Padding: alle zijden',
};

export const PaddingInline = {
	render: () => html`
		<nldd-container padding-inline="32" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text><p>Padding links en rechts.</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Padding: inline (links/rechts)',
};

export const PaddingIndividueel = {
	render: () => html`
		<nldd-container
			padding-top="8"
			padding-right="32"
			padding-bottom="16"
			padding-left="64"
			style="outline: 1px dashed var(--primitives-color-neutral-150);"
		>
			<nldd-rich-text><p>Individuele padding: top=8 right=32 bottom=16 left=64.</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Padding: individuele zijden',
};

export const PaddingResponsief = {
	render: () => html`
		<nldd-container
			padding="8"
			sm-padding="16"
			md-padding="24"
			lg-padding="32"
			style="outline: 1px dashed var(--primitives-color-neutral-150);"
		>
			<nldd-rich-text><p>Padding: 8 (default) → 16 (sm) → 24 (md) → 32 (lg).</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Padding: responsief',
};

export const GeenPadding = {
	render: () => html`
		<nldd-container padding="0" style="outline: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-rich-text><p>Geen padding.</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Geen padding',
};

export const Uitlijning = {
	render: () => html`
		<nldd-container
			layout="row"
			gap="12"
			padding="16"
			horizontal-alignment="center"
			vertical-alignment="center"
			style="outline: 1px dashed var(--primitives-color-neutral-150); min-height: 200px;"
		>
			<nldd-rich-text><p>Gecentreerd</p></nldd-rich-text>
			<nldd-rich-text><p>Op beide assen</p></nldd-rich-text>
		</nldd-container>
	`,
	name: 'Uitlijning: center op beide assen',
};
