import { isPointerMode } from './input-modality.js';

/** The element that really holds focus, inside any shadow roots. */
export function deepActiveElement(): HTMLElement | null {
	let el = document.activeElement;
	while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
	return el as HTMLElement | null;
}

/**
 * Hands focus back to `target` once `overlay` (a popover, menu, sheet or window)
 * has closed. Call it after the close, with the element that had focus when the
 * overlay opened.
 *
 * - Focus the user moved elsewhere, by a click into a field or Tab out of the
 *   overlay, stays there. Only focus still in the overlay, on nothing, or on
 *   `target` itself is handed back.
 * - After the keyboard, `target` gets a plain `focus()` and its ring.
 * - After a mouse or a finger, it gets no ring. The browser's own close step
 *   has often moved focus back already, and WebKit draws a ring for that
 *   script focus. A second `focus()` would be a no-op, so it blurs first and
 *   focuses with `focusVisible: false`. Chromium leaves the ring off itself.
 *   A text field keeps its ring, as it does on any click.
 */
export function returnFocus(target: HTMLElement | null | undefined, overlay: Element): void {
	if (!target || target === document.body || !target.isConnected) return;
	const active = document.activeElement;
	const free = !active || active === document.body || active === target
		|| active === overlay || overlay.contains(active);
	if (!free) return;
	if (!isPointerMode()) {
		target.focus();
		return;
	}
	if (active === target) {
		const deep = deepActiveElement();
		if (!deep?.matches(':focus-visible') || isTextEntry(deep)) return;
		deep.blur();
	}
	// @ts-expect-error lib.dom lacks focusVisible; this fails once it has it.
	const noRing: FocusOptions = { focusVisible: false };
	target.focus(noRing);
}

function isTextEntry(el: HTMLElement): boolean {
	if (el.isContentEditable || el instanceof HTMLTextAreaElement) return true;
	return el instanceof HTMLInputElement
		&& !['button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit'].includes(el.type);
}

/**
 * Remembers where focus was when an overlay opened, and hands it back when it
 * closes, through `returnFocus`. One per overlay:
 *
 * ```ts
 * private _focusReturn = new FocusReturn();
 * // on open, before the overlay takes focus
 * this._focusReturn.remember(anchor);
 * // once it has closed
 * this._focusReturn.restore(this);
 * ```
 */
export class FocusReturn {
	private _target: HTMLElement | null = null;

	/** Remembers what has focus now. With nothing focused, as after a click on a
	 *  button in Safari, it remembers `fallback`: an overlay's anchor, so Tab
	 *  goes on from there. */
	remember(fallback?: Element | null): void {
		const active = document.activeElement as HTMLElement | null;
		this._target = active && active !== document.body
			? active
			: (fallback as HTMLElement | null | undefined) ?? null;
	}

	/** Hands focus back once `overlay` has closed. */
	restore(overlay: Element): void {
		const target = this._target;
		this._target = null;
		returnFocus(target, overlay);
	}
}
