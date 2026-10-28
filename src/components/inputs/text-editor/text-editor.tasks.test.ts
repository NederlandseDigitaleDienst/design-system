import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';
import { toggleTasks } from './text-editor.tasks.js';

type View = {
	focus(): void;
	contentDOM: HTMLElement;
	dispatch(spec: unknown): void;
	state: { doc: { line(n: number): { from: number }; length: number } };
};
type Editor = HTMLElement & { value: string; view: View; updateComplete: Promise<boolean> };

async function editor(markdown: string, attrs = ''): Promise<Editor> {
	const el = await fixture<Editor>(`<nldd-text-editor accessible-label="Taken" ${attrs}></nldd-text-editor>`);
	el.value = markdown;
	await el.updateComplete;
	await waitForUpdate(el);
	return el;
}

const boxes = (el: Editor) => [...el.shadowRoot!.querySelectorAll<HTMLElement>('.cm-md-task-box')];

const modEnter = (el: Editor) => el.view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', {
	key: 'Enter',
	metaKey: navigator.platform.includes('Mac'),
	ctrlKey: !navigator.platform.includes('Mac'),
	bubbles: true,
	cancelable: true,
}));

describe('nldd-text-editor – taken', () => {
	let el: Editor;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// The caret starts on the first line, which shows its markdown, so the tasks
	// come after a line of text.
	const hidden = (tasks: string, attrs = '') => editor(`Taken\n\n${tasks}`, `syntax="hidden" ${attrs}`);

	it('tekent het vakje van een taak als vakje, met een naam voor een screenreader', async () => {
		el = await hidden('- [ ] Open\n- [x] Klaar');
		const drawn = boxes(el);
		expect(drawn.length).toBe(2);
		expect(drawn[0].querySelector('nldd-icon')!.getAttribute('icon')).toBe('square');
		expect(drawn[1].querySelector('nldd-icon')!.getAttribute('icon')).toBe('check-mark-square');
		expect(drawn[0].textContent).toBe('Taak, open');
		expect(drawn[1].textContent).toBe('Taak, afgerond');
	});

	it('zet het vakje op de plek van de opsommingsteken', async () => {
		el = await hidden('- [ ] Open');
		const line = boxes(el)[0].closest('.cm-line')!;
		expect(line.textContent).not.toContain('-');
		expect(boxes(el)[0].getBoundingClientRect().left).toBeCloseTo(line.getBoundingClientRect().left, 0);
	});

	it('toont de markdown op de regel waar de caret staat', async () => {
		el = await hidden('- [ ] Een\n- [ ] Twee');
		el.view.focus();
		el.view.dispatch({ selection: { anchor: el.view.state.doc.line(3).from + 7 } });
		await waitForUpdate(el);
		expect(boxes(el).length).toBe(1);
		const lines = [...el.shadowRoot!.querySelectorAll('.cm-line')].map((line) => line.textContent);
		expect(lines[2]).toBe('- [ ] Een');
	});

	it('tekent geen vakje als de opmaak zichtbaar is', async () => {
		el = await editor('Taken\n\n- [ ] Open');
		expect(boxes(el).length).toBe(0);
	});

	it('vinkt een taak aan en uit met een klik op het vakje', async () => {
		el = await hidden('- [ ] Open');
		boxes(el)[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
		expect(el.value).toBe('Taken\n\n- [x] Open');
		boxes(el)[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
		expect(el.value).toBe('Taken\n\n- [ ] Open');
	});

	it('vinkt een taak ook aan met een klik in de ruimte tussen het vakje en de tekst', async () => {
		el = await hidden('- [ ] Open');
		const prefix = boxes(el)[0].closest('.cm-md-listprefix')!;
		prefix.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
		expect(el.value).toBe('Taken\n\n- [x] Open');
	});

	it('geeft het vakje een vlak van een regel hoog dat geen ruimte inneemt', async () => {
		el = await hidden('- [ ] Open');
		const area = getComputedStyle(boxes(el)[0], '::before');
		expect(area.content).not.toBe('none');
		expect(area.position).toBe('absolute');
		expect(parseFloat(area.height)).toBeGreaterThan(0);
	});

	it('wisselt met Mod-Enter de taken op de regels van de selectie, ook met zichtbare opmaak', async () => {
		el = await editor('- [ ] Een\n- [x] Twee\n- [ ] Drie');
		el.view.focus();
		const { doc } = el.view.state;
		el.view.dispatch({ selection: { anchor: doc.line(1).from + 7, head: doc.line(2).from + 7 } });
		modEnter(el);
		expect(el.value).toBe('- [x] Een\n- [x] Twee\n- [ ] Drie');
		modEnter(el);
		expect(el.value).toBe('- [ ] Een\n- [ ] Twee\n- [ ] Drie');
	});

	it('laat Mod-Enter door aan andere bindingen als er op de geselecteerde regels geen taak staat', async () => {
		el = await editor('Gewone tekst\n- Geen taak');
		el.view.focus();
		el.view.dispatch({ selection: { anchor: 0, head: el.view.state.doc.length } });
		expect(toggleTasks(el.view as unknown as Parameters<typeof toggleTasks>[0])).toBe(false);
		expect(el.value).toBe('Gewone tekst\n- Geen taak');
	});

	it('laat een vakje met rust in een editor die alleen-lezen is', async () => {
		el = await hidden('- [ ] Open', 'readonly');
		boxes(el)[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
		expect(el.value).toBe('Taken\n\n- [ ] Open');
	});

	it('tekent een vakje opnieuw als zijn tekst voor een screenreader verandert', async () => {
		el = await hidden('- [ ] Open');
		(el as unknown as { translations: Record<string, string> }).translations = { 'components.text-editor.task-open-label': 'Task, open' };
		await el.updateComplete;
		el.value = 'Taken\n\n- [ ] Open nu';
		await el.updateComplete;
		await waitForUpdate(el);
		expect(boxes(el)[0].textContent).toBe('Task, open');
	});

	it('maakt geen vakje van [ ] in een codeblok', async () => {
		el = await hidden('```\n- [ ] geen taak\n```');
		expect(boxes(el).length).toBe(0);
	});
});

describe('nldd-text-editor – syntax="hidden"', () => {
	let el: Editor;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('houdt de taal van een codeblok als label boven het blok', async () => {
		el = await editor('Tekst\n\n```python\nprint(1)\n```\n\nEinde', 'syntax="hidden"');
		const label = el.shadowRoot!.querySelector('.cm-md-code-language');
		expect(label?.textContent).toBe('python');
		expect(el.shadowRoot!.textContent).not.toContain('```python');
	});

	it('geeft de nummers van een genummerde lijst de kleur van de tekst', async () => {
		el = await editor('Tekst\n\n1. Een\n2. Twee', 'syntax="hidden"');
		const numbers = [...el.shadowRoot!.querySelectorAll('.cm-md-ordinal')].map((n) => n.textContent);
		expect(numbers).toEqual(['1.', '2.']);
	});
});
