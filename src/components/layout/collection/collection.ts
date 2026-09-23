/**
 * Nederlandse Digitale Dienst Collection Component (Lit + TypeScript)
 *
 * A container for displaying collections of items.
 * Supports grid, stack, lanes and horizontal scroll layouts.
 *
 * Use it for a set of equal blocks, usually `nldd-card`s, instead of a CSS
 * grid of your own: the collection sets the columns from `item-width` and the
 * available width, and the gap per breakpoint.
 *
 * In grid and stack modes, items are paginated via a load-more button. In
 * horizontal scroll, the prev/next controls and the edge fade appear only when
 * the items overflow the container.
 * With `lazy-load`, the next items are automatically loaded when
 * the load-more button comes into view.
 *
 * @element nldd-collection
 *
 * @attr {string} layout - Layout mode: 'grid' | 'stack' | 'lanes' | 'horizontal-scroll' (default: 'grid')
 * @attr {string} item-width - Preferred width for each item (e.g. '280px', '20rem'). In grid and lanes layouts used as the minimum column width (columns will be at least this wide; 1fr if container allows more). In horizontal scroll used as flex-basis. Never forces horizontal overflow — the value is clamped to container width.
 * @attr {string} gap - Gap between items, as a step of the spacing scale ('0', '2', '4', '6', '8', '10', '12', '16', '20', '24', '28', '32', '40', '44', '48', '56', '64', '80', '96'). Overrides the responsive default at every breakpoint; unset keeps the default.
 * @attr {string} sm-gap - Gap at sm, overriding `gap` there
 * @attr {string} md-gap - Gap at md, overriding `gap` there
 * @attr {string} lg-gap - Gap at lg, overriding `gap` there
 * @attr {number} max-items - Number of visible items per page (default: 24)
 * @attr {object} translations - Translation overrides; unset keys fall back to Dutch. Available keys: 'components.collection.previous-action', 'components.collection.next-action', 'components.collection.load-more-action'
 * @attr {boolean} show-load-more - Show load-more button in grid/stack (default: false)
 * @attr {boolean} lazy-load - Automatically load more items when the button becomes visible
 *
 * @migration The `load-more-label` attribute has been removed.
 *            Use `translations` property instead: `.translations=${{ 'components.collection.load-more-action': 'Show more' }}`
 *
 * @slot - Default slot for collection items
 * @slot footer - Slot for custom footer content
 *
 * @fires load-more - When the load-more button is clicked
 */
import { LitElement } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { collectionStyles } from './collection.styles.js';
import { collectionTemplate } from './collection.template.js';
import { nlddCollectionTranslations } from './collection.i18n.js';
import type { NLDDCollectionTranslations } from './collection.i18n.js';
import '../../actions/button/button.js';
import '../../actions/button-bar/button-bar.js';
import '../../actions/icon-button/icon-button.js';
import '../../content/icon/icon.js';
import { spacingToValue, type SpacingSize } from '../../../utilities/spacing-scale.js';

type Layout = 'grid' | 'stack' | 'lanes' | 'horizontal-scroll';

@customElement('nldd-collection')
export class NLDDCollection extends LitElement {
	static override styles = collectionStyles;

	@property({ reflect: true, converter: reflectNonDefault<Layout>('grid') })
	layout: Layout = 'grid';

	@property({ type: String, reflect: true, attribute: 'item-width' })
	itemWidth: string | undefined;

	/** A step of the spacing scale, overriding the responsive default at every
	 *  breakpoint. Unset keeps the default. */
	@property({ type: String, reflect: true })
	gap: SpacingSize | undefined;

	@property({ type: String, reflect: true, attribute: 'sm-gap' })
	smGap: SpacingSize | undefined;

	@property({ type: String, reflect: true, attribute: 'md-gap' })
	mdGap: SpacingSize | undefined;

	@property({ type: String, reflect: true, attribute: 'lg-gap' })
	lgGap: SpacingSize | undefined;

	@property({ type: Number, attribute: 'max-items' })
	maxItems = 24;

	@property({ type: Object })
	translations: Partial<NLDDCollectionTranslations> = {};

	@property({ type: Boolean, reflect: true, attribute: 'show-load-more' })
	showLoadMore = false;

	@property({ type: Boolean, reflect: true, attribute: 'lazy-load' })
	lazyLoad = false;

	// — i18n —————————————————————————————————————————————————————————————————

	public _t(key: keyof NLDDCollectionTranslations): string {
		return this.translations[key] ?? nlddCollectionTranslations[key];
	}

	@state()
	_visibleCount = 0;

	@state()
	_totalCount = 0;

	@state()
	_atStart = true;

	@state()
	_atEnd = false;

	@state()
	_isScrollable = false;

	@state()
	_hasFooterSlot = false;

	_onFooterSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		queueMicrotask(() => { this._hasFooterSlot = slot.assignedElements().length > 0; });
	};

	@query('.collection__items')
	private _itemsEl!: HTMLElement;

	private _scrollListener = (): void => {
		const el = this._itemsEl;
		if (!el) return;
		const wasAtStart = this._atStart;
		const wasAtEnd = this._atEnd;
		this._atStart = el.scrollLeft < 1;
		this._atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
		/* Track overflow so the template can make the scroll container
		 * keyboard-focusable. Without focus, arrow-key users can't scroll
		 * a non-focusable region (WCAG 2.1.1). */
		this._isScrollable = el.scrollWidth > el.clientWidth;

		if (!wasAtStart && this._atStart) this._handOffControlFocus('previous');
		if (!wasAtEnd && this._atEnd) this._handOffControlFocus('next');
	};

	/* A keyboard user who scrolls to an end disables the control they are
	 * standing on, and a disabled control cannot hold focus: the browser drops
	 * focus to the body and the next Tab restarts at the top of the page. Hand
	 * focus to the sibling control instead — it sits right next to the one
	 * being disabled and is by definition usable at that end. */
	private _handOffControlFocus(disabling: 'previous' | 'next'): void {
		const controls = this.shadowRoot?.querySelectorAll<HTMLElement>('nldd-icon-button');
		if (!controls || controls.length < 2) return;
		const [previous, next] = controls;
		const losing = disabling === 'previous' ? previous : next;
		if (this.shadowRoot?.activeElement !== losing) return;

		const target = disabling === 'previous' ? next : previous;
		// Focus only lands once the disabled attribute has been rendered, and
		// only if the sibling did not become disabled in the same update.
		void this.updateComplete.then(() => {
			if (!(target as HTMLElement & { disabled?: boolean }).disabled) target.focus();
		});
	}

	@query('nldd-button.load-more')
	private _loadMoreBtn!: HTMLElement | null;

	private _intersectionObserver: IntersectionObserver | undefined;
	private _resizeObserver: ResizeObserver | undefined;
	private _scrollListenerAttached = false;

	override connectedCallback(): void {
		super.connectedCallback();
		this._visibleCount = this.maxItems;
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._intersectionObserver?.disconnect();
		this._teardownScrollListeners();
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('layout')) {
			this._setupScrollListeners();
		}

		if (changedProperties.has('itemWidth')) {
			if (this.itemWidth) {
				this.style.setProperty('--_item-width', this.itemWidth);
			} else {
				this.style.removeProperty('--_item-width');
			}
		}

		// The three breakpoint vars are what the styles read, so a plain gap is
		// written into each one the consumer left open. Writing --_gap itself
		// would beat the breakpoint blocks, being inline, and a gap set beside a
		// sm/md/lg one would swallow it.
		if (
			changedProperties.has('gap') ||
			changedProperties.has('smGap') ||
			changedProperties.has('mdGap') ||
			changedProperties.has('lgGap')
		) {
			const plain = spacingToValue(this.gap, 'nldd-collection', 'gap');
			const write = (name: string, size: SpacingSize | undefined, attribute: string) => {
				const value = size === undefined
					? plain
					: spacingToValue(size, 'nldd-collection', attribute) ?? plain;
				if (value === null) this.style.removeProperty(name);
				else this.style.setProperty(name, value);
			};
			write('--_sm-gap', this.smGap, 'sm-gap');
			write('--_md-gap', this.mdGap, 'md-gap');
			write('--_lg-gap', this.lgGap, 'lg-gap');
		}

		if (this.lazyLoad && this._loadMoreBtn && !this._intersectionObserver) {
			this._intersectionObserver = new IntersectionObserver(
				([entry]) => { if (entry.isIntersecting) this._loadMore(); },
				{ threshold: 0.1 }
			);
			this._intersectionObserver.observe(this._loadMoreBtn);
		} else if (!this._loadMoreBtn) {
			this._intersectionObserver?.disconnect();
			this._intersectionObserver = undefined;
		}

		// Reflect overflow state so the styles show the fade + peek space only
		// when the items actually scroll (see :host([scrollable]) in the styles).
		this.toggleAttribute('scrollable', this.layout === 'horizontal-scroll' && this._isScrollable);
	}

	private _setupScrollListeners(): void {
		this._teardownScrollListeners();

		if (this.layout === 'horizontal-scroll' && this._itemsEl) {
			this._itemsEl.addEventListener('scroll', this._scrollListener, { passive: true });
			this._resizeObserver = new ResizeObserver(() => this._scrollListener());
			this._resizeObserver.observe(this._itemsEl);
			this._scrollListenerAttached = true;
			// Compute initial overflow synchronously. The ResizeObserver only
			// fires on the next animation frame, so without this the first
			// render shows tabindex/aria-label missing until the observer
			// catches up — flaky in tests and a brief flash in real use.
			this._scrollListener();
		}
	}

	private _teardownScrollListeners(): void {
		this._itemsEl?.removeEventListener('scroll', this._scrollListener);
		this._resizeObserver?.disconnect();
		this._resizeObserver = undefined;
		this._scrollListenerAttached = false;
		this._isScrollable = false;
	}

	// The first slotchange arrives the moment the first render commits, so the
	// count is set in a microtask: state written there would otherwise schedule a
	// second update on top of the one that just finished, which Lit reports on
	// every page that holds a collection.
	_onSlotChange(e: Event): void {
		const slot = e.target as HTMLSlotElement;
		const items = slot.assignedElements() as HTMLElement[];
		queueMicrotask(() => { this._totalCount = items.length; });
		if (this.layout === 'horizontal-scroll') {
			// Adding/removing items changes the content width (scrollWidth) but not
			// the scroll container's own box, so the ResizeObserver never fires.
			// Recompute overflow here so the fade + controls react to a content
			// change right away, not only on the next resize.
			this._scrollListener();
		} else {
			this._applyVisibility(items);
		}
	}

	private _applyVisibility(items?: HTMLElement[]): void {
		const slot = this._itemsEl?.querySelector('slot') as HTMLSlotElement | null;
		const elements = items ?? (slot?.assignedElements() as HTMLElement[] ?? []);
		elements.forEach((el, i) => {
			el.hidden = i >= this._visibleCount;
		});
	}

	_loadMore(): void {
		this._visibleCount = Math.min(this._visibleCount + this.maxItems, this._totalCount);
		this._applyVisibility();
		this.dispatchEvent(new CustomEvent('load-more', { bubbles: true, composed: true }));
	}

	get _hasMore(): boolean {
		return this._visibleCount < this._totalCount;
	}

	/* Scroll to an item edge, not by a fixed distance. The last scroll position
	 * is wherever the content ends, which is rarely a whole number of items, so
	 * stepping by item + gap from there keeps that remainder forever and every
	 * item lands clipped. Snapping to the next edge in the given direction puts
	 * an item flush against the padded start again. */
	_scrollBy(direction: 1 | -1): void {
		const el = this._itemsEl;
		if (!el) return;
		const slot = el.querySelector('slot') as HTMLSlotElement | null;
		const items = (slot?.assignedElements() ?? []) as HTMLElement[];
		if (items.length === 0) return;

		// Item starts in scroll coordinates, offset by the scroll padding so a
		// target matches where scroll-snap parks the item.
		const scrollerLeft = el.getBoundingClientRect().left;
		const inset = parseFloat(getComputedStyle(el).scrollPaddingInlineStart) || 0;
		const starts = items.map(item =>
			Math.round(item.getBoundingClientRect().left - scrollerLeft + el.scrollLeft - inset),
		);

		// Sub-pixel layout means the current position is never exactly an item
		// start, so ignore edges within a pixel of where we already are.
		const epsilon = 2;
		const current = el.scrollLeft;
		const target = direction === 1
			? starts.find(start => start > current + epsilon)
			: starts.filter(start => start < current - epsilon).pop();
		if (target === undefined) return;

		el.scrollTo({ left: target, behavior: 'smooth' });
	}

	override render() {
		return collectionTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-collection': NLDDCollection;
	}
}
