import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);

export const popoverStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_popover-max-height: calc(100vh - var(--semantics-overlays-inset) * 2);
		--_popover-default-width: var(--primitives-area-320);

		margin: 0;
		outline: none;
		border: none;
		box-shadow: var(--semantics-overlays-box-shadow);
		background-color: var(--semantics-surfaces-base-background-color);
		overflow: auto;
		padding: 0;
		isolation: isolate;

		@media (max-width: ${smMax}) {
			position: fixed;
			inset: auto 0 0 0;
			border-radius: var(--semantics-overlays-corner-radius) var(--semantics-overlays-corner-radius) 0 0;
			width: 100%;
			max-width: 100%;
			max-height: calc(100dvh - var(--semantics-sheets-bottom-top-inset));
			transform: translateY(100%);
			transition:
				transform var(--semantics-sheets-bottom-animation-duration) var(--primitives-transition-easing-default),
				display var(--semantics-sheets-bottom-animation-duration) allow-discrete,
				overlay var(--semantics-sheets-bottom-animation-duration) allow-discrete;
		}

		@media (min-width: ${mdMin}) {
			position: absolute;
			inset: unset;
			border-radius: var(--semantics-overlays-corner-radius);
			width: var(--_popover-default-width);
			max-width: calc(100vw - var(--semantics-overlays-inset) * 2);
			max-height: var(--_popover-max-height);
		}
	}

	:host([hidden]) {
		display: none;
	}

	:host(:not(:popover-open)) {
		display: none;
	}

	/* Desktop only: hide the popover between opening and being placed by Floating UI,
	   so it never flashes at the popover's default position. visibility (not display)
	   keeps it laid out so its size can be measured. The sm bottom-sheet is CSS-animated
	   and positioned, so it is excluded. The positioned attribute is set once
	   reposition() finishes and cleared on every re-open. */
	@media (min-width: ${mdMin}) {
		:host(:popover-open:not([positioned])) {
			visibility: hidden;
		}
	}

	:host(:focus-visible:not(.is-pointer-focus)) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), var(--semantics-overlays-box-shadow);
	}

	:host(:popover-open) {
		@media (max-width: ${smMax}) {
			transform: translateY(0);

			@starting-style {
				transform: translateY(100%);
			}
		}
	}

	:host::backdrop {
		@media (max-width: ${smMax}) {
			background-color: var(--semantics-overlays-backdrop-color);
		}
	}

	:host([sm-full-height]) {
		@media (max-width: ${smMax}) {
			height: calc(100dvh - var(--semantics-sheets-bottom-top-inset));
		}
	}

	/* Top-level safety net: transitions currently only exist in the sm
	   bottom-sheet rule, but this guard also disables any future
	   desktop-viewport animation for prefers-reduced-motion users. */
	@media (prefers-reduced-motion: reduce) {
		:host {
			transition: none;
		}
	}
`;
