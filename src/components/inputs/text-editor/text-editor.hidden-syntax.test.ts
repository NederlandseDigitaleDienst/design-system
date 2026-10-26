import { describe, it, expect, afterEach } from 'vitest';
import { EditorView } from '@codemirror/view';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';

/* syntax="hidden": marks are hidden where the caret is not, and come back for
 * the construct the caret or the selection touches. */

type El = HTMLElement & { value: string; syntax: string; readonly: boolean; updateComplete: Promise<unknown>; view: EditorView };

const DOC = [
	'# Titel',
	'',
	'Het **burgerportaal** met `WCAG` en *nadruk*, ~~weg~~ en de [richtlijn](https://example.com) voor [@Anouk](user:1).',
	'',
	'- Eerste punt',
	'* Tweede punt',
	'1. Genummerd',
	'',
	'---',
	'',
	'```bash',
	'npm ci',
	'```',
	'',
	'Slot.',
].join('\n');

async function make(attrs = 'syntax="hidden"'): Promise<El> {
	const el = await fixture<El>(`<nldd-text-editor accessible-label="t" ${attrs}></nldd-text-editor>`);
	el.value = DOC;
	await el.updateComplete;
	await waitForUpdate(el);
	return el;
}

function caret(el: El, pos: number, head = pos): void {
	el.view.dispatch({ selection: { anchor: pos, head } });
}

function line(el: El, n: number): Element {
	return el.view.contentDOM.querySelectorAll('.cm-line')[n];
}

const frame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

describe('nldd-text-editor syntax="hidden"', () => {
	let el: El;
	afterEach(() => cleanup(el));

	it('hides the marks of inline constructs and headings where the caret is not', async () => {
		el = await make();
		caret(el, DOC.indexOf('Slot'));
		expect(line(el, 0).textContent).toBe('Titel');
		expect(line(el, 2).textContent).toContain('Het burgerportaal met WCAG en nadruk, weg en de richtlijn voor');
	});

	it('shows the marks of the construct the caret is in, and only those', async () => {
		el = await make();
		caret(el, DOC.indexOf('burgerportaal') + 3);
		const text = line(el, 2).textContent;
		expect(text).toContain('**burgerportaal**');
		expect(text).toContain(' WCAG ');
		expect(text).not.toContain('*nadruk*');
	});

	it('shows the marks of every construct a selection touches', async () => {
		el = await make();
		caret(el, DOC.indexOf('burgerportaal'), DOC.indexOf('nadruk') + 2);
		const text = line(el, 2).textContent;
		expect(text).toContain('**burgerportaal**');
		expect(text).toContain('`WCAG`');
		expect(text).toContain('*nadruk*');
	});

	it('shows the # of a heading while the caret is in it', async () => {
		el = await make();
		caret(el, 3);
		expect(line(el, 0).textContent).toBe('# Titel');
	});

	it('leaves the text of a link and its address while the caret is in it', async () => {
		el = await make();
		caret(el, DOC.indexOf('richtlijn') + 2);
		expect(line(el, 2).textContent).toContain('[richtlijn](https://example.com)');
	});

	it('leaves a mention to its own token', async () => {
		el = await make();
		caret(el, DOC.indexOf('Slot'));
		expect(line(el, 2).querySelector('.cm-md-mention-token')).not.toBeNull();
	});

	it('gives inline code room inside its tint while its backticks are hidden', async () => {
		el = await make();
		caret(el, DOC.indexOf('Slot'));
		expect(line(el, 2).querySelector('.cm-md-code .cm-md-code-bare')?.textContent).toBe('WCAG');
	});

	it('draws a --- line as a divider until the caret is on it', async () => {
		el = await make();
		caret(el, DOC.indexOf('Slot'));
		expect(line(el, 8).querySelector('.cm-md-rule')).not.toBeNull();
		caret(el, DOC.indexOf('---') + 1);
		expect(line(el, 8).textContent).toBe('---');
	});

	it('takes the fence lines of a code block out until the caret is in it', async () => {
		el = await make();
		caret(el, DOC.indexOf('Slot'));
		const lines = () => [...el.view.contentDOM.querySelectorAll('.cm-line')].map((l) => l.textContent);
		expect(lines()).not.toContain('```bash');
		expect(lines()).toContain('npm ci');
		caret(el, DOC.indexOf('npm ci') + 2);
		expect(lines()).toContain('```bash');
		expect(lines()).toContain('```');
	});

	it('keeps the fences of a code block with no lines of its own', async () => {
		el = await make();
		el.value = 'Tekst\n\n```\n```\n\nSlot.';
		await el.updateComplete;
		await waitForUpdate(el);
		caret(el, el.view.state.doc.length);
		const lines = [...el.view.contentDOM.querySelectorAll('.cm-line')].map((l) => l.textContent);
		expect(lines.filter((t) => t === '```')).toHaveLength(2);
	});

	it('draws a bullet as a dot and shows its character on the line the caret is on', async () => {
		el = await make();
		caret(el, DOC.indexOf('Slot'));
		const dash = line(el, 4);
		const star = line(el, 5);
		expect(dash.querySelector('.cm-md-bullet')?.textContent).toBe('-');
		expect(star.querySelector('.cm-md-bullet')?.textContent).toBe('*');
		expect(line(el, 6).querySelector('.cm-md-bullet')).toBeNull();
		caret(el, DOC.indexOf('Tweede') + 2);
		expect(line(el, 4).querySelector('.cm-md-bullet')).not.toBeNull();
		expect(line(el, 5).querySelector('.cm-md-bullet')).toBeNull();
	});

	it('draws no dot for a dash that is not a list item yet', async () => {
		el = await make();
		el.value = 'Tekst\n\n-';
		await el.updateComplete;
		await waitForUpdate(el);
		caret(el, 0);
		expect(el.view.contentDOM.querySelector('.cm-md-bullet')).toBeNull();
	});

	it('draws a quote as a line, and shows every > instead while the caret is in it, in the same place', async () => {
		el = await make();
		el.value = 'Tekst\n\n> Eerste regel\n> Tweede regel\n\nSlot.';
		await el.updateComplete;
		await waitForUpdate(el);
		const lines = () => [...el.view.contentDOM.querySelectorAll('.cm-line')].slice(2, 4);
		const hidden = (l: Element) => l.querySelector('.cm-md-quote-mark-hidden') !== null;
		const ruled = (l: Element) => l.classList.contains('cm-md-quote-line');
		const textLeft = (l: Element) => {
			const range = document.createRange();
			const node = [...l.querySelectorAll('*'), l].flatMap((e) => [...e.childNodes]).find((n) => n.nodeType === 3 && /[A-Z]/.test(n.textContent ?? ''))!;
			const at = node.textContent!.search(/[A-Z]/);
			range.setStart(node, at);
			range.setEnd(node, at + 1);
			return range.getBoundingClientRect().left;
		};
		caret(el, el.view.state.doc.length);
		expect(lines().map(ruled)).toEqual([true, true]);
		expect(lines().map(hidden)).toEqual([true, true]);
		const left = lines().map(textLeft);
		caret(el, el.value.indexOf('Tweede'));
		expect(lines().map(ruled)).toEqual([false, false]);
		expect(lines().map(hidden)).toEqual([false, false]);
		expect(lines().map(textLeft)).toEqual(left);
	});

	it('keeps hiding the marks of bold inside a quote the caret is in', async () => {
		el = await make();
		el.value = '> Een **vet** woord\n> en meer\n\nSlot.';
		await el.updateComplete;
		await waitForUpdate(el);
		caret(el, el.value.indexOf('meer'));
		expect(el.view.contentDOM.querySelector('.cm-line')!.textContent).toBe('> Een vet woord');
	});

	it('hides every mark when read-only, the selection included', async () => {
		el = await make('syntax="hidden" readonly');
		caret(el, DOC.indexOf('burgerportaal') + 3);
		expect(line(el, 2).textContent).not.toContain('**');
		expect(line(el, 0).textContent).toBe('Titel');
	});

	it('shows every mark by default, and follows a change of the attribute', async () => {
		el = await make('');
		caret(el, DOC.indexOf('Slot'));
		expect(line(el, 0).textContent).toBe('# Titel');
		el.syntax = 'hidden';
		await el.updateComplete;
		expect(line(el, 0).textContent).toBe('Titel');
		el.syntax = 'visible';
		await el.updateComplete;
		expect(line(el, 0).textContent).toBe('# Titel');
	});

	it('keeps the value plain markdown', async () => {
		el = await make();
		caret(el, DOC.indexOf('Slot'));
		expect(el.value).toBe(DOC);
	});

	it('joins a selection on one line that is drawn as if it ran over three', async () => {
		el = await make();
		const from = DOC.indexOf('burgerportaal');
		el.view.focus();
		caret(el, from, from + 'burgerportaal'.length);
		await frame();
		const layer = el.view.dom.querySelector('.cm-selectionLayer')!;
		const piece = layer.querySelector<HTMLElement>('.cm-selectionBackground')!;
		const right = piece.offsetLeft + piece.offsetWidth;
		// What Safari drew: from the start to the line end, a full row, and from
		// the line start to the end.
		const wide = piece.cloneNode() as HTMLElement;
		const tail = piece.cloneNode() as HTMLElement;
		tail.style.left = '0px';
		tail.style.width = `${right}px`;
		piece.style.width = '600px';
		layer.append(wide, tail);
		await frame();
		const pieces = [...layer.querySelectorAll<HTMLElement>('.cm-selectionBackground')];
		expect(pieces).toHaveLength(1);
		expect(pieces[0].offsetLeft + pieces[0].offsetWidth).toBe(right);
	});
});
