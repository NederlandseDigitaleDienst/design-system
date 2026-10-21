import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const badgeStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_badge-custom-color: transparent;
		--_badge-background-color: light-dark(var(--primitives-color-critical-650), var(--primitives-color-critical-450));
		--_badge-border-color: light-dark(var(--primitives-color-critical-600), var(--primitives-color-critical-500));
		--_badge-border-width: var(--primitives-border-width-thin);
		--_badge-height: var(--primitives-space-20);
		--_badge-inline-padding: var(--primitives-space-6);
		--_badge-gap: var(--primitives-space-3);
		--_badge-content-color: light-dark(var(--primitives-color-critical-0), var(--primitives-color-critical-1000));
		--_badge-font: var(--primitives-font-body-xs-medium-flat);
		--_badge-dot-size: var(--primitives-space-12);
		--_badge-icon-size: var(--primitives-space-14);
		--_badge-icon-offset-correction: var(--primitives-space-1);
		--_badge-ring-thickness: var(--semantics-surfaces-ring-thickness);
		--_badge-ring-color: var(--context-parent-background-color, var(--semantics-surfaces-base-background-color));
		--_badge-pulse-spread: var(--primitives-space-8);
		--_badge-pulse-duration: 1.5s;
		--_badge-corner-radius: var(--primitives-corner-radius-full);

		${inheritedTextReset}
		display: inline-flex;
		vertical-align: middle;
	}

	:host([size="sm"]) {
		--_badge-pulse-spread: var(--primitives-space-6);
		--_badge-height: var(--primitives-space-16);
		--_badge-inline-padding: var(--primitives-space-4);
		--_badge-gap: var(--primitives-space-2);
		--_badge-font: var(--primitives-font-body-xxs-medium-flat);
		--_badge-dot-size: var(--primitives-space-8);
		--_badge-icon-size: var(--primitives-space-12);
	}

	/* ## Color */

	/* color on the host, for the same reason as custom-color below: the contrast
	   token reads currentColor, so without this the flip is computed against the
	   inherited color while the fill comes from the context channel. A row that
	   sets the channel to white over dark text then paints white on white. */
	:host([color="inherit"]) {
		color: var(--context-content-color, currentColor);

		--_badge-background-color: currentColor;
		--_badge-border-color: transparent;
		--_badge-content-color: var(--semantics-content-contrast-color);
	}

	:host([color="accent"]),
	:host([data-color-fallback]) {
		--_badge-background-color: var(--components-badge-accent-background-color);
		--_badge-border-color: var(--components-badge-accent-highlight-border-color);
		--_badge-content-color: var(--components-badge-accent-content-color);
	}

	:host([color="neutral"]) {
		--_badge-background-color: light-dark(var(--primitives-color-neutral-600), var(--primitives-color-neutral-450));
		--_badge-border-color: light-dark(var(--primitives-color-neutral-650), var(--primitives-color-neutral-500));
		--_badge-content-color: light-dark(var(--primitives-color-neutral-0), var(--primitives-color-neutral-1000));
	}

	:host([color="warning"]) {
		--_badge-background-color: light-dark(var(--primitives-color-warning-300), var(--primitives-color-warning-700));
		--_badge-border-color: light-dark(var(--primitives-color-warning-400), var(--primitives-color-warning-600));
		--_badge-content-color: light-dark(var(--primitives-color-warning-1000), var(--primitives-color-warning-0));
	}

	:host([color="success"]) {
		--_badge-background-color: var(--primitives-color-success-500);
		--_badge-border-color: var(--primitives-color-success-550);
		--_badge-content-color: light-dark(var(--primitives-color-success-0), var(--primitives-color-success-1000));
	}


	/* ## Custom color */

	/* color on the host rather than on the fill: the contrast token reads
	   currentColor, so the text lands on black or white without a second formula
	   to keep in step. After every [color] rule, so it wins over one. */
	:host([custom-color]) {
		color: var(--_badge-custom-color);

		--_badge-background-color: var(--_badge-custom-color);
		--_badge-border-color: transparent;
		--_badge-content-color: var(--semantics-content-contrast-color);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.badge {
		box-sizing: border-box;
		display: inline-flex;
		position: relative;
		border-radius: var(--_badge-corner-radius);
		box-shadow:
			0 0 0 var(--_badge-ring-thickness) var(--_badge-ring-color),
			inset 0 0 0 var(--_badge-border-width) var(--_badge-border-color);
		background-color: var(--_badge-background-color);
		min-width: var(--_badge-height);
		height: var(--_badge-height);
		padding: 0 var(--_badge-inline-padding);
		gap: var(--_badge-gap);
		align-items: center;
		justify-content: center;
		font: var(--_badge-font);
		white-space: nowrap;
	}

	@media (forced-colors: active) {
		.badge {
			border: 1px solid CanvasText;
			background-color: Canvas;
		}

		.badge__icon,
		.badge__text {
			color: CanvasText;
		}
	}

	/* A growing box-shadow rather than a scale: scaling multiplies, so a wide
	   badge would throw a halo that is far wider than it is tall. A spread adds
	   the same distance on every side, whatever the badge measures.

	   Painted after the badge, so the ring passes over the contrast border the
	   badge draws in the surface color instead of starting behind it. The
	   element itself is transparent (the ring is the shadow, which paints
	   outside the box), so nothing covers the badge's own fill or text. */
	.badge__pulse {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: 0 0 0 0 var(--_badge-background-color);
		pointer-events: none;
		animation: badge-pulse var(--_badge-pulse-duration) infinite;
	}

	/* The ring rides on the shadow's own color rather than on the element's
	   opacity: at spread zero the shadow has no area, so it can start at full
	   strength without a flash, and it is already transparent when the spread
	   snaps back for the next cycle. Same shape as Shoelace's badge pulse. */
	@keyframes badge-pulse {
		0% {
			box-shadow: 0 0 0 0 var(--_badge-background-color);
		}
		70% {
			box-shadow: 0 0 0 var(--_badge-pulse-spread) transparent;
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}

	/* The ring is decoration on top of a badge that is visible anyway, so it
	   simply goes away rather than pulsing its opacity in place. */
	@media (prefers-reduced-motion: reduce) {
		.badge__pulse {
			display: none;
		}
	}

	/* Forced colors paints the badge in system colors; a ring in the same
	   Canvas would read as a second, half-drawn badge. */
	@media (forced-colors: active) {
		.badge__pulse {
			display: none;
		}
	}

	.badge--dot {
		min-width: var(--_badge-dot-size);
		width: var(--_badge-dot-size);
		height: var(--_badge-dot-size);
		padding: 0;
	}

	.badge--icon-only {
		min-width: var(--_badge-height);
		width: var(--_badge-height);
		padding: 0;
	}


	/* # Elements */

	/* The content carries the content color, not .badge itself: the fill is a
	   custom property that resolves where it is used, and a fill of currentColor
	   on an element that also sets color would take that color instead of the
	   one around it. Mirrors nldd-avatar. */
	.badge__icon {
		color: var(--_badge-content-color);
		display: inline-flex;
		width: var(--_badge-icon-size);
		height: var(--_badge-icon-size);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	.badge__icon:has(+ .badge__text) {
		margin-left: calc((var(--_badge-height) - var(--_badge-icon-size)) / 2 - var(--_badge-inline-padding) + var(--_badge-icon-offset-correction));
	}

	.badge__icon nldd-icon {
		width: 100%;
		height: 100%;
	}

	.badge__text {
		color: var(--_badge-content-color);
		display: inline-block;
	}
`;
