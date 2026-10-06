import { css } from 'lit';

export const radioButtonStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_radio-button-border-width: var(--primitives-border-width-regular);
		--_radio-button-border-color: light-dark(var(--primitives-color-neutral-550), var(--primitives-color-neutral-650));
		--_radio-button-background-color: var(--semantics-surfaces-base-background-color);
		--_radio-button-is-selected-inner-shape-border-width: var(--primitives-border-width-regular);
		--_radio-button-is-selected-inner-shape-border-color: var(--semantics-controls-is-highlighted-contrast-color);
		--_radio-button-is-selected-border-color: var(--semantics-controls-is-highlighted-indicator-color);
		--_radio-button-is-selected-background-color: var(--semantics-controls-is-highlighted-indicator-color);
		--_radio-button-is-hovered-border-color: light-dark(var(--primitives-color-neutral-600), var(--primitives-color-neutral-700));
		--_radio-button-is-selected-is-hovered-border-color: var(--semantics-controls-is-highlighted-is-hovered-indicator-color);
		--_radio-button-is-selected-is-hovered-background-color: var(--semantics-controls-is-highlighted-is-hovered-indicator-color);
		--_radio-button-is-selected-is-hovered-inner-shape-border-color: var(--semantics-controls-is-highlighted-is-hovered-contrast-color);
		--_radio-button-is-active-border-color: light-dark(var(--primitives-color-neutral-650), var(--primitives-color-neutral-750));
		--_radio-button-is-selected-is-active-border-color: var(--semantics-controls-is-highlighted-is-active-indicator-color);
		--_radio-button-is-selected-is-active-background-color: var(--semantics-controls-is-highlighted-is-active-indicator-color);
		--_radio-button-is-selected-is-active-inner-shape-border-color: var(--semantics-controls-is-highlighted-is-active-contrast-color);

		display: inline-flex;
		position: relative;
		width: var(--semantics-controls-xs-min-size);
		height: var(--semantics-controls-xs-min-size);
		align-items: center;
		justify-content: center;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Elements */

	.radio-button__outer-shape {
		box-sizing: border-box;
		position: relative;
		border: var(--_radio-button-border-width) solid var(--_radio-button-border-color);
		border-radius: 50%;
		background-color: var(--_radio-button-background-color);
		width: var(--semantics-controls-xs-min-size);
		height: var(--semantics-controls-xs-min-size);
	}

	.radio-button__inner-shape {
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left: 50%;
		border: var(--_radio-button-is-selected-inner-shape-border-width) solid var(--_radio-button-is-selected-inner-shape-border-color);
		border-radius: 50%;
		width: var(--primitives-space-20);
		height: var(--primitives-space-20);
		transform: translate(-50%, -50%) scale(0);
	}

	:host([checked]) .radio-button__outer-shape {
		border-color: var(--_radio-button-is-selected-border-color);
		background-color: var(--_radio-button-is-selected-background-color);
	}

	:host([checked]) .radio-button__inner-shape {
		transform: translate(-50%, -50%) scale(1);
	}

	@media (hover: hover) {
		:host(:hover:not([disabled])) .radio-button__outer-shape {
			border-color: var(--_radio-button-is-hovered-border-color);
		}

		:host([checked]:hover:not([disabled])) .radio-button__outer-shape {
			border-color: var(--_radio-button-is-selected-is-hovered-border-color);
			background-color: var(--_radio-button-is-selected-is-hovered-background-color);
		}

		:host([checked]:hover:not([disabled])) .radio-button__inner-shape {
			border-color: var(--_radio-button-is-selected-is-hovered-inner-shape-border-color);
		}
	}

	:host(:active:not([disabled])) .radio-button__outer-shape {
		border-color: var(--_radio-button-is-active-border-color);
	}

	:host([checked]:active:not([disabled])) .radio-button__outer-shape {
		border-color: var(--_radio-button-is-selected-is-active-border-color);
		background-color: var(--_radio-button-is-selected-is-active-background-color);
	}

	:host([checked]:active:not([disabled])) .radio-button__inner-shape {
		border-color: var(--_radio-button-is-selected-is-active-inner-shape-border-color);
	}

	:host(:focus-visible) {
		outline: none;
	}

	:host(:focus-visible) .radio-button__outer-shape,
	:host([focus-ring]) .radio-button__outer-shape {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	:host([disabled]) .radio-button__outer-shape {
		opacity: var(--primitives-opacity-disabled);
	}
`;
