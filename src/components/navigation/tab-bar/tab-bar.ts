/**
 * Nederlandse Digitale Dienst Tab Bar Component (Lit + TypeScript)
 *
 * A horizontal navigation bar with mutually exclusive tabs.
 * Exports both NLDDTabBar and NLDDTabBarItem.
 *
 * When the tabs do not fit, the ones that do not fit go behind a "Meer tabs"
 * button at the end, in a menu. The current tab always stays in the bar: if it
 * would fall in the part that does not fit, another tab goes to the menu in its
 * place. While tabs are in the menu, the bar fills its container and the tabs in
 * it share the width in proportion to their own. Choosing a tab in the bar
 * changes nothing about what is shown; choosing one from the menu swaps it with
 * the last tab in the bar, so the bar does not jump. `centered` has no effect
 * then. In an nldd-toolbar the other items go to the toolbar's menu first, by
 * their priority; when it is the bar's turn, it narrows down to the current tab
 * beside its button, and only then moves into the toolbar's menu as a whole.
 * Tabs are hidden, never moved, so a framework that renders them finds
 * them where it put them. Only a tab that does not fit on its own is cut off.
 *
 * @element nldd-tab-bar
 * @attr {string} variant - Visual mode: 'icon-and-text' | 'text' | 'icon'. When unset, the variant is inferred from each item's content. Drives the layout at every size.
 * @attr {string} size - Size: 'md' | 'lg' (default: 'md'). 'lg' enlarges the touch target; the per-variant layout is preserved (icon-and-text stacks the icon over the text, text renders large text, icon renders a larger icon-only control).
 * @attr {boolean} navigation - Renders a nav landmark instead of tablist; use for href-based items that navigate between routes
 * @attr {boolean} disabled - Disables the whole bar: dims it, blocks pointer interaction, and takes the tabs out of the tab order. Avoid it where you can; the design guidelines say why.
 * @attr {boolean} centered - Centers the tabs in the container (host fills the row, tabs group in the middle)
 * @attr {string} accessible-label - Accessible name for the navigation region; defaults to 'Tabs'
 * @attr {object} translations - Override translation keys (e.g. the overflow button label); unset keys fall back to Dutch.
 *
 * @slot - nldd-tab-bar-item elements
 *
 * @fires tabchange - When a tab is selected; detail: { item: NLDDTabBarItem }
 *
 * ---
 *
 * @element nldd-tab-bar-item
 * @attr {boolean} current - The item you are on. A tab bar switching content manages it itself and renders it as `aria-selected`; a `navigation` bar leaves it to the consumer, since it follows the route, and renders it as `aria-current="page"`. Unlike a list row, which separates `current` from `selected` because it can be both at once, a tab bar has exactly one active item.
 * @attr {string} text - Tab text; also used as accessible name for icon-only items
 * @attr {string} href - Optional link URL; renders an anchor instead of a button
 * @attr {string} icon - Icon name for nldd-icon; an alternative to the icon slot. The icon and icon-and-text variants fall back to a placeholder icon when neither is provided.
 * @attr {'md'|'lg'} size - Size: 'md' (default) | 'lg'. Set by nldd-tab-bar from its own size; 'lg' enlarges the touch target while keeping the variant layout.
 *
 * @slot icon - Icon content
 *
 * @fires select - When the item is activated; detail: { item: NLDDTabBarItem }
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { tabBarStyles, tabBarItemStyles } from './tab-bar.styles.js';
import { tabBarTemplate, tabBarItemTemplate } from './tab-bar.template.js';
import { sanitizeUrl } from '../../../utilities/sanitize-url.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddTabBarTranslations } from './tab-bar.i18n.js';
import '../../actions/icon-button/icon-button.js';
import '../../actions/menu/menu.js';
import { reflectWhenSet } from '../../../utilities/reflect-when-set.js';
import '../../../utilities/dev-checks-trigger.js';


// # nldd-tab-bar-item

@customElement('nldd-tab-bar-item')
export class NLDDTabBarItem extends LitElement {
	static override styles = tabBarItemStyles;

	/** The item you are on. `aria-selected` in a tab bar that switches content,
	 *  `aria-current="page"` in a `navigation` bar. */
	@property({ type: Boolean, reflect: true })
	current = false;

	@property({ type: String, reflect: true, converter: reflectWhenSet })
	href = '';

	/** Set by nldd-tab-bar. Not part of the public API. */
	@property({ type: String })
	_groupVariant: 'icon-and-text' | 'text' | 'icon' | '' = '';

	// Author-set variant captured once in connectedCallback.
	// Not a Lit property to avoid a feedback loop with the setAttribute
	// call in updated() which writes the resolved value to the same attribute.
	private _authorVariant: 'icon-and-text' | 'text' | 'icon' | '' = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	/** Icon name for nldd-icon. The icon and icon-and-text variants show a
	 *  placeholder icon when no icon (attribute or slot) is provided. */
	@property({ type: String, reflect: true })
	icon = '';

	/** Set by nldd-tab-bar. Sizes the variant-driven layout: 'md' (default) or 'lg' (larger touch target). */
	@property({ reflect: true, converter: reflectNonDefault<'md' | 'lg'>('md') })
	size: 'md' | 'lg' = 'md';

	get _effectiveVariant(): 'icon-and-text' | 'text' | 'icon' {
		if (this._authorVariant) return this._authorVariant;
		if (this._groupVariant) return this._groupVariant;
		const hasIcon = Boolean(this.icon) || this._hasIconSlot;
		if (this.text && hasIcon) return 'icon-and-text';
		if (this.text) return 'text';
		return 'icon';
	}

	@state()
	_hasIconSlot = false;

	/** Set by nldd-tab-bar. Not part of the public API. */
	@state()
	_navigation = false;

	/** Set by nldd-tab-bar. Marks this item as the keyboard entry point when no tab is current. */
	@state()
	_isFallbackFocusable = false;

	/** Set by nldd-tab-bar. True when the whole bar is disabled; drops the tab out
	 *  of the tab order and blocks activation. */
	@state()
	_groupDisabled = false;

	override connectedCallback(): void {
		super.connectedCallback();
		this.setAttribute('role', 'none');
		// Capture author intent before updated() overwrites the attribute with the resolved value
		const attr = this.getAttribute('variant');
		if (attr === 'text' || attr === 'icon' || attr === 'icon-and-text') {
			this._authorVariant = attr;
		}
		if (import.meta.env?.DEV && this.hasAttribute('selected')) {
			console.warn('nldd-tab-bar-item: `selected` is now `current` and the old attribute does nothing; rename it.');
		}
	}

	override updated(): void {
		this.setAttribute('variant', this._effectiveVariant);
	}

	override focus(options?: FocusOptions): void {
		this.shadowRoot?.querySelector<HTMLElement>('.tab-bar__item')?.focus(options);
	}

	_onIconSlotChange(e: Event): void {
		const slot = e.target as HTMLSlotElement;
		this._hasIconSlot = slot.assignedElements({ flatten: true }).length > 0;
	}

	_handleClick(event: Event): void {
		// A disabled bar is inert: swallow the activation and fire no `select`, so a
		// clicked link never navigates and no tab becomes the current one.
		if (this._groupDisabled) {
			event.preventDefault();
			return;
		}
		if (!sanitizeUrl(this.href)) {
			event.preventDefault();
		}
		this.dispatchEvent(new CustomEvent('select', {
			bubbles: true,
			composed: true,
			detail: { item: this },
		}));
	}

	override render() {
		return tabBarItemTemplate(this);
	}
}


// # nldd-tab-bar

@customElement('nldd-tab-bar')
export class NLDDTabBar extends withTranslations(LitElement, nlddTabBarTranslations) {
	static override styles = tabBarStyles;

	/** Centers the tabs in the container (host fills the row, tabs group in the middle). */
	@property({ type: Boolean, reflect: true })
	centered = false;

	@property({ reflect: true, converter: reflectNonDefault<'icon-and-text' | 'text' | 'icon' | ''>('') })
	variant: 'icon-and-text' | 'text' | 'icon' | '' = '';

	/** Size: 'md' (default) or 'lg'. 'lg' enlarges the touch target while keeping the per-variant layout. */
	@property({ reflect: true, converter: reflectNonDefault<'md' | 'lg'>('md') })
	size: 'md' | 'lg' = 'md';

	@property({ type: Boolean, reflect: true })
	navigation = false;

	/** Disables the whole bar: the CSS dims it and blocks pointer-events, and every
	 *  tab is taken out of the tab order and made inert (propagated to the items). */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String, attribute: 'accessible-label', reflect: true, converter: reflectWhenSet })
	accessibleLabel = '';

	// Tracks whether the author provided an explicit accessible label
	private _hasCustomLabel = false;

	/** @internal The tabs that do not fit, in order, listed in the overflow menu. */
	@state()
	_overflowItems: NLDDTabBarItem[] = [];

	private _resizeObserver: ResizeObserver | null = null;
	private _itemObserver: MutationObserver | null = null;
	private _overflowFrame: number | null = null;

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('select', this._handleItemSelect as EventListener);
		this.addEventListener('keydown', this._handleKeyDown);
		// The bar shrink-wraps its tabs, so it does not grow when its container
		// does; the parent is watched too, or tabs in the menu never come back.
		this._resizeObserver = new ResizeObserver(() => this._scheduleOverflow());
		this._resizeObserver.observe(this);
		if (this.parentElement) this._resizeObserver.observe(this.parentElement);
		this._itemObserver = new MutationObserver(this._onItemsMutated);
		this._itemObserver.observe(this, { subtree: true, attributes: true, attributeFilter: ['text', 'icon', 'current', 'variant', 'size'] });
		document.fonts?.ready.then(() => this._scheduleOverflow());
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('select', this._handleItemSelect as EventListener);
		this.removeEventListener('keydown', this._handleKeyDown);
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;
		this._itemObserver?.disconnect();
		this._itemObserver = null;
		if (this._overflowFrame) cancelAnimationFrame(this._overflowFrame);
		this._overflowFrame = null;
	}

	/** Whether the next pass may only swap the current tab in, rather than
	 *  choose the whole set again. Cleared by anything that changes the room or
	 *  the content. */
	private _onlyCurrentChanged = true;

	private _scheduleOverflow = (full = true): void => {
		if (full) this._onlyCurrentChanged = false;
		if (this._overflowFrame) return;
		this._overflowFrame = requestAnimationFrame(() => {
			this._overflowFrame = null;
			const swapOnly = this._onlyCurrentChanged;
			this._onlyCurrentChanged = true;
			this._updateOverflow(swapOnly);
		});
	};

	private _onItemsMutated = (records: MutationRecord[]): void => {
		this._scheduleOverflow(records.some(record => record.attributeName !== 'current'));
	};

	/** Widths as the content wants them, and the room there is for them. */
	private _measure() {
		const items = this._getItems();
		const row = this.shadowRoot?.querySelector<HTMLElement>('.tab-bar');
		const list = this.shadowRoot?.querySelector<HTMLElement>('.tab-bar__items');
		const button = this.shadowRoot?.querySelector<HTMLElement>('.tab-bar__overflow-button');
		if (!row || !list || !button || items.length === 0) return null;

		this.toggleAttribute('data-measuring', true);
		const available = row.clientWidth;
		const widths = items.map(item => item.getBoundingClientRect().width);
		const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
		const buttonWidth = button.getBoundingClientRect().width;
		this.removeAttribute('data-measuring');
		return { items, available, widths, gap, budget: available - buttonWidth - gap };
	}

	/**
	 * @internal Read by nldd-toolbar, which gives an item holding this bar the
	 * room to show every tab, and lets it narrow down to the current tab beside
	 * the overflow button before the whole bar goes into the toolbar's menu.
	 */
	_toolbarWidths(): { preferred: number; minimum: number } | null {
		const measured = this._measure();
		if (!measured) return null;
		const { items, available, widths, gap, budget } = measured;
		const preferred = widths.reduce((sum, w) => sum + w, 0) + gap * (items.length - 1);
		if (items.length < 2) return { preferred, minimum: preferred };
		const current = Math.max(items.findIndex(item => item.current), 0);
		const buttonWidth = available - budget - gap;
		return { preferred, minimum: Math.min(preferred, widths[current] + gap + buttonWidth) };
	}

	/**
	 * Decides which tabs stay in the bar and which go to the menu.
	 *
	 * Measured with the bar at the full width of its container and every tab at
	 * the width its content wants, all before the next paint.
	 *
	 * The set only changes when it has to. A different current tab that is
	 * already in the bar changes nothing; one picked from the menu swaps places
	 * with the last tab in the bar, so a single slot changes. Only a change in
	 * the room or the content chooses the whole set again: the current tab
	 * first, then the others in order, for as long as they fit next to the
	 * overflow button. Tabs stay where they are in the DOM and are only hidden.
	 */
	_updateOverflow(swapOnly = false): void {
		const measured = this._measure();
		if (!measured) {
			this._applyOverflow(this._getItems(), new Set(), []);
			return;
		}
		const { items, available, widths, gap, budget } = measured;
		const width = (shown: Set<number>) => [...shown].reduce((sum, i) => sum + widths[i], 0) + gap * Math.max(shown.size - 1, 0);

		const total = widths.reduce((sum, w) => sum + w, 0) + gap * (items.length - 1);
		if (total <= available) {
			this._applyOverflow(items, new Set(), widths);
			return;
		}

		const current = items.findIndex(item => item.current);
		const previous = new Set(items.map((item, i) => (item.hasAttribute('data-overflow') ? -1 : i)).filter(i => i >= 0));
		let shown: Set<number>;

		if (swapOnly && this._overflowItems.length > 0 && previous.size > 0) {
			shown = new Set(previous);
			if (current >= 0 && !shown.has(current)) {
				const last = [...shown].filter(i => i !== current).pop();
				if (last !== undefined) shown.delete(last);
				shown.add(current);
			}
			// A wider tab swapped in can push the row past the room it has.
			while (shown.size > 1 && width(shown) > budget) {
				const last = [...shown].sort((x, y) => x - y).filter(i => i !== current).pop();
				if (last === undefined) break;
				shown.delete(last);
			}
		} else {
			shown = new Set();
			if (current >= 0) shown.add(current);
			for (let i = 0; i < items.length; i++) {
				if (i === current) continue;
				const next = new Set(shown).add(i);
				if (width(next) > budget) break;
				shown = next;
			}
			// Not even one tab fits beside the button: keep the first (or the
			// current) one, cut off, rather than an empty bar.
			if (shown.size === 0) shown.add(0);
		}
		this._applyOverflow(items, new Set(items.map((_, i) => i).filter(i => !shown.has(i))), widths);
	}

	/**
	 * Hides the tabs that go to the menu. With an overflow the bar fills its
	 * container and the tabs left in it share the room in proportion to the
	 * width they want, so the bar's edge and the overflow button stay put.
	 */
	private _applyOverflow(items: NLDDTabBarItem[], overflowed: Set<number>, widths: number[]): void {
		const overflowing = overflowed.size > 0;
		this.toggleAttribute('data-overflowing', overflowing);
		items.forEach((item, i) => {
			item.toggleAttribute('data-overflow', overflowed.has(i));
			if (overflowing && widths[i]) item.style.setProperty('--_tab-bar-item-natural-width', String(widths[i]));
			else item.style.removeProperty('--_tab-bar-item-natural-width');
		});
		const next = items.filter((_, i) => overflowed.has(i));
		const changed = next.length !== this._overflowItems.length || next.some((item, i) => item !== this._overflowItems[i]);
		if (changed) {
			this._overflowItems = next;
			this._syncItems();
		}
	}

	/** @internal A tab picked from the overflow menu. */
	_selectFromOverflow(event: Event, item: NLDDTabBarItem): void {
		event.stopPropagation();
		this._activate(item);
	}

	override firstUpdated(): void {
		this._hasCustomLabel = Boolean(this.accessibleLabel);
		this._syncItems();
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (
			changedProperties.has('variant') ||
			changedProperties.has('size') ||
			changedProperties.has('navigation') ||
			changedProperties.has('disabled')
		) {
			this._syncItems();
			this._scheduleOverflow();
		}
	}

	private _getItems(): NLDDTabBarItem[] {
		const slot = this.shadowRoot?.querySelector('slot');
		if (!slot) return [];
		return slot
			.assignedElements()
			.filter((el): el is NLDDTabBarItem =>
				el.tagName.toLowerCase() === 'nldd-tab-bar-item'
			);
	}

	private _syncItems(): void {
		const items = this._getItems();

		items.forEach(item => {
			item._groupVariant = this.variant;
			item.size = this.size;
			item._navigation = this.navigation;
			item._groupDisabled = this.disabled;
		});

		// Ensure keyboard entry point, among the tabs that are in the bar
		const hasCurrent = items.some(item => item.current);
		const firstItem = items.find(item => !item.hasAttribute('data-overflow')) ?? null;
		items.forEach(item => {
			item._isFallbackFocusable = !hasCurrent && item === firstItem;
		});
	}

	_onSlotChange(): void {
		this._syncItems();
		this._scheduleOverflow();
	}

	private _handleItemSelect = (event: CustomEvent): void => {
		event.stopPropagation();
		this._activate(event.detail.item);
	};

	/** Makes a tab current (unless the bar navigates) and fires `tabchange`. */
	private _activate(item: NLDDTabBarItem): void {
		if (this.disabled) return;
		// Navigation tabs are controlled by the consumer (the current tab follows
		// the route), so don't mark one on click — matching the keyboard path, which
		// already skips auto-activation for navigation tabs. A click that doesn't
		// actually navigate (e.g. blocked by a guard) must not leave the tab looking
		// current. Content-switching tabs still self-manage.
		if (!this.navigation) {
			this._getItems().forEach(other => {
				other.current = other === item;
			});
		}
		this.dispatchEvent(new CustomEvent('tabchange', {
			bubbles: true,
			composed: true,
			detail: { item },
		}));
	}

	private _handleKeyDown = (event: KeyboardEvent): void => {
		if (this.disabled) return;
		// The arrows walk the tabs in the bar; the ones in the menu are reached there.
		const items = this._getItems().filter(item => !item.hasAttribute('data-overflow'));
		if (items.length === 0) return;

		const currentIndex = items.findIndex(
			item => item === event.target || item.contains(event.target as Node)
		);
		let newIndex = -1;

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
				break;
			case 'ArrowRight':
				event.preventDefault();
				newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
				break;
			case 'Home':
				event.preventDefault();
				newIndex = 0;
				break;
			case 'End':
				event.preventDefault();
				newIndex = items.length - 1;
				break;
			default:
				return;
		}

		if (newIndex >= 0 && newIndex < items.length) {
			items[newIndex].focus();
			// Auto-activate only for content-switching tabs, not navigation tabs
			if (!this.navigation) {
				items.forEach(item => { item.current = item === items[newIndex]; });
				this.dispatchEvent(new CustomEvent('tabchange', {
					bubbles: true,
					composed: true,
					detail: { item: items[newIndex] },
				}));
			}
		}
	};

	override render() {
		return tabBarTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-tab-bar': NLDDTabBar;
		'nldd-tab-bar-item': NLDDTabBarItem;
	}
}
