import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDSwitchField } from './switch-field.js';
import './switch-field.js';
import '../switch/switch.js';

describe('nldd-switch-field', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-switch-field></nldd-switch-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a label span element', async () => {
		el = await fixture('<nldd-switch-field label="Optie 1"></nldd-switch-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.switch-field__label')).not.toBeNull();
	});

	it('renders label text from attribute', async () => {
		el = await fixture('<nldd-switch-field label="Optie 1"></nldd-switch-field>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector('.switch-field__label')!;
		expect(label.textContent).toBe('Optie 1');
	});

	it('renders nldd-switch in shadow DOM', async () => {
		el = await fixture('<nldd-switch-field></nldd-switch-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-switch')).not.toBeNull();
	});

	it('forwards label as accessible-label to nldd-switch', async () => {
		el = await fixture('<nldd-switch-field label="Meldingen"></nldd-switch-field>');
		await waitForUpdate(el);
		const switchEl = el.shadowRoot!.querySelector('nldd-switch')!;
		expect(switchEl.getAttribute('accessible-label')).toBe('Meldingen');
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-switch-field – state', () => {
	let el: NLDDSwitchField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('is unchecked by default', async () => {
		el = await fixture<NLDDSwitchField>('<nldd-switch-field></nldd-switch-field>');
		await waitForUpdate(el);
		expect(el.checked).toBe(false);
	});

	it('is checked when checked attribute is set', async () => {
		el = await fixture<NLDDSwitchField>('<nldd-switch-field checked></nldd-switch-field>');
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
	});

	it('is disabled when disabled attribute is set', async () => {
		el = await fixture<NLDDSwitchField>('<nldd-switch-field disabled></nldd-switch-field>');
		await waitForUpdate(el);
		const switchEl = el.shadowRoot!.querySelector('nldd-switch') as any;
		await waitForUpdate(switchEl);
		expect(switchEl.disabled).toBe(true);
	});

	it('forwards value in change event detail', async () => {
		el = await fixture<NLDDSwitchField>('<nldd-switch-field value="meldingen"></nldd-switch-field>');
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		const switchEl = el.shadowRoot!.querySelector('nldd-switch')!;
		switchEl.dispatchEvent(new CustomEvent('change', {
			detail: { checked: true },
			bubbles: true,
		}));
		expect(detail?.value).toBe('meldingen');
	});
});


/* ============================================================
   Change event
   ============================================================ */

describe('nldd-switch-field – change event', () => {
	let el: NLDDSwitchField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('updates checked when nldd-switch fires change', async () => {
		el = await fixture<NLDDSwitchField>('<nldd-switch-field></nldd-switch-field>');
		await waitForUpdate(el);
		const switchEl = el.shadowRoot!.querySelector('nldd-switch')!;
		switchEl.dispatchEvent(new CustomEvent('change', {
			detail: { checked: true },
			bubbles: true,
		}));
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
	});

	it('dispatches a change event with checked and value detail', async () => {
		el = await fixture<NLDDSwitchField>('<nldd-switch-field value="on"></nldd-switch-field>');
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		const switchEl = el.shadowRoot!.querySelector('nldd-switch')!;
		switchEl.dispatchEvent(new CustomEvent('change', {
			detail: { checked: true },
			bubbles: true,
		}));
		expect(detail).toBeDefined();
		expect(detail.checked).toBe(true);
		expect(detail.value).toBe('on');
	});
});


/* ============================================================
   Label click
   ============================================================ */

describe('nldd-switch-field – label click', () => {
	let el: NLDDSwitchField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('toggles checked when label span is clicked', async () => {
		el = await fixture<NLDDSwitchField>('<nldd-switch-field label="Optie 1"></nldd-switch-field>');
		await waitForUpdate(el);
		const labelSpan = el.shadowRoot!.querySelector<HTMLElement>('.switch-field__label')!;
		labelSpan.click();
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
	});

	it('does not toggle when disabled and label span is clicked', async () => {
		el = await fixture<NLDDSwitchField>('<nldd-switch-field label="Optie 1" disabled></nldd-switch-field>');
		await waitForUpdate(el);
		const labelSpan = el.shadowRoot!.querySelector<HTMLElement>('.switch-field__label')!;
		labelSpan.click();
		await waitForUpdate(el);
		expect(el.checked).toBe(false);
	});

	it('focus() delegates through to the inner switch input', async () => {
		el = await fixture<NLDDSwitchField>('<nldd-switch-field label="Optie 1"></nldd-switch-field>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('nldd-switch')!;
		await waitForUpdate(inner as HTMLElement);
		el.focus();
		expect(deepActiveElement()).toBe(inner.shadowRoot!.querySelector('.switch__input'));
	});
});

describe('nldd-switch-field – color="inherit"', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('passes the color to its switch and draws its label in the surrounding text color', async () => {
		el = await fixture(`<div style="color: rgb(255, 255, 255);"><nldd-switch-field color="inherit" label="Meldingen"></nldd-switch-field></div>`);
		const field = el.querySelector('nldd-switch-field') as HTMLElement;
		await waitForUpdate(field);
		expect(field.shadowRoot!.querySelector('nldd-switch')!.getAttribute('color')).toBe('inherit');
		expect(getComputedStyle(field.shadowRoot!.querySelector('.switch-field__label')!).color).toBe('rgb(255, 255, 255)');
	});
});
