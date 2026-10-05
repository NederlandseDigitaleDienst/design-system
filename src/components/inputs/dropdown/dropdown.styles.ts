import { css } from 'lit';
import { slottedReset, inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const dropdownStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_width: 100%;
		--_corner-radius: var(--semantics-controls-md-corner-radius);
		--_min-size: var(--semantics-controls-md-min-size);
		--_inline-padding: var(--semantics-controls-md-inline-padding);
		--_text-font: var(--semantics-input-fields-md-text-font);
		--_validation-icon-area-padding-right: var(--primitives-space-4);
		--_validation-icon-size: var(--semantics-input-fields-md-validation-icon-size);
		--_picker-icon-size: var(--primitives-space-24);
		--_picker-area: calc((var(--_min-size) + var(--_picker-icon-size)) / 2);
		--_end-inset: var(--_picker-area);
		--_fade-size: var(--primitives-space-24);
		--_background-color: var(--semantics-buttons-neutral-tinted-background-color);
		--_content-color: var(--semantics-buttons-neutral-tinted-content-color);
		--_is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
		--_is-hovered-content-color: var(--semantics-buttons-neutral-tinted-is-hovered-content-color);
		--_is-active-background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		--_is-active-content-color: var(--semantics-buttons-neutral-tinted-is-active-content-color);
		--_highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-hovered-highlight-border-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-active-highlight-border-color);
		--_is-expanded-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-expanded-highlight-border-color);

		${inheritedTextReset}
		display: block;
		width: var(--_width);
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
		--_end-inset: calc(var(--_picker-area) + var(--_validation-icon-size) + var(--_validation-icon-area-padding-right));
	}

	:host([size="xs"]) {
		--_corner-radius: var(--semantics-controls-xs-corner-radius);
		--_min-size: var(--semantics-controls-xs-min-size);
		--_inline-padding: var(--semantics-controls-xs-inline-padding);
		--_text-font: var(--semantics-input-fields-xs-text-font);
		--_validation-icon-area-padding-right: var(--primitives-space-0);
		--_validation-icon-size: var(--semantics-input-fields-xs-validation-icon-size);
		--_picker-icon-size: var(--primitives-space-16);
	}

	:host([size="sm"]) {
		--_corner-radius: var(--semantics-controls-sm-corner-radius);
		--_min-size: var(--semantics-controls-sm-min-size);
		--_inline-padding: var(--semantics-controls-sm-inline-padding);
		--_text-font: var(--semantics-input-fields-sm-text-font);
		--_validation-icon-area-padding-right: var(--primitives-space-2);
		--_validation-icon-size: var(--semantics-input-fields-sm-validation-icon-size);
		--_picker-icon-size: var(--primitives-space-20);
	}

	:host([expanded]) {
		--_background-color: var(--semantics-buttons-neutral-tinted-is-expanded-background-color);
		--_content-color: var(--semantics-buttons-neutral-tinted-is-expanded-content-color);
		--_is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-background-color);
		--_is-hovered-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-content-color);
		--_is-active-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-background-color);
		--_is-active-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-content-color);
		--_highlight-border-color: var(--_is-expanded-highlight-border-color);
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
		border-radius: var(--_corner-radius);
		background-color: var(--_background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
		width: 100%;
		min-height: var(--_min-size);
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		color: var(--_content-color);
		transition:
			background-color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default),
			color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default)
		;
	}

	.dropdown:hover {
		@media (hover: hover) {
			background-color: var(--_is-hovered-background-color);
			color: var(--_is-hovered-content-color);
		}
	}

	@media (hover: hover) {
		.dropdown:hover {
			--_highlight-border-color: var(--_is-hovered-highlight-border-color);
		}
	}

	.dropdown:active {
		background-color: var(--_is-active-background-color);
		color: var(--_is-active-content-color);
		--_highlight-border-color: var(--_is-active-highlight-border-color);
	}

	.dropdown:focus-within {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
	}

	:host([is-pointer-focus]) .dropdown:focus-within {
		outline: none;
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
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
		padding-inline: var(--_inline-padding) var(--_end-inset) !important;
		color: inherit !important;
		font: var(--_text-font) !important;
		white-space: nowrap !important;
		appearance: none !important;
		/* WebKit lets select text run through its end padding and has no ellipsis
		   there, so every browser fades the text out before the icons instead. */
		mask-image: linear-gradient(to left, transparent var(--_end-inset), black calc(var(--_end-inset) + var(--_fade-size))) !important;
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
		padding-right: var(--_validation-icon-area-padding-right);
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
		width: var(--_validation-icon-size);
		height: var(--_validation-icon-size);
	}

	.dropdown__picker-icon {
		display: flex;
		width: var(--_picker-icon-size);
		height: var(--_picker-icon-size);
		padding-right: calc((var(--_min-size) - var(--_picker-icon-size)) / 2);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		color: inherit;
	}
`;
