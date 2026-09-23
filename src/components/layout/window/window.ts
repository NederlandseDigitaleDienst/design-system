/**
 * Nederlandse Digitale Dienst Window Component (Lit + TypeScript)
 *
 * A floating window based on the native <dialog> element, positionable through
 * CSS values. Always modal.
 *
 * No header of its own: consumers use nldd-page with a sticky header inside for
 * a title bar. The text of the nldd-top-title-bar in that header is also the
 * window's accessible name.
 *
 * Open and close it with `open`, bound to your state together with the close
 * event: the window clears `open` itself when the user closes it. show() and
 * hide() do the same for code without a binding. Keep the window in the DOM
 * rather than mounting it when it opens, or the animations are skipped.
 *
 * @element nldd-window
 *
 * @attr {'inherit'|'light'|'dark'} scheme - Color scheme (default 'inherit').
 * @attr {string} width - CSS width (default: var(--components-window-default-width))
 * @attr {string} height - CSS height (default: content height)
 * @attr {string} top - CSS top position of the top edge (e.g. '0', '100px')
 * @attr {string} right - CSS right value
 * @attr {string} bottom - CSS bottom value
 * @attr {string} left - CSS left position of the left edge
 * @attr {boolean} centered - Centers both axes on the viewport. Overridable per axis: `centered top="0"` is horizontally centered, top aligned. Mirrors CSS `place-items: center` with `align-items`/`justify-items` overrides.
 * @attr {string} accessible-label - Accessible name (aria-label). Unset, the window takes the text of the nldd-top-title-bar inside it, and without one the i18n default ('Venster'). Each window needs a unique, descriptive name, from either.
 * @attr {object} translations - Override translation keys; unset keys fall back to the Dutch default.
 * @attr {boolean} no-light-dismiss - A click on the backdrop does not close the window. For windows where dismissing by accident costs work: a wizard, a form with filled-in fields. Escape and the dismiss button keep working.
 * @attr {boolean} open - Whether the window is open. Set it to open or close the window, as an alternative to show() and hide(). The window clears it itself when it closes another way (Escape, the backdrop, the close button of its title bar), so bind it together with the close event.
 *
 * @slot - Complete window content (e.g. nldd-page)
 *
 * @fires open - When the window opens
 * @fires close - When the window has fully closed. Does not bubble: overlays can sit inside each other, and a listener on one window should not also hear the form that opened it.
 *
 * @method show() - Opens the window
 * @method hide() - Closes the window
 */

import { LitElement, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { windowStyles } from './window.styles.js';
import { windowTemplate } from './window.template.js';
import { nlddWindowTranslations, type NLDDWindowTranslations } from './window.i18n.js';
import { isPointerMode } from '../../../utilities/input-modality.js';
import { focusAutofocusTarget } from '../../../utilities/autofocus.js';
import { isDismissFromTitleBar } from '../../../utilities/dismiss-from-title-bar.js';
import { TitleBarLabelController } from '../../../utilities/title-bar-label-controller.js';
import { openWhenRendered } from '../../../utilities/open-when-rendered.js';

export type NLDDWindowScheme = 'inherit' | 'light' | 'dark';

@customElement('nldd-window')
export class NLDDWindow extends LitElement {
	static override styles = windowStyles;

	@property({ type: String, reflect: true })
	scheme: NLDDWindowScheme = 'inherit';

	@property({ type: String, reflect: true })
	width: string | undefined;

	@property({ type: String, reflect: true })
	height: string | undefined;

	@property({ type: String, reflect: true })
	top: string | undefined;

	@property({ type: String, reflect: true })
	right: string | undefined;

	@property({ type: String, reflect: true })
	bottom: string | undefined;

	@property({ type: String, reflect: true })
	left: string | undefined;

	@property({ type: Boolean, reflect: true })
	centered = false;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/**
	 * Override one or more translation keys.
	 * Unset keys fall back to the Dutch default.
	 */
	@property({ type: Object })
	translations: Partial<NLDDWindowTranslations> = {};

	@property({ type: Boolean, reflect: true, attribute: 'no-light-dismiss' })
	noLightDismiss = false;

	@property({ type: Boolean, reflect: true })
	open = false;

	private _closing = false;
	private _hasWarnedLabel = false;
	private _titleBar = new TitleBarLabelController(this);

	private get _dialog(): HTMLDialogElement | null {
		return this.shadowRoot?.querySelector('dialog') ?? null;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.style.containerType = 'inline-size';
		this.style.containerName = 'layout-container';
		this.addEventListener('dismiss', this._handleDismiss);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('dismiss', this._handleDismiss);
	}

	override firstUpdated(): void {
		// Apply scheme once the shadow DOM (including the inner <dialog>) is
		// in place — the `changed.has('scheme')` path in updated() may run
		// before the @query lookup resolves the dialog on the very first
		// render.
		this._applyScheme();
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('open')) {
			const dialog = this._dialog;
			if (this.open && !dialog?.open) this.show();
			else if (!this.open && dialog?.open) this.hide();
		}
		this._applyPositionStyles();
		if (changed.has('scheme')) {
			this._applyScheme();
		}
	}

	private _applyScheme(): void {
		const dialog = this._dialog;
		if (this.scheme === 'light' || this.scheme === 'dark') {
			this.style.colorScheme = this.scheme;
			if (dialog) dialog.style.colorScheme = this.scheme;
		} else {
			this.style.removeProperty('color-scheme');
			if (dialog) dialog.style.removeProperty('color-scheme');
		}
	}

	// — i18n ——————————————————————————————————————————————————————————————————

	private _t(key: keyof NLDDWindowTranslations): string {
		return this.translations[key] ?? nlddWindowTranslations[key];
	}

	get _resolvedAccessibleLabel(): string {
		return this.accessibleLabel || this._titleBar.text || this._t('components.window.accessible-label');
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

		if (import.meta.env?.DEV && !this.accessibleLabel && !this._titleBar.text && !this._hasWarnedLabel) {
			this._hasWarnedLabel = true;
			console.warn(`<nldd-window>: No accessible-label and no nldd-top-title-bar with text inside. Screen readers will announce this window as "${this._t('components.window.accessible-label')}". Give the title bar a text, or set accessible-label.`);
		}

		dialog.showModal();
		this.open = true;
		this._applyPositionStyles();
		this._manageFocus();
		this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
	}

	hide(): void {
		// A hide() beats a show() that is still waiting for the first render.
		this._cancelPendingOpen?.();
		this._cancelPendingOpen = null;

		const dialog = this._dialog;
		if (!dialog || !dialog.open || this._closing) return;

		this.open = false;
		this._closing = true;
		dialog.close();
		this._closing = false;
		this._emitClose();
	}

	/**
	 * Emitted once per open cycle, from whichever route actually closed the
	 * window. Same reasoning as nldd-sheet: Escape on a non-modal dialog closes
	 * through the CloseWatcher, which @cancel cannot reliably stop, while jsdom
	 * never fires the dialog's own close event.
	 */
	private _closeEmitted = false;

	private _emitClose(): void {
		this.open = false;
		if (this._closeEmitted) return;
		this._closeEmitted = true;
		this.dispatchEvent(new CustomEvent('close', { bubbles: false, composed: true }));
	}

	_handleDialogClose = (e: Event): void => {
		// Only the dialog's own native close counts. That event does not bubble, so
		// its target is the dialog. A nested component's `close` (an nldd-popover
		// datepicker, say) is composed and bubbling, so it reaches this same @close
		// listener retargeted to the slotted host — without this guard the window
		// would emit its own close while staying open, and `_closeEmitted` would
		// then swallow the real one for the rest of this open cycle.
		if (e.target !== this._dialog) return;
		this._closing = false;
		this._emitClose();
	};

	private _manageFocus(): void {
		// 1. autofocus element present — focus it ourselves: a design-system
		// field keeps its input in shadow DOM, which the browser's own autofocus
		// skips (see focusAutofocusTarget).
		if (focusAutofocusTarget(this)) return;

		const dialog = this._dialog;
		if (!dialog) return;
		dialog.classList.toggle('is-pointer-focus', isPointerMode());
		dialog.focus();
	}

	private _applyPositionStyles(): void {
		const dialog = this._dialog;
		if (!dialog) return;

		const hasEdge = this.top !== undefined || this.left !== undefined || this.right !== undefined || this.bottom !== undefined;
		const hasOverride = hasEdge || this.centered;

		// `centered` centers both axes unless an edge attribute is set on that
		// axis, so edges take precedence. transform: translate(-50%) per centered
		// axis keeps the width clamping (max-width) from breaking the centering: a
		// percentage in a transform is relative to the element's own width, not to
		// the viewport.
		const yCenter = this.centered && this.top === undefined && this.bottom === undefined;
		const xCenter = this.centered && this.left === undefined && this.right === undefined;

		// Set explicit 'auto' on opposing axis when only one side is set,
		// to override the UA stylesheet defaults on <dialog>
		dialog.style.top = this.top ?? (yCenter ? '50%' : (this.bottom !== undefined ? 'auto' : ''));
		dialog.style.bottom = this.bottom ?? (this.top !== undefined ? 'auto' : '');
		dialog.style.left = this.left ?? (xCenter ? '50%' : (this.right !== undefined ? 'auto' : ''));
		dialog.style.right = this.right ?? (this.left !== undefined ? 'auto' : '');
		dialog.style.width = this.width ?? '';
		dialog.style.height = this.height ?? '';

		// A translate per centered axis, to correct center-from-edge.
		dialog.style.transform = (xCenter || yCenter)
			? `translate(${xCenter ? '-50%' : '0'}, ${yCenter ? '-50%' : '0'})`
			: '';

		// Reset margin when custom position is set; keep margin: auto for the
		// UA-default centering (which only kicks in without explicit position).
		dialog.style.margin = hasOverride ? '0' : '';
	}

	/** Whether the press preceding a click started on the backdrop rather than
	 *  inside the window. Guards against a drag that begins inside (selecting
	 *  text in an input, dragging a control) and ends on the backdrop being
	 *  read as a backdrop click — same fix as nldd-sheet. */
	private _pointerDownOnBackdrop = false;

	_handleDialogPointerDown = (e: PointerEvent): void => {
		this._pointerDownOnBackdrop = this._isOnBackdrop(e);
	};

	/** True when the event landed on the backdrop: it targets the dialog
	 *  itself (content clicks target the content) with coordinates outside the
	 *  dialog box. The target check comes BEFORE the coordinates, because a
	 *  programmatic `.click()` carries clientX/clientY 0,0 — outside any dialog
	 *  rect — and would otherwise read as a backdrop press from inside. */
	private _isOnBackdrop(e: MouseEvent): boolean {
		const dialog = this._dialog;
		if (!dialog) return false;
		if (e.composedPath()[0] !== dialog) return false;
		const rect = dialog.getBoundingClientRect();
		return e.clientX < rect.left || e.clientX > rect.right
			|| e.clientY < rect.top || e.clientY > rect.bottom;
	}

	_handleDialogClick = (e: MouseEvent): void => {
		if (this.noLightDismiss) return;
		// Close only on a genuine backdrop click: the press AND the release both
		// land on the backdrop. Without the pointerdown check, a drag that starts
		// inside the window and releases on the backdrop would dismiss it.
		if (this._isOnBackdrop(e) && this._pointerDownOnBackdrop) {
			this.hide();
		}
	};

	_handleCancel = (e: Event): void => {
		// Intercept Escape key — close via hide() for consistent behavior
		e.preventDefault();
		this.hide();
	};

	private _handleDismiss = (e: Event): void => {
		// Only our own top-title-bar's dismiss closes the window. A nested component
		// (nldd-token remove, nldd-banner, nldd-document-tab-bar) fires its own
		// dismiss inside the window; those must not close it.
		if (isDismissFromTitleBar(e)) {
			// Stop the matched dismiss here so a nested window/sheet's own title-bar
			// dismiss can't keep bubbling up and also close an outer overlay.
			e.stopPropagation();
			this.hide();
		}
	};

	override render() {
		return windowTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-window': NLDDWindow;
	}
}
