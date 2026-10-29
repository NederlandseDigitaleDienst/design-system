import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { computePosition, flip, shift, offset, size, autoUpdate } from '@floating-ui/dom';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { menuStyles } from './menu.styles.js';
import { menuTemplate, type MenuVariant } from './menu.template.js';
import { nlddMenuTranslations } from './menu.i18n.js';
import type { NLDDMenuTranslations } from './menu.i18n.js';
import '../../lists-and-tables/cells/icon-cell/icon-cell.js';
import '../../lists-and-tables/cells/spacer-cell/spacer-cell.js';
import '../../lists-and-tables/cells/text-cell/text-cell.js';
import '../../content/icon/icon.js';
import '../../content/keyboard-shortcut/keyboard-shortcut.js';
import '../../status-and-feedback/inline-dialog/inline-dialog.js';
import { isKeyboardMode, isTouchMode } from '../../../utilities/input-modality.js';
import { queryBreakpoints } from '../../../assets/styles/breakpoints.js';
import { translate } from '../../../utilities/translations.js';
import { NLDDMenuItem } from './menu-item.js';
import { MenuPointerController } from './menu.pointer.js';
import { SubmenuLevel } from './menu.chain.js';
import { SafeTriangleController, rectContainsPoint, type Point } from './menu.safe-triangle.js';
import { NLDDMenuGroup } from './menu-group.js';
import { NLDDMenuDivider } from './menu-divider.js';
import { nextTabbableAfter } from '../../../utilities/tab-order.js';

export { NLDDMenuItem } from './menu-item.js';
export { NLDDMenuGroup } from './menu-group.js';
export { NLDDMenuDivider } from './menu-divider.js';

// # nldd-menu

const defaultFilterFn = (query: string, item: NLDDMenuItem): boolean => {
	const q = query.toLowerCase();
	const textMatch = item.text.toLowerCase().includes(q);
	const valueMatch = item.value !== '' && item.value.toLowerCase().includes(q);
	const aliasesMatch = item.aliases !== '' && item.aliases.split(' ').some(s => s.toLowerCase().includes(q));
	return textMatch || valueMatch || aliasesMatch;
};

/** The name of what a menu hangs off. A field that anchors its list to an
 *  element inside its own shadow root (nldd-token-field) has the name on its
 *  host, so a nameless anchor in a shadow root asks the host. The property is
 *  read before the attribute: nldd-form-field sets `accessibleLabel` as one. */
function nameOfAnchor(anchor: Element): string {
	const name = ((anchor as Element & { accessibleLabel?: string }).accessibleLabel
		|| anchor.getAttribute('accessible-label')
		|| anchor.getAttribute('aria-label')
		|| anchor.getAttribute('text')
		|| (anchor.shadowRoot ? '' : anchor.textContent)
		|| '').trim();
	if (name) return name;
	const root = anchor.getRootNode();
	return root instanceof ShadowRoot ? nameOfAnchor(root.host) : '';
}

/**
 * A floating menu component using the Popover API.
 * Positioned relative to an anchor element using Floating UI.
 *
 * Supports filtering, keyboard navigation, and highlight management.
 * Use nldd-menu-item and nldd-menu-divider as children.
 *
 * Note: Only type="button" items are supported when used inside nldd-combo-box-field.
 * Radio and checkbox types may be used in standalone menus.
 *
 * @element nldd-menu
 *
 * @attr {'menu'|'listbox'|'navigation'} variant - What the menu is (default 'menu'). `menu` is a menu of actions: `role="menu"` with menu items, for things you do. `listbox` is the popup of a combobox: `role="listbox"` with options, focus stays in the field. `navigation` is a submenu in a site navigation: a list of links (`role="list"`, each item a list item around a real link), because a screen reader treats a menu as an application and reads a list of links as what it is. Every item takes an `href`. Tab reaches each link, the arrow keys, Home and End move between them, Escape closes and returns focus to the trigger, and the menu closes when focus leaves it. The trigger says `aria-expanded` and promises no menu. Checkbox and radio items, shortcuts and `filter()` belong to actions and warn in development here. A submenu of a navigation menu is a navigation menu too. The variant sets `role="listitem"` on its items and groups, and takes it off again when it changes back, also where you had set that role yourself.
 * @attr {string} width - Explicit width, pinned exactly. Without it the menu sizes to its content between a minimum and a viewport-aware maximum (min(100vw - inset, 640px)).
 * @attr {string} accessible-label - Name of the menu or listbox for assistive technology, on the element that has the role. Without it the menu takes the name of its anchor (the `accessible-label`, `aria-label`, `text` or text of the button or field it hangs off), and a submenu the text of the item that opens it, so a listbox under a search field is "Zoeken" rather than nameless (WCAG 4.1.2). The list of an nldd-combo-box or nldd-token-field takes the name of the field.
 * @attr {string} anchor - ID of the anchor element. Positions the menu against it AND makes it a toggle: the menu listens on document click and opens/closes itself when the click lands on the anchor. Use this for a menu hung off a button. For a menu you open yourself (a type-ahead under a text field, say), set the `anchorElement` property instead — same positioning, no toggle.
 * @attr {string} placement - Floating UI placement. Default: 'bottom-start'.
 * @attr {number} max-items - Maximum number of visible items before scrolling. Sets --_menu-max-items internally. Default: 0 (no limit).
 * @attr {string} empty-text - Text of the default empty-state dialog. Falls back to Dutch i18n "Geen opties beschikbaar".
 * @attr {string} empty-supporting-text - Supporting text of the default empty-state dialog.
 * @attr {object} translations - Override one or more translation keys.
 * @attr {Function} filterFn - Custom filter function (query, item) => boolean.
 *
 * @slot - nldd-menu-item and nldd-menu-divider elements.
 * @slot header - Free content shown above the items, outside `role="menu"` (so it may hold non-menuitem content such as an avatar + name, buttons or links — reached with Tab, skipped by arrow navigation). The region is unpadded; control spacing with your own content (e.g. an `nldd-container`). Root-only: never rendered in a submenu. Example: an account identity header (nldd-identity).
 * @slot footer - Free content shown below the items, outside `role="menu"` (same rules as `header`; also unpadded and root-only). Example: a short note or a link.
 * @slot empty - Shown when no items are visible. Defaults to `nldd-inline-dialog` driven by `empty-text` / `empty-supporting-text`. Slot content overrides the default dialog entirely.
 */
export class NLDDMenu extends LitElement {
	static override styles = menuStyles;

	/**
	 * What the menu is, which sets its roles and part of its keyboard. See the
	 * `variant` attribute in the docblock above.
	 */
	@property({ reflect: true, converter: reflectNonDefault<MenuVariant>('menu') })
	variant: MenuVariant = 'menu';

	/**
	 * Explicit width, pinned exactly (sets --_menu-width and clamps min/max to it).
	 * Leave unset to let the menu size to its content between a minimum and a
	 * viewport-aware maximum of min(100vw - inset, 640px).
	 */
	@property({ type: String, reflect: true })
	width = '';

	@property({ type: String, reflect: true })
	anchor = '';

	/**
	 * The anchor as an element reference. Positions the menu exactly like the
	 * `anchor` attribute, but does NOT turn the anchor into a toggle — clicking
	 * it does not open the menu. Use this whenever you drive open/close yourself
	 * (`showPopover()` / `hidePopover()`), which is what nldd-combo-box and
	 * nldd-token-field do: their input must stay an input, not a menu button.
	 */
	@property({ attribute: false })
	anchorElement: Element | null = null;

	@property({ attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('bottom-start') })
	placement: string = 'bottom-start';

	/**
	 * @internal Distance in px between the anchor and the menu, along the placement
	 * side; negative pulls the menu in. Set by a component that hangs a menu
	 * off itself and draws its own edge inside its box, such as
	 * nldd-menu-bar-item, whose indicator stops short of the item. Not an
	 * attribute: the anchor knows that inset, the consumer does not. Set it on
	 * every open: the menu puts it back to 0 when it closes.
	 */
	@property({ attribute: false })
	anchorOffset = 0;

	/**
	 * Maximum number of visible items before the menu scrolls.
	 * Sets --_menu-max-items internally. Default: 0 (no limit).
	 */
	@property({ type: Number, attribute: 'max-items' })
	maxItems = 0;

	@property({ reflect: true, attribute: 'empty-text', converter: reflectNonDefault<string>('') })
	emptyText = '';

	@property({ reflect: true, attribute: 'empty-supporting-text', converter: reflectNonDefault<string>('') })
	emptySupportingText = '';

	/**
	 * Override one or more translation keys.
	 * Unset keys fall back to the Dutch default.
	 */
	@property({ type: Object })
	translations: Partial<NLDDMenuTranslations> = {};

	/**
	 * Custom filter function. Defaults to case-insensitive substring match
	 * on text, value, and aliases attributes.
	 */
	@property({ attribute: false })
	filterFn: (query: string, item: NLDDMenuItem) => boolean = defaultFilterFn;

	/**
	 * @internal — development only.
	 *
	 * Renders a translucent SVG overlay showing the safe triangle's current
	 * shape. Reflected as `debug-safe-triangle` so it can be toggled at
	 * runtime in DevTools, but it must not be enabled in shipped code: the
	 * overlay attaches a popover to `document.body` and is intended purely
	 * as a development aid.
	 */
	@property({ type: Boolean, reflect: true, attribute: 'debug-safe-triangle' })
	debugSafeTriangle = false;

	@state()
	private _isEmpty = false;

	/** Whether the `header` / `footer` slots have meaningful content, driving
	 * whether their (root-only) region renders. Set from slotchange + an initial
	 * sync in firstUpdated, mirroring nldd-inline-dialog. Not `private`: the
	 * template (a separate module) reads them via `this`. */
	@state()
	_hasHeader = false;

	@state()
	_hasFooter = false;

	// — Submenu chain ——
	// The open submenus are levels: see menu.chain.ts. These fields are what
	// the levels and the rest of the menu read.

	/** The submenu open from one of this menu's own items, and that item.
	 *  null while none is open. @internal */
	_activeSubmenu: NLDDMenu | null = null;
	/** @internal */
	_activeSubmenuOpener: NLDDMenuItem | null = null;
	/** The level of that submenu. @internal */
	_activeLevel: SubmenuLevel | null = null;
	/** Signal that this menu is hiding itself to make room for a deeper drill-in
	 * level — its parent's onToggle should skip the normal close cleanup
	 * (re-parent + re-show) so the chain stays in deeper-level state. */
	_drillInHidingForDeeper = false;
	/** Root-owned registry of every level open in this chain, in open order.
	 * Lives on the root only; submenus reach it via `_chainRoot`. Drives
	 * `_collapseChain()`, so collapsing the whole stack never depends on
	 * `_activeSubmenu`/`_parentMenu`, which real interaction can leave
	 * stale. @internal */
	_openChain: SubmenuLevel[] = [];
	/** Back-reference to the chain's root, set on every submenu when it
	 * opens. Lets `_collapseChain()` find the registry without walking
	 * the (possibly stale) parent links. null on the root. @internal */
	_chainRoot: NLDDMenu | null = null;
	/** When this menu is itself a submenu, points to the parent menu that
	 * opened it. Set by the parent's _handleSubmenuOpen. null on the root.
	 * @internal */
	_parentMenu: NLDDMenu | null = null;

	/** The menu-item that triggered this submenu — used to label the back
	 * button in drill-in mode.
	 * @internal */
	@state()
	_parentItem: NLDDMenuItem | null = null;

	private _isOpen = false;
	/** Tracked so the pointerdown re-sync moves along when the anchor changes. */
	private _previousAnchorForResync: Element | null = null;
	/** Set on the root when a pointer gesture (outside/anchor pointerdown
	 * or confirmed tap) collapsed the chain, or when a pointerdown landed
	 * on the anchor while the menu was open (covers native light-dismiss).
	 * The trailing `click` of that same gesture consumes it in
	 * `_handleDocumentClick` and must NOT reopen — gesture-correlated, so
	 * it's reliable on touch regardless of pointerup→click timing.
	 * @internal */
	_collapsedByPointerGesture = false;
	private _cleanupAutoUpdate: (() => void) | null = null;

	// — i18n ——————————————————————————————————————————————————————————————————

	/** @internal */
	_t(key: keyof NLDDMenuTranslations, vars?: Record<string, string | number>): string {
		return translate(this.translations, nlddMenuTranslations, key, vars);
	}

	/** Resolved empty text: emptyText attribute takes precedence, then i18n fallback. */
	get _resolvedEmptyText(): string {
		return this.emptyText || this._t('components.menu.empty-text');
	}

	/** Accessible name for the drill-in back button. Prefixes the parent
	 * item's label with the localised "back" word so AT announces "Back:
	 * Bestand" instead of an ambiguous "Bestand, button". Only used when
	 * this menu is itself a submenu in drill-in mode. */
	get _resolvedBackLabel(): string {
		const back = this._t('components.menu.back-action');
		const parent = this._parentItem?.text ?? '';
		return parent ? `${back}: ${parent}` : back;
	}

	// — Status messages (WCAG 4.1.3) ———————————————————————————————————————————
	//
	// Drill-in mode swaps the whole view (parent hides, submenu shows, or
	// vice versa). Focus moves to the new view's first item / opener, so AT
	// announces *an* element — but not that the view itself changed. The
	// polite live region in the shadow DOM (see menu.template) carries that
	// explicit status. Cascade mode keeps both views visible: nothing is
	// swapped, so it never announces.

	/** Double-rAF handle for the announcement awaiting flush, so a rapid
	 * follow-up transition can cancel the stale one instead of stacking it. */
	private _announceRaf = 0;
	/** Message currently queued (not yet flushed to the region). Used to
	 * drop a doubled event in the same tick while still allowing the same
	 * text to be re-announced on a later, genuine transition. */
	private _pendingAnnouncement = '';

	/**
	 * Write `message` to this menu's polite live region. Clears first, then
	 * sets on a double rAF — the empty→text transition is what makes screen
	 * readers reliably re-announce unchanged-looking content across engines.
	 *
	 * Spam control without muting real navigation: a doubled event in the
	 * same tick (identical message still pending) is dropped; a *different*
	 * message arriving first cancels the stale pending one (rapid navigation
	 * announces only the level you land on); once flushed, the same text may
	 * be announced again for a later genuine transition (e.g. re-entering a
	 * submenu after going back).
	 * @internal
	 */
	_announce(message: string): void {
		if (!message) return;
		if (this._announceRaf && message === this._pendingAnnouncement) return;
		const region = this.shadowRoot?.querySelector<HTMLElement>('.menu__live-region');
		if (!region) return;
		if (this._announceRaf) cancelAnimationFrame(this._announceRaf);
		this._pendingAnnouncement = message;
		region.textContent = '';
		this._announceRaf = requestAnimationFrame(() => {
			this._announceRaf = requestAnimationFrame(() => {
				this._announceRaf = 0;
				this._pendingAnnouncement = '';
				region.textContent = message;
			});
		});
	}

	// — Lifecycle ——————————————————————————————————————————————————————————————

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('anchorOffset') && this._isOpen) void this.reposition();
		if (changedProperties.has('width')) {
			if (this.width) {
				// An explicit width pins the menu to exactly that size — clamp the
				// content-driven min/max to it too, so callers that need an exact
				// width (e.g. combo-box matching its input) aren't widened by the
				// default minimum or capped by the default maximum.
				this.style.setProperty('--_menu-width', this.width);
				this.style.setProperty('--_menu-min-width', this.width);
				this.style.setProperty('--_menu-max-width', this.width);
			} else {
				this.style.removeProperty('--_menu-width');
				this.style.removeProperty('--_menu-min-width');
				this.style.removeProperty('--_menu-max-width');
			}
		}
		if (changedProperties.has('maxItems')) {
			if (this.maxItems > 0) {
				this.style.setProperty('--_menu-max-items', String(this.maxItems));
			} else {
				this.style.removeProperty('--_menu-max-items');
			}
		}
		if (changedProperties.has('variant')) {
			this._claimItems();
			if (changedProperties.get('variant') !== undefined) this._syncAnchorPopupState(this._isOpen);
		}
		// A new anchor arrives closed and unlabeled — seed it right away rather
		// than at its first open. Covers the popup slot (where the invoking
		// control assigns `anchorElement` on slotchange, which may land after
		// our firstUpdated) and a runtime `anchor` swap.
		if (changedProperties.has('anchor') || changedProperties.has('anchorElement')) {
			this._previousAnchorForResync?.removeEventListener('pointerdown', this._resyncAnchorFromPopoverState, true);
			const anchor = this._getAnchorEl();
			anchor?.addEventListener('pointerdown', this._resyncAnchorFromPopoverState, true);
			this._previousAnchorForResync = anchor;
			this._syncAnchorPopupState(this._isOpen);
		}
	}

	/** @internal The name of the element with the menu or listbox role: its
	 *  own, else the name of what it hangs off. */
	get _listLabel(): string {
		if (this.accessibleLabel) return this.accessibleLabel;
		if (this._parentItem?.text) return this._parentItem.text;
		const anchor = this._getAnchorEl();
		return anchor ? nameOfAnchor(anchor) : '';
	}

	// — Anchor ————————————————————————————————————————————————————————————————

	/** @internal */
	_getAnchorEl(): Element | null {
		if (this.anchorElement) return this.anchorElement;
		if (this.anchor) return document.getElementById(this.anchor);
		return null;
	}

	/**
	 * Pick the drill-in side (above vs below the anchor) purely from the
	 * available viewport space around the anchor — never from content
	 * size. Content-independent so every level of the chain resolves to
	 * the same side and a bigger submenu scrolls internally rather than
	 * flipping the whole stack. Keeps the configured alignment suffix
	 * (`-start` / `-end`) from `placement`.
	 */
	private _resolveDrillInPlacement(anchorEl: Element): string {
		const base = this.placement || 'bottom-start';
		const align = base.includes('-') ? base.slice(base.indexOf('-')) : '';
		const rect = anchorEl.getBoundingClientRect();
		const margin = this._cssPx('--_menu-viewport-margin');
		const spaceBelow = window.innerHeight - rect.bottom - margin;
		const spaceAbove = rect.top - margin;
		const side = spaceBelow >= spaceAbove ? 'bottom' : 'top';
		return `${side}${align}`;
	}

	/**
	 * Reflect this menu's open state on the anchor so an anchor button (or
	 * any element exposing an `expanded` IDL property) shows the active
	 * "is-expanded" visual while we're open. Skip menu-items as anchors —
	 * they manage their own `_submenuOpen` lifecycle and don't have an
	 * `expanded` property. Also default `popupType` to 'menu' / 'listbox'
	 * (matching this menu's variant) when the anchor supports it and the
	 * consumer hasn't already chosen a value, so screen readers announce
	 * the popup role without each consumer having to set it manually.
	 *
	 * Finally, drive the anchor's `popoverTargetAction` so the browser's
	 * native invoker action always matches the current state explicitly:
	 * `'hide'` while open, `'show'` while closed. We avoid `'toggle'` on
	 * purpose — toggle re-evaluates the popover's live state at click time
	 * and would re-open the menu if it had just been light-dismissed
	 * milliseconds earlier (the source of the "menu briefly closes and
	 * reopens" bug). With explicit show/hide, the worst case is a no-op
	 * (e.g. `'hide'` on an already-closed menu) — never a spurious open.
	 *
	 * The invoker association (`popoverTargetElement`) is set elsewhere
	 * — persistently on anchor change rather than per-toggle — so the
	 * browser's light-dismiss exclusion is in place from the very first
	 * click instead of only after the menu has already opened once.
	 */
	/**
	 * Re-read the real popover state and push it to the anchor.
	 *
	 * Everything about the anchor (`expanded`, `aria-expanded`, and which way
	 * `popoverTargetAction` points) hangs off our own `toggle` event. That is
	 * enough while the menu opens and closes on its own, but not when something
	 * else closes it: opening a modal dialog empties the top layer, and Safari
	 * does not fire `toggle` for the popovers it drops. The anchor then keeps
	 * saying "open" while the menu is gone, and its next click asks the browser
	 * to hide an already-hidden popover — a no-op, so the button looks dead.
	 *
	 * Called on the anchor's own pointerdown, before the click resolves the
	 * invoker, so the action is decided on the truth rather than on a state
	 * update that never arrived.
	 */
	private _resyncAnchorFromPopoverState = (): void => {
		const reallyOpen = this.matches(':popover-open');
		if (reallyOpen === this._isOpen) return;
		this._isOpen = reallyOpen;
		this._syncAnchorPopupState(reallyOpen);
	};

	/** The popup type this menu gave its anchor, so a later variant can take
	 *  it back without touching one the consumer chose. */
	private _seededPopupType: string | null = null;

	private _syncAnchorPopupState(isOpen: boolean): void {
		const anchor = this._getAnchorEl() as HTMLElement & {
			expanded?: boolean;
			popupType?: string;
			popoverTargetAction?: 'toggle' | 'show' | 'hide';
		} | null;
		if (!anchor) return;
		if ('expanded' in anchor) anchor.expanded = isOpen;
		// Seed a valid aria-haspopup when the anchor has no usable popup
		// type. Falsy covers unset (undefined/null) AND `popup-type=""` —
		// an empty string is not a valid aria-haspopup token, so it must
		// still be seeded rather than left invalid. An intentional opt-out
		// is `popup-type="false"`, which is truthy and preserved here.
		//
		// Deliberately not gated on `isOpen`: aria-haspopup is a static
		// property of the trigger ("this button opens a menu"), not state.
		// Seeding it on first open would leave a screen reader tabbing a row
		// of identical "more" buttons hearing plain "button" — exactly the
		// moment the type matters most, since nothing has been opened yet.
		// nldd-popover already works this way.
		// A navigation menu is a disclosure: the trigger says expanded or not,
		// and promises no menu.
		// One this menu seeded follows the variant when it changes; one the
		// consumer set is left alone.
		if ('popupType' in anchor && (!anchor.popupType || anchor.popupType === this._seededPopupType)) {
			const wanted = this.variant === 'navigation' ? '' : this.variant === 'listbox' ? 'listbox' : 'menu';
			anchor.popupType = wanted;
			this._seededPopupType = wanted || null;
		}
		if ('popoverTargetAction' in anchor) {
			anchor.popoverTargetAction = isOpen ? 'hide' : 'show';
		}
	}

	// — Event handlers ————————————————————————————————————————————————————————

	private _handleDocumentClick = (event: MouseEvent): void => {
		if (this.anchorElement) return;
		// Consume the same-gesture collapse marker (set when an outside or
		// anchor pointer gesture collapsed the chain). Read+clear for every
		// click so it never leaks past a single gesture.
		const collapsedByGesture = this._collapsedByPointerGesture;
		this._collapsedByPointerGesture = false;
		const anchorEl = this._getAnchorEl();
		if (!anchorEl) return;
		const path = event.composedPath();
		if (!path.includes(anchorEl)) return;
		// This click is the tail of the very gesture that just collapsed the
		// chain (e.g. tapping the anchor from deep in a drill-in submenu:
		// the submenu's pointerdown/tap already collapsed). It must not
		// reopen. Gesture-correlated, so reliable even when the
		// pointerup→click gap exceeds the time-based reopen guard on touch.
		if (collapsedByGesture) return;
		// Drill-in: the root is hidden while a submenu shows, so `_isOpen`
		// is false on the root even though the menu is visibly open. A
		// plain toggle would `showPopover()` the root — i.e. bounce back
		// to the main level. The anchor is a toggle: if anything in the
		// chain is open, clicking it collapses the whole stack (registry-
		// driven, so it works even if chain links went stale).
		if (this._drillInMode && (this._isOpen || this._openChain.length > 0)) {
			this._collapseChain();
			return;
		}
		if (this._isOpen) {
			(this as HTMLElement).hidePopover();
		} else {
			(this as HTMLElement).showPopover();
		}
	};

	// — Hover and the safe triangle (cascade only) ——————————————————————————
	// See menu.safe-triangle.ts for the wedge that keeps a submenu open on a
	// diagonal route to it.

	private _hoverOpenTimer: number | null = null;

	/** @internal */
	readonly _safeTriangle = new SafeTriangleController(this);

	/** @internal For the safe triangle: the item whose submenu is open. */
	get safeTriangleOpener(): NLDDMenuItem | null {
		return this._activeSubmenuOpener;
	}

	/** @internal For the safe triangle. */
	highlightOpener(): void {
		if (this._activeSubmenuOpener) this._setHighlight(this._activeSubmenuOpener);
	}

	/** @internal For the safe triangle: whether a point is in `submenu` or a
	 *  submenu below it, so a cursor that went on into a deeper submenu still
	 *  reads as arrived rather than re-pinning a stale apex. */
	isPointInSubmenus(p: Point, submenu: HTMLElement): boolean {
		let menu: NLDDMenu | null = submenu as NLDDMenu;
		while (menu) {
			if (rectContainsPoint(menu.getBoundingClientRect(), p)) return true;
			menu = menu._activeSubmenu;
		}
		return false;
	}

	private _handleMenuItemMouseenter = (event: MouseEvent): void => {
		// Touch suppress: synthesised mouseenter from touch (e.g. lifting
		// after a scroll gesture on a long menu) shouldn't paint a highlight.
		if (isTouchMode()) return;
		const item = (event.target as Element).closest('nldd-menu-item') as NLDDMenuItem | null;
		if (!item) return;
		this._activateItem(item);
	};

	/**
	 * Item-activation logic shared between the native `mouseenter` capture
	 * handler and the safe-triangle recovery paths (sideways exit, direction
	 * reversal, stall dismissal). Those paths know which item is under the
	 * cursor — they don't need to synthesize a MouseEvent just to re-enter
	 * the handler. Factoring out the body keeps the entry contracts honest:
	 * the recovery sites pass an already-resolved item rather than relying
	 * on `event.target` semantics they'd have to fake.
	 */
	private _activateItem(item: NLDDMenuItem): void {
		if (item.disabled || item.hasAttribute('hidden')) return;

		// The mouseenter listener is registered with capture:true, so it fires
		// for events targeted at items in descendant submenus too. Bail out
		// for those — the descendant menu has its own listener that will
		// handle them. (Synthetic callers can hit this branch when the item
		// under the cursor belongs to a nested menu.)
		if (item.closest('nldd-menu') !== this) return;

		// Hover-triangle guard: while the user is on a path toward the active
		// submenu, peer items don't get highlighted and don't schedule
		// hover-opens. Without this, the highlight flickers across every item
		// the cursor brushes past on its diagonal route to the submenu.
		if (this._safeTriangle.movingToward && item !== this._activeSubmenuOpener) return;

		this._setHighlight(item);

		if (this._drillInMode) return; // Touch / narrow viewport: no hover-open.

		// Settled on a peer item (not the active submenu's opener) — close the
		// active submenu immediately. If this peer itself has a submenu, the
		// hover-open below will then schedule its own.
		if (this._activeSubmenu && item !== this._activeSubmenuOpener) {
			(this._activeSubmenu as HTMLElement).hidePopover?.();
		}

		// Always cancel any pending hover-open from a previous item — moving
		// the cursor onto a peer (with or without submenu) means the previous
		// item's submenu should not open after its delay. Then schedule a new
		// one only when the new item itself has a submenu.
		this._cancelHoverOpen();
		if (item._hasSubmenu && this._activeSubmenuOpener !== item) {
			this._hoverOpenTimer = window.setTimeout(() => {
				this._hoverOpenTimer = null;
				item._handleClick();
			}, 150);
		}
	}

	/** @internal Resolve the menu-item under a viewport point and activate it
	 * via `_activateItem`. Used by the safe triangle, whose natural mouseenter
	 * has already fired (and bailed): it re-triggers activation without
	 * synthesizing a MouseEvent. */
	activateItemAt(p: Point): void {
		const el = document.elementFromPoint(p.x, p.y);
		const item = el?.closest('nldd-menu-item') as NLDDMenuItem | null;
		if (item) this._activateItem(item);
	}

	/** Padding, dividers, header and footer are still inside the menu, so
	 * mouseleave doesn't fire there: drop the highlight once the pointer is over
	 * none of the items. */
	private _handleMouseover = (event: MouseEvent): void => {
		if (isTouchMode() || this.variant === 'listbox') return;
		if (this._activeSubmenu || this._safeTriangle.movingToward) return;
		if (event.composedPath().some((node) => node instanceof Element && node.localName === 'nldd-menu-item')) return;
		this._clearHighlight();
	};

	private _handleMouseleave = (): void => {
		if (this.variant !== 'listbox') this._clearHighlight();
		this._cancelHoverOpen();
		// No auto-close on hover-out: leaving the menu rect leaves the chain
		// open. Click-outside (popover light-dismiss) is the only gesture
		// that collapses the chain.
	};

	private _cancelHoverOpen(): void {
		if (this._hoverOpenTimer !== null) {
			clearTimeout(this._hoverOpenTimer);
			this._hoverOpenTimer = null;
		}
	}

	private _handleMenuItemFocused = (event: Event): void => {
		const item = (event.target as Element).closest('nldd-menu-item') as NLDDMenuItem | null;
		if (!item || item.disabled || item.hasAttribute('hidden')) return;
		// Same caveat as _handleMenuItemMouseenter: this listener catches
		// focused events that bubble up from descendant submenus too. Skip
		// those so we don't highlight items that aren't ours.
		if (item.closest('nldd-menu') !== this) return;
		this._setHighlight(item);
	};

	/**
	 * Drill-in mode is the touch-friendly rendering: a submenu replaces its
	 * parent's view by anchoring to the root anchor (so visually it stacks
	 * over the parent) and gets a back-button header. Otherwise (cascade)
	 * the submenu opens beside its parent item.
	 *
	 * Detection is based on pointer type and viewport width — touch devices
	 * and narrow viewports drill in, everything else cascades. No consumer
	 * override; the choice is environment-driven.
	 *
	 * Cached MediaQueryList shared across instances — `matchMedia()` returns
	 * a live object and re-evaluating it for every mouseenter/submenu-open
	 * is wasteful.
	 */
	private static _drillInModeQuery: MediaQueryList | null = null;
	private static _getDrillInModeQuery(): MediaQueryList {
		if (NLDDMenu._drillInModeQuery === null) {
			// Use the shared breakpoint constant so the JS-side threshold can't
			// drift from the CSS-side one (spacer.styles.ts and friends pull
			// from the same source).
			NLDDMenu._drillInModeQuery = matchMedia(`(pointer: coarse), (max-width: ${queryBreakpoints.smMax})`);
		}
		return NLDDMenu._drillInModeQuery;
	}

	get _drillInMode(): boolean {
		return NLDDMenu._getDrillInModeQuery().matches;
	}

	/** Walks the parent-menu chain up to the root (the menu that wasn't
	 * opened by another menu — has no _parentMenu). */
	get _rootMenu(): NLDDMenu {
		let m: NLDDMenu = this;
		while (m._parentMenu) m = m._parentMenu;
		return m;
	}

	/** True when this menu is itself a submenu (was opened by another menu's
	 * item). The root menu returns false. */
	get _isSubmenu(): boolean {
		return this._parentMenu !== null;
	}

	/**
	 * Open a submenu in response to one of this menu's items dispatching
	 * `submenu-open`, as a new level of the chain (menu.chain.ts).
	 */
	private _handleSubmenuOpen: EventListener = (event): void => {
		// Only handle events from items that are direct children of this menu.
		// Items inside a sub-submenu fire their own submenu-open which bubbles
		// here too — we let that one bubble past, our descendant menu handles it.
		const { item, submenu } = (event as CustomEvent<{ submenu: NLDDMenu, item: NLDDMenuItem }>).detail;
		if (item.closest('nldd-menu') !== this) return;
		event.stopPropagation();
		// Same submenu already open — bail before re-running the open path. Without
		// this, hover-opening then clicking the same opener (or rapid double-click)
		// would stack a second `toggle` listener; `showPopover()` is a no-op on an
		// already-open popover so both listeners would survive and double-fire on
		// the next close.
		if (this._activeSubmenu === submenu) return;
		new SubmenuLevel(this, item, submenu, this._drillInMode).open();
	};

	/** Close this submenu when the back button is clicked, returning to the
	 * parent view (which is still open as a popover behind this one in
	 * drill-in mode).
	 * @internal */
	_handleBack = (): void => {
		(this as HTMLElement).hidePopover?.();
	};

	/** Cursor moved onto the drill-in back button — clear any item highlight
	 * so we don't show two "active" elements at once (back button + first
	 * item that was auto-highlighted on open).
	 * @internal */
	_handleBackMouseenter = (): void => {
		this._clearHighlight();
	};

	// — Pointer gestures ————————————————————————————————————————————————————
	// Press-drag-release, no press flash while scrolling, and a tap beside a
	// drill-in chain: see menu.pointer.ts.

	/** @internal */
	readonly _pointer = new MenuPointerController(this);

	/** @internal For the pointer gestures. */
	get _isMenuOpen(): boolean {
		return this._isOpen;
	}

	/** Close the menu on a window resize. Floating-UI's autoUpdate keeps
	 * the position in sync with scrolls (where users genuinely expect the
	 * menu to follow the anchor), but a full window resize is a layout-
	 * shifting interaction the user isn't currently tracking — better to
	 * dismiss with a clean slate than to chase the anchor across a
	 * reflow, repaint a flipped placement, or get stuck mid-flight when
	 * crossing the cascade ↔ drill-in viewport threshold. The window
	 * listener is wired only while we're open and torn down on close, so
	 * idle menus pay nothing. */
	private _handleWindowResize = (): void => {
		this._collapseChain();
	};

	/**
	 * Collapse the entire menu chain at once — root + every open submenu —
	 * with no "back one level" re-show. Used when the action is final:
	 * selecting an item, clicking the anchor, clicking/tapping outside, or
	 * a viewport resize.
	 *
	 * Driven by the root's `_openChain` registry of levels, so it never
	 * depends on `_activeSubmenu` /
	 * `_parentMenu` threading being intact at collapse time — real
	 * interaction can leave those stale, which was the source of the
	 * recurring "anchor click doesn't close after the 2nd navigation"
	 * bug. Idempotent: every chain level's `select` listener may call it,
	 * but the first run empties the registry so the rest are no-ops.
	 */
	private _collapseChain = (): void => {
		const root = this._chainRoot ?? this;
		// Snapshot + clear first so the re-entrant cleanup splices are
		// no-ops and a trailing same-gesture call finds nothing to do.
		const chain = root._openChain;
		root._openChain = [];
		for (let i = chain.length - 1; i >= 0; i--) chain[i].collapse();
		if (root._isOpen) (root as HTMLElement).hidePopover?.();
	};

	/**
	 * Drill-in click-outside: collapse the entire chain.
	 *
	 * In drill-in mode only the deepest level is `:popover-open` — popover
	 * light-dismiss would close just that level, and our onToggle cleanup
	 * would helpfully re-show the previous level. That's the wrong outcome
	 * for a click outside the menu: the user is dismissing the whole menu,
	 * not navigating one step back. Detect the outside click here and route
	 * to `_collapseChain`, which collapses every level at once.
	 *
	 * Cascade mode falls back to the native popover stack behavior: a click
	 * outside light-dismisses every popover down to the click target's
	 * closest ancestor popover, so no extra handling is needed there.
	 *
	 * For mouse/pen, pointerdown (capture) is the right hook: it fires
	 * before light-dismiss does its work, so by the time the toggle event
	 * fires our chain walk has already detached listeners and prevented
	 * the parent re-show.
	 *
	 * For touch, an outside pointerdown is ambiguous: it's also how a page
	 * scroll begins. Closing the chain on the scroll-start would be
	 * inconsistent with a root menu (which native light-dismiss leaves
	 * open while you scroll outside it) and annoying. So on touch we defer
	 * the decision: track the pointer and only chain-close on a confirmed
	 * tap (pointerup without crossing the scroll threshold); a scroll
	 * leaves the chain untouched, matching root-menu behavior.
	 */
	private _handleDocumentPointerdown = (event: PointerEvent): void => {
		if (!this._isOpen) return;
		// Anchor pointerdown on a root menu while open: capture as a gesture
		// so the trailing click — fired after native popover light-dismiss
		// has already closed us — won't reopen us via `_handleDocumentClick`.
		// Drill-in submenus take a different path further down.
		if (!this._isSubmenu) {
			const anchorEl = this._getAnchorEl();
			if (anchorEl && event.composedPath().includes(anchorEl)) {
				this._collapsedByPointerGesture = true;
				return;
			}
		}
		if (!this._drillInMode) return;
		// Only nested drill-in submenus need this: they form a hidden chain
		// of ancestors that won't auto-collapse on outside click. A root
		// menu has nothing to chain-close — popover light-dismiss + the
		// invoker's `popovertargetaction` handle outside / anchor clicks
		// natively. Without this guard a click on the anchor of a root
		// drill-in menu would fire chain-close → hide → auto-sync flips
		// `popovertargetaction` to 'show' → click default action reopens
		// (the "menu sluit en opent consistent weer" bug on small screens).
		if (!this._isSubmenu) return;
		// Walk this menu + every parent in the drill-in chain. If the
		// pointerdown landed inside any of them, it's an in-chain click
		// (e.g. on the back button, on the menu background, on an item)
		// and the existing handlers take care of it.
		const path = event.composedPath();
		let menu: NLDDMenu | null = this;
		while (menu) {
			if (path.includes(menu)) return;
			menu = menu._parentMenu;
		}
		// Touch: defer to a confirmed tap so a page-scroll started outside
		// the chain doesn't collapse it (consistent with the root menu,
		// which stays open while scrolling outside).
		if (event.pointerType === 'touch') {
			this._pointer.trackOutsideTap(event, () => {
				(this._chainRoot ?? this)._collapsedByPointerGesture = true;
				this._collapseChain();
			});
			return;
		}
		(this._chainRoot ?? this)._collapsedByPointerGesture = true;
		this._collapseChain();
	};

	// — Lifecycle callbacks ————————————————————————————————————————————————————

	private static _menuIdCounter = 0;

	override connectedCallback(): void {
		super.connectedCallback();
		if (!this.id) {
			// Auto-id so submenu openers can reference us via aria-controls.
			this.id = `nldd-menu-${NLDDMenu._menuIdCounter++}`;
		}
		if (!this.hasAttribute('popover')) {
			this.setAttribute('popover', '');
		}
		this.addEventListener('beforetoggle', this._handleBeforeToggle);
		this.addEventListener('toggle', this._handleToggle);
		this.addEventListener('keydown', this._handleKeydown);
		this.addEventListener('focusout', this._handleFocusOut);
		this.addEventListener('mouseenter', this._handleMenuItemMouseenter, true);
		this.addEventListener('mouseover', this._handleMouseover);
		this.addEventListener('mouseleave', this._handleMouseleave);
		this.addEventListener('menu-item-focused', this._handleMenuItemFocused);
		this.addEventListener('submenu-open', this._handleSubmenuOpen);
		this.addEventListener('select', this._collapseChain);
		document.addEventListener('click', this._handleDocumentClick);
	}

	override willUpdate(): void {
		if (this.hasUpdated) return;
		// Read off the light DOM, which stands before the first render. Setting it
		// in `firstUpdated` asks for a second render from inside the first.
		this._updateEmptyState();
	}

	override firstUpdated(): void {
		// Initial header/footer detection: slotchange fires for later changes, but
		// content assigned before this covers the first render (slot exists on the
		// root only). Read off the slots, so not before the first render, and
		// deferred out of the update cycle for the same reason as above.
		queueMicrotask(() => {
			this._onHeaderSlotChange();
			this._onFooterSlotChange();
		});
		// Give the anchor its aria-haspopup before any interaction. Deferred a
		// microtask because an `anchor="id"` target may render after us; a later
		// anchor still gets seeded from `updated()`. Mirrors nldd-popover.
		Promise.resolve().then(() => this._syncAnchorPopupState(this._isOpen));
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		// Close any open child submenu before tearing down — the submenu is a
		// document-anchored popover and would otherwise outlive its parent.
		// The toggle listener wired in _handleSubmenuOpen still fires from
		// the hidePopover, but the cleanup below has not run yet so its
		// state-clear path is safe.
		if (this._activeSubmenu) {
			(this._activeSubmenu as HTMLElement).hidePopover?.();
		}
		this.removeEventListener('beforetoggle', this._handleBeforeToggle);
		this.removeEventListener('toggle', this._handleToggle);
		this._previousAnchorForResync?.removeEventListener('pointerdown', this._resyncAnchorFromPopoverState, true);
		this._previousAnchorForResync = null;
		this.removeEventListener('keydown', this._handleKeydown);
		this.removeEventListener('focusout', this._handleFocusOut);
		clearTimeout(this._tabbingTimer);
		this._tabbing = false;
		this.removeEventListener('mouseenter', this._handleMenuItemMouseenter, true);
		this.removeEventListener('mouseover', this._handleMouseover);
		this.removeEventListener('mouseleave', this._handleMouseleave);
		this.removeEventListener('menu-item-focused', this._handleMenuItemFocused);
		this.removeEventListener('submenu-open', this._handleSubmenuOpen);
		this.removeEventListener('select', this._collapseChain);
		document.removeEventListener('click', this._handleDocumentClick);
		// Defensive: the pointerdown + resize listeners are added on open
		// and removed on close, but if the menu is torn down mid-open we'd
		// otherwise leak the global listeners.
		document.removeEventListener('pointerdown', this._handleDocumentPointerdown, true);
		this._pointer.stopOutsideTap();
		window.removeEventListener('resize', this._handleWindowResize);
		this._cancelHoverOpen();
		this._safeTriangle.stop();
		if (this._typeaheadTimer !== null) {
			clearTimeout(this._typeaheadTimer);
			this._typeaheadTimer = null;
		}
		this._cleanupAutoUpdate?.();
		this._cleanupAutoUpdate = null;
	}

	// — Internal helpers ——————————————————————————————————————————————————————

	private _getVisibleItems(): NLDDMenuItem[] {
		// Light-DOM querySelectorAll returns ALL menu-item descendants — items
		// inside nested submenus included. Filter to items that belong directly
		// to this menu (closest enclosing nldd-menu === this), so navigation
		// and highlight management stay scoped to one level at a time.
		return Array.from(
			this.querySelectorAll('nldd-menu-item:not([hidden]):not([disabled])')
		).filter(item => item.closest('nldd-menu') === this) as NLDDMenuItem[];
	}

	private _getFocusedIndex(items: NLDDMenuItem[]): number {
		return items.findIndex(item => item.hasAttribute('data-focused'));
	}

	private _clearHighlight(): void {
		// Same scope rule as _getVisibleItems — only clear highlights on items
		// that belong directly to this menu. Light-DOM querySelectorAll would
		// otherwise also clear items inside nested submenus, silently
		// corrupting their highlight state.
		Array.from(this.querySelectorAll('nldd-menu-item'))
			.filter(item => item.closest('nldd-menu') === this)
			.forEach(item => item.removeAttribute('highlighted'));
	}

	private _setHighlight(target: NLDDMenuItem | null): void {
		this._clearHighlight();
		const resolved = target ?? this._getVisibleItems()[0] ?? null;
		resolved?.setAttribute('highlighted', '');
	}

	private _updateEmptyState(): void {
		// "Empty" means nothing is shown, not nothing is navigable. Disabled items
		// still render (grayed out), so a menu whose items are all disabled is not
		// empty. Only filtering, which hides non-matching items, empties a menu.
		// _getVisibleItems() drops [disabled] for keyboard nav, so it must not
		// decide the empty state, or a fully-disabled menu wrongly shows it.
		const shown = Array.from(
			this.querySelectorAll('nldd-menu-item:not([hidden])'),
		).filter(item => item.closest('nldd-menu') === this);
		this._isEmpty = shown.length === 0;
	}

	/** True when the named slot has non-whitespace content. assignedNodes (not
	 * assignedElements) so a bare text header counts; whitespace-only formatting
	 * nodes don't. */
	private _slotHasContent(name: string): boolean {
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);
		return (slot?.assignedNodes({ flatten: true }) ?? []).some(n =>
			n.nodeType === Node.ELEMENT_NODE
			|| (n.nodeType === Node.TEXT_NODE && (n.textContent?.trim() ?? '') !== ''),
		);
	}

	_onHeaderSlotChange(): void {
		this._hasHeader = this._slotHasContent('header');
	}

	_onFooterSlotChange(): void {
		this._hasFooter = this._slotHasContent('footer');
	}

	private _updateDividerVisibility(): void {
		// Only the default-slot children form the item flow. Named-slot children
		// (header / footer / empty) sit in their own regions, so exclude them from
		// divider adjacency, or a header would count as the "first child" and swallow
		// a following divider.
		const children = (Array.from(this.children) as Element[]).filter(el => !el.hasAttribute('slot'));
		children.forEach(el => {
			const tag = el.tagName.toLowerCase();
			if (tag === 'nldd-menu-divider') el.removeAttribute('hidden');
			if (tag === 'nldd-menu-group') {
				el.removeAttribute('data-no-bottom-divider');
				el.removeAttribute('data-no-top-divider');
			}
		});

		const visible = children.filter(el => !el.hasAttribute('hidden'));

		// Pass 1: hide redundant explicit dividers (first/last, adjacent to
		// another divider, adjacent to a group's auto-divider).
		visible.forEach((el, index) => {
			if (el.tagName.toLowerCase() !== 'nldd-menu-divider') return;
			const prevTag = visible[index - 1]?.tagName.toLowerCase();
			const nextTag = visible[index + 1]?.tagName.toLowerCase();
			const isFirst = index === 0;
			const isLast = index === visible.length - 1;
			if (
				isFirst || isLast
				|| prevTag === 'nldd-menu-divider'
				|| prevTag === 'nldd-menu-group'
				|| nextTag === 'nldd-menu-group'
			) {
				el.setAttribute('hidden', '');
			}
		});

		// Pass 2: determine group bottom-divider against the post-pass-1
		// visible set. Without this re-filter a group followed by an
		// explicit divider that pass 1 hid (e.g. because the divider is
		// last, or the items after it are hidden) would still see the
		// divider as its "next" sibling and keep the bottom border.
		const remaining = visible.filter(el => !el.hasAttribute('hidden'));
		remaining.forEach((el, index) => {
			if (el.tagName.toLowerCase() !== 'nldd-menu-group') return;
			// Top divider: suppress when the group is the first item. CSS
			// :first-child can't do this once a `header` slot makes the header div
			// the first light-DOM child (the group is then no longer :first-child),
			// so drive it from the filtered item flow instead.
			if (index === 0) {
				el.setAttribute('data-no-top-divider', '');
			}
			const nextTag = remaining[index + 1]?.tagName.toLowerCase();
			const isLast = index === remaining.length - 1;
			if (isLast || nextTag === 'nldd-menu-group') {
				el.setAttribute('data-no-bottom-divider', '');
			}
		});
	}

	// — Public API ————————————————————————————————————————————————————————————

	/**
	 * Filter items based on a query string.
	 *
	 * Matching items are kept visible. Non-matching items are hidden. Matching
	 * items receive `query=<query>` so their text-cell bolds the non-typed
	 * remainder (predictive completion — the ARIA APG pattern for combobox).
	 *
	 * When the query is empty, all items are shown and `query` is cleared.
	 *
	 * With `hide: false` nothing is hidden and every item gets the `query`, for
	 * a list someone else already filtered, such as a server answering per
	 * keystroke. Text without the query in it is shown as it is.
	 */
	public filter(query: string, { hide = true }: { hide?: boolean } = {}): void {
		if (import.meta.env?.DEV && this.variant === 'navigation' && !this._warnedFilterInNavigation) {
			this._warnedFilterInNavigation = true;
			console.warn('nldd-menu: filter() belongs to a menu of actions or options. A navigation menu is a short list of links and is not filtered.');
		}
		const allItems = Array.from(this.querySelectorAll('nldd-menu-item')) as NLDDMenuItem[];
		allItems.forEach(item => {
			const matches = !hide || !query || this.filterFn(query, item);
			item.toggleAttribute('hidden', !matches);
			item.query = (matches && query) ? query : '';
		});
		this._updateGroupVisibility();
		this._setHighlight(null);
		this._updateEmptyState();
		this._updateDividerVisibility();
		if (this._isOpen) this.reposition();
	}

	/**
	 * Hide each nldd-menu-group whose items are all filtered out — a labeled
	 * heading above an empty section reads as broken. Runs after filter() has
	 * updated individual item visibility.
	 */
	private _updateGroupVisibility(): void {
		const groups = this.querySelectorAll('nldd-menu-group');
		groups.forEach(group => {
			const visibleItems = group.querySelectorAll('nldd-menu-item:not([hidden])');
			group.toggleAttribute('hidden', visibleItems.length === 0);
		});
	}

	/**
	 * Move both focus and highlight to the next, previous, or first visible item.
	 */
	public focusItem(direction: 'next' | 'prev' | 'first'): void {
		const items = this._getVisibleItems();
		if (items.length === 0) return;

		let targetIndex: number;

		if (direction === 'first') {
			targetIndex = 0;
		} else {
			const current = items.findIndex(item =>
				item.hasAttribute('highlighted') || item.hasAttribute('data-focused')
			);
			if (direction === 'next') {
				targetIndex = current === -1 ? 0 : current < items.length - 1 ? current + 1 : 0;
			} else {
				targetIndex = current === -1 ? items.length - 1 : current > 0 ? current - 1 : items.length - 1;
			}
		}

		items.forEach(item => item.removeAttribute('highlighted'));
		items[targetIndex].setAttribute('highlighted', '');
		items[targetIndex].focus();
	}

	/**
	 * Move the highlight to the next or previous visible item without moving focus.
	 * Useful when keyboard navigation should keep focus on the input.
	 */
	public moveHighlight(direction: 'next' | 'prev'): void {
		const items = this._getVisibleItems();
		if (items.length === 0) return;

		const current = items.findIndex(item => item.hasAttribute('highlighted'));
		let next: number;

		if (direction === 'next') {
			next = current === -1 ? 0 : current < items.length - 1 ? current + 1 : 0;
		} else {
			next = current === -1 ? items.length - 1 : current > 0 ? current - 1 : items.length - 1;
		}

		items.forEach(item => item.removeAttribute('highlighted'));
		items[next].setAttribute('highlighted', '');
		// Focus stays with the consumer here (the combo-box keeps it in the input),
		// so the browser does not scroll along like it does on the focus path.
		// `block: 'nearest'` does the minimum: nothing when the item is already
		// visible, one row when stepping just past an edge, and all the way back
		// to the other end on wrap-around.
		items[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
	}

	/** Returns the currently highlighted item, or null if none. */
	public getHighlighted(): NLDDMenuItem | null {
		return this.querySelector('nldd-menu-item[highlighted]') as NLDDMenuItem | null;
	}

	/** Returns the ID of the currently highlighted item, or empty string if none. */
	public getHighlightedId(): string {
		return this.getHighlighted()?.id ?? '';
	}

	/** Read a px-valued CSS custom property as a number. `parseFloat`
	 * keeps fractional pixels; an unset/NaN value falls back to 0. */
	private _cssPx(name: string): number {
		const v = parseFloat(getComputedStyle(this).getPropertyValue(name));
		return Number.isNaN(v) ? 0 : v;
	}

	/** Recalculate position and size relative to the anchor element. */
	public async reposition(): Promise<void> {
		const anchorEl = this._getAnchorEl();
		if (!anchorEl || !this._isOpen) return;

		const viewportMargin = this._cssPx('--_menu-viewport-margin');

		// Cascade-mode submenus: shift up by the menu's own padding so the
		// first submenu item lines up vertically with the parent opener item.
		// Without this, the submenu's top edge aligns with the opener and the
		// inner padding pushes the first item down, leaving a visible step.
		const submenuPadding = (this._isSubmenu && !this._drillInMode)
			? this._cssPx('--_menu-padding')
			: 0;

		// Drill-in: pick the side from the available space around the
		// anchor — recomputed every reposition, but content-independent so
		// a larger submenu never changes it (no mid-chain jump). `flip` is
		// content-dependent and WOULD jump the stack when a bigger submenu
		// doesn't fit, so it's dropped here; `size` caps the height and
		// the menu scrolls internally instead. Re-resolving each time (vs
		// freezing) keeps it following the anchor on scroll and re-picking
		// the roomiest side after a close + reopen. Cascade keeps `flip`
		// (submenus open beside the opener, content-fit matters there).
		const drillIn = this._drillInMode;
		const effectivePlacement = drillIn
			? this._resolveDrillInPlacement(anchorEl)
			: this.placement;

		const { x, y } = await computePosition(anchorEl, this, {
			placement: effectivePlacement as import('@floating-ui/dom').Placement,
			middleware: [
				offset({ mainAxis: this.anchorOffset, alignmentAxis: -submenuPadding }),
				...(drillIn ? [] : [flip({ padding: viewportMargin })]),
				shift({ padding: viewportMargin }),
				size({
					padding: viewportMargin,
					apply: ({ availableHeight }: { availableHeight: number }) => {
						this.style.setProperty('--_menu-max-height', `${availableHeight}px`);
					},
				}),
			],
		});

		Object.assign(this.style, {
			left: `${x}px`,
			top: `${y}px`,
		});
	}

	// — Private handlers ——————————————————————————————————————————————————————

	private _handleKeydown = (event: KeyboardEvent): void => {
		if (event.key === 'Tab' && this._tabOut(event)) return;
		// Only a navigation menu closes on a Tab out; see _handleFocusOut.
		if (event.key === 'Tab' && this.variant === 'navigation') {
			this._tabbing = true;
			clearTimeout(this._tabbingTimer);
			this._tabbingTimer = setTimeout(() => { this._tabbing = false; });
		}
		const items = this._getVisibleItems();
		if (items.length === 0) return;

		// keydown bubbles up the flat tree, so this handler fires on every
		// ancestor menu in the chain. Bail when focus belongs to a descendant
		// submenu — that submenu's own handler already processed the key, and
		// processing it here too would advance navigation an extra step per
		// ancestor (or close an extra level on Escape).
		const focusedDescendant = this.querySelector<NLDDMenuItem>('nldd-menu-item[data-focused]');
		if (focusedDescendant && focusedDescendant.closest('nldd-menu') !== this) return;

		const index = this._getFocusedIndex(items);

		switch (event.key) {
			case 'ArrowDown': {
				event.preventDefault();
				event.stopPropagation();
				const next = index === -1 ? 0 : index < items.length - 1 ? index + 1 : 0;
				items[next].focus();
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				event.stopPropagation();
				const prev = index === -1 ? items.length - 1 : index > 0 ? index - 1 : items.length - 1;
				items[prev].focus();
				break;
			}
			case 'Home': {
				event.preventDefault();
				event.stopPropagation();
				items[0].focus();
				break;
			}
			case 'End': {
				event.preventDefault();
				event.stopPropagation();
				items[items.length - 1].focus();
				break;
			}
			case 'ArrowRight': {
				// Open the focused item's submenu if it has one. Mode-agnostic:
				// the parent menu's _handleSubmenuOpen handler routes to cascade
				// or drill-in based on viewport.
				const focused = items[index];
				if (focused?._hasSubmenu) {
					event.preventDefault();
					event.stopPropagation();
					focused._handleClick();
					// Focus the first item in the submenu once it's open.
					requestAnimationFrame(() => {
						this._activeSubmenu?._getVisibleItems()[0]?.focus();
					});
				}
				break;
			}
			case 'ArrowLeft': {
				// In a submenu (cascade or drill-in): close it and return focus
				// to the parent item. On the root menu, ArrowLeft is a no-op.
				if (this._isSubmenu) {
					event.preventDefault();
					event.stopPropagation();
					const parentItem = this._parentItem;
					(this as HTMLElement).hidePopover();
					parentItem?.focus();
				}
				break;
			}
			case 'Escape': {
				event.preventDefault();
				event.stopPropagation();
				(this as HTMLElement).hidePopover();
				// On a submenu close, return focus to the parent item rather
				// than the root anchor — keeps the user oriented in the chain.
				const focusTarget = this._isSubmenu
					? this._parentItem
					: (this._getAnchorEl() as HTMLElement | null);
				focusTarget?.focus();
				break;
			}
			default: {
				// Typeahead (ARIA APG menu pattern): typing a single printable
				// character jumps to the next item whose visible text starts
				// with it. Repeated presses cycle through matches.
				// Not in a navigation menu: there the letter keys are the screen
				// reader's, for moving through links and headings.
				if (this.variant !== 'navigation' && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
					this._handleTypeahead(event, items, index);
				}
			}
		}
	};

	/**
	 * Tab past the last item, or Shift+Tab before the first, of a menu that
	 * hangs off a control. The menu lives in the top layer, often in `<body>`,
	 * so left to the browser that Tab goes on from the end of the document and
	 * skips everything after the control. It closes the menu and goes on from
	 * the control instead: to what follows it, or back to it. A submenu leaves
	 * Tab to its root menu, which sees no focused item of its own and lets the
	 * browser move between the items.
	 */
	private _tabOut(event: KeyboardEvent): boolean {
		const anchor = this._getAnchorEl() as HTMLElement | null;
		if (!anchor || this._isSubmenu || !(this as HTMLElement).matches(':popover-open')) return false;
		const items = this._getVisibleItems();
		const index = items.findIndex((item) => item.matches(':focus-within'));
		if (index === -1 || index !== (event.shiftKey ? 0 : items.length - 1)) return false;
		event.preventDefault();
		event.stopPropagation();
		const next = event.shiftKey ? anchor : nextTabbableAfter(anchor, this);
		(this as HTMLElement).hidePopover();
		(next ?? anchor).focus();
		return true;
	}

	/**
	 * A navigation menu closes when focus leaves it, the way a disclosure in a
	 * site navigation does: Tab past the last link and the menu is gone, with
	 * nothing left open over the page. An action menu keeps its own rules.
	 *
	 * Only when focus goes somewhere, or when Tab took it. Without a target it
	 * is the window losing focus or a press on something that takes none, and
	 * light dismiss covers those. Tab past the last link of the page has no
	 * target either, though, and that one does leave the menu.
	 */
	private _handleFocusOut = (event: FocusEvent): void => {
		if (this.variant !== 'navigation') return;
		if (!(this as HTMLElement).matches(':popover-open')) return;
		const next = event.relatedTarget as Node | null;
		if (next ? this.contains(next) || this._isAnchor(next) : !this._tabbing) return;
		(this as HTMLElement).hidePopover();
	};

	/**
	 * Whether focus went to the control that opens this menu. Closing here
	 * would hand the click that follows a closed menu, and it would open it
	 * again; the toggle on the anchor does the closing. The node arrives
	 * retargeted, so an anchor inside a shadow root shows up as its host.
	 */
	private _isAnchor(node: Node): boolean {
		const anchor = this._getAnchorEl();
		if (!anchor) return false;
		return node === anchor || anchor.contains(node) || (anchor.getRootNode() as ShadowRoot).host === node;
	}

	/** True from a Tab keydown until the focus change it causes has happened. */
	private _tabbing = false;
	private _tabbingTimer?: ReturnType<typeof setTimeout>;

	private _typeaheadBuffer = '';
	private _typeaheadTimer: number | null = null;
	/** Reset the typeahead buffer after this much idle time. 500ms is the
	 * common ARIA APG / OS convention — long enough to type a 2-3 char prefix
	 * comfortably, short enough that an unrelated later keystroke starts a
	 * fresh search. */
	private static readonly _TYPEAHEAD_RESET_MS = 500;

	/**
	 * ARIA APG typeahead: characters typed within 500ms accumulate into a
	 * buffer; the menu jumps to the first item whose text starts with the
	 * buffer (case-insensitive).
	 *
	 * Single-char buffer (first press or after reset) cycles through matches
	 * — repeated presses of the same letter step through every item starting
	 * with it. Multi-char buffer matches from the currently-focused item, so
	 * extending the prefix while the current item still matches keeps focus
	 * stable instead of jumping forward.
	 */
	private _handleTypeahead(event: KeyboardEvent, items: NLDDMenuItem[], currentIndex: number): void {
		// Extend (or seed) the buffer and (re)arm the reset timer.
		if (this._typeaheadTimer !== null) {
			clearTimeout(this._typeaheadTimer);
		}
		this._typeaheadBuffer += event.key.toLowerCase();
		this._typeaheadTimer = window.setTimeout(() => {
			this._typeaheadBuffer = '';
			this._typeaheadTimer = null;
		}, NLDDMenu._TYPEAHEAD_RESET_MS);

		// Single char → cycle past the current item; multi char → start AT the
		// current item so a still-matching prefix doesn't move focus.
		const start = this._typeaheadBuffer.length === 1 && currentIndex >= 0
			? currentIndex + 1
			: Math.max(0, currentIndex);

		for (let i = 0; i < items.length; i++) {
			const idx = (start + i) % items.length;
			if (items[idx].text.toLowerCase().startsWith(this._typeaheadBuffer)) {
				event.preventDefault();
				event.stopPropagation();
				items[idx].focus();
				return;
			}
		}
	}

	// A popover paints at its default position the instant it opens, before our async
	// Floating UI reposition runs — a visible flash in the wrong place. Clearing
	// `positioned` here (beforetoggle fires *before* the popover is shown) keeps it
	// hidden via CSS until `_handleToggle` re-sets it once placed.
	/**
	 * Tells every item below this menu which menu owns it.
	 *
	 * An item carries no menu role until this has run, so it has to run wherever
	 * the set of items can change: when the variant changes, when the menu
	 * opens, and on slotchange for items that arrive while it is already open.
	 * That last one is not hypothetical: `nldd-toolbar` appends its overflow
	 * clones on a resize, which can happen with the menu open.
	 *
	 * Items nested in an `nldd-menu-group` are reached by the query but not by
	 * that slotchange, since they are assigned to the group's slot. They are
	 * claimed on the next open.
	 *
	 * The same pass gives the menu's own items one check-mark column when any of
	 * them is a checkbox or radio, so the text of every group starts at the same
	 * place. A submenu's items are its own and are left to it.
	 */
	public _claimItems = (): void => {
		// A submenu of a navigation menu is navigation too. Set before the
		// items are claimed, so they get one answer and not two.
		if (this.variant === 'navigation') {
			(Array.from(this.querySelectorAll('nldd-menu')) as NLDDMenu[]).forEach(menu => { menu.variant = 'navigation'; });
		}
		const items = Array.from(this.querySelectorAll('nldd-menu-item')) as NLDDMenuItem[];
		items.forEach(item => {
			item.menuVariant = this.variant;
		});
		(Array.from(this.querySelectorAll('nldd-menu-divider, nldd-menu-group')) as (NLDDMenuDivider | NLDDMenuGroup)[])
			.forEach(part => { part.menuVariant = this.variant; });
		this._warnOnActionsInNavigation(items);
		const own = items.filter(item => item.closest('nldd-menu') === this);
		const checkColumn = this.variant === 'menu' && own.some(item => item.type !== 'button');
		own.forEach(item => {
			item.checkColumn = checkColumn;
		});
	};

	private _warnedActionsInNavigation = false;
	private _warnedFilterInNavigation = false;

	/** Checkable items and shortcuts belong to actions, not to a list of links. */
	private _warnOnActionsInNavigation(items: NLDDMenuItem[]): void {
		if (!import.meta.env?.DEV || this.variant !== 'navigation' || this._warnedActionsInNavigation) return;
		const stray = items.find(item => item.type !== 'button' || item.shortcut);
		if (!stray) return;
		this._warnedActionsInNavigation = true;
		console.warn('nldd-menu: variant="navigation" is a list of links. A checkbox or radio item, or a shortcut, belongs to an action menu and has no role to live in here. Use the default variant for actions.', stray);
	}

	private _handleBeforeToggle = (event: Event): void => {
		if ((event as ToggleEvent).newState === 'open') this.removeAttribute('positioned');
	};

	private _handleToggle = async (event: Event): Promise<void> => {
		const toggleEvent = event as ToggleEvent;
		this._isOpen = toggleEvent.newState === 'open';

		// Sync the anchor's "is-expanded" state so an anchor button (or any
		// element exposing an `expanded` property) shows the active visual
		// while we're open. Skip menu-items as anchors — submenu openers
		// manage their own `_submenuOpen` lifecycle and don't have an
		// `expanded` prop. Also opt the anchor into menu/listbox semantics
		// via `popupType` when it supports it and the consumer hasn't
		// already chosen a value, so screen readers announce the role.
		this._syncAnchorPopupState(this._isOpen);

		if (toggleEvent.newState !== 'open') {
			// The offset belongs to the anchor that opened the menu, which sets
			// it again on every open; another anchor starts from 0.
			this.anchorOffset = 0;
			this._cleanupAutoUpdate?.();
			this._cleanupAutoUpdate = null;
			window.removeEventListener('resize', this._handleWindowResize);
			document.removeEventListener('pointerdown', this._handleDocumentPointerdown, true);
			this._pointer.stopOutsideTap();
			this._clearHighlight();
			return;
		}

		this._updateDividerVisibility();
		this._clearHighlight();
		this._updateEmptyState();
		this._claimItems();

		await this.reposition();
		this.setAttribute('positioned', ''); // placed — reveal it (see _handleBeforeToggle)
		const anchorEl = this._getAnchorEl();
		if (anchorEl) {
			this._cleanupAutoUpdate = autoUpdate(anchorEl, this, () => this.reposition());
		}
		// Wired only while open so idle menus pay nothing and we don't
		// accidentally close other menus on the page during a resize or
		// during an unrelated pointerdown elsewhere.
		window.addEventListener('resize', this._handleWindowResize, { passive: true });
		// Capture so we run before the popover light-dismiss algorithm
		// processes the pointerdown — gives us a chance to redirect the
		// dismissal into a chain-close in drill-in mode.
		document.addEventListener('pointerdown', this._handleDocumentPointerdown, true);

		await this.updateComplete;
		if (this.variant !== 'listbox') {
			const keyboard = isKeyboardMode();
			const items = this._getVisibleItems();
			if (keyboard && items.length > 0) {
				this._setHighlight(items[0]);
				items[0].focus();
			} else {
				const menu = this.shadowRoot?.querySelector<HTMLElement>('.menu');
				menu?.classList.toggle('is-pointer-focus', !keyboard);
				menu?.focus();
			}
		}
	};

	override render() {
		return menuTemplate.call(this, this._isEmpty, this.variant);
	}
}

if (!customElements.get('nldd-menu')) {
	customElements.define('nldd-menu', NLDDMenu);
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-menu': NLDDMenu;
		'nldd-menu-item': NLDDMenuItem;
		'nldd-menu-divider': NLDDMenuDivider;
		'nldd-menu-group': NLDDMenuGroup;
	}
}
