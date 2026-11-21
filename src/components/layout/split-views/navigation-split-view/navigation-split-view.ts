/**
 * Nederlandse Digitale Dienst Navigation Split View Component (Lit + TypeScript)
 *
 * A four-column layout with a primary sidebar, secondary sidebar, main content area, and inspector.
 * The sidebars show navigation or lists, the main area shows primary content,
 * and the inspector shows additional details or properties of the selection.
 * Panes are shown automatically when content is slotted into them.
 * When they stop fitting, panes drop in a fixed order: the inspector goes
 * first, then the primary sidebar collapses into the secondary sidebar. If
 * that still does not fit, the view stacks and shows one pane at a time:
 * main when it has content, otherwise the secondary sidebar, otherwise the
 * primary sidebar.
 *
 * @element nldd-navigation-split-view
 * @keywords master-detail, zijbalk
 * @related nldd-side-by-side-split-view, nldd-stacked-split-view, nldd-bar-split-view
 *
 * Slot the content of a pane straight into the view, usually an nldd-page.
 * The view gives it the room of its column and hides the back button of its
 * nldd-top-title-bar where the pane it leads back to is in view.
 *
 * @attr {boolean} inspector-as-sheet - Always show the inspector as a sheet regardless of available space
 * @attr {boolean} primary-sidebar-as-sheet - Always show the primary sidebar as a sheet, keeping main visible at full width
 * @attr {boolean} inspector-auto-hidden - Inspector hidden to free up space for other panes (read-only, set by the split view)
 * @attr {string} inspector-accessible-label - Accessible name for the inspector sheet dialog (default: 'Details')
 * @attr {string} primary-sidebar-accessible-label - Accessible name for the primary sidebar sheet dialog (default: 'Navigatie')
 *
 * @childattr {boolean} empty - This pane says nothing is chosen yet, such as "Kies een dossier". Stacked, the view shows the pane before it instead. Set it on the element in `main` or `secondary-sidebar`.
 *
 * @slot primary-sidebar - Left pane for primary navigation
 * @slot secondary-sidebar - Second pane for secondary navigation (shown when slotted)
 * @slot main - Center pane for primary content
 * @slot inspector - Right pane for details or properties
 *
 * @method showInspectorSheet() - Opens the inspector as a sheet (async); only has effect when inspector-auto-hidden or inspector-as-sheet is active
 * @method hideInspectorSheet() - Closes the inspector sheet
 * @method showPrimarySidebarSheet() - Opens the primary sidebar as a sheet (async); only has effect when primary-sidebar-as-sheet is active
 * @method hidePrimarySidebarSheet() - Closes the primary sidebar sheet
 */
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../../utilities/custom-element.js';
import { isPointerMode } from '../../../../utilities/input-modality.js';
import { ScrollModeController, SINGLE_COLUMN_CHANGE_EVENT } from '../../../../utilities/scroll-mode-controller.js';
import { LayoutPass, sharedResizeObserver } from '../../../../utilities/layout-pass.js';
import type { SingleColumnChangeDetail } from '../../../../utilities/scroll-mode-controller.js';
import { navigationSplitViewStyles } from './navigation-split-view.styles.js';
import { navigationSplitViewTemplate } from './navigation-split-view.template.js';

/**
 * Every split view that has to lay out measures its width first, and only then
 * do they apply: one that measures after another one applied lays out the page
 * again, once per view.
 */
function layOut(views: NLDDNavigationSplitView[]): void {
	const live = views.filter((view) => view.isConnected);
	const widths = live.map((view) => view._measureWidth());
	live.forEach((view, i) => view._applyLayout(widths[i]));
}

const layoutPass = new LayoutPass<NLDDNavigationSplitView>(layOut);
const sizeObserver = sharedResizeObserver<NLDDNavigationSplitView>(layOut);

@customElement('nldd-navigation-split-view')
export class NLDDNavigationSplitView extends LitElement {
	static override styles = navigationSplitViewStyles;

	// Reflects --context-scroll-mode to [data-scroll] so the row wrapper and the
	// visible full-stack pane flow (do not clip) in root-scroll mode.
	private _scrollMode = new ScrollModeController(this);

	@property({ type: Boolean, reflect: true, attribute: 'inspector-as-sheet' })
	inspectorAsSheet = false;

	@property({ type: Boolean, reflect: true, attribute: 'primary-sidebar-as-sheet' })
	primarySidebarAsSheet = false;

	@property({ type: Boolean, reflect: true, attribute: 'inspector-auto-hidden' })
	inspectorAutoHidden = false;

	/** Accessible name for the inspector sheet dialog. */
	@property({ type: String, attribute: 'inspector-accessible-label' })
	inspectorAccessibleLabel = 'Details';

	/** Accessible name for the primary sidebar sheet dialog. */
	@property({ type: String, attribute: 'primary-sidebar-accessible-label' })
	primarySidebarAccessibleLabel = 'Navigatie';

	// Internal visibility driven by layout algorithm — not part of public API
	@state()
	_showPrimarySidebar = false;

	@state()
	_showSecondarySidebar = false;

	@state()
	_showMain = true;

	@state()
	_showInspector = true;

	private _mode: 'spatial' | 'primary-sidebar-stack' | 'full-stack' = 'spatial';
	private _paneObserver: MutationObserver | null = null;
	private _hostObserver: MutationObserver | null = null;

	// Cached pane min-widths — read from CSS in firstUpdated
	private _paneMinWidths = { primarySidebar: 320, secondarySidebar: 320, main: 480, inspector: 320 };

	private get _inspectorSheet(): HTMLDialogElement | null {
		return this.shadowRoot?.querySelector('.navigation-split-view__inspector-sheet') ?? null;
	}

	private get _primarySidebarSheet(): HTMLDialogElement | null {
		return this.shadowRoot?.querySelector('.navigation-split-view__primary-sidebar-sheet') ?? null;
	}

	private get _hasPrimarySidebar(): boolean {
		return this.querySelector(':scope > [slot="primary-sidebar"]') !== null;
	}

	/** @internal */
	get _hasSecondarySidebar(): boolean {
		return this.querySelector(':scope > [slot="secondary-sidebar"]') !== null;
	}

	private get _hasInspector(): boolean {
		return this.querySelector(':scope > [slot="inspector"]') !== null;
	}

	/**
	 * True when collapsed to a single visible pane (full-stack). nldd-shell
	 * reads this (and listens for the `single-column-change` event below) to
	 * switch the whole app to document-level scroll.
	 * @internal
	 */
	get isSingleColumn(): boolean {
		return this._mode === 'full-stack';
	}

	_paneHasContent(slot: string): boolean {
		const pane = this.querySelector(`:scope > [slot="${slot}"]`);
		return !!pane && !pane.hasAttribute('empty');
	}

	/**
	 * @internal Whether the pane the back button of this one leads to is in
	 * view already, so the button would go nowhere. The primary sidebar has
	 * none: how deep its navigation goes is up to the consumer.
	 */
	_hidesBack(slot: 'secondary-sidebar' | 'main'): boolean {
		if (slot === 'main') return this.primarySidebarAsSheet || this._mode !== 'full-stack';
		return !this.primarySidebarAsSheet && this._mode === 'spatial';
	}

	override connectedCallback() {
		super.connectedCallback();
		sizeObserver.observe(this, this);
		this.addEventListener('dismiss', this._handleDismiss);

		this._paneObserver = new MutationObserver(() => this._scheduleLayout());
		this._hostObserver = new MutationObserver(() => {
			this._observePanes();
			this._scheduleLayout();
		});
		this._hostObserver.observe(this, { childList: true });
		this._observePanes();
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		sizeObserver.unobserveAll(this);
		layoutPass.cancel(this);
		this._paneObserver?.disconnect();
		this._paneObserver = null;
		this._hostObserver?.disconnect();
		this._hostObserver = null;
		this.removeEventListener('dismiss', this._handleDismiss);
	}

	private _observePanes() {
		this._paneObserver?.disconnect();
		for (const pane of this.children) {
			this._paneObserver!.observe(pane, {
				attributes: true,
				attributeFilter: ['empty', 'slot'],
			});
		}
	}

	/**
	 * The layout is measured, so it runs after a render, and what it decides is
	 * state, so it must not be set from inside one: that schedules a second
	 * update on top of the one that just finished, which Lit reports. Coalesced,
	 * because a resize and a pane change often land together, and run with the
	 * other split views that lay out in the same tick (see layOut).
	 */
	private _scheduleLayout() {
		layoutPass.schedule(this, this.ownerDocument);
	}

	/** Whether the min-widths have been read from the CSS. */
	private _minWidthsRead = false;

	override firstUpdated() {
		// The min-widths come from CSS, so they need the first render behind them.
		this._scheduleLayout();
	}

	/** @internal The width to lay out in; the first time also the min-widths. Reads, writes nothing. */
	_measureWidth(): number {
		if (!this._minWidthsRead && this.hasUpdated) {
			this._minWidthsRead = true;
			const style = getComputedStyle(this);
			const read = (prop: string) => parseFloat(style.getPropertyValue(prop));
			this._paneMinWidths = {
				primarySidebar: read('--_navigation-split-view-primary-sidebar-min-width') || this._paneMinWidths.primarySidebar,
				secondarySidebar: read('--_navigation-split-view-secondary-sidebar-min-width') || this._paneMinWidths.secondarySidebar,
				main: read('--_navigation-split-view-main-min-width') || this._paneMinWidths.main,
				inspector: read('--_navigation-split-view-inspector-min-width') || this._paneMinWidths.inspector,
			};
		}
		return this.getBoundingClientRect().width;
	}

	override updated(changed: Map<string, unknown>) {
		if (changed.has('inspectorAsSheet') || changed.has('primarySidebarAsSheet')) {
			this._scheduleLayout();
		}
		// Close inspector sheet immediately when inspector-auto-hidden clears and inspector-as-sheet is not set
		if (changed.has('inspectorAutoHidden') && !this.inspectorAutoHidden && !this.inspectorAsSheet) {
			this._closeSheetImmediate(this._inspectorSheet);
		}
	}

	_updateLayout() {
		this._applyLayout(this._measureWidth());
	}

	/** @internal Chooses the panes that fit in `width`. */
	_applyLayout(width: number) {
		const { primarySidebar: primarySidebarMin, secondarySidebar: secondarySidebarMin, main: mainMin, inspector: inspectorMin } = this._paneMinWidths;

		// When primary-sidebar-as-sheet, sidebars never render inline — main always fills full width
		let primarySidebar = this.primarySidebarAsSheet ? false : this._hasPrimarySidebar;
		let secondarySidebar = this.primarySidebarAsSheet ? false : this._hasSecondarySidebar;
		let main = true;
		let inspector = this._hasInspector;

		// Sum min-widths of currently requested panes
		const requestedWidth = () => [
			primarySidebar && primarySidebarMin,
			secondarySidebar && secondarySidebarMin,
			main && mainMin,
			inspector && inspectorMin,
		].reduce((sum: number, v) => sum + (v || 0), 0);

		// Step 1: hide inspector if not enough space
		if (inspector && requestedWidth() > width) inspector = false;

		// Step 2: collapse primary sidebar into secondary sidebar if still not enough space
		if (primarySidebar && secondarySidebar && requestedWidth() > width) primarySidebar = false;

		// Determine mode
		const primarySidebarCollapsed = this._hasPrimarySidebar && this._hasSecondarySidebar && !primarySidebar && secondarySidebar;
		const fits = requestedWidth() <= width;

		let mode: 'spatial' | 'primary-sidebar-stack' | 'full-stack';
		if (primarySidebarCollapsed && fits) {
			mode = 'primary-sidebar-stack';
		} else if (!primarySidebarCollapsed && fits) {
			mode = 'spatial';
		} else {
			mode = 'full-stack';
		}

		// Full-stack: show only the deepest pane with content
		if (mode === 'full-stack') {
			primarySidebar = false;
			secondarySidebar = false;
			main = false;
			inspector = false;

			// Priority: main > secondary sidebar (if available) > primary sidebar (if available) > main fallback
			if (this._paneHasContent('main')) {
				main = true;
			} else if (this._hasSecondarySidebar && this._paneHasContent('secondary-sidebar')) {
				secondarySidebar = true;
			} else if (this._hasPrimarySidebar && this._paneHasContent('primary-sidebar')) {
				primarySidebar = true;
			} else {
				main = true; // fallback to empty state
			}
		}

		// No nav and no content — hide inspector
		if (!primarySidebar && !secondarySidebar && inspector && !this._paneHasContent('main')) {
			inspector = false;
		}

		this._showPrimarySidebar = primarySidebar;
		this._showSecondarySidebar = secondarySidebar;
		this._showMain = main;
		// Inspector shown inline only when it fits AND consumer has not forced sheet mode
		this._showInspector = inspector && !this.inspectorAsSheet;

		this.inspectorAutoHidden = this._hasInspector && !inspector;
		const wasSingleColumn = this._mode === 'full-stack';
		this._mode = mode;
		this.classList.toggle('full-stack', mode === 'full-stack');
		if (this.isSingleColumn !== wasSingleColumn) {
			this.dispatchEvent(new CustomEvent<SingleColumnChangeDetail>(SINGLE_COLUMN_CHANGE_EVENT, {
				bubbles: true,
				composed: true,
				detail: { singleColumn: this.isSingleColumn },
			}));
		}

		// The back buttons follow the mode, which is not reactive state.
		this.requestUpdate();
	}

	// ----------------------------------------------------------------
	// Primary sidebar sheet
	// ----------------------------------------------------------------

	/** Opens the primary sidebar as a sheet. Awaitable: resolves once the dialog is open. */
	async showPrimarySidebarSheet(): Promise<void> {
		if (!this.primarySidebarAsSheet) return;
		await this.updateComplete;
		this._primarySidebarSheet?.showModal();
		this._managePrimarySidebarSheetFocus();
	}

	hidePrimarySidebarSheet() {
		this._hideSheet(this._primarySidebarSheet);
	}

	private _managePrimarySidebarSheetFocus() {
		// Focus the secondary sidebar slot when it has content
		if (this._hasSecondarySidebar && this._paneHasContent('secondary-sidebar')) {
			const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="secondary-sidebar"]');
			const assigned = slot?.assignedElements({ flatten: true }) ?? [];
			this._manageFocusForSlot(assigned, this._primarySidebarSheet);
			return;
		}

		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="primary-sidebar"]');
		const assigned = slot?.assignedElements({ flatten: true }) ?? [];
		this._manageFocusForSlot(assigned, this._primarySidebarSheet);
	}

	_handlePrimarySidebarSheetClick(e: MouseEvent) {
		if (e.target === this._primarySidebarSheet) this.hidePrimarySidebarSheet();
	}

	_handlePrimarySidebarSheetCancel(e: Event) {
		e.preventDefault();
		this.hidePrimarySidebarSheet();
	}

	// ----------------------------------------------------------------
	// Inspector sheet
	// ----------------------------------------------------------------

	/** Opens the inspector as a sheet. Awaitable: resolves once the dialog is open. */
	async showInspectorSheet(): Promise<void> {
		if (!this.inspectorAutoHidden && !this.inspectorAsSheet) return;
		await this.updateComplete;
		this._inspectorSheet?.showModal();
		this._manageInspectorSheetFocus();
	}

	hideInspectorSheet() {
		this._hideSheet(this._inspectorSheet);
	}

	private _manageInspectorSheetFocus() {
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="inspector"]');
		const assigned = slot?.assignedElements({ flatten: true }) ?? [];
		this._manageFocusForSlot(assigned, this._inspectorSheet);
	}

	_handleInspectorSheetClick(e: MouseEvent) {
		if (e.target === this._inspectorSheet) this.hideInspectorSheet();
	}

	_handleInspectorSheetCancel(e: Event) {
		e.preventDefault();
		this.hideInspectorSheet();
	}

	// ----------------------------------------------------------------
	// Shared focus helper
	// ----------------------------------------------------------------

	private _manageFocusForSlot(assigned: Element[], dialog: HTMLDialogElement | null) {
		// 1. autofocus element present — let the browser handle it natively
		if (assigned.some(el => el.querySelector('[autofocus]'))) return;

		// 2. Focus the dialog — show focus ring only when opened via keyboard
		if (!dialog) return;
		dialog.classList.toggle('is-pointer-focus', isPointerMode());
		dialog.focus();
	}

	// ----------------------------------------------------------------
	// Shared sheet helpers
	// ----------------------------------------------------------------

	private _handleDismiss = (e: Event) => {
		// Route dismiss events to the correct sheet based on composed path
		const path = e.composedPath();
		if (path.some(el => el === this._primarySidebarSheet)) {
			this.hidePrimarySidebarSheet();
		} else if (this.inspectorAutoHidden || this.inspectorAsSheet) {
			this.hideInspectorSheet();
		}
	};

	private _hideSheet(dialog: HTMLDialogElement | null) {
		if (!dialog?.open) return;

		// Guard against double close event dispatch
		if (dialog.dataset['closing'] === 'true') return;
		dialog.dataset['closing'] = 'true';

		dialog.classList.add('is-closing');
		dialog.addEventListener('animationend', () => {
			dialog.classList.remove('is-closing');
			delete dialog.dataset['closing'];
			dialog.close();
		}, { once: true });

		// Fallback for prefers-reduced-motion — no animation fires
		requestAnimationFrame(() => {
			if (dialog.dataset['closing'] === 'true' && getComputedStyle(dialog).animationName === 'none') {
				dialog.classList.remove('is-closing');
				delete dialog.dataset['closing'];
				dialog.close();
			}
		});
	}

	private _closeSheetImmediate(dialog: HTMLDialogElement | null) {
		if (!dialog?.open) return;
		dialog.classList.remove('is-closing');
		dialog.close();
	}

	override render() {
		return navigationSplitViewTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-navigation-split-view': NLDDNavigationSplitView;
	}
}
