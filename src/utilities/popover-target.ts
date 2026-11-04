/**
 * The popover a component's inner button invokes, from `popovertarget` or
 * `popoverTargetElement` on the host.
 *
 * An id written on the inner button is looked up in the component's own
 * shadow root, where the popover never is, so the button opened nothing. The
 * id is looked up here in the tree of the host instead, and the inner button
 * gets the element. The element wins when both are set.
 *
 * Look it up again on click: a popover rendered after the button is not there
 * yet on the button's first render.
 */
export function popoverTargetOf(host: Element, id: string | undefined, element: Element | null): Element | null {
	if (element) return element;
	if (!id) return null;
	const root = host.getRootNode() as Document | ShadowRoot;
	return root.getElementById?.(id) ?? null;
}

type AnchorableOverlay = Element & { anchorElement: Element | null };

/** The overlay each host anchored, so it can let go again. */
const anchoredBy = new WeakMap<Element, AnchorableOverlay>();

/**
 * Positions an `nldd-menu` or `nldd-popover` that `popovertarget` points at
 * against the control that opens it, so the overlay needs no `anchor` of its
 * own. The browser already opens and closes it; this adds where it stands and
 * the ARIA link back to the control, as a slotted overlay gets.
 *
 * An overlay with an `anchor` id, or anchored to another element, is
 * left alone: someone chose where it goes. Pass `null` to let go, as on
 * disconnect or when `popovertarget` changes.
 */
export function anchorPopoverTarget(host: Element, target: Element | null): void {
	const previous = anchoredBy.get(host);
	const next = target?.matches('nldd-menu, nldd-popover') && !target.getAttribute('anchor')
		? target as AnchorableOverlay
		: null;
	if (previous && previous !== next && previous.anchorElement === host) previous.anchorElement = null;
	if (next && (next.anchorElement === null || next.anchorElement === host)) {
		next.anchorElement = host;
		anchoredBy.set(host, next);
	} else {
		anchoredBy.delete(host);
	}
}
