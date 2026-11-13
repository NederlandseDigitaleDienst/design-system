import { css } from 'lit';
import { surfaceContent } from '../../../../assets/styles/shadow-resets.js';

export const stackedSplitViewStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_stacked-split-view-background-color: var(--context-background-color);
		/* Pane min-height — read by JS via getComputedStyle in firstUpdated */
		--_stacked-split-view-pane-min-height: var(--primitives-area-200);

		display: flex;
		background-color: var(--_stacked-split-view-background-color);
		width: 100%;
		height: 100%;
		flex-direction: column;
	}

	:host([hidden]) {
		display: none;
	}

	/* Root-scroll mode — flow with the content instead of capping at the viewport
	   (see ScrollModeController / --context-scroll-mode). */
	:host([data-scroll="root"]) {
		height: auto;
	}

	:host([background="base"]) {
		--context-background-color: var(--semantics-surfaces-base-background-color);
		${surfaceContent}
		--_stacked-split-view-background-color: var(--context-background-color);
	}

	:host([background="tinted"]) {
		--context-background-color: var(--semantics-surfaces-tinted-background-color);
		${surfaceContent}
		--_stacked-split-view-background-color: var(--context-background-color);
	}


	/* # Block */

	.stacked-split-view {
		display: flex;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* Column block, so both the clipping and the column-axis sizing change. */
	:host([data-scroll="root"]) .stacked-split-view {
		overflow: visible;
		flex-basis: auto;
		flex-shrink: 0;
	}


	/* # Elements */

	.stacked-split-view__pane {
		display: flex;
		min-width: 0;
		min-height: var(--_stacked-split-view-pane-min-height);
		overflow: hidden;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	:host([data-scroll="root"]) .stacked-split-view__pane {
		overflow: visible;
		flex-basis: auto;
		flex-shrink: 0;
	}

	.stacked-split-view__pane[hidden] {
		display: none;
	}

	::slotted(*) {
		min-height: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	:host([data-scroll="root"]) ::slotted(*) {
		flex-basis: auto;
		flex-shrink: 0;
	}
`;
