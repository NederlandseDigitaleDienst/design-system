import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const tabBarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_tab-bar-corner-radius: var(--semantics-controls-md-corner-radius);
		--_tab-bar-gap: var(--primitives-space-1);
		--_tab-bar-current-z-index: 1;
		--_tab-bar-focus-z-index: 2;

		${inheritedTextReset}
		display: inline-block;
		position: relative;
		max-width: 100%;
		isolation: isolate;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([centered]) {
		display: block;
		width: 100%;
	}

	:host([size="lg"]) {
		--_tab-bar-corner-radius: var(--semantics-controls-lg-corner-radius);
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	:host([hidden]) {
		display: none;
	}

	/* # Block */

	.tab-bar {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
	}

	:host([centered]) .tab-bar {
		justify-content: center;
	}

	.tab-bar__items {
		display: grid;
		position: relative;
		border-radius: var(--_tab-bar-corner-radius);
		background-color: var(--semantics-buttons-neutral-tinted-background-color);
		min-width: 0;
		grid-auto-flow: column;
		grid-auto-columns: auto;
		align-items: center;
		gap: var(--_tab-bar-gap);
	}

	.tab-bar__items::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--semantics-buttons-neutral-tinted-highlight-border-color);
		pointer-events: none;
	}


	/* # Focus */

	::slotted(nldd-tab-bar-item[current]) {
		position: relative;
		z-index: var(--_tab-bar-current-z-index);
	}

	::slotted(nldd-tab-bar-item:focus-within) {
		position: relative;
		z-index: var(--_tab-bar-focus-z-index);
	}
`;

export const tabBarItemStyles = css`


	/* # Host */

	:host {
		--_tab-bar-item-corner-radius: var(--semantics-controls-md-corner-radius);
		--_tab-bar-item-min-size: var(--semantics-controls-md-min-size);
		--_tab-bar-item-block-padding: var(--semantics-controls-md-block-padding);
		--_tab-bar-item-inline-padding: var(--semantics-buttons-md-inline-padding);
		--_tab-bar-item-gap: var(--semantics-buttons-md-gap);
		--_tab-bar-item-font: var(--semantics-buttons-md-primary-text-font);
		--_tab-bar-item-icon-size: var(--semantics-buttons-md-icon-size);
		--_tab-bar-item-highlight-border-color: transparent;
		--_tab-bar-item-content-z-index: 1;

		${inheritedTextReset}
		display: inline-block;
		position: relative;
		-webkit-tap-highlight-color: transparent;
	}

	:host([size="lg"]) {
		--_tab-bar-item-corner-radius: var(--semantics-controls-lg-corner-radius);
		--_tab-bar-item-min-size: var(--semantics-controls-lg-min-size);
		--_tab-bar-item-block-padding: var(--semantics-controls-lg-block-padding);
		--_tab-bar-item-inline-padding: var(--semantics-buttons-lg-inline-padding);
		--_tab-bar-item-gap: var(--semantics-buttons-lg-gap);
		--_tab-bar-item-font: var(--semantics-buttons-lg-primary-text-font);
		--_tab-bar-item-icon-size: var(--semantics-buttons-lg-icon-size);
	}

	:host([variant="icon"]) {
		--_tab-bar-item-block-padding: var(--semantics-buttons-md-is-icon-only-inline-padding);
		--_tab-bar-item-inline-padding: var(--semantics-buttons-md-is-icon-only-inline-padding);
		--_tab-bar-item-icon-size: var(--semantics-buttons-md-is-icon-only-icon-size);
	}

	:host([variant="icon"][size="lg"]) {
		--_tab-bar-item-block-padding: var(--semantics-buttons-lg-is-icon-only-inline-padding);
		--_tab-bar-item-inline-padding: var(--semantics-buttons-lg-is-icon-only-inline-padding);
		--_tab-bar-item-icon-size: var(--semantics-buttons-lg-is-icon-only-icon-size);
	}

	:host([variant="icon-and-text"][size="lg"]) {
		--_tab-bar-item-block-padding: var(--primitives-space-8);
		--_tab-bar-item-inline-padding: var(--primitives-space-8);
		--_tab-bar-item-gap: var(--primitives-space-2);
		--_tab-bar-item-font: var(--primitives-font-body-xxs-medium-flat);
		--_tab-bar-item-icon-size: var(--semantics-buttons-md-is-icon-only-icon-size);
	}

	:host([hidden]) {
		display: none;
	}

	/* Text-bearing items may shrink (their grid track narrows below content) so the
	 * text can truncate. Icon-only items keep min-width:auto, so their track floors
	 * at the fixed touch-target size — an icon can't truncate. */
	:host([variant="text"]),
	:host([variant="icon-and-text"]) {
		min-width: 0;
	}


	/* # Block */

	.tab-bar__item {
		box-sizing: border-box;
		display: flex;
		position: relative;
		margin: 0;
		border: none;
		border-radius: var(--_tab-bar-item-corner-radius);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_tab-bar-item-highlight-border-color);
		background: none;
		width: 100%;
		height: var(--_tab-bar-item-min-size);
		padding-block: var(--_tab-bar-item-block-padding);
		padding-inline: var(--_tab-bar-item-inline-padding);
		gap: var(--_tab-bar-item-gap);
		align-items: center;
		justify-content: center;
		color: var(--semantics-buttons-neutral-tinted-content-color);
		font: var(--_tab-bar-item-font);
		text-decoration: none;
		appearance: none;
	}

	a.tab-bar__item {
		cursor: var(--semantics-controls-link-cursor);
	}

	:host([variant="icon"]) .tab-bar__item {
		width: var(--_tab-bar-item-min-size);
	}

	:host([variant="icon-and-text"][size="lg"]) .tab-bar__item {
		flex-direction: column;
	}

	@media (hover: hover) {
		.tab-bar__item:hover {
			background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
			color: var(--semantics-buttons-neutral-tinted-is-hovered-content-color);
		}
	}

	.tab-bar__item:active {
		background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-active-content-color);
	}

	:host([current]) .tab-bar__item {
		--_tab-bar-item-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-highlight-border-color);

		background-color: var(--semantics-buttons-neutral-tinted-is-selected-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-selected-content-color);
	}

	@media (hover: hover) {
		:host([current]) .tab-bar__item:hover {
			--_tab-bar-item-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-highlight-border-color);

			background-color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-background-color);
			color: var(--semantics-buttons-neutral-tinted-is-selected-is-hovered-content-color);
		}
	}

	:host([current]) .tab-bar__item:active {
		--_tab-bar-item-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-highlight-border-color);

		background-color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-background-color);
		color: var(--semantics-buttons-neutral-tinted-is-selected-is-active-content-color);
	}

	@media (forced-colors: active) {
		:host([current]) .tab-bar__item {
			background-color: Highlight;
		}
	}

	.tab-bar__item:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	:host([current]) .tab-bar__item:focus-visible {
		box-shadow: var(--semantics-focus-ring-box-shadow), inset 0 0 0 var(--primitives-border-width-thin) var(--_tab-bar-item-highlight-border-color);
	}


	/* # Elements */

	.tab-bar__item-icon {
		display: flex;
		position: relative;
		z-index: var(--_tab-bar-item-content-z-index);
		width: var(--_tab-bar-item-icon-size);
		height: var(--_tab-bar-item-icon-size);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	:host([variant="text"]) .tab-bar__item-icon {
		display: none;
	}

	::slotted([slot="icon"]) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.tab-bar__item-text {
		position: relative;
		z-index: var(--_tab-bar-item-content-z-index);
		min-width: 0;
		max-width: 100%;
		font: var(--_tab-bar-item-font);
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	:host([variant="icon"]) .tab-bar__item-text {
		display: none;
	}
`;
