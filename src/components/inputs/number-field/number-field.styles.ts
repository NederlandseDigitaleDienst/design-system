import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const numberFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_width: auto;
		--_corner-radius: var(--semantics-controls-md-corner-radius);
		--_min-size: var(--semantics-controls-md-min-size);
		--_spin-button-padding: calc((var(--_min-size) - var(--semantics-controls-sm-min-size)) / 2 - var(--semantics-input-fields-border-width));
		--_text-font: var(--semantics-input-fields-md-text-font);
		--_inline-padding: calc(var(--semantics-controls-md-inline-padding) - var(--semantics-input-fields-border-width));

		${inheritedTextReset}
		display: inline-block;
		-webkit-tap-highlight-color: transparent;
	}

	:host([size="sm"]) {
		--_corner-radius: var(--semantics-controls-sm-corner-radius);
		--_min-size: var(--semantics-controls-sm-min-size);
		--_spin-button-padding: calc((var(--_min-size) - var(--semantics-controls-xs-min-size)) / 2 - var(--semantics-input-fields-border-width));
		--_text-font: var(--semantics-input-fields-sm-text-font);
		--_inline-padding: calc(var(--semantics-controls-sm-inline-padding) - var(--semantics-input-fields-border-width));
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	:host([disabled]) nldd-icon-button {
		opacity: 1;
	}

	:host {
		width: var(--_width);
		max-width: 100%;
	}

	:host([width="full"]) {
		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.number-field {
		box-sizing: border-box;
		display: inline-flex;
		width: 100%;
		border: var(--semantics-input-fields-border);
		border-radius: var(--_corner-radius);
		background-color: var(--semantics-input-fields-background-color);
		height: var(--_min-size);
		flex-direction: row;
		align-items: center;
	}

	.number-field:has(.number-field__input:focus-visible) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* # Elements */

	.number-field__decrement-button,
	.number-field__increment-button {
		display: flex;
		height: 100%;
		align-items: center;
	}

	.number-field__decrement-button {
		padding-left: var(--_spin-button-padding);
	}

	.number-field__increment-button {
		padding-right: var(--_spin-button-padding);
	}

	.number-field__input {
		box-sizing: border-box;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		min-width: 0;
		padding: 0 var(--primitives-space-6);
		align-self: stretch;
		flex-grow: 1;
		text-align: center;
		color: var(--semantics-content-color);
		font: var(--_text-font);
		appearance: none;
	}

	.number-field__input[type="number"] {
		-moz-appearance: textfield;
	}

	.number-field__input::-webkit-outer-spin-button,
	.number-field__input::-webkit-inner-spin-button {
		margin: 0;
		-webkit-appearance: none;
	}

	:host([hide-spin-buttons]) .number-field__input {
		min-width: var(--primitives-space-80);
		padding-inline: var(--_inline-padding);
		text-align: left;
	}

`;
