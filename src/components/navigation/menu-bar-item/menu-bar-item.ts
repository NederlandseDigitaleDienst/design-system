/**
 * Menu Bar Item Component (Lit + TypeScript)
 *
 * Interactive building block for use in a menu bar. Renders as an <a> (with
 * href) or a <button> (without href). Supports an icon, text, a disclosure
 * indicator, and an expandable popover through a slotted `<nldd-menu>` (or
 * another popover element).
 *
 * @element nldd-menu-bar-item
 * @attr {string} text - Text of the item
 * @attr {boolean} current - Mark as the active or current item
 * @attr {string} current-type - aria-current value when current is true ('page', 'step', 'location', 'true'). Default: 'page'
 * @attr {string} href - Optional link URL. Without href it renders as a button.
 * @attr {string} icon - Optional icon name (nldd-icon)
 * @attr {boolean} expandable - Show the disclosure icon and open the slotted `<nldd-menu>` on click
 * @attr {boolean} icon-only - Hide the text visually (always). The text then shows as a tooltip on hover and focus.
 * @attr {'icon'|'text'} content-priority - Decides what stays visible in compact mode: 'icon' hides the text, 'text' hides the icon. A bar is compact on a narrow screen and also at 200% zoom on a desktop, so with 'icon' the text is gone there too and shows as a tooltip instead.
 * @attr {boolean} compact - Activates content-priority behavior (set by the parent nldd-menu-bar)
 * @attr {boolean} disabled - Turn interaction off
 * @attr {string} accessible-label - Override aria-label
 * @attr {string} haspopup - aria-haspopup value (e.g. "menu", "dialog")
 * @attr {boolean} open - Whether the linked popover or menu is open
 * @attr {boolean} expanded - Whether the matching popover is open; sets aria-expanded on the button when expandable or haspopup is set. Tracked automatically for a slotted `<nldd-menu>`.
 *
 * @fires select - On a click on a non-expandable button item (bubbles, composed)
 *
 * @slot icon - Takes the place of the icon: an `nldd-avatar` for the person who is signed in, for instance. It gets the size of an icon, and follows `content-priority` and `icon-only` as the icon does. Wins over `icon`.
 * @slot - Content of the expandable popover. Wrap items in an `<nldd-menu>` so
 *   this component does not have to duplicate the menu API (variant,
 *   accessible-label, translations, filterFn and so on). Event listeners on
 *   items work directly, because nothing is cloned anymore.
 */

import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { menuBarItemStyles } from './menu-bar-item.styles.js';
import { template } from './menu-bar-item.template.js';
import '../../content/icon/icon.js';
import '../../actions/menu/menu.js';

/**
 * Minimal typed interface for nldd-menu.
 * Double-cast (as unknown as) is required because querySelector returns Element,
 * and this custom element class is not registered in HTMLElementTagNameMap
 * for this component's compilation unit.
 */
interface PopoverMenu extends HTMLElement {
	anchorElement: Element | null;
	showPopover(): void;
	hidePopover(): void;
}

@customElement('nldd-menu-bar-item')
export class NLDDMenuBarItem extends LitElement {
	static override styles = menuBarItemStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: Boolean, reflect: true })
	current = false;

	@property({ reflect: true, attribute: 'current-type', converter: reflectNonDefault<'page' | 'step' | 'location' | 'date' | 'time' | 'true'>('page') })
	currentType: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' = 'page';

	@property({ type: String })
	href = '';

	@property({ type: String, reflect: true })
	icon = '';

	@property({ type: Boolean, reflect: true })
	expandable = false;

	@property({ type: Boolean, attribute: 'icon-only', reflect: true })
	iconOnly = false;

	@property({ reflect: true, attribute: 'content-priority', converter: reflectNonDefault<string>('') })
	contentPriority = '';

	@property({ type: Boolean, reflect: true })
	compact = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: String })
	haspopup = '';

	@property({ type: Boolean, reflect: true })
	expanded = false;

	/**
	 * Direct element reference to the popover this item invokes — IDL-only
	 * counterpart to `popovertarget` that works across shadow boundaries.
	 * Set by `nldd-menu` when this item is wired up as the menu's anchor
	 * so the browser recognizes the inner button as the menu's invoker
	 * and excludes the click from popover light-dismiss.
	 */
	@property({ attribute: false })
	popoverTargetElement: Element | null = null;

	/**
	 * Action the browser performs when the inner button is clicked,
	 * mirroring the standard `popovertargetaction` attribute. The menu
	 * keeps this in sync with its open state — `'hide'` while open,
	 * `'show'` while closed — so the browser's native invoker action
	 * always matches the intent of the click without racing.
	 */
	@property({ attribute: false })
	popoverTargetAction: 'toggle' | 'show' | 'hide' = 'toggle';

	// ## Menu popover state

	private _menu: PopoverMenu | null = null;
	private _menuOpen = false;
	private _pointerdownWhileMenuOpen = false;
	private _menuToggleHandler: ((event: Event) => void) | null = null;

	// ## Lifecycle

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('pointerdown', this._handlePointerdown);
		this.addEventListener('click', this._handleClick);
		// Pre-render snapshot — if children are already in light DOM by the
		// time we connect, wire them now. (querySelector returns the DOM
		// node even before the custom element has upgraded; the toggle
		// listener attaches to the stable DOM node and survives upgrade.)
		this._wireMenu();
	}

	override firstUpdated(): void {
		// Once the shadow is rendered the slot's slotchange has fired and we
		// have a definitive view of the projected content; re-wire as a
		// safety net for any consumer who slotted the menu after
		// connectedCallback but before the first render.
		this._wireMenu();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('pointerdown', this._handlePointerdown);
		this.removeEventListener('click', this._handleClick);
		this._unwireMenu();
	}

	/** @internal Whether the icon slot is filled, so the icon area and the icon-only rules follow it. */
	@state()
	_hasSlottedIcon = false;

	/** @internal */
	_onIconSlotChange = (e: Event): void => {
		this._hasSlottedIcon = (e.target as HTMLSlotElement).assignedElements().length > 0;
		// A derived state for the host's own CSS, never written back into `icon`.
		this.toggleAttribute('data-has-icon', this._hasSlottedIcon);
	};

	_onSlotChange = (): void => {
		// Re-wire when a consumer swaps the slotted <nldd-menu> at runtime.
		this._wireMenu();
	};

	override focus(options?: FocusOptions): void {
		const focusable = this.shadowRoot?.querySelector<HTMLElement>('button, a');
		focusable?.focus(options);
	}

	// ## Helpers

	private _findMenu(): PopoverMenu | null {
		return this.querySelector('nldd-menu') as unknown as PopoverMenu | null;
	}

	private _wireMenu(): void {
		const menu = this._findMenu();
		if (menu === this._menu) return;
		this._unwireMenu();
		if (!menu) return;
		this._menu = menu;
		this._menuToggleHandler = (event: Event) => {
			const isOpen = (event as ToggleEvent).newState === 'open';
			this._menuOpen = isOpen;
			this.expanded = isOpen;
		};
		menu.addEventListener('toggle', this._menuToggleHandler);
	}

	private _unwireMenu(): void {
		if (this._menu && this._menuToggleHandler) {
			this._menu.removeEventListener('toggle', this._menuToggleHandler);
		}
		this._menu = null;
		this._menuToggleHandler = null;
		this._menuOpen = false;
	}

	// ## Event handlers

	private _handlePointerdown = (): void => {
		if (this._menuOpen) {
			this._pointerdownWhileMenuOpen = true;
		}
	};

	private _handleClick = (event: Event): void => {
		if (this.disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		if (this.expandable && this._findMenu()) {
			event.preventDefault();
			this._toggleMenu();
			return;
		}

		if (!this.href) {
			event.preventDefault();
			this.dispatchEvent(new CustomEvent('select', {
				bubbles: true,
				composed: true,
				detail: { item: this },
			}));
		}
	};

	// ## Menu popover

	private _toggleMenu(): void {
		if (this._pointerdownWhileMenuOpen) {
			this._pointerdownWhileMenuOpen = false;
			return;
		}
		// _wireMenu already ran in connectedCallback and re-runs on
		// slotchange — no need to call it here.
		if (!this._menu) return;
		this._menu.anchorElement = this;
		if (this._menuOpen) {
			this._menu.hidePopover();
		} else {
			this._menu.showPopover();
		}
	}

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-menu-bar-item': NLDDMenuBarItem;
	}
}
