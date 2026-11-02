import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDSwitch } from './switch.js';
import './switch.js';

describe('nldd-switch', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-switch accessible-label="Test"></nldd-switch>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a native checkbox input', async () => {
		el = await fixture('<nldd-switch accessible-label="Test"></nldd-switch>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input[type="checkbox"]')).not.toBeNull();
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-switch – state', () => {
	let el: NLDDSwitch;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('is unchecked by default', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test"></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.checked).toBe(false);
	});

	it('is checked when checked attribute is set', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test" checked></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.checked).toBe(true);
	});

	it('is disabled when disabled attribute is set', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test" disabled></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.disabled).toBe(true);
	});

	it('has role="switch" on the native input', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test"></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('role')).toBe('switch');
	});

	it('forwards accessible-label as aria-label on the native input', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Meldingen aan"></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('aria-label')).toBe('Meldingen aan');
	});
});


/* ============================================================
   Change event
   ============================================================ */

describe('nldd-switch – change event', () => {
	let el: NLDDSwitch;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('updates checked property when native input changes', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test"></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		input.checked = true;
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
	});

	it('dispatches a change event with checked detail', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test"></nldd-switch>');
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
		expect(detail.value).toBe('on');
	});

	it('does not toggle when disabled', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test" disabled></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(el);
		expect(el.checked).toBe(false);
	});
});


/* ============================================================
   Toggle
   ============================================================ */

describe('nldd-switch – toggle', () => {
	let el: NLDDSwitch;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('toggle() flips checked and dispatches change', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test"></nldd-switch>');
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => {
			detail = e.detail;
		}) as EventListener);

		el.toggle();
		expect(el.checked).toBe(true);
		expect(detail?.checked).toBe(true);
	});

	it('toggle() does nothing when disabled', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test" disabled></nldd-switch>');
		await waitForUpdate(el);
		el.toggle();
		expect(el.checked).toBe(false);
	});

	it('toggle() does not dispatch change when disabled', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test" disabled></nldd-switch>');
		await waitForUpdate(el);
		let changeFired = false;
		el.addEventListener('change', () => { changeFired = true; });
		el.toggle();
		expect(changeFired).toBe(false);
	});
});


/* ============================================================
   Swipe gesture
   ============================================================ */

describe('nldd-switch – swipe gesture', () => {
	let el: NLDDSwitch;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	function swipe(target: HTMLElement, startX: number, endX: number) {
		target.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, bubbles: true }));
		target.dispatchEvent(new PointerEvent('pointermove', { clientX: endX, bubbles: true }));
		target.dispatchEvent(new PointerEvent('pointerup', { clientX: endX, bubbles: true }));
	}

	it('swipe right turns on when unchecked and dispatches change', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test"></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		swipe(input, 0, 20);
		expect(el.checked).toBe(true);
		expect(detail?.checked).toBe(true);
	});

	it('swipe left turns off when checked and dispatches change', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test" checked></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		swipe(input, 20, 0);
		expect(el.checked).toBe(false);
		expect(detail?.checked).toBe(false);
	});

	it('swipe right does nothing when already checked', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test" checked></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		let changeFired = false;
		el.addEventListener('change', () => { changeFired = true; });
		swipe(input, 0, 20);
		expect(el.checked).toBe(true);
		expect(changeFired).toBe(false);
	});

	it('small movement does not trigger swipe', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test"></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		swipe(input, 0, 5);
		expect(el.checked).toBe(false);
	});

	it('swipe does nothing when disabled', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test" disabled></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		swipe(input, 0, 20);
		expect(el.checked).toBe(false);
	});

	// Note: relies on JSDOM computing direction from the dir attribute.
	// Wraps in a dir="rtl" ancestor to match real-world usage (dir on <html> or wrapper).
	it('swipe left turns on in RTL mode', async () => {
		el = await fixture<NLDDSwitch>('<div dir="rtl"><nldd-switch accessible-label="Test"></nldd-switch></div>' as any);
		el = el.querySelector('nldd-switch') as NLDDSwitch;
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		swipe(input, 20, 0);
		expect(el.checked).toBe(true);
	});
});


/* ============================================================
   Keyboard interaction
   ============================================================ */

describe('nldd-switch – disabled keyboard guard', () => {
	let el: NLDDSwitch;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('does not toggle when disabled and Space is pressed', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test" disabled></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		await waitForUpdate(el);
		expect(el.checked).toBe(false);
	});
});


/* ============================================================
   Accessibility
   ============================================================ */

describe('nldd-switch – accessibility', () => {
	let el: NLDDSwitch | HTMLFormElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('focus lands on the native input', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Test"></nldd-switch>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		input.focus();
		expect(input.matches(':focus')).toBe(true);
	});

	it('participates in FormData when checked', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-switch name="alerts" value="on" accessible-label="Meldingen" checked></nldd-switch></form>');
		el = form;
		const sw = form.querySelector('nldd-switch')!;
		await waitForUpdate(sw);
		expect(new FormData(form).get('alerts')).toBe('on');
	});

	it('is omitted from FormData when unchecked', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-switch name="alerts" value="on" accessible-label="Meldingen"></nldd-switch></form>');
		el = form;
		const sw = form.querySelector('nldd-switch')!;
		await waitForUpdate(sw);
		expect(new FormData(form).has('alerts')).toBe(false);
	});

	it('resets to the HTML-declared initial checked state when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-switch name="alerts" value="on" accessible-label="Meldingen" checked></nldd-switch></form>');
		el = form;
		const sw = form.querySelector<NLDDSwitch>('nldd-switch')!;
		await waitForUpdate(sw);
		sw.checked = false;
		await waitForUpdate(sw);
		form.reset();
		expect(sw.checked).toBe(true);
	});

	it('focus() delegates to the inner input', async () => {
		const el = await fixture<NLDDSwitch>('<nldd-switch accessible-label="Aan/uit"></nldd-switch>');
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('.switch__input'));
		cleanup(el);
	});
});

describe('nldd-switch no-tab', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('takes the input out of the tab order', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch label="X" no-tab></nldd-switch>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.switch__input')!.getAttribute('tabindex')).toBe('-1');
	});

	it('is in the tab order by default (no tabindex attribute)', async () => {
		el = await fixture<NLDDSwitch>('<nldd-switch label="X"></nldd-switch>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.switch__input')!.hasAttribute('tabindex')).toBe(false);
	});
});

describe('nldd-switch – color="inherit"', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('fills a checked track with the surrounding text color, and the thumb with the surface color', async () => {
		el = await fixture(`
			<div style="color: rgb(255, 255, 255); --context-parent-background-color: rgb(24, 69, 118);">
				<nldd-switch color="inherit" checked accessible-label="Meldingen"></nldd-switch>
			</div>`);
		const control = el.querySelector('nldd-switch') as HTMLElement;
		await waitForUpdate(control);
		const track = control.shadowRoot!.querySelector('.switch__track') as HTMLElement;
		const thumb = control.shadowRoot!.querySelector('.switch__thumb') as HTMLElement;
		expect(getComputedStyle(track).backgroundColor).toBe('rgb(255, 255, 255)');
		expect(getComputedStyle(thumb).backgroundColor).toBe('rgb(24, 69, 118)');
	});
});
