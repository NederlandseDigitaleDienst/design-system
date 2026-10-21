import { describe, it, expect, afterEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDRadioButton } from './radio-button.js';
import './radio-button.js';
import { loadTokens } from '../../../test-tokens.js';

describe('nldd-radio-button', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-radio-button></nldd-radio-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('is the radio itself, so a group of them can be counted', async () => {
		el = await fixture('<nldd-radio-button></nldd-radio-button>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('radio');
		expect(el.getAttribute('aria-checked')).toBe('false');
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-radio-button – state', () => {
	let el: NLDDRadioButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('is unchecked by default', async () => {
		el = await fixture<NLDDRadioButton>('<nldd-radio-button></nldd-radio-button>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-checked')).toBe('false');
	});

	it('is checked when checked attribute is set', async () => {
		el = await fixture<NLDDRadioButton>('<nldd-radio-button checked></nldd-radio-button>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-checked')).toBe('true');
	});

	it('says it is disabled and leaves the tab order when disabled', async () => {
		el = await fixture<NLDDRadioButton>('<nldd-radio-button disabled></nldd-radio-button>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-disabled')).toBe('true');
		expect(el.getAttribute('tabindex')).toBe('-1');
	});
});


/* ============================================================
   Change event
   ============================================================ */

describe('nldd-radio-button – change event', () => {
	let el: NLDDRadioButton | HTMLFormElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('checks itself when it is clicked', async () => {
		el = await fixture<NLDDRadioButton>('<nldd-radio-button></nldd-radio-button>');
		await waitForUpdate(el);
		(el as NLDDRadioButton).click();
		await waitForUpdate(el);
		expect((el as NLDDRadioButton).checked).toBe(true);
		expect(el.getAttribute('aria-checked')).toBe('true');
	});

	it('checks itself when the space bar is pressed', async () => {
		el = await fixture<NLDDRadioButton>('<nldd-radio-button accessible-label="Optie"></nldd-radio-button>');
		await waitForUpdate(el);
		(el as NLDDRadioButton).focus();

		await userEvent.keyboard('{ }');
		await waitForUpdate(el);

		expect((el as NLDDRadioButton).checked).toBe(true);
	});

	it('dispatches a change event with checked, value and name detail', async () => {
		el = await fixture<NLDDRadioButton>('<nldd-radio-button name="group1" value="option-a"></nldd-radio-button>');
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => {
			detail = e.detail;
		}) as EventListener);

		(el as NLDDRadioButton).click();

		expect(detail).toBeDefined();
		expect(detail.checked).toBe(true);
		expect(detail.value).toBe('option-a');
		expect(detail.name).toBe('group1');
	});

	it('participates in FormData when checked', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-radio-button name="opt" value="a" checked></nldd-radio-button></form>');
		el = form;
		const rb = form.querySelector('nldd-radio-button')!;
		await waitForUpdate(rb);
		expect(new FormData(form).get('opt')).toBe('a');
	});

	it('is omitted from FormData when unchecked', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-radio-button name="opt" value="a"></nldd-radio-button></form>');
		el = form;
		const rb = form.querySelector('nldd-radio-button')!;
		await waitForUpdate(rb);
		expect(new FormData(form).has('opt')).toBe(false);
	});

	it('resets to the HTML-declared initial checked state when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-radio-button name="opt" value="a" checked></nldd-radio-button></form>');
		el = form;
		const rb = form.querySelector<NLDDRadioButton>('nldd-radio-button')!;
		await waitForUpdate(rb);
		rb.checked = false;
		await waitForUpdate(rb);
		form.reset();
		expect(rb.checked).toBe(true);
	});
	// Decorative: the shape without a control, for a row that is the control.
	describe('decorative', () => {
		it('rendert geen input', async () => {
			el = await fixture(`<nldd-radio-button decorative checked></nldd-radio-button>`);
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.radio-button__input')).toBeNull();
			expect(el.shadowRoot!.querySelector('input')).toBeNull();
		});

		it('is niet focusbaar', async () => {
			el = await fixture(`<nldd-radio-button decorative></nldd-radio-button>`);
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('[tabindex]')).toBeNull();
		});
	});


	it('focus() lands on the radio itself', async () => {
		el = await fixture<NLDDRadioButton>('<nldd-radio-button label="Optie"></nldd-radio-button>');
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el);
	});
});

describe('nldd-radio-button no-tab', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('takes the radio out of the tab order', async () => {
		el = await fixture<NLDDRadioButton>('<nldd-radio-button label="X" no-tab></nldd-radio-button>');
		await waitForUpdate(el);
		expect(el.getAttribute('tabindex')).toBe('-1');
	});

	it('is in the tab order by default', async () => {
		el = await fixture<NLDDRadioButton>('<nldd-radio-button label="X"></nldd-radio-button>');
		await waitForUpdate(el);
		expect(el.getAttribute('tabindex')).toBe('0');
	});
});

describe('nldd-radio-button grouped by name', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	/** The radio is the element itself: role, state and place sit on it. */
	const input = (radio: Element) => radio;

	/** Radios in one container. They group a tick after connecting, once the
	 *  ones parsed after them are there too. */
	async function radios(html: string): Promise<NLDDRadioButton[]> {
		el = await fixture(`<div>${html}</div>`);
		const found = Array.from(el.querySelectorAll<NLDDRadioButton>('nldd-radio-button'));
		await Promise.resolve();
		await Promise.all(found.map((radio) => waitForUpdate(radio)));
		return found;
	}

	const three = `
		<nldd-radio-button name="kleur" value="rood" checked accessible-label="Rood"></nldd-radio-button>
		<nldd-radio-button name="kleur" value="groen" accessible-label="Groen"></nldd-radio-button>
		<nldd-radio-button name="kleur" value="blauw" accessible-label="Blauw"></nldd-radio-button>
	`;

	it('checks one radio at a time', async () => {
		const [rood, groen, blauw] = await radios(three);

		// The click the browser does for the user: the tokens that give the radio
		// its size are not loaded here, so there is nothing to point at.
		groen.click();
		await Promise.all([rood, groen, blauw].map((radio) => waitForUpdate(radio)));

		expect([rood.checked, groen.checked, blauw.checked]).toEqual([false, true, false]);
		expect(rood.getAttribute('aria-checked')).toBe('false');
	});

	it('unchecks the others when one is checked from script', async () => {
		const [rood, , blauw] = await radios(three);

		blauw.checked = true;
		await waitForUpdate(blauw);

		expect(rood.checked).toBe(false);
	});

	it('tells each radio its place in the group', async () => {
		const found = await radios(three);

		expect(found.map((radio) => input(radio).getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
		expect(found.map((radio) => input(radio).getAttribute('aria-setsize'))).toEqual(['3', '3', '3']);
	});

	it('puts only the checked radio in the tab order, and moves it along', async () => {
		const [rood, groen, blauw] = await radios(three);
		expect([rood, groen, blauw].map((radio) => input(radio).getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);

		blauw.checked = true;
		await Promise.all([rood, groen, blauw].map((radio) => waitForUpdate(radio)));

		expect([rood, groen, blauw].map((radio) => input(radio).getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
	});

	it('puts the first enabled radio in the tab order when none is checked', async () => {
		const found = await radios(`
			<nldd-radio-button name="maat" value="s" disabled></nldd-radio-button>
			<nldd-radio-button name="maat" value="m"></nldd-radio-button>
			<nldd-radio-button name="maat" value="l"></nldd-radio-button>
		`);

		expect(found.map((radio) => input(radio).getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
	});

	it('moves and checks with the arrow keys, past a disabled radio and around', async () => {
		const found = await radios(`
			<nldd-radio-button name="maat" value="s" checked></nldd-radio-button>
			<nldd-radio-button name="maat" value="m" disabled></nldd-radio-button>
			<nldd-radio-button name="maat" value="l"></nldd-radio-button>
		`);
		const [s, , l] = found;
		const changed = vi.fn();
		el.addEventListener('change', changed);
		s.focus();

		await userEvent.keyboard('{ArrowDown}');
		expect(l.checked).toBe(true);
		expect(s.checked).toBe(false);
		expect(deepActiveElement()).toBe(input(l));
		expect(changed).toHaveBeenCalled();

		await userEvent.keyboard('{ArrowDown}');
		expect(s.checked).toBe(true);
		expect(deepActiveElement()).toBe(input(s));
	});

	it('leaves a radio with a name of its own as the browser has it', async () => {
		const [alone] = await radios('<nldd-radio-button name="alleen" value="1"></nldd-radio-button>');

		expect(input(alone).hasAttribute('aria-setsize')).toBe(false);
		expect(input(alone).getAttribute('tabindex')).toBe('0');
	});

	it('keeps radios in different forms apart', async () => {
		const found = await radios(`
			<form><nldd-radio-button name="keuze" value="a" checked></nldd-radio-button></form>
			<form><nldd-radio-button name="keuze" value="b" checked></nldd-radio-button></form>
		`);

		expect(found.map((radio) => radio.checked)).toEqual([true, true]);
		expect(found.map((radio) => input(radio).hasAttribute('aria-setsize'))).toEqual([false, false]);
	});

	it('recounts the group when a radio leaves it or is renamed', async () => {
		const [rood, groen, blauw] = await radios(three);

		blauw.remove();
		await Promise.all([rood, groen].map((radio) => waitForUpdate(radio)));
		expect(input(rood).getAttribute('aria-setsize')).toBe('2');

		groen.name = 'ander';
		await Promise.all([rood, groen].map((radio) => waitForUpdate(radio)));
		expect(input(rood).hasAttribute('aria-setsize')).toBe(false);
		expect(input(groen).hasAttribute('aria-setsize')).toBe(false);
	});

	it('leaves Tab and the arrow keys to a roving container that set no-tab', async () => {
		const [rood, groen] = await radios(`
			<nldd-radio-button name="rij" value="1" checked no-tab></nldd-radio-button>
			<nldd-radio-button name="rij" value="2" no-tab></nldd-radio-button>
		`);
		expect([rood, groen].map((radio) => input(radio).getAttribute('tabindex'))).toEqual(['-1', '-1']);
		expect(input(rood).getAttribute('aria-setsize')).toBe('2');

		rood.focus();
		await userEvent.keyboard('{ArrowDown}');

		expect(rood.checked).toBe(true);
		expect(groen.checked).toBe(false);
	});

	it('a radio on its own is the whole group its `required` asks about', async () => {
		const [los] = await radios('<nldd-radio-button required checked accessible-label="Los"></nldd-radio-button>');
		const validity = los.shadowRoot!.querySelector('input') as HTMLInputElement;

		expect(validity.validity.valueMissing).toBe(false);
		expect(los.internals.validity.valid).toBe(true);

		los.checked = false;
		await waitForUpdate(los);
		expect(validity.validity.valueMissing).toBe(true);
	});
});

describe('nldd-radio-button – color="inherit"', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('fills a checked radio with the surrounding text color, and rings the dot in the surface color', async () => {
		const unloadTokens = loadTokens();
		el = await fixture(`
			<div style="color: rgb(255, 255, 255); --context-parent-background-color: rgb(24, 69, 118);">
				<nldd-radio-button color="inherit" checked decorative></nldd-radio-button>
			</div>`);
		const control = el.querySelector('nldd-radio-button') as HTMLElement;
		await waitForUpdate(control);
		const outer = control.shadowRoot!.querySelector('.radio-button__outer-shape') as HTMLElement;
		const inner = control.shadowRoot!.querySelector('.radio-button__inner-shape') as HTMLElement;
		expect(getComputedStyle(outer).backgroundColor).toBe('rgb(255, 255, 255)');
		expect(getComputedStyle(inner).borderTopColor).toBe('rgb(24, 69, 118)');
		unloadTokens();
	});
});
