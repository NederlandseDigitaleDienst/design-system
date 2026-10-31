import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { menuItemStyles } from './menu.styles.js';
import { menuItemTemplate, type MenuVariant } from './menu.template.js';
import type { QueryMarkMode } from '../../../utilities/render-marked.js';
import type { NLDDMenu } from './menu.js';
import { setState } from '../../../utilities/element-state.js';

/** Makes `host` a list item while its menu is a navigation menu, and takes
 *  that back when it is not. A `listitem` the consumer set by hand on an item
 *  goes too when the variant changes back; nothing else uses that role here. */
export function syncListItemRole(host: HTMLElement, variant: MenuVariant | null): void {
	if (variant === 'navigation') host.setAttribute('role', 'listitem');
	else if (host.getAttribute('role') === 'listitem') host.removeAttribute('role');
}

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
 * @attr {string} type - Item type: 'button' | 'checkbox' | 'radio'. Default: 'button'. One checkbox or radio item gives every item in its menu the check-mark column, so the text of the whole menu starts at one line, as in a native menu. Submenus decide for themselves.
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
	menuVariant: MenuVariant | null = null;

	/** Whether this item keeps the check-mark column free without being
	 *  checkable, because another item in its menu is. Set by that nldd-menu.
	 *  Not part of the public API. */
	@state()
	checkColumn = false;

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

	override updated(changedProperties: Map<string, unknown>): void {
		// In a navigation menu the item is a list item, and the link inside it
		// is just a link.
		if (changedProperties.has('menuVariant')) syncListItemRole(this, this.menuVariant);
		// An item that becomes checkable, or stops being so, changes whether its
		// menu reserves the check-mark column, also while the menu is open.
		if (changedProperties.has('type') && changedProperties.get('type') !== undefined && this.menuVariant) {
			(this.closest('nldd-menu') as NLDDMenu | null)?._claimItems();
		}
	}

	override firstUpdated(): void {
		// Submenu attachment is one-shot in v1 — a nldd-menu added after this
		// point would silently miss aria-controls, the chevron indicator, the
		// hover-open lifecycle, and the close-state sync. Watch for late
		// additions so consumers don't chase the symptom.
		this._submenuMutationObserver = new MutationObserver(() => {
			const current = this.querySelector(':scope > nldd-menu');
			setState(this, 'late-submenu', current !== null && current !== this._cachedSubmenuEl);
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
