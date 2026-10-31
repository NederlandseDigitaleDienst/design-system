import { describe, it, expect } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';

type Api = HTMLElement & {
	value: string;
	updateComplete: Promise<unknown>;
	view: {
		state: { selection: { main: { head: number } } };
		contentDOM: HTMLElement;
		dispatch(spec: unknown): void;
	};
	setList(type: 'none' | 'bullet' | 'ordered' | 'task'): void;
	runCommand(name: string, payload?: unknown): void;
	replaceRange(from: number, to: number, text: string): void;
	toggleBulletList(): void;
	toggleTaskList(): void;
	getState(): { active: { taskList: boolean; bulletList: boolean } };
};

async function withValue(markdown: string): Promise<Api> {
	const el = await fixture<Api>('<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>');
	el.value = markdown;
	await el.updateComplete;
	await waitForUpdate(el);
	return el;
}

/** Cmd on macOS, Ctrl elsewhere: CodeMirror resolves `Mod-` per platform and a
 *  keydown carrying both would read as Ctrl-Meta and match nothing. */
function mod(key: string, code: string): KeyboardEvent {
	const mac = /Mac/.test(navigator.platform);
	return new KeyboardEvent('keydown', { key, code, metaKey: mac, ctrlKey: !mac, bubbles: true, cancelable: true });
}

// #198: the line commands skipped an empty line, dropped an item that had no
// text yet, and left the caret in front of the marker they had just written.
describe('nldd-text-editor line commands', () => {
	it('setList zet een marker op een leeg document, met de caret erachter', async () => {
		const el = await withValue('');
		el.view.dispatch({ selection: { anchor: 0 } });
		el.setList('bullet');
		await waitForUpdate(el);
		expect(el.value).toBe('- ');
		// Typing next must land in the item, not before its marker.
		expect(el.view.state.selection.main.head).toBe(2);
		cleanup(el);
	});

	it('toggleBulletList doet hetzelfde op een leeg document', async () => {
		const el = await withValue('');
		el.view.dispatch({ selection: { anchor: 0 } });
		el.toggleBulletList();
		await waitForUpdate(el);
		expect(el.value).toBe('- ');
		expect(el.view.state.selection.main.head).toBe(2);
		cleanup(el);
	});

	it('een item zonder tekst blijft een item als het lijsttype wisselt', async () => {
		const el = await withValue('- ');
		el.view.dispatch({ selection: { anchor: 2 } });
		el.setList('ordered');
		await waitForUpdate(el);
		expect(el.value).toBe('1. ');
		expect(el.view.state.selection.main.head).toBe(3);
		cleanup(el);
	});

	it('een kale marker zonder spatie telt ook als item', async () => {
		const el = await withValue('-');
		el.view.dispatch({ selection: { anchor: 1 } });
		el.setList('ordered');
		await waitForUpdate(el);
		expect(el.value).toBe('1. ');
		cleanup(el);
	});

	it('de caret schuift mee achter een nieuwe marker op een gevulde regel', async () => {
		const el = await withValue('punt');
		el.view.dispatch({ selection: { anchor: 0 } });
		el.setList('bullet');
		await waitForUpdate(el);
		expect(el.value).toBe('- punt');
		expect(el.view.state.selection.main.head).toBe(2);
		cleanup(el);
	});

	it('een lege regel tussen items blijft leeg', async () => {
		const el = await withValue('een\n\ntwee');
		el.view.dispatch({ selection: { anchor: 0, head: 9 } });
		el.setList('bullet');
		await waitForUpdate(el);
		expect(el.value).toBe('- een\n\n- twee');
		cleanup(el);
	});

	it('Cmd/Ctrl+] maakt van platte tekst geen codeblok', async () => {
		const el = await withValue('tekst');
		el.view.dispatch({ selection: { anchor: 5 } });
		el.view.contentDOM.dispatchEvent(mod(']', 'BracketRight'));
		await waitForUpdate(el);
		// defaultKeymap's indentMore would have written four spaces here, which
		// markdown reads as an indented code block.
		expect(el.value).toBe('tekst');
		cleanup(el);
	});

	it('Cmd/Ctrl+] nest een lijstitem, Cmd/Ctrl+[ haalt het terug', async () => {
		const el = await withValue('- foo\n- bar');
		el.view.dispatch({ selection: { anchor: el.value.indexOf('bar') } });
		el.view.contentDOM.dispatchEvent(mod(']', 'BracketRight'));
		await waitForUpdate(el);
		expect(el.value).toBe('- foo\n  - bar');
		el.view.contentDOM.dispatchEvent(mod('[', 'BracketLeft'));
		await waitForUpdate(el);
		expect(el.value).toBe('- foo\n- bar');
		cleanup(el);
	});

	describe('toggleTaskList', () => {
		it('maakt van platte tekst een taak, en van een taak weer een bullet', async () => {
			const el = await withValue('punt');
			el.view.dispatch({ selection: { anchor: 0 } });
			el.toggleTaskList();
			await waitForUpdate(el);
			expect(el.value).toBe('- [ ] punt');
			expect(el.getState().active.taskList).toBe(true);
			el.toggleTaskList();
			await waitForUpdate(el);
			expect(el.value).toBe('- punt');
			expect(el.getState().active.taskList).toBe(false);
			cleanup(el);
		});

		it('zet een bullet of genummerd item om, met behoud van inspring', async () => {
			const el = await withValue('- een\n  2. twee');
			el.view.dispatch({ selection: { anchor: 0, head: el.value.length } });
			el.toggleTaskList();
			await waitForUpdate(el);
			expect(el.value).toBe('- [ ] een\n  - [ ] twee');
			cleanup(el);
		});

		it('laat een afgevinkte taak staan tot alles taak is, dan pas terug', async () => {
			const el = await withValue('- [x] klaar\n- open');
			el.view.dispatch({ selection: { anchor: 0, head: el.value.length } });
			el.toggleTaskList();
			await waitForUpdate(el);
			expect(el.value).toBe('- [x] klaar\n- [ ] open');
			el.toggleTaskList();
			await waitForUpdate(el);
			expect(el.value).toBe('- klaar\n- open');
			cleanup(el);
		});

		it('werkt op een leeg document', async () => {
			const el = await withValue('');
			el.view.dispatch({ selection: { anchor: 0 } });
			el.toggleTaskList();
			await waitForUpdate(el);
			expect(el.value).toBe('- [ ] ');
			expect(el.view.state.selection.main.head).toBe(6);
			cleanup(el);
		});
	});

	// A picker sets a type; the checkbox belongs to the marker, so switching type
	// takes it along instead of leaving "[ ]" behind as text.
	describe('setList met taken', () => {
		it('zet regels om naar taken', async () => {
			const el = await withValue('Een\nTwee');
			el.view.dispatch({ selection: { anchor: 0, head: el.value.length } });
			el.setList('task');
			await waitForUpdate(el);
			expect(el.value).toBe('- [ ] Een\n- [ ] Twee');
			cleanup(el);
		});

		it('wisselt van taken naar opsomming en nummering zonder het vakje te laten staan', async () => {
			const el = await withValue('- [x] Een\n- [ ] Twee');
			el.view.dispatch({ selection: { anchor: 0, head: el.value.length } });
			el.setList('bullet');
			await waitForUpdate(el);
			expect(el.value).toBe('- Een\n- Twee');
			el.setList('task');
			await waitForUpdate(el);
			el.setList('ordered');
			await waitForUpdate(el);
			expect(el.value).toBe('1. Een\n2. Twee');
			cleanup(el);
		});

		it('haalt met none de marker en het vakje weg', async () => {
			const el = await withValue('- [x] Een');
			el.view.dispatch({ selection: { anchor: 0, head: el.value.length } });
			el.setList('none');
			await waitForUpdate(el);
			expect(el.value).toBe('Een');
			cleanup(el);
		});

		it('laat een gewone regel die met [x] begint met rust', async () => {
			const el = await withValue('[x] geen taak');
			el.view.dispatch({ selection: { anchor: 0, head: el.value.length } });
			el.setList('bullet');
			await waitForUpdate(el);
			expect(el.value).toBe('- [x] geen taak');
			cleanup(el);
		});
	});

	describe('runCommand en replaceRange', () => {
		it('bereikt de commandos die alleen als methode bestonden', async () => {
			const el = await withValue('Tekst');
			el.view.dispatch({ selection: { anchor: 0, head: 5 } });
			el.runCommand('setHeading', 2);
			await waitForUpdate(el);
			expect(el.value).toBe('## Tekst');
			el.runCommand('setList', 'task');
			await waitForUpdate(el);
			expect(el.value).toBe('- [ ] ## Tekst');
			cleanup(el);
		});

		it('bereikt undo en redo', async () => {
			const el = await withValue('Tekst');
			el.view.dispatch({ selection: { anchor: 0, head: 5 } });
			el.runCommand('bold');
			await waitForUpdate(el);
			expect(el.value).toBe('**Tekst**');
			el.runCommand('undo');
			await waitForUpdate(el);
			expect(el.value).toBe('Tekst');
			el.runCommand('redo');
			await waitForUpdate(el);
			expect(el.value).toBe('**Tekst**');
			cleanup(el);
		});

		it('waarschuwt bij een naam die geen commando is', async () => {
			const el = await withValue('Tekst');
			const warnings: unknown[] = [];
			const original = console.warn;
			console.warn = (...args: unknown[]) => { warnings.push(args[0]); };
			el.runCommand('bald');
			console.warn = original;
			expect(el.value).toBe('Tekst');
			expect(String(warnings[0])).toContain('text-editor-unknown-command');
			expect(String(warnings[0])).toContain('(bald)');
			cleanup(el);
		});

		it('replaceRange werkt op clean offsets en zet de caret erachter', async () => {
			const el = await withValue('een woord hier');
			el.replaceRange(4, 9, 'zin');
			await waitForUpdate(el);
			expect(el.value).toBe('een zin hier');
			expect(el.view.state.selection.main.head).toBe(7);
			// Buiten de tekst wordt geklemd, en to voor from is een invoeging.
			el.replaceRange(100, 200, '!');
			await waitForUpdate(el);
			expect(el.value).toBe('een zin hier!');
			cleanup(el);
		});
	});
});
