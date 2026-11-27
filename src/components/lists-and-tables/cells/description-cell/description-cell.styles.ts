import { css } from 'lit';
import { hyphenateBodyText, wrapBodyText } from '../../../../assets/styles/text-wrap.js';
import { slottedReset, inheritedTextReset } from '../../../../assets/styles/shadow-resets.js';

export const descriptionCellStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_description-cell-width: auto;
		--_description-cell-min-width: 0;
		--_description-cell-max-width: none;
		--_description-cell-min-height: 0;

		${inheritedTextReset}
		${wrapBodyText}
		/* !important: shields the row padding from consumer universal resets, which beat normal :host declarations per CSS Scoping. */
		padding-block: var(--context-cell-padding-block, 0px) !important;
		display: flex;
		width: var(--_description-cell-width);
		min-width: var(--_description-cell-min-width);
		max-width: var(--_description-cell-max-width);
		min-height: var(--_description-cell-min-height);
		flex-direction: column;
		justify-content: center;
	}

	:host([hidden]) {
		display: none;
	}

	:host([hyphens]) {
		${hyphenateBodyText}
	}


	/* # Width */

	:host([width="full"]),
	:host(:not([width])),
	:host([width=""]) {
		--_description-cell-min-width: var(--context-cell-min-width, var(--semantics-cells-min-width));

		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	:host([width="fit-content"]) {
		/* min-content rather than 0 as the floor: the cell gives way as soon as
		   the row is too narrow, but never past the width of its longest word,
		   so the text stays readable instead of breaking mid-word. */
		--_description-cell-min-width: min-content;

		width: fit-content;
		flex-grow: 0;
		/* Shrinking is allowed: with flex-shrink: 0 the cell kept the width of
		   its text and pushed everything after it out of the row. */
		flex-shrink: 1;
		flex-basis: auto;
	}

	:host([width]:not([width="full"]):not([width="fit-content"]):not([width=""])) {
		flex-shrink: 0;
	}

	:host([max-width]) {
		flex-basis: var(--_description-cell-max-width);
	}

	:host([max-width][width="full"]),
	:host([max-width]:not([width])),
	:host([max-width][width=""]) {
		--_description-cell-min-width: min(var(--context-cell-min-width, var(--semantics-cells-min-width)), var(--_description-cell-max-width));
	}


	/* # Vertical alignment */

	/* "center" (default) stretches to the full row height then centers content;
	   use vertical-alignment="top" for strict top without a minimum height */

	:host([vertical-alignment="center"]),
	:host(:not([vertical-alignment])) {
		align-self: stretch;
	}

	:host([vertical-alignment="top"]) {
		align-self: flex-start;
	}

	:host([vertical-alignment="bottom"]) {
		align-self: flex-end;
	}


	/* # Elements */

	::slotted([slot="title"]) {
		${slottedReset}
		${inheritedTextReset}
		margin: 0 !important;
		min-width: 0 !important;
		align-self: stretch !important;
		--context-content-color: var(--context-content-secondary-color) !important;
		color: var(--context-content-secondary-color) !important;
		font: var(--primitives-font-body-sm-regular-flat) !important;
		text-wrap: pretty !important;
	}

	@media (forced-colors: active) {
		::slotted([slot="title"]) {
			forced-color-adjust: none !important;
		}
	}

	::slotted([slot="description"]) {
		${slottedReset}
		${inheritedTextReset}
		margin: 0 !important;
		min-width: 0 !important;
		align-self: stretch !important;
		color: var(--context-content-color) !important;
		font: var(--primitives-font-body-md-regular-tight) !important;
		text-wrap: pretty !important;
	}

	@media (forced-colors: active) {
		::slotted([slot="description"]) {
			forced-color-adjust: none !important;
		}
	}
`;
