import { css } from 'lit';
import { inheritedTextReset, surfaceContent } from '../../../assets/styles/shadow-resets.js';

export const admonitionStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_admonition-border-width: var(--semantics-surfaces-highlight-border-width);
		--_admonition-border-color: var(--semantics-surfaces-tinted-highlight-border-color);
		--_admonition-corner-radius: var(--primitives-corner-radius-lg);
		--_admonition-background-color: var(--semantics-surfaces-base-background-color);
		--_admonition-content-color: var(--semantics-content-color);
		--_admonition-title-bar-background-color: var(--semantics-surfaces-tinted-background-color);
		--_admonition-title-bar-hover-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-50));
		--_admonition-title-bar-min-height: var(--semantics-controls-md-min-size);
		--_admonition-inset: var(--primitives-space-12);
		--_admonition-gap: var(--primitives-space-8);
		--_admonition-title-bar-corner-radius: calc(var(--_admonition-corner-radius) - var(--_admonition-border-width));
		--_admonition-icon-size: var(--primitives-space-24);
		--_admonition-icon-color: var(--primitives-color-neutral-750);
		--_admonition-chevron-size: var(--primitives-space-20);
		--_admonition-chevron-open-rotation: 180deg;
		--_admonition-transition-duration: var(--primitives-transition-duration-fast);

		${inheritedTextReset}
		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}

	:host([variant="accent"]) {
		--_admonition-border-color: var(--semantics-surfaces-accent-tinted-highlight-border-color);
		--_admonition-title-bar-background-color: var(--semantics-surfaces-accent-tinted-background-color);
		--_admonition-title-bar-hover-background-color: light-dark(var(--primitives-color-accent-50), var(--primitives-color-accent-50));
		--_admonition-icon-color: var(--components-admonition-accent-icon-color);
	}

	:host([variant="success"]) {
		--_admonition-border-color: var(--semantics-surfaces-success-tinted-highlight-border-color);
		--_admonition-title-bar-background-color: var(--semantics-surfaces-success-tinted-background-color);
		--_admonition-title-bar-hover-background-color: light-dark(var(--primitives-color-success-75), var(--primitives-color-success-50));
		--_admonition-icon-color: light-dark(var(--primitives-color-success-550), var(--primitives-color-success-650));
	}

	:host([variant="warning"]) {
		--_admonition-border-color: var(--semantics-surfaces-warning-tinted-highlight-border-color);
		--_admonition-title-bar-background-color: var(--semantics-surfaces-warning-tinted-background-color);
		--_admonition-title-bar-hover-background-color: light-dark(var(--primitives-color-warning-75), var(--primitives-color-warning-50));
		--_admonition-icon-color: light-dark(var(--primitives-color-warning-450), var(--primitives-color-warning-650));
	}

	:host([variant="critical"]) {
		--_admonition-border-color: var(--semantics-surfaces-critical-tinted-highlight-border-color);
		--_admonition-title-bar-background-color: var(--semantics-surfaces-critical-tinted-background-color);
		--_admonition-title-bar-hover-background-color: light-dark(var(--primitives-color-critical-75), var(--primitives-color-critical-50));
		--_admonition-icon-color: var(--primitives-color-critical-600);
	}


	/* # Block */

	.admonition {
		--context-background-color: var(--_admonition-background-color);
		${surfaceContent}
		box-sizing: border-box;
		display: block;
		border: var(--_admonition-border-width) solid var(--_admonition-border-color);
		border-radius: var(--_admonition-corner-radius);
		background-color: var(--_admonition-background-color);
		--context-content-color: var(--_admonition-content-color);
		color: var(--_admonition-content-color);
	}

	@media (forced-colors: active) {
		.admonition {
			border-color: CanvasText;
		}
	}


	/* # Title bar */

	.admonition__title-bar {
		--context-background-color: var(--_admonition-title-bar-background-color);
		box-sizing: border-box;
		display: flex;
		background-color: var(--_admonition-title-bar-background-color);
		border-start-start-radius: var(--_admonition-title-bar-corner-radius);
		border-start-end-radius: var(--_admonition-title-bar-corner-radius);
		min-height: var(--_admonition-title-bar-min-height);
		padding-block: calc((var(--_admonition-title-bar-min-height) - 1lh) / 2);
		padding-inline-start: var(--_admonition-inset);
		padding-inline-end: var(--_admonition-inset);
		align-items: flex-start;
		gap: var(--_admonition-gap);
		font: var(--primitives-font-body-md-medium-snug);
		list-style: none;
		-webkit-tap-highlight-color: transparent;
	}

	summary.admonition__title-bar {
		cursor: default;
		padding-inline-end: calc((var(--_admonition-title-bar-min-height) - var(--_admonition-chevron-size)) / 2);
	}

	summary.admonition__title-bar::-webkit-details-marker {
		display: none;
	}

	@media (hover: hover) {
		summary.admonition__title-bar:hover {
			--context-background-color: var(--_admonition-title-bar-hover-background-color);
			background-color: var(--_admonition-title-bar-hover-background-color);
		}
	}

	summary.admonition__title-bar:active {
		--context-background-color: var(--_admonition-title-bar-hover-background-color);
		background-color: var(--_admonition-title-bar-hover-background-color);
	}

	/* Closing, the bar keeps its square corners and its line until the content is gone. */
	.admonition:not([open]) > summary.admonition__title-bar {
		border-end-start-radius: var(--_admonition-title-bar-corner-radius);
		border-end-end-radius: var(--_admonition-title-bar-corner-radius);
		transition: border-radius 0s var(--_admonition-transition-duration), border-block-end 0s var(--_admonition-transition-duration) allow-discrete;
	}

	@media (prefers-reduced-motion: reduce) {
		.admonition:not([open]) > summary.admonition__title-bar {
			transition: none;
		}
	}

	summary.admonition__title-bar:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	summary.admonition__title-bar:focus:not(:focus-visible) {
		outline: none;
	}

	.admonition:is(div, [open]) > .admonition__title-bar {
		border-block-end: var(--_admonition-border-width) solid var(--_admonition-border-color);
	}

	.admonition__title {
		margin: 0;
		min-width: 0;
		flex-grow: 1;
		overflow-wrap: break-word;
		font: inherit;
	}


	/* # Icon */

	.admonition__icon {
		display: flex;
		flex-shrink: 0;
		margin-block-start: calc((1lh - var(--_admonition-icon-size)) / 2);
		width: var(--_admonition-icon-size);
		height: var(--_admonition-icon-size);
		--context-content-color: var(--_admonition-icon-color);
		color: var(--_admonition-icon-color);
	}

	.admonition__content > .admonition__icon {
		margin-block-start: 0;
	}

	@media (forced-colors: active) {
		.admonition__icon {
			/* No context: the system color is not one to pass on. */
			color: CanvasText;
		}
	}


	/* # Chevron */

	.admonition__chevron {
		display: flex;
		flex-shrink: 0;
		margin-block-start: calc((1lh - var(--_admonition-chevron-size)) / 2);
		margin-inline-start: auto;
		width: var(--_admonition-chevron-size);
		height: var(--_admonition-chevron-size);
		transition: rotate var(--_admonition-transition-duration) ease-out;
	}

	.admonition[open] .admonition__chevron {
		rotate: var(--_admonition-chevron-open-rotation);
	}

	@media (prefers-reduced-motion: reduce) {
		.admonition__chevron {
			transition: none;
		}
	}


	/* # Open and close */

	details.admonition {
		interpolate-size: allow-keywords;
	}

	details.admonition::details-content {
		block-size: 0;
		overflow-y: clip;
		transition:
			block-size var(--_admonition-transition-duration) ease-out,
			content-visibility var(--_admonition-transition-duration) allow-discrete;
	}

	details.admonition[open]::details-content {
		block-size: auto;
	}

	@media (prefers-reduced-motion: reduce) {
		details.admonition::details-content {
			transition: none;
		}
	}


	/* # Content */

	.admonition__content {
		box-sizing: border-box;
		display: flex;
		padding: var(--_admonition-inset);
		gap: var(--_admonition-gap);
	}

	.admonition__body {
		min-width: 0;
		flex-grow: 1;
		font: var(--primitives-font-body-md-regular-snug);
	}


	/* # Print */

	@media print {
		.admonition::details-content {
			content-visibility: visible;
			block-size: auto;
		}

		.admonition__chevron {
			display: none;
		}
	}
`;
