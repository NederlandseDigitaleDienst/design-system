import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDRadioButtonField } from './radio-button-field.js';
import './radio-button-field.js';
import '../radio-button/radio-button.js';
import '../radio-button-group/radio-button-group.js';

describe('nldd-radio-button-field', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-radio-button-field></nldd-radio-button-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a label element', async () => {
		el = await fixture('<nldd-radio-button-field label="Optie 1"></nldd-radio-button-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.radio-button-field__label')).not.toBeNull();
	});

	it('renders label text from attribute', async () => {
		el = await fixture('<nldd-radio-button-field label="Optie 1"></nldd-radio-button-field>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector('.radio-button-field__label')!;
		expect(label.textContent!.trim()).toBe('Optie 1');
	});

	it('renders nldd-radio-button in shadow DOM', async () => {
		el = await fixture('<nldd-radio-button-field></nldd-radio-button-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-radio-button')).not.toBeNull();
	});

	it('is the radio itself, announced by its label', async () => {
		el = await fixture('<nldd-radio-button-field label="Optie A"></nldd-radio-button-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('radio');
		expect(el.getAttribute('aria-label')).toBe('Optie A');
		expect(el.shadowRoot!.querySelector('nldd-radio-button')!.hasAttribute('decorative')).toBe(true);
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-radio-button-field – state', () => {
	let el: NLDDRadioButtonField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('is unchecked by default', async () => {
		el = await fixture<NLDDRadioButtonField>('<nldd-radio-button-field></nldd-radio-button-field>');
		await waitForUpdate(el);
		expect(el.checked).toBe(false);
	});

	it('is checked when checked attribute is set', async () => {
		el = await fixture<NLDDRadioButtonField>('<nldd-radio-button-field checked></nldd-radio-button-field>');
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
	});

	it('says it is disabled and leaves the tab order when disabled', async () => {
		el = await fixture<NLDDRadioButtonField>('<nldd-radio-button-field disabled></nldd-radio-button-field>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-disabled')).toBe('true');
		expect(el.getAttribute('tabindex')).toBe('-1');
		// The shape is drawn by the radio button inside, so it has to hear about
		// it: a dimmed label beside a full-strength shape reads as half disabled.
		expect(el.shadowRoot!.querySelector('nldd-radio-button')!.hasAttribute('disabled')).toBe(true);
	});

	it('submits the checked value to the surrounding form', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-radio-button-field name="status" value="active" label="Actief" checked></nldd-radio-button-field></form>');
		el = form as unknown as NLDDRadioButtonField;
		const field = form.querySelector<NLDDRadioButtonField>('nldd-radio-button-field')!;
		await waitForUpdate(field);
		expect(new FormData(form).get('status')).toBe('active');
	});

	it('submits nothing when unchecked', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-radio-button-field name="status" value="active" label="Actief"></nldd-radio-button-field></form>');
		el = form as unknown as NLDDRadioButtonField;
		const field = form.querySelector<NLDDRadioButtonField>('nldd-radio-button-field')!;
		await waitForUpdate(field);
		expect(new FormData(form).has('status')).toBe(false);
	});

	it('leaves exactly one value in the form when the group switches selection', async () => {
		const form = await fixture<HTMLFormElement>(`
			<form>
				<nldd-radio-button-group name="status">
					<nldd-radio-button-field value="a" label="A" checked></nldd-radio-button-field>
					<nldd-radio-button-field value="b" label="B"></nldd-radio-button-field>
				</nldd-radio-button-group>
			</form>
		`);
		el = form as unknown as NLDDRadioButtonField;
		const [first, second] = Array.from(form.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field'));
		// The group hands the name down to the fields on its own first update,
		// and form association reads that name — so wait for the group too.
		await waitForUpdate(form.querySelector('nldd-radio-button-group')!);
		await waitForUpdate(first!);
		await waitForUpdate(second!);
		expect(new FormData(form).getAll('status')).toEqual(['a']);

		let valuesAtChange: FormDataEntryValue[] = [];
		form.addEventListener('change', () => { valuesAtChange = new FormData(form).getAll('status'); });
		second!.shadowRoot!.querySelector<HTMLElement>('.radio-button-field__label')!.click();
		await waitForUpdate(second!);
		await waitForUpdate(first!);
		// Read during the change event: the group unchecks the sibling and the
		// form must already reflect it, not carry both values.
		expect(valuesAtChange).toEqual(['b']);
		expect(new FormData(form).getAll('status')).toEqual(['b']);
	});

	it('restores its initial state on form reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-radio-button-field name="status" value="active" label="Actief" checked></nldd-radio-button-field></form>');
		el = form as unknown as NLDDRadioButtonField;
		const field = form.querySelector<NLDDRadioButtonField>('nldd-radio-button-field')!;
		await waitForUpdate(field);
		field.checked = false;
		await waitForUpdate(field);
		form.reset();
		await waitForUpdate(field);
		expect(field.checked).toBe(true);
		expect(new FormData(form).get('status')).toBe('active');
	});

	it('focus() lands on the field itself, which is the radio', async () => {
		el = await fixture<NLDDRadioButtonField>('<nldd-radio-button-field label="Optie"></nldd-radio-button-field>');
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el);
	});
});


/* ============================================================
   Grouped by name, without a group component
   ============================================================ */

describe('nldd-radio-button-field grouped by name', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	/** Fields in one container. They group a tick after connecting, once the
	 *  ones parsed after them are there too. */
	async function fields(html: string): Promise<NLDDRadioButtonField[]> {
		el = await fixture(`<div role="radiogroup" aria-label="Kleur">${html}</div>`);
		const found = Array.from(el.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field'));
		await Promise.resolve();
		await Promise.all(found.map((field) => waitForUpdate(field)));
		return found;
	}

	const three = `
		<nldd-radio-button-field name="kleur" value="rood" checked label="Rood"></nldd-radio-button-field>
		<nldd-radio-button-field name="kleur" value="groen" label="Groen"></nldd-radio-button-field>
		<nldd-radio-button-field name="kleur" value="blauw" label="Blauw"></nldd-radio-button-field>
	`;

	it('checks one field at a time', async () => {
		const [rood, groen, blauw] = await fields(three);

		groen.click();
		await Promise.all([rood, groen, blauw].map((field) => waitForUpdate(field)));

		expect([rood.checked, groen.checked, blauw.checked]).toEqual([false, true, false]);
		expect(rood.getAttribute('aria-checked')).toBe('false');
		expect(groen.getAttribute('aria-checked')).toBe('true');
	});

	it('tells each field its place and keeps one stop for Tab', async () => {
		const [rood, groen, blauw] = await fields(three);

		expect([rood, groen, blauw].map((field) => field.getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
		expect([rood, groen, blauw].map((field) => field.getAttribute('aria-setsize'))).toEqual(['3', '3', '3']);
		expect([rood, groen, blauw].map((field) => field.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);

		groen.click();
		await Promise.all([rood, groen, blauw].map((field) => waitForUpdate(field)));
		expect([rood, groen, blauw].map((field) => field.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
	});

	it('moves through the group with the arrow keys', async () => {
		const [rood, groen, blauw] = await fields(three);

		rood.focus();
		rood.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		await Promise.all([rood, groen, blauw].map((field) => waitForUpdate(field)));

		expect([rood.checked, groen.checked, blauw.checked]).toEqual([false, true, false]);
		expect(deepActiveElement()).toBe(groen);
	});

	it('leaves the fields of another name alone', async () => {
		const [kleur, vorm] = await fields(`
			<nldd-radio-button-field name="kleur" value="rood" checked label="Rood"></nldd-radio-button-field>
			<nldd-radio-button-field name="vorm" value="rond" checked label="Rond"></nldd-radio-button-field>
		`);

		expect([kleur.checked, vorm.checked]).toEqual([true, true]);
		expect(kleur.hasAttribute('aria-setsize')).toBe(false);
		expect([kleur, vorm].map((field) => field.getAttribute('tabindex'))).toEqual(['0', '0']);
	});

	it('a field on its own is the whole group its `required` asks about', async () => {
		const [los] = await fields('<nldd-radio-button-field required checked label="Los"></nldd-radio-button-field>');
		const validity = los.shadowRoot!.querySelector('input') as HTMLInputElement;

		expect(validity.validity.valueMissing).toBe(false);

		los.checked = false;
		await waitForUpdate(los);
		expect(validity.validity.valueMissing).toBe(true);
	});

	it('takes its place from an nldd-radio-button-group when it has one', async () => {
		el = await fixture(`
			<nldd-radio-button-group name="kleur" accessible-label="Kleur">
				<nldd-radio-button-field value="rood" label="Rood" checked></nldd-radio-button-field>
				<nldd-radio-button-field value="groen" label="Groen"></nldd-radio-button-field>
			</nldd-radio-button-group>
		`);
		const found = Array.from(el.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field'));
		await Promise.resolve();
		await Promise.all(found.map((field) => waitForUpdate(field)));

		expect(found.map((field) => field.getAttribute('aria-posinset'))).toEqual(['1', '2']);
		expect(found.map((field) => field.getAttribute('tabindex'))).toEqual(['0', '-1']);
	});
});

describe('nldd-radio-button-field – color="inherit"', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('passes the color to its radio-button and draws its label in the surrounding text color', async () => {
		el = await fixture(`<div style="color: rgb(255, 255, 255);"><nldd-radio-button-field color="inherit" label="Team Uitvoering"></nldd-radio-button-field></div>`);
		const field = el.querySelector('nldd-radio-button-field') as HTMLElement;
		await waitForUpdate(field);
		expect(field.shadowRoot!.querySelector('nldd-radio-button')!.getAttribute('color')).toBe('inherit');
		expect(getComputedStyle(field.shadowRoot!.querySelector('.radio-button-field__label')!).color).toBe('rgb(255, 255, 255)');
	});
});
