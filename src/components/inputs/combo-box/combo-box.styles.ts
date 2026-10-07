import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const comboBoxStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_combo-box-width: 100%;
		--_combo-box-background-color: var(--semantics-input-fields-background-color);
		--_combo-box-corner-radius: var(--semantics-controls-md-corner-radius);
		--_combo-box-min-size: var(--semantics-controls-md-min-size);
		--_combo-box-inline-padding: calc(var(--semantics-controls-md-inline-padding) - var(--semantics-input-fields-border-width));
		--_combo-box-text-font: var(--semantics-input-fields-md-text-font);
		--_combo-box-end-padding-right: calc((var(--_combo-box-min-size) - var(--semantics-controls-sm-min-size)) / 2 - var(--semantics-input-fields-border-width));
		--_combo-box-button-focus-z-index: 1;
		--_combo-box-validation-icon-size: var(--semantics-input-fields-md-validation-icon-size);

		${inheritedTextReset}
		display: block;
		width: var(--_combo-box-width);
		max-width: 100%;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="sm"]) {
		--_combo-box-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_combo-box-min-size: var(--semantics-controls-sm-min-size);
		--_combo-box-inline-padding: calc(var(--semantics-controls-sm-inline-padding) - var(--semantics-input-fields-border-width));
		--_combo-box-text-font: var(--semantics-input-fields-sm-text-font);
		--_combo-box-end-padding-right: calc((var(--_combo-box-min-size) - var(--semantics-controls-xs-min-size)) / 2 - var(--semantics-input-fields-border-width));
		--_combo-box-validation-icon-size: var(--semantics-input-fields-sm-validation-icon-size);
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}


	/* # Block */

	.combo-box {
		box-sizing: border-box;
		display: flex;
		border: var(--semantics-input-fields-border);
		border-radius: var(--_combo-box-corner-radius);
		background-color: var(--_combo-box-background-color);
		width: 100%;
		min-height: var(--_combo-box-min-size);
		flex-direction: row;
		align-items: center;
	}

	:host([valid]) .combo-box {
		border-color: var(--semantics-input-fields-is-valid-border-color);
	}

	:host([invalid]) .combo-box {
		border-color: var(--semantics-input-fields-is-invalid-border-color);
	}

	:host([readonly]) .combo-box {
		--_combo-box-background-color: var(--semantics-input-fields-is-read-only-background-color);
		border-color: var(--semantics-input-fields-is-read-only-border-color);
	}

	.combo-box:has(input:-webkit-autofill),
	.combo-box:has(input:autofill) {
		--_combo-box-background-color: var(--semantics-input-fields-is-autofill-background-color);
	}

	.combo-box:has(.combo-box__input:focus-visible) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* # Elements */

	.combo-box__input {
		box-sizing: border-box;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		min-width: 0;
		width: 100%;
		padding-left: var(--_combo-box-inline-padding);
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
		align-self: stretch;
		color: var(--semantics-content-color);
		font: var(--_combo-box-text-font);
		appearance: none;
	}

	.combo-box__input::placeholder {
		color: var(--semantics-input-fields-placeholder-color);
	}

	.combo-box__input:-webkit-autofill,
	.combo-box__input:autofill,
	.combo-box__input:-webkit-autofill:disabled,
	.combo-box__input:autofill:disabled {
		box-shadow: 0 0 0 999px var(--_combo-box-background-color) inset;
		-webkit-text-fill-color: var(--semantics-input-fields-is-autofill-content-color);
	}

	.combo-box__input-fade {
		position: relative;
		width: 0;
		flex-shrink: 0;
		align-self: stretch;
	}

	.combo-box__input-fade::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(90deg, color-mix(in oklch, var(--_combo-box-background-color) 0%, transparent) 0%, var(--_combo-box-background-color) 100%);
		pointer-events: none;
		width: var(--primitives-space-8);
	}

	.combo-box__end {
		display: flex;
		padding-right: var(--_combo-box-end-padding-right);
		flex-shrink: 0;
		align-items: center;
	}

	.combo-box__clear-button:focus-within {
		position: relative;
		z-index: var(--_combo-box-button-focus-z-index);
	}

	.combo-box__validation-icon-area {
		display: flex;
		height: 100%;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	:host([valid]) .combo-box__validation-icon-area {
		color: var(--semantics-input-fields-is-valid-icon-color);
	}

	:host([invalid]) .combo-box__validation-icon-area {
		color: var(--semantics-input-fields-is-invalid-icon-color);
	}

	.combo-box__validation-icon {
		width: var(--_combo-box-validation-icon-size);
		height: var(--_combo-box-validation-icon-size);
	}

	/* Flex, or the wrapper is as tall as the line box it inherits and the button
	   inside it hangs at the top of that. It leaves the button's place at the
	   mercy of the consumer's line-height: centred under one, high under a taller
	   one. The file field and the time field already do this. */
	.combo-box__clear-button,
	.combo-box__picker-button {
		display: flex;
	}

	.combo-box__picker-button {
		margin-left: var(--primitives-space-6);
	}

	.combo-box__picker-button:focus-within {
		position: relative;
		z-index: var(--_combo-box-button-focus-z-index);
	}
`;
