import { EditorView } from '@codemirror/view';
import { EditorState, type Extension } from '@codemirror/state';

/* Safari, giving focus back to the editor after a click on a toolbar control,
 * can stretch the selection to the start of the content: from position 0 to the
 * old anchor. In a shadow root CodeMirror only gets that range without a
 * direction, takes the end that matches its anchor as the anchor, and so reads a
 * selection from the anchor back to 0. A line command right after it, such as a
 * list button, then changed every line above the selection.
 *
 * CodeMirror already ignores the collapsed form of this (the caret moved to the
 * start on focus); this ignores the stretched form. It only steps in for a
 * selection read from the DOM shortly after focus, before the user pressed a key
 * or a pointer in the editor, so a selection the user makes is never touched. */

/** How long after focus the browser's own selection move is expected, in ms. The
 *  same window CodeMirror uses for the collapsed form. */
const FOCUS_WINDOW_MS = 200;

export function focusSelectionGuard(): Extension {
	let focusAt = 0;
	let inputAt = 0;
	const input = (): boolean => {
		inputAt = Date.now();
		return false;
	};

	return [
		EditorView.domEventHandlers({
			focus: () => {
				focusAt = Date.now();
				return false;
			},
			keydown: input,
			pointerdown: input,
			touchstart: input,
		}),
		EditorState.transactionFilter.of((tr) => {
			// A selection read from the DOM is "select"; a mouse selection is
			// "select.pointer" and goes through CodeMirror's own handling.
			if (tr.docChanged || !tr.selection || !tr.isUserEvent('select') || tr.isUserEvent('select.pointer')) return tr;
			const now = Date.now();
			if (now - focusAt > FOCUS_WINDOW_MS || inputAt >= focusAt) return tr;
			const before = tr.startState.selection.main;
			const after = tr.selection.main;
			if (before.from === 0 || after.from !== 0) return tr;
			const kept = after.anchor === 0 ? after.head : after.anchor;
			if (kept !== before.anchor && kept !== before.head) return tr;
			// Setting the selection again makes CodeMirror write it back to the DOM,
			// which still holds the stretched range.
			return { selection: tr.startState.selection, userEvent: 'select' };
		}),
	];
}
