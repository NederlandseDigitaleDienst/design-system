import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import { NLDDDropdown } from './dropdown.js';

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

	it('shows the choice through the select itself, not through a copy', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown>
				<select name="country" aria-label="Land">
					<option value="nl" selected>Nederland</option>
					<option value="be">België</option>
				</select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		const select = el.querySelector('select')!;
		expect(getComputedStyle(select).opacity).toBe('1');
		expect(el.shadowRoot!.textContent).not.toContain('Nederland');
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

	it('states a slotted select without an accessible name', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown>
				<select name="country">
					<option value="nl">Nederland</option>
				</select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		expect(el.matches(':state(unnamed-select)')).toBe(true);
	});

	it('knows a slotted select with aria-label has a name', async () => {
		el = await fixture<NLDDDropdown>(`
			<nldd-dropdown>
				<select name="country" aria-label="Land">
					<option value="nl">Nederland</option>
				</select>
			</nldd-dropdown>
		`);
		await waitForUpdate(el);
		expect(el.matches(':state(unnamed-select)')).toBe(false);
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

	it('has no label to go stale when the app sets the value itself', async () => {
		el = await fixture<NLDDDropdown>(selectFixture());
		await waitForUpdate(el);
		const select = el.querySelector('select')!;
		const shown = () => select.selectedOptions[0]?.text;

		select.value = 'be';
		await waitForUpdate(el);
		expect(shown()).toBe('België');

		select.selectedIndex = 0;
		await waitForUpdate(el);
		expect(shown()).toBe(select.options[0].text);

		select.options[2].selected = true;
		await waitForUpdate(el);
		expect(shown()).toBe('België');

		expect(el.shadowRoot!.textContent).not.toContain('België');
	});

	it('lets the native change of the select bubble, once', async () => {
		el = await fixture<NLDDDropdown>(selectFixture());
		await waitForUpdate(el);
		const select = el.querySelector('select')!;
		const onSelect: Event[] = [];
		const onHost: Event[] = [];
		const onDocument: Event[] = [];
		const record = (list: Event[]) => (e: Event) => list.push(e);
		select.addEventListener('change', record(onSelect));
		el.addEventListener('change', record(onHost));
		const onDocumentListener = record(onDocument);
		document.addEventListener('change', onDocumentListener);

		select.value = 'be';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		document.removeEventListener('change', onDocumentListener);

		expect(onSelect).toHaveLength(1);
		expect(onHost).toEqual(onSelect);
		expect(onDocument).toEqual(onSelect);
		expect(el.value).toBe('be');
	});

	it('reads and writes value through the select', async () => {
		el = await fixture<NLDDDropdown>(selectFixture());
		await waitForUpdate(el);
		el.value = 'be';
		expect(el.querySelector('select')!.value).toBe('be');
		expect(el.value).toBe('be');
	});

	it('applies a value set before the select arrives', async () => {
		el = await fixture<NLDDDropdown>('<nldd-dropdown></nldd-dropdown>');
		el.value = 'be';
		expect(el.value).toBe('be');
		el.innerHTML = '<select aria-label="Land"><option value="nl">Nederland</option><option value="be">België</option></select>';
		await waitForUpdate(el);
		expect(el.querySelector('select')!.value).toBe('be');
	});

	it('keeps a value until its option arrives, as with options loaded later', async () => {
		el = await fixture<NLDDDropdown>('<nldd-dropdown><select aria-label="Land"></select></nldd-dropdown>');
		await waitForUpdate(el);
		el.value = 'be';
		expect(el.value).toBe('be');
		const select = el.querySelector('select')!;
		select.innerHTML = '<option value="nl">Nederland</option>';
		await waitForUpdate(el);
		expect(el.value).toBe('be');
		expect(select.selectedIndex).toBe(0);
		select.insertAdjacentHTML('beforeend', '<option value="be">België</option>');
		await waitForUpdate(el);
		expect(select.value).toBe('be');
		expect(el.value).toBe('be');
	});

	it('lets a choice someone makes win over a value still waiting for its option', async () => {
		el = await fixture<NLDDDropdown>('<nldd-dropdown><select aria-label="Land"><option value="nl">Nederland</option></select></nldd-dropdown>');
		await waitForUpdate(el);
		el.value = 'be';
		const select = el.querySelector('select')!;
		select.value = 'nl';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		select.insertAdjacentHTML('beforeend', '<option value="be">België</option>');
		await waitForUpdate(el);
		expect(select.value).toBe('nl');
		expect(el.value).toBe('nl');
	});

	it('takes a value set before the element upgraded', async () => {
		const wrapper = document.createElement('div');
		wrapper.innerHTML = '<nldd-dropdown-later><select aria-label="Land"><option value="nl">Nederland</option><option value="be">België</option></select></nldd-dropdown-later>';
		document.body.append(wrapper);
		const later = wrapper.firstElementChild as HTMLElement & { value: string };
		later.value = 'be';
		customElements.define('nldd-dropdown-later', class extends NLDDDropdown {});
		await (later as unknown as NLDDDropdown).updateComplete;
		expect(later.value).toBe('be');
		expect(later.querySelector('select')!.value).toBe('be');
		wrapper.remove();
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
		expect(el.style.getPropertyValue('--_dropdown-width')).toBe('240px');
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
