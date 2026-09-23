/**
 * Nederlandse Digitale Dienst Container Component (Lit + TypeScript)
 *
 * A simple layout primitive: pick a layout mode, give it a gap, optionally
 * align contents, and add padding. Padding can be set for all sides, per
 * axis (inline/block), or per individual side. Specificity: per side >
 * per axis > all sides.
 *
 * The container owns the space around and between its children; use
 * `nldd-spacer` only for a one-off gap between two different things. A block
 * that is placed in more than one context gets no padding of its own: whoever
 * places it wraps it in a container, so the inset is not counted twice.
 *
 * Responsive padding and gap have sm/md/lg variants. Each variant emits both
 * an @media (viewport) and @container (layout-container) query. When inside a
 * layout-container the @container query wins; otherwise the @media query
 * provides the viewport-based fallback.
 *
 * Layout modes:
 *  - `stack` (default): block items, stacked vertically. The "what you
 *   expect from DOM flow" mode.
 *  - `row`: flex row, no wrapping. Items shrink or overflow.
 *  - `wrap`: flex row, items wrap to new lines.
 *  - `grid`: CSS grid, auto-fit columns at min 280px wide.
 *  - `columns`: CSS multi-column flow, 280px minimum column width,
 *   items don't split across column breaks.
 *
 * Alignment maps to the layout's natural axis:
 *  - `stack`: vertical = main-axis (justify-content), horizontal = cross-axis (align-items)
 *  - `row` / `wrap`: horizontal = main-axis, vertical = cross-axis
 *  - `grid`: horizontal = justify-items, vertical = align-items (per cell)
 *  - `columns`: alignment props have no effect (CSS multicol doesn't expose alignment)
 *
 * Item order is set per-child via attributes on the slotted children
 * themselves: `<child order="3">` for a fixed position, or `<child sm-order="N">`
 * / `<child md-order="N">` / `<child lg-order="N">` to override per breakpoint
 * (resolved against THIS container's width via @container queries, same scope
 * as the responsive padding/gap). The container observes slot changes and
 * child attribute mutations and bridges these to `--_slot-order` /
 * `--_slot-sm-order` / etc. custom properties on each child's inline style,
 * which the container's CSS then reads via `::slotted(*)` inside @container
 * queries. Cascade: `sm-order` falls back to `order` falls back to `0` at sm
 * (and analogously for md/lg). No-op for `layout="columns"` (CSS multicol has
 * no per-item ordering hook).
 *
 * The `column-count` attribute (1-8) forces an exact column count for
 * `layout="grid"` (overrides auto-fit) and `layout="columns"` (overrides
 * the natural width-driven count). `sm-column-count` / `md-column-count`
 * / `lg-column-count` resolve against this container's OWN width via
 * an `@container (...)` query on the host — not against the viewport.
 * That lets a footer in a narrow sidebar choose its own column count
 * independent of the surrounding page width.
 *
 * `layout="lanes"` packs items into balanced columns using native CSS grid
 * lanes where supported, falling back to CSS multicol (column-order) elsewhere.
 * CSS-only, no JS. Honours `gap` on both axes and `column-count`. Note that
 * nldd-collection's lanes falls back to its own grid rather than to multicol:
 * that component pages, and multicol redistributes the whole set every time
 * load-more adds to it.
 *
 * @element nldd-container
 *
 * @attr {string} layout - 'stack' | 'row' | 'wrap' | 'grid' | 'columns' | 'lanes' (default: 'stack')
 * @attr {number} column-count - Force N columns (1-8) for layout=grid/columns/lanes
 * @attr {number} sm-column-count - Column count when this container is sm-wide
 * @attr {number} md-column-count - Column count when this container is md-wide
 * @attr {number} lg-column-count - Column count when this container is lg-wide
 * @attr {string} width - 'full' (default, fills the parent) | 'fit-content' | a CSS length (e.g. '480px'). A container narrower than its parent stays where its parent puts it; use the parent's horizontal-alignment to move it.
 * @attr {string} min-width - Minimum width as a CSS length (e.g. '280px')
 * @attr {string} max-width - Maximum width as a CSS length (e.g. '480px')
 * @attr {string} gap - Gap between children
 * @attr {string} sm-gap - Gap at sm breakpoint
 * @attr {string} md-gap - Gap at md breakpoint
 * @attr {string} lg-gap - Gap at lg breakpoint
 * @attr {string} padding - Padding for all sides
 * @attr {string} padding-inline - Padding for left and right
 * @attr {string} padding-block - Padding for top and bottom
 * @attr {string} padding-top - Padding top
 * @attr {string} padding-right - Padding right
 * @attr {string} padding-bottom - Padding bottom
 * @attr {string} padding-left - Padding left
 * Breakpoints for the sm/md/lg padding attributes below: sm is up to 640px,
 * md is 641px to 1007px, lg is 1008px and up. Each is emitted as both an
 * @media (viewport) and an @container layout-container query; inside a
 * layout-container the container query wins, otherwise the viewport query
 * applies. An unset variant falls back to the matching base padding value.
 *
 * @attr {string} sm-padding - Padding for all sides at sm
 * @attr {string} sm-padding-inline - Padding left and right at sm
 * @attr {string} sm-padding-block - Padding top and bottom at sm
 * @attr {string} sm-padding-top - Padding top at sm
 * @attr {string} sm-padding-right - Padding right at sm
 * @attr {string} sm-padding-bottom - Padding bottom at sm
 * @attr {string} sm-padding-left - Padding left at sm
 * @attr {string} md-padding - Padding for all sides at md
 * @attr {string} md-padding-inline - Padding left and right at md
 * @attr {string} md-padding-block - Padding top and bottom at md
 * @attr {string} md-padding-top - Padding top at md
 * @attr {string} md-padding-right - Padding right at md
 * @attr {string} md-padding-bottom - Padding bottom at md
 * @attr {string} md-padding-left - Padding left at md
 * @attr {string} lg-padding - Padding for all sides at lg
 * @attr {string} lg-padding-inline - Padding left and right at lg
 * @attr {string} lg-padding-block - Padding top and bottom at lg
 * @attr {string} lg-padding-top - Padding top at lg
 * @attr {string} lg-padding-right - Padding right at lg
 * @attr {string} lg-padding-bottom - Padding bottom at lg
 * @attr {string} lg-padding-left - Padding left at lg
 * @attr {string} horizontal-alignment - 'left' | 'center' | 'right'
 * @attr {string} vertical-alignment - 'top' | 'center' | 'bottom'
 *
 * @slot - Container content
 */
import { LitElement, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { containerStyles } from './container.styles.js';
import { containerTemplate } from './container.template.js';
import { spacingToValue, type SpacingSize } from '../../../utilities/spacing-scale.js';

/** The scale lives in one place now; this alias keeps the local reads short. */
type PaddingSize = SpacingSize;

type Layout = 'stack' | 'row' | 'wrap' | 'grid' | 'columns' | 'lanes';
type ColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type HorizontalAlignment = 'left' | 'center' | 'right';
type VerticalAlignment = 'top' | 'center' | 'bottom';
type Scope = '' | 'sm' | 'md' | 'lg';

const HORIZONTAL_TO_FLEX: Record<HorizontalAlignment, string> = {
	left: 'flex-start',
	center: 'center',
	right: 'flex-end',
};

const VERTICAL_TO_FLEX: Record<VerticalAlignment, string> = {
	top: 'flex-start',
	center: 'center',
	bottom: 'flex-end',
};

const ORDER_ATTRS = ['order', 'sm-order', 'md-order', 'lg-order'] as const;

/** A step as its token. `attribute` only names the offender in a dev warning,
 *  so it has to be the attribute the value was written on: with a dozen padding
 *  attributes, "padding/gap is not a step" does not say which one to fix. */
function sizeToValue(size: PaddingSize | undefined, attribute: string): string | null {
	return spacingToValue(size, 'nldd-container', attribute);
}

@customElement('nldd-container')
export class NLDDContainer extends LitElement {
	static override styles = containerStyles;

	// No default value so a plain <nldd-container> doesn't carry a
	// reflected layout="stack" attribute. Absence resolves to stack in the
	// styles (the unconditional :host default) and in
	// writeCustomProperties (the horizontal-axis check matches 'row'/'wrap'
	// specifically).
	@property({ type: String, reflect: true })
	layout?: Layout;

	// Explicit column count for layout="grid" (overrides auto-fit) and for
	// layout="columns" (overrides the natural width-driven count). 1-8.
	// Per-viewport variants resolve against this container's OWN width via
	// @container queries — sm/md/lg refer to the container's inline-size,
	// not the viewport.
	@property({ type: Number, reflect: true, attribute: 'column-count' })
	columnCount?: ColumnCount;

	@property({ type: Number, reflect: true, attribute: 'sm-column-count' })
	smColumnCount?: ColumnCount;

	@property({ type: Number, reflect: true, attribute: 'md-column-count' })
	mdColumnCount?: ColumnCount;

	@property({ type: Number, reflect: true, attribute: 'lg-column-count' })
	lgColumnCount?: ColumnCount;

	@property({ type: String, reflect: true })
	width = '';

	@property({ type: String, reflect: true, attribute: 'min-width' })
	minWidth = '';

	@property({ type: String, reflect: true, attribute: 'max-width' })
	maxWidth = '';

	@property({ type: String, reflect: true })
	gap: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'sm-gap' })
	smGap: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'md-gap' })
	mdGap: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'lg-gap' })
	lgGap: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true })
	padding: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'padding-inline' })
	paddingInline: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'padding-block' })
	paddingBlock: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'padding-top' })
	paddingTop: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'padding-right' })
	paddingRight: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'padding-bottom' })
	paddingBottom: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'padding-left' })
	paddingLeft: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'sm-padding' })
	smPadding: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'sm-padding-inline' })
	smPaddingInline: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'sm-padding-block' })
	smPaddingBlock: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'sm-padding-top' })
	smPaddingTop: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'sm-padding-right' })
	smPaddingRight: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'sm-padding-bottom' })
	smPaddingBottom: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'sm-padding-left' })
	smPaddingLeft: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'md-padding' })
	mdPadding: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'md-padding-inline' })
	mdPaddingInline: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'md-padding-block' })
	mdPaddingBlock: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'md-padding-top' })
	mdPaddingTop: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'md-padding-right' })
	mdPaddingRight: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'md-padding-bottom' })
	mdPaddingBottom: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'md-padding-left' })
	mdPaddingLeft: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'lg-padding' })
	lgPadding: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'lg-padding-inline' })
	lgPaddingInline: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'lg-padding-block' })
	lgPaddingBlock: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'lg-padding-top' })
	lgPaddingTop: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'lg-padding-right' })
	lgPaddingRight: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'lg-padding-bottom' })
	lgPaddingBottom: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'lg-padding-left' })
	lgPaddingLeft: PaddingSize | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'horizontal-alignment' })
	horizontalAlignment: HorizontalAlignment | undefined = undefined;

	@property({ type: String, reflect: true, attribute: 'vertical-alignment' })
	verticalAlignment: VerticalAlignment | undefined = undefined;

	override updated(_changed: PropertyValues): void {
		this.writeCustomProperties();
		this.writeDimensionProperties();
	}

	/** A length goes into a custom property; the keywords are selectors in the
	 *  stylesheet. An unusable length is cleared, so the host falls back to the
	 *  default rule instead of getting stuck on a selector that matches nothing. */
	private writeDimensionProperties(): void {
		const width = this.width;
		const isKeyword = width === 'full' || width === 'fit-content';
		const isLength = !!width && !isKeyword && CSS.supports('width', width);
		if (isLength) this.style.setProperty('--_width', width);
		else this.style.removeProperty('--_width');
		if (width && !isKeyword && !isLength) this.width = '';

		if (this.minWidth) this.style.setProperty('--_min-width', this.minWidth);
		else this.style.removeProperty('--_min-width');

		if (this.maxWidth) this.style.setProperty('--_max-width', this.maxWidth);
		else this.style.removeProperty('--_max-width');
	}

	private writeCustomProperties(): void {
		const setProp = (name: string, value: string | null) => {
			if (value === null) this.style.removeProperty(name);
			else this.style.setProperty(name, value);
		};

		// Alignment maps to a different CSS property depending on the
		// layout's axes:
		//  - Row/wrap: horizontal = justify-content (main), vertical = align-items (cross)
		//  - Stack (flex column): horizontal = align-items (cross), vertical = justify-content (main)
		//  - Grid: per-cell — horizontal = justify-items, vertical = align-items
		// We set --_justify-content/--_justify-items/--_align-items
		// independently; the .container picks up whichever applies to its
		// current display. Columns layout has no alignment hooks.
		const horizontal = this.horizontalAlignment ? HORIZONTAL_TO_FLEX[this.horizontalAlignment] : null;
		const vertical = this.verticalAlignment ? VERTICAL_TO_FLEX[this.verticalAlignment] : null;
		const isFlexRow = this.layout === 'row' || this.layout === 'wrap';
		const isGrid = this.layout === 'grid';
		// Multicol/lanes have no alignment hooks; null the props so native
		// lanes (a grid) does not inherit the flex-column mapping below.
		const isMulticol = this.layout === 'columns' || this.layout === 'lanes';
		if (isMulticol) {
			setProp('--_justify-content', null);
			setProp('--_justify-items', null);
			setProp('--_align-items', null);
		} else if (isGrid) {
			setProp('--_justify-items', horizontal);
			setProp('--_justify-content', horizontal);
			setProp('--_align-items', vertical);
		} else if (isFlexRow) {
			setProp('--_justify-content', horizontal);
			setProp('--_align-items', vertical);
			setProp('--_justify-items', null);
		} else {
			setProp('--_justify-content', vertical);
			setProp('--_align-items', horizontal);
			setProp('--_justify-items', null);
		}

		// These three are what the styles read, so a plain gap fills each
		// breakpoint the consumer left open. Writing --_gap itself would beat the
		// blocks that pick between them, being inline.
		const plainGap = sizeToValue(this.gap, 'gap');
		setProp('--_sm-gap', sizeToValue(this.smGap, 'sm-gap') ?? plainGap);
		setProp('--_md-gap', sizeToValue(this.mdGap, 'md-gap') ?? plainGap);
		setProp('--_lg-gap', sizeToValue(this.lgGap, 'lg-gap') ?? plainGap);

		for (const scope of ['', 'sm', 'md', 'lg'] as const) {
			const [top, right, bottom, left] = this.resolvePadding(scope);
			const prefix = scope ? `${scope}-` : '';
			setProp(`--_${prefix}padding-top`, sizeToValue(top?.size, top?.attribute ?? 'padding'));
			setProp(`--_${prefix}padding-right`, sizeToValue(right?.size, right?.attribute ?? 'padding'));
			setProp(`--_${prefix}padding-bottom`, sizeToValue(bottom?.size, bottom?.attribute ?? 'padding'));
			setProp(`--_${prefix}padding-left`, sizeToValue(left?.size, left?.attribute ?? 'padding'));
		}
	}

	/** The four sides, each with the attribute it came from: `padding-top` wins
	 *  over `padding-block`, which wins over `padding`, and a warning about a bad
	 *  value has to name the one that was actually written. */
	private resolvePadding(scope: Scope): ({ size: PaddingSize; attribute: string } | undefined)[] {
		const get = (key: string) => {
			const prop = scope ? `${scope}${key}` as keyof this : key.charAt(0).toLowerCase() + key.slice(1) as keyof this;
			const size = this[prop] as PaddingSize | undefined;
			if (size === undefined) return undefined;
			const name = key.replace(/([A-Z])/g, (match, letter: string, index: number) => (index ? '-' : '') + letter.toLowerCase());
			return { size, attribute: scope ? `${scope}-${name}` : name };
		};
		const all = get('Padding');
		const inline = get('PaddingInline');
		const block = get('PaddingBlock');
		const top = get('PaddingTop') ?? block ?? all;
		const right = get('PaddingRight') ?? inline ?? all;
		const bottom = get('PaddingBottom') ?? block ?? all;
		const left = get('PaddingLeft') ?? inline ?? all;
		return [top, right, bottom, left];
	}

	// Bridge: read order/sm-order/md-order/lg-order attributes on each slotted
	// child and write them as --_slot-{attr} inline custom props on that child.
	// The container's @container queries pick the right one per breakpoint via
	// var() fallback. Inline style cannot itself host @container queries, so
	// this bridge exists to expose declarative attrs while letting CSS do the
	// breakpoint switching natively (no ResizeObserver).
	private _childObserver?: MutationObserver;

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._childObserver?.disconnect();
		this._childObserver = undefined;
	}

	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		this._childObserver?.disconnect();
		this._childObserver = new MutationObserver(muts => {
			for (const m of muts) {
				if (m.target instanceof HTMLElement) this._applyOrderProps(m.target);
			}
		});
		for (const el of slot.assignedElements()) {
			if (!(el instanceof HTMLElement)) continue;
			this._applyOrderProps(el);
			this._childObserver.observe(el, { attributes: true, attributeFilter: [...ORDER_ATTRS] });
		}
	};

	private _applyOrderProps(el: HTMLElement): void {
		for (const attr of ORDER_ATTRS) {
			const v = el.getAttribute(attr);
			const prop = `--_slot-${attr}`;
			if (v !== null) el.style.setProperty(prop, v);
			else el.style.removeProperty(prop);
		}
	}

	override render() {
		return containerTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-container': NLDDContainer;
	}
}
