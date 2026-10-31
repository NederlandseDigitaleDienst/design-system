/**
 * Nederlandse Digitale Dienst Task Board Component (Lit + TypeScript)
 *
 * Columns side by side, with items you move between them: a kanban board, or
 * any board where an item's column is one of its values, such as a status or a
 * team. Put `nldd-task-board-column`s in it, and the items in those, usually an
 * `nldd-card` each. The board scrolls sideways once its columns do not fit, and
 * a column scrolls on its own once its items do not fit the height you give the
 * board.
 *
 * An item moves in three ways, and all three fire the same `nldd-move`:
 *
 * - **Dragging.** Pick up the whole item and drop it in a column. A press that
 *   does not move is still a click, so an item that is a link or a button keeps
 *   working. Released outside the board, the item goes back to its place, which
 *   a note above it says once it stays out a moment. On a touch screen you hold the item a moment before it lifts, so a
 *   swipe still scrolls.
 * - **Keyboard.** With focus on an item, or on something inside it, Alt with
 *   the up or down arrow moves it within its column, and Alt with the left or
 *   right arrow to the column beside it.
 * - **`moveItem()`.** WCAG 2.5.7 asks for a way that does not drag. Give each
 *   item a menu "Verplaatsen naar" with the other columns (`columns` lists them)
 *   and call `moveItem()` from it. The menu is yours; the board only moves.
 *
 * With `readonly` nothing moves: no dragging and no Alt with the arrows, while
 * the items still work, so a card still opens. Use it for someone who may only
 * look, or a board that is closed. `moveItem()` still moves, so your app can
 * still show a move someone else made. An attempt to move an item, dragging it
 * past a click or Alt with an arrow, shows "Dit bord is alleen-lezen" at the
 * item, says it to a screen reader and fires `nldd-move-denied`, so your app
 * can say why in an `nldd-notification`. Say it above the board too: only
 * your app knows the reason, and then nobody has to try.
 *
 * The board moves nothing itself. `nldd-move` says which item goes where, and
 * your app moves it in its data, or in the DOM, in the handler: the app owns the
 * order, so a framework that renders the columns never fights the board over
 * them. `toIndex` is the place the item takes in `toColumn`, counted without
 * the item itself, so `splice(fromIndex, 1)` on the one list and
 * `splice(toIndex, 0, item)` on the other is the whole move. Move it
 * synchronously in the handler: the board puts focus back on the item right
 * after, and a screen reader hears where it landed.
 *
 * @element nldd-task-board
 * @attr {string} accessible-label - Accessible name of the board (default: "Takenbord")
 * @attr {string} height - Fixed height as a CSS length (e.g. '480px'): every column takes it, and scrolls its items once they do not fit. To fill a page or a pane, set the height in your layout instead (flex, or `height: 100%`)
 * @attr {boolean} readonly - Items cannot be dragged or moved with the keyboard; they still work, and `moveItem()` still moves
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @slot - The columns: `nldd-task-board-column`
 *
 * @fires nldd-move - An item moves: `{ item, fromColumn, fromIndex, toColumn, toIndex }`, where a column is its `value` (or its `text` without one)
 * @fires nldd-move-denied - An item a `readonly` board does not move was dragged or moved with the keyboard: `{ item }`
 *
 * @method moveItem(item, toColumn, toIndex?) - Moves an item to a column, given as its `value` or as the element, at `toIndex` or at the end; fires `nldd-move` and says where it landed. Returns whether it moved.
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddTaskBoardTranslations } from './task-board.i18n.js';
import { taskBoardStyles } from './task-board.styles.js';
import { taskBoardTemplate } from './task-board.template.js';
import { NLDDTaskBoardColumn } from './task-board-column.js';
import { setState } from '../../../utilities/element-state.js';

export { NLDDTaskBoardColumn };

export interface NLDDMoveEventDetail {
	item: HTMLElement;
	fromColumn: string;
	fromIndex: number;
	toColumn: string;
	toIndex: number;
}

/** How far a mouse or pen moves before a press becomes a drag, in pixels. */
const DRAG_THRESHOLD = 4;
/** How far a finger may wander while it holds an item, and how long it holds. */
const TOUCH_SLOP = 8;
const TOUCH_HOLD_MS = 300;
/** How close to an edge the pointer scrolls the board or a column, and how fast. */
const SCROLL_EDGE = 48;
const SCROLL_SPEED = 12;
/** How long the note at an item a readonly board did not move stays. */
const DENIED_MS = 1500;
/** How long the pointer stays outside the board before the copy says it goes back. */
const RETURN_NOTE_DELAY_MS = 300;

interface Press {
	item: HTMLElement;
	pointerId: number;
	pointerType: string;
	startX: number;
	startY: number;
	timer: number;
	denied?: boolean;
}

interface Drag {
	item: HTMLElement;
	from: NLDDTaskBoardColumn;
	fromIndex: number;
	ghost: HTMLElement;
	offsetX: number;
	offsetY: number;
	x: number;
	y: number;
	target: NLDDTaskBoardColumn | null;
	index: number;
	frame: number;
	/** The note above the copy outside the board, and the wait before it shows. */
	note: HTMLElement | null;
	noteTimer: number;
}

@customElement('nldd-task-board')
export class NLDDTaskBoard extends withTranslations(LitElement, nlddTaskBoardTranslations) {
	static override styles = taskBoardStyles;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: String, reflect: true })
	height = '';

	@property({ type: Boolean, reflect: true })
	readonly = false;

	@query('.task-board')
	private _scroller!: HTMLElement;

	/** @internal Whether there is more to scroll to on that side, for the fades. */
	@state() _canScrollLeft = false;
	@state() _canScrollRight = false;

	/** @internal While an item is dragged. */
	@state() _dragging = false;

	private _scrollObserver: ResizeObserver | null = null;

	private _press: Press | null = null;
	private _drag: Drag | null = null;
	/** The layer that shows the grabbing cursor wherever the pointer is. */
	private _grabbing: HTMLElement | null = null;
	/** The note at an item a readonly board did not move, and its own cursor layer. */
	private _deniedNote: HTMLElement | null = null;
	private _deniedCursor: HTMLElement | null = null;
	private _deniedTimer = 0;

	/** The columns, in order. */
	get columns(): NLDDTaskBoardColumn[] {
		return Array.from(this.children).filter((el): el is NLDDTaskBoardColumn => el instanceof NLDDTaskBoardColumn && !el.hidden);
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('pointerdown', this._onPointerDown);
		this.addEventListener('keydown', this._onKeyDown);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('pointerdown', this._onPointerDown);
		this.removeEventListener('keydown', this._onKeyDown);
		this._scrollObserver?.disconnect();
		this._scrollObserver = null;
		this._endPress();
		this._endDrag();
		this._hideDenied();
	}

	protected override updated(changed: PropertyValues<this>): void {
		if (changed.has('height')) {
			const height = this.height;
			if (height && CSS.supports('height', height)) this.style.setProperty('--_task-board-height', height);
			else this.style.removeProperty('--_task-board-height');
		}
		if (changed.has('readonly')) {
			this._endPress();
			this._cancelDrag();
			this._hideDenied();
		}
		if (!this._scrollObserver && this._scroller) {
			this._scrollObserver = new ResizeObserver(() => this._updateScroll());
			this._scrollObserver.observe(this._scroller);
			for (const column of this.columns) this._scrollObserver.observe(column);
		}
	}

	/** @internal Which sides have more to scroll to, by the physical side, so a
	 *  right-to-left page fades the right one first. */
	_updateScroll = (): void => {
		const el = this._scroller;
		if (!el) return;
		const max = el.scrollWidth - el.clientWidth;
		const position = Math.abs(el.scrollLeft);
		const rtl = getComputedStyle(this).direction === 'rtl';
		const before = position > 1;
		const after = position < max - 1;
		this._canScrollLeft = rtl ? after : before;
		this._canScrollRight = rtl ? before : after;
	};

	moveItem(item: HTMLElement, toColumn: string | NLDDTaskBoardColumn, toIndex?: number): boolean {
		const from = this._columnOf(item);
		const to = typeof toColumn === 'string'
			? this.columns.find((column) => this._columnKey(column) === toColumn)
			: toColumn;
		if (!from || !to || !this.columns.includes(to)) {
			setState(this, 'invalid-move', true);
			return false;
		}
		const fromIndex = from.items.indexOf(item);
		const room = to.items.filter((el) => el !== item).length;
		const index = Math.max(0, Math.min(toIndex ?? room, room));
		if (from === to && index === fromIndex) {
			this._announce(this._t('components.task-board.no-change-text'));
			return false;
		}
		return this._move(item, from, fromIndex, to, index);
	}

	/** Fires nldd-move, says where the item landed and puts focus back on what
	 *  had it, once the app has moved the item in the handler. */
	private _move(item: HTMLElement, from: NLDDTaskBoardColumn, fromIndex: number, to: NLDDTaskBoardColumn, toIndex: number): boolean {
		const focused = this._deepActiveElement();
		const hadFocus = !!focused && this._holds(item, focused);
		this.dispatchEvent(new CustomEvent<NLDDMoveEventDetail>('nldd-move', {
			detail: { item, fromColumn: this._columnKey(from), fromIndex, toColumn: this._columnKey(to), toIndex },
			bubbles: true,
			composed: true,
		}));
		const total = to.items.filter((el) => el !== item).length + 1;
		this._announce(this._t('components.task-board.moved-text', { column: to.label, position: toIndex + 1, total }));
		if (hadFocus) {
			// The app moved the item in the handler, which takes focus off it.
			requestAnimationFrame(() => {
				if (focused.isConnected) focused.focus();
			});
		}
		return true;
	}

	private _columnKey(column: NLDDTaskBoardColumn): string {
		return column.value || column.text;
	}

	/** The column an element sits in as an item, if it is one in this board. */
	private _columnOf(item: Element): NLDDTaskBoardColumn | null {
		const parent = item.parentElement;
		return parent instanceof NLDDTaskBoardColumn && parent.parentElement === this && !item.slot ? parent : null;
	}

	/** The item an event happened in: the child of a column it came through. */
	private _itemFrom(event: Event): HTMLElement | null {
		for (const node of event.composedPath()) {
			if (node instanceof HTMLElement && this._columnOf(node)) return node;
			if (node === this) break;
		}
		return null;
	}

	/** Whether `node` is in `item`, also inside the shadow root of an item such
	 *  as an nldd-card, where its own button takes the focus. */
	private _holds(item: HTMLElement, node: Node): boolean {
		let current: Node | null = node;
		while (current) {
			if (current === item) return true;
			current = current.parentNode ?? (current instanceof ShadowRoot ? current.host : null);
		}
		return false;
	}

	private _deepActiveElement(): HTMLElement | null {
		let active: Element | null = document.activeElement;
		while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
		return active instanceof HTMLElement ? active : null;
	}

	private _announce(message: string): void {
		const region = this.shadowRoot?.querySelector<HTMLElement>('.task-board__announcer');
		if (!region) return;
		region.textContent = '';
		// Two frames, so a screen reader registers the change even for the same text.
		requestAnimationFrame(() => requestAnimationFrame(() => {
			region.textContent = message;
		}));
	}


	// — Keyboard ————————————————————————————————————————————————————————

	private _onKeyDown = (event: KeyboardEvent): void => {
		if (this._drag || !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
		if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
		const origin = event.composedPath()[0];
		if (origin instanceof HTMLElement && (origin.isContentEditable || origin.matches('input, textarea, select'))) return;
		const item = this._itemFrom(event);
		const from = item && this._columnOf(item);
		if (!item || !from) return;
		event.preventDefault();
		if (this.readonly) {
			this._deny(item);
			this._deniedTimer = window.setTimeout(() => this._hideDenied(), DENIED_MS);
			return;
		}

		const columns = this.columns;
		const fromIndex = from.items.indexOf(item);
		const rtl = getComputedStyle(this).direction === 'rtl';
		const step = { ArrowUp: 0, ArrowDown: 0, ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[event.key] ?? 0;
		if (step === 0) {
			const toIndex = fromIndex + (event.key === 'ArrowUp' ? -1 : 1);
			if (toIndex < 0 || toIndex > from.items.length - 1) {
				this._announce(this._t('components.task-board.edge-text'));
				return;
			}
			this._move(item, from, fromIndex, from, toIndex);
			return;
		}
		const to = columns[columns.indexOf(from) + step];
		if (!to) {
			this._announce(this._t('components.task-board.edge-text'));
			return;
		}
		this._move(item, from, fromIndex, to, Math.min(fromIndex, to.items.length));
	};


	// — Pointer —————————————————————————————————————————————————————————

	private _onPointerDown = (event: PointerEvent): void => {
		if (this._press || this._drag || !event.isPrimary || event.button !== 0) return;
		const origin = event.composedPath()[0];
		if (origin instanceof HTMLElement && (origin.isContentEditable || origin.matches('input, textarea, select'))) return;
		const item = this._itemFrom(event);
		if (!item) return;
		this._press = {
			item,
			pointerId: event.pointerId,
			pointerType: event.pointerType,
			startX: event.clientX,
			startY: event.clientY,
			timer: event.pointerType === 'touch'
				? window.setTimeout(() => this._startDrag(this._press!.startX, this._press!.startY), TOUCH_HOLD_MS)
				: 0,
		};
		window.addEventListener('pointermove', this._onPointerMove);
		window.addEventListener('pointerup', this._onPointerUp);
		window.addEventListener('pointercancel', this._onPointerCancel);
		// A mouse that moves with its button down selects text before it reaches
		// the drag threshold, and that selection would run over the dragged copy.
		window.addEventListener('selectstart', this._preventSelect);
	};

	private _preventSelect = (event: Event): void => {
		event.preventDefault();
	};

	private _onPointerMove = (event: PointerEvent): void => {
		const press = this._press;
		if (press && event.pointerId === press.pointerId && !this._drag && !press.denied) {
			const distance = Math.hypot(event.clientX - press.startX, event.clientY - press.startY);
			if (press.pointerType === 'touch') {
				// A finger that moves before the hold is up is scrolling.
				if (distance > TOUCH_SLOP) this._endPress();
				return;
			}
			if (distance > DRAG_THRESHOLD) this._startDrag(event.clientX, event.clientY);
		}
		const drag = this._drag;
		if (!drag) return;
		drag.x = event.clientX;
		drag.y = event.clientY;
		this._follow();
	};

	private _onPointerUp = (event: PointerEvent): void => {
		const dragged = !!this._drag;
		const denied = this._press?.pointerId === event.pointerId && !!this._press.denied;
		if (dragged) this._drop();
		if (dragged || denied) this._swallowNextClick();
		if (this._press?.pointerId === event.pointerId) this._endPress();
	};

	private _onPointerCancel = (): void => {
		if (this._drag) this._cancelDrag();
		this._endPress();
	};

	/** The release ends a drag, or an attempt at one, not a click on the item. */
	private _swallowNextClick(): void {
		window.addEventListener('click', this._swallowClick, { capture: true, once: true });
		setTimeout(() => window.removeEventListener('click', this._swallowClick, { capture: true }), 0);
	}

	private _swallowClick = (event: MouseEvent): void => {
		event.preventDefault();
		event.stopPropagation();
	};

	/** While a finger holds an item, the page must not scroll under it. */
	private _holdTouch = (event: TouchEvent): void => {
		event.preventDefault();
	};

	private _preventContextMenu = (event: Event): void => {
		event.preventDefault();
	};

	/** Escape drops nothing, wherever focus is while dragging. */
	private _onDragKeyDown = (event: KeyboardEvent): void => {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		event.stopPropagation();
		this._cancelDrag();
	};

	private _endPress(): void {
		if (this._press?.timer) clearTimeout(this._press.timer);
		if (this._press?.denied) {
			this._deniedCursor?.remove();
			this._deniedCursor = null;
			this._deniedTimer = window.setTimeout(() => this._hideDenied(), DENIED_MS);
		}
		this._press = null;
		if (!this._drag) this._stopListening();
	}

	private _stopListening(): void {
		window.removeEventListener('selectstart', this._preventSelect);
		window.removeEventListener('pointermove', this._onPointerMove);
		window.removeEventListener('pointerup', this._onPointerUp);
		window.removeEventListener('pointercancel', this._onPointerCancel);
	}

	private _startDrag(x: number, y: number): void {
		const press = this._press;
		const from = press && this._columnOf(press.item);
		if (!press || !from) return;
		if (this.readonly) {
			press.denied = true;
			this._deny(press.item);
			this._deniedCursor = this._cursorLayer('not-allowed');
			return;
		}
		const item = press.item;
		const rect = item.getBoundingClientRect();
		const ghost = item.cloneNode(true) as HTMLElement;
		ghost.removeAttribute('id');
		// A copy carries the state attributes of the item, such as the focus ring
		// and the pressed fill an nldd-card draws from them; the ghost is its rest.
		for (const name of ghost.getAttributeNames()) {
			if (/focus|press|hover|active/i.test(name)) ghost.removeAttribute(name);
		}
		ghost.setAttribute('aria-hidden', 'true');
		ghost.inert = true;
		Object.assign(ghost.style, {
			position: 'fixed',
			top: '0',
			left: '0',
			zIndex: '2147483647',
			width: `${rect.width}px`,
			height: `${rect.height}px`,
			margin: '0',
			boxSizing: 'border-box',
			pointerEvents: 'none',
			userSelect: 'none',
			boxShadow: 'var(--semantics-overlays-box-shadow)',
			borderRadius: this._cornerRadius(item),
		});
		document.body.append(ghost);
		item.setAttribute('data-task-board-dragging', '');
		document.getSelection()?.removeAllRanges();
		document.documentElement.style.setProperty('user-select', 'none');
		document.documentElement.style.setProperty('-webkit-user-select', 'none');
		window.addEventListener('touchmove', this._holdTouch, { passive: false });
		window.addEventListener('contextmenu', this._preventContextMenu);
		window.addEventListener('keydown', this._onDragKeyDown, true);
		for (const column of this.columns) column._dropState = 'available';
		from._placeholder = item;
		this._grabbing = this._cursorLayer('grabbing');
		this._dragging = true;
		this._drag = {
			item,
			from,
			fromIndex: from.items.indexOf(item),
			ghost,
			offsetX: press.startX - rect.left,
			offsetY: press.startY - rect.top,
			x,
			y,
			target: null,
			index: 0,
			frame: requestAnimationFrame(this._scrollLoop),
			note: null,
			noteTimer: 0,
		};
		this._follow();
	}

	/** The rounding of what an item draws: its own, or that of the first element
	 *  in its shadow root, where an nldd-card draws its surface. */
	private _cornerRadius(item: HTMLElement): string {
		const own = getComputedStyle(item).borderRadius;
		const surface = item.shadowRoot?.firstElementChild;
		if (parseFloat(own) > 0 || !surface) return own;
		return getComputedStyle(surface).borderRadius;
	}

	/** Moves the ghost with the pointer and shows where it would land. */
	private _follow(): void {
		const drag = this._drag;
		if (!drag) return;
		drag.ghost.style.transform = `translate(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px) rotate(2deg)`;
		const columns = this.columns;
		let target: NLDDTaskBoardColumn | null = null;
		let nearest = Infinity;
		// Outside the board nothing takes the item: a release there puts it back.
		const board = this._scroller.getBoundingClientRect();
		const inside = drag.x >= board.left && drag.x <= board.right && drag.y >= board.top && drag.y <= board.bottom;
		for (const column of inside ? columns : []) {
			const rect = column.getBoundingClientRect();
			const distance = drag.x < rect.left ? rect.left - drag.x : drag.x > rect.right ? drag.x - rect.right : 0;
			if (distance < nearest) {
				nearest = distance;
				target = column;
			}
		}
		// A place among all the column's items, the dragged one included, so the
		// line shows above or below its own place as the pointer crosses its middle.
		const items = target ? target.items : [];
		let index = items.findIndex((el) => {
			const rect = el.getBoundingClientRect();
			return drag.y < rect.top + rect.height / 2;
		});
		if (index === -1) index = items.length;
		if (drag.target && drag.target !== target) {
			drag.target._dropIndex = null;
			drag.target._dropState = 'available';
		}
		drag.target = target;
		drag.index = index;
		// Outside the board, or just above or below its own place, a release puts
		// the item back where it was: the placeholder says so, not a line.
		const returning = !target || (target === drag.from && (index === drag.fromIndex || index === drag.fromIndex + 1));
		drag.from._returning = returning;
		if (target) {
			target._dropIndex = returning ? null : index;
			target._dropState = 'over';
		}
		this._followReturnNote(inside);
	}

	/** Outside the board, after a moment, a note above the copy says a release
	 *  puts the item back; the placeholder that says so may be out of view. */
	private _followReturnNote(inside: boolean): void {
		const drag = this._drag;
		if (!drag) return;
		if (inside) {
			clearTimeout(drag.noteTimer);
			drag.noteTimer = 0;
			drag.note?.remove();
			drag.note = null;
			return;
		}
		if (!drag.note && !drag.noteTimer) {
			drag.noteTimer = window.setTimeout(() => {
				if (this._drag !== drag) return;
				drag.note = this._note(this._t('components.task-board.drag-return-text'));
				this._followReturnNote(false);
			}, RETURN_NOTE_DELAY_MS);
		}
		if (!drag.note) return;
		const x = drag.x - drag.offsetX + drag.ghost.offsetWidth / 2;
		const y = drag.y - drag.offsetY;
		drag.note.style.transform = `translate(${x}px, ${y}px) translate(-50%, calc(-100% - var(--primitives-space-8)))`;
	}

	/** Scrolls the board sideways, and the column under the pointer, while the
	 *  pointer is near an edge. */
	private _scrollLoop = (): void => {
		const drag = this._drag;
		if (!drag) return;
		const board = this._scroller.getBoundingClientRect();
		const dx = drag.x < board.left + SCROLL_EDGE ? -SCROLL_SPEED : drag.x > board.right - SCROLL_EDGE ? SCROLL_SPEED : 0;
		if (dx) this._scroller.scrollBy({ left: dx, behavior: 'instant' });
		const main = drag.target?._main;
		if (main) {
			const rect = main.getBoundingClientRect();
			const dy = drag.y < rect.top + SCROLL_EDGE ? -SCROLL_SPEED : drag.y > rect.bottom - SCROLL_EDGE ? SCROLL_SPEED : 0;
			if (dy) main.scrollTop += dy;
		}
		if (dx || main) this._follow();
		drag.frame = requestAnimationFrame(this._scrollLoop);
	};

	private _drop(): void {
		const drag = this._drag;
		if (!drag) return;
		const { item, from, fromIndex, target, index } = drag;
		this._endDrag();
		if (!target) {
			this._announce(this._t('components.task-board.drag-canceled-text'));
			return;
		}
		// Just above or just below its own place is where it already is.
		if (target === from && (index === fromIndex || index === fromIndex + 1)) {
			this._announce(this._t('components.task-board.no-change-text'));
			return;
		}
		this._move(item, from, fromIndex, target, target === from && index > fromIndex ? index - 1 : index);
	}

	private _cancelDrag(): void {
		if (!this._drag) return;
		this._endDrag();
		this._announce(this._t('components.task-board.drag-canceled-text'));
	}

	private _endDrag(): void {
		const drag = this._drag;
		if (!drag) return;
		cancelAnimationFrame(drag.frame);
		clearTimeout(drag.noteTimer);
		drag.note?.remove();
		drag.ghost.remove();
		drag.item.removeAttribute('data-task-board-dragging');
		if (drag.target) drag.target._dropIndex = null;
		for (const column of this.columns) column._dropState = null;
		drag.from._placeholder = null;
		drag.from._returning = false;
		this._grabbing?.remove();
		this._grabbing = null;
		document.documentElement.style.removeProperty('user-select');
		document.documentElement.style.removeProperty('-webkit-user-select');
		window.removeEventListener('touchmove', this._holdTouch);
		window.removeEventListener('contextmenu', this._preventContextMenu);
		window.removeEventListener('keydown', this._onDragKeyDown, true);
		this._dragging = false;
		this._drag = null;
		if (!this._press) this._stopListening();
	}

	/** A style in the document does not reach into shadow roots, where a
	 *  button or a link sets its own cursor. A layer over the whole viewport
	 *  does: the pointer is always over it. */
	private _cursorLayer(cursor: string): HTMLElement {
		const layer = document.createElement('div');
		layer.setAttribute('aria-hidden', 'true');
		Object.assign(layer.style, {
			position: 'fixed',
			inset: '0',
			zIndex: '2147483646',
			cursor,
		});
		document.body.append(layer);
		return layer;
	}

	// — Readonly ————————————————————————————————————————————————————————

	/** Says at the item, and to a screen reader, that the board moves nothing,
	 *  and tells the app. */
	private _deny(item: HTMLElement): void {
		this._hideDenied();
		const text = this._t('components.task-board.readonly-text');
		this._announce(text);
		const rect = item.getBoundingClientRect();
		const below = rect.top < SCROLL_EDGE;
		const note = this._note(text);
		Object.assign(note.style, {
			top: `${below ? rect.bottom : rect.top}px`,
			left: `${rect.left + rect.width / 2}px`,
			transform: `translate(-50%, ${below ? 'var(--primitives-space-8)' : 'calc(-100% - var(--primitives-space-8))'})`,
			maxWidth: `${rect.width}px`,
		});
		this._deniedNote = note;
		this.dispatchEvent(new CustomEvent('nldd-move-denied', { detail: { item }, bubbles: true, composed: true }));
	}

	/** A note in the look of a tooltip, over everything, for the eye only: what
	 *  it says, the board also says to a screen reader or in its own way. */
	private _note(text: string): HTMLElement {
		const note = document.createElement('div');
		note.setAttribute('aria-hidden', 'true');
		note.textContent = text;
		Object.assign(note.style, {
			position: 'fixed',
			top: '0',
			left: '0',
			zIndex: '2147483647',
			boxSizing: 'border-box',
			width: 'max-content',
			padding: 'var(--semantics-tooltips-padding-block) var(--semantics-tooltips-padding-inline)',
			borderRadius: 'var(--semantics-tooltips-corner-radius)',
			boxShadow: 'var(--semantics-tooltips-box-shadow)',
			backgroundColor: 'var(--semantics-tooltips-background-color)',
			color: 'var(--semantics-tooltips-content-color)',
			font: 'var(--semantics-tooltips-font)',
			pointerEvents: 'none',
		});
		document.body.append(note);
		return note;
	}

	private _hideDenied(): void {
		clearTimeout(this._deniedTimer);
		this._deniedNote?.remove();
		this._deniedNote = null;
		this._deniedCursor?.remove();
		this._deniedCursor = null;
	}

	override render() {
		return taskBoardTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-task-board': NLDDTaskBoard;
	}
}
