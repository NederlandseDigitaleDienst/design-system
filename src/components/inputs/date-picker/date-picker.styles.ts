import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const datePickerStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_date-picker-header-margin-bottom: var(--primitives-space-16);
		--_date-picker-footer-margin-top: var(--primitives-space-8);
		--_date-picker-title-font: var(--primitives-font-display-5-sm);
		--_date-picker-title-button-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_date-picker-title-button-min-size: var(--semantics-controls-sm-min-size);
		--_date-picker-title-picker-icon-size: var(--primitives-space-20);
		--_date-picker-weekday-header-font: var(--primitives-font-body-xs-regular-flat);
		--_date-picker-weekday-header-content-color: var(--semantics-content-secondary-color);
		--_date-picker-divider-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-150));
		--_date-picker-divider-thickness: var(--semantics-dividers-thickness);
		--_date-picker-week-number-column-width: var(--primitives-space-32);
		--_date-picker-week-number-font: var(--primitives-font-body-xs-regular-flat);
		--_date-picker-week-number-content-color: var(--semantics-content-secondary-color);
		/* Set from JS by the width attribute; initial keeps it guaranteed-invalid
		   so every var(--_date-picker-width, ...) below falls back to its own default. */
		--_date-picker-width: initial;
		--_date-picker-day-size: var(--semantics-controls-md-min-size);
		--_date-picker-day-corner-radius: var(--semantics-controls-md-corner-radius);
		--_date-picker-day-font: var(--primitives-font-body-sm-medium-flat);
		--_date-picker-day-indicator-inset: var(--primitives-space-2);
		--_date-picker-day-indicator-size: calc(var(--_date-picker-day-size) - var(--_date-picker-day-indicator-inset) * 2);
		--_date-picker-day-indicator-corner-radius: var(--_date-picker-day-corner-radius);
		--_date-picker-day-is-in-range-background-color: var(--semantics-categories-accent-tinted-background-color);
		--_date-picker-day-is-in-range-content-color: var(--semantics-content-color);
		--_date-picker-day-is-today-border-color: light-dark(var(--primitives-color-neutral-250), var(--primitives-color-neutral-400));
		--_date-picker-day-is-hovered-background-color: light-dark(var(--primitives-color-neutral-100), var(--primitives-color-neutral-150));
		--_date-picker-day-is-selected-background-color: var(--semantics-controls-is-highlighted-indicator-color);
		--_date-picker-day-is-selected-content-color: var(--semantics-controls-is-highlighted-contrast-color);
		--_date-picker-day-is-outside-month-content-color: var(--semantics-content-secondary-color);
		--_date-picker-day-is-unavailable-content-color: var(--semantics-content-secondary-color);

		${inheritedTextReset}
		display: block;
		/* Stated, not fit-content: the calendar inside is sized in percentages, so
		   measuring it from here is circular and resolves to the container. The
		   width attribute (--_date-picker-width) overrides the intrinsic seven-cell width;
		   the percentage-based inside stretches along. */
		width: var(--_date-picker-width, calc(var(--_date-picker-day-size) * 7));
		color: var(--semantics-content-color);
		-webkit-tap-highlight-color: transparent;
	}

	:host([week-numbers]) {
		width: var(--_date-picker-width, calc(var(--_date-picker-day-size) * 7 + var(--_date-picker-week-number-column-width)));
	}

	/* An explicit width attribute outranks the derived stacked width: stacked
	   only describes how narrow the picker happens to be, not what the consumer
	   asked for. */
	:host([stacked]) {
		--_date-picker-title-font: var(--primitives-font-display-4-sm);
		--_date-picker-title-button-min-size: var(--semantics-controls-md-min-size);

		width: var(--_date-picker-width, 100%);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.date-picker {
		display: flex;
		width: 100%;
		flex-direction: column;
	}


	/* # Elements */


	/* ## Header */

	.date-picker__header {
		display: flex;
		margin-bottom: var(--_date-picker-header-margin-bottom);
		align-items: center;
		justify-content: space-between;
		gap: var(--primitives-space-8);
	}

	.date-picker__title {
		display: flex;
		margin: 0;
		align-items: center;
		gap: var(--primitives-space-4);
		font: var(--_date-picker-title-font);
		/* A heading that breaks between month and year stops answering the one
		   question it is there for. */
		white-space: nowrap;
	}

	.date-picker__title-month-button,
	.date-picker__title-year-button {
		box-sizing: border-box;
		display: flex;
		margin: 0;
		outline: none;
		border: none;
		border-radius: var(--_date-picker-title-button-corner-radius);
		background: none;
		min-height: var(--_date-picker-title-button-min-size);
		padding: 0;
		align-items: center;
		color: inherit;
		font: inherit;
		appearance: none;
	}

	.date-picker__title-picker-icon {
		display: flex;
		width: var(--_date-picker-title-picker-icon-size);
		height: var(--_date-picker-title-picker-icon-size);
		flex-shrink: 0;
		align-items: center;
	}

	.date-picker__title-month-button:focus-visible,
	.date-picker__title-year-button:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.date-picker__pagination {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: var(--primitives-space-2);
	}


	/* ## Calendar */

	.date-picker__calendar {
		border-collapse: collapse;
		width: 100%;
		table-layout: fixed;
		/* Dragging a range would otherwise select the day numbers as text. */
		-webkit-user-select: none;
		user-select: none;
	}

	.date-picker__weekday-header-cell,
	.date-picker__week-header-cell {
		border-block-end: var(--_date-picker-divider-thickness) solid var(--_date-picker-divider-color);
		padding: 0 0 var(--primitives-space-4);
		width: var(--_date-picker-day-size);
		color: var(--_date-picker-weekday-header-content-color);
		font: var(--_date-picker-weekday-header-font);
	}

	.date-picker__day-cell,
	.date-picker__week-cell {
		border-block-end: var(--_date-picker-divider-thickness) solid var(--_date-picker-divider-color);
		padding: 0;
	}

	tbody tr:last-child .date-picker__day-cell,
	tbody tr:last-child .date-picker__week-cell {
		border-block-end: none;
	}

	.date-picker__week-cell,
	.date-picker__week-header-cell {
		/* Table cells do not inherit the host's border-box, so the padding and rule
		   below would otherwise be added on top of the stated width. */
		box-sizing: border-box;
		border-inline-end: var(--_date-picker-divider-thickness) solid var(--_date-picker-divider-color);
		/* Stated rather than auto: an auto column under table-layout: fixed takes
		   all the surplus width and pushes the dates aside. */
		width: var(--_date-picker-week-number-column-width);
		padding-right: var(--primitives-space-8);
		text-align: right;
		color: var(--_date-picker-week-number-content-color);
		font: var(--_date-picker-week-number-font);
	}


	/* ## Day */

	.date-picker__day {
		box-sizing: border-box;
		display: flex;
		position: relative;
		margin: 0;
		outline: none;
		border: none;
		background: none;
		width: 100%;
		height: var(--_date-picker-day-size);
		padding: 0;
		align-items: center;
		justify-content: center;
		color: inherit;
		font: var(--_date-picker-day-font);
		appearance: none;
	}

	.date-picker__day-range-indicator {
		position: absolute;
		inset-inline: 0;
		inset-block: var(--_date-picker-day-indicator-inset);
		background-color: var(--_date-picker-day-is-in-range-background-color);
		pointer-events: none;
	}

	.date-picker__day-range-indicator.is-start {
		inset-inline: 50% 0;
	}

	.date-picker__day-range-indicator.is-end {
		inset-inline: 0 50%;
	}

	.date-picker__day-indicator {
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left: 50%;
		border-radius: var(--_date-picker-day-indicator-corner-radius);
		background-color: transparent;
		pointer-events: none;
		width: var(--_date-picker-day-indicator-size);
		height: var(--_date-picker-day-indicator-size);
		transform: translate(-50%, -50%);
	}

	.date-picker__day.is-range-start:not(.is-range-end) .date-picker__day-indicator {
		border-start-end-radius: 0;
		border-end-end-radius: 0;
	}

	.date-picker__day.is-range-end:not(.is-range-start) .date-picker__day-indicator {
		border-start-start-radius: 0;
		border-end-start-radius: 0;
	}

	.date-picker__day-number {
		position: relative;
	}

	.date-picker__day.is-today .date-picker__day-indicator {
		border: var(--primitives-border-width-regular) solid var(--_date-picker-day-is-today-border-color);
	}

	/* Touch reports a hover after a tap and keeps it until you touch something
	   else, so a day stays lit long after you picked it. Only pointers that can
	   really hover. */
	@media (hover: hover) {
		.date-picker__day:hover .date-picker__day-indicator {
			background-color: var(--_date-picker-day-is-hovered-background-color);
		}
	}

	/* :focus, not :focus-visible. Arrow keys move focus programmatically, and the
	   browser keeps judging the session by the click that opened the calendar, so
	   focus-visible never matches while navigating. The modality class carries that
	   decision instead - and while it is absent the ring shows, so a failure leaves
	   focus visible rather than hidden.

	   Raised above its neighbors: the ring sits outside the indicator, so an
	   adjacent selected day would paint over part of it. */
	.date-picker__day:focus:not(.is-pointer-focus) {
		z-index: 1;
	}

	.date-picker__day:focus:not(.is-pointer-focus) .date-picker__day-indicator {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	/* These four all set the color at equal specificity, so the order is what
	   decides: outside the month is the weakest, chosen the strongest. */
	.date-picker__day.is-outside-month {
		color: var(--_date-picker-day-is-outside-month-content-color);
	}

	.date-picker__day.is-in-range {
		color: var(--_date-picker-day-is-in-range-content-color);
	}

	.date-picker__day.is-selected {
		color: var(--_date-picker-day-is-selected-content-color);
	}

	/* Repeated for :hover, which carries a pseudo-class and would otherwise
	   outweigh the plain selected rule. */
	.date-picker__day.is-selected .date-picker__day-indicator,
	.date-picker__day.is-selected:hover .date-picker__day-indicator {
		background-color: var(--_date-picker-day-is-selected-background-color);
	}

	.date-picker__day.is-unavailable {
		color: var(--_date-picker-day-is-unavailable-content-color);
		text-decoration: line-through;
	}

	.date-picker__day.is-unavailable:hover .date-picker__day-indicator {
		background-color: transparent;
	}


	/* ## Footer */

	.date-picker__footer {
		display: flex;
		margin-top: var(--_date-picker-footer-margin-top);
		align-items: center;
		justify-content: space-between;
		gap: var(--primitives-space-8);
	}

	/* Both corners hold their place when a side is empty (today out of reach, or
	   a boundary that hides an arrow), so the other side does not slide over. */
	.date-picker__footer-start,
	.date-picker__footer-end {
		display: flex;
	}


	/* ## Announcer */

	.date-picker__announcer {
		position: absolute;
		clip-path: inset(50%);
		margin: -1px;
		width: 1px;
		height: 1px;
		overflow: hidden;
		white-space: nowrap;
	}


	/* # High Contrast */

	@media (forced-colors: active) {
		.date-picker__day.is-selected .date-picker__day-indicator {
			outline: 2px solid CanvasText;
		}

		.date-picker__day:focus:not(.is-pointer-focus) .date-picker__day-indicator {
			outline: 2px solid CanvasText;
		}
	}
`;
