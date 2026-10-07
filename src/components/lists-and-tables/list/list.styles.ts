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
		--_list-drag-clone-top: 0px;
		--_list-drag-clone-left: 0px;
		--_list-drag-clone-opacity: 0.95;
		--_list-drag-clone-z-index: 100;
		--_list-drag-clone-width: 0px;
		--_list-drag-clone-height: 0px;
		--_list-max-height: none;
		--_list-background-color: transparent;
		--_list-highlight-border-color: transparent;
		--_list-box-padding: var(--primitives-space-4);
		--_list-gap: var(--primitives-space-8);
		--_list-search-field-min-size: var(--semantics-controls-md-min-size);
		--_list-search-field-icon-size: var(--primitives-space-24);
		--_list-search-field-end-padding-right: calc((var(--_list-search-field-min-size) - var(--semantics-controls-sm-min-size)) / 2 - var(--semantics-input-fields-border-width));
		--_list-search-field-button-focus-z-index: 1;
		--_list-search-bar-gap: var(--primitives-space-8);
		--_list-toolbar-gap: var(--primitives-space-8);
		--_list-empty-padding: var(--primitives-space-16);
		--_list-drag-placeholder-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-150));

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

	:host([appearance^="box"]) {
		--_list-background-color: var(--semantics-surfaces-tinted-background-color);
		--_list-highlight-border-color: var(--semantics-surfaces-tinted-border-color);
	}

	:host([appearance="box-base"]) {
		--_list-background-color: var(--semantics-surfaces-base-background-color);
		--_list-highlight-border-color: var(--semantics-surfaces-base-border-color);
	}


	/* # Block */

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--_list-gap);
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
		gap: var(--_list-toolbar-gap);
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
	:host([appearance^="box"]) .list__main {
		position: relative;
		border-radius: var(--semantics-surfaces-corner-radius);
		background-color: var(--_list-background-color);
		box-shadow: inset 0 0 0 1px var(--_list-highlight-border-color);
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

	:host([appearance^="box"]) .list__items {
		padding-inline: calc(var(--semantics-list-items-indicator-inline-inset) + var(--_list-box-padding));
		padding-block: var(--_list-box-padding);
	}

	:host([type="listbox"]) .list__items {
		max-height: var(--_list-max-height);
		overflow-x: hidden;
		overflow-y: auto;
		padding-inline: var(--semantics-list-items-indicator-inline-inset);
	}

	.list__empty {
		padding: var(--_list-empty-padding);
	}

	.list__empty[hidden] {
		display: none;
	}

	.list__search-bar {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--_list-search-bar-gap);
	}

	.list__search-bar-end {
		display: flex;
		flex-shrink: 0;
		flex-direction: row;
		align-items: center;
		gap: var(--_list-search-bar-gap);
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
		min-height: var(--_list-search-field-min-size);
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
		margin-inline: calc((var(--_list-search-field-min-size) - var(--_list-search-field-icon-size)) / 2 - var(--semantics-input-fields-border-width));
		width: var(--_list-search-field-icon-size);
		height: var(--_list-search-field-icon-size);
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
		padding-right: var(--_list-search-field-end-padding-right);
		flex-shrink: 0;
		align-items: center;
	}

	.list__search-field-clear:focus-within {
		position: relative;
		z-index: var(--_list-search-field-button-focus-z-index);
	}

	::slotted(.nldd-list-drag-placeholder) {
		box-sizing: border-box;
		border-radius: var(--semantics-list-items-indicator-corner-radius);
		background-color: var(--_list-drag-placeholder-background-color);
		pointer-events: none;
	}

	.list__drag-clone {
		display: flex;
		position: absolute;
		top: var(--_list-drag-clone-top);
		left: var(--_list-drag-clone-left);
		opacity: var(--_list-drag-clone-opacity);
		z-index: var(--_list-drag-clone-z-index);
		border-radius: var(--semantics-list-items-indicator-corner-radius);
		background: var(--semantics-surfaces-base-background-color);
		pointer-events: none;
		width: var(--_list-drag-clone-width);
		height: var(--_list-drag-clone-height);
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
		:host([appearance^="box"]) .list__main {
			border: 1px solid CanvasText;
		}
	}
`;
