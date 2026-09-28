/**
 * Nederlandse Digitale Dienst Bar Split View Component (Lit + TypeScript)
 *
 * A vertical split view with a main area and an unlimited number of bar panels.
 * Each child determines its order per breakpoint via sm-order, md-order, and lg-order.
 * Children without order attributes are sorted by DOM order.
 *
 * All bars are in normal flow at every breakpoint and stack vertically. A
 * divider is drawn only where the main pane meets an adjacent bar — directly
 * above and/or below main — at every breakpoint (including sm). Two stacked
 * bars on the same side never get a divider between them, so a toolbar and a
 * tab-bar read as one visual unit. Consumers never manage dividers themselves.
 *
 * ## Slot names
 * Give each bar a unique slot name (e.g. slot="toolbar", slot="status-bar").
 * Use slot="bar-1", slot="bar-2" if no meaningful name applies.
 * The main panel always uses slot="main".
 *
 * ## Background color
 * Sets --context-parent-background-color, which cascades to all descendants.
 *
 * @element nldd-bar-split-view
 *
 * @attr {'inherit'|'base'|'tinted'} background - Background color variant (default: inherit)
 *
 * Responsive visibility and order per child (direct children of nldd-bar-split-view):
 * @attr {'sm'|'md'|'lg'} above - Show this panel from this breakpoint and larger
 * @attr {'sm'|'md'|'lg'} below - Show this panel up to and including this breakpoint
 * @attr {'sm'|'md'|'lg'} only - Show this panel only at this breakpoint
 * @attr {number} sm-order - Position of this panel at sm (lower comes first)
 * @attr {number} md-order - Position of this panel at md (lower comes first)
 * @attr {number} lg-order - Position of this panel at lg (lower comes first)
 *
 * @slot main - Central panel for primary content
 * @slot * - Any other unique slot name creates a bar panel
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { barSplitViewStyles } from './bar-split-view.styles.js';
import { barSplitViewTemplate } from './bar-split-view.template.js';
import { breakpoints } from '../../../../assets/styles/breakpoints.js';
import { ScrollModeController } from '../../../../utilities/scroll-mode-controller.js';

const smMaxPx = parseInt(breakpoints.smMax);
const mdMaxPx = parseInt(breakpoints.mdMax);

export type Breakpoint = 'sm' | 'md' | 'lg';
type BreakpointOrUnmeasured = Breakpoint | null;

@customElement('nldd-bar-split-view')
export class NLDDBarSplitView extends LitElement {
	static override styles = barSplitViewStyles;

	// Reflects --context-scroll-mode to [data-scroll]; on change, re-computes the
	// sticky-bar offsets below.
	private _scrollMode = new ScrollModeController(this, () => this._updateInsets());

	@property({ type: String, reflect: true })
	background: 'inherit' | 'base' | 'tinted' = 'inherit';

	// null until connectedCallback measures the viewport. Before measurement the
	// template falls back to DOM order with dividers — no breakpoint-specific
	// sorting is applied.
	@state()
	_currentBreakpoint: BreakpointOrUnmeasured = null;

	private _observer: MutationObserver | null = null;
	private _resizeObserver: ResizeObserver | null = null;

	override connectedCallback() {
		super.connectedCallback();

		this._currentBreakpoint = this._getBreakpoint(this.getBoundingClientRect().width);

		this._observer = new MutationObserver(() => this.requestUpdate());
		this._observer.observe(this, { childList: true, attributes: true, attributeFilter: ['above', 'below', 'only', 'sm-order', 'md-order', 'lg-order'], subtree: false });

		this._resizeObserver = new ResizeObserver(() => {
			const bp = this._getBreakpoint(this.getBoundingClientRect().width);
			if (bp !== this._currentBreakpoint) {
				this._currentBreakpoint = bp;
				this.requestUpdate();
			}
			// Bar heights (and thus the published insets) can change on any
			// resize; in root mode the flowing host resizes with them.
			this._updateInsets();
		});
		this._resizeObserver.observe(this);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._observer?.disconnect();
		this._observer = null;
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;
	}

	private _getBreakpoint(width: number): Breakpoint {
		if (width <= smMaxPx) return 'sm';
		if (width <= mdMaxPx) return 'md';
		return 'lg';
	}

	private _isChildVisible(el: Element): boolean {
		if (this._currentBreakpoint === null) return true;
		const bp = this._currentBreakpoint;
		const order: Breakpoint[] = ['sm', 'md', 'lg'];
		const bpIndex = order.indexOf(bp);

		const only = el.getAttribute('only') as Breakpoint | null;
		if (only) return bp === only;

		const above = el.getAttribute('above') as Breakpoint | null;
		if (above) return bpIndex >= order.indexOf(above);

		const below = el.getAttribute('below') as Breakpoint | null;
		if (below) return bpIndex <= order.indexOf(below);

		return true;
	}

	_getSortedChildren(): Element[] {
		const all = Array.from(this.children).filter(el => {
			if (!el.slot) {
				if (import.meta.env?.DEV) {
					console.warn('<nldd-bar-split-view>: every child must have a slot attribute (e.g. slot="toolbar", slot="status-bar", or slot="bar-1" if no meaningful name applies). Child without slot attribute is ignored:', el);
				}
				return false;
			}
			return this._isChildVisible(el);
		});
		if (this._currentBreakpoint === null) return all;
		const attr = `${this._currentBreakpoint}-order`;
		return [...all].sort((a, b) => {
			const aVal = a.hasAttribute(attr) ? parseInt(a.getAttribute(attr)!) : all.indexOf(a);
			const bVal = b.hasAttribute(attr) ? parseInt(b.getAttribute(attr)!) : all.indexOf(b);
			return aVal - bVal;
		});
	}

	override updated(): void {
		// Re-apply after every render — the bar wrappers are re-created, so their
		// inline sticky insets would otherwise be lost.
		this._updateInsets();
	}

	// In root-scroll mode the bars stack: each top bar sticks
	// below the ones above it, each bottom bar above the ones below it, and the
	// cumulative heights are published as --context-inset-top/bottom on the main
	// so a descendant nldd-page's sticky header/footer stack against them.
	private _updateInsets = (): void => {
		const block = this.shadowRoot?.querySelector<HTMLElement>('.bar-split-view') ?? null;
		const main = block?.querySelector<HTMLElement>('.bar-split-view__main') ?? null;
		if (!block || !main) return;
		const children = Array.from(block.children) as HTMLElement[];
		const mainIndex = children.indexOf(main);

		if (this._scrollMode.mode !== 'root') {
			children.forEach(el => { el.style.top = ''; el.style.bottom = ''; });
			main.style.removeProperty('--context-inset-top');
			main.style.removeProperty('--context-inset-bottom');
			return;
		}

		// Everything above main sticks to the top and stacks; everything below
		// sticks to the bottom. Dividers are included, so they ride with their bar
		// and count toward the offset. Base offsets are inherited from any
		// bars/app-view above this one (px values, so nested bars compose).
		const cs = getComputedStyle(this);
		let top = parseFloat(cs.getPropertyValue('--context-inset-top')) || 0;
		for (let i = 0; i < mainIndex; i++) {
			children[i].style.top = `${top}px`;
			children[i].style.bottom = '';
			top += children[i].offsetHeight;
		}
		main.style.setProperty('--context-inset-top', `${top}px`);

		let bottom = parseFloat(cs.getPropertyValue('--context-inset-bottom')) || 0;
		for (let i = children.length - 1; i > mainIndex; i--) {
			children[i].style.bottom = `${bottom}px`;
			children[i].style.top = '';
			bottom += children[i].offsetHeight;
		}
		main.style.setProperty('--context-inset-bottom', `${bottom}px`);
	};

	override render() {
		return barSplitViewTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-bar-split-view': NLDDBarSplitView;
	}
}
