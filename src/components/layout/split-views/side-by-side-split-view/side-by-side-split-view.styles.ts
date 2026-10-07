import { css } from 'lit';

export const sideBySideSplitViewStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_side-by-side-split-view-background-color: var(--context-parent-background-color, var(--semantics-surfaces-base-background-color));
		/* Pane min-width — read by JS via getComputedStyle in firstUpdated */
		--_side-by-side-split-view-pane-min-width: var(--primitives-area-320);

		display: flex;
		background-color: var(--_side-by-side-split-view-background-color);
		width: 100%;
		height: 100%;
	}

	:host([hidden]) {
		display: none;
	}

	/* Root-scroll mode — the document scrolls, so this view flows with its content
	   instead of capping itself at the viewport (see ScrollModeController /
	   --context-scroll-mode). Without this the panes inside stay boxed at the old
	   height while their own layers already flow, and nothing scrolls anywhere. */
	:host([data-scroll="root"]) {
		height: auto;
	}

	:host([background="base"]) {
		--context-parent-background-color: var(--semantics-surfaces-base-background-color);
		--_side-by-side-split-view-background-color: var(--context-parent-background-color);
	}

	:host([background="tinted"]) {
		--context-parent-background-color: var(--semantics-surfaces-tinted-background-color);
		--_side-by-side-split-view-background-color: var(--context-parent-background-color);
	}


	/* # Block */

	.side-by-side-split-view {
		display: flex;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		flex-direction: row;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* Row axis untouched: this is a row block, so only the clipping and the
	   column-axis sizing change. */
	:host([data-scroll="root"]) .side-by-side-split-view {
		overflow: visible;
		flex-basis: auto;
		flex-shrink: 0;
	}


	/* # Elements */

	.side-by-side-split-view__pane {
		display: flex;
		min-width: var(--_side-by-side-split-view-pane-min-width);
		min-height: 0;
		overflow: hidden;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	:host([data-scroll="root"]) .side-by-side-split-view__pane {
		overflow: visible;
	}

	.side-by-side-split-view__pane[hidden] {
		display: none;
	}

	::slotted(*) {
		min-height: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* Column item inside the pane: keep its content height so a tall page spans
	   the document instead of being squeezed into the old viewport box. */
	:host([data-scroll="root"]) ::slotted(*) {
		flex-basis: auto;
		flex-shrink: 0;
	}
`;
