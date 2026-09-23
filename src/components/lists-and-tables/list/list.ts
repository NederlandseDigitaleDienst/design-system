import { LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { listStyles } from './list.styles.js';
import { template } from './list.template.js';
import type { NLDDListItem } from '../list-item/list-item.js';
import { nlddListTranslations } from './list.i18n.js';
import type { NLDDListTranslations } from './list.i18n.js';
import '../../status-and-feedback/inline-dialog/inline-dialog.js';
import '../../content/icon/icon.js';
import '../../actions/icon-button/icon-button.js';

export type ListDividers = 'always' | 'on-touch' | 'never';

export type ListVariant = 'simple' | 'box-tinted' | 'box-base';
export type ListType = 'list' | 'navigation' | 'listbox' | 'tree' | 'form' | 'radiogroup';

export interface NLDDReorderEventDetail {
	fromIndex: number;
	toIndex: number;
}

/** What the browser counts as a tab stop in a shadow root: focusable, enabled,
 *  and not parked at a negative tabindex. */
const SHADOW_TAB_STOP = ':is(a[href], button, input, select, textarea, [tabindex]):not([tabindex^="-"]):not(:disabled)';

/**
 * A container for `nldd-list-item` elements.
 *
 * The `type` attribute switches the list's a11y role and behavior:
 * - `list` (default) — `role="list"`, items `role="listitem"`. Reorderable allowed.
 * - `radiogroup` — `role="radiogroup"`, for a set of `nldd-list-item radio`
 *   rows: one choice, laid out as rows so each option can carry a count or a
 *   second line. The rows step out of the accessibility tree themselves
 *   (`role="none"`), so the radios are the group's own children. The arrows
 *   move focus here and activation checks, rather than the selection following
 *   focus as it does in `nldd-radio-button-group`.
 * - `tree` — `role="tree"`, items `role="treeitem"`. Branch rows put their child
 *   rows in their own `slot="children"`, which the item renders as a
 *   `role="group"`. Level, position and set size are NOT authored: the
 *   nesting represents the hierarchy, so assistive technology derives
 *   them. A branch row must carry `expanded`; the group is hidden while
 *   it is false. Visual indentation is the consumer's — repeat a
 *   spacer-cell per level. Comes with its own keyboard, see "Tree" below.
 * - `navigation` — host `role="navigation"`, items with `selected` get
 *   `aria-current="page"` on their inner `<a>` or `<button>`.
 * - `form` — rows that are not actions themselves: the controls inside them
 *   are. A row of a label and a field, a switch, a menu button, or a value you
 *   cannot change at all. Semantically the same as `list` (`role="list"`,
 *   `role="listitem"`), and everything visual is unchanged; what falls away is
 *   the keyboard of a list you walk through. No arrow navigation, so no
 *   promise of it either, and no tab stop on the row: Tab goes straight to the
 *   controls, in source order, the way it does in any form. Rows that ARE
 *   actions (`href`, `button`, `checkbox`, or a segment) contradict that and
 *   warn in development. SwiftUI draws the same line between `List` and
 *   `Form`, for the same reason.
 * - `listbox` — an accessible, filterable listbox (combobox pattern). The
 *   list renders its OWN search input (`role="combobox"`) pinned
 *   above the options; `.list__items` becomes `role="listbox"`
 *   and items become `role="option"`. Focus stays in the input,
 *   the active option moves via `aria-activedescendant`, and
 *   filtering is consumer-managed via the `input` event (toggle
 *   `[hidden]` on items). See "Listbox" below.
 *
 * Selection state is consumer-managed: the list never mutates `selected` itself.
 *
 * ### Keyboard
 *
 * A list you walk through answers to the arrow keys, and there is no attribute to
 * switch that on. Whether the keys do something is not a property of one list: it
 * is what a reader may assume about all of them, and a per-list setting made that
 * unknowable from the outside. It follows the type, which you can see before you
 * touch a key.
 *
 * - ArrowUp / ArrowDown — move focus between the rows there is something to do
 *   with. A row of nothing but text is skipped, because focus that leads nowhere
 *   is a dead end.
 * - Home / End — the first / last of those rows.
 * - Tab — the list is ONE tab stop, so Tab moves past it rather than through it.
 *   Within the current row Tab walks that row's own controls: a chevron beside a
 *   checkbox, a menu button at the end. The same controls in the other rows are
 *   held out of the tab order (`tabindex="-1"`, or `no-tab` on a design-system
 *   control that keeps its tab stop in its own shadow root), and so are this
 *   row's once focus leaves the list, so tabbing back in lands on the row again.
 * - Escape — out of a control the row holds, back onto the row. One level up,
 *   where Shift+Tab is one step back. On the row itself the list claims nothing,
 *   so Escape carries on to whatever holds the list, and a control showing a
 *   menu keeps the first press for closing that menu.
 *
 * While focus sits in a control a row holds, the list stands down: those keys
 * are the control's, and a list that took them anyway would pull focus out of a
 * combo box or a text field mid-word. What the row IS — its own link, button or
 * segments — keeps answering here.
 *
 * Arrows move focus only; selection stays consumer-managed. Three types answer
 * differently, and all three say so on screen before you touch a key: a listbox
 * runs its keyboard from its search field, a reorderable list moves rows with the
 * arrows, and a form has no rows to move between at all.
 *
 * ### Listbox
 *
 * In `type="listbox"` the list owns a native `<input role="combobox">` (mirroring
 * how `nldd-combo-box` wires an input to a slotted listbox). Keyboard, handled on
 * the input so focus never leaves it:
 * - ArrowDown / ArrowUp — move the active option among the VISIBLE (non-`[hidden]`)
 *   options (wrap around).
 * - Home / End — first / last visible option.
 * - Enter — activate the active option by triggering its inner action (a link
 *   navigates, a button fires the consumer's handler). Selection stays
 *   consumer-managed.
 * - Escape — clear the search value (and refire `input`).
 *
 * On every active change the input's `aria-activedescendant` is set to the active
 * option's id and the option is scrolled into view. The active option (`_highlighted`
 * on the item, a highlight) is distinct from `selected`. Filtering is the
 * consumer's job: listen to `input` (`{ detail: { value } }`) and toggle `[hidden]`
 * on items; after the visible set changes the list resets the active option to the
 * first visible one. `reorderable` and the roving arrow keys are ignored in
 * listbox mode (listbox has its own keyboard).
 *
 * ### Tree
 *
 * A tree adds to that keyboard, and counts the rows of an open branch as part of
 * the order the arrows walk:
 * - ArrowRight — opens a closed branch; on an open one it steps to its first child.
 * - ArrowLeft — closes an open branch; on a leaf it steps out to the parent row.
 * - Enter — follows the row: its own link or button, or on a segmented branch the
 *   first action that is not the chevron. A branch with only a chevron folds instead.
 * - Space — open and close, the same as Right and Left. Only while focus
 *   sits on the row itself: a row that is its own control, and a segmented
 *   action you tabbed into, handle both keys themselves.
 *
 * Opening and closing runs through the row's own disclosure control — the
 * segment marked `disclosure`, or the row itself when it is a button.
 * The list activates that control rather than writing `expanded`, so the state
 * keeps being set in one place: the consumer's handler. A row that is a link is
 * never activated this way, since that would navigate away.
 *
 * The tree is one tab stop. Focus lands on the row itself when the row has no
 * control of its own, because that is where `treeitem` sits and it makes
 * assistive technology announce the row rather than a button inside it. Tab then
 * walks the controls of THAT row (a chevron beside a checkbox, say) and leaves
 * the list after the last one.
 *
 * A deliberate deviation: strictly speaking a row with several controls is a
 * `treegrid`, not a `tree`. We keep the tree semantics — level and set size are
 * what matters here, not rows and columns — and borrow the "Tab within the row"
 * behavior from the grid pattern. Should a tree with real columns come up, that
 * is when `treegrid` earns its own type.
 *
 * ### Reorder
 *
 * On reorder (type="list" + reorderable), the list dispatches `nldd-reorder` with
 * `fromIndex` / `toIndex` and expects the consumer to mutate the DOM (or their
 * data model that renders the DOM). Focus is restored to the moved item's drag
 * handle via a single `requestAnimationFrame` — this assumes the consumer
 * reorders **synchronously** in the event handler. Async renderers (React,
 * Vue, …) that update the DOM on a later tick will miss the focus restore and
 * should manage focus themselves after their render commits.
 *
 * @element nldd-list
 *
 * @attr {'simple'|'box-tinted'|'box-base'} variant - Visual style (default 'simple'): `simple` is a plain vertical strip with no chrome, the two `box` values a framed card with rounded corners, fill and inset border ring. `box-tinted` for a list on a plain page, `box-base` for one on an already-tinted parent (the border ring gets +2 palette steps so it still reads against a card-on-card)
 * @attr {'list'|'navigation'|'listbox'|'tree'|'form'|'radiogroup'} type - A11y role and behavior (default 'list'). See the docblock above.
 * @attr {'always'|'on-touch'|'never'} dividers - When to draw the lines between the items (default 'always'). `on-touch` draws them only where the primary input is touch, under `(pointer: coarse)`: a pointer has the hover highlight to tell one row from the next and a finger has nothing, so the line earns its place in the one case and is clutter in the other. `never` hides them everywhere
 * @attr {string} height - Listbox only: caps the options' scroll region at this CSS length (e.g. '320px'). Unset means no cap.
 * @attr {string} accessible-label - Accessible name, forwarded to the list in `type="list"` and to the search field in `type="listbox"`. For `type="navigation"` set `aria-label` / `aria-labelledby` on the element itself. Falls back to the i18n default.
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 * @attr {boolean} reorderable - Enables drag-to-reorder and pushes `reorderable` onto the items. Only valid with `type="list"`; there the arrow keys move rows instead of focus.
 *
 * @slot        - List items (`nldd-list-item`)
 * @slot toolbar - Controls below the search field (filters, sort, counts, view toggles). Available for every type; collapses when empty.
 * @slot search-bar-end - Controls inline at the end of the search bar, beside the search field (e.g. a filter or options button). Listbox only; collapses when empty.
 * @slot empty - Shown when the list has no items at all. Empty by default: what an empty list should say is the app's to write, so put an `nldd-inline-dialog` here. There is nothing to search or filter in a list with no rows, so a `[slot="toolbar"]` is hidden along with them, and an unfilled slot takes the whole list off the page. A `type="listbox"` is the exception on both counts: its search field is where the rows come from, so the field, the toolbar and the list itself stay, and the message waits until there is a query, the same as `no-results` does. A list that fetches its rows is in this state until they arrive: put an `nldd-inline-dialog variant="loading"` here to hold the place rather than have the controls appear a moment later.
 * @slot no-results - Shown when the list has items but every one of them is `[hidden]`, which is what consumer-driven filtering leaves behind. A different state from `empty` and a different sentence: here the search field and the `[slot="toolbar"]` stay, because they are the way back to the rows. Falls back to `[slot="empty"]` when not given. In `type="listbox"` it is suppressed while the search field is empty (no query yet), so the consumer can show just the search field or its own hint outside the list.
 *
 * @fires nldd-reorder - Reorderable `type="list"`: `{ fromIndex, toIndex }` on drop
 * @fires input - `type="listbox"`: search value changed; `{ value }`. Toggle `[hidden]` on items to filter.
 */
@customElement('nldd-list')
export class NLDDList extends LitElement {
	static override styles = [listStyles];

	/** Visual style of the list. `simple` is a plain vertical strip with
	 *  no chrome (no rounded corners, no fill, no border); `box` is a
	 *  framed card with rounded corners, fill, and an inset border ring. */
	@property({ reflect: true, converter: reflectNonDefault<ListVariant>('simple') })
	variant: ListVariant = 'simple';

	/** A11y semantics. See class docblock. */
	@property({ reflect: true, converter: reflectNonDefault<ListType>('list') })
	type: ListType = 'list';

	/** When to draw the lines between the items. `on-touch` draws them where the
	 *  primary input is touch: a pointer has the hover highlight to tell one row
	 *  from the next, and a finger has nothing. */
	@property({ reflect: true, converter: reflectNonDefault<ListDividers>('always') })
	dividers: ListDividers = 'always';

	/**
	 * Only in `type="listbox"`: caps the options' scroll region at this CSS
	 * length (any value `CSS.supports('max-height', …)` accepts, e.g. "320px").
	 * The search input stays pinned above and the options scroll; the active
	 * option is kept in view via `scrollIntoView`. Unset → no cap. No effect
	 * outside listbox mode.
	 */
	@property({ type: String, reflect: true })
	height = '';

	/** Accessible name for the list, forwarded to the inner role: the list in
	 *  `type=list`, the search field in `type=listbox`. For `type=navigation`,
	 *  set `aria-label` / `aria-labelledby` on the element directly (it is a
	 *  landmark). Falls back to the default i18n label when unset. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** Override one or more translation keys. Unset keys fall back to the Dutch default. */
	@property({ type: Object })
	translations: Partial<NLDDListTranslations> = {};

	/** Enables drag-to-reorder. Only valid when `type="list"` (the default). */
	@property({ type: Boolean, reflect: true })
	reorderable = false;

	@state()
	private _mergedTranslations = { ...nlddListTranslations };

	@state()
	private _hasToolbar = false;

	@state()
	private _hasSearchBarEnd = false;

	@state()
	private _hasEmptyState = false;

	@state()
	private _hasNoResultsState = false;

	@state()
	private _hasItems = false;

	@state()
	private _isEmpty = false;

	// — Listbox state ————————————————————————————————————————————————————————

	/** Current search value (listbox mode). Mirrored to the input. */
	@state()
	private _searchValue = '';

	/** ID of the active option (listbox mode), or '' when none. Fed to the
	 *  input's aria-activedescendant. Distinct from selection. */
	@state()
	private _activeId = '';

	/** Whether the search input has focus. aria-activedescendant is the input's
	 *  virtual focus, so the active-option highlight only shows while it is
	 *  focused; _activeId is remembered across blur so focus resumes there. */
	@state()
	private _searchFocused = false;

	/** Stable id for `.list__items` (the listbox), referenced by the input's
	 *  aria-controls. Per-instance, like nldd-combo-box's `_menuId`. */
	private static _idCounter = 0;
	readonly _listboxId = `nldd-list-listbox-${NLDDList._idCounter++}`;

	/** Counter for auto-assigned option ids (listbox mode). */
	private static _optionIdCounter = 0;

	@query('.list__search-field-input')
	private _searchInput?: HTMLInputElement;

	// — Drag state ——————————————————————————————————————————————————————————

	private _draggingEl: NLDDListItem | null = null;
	private _draggingFromIndex = -1;
	private _placeholder: HTMLDivElement | null = null;
	private _currentDropIndex = -1;
	private _pointerId: number | null = null;
	private _clone: HTMLDivElement | null = null;
	private _cloneOffsetY = 0;
	private _listRect: DOMRect | null = null;

	// — Observers ————————————————————————————————————————————————————————————

	private _itemsObserver: MutationObserver | null = null;

	// — Lifecycle ————————————————————————————————————————————————————————————

	/**
	 * What the first render needs to know, read before it happens.
	 *
	 * All three of these used to be set in `firstUpdated`, from the slots in the
	 * shadow root. Setting reactive state there asks for a second render the
	 * moment the first one finished, which Lit reports on every page as "an
	 * update scheduled after an update completed". The same three answers are in
	 * the light DOM, which is there before the first render, so they are read
	 * from the children instead. The slotchange listeners below keep them true
	 * afterwards, and by then a second render is what you actually want.
	 */
	override willUpdate(changed: Map<string, unknown>) {
		// Derived state belongs before the render that reads it. In `updated` the
		// merge lands after the first render has finished, and asks for a second
		// one on the spot.
		if (changed.has('translations') || !this.hasUpdated) {
			this._mergedTranslations = { ...nlddListTranslations, ...this.translations };
		}
		if (this.hasUpdated) return;
		this._updateEmpty();
		this._hasToolbar = this.querySelector(':scope > [slot="toolbar"]') !== null;
		this._hasSearchBarEnd = this.querySelector(':scope > [slot="search-bar-end"]') !== null;
	}

	override firstUpdated() {
		// Deferred: the browser fires the first slotchange the moment this render
		// commits, and state set there is an update scheduled on top of the one
		// that just finished. willUpdate already read these from the light DOM, so
		// the first event has nothing to add anyway; the later ones do.
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
		slot?.addEventListener('slotchange', () => queueMicrotask(() => {
			this._updateItems();
			this._updateEmpty();
		}));
		this._updateItems();
		this._warnArrowNav();

		const toolbarSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="toolbar"]');
		toolbarSlot?.addEventListener('slotchange', () => queueMicrotask(() => {
			this._hasToolbar = toolbarSlot.assignedElements().length > 0;
		}));

		// An app that renders its empty state conditionally adds and removes this
		// one while the list is already on the page, and whether it holds anything
		// decides whether the surface is drawn at all.
		const emptySlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="empty"]');
		emptySlot?.addEventListener('slotchange', () => queueMicrotask(() => this._updateEmpty()));
		const noResultsSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="no-results"]');
		noResultsSlot?.addEventListener('slotchange', () => queueMicrotask(() => this._updateEmpty()));

		// Watch for rows being added or removed, for `hidden` toggles on them
		// (consumer-driven filtering) and for branches opening and closing, since
		// all three change which row paints first and last. `subtree: true` is
		// required: a branch's rows sit inside the branch, not in the list. The
		// callback filters on the target being a row, so `hidden` toggles on e.g.
		// cells inside a row (container-query driven, via visibility-mixin) don't
		// trigger a recalculation.
		this._itemsObserver = new MutationObserver((mutations) => {
			const isRow = (node: Node | null) =>
				node instanceof Element && node.tagName.toLowerCase() === 'nldd-list-item';
			const relevant = mutations.some(m => {
				// A branch's rows are added to and removed from the branch, not the
				// list, and opening a branch changes which row paints last.
				if (m.type === 'childList') return m.target === this || isRow(m.target);
				if (m.type !== 'attributes' || !isRow(m.target)) return false;
				if (m.attributeName === 'expanded' || m.attributeName === 'disabled') return true;
				return m.attributeName === 'hidden'
					&& (m.target.parentElement === this || isRow(m.target.parentElement));
			});
			if (!relevant) return;
			this._updateItems();
			this._updateEmpty();
			this._warnUnmanagedControls();
		});
		this._itemsObserver.observe(this, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['hidden', 'expanded', 'disabled'],
		});

		this._applyHostType();
	}

	override connectedCallback() {
		super.connectedCallback();
		// Set container-type/name as inline style on the host. Doing this from
		// a `:host` rule inside the shadow DOM works in Chromium but Safari
		// does not always recognize the host as a container for slotted
		// descendants — a known engine inconsistency. Same workaround as
		// nldd-page and nldd-card.
		this.style.containerType = 'inline-size';
		this.style.containerName = 'cells-container';
		this.addEventListener('pointerdown', this._onPointerDown);
		this.addEventListener('keydown', this._onKeyDownCapture, true);
		this.addEventListener('keydown', this._onKeyDown);
		this.addEventListener('focusin', this._onFocusIn);
		this.addEventListener('focusout', this._onFocusOut);
		this.addEventListener('click', this._onListClick);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('pointerdown', this._onPointerDown);
		this.removeEventListener('keydown', this._onKeyDownCapture, true);
		this.removeEventListener('keydown', this._onKeyDown);
		this.removeEventListener('focusin', this._onFocusIn);
		this.removeEventListener('focusout', this._onFocusOut);
		this.removeEventListener('click', this._onListClick);
		this._itemsObserver?.disconnect();
		this._itemsObserver = null;
		this._cancelDrag();
	}

	override updated(changed: Map<string, unknown>) {
		if (changed.has('reorderable') || changed.has('type')) {
			if (this.reorderable && this.type !== 'list' && import.meta.env?.DEV) {
				console.warn('nldd-list: `reorderable` is only valid when type="list". Ignoring.');
			}
			this._updateItems();
			this._warnArrowNav();
		}
		if (changed.has('variant')) {
			this._updateItemContext();
		}
		if (changed.has('type')) {
			this._applyHostType();
			// Leaving listbox mode: drop the active highlight and reset state so a
			// stale `_highlighted`/aria-activedescendant doesn't survive the switch.
			if (changed.get('type') === 'listbox' && this.type !== 'listbox') {
				this._activeId = '';
				this._getItems().forEach(item => { item._highlighted = false; });
			}
		}
		if (changed.has('height')) {
			// Mirror the width/height inline-style pattern: validate, then feed a
			// local var the CSS reads as max-height on the scroll region.
			const h = this.height;
			if (h && CSS.supports('max-height', h)) {
				this.style.setProperty('--_max-height', h);
			} else {
				this.style.removeProperty('--_max-height');
			}
		}
	}

	// — Host attribute routing ————————————————————————————————————————————————

	private _applyHostType() {
		// Only `navigation` puts a role on the host. `list` and `listbox` leave
		// the host role-less: `list` carries role="list" on `.list__items`, and
		// `listbox` carries role="listbox" there — putting a second widget role
		// on the host would nest landmarks/roles incorrectly.
		if (this.type === 'navigation') {
			this.setAttribute('role', 'navigation');
			if (!this.hasAttribute('aria-label') && !this.hasAttribute('aria-labelledby')) {
				this.setAttribute('aria-label', this._t('components.list.navigation-accessible-label'));
				this.setAttribute('data-nldd-auto-label', '');
			}
		} else {
			if (this.getAttribute('role') === 'navigation') {
				this.removeAttribute('role');
			}
			if (this.hasAttribute('data-nldd-auto-label')) {
				// Only strip the label we set ourselves. If the consumer overrode
				// `aria-label` after our auto-set, the value no longer matches and
				// we leave it intact. Either way, clear the sentinel.
				const autoLabel = this._t('components.list.navigation-accessible-label');
				if (this.getAttribute('aria-label') === autoLabel) {
					this.removeAttribute('aria-label');
				}
				this.removeAttribute('data-nldd-auto-label');
			}
		}
	}

	// — Items ————————————————————————————————————————————————————————————————

	private _getItems(): NLDDListItem[] {
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
		return (slot?.assignedElements() ?? []).filter(
			(el) => el.tagName.toLowerCase() === 'nldd-list-item' && !el.hasAttribute('data-nldd-placeholder'),
		) as NLDDListItem[];
	}

	/** Visible (non-`[hidden]`) items, in DOM order. The active-option model and
	 *  listbox keyboard operate over this set. */
	private _getVisibleItems(): NLDDListItem[] {
		return this._getItems().filter(item => !item.hasAttribute('hidden'));
	}

	/** Every row in the tree, top-level rows and nested ones alike, so a stale
	 *  is-first / is-last never survives on a row deeper down. */
	private _getAllRows(rows = this._getItems()): NLDDListItem[] {
		return rows.flatMap(row => [row, ...this._getAllRows(row.childRows)]);
	}

	/** Rows in the order they paint: an expanded branch's children sit between
	 *  the branch and the next top-level row, so the last row of the list is the
	 *  deepest last child, not the last item in the list's own slot. */
	private _getPaintedRows(rows = this._getItems()): NLDDListItem[] {
		return rows
			.filter(row => !row.hasAttribute('hidden'))
			.flatMap(row => (row.expanded ? [row, ...this._getPaintedRows(row.childRows)] : [row]));
	}

	private _updateItems() {
		const items = this._getItems();
		const paintedRows = this._getPaintedRows(items);
		const firstVisible = paintedRows[0];
		const lastVisible = paintedRows[paintedRows.length - 1];
		const reorderActive = this.reorderable && this.type === 'list';
		this._getAllRows(items).forEach((row) => {
			row.classList.toggle('is-first', row === firstVisible);
			row.classList.toggle('is-last', row === lastVisible);
		});
		items.forEach((item) => {
			if (reorderActive) {
				item.setAttribute('reorderable', '');
			} else {
				item.removeAttribute('reorderable');
			}
		});
		this._updateItemContext();
		this._updateRoving();
		if (this.type === 'listbox') this._updateListboxOptions();
	}

	private _contextScheduled = false;

	/** Push the list's variant + type onto every item, deferred to a microtask:
	 *  _updateItems runs inside the update lifecycle (firstUpdated/updated), and
	 *  setting the items' reactive state there would trip Lit's change-in-update
	 *  warning. Coalesced so repeated item updates schedule it only once. */
	private _updateItemContext() {
		if (this._contextScheduled) return;
		this._contextScheduled = true;
		queueMicrotask(() => {
			this._contextScheduled = false;
			this._applyItemContext();
		});
	}

	/** The list owns variant + type; every item mirrors them (is-boxed styling and
	 *  the option/listitem role). Pushing from the list, not a per-item observer,
	 *  means a runtime variant/type switch, or a freshly added item, always tracks
	 *  the list. */
	private _applyItemContext() {
		this._getItems().forEach((item) => {
			item._applyVariant(this.variant);
			item._applyParentType(this.type);
		});
	}

	private _updateEmpty() {
		// The rows are read off the slot, and a slot has nothing assigned until it
		// has rendered. Before that they are read from the children, where they
		// already are: judging on the slot called every list empty for one render,
		// which hid the controls that belong to the rows and latched a warning
		// naming the wrong state.
		const items = this.hasUpdated
			? this._getItems()
			: Array.from(this.querySelectorAll<NLDDListItem>(':scope > nldd-list-item'));
		this._isEmpty = items.length === 0 || items.every(item => item.hasAttribute('hidden'));
		// Nothing in it and nothing said about that is not a thing on the page.
		// Drawing the surface anyway makes "nothing" look different per variant:
		// invisible on a plain list, an empty tinted bar on a boxed one, which
		// reads as a skeleton that never loaded.
		this._hasItems = items.length > 0;
		this._hasEmptyState = !!this.querySelector(':scope > [slot="empty"]');
		this._hasNoResultsState = !!this.querySelector(':scope > [slot="no-results"]');
		// No rows at all and nothing said about that: not a thing on the page, so
		// a parent that spaces its children keeps no room for it either. Rows that
		// are only filtered away are a different state: the list stays, because
		// the search field and the toolbar in it are the way back. A listbox stays
		// as well: its search field is the way to any rows at all.
		this.classList.toggle(
			'is-blank',
			this._isEmpty && !this._hasItems && !this._hasEmptyState && this.type !== 'listbox',
		);
		this._warnSilentEmpty();
	}

	/**
	 * A list with nothing in it and nothing to say about that.
	 *
	 * There is no default text any more, because what an empty list means is
	 * the app's to write and a house sentence was wrong more often than right.
	 * That leaves a real risk of a blank area with nothing in the accessibility
	 * tree either, so the list asks the person building it rather than
	 * answering for them. It asks about the state it is actually in: rows that
	 * are all hidden are covered by [slot="no-results"] as well as by the
	 * [slot="empty"] it falls back to. A listbox before you have typed is left
	 * alone: an empty search is not an empty list.
	 */
	private _warnSilentEmpty() {
		if (!import.meta.env?.DEV) return;
		if (!this._isEmpty || this._warnedSilentEmpty) return;
		if (this.type === 'listbox' && !this._searchValue) return;
		if (this._hasEmptyState) return;
		// Rows that are all hidden are the no-results state, and a slot that covers
		// it answers the question: warning about the empty slot there would ask for
		// a second sentence nobody will ever read.
		if (this._hasItems && this._hasNoResultsState) return;
		const slot = this._hasItems ? '[slot="no-results"]' : '[slot="empty"]';
		const what = this._hasItems
			? 'every item hidden and nothing in ' + slot
			: 'no items and nothing in ' + slot;
		this._warnedSilentEmpty = true;
		console.warn(
			`nldd-list: ${what}, so the list renders a blank area. `
			+ 'Put an nldd-inline-dialog in that slot saying what is not there and what the next move is.',
			this,
		);
	}

	private _warnedSilentEmpty = false;

	// — Listbox: active-option model ————————————————————————————————————————————

	/** Every option needs a stable id for aria-activedescendant. Assign one to
	 *  any item that lacks one (consumer-supplied ids win). */
	private _ensureOptionId(item: NLDDListItem): string {
		if (!item.id) {
			item.id = `nldd-list-option-${NLDDList._optionIdCounter++}`;
		}
		return item.id;
	}

	/** Keep the active option valid after the visible set changes (initial
	 *  render, slot change, or consumer-driven `[hidden]` filtering): ensure ids,
	 *  reset the active option to the first visible one when the current active is
	 *  gone (or none was set), push `_highlighted` onto the items, and refresh the
	 *  input's aria-activedescendant. When nothing is visible the empty state
	 *  shows and aria-activedescendant is cleared. Deferred to a microtask for the
	 *  same reason as roving — it can run inside the update lifecycle and would
	 *  otherwise trip Lit's change-in-update warning. */
	private _listboxScheduled = false;
	private _updateListboxOptions() {
		if (this._listboxScheduled) return;
		this._listboxScheduled = true;
		queueMicrotask(() => {
			this._listboxScheduled = false;
			this._applyListboxOptions();
		});
	}

	private _applyListboxOptions() {
		if (this.type !== 'listbox') return;
		const visible = this._getVisibleItems();
		visible.forEach(item => this._ensureOptionId(item));
		// Keep the active option if it's still visible, otherwise fall back to the
		// first visible option (or none when the list is empty).
		const current = visible.find(item => item.id === this._activeId);
		const active = current ?? visible[0];
		this._activeId = active?.id ?? '';
		this._syncHighlight();
	}

	/** Move the active option to `item`: update state, reflect aria-activedescendant
	 *  on the input, and scroll the option into view (it may be inside the capped
	 *  scroll region). */
	private _setActiveOption(item: NLDDListItem) {
		this._activeId = this._ensureOptionId(item);
		this._syncHighlight();
		item.scrollIntoView({ block: 'nearest' });
	}

	/** Reflect the active descendant onto the items, but only while the search
	 *  input is focused (aria-activedescendant is its virtual focus). _activeId is
	 *  remembered across blur so focus resumes at the same option; the template
	 *  gates aria-activedescendant on _searchFocused the same way. */
	private _syncHighlight() {
		const active = this._searchFocused ? this._activeItem : null;
		this._getItems().forEach(i => { i._highlighted = i === active; });
	}

	/** The currently active option element, or null. */
	private get _activeItem(): NLDDListItem | null {
		if (!this._activeId) return null;
		return this._getVisibleItems().find(item => item.id === this._activeId) ?? null;
	}

	// — Listbox: search input ————————————————————————————————————————————————————

	/** Dispatch the consumer-facing `input` event so it can filter (toggle
	 *  `[hidden]` on items). Composed + bubbling, `{ detail: { value } }`. */
	private _emitListboxInput(value: string) {
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value },
			bubbles: true,
			composed: true,
		}));
	}

	private _onSearchInput = (event: Event) => {
		// The native input event is composed and would escape the shadow root
		// alongside our own CustomEvent, reaching consumers as a second `input`
		// without a `detail`. Stop it so the only `input` they see is ours,
		// carrying { value }.
		event.stopPropagation();
		const input = event.target as HTMLInputElement;
		this._searchValue = input.value;
		this._emitListboxInput(this._searchValue);
	};

	/** Clear the search value (clear button / Escape) and refire `input` so the
	 *  consumer refilters. Focus stays on the input. */
	private _clearSearch() {
		this._searchValue = '';
		if (this._searchInput) this._searchInput.value = '';
		this._emitListboxInput('');
		this._searchInput?.focus();
	}

	private _onClearClick = () => {
		this._clearSearch();
	};

	/** Track whether the search-bar-end slot has content, so its wrapper (and the
	 *  bar gap) collapses when empty. Bound in the template so it follows the slot
	 *  even though the search bar only renders in listbox mode. */
	private _onSearchBarEndSlotChange = (event: Event) => {
		const slot = event.target as HTMLSlotElement;
		queueMicrotask(() => { this._hasSearchBarEnd = slot.assignedElements().length > 0; });
	};

	private _onSearchFocus = () => {
		this._searchFocused = true;
		// Resume at the remembered active option, or the first visible one if none
		// is set or it was filtered away.
		this._applyListboxOptions();
	};

	private _onSearchBlur = () => {
		this._searchFocused = false;
		this._syncHighlight();
	};

	/** Clicking an option moves the (remembered) active descendant to it, so the
	 *  highlight resumes there when the search input regains focus. */
	private _onListClick = (event: MouseEvent) => {
		if (this.type !== 'listbox') return;
		const item = (event.target as Element | null)?.closest?.('nldd-list-item') as NLDDListItem | null;
		if (item && item.parentElement === this && !item.hasAttribute('hidden')) {
			this._activeId = this._ensureOptionId(item);
		}
	};

	/**
	 * Listbox keyboard, handled on the search input — focus never leaves it.
	 * Arrows/Home/End move the active option among the visible set; Enter
	 * activates it by triggering its inner action; Escape clears the value.
	 */
	private _onSearchKeyDown = (event: KeyboardEvent) => {
		const { key } = event;
		if (key === 'Escape') {
			if (this._searchValue !== '') {
				event.preventDefault();
				this._clearSearch();
			}
			return;
		}
		if (key === 'Enter') {
			const active = this._activeItem;
			if (active) {
				event.preventDefault();
				// Trigger the option's inner action: a link navigates, a button
				// fires the consumer's handler. Selection stays consumer-managed.
				active.shadowRoot?.querySelector<HTMLElement>('.list-item__action')?.click();
				// Enter is keyboard interaction, so keep focus on the search input
				// (the combobox model: the active option is the virtual focus via
				// aria-activedescendant). The option's click would otherwise pull DOM
				// focus onto it; refocus so typing/arrowing continues and the
				// highlight stays.
				this._searchInput?.focus();
			}
			return;
		}
		if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
		const visible = this._getVisibleItems();
		if (visible.length === 0) return;
		event.preventDefault();
		const current = visible.findIndex(item => item.id === this._activeId);
		let next: number;
		if (key === 'Home') {
			next = 0;
		} else if (key === 'End') {
			next = visible.length - 1;
		} else {
			const dir = key === 'ArrowDown' ? 1 : -1;
			const base = current === -1 ? (dir === 1 ? -1 : 0) : current;
			next = (base + dir + visible.length) % visible.length; // wrap around
		}
		this._setActiveOption(visible[next]);
	};

	// — Arrow navigation (roving tabindex) ————————————————————————————————————

	/**
	 * Every list answers to the arrow keys. There is no switch for it, on purpose:
	 * whether the keys do something is not a property of one list, it is what a
	 * reader may assume about all of them, and a per-list setting made that
	 * unknowable from the outside.
	 *
	 * Two lists answer differently, and you can see which before you touch a key:
	 * a listbox has a search field and runs its own keyboard from there, and a
	 * reorderable list uses the arrows to move rows. The guard checks
	 * `type === 'list'` because reorderable is inert without it, so there is no
	 * conflict to resolve.
	 */
	private get _arrowNavActive(): boolean {
		if (this.type === 'listbox') return false;
		// A form's rows are not somewhere to go: the controls in them are, and Tab
		// already reaches those. Arrow keys would be a promise with nothing behind
		// it, and the tab stop they need on the row would sit in front of every
		// field.
		if (this.type === 'form') return false;
		return !(this.reorderable && this.type === 'list');
	}

	/** Interactive, painted rows — the roving stops, in the order they appear on
	 *  screen. Rows with nothing to operate and hidden ones are skipped.
	 *  Painted, not top-level: in a tree the rows of an open branch sit between
	 *  the branch and the next top-level row, and arrows have to walk them too. */
	private _getInteractiveItems(): NLDDListItem[] {
		const painted = this._getPaintedRows();
		// In a tree every row is a stop, including one that holds nothing at all:
		// the row itself takes focus (that is where role="treeitem" sits), and a
		// branch you cannot reach is a branch you cannot open.
		if (this.type === 'tree') return painted;
		return painted.filter((row) => row._isRovingStop);
	}

	private _rovingScheduled = false;

	private _warnedActionRowInForm = false;

	/**
	 * Whether the control the Escape came from had a popover open when the key
	 * went down. Read on the way in, because a control closes its own menu in its
	 * own handler and does not stop the key: by the time this list sees it on the
	 * way out, the menu is already gone and one press would do two levels at once.
	 */
	private _popoverWasOpen = false;

	private _onKeyDownCapture = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !this._arrowNavActive) return;
		const origin = this._origin(event);
		// Asked of the whole row rather than of the control the event came from:
		// a popover can hang anywhere between the focused node and the row — under
		// the control, beside it in the same cell — and missing one costs a level.
		// The other way round costs a press, once, in a row that has an open menu
		// and a second control you are typing in.
		this._popoverWasOpen = !!origin?.control && !!origin.row.querySelector(':popover-open');
	};

	/** Push roving state onto the items, deferred to a microtask: _updateItems can
	 *  run inside the update lifecycle (firstUpdated/updated), and setting the
	 *  items' reactive state there would trip Lit's change-in-update warning.
	 *  Coalesced so repeated item updates schedule it only once.
	 *
	 *  @internal Also called by a row whose content changed after the stops were
	 *  picked. */
	_updateRoving() {
		if (this._rovingScheduled) return;
		this._rovingScheduled = true;
		queueMicrotask(() => {
			this._rovingScheduled = false;
			this._applyRoving();
		});
	}

	/** Sets the arrow-navigation flag on all items and a single roving entry point
	 *  (keep the current one if still valid, else the selected item, else the first
	 *  interactive item). */
	private _applyRoving() {
		const active = this._arrowNavActive;
		const rows = this._getAllRows();
		rows.forEach((row) => { row._arrowNavigation = active; });
		const interactive = active ? this._getInteractiveItems() : [];
		// Best-effort AT discoverability: role="list"/"navigation" doesn't imply
		// arrow-key navigation the way listbox/menu would, so advertise the keys via
		// aria-keyshortcuts (queryable) and a plain-language aria-description (surfaced
		// when AT reaches the list). See _arrowNavActive — known limitation.
		// Only where the keys go somewhere: a list of nothing but text has no stops
		// to move between, and promising keys that do nothing is worse than silence.
		if (import.meta.env?.DEV && this.type === 'form' && !this._warnedActionRowInForm) {
			const action = rows.find((row) => row.href || row.button || row.checkbox
				|| row.querySelector(':scope > nldd-list-item-segment'));
			if (action) {
				this._warnedActionRowInForm = true;
				console.warn('nldd-list: type="form" says the rows are not actions and the controls inside them are, so its rows carry no keyboard of their own. This one is a link, a button, a checkbox or a set of segments, which contradicts that. Use type="list" for rows you activate, and put the action in a cell if it belongs to a form row.');
			}
		}
		if (interactive.length > 0) {
			this.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown Home End');
			this.setAttribute('aria-description', this._t('components.list.arrow-navigation-description-text'));
		} else {
			this.removeAttribute('aria-keyshortcuts');
			this.removeAttribute('aria-description');
		}
		if (!active) {
			rows.forEach((row) => { row._rovingActive = false; });
			return;
		}
		if (interactive.length === 0) return;
		const entry = interactive.find((row) => row._rovingActive)
			?? interactive.find((row) => row.selected)
			?? interactive[0];
		rows.forEach((row) => {
			row._rovingActive = row === entry;
			row._syncRovingTabStops();
		});
	}

	// items defaults to every row, nested ones included. Callers that pass a
	// narrower set take on clearing whatever is outside it themselves.
	private _setRovingActive(activeItem: NLDDListItem, items: NLDDListItem[] = this._getAllRows()) {
		items.forEach((item) => {
			item._rovingActive = item === activeItem;
			// Straight away, not on the next render: the caller hands focus to the
			// row in the same tick, and a row without a tabindex cannot take it.
			item._syncRovingTabStops();
		});
	}

	private _onFocusIn = (event: FocusEvent) => {
		if (!this._arrowNavActive) return;
		const item = (event.composedPath() as Element[]).find(
			(el) => el instanceof Element && el.tagName.toLowerCase() === 'nldd-list-item',
		) as NLDDListItem | undefined;
		// Keep the roving entry point wherever focus actually lands (Tab in, a
		// click, or programmatic focus), so arrows continue from there.
		if (item && !item._rovingActive && this._getInteractiveItems().includes(item)) {
			this._setRovingActive(item);
			return;
		}
		// Focus back on the row it was already on: hand its controls their stops
		// again, since leaving the list parked them.
		if (item?._rovingActive) item._syncRovingTabStops();
	};

	/**
	 * Focus gone from the list: park everything but the row.
	 *
	 * The stops a row hands out to its controls last as long as the row is the
	 * current one, so without this they are still there after you tab away, and
	 * Shift+Tab back in lands inside the control you left rather than on the row.
	 * A roving list is one stop from the outside; what is inside opens up once
	 * you are in. _onFocusIn puts them back.
	 *
	 * Deferred: focus moving between two controls of the same row fires focusout
	 * before focusin, and `relatedTarget` is retargeted at a shadow boundary, so
	 * the only reliable answer to "did focus leave" is the one you get after it
	 * has landed.
	 */
	private _onFocusOut = () => {
		if (!this._arrowNavActive) return;
		queueMicrotask(() => {
			if (!this.isConnected || this._containsFocus()) return;
			this._getAllRows().forEach((row) => { row._parkControls(); });
		});
	};

	/** Whether focus is anywhere in this list, shadow boundaries included. */
	private _containsFocus(): boolean {
		// document.activeElement only ever names the outermost host, so the answer
		// is a walk down the chain of active elements: at every level, is this the
		// list or inside it.
		let node: Element | null = document.activeElement;
		while (node) {
			if (node === this || this.contains(node)) return true;
			node = node.shadowRoot?.activeElement ?? null;
		}
		return false;
	}

	/** The row an event came from, and the control of that row it started in. */
	private _origin(event: Event): { row: NLDDListItem; control: Element | null } | null {
		const path = event.composedPath();
		const row = path.find(
			(el) => el instanceof Element && el.tagName.toLowerCase() === 'nldd-list-item',
		) as NLDDListItem | undefined;
		if (!row) return null;
		return { row, control: row._slottedControlFor(path) };
	}

	private _onArrowNav(event: KeyboardEvent) {
		const { key } = event;
		// Hands off while focus is in a control the row holds. What those keys do
		// is the control's business — a combo box moves its options with them, a
		// text field its caret — and a list that takes them anyway pulls focus out
		// of the control mid-word. The row itself, its own action and its segments
		// are not controls it holds, so those keep answering here.
		if (this._origin(event)?.control) return;
		if (this.type === 'tree' && (key === 'ArrowRight' || key === 'ArrowLeft')) {
			this._onTreeHorizontal(event, key);
			return;
		}
		if (this.type === 'tree' && (key === 'Enter' || key === ' ')) {
			this._onTreeActivate(event);
			return;
		}
		if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'Home' && key !== 'End') return;
		const items = this._getInteractiveItems();
		if (items.length === 0) return;
		const current = items.findIndex((item) => item._rovingActive);
		let next: number;
		if (key === 'Home') {
			next = 0;
		} else if (key === 'End') {
			next = items.length - 1;
		} else {
			const dir = key === 'ArrowDown' ? 1 : -1;
			const base = current === -1 ? (dir === 1 ? -1 : 0) : current;
			next = (base + dir + items.length) % items.length; // wrap around
		}
		event.preventDefault();
		const target = items[next];
		// Every row, not just the interactive ones: Escape can leave the flag on a
		// row that holds a control but is no stop itself, and clearing only the
		// stops would leave two rows claiming to be the current one.
		this._setRovingActive(target);
		target.focus();
	}

	/**
	 * Escape: out of a control, back onto the row that holds it.
	 *
	 * One level up, not one step back. Shift+Tab retraces the order and lands on
	 * whatever came before, which is the row only from the first control of a
	 * row; from the second it is the first. This is the move that works wherever
	 * you are in the row, and it puts the arrow keys back in reach.
	 *
	 * It claims Escape at exactly this one level. On the row it claims nothing,
	 * so Escape carries on to whatever holds the list — a sheet, a dialog, or
	 * nothing at all. And a control showing a popover keeps it: that menu is the
	 * topmost thing you opened, so it is what the first Escape closes.
	 */
	private _onEscape(event: KeyboardEvent) {
		const hadPopover = this._popoverWasOpen;
		this._popoverWasOpen = false;
		const origin = this._origin(event);
		if (!origin?.control) return;
		if (hadPopover) return;
		event.preventDefault();
		event.stopPropagation();
		this._setRovingActive(origin.row);
		origin.row.focus();
	}

	/** Tree only: Right opens a closed branch and steps into an open one, Left
	 *  closes an open branch and steps out of a leaf. Opening and closing runs
	 *  through the row's own disclosure control, so `expanded` keeps being
	 *  written in one place — the consumer's handler. */
	private _onTreeHorizontal(event: KeyboardEvent, key: 'ArrowRight' | 'ArrowLeft') {
		const rows = this._getInteractiveItems();
		const current = rows.find((row) => row._rovingActive);
		if (!current) return;
		const children = current.childRows.filter(row => !row.hasAttribute('hidden'));
		const isOpen = children.length > 0 && current.expanded === true;

		if (key === 'ArrowRight') {
			if (children.length === 0) return;
			event.preventDefault();
			if (!isOpen) {
				current._activateDisclosure();
				return;
			}
			this._moveRovingTo(children[0]);
			return;
		}

		if (isOpen) {
			event.preventDefault();
			current._activateDisclosure();
			return;
		}
		const parent = current.parentRow;
		if (!parent) return;
		event.preventDefault();
		this._moveRovingTo(parent);
	}

	/**
	 * Tree only, and only while focus sits on the row ITSELF: a row that is its
	 * own control, and a segment you tabbed into, handle both keys
	 * natively, and acting here as well would fire twice.
	 *
	 * Enter does what the row is for — it follows the row's own link or button,
	 * or on a branch cut into segments the first one that is not the chevron.
	 * Space folds, the same thing Right and Left do, because a chevron is a
	 * button and Space is what a button answers to. A branch with nothing but a
	 * chevron takes Enter for folding too, so the key is never dead.
	 */
	private _onTreeActivate(event: KeyboardEvent) {
		const target = event.target;
		if (!(target instanceof Element) || target.tagName.toLowerCase() !== 'nldd-list-item') return;
		const row = target as NLDDListItem;
		if (row.shadowRoot?.activeElement) return;
		if (event.key === 'Enter' && row._activatePrimary()) {
			event.preventDefault();
			return;
		}
		if (row._activateDisclosure()) event.preventDefault();
	}

	private _moveRovingTo(row: NLDDListItem) {
		this._setRovingActive(row);
		row.focus();
	}

	private _warnArrowNav() {
		if (!import.meta.env?.DEV) return;
		if (this.hasAttribute('arrow-navigation')) {
			console.warn('nldd-list: `arrow-navigation` is the default now and the attribute does nothing; remove it.');
		}
		this._warnUnmanagedControls();
	}

	/** Reported once per element: a list that gains rows would otherwise repeat
	 *  the same line on every change. */
	private readonly _warnedUnmanaged = new WeakSet<Element>();

	private _unmanagedWarnScheduled = false;

	/**
	 * A control the row cannot reach: a custom element that keeps its tab stop in
	 * its own shadow root and has no `no-tab` to close it. Such a control stays a
	 * tab stop in EVERY row, which is exactly what the roving promises it is not,
	 * and the row does not even count as a stop for the arrow keys.
	 *
	 * Deferred, and re-run whenever the rows change. A slotted custom element has
	 * its shadow root the moment it connects, but Lit renders the content on the
	 * first update, so a check that runs in `firstUpdated` looks into an empty
	 * shadow root and finds nothing to warn about. Waiting for the element to be
	 * defined is not enough either: it has to have rendered.
	 */
	private _warnUnmanagedControls(): void {
		if (!import.meta.env?.DEV || !this._arrowNavActive) return;
		if (this._unmanagedWarnScheduled) return;
		this._unmanagedWarnScheduled = true;
		const check = async () => {
			this._unmanagedWarnScheduled = false;
			const rows = this._getPaintedRows();
			await Promise.all(rows.map((row) => row.updateComplete));
			for (const row of rows) {
				for (const el of Array.from(row.querySelectorAll('*'))) {
					if (el.closest('nldd-list-item') !== row) continue;
					// A segment is managed over its own channel (`_tabbable`), so it
					// needs no `no-tab`.
					if (el.tagName.toLowerCase() === 'nldd-list-item-segment') continue;
					if (!el.tagName.includes('-') || 'noTab' in el) continue;
					if (this._warnedUnmanaged.has(el)) continue;
					const upgraded = el as Element & { updateComplete?: Promise<unknown> };
					if (upgraded.updateComplete) await upgraded.updateComplete;
					if (!el.shadowRoot?.querySelector(SHADOW_TAB_STOP)) continue;
					// Nothing hidden on the way from the row: a menu item in a closed
					// menu is no tab stop of the row's, and the component that hides it
					// runs its own focus. Computed style, not checkVisibility(): that one
					// needs a laid-out box and answers false until the first layout.
					if (this._hiddenWithin(row, el)) continue;
					this._warnedUnmanaged.add(el);
					console.warn(`nldd-list: <${el.tagName.toLowerCase()}> in a list-item keeps its tab stop in its own shadow root and has no \`no-tab\`, so the row cannot take it out of the tab order and the arrow keys skip that row. If the rows of this list are not actions themselves, it is a form: set type="form" and the roving falls away. Otherwise give the component \`no-tab\`, or wrap the control in an nldd-list-item-segment.`);
				}
			}
		};
		void check();
	}

	private _hiddenWithin(row: Element, el: Element): boolean {
		for (let node: Element | null = el; node && node !== row; node = node.parentElement) {
			if (getComputedStyle(node).display === 'none') return true;
		}
		return false;
	}

	// — Drag: pointer ————————————————————————————————————————————————————————

	private _onPointerDown = (event: PointerEvent) => {
		if (!this.reorderable || this.type !== 'list') return;

		const path = event.composedPath() as Element[];
		const hasDragHandle = path.some(
			(el) => el instanceof Element && el.hasAttribute('reorderable-only'),
		);
		if (!hasDragHandle) return;

		const item = path.find(
			(el) => el instanceof Element && el.tagName.toLowerCase() === 'nldd-list-item',
		) as NLDDListItem | undefined;
		if (!item) return;

		event.preventDefault();
		this._lastPointerY = event.clientY;
		this._startDrag(item, event.clientY);
		// Restore focus suppressed by preventDefault
		const handle = path.find(
			(el) => el instanceof HTMLButtonElement,
		) as HTMLButtonElement | undefined;
		handle?.focus();
		this._pointerId = event.pointerId;
		this.setPointerCapture(event.pointerId);
		this.addEventListener('pointermove', this._onPointerMove);
		this.addEventListener('pointerup', this._onPointerUp);
		this.addEventListener('pointercancel', this._onPointerCancel);
	};

	private _lastPointerY = 0;

	private _onPointerMove = (event: PointerEvent) => {
		if (!this._draggingEl || !this._placeholder) return;

		// Move floating clone
		if (this._clone) {
			this._listRect = this.getBoundingClientRect();
			this._clone.style.setProperty('--_drag-clone-top', `${event.clientY - this._listRect.top - this._cloneOffsetY}px`);
		}

		const draggingDown = event.clientY >= this._lastPointerY;
		this._lastPointerY = event.clientY;

		const items = this._getItems();
		const nonDragging = items.filter((i) => i !== this._draggingEl);
		const pointerY = event.clientY;

		let toIndex = nonDragging.length; // default: end

		for (let i = 0; i < nonDragging.length; i++) {
			// nldd-list-item is display:contents so its own rect is zero — use the inner element
			const inner = nonDragging[i].shadowRoot?.querySelector('.list-item') ?? nonDragging[i];
			const rect = inner.getBoundingClientRect();
			const threshold = draggingDown ? rect.top : rect.bottom;
			if (pointerY < threshold) {
				toIndex = i;
				break;
			}
		}

		this._setDropIndex(toIndex);
	};

	private _onPointerUp = (_event: PointerEvent) => {
		this._endDrag();
	};

	private _onPointerCancel = () => {
		this._cancelDrag();
	};

	// — Keyboard reorder —————————————————————————————————————————————————————

	// ArrowUp/ArrowDown on a focused drag handle moves the item immediately.
	// Mirrors nldd-document-tab-bar: no grab-and-drop cycle — each arrow press
	// reorders the DOM, fires nldd-reorder and restores focus on the handle.
	private _onKeyDown = (event: KeyboardEvent) => {
		// Arrow-navigation and reorder both claim the arrow keys; _arrowNavActive
		// is false whenever reorderable wins, so the two never run together.
		if (this._arrowNavActive) {
			if (event.key === 'Escape') {
				this._onEscape(event);
				return;
			}
			this._onArrowNav(event);
			return;
		}
		if (!this.reorderable || this.type !== 'list') return;
		if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

		const path = event.composedPath() as Element[];
		const handle = path.find(
			(el) => el instanceof HTMLElement && el.hasAttribute('reorderable-only'),
		) as HTMLElement | undefined;
		if (!handle) return;

		const item = path.find(
			(el) => el instanceof Element && el.tagName.toLowerCase() === 'nldd-list-item',
		) as NLDDListItem | undefined;
		if (!item) return;

		const items = this._getItems();
		const fromIndex = items.indexOf(item);
		if (fromIndex === -1) return;

		const targetIndex = event.key === 'ArrowUp' ? fromIndex - 1 : fromIndex + 1;
		if (targetIndex < 0 || targetIndex >= items.length) return;

		event.preventDefault();

		// Capture the actual focused element (may live inside the handle's shadow DOM,
		// e.g. the <button> inside nldd-drag-handle-cell) so we can restore focus
		// after the consumer reorders the DOM in response to nldd-reorder.
		const focused = this._getDeepActiveElement() ?? handle;

		// Mirror pointer-drag semantics: don't mutate the DOM ourselves — emit
		// nldd-reorder with from/to indices and let the consumer reorder. toIndex
		// here is the target index relative to the CURRENT order (same contract
		// as pointer drag: fromIndex vs toIndex in the pre-move list).
		this.dispatchEvent(
			new CustomEvent<NLDDReorderEventDetail>('nldd-reorder', {
				detail: { fromIndex, toIndex: targetIndex },
				bubbles: true,
				composed: true,
			}),
		);
		this._announce(this._t('components.list.reorder-moved-text', { position: targetIndex + 1 }));

		// Wait for the consumer to reorder, then restore focus on the moved item's handle.
		requestAnimationFrame(() => focused.focus());
	};

	private _getDeepActiveElement(): HTMLElement | null {
		let active: Element | null = document.activeElement;
		while (active?.shadowRoot?.activeElement) {
			active = active.shadowRoot.activeElement;
		}
		return active instanceof HTMLElement ? active : null;
	}

	// — Drag: core ———————————————————————————————————————————————————————————

	private _startDrag(item: NLDDListItem, clientY = 0) {
		const items = this._getItems();
		const fromIndex = items.indexOf(item);
		if (fromIndex === -1) return;

		this._draggingEl = item;
		this._draggingFromIndex = fromIndex;
		this._currentDropIndex = fromIndex;

		const inner = item.shadowRoot?.querySelector<HTMLElement>('.list-item') ?? item;
		const rect = inner.getBoundingClientRect();

		// Insert placeholder at item's current position, sized to match the space the
		// row occupied: its own box plus the boundary margin that carries the divider,
		// so nothing below it shifts while the row is lifted.
		const boundary = parseFloat(getComputedStyle(inner).marginBlockEnd) || 0;
		this._placeholder = document.createElement('div');
		this._placeholder.className = 'nldd-list-drag-placeholder';
		this._placeholder.setAttribute('aria-hidden', 'true');
		this._placeholder.setAttribute('data-nldd-placeholder', '');
		this._placeholder.style.height = `${rect.height + boundary}px`;
		item.after(this._placeholder);

		item.classList.add('is-dragging');
		item.classList.add('is-dragging-pointer');
		this._listRect = this.getBoundingClientRect();
		this._cloneOffsetY = clientY - rect.top;

		// Clone the host (carries slotted light DOM), keep draggable so consumer
		// CSS doesn't hide reorderable-only cells in the clone
		const hostClone = item.cloneNode(true) as HTMLElement;
		hostClone.classList.remove('is-dragging');
		hostClone.classList.remove('is-dragging-pointer');
		hostClone.setAttribute('data-nldd-clone', '');

		this._clone = document.createElement('div');
		this._clone.className = 'list__drag-clone';
		this._clone.style.setProperty('--_drag-clone-top', `${clientY - this._listRect.top - this._cloneOffsetY}px`);
		this._clone.style.setProperty('--_drag-clone-left', `${rect.left - this._listRect.left}px`);
		this._clone.style.setProperty('--_drag-clone-width', `${rect.width}px`);
		this._clone.style.setProperty('--_drag-clone-height', `${rect.height}px`);
		this._clone.appendChild(hostClone);
		this.renderRoot.appendChild(this._clone);
	}

	/**
	 * Places the placeholder so the dragged item will land at position `toIndex`
	 * among the non-dragging items (0 = before first, nonDragging.length = after last).
	 */
	private _setDropIndex(toIndex: number) {
		if (!this._placeholder || !this._draggingEl) return;

		const nonDragging = this._getItems().filter((i) => i !== this._draggingEl);
		const clamped = Math.max(0, Math.min(nonDragging.length, toIndex));

		this._currentDropIndex = clamped;
		this._placeholder.remove();

		if (nonDragging.length === 0) {
			this._draggingEl.after(this._placeholder);
			return;
		}

		if (clamped === 0) {
			nonDragging[0].before(this._placeholder);
		} else {
			nonDragging[clamped - 1].after(this._placeholder);
		}
	}

	private _getDropIndex(): number {
		return this._currentDropIndex;
	}

	private _endDrag() {
		if (!this._draggingEl) return;

		const fromIndex = this._draggingFromIndex;
		const toIndex = this._getDropIndex();
		const movedItem = this._draggingEl;

		this._cleanupDrag();

		if (fromIndex !== toIndex) {
			this.dispatchEvent(
				new CustomEvent<NLDDReorderEventDetail>('nldd-reorder', {
					detail: { fromIndex, toIndex },
					bubbles: true,
					composed: true,
				}),
			);
			this._announce(this._t('components.list.reorder-dropped-text', { position: toIndex + 1 }));

			// Restore focus to the drag handle on the moved item after the
			// consumer has had a chance to reorder the DOM in response to nldd-reorder.
			requestAnimationFrame(() => {
				const handle = movedItem
					.querySelector('[reorderable-only]')
					?.shadowRoot?.querySelector<HTMLElement>('button');
				handle?.focus();
			});
		} else {
			this._announce(this._t('components.list.reorder-no-change-text'));
		}
	}

	private _cancelDrag() {
		if (!this._draggingEl) return;
		this._cleanupDrag();
		this._announce(this._t('components.list.reorder-canceled-text'));
	}

	private _cleanupDrag() {
		this._draggingEl?.classList.remove('is-dragging');
		this._draggingEl?.classList.remove('is-dragging-pointer');
		this._placeholder?.remove();
		this._clone?.remove();

		if (this._pointerId !== null) {
			try { this.releasePointerCapture(this._pointerId); } catch (e) { if (!(e instanceof DOMException)) throw e; }
			this._pointerId = null;
		}

		this.removeEventListener('pointermove', this._onPointerMove);
		this.removeEventListener('pointerup', this._onPointerUp);
		this.removeEventListener('pointercancel', this._onPointerCancel);

		this._draggingEl = null;
		this._draggingFromIndex = -1;
		this._placeholder = null;
		this._clone = null;
		this._cloneOffsetY = 0;
		this._listRect = null;
		this._currentDropIndex = -1;
	}

	// — i18n ————————————————————————————————————————————————————————————————

	private _t(key: keyof NLDDListTranslations, vars?: Record<string, string | number>): string {
		let str = this._mergedTranslations[key];
		if (vars) {
			for (const [k, v] of Object.entries(vars)) {
				str = str.replace(`{${k}}`, String(v));
			}
		}
		return str;
	}



	private _announce(message: string, assertive = false) {
		const selector = assertive ? '.list__assertive-announcer' : '.list__polite-announcer';
		const region = this.shadowRoot?.querySelector<HTMLElement>(selector);
		if (!region) return;
		region.textContent = '';
		// Double rAF forces screen readers to register the content change across browsers
		requestAnimationFrame(() => requestAnimationFrame(() => {
			region.textContent = message;
		}));
	}

	override render() {
		return template({
			itemsLabel: this.accessibleLabel || this._t('components.list.items-accessible-label'),
			hasToolbar: this._hasToolbar,
			type: this.type,
			isEmpty: this._isEmpty,
			hasItems: this._hasItems,
			hasEmptyState: this._hasEmptyState,
			hasNoResultsState: this._hasNoResultsState,
			listbox: {
				listboxId: this._listboxId,
				searchValue: this._searchValue,
				activeId: this._searchFocused ? this._activeId : '',
				searchPlaceholder: this._t('components.list.search-placeholder-label'),
				searchAccessibleLabel: this.accessibleLabel || this._t('components.list.search-placeholder-label'),
				searchClearLabel: this._t('components.list.search-clear-action'),
				hasSearchBarEnd: this._hasSearchBarEnd,
				onSearchInput: this._onSearchInput,
				onSearchKeyDown: this._onSearchKeyDown,
				onSearchFocus: this._onSearchFocus,
				onSearchBlur: this._onSearchBlur,
				onClearClick: this._onClearClick,
				onSearchBarEndSlotChange: this._onSearchBarEndSlotChange,
			},
		});
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-list': NLDDList;
	}
}
