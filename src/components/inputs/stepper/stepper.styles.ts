import { css } from 'lit';

export const stepperStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_stepper-corner-radius: var(--semantics-controls-md-corner-radius);
		--_stepper-divider-length: var(--semantics-buttons-md-divider-length);
		--_stepper-highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);

		display: inline-flex;
		isolation: isolate;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="xs"]) {
		--_stepper-corner-radius: var(--semantics-controls-xs-corner-radius);
		--_stepper-divider-length: var(--semantics-buttons-xs-divider-length);
	}

	:host([size="sm"]) {
		--_stepper-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_stepper-divider-length: var(--semantics-buttons-sm-divider-length);
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	:host([disabled]) nldd-icon-button {
		opacity: 1;
	}


	/* # Block */

	.stepper {
		display: inline-flex;
		position: relative;
		border-radius: var(--_stepper-corner-radius);
		background-color: var(--semantics-buttons-neutral-tinted-background-color);
		flex-direction: row;
		align-items: center;
	}

	.stepper::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_stepper-highlight-border-color);
		pointer-events: none;
	}

	.stepper:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* # Elements */

	.stepper__divider {
		background-color: var(--semantics-buttons-neutral-tinted-divider-color);
		width: var(--semantics-dividers-thickness);
		height: var(--_stepper-divider-length);
		flex-shrink: 0;
	}

	nldd-icon-button:focus-within {
		position: relative;
		z-index: 1;
	}
`;
