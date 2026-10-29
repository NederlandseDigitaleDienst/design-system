/**
 * One column of an `nldd-task-board`: a header and the items under it. The items
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
 * board.
 *
 * @element nldd-task-board-column
 * @attr {string} text - The column's name, shown in the header and used as its accessible name
 * @attr {string} accessible-label - Accessible name in place of `text`, for a column whose header comes from the slot
 * @attr {string} value - What the column stands for in your data, such as a status; `nldd-move` reports it as `fromColumn` and `toColumn`
 *
 * @slot header - The header, in place of `text` and the count
 * @slot - The items
 * @slot footer - Right under the last item, such as a button to add one; it scrolls along with the items
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { taskBoardColumnStyles } from './task-board.styles.js';
import { taskBoardColumnTemplate } from './task-board.template.js';

@customElement('nldd-task-board-column')
export class NLDDTaskBoardColumn extends LitElement {
	static override styles = taskBoardColumnStyles;

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

	@query('.task-board-column__body')
	private _bodyElement!: HTMLElement;

	@query('.task-board-column__drop-indicator')
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
	get _body(): HTMLElement {
		return this._bodyElement;
	}

	/** @internal */
	_handleSlotChange(): void {
		this._count = this.items.length;
	}

	/** @internal */
	_handleFooterChange(event: Event): void {
		this._hasFooter = (event.target as HTMLSlotElement).assignedNodes().length > 0;
	}

	protected override firstUpdated(): void {
		if (import.meta.env?.DEV && !this.label) {
			console.warn('nldd-task-board-column: a column needs `text` or `accessible-label`; it is what a screen reader hears when an item moves to it.');
		}
	}

	protected override updated(changed: PropertyValues): void {
		if (changed.has('_dropIndex')) this._placeIndicator();
		if (changed.has('_placeholder')) this._placePlaceholder();
	}

	/** Lays the placeholder over the empty place of the dragged item. */
	private _placePlaceholder(): void {
		const item = this._placeholder;
		const placeholder = this.shadowRoot?.querySelector<HTMLElement>('.task-board-column__placeholder');
		if (!item || !placeholder) return;
		const body = this._bodyElement.getBoundingClientRect();
		const rect = item.getBoundingClientRect();
		placeholder.style.setProperty('--_task-board-column-placeholder-top', `${rect.top - body.top + this._bodyElement.scrollTop}px`);
		placeholder.style.setProperty('--_task-board-column-placeholder-left', `${rect.left - body.left + this._bodyElement.scrollLeft}px`);
		placeholder.style.setProperty('--_task-board-column-placeholder-width', `${rect.width}px`);
		placeholder.style.setProperty('--_task-board-column-placeholder-height', `${rect.height}px`);
	}

	/** Puts the line between the items where a dropped item would land. */
	private _placeIndicator(): void {
		if (this._dropIndex === null || !this._indicator) return;
		const items = this.items;
		const body = this._bodyElement.getBoundingClientRect();
		const gap = parseFloat(getComputedStyle(this._bodyElement).rowGap) || 0;
		const before = items[this._dropIndex];
		const after = items[this._dropIndex - 1];
		let top: number;
		if (before) top = before.getBoundingClientRect().top - gap / 2;
		else if (after) top = after.getBoundingClientRect().bottom + gap / 2;
		else top = body.top + parseFloat(getComputedStyle(this._bodyElement).paddingTop);
		this._indicator.style.setProperty('--_task-board-column-indicator-top', `${top - body.top + this._bodyElement.scrollTop}px`);
	}

	override render() {
		return taskBoardColumnTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-task-board-column': NLDDTaskBoardColumn;
	}
}
