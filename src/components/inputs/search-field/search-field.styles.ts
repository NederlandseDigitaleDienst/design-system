import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const searchFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_search-field-width: 100%;
		--_search-field-background-color: var(--semantics-input-fields-background-color);
		--_search-field-corner-radius: var(--semantics-controls-md-corner-radius);
		--_search-field-min-size: var(--semantics-controls-md-min-size);
		--_search-field-icon-size: var(--primitives-space-24);
		--_search-field-text-font: var(--semantics-input-fields-md-text-font);
		--_search-field-end-padding-right: calc((var(--_search-field-min-size) - var(--semantics-controls-sm-min-size)) / 2 - var(--semantics-input-fields-border-width));
		--_search-field-end-gap: var(--primitives-space-6);
		--_search-field-button-focus-z-index: 1;

		${inheritedTextReset}
		display: block;
		width: var(--_search-field-width);
		max-width: 100%;
		min-width: 0;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	:host([size="sm"]) {
		--_search-field-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_search-field-min-size: var(--semantics-controls-sm-min-size);
		--_search-field-icon-size: var(--primitives-space-20);
		--_search-field-text-font: var(--semantics-input-fields-sm-text-font);
		--_search-field-end-padding-right: calc((var(--_search-field-min-size) - var(--semantics-controls-xs-min-size)) / 2 - var(--semantics-input-fields-border-width));
		--_search-field-end-gap: var(--primitives-space-4);
	}


	/* # Block */

	.search-field {
		box-sizing: border-box;
		display: flex;
		position: relative;
		border: var(--semantics-input-fields-border);
		border-radius: var(--_search-field-corner-radius);
		background-color: var(--_search-field-background-color);
		width: 100%;
		min-height: var(--_search-field-min-size);
		flex-direction: row;
		align-items: center;
	}

	.search-field:has(input:-webkit-autofill),
	.search-field:has(input:autofill) {
		--_search-field-background-color: var(--semantics-input-fields-is-autofill-background-color);
	}

	.search-field:has(.search-field__input:focus-visible) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* # Elements */

	.search-field__label {
		display: flex;
		min-width: 0;
		flex-grow: 1;
		align-self: stretch;
		flex-direction: row;
		align-items: center;
	}

	.search-field__search-icon {
		display: flex;
		margin-inline: calc((var(--_search-field-min-size) - var(--_search-field-icon-size)) / 2 - var(--semantics-input-fields-border-width));
		width: var(--_search-field-icon-size);
		height: var(--_search-field-icon-size);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		color: var(--semantics-content-secondary-color);
	}

	.search-field__input {
		box-sizing: border-box;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		min-width: 0;
		padding: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
		align-self: stretch;
		color: var(--semantics-content-color);
		font: var(--_search-field-text-font);
		appearance: none;
	}

	.search-field__input::placeholder {
		color: var(--semantics-input-fields-placeholder-color);
	}

	.search-field__input:-webkit-autofill,
	.search-field__input:autofill,
	.search-field__input:-webkit-autofill:disabled,
	.search-field__input:autofill:disabled {
		box-shadow: 0 0 0 999px var(--_search-field-background-color) inset;
		-webkit-text-fill-color: var(--semantics-input-fields-is-autofill-content-color);
	}

	.search-field__input::-webkit-search-cancel-button {
		-webkit-appearance: none;
	}

	.search-field__input-fade {
		position: relative;
		width: 0;
		flex-shrink: 0;
		align-self: stretch;
	}

	.search-field__input-fade::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		border-radius: var(--_search-field-corner-radius);
		background: linear-gradient(90deg, color-mix(in oklch, var(--_search-field-background-color) 0%, transparent) 0%, var(--_search-field-background-color) 100%);
		pointer-events: none;
		width: var(--primitives-space-8);
	}

	.search-field__end {
		display: flex;
		position: relative;
		padding-right: var(--_search-field-end-padding-right);
		flex-shrink: 0;
		gap: var(--_search-field-end-gap);
		align-items: center;
	}

	.search-field__clear-button:focus-within,
	.search-field__search-button:focus-within {
		position: relative;
		z-index: var(--_search-field-button-focus-z-index);
	}
`;
