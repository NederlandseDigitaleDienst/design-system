import { Decoration, EditorView, ViewPlugin, WidgetType, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import { Prec, StateField, type EditorState, type Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';
import { isMentionLink } from './text-editor.mention.js';
import { forEachLineStart, treeAdvanced } from './text-editor.syntax.js';
import { taskBox } from './text-editor.tasks.js';

/* syntax="hidden": the formatting marks of bold, italic, strikethrough, inline
 * code, links and headings are hidden, a bullet reads as a dot, a quote as a
 * line on the left and a `---` line as a divider.
 * Where the caret or the selection touches a construct, its marks come back,
 * so what you edit is the markdown as it is. The document stays plain markdown;
 * only the picture changes. A read-only or disabled editor has no caret to
 * reveal anything, so there every mark is hidden.
 *
 * A code block loses its closing fence line, since its own tint and edge
 * already say what it is. Its opening line stays as the head of the block, with
 * the language as a label and a copy button, and only its backticks go. A numbered list keeps its numbers, in the color
 * of the text: those are content. */

/** The marks hidden inside inline constructs, by the construct they belong to. */
const INLINE_MARKS: Record<string, readonly string[]> = {
	EmphasisMark: ['Emphasis', 'StrongEmphasis'],
	StrikethroughMark: ['Strikethrough'],
	CodeMark: ['InlineCode'],
};

const hideMark = Decoration.replace({});
// The character stays, in its mono width, so a wrapped line still aligns; a dot
// is drawn over it (see .cm-md-bullet).
const bullet = Decoration.mark({ class: 'cm-md-bullet' });
// A task reads as its box alone, in the place of the bullet: the bullet and the
// space after it are taken out, and the line's hanging indent shrinks with them.
const TASK_PREFIX_RE = /^(\s*)[-*+]\s+\[[ xX]\](\s+)/;
/** The width of the box in mono advances; matches .cm-md-task-box. */
const TASK_BOX_WIDTH = 2.5;
// !important: CodeMirror joins this style with the full-prefix indent of the
// list into one style attribute, where that one comes last and would win.
const taskIndentCache: Record<number, Decoration> = {};
function taskIndent(length: number): Decoration {
	return (taskIndentCache[length] ??= Decoration.line({
		attributes: {
			style: `text-indent:calc(${length} * var(--_text-editor-marker-advance) * -1) !important;padding-left:calc(${length} * var(--_text-editor-marker-advance)) !important`,
		},
	}));
}
// The number of a numbered list is content, so it takes the color of the text
// rather than the dimmed color of a mark. Only the color: the mono width stays.
const ordinal = Decoration.mark({ class: 'cm-md-ordinal' });
// A quote reads as a line on the left. Its `>` keeps its width, so the text
// starts in the same place whether the line or the marks show. The whole quote
// is the construct: the caret anywhere in it shows every `>` and drops the line.
const quoteLine = Decoration.line({ class: 'cm-md-quote-line' });
const quoteMark = Decoration.mark({ class: 'cm-md-quote-mark-hidden' });
// With its backticks hidden, inline code gets room inside its tint as padding on
// the text. Not as a widget: Safari measured the selection wrong beside one.
const bareCode = Decoration.mark({ class: 'cm-md-code-bare' });

class RuleWidget extends WidgetType {
	toDOM(): HTMLElement {
		const rule = document.createElement('span');
		rule.className = 'cm-md-rule';
		rule.setAttribute('aria-hidden', 'true');
		return rule;
	}

	eq(): boolean {
		return true;
	}

	ignoreEvent(): boolean {
		return false;
	}
}
const rule = Decoration.replace({ widget: new RuleWidget() });

function outermostQuote(node: SyntaxNode): SyntaxNode {
	let outer = node;
	for (let up = node.parent; up; up = up.parent) if (up.name === 'Blockquote') outer = up;
	return outer;
}

function revealsAnything(state: EditorState): boolean {
	return !state.readOnly && state.facet(EditorView.editable);
}

function touchesSelection(state: EditorState, from: number, to: number): boolean {
	return revealsAnything(state) && state.selection.ranges.some((range) => range.from <= to && range.to >= from);
}

const hideLine = Decoration.replace({ block: true });
const hideFence = Decoration.replace({});
// The language of a code block is information, not markup: its fence line stays
// as a label in the secondary color, with only the backticks taken out.
const codeLanguage = Decoration.mark({ class: 'cm-md-code-language' });

/** The fence lines of every code block the selection does not touch. Taking a
 *  whole line out is a block decoration, which only a state field may give. */
// A code block sits at the top level, in a list item or in a quote; nothing
// else can hold one, so the walk does not descend into it.
const FENCE_CONTAINERS = new Set(['Document', 'Blockquote', 'BulletList', 'OrderedList', 'ListItem']);

function buildHiddenFences(state: EditorState): DecorationSet {
	const ranges: Range<Decoration>[] = [];
	syntaxTree(state).iterate({
		enter: (node) => {
			if (node.name !== 'FencedCode') return FENCE_CONTAINERS.has(node.name);
			if (touchesSelection(state, node.from, node.to)) return false;
			const fences = node.node.getChildren('CodeMark').map((mark) => state.doc.lineAt(mark.from));
			const first = state.doc.lineAt(node.from).number;
			const last = state.doc.lineAt(node.to).number;
			// A block with no lines of its own would vanish with its fences.
			if (last - first + 1 <= fences.length) return false;
			// The opening line stays, as the head of the block: the language on the
			// left, the copy button on the right (text-editor.code-copy.ts). Only its
			// backticks go.
			const info = node.node.getChild('CodeInfo');
			const open = node.node.getChild('CodeMark')!;
			for (const [index, line] of fences.entries()) {
				if (index === 0) {
					ranges.push(hideFence.range(open.from, info ? info.from : open.to));
					if (info) ranges.push(codeLanguage.range(info.from, info.to));
				} else {
					ranges.push(hideLine.range(line.from, line.to));
				}
			}
			return false;
		},
	});
	return Decoration.set(ranges, true);
}

/** The code blocks the selection touches, as a key: a caret that moves within
 *  a block, or between lines of text, leaves the fences as they are. */
function touchedFences(state: EditorState): string {
	const touched: number[] = [];
	for (const range of state.selection.ranges) {
		syntaxTree(state).iterate({
			from: range.from,
			to: range.to,
			enter: (node) => {
				if (node.name === 'FencedCode') touched.push(node.from);
				return node.name !== 'FencedCode' && FENCE_CONTAINERS.has(node.name);
			},
		});
	}
	return touched.join(',');
}

const hiddenFences = StateField.define<DecorationSet>({
	create: buildHiddenFences,
	update: (value, tr) => {
		if (tr.docChanged || tr.reconfigured || treeAdvanced(tr.startState, tr.state)) return buildHiddenFences(tr.state);
		if (tr.selection && touchedFences(tr.startState) !== touchedFences(tr.state)) return buildHiddenFences(tr.state);
		return value;
	},
	provide: (field) => EditorView.decorations.from(field),
});

function buildHidden(view: EditorView): DecorationSet {
	const { state } = view;
	const revealed = (from: number, to: number): boolean => touchesSelection(state, from, to);
	const ranges: Range<Decoration>[] = [];
	for (const { from, to } of view.visibleRanges) {
		syntaxTree(state).iterate({
			from,
			to,
			enter: (node) => {
				const parent = node.node.parent;
				if (node.name === 'HorizontalRule') {
					if (!revealed(node.from, node.to)) ranges.push(rule.range(node.from, node.to));
					return false;
				}
				if (node.name === 'Blockquote') {
					// The outermost quote is the construct; a nested one lies inside it.
					const outer = outermostQuote(node.node);
					if (outer !== node.node || revealed(outer.from, outer.to)) return;
					forEachLineStart(state, outer.from, outer.to, (lineFrom) => ranges.push(quoteLine.range(lineFrom)));
					return;
				}
				if (!parent) return;
				if (node.name === 'QuoteMark') {
					const outer = outermostQuote(node.node);
					const end = state.sliceDoc(node.to, node.to + 1) === ' ' ? node.to + 1 : node.to;
					if (!revealed(outer.from, outer.to)) ranges.push(quoteMark.range(node.from, end));
					return;
				}
				// A bullet only once it is a real list item, followed by a space, so
				// typing "-" does not flash a dot before a list exists. Its character
				// shows on the line the caret is on.
				if (node.name === 'ListMark' && /^[-*+]$/.test(state.sliceDoc(node.from, node.to)) && /^[ \t]/.test(state.sliceDoc(node.to, node.to + 1))) {
					const line = state.doc.lineAt(node.from);
					if (revealed(line.from, line.to)) return;
					const task = TASK_PREFIX_RE.exec(line.text);
					const marker = task && node.node.parent?.getChild('Task')?.getChild('TaskMarker');
					if (task && marker) {
						ranges.push(
							taskIndent(task[1].length + TASK_BOX_WIDTH + task[2].length).range(line.from),
							hideMark.range(node.from, marker.from),
							taskBox(state, /x/i.test(state.sliceDoc(marker.from, marker.to))).range(marker.from, marker.to),
						);
						return;
					}
					ranges.push(bullet.range(node.from, node.to));
					return;
				}
				if (node.name === 'ListMark' && /^\d+[.)]$/.test(state.sliceDoc(node.from, node.to))) {
					ranges.push(ordinal.range(node.from, node.to));
					return;
				}
				if (node.name === 'HeaderMark' && parent.name.startsWith('ATXHeading')) {
					const end = state.sliceDoc(node.to, node.to + 1) === ' ' ? node.to + 1 : node.to;
					if (!revealed(parent.from, parent.to)) ranges.push(hideMark.range(node.from, end));
					return;
				}
				// A link shows only its text. A mention is a token of its own already.
				if (node.name === 'Link') {
					const url = node.node.getChild('URL');
					const marks = node.node.getChildren('LinkMark');
					if (!url || marks.length < 2 || isMentionLink(state, node.node)) return;
					if (!revealed(node.from, node.to)) {
						ranges.push(hideMark.range(marks[0].from, marks[0].to), hideMark.range(marks[1].from, node.to));
					}
					return;
				}
				if (!INLINE_MARKS[node.name]?.includes(parent.name) || revealed(parent.from, parent.to)) return;
				ranges.push(hideMark.range(node.from, node.to));
				if (node.name === 'CodeMark' && node.from === parent.from) {
					const close = parent.lastChild;
					if (close && close.from > node.to) ranges.push(bareCode.range(node.to, close.from));
				}
			},
		});
	}
	return Decoration.set(ranges, true);
}

/** How often a wrong selection drawing is mended before the editor lets it be. */
const MAX_MENDS = 3;

class HiddenSyntaxPlugin {
	decorations: DecorationSet;
	// Checked right after the layer is drawn, before the browser paints.
	private layerObserver = new MutationObserver(() => this.mendSelection());
	private observing = false;
	private checked = '';
	private mends = 0;

	constructor(private view: EditorView) {
		this.decorations = buildHidden(view);
		// The selection layer is made by drawSelection, after this plugin.
		queueMicrotask(() => this.observeLayer());
	}

	private observeLayer(): void {
		if (this.observing) return;
		const layer = this.view.dom.querySelector('.cm-selectionLayer');
		if (!layer) return;
		this.layerObserver.observe(layer, { childList: true, subtree: true, attributes: true });
		this.observing = true;
	}

	update(update: ViewUpdate): void {
		this.observeLayer();
		if (update.docChanged || update.selectionSet || update.viewportChanged || treeAdvanced(update.startState, update.state) || update.transactions.some((tr) => tr.reconfigured)) {
			this.decorations = buildHidden(update.view);
		}
	}

	/** Hidden marks change the width of a line as the caret moves. Safari, in an
	 *  iframe, then sometimes draws a selection on one visual line as if it ran
	 *  over three, measured while the line still moved. The first piece starts
	 *  where the selection starts and the last ends where it ends, so they are
	 *  joined into one, and the layer is drawn anew so its own record is right. */
	private mendSelection(): void {
		const { view } = this;
		const { from, to, empty } = view.state.selection.main;
		const key = `${from}-${to}-${view.state.doc.length}`;
		if (key !== this.checked) {
			this.checked = key;
			this.mends = 0;
		}
		if (empty || this.mends >= MAX_MENDS) return;
		const layer = view.dom.querySelector('.cm-selectionLayer');
		const pieces = layer ? [...layer.querySelectorAll<HTMLElement>('.cm-selectionBackground')] : [];
		if (pieces.length < 2) return;
		const start = view.coordsAtPos(from, 1);
		const end = view.coordsAtPos(to, -1);
		if (!start || !end || Math.abs(start.top - end.top) > 2) return;
		this.mends += 1;
		const [first] = pieces;
		const last = pieces[pieces.length - 1];
		first.style.width = `${last.offsetLeft + last.offsetWidth - first.offsetLeft}px`;
		pieces.slice(1).forEach((piece) => piece.remove());
		view.dispatch({ selection: view.state.selection });
	}

	destroy(): void {
		this.layerObserver.disconnect();
	}
}

/** The syntax="hidden" extension. Highest precedence, so hiding a mark wins over
 *  the dimmed styling the markdown decorations give it. */
export function hiddenSyntax() {
	return [Prec.highest(ViewPlugin.fromClass(HiddenSyntaxPlugin, { decorations: (plugin) => plugin.decorations })), hiddenFences];
}
