import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement, nextFrames } from '../../../test-utils.js';
import type { NLDDComboBox } from './combo-box.js';
import './combo-box.js';
import '../../actions/menu/menu.js';

/** Waits until the combo-box reports an active descendant, so a test can press
 *  Enter knowing there is something to pick. */
async function totHighlight(combo: NLDDComboBox): Promise<void> {
	const heeft = () => !!(combo as unknown as { _highlightedId: string })._highlightedId;
	for (let poging = 0; poging < 60 && !heeft(); poging += 1) {
		await nextFrames();
	}
}

describe('nldd-combo-box', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a native text input', async () => {
		el = await fixture('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input[type="text"]')).not.toBeNull();
	});

	it('renders nldd-icon-button for the picker', async () => {
		el = await fixture('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-button')).not.toBeNull();
	});
});


/* ============================================================
   Validation
   ============================================================ */

describe('nldd-combo-box – validation', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders no validation icon by default', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.combo-box__validation-icon-area')).toBeNull();
	});

	it('renders a valid icon when valid', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box valid></nldd-combo-box>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.combo-box__validation-icon')!;
		expect(icon.getAttribute('icon')).toBe('valid');
	});

	it('renders an invalid icon when invalid', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box invalid></nldd-combo-box>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.combo-box__validation-icon')!;
		expect(icon.getAttribute('icon')).toBe('invalid');
	});

	it('sets aria-invalid on the input when invalid', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box invalid></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
	});

	it('removes aria-invalid when invalid is cleared', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box invalid></nldd-combo-box>');
		await waitForUpdate(el);
		el.invalid = false;
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.hasAttribute('aria-invalid')).toBe(false);
	});
});


/* ============================================================
   Size
   ============================================================ */

describe('nldd-combo-box – size', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('defaults size to md', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.size).toBe('md');
	});

	it('reflects size attribute to host', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box size="sm"></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('sm');
	});

	it('renders sm icon buttons when size is md', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box size="md"></nldd-combo-box>');
		await waitForUpdate(el);
		const picker = el.shadowRoot!.querySelector('.combo-box__picker-button nldd-icon-button')!;
		expect(picker.getAttribute('size')).toBe('sm');
	});

	it('renders xs icon buttons when size is sm', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box size="sm"></nldd-combo-box>');
		await waitForUpdate(el);
		const picker = el.shadowRoot!.querySelector('.combo-box__picker-button nldd-icon-button')!;
		expect(picker.getAttribute('size')).toBe('xs');
	});

	it('past inline host width toe als width property gezet is', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box width="240px"></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('240px');
		expect(el.style.getPropertyValue('--_width')).toBe('240px');
	});
});


/* ============================================================
   ARIA
   ============================================================ */

describe('nldd-combo-box – ARIA', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('sets role="combobox" on the native input', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('role')).toBe('combobox');
	});

	it('sets aria-expanded="false" when closed', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('aria-expanded')).toBe('false');
	});

	it('sets aria-autocomplete="list"', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('aria-autocomplete')).toBe('list');
	});

	it('sets aria-haspopup="listbox"', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('aria-haspopup')).toBe('listbox');
	});

	it('sets aria-controls to the menu id', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('aria-controls')).toBe(el._menuId);
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-combo-box – state', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('forwards placeholder to native input', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box placeholder="Zoek..."></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('placeholder')).toBe('Zoek...');
	});

	it('forwards name to native input', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box name="country"></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.name).toBe('country');
	});

	it('disables native input when disabled', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box disabled></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.disabled).toBe(true);
	});
});


/* ============================================================
   Input event
   ============================================================ */

describe('nldd-combo-box – input event', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('updates text on input', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as any).value = 'Neder';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect(el.text).toBe('Neder');
	});

	it('dispatches input event with text detail', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('input', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as any).value = 'test';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(detail?.value).toBe('test');
	});
});


/* ============================================================
   Clear button
   ============================================================ */

describe('nldd-combo-box – clear', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('does not render clear button when display value is empty', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.combo-box__clear-button')).toBeNull();
	});

	it('renders clear button when there is a display value', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as any).value = 'Ned';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.combo-box__clear-button')).not.toBeNull();
	});

	it('clears value, fires change event and refocuses input on clear click', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box></nldd-combo-box>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as any).value = 'Nederland';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		el.value = 'nl';
		await waitForUpdate(el);

		let changeDetail: any;
		el.addEventListener('change', ((e: CustomEvent) => { changeDetail = e.detail; }) as EventListener);

		const clearButton = el.shadowRoot!.querySelector<HTMLElement>('.combo-box__clear-button nldd-icon-button')!;
		clearButton.click();
		await waitForUpdate(el);

		expect(el.value).toBe('');
		expect(el.text).toBe('');
		expect(changeDetail?.value).toBe('');
		// Refocus: walk shadow roots to find the deepest active element.
		let active: Element | null = document.activeElement;
		while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
		expect(active).toBe(input);
	});
});


/* ============================================================
   Filtering
   ============================================================ */

describe('nldd-combo-box – filtering', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('filters nldd-menu-item elements on input', async () => {
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box>
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
					<nldd-menu-item text="België" value="be"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);

		const input = el.shadowRoot!.querySelector('input')!;
		(input as any).value = 'Ned';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);

		const menu = document.getElementById(el._menuId)!;
		const items = menu.querySelectorAll('nldd-menu-item');
		expect(items[0].hasAttribute('hidden')).toBe(false);
		expect(items[1].hasAttribute('hidden')).toBe(true);
	});

	it('matches on search attribute', async () => {
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box>
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl" aliases="dutch holland"></nldd-menu-item>
					<nldd-menu-item text="België" value="be"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);

		const input = el.shadowRoot!.querySelector('input')!;
		(input as any).value = 'dutch';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);

		const menu = document.getElementById(el._menuId)!;
		const items = menu.querySelectorAll('nldd-menu-item');
		expect(items[0].hasAttribute('hidden')).toBe(false);
		expect(items[1].hasAttribute('hidden')).toBe(true);
	});
});


/* ============================================================
   Popover API
   ============================================================ */

describe('nldd-combo-box – Popover API', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('warns when Popover API is unavailable', async () => {
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box>
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);

		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		// Simulate missing Popover API by deleting showPopover from the prototype
		const proto = HTMLElement.prototype;
		const original = proto.showPopover;
		// @ts-ignore
		delete proto.showPopover;

		el._openMenu();

		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('Popover API')
		);

		proto.showPopover = original;
	});
});

describe('nldd-combo-box – picker pointerdown (touch close)', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('pointerdown op picker terwijl menu open is sluit het en skippen volgende click-toggle', async () => {
		// On iOS a tap outside the open popover closes it through light-dismiss.
		// The picker tap dispatches BOTH pointerdown AND click, so if click called
		// _toggleMenu it would reopen the menu right away.
		// _handlePickerPointerdown records that the menu WAS open, which turns the
		// click toggle that follows into a no-op.
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box>
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);

		// Open the menu programmatically
		el._openMenu();
		await waitForUpdate(el);
		expect(el._isOpen).toBe(true);

		// Simulate the browser flow: pointerdown, light-dismiss closes the popover,
		// the pointerdown handler sets the flag, click, and _toggleMenu skips.
		el._handlePickerPointerdown();
		// Light-dismiss would set _isOpen to false through the toggle event.
		// Simulate that by hand.
		el._closeMenu();
		await waitForUpdate(el);

		// Now the click arrives. _toggleMenu would normally reopen, but the flag
		// prevents it.
		el._toggleMenu();
		await waitForUpdate(el);
		expect(el._isOpen).toBe(false);
	});

	it('pointerdown wanneer menu gesloten is markeert geen flag', async () => {
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box>
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);
		expect(el._isOpen).toBe(false);

		// Pointerdown with the menu closed: no flag, so the next toggle opens
		el._handlePickerPointerdown();
		el._toggleMenu();
		await waitForUpdate(el);
		expect(el._isOpen).toBe(true);
	});

	it('participates in FormData via form-associated API', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-combo-box name="country" value="nl" accessible-label="Land"></nldd-combo-box></form>');
		const cb = form.querySelector('nldd-combo-box')!;
		await waitForUpdate(cb);
		expect(new FormData(form).get('country')).toBe('nl');
		cleanup(form);
	});

	it('resets to the HTML-declared initial value when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-combo-box name="country" value="nl" accessible-label="Land"></nldd-combo-box></form>');
		const cb = form.querySelector<NLDDComboBox>('nldd-combo-box')!;
		await waitForUpdate(cb);
		cb.value = 'be';
		await waitForUpdate(cb);
		form.reset();
		expect(cb.value).toBe('nl');
		cleanup(form);
	});

	it('formStateRestoreCallback restores both value and display label from FormData state', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box accessible-label="Land"></nldd-combo-box>');
		await waitForUpdate(el);
		const restored = new FormData();
		restored.append('value', 'nl');
		restored.append('display', 'Nederland');
		(el as unknown as { formStateRestoreCallback: (s: FormData) => void }).formStateRestoreCallback(restored);
		await waitForUpdate(el);
		expect((el as NLDDComboBox).value).toBe('nl');
		expect((el as NLDDComboBox).text).toBe('Nederland');
	});
});


/* ============================================================
   text public API + auto-derive
   ============================================================ */

describe('nldd-combo-box – text', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('exposes text as a public property with default empty string', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box accessible-label="Land"></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.text).toBe('');
	});

	it('pre-populates the input via text attribute', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box value="nl" text="Nederland" accessible-label="Land"></nldd-combo-box>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.value).toBe('Nederland');
		expect(el.text).toBe('Nederland');
		expect(el.value).toBe('nl');
	});

	it('pre-populates the input via text property set from JS', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box accessible-label="Land"></nldd-combo-box>');
		el.value = 'nl';
		el.text = 'Nederland';
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.value).toBe('Nederland');
	});

	it('auto-derives text from a slotted menu item matching value (initial render)', async () => {
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box value="nl" accessible-label="Land">
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
					<nldd-menu-item text="België" value="be"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);
		expect(el.text).toBe('Nederland');
		expect(el.shadowRoot!.querySelector('input')!.value).toBe('Nederland');
	});

	it('auto-derives text when value is updated programmatically', async () => {
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box accessible-label="Land">
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
					<nldd-menu-item text="België" value="be"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);
		el.value = 'be';
		await waitForUpdate(el);
		expect(el.text).toBe('België');
	});

	it('clears the text when value is cleared programmatically', async () => {
		// Without this, clearing the value (e.g. a form reset behind a status
		// toggle) leaves the old label visible while the form posts nothing.
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box value="nl" accessible-label="Land">
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);
		expect(el.text).toBe('Nederland');
		el.value = '';
		await waitForUpdate(el);
		expect(el.text).toBe('');
	});

	it('does not overwrite an explicit text when value matches a menu item', async () => {
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box value="nl" text="Netherlands (custom)" accessible-label="Land">
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);
		expect(el.text).toBe('Netherlands (custom)');
	});

	it('does not auto-derive when value has no matching slotted item', async () => {
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box value="xx" accessible-label="Land">
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);
		expect(el.text).toBe('');
	});

	it('falls back to item.text when item.value is unset', async () => {
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box value="Optellen" accessible-label="Operatie">
				<nldd-menu>
					<nldd-menu-item text="Optellen"></nldd-menu-item>
					<nldd-menu-item text="Aftrekken"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);
		expect(el.text).toBe('Optellen');
	});

	it('keeps both value and text in sync when consumer batches updates', async () => {
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box accessible-label="Land">
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
					<nldd-menu-item text="België" value="be"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);
		el.value = 'be';
		el.text = 'Custom Belgium';
		await waitForUpdate(el);
		// Both changed in same Lit update cycle → derive does not overwrite the explicit value.
		expect(el.value).toBe('be');
		expect(el.text).toBe('Custom Belgium');
	});

	it('derives text once the menu is appended after value is set (second-chance _onSlotChange path)', async () => {
		// Common consumer pattern: <nldd-combo-box value="nl"> with the menu
		// stamped in async. willUpdate's first run has no menu to walk, so
		// _onSlotChange must re-trigger derivation when the slot lights up.
		el = await fixture<NLDDComboBox>('<nldd-combo-box value="nl" accessible-label="Land"></nldd-combo-box>');
		await waitForUpdate(el);
		expect(el.text).toBe(''); // no menu yet → derive bailed early

		const menu = document.createElement('nldd-menu');
		menu.innerHTML = `
			<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
			<nldd-menu-item text="België" value="be"></nldd-menu-item>
		`;
		el.appendChild(menu);
		await waitForUpdate(el);
		expect(el.text).toBe('Nederland');
	});

	it('leaves text unchanged when value is updated to a non-matching item', async () => {
		// _deriveTextFromMenu silently no-ops on no-match (no warning, no
		// clear). The previous display label stays — consumers driving value
		// programmatically are responsible for clearing text when they know
		// the new value has no slotted match.
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box value="nl" text="Nederland" accessible-label="Land">
				<nldd-menu>
					<nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
					<nldd-menu-item text="België" value="be"></nldd-menu-item>
				</nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);
		el.value = 'xx';
		await waitForUpdate(el);
		expect(el.text).toBe('Nederland');
	});

	it('focus() delegates to the inner input', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box accessible-label="Land"></nldd-combo-box>');
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('input'));
	});

	it('inner input keeps spellcheck=true by default', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box accessible-label="Land"></nldd-combo-box>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('spellcheck')).toBe('true');
	});

	it('no-spellcheck attribute disables spellcheck on inner input', async () => {
		el = await fixture<NLDDComboBox>('<nldd-combo-box accessible-label="Land" no-spellcheck></nldd-combo-box>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('spellcheck')).toBe('false');
	});
});


/* ============================================================
   allow-custom
   ============================================================ */

describe('nldd-combo-box – allow-custom', () => {
	let el: NLDDComboBox;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const withOption = () => fixture<NLDDComboBox>(`
		<nldd-combo-box accessible-label="Land">
			<nldd-menu><nldd-menu-item text="Nederland" value="nl"></nldd-menu-item></nldd-menu>
		</nldd-combo-box>
	`);

	const typeAndEnter = async (element: NLDDComboBox, text: string) => {
		const input = element.shadowRoot!.querySelector('input')!;
		(input as HTMLInputElement).value = text;
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(element);
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await waitForUpdate(element);
	};

	it('closes the menu instead of showing the empty state when nothing matches (allow-custom)', async () => {
		// The typed text is itself a valid value, so "nothing found" would
		// wrongly suggest the input is invalid.
		el = await withOption();
		el.allowCustom = true;
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as HTMLInputElement).value = 'xyz';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		expect(menu.matches(':popover-open')).toBe(false);
	});

	it('keeps showing the empty state without allow-custom', async () => {
		el = await withOption();
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as HTMLInputElement).value = 'xyz';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('reopens the menu once the typed text matches again (allow-custom)', async () => {
		el = await withOption();
		el.allowCustom = true;
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as HTMLInputElement).value = 'xyz';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		(input as HTMLInputElement).value = 'Neder';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('discards a non-matching typed value on Enter by default', async () => {
		el = await withOption();
		await waitForUpdate(el);
		await typeAndEnter(el, 'xyz');
		expect(el.value).toBe('');
	});

	it('commits a non-matching typed value on Enter with allow-custom', async () => {
		el = await withOption();
		el.allowCustom = true;
		await waitForUpdate(el);
		await typeAndEnter(el, 'xyz');
		expect(el.value).toBe('xyz');
	});

	const typeAndBlur = async (element: NLDDComboBox, text: string) => {
		const input = element.shadowRoot!.querySelector('input') as HTMLInputElement;
		input.value = text;
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(element);
		input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
		await waitForUpdate(element);
	};

	it('reverts a non-matching typed value on blur by default', async () => {
		el = await withOption();
		await waitForUpdate(el);
		await typeAndBlur(el, 'xyz');
		expect(el.value).toBe('');
		expect(el.shadowRoot!.querySelector('input')!.value).toBe('');
	});

	it('reverts the text to the current value on blur, keeping the value', async () => {
		el = await withOption();
		el.value = 'nl';
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
		expect(input.value).toBe('Nederland'); // derived from the menu option
		await typeAndBlur(el, 'xyz');
		expect(el.value).toBe('nl'); // value unchanged
		expect(input.value).toBe('Nederland'); // text reverted
	});

	it('reverts to the current value on Enter when nothing matches (no commit)', async () => {
		el = await withOption();
		el.value = 'nl';
		await waitForUpdate(el);
		await typeAndEnter(el, 'xyz');
		expect(el.value).toBe('nl'); // stays put, not cleared or committed
		expect(el.shadowRoot!.querySelector('input')!.value).toBe('Nederland');
	});

	it('clears the input on blur when the value matches no option (no stale text)', async () => {
		// value "xx" has no matching menu item; typing another non-match and blurring
		// must discard the typed text rather than leave it on screen (revert desync).
		el = await fixture<NLDDComboBox>(`
			<nldd-combo-box value="xx" accessible-label="Land">
				<nldd-menu><nldd-menu-item text="Nederland" value="nl"></nldd-menu-item></nldd-menu>
			</nldd-combo-box>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.value).toBe(''); // no label for "xx"
		await typeAndBlur(el, 'zzz');
		expect(el.value).toBe('xx'); // value untouched
		expect(el.shadowRoot!.querySelector('input')!.value).toBe(''); // typed text discarded
	});
	// A combo box in a form: the Enter that picks an option is not also a submit.
	it('laat een verwerkte Enter niet doorborrelen naar het formulier', async () => {
		el = await fixture(`
			<form>
				<nldd-combo-box accessible-label="Land">
					<nldd-menu>
						<nldd-menu-item value="nl" text="Nederland"></nldd-menu-item>
						<nldd-menu-item value="be" text="Belgie"></nldd-menu-item>
					</nldd-menu>
				</nldd-combo-box>
			</form>
		`);
		await waitForUpdate(el);
		const combo = el.querySelector('nldd-combo-box') as NLDDComboBox;
		const input = combo.shadowRoot!.querySelector('input')!;
		let reachedForm = 0;
		// `el` is the form: fixture returns the root of the given markup. Only
		// Enter is counted — the arrow keys are free to bubble, they submit
		// nothing.
		el.addEventListener('keydown', (e) => {
			if ((e as KeyboardEvent).key === 'Enter') reachedForm += 1;
		});

		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		// The first item is highlighted from a requestAnimationFrame that hangs off
		// the popover's toggle event, and that event is a task of its own. Waiting a
		// fixed number of frames is a race, so wait for the highlight itself.
		await totHighlight(combo);
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
		await waitForUpdate(el);

		expect(combo.value).toBe('nl');
		expect(reachedForm).toBe(0);
	});


	describe('readonly', () => {
		it('marks the inner input readonly and keeps it focusable', async () => {
			el = await fixture('<nldd-combo-box readonly value="nl"><nldd-menu><nldd-menu-item text="Nederland" value="nl"></nldd-menu-item></nldd-menu></nldd-combo-box>');
			await waitForUpdate(el);
			const input = el.shadowRoot!.querySelector('input')!;
			expect(input.readOnly).toBe(true);
			expect(input.disabled).toBe(false);
		});

		it('does not open the menu', async () => {
			el = await fixture('<nldd-combo-box readonly value="nl"><nldd-menu><nldd-menu-item text="Nederland" value="nl"></nldd-menu-item></nldd-menu></nldd-combo-box>');
			await waitForUpdate(el);
			(el as unknown as { _openMenu(): void })._openMenu();
			await waitForUpdate(el);
			expect((el as unknown as { _isOpen: boolean })._isOpen).toBe(false);
		});

		// Clicking the value and then the picker button next to it moves focus out
		// of the input. That blur used to run the revert meant for typed text,
		// which reads the label back from the value and finds nothing to read.
		it('keeps its text when focus leaves, with a label that matches no option', async () => {
			el = await fixture('<nldd-combo-box readonly text="Patchpaneel 24-poorts"><nldd-menu></nldd-menu></nldd-combo-box>');
			await waitForUpdate(el);
			const input = el.shadowRoot!.querySelector('input')!;
			input.focus();
			input.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }));
			await waitForUpdate(el);
			expect((el as unknown as { text: string }).text).toBe('Patchpaneel 24-poorts');
			expect(input.value).toBe('Patchpaneel 24-poorts');
		});

		it('offers nothing to clear', async () => {
			el = await fixture('<nldd-combo-box readonly value="nl"><nldd-menu><nldd-menu-item text="Nederland" value="nl"></nldd-menu-item></nldd-menu></nldd-combo-box>');
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.combo-box__clear-button')).toBeNull();
		});
	});
});

describe('nldd-combo-box readonly aria', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('drops the combobox role and its aria when there is no menu to open', async () => {
		el = await fixture('<nldd-combo-box readonly accessible-label="Product"></nldd-combo-box>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.hasAttribute('role')).toBe(false);
		expect(input.hasAttribute('aria-haspopup')).toBe(false);
		expect(input.hasAttribute('aria-autocomplete')).toBe(false);
		expect(input.hasAttribute('aria-expanded')).toBe(false);
		expect(input.hasAttribute('aria-controls')).toBe(false);
	});

	it('keeps them on a field that does open', async () => {
		el = await fixture('<nldd-combo-box accessible-label="Product"></nldd-combo-box>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('role')).toBe('combobox');
		expect(input.getAttribute('aria-haspopup')).toBe('listbox');
	});
});

describe('nldd-combo-box Escape', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const withMenu = () => `
		<nldd-combo-box accessible-label="Assignee" text="Yara">
			<nldd-menu>
				<nldd-menu-item value="yara" text="Yara Nijhuis"></nldd-menu-item>
				<nldd-menu-item value="ruben" text="Ruben de Groot"></nldd-menu-item>
			</nldd-menu>
		</nldd-combo-box>
	`;

	it('closes its own menu and stops there', async () => {
		el = await fixture(withMenu());
		await waitForUpdate(el);
		const combo = el as unknown as { _isOpen: boolean; _openMenu(): void; _handleKeydown(e: KeyboardEvent): void };
		combo._openMenu();
		await waitForUpdate(el);
		expect(combo._isOpen).toBe(true);
		const outer = vi.fn();
		document.addEventListener('keydown', outer);
		const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true });
		el.shadowRoot!.querySelector('input')!.dispatchEvent(event);
		document.removeEventListener('keydown', outer);
		await waitForUpdate(el);
		expect(combo._isOpen).toBe(false);
		expect(event.defaultPrevented).toBe(true);
		// A sheet behind it listens for the same press; it must not get this one.
		expect(outer).not.toHaveBeenCalled();
	});

	it('lets Escape travel on while the menu is closed', async () => {
		el = await fixture(withMenu());
		await waitForUpdate(el);
		const outer = vi.fn();
		document.addEventListener('keydown', outer);
		const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true });
		el.shadowRoot!.querySelector('input')!.dispatchEvent(event);
		document.removeEventListener('keydown', outer);
		await waitForUpdate(el);
		expect(event.defaultPrevented).toBe(false);
		expect(outer).toHaveBeenCalledTimes(1);
	});
});
