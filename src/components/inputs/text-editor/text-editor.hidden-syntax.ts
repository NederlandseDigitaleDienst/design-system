import { Decoration, EditorView, ViewPlugin, WidgetType, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import { Prec, type EditorState, type Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { MENTION_HREF_PREFIX } from './text-editor.mentions.js';

/* syntax="hidden": the formatting marks of bold, italic, strikethrough, inline
 * code, links and headings are hidden, and a `---` line reads as a divider.
 * Where the caret or the selection touches a construct, its marks come back,
 * so what you edit is the markdown as it is. The document stays plain markdown;
 * only the picture changes. A read-only or disabled editor has no caret to
 * reveal anything, so there every mark is hidden.
 *
 * Lists, quotes and code blocks keep their markers: those carry the structure. */

/** The marks hidden inside inline constructs, by the construct they belong to. */
const INLINE_MARKS: Record<string, readonly string[]> = {
	EmphasisMark: ['Emphasis', 'StrongEmphasis'],
	StrikethroughMark: ['Strikethrough'],
	CodeMark: ['InlineCode'],
};

const hideMark = Decoration.replace({});
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

function revealsAnything(state: EditorState): boolean {
	return !state.readOnly && state.facet(EditorView.editable);
}

function buildHidden(view: EditorView): DecorationSet {
	const { state } = view;
	const live = revealsAnything(state);
	const revealed = (from: number, to: number): boolean =>
		live && state.selection.ranges.some((range) => range.from <= to && range.to >= from);
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
				if (!parent) return;
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
		if (update.docChanged || update.selectionSet || update.viewportChanged || update.transactions.some((tr) => tr.reconfigured)) {
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
	return Prec.highest(ViewPlugin.fromClass(HiddenSyntaxPlugin, { decorations: (plugin) => plugin.decorations }));
}
