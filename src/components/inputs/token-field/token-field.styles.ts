import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const tokenFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_width: 100%;
		--_background-color: var(--semantics-input-fields-background-color);
		--_corner-radius: var(--semantics-controls-md-corner-radius);
		--_min-size: var(--semantics-controls-md-min-size);
		--_inline-padding: calc(var(--semantics-controls-md-inline-padding) - var(--semantics-input-fields-border-width));
		--_text-font: var(--semantics-input-fields-md-text-font);
		--_validation-icon-size: var(--semantics-input-fields-md-validation-icon-size);
		--_validation-icon-area-size: calc(var(--_min-size) - var(--semantics-input-fields-border-width) * 2);
		--_gap: calc((var(--semantics-controls-md-min-size) - var(--semantics-controls-sm-min-size) - 2 * var(--semantics-input-fields-border-width)) / 2);
		--_input-min-width: var(--primitives-area-200);

		${inheritedTextReset}
		display: block;
		width: var(--_width);
		max-width: 100%;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	:host([readonly]) .token-field {
		--_background-color: var(--semantics-input-fields-is-read-only-background-color);
		border-color: var(--semantics-input-fields-is-read-only-border-color);
		cursor: default;
	}


	/* # Block — a wrapping row of tokens and the input area, with the validation
	   icon pinned on the trailing edge. */

	.token-field {
		position: relative;
		box-sizing: border-box;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--_gap);
		border: var(--semantics-input-fields-border);
		border-radius: var(--_corner-radius);
		background-color: var(--_background-color);
		width: 100%;
		min-height: var(--_min-size);
		padding-block: var(--_gap);
		padding-inline: var(--_gap);
	}

	/* The role="list" wrapper carries token grouping for assistive tech without
	   affecting layout — the tokens stay flex children of .token-field. */
	.token-field__list {
		display: contents;
	}

	/* Text cursor only while the input is present — the frame forwards a padding click
	   to it (_handleFieldClick). With no input (no custom values allowed and no options
	   left) there is nothing to type into, so the frame keeps the default arrow. */
	.token-field:has(.token-field__input) {
		cursor: text;
	}

	/* :has(input:focus), not :focus-within: a focused token or picker carries its
	   own ring, so the frame's ring is scoped to the input alone. */
	.token-field:has(.token-field__input:focus) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.token-field[data-invalid] {
		border-color: var(--semantics-input-fields-is-invalid-border-color);
	}

	.token-field[data-valid] {
		border-color: var(--semantics-input-fields-is-valid-border-color);
	}

	/* Reserve the validation icon's area so tokens/input stay clear of it. */
	.token-field[data-invalid],
	.token-field[data-valid] {
		padding-inline-end: var(--_validation-icon-area-size);
	}


	/* # Input area — the input and picker travel to a new row together. */

	.token-field__input-area {
		display: flex;
		align-items: center;
		gap: var(--_gap);
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: var(--_input-min-width);
		min-width: var(--_input-min-width);
	}


	/* # Input */

	.token-field__input {
		${inheritedTextReset}
		box-sizing: border-box;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: auto;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		color: inherit;
		font: var(--_text-font);
		height: var(--semantics-controls-sm-min-size);
		/* Rounds the autofill mask (below) like a token. */
		border-radius: var(--semantics-controls-sm-corner-radius);
		padding: 0;
		/* The frame already adds the leading gap, so subtract it to land on the
		   standard inline-padding. */
		padding-inline-start: calc(var(--_inline-padding) - var(--_gap));
		margin: 0;
	}

	.token-field__input::placeholder {
		color: var(--semantics-input-fields-placeholder-color);
	}

	/* Mask the browser autofill background (box-shadow inset) and its text color. */
	.token-field__input:-webkit-autofill,
	.token-field__input:autofill,
	.token-field__input:-webkit-autofill:disabled,
	.token-field__input:autofill:disabled {
		box-shadow: 0 0 0 999px var(--semantics-input-fields-is-autofill-background-color) inset;
		-webkit-text-fill-color: var(--semantics-input-fields-is-autofill-content-color);
	}


	/* # Picker */

	.token-field__picker {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.token-field__picker:focus-within {
		position: relative;
		z-index: 1;
	}


	/* # Validation icon */

	/* Absolute so it doesn't change the frame height; the frame reserves its area. */
	.token-field__validation-icon-area {
		position: absolute;
		inset-block-start: 0;
		inset-inline-end: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--_validation-icon-area-size);
		height: var(--_validation-icon-area-size);
		pointer-events: none;
	}

	/* nldd-icon fills its parent, so pin a size. */
	.token-field__validation-icon {
		width: var(--_validation-icon-size);
		height: var(--_validation-icon-size);
	}

	:host([valid]) .token-field__validation-icon {
		color: var(--semantics-input-fields-is-valid-icon-color);
	}

	:host([invalid]) .token-field__validation-icon {
		color: var(--semantics-input-fields-is-invalid-icon-color);
	}
`;
