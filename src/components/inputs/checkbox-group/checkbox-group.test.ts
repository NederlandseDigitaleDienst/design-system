import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './checkbox-group.js';
import '../checkbox-field/checkbox-field.js';
import type { NLDDCheckboxGroup } from './checkbox-group.js';
import type { NLDDCheckboxField } from '../checkbox-field/checkbox-field.js';

const markup = (attrs = '') => `
	<form>
		<nldd-checkbox-group name="maatregel" ${attrs}>
			<nldd-checkbox-field value="dakisolatie" label="Dakisolatie"></nldd-checkbox-field>
			<nldd-checkbox-field value="warmtepomp" label="Warmtepomp"></nldd-checkbox-field>
		</nldd-checkbox-group>
	</form>
`;

describe('nldd-checkbox-group', () => {
	let form: HTMLFormElement;
	let group: NLDDCheckboxGroup;
	let fields: NLDDCheckboxField[];

	const setup = async (attrs = '') => {
		form = await fixture<HTMLFormElement>(markup(attrs));
		group = form.querySelector('nldd-checkbox-group')!;
		fields = [...form.querySelectorAll('nldd-checkbox-field')];
		await waitForUpdate(group);
		await Promise.all(fields.map((field) => field.updateComplete));
	};

	const check = async (field: NLDDCheckboxField) => {
		field.shadowRoot!.querySelector('nldd-checkbox')!.shadowRoot!.querySelector('input')!.click();
		await waitForUpdate(field);
	};

	afterEach(() => {
		if (form) cleanup(form);
	});

	it('renders without errors', async () => {
		await setup();
		expect(group.shadowRoot).not.toBeNull();
	});

	it('is a group, and hands its name to every field', async () => {
		await setup();
		expect(group.getAttribute('role')).toBe('group');
		expect(fields.map((field) => field.name)).toEqual(['maatregel', 'maatregel']);
		await check(fields[0]);
		await check(fields[1]);
		expect(new FormData(form).getAll('maatregel')).toEqual(['dakisolatie', 'warmtepomp']);
	});

	it('asks for one checked box with required, not for all of them', async () => {
		await setup('required');
		expect(form.checkValidity()).toBe(false);
		await check(fields[1]);
		expect(form.checkValidity()).toBe(true);
		await check(fields[1]);
		expect(form.checkValidity()).toBe(false);
	});

	it('announces no single box as required', async () => {
		await setup('required');
		const input = fields[0].shadowRoot!.querySelector('nldd-checkbox')!.shadowRoot!.querySelector('input')!;
		expect(input.required).toBe(false);
		expect(group.hasAttribute('aria-required')).toBe(false);
	});

	it('disables every field and gives back only those it disabled', async () => {
		await setup();
		fields[1].disabled = true;
		group.disabled = true;
		await waitForUpdate(group);
		expect(fields.map((field) => field.disabled)).toEqual([true, true]);
		group.disabled = false;
		await waitForUpdate(group);
		expect(fields.map((field) => field.disabled)).toEqual([false, true]);
	});

	it('keeps every box a stop of its own for Tab', async () => {
		await setup();
		const tabIndexes = fields.map((field) => field.shadowRoot!.querySelector('nldd-checkbox')!.shadowRoot!.querySelector('input')!.tabIndex);
		expect(tabIndexes).toEqual([0, 0]);
	});

	it('focuses the first checked box, or else the first box', async () => {
		await setup();
		group.focus();
		expect(fields[0].matches(':focus-within')).toBe(true);
		await check(fields[1]);
		group.focus();
		expect(fields[1].matches(':focus-within')).toBe(true);
	});

	it('announces invalid on the group', async () => {
		await setup('invalid');
		expect(group.getAttribute('aria-invalid')).toBe('true');
	});
});

describe('nldd-checkbox-field nested in another one', () => {
	let form: HTMLFormElement;

	afterEach(() => {
		if (form) cleanup(form);
	});

	const setup = async (children = '') => {
		form = await fixture<HTMLFormElement>(`
			<form>
				<nldd-checkbox-group name="maatregel">
					<nldd-checkbox-field value="isolatie" label="Isolatie">
						${children || `
							<nldd-checkbox-field slot="children" value="dak" label="Dakisolatie"></nldd-checkbox-field>
							<nldd-checkbox-field slot="children" value="vloer" label="Vloerisolatie"></nldd-checkbox-field>
						`}
					</nldd-checkbox-field>
					<nldd-checkbox-field value="warmtepomp" label="Warmtepomp"></nldd-checkbox-field>
				</nldd-checkbox-group>
			</form>
		`);
		const fields = [...form.querySelectorAll('nldd-checkbox-field')] as NLDDCheckboxField[];
		await Promise.all(fields.map((field) => field.updateComplete));
		await waitForUpdate(form.querySelector('nldd-checkbox-group')!);
		return fields;
	};

	const click = async (field: NLDDCheckboxField) => {
		field.shadowRoot!.querySelector('nldd-checkbox')!.shadowRoot!.querySelector('input')!.click();
		await waitForUpdate(field);
	};

	const state = (field: NLDDCheckboxField) => (field.indeterminate ? 'mixed' : field.checked);

	it('follows the options under it: partly, all, none', async () => {
		const [parent, dak, vloer] = await setup();
		await click(dak);
		expect(state(parent)).toBe('mixed');
		await click(vloer);
		expect(state(parent)).toBe(true);
		await click(dak);
		await click(vloer);
		expect(state(parent)).toBe(false);
	});

	it('checks and unchecks every option under it', async () => {
		const [parent, dak, vloer] = await setup();
		await click(parent);
		expect([dak.checked, vloer.checked]).toEqual([true, true]);
		expect(new FormData(form).getAll('maatregel')).toEqual(['isolatie', 'dak', 'vloer']);
		await click(parent);
		expect([dak.checked, vloer.checked]).toEqual([false, false]);
	});

	it('leaves a disabled option alone, and ends up partial', async () => {
		const [parent, dak, vloer] = await setup(`
			<nldd-checkbox-field slot="children" value="dak" label="Dakisolatie"></nldd-checkbox-field>
			<nldd-checkbox-field slot="children" value="vloer" label="Vloerisolatie" disabled></nldd-checkbox-field>
		`);
		await click(parent);
		expect([dak.checked, vloer.checked]).toEqual([true, false]);
		expect(state(parent)).toBe('mixed');
		await click(parent);
		expect([dak.checked, vloer.checked]).toEqual([false, false]);
		expect(state(parent)).toBe(false);
		await click(parent);
		expect([dak.checked, vloer.checked]).toEqual([true, false]);
	});

	it('takes its first state from the options under it', async () => {
		const [parent] = await setup(`
			<nldd-checkbox-field slot="children" value="dak" label="Dakisolatie" checked></nldd-checkbox-field>
			<nldd-checkbox-field slot="children" value="vloer" label="Vloerisolatie"></nldd-checkbox-field>
		`);
		expect(state(parent)).toBe('mixed');
	});

	it('follows through more than one level', async () => {
		const [top, , deep] = await setup(`
			<nldd-checkbox-field slot="children" value="dak" label="Dakisolatie">
				<nldd-checkbox-field slot="children" value="plat" label="Plat dak"></nldd-checkbox-field>
				<nldd-checkbox-field slot="children" value="hellend" label="Hellend dak"></nldd-checkbox-field>
			</nldd-checkbox-field>
			<nldd-checkbox-field slot="children" value="vloer" label="Vloerisolatie"></nldd-checkbox-field>
		`);
		await click(deep);
		expect(state(top)).toBe('mixed');
		await click(top);
		const all = [...form.querySelectorAll('nldd-checkbox-field')] as NLDDCheckboxField[];
		expect(all.slice(0, 5).map((field) => field.checked)).toEqual([true, true, true, true, true]);
	});

	it('makes the options under it a group named after it, below the label', async () => {
		const [parent, dak, vloer] = await setup();
		const wrapper = parent.shadowRoot!.querySelector('.checkbox-field__children')!;
		expect(wrapper.getAttribute('role')).toBe('group');
		const label = parent.shadowRoot!.getElementById(wrapper.getAttribute('aria-labelledby')!)!;
		expect(label.textContent!.trim()).toBe('Isolatie');
		expect(wrapper.querySelector<HTMLSlotElement>('slot[name="children"]')!.assignedElements()).toEqual([dak, vloer]);
		expect(dak.shadowRoot!.querySelector('.checkbox-field__children')!.hasAttribute('role')).toBe(false);
	});

	it('does not toggle the option above on a click in the options under it', async () => {
		const [parent, dak] = await setup();
		dak.shadowRoot!.querySelector<HTMLElement>('.checkbox-field__label')!.click();
		await waitForUpdate(parent);
		expect(dak.checked).toBe(true);
		expect(state(parent)).toBe('mixed');
	});

	it('asks of a required group for one checked box anywhere in it', async () => {
		const [, dak] = await setup();
		const group = form.querySelector('nldd-checkbox-group')!;
		group.required = true;
		await waitForUpdate(group);
		expect(form.checkValidity()).toBe(false);
		await click(dak);
		expect(form.checkValidity()).toBe(true);
	});
});

describe('nldd-checkbox-group, changes it did not see', () => {
	let form: HTMLFormElement;

	afterEach(() => {
		if (form) cleanup(form);
	});

	const settle = async () => {
		const fields = [...form.querySelectorAll<NLDDCheckboxField>('nldd-checkbox-field')];
		await Promise.all(fields.map((field) => waitForUpdate(field)));
		await Promise.all(fields.map((field) => field.updateComplete));
	};

	it('answers required again when the app sets checked, and after a form reset', async () => {
		form = await fixture<HTMLFormElement>(`
			<form>
				<nldd-checkbox-group name="maatregel" required>
					<nldd-checkbox-field value="dak" label="Dakisolatie"></nldd-checkbox-field>
					<nldd-checkbox-field value="vloer" label="Vloerisolatie"></nldd-checkbox-field>
				</nldd-checkbox-group>
			</form>
		`);
		await settle();
		const [dak] = form.querySelectorAll<NLDDCheckboxField>('nldd-checkbox-field');
		expect(form.checkValidity()).toBe(false);
		dak.checked = true;
		await settle();
		expect(form.checkValidity()).toBe(true);
		form.reset();
		await settle();
		expect(dak.checked).toBe(false);
		expect(form.checkValidity()).toBe(false);
	});

	it('hands its name and required to an option nested after the first render', async () => {
		form = await fixture<HTMLFormElement>(`
			<form>
				<nldd-checkbox-group name="maatregel" required>
					<nldd-checkbox-field value="isolatie" label="Isolatie"></nldd-checkbox-field>
				</nldd-checkbox-group>
			</form>
		`);
		await settle();
		const parent = form.querySelector<NLDDCheckboxField>('nldd-checkbox-field')!;
		parent.insertAdjacentHTML('beforeend', '<nldd-checkbox-field slot="children" value="dak" label="Dakisolatie"></nldd-checkbox-field>');
		await settle();
		const nested = parent.querySelector<NLDDCheckboxField>('nldd-checkbox-field')!;
		expect(nested.name).toBe('maatregel');
		expect(nested.required).toBe(true);
	});
});

describe('nldd-checkbox-field with a disabled option in between', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('leaves the disabled option and everything under it alone', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-checkbox-group name="maatregel">
				<nldd-checkbox-field value="isolatie" label="Isolatie">
					<nldd-checkbox-field slot="children" value="dak" label="Dakisolatie" disabled>
						<nldd-checkbox-field slot="children" value="plat" label="Plat dak"></nldd-checkbox-field>
					</nldd-checkbox-field>
					<nldd-checkbox-field slot="children" value="vloer" label="Vloerisolatie"></nldd-checkbox-field>
				</nldd-checkbox-field>
			</nldd-checkbox-group>
		`);
		const [top, dak, plat, vloer] = [...el.querySelectorAll<NLDDCheckboxField>('nldd-checkbox-field')];
		await Promise.all([top, dak, plat, vloer].map((field) => field.updateComplete));
		top.shadowRoot!.querySelector('nldd-checkbox')!.shadowRoot!.querySelector('input')!.click();
		await Promise.all([top, dak, plat, vloer].map((field) => waitForUpdate(field)));
		expect([dak.checked, plat.checked, vloer.checked]).toEqual([false, false, true]);
		expect(top.indeterminate).toBe(true);
	});
});
