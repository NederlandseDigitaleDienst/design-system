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
		--_file-field-highlight-border-width: var(--semantics-surfaces-highlight-border-width);
		--_file-field-highlight-border-color: var(--semantics-surfaces-tinted-highlight-border-color);
		--_file-field-background-color: var(--semantics-surfaces-tinted-background-color);
		--_file-field-drop-border-width: var(--semantics-surfaces-ring-thickness);
		--_file-field-page-drag-border-color: light-dark(var(--primitives-color-neutral-200), var(--primitives-color-neutral-350));
		--_file-field-drop-border-color: var(--semantics-controls-is-selected-indicator-color);
		--_file-field-drop-background-color: var(--semantics-surfaces-accent-tinted-background-color);
		--_file-field-rejected-color: var(--semantics-content-critical-color);
		--_file-field-rejected-background-color: var(--semantics-surfaces-critical-tinted-background-color);
		--_file-field-file-icon-size: var(--primitives-space-24);
		--_file-field-actions-gap: var(--primitives-space-4);
		--_file-field-browse-action-color: var(--semantics-controls-is-selected-indicator-color);
		--_file-field-browse-is-hovered-highlight-border-color: light-dark(var(--primitives-color-neutral-100), var(--primitives-color-neutral-250));
		--_file-field-browse-is-active-highlight-border-color: light-dark(var(--primitives-color-neutral-150), var(--primitives-color-neutral-300));
		--_file-field-browse-is-hovered-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-100));
		--_file-field-browse-is-active-background-color: light-dark(var(--primitives-color-neutral-75), var(--primitives-color-neutral-150));
		--_file-field-browse-action-font: var(--semantics-buttons-md-primary-text-font);

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
		--_file-field-file-icon-size: var(--primitives-space-20);
		--_file-field-browse-action-font: var(--semantics-buttons-sm-primary-text-font);
	}


	/* # Block */

	.file-field {
		box-sizing: border-box;
		display: flex;
		position: relative;
		border-radius: var(--_file-field-corner-radius);
		background-color: var(--_file-field-background-color);
		width: 100%;
		min-width: 0;
		min-height: var(--_file-field-min-size);
		align-items: center;
	}


	.file-field::before {
		box-sizing: border-box;
		position: absolute;
		inset: 0;
		border: var(--_file-field-highlight-border-width) solid var(--_file-field-highlight-border-color);
		border-radius: inherit;
		content: "";
		pointer-events: none;
	}

	.file-field:not([class*="is-drag-"]):has(> .file-field__browse:hover) {
		--_file-field-highlight-border-color: var(--_file-field-browse-is-hovered-highlight-border-color);
	}

	.file-field:not([class*="is-drag-"]):has(> .file-field__browse:active) {
		--_file-field-highlight-border-color: var(--_file-field-browse-is-active-highlight-border-color);
	}

	.file-field.is-drag-page {
		--_file-field-highlight-border-width: var(--_file-field-drop-border-width);
		--_file-field-highlight-border-color: var(--_file-field-page-drag-border-color);
	}

	.file-field.is-drag-over {
		--_file-field-highlight-border-width: var(--_file-field-drop-border-width);
		--_file-field-highlight-border-color: var(--_file-field-drop-border-color);
		--_file-field-background-color: var(--_file-field-drop-background-color);
	}


	.file-field.is-drag-rejected {
		--_file-field-highlight-border-width: var(--_file-field-drop-border-width);
		--_file-field-highlight-border-color: var(--_file-field-rejected-color);
		--_file-field-background-color: var(--_file-field-rejected-background-color);
	}


	/* # Elements */

	.file-field__input {
		display: none;
	}

	.file-field__browse,
	.file-field__replace {
		box-sizing: border-box;
		display: flex;
		margin: 0;
		border: none;
		border-radius: inherit;
		padding: 0;
		background: none;
		min-width: 0;
		min-height: var(--_file-field-min-size);
		flex-grow: 1;
		align-self: stretch;
		align-items: center;
		justify-content: center;
		color: inherit;
		font: inherit;
		text-align: center;
	}

	.file-field:not([class*="is-drag-"]) > .file-field__browse:hover {
		background-color: var(--_file-field-browse-is-hovered-background-color);
	}

	.file-field:not([class*="is-drag-"]) > .file-field__browse:active {
		background-color: var(--_file-field-browse-is-active-background-color);
	}

	.file-field__browse:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.file-field__browse:focus:not(:focus-visible) {
		outline: none;
	}

	:host([valid]) :is(.file-field__browse, .file-field__replace),
	:host([invalid]) :is(.file-field__browse, .file-field__replace) {
		padding-left: calc(var(--_file-field-validation-icon-size) + var(--_file-field-validation-icon-area-padding-right));
	}

	.file-field__value.is-sentence {
		padding-block: var(--primitives-space-8);
		white-space: normal;
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	.file-field__layers {
		display: grid;
		min-width: 0;
		flex-grow: 1;
		align-self: stretch;
		grid-template-columns: minmax(0, 1fr);
	}

	.file-field__row {
		display: flex;
		min-width: 0;
		align-items: center;
	}

	.file-field__row,
	.file-field__replace {
		grid-area: 1 / 1;
	}

	.file-field__row:not(.is-active),
	.file-field__replace:not(.is-active) {
		visibility: hidden;
	}

	.file-field__stack {
		display: grid;
		min-width: 0;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
	}

	.file-field__stack-item {
		grid-area: 1 / 1;
		min-width: 0;
	}

	.file-field__stack-item:not(.is-active) {
		visibility: hidden;
	}

	.file-field__stack-item.is-rejected {
		white-space: normal;
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	@media (hover: none) {
		.file-field__stack-item:is(.is-drag, .is-drop, .is-rejected) {
			display: none;
		}
	}

	.file-field__browse-action {
		color: var(--_file-field-browse-action-color);
		font: var(--_file-field-browse-action-font);
	}

	.file-field__file-icon {
		flex-shrink: 0;
		margin-left: var(--_file-field-inline-padding);
		width: var(--_file-field-file-icon-size);
		height: var(--_file-field-file-icon-size);
		color: var(--semantics-content-color);
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

	.file-field__stack-item:is(.is-drag, .is-drop, .is-rejected) {
		font: var(--_file-field-browse-action-font);
	}

	.file-field__stack-item.is-drop {
		color: var(--_file-field-browse-action-color);
	}

	.file-field__stack-item.is-rejected {
		color: var(--_file-field-rejected-color);
	}

	.file-field__hint {
		color: var(--semantics-content-secondary-color);
	}

	.file-field__value.has-file {
		padding-left: var(--primitives-space-8);
	}

	@media (hover: none) {
		.file-field__hint {
			display: none;
		}
	}

	.file-field__name {
		display: flex;
		min-width: 0;
		overflow: hidden;
	}

	.file-field__full-name {
		position: absolute;
		width: 1px;
		height: 1px;
		clip-path: inset(50%);
		white-space: nowrap;
		overflow: hidden;
	}

	.file-field__name-start {
		min-width: 0;
		white-space: pre;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.file-field__name-end {
		flex-shrink: 0;
		white-space: pre;
	}

	.file-field__actions {
		display: flex;
		position: relative;
		flex-shrink: 0;
		gap: var(--_file-field-actions-gap);
		padding-right: var(--_file-field-clear-button-padding-right);
		align-items: center;
	}

	.file-field__actions:not(:last-child) {
		padding-right: var(--primitives-space-0);
	}

	.file-field__status {
		position: absolute;
		width: 1px;
		height: 1px;
		clip-path: inset(50%);
		white-space: nowrap;
		overflow: hidden;
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
		.file-field::before {
			border-color: CanvasText;
		}

		.file-field.is-drag-over::before {
			border-color: Highlight;
		}

		.file-field.is-drag-rejected::before {
			border-style: dashed;
		}
	}
`;
