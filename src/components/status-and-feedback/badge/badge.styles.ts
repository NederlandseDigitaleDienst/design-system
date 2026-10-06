import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const badgeStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_custom-color: transparent;
		--_background-color: var(--semantics-categories-critical-filled-background-color);
		--_border-color: var(--semantics-categories-critical-filled-highlight-border-color);
		--_border-width: var(--primitives-border-width-thin);
		--_height: var(--primitives-space-20);
		--_inline-padding: var(--primitives-space-6);
		--_gap: var(--primitives-space-3);
		--_content-color: var(--semantics-categories-critical-filled-content-color);
		--_font: var(--primitives-font-body-xs-medium-flat);
		--_dot-size: var(--primitives-space-12);
		--_icon-size: var(--primitives-space-14);
		--_icon-offset-correction: var(--primitives-space-1);
		--_ring-thickness: var(--semantics-surfaces-ring-thickness);
		--_ring-color: var(--context-parent-background-color, var(--semantics-surfaces-base-background-color));
		--_pulse-spread: var(--primitives-space-8);
		--_pulse-duration: 1.5s;
		--_badge-corner-radius: var(--primitives-corner-radius-full);

		${inheritedTextReset}
		display: inline-flex;
		vertical-align: middle;
	}

	:host([size="sm"]) {
		--_pulse-spread: var(--primitives-space-6);
		--_height: var(--primitives-space-16);
		--_inline-padding: var(--primitives-space-4);
		--_gap: var(--primitives-space-2);
		--_font: var(--primitives-font-body-xxs-medium-flat);
		--_dot-size: var(--primitives-space-8);
		--_icon-size: var(--primitives-space-12);
	}

	/* ## Color */

	/* color on the host, for the same reason as custom-color below: the contrast
	   token reads currentColor, so without this the flip is computed against the
	   inherited color while the fill comes from the context channel. A row that
	   sets the channel to white over dark text then paints white on white. */
	:host([color="inherit"]) {
		color: var(--context-content-color, currentColor);

		--_background-color: currentColor;
		--_border-color: transparent;
		--_content-color: var(--semantics-content-contrast-color);
	}

	:host([color="accent"]) {
		--_background-color: var(--semantics-categories-accent-filled-background-color);
		--_border-color: var(--semantics-categories-accent-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-accent-filled-content-color);
	}

	:host([color="neutral"]) {
		--_background-color: var(--semantics-categories-neutral-filled-background-color);
		--_border-color: var(--semantics-categories-neutral-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-neutral-filled-content-color);
	}

	:host([color="warning"]) {
		--_background-color: var(--semantics-categories-warning-filled-background-color);
		--_border-color: var(--semantics-categories-warning-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-warning-filled-content-color);
	}

	:host([color="success"]) {
		--_background-color: var(--semantics-categories-success-filled-background-color);
		--_border-color: var(--semantics-categories-success-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-success-filled-content-color);
	}


	/* ## Color — rijkskleuren */

	:host([color="lintblauw"]) {
		--_background-color: var(--semantics-categories-lintblauw-filled-background-color);
		--_border-color: var(--semantics-categories-lintblauw-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-lintblauw-filled-content-color);
	}

	:host([color="donkerblauw"]) {
		--_background-color: var(--semantics-categories-donkerblauw-filled-background-color);
		--_border-color: var(--semantics-categories-donkerblauw-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-donkerblauw-filled-content-color);
	}

	:host([color="hemelblauw"]) {
		--_background-color: var(--semantics-categories-hemelblauw-filled-background-color);
		--_border-color: var(--semantics-categories-hemelblauw-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-hemelblauw-filled-content-color);
	}

	:host([color="lichtblauw"]) {
		--_background-color: var(--semantics-categories-lichtblauw-filled-background-color);
		--_border-color: var(--semantics-categories-lichtblauw-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-lichtblauw-filled-content-color);
	}

	:host([color="paars"]) {
		--_background-color: var(--semantics-categories-paars-filled-background-color);
		--_border-color: var(--semantics-categories-paars-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-paars-filled-content-color);
	}

	:host([color="violet"]) {
		--_background-color: var(--semantics-categories-violet-filled-background-color);
		--_border-color: var(--semantics-categories-violet-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-violet-filled-content-color);
	}

	:host([color="robijnrood"]) {
		--_background-color: var(--semantics-categories-robijnrood-filled-background-color);
		--_border-color: var(--semantics-categories-robijnrood-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-robijnrood-filled-content-color);
	}

	:host([color="roze"]) {
		--_background-color: var(--semantics-categories-roze-filled-background-color);
		--_border-color: var(--semantics-categories-roze-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-roze-filled-content-color);
	}

	:host([color="rood"]) {
		--_background-color: var(--semantics-categories-rood-filled-background-color);
		--_border-color: var(--semantics-categories-rood-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-rood-filled-content-color);
	}

	:host([color="oranje"]) {
		--_background-color: var(--semantics-categories-oranje-filled-background-color);
		--_border-color: var(--semantics-categories-oranje-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-oranje-filled-content-color);
	}

	:host([color="donkergeel"]) {
		--_background-color: var(--semantics-categories-donkergeel-filled-background-color);
		--_border-color: var(--semantics-categories-donkergeel-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-donkergeel-filled-content-color);
	}

	:host([color="geel"]) {
		--_background-color: var(--semantics-categories-geel-filled-background-color);
		--_border-color: var(--semantics-categories-geel-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-geel-filled-content-color);
	}

	:host([color="donkerbruin"]) {
		--_background-color: var(--semantics-categories-donkerbruin-filled-background-color);
		--_border-color: var(--semantics-categories-donkerbruin-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-donkerbruin-filled-content-color);
	}

	:host([color="bruin"]) {
		--_background-color: var(--semantics-categories-bruin-filled-background-color);
		--_border-color: var(--semantics-categories-bruin-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-bruin-filled-content-color);
	}

	:host([color="donkergroen"]) {
		--_background-color: var(--semantics-categories-donkergroen-filled-background-color);
		--_border-color: var(--semantics-categories-donkergroen-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-donkergroen-filled-content-color);
	}

	:host([color="groen"]) {
		--_background-color: var(--semantics-categories-groen-filled-background-color);
		--_border-color: var(--semantics-categories-groen-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-groen-filled-content-color);
	}

	:host([color="mosgroen"]) {
		--_background-color: var(--semantics-categories-mosgroen-filled-background-color);
		--_border-color: var(--semantics-categories-mosgroen-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-mosgroen-filled-content-color);
	}

	:host([color="mintgroen"]) {
		--_background-color: var(--semantics-categories-mintgroen-filled-background-color);
		--_border-color: var(--semantics-categories-mintgroen-filled-highlight-border-color);
		--_content-color: var(--semantics-categories-mintgroen-filled-content-color);
	}

	/* color on the host rather than on the fill: the contrast token reads
	   currentColor, so the text lands on black or white without a second formula
	   to keep in step. After every [color] rule, so it wins over one. */
	:host([custom-color]) {
		color: var(--_custom-color);

		--_background-color: var(--_custom-color);
		--_border-color: transparent;
		--_content-color: var(--semantics-content-contrast-color);
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
			0 0 0 var(--_ring-thickness) var(--_ring-color),
			inset 0 0 0 var(--_border-width) var(--_border-color);
		background-color: var(--_background-color);
		min-width: var(--_height);
		height: var(--_height);
		padding: 0 var(--_inline-padding);
		gap: var(--_gap);
		align-items: center;
		justify-content: center;
		font: var(--_font);
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
		box-shadow: 0 0 0 0 var(--_background-color);
		pointer-events: none;
		animation: badge-pulse var(--_pulse-duration) infinite;
	}

	/* The ring rides on the shadow's own color rather than on the element's
	   opacity: at spread zero the shadow has no area, so it can start at full
	   strength without a flash, and it is already transparent when the spread
	   snaps back for the next cycle. Same shape as Shoelace's badge pulse. */
	@keyframes badge-pulse {
		0% {
			box-shadow: 0 0 0 0 var(--_background-color);
		}
		70% {
			box-shadow: 0 0 0 var(--_pulse-spread) transparent;
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
		min-width: var(--_dot-size);
		width: var(--_dot-size);
		height: var(--_dot-size);
		padding: 0;
	}

	.badge--icon-only {
		min-width: var(--_height);
		width: var(--_height);
		padding: 0;
	}


	/* # Elements */

	/* The content carries the content color, not .badge itself: the fill is a
	   custom property that resolves where it is used, and a fill of currentColor
	   on an element that also sets color would take that color instead of the
	   one around it. Mirrors nldd-avatar. */
	.badge__icon {
		color: var(--_content-color);
		display: inline-flex;
		width: var(--_icon-size);
		height: var(--_icon-size);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	.badge__icon:has(+ .badge__text) {
		margin-left: calc((var(--_height) - var(--_icon-size)) / 2 - var(--_inline-padding) + var(--_icon-offset-correction));
	}

	.badge__icon nldd-icon {
		width: 100%;
		height: 100%;
	}

	.badge__text {
		color: var(--_content-color);
		display: inline-block;
	}
`;
