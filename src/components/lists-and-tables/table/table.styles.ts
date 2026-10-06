import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const tableStyles = css`
	:host {
		box-sizing: border-box;
	}
	:host {
		--_table-columns: none;
		--_table-corner-radius: var(--semantics-tables-corner-radius);
		--_table-column-gap: var(--semantics-tables-column-gap);
		--_table-background-color: var(--semantics-surfaces-base-background-color);
		--_table-border-color: var(--semantics-surfaces-base-border-color);
		/* Shared so the focus-visible rule can compose the focus ring over the
		   border ring with var(...) instead of repeating the inset literal. */
		--_table-border-shadow: inset 0 0 0 var(--semantics-tables-border-width) var(--_table-border-color);

		${inheritedTextReset}
		box-sizing: border-box;
		display: grid;
		grid-template-columns: var(--_table-columns);
		width: 100%;
		/* The table is always a boxed surface and its own horizontal scroll
		   container: the columns scroll when they don't fit and the table is made
		   focusable in JS while it scrolls. overflow-y stays hidden so the rounded
		   corners keep clipping the rows (and their full-bleed dividers). */
		border-radius: var(--_table-corner-radius);
		box-shadow: var(--_table-border-shadow);
		background-color: var(--_table-background-color);
		overflow-x: auto;
		overflow-y: hidden;
		column-gap: var(--_table-column-gap);
		row-gap: 0;
	}

	:host([hidden]) {
		display: none;
	}

	/* Default surface is base; tinted is opt-in. */
	:host([background="tinted"]) {
		--_table-background-color: var(--semantics-surfaces-tinted-background-color);
		--_table-border-color: var(--semantics-surfaces-tinted-border-color);
	}

	/* Keyboard focus while the table scrolls (it gains tabindex in JS): the
	   project focus ring, layered over the border ring (mirrors nldd-code-viewer).
	   Focus first (outer), border second (inner). */
	:host(:focus-visible) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), var(--_table-border-shadow);
	}

	:host(:focus:not(:focus-visible)) {
		outline: none;
	}

	slot {
		display: contents;
	}

	/* Empty state spans all columns below the rows; its own padding gives the
	   message room. The header is hidden in the empty state (only the message). */
	.table__empty {
		grid-column: 1 / -1;
	}

	.table__empty[hidden] {
		display: none;
	}

	.table__empty-cell {
		padding: var(--primitives-space-16);
	}

	/* Empty state: collapse the column tracks to a single box-wide column so the
	   message spans the surface instead of the (wider) data columns — otherwise
	   the empty box scrolls horizontally. */
	:host(.is-empty) {
		grid-template-columns: minmax(0, 1fr);
	}

	:host(.is-empty) slot[name="header"] {
		display: none;
	}

	/* Nothing in it and nothing said about it: not a thing on the page. */
	:host(.is-blank) {
		display: none;
	}
`;

export const tableRowStyles = css`
	:host {
		--_table-row-min-height: var(--semantics-tables-row-min-height);
		/* Block padding goes to the cells (same hook the list uses) so it belongs
		   to the cell's box; inline padding stays here because it insets the row
		   content from the frame without moving the full-bleed divider. */
		--context-cell-padding-block: var(--semantics-tables-row-padding-block);
		--_table-row-padding-inline: var(--semantics-tables-row-padding-inline);
		--_table-row-divider-color: var(--semantics-tables-border-color);
		--_table-row-divider-thickness: var(--semantics-tables-border-width);

		${inheritedTextReset}
		box-sizing: border-box;
		display: grid;
		grid-column: 1 / -1;
		grid-template-columns: subgrid;
		min-height: var(--_table-row-min-height);
		/* !important: shields divider and inset from consumer universal resets,
		   which beat normal :host declarations per CSS Scoping. They cannot move
		   inward: the row is a subgrid participant, and a wrapper would break
		   the parent-child column relation. */
		border-bottom: var(--_table-row-divider-thickness) solid var(--_table-row-divider-color) !important;
		padding-inline: var(--_table-row-padding-inline) !important;
		align-items: center;
	}

	:host([hidden]) {
		display: none;
	}

	/* Selection: a full-bleed row tint (reaches the box edges, corners clipped by
	   the table) plus the selected content color, from the shared table tokens. */
	:host([selected]) {
		background-color: var(--semantics-tables-row-is-selected-background-color);
		--context-content-color: var(--semantics-tables-row-is-selected-content-color);
		--context-content-secondary-color: var(--semantics-tables-row-is-selected-content-color);
	}

	/* The box's border ring is the table's outer frame, so the last row drops its
	   divider (no doubling on the ring). Inner dividers run full-bleed to the
	   sides — the padding only insets the cell content, not the row's border. */
	:host(:last-child) {
		/* !important: the base border-bottom above is important, so this
		   suppression has to be too. */
		border-bottom: none !important;
	}

	/* display:contents so the cells become grid items of this subgrid. */
	slot {
		display: contents;
	}
`;
