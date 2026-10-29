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
		--_file-field-area-min-height: var(--primitives-area-160);
		--_file-field-area-padding: var(--primitives-space-16);
		--_file-field-area-gap: var(--primitives-space-2);
		--_file-field-area-icon-size: var(--primitives-space-40);
		--_file-field-area-actions-padding-top: var(--primitives-space-16);
		--_file-field-area-actions-max-width: var(--primitives-area-320);
		--_file-field-accepted-types-color: var(--semantics-content-secondary-color);
		--_file-field-accepted-types-font: var(--primitives-font-body-sm-regular-tight);

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
		--_file-field-area-icon-size: var(--primitives-space-32);
		--_file-field-accepted-types-font: var(--primitives-font-body-xs-regular-tight);
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

	.file-field:not([class*="is-drag-"]):has(> .file-field__browse-button:hover) {
		--_file-field-highlight-border-color: var(--_file-field-browse-is-hovered-highlight-border-color);
	}

	.file-field:not([class*="is-drag-"]):has(> .file-field__browse-button:active) {
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

	.file-field__browse-button,
	.file-field__replace-area {
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

	.file-field:not([class*="is-drag-"]) > .file-field__browse-button:hover {
		background-color: var(--_file-field-browse-is-hovered-background-color);
	}

	.file-field:not([class*="is-drag-"]) > .file-field__browse-button:active {
		background-color: var(--_file-field-browse-is-active-background-color);
	}

	.file-field__browse-button:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.file-field__browse-button:focus:not(:focus-visible) {
		outline: none;
	}

	:host([valid]) .file-field:not(.file-field--area) :is(.file-field__browse-button, .file-field__replace-area),
	:host([invalid]) .file-field:not(.file-field--area) :is(.file-field__browse-button, .file-field__replace-area) {
		padding-left: calc(var(--_file-field-validation-icon-size) + var(--_file-field-validation-icon-area-padding-right));
	}

	.file-field__sentence {
		padding-block: var(--primitives-space-8);
		white-space: normal;
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	.file-field__chosen-area {
		display: grid;
		min-width: 0;
		flex-grow: 1;
		align-self: stretch;
		grid-template-columns: minmax(0, 1fr);
	}

	.file-field__chosen-file {
		display: flex;
		min-width: 0;
		align-items: center;
	}

	.file-field__chosen-file,
	.file-field__replace-area {
		grid-area: 1 / 1;
	}

	.file-field__chosen-file:not(.is-active),
	.file-field__replace-area:not(.is-active) {
		visibility: hidden;
	}

	.file-field__texts {
		display: grid;
		min-width: 0;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
	}

	.file-field__text {
		grid-area: 1 / 1;
		min-width: 0;
	}

	.file-field__text:not(.is-active) {
		visibility: hidden;
	}

	.file-field__text--rejected {
		white-space: normal;
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	@media (hover: none) {
		:is(.file-field__text--drag, .file-field__text--drop, .file-field__text--rejected) {
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

	.file-field__value,
	.file-field__sentence {
		box-sizing: border-box;
		min-width: 0;
		padding-right: var(--_file-field-inline-padding);
		padding-left: var(--_file-field-inline-padding);
		flex-grow: 1;
		color: var(--_file-field-value-color);
		font: var(--_file-field-text-font);
	}

	.file-field__value {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	:is(.file-field__text--drag, .file-field__text--drop, .file-field__text--rejected) {
		font: var(--_file-field-browse-action-font);
	}

	.file-field__text--drop {
		color: var(--_file-field-browse-action-color);
	}

	.file-field__text--rejected {
		color: var(--_file-field-rejected-color);
	}

	.file-field__hint {
		color: var(--semantics-content-secondary-color);
	}

	.file-field__value {
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



	/* # Area */

	.file-field--area {
		min-height: var(--_file-field-area-min-height);
	}

	.file-field--area :is(.file-field__browse-button, .file-field__replace-area, .file-field__chosen-file) {
		padding: var(--_file-field-area-padding);
		flex-direction: column;
		gap: var(--_file-field-area-gap);
		align-items: center;
		justify-content: center;
	}

	.file-field--area :is(.file-field__upload-icon, .file-field__file-icon) {
		flex-shrink: 0;
		margin: 0;
		width: var(--_file-field-area-icon-size);
		height: var(--_file-field-area-icon-size);
	}

	.file-field--area .file-field__upload-icon {
		color: var(--_file-field-accepted-types-color);
	}

	.file-field--area.is-drag-over :is(.file-field__upload-icon, .file-field__accepted-types) {
		color: var(--_file-field-browse-action-color);
	}

	.file-field--area.is-drag-rejected :is(.file-field__upload-icon, .file-field__accepted-types) {
		color: var(--_file-field-rejected-color);
	}

	.file-field--area :is(.file-field__sentence, .file-field__value) {
		padding-block: 0;
		width: 100%;
		flex-grow: 0;
		text-align: center;
	}

	.file-field--area .file-field__name {
		justify-content: center;
	}

	.file-field--area .file-field__accepted-types {
		color: var(--_file-field-accepted-types-color);
		font: var(--_file-field-accepted-types-font);
	}

	.file-field--area .file-field__actions {
		width: 100%;
		max-width: var(--_file-field-area-actions-max-width);
		padding-top: calc(var(--_file-field-area-actions-padding-top) - var(--_file-field-area-gap));
		padding-right: var(--primitives-space-0);
	}

	.file-field--area .file-field__validation-icon-area {
		position: absolute;
		top: var(--_file-field-area-padding);
		right: var(--_file-field-area-padding);
		height: auto;
		padding-right: var(--primitives-space-0);
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
