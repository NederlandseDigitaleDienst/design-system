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
import { SINGLE_COLUMN_CHANGE_EVENT } from '../../../../utilities/scroll-mode-controller.js';
import { ScrollModeController } from '../../../../utilities/scroll-mode-controller.js';
import type { SingleColumnChangeDetail } from '../../../../utilities/scroll-mode-controller.js';
import { sideBySideSplitViewStyles } from './side-by-side-split-view.styles.js';
import { sideBySideSplitViewTemplate } from './side-by-side-split-view.template.js';

@customElement('nldd-side-by-side-split-view')
export class NLDDSideBySideSplitView extends LitElement {
	// Reflects --context-scroll-mode to [data-scroll]. This view decides the mode
	// for everyone (it fires single-column-change) but never applied it to itself,
	// so it kept clipping at viewport height while its panes had already flowed.
	private _scrollMode = new ScrollModeController(this);

	static override styles = sideBySideSplitViewStyles;

	@property({ type: String, reflect: true })
	background: 'inherit' | 'base' | 'tinted' = 'inherit';

	@property({ type: Number, reflect: true })
	panes = 2;

	@state()
	_visiblePanes = Infinity;

	// Cached pane min-width — read from CSS in firstUpdated
	private _paneMinWidth = 0;

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
		// Read pane min-width from CSS after first render — styles are guaranteed applied
		this._paneMinWidth = parseFloat(getComputedStyle(this).getPropertyValue('--_pane-min-width'));
		this._updateVisiblePanes();
	}

	override updated(changed: Map<string, unknown>) {
		if (changed.has('panes')) {
			this._updateVisiblePanes();
		}
	}

	/**
	 * True when only one pane fits. nldd-app-view reads this — and listens for the
	 * `single-column-change` event below — to switch to document-level scroll.
	 * @internal
	 */
	get isSingleColumn(): boolean {
		return this._visiblePanes <= 1;
	}

	private _updateVisiblePanes() {
		if (!this._paneMinWidth) return;
		const width = this.getBoundingClientRect().width;
		const fitting = Math.floor(width / this._paneMinWidth);
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
