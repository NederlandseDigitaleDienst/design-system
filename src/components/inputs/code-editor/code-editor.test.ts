import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './code-editor.js';

describe('nldd-code-editor', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-code-editor accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('mount een CodeMirror editor', async () => {
		el = await fixture('<nldd-code-editor accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.cm-editor')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.cm-content')).not.toBeNull();
	});

	it('toont de initiële waarde in de editor', async () => {
		el = await fixture('<nldd-code-editor accessible-label="Code" value="foo: bar"></nldd-code-editor>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content')!;
		expect(content.textContent).toContain('foo: bar');
	});

	it('synct de value-property naar de editor', async () => {
		const el2 = await fixture<HTMLElement & { value: string }>('<nldd-code-editor accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el2);
		el2.value = 'changed: true';
		await waitForUpdate(el2);
		const content = el2.shadowRoot!.querySelector('.cm-content')!;
		expect(content.textContent).toContain('changed: true');
		cleanup(el2);
	});

	it('focus() verlegt de focus naar de interne editor', async () => {
		const el2 = await fixture('<nldd-code-editor accessible-label="Code" value="foo: bar"></nldd-code-editor>');
		await waitForUpdate(el2);
		(el2 as unknown as { focus(): void }).focus();
		const content = el2.shadowRoot!.querySelector('.cm-content');
		expect(el2.shadowRoot!.activeElement).toBe(content);
		cleanup(el2);
	});

	it('reflects the wrap attribute', async () => {
		el = await fixture('<nldd-code-editor wrap accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		expect(el.hasAttribute('wrap')).toBe(true);
	});

	it('default appearance is simple', async () => {
		el = await fixture('<nldd-code-editor accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		expect((el as unknown as { appearance: string }).appearance).toBe('simple');
		expect(el.hasAttribute('appearance')).toBe(false);
	});

	it('readonly blijft focusbaar (content editable, niet "false")', async () => {
		el = await fixture('<nldd-code-editor readonly value="x" accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		expect(content.getAttribute('contenteditable')).not.toBe('false');
	});

	it('disabled maakt de content niet-bewerkbaar', async () => {
		el = await fixture('<nldd-code-editor disabled accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		expect(content.getAttribute('contenteditable')).toBe('false');
	});

	it('emits input event en synct value bij typen', async () => {
		const el2 = await fixture<HTMLElement & { value: string }>('<nldd-code-editor accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el2);
		let received: string | undefined;
		el2.addEventListener('input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
		const content = el2.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		content.focus();
		document.execCommand('insertText', false, 'foo: bar');
		await waitForUpdate(el2);
		expect(received).toBe('foo: bar');
		expect(el2.value).toBe('foo: bar');
		cleanup(el2);
	});

	it('formResetCallback restores the initial value', async () => {
		const el2 = await fixture<HTMLElement & { formResetCallback: () => void; value: string }>(
			'<nldd-code-editor accessible-label="Code" value="initial"></nldd-code-editor>',
		);
		await waitForUpdate(el2);
		el2.value = 'edited';
		await waitForUpdate(el2);
		expect(el2.value).toBe('edited');
		el2.formResetCallback();
		await waitForUpdate(el2);
		expect(el2.value).toBe('initial');
		cleanup(el2);
	});

	it('formStateRestoreCallback applies a string state', async () => {
		const el2 = await fixture<HTMLElement & { formStateRestoreCallback: (state: unknown) => void; value: string }>(
			'<nldd-code-editor accessible-label="Code"></nldd-code-editor>',
		);
		await waitForUpdate(el2);
		el2.formStateRestoreCallback('restored');
		await waitForUpdate(el2);
		expect(el2.value).toBe('restored');
		cleanup(el2);
	});

	it('formStateRestoreCallback ignores non-string state', async () => {
		const el2 = await fixture<HTMLElement & { formStateRestoreCallback: (state: unknown) => void; value: string }>(
			'<nldd-code-editor accessible-label="Code" value="kept"></nldd-code-editor>',
		);
		await waitForUpdate(el2);
		el2.formStateRestoreCallback(new FormData());
		await waitForUpdate(el2);
		expect(el2.value).toBe('kept');
		cleanup(el2);
	});


	/* ============================================================
	   Editable a11y (textbox semantics — parity with <textarea>)
	   ============================================================ */

	// CodeMirror's content is a bare contenteditable; it must carry the textbox
	// semantics a native textarea had so screen readers announce it (WCAG 4.1.2).
	it('gives the content role=textbox and aria-multiline', async () => {
		el = await fixture('<nldd-code-editor accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		expect(content.getAttribute('role')).toBe('textbox');
		expect(content.getAttribute('aria-multiline')).toBe('true');
	});

	it('reflects readonly as aria-readonly on the content', async () => {
		el = await fixture('<nldd-code-editor readonly accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		expect(content.getAttribute('aria-readonly')).toBe('true');
	});

	it('reflects disabled as aria-readonly on the content', async () => {
		el = await fixture('<nldd-code-editor disabled accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		expect(content.getAttribute('aria-readonly')).toBe('true');
	});

	it('reflects required as aria-required on the content', async () => {
		el = await fixture('<nldd-code-editor required accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		expect(content.getAttribute('aria-required')).toBe('true');
	});

	it('omits aria-readonly/aria-required by default', async () => {
		el = await fixture('<nldd-code-editor accessible-label="Code"></nldd-code-editor>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		expect(content.hasAttribute('aria-readonly')).toBe(false);
		expect(content.hasAttribute('aria-required')).toBe(false);
	});

	// fix 8: focusFromPoint is documented as a no-op on a non-editable view. On a
	// read-only editor a direct call must not move the caret (it early-returns on
	// state.readOnly before dispatching any selection change).
	it('focusFromPoint does not move the caret on a read-only view', async () => {
		const el2 = await fixture<HTMLElement & { focusFromPoint(x: number, y: number): void }>(
			'<nldd-code-editor readonly value="line one\nline two\nline three" accessible-label="Code"></nldd-code-editor>',
		);
		await waitForUpdate(el2);
		const view = (el2 as unknown as { view: { state: { selection: { main: { head: number } } } } }).view;
		const before = view.state.selection.main.head;
		// A point well inside the content; on an editable view this would move the
		// caret there. Read-only must leave the selection untouched.
		el2.focusFromPoint(40, 40);
		await waitForUpdate(el2);
		expect(view.state.selection.main.head).toBe(before);
		cleanup(el2);
	});

	it('updates aria-readonly/aria-required when readonly/required toggle at runtime', async () => {
		const el2 = await fixture<HTMLElement & { readonly: boolean; required: boolean }>(
			'<nldd-code-editor accessible-label="Code"></nldd-code-editor>',
		);
		await waitForUpdate(el2);
		const content = el2.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		expect(content.hasAttribute('aria-readonly')).toBe(false);

		el2.readonly = true;
		el2.required = true;
		await waitForUpdate(el2);
		expect(content.getAttribute('aria-readonly')).toBe('true');
		expect(content.getAttribute('aria-required')).toBe('true');

		el2.readonly = false;
		el2.required = false;
		await waitForUpdate(el2);
		expect(content.hasAttribute('aria-readonly')).toBe(false);
		expect(content.hasAttribute('aria-required')).toBe(false);
		cleanup(el2);
	});
});
