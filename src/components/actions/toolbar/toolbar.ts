/**
 * Nederlandse Digitale Dienst Toolbar Component (Lit + TypeScript)
 *
 * @element nldd-toolbar
 * @attr {string} size - Toolbar size, propagated to all child controls: 'sm' | 'md' | 'lg' (default: 'md'). At 'lg' the overflow button (and lg-capable children like nldd-icon-button) stack their label below the icon.
 * @attr {boolean} show-item-labels - When true, shows a text label below each toolbar item and the overflow button
 * @attr {string} label - Accessible label for the toolbar. Only needed when multiple toolbars appear on the same page
 * @attr {object} translations - Override translation keys (e.g. the overflow button label); unset keys fall back to Dutch.
 *
 * @slot start - nldd-toolbar-item and nldd-toolbar-title elements placed at the start
 * @slot center - nldd-toolbar-item and nldd-toolbar-title elements placed at the center
 * @slot end - nldd-toolbar-item and nldd-toolbar-title elements placed at the end
 * @slot overflow - nldd-menu-item, nldd-menu-divider and nldd-menu-group elements always shown in the overflow menu
 *
 * ---
 *
 * @element nldd-toolbar-item
 * @attr {string} width - Fluid width: a percentage (e.g. '40%') or any CSS length (e.g. '240px'). Setting it (or min-width or max-width) makes the item fluid so it grows to fill the available space.
 * @attr {string} min-width - Minimum (fluid) width as a CSS length (e.g. '240px'). Setting it also makes the item fluid.
 * @attr {string} max-width - Maximum (fluid) width as a CSS length (e.g. '480px'). Setting it also makes the item fluid.
 * @attr {string} label - Text label shown below the item when the toolbar has show-item-labels.
 * @attr {number} priority - Overflow order: items with a lower priority move into the overflow menu first (default 0). Items sharing a priority overflow together, regardless of position.
 * @attr {'sm'|'md'|'lg'} size - Set by nldd-toolbar, not a consumer attribute: mirrors the toolbar's size (default: 'md') onto the item host, so size-dependent styling can key off it.
 * @attr {boolean} show-item-labels - Set by nldd-toolbar, not a consumer attribute: mirrors the toolbar's show-item-labels, so the item renders its label below the control.
 * @attr {boolean} fluid - Set by nldd-toolbar, not a consumer attribute: marks an item that grows or shrinks to fill space. Toggled synchronously during measurement, so it can appear or disappear between layout frames — do not style against it. It is not reflected as a JS property — read it with hasAttribute('fluid').
 * @attr {boolean} solo-fluid - Set by nldd-toolbar, not a consumer attribute: the sole fluid item, allowed to shrink below its content. Same synchronous-toggle and property-read caveats as fluid.
 * @attr {boolean} hidden - Set by nldd-toolbar, not a consumer attribute, when the item moves into the overflow menu. Same synchronous-toggle caveat.
 *
 * @slot - The control shown in the toolbar (e.g. nldd-icon-button)
 * @slot overflow - Required: nldd-menu-item / nldd-menu-divider / nldd-menu-group children, shown in the overflow menu when this item overflows. Without them the action is gone on a narrow toolbar, and the item warns in development.
 *
 * ---
 *
 * @element nldd-toolbar-title
 * @attr {string} width - Preferred (fluid) width as a CSS length or percentage; the title grows toward it and shrinks to min-width.
 * @attr {string} min-width - Minimum width as a CSS length (default: '0', so the title shrink-wraps its content and the next element sits against it).
 * @attr {string} max-width - Maximum width as a CSS length (default: '240px'); the title text truncates with an ellipsis beyond it. The cap is lifted while the title is the sole toolbar element (it then stretches to fill the row).
 * @attr {string} align - Text alignment: 'left' | 'center' (default: 'left').
 * @attr {string} text - Title text.
 * @attr {string} supporting-text - Secondary supporting text shown below the title.
 * @attr {'sm'|'md'|'lg'} size - Set by nldd-toolbar, not a consumer attribute: mirrors the toolbar's size (default: 'md'), which sets the title group height and, at 'sm', the title and supporting-text fonts.
 *
 * @attr {string} href - Makes the mark and the name one link, for the place this window belongs to (usually the app's own start). The `action` slot stays outside it: a control inside a link is a control you cannot reach without following the link.
 * @attr {string} target - Where the link opens; only meaningful with `href`. `_blank` adds rel="noopener noreferrer" and a visually hidden "opens in a new tab" announcement.
 * @attr {object} translations - Override translation keys (the new-tab announcement); unset keys fall back to Dutch.
 *
 * @slot media - Optional leading image before the title: a logo, a product mark, a file-type icon. Its height is capped to the title group so it cannot stretch the row; pick the size within that yourself. With no `text` the media stands alone and carries the name, so give it one (an `alt`, or an accessible label).
 * @slot action - Optional trailing control (e.g. an xs nldd-icon-button), shown inline after the title and tuned to sit against it. Empty by default.
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { toolbarStyles, toolbarItemStyles, toolbarTitleStyles } from './toolbar.styles.js';
import { template, toolbarItemTemplate, toolbarTitleTemplate, type ToolbarChild } from './toolbar.template.js';
import { nlddToolbarTranslations } from './toolbar.i18n.js';
import type { NLDDToolbarTranslations } from './toolbar.i18n.js';
import { NLDDMenu } from '../../actions/menu/menu.js';

// # Types
type Size = 'sm' | 'md' | 'lg';
type TitleAlign = 'left' | 'center';

// Consumer-set sizing props shared by nldd-toolbar-item and nldd-toolbar-title,
// read off generic Elements during measurement.
interface SizingElement {
	minWidth: string;
	maxWidth: string;
	width: string;
}

// # nldd-toolbar-item

@customElement('nldd-toolbar-item')
export class NLDDToolbarItem extends LitElement {
	static override styles = toolbarItemStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	width = '';

	@property({ reflect: true, attribute: 'min-width', converter: reflectNonDefault<string>('') })
	minWidth = '';

	@property({ reflect: true, attribute: 'max-width', converter: reflectNonDefault<string>('') })
	maxWidth = '';

	@property({ type: String })
	label = '';

	// Overflow order. The parent toolbar reads this as a PROPERTY (el.priority), so
	// both a bound property (Vue/React `:priority`, `el.priority = 2`) and a plain
	// attribute (`priority="2"`) work. Reflected so an explicit value is visible in
	// the DOM and a runtime property change re-triggers the toolbar's overflow
	// recompute (its observer watches the attribute). The converter reflects the
	// default 0 as *no attribute* (toAttribute → null), so the DOM isn't polluted
	// with `priority="0"` on every item; 0 means "no explicit priority".
	@property({
		reflect: true,
		converter: {
			fromAttribute: (value: string | null) => (value === null ? 0 : Number(value)),
			toAttribute: (value: number) => (value === 0 ? null : String(value)),
		},
	})
	priority = 0;

	/** Set by nldd-toolbar; not part of the public API. @internal */
	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	/** Set by nldd-toolbar; not part of the public API. @internal */
	@property({ type: Boolean, reflect: true, attribute: 'show-item-labels' })
	showItemLabels = false;

	// Layout state — `fluid`, `solo-fluid` and `hidden` — is owned by
	// nldd-toolbar and toggled directly as attributes during measurement
	// (synchronous, so the host box reflows immediately). They are not
	// reactive properties: Lit would reflect them asynchronously, which would
	// desync the attribute from the synchronous getBoundingClientRect reads.

	override firstUpdated(): void {
		// Without an alternative the action is simply gone once the toolbar runs
		// out of room, and that only happens on a narrow screen. Say it at load,
		// where a wide screen sees it too, not at the moment the item overflows.
		if (!import.meta.env?.DEV || this.querySelector(':scope > [slot="overflow"]')) return;
		const control = this.querySelector(':scope > :not([slot])');
		const name = control?.getAttribute('accessible-label') || control?.getAttribute('text') || this.label;
		console.warn(`nldd-toolbar-item${name ? ` ("${name}")` : ''}: nothing in slot="overflow". On a narrow toolbar this item moves into the overflow menu, and without an nldd-menu-item there its action is gone. Add one in slot="overflow".`);
	}

	override render() {
		return toolbarItemTemplate(this);
	}
}


// # nldd-toolbar-title

@customElement('nldd-toolbar-title')
export class NLDDToolbarTitle extends LitElement {
	static override styles = toolbarTitleStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	width = '';

	@property({ reflect: true, attribute: 'min-width', converter: reflectNonDefault<string>('') })
	minWidth = '';

	@property({ reflect: true, attribute: 'max-width', converter: reflectNonDefault<string>('') })
	maxWidth = '';

	@property({ reflect: true, converter: reflectNonDefault<TitleAlign>('left') })
	align: TitleAlign = 'left';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ type: String, reflect: true })
	href = '';

	@property({ type: String, reflect: true })
	target = '';

	@property({ type: Object })
	translations: Partial<NLDDToolbarTranslations> = {};

	/** Set by nldd-toolbar; not part of the public API. @internal */
	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	public _t(key: keyof NLDDToolbarTranslations): string {
		return this.translations[key] ?? nlddToolbarTranslations[key];
	}

	// Layout state — `solo-fluid` and `hidden` — is owned by nldd-toolbar and
	// toggled directly as attributes during measurement (synchronous). Not a
	// reactive property for the same reflection-timing reason as the item.

	// willUpdate (not updated) so the size CSS variables are written before the
	// toolbar measures the title with getBoundingClientRect() on the same frame.
	override willUpdate(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('minWidth')) this._reflectSizeVar('--_title-group-min-width', this.minWidth);
		if (changedProperties.has('width')) this._reflectSizeVar('--_title-width', this.width);
		if (changedProperties.has('maxWidth')) this._reflectSizeVar('--_title-max-width', this.maxWidth);
	}

	private _reflectSizeVar(prop: string, value: string): void {
		if (value) {
			this.style.setProperty(prop, value);
		} else {
			this.style.removeProperty(prop);
		}
	}

	override render() {
		return toolbarTitleTemplate(this);
	}
}


// # Component

@customElement('nldd-toolbar')
export class NLDDToolbar extends LitElement {
	static override styles = toolbarStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	@property({ type: Boolean, reflect: true, attribute: 'show-item-labels' })
	showItemLabels = false;

	@property({ type: String, reflect: true })
	label = '';

	@property({ type: Object })
	translations: Partial<NLDDToolbarTranslations> = {};

	// — i18n —————————————————————————————————————————————————————————————————

	public _t(key: keyof NLDDToolbarTranslations): string {
		return this.translations[key] ?? nlddToolbarTranslations[key];
	}

	@state()
	private _menuOpen = false;

	@state()
	private _startChildren: ToolbarChild[] = [];

	@state()
	private _centerChildren: ToolbarChild[] = [];

	@state()
	private _endChildren: ToolbarChild[] = [];

	@state()
	private _overflowIds: Set<number> = new Set();

	@state()
	private _leftSpacerZero = false;

	@state()
	private _rightSpacerZero = false;

	/** True when nothing is *rendered* in the start/end areas (they may hold
	 * consumer-hidden `display:none` children), so the center content is the
	 * only visible group. Drives the centered `.toolbar__center-fill` layout —
	 * a hidden back button no longer strands a centered title at the left.
	 * Computed from real rendering, not mere child presence. */
	@state()
	private _centerOnly = false;

	/** True when exactly one child is *rendered* and it is fluid (or a title),
	 * so the flexible spacer must be dropped and let that child fill the row.
	 * Computed from real rendering for the same reason as _centerOnly: a
	 * consumer-hidden `display:none` sibling would otherwise keep the spacer,
	 * which claims half the row and caps the fluid child at 50%. */
	@state()
	private _soloFluid = false;

	@state()
	private _pinnedOverflowItems: Element[] = [];

	private _childIds = new WeakMap<Element, number>();
	private _idCounter = 0;
	/** Maps the stamped `data-toolbar-oid` of an overflow item (and its
	 *  descendants) back to the original element, so a clone's `select` can be
	 *  forwarded to the original. Rebuilt on every _syncMenuItems. */
	private _overflowOriginalById = new Map<string, Element>();
	private _itemWidths = new Map<number, number>();
	private _observer: MutationObserver | null = null;
	private _resizeObserver: ResizeObserver | null = null;
	private _menu: NLDDMenu | null = null;
	private _isMeasuring = false;
	private _childResizeObserver: ResizeObserver | null = null;
	private _lastChildWidths = new WeakMap<HTMLElement, number>();
	private _isBuilding = false;
	private _hasMeasured = false;
	private _prioritizedItemsCache: Extract<ToolbarChild, { type: 'item' }>[] | null = null;

	private _getId(el: Element): number {
		if (!this._childIds.has(el)) {
			this._childIds.set(el, this._idCounter++);
		}
		return this._childIds.get(el)!;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this._observer = new MutationObserver((mutations) => {
			if (this._isBuilding) return;
			let needsRebuild = false;
			let needsMenuResync = false;
			for (const m of mutations) {
				if (m.type === 'attributes') {
					const el = m.target as Element;
					const tag = el.tagName.toLowerCase();
					if (tag === 'nldd-toolbar-item' || tag === 'nldd-toolbar-title') {
						// Structural attribute change (label/priority/width/…) → rebuild.
						needsRebuild = true;
					} else if (el.closest?.('[slot="overflow"]')) {
						// An overflow-slot item changed (e.g. `selected`/`disabled` on a
						// menu-item). The overflow menu holds a clone, so re-sync it —
						// otherwise the clone freezes at its state when it was made.
						needsMenuResync = true;
					}
					// Otherwise a visible control changed (e.g. nldd-segmented-control-item)
					// — no toolbar work needed.
				} else {
					// childList change (items added/removed) → rebuild.
					needsRebuild = true;
				}
			}
			if (needsRebuild) this._buildChildren();
			else if (needsMenuResync) this._syncMenuItems();
		});
		setTimeout(() => this._buildChildren(), 0);
		this._createMenu();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._observer?.disconnect();
		this._observer = null;
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;
		this._childResizeObserver?.disconnect();
		this._childResizeObserver = null;
		this._menu?.remove();
		this._menu = null;
	}

	override firstUpdated(): void {
		this._resizeObserver = new ResizeObserver(() => {
			if (this._isMeasuring) return;
			if (this._menuOpen) {
				(this._menu as unknown as { hidePopover: () => void })?.hidePopover();
			}
			this._measureAndUpdate();
		});
		this._resizeObserver.observe(this);
		this._syncHosts();
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('size') || changedProperties.has('showItemLabels')) {
			this._syncHosts();
		}
		if (
			changedProperties.has('_startChildren') ||
			changedProperties.has('_centerChildren') ||
			changedProperties.has('_endChildren')
		) {
			this.updateComplete.then(() => this._measureAndUpdate());
		}
		if (
			changedProperties.has('_overflowIds') ||
			changedProperties.has('_pinnedOverflowItems')
		) {
			this._syncMenuItems();
			this._syncMenuAnchor();
			if (!this._hasMeasured) {
				this.updateComplete.then(() => this._updateAreaVars());
			}
		}
	}

	private _createMenu(): void {
		if (this._menu) return;
		const menu = document.createElement('nldd-menu') as NLDDMenu;
		menu.setAttribute('placement', 'bottom-end');
		menu.id = `nldd-toolbar-overflow-menu-${this._idCounter++}`;
		menu.addEventListener('toggle', (event: Event) => {
			this._menuOpen = (event as ToggleEvent).newState === 'open';
		});
		menu.addEventListener('select', this._onOverflowMenuSelect);
		// In the shadow root, NOT document.body: the menu is a popover, so it
		// escapes clipping via the top layer anyway, and a body-level menu goes
		// inert (visible but untouchable) when the toolbar sits inside a modal
		// dialog — everything outside the dialog's subtree is inert then.
		this.renderRoot.appendChild(menu);
		this._menu = menu;
	}

	/** The overflow menu holds CLONES of the slotted overflow items (see
	 *  _syncMenuItems), so a clone's `select` never reaches the original element's
	 *  listeners. Forward it: map the clicked clone back to its original via the
	 *  `data-toolbar-oid` stamped at clone time, then re-dispatch `select` on the
	 *  original so a consumer's `@select` handler (or a live-bound attribute) on
	 *  the real overflow item fires. */
	private _onOverflowMenuSelect = (event: Event): void => {
		let oid: string | null = null;
		for (const node of event.composedPath()) {
			if (node instanceof Element && node.hasAttribute('data-toolbar-oid')) {
				oid = node.getAttribute('data-toolbar-oid');
				break;
			}
		}
		if (!oid) return;
		const original = this._overflowOriginalById.get(oid);
		if (!original) return;
		original.dispatchEvent(new CustomEvent('select', {
			bubbles: true,
			composed: true,
			detail: (event as CustomEvent).detail,
		}));
	};

	private _syncMenuAnchor(): void {
		if (!this._menu) return;
		const overflowButton = this.shadowRoot?.querySelector('.toolbar__overflow-button nldd-icon-button') as HTMLElement & {
			popoverTargetElement?: Element | null;
			popoverTargetAction?: 'toggle' | 'show' | 'hide';
		} | null;
		if (overflowButton) {
			this._menu.anchorElement = overflowButton;
			// Wire the button as the menu's invoker. The browser handles
			// open/close natively via popovertarget — no `@click` handler
			// needed. The menu syncs `popoverTargetAction` on every toggle
			// (`'hide'` while open, `'show'` while closed), so the next
			// click does the right thing without racing against light-
			// dismiss. Seed `'show'` here for the very first click before
			// the menu has ever toggled.
			if ('popoverTargetElement' in overflowButton) {
				overflowButton.popoverTargetElement = this._menu;
			}
			// Default IDL value is 'toggle'; replace it with 'show' so the
			// very first click opens via the explicit-show path. Once the
			// menu has opened, `_syncAnchorPopupState` keeps the action in
			// sync with state ('hide' while open, 'show' while closed) and
			// this seed never overrides it.
			if ('popoverTargetAction' in overflowButton && overflowButton.popoverTargetAction === 'toggle') {
				overflowButton.popoverTargetAction = 'show';
			}
		}
	}

	/**
	 * Syncs overflow menu items by cloning the original `nldd-menu-item` elements.
	 * Note: `cloneNode` does not copy event listeners added via `addEventListener`.
	 * The `select` event works correctly since it is dispatched by `nldd-menu-item` internally.
	 * Consumers should avoid adding extra listeners directly on overflow `nldd-menu-item` elements.
	 */
	private _syncMenuItems(): void {
		if (!this._menu) return;
		this._menu.innerHTML = '';
		this._overflowOriginalById.clear();

		// Stamp the original (and every descendant) with a stable id — copied into
		// the clone by cloneNode — so _onOverflowMenuSelect can map a clone's
		// `select` back to the original. `data-toolbar-oid` is outside the
		// observer's attributeFilter, so stamping never retriggers a re-sync.
		const cloneWithForwarding = (el: Element): Element => {
			for (const node of [el, ...el.querySelectorAll('*')]) {
				let oid = node.getAttribute('data-toolbar-oid');
				if (!oid) {
					oid = `oid-${this._idCounter++}`;
					node.setAttribute('data-toolbar-oid', oid);
				}
				this._overflowOriginalById.set(oid, node);
			}
			const clone = el.cloneNode(true) as Element;
			clone.removeAttribute('slot');
			return clone;
		};

		const prioritized = [...this._getPrioritizedItems()].reverse();

		prioritized.forEach(child => {
			if (!this._overflowIds.has(child.id)) return;
			if (child.overflowItems.length === 0) return;
			child.overflowItems.forEach(el => {
				this._menu!.appendChild(cloneWithForwarding(el));
			});
		});

		if (this._pinnedOverflowItems.length > 0) {
			this._pinnedOverflowItems.forEach(el => {
				this._menu!.appendChild(cloneWithForwarding(el));
			});
		}
	}

	/**
	 * Syncs declarative state onto the slotted item and title hosts: size,
	 * show-item-labels, the base fluid flag and the fluid width custom
	 * properties. The parent owns layout decisions; each host owns its own box
	 * and rendering. Attributes are set directly (not via reactive properties)
	 * so the host box reflows synchronously before the next measurement.
	 */
	private _syncHosts(): void {
		this._allHostChildren().forEach(child => {
			if (child.type === 'item') {
				const host = child.element as NLDDToolbarItem;
				host.setAttribute('size', this.size);
				host.toggleAttribute('show-item-labels', this.showItemLabels);
				host.toggleAttribute('fluid', child.isFluid);
				if (child.isFluid && child.minWidth) {
					host.style.setProperty('--_item-min-width', child.minWidth);
				} else {
					host.style.removeProperty('--_item-min-width');
				}
				if (child.isFluid && child.width) {
					host.style.setProperty('--_item-width', child.width);
				} else {
					host.style.removeProperty('--_item-width');
				}
				if (child.isFluid && child.maxWidth) {
					host.style.setProperty('--_item-max-width', child.maxWidth);
				} else {
					host.style.removeProperty('--_item-max-width');
				}
				// Forward size to the inner control(s).
				Array.from(host.children).forEach(inner => {
					if (inner.getAttribute('slot') !== 'overflow') {
						inner.setAttribute('size', this.size);
					}
				});
			} else if (child.type === 'title') {
				const host = child.element as NLDDToolbarTitle;
				host.setAttribute('size', this.size);
			}
		});
	}

	private _getPrioritizedItems(): Extract<ToolbarChild, { type: 'item' }>[] {
		if (this._prioritizedItemsCache) return this._prioritizedItemsCache;
		const endItems = this._endChildren
			.filter((c): c is Extract<ToolbarChild, { type: 'item' }> => c.type === 'item');
		const startItems = this._startChildren
			.filter((c): c is Extract<ToolbarChild, { type: 'item' }> => c.type === 'item');
		const centerItems = this._centerChildren
			.filter((c): c is Extract<ToolbarChild, { type: 'item' }> => c.type === 'item');

		const result = [
			...endItems.map((item, index) => ({ item, areaOrder: 0, index })),
			...centerItems.map((item, index) => ({ item, areaOrder: 1, index })),
			...startItems.map((item, index) => ({ item, areaOrder: 2, index })),
		]
			.sort((a, b) => {
				if (a.item.priority !== b.item.priority) return a.item.priority - b.item.priority;
				if (a.areaOrder !== b.areaOrder) return a.areaOrder - b.areaOrder;
				return b.index - a.index;
			})
			.map(({ item }) => item);
		this._prioritizedItemsCache = result;
		return result;
	}

	private _allHostChildren(): ToolbarChild[] {
		return [...this._startChildren, ...this._centerChildren, ...this._endChildren];
	}

	private _hostFor(id: number): HTMLElement | null {
		const child = this._allHostChildren().find(c => c.id === id);
		return (child && (child.type === 'item' || child.type === 'title'))
			? (child.element as HTMLElement)
			: null;
	}

	private _measureItemWidths(): void {
		this._allHostChildren().forEach(child => {
			if (child.type === 'item' || child.type === 'title') {
				const host = child.element as HTMLElement;
				this._itemWidths.set(child.id, host.getBoundingClientRect().width);
			}
		});
	}

	private _computeAreaWidth(children: ToolbarChild[], itemGap: number): number {
		const visible = children.filter(c => !this._overflowIds.has(c.id));
		const gaps = Math.max(0, visible.length - 1) * itemGap;
		const itemsWidth = visible.reduce((sum, child) => {
			if (child.type === 'item' || child.type === 'title') {
				return sum + (this._itemWidths.get(child.id) ?? 0);
			}
			return sum;
		}, 0);
		return gaps + itemsWidth;
	}

	private _computeSpacerZeros(
		hostWidth: number,
		itemGap: number,
		overflowButtonWidth: number,
		startWidth: number,
		centerWidth: number,
		endWidth: number,
	): { leftZero: boolean; rightZero: boolean } {
		if (startWidth === 0 && endWidth === 0) {
			return { leftZero: true, rightZero: true };
		}
		const leftSpacer = hostWidth / 2 - startWidth - centerWidth / 2 - itemGap;
		const rightSpacer = hostWidth / 2 - endWidth - centerWidth / 2 - itemGap - overflowButtonWidth;
		return {
			leftZero: leftSpacer <= 0,
			rightZero: rightSpacer <= 0,
		};
	}

	private _updateAreaVars(): void {
		const itemsEl = this.shadowRoot?.querySelector('.toolbar__items') as HTMLElement | null;
		if (!itemsEl) return;

		const hostWidth = this.getBoundingClientRect().width;
		const itemGap = parseFloat(getComputedStyle(itemsEl).gap ?? '0');
		const hostGap = parseFloat(getComputedStyle(this).gap ?? '0');

		const overflowButtonContainerEl = this.shadowRoot?.querySelector('.toolbar__overflow-button') as HTMLElement | null;
		const overflowButtonEl = this.shadowRoot?.querySelector('.toolbar__overflow-button nldd-icon-button') as HTMLElement | null;
		const overflowButtonWidth = (overflowButtonContainerEl && !overflowButtonContainerEl.classList.contains('is-hidden') && overflowButtonEl)
			? overflowButtonEl.getBoundingClientRect().width + hostGap
			: 0;

		this.style.setProperty('--_overflow-button-width', `${overflowButtonWidth}px`);

		const startWidth = this._computeAreaWidth(this._startChildren, itemGap);
		const centerWidth = this._computeAreaWidth(this._centerChildren, itemGap);
		const endWidth = this._computeAreaWidth(this._endChildren, itemGap);

		this.style.setProperty('--_start-width', `${startWidth}px`);
		this.style.setProperty('--_center-width', `${centerWidth}px`);
		this.style.setProperty('--_end-width', `${endWidth}px`);

		// The spacer basis subtracts a gap to account for the flex gap between a
		// side area and its spacer. That gap only exists when the area is
		// non-empty; with an empty start (or end) the spacer is the first (or
		// last) item and there is no such gap, so drop the subtraction to 0 —
		// otherwise the center is pulled off-center by one gap once the opposite
		// side gains items.
		this.style.setProperty('--_left-spacer-gap', startWidth > 0 ? `${itemGap}px` : '0px');
		this.style.setProperty('--_right-spacer-gap', endWidth > 0 ? `${itemGap}px` : '0px');

		const { leftZero, rightZero } = this._computeSpacerZeros(
			hostWidth, itemGap, overflowButtonWidth, startWidth, centerWidth, endWidth
		);
		if (leftZero !== this._leftSpacerZero) this._leftSpacerZero = leftZero;
		if (rightZero !== this._rightSpacerZero) this._rightSpacerZero = rightZero;

		// Route to the centered center-fill layout whenever nothing is actually
		// rendered in start/end — measured by real rendering, not child presence,
		// so a consumer-hidden (display:none) back button doesn't strand a centered
		// title at the left (it would otherwise keep centerOnly false and fall into
		// the spacer path, where startWidth===0 && endWidth===0 suppresses both
		// balancing spacers).
		const centerOnly = !this._hasRenderedChild(this._startChildren)
			&& !this._hasRenderedChild(this._endChildren)
			&& this._centerChildren.length > 0;
		if (centerOnly !== this._centerOnly) this._centerOnly = centerOnly;

		const rendered = this._allHostChildren().filter(c =>
			!this._overflowIds.has(c.id) && (c.element as HTMLElement).getClientRects().length > 0
		);
		const soloFluid = rendered.length === 1 && (
			rendered[0].type === 'title' || (rendered[0].type === 'item' && rendered[0].isFluid)
		);
		if (soloFluid !== this._soloFluid) this._soloFluid = soloFluid;
	}

	/** Whether any child in the list is actually rendered. getClientRects() is
	 * empty for a `display:none` element (consumer-hidden or toolbar-hidden via
	 * `[hidden]`), so this counts real on-screen presence, not mere DOM presence. */
	private _hasRenderedChild(children: ToolbarChild[]): boolean {
		return children.some(c => (c.element as HTMLElement).getClientRects().length > 0);
	}

	private _measureAndUpdate(): void {
		if (this._isMeasuring) return;
		const itemsEl = this.shadowRoot?.querySelector('.toolbar__items') as HTMLElement | null;
		if (!itemsEl) return;

		this._isMeasuring = true;
		const hostWidth = this.getBoundingClientRect().width;
		this.style.setProperty('--_width', `${hostWidth}px`);
		this._measureOverflow(itemsEl);
		this._hasMeasured = true;
		this._isMeasuring = false;
	}

	private _measureOverflow(itemsEl: HTMLElement): void {
		const overflowButtonEl = this.shadowRoot?.querySelector('.toolbar__overflow-button') as HTMLElement | null;
		const allChildren = this._allHostChildren();
		const itemChildren = allChildren.filter(
			(c): c is Extract<ToolbarChild, { type: 'item' }> => c.type === 'item'
		);
		const titleChildren = allChildren.filter(
			(c): c is Extract<ToolbarChild, { type: 'title' }> => c.type === 'title'
		);

		// Show all items, reset solo-fluid to fluid with min-width restored.
		itemChildren.forEach(child => {
			const host = child.element as HTMLElement;
			host.hidden = false;
			if (host.hasAttribute('solo-fluid')) {
				host.removeAttribute('solo-fluid');
				host.toggleAttribute('fluid', child.isFluid);
				if (child.isFluid && child.minWidth) {
					host.style.setProperty('--_item-min-width', child.minWidth);
				}
			}
		});
		titleChildren.forEach(child => {
			const host = child.element as HTMLElement;
			if (host.hasAttribute('solo-fluid')) {
				host.removeAttribute('solo-fluid');
				host.style.removeProperty('min-width');
			}
		});

		if (this._pinnedOverflowItems.length > 0) {
			overflowButtonEl?.classList.remove('is-hidden');
		} else {
			overflowButtonEl?.classList.add('is-hidden');
		}
		void itemsEl.offsetWidth;

		const centerOnly = this._startChildren.length === 0
			&& this._endChildren.length === 0
			&& this._centerChildren.length > 0;

		const isOverflowing = () => itemsEl.scrollWidth > itemsEl.clientWidth + 1;

		if (!isOverflowing()) {
			if (this._overflowIds.size > 0) {
				this._overflowIds = new Set();
			}
			this._promoteSoloFluid(itemsEl, itemChildren, titleChildren, centerOnly);
			this._measureItemWidths();
			this._updateAreaVars();
			return;
		}

		overflowButtonEl?.classList.remove('is-hidden');
		void itemsEl.offsetWidth;

		const prioritized = this._getPrioritizedItems();
		const newOverflowIds = new Set<number>();

		const priorityGroups = groupForOverflow(prioritized);

		for (const group of priorityGroups) {
			if (!isOverflowing()) break;

			// Fluid-guard (per group): never hide the last fluid fallback. If
			// hiding this group would leave no non-fluid item visible, stop and
			// let a remaining fluid item shrink (solo-fluid) instead.
			if (group.some(c => c.isFluid)) {
				const groupIds = new Set(group.map(c => c.id));
				const nonFluidVisibleOutside = itemChildren.filter(c => {
					const host = c.element as HTMLElement;
					return !host.hidden && !host.hasAttribute('fluid') && !host.hasAttribute('solo-fluid') && !groupIds.has(c.id);
				});
				if (nonFluidVisibleOutside.length === 0) break;
			}

			for (const child of group) {
				newOverflowIds.add(child.id);
				(child.element as HTMLElement).hidden = true;
			}
			void itemsEl.offsetWidth;
		}

		if (newOverflowIds.size === 0 && this._pinnedOverflowItems.length === 0) {
			overflowButtonEl?.classList.add('is-hidden');
		}

		this._promoteSoloFluid(itemsEl, itemChildren, titleChildren, centerOnly);

		const changed =
			newOverflowIds.size !== this._overflowIds.size ||
			[...newOverflowIds].some(id => !this._overflowIds.has(id));

		if (changed) {
			this._overflowIds = newOverflowIds;
		}

		this._measureItemWidths();
		this._updateAreaVars();
	}

	/**
	 * Promotes a lone remaining fluid item — or a lone title when no items are
	 * visible — to the solo-fluid state so it grows to fill the row. In
	 * center-only mode the center-fill wrapper already grows the items, so item
	 * promotion is skipped there (matching the previous template behavior).
	 */
	private _promoteSoloFluid(
		itemsEl: HTMLElement,
		itemChildren: Extract<ToolbarChild, { type: 'item' }>[],
		titleChildren: Extract<ToolbarChild, { type: 'title' }>[],
		centerOnly: boolean,
	): void {
		// Real rendering, not the `hidden` property: a consumer-hidden
		// (display:none) start/end item must not count as a "remaining visible"
		// item, or it blocks promoting a lone title to solo-fluid (which is what
		// lets align="center" actually center it). Toolbar-hidden items are
		// display:none too, so this stays equivalent for the overflow flow.
		const remainingVisible = itemChildren.filter(c => (c.element as HTMLElement).getClientRects().length > 0);
		if (!centerOnly && remainingVisible.length === 1 && (remainingVisible[0].element as HTMLElement).hasAttribute('fluid')) {
			const host = remainingVisible[0].element as HTMLElement;
			host.removeAttribute('fluid');
			host.setAttribute('solo-fluid', '');
			host.style.removeProperty('--_item-min-width');
			void itemsEl.offsetWidth;
		}

		const remainingTitles = titleChildren.filter(c => !(c.element as HTMLElement).hidden);
		if (remainingVisible.length === 0 && remainingTitles.length === 1) {
			const host = remainingTitles[0].element as HTMLElement;
			host.setAttribute('solo-fluid', '');
			host.style.setProperty('min-width', '0px');
			void itemsEl.offsetWidth;
		}
	}

	private _buildChildrenForSlot(slotName: string): ToolbarChild[] {
		return Array.from(this.children)
			.filter(el => el.getAttribute('slot') === slotName)
			.map(el => {
				const tag = el.tagName.toLowerCase();

				if (tag === 'nldd-toolbar-title') {
					const id = this._getId(el);
					return {
						type: 'title',
						element: el,
						minWidth: (el as Element & SizingElement).minWidth || '200px',
						id,
					} as ToolbarChild;
				}

				if (tag === 'nldd-toolbar-item') {
					const id = this._getId(el);
					const label = el.getAttribute('label') ?? '';
					// Read priority as a property, not an attribute: for a custom element,
					// Vue/React set `priority` as a DOM property (`'priority' in el`), not an
					// attribute, and it isn't reflected — so getAttribute misses it (same
					// reason the sizing props below are read as properties). Lit mirrors an
					// attribute-set value onto the property too, so this covers plain HTML.
					// Priority 0 is the default and counts as "no explicit priority" (the
					// item overflows individually rather than grouping).
					const priority = (el as Element & { priority?: number }).priority ?? 0;
					const hasPriority = priority !== 0;
					// Read sizing as properties, not attributes: frameworks such as Vue set
					// `width` as a DOM property (el.width exists) rather than an attribute,
					// so getAttribute('width') misses it. Lit mirrors attribute-set values
					// onto these properties too, so reading the property covers both.
					const sizing = el as Element & SizingElement;
					const minWidth = sizing.minWidth || '';
					const maxWidth = sizing.maxWidth || '';
					const width = sizing.width || '';
					const isFluid = !!(minWidth || maxWidth || width);

					const overflowItems = Array.from(el.children).filter(child => {
						const childTag = child.tagName.toLowerCase();
						return childTag === 'nldd-menu-item' || childTag === 'nldd-menu-divider' || childTag === 'nldd-menu-group';
					});
					overflowItems.forEach(child => child.setAttribute('slot', 'overflow'));

					return { type: 'item', element: el, label, id, priority, hasPriority, overflowItems, minWidth, maxWidth, width, isFluid } as ToolbarChild;
				}

				const id = this._getId(el);
				return { type: 'other', element: el, id } as ToolbarChild;
			});
	}

	private _buildPinnedOverflowItems(): void {
		this._pinnedOverflowItems = Array.from(this.children).filter(el => {
			const tag = el.tagName.toLowerCase();
			return el.getAttribute('slot') === 'overflow' &&
				(tag === 'nldd-menu-item' || tag === 'nldd-menu-divider' || tag === 'nldd-menu-group');
		});
	}

	private _buildChildren(): void {
		if (this._isBuilding) return;
		this._isBuilding = true;

		this._observer?.disconnect();

		this._startChildren = this._buildChildrenForSlot('start');
		this._centerChildren = this._buildChildrenForSlot('center');
		this._endChildren = this._buildChildrenForSlot('end');
		this._buildPinnedOverflowItems();
		this._prioritizedItemsCache = null;
		this._syncHosts();

		const itemAttributeFilter = ['label', 'priority', 'min-width', 'max-width', 'width', 'text', 'disabled', 'selected', 'type'];
		this._observer?.observe(this, { childList: true, attributes: true, subtree: true, attributeFilter: itemAttributeFilter });
		this._watchChildSizes();

		this._isBuilding = false;
	}

	/**
	 * Watches how wide the children actually are, rather than guessing which
	 * attribute means "wider".
	 *
	 * What decides the layout is the width a control needs, and that changes for
	 * reasons no attribute filter catches: a `text` that gets shorter, a font
	 * that finishes loading, a consumer's own CSS. The mutation observer sees
	 * some of those and has no way to tell which of them moved a pixel, so it
	 * asked the wrong question. This one reads the answer.
	 *
	 * Measuring changes these very sizes, since an item that moves into the
	 * overflow menu collapses. `_isMeasuring` covers the synchronous pass, and
	 * the render that follows lands after it, so the callback compares against
	 * the widths it last acted on and stays quiet when nothing really moved.
	 */
	private _watchChildSizes(): void {
		this._childResizeObserver?.disconnect();
		this._childResizeObserver ??= new ResizeObserver(entries => {
			if (this._isMeasuring || this._isBuilding) return;
			let moved = false;
			for (const entry of entries) {
				const el = entry.target as HTMLElement;
				// An item in the overflow menu has no width to speak of. It is the
				// hiding that took it away, not the content, so it says nothing about
				// whether the layout should change.
				if (el.hasAttribute('hidden')) continue;
				const width = entry.contentRect.width;
				if (Math.abs((this._lastChildWidths.get(el) ?? -1) - width) < 0.5) continue;
				this._lastChildWidths.set(el, width);
				moved = true;
			}
			if (moved) this._measureAndUpdate();
		});
		this._lastChildWidths = new WeakMap();
		for (const el of this._hostChildElements()) {
			this._childResizeObserver.observe(el);
		}
	}

	/** The elements this toolbar lays out: its items and its title. */
	private _hostChildElements(): HTMLElement[] {
		return Array.from(this.children).filter((el): el is HTMLElement => {
			const tag = el.tagName.toLowerCase();
			return tag === 'nldd-toolbar-item' || tag === 'nldd-toolbar-title';
		});
	}

	override render() {
		const visibleNonDivider = this._allHostChildren().filter(c =>
			!this._overflowIds.has(c.id)
		);
		// Pre-measurement fallback: before the first _updateAreaVars there is no
		// rendering to read, so fall back to mere DOM presence. _soloFluid takes
		// over from the first measurement on.
		const isSoloFluid = this._soloFluid || (visibleNonDivider.length === 1 && (
			visibleNonDivider[0].type === 'title' ||
			(visibleNonDivider[0].type === 'item' && visibleNonDivider[0].isFluid)
		));

		return template(
			this,
			this._centerChildren.length > 0,
			this._leftSpacerZero,
			this._rightSpacerZero,
			isSoloFluid,
			this._pinnedOverflowItems.length > 0 || this._overflowIds.size > 0,
			this._menuOpen,
			this.label,
			this._centerOnly,
			(key) => this._t(key),
		);
	}
}

// # Helpers

/** A toolbar child narrowed to an item; the overflow grouping operates on these. */
type OverflowItem = Extract<ToolbarChild, { type: 'item' }>;
/** Items bucketed into overflow groups (each inner array overflows together). */
type OverflowGroups = OverflowItem[][];

/**
 * Groups prioritized items for overflow. Items with an explicit priority that
 * share a value form one group and overflow together regardless of their
 * position; items without a priority attribute each form their own group
 * (they overflow individually).
 *
 * @internal Exported for unit tests only; not part of the public API.
 */
export function groupForOverflow(
	items: OverflowItem[],
): OverflowGroups {
	const groups: OverflowGroups = [];
	const byPriority = new Map<number, OverflowItem[]>();
	for (const child of items) {
		if (!child.hasPriority) {
			groups.push([child]);
			continue;
		}
		const existing = byPriority.get(child.priority);
		if (existing) {
			existing.push(child);
			continue;
		}
		const group: OverflowItem[] = [child];
		byPriority.set(child.priority, group);
		groups.push(group);
	}
	return groups;
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-toolbar': NLDDToolbar;
		'nldd-toolbar-item': NLDDToolbarItem;
		'nldd-toolbar-title': NLDDToolbarTitle;
	}
}
