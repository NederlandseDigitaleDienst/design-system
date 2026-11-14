import { css, unsafeCSS } from 'lit';

// Registered once for the document, so the mask stops can animate; a
// registration in a shadow root's stylesheet would not count.
for (const name of ['--_scroll-fade-start', '--_scroll-fade-end']) {
	try {
		CSS.registerProperty({ name, syntax: '<length>', inherits: false, initialValue: '0px' });
	} catch {
		// Already registered by another copy of this module.
	}
}

/**
 * A fade at the edge of a scroll container where more content waits: at the
 * bottom while you can scroll down, at the top once you have scrolled. It is
 * a mask on the content, so it fades into whatever lies behind, whatever its
 * color. Put it on an element that scrolls and paints no surface of its own:
 * the mask would fade that surface, and its shadow, with it. Driven by a
 * scroll timeline, so no script; a browser without one shows no fade.
 *
 * `scroller` is the selector of the element that scrolls, such as
 * `.menu__scroller`.
 */
export function scrollFade(scroller: string) {
	const s = unsafeCSS(scroller);
	return css`
		@supports (animation-timeline: scroll()) {
			${s} {
				mask-image: linear-gradient(
					to bottom,
					transparent 0,
					black var(--_scroll-fade-start),
					black calc(100% - var(--_scroll-fade-end)),
					transparent 100%
				);
				animation: scroll-fade-start linear both, scroll-fade-end linear both;
				animation-timeline: scroll(self block), scroll(self block);
				animation-range: 0 var(--primitives-space-24), calc(100% - var(--primitives-space-24)) 100%;
			}
		}

		@keyframes scroll-fade-start {
			from { --_scroll-fade-start: 0px; }
			to { --_scroll-fade-start: var(--primitives-space-24); }
		}

		@keyframes scroll-fade-end {
			from { --_scroll-fade-end: var(--primitives-space-24); }
			to { --_scroll-fade-end: 0px; }
		}
	`;
}
