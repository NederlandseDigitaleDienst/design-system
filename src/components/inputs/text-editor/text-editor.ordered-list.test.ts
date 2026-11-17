import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';
import { renumberOrderedLists } from './text-editor.ordered-list.js';

/** Apply the renumber changes to a string (highest offset first, so earlier edits
 *  don't shift later ones). */
function apply(doc: string): string {
	const changes = [...renumberOrderedLists(doc)].sort((a, b) => b.from - a.from);
	let out = doc;
	for (const c of changes) out = out.slice(0, c.from) + c.insert + out.slice(c.to);
	return out;
}

describe('renumberOrderedLists', () => {
	it('forces a gap back into sequence (1, 3 → 1, 2)', () => {
		expect(apply('1. een\n3. twee')).toBe('1. een\n2. twee');
	});

	it('renumbers a whole run', () => {
		expect(apply('1. a\n3. b\n5. c')).toBe('1. a\n2. b\n3. c');
	});

	it('forces the first item to 1', () => {
		expect(apply('5. a\n8. b\n9. c')).toBe('1. a\n2. b\n3. c');
		expect(apply('3. only')).toBe('1. only');
	});

	it('leaves an already-correct list untouched', () => {
		expect(renumberOrderedLists('1. a\n2. b\n3. c')).toEqual([]);
	});

	it('handles the ) marker', () => {
		expect(apply('1) a\n3) b')).toBe('1) a\n2) b');
	});

	it('numbers nested lists independently and resumes the parent', () => {
		expect(apply('1. a\n   1. x\n   5. y\n2. b')).toBe('1. a\n   1. x\n   2. y\n2. b');
	});

	// CommonMark: nested only from the column where the item's text starts.
	it('reads an item indented less than the text above as the next item', () => {
		expect(apply('1. a\n 3. b')).toBe('1. a\n 2. b');
		expect(apply('1. a\n  3. b')).toBe('1. a\n  2. b');
		expect(apply('1. a\n   3. b')).toBe('1. a\n   1. b');
		expect(apply('10. a\n   3. b\n    3. c')).toBe('1. a\n   2. b\n    3. c');
	});

	it('ends the list at text after a blank line that does not reach the item text', () => {
		expect(apply('1. a\n\n text\n2. b')).toBe('1. a\n\n text\n1. b');
		expect(apply('1. a\n\n   text\n3. b')).toBe('1. a\n\n   text\n2. b');
	});

	it('treats a single blank line as a loose-list continuation', () => {
		expect(apply('1. a\n\n5. b')).toBe('1. a\n\n2. b');
	});

	it('restarts after two or more blank lines (CommonMark ends the list)', () => {
		expect(apply('1. a\n3. b\n\n\n5. c')).toBe('1. a\n2. b\n\n\n1. c');
	});

	it('starts a new list after a paragraph', () => {
		expect(apply('1. a\n3. b\n\ntekst\n\n1. c\n4. d')).toBe('1. a\n2. b\n\ntekst\n\n1. c\n2. d');
	});

	// CommonMark's lazy continuation: plain text right after an item's text belongs to it.
	it('keeps a list running across a continuation line without indent', () => {
		const doc = '1. Eerste lid, met een regel die\ndoorloopt zonder inspringing.\n\n2. Tweede lid.';
		expect(renumberOrderedLists(doc)).toEqual([]);
		expect(apply('1. a\nb\nc\n5. d')).toBe('1. a\nb\nc\n2. d');
	});

	it('keeps a nested list running across a continuation of its last item', () => {
		expect(apply('1. a\n   1. b\nlazy\n   3. c\n4. d')).toBe('1. a\n   1. b\nlazy\n   2. c\n2. d');
		expect(apply('1. a\n   - b\nlazy\n5. c')).toBe('1. a\n   - b\nlazy\n2. c');
	});

	it('ends the list at text that follows a blank line', () => {
		expect(apply('1. a\n\ntekst\n2. b')).toBe('1. a\n\ntekst\n1. b');
	});

	it('ends the list at a line that opens a block of its own', () => {
		expect(apply('1. a\n# Kop\n2. b')).toBe('1. a\n# Kop\n1. b');
		expect(apply('1. a\n- punt\n2. b')).toBe('1. a\n- punt\n1. b');
		expect(apply('1. a\n---\n2. b')).toBe('1. a\n---\n1. b');
		expect(apply('1. a\n```\nx\n```\n2. b')).toBe('1. a\n```\nx\n```\n1. b');
	});

	it('does not continue an empty item', () => {
		expect(apply('1.\ntekst\n2. b')).toBe('1.\ntekst\n1. b');
	});

	it('lets a quoted item take a continuation without the quote marker', () => {
		expect(apply('> 1. a\nlazy\n> 3. b')).toBe('> 1. a\nlazy\n> 2. b');
	});

	it('does not renumber inside a fenced code block (and the fence breaks the list)', () => {
		const doc = '1. a\n3. b\n\n```\n1. x\n3. y\n```\n\n1. c\n3. d';
		// Lists on either side renumber independently; the code lines stay literal, and
		// the fence breaks the list so the run after it restarts.
		expect(apply(doc)).toBe('1. a\n2. b\n\n```\n1. x\n3. y\n```\n\n1. c\n2. d');
	});

	it('grows the digit across the ten boundary', () => {
		const doc = Array.from({ length: 10 }, () => '7. x').join('\n');
		const result = apply(doc);
		expect(result.split('\n')[0]).toBe('1. x');
		expect(result.split('\n')[9]).toBe('10. x');
	});

	it('renumbers an ordered list inside a blockquote (> 4. → > 1.)', () => {
		expect(apply('> 4. In afwijking van het eerste lid.')).toBe('> 1. In afwijking van het eerste lid.');
		expect(apply('> 4. a\n> 6. b')).toBe('> 1. a\n> 2. b');
	});

	it('numbers a quoted list independently from lists outside the quote', () => {
		expect(apply('4. x\n> 8. a\n> 3. b\n5. y')).toBe('1. x\n> 1. a\n> 2. b\n2. y');
	});

	it('renumbers a list in a nested blockquote', () => {
		expect(apply('> > 4. a\n> > 9. b')).toBe('> > 1. a\n> > 2. b');
	});

	it('keeps a quoted loose list together across a bare `>` line', () => {
		expect(apply('> 4. a\n>\n> 6. b')).toBe('> 1. a\n>\n> 2. b');
	});

	it('leaves an already-correct quoted list untouched', () => {
		expect(renumberOrderedLists('> 1. a\n> 2. b')).toEqual([]);
	});
});

describe('nldd-text-editor ordered-list renumbering (integration)', () => {
	type El = HTMLElement & { value: string; updateComplete: Promise<boolean>; view: any };
	let el: El;
	afterEach(() => cleanup(el));

	it('renumbers as an out-of-order item is typed', async () => {
		el = await fixture<El>('<nldd-text-editor accessible-label="t"></nldd-text-editor>');
		el.value = '1. een';
		await el.updateComplete; await waitForUpdate(el);
		// Add a second item numbered "3." at the end.
		el.view.dispatch({ changes: { from: el.view.state.doc.length, insert: '\n3. twee' } });
		await waitForUpdate(el);
		expect(el.value).toBe('1. een\n2. twee');
	});

	// A value the app sets is content as it stands, as it is on the first mount.
	it('leaves a value set from outside as it is, without an input event', async () => {
		el = await fixture<El>('<nldd-text-editor accessible-label="t"></nldd-text-editor>');
		const inputs: string[] = [];
		el.addEventListener('input', (event) => inputs.push((event as CustomEvent).detail.value));
		el.value = '1. a\n1. b\n5. c';
		await el.updateComplete; await waitForUpdate(el);
		expect(el.value).toBe('1. a\n1. b\n5. c');
		expect(el.view.state.doc.toString()).toBe('1. a\n1. b\n5. c');
		expect(inputs).toEqual([]);
	});

	it('renumbers a value set from outside once the user edits the list', async () => {
		el = await fixture<El>('<nldd-text-editor accessible-label="t"></nldd-text-editor>');
		el.value = '1. a\n1. b';
		await el.updateComplete; await waitForUpdate(el);
		el.view.dispatch({ changes: { from: el.view.state.doc.length, insert: '\n1. c' }, userEvent: 'input' });
		await waitForUpdate(el);
		expect(el.value).toBe('1. a\n2. b\n3. c');
	});

	it('renumbers when a continuation line becomes a heading', async () => {
		el = await fixture<El>('<nldd-text-editor accessible-label="t"></nldd-text-editor>');
		el.value = '1. a\nlazy\n2. b';
		await el.updateComplete; await waitForUpdate(el);
		el.view.dispatch({ changes: { from: '1. a\n'.length, insert: '# ' }, userEvent: 'input.type' });
		await waitForUpdate(el);
		expect(el.value).toBe('1. a\n# lazy\n1. b');
	});

	it('keeps annotations anchored while renumbering', async () => {
		const elA = await fixture<El & { annotatable: boolean; annotations: unknown[] }>(
			'<nldd-text-editor accessible-label="t" annotatable></nldd-text-editor>',
		);
		elA.value = '1. alpha\n3. beta';
		elA.annotations = [{ id: 'a', start: 3, end: 8, quote: 'alpha' }];
		await elA.updateComplete; await waitForUpdate(elA);
		// Trigger a renumber by inserting another out-of-order item.
		elA.view.dispatch({ changes: { from: elA.view.state.doc.length, insert: '\n9. gamma' } });
		await waitForUpdate(elA);
		expect(elA.value).toBe('1. alpha\n2. beta\n3. gamma');
		const tint = elA.shadowRoot!.querySelector('.cm-annotation');
		expect(tint?.textContent?.replace(/⁠/g, '').replace(/\d+$/, '')).toBe('alpha');
		cleanup(elA);
	});

	// Backspacing a non-first marker must clear it as cleanly as the first item, not
	// leave the alignment whitespace CodeMirror's deleteMarkupBackward would insert.
	it('clears a non-first list marker without leaving whitespace', async () => {
		const elB = await fixture<El>('<nldd-text-editor accessible-label="t"></nldd-text-editor>');
		elB.value = '1. a\n2. ';
		await elB.updateComplete; await waitForUpdate(elB);
		elB.view.dispatch({ selection: { anchor: elB.view.state.doc.length } }); // end of "2. "
		elB.view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
		await waitForUpdate(elB);
		expect(elB.value).toBe('1. a\n'); // marker gone, no stray leading space
		cleanup(elB);
	});

	// The renumber filter runs before the annotation filter (Prec.low), so a marker
	// that changes width maps the token on its line too instead of drifting it.
	it('does not drift an annotation when a marker would grow', async () => {
		const elA = await fixture<El & { annotatable: boolean; annotations: unknown[] }>(
			'<nldd-text-editor accessible-label="t" annotatable></nldd-text-editor>',
		);
		elA.value = '1. alpha\n2. beta gamma';
		const f = elA.value.indexOf('beta gamma');
		elA.annotations = [{ id: 'a', start: f, end: f + 'beta gamma'.length, quote: 'beta gamma' }];
		await elA.updateComplete; await waitForUpdate(elA);
		// Try to widen the first marker (1 -> 91); the forced-1 rule reverts it, but the
		// annotation on the next line must not shift in the churn.
		const doc = elA.view.state.doc.toString();
		elA.view.dispatch({ changes: { from: doc.indexOf('1.') + 1, insert: '9' }, userEvent: 'input.type' });
		await waitForUpdate(elA);
		expect(elA.value).toBe('1. alpha\n2. beta gamma'); // marker forced back to 1
		const tint = elA.shadowRoot!.querySelector('.cm-annotation');
		expect(tint?.textContent?.replace(/⁠/g, '').replace(/\d+$/, '')).toBe('beta gamma');
		cleanup(elA);
	});
});
