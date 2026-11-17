import { isTouchMode } from './input-modality.js';

export interface InterestIntentOptions {
	/** Milliseconds a resting pointer waits before it shows; 0 shows at once. */
	showDelay: () => number;
	/** Milliseconds before a pointer that left hides it: the gap to the overlay. */
	hideDelay: () => number;
	/** Whether it is showing for this control. */
	isOpen: () => boolean;
	show: () => void;
	hide: () => void;
	/** Whether it may show at all: content, not disabled. Read on every change. */
	available?: () => boolean;
}

/**
 * When something that describes a control shows: a tooltip, or a popover that
 * opens on interest. It shows while the pointer rests on the control or on
 * what it shows, while the control has keyboard focus, or while a long press
 * holds it, and goes when none of those is left.
 *
 * - A pointer waits `showDelay` before it shows, and gets `hideDelay` to cross
 *   the gap when it leaves. Focus shows and hides at once.
 * - Escape dismisses it until the pointer and focus have both left (WCAG
 *   1.4.13): hover and focus do not bring it back before that.
 * - Activating the control closes it: it has done its job.
 *
 * The owner wires the events and calls in here; where it shows, how, and what
 * else ends it (a scroll, a shared overlay moving on) stays with the owner.
 */
export class InterestIntent {
	private _hovered = false;
	private _focused = false;
	private _held = false;
	private _dismissed = false;
	private _showTimer: ReturnType<typeof setTimeout> | null = null;
	private _hideTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(private readonly options: InterestIntentOptions) {}

	/** Whether keyboard focus is one of the reasons it shows. */
	get focused(): boolean {
		return this._focused;
	}

	get wanted(): boolean {
		return (this.options.available?.() ?? true) && !this._dismissed
			&& (this._hovered || this._focused || this._held);
	}

	/** The pointer came onto the control, or onto what it shows. */
	enter(): void {
		this._clearHide();
		if (this._hovered) return;
		// Onto what already shows (the overlay, or the control while focus shows it).
		if (this.options.isOpen()) {
			this._hovered = true;
			return;
		}
		this._clearShow();
		const delay = this.options.showDelay();
		const rest = (): void => {
			this._showTimer = null;
			this._hovered = true;
			this.update();
		};
		if (delay > 0) this._showTimer = setTimeout(rest, delay);
		else rest();
	}

	/** The pointer left the control, or what it shows. */
	leave(): void {
		this._clearShow();
		this._dismissed = this._dismissed && this._focused;
		if (!this._hovered) return;
		this._hovered = false;
		if (this.wanted) return;
		this._hideTimer = setTimeout(() => {
			this._hideTimer = null;
			this.update();
		}, this.options.hideDelay());
	}

	/** Keyboard focus came into the control. A tap that focuses is no keyboard intent. */
	focus(): void {
		if (this._focused || isTouchMode()) return;
		this._focused = true;
		this.update();
	}

	/** Focus left the control. */
	blur(): void {
		this._focused = false;
		this._dismissed = this._dismissed && this._hovered;
		this.update();
	}

	/** A long press holds it open until something else closes it. */
	hold(): void {
		this._dismissed = false;
		this._held = true;
		this.update();
	}

	/** Escape: gone, and kept away until the pointer and focus have both left. */
	dismiss(): void {
		this._dismissed = true;
		this._held = false;
		this.update();
	}

	/** The control was activated, or the page moved away from under the pointer. */
	close(): void {
		this._hovered = false;
		this._focused = false;
		this._held = false;
		this._clearShow();
		this.update();
	}

	/** Forget everything, without showing or hiding: for a new overlay or a disconnect. */
	reset(): void {
		this._hovered = false;
		this._focused = false;
		this._held = false;
		this._dismissed = false;
		this._clearShow();
		this._clearHide();
	}

	/** Closed some other way (a backdrop): what the pointer did no longer counts. */
	closed(): void {
		this._hovered = false;
		this._held = false;
		this._clearHide();
	}

	/** Shows or hides it to match what is wanted now. */
	update(): void {
		this._clearHide();
		const open = this.options.isOpen();
		if (this.wanted && !open) this.options.show();
		else if (!this.wanted && open) this.options.hide();
	}

	private _clearShow(): void {
		if (this._showTimer) clearTimeout(this._showTimer);
		this._showTimer = null;
	}

	private _clearHide(): void {
		if (this._hideTimer) clearTimeout(this._hideTimer);
		this._hideTimer = null;
	}
}
