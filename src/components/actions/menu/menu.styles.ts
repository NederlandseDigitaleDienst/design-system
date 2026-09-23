import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const menuStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_viewport-margin: var(--primitives-space-16);
		--_width: initial;
		--_min-width: var(--primitives-area-280);
		--_max-width: min(100vw - 2 * var(--_viewport-margin), var(--primitives-area-640));
		--_max-height: calc(infinity * 1px);
		--_max-items: 9999;
		--_padding: var(--primitives-space-8);
		--_item-size: var(--semantics-controls-md-min-size);
		--_item-background-color: transparent;
		--_item-is-highlighted-background-color: var(--components-menu-item-is-highlighted-background-color);
		--_item-is-highlighted-content-color: var(--components-menu-item-is-highlighted-content-color);

		@media (pointer: fine) {
			--_padding: var(--primitives-space-6);
			--_item-size: var(--semantics-controls-sm-min-size);
		}

		/* A menu is an overlay: context from where it happens to be ANCHORED must
		   not style its items. Inside an nldd-list-item the row's cell padding
		   would cascade into the text-cells of the items and stretch every row. */
		--context-cell-padding-block: 0px;

		${inheritedTextReset}
		display: block;
		position: absolute;
		margin: 0;
		border: none;
		background: transparent;
		overflow: visible;
		padding: 0;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host(:not(:popover-open)) {
		display: none;
	}

	:host([hidden]) {
		display: none;
	}

	/* Hide the menu between opening and being placed by Floating UI, so it never
	   flashes at the popover's default position. visibility (not display) keeps it laid
	   out so its size can be measured for positioning. The positioned attribute is set
	   once reposition() finishes; cleared again on every re-open. */
	:host(:popover-open:not([positioned])) {
		visibility: hidden;
	}

	:host([scroll-active]) {
		--_item-is-highlighted-background-color: transparent;
		--_item-is-highlighted-content-color: initial;
	}


	/* # Block */

	.menu {
		display: flex;
		box-sizing: border-box;
		border-radius: var(--semantics-overlays-corner-radius);
		box-shadow: var(--components-menu-box-shadow);
		background: var(--semantics-surfaces-base-background-color);
		width: var(--_width, max-content);
		min-width: var(--_min-width);
		max-width: var(--_max-width);
		flex-direction: column;
		max-height: min(var(--_max-height), calc(var(--_max-items) * var(--_item-size) + var(--_padding) * 2));
		outline: none;
		overflow-x: hidden;
		overflow-y: auto;
		scroll-padding-block: var(--_padding);
	}

	.menu:focus-visible:not(.is-pointer-focus) {
		box-shadow: var(--semantics-focus-ring-box-shadow), var(--components-menu-box-shadow);
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
	}


	/* # Elements */

	.menu__main {
		display: flex;
		flex-direction: column;
		padding: var(--_padding);
	}

	.menu__list {
		display: flex;
		flex-direction: column;
	}

	.menu__header {
		box-sizing: border-box;
		border-bottom: var(--semantics-dividers-thickness) solid var(--semantics-dividers-color);
		flex-shrink: 0;
	}

	.menu__header[hidden] {
		display: none;
	}

	.menu__footer {
		box-sizing: border-box;
		border-top: var(--semantics-dividers-thickness) solid var(--semantics-dividers-color);
		flex-shrink: 0;
	}

	.menu__footer[hidden] {
		display: none;
	}

	.menu__empty {
		padding: var(--primitives-space-8);
	}

	.menu__back-button {
		display: flex;
		box-sizing: border-box;
		border: none;
		border-radius: var(--semantics-controls-md-corner-radius);
		background: transparent;
		width: 100%;
		min-height: var(--_item-size);
		padding: var(--primitives-space-8);
		flex-direction: row;
		align-items: center;
		text-align: start;
		appearance: none;
		--context-content-color: var(--semantics-content-secondary-color);

		@media (pointer: fine) {
			border-radius: var(--semantics-controls-sm-corner-radius);
			padding: var(--primitives-space-4) var(--primitives-space-8);
		}
	}

	/* Hover gated to hover-capable pointers: touch's sticky :hover would
	 * otherwise leave the back button highlighted after opening a submenu. */

	@media (hover: hover) {
		.menu__back-button:hover {
			background-color: var(--_item-is-highlighted-background-color);
			--context-content-color: var(--_item-is-highlighted-content-color);
		}
	}

	.menu__back-button:active:hover {
		background-color: var(--_item-is-highlighted-background-color);
		--context-content-color: var(--_item-is-highlighted-content-color);
	}

	.menu__back-button:focus-visible {
		position: relative;
		z-index: 1;
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.menu__back-button-divider {
		margin: var(--primitives-space-4) 0;
		background-color: var(--semantics-dividers-color);
		height: var(--semantics-dividers-thickness);
	}


	/* Sibling of .menu so role="status" stays outside menu's required-owned
	   children (WCAG 4.1.3); visually hidden, kept in the a11y tree. */
	.menu__live-region {
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

export const menuItemStyles = css`


	/* # Host */

	:host {
		${inheritedTextReset}
		display: block;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	/* ## Open submenu opener
	 *
	 * Lighter neutral bg while the cursor is in the submenu — the active
	 * item is in the submenu, the opener just marks the branch. The
	 * highlighted/hover rule below upgrades back to the bold accent when
	 * the cursor returns to the opener. */

	.menu__item[aria-expanded="true"] {
		--_item-background-color: var(--components-menu-item-is-expanded-background-color);
		--context-content-color: var(--components-menu-item-is-expanded-content-color);
		--context-content-secondary-color: var(--components-menu-item-is-expanded-content-color);
	}

	/* ## Highlighted or pressed
	 *
	 * :hover on [aria-expanded="true"] covers the cursor-on-open-opener
	 * case where [highlighted] has been cleared by submenu-open.
	 * :active:hover is the press flash on touch (neutralised during
	 * scroll via --_item-is-highlighted-* on :host([scroll-active])). */

	:host([highlighted]) .menu__item,
	.menu__item[aria-expanded="true"]:hover,
	.menu__item:active:hover {
		--_item-background-color: var(--_item-is-highlighted-background-color);
		--context-content-color: var(--_item-is-highlighted-content-color);
		--context-content-secondary-color: var(--_item-is-highlighted-content-color);
	}

	/* ## Destructive */

	:host([destructive]) {
		--_item-is-highlighted-background-color: var(--components-menu-item-is-destructive-is-highlighted-background-color);
		--_item-is-highlighted-content-color: var(--components-menu-item-is-destructive-is-highlighted-content-color);
		--context-content-color: var(--components-menu-item-is-destructive-content-color);
		--context-content-secondary-color: var(--components-menu-item-is-destructive-content-color);
	}


	/* # Elements */

	.menu__item {
		display: flex;
		box-sizing: border-box;
		border: none;
		border-radius: var(--semantics-controls-md-corner-radius);
		background: var(--_item-background-color);
		width: 100%;
		min-height: var(--_item-size);
		padding: var(--primitives-space-8);
		flex-direction: row;
		align-items: center;
		text-align: start;
		appearance: none;
		@media (pointer: fine) {
			border-radius: var(--semantics-controls-sm-corner-radius);
			padding: var(--primitives-space-4) var(--primitives-space-8);
		}
	}

	/* A link item (href) renders as <a>; strip the UA link color/underline so
	   it is visually identical to the button variant. The text color is owned
	   by the inner nldd-text-cell. The control cursor token (default, like the
	   other controls) replaces the UA link pointer and stays overridable. */
	a.menu__item {
		color: inherit;
		text-decoration: none;
		cursor: var(--semantics-controls-link-cursor);
	}

	.menu__item:focus-visible {
		position: relative;
		z-index: 1;
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	:host([disabled]) .menu__item {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}


	@media (prefers-reduced-motion: reduce) {
		.menu__item {
			transition: none;
		}
	}


	@media (forced-colors: active) {
		:host([highlighted]) .menu__item,
		.menu__item:hover,
		.menu__item:focus-visible {
			background-color: Highlight;
			color: HighlightText;
		}
	}
`;

export const menuDividerStyles = css`


	/* # Host */

	:host {
		display: flow-root;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Divider */

	.menu__divider {
		margin: var(--primitives-space-4) 0;
		background-color: var(--semantics-dividers-color);
		height: var(--semantics-dividers-thickness);
	}
`;

export const menuGroupStyles = css`


	/* # Host
	 *
	 * Auto top/bottom dividers via border-top/-bottom; suppressed for the
	 * first item (top) and when followed by another group or last item
	 * (bottom). Both flags are set by the parent menu (data-no-top-divider /
	 * data-no-bottom-divider): CSS :first-child / :last-child can't see hidden
	 * siblings, nor the header slot's div that becomes the first light-DOM
	 * child (which would leave a first group no longer :first-child). */

	:host {
		${inheritedTextReset}
		display: flow-root;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.menu__group {
		margin-top: var(--primitives-space-4);
		margin-bottom: var(--primitives-space-4);
		border-top: var(--semantics-dividers-thickness) solid var(--semantics-dividers-color);
		border-bottom: var(--semantics-dividers-thickness) solid var(--semantics-dividers-color);
		padding-top: var(--primitives-space-6);
		padding-bottom: var(--primitives-space-4);
	}

	:host(:first-child) .menu__group,
	:host([data-no-top-divider]) .menu__group {
		border-top: none;
		padding-top: var(--primitives-space-2);
	}

	:host([data-no-bottom-divider]) .menu__group {
		margin-bottom: 0;
		border-bottom: none;
		padding-bottom: var(--primitives-space-2);
	}


	/* # Title */

	.menu__group-title {
		margin: 0;
		padding-top: 0;
		padding-right: var(--primitives-space-8);
		padding-bottom: var(--primitives-space-1);
		padding-left: var(--primitives-space-4);
		font: var(--primitives-font-body-sm-regular-tight);
		color: var(--semantics-content-secondary-color);
	}


	/* # Items wrapper
	 *
	 * display: block keeps the role="group" wrapper as a real box so the
	 * a11y tree exposes role + aria-labelledby reliably (display: contents
	 * has historical a11y-tree bugs in older WebKit/Chromium). */

	.menu__group-items {
		display: block;
	}
`;
