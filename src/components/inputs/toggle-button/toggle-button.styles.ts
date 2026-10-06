import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const toggleButtonStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_toggle-button-corner-radius: var(--semantics-controls-md-corner-radius);
		--_toggle-button-min-size: var(--semantics-controls-md-min-size);
		--_toggle-button-block-padding: var(--semantics-controls-md-block-padding);
		--_toggle-button-inline-padding: var(--semantics-buttons-md-inline-padding);
		--_toggle-button-gap: var(--semantics-buttons-md-gap);
		--_toggle-button-font: var(--semantics-buttons-md-primary-text-font);
		--_toggle-button-icon-size: var(--semantics-buttons-md-icon-size);
		--_toggle-button-icon-only-icon-size: var(--semantics-buttons-md-is-icon-only-icon-size);
		--_toggle-button-background-color: var(--semantics-buttons-neutral-tinted-background-color);
		--_toggle-button-content-color: var(--semantics-buttons-neutral-tinted-content-color);
		--_toggle-button-highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);
		--_toggle-button-is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
		--_toggle-button-is-hovered-content-color: var(--semantics-buttons-neutral-tinted-is-hovered-content-color);
		--_toggle-button-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-hovered-highlight-border-color);
		--_toggle-button-is-active-background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		--_toggle-button-is-active-content-color: var(--semantics-buttons-neutral-tinted-is-active-content-color);
		--_toggle-button-is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-active-highlight-border-color);
		--_toggle-button-is-selected-background-color: var(--semantics-buttons-neutral-tinted-is-selected-background-color);
		--_toggle-button-is-selected-content-color: var(--semantics-buttons-neutral-tinted-is-selected-content-color);
		--_toggle-button-is-selected-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-highlight-border-color);
		--_toggle-button-is-selected-is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-background-color);
		--_toggle-button-is-selected-is-hovered-content-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-content-color);
		--_toggle-button-is-selected-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-highlight-border-color);
		--_toggle-button-is-selected-is-active-background-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-background-color);
		--_toggle-button-is-selected-is-active-content-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-content-color);
		--_toggle-button-is-selected-is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-highlight-border-color);

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
		--_toggle-button-corner-radius: var(--semantics-controls-xs-corner-radius);
		--_toggle-button-min-size: var(--semantics-controls-xs-min-size);
		--_toggle-button-block-padding: var(--semantics-controls-xs-block-padding);
		--_toggle-button-inline-padding: var(--semantics-buttons-xs-inline-padding);
		--_toggle-button-gap: var(--semantics-buttons-xs-gap);
		--_toggle-button-font: var(--semantics-buttons-xs-primary-text-font);
		--_toggle-button-icon-size: var(--semantics-buttons-xs-icon-size);
		--_toggle-button-icon-only-icon-size: var(--semantics-buttons-xs-is-icon-only-icon-size);
	}

	:host([size="sm"]) {
		--_toggle-button-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_toggle-button-min-size: var(--semantics-controls-sm-min-size);
		--_toggle-button-block-padding: var(--semantics-controls-sm-block-padding);
		--_toggle-button-inline-padding: var(--semantics-buttons-sm-inline-padding);
		--_toggle-button-gap: var(--semantics-buttons-sm-gap);
		--_toggle-button-font: var(--semantics-buttons-sm-primary-text-font);
		--_toggle-button-icon-size: var(--semantics-buttons-sm-icon-size);
		--_toggle-button-icon-only-icon-size: var(--semantics-buttons-sm-is-icon-only-icon-size);
	}

	:host([size="lg"]) {
		--_toggle-button-corner-radius: var(--semantics-controls-lg-corner-radius);
		--_toggle-button-min-size: var(--semantics-controls-lg-min-size);
		--_toggle-button-block-padding: var(--semantics-controls-lg-block-padding);
		--_toggle-button-inline-padding: var(--semantics-buttons-lg-inline-padding);
		--_toggle-button-gap: var(--semantics-buttons-lg-gap);
		--_toggle-button-font: var(--semantics-buttons-lg-primary-text-font);
		--_toggle-button-icon-size: var(--semantics-buttons-lg-icon-size);
		--_toggle-button-icon-only-icon-size: var(--primitives-space-28);
		--_toggle-button-stacked-text-font: var(--primitives-font-body-xxs-medium-flat);
	}

	:host([appearance="neutral-base"]) {
		--_toggle-button-background-color: var(--semantics-buttons-neutral-base-background-color);
		--_toggle-button-content-color: var(--semantics-buttons-neutral-base-content-color);
		--_toggle-button-highlight-border-color: var(--semantics-buttons-neutral-base-highlight-border-color);
		--_toggle-button-is-hovered-background-color: var(--semantics-buttons-neutral-base-is-hovered-background-color);
		--_toggle-button-is-hovered-content-color: var(--semantics-buttons-neutral-base-is-hovered-content-color);
		--_toggle-button-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-base-is-hovered-highlight-border-color);
		--_toggle-button-is-active-background-color: var(--semantics-buttons-neutral-base-is-active-background-color);
		--_toggle-button-is-active-content-color: var(--semantics-buttons-neutral-base-is-active-content-color);
		--_toggle-button-is-active-highlight-border-color: var(--semantics-buttons-neutral-base-is-active-highlight-border-color);
		--_toggle-button-is-selected-background-color: var(--semantics-buttons-neutral-base-is-selected-background-color);
		--_toggle-button-is-selected-content-color: var(--semantics-buttons-neutral-base-is-selected-content-color);
		--_toggle-button-is-selected-highlight-border-color: var(--semantics-buttons-neutral-base-is-selected-highlight-border-color);
		--_toggle-button-is-selected-is-hovered-background-color: var(--semantics-buttons-neutral-base-is-selected-is-hovered-background-color);
		--_toggle-button-is-selected-is-hovered-content-color: var(--semantics-buttons-neutral-base-is-selected-is-hovered-content-color);
		--_toggle-button-is-selected-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-base-is-selected-is-hovered-highlight-border-color);
		--_toggle-button-is-selected-is-active-background-color: var(--semantics-buttons-neutral-base-is-selected-is-active-background-color);
		--_toggle-button-is-selected-is-active-content-color: var(--semantics-buttons-neutral-base-is-selected-is-active-content-color);
		--_toggle-button-is-selected-is-active-highlight-border-color: var(--semantics-buttons-neutral-base-is-selected-is-active-highlight-border-color);
	}

	:host([appearance="neutral-transparent"]) {
		--_toggle-button-background-color: transparent;
		--_toggle-button-content-color: var(--semantics-buttons-neutral-transparent-content-color);
		--_toggle-button-highlight-border-color: transparent;
		--_toggle-button-is-hovered-background-color: transparent;
		--_toggle-button-is-hovered-content-color: var(--semantics-buttons-neutral-transparent-is-hovered-content-color);
		--_toggle-button-is-hovered-highlight-border-color: transparent;
		--_toggle-button-is-active-background-color: transparent;
		--_toggle-button-is-active-content-color: var(--semantics-buttons-neutral-transparent-is-active-content-color);
		--_toggle-button-is-active-highlight-border-color: transparent;
		--_toggle-button-is-selected-background-color: var(--semantics-buttons-neutral-transparent-is-selected-background-color);
		--_toggle-button-is-selected-content-color: var(--semantics-buttons-neutral-transparent-is-selected-content-color);
		--_toggle-button-is-selected-highlight-border-color: var(--semantics-buttons-neutral-transparent-is-selected-highlight-border-color);
		--_toggle-button-is-selected-is-hovered-background-color: var(--semantics-buttons-neutral-transparent-is-selected-is-hovered-background-color);
		--_toggle-button-is-selected-is-hovered-content-color: var(--semantics-buttons-neutral-transparent-is-selected-is-hovered-content-color);
		--_toggle-button-is-selected-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-transparent-is-selected-is-hovered-highlight-border-color);
		--_toggle-button-is-selected-is-active-background-color: var(--semantics-buttons-neutral-transparent-is-selected-is-active-background-color);
		--_toggle-button-is-selected-is-active-content-color: var(--semantics-buttons-neutral-transparent-is-selected-is-active-content-color);
		--_toggle-button-is-selected-is-active-highlight-border-color: var(--semantics-buttons-neutral-transparent-is-selected-is-active-highlight-border-color);
	}

	:host([appearance="accent-transparent"]) {
		--_toggle-button-background-color: transparent;
		--_toggle-button-content-color: var(--semantics-buttons-accent-transparent-content-color);
		--_toggle-button-highlight-border-color: transparent;
		--_toggle-button-is-hovered-background-color: transparent;
		--_toggle-button-is-hovered-content-color: var(--semantics-buttons-accent-transparent-is-hovered-content-color);
		--_toggle-button-is-hovered-highlight-border-color: transparent;
		--_toggle-button-is-active-background-color: transparent;
		--_toggle-button-is-active-content-color: var(--semantics-buttons-accent-transparent-is-active-content-color);
		--_toggle-button-is-active-highlight-border-color: transparent;
		--_toggle-button-is-selected-background-color: var(--semantics-buttons-accent-transparent-is-selected-background-color);
		--_toggle-button-is-selected-content-color: var(--semantics-buttons-accent-transparent-is-selected-content-color);
		--_toggle-button-is-selected-highlight-border-color: var(--semantics-buttons-accent-transparent-is-selected-highlight-border-color);
		--_toggle-button-is-selected-is-hovered-background-color: var(--semantics-buttons-accent-transparent-is-selected-is-hovered-background-color);
		--_toggle-button-is-selected-is-hovered-content-color: var(--semantics-buttons-accent-transparent-is-selected-is-hovered-content-color);
		--_toggle-button-is-selected-is-hovered-highlight-border-color: var(--semantics-buttons-accent-transparent-is-selected-is-hovered-highlight-border-color);
		--_toggle-button-is-selected-is-active-background-color: var(--semantics-buttons-accent-transparent-is-selected-is-active-background-color);
		--_toggle-button-is-selected-is-active-content-color: var(--semantics-buttons-accent-transparent-is-selected-is-active-content-color);
		--_toggle-button-is-selected-is-active-highlight-border-color: var(--semantics-buttons-accent-transparent-is-selected-is-active-highlight-border-color);
	}

	:host([selected-icon]:is([appearance="neutral-transparent"], [appearance="accent-transparent"])) {
		--_toggle-button-is-selected-background-color: var(--_toggle-button-background-color);
		--_toggle-button-is-selected-content-color: var(--_toggle-button-content-color);
		--_toggle-button-is-selected-highlight-border-color: var(--_toggle-button-highlight-border-color);
		--_toggle-button-is-selected-is-hovered-background-color: var(--_toggle-button-is-hovered-background-color);
		--_toggle-button-is-selected-is-hovered-content-color: var(--_toggle-button-is-hovered-content-color);
		--_toggle-button-is-selected-is-hovered-highlight-border-color: var(--_toggle-button-is-hovered-highlight-border-color);
		--_toggle-button-is-selected-is-active-background-color: var(--_toggle-button-is-active-background-color);
		--_toggle-button-is-selected-is-active-content-color: var(--_toggle-button-is-active-content-color);
		--_toggle-button-is-selected-is-active-highlight-border-color: var(--_toggle-button-is-active-highlight-border-color);
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
		border-radius: var(--_toggle-button-corner-radius);
		background: none;
		background-color: var(--_toggle-button-background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_toggle-button-highlight-border-color);
		width: var(--_toggle-button-min-size);
		min-height: var(--_toggle-button-min-size);
		padding: 0;
		gap: var(--_toggle-button-gap);
		align-items: center;
		justify-content: center;
		color: var(--_toggle-button-content-color);
		font: var(--_toggle-button-font);
		white-space: nowrap;
		text-decoration: none;
		appearance: none;
	}

	.toggle-button:has(.toggle-button__text) {
		width: auto;
		padding: var(--_toggle-button-block-padding) var(--_toggle-button-inline-padding);
	}

	@media (hover: hover) {
		.toggle-button:hover,
		.toggle-button:has(.toggle-button__input:hover) {
			--_toggle-button-highlight-border-color: var(--_toggle-button-is-hovered-highlight-border-color);
			background-color: var(--_toggle-button-is-hovered-background-color);
			color: var(--_toggle-button-is-hovered-content-color);
		}
	}

	.toggle-button:active,
	.toggle-button:has(.toggle-button__input:active) {
		--_toggle-button-highlight-border-color: var(--_toggle-button-is-active-highlight-border-color);
		background-color: var(--_toggle-button-is-active-background-color);
		color: var(--_toggle-button-is-active-content-color);
	}

	:host([selected]) .toggle-button {
		--_toggle-button-highlight-border-color: var(--_toggle-button-is-selected-highlight-border-color);
		background-color: var(--_toggle-button-is-selected-background-color);
		color: var(--_toggle-button-is-selected-content-color);
	}

	@media (hover: hover) {
		:host([selected]) .toggle-button:hover,
		:host([selected]) .toggle-button:has(.toggle-button__input:hover) {
			--_toggle-button-highlight-border-color: var(--_toggle-button-is-selected-is-hovered-highlight-border-color);
			background-color: var(--_toggle-button-is-selected-is-hovered-background-color);
			color: var(--_toggle-button-is-selected-is-hovered-content-color);
		}
	}

	:host([selected]) .toggle-button:active,
	:host([selected]) .toggle-button:has(.toggle-button__input:active) {
		--_toggle-button-highlight-border-color: var(--_toggle-button-is-selected-is-active-highlight-border-color);
		background-color: var(--_toggle-button-is-selected-is-active-background-color);
		color: var(--_toggle-button-is-selected-is-active-content-color);
	}

	.toggle-button:focus-visible,
	.toggle-button:has(.toggle-button__input:focus-visible),
	:host(:focus-visible) .toggle-button {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), inset 0 0 0 var(--primitives-border-width-thin) var(--_toggle-button-highlight-border-color);
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
		width: var(--_toggle-button-icon-only-icon-size);
		height: var(--_toggle-button-icon-only-icon-size);
		flex-shrink: 0;
	}

	.toggle-button:has(.toggle-button__text) .toggle-button__icon,
	.toggle-button:has(.toggle-button__text) ::slotted([slot="icon"]) {
		width: var(--_toggle-button-icon-size);
		height: var(--_toggle-button-icon-size);
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
		font: var(--_toggle-button-stacked-text-font);
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
