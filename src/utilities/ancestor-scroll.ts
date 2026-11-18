import { getOverflowAncestors } from '@floating-ui/dom';

/**
 * Calls `handler` whenever something that scrolls `element` scrolls.
 *
 * A scroll event does not leave its shadow root, so a capturing listener on
 * the document never hears a scroller inside a component, such as the content
 * of `nldd-page`. This listens on each scrolling ancestor of `element`
 * instead, across shadow roots and slots, and on the window.
 *
 * The ancestors are the ones at the time of the call: listen while something
 * shows and stop when it goes.
 *
 * @returns a function that stops listening
 */
export function onAncestorScroll(element: Element, handler: () => void): () => void {
	const targets = getOverflowAncestors(element);
	for (const target of targets) target.addEventListener('scroll', handler, { passive: true });
	return () => {
		for (const target of targets) target.removeEventListener('scroll', handler);
	};
}
