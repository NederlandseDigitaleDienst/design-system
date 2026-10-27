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
		--_code-viewer-border-width: var(--semantics-surfaces-highlight-border-width);
		--_code-viewer-border-color: var(--semantics-surfaces-tinted-highlight-border-color);
		--_code-viewer-border-shadow: inset 0 0 0 var(--_code-viewer-border-width) var(--_code-viewer-border-color);
		--_code-viewer-block-padding: var(--primitives-space-16);
		--_code-viewer-inline-padding: var(--primitives-space-16);
		--_code-viewer-content-color: var(--semantics-content-color);
		--_code-viewer-font: var(--primitives-font-monospace-sm-regular-snug);
		--_code-viewer-actions-area-padding: var(--primitives-space-8);
		--_code-viewer-actions-area-size: calc(var(--semantics-controls-md-min-size) + var(--_code-viewer-actions-area-padding) * 2);
		--_code-viewer-actions-z-index: 1;
		--_code-viewer-frame-z-index: 1;
		--_code-viewer-max-height: none;
		--_code-viewer-diff-added-background-color: light-dark(var(--primitives-color-success-100), var(--primitives-color-success-200));
		--_code-viewer-diff-added-word-background-color: light-dark(var(--primitives-color-success-250), var(--primitives-color-success-450));
		--_code-viewer-diff-added-word-content-color: light-dark(var(--primitives-color-success-1000), var(--primitives-color-success-975));
		--_code-viewer-diff-added-sign-color: light-dark(var(--primitives-color-success-750), var(--primitives-color-success-800));
		--_code-viewer-diff-removed-background-color: light-dark(var(--primitives-color-critical-100), var(--primitives-color-critical-200));
		--_code-viewer-diff-removed-word-background-color: light-dark(var(--primitives-color-critical-250), var(--primitives-color-critical-450));
		--_code-viewer-diff-removed-word-content-color: light-dark(var(--primitives-color-critical-1000), var(--primitives-color-critical-975));
		--_code-viewer-diff-removed-sign-color: light-dark(var(--primitives-color-critical-750), var(--primitives-color-critical-800));
		--_code-viewer-diff-gutter-color: var(--semantics-content-secondary-color);
		--_code-viewer-diff-row-content-color: light-dark(var(--primitives-color-neutral-950), var(--primitives-color-neutral-975));
		--_code-viewer-diff-row-number-color: light-dark(var(--primitives-color-neutral-750), var(--primitives-color-neutral-850));
		--_code-viewer-diff-gutter-inline-padding: var(--primitives-space-8);
		--_code-viewer-gutter-border-width: var(--semantics-dividers-thickness);
		--_code-viewer-gutter-border-color: var(--semantics-dividers-color);

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
		--_code-viewer-border-color: var(--semantics-surfaces-base-highlight-border-color);
	}

	:host([appearance="simple"]) {
		--_code-viewer-corner-radius: 0;
		--_code-viewer-background-color: transparent;
		--_code-viewer-border-color: transparent;
		--_code-viewer-block-padding: 0;
		--_code-viewer-inline-padding: 0;
	}


	/* # Block — the frame; CodeMirror (read-only) mounts into __codemirror */

	.code-viewer {
		box-sizing: border-box;
		position: relative;
		border-radius: var(--_code-viewer-corner-radius);
		background-color: var(--_code-viewer-background-color);
		min-width: 0;
		overflow: hidden;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: auto;
		color: var(--_code-viewer-content-color);
		font: var(--_code-viewer-font);
	}

	/* The border ring lies over the content, so the sticky gutters and the
	   colored diff rows cannot cover it. Inset, it takes no layout space. */
	.code-viewer::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: var(--_code-viewer-frame-z-index);
		border-radius: inherit;
		box-shadow: var(--_code-viewer-border-shadow);
		pointer-events: none;
	}

	.code-viewer .cm-editor {
		isolation: isolate;
	}

	/* The scroller spans the whole box, so the padding sits on the content
	   inside it. Three classes deep to beat CodeMirror's own theme. */
	.code-viewer .cm-scroller .cm-content {
		padding: var(--_code-viewer-block-padding) var(--_code-viewer-inline-padding);
	}

	:host(:not([no-copy]):not([copy-unavailable])) .code-viewer {
		min-height: var(--_code-viewer-actions-area-size);
	}

	:host(:not([no-copy]):not([copy-unavailable])) .code-viewer .cm-scroller .cm-content {
		padding-right: var(--_code-viewer-actions-area-size);
	}

	:host([appearance="simple"]:not([no-copy]):not([copy-unavailable])) {
		--_code-viewer-actions-area-padding: 0;
	}

	:host([appearance="simple"]:not([no-copy]):not([copy-unavailable])) .code-viewer .cm-scroller .cm-content {
		padding-right: 0;
	}

	/* The horizontally-scrollable region is CodeMirror's scroller; it gets
	   tabindex/role/aria-label from JS when content overflows. Lift the focus
	   ring onto the framed block so it reads as one element. */
	.code-viewer:has(.cm-scroller:focus-visible) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	:host([max-height]) .code-viewer {
		display: flex;
		max-height: var(--_code-viewer-max-height);
		flex-direction: column;
	}

	:host([max-height]) .code-viewer__codemirror {
		display: flex;
		min-height: 0;
		flex-direction: column;
	}

	:host([max-height]) .cm-editor {
		min-height: 0;
	}

	.cm-content {
		tab-size: 2;
	}

	/* # Diff */

	:host([diff]) .code-viewer .cm-scroller .cm-content {
		padding-inline: 0;
	}

	:host([diff]) .cm-line {
		padding-inline: var(--_code-viewer-diff-gutter-inline-padding) var(--_code-viewer-inline-padding);
	}

	:host([diff]:not([no-copy]):not([copy-unavailable])) .code-viewer .cm-scroller .cm-content {
		padding-right: 0;
	}

	:host([diff]:not([no-copy]):not([copy-unavailable])) .cm-line {
		padding-right: var(--_code-viewer-actions-area-size);
	}

	/* The gutters stay put while the code scrolls sideways under them. The
	   divider is a gradient: an inset shadow with an offset leaves a hairline on iOS. */
	:host .cm-gutters.cm-gutters {
		background-color: var(--_code-viewer-background-color);
		background-image: linear-gradient(var(--_code-viewer-gutter-border-color), var(--_code-viewer-gutter-border-color));
		background-repeat: no-repeat;
		background-position: right;
		background-size: var(--_code-viewer-gutter-border-width) 100%;
	}

	:host([diff]) .cm-gutters {
		color: var(--_code-viewer-diff-gutter-color);
	}

	:host([diff]) .cm-diff-gutter .cm-gutterElement {
		padding-inline: var(--_code-viewer-diff-gutter-inline-padding) 0;
		text-align: right;
	}

	:host([diff]) .cm-diff-old-gutter .cm-gutterElement {
		padding-inline-start: var(--_code-viewer-inline-padding);
	}

	:host([diff]) .cm-diff-sign-gutter .cm-gutterElement {
		padding-inline: var(--_code-viewer-diff-gutter-inline-padding);
		text-align: center;
	}

	/* A diff row is three steps from the tinted surface (25 to 100, 75 to 200), so
	   its text takes three steps more as well. Only on the row. */
	:host([diff]) .cm-line:is(.cm-diff-added, .cm-diff-removed) {
		color: var(--_code-viewer-diff-row-content-color);
		--semantics-code-syntax-comment-color: light-dark(var(--primitives-color-neutral-750), var(--primitives-color-neutral-850));
		--semantics-code-syntax-punctuation-color: light-dark(var(--primitives-color-neutral-950), var(--primitives-color-neutral-975));
		--semantics-code-syntax-keyword-color: var(--primitives-color-donkergeel-800);
		--semantics-code-syntax-string-color: var(--primitives-color-groen-800);
		--semantics-code-syntax-number-color: var(--primitives-color-oranje-800);
		--semantics-code-syntax-boolean-color: var(--primitives-color-oranje-800);
		--semantics-code-syntax-null-color: var(--primitives-color-oranje-800);
		--semantics-code-syntax-function-color: var(--primitives-color-lintblauw-800);
		--semantics-code-syntax-class-color: var(--primitives-color-donkergeel-800);
		--semantics-code-syntax-property-color: var(--primitives-color-lintblauw-800);
		--semantics-code-syntax-operator-color: var(--primitives-color-groen-800);
		--semantics-code-syntax-tag-color: var(--primitives-color-groen-800);
		--semantics-code-syntax-attr-value-color: var(--primitives-color-mintgroen-800);
		--semantics-code-syntax-variable-color: var(--primitives-color-lintblauw-800);
		--semantics-code-syntax-constant-color: var(--primitives-color-oranje-800);
		--semantics-code-syntax-regex-color: var(--primitives-color-rood-800);
		--semantics-code-syntax-url-color: var(--primitives-color-mintgroen-800);
	}

	.cm-diff-added {
		background-color: var(--_code-viewer-diff-added-background-color);
	}

	.cm-diff-removed {
		background-color: var(--_code-viewer-diff-removed-background-color);
	}

	:is(.cm-diff-old-gutter, .cm-diff-new-gutter) .cm-gutterElement:is(.cm-diff-added, .cm-diff-removed) {
		color: var(--_code-viewer-diff-row-number-color);
	}

	.cm-diff-sign-gutter :is(.cm-diff-added, .cm-diff-removed) {
		background-repeat: no-repeat;
		background-position: right;
		background-size: var(--_code-viewer-gutter-border-width) 100%;
	}

	.cm-diff-sign-gutter .cm-diff-added {
		background-image: linear-gradient(var(--_code-viewer-diff-added-word-background-color), var(--_code-viewer-diff-added-word-background-color));
		color: var(--_code-viewer-diff-added-sign-color);
	}

	.cm-diff-sign-gutter .cm-diff-removed {
		background-image: linear-gradient(var(--_code-viewer-diff-removed-word-background-color), var(--_code-viewer-diff-removed-word-background-color));
		color: var(--_code-viewer-diff-removed-sign-color);
	}

	.cm-diff-added-word {
		border-radius: var(--primitives-corner-radius-xs);
		background-color: var(--_code-viewer-diff-added-word-background-color);
	}

	.cm-diff-added-word,
	.cm-diff-added-word * {
		color: var(--_code-viewer-diff-added-word-content-color);
	}

	.cm-diff-removed-word {
		border-radius: var(--primitives-corner-radius-xs);
		background-color: var(--_code-viewer-diff-removed-word-background-color);
	}

	.cm-diff-removed-word,
	.cm-diff-removed-word * {
		color: var(--_code-viewer-diff-removed-word-content-color);
	}

	.cm-diff-hunk {
		padding-inline: var(--_code-viewer-diff-gutter-inline-padding) var(--_code-viewer-inline-padding);
		color: var(--_code-viewer-diff-gutter-color);
	}

	.cm-diff-line-label,
	.code-viewer__diff-summary {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		-webkit-user-select: none;
		user-select: none;
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
