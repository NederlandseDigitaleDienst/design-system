import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import './text-field.js';

describe('nldd-text-field', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-text-field></nldd-text-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders valid icon when valid attribute is set', async () => {
		el = await fixture('<nldd-text-field valid></nldd-text-field>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.text-field__validation-icon-area nldd-icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('icon')).toBe('valid');
	});

	it('renders invalid icon when invalid attribute is set', async () => {
		el = await fixture('<nldd-text-field invalid></nldd-text-field>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.text-field__validation-icon-area nldd-icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('icon')).toBe('invalid');
	});

	it('does not render validation icon in neutral state', async () => {
		el = await fixture('<nldd-text-field></nldd-text-field>');
		await waitForUpdate(el);
		const area = el.shadowRoot!.querySelector('.text-field__validation-icon-area');
		expect(area).toBeNull();
	});

	it('dispatches custom input event on input', async () => {
		el = await fixture('<nldd-text-field></nldd-text-field>');
		await waitForUpdate(el);
		const handler = vi.fn();
		el.addEventListener('input', handler);
		const input = el.shadowRoot!.querySelector('input')!;
		input.value = 'hello';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		expect(handler).toHaveBeenCalledOnce();
		expect(handler.mock.calls[0][0].detail.value).toBe('hello');
	});

	it('dispatches custom change event on change', async () => {
		el = await fixture('<nldd-text-field></nldd-text-field>');
		await waitForUpdate(el);
		const handler = vi.fn();
		el.addEventListener('change', handler);
		const input = el.shadowRoot!.querySelector('input')!;
		input.value = 'world';
		input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
		expect(handler).toHaveBeenCalledOnce();
		expect(handler.mock.calls[0][0].detail.value).toBe('world');
	});

	it('does not double-fire input event', async () => {
		el = await fixture('<nldd-text-field></nldd-text-field>');
		await waitForUpdate(el);
		const handler = vi.fn();
		el.addEventListener('input', handler);
		const input = el.shadowRoot!.querySelector('input')!;
		input.value = 'test';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		expect(handler).toHaveBeenCalledOnce();
	});

	it('reflects disabled attribute to host', async () => {
		el = await fixture('<nldd-text-field disabled></nldd-text-field>');
		await waitForUpdate(el);
		expect(el.hasAttribute('disabled')).toBe(true);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.disabled).toBe(true);
	});

	it('reflects readonly attribute to host', async () => {
		el = await fixture('<nldd-text-field readonly></nldd-text-field>');
		await waitForUpdate(el);
		expect(el.hasAttribute('readonly')).toBe(true);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.readOnly).toBe(true);
	});

	it('reflects size attribute to host', async () => {
		el = await fixture('<nldd-text-field size="sm"></nldd-text-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('sm');
	});

	it('forwards accessible-label to the inner input', async () => {
		el = await fixture('<nldd-text-field accessible-label="Zoeken"></nldd-text-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('aria-label')).toBe('Zoeken');
	});

	it('accepts aria-describedby on the host element', async () => {
		el = await fixture('<nldd-text-field aria-describedby="help-1 error-1"></nldd-text-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-describedby')).toBe('help-1 error-1');
	});

	it('points the inner input at the elements that describe it', async () => {
		el = await fixture('<nldd-text-field></nldd-text-field>');
		await waitForUpdate(el);
		const hint = document.createElement('p');
		document.body.appendChild(hint);
		(el as unknown as { describedByElements: readonly Element[] }).describedByElements = [hint];
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('input')! as Element & { ariaDescribedByElements?: readonly Element[] | null };
		expect(inner.ariaDescribedByElements).toEqual([hint]);
		hint.remove();
	});

	it('leaves the inner input undescribed when nothing describes it', async () => {
		el = await fixture('<nldd-text-field></nldd-text-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.hasAttribute('aria-describedby')).toBe(false);
	});

	it('past inline host width toe als width property gezet is', async () => {
		el = await fixture('<nldd-text-field width="240px"></nldd-text-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('240px');
		expect(el.style.getPropertyValue('--_width')).toBe('240px');
	});

	it('participates in FormData via form-associated API', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-text-field name="first" value="Hallo"></nldd-text-field></form>');
		el = form;
		const tf = form.querySelector('nldd-text-field')!;
		await waitForUpdate(tf);
		expect(new FormData(form).get('first')).toBe('Hallo');
	});

	it('resets to the HTML-declared initial value when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-text-field name="email" value="default@example.com"></nldd-text-field></form>');
		el = form;
		const tf = form.querySelector('nldd-text-field')! as HTMLElement & { value: string };
		await waitForUpdate(tf);
		tf.value = 'changed@example.com';
		await waitForUpdate(tf);
		form.reset();
		expect(tf.value).toBe('default@example.com');
	});

	it('verwijdert inline host width als width leeg wordt gezet', async () => {
		el = await fixture('<nldd-text-field width="240px"></nldd-text-field>');
		await waitForUpdate(el);
		(el as any).width = '';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_width')).toBe('');
	});

	it('focus() delegates to the inner input', async () => {
		el = await fixture<HTMLElement>('<nldd-text-field accessible-label="Naam"></nldd-text-field>');
		await waitForUpdate(el);
		el.focus();
		const input = el.shadowRoot!.querySelector('input');
		expect(deepActiveElement()).toBe(input);
	});

	it('inner input keeps spellcheck=true by default', async () => {
		el = await fixture('<nldd-text-field></nldd-text-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('spellcheck')).toBe('true');
	});

	it('no-spellcheck attribute disables spellcheck on inner input', async () => {
		el = await fixture('<nldd-text-field no-spellcheck></nldd-text-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('spellcheck')).toBe('false');
	});

	// The keyboard is a hint to the phone, so the only thing to test is that the
	// hint arrives: the attributes are absent until asked for, and the field
	// keeps taking anything that is typed either way.
	it('sets no inputmode or enterkeyhint of its own', async () => {
		el = await fixture('<nldd-text-field></nldd-text-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.hasAttribute('inputmode')).toBe(false);
		expect(input.hasAttribute('enterkeyhint')).toBe(false);
	});

	it('forwards keyboard to inputmode and enter-key to enterkeyhint', async () => {
		el = await fixture('<nldd-text-field keyboard="numeric" enter-key="done"></nldd-text-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('inputmode')).toBe('numeric');
		expect(input.getAttribute('enterkeyhint')).toBe('done');
	});

	it('keeps accepting text that the keyboard hint does not cover', async () => {
		el = await fixture('<nldd-text-field keyboard="numeric"></nldd-text-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		input.value = 'U42';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect((el as unknown as { value: string }).value).toBe('U42');
	});
});
