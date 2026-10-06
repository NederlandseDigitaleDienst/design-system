import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const splitButtonStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_split-button-corner-radius: var(--semantics-controls-md-corner-radius);
		--_split-button-background-color: var(--semantics-buttons-neutral-tinted-background-color);
		--_split-button-divider-color: var(--semantics-buttons-neutral-tinted-divider-color);
		--_split-button-highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);
		--_split-button-divider-length: var(--semantics-buttons-md-divider-length);
		--_split-button-width: auto;

		${inheritedTextReset}
		display: inline-flex;
		isolation: isolate;
		-webkit-tap-highlight-color: transparent;
	}

	:host([size="xs"]) {
		--_split-button-corner-radius: var(--semantics-controls-xs-corner-radius);
		--_split-button-divider-length: var(--semantics-buttons-xs-divider-length);
	}

	:host([size="sm"]) {
		--_split-button-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_split-button-divider-length: var(--semantics-buttons-sm-divider-length);
	}

	:host([size="lg"]) {
		--_split-button-corner-radius: var(--semantics-controls-lg-corner-radius);
		--_split-button-divider-length: var(--semantics-buttons-lg-divider-length);
	}

	/* ## Accent Filled (Primary) */

	:host([appearance="accent-filled"]),
	:host([appearance="primary"]) {
		--_split-button-background-color: var(--semantics-buttons-accent-filled-background-color);
		--_split-button-divider-color: var(--semantics-buttons-accent-filled-divider-color);
		--_split-button-highlight-border-color: var(--semantics-buttons-accent-filled-highlight-border-color);
	}

	:host([appearance="neutral-base"]) {
		--_split-button-background-color: var(--semantics-buttons-neutral-base-background-color);
		--_split-button-divider-color: var(--semantics-buttons-neutral-base-divider-color);
		--_split-button-highlight-border-color: var(--semantics-buttons-neutral-base-highlight-border-color);
	}

	/* ## On-color */

	:host([appearance="inherit-tinted"]) {
		--_split-button-background-color: var(--semantics-buttons-inherit-tinted-background-color);
		--_split-button-divider-color: var(--semantics-buttons-inherit-tinted-divider-color);
		--_split-button-highlight-border-color: var(--semantics-buttons-inherit-tinted-highlight-border-color);
		--context-button-background-color: transparent;
	}

	:host([appearance="inherit-filled"]) {
		--_split-button-background-color: var(--semantics-buttons-inherit-filled-background-color);
		--_split-button-divider-color: var(--semantics-buttons-inherit-filled-divider-color);
		--_split-button-highlight-border-color: var(--semantics-buttons-inherit-filled-highlight-border-color);
	}

	:host([width="full"]) {
		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	:host([disabled]) nldd-button,
	:host([disabled]) nldd-icon-button {
		opacity: 1;
	}


	/* # Block */

	.split-button {
		display: inline-flex;
		position: relative;
		width: var(--_split-button-width);
		min-width: fit-content;
		border-radius: var(--_split-button-corner-radius);
		background-color: var(--_split-button-background-color);
		flex-direction: row;
		align-items: center;
	}

	.split-button::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_split-button-highlight-border-color);
		pointer-events: none;
	}


	/* # Elements */

	.split-button__divider {
		background-color: var(--_split-button-divider-color);
		width: 1px;
		height: var(--_split-button-divider-length);
		flex-shrink: 0;
	}

	.split-button__popup-button {
		display: flex;
		flex-shrink: 0;
	}

	nldd-button:focus-within,
	nldd-icon-button:focus-within {
		position: relative;
		z-index: 1;
	}
`;
