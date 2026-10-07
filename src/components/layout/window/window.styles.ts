import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const windowStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_window-default-width: var(--primitives-area-640);

		${inheritedTextReset}
		/* contents, not block: the window is a position:fixed <dialog>, so the host
		   would only add an empty box. As a block it is a flex item like any other
		   and grows with its siblings, taking space from them. Same reason as
		   nldd-sheet and nldd-modal-dialog. */
		display: contents;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.window {
		display: flex;
		position: fixed;
		margin: auto;
		outline: none;
		border: none;
		border-radius: var(--semantics-overlays-corner-radius);
		box-shadow: var(--semantics-overlays-box-shadow);
		background-color: var(--semantics-surfaces-base-background-color);
		width: var(--_window-default-width);
		max-width: calc(100vw - var(--semantics-overlays-inset) * 2);
		max-height: calc(100dvh - var(--semantics-overlays-inset) * 2);
		overflow: hidden;
		padding: 0;
		flex-direction: column;
	}

	.window:not([open]) {
		display: none;
	}

	.window:focus-visible:not(.is-pointer-focus) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), var(--semantics-overlays-box-shadow);
	}

	.window::backdrop {
		background-color: var(--semantics-overlays-backdrop-color);
	}


	/* # Elements */

	.window__body {
		display: flex;
		min-height: 0;
		width: 100%;
		flex-direction: column;
		flex-grow: 1;
	}

	::slotted(*) {
		min-height: 0;
	}
`;
