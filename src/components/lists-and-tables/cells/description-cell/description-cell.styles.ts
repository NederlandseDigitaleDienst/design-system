import { css } from 'lit';
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


	/* # Width */

	:host([width="full"]),
	:host(:not([width])),
	:host([width=""]) {
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
		/* Krimpen mag: fit-content betekent min(max-content, max(min-content,
		   beschikbaar)), en met flex-shrink: 0 hield de cel zijn inhoudsbreedte
		   vast en duwde hij alles erachter de rij uit. */
		flex-shrink: 1;
		flex-basis: auto;
	}

	:host([width]:not([width="full"]):not([width="fit-content"]):not([width=""])) {
		flex-shrink: 0;
	}

	:host([max-width]) {
		flex-basis: var(--_description-cell-max-width);
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
		color: var(--context-content-secondary-color, var(--semantics-content-secondary-color)) !important;
		font: var(--primitives-font-body-sm-regular-flat) !important;
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
		color: var(--context-content-color, var(--semantics-content-color)) !important;
		font: var(--primitives-font-body-md-regular-tight) !important;
	}

	@media (forced-colors: active) {
		::slotted([slot="description"]) {
			forced-color-adjust: none !important;
		}
	}
`;
