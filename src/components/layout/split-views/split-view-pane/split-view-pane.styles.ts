import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../../assets/styles/breakpoints.js';

const mdMin = unsafeCSS(breakpoints.mdMin);

export const splitViewPaneStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_split-view-pane-background-color: var(--context-parent-background-color, var(--semantics-surfaces-base-background-color));

		display: flex;
		width: 100%;
		height: 100%;

		@media (min-width: ${mdMin}) {
			background-color: var(--_split-view-pane-background-color);
		}
	}

	:host([hidden]) {
		display: none;
	}

	:host([background="base"]) {
		--context-parent-background-color: var(--semantics-surfaces-base-background-color);
		--_split-view-pane-background-color: var(--context-parent-background-color);
	}

	:host([background="tinted"]) {
		--context-parent-background-color: var(--semantics-surfaces-tinted-background-color);
		--_split-view-pane-background-color: var(--context-parent-background-color);
	}

	:host([hide-back]) {
		--context-back-button-display: none;
	}

	/* Root-scroll mode — flow instead of clipping (see ScrollModeController /
	   --context-scroll-mode) so a slotted nldd-page's sticky layers can stick
	   against the document rather than this pane. */
	:host([data-scroll="root"]) {
		height: auto;
	}


	/* # Block */

	/* flex-basis: auto (not 0) so the pane works in both determinate
	 * parents (main column — grows to fill via flex-grow) AND
	 * indeterminate parents (a bar — auto = content size, no growth
	 * space, stays compact). The old 'flex: 1' shorthand expanded to
	 * 'flex-basis: 0%' which the spec resolves to 'auto' in indeterminate
	 * parents; the longhand conversion lost that nuance and collapsed
	 * panes inside bars. */
	.split-view-pane {
		display: flex;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: auto;
	}

	:host([data-scroll="root"]) .split-view-pane {
		overflow: visible;
	}


	/* # Elements */

	::slotted(*) {
		min-height: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: auto;
	}

	/* Slotted page is a COLUMN item here: keep its content height on tall pages
	   (flex-shrink:0) so its sticky header/footer range spans the document,
	   while still filling a short viewport via flex-grow. */
	:host([data-scroll="root"]) ::slotted(*) {
		flex-basis: auto;
		flex-shrink: 0;
	}
`;
