import { describe, it, expect, afterEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate, until } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import './one-time-code-field.js';
import type { NLDDOneTimeCodeField } from './one-time-code-field.js';

describe('nldd-one-time-code-field', () => {
	let el: NLDDOneTimeCodeField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const input = () => el.shadowRoot!.querySelector<HTMLInputElement>('.one-time-code-field__input')!;
	const boxes = () => [...el.shadowRoot!.querySelectorAll('.one-time-code-field__box')];
	const type = async (text: string) => {
		input().value = text;
		input().dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		await el.updateComplete;
	};

	it('renders without errors', async () => {
		el = await fixture('<nldd-one-time-code-field></nldd-one-time-code-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('draws a box per character, six by default', async () => {
		el = await fixture('<nldd-one-time-code-field></nldd-one-time-code-field>');
		expect(boxes()).toHaveLength(6);
		el.length = 4;
		await el.updateComplete;
		expect(boxes()).toHaveLength(4);
	});

	it('draws a format as boxes with separators, and format wins over length', async () => {
		el = await fixture('<nldd-one-time-code-field format="###-##" length="8"></nldd-one-time-code-field>');
		expect(boxes()).toHaveLength(5);
		expect(input().maxLength).toBe(5);
		const separators = [...el.shadowRoot!.querySelectorAll('.one-time-code-field__separator')];
		expect(separators.map((separator) => separator.className)).toEqual(['one-time-code-field__separator one-time-code-field__separator--dash']);
		await type('123-45');
		expect(el.value).toBe('12345');
	});

	it('draws a space as room between the groups, and keeps another character as text', async () => {
		el = await fixture('<nldd-one-time-code-field format="## ##/##"></nldd-one-time-code-field>');
		const [space, slash] = el.shadowRoot!.querySelectorAll<HTMLElement>('.one-time-code-field__separator');
		expect(space.classList.contains('one-time-code-field__separator--space')).toBe(true);
		expect(slash.textContent).toBe('/');
	});

	it('steps down a size where the boxes do not fit, and back up when they do', async () => {
		const unloadTokens = loadTokens();
		el = await fixture('<nldd-one-time-code-field size="lg" style="width: 600px"></nldd-one-time-code-field>');
		const row = () => el.shadowRoot!.querySelector<HTMLElement>('.one-time-code-field__boxes')!;
		await until(() => el.getAttribute('data-fit') === null);
		el.style.width = '280px';
		await until(() => el.hasAttribute('data-fit'));
		expect(row().getBoundingClientRect().width).toBeLessThanOrEqual(280.5);
		const fitted = el.getAttribute('data-fit');
		el.style.width = '200px';
		await until(() => el.getAttribute('data-fit') === 'sm');
		expect(boxes().every((box) => box.getBoundingClientRect().top === boxes()[0].getBoundingClientRect().top)).toBe(true);
		el.style.width = '600px';
		await until(() => el.getAttribute('data-fit') === null);
		expect(['md', 'sm']).toContain(fitted);
		unloadTokens();
	});

	it('shows a text field in its own size where not even sm fits, and boxes again when they fit', async () => {
		const unloadTokens = loadTokens();
		el = await fixture('<nldd-one-time-code-field size="lg" value="123" style="width: 120px"></nldd-one-time-code-field>');
		await until(() => el.getAttribute('data-fit') === 'field');
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.one-time-code-field__input')!;
		const row = el.shadowRoot!.querySelector<HTMLElement>('.one-time-code-field__boxes')!;
		expect(getComputedStyle(row).display).toBe('none');
		expect(getComputedStyle(input).color).not.toBe('rgba(0, 0, 0, 0)');
		expect(input.getBoundingClientRect().width).toBeLessThanOrEqual(120.5);
		expect(el.shadowRoot!.querySelector<HTMLElement>(".one-time-code-field")!.getBoundingClientRect().height).toBe(56);
		expect(input.value).toBe('123');
		expect(el.shadowRoot!.querySelector('.one-time-code-field__validation-icon-area')).toBeNull();
		el.setAttribute('invalid', '');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector<HTMLElement>('.one-time-code-field__validation-icon-area')!;
		expect(getComputedStyle(icon).display).toBe('flex');
		expect(icon.getBoundingClientRect().right).toBeLessThanOrEqual(el.getBoundingClientRect().right);
		el.style.width = '600px';
		await until(() => el.getAttribute('data-fit') === null);
		expect(getComputedStyle(row).display).toBe('flex');
		expect(getComputedStyle(icon).display).toBe('none');
		unloadTokens();
	});

	it('edits as a normal text field where it shows one', async () => {
		const unloadTokens = loadTokens();
		el = await fixture('<nldd-one-time-code-field value="123456" style="width: 120px"></nldd-one-time-code-field>');
		await until(() => el.getAttribute('data-fit') === 'field');
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.one-time-code-field__input')!;
		input.focus();
		input.setSelectionRange(1, 3);
		input.dispatchEvent(new Event('select'));
		expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3]);
		const left = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
		input.dispatchEvent(left);
		expect(left.defaultPrevented).toBe(false);
		input.value = '19a456';
		input.setSelectionRange(3, 3);
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(el.value).toBe('19456');
		expect(input.value).toBe('19456');
		expect(input.selectionStart).toBe(2);
		const letter = new InputEvent('beforeinput', { inputType: 'insertText', data: 'a', cancelable: true });
		input.dispatchEvent(letter);
		expect(letter.defaultPrevented).toBe(true);
		const digit = new InputEvent('beforeinput', { inputType: 'insertText', data: '7', cancelable: true });
		input.dispatchEvent(digit);
		expect(digit.defaultPrevented).toBe(false);
		unloadTokens();
	});

	it('cuts a paste in the text field to the length of the code', async () => {
		const unloadTokens = loadTokens();
		el = await fixture('<nldd-one-time-code-field value="123" style="width: 120px"></nldd-one-time-code-field>');
		await until(() => el.getAttribute('data-fit') === 'field');
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.one-time-code-field__input')!;
		const paste = (text: string): void => {
			const data = new DataTransfer();
			data.setData('text/plain', text);
			input.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertFromPaste', dataTransfer: data, cancelable: true }));
		};
		input.focus();
		input.setSelectionRange(1, 1);
		paste('98765');
		expect(input.value).toBe('198765');
		expect(el.value).toBe('198765');
		input.setSelectionRange(0, 0);
		paste('1234567890');
		expect(input.value).toHaveLength(6);
		expect(el.value).toHaveLength(6);
		unloadTokens();
	});

	// The boxes are as wide at a size whatever room the field has: measured
	// once, a resize only compares, and lays nothing out again.
	it('steps down on a resize without measuring the boxes again', async () => {
		const unloadTokens = loadTokens();
		el = await fixture('<nldd-one-time-code-field size="lg" style="width: 600px"></nldd-one-time-code-field>');
		await until(() => el._boxWidths !== null);
		const measure = vi.spyOn(el, '_fitSizes');
		el.style.width = '200px';
		await until(() => el.getAttribute('data-fit') === 'sm');
		el.style.width = '600px';
		await until(() => el.getAttribute('data-fit') === null);
		expect(measure).not.toHaveBeenCalled();
		unloadTokens();
	});

	it('measures the boxes again when their size changes', async () => {
		const unloadTokens = loadTokens();
		el = await fixture('<nldd-one-time-code-field size="lg" style="width: 600px"></nldd-one-time-code-field>');
		await until(() => el._boxWidths !== null);
		const lg = el._boxWidths!.widths[0];
		el.length = 4;
		await until(() => el._boxWidths !== null && el._boxWidths.widths[0] < lg);
		unloadTokens();
	});

	it('puts the boxes in the middle with centered, and still steps down', async () => {
		const unloadTokens = loadTokens();
		el = await fixture('<nldd-one-time-code-field centered style="width: 400px"></nldd-one-time-code-field>');
		await new Promise((r) => setTimeout(r, 50));
		const host = el.getBoundingClientRect();
		const field = el.shadowRoot!.querySelector<HTMLElement>('.one-time-code-field')!.getBoundingClientRect();
		expect(host.width).toBe(400);
		expect(Math.abs(field.left - host.left - (host.right - field.right))).toBeLessThan(1);
		el.style.width = '200px';
		await until(() => el.getAttribute('data-fit') === 'sm');
		unloadTokens();
	});

	it('treats an unknown size as md when it fits', async () => {
		const unloadTokens = loadTokens();
		el = await fixture('<nldd-one-time-code-field size="xl" style="width: 600px"></nldd-one-time-code-field>');
		const md = await fixture<HTMLElement>('<nldd-one-time-code-field style="width: 600px"></nldd-one-time-code-field>');
		await new Promise((r) => setTimeout(r, 50));
		const width = (field: HTMLElement) => field.shadowRoot!.querySelector<HTMLElement>('.one-time-code-field__box')!.getBoundingClientRect().width;
		expect(width(el)).toBe(width(md));
		cleanup(md);
		unloadTokens();
	});

	it('ignores a format without a box', async () => {
		el = await fixture('<nldd-one-time-code-field format="000-000" length="4"></nldd-one-time-code-field>');
		expect(boxes()).toHaveLength(4);
		expect(el.shadowRoot!.querySelector('.one-time-code-field__separator')).toBeNull();
	});

	it('is one native input that a phone can fill from a text message', async () => {
		el = await fixture('<nldd-one-time-code-field></nldd-one-time-code-field>');
		expect(el.shadowRoot!.querySelectorAll('input')).toHaveLength(1);
		expect(input().getAttribute('autocomplete')).toBe('one-time-code');
		expect(input().getAttribute('inputmode')).toBe('numeric');
		expect(input().maxLength).toBe(6);
		expect(el.shadowRoot!.querySelector('.one-time-code-field__boxes')!.getAttribute('aria-hidden')).toBe('true');
	});

	it('shows each character in its box', async () => {
		el = await fixture('<nldd-one-time-code-field value="123"></nldd-one-time-code-field>');
		expect(boxes().map((box) => box.textContent!.trim())).toEqual(['1', '2', '3', '', '', '']);
	});

	it('drops what is not part of a code from a pasted one', async () => {
		el = await fixture('<nldd-one-time-code-field></nldd-one-time-code-field>');
		await type('123 456');
		expect(el.value).toBe('123456');
		await type('12-34ab');
		expect(el.value).toBe('1234');
	});

	it('keeps letters for an alphanumeric code, and no more than the length', async () => {
		el = await fixture('<nldd-one-time-code-field type="alphanumeric" length="4"></nldd-one-time-code-field>');
		expect(input().getAttribute('inputmode')).toBe('text');
		await type('ab-12cd');
		expect(el.value).toBe('ab12');
	});

	it('turns letters into capitals with uppercase, in the value too', async () => {
		el = await fixture('<nldd-one-time-code-field type="alphanumeric" uppercase length="4"></nldd-one-time-code-field>');
		expect(input().getAttribute('autocapitalize')).toBe('characters');
		await type('ab-1c');
		expect(el.value).toBe('AB1C');
		expect(boxes().map((box) => box.textContent!.trim())).toEqual(['A', 'B', '1', 'C']);
	});

	it('keeps case without uppercase', async () => {
		el = await fixture('<nldd-one-time-code-field type="alphanumeric" length="4" value="aB1c"></nldd-one-time-code-field>');
		expect(el.value).toBe('aB1c');
	});

	it('fires complete once, when the last box fills', async () => {
		el = await fixture('<nldd-one-time-code-field length="4"></nldd-one-time-code-field>');
		const complete = vi.fn();
		el.addEventListener('complete', complete);
		await type('123');
		expect(complete).not.toHaveBeenCalled();
		await type('1234');
		expect(complete).toHaveBeenCalledTimes(1);
		expect(complete.mock.calls[0][0].detail).toEqual({ value: '1234' });
		await type('1234');
		expect(complete).toHaveBeenCalledTimes(1);
	});

	it('submits its value under its name', async () => {
		const form = document.createElement('form');
		form.innerHTML = '<nldd-one-time-code-field name="code" value="123456"></nldd-one-time-code-field>';
		document.body.append(form);
		el = form.querySelector('nldd-one-time-code-field')!;
		await el.updateComplete;
		expect(new FormData(form).get('code')).toBe('123456');
		form.remove();
	});

	it('counts an incomplete code as invalid', async () => {
		el = await fixture('<nldd-one-time-code-field required></nldd-one-time-code-field>');
		await type('123');
		expect(el.internals.validity.valid).toBe(false);
		await type('123456');
		expect(el.internals.validity.valid).toBe(true);
	});

	it('marks the box the next character goes in while focused', async () => {
		el = await fixture('<nldd-one-time-code-field value="12"></nldd-one-time-code-field>');
		el.focus();
		await el.updateComplete;
		expect(boxes().findIndex((box) => box.classList.contains('is-active'))).toBe(2);
		input().blur();
		await el.updateComplete;
		expect(el.shadowRoot!.querySelector('.is-active')).toBeNull();
	});

	const active = () => boxes().findIndex((box) => box.classList.contains('is-active'));

	const beforeInput = async (inputType: string, data?: string) => {
		const event = new InputEvent('beforeinput', { inputType, data, cancelable: true, bubbles: true, composed: true });
		input().dispatchEvent(event);
		await el.updateComplete;
		return event;
	};

	const key = async (name: string) => {
		input().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, composed: true, cancelable: true }));
		await el.updateComplete;
	};

	const press = async (index: number) => {
		const { left, width, top, height } = boxes()[index].getBoundingClientRect();
		input().dispatchEvent(new PointerEvent('pointerdown', { clientX: left + width / 2, clientY: top + height / 2, pointerType: 'mouse', bubbles: true, cancelable: true, composed: true }));
		await el.updateComplete;
	};

	it('keeps the caret in the box that was pressed, after its character', async () => {
		el = await fixture('<nldd-one-time-code-field value="123"></nldd-one-time-code-field>');
		await press(2);
		expect(active()).toBe(2);
		expect(boxes()[2].querySelector('.one-time-code-field__caret.is-after')).not.toBeNull();
	});

	describe('pressing beside the boxes', () => {
		let unloadTokens: () => void;
		afterEach(() => unloadTokens?.());

		const setup = async (attributes = '') => {
			unloadTokens = loadTokens();
			el = await fixture(`<nldd-one-time-code-field ${attributes} accessible-label="Code" style="width: 800px"></nldd-one-time-code-field>`);
			await el.updateComplete;
			const host = el.getBoundingClientRect();
			const boxes = el.shadowRoot!.querySelector('.one-time-code-field__boxes')!.getBoundingClientRect();
			// Relative to the host, as userEvent.click positions it. Forced: beside
			// the boxes the host takes no pointer events, so Playwright would wait.
			const at = (x: number) => ({ position: { x: Math.round(x - host.left), y: Math.round(host.height / 2) }, force: true });
			return { host, boxes, at };
		};

		it('does not focus the field from the space to the right of the boxes', async () => {
			const { host, boxes, at } = await setup();
			expect(boxes.right).toBeLessThan(host.right - 40);
			await userEvent.click(el, at(host.right - 20));
			expect(el.matches(':focus-within')).toBe(false);
		});

		it('does not focus a centered field from the space on either side', async () => {
			const { host, boxes, at } = await setup('centered');
			await userEvent.click(el, at(host.left + (boxes.left - host.left) / 2));
			expect(el.matches(':focus-within')).toBe(false);
			await userEvent.click(el, at(boxes.right + (host.right - boxes.right) / 2));
			expect(el.matches(':focus-within')).toBe(false);
		});

		it('still focuses the field from a box and from the gap between two', async () => {
			await setup();
			const [first, second] = [...el.shadowRoot!.querySelectorAll('.one-time-code-field__box')].map((box) => box.getBoundingClientRect());
			const host = el.getBoundingClientRect();
			await userEvent.click(el, { position: { x: Math.round((first.right + second.left) / 2 - host.left), y: Math.round(host.height / 2) } });
			expect(el.matches(':focus-within')).toBe(true);
		});
	});

	it('lands in the first empty box when focus comes from the keyboard', async () => {
		el = await fixture('<nldd-one-time-code-field value="12"></nldd-one-time-code-field>');
		el.focus();
		await el.updateComplete;
		expect(active()).toBe(2);
	});

	it('empties a box with Backspace without moving the rest, so the right character goes straight in', async () => {
		el = await fixture('<nldd-one-time-code-field value="123456"></nldd-one-time-code-field>');
		await press(2);
		await beforeInput('deleteContentBackward');
		expect(boxes().map((box) => box.textContent!.trim())).toEqual(['1', '2', '', '4', '5', '6']);
		expect(active()).toBe(2);
		await beforeInput('insertText', '9');
		expect(el.value).toBe('129456');
	});

	it('empties the box before an empty one on Backspace', async () => {
		el = await fixture('<nldd-one-time-code-field value="12"></nldd-one-time-code-field>');
		el.focus();
		await el.updateComplete;
		await beforeInput('deleteContentBackward');
		expect(el.value).toBe('1');
		expect(active()).toBe(1);
	});

	it('moves to the box before on Backspace in an empty field, where the input sends no beforeinput', async () => {
		// Emptying each box in turn leaves the caret in the last one, over an empty input.
		el = await fixture('<nldd-one-time-code-field value="12345"></nldd-one-time-code-field>');
		for (const index of [0, 1, 2, 3, 4]) {
			await press(index);
			await beforeInput('deleteContentBackward');
		}
		expect(el.value).toBe('');
		expect(active()).toBe(4);
		const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true, composed: true });
		input().dispatchEvent(event);
		await el.updateComplete;
		expect(event.defaultPrevented).toBe(true);
		expect(active()).toBe(3);
	});

	it('empties a filled first box on Backspace with the caret before it, as the box is the unit', async () => {
		el = await fixture('<nldd-one-time-code-field value="12"></nldd-one-time-code-field>');
		await press(0);
		input().setSelectionRange(0, 0);
		const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true, composed: true });
		input().dispatchEvent(event);
		await el.updateComplete;
		expect(event.defaultPrevented).toBe(true);
		expect(el.charAt(0)).toBe('');
		expect(el.charAt(1)).toBe('2');
		expect(active()).toBe(0);
	});

	it('leaves Backspace to beforeinput where the input has something to delete', async () => {
		el = await fixture('<nldd-one-time-code-field value="12"></nldd-one-time-code-field>');
		el.focus();
		await el.updateComplete;
		const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true, composed: true });
		input().dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
		expect(el.value).toBe('12');
	});

	it('leaves Backspace on a selection from the start to the input', async () => {
		el = await fixture('<nldd-one-time-code-field value="123"></nldd-one-time-code-field>');
		el.focus();
		await el.updateComplete;
		input().setSelectionRange(0, input().value.length);
		const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true, composed: true });
		input().dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
	});

	it('leaves a readonly or disabled field as it is on Backspace', async () => {
		for (const flag of ['readonly', 'disabled']) {
			if (el) cleanup(el);
			el = await fixture(`<nldd-one-time-code-field value="12" ${flag}></nldd-one-time-code-field>`);
			input().setSelectionRange(0, 0);
			const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true, composed: true });
			input().dispatchEvent(event);
			await el.updateComplete;
			expect(event.defaultPrevented).toBe(false);
			expect(el.value).toBe('12');
		}
	});

	it('leaves Backspace during a composition to the input', async () => {
		el = await fixture('<nldd-one-time-code-field></nldd-one-time-code-field>');
		el.focus();
		await el.updateComplete;
		const event = new KeyboardEvent('keydown', { key: 'Backspace', isComposing: true, bubbles: true, cancelable: true, composed: true });
		input().dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
	});

	it('keeps the focus ring on a readonly field, without a caret, and leaves its value alone', async () => {
		el = await fixture('<nldd-one-time-code-field value="123456" readonly></nldd-one-time-code-field>');
		el.focus();
		await el.updateComplete;
		const root = el.shadowRoot!;
		expect(root.querySelectorAll('.one-time-code-field__box.is-active')).toHaveLength(1);
		expect(root.querySelector('.one-time-code-field__caret')).toBeNull();
		await beforeInput('deleteContentBackward');
		expect(el.value).toBe('123456');
	});

	it('moves with the arrow keys, Home and End, but not past the first empty box', async () => {
		el = await fixture('<nldd-one-time-code-field value="123"></nldd-one-time-code-field>');
		el.focus();
		await el.updateComplete;
		await key('ArrowLeft');
		expect(active()).toBe(2);
		await key('Home');
		expect(active()).toBe(0);
		await key('End');
		expect(active()).toBe(3);
		await key('ArrowRight');
		expect(active()).toBe(3);
	});

	it('writes the next box when the caret stands after a character', async () => {
		el = await fixture('<nldd-one-time-code-field value="123456"></nldd-one-time-code-field>');
		await press(1);
		await beforeInput('insertText', '0');
		expect(el.value).toBe('120456');
	});

	it('refuses a character that is not part of a code', async () => {
		el = await fixture('<nldd-one-time-code-field value="123"></nldd-one-time-code-field>');
		el.focus();
		const event = await beforeInput('insertText', 'x');
		expect(event.defaultPrevented).toBe(true);
		expect(el.value).toBe('123');
	});

	it('replaces a full code with a pasted one', async () => {
		el = await fixture('<nldd-one-time-code-field value="123456"></nldd-one-time-code-field>');
		await press(3);
		const data = new DataTransfer();
		data.setData('text/plain', '987 654');
		input().dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertFromPaste', dataTransfer: data, cancelable: true }));
		await el.updateComplete;
		expect(el.value).toBe('987654');
	});

	it.each([
		['Uw code is 123456.', '', '123456'],
		['Bel 0612345678, code 123-456', '', '123456'],
		['Code 111111 is verlopen, gebruik 222222', '', '222222'],
		['Uw activatiecode is AB12CD34', 'type="alphanumeric" length="8"', 'AB12CD34'],
	])('takes the code from a pasted sentence: %s', async (text, attrs, code) => {
		el = await fixture(`<nldd-one-time-code-field ${attrs}></nldd-one-time-code-field>`);
		el.focus();
		const data = new DataTransfer();
		data.setData('text/plain', text);
		input().dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertFromPaste', dataTransfer: data, cancelable: true }));
		await el.updateComplete;
		expect(el.value).toBe(code);
	});

	it('fires complete again after a correction that leaves the code full', async () => {
		el = await fixture('<nldd-one-time-code-field length="4"></nldd-one-time-code-field>');
		const complete = vi.fn();
		el.addEventListener('complete', complete);
		await type('1234');
		await type('1294');
		expect(complete).toHaveBeenCalledTimes(2);
	});

	it('shows the caret after the last character once the code is complete', async () => {
		el = await fixture('<nldd-one-time-code-field value="939393"></nldd-one-time-code-field>');
		el.focus();
		await el.updateComplete;
		const last = boxes()[boxes().length - 1];
		expect(last.classList.contains('is-active')).toBe(true);
		expect(last.querySelector('.one-time-code-field__caret.is-after')).not.toBeNull();
		expect(last.textContent!.trim()).toBe('3');
	});
});
