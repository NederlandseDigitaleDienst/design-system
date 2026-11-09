import type { LitElement } from 'lit';

/**
 * Holds on to a `focus()` that comes before the first render.
 *
 * A component that hands focus to an element in its shadow root has nothing to
 * hand it to until it has rendered, so `focus()` right after the element is put
 * in the page did nothing. A site that copies a field and focuses the copy then
 * leaves focus where it was. This runs the call again once the component has
 * rendered, unless focus has moved on in the meantime: a later `focus()` on
 * something else wins, as it would have without the wait.
 *
 * Call it first in an overridden `focus()`, and return when it says it waits:
 *
 * ```ts
 * override focus(options?: FocusOptions): void {
 *   if (deferFocus(this, options)) return;
 *   this._input?.focus(options);
 * }
 * ```
 *
 * @returns true when the call waits for the first render
 */
export function deferFocus(host: LitElement, options?: FocusOptions): boolean {
	if (host.hasUpdated) return false;
	const before = document.activeElement;
	void host.updateComplete.then(() => {
		if (!host.isConnected || document.activeElement !== before) return;
		host.focus(options);
	});
	return true;
}
