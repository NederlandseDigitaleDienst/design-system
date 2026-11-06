import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const columnBoardStyles = css`


	/* # Host */

	:host {
		--_column-board-gap: var(--primitives-space-12);
		--_column-board-fade-size: var(--primitives-space-32);
		--_column-board-fade-left: var(--primitives-space-0);
		--_column-board-fade-right: var(--primitives-space-0);
		--_column-board-height: auto;

		box-sizing: border-box;
		display: block;
		min-width: 0;
		height: var(--_column-board-height);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.column-board {
		display: flex;
		height: 100%;
		overflow-x: auto;
		gap: var(--_column-board-gap);
		align-items: stretch;
		scroll-snap-type: x proximity;
		scroll-padding-inline: var(--_column-board-gap);
		mask-image: linear-gradient(to right, transparent 0, black var(--_column-board-fade-left), black calc(100% - var(--_column-board-fade-right)), transparent 100%);
	}

	.column-board.can-scroll-left {
		--_column-board-fade-left: var(--_column-board-fade-size);
	}

	.column-board.can-scroll-right {
		--_column-board-fade-right: var(--_column-board-fade-size);
	}

	/* Snapping would pull the board back after every step it scrolls while an
	   item is dragged to its edge. */
	.column-board.is-dragging {
		scroll-snap-type: none;
	}

	.column-board:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
	}

	::slotted(nldd-column-board-column) {
		scroll-snap-align: start;
	}

	.column-board__announcer {
		position: absolute;
		width: 1px;
		height: 1px;
		clip-path: inset(50%);
		white-space: nowrap;
		overflow: hidden;
	}
`;

export const columnBoardColumnStyles = css`


	/* # Host */

	:host {
		--_column-board-column-width: var(--primitives-area-280);
		--_column-board-column-corner-radius: var(--semantics-surfaces-corner-radius);
		--_column-board-column-highlight-border-width: var(--semantics-surfaces-highlight-border-width);
		--_column-board-column-highlight-border-color: var(--semantics-surfaces-tinted-highlight-border-color);
		--_column-board-column-background-color: var(--semantics-surfaces-tinted-background-color);
		--_column-board-column-drop-border-width: var(--semantics-drop-targets-border-width);
		--_column-board-column-available-border-color: var(--semantics-drop-targets-is-available-border-color);
		--_column-board-column-over-border-color: var(--semantics-drop-targets-is-over-border-color);
		--_column-board-column-over-background-color: var(--semantics-drop-targets-is-over-background-color);
		--_column-board-column-header-padding: var(--primitives-space-12) var(--primitives-space-16) var(--primitives-space-4);
		--_column-board-column-header-gap: var(--primitives-space-8);
		--_column-board-column-title-font: var(--primitives-font-body-md-bold-tight);
		--_column-board-column-count-color: var(--semantics-content-secondary-color);
		--_column-board-column-count-font: var(--primitives-font-body-sm-regular-tight);
		--_column-board-column-main-gap: var(--primitives-space-8);
		--_column-board-column-main-padding: var(--primitives-space-8);
		--_column-board-column-main-min-height: var(--primitives-space-80);
		--_column-board-column-main-fade-size: var(--primitives-space-24);
		--_column-board-column-main-fade-top: var(--primitives-space-0);
		--_column-board-column-main-fade-bottom: var(--primitives-space-0);
		--_column-board-column-placeholder-background-color: var(--semantics-drop-targets-placeholder-background-color);
		--_column-board-column-placeholder-corner-radius: var(--semantics-surfaces-corner-radius);
		--_column-board-column-placeholder-border-width: var(--semantics-drop-targets-border-width);
		--_column-board-column-placeholder-border-color: var(--semantics-drop-indicators-color);
		--_column-board-column-placeholder-top: 0px;
		--_column-board-column-placeholder-left: 0px;
		--_column-board-column-placeholder-width: 0px;
		--_column-board-column-placeholder-height: 0px;
		--_column-board-column-indicator-top: 0px;
		--_column-board-column-indicator-inset: var(--primitives-space-8);
		--_column-board-column-indicator-thickness: var(--primitives-border-width-regular);
		--_column-board-column-indicator-color: var(--semantics-drop-indicators-color);

		${inheritedTextReset}
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		width: var(--_column-board-column-width);
		min-height: 0;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.column-board-column {
		box-sizing: border-box;
		display: flex;
		border-radius: var(--_column-board-column-corner-radius);
		box-shadow: inset 0 0 0 var(--_column-board-column-highlight-border-width) var(--_column-board-column-highlight-border-color);
		background-color: var(--_column-board-column-background-color);
		width: 100%;
		min-height: 0;
		max-height: 100%;
		flex-direction: column;
	}

	.column-board-column.is-drop-available {
		--_column-board-column-highlight-border-width: var(--_column-board-column-drop-border-width);
		--_column-board-column-highlight-border-color: var(--_column-board-column-available-border-color);
	}

	.column-board-column.is-drop-over {
		--_column-board-column-highlight-border-width: var(--_column-board-column-drop-border-width);
		--_column-board-column-highlight-border-color: var(--_column-board-column-over-border-color);
		--_column-board-column-background-color: var(--_column-board-column-over-background-color);
	}


	/* # Elements */

	.column-board-column__header {
		display: flex;
		flex-shrink: 0;
		padding: var(--_column-board-column-header-padding);
		gap: var(--_column-board-column-header-gap);
		align-items: center;
	}

	.column-board-column__title {
		min-width: 0;
		flex-grow: 1;
		color: var(--semantics-content-color);
		font: var(--_column-board-column-title-font);
		text-wrap: balance;
	}

	.column-board-column__count {
		flex-shrink: 0;
		color: var(--_column-board-column-count-color);
		font: var(--_column-board-column-count-font);
	}

	.column-board-column__main {
		box-sizing: border-box;
		display: flex;
		position: relative;
		min-height: var(--_column-board-column-main-min-height);
		overflow-y: auto;
		padding: var(--_column-board-column-main-padding);
		flex-direction: column;
		flex-grow: 1;
		gap: var(--_column-board-column-main-gap);
		mask-image: linear-gradient(to bottom, transparent 0, black var(--_column-board-column-main-fade-top), black calc(100% - var(--_column-board-column-main-fade-bottom)), transparent 100%);
	}

	.column-board-column__main.can-scroll-up {
		--_column-board-column-main-fade-top: var(--_column-board-column-main-fade-size);
	}

	.column-board-column__main.can-scroll-down {
		--_column-board-column-main-fade-bottom: var(--_column-board-column-main-fade-size);
	}

	.column-board-column__footer {
		flex-shrink: 0;
	}

	.column-board-column__footer[hidden] {
		display: none;
	}

	::slotted(*) {
		flex-shrink: 0;
		-webkit-touch-callout: none;
	}

	/* The item keeps its place while it is dragged, as an empty slot. */
	::slotted([data-column-board-dragging]) {
		visibility: hidden;
	}

	.column-board-column__placeholder {
		position: absolute;
		top: var(--_column-board-column-placeholder-top);
		left: var(--_column-board-column-placeholder-left);
		border-radius: var(--_column-board-column-placeholder-corner-radius);
		background-color: var(--_column-board-column-placeholder-background-color);
		pointer-events: none;
		width: var(--_column-board-column-placeholder-width);
		height: var(--_column-board-column-placeholder-height);
	}

	.column-board-column__placeholder.is-returning {
		box-shadow: inset 0 0 0 var(--_column-board-column-placeholder-border-width) var(--_column-board-column-placeholder-border-color);
	}

	.column-board-column__placeholder[hidden] {
		display: none;
	}

	.column-board-column__drop-indicator {
		position: absolute;
		top: var(--_column-board-column-indicator-top);
		right: var(--_column-board-column-indicator-inset);
		left: var(--_column-board-column-indicator-inset);
		border-radius: var(--_column-board-column-indicator-thickness);
		background-color: var(--_column-board-column-indicator-color);
		pointer-events: none;
		height: var(--_column-board-column-indicator-thickness);
		transform: translateY(-50%);
	}

	.column-board-column__drop-indicator[hidden] {
		display: none;
	}


	/* # High contrast */

	@media (forced-colors: active) {
		.column-board-column {
			border: var(--_column-board-column-highlight-border-width) solid CanvasText;
		}

		.column-board-column__drop-indicator {
			background-color: Highlight;
		}
	}
`;
