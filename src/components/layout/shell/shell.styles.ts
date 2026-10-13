import { css } from 'lit';

export const shellStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--context-parent-background-color: var(--semantics-surfaces-base-background-color);
		--_shell-background-color: var(--context-parent-background-color);

		display: flex;
		background-color: var(--_shell-background-color);
		width: 100%;
		height: 100%;
	}

	:host([hidden]) {
		display: none;
	}

	:host([background="tinted"]) {
		--context-parent-background-color: var(--semantics-surfaces-tinted-background-color);
		--_shell-background-color: var(--semantics-surfaces-tinted-background-color);
	}

	/* Root-scroll mode — the DOCUMENT scrolls (see ScrollModeController +
	   --context-scroll-mode). The shell is the outermost DS layer, so it grows
	   with its content (min-height fills the viewport for short pages), letting a
	   descendant nldd-page's sticky layers stick against the document. */
	:host([data-scroll="root"]) {
		height: auto;
		min-height: 100dvh;
	}


	/* # Block */

	.shell {
		display: flex;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* Root-scroll mode — row axis untouched (this is a column block but a row item
	   of the host); only stop clipping so descendant sticky layers can escape. */
	:host([data-scroll="root"]) .shell {
		overflow: visible;
	}


	/* # Elements */

	::slotted(*) {
		min-height: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* Root-scroll mode — the slotted layer (bar/split-view or page) is a COLUMN
	   item here, so flex-basis/flex-shrink govern its height: fill the viewport
	   when short (flex-grow), keep its own height when taller (flex-shrink:0), so
	   a definite ancestor height can't squeeze it and cap a descendant sticky
	   layer's range. */
	:host([data-scroll="root"]) ::slotted(*) {
		flex-basis: auto;
		flex-shrink: 0;
	}
`;
