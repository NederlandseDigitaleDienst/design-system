const TABBABLE = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
	'[contenteditable=""]',
	'[contenteditable="true"]',
	'details > summary:first-of-type',
].join(',');

function isTabbable(el: Element): el is HTMLElement {
	return el instanceof HTMLElement
		&& el.matches(TABBABLE)
		&& el.tabIndex >= 0
		&& !el.closest('[inert]')
		&& el.getClientRects().length > 0;
}

/** The children of an element as the flat tree has them: a shadow host its
 *  shadow root's, a slot what is assigned to it, or its fallback without. */
function flatChildren(el: Element): Element[] {
	if (el instanceof HTMLSlotElement) {
		const assigned = el.assignedElements({ flatten: true });
		return assigned.length ? assigned : Array.from(el.children);
	}
	return Array.from((el.shadowRoot ?? el).children);
}

/**
 * The element Tab would reach after `anchor` in the page, walking the flat
 * tree the way the browser builds the tab order, with `skip` and everything in
 * it left out. For a control in the top layer, such as a menu that lives in
 * `<body>` while it shows: Tab past its last item should go on from the
 * control that opened it, not from the end of the document.
 *
 * Positive tabindex values are not ordered first; the components use none.
 */
export function nextTabbableAfter(anchor: Element, skip?: Element): HTMLElement | null {
	let passed = false;
	const visit = (el: Element): HTMLElement | null => {
		if (el === skip) return null;
		if (passed && isTabbable(el)) return el;
		for (const child of flatChildren(el)) {
			const found = visit(child);
			if (found) return found;
		}
		if (el === anchor) passed = true;
		return null;
	};
	return visit(document.body);
}
