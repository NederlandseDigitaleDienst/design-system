import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';
import { minimalChange } from '../../../utilities/codemirror/codemirror-element.js';
import type { NLDDTextEditor } from './text-editor.js';

type El = NLDDTextEditor & { view: any };

async function editor(html = '<nldd-text-editor accessible-label="t"></nldd-text-editor>', value = 'Hallo wereld'): Promise<El> {
	const el = await fixture<El>(html);
	el.value = value;
	await el.updateComplete; await waitForUpdate(el);
	return el;
}

const caret = (el: El): number => el.view.state.selection.main.head;
const type = (el: El, at: number, text: string): void => el.view.dispatch({ changes: { from: at, insert: text }, selection: { anchor: at + text.length }, userEvent: 'input.type' });

describe('minimalChange', () => {
	it('finds the one range that differs', () => {
		expect(minimalChange('Hallo wereld', 'Hallo mooie wereld')).toEqual({ from: 6, to: 6, insert: 'mooie ' });
		expect(minimalChange('abc', 'abc')).toBeNull();
		expect(minimalChange('aaa', 'aa')).toEqual({ from: 2, to: 3, insert: '' });
		expect(minimalChange('', 'x')).toEqual({ from: 0, to: 0, insert: 'x' });
	});
});

describe('nldd-text-editor changes from outside', () => {
	let el: El | undefined;
	afterEach(() => { if (el) cleanup(el); el = undefined; });

	it('keeps the caret in place when value is set', async () => {
		el = await editor();
		el.view.dispatch({ selection: { anchor: 6 } }); // before "wereld"
		el.value = 'Ja. Hallo wereld';
		await el.updateComplete;
		expect(caret(el)).toBe(10);
	});

	it('keeps a selection when value changes elsewhere', async () => {
		el = await editor();
		el.view.dispatch({ selection: { anchor: 0, head: 5 } }); // "Hallo"
		el.value = 'Hallo wereld, tot ziens';
		await el.updateComplete;
		const { from, to } = el.view.state.selection.main;
		expect(el.view.state.sliceDoc(from, to)).toBe('Hallo');
	});

	it('keeps a value set from outside out of the undo history', async () => {
		el = await editor();
		type(el, 12, '!');
		await waitForUpdate(el);
		el.value = 'Ja. Hallo wereld!';
		await el.updateComplete;
		el.undo();
		await waitForUpdate(el);
		expect(el.value).toBe('Ja. Hallo wereld');
	});

	it('applies several changes at once, in the offsets of the text before them', async () => {
		el = await editor();
		el.applyChanges([{ from: 6, to: 12, insert: 'iedereen' }, { from: 0, insert: 'Nou, ' }]);
		await waitForUpdate(el);
		expect(el.value).toBe('Nou, Hallo iedereen');
	});

	it('keeps the caret, the focus and the undo history, and fires no input', async () => {
		el = await editor();
		const inputs: string[] = [];
		el.addEventListener('input', (event) => inputs.push((event as CustomEvent).detail.value));
		el.view.dispatch({ selection: { anchor: 12 } });
		type(el, 12, '!');
		await waitForUpdate(el);
		inputs.length = 0;
		const focused = document.activeElement;
		el.applyChanges([{ from: 0, insert: 'Ja. ' }]);
		await waitForUpdate(el);
		expect(caret(el)).toBe(17);
		expect(document.activeElement).toBe(focused);
		expect(inputs).toEqual([]);
		el.undo();
		await waitForUpdate(el);
		expect(el.value).toBe('Ja. Hallo wereld');
	});

	it('is no change on blur when the user edited nothing', async () => {
		el = await editor();
		const changes: string[] = [];
		el.addEventListener('change', (event) => changes.push((event as CustomEvent).detail.value));
		el.view.contentDOM.dispatchEvent(new FocusEvent('focus'));
		el.applyChanges([{ from: 12, insert: '!' }]);
		el.view.contentDOM.dispatchEvent(new FocusEvent('blur'));
		expect(changes).toEqual([]);
		el.view.contentDOM.dispatchEvent(new FocusEvent('focus'));
		type(el, 0, 'Ja. ');
		el.applyChanges([{ from: 17, insert: '?' }]);
		el.view.contentDOM.dispatchEvent(new FocusEvent('blur'));
		expect(changes).toEqual(['Ja. Hallo wereld!?']);
	});

	it('works on a read-only editor', async () => {
		el = await editor('<nldd-text-editor accessible-label="t" readonly></nldd-text-editor>');
		el.applyChanges([{ from: 12, insert: '!' }]);
		await waitForUpdate(el);
		expect(el.value).toBe('Hallo wereld!');
	});

	it('does not renumber a list it changes', async () => {
		el = await editor(undefined, '1. a\n2. b');
		el.applyChanges([{ from: 4, insert: '\n1. c' }]);
		await waitForUpdate(el);
		expect(el.value).toBe('1. a\n1. c\n2. b');
	});

	it('keeps an annotation on its text', async () => {
		const annotated = await editor('<nldd-text-editor accessible-label="t" annotatable></nldd-text-editor>', 'Hallo wereld');
		el = annotated;
		annotated.annotations = [{ id: 'a', start: 6, end: 12, quote: 'wereld' } as never];
		await annotated.updateComplete; await waitForUpdate(annotated);
		annotated.applyChanges([{ from: 0, insert: 'Ja. ' }, { from: 12, insert: '!' }]);
		annotated.value = annotated.value.replace('Ja.', 'Nee.');
		await annotated.updateComplete; await waitForUpdate(annotated);
		expect(annotated.value).toBe('Nee. Hallo wereld!');
		const tint = annotated.shadowRoot!.querySelector('.cm-annotation');
		expect(tint?.textContent?.replace(/⁠/g, '').replace(/\d+$/, '')).toBe('wereld');
	});
});
