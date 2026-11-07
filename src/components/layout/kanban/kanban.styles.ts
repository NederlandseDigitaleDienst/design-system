import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const kanbanStyles = css`


	/* # Host */

	:host {
		--_kanban-gap: var(--primitives-space-12);
		--_kanban-fade-size: var(--primitives-space-32);
		--_kanban-fade-left: var(--primitives-space-0);
		--_kanban-fade-right: var(--primitives-space-0);
		--_kanban-height: auto;

		box-sizing: border-box;
		display: block;
		min-width: 0;
		height: var(--_kanban-height);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.kanban {
		display: flex;
		height: 100%;
		overflow-x: auto;
		gap: var(--_kanban-gap);
		align-items: stretch;
		scroll-snap-type: x proximity;
		scroll-padding-inline: var(--_kanban-gap);
		mask-image: linear-gradient(to right, transparent 0, black var(--_kanban-fade-left), black calc(100% - var(--_kanban-fade-right)), transparent 100%);
	}

	.kanban.can-scroll-left {
		--_kanban-fade-left: var(--_kanban-fade-size);
	}

	.kanban.can-scroll-right {
		--_kanban-fade-right: var(--_kanban-fade-size);
	}

	/* Snapping would pull the board back after every step it scrolls while an
	   item is dragged to its edge. */
	.kanban.is-dragging {
		scroll-snap-type: none;
	}

	.kanban:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
	}

	::slotted(nldd-kanban-column) {
		scroll-snap-align: start;
	}

	.kanban__announcer {
		position: absolute;
		width: 1px;
		height: 1px;
		clip-path: inset(50%);
		white-space: nowrap;
		overflow: hidden;
	}
`;

export const kanbanColumnStyles = css`


	/* # Host */

	:host {
		--_kanban-column-width: var(--primitives-area-280);
		--_kanban-column-corner-radius: var(--semantics-surfaces-corner-radius);
		--_kanban-column-highlight-border-width: var(--semantics-surfaces-highlight-border-width);
		--_kanban-column-highlight-border-color: var(--semantics-surfaces-tinted-highlight-border-color);
		--_kanban-column-background-color: var(--semantics-surfaces-tinted-background-color);
		--_kanban-column-drop-border-width: var(--semantics-drop-targets-border-width);
		--_kanban-column-available-border-color: var(--semantics-drop-targets-is-available-border-color);
		--_kanban-column-over-border-color: var(--semantics-drop-targets-is-over-border-color);
		--_kanban-column-over-background-color: var(--semantics-drop-targets-is-over-background-color);
		--_kanban-column-header-padding: var(--primitives-space-12) var(--primitives-space-16) var(--primitives-space-4);
		--_kanban-column-header-gap: var(--primitives-space-8);
		--_kanban-column-title-font: var(--primitives-font-body-md-bold-tight);
		--_kanban-column-count-color: var(--semantics-content-secondary-color);
		--_kanban-column-count-font: var(--primitives-font-body-sm-regular-tight);
		--_kanban-column-main-gap: var(--primitives-space-8);
		--_kanban-column-main-padding: var(--primitives-space-8);
		--_kanban-column-main-min-height: var(--primitives-space-80);
		--_kanban-column-main-fade-size: var(--primitives-space-24);
		--_kanban-column-main-fade-top: var(--primitives-space-0);
		--_kanban-column-main-fade-bottom: var(--primitives-space-0);
		--_kanban-column-placeholder-background-color: var(--semantics-drop-targets-placeholder-background-color);
		--_kanban-column-placeholder-corner-radius: var(--semantics-surfaces-corner-radius);
		--_kanban-column-placeholder-border-width: var(--semantics-drop-targets-border-width);
		--_kanban-column-placeholder-border-color: var(--semantics-drop-indicators-color);
		--_kanban-column-placeholder-top: 0px;
		--_kanban-column-placeholder-left: 0px;
		--_kanban-column-placeholder-width: 0px;
		--_kanban-column-placeholder-height: 0px;
		--_kanban-column-indicator-top: 0px;
		--_kanban-column-indicator-inset: var(--primitives-space-8);
		--_kanban-column-indicator-thickness: var(--primitives-border-width-regular);
		--_kanban-column-indicator-color: var(--semantics-drop-indicators-color);

		${inheritedTextReset}
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		width: var(--_kanban-column-width);
		min-height: 0;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.kanban-column {
		box-sizing: border-box;
		display: flex;
		border-radius: var(--_kanban-column-corner-radius);
		box-shadow: inset 0 0 0 var(--_kanban-column-highlight-border-width) var(--_kanban-column-highlight-border-color);
		background-color: var(--_kanban-column-background-color);
		width: 100%;
		min-height: 0;
		max-height: 100%;
		flex-direction: column;
	}

	.kanban-column.is-drop-available {
		--_kanban-column-highlight-border-width: var(--_kanban-column-drop-border-width);
		--_kanban-column-highlight-border-color: var(--_kanban-column-available-border-color);
	}

	.kanban-column.is-drop-over {
		--_kanban-column-highlight-border-width: var(--_kanban-column-drop-border-width);
		--_kanban-column-highlight-border-color: var(--_kanban-column-over-border-color);
		--_kanban-column-background-color: var(--_kanban-column-over-background-color);
	}


	/* # Elements */

	.kanban-column__header {
		display: flex;
		flex-shrink: 0;
		padding: var(--_kanban-column-header-padding);
		gap: var(--_kanban-column-header-gap);
		align-items: center;
	}

	.kanban-column__title {
		min-width: 0;
		flex-grow: 1;
		color: var(--semantics-content-color);
		font: var(--_kanban-column-title-font);
		text-wrap: balance;
	}

	.kanban-column__count {
		flex-shrink: 0;
		color: var(--_kanban-column-count-color);
		font: var(--_kanban-column-count-font);
	}

	.kanban-column__main {
		box-sizing: border-box;
		display: flex;
		position: relative;
		min-height: var(--_kanban-column-main-min-height);
		overflow-y: auto;
		padding: var(--_kanban-column-main-padding);
		flex-direction: column;
		flex-grow: 1;
		gap: var(--_kanban-column-main-gap);
		mask-image: linear-gradient(to bottom, transparent 0, black var(--_kanban-column-main-fade-top), black calc(100% - var(--_kanban-column-main-fade-bottom)), transparent 100%);
	}

	.kanban-column__main.can-scroll-up {
		--_kanban-column-main-fade-top: var(--_kanban-column-main-fade-size);
	}

	.kanban-column__main.can-scroll-down {
		--_kanban-column-main-fade-bottom: var(--_kanban-column-main-fade-size);
	}

	.kanban-column__footer {
		flex-shrink: 0;
	}

	.kanban-column__footer[hidden] {
		display: none;
	}

	::slotted(*) {
		flex-shrink: 0;
		-webkit-touch-callout: none;
	}

	/* The item keeps its place while it is dragged, as an empty slot. */
	::slotted([data-kanban-dragging]) {
		visibility: hidden;
	}

	.kanban-column__placeholder {
		position: absolute;
		top: var(--_kanban-column-placeholder-top);
		left: var(--_kanban-column-placeholder-left);
		border-radius: var(--_kanban-column-placeholder-corner-radius);
		background-color: var(--_kanban-column-placeholder-background-color);
		pointer-events: none;
		width: var(--_kanban-column-placeholder-width);
		height: var(--_kanban-column-placeholder-height);
	}

	.kanban-column__placeholder.is-returning {
		box-shadow: inset 0 0 0 var(--_kanban-column-placeholder-border-width) var(--_kanban-column-placeholder-border-color);
	}

	.kanban-column__placeholder[hidden] {
		display: none;
	}

	.kanban-column__drop-indicator {
		position: absolute;
		top: var(--_kanban-column-indicator-top);
		right: var(--_kanban-column-indicator-inset);
		left: var(--_kanban-column-indicator-inset);
		border-radius: var(--_kanban-column-indicator-thickness);
		background-color: var(--_kanban-column-indicator-color);
		pointer-events: none;
		height: var(--_kanban-column-indicator-thickness);
		transform: translateY(-50%);
	}

	.kanban-column__drop-indicator[hidden] {
		display: none;
	}


	/* # High contrast */

	@media (forced-colors: active) {
		.kanban-column {
			border: var(--_kanban-column-highlight-border-width) solid CanvasText;
		}

		.kanban-column__drop-indicator {
			background-color: Highlight;
		}
	}
`;
