import { css } from 'lit';

export const barSplitViewStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_bar-split-view-background-color: var(--context-parent-background-color, var(--semantics-surfaces-base-background-color));

		display: flex;
		background-color: var(--_bar-split-view-background-color);
		width: 100%;
		height: 100%;
		flex-direction: column;
	}

	:host([hidden]) {
		display: none;
	}

	:host([background="base"]) {
		--context-parent-background-color: var(--semantics-surfaces-base-background-color);
		--_bar-split-view-background-color: var(--context-parent-background-color);
	}

	:host([background="tinted"]) {
		--context-parent-background-color: var(--semantics-surfaces-tinted-background-color);
		--_bar-split-view-background-color: var(--context-parent-background-color);
	}

	/* Root-scroll mode: the document scrolls (ScrollModeController /
	   --context-scroll-mode). Bars become sticky layers that stay put while the
	   main content scrolls under them; their measured heights are published into
	   --context-inset-top/bottom (see bar-split-view.ts) so a descendant
	   nldd-page's sticky header/footer stack below/above them. The sticky insets
	   and those offsets are set by JS; bars paint above the content. */
	:host([data-scroll="root"]) {
		height: auto;
	}


	/* # Block */

	.bar-split-view {
		display: flex;
		min-width: 0;
		min-height: 0;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* Root-scroll mode: flow wrappers must be content-sized (not flex-basis:0) so
	   their border box spans the whole document. Otherwise a sticky bar's
	   containing block is only as tall as the initial viewport fill and the bar
	   un-sticks partway down. */
	:host([data-scroll="root"]) .bar-split-view {
		flex-basis: auto;
		flex-shrink: 0;
	}


	/* # Elements */

	.bar-split-view__bar {
		display: flex;
		min-width: 0;
		overflow: hidden;
		flex-direction: column;
		flex-shrink: 0;
	}

	:host([data-scroll="root"]) .bar-split-view__bar {
		overflow: visible;
		/* Sticky bars sit over the scrolling document, so they need an opaque
		   background to occlude the content passing beneath them. */
		background-color: var(--_bar-split-view-background-color);
	}

	/* Root-scroll mode: top/bottom bars stick; JS sets their top/bottom insets. */
	:host([data-scroll="root"]) .bar-split-view__bar--top,
	:host([data-scroll="root"]) .bar-split-view__bar--bottom {
		position: sticky;
		z-index: 3;
	}

	.bar-split-view__divider {
		flex-shrink: 0;
	}

	/* Root-scroll mode: the seam divider sticks too, riding with its bar instead
	   of scrolling away with the content. */
	:host([data-scroll="root"]) .bar-split-view__divider {
		position: sticky;
		z-index: 3;
	}

	.bar-split-view__main {
		display: flex;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	:host([data-scroll="root"]) .bar-split-view__main {
		overflow: visible;
		flex-basis: auto;
		flex-shrink: 0;
	}

	/* Only the main pane grows to fill remaining space; bar panes size to
	 * their content. Without this scoping a bar's slotted content gets
	 * flex-basis: 0 and collapses (the old 'flex: 1' shorthand expanded
	 * to 'flex: 1 1 0%', where % resolved to 'auto' inside the
	 * height-indeterminate bar wrapper — the longhand conversion lost
	 * that nuance, hence this rule). */
	::slotted([slot="main"]) {
		min-height: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* Root-scroll mode: the slotted main layer (a split-view or page) is a COLUMN
	   item of the main column: give it a real content height (flex-basis:auto)
	   that it keeps on tall pages (flex-shrink:0), otherwise its 0 basis collapses
	   the main box and the sticky bars' containing block never spans the document. */
	:host([data-scroll="root"]) ::slotted([slot="main"]) {
		flex-basis: auto;
		flex-shrink: 0;
	}
`;
