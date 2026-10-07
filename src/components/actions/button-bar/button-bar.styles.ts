import { css } from 'lit';

export const buttonBarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_button-bar-corner-radius: var(--semantics-controls-md-corner-radius);
		--_button-bar-background-color: var(--semantics-buttons-neutral-tinted-background-color);
		--_button-bar-size: var(--semantics-controls-md-min-size);
		--_button-bar-divider-color: var(--semantics-buttons-neutral-tinted-divider-color);
		--_button-bar-highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);
		--_button-bar-divider-length: var(--semantics-buttons-md-divider-length);

		display: inline-flex;
		isolation: isolate;
	}

	:host([size="xs"]) {
		--_button-bar-corner-radius: var(--semantics-controls-xs-corner-radius);
		--_button-bar-size: var(--semantics-controls-xs-min-size);
		--_button-bar-divider-length: var(--semantics-buttons-xs-divider-length);
	}

	:host([size="sm"]) {
		--_button-bar-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_button-bar-size: var(--semantics-controls-sm-min-size);
		--_button-bar-divider-length: var(--semantics-buttons-sm-divider-length);
	}

	:host([size="lg"]) {
		--_button-bar-corner-radius: var(--semantics-controls-lg-corner-radius);
		--_button-bar-size: var(--semantics-controls-lg-min-size);
		--_button-bar-divider-length: var(--semantics-buttons-lg-divider-length);
	}

	/* ## Accent Filled (Primary) */

	:host([appearance="accent-filled"]),
	:host([appearance="primary"]) {
		--_button-bar-background-color: var(--semantics-buttons-accent-filled-background-color);
		--_button-bar-divider-color: var(--semantics-buttons-accent-filled-divider-color);
		--_button-bar-highlight-border-color: var(--semantics-buttons-accent-filled-highlight-border-color);
	}

	:host([appearance="neutral-base"]) {
		--_button-bar-background-color: var(--semantics-buttons-neutral-base-background-color);
		--_button-bar-divider-color: var(--semantics-buttons-neutral-base-divider-color);
		--_button-bar-highlight-border-color: var(--semantics-buttons-neutral-base-highlight-border-color);
	}

	/* ## On-color */

	:host([appearance="inherit-tinted"]) {
		--_button-bar-background-color: var(--semantics-buttons-inherit-tinted-background-color);
		--_button-bar-divider-color: var(--semantics-buttons-inherit-tinted-divider-color);
		--_button-bar-highlight-border-color: var(--semantics-buttons-inherit-tinted-highlight-border-color);
		--context-button-background-color: transparent;
	}

	:host([appearance="inherit-filled"]) {
		--_button-bar-background-color: var(--semantics-buttons-inherit-filled-background-color);
		--_button-bar-divider-color: var(--semantics-buttons-inherit-filled-divider-color);
		--_button-bar-highlight-border-color: var(--semantics-buttons-inherit-filled-highlight-border-color);
	}

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	:host([disabled]) ::slotted(nldd-button),
	:host([disabled]) ::slotted(nldd-icon-button) {
		opacity: 1;
	}


	/* # Block */

	.button-bar {
		display: flex;
		position: relative;
		border-radius: var(--_button-bar-corner-radius);
		background-color: var(--_button-bar-background-color);
		height: var(--_button-bar-size);
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}

	.button-bar::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_button-bar-highlight-border-color);
		pointer-events: none;
	}


	/* # Elements */

	.button-bar__divider {
		display: flex;
		height: var(--_button-bar-size);
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.button-bar__divider-line {
		background-color: var(--_button-bar-divider-color);
		width: var(--semantics-dividers-thickness);
		height: var(--_button-bar-divider-length);
	}

	::slotted([data-focused]) {
		position: relative;
		z-index: 1;
	}
`;
