import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDToggleButton } from './toggle-button.js';
import './toggle-button.js';


/* ============================================================
   Rendering
   ============================================================ */

describe('nldd-toggle-button', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-toggle-button></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a button element by default', async () => {
		el = await fixture('<nldd-toggle-button text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('input')).toBeNull();
	});

	it('type=checkbox renders an input[type=checkbox]', async () => {
		el = await fixture('<nldd-toggle-button type="checkbox" text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('input');
		expect(input).not.toBeNull();
		expect(input!.type).toBe('checkbox');
	});

	it('type=radio renders an input[type=radio]', async () => {
		el = await fixture('<nldd-toggle-button type="radio" text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('input');
		expect(input).not.toBeNull();
		expect(input!.type).toBe('radio');
	});

	it('checkbox/radio renders a label wrapper', async () => {
		el = await fixture('<nldd-toggle-button type="checkbox" text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('label')).not.toBeNull();
	});

	it('renders text from text attribute', async () => {
		el = await fixture('<nldd-toggle-button text="Bewaren"></nldd-toggle-button>');
		await waitForUpdate(el);
		const textEl = el.shadowRoot!.querySelector('.toggle-button__text');
		expect(textEl).not.toBeNull();
		expect(textEl!.textContent).toBe('Bewaren');
	});

	it('renders icon from icon attribute', async () => {
		el = await fixture('<nldd-toggle-button text="Bewaren" icon="heart"></nldd-toggle-button>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.toggle-button__icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('name')).toBe('heart');
	});

	it('renders icon slot when icon attribute is not set', async () => {
		el = await fixture(`
			<nldd-toggle-button text="Custom">
				<svg slot="icon" width="20" height="20"><circle cx="10" cy="10" r="8"/></svg>
			</nldd-toggle-button>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('slot[name="icon"]') as HTMLSlotElement;
		expect(slot).not.toBeNull();
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-toggle-button – state', () => {
	let el: NLDDToggleButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('selected is false by default', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.selected).toBe(false);
	});

	it('selected reflects as attribute', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button selected></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.hasAttribute('selected')).toBe(true);
	});

	it('disabled reflects as attribute', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button disabled></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.hasAttribute('disabled')).toBe(true);
	});

	it('button type: button has aria-pressed=false when not selected', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button')!;
		expect(button.getAttribute('aria-pressed')).toBe('false');
	});

	it('button type: button has aria-pressed=true when selected', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label" selected></nldd-toggle-button>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button')!;
		expect(button.getAttribute('aria-pressed')).toBe('true');
	});

	it('checkbox type: input.checked matches selected property', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="checkbox" text="Label" selected></nldd-toggle-button>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!;
		expect(input.checked).toBe(true);
	});

	it('checkbox type: input is disabled when disabled attribute is set', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="checkbox" text="Label" disabled></nldd-toggle-button>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!;
		expect(input.disabled).toBe(true);
	});

	it('forwards name to the input', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="checkbox" name="filter" text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!;
		expect(input.name).toBe('filter');
	});

	it('forwards value to the input', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="checkbox" value="optie-a" text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!;
		expect(input.value).toBe('optie-a');
	});
});


/* ============================================================
   Variant — content-driven rendering + explicit force
   ============================================================ */

describe('nldd-toggle-button – variant', () => {
	let el: NLDDToggleButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders only the icon when no text is provided', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button icon="heart" accessible-label="Favoriet"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.toggle-button__icon')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.toggle-button__text')).toBeNull();
	});

	it('renders both icon and text when both are provided', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button icon="heart" text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.toggle-button__icon')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.toggle-button__text')).not.toBeNull();
	});

	it('renders only text when no icon is provided', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.toggle-button__icon')).toBeNull();
		expect(el.shadowRoot!.querySelector('.toggle-button__text')).not.toBeNull();
	});

	it('variant="icon" suppresses text even when text attribute is set', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button icon="heart" text="Label" variant="icon" accessible-label="Favoriet"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.toggle-button__text')).toBeNull();
		expect(el.shadowRoot!.querySelector('.toggle-button__icon')).not.toBeNull();
	});

	it('variant="text" hides the icon visually while keeping the slot in shadow DOM', async () => {
		// The icon element is still rendered (so slotchange stays observable
		// for a future variant flip) but display:none keeps it out of the
		// visual layout. Verify both: present in shadow DOM, hidden via CSS.
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button icon="heart" text="Label" variant="text"></nldd-toggle-button>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.toggle-button__icon');
		expect(icon).not.toBeNull();
		expect(getComputedStyle(icon!).display).toBe('none');
		expect(el.shadowRoot!.querySelector('.toggle-button__text')).not.toBeNull();
	});

	it('variant="icon" falls text back to aria-label when text is set', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button icon="bold" text="Bold" variant="icon"></nldd-toggle-button>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button')!;
		expect(button.getAttribute('aria-label')).toBe('Bold');
	});

	it('variant="icon" without an icon shows the icon-placeholder', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button variant="icon" accessible-label="Favoriet"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon[name="icon-placeholder"]')).not.toBeNull();
	});

	it('variant="icon-and-text" with text but no icon shows the placeholder', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button variant="icon-and-text" text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon[name="icon-placeholder"]')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.toggle-button__text')).not.toBeNull();
	});

	it('variant="icon-and-text" without icon or text shows the icon-placeholder', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button variant="icon-and-text" accessible-label="Leeg"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon[name="icon-placeholder"]')).not.toBeNull();
	});

	it('warns when neither text nor accessible-label is set', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		el = await fixture<NLDDToggleButton>('<nldd-toggle-button icon="heart"></nldd-toggle-button>');
		await waitForUpdate(el);

		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('accessible-label'));
		warnSpy.mockRestore();
	});

	it('does not warn when accessible-label is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		el = await fixture<NLDDToggleButton>('<nldd-toggle-button icon="heart" accessible-label="Favoriet"></nldd-toggle-button>');
		await waitForUpdate(el);

		expect(warnSpy).not.toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it('does not warn when text is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);

		expect(warnSpy).not.toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});


/* ============================================================
   Interaction – type=button
   ============================================================ */

describe('nldd-toggle-button – interaction (button)', () => {
	let el: NLDDToggleButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('clicking toggles selected', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		el.shadowRoot!.querySelector('button')!.click();
		await waitForUpdate(el);
		expect(el.selected).toBe(true);
	});

	it('clicking again deselects', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label" selected></nldd-toggle-button>');
		await waitForUpdate(el);
		el.shadowRoot!.querySelector('button')!.click();
		await waitForUpdate(el);
		expect(el.selected).toBe(false);
	});

	it('click dispatches change event with correct detail', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label" value="option"></nldd-toggle-button>');
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('change', (e: Event) => { detail = (e as CustomEvent).detail; });
		el.shadowRoot!.querySelector('button')!.click();

		expect(detail?.selected).toBe(true);
		expect(detail?.value).toBe('option');
	});

	it('disabled button does not toggle when clicked', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label" disabled></nldd-toggle-button>');
		await waitForUpdate(el);
		el.shadowRoot!.querySelector('button')!.click();
		await waitForUpdate(el);
		expect(el.selected).toBe(false);
	});
});


/* ============================================================
   Interaction – type=checkbox
   ============================================================ */

describe('nldd-toggle-button – interaction (checkbox)', () => {
	let el: NLDDToggleButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('input change syncs selected property', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="checkbox" text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);

		const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!;
		input.checked = true;
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(el);

		expect(el.selected).toBe(true);
	});

	it('input change dispatches change event', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="checkbox" value="check" text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('change', (e: Event) => { detail = (e as CustomEvent).detail; });

		const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!;
		input.checked = true;
		input.dispatchEvent(new Event('change', { bubbles: true }));

		expect(detail?.selected).toBe(true);
		expect(detail?.value).toBe('check');
	});
});


/* ============================================================
   Interaction – type=radio
   ============================================================ */

describe('nldd-toggle-button – interaction (radio)', () => {
	let el: NLDDToggleButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('toggle() on selected radio does nothing', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="radio" text="Label" selected></nldd-toggle-button>');
		await waitForUpdate(el);
		el.toggle();
		await waitForUpdate(el);
		expect(el.selected).toBe(true);
	});

	it('toggle() on unselected radio selects it', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="radio" text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		el.toggle();
		await waitForUpdate(el);
		expect(el.selected).toBe(true);
	});
});


/* ============================================================
   toggle() method
   ============================================================ */

describe('nldd-toggle-button – toggle()', () => {
	let el: NLDDToggleButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('toggle() toggles button type', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		el.toggle();
		expect(el.selected).toBe(true);
		el.toggle();
		expect(el.selected).toBe(false);
	});

	it('toggle() does nothing when disabled', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label" disabled></nldd-toggle-button>');
		await waitForUpdate(el);
		el.toggle();
		expect(el.selected).toBe(false);
	});
});


/* ============================================================
   Accessibility
   ============================================================ */

describe('nldd-toggle-button – accessibility', () => {
	let el: NLDDToggleButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('forwards accessible-label to button aria-label', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button accessible-label="Sluiten" text="✕"></nldd-toggle-button>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button')!;
		expect(button.getAttribute('aria-label')).toBe('Sluiten');
	});

	it('forwards accessible-label to input aria-label', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="checkbox" accessible-label="Sluiten" text="✕"></nldd-toggle-button>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('aria-label')).toBe('Sluiten');
	});

	it('does not set aria-label when accessible-label is empty', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="Label"></nldd-toggle-button>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button')!;
		expect(button.hasAttribute('aria-label')).toBe(false);
	});
});


/* ============================================================
   Tooltip
   ============================================================ */

describe('nldd-toggle-button – tooltip', () => {
	let el: NLDDToggleButton | HTMLFormElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('wraps in nldd-tooltip when icon-only', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button icon="star" accessible-label="Favoriet"></nldd-toggle-button>');
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip');
		expect(tooltip).not.toBeNull();
		expect(tooltip!.getAttribute('text')).toBe('Favoriet');
	});

	it('does not wrap in nldd-tooltip when text is present', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button icon="star" text="Favoriet"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-tooltip')).toBeNull();
	});

	it('shows the tooltip on focus in radio mode, where the focus is on the host', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="radio" name="opmaak" value="vet" icon="bold" accessible-label="Vet"></nldd-toggle-button>');
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip') as HTMLElement & { _visible?: boolean; updateComplete: Promise<boolean> };
		const bubble = tooltip.shadowRoot!.querySelector('.tooltip') as HTMLElement;

		(el as NLDDToggleButton).focus();
		await waitForUpdate(tooltip);
		expect(bubble.matches(':popover-open')).toBe(true);

		// WCAG 1.4.13: away without moving focus. Dispatch on the tooltip and
		// not on the host: the tooltip lives in the host's shadow root and its
		// keydown listener sits on itself, so an event fired at the host bubbles
		// up and away from it. Fired at the host this test passed for the wrong
		// reason, waiting out the 50ms hide timer that the pointer-leave path
		// starts, which is why it failed under load and never on a quiet machine.
		tooltip.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
		await tooltip.updateComplete;
		expect(bubble.matches(':popover-open')).toBe(false);
	});

	it('participates in FormData when type="checkbox" and selected', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-toggle-button type="checkbox" name="fav" value="star" text="Favoriet" selected></nldd-toggle-button></form>');
		el = form;
		const tb = form.querySelector('nldd-toggle-button')!;
		await waitForUpdate(tb);
		expect(new FormData(form).get('fav')).toBe('star');
	});

	it('is omitted from FormData when type="button" (not a form control)', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-toggle-button type="button" name="fav" value="star" text="Favoriet" selected></nldd-toggle-button></form>');
		el = form;
		const tb = form.querySelector('nldd-toggle-button')!;
		await waitForUpdate(tb);
		expect(new FormData(form).has('fav')).toBe(false);
	});

	it('resets to the HTML-declared initial selected state when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-toggle-button type="checkbox" name="fav" value="star" text="Favoriet" selected></nldd-toggle-button></form>');
		el = form;
		const tb = form.querySelector<NLDDToggleButton>('nldd-toggle-button')!;
		await waitForUpdate(tb);
		tb.selected = false;
		await waitForUpdate(tb);
		form.reset();
		expect(tb.selected).toBe(true);
	});

	it('focus() lands on the inner input for a checkbox toggle', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="checkbox" text="Bold"></nldd-toggle-button>');
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('.toggle-button__input'));
	});

	it('focus() lands on the inner button for a button toggle', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button type="button" text="Bold"></nldd-toggle-button>');
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('button.toggle-button'));
	});
});

describe('nldd-toggle-button no-tab', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('takes the button out of the tab order', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="X" no-tab></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button.toggle-button')!.getAttribute('tabindex')).toBe('-1');
	});

	it('takes the checkbox variant out of the tab order', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="X" type="checkbox" no-tab></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.toggle-button__input')!.getAttribute('tabindex')).toBe('-1');
	});

	it('is in the tab order by default (no tabindex attribute)', async () => {
		el = await fixture<NLDDToggleButton>('<nldd-toggle-button text="X"></nldd-toggle-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button.toggle-button')!.hasAttribute('tabindex')).toBe(false);
	});
});
