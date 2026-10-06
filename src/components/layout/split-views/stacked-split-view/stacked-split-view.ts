/**
 * Nederlandse Digitale Dienst Stacked Split View Component (Lit + TypeScript)
 *
 * A vertical split view with multiple stacked panes.
 * The number of panes is set via the `panes` attribute. Each pane
 * automatically gets a numbered slot: pane-1, pane-2, etc.
 * Panes that do not fit the available height are automatically hidden.
 *
 * @element nldd-stacked-split-view
 *
 * @attr {'inherit'|'base'|'tinted'} background - Use a tinted background color (cascades to descendants)
 * @attr {number} panes - Number of panes (default: 2)
 *
 * @slot pane-1 - First pane
 * @slot pane-2 - Second pane
 * @slot pane-n - Each subsequent pane based on the `panes` attribute
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ScrollModeController } from '../../../../utilities/scroll-mode-controller.js';
import { stackedSplitViewStyles } from './stacked-split-view.styles.js';
import { stackedSplitViewTemplate } from './stacked-split-view.template.js';

@customElement('nldd-stacked-split-view')
export class NLDDStackedSplitView extends LitElement {
	/** Reflects --context-scroll-mode to [data-scroll], like the other split views. */
	private _scrollMode = new ScrollModeController(this);

	static override styles = stackedSplitViewStyles;

	@property({ type: String, reflect: true })
	background: 'inherit' | 'base' | 'tinted' = 'inherit';

	@property({ type: Number, reflect: true })
	panes = 2;

	@state()
	_visiblePanes = Infinity;

	// Cached pane min-height — read from CSS in firstUpdated
	private _paneMinHeight = 0;

	private _resizeObserver: ResizeObserver | null = null;

	override connectedCallback() {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver(() => this._updateVisiblePanes());
		this._resizeObserver.observe(this);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;
	}

	override firstUpdated() {
		// Read pane min-height from CSS after first render — styles are guaranteed applied
		this._paneMinHeight = parseFloat(getComputedStyle(this).getPropertyValue('--_stacked-split-view-pane-min-height'));
		this._updateVisiblePanes();
	}

	override updated(changed: Map<string, unknown>) {
		if (changed.has('panes')) {
			this._updateVisiblePanes();
		}
	}

	private _updateVisiblePanes() {
		if (!this._paneMinHeight) return;
		const height = this.getBoundingClientRect().height;
		const fitting = Math.floor(height / this._paneMinHeight);
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
