import { css } from 'lit';

export const listStyles = css`
	:host {
		box-sizing: border-box;
	}

	/* Nothing in it, nothing said about it and no controls of its own: not a
	   thing on the page, so a parent that spaces its children keeps no room for
	   it either. The surface is already gone with .list__main; this takes the
	   box out of the flow. */
	:host(.is-blank) {
		display: none;
	}


	/* # Host */

	:host {
		--_drag-clone-top: 0px;
		--_drag-clone-left: 0px;
		--_drag-clone-opacity: 0.95;
		--_drag-clone-z-index: 100;
		--_drag-clone-width: 0px;
		--_drag-clone-height: 0px;
		--_max-height: none;
		--_background-color: transparent;
		--_highlight-border-color: transparent;
		--_box-padding: var(--primitives-space-4);
		--_gap: var(--primitives-space-8);
		--_search-field-min-size: var(--semantics-controls-md-min-size);
		--_search-field-icon-size: var(--primitives-space-24);
		--_search-field-end-padding-right: calc((var(--_search-field-min-size) - var(--semantics-controls-sm-min-size)) / 2 - var(--semantics-input-fields-border-width));
		--_search-field-button-focus-z-index: 1;
		--_search-bar-gap: var(--primitives-space-8);
		--_toolbar-gap: var(--primitives-space-8);
		--_empty-padding: var(--primitives-space-16);

		display: block;
		position: relative;
		width: 100%;
		isolation: isolate;
	}

	:host([hidden]) {
		display: none;
	}

	:host([dividers="never"]),
	:host([dividers="on-touch"]) {
		--context-list-divider-display: none;
	}

	@media (pointer: coarse) {
		:host([dividers="on-touch"]) {
			--context-list-divider-display: block;
		}
	}

	:host([variant^="box"]) {
		--_background-color: var(--semantics-surfaces-tinted-background-color);
		--_highlight-border-color: var(--semantics-surfaces-tinted-border-color);
	}

	:host([variant="box-base"]) {
		--_background-color: var(--semantics-surfaces-base-background-color);
		--_highlight-border-color: var(--semantics-surfaces-base-border-color);
	}


	/* # Block */

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--_gap);
	}


	/* # Elements */

	.list__header {
		display: contents;
	}

	.list__toolbar {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--_toolbar-gap);
	}

	.list__toolbar[hidden] {
		display: none;
	}

	.list__search-bar[hidden] {
		display: none;
	}

	.list__main {
		display: flex;
		flex-direction: column;
	}

	/* No overflow clip: the rows sit 4px inside the frame, so their fills never
	   reach its corners and have nothing to be clipped against. Without it a
	   focus ring inside the box paints outward, like every other control in the
	   system, instead of being cut off by the frame. */
	:host([variant^="box"]) .list__main {
		position: relative;
		border-radius: var(--semantics-surfaces-corner-radius);
		background-color: var(--_background-color);
		box-shadow: inset 0 0 0 1px var(--_highlight-border-color);
	}

	/* Listbox: give the options a bit more breathing room from the pinned
	   search bar (and toolbar) above them than the default inter-row gap, so
	   the search field reads as a zone distinct from the scrolling options. */

	:host([type="listbox"]) .list__main {
		margin-block-start: var(--primitives-space-8);
	}

	.list__main[hidden] {
		display: none;
	}

	.list__items {
		display: flex;
		flex-direction: column;
	}

	.list__items[hidden] {
		display: none;
	}

	:host([variant^="box"]) .list__items {
		padding-inline: calc(var(--components-list-item-indicator-inline-inset) + var(--_box-padding));
		padding-block: var(--_box-padding);
	}

	:host([type="listbox"]) .list__items {
		max-height: var(--_max-height);
		overflow-x: hidden;
		overflow-y: auto;
		padding-inline: var(--components-list-item-indicator-inline-inset);
	}

	.list__empty {
		padding: var(--_empty-padding);
	}

	.list__empty[hidden] {
		display: none;
	}

	.list__search-bar {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--_search-bar-gap);
	}

	.list__search-bar-end {
		display: flex;
		flex-shrink: 0;
		flex-direction: row;
		align-items: center;
		gap: var(--_search-bar-gap);
	}

	.list__search-bar-end[hidden] {
		display: none;
	}

	.list__search-field {
		box-sizing: border-box;
		display: flex;
		position: relative;
		border: var(--semantics-input-fields-border);
		border-radius: var(--semantics-controls-md-corner-radius);
		background-color: var(--semantics-input-fields-background-color);
		width: 100%;
		min-width: 0;
		min-height: var(--_search-field-min-size);
		flex-direction: row;
		align-items: center;
	}

	.list__search-field:has(.list__search-field-input:focus-visible) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.list__search-field-label {
		display: flex;
		min-width: 0;
		flex-grow: 1;
		align-self: stretch;
		flex-direction: row;
		align-items: center;
	}

	.list__search-field-icon {
		display: flex;
		margin-inline: calc((var(--_search-field-min-size) - var(--_search-field-icon-size)) / 2 - var(--semantics-input-fields-border-width));
		width: var(--_search-field-icon-size);
		height: var(--_search-field-icon-size);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		color: var(--semantics-content-secondary-color);
	}

	.list__search-field-input {
		box-sizing: border-box;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		min-width: 0;
		padding: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
		align-self: stretch;
		color: var(--semantics-content-color);
		font: var(--semantics-input-fields-md-text-font);
		appearance: none;
	}

	.list__search-field-input::placeholder {
		color: var(--semantics-input-fields-placeholder-color);
	}

	.list__search-field-end {
		display: flex;
		position: relative;
		padding-right: var(--_search-field-end-padding-right);
		flex-shrink: 0;
		align-items: center;
	}

	.list__search-field-clear:focus-within {
		position: relative;
		z-index: var(--_search-field-button-focus-z-index);
	}

	::slotted(.nldd-list-drag-placeholder) {
		box-sizing: border-box;
		border-radius: var(--components-list-item-indicator-corner-radius);
		background-color: var(--components-list-drag-placeholder-background-color);
		pointer-events: none;
	}

	.list__drag-clone {
		display: flex;
		position: absolute;
		top: var(--_drag-clone-top);
		left: var(--_drag-clone-left);
		opacity: var(--_drag-clone-opacity);
		z-index: var(--_drag-clone-z-index);
		border-radius: var(--components-list-item-indicator-corner-radius);
		background: var(--semantics-surfaces-base-background-color);
		pointer-events: none;
		width: var(--_drag-clone-width);
		height: var(--_drag-clone-height);
		overflow: hidden;
		flex-direction: row;
		align-items: stretch;
	}

	.list__polite-announcer,
	.list__assertive-announcer {
		position: absolute;
		margin: -1px;
		border: 0;
		width: 1px;
		height: 1px;
		overflow: hidden;
		padding: 0;
		white-space: nowrap;
		clip-path: inset(50%);
	}


	/* # High Contrast */

	@media (forced-colors: active) {
		:host([variant^="box"]) .list__main {
			border: 1px solid CanvasText;
		}
	}
`;
