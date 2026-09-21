import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

const mdMin = unsafeCSS(breakpoints.mdMin);

export const modalDialogStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_max-height: 90vh;
		--_animation-duration: 150ms;
		--_animation-easing: ease;

		${inheritedTextReset}
		display: contents;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.modal-dialog {
		/* Where the app's layout context ends, as in nldd-sheet: the dialog scrolls
		   itself and starts at its own top edge, so anything inside it stops
		   following the app's scroll mode and its insets. */
		--context-scroll-mode: nested;
		--context-inset-top: 0px;
		--context-inset-bottom: 0px;

		box-sizing: border-box;
		outline: none;
		border: none;
		border-radius: var(--semantics-overlays-corner-radius);
		box-shadow: var(--semantics-overlays-box-shadow);
		background-color: var(--semantics-surfaces-base-background-color);
		width: calc(100% - var(--primitives-space-16) * 2);
		max-width: var(--primitives-area-480);
		max-height: var(--_max-height);
		overflow-y: auto;
		padding: var(--primitives-space-16);

		@media (min-width: ${mdMin}) {
			padding: var(--primitives-space-24);
		}
	}

	.modal-dialog:not([open]) {
		display: none;
	}

	.modal-dialog:focus-visible:not(.is-pointer-focus) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), var(--semantics-overlays-box-shadow);
	}

	.modal-dialog::backdrop {
		background: var(--semantics-overlays-backdrop-color);
	}

	.modal-dialog[open] {
		animation: modal-dialog-in var(--_animation-duration) var(--_animation-easing) backwards;
	}

	.modal-dialog.is-closing {
		animation: modal-dialog-out var(--_animation-duration) var(--_animation-easing) both;
	}

	@media (prefers-reduced-motion: reduce) {
		.modal-dialog[open],
		.modal-dialog.is-closing {
			animation: none;
		}
	}


	/* # Keyframes */

	@keyframes modal-dialog-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes modal-dialog-out {
		from {
			opacity: 1;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(0.95);
		}
	}
`;
