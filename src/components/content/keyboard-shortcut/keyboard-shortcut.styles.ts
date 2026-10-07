import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const keyboardShortcutStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_keyboard-shortcut-size: var(--primitives-space-24);
		--_keyboard-shortcut-inline-padding: var(--primitives-space-4);
		--_keyboard-shortcut-font-family: var(--primitives-font-family-monospace);
		--_keyboard-shortcut-font-size: var(--primitives-font-size-80);
		--_keyboard-shortcut-font-weight: var(--primitives-font-weight-body-regular);
		--_keyboard-shortcut-line-height: var(--primitives-line-height-flat);
		--_keyboard-shortcut-content-color: var(--semantics-content-color);
		--_keyboard-shortcut-separator-color: var(--semantics-content-secondary-color);
		--_keyboard-shortcut-highlight-border-color: light-dark(var(--primitives-color-neutral-150), var(--primitives-color-neutral-250));
		--_keyboard-shortcut-background-color: var(--semantics-surfaces-tinted-background-color);
		--_keyboard-shortcut-border-width: var(--primitives-border-width-thin);
		--_keyboard-shortcut-corner-radius: var(--primitives-corner-radius-xs);

		${inheritedTextReset}
		display: inline-flex;
		vertical-align: middle;
	}

	:host([color="inherit"]) {
		--_keyboard-shortcut-content-color: currentColor;
		--_keyboard-shortcut-separator-color: currentColor;
		--_keyboard-shortcut-highlight-border-color: color-mix(in oklab, var(--semantics-content-contrast-color) 10%, transparent);
		--_keyboard-shortcut-background-color: color-mix(in oklab, var(--semantics-content-contrast-color) 20%, transparent);
	}

	:host([size="sm"]) {
		--_keyboard-shortcut-size: var(--primitives-space-20);
		--_keyboard-shortcut-font-size: var(--primitives-font-size-70);
	}

	:host([size="inherit"]) {
		--_keyboard-shortcut-size: 1.5em;
		--_keyboard-shortcut-inline-padding: 0.35em;
		--_keyboard-shortcut-font-size: 0.75em;
	}

	:host([appearance="simple"]) {
		--_keyboard-shortcut-font-family: var(--primitives-font-family-body);
		--_keyboard-shortcut-font-size: var(--primitives-font-size-100);
	}

	:host([appearance="simple"][size="sm"]) {
		--_keyboard-shortcut-font-size: var(--primitives-font-size-90);
	}

	:host([appearance="simple"][size="inherit"]) {
		--_keyboard-shortcut-font-size: inherit;
	}

	:host([hidden]) {
		display: none;
	}

	@media (any-hover: none) {
		:host(:not([always-visible])) {
			display: none;
		}
	}


	/* # Block */

	.keyboard-shortcut {
		display: inline-flex;
		gap: var(--primitives-space-2);
		align-items: center;
	}

	:host([size="inherit"]) .keyboard-shortcut {
		position: relative;
		top: -0.05em;
	}

	:host([size="inherit"][appearance="simple"]) .keyboard-shortcut {
		position: static;
	}


	/* # Elements */

	.keyboard-shortcut__key {
		box-sizing: border-box;
		display: inline-flex;
		box-shadow: inset 0 0 0 var(--_keyboard-shortcut-border-width) var(--_keyboard-shortcut-highlight-border-color);
		border-radius: var(--_keyboard-shortcut-corner-radius);
		background-color: var(--_keyboard-shortcut-background-color);
		min-width: var(--_keyboard-shortcut-size);
		height: var(--_keyboard-shortcut-size);
		padding: 0 var(--_keyboard-shortcut-inline-padding);
		align-items: center;
		justify-content: center;
		color: var(--_keyboard-shortcut-content-color);
		font-family: var(--_keyboard-shortcut-font-family);
		font-size: var(--_keyboard-shortcut-font-size);
		font-weight: var(--_keyboard-shortcut-font-weight);
		line-height: var(--_keyboard-shortcut-line-height);
		white-space: nowrap;
	}

	:host([appearance="simple"]) .keyboard-shortcut {
		gap: 0;
	}

	:host([appearance="simple"]) .keyboard-shortcut__key {
		box-shadow: none;
		background-color: transparent;
		border-radius: 0;
		min-width: 0;
		height: auto;
		padding: 0;
	}

	@media (forced-colors: active) {
		.keyboard-shortcut__key {
			color: CanvasText;
		}

		:host(:not([appearance="simple"])) .keyboard-shortcut__key {
			border: var(--_keyboard-shortcut-border-width) solid CanvasText;
			background-color: Canvas;
		}
	}

	.keyboard-shortcut__separator {
		color: var(--_keyboard-shortcut-separator-color);
		font-family: var(--_keyboard-shortcut-font-family);
		font-size: var(--_keyboard-shortcut-font-size);
		font-weight: var(--_keyboard-shortcut-font-weight);
		line-height: var(--_keyboard-shortcut-line-height);
	}
`;
