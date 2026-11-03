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
