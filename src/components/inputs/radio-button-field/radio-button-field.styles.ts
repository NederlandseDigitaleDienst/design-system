import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const radioButtonFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		${inheritedTextReset}
		display: block;
		position: relative;
		cursor: default;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host(:focus-visible) {
		outline: none;
	}


	/* # Block */

	.radio-button-field {
		display: flex;
		min-height: var(--semantics-controls-md-min-size);
		flex-direction: row;
		gap: var(--primitives-space-8);
		align-items: flex-start;
	}


	/* # Elements */

	.radio-button-field__control {
		display: flex;
		min-height: var(--semantics-controls-md-min-size);
		flex-shrink: 0;
		align-items: center;
	}

	.radio-button-field__label {
		display: flex;
		cursor: default;
		padding-top: calc((var(--semantics-controls-md-min-size) - 1em * var(--primitives-line-height-snug)) / 2);
		flex-grow: 1;
		color: var(--semantics-content-color);
		font: var(--primitives-font-body-md-regular-snug);
	}

	:host([disabled]) .radio-button-field__label {
		opacity: var(--primitives-opacity-disabled);
	}
`;
