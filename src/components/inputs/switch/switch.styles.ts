import { css } from 'lit';

export const switchStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_track-width: var(--semantics-controls-lg-min-size);
		--_track-height: var(--semantics-controls-sm-min-size);
		--_padding: var(--primitives-space-2);
		--_transition-duration: var(--primitives-transition-duration-fast);
		--_thumb-size: calc(var(--_track-height) - var(--_padding) * 2 - var(--primitives-border-width-regular) * 2);
		--_switch-border-width: var(--primitives-border-width-regular);
		--_switch-border-color: light-dark(var(--primitives-color-neutral-550), var(--primitives-color-neutral-650));
		--_switch-background-color: var(--semantics-surfaces-base-background-color);
		--_switch-is-selected-background-color: var(--semantics-controls-is-highlighted-indicator-color);
		--_switch-thumb-border-width: var(--primitives-border-width-regular);
		--_switch-thumb-border-color: light-dark(var(--primitives-color-neutral-550), var(--primitives-color-neutral-650));
		--_switch-thumb-background-color: var(--semantics-surfaces-base-background-color);
		--_switch-is-selected-thumb-background-color: var(--semantics-controls-is-highlighted-contrast-color);

		display: inline-block;
		position: relative;
		width: var(--_track-width);
		height: var(--_track-height);
		flex-shrink: 0;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="xs"]) {
		--_track-width: var(--semantics-controls-md-min-size);
		--_track-height: var(--semantics-controls-xs-min-size);
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
	}


	/* # Elements */

	.switch__input {
		position: absolute;
		inset: 0;
		opacity: 0;
		z-index: 1;
		margin: 0;
		width: 100%;
		height: 100%;
	}

	.switch__track {
		box-sizing: border-box;
		display: flex;
		position: relative;
		border: var(--_switch-border-width) solid var(--_switch-border-color);
		border-radius: calc(var(--_track-height) / 2);
		background-color: var(--_switch-background-color);
		width: 100%;
		height: 100%;
		padding: var(--_padding);
		align-items: center;
		transition: background-color var(--_transition-duration) ease, border-color var(--_transition-duration) ease;
	}

	.switch__input:checked ~ .switch__track {
		border-color: var(--_switch-is-selected-background-color);
		background-color: var(--_switch-is-selected-background-color);
	}

	.switch__input:focus-visible ~ .switch__track {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.switch__thumb {
		box-sizing: border-box;
		position: absolute;
		left: var(--_padding);
		border: var(--_switch-thumb-border-width) solid var(--_switch-thumb-border-color);
		border-radius: 50%;
		background-color: var(--_switch-thumb-background-color);
		width: var(--_thumb-size);
		height: var(--_thumb-size);
		transition: width var(--_transition-duration) ease, height var(--_transition-duration) ease, left var(--_transition-duration) ease, background-color var(--_transition-duration) ease, border-color var(--_transition-duration) ease;
		will-change: width, height, left;
	}

	.switch__input:checked ~ .switch__track .switch__thumb {
		left: calc(var(--_track-width) - var(--_switch-thumb-border-width) * 2 - var(--_thumb-size) - var(--_padding) * 2);
		border-color: var(--_switch-is-selected-thumb-background-color);
		background-color: var(--_switch-is-selected-thumb-background-color);
		width: calc(var(--_thumb-size) + var(--_padding) * 2);
		height: calc(var(--_thumb-size) + var(--_padding) * 2);
	}

	.switch__check {
		display: flex;
		position: absolute;
		top: 50%;
		left: 50%;
		opacity: 0;
		pointer-events: none;
		width: calc(100% + var(--_switch-thumb-border-width) * 2);
		height: calc(100% + var(--_switch-thumb-border-width) * 2);
		align-items: center;
		justify-content: center;
		color: var(--_switch-is-selected-background-color);
		transform: translate(-50%, -50%);
		transition: opacity var(--_transition-duration) ease;
	}

	.switch__input:checked ~ .switch__track .switch__check {
		opacity: 1;
	}
`;
