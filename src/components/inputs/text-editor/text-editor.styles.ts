import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const textEditorStyles = css`


	/* # Host */

	:host {
		--_caret-width: var(--primitives-border-width-regular);
		--_caret-ring-width: var(--primitives-border-width-thin);
		--_corner-radius: 0;
		--_background-color: transparent;
		--_highlight-border-color: transparent;
		--_highlight-border-shadow: none;
		--_padding-block: 0px;
		/* Room for the caret's own ink at the first and last position of a line:
		   its width plus its ring. Without it the edge carets are clipped. */
		--_padding-inline: calc(var(--_caret-width) + var(--_caret-ring-width));
		--_content-color: var(--semantics-content-color);
		--_text-font: var(--primitives-font-body-md-regular-snug);
		--_code-font: var(--primitives-font-monospace-md-regular-snug);
		--_code-font-size: calc(var(--primitives-font-size-90) / var(--primitives-font-size-100) * 1em);
		--_marker-font-size: var(--primitives-font-size-90);
		/* JetBrains Mono advance (600/1000 em) at the marker size; leading
		   list/quote markers are mono so the hanging indent equals their width. */
		--_marker-advance: calc(0.6 * var(--_marker-font-size));
		--_bullet-size: 0.45em;
		--_bullet-color: var(--semantics-content-secondary-color);
		--_heading-marker-scale: 75%;
		--_token-corner-radius: var(--primitives-corner-radius-sm);
		--_token-block-padding: 0.15em;
		--_token-inline-padding: 0.3em;
		/* Vertical padding for an inline token that inherits the block font (tint,
		   mention): fills the line up to its line-height, never past it, so tokens on
		   adjacent lines never overlap. 1lh and em resolve on the token, so it adapts
		   to a heading's tighter line. (~1.2em is the text's own box.) */
		--_token-block-padding-fit: max(0em, (1lh - 1.2em) / 2);
		--_code-token-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-150));
		--_code-token-is-selected-background-color: light-dark(var(--primitives-color-neutral-200), var(--primitives-color-neutral-300));
		--_code-block-inline-padding: var(--_token-inline-padding);
		--_code-block-block-padding: var(--_token-block-padding);
		--_annotation-token-background-color: light-dark(var(--primitives-color-mark-75), var(--primitives-color-mark-150));
		--_annotation-token-is-selected-background-color: light-dark(var(--primitives-color-mark-200), var(--primitives-color-mark-400));
		--_annotation-token-badge-content-color: var(--primitives-color-mark-1000);
		--_annotation-token-badge-background-color: light-dark(var(--primitives-color-mark-250), var(--primitives-color-mark-300));
		--_annotation-token-badge-highlight-border-color: light-dark(var(--primitives-color-mark-300), var(--primitives-color-mark-350));
		--_annotation-token-badge-is-hovered-background-color: light-dark(var(--primitives-color-mark-300), var(--primitives-color-mark-350));
		--_annotation-token-badge-is-hovered-highlight-border-color: light-dark(var(--primitives-color-mark-350), var(--primitives-color-mark-400));
		--_annotation-token-badge-is-active-background-color: light-dark(var(--primitives-color-mark-350), var(--primitives-color-mark-400));
		--_annotation-token-badge-is-active-highlight-border-color: light-dark(var(--primitives-color-mark-400), var(--primitives-color-mark-450));
		/* Same step in both themes: mark-450 keeps light mode as-is and, in dark
		   mode, stays a readable amber instead of jumping to a near-white fill
		   that swallows the white (mark-1000) badge number. */
		--_annotation-token-is-selected-badge-background-color: var(--primitives-color-mark-450);
		--_annotation-token-is-selected-badge-highlight-border-color: var(--primitives-color-mark-500);
		--_annotation-badge-size: 1.5em;
		--_annotation-badge-font-scale: 0.62;
		--_link-badge-size: calc(1em + 2 * var(--_token-block-padding-fit));
		--_link-badge-content-color: var(--semantics-categories-accent-tinted-content-color);
		--_link-badge-background-color: var(--semantics-categories-accent-tinted-background-color);
		--_link-badge-highlight-border-color: var(--semantics-categories-accent-tinted-highlight-border-color);
		--_link-badge-is-hovered-background-color: light-dark(var(--primitives-color-accent-75), var(--primitives-color-accent-100));
		--_link-badge-is-active-background-color: light-dark(var(--primitives-color-accent-100), var(--primitives-color-accent-150));
		--_link-badge-is-hovered-highlight-border-color: light-dark(var(--primitives-color-accent-150), var(--primitives-color-accent-200));
		--_link-badge-is-active-highlight-border-color: light-dark(var(--primitives-color-accent-200), var(--primitives-color-accent-250));
		--_mention-icon-size: 0.95em;
		--_mention-token-background-color: var(--semantics-categories-accent-tinted-background-color);
		--_mention-token-content-color: var(--semantics-categories-accent-tinted-content-color);
		--_mention-token-is-selected-background-color: var(--semantics-categories-accent-filled-background-color);
		--_mention-token-is-selected-content-color: var(--semantics-categories-accent-filled-content-color);
		--_rows: 6;

		${inheritedTextReset}
		display: flex;
		min-height: 0;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: auto;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}


	/* ## Appearance — input-field adds the framed surface + a default content padding */

	:host([appearance="input-field"]) {
		--_corner-radius: var(--primitives-corner-radius-lg);
		--_background-color: var(--semantics-input-fields-background-color);
		--_highlight-border-color: var(--semantics-input-fields-border-color);
		--_highlight-border-shadow: inset 0 0 0 var(--semantics-input-fields-border-width) var(--_highlight-border-color);
		--_padding-block: var(--semantics-controls-md-inline-padding);
		--_padding-inline: var(--semantics-controls-md-inline-padding);
	}


	/* # Block — the frame only; CodeMirror fills it */

	.text-editor {
		box-sizing: border-box;
		display: flex;
		position: relative;
		border-radius: var(--_corner-radius);
		box-shadow: var(--_highlight-border-shadow);
		background-color: var(--_background-color);
		min-height: 0;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: auto;
		color: var(--_content-color);
		font: var(--_text-font);
	}

	:host([disabled]) .text-editor {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	/* Focus ring only on the input-field variant; simple relies on the accent caret and
	   lets a wrapping composition own its focus treatment. */
	:host([appearance="input-field"]) .text-editor:focus-within {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), var(--_highlight-border-shadow);
	}


	/* # CodeMirror surface */

	/* Inline padding on the scroller (left of any future gutter), block + right
	   on the content for click mapping + scroll-end padding. :host beats the
	   shared theme's .cm-content reset. */
	:host .cm-scroller {
		padding-left: var(--_padding-inline);
	}

	:host .cm-content {
		padding-block: var(--_padding-block);
		padding-right: var(--_padding-inline);
		min-height: calc(var(--_rows) * 1lh);
	}

	/* Prominent accent caret in both variants (the input-field variant additionally has the focus
	   ring). The doubled class is purely for specificity — it outweighs
	   CodeMirror's theme cursor color without depending on an attribute. */
	:host .cm-cursor.cm-cursor {
		/* accent-700: it keeps a >=525 lightness gap from both the base and tinted
		   surfaces in light and dark (accent-600 fell just short on white), so the
		   caret stays clearly visible without washing out. */
		border-left-color: var(--primitives-color-accent-700);
		border-left-width: var(--_caret-width);
		/* CodeMirror centers its own 1.2px caret with a -0.6px margin. Ours is wider,
		   so recenter it on the insertion point from its own width. */
		margin-left: calc(var(--_caret-width) / -2);
		/* A thin surface-colored ring, like the drop cursor, so the caret stays legible
		   even over a tinted token (annotation, inline code) where the accent alone can
		   blend in. Blinks with the caret (opacity covers the shadow too). */
		box-shadow: 0 0 0 var(--_caret-ring-width) var(--semantics-surfaces-base-background-color);
	}

	:host .cm-scroller {
		resize: none;
		min-height: calc(var(--_rows) * 1lh + 2 * var(--_padding-block));
	}

	:host([resize="vertical"]) .cm-scroller {
		resize: vertical;
	}

	:host([resize="none"]) .cm-editor {
		height: calc(var(--_rows) * 1lh + 2 * var(--_padding-block));
	}


	/* # Hybrid markdown decorations
	   Headings follow rich-text's display scale at its sm step. Markers are kept
	   visible but dimmed in monospace, which also gives the leading list/quote
	   prefix a predictable width for the hanging indent (see --_marker-advance). */

	.cm-md-h1 {
		font: var(--primitives-font-display-1-sm);
	}

	.cm-md-h2 {
		font: var(--primitives-font-display-2-sm);
	}

	.cm-md-h3 {
		font: var(--primitives-font-display-3-sm);
	}

	.cm-md-h4 {
		font: var(--primitives-font-display-4-sm);
	}

	.cm-md-h5 {
		font: var(--primitives-font-display-5-sm);
	}

	.cm-md-h6 {
		font: var(--primitives-font-display-6-sm);
	}

	:is(.cm-md-h1, .cm-md-h2, .cm-md-h3, .cm-md-h4, .cm-md-h5, .cm-md-h6) .cm-md-mark {
		font-size: var(--_heading-marker-scale);
	}
	.cm-md-strong {
		font-weight: bold;
	}
	.cm-md-emphasis {
		font-style: italic;
	}
	.cm-md-strike {
		text-decoration: line-through;
	}

	/* The selected run is darkened with a decoration (see cm-md-code-selected
	   below), since drawSelection hides the native selection. */
	.cm-md-code {
		padding-block: var(--_token-block-padding-fit);
		/* No inline padding: the tint hugs the backticks, which are the visible bounds
		   anyway. A padded mark has no coordsAt hook, so the caret at its edge would
		   otherwise jump by the padding depending on the direction it arrives from. */
		/* line-height is left to inherit from the block, so a fixed snug line-height
		   won't make the chip overflow inside a tight heading. */
		font-family: var(--primitives-font-family-monospace);
		font-size: var(--_code-font-size);
		font-weight: var(--primitives-font-weight-body-regular);
		background-color: var(--_code-token-background-color);
		border-radius: var(--_token-corner-radius);
	}

	/* :host beats the shared theme's ".cm-line { padding: 0 }" reset (equal
	   specificity otherwise wins on source order), same as .cm-content above —
	   without it the block padding never lands and the surface reads cramped. */
	:host .cm-md-codeblock {
		padding-inline: var(--_code-block-inline-padding);
		font: var(--_code-font);
		background-color: var(--_code-token-background-color);
	}

	:host .cm-md-codeblock-first {
		padding-top: var(--_code-block-block-padding);
		border-start-start-radius: var(--_token-corner-radius);
		border-start-end-radius: var(--_token-corner-radius);
	}

	:host .cm-md-codeblock-last {
		padding-bottom: var(--_code-block-block-padding);
		border-end-start-radius: var(--_token-corner-radius);
		border-end-end-radius: var(--_token-corner-radius);
	}

	/* Selected slice of a code span — drawSelection hides the native ::selection,
	   so a decoration (cm-md-code-selected / cm-md-codeblock-selected) paints the
	   darker tint over the part that's selected. */
	.cm-md-code-selected,
	.cm-md-codeblock-selected {
		background-color: var(--_code-token-is-selected-background-color);
	}
	/* CM nests the base code mark inside the selected one, so the inner base tint
	   would paint over the darker selected tint (leaving the token light, or split
	   on a partial overlap). Clear it so the whole selected run reads as one block. */
	.cm-md-code-selected .cm-md-code {
		background-color: transparent;
	}

	/* Whole code block selected: the line background (its padding-inline, the
	   first/last line's block padding, and the rounded corners) takes the selected
	   tint, so the block lights up edge to edge — the padding included, like a
	   fully selected token. :host to beat the base ".cm-md-codeblock" background. */
	:host .cm-md-codeblock-line-selected {
		background-color: var(--_code-token-is-selected-background-color);
	}

	.cm-md-mention {
		color: var(--semantics-content-accent-color);
		font-weight: 600;
	}

	.cm-md-mention-token {
		padding-block: var(--_token-block-padding-fit);
		/* Left space equals the @ icon's vertical inset (token height minus the icon,
		   halved), so the icon sits equally clear left, top and bottom; the right keeps
		   the normal token inset around the name. */
		padding-inline: max(0em, (max(1.2em, 1lh) - var(--_mention-icon-size)) / 2) var(--_token-inline-padding);
		color: var(--_mention-token-content-color);
		background-color: var(--_mention-token-background-color);
		border-radius: var(--_token-corner-radius);
		font-weight: 600;
		white-space: nowrap;
		cursor: default;
		-webkit-box-decoration-break: clone;
		box-decoration-break: clone;
		/* List/quote lines carry a negative text-indent (the hanging indent), which
		   is inherited; Safari applies it to the token and shoves the @ over the
		   name. Reset it so the token lays out the same everywhere. */
		text-indent: 0;
	}

	.cm-md-mention-token-icon {
		width: var(--_mention-icon-size);
		height: var(--_mention-icon-size);
		margin-inline-end: 0.1em;
		vertical-align: -0.16em;
	}

	.cm-md-mention-token[data-selected] {
		color: var(--_mention-token-is-selected-content-color);
		background-color: var(--_mention-token-is-selected-background-color);
	}

	/* A native selection over a mention keeps its text light on the filled accent.
	   :host bumps specificity so it wins over .cm-content ::selection wherever it sits. */
	:host .cm-md-mention-token ::selection {
		color: var(--_mention-token-is-selected-content-color);
	}

	.cm-md-link {
		color: var(--semantics-links-color);
	}

	.cm-md-url {
		color: var(--semantics-content-secondary-color);
	}

	/* The markdown highlight style tints the URL token (teal); make its span inherit
	   the dimmed color so the address reads as secondary, like the surrounding marks. */
	.cm-md-url span {
		color: inherit;
	}

	/* A bare / autolinked URL reads as the link itself: color it like link text,
	   and override the highlight-style URL tint (teal) on its token span so the
	   whole address is the link color, not just the mark wrapper. */
	.cm-md-autolink {
		color: var(--semantics-links-color);
	}

	.cm-md-autolink span {
		color: inherit;
	}

	.cm-md-quote {
		color: var(--semantics-content-color);
		font-style: italic;
		font-size: var(--primitives-font-size-200);
	}

		/* Markers: dimmed (secondary color, not opacity, so contrast holds) and
	   monospace at the 16px marker size — tidy, and a fixed-width leading prefix. */
	.cm-md-mark {
		color: var(--semantics-content-secondary-color);
		font-family: var(--primitives-font-family-monospace);
		font-size: var(--_marker-font-size);
	}

	.cm-md-code .cm-md-mark {
		font-size: 1em;
	}

	/* Bullet-list marker: hide the literal dash (its box keeps the mono advance so
	   wrapped lines still align under the text) and draw a filled dot in its place.
	   Fully styleable via --_bullet-size / --_bullet-color above. */
	.cm-md-bullet {
		position: relative;
		color: transparent;
	}

	.cm-md-bullet::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--_bullet-size);
		height: var(--_bullet-size);
		transform: translate(-50%, -50%);
		border-radius: var(--primitives-corner-radius-full);
		background-color: var(--_bullet-color);
	}

	/* The leading prefix (and anything nested in it, e.g. a blockquote's own
	   span) renders at the marker size, so its width stays prefixLength × the
	   mono advance and the hanging indent lines up exactly. */
	.cm-md-listprefix,
	.cm-md-listprefix * {
		font-family: var(--primitives-font-family-monospace);
		font-size: var(--_marker-font-size);
	}


	/* # Annotation overlay
	   A light body tint + a dashed underline mark the annotated text; a solid
	   badge (the nub) sits at the end carrying the count. One role for all
	   annotations — the type is communicated by the consumer's pane, not color.
	   The dashed line is a non-color cue (with the badge) for accessibility. */

	/* One cohesive yellow block: the light tint with rounded corners and a reserved
	   space on the right for the solid nub (which lives inside this run, so it
	   shares the tint and wraps with the text). The dashed underline stays as a
	   non-color cue. box-decoration-break keeps the tint + rounding on every
	   wrapped fragment; padding-block extends the tint without growing the line
	   (vertical padding on an inline box is visual only). */
	.cm-annotation {
		background-color: var(--_annotation-token-background-color);
		border-radius: var(--_token-corner-radius);
		padding-block: var(--_token-block-padding-fit);
		/* Right space mirrors the badge's vertical inset (token height minus the badge,
		   halved), so the badge sits equally clear of the top, bottom and right edges.
		   Token height is max(1.2em text box, 1lh); the badge height in token units is
		   its box × its font scale. */
		padding-inline: var(--_token-inline-padding)
			max(0em, (max(1.2em, 1lh) - var(--_annotation-badge-size) * var(--_annotation-badge-font-scale)) / 2);
		-webkit-box-decoration-break: clone;
		box-decoration-break: clone;
	}

	/* The annotated text's last word plus the badge, kept on one line so the badge
	   never wraps onto a line by itself. Only this tail is nowrap; earlier words in a
	   long annotation still wrap normally. :host to beat CM's own white-space rule. */
	:host .cm-annotation-tail {
		white-space: nowrap;
	}

	/* Selected annotation text in a darker yellow: the whole annotation
	   (.cm-annotation.is-selected) or a slice of a partly-selected one (nested,
	   .cm-annotation .is-selected). drawSelection's layer sits behind the tint, so this
	   stands in for the hidden selection; the text takes the strongest content color. */
	.cm-annotation.is-selected,
	.cm-annotation .is-selected {
		background-color: var(--_annotation-token-is-selected-background-color);
		color: var(--primitives-color-neutral-950);
	}

	.cm-content ::selection {
		color: var(--primitives-color-neutral-1000);
	}

	.cm-annotation ::selection {
		color: var(--primitives-color-neutral-950);
	}

	.cm-annotation-badge {
		box-sizing: border-box;
		display: inline-flex;
		position: relative;
		align-items: center;
		justify-content: center;
		min-width: var(--_annotation-badge-size);
		height: var(--_annotation-badge-size);
		margin-inline: 0.4em 0;
		padding-inline: 0.3em;
		border: 0;
		border-radius: var(--primitives-corner-radius-full);
		background-color: var(--_annotation-token-badge-background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_annotation-token-badge-highlight-border-color);
		color: var(--_annotation-token-badge-content-color);
		/* vertical-align: middle lands the nub ~1px below the text's em-box center, and
		   the optical middle of the ink sits higher again, so it reads low; nudge up onto
		   it. The em is the badge's own (scaled-down) font size, so the value is larger
		   than it looks and scales with the token in headings. */
		vertical-align: middle;
		transform: translateY(-0.11em);
		font-family: var(--primitives-font-family-body);
		font-size: calc(var(--_annotation-badge-font-scale) * 1em);
		font-weight: 700;
		line-height: 1;
		cursor: default;
	}

	/* Enlarges the badge's hit area into the reserved space around it. */
	.cm-annotation-badge::before {
		content: '';
		position: absolute;
		inset-block: -0.3em;
		inset-inline: -0.55em -0.45em;
	}

	@media (hover: hover) {
		.cm-annotation-badge:hover {
			background-color: var(--_annotation-token-badge-is-hovered-background-color);
			box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_annotation-token-badge-is-hovered-highlight-border-color);
		}
	}

	.cm-annotation-badge:active {
		background-color: var(--_annotation-token-badge-is-active-background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_annotation-token-badge-is-active-highlight-border-color);
	}

	/* The nub darkens with the block only when the whole annotation is selected (full
	   mark) or the slice covering it is (a selection running through the badge). */
	.cm-annotation.is-selected .cm-annotation-badge,
	.cm-annotation .is-selected .cm-annotation-badge {
		background-color: var(--_annotation-token-is-selected-badge-background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_annotation-token-is-selected-badge-highlight-border-color);
	}

	.cm-annotation-badge:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.cm-annotation-badge:focus:not(:focus-visible) {
		outline: none;
	}

	@media (forced-colors: active) {
		.cm-annotation,
		.cm-md-mention-token {
			outline: 1px solid currentColor;
		}
	}

	/* Drop cursor shown while dragging selected text to a new spot. An absolutely
	   positioned overlay (not an inline widget), so it never splits an annotation it
	   lands inside. A thin surface-colored halo keeps the accent bar clearly visible
	   over tinted tokens too. Left/top/height are set by the drop-cursor plugin. */
	.cm-drag-and-drop-cursor {
		position: absolute;
		width: var(--primitives-border-width-regular);
		border-radius: var(--primitives-border-width-thin);
		background-color: var(--primitives-color-accent-600);
		box-shadow: 0 0 0 var(--primitives-border-width-thin) var(--semantics-surfaces-base-background-color);
		pointer-events: none;
		z-index: 4;
	}

	.cm-drag-ghost {
		position: fixed;
		z-index: 5;
		max-width: 24ch;
		padding: 0 var(--primitives-space-4);
		border-radius: var(--_token-corner-radius);
		background-color: light-dark(var(--primitives-color-accent-150), var(--primitives-color-accent-250));
		color: var(--_content-color);
		font: var(--_text-font);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		opacity: 0.65;
		pointer-events: none;
	}

	.cm-link-badge {
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--_link-badge-size);
		height: var(--_link-badge-size);
		border-radius: var(--primitives-corner-radius-full);
		background-color: var(--_link-badge-background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_link-badge-highlight-border-color);
		color: var(--_link-badge-content-color);
		/* Match the annotation nub's optical centering next to the ink. */
		vertical-align: middle;
		transform: translateY(-0.05em);
		text-decoration: none;
		cursor: pointer;
	}

	@media (hover: hover) {
		.cm-link-badge:hover {
			background-color: var(--_link-badge-is-hovered-background-color);
			box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_link-badge-is-hovered-highlight-border-color);
		}
	}

	.cm-link-badge:active {
		background-color: var(--_link-badge-is-active-background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_link-badge-is-active-highlight-border-color);
	}

	.cm-link-badge nldd-icon {
		flex: none;
		width: calc(0.65 * var(--_link-badge-size));
		height: calc(0.65 * var(--_link-badge-size));
	}

	.cm-link-badge:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.cm-link-badge:focus:not(:focus-visible) {
		outline: none;
	}
`;
