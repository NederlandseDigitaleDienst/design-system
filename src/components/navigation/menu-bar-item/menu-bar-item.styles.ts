import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const menuBarItemStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_menu-bar-item-indicator-z-index: 0;
		--_menu-bar-item-content-z-index: 1;
		--_menu-bar-item-focus-z-index: 1;
		--_menu-bar-item-content-color: var(--primitives-color-accent-750);
		--_menu-bar-item-font: var(--primitives-font-body-md-medium-flat);
		--_menu-bar-item-is-hovered-indicator-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-200));
		--_menu-bar-item-is-expanded-indicator-background-color: light-dark(var(--primitives-color-neutral-75), var(--primitives-color-neutral-250));
		--_menu-bar-item-is-current-indicator-background-color: var(--semantics-controls-is-highlighted-indicator-color);
		--_menu-bar-item-is-current-indicator-height: var(--primitives-space-4);

		${inheritedTextReset}
		display: inline-block;
		position: relative;
		flex-grow: 0;
		flex-shrink: 0;
		flex-basis: auto;
		isolation: isolate;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.menu-bar-item {
		box-sizing: border-box;
		display: flex;
		position: relative;
		margin: 0;
		border: none;
		background: none;
		min-width: var(--semantics-controls-md-min-size);
		height: var(--semantics-controls-md-min-size);
		padding: 0 var(--semantics-menu-bar-items-inline-padding);
		gap: var(--primitives-space-4);
		align-items: center;
		justify-content: center;
		text-align: center;
		color: var(--_menu-bar-item-content-color);
		font: var(--_menu-bar-item-font);
		text-decoration: none;
		white-space: nowrap;
		appearance: none;
	}

	a.menu-bar-item {
		cursor: var(--semantics-controls-link-cursor);
	}

	/* ## Hover indicator (::before) */

	.menu-bar-item::before {
		content: '';
		position: absolute;
		top: var(--primitives-space-6);
		right: 0;
		bottom: var(--primitives-space-6);
		left: 0;
		z-index: var(--_menu-bar-item-indicator-z-index);
		border-radius: var(--semantics-controls-sm-corner-radius);
		pointer-events: none;
	}

	@media (hover: hover) {
		.menu-bar-item:hover::before {
			background-color: var(--_menu-bar-item-is-hovered-indicator-background-color);
		}
	}

	:host([expanded]) .menu-bar-item::before {
		background-color: var(--_menu-bar-item-is-expanded-indicator-background-color);
	}

	@media (hover: hover) {
		:host([expanded]) .menu-bar-item:hover::before {
			background-color: var(--_menu-bar-item-is-hovered-indicator-background-color);
		}
	}

	/* ## Current indicator (::after) */

	:host([current]) .menu-bar-item::after {
		content: '';
		position: absolute;
		right: var(--primitives-space-8);
		bottom: 0;
		left: var(--primitives-space-8);
		z-index: var(--_menu-bar-item-indicator-z-index);
		background-color: var(--_menu-bar-item-is-current-indicator-background-color);
		height: var(--_menu-bar-item-is-current-indicator-height);
		pointer-events: none;
	}

	/* ## Text */

	.menu-bar-item__text {
		position: relative;
		z-index: var(--_menu-bar-item-content-z-index);
	}

	/* ## Icon */

	.menu-bar-item__icon {
		z-index: var(--_menu-bar-item-content-z-index);
		width: var(--primitives-space-20);
		height: var(--primitives-space-20);
		flex-shrink: 0;
	}

	/* ## Disclosure icon */

	.menu-bar-item__disclosure-icon {
		z-index: var(--_menu-bar-item-content-z-index);
		width: var(--primitives-space-16);
		height: var(--primitives-space-16);
	}


	/* # Focus */

	:host(:focus-within) {
		z-index: var(--_menu-bar-item-focus-z-index);
	}

	.menu-bar-item:focus-visible {
		outline: none;
	}

	.menu-bar-item:focus-visible::before {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* # Slotted */

	::slotted(nldd-menu-item),
	::slotted(nldd-menu-divider) {
		display: none;
	}


	/* # Disabled */

	:host([disabled]) .menu-bar-item {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}


	/* # Icon-only */

	:host([icon-only]) .menu-bar-item,
	:host([content-priority="icon"][compact][icon]:not([icon=""])) .menu-bar-item {
		padding: var(--primitives-space-8);
	}

	:host([icon-only]) .menu-bar-item__text,
	:host([content-priority="icon"][compact][icon]:not([icon=""])) .menu-bar-item__text {
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

	:host([content-priority="text"][compact]) .menu-bar-item__icon {
		display: none;
	}
`;
