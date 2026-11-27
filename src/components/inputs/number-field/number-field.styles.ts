import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const numberFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_number-field-width: auto;
		--_number-field-corner-radius: var(--semantics-controls-md-corner-radius);
		--_number-field-min-size: var(--semantics-controls-md-min-size);
		--_number-field-spin-button-padding: calc((var(--_number-field-min-size) - var(--semantics-controls-sm-min-size)) / 2 - var(--semantics-input-fields-border-width));
		--_number-field-nested-control-corner-radius: calc(var(--_number-field-corner-radius) - var(--_number-field-spin-button-padding) - var(--semantics-input-fields-border-width));
		--_number-field-text-font: var(--semantics-input-fields-md-text-font);
		--_number-field-inline-padding: calc(var(--semantics-controls-md-inline-padding) - var(--semantics-input-fields-border-width));

		${inheritedTextReset}
		display: inline-block;
		-webkit-tap-highlight-color: transparent;
	}

	:host([size="sm"]) {
		--_number-field-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_number-field-min-size: var(--semantics-controls-sm-min-size);
		--_number-field-spin-button-padding: calc((var(--_number-field-min-size) - var(--semantics-controls-xs-min-size)) / 2 - var(--semantics-input-fields-border-width));
		--_number-field-text-font: var(--semantics-input-fields-sm-text-font);
		--_number-field-inline-padding: calc(var(--semantics-controls-sm-inline-padding) - var(--semantics-input-fields-border-width));
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	:host {
		width: var(--_number-field-width);
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
		border-radius: var(--_number-field-corner-radius);
		background-color: var(--semantics-input-fields-background-color);
		height: var(--_number-field-min-size);
		flex-direction: row;
		align-items: center;
	}

	:host([readonly]) .number-field {
		border-color: var(--semantics-input-fields-is-read-only-border-color);
		background-color: var(--semantics-input-fields-is-read-only-background-color);
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

	:is(.number-field__decrement-button, .number-field__increment-button) nldd-icon-button {
		--context-control-corner-radius: var(--_number-field-nested-control-corner-radius);
	}

	/* Hidden, not removed: the field keeps its width when it turns readonly or disabled. */
	:host(:is([readonly], [disabled])) :is(.number-field__decrement-button, .number-field__increment-button) {
		visibility: hidden;
	}

	.number-field__spin-buttons {
		display: flex;
		height: 100%;
		padding-inline-end: var(--_number-field-spin-button-padding);
		gap: var(--_number-field-spin-button-padding);
	}

	:host([spin-buttons="split"]) .number-field__decrement-button {
		padding-inline-start: var(--_number-field-spin-button-padding);
	}

	:host([spin-buttons="split"]) .number-field__increment-button {
		padding-inline-end: var(--_number-field-spin-button-padding);
	}

	.number-field__input {
		box-sizing: border-box;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		min-width: 0;
		padding-block: 0;
		padding-inline: var(--_number-field-inline-padding) var(--primitives-space-6);
		align-self: stretch;
		flex-grow: 1;
		text-align: start;
		--context-content-color: var(--semantics-content-color);
		color: var(--semantics-content-color);
		font: var(--_number-field-text-font);
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

	:host([spin-buttons="split"]) .number-field__input {
		padding: 0 var(--primitives-space-6);
		text-align: center;
	}

	:host([spin-buttons="none"]) .number-field__input {
		min-width: var(--primitives-space-80);
		padding-inline: var(--_number-field-inline-padding);
	}

`;
