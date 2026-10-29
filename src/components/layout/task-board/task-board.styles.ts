import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const taskBoardStyles = css`


	/* # Host */

	:host {
		--_task-board-gap: var(--primitives-space-12);
		--_task-board-fade-size: var(--primitives-space-32);
		--_task-board-fade-left: var(--primitives-space-0);
		--_task-board-fade-right: var(--primitives-space-0);
		--_task-board-height: auto;

		box-sizing: border-box;
		display: block;
		min-width: 0;
		height: var(--_task-board-height);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.task-board {
		display: flex;
		height: 100%;
		overflow-x: auto;
		gap: var(--_task-board-gap);
		align-items: stretch;
		scroll-snap-type: x proximity;
		scroll-padding-inline: var(--_task-board-gap);
		mask-image: linear-gradient(to right, transparent 0, black var(--_task-board-fade-left), black calc(100% - var(--_task-board-fade-right)), transparent 100%);
	}

	.task-board.can-scroll-left {
		--_task-board-fade-left: var(--_task-board-fade-size);
	}

	.task-board.can-scroll-right {
		--_task-board-fade-right: var(--_task-board-fade-size);
	}

	/* Snapping would pull the board back after every step it scrolls while an
	   item is dragged to its edge. */
	.task-board.is-dragging {
		scroll-snap-type: none;
	}

	.task-board:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
	}

	::slotted(nldd-task-board-column) {
		scroll-snap-align: start;
	}

	.task-board__announcer {
		position: absolute;
		width: 1px;
		height: 1px;
		clip-path: inset(50%);
		white-space: nowrap;
		overflow: hidden;
	}
`;

export const taskBoardColumnStyles = css`


	/* # Host */

	:host {
		--_task-board-column-width: var(--primitives-area-280);
		--_task-board-column-corner-radius: var(--semantics-surfaces-corner-radius);
		--_task-board-column-highlight-border-width: var(--semantics-surfaces-highlight-border-width);
		--_task-board-column-highlight-border-color: var(--semantics-surfaces-tinted-highlight-border-color);
		--_task-board-column-background-color: var(--semantics-surfaces-tinted-background-color);
		--_task-board-column-drop-border-width: var(--semantics-drop-targets-border-width);
		--_task-board-column-available-border-color: var(--semantics-drop-targets-is-available-border-color);
		--_task-board-column-over-border-color: var(--semantics-drop-targets-is-over-border-color);
		--_task-board-column-over-background-color: var(--semantics-drop-targets-is-over-background-color);
		--_task-board-column-header-padding: var(--primitives-space-12) var(--primitives-space-16) var(--primitives-space-4);
		--_task-board-column-header-gap: var(--primitives-space-8);
		--_task-board-column-title-font: var(--primitives-font-body-md-bold-tight);
		--_task-board-column-count-color: var(--semantics-content-secondary-color);
		--_task-board-column-count-font: var(--primitives-font-body-sm-regular-tight);
		--_task-board-column-main-gap: var(--primitives-space-8);
		--_task-board-column-main-padding: var(--primitives-space-8);
		--_task-board-column-main-min-height: var(--primitives-space-80);
		--_task-board-column-main-fade-size: var(--primitives-space-24);
		--_task-board-column-main-fade-top: var(--primitives-space-0);
		--_task-board-column-main-fade-bottom: var(--primitives-space-0);
		--_task-board-column-placeholder-background-color: var(--semantics-drop-targets-placeholder-background-color);
		--_task-board-column-placeholder-corner-radius: var(--semantics-surfaces-corner-radius);
		--_task-board-column-placeholder-border-width: var(--semantics-drop-targets-border-width);
		--_task-board-column-placeholder-border-color: var(--semantics-drop-indicators-color);
		--_task-board-column-placeholder-top: 0px;
		--_task-board-column-placeholder-left: 0px;
		--_task-board-column-placeholder-width: 0px;
		--_task-board-column-placeholder-height: 0px;
		--_task-board-column-indicator-top: 0px;
		--_task-board-column-indicator-inset: var(--primitives-space-8);
		--_task-board-column-indicator-thickness: var(--primitives-border-width-regular);
		--_task-board-column-indicator-color: var(--semantics-drop-indicators-color);

		${inheritedTextReset}
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		width: var(--_task-board-column-width);
		min-height: 0;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.task-board-column {
		box-sizing: border-box;
		display: flex;
		border-radius: var(--_task-board-column-corner-radius);
		box-shadow: inset 0 0 0 var(--_task-board-column-highlight-border-width) var(--_task-board-column-highlight-border-color);
		background-color: var(--_task-board-column-background-color);
		width: 100%;
		min-height: 0;
		max-height: 100%;
		flex-direction: column;
	}

	.task-board-column.is-drop-available {
		--_task-board-column-highlight-border-width: var(--_task-board-column-drop-border-width);
		--_task-board-column-highlight-border-color: var(--_task-board-column-available-border-color);
	}

	.task-board-column.is-drop-over {
		--_task-board-column-highlight-border-width: var(--_task-board-column-drop-border-width);
		--_task-board-column-highlight-border-color: var(--_task-board-column-over-border-color);
		--_task-board-column-background-color: var(--_task-board-column-over-background-color);
	}


	/* # Elements */

	.task-board-column__header {
		display: flex;
		flex-shrink: 0;
		padding: var(--_task-board-column-header-padding);
		gap: var(--_task-board-column-header-gap);
		align-items: center;
	}

	.task-board-column__title {
		min-width: 0;
		flex-grow: 1;
		color: var(--semantics-content-color);
		font: var(--_task-board-column-title-font);
	}

	.task-board-column__count {
		flex-shrink: 0;
		color: var(--_task-board-column-count-color);
		font: var(--_task-board-column-count-font);
	}

	.task-board-column__main {
		box-sizing: border-box;
		display: flex;
		position: relative;
		min-height: var(--_task-board-column-main-min-height);
		overflow-y: auto;
		padding: var(--_task-board-column-main-padding);
		flex-direction: column;
		flex-grow: 1;
		gap: var(--_task-board-column-main-gap);
		mask-image: linear-gradient(to bottom, transparent 0, black var(--_task-board-column-main-fade-top), black calc(100% - var(--_task-board-column-main-fade-bottom)), transparent 100%);
	}

	.task-board-column__main.can-scroll-up {
		--_task-board-column-main-fade-top: var(--_task-board-column-main-fade-size);
	}

	.task-board-column__main.can-scroll-down {
		--_task-board-column-main-fade-bottom: var(--_task-board-column-main-fade-size);
	}

	.task-board-column__footer {
		flex-shrink: 0;
	}

	.task-board-column__footer[hidden] {
		display: none;
	}

	::slotted(*) {
		flex-shrink: 0;
		-webkit-touch-callout: none;
	}

	/* The item keeps its place while it is dragged, as an empty slot. */
	::slotted([data-task-board-dragging]) {
		visibility: hidden;
	}

	.task-board-column__placeholder {
		position: absolute;
		top: var(--_task-board-column-placeholder-top);
		left: var(--_task-board-column-placeholder-left);
		border-radius: var(--_task-board-column-placeholder-corner-radius);
		background-color: var(--_task-board-column-placeholder-background-color);
		pointer-events: none;
		width: var(--_task-board-column-placeholder-width);
		height: var(--_task-board-column-placeholder-height);
	}

	.task-board-column__placeholder.is-returning {
		box-shadow: inset 0 0 0 var(--_task-board-column-placeholder-border-width) var(--_task-board-column-placeholder-border-color);
	}

	.task-board-column__placeholder[hidden] {
		display: none;
	}

	.task-board-column__drop-indicator {
		position: absolute;
		top: var(--_task-board-column-indicator-top);
		right: var(--_task-board-column-indicator-inset);
		left: var(--_task-board-column-indicator-inset);
		border-radius: var(--_task-board-column-indicator-thickness);
		background-color: var(--_task-board-column-indicator-color);
		pointer-events: none;
		height: var(--_task-board-column-indicator-thickness);
		transform: translateY(-50%);
	}

	.task-board-column__drop-indicator[hidden] {
		display: none;
	}


	/* # High contrast */

	@media (forced-colors: active) {
		.task-board-column {
			border: var(--_task-board-column-highlight-border-width) solid CanvasText;
		}

		.task-board-column__drop-indicator {
			background-color: Highlight;
		}
	}
`;
