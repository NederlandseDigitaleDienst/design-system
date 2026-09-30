import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './password-field.js';

describe('nldd-password-field', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to masked (type="password")', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.type).toBe('password');
	});

	it('shows password as text when masked is false', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		(el as any).masked = false;
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.type).toBe('text');
	});

	it('toggles masked state when visibility button is clicked', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		expect((el as any).masked).toBe(true);
		const button = el.shadowRoot!.querySelector('.password-field__visibility-toggle-button nldd-button')!;
		(button as HTMLElement).click();
		await waitForUpdate(el);
		expect((el as any).masked).toBe(false);
		(button as HTMLElement).click();
		await waitForUpdate(el);
		expect((el as any).masked).toBe(true);
	});

	it('shows default visible label "Toon" when masked', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('nldd-button');
		expect(button!.getAttribute('text')).toBe('Toon');
	});

	it('shows default visible label "Verberg" when unmasked', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		(el as any).masked = false;
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('nldd-button');
		expect(button!.getAttribute('text')).toBe('Verberg');
	});

	it('sets default aria-label "Toon wachtwoord" on toggle button when masked', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('nldd-button');
		expect(button!.getAttribute('accessible-label')).toBe('Toon wachtwoord');
	});

	it('sets default aria-label "Verberg wachtwoord" on toggle button when unmasked', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		(el as any).masked = false;
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('nldd-button');
		expect(button!.getAttribute('accessible-label')).toBe('Verberg wachtwoord');
	});

	it('uses custom show-button-text and show-button-accessible-label when provided', async () => {
		el = await fixture('<nldd-password-field show-button-text="Show" show-button-accessible-label="Show password"></nldd-password-field>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('nldd-button');
		expect(button!.getAttribute('text')).toBe('Show');
		expect(button!.getAttribute('accessible-label')).toBe('Show password');
	});

	it('applies is-masked class to input when masked', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.classList.contains('is-masked')).toBe(true);
	});

	it('removes is-masked class from input when unmasked', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		(el as any).masked = false;
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.classList.contains('is-masked')).toBe(false);
	});

	it('renders valid icon when valid attribute is set', async () => {
		el = await fixture('<nldd-password-field valid></nldd-password-field>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.password-field__validation-icon-area nldd-icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('icon')).toBe('valid');
	});

	it('renders invalid icon when invalid attribute is set', async () => {
		el = await fixture('<nldd-password-field invalid></nldd-password-field>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.password-field__validation-icon-area nldd-icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('icon')).toBe('invalid');
	});

	it('does not render validation icon in neutral state', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		const area = el.shadowRoot!.querySelector('.password-field__validation-icon-area');
		expect(area).toBeNull();
	});

	it('dispatches custom input event on input', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		const handler = vi.fn();
		el.addEventListener('input', handler);
		const input = el.shadowRoot!.querySelector('input')!;
		input.value = 'secret';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		expect(handler).toHaveBeenCalledOnce();
		expect(handler.mock.calls[0][0].detail.value).toBe('secret');
	});

	it('dispatches custom change event on change', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		const handler = vi.fn();
		el.addEventListener('change', handler);
		const input = el.shadowRoot!.querySelector('input')!;
		input.value = 'secret';
		input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
		expect(handler).toHaveBeenCalledOnce();
		expect(handler.mock.calls[0][0].detail.value).toBe('secret');
	});

	it('does not double-fire input event', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		const handler = vi.fn();
		el.addEventListener('input', handler);
		const input = el.shadowRoot!.querySelector('input')!;
		input.value = 'test';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		expect(handler).toHaveBeenCalledOnce();
	});

	it('reflects disabled attribute to host', async () => {
		el = await fixture('<nldd-password-field disabled></nldd-password-field>');
		await waitForUpdate(el);
		expect(el.hasAttribute('disabled')).toBe(true);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.disabled).toBe(true);
	});

	it('reflects readonly attribute to host', async () => {
		el = await fixture('<nldd-password-field readonly></nldd-password-field>');
		await waitForUpdate(el);
		expect(el.hasAttribute('readonly')).toBe(true);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.readOnly).toBe(true);
	});

	it('disables visibility toggle button when disabled', async () => {
		el = await fixture('<nldd-password-field disabled></nldd-password-field>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.password-field__visibility-toggle-button nldd-button')!;
		expect(button.hasAttribute('disabled')).toBe(true);
	});

	it('forwards accessible-label to the inner input', async () => {
		el = await fixture('<nldd-password-field accessible-label="Wachtwoord"></nldd-password-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('aria-label')).toBe('Wachtwoord');
	});

	it('accepts aria-describedby on the host element', async () => {
		el = await fixture('<nldd-password-field aria-describedby="help-1 error-1"></nldd-password-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-describedby')).toBe('help-1 error-1');
	});

	it('points the inner input at the elements that describe it', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
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
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.hasAttribute('aria-describedby')).toBe(false);
	});

	it('reflects size attribute to host', async () => {
		el = await fixture('<nldd-password-field size="sm"></nldd-password-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('sm');
	});

	it('past inline host width toe als width property gezet is', async () => {
		el = await fixture('<nldd-password-field width="240px"></nldd-password-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('240px');
		expect(el.style.getPropertyValue('--_width')).toBe('240px');
	});

	it('participates in FormData via form-associated API', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-password-field name="password" value="secret"></nldd-password-field></form>');
		el = form;
		const pw = form.querySelector('nldd-password-field')!;
		await waitForUpdate(pw);
		expect(new FormData(form).get('password')).toBe('secret');
	});

	it('resets to the HTML-declared initial value when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-password-field name="password" value="default"></nldd-password-field></form>');
		el = form;
		const pw = form.querySelector('nldd-password-field')! as HTMLElement & { value: string };
		await waitForUpdate(pw);
		pw.value = 'changed';
		await waitForUpdate(pw);
		form.reset();
		expect(pw.value).toBe('default');
	});

	it('inner input has spellcheck=false hardcoded', async () => {
		el = await fixture('<nldd-password-field></nldd-password-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('spellcheck')).toBe('false');
	});
});
