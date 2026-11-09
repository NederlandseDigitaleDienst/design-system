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
	// Compared deep: in a shadow root, document.activeElement is the same host
	// for the opener, the overlay and any other field beside them.
	// On the target or inside it counts as free too: the anchor fallback is a
	// host, such as an nldd-button, whose inner button the browser may have focused.
	if (!focusIsFree(overlay) && !focusIsFree(target)) return;
	focusAsLastInput(target);
}

/**
 * Focuses `target` the way the last input asks for: with its ring after the
 * keyboard, without one after a mouse or a finger. For a component that moves
 * focus itself once its own overlay has closed, where `returnFocus` would leave
 * it where the browser put it.
 */
export function focusAsLastInput(target: HTMLElement): void {
	// A text field keeps its ring, as it does on any click.
	if (!isPointerMode() || isTextEntry(target)) {
		target.focus();
		return;
	}
	const active = deepActiveElement();
	if (active && isWithin(active, target)) {
		if (!active.matches(':focus-visible') || isTextEntry(active)) return;
		active.blur();
	}
	// @ts-expect-error lib.dom lacks focusVisible; this fails once it has it.
	const noRing: FocusOptions = { focusVisible: false };
	target.focus(noRing);
}

/**
 * Whether focus is on nothing or still inside `container`, so moving it does
 * not take it from something the user chose. After a click beside an overlay,
 * the browser has put it back where the overlay found it, and in Safari, where
 * a click does not focus a button, that can be a text field next to it.
 */
export function focusIsFree(container: Element): boolean {
	const active = deepActiveElement();
	return !active || active === document.body || isWithin(active, container);
}

/** Whether `node` is `container` or inside it, across shadow roots. */
function isWithin(node: Node, container: Element): boolean {
	for (let n: Node | null = node; n; n = n.parentNode ?? (n instanceof ShadowRoot ? n.host : null)) {
		if (n === container) return true;
	}
	return false;
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
	private _fallback: HTMLElement | null = null;

	/** Remembers what has focus now, inside any shadow roots, so focus goes
	 *  back to that element and not to the host it sits in. With nothing
	 *  focused, as after a click on a button in Safari, it remembers
	 *  `fallback`: an overlay's anchor, so Tab goes on from there. The
	 *  fallback also stands in for a remembered element that has left the page
	 *  by the time the overlay closes, as when a framework renders it anew. */
	remember(fallback?: Element | null): void {
		const active = deepActiveElement();
		this._fallback = (fallback as HTMLElement | null | undefined) ?? null;
		this._target = active && active !== document.body ? active : this._fallback;
	}

	/** Hands focus back once `overlay` has closed. */
	restore(overlay: Element): void {
		const target = this._target?.isConnected ? this._target : this._fallback;
		this._target = null;
		this._fallback = null;
		returnFocus(target, overlay);
	}
}
