/**
 * Nederlandse Digitale Dienst Side-by-Side Split View Component (Lit + TypeScript)
 *
 * A horizontal split view with multiple equal panes side by side.
 * The number of panes is set via the `panes` attribute. Each pane
 * automatically gets a numbered slot: pane-1, pane-2, etc.
 * Panes that do not fit the available width are automatically hidden, from
 * right to left: `pane-1` is the last to go. Put the main content in `pane-1`
 * and an inspector or detail in the last pane.
 *
 * @element nldd-side-by-side-split-view
 * @keywords master-detail
 * @related nldd-navigation-split-view, nldd-stacked-split-view, nldd-bar-split-view
 *
 * @attr {'inherit'|'base'|'tinted'} background - Use a tinted background color (cascades to descendants)
 * @attr {number} panes - Number of panes (default: 2)
 *
 * @slot pane-1 - First pane
 * @slot pane-2 - Second pane
 * @slot pane-n - Each subsequent pane based on the `panes` attribute
 */
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../../utilities/custom-element.js';
import { SINGLE_COLUMN_CHANGE_EVENT } from '../../../../utilities/scroll-mode-controller.js';
import { LayoutPass, sharedResizeObserver } from '../../../../utilities/layout-pass.js';
import { ScrollModeController } from '../../../../utilities/scroll-mode-controller.js';
import type { SingleColumnChangeDetail } from '../../../../utilities/scroll-mode-controller.js';
import { sideBySideSplitViewStyles } from './side-by-side-split-view.styles.js';
import { sideBySideSplitViewTemplate } from './side-by-side-split-view.template.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';

/** Every view that changed size measures, then they all apply: one layout for
 *  all of them, where an observer each lays out once per view. */
function measureViews(views: NLDDSideBySideSplitView[]): void {
	const live = views.filter((view) => view.isConnected);
	const fitting = live.map((view) => view._measureFitting());
	live.forEach((view, i) => view._applyFitting(fitting[i]));
}

const sizeObserver = sharedResizeObserver<NLDDSideBySideSplitView>(measureViews);
const fittingPass = new LayoutPass<NLDDSideBySideSplitView>(measureViews);

@customElement('nldd-side-by-side-split-view')
export class NLDDSideBySideSplitView extends LitElement {
	// Reflects --context-scroll-mode to [data-scroll]. This view decides the mode
	// for everyone (it fires single-column-change) but never applied it to itself,
	// so it kept clipping at viewport height while its panes had already flowed.
	private _scrollMode = new ScrollModeController(this);

	static override styles = sideBySideSplitViewStyles;

	@property({ reflect: true, converter: reflectNonDefault<'inherit' | 'base' | 'tinted'>('inherit') })
	background: 'inherit' | 'base' | 'tinted' = 'inherit';

	@property({ reflect: true, converter: reflectNonDefault<number>(2) })
	panes = 2;

	@state()
	_visiblePanes = Infinity;

	// Cached pane min-width, read from CSS once the styles apply
	private _paneMinWidth = 0;

	/** The observer reports every view once when it connects, after its first
	 *  render, so that is where the first measurement happens too. */
	override connectedCallback() {
		super.connectedCallback();
		sizeObserver.observe(this, this);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		sizeObserver.unobserveAll(this);
		fittingPass.cancel(this);
	}

	override updated(changed: Map<string, unknown>) {
		// The first render is measured by the observer's first report.
		if (changed.has('panes') && changed.get('panes') !== undefined) {
			fittingPass.schedule(this, this.ownerDocument);
		}
	}

	/**
	 * True when only one pane fits. nldd-shell reads this (and listens for the
	 * `single-column-change` event below) to switch to document-level scroll.
	 * @internal
	 */
	get isSingleColumn(): boolean {
		return this._visiblePanes <= 1;
	}

	private _updateVisiblePanes() {
		this._applyFitting(this._measureFitting());
	}

	/** @internal How many panes fit, or null before the styles apply. Reads, writes nothing. */
	_measureFitting(): number | null {
		this._paneMinWidth ||= parseFloat(getComputedStyle(this).getPropertyValue('--_side-by-side-split-view-pane-min-width'));
		if (!this._paneMinWidth) return null;
		return Math.floor(this.getBoundingClientRect().width / this._paneMinWidth);
	}

	/** @internal */
	_applyFitting(fitting: number | null): void {
		if (fitting === null) return;
		const wasSingleColumn = this.isSingleColumn;
		this._visiblePanes = Math.min(this.panes, Math.max(1, fitting));
		if (this.isSingleColumn !== wasSingleColumn) {
			this.dispatchEvent(new CustomEvent<SingleColumnChangeDetail>(SINGLE_COLUMN_CHANGE_EVENT, {
				bubbles: true,
				composed: true,
				detail: { singleColumn: this.isSingleColumn },
			}));
		}
	}

	override render() {
		return sideBySideSplitViewTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-side-by-side-split-view': NLDDSideBySideSplitView;
	}
}
