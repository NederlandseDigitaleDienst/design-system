import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const passwordFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_password-field-width: 100%;
		--_password-field-background-color: var(--semantics-input-fields-background-color);
		--_password-field-corner-radius: var(--semantics-controls-md-corner-radius);
		--_password-field-min-size: var(--semantics-controls-md-min-size);
		--_password-field-inline-padding: var(--semantics-controls-md-inline-padding);
		--_password-field-text-font: var(--semantics-input-fields-md-text-font);
		--_password-field-mask-font: var(--semantics-input-fields-md-mask-font);
		--_password-field-validation-icon-size: var(--semantics-input-fields-md-validation-icon-size);
		--_password-field-visibility-toggle-padding: calc((var(--_password-field-min-size) - var(--semantics-input-fields-border-width) * 2 - var(--semantics-controls-sm-min-size)) / 2);
		--_password-field-button-focus-z-index: 1;

		${inheritedTextReset}
		display: block;
		width: var(--_password-field-width);
		max-width: 100%;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="sm"]) {
		--_password-field-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_password-field-min-size: var(--semantics-controls-sm-min-size);
		--_password-field-inline-padding: var(--semantics-controls-sm-inline-padding);
		--_password-field-text-font: var(--semantics-input-fields-sm-text-font);
		--_password-field-mask-font: var(--semantics-input-fields-sm-mask-font);
		--_password-field-validation-icon-size: var(--semantics-input-fields-sm-validation-icon-size);
		--_password-field-visibility-toggle-padding: calc((var(--_password-field-min-size) - var(--semantics-input-fields-border-width) * 2 - var(--semantics-controls-xs-min-size)) / 2);
	}


	/* # Block */

	.password-field {
		box-sizing: border-box;
		display: flex;
		border: var(--semantics-input-fields-border);
		border-radius: var(--_password-field-corner-radius);
		background-color: var(--_password-field-background-color);
		min-height: var(--_password-field-min-size);
		padding-left: calc(var(--_password-field-inline-padding) - var(--semantics-input-fields-border-width));
		flex-direction: row;
		align-items: center;
	}

	:host([valid]) .password-field {
		border-color: var(--semantics-input-fields-is-valid-border-color);
	}

	:host([invalid]) .password-field {
		border-color: var(--semantics-input-fields-is-invalid-border-color);
	}

	:host([readonly]) .password-field {
		--_password-field-background-color: var(--semantics-input-fields-is-read-only-background-color);
		border-color: var(--semantics-input-fields-is-read-only-border-color);
	}

	:host([disabled]) .password-field {
		opacity: var(--primitives-opacity-disabled);
	}

	.password-field:has(input:-webkit-autofill),
	.password-field:has(input:autofill) {
		--_password-field-background-color: var(--semantics-input-fields-is-autofill-background-color);
	}

	.password-field:focus-within:not(:has(.password-field__visibility-toggle-button:focus-within)) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* # Elements */

	.password-field__input {
		box-sizing: border-box;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		min-width: 0;
		min-height: calc(var(--_password-field-min-size) - var(--semantics-input-fields-border-width) * 2);
		overflow: hidden;
		padding: 0;
		flex-grow: 1;
		color: var(--semantics-content-color);
		font: var(--_password-field-text-font);
		appearance: none;
	}

	.password-field__input::placeholder {
		color: var(--semantics-input-fields-placeholder-color);
		font: var(--_password-field-text-font);
	}

	.password-field__input.is-masked {
		font: var(--_password-field-mask-font);
	}

	:host([disabled]) .password-field__input {
		pointer-events: none;
	}

	.password-field__input:-webkit-autofill,
	.password-field__input:autofill,
	.password-field__input:-webkit-autofill:disabled,
	.password-field__input:autofill:disabled {
		box-shadow: 0 0 0 999px var(--_password-field-background-color) inset;
		-webkit-text-fill-color: var(--semantics-input-fields-is-autofill-content-color);
	}

	.password-field__input-fade {
		position: relative;
		width: 0;
		flex-shrink: 0;
		align-self: stretch;
	}

	.password-field__input-fade::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		border-radius: var(--_password-field-corner-radius);
		background: linear-gradient(90deg, color-mix(in oklch, var(--_password-field-background-color) 0%, transparent) 0%, var(--_password-field-background-color) 100%);
		pointer-events: none;
		width: var(--primitives-space-8);
	}

	.password-field__validation-icon-area {
		display: flex;
		width: calc(var(--_password-field-min-size) - var(--semantics-input-fields-border-width) * 2);
		height: 100%;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	:host([valid]) .password-field__validation-icon-area {
		color: var(--semantics-input-fields-is-valid-icon-color);
	}

	:host([invalid]) .password-field__validation-icon-area {
		color: var(--semantics-input-fields-is-invalid-icon-color);
	}

	.password-field__validation-icon {
		width: var(--_password-field-validation-icon-size);
		height: var(--_password-field-validation-icon-size);
	}

	.password-field__visibility-toggle-button {
		display: flex;
		height: 100%;
		padding-block: var(--_password-field-visibility-toggle-padding);
		padding-inline-end: var(--_password-field-visibility-toggle-padding);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	.password-field__visibility-toggle-button:focus-within {
		position: relative;
		z-index: var(--_password-field-button-focus-z-index);
	}
`;
