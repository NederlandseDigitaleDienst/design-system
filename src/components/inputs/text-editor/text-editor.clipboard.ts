import type { EditorView } from '@codemirror/view';
import { currentAnnotations, pasteAnnotations } from './text-editor.annotations.js';
import { docToClean, stripSentinels } from './text-editor.annotation-sentinels.js';

/* Cut and paste that carry annotations along. The clipboard only holds text,
 * so the annotations of the last cut stay here, and a paste of that same text
 * into this editor puts them back: a move. A copy, or any other paste, is plain
 * text. The toolbar's copy()/cut()/paste() and the native Cmd/Ctrl+X/C/V both
 * go through one of these per editor. */

type CarriedAnnotation = { id: string; from: number; to: number };

export class AnnotationClipboard {
	private cut: { text: string; anns: CarriedAnnotation[] } | null = null;

	/** The annotations lying fully inside the selection, offset from its clean start. */
	private annotationsInSelection(view: EditorView): CarriedAnnotation[] {
		const { from, to } = view.state.selection.main;
		const doc = view.state.doc.toString();
		const cleanFrom = docToClean(doc, from);
		const cleanTo = docToClean(doc, to);
		return currentAnnotations(view.state)
			.filter((a) => a.from >= cleanFrom && a.to <= cleanTo)
			.map((a) => ({ id: a.id, from: a.from - cleanFrom, to: a.to - cleanFrom }));
	}

	/** The selection as clipboard text, without sentinels. */
	selectedText(view: EditorView): string {
		const { from, to } = view.state.selection.main;
		return stripSentinels(view.state.sliceDoc(from, to));
	}

	/** Remember a cut of the selection; an empty selection cuts nothing. */
	rememberCut(view: EditorView): void {
		const { from, to } = view.state.selection.main;
		this.cut = from === to ? null : { text: this.selectedText(view), anns: this.annotationsInSelection(view) };
	}

	/** A copy is plain text: a pending cut's annotations must not ride along. */
	forget(): void {
		this.cut = null;
	}

	/** Put `raw` at the selection. When it is the text of the last cut, its
	 *  annotations come along, once: a second paste would duplicate their ids. */
	paste(view: EditorView, raw: string): void {
		const text = stripSentinels(raw);
		if (!text || view.state.readOnly) return;
		const cut = this.cut;
		// A clipboard from another app may hand back CRLF where the cut holds LF.
		const sameText = (a: string, b: string): boolean => a.replace(/\r\n/g, '\n') === b.replace(/\r\n/g, '\n');
		const carry = !!(cut && sameText(cut.text, text) && cut.anns.length > 0);
		const at = docToClean(view.state.doc.toString(), view.state.selection.main.from);
		// input.paste, like CodeMirror's own paste: history groups it as one step and
		// a transaction filter can tell a paste from typing.
		const spec = { ...view.state.replaceSelection(text), userEvent: 'input.paste' };
		view.dispatch(carry ? { ...spec, effects: pasteAnnotations.of({ at, anns: cut!.anns }) } : spec);
		if (carry) this.cut = null;
	}
}
