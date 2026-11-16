import { css } from 'lit';
import { inheritedTextReset, surfaceContent } from '../../../assets/styles/shadow-resets.js';

export const admonitionStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_admonition-highlight-border-width: var(--semantics-surfaces-highlight-border-width);
		--_admonition-highlight-border-color: var(--semantics-surfaces-tinted-highlight-border-color);
		--_admonition-corner-radius: var(--primitives-corner-radius-lg);
		--_admonition-background-color: var(--semantics-surfaces-base-background-color);
		--_admonition-content-color: var(--semantics-content-color);
		--_admonition-title-bar-background-color: var(--semantics-surfaces-tinted-background-color);
		--_admonition-title-bar-hover-background-color: var(--semantics-surfaces-tinted-is-hovered-background-color);
		--_admonition-title-bar-min-height: var(--semantics-disclosures-title-bar-min-height);
		--_admonition-title-bar-padding-block: var(--semantics-disclosures-title-bar-padding-block);
		--_admonition-inset: var(--semantics-disclosures-inset);
		--_admonition-gap: var(--semantics-disclosures-title-bar-gap);
		--_admonition-title-bar-font: var(--semantics-disclosures-title-bar-font);
		--_admonition-title-bar-corner-radius: calc(var(--_admonition-corner-radius) - var(--_admonition-highlight-border-width));
		--_admonition-variant-icon-size: var(--primitives-space-24);
		--_admonition-variant-icon-color: var(--primitives-color-neutral-750);
		--_admonition-disclosure-icon-size: var(--semantics-disclosures-disclosure-icon-size);
		--_admonition-disclosure-icon-open-rotation: var(--semantics-disclosures-disclosure-icon-open-rotation);
		--_admonition-transition-duration: var(--primitives-transition-duration-fast);

		${inheritedTextReset}
		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}

	:host([variant="accent"]) {
		--_admonition-highlight-border-color: var(--semantics-surfaces-accent-tinted-highlight-border-color);
		--_admonition-title-bar-background-color: var(--semantics-surfaces-accent-tinted-background-color);
		--_admonition-title-bar-hover-background-color: var(--semantics-surfaces-accent-tinted-is-hovered-background-color);
		--_admonition-variant-icon-color: var(--components-admonition-accent-icon-color);
	}

	:host([variant="success"]) {
		--_admonition-highlight-border-color: var(--semantics-surfaces-success-tinted-highlight-border-color);
		--_admonition-title-bar-background-color: var(--semantics-surfaces-success-tinted-background-color);
		--_admonition-title-bar-hover-background-color: var(--semantics-surfaces-success-tinted-is-hovered-background-color);
		--_admonition-variant-icon-color: light-dark(var(--primitives-color-success-550), var(--primitives-color-success-650));
	}

	:host([variant="warning"]) {
		--_admonition-highlight-border-color: var(--semantics-surfaces-warning-tinted-highlight-border-color);
		--_admonition-title-bar-background-color: var(--semantics-surfaces-warning-tinted-background-color);
		--_admonition-title-bar-hover-background-color: var(--semantics-surfaces-warning-tinted-is-hovered-background-color);
		--_admonition-variant-icon-color: light-dark(var(--primitives-color-warning-450), var(--primitives-color-warning-650));
	}

	:host([variant="critical"]) {
		--_admonition-highlight-border-color: var(--semantics-surfaces-critical-tinted-highlight-border-color);
		--_admonition-title-bar-background-color: var(--semantics-surfaces-critical-tinted-background-color);
		--_admonition-title-bar-hover-background-color: var(--semantics-surfaces-critical-tinted-is-hovered-background-color);
		--_admonition-variant-icon-color: var(--primitives-color-critical-600);
	}


	/* # Block */

	.admonition {
		--context-background-color: var(--_admonition-background-color);
		${surfaceContent}
		box-sizing: border-box;
		display: block;
		border: var(--_admonition-highlight-border-width) solid var(--_admonition-highlight-border-color);
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


	/* # Elements */

	.admonition__title-bar {
		--context-background-color: var(--_admonition-title-bar-background-color);
		box-sizing: border-box;
		display: flex;
		background-color: var(--_admonition-title-bar-background-color);
		border-start-start-radius: var(--_admonition-title-bar-corner-radius);
		border-start-end-radius: var(--_admonition-title-bar-corner-radius);
		min-height: var(--_admonition-title-bar-min-height);
		padding-block: var(--_admonition-title-bar-padding-block);
		padding-inline-start: var(--_admonition-inset);
		padding-inline-end: var(--_admonition-inset);
		/* Wrapping makes the row a multi-line flex container, so align-content
		   centers a single line in the min-height. The title never wraps. */
		flex-wrap: wrap;
		align-content: center;
		align-items: flex-start;
		gap: var(--_admonition-gap);
		font: var(--_admonition-title-bar-font);
		list-style: none;
		-webkit-tap-highlight-color: transparent;
	}

	summary.admonition__title-bar {
		cursor: default;
		padding-inline-end: calc((var(--_admonition-title-bar-min-height) - var(--_admonition-disclosure-icon-size)) / 2);
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

	.admonition:not([open]) > summary.admonition__title-bar {
		border-end-start-radius: var(--_admonition-title-bar-corner-radius);
		border-end-end-radius: var(--_admonition-title-bar-corner-radius);
	}

	/* Where the height animates, the bar keeps its square corners and its line
	   until the closing content is gone. */
	@supports (interpolate-size: allow-keywords) {
		.admonition:not([open]) > summary.admonition__title-bar {
			transition: border-radius 0s var(--_admonition-transition-duration), border-block-end 0s var(--_admonition-transition-duration) allow-discrete;
		}
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
		border-block-end: var(--_admonition-highlight-border-width) solid var(--_admonition-highlight-border-color);
	}

	.admonition__title {
		margin: 0;
		min-width: 0;
		flex: 1 1 0;
		overflow-wrap: break-word;
		font: inherit;
	}

	.admonition__variant-icon {
		display: flex;
		flex-shrink: 0;
		margin-block-start: calc((1lh - var(--_admonition-variant-icon-size)) / 2);
		width: var(--_admonition-variant-icon-size);
		height: var(--_admonition-variant-icon-size);
		--context-content-color: var(--_admonition-variant-icon-color);
		color: var(--_admonition-variant-icon-color);
	}

	.admonition__main > .admonition__variant-icon {
		margin-block-start: 0;
	}

	@media (forced-colors: active) {
		.admonition__variant-icon {
			/* No context: the system color is not one to pass on. */
			color: CanvasText;
		}
	}

	.admonition__disclosure-icon {
		display: flex;
		flex-shrink: 0;
		margin-block-start: calc((1lh - var(--_admonition-disclosure-icon-size)) / 2);
		margin-inline-start: auto;
		width: var(--_admonition-disclosure-icon-size);
		height: var(--_admonition-disclosure-icon-size);
		transition: rotate var(--_admonition-transition-duration) ease-out;
	}

	.admonition[open] .admonition__disclosure-icon {
		rotate: var(--_admonition-disclosure-icon-open-rotation);
	}

	@media (prefers-reduced-motion: reduce) {
		.admonition__disclosure-icon {
			transition: none;
		}
	}

	.admonition__main {
		box-sizing: border-box;
		display: flex;
		padding: var(--_admonition-inset);
		gap: var(--_admonition-gap);
	}

	.admonition__content {
		min-width: 0;
		flex-grow: 1;
		font: var(--primitives-font-body-md-regular-snug);
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


	/* # Print */

	@media print {
		.admonition::details-content {
			content-visibility: visible;
			block-size: auto;
		}

		.admonition__disclosure-icon {
			display: none;
		}
	}
`;
