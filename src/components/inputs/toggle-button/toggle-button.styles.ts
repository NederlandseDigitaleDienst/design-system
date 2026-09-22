import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const toggleButtonStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_corner-radius: var(--semantics-controls-md-corner-radius);
		--_min-size: var(--semantics-controls-md-min-size);
		--_block-padding: var(--semantics-controls-md-block-padding);
		--_inline-padding: var(--semantics-buttons-md-inline-padding);
		--_gap: var(--semantics-buttons-md-gap);
		--_font: var(--semantics-buttons-md-primary-text-font);
		--_icon-size: var(--semantics-buttons-md-icon-size);
		--_icon-only-icon-size: var(--semantics-buttons-md-is-icon-only-icon-size);
		--_highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-hovered-highlight-border-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-active-highlight-border-color);
		--_is-selected-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-highlight-border-color);
		--_is-selected-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-highlight-border-color);
		--_is-selected-is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-highlight-border-color);

		${inheritedTextReset}
		display: inline-block;
		position: relative;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host(:focus-visible) {
		outline: none;
	}

	:host([size="xs"]) {
		--_corner-radius: var(--semantics-controls-xs-corner-radius);
		--_min-size: var(--semantics-controls-xs-min-size);
		--_block-padding: var(--semantics-controls-xs-block-padding);
		--_inline-padding: var(--semantics-buttons-xs-inline-padding);
		--_gap: var(--semantics-buttons-xs-gap);
		--_font: var(--semantics-buttons-xs-primary-text-font);
		--_icon-size: var(--semantics-buttons-xs-icon-size);
		--_icon-only-icon-size: var(--semantics-buttons-xs-is-icon-only-icon-size);
	}

	:host([size="sm"]) {
		--_corner-radius: var(--semantics-controls-sm-corner-radius);
		--_min-size: var(--semantics-controls-sm-min-size);
		--_block-padding: var(--semantics-controls-sm-block-padding);
		--_inline-padding: var(--semantics-buttons-sm-inline-padding);
		--_gap: var(--semantics-buttons-sm-gap);
		--_font: var(--semantics-buttons-sm-primary-text-font);
		--_icon-size: var(--semantics-buttons-sm-icon-size);
		--_icon-only-icon-size: var(--semantics-buttons-sm-is-icon-only-icon-size);
	}

	:host([size="lg"]) {
		--_corner-radius: var(--semantics-controls-lg-corner-radius);
		--_min-size: var(--semantics-controls-lg-min-size);
		--_block-padding: var(--semantics-controls-lg-block-padding);
		--_inline-padding: var(--semantics-buttons-lg-inline-padding);
		--_gap: var(--semantics-buttons-lg-gap);
		--_font: var(--semantics-buttons-lg-primary-text-font);
		--_icon-size: var(--semantics-buttons-lg-icon-size);
		--_icon-only-icon-size: var(--primitives-space-28);
		--_stacked-text-font: var(--primitives-font-body-xxs-medium-flat);
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}


	/* # Block */

	.toggle-button {
		box-sizing: border-box;
		display: inline-flex;
		position: relative;
		margin: 0;
		border: none;
		border-radius: var(--_corner-radius);
		background: none;
		background-color: var(--semantics-buttons-neutral-tinted-background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
		width: var(--_min-size);
		min-height: var(--_min-size);
		padding: 0;
		gap: var(--_gap);
		align-items: center;
		justify-content: center;
		color: var(--semantics-buttons-neutral-tinted-content-color);
		font: var(--_font);
		white-space: nowrap;
		text-decoration: none;
		appearance: none;
	}

	.toggle-button:has(.toggle-button__text) {
		width: auto;
		padding: var(--_block-padding) var(--_inline-padding);
	}

	@media (hover: hover) {
		.toggle-button:hover,
		.toggle-button:has(.toggle-button__input:hover) {
			--_highlight-border-color: var(--_is-hovered-highlight-border-color);
			background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
			color: var(--semantics-buttons-neutral-tinted-is-hovered-content-color);
		}
	}

	.toggle-button:active,
	.toggle-button:has(.toggle-button__input:active) {
		--_highlight-border-color: var(--_is-active-highlight-border-color);
		background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-active-content-color);
	}

	:host([selected]) .toggle-button {
		--_highlight-border-color: var(--_is-selected-highlight-border-color);
		background-color: var(--semantics-buttons-neutral-tinted-is-selected-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-selected-content-color);
	}

	@media (hover: hover) {
		:host([selected]) .toggle-button:hover,
		:host([selected]) .toggle-button:has(.toggle-button__input:hover) {
			--_highlight-border-color: var(--_is-selected-is-hovered-highlight-border-color);
			background-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-background-color);
			color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-content-color);
		}
	}

	:host([selected]) .toggle-button:active,
	:host([selected]) .toggle-button:has(.toggle-button__input:active) {
		--_highlight-border-color: var(--_is-selected-is-active-highlight-border-color);
		background-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-content-color);
	}

	.toggle-button:focus-visible,
	.toggle-button:has(.toggle-button__input:focus-visible),
	:host(:focus-visible) .toggle-button {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
	}

	.toggle-button:focus:not(:focus-visible) {
		outline: none;
	}


	/* # Elements */

	::slotted(nldd-icon) {
		display: none;
	}

	.toggle-button__icon,
	::slotted([slot="icon"]) {
		display: block;
		width: var(--_icon-only-icon-size);
		height: var(--_icon-only-icon-size);
		flex-shrink: 0;
	}

	.toggle-button:has(.toggle-button__text) .toggle-button__icon,
	.toggle-button:has(.toggle-button__text) ::slotted([slot="icon"]) {
		width: var(--_icon-size);
		height: var(--_icon-size);
	}

	:host([size="lg"][variant="icon-and-text"]) .toggle-button,
	:host([size="lg"]:not([variant])) .toggle-button:has(.toggle-button__text):has(.toggle-button__icon) {
		width: auto;
		padding: var(--primitives-space-8);
		gap: var(--primitives-space-2);
		flex-direction: column;
	}

	:host([size="lg"][variant="icon-and-text"]) .toggle-button__text,
	:host([size="lg"]:not([variant])) .toggle-button:has(.toggle-button__icon) .toggle-button__text {
		font: var(--_stacked-text-font);
	}

	/* variant="text" keeps the icon slot in shadow DOM (so slotchange still
	   fires after a future variant change) but hides any rendered icon. */
	:host([variant="text"]) .toggle-button__icon,
	:host([variant="text"]) ::slotted([slot="icon"]) {
		display: none;
	}

	.toggle-button__input {
		position: absolute;
		inset: 0;
		opacity: 0;
		z-index: 1;
		margin: 0;
		width: 100%;
		height: 100%;
	}

`;
