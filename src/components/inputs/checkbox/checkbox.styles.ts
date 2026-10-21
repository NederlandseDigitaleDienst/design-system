import { css } from 'lit';

export const checkboxStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_checkbox-border-width: var(--primitives-border-width-regular);
		--_checkbox-border-color: light-dark(var(--primitives-color-neutral-550), var(--primitives-color-neutral-650));
		--_checkbox-background-color: var(--semantics-surfaces-base-background-color);
		--_checkbox-is-selected-border-color: var(--context-selected-indicator-color, var(--semantics-controls-is-selected-indicator-color));
		--_checkbox-is-selected-background-color: var(--context-selected-indicator-color, var(--semantics-controls-is-selected-indicator-color));
		--_checkbox-is-selected-icon-color: var(--context-selected-contrast-color, var(--semantics-controls-is-selected-mark-color));
		--_checkbox-is-hovered-border-color: light-dark(var(--primitives-color-neutral-600), var(--primitives-color-neutral-700));
		--_checkbox-is-selected-is-hovered-border-color: var(--context-selected-indicator-color, var(--semantics-controls-is-selected-is-hovered-indicator-color));
		--_checkbox-is-selected-is-hovered-background-color: var(--context-selected-indicator-color, var(--semantics-controls-is-selected-is-hovered-indicator-color));
		--_checkbox-is-selected-is-hovered-icon-color: var(--context-selected-contrast-color, var(--semantics-controls-is-selected-mark-color));
		--_checkbox-is-active-border-color: light-dark(var(--primitives-color-neutral-650), var(--primitives-color-neutral-750));
		--_checkbox-is-selected-is-active-border-color: var(--context-selected-indicator-color, var(--semantics-controls-is-selected-is-active-indicator-color));
		--_checkbox-is-selected-is-active-background-color: var(--context-selected-indicator-color, var(--semantics-controls-is-selected-is-active-indicator-color));
		--_checkbox-is-selected-is-active-icon-color: var(--context-selected-contrast-color, var(--semantics-controls-is-selected-mark-color));

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


	/* ## Colors */

	:host([color="inherit"]) {
		--_checkbox-border-color: currentColor;
		--_checkbox-background-color: transparent;
		--_checkbox-is-hovered-border-color: currentColor;
		--_checkbox-is-active-border-color: currentColor;
		--_checkbox-is-selected-border-color: currentColor;
		--_checkbox-is-selected-background-color: currentColor;
		--_checkbox-is-selected-icon-color: currentColor;
		--_checkbox-is-selected-is-hovered-border-color: currentColor;
		--_checkbox-is-selected-is-hovered-background-color: currentColor;
		--_checkbox-is-selected-is-hovered-icon-color: currentColor;
		--_checkbox-is-selected-is-active-border-color: currentColor;
		--_checkbox-is-selected-is-active-background-color: currentColor;
		--_checkbox-is-selected-is-active-icon-color: currentColor;
	}

	:host([color="inherit"]) .checkbox__box {
		color: inherit;
	}

	:host([color="inherit"]) :is(.checkbox__check-icon, .checkbox__indeterminate-icon) {
		color: var(--context-parent-background-color, var(--semantics-content-contrast-color));
	}


	/* # Elements */

	.checkbox__input {
		position: absolute;
		inset: 0;
		opacity: 0;
		z-index: 1;
		margin: 0;
		width: 100%;
		height: 100%;
	}

	.checkbox__box {
		box-sizing: border-box;
		position: relative;
		border: var(--_checkbox-border-width) solid var(--_checkbox-border-color);
		border-radius: var(--semantics-controls-xs-corner-radius);
		background-color: var(--_checkbox-background-color);
		width: var(--semantics-controls-xs-min-size);
		height: var(--semantics-controls-xs-min-size);
		color: transparent;
	}

	.checkbox__input:checked ~ .checkbox__box,
	.checkbox__input:indeterminate ~ .checkbox__box {
		border-color: var(--_checkbox-is-selected-border-color);
		background-color: var(--_checkbox-is-selected-background-color);
		color: var(--_checkbox-is-selected-icon-color);
	}

	@media (hover: hover) {
		.checkbox__input:hover:not(:disabled) ~ .checkbox__box {
			border-color: var(--_checkbox-is-hovered-border-color);
		}

		.checkbox__input:checked:hover:not(:disabled) ~ .checkbox__box,
		.checkbox__input:indeterminate:hover:not(:disabled) ~ .checkbox__box {
			border-color: var(--_checkbox-is-selected-is-hovered-border-color);
			background-color: var(--_checkbox-is-selected-is-hovered-background-color);
			color: var(--_checkbox-is-selected-is-hovered-icon-color);
		}
	}

	.checkbox__input:active:not(:disabled) ~ .checkbox__box {
		border-color: var(--_checkbox-is-active-border-color);
	}

	.checkbox__input:checked:active:not(:disabled) ~ .checkbox__box,
	.checkbox__input:indeterminate:active:not(:disabled) ~ .checkbox__box {
		border-color: var(--_checkbox-is-selected-is-active-border-color);
		background-color: var(--_checkbox-is-selected-is-active-background-color);
		color: var(--_checkbox-is-selected-is-active-icon-color);
	}

	.checkbox__input:focus-visible ~ .checkbox__box {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.checkbox__input:disabled ~ .checkbox__box {
		opacity: var(--primitives-opacity-disabled);
	}

	.checkbox__check-icon,
	.checkbox__indeterminate-icon {
		display: none;
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--primitives-space-24);
		height: var(--primitives-space-24);
		transform: translate(-50%, -50%);
	}

	.checkbox__input:checked ~ .checkbox__box .checkbox__check-icon {
		display: block;
	}

	.checkbox__input:checked:indeterminate ~ .checkbox__box .checkbox__check-icon {
		display: none;
	}

	.checkbox__input:indeterminate ~ .checkbox__box .checkbox__indeterminate-icon {
		display: block;
	}

	/* Decorative has no input to hang :checked on, so the state comes from the
	   host attributes instead. */
	:host([decorative][checked]) .checkbox__box,
	:host([decorative][indeterminate]) .checkbox__box {
		border-color: var(--_checkbox-is-selected-border-color);
		background-color: var(--_checkbox-is-selected-background-color);
		color: var(--_checkbox-is-selected-icon-color);
	}

	:host([decorative][checked]:not([indeterminate])) .checkbox__check-icon {
		display: block;
	}

	:host([decorative][indeterminate]) .checkbox__indeterminate-icon {
		display: block;
	}
`;
