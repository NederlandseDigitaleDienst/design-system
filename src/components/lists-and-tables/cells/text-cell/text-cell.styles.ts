import { css } from 'lit';
import { inheritedTextReset } from '../../../../assets/styles/shadow-resets.js';

export const textCellStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_text-cell-width: auto;
		--_text-cell-min-width: 0;
		--_text-cell-max-width: none;
		--_text-cell-min-height: 0;
		--_text-cell-secondary-color: var(--context-content-secondary-color, var(--semantics-content-secondary-color));
		--_text-cell-secondary-font: var(--primitives-font-body-xs-regular-tight);
		--_text-cell-align: start;
		--_text-cell-color: var(--context-content-color, var(--semantics-content-color));
		--_text-cell-font: var(--primitives-font-body-md-regular-tight);

		${inheritedTextReset}
		/* !important: shields the row padding from consumer universal resets, which beat normal :host declarations per CSS Scoping. */
		padding-block: var(--context-cell-padding-block, 0px) !important;
		display: flex;
		width: var(--_text-cell-width);
		min-width: var(--_text-cell-min-width);
		max-width: var(--_text-cell-max-width);
		min-height: var(--_text-cell-min-height);
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
		--_text-cell-min-width: min-content;

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
		flex-basis: var(--_text-cell-max-width);
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


	/* # Horizontal alignment */

	:host([horizontal-alignment="left"]),
	:host(:not([horizontal-alignment])) {
		align-items: flex-start;
	}

	:host([horizontal-alignment="center"]) {
		--_text-cell-align: center;
		align-items: center;
	}

	:host([horizontal-alignment="right"]) {
		--_text-cell-align: right;
		align-items: flex-end;
	}


	/* # Size */

	:host([size="sm"]) {
		--_text-cell-secondary-font: var(--primitives-font-body-xxs-regular-tight);
		--_text-cell-font: var(--primitives-font-body-sm-regular-tight);
	}


	/* # Color */

	:host([color="secondary"]) {
		--_text-cell-color: var(--context-content-secondary-color, var(--semantics-content-secondary-color));
	}

	:host([color="accent"]) {
		--_text-cell-secondary-color: var(--context-content-accent-color, var(--semantics-content-accent-color));
		--_text-cell-color: var(--context-content-accent-color, var(--semantics-content-accent-color));
	}

	:host([color="success"]) {
		--_text-cell-secondary-color: var(--context-content-success-color, var(--semantics-content-success-color));
		--_text-cell-color: var(--context-content-success-color, var(--semantics-content-success-color));
	}

	:host([color="warning"]) {
		--_text-cell-secondary-color: var(--context-content-warning-color, var(--semantics-content-warning-color));
		--_text-cell-color: var(--context-content-warning-color, var(--semantics-content-warning-color));
	}

	:host([color="critical"]) {
		--_text-cell-secondary-color: var(--context-content-critical-color, var(--semantics-content-critical-color));
		--_text-cell-color: var(--context-content-critical-color, var(--semantics-content-critical-color));
	}


	/* # Elements */

	.text-cell__overline {
		margin: 0;
		min-width: 0;
		align-self: stretch;
		text-align: var(--_text-cell-align);
		color: var(--_text-cell-secondary-color);
		font: var(--_text-cell-secondary-font);
		overflow-wrap: anywhere;
	}

	.text-cell__text {
		margin: 0;
		min-width: 0;
		align-self: stretch;
		text-align: var(--_text-cell-align);
		color: var(--_text-cell-color);
		font: var(--_text-cell-font);
		overflow-wrap: anywhere;
		text-wrap: pretty;
	}

	@media (forced-colors: active) {
		.text-cell__text {
			forced-color-adjust: none;
		}
	}

	.text-cell__supporting-text {
		margin: 0;
		min-width: 0;
		align-self: stretch;
		text-align: var(--_text-cell-align);
		color: var(--_text-cell-secondary-color);
		font: var(--_text-cell-secondary-font);
		overflow-wrap: anywhere;
	}
`;
