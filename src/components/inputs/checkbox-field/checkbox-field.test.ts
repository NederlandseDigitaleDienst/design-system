import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDCheckboxField } from './checkbox-field.js';
import './checkbox-field.js';
import '../checkbox/checkbox.js';

describe('nldd-checkbox-field', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-checkbox-field></nldd-checkbox-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a label span element', async () => {
		el = await fixture('<nldd-checkbox-field label="Optie 1"></nldd-checkbox-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector<HTMLElement>('.checkbox-field__label')).not.toBeNull();
	});

	it('renders label text from attribute', async () => {
		el = await fixture('<nldd-checkbox-field label="Optie 1"></nldd-checkbox-field>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector<HTMLElement>('.checkbox-field__label')!;
		expect(label.textContent).toBe('Optie 1');
	});

	it('renders nldd-checkbox in shadow DOM', async () => {
		el = await fixture('<nldd-checkbox-field></nldd-checkbox-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-checkbox')).not.toBeNull();
	});

	it('forwards label as accessible-label to nldd-checkbox', async () => {
		el = await fixture('<nldd-checkbox-field label="Akkoord"></nldd-checkbox-field>');
		await waitForUpdate(el);
		const checkbox = el.shadowRoot!.querySelector('nldd-checkbox')!;
		expect(checkbox.getAttribute('accessible-label')).toBe('Akkoord');
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-checkbox-field – state', () => {
	let el: NLDDCheckboxField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('is unchecked by default', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field></nldd-checkbox-field>');
		await waitForUpdate(el);
		expect(el.checked).toBe(false);
	});

	it('is checked when checked attribute is set', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field checked></nldd-checkbox-field>');
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
	});

	it('is indeterminate when indeterminate attribute is set', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field indeterminate></nldd-checkbox-field>');
		await waitForUpdate(el);
		expect(el.indeterminate).toBe(true);
	});

	it('is disabled when disabled attribute is set', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field disabled></nldd-checkbox-field>');
		await waitForUpdate(el);
		const checkbox = el.shadowRoot!.querySelector('nldd-checkbox') as any;
		await waitForUpdate(checkbox);
		expect(checkbox.disabled).toBe(true);
	});

	it('forwards value to nldd-checkbox', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field value="agree"></nldd-checkbox-field>');
		await waitForUpdate(el);
		const checkbox = el.shadowRoot!.querySelector('nldd-checkbox') as any;
		await waitForUpdate(checkbox);
		expect(checkbox.value).toBe('agree');
	});

	it('forwards name to nldd-checkbox', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field name="terms"></nldd-checkbox-field>');
		await waitForUpdate(el);
		const checkbox = el.shadowRoot!.querySelector('nldd-checkbox') as any;
		await waitForUpdate(checkbox);
		expect(checkbox.name).toBe('terms');
	});
});


/* ============================================================
   Change event
   ============================================================ */

describe('nldd-checkbox-field – change event', () => {
	let el: NLDDCheckboxField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('updates checked when nldd-checkbox fires change', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field value="agree"></nldd-checkbox-field>');
		await waitForUpdate(el);
		const checkbox = el.shadowRoot!.querySelector('nldd-checkbox')!;
		checkbox.dispatchEvent(new CustomEvent('change', {
			detail: { checked: true, value: 'agree' },
			bubbles: true,
		}));
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
	});

	it('dispatches a change event with checked and value detail', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field value="agree"></nldd-checkbox-field>');
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => {
			detail = e.detail;
		}) as EventListener);

		const checkbox = el.shadowRoot!.querySelector('nldd-checkbox')!;
		checkbox.dispatchEvent(new CustomEvent('change', {
			detail: { checked: true, value: 'agree' },
			bubbles: true,
		}));

		expect(detail).toBeDefined();
		expect(detail.checked).toBe(true);
		expect(detail.value).toBe('agree');
	});

	it('clears indeterminate when change fires', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field indeterminate></nldd-checkbox-field>');
		await waitForUpdate(el);
		const checkbox = el.shadowRoot!.querySelector('nldd-checkbox')!;
		checkbox.dispatchEvent(new CustomEvent('change', {
			detail: { checked: true, value: 'on' },
			bubbles: true,
		}));
		await waitForUpdate(el);
		expect(el.indeterminate).toBe(false);
		expect(el.checked).toBe(true);
	});
});


/* ============================================================
   Label click
   ============================================================ */

describe('nldd-checkbox-field – label click', () => {
	let el: NLDDCheckboxField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('toggles checked when label is clicked', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field label="Optie 1"></nldd-checkbox-field>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector<HTMLElement>('.checkbox-field__label')!;
		label.click();
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
	});

	it('does not toggle when disabled and label is clicked', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field label="Optie 1" disabled></nldd-checkbox-field>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector<HTMLElement>('.checkbox-field__label')!;
		label.click();
		await waitForUpdate(el);
		expect(el.checked).toBe(false);
	});

	it('clears indeterminate when label is clicked', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field label="Optie 1" indeterminate></nldd-checkbox-field>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector<HTMLElement>('.checkbox-field__label')!;
		label.click();
		await waitForUpdate(el);
		expect(el.indeterminate).toBe(false);
	});

	it('submits its value to the surrounding form when checked', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-checkbox-field name="roles" value="admin" label="Beheerder" checked></nldd-checkbox-field></form>');
		el = form as unknown as NLDDCheckboxField;
		const field = form.querySelector('nldd-checkbox-field')!;
		await waitForUpdate(field);
		expect(new FormData(form).get('roles')).toBe('admin');
	});

	it('submits nothing when unchecked', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-checkbox-field name="roles" value="admin" label="Beheerder"></nldd-checkbox-field></form>');
		el = form as unknown as NLDDCheckboxField;
		const field = form.querySelector('nldd-checkbox-field')!;
		await waitForUpdate(field);
		expect(new FormData(form).has('roles')).toBe(false);
	});

	it('commits the form value synchronously on label toggle', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-checkbox-field name="roles" value="admin" label="Beheerder"></nldd-checkbox-field></form>');
		el = form as unknown as NLDDCheckboxField;
		const field = form.querySelector<NLDDCheckboxField>('nldd-checkbox-field')!;
		await waitForUpdate(field);
		let valueAtChange: FormDataEntryValue | null = null;
		field.addEventListener('change', () => { valueAtChange = new FormData(form).get('roles'); });
		field.shadowRoot!.querySelector<HTMLElement>('.checkbox-field__label')!.click();
		await waitForUpdate(field);
		expect(valueAtChange).toBe('admin');
	});

	it('restores its initial state on form reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-checkbox-field name="roles" value="admin" label="Beheerder" checked></nldd-checkbox-field></form>');
		el = form as unknown as NLDDCheckboxField;
		const field = form.querySelector<NLDDCheckboxField>('nldd-checkbox-field')!;
		await waitForUpdate(field);
		field.checked = false;
		await waitForUpdate(field);
		form.reset();
		await waitForUpdate(field);
		expect(field.checked).toBe(true);
		expect(new FormData(form).get('roles')).toBe('admin');
	});

	it('focus() delegates through to the inner checkbox input', async () => {
		el = await fixture<NLDDCheckboxField>('<nldd-checkbox-field label="Optie"></nldd-checkbox-field>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('nldd-checkbox')!;
		await waitForUpdate(inner as HTMLElement);
		el.focus();
		expect(deepActiveElement()).toBe(inner.shadowRoot!.querySelector('.checkbox__input'));
	});
});

describe('nldd-checkbox-field – color="inherit"', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('passes the color to its checkbox and draws its label in the surrounding text color', async () => {
		el = await fixture(`<div style="color: rgb(255, 255, 255);"><nldd-checkbox-field color="inherit" label="Afgerond"></nldd-checkbox-field></div>`);
		const field = el.querySelector('nldd-checkbox-field') as HTMLElement;
		await waitForUpdate(field);
		expect(field.shadowRoot!.querySelector('nldd-checkbox')!.getAttribute('color')).toBe('inherit');
		expect(getComputedStyle(field.shadowRoot!.querySelector('.checkbox-field__label')!).color).toBe('rgb(255, 255, 255)');
	});
});
