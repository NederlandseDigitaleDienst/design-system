import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { computePosition, flip, shift, offset, size, autoUpdate } from '@floating-ui/dom';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { menuStyles, menuItemStyles, menuDividerStyles, menuGroupStyles } from './menu.styles.js';
import { menuTemplate, menuItemTemplate, menuDividerTemplate, menuGroupTemplate } from './menu.template.js';
import { nlddMenuTranslations } from './menu.i18n.js';
import type { NLDDMenuTranslations } from './menu.i18n.js';
import type { QueryMarkMode } from '../../../utilities/render-marked.js';
import '../../lists-and-tables/cells/icon-cell/icon-cell.js';
import '../../lists-and-tables/cells/spacer-cell/spacer-cell.js';
import '../../lists-and-tables/cells/text-cell/text-cell.js';
import '../../content/icon/icon.js';
import '../../content/keyboard-shortcut/keyboard-shortcut.js';
import '../../status-and-feedback/inline-dialog/inline-dialog.js';
import { isKeyboardMode, isTouchMode } from '../../../utilities/input-modality.js';
import { breakpoints } from '../../../assets/styles/breakpoints.js';


// # nldd-menu-divider

/**
 * A horizontal rule between groups of items in an `nldd-menu`.
 *
 * @element nldd-menu-divider
 */
export class NLDDMenuDivider extends LitElement {
	static override styles = menuDividerStyles;

	override render() {
		return menuDividerTemplate();
	}
}

if (!customElements.get('nldd-menu-divider')) {
	customElements.define('nldd-menu-divider', NLDDMenuDivider);
}


// # nldd-menu-group

/**
 * A labeled group of menu items inside an nldd-menu. Wraps its slotted
 * items in `role="group"` with `aria-labelledby` pointing to the group's
 * `text`, providing native ARIA group semantics that a flat title element
 * can't deliver.
 *
 * The group renders an automatic divider above itself, except when it's
 * the first child of the menu — so consumers don't need to manage
 * separator placement around groups themselves. Spacing above the title
 * is intentionally larger than below, to bind the title visually to the
 * items it labels.
 *
 * Use the wrapper for grouping with a title; for ungrouped flat menus or
 * a divider without a title, the existing `nldd-menu-item` +
 * `nldd-menu-divider` flat structure keeps working unchanged.
 *
 * @element nldd-menu-group
 *
 * @attr {string} text - Group title text shown above the items.
 *
 * @slot - nldd-menu-item children (the items belonging to this group).
 */
export class NLDDMenuGroup extends LitElement {
	static override styles = menuGroupStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	// SSR caveat: this counter is per module instance, not per render. If
	// the component ever runs in a context where modules reload between
	// server and client (SSR hydration, Vite HMR with fresh module state),
	// IDs will mismatch and aria-labelledby refs will break. Browser-only
	// today; revisit if hydration is added.
	private static _idCounter = 0;
	readonly _titleId = `nldd-menu-group-title-${NLDDMenuGroup._idCounter++}`;

	override render() {
		return menuGroupTemplate(this);
	}
}

if (!customElements.get('nldd-menu-group')) {
	customElements.define('nldd-menu-group', NLDDMenuGroup);
}


// # nldd-menu-item

/**
 * A single item within an nldd-menu.
 *
 * @element nldd-menu-item
 *
 * @attr {boolean} destructive - Marks the item as destructive (red text; red highlight bg). Use for irreversible actions like "Delete". Color is the only built-in signal, so per WCAG 1.4.1 the item's own label must convey the destructive nature (e.g. "Verwijder") — don't rely on the red alone. Confirming the action (e.g. a follow-up dialog) is the consumer's responsibility.
 * @attr {string} text - Display text. Supports **bold** markdown syntax.
 * @attr {string} details - Secondary label shown on the right side.
 * @attr {string} icon - Icon name rendered before the text.
 * @attr {string} shortcut - Keyboard shortcut hint shown on the right, e.g. 'Cmd+E'. Display only (rendered via nldd-keyboard-shortcut) — it does not bind the key; wire up the handling in your app. Hidden on touch-only devices, where it isn't invokable.
 * @attr {string} shortcut-mac / shortcut-windows / shortcut-linux - Per-OS overrides for `shortcut`, picked by detected OS (falls back to `shortcut`).
 * @attr {string} href - Optional link target. A plain button item with an href renders as an `<a>` so it is a real link (middle-click, open in new tab, copy link). Ignored for submenu openers, checkbox/radio items, and while disabled.
 * @attr {string} type - Item type: 'button' | 'checkbox' | 'radio'. Default: 'button'.
 * @attr {boolean} selected - Selected state for checkbox and radio types.
 * @attr {boolean} disabled - Disabled state.
 * @attr {string} value - A value of the item's own, read off the item in a `select` handler. The default filter matches on it as well as on `text` and `aliases`. Not a form value: this component is not form-associated.
 * @attr {string} aliases - Space-separated alternative search terms.
 * @attr {string} query - Query substring to bold-highlight in text. Set by menu's filter(); also settable by consumers.
 * @attr {string} query-mark-mode - 'match' | 'predictive' (default: 'predictive'). See text-cell for details.
 *
 * @fires select - Fired when the item is clicked and not disabled.
 */
export class NLDDMenuItem extends LitElement {
	static override styles = menuItemStyles;

	@property({ type: Boolean, reflect: true })
	destructive = false;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	details = '';

	@property({ type: String, reflect: true })
	icon = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	shortcut = '';

	@property({ reflect: true, attribute: 'shortcut-mac', converter: reflectNonDefault<string>('') })
	shortcutMac = '';

	@property({ reflect: true, attribute: 'shortcut-windows', converter: reflectNonDefault<string>('') })
	shortcutWindows = '';

	@property({ reflect: true, attribute: 'shortcut-linux', converter: reflectNonDefault<string>('') })
	shortcutLinux = '';

	@property({ type: String, reflect: true })
	href = '';

	@property({ type: String, reflect: true })
	type: 'button' | 'checkbox' | 'radio' = 'button';

	@property({ type: Boolean, reflect: true })
	selected = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String, reflect: true })
	value = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	aliases = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	query = '';

	@property({ reflect: true, attribute: 'query-mark-mode', converter: reflectNonDefault<QueryMarkMode>('predictive') })
	queryMarkMode: QueryMarkMode = 'predictive';

	/**
	 * Which menu owns this item, set by that nldd-menu. Not part of the public API.
	 *
	 * `null` until one claims it, and an unclaimed item carries no menu role.
	 * A menu role is a promise about what is around you, so an item cannot make
	 * it on its own. `nldd-toolbar-item` holds exactly such an item: the
	 * declaration of what belongs in the overflow menu, which the toolbar clones
	 * into the real menu when it collapses. The clone is claimed there and the
	 * declaration stays what it is.
	 */
	@state()
	menuVariant: 'menu' | 'listbox' | null = null;

	/** Tracks whether this item's submenu (if any) is currently open. Set by
	 * the parent nldd-menu via the `submenu-open`/`submenu-close` lifecycle. */
	@state()
	_submenuOpen = false;

	private static _idCounter = 0;

	override connectedCallback(): void {
		super.connectedCallback();
		if (!this.id) {
			this.id = `nldd-menu-item-${NLDDMenuItem._idCounter++}`;
		}
		this.addEventListener('focusin', (e) => {
			// Only react when focus actually lands on our own shadow content
			// (the .menu__item button). focusin is composed and bubbles, so it
			// also fires here when focus moves into a slotted descendant —
			// notably when a child submenu's .menu element gets focused on
			// open. Without this guard the parent's _handleMenuItemFocused
			// re-highlights the opener after we just cleared it.
			const realTarget = e.composedPath()[0] as Element | undefined;
			if (!realTarget || !this.shadowRoot?.contains(realTarget)) return;
			this.setAttribute('data-focused', '');
			this.dispatchEvent(new CustomEvent('menu-item-focused', {
				bubbles: true,
				composed: true,
			}));
		});
		this.addEventListener('focusout', (e) => {
			// Mirror the focusin guard so a slotted descendant losing focus
			// doesn't strip data-focused from the opener while it's still
			// keyboard-focused itself.
			const realTarget = e.composedPath()[0] as Element | undefined;
			if (!realTarget || !this.shadowRoot?.contains(realTarget)) return;
			this.removeAttribute('data-focused');
		});
	}

	override focus(options?: FocusOptions): void {
		const focusable = this.shadowRoot?.querySelector<HTMLElement>('button, a');
		focusable?.focus(options);
	}

	/** Cached reference to the direct child `<nldd-menu>` (this item's
	 * submenu). Resolved once at firstUpdated; mutating the children after
	 * mount is not supported in v1. */
	private _cachedSubmenuEl: NLDDMenu | null = null;
	private _submenuMutationObserver: MutationObserver | null = null;

	get _submenuEl(): NLDDMenu | null {
		return this._cachedSubmenuEl;
	}

	get _hasSubmenu(): boolean {
		return this._cachedSubmenuEl !== null;
	}

	override willUpdate(): void {
		if (this.hasUpdated) return;
		// Before the first render, off the light DOM, so the chevron and the ARIA
		// attributes are right the first time. Resolving it in `firstUpdated` asks
		// for a second render from inside the first.
		this._cachedSubmenuEl = this.querySelector(':scope > nldd-menu');
	}

	override firstUpdated(): void {
		// Submenu attachment is one-shot in v1 — a nldd-menu added after this
		// point would silently miss aria-controls, the chevron indicator, the
		// hover-open lifecycle, and the close-state sync. Watch for late
		// additions and warn so consumers don't chase the symptom.
		this._submenuMutationObserver = new MutationObserver(() => {
			const current = this.querySelector(':scope > nldd-menu');
			if (current && current !== this._cachedSubmenuEl) {
				console.warn(
					'[nldd-menu-item] A nldd-menu child was added after mount. '
					+ 'Submenu attachment is resolved once at firstUpdated in v1, '
					+ 'so this menu will not be treated as a submenu. Define the '
					+ 'nldd-menu child before the item is connected to the DOM.',
				);
			}
		});
		this._submenuMutationObserver.observe(this, { childList: true });
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._submenuMutationObserver?.disconnect();
		this._submenuMutationObserver = null;
	}

	_handleClick(event?: Event): void {
		if (this.disabled) return;
		// Submenu items don't fire `select` — they open their submenu instead.
		// Item is either an action OR a submenu opener, not both.
		if (this._hasSubmenu) {
			// The button is wired to the submenu via the popoverTargetElement
			// IDL property (set in the template). That marks it as the
			// submenu's invoker so the browser excludes the opener from
			// popover light-dismiss — clicking the opener no longer closes
			// the submenu underneath it. The flip side: the browser would
			// also auto-show the popover with its default positioning,
			// which races our anchor + placement set in `_handleSubmenuOpen`.
			// preventDefault stops the browser action and lets our flow
			// own positioning.
			//
			// We use the IDL property rather than the `popovertarget`
			// attribute because the button lives in this menu-item's shadow
			// root while the submenu is a light-DOM child — attribute-based
			// ID resolution is tree-scoped and would silently fail to find
			// the cross-tree target. The IDL property takes a direct element
			// reference and works across shadow boundaries.
			event?.preventDefault();
			// Click on an already-open opener: keep the submenu visible and
			// the opener visually "active" (aria-expanded + :hover). A second
			// click should not toggle it closed — that conflicts with the
			// hover-open semantics of cascade mode.
			if (this._submenuOpen) return;
			this.dispatchEvent(new CustomEvent('submenu-open', {
				detail: { submenu: this._submenuEl, item: this },
				bubbles: true,
				composed: false,
			}));
			return;
		}
		this.dispatchEvent(new CustomEvent('select', {
			bubbles: true,
			composed: true,
		}));
		(this.closest('nldd-menu') as HTMLElement)?.hidePopover?.();
	}

	/** Programmatically select this item. */
	select(): void {
		this._handleClick();
	}

	override render() {
		return menuItemTemplate.call(this, this.menuVariant);
	}
}

if (!customElements.get('nldd-menu-item')) {
	customElements.define('nldd-menu-item', NLDDMenuItem);
}


// # nldd-menu

const defaultFilterFn = (query: string, item: NLDDMenuItem): boolean => {
	const q = query.toLowerCase();
	const textMatch = item.text.toLowerCase().includes(q);
	const valueMatch = item.value !== '' && item.value.toLowerCase().includes(q);
	const aliasesMatch = item.aliases !== '' && item.aliases.split(' ').some(s => s.toLowerCase().includes(q));
	return textMatch || valueMatch || aliasesMatch;
};

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
 * @attr {string} width - Explicit width, pinned exactly. Without it the menu sizes to its content between a minimum and a viewport-aware maximum (min(100vw - inset, 640px)).
 * @attr {string} anchor - ID of the anchor element. Positions the menu against it AND makes it a toggle: the menu listens on document click and opens/closes itself when the click lands on the anchor. Use this for a menu hung off a button. For a menu you open yourself (a type-ahead under a text field, say), set the `anchorElement` property instead — same positioning, no toggle.
 * @attr {string} placement - Floating UI placement. Default: 'bottom-start'.
 * @attr {number} max-items - Maximum number of visible items before scrolling. Sets --_max-items internally. Default: 0 (no limit).
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
	 * Render variant. Use 'listbox' when the menu serves as a combobox popup —
	 * this switches role to "listbox" and item roles to "option" per ARIA spec.
	 * Default: 'menu'.
	 */
	@property({ reflect: true, converter: reflectNonDefault<'menu' | 'listbox'>('menu') })
	variant: 'menu' | 'listbox' = 'menu';


	/**
	 * Explicit width, pinned exactly (sets --_width and clamps min/max to it).
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

	@property({ reflect: true, converter: reflectNonDefault<string>('bottom-start') })
	placement: string = 'bottom-start';

	/**
	 * Maximum number of visible items before the menu scrolls.
	 * Sets --_max-items internally. Default: 0 (no limit).
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

	/** Currently open child submenu (a direct descendant nldd-menu opened
	 * by one of this menu's items). null when no submenu is open. */
	private _activeSubmenu: NLDDMenu | null = null;
	private _activeSubmenuOpener: NLDDMenuItem | null = null;
	/** Cleanup closure for the currently open child submenu. Invoked by the
	 * submenu's `toggle→closed` event, but also callable directly from a
	 * chain-close walk so the upper levels can be torn down without waiting
	 * for stale toggle events that will never fire (e.g. a hidden drill-in
	 * parent whose popover state is already 'closed'). */
	private _activeSubmenuCleanup: ((skipReshow: boolean) => void) | null = null;
	/** Signal that this menu is hiding itself to make room for a deeper drill-in
	 * level — its parent's onToggle should skip the normal close cleanup
	 * (re-parent + re-show) so the chain stays in deeper-level state. */
	_drillInHidingForDeeper = false;
	/** Root-owned registry of every submenu currently open in this chain,
	 * in open order. Lives on the root menu only; submenus reach it via
	 * `_chainRoot`. Drives `_collapseChain()` so collapsing the whole
	 * stack never depends on `_activeSubmenu`/`_parentMenu` threading
	 * (which real interaction can leave stale). @internal */
	_openChain: NLDDMenu[] = [];
	/** Back-reference to the chain's root, set on every submenu when it
	 * opens. Lets `_collapseChain()` find the registry without walking
	 * the (possibly stale) parent links. null on the root. @internal */
	_chainRoot: NLDDMenu | null = null;
	/** Force-teardown for this submenu (detach toggle listener, hide,
	 * restore DOM, reset state — no parent re-show). Set when the submenu
	 * opens; called by `_collapseChain()`. @internal */
	_collapseSelf: (() => void) | null = null;

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

	private _t(key: keyof NLDDMenuTranslations, vars?: Record<string, string | number>): string {
		let str = this.translations[key] ?? nlddMenuTranslations[key];
		if (vars) {
			for (const [k, v] of Object.entries(vars)) {
				str = str.replace(`{${k}}`, String(v));
			}
		}
		return str;
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
	 */
	private _announce(message: string): void {
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
		if (changedProperties.has('width')) {
			if (this.width) {
				// An explicit width pins the menu to exactly that size — clamp the
				// content-driven min/max to it too, so callers that need an exact
				// width (e.g. combo-box matching its input) aren't widened by the
				// default minimum or capped by the default maximum.
				this.style.setProperty('--_width', this.width);
				this.style.setProperty('--_min-width', this.width);
				this.style.setProperty('--_max-width', this.width);
			} else {
				this.style.removeProperty('--_width');
				this.style.removeProperty('--_min-width');
				this.style.removeProperty('--_max-width');
			}
		}
		if (changedProperties.has('maxItems')) {
			if (this.maxItems > 0) {
				this.style.setProperty('--_max-items', String(this.maxItems));
			} else {
				this.style.removeProperty('--_max-items');
			}
		}
		if (changedProperties.has('variant')) {
			this._claimItems();
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

	// — Anchor ————————————————————————————————————————————————————————————————

	private _getAnchorEl(): Element | null {
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
		const margin = this._cssPx('--_viewport-margin');
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
		if ('popupType' in anchor && !anchor.popupType) {
			anchor.popupType = this.variant === 'listbox' ? 'listbox' : 'menu';
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

	// — Safe triangle (cascade only) ——————————————————————————————————————
	//
	// While a cascade submenu is open, a global mousemove listener tracks
	// the cursor against a "safe triangle" (Mayank/ishadeed pattern). The
	// triangle's apex is captured once on the first mousemove after submenu
	// open; the base is the submenu's two near corners (top + bottom of the
	// edge facing the parent — left edge if submenu is right of cursor,
	// right edge if floating-ui flipped it to the other side). The wedge
	// stays fixed until the cursor enters the submenu, so the user has a
	// predictable, stable area to traverse without losing the submenu.
	// While the cursor is inside the triangle, peer items don't activate.
	//
	// We deliberately do NOT auto-close on hover-out: moving the cursor to
	// empty space outside every menu leaves the chain open. The native
	// popover light-dismiss takes care of click-outside, which is the only
	// gesture that should collapse the chain.

	private _hoverOpenTimer: number | null = null;
	private _safeTriangleListener: ((e: MouseEvent) => void) | null = null;
	private _safeTriangleStallTimer: number | null = null;
	private _lastCursorPos: { x: number, y: number } | null = null;
	private _safeTriangleApex: { x: number, y: number } | null = null;
	private _safeTriangleSubmenu: NLDDMenu | null = null;
	private _movingTowardSubmenu = false;
	/** When the cursor sits motionless inside the safe triangle for this
	 * long, dismiss the triangle and let whatever item is under the cursor
	 * become interactive. Without this, a paused cursor would stay
	 * "protected" indefinitely and the user couldn't peer-hover. */
	private static readonly _SAFE_TRIANGLE_STALL_DISMISS_MS = 500;
	/** Pull the wedge apex this many pixels away from the submenu edge (i.e.
	 * to the left when the submenu is on the right). Widens the wedge near
	 * the cursor so brief diagonal wobble doesn't pop the cursor out at the
	 * apex, and avoids the degenerate single-line wedge when the cursor
	 * crossed the opener edge exactly at the same x as the near submenu
	 * corner. The shift is always negative — the standard placement is
	 * submenu-right, so "left" is the intuitive forgive direction. */
	private static readonly _SAFE_TRIANGLE_APEX_X_OFFSET = 4;

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
		if (this._movingTowardSubmenu && item !== this._activeSubmenuOpener) return;

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

	/** Resolve the menu-item under a viewport point and activate it via
	 * `_activateItem`. Used by safe-triangle recovery paths whose natural
	 * mouseenter has already fired (and bailed) — they need to re-trigger
	 * activation without synthesizing a MouseEvent. */
	private _activateItemAt(p: { x: number, y: number }): void {
		const el = document.elementFromPoint(p.x, p.y);
		const item = el?.closest('nldd-menu-item') as NLDDMenuItem | null;
		if (item) this._activateItem(item);
	}

	private _handleMouseleave = (): void => {
		if (this.variant !== 'listbox') this._clearHighlight();
		this._cancelHoverOpen();
		// No auto-close on hover-out: leaving the menu rect leaves the chain
		// open. Click-outside (popover light-dismiss) is the only gesture
		// that collapses the chain.
	};

	/** Start the global mouse tracker that powers the safe triangle. Called
	 * by _handleSubmenuOpen when a submenu opens in cascade mode. The
	 * listener is a thin orchestrator over the named phase methods below. */
	private _startSafeTriangle(submenu: NLDDMenu): void {
		this._stopSafeTriangle();
		this._lastCursorPos = null;
		this._safeTriangleApex = null;
		this._safeTriangleSubmenu = submenu;
		this._movingTowardSubmenu = false;

		this._safeTriangleListener = (e: MouseEvent) => {
			const p = { x: e.clientX, y: e.clientY };
			const r = submenu.getBoundingClientRect();

			// 1. In submenu (or any nested submenu) — arrived, clean up.
			if (NLDDMenu._isPointInMenuTree(p, submenu)) {
				this._safeTriangleArrived(p);
				return;
			}

			const openerRect = this._activeSubmenuOpener?.getBoundingClientRect();
			const cursorOnOpener = NLDDMenu._rectContainsPoint(openerRect, p);
			const lastOnOpener = NLDDMenu._rectContainsPoint(openerRect, this._lastCursorPos);

			// 2. Returned to opener — drop apex so the next exit can re-pin
			//    a fresh wedge. Overlay stays drawn until next render.
			if (this._safeTriangleApex !== null && cursorOnOpener) {
				this._safeTriangleApex = null;
			}

			const wasMoving = this._movingTowardSubmenu;

			if (this._safeTriangleApex === null) {
				// 3a. Still on opener — wait for an exit direction.
				if (cursorOnOpener) {
					this._safeTriangleWaitOnOpener(p, r, openerRect);
					return;
				}
				// 3b. Crossed top/bottom edge of opener — pin apex.
				if (openerRect && lastOnOpener && (p.y > openerRect.bottom || p.y < openerRect.top)) {
					this._safeTrianglePinApex(p, openerRect);
				} else {
					// 3c. Exited sideways — no protection. Drop the apex and
					// activate whatever item is under the cursor so peers
					// take over immediately.
					this._safeTriangleSidewaysExit(p, wasMoving);
				}
			} else {
				// 4. Apex pinned — test whether cursor is inside the wedge.
				this._safeTrianglePolygonTest(p, r);
			}
			this._lastCursorPos = p;

			// 5. Common per-frame work: highlight, recovery, stall timer.
			this._safeTriangleSyncOpenerHighlight();
			this._safeTriangleDirectionReversalRecovery(p, wasMoving);
			this._safeTriangleScheduleStall();
		};

		window.addEventListener('mousemove', this._safeTriangleListener);
	}

	// — Safe-triangle phase methods ————————————————————————————————————————

	/** Cursor entered the submenu (or any nested submenu) — clean up triangle
	 * state but leave the window mousemove listener alive. The listener still
	 * needs to fire while the cursor is inside the submenu so we can detect a
	 * return trip to the opener and re-pin a fresh apex for another exit. */
	private _safeTriangleArrived(p: { x: number, y: number }): void {
		this._movingTowardSubmenu = false;
		this._lastCursorPos = p;
		this._safeTriangleApex = null;
		this._activeSubmenuOpener?.removeAttribute('highlighted');
		this._removeSafeTriangleOverlay();
	}

	/** Cursor still on the opener — wait for an exit direction. Sets the
	 * "in transit" flag (so brief peer pass-throughs don't activate) and
	 * renders a live debug preview that follows the cursor. */
	private _safeTriangleWaitOnOpener(
		p: { x: number, y: number },
		r: DOMRect,
		openerRect: DOMRect | undefined,
	): void {
		this._movingTowardSubmenu = true;
		this._lastCursorPos = p;
		// Set opener highlight up front so the bold accent is already on
		// while the cursor is still on the opener — avoids a visible "pop"
		// when the cursor first crosses the bottom edge.
		if (this._activeSubmenuOpener
			&& !this._activeSubmenuOpener.hasAttribute('highlighted')) {
			this._setHighlight(this._activeSubmenuOpener);
		}
		if (this.debugSafeTriangle && openerRect) {
			const nearX = p.x < r.left ? r.left : r.right;
			this._renderSafeTriangleOverlay([
				{ x: p.x - NLDDMenu._SAFE_TRIANGLE_APEX_X_OFFSET, y: p.y },
				{ x: nearX, y: r.top },
				{ x: nearX, y: r.bottom },
			]);
		}
	}

	/** Cursor crossed the opener's top or bottom edge — pin apex there.
	 * x is clamped to the opener's range so the wedge starts at the visual
	 * edge regardless of how far past the edge this mousemove sample is, then
	 * shifted by _SAFE_TRIANGLE_APEX_X_OFFSET to widen the wedge at the
	 * cursor side (the 4px headroom that makes brief diagonal wobble forgive). */
	private _safeTrianglePinApex(
		p: { x: number, y: number },
		openerRect: DOMRect,
	): void {
		const apexX = Math.max(openerRect.left, Math.min(openerRect.right, p.x))
			- NLDDMenu._SAFE_TRIANGLE_APEX_X_OFFSET;
		const apexY = p.y > openerRect.bottom ? openerRect.bottom : openerRect.top;
		this._safeTriangleApex = { x: apexX, y: apexY };
		this._movingTowardSubmenu = true;
	}

	/** Cursor exited the opener sideways (left/right) or with no opener
	 * history — no triangle protection. Drop the flag and the overlay,
	 * and synthesize mouseenter on the element under the cursor so peers
	 * activate immediately (the natural mouseenter fired with flag=true
	 * during the on-opener phase and got bailed). */
	private _safeTriangleSidewaysExit(p: { x: number, y: number }, wasMoving: boolean): void {
		this._movingTowardSubmenu = false;
		this._lastCursorPos = p;
		this._removeSafeTriangleOverlay();
		if (wasMoving) this._activateItemAt(p);
	}

	/** Apex pinned — test whether the current cursor position is inside the
	 * wedge. Picks the submenu edge facing the cursor (left for right-start,
	 * right when floating-ui flipped it). */
	private _safeTrianglePolygonTest(p: { x: number, y: number }, r: DOMRect): void {
		const nearX = p.x < r.left ? r.left : r.right;
		const apex = this._safeTriangleApex!;
		// Single-point apex (no jitter band): the apex is already offset left
		// of the actual crossing point by _SAFE_TRIANGLE_APEX_X_OFFSET, so the
		// cursor sits comfortably inside the wedge near the opener edge — no
		// degenerate cases where a 1px jitter pops the cursor out at the apex.
		const wedge = [
			apex,
			{ x: nearX, y: r.top },
			{ x: nearX, y: r.bottom },
		];
		this._movingTowardSubmenu = NLDDMenu._pointInPolygon(p, wedge);
		if (this.debugSafeTriangle) {
			this._renderSafeTriangleOverlay(wedge);
		}
	}

	/** Sync opener highlight with the in-transit flag. Uses _setHighlight so
	 * any peer that briefly got highlighted (e.g. via the synthetic
	 * mouseenter on a wedge-edge wobble) is cleared. Skip when the opener
	 * already has the attribute to avoid DOM churn each frame. */
	private _safeTriangleSyncOpenerHighlight(): void {
		if (this._activeSubmenuOpener && this._movingTowardSubmenu
			&& !this._activeSubmenuOpener.hasAttribute('highlighted')) {
			this._setHighlight(this._activeSubmenuOpener);
		}
	}

	/** When the in-transit flag flips true → false, the cursor may already
	 * be sitting on a peer item whose natural mouseenter fired (and bailed)
	 * earlier. mouseenter won't re-fire until the cursor leaves and re-
	 * enters, so synthesize one here to activate the peer immediately. */
	private _safeTriangleDirectionReversalRecovery(p: { x: number, y: number }, wasMoving: boolean): void {
		if (!wasMoving || this._movingTowardSubmenu) return;
		this._activateItemAt(p);
	}

	/** Re-arm the stall-dismissal timer. If the cursor sits motionless
	 * inside the safe triangle long enough, drop the protection so the
	 * element under the cursor can become interactive without nudging. */
	private _safeTriangleScheduleStall(): void {
		if (this._safeTriangleStallTimer !== null) {
			clearTimeout(this._safeTriangleStallTimer);
			this._safeTriangleStallTimer = null;
		}
		if (!this._movingTowardSubmenu) return;
		this._safeTriangleStallTimer = window.setTimeout(() => {
			this._safeTriangleStallTimer = null;
			this._movingTowardSubmenu = false;
			this._safeTriangleApex = null;
			if (this._lastCursorPos) this._activateItemAt(this._lastCursorPos);
		}, NLDDMenu._SAFE_TRIANGLE_STALL_DISMISS_MS);
	}

	/** True when the rect contains the point (inclusive). Returns false for
	 * a missing rect or point — convenient for the optional-chained call
	 * sites in the safe-triangle logic. */
	private static _rectContainsPoint(
		rect: DOMRect | null | undefined,
		point: { x: number, y: number } | null | undefined,
	): boolean {
		return !!rect && !!point
			&& point.x >= rect.left && point.x <= rect.right
			&& point.y >= rect.top && point.y <= rect.bottom;
	}

	private _stopSafeTriangle(): void {
		if (this._safeTriangleListener !== null) {
			window.removeEventListener('mousemove', this._safeTriangleListener);
			this._safeTriangleListener = null;
		}
		if (this._safeTriangleStallTimer !== null) {
			clearTimeout(this._safeTriangleStallTimer);
			this._safeTriangleStallTimer = null;
		}
		this._lastCursorPos = null;
		this._safeTriangleApex = null;
		this._safeTriangleSubmenu = null;
		this._movingTowardSubmenu = false;
		this._removeSafeTriangleOverlay();
	}

	// — Debug overlay ————————————————————————————————————————————————————

	private _safeTriangleOverlay: HTMLDivElement | null = null;

	private _renderSafeTriangleOverlay(vertices: Array<{ x: number, y: number }>): void {
		const NS = 'http://www.w3.org/2000/svg';
		if (this._safeTriangleOverlay === null) {
			const wrapper = document.createElement('div');
			wrapper.setAttribute('popover', 'manual');
			wrapper.setAttribute('aria-hidden', 'true');
			wrapper.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;border:0;padding:0;margin:0;background:transparent;overflow:visible;';
			const svg = document.createElementNS(NS, 'svg');
			svg.setAttribute('width', '100%');
			svg.setAttribute('height', '100%');
			const polygon = document.createElementNS(NS, 'polygon');
			polygon.setAttribute('fill', 'rgba(255, 0, 128, 0.15)');
			polygon.setAttribute('stroke', 'rgba(255, 0, 128, 0.85)');
			polygon.setAttribute('stroke-width', '1');
			svg.appendChild(polygon);
			wrapper.appendChild(svg);
			document.body.appendChild(wrapper);
			wrapper.showPopover();
			this._safeTriangleOverlay = wrapper;
		}
		const polygon = this._safeTriangleOverlay.querySelector('polygon')!;
		polygon.setAttribute('points', vertices.map(v => `${v.x},${v.y}`).join(' '));
	}

	private _removeSafeTriangleOverlay(): void {
		this._safeTriangleOverlay?.hidePopover?.();
		this._safeTriangleOverlay?.remove();
		this._safeTriangleOverlay = null;
	}

	private _cancelHoverOpen(): void {
		if (this._hoverOpenTimer !== null) {
			clearTimeout(this._hoverOpenTimer);
			this._hoverOpenTimer = null;
		}
	}

	/** Recursively checks whether a point sits inside the given menu OR any of
	 * its descendant submenus. Used by the safe-triangle "arrived" check so a
	 * cursor that has continued past the immediate submenu into a deeper
	 * nested submenu still reads as "in the safe area" — without the recursive
	 * walk we'd treat the deeper hover as an exit and re-pin a stale apex. */
	private static _isPointInMenuTree(p: { x: number, y: number }, menu: NLDDMenu): boolean {
		const r = menu.getBoundingClientRect();
		if (p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom) return true;
		if (menu._activeSubmenu) return NLDDMenu._isPointInMenuTree(p, menu._activeSubmenu);
		return false;
	}

	/** Convex point-in-polygon test via consistent edge-cross-product sign.
	 * Vertices must be ordered (clockwise or counter-clockwise). */
	private static _pointInPolygon(p: { x: number, y: number }, vertices: Array<{ x: number, y: number }>): boolean {
		let hasNeg = false;
		let hasPos = false;
		for (let i = 0; i < vertices.length; i++) {
			const a = vertices[i];
			const b = vertices[(i + 1) % vertices.length];
			const cross = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
			if (cross < 0) hasNeg = true;
			if (cross > 0) hasPos = true;
			if (hasNeg && hasPos) return false;
		}
		return true;
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
			NLDDMenu._drillInModeQuery = matchMedia(`(pointer: coarse), (max-width: ${breakpoints.smMax})`);
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
	 * `submenu-open`. Branches on drill-in vs cascade mode for anchor +
	 * placement, but the lifecycle (popover.show, listen for close, clear
	 * state on hide) is the same for both modes.
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
		// Close any other submenu that's already open in this menu before
		// opening a new one — only one peer submenu visible at a time.
		if (this._activeSubmenu && this._activeSubmenu !== submenu) {
			(this._activeSubmenu as HTMLElement).hidePopover?.();
		}

		submenu._parentMenu = this;
		submenu._parentItem = item;

		// Register this submenu in the root's open-chain so `_collapseChain()`
		// can tear the whole stack down without relying on parent links being
		// intact at collapse time. Captured here, while links are fresh.
		const chainRoot = this._rootMenu;
		submenu._chainRoot = chainRoot;
		if (!chainRoot._openChain.includes(submenu)) chainRoot._openChain.push(submenu);

		if (this._drillInMode) {
			// Drill-in: anchor to the root's anchor so all submenus open at the
			// same screen position — visually stacks. Inherit root placement
			// for consistent direction. Back button rendered in template.
			const root = this._rootMenu;
			submenu.anchorElement = root._getAnchorEl();
			submenu.placement = root.placement;
		} else {
			// Cascade: anchor to the parent item, open beside it.
			submenu.anchorElement = item;
			submenu.placement = 'right-start';
		}

		this._activeSubmenu = submenu;
		this._activeSubmenuOpener = item;
		item._submenuOpen = true;
		// Clear [highlighted] on the opener — the "logically current" item is
		// now in the submenu, not on the opener. The opener still shows visibly
		// active via .menu__item[aria-expanded="true"] (lighter neutral); CSS
		// :hover upgrades it to accent if the cursor returns to it.
		item.removeAttribute('highlighted');

		// Listen once for the submenu's close so we can clear state, ARIA and
		// any leftover safe-triangle plumbing from the cascade open path.
		const wasDrillIn = this._drillInMode;
		// Shared teardown — runs from `toggle→closed` in the normal flow, and
		// invoked directly from a select-chain-close walk for hidden ancestors
		// whose toggle event will never fire (they were already closed when
		// the deeper level took over the screen). `skipReshow` lets the chain
		// walk suppress the parent-restore step so the whole stack collapses.
		const cleanup = (skipReshow: boolean) => {
			submenu.removeEventListener('toggle', onToggle);
			if (this._activeSubmenu === submenu) {
				this._activeSubmenu = null;
				this._activeSubmenuOpener = null;
				this._activeSubmenuCleanup = null;
			}
			submenu._parentMenu = null;
			submenu._parentItem = null;
			// Deregister from the root's open-chain registry.
			const ci = chainRoot._openChain.indexOf(submenu);
			if (ci !== -1) chainRoot._openChain.splice(ci, 1);
			submenu._collapseSelf = null;
			submenu._chainRoot = null;
			item._submenuOpen = false;
			// Drill-in: restore the submenu to its original DOM position and
			// re-show the parent so the user returns to the previous view.
			// Captured at open-time so a viewport flip during navigation
			// doesn't leave the chain in an inconsistent state.
			if (wasDrillIn) {
				if (drillInOriginalParent && drillInOriginalParent.isConnected) {
					drillInOriginalParent.insertBefore(submenu, drillInNextSibling);
				} else {
					// Original parent was removed from the DOM while the
					// submenu was reparented to <body> (SPA navigation,
					// story teardown, etc.). There's nowhere to restore it
					// to — drop the orphaned node instead of leaking a
					// detached-but-connected element in <body> forever.
					submenu.remove();
				}
				if (!skipReshow && this.isConnected && !(this as HTMLElement).matches(':popover-open')) {
					(this as HTMLElement).showPopover?.();
				}
				// One level back (back button / ArrowLeft / Esc) — announce the
				// destination view on the now-visible parent. `skipReshow` is a
				// collapse-the-whole-chain teardown (select / outside-tap /
				// resize): that's a dismiss, not a back-nav, so it stays silent.
				if (!skipReshow && this.isConnected) {
					const dest = this._parentItem?.text;
					this._announce(
						dest
							? this._t('components.menu.submenu-back-action', { title: dest })
							: this._t('components.menu.back-action'),
					);
				}
			}
			// Drop any safe-triangle "in transit" highlight on the opener —
			// without this, an opener whose submenu was closed via stall-
			// dismissal or programmatic hidePopover keeps the bold accent
			// even though the close should also drop the visual signal.
			// Skip when the item is currently focused — keyboard close
			// (ArrowLeft) sync-focuses the opener before this async toggle
			// fires, and that focus already set [highlighted] via the
			// menu-item-focused chain; stripping it here would leave the
			// opener visibly unhighlighted despite being focused.
			if (!item.hasAttribute('data-focused')) {
				item.removeAttribute('highlighted');
			}
			this._stopSafeTriangle();
			// Counterpart to `submenu-open` — consumers tracking submenu state
			// via declarative event listeners (rather than reaching into our
			// internals) get a clean close signal here.
			this.dispatchEvent(new CustomEvent('submenu-close', {
				detail: { submenu, item },
				bubbles: true,
				composed: false,
			}));
		};
		const onToggle = (e: Event) => {
			const tg = e as ToggleEvent;
			if (tg.newState !== 'closed') return;
			// Submenu is hiding to make room for a deeper drill — leave the
			// chain state alone, keep the listener around for the eventual
			// real close.
			if (submenu._drillInHidingForDeeper) {
				submenu._drillInHidingForDeeper = false;
				return;
			}
			// A real toggle-close = one level back: tear down and re-show
			// the parent. Collapsing the whole chain doesn't come through
			// here — `_collapseChain()` drives `_collapseSelf` directly.
			cleanup(false);
		};
		submenu.addEventListener('toggle', onToggle);
		this._activeSubmenuCleanup = cleanup;
		// Force-teardown used by `_collapseChain()`: detach the toggle
		// listener (so this hide doesn't also run the back-nav onToggle),
		// hide, then run the shared cleanup with no parent re-show.
		submenu._collapseSelf = () => {
			submenu.removeEventListener('toggle', onToggle);
			(submenu as HTMLElement).hidePopover?.();
			cleanup(true);
		};

		// Drill-in: re-parent the submenu to <body> before show so it isn't
		// a popover-stack descendant of the parent — that lets us close the
		// parent without cascading the submenu closed. Original placement is
		// restored when the submenu closes.
		let drillInOriginalParent: HTMLElement | null = null;
		let drillInNextSibling: Node | null = null;
		if (wasDrillIn) {
			drillInOriginalParent = submenu.parentElement;
			drillInNextSibling = submenu.nextSibling;
			document.body.appendChild(submenu);
		}

		(submenu as HTMLElement).showPopover?.();

		if (wasDrillIn) {
			// View just swapped to the submenu — announce the level we
			// entered (the opener's label is this view's title, same string
			// the back button shows). Fires on the now-visible submenu.
			submenu._announce(
				submenu._t('components.menu.submenu-title', { title: item.text }),
			);
			// Signal to our own parent's onToggle (if any) that this hide is
			// "intentional, making room for a deeper drill" — skip the normal
			// close cleanup that would re-parent us back and re-open them.
			this._drillInHidingForDeeper = true;
			(this as HTMLElement).hidePopover?.();
		}

		// Start the safe-triangle tracker for cascade-mode submenus only.
		// Drill-in mode replaces the parent view, so there's no "moving toward"
		// path between two visible menus to protect.
		if (!wasDrillIn) {
			// Wait one frame so the submenu's getBoundingClientRect reflects its
			// final position (computePosition runs in the toggle handler).
			requestAnimationFrame(() => {
				if (this._activeSubmenu === submenu) {
					this._startSafeTriangle(submenu);
				}
			});
		}
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

	// — Touch-scroll press-flash suppression ————————————————————————————————
	//
	// On touch, pressing an item sets :active and the synthetic sticky
	// :hover lands on it, so `.menu__item:active:hover` flashes. If the
	// gesture becomes an internal scroll (cramped menu), :active lingers
	// until the browser recognizes the pan and the highlight stays for
	// the whole scroll. We detect a scroll from the touch delta and set
	// `scroll-active` on the host; the styles neutralise the press flash
	// while it's set. A pure tap never moves past the threshold, so its
	// brief press feedback is preserved.

	private static readonly _TOUCH_SCROLL_THRESHOLD_PX = 8;
	private _touchStartX = 0;
	private _touchStartY = 0;

	/** @internal */
	_handleMenuTouchStart = (event: TouchEvent): void => {
		const t = event.touches[0];
		if (!t) return;
		this._touchStartX = t.clientX;
		this._touchStartY = t.clientY;
		this.removeAttribute('scroll-active');
	};

	/** @internal */
	_handleMenuTouchMove = (event: TouchEvent): void => {
		if (this.hasAttribute('scroll-active')) return;
		const t = event.touches[0];
		if (!t) return;
		const dx = t.clientX - this._touchStartX;
		const dy = t.clientY - this._touchStartY;
		if (Math.hypot(dx, dy) > NLDDMenu._TOUCH_SCROLL_THRESHOLD_PX) {
			this.setAttribute('scroll-active', '');
		}
	};

	/** @internal */
	_handleMenuTouchEnd = (): void => {
		this.removeAttribute('scroll-active');
	};

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
	 * Driven by the root's `_openChain` registry and each submenu's
	 * `_collapseSelf`, so it never depends on `_activeSubmenu` /
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
		for (let i = chain.length - 1; i >= 0; i--) chain[i]._collapseSelf?.();
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
	private _dragStartItem: NLDDMenuItem | null = null;

	/**
	 * Native HTML `<select>` lets you press on one option, drag to another,
	 * and release to pick the one under the pointer. Standard click events
	 * don't fire across different elements, so we replicate it manually:
	 * remember the pointerdown'd item, listen for the matching pointerup,
	 * and if the release lands on a different non-disabled item, fire its
	 * `select` directly. The original button's click handler still owns the
	 * single-click no-drag path.
	 */
	private _handleItemPointerdown = (event: PointerEvent): void => {
		if (event.button !== 0) return;
		const item = (event.target as Element | null)?.closest('nldd-menu-item') as NLDDMenuItem | null;
		if (!item || item.disabled) return;
		this._dragStartItem = item;
		document.addEventListener('pointerup', this._handleDragRelease, { capture: true, once: true });
	};

	private _handleDragRelease = (event: PointerEvent): void => {
		const startItem = this._dragStartItem;
		this._dragStartItem = null;
		if (!startItem) return;
		// If the menu closed between pointerdown and pointerup (light-dismiss,
		// keyboard shortcut), bail — elementFromPoint could otherwise resolve
		// to an item in a different, newly-opened menu and fire its select.
		if (!this._isOpen) return;
		const releaseItem = this._menuItemFromPoint(event.clientX, event.clientY);
		if (!releaseItem || releaseItem === startItem || releaseItem.disabled) return;
		// Different item — fire its select. Browser won't dispatch click here
		// because pointerdown and pointerup landed on different targets, so
		// there's no double-fire to suppress.
		releaseItem._handleClick();
	};

	/**
	 * Resolves the menu-item under the pointer, piercing shadow boundaries.
	 * `document.elementFromPoint` stops at the outermost shadow host, so a menu
	 * nested inside another component's shadow DOM (e.g. nldd-split-button)
	 * resolves the release target to that host and never finds the item — which
	 * silently disables press-drag-release there. Descending the shadow roots
	 * restores it and is a no-op for light-DOM menus.
	 */
	private _menuItemFromPoint(x: number, y: number): NLDDMenuItem | null {
		let root: Document | ShadowRoot = document;
		// Depth guard: a backstop against pathologically deep shadow nesting;
		// real menus are at most a few roots deep.
		const MAX_PIERCE_DEPTH = 20;
		for (let depth = 0; depth < MAX_PIERCE_DEPTH; depth++) {
			const el: Element | null = root.elementFromPoint(x, y);
			if (!el) return null;
			const item = el.closest('nldd-menu-item') as NLDDMenuItem | null;
			if (item) return item;
			if (!el.shadowRoot) return null;
			root = el.shadowRoot;
		}
		return null;
	}

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
			this._outsideTapStartX = event.clientX;
			this._outsideTapStartY = event.clientY;
			this._teardownOutsideTap();
			this._outsideTapTracking = true;
			document.addEventListener('pointermove', this._outsideTapMove, true);
			document.addEventListener('pointerup', this._outsideTapEnd, true);
			document.addEventListener('pointercancel', this._outsideTapCancel, true);
			return;
		}
		(this._chainRoot ?? this)._collapsedByPointerGesture = true;
		this._collapseChain();
	};

	private _outsideTapStartX = 0;
	private _outsideTapStartY = 0;
	private _outsideTapTracking = false;

	private _outsideTapMove = (e: PointerEvent): void => {
		const dx = e.clientX - this._outsideTapStartX;
		const dy = e.clientY - this._outsideTapStartY;
		if (Math.hypot(dx, dy) > NLDDMenu._TOUCH_SCROLL_THRESHOLD_PX) {
			// Became a scroll — leave the chain open.
			this._teardownOutsideTap();
		}
	};

	private _outsideTapEnd = (): void => {
		const wasTap = this._outsideTapTracking;
		this._teardownOutsideTap();
		if (wasTap) {
			(this._chainRoot ?? this)._collapsedByPointerGesture = true;
			this._collapseChain();
		}
	};

	private _outsideTapCancel = (): void => {
		this._teardownOutsideTap();
	};

	private _teardownOutsideTap(): void {
		this._outsideTapTracking = false;
		document.removeEventListener('pointermove', this._outsideTapMove, true);
		document.removeEventListener('pointerup', this._outsideTapEnd, true);
		document.removeEventListener('pointercancel', this._outsideTapCancel, true);
	}

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
		this.addEventListener('mouseenter', this._handleMenuItemMouseenter, true);
		this.addEventListener('mouseleave', this._handleMouseleave);
		this.addEventListener('menu-item-focused', this._handleMenuItemFocused);
		this.addEventListener('submenu-open', this._handleSubmenuOpen);
		this.addEventListener('select', this._collapseChain);
		this.addEventListener('pointerdown', this._handleItemPointerdown);
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
		this.removeEventListener('mouseenter', this._handleMenuItemMouseenter, true);
		this.removeEventListener('mouseleave', this._handleMouseleave);
		this.removeEventListener('menu-item-focused', this._handleMenuItemFocused);
		this.removeEventListener('submenu-open', this._handleSubmenuOpen);
		this.removeEventListener('select', this._collapseChain);
		this.removeEventListener('pointerdown', this._handleItemPointerdown);
		document.removeEventListener('click', this._handleDocumentClick);
		document.removeEventListener('pointerup', this._handleDragRelease, true);
		// Defensive: the pointerdown + resize listeners are added on open
		// and removed on close, but if the menu is torn down mid-open we'd
		// otherwise leak the global listeners.
		document.removeEventListener('pointerdown', this._handleDocumentPointerdown, true);
		this._teardownOutsideTap();
		window.removeEventListener('resize', this._handleWindowResize);
		this._cancelHoverOpen();
		this._stopSafeTriangle();
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
	 */
	public filter(query: string): void {
		const allItems = Array.from(this.querySelectorAll('nldd-menu-item')) as NLDDMenuItem[];
		allItems.forEach(item => {
			const matches = !query || this.filterFn(query, item);
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

		const viewportMargin = this._cssPx('--_viewport-margin');

		// Cascade-mode submenus: shift up by the menu's own padding so the
		// first submenu item lines up vertically with the parent opener item.
		// Without this, the submenu's top edge aligns with the opener and the
		// inner padding pushes the first item down, leaving a visible step.
		const submenuPadding = (this._isSubmenu && !this._drillInMode)
			? this._cssPx('--_padding')
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
				offset({ mainAxis: 0, alignmentAxis: -submenuPadding }),
				...(drillIn ? [] : [flip({ padding: viewportMargin })]),
				shift({ padding: viewportMargin }),
				size({
					padding: viewportMargin,
					apply: ({ availableHeight }: { availableHeight: number }) => {
						this.style.setProperty('--_max-height', `${availableHeight}px`);
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
				if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
					this._handleTypeahead(event, items, index);
				}
			}
		}
	};

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
	 */
	public _claimItems = (): void => {
		Array.from(this.querySelectorAll('nldd-menu-item')).forEach(item => {
			(item as NLDDMenuItem).menuVariant = this.variant;
		});
	};

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
			this._cleanupAutoUpdate?.();
			this._cleanupAutoUpdate = null;
			window.removeEventListener('resize', this._handleWindowResize);
			document.removeEventListener('pointerdown', this._handleDocumentPointerdown, true);
			this._teardownOutsideTap();
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
