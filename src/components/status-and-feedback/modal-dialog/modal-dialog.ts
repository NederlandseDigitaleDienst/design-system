/**
 * Nederlandse Digitale Dienst Modal Dialog Component (Lit + TypeScript)
 *
 * A modal window with overlay backdrop, based on the native <dialog> element.
 * Internally renders an <nldd-inline-dialog> for the visual structure.
 *
 * Open and close it with `open`, bound to your state together with the close
 * event: the dialog clears `open` itself when the user closes it. show() and
 * hide() do the same for code without a binding. Keep the dialog in the DOM
 * rather than mounting it when it opens, or the animations are skipped.
 *
 * @element nldd-modal-dialog
 *
 * @attr {'alert'} variant - Forwarded to nldd-inline-dialog; 'alert' forces icon and color
 * @attr {'left'|'center'} horizontal-alignment - Forwarded to nldd-inline-dialog. Unset derives it there: slotted content aligns left, a bare message stays centered.
 * @attr {string} text - Forwarded to nldd-inline-dialog; main text
 * @attr {string} supporting-text - Forwarded to nldd-inline-dialog; supporting text
 * @attr {string} icon - Forwarded to nldd-inline-dialog; absent when not set
 * @attr {string} accessible-label - Accessible name for the dialog (aria-label); falls back to text
 * @attr {boolean} open - Whether the dialog is open. Set it to open or close the dialog, as an alternative to show() and hide(). The dialog clears it itself when it closes another way (Escape, the backdrop), so bind it together with the close event.
 *
 * @slot - Optional custom content, forwarded to nldd-inline-dialog
 * @slot actions - nldd-button elements, forwarded to nldd-inline-dialog
 *
 * @fires open - When the dialog is opened
 * @fires close - When the dialog is fully closed. Does not bubble: overlays nest, and a listener on one dialog asking about that dialog should not also hear the form it opened.
 *
 * @method show() - Opens the modal dialog
 * @method hide() - Closes the modal dialog with a closing animation
 */
import { LitElement } from 'lit';

/** Generous compared to the ~0.2s close animation: long enough that a normal
 *  close always wins on animationend, short enough that a paused or dropped
 *  animation does not leave the dialog stuck. */
const MODAL_DIALOG_CLOSE_TIMEOUT_MS = 1000;
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { modalDialogStyles } from './modal-dialog.styles.js';
import { modalDialogTemplate } from './modal-dialog.template.js';
import { isPointerMode } from '../../../utilities/input-modality.js';
import { focusAutofocusTarget } from '../../../utilities/autofocus.js';
import { openWhenRendered } from '../../../utilities/open-when-rendered.js';
import type { InlineDialogVariant, InlineDialogHorizontalAlignment } from '../inline-dialog/inline-dialog.js';
import '../inline-dialog/inline-dialog.js';

@customElement('nldd-modal-dialog')
export class NLDDModalDialog extends LitElement {
	static override styles = modalDialogStyles;

	@property({ reflect: true, converter: reflectNonDefault<InlineDialogVariant | ''>('') })
	variant: InlineDialogVariant | '' = '';

	@property({ reflect: true, attribute: 'horizontal-alignment', converter: reflectNonDefault<InlineDialogHorizontalAlignment | ''>('') })
	horizontalAlignment: InlineDialogHorizontalAlignment | '' = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ type: String, reflect: true })
	icon = '';

	/** Accessible name for the dialog — forwarded as aria-label. Falls back to text. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Boolean, reflect: true })
	open = false;

	override updated(changed: Map<string, unknown>): void {
		if (changed.has('open')) {
			const dialog = this._dialog;
			if (this.open && (!dialog?.open || this._closing)) this.show();
			else if (!this.open && dialog?.open && !this._closing) this.hide();
		}
	}

	private _closing = false;

	private get _dialog(): HTMLDialogElement | null {
		return this.shadowRoot?.querySelector('dialog') ?? null;
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

		if (this._closing) {
			// Opened again while the close animation runs: call the close off.
			window.clearTimeout(this._closeFallback);
			this._closing = false;
			dialog.classList.remove('is-closing');
		} else {
			if (dialog.open) return;
			dialog.showModal();
			this._manageFocus();
		}
		this.open = true;
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
			this.dispatchEvent(new CustomEvent('close', { bubbles: false, composed: true }));
		};

		dialog.addEventListener('animationend', finish, { once: true });

		// Fallback for prefers-reduced-motion (no animation fires)
		requestAnimationFrame(() => {
			if (this._closing && getComputedStyle(dialog).animationName === 'none') finish();
		});

		// Last resort: animationend is not guaranteed. A background tab pauses CSS
		// animations, so the event may never arrive — and because `_closing` gates
		// this method, the dialog would then be wedged open for the rest of its
		// life, ignoring every later hide(). Close on a timer instead of trusting
		// the animation to end. (Mirrors nldd-sheet.)
		this._closeFallback = window.setTimeout(finish, MODAL_DIALOG_CLOSE_TIMEOUT_MS);
	}

	/** Timer id for the close fallback above. */
	private _closeFallback = 0;

	/** Whether the press preceding a click started on the backdrop rather than
	 *  inside the dialog. Guards against a drag that begins inside (selecting
	 *  text, dragging a control) and ends on the backdrop being read as a
	 *  backdrop click — same fix as nldd-sheet and nldd-window. */
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

	_handleBackdropClick = (e: MouseEvent): void => {
		// Close only on a genuine backdrop click: the press AND the release both
		// land on the backdrop. Without the pointerdown check, a drag that starts
		// inside the dialog and releases on the backdrop would dismiss it.
		if (this._isOnBackdrop(e) && this._pointerDownOnBackdrop) {
			this.hide();
		}
	}

	_handleCancel(e: Event): void {
		e.preventDefault();
		this.hide();
	}

	override render() {
		return modalDialogTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-modal-dialog': NLDDModalDialog;
	}
}
