/**
 * One column of an `nldd-kanban`: a header and the items under it. The items
 * are whatever you put in the column, usually an `nldd-card` each; the board
 * moves them between columns.
 *
 * Without a `header` slot the column shows its `text` and the number of items.
 * With one, the header is yours: an `nldd-title`, a button to add an item, a
 * badge. `text` stays the column's name either way: it is what a screen reader
 * hears when an item moves here ("Verplaatst naar In behandeling"), so set it,
 * or `accessible-label`, also when the header comes from the slot.
 *
 * The column scrolls on its own once its items do not fit the height of the
 * board, and fades at the top or the bottom while there is more to scroll to.
 *
 * @element nldd-kanban-column
 * @attr {string} text - The column's name, shown in the header and used as its accessible name
 * @attr {string} accessible-label - Accessible name in place of `text`, for a column whose header comes from the slot
 * @attr {string} value - What the column stands for in your data, such as a status; `move` reports it as `fromColumn` and `toColumn`
 *
 * @slot header - The header, in place of `text` and the count
 * @slot - The items
 * @slot footer - Right under the last item, such as a button to add one; it scrolls along with the items
 */
import { LitElement, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { kanbanColumnStyles } from './kanban.styles.js';
import { kanbanColumnTemplate } from './kanban-column.template.js';
import { afterParse } from '../../../utilities/after-parse.js';
import { LayoutPass, sharedResizeObserver } from '../../../utilities/layout-pass.js';

/* The fades are a layout read. Measured per column after each one wrote, a
 * board lays out once per column; in one pass, once. */
const scrollPass = new LayoutPass<NLDDKanbanColumn>((columns) => {
	for (const column of columns) column._updateScroll();
});
const scrollObserver = sharedResizeObserver<NLDDKanbanColumn>((columns) => {
	for (const column of columns) column._updateScroll();
});

@customElement('nldd-kanban-column')
export class NLDDKanbanColumn extends LitElement {
	static override styles = kanbanColumnStyles;

	@property({ reflect: true, converter: reflectNonDefault('') })
	text = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ reflect: true, converter: reflectNonDefault('') })
	value = '';

	/** @internal How many items the column holds, for the count in the header. */
	@state() _count = 0;

	/** @internal Whether the footer slot holds anything, so an empty one takes no room. */
	@state() _hasFooter = false;

	/** @internal Where the board shows a dragged item would land, or null. */
	@state() _dropIndex: number | null = null;

	/** @internal The item dragged out of this column, whose empty place shows a
	 *  placeholder of its size and rounding. */
	@state() _placeholder: HTMLElement | null = null;

	/** @internal Whether a drop would put the dragged item back in its place,
	 *  which the placeholder then shows in place of the line. */
	@state() _returning = false;

	/** @internal While an item is dragged: whether this column is the one under
	 *  the pointer, or one it could go to. */
	@state() _dropState: 'available' | 'over' | null = null;

	/** @internal Whether there is more to scroll to above or below, for the fades. */
	@state() _canScrollUp = false;
	@state() _canScrollDown = false;

	@query('.kanban-column__main')
	private _mainElement!: HTMLElement;

	private _observing = false;
	private _observedItems: HTMLElement[] | null = null;
	private _itemsPending = false;

	@query('.kanban-column__drop-indicator')
	private _indicator!: HTMLElement;

	/** The column's name: what a screen reader hears for it. */
	get label(): string {
		return this.accessibleLabel || this.text;
	}

	/** The column's items, in order; a hidden one does not count. */
	get items(): HTMLElement[] {
		return Array.from(this.children).filter((el): el is HTMLElement => el instanceof HTMLElement && !el.slot && !el.hidden);
	}

	/** @internal The element that scrolls the items. */
	get _main(): HTMLElement {
		return this._mainElement;
	}

	/** @internal Each pass walks every item, so while the parser is still
	 *  adding items it waits for the parse (see afterParse): once per item it
	 *  is quadratic. */
	_handleSlotChange(): void {
		if (this._itemsPending) return;
		this._itemsPending = true;
		if (!afterParse(this._refreshItems, this.ownerDocument)) this._refreshItems();
	}

	private _refreshItems = (): void => {
		this._itemsPending = false;
		const items = this.items;
		this._count = items.length;
		this._observeItems(items);
		scrollPass.schedule(this, this.ownerDocument);
	};

	/** @internal */
	_updateScroll = (): void => {
		const main = this._mainElement;
		if (!main) return;
		this._canScrollUp = main.scrollTop > 1;
		this._canScrollDown = main.scrollTop < main.scrollHeight - main.clientHeight - 1;
	};

	/** The main area changes size with the board, and its content with the items. */
	private _observeItems(items = this.items): void {
		if (!this._observing || !this._mainElement) return;
		// Observing again reports every item again: skip it when nothing changed.
		const observed = this._observedItems;
		if (observed && observed.length === items.length && observed.every((item, i) => item === items[i])) return;
		this._observedItems = items;
		scrollObserver.unobserveAll(this);
		scrollObserver.observe(this._mainElement, this);
		for (const item of items) scrollObserver.observe(item, this);
		const footer = this.shadowRoot?.querySelector('.kanban-column__footer');
		if (footer) scrollObserver.observe(footer, this);
	}

	override connectedCallback(): void {
		super.connectedCallback();
		if (this.hasUpdated && !this._observing) {
			this._observing = true;
			this._observeItems();
		}
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		scrollObserver.unobserveAll(this);
		scrollPass.cancel(this);
		this._observing = false;
		this._observedItems = null;
	}

	/** @internal */
	_handleFooterChange(event: Event): void {
		this._hasFooter = (event.target as HTMLSlotElement).assignedNodes().length > 0;
	}

	protected override firstUpdated(): void {
		this._observing = true;
		this._observeItems();
	}

	protected override updated(changed: PropertyValues): void {
		if (changed.has('_dropIndex')) this._placeIndicator();
		if (changed.has('_placeholder')) this._placePlaceholder();
	}

	/** Lays the placeholder over the empty place of the dragged item. */
	private _placePlaceholder(): void {
		const item = this._placeholder;
		const placeholder = this.shadowRoot?.querySelector<HTMLElement>('.kanban-column__placeholder');
		if (!item || !placeholder) return;
		const main = this._mainElement.getBoundingClientRect();
		const rect = item.getBoundingClientRect();
		placeholder.style.setProperty('--_kanban-column-placeholder-top', `${rect.top - main.top + this._mainElement.scrollTop}px`);
		placeholder.style.setProperty('--_kanban-column-placeholder-left', `${rect.left - main.left + this._mainElement.scrollLeft}px`);
		placeholder.style.setProperty('--_kanban-column-placeholder-width', `${rect.width}px`);
		placeholder.style.setProperty('--_kanban-column-placeholder-height', `${rect.height}px`);
	}

	/** Puts the line between the items where a dropped item would land. */
	private _placeIndicator(): void {
		if (this._dropIndex === null || !this._indicator) return;
		const items = this.items;
		const main = this._mainElement.getBoundingClientRect();
		const gap = parseFloat(getComputedStyle(this._mainElement).rowGap) || 0;
		const before = items[this._dropIndex];
		const after = items[this._dropIndex - 1];
		let top: number;
		if (before) top = before.getBoundingClientRect().top - gap / 2;
		else if (after) top = after.getBoundingClientRect().bottom + gap / 2;
		else top = main.top + parseFloat(getComputedStyle(this._mainElement).paddingTop);
		this._indicator.style.setProperty('--_kanban-column-indicator-top', `${top - main.top + this._mainElement.scrollTop}px`);
	}

	override render() {
		return kanbanColumnTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-kanban-column': NLDDKanbanColumn;
	}
}
