import { describe, it, expect, afterEach } from 'vitest';
import { EditorView } from '@codemirror/view';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';
import type { NLDDTextEditor } from './text-editor.js';

type El = NLDDTextEditor & { view: EditorView };

/** Types `text` at the caret the way the browser does: through the input
 *  handlers first, a plain insert when none takes it. */
function type(el: El, text: string): void {
	for (const char of text) {
		const view = el.view;
		const { from, to } = view.state.selection.main;
		const insert = () => view.state.update({ changes: { from, to, insert: char }, selection: { anchor: from + char.length }, userEvent: 'input.type' });
		const handled = view.state.facet(EditorView.inputHandler).some((handler) => handler(view, from, to, char, insert));
		if (!handled) view.dispatch(insert());
	}
}

function enter(el: El): void {
	el.view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
}

const doc = (el: El): string => el.view.state.doc.toString();

describe('nldd-text-editor typing a list', () => {
	let el: El;
	afterEach(() => cleanup(el));

	async function editor(value: string): Promise<El> {
		el = await fixture<El>('<nldd-text-editor accessible-label="t"></nldd-text-editor>');
		el.value = value;
		await el.updateComplete; await waitForUpdate(el);
		el.view.dispatch({ selection: { anchor: el.view.state.doc.length } });
		return el;
	}

	it('keeps one bullet when the user types one after Enter', async () => {
		await editor('Drie punten:\n- eerste');
		enter(el);
		type(el, '- tweede');
		expect(doc(el)).toBe('Drie punten:\n- eerste\n- tweede');
	});

	it('keeps the number the editor put there', async () => {
		await editor('1. eerste');
		enter(el);
		type(el, '2. tweede');
		expect(doc(el)).toBe('1. eerste\n2. tweede');
		enter(el);
		type(el, '5. derde');
		expect(doc(el)).toBe('1. eerste\n2. tweede\n3. derde');
	});

	it('starts a list under the item above when 1. is typed on a later number', async () => {
		await editor('1. eerste');
		enter(el);
		type(el, '1. sub');
		expect(doc(el)).toBe('1. eerste\n   1. sub');
	});

	it('keeps 1. on a list that just started at 1', async () => {
		await editor('Tekst\n\n');
		type(el, '1. eerste');
		expect(doc(el)).toBe('Tekst\n\n1. eerste');
	});

	it('lets a marker of the other kind take the place of the editor\'s', async () => {
		await editor('- a\n  - test');
		enter(el);
		type(el, '1. eerste');
		expect(doc(el)).toBe('- a\n  - test\n  1. eerste');
	});

	it('turns a numbered item into a bullet the same way', async () => {
		await editor('1. eerste');
		enter(el);
		type(el, '- punt');
		expect(doc(el)).toBe('1. eerste\n- punt');
	});

	it('nests one level when spaces come before the typed marker', async () => {
		await editor('- eerste');
		enter(el);
		type(el, '  - genest');
		expect(doc(el)).toBe('- eerste\n  - genest');
	});

	it('keeps one quote marker', async () => {
		await editor('> citaat');
		enter(el);
		type(el, '> verder');
		expect(doc(el)).toBe('> citaat\n> verder');
	});

	it('undoes the merge back to what was typed', async () => {
		await editor('- eerste');
		enter(el);
		type(el, '- ');
		expect(doc(el)).toBe('- eerste\n- ');
		el.undo();
		expect(doc(el)).toBe('- eerste\n- - ');
	});

	it('gives a single space before a marker the indent markdown needs', async () => {
		await editor('- a\n');
		type(el, ' - b');
		expect(doc(el)).toBe('- a\n  - b');
	});

	it('nests under a numbered item at the column of its text', async () => {
		await editor('1. a\n');
		type(el, ' - b');
		expect(doc(el)).toBe('1. a\n   - b');
	});

	it('nests only one level, however many spaces', async () => {
		await editor('- a\n  - b\n');
		type(el, '         - c');
		expect(doc(el)).toBe('- a\n  - b\n    - c');
	});

	it('snaps back to the level whose marker it reaches', async () => {
		await editor('- a\n  - b\n    - c\n');
		type(el, '   - d');
		expect(doc(el)).toBe('- a\n  - b\n    - c\n  - d');
	});

	it('takes the space away when there is no list above', async () => {
		await editor('Tekst\n\n');
		type(el, ' - a');
		expect(doc(el)).toBe('Tekst\n\n- a');
	});

	it('keeps one bullet when a marker is typed before the text of an item', async () => {
		await editor('- Tweede punt\n- Aanvraag');
		el.view.dispatch({ selection: { anchor: '- Tweede punt\n- '.length } });
		type(el, '- ');
		expect(doc(el)).toBe('- Tweede punt\n- Aanvraag');
		expect(el.view.state.selection.main.head).toBe('- Tweede punt\n- '.length);
	});

	it('nests an item with text when spaces come before the typed marker', async () => {
		await editor('- Tweede punt\n- Aanvraag');
		el.view.dispatch({ selection: { anchor: '- Tweede punt\n- '.length } });
		type(el, '  - ');
		expect(doc(el)).toBe('- Tweede punt\n  - Aanvraag');
	});

	it('makes an item with text numbered with a typed number', async () => {
		await editor('- Aanvraag');
		el.view.dispatch({ selection: { anchor: 2 } });
		type(el, '1. ');
		expect(doc(el)).toBe('1. Aanvraag');
	});

	it('leaves a code block alone', async () => {
		await editor('```\n- a\n');
		type(el, ' - b');
		expect(doc(el)).toBe('```\n- a\n - b');
	});
});

describe('nldd-text-editor Enter on an empty item', () => {
	let el: El;
	afterEach(() => cleanup(el));

	async function editor(value: string): Promise<El> {
		el = await fixture<El>('<nldd-text-editor accessible-label="t"></nldd-text-editor>');
		el.value = value;
		await el.updateComplete; await waitForUpdate(el);
		el.view.dispatch({ selection: { anchor: el.view.state.doc.length } });
		return el;
	}

	it('ends the list on the second item too', async () => {
		await editor('- a');
		enter(el);
		enter(el);
		type(el, 'b');
		expect(doc(el)).toBe('- a\nb');
	});

	it('ends a longer list', async () => {
		await editor('- a\n- b');
		enter(el);
		enter(el);
		type(el, 'c');
		expect(doc(el)).toBe('- a\n- b\nc');
	});

	it('steps one level out of a nested list', async () => {
		await editor('- a\n  - b');
		enter(el);
		enter(el);
		expect(doc(el)).toBe('- a\n  - b\n- ');
	});

	it('still makes a loose list with a blank line and a typed marker', async () => {
		await editor('- a');
		enter(el);
		enter(el);
		enter(el);
		type(el, '- b');
		expect(doc(el)).toBe('- a\n\n- b');
	});
});

describe('nldd-text-editor Backspace right after a list marker', () => {
	let el: El;
	afterEach(() => cleanup(el));

	async function editor(value: string): Promise<El> {
		el = await fixture<El>('<nldd-text-editor accessible-label="t"></nldd-text-editor>');
		el.value = value;
		await el.updateComplete; await waitForUpdate(el);
		el.view.dispatch({ selection: { anchor: el.view.state.doc.length } });
		return el;
	}

	const backspace = (): void => {
		el.view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
	};

	it('steps a nested item one level out, marker and all', async () => {
		await editor('- a\n  - b\n    - ');
		backspace();
		expect(doc(el)).toBe('- a\n  - b\n  - ');
		backspace();
		expect(doc(el)).toBe('- a\n  - b\n- ');
	});

	it('leaves the list on the first level', async () => {
		await editor('- a\n- ');
		backspace();
		expect(doc(el)).toBe('- a\n');
	});

	it('keeps the text of an item and the caret before it', async () => {
		await editor('- a\n  - tekst');
		el.view.dispatch({ selection: { anchor: '- a\n  - '.length } });
		backspace();
		expect(doc(el)).toBe('- a\n- tekst');
		expect(el.view.state.selection.main.head).toBe('- a\n- '.length);
	});

	it('steps a numbered item out under a numbered parent, renumbered', async () => {
		await editor('1. a\n   1. b\n   2. ');
		backspace();
		expect(doc(el)).toBe('1. a\n   1. b\n2. ');
	});
});
