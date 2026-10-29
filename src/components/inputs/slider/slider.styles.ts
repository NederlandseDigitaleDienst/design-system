import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const sliderStyles = css`


	/* # Host */

	:host {
		--_slider-gap: var(--primitives-space-8);
		--_slider-icon-size: var(--primitives-space-28);
		--_slider-icon-color: var(--semantics-content-color);
		--_slider-control-height: var(--semantics-controls-md-min-size);
		--_slider-start: 0;
		--_slider-end: 0;
		--_slider-track-height: var(--primitives-space-8);
		--_slider-track-color: light-dark(var(--primitives-color-neutral-150), var(--primitives-color-neutral-300));
		--_slider-fill-color: var(--context-selected-indicator-color, var(--semantics-controls-is-selected-indicator-color));
		--_slider-thumb-size: var(--primitives-space-28);
		--_slider-thumb-hit-size: var(--_slider-control-height);
		--_slider-thumb-inset: calc((var(--_slider-thumb-hit-size) - var(--_slider-thumb-size)) / 2);
		--_slider-thumb-background-color: var(--semantics-surfaces-base-background-color);
		--_slider-thumb-border-width: var(--primitives-border-width-regular);
		--_slider-thumb-border-color: light-dark(var(--primitives-color-neutral-550), var(--primitives-color-neutral-650));
		--_slider-thumb-focus-gap-color: var(--semantics-surfaces-base-background-color);
		--_slider-thumb-is-hovered-border-color: light-dark(var(--primitives-color-neutral-650), var(--primitives-color-neutral-750));
		--_slider-thumb-is-hovered-background-color: var(--semantics-buttons-neutral-base-is-hovered-background-color);
		--_slider-thumb-is-active-border-color: light-dark(var(--primitives-color-neutral-750), var(--primitives-color-neutral-850));
		--_slider-thumb-is-active-background-color: var(--semantics-buttons-neutral-base-is-active-background-color);
		--_slider-histogram-height: var(--primitives-space-48);
		--_slider-histogram-gap: var(--primitives-space-1);
		--_slider-histogram-color: var(--_slider-track-color);
		--_slider-histogram-selected-color: color-mix(in oklab, var(--_slider-fill-color) 40%, transparent);
		--_slider-bar-corner-radius: var(--primitives-space-2);
		--_slider-bar-height: 0;
		--_slider-tooltip-offset: var(--primitives-space-8);
		--_slider-tooltip-shift: 0px;
		--_slider-tooltip-background-color: var(--semantics-tooltips-background-color);
		--_slider-tooltip-content-color: var(--semantics-tooltips-content-color);
		--_slider-tooltip-box-shadow: var(--semantics-tooltips-box-shadow);
		--_slider-tooltip-corner-radius: var(--semantics-tooltips-corner-radius);
		--_slider-tooltip-padding-block: var(--semantics-tooltips-padding-block);
		--_slider-tooltip-padding-inline: var(--semantics-tooltips-padding-inline);
		--_slider-tooltip-font: var(--semantics-tooltips-font);
		--_slider-tooltip-transition-duration: var(--primitives-transition-duration-fast);

		${inheritedTextReset}
		box-sizing: border-box;
		display: block;
		width: 100%;
		-webkit-tap-highlight-color: transparent;
	}

	:host([size="sm"]) {
		--_slider-icon-size: var(--primitives-space-24);
		--_slider-control-height: var(--semantics-controls-sm-min-size);
		--_slider-track-height: var(--primitives-space-6);
		--_slider-thumb-size: var(--primitives-space-24);
		--_slider-histogram-height: var(--primitives-space-32);
	}

	:host([size="xs"]) {
		--_slider-gap: var(--primitives-space-4);
		--_slider-icon-size: var(--primitives-space-20);
		--_slider-control-height: var(--semantics-controls-xs-min-size);
		--_slider-track-height: var(--primitives-space-4);
		--_slider-thumb-size: var(--primitives-space-20);
		--_slider-histogram-height: var(--primitives-space-24);
	}

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}


	/* # Block */

	.slider {
		display: flex;
		width: 100%;
		gap: var(--_slider-gap);
		align-items: center;
	}

	.slider__start-icon,
	.slider__end-icon {
		display: flex;
		flex-shrink: 0;
		width: var(--_slider-icon-size);
		height: var(--_slider-icon-size);
		color: var(--_slider-icon-color);
	}


	/* # Control */

	.slider__control {
		position: relative;
		min-width: 0;
		height: var(--_slider-control-height);
		flex-grow: 1;
		touch-action: pan-y;
	}

	.slider__track,
	.slider__fill {
		position: absolute;
		top: 50%;
		border-radius: var(--_slider-track-height);
		pointer-events: none;
		height: var(--_slider-track-height);
		transform: translateY(-50%);
	}

	.slider__track {
		inset-inline: 0;
		background-color: var(--_slider-track-color);
	}

	.slider__fill {
		inset-inline-start: 0;
		background-color: var(--_slider-fill-color);
		width: calc(var(--_slider-thumb-size) / 2 + (100% - var(--_slider-thumb-size)) * var(--_slider-end));
	}

	:host([range]) .slider__fill {
		inset-inline-start: calc(var(--_slider-thumb-size) / 2 + (100% - var(--_slider-thumb-size)) * var(--_slider-start));
		width: calc((100% - var(--_slider-thumb-size)) * (var(--_slider-end) - var(--_slider-start)));
	}


	/* # Histogram */

	.slider__control.has-histogram {
		margin-top: calc(var(--_slider-histogram-height) - (var(--_slider-control-height) - var(--_slider-track-height)) / 2);
	}

	.slider__histogram {
		display: flex;
		position: absolute;
		bottom: 50%;
		inset-inline: 0;
		pointer-events: none;
		height: calc(var(--_slider-histogram-height) + var(--_slider-track-height) / 2);
		gap: var(--_slider-histogram-gap);
		align-items: flex-end;
	}

	.slider__bar {
		border-start-start-radius: var(--_slider-bar-corner-radius);
		border-start-end-radius: var(--_slider-bar-corner-radius);
		background-color: var(--_slider-histogram-color);
		height: calc(var(--_slider-track-height) / 2 + var(--_slider-bar-height) * var(--_slider-histogram-height));
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	.slider__bar.is-selected {
		background-color: var(--_slider-histogram-selected-color);
	}


	/* # Input and thumb */

	/* The thumb is pressed on the full control height and drawn smaller inside a
	   transparent ring, so the input runs past the edges by that ring. */
	.slider__input {
		position: absolute;
		inset-block: 0;
		inset-inline-start: calc(var(--_slider-thumb-inset) * -1);
		margin: 0;
		outline: none;
		background: transparent;
		cursor: default;
		width: calc(100% + var(--_slider-thumb-inset) * 2);
		height: 100%;
		padding: 0;
		appearance: none;
	}

	/* In a range only the thumbs take a press; the track goes to the control,
	   which moves the nearer thumb. */
	:host([range]) .slider__input {
		pointer-events: none;
	}

	.slider__input--end {
		z-index: 1;
	}

	.is-start-on-top .slider__input--start {
		z-index: 2;
	}

	.is-stacked .slider__input::-webkit-slider-thumb {
		pointer-events: none;
	}

	.is-stacked .slider__input::-moz-range-thumb {
		pointer-events: none;
	}

	.slider__input::-webkit-slider-runnable-track {
		border: none;
		background: transparent;
		height: 100%;
	}

	.slider__input::-moz-range-track {
		border: none;
		background: transparent;
		height: 100%;
	}

	/* Focus fills the ring with the surface color as the gap of the focus ring. */
	.slider__input::-webkit-slider-thumb {
		box-sizing: border-box;
		margin-top: calc((var(--_slider-control-height) - var(--_slider-thumb-hit-size)) / 2);
		border: var(--_slider-thumb-inset) solid transparent;
		border-radius: 50%;
		box-shadow: inset 0 0 0 var(--_slider-thumb-border-width) var(--_slider-thumb-border-color);
		background-color: var(--_slider-thumb-background-color);
		background-clip: padding-box;
		pointer-events: auto;
		width: var(--_slider-thumb-hit-size);
		height: var(--_slider-thumb-hit-size);
		appearance: none;
	}

	.slider__input::-moz-range-thumb {
		box-sizing: border-box;
		border: var(--_slider-thumb-inset) solid transparent;
		border-radius: 50%;
		box-shadow: inset 0 0 0 var(--_slider-thumb-border-width) var(--_slider-thumb-border-color);
		background-color: var(--_slider-thumb-background-color);
		background-clip: padding-box;
		pointer-events: auto;
		width: var(--_slider-thumb-hit-size);
		height: var(--_slider-thumb-hit-size);
	}

	@media (hover: hover) {
		.slider__input::-webkit-slider-thumb:hover {
			--_slider-thumb-border-color: var(--_slider-thumb-is-hovered-border-color);
			--_slider-thumb-background-color: var(--_slider-thumb-is-hovered-background-color);
		}

		.slider__input::-moz-range-thumb:hover {
			--_slider-thumb-border-color: var(--_slider-thumb-is-hovered-border-color);
			--_slider-thumb-background-color: var(--_slider-thumb-is-hovered-background-color);
		}
	}

	.slider__input:active::-webkit-slider-thumb {
		--_slider-thumb-border-color: var(--_slider-thumb-is-active-border-color);
		--_slider-thumb-background-color: var(--_slider-thumb-is-active-background-color);
	}

	.slider__input:active::-moz-range-thumb {
		--_slider-thumb-border-color: var(--_slider-thumb-is-active-border-color);
		--_slider-thumb-background-color: var(--_slider-thumb-is-active-background-color);
	}

	.slider__input:focus-visible::-webkit-slider-thumb {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: calc(var(--semantics-focus-ring-outline-offset) - var(--_slider-thumb-inset));
		border-color: var(--_slider-thumb-focus-gap-color);
	}

	.slider__input:focus-visible::-moz-range-thumb {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: calc(var(--semantics-focus-ring-outline-offset) - var(--_slider-thumb-inset));
		border-color: var(--_slider-thumb-focus-gap-color);
	}


	/* # Tooltip */

	.slider__tooltip {
		box-sizing: border-box;
		position: absolute;
		z-index: 3;
		bottom: calc(100% + var(--_slider-tooltip-offset));
		inset-inline-start: calc(var(--_slider-thumb-size) / 2 + (100% - var(--_slider-thumb-size)) * var(--_slider-end));
		visibility: hidden;
		opacity: 0;
		border-radius: var(--_slider-tooltip-corner-radius);
		box-shadow: var(--_slider-tooltip-box-shadow);
		background-color: var(--_slider-tooltip-background-color);
		pointer-events: none;
		width: max-content;
		padding-block: var(--_slider-tooltip-padding-block);
		padding-inline: var(--_slider-tooltip-padding-inline);
		color: var(--_slider-tooltip-content-color);
		font: var(--_slider-tooltip-font);
		white-space: nowrap;
		transition: opacity var(--_slider-tooltip-transition-duration), visibility var(--_slider-tooltip-transition-duration);
		transform: translateX(calc(-50% + var(--_slider-tooltip-shift)));
	}

	:host(:dir(rtl)) .slider__tooltip {
		transform: translateX(calc(50% + var(--_slider-tooltip-shift)));
	}

	.has-histogram .slider__tooltip {
		bottom: calc(50% + var(--_slider-track-height) / 2 + var(--_slider-histogram-height) + var(--_slider-tooltip-offset));
	}

	.slider__tooltip--start {
		inset-inline-start: calc(var(--_slider-thumb-size) / 2 + (100% - var(--_slider-thumb-size)) * var(--_slider-start));
	}

	.slider__tooltip--both {
		inset-inline-start: calc(var(--_slider-thumb-size) / 2 + (100% - var(--_slider-thumb-size)) * (var(--_slider-start) + var(--_slider-end)) / 2);
	}

	/* Shown while the pointer is over the slider, a thumb has keyboard focus or
	   is dragged: each thumb its own, or the two of a range as one where they
	   would overlap. */
	.slider__control:not(.is-merged):is(:hover, .is-active, :has(.slider__input:focus-visible)) :is(.slider__tooltip--value, .slider__tooltip--start, .slider__tooltip--end),
	.slider__control.is-merged:is(:hover, .is-active, :has(.slider__input:focus-visible)) .slider__tooltip--both {
		visibility: visible;
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.slider__tooltip {
			transition: none;
		}
	}


	/* # High contrast */

	@media (forced-colors: active) {
		.slider__track {
			background-color: GrayText;
		}

		.slider__fill {
			background-color: Highlight;
		}
	}
`;
