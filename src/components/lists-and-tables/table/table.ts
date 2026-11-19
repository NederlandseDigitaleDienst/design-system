/**
 * Nederlandse Digitale Dienst Table Component (Lit + TypeScript)
 *
 * Exports both NLDDTable and NLDDTableRow.
 *
 * A data table presented as a boxed surface (rounded corners, an inset border
 * ring, a base or tinted fill) that aligns content into shared columns using a
 * CSS grid + subgrid. Row dividers run full-bleed to the edges; the inline
 * padding lives on the rows, so it insets the cell content but not the dividers.
 * Column widths are defined ONCE on the table via the `columns` attribute (a
 * CSS grid track list), like an HTML `<colgroup>`.
 * Rows are `<nldd-table-row>` elements whose children are the existing
 * `nldd-cell` family. Every row uses `grid-template-columns: subgrid`, so all
 * rows snap to the same columns. A generic `nldd-cell` gets `width="full"`, so
 * it fills its column, unless it sets a length of its own.
 *
 * Header: put one `<nldd-table-row slot="header">` in the `header` slot. Its
 * cells become column headers (role="columnheader").
 *
 * Row headers: give the cell that says what a row is about `row-header`
 * (`nldd-cell`, `nldd-title-cell`, `nldd-text-cell`, `nldd-description-cell`).
 * The row then gives it role="rowheader" instead of "cell", so a screen
 * reader names the row along with every other cell in it, like
 * `<th scope="row">`. The attribute goes on the cell, not as a column index on
 * the row or table, so it survives columns hidden at a breakpoint and needs
 * no counting. It changes the semantics only: the cell variant still decides
 * the look. The cell above the row headers, in the header row, stays a
 * columnheader. Headers that span rows or columns are not supported.
 *
 * Responsive: two complementary strategies. (1) Give columns a minimum width
 * (e.g. `minmax(160px,1fr)`). The table is its own scroll container, so it
 * scrolls horizontally when too narrow (no wrapper needed).
 * (2) Drop columns at breakpoints: provide `sm-columns`/`md-columns`/
 * `lg-columns` (shorter track lists) and hide the dropped columns' cells with
 * `hide-below`/`hide-above` at the matching breakpoint. The table picks the
 * track list for its own width via the standard sm/md/lg breakpoints.
 *
 * Selection and sorting are intentionally NOT built in: add a column with an
 * `nldd-cell` + `nldd-checkbox` for selection, and drive sorting from an
 * external control (e.g. a dropdown).
 *
 * @element nldd-table
 * @keywords tabel
 * @related nldd-list
 *
 * @attr {'base'|'tinted'} background - Surface fill of the box (default 'base')
 * @attr {string} columns - CSS grid track list defining the columns once, e.g. "minmax(200px,1fr) 120px 80px"
 * @attr {string} sm-columns - Track list when the table is sm-wide (≤640px); falls back to `columns`
 * @attr {string} md-columns - Track list when the table is md-wide (641–1007px); falls back to `columns`
 * @attr {string} lg-columns - Track list when the table is lg-wide (≥1008px); falls back to `columns`
 * @attr {string} accessible-label - Accessible name for the table. Strongly recommended, because role="table" needs a name. A missing label is DEV-warned and a generic fallback name is used.
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 * @attr {boolean} selectable - Opt into row selection: body rows expose aria-selected (true/false). Without it, rows omit aria-selected so a non-selectable table isn't announced as selectable.
 *
 * @slot header - One `<nldd-table-row slot="header">` carrying the column headers
 * @slot - The body rows (`<nldd-table-row>`)
 * @slot empty - Shown when the table has no body rows (the header is hidden too). Empty by default: what an empty table should say is the app's to write, so put an `nldd-inline-dialog` here.
 * @slot no-results - Shown when the table has body rows but every one of them is `[hidden]`, which is what consumer-driven filtering leaves behind. A different state from `empty` and a different sentence: say that nothing matches and how to get rows back. Falls back to `[slot="empty"]` when not given.
 *
 * @element nldd-table-row
 *
 * @attr {boolean} selected - Highlights the row (same treatment as nldd-list-item[selected])
 *
 * Assigns each slotted cell its role: "columnheader" in a header row,
 * "rowheader" for a body cell with `row-header`, "cell" otherwise.
 *
 * An `nldd-title-cell` without a `size` gets `size="display-6"`: the
 * same size as the other cells, in bold. Its default of display-5 is made to
 * stand out above the supporting text of a list item, and in a table it towers
 * over the row. A `size` in the markup wins, display-5 included.
 *
 * @slot - The row's cells (`nldd-cell` and variants), one per column
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { tableStyles, tableRowStyles } from './table.styles.js';
import { tableTemplate, tableRowTemplate } from './table.template.js';
import { nlddTableTranslations } from './table.i18n.js';
import type { NLDDTableTranslations } from './table.i18n.js';
import { breakpointPx, rootFontSize } from '../../../assets/styles/breakpoints.js';
import '../../status-and-feedback/inline-dialog/inline-dialog.js';
import { translate } from '../../../utilities/translations.js';
import { setState } from '../../../utilities/element-state.js';
import { afterParse } from '../../../utilities/after-parse.js';
import { LayoutPass } from '../../../utilities/layout-pass.js';

export type TableBackground = 'base' | 'tinted';

/**
 * Every table that changed size, in one pass: all of them take their new
 * track list, then all of them read whether they scroll, then all of them
 * write it. A table that reads its scroll width right after another one wrote
 * its columns lays the page out again, once per table.
 */
function measureTables(tables: Map<NLDDTable, number>): void {
	const fontSize = rootFontSize();
	const live = [...tables].filter(([table]) => table.isConnected);
	for (const [table, width] of live) {
		table._width = width;
		table._applyColumns(fontSize);
	}
	const scrollable = live.map(([table]) => table._readScrollable());
	live.forEach(([table], i) => table._applyScrollable(scrollable[i]));
}

/**
 * One ResizeObserver for every table: one that calls back once per table has
 * each of them read a layout the previous one just dirtied. It watches the
 * sizer in each table, a line of no height across it, and not the table
 * itself: the track list it writes changes the table's height, and resizing
 * an observed element in the callback ends in a "ResizeObserver loop" error.
 * The width comes from the entry, so it is the exact width the cells'
 * `@container` queries see.
 */
let sizeObserver: ResizeObserver | null = null;
function observeSize(sizer: Element): void {
	sizeObserver ??= new ResizeObserver((entries) => {
		const tables = new Map<NLDDTable, number>();
		for (const entry of entries) {
			const table = (entry.target.getRootNode() as ShadowRoot).host as NLDDTable;
			tables.set(table, entry.contentRect.width);
		}
		measureTables(tables);
	});
	sizeObserver.observe(sizer);
}

/** Rows that came or went can make a table wider than its box without
 *  changing its width: all of them read that in one pass. */
const scrollPass = new LayoutPass<NLDDTable>((tables) => {
	const live = tables.filter((table) => table.isConnected);
	const scrollable = live.map((table) => table._readScrollable());
	live.forEach((table, i) => table._applyScrollable(scrollable[i]));
});

// # nldd-table

@customElement('nldd-table')
export class NLDDTable extends LitElement {
	static override styles = tableStyles;

	@property({ reflect: true, converter: reflectNonDefault<TableBackground>('base') })
	background: TableBackground = 'base';

	/** CSS grid track list applied once as the table's columns. */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	columns = '';

	/** Track list when the table is sm-wide (≤640px); falls back to `columns`. */
	@property({ reflect: true, attribute: 'sm-columns', converter: reflectNonDefault<string>('') })
	smColumns = '';

	/** Track list when the table is md-wide (641–1007px); falls back to `columns`. */
	@property({ reflect: true, attribute: 'md-columns', converter: reflectNonDefault<string>('') })
	mdColumns = '';

	/** Track list when the table is lg-wide (≥1008px); falls back to `columns`. */
	@property({ reflect: true, attribute: 'lg-columns', converter: reflectNonDefault<string>('') })
	lgColumns = '';

	@property({ reflect: true, attribute: 'accessible-label', converter: reflectNonDefault<string>('') })
	accessibleLabel = '';

	@property({ type: Object })
	translations: Partial<NLDDTableTranslations> = {};

	/** Opt into row selection. When set, body rows expose aria-selected so
	 *  assistive tech conveys the selection state; without it, rows omit the
	 *  attribute so a non-selectable table isn't announced as selectable
	 *  (ARIA 1.2 §6.6.5). The visual `selected` tint on a row works either way. */
	@property({ type: Boolean, reflect: true })
	selectable = false;

	private _rowsObserver?: MutationObserver;
	/** @internal Last observed content-box width, to resolve the active track list. */
	_width = 0;
	/** An empty-state update waits for the parse; see _scheduleEmpty. */
	private _emptyPending = false;

	public _t(key: keyof NLDDTableTranslations): string {
		return translate(this.translations, nlddTableTranslations, key);
	}

	override connectedCallback(): void {
		super.connectedCallback();
		// display:grid strips native table semantics — restore them for AT.
		this.setAttribute('role', 'table');
		// Cells (VisibilityMixin) hide/show against a container named
		// 'cells-container'. Set it here, like nldd-list, so cell hide-below/
		// hide-above measure the table width (not the row). Inline because
		// Safari ignores container-name set from a shadow stylesheet.
		this.style.containerType = 'inline-size';
		this.style.containerName = 'cells-container';
		// An element can't query its OWN container, so the responsive track list
		// is chosen from the observed width (the cells keep their @container).
		// The same observer keeps the scroll affordance (focusable when the box
		// overflows) in sync. It is shared by every table, see measureTables.
		// It watches the sizer in the shadow root, so from the first render on.
		if (this._sizer) observeSize(this._sizer);
	}

	private get _sizer(): Element | null {
		return this.shadowRoot?.querySelector('.table__sizer') ?? null;
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		if (this._sizer) sizeObserver?.unobserve(this._sizer);
		scrollPass.cancel(this);
		this._rowsObserver?.disconnect();
		this._rowsObserver = undefined;
	}

	override firstUpdated(): void {
		observeSize(this._sizer!);
		// Recompute the empty state when body rows are slotted, added/removed, or
		// toggled [hidden] (consumer-driven filtering) — mirrors nldd-list.
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
		slot?.addEventListener('slotchange', () => this._scheduleEmpty());
		this._rowsObserver = new MutationObserver((mutations) => {
			const relevant = mutations.some((m) => {
				if (m.type === 'childList') return m.target === this;
				if (m.type === 'attributes' && m.attributeName === 'hidden') {
					return m.target instanceof Element && m.target.parentElement === this;
				}
				return false;
			});
			if (relevant) this._scheduleEmpty();
		});
		this._rowsObserver.observe(this, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['hidden'],
		});
		this._updateEmpty();
	}

	/**
	 * While the parser is still adding rows, a slotchange and a mutation come
	 * once per row, and each would walk every row: the empty state waits for
	 * the parse then (see afterParse), and is decided once. After the load it
	 * follows at once, as it always did.
	 */
	private _scheduleEmpty(): void {
		scrollPass.schedule(this, this.ownerDocument);
		if (this._emptyPending) return;
		const run = () => {
			this._emptyPending = false;
			this._updateEmpty();
		};
		this._emptyPending = afterParse(run, this.ownerDocument);
		if (!this._emptyPending) run();
	}

	/** Show the empty-state row when there are no visible body rows (header
	 *  excluded), with the no-results slot when there are rows that are all
	 *  hidden and the empty slot otherwise. Toggled imperatively (like the
	 *  tabindex affordance) so it doesn't schedule a reactive re-render out of
	 *  firstUpdated. The `is-empty` host class drives hiding the header (CSS)
	 *  so only the message shows. */
	private _updateEmpty(): void {
		const empty = this.shadowRoot?.querySelector('.table__empty');
		if (!empty) return;
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
		const rows = (slot?.assignedElements() ?? []).filter(
			(el) => el.localName === 'nldd-table-row',
		);
		const isEmpty = rows.length === 0 || rows.every((row) => row.hasAttribute('hidden'));
		const hasEmpty = !!this.querySelector(':scope > [slot="empty"]');
		const noResults = isEmpty && rows.length > 0 && !!this.querySelector(':scope > [slot="no-results"]');
		empty.toggleAttribute('hidden', !isEmpty);
		this.shadowRoot?.querySelector('slot[name="empty"]')?.toggleAttribute('hidden', noResults);
		this.shadowRoot?.querySelector('slot[name="no-results"]')?.toggleAttribute('hidden', !noResults);
		this.classList.toggle('is-empty', isEmpty);
		// See nldd-list: no rows and nothing slotted is not a thing on the page.
		this.classList.toggle('is-blank', isEmpty && !noResults && !hasEmpty);
		// Rows that are all hidden are the no-results state, not an empty table.
		setState(this, 'empty', isEmpty && rows.length === 0);
		setState(this, 'filtered', isEmpty && rows.length > 0);
	}

	/** The track list for the current width: a breakpoint override when set,
	 *  otherwise the base `columns`. */
	private _activeColumns(fontSize: number): string {
		if (this._width <= breakpointPx('smMax', fontSize)) return this.smColumns || this.columns;
		if (this._width <= breakpointPx('mdMax', fontSize)) return this.mdColumns || this.columns;
		return this.lgColumns || this.columns;
	}

	/** @internal Writes only what changed: a notification for a table whose
	 *  track list stays the same writes nothing to lay out again. */
	_applyColumns(fontSize = rootFontSize()): void {
		const cols = this._activeColumns(fontSize);
		if (cols === this.style.getPropertyValue('--_table-columns')) return;
		if (cols) {
			this.style.setProperty('--_table-columns', cols);
		} else {
			this.style.removeProperty('--_table-columns');
		}
	}

	/** Make the table focusable while it scrolls horizontally so keyboard users
	 *  can pan it (mirrors nldd-code-viewer / nldd-rich-text), and keep its
	 *  accessible name in sync. The table is its own scroll container
	 *  (overflow-x: auto); the overflow-x check (not width alone) is defensive.
	 *  accessible-label is the name (role="table" needs one); when it is absent a
	 *  generic fallback keeps the table (and any focusable region) named.
	 *
	 *  The styles always make the host its own horizontal scroll container
	 *  (overflow-x: auto), so only the widths are read: a getComputedStyle per
	 *  table is a style recalc per table.
	 *  @internal A layout read; writes nothing. */
	_readScrollable(): boolean {
		return this.scrollWidth > this.clientWidth;
	}

	/** @internal */
	_applyScrollable(scrollable: boolean): void {
		if (scrollable) {
			if (this.getAttribute('tabindex') !== '0') this.setAttribute('tabindex', '0');
		} else {
			this.removeAttribute('tabindex');
		}
		// accessible-label is the table's name (role="table" requires one). When
		// it is absent we fall back to a generic name so the table is never
		// nameless — and any focusable scroll region always has a name (SC 4.1.2).
		// A missing label is still DEV-warned to prompt a meaningful one rather
		// than rely on the fallback.
		this._syncLabel();
	}

	/** Also on every render, so the fallback follows a language switch. */
	private _syncLabel(): void {
		const label = this.accessibleLabel || this._t('components.table.accessible-label');
		if (this.getAttribute('aria-label') !== label) this.setAttribute('aria-label', label);
	}

	override updated(changed: Map<string, unknown>): void {
		if (
			changed.has('columns') || changed.has('smColumns')
			|| changed.has('mdColumns') || changed.has('lgColumns')
		) {
			this._applyColumns();
		}
		// Whether the table scrolls does not depend on its name, and the size
		// observer reads it as soon as the table is laid out.
		this._syncLabel();
		if (changed.has('selectable')) {
			// Selectability gates each body row's aria-selected; re-sync them.
			for (const row of this.querySelectorAll<NLDDTableRow>('nldd-table-row')) {
				row._syncAriaSelected();
			}
		}
	}

	override render() {
		return tableTemplate();
	}
}


// # nldd-table-row

@customElement('nldd-table-row')
export class NLDDTableRow extends LitElement {
	static override styles = tableRowStyles;

	/** Selects (highlights) the row. The visual tint applies whenever set; the
	 *  state is also reflected to aria-selected when the parent table is
	 *  `selectable`, so assistive tech conveys it. Consumer-driven (e.g. a
	 *  checkbox cell). */
	@property({ type: Boolean, reflect: true })
	selected = false;

	private _rowHeaderObserver?: MutationObserver;

	override connectedCallback(): void {
		super.connectedCallback();
		// display:grid strips native row semantics — restore them for AT.
		this.setAttribute('role', 'row');
		this._syncAriaSelected();
		// slotchange misses a cell gaining or losing `row-header` later.
		this._rowHeaderObserver = new MutationObserver(() => this._syncCellRoles());
		this._rowHeaderObserver.observe(this, {
			subtree: true,
			attributes: true,
			attributeFilter: ['row-header'],
		});
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._rowHeaderObserver?.disconnect();
		this._rowHeaderObserver = undefined;
	}

	override updated(changed: Map<string, unknown>): void {
		if (changed.has('selected')) {
			this._syncAriaSelected();
		}
	}

	/** A header row lives in the table's `header` slot. */
	private get _isHeader(): boolean {
		return this.getAttribute('slot') === 'header';
	}

	/** Reflect `selected` to aria-selected, but only when the parent table is
	 *  `selectable`, so a non-selectable table doesn't announce a false
	 *  selection affordance (ARIA 1.2 §6.6.5). Header rows are never selectable.
	 *  @internal Re-invoked by the parent table when its `selectable` changes. */
	_syncAriaSelected(): void {
		const selectable = !this._isHeader
			&& this.closest('nldd-table')?.hasAttribute('selectable') === true;
		if (selectable) {
			this.setAttribute('aria-selected', String(this.selected));
		} else {
			this.removeAttribute('aria-selected');
		}
	}

	/** A cell update waits for the parse; see _onSlotChange. */
	private _cellsPending = false;

	/** While the parser adds the cells, a slotchange comes per cell and each
	 *  would walk them all: the row waits for the parse then (see afterParse). */
	private _onSlotChange(): void {
		if (this._cellsPending) return;
		const run = () => {
			this._cellsPending = false;
			this._syncCells();
		};
		this._cellsPending = afterParse(run, this.ownerDocument);
		if (!this._cellsPending) run();
	}

	private _syncCells(): void {
		const slot = this.shadowRoot?.querySelector('slot');
		const cells = slot?.assignedElements() ?? [];
		this._syncCellRoles(cells);
		for (const cell of cells) {
			// A generic nldd-cell defaults to width="fit-content" (reflected),
			// which would shrink-wrap inside a grid track. Default it to fill
			// the column. The reflected default is indistinguishable from an
			// explicit width="fit-content", so both become "full"; an author
			// who set a length or "full" is left untouched.
			if (cell.localName === 'nldd-cell') {
				const w = cell.getAttribute('width');
				if (w === null || w === '' || w === 'fit-content') {
					cell.setAttribute('width', 'full');
				}
			}
			// A title cell's size is unset unless someone chose one. The property
			// covers a size set before the cell reflected it.
			if (
				cell.localName === 'nldd-title-cell'
				&& !cell.hasAttribute('size')
				&& (cell as HTMLElement & { size?: string }).size === undefined
			) {
				cell.setAttribute('size', 'display-6');
			}
		}
	}

	/** Cells need explicit roles since the grid layout drops native table
	 *  semantics. A header row's cells are column headers whatever they say,
	 *  so the cell above a row-header column stays a columnheader. */
	private _syncCellRoles(cells = this.shadowRoot?.querySelector('slot')?.assignedElements() ?? []): void {
		const header = this._isHeader;
		for (const cell of cells) {
			let role = 'cell';
			if (header) role = 'columnheader';
			else if (cell.hasAttribute('row-header')) role = 'rowheader';
			if (cell.getAttribute('role') !== role) cell.setAttribute('role', role);
		}
	}

	override render() {
		return tableRowTemplate(this._onSlotChangeBound);
	}

	private _onSlotChangeBound = this._onSlotChange.bind(this);
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-table': NLDDTable;
		'nldd-table-row': NLDDTableRow;
	}
}
