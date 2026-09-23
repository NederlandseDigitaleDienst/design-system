/**
 * Nederlandse Digitale Dienst Sheet Component (Lit + TypeScript)
 *
 * An overlay component that slides in from the side or bottom of the screen.
 * Based on the native <dialog> element for built-in accessibility,
 * focus management, and Escape key support.
 *
 * On small (sm) viewports the sheet always renders as a bottom sheet,
 * regardless of the configured placement.
 *
 * Render the sheet at the document root (teleport/portal it to `document.body`),
 * never inside a split view's content flow: as a slotted flex child it would steal
 * pane height (see `nldd-split-view-pane`).
 *
 * A sheet holds a whole nldd-page: an nldd-top-title-bar in its header slot,
 * the content, and a footer when there are actions. The page behaves as it does
 * anywhere else, with only the middle scrolling, and the text of the bar is
 * also the sheet's accessible name. Do not build a header of your own.
 *
 * Open and close it with `open`, bound to your state together with the close
 * event: the sheet clears `open` itself when the user closes it. show() and
 * hide() do the same for code without a binding. Keep the sheet in the DOM
 * rather than mounting it when it opens, or the animations are skipped.
 *
 * @element nldd-sheet
 *
 * @attr {string} width - Custom width for side sheets (left/right) as a CSS length (e.g. '480px', '32rem'). Applied from the md breakpoint up; ignored on sm (bottom sheet) and for `placement="bottom"`. Clamped to `100vw - 2 * inset` so the sheet always fits.
 * @attr {string} height - Custom height for bottom sheets (and for any sheet on sm viewports, where all placements collapse to bottom). Accepts: `'full'` (default — viewport minus top-inset, identical to omitting the attribute), `'fit-content'` (collapse to content size), or any CSS length/percentage (e.g. `'50dvh'`, `'480px'`, `'50%'`). Always clamped to `100dvh - top-inset` so the sheet can't extend past the dismiss-tap area. No effect on side sheets at md+.
 * @attr {string} placement - Sheet position: 'left' | 'right' | 'bottom' (default: 'right')
 * @attr {string} accessible-label - Accessible name for the dialog, forwarded as aria-label. Unset, the sheet takes the text of the nldd-top-title-bar inside it, and without one it is called 'Venster'.
 * @attr {boolean} open - Whether the sheet is open. Set it to open or close the sheet, as an alternative to show() and hide(). The sheet clears it itself when it closes another way (Escape, the backdrop, the close button of its title bar), so bind it together with the close event.
 *
 * @slot - Sheet content
 *
 * @fires open - Fired when the sheet is opened
 * @fires close - Fired when the sheet is fully closed. Does not bubble: overlays nest, and a listener on one sheet asking about that sheet should not also hear the form it opened.
 *
 * @method show() - Opens the sheet
 * @method hide() - Closes the sheet with a closing animation
 */

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { sheetStyles } from './sheet.styles.js';
import { sheetTemplate } from './sheet.template.js';
import { isPointerMode } from '../../../utilities/input-modality.js';
import { focusAutofocusTarget } from '../../../utilities/autofocus.js';
import { isDismissFromTitleBar } from '../../../utilities/dismiss-from-title-bar.js';
import { openWhenRendered } from '../../../utilities/open-when-rendered.js';
import { TitleBarLabelController } from '../../../utilities/title-bar-label-controller.js';

type Placement = 'left' | 'right' | 'bottom';

/** Generous compared to the ~0.2s close animation: long enough that a normal
 *  close always wins on animationend, short enough that a paused or dropped
 *  animation does not leave the sheet stuck. */
const SHEET_CLOSE_TIMEOUT_MS = 1000;

@customElement('nldd-sheet')
export class NLDDSheet extends LitElement {
	static override styles = sheetStyles;

	/**
	 * Custom width for side sheets (left/right) from the md breakpoint up.
	 * CSS length (e.g. '480px', '32rem'). Ignored on sm viewports (bottom-sheet
	 * fallback) and for `placement="bottom"`. Clamped to `100vw - 2 * inset`.
	 */
	@property({ type: String, reflect: true })
	width = '';

	/**
	 * Custom height for bottom sheets (and for any sheet on sm viewports
	 * where all placements collapse to bottom). Defaults to full-height
	 * — `'fit-content'` opts back into the content-sized layout, any CSS
	 * length/percentage sets a specific size. Clamped to `100dvh - top-
	 * inset` via `max-height` so the dismiss-tap area always remains.
	 */
	@property({ type: String, reflect: true })
	height = '';

	@property({ reflect: true, converter: reflectNonDefault<Placement>('right') })
	placement: Placement = 'right';

	/** Accessible name for the dialog — forwarded as aria-label to the dialog element. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	private _titleBar = new TitleBarLabelController(this);

	get _resolvedAccessibleLabel(): string {
		return this.accessibleLabel || this._titleBar.text || 'Venster';
	}

	@property({ type: Boolean, reflect: true })
	open = false;

	override updated(changed: Map<string, unknown>) {
		if (changed.has('open')) {
			const dialog = this._dialog;
			if (this.open && (!dialog?.open || this._closing)) this.show();
			else if (!this.open && dialog?.open && !this._closing) this.hide();
		}
		if (changed.has('width')) {
			if (this.width) {
				this.style.setProperty('--_width', this.width);
			} else {
				this.style.removeProperty('--_width');
			}
		}
		if (changed.has('height')) {
			const h = this.height;
			// `'full'` is an explicit alias for the default (no var → CSS
			// fallback to `calc(100dvh - top-inset)`). Anything else flows
			// through CSS.supports so typos and bogus values silently fall
			// back to the default rather than producing a broken layout.
			if (h && h !== 'full' && CSS.supports('height', h)) {
				this.style.setProperty('--_height', h);
			} else {
				// One warning per instance for the element's lifetime (matches
				// _hasWarnedLabel): a later distinct invalid value won't warn
				// again. Acceptable for a dev-only nudge — not worth tracking
				// per-value state to re-warn.
				if (import.meta.env?.DEV && h && h !== 'full' && !this._hasWarnedHeight) {
					this._hasWarnedHeight = true;
					console.warn(`<nldd-sheet>: Invalid height value "${h}". Falling back to full height. Use 'full', 'fit-content', or a valid CSS length (e.g. '50dvh', '480px').`);
				}
				this.style.removeProperty('--_height');
			}
		}
	}

	private _hasWarnedLabel = false;
	private _hasWarnedHeight = false;

	private _closing = false;

	private get _dialog(): HTMLDialogElement | null {
		return this.shadowRoot?.querySelector('dialog') ?? null;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.style.containerType = 'inline-size';
		this.style.containerName = 'layout-container';
		// Listen for dismiss events bubbling up from nldd-top-title-bar
		this.addEventListener('dismiss', this._handleDismiss);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('dismiss', this._handleDismiss);
	}

	/** Cancels a `show()` that is waiting for the first render; null when none is. */
	private _cancelPendingOpen: (() => void) | null = null;

	show(): void {
		const dialog = this._dialog;
		if (!dialog) {
			this._cancelPendingOpen?.();
			this._cancelPendingOpen = openWhenRendered(
				this,
				() => this._dialog,
				() => this.show(),
			);
			return;
		}

		this._cancelPendingOpen?.();
		this._cancelPendingOpen = null;

		// New open cycle: the next close may emit again.
		this._closeEmitted = false;

		// Warn once per instance when the sheet has no name of its own to go by
		if (import.meta.env?.DEV && !this.accessibleLabel && !this._titleBar.text && !this._hasWarnedLabel) {
			this._hasWarnedLabel = true;
			console.warn('<nldd-sheet>: No accessible-label and no nldd-top-title-bar with text inside. Screen readers will announce this dialog as "Venster". Give the title bar a text, or set accessible-label.');
		}

		if (this._closing) {
			// Opened again while the close animation runs: call the close off.
			window.clearTimeout(this._closeFallback);
			this._closing = false;
			dialog.classList.remove('is-closing');
		} else {
			dialog.showModal();
		}
		this.open = true;
		this._manageFocus();
		this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
	}

	private _manageFocus(): void {
		// 1. autofocus element present — focus it ourselves: a design-system
		// field keeps its input in shadow DOM, which the browser's own autofocus
		// skips (see focusAutofocusTarget).
		if (focusAutofocusTarget(this)) return;

		// 2. Focus the dialog — show focus ring only when opened via keyboard
		const dialog = this._dialog;
		if (!dialog) return;
		dialog.classList.toggle('is-pointer-focus', isPointerMode());
		dialog.focus();
	}

	hide(): void {
		// A hide() beats a show() that is still waiting for the first render.
		this._cancelPendingOpen?.();
		this._cancelPendingOpen = null;

		const dialog = this._dialog;
		if (!dialog || !dialog.open || this._closing) return;

		this.open = false;
		this._closing = true;
		dialog.classList.add('is-closing');

		const finish = () => {
			if (!this._closing) return;
			window.clearTimeout(this._closeFallback);
			dialog.classList.remove('is-closing');
			this._closing = false;
			dialog.close();
			this._emitClose();
		};

		dialog.addEventListener('animationend', finish, { once: true });

		// Fallback for prefers-reduced-motion (no animation fires)
		// Use requestAnimationFrame to let CSS skip the animation first
		requestAnimationFrame(() => {
			if (this._closing && getComputedStyle(dialog).animationName === 'none') finish();
		});

		// Last resort: animationend is not guaranteed. A background tab pauses CSS
		// animations, so the event may never arrive — and because `_closing` gates
		// this method, the sheet would then be wedged open for the rest of its
		// life, ignoring every later hide(). Close on a timer instead of trusting
		// the animation to end.
		this._closeFallback = window.setTimeout(finish, SHEET_CLOSE_TIMEOUT_MS);
	}

	/** Timer id for the close fallback above. */
	private _closeFallback = 0;

	/** Whether the press preceding a click started on the backdrop (the dialog
	 *  itself) rather than inside the sheet content. Guards against a drag that
	 *  begins inside (selecting text in an input, dragging a control) and ends on
	 *  the backdrop being read as a backdrop click. */
	private _pointerDownOnBackdrop = false;

	_handleDialogPointerDown(e: PointerEvent): void {
		this._pointerDownOnBackdrop = e.target === this._dialog;
	}

	_handleDialogClick(e: MouseEvent): void {
		// Close only on a genuine backdrop click: the press AND the release land
		// on the dialog itself (its dismiss area), not on content. e.target is the
		// dialog when the release is on the backdrop; the pointerdown flag confirms
		// the press started there too, so a drag out of the sheet doesn't dismiss.
		if (e.target === this._dialog && this._pointerDownOnBackdrop) {
			this.hide();
		}
	}

	/**
	 * Emitted once per open cycle, from whichever route actually closed the sheet.
	 *
	 * The dialog's own close event cannot be the only source: jsdom does not fire
	 * it, so the event would be untestable. hide() calls this too, and the flag
	 * keeps it to one per cycle.
	 */
	private _closeEmitted = false;

	private _emitClose(): void {
		this.open = false;
		if (this._closeEmitted) return;
		this._closeEmitted = true;
		this.dispatchEvent(new CustomEvent('close', { bubbles: false, composed: true }));
	}

	_handleDialogClose(e: Event): void {
		// Only the dialog's own native close counts. That event does not bubble, so
		// its target is the dialog. A nested component's `close` (an nldd-popover
		// datepicker, say) is composed and bubbling, so it reaches this same @close
		// listener retargeted to the slotted host — without this guard it would emit
		// the sheet's close and make consumers tear the sheet down while it stays open.
		if (e.target !== this._dialog) return;
		this._closing = false;
		this._dialog?.classList.remove('is-closing');
		this._emitClose();
	}

	_handleCancel(e: Event): void {
		// Intercept Escape key default close — run hide animation instead
		e.preventDefault();
		this.hide();
	}

	private _handleDismiss = (e: Event): void => {
		// Only our own top-title-bar's dismiss button closes the sheet. Other
		// components fire `dismiss` for their own element (nldd-token's remove,
		// nldd-banner, nldd-document-tab-bar); inside a sheet those must not close it.
		if (isDismissFromTitleBar(e)) {
			// Stop the matched dismiss here so a nested sheet/window's own title-bar
			// dismiss can't keep bubbling up and also close an outer overlay.
			e.stopPropagation();
			this.hide();
		}
	};

	override render() {
		return sheetTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-sheet': NLDDSheet;
	}
}
