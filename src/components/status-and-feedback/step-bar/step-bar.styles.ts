import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

const smMax = unsafeCSS(breakpoints.smMax);

export const stepBarStyles = css`
	:host {
		box-sizing: border-box;
	}

	:host {
		--_step-bar-compact-text-gap: var(--primitives-space-8);
		--_step-bar-compact-text-color: var(--semantics-content-color);
		--_step-bar-compact-count-color: var(--semantics-content-secondary-color);
		--_step-bar-compact-bar-gap: var(--primitives-space-4);
		--_step-bar-compact-bar-segment-gap: var(--primitives-space-2);
		--_step-bar-compact-bar-corner-radius: var(--primitives-corner-radius-full);
		--_step-bar-track-color: light-dark(var(--primitives-color-neutral-100), var(--primitives-color-neutral-200));
		--_step-bar-compact-bar-height: var(--primitives-space-6);
		--_step-bar-progress-color: var(--semantics-content-accent-color);
		--_step-bar-item-gap: var(--primitives-space-4);
		--_step-bar-marker-size: var(--primitives-space-24);
		--_step-bar-track-thickness: var(--primitives-space-2);
		--_step-bar-marker-z-index: 1;
		--_step-bar-marker-corner-radius: var(--primitives-corner-radius-full);
		--_step-bar-ring-thickness: var(--semantics-surfaces-ring-thickness);
		--_step-bar-ring-color: var(--context-parent-background-color, var(--semantics-surfaces-base-background-color));
		--_step-bar-marker-content-color: var(--semantics-content-secondary-color);
		--_step-bar-progress-content-color: var(--semantics-content-contrast-color);
		--_step-bar-current-fill-color: light-dark(var(--primitives-color-accent-75), var(--primitives-color-accent-100));
		--_step-bar-icon-size: var(--primitives-space-16);
		--_step-bar-title-color: var(--semantics-content-secondary-color);
		--_step-bar-current-title-color: var(--semantics-content-color);
		--_step-bar-control-corner-radius: var(--semantics-controls-md-corner-radius);
		--_step-bar-control-bleed-block: var(--primitives-space-4);
		--_step-bar-control-bleed-inline: var(--primitives-space-8);
		--_step-bar-control-fill-z-index: -1;
		--_step-bar-control-ring-z-index: 1;
		--_step-bar-control-hover-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-150));

		${inheritedTextReset}
		isolation: isolate;
		display: block;
		container-type: inline-size;
	}

	:host([hidden]) {
		display: none;
	}

	.step-bar__items {
		display: flex;
		align-items: start;

		/* Stays in the DOM for assistive tech when the compact view takes over.
		   Standard visually-hidden recipe. */
		@container (max-width: ${smMax}) {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
	}

	.step-bar__compact-text {
		display: none;
		margin: 0;
		gap: var(--_step-bar-compact-text-gap);
		justify-content: space-between;
		align-items: baseline;
		color: var(--_step-bar-compact-text-color);
		font: var(--primitives-font-body-md-regular-flat);

		@container (max-width: ${smMax}) {
			display: flex;
		}
	}

	.step-bar__compact-count {
		color: var(--_step-bar-compact-count-color);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.step-bar__compact-bar {
		display: none;
		margin-top: var(--_step-bar-compact-bar-gap);
		gap: var(--_step-bar-compact-bar-segment-gap);

		@container (max-width: ${smMax}) {
			display: flex;
		}
	}

	.step-bar__compact-bar-segment {
		flex: 1;
		border-radius: var(--_step-bar-compact-bar-corner-radius);
		background-color: var(--_step-bar-track-color);
		height: var(--_step-bar-compact-bar-height);
	}

	.step-bar__compact-bar-segment[data-filled] {
		background-color: var(--_step-bar-progress-color);
	}
`;

export const stepBarItemStyles = css`
	:host {
		box-sizing: border-box;
	}

	:host {
		${inheritedTextReset}
		display: block;
		flex: 1;
		min-width: 0;
	}

	:host([hidden]) {
		display: none;
	}

	.step-bar__item {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--_step-bar-item-gap);
		text-align: center;
	}

	.step-bar__item::before,
	.step-bar__item::after {
		position: absolute;
		top: calc(var(--_step-bar-marker-size) / 2 - var(--_step-bar-track-thickness) / 2);
		height: var(--_step-bar-track-thickness);
		content: "";
		background-color: var(--_step-bar-track-color);
	}

	.step-bar__item::before {
		left: 0;
		right: 50%;
	}

	.step-bar__item::after {
		left: 50%;
		right: 0;
	}

	:host(:first-of-type) .step-bar__item::before {
		content: none;
	}

	:host(:last-of-type) .step-bar__item::after {
		content: none;
	}

	.step-bar__item.is-past::before {
		background-color: var(--_step-bar-progress-color);
	}

	.step-bar__item.is-past::after {
		background-color: var(--_step-bar-progress-color);
	}

	.step-bar__item.is-current::before {
		background-color: var(--_step-bar-progress-color);
	}

	.step-bar__item-marker {
		box-sizing: border-box;
		position: relative;
		z-index: var(--_step-bar-marker-z-index);
		display: flex;
		width: var(--_step-bar-marker-size);
		height: var(--_step-bar-marker-size);
		align-items: center;
		justify-content: center;
		border-radius: var(--_step-bar-marker-corner-radius);
		/* Ring in the background color: masks the track running underneath, so
		   the marker gets breathing room without shortening the track. */
		box-shadow: 0 0 0 var(--_step-bar-ring-thickness) var(--_step-bar-ring-color);
		background-color: var(--_step-bar-track-color);
		color: var(--_step-bar-marker-content-color);
		font: var(--primitives-font-body-sm-medium-flat);

		@media (forced-colors: active) {
			border: var(--primitives-border-width-regular) solid CanvasText;
		}
	}

	.step-bar__item.is-past .step-bar__item-marker {
		background-color: var(--_step-bar-progress-color);
		color: var(--_step-bar-progress-content-color);
	}

	.step-bar__item.is-current .step-bar__item-marker {
		border: var(--_step-bar-track-thickness) solid var(--_step-bar-progress-color);
		background-color: var(--_step-bar-current-fill-color);
		color: var(--_step-bar-progress-color);
	}

	.step-bar__item-icon {
		width: var(--_step-bar-icon-size);
		height: var(--_step-bar-icon-size);
	}

	.step-bar__item-title {
		color: var(--_step-bar-title-color);
		font: var(--primitives-font-body-sm-regular-flat);
		overflow-wrap: anywhere;
	}

	.step-bar__item.is-current .step-bar__item-title {
		color: var(--_step-bar-current-title-color);
	}

	/* Standard visually-hidden recipe. */
	.step-bar__item-status {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.step-bar__item-control {
		position: relative;
		display: flex;
		width: fit-content;
		max-width: 100%;
		flex-direction: column;
		align-items: center;
		gap: var(--_step-bar-item-gap);
		padding: 0;
		border: none;
		border-radius: var(--_step-bar-control-corner-radius);
		background: none;
		color: inherit;
		cursor: var(--semantics-controls-link-cursor);
		font: inherit;
		text-decoration: none;
	}

	/* Two layers on the same box, bleeding past the control rather than padding
	   it: padding would move the marker down while the track sits at a fixed
	   offset, and the two would no longer line up. ::before carries the fill and
	   stays under the track; ::after carries the focus ring and goes over it. */
	.step-bar__item-control::before,
	.step-bar__item-control::after {
		position: absolute;
		inset: calc(var(--_step-bar-control-bleed-block) * -1) calc(var(--_step-bar-control-bleed-inline) * -1);
		border-radius: var(--_step-bar-control-corner-radius);
		content: "";
		pointer-events: none;
	}

	.step-bar__item-control::before {
		z-index: var(--_step-bar-control-fill-z-index);
	}

	.step-bar__item-control::after {
		z-index: var(--_step-bar-control-ring-z-index);
	}

	.step-bar__item-control:focus-visible {
		/* The ring lives on ::after, so the control's own must go — two rings on
		   one control is what the browser default would add here. */
		outline: none;
	}

	.step-bar__item-control:focus-visible::after {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	/* Hover only on hover-capable devices: keeps a touch-scroll from lighting up
	   the step under the finger. */
	@media (hover: hover) {
		.step-bar__item-control:hover {
			/* The marker's ring masks the track in the surrounding color, so it
			   has to follow the hover fill or it paints a halo on top of it. */
			--_step-bar-ring-color: var(--_step-bar-control-hover-background-color);
		}

		.step-bar__item-control:hover::before {
			background-color: var(--_step-bar-control-hover-background-color);
		}
	}
`;
