import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const paginationStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_selected-z-index: 1;
		--_focus-z-index: 2;

		${inheritedTextReset}
		display: block;
		container-type: inline-size;
		isolation: isolate;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([centered]) {
		display: flex;
		justify-content: center;
	}

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}


	/* # Block */

	.pagination {
		display: inline-flex;
		position: relative;
		border-radius: var(--semantics-controls-md-corner-radius);
		background-color: var(--semantics-buttons-neutral-tinted-background-color);
		align-items: center;
	}

	.pagination::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--semantics-buttons-neutral-tinted-highlight-border-color);
		pointer-events: none;
	}

	@media (forced-colors: active) {
		.pagination {
			border: 1px solid CanvasText;
		}
	}

	.pagination__previous-button:focus-within,
	.pagination__next-button:focus-within {
		position: relative;
		z-index: var(--_selected-z-index);
	}


	/* # Page button */

	.pagination__page-button {
		--_highlight-border-color: transparent;

		box-sizing: border-box;
		display: inline-flex;
		position: relative;
		z-index: var(--_selected-z-index);
		margin: 0;
		border: none;
		border-radius: var(--semantics-controls-md-corner-radius);
		background: transparent;
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
		min-width: var(--semantics-controls-md-min-size);
		height: var(--semantics-controls-md-min-size);
		padding-block: var(--primitives-space-8);
		padding-inline: var(--primitives-space-12);
		align-items: center;
		justify-content: center;
		color: inherit;
		font: var(--semantics-buttons-md-primary-text-font);
		appearance: none;
	}

	a.pagination__page-button {
		cursor: var(--semantics-controls-link-cursor);
		text-decoration: none;
	}

	@media (hover: hover) {
		.pagination__page-button:hover:not(.is-current) {
			background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
		}

		.pagination__page-button.is-current:hover {
			--_highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-highlight-border-color);
			background-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-background-color);
			color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-content-color);
		}
	}

	.pagination__page-button:active:not(.is-current) {
		background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-active-content-color);
	}

	.pagination__page-button.is-current {
		--_highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-highlight-border-color);
		background-color: var(--semantics-buttons-neutral-tinted-is-selected-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-selected-content-color);
	}

	.pagination__page-button.is-current:active {
		--_highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-highlight-border-color);
		background-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-content-color);
	}

	@media (forced-colors: active) {
		.pagination__page-button.is-current {
			background-color: Highlight;
			color: HighlightText;
		}
	}

	.pagination__page-button:focus-visible {
		z-index: var(--_focus-z-index);
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
	}

	@media (forced-colors: active) {
		.pagination__page-button:focus-visible {
			outline: 2px solid CanvasText;
		}
	}


	/* # Ellipsis */

	.pagination__ellipsis {
		box-sizing: border-box;
		display: inline-flex;
		pointer-events: none;
		min-width: var(--semantics-controls-md-min-size);
		height: var(--semantics-controls-md-min-size);
		padding-block: var(--primitives-space-8);
		padding-inline: var(--primitives-space-12);
		align-items: center;
		justify-content: center;
		color: inherit;
		font: var(--semantics-buttons-md-primary-text-font);
	}


	/* # Divider */

	.pagination__divider {
		display: flex;
		height: var(--semantics-controls-md-min-size);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	.pagination__divider-line {
		background-color: var(--semantics-buttons-neutral-tinted-divider-color);
		width: var(--semantics-dividers-thickness);
		height: var(--semantics-buttons-md-divider-length);
	}


	/* # Select (compact fallback) */

	.pagination__select-wrapper {
		/* Mirrors the dropdown's neutral-tinted state tokens. The visible
		   <select> sits on top with a transparent background, so the wrapper
		   carries the hover/active/expanded surface behind it. */
		--_background-color: transparent;
		--_content-color: inherit;
		--_is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
		--_is-hovered-content-color: var(--semantics-buttons-neutral-tinted-is-hovered-content-color);
		--_is-active-background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		--_is-active-content-color: var(--semantics-buttons-neutral-tinted-is-active-content-color);

		display: inline-flex;
		position: relative;
		border-radius: var(--semantics-controls-md-corner-radius);
		background-color: var(--_background-color);
		align-items: center;
		color: var(--_content-color);
		transition:
			background-color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default),
			color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default)
		;
	}

	@media (hover: hover) {
		.pagination__select-wrapper:hover {
			background-color: var(--_is-hovered-background-color);
			color: var(--_is-hovered-content-color);
		}
	}

	.pagination__select-wrapper:active {
		background-color: var(--_is-active-background-color);
		color: var(--_is-active-content-color);
	}

	:host([select-expanded]) .pagination__select-wrapper {
		--_background-color: var(--semantics-buttons-neutral-tinted-is-expanded-background-color);
		--_content-color: var(--semantics-buttons-neutral-tinted-is-expanded-content-color);
		--_is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-background-color);
		--_is-hovered-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-content-color);
		--_is-active-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-background-color);
		--_is-active-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-content-color);
	}

	@media (prefers-reduced-motion: reduce) {
		.pagination__select-wrapper {
			transition: none;
		}
	}

	.pagination__select {
		box-sizing: border-box;
		position: relative;
		z-index: 1;
		margin: 0;
		border: none;
		background: transparent;
		height: var(--semantics-controls-md-min-size);
		padding-block: var(--primitives-space-8);
		padding-inline-start: var(--primitives-space-12);
		padding-inline-end: calc(var(--primitives-space-24) + var(--primitives-space-12));
		color: inherit;
		font: var(--semantics-buttons-md-primary-text-font);
		appearance: none;
	}

	.pagination__select:focus {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		border-radius: calc(var(--semantics-controls-md-corner-radius) - var(--primitives-space-4) / 2);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	:host([is-pointer-focus]) .pagination__select:focus {
		outline: none;
		box-shadow: none;
	}

	.pagination__select-picker-icon {
		position: absolute;
		inset-inline-end: var(--primitives-space-8);
		pointer-events: none;
		width: var(--primitives-space-24);
		height: var(--primitives-space-24);
	}


	/* # Responsive */

	.pagination__page-buttons {
		display: contents;

		@container (max-width: 400px) {
			display: none;
		}
	}

	.pagination__compact {
		display: none;

		@container (max-width: 400px) {
			display: contents;
		}
	}
`;
