import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const statusBarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_corner-radius: var(--primitives-corner-radius-none);
		--_background-color: var(--components-status-bar-neutral-background-color);
		--_height: var(--components-status-bar-height);
		--_inline-padding: var(--primitives-space-8);
		--_gap: var(--primitives-space-2);
		--_content-color: var(--components-status-bar-neutral-content-color);
		--_font: var(--primitives-font-body-xs-medium-flat);
		--_is-hovered-background-color: var(--components-status-bar-neutral-is-hovered-background-color);
		--_is-active-background-color: var(--components-status-bar-neutral-is-active-background-color);
		--_action-icon-size: var(--primitives-space-16);

		${inheritedTextReset}
		display: block;
	}

	:host([hidden]) {
		display: none;
	}

	:host([variant="accent"]) {
		--_background-color: var(--components-status-bar-accent-background-color);
		--_content-color: var(--components-status-bar-accent-content-color);
		--_is-hovered-background-color: var(--components-status-bar-accent-is-hovered-background-color);
		--_is-active-background-color: var(--components-status-bar-accent-is-active-background-color);
	}

	:host([variant="success"]) {
		--_background-color: var(--components-status-bar-success-background-color);
		--_content-color: var(--components-status-bar-success-content-color);
		--_is-hovered-background-color: var(--components-status-bar-success-is-hovered-background-color);
		--_is-active-background-color: var(--components-status-bar-success-is-active-background-color);
	}

	:host([variant="warning"]) {
		--_background-color: var(--components-status-bar-warning-background-color);
		--_content-color: var(--components-status-bar-warning-content-color);
		--_is-hovered-background-color: var(--components-status-bar-warning-is-hovered-background-color);
		--_is-active-background-color: var(--components-status-bar-warning-is-active-background-color);
	}

	:host([variant="critical"]) {
		--_background-color: var(--components-status-bar-critical-background-color);
		--_content-color: var(--components-status-bar-critical-content-color);
		--_is-hovered-background-color: var(--components-status-bar-critical-is-hovered-background-color);
		--_is-active-background-color: var(--components-status-bar-critical-is-active-background-color);
	}


	/* # Bar
	   One rule for all three render modes (div, a, button); the resets
	   neutralise the a/button UA styles so the modes are visually
	   identical. */

	.status-bar {
		appearance: none;
		box-sizing: border-box;
		display: flex;
		margin: 0;
		border: none;
		border-radius: var(--_corner-radius);
		background-color: var(--_background-color);
		width: 100%;
		min-height: var(--_height);
		overflow: hidden;
		padding-inline: var(--_inline-padding);
		gap: var(--_gap);
		align-items: center;
		justify-content: center;
		color: var(--_content-color);
		font: var(--_font);
		text-decoration: none;
		white-space: nowrap;
	}

	@media (forced-colors: active) {
		.status-bar {
			border: var(--primitives-border-width-thin) solid CanvasText;
		}
	}

	a.status-bar {
		cursor: var(--semantics-controls-link-cursor);
	}

	a.status-bar:hover,
	button.status-bar:hover {
		background-color: var(--_is-hovered-background-color);
	}

	a.status-bar:active,
	button.status-bar:active {
		background-color: var(--_is-active-background-color);
	}


	/* # Focus */

	.status-bar:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.status-bar:focus:not(:focus-visible) {
		outline: none;
	}

	@media (forced-colors: active) {
		.status-bar:focus-visible {
			outline: 2px solid CanvasText;
		}
	}


	/* # Text */

	.status-bar__text {
		display: block;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}


	/* # Action icon */

	.status-bar__action-icon {
		display: flex;
		flex-shrink: 0;
		width: var(--_action-icon-size);
	}
`;
