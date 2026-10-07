import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const codeViewerStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_code-viewer-corner-radius: var(--semantics-surfaces-corner-radius);
		--_code-viewer-background-color: var(--semantics-surfaces-tinted-background-color);
		--_code-viewer-border-width: var(--semantics-surfaces-border-width);
		--_code-viewer-border-color: var(--semantics-surfaces-tinted-border-color);
		--_code-viewer-border-shadow: inset 0 0 0 var(--_code-viewer-border-width) var(--_code-viewer-border-color);
		--_code-viewer-block-padding: var(--primitives-space-16);
		--_code-viewer-inline-padding: var(--primitives-space-16);
		--_code-viewer-content-color: var(--semantics-content-color);
		--_code-viewer-font: var(--primitives-font-monospace-sm-regular-snug);
		--_code-viewer-actions-area-padding: var(--primitives-space-8);
		--_code-viewer-actions-area-size: calc(var(--semantics-controls-md-min-size) + var(--_code-viewer-actions-area-padding) * 2);
		--_code-viewer-actions-z-index: 1;

		${inheritedTextReset}
		display: flex;
		position: relative;
		/* Own stacking context so the absolutely-positioned actions button
		   (z-index: var(--_code-viewer-actions-z-index)) stays scoped to the code-viewer
		   and can't paint over other layers on the page. */
		isolation: isolate;
		/* iOS Safari inflates text in wide scrollable blocks (text autosizing);
		   lock the size so code renders at the authored font-size on mobile. */
		-webkit-text-size-adjust: 100%;
		text-size-adjust: 100%;
	}

	:host([hidden]) {
		display: none;
	}

	:host([appearance="box-base"]) {
		--_code-viewer-background-color: var(--semantics-surfaces-base-background-color);
		--_code-viewer-border-color: var(--semantics-surfaces-base-border-color);
	}

	:host([appearance="simple"]) {
		--_code-viewer-corner-radius: 0;
		--_code-viewer-background-color: transparent;
		--_code-viewer-border-color: transparent;
		--_code-viewer-block-padding: 0;
		--_code-viewer-inline-padding: 0;
	}


	/* # Block — CodeMirror (read-only) mounts into .code-viewer */

	.code-viewer {
		box-sizing: border-box;
		position: relative;
		border-radius: var(--_code-viewer-corner-radius);
		/* Inner box-shadow paints the border ring inside the radius
		   without taking layout space — matches nldd-box / nldd-banner.
		   appearance="simple" suppresses the ring via --_code-viewer-border-color. The
		   forced-colors fallback at the bottom restores a real border. */
		box-shadow: var(--_code-viewer-border-shadow);
		background-color: var(--_code-viewer-background-color);
		min-width: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: auto;
		padding: var(--_code-viewer-block-padding) var(--_code-viewer-inline-padding);
		color: var(--_code-viewer-content-color);
		font: var(--_code-viewer-font);
	}

	/* Reserve the actions space only when the copy button actually renders: not
	   opted out (no-copy) and the Clipboard API is usable (copy-unavailable is
	   set by JS when it isn't). Both attributes suppress the button, so both drop
	   the reserved space. */
	:host(:not([no-copy]):not([copy-unavailable])) .code-viewer {
		min-height: var(--_code-viewer-actions-area-size);
		padding-right: var(--_code-viewer-actions-area-size);
	}

	:host([appearance="simple"]:not([no-copy]):not([copy-unavailable])) {
		--_code-viewer-actions-area-padding: 0;
	}

	:host([appearance="simple"]:not([no-copy]):not([copy-unavailable])) .code-viewer {
		min-height: var(--_code-viewer-actions-area-size);
		padding-right: 0;
	}

	/* The horizontally-scrollable region is CodeMirror's scroller; it gets
	   tabindex/role/aria-label from JS when content overflows. Lift the focus
	   ring onto the framed block so it reads as one element. */
	.code-viewer:has(.cm-scroller:focus-visible) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), var(--_code-viewer-border-shadow);
	}

	.cm-content {
		tab-size: 2;
	}

	/* The slot is the declarative content + copy source only; CodeMirror
	   renders the visible, highlighted copy. */
	slot {
		display: none;
	}


	/* # Elements */

	.code-viewer__actions {
		position: absolute;
		top: var(--_code-viewer-actions-area-padding);
		right: var(--_code-viewer-actions-area-padding);
		z-index: var(--_code-viewer-actions-z-index);
	}

	.code-viewer__live-region {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}


	/* # High Contrast
	   forced-colors strips box-shadow, so the inset
	   border ring would disappear. Restore the frame with a real border —
	   same fallback nldd-box, nldd-banner, and nldd-list use. */

	@media (forced-colors: active) {
		:host .code-viewer {
			border: var(--_code-viewer-border-width) solid CanvasText;
		}

		:host([appearance="simple"]) .code-viewer {
			border: none;
		}
	}
`;
