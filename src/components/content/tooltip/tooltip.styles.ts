import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const tooltipStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_tooltip-hide-duration: var(--primitives-transition-duration-fast);
		--_tooltip-show-duration: var(--primitives-transition-duration-fast);
		--_tooltip-max-width: var(--primitives-area-280);
		--_tooltip-z-index: 10000;
		--_tooltip-show-delay: 700ms;
		--_tooltip-box-shadow: var(--primitives-box-shadows-level-2);
		--_tooltip-background-color: light-dark(var(--primitives-color-neutral-600), var(--primitives-color-neutral-750));
		--_tooltip-content-color: var(--primitives-color-neutral-0);
		--_tooltip-hide-delay: 50; /* unitless ms, read by JavaScript */
		--_tooltip-offset: 4; /* px, unitless — read by JS */
		--_tooltip-shift-padding: 8; /* px, unitless — read by JS */

		${inheritedTextReset}
		display: contents;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.tooltip {
		position: fixed;
		opacity: 0;
		margin: 0;
		border: none;
		background: none;
		padding: 0;
		transition:
			opacity var(--_tooltip-hide-duration) ease,
			display var(--_tooltip-hide-duration) allow-discrete,
			overlay var(--_tooltip-hide-duration) allow-discrete;
	}

	.tooltip:popover-open {
		opacity: 1;
		transition:
			opacity var(--_tooltip-show-duration) ease,
			display var(--_tooltip-show-duration) allow-discrete,
			overlay var(--_tooltip-show-duration) allow-discrete;
	}

	/* Stay invisible (no fade) until Floating UI has placed it, so the fade-in plays at
	   the final position rather than flashing at the popover's default spot. The
	   positioned attribute is set once _updatePosition writes the coordinates. */
	.tooltip:popover-open:not([positioned]) {
		/* visibility (like nldd-menu/nldd-popover) keeps the not-yet-placed tooltip out
		   of hit-testing at its stale default spot; opacity still drives the fade. */
		visibility: hidden;
		opacity: 0;
		transition: none;
	}

	@starting-style {
		.tooltip:popover-open {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tooltip,
		.tooltip.is-visible,
		.tooltip.is-focus-visible {
			transition: none;
		}
	}


	/* ## Tooltip body */

	.tooltip__body {
		border-radius: var(--primitives-corner-radius-xs);
		box-shadow: var(--_tooltip-box-shadow);
		background-color: var(--_tooltip-background-color);
		width: max-content;
		max-width: var(--_tooltip-max-width);
		padding-block: var(--primitives-space-4);
		padding-inline: var(--primitives-space-8);
		color: var(--_tooltip-content-color);
		font: var(--primitives-font-body-xs-regular-tight);
		overflow-wrap: break-word;
	}

	@media (forced-colors: active) {
		.tooltip__body {
			border: 1px solid CanvasText;
		}
	}
`;
