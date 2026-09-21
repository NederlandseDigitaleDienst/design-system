import { css } from 'lit';

export const radioButtonStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
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
		border: var(--components-radio-button-border-width) solid var(--components-radio-button-border-color);
		border-radius: 50%;
		background-color: var(--components-radio-button-background-color);
		width: var(--semantics-controls-xs-min-size);
		height: var(--semantics-controls-xs-min-size);
	}

	.radio-button__inner-shape {
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left: 50%;
		border: var(--components-radio-button-is-selected-inner-shape-border-width) solid var(--components-radio-button-is-selected-inner-shape-border-color);
		border-radius: 50%;
		width: var(--primitives-space-20);
		height: var(--primitives-space-20);
		transform: translate(-50%, -50%) scale(0);
	}

	:host([checked]) .radio-button__outer-shape {
		border-color: var(--components-radio-button-is-selected-border-color);
		background-color: var(--components-radio-button-is-selected-background-color);
	}

	:host([checked]) .radio-button__inner-shape {
		transform: translate(-50%, -50%) scale(1);
	}

	@media (hover: hover) {
		:host(:hover:not([disabled])) .radio-button__outer-shape {
			border-color: var(--components-radio-button-is-hovered-border-color);
		}

		:host([checked]:hover:not([disabled])) .radio-button__outer-shape {
			border-color: var(--components-radio-button-is-selected-is-hovered-border-color);
			background-color: var(--components-radio-button-is-selected-is-hovered-background-color);
		}

		:host([checked]:hover:not([disabled])) .radio-button__inner-shape {
			border-color: var(--components-radio-button-is-selected-is-hovered-inner-shape-border-color);
		}
	}

	:host(:active:not([disabled])) .radio-button__outer-shape {
		border-color: var(--components-radio-button-is-active-border-color);
	}

	:host([checked]:active:not([disabled])) .radio-button__outer-shape {
		border-color: var(--components-radio-button-is-selected-is-active-border-color);
		background-color: var(--components-radio-button-is-selected-is-active-background-color);
	}

	:host([checked]:active:not([disabled])) .radio-button__inner-shape {
		border-color: var(--components-radio-button-is-selected-is-active-inner-shape-border-color);
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
