import { css } from 'lit';
import { inheritedTextReset, surfaceContent } from '../../../assets/styles/shadow-resets.js';

export const accordionItemStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_accordion-item-border-width: var(--semantics-surfaces-highlight-border-width);
		--_accordion-item-border-color: var(--semantics-surfaces-tinted-highlight-border-color);
		--_accordion-item-corner-radius: calc(var(--primitives-corner-radius-lg) - var(--semantics-surfaces-highlight-border-width));
		--_accordion-item-background-color: var(--semantics-surfaces-base-background-color);
		--_accordion-item-content-color: var(--semantics-content-color);
		--_accordion-item-title-bar-background-color: var(--semantics-surfaces-tinted-background-color);
		--_accordion-item-title-bar-hover-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-50));
		--_accordion-item-title-bar-min-height: var(--semantics-controls-md-min-size);
		--_accordion-item-inset: var(--primitives-space-12);
		--_accordion-item-gap: var(--primitives-space-8);
		--_accordion-item-chevron-size: var(--primitives-space-20);
		--_accordion-item-chevron-open-rotation: 180deg;
		--_accordion-item-transition-duration: var(--primitives-transition-duration-fast);

		${inheritedTextReset}
		display: block;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Item */

	.accordion-item {
		--context-background-color: var(--_accordion-item-background-color);
		${surfaceContent}
		box-sizing: border-box;
		display: block;
		interpolate-size: allow-keywords;
		--context-content-color: var(--_accordion-item-content-color);
		color: var(--_accordion-item-content-color);
	}

	:host(:not(:first-child)) .accordion-item {
		border-block-start: var(--_accordion-item-border-width) solid var(--_accordion-item-border-color);
	}

	@media (forced-colors: active) {
		:host(:not(:first-child)) .accordion-item {
			border-color: CanvasText;
		}
	}


	/* # Title bar */

	.accordion-item__title-bar {
		--context-background-color: var(--_accordion-item-title-bar-background-color);
		box-sizing: border-box;
		display: flex;
		background-color: var(--_accordion-item-title-bar-background-color);
		min-height: var(--_accordion-item-title-bar-min-height);
		padding-block: calc((var(--_accordion-item-title-bar-min-height) - 1lh) / 2);
		padding-inline-start: var(--_accordion-item-inset);
		padding-inline-end: calc((var(--_accordion-item-title-bar-min-height) - var(--_accordion-item-chevron-size)) / 2);
		align-items: flex-start;
		gap: var(--_accordion-item-gap);
		font: var(--primitives-font-body-md-medium-snug);
		cursor: default;
		list-style: none;
		-webkit-tap-highlight-color: transparent;
	}

	.accordion-item__title-bar::-webkit-details-marker {
		display: none;
	}

	:host(:first-child) .accordion-item__title-bar {
		border-start-start-radius: var(--_accordion-item-corner-radius);
		border-start-end-radius: var(--_accordion-item-corner-radius);
	}

	:host(:last-child) .accordion-item:not([open]) > .accordion-item__title-bar {
		border-end-start-radius: var(--_accordion-item-corner-radius);
		border-end-end-radius: var(--_accordion-item-corner-radius);
	}

	/* Where the height animates, the bar keeps its square corners and its line
	   until the closing content is gone. */
	@supports (interpolate-size: allow-keywords) {
		.accordion-item:not([open]) > .accordion-item__title-bar {
			transition: border-radius 0s var(--_accordion-item-transition-duration), border-block-end 0s var(--_accordion-item-transition-duration) allow-discrete;
		}
	}

	.accordion-item[open] > .accordion-item__title-bar {
		border-block-end: var(--_accordion-item-border-width) solid var(--_accordion-item-border-color);
	}

	@media (hover: hover) {
		.accordion-item__title-bar:hover {
			--context-background-color: var(--_accordion-item-title-bar-hover-background-color);
			background-color: var(--_accordion-item-title-bar-hover-background-color);
		}
	}

	.accordion-item__title-bar:active {
		--context-background-color: var(--_accordion-item-title-bar-hover-background-color);
		background-color: var(--_accordion-item-title-bar-hover-background-color);
	}

	/* Above the item below, which would cover the ring. */
	.accordion-item__title-bar:focus-visible {
		position: relative;
		z-index: 1;
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.accordion-item__title-bar:focus:not(:focus-visible) {
		outline: none;
	}

	.accordion-item__title {
		min-width: 0;
		flex-grow: 1;
		overflow-wrap: break-word;
	}


	/* # Chevron */

	.accordion-item__chevron {
		display: flex;
		flex-shrink: 0;
		margin-block-start: calc((1lh - var(--_accordion-item-chevron-size)) / 2);
		width: var(--_accordion-item-chevron-size);
		height: var(--_accordion-item-chevron-size);
		transition: rotate var(--_accordion-item-transition-duration) ease-out;
	}

	.accordion-item[open] .accordion-item__chevron {
		rotate: var(--_accordion-item-chevron-open-rotation);
	}


	/* # Content */

	.accordion-item::details-content {
		block-size: 0;
		overflow-y: clip;
		transition:
			block-size var(--_accordion-item-transition-duration) ease-out,
			content-visibility var(--_accordion-item-transition-duration) allow-discrete;
	}

	.accordion-item[open]::details-content {
		block-size: auto;
	}

	.accordion-item__content {
		box-sizing: border-box;
		padding: var(--_accordion-item-inset);
		font: var(--primitives-font-body-md-regular-snug);
	}


	/* # Motion */

	@media (prefers-reduced-motion: reduce) {
		.accordion-item__chevron,
		.accordion-item::details-content,
		.accordion-item:not([open]) > .accordion-item__title-bar {
			transition: none;
		}
	}


	/* # Print */

	@media print {
		.accordion-item::details-content {
			content-visibility: visible;
			block-size: auto;
		}

		.accordion-item__chevron {
			display: none;
		}
	}
`;
