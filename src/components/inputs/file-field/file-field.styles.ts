import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const fileFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_file-field-width: 100%;
		--_file-field-corner-radius: var(--semantics-controls-md-corner-radius);
		--_file-field-min-size: var(--semantics-controls-md-min-size);
		--_file-field-inline-padding: var(--semantics-controls-md-inline-padding);
		--_file-field-value-color: var(--semantics-content-color);
		--_file-field-text-font: var(--semantics-input-fields-md-text-font);
		--_file-field-clear-button-padding-right: calc((var(--_file-field-min-size) - var(--semantics-controls-sm-min-size)) / 2);
		--_file-field-validation-icon-area-padding-right: var(--_file-field-inline-padding);
		--_file-field-validation-icon-size: var(--semantics-input-fields-md-validation-icon-size);
		--_file-field-highlight-border-width: var(--semantics-surfaces-border-width);
		--_file-field-highlight-border-color: var(--semantics-surfaces-tinted-border-color);
		--_file-field-background-color: var(--semantics-surfaces-tinted-background-color);

		${inheritedTextReset}
		display: block;
		width: var(--_file-field-width);
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
		--_file-field-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_file-field-min-size: var(--semantics-controls-sm-min-size);
		--_file-field-inline-padding: var(--semantics-controls-sm-inline-padding);
		--_file-field-text-font: var(--semantics-input-fields-sm-text-font);
		--_file-field-clear-button-padding-right: calc((var(--_file-field-min-size) - var(--semantics-controls-xs-min-size)) / 2);
		--_file-field-validation-icon-size: var(--semantics-input-fields-sm-validation-icon-size);
	}


	/* # Block */

	.file-field {
		box-sizing: border-box;
		display: flex;
		border-radius: var(--_file-field-corner-radius);
		box-shadow: inset 0 0 0 var(--_file-field-highlight-border-width) var(--_file-field-highlight-border-color);
		background-color: var(--_file-field-background-color);
		width: 100%;
		min-width: 0;
		min-height: var(--_file-field-min-size);
		align-items: center;
	}


	/* # Elements */

	.file-field__input {
		display: none;
	}

	.file-field__choose-button {
		display: flex;
		flex-shrink: 0;
		align-self: stretch;
	}

	.file-field__value {
		box-sizing: border-box;
		min-width: 0;
		padding-right: var(--_file-field-inline-padding);
		padding-left: var(--_file-field-inline-padding);
		flex-grow: 1;
		color: var(--_file-field-value-color);
		font: var(--_file-field-text-font);
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.file-field__value.is-empty {
		--_file-field-value-color: var(--semantics-content-secondary-color);
	}

	.file-field__clear-button {
		display: flex;
		flex-shrink: 0;
		padding-right: var(--_file-field-clear-button-padding-right);
	}

	.file-field__clear-button:not(:last-child) {
		padding-right: var(--primitives-space-0);
	}

	.file-field__validation-icon-area {
		display: flex;
		height: 100%;
		flex-shrink: 0;
		padding-right: var(--_file-field-validation-icon-area-padding-right);
		align-items: center;
		justify-content: center;
	}

	:host([valid]) .file-field__validation-icon-area {
		color: var(--semantics-input-fields-is-valid-icon-color);
	}

	:host([invalid]) .file-field__validation-icon-area {
		color: var(--semantics-input-fields-is-invalid-icon-color);
	}

	.file-field__validation-icon {
		width: var(--_file-field-validation-icon-size);
		height: var(--_file-field-validation-icon-size);
	}


	/* # High contrast */

	@media (forced-colors: active) {
		.file-field {
			border: var(--_file-field-highlight-border-width) solid CanvasText;
		}
	}
`;
