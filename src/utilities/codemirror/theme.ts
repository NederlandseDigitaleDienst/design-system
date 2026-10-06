import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

/* CodeMirror's generated theme styles mount into the same root as the view
 * (the component's shadow root). CSS custom properties inherit across the
 * shadow boundary, so every var(--…) below resolves against variables.css and
 * adapts to light/dark mode automatically. Background and padding are left to
 * the host component (the box/simple variant owns the framing). */
const baseTheme = EditorView.theme({
	'&': {
		height: '100%',
		color: 'var(--semantics-content-color)',
		backgroundColor: 'transparent',
	},
	'&.cm-focused': {
		// The focus ring lives on the host (.code-editor:focus-within).
		outline: 'none',
	},
	'.cm-scroller': {
		fontFamily: 'inherit',
		lineHeight: 'inherit',
		overflow: 'auto',
	},
	'.cm-content': {
		padding: '0',
		caretColor: 'var(--semantics-content-color)',
	},
	'.cm-line': {
		padding: '0',
	},
	'.cm-cursor, .cm-dropCursor': {
		borderLeftColor: 'var(--semantics-content-color)',
	},
	'.cm-placeholder': {
		color: 'var(--semantics-input-fields-placeholder-color)',
	},
	// A solid selection color. accent-150/250 are themselves light-dark; the
	// outer light-dark() picks the lighter step in light mode and the darker step
	// in dark mode (the accent scale inverts), keeping the selection subtle.
	// The focused selector matches CodeMirror's own deep one so our color wins on
	// equal specificity — otherwise CM's light base theme paints the focused
	// selection lavender, unreadable on a dark surface.
	'&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
		backgroundColor: 'light-dark(var(--primitives-color-accent-150), var(--primitives-color-accent-250))',
	},
	'.cm-gutters': {
		border: 'none',
		backgroundColor: 'transparent',
		color: 'var(--semantics-input-fields-placeholder-color)',
	},
	// Breathing room between the line-number gutter and the code (VS Code-like).
	'.cm-lineNumbers .cm-gutterElement': {
		padding: '0 var(--primitives-space-16) 0 var(--primitives-space-8)',
	},
	'.cm-activeLine, .cm-activeLineGutter': {
		backgroundColor: 'transparent',
	},
});

/* Token colors reuse the existing code-viewer palette so the editor and the
 * read-only viewer highlight identically with one source of truth. */
const highlightStyle = HighlightStyle.define([
	{ tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: 'var(--semantics-code-syntax-comment-color)', fontStyle: 'italic' },
	{ tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword], color: 'var(--semantics-code-syntax-keyword-color)' },
	{ tag: [t.string, t.special(t.string), t.character], color: 'var(--semantics-code-syntax-string-color)' },
	{ tag: [t.number, t.integer, t.float], color: 'var(--semantics-code-syntax-number-color)' },
	{ tag: t.bool, color: 'var(--semantics-code-syntax-boolean-color)' },
	{ tag: t.null, color: 'var(--semantics-code-syntax-null-color)' },
	{ tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--semantics-code-syntax-function-color)' },
	{ tag: [t.className, t.typeName, t.namespace], color: 'var(--semantics-code-syntax-class-color)' },
	{ tag: [t.propertyName, t.attributeName], color: 'var(--semantics-code-syntax-property-color)' },
	{ tag: [t.punctuation, t.separator, t.bracket], color: 'var(--semantics-code-syntax-punctuation-color)' },
	{ tag: t.operator, color: 'var(--semantics-code-syntax-operator-color)' },
	{ tag: t.tagName, color: 'var(--semantics-code-syntax-tag-color)' },
	{ tag: t.attributeValue, color: 'var(--semantics-code-syntax-attr-value-color)' },
	{ tag: t.variableName, color: 'var(--semantics-code-syntax-variable-color)' },
	{ tag: [t.constant(t.variableName), t.standard(t.variableName)], color: 'var(--semantics-code-syntax-constant-color)' },
	{ tag: t.regexp, color: 'var(--semantics-code-syntax-regex-color)' },
	{ tag: t.url, color: 'var(--semantics-code-syntax-url-color)' },
	{ tag: t.strong, fontWeight: 'bold' },
	{ tag: t.emphasis, fontStyle: 'italic' },
]);

/** Theme + syntax highlighting as one extension, shared by all DS editors. */
export const nlddCodeMirrorTheme: Extension = [baseTheme, syntaxHighlighting(highlightStyle)];
