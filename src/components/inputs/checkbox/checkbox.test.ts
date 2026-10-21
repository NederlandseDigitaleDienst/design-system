import { describe, it, expect, afterEach } from 'vitest';
import { loadTokens } from '../../../test-tokens.js';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDCheckbox } from './checkbox.js';
import './checkbox.js';

describe('nldd-checkbox', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-checkbox></nldd-checkbox>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a native checkbox input', async () => {
		el = await fixture('<nldd-checkbox></nldd-checkbox>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input[type="checkbox"]')).not.toBeNull();
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-checkbox – state', () => {
	let el: NLDDCheckbox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('is unchecked by default', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.checked).toBe(false);
	});

	it('is checked when checked attribute is set', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox checked></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.checked).toBe(true);
	});

	it('is indeterminate when indeterminate attribute is set', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox indeterminate></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.indeterminate).toBe(true);
	});

	it('is disabled when disabled attribute is set', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox disabled></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.disabled).toBe(true);
	});

	it('forwards value to the native input', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox value="agree"></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.value).toBe('agree');
	});

	it('forwards name to the native input', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox name="terms"></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.name).toBe('terms');
	});
});


/* ============================================================
   Change event
   ============================================================ */

describe('nldd-checkbox – change event', () => {
	let el: NLDDCheckbox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('updates checked property when native input changes', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		input.checked = true;
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
	});

	it('dispatches a change event with checked and value detail', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox value="agree"></nldd-checkbox>');
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => {
			detail = e.detail;
		}) as EventListener);

		const input = el.shadowRoot!.querySelector('input')!;
		input.checked = true;
		input.dispatchEvent(new Event('change', { bubbles: true }));

		expect(detail).toBeDefined();
		expect(detail.checked).toBe(true);
		expect(detail.value).toBe('agree');
	});

	it('updates indeterminate property when native input changes', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox indeterminate></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		input.indeterminate = false;
		input.checked = true;
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(el);
		expect(el.indeterminate).toBe(false);
		expect(el.checked).toBe(true);
	});
});



/* ============================================================
   Keyboard interaction
   ============================================================ */

describe('nldd-checkbox – keyboard interaction', () => {
	let el: NLDDCheckbox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('toggles checked state when Space is pressed on the native input', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		input.focus();
		input.checked = true;
		input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
	});

	it('does not toggle when disabled and Space is pressed', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox disabled></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		await waitForUpdate(el);
		expect(el.checked).toBe(false);
	});
});

describe('nldd-checkbox – accessibility', () => {
	let el: NLDDCheckbox | HTMLFormElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('forwards aria-label to the native input', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox accessible-label="Accepteer voorwaarden"></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('aria-label')).toBe('Accepteer voorwaarden');
	});

	it('focus lands on the native input', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox></nldd-checkbox>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		input.focus();
		expect(input.matches(':focus')).toBe(true);
	});

	it('participates in FormData when checked', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-checkbox name="tos" value="agreed" checked></nldd-checkbox></form>');
		el = form;
		const cb = form.querySelector('nldd-checkbox')!;
		await waitForUpdate(cb);
		expect(new FormData(form).get('tos')).toBe('agreed');
	});

	it('is omitted from FormData when unchecked', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-checkbox name="tos" value="agreed"></nldd-checkbox></form>');
		el = form;
		const cb = form.querySelector('nldd-checkbox')!;
		await waitForUpdate(cb);
		expect(new FormData(form).has('tos')).toBe(false);
	});

	it('resets to the HTML-declared initial checked state when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-checkbox name="tos" value="agreed" checked></nldd-checkbox></form>');
		el = form;
		const cb = form.querySelector<NLDDCheckbox>('nldd-checkbox')!;
		await waitForUpdate(cb);
		cb.checked = false;
		await waitForUpdate(cb);
		form.reset();
		expect(cb.checked).toBe(true);
	});
	// Decorative: the shape without a control, for a row that is the control.
	describe('decorative', () => {
		it('rendert geen input', async () => {
			el = await fixture(`<nldd-checkbox decorative checked></nldd-checkbox>`);
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.checkbox__input')).toBeNull();
			expect(el.shadowRoot!.querySelector('input')).toBeNull();
		});

		it('is niet focusbaar', async () => {
			el = await fixture(`<nldd-checkbox decorative></nldd-checkbox>`);
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('[tabindex]')).toBeNull();
		});
	});


	it('focus() lands on the inner native input', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox label="Optie"></nldd-checkbox>');
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('.checkbox__input'));
	});
});

describe('nldd-checkbox no-tab', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('takes the input out of the tab order', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox label="X" no-tab></nldd-checkbox>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.checkbox__input')!.getAttribute('tabindex')).toBe('-1');
	});

	it('is in the tab order by default (no tabindex attribute)', async () => {
		el = await fixture<NLDDCheckbox>('<nldd-checkbox label="X"></nldd-checkbox>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.checkbox__input')!.hasAttribute('tabindex')).toBe(false);
	});
});

describe('nldd-checkbox – color="inherit"', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('fills a checked box with the surrounding text color, and draws the mark in the surface color', async () => {
		el = await fixture(`
			<div style="color: rgb(255, 255, 255); --context-parent-background-color: rgb(24, 69, 118);">
				<nldd-checkbox color="inherit" checked accessible-label="Afgerond"></nldd-checkbox>
			</div>`);
		const checkbox = el.querySelector('nldd-checkbox') as NLDDCheckbox;
		await waitForUpdate(checkbox);
		const box = checkbox.shadowRoot!.querySelector('.checkbox__box') as HTMLElement;
		const icon = checkbox.shadowRoot!.querySelector('.checkbox__check-icon') as Element;
		expect(getComputedStyle(box).backgroundColor).toBe('rgb(255, 255, 255)');
		expect(getComputedStyle(icon).color).toBe('rgb(24, 69, 118)');
	});

	// Without a surface color the mark is white or black, whichever reads on
	// the text color the box is filled with.
	it.each([
		['white', 'rgb(255, 255, 255)', [0, 0, 0]],
		['dark blue', 'rgb(24, 69, 118)', [255, 255, 255]],
	])('draws the mark in black or white on %s text when no surface color is set', async (_name, text, mark) => {
		const unloadTokens = loadTokens();
		try {
			el = await fixture(`
				<div style="color: ${text};">
					<nldd-checkbox color="inherit" checked accessible-label="Afgerond"></nldd-checkbox>
				</div>`);
			const checkbox = el.querySelector('nldd-checkbox') as NLDDCheckbox;
			await waitForUpdate(checkbox);
			const icon = checkbox.shadowRoot!.querySelector('.checkbox__check-icon') as Element;
			expect(toRgb(getComputedStyle(icon).color)).toEqual(mark);
		} finally {
			unloadTokens();
		}
	});
});

// The computed color can come back as color(xyz …); a canvas reads it as RGB.
function toRgb(color: string): number[] {
	const context = document.createElement('canvas').getContext('2d')!;
	context.fillStyle = color;
	context.fillRect(0, 0, 1, 1);
	return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
}
