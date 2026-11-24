import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDNumberField } from './number-field.js';
import './number-field.js';
import { loadTokens } from '../../../test-tokens.js';

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

	it('is empty without a value', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.value).toBe(null);
		expect(el.shadowRoot!.querySelector('input')!.value).toBe('');
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

	it('fires change once for a typed number within the range', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" min="0" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		const values: Array<number | null> = [];
		el.addEventListener('change', (e) => values.push((e as CustomEvent).detail.value));
		const input = type(el, '8');
		await waitForUpdate(el);
		blur(input);
		await waitForUpdate(el);
		expect(values).toEqual([8]);
	});

	it('compares change with a value set from outside while the user was typing', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="5" min="0" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		const values: Array<number | null> = [];
		el.addEventListener('change', (e) => values.push((e as CustomEvent).detail.value));
		const input = type(el, '8');
		await waitForUpdate(el);
		el.value = 3;
		await waitForUpdate(el);
		blur(input);
		await waitForUpdate(el);
		expect(values).toEqual([]);
		expect(el.value).toBe(3);
	});

	it('fires no change for a value the app set back to what was typed', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="3" min="0" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		const values: Array<number | null> = [];
		el.addEventListener('change', (e) => values.push((e as CustomEvent).detail.value));
		const input = type(el, '5');
		await waitForUpdate(el);
		el.value = null;
		await waitForUpdate(el);
		el.value = 5;
		await waitForUpdate(el);
		blur(input);
		await waitForUpdate(el);
		expect(values).toEqual([]);
	});

	it('fires no change when the user types the value the app just set', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="3" min="0" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		const inputs: Array<number | null> = [];
		const changes: Array<number | null> = [];
		el.addEventListener('input', (e) => inputs.push((e as CustomEvent).detail.value));
		el.addEventListener('change', (e) => changes.push((e as CustomEvent).detail.value));
		const input = type(el, '5');
		await waitForUpdate(el);
		el.value = 7;
		await waitForUpdate(el);
		type(el, '7');
		await waitForUpdate(el);
		blur(input);
		await waitForUpdate(el);
		expect(inputs).toEqual([5]);
		expect(changes).toEqual([]);
		expect(el.value).toBe(7);
	});

	it('reads only numbers a native number input accepts', async () => {
		for (const [attr, expected] of [['12', 12], ['-1.5', -1.5], ['1e2', 100], ['Infinity', null], ['0x10', null], ['abc', null]] as const) {
			el = await fixture<NLDDNumberField>(`<nldd-number-field value="${attr}"></nldd-number-field>`);
			await waitForUpdate(el);
			expect(el.value, attr).toBe(expected);
			cleanup(el);
		}
	});

	it('stays empty when the field is emptied, and commits null', async () => {
		el = await fixture<NLDDNumberField>('<nldd-number-field value="7" min="0" max="10"></nldd-number-field>');
		await waitForUpdate(el);
		const values: Array<number | null> = [];
		el.addEventListener('change', (e) => values.push((e as CustomEvent).detail.value));
		const input = type(el, '');
		await waitForUpdate(el);
		blur(input);
		await waitForUpdate(el);
		expect(el.value).toBe(null);
		expect(input.value).toBe('');
		expect(values).toEqual([null]);
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


describe('nldd-number-field – form and focus', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
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
});

// An optional field nobody touched must not block the form: empty is no answer,
// and min and max only judge a number that was filled in, as natively.
describe('nldd-number-field – empty', () => {
	let form: HTMLFormElement;

	afterEach(() => {
		if (form) cleanup(form);
	});

	const fieldIn = async (attrs: string) => {
		form = await fixture<HTMLFormElement>(`<form><nldd-number-field name="n" accessible-label="Aantal" ${attrs}></nldd-number-field></form>`);
		const field = form.querySelector('nldd-number-field') as NLDDNumberField;
		await waitForUpdate(field);
		return field;
	};

	it('submits empty and is valid with min, when nobody filled it in', async () => {
		await fieldIn('min="1" max="40"');
		expect(new FormData(form).get('n')).toBe('');
		expect(form.checkValidity()).toBe(true);
	});

	it('is invalid empty when required, and valid once filled in', async () => {
		const field = await fieldIn('min="1" required');
		expect(form.checkValidity()).toBe(false);
		const input = field.shadowRoot!.querySelector('input')!;
		input.value = '3';
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(field);
		expect(form.checkValidity()).toBe(true);
		expect(new FormData(form).get('n')).toBe('3');
	});

	it('starts at 0 from empty when 0 lies within the range', async () => {
		const field = await fieldIn('min="-5" max="5"');
		(field.shadowRoot!.querySelector('.number-field__increment-button nldd-icon-button') as HTMLElement).click();
		await waitForUpdate(field);
		expect(field.value).toBe(0);
	});

	it('starts at min from empty with +, and at 0 without a min', async () => {
		const field = await fieldIn('min="5"');
		(field.shadowRoot!.querySelector('.number-field__increment-button nldd-icon-button') as HTMLElement).click();
		await waitForUpdate(field);
		expect(field.value).toBe(5);
		const open = await fieldIn('');
		(open.shadowRoot!.querySelector('.number-field__decrement-button nldd-icon-button') as HTMLElement).click();
		await waitForUpdate(open);
		expect(open.value).toBe(0);
	});

	it('goes back to empty on a form reset when it started empty', async () => {
		const field = await fieldIn('');
		field.value = 4;
		await waitForUpdate(field);
		form.reset();
		await waitForUpdate(field);
		expect(field.value).toBe(null);
	});
});

describe('nldd-number-field – spin-buttons', () => {
	let el: HTMLElement;
	let removeTokens: () => void;

	beforeEach(() => {
		removeTokens = loadTokens();
	});

	afterEach(() => {
		if (el) cleanup(el);
		removeTokens();
	});

	const partsOf = async (attrs: string) => {
		el = await fixture(`<nldd-number-field accessible-label="Aantal" value="5" width="240px" ${attrs}></nldd-number-field>`);
		await waitForUpdate(el);
		const root = el.shadowRoot!;
		const box = (selector: string) => root.querySelector(selector)?.getBoundingClientRect() ?? null;
		const input = root.querySelector('input')!;
		return { field: box('.number-field')!, input, inputBox: input.getBoundingClientRect(), decrement: box('.number-field__decrement-button nldd-icon-button'), increment: box('.number-field__increment-button nldd-icon-button') };
	};

	it('puts both buttons at the end by default, and the value at the start', async () => {
		const { field, input, inputBox, decrement, increment } = await partsOf('');
		expect(el.getAttribute('spin-buttons')).toBeNull();
		expect(decrement!.left).toBeGreaterThan(inputBox.left);
		expect(increment!.left).toBeGreaterThan(decrement!.right);
		expect(field.right - increment!.right).toBeLessThan(8);
		expect(getComputedStyle(input).textAlign).toBe('start');
	});

	it('keeps the order input, decrement, increment for the keyboard', async () => {
		await partsOf('');
		const order = [...el.shadowRoot!.querySelectorAll('input, nldd-icon-button')].map((node) => node.getAttribute('icon') ?? 'input');
		expect(order).toEqual(['input', 'minus', 'plus']);
	});

	it('puts the buttons on either side of a centered value with spin-buttons="split"', async () => {
		const { field, input, inputBox, decrement, increment } = await partsOf('spin-buttons="split"');
		expect(decrement!.right).toBeLessThanOrEqual(inputBox.left);
		expect(increment!.left).toBeGreaterThanOrEqual(inputBox.right);
		expect(decrement!.left - field.left).toBe(field.right - increment!.right);
		expect(getComputedStyle(input).textAlign).toBe('center');
	});

	it('leaves the buttons out with spin-buttons="none", the input keeping a width of its own', async () => {
		el = await fixture('<nldd-number-field spin-buttons="none" accessible-label="Aantal"></nldd-number-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-button')).toBeNull();
		const input = el.shadowRoot!.querySelector('input')!;
		expect(getComputedStyle(input).minWidth).toBe('80px');
		expect(getComputedStyle(input).textAlign).toBe('start');
	});

	it('starts the value where a text field starts its text', async () => {
		const end = getComputedStyle((await partsOf('')).input).paddingLeft;
		cleanup(el);
		const none = getComputedStyle((await partsOf('spin-buttons="none"')).input).paddingLeft;
		expect(end).toBe(none);
		expect(parseFloat(end)).toBeGreaterThan(6);
	});
});
