import { ViewPlugin, Decoration, type DecorationSet, EditorView, type ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { markdown } from '@codemirror/lang-markdown';
import { GFM } from '@lezer/markdown';
import { StateField, type EditorState, type Extension, type Range } from '@codemirror/state';
import type { SyntaxNode } from '@lezer/common';
import { isMentionLink, mentionTokens } from './text-editor.mention.js';
import { inLinkContext } from './text-editor.links.js';
import { heldEmphasis, heldEmphasisField } from './text-editor.emphasis.js';
import { forEachLineStart, inCodeBlock, isRuleLine, treeAdvanced } from './text-editor.syntax.js';

/* Hybrid markdown rendering: the document stays plain markdown text, but the
 * formatting is shown inline (bold is bold, headings are larger, links are
 * colored) while the syntax markers stay visible, only dimmed — the iA Writer
 * / Kirby approach. Implemented as decorations over the Lezer syntax tree. */

// Lezer node name → CSS class applied to that node's whole range (the content).
const NODE_CLASS: Record<string, string> = {
	ATXHeading1: 'cm-md-h1',
	ATXHeading2: 'cm-md-h2',
	ATXHeading3: 'cm-md-h3',
	ATXHeading4: 'cm-md-h4',
	ATXHeading5: 'cm-md-h5',
	ATXHeading6: 'cm-md-h6',
	StrongEmphasis: 'cm-md-strong',
	Emphasis: 'cm-md-emphasis',
	Strikethrough: 'cm-md-strike',
	InlineCode: 'cm-md-code',
	// Fenced/indented code blocks are tinted per content line (see line decorations
	// below), not here, so the whole block reads as one filled surface.
	URL: 'cm-md-url',
	Blockquote: 'cm-md-quote',
};

// Syntax markers — kept visible but dimmed so the source stays legible.
const MARK_NODES = new Set([
	'HeaderMark', 'EmphasisMark', 'StrikethroughMark', 'CodeMark',
	'QuoteMark', 'ListMark', 'LinkMark',
]);

const dimDeco = Decoration.mark({ class: 'cm-md-mark' });
const quoteRow = Decoration.line({ class: 'cm-md-quote-row' });
const classDecoCache: Record<string, Decoration> = {};
function classDeco(cls: string): Decoration {
	// inclusiveEnd so a formatting run (heading, bold, …) wraps a trailing widget at
	// its end — e.g. an annotation badge whose annotation ends the run — instead of
	// letting that widget fall outside the run's font context.
	return (classDecoCache[cls] ??= Decoration.mark({ class: cls, inclusiveEnd: true }));
}

// A code block is tinted as full-width line backgrounds — one filled surface — so
// the fence lines stay clean and the content reads as a block, not per-word chips.
// The first/last content lines round the top/bottom corners.
const codeblockLine = Decoration.line({ class: 'cm-md-codeblock' });
const codeblockFirstLine = Decoration.line({ class: 'cm-md-codeblock-first' });
const codeblockLastLine = Decoration.line({ class: 'cm-md-codeblock-last' });
// Whole-block selection: recolors the full-width line background (padding and
// rounded corners included), so a fully selected block lights up as one surface
// — the block analogue of a fully selected inline-code / annotation token.
const codeblockSelectedLine = Decoration.line({ class: 'cm-md-codeblock-line-selected' });

function tintCodeLines(state: EditorState, lineNumbers: number[], sel: { from: number; to: number; empty: boolean }, ranges: Range<Decoration>[]): void {
	if (lineNumbers.length === 0) return;
	// The block is "fully selected" when the selection spans from the first content
	// line's start through the last content line's end (it may reach further). Then
	// every line background lights up; otherwise only the selected text slice does.
	const firstLine = state.doc.line(lineNumbers[0]);
	const lastLine = state.doc.line(lineNumbers[lineNumbers.length - 1]);
	const blockFullySelected = !sel.empty && sel.from <= firstLine.from && sel.to >= lastLine.to;
	lineNumbers.forEach((ln, index) => {
		const line = state.doc.line(ln);
		ranges.push(codeblockLine.range(line.from));
		if (index === 0) ranges.push(codeblockFirstLine.range(line.from));
		if (index === lineNumbers.length - 1) ranges.push(codeblockLastLine.range(line.from));
		if (blockFullySelected) {
			ranges.push(codeblockSelectedLine.range(line.from));
		} else if (!sel.empty) {
			// Darken the selected slice of this line (drawSelection hides ::selection).
			const f = Math.max(line.from, sel.from);
			const t = Math.min(line.to, sel.to);
			if (t > f) ranges.push(classDeco('cm-md-codeblock-selected').range(f, t));
		}
	});
}

// Indented code block (no fences): every line in the node range is content.
function addCodeblockLines(state: EditorState, from: number, to: number, sel: { from: number; to: number; empty: boolean }, ranges: Range<Decoration>[]): void {
	const first = state.doc.lineAt(from).number;
	const last = state.doc.lineAt(Math.max(from, to - 1)).number;
	const lines: number[] = [];
	for (let ln = first; ln <= last; ln++) lines.push(ln);
	tintCodeLines(state, lines, sel, ranges);
}

// Fenced block: tint the content lines only — the ``` fence lines (and the info
// string) stay clean. Anchored on the whole FencedCode node, not its CodeText child,
// so a trailing empty line inside the fence is gray right away; CodeText doesn't cover
// that blank line, so it used to stay untinted until a keystroke grew the node.
function addFencedCodeLines(state: EditorState, node: SyntaxNode, sel: { from: number; to: number; empty: boolean }, ranges: Range<Decoration>[]): void {
	const fenceLines = new Set<number>();
	for (let child = node.firstChild; child; child = child.nextSibling) {
		if (child.name === 'CodeMark') fenceLines.add(state.doc.lineAt(child.from).number);
	}
	const first = state.doc.lineAt(node.from).number;
	const last = state.doc.lineAt(Math.max(node.from, node.to - 1)).number;
	const lines: number[] = [];
	for (let ln = first; ln <= last; ln++) if (!fenceLines.has(ln)) lines.push(ln);
	tintCodeLines(state, lines, sel, ranges);
}


// A normal link is colored across its whole range; a mention link is replaced by
// its token (mentionChipField). The markers and URL are still visited as
// children and dimmed.
function decorateLink(state: EditorState, link: SyntaxNode, ranges: Range<Decoration>[]): void {
	if (isMentionLink(state, link)) return;
	ranges.push(classDeco('cm-md-link').range(link.from, link.to));
}

// Inline/content styling — no layout change, so a viewport-scoped plugin.
function buildMarkDecorations(view: EditorView): DecorationSet {
	const ranges: Range<Decoration>[] = [];
	const sel = view.state.selection.main;
	for (const { from, to } of view.visibleRanges) {
		syntaxTree(view.state).iterate({
			from,
			to,
			enter: (node) => {
				if (node.from >= node.to) return;
				if (node.name === 'Link') {
					decorateLink(view.state, node.node, ranges);
					return;
				}
				// Fenced blocks tint from the FencedCode node (covers blank lines too),
				// indented blocks from CodeBlock. Neither returns false, so the fence
				// CodeMarks are still visited and dimmed as children.
				if (node.name === 'FencedCode') {
					addFencedCodeLines(view.state, node.node, sel, ranges);
					return;
				}
				if (node.name === 'CodeBlock') {
					addCodeblockLines(view.state, node.from, node.to, sel, ranges);
					return;
				}
				// A bare / autolinked URL is the link itself (no separate [text]), so
				// color it like link text (blue) instead of the dimmed address gray of
				// cm-md-url. Its own class (not cm-md-link) so the `span { color: inherit }`
				// rule that overrides the highlight-style URL tint can target it without
				// also recoloring the gray address inside a [text](url) link. The URL
				// inside a link, a reference definition, or an image stays gray below.
				if (node.name === 'URL' && !inLinkContext(node.node)) {
					ranges.push(classDeco('cm-md-autolink').range(node.from, node.to));
					return;
				}
				// The quote size goes on its lines too, so a line with only its `> `
				// is as tall as one with text: the size of a line is that of its line box.
				if (node.name === 'Blockquote' && node.node.parent?.name !== 'Blockquote') {
					forEachLineStart(view.state, node.from, node.to, (lineFrom) => ranges.push(quoteRow.range(lineFrom)));
				}
				const cls = NODE_CLASS[node.name];
				if (cls) {
					// Inline code darkens on selection (drawSelection hides the native
					// ::selection). A *fully* selected chip recolors the base element
					// itself — one mark with both classes — so it keeps its padding and
					// rounded corners, like a selected mention/annotation token. The
					// padless overlay slice (used only for a partial selection below)
					// would instead square off the chip.
					const codeFullySelected =
						cls === 'cm-md-code' && !sel.empty && sel.from <= node.from && sel.to >= node.to;
					if (codeFullySelected) {
						ranges.push(classDeco('cm-md-code cm-md-code-selected').range(node.from, node.to));
					} else {
						ranges.push(classDeco(cls).range(node.from, node.to));
						if (!sel.empty && cls === 'cm-md-code') {
							const f = Math.max(node.from, sel.from);
							const t = Math.min(node.to, sel.to);
							if (t > f) ranges.push(classDeco('cm-md-code-selected').range(f, t));
						}
					}
				} else if (MARK_NODES.has(node.name)) {
					// A bullet marker (- * +) is dimmed literal text like the other marks,
					// so the character you typed is the one you see. syntax="hidden" draws
					// a dot in its place (see text-editor.hidden-syntax.ts).
					ranges.push(dimDeco.range(node.from, node.to));
				}
			},
		});
	}
	// An emphasis the parser has let go of while the caret is still between its
	// markers keeps its styling, markers dimmed, until the hold ends (#213).
	const held = view.state.field(heldEmphasisField, false);
	if (held && !held.live) {
		const len = held.marker.length;
		ranges.push(classDeco(NODE_CLASS[held.name]).range(held.from, held.to));
		ranges.push(dimDeco.range(held.from, held.from + len), dimDeco.range(held.to - len, held.to));
	}
	return Decoration.set(ranges, true);
}

const markDecorationPlugin = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.decorations = buildMarkDecorations(view);
		}

		update(update: ViewUpdate): void {
			// selectionSet too: the selected slice of a code span is tinted darker.
			if (update.docChanged || update.viewportChanged || update.selectionSet || treeAdvanced(update.startState, update.state)) {
				this.decorations = buildMarkDecorations(update.view);
			}
		}
	},
	{ decorations: (plugin) => plugin.decorations },
);

/* Hanging indent: wrapped continuation lines of a list item or blockquote align
 * under the first line's text. The leading marker prefix is rendered in
 * monospace (cm-md-listprefix), so its width is exactly prefixLength × the mono
 * advance (--_text-editor-marker-advance). The indent uses that same product, so the first
 * line's text and every wrapped line line up — no per-line measurement, and it
 * holds in both the sans and mono body fonts. Layout-affecting → a StateField. */
const HANGING_RE = /^(\s*(?:[-*+]|\d+[.)])\s+|\s*>+\s?)/;
const prefixMonoDeco = Decoration.mark({ class: 'cm-md-listprefix' });
const hangingLineCache: Record<number, Decoration> = {};
function hangingLineDeco(length: number): Decoration {
	return (hangingLineCache[length] ??= Decoration.line({
		attributes: {
			style: `text-indent:calc(${length} * var(--_text-editor-marker-advance) * -1);padding-left:calc(${length} * var(--_text-editor-marker-advance))`,
		},
	}));
}

function buildHangingIndent(state: EditorState): DecorationSet {
	const ranges: Range<Decoration>[] = [];
	// One walk with a running offset. Asking the document for line N is a lookup
	// through its tree, and doing that per line turned a scan into a search.
	let from = 0;
	for (const iter = state.doc.iterLines(); !iter.next().done; ) {
		const text = iter.value;
		const match = HANGING_RE.exec(text);
		// Code-block lines are literal text: a leading marker isn't a list/quote, so it
		// gets no hanging indent.
		if (match && match[1].length && !inCodeBlock(state, from) && !isRuleLine(state, from)) {
			const length = match[1].length;
			ranges.push(hangingLineDeco(length).range(from));
			ranges.push(prefixMonoDeco.range(from, from + length));
		}
		from += text.length + 1; // the line and its break
	}
	return Decoration.set(ranges, true);
}

const hangingIndentField = StateField.define<DecorationSet>({
	create: (state) => buildHangingIndent(state),
	update: (value, tr) => (tr.docChanged || treeAdvanced(tr.startState, tr.state) ? buildHangingIndent(tr.state) : value),
	provide: (field) => EditorView.decorations.from(field),
});

/** Markdown language (with GFM) plus the hybrid inline-styling decorations. */
export const markdownEditing: Extension = [
	markdown({ extensions: GFM }),
	markDecorationPlugin,
	heldEmphasis,
	hangingIndentField,
	mentionTokens,
];
