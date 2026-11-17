import { describe, it, expect, afterEach } from 'vitest';
import { EditorState } from '@codemirror/state';
import { ensureSyntaxTree } from '@codemirror/language';
import type { EditorView } from '@codemirror/view';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';
import type { NLDDTextEditor } from './text-editor.js';
import { markdownEditing } from './text-editor.markdown.js';
import { renumberOrderedLists } from './text-editor.ordered-list.js';

type El = NLDDTextEditor & { view: EditorView };

/** The block nodes markdown finds in `doc`. */
function blocks(doc: string): string[] {
	const state = EditorState.create({ doc, extensions: [markdownEditing] });
	const out: string[] = [];
	ensureSyntaxTree(state, doc.length, 5000)!.iterate({
		enter: (node) => { if (['BulletList', 'OrderedList', 'Blockquote', 'FencedCode', 'ATXHeading1', 'Paragraph'].includes(node.name)) out.push(node.name); },
	});
	return out;
}

describe('a line indented four spaces or more (#435)', () => {
	it('is text, whatever it starts with', () => {
		expect(blocks('Agenda:\n\n    - punt 1\n    - punt 2')).toEqual(['Paragraph', 'Paragraph', 'Paragraph']);
		expect(blocks('    # kop')).toEqual(['Paragraph']);
		expect(blocks('    > citaat')).toEqual(['Paragraph']);
		expect(blocks('    ```\n    x')).toEqual(['Paragraph', 'Paragraph']);
	});

	it('counts from the text of the list item it is in', () => {
		expect(blocks('- a\n  - b')).toEqual(['BulletList', 'Paragraph', 'BulletList', 'Paragraph']);
		expect(blocks('- a\n\n      - b')).toEqual(['BulletList', 'Paragraph', 'Paragraph']);
	});

	it('is not renumbered as an item', () => {
		expect(renumberOrderedLists('    1. a\n    3. b')).toEqual([]);
		expect(renumberOrderedLists('1. a\n\n       3. b')).toEqual([]);
	});
});

describe('nldd-text-editor paste', () => {
	let el: El;
	afterEach(() => cleanup(el));

	async function editor(value: string, caret = value.length): Promise<El> {
		el = await fixture<El>('<nldd-text-editor accessible-label="t"></nldd-text-editor>');
		el.value = value;
		await el.updateComplete; await waitForUpdate(el);
		el.view.dispatch({ selection: { anchor: caret } });
		return el;
	}

	function paste(text: string, plain = false): void {
		const content = el.view.contentDOM;
		if (plain) content.dispatchEvent(new KeyboardEvent('keydown', { key: 'V', code: 'KeyV', metaKey: true, shiftKey: true, bubbles: true, cancelable: true }));
		else content.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
		const data = new DataTransfer();
		data.setData('text/plain', text);
		content.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
	}

	const doc = (): string => el.view.state.doc.toString();

	it('takes the shared indent away, so an indented list is a list', async () => {
		await editor('Agenda:\n\n');
		paste('    - punt 1\n    - punt 2');
		expect(doc()).toBe('Agenda:\n\n- punt 1\n- punt 2');
	});

	it('keeps a nested list nested', async () => {
		await editor('');
		paste('    - punt\n      - sub');
		expect(doc()).toBe('- punt\n  - sub');
	});

	it('makes a list from Word or Outlook bullets', async () => {
		await editor('');
		paste('•\tpunt 1\n•\tpunt 2\n\to\tsub');
		expect(doc()).toBe('- punt 1\n- punt 2\n  - sub');
	});

	it('makes a number with a tab a markdown number', async () => {
		await editor('');
		paste('1.\teen\n2.\ttwee');
		expect(doc()).toBe('1. een\n2. twee');
	});

	it('takes the level of the empty item it lands on', async () => {
		await editor('- a\n- ');
		paste('- b\n- c');
		expect(doc()).toBe('- a\n- b\n- c');
	});

	it('nests one level when the pasted list is indented', async () => {
		await editor('- a\n- ');
		paste('    - b\n    - c');
		expect(doc()).toBe('- a\n  - b\n  - c');
	});

	it('nests under a numbered item at the column of its text', async () => {
		await editor('1. a\n2. ');
		paste('  - b');
		expect(doc()).toBe('1. a\n   - b');
	});

	it('takes the level of the item above on an empty line', async () => {
		await editor('- a\n  - b\n');
		paste('- c');
		expect(doc()).toBe('- a\n  - b\n  - c');
	});

	it('starts a list of its own without a list above', async () => {
		await editor('Tekst\n\n');
		paste('  - a\n  - b');
		expect(doc()).toBe('Tekst\n\n- a\n- b');
	});

	it('takes the shared indent off text that is no list', async () => {
		await editor('');
		paste('    tekst\n      meer');
		expect(doc()).toBe('tekst\n  meer');
	});

	it('applies over a selection of several lines, as after select all', async () => {
		await editor('regel een\nregel twee');
		el.view.dispatch({ selection: { anchor: 0, head: el.view.state.doc.length } });
		paste('    - a\n    - b');
		expect(doc()).toBe('- a\n- b');
	});

	it('leaves a paste in the middle of a line', async () => {
		await editor('zie ');
		paste('  - x');
		expect(doc()).toBe('zie   - x');
	});

	it('starts a list of several lines on the next line, after the text of an item', async () => {
		await editor('- Eerste punt\n- Tweede punt');
		paste('  - Aanvraag A-1042\n      - Dakisolatie\n      - In behandeling\n  - Aanvraag A-1043');
		expect(doc()).toBe('- Eerste punt\n- Tweede punt\n  - Aanvraag A-1042\n    - Dakisolatie\n    - In behandeling\n  - Aanvraag A-1043');
		expect(el.view.state.selection.main.head).toBe(doc().length);
	});

	it('takes the level of the item for a list without indent', async () => {
		await editor('- Tweede punt');
		paste('- a\n- b');
		expect(doc()).toBe('- Tweede punt\n- a\n- b');
	});

	it('starts a list after a paragraph on the next line', async () => {
		await editor('Agenda:');
		paste('- a\n- b');
		expect(doc()).toBe('Agenda:\n- a\n- b');
	});

	it('leaves text of several lines after text as it is', async () => {
		await editor('- Tweede punt');
		paste(' en meer\nregels');
		expect(doc()).toBe('- Tweede punt en meer\nregels');
	});

	it('leaves a paste in a code block', async () => {
		await editor('```\n\n```', 4);
		paste('    - x');
		expect(doc()).toBe('```\n    - x\n```');
	});

	it('applies over a selected code block, which the paste replaces', async () => {
		await editor('```\ncode\n```');
		el.view.dispatch({ selection: { anchor: 0, head: el.view.state.doc.length } });
		paste('•\tpunt');
		expect(doc()).toBe('- punt');
	});

	it('brings back the text as pasted with one undo', async () => {
		await editor('');
		paste('    - a');
		expect(doc()).toBe('- a');
		el.undo();
		expect(doc()).toBe('    - a');
	});

	it('pastes as it is with Option+Shift+Cmd+V, where Option changes the key', async () => {
		await editor('');
		el.view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key: '◊', code: 'KeyV', metaKey: true, altKey: true, shiftKey: true, bubbles: true }));
		const data = new DataTransfer();
		data.setData('text/plain', '•\tpunt');
		el.view.contentDOM.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
		expect(doc()).toBe('•\tpunt');
	});

	it('pastes the text as it is with Cmd/Ctrl+Shift+V', async () => {
		await editor('');
		paste('•\tpunt', true);
		expect(doc()).toBe('•\tpunt');
	});
});
