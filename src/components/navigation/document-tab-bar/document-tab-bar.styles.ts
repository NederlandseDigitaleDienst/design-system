import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const documentTabBarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_drag-clone-top: 0px;
		--_drag-clone-left: 0px;
		--_drag-clone-width: 0px;
		--_drag-clone-height: 0px;
		--_drag-clone-opacity: 0.95;
		--_drag-clone-z-index: 100;
		--_short-text-threshold: 200px;
		--_item-min-width: 100px;
		--_overflow-button-reserve: 52px; /* Used for overflowButtonReserve. Overflow button width + spacing */
		--_dismiss-button-is-hovered-background-color: light-dark(var(--primitives-color-neutral-150), var(--primitives-color-neutral-250));
		--_dismiss-button-is-active-background-color: light-dark(var(--primitives-color-neutral-200), var(--primitives-color-neutral-300));
		--_dismiss-button-is-selected-is-hovered-background-color: light-dark(var(--primitives-color-accent-650), var(--primitives-color-accent-600));
		--_dismiss-button-is-selected-is-active-background-color: light-dark(var(--primitives-color-accent-600), var(--primitives-color-accent-550));
		--_document-tab-bar-tab-title-font: var(--primitives-font-body-sm-medium-flat);

		${inheritedTextReset}
		display: block;
		position: relative;
		width: 100%;
		isolation: isolate;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.document-tab-bar {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--primitives-space-8);
	}

	.document-tab-bar__items {
		display: flex;
		min-width: 0;
		flex-direction: row;
		align-items: center;
		gap: var(--primitives-space-8);
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	::slotted(nldd-document-tab-bar-item) {
		min-width: var(--_item-min-width);
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	::slotted(nldd-document-tab-bar-item[hidden]) {
		display: none;
	}

	.document-tab-bar__items.is-measuring slot {
		flex-grow: 0;
	}

	.document-tab-bar__overflow {
		flex-grow: 0;
		flex-shrink: 0;
	}

	.document-tab-bar__overflow.is-hidden {
		display: none;
	}

	.document-tab-bar__end {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--primitives-space-8);
		flex-grow: 0;
		flex-shrink: 0;
	}

	.document-tab-bar__end[hidden] {
		display: none;
	}


	/* # Focus */

	::slotted(nldd-document-tab-bar-item:focus-within) {
		position: relative;
		z-index: 4;
	}


	/* # Drag states */

	::slotted(nldd-document-tab-bar-item.is-dragging) {
		display: none;
	}


	/* # Drag placeholder */

	::slotted(.nldd-document-tab-bar-drag-placeholder) {
		box-sizing: border-box;
		opacity: var(--semantics-controls-is-dragging-opacity);
		border-radius: var(--semantics-controls-md-corner-radius);
		background-color: var(--semantics-buttons-neutral-tinted-background-color);
		pointer-events: none;
		height: var(--semantics-controls-md-min-size);
		min-width: var(--_item-min-width);
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}


	/* # Drag clone */

	.document-tab-bar__drag-clone {
		position: absolute;
		top: var(--_drag-clone-top);
		left: var(--_drag-clone-left);
		display: flex;
		opacity: var(--_drag-clone-opacity);
		z-index: var(--_drag-clone-z-index);
		border-radius: var(--semantics-controls-md-corner-radius);
		background: var(--semantics-buttons-neutral-tinted-background-color);
		pointer-events: none;
		cursor: grabbing;
		width: var(--_drag-clone-width);
		height: var(--_drag-clone-height);
		overflow: hidden;
		flex-direction: row;
		align-items: stretch;
	}

	.document-tab-bar__drag-clone .document-tab-bar__item {
		box-sizing: border-box;
		position: relative;
		width: 100%;
		height: 100%;
	}

	.document-tab-bar__drag-clone .document-tab-bar__item-tab {
		display: flex;
		box-sizing: border-box;
		border-radius: var(--semantics-controls-md-corner-radius);
		width: 100%;
		height: 100%;
		min-width: 0;
		overflow: hidden;
		padding-block: var(--primitives-space-6);
		padding-inline-start: var(--primitives-space-10);
		padding-inline-end: calc(var(--semantics-controls-sm-min-size) + var(--primitives-space-6) * 2);
		flex-direction: column;
		justify-content: center;
	}

	a.document-tab-bar__item-tab {
		cursor: var(--semantics-controls-link-cursor);
	}

	.document-tab-bar__drag-clone .document-tab-bar__item-text {
		overflow: hidden;
		font: var(--_document-tab-bar-tab-title-font);
		color: var(--semantics-buttons-neutral-tinted-content-color);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.document-tab-bar__drag-clone.is-selected .document-tab-bar__item-tab {
		background-color: var(--semantics-buttons-neutral-tinted-is-selected-background-color);
	}

	.document-tab-bar__drag-clone.is-selected .document-tab-bar__item-text,
	.document-tab-bar__drag-clone.is-selected .document-tab-bar__item-supporting-text {
		color: var(--semantics-buttons-neutral-tinted-is-selected-content-color);
	}

	.document-tab-bar__drag-clone .document-tab-bar__item-supporting-text {
		overflow: hidden;
		font: var(--primitives-font-body-xs-regular-flat);
		color: var(--semantics-content-secondary-color);
		text-overflow: ellipsis;
		white-space: nowrap;
	}


	/* # Announcers */

	.document-tab-bar__polite-announcer,
	.document-tab-bar__assertive-announcer {
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

`;

export const documentTabBarItemStyles = css`


	/* # Host */

	:host {
		--_highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-hovered-highlight-border-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-active-highlight-border-color);
		--_is-selected-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-highlight-border-color);
		--_is-selected-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-highlight-border-color);
		--_is-selected-is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-highlight-border-color);

		--_secondary-content-color: var(--semantics-buttons-neutral-tinted-content-secondary-color);
		--_document-tab-bar-tab-title-font: var(--primitives-font-body-sm-medium-flat);

		${inheritedTextReset}
		container-type: inline-size;
		display: block;
		min-width: 0;
		touch-action: pan-y;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Item */

	.document-tab-bar__item {
		position: relative;
		box-sizing: border-box;
		height: var(--semantics-controls-md-min-size);
		width: 100%;
	}


	/* # Item tab */

	.document-tab-bar__item-tab {
		display: flex;
		box-sizing: border-box;
		position: relative;
		margin: 0;
		border: none;
		border-radius: var(--semantics-controls-md-corner-radius);
		background-color: var(--semantics-buttons-neutral-tinted-background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
		width: 100%;
		height: 100%;
		min-width: 0;
		overflow: hidden;
		padding-block: var(--primitives-space-6);
		padding-inline-start: var(--primitives-space-10);
		padding-inline-end: calc(var(--semantics-controls-sm-min-size) + var(--primitives-space-6));
		text-align: left;
		flex-direction: column;
		justify-content: center;
		text-decoration: none;
		appearance: none;
	}

	@media (hover: hover) {
		.document-tab-bar__item-tab:hover {
			background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
			--_highlight-border-color: var(--_is-hovered-highlight-border-color);
			--_secondary-content-color: var(--semantics-buttons-neutral-tinted-is-hovered-content-secondary-color);
		}
	}

	.document-tab-bar__item-tab:active {
		background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		--_highlight-border-color: var(--_is-active-highlight-border-color);
		--_secondary-content-color: var(--semantics-buttons-neutral-tinted-is-active-content-secondary-color);
	}

	:host([selected]) .document-tab-bar__item-tab {
		background-color: var(--semantics-buttons-neutral-tinted-is-selected-background-color);
		--_highlight-border-color: var(--_is-selected-highlight-border-color);
		--_secondary-content-color: var(--semantics-buttons-neutral-tinted-is-selected-content-secondary-color);
	}

	@media (hover: hover) {
		:host([selected]) .document-tab-bar__item-tab:hover {
			background-color: var(--semantics-buttons-neutral-tinted-is-selected-background-color);
			--_highlight-border-color: var(--_is-selected-is-hovered-highlight-border-color);
			--_secondary-content-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-content-secondary-color);
		}
	}

	:host([selected]) .document-tab-bar__item-tab:active {
		--_highlight-border-color: var(--_is-selected-is-active-highlight-border-color);
		--_secondary-content-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-content-secondary-color);
	}

	/* ## Focus */

	.document-tab-bar__item-tab:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
	}


	/* # Item text wrappers */

	.document-tab-bar__item-normal {
		display: contents;

		@container (max-width: 200px) {
			display: none;
		}
	}

	.document-tab-bar__item-short {
		display: none;

		@container (max-width: 200px) {
			display: contents;
		}
	}


	/* # Item label */

	.document-tab-bar__item-text {
		overflow: hidden;
		padding-inline-end: var(--primitives-space-6);
		font: var(--_document-tab-bar-tab-title-font);
		color: var(--semantics-buttons-neutral-tinted-content-color);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:host([selected]) .document-tab-bar__item-text {
		color: var(--semantics-buttons-neutral-tinted-is-selected-content-color);
	}

	.document-tab-bar__item-short-text {
		overflow: hidden;
		padding-inline-end: var(--primitives-space-6);
		font: var(--_document-tab-bar-tab-title-font);
		color: var(--semantics-buttons-neutral-tinted-content-color);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:host([selected]) .document-tab-bar__item-short-text {
		color: var(--semantics-buttons-neutral-tinted-is-selected-content-color);
	}


	/* # Item supporting label */

	.document-tab-bar__item-supporting-text {
		overflow: hidden;
		padding-inline-end: var(--primitives-space-6);
		font: var(--primitives-font-body-xs-regular-flat);
		color: var(--_secondary-content-color);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.document-tab-bar__item-short-supporting-text {
		overflow: hidden;
		padding-inline-end: var(--primitives-space-6);
		font: var(--primitives-font-body-xs-regular-flat);
		color: var(--_secondary-content-color);
		text-overflow: ellipsis;
		white-space: nowrap;
	}


	/* # Item dismiss button */

	.document-tab-bar__item-dismiss-button {
		display: flex;
		position: absolute;
		top: 50%;
		right: var(--primitives-space-6);
		margin: 0;
		border: none;
		border-radius: var(--semantics-controls-sm-corner-radius);
		background: none;
		width: var(--semantics-controls-sm-min-size);
		height: var(--semantics-controls-sm-min-size);
		padding: var(--primitives-space-4);
		align-items: center;
		justify-content: center;
		color: var(--semantics-buttons-neutral-tinted-content-color);
		transform: translateY(-50%);
		appearance: none;
	}

	@media (hover: hover) {
		.document-tab-bar__item-dismiss-button:hover {
			background-color: var(--_dismiss-button-is-hovered-background-color);
		}
	}

	.document-tab-bar__item-dismiss-button:active {
		background-color: var(--_dismiss-button-is-active-background-color);
	}

	:host([selected]) .document-tab-bar__item-dismiss-button {
		color: var(--semantics-buttons-neutral-tinted-is-selected-content-color);
	}

	@media (hover: hover) {
		:host([selected]) .document-tab-bar__item-dismiss-button:hover {
			background-color: var(--_dismiss-button-is-selected-is-hovered-background-color);
		}
	}

	:host([selected]) .document-tab-bar__item-dismiss-button:active {
		background-color: var(--_dismiss-button-is-selected-is-active-background-color);
	}

	.document-tab-bar__item-dismiss-button:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* # Item dismiss icon */

	.document-tab-bar__item-dismiss-icon {
		display: flex;
		width: var(--primitives-space-16);
		height: var(--primitives-space-16);
	}

`;
