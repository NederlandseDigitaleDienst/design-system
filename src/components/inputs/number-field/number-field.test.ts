import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDNumberField } from './number-field.js';
import './number-field.js';

describe('nldd-number-field', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-number-field></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders two nldd-icon-button elements', async () => {
		el = await fixture('<nldd-number-field></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelectorAll('nldd-icon-button').length).toBe(2);
	});

	it('renders a native number input', async () => {
		el = await fixture('<nldd-number-field></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input[type="number"]')).not.toBeNull();
	});
});


/* ============================================================
   Size
   ============================================================ */

describe('nldd-number-field – size', () => {
	let el: NLDDNumberField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('defaults size to md', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.size).toBe('md');
	});

	it('reflects size attribute to host', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field size="sm"></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('sm');
	});

	it('renders sm icon buttons when size is md', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field size="md"></nldd-number-field>');
		await waitForUpdate(el);
		const buttons = el.shadowRoot!.querySelectorAll('nldd-icon-button');
		expect(buttons[0].getAttribute('size')).toBe('sm');
		expect(buttons[1].getAttribute('size')).toBe('sm');
	});

	it('renders xs icon buttons when size is sm', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field size="sm"></nldd-number-field>');
		await waitForUpdate(el);
		const buttons = el.shadowRoot!.querySelectorAll('nldd-icon-button');
		expect(buttons[0].getAttribute('size')).toBe('xs');
		expect(buttons[1].getAttribute('size')).toBe('xs');
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-number-field – state', () => {
	let el: NLDDNumberField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('has default value of 0', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.value).toBe(0);
	});

	it('reflects value attribute', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5"></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.value).toBe(5);
	});

	it('forwards name to native input', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field name="count"></nldd-number-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.name).toBe('count');
	});

	it('disables native input when disabled', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field disabled></nldd-number-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.disabled).toBe(true);
	});

	it('disables decrement button at minimum value', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="0" min="0"></nldd-number-field>');
		await waitForUpdate(el);
		const [decrement] = el.shadowRoot!.querySelectorAll('nldd-icon-button');
		await waitForUpdate(decrement);
		expect((decrement as any).disabled).toBe(true);
	});

	it('disables increment button at maximum value', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="10" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		const buttons = el.shadowRoot!.querySelectorAll('nldd-icon-button');
		const increment = buttons[1];
		await waitForUpdate(increment);
		expect((increment as any).disabled).toBe(true);
	});

	it('disables both buttons when component is disabled', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" disabled></nldd-number-field>');
		await waitForUpdate(el);
		const [decrement, increment] = el.shadowRoot!.querySelectorAll('nldd-icon-button');
		await waitForUpdate(decrement);
		await waitForUpdate(increment);
		expect((decrement as any).disabled).toBe(true);
		expect((increment as any).disabled).toBe(true);
	});
});


/* ============================================================
   Increment & decrement
   ============================================================ */

describe('nldd-number-field – increment & decrement', () => {
	let el: NLDDNumberField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('increments value by step', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" step="1"></nldd-number-field>');
		await waitForUpdate(el);
		el._handleIncrease();
		expect(el.value).toBe(6);
	});

	it('decrements value by step', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" step="1"></nldd-number-field>');
		await waitForUpdate(el);
		el._handleDecrease();
		expect(el.value).toBe(4);
	});

	it('respects custom step size', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="0" step="5"></nldd-number-field>');
		await waitForUpdate(el);
		el._handleIncrease();
		expect(el.value).toBe(5);
	});

	it('clamps value to max on increment', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="9" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		el._handleIncrease();
		expect(el.value).toBe(10);
		el._handleIncrease();
		expect(el.value).toBe(10);
	});

	it('clamps value to min on decrement', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="1" min="0"></nldd-number-field>');
		await waitForUpdate(el);
		el._handleDecrease();
		expect(el.value).toBe(0);
		el._handleDecrease();
		expect(el.value).toBe(0);
	});

	it('does not increment when disabled', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" disabled></nldd-number-field>');
		await waitForUpdate(el);
		el._handleIncrease();
		expect(el.value).toBe(5);
	});

	it('does not decrement when disabled', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" disabled></nldd-number-field>');
		await waitForUpdate(el);
		el._handleDecrease();
		expect(el.value).toBe(5);
	});
});


/* ============================================================
   Change event
   ============================================================ */

describe('nldd-number-field – change event', () => {
	let el: NLDDNumberField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('dispatches input and change events on increment', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		let inputDetail: any;
		let changeDetail: any;
		el.addEventListener('input', ((e: CustomEvent) => { inputDetail = e.detail; }) as EventListener);
		el.addEventListener('change', ((e: CustomEvent) => { changeDetail = e.detail; }) as EventListener);
		el._handleIncrease();
		expect(inputDetail?.value).toBe(6);
		expect(changeDetail?.value).toBe(6);
	});

	it('dispatches input and change events on decrement', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" min="0"></nldd-number-field>');
		await waitForUpdate(el);
		let inputDetail: any;
		let changeDetail: any;
		el.addEventListener('input', ((e: CustomEvent) => { inputDetail = e.detail; }) as EventListener);
		el.addEventListener('change', ((e: CustomEvent) => { changeDetail = e.detail; }) as EventListener);
		el._handleDecrease();
		expect(inputDetail?.value).toBe(4);
		expect(changeDetail?.value).toBe(4);
	});

	it('does not dispatch events when value would not change', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="10" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		let eventFired = false;
		el.addEventListener('input', () => { eventFired = true; });
		el._handleIncrease();
		expect(eventFired).toBe(false);
	});
});


/* ============================================================
   Typing & clamping on commit
   ============================================================ */

describe('nldd-number-field – typing & clamping on commit', () => {
	let el: NLDDNumberField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	function type(el: NLDDNumberField, value: string): HTMLInputElement {
		const input = el.shadowRoot!.querySelector('input')!;
		input.value = value;
		input.dispatchEvent(new Event('input', { bubbles: true }));
		return input;
	}

	function blur(input: HTMLInputElement): void {
		input.dispatchEvent(new Event('change', { bubbles: true }));
	}

	it('does not clamp while typing an out-of-range value', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		type(el, '109999');
		await waitForUpdate(el);
		expect(el.value).toBe(109999);
	});

	it('clamps to max on commit when value exceeds max', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		const input = type(el, '109999');
		await waitForUpdate(el);
		blur(input);
		await waitForUpdate(el);
		expect(el.value).toBe(10);
		expect(input.value).toBe('10');
	});

	it('clamps to min on commit when value is below min', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" min="0"></nldd-number-field>');
		await waitForUpdate(el);
		const input = type(el, '-50');
		await waitForUpdate(el);
		blur(input);
		await waitForUpdate(el);
		expect(el.value).toBe(0);
		expect(input.value).toBe('0');
	});

	it('falls back to the last valid value on empty commit', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="7" min="0" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		const input = type(el, '');
		await waitForUpdate(el);
		blur(input);
		await waitForUpdate(el);
		expect(el.value).toBe(7);
		expect(input.value).toBe('7');
	});

	it('updates the last valid value when a new in-range value is committed', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" min="0" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		const first = type(el, '8');
		await waitForUpdate(el);
		blur(first);
		await waitForUpdate(el);
		// Now empty the field and commit — should fall back to 8, not 5.
		const second = type(el, '');
		await waitForUpdate(el);
		blur(second);
		await waitForUpdate(el);
		expect(el.value).toBe(8);
	});

	it('dispatches a single input followed by a single change when a typed value is corrected', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		const input = type(el, '50');
		await waitForUpdate(el);
		let inputCount = 0;
		let changeCount = 0;
		el.addEventListener('input', () => { inputCount++; });
		el.addEventListener('change', () => { changeCount++; });
		blur(input);
		await waitForUpdate(el);
		expect(inputCount).toBe(1);
		expect(changeCount).toBe(1);
		expect(el.value).toBe(10);
	});
});


/* ============================================================
   Accessibility
   ============================================================ */

describe('nldd-number-field – accessibility', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('warns when accessible-label is not provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture('<nldd-number-field></nldd-number-field>');
		await waitForUpdate(el);
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('accessible-label')
		);
	});

	it('does not warn when accessible-label is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture('<nldd-number-field accessible-label="Aantal"></nldd-number-field>');
		await waitForUpdate(el);
		expect(warnSpy).not.toHaveBeenCalled();
	});
});

describe('nldd-number-field – hide-spin-buttons', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('reflecteert hide-spin-buttons attribuut', async () => {
		el = await fixture('<nldd-number-field hide-spin-buttons accessible-label="Aantal"></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.hasAttribute('hide-spin-buttons')).toBe(true);
	});

	it('lijnt de input links uit wanneer spinners verborgen zijn', async () => {
		el = await fixture('<nldd-number-field hide-spin-buttons accessible-label="Aantal"></nldd-number-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('.number-field__input') as HTMLElement;
		// With the spinners hidden, left alignment is what you want: without them a
		// number field is functionally a text input for digits.
		expect(getComputedStyle(input).textAlign).toBe('left');
	});

	it('declareert padding-inline regel voor hide-spin-buttons in styles', async () => {
		// CSS variables are not loaded in the test environment, so numeric computed
		// style values are unreliable. Check through cssRules that the padding rule
		// exists, so the input gets the same inset as other input fields instead of
		// the flex default of 0.
		el = await fixture('<nldd-number-field hide-spin-buttons></nldd-number-field>');
		await waitForUpdate(el);
		const sheets = (el.shadowRoot as ShadowRoot).adoptedStyleSheets;
		const cssText = Array.from(sheets)
			.flatMap(s => Array.from(s.cssRules))
			.map(r => r.cssText)
			.join('\n');
		expect(cssText).toContain('[hide-spin-buttons]');
		expect(cssText).toMatch(/padding-inline:\s*var\(--_number-field-inline-padding\)/);
		expect(cssText).toMatch(/--_number-field-inline-padding:\s*calc/);
	});

	it('default (zonder hide-spin-buttons) toont spin-buttons', async () => {
		el = await fixture('<nldd-number-field accessible-label="Aantal"></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.hasAttribute('hide-spin-buttons')).toBe(false);
		const decrement = el.shadowRoot!.querySelector('.number-field__decrement-button');
		const increment = el.shadowRoot!.querySelector('.number-field__increment-button');
		expect(decrement).not.toBeNull();
		expect(increment).not.toBeNull();
	});

	it('participates in FormData via form-associated API', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-number-field name="qty" value="5"></nldd-number-field></form>');
		el = form;
		const nf = form.querySelector('nldd-number-field')!;
		await waitForUpdate(nf);
		expect(new FormData(form).get('qty')).toBe('5');
	});

	it('resets to the HTML-declared initial value when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-number-field name="qty" value="3"></nldd-number-field></form>');
		el = form;
		const nf = form.querySelector<NLDDNumberField>('nldd-number-field')!;
		await waitForUpdate(nf);
		nf.value = 7;
		await waitForUpdate(nf);
		form.reset();
		expect(nf.value).toBe(3);
	});

	it('focus() delegates to the inner input', async () => {
		el = await fixture<HTMLElement>('<nldd-number-field accessible-label="Aantal"></nldd-number-field>');
		await waitForUpdate(el);
		el.focus();
		const input = el.shadowRoot!.querySelector('input');
		expect(deepActiveElement()).toBe(input);
	});

	it('geeft de input met hide-spin-buttons z\'n eigen minimumbreedte', async () => {
		// Die stond er al, maar verloor van een regel die er ná kwam met dezelfde
		// specificiteit en die altijd matchte, omdat een lege width naar de DOM
		// reflecteerde. De basisregels staan nu op de kale selector, dus deze wint.
		// De token zelf komt uit de globale stylesheet, die hier niet geladen is,
		// dus die zetten we op het element. Het gaat om welke regel wint.
		el = await fixture('<nldd-number-field hide-spin-buttons accessible-label="Aantal" style="--primitives-space-80: 80px"></nldd-number-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(getComputedStyle(input).minWidth).toBe('80px');
	});
});
