import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const keyboardShortcutStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_size: var(--components-keyboard-shortcut-md-size);
		--_inline-padding: var(--primitives-space-4);
		--_font-family: var(--primitives-font-family-monospace);
		--_font-size: var(--primitives-font-size-80);
		--_font-weight: var(--primitives-font-weight-body-regular);
		--_line-height: var(--primitives-line-height-flat);
		--_content-color: var(--components-keyboard-shortcut-content-color);
		--_separator-color: var(--components-keyboard-shortcut-separator-color);
		--_highlight-border-color: var(--components-keyboard-shortcut-border-color);
		--_background-color: var(--components-keyboard-shortcut-background-color);

		${inheritedTextReset}
		display: inline-flex;
		vertical-align: middle;
	}

	:host([color="inherit"]) {
		--_content-color: currentColor;
		--_separator-color: currentColor;
		--_highlight-border-color: color-mix(in oklab, var(--semantics-content-contrast-color) 10%, transparent);
		--_background-color: color-mix(in oklab, var(--semantics-content-contrast-color) 20%, transparent);
	}

	:host([size="sm"]) {
		--_size: var(--components-keyboard-shortcut-sm-size);
		--_font-size: var(--primitives-font-size-70);
	}

	:host([size="inherit"]) {
		--_size: 1.5em;
		--_inline-padding: 0.35em;
		--_font-size: 0.75em;
	}

	:host([appearance="simple"]) {
		--_font-family: var(--primitives-font-family-body);
		--_font-size: var(--primitives-font-size-100);
	}

	:host([appearance="simple"][size="sm"]) {
		--_font-size: var(--primitives-font-size-90);
	}

	:host([appearance="simple"][size="inherit"]) {
		--_font-size: inherit;
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
		box-shadow: inset 0 0 0 var(--components-keyboard-shortcut-border-width) var(--_highlight-border-color);
		border-radius: var(--components-keyboard-shortcut-corner-radius);
		background-color: var(--_background-color);
		min-width: var(--_size);
		height: var(--_size);
		padding: 0 var(--_inline-padding);
		align-items: center;
		justify-content: center;
		color: var(--_content-color);
		font-family: var(--_font-family);
		font-size: var(--_font-size);
		font-weight: var(--_font-weight);
		line-height: var(--_line-height);
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
			border: var(--components-keyboard-shortcut-border-width) solid CanvasText;
			background-color: Canvas;
		}
	}

	.keyboard-shortcut__separator {
		color: var(--_separator-color);
		font-family: var(--_font-family);
		font-size: var(--_font-size);
		font-weight: var(--_font-weight);
		line-height: var(--_line-height);
	}
`;
