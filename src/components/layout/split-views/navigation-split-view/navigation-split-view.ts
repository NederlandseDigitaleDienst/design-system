/**
 * Nederlandse Digitale Dienst Navigation Split View Component (Lit + TypeScript)
 *
 * A four-column layout with a primary sidebar, secondary sidebar, main content area, and inspector.
 * The sidebars show navigation or lists, the main area shows primary content,
 * and the inspector shows additional details or properties of the selection.
 * Panes are shown automatically when content is slotted into them.
 *
 * @element nldd-navigation-split-view
 *
 * Use <code>nldd-split-view-pane</code> as direct children for automatic
 * back button handling.
 *
 * @attr {boolean} inspector-as-sheet - Always show the inspector as a sheet regardless of available space
 * @attr {boolean} primary-sidebar-as-sheet - Always show the primary sidebar as a sheet, keeping main visible at full width
 * @attr {string} inspector-accessible-label - Accessible name for the inspector sheet dialog (default: 'Details')
 * @attr {string} primary-sidebar-accessible-label - Accessible name for the primary sidebar sheet dialog (default: 'Navigatie')
 * @attr {boolean} inspector-auto-hidden - Inspector hidden to free up space for other panes (read-only, set by the split view)
 * @attr {boolean} sidebar-as-sheet - @deprecated alias for primary-sidebar-as-sheet (kept for backwards compatibility)
 * @attr {string} sidebar-accessible-label - @deprecated alias for primary-sidebar-accessible-label (kept for backwards compatibility)
 *
 * @slot primary-sidebar - Left pane for primary navigation
 * @slot secondary-sidebar - Second pane for secondary navigation (shown when slotted)
 * @slot main - Center pane for primary content
 * @slot inspector - Right pane for details or properties
 * @slot sidebar - @deprecated alias for the primary-sidebar slot (kept for backwards compatibility)
 *
 * @method showInspectorSheet() - Opens the inspector as a sheet (async); only has effect when inspector-auto-hidden or inspector-as-sheet is active
 * @method hideInspectorSheet() - Closes the inspector sheet
 * @method showPrimarySidebarSheet() - Opens the primary sidebar as a sheet (async); only has effect when primary-sidebar-as-sheet is active
 * @method hidePrimarySidebarSheet() - Closes the primary sidebar sheet
 * @method showSidebarSheet() - @deprecated alias for showPrimarySidebarSheet() (kept for backwards compatibility)
 * @method hideSidebarSheet() - @deprecated alias for hidePrimarySidebarSheet() (kept for backwards compatibility)
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { isPointerMode } from '../../../../utilities/input-modality.js';
import { ScrollModeController, SINGLE_COLUMN_CHANGE_EVENT } from '../../../../utilities/scroll-mode-controller.js';
import type { SingleColumnChangeDetail } from '../../../../utilities/scroll-mode-controller.js';
import { navigationSplitViewStyles } from './navigation-split-view.styles.js';
import { navigationSplitViewTemplate } from './navigation-split-view.template.js';

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

	/** Accessible name for the inspector sheet dialog. */
	@property({ type: String, attribute: 'inspector-accessible-label' })
	inspectorAccessibleLabel = 'Details';

	/** Accessible name for the primary sidebar sheet dialog. */
	@property({ type: String, attribute: 'primary-sidebar-accessible-label' })
	primarySidebarAccessibleLabel = 'Navigatie';

	@property({ type: Boolean, reflect: true, attribute: 'inspector-auto-hidden' })
	inspectorAutoHidden = false;

	/**
	 * @deprecated Use primary-sidebar-as-sheet. Kept as an alias for backwards compatibility.
	 */
	@property({ type: Boolean, reflect: true, attribute: 'sidebar-as-sheet' })
	sidebarAsSheet = false;

	/**
	 * @deprecated Use primary-sidebar-accessible-label. Kept as an alias for backwards compatibility.
	 * Empty by default so it does not clobber the new property's default.
	 */
	@property({ type: String, attribute: 'sidebar-accessible-label' })
	sidebarAccessibleLabel = '';

	/**
	 * Effective sheet mode — true when either the new property or the deprecated alias is set.
	 * Read by the template, so it stays accessible (underscore-prefixed = internal API).
	 */
	get _asSheet(): boolean {
		return this.primarySidebarAsSheet || this.sidebarAsSheet;
	}

	/**
	 * Effective primary sidebar sheet label — the deprecated alias wins when set, else the new property.
	 * Read by the template, so it stays accessible (underscore-prefixed = internal API).
	 */
	get _resolvedPrimarySidebarLabel(): string {
		return this.sidebarAccessibleLabel || this.primarySidebarAccessibleLabel;
	}

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
	private _resizeObserver: ResizeObserver | null = null;
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
		return this.querySelector(':scope > :is([slot="primary-sidebar"], [slot="sidebar"])') !== null;
	}

	/** @internal */
	get _hasSecondarySidebar(): boolean {
		return this.querySelector(':scope > [slot="secondary-sidebar"]') !== null;
	}

	private get _hasInspector(): boolean {
		return this.querySelector(':scope > [slot="inspector"]') !== null;
	}

	/**
	 * True when collapsed to a single visible pane (full-stack). nldd-app-view
	 * reads this — and listens for the `single-column-change` event below — to
	 * switch the whole app to document-level scroll.
	 * @internal
	 */
	get isSingleColumn(): boolean {
		return this._mode === 'full-stack';
	}

	_paneHasContent(slot: string): boolean {
		// The primary-sidebar slot also matches the deprecated 'sidebar' alias
		const selector = slot === 'primary-sidebar'
			? ':scope > nldd-split-view-pane:is([slot="primary-sidebar"], [slot="sidebar"])'
			: `:scope > nldd-split-view-pane[slot="${slot}"]`;
		return this.querySelector(selector)?.hasAttribute('has-content') ?? false;
	}

	override connectedCallback() {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver(() => this._updateLayout());
		this._resizeObserver.observe(this);
		this.addEventListener('dismiss', this._handleDismiss);

		this._paneObserver = new MutationObserver(() => this._updateLayout());
		this._hostObserver = new MutationObserver(() => {
			this._observePanes();
			this._updateLayout();
		});
		this._hostObserver.observe(this, { childList: true });
		this._observePanes();
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;
		this._paneObserver?.disconnect();
		this._paneObserver = null;
		this._hostObserver?.disconnect();
		this._hostObserver = null;
		this.removeEventListener('dismiss', this._handleDismiss);
	}

	private _observePanes() {
		this._paneObserver?.disconnect();
		this.querySelectorAll(':scope > nldd-split-view-pane').forEach(pane => {
			this._paneObserver!.observe(pane, {
				attributes: true,
				attributeFilter: ['has-content'],
			});
		});
	}

	private _layoutScheduled = false;

	/**
	 * The layout is measured, so it runs after a render, and what it decides is
	 * state, so it must not be set from inside one: that schedules a second
	 * update on top of the one that just finished, which Lit reports. Coalesced,
	 * because a resize and a pane change often land together.
	 */
	private _scheduleLayout() {
		if (this._layoutScheduled) return;
		this._layoutScheduled = true;
		queueMicrotask(() => {
			this._layoutScheduled = false;
			this._updateLayout();
		});
	}

	override firstUpdated() {
		// The min-widths come from CSS, so they need the first render behind them.
		queueMicrotask(() => {
			const style = getComputedStyle(this);
			const read = (prop: string) => parseFloat(style.getPropertyValue(prop));
			this._paneMinWidths = {
				primarySidebar: read('--_primary-sidebar-min-width') || this._paneMinWidths.primarySidebar,
				secondarySidebar: read('--_secondary-sidebar-min-width') || this._paneMinWidths.secondarySidebar,
				main: read('--_main-min-width') || this._paneMinWidths.main,
				inspector: read('--_inspector-min-width') || this._paneMinWidths.inspector,
			};
			this._updateLayout();
		});
	}

	override updated(changed: Map<string, unknown>) {
		if (changed.has('inspectorAsSheet') || changed.has('primarySidebarAsSheet') || changed.has('sidebarAsSheet')) {
			this._scheduleLayout();
		}
		// Close inspector sheet immediately when inspector-auto-hidden clears and inspector-as-sheet is not set
		if (changed.has('inspectorAutoHidden') && !this.inspectorAutoHidden && !this.inspectorAsSheet) {
			this._closeSheetImmediate(this._inspectorSheet);
		}
	}

	_updateLayout() {
		const width = this.getBoundingClientRect().width;
		const { primarySidebar: primarySidebarMin, secondarySidebar: secondarySidebarMin, main: mainMin, inspector: inspectorMin } = this._paneMinWidths;

		// When primary-sidebar-as-sheet, sidebars never render inline — main always fills full width
		let primarySidebar = this._asSheet ? false : this._hasPrimarySidebar;
		let secondarySidebar = this._asSheet ? false : this._hasSecondarySidebar;
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

		this._updatePaneBackButtons();
	}

	private _updatePaneBackButtons() {
		const panes = {
			primarySidebar: this.querySelector(':scope > nldd-split-view-pane:is([slot="primary-sidebar"], [slot="sidebar"])'),
			secondarySidebar: this.querySelector(':scope > nldd-split-view-pane[slot="secondary-sidebar"]'),
			main: this.querySelector(':scope > nldd-split-view-pane[slot="main"]'),
		};

		// When primary-sidebar-as-sheet, main is always the only visible inline pane — no back buttons
		// Secondary sidebar in the sheet can go back to the primary sidebar — keep its back button
		if (this._asSheet) {
			panes.secondarySidebar?.removeAttribute('hide-back');
			panes.main?.setAttribute('hide-back', '');
			return;
		}

		// All panes visible side by side — primary sidebar never gets hide-back,
		// secondary sidebar gets hide-back because the primary sidebar is visible alongside it
		if (this._mode === 'spatial') {
			panes.secondarySidebar?.setAttribute('hide-back', '');
			panes.main?.setAttribute('hide-back', '');
			return;
		}

		// Primary sidebar is hidden — secondary sidebar can go back to it
		// Main is visible alongside secondary sidebar — no sequential navigation
		if (this._mode === 'primary-sidebar-stack') {
			panes.secondarySidebar?.removeAttribute('hide-back');
			panes.main?.setAttribute('hide-back', '');
			return;
		}

		// Primary sidebar never gets hide-back — consumer controls navigation depth
		if (this._mode === 'full-stack') {
			panes.secondarySidebar?.removeAttribute('hide-back');
			panes.main?.removeAttribute('hide-back');
			return;
		}
	}

	// ----------------------------------------------------------------
	// Primary sidebar sheet
	// ----------------------------------------------------------------

	/** Opens the primary sidebar as a sheet. Awaitable — resolves once the dialog is open. */
	async showPrimarySidebarSheet(): Promise<void> {
		if (!this._asSheet) return;
		await this.updateComplete;
		this._primarySidebarSheet?.showModal();
		this._managePrimarySidebarSheetFocus();
	}

	hidePrimarySidebarSheet() {
		this._hideSheet(this._primarySidebarSheet);
	}

	/** @deprecated Use showPrimarySidebarSheet(). */
	showSidebarSheet(): Promise<void> {
		return this.showPrimarySidebarSheet();
	}

	/** @deprecated Use hidePrimarySidebarSheet(). */
	hideSidebarSheet(): void {
		this.hidePrimarySidebarSheet();
	}

	private _managePrimarySidebarSheetFocus() {
		// Focus the secondary sidebar slot when it has content
		if (this._hasSecondarySidebar && this._paneHasContent('secondary-sidebar')) {
			const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="secondary-sidebar"]');
			const assigned = slot?.assignedElements({ flatten: true }) ?? [];
			this._manageFocusForSlot(assigned, this._primarySidebarSheet);
			return;
		}

		// Otherwise gather assigned elements from both the primary-sidebar slot and its deprecated 'sidebar' alias
		const slots = this.shadowRoot?.querySelectorAll<HTMLSlotElement>('slot[name="primary-sidebar"], slot[name="sidebar"]') ?? [];
		const assigned = Array.from(slots).flatMap(slot => slot.assignedElements({ flatten: true }));
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

	/** Opens the inspector as a sheet. Awaitable — resolves once the dialog is open. */
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
