import { describe, it, expect, afterEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDToggleButtonGroup } from './toggle-button-group.js';
import type { NLDDToggleButton } from '../toggle-button/toggle-button.js';
import './toggle-button-group.js';
import '../toggle-button/toggle-button.js';


/* ============================================================
   Rendering
   ============================================================ */

describe('nldd-toggle-button-group', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-toggle-button-group></nldd-toggle-button-group>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('has role=group by default (type=checkbox)', async () => {
		el = await fixture('<nldd-toggle-button-group type="checkbox"></nldd-toggle-button-group>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('group');
	});

	it('has role=radiogroup for type=radio', async () => {
		el = await fixture('<nldd-toggle-button-group type="radio"></nldd-toggle-button-group>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('radiogroup');
	});

	it('has role=group for type=button', async () => {
		el = await fixture('<nldd-toggle-button-group type="button"></nldd-toggle-button-group>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('group');
	});

	it('warns when no accessible name is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture('<nldd-toggle-button-group></nldd-toggle-button-group>');
		await waitForUpdate(el);
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('accessible name')
		);
		warnSpy.mockRestore();
	});

	it('does not warn when accessible-label is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture('<nldd-toggle-button-group accessible-label="Filters"></nldd-toggle-button-group>');
		await waitForUpdate(el);
		expect(warnSpy).not.toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});


/* ============================================================
   Synchronisatie
   ============================================================ */

describe('nldd-toggle-button-group – synchronisatie', () => {
	let el: NLDDToggleButtonGroup;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('does not sync name to child buttons when type=button', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="button" name="toolbar">
				<nldd-toggle-button value="bold" text="Bold"></nldd-toggle-button>
				<nldd-toggle-button value="italic" text="Italic"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		buttons.forEach(b => expect(b.name).toBe(''));
	});

	it('syncs type to child buttons', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio">
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		buttons.forEach(b => expect(b.type).toBe('radio'));
	});

	it('syncs name to child buttons', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="keuze">
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		buttons.forEach(b => expect(b.name).toBe('keuze'));
	});

	it('syncs size to child buttons', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group size="sm">
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const button = el.querySelector<NLDDToggleButton>('nldd-toggle-button')!;
		expect(button.size).toBe('sm');
	});

	it('syncs appearance to child buttons', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group appearance="neutral-transparent">
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const button = el.querySelector<NLDDToggleButton>('nldd-toggle-button')!;
		expect(button.appearance).toBe('neutral-transparent');

		el.appearance = 'neutral-base';
		await waitForUpdate(el);
		expect(button.appearance).toBe('neutral-base');
	});

	it('disables child buttons when group is disabled', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group disabled>
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		buttons.forEach(b => expect(b.disabled).toBe(true));
	});

	it('re-enables group-disabled buttons when group disabled is removed', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group disabled>
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		el.disabled = false;
		await waitForUpdate(el);

		const button = el.querySelector<NLDDToggleButton>('nldd-toggle-button')!;
		expect(button.disabled).toBe(false);
	});

	it('does not re-enable buttons that were individually disabled', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group disabled>
				<nldd-toggle-button value="a" text="A" disabled></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		el.disabled = false;
		await waitForUpdate(el);

		const button = el.querySelector<NLDDToggleButton>('nldd-toggle-button')!;
		expect(button.disabled).toBe(true);
	});

	it('syncs buttons added after initial render', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="laat">
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const button = document.createElement('nldd-toggle-button') as NLDDToggleButton;
		button.setAttribute('text', 'Laat toegevoegd');
		el.appendChild(button);
		await waitForUpdate(el);

		expect(button.type).toBe('radio');
		expect(button.name).toBe('laat');
	});
});


/* ============================================================
   Single-select (radio)
   ============================================================ */

describe('nldd-toggle-button-group – single-select (radio)', () => {
	let el: NLDDToggleButtonGroup;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('deselects other buttons when one is selected via change event', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="keuze">
				<nldd-toggle-button value="a" text="A" selected></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
				<nldd-toggle-button value="c" text="C"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const [buttonA, buttonB] = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');

		buttonB.selected = true;
		buttonB.dispatchEvent(new CustomEvent('change', {
			detail: { selected: true, value: 'b' },
			bubbles: true,
		}));
		await waitForUpdate(el);

		expect(buttonA.selected).toBe(false);
		expect(buttonB.selected).toBe(true);
	});

	it('does not deselect others when a deselection event fires', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="keuze">
				<nldd-toggle-button value="a" text="A" selected></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B" selected></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const [buttonA, buttonB] = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');

		buttonA.selected = false;
		buttonA.dispatchEvent(new CustomEvent('change', {
			detail: { selected: false, value: 'a' },
			bubbles: true,
		}));
		await waitForUpdate(el);

		expect(buttonB.selected).toBe(true);
	});
});


/* ============================================================
   Multi-select (checkbox)
   ============================================================ */

describe('nldd-toggle-button-group – multi-select (checkbox)', () => {
	let el: NLDDToggleButtonGroup;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('allows multiple buttons to be selected simultaneously', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="checkbox" name="filter">
				<nldd-toggle-button value="a" text="A" selected></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B" selected></nldd-toggle-button>
				<nldd-toggle-button value="c" text="C"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		expect(buttons[0].selected).toBe(true);
		expect(buttons[1].selected).toBe(true);
		expect(buttons[2].selected).toBe(false);
	});

	it('does not deselect other buttons on change', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="checkbox" name="filter">
				<nldd-toggle-button value="a" text="A" selected></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		const [buttonA, buttonB] = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');

		buttonB.selected = true;
		buttonB.dispatchEvent(new CustomEvent('change', {
			detail: { selected: true, value: 'b' },
			bubbles: true,
		}));
		await waitForUpdate(el);

		expect(buttonA.selected).toBe(true);
		expect(buttonB.selected).toBe(true);
	});
});


/* ============================================================
   Toetsenbordnavigatie (radio)
   ============================================================ */

describe('nldd-toggle-button-group – toetsenbordnavigatie', () => {
	let el: NLDDToggleButtonGroup;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('ArrowRight selects first button when nothing is selected', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="nav">
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
				<nldd-toggle-button value="c" text="C"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		expect(buttons[0].selected).toBe(true);
	});

	it('ArrowLeft selects last button when nothing is selected', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="nav">
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
				<nldd-toggle-button value="c" text="C"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }));
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		expect(buttons[2].selected).toBe(true);
	});

	it('ArrowRight selects next button', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="nav">
				<nldd-toggle-button value="a" text="A" selected></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
				<nldd-toggle-button value="c" text="C"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		expect(buttons[0].selected).toBe(false);
		expect(buttons[1].selected).toBe(true);
	});

	it('ArrowLeft selects previous button', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="nav">
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B" selected></nldd-toggle-button>
				<nldd-toggle-button value="c" text="C"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }));
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		expect(buttons[0].selected).toBe(true);
		expect(buttons[1].selected).toBe(false);
	});

	it('wraps around from last to first', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="nav">
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
				<nldd-toggle-button value="c" text="C" selected></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		expect(buttons[0].selected).toBe(true);
		expect(buttons[2].selected).toBe(false);
	});

	it('wraps around from first to last', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="nav">
				<nldd-toggle-button value="a" text="A" selected></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
				<nldd-toggle-button value="c" text="C"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }));
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		expect(buttons[0].selected).toBe(false);
		expect(buttons[2].selected).toBe(true);
	});

	it('skips disabled buttons during keyboard navigation', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="radio" name="nav">
				<nldd-toggle-button value="a" text="A" selected></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B" disabled></nldd-toggle-button>
				<nldd-toggle-button value="c" text="C"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		expect(buttons[2].selected).toBe(true);
	});

	// A consumer that serializes the form in its own `change` listener (htmx, or
	// a plain new FormData(form)) runs before the deselected buttons render, so
	// the group has to commit their value from the handler itself. Without that
	// two buttons of one radio group sit in the form at the same time.
	it('houdt in een radiogroep één waarde in de form tijdens change', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<form>
				<nldd-toggle-button-group type="radio" name="view">
					<nldd-toggle-button value="list" text="Lijst" selected></nldd-toggle-button>
					<nldd-toggle-button value="grid" text="Raster"></nldd-toggle-button>
				</nldd-toggle-button-group>
			</form>
		`);
		await waitForUpdate(el);
		const form = el.querySelector('form') ?? (el as unknown as HTMLFormElement);
		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		let waardenBijChange: FormDataEntryValue[] = [];
		form.addEventListener('change', () => {
			waardenBijChange = new FormData(form as HTMLFormElement).getAll('view');
		});

		buttons[1].selected = true;
		buttons[1].commitFormValue();
		buttons[1].dispatchEvent(new CustomEvent('change', {
			detail: { selected: true, value: 'grid' },
			bubbles: true,
			composed: true,
		}));
		await waitForUpdate(el);

		expect(waardenBijChange).toEqual(['grid']);
	});

	it('does not handle arrow keys for type=checkbox', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="checkbox" name="filter">
				<nldd-toggle-button value="a" text="A" selected></nldd-toggle-button>
				<nldd-toggle-button value="b" text="B"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
		await waitForUpdate(el);

		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		expect(buttons[0].selected).toBe(true);
		expect(buttons[1].selected).toBe(false);
	});

	it('focus() lands on the selected button', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="button" name="toolbar">
				<nldd-toggle-button value="bold" text="Bold"></nldd-toggle-button>
				<nldd-toggle-button value="italic" text="Italic" selected></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);
		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		await waitForUpdate(buttons[1]);
		el.focus();
		expect(deepActiveElement()).toBe(buttons[1].shadowRoot!.querySelector('button.toggle-button'));
	});

	it('focus() falls back to the first enabled button when nothing is selected', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="button" name="toolbar">
				<nldd-toggle-button value="bold" text="Bold" disabled></nldd-toggle-button>
				<nldd-toggle-button value="italic" text="Italic"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);
		const buttons = el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button');
		await waitForUpdate(buttons[1]);
		el.focus();
		expect(deepActiveElement()).toBe(buttons[1].shadowRoot!.querySelector('button.toggle-button'));
	});

	it('leaves an aria-label the consumer put on the group', async () => {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group name="t" aria-label="Opmaak">
				<nldd-toggle-button value="a" text="A"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('aria-label')).toBe('Opmaak');
	});
});

describe('nldd-toggle-button-group – place in the group', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	/** In radio mode the button is the radio; in checkbox mode it renders one. */
	const toggleInput = (button: Element) => button.shadowRoot!.querySelector<HTMLInputElement>('.toggle-button__input') ?? button;

	async function group(type: 'radio' | 'checkbox'): Promise<NLDDToggleButton[]> {
		el = await fixture<NLDDToggleButtonGroup>(`
			<nldd-toggle-button-group type="${type}" name="weergave" accessible-label="Weergave">
				<nldd-toggle-button value="lijst" text="Lijst"></nldd-toggle-button>
				<nldd-toggle-button value="kaart" text="Kaart" selected></nldd-toggle-button>
				<nldd-toggle-button value="tabel" text="Tabel"></nldd-toggle-button>
			</nldd-toggle-button-group>
		`);
		await waitForUpdate(el);
		const buttons = Array.from(el.querySelectorAll<NLDDToggleButton>('nldd-toggle-button'));
		for (const button of buttons) await waitForUpdate(button);
		return buttons;
	}

	it('in radio mode tells each button its place and keeps one stop for Tab', async () => {
		const buttons = await group('radio');

		expect(buttons.map((button) => toggleInput(button).getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
		expect(buttons.map((button) => toggleInput(button).getAttribute('aria-setsize'))).toEqual(['3', '3', '3']);
		expect(buttons.map((button) => toggleInput(button).getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
	});

	it('in radio mode moves the stop for Tab along with the arrow keys', async () => {
		const buttons = await group('radio');
		buttons[1].focus();

		await userEvent.keyboard('{ArrowDown}');
		for (const button of buttons) await waitForUpdate(button);

		expect(buttons.map((button) => toggleInput(button).getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
	});

	it('in checkbox mode leaves every button in the tab order and uncounted', async () => {
		const buttons = await group('checkbox');

		expect(buttons.map((button) => toggleInput(button).hasAttribute('aria-setsize'))).toEqual([false, false, false]);
		expect(buttons.map((button) => toggleInput(button).hasAttribute('tabindex'))).toEqual([false, false, false]);
	});
});
