import { css } from 'lit';
import { slottedReset, inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const dropdownStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_dropdown-width: 100%;
		--_dropdown-corner-radius: var(--semantics-controls-md-corner-radius);
		--_dropdown-min-size: var(--semantics-controls-md-min-size);
		--_dropdown-inline-padding: var(--semantics-controls-md-inline-padding);
		--_dropdown-text-font: var(--semantics-input-fields-md-text-font);
		--_dropdown-validation-icon-area-padding-right: var(--primitives-space-4);
		--_dropdown-validation-icon-size: var(--semantics-input-fields-md-validation-icon-size);
		--_dropdown-picker-icon-size: var(--primitives-space-24);
		--_dropdown-picker-area: calc((var(--_dropdown-min-size) + var(--_dropdown-picker-icon-size)) / 2);
		--_dropdown-end-inset: var(--_dropdown-picker-area);
		--_dropdown-fade-size: var(--primitives-space-24);
		--_dropdown-background-color: var(--semantics-buttons-neutral-tinted-background-color);
		--_dropdown-content-color: var(--semantics-buttons-neutral-tinted-content-color);
		--_dropdown-is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
		--_dropdown-is-hovered-content-color: var(--semantics-buttons-neutral-tinted-is-hovered-content-color);
		--_dropdown-is-active-background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		--_dropdown-is-active-content-color: var(--semantics-buttons-neutral-tinted-is-active-content-color);
		--_dropdown-highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);
		--_dropdown-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-hovered-highlight-border-color);
		--_dropdown-is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-active-highlight-border-color);
		--_dropdown-is-expanded-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-expanded-highlight-border-color);

		${inheritedTextReset}
		display: block;
		width: var(--_dropdown-width);
		max-width: 100%;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([valid]),
	:host([invalid]) {
		--_dropdown-end-inset: calc(var(--_dropdown-picker-area) + var(--_dropdown-validation-icon-size) + var(--_dropdown-validation-icon-area-padding-right));
	}

	:host([size="xs"]) {
		--_dropdown-corner-radius: var(--semantics-controls-xs-corner-radius);
		--_dropdown-min-size: var(--semantics-controls-xs-min-size);
		--_dropdown-inline-padding: var(--semantics-controls-xs-inline-padding);
		--_dropdown-text-font: var(--semantics-input-fields-xs-text-font);
		--_dropdown-validation-icon-area-padding-right: var(--primitives-space-0);
		--_dropdown-validation-icon-size: var(--semantics-input-fields-xs-validation-icon-size);
		--_dropdown-picker-icon-size: var(--primitives-space-16);
	}

	:host([size="sm"]) {
		--_dropdown-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_dropdown-min-size: var(--semantics-controls-sm-min-size);
		--_dropdown-inline-padding: var(--semantics-controls-sm-inline-padding);
		--_dropdown-text-font: var(--semantics-input-fields-sm-text-font);
		--_dropdown-validation-icon-area-padding-right: var(--primitives-space-2);
		--_dropdown-validation-icon-size: var(--semantics-input-fields-sm-validation-icon-size);
		--_dropdown-picker-icon-size: var(--primitives-space-20);
	}

	:host([expanded]) {
		--_dropdown-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-background-color);
		--_dropdown-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-content-color);
		--_dropdown-is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-background-color);
		--_dropdown-is-hovered-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-content-color);
		--_dropdown-is-active-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-background-color);
		--_dropdown-is-active-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-content-color);
		--_dropdown-highlight-border-color: var(--_dropdown-is-expanded-highlight-border-color);
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}


	/* # Block */

	.dropdown {
		box-sizing: border-box;
		display: flex;
		position: relative;
		border-radius: var(--_dropdown-corner-radius);
		background-color: var(--_dropdown-background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_dropdown-highlight-border-color);
		width: 100%;
		min-height: var(--_dropdown-min-size);
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		color: var(--_dropdown-content-color);
		transition:
			background-color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default),
			color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default)
		;
	}

	.dropdown:hover {
		@media (hover: hover) {
			background-color: var(--_dropdown-is-hovered-background-color);
			color: var(--_dropdown-is-hovered-content-color);
		}
	}

	@media (hover: hover) {
		.dropdown:hover {
			--_dropdown-highlight-border-color: var(--_dropdown-is-hovered-highlight-border-color);
		}
	}

	.dropdown:active {
		background-color: var(--_dropdown-is-active-background-color);
		color: var(--_dropdown-is-active-content-color);
		--_dropdown-highlight-border-color: var(--_dropdown-is-active-highlight-border-color);
	}

	.dropdown:focus-within {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), inset 0 0 0 var(--primitives-border-width-thin) var(--_dropdown-highlight-border-color);
	}

	:host([is-pointer-focus]) .dropdown:focus-within {
		outline: none;
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_dropdown-highlight-border-color);
	}

	@media (prefers-reduced-motion: reduce) {
		.dropdown {
			transition: none;
		}
	}


	/* # Elements */

	::slotted(select) {
		${slottedReset}
		${inheritedTextReset}
		box-sizing: border-box !important;
		position: absolute !important;
		inset: 0 !important;
		overflow: hidden !important;
		margin: 0 !important;
		outline: none !important;
		border: none !important;
		background: transparent !important;
		width: 100% !important;
		height: 100% !important;
		padding-block: 0 !important;
		padding-inline: var(--_dropdown-inline-padding) var(--_dropdown-end-inset) !important;
		color: inherit !important;
		font: var(--_dropdown-text-font) !important;
		white-space: nowrap !important;
		appearance: none !important;
		/* WebKit lets select text run through its end padding and has no ellipsis
		   there, so every browser fades the text out before the icons instead. */
		mask-image: linear-gradient(to left, transparent var(--_dropdown-end-inset), black calc(var(--_dropdown-end-inset) + var(--_dropdown-fade-size))) !important;
	}

	:host([size="xs"]) ::slotted(select) {
		/* iOS Safari zooms in on a select below 16px when it gets focus. */
		@media (pointer: coarse) {
			font: var(--semantics-input-fields-native-select-font) !important;
		}
	}

	.dropdown__validation-icon-area {
		display: flex;
		height: 100%;
		padding-right: var(--_dropdown-validation-icon-area-padding-right);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	:host([valid]) .dropdown__validation-icon-area {
		color: var(--semantics-input-fields-is-valid-icon-color);
	}

	:host([invalid]) .dropdown__validation-icon-area {
		color: var(--semantics-input-fields-is-invalid-icon-color);
	}

	.dropdown__validation-icon {
		width: var(--_dropdown-validation-icon-size);
		height: var(--_dropdown-validation-icon-size);
	}

	.dropdown__picker-icon {
		display: flex;
		width: var(--_dropdown-picker-icon-size);
		height: var(--_dropdown-picker-icon-size);
		padding-right: calc((var(--_dropdown-min-size) - var(--_dropdown-picker-icon-size)) / 2);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		color: inherit;
	}
`;
