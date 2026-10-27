/**
 * True when a bubbling `dismiss` event originates from an `nldd-top-title-bar`'s
 * close button.
 *
 * Overlay containers (`nldd-sheet`, `nldd-window`, `nldd-popover`) listen for bubbling `dismiss`
 * events to close themselves. But nested components fire their own `dismiss` for
 * their own element — an `nldd-token`'s remove button, an `nldd-banner`, an
 * `nldd-document-tab-bar` — and those must NOT close the container. Only the
 * container's own top-title-bar dismiss should. This shared check keeps that rule
 * identical across every overlay container.
 *
 * Limitation: it matches ANY nldd-top-title-bar in the composed path, not
 * specifically the container's own. That is correct for today's one-title-bar-per
 * -container usage; a nested composition with more than one title bar (a sheet
 * inside a sheet, each with its own) would need the inner container to
 * stopPropagation on its own dismiss so it doesn't also reach the outer one.
 */
export function isDismissFromTitleBar(e: Event): boolean {
	return e.composedPath().some(
		(t) => t instanceof Element && t.tagName.toLowerCase() === 'nldd-top-title-bar',
	);
}
