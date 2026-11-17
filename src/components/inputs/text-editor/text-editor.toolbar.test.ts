import { describe, it, expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import type { EditorView } from '@codemirror/view';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';
import '../../actions/toolbar/toolbar.js';
import '../../actions/toolbar/toolbar-item.js';
import '../toggle-button/toggle-button.js';
import '../../actions/icon-button/icon-button.js';
import '../../actions/button/button.js';
import '../segmented-control/segmented-control.js';
import '../../actions/menu/menu.js';
import '../../actions/menu/menu-item.js';
import type { NLDDTextEditor } from './text-editor.js';
import { parseCommand } from './text-editor.toolbar.js';
import variablesCss from '../../../assets/styles/variables.css?inline';

type El = NLDDTextEditor & { view: EditorView };

const settle = async (el: HTMLElement): Promise<void> => { await waitForUpdate(el); await new Promise((r) => setTimeout(r)); };

describe('parseCommand', () => {
	it('splits the argument off after a colon, a number as a number', () => {
		expect(parseCommand('bold')).toEqual(['bold', undefined]);
		expect(parseCommand('setHeading:2')).toEqual(['setHeading', 2]);
		expect(parseCommand('setList:task')).toEqual(['setList', 'task']);
	});
});

describe('nldd-text-editor toolbar in a slot', () => {
	let root: HTMLElement;
	afterEach(() => cleanup(root));

	async function make(toolbar: string, value = 'een woord'): Promise<El> {
		root = await fixture<HTMLElement>(`<div><nldd-text-editor accessible-label="t">${toolbar}</nldd-text-editor></div>`);
		const el = root.querySelector('nldd-text-editor') as El;
		el.value = value;
		await el.updateComplete; await settle(el);
		return el;
	}

	it('runs the command of a toggle and shows it on', async () => {
		const el = await make(`<nldd-toggle-button slot="toolbar" text-editor-command="bold" accessible-label="Vet" icon="bold" variant="icon"></nldd-toggle-button>`);
		el.view.dispatch({ selection: { anchor: 4, head: 9 } });
		const bold = el.querySelector('nldd-toggle-button')!;
		bold.click();
		await settle(el);
		expect(el.value).toBe('een **woord**');
		expect(bold.hasAttribute('selected')).toBe(true);
		el.view.dispatch({ selection: { anchor: 0 } });
		await settle(el);
		expect(bold.hasAttribute('selected')).toBe(false);
	});

	it('disables undo without history, and enables it after an edit', async () => {
		const el = await make(`<nldd-icon-button slot="toolbar" text-editor-command="undo" icon="arrow-counter-clockwise" accessible-label="Ongedaan maken"></nldd-icon-button>`);
		const undo = el.querySelector('nldd-icon-button')!;
		expect(undo.hasAttribute('disabled')).toBe(true);
		el.view.dispatch({ changes: { from: 0, insert: 'x' }, userEvent: 'input.type' });
		await settle(el);
		expect(undo.hasAttribute('disabled')).toBe(false);
		undo.click();
		await settle(el);
		expect(el.value).toBe('een woord');
	});

	it('sets a heading from a menu item, with its argument', async () => {
		const el = await make(`<nldd-menu slot="toolbar"><nldd-menu-item type="radio" text-editor-command="setHeading:2" text="Kop 2"></nldd-menu-item></nldd-menu>`);
		const item = el.querySelector('nldd-menu-item')!;
		item.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true }));
		await settle(el);
		expect(el.value).toBe('## een woord');
		expect(item.hasAttribute('selected')).toBe(true);
	});

	it('sets the list type from a segmented control, and turns it off with a second click', async () => {
		const el = await make(`
			<nldd-segmented-control slot="toolbar" text-editor-command="setList" accessible-label="Lijst">
				<nldd-segmented-control-item value="none" text="Geen"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="bullet" text="Opsomming"></nldd-segmented-control-item>
			</nldd-segmented-control>`);
		const control = el.querySelector('nldd-segmented-control') as HTMLElement & { value: string };
		const bullet = el.querySelectorAll('nldd-segmented-control-item')[1] as HTMLElement;
		expect(control.value).toBe('none');
		bullet.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		bullet.click();
		await settle(el);
		expect(el.value).toBe('- een woord');
		expect(control.value).toBe('bullet');
		bullet.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		bullet.click();
		await settle(el);
		expect(el.value).toBe('een woord');
		expect(control.value).toBe('none');
	});

	it('turns the list off with a second press on the keyboard too', async () => {
		const el = await make(`
			<nldd-segmented-control slot="toolbar" text-editor-command="setList" accessible-label="Lijst">
				<nldd-segmented-control-item value="none" text="Geen"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="bullet" text="Opsomming"></nldd-segmented-control-item>
			</nldd-segmented-control>`, '- een woord');
		const bullet = el.querySelectorAll('nldd-segmented-control-item')[1] as HTMLElement;
		bullet.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, composed: true }));
		bullet.click();
		await settle(el);
		expect(el.value).toBe('een woord');
	});

	it('runs a command chosen from the overflow menu once', async () => {
		root = await fixture<HTMLElement>(`
			<div style="width: 120px">
				<nldd-text-editor accessible-label="t">
					<nldd-toolbar slot="toolbar" accessible-label="Opmaak">
						<nldd-toolbar-item slot="start" label="Vet">
							<nldd-toggle-button text-editor-command="bold" text="Vet met een lange naam"></nldd-toggle-button>
							<nldd-menu-item slot="overflow" type="checkbox" text-editor-command="bold" text="Vet"></nldd-menu-item>
						</nldd-toolbar-item>
					</nldd-toolbar>
				</nldd-text-editor>
			</div>`);
		const el = root.querySelector('nldd-text-editor') as El;
		el.value = 'een woord';
		await el.updateComplete; await settle(el);
		el.view.dispatch({ selection: { anchor: 4, head: 9 } });
		const toolbar = el.querySelector('nldd-toolbar')!;
		await vi.waitFor(() => expect(toolbar.shadowRoot!.querySelector('nldd-menu-item[text-editor-command="bold"]')).not.toBeNull());
		const copy = toolbar.shadowRoot!.querySelector('nldd-menu-item[text-editor-command="bold"]')!;
		copy.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true }));
		await settle(el);
		expect(el.value).toBe('een **woord**');
	});

	it('leaves a control without a command alone', async () => {
		const el = await make(`<nldd-button slot="toolbar" text="Verstuur"></nldd-button>`);
		const send = el.querySelector('nldd-button')!;
		send.click();
		await settle(el);
		expect(send.hasAttribute('disabled')).toBe(false);
		expect(el.value).toBe('een woord');
	});

	it('disables every control in a disabled editor, and all but copy when read-only', async () => {
		const el = await make(`
			<nldd-toolbar slot="toolbar" accessible-label="Opmaak">
				<nldd-toolbar-item slot="start" label="Vet"><nldd-toggle-button text-editor-command="bold" text="Vet"></nldd-toggle-button></nldd-toolbar-item>
				<nldd-toolbar-item slot="start" label="Kopieer"><nldd-button text-editor-command="copy" text="Kopieer"></nldd-button></nldd-toolbar-item>
			</nldd-toolbar>`);
		el.view.dispatch({ selection: { anchor: 0, head: 3 } });
		await settle(el);
		const [bold, copy] = [el.querySelector('nldd-toggle-button')!, el.querySelector('nldd-button')!];
		el.readonly = true;
		await settle(el);
		expect([bold.hasAttribute('disabled'), copy.hasAttribute('disabled')]).toEqual([true, false]);
		el.readonly = false;
		el.disabled = true;
		await settle(el);
		expect([bold.hasAttribute('disabled'), copy.hasAttribute('disabled')]).toEqual([true, true]);
	});
});

describe('nldd-text-editor toolbar elsewhere, with text-editor-for', () => {
	let root: HTMLElement;
	afterEach(() => cleanup(root));

	it('drives the editor it names, and not another', async () => {
		root = await fixture<HTMLElement>(`
			<div>
				<nldd-toolbar text-editor-for="notities" accessible-label="Opmaak">
					<nldd-toolbar-item slot="start" label="Cursief">
						<nldd-toggle-button text-editor-command="italic" text="Cursief"></nldd-toggle-button>
					</nldd-toolbar-item>
				</nldd-toolbar>
				<p>Tekst ertussen</p>
				<nldd-text-editor id="notities" accessible-label="Notities"></nldd-text-editor>
				<nldd-text-editor id="ander" accessible-label="Ander"></nldd-text-editor>
			</div>`);
		const [el, other] = [...root.querySelectorAll('nldd-text-editor')] as El[];
		el.value = 'een woord';
		other.value = 'een woord';
		await el.updateComplete; await settle(el);
		el.view.dispatch({ selection: { anchor: 4, head: 9 } });
		other.view.dispatch({ selection: { anchor: 4, head: 9 } });
		root.querySelector('nldd-toggle-button')!.click();
		await settle(el);
		expect(el.value).toBe('een *woord*');
		expect(other.value).toBe('een woord');
	});

	it('gives focus back to the text', async () => {
		root = await fixture<HTMLElement>(`
			<div>
				<div text-editor-for="tekst"><button text-editor-command="bold">Vet</button></div>
				<nldd-text-editor id="tekst" accessible-label="Tekst"></nldd-text-editor>
			</div>`);
		const el = root.querySelector('nldd-text-editor') as El;
		el.value = 'woord';
		await el.updateComplete; await settle(el);
		const button = root.querySelector('button')!;
		button.focus();
		button.click();
		await settle(el);
		expect(el.view.hasFocus).toBe(true);
		expect(el.value).toBe('woord****');
	});
});

describe('nldd-text-editor toolbar that sticks', () => {
	let root: HTMLElement;
	// The gap is a token.
	const tokens = new CSSStyleSheet();
	tokens.replaceSync(variablesCss);
	beforeAll(() => { document.adoptedStyleSheets = [...document.adoptedStyleSheets, tokens]; });
	afterAll(() => { document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== tokens); });
	afterEach(() => cleanup(root));

	const frame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

	async function make(embedded = true): Promise<{ el: El; scroller: HTMLElement; slotEl: HTMLSlotElement }> {
		root = await fixture<HTMLElement>(`
			<div style="height: 200px; overflow: auto">
				<nldd-text-editor ${embedded ? 'embedded' : ''} accessible-label="t"><nldd-toolbar slot="toolbar" accessible-label="Opmaak"></nldd-toolbar></nldd-text-editor>
			</div>`);
		const el = root.querySelector('nldd-text-editor') as El;
		el.value = Array.from({ length: 60 }, (_, i) => `Regel ${i}`).join('\n\n');
		await el.updateComplete; await settle(el); await frame();
		return { el, scroller: root, slotEl: el.shadowRoot!.querySelector('slot[name="toolbar"]')! };
	}

	it('marks the toolbar stuck once the text scrolls under it, with a gap above', async () => {
		const { scroller, slotEl } = await make();
		expect(slotEl.classList.contains('is-stuck')).toBe(false);
		scroller.scrollTop = 300;
		await frame();
		expect(slotEl.classList.contains('is-stuck')).toBe(true);
		expect(slotEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top).toBe(8);
		scroller.scrollTop = 0;
		await frame(); await frame();
		expect(slotEl.classList.contains('is-stuck')).toBe(false);
		expect(slotEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top).toBe(0);
	});

	it('leaves a framed editor alone: it keeps no gap', async () => {
		const { scroller, slotEl } = await make(false);
		scroller.scrollTop = 300;
		await frame();
		expect(slotEl.classList.contains('is-stuck')).toBe(false);
		expect(slotEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top).toBe(0);
	});
});
