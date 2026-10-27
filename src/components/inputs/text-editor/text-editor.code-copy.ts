import { EditorState, Facet, StateField, type Extension, type Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType, type DecorationSet } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { treeAdvanced } from './text-editor.syntax.js';

/* A copy button on the opening line of every code block, at its right edge,
 * with the language (if any) on the left of the same line. The line is always
 * there, in both syntax modes, so the button never moves and entering the block
 * does not push it down.
 *
 * Same feedback as nldd-code-viewer: "Gekopieerd" for a moment, or "Kopiëren
 * mislukt" until you move on, both announced. In an editable editor it is no
 * tab stop, like the box of a task: Tab leaves the editor, and selecting the
 * code and copying it is the keyboard route. Read-only or disabled, the editor
 * is a read view and copying is the main thing to do there, so the button can
 * be focused. Where the clipboard cannot be written (no secure context), there
 * is no button: it would do nothing. */

export interface CodeCopyLabels {
	copy: () => string;
	success: () => string;
	failure: () => string;
}

export const codeCopyLabels = Facet.define<CodeCopyLabels, CodeCopyLabels>({
	combine: (values) => values[0] ?? { copy: () => 'Kopieer', success: () => 'Gekopieerd', failure: () => 'Kopiëren mislukt' },
});

const FEEDBACK_MS = 2000;

function clipboardAvailable(): boolean {
	return typeof window !== 'undefined' && window.isSecureContext && typeof navigator.clipboard?.writeText === 'function';
}

/** The code of the block whose opening line starts at `lineFrom`. */
function codeOf(state: EditorState, lineFrom: number): string {
	let code = '';
	syntaxTree(state).iterate({
		from: lineFrom,
		to: lineFrom,
		enter: (node) => {
			if (node.name !== 'FencedCode' || node.from !== lineFrom) return undefined;
			const text = node.node.getChild('CodeText');
			if (text) code = state.sliceDoc(text.from, text.to);
			return false;
		},
	});
	return code;
}

function setState(button: HTMLElement, labels: CodeCopyLabels, state: 'idle' | 'success' | 'failure'): void {
	button.dataset.state = state;
	button.querySelector('nldd-icon')!.setAttribute('icon', state === 'success' ? 'check-mark' : 'copy');
	const text = state === 'success' ? labels.success() : state === 'failure' ? labels.failure() : labels.copy();
	button.querySelector('.cm-md-code-copy-text')!.textContent = text;
	// Beside the button, not in it, or the outcome would join the button's name.
	button.nextElementSibling!.textContent = state === 'idle' ? '' : text;
}

/** The timer that ends "Gekopieerd", per button, so a button the editor
 *  removes does not have its state set after it is gone. */
const feedbackTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

class CopyButton extends WidgetType {
	/** `label` is the text of the button when the widget is made, so a button
	 *  whose text has changed is drawn again rather than kept. */
	constructor(readonly lineFrom: number, readonly focusable: boolean, readonly label: string) {
		super();
	}

	eq(other: CopyButton): boolean {
		return other.lineFrom === this.lineFrom && other.focusable === this.focusable && other.label === this.label;
	}

	toDOM(view: EditorView): HTMLElement {
		const labels = view.state.facet(codeCopyLabels);
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'cm-md-code-copy';
		if (!this.focusable) button.tabIndex = -1;
		const icon = document.createElement('nldd-icon');
		icon.setAttribute('aria-hidden', 'true');
		icon.className = 'cm-md-code-copy-icon';
		const text = document.createElement('span');
		text.className = 'cm-md-code-copy-text';
		const status = document.createElement('span');
		status.className = 'cm-md-code-copy-status';
		status.setAttribute('role', 'status');
		button.append(icon, text);
		const wrap = document.createElement('span');
		wrap.className = 'cm-md-code-copy-wrap';
		wrap.append(button, status);
		setState(button, labels, 'idle');
		// Keep the caret where it is: a press on the button is not a place in the text.
		button.addEventListener('mousedown', (event) => event.preventDefault());
		button.addEventListener('click', async () => {
			clearTimeout(feedbackTimers.get(wrap));
			try {
				await navigator.clipboard.writeText(codeOf(view.state, view.state.doc.lineAt(view.posAtDOM(button)).from));
				setState(button, labels, 'success');
				feedbackTimers.set(wrap, setTimeout(() => setState(button, labels, 'idle'), FEEDBACK_MS));
			} catch {
				// Stays until the reader moves on, as in nldd-code-viewer.
				setState(button, labels, 'failure');
			}
		});
		button.addEventListener('blur', () => {
			if (button.dataset.state === 'failure') setState(button, labels, 'idle');
		});
		button.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && button.dataset.state === 'failure') setState(button, labels, 'idle');
		});
		return wrap;
	}

	destroy(dom: HTMLElement): void {
		clearTimeout(feedbackTimers.get(dom));
	}

	// The button handles its own events; the editor leaves them alone.
	ignoreEvent(): boolean {
		return true;
	}
}

function buildButtons(state: EditorState): DecorationSet {
	if (!clipboardAvailable()) return Decoration.none;
	const ranges: Range<Decoration>[] = [];
	const focusable = state.readOnly;
	const label = state.facet(codeCopyLabels).copy();
	syntaxTree(state).iterate({
		enter: (node) => {
			if (node.name !== 'FencedCode') return undefined;
			const line = state.doc.lineAt(node.from);
			ranges.push(
				head.range(line.from),
				Decoration.widget({ widget: new CopyButton(line.from, focusable, label), side: 1 }).range(line.to),
			);
			return false;
		},
	});
	return Decoration.set(ranges, true);
}

const head = Decoration.line({ class: 'cm-md-code-head' });

function clearFailures(_event: Event, view: EditorView): boolean {
	const labels = view.state.facet(codeCopyLabels);
	for (const button of view.dom.querySelectorAll<HTMLElement>('.cm-md-code-copy[data-state="failure"]')) setState(button, labels, 'idle');
	return false;
}

/** In an editable editor the button has no focus, so a failure clears at the
 *  next press in the editor instead of on blur. */
const clearFailure = EditorView.domEventHandlers({ mousedown: clearFailures, keydown: clearFailures });

/** A copy button on the opening line of each code block. */
export function codeCopy(labels: CodeCopyLabels): Extension {
	const field = StateField.define<DecorationSet>({
		create: buildButtons,
		update: (value, tr) => (tr.docChanged || tr.reconfigured || treeAdvanced(tr.startState, tr.state) ? buildButtons(tr.state) : value),
		provide: (f) => EditorView.decorations.from(f),
	});
	return [codeCopyLabels.of(labels), field, clearFailure];
}
