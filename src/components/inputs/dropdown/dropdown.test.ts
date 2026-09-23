import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDDropdown } from './dropdown.js';
import './dropdown.js';

function selectFixture(): string {
	return `
		<nldd-dropdown>
			<select name="country" aria-label="Land">
				<option value="" disabled selected>Selecteer een land</option>
				<option value="nl">Nederland</option>
				<option value="be">België</option>
			</select>
		</nldd-dropdown>
	`;
}

describe('nldd-dropdown', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-dropdown></nldd-dropdown>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders nldd-icon for the chevron', async () => {
		el = await fixture('<nldd-dropdown></nldd-dropdown>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon')).not.toBeNull();
	});
});


/* ============================================================
   Validation
   ============================================================ */

describe('nldd-dropdown – validation', () => {
	let el: NLDDDropdown;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders no validation icon by default', async () => {
		el = await fixture<NLDDDropdown>('<nldd-dropdown></nldd-dropdown>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.dropdown__validation-icon-area')).toBeNull();
	});

	it('renders a valid icon when valid', async () => {
		el = await fixture<NLDDDropdown>('<nldd-dropdown valid></nldd-dropdown>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.dropdown__validation-icon')!;
		expect(icon.getAttribute('icon')).toBe('valid');
	});

	it('renders an invalid icon when invalid', async () => {
		el = await fixture<NLDDDropdown>('<nldd-dropdown invalid></nldd-dropdown>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.dropdown__validation-icon')!;
		expect(icon.getAttribute('icon')).toBe('invalid');
	});

	it('forwards aria-invalid to the slotted select', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown invalid>
				<select aria-label="Land"><option value="nl">Nederland</option></select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		expect(el.querySelector('select')!.getAttribute('aria-invalid')).toBe('true');
	});

	it('removes aria-invalid when invalid is cleared', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown invalid>
				<select aria-label="Land"><option value="nl">Nederland</option></select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		el.invalid = false;
		await waitForUpdate(el);
		expect(el.querySelector('select')!.hasAttribute('aria-invalid')).toBe(false);
	});
});


/* ============================================================
   Size
   ============================================================ */

describe('nldd-dropdown – size', () => {
	let el: NLDDDropdown;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('defaults size to md', async () => {
		el = await fixture<NLDDDropdown>('<nldd-dropdown></nldd-dropdown>');
		await waitForUpdate(el);
		expect(el.size).toBe('md');
	});

	it('reflects size="xs" to host', async () => {
		el = await fixture<NLDDDropdown>('<nldd-dropdown size="xs"></nldd-dropdown>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('xs');
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-dropdown – state', () => {
	let el: NLDDDropdown;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('forwards disabled to slotted select', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown disabled>
				<select name="country" aria-label="Land">
					<option value="nl">Nederland</option>
				</select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		const select = el.querySelector('select')!;
		expect(select.disabled).toBe(true);
	});

	it('displays the selected option text', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown>
				<select name="country" aria-label="Land">
					<option value="nl" selected>Nederland</option>
					<option value="be">België</option>
				</select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		expect(el._displayValue).toBe('Nederland');
	});

	it('supports a placeholder option', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown>
				<select name="country" aria-label="Land">
					<option value="" disabled selected>Selecteer een land</option>
					<option value="nl">Nederland</option>
				</select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		expect(el._displayValue).toBe('Selecteer een land');
	});

	it('re-enables slotted select when disabled is removed', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown disabled>
				<select name="country" aria-label="Land">
					<option value="nl">Nederland</option>
				</select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		el.disabled = false;
		await waitForUpdate(el);
		const select = el.querySelector('select')!;
		expect(select.disabled).toBe(false);
	});

	it('reflects expanded when slotted select dispatches toggle (open)', async () => {
		el = await fixture<NLDDDropdown>(selectFixture());
		await waitForUpdate(el);
		const select = el.querySelector('select')!;
		select.dispatchEvent(new ToggleEvent('toggle', { oldState: 'closed', newState: 'open' }));
		await waitForUpdate(el);
		expect(el.expanded).toBe(true);
		expect(el.hasAttribute('expanded')).toBe(true);
	});

	it('clears expanded when slotted select dispatches toggle (closed)', async () => {
		el = await fixture<NLDDDropdown>(selectFixture());
		await waitForUpdate(el);
		const select = el.querySelector('select')!;
		select.dispatchEvent(new ToggleEvent('toggle', { oldState: 'closed', newState: 'open' }));
		await waitForUpdate(el);
		select.dispatchEvent(new ToggleEvent('toggle', { oldState: 'open', newState: 'closed' }));
		await waitForUpdate(el);
		expect(el.expanded).toBe(false);
	});

	it('clears expanded when slotted select blurs', async () => {
		el = await fixture<NLDDDropdown>(selectFixture());
		await waitForUpdate(el);
		const select = el.querySelector('select')!;
		el.expanded = true;
		await waitForUpdate(el);
		select.dispatchEvent(new FocusEvent('blur'));
		await waitForUpdate(el);
		expect(el.expanded).toBe(false);
	});
});


/* ============================================================
   Accessibility
   ============================================================ */

describe('nldd-dropdown – accessibility', () => {
	let el: NLDDDropdown;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('warns when slotted select has no accessible name', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown>
				<select name="country">
					<option value="nl">Nederland</option>
				</select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('accessible name')
		);
	});

	it('does not warn when slotted select has aria-label', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown>
				<select name="country" aria-label="Land">
					<option value="nl">Nederland</option>
				</select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		expect(warnSpy).not.toHaveBeenCalled();
	});
});


/* ============================================================
   Change event
   ============================================================ */

describe('nldd-dropdown – change event', () => {
	let el: NLDDDropdown;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('updates displayValue when slotted select changes', async () => {
		el = await fixture<NLDDDropdown>(selectFixture());
		await waitForUpdate(el);
		const select = el.querySelector('select')!;
		select.value = 'be';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(el);
		expect(el._displayValue).toBe('België');
	});

	it('dispatches a change event with value detail', async () => {
		el = await fixture<NLDDDropdown>(selectFixture());
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

		const select = el.querySelector('select')!;
		select.value = 'be';
		select.dispatchEvent(new Event('change', { bubbles: true }));

		expect(detail).toBeDefined();
		expect(detail.value).toBe('be');
	});

	it('past inline host width toe als width property gezet is', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown width="240px">
				<select aria-label="Test">
					<option value="a">A</option>
				</select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('240px');
		expect(el.style.getPropertyValue('--_width')).toBe('240px');
	});

	it('focus() lands on the slotted select', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown>
				<select aria-label="Land"><option value="nl">Nederland</option></select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el.querySelector('select'));
	});

	it('forwards accessible-label to the slotted select', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown accessible-label="Land">
				<select><option value="nl">Nederland</option></select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		expect(el.querySelector('select')!.getAttribute('aria-label')).toBe('Land');
	});

	it('clears the name from the select when accessible-label is emptied', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown accessible-label="Land">
				<select><option value="nl">Nederland</option></select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		(el as NLDDDropdown).accessibleLabel = '';
		await waitForUpdate(el);
		expect(el.querySelector('select')!.hasAttribute('aria-label')).toBe(false);
	});

	it('leaves an aria-label the consumer put on the select', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown>
				<select aria-label="Land"><option value="nl">Nederland</option></select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		expect(el.querySelector('select')!.getAttribute('aria-label')).toBe('Land');
	});
});
