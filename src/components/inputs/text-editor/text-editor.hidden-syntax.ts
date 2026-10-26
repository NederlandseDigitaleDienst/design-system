import { Decoration, EditorView, ViewPlugin, WidgetType, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import { Prec, StateField, type EditorState, type Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';
import { MENTION_HREF_PREFIX } from './text-editor.mentions.js';
import { treeAdvanced } from './text-editor.syntax.js';

/* syntax="hidden": the formatting marks of bold, italic, strikethrough, inline
 * code, links and headings are hidden, a bullet reads as a dot, a quote as a
 * line on the left and a `---` line as a divider.
 * Where the caret or the selection touches a construct, its marks come back,
 * so what you edit is the markdown as it is. The document stays plain markdown;
 * only the picture changes. A read-only or disabled editor has no caret to
 * reveal anything, so there every mark is hidden.
 *
 * A code block loses its fence lines (the ``` above and below), since its own
 * tint and edge already say what it is. A numbered list keeps its numbers:
 * those are content. */

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
			for (const line of fences) ranges.push(hideLine.range(line.from, line.to));
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
					for (let pos = outer.from; pos <= outer.to; ) {
						const line = state.doc.lineAt(pos);
						ranges.push(quoteLine.range(line.from));
						pos = line.to + 1;
					}
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
					if (!revealed(line.from, line.to)) ranges.push(bullet.range(node.from, node.to));
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
					if (!url || marks.length < 2 || state.sliceDoc(url.from, url.to).startsWith(MENTION_HREF_PREFIX)) return;
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
