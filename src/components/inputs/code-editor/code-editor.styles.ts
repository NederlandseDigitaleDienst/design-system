import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const codeEditorStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_code-editor-caret-width: var(--primitives-border-width-regular);
		--_code-editor-corner-radius: 0;
		--_code-editor-background-color: transparent;
		--_code-editor-border-color: transparent;
		--_code-editor-border-shadow: none;
		--_code-editor-padding-block: 0px;
		--_code-editor-padding-inline: 0px;
		--_code-editor-content-color: var(--semantics-content-color);
		--_code-editor-font: var(--primitives-font-monospace-sm-regular-snug);
		--_code-editor-rows: 6;

		/* iOS Safari auto-zooms a focused field rendered under 16px (sm is ~14px).
		   Bump to the 16px md size on touch to prevent it; non-touch keeps the
		   compact size, and pinch-zoom stays available (no maximum-scale hack). */
		@media (pointer: coarse) {
			--_code-editor-font: var(--primitives-font-monospace-md-regular-snug);
		}

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
		--_code-editor-corner-radius: var(--primitives-corner-radius-lg);
		/* Match the other input fields (text-field, textarea): the input-field
		   surface + border + control padding, not the tinted surface. */
		--_code-editor-background-color: var(--semantics-input-fields-background-color);
		--_code-editor-border-color: var(--semantics-input-fields-border-color);
		--_code-editor-border-shadow: inset 0 0 0 var(--semantics-input-fields-border-width) var(--_code-editor-border-color);
		--_code-editor-padding-block: var(--semantics-controls-md-inline-padding);
		--_code-editor-padding-inline: var(--semantics-controls-md-inline-padding);
	}


	/* # Block — the frame only; CodeMirror fills it, padding lives on the content */

	.code-editor {
		box-sizing: border-box;
		display: flex;
		position: relative;
		border-radius: var(--_code-editor-corner-radius);
		box-shadow: var(--_code-editor-border-shadow);
		background-color: var(--_code-editor-background-color);
		min-height: 0;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: auto;
		color: var(--_code-editor-content-color);
		font: var(--_code-editor-font);
	}

	:host([disabled]) .code-editor {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	/* Focus ring only on the input-field variant. The simple variant relies on a
	   prominent caret and lets a wrapping composition own its focus treatment. */
	:host([appearance="input-field"]) .code-editor:focus-within {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), var(--_code-editor-border-shadow);
	}


	/* # CodeMirror surface */

	/* Padding lives on the content so the whole padded area is clickable and a
	   click maps to the nearest line — no dead zone around the text. */
	/* Inline padding sits on the scroller so it lands left of the line-number
	   gutter (the gutter stays inset with the text). Block + right padding sit
	   on the content so the padded area is clickable and horizontal scrolling
	   keeps its end padding. :host beats the shared theme's .cm-content reset. */
	:host .cm-scroller {
		padding-left: var(--_code-editor-padding-inline);
	}

	:host .cm-content {
		padding-block: var(--_code-editor-padding-block);
		padding-right: var(--_code-editor-padding-inline);
		min-height: calc(var(--_code-editor-rows) * 1lh);
		tab-size: 2;
	}

	/* Accent caret. The doubled class is purely for specificity — it outweighs
	   CodeMirror's theme cursor color without depending on an attribute. */
	:host .cm-cursor.cm-cursor {
		border-left-color: var(--primitives-color-accent-600);
		border-left-width: var(--_code-editor-caret-width);
	}

	/* Resize model — rows is the floor in every mode:
	   auto (default) = grow, vertical = drag up from the floor, none = fixed. */
	:host .cm-scroller {
		resize: none;
		min-height: calc(var(--_code-editor-rows) * 1lh + 2 * var(--_code-editor-padding-block));
	}

	:host([resize="vertical"]) .cm-scroller {
		resize: vertical;
	}

	:host([resize="none"]) .cm-editor {
		height: calc(var(--_code-editor-rows) * 1lh + 2 * var(--_code-editor-padding-block));
	}
`;
