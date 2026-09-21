import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const segmentedControlStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_corner-radius: var(--semantics-controls-md-corner-radius);
		--_width: auto;
		--_gap: var(--primitives-space-1);
		--_selected-z-index: 1;
		--_focus-z-index: 2;

		${inheritedTextReset}
		display: inline-grid;
		position: relative;
		border-radius: var(--_corner-radius);
		background-color: var(--semantics-buttons-neutral-tinted-background-color);
		width: var(--_width);
		max-width: 100%;
		grid-auto-columns: 1fr;
		grid-auto-flow: column;
		gap: var(--_gap);
		isolation: isolate;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--semantics-buttons-neutral-tinted-highlight-border-color);
		pointer-events: none;
	}

	:host([size="sm"]) {
		--_corner-radius: var(--semantics-controls-sm-corner-radius);
	}

	:host([size="lg"]) {
		--_corner-radius: var(--semantics-controls-lg-corner-radius);
	}

	:host([width="full"]) {
		--_width: 100%;

		display: grid;
	}

	:host([width="fit-content"]) {
		grid-auto-columns: auto;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Elements */


	::slotted(nldd-segmented-control-item[selected]) {
		position: relative;
		z-index: var(--_selected-z-index);
	}

	::slotted(nldd-segmented-control-item:focus-within) {
		position: relative;
		z-index: var(--_focus-z-index);
	}
`;

export const segmentedControlItemStyles = css`


	/* # Host */

	:host {
		--_corner-radius: var(--semantics-controls-md-corner-radius);
		--_min-size: var(--semantics-controls-md-min-size);
		--_block-padding: var(--semantics-controls-md-block-padding);
		--_inline-padding: var(--semantics-buttons-md-inline-padding);
		--_gap: var(--semantics-buttons-md-gap);
		--_font: var(--semantics-buttons-md-primary-text-font);
		--_icon-size: var(--semantics-buttons-md-icon-size);
		--_highlight-border-color: transparent;

		${inheritedTextReset}
		display: flex;
		position: relative;
		min-width: 0;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="sm"]) {
		--_corner-radius: var(--semantics-controls-sm-corner-radius);
		--_min-size: var(--semantics-controls-sm-min-size);
		--_block-padding: var(--semantics-controls-sm-block-padding);
		--_inline-padding: var(--semantics-buttons-sm-inline-padding);
		--_gap: var(--semantics-buttons-sm-gap);
		--_font: var(--semantics-buttons-sm-primary-text-font);
		--_icon-size: var(--semantics-buttons-sm-icon-size);
	}

	:host([size="lg"]) {
		--_corner-radius: var(--semantics-controls-lg-corner-radius);
		--_min-size: var(--semantics-controls-lg-min-size);
		--_block-padding: var(--semantics-controls-lg-block-padding);
		--_inline-padding: var(--semantics-buttons-lg-inline-padding);
		--_gap: var(--semantics-buttons-lg-gap);
		--_font: var(--semantics-buttons-lg-primary-text-font);
		--_icon-size: var(--semantics-buttons-lg-icon-size);
	}

	:host([variant="icon"]) {
		--_block-padding: var(--semantics-buttons-md-is-icon-only-inline-padding);
		--_inline-padding: var(--semantics-buttons-md-is-icon-only-inline-padding);
		--_icon-size: var(--semantics-buttons-md-is-icon-only-icon-size);
	}

	:host([variant="icon"][size="sm"]) {
		--_block-padding: var(--semantics-buttons-sm-is-icon-only-inline-padding);
		--_inline-padding: var(--semantics-buttons-sm-is-icon-only-inline-padding);
		--_icon-size: var(--semantics-buttons-sm-is-icon-only-icon-size);
	}

	:host([variant="icon"][size="lg"]) {
		--_block-padding: var(--semantics-buttons-lg-is-icon-only-inline-padding);
		--_inline-padding: var(--semantics-buttons-lg-is-icon-only-inline-padding);
		--_icon-size: var(--semantics-buttons-lg-is-icon-only-icon-size);
	}

	:host([variant="icon-and-text"][size="lg"]) {
		--_block-padding: var(--primitives-space-8);
		--_inline-padding: var(--primitives-space-8);
		--_gap: var(--primitives-space-2);
		--_font: var(--primitives-font-body-xxs-medium-flat);
		--_icon-size: var(--semantics-buttons-md-is-icon-only-icon-size);
	}


	/* # Block */

	.segmented-control__item {
		box-sizing: border-box;
		display: flex;
		position: relative;
		cursor: default;
		border-radius: var(--_corner-radius);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
		background: none;
		width: 100%;
		min-width: var(--_min-size);
		height: var(--_min-size);
		padding-block: var(--_block-padding);
		padding-inline: var(--_inline-padding);
		gap: var(--_gap);
		align-items: center;
		justify-content: center;
		color: var(--semantics-buttons-neutral-tinted-content-color);
		font: var(--_font);
	}

	:host([size="lg"][variant="icon-and-text"]) .segmented-control__item {
		flex-direction: column;
	}

	@media (hover: hover) {
		:host(:not([selected])) .segmented-control__item:hover {
			background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
			color: var(--semantics-buttons-neutral-tinted-is-hovered-content-color);
		}
	}

	:host(:not([selected])) .segmented-control__item:active {
		background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-active-content-color);
	}

	:host([selected]) .segmented-control__item {
		--_highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-highlight-border-color);

		background-color: var(--semantics-buttons-neutral-tinted-is-selected-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-selected-content-color);
	}

	@media (hover: hover) {
		:host([selected]) .segmented-control__item:hover {
			--_highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-highlight-border-color);

			background-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-background-color);
			color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-content-color);
		}
	}

	:host([selected]) .segmented-control__item:active {
		--_highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-highlight-border-color);

		background-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-content-color);
	}

	@media (forced-colors: active) {
		:host([selected]) .segmented-control__item {
			background-color: Highlight;
		}
	}

	:host([disabled]) .segmented-control__item {
		opacity: var(--primitives-opacity-disabled);
	}

	:host(:focus-visible) {
		outline: none;
	}

	:host(:focus-visible) .segmented-control__item,
	.segmented-control__item:has(:focus-visible) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	:host([selected]:focus-visible) .segmented-control__item,
	:host([selected]) .segmented-control__item:has(:focus-visible) {
		box-shadow: var(--semantics-focus-ring-box-shadow), inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
	}


	/* # Elements */

	.segmented-control__item-input {
		position: absolute;
		inset: 0;
		opacity: 0;
		z-index: 1;
		margin: 0;
		width: 100%;
		height: 100%;
	}

	.segmented-control__item-text {
		pointer-events: none;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	:host([variant="icon"]) .segmented-control__item-text {
		display: none;
	}

	.segmented-control__item-icon {
		display: none;
		width: var(--_icon-size);
		height: var(--_icon-size);
		pointer-events: none;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	:host([variant="icon-and-text"]) .segmented-control__item-icon {
		display: flex;
	}

	:host([variant="icon"]) .segmented-control__item-icon {
		display: flex;
	}

	::slotted(nldd-icon) {
		display: block;
		width: 100%;
		height: 100%;
	}
`;
