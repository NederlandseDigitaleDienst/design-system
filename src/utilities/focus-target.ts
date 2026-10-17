/**
 * Moving focus to a place on the page, the way a skip link does.
 */

/**
 * The fragment of an href that stays on this page, or an empty string. An
 * absolute URL to the page you are on counts too: a router or a CMS writes
 * `/pagina#inhoud` as readily as `#inhoud`.
 */
export function samePageHash(href: string): string {
	try {
		const url = new URL(href, location.href);
		const samePage = url.origin === location.origin
			&& url.pathname === location.pathname
			&& url.search === location.search;
		return samePage ? url.hash : '';
	} catch {
		return '';
	}
}

/** The element a fragment points at, looked up in the tree of `from` first. */
export function hashTarget(hash: string, from: Node): HTMLElement | null {
	let id = hash.slice(1);
	if (!id) return null;
	// A malformed escape throws; the raw id is then the best guess left.
	try { id = decodeURIComponent(id); } catch { /* keep the raw id */ }
	const root = from.getRootNode() as Document | ShadowRoot;
	return root.getElementById?.(id) ?? document.getElementById(id);
}

/**
 * Focuses the target and leaves it as it was once focus moves on. Returns the
 * function that puts it back (safe to call twice), or null when the target did
 * not take focus because it is hidden or inert; it is then already put back.
 *
 * The tabindex is 0 and not -1, also when the target came with a -1 of its
 * own. WebKit skips everything inside a shadow host that has a negative
 * tabindex, slotted content included, so with -1 on an nldd-* section the
 * next Tab left the page instead of reaching the first link in it.
 */
export function focusTemporarily(target: HTMLElement, options?: FocusOptions): (() => void) | null {
	const previous = target.getAttribute('tabindex');
	let restored = false;
	const restore = () => {
		if (restored) return;
		restored = true;
		target.removeEventListener('blur', restore);
		if (previous === null) target.removeAttribute('tabindex');
		else target.setAttribute('tabindex', previous);
	};
	target.setAttribute('tabindex', '0');
	target.addEventListener('blur', restore);
	target.focus(options);
	// Focus did not take: no blur will follow, so the tab stop would stay
	// behind for good.
	if ((target.getRootNode() as Document | ShadowRoot).activeElement !== target) {
		restore();
		return null;
	}
	return restore;
}
