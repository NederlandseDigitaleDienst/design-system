import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const tokenStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_token-highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);
		--_token-focus-z-index: 1;

		${inheritedTextReset}
		display: inline-block;
		max-width: 100%;
		min-width: 0;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	/* z-index raises the ring above adjacent tokens so it isn't clipped. */
	:host(:focus-visible) {
		position: relative;
		z-index: var(--_token-focus-z-index);
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
		border-radius: var(--semantics-controls-sm-corner-radius);
	}


	/* # Block */

	.token {
		box-sizing: border-box;
		display: inline-flex;
		margin: 0;
		border: none;
		border-radius: var(--semantics-controls-sm-corner-radius);
		background: none;
		background-color: var(--semantics-buttons-neutral-tinted-background-color);
		position: relative;
		height: var(--semantics-controls-sm-min-size);
		max-width: 100%;
		min-width: 0;
		padding: 0 var(--primitives-space-6);
		align-items: center;
		color: var(--semantics-buttons-neutral-tinted-content-color);
		font: var(--semantics-buttons-sm-primary-text-font);
		transition: background-color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default);
		appearance: none;
	}

	.token::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_token-highlight-border-color);
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.token {
			transition: none;
		}
	}

	/* Remove right padding so a trailing icon-button (dismiss or menu) flush-fits the edge. */
	:host([control]) .token {
		padding-right: 0;
	}

	@media (forced-colors: active) {
		.token {
			border: 1px solid CanvasText;
		}
	}


	/* # Elements */

	.token__text {
		display: block;
		padding: 0 var(--primitives-space-2);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Keep the text off a trailing control button (which now shows its own border). */
	:host([control]) .token__text {
		padding-right: var(--primitives-space-6);
	}

	.token__dismiss-action,
	.token__menu-action {
		position: relative;
		flex-shrink: 0;
	}

	/* Lift a focused control's ring above the token's highlight border (the ::after
	   box-shadow) and text. :focus-within, not :has(:focus-visible): the focused
	   element sits in the icon-button's own shadow, which :has can't see across. */
	.token__dismiss-action:focus-within,
	.token__menu-action:focus-within {
		z-index: 1;
	}
`;
