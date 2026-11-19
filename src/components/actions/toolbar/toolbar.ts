/**
 * Nederlandse Digitale Dienst Toolbar Component (Lit + TypeScript)
 *
 * A row of controls that belong to a whole screen or pane, with an overflow
 * menu for what does not fit. The toolbar measures itself: as the row runs out
 * of room, items move into that menu, the lowest `priority` first, and items
 * that share a priority move together. So the order in the HTML says where an
 * item sits, and `priority` says how long it stays. An item holding a control
 * with its own overflow, such as nldd-tab-bar, first narrows down when its turn
 * comes, so that control moves what does not fit into its own menu, and only
 * then goes into the toolbar's menu.
 *
 * Every item carries its own alternative for the menu, an nldd-menu-item in its
 * `overflow` slot. Without one the action is simply gone once the item
 * overflows, which on a wide screen you never see; the item warns about it in
 * development. The toolbar's own `overflow` slot holds the actions that live in
 * the menu at every width.
 *
 * @element nldd-toolbar
 * @keywords werkbalk
 * @related nldd-button-bar, nldd-button-group
 * @attr {'sm'|'md'|'lg'} size - Toolbar size, propagated to all child controls: 'sm' | 'md' | 'lg' (default: 'md'). At 'lg' the overflow button (and lg-capable children like nldd-icon-button) stack their label below the icon.
 * @attr {boolean} show-item-labels - When true, shows a text label below each toolbar item and the overflow button
 * @attr {string} accessible-label - Accessible name of the toolbar. Only needed when multiple toolbars appear on the same page.
 * @attr {object} translations - Override translation keys (e.g. the overflow button label); unset keys fall back to Dutch.
 *
 * @slot start - nldd-toolbar-item and nldd-toolbar-title elements placed at the start
 * @slot center - nldd-toolbar-item and nldd-toolbar-title elements placed at the center
 * @slot end - nldd-toolbar-item and nldd-toolbar-title elements placed at the end
 * @slot overflow - nldd-menu-item, nldd-menu-divider and nldd-menu-group elements always shown in the overflow menu
 */
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { toolbarStyles } from './toolbar.styles.js';
import { template, type ToolbarChild } from './toolbar.template.js';
import { nlddToolbarTranslations } from './toolbar.i18n.js';
import type { NLDDToolbarTranslations } from './toolbar.i18n.js';
import { translate } from '../../../utilities/translations.js';
import { NLDDToolbarItem, type Size, type SizingElement } from './toolbar-item.js';
import { NLDDToolbarTitle } from './toolbar-title.js';
import { OverflowMenu } from '../../../utilities/overflow-menu.js';
import { afterParse } from '../../../utilities/after-parse.js';
import { LayoutPass } from '../../../utilities/layout-pass.js';
import { runSteps, type Steps } from './toolbar.steps.js';
import {
	areaWidth,
	fillsRowAlone,
	itemsOf,
	overflowOrder,
	spacerZeros,
	groupForOverflow,
	type OverflowItem,
} from './toolbar.layout.js';

export { NLDDToolbarItem } from './toolbar-item.js';
export { NLDDToolbarTitle } from './toolbar-title.js';
export { groupForOverflow } from './toolbar.layout.js';

// # Measuring many toolbars at once

type ToolbarWidths = { preferred: number; minimum: number };

/** A control with its own overflow, such as nldd-tab-bar. */
type ShrinkableControl = Element & {
	_toolbarWidths: () => ToolbarWidths | null;
	/** Puts the control in the state its widths are read in, so the reads of
	 *  many toolbars come after one write. */
	_setMeasuring?: (on: boolean) => void;
};

function shrinkableControlOf(item: HTMLElement): ShrinkableControl | null {
	const control = Array.from(item.children).find(el => el.getAttribute('slot') !== 'overflow') as
		Partial<ShrinkableControl> | undefined;
	return typeof control?._toolbarWidths === 'function' ? control as ShrinkableControl : null;
}

/** Every toolbar that asks for a measurement in the same tick, in one pass. */
const measurePass = new LayoutPass<NLDDToolbar>(toolbars =>
	runSteps(toolbars.filter(toolbar => toolbar.isConnected).map(toolbar => toolbar._measureSteps())),
);

/** The area widths before the first measurement, in one pass for the same reason. */
const areaPass = new LayoutPass<NLDDToolbar>(toolbars =>
	runSteps(toolbars.filter(toolbar => toolbar.isConnected && !toolbar._hasMeasured).map(toolbar => toolbar._areaSteps())),
);

/**
 * One ResizeObserver for every toolbar and its items. One per toolbar calls
 * back once per toolbar, and each callback measures a layout the previous one
 * changed; this one measures every toolbar that changed size in one pass.
 */
const toolbarOf = new WeakMap<Element, NLDDToolbar>();
let sizeObserver: ResizeObserver | null = null;

function observeSize(target: Element, toolbar: NLDDToolbar): void {
	sizeObserver ??= new ResizeObserver(entries => {
		const resized = new Set<NLDDToolbar>();
		for (const entry of entries) {
			const toolbar = toolbarOf.get(entry.target);
			if (toolbar?._resized(entry)) resized.add(toolbar);
		}
		if (!resized.size) return;
		resized.forEach(toolbar => measurePass.schedule(toolbar, toolbar.ownerDocument));
		measurePass.flush();
	});
	toolbarOf.set(target, toolbar);
	sizeObserver.observe(target);
}

/** Only while the target is still this toolbar's: an item moved to another
 *  toolbar is that one's to watch. */
function unobserveSize(target: Element, toolbar: NLDDToolbar): void {
	if (toolbarOf.get(target) !== toolbar) return;
	sizeObserver?.unobserve(target);
	toolbarOf.delete(target);
}

/** The toolbars that build their children at the next task, in one timeout. */
const toBuild = new Set<NLDDToolbar>();
let buildTimer: ReturnType<typeof setTimeout> | null = null;

function buildSoon(toolbar: NLDDToolbar): void {
	toBuild.add(toolbar);
	buildTimer ??= setTimeout(() => {
		buildTimer = null;
		const toolbars = [...toBuild];
		toBuild.clear();
		toolbars.forEach(toolbar => toolbar._buildChildren());
	}, 0);
}

/**
 * A web font that finishes loading changes how wide an item is. The child
 * resize observer sees that for a visible item, but an item already in the
 * overflow menu has no width to watch: measured with the fallback font it
 * went into the menu, and would stay there although it fits now. One listener
 * for every toolbar, so they measure in one pass.
 */
const connectedToolbars = new Set<NLDDToolbar>();
const onFontsLoaded = (): void => {
	const measured = [...connectedToolbars].filter(toolbar => toolbar._hasMeasured);
	if (!measured.length) return;
	measured.forEach(toolbar => measurePass.schedule(toolbar, toolbar.ownerDocument));
	measurePass.flush();
};

// # Component

@customElement('nldd-toolbar')
export class NLDDToolbar extends LitElement {
	static override styles = toolbarStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	@property({ type: Boolean, reflect: true, attribute: 'show-item-labels' })
	showItemLabels = false;

	@property({ reflect: true, attribute: 'accessible-label', converter: reflectNonDefault<string>('') })
	accessibleLabel = '';

	@property({ type: Object })
	translations: Partial<NLDDToolbarTranslations> = {};

	// — i18n —————————————————————————————————————————————————————————————————

	public _t(key: keyof NLDDToolbarTranslations): string {
		return translate(this.translations, nlddToolbarTranslations, key);
	}

	/** The menu for what does not fit. @internal */
	readonly _overflowMenu = new OverflowMenu(this, { id: 'nldd-toolbar-overflow-menu' });

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
	 * only visible group. Drives the centered `.toolbar__center-fill` layout,
	 * so a hidden back button no longer strands a centered title at the left.
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
	private _itemWidths = new Map<number, number>();
	private _observer: MutationObserver | null = null;
	private _isMeasuring = false;
	/** The items and title whose size is watched (see _watchChildSizes). */
	private _sizedChildren = new Set<HTMLElement>();
	private _lastChildWidths = new WeakMap<HTMLElement, number>();
	private _isBuilding = false;
	private _rebuildPending = false;
	private _built = false;
	private _lastWidth: number | null = null;
	/** @internal */
	_hasMeasured = false;
	private _prioritizedItemsCache: OverflowItem[] | null = null;

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
			if (needsRebuild) this._rebuild();
			else if (needsMenuResync) this._syncMenuItems();
		});
		// Here and not in firstUpdated: disconnecting takes it down, and a toolbar
		// moved in the DOM or kept by a framework connects again without a first
		// update, so it would no longer follow its width.
		observeSize(this, this);
		buildSoon(this);
		if (!connectedToolbars.size) document.fonts?.addEventListener('loadingdone', onFontsLoaded);
		connectedToolbars.add(this);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		connectedToolbars.delete(this);
		if (!connectedToolbars.size) document.fonts?.removeEventListener('loadingdone', onFontsLoaded);
		toBuild.delete(this);
		measurePass.cancel(this);
		areaPass.cancel(this);
		this._observer?.disconnect();
		this._observer = null;
		unobserveSize(this, this);
		this._lastWidth = null;
		this._sizedChildren.forEach(el => unobserveSize(el, this));
		this._sizedChildren.clear();
	}

	/**
	 * A rebuild for a change in the children. While the parser is still adding
	 * them, the observer calls back once per child; one rebuild after the parse
	 * does for all of them.
	 */
	private _rebuild(): void {
		if (this._rebuildPending) return;
		const run = () => {
			this._rebuildPending = false;
			if (this.isConnected) this._buildChildren();
		};
		this._rebuildPending = afterParse(run, this.ownerDocument);
		if (!this._rebuildPending) this._buildChildren();
	}

	/** A measurement in the next pass, together with the other toolbars. */
	private _scheduleMeasure(): void {
		measurePass.schedule(this, this.ownerDocument);
	}

	/**
	 * Whether a size change reported by the shared observer calls for a
	 * measurement. Measuring changes these very sizes, since an item that moves
	 * into the overflow menu collapses. `_isMeasuring` covers the synchronous
	 * pass, and the render that follows lands after it, so a child is compared
	 * against the width it last had and stays quiet when nothing really moved.
	 * @internal
	 */
	_resized(entry: ResizeObserverEntry): boolean {
		if (this._isMeasuring) return false;
		if (entry.target === this) {
			// Only the width decides what fits. The height changes with what the
			// items render, which their own reports already cover.
			if (entry.contentRect.width === this._lastWidth) return false;
			this._lastWidth = entry.contentRect.width;
			this._overflowMenu.hide();
			return true;
		}
		if (this._isBuilding) return false;
		const el = entry.target as HTMLElement;
		// An item in the overflow menu has no width to speak of. It is the
		// hiding that took it away, not the content, so it says nothing about
		// whether the layout should change.
		if (el.hasAttribute('hidden')) return false;
		const width = entry.contentRect.width;
		if (Math.abs((this._lastChildWidths.get(el) ?? -1) - width) < 0.5) return false;
		this._lastChildWidths.set(el, width);
		return true;
	}

	override firstUpdated(): void {
		this._syncHosts();
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('size') || changedProperties.has('showItemLabels')) {
			this._syncHosts();
		}
		// Not for the first render: the children are only known once they are
		// built, which measures anyway.
		if (this._built && (
			changedProperties.has('_startChildren') ||
			changedProperties.has('_centerChildren') ||
			changedProperties.has('_endChildren')
		)) {
			this.updateComplete.then(() => this._scheduleMeasure());
		}
		if (
			changedProperties.has('_overflowIds') ||
			changedProperties.has('_pinnedOverflowItems')
		) {
			this._syncMenuItems();
			this._syncMenuAnchor();
			if (!this._hasMeasured) {
				this.updateComplete.then(() => areaPass.schedule(this, this.ownerDocument));
			}
		}
	}

	private _syncMenuAnchor(): void {
		this._overflowMenu.anchorTo(this.shadowRoot?.querySelector('.toolbar__overflow-button nldd-icon-button') ?? null);
	}

	/** Fills the overflow menu: the alternatives of the items that did not fit,
	 *  the last to go first, then the toolbar's own overflow items. A clone does
	 *  not carry listeners added with addEventListener; its `select` is sent on
	 *  to the original (see utilities/overflow-menu.ts). */
	private _syncMenuItems(): void {
		const overflowed = [...this._getPrioritizedItems()].reverse()
			.filter(child => this._overflowIds.has(child.id))
			.flatMap(child => child.overflowItems);
		this._overflowMenu.mirror([...overflowed, ...this._pinnedOverflowItems]);
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
					host.style.setProperty('--_toolbar-item-min-width', child.minWidth);
				} else {
					host.style.removeProperty('--_toolbar-item-min-width');
				}
				if (child.isFluid && child.width) {
					host.style.setProperty('--_toolbar-item-width', child.width);
				} else {
					host.style.removeProperty('--_toolbar-item-width');
				}
				if (child.isFluid && child.maxWidth) {
					host.style.setProperty('--_toolbar-item-max-width', child.maxWidth);
				} else {
					host.style.removeProperty('--_toolbar-item-max-width');
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

	private _getPrioritizedItems(): OverflowItem[] {
		this._prioritizedItemsCache ??= overflowOrder(this._startChildren, this._centerChildren, this._endChildren);
		return this._prioritizedItemsCache;
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

	/** Also what the size observer compares with: this measurement has seen
	 *  these widths, so a report of the same width needs no new one. Items
	 *  have no padding or border, so their box is their content box. */
	private _measureItemWidths(): void {
		this._allHostChildren().forEach(child => {
			if (child.type === 'item' || child.type === 'title') {
				const host = child.element as HTMLElement;
				const width = host.getBoundingClientRect().width;
				this._itemWidths.set(child.id, width);
				if (!host.hidden) this._lastChildWidths.set(host, width);
			}
		});
	}

	/**
	 * Publishes how wide each area is, for the spacers that center the center.
	 * Reads everything first and writes after, so toolbars side by side lay
	 * out once (see runSteps).
	 * @internal
	 */
	*_areaSteps(): Steps {
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

		// Route to the centered center-fill layout whenever nothing is actually
		// rendered in start/end — measured by real rendering, not child presence,
		// so a consumer-hidden (display:none) back button doesn't strand a centered
		// title at the left (it would otherwise keep centerOnly false and fall into
		// the spacer path, where startWidth===0 && endWidth===0 suppresses both
		// balancing spacers). An item the toolbar moved into the overflow menu
		// still counts: switching layout then changes what fits, so the next
		// measurement brings it back, and the two layouts take turns forever.
		const centerOnly = this._isCenterOnly();
		const rendered = this._allHostChildren().filter(c =>
			!this._overflowIds.has(c.id) && (c.element as HTMLElement).getClientRects().length > 0
		);

		yield 'write';

		this.style.setProperty('--_toolbar-overflow-button-width', `${overflowButtonWidth}px`);

		const startWidth = areaWidth(this._startChildren, this._overflowIds, this._itemWidths, itemGap);
		const centerWidth = areaWidth(this._centerChildren, this._overflowIds, this._itemWidths, itemGap);
		const endWidth = areaWidth(this._endChildren, this._overflowIds, this._itemWidths, itemGap);

		this.style.setProperty('--_toolbar-start-width', `${startWidth}px`);
		this.style.setProperty('--_toolbar-center-width', `${centerWidth}px`);
		this.style.setProperty('--_toolbar-end-width', `${endWidth}px`);

		// The spacer basis subtracts a gap to account for the flex gap between a
		// side area and its spacer. That gap only exists when the area is
		// non-empty; with an empty start (or end) the spacer is the first (or
		// last) item and there is no such gap, so drop the subtraction to 0 —
		// otherwise the center is pulled off-center by one gap once the opposite
		// side gains items.
		this.style.setProperty('--_toolbar-left-spacer-gap', startWidth > 0 ? `${itemGap}px` : '0px');
		this.style.setProperty('--_toolbar-right-spacer-gap', endWidth > 0 ? `${itemGap}px` : '0px');

		const { leftZero, rightZero } = spacerZeros(
			hostWidth, itemGap, overflowButtonWidth, startWidth, centerWidth, endWidth
		);
		if (leftZero !== this._leftSpacerZero) this._leftSpacerZero = leftZero;
		if (rightZero !== this._rightSpacerZero) this._rightSpacerZero = rightZero;

		if (centerOnly !== this._centerOnly) this._centerOnly = centerOnly;

		const soloFluid = fillsRowAlone(rendered);
		if (soloFluid !== this._soloFluid) this._soloFluid = soloFluid;
	}

	/** Whether only the center has anything in it: nothing rendered at the
	 *  start or end, and nothing moved from there into the overflow menu. One
	 *  definition for measuring and for the layout it picks. */
	private _isCenterOnly(): boolean {
		return !this._hasPresentChild(this._startChildren)
			&& !this._hasPresentChild(this._endChildren)
			&& this._centerChildren.length > 0;
	}

	/** Whether any child in the list is actually rendered. getClientRects() is
	 * empty for a `display:none` element (consumer-hidden or toolbar-hidden via
	 * `[hidden]`), so this counts real on-screen presence, not mere DOM presence. */
	private _hasRenderedChild(children: ToolbarChild[]): boolean {
		return children.some(c => (c.element as HTMLElement).getClientRects().length > 0);
	}

	/** Rendered, or moved into the overflow menu by the toolbar itself. */
	private _hasPresentChild(children: ToolbarChild[]): boolean {
		return children.some(c => this._overflowIds.has(c.id)) || this._hasRenderedChild(children);
	}

	/** Measures this toolbar now, by itself. */
	private _measureAndUpdate(): void {
		measurePass.cancel(this);
		runSteps([this._measureSteps()]);
	}

	/**
	 * Decides what fits, as steps that read or write (see runSteps).
	 * @internal
	 */
	*_measureSteps(): Steps {
		if (this._isMeasuring) return;
		const itemsEl = this.shadowRoot?.querySelector('.toolbar__items') as HTMLElement | null;
		if (!itemsEl) return;

		this._isMeasuring = true;
		try {
			const hostWidth = this.getBoundingClientRect().width;
			// The width this measurement fits the items in; a report of the same
			// width from the size observer is no resize. With a padding the two
			// differ, and that only costs a measurement more.
			this._lastWidth = hostWidth;
			yield 'write';
			this.style.setProperty('--_toolbar-width', `${hostWidth}px`);
			yield* this._overflowSteps(itemsEl);
			this._hasMeasured = true;
		} finally {
			this._isMeasuring = false;
		}
	}

	/** Starts in the write phase; ends in the read phase. */
	private *_overflowSteps(itemsEl: HTMLElement): Steps {
		const overflowButtonEl = this.shadowRoot?.querySelector('.toolbar__overflow-button') as HTMLElement | null;
		const allChildren = this._allHostChildren();
		const itemChildren = itemsOf(allChildren);
		const titleChildren = allChildren.filter(
			(c): c is Extract<ToolbarChild, { type: 'title' }> => c.type === 'title'
		);

		// Show all items, and read what a control with its own overflow wants
		// (see _syncShrinkable) with everything shown.
		const controls = new Map<HTMLElement, ShrinkableControl>();
		itemChildren.forEach(child => {
			const host = child.element as HTMLElement;
			host.hidden = false;
			host.removeAttribute('shrunk');
			const control = shrinkableControlOf(host);
			if (control) controls.set(host, control);
		});
		if (controls.size) {
			controls.forEach(control => control._setMeasuring?.(true));
			yield 'read';
			const widths = new Map([...controls].map(([host, control]) => [host, control._toolbarWidths()]));
			yield 'write';
			controls.forEach(control => control._setMeasuring?.(false));
			itemChildren.forEach(child => this._syncShrinkable(child.element as HTMLElement, widths.get(child.element as HTMLElement) ?? null));
		} else {
			itemChildren.forEach(child => this._syncShrinkable(child.element as HTMLElement, null));
		}

		// Reset solo-fluid to fluid with min-width restored.
		itemChildren.forEach(child => {
			const host = child.element as HTMLElement;
			if (host.hasAttribute('solo-fluid')) {
				host.removeAttribute('solo-fluid');
				host.toggleAttribute('fluid', child.isFluid);
				if (child.isFluid && child.minWidth) {
					host.style.setProperty('--_toolbar-item-min-width', child.minWidth);
				}
			}
		});
		titleChildren.forEach(child => {
			const host = child.element as HTMLElement;
			host.removeAttribute('solo-fluid');
			host.style.removeProperty('min-width');
		});

		if (this._pinnedOverflowItems.length > 0) {
			overflowButtonEl?.classList.remove('is-hidden');
		} else {
			overflowButtonEl?.classList.add('is-hidden');
		}
		yield 'read';

		const centerOnly = this._isCenterOnly();

		const isOverflowing = () => itemsEl.scrollWidth > itemsEl.clientWidth + 1;

		if (!isOverflowing()) {
			if (this._overflowIds.size > 0) {
				this._overflowIds = new Set();
			}
			yield* this._promoteSoloFluidSteps(itemsEl, itemChildren, titleChildren, centerOnly);
			this._measureItemWidths();
			yield* this._areaSteps();
			return;
		}

		yield 'write';
		overflowButtonEl?.classList.remove('is-hidden');
		yield 'read';

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

			// An item whose control overflows by itself narrows down first, and
			// only goes into the menu when even that is not enough.
			const shrinkable = group
				.map(c => c.element as HTMLElement)
				.filter(host => host.hasAttribute('shrinkable'));
			if (shrinkable.length > 0) {
				yield 'write';
				shrinkable.forEach(host => host.toggleAttribute('shrunk', true));
				yield 'read';
				if (!isOverflowing()) break;
			}

			yield 'write';
			for (const child of group) {
				newOverflowIds.add(child.id);
				const host = child.element as HTMLElement;
				host.hidden = true;
				host.removeAttribute('shrunk');
			}
			yield 'read';
		}

		if (newOverflowIds.size === 0 && this._pinnedOverflowItems.length === 0) {
			yield 'write';
			overflowButtonEl?.classList.add('is-hidden');
			yield 'read';
		}

		yield* this._promoteSoloFluidSteps(itemsEl, itemChildren, titleChildren, centerOnly);

		const changed =
			newOverflowIds.size !== this._overflowIds.size ||
			[...newOverflowIds].some(id => !this._overflowIds.has(id));

		if (changed) {
			this._overflowIds = newOverflowIds;
		}

		this._measureItemWidths();
		yield* this._areaSteps();
	}

	/**
	 * Gives an item whose control overflows by itself (nldd-tab-bar) the width
	 * that control wants with everything shown, and remembers how narrow it can
	 * get. Read on every measurement, because the control's content can change.
	 * Writes only: the widths were read before, for every toolbar in the pass.
	 */
	private _syncShrinkable(host: HTMLElement, widths: ToolbarWidths | null): void {
		host.toggleAttribute('shrinkable', Boolean(widths));
		if (widths) {
			host.style.setProperty('--_toolbar-item-preferred-width', `${widths.preferred}px`);
			host.style.setProperty('--_toolbar-item-shrunk-min-width', `${widths.minimum}px`);
		} else {
			host.style.removeProperty('--_toolbar-item-preferred-width');
			host.style.removeProperty('--_toolbar-item-shrunk-min-width');
		}
	}

	/**
	 * Promotes a lone remaining fluid item (or a lone title when no items are
	 * visible) to the solo-fluid state so it grows to fill the row. In
	 * center-only mode the center-fill wrapper already grows the items, so item
	 * promotion is skipped there (matching the previous template behavior).
	 */
	/**
	 * Promotes a lone remaining fluid item (or a lone title when no items are
	 * visible) to the solo-fluid state so it grows to fill the row. In
	 * center-only mode the center-fill wrapper already grows the items, so item
	 * promotion is skipped there (matching the previous template behavior).
	 * Starts and ends in the read phase.
	 */
	private *_promoteSoloFluidSteps(
		itemsEl: HTMLElement,
		itemChildren: OverflowItem[],
		titleChildren: Extract<ToolbarChild, { type: 'title' }>[],
		centerOnly: boolean,
	): Steps {
		// Real rendering, not the `hidden` property: a consumer-hidden
		// (display:none) start/end item must not count as a "remaining visible"
		// item, or it blocks promoting a lone title to solo-fluid (which is what
		// lets align="center" actually center it). Toolbar-hidden items are
		// display:none too, so this stays equivalent for the overflow flow.
		const remainingVisible = itemChildren.filter(c => (c.element as HTMLElement).getClientRects().length > 0);
		if (!centerOnly && remainingVisible.length === 1 && (remainingVisible[0].element as HTMLElement).hasAttribute('fluid')) {
			yield 'write';
			const host = remainingVisible[0].element as HTMLElement;
			host.removeAttribute('fluid');
			host.setAttribute('solo-fluid', '');
			host.style.removeProperty('--_toolbar-item-min-width');
			yield 'read';
		}

		const remainingTitles = titleChildren.filter(c => !(c.element as HTMLElement).hidden);
		if (remainingVisible.length === 0 && remainingTitles.length === 1) {
			yield 'write';
			const host = remainingTitles[0].element as HTMLElement;
			host.setAttribute('solo-fluid', '');
			host.style.setProperty('min-width', '0px');
			yield 'read';
		}

		// A title holds its own width while items can still move into the menu.
		// When nothing else can go and the row still does not fit, it gives way.
		if (itemsEl.scrollWidth > itemsEl.clientWidth + 1) {
			yield 'write';
			remainingTitles.forEach(c => (c.element as HTMLElement).style.setProperty('min-width', '0px'));
			yield 'read';
		}
	}

	private _buildChildrenForSlot(slotName: string): ToolbarChild[] {
		return Array.from(this.children)
			.filter(el => el.getAttribute('slot') === slotName)
			.map(el => {
				const tag = el.tagName.toLowerCase();

				if (tag === 'nldd-toolbar-title') {
					return { type: 'title', element: el, id: this._getId(el) } as ToolbarChild;
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

	/** @internal */
	_buildChildren(): void {
		if (this._isBuilding) return;
		this._isBuilding = true;

		this._observer?.disconnect();

		this._startChildren = this._buildChildrenForSlot('start');
		this._centerChildren = this._buildChildrenForSlot('center');
		this._endChildren = this._buildChildrenForSlot('end');
		this._buildPinnedOverflowItems();
		this._built = true;
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
	 * The observer is shared by every toolbar; what a report means for this one
	 * is decided in _resized.
	 */
	private _watchChildSizes(): void {
		this._sizedChildren.forEach(el => unobserveSize(el, this));
		this._sizedChildren = new Set(this._hostChildElements());
		this._lastChildWidths = new WeakMap();
		this._sizedChildren.forEach(el => observeSize(el, this));
	}

	/** The elements this toolbar lays out: its items and its title. */
	private _hostChildElements(): HTMLElement[] {
		return Array.from(this.children).filter((el): el is HTMLElement => {
			const tag = el.tagName.toLowerCase();
			return tag === 'nldd-toolbar-item' || tag === 'nldd-toolbar-title';
		});
	}

	override render() {
		// Pre-measurement fallback: before the first _areaSteps there is no
		// rendering to read, so fall back to mere DOM presence. _soloFluid takes
		// over from the first measurement on.
		const isSoloFluid = this._soloFluid
			|| fillsRowAlone(this._allHostChildren().filter(c => !this._overflowIds.has(c.id)));

		return template(
			this,
			this._centerChildren.length > 0,
			this._leftSpacerZero,
			this._rightSpacerZero,
			isSoloFluid,
			this._pinnedOverflowItems.length > 0 || this._overflowIds.size > 0,
			this._overflowMenu.open,
			this.accessibleLabel,
			this._centerOnly,
			(key) => this._t(key),
		);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-toolbar': NLDDToolbar;
		'nldd-toolbar-item': NLDDToolbarItem;
		'nldd-toolbar-title': NLDDToolbarTitle;
	}
}
