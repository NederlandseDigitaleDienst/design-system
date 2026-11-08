import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const oneTimeCodeFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_one-time-code-field-gap: var(--primitives-space-8);
		--_one-time-code-field-box-size: var(--semantics-controls-md-min-size);
		--_one-time-code-field-box-corner-radius: var(--semantics-controls-md-corner-radius);
		--_one-time-code-field-box-background-color: var(--semantics-input-fields-background-color);
		--_one-time-code-field-font: var(--semantics-input-fields-md-text-font);
		--_one-time-code-field-box-font: var(--primitives-font-monospace-md-regular-flat);
		--_one-time-code-field-caret-width: var(--primitives-space-2);
		--_one-time-code-field-caret-height: var(--primitives-space-20);
		--_one-time-code-field-space-width: var(--primitives-space-12);
		--_one-time-code-field-dash-width: var(--primitives-space-12);
		--_one-time-code-field-dash-height: var(--primitives-space-3);

		${inheritedTextReset}
		display: block;
		max-width: 100%;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="sm"]),
	:host([data-fit="sm"]) {
		--_one-time-code-field-gap: var(--primitives-space-6);
		--_one-time-code-field-box-size: var(--semantics-controls-sm-min-size);
		--_one-time-code-field-box-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_one-time-code-field-font: var(--semantics-input-fields-sm-text-font);
		--_one-time-code-field-box-font: var(--primitives-font-monospace-sm-regular-flat);
		--_one-time-code-field-caret-height: var(--primitives-space-16);
		--_one-time-code-field-space-width: var(--primitives-space-8);
		--_one-time-code-field-dash-width: var(--primitives-space-10);
		--_one-time-code-field-dash-height: var(--primitives-space-2);
	}

	:host([size="lg"]:not([data-fit])) {
		--_one-time-code-field-gap: var(--primitives-space-10);
		--_one-time-code-field-box-size: var(--semantics-controls-lg-min-size);
		--_one-time-code-field-box-corner-radius: var(--semantics-controls-lg-corner-radius);
		--_one-time-code-field-box-font: var(--primitives-font-weight-body-regular) var(--primitives-font-size-300) / var(--primitives-line-height-flat) var(--primitives-font-family-monospace);
		--_one-time-code-field-caret-height: var(--primitives-space-28);
		--_one-time-code-field-space-width: var(--primitives-space-16);
		--_one-time-code-field-dash-width: var(--primitives-space-16);
		--_one-time-code-field-dash-height: var(--primitives-space-4);
	}

	:host([readonly]) {
		--_one-time-code-field-box-background-color: var(--semantics-input-fields-is-read-only-background-color);
	}


	/* # Block */

	.one-time-code-field {
		display: flex;
		position: relative;
		width: fit-content;
		max-width: 100%;
	}

	:host([disabled]) .one-time-code-field {
		opacity: var(--primitives-opacity-disabled);
	}


	/* # Elements */

	.one-time-code-field__input {
		box-sizing: border-box;
		position: absolute;
		inset: 0;
		z-index: 1;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		width: 100%;
		height: 100%;
		padding: 0;
		color: transparent;
		font: var(--_one-time-code-field-font);
		caret-color: transparent;
		appearance: none;
	}

	.one-time-code-field__input::selection {
		background: transparent;
	}

	.one-time-code-field__input:-webkit-autofill,
	.one-time-code-field__input:autofill {
		box-shadow: 0 0 0 999px transparent inset;
		-webkit-text-fill-color: transparent;
	}

	:host([disabled]) .one-time-code-field__input {
		pointer-events: none;
	}

	.one-time-code-field__boxes {
		display: flex;
		gap: var(--_one-time-code-field-gap);
	}

	.one-time-code-field__box {
		box-sizing: border-box;
		display: flex;
		border: var(--semantics-input-fields-border);
		border-radius: var(--_one-time-code-field-box-corner-radius);
		background-color: var(--_one-time-code-field-box-background-color);
		width: var(--_one-time-code-field-box-size);
		min-width: 0;
		height: var(--_one-time-code-field-box-size);
		flex-shrink: 1;
		align-items: center;
		justify-content: center;
		color: var(--semantics-content-color);
		font: var(--_one-time-code-field-box-font);
	}

	:host([invalid]) .one-time-code-field__box {
		border-color: var(--semantics-input-fields-is-invalid-border-color);
	}

	:host([readonly]) .one-time-code-field__box {
		border-color: var(--semantics-input-fields-is-read-only-border-color);
	}

	.one-time-code-field__box.is-active {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.one-time-code-field__separator {
		display: flex;
		align-items: center;
		color: var(--semantics-content-secondary-color);
		font: var(--_one-time-code-field-box-font);
		white-space: pre;
	}

	.one-time-code-field__separator.is-space {
		width: var(--_one-time-code-field-space-width);
		flex-shrink: 0;
	}

	.one-time-code-field__separator.is-dash {
		border-radius: calc(var(--_one-time-code-field-dash-height) / 2);
		background-color: currentColor;
		width: var(--_one-time-code-field-dash-width);
		height: var(--_one-time-code-field-dash-height);
		flex-shrink: 0;
		align-self: center;
	}

	.one-time-code-field__character {
		position: relative;
	}

	.one-time-code-field__caret {
		background-color: currentColor;
		width: var(--_one-time-code-field-caret-width);
		height: var(--_one-time-code-field-caret-height);
		animation: one-time-code-field-blink 1s step-end infinite;
	}

	.one-time-code-field__caret.is-after {
		position: absolute;
		top: 50%;
		left: 100%;
		margin-left: var(--_one-time-code-field-caret-width);
		transform: translateY(-50%);
	}

	@media (prefers-reduced-motion: reduce) {
		.one-time-code-field__caret {
			animation: none;
		}
	}

	@keyframes one-time-code-field-blink {
		50% {
			opacity: 0;
		}
	}


	/* # Accessibility */

	@media (forced-colors: active) {
		.one-time-code-field__box {
			border-color: CanvasText;
		}

		.one-time-code-field__box.is-active {
			outline: 2px solid Highlight;
		}
	}
`;
