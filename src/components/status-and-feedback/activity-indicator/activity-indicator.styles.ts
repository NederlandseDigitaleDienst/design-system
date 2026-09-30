import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const activityIndicatorStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_circle-size: var(--primitives-space-32);
		--_color: var(--context-content-color, currentColor);
		--_track-opacity: 0.25;
		--_stroke-width: 2;
		--_rotation-duration: 0.8s;
		--_fade-duration: var(--primitives-transition-duration-slow);
		--_fade-easing: ease-out;
		--_pulse-duration: 2s;
		--_pulse-easing: ease-in-out;
		--_max-width: var(--primitives-area-240);
		--_gap: var(--primitives-space-4);
		--_text-font: var(--primitives-font-body-sm-regular-flat);
		--_backdrop-blur: 3px;
		--_overlay-panel-padding: var(--primitives-space-12);
		--_overlay-panel-corner-radius: var(--primitives-corner-radius-md);

		${inheritedTextReset}
		box-sizing: border-box;
		display: flex;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: auto;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
	}

	/* Overlay mode (content in the default slot): the host wraps the content and
	   is the containing block for the absolutely-positioned indicator + backdrop,
	   so it sizes to the content instead of filling its parent. */
	:host([has-content]) {
		display: block;
		position: relative;
		height: auto;
	}

	:host([hidden]) {
		display: none;
	}


	/* ## Sizes (icon scale) */

	:host([size="16"]) { --_circle-size: var(--primitives-space-16); }
	:host([size="20"]) { --_circle-size: var(--primitives-space-20); }
	:host([size="24"]) { --_circle-size: var(--primitives-space-24); }
	:host([size="28"]) { --_circle-size: var(--primitives-space-28); }
	:host([size="40"]) { --_circle-size: var(--primitives-space-40); }
	:host([size="44"]) { --_circle-size: var(--primitives-space-44); }
	:host([size="48"]) { --_circle-size: var(--primitives-space-48); }
	:host([size="56"]) { --_circle-size: var(--primitives-space-56); }
	:host([size="64"]) { --_circle-size: var(--primitives-space-64); }
	:host([size="80"]) { --_circle-size: var(--primitives-space-80); }
	:host([size="96"]) { --_circle-size: var(--primitives-space-96); }


	/* # Block
	   Stacks the default circle + label as a centered column. width:100% +
	   max-width gives a slotted progress-bar a width to fill; the fixed-size
	   circle and the label stay centered via align-items. */

	.activity-indicator {
		/* position:relative so it paints above the absolutely-positioned backdrop
		   (both are z-index:auto; the backdrop comes first in the DOM). Hidden by
		   default; the loading host attribute fades it (and the backdrop) in and
		   out — opacity + display via transition-behavior: allow-discrete, with a
		   starting-style for the entry. */
		position: relative;
		display: none;
		opacity: 0;
		pointer-events: none;
		width: 100%;
		max-width: var(--_max-width);
		flex-direction: column;
		align-items: center;
		gap: var(--_gap);
		transition-property: opacity, display;
		transition-duration: var(--_fade-duration);
		transition-timing-function: var(--_fade-easing);
		transition-behavior: allow-discrete;
	}

	:host([loading]) .activity-indicator {
		display: flex;
		opacity: 1;
	}

	@starting-style {
		:host([loading]) .activity-indicator {
			opacity: 0;
		}
	}

	/* Overlay mode: the wrapped content flows normally; the indicator + backdrop
	   sit on top as absolute layers that fill the host. */
	.activity-indicator__content {
		display: block;
	}

	/* Overlay mode: the indicator + label sit on a small rounded base-surface
	   panel that hugs them with padding (not the full component width) so they
	   keep contrast over the dimmed content, and read in the content color
	   instead of inheriting currentColor. */
	:host([has-content]) .activity-indicator {
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left: 50%;
		border-radius: var(--_overlay-panel-corner-radius);
		background-color: var(--semantics-surfaces-base-background-color);
		width: max-content;
		max-width: calc(100% - var(--primitives-space-32));
		padding: var(--_overlay-panel-padding);
		color: var(--semantics-content-color);
		transform: translate(-50%, -50%);
	}

	/* Dimming layer (overlay mode, on by default; opt out with no-backdrop): the
	   context parent background color — fallback the base surface — at one minus
	   the disabled opacity, so the content underneath reads as inactive while
	   loading. Fades in and out with the indicator via the loading attribute. */
	.activity-indicator__backdrop {
		position: absolute;
		inset: 0;
		display: none;
		opacity: 0;
		/* Frosted dim: the parent surface — fallback base surface — as a
		   translucent fill at one minus the disabled opacity (a translucent
		   color, not element opacity, which would hide the blur), plus a blur so
		   the content behind reads as inactive. backdrop-filter degrades
		   gracefully where unsupported, leaving just the translucent fill. */
		background-color: color-mix(in oklab, var(--context-parent-background-color, var(--semantics-surfaces-base-background-color)) calc((1 - var(--primitives-opacity-disabled)) * 100%), transparent);
		-webkit-backdrop-filter: blur(var(--_backdrop-blur));
		backdrop-filter: blur(var(--_backdrop-blur));
		pointer-events: none;
		transition-property: opacity, display;
		transition-duration: var(--_fade-duration);
		transition-timing-function: var(--_fade-easing);
		transition-behavior: allow-discrete;
	}

	:host([loading]) .activity-indicator__backdrop {
		display: block;
		opacity: 1;
	}

	@starting-style {
		:host([loading]) .activity-indicator__backdrop {
			opacity: 0;
		}
	}

	/* display:contents so the default circle + label (or a slotted override)
	   are direct flex items of the block. */
	slot {
		display: contents;
	}


	/* # Elements */

	/* The whole SVG (stroke included) scales with the size, like an icon. */
	.activity-indicator__circle {
		display: block;
		width: var(--_circle-size);
		height: var(--_circle-size);
	}

	.activity-indicator__track {
		opacity: var(--_track-opacity);
		stroke: var(--_color);
		stroke-width: var(--_stroke-width);
	}

	/* Rotate only the arc inside the SVG (around the view-box center via
	   transform-origin) rather than the whole <svg> element — rotating the
	   element visibly wobbles when it sits at a sub-pixel position (next to a
	   label, or overlaid on a button). Mirrors nldd-progress-circle. */
	.activity-indicator__indicator {
		stroke: var(--_color);
		stroke-width: var(--_stroke-width);
		stroke-linecap: round;
		stroke-dasharray: 25 100;
		transform-origin: 50% 50%;
		animation: activity-indicator-rotate var(--_rotation-duration) linear infinite;
	}

	@keyframes activity-indicator-rotate {
		to { transform: rotate(360deg); }
	}

	.activity-indicator__text {
		color: currentColor;
		font: var(--_text-font);
		text-align: center;
	}

	/* show-text off (default): the label still renders as the announced
	   content of the role="status" host, but is visually hidden.
	   Standard visually-hidden recipe. */
	.activity-indicator__text--visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}


	/* # Reduced Motion */

	@media (prefers-reduced-motion: reduce) {
		.activity-indicator,
		.activity-indicator__backdrop {
			transition: none;
		}

		.activity-indicator__indicator {
			/* Drop the rotation (vestibular safety); keep the 25 / 100 arc and
			   pulse its opacity instead, mirroring nldd-progress-circle. */
			animation: activity-indicator-pulse var(--_pulse-duration) var(--_pulse-easing) infinite;
		}

		@keyframes activity-indicator-pulse {
			0%, 100% { opacity: 0.3; }
			50% { opacity: 0.7; }
		}
	}
`;
