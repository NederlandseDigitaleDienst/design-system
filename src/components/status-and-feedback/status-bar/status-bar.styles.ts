import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const statusBarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_status-bar-corner-radius: var(--primitives-corner-radius-none);
		--_status-bar-background-color: var(--semantics-categories-neutral-filled-background-color);
		--_status-bar-height: var(--semantics-controls-xs-min-size);
		--_status-bar-inline-padding: var(--primitives-space-8);
		--_status-bar-gap: var(--primitives-space-2);
		--_status-bar-content-color: var(--semantics-categories-neutral-filled-content-color);
		--_status-bar-font: var(--primitives-font-body-xs-medium-flat);
		--_status-bar-is-hovered-background-color: light-dark(var(--primitives-color-neutral-650), var(--primitives-color-neutral-500));
		--_status-bar-is-active-background-color: light-dark(var(--primitives-color-neutral-700), var(--primitives-color-neutral-550));
		--_status-bar-action-icon-size: var(--primitives-space-16);

		${inheritedTextReset}
		display: block;
	}

	:host([hidden]) {
		display: none;
	}

	:host([variant="accent"]) {
		--_status-bar-background-color: var(--semantics-categories-accent-filled-background-color);
		--_status-bar-content-color: var(--semantics-categories-accent-filled-content-color);
		--_status-bar-is-hovered-background-color: light-dark(var(--primitives-color-accent-800), var(--primitives-color-accent-450));
		--_status-bar-is-active-background-color: light-dark(var(--primitives-color-accent-850), var(--primitives-color-accent-500));
	}

	:host([variant="success"]) {
		--_status-bar-background-color: var(--semantics-categories-success-filled-background-color);
		--_status-bar-content-color: var(--semantics-categories-success-filled-content-color);
		--_status-bar-is-hovered-background-color: var(--primitives-color-success-550);
		--_status-bar-is-active-background-color: var(--primitives-color-success-600);
	}

	:host([variant="warning"]) {
		--_status-bar-background-color: var(--semantics-categories-warning-filled-background-color);
		--_status-bar-content-color: var(--semantics-categories-warning-filled-content-color);
		--_status-bar-is-hovered-background-color: light-dark(var(--primitives-color-warning-450), var(--primitives-color-warning-650));
		--_status-bar-is-active-background-color: light-dark(var(--primitives-color-warning-500), var(--primitives-color-warning-700));
	}

	:host([variant="critical"]) {
		--_status-bar-background-color: var(--semantics-categories-critical-filled-background-color);
		--_status-bar-content-color: var(--semantics-categories-critical-filled-content-color);
		--_status-bar-is-hovered-background-color: light-dark(var(--primitives-color-critical-700), var(--primitives-color-critical-500));
		--_status-bar-is-active-background-color: light-dark(var(--primitives-color-critical-750), var(--primitives-color-critical-550));
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
		border-radius: var(--_status-bar-corner-radius);
		background-color: var(--_status-bar-background-color);
		width: 100%;
		min-height: var(--_status-bar-height);
		overflow: hidden;
		padding-inline: var(--_status-bar-inline-padding);
		gap: var(--_status-bar-gap);
		align-items: center;
		justify-content: center;
		color: var(--_status-bar-content-color);
		font: var(--_status-bar-font);
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
		background-color: var(--_status-bar-is-hovered-background-color);
	}

	a.status-bar:active,
	button.status-bar:active {
		background-color: var(--_status-bar-is-active-background-color);
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
		width: var(--_status-bar-action-icon-size);
	}
`;
