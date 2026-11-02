import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDRadioButtonGroup } from './radio-button-group.js';
import type { NLDDRadioButtonField } from '../radio-button-field/radio-button-field.js';
import './radio-button-group.js';
import '../radio-button-field/radio-button-field.js';

function groupFixture(name = 'group'): string {
	return `
		<nldd-radio-button-group name="${name}">
			<nldd-radio-button-field value="1" checked label="Optie 1"></nldd-radio-button-field>
			<nldd-radio-button-field value="2" label="Optie 2"></nldd-radio-button-field>
			<nldd-radio-button-field value="3" label="Optie 3"></nldd-radio-button-field>
		</nldd-radio-button-group>
	`;
}

describe('nldd-radio-button-group', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-radio-button-group></nldd-radio-button-group>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('sets role="radiogroup" on the host element', async () => {
		el = await fixture('<nldd-radio-button-group></nldd-radio-button-group>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('radiogroup');
	});
});


/* ============================================================
   Name and disabled forwarding
   ============================================================ */

describe('nldd-radio-button-group – field sync', () => {
	let el: NLDDRadioButtonGroup;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('forwards name to all child fields', async () => {
		el = await fixture<NLDDRadioButtonGroup>(groupFixture('mygroup'));
		await waitForUpdate(el);
		const fields = Array.from(el.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field'));
		fields.forEach(f => expect(f.name).toBe('mygroup'));
	});

	it('forwards disabled to all child fields', async () => {
		el = await fixture<NLDDRadioButtonGroup>(`
			<nldd-radio-button-group name="g" disabled>
				<nldd-radio-button-field value="1" label="Optie 1"></nldd-radio-button-field>
				<nldd-radio-button-field value="2" label="Optie 2"></nldd-radio-button-field>
			</nldd-radio-button-group>
		`);
		await waitForUpdate(el);
		const fields = Array.from(el.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field'));
		fields.forEach(f => expect(f.disabled).toBe(true));
	});
});


/* ============================================================
   Keyboard navigation
   ============================================================ */

describe('nldd-radio-button-group – keyboard navigation', () => {
	let el: NLDDRadioButtonGroup;

	afterEach(() => {
		if (el) cleanup(el);
	});

	function pressKey(target: Element, key: string) {
		target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
	}

	it('ArrowDown moves to next field', async () => {
		el = await fixture<NLDDRadioButtonGroup>(groupFixture());
		await waitForUpdate(el);
		const fields = Array.from(el.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field'));

		pressKey(el, 'ArrowDown');
		await waitForUpdate(el);

		expect(fields[0].checked).toBe(false);
		expect(fields[1].checked).toBe(true);
	});

	it('ArrowUp moves to previous field', async () => {
		el = await fixture<NLDDRadioButtonGroup>(`
			<nldd-radio-button-group name="g">
				<nldd-radio-button-field value="1" label="Optie 1"></nldd-radio-button-field>
				<nldd-radio-button-field value="2" checked label="Optie 2"></nldd-radio-button-field>
				<nldd-radio-button-field value="3" label="Optie 3"></nldd-radio-button-field>
			</nldd-radio-button-group>
		`);
		await waitForUpdate(el);
		const fields = Array.from(el.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field'));

		pressKey(el, 'ArrowUp');
		await waitForUpdate(el);

		expect(fields[1].checked).toBe(false);
		expect(fields[0].checked).toBe(true);
	});

	it('ArrowDown wraps from last to first', async () => {
		el = await fixture<NLDDRadioButtonGroup>(`
			<nldd-radio-button-group name="g">
				<nldd-radio-button-field value="1" label="Optie 1"></nldd-radio-button-field>
				<nldd-radio-button-field value="2" label="Optie 2"></nldd-radio-button-field>
				<nldd-radio-button-field value="3" checked label="Optie 3"></nldd-radio-button-field>
			</nldd-radio-button-group>
		`);
		await waitForUpdate(el);
		const fields = Array.from(el.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field'));

		pressKey(el, 'ArrowDown');
		await waitForUpdate(el);

		expect(fields[2].checked).toBe(false);
		expect(fields[0].checked).toBe(true);
	});

	it('skips disabled fields during navigation', async () => {
		el = await fixture<NLDDRadioButtonGroup>(`
			<nldd-radio-button-group name="g">
				<nldd-radio-button-field value="1" checked label="Optie 1"></nldd-radio-button-field>
				<nldd-radio-button-field value="2" disabled label="Optie 2"></nldd-radio-button-field>
				<nldd-radio-button-field value="3" label="Optie 3"></nldd-radio-button-field>
			</nldd-radio-button-group>
		`);
		await waitForUpdate(el);
		const fields = Array.from(el.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field'));

		pressKey(el, 'ArrowDown');
		await waitForUpdate(el);

		expect(fields[0].checked).toBe(false);
		expect(fields[2].checked).toBe(true);
	});
});


/* ============================================================
   Accessibility
   ============================================================ */

describe('nldd-radio-button-group – accessibility', () => {
	let el: NLDDRadioButtonGroup;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('forwards accessible-labeled-by to aria-labelledby on the radiogroup element', async () => {
		el = await fixture<NLDDRadioButtonGroup>(`
			<nldd-radio-button-group accessible-labeled-by="my-label"></nldd-radio-button-group>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('aria-labelledby')).toBe('my-label');
	});

	it('does not set aria-labelledby when accessible-labeled-by is not provided', async () => {
		el = await fixture<NLDDRadioButtonGroup>(`
			<nldd-radio-button-group></nldd-radio-button-group>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('aria-labelledby')).toBeNull();
	});

	it('focus() lands on the checked option', async () => {
		el = await fixture<NLDDRadioButtonGroup>(`
			<nldd-radio-button-group name="g">
				<nldd-radio-button-field value="1" label="Optie 1"></nldd-radio-button-field>
				<nldd-radio-button-field value="2" label="Optie 2" checked></nldd-radio-button-field>
			</nldd-radio-button-group>
		`);
		await waitForUpdate(el);
		const fields = el.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field');
		await waitForUpdate(fields[1]);
		el.focus();
		expect(deepActiveElement()).toBe(fields[1]);
	});

	it('focus() falls back to the first enabled option when nothing is checked', async () => {
		el = await fixture<NLDDRadioButtonGroup>(`
			<nldd-radio-button-group name="g">
				<nldd-radio-button-field value="1" label="Optie 1" disabled></nldd-radio-button-field>
				<nldd-radio-button-field value="2" label="Optie 2"></nldd-radio-button-field>
			</nldd-radio-button-group>
		`);
		await waitForUpdate(el);
		const fields = el.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field');
		await waitForUpdate(fields[1]);
		el.focus();
		expect(deepActiveElement()).toBe(fields[1]);
	});

	it('sets accessible-label as aria-label on the group', async () => {
		el = await fixture<NLDDRadioButtonGroup>(`
			<nldd-radio-button-group name="g" accessible-label="Bezorgwijze">
				<nldd-radio-button-field value="1" label="Optie 1"></nldd-radio-button-field>
			</nldd-radio-button-group>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('radiogroup');
		expect(el.getAttribute('aria-label')).toBe('Bezorgwijze');
	});

	it('leaves an aria-label the consumer put on the group', async () => {
		el = await fixture<NLDDRadioButtonGroup>(`
			<nldd-radio-button-group name="g" aria-label="Bezorgwijze">
				<nldd-radio-button-field value="1" label="Optie 1"></nldd-radio-button-field>
			</nldd-radio-button-group>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('aria-label')).toBe('Bezorgwijze');
	});
});

describe('nldd-radio-button-group – place in the group', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	/** The field is the radio: role, state and place sit on it. */
	const radioInput = (field: Element) => field;

	/** Every field renders its radio in a shadow root of its own, so the group's
	 *  word reaches the input two updates later. */
	async function settle(group: Element): Promise<NLDDRadioButtonField[]> {
		await waitForUpdate(group as HTMLElement);
		const fields = Array.from(group.querySelectorAll<NLDDRadioButtonField>('nldd-radio-button-field'));
		for (const field of fields) await waitForUpdate(field);
		return fields;
	}

	it('tells each radio its place and keeps one stop for Tab', async () => {
		el = await fixture<NLDDRadioButtonGroup>(groupFixture());
		const fields = await settle(el);

		expect(fields.map((field) => radioInput(field).getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
		expect(fields.map((field) => radioInput(field).getAttribute('aria-setsize'))).toEqual(['3', '3', '3']);
		expect(fields.map((field) => radioInput(field).getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
	});

	it('moves the stop for Tab along with the arrow keys', async () => {
		el = await fixture<NLDDRadioButtonGroup>(groupFixture());
		const fields = await settle(el);
		fields[0].focus();

		await userEvent.keyboard('{ArrowDown}');
		await settle(el);

		expect(fields.map((field) => radioInput(field).getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
	});

	it('is one stop for Tab between the controls around it', async () => {
		el = await fixture(`<div><button id="voor">Voor</button>${groupFixture()}<button id="na">Na</button></div>`);
		const fields = await settle(el.querySelector('nldd-radio-button-group')!);
		el.querySelector<HTMLButtonElement>('#voor')!.focus();

		await userEvent.keyboard('{Tab}');
		expect(deepActiveElement()).toBe(radioInput(fields[0]));

		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(el.querySelector('#na'));
	});
});
