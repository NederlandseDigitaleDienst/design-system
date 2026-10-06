import { css, unsafeCSS } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';
import { breakpoints } from '../../../assets/styles/breakpoints.js';

const mdMin = unsafeCSS(breakpoints.mdMin);

export const timeFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_time-field-text-width: 5.5ch;
		--_time-field-edge-width: calc(var(--_time-field-inline-padding) + var(--semantics-input-fields-border-width));
		--_time-field-validation-icon-area-width: calc(var(--_time-field-validation-icon-size) + var(--primitives-space-8));
		--_time-field-picker-button-size: var(--semantics-controls-sm-min-size);
		--_time-field-end-padding-right: calc((var(--_time-field-min-size) - var(--_time-field-picker-button-size)) / 2 - var(--semantics-input-fields-border-width));
		--_time-field-trailing-width: calc(var(--_time-field-validation-icon-area-width) + var(--_time-field-picker-button-size) + var(--_time-field-end-padding-right));
		--_time-field-fixed-width: calc(var(--_time-field-edge-width) + var(--_time-field-trailing-width));
		--_time-field-width: calc(var(--_time-field-fixed-width) + var(--_time-field-text-width));
		--_time-field-corner-radius: var(--semantics-controls-md-corner-radius);
		--_time-field-background-color: var(--semantics-input-fields-background-color);
		--_time-field-min-size: var(--semantics-controls-md-min-size);
		--_time-field-inline-padding: var(--semantics-controls-md-inline-padding);
		--_time-field-text-font: var(--semantics-input-fields-md-text-font);
		--_time-field-validation-icon-size: var(--semantics-input-fields-md-validation-icon-size);

		${inheritedTextReset}
		display: block;
		width: var(--_time-field-width);
		min-width: var(--_time-field-fixed-width);
		max-width: 100%;
		font: var(--_time-field-text-font);
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	/* 'fit-content' is not the CSS keyword here but this system's width word:
	   as wide as what is in it. Room held for a validation icon that is not
	   there is not in it, so what is left is the air the field needs between its
	   text and the picker button. The full slot comes back the moment a validation
	   state does, and the field grows at its trailing edge — after the picker
	   button, leaving the time where it was. Opt-in, because only the consumer
	   knows whether this field is ever validated. */
	:host([width="fit-content"]:not([valid]):not([invalid])) {
		--_time-field-validation-icon-area-width: var(--primitives-space-8);
	}


	:host([no-picker]) {
		--_time-field-fixed-width: calc(var(--_time-field-edge-width) + var(--_time-field-inline-padding) + var(--_time-field-validation-icon-area-width));
	}

	:host([size="sm"]) {
		--_time-field-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_time-field-min-size: var(--semantics-controls-sm-min-size);
		--_time-field-inline-padding: var(--semantics-controls-sm-inline-padding);
		--_time-field-text-font: var(--semantics-input-fields-sm-text-font);
		--_time-field-validation-icon-size: var(--semantics-input-fields-sm-validation-icon-size);
		--_time-field-picker-button-size: var(--semantics-controls-xs-min-size);
	}


	/* # Block */

	.time-field {
		box-sizing: border-box;
		display: flex;
		border: var(--semantics-input-fields-border);
		border-radius: var(--_time-field-corner-radius);
		background-color: var(--_time-field-background-color);
		min-height: var(--_time-field-min-size);
		padding-left: calc(var(--_time-field-inline-padding) - var(--semantics-input-fields-border-width));
		flex-direction: row;
		align-items: center;
	}

	:host([valid]) .time-field {
		border-color: var(--semantics-input-fields-is-valid-border-color);
	}

	:host([invalid]) .time-field {
		border-color: var(--semantics-input-fields-is-invalid-border-color);
	}

	:host([readonly]) .time-field {
		--_time-field-background-color: var(--semantics-input-fields-is-read-only-background-color);
		border-color: var(--semantics-input-fields-is-read-only-border-color);
	}

	:host([disabled]) .time-field {
		opacity: var(--primitives-opacity-disabled);
	}

	.time-field:has(input:-webkit-autofill),
	.time-field:has(input:autofill) {
		--_time-field-background-color: var(--semantics-input-fields-is-autofill-background-color);
	}

	/* Keyed on the text input, not :focus-within: the button and the popover live
	   in this box too and would draw a second ring around the whole field. */
	.time-field:has(.time-field__input:focus) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* # Elements */

	.time-field__input {
		box-sizing: border-box;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		min-width: 0;
		min-height: calc(var(--_time-field-min-size) - var(--semantics-input-fields-border-width) * 2);
		overflow: hidden;
		padding: 0;
		flex-grow: 1;
		color: var(--semantics-content-color);
		font: var(--_time-field-text-font);
		appearance: none;
	}

	:host([disabled]) .time-field__input {
		pointer-events: none;
	}

	.time-field__input::placeholder {
		color: var(--semantics-input-fields-placeholder-color);
	}

	.time-field__input:-webkit-autofill,
	.time-field__input:autofill,
	.time-field__input:-webkit-autofill:disabled,
	.time-field__input:autofill:disabled {
		box-shadow: 0 0 0 999px var(--_time-field-background-color) inset;
		-webkit-text-fill-color: var(--semantics-input-fields-is-autofill-content-color);
	}

	.time-field__input-fade {
		position: relative;
		width: 0;
		flex-shrink: 0;
		align-self: stretch;
	}

	.time-field__input-fade::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		border-radius: var(--_time-field-corner-radius);
		background: linear-gradient(90deg, color-mix(in oklch, var(--_time-field-background-color) 0%, transparent) 0%, var(--_time-field-background-color) 100%);
		pointer-events: none;
		width: var(--primitives-space-8);
	}

	.time-field__validation-icon-area {
		display: flex;
		width: var(--_time-field-validation-icon-area-width);
		height: 100%;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	:host([valid]) .time-field__validation-icon-area {
		color: var(--semantics-input-fields-is-valid-icon-color);
	}

	:host([invalid]) .time-field__validation-icon-area {
		color: var(--semantics-input-fields-is-invalid-icon-color);
	}

	.time-field__validation-icon {
		display: flex;
		width: var(--_time-field-validation-icon-size);
		height: var(--_time-field-validation-icon-size);
	}

	.time-field__picker-button {
		position: relative;
		display: flex;
		flex-shrink: 0;
		padding-right: var(--_time-field-end-padding-right);
		align-items: center;
	}


	@media (min-width: ${mdMin}) {
		.time-field__picker-button nldd-top-title-bar {
			display: none;
		}
	}
`;
