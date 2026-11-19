/**
 * Nederlandse Digitale Dienst Stacked Split View Component (Lit + TypeScript)
 *
 * A vertical split view with multiple stacked panes.
 * The number of panes is set via the `panes` attribute. Each pane
 * automatically gets a numbered slot: pane-1, pane-2, etc.
 * Panes that do not fit the available height are automatically hidden.
 *
 * @element nldd-stacked-split-view
 * @keywords master-detail
 * @related nldd-navigation-split-view, nldd-side-by-side-split-view, nldd-bar-split-view
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
import { ScrollModeController } from '../../../../utilities/scroll-mode-controller.js';
import { stackedSplitViewStyles } from './stacked-split-view.styles.js';
import { stackedSplitViewTemplate } from './stacked-split-view.template.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { LayoutPass, sharedResizeObserver } from '../../../../utilities/layout-pass.js';

/** Every stacked split view that changed size measures, then they all apply:
 *  one layout for all of them, where an observer each lays out once per view. */
function measureViews(views: NLDDStackedSplitView[]): void {
	const live = views.filter((view) => view.isConnected);
	const fitting = live.map((view) => view._measureFitting());
	live.forEach((view, i) => view._applyFitting(fitting[i]));
}

const sizeObserver = sharedResizeObserver<NLDDStackedSplitView>(measureViews);
const fittingPass = new LayoutPass<NLDDStackedSplitView>(measureViews);

@customElement('nldd-stacked-split-view')
export class NLDDStackedSplitView extends LitElement {
	/** Reflects --context-scroll-mode to [data-scroll], like the other split views. */
	private _scrollMode = new ScrollModeController(this);

	static override styles = stackedSplitViewStyles;

	@property({ reflect: true, converter: reflectNonDefault<'inherit' | 'base' | 'tinted'>('inherit') })
	background: 'inherit' | 'base' | 'tinted' = 'inherit';

	@property({ reflect: true, converter: reflectNonDefault<number>(2) })
	panes = 2;

	@state()
	_visiblePanes = Infinity;

	// Cached pane min-height, read from CSS once the styles apply
	private _paneMinHeight = 0;

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

	/** @internal How many panes fit, or null before the styles apply. Reads, writes nothing. */
	_measureFitting(): number | null {
		this._paneMinHeight ||= parseFloat(getComputedStyle(this).getPropertyValue('--_stacked-split-view-pane-min-height'));
		if (!this._paneMinHeight) return null;
		return Math.floor(this.getBoundingClientRect().height / this._paneMinHeight);
	}

	/** @internal */
	_applyFitting(fitting: number | null): void {
		if (fitting === null) return;
		this._visiblePanes = Math.min(this.panes, Math.max(1, fitting));
	}

	override render() {
		return stackedSplitViewTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-stacked-split-view': NLDDStackedSplitView;
	}
}
