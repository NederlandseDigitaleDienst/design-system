import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const multiLineTextFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_multi-line-text-field-width: 100%;
		--_multi-line-text-field-background-color: var(--semantics-input-fields-background-color);
		--_multi-line-text-field-corner-radius: var(--semantics-controls-md-corner-radius);
		--_multi-line-text-field-inline-padding: calc(var(--semantics-controls-md-inline-padding) - var(--semantics-input-fields-border-width));
		--_multi-line-text-field-min-height: var(--semantics-controls-md-min-size);
		--_multi-line-text-field-text-font: var(--semantics-input-fields-md-text-font);
		--_multi-line-text-field-icon-area-size: calc(var(--_multi-line-text-field-min-height) - var(--semantics-input-fields-border-width) * 2);
		--_multi-line-text-field-validation-icon-size: var(--semantics-input-fields-md-validation-icon-size);
		--_multi-line-text-field-rows: 3;

		${inheritedTextReset}
		display: block;
		width: var(--_multi-line-text-field-width);
		max-width: 100%;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="sm"]) {
		--_multi-line-text-field-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_multi-line-text-field-inline-padding: calc(var(--semantics-controls-sm-inline-padding) - var(--semantics-input-fields-border-width));
		--_multi-line-text-field-min-height: var(--semantics-controls-sm-min-size);
		--_multi-line-text-field-text-font: var(--semantics-input-fields-sm-text-font);
		--_multi-line-text-field-validation-icon-size: var(--semantics-input-fields-sm-validation-icon-size);
	}


	/* # Block */

	.multi-line-text-field {
		box-sizing: border-box;
		display: block;
		position: relative;
		border: var(--semantics-input-fields-border);
		border-radius: var(--_multi-line-text-field-corner-radius);
		background-color: var(--_multi-line-text-field-background-color);
		overflow: hidden;
	}

	:host([valid]) .multi-line-text-field {
		border-color: var(--semantics-input-fields-is-valid-border-color);
	}

	:host([invalid]) .multi-line-text-field {
		border-color: var(--semantics-input-fields-is-invalid-border-color);
	}

	:host([readonly]) .multi-line-text-field {
		--_multi-line-text-field-background-color: var(--semantics-input-fields-is-read-only-background-color);
		border-color: var(--semantics-input-fields-is-read-only-border-color);
	}

	:host([disabled]) .multi-line-text-field {
		opacity: var(--primitives-opacity-disabled);
	}

	.multi-line-text-field:has(textarea:-webkit-autofill),
	.multi-line-text-field:has(textarea:autofill) {
		--_multi-line-text-field-background-color: var(--semantics-input-fields-is-autofill-background-color);
	}

	.multi-line-text-field:focus-within {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* # Elements */

	.multi-line-text-field__input {
		box-sizing: border-box;
		display: block;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		width: 100%;
		/* rows is the floor in every resize mode: one row already fits in
		   --_multi-line-text-field-min-height, each extra row adds one line height. (resize="auto"
		   then grows past it via field-sizing.) */
		min-height: calc(var(--_multi-line-text-field-min-height) - var(--semantics-input-fields-border-width) * 2 + (var(--_multi-line-text-field-rows) - 1) * 1lh);
		padding-block: calc((var(--_multi-line-text-field-min-height) - var(--semantics-input-fields-border-width) * 2 - 1lh) / 2);
		padding-inline: var(--_multi-line-text-field-inline-padding);
		color: var(--semantics-content-color);
		font: var(--_multi-line-text-field-text-font);
		appearance: none;
		resize: none;
		field-sizing: content;
	}

	:host([resize="vertical"]) .multi-line-text-field__input {
		resize: vertical;
		field-sizing: fixed;
	}

	:host([resize="none"]) .multi-line-text-field__input {
		resize: none;
		field-sizing: fixed;
	}

	:host([valid]) .multi-line-text-field__input,
	:host([invalid]) .multi-line-text-field__input {
		padding-inline-end: var(--_multi-line-text-field-icon-area-size);
	}

	:host([disabled]) .multi-line-text-field__input {
		pointer-events: none;
	}

	.multi-line-text-field__input::placeholder {
		color: var(--semantics-input-fields-placeholder-color);
	}

	.multi-line-text-field__input:-webkit-autofill,
	.multi-line-text-field__input:autofill,
	.multi-line-text-field__input:-webkit-autofill:disabled,
	.multi-line-text-field__input:autofill:disabled {
		box-shadow: 0 0 0 999px var(--_multi-line-text-field-background-color) inset;
		-webkit-text-fill-color: var(--semantics-input-fields-is-autofill-content-color);
	}

	.multi-line-text-field__validation-icon-area {
		display: flex;
		position: absolute;
		top: 0;
		right: 0;
		pointer-events: none;
		width: var(--_multi-line-text-field-icon-area-size);
		height: var(--_multi-line-text-field-icon-area-size);
		align-items: center;
		justify-content: center;
	}

	:host([valid]) .multi-line-text-field__validation-icon-area {
		color: var(--semantics-input-fields-is-valid-icon-color);
	}

	:host([invalid]) .multi-line-text-field__validation-icon-area {
		color: var(--semantics-input-fields-is-invalid-icon-color);
	}

	.multi-line-text-field__validation-icon {
		width: var(--_multi-line-text-field-validation-icon-size);
		height: var(--_multi-line-text-field-validation-icon-size);
	}
`;
