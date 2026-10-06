import { css } from 'lit';
import { inheritedTextReset } from '../../../../assets/styles/shadow-resets.js';

export const cellStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_cell-width: auto;
		--_cell-min-width: 0;
		--_cell-max-width: none;
		--_cell-min-height: 0;

		${inheritedTextReset}
		/* !important: shields the row padding from consumer universal resets, which beat normal :host declarations per CSS Scoping. */
		padding-block: var(--context-cell-padding-block, 0px) !important;
		display: flex;
		width: var(--_cell-width);
		min-width: var(--_cell-min-width);
		max-width: var(--_cell-max-width);
		min-height: var(--_cell-min-height);
		flex-direction: column;
		flex-shrink: 0;
		align-items: flex-start;
		justify-content: center;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Width */

	:host([width="full"]) {
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	:host([width="fit-content"]),
	:host(:not([width])),
	:host([width=""]) {
		width: fit-content;
		flex-grow: 0;
		flex-basis: auto;
	}

	:host([width]:not([width="full"]):not([width="fit-content"]):not([width=""])) {
		flex-shrink: 0;
	}

	:host([max-width]) {
		flex-basis: var(--_cell-max-width);
	}


	/* # Vertical alignment */

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
		align-items: center;
	}

	:host([horizontal-alignment="right"]) {
		align-items: flex-end;
	}


	/* # Slotted content */

	::slotted(*) {
		flex-shrink: 0;
	}
`;
