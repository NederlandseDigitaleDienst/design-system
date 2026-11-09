/** Elements whose own role a list item would hide. A custom element or a
 *  plain div or span has none worth keeping. */
const OWN_ROLE = /^(a|article|aside|button|details|dialog|fieldset|figure|footer|form|h[1-6]|header|hr|img|input|li|main|nav|ol|section|select|table|textarea|ul)$/;

/**
 * Gives slotted children `role="listitem"`, for a component that renders the
 * `role="list"` around its slot.
 *
 * A child with a role of its own, written or implied by its element, keeps it:
 * a consumer's `<article>` stays an article. An nldd-card carries its article
 * inside its shadow root, so its host has room for the list item.
 */
export function markListItems(elements: Element[]): void {
	for (const el of elements) {
		if (el.hasAttribute('role') && el.getAttribute('role') !== 'listitem') continue;
		if (OWN_ROLE.test(el.localName)) continue;
		el.setAttribute('role', 'listitem');
	}
}
