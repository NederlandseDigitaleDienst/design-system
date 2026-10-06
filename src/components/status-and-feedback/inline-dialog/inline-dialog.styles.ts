import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const inlineDialogStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_icon-size: var(--primitives-space-40);
		--_icon-color: var(--semantics-content-color);
		--_text-font: var(--primitives-font-body-md-bold-tight);
		--_supporting-text-font: var(--primitives-font-body-sm-regular-tight);

		${inheritedTextReset}
		display: flex;
		flex-grow: 1;
		align-items: center;
		justify-content: center;
	}

	:host([size="lg"]) {
		--_icon-size: var(--primitives-space-48);
		--_text-font: var(--primitives-font-body-lg-bold-tight);
		--_supporting-text-font: var(--primitives-font-body-md-regular-tight);
	}

	:host([variant="alert"]) {
		--_icon-color: light-dark(var(--primitives-color-warning-350), var(--primitives-color-warning-650));
	}

	:host([variant="success"]) {
		--_icon-color: var(--primitives-color-success-500);
	}

	:host([icon-color="secondary"]) {
		--_icon-color: var(--semantics-content-secondary-color);
	}

	:host([icon-color="accent"]) {
		--_icon-color: light-dark(var(--primitives-color-accent-750), var(--primitives-color-accent-650));
	}

	:host([icon-color="critical"]) {
		--_icon-color: var(--primitives-color-critical-500);
	}

	:host([icon-color="warning"]) {
		--_icon-color: light-dark(var(--primitives-color-warning-350), var(--primitives-color-warning-650));
	}

	:host([icon-color="success"]) {
		--_icon-color: var(--primitives-color-success-500);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Elements */

	.inline-dialog {
		box-sizing: border-box;
		display: flex;
		max-width: var(--primitives-area-480);
		flex-direction: column;
		flex-grow: 1;
		align-items: center;
	}

	.inline-dialog--left-aligned {
		align-items: stretch;
	}

	.inline-dialog__main {
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: center;
		gap: var(--primitives-space-2);
	}

	.inline-dialog--left-aligned .inline-dialog__main {
		align-items: stretch;
	}

	.inline-dialog__icon {
		display: flex;
		width: var(--_icon-size);
		height: var(--_icon-size);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		color: var(--_icon-color);
	}

	.inline-dialog__text {
		margin: 0;
		text-align: center;
		color: var(--semantics-content-color);
		font: var(--_text-font);
		text-wrap: pretty;
	}

	.inline-dialog__text:focus-visible {
		outline: none;
		box-shadow: none;
	}

	.inline-dialog__supporting-text {
		margin: 0;
		text-align: center;
		color: var(--semantics-content-color);
		font: var(--_supporting-text-font);
		text-wrap: pretty;
	}

	.inline-dialog--left-aligned .inline-dialog__text,
	.inline-dialog--left-aligned .inline-dialog__supporting-text {
		text-align: left;
	}

	.inline-dialog__content {
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: center;
		padding-top: var(--primitives-space-16);
	}

	.inline-dialog--left-aligned .inline-dialog__content {
		align-items: stretch;
	}

	.inline-dialog__content[hidden] {
		display: none;
	}

	.inline-dialog__footer {
		width: 100%;
		padding-top: var(--primitives-space-16);
	}

	.inline-dialog__footer[hidden] {
		display: none;
	}
`;
