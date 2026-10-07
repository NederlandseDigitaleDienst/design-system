import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(breakpoints.smMax);


/* # Host */

export const notificationStyles = css`
	:host {
		--_notification-width: var(--primitives-area-400);
		--_notification-stack-fanned: 0;
		--_notification-stack-depth: 0;
		--_notification-stack-base-offset: var(--primitives-space-6);
		--_notification-stack-fan-offset: var(--primitives-space-6);
		--_notification-stack-offset: calc(var(--_notification-stack-base-offset) + var(--_notification-stack-fan-offset) * var(--_notification-stack-fanned));
		--_notification-stack-scale-step: 0.03;
		--_notification-padding: var(--primitives-space-12);
		--_notification-gap: var(--primitives-space-6);
		--_notification-icon-color: var(--semantics-content-secondary-color);
		--_notification-icon-size: var(--primitives-space-32);
		--_notification-actions-margin-top: var(--primitives-space-4);
		--_notification-actions-gap: var(--primitives-space-6);
		--_notification-dismiss-inset: calc(var(--_notification-padding) - (var(--semantics-controls-sm-min-size) - var(--_notification-icon-size)) / 2);
		--_notification-dismiss-space: calc(var(--_notification-dismiss-inset) + var(--semantics-controls-sm-min-size));
		--_notification-corner-radius: var(--semantics-overlays-corner-radius);
		--_notification-box-shadow: var(--semantics-overlays-box-shadow);
		--_notification-background-color: var(--semantics-surfaces-base-background-color);
		--_notification-text-font: var(--primitives-font-body-md-bold-tight);
		--_notification-supporting-text-color: var(--semantics-content-secondary-color);
		--_notification-supporting-text-font: var(--primitives-font-body-sm-regular-tight);

		box-sizing: border-box;
		display: block;
		border-radius: var(--_notification-corner-radius);
		box-shadow: var(--_notification-box-shadow);
		background-color: var(--_notification-background-color);
		width: var(--_notification-width);
		max-width: 100%;
		overflow: hidden;
		/* The region is a column with a max height, so without this the messages
		   squeeze to fit instead of letting the list scroll. */
		flex-shrink: 0;
		translate: 0 calc(var(--_notification-stack-offset) * var(--_notification-stack-depth));
		scale: calc(1 - var(--_notification-stack-scale-step) * var(--_notification-stack-depth)) 1;
		transform-origin: top center;
		transition: translate var(--primitives-transition-duration-medium) var(--primitives-transition-easing-default), scale var(--primitives-transition-duration-medium) var(--primitives-transition-easing-default);
		animation: notification-arrive var(--primitives-transition-duration-medium) var(--primitives-transition-easing-default) both;
	}

	:host([variant="accent"]) {
		--_notification-icon-color: light-dark(var(--primitives-color-accent-750), var(--primitives-color-accent-350));
	}

	:host([variant="success"]) {
		--_notification-icon-color: var(--primitives-color-success-500);
	}

	:host([variant="warning"]) {
		--_notification-icon-color: light-dark(var(--primitives-color-warning-350), var(--primitives-color-warning-250));
	}

	:host([variant="critical"]) {
		--_notification-icon-color: var(--primitives-color-critical-500);
	}

	:host([hidden]) {
		display: none;
	}

	/* Off for good once it has arrived: a move between overlays reinserts the
	   element, and the browser would play the arrival again. */
	:host([data-arrived]) {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		:host {
			transition: none;
			animation: none;
		}
	}


	/* # Element */

	/* Hidden behind the front of the deck: the region cuts those to the height of
	   the one in front, and half a row of buttons along that edge reads as a
	   mistake rather than as a card further back. */
	.notification {
		display: flex;
		position: relative;
		opacity: calc(1 - var(--_notification-stack-depth));
		transition: opacity var(--primitives-transition-duration-medium) var(--primitives-transition-easing-default);
		padding: var(--_notification-padding);
		padding-inline-end: var(--_notification-dismiss-space);
		gap: var(--_notification-gap);
		align-items: center;
	}

	/* Forced colors drop the shadow this floats on, so there it needs an edge. */
	@media (forced-colors: active) {
		.notification {
			border: var(--primitives-border-width-regular) solid CanvasText;
		}
	}


	/* ## Icon */

	.notification__icon {
		display: flex;
		align-self: flex-start;
		flex-shrink: 0;
		color: var(--_notification-icon-color);
		width: var(--_notification-icon-size);
		height: var(--_notification-icon-size);
	}


	/* ## Main */

	.notification__main {
		display: flex;
		min-width: 0;
		flex-direction: column;
		flex-grow: 1;
	}

	.notification__text {
		margin: 0;
		overflow-wrap: break-word;
		color: var(--semantics-content-color);
		font: var(--_notification-text-font);
		text-wrap: pretty;
	}

	.notification__supporting-text {
		margin: 0;
		overflow-wrap: break-word;
		color: var(--_notification-supporting-text-color);
		font: var(--_notification-supporting-text-font);
		text-wrap: pretty;
	}

	.notification__actions {
		display: flex;
		margin-top: var(--_notification-actions-margin-top);
		flex-wrap: wrap;
		gap: var(--_notification-actions-gap);
	}

	.notification__actions[hidden] {
		display: none;
	}


	/* ## Dismiss */

	/* Out of the flow, so the button cannot make the notification taller than the
	   message in it. */
	.notification__dismiss-button {
		display: flex;
		position: absolute;
		top: var(--_notification-dismiss-inset);
		right: var(--_notification-dismiss-inset);
	}


	/* # Animation */

	/* Past the inset, so it starts off the screen rather than at the margin. */
	@keyframes notification-arrive {
		from {
			opacity: 0;
			transform: translateX(calc(100% + var(--semantics-overlays-inset)));
		}
		to {
			opacity: 1;
			transform: none;
		}
	}


	/* # Responsive */

	@media (max-width: ${smMax}) {
		:host {
			width: 100%;
		}
	}
`;
