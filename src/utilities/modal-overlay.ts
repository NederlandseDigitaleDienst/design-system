import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { focusAutofocusTarget } from './autofocus.js';
import { isDismissFromTitleBar } from './dismiss-from-title-bar.js';
import { isPointerMode } from './input-modality.js';
import { FocusReturn } from './return-focus.js';

/** Generous compared to the ~0.2s close animation: long enough that a normal
 *  close always wins on animationend, short enough that a paused or dropped
 *  animation does not leave the overlay stuck. */
const CLOSE_TIMEOUT_MS = 1000;

/** An overlay built on a modal `<dialog>` in its shadow root. */
export interface ModalOverlayHost extends ReactiveControllerHost, HTMLElement {
	open: boolean;
	/** The host's own hide(): every dismiss route goes through it. */
	hide(): void;
}

export interface ModalOverlayOptions {
	/** Plays the closing animation (`.is-closing` on the dialog) before it closes. */
	animatedClose?: boolean;
	/** Closes on the dismiss button of an nldd-top-title-bar inside. */
	titleBarDismiss?: boolean;
	/** Whether a press on the backdrop closes the overlay, read on every click. */
	lightDismiss?: () => boolean;
	/** Runs on every show(), before the dialog opens: a name check, positioning. */
	beforeOpen?: () => void;
}

/**
 * The life of a modal overlay (nldd-sheet, nldd-window, nldd-modal-dialog):
 * opening once rendered, the first focus, closing with or without an
 * animation, one `close` per open cycle, focus back to where it came from,
 * and the dismiss routes (Escape, the backdrop, a title bar).
 *
 * The host keeps `open`, show() and hide() as its API and calls show() and
 * hide() here. The template binds the dialog's `pointerdown`, `pointerup`,
 * `click`, `cancel` and `close` to the handlers of the same name.
 */
export class ModalOverlay implements ReactiveController {
	private _closing = false;
	private _closeFallback = 0;
	private _closeEmitted = false;
	private _cancelPendingOpen: (() => void) | null = null;
	private _focusReturn = new FocusReturn();
	private _downOnBackdrop = false;
	private _upOnBackdrop = false;
	/** The open state this controller last acted on. A dialog that closed by
	 *  itself is still open here until its close event: a render in between
	 *  must not read that as a request to open it again. */
	private _known = false;

	constructor(
		private readonly host: ModalOverlayHost & { updateComplete: Promise<boolean> },
		private readonly options: ModalOverlayOptions = {},
	) {
		host.addController(this);
	}

	get dialog(): HTMLDialogElement | null {
		return this.host.shadowRoot?.querySelector('dialog') ?? null;
	}

	hostConnected(): void {
		if (this.options.titleBarDismiss) this.host.addEventListener('dismiss', this._handleDismiss);
	}

	hostDisconnected(): void {
		this.host.removeEventListener('dismiss', this._handleDismiss);
	}

	/** Follows `open` set from outside, as a binding does: only a change. */
	hostUpdated(): void {
		const open = this.host.open;
		if (open === this._known) return;
		if (open) this.show();
		else this.hide();
	}

	show(): void {
		const dialog = this.dialog;
		this._cancelPendingOpen?.();
		this._cancelPendingOpen = null;
		if (!dialog) {
			// Opened in the same tick it was created: wait for the dialog, once. If it
			// is still not there after the update, the element never rendered.
			let cancelled = false;
			this._cancelPendingOpen = () => { cancelled = true; };
			void this.host.updateComplete.then(() => {
				if (!cancelled && this.dialog) this.show();
			});
			return;
		}

		if (dialog.open && !this._closing) {
			this._known = true;
			return;
		}
		// Also when it reopens during the close: what it reads may have changed since.
		this.options.beforeOpen?.();
		if (this._closing) {
			// Opened again while the close animation runs: call the close off. The
			// dialog stayed modal, so focus is still inside it, where it was.
			this._settle(dialog);
		} else {
			this._focusReturn.remember();
			dialog.showModal();
			this._focusFirst(dialog);
		}
		// New open cycle: the next close may emit again.
		this._closeEmitted = false;
		this._known = true;
		this.host.open = true;
		this.host.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
	}

	hide(): void {
		// A hide() beats a show() that is still waiting for the first render.
		this._cancelPendingOpen?.();
		this._cancelPendingOpen = null;

		// Also before the first render: an `open` set earlier must not open it then.
		this._known = false;
		this.host.open = false;
		const dialog = this.dialog;
		if (!dialog || !dialog.open || this._closing) return;

		if (!this.options.animatedClose) {
			dialog.close();
			this._emitClose();
			return;
		}

		this._closing = true;
		dialog.classList.add('is-closing');
		const finish = (): void => {
			// Only this close: after a reopen and a second hide() in the same frame,
			// the first close's frame callback is still due.
			if (this._finishClose !== finish) return;
			this._settle(dialog);
			dialog.close();
			this._emitClose();
		};
		this._finishClose = finish;
		dialog.addEventListener('animationend', finish, { once: true });
		// Reduced motion: no animation runs, so none ends.
		requestAnimationFrame(() => {
			if (getComputedStyle(dialog).animationName === 'none') finish();
		});
		// animationend is not guaranteed: a background tab pauses animations, and
		// `_closing` would then keep the overlay open for good.
		this._closeFallback = window.setTimeout(finish, CLOSE_TIMEOUT_MS);
	}

	/** An `[autofocus]` inside, else the dialog itself, with a ring only for the keyboard. */
	private _focusFirst(dialog: HTMLDialogElement): void {
		if (focusAutofocusTarget(this.host)) return;
		dialog.classList.toggle('is-pointer-focus', isPointerMode());
		dialog.focus();
	}

	/** The close in progress, for whichever of its three routes ends it first. */
	private _finishClose: (() => void) | null = null;

	private _settle(dialog: HTMLDialogElement): void {
		window.clearTimeout(this._closeFallback);
		if (this._finishClose) dialog.removeEventListener('animationend', this._finishClose);
		this._finishClose = null;
		this._closing = false;
		dialog.classList.remove('is-closing');
	}

	/** Once per open cycle, from whichever route closed the dialog. */
	private _emitClose(): void {
		this._known = false;
		this.host.open = false;
		if (this._closeEmitted) return;
		this._closeEmitted = true;
		this.host.dispatchEvent(new CustomEvent('close', { bubbles: false, composed: true }));
		// After the event, so focus a close handler moves elsewhere stays there.
		this._focusReturn.restore(this.host);
	}

	/** On the backdrop: the event targets the dialog itself, outside its box. The
	 *  target comes first, because a click from code carries 0,0 as coordinates. */
	private _onBackdrop(e: MouseEvent): boolean {
		const dialog = this.dialog;
		if (!dialog || (e.composedPath()[0] ?? e.target) !== dialog) return false;
		const rect = dialog.getBoundingClientRect();
		return e.clientX < rect.left || e.clientX > rect.right
			|| e.clientY < rect.top || e.clientY > rect.bottom;
	}

	handlePointerDown = (e: PointerEvent): void => {
		this._downOnBackdrop = this._onBackdrop(e);
	};

	handlePointerUp = (e: PointerEvent): void => {
		this._upOnBackdrop = this._onBackdrop(e);
	};

	/** Closes only when the press and the release both land on the backdrop: a
	 *  drag between the content and the backdrop is no dismissal (WCAG 2.5.2). */
	handleClick = (e: MouseEvent): void => {
		const onBackdrop = this._downOnBackdrop && this._upOnBackdrop && this._onBackdrop(e);
		// Each click gets the flags of its own gesture only: a click from code or
		// from assistive technology would otherwise read the last one's.
		this._downOnBackdrop = false;
		this._upOnBackdrop = false;
		if (onBackdrop && (this.options.lightDismiss?.() ?? true)) this.host.hide();
	};

	/** Escape: close through hide(), with its animation, not the browser's close. */
	handleCancel = (e: Event): void => {
		e.preventDefault();
		this.host.hide();
	};

	/** A close that skips hide(), such as a `<form method="dialog">`. */
	handleClose = (e: Event): void => {
		// Only the dialog's own close: a nested component's composed `close`
		// reaches this listener too, retargeted to its slotted host.
		// Nor the queued close of a dialog that has been opened again since: no
		// _settle() needed there, since the show() that reopened it settled first.
		const dialog = this.dialog;
		if (!dialog || e.target !== dialog || dialog.open) return;
		this._settle(dialog);
		this._emitClose();
	};

	private _handleDismiss = (e: Event): void => {
		// Only a title bar's dismiss: nldd-token, nldd-banner and others fire their
		// own for their own element. Stopped here, so an outer overlay stays open.
		if (!isDismissFromTitleBar(e)) return;
		e.stopPropagation();
		this.host.hide();
	};
}
