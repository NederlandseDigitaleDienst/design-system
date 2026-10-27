import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';

type Editor = HTMLElement & { value: string; view: { state: { selection: { main: { head: number } } } }; updateComplete: Promise<boolean> };

async function editor(markdown: string, attrs = ''): Promise<Editor> {
	const el = await fixture<Editor>(`<nldd-text-editor accessible-label="Antwoord" ${attrs}></nldd-text-editor>`);
	el.value = markdown;
	await el.updateComplete;
	await waitForUpdate(el);
	return el;
}

const button = (el: Editor, index = 0) => el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.cm-md-code-copy')[index];

describe('nldd-text-editor – kopieerknop op een codeblok', () => {
	let el: Editor;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('kopieert de code zonder de fences, en laat de caret staan', async () => {
		const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
		el = await editor('Tekst\n\n```python\nprint(1)\nprint(2)\n```');
		const before = el.view.state.selection.main.head;
		button(el).click();
		await vi.waitFor(() => expect(button(el).dataset.state).toBe('success'));
		expect(write).toHaveBeenCalledWith('print(1)\nprint(2)');
		expect(button(el).textContent).toBe('Gekopieerd');
		expect(button(el).nextElementSibling!.textContent).toBe('Gekopieerd');
		expect(el.view.state.selection.main.head).toBe(before);
	});

	it('zegt het als kopiëren mislukt, tot je verdergaat in de editor', async () => {
		vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('nee'));
		el = await editor('```\ncode\n```');
		button(el).click();
		await vi.waitFor(() => expect(button(el).dataset.state).toBe('failure'));
		expect(button(el).textContent).toBe('Kopiëren mislukt');
		el.shadowRoot!.querySelector('.cm-content')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		expect(button(el).dataset.state).toBe('idle');
		expect(button(el).textContent).toBe('Kopieer');
	});

	it('is geen tabstop in een bewerkbare editor, wel in een alleen-lezen', async () => {
		el = await editor('```\ncode\n```');
		expect(button(el).tabIndex).toBe(-1);
		cleanup(el);
		el = await editor('```\ncode\n```', 'readonly');
		expect(button(el).tabIndex).toBe(0);
	});

	it('houdt de kop van een blok zonder taal staan met syntax="hidden"', async () => {
		el = await editor('Tekst\n\n```\ncode\n```', 'syntax="hidden"');
		const head = el.shadowRoot!.querySelector('.cm-md-code-head');
		expect(head).not.toBeNull();
		expect(head!.textContent).toBe('Kopieer');
	});

	it('draws a button again when its text has changed', async () => {
		el = await editor('```\ncode\n```');
		(el as unknown as { translations: Record<string, string> }).translations = { 'components.text-editor.code-copy-action': 'Copy' };
		await el.updateComplete;
		el.value = '```\ncode 2\n```';
		await el.updateComplete;
		await waitForUpdate(el);
		expect(button(el).textContent).toBe('Copy');
	});
});
