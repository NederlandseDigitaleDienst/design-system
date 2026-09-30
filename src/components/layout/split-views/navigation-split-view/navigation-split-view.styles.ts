import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const navigationSplitViewStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_background-color: var(--context-parent-background-color, var(--semantics-surfaces-base-background-color));
		/* Pane min-widths — read by JS via getComputedStyle in firstUpdated */
		--_primary-sidebar-min-width: var(--primitives-area-320);
		--_secondary-sidebar-min-width: var(--primitives-area-320);
		--_main-min-width: var(--primitives-area-480);
		--_inspector-min-width: var(--primitives-area-320);

		display: flex;
		background-color: var(--_background-color);
		width: 100%;
		height: 100%;
	}

	:host([hidden]) {
		display: none;
	}

	:host([background="base"]) {
		--context-parent-background-color: var(--semantics-surfaces-base-background-color);
		--_background-color: var(--context-parent-background-color);
	}

	:host([background="tinted"]) {
		--context-parent-background-color: var(--semantics-surfaces-tinted-background-color);
		--_background-color: var(--context-parent-background-color);
	}

	/* Root-scroll mode: flow instead of clipping (see ScrollModeController /
	   --context-scroll-mode). Reached in full-stack (one visible pane), so the row
	   wrapper and the visible pane stop clipping and let a slotted nldd-page stick
	   against the document. */
	:host([data-scroll="root"]) {
		height: auto;
	}


	/* # Keyframes */

	@keyframes navigation-split-view-inspector-slide-in {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
	}

	@keyframes navigation-split-view-inspector-slide-out {
		from { transform: translateX(0); }
		to { transform: translateX(100%); }
	}

	@keyframes navigation-split-view-primary-sidebar-slide-in {
		from { transform: translateX(-100%); }
		to { transform: translateX(0); }
	}

	@keyframes navigation-split-view-primary-sidebar-slide-out {
		from { transform: translateX(0); }
		to { transform: translateX(-100%); }
	}

	@keyframes navigation-split-view-slide-in-bottom {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	@keyframes navigation-split-view-slide-out-bottom {
		from { transform: translateY(0); }
		to { transform: translateY(100%); }
	}


	/* # Block */

	.navigation-split-view {
		display: flex;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		flex-direction: row;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* Root-scroll mode: row-axis wrappers — flex-basis/flex-shrink here are the
	   WIDTH (row main axis), so leave them at their nested values; overriding them
	   stops the panes shrinking to the viewport and the split-view never stacks.
	   Only stop clipping so a descendant page's sticky layers escape. Their height
	   comes from the cross-axis stretch of the content-sized main column above. */
	:host([data-scroll="root"]) .navigation-split-view {
		overflow: visible;
	}


	/* # Elements */

	.navigation-split-view__primary-sidebar-pane {
		display: flex;
		min-width: var(--_primary-sidebar-min-width);
		min-height: 0;
		overflow: hidden;
		flex-direction: column;
		flex-shrink: 0;
	}

	.navigation-split-view__secondary-sidebar-pane {
		display: flex;
		min-width: var(--_secondary-sidebar-min-width);
		min-height: 0;
		overflow: hidden;
		flex-direction: column;
		flex-shrink: 0;
	}

	:host([data-scroll="root"]) .navigation-split-view__primary-sidebar-pane,
	:host([data-scroll="root"]) .navigation-split-view__secondary-sidebar-pane {
		overflow: visible;
	}

	.navigation-split-view__main-pane {
		display: flex;
		min-width: var(--_main-min-width);
		min-height: 0;
		overflow: hidden;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	:host([data-scroll="root"]) .navigation-split-view__main-pane {
		overflow: visible;
	}

	/* Full-stack: the single visible pane fills the space, no minimum */
	:host(.full-stack) .navigation-split-view__primary-sidebar-pane,
	:host(.full-stack) .navigation-split-view__secondary-sidebar-pane,
	:host(.full-stack) .navigation-split-view__main-pane {
		min-width: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* Inline sidebar panes suppress their dismiss button */
	.navigation-split-view__primary-sidebar-pane,
	.navigation-split-view__secondary-sidebar-pane {
		--context-dismiss-button-display: none;
	}

	.navigation-split-view__inspector-pane {
		/* Inspector is always dismissable as a sheet, not inline */
		--context-dismiss-button-display: none;

		display: flex;
		min-width: var(--_inspector-min-width);
		min-height: 0;
		overflow: hidden;
		flex-direction: column;
		flex-shrink: 0;
	}

	.navigation-split-view__inspector-sheet {
		display: flex;
		position: fixed;
		margin: 0;
		outline: none;
		border: none;
		box-shadow: var(--semantics-overlays-box-shadow);
		background: var(--semantics-surfaces-base-background-color);
		overflow: hidden;
		padding: 0;
		flex-direction: column;

		@media (max-width: ${smMax}) {
			inset: auto 0 0 0;
			border-radius: var(--semantics-overlays-corner-radius) var(--semantics-overlays-corner-radius) 0 0;
			width: 100%;
			max-width: 100%;
			height: auto;
			max-height: calc(100dvh - var(--semantics-sheets-bottom-top-inset));
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			inset: var(--semantics-overlays-inset) var(--semantics-overlays-inset) var(--semantics-overlays-inset) auto;
			border-radius: var(--semantics-overlays-corner-radius);
			width: var(--semantics-sheets-side-md-width);
			height: calc(100dvh - var(--semantics-overlays-inset) * 2);
		}

		@media (min-width: ${lgMin}) {
			inset: var(--semantics-overlays-inset) var(--semantics-overlays-inset) var(--semantics-overlays-inset) auto;
			border-radius: var(--semantics-overlays-corner-radius);
			width: var(--semantics-sheets-side-lg-width);
			height: calc(100dvh - var(--semantics-overlays-inset) * 2);
		}

		&:focus-visible:not(.is-pointer-focus) {
			outline: var(--semantics-focus-ring-outline);
			outline-offset: var(--semantics-focus-ring-outline-offset);
			box-shadow: var(--semantics-focus-ring-box-shadow), var(--semantics-overlays-box-shadow);
		}

		&:not([open]) {
			display: none;
		}

		&::backdrop {
			background: var(--semantics-overlays-backdrop-color);
		}

		&[open] {
			@media (max-width: ${smMax}) {
				animation: navigation-split-view-slide-in-bottom var(--semantics-sheets-bottom-animation-duration) var(--primitives-transition-easing-default) both;
			}

			@media (min-width: ${mdMin}) {
				animation: navigation-split-view-inspector-slide-in var(--semantics-sheets-side-animation-duration) var(--primitives-transition-easing-default) both;
			}
		}

		&.is-closing {
			@media (max-width: ${smMax}) {
				animation: navigation-split-view-slide-out-bottom var(--semantics-sheets-bottom-animation-duration) var(--primitives-transition-easing-default) both;
			}

			@media (min-width: ${mdMin}) {
				animation: navigation-split-view-inspector-slide-out var(--semantics-sheets-side-animation-duration) var(--primitives-transition-easing-default) both;
			}
		}
	}

	.navigation-split-view__inspector-sheet-body {
		display: flex;
		width: 100%;
		min-height: 0;
		flex-direction: column;
		flex-grow: 1;
	}

	.navigation-split-view__primary-sidebar-sheet {
		display: flex;
		position: fixed;
		margin: 0;
		outline: none;
		border: none;
		box-shadow: var(--semantics-overlays-box-shadow);
		background: var(--semantics-surfaces-base-background-color);
		overflow: hidden;
		padding: 0;
		flex-direction: column;

		@media (max-width: ${smMax}) {
			inset: auto 0 0 0;
			border-radius: var(--semantics-overlays-corner-radius) var(--semantics-overlays-corner-radius) 0 0;
			width: 100%;
			max-width: 100%;
			height: auto;
			max-height: calc(100dvh - var(--semantics-sheets-bottom-top-inset));
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			inset: var(--semantics-overlays-inset) auto var(--semantics-overlays-inset) var(--semantics-overlays-inset);
			border-radius: var(--semantics-overlays-corner-radius);
			width: var(--semantics-sheets-side-md-width);
			height: calc(100dvh - var(--semantics-overlays-inset) * 2);
		}

		@media (min-width: ${lgMin}) {
			inset: var(--semantics-overlays-inset) auto var(--semantics-overlays-inset) var(--semantics-overlays-inset);
			border-radius: var(--semantics-overlays-corner-radius);
			width: var(--semantics-sheets-side-lg-width);
			height: calc(100dvh - var(--semantics-overlays-inset) * 2);
		}

		&:focus-visible:not(.is-pointer-focus) {
			outline: var(--semantics-focus-ring-outline);
			outline-offset: var(--semantics-focus-ring-outline-offset);
			box-shadow: var(--semantics-focus-ring-box-shadow), var(--semantics-overlays-box-shadow);
		}

		&:not([open]) {
			display: none;
		}

		&::backdrop {
			background: var(--semantics-overlays-backdrop-color);
		}

		&[open] {
			@media (max-width: ${smMax}) {
				animation: navigation-split-view-slide-in-bottom var(--semantics-sheets-bottom-animation-duration) var(--primitives-transition-easing-default) both;
			}

			@media (min-width: ${mdMin}) {
				animation: navigation-split-view-primary-sidebar-slide-in var(--semantics-sheets-side-animation-duration) var(--primitives-transition-easing-default) both;
			}
		}

		&.is-closing {
			@media (max-width: ${smMax}) {
				animation: navigation-split-view-slide-out-bottom var(--semantics-sheets-bottom-animation-duration) var(--primitives-transition-easing-default) both;
			}

			@media (min-width: ${mdMin}) {
				animation: navigation-split-view-primary-sidebar-slide-out var(--semantics-sheets-side-animation-duration) var(--primitives-transition-easing-default) both;
			}
		}
	}

	.navigation-split-view__primary-sidebar-sheet-body {
		/* Show dismiss button inside primary sidebar sheet */
		--context-dismiss-button-display: block;

		display: flex;
		width: 100%;
		min-height: 0;
		flex-direction: column;
		flex-grow: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.navigation-split-view__inspector-sheet[open],
		.navigation-split-view__inspector-sheet.is-closing,
		.navigation-split-view__primary-sidebar-sheet[open],
		.navigation-split-view__primary-sidebar-sheet.is-closing {
			animation: none;
		}
	}

	::slotted(*) {
		min-height: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* A bottom sheet sizes itself from its content (height: auto), so the pane's
	   hypothetical main size IS the sheet's height — and a zero basis fixes that
	   at 0. The sheet then opens as a backdrop with nothing on it, while its
	   content stays in the DOM and keeps taking focus. At md/lg the sheet has a
	   definite height and the zero basis never surfaces, which is why this only
	   shows below 641px. The dialog's max-height still caps a long sheet;
	   flex-shrink then hands the overflow to the pane's own scroll container. */
	@media (max-width: ${smMax}) {
		.navigation-split-view__primary-sidebar-sheet-body slot::slotted(*),
		.navigation-split-view__inspector-sheet-body slot::slotted(*) {
			flex-basis: auto;
		}
	}

	/* Root-scroll mode: slotted pane content is a COLUMN item of the pane: govern
	   its height so it fills a short viewport (flex-grow) but keeps its own height
	   when taller (flex-shrink:0), rather than collapsing to a 0 basis. */
	:host([data-scroll="root"]) ::slotted(*) {
		flex-basis: auto;
		flex-shrink: 0;
	}
`;
