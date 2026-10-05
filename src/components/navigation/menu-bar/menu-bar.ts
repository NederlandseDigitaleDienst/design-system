/**
 * Menu Bar Component (Lit + TypeScript)
 *
 * Horizontal row of nldd-menu-bar-item elements with automatic overflow
 * detection. Items that do not fit are hidden behind an overflow button with a
 * popover menu.
 *
 * @element nldd-menu-bar
 * @attr {string} overflow-text - Text for the overflow button (default through i18n)
 * @attr {string} accessible-label - aria-label for the nav landmark
 * @attr {boolean} compact - Propagates the compact attribute to slotted items (activates content priority)
 *
 * @slot - nldd-menu-bar-item elements
 */

import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { menuBarStyles } from './menu-bar.styles.js';
import { template } from './menu-bar.template.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddMenuBarTranslations } from './menu-bar.i18n.js';
import '../menu-bar-item/menu-bar-item.js';
import type { NLDDMenuBarItem } from '../menu-bar-item/menu-bar-item.js';
import '../../actions/menu/menu.js';

/**
 * Minimal typed interface for nldd-menu.
 */
interface PopoverMenu extends HTMLElement {
	anchorElement: Element | null;
	showPopover(): void;
	hidePopover(): void;
}

@customElement('nldd-menu-bar')
export class NLDDMenuBar extends withTranslations(LitElement, nlddMenuBarTranslations) {
	static override styles = menuBarStyles;

	@property({ reflect: true, attribute: 'overflow-text', converter: reflectNonDefault<string>('') })
	overflowText = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Boolean, reflect: true })
	compact = false;

	// ## Internal references

	@query('slot:not([name])')
	private _defaultSlot!: HTMLSlotElement;

	@query('.menu-bar__overflow-button')
	private _overflowButton!: HTMLElement;

	// ## Overflow state

	/** @internal Used by template — drives the overflow button's expanded state. */
	@state()
	_menuOpen = false;

	private _overflowMenu: PopoverMenu | null = null;
	private _overflowPointerdownWhileOpen = false;
	private _overflowUpdatePending = false;

	private _resizeObserver: ResizeObserver | null = null;
	private _overflowRAF: number | null = null;
	private _setupRAF: number | null = null;

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		if (changed.has('compact')) {
			this._syncCompactAttribute();
		}
	}

	// ## Computed properties

	/** @internal Used by template */
	get _overflowText(): string {
		return this.overflowText || this._t('components.menu-bar.overflow-action');
	}

	// ## Lifecycle

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._cleanupOverflowDetection();
		this._overflowMenu?.remove();
		this._overflowMenu = null;
	}

	override firstUpdated(): void {
		this._setupOverflowDetection();
		this._syncCompactAttribute();
		this._syncEmpty();
		if (import.meta.env?.DEV) {
			// Defer one task so wrappers (e.g. top-navigation-bar) that set a
			// default label via slotchange have a chance to run first.
			setTimeout(() => {
				if (this.isConnected && !this.accessibleLabel && !this.hasAttribute('empty')) {
					console.warn('<nldd-menu-bar>: no accessible-label set. A page with more than one nav landmark needs a unique label on each (WCAG 1.3.1).');
				}
			}, 0);
		}
	}

	/** Request a recalculation of overflow state. Call from parent when layout changes. */
	requestOverflowUpdate(): void {
		this._scheduleOverflowUpdate();
	}

	private _onSlotChange = (): void => {
		this._syncCompactAttribute();
		this._scheduleOverflowUpdate();
		this._syncEmpty();
	};

	/** Hide the component when no items are slotted to avoid empty nav landmarks. */
	private _syncEmpty(): void {
		const items = this._defaultSlot?.assignedElements({ flatten: true }) ?? [];
		const hasItems = items.some(el => el.tagName === 'NLDD-MENU-BAR-ITEM');
		this.toggleAttribute('empty', !hasItems);
	}

	/** Propagate compact attribute to slotted items. */
	private _syncCompactAttribute(): void {
		const items = this._defaultSlot?.assignedElements({ flatten: true }) ?? [];
		for (const item of items) {
			item.toggleAttribute('compact', this.compact);
		}
	}

	// ## Overflow detection

	private _setupOverflowDetection(): void {
		this._cleanupOverflowDetection();
		this._setupRAF = requestAnimationFrame(() => {
			this._setupRAF = null;
			if (!this.isConnected) return;
			this._resizeObserver = new ResizeObserver(() => {
				this._scheduleOverflowUpdate();
			});
			this._resizeObserver.observe(this);
			if (this._defaultSlot) {
				this._defaultSlot.addEventListener('slotchange', this._onSlotChange);
			}
			this._scheduleOverflowUpdate();
		});
	}

	private _cleanupOverflowDetection(): void {
		if (this._setupRAF) {
			cancelAnimationFrame(this._setupRAF);
			this._setupRAF = null;
		}
		if (this._overflowRAF) {
			cancelAnimationFrame(this._overflowRAF);
			this._overflowRAF = null;
		}
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			this._resizeObserver = null;
		}
		if (this._defaultSlot) {
			this._defaultSlot.removeEventListener('slotchange', this._onSlotChange);
		}
	}

	private _scheduleOverflowUpdate = (): void => {
		if (this._overflowRAF) cancelAnimationFrame(this._overflowRAF);
		this._overflowRAF = requestAnimationFrame(() => {
			this._overflowRAF = null;
			this._updateOverflow();
		});
	};

	/**
	 * Calculate which slotted items overflow and hide them behind an overflow button.
	 * Tested both ways in menu-bar.test.ts: with real layout for the whole path, and
	 * with mocked widths for the arithmetic. The space reserved for the button needs
	 * the mocks — the button is a shrinkable flex item, so the rendered layout
	 * absorbs whatever the arithmetic leaves over and always looks right.
	 */
	private _updateOverflow(): void {
		const overflowButton = this._overflowButton;
		if (!overflowButton) return;

		// While the overflow popover is open, do NOT relayout. Selecting an
		// item re-renders the slotted items, which fires our ResizeObserver
		// and would run this reflow (reset all items visible → measure →
		// re-hide). nldd-menu's floating-ui autoUpdate is anchored to the
		// overflow trigger inside .menu-bar__overflow-button and would
		// reposition the open menu against that mid-reflow / 0-rect anchor
		// → the menu jumps off-screen. Defer the recalc until the popover
		// closes (a genuine window resize closes nldd-menu itself first).
		if (this._menuOpen) {
			this._overflowUpdatePending = true;
			return;
		}

		const slottedElements = this._defaultSlot?.assignedElements({ flatten: true }) ?? [];
		const items = slottedElements.filter(el => el.tagName === 'NLDD-MENU-BAR-ITEM') as HTMLElement[];

		if (items.length === 0) {
			overflowButton.style.display = 'none';
			return;
		}

		// Reset all items to visible
		items.forEach(item => {
			item.style.display = '';
			item.removeAttribute('data-overflow');
		});

		overflowButton.style.display = 'inline-block';

		const containerWidth = this.clientWidth;
		const totalItemsWidth = items.reduce((sum, item) => sum + item.offsetWidth, 0);

		// All items fit on their own — no overflow button needed, no items hidden.
		if (totalItemsWidth <= containerWidth) {
			overflowButton.style.display = 'none';
			return;
		}

		// Items don't fit; reserve overflow-button space and find the cutoff.
		const overflowButtonWidth = overflowButton.offsetWidth;
		const availableWidth = containerWidth - overflowButtonWidth;
		let usedWidth = 0;
		let overflowStartIndex = -1;

		for (let i = 0; i < items.length; i++) {
			const itemWidth = items[i].offsetWidth;
			if (usedWidth + itemWidth > availableWidth) {
				overflowStartIndex = i;
				break;
			}
			usedWidth += itemWidth;
		}

		if (overflowStartIndex >= 0) {
			for (let i = overflowStartIndex; i < items.length; i++) {
				items[i].style.display = 'none';
				items[i].setAttribute('data-overflow', 'true');
			}
		} else {
			overflowButton.style.display = 'none';
		}
	}

	// ## Overflow popover menu

	private _createOverflowMenu(): void {
		if (this._overflowMenu) return;
		// SSR guard — document is unavailable in server-side rendering.
		if (typeof document === 'undefined') return;
		const menu = document.createElement('nldd-menu') as unknown as PopoverMenu;
		menu.setAttribute('placement', 'bottom-end');
		menu.addEventListener('toggle', (event: Event) => {
			const isOpen = (event as ToggleEvent).newState === 'open';
			this._menuOpen = isOpen;
			if (!isOpen) {
				// Flush any overflow recalc that was deferred while open.
				if (this._overflowUpdatePending) {
					this._overflowUpdatePending = false;
					this._scheduleOverflowUpdate();
				}
			}
		});
		document.body.appendChild(menu);
		this._overflowMenu = menu;
	}

	/**
	 * @internal Used by template.
	 *
	 * Opens/closes the overflow popover explicitly. Anchored to the
	 * always-visible trigger so floating-ui never collapses to 0,0.
	 * The native popover-invoker path was unusable here (anchor inside a
	 * display-toggled wrapper). Reopen-after-light-dismiss on touch is
	 * prevented deterministically via the pointerdown flag below.
	 */
	_toggleOverflowMenu = (): void => {
		if (this._overflowPointerdownWhileOpen) {
			this._overflowPointerdownWhileOpen = false;
			return;
		}
		this._createOverflowMenu();
		if (!this._overflowMenu) return;
		const trigger = this._overflowButton?.querySelector('nldd-menu-bar-item');
		this._overflowMenu.anchorElement = trigger ?? this._overflowButton;
		if (this._menuOpen) {
			this._overflowMenu.hidePopover();
		} else {
			this._populateOverflowMenu();
			this._overflowMenu.showPopover();
		}
	};

	/** @internal Used by template — captures touch-tap-to-close so the trailing click doesn't reopen. */
	_handleOverflowButtonPointerdown = (): void => {
		if (this._menuOpen) {
			this._overflowPointerdownWhileOpen = true;
		}
	};

	private _populateOverflowMenu(): void {
		if (!this._overflowMenu) return;
		this._overflowMenu.replaceChildren();

		const slottedElements = this._defaultSlot?.assignedElements({ flatten: true }) ?? [];
		const overflowItems = slottedElements.filter(
			el => el.tagName === 'NLDD-MENU-BAR-ITEM' && el.hasAttribute('data-overflow')
		) as NLDDMenuBarItem[];

		for (const item of overflowItems) {
			const menuItem = document.createElement('nldd-menu-item');
			menuItem.setAttribute('text', item.text);
			if (item.icon) menuItem.setAttribute('icon', item.icon);
			if (item.current) menuItem.setAttribute('selected', '');
			if (item.disabled) menuItem.setAttribute('disabled', '');

			if (item.expandable) {
				// Expandable items become a real nested submenu: the parent
				// menuItem gets a child nldd-menu, so nldd-menu's own
				// submenu/drill-in machinery renders it (no dead flat label).
				const children = item.querySelectorAll('nldd-menu-item, nldd-menu-divider');
				if (children.length > 0) {
					const submenu = document.createElement('nldd-menu');
					children.forEach(child => {
						const clone = child.cloneNode(true) as HTMLElement;
						// Delegate via the original's select(), NOT click(): a
						// real DOM click bubbles to the original — overflowed,
						// display:none — expandable nldd-menu-bar-item and its
						// _handleClick reopens that item's own submenu anchored
						// to a zero-rect element, throwing it off-screen.
						// select() fires the `select` event from the original
						// (so it still bubbles to the consumer) without any
						// bubbling DOM click. Dividers aren't interactive.
						const original = child as HTMLElement & { select?: () => void };
						if (typeof original.select === 'function') {
							clone.addEventListener('click', () => original.select!());
						}
						submenu.appendChild(clone);
					});
					// Assemble fully BEFORE attaching: nldd-menu-item resolves
					// its submenu once at firstUpdated (`:scope > nldd-menu`);
					// a nldd-menu added after it connects is ignored.
					menuItem.appendChild(submenu);
					this._overflowMenu!.appendChild(menuItem);
					continue;
				}
			}

			menuItem.addEventListener('click', () => {
				item.click();
			});
			this._overflowMenu!.appendChild(menuItem);
		}
	}

	// ## Render

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-menu-bar': NLDDMenuBar;
	}
}
