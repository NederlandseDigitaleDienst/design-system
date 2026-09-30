import { ViewPlugin, Decoration, type DecorationSet, EditorView, WidgetType, type ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { markdown } from '@codemirror/lang-markdown';
import { GFM } from '@lezer/markdown';
import { Prec, StateField, type EditorState, type Extension, type Range } from '@codemirror/state';
import type { SyntaxNode } from '@lezer/common';
import { MENTION_HREF_PREFIX, unescapeMentionLabel, decodeMentionId } from './text-editor.mentions.js';
import { inLinkContext } from './text-editor.links.js';
import { heldEmphasis, heldEmphasisField } from './text-editor.emphasis.js';
import { enclosingNamed, enclosingNode } from './text-editor.syntax.js';
import '../../content/icon/icon.js';

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

function linkTextRange(link: SyntaxNode): { from: number; to: number } | null {
	const marks: SyntaxNode[] = [];
	for (let child = link.firstChild; child; child = child.nextSibling) {
		if (child.name === 'LinkMark') marks.push(child);
	}
	if (marks.length < 2) return null;
	const from = marks[0].to; // after the opening '['
	const to = marks[1].from; // before the closing ']'
	return to > from ? { from, to } : null;
}

// A mention link (`[@Naam](user:id)`) gets a token on its @Naam text; a normal
// link is colored across its whole range. Either way the markers and URL are
// still visited as children and dimmed.
function decorateLink(state: EditorState, link: SyntaxNode, ranges: Range<Decoration>[]): void {
	let url: SyntaxNode | null = null;
	for (let child = link.firstChild; child; child = child.nextSibling) {
		if (child.name === 'URL') { url = child; break; }
	}
	const isMention = url !== null && state.sliceDoc(url.from, url.to).startsWith(MENTION_HREF_PREFIX);
	if (isMention) {
		const text = linkTextRange(link);
		if (text) ranges.push(classDeco('cm-md-mention').range(text.from, text.to));
	} else {
		ranges.push(classDeco('cm-md-link').range(link.from, link.to));
	}
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
				} else if (node.name === 'ListMark' && /^[-*+]$/.test(view.state.sliceDoc(node.from, node.to)) && /^[ \t]/.test(view.state.sliceDoc(node.to, node.to + 1))) {
					// A bullet marker (- * +) renders as a styled filled dot, but only once
					// it's a real list item — immediately followed by a space. A lone "-"
					// (before the space) falls through to the dimmed literal mark below, so
					// typing "-" no longer flashes a bullet before a list exists. Ordered
					// markers (1.) and other syntax also stay dimmed literal text.
					ranges.push(classDeco('cm-md-mark cm-md-bullet').range(node.from, node.to));
				} else if (MARK_NODES.has(node.name)) {
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
			if (update.docChanged || update.viewportChanged || update.selectionSet) {
				this.decorations = buildMarkDecorations(update.view);
			}
		}
	},
	{ decorations: (plugin) => plugin.decorations },
);

/* Hanging indent: wrapped continuation lines of a list item or blockquote align
 * under the first line's text. The leading marker prefix is rendered in
 * monospace (cm-md-listprefix), so its width is exactly prefixLength × the mono
 * advance (--_marker-advance). The indent uses that same product, so the first
 * line's text and every wrapped line line up — no per-line measurement, and it
 * holds in both the sans and mono body fonts. Layout-affecting → a StateField. */
const HANGING_RE = /^(\s*(?:[-*+]|\d+[.)])\s+|\s*>+\s?)/;
const prefixMonoDeco = Decoration.mark({ class: 'cm-md-listprefix' });
const hangingLineCache: Record<number, Decoration> = {};
function hangingLineDeco(length: number): Decoration {
	return (hangingLineCache[length] ??= Decoration.line({
		attributes: {
			style: `text-indent:calc(${length} * var(--_marker-advance) * -1);padding-left:calc(${length} * var(--_marker-advance))`,
		},
	}));
}

/** Whether `pos` sits inside a fenced or indented code block — where a leading
 *  `-`/`1.`/`>` is literal code, not a list or quote marker. */
const CODE_BLOCK_NODES = new Set(['FencedCode', 'CodeBlock']);

function inCodeBlock(state: EditorState, pos: number): boolean {
	return enclosingNamed(state, pos, 1, CODE_BLOCK_NODES) !== null;
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
		if (match && match[1].length && !inCodeBlock(state, from)) {
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
	update: (value, tr) => (tr.docChanged ? buildHangingIndent(tr.state) : value),
	provide: (field) => EditorView.decorations.from(field),
});

/* @-mentions collapse fully: the whole `[@Naam](user:id)` token is replaced by
 * an atomic token widget — the syntax is hidden, the id is protected, and the
 * cursor steps over it (backspace removes the whole mention). */
class MentionWidget extends WidgetType {
	constructor(readonly label: string, readonly id: string, readonly selected: boolean) {
		super();
	}

	eq(other: MentionWidget): boolean {
		return other.label === this.label && other.id === this.id && other.selected === this.selected;
	}

	toDOM(): HTMLElement {
		const token = document.createElement('span');
		token.className = 'cm-md-mention-token';
		token.setAttribute('data-user', this.id);
		if (this.selected) token.setAttribute('data-selected', '');
		// The @ is rendered as the DS 'at' icon — a separate, vertically-centered
		// prefix that aligns cleanly with the name.
		const at = document.createElement('nldd-icon');
		at.className = 'cm-md-mention-token-icon';
		at.setAttribute('icon', 'at');
		at.setAttribute('aria-hidden', 'true');
		const name = document.createElement('span');
		name.textContent = this.label;
		token.append(at, name);
		return token;
	}
}

function buildMentionChips(state: EditorState): DecorationSet {
	const ranges: Range<Decoration>[] = [];
	const sel = state.selection.main;
	syntaxTree(state).iterate({
		enter: (node) => {
			if (node.name !== 'Link') return;
			const link = node.node;
			let url: SyntaxNode | null = null;
			for (let child = link.firstChild; child; child = child.nextSibling) {
				if (child.name === 'URL') { url = child; break; }
			}
			if (!url || !state.sliceDoc(url.from, url.to).startsWith(MENTION_HREF_PREFIX)) return;
			const text = linkTextRange(link);
			if (!text) return;
			const label = unescapeMentionLabel(state.sliceDoc(text.from, text.to).replace(/^@/, ''));
			const id = decodeMentionId(state.sliceDoc(url.from, url.to).slice(MENTION_HREF_PREFIX.length));
			const selected = !sel.empty && sel.from <= link.from && sel.to >= link.to;
			ranges.push(Decoration.replace({ widget: new MentionWidget(label, id, selected) }).range(link.from, link.to));
		},
	});
	return Decoration.set(ranges, true);
}

/** Whether moving the selection from `before` to `after` changes which mention a
 *  selection covers. Only then is the chip set worth rebuilding: walking the
 *  whole syntax tree on every arrow key, to find that nothing looks different,
 *  is the expensive way to do nothing. */
function coverageChanged(chips: DecorationSet, before: { from: number; to: number }, after: { from: number; to: number }): boolean {
	let changed = false;
	chips.between(0, 1e9, (from, to) => {
		const covers = (sel: { from: number; to: number }): boolean => sel.from !== sel.to && sel.from <= from && sel.to >= to;
		if (covers(before) !== covers(after)) {
			changed = true;
			return false;
		}
		return undefined;
	});
	return changed;
}

const mentionChipField = StateField.define<DecorationSet>({
	create: (state) => buildMentionChips(state),
	// Rebuild on doc changes and on selection changes (the latter drives the
	// selected/darker state of a covered mention).
	update: (value, tr) => {
		if (tr.docChanged) return buildMentionChips(tr.state);
		if (tr.startState.selection.eq(tr.state.selection)) return value;
		return coverageChanged(value, tr.startState.selection.main, tr.state.selection.main)
			? buildMentionChips(tr.state)
			: value;
	},
	provide: (field) => EditorView.decorations.from(field),
});

// Treat each token as one unit so the cursor steps over it and backspace removes
// the whole mention rather than breaking the hidden (user:id) syntax.
const mentionAtomicRanges = EditorView.atomicRanges.of(
	(view) => view.state.field(mentionChipField, false) ?? Decoration.none,
);

/** Markdown language (with GFM) plus the hybrid inline-styling decorations. */
export const markdownEditing: Extension = [
	markdown({ extensions: GFM }),
	markDecorationPlugin,
	heldEmphasis,
	hangingIndentField,
	// Prec.highest keeps the mention chip the innermost decoration, so it nests inside
	// a heading/bold run and inherits its font (scaling with it) instead of sitting at
	// the base size as an outer sibling.
	Prec.highest(mentionChipField),
	mentionAtomicRanges,
];

// The mention Link node at `pos` (resolving toward `side`), or null.
function mentionLinkAt(state: EditorState, pos: number, side: -1 | 1): SyntaxNode | null {
	return enclosingNode(state, pos, side, (node) => {
		if (node.name !== 'Link') return false;
		let url: SyntaxNode | null = null;
		for (let child = node.firstChild; child; child = child.nextSibling) {
			if (child.name === 'URL') { url = child; break; }
		}
		return url !== null && state.sliceDoc(url.from, url.to).startsWith(MENTION_HREF_PREFIX);
	});
}

/** The mention whose collapsed token contains `pos` (used to select it on click). */
export function mentionRangeAt(state: EditorState, pos: number): { from: number; to: number } | null {
	const link = mentionLinkAt(state, pos, 1);
	return link ? { from: link.from, to: link.to } : null;
}

/** A mention token ending exactly at `pos` (cursor just after it — backspace). */
export function mentionRangeEndingAt(state: EditorState, pos: number): { from: number; to: number } | null {
	const link = mentionLinkAt(state, pos, -1);
	return link && link.to === pos ? { from: link.from, to: link.to } : null;
}

/** A mention token starting exactly at `pos` (cursor just before it — delete). */
export function mentionRangeStartingAt(state: EditorState, pos: number): { from: number; to: number } | null {
	const link = mentionLinkAt(state, pos, 1);
	return link && link.from === pos ? { from: link.from, to: link.to } : null;
}
