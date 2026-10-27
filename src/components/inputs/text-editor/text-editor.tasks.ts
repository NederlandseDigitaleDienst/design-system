import { EditorState, Facet, Prec, type Extension } from '@codemirror/state';
import { Decoration, EditorView, WidgetType, keymap } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

/* The box of a task item, `- [ ]` or `- [x]`, drawn as a box with
 * syntax="hidden" (see text-editor.hidden-syntax.ts, which places it).
 *
 * The box stands where the bullet was: it is the bullet of a task. Like every
 * other mark of the hidden mode, the markdown comes back on the line the caret
 * is on, so a task you are typing in shows `- [ ]` and takes an `x` as well.
 * A click on the box checks or unchecks it without moving the caret, so the
 * box stays a box. Cmd/Ctrl+Enter does the same for the tasks on the lines of
 * the selection, in both syntax modes.
 *
 * It is not a control of its own: no tab stop, no focus ring. Tab leaves the
 * editor, as everywhere else in it, and a long list of boxes as tab stops would
 * cost a Tab per task to get out. Its state is in the text a screen reader
 * reads, through a label. */

export interface TaskLabels {
	open: () => string;
	done: () => string;
}

/** The texts a screen reader reads in place of a box. */
export const taskLabels = Facet.define<TaskLabels, TaskLabels>({
	combine: (values) => values[0] ?? { open: () => 'Taak, open', done: () => 'Taak, afgerond' },
});

class TaskBox extends WidgetType {
	/** `label` is what a screen reader reads for the box, so a box whose text
	 *  has changed is drawn again rather than kept. */
	constructor(readonly checked: boolean, readonly label: string) {
		super();
	}

	eq(other: TaskBox): boolean {
		return other.checked === this.checked && other.label === this.label;
	}

	toDOM(): HTMLElement {
		const box = document.createElement('span');
		box.className = 'cm-md-task-box';
		if (this.checked) box.setAttribute('data-checked', '');
		const icon = document.createElement('nldd-icon');
		icon.className = 'cm-md-task-box-icon';
		icon.setAttribute('icon', this.checked ? 'check-mark-square' : 'square');
		icon.setAttribute('aria-hidden', 'true');
		const label = document.createElement('span');
		label.className = 'cm-md-task-box-label';
		label.textContent = this.label;
		box.append(icon, label);
		return box;
	}

	// The click is the editor's to handle (see `toggleOnClick`), so a press on
	// the box does not also place the caret.
	ignoreEvent(): boolean {
		return false;
	}
}

/** The box that replaces the `[ ]` or `[x]` of a task. */
export function taskBox(state: EditorState, checked: boolean): Decoration {
	const labels = state.facet(taskLabels);
	return Decoration.replace({ widget: new TaskBox(checked, checked ? labels.done() : labels.open()) });
}

/** Every task marker in the document: where it is and whether it is checked. */
function taskMarkers(state: EditorState): { from: number; to: number; checked: boolean }[] {
	const found: { from: number; to: number; checked: boolean }[] = [];
	syntaxTree(state).iterate({
		enter: (node) => {
			if (node.name === 'FencedCode' || node.name === 'CodeBlock') return false;
			if (node.name !== 'TaskMarker') return undefined;
			found.push({ from: node.from, to: node.to, checked: /x/i.test(state.sliceDoc(node.from, node.to)) });
			return false;
		},
	});
	return found;
}

/** The change that checks or unchecks the markers in [from, to]: all of them
 *  checked when any is open, otherwise all of them unchecked. */
function toggleMarkers(state: EditorState, from: number, to: number) {
	const markers = taskMarkers(state).filter((marker) => marker.from <= to && marker.to >= from);
	if (markers.length === 0) return null;
	const check = markers.some((marker) => !marker.checked);
	return markers.map((marker) => ({ from: marker.from + 1, to: marker.from + 2, insert: check ? 'x' : ' ' }));
}

/** Checks or unchecks the tasks on the lines of the selection. False when no
 *  line there is a task, so the key does what it would otherwise do. */
export function toggleTasks(view: EditorView): boolean {
	const { state } = view;
	if (state.readOnly) return false;
	const changes = state.selection.ranges.flatMap((range) => {
		const from = state.doc.lineAt(range.from).from;
		const to = state.doc.lineAt(range.to).to;
		return toggleMarkers(state, from, to) ?? [];
	});
	if (changes.length === 0) return false;
	view.dispatch({ changes, userEvent: 'input.task' });
	return true;
}

const toggleOnClick = EditorView.domEventHandlers({
	mousedown(event, view) {
		const box = (event.target as Element | null)?.closest?.('.cm-md-task-box');
		if (!box || event.button !== 0) return false;
		event.preventDefault();
		if (view.state.readOnly) return true;
		const pos = view.posAtDOM(box);
		const changes = toggleMarkers(view.state, pos, pos);
		if (changes) view.dispatch({ changes, userEvent: 'input.task' });
		return true;
	},
});

/** Checking a task by click and by Cmd/Ctrl+Enter, with the texts a screen
 *  reader reads for a box. */
export function tasks(labels: TaskLabels): Extension {
	return [
		taskLabels.of(labels),
		toggleOnClick,
		Prec.high(keymap.of([{ key: 'Mod-Enter', run: toggleTasks }])),
	];
}
