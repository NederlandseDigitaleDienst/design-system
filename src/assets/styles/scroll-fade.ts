import { css, unsafeCSS } from 'lit';

/**
 * A fade at the edge of a scroll container where more content waits: at the
 * bottom while you can scroll down, at the top once you have scrolled. It
 * fades into `--context-background-color`, the surface the scroller paints.
 * Driven by a scroll timeline, so no script; a browser without one shows no
 * fade.
 *
 * `scroller` is the selector of the element that scrolls, such as `.menu`
 * or `:host`.
 */
export function scrollFade(scroller: string) {
	const s = unsafeCSS(scroller);
	return css`
		${s}::before,
		${s}::after {
			content: '';
			display: block;
			position: sticky;
			z-index: 1;
			flex-shrink: 0;
			height: var(--primitives-space-24);
			opacity: 0;
			pointer-events: none;
		}

		${s}::before {
			top: 0;
			margin-bottom: calc(var(--primitives-space-24) * -1);
			background: linear-gradient(to bottom, var(--context-background-color), transparent);
		}

		${s}::after {
			bottom: 0;
			margin-top: calc(var(--primitives-space-24) * -1);
			background: linear-gradient(to top, var(--context-background-color), transparent);
		}

		@supports (animation-timeline: scroll()) {
			${s}::before {
				animation: scroll-fade-in linear both;
				animation-timeline: scroll(nearest block);
				animation-range: 0 var(--primitives-space-24);
			}

			${s}::after {
				animation: scroll-fade-out linear both;
				animation-timeline: scroll(nearest block);
				animation-range: calc(100% - var(--primitives-space-24)) 100%;
			}
		}

		@keyframes scroll-fade-in {
			from { opacity: 0; }
			to { opacity: 1; }
		}

		@keyframes scroll-fade-out {
			from { opacity: 1; }
			to { opacity: 0; }
		}
	`;
}
