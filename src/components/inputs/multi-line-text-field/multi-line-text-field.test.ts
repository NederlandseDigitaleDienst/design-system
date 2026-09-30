import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './multi-line-text-field.js';

describe('nldd-multi-line-text-field', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a native textarea', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('textarea')).not.toBeNull();
	});

	it('renders valid icon when valid attribute is set', async () => {
		el = await fixture('<nldd-multi-line-text-field valid></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.multi-line-text-field__validation-icon-area nldd-icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('icon')).toBe('valid');
	});

	it('renders invalid icon when invalid attribute is set', async () => {
		el = await fixture('<nldd-multi-line-text-field invalid></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.multi-line-text-field__validation-icon-area nldd-icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('icon')).toBe('invalid');
	});

	it('does not render validation icon in neutral state', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const area = el.shadowRoot!.querySelector('.multi-line-text-field__validation-icon-area');
		expect(area).toBeNull();
	});

	it('dispatches custom input event on input', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const handler = vi.fn();
		el.addEventListener('input', handler);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		textarea.value = 'hello\nworld';
		textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		expect(handler).toHaveBeenCalledOnce();
		expect(handler.mock.calls[0][0].detail.value).toBe('hello\nworld');
	});

	it('dispatches custom change event on change', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const handler = vi.fn();
		el.addEventListener('change', handler);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		textarea.value = 'committed';
		textarea.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
		expect(handler).toHaveBeenCalledOnce();
		expect(handler.mock.calls[0][0].detail.value).toBe('committed');
	});

	it('does not double-fire input event', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const handler = vi.fn();
		el.addEventListener('input', handler);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		textarea.value = 'test';
		textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		expect(handler).toHaveBeenCalledOnce();
	});

	it('reflects disabled attribute to host', async () => {
		el = await fixture('<nldd-multi-line-text-field disabled></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		expect(el.hasAttribute('disabled')).toBe(true);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		expect(textarea.disabled).toBe(true);
	});

	it('reflects readonly attribute to host', async () => {
		el = await fixture('<nldd-multi-line-text-field readonly></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		expect(el.hasAttribute('readonly')).toBe(true);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		expect(textarea.readOnly).toBe(true);
	});

	it('reflects size attribute to host', async () => {
		el = await fixture('<nldd-multi-line-text-field size="sm"></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('sm');
	});

	it('reflects a non-default resize but keeps the default (auto) attribute-less', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		// The default (auto) is not reflected.
		expect(el.hasAttribute('resize')).toBe(false);
		// A non-default reflects to the attribute.
		(el as unknown as { resize: string }).resize = 'vertical';
		await waitForUpdate(el);
		expect(el.getAttribute('resize')).toBe('vertical');
		// Back to the default strips it from the DOM.
		(el as unknown as { resize: string }).resize = 'auto';
		await waitForUpdate(el);
		expect(el.hasAttribute('resize')).toBe(false);
	});

	it('passes rows attribute to inner textarea', async () => {
		el = await fixture('<nldd-multi-line-text-field rows="5"></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		expect(textarea.rows).toBe(5);
	});

	it('defaults to rows="3"', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		expect(textarea.rows).toBe(3);
	});

	it('exposes rows to CSS as --_rows on the host (auto-resize floor)', async () => {
		el = await fixture('<nldd-multi-line-text-field resize="auto" rows="5"></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_rows')).toBe('5');
	});

	it('defaults --_rows to 3 on the host', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_rows')).toBe('3');
	});

	it('updates --_rows when rows changes at runtime', async () => {
		el = await fixture('<nldd-multi-line-text-field resize="auto" rows="2"></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_rows')).toBe('2');
		(el as any).rows = 6;
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_rows')).toBe('6');
	});

	it('forwards accessible-label to the inner textarea', async () => {
		el = await fixture('<nldd-multi-line-text-field accessible-label="Toelichting"></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		expect(textarea.getAttribute('aria-label')).toBe('Toelichting');
	});

	it('points the inner textarea at the elements that describe it', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const hint = document.createElement('p');
		document.body.appendChild(hint);
		(el as unknown as { describedByElements: readonly Element[] }).describedByElements = [hint];
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('textarea')! as Element & { ariaDescribedByElements?: readonly Element[] | null };
		expect(inner.ariaDescribedByElements).toEqual([hint]);
		hint.remove();
	});

	it('leaves the inner textarea undescribed when nothing describes it', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		expect(textarea.hasAttribute('aria-describedby')).toBe(false);
	});

	it('participates in FormData via form-associated API', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-multi-line-text-field name="notes" value="Eerste regel"></nldd-multi-line-text-field></form>');
		el = form;
		const ml = form.querySelector('nldd-multi-line-text-field')!;
		await waitForUpdate(ml);
		expect(new FormData(form).get('notes')).toBe('Eerste regel');
	});

	it('resets to the HTML-declared initial value when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-multi-line-text-field name="notes" value="Standaard"></nldd-multi-line-text-field></form>');
		el = form;
		const ml = form.querySelector('nldd-multi-line-text-field')! as HTMLElement & { value: string };
		await waitForUpdate(ml);
		ml.value = 'Aangepaste tekst';
		await waitForUpdate(ml);
		form.reset();
		expect(ml.value).toBe('Standaard');
	});

	it('applies inline host width when the width property is set', async () => {
		el = await fixture('<nldd-multi-line-text-field width="240px"></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('240px');
		expect(el.style.getPropertyValue('--_width')).toBe('240px');
	});

	it('clears inline textarea dimensions when resize is set to "auto"', async () => {
		el = await fixture('<nldd-multi-line-text-field resize="vertical"></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		// Simulate a manual resize: browser writes inline height on the textarea
		textarea.style.height = '200px';
		textarea.style.width = '300px';
		(el as any).resize = 'auto';
		await waitForUpdate(el);
		expect(textarea.style.height).toBe('');
		expect(textarea.style.width).toBe('');
	});

	it('removes inline host width when width is set to empty', async () => {
		el = await fixture('<nldd-multi-line-text-field width="240px"></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		(el as any).width = '';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_width')).toBe('');
	});

	it('inner textarea keeps spellcheck=true by default', async () => {
		el = await fixture('<nldd-multi-line-text-field></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		expect(textarea.getAttribute('spellcheck')).toBe('true');
	});

	it('no-spellcheck attribute disables spellcheck on inner textarea', async () => {
		el = await fixture('<nldd-multi-line-text-field no-spellcheck></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const textarea = el.shadowRoot!.querySelector('textarea')!;
		expect(textarea.getAttribute('spellcheck')).toBe('false');
	});

	it('forwards keyboard to inputmode and enter-key to enterkeyhint', async () => {
		el = await fixture('<nldd-multi-line-text-field keyboard="numeric" enter-key="send"></nldd-multi-line-text-field>');
		await waitForUpdate(el);
		const area = el.shadowRoot!.querySelector('textarea')!;
		expect(area.getAttribute('inputmode')).toBe('numeric');
		expect(area.getAttribute('enterkeyhint')).toBe('send');
	});
});
