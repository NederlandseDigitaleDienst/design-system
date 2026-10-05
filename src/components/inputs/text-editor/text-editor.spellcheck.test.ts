import { describe, it, expect, afterEach } from 'vitest';
import type { EditorView } from '@codemirror/view';
import { undo, undoDepth } from '@codemirror/commands';
import { userEvent } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';

/* #258: spellchecking on, like the other text fields, without the parts that
 * are not running text: code, the address of a link, a bare URL, a mention. */

type El = HTMLElement & { value: string; noSpellcheck: boolean; view: EditorView; updateComplete: Promise<unknown> };

async function make(value: string, attrs = ''): Promise<El> {
	const el = await fixture<El>(`<nldd-text-editor accessible-label="t" ${attrs}></nldd-text-editor>`);
	el.value = value;
	await el.updateComplete;
	await waitForUpdate(el);
	return el;
}

/** Whether the browser checks the spelling of `text`: the nearest
 *  `spellcheck` attribute around the first character of it. */
function checked(el: El, text: string): boolean {
	const pos = el.view.state.doc.toString().indexOf(text);
	if (pos < 0) throw new Error(`"${text}" is not in the document`);
	const { node } = el.view.domAtPos(pos + 1);
	const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement!;
	return element.closest('[spellcheck]')?.getAttribute('spellcheck') === 'true';
}

describe('nldd-text-editor spellcheck', () => {
	let el: El;
	afterEach(() => cleanup(el));

	// CodeMirror sets autocorrect off, and then turns the period macOS puts
	// after a double space back into a space by writing the line anew, which
	// cost the spelling marks on it. The user's own settings decide, as in the
	// other text fields.
	it('checks the spelling by default, and leaves autocorrect to the user', async () => {
		el = await make('Een zin.');
		const content = el.view.contentDOM;
		expect(content.getAttribute('spellcheck')).toBe('true');
		expect(content.getAttribute('autocorrect')).toBe('on');
		expect(content.getAttribute('autocapitalize')).toBe('sentences');
	});

	it('turns it off with no-spellcheck, also after the editor is there', async () => {
		el = await make('Een zin.', 'no-spellcheck');
		expect(el.view.contentDOM.getAttribute('spellcheck')).toBe('false');
		// Like an <input> with spellcheck off: autocorrect stays the user's.
		expect(el.view.contentDOM.getAttribute('autocorrect')).toBe('on');
		expect(el.view.contentDOM.getAttribute('autocapitalize')).toBe('sentences');
		el.noSpellcheck = false;
		await el.updateComplete;
		expect(el.view.contentDOM.getAttribute('spellcheck')).toBe('true');
	});

	// A browser checks text when it changes, not when spellcheck does, so the
	// old underlines stayed. The content is drawn anew, which makes it look again.
	it('draws the content anew when it is turned off or on, and keeps the history', async () => {
		el = await make('Een fuot woord.');
		el.view.dispatch({ changes: { from: el.view.state.doc.length, insert: ' Erbij.' }, userEvent: 'input.type' });
		const line = el.view.contentDOM.querySelector('.cm-line');
		const depth = undoDepth(el.view.state);
		expect(depth).toBeGreaterThan(0);
		el.noSpellcheck = true;
		await el.updateComplete;
		expect(el.view.contentDOM.querySelector('.cm-line')).not.toBe(line);
		expect(el.view.contentDOM.getAttribute('spellcheck')).toBe('false');
		expect(undoDepth(el.view.state)).toBe(depth);
		expect(el.view.state.doc.toString()).toBe('Een fuot woord. Erbij.');
	});

	it('checks running text', async () => {
		el = await make('Een zinn met een fout.');
		expect(checked(el, 'zinn')).toBe(true);
	});

	it('leaves out inline code and code blocks', async () => {
		el = await make('Gebruik `nldd-buton` hier.\n\n```\nconst foutje = 1;\n```');
		expect(checked(el, 'nldd-buton')).toBe(false);
		expect(checked(el, 'foutje')).toBe(false);
		expect(checked(el, 'Gebruik')).toBe(true);
	});

	it('leaves out the address of a link but checks its text', async () => {
		el = await make('Zie [de regelz](https://example.org/regelz) en https://regelrecht.rijks.app hier.');
		expect(checked(el, 'regelz]')).toBe(true);
		expect(checked(el, 'https://example.org')).toBe(false);
		expect(checked(el, 'https://regelrecht')).toBe(false);
	});

	it('leaves out a mention', async () => {
		el = await make('Bespreek met [@Anouk de Vriess](user:1) vandaag.');
		// The mention shows as a token in place of its source.
		const token = el.view.contentDOM.querySelector('.cm-md-mention-token')!;
		expect(token.closest('[spellcheck]')?.getAttribute('spellcheck')).toBe('false');
		expect(checked(el, 'vandaag')).toBe(true);
	});
});

// Every Backspace or Delete CodeMirror handled itself cost the spelling marks on
// the line, in every browser, until the next word was typed. A deletion the
// browser does keeps them, so the browser deletes wherever the editor has
// nothing to add.
describe('nldd-text-editor deleting left to the browser', () => {
	let el: El;
	afterEach(() => cleanup(el));

	/** Presses Backspace for real and says who deleted: CodeMirror prevents the
	 *  default when it takes the key, the browser's deletion is not prevented. */
	async function backspace(at: number, to = at, key: 'Backspace' | 'Delete' = 'Backspace'): Promise<'browser' | 'editor'> {
		el.view.focus();
		el.view.dispatch({ selection: { anchor: at, head: to } });
		let prevented = false;
		const watch = (event: KeyboardEvent) => { if (event.key === key) prevented = event.defaultPrevented; };
		el.view.dom.addEventListener('keydown', watch);
		await userEvent.keyboard(`{${key}}`);
		el.view.dom.removeEventListener('keydown', watch);
		await waitForUpdate(el);
		return prevented ? 'editor' : 'browser';
	}

	it('leaves a letter to the browser, and the editor follows', async () => {
		el = await make('Een fuot woord');
		expect(await backspace('Een fuot woord'.length)).toBe('browser');
		expect(el.view.state.doc.toString()).toBe('Een fuot woor');
		expect(el.view.state.selection.main.head).toBe('Een fuot woor'.length);
	});

	it('leaves a space between words to the browser too', async () => {
		el = await make('Een fuot woord');
		expect(await backspace('Een fuot '.length)).toBe('browser');
		expect(el.view.state.doc.toString()).toBe('Een fuotwoord');
	});

	it('can undo what the browser deleted', async () => {
		el = await make('Een fuot woord');
		await new Promise((resolve) => setTimeout(resolve, 600));
		await backspace('Een fuot woord'.length);
		undo(el.view);
		expect(el.view.state.doc.toString()).toBe('Een fuot woord');
	});

	it('keeps the start of a line for the editor, which joins the lines', async () => {
		el = await make('Een\nb');
		expect(await backspace('Een\nb'.length)).toBe('editor');
		expect(el.view.state.doc.toString()).toBe('Een\n');
	});

	it('keeps the indentation at the start of a line for the editor', async () => {
		el = await make('Een\n    b');
		expect(await backspace('Een\n    '.length)).toBe('editor');
	});

	it('keeps a character right after a link badge for the editor', async () => {
		el = await make('Zie [voorbeeld](https://example.com)x');
		expect(await backspace(el.value.length)).toBe('editor');
		expect(el.view.state.doc.toString()).toBe('Zie [voorbeeld](https://example.com)');
	});

	it('leaves a selected word to the browser', async () => {
		el = await make('Een fuot woord');
		expect(await backspace(4, 8)).toBe('browser');
		expect(el.view.state.doc.toString()).toBe('Een  woord');
	});

	it('keeps a selection across markup for the editor', async () => {
		el = await make('Een `code` woord');
		expect(await backspace(2, 8)).toBe('editor');
		expect(el.view.state.doc.toString()).toBe('Eee` woord');
	});

	it('leaves Delete inside a word to the browser', async () => {
		el = await make('Een fuot woord');
		expect(await backspace(5, 5, 'Delete')).toBe('browser');
		expect(el.view.state.doc.toString()).toBe('Een fot woord');
	});

	it('keeps Delete at the end of a line for the editor, which joins the lines', async () => {
		el = await make('Een\nb');
		expect(await backspace(3, 3, 'Delete')).toBe('editor');
		expect(el.view.state.doc.toString()).toBe('Eenb');
	});

	it('leaves it all to the editor with no-spellcheck', async () => {
		el = await make('Een fuot woord', 'no-spellcheck');
		expect(await backspace('Een fuot woord'.length)).toBe('editor');
		expect(el.view.state.doc.toString()).toBe('Een fuot woor');
	});
});
