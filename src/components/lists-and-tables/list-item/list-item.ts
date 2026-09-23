import { LitElement } from 'lit';
import type { PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { listItemStyles } from './list-item.styles.js';
import { template } from './list-item.template.js';
import { isPointerMode } from '../../../utilities/input-modality.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddListItemTranslations } from './list-item.i18n.js';
import type { NLDDList, ListType } from '../list/list.js';

export type ListItemSize = 'sm' | 'md';

/** Anything in a row's light DOM that is a tab stop of its own. `[tabindex]`
 *  counts because an authored one makes any element focusable; the value itself
 *  is read per element, and put back when the row becomes the current one. */
const OWN_TAB_STOP = 'a[href], button, input, select, textarea, [contenteditable]:not([contenteditable="false"]), [tabindex]';

/** What a control looked like before a roving row took it out of the tab order.
 *  `noTab` is undefined for a control without that property — a native one,
 *  where the tabindex is what moves instead. */
interface AuthoredTabState {
	noTab?: boolean;
	tabindex: string | null;
}

export type RovingControl = HTMLElement & { noTab?: boolean };

/** Keyed on the element, so a row that is re-rendered around the same control
 *  still knows what the consumer authored. */
const authoredTabState = new WeakMap<Element, AuthoredTabState>();

function authoredStateOf(el: RovingControl): AuthoredTabState {
	let authored = authoredTabState.get(el);
	if (!authored) {
		authored = { noTab: 'noTab' in el ? el.noTab : undefined, tabindex: el.getAttribute('tabindex') };
		authoredTabState.set(el, authored);
	}
	return authored;
}

function applyAuthoredTabState(el: RovingControl, authored: AuthoredTabState): void {
	if (authored.noTab !== undefined) {
		el.noTab = authored.noTab;
		return;
	}
	if (authored.tabindex === null) el.removeAttribute('tabindex');
	else el.setAttribute('tabindex', authored.tabindex);
}

/**
 * Puts one control in or out of the tab order on behalf of the row it sits in.
 *
 * A design-system control keeps its tab stop inside its own shadow root, where
 * a tabindex on the host cannot reach it, so it carries `no-tab` for exactly
 * this. Everything else is native and takes the tabindex directly. A consumer
 * who set either themselves keeps it: their `no-tab` or `tabindex="-1"` is a
 * decision, not a leftover.
 */
function setTabbable(el: RovingControl, tabbable: boolean): void {
	const authored = authoredStateOf(el);
	if (authored.noTab !== undefined) {
		el.noTab = authored.noTab || !tabbable;
		return;
	}
	if (tabbable) applyAuthoredTabState(el, authored);
	else el.setAttribute('tabindex', '-1');
}

function releaseTabbable(el: RovingControl): void {
	const authored = authoredTabState.get(el);
	if (!authored) return;
	applyAuthoredTabState(el, authored);
	authoredTabState.delete(el);
}

/** What counts as a control of its own inside a row that already is one. */
const NESTED_CONTROLS = [
	'nldd-list-item-segment', 'nldd-button', 'nldd-icon-button', 'nldd-link',
	'nldd-checkbox', 'nldd-radio-button', 'nldd-switch',
	'a[href]', 'button', 'input', 'select', 'textarea',
].join(', ');

/**
 * A row within an `nldd-list`. Renders as a link when `href` is set, as a
 * checkbox when `checkbox` is set, as a button when `button` is set, or as a
 * plain container otherwise. All cells and segments share one flat
 * slot, in source order.
 *
 * ## One action or several
 * With one action, make the row itself the control (`href`, `button`,
 * `checkbox` or `radio`): the whole row is then one hit area. With two or
 * more, give each its own `nldd-list-item-segment` and leave the row without
 * an action of its own. Both at once nests a control inside a control, and the
 * item warns about that in development.
 *
 * ## Geometry
 * Two rules govern every row:
 * 1. State fills always paint the WIDENED row geometry — the row box extended
 *    by the indicator inline inset on both sides — whether or not the row is
 *    interactive. Paint never differs between a selected plain row and a
 *    selected interactive row.
 * 2. The widened strip belongs to the ROW, never to a segment. A row with any
 *    action (its own `href`/`button`/`checkbox`, or a slotted segment) pulls
 *    itself outward (`is-interactive` host class → negative inline margin)
 *    and pads the row block back by the same amount, so content stays on the
 *    grid. A row-wide action owns that padding itself, making the whole
 *    widened box one hit area; slotted segments stay in the grid, so their
 *    footprint is position-independent and tree columns line up at any depth.
 *
 * ## Divider
 * By default the divider starts at the row's first text or title cell, so the
 * line lands on the words rather than on whatever leads up to them — an icon,
 * an avatar, a checkbox, or the spacers a tree indents with. Rows of different
 * shapes then still line their dividers up with each other, and a tree's
 * dividers step inward with its indentation. Text inside an
 * `nldd-list-item-segment` counts as the row's content, and the marker is that
 * text cell rather than the action: the action carries its own inline padding,
 * so its edge sits before the words. A row with no text or title cell keeps the
 * full content width. Mark a cell with `divider-start` and/or `divider-end` to
 * place it yourself instead — an explicit marker replaces the derived one
 * entirely, so `divider-start` on the leading cell restores the full-width
 * line. Multiple markers resolve as the union: first `divider-start` through
 * last `divider-end`. A start past the last end is an authoring error — the
 * item DEV-warns and falls back to the full content width.
 *
 * ## Disclosure
 * A branch row can disclose its children in two ways: a dedicated
 * `nldd-list-item-segment[disclosure]` segment (only the chevron is clickable),
 * or the row itself as the control (`button` + `expanded`, the whole row
 * toggles). In the second case, mark the chevron's `nldd-icon-cell` with
 * `disclosure` and the row turns it with `expanded` — the same affordance,
 * without having to trade a clickable row for a turning chevron.
 *
 * `checkbox` makes the WHOLE row the control: the inner action becomes a
 * `role="checkbox"` button carrying `aria-checked`, it toggles `checked` on
 * activation and fires `change`. Slot an `nldd-checkbox decorative` (or any
 * glyph) before the text: it only shows the state, since the row already
 * conveys role and state, and a second focusable control would double the tab
 * stops. Do NOT nest a real `<input type="checkbox">` in the action: interactive
 * content inside a `<button>` is invalid HTML and AT announces the button, not
 * the checked state. A `<label>` variant is not offered for the same reason it
 * cannot work — label-to-input association walks the DOM tree, and a slotted
 * input is not a descendant of a label in the shadow root.
 *
 * When it renders as a link, `target` and `rel`
 * are forwarded to the inner `<a>` (e.g. `target="_blank" rel="noopener noreferrer"`). With
 * `target="_blank"` the item also injects a visually hidden "opens in new tab"
 * announcement for assistive technology (WCAG 2.1 SC 3.2.2).
 *
 * The item synchronizes its ARIA with its parent `nldd-list`'s `type`:
 * - `list` parent       → `role="listitem"`
 * - `navigation` parent → `role="listitem"` + `aria-current="page"` on the
 *   inner `<a>` / `<button>` when `selected`
 * - `listbox` parent    → `role="option"` + `aria-selected` reflecting `selected`.
 *   The list points its search input's `aria-activedescendant`
 *   at the active option via `_highlighted` (separate from `selected`).
 *
 * @element nldd-list-item
 *
 * @attr {'sm'|'md'} size - Row size (default: 'md'). Pushed onto the cells whose `size` means the same scale (nldd-text-cell, nldd-drag-handle-cell), so it is written once per row instead of once per cell. A size set on the cell itself wins. Cells where `size` means something else — pixels on nldd-icon-cell / nldd-spacer-cell, a heading scale on nldd-title-cell — are left alone.
 * @attr {string} href - Renders the item as an `<a>` with this URL. Wins over `checkbox` and `button`; without any of the three the item is a plain container with no action.
 * @attr {string} target - Link target forwarded to the `<a>` (e.g. '_blank'); only applies with `href`. With '_blank' a visually hidden "opens in new tab" announcement is added for assistive technology.
 * @attr {string} rel - Link rel forwarded to the `<a>`, only with `href`; with target '_blank', 'noopener noreferrer' is added to whatever you set
 * @attr {boolean} button - Renders the item as a `<button>`. Last of the three: `href` and `checkbox` both win over it.
 * @attr {boolean} checkbox - Makes the whole row a `role="checkbox"` control. Wins over `button`, loses to `href`.
 * @attr {boolean} radio - Makes the whole row one radio of a group: the action becomes a `role="radio"` button carrying `aria-checked`, and activation sets `checked` (never clears it) and fires `change`. Put the rows in an `nldd-list type="radiogroup"`, which is what makes them a set. Wins over `button`, loses to `href` and `checkbox`. The arrow keys move focus without checking, where a native radio group and `nldd-radio-button-group` check as they go: a row can carry more than a label, so stepping past one should not commit it.
 * @attr {boolean} reorderable - Set by the parent `nldd-list` when its own `reorderable` is on (with `type="list"`); consumers do not set this. Serves as a CSS hook for drag handle visibility.
 * @attr {boolean} selected - Marks the item as selected: it is one of the rows you picked. Selection is consumer-managed; the list never sets it. In a `navigation` parent it puts `aria-current="page"` on the inner action, in a `listbox` parent it drives `aria-selected`.
 * @attr {boolean} checked - Checked state of a `checkbox` or `radio` row. A checkbox row toggles it on activation, a radio row only ever sets it
 * @attr {boolean} expanded - Disclosure state. Drives the `children` group's visibility AND supplies `aria-expanded` — to the row's own control when the row is interactive, or to the segment marked `disclosure`. Written once either way; the item DEV-warns when there is nowhere for it to live.
 * @attr {boolean} current - Marks the item as the one you are on: the page a menu row points at, the record a list has open. Exactly one row in a list carries it, where `selected` may be on many. It paints like `selected` at rest, and takes the highlighted fill while focus is anywhere in the row — including inside a nested `nldd-list-item-segment`, which is what a segmented row needs: the focus never reaches the row's own control, because there is none. In a `navigation` parent it puts `aria-current="page"` on the inner action. On a segmented row set it on the segment that holds the link instead: the row reads `current` off its own segments and paints itself, so it is written once, where `aria-current` belongs.
 * @attr {boolean} disabled - Switches the row's own control off: a `button` or `checkbox` row stops responding and dims, a `href` row gets `aria-disabled` and its click is blocked (a link cannot be disabled natively). A row without a control of its own has nothing to switch off, and segments carry their own `disabled`. The arrow keys skip a disabled row.
 *
 * @slot - Cells and segments, in source order. Anything else, bare text included, gets none of a cell's typography, size and alignment, and warns in development.
 * @slot children - Child rows of a branch in an `nldd-list type="tree"`. Rendered as a `role="group"` below the row, hidden while `expanded` is false. The nesting IS the hierarchy, so aria-level / -posinset / -setsize are derived, not authored. The group has no styling of its own: repeat a spacer-cell per level to indent, or show depth some other way.
 *
 * @fires change - On a `checkbox` row after it toggles, and on a `radio` row when it becomes checked; detail: { checked: boolean }
 */
@customElement('nldd-list-item')
export class NLDDListItem extends withTranslations(LitElement, nlddListItemTranslations) {
	static override styles = [listItemStyles];

	@property({ reflect: true, converter: reflectNonDefault<ListItemSize>('md') })
	size: ListItemSize = 'md';

	/** When set, renders the item as a link. */
	@property({ reflect: true })
	href?: string;

	/**
	 * Link target (e.g. '_blank' to open in a new tab). Forwarded to the `<a>`; only applies with href.
	 * When set to '_blank', the item appends a visually hidden "opens in new tab" announcement to the
	 * link so the change of context is conveyed to assistive technology (WCAG 2.1 SC 3.2.2). Override
	 * the wording via the `translations` property.
	 */
	@property({ reflect: true })
	target?: string;

	/** Link rel, forwarded to the `<a>` with href. With target '_blank',
	 *  'noopener noreferrer' is added to it. */
	@property({ reflect: true })
	rel?: string;

	/** When set, renders the item as a button; ignored when href is set. */
	@property({ type: Boolean, reflect: true })
	button = false;

	/** When set, the whole row is the checkbox control. Ignored when href is set. */
	@property({ type: Boolean, reflect: true })
	checkbox = false;

	/** When set, the whole row is one radio of a group. Ignored when href is set. */
	@property({ type: Boolean, reflect: true })
	radio = false;

	/** Set by the parent nldd-list when reorderable is enabled. Used as a CSS hook for drag handle visibility. */
	@property({ type: Boolean, reflect: true })
	reorderable = false;

	@property({ type: Boolean, reflect: true })
	selected = false;

	/** Checked state of a `checkbox` or `radio` row. A checkbox row toggles it on
	 *  activation; a radio row only ever sets it, because picking the option you
	 *  already have is not a way to unpick it. */
	@property({ type: Boolean, reflect: true })
	checked = false;

	/**
	 * Disclosure state of a row that opens something (a tree row's children, a
	 * details panel). Reflected as `aria-expanded` on the row's own control —
	 * `listitem` does not support the property, a `<button>` / `<a>` does. Leave
	 * the attribute off entirely when the row discloses nothing.
	 */
	@property({ type: Boolean, reflect: true })
	expanded?: boolean;

	/**
	 * The row you are on, as opposed to the rows you picked (`selected`).
	 *
	 * Kept apart because the two say different things and a list can show both:
	 * a checkbox list where three rows are ticked and one is open. At rest they
	 * paint the same, so a menu reads the same as it always did; the difference
	 * shows when focus is in the row.
	 */
	@property({ type: Boolean, reflect: true })
	current = false;

	/**
	 * Switches off the row's own control.
	 *
	 * Only the row's own: a row built out of segments has no control here, and
	 * each segment carries its own `disabled`. A link cannot be disabled the way
	 * a button can, so there it is `aria-disabled` plus a blocked click, the
	 * same trade `nldd-button` makes.
	 */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	@state()
	private _showChildren = false;

	@state()
	private _parentType: ListType = 'list';

	/** Set by the parent nldd-list when it runs the roving tabindex (everywhere
	 *  except a listbox and a reorderable list).
	 *  Switches the inner action from a normal tab stop to a roving one. */
	@state()
	_arrowNavigation = false;

	/** Set by the parent nldd-list: while the roving runs, exactly one item
	 *  is the roving entry point (tabindex 0); the rest are tabindex -1. */
	@state()
	_rovingActive = false;

	/** Set by the parent nldd-list in `type="listbox"`: marks this option as
	 *  highlighted — the active descendant the search input's `aria-activedescendant`
	 *  points at. Kept SEPARATE from `selected`: the highlight moves with the arrow
	 *  keys, selection stays consumer-managed. Named for the visual state (not
	 *  `_active`, which would clash with the pressed / `:active` feedback). */
	@state()
	_highlighted = false;

	@query('.list-item__action')
	private _action?: HTMLElement;

	private _isBoxed = false;

	@state()
	private _hasCheckedSegment = false;

	private _lightDomObserver: MutationObserver | null = null;

	/** The controls in this row the roving takes in and out of the tab order.
	 *  Rebuilt when the row's light DOM changes, so a keypress does not walk
	 *  every cell of every row again. */
	private _rovingControlsCache: RovingControl[] | null = null;

	/** Watches the row and its divider-marker cells for size changes; marker
	 *  insets are measured, so any reflow can move them. */
	private _dividerMarkerObserver: ResizeObserver | null = null;

	private _observedMarkerTargets: Element[] = [];

	private _warnedDegenerateDivider = false;

	private _warnedChildrenOutsideTree = false;
	private _warnedStrayContent = false;
	private _warnedNestedControl = false;

	override connectedCallback() {
		super.connectedCallback();
		// Before the children upgrade — see _captureAuthoredCellSizes.
		this._captureAuthoredCellSizes();
		// Skip setup for drag clones — they are visual-only copies inside nldd-list's shadow root
		if (this.hasAttribute('data-nldd-clone')) return;
		this.setAttribute('role', 'listitem');
		// Attach focus/click listeners here (not firstUpdated) so they are
		// re-attached when the element is removed and re-inserted into the DOM.
		// _action is resolved lazily via @query inside the handlers.
		this.addEventListener('focusin', this._handleFocusIn);
		this.addEventListener('focusout', this._handleFocusOut);
		this.addEventListener('click', this._handleClick);
		// Press feedback: shown on press, cleared on release or when a touch
		// turns into a scroll (the browser fires pointercancel for that pointer),
		// so `active` never sticks while the user scrolls the list. The release
		// is watched on the window rather than here, because a button let go
		// outside the row fires nowhere near it and the feedback would stay on.
		this.addEventListener('pointerdown', this._onPointerDown);
		this.addEventListener('mousedown', this._onMouseDown);
		// Light-DOM state the row derives styling from: a checked checkbox-
		// segment (row-wide selected fill), which segments own a row edge, and
		// the divider markers. Attribute observation, not events: consumers
		// also set these programmatically via setAttribute.
		this._lightDomObserver = new MutationObserver(() => this._onLightDomChange());
		this._lightDomObserver.observe(this, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ['checked', 'current', 'divider-start', 'divider-end'],
		});
		this._onLightDomChange();
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('focusin', this._handleFocusIn);
		this.removeEventListener('focusout', this._handleFocusOut);
		this.removeEventListener('click', this._handleClick);
		this.removeEventListener('pointerdown', this._onPointerDown);
		this.removeEventListener('mousedown', this._onMouseDown);
		this._clearPressed();
		this._lightDomObserver?.disconnect();
		this._lightDomObserver = null;
		this._dividerMarkerObserver?.disconnect();
		this._dividerMarkerObserver = null;
	}

	private _onLightDomChange(): void {
		this._updateCheckedSegment();
		this._updateCurrentSegment();
		this._updateInteractive();
		this._measureDividerMarkers();
		this._rovingControlsCache = null;
		// A framework can fill a row in a later pass than the one that put the row
		// in the list, so both have to run again: the tab stops inside this row,
		// and the list's choice of which rows the arrows stop at — a row that just
		// gained its only control was not a stop when that choice was made.
		if (this._arrowNavigation) {
			this._syncRovingTabStops();
			this._parentList?._updateRoving();
		}
	}

	private get _parentList(): NLDDList | null {
		return this.closest('nldd-list');
	}

	/**
	 * The controls in this row that own a tab stop: a design-system control that
	 * carries `no-tab`, or anything natively focusable. Segments are left
	 * out — they have their own channel (`_tabbable`) — but a control slotted
	 * inside one is not, so it is managed here.
	 *
	 * Custom elements that have not upgraded yet cannot answer whether they carry
	 * `no-tab`, so the cache is dropped and the row re-syncs once they do.
	 */
	private _rovingControls(): RovingControl[] {
		if (this._rovingControlsCache) return this._rovingControlsCache;
		const pending = new Set<string>();
		const controls = this._ownDescendants<RovingControl>('*').filter((el) => {
			const tag = el.tagName.toLowerCase();
			if (tag === 'nldd-list-item-segment') return false;
			if (tag.includes('-') && !customElements.get(tag)) {
				pending.add(tag);
				return false;
			}
			return 'noTab' in el || el.matches(OWN_TAB_STOP);
		});
		this._rovingControlsCache = controls;
		pending.forEach((tag) => {
			customElements.whenDefined(tag).then(() => {
				this._rovingControlsCache = null;
				if (this._arrowNavigation) this._syncRovingTabStops();
			});
		});
		return controls;
	}

	/**
	 * Whether the arrow keys stop at this row.
	 *
	 * Anything you can operate makes a row a stop: its own link, button or
	 * checkbox, a segment, or a control sitting in one of its cells. A
	 * row of nothing but text is skipped, because focus that leads nowhere is a
	 * dead end for a keyboard.
	 *
	 * @internal Read by the parent nldd-list.
	 */
	get _isRovingStop(): boolean {
		// Nothing to land on: a disabled control is not focusable, so a stop there
		// would swallow the arrow key and leave focus where it was.
		if (this.disabled) return false;
		if (this.href || this.button || this.checkbox || this.radio) return true;
		if (this._ownDescendants('nldd-list-item-segment:not([disabled])').length > 0) return true;
		return this._rovingControls().some((control) => !control.hasAttribute('disabled'));
	}

	/**
	 * A segment marked `current` makes the whole row the current one.
	 *
	 * A row cut into segments has no control of its own, so `aria-current="page"`
	 * belongs on the segment that holds the link. Written there, the row would
	 * stay unpainted and the consumer had to set `current` twice, once for the
	 * semantics and once for the color, with nothing to catch the two drifting
	 * apart. The row reads it off its own segments instead — reading, not
	 * writing: the attributes stay the consumer's.
	 */
	private _updateCurrentSegment(): void {
		this.toggleAttribute(
			'data-current',
			this._ownDescendants('nldd-list-item-segment[current]').length > 0,
		);
	}

	/** A checked checkbox-segment reads as "this row is selected", so the fill
	 *  covers the whole row — including a disclosure segment — instead of
	 *  stopping at the segment boundary. Scoped to own descendants: a checked
	 *  row in a nested branch must not light up its ancestors. */
	private _updateCheckedSegment(): void {
		this._hasCheckedSegment =
			this._ownDescendants('nldd-list-item-segment[checkbox][checked]').length > 0;
	}

	/** A row with any action — its own href/button/checkbox or a slotted
	 *  segment — carries the widened geometry: negative host margin plus the
	 *  compensating row padding (see the geometry rules in the class doc).
	 *
	 *  An segment at a row edge owns the padding for that side itself,
	 *  so the row drops its own there and the segment lands on the row's edge.
	 *  Stamped as classes because the CSS cannot ask: `:has()` is not allowed
	 *  inside `:host()`, and the row's own padding is what has to change — a
	 *  `::slotted()` rule could only reach the segment. */
	private _updateInteractive(): void {
		const interactive =
			!!this.href || this.button || this.checkbox || this.radio ||
			this._ownDescendants('nldd-list-item-segment').length > 0;
		this.classList.toggle('is-interactive', interactive);

		// The row's own children, not the branch's child rows: those go to the
		// `children` slot and render BELOW the row, so on a branch row the last
		// element child is a nested row rather than the row's trailing segment.
		const ownChildren = Array.from(this.children)
			.filter(el => el.getAttribute('slot') !== 'children');
		const isSegment = (el: Element | undefined) => el?.tagName.toLowerCase() === 'nldd-list-item-segment';
		this.classList.toggle('has-leading-segment', isSegment(ownChildren[0]));
		this.classList.toggle('has-trailing-segment', isSegment(ownChildren[ownChildren.length - 1]));
	}

	override willUpdate(changed: PropertyValues) {
		super.willUpdate(changed);
		// Before the first render, so the row is painted with the list's variant and
		// type right away. Setting them in `firstUpdated` asks for a second render
		// from inside the first.
		if (this.hasUpdated || this.hasAttribute('data-nldd-clone')) return;
		this._syncWithList();
	}

	override firstUpdated() {
		// Clones are visual-only copies inside nldd-list's shadow root: their
		// classes and stamped attributes came along with cloneNode, so no sync.
		if (this.hasAttribute('data-nldd-clone')) return;
		this._observeChildrenSlot();
		// On the shadow root, not on the slot: the default slot is re-rendered
		// inside a different wrapper when the row becomes a link or a button.
		this.renderRoot.addEventListener('slotchange', this._warnOnStrayContent);
		// Read out of the row's own shadow DOM, so not before the first render,
		// and deferred out of the update cycle: setting the state here would
		// schedule a second update from inside the first.
		queueMicrotask(() => this._updateChildren());
		this._relayExpanded();
		// First measurement after the first render: the marker offsets need
		// laid-out boxes.
		this._measureDividerMarkers();
	}

	/**
	 * Cells whose `size` means the sm/md scale. NOT every cell: `size` on
	 * nldd-icon-cell and nldd-spacer-cell is a pixel value and on nldd-title-cell
	 * a 1-6 heading scale, so pushing 'sm' there would corrupt them.
	 */
	private static readonly SIZED_CELLS = 'nldd-text-cell, nldd-drag-handle-cell';

	/** Remembers the size a cell was authored with, so a later push can restore it. */
	private _ownCellSize = new WeakMap<Element, string | null>();

	/**
	 * The row's own descendants for `selector` — everything down to and inside
	 * its segments, but NOT inside a nested row. In a tree the child rows
	 * are DOM children of this row, so a plain querySelectorAll would push this
	 * row's state into theirs (a parent's `expanded` turning every nested
	 * chevron, its `size` overwriting theirs). A `:scope >` child selector is
	 * too strict the other way: cells legitimately sit one level deeper, inside
	 * an nldd-list-item-segment.
	 */
	private _ownDescendants<T extends Element>(selector: string): T[] {
		return Array.from(this.querySelectorAll<T>(selector))
			.filter(el => el.closest('nldd-list-item') === this);
	}

	/**
	 * Records the authored `size` before the cells upgrade. Custom elements
	 * upgrade in document order, so the item's connectedCallback runs before its
	 * children's — the only moment an authored `size="md"` is still readable.
	 * After upgrade `reflectNonDefault` strips it, making it indistinguishable
	 * from no attribute at all.
	 */
	private _captureAuthoredCellSizes(): void {
		this._ownDescendants(NLDDListItem.SIZED_CELLS).forEach(cell => {
			if (!this._ownCellSize.has(cell)) {
				this._ownCellSize.set(cell, cell.getAttribute('size'));
			}
		});
	}

	/**
	 * Pushes the row's size onto its sized cells so `size="sm"` is written once
	 * instead of on the row and on every cell. An explicit size on the cell wins
	 * and survives later pushes.
	 */
	private _propagateSize(): void {
		this._captureAuthoredCellSizes();
		this._ownDescendants(NLDDListItem.SIZED_CELLS).forEach(cell => {
			const own = this._ownCellSize.get(cell);
			if (own !== null && own !== undefined) return;
			cell.setAttribute('size', this.size);
		});
	}

	override updated(changed: Map<string, unknown>) {
		if (changed.has('selected') || changed.has('current') || changed.has('button') || changed.has('checkbox') || changed.has('radio') || changed.has('href') || changed.has('_parentType')) {
			this._updateAriaState();
		}
		if (changed.has('button') || changed.has('checkbox') || changed.has('radio') || changed.has('href')) {
			this._updateInteractive();
			this._warnOnNestedControl();
		}
		if (changed.has('expanded')) {
			this._relayExpanded();
			this._warnOnStrayExpanded();
		}
		if (changed.has('_arrowNavigation') || changed.has('_rovingActive')) {
			this._syncRovingTabStops();
		}
		// A row that switches off mid-flight stops being a stop, but the tab stop it
		// already holds does not move by itself: a disabled anchor keeps its
		// tabindex, so Tab would land on a row that answers to nothing until some
		// unrelated change happened to re-run the roving.
		if (changed.has('disabled')) {
			this._syncRovingTabStops();
			this._parentList?._updateRoving();
		}
		this._propagateSize();
	}

	/**
	 * A row WITH children is a branch, and a branch is either open or closed —
	 * there is no third state. So an absent `expanded` reads as collapsed there,
	 * and aria-expanded is always emitted. On a row without children an absent
	 * attribute keeps its other meaning: this row discloses nothing, emit no
	 * aria-expanded at all. Without this split, `?expanded=\${false}` (which
	 * removes the attribute) would leave a branch that never collapses.
	 */
	private get _resolvedExpanded(): boolean | undefined {
		if (this._showChildren) return this.expanded === true;
		return this.expanded;
	}

	/** Segments marked `disclosure` announce the row's expanded state, so the
	 *  consumer writes it once — here, where it also drives the children group. */
	private _relayExpanded(): void {
		this._ownDescendants<HTMLElement & { _rowExpanded?: boolean }>('nldd-list-item-segment[disclosure]')
			.forEach(segment => { segment._rowExpanded = this._resolvedExpanded; });
	}

	/** `expanded` needs a control to sit on; a plain container has none. */
	private _warnOnStrayExpanded(): void {
		if (!import.meta.env?.DEV) return;
		if (this.expanded === undefined) return;
		if (this.href || this.button || this.checkbox) return;
		if (this._ownDescendants('nldd-list-item-segment[disclosure]').length > 0) return;
		console.warn('nldd-list-item: `expanded` needs somewhere to live — make the row interactive (href, button or checkbox), or mark the segment that does the disclosing with `disclosure`.');
	}

	/** A row takes cells and segments. Anything else gets none of the typography,
	 *  size and alignment a cell brings, and bare text in a clickable row falls
	 *  back to the browser's button font. */
	private _warnOnStrayContent = (e: Event): void => {
		if (!import.meta.env?.DEV || this._warnedStrayContent) return;
		const slot = e.target as HTMLSlotElement;
		if (slot.name) return;
		const stray = slot.assignedNodes({ flatten: true }).find((node) => {
			if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').trim() !== '';
			if (node.nodeType !== Node.ELEMENT_NODE) return false;
			const tag = (node as Element).localName;
			return tag !== 'nldd-list-item-segment' && !(tag.startsWith('nldd-') && tag.endsWith('-cell'));
		});
		this._warnOnNestedControl();
		if (!stray) return;
		this._warnedStrayContent = true;
		const what = stray.nodeType === Node.TEXT_NODE
			? `bare text ("${stray.textContent!.trim().slice(0, 40)}")`
			: `<${(stray as Element).localName}>`;
		console.warn(`nldd-list-item: ${what} sits directly in a row. A row takes cells and segments (nldd-text-cell, nldd-icon-cell, nldd-list-item-segment, …). Anything else gets none of their typography, size and alignment, and bare text in a clickable row falls back to the browser's button font. Wrap it in a cell.`);
	};

	/** A row that is its own control cannot hold another one: a control inside a
	 *  link or button is invalid HTML, doubles the tab stop, and a press on it can
	 *  set off the row as well. A glyph that only shows the row's state is fine:
	 *  a `decorative` radio button, or a checkbox marked `aria-hidden`. */
	private _warnOnNestedControl(): void {
		if (!import.meta.env?.DEV || this._warnedNestedControl) return;
		if (this.hasAttribute('data-nldd-clone')) return;
		if (!(this.href || this.button || this.checkbox || this.radio)) return;
		const nested = [...this.children]
			.filter((child) => !child.slot)
			.flatMap((child) => [child, ...child.querySelectorAll('*')])
			.find((el) => el.matches(NESTED_CONTROLS) && !el.matches('[decorative]') && !el.closest('[aria-hidden="true"], [inert]'));
		if (!nested) return;
		this._warnedNestedControl = true;
		console.warn(`nldd-list-item: <${nested.localName}> sits in a row that is its own control (href, button, checkbox or radio). A control inside a control is invalid HTML and doubles the tab stop. With more than one action, give each its own nldd-list-item-segment and leave the row without an action.`);
	}

	/** True when the item is an option in a `type="listbox"` parent. */
	get _isListboxOption(): boolean {
		return this._parentType === 'listbox';
	}

	/**
	 * Reads the initial variant + type from the closest parent nldd-list, before
	 * the first render, so the item is styled correctly on first paint. Later changes
	 * are PUSHED by the list: its `updated` / `_updateItems` calls `_applyVariant`
	 * and `_applyParentType` on every item, so the list is the single source of
	 * truth and a runtime variant/type switch (or an item moved to another list)
	 * always tracks its current parent.
	 */
	private _syncWithList() {
		const list = this.closest<NLDDList>('nldd-list');
		if (!list) {
			if (import.meta.env?.DEV) {
				console.warn('nldd-list-item: no parent nldd-list found. Variant/type sync will not work if appended into a list after first render.');
			}
			return;
		}
		this._applyVariant(list.variant);
		this._applyParentType(list.type);
	}

	_applyVariant(variant: string) {
		this._isBoxed = variant.startsWith('box');
		this._relayToChildren(item => item._applyVariant(variant));
		this.classList.toggle('is-boxed', this._isBoxed);
	}

	_applyParentType(type: ListType) {
		this._parentType = type;
		this._relayToChildren(item => item._applyParentType(type));
		// Segments need the list type too: in a listbox they degrade to a
		// plain container, since an `option` may not hold interactive descendants.
		// Own segments only — nested rows get the relay above and push their own.
		this._ownDescendants<HTMLElement & { _applyParentType?: (t: string) => void }>('nldd-list-item-segment')
			.forEach(segment => segment._applyParentType?.(type));
	}

	/** Nested rows sit in this item's `children` slot, not the list's, so a plain
	 *  `querySelector` from the list walks past them. */
	get childRows(): NLDDListItem[] {
		return Array.from(this.children)
			.filter(el => el.getAttribute('slot') === 'children' && el.tagName.toLowerCase() === 'nldd-list-item') as NLDDListItem[];
	}

	/** Every push the item receives is relayed one level down. */
	private _relayToChildren(fn: (item: NLDDListItem) => void): void {
		this.childRows.forEach(fn);
	}

	private _updateAriaState() {
		// In a listbox parent the item is an `option`, not a `listitem`, and
		// carries aria-selected so AT announces selection state. The active
		// option (the input's aria-activedescendant) is conveyed via `_highlighted`
		// (a highlight class), kept separate from selection.
		if (this._parentType === 'radiogroup') {
			// The action inside carries role="radio", and a radiogroup's children
			// are its radios: a listitem in between would break that pairing.
			this.setAttribute('role', 'none');
			this.removeAttribute('aria-selected');
		} else if (this._parentType === 'tree') {
			this.setAttribute('role', 'treeitem');
			this.removeAttribute('aria-selected');
		} else if (this._isListboxOption) {
			this.setAttribute('role', 'option');
			this.setAttribute('aria-selected', String(this.selected));
		} else {
			this.setAttribute('role', 'listitem');
			this.removeAttribute('aria-selected');
		}

		// aria-current on the inner action (link/button) — navigation only
		const action = this._action;
		if (this._parentType === 'navigation' && (this.current || this.selected) && action) {
			action.setAttribute('aria-current', 'page');
		} else {
			action?.removeAttribute('aria-current');
		}
	}

	/**
	 * Measures the divider markers and writes the result as `--_divider-inset-
	 * start/-end` on the host. No markers → the vars are cleared and CSS falls
	 * back to the content width. Union semantics: the divider runs from the
	 * FIRST `divider-start` to the LAST `divider-end`; a side without markers
	 * keeps its default. Insets are measured against the row block (the widened
	 * box on interactive rows), so the values compose with the edge geometry.
	 */
	/**
	 * The cell the divider starts at when nobody said otherwise: the row's first
	 * text or title cell. The line lands on the words rather than on whatever
	 * leads up to them — an icon, an avatar, a checkbox, or the spacers a tree
	 * indents with — so rows of different shapes still line their dividers up
	 * with each other. Put `divider-start` on an earlier cell to get the
	 * full-width line back.
	 */
	private _implicitDividerStart(): Element[] {
		// The marker is the CELL, never a segment around it: the action
		// carries its own inline padding, so its edge sits before the text. Own
		// descendants, so a text inside a segment counts as this row's content
		// while a nested row's text does not.
		// All of them, not just the first: a row that swaps cells per breakpoint
		// hides one and shows another, and handing over only the hidden one would
		// leave the measurement with nothing and drop the divider back to the full
		// width. The visibility filter downstream picks the first one that renders,
		// the same way it does for explicit markers.
		return this._ownDescendants('nldd-text-cell, nldd-title-cell');
	}

	private _measureDividerMarkers(): void {
		if (this.hasAttribute('data-nldd-clone')) return;
		const explicitStarts = this._ownDescendants('[divider-start]');
		const starts = explicitStarts.length ? explicitStarts : this._implicitDividerStart();
		const ends = this._ownDescendants('[divider-end]');

		// Re-target the resize observer ONLY when the marker set changed: every
		// observe() fires an initial notification, so retargeting on each
		// measurement would loop the observer on itself.
		const targets = starts.length || ends.length ? [this as Element, ...starts, ...ends] : [];
		const sameTargets = targets.length === this._observedMarkerTargets.length
			&& targets.every((target, i) => target === this._observedMarkerTargets[i]);
		if (!sameTargets) {
			this._dividerMarkerObserver?.disconnect();
			this._observedMarkerTargets = targets;
			if (targets.length) {
				this._dividerMarkerObserver ??= new ResizeObserver(() => this._measureDividerMarkers());
				targets.forEach(target => this._dividerMarkerObserver!.observe(target));
			} else {
				this._dividerMarkerObserver = null;
			}
		}
		if (targets.length === 0) {
			this.style.removeProperty('--_divider-inset-start');
			this.style.removeProperty('--_divider-inset-end');
			return;
		}

		const block = this.shadowRoot?.querySelector('.list-item');
		if (!block) return;
		const blockRect = block.getBoundingClientRect();
		if (blockRect.width === 0) return;
		const rtl = getComputedStyle(this).direction === 'rtl';
		const startInsetOf = (rect: DOMRect) =>
			rtl ? blockRect.right - rect.right : rect.left - blockRect.left;
		const endInsetOf = (rect: DOMRect) =>
			rtl ? rect.left - blockRect.left : blockRect.right - rect.right;

		// A marker that is not rendered (a cell hidden per breakpoint with
		// hide-below, say) has an empty rect, and an empty rect measures as inset
		// 0: the divider would start at the row's edge and bleed out of it. Skip
		// them here rather than in `targets` — the observer keeps watching them,
		// so the divider re-measures the moment such a cell comes back.
		const rendered = (el: Element) => el.getClientRects().length > 0;
		const visibleStarts = starts.filter(rendered);
		const visibleEnds = ends.filter(rendered);

		// Union: smallest start inset (= first marker) and smallest end inset
		// (= last marker) win.
		const insetStart = visibleStarts.length
			? Math.min(...visibleStarts.map(el => startInsetOf(el.getBoundingClientRect())))
			: null;
		const insetEnd = visibleEnds.length
			? Math.min(...visibleEnds.map(el => endInsetOf(el.getBoundingClientRect())))
			: null;

		if (insetStart !== null && insetEnd !== null
			&& blockRect.width - insetStart - insetEnd <= 0) {
			// A start past the last end: authoring error, fall back to full width.
			if (import.meta.env?.DEV && !this._warnedDegenerateDivider) {
				this._warnedDegenerateDivider = true;
				console.warn('nldd-list-item: divider-start ligt voorbij de laatste divider-end; de divider valt terug op de volle contentbreedte.');
			}
			this.style.removeProperty('--_divider-inset-start');
			this.style.removeProperty('--_divider-inset-end');
			return;
		}
		if (insetStart !== null) this.style.setProperty('--_divider-inset-start', `${insetStart}px`);
		else this.style.removeProperty('--_divider-inset-start');
		if (insetEnd !== null) this.style.setProperty('--_divider-inset-end', `${insetEnd}px`);
		else this.style.removeProperty('--_divider-inset-end');
	}

	private _observeChildrenSlot() {
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="children"]');
		slot?.addEventListener('slotchange', () => this._updateChildren());
	}

	/** Renders the group only when there is something in it — an empty
	 *  `role="group"` would be an empty branch in the accessibility tree. */
	private _updateChildren() {
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="children"]');
		const rows = (slot?.assignedElements() ?? []).filter(el => el.tagName.toLowerCase() === 'nldd-list-item');
		const had = this._showChildren;
		this._showChildren = rows.length > 0;
		if (this._showChildren !== had) this._relayExpanded();
		if (this._showChildren) {
			// Nested rows are not in the list's own slot, so the list's pushes never
			// reach them. Relay what we were given, and they relay it downwards.
			rows.forEach(row => {
				const item = row as NLDDListItem;
				item._applyVariant?.(this._isBoxed ? 'box-tinted' : 'simple');
				item._applyParentType?.(this._parentType);
			});
		}
		if (!import.meta.env?.DEV) return;
		// Once per row: slotchange runs this again on every change to the branch.
		if (this._showChildren && this._parentType !== 'tree' && !this._warnedChildrenOutsideTree) {
			this._warnedChildrenOutsideTree = true;
			console.warn('nldd-list-item: `slot="children"` nests rows, which only carries meaning in an nldd-list with type="tree". Elsewhere the group has no owning tree and assistive technology cannot read the hierarchy.');
		}
	}

	private _handleClick = (e: Event) => {
		// A disabled <button> never gets here, but a link does: there is no such
		// thing as a disabled <a>, so the row stops the navigation itself.
		if (this.disabled) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		// Safari and Firefox on Mac don't focus buttons on click. Force focus
		// so :has(.list-item__action:focus) and :focus-within CSS work reliably.
		this._action?.focus();
		if (this.checkbox && !this.href && e.composedPath().includes(this._action as EventTarget)) {
			this.checked = !this.checked;
			this.dispatchEvent(new CustomEvent('change', {
				detail: { checked: this.checked },
				bubbles: true,
				composed: true,
			}));
		}
		// A radio only ever becomes checked, and says so once: activating the
		// option that is already picked changes nothing, so it announces nothing
		// either, the way a native radio does.
		if (this.radio && !this.checkbox && !this.href && !this.checked
			&& e.composedPath().includes(this._action as EventTarget)) {
			this.checked = true;
			this.dispatchEvent(new CustomEvent('change', {
				detail: { checked: true },
				bubbles: true,
				composed: true,
			}));
		}
	};

	private _handleFocusIn = () => {
		// Safari treats programmatic focus (forced on click for Safari/Firefox)
		// as focus-visible. Opt out by marking pointer-originated focus with a
		// class the CSS uses to suppress the ::before focus ring. If JS fails,
		// is-pointer-focus is never set so the CSS selector still matches on
		// keyboard focus and the custom ring renders — accessible by default.
		this._action?.classList.toggle('is-pointer-focus', isPointerMode());
	};

	private _handleFocusOut = () => {
		this._action?.classList.remove('is-pointer-focus');
	};

	/**
	 * See the same handler in nldd-list-item-segment: Safari hands focus to the
	 * body while the mouse is down, which drops a row out of its lit state until
	 * you let go. Left alone on a reorderable row and on a row whose press came
	 * from a nested one, where the default is doing real work (dragging).
	 */
	private _onMouseDown = (e: MouseEvent) => {
		if (e.button > 0 || this.reorderable) return;
		if (this._isFromNestedRow(e)) return;
		if (!this._action) return;
		e.preventDefault();
	};

	private _onPointerDown = (e: PointerEvent) => {
		if (this.disabled) return;
		// Primary button / touch / pen only (mouse right-click has button > 0).
		if (e.button > 0) return;
		// A branch's child rows are light-DOM children, so their pointer events
		// bubble through this row. Without this check, pressing a nested row
		// flashes the press state of every ancestor row above it.
		if (this._isFromNestedRow(e)) return;
		this._action?.classList.add('is-pressed');
		window.addEventListener('pointerup', this._clearPressed);
		window.addEventListener('pointercancel', this._clearPressed);
		// Safari does not focus a <button> on click, so a row whose paint follows
		// the focus in it would stay unlit there while the other browsers light
		// up. Focusing on the press makes the three agree; the ring stays hidden
		// because is-pointer-focus already marks a pointer focus.
		this._action?.focus({ preventScroll: true });
	};

	/** Whether the event started in a row nested inside this one. Only the part
	 *  of the path BELOW this row counts — everything above it is this row's own
	 *  ancestry, which is where the event is heading, not where it came from. */
	private _isFromNestedRow(e: Event): boolean {
		const path = e.composedPath();
		const self = path.indexOf(this);
		return path
			.slice(0, self === -1 ? path.length : self)
			.some(el => el instanceof Element && el.localName === 'nldd-list-item');
	}

	private _clearPressed = () => {
		window.removeEventListener('pointerup', this._clearPressed);
		window.removeEventListener('pointercancel', this._clearPressed);
		this._action?.classList.remove('is-pressed');
	};

	/**
	 * Delegates focus to the inner `.list-item__action` (the button or anchor),
	 * so consumers can call `listItemEl.focus()` without reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		// A tree row without a control of its own (only segments, or
		// none at all) takes focus on the host: that is where role="treeitem"
		// sits, so assistive technology announces the row rather than a button
		// inside it. _syncRovingTabStops gives the host the tabindex for it.
		if (this._action) {
			this._action.focus(options);
			return;
		}
		super.focus(options);
	}

	/**
	 * The roving tab stop, spread over the row and the controls inside it: the
	 * current row is reachable with Tab, everything else only with the arrow
	 * keys. Within the current row Tab then walks its segments and any
	 * control in its cells, so a row that holds a checkbox and a chevron, or a
	 * menu button at its end, stays fully operable.
	 *
	 * A row that is not the current one carries NO tabindex at all rather than
	 * -1. A shadow host with a tabindex is a focus scope of its own, and Chromium
	 * walks straight past such a scope when tabbing BACKWARDS if the host itself
	 * isn't tabbable — so a `-1` on a branch made every row inside it
	 * unreachable with Shift+Tab, while forward navigation still found them.
	 *
	 * @internal Also called by the list right after it moves the roving, so the
	 * tab stop is in the DOM before focus is handed over.
	 */
	_syncRovingTabStops(): void {
		const ownSegments = this._ownSegments();
		if (!this._arrowNavigation) {
			this.removeAttribute('tabindex');
			ownSegments.forEach((segment) => { segment._tabbable = undefined; });
			this._rovingControls().forEach(releaseTabbable);
			return;
		}
		// Only a row without its own control needs the host as focus target; with
		// a control the tabindex sits on that control (see render()).
		if (this._action || !this._rovingActive) {
			this.removeAttribute('tabindex');
		} else {
			this.setAttribute('tabindex', '0');
		}
		ownSegments.forEach((segment) => { segment._tabbable = this._rovingActive; });
		this._rovingControls().forEach((control) => { setTabbable(control, this._rovingActive); });
	}

	/**
	 * The control of this row an event started in, if it started in one at all.
	 *
	 * Tells apart what the row IS from what it HOLDS, and it asks that of the
	 * light DOM rather than of `_rovingControls`. That set holds what the roving
	 * can park, which needs `no-tab` or a native tab stop — and a combo box has
	 * neither, so the one control most in need of protection is exactly the one
	 * missing from it.
	 *
	 * So: everything in the path that is a light-DOM descendant of this row,
	 * stopping at the row. Nothing means the event came from the row's own
	 * action, which lives in its shadow root where `contains` does not reach.
	 * A segment on its own is what the row IS; a control slotted into one is not,
	 * and shows up in front of it.
	 *
	 * @internal Read by the parent nldd-list.
	 */
	_slottedControlFor(path: readonly EventTarget[]): Element | null {
		const held: Element[] = [];
		for (const node of path) {
			if (node === this) break;
			if (node instanceof Element && this.contains(node)) held.push(node);
		}
		if (held.length === 0) return null;
		if (held.length === 1 && held[0].tagName.toLowerCase() === 'nldd-list-item-segment') return null;
		return held[0];
	}

	/**
	 * Everything but the row itself out of the tab order.
	 *
	 * A list is one stop from the outside: Tab into it lands on the row, and the
	 * controls inside open up from there. Without this the stops the row handed
	 * out stay handed out after you tab away, so tabbing back in drops you into
	 * the control you left rather than on the row, and the arrow keys are two
	 * moves away instead of none.
	 *
	 * @internal Called by the parent nldd-list when focus leaves it.
	 */
	_parkControls(): void {
		if (!this._arrowNavigation || !this._rovingActive) return;
		this._ownSegments().forEach((segment) => { segment._tabbable = false; });
		this._rovingControls().forEach((control) => { setTabbable(control, false); });
	}

	/** The segments of this row, leaving out those of a nested tree row. */
	private _ownSegments(): (HTMLElement & { _tabbable?: boolean })[] {
		return Array.from(this.children).filter(
			(el): el is HTMLElement & { _tabbable?: boolean } =>
				el.getAttribute('slot') !== 'children'
				&& el.tagName.toLowerCase() === 'nldd-list-item-segment',
		);
	}

	/** The control that opens and closes this row: the segment marked
	 *  `disclosure`, or the row itself when it is a button. Never a link — Left
	 *  and Right may not navigate away. */
	private get _disclosureControl(): HTMLElement | undefined {
		const action = Array.from(this.children).find(
			(el) => el.getAttribute('slot') !== 'children'
				&& el.tagName.toLowerCase() === 'nldd-list-item-segment'
				&& el.hasAttribute('disclosure'),
		) as HTMLElement | undefined;
		if (action) return action;
		if (this.button && !this.href) return this._action;
		return undefined;
	}

	/** Activates whatever opens this row, so the consumer's own click handler runs
	 *  and stays the only place `expanded` is written. Returns false when the row
	 *  has nothing to activate. */
	_activateDisclosure(): boolean {
		const control = this._disclosureControl;
		if (!control) return false;
		// The click lands on a segment, and that segment pulls focus into
		// its own control — with the pointer-focus flag set, since a click is what
		// it sees. Focus belongs to the row: that is the roving tab stop, and the
		// keyboard user has to keep seeing where they are.
		const hadFocus = this.matches(':focus-within');
		(control as HTMLElement & { click(): void }).click();
		if (hadFocus) this.focus();
		return true;
	}

	/**
	 * Activates what this row is FOR, as opposed to what folds it: the first
	 * segment that is not the disclosure. A row that is its own control
	 * needs none of this, because the key reaches that control by itself.
	 * Returns false when there is nothing but a chevron.
	 */
	_activatePrimary(): boolean {
		const segments = [...this.querySelectorAll(':scope > nldd-list-item-segment')];
		const primary = segments.find((segment) => !segment.hasAttribute('disclosure'));
		if (!primary) return false;
		const control = primary.shadowRoot?.querySelector('a, button');
		if (!control) return false;
		// Same trade as _activateDisclosure: the click pulls focus into the
		// segment, and the row has to keep it, because the row is the tab stop.
		const hadFocus = this.matches(':focus-within');
		(control as HTMLElement & { click(): void }).click();
		if (hadFocus) this.focus();
		return true;
	}

	/** The branch this row hangs under, or undefined for a top-level row. */
	get parentRow(): NLDDListItem | undefined {
		const parent = this.parentElement;
		if (!parent || parent.tagName.toLowerCase() !== 'nldd-list-item') return undefined;
		return parent as NLDDListItem;
	}

	override render() {
		const opensInNewTabLabel =
			this.href && this.target === '_blank'
				? this._t('components.list-item.opens-in-new-tab-label')
				: undefined;
		// Listbox options are never separate tab stops — only the list's own
		// search input is in the tab order, and active moves via
		// aria-activedescendant. Roving tabindex (arrow-navigation) supersedes
		// nothing here: the two modes are mutually exclusive on the parent list.
		// Otherwise, roving tabindex: while the list runs the roving,
		// exactly one item is the tab stop (0) and the rest are reachable only
		// via the arrow keys (-1). Off → undefined leaves the native
		// button/link as a normal tab stop.
		const actionTabindex = this._isListboxOption
			? '-1'
			: this._arrowNavigation
				? (this._rovingActive ? '0' : '-1')
				: undefined;
		return template(
			this.button,
			this.href,
			this.target,
			this.rel,
			opensInNewTabLabel,
			actionTabindex,
			this._highlighted,
			this.checkbox,
			this.radio,
			this.checked,
			this._resolvedExpanded,
			this._showChildren,
			this._hasCheckedSegment,
			this.disabled,
		);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-list-item': NLDDListItem;
	}
}
