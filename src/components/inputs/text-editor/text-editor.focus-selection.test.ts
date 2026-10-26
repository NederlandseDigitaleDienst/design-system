import { describe, it, expect, afterEach } from 'vitest';
import { EditorView } from '@codemirror/view';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';

/* Safari, regaining focus after a toolbar click, can report the selection as a
 * range from the start of the content to the old anchor. CodeMirror read that as
 * a selection from the anchor back to position 0, so the next line command ran
 * over every line above. These tests write that range into the DOM themselves. */

type El = HTMLElement & { value: string; updateComplete: Promise<unknown>; view: EditorView };

const DOC = '# Titel\n\nWe verbeteren het burgerportaal met iedereen.';
const WORD = DOC.indexOf('burgerportaal');

async function make(): Promise<El> {
	const el = await fixture<El>('<nldd-text-editor accessible-label="t"></nldd-text-editor>');
	el.value = DOC;
	await el.updateComplete;
	await waitForUpdate(el);
	return el;
}

/** Selection changes reach CodeMirror through the async selectionchange event. */
function settle(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 50));
}

/** Put the DOM selection from `anchor` to `head`, the way the browser does. */
function domSelect(view: EditorView, anchor: number, head: number): void {
	const a = view.domAtPos(anchor);
	const h = view.domAtPos(head);
	document.getSelection()!.setBaseAndExtent(a.node, a.offset, h.node, h.offset);
}

function range(view: EditorView): [number, number] {
	const { anchor, head } = view.state.selection.main;
	return [anchor, head];
}

describe('nldd-text-editor selection on focus', () => {
	let el: El;
	afterEach(() => cleanup(el));

	it('keeps its selection when the browser stretches it to the start right after focus', async () => {
		el = await make();
		const { view } = el;
		view.dispatch({ selection: { anchor: WORD, head: WORD + 'burgerportaal'.length } });
		view.contentDOM.blur();
		view.focus();
		domSelect(view, WORD, 0);
		await settle();
		expect(range(view)).toEqual([WORD, WORD + 'burgerportaal'.length]);
	});

	it('puts the DOM selection back where the editor has it', async () => {
		el = await make();
		const { view } = el;
		view.dispatch({ selection: { anchor: WORD, head: WORD + 'burgerportaal'.length } });
		view.contentDOM.blur();
		view.focus();
		domSelect(view, WORD, 0);
		await settle();
		expect(document.getSelection()!.toString()).toBe('burgerportaal');
	});

	it('takes a selection to the start that comes later than the focus', async () => {
		el = await make();
		const { view } = el;
		view.dispatch({ selection: { anchor: WORD, head: WORD + 'burgerportaal'.length } });
		view.contentDOM.blur();
		view.focus();
		await new Promise((resolve) => setTimeout(resolve, 400));
		domSelect(view, WORD, 0);
		await settle();
		expect(range(view)).toEqual([WORD, 0]);
	});

	it('takes a selection to the start the user makes with the keyboard after focus', async () => {
		el = await make();
		const { view } = el;
		view.dispatch({ selection: { anchor: WORD, head: WORD + 'burgerportaal'.length } });
		view.contentDOM.blur();
		view.focus();
		view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
		domSelect(view, WORD, 0);
		await settle();
		expect(range(view)).toEqual([WORD, 0]);
	});
});
