import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDSegmentedControl, NLDDSegmentedControlItem } from './segmented-control.js';
import './segmented-control.js';

function radioFixture(selectedValue = 'a'): string {
	return `
		<nldd-segmented-control value="${selectedValue}" name="test">
			<nldd-segmented-control-item value="a" text="Alpha"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="b" text="Beta"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="c" text="Gamma"></nldd-segmented-control-item>
		</nldd-segmented-control>
	`;
}

function getItems(el: NLDDSegmentedControl): NLDDSegmentedControlItem[] {
	return Array.from(el.querySelectorAll('nldd-segmented-control-item'));
}

function getInput(item: NLDDSegmentedControlItem): HTMLInputElement {
	return item.shadowRoot!.querySelector('input')!;
}

describe('nldd-segmented-control', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-segmented-control></nldd-segmented-control>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});
});

describe('nldd-segmented-control-item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-segmented-control-item></nldd-segmented-control-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('is the radio itself in radio mode, without an input of its own', async () => {
		el = await fixture('<nldd-segmented-control-item></nldd-segmented-control-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('radio');
		expect(el.shadowRoot!.querySelector('input')).toBeNull();
	});

	it('renders a native input in checkbox mode', async () => {
		el = await fixture('<nldd-segmented-control-item input-type="checkbox"></nldd-segmented-control-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.type).toBe('checkbox');
		expect(el.hasAttribute('role')).toBe(false);
	});
});


/* ============================================================
   State sync
   ============================================================ */

describe('nldd-segmented-control – state sync', () => {
	let el: NLDDSegmentedControl;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('marks matching item as selected', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('b'));
		await waitForUpdate(el);
		const items = getItems(el);
		expect(items[0].selected).toBe(false);
		expect(items[1].selected).toBe(true);
		expect(items[2].selected).toBe(false);
	});

	it('updates selected when value changes', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('a'));
		await waitForUpdate(el);
		el.value = 'c';
		await waitForUpdate(el);
		const items = getItems(el);
		expect(items[0].selected).toBe(false);
		expect(items[2].selected).toBe(true);
	});

	it('propagates size to items', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control size="sm">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		expect(getItems(el)[0].size).toBe('sm');
	});

	it('disables all items when parent is disabled', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control disabled>
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" text="B"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		getItems(el).forEach(item => expect(item.disabled).toBe(true));
	});

	it('preserves item-level disabled when parent is not disabled', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control>
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" disabled text="B"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		expect(items[0].disabled).toBe(false);
		expect(items[1].disabled).toBe(true);
	});

	it('re-enables group-disabled items when parent disabled is removed', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control disabled>
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" text="B"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		el.disabled = false;
		await waitForUpdate(el);
		getItems(el).forEach(item => expect(item.disabled).toBe(false));
	});

	it('does not re-enable individually disabled items when parent disabled is removed', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control disabled>
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" disabled text="B"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		el.disabled = false;
		await waitForUpdate(el);
		const items = getItems(el);
		expect(items[0].disabled).toBe(false);
		expect(items[1].disabled).toBe(true);
	});

	it('propagates variant to items', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control variant="icon">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		expect(getItems(el)[0].variant).toBe('icon');
	});

	it('forwards name as groupName to items', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control name="view" type="checkbox">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		expect(getItems(el)[0].groupName).toBe('view');
		expect(getInput(getItems(el)[0]).name).toBe('view');
	});
});


describe('nldd-segmented-control – radio change', () => {
	let el: NLDDSegmentedControl;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('fires change with value detail when item changes', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('a'));
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		getItems(el)[1].click();
		expect(detail?.value).toBe('b');
	});

	it('does not fire change when already selected item is clicked', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('a'));
		await waitForUpdate(el);
		let fired = false;
		el.addEventListener('change', () => { fired = true; });
		getItems(el)[0].click();
		expect(fired).toBe(false);
	});
});


/* ============================================================
   Checkbox change event
   ============================================================ */

describe('nldd-segmented-control – checkbox change', () => {
	let el: NLDDSegmentedControl;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('fires change with values array when item is checked', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control type="checkbox">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" text="B"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		const input = getInput(getItems(el)[0]);
		input.checked = true;
		input.dispatchEvent(new Event('change', { bubbles: true }));
		expect(detail?.values).toContain('a');
	});

	it('removes value from values when item is unchecked', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control type="checkbox">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" text="B"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		(el as NLDDSegmentedControl).values = ['a', 'b'];
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		const input = getInput(getItems(el)[0]);
		input.checked = false;
		input.dispatchEvent(new Event('change', { bubbles: true }));
		expect(detail?.values).not.toContain('a');
		expect(detail?.values).toContain('b');
	});
});


describe('nldd-segmented-control – keyboard navigation', () => {
	let el: NLDDSegmentedControl;

	afterEach(() => {
		if (el) cleanup(el);
	});

	function pressKey(key: string) {
		el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
	}

	it('ArrowRight does nothing in checkbox mode', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control type="checkbox">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" text="B"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		(el as NLDDSegmentedControl).values = ['a'];
		await waitForUpdate(el);
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		await waitForUpdate(el);
		const items = getItems(el as NLDDSegmentedControl);
		expect(items[0].selected).toBe(true);
		expect(items[1].selected).toBe(false);
	});

	it('ArrowRight selects next item', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('a'));
		await waitForUpdate(el);
		pressKey('ArrowRight');
		await waitForUpdate(el);
		expect(el.value).toBe('b');
	});

	it('ArrowLeft selects previous item', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('b'));
		await waitForUpdate(el);
		pressKey('ArrowLeft');
		await waitForUpdate(el);
		expect(el.value).toBe('a');
	});

	it('ArrowRight wraps from last to first', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('c'));
		await waitForUpdate(el);
		pressKey('ArrowRight');
		await waitForUpdate(el);
		expect(el.value).toBe('a');
	});

	it('Home selects first item', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('c'));
		await waitForUpdate(el);
		pressKey('Home');
		await waitForUpdate(el);
		expect(el.value).toBe('a');
	});

	it('End selects last item', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('a'));
		await waitForUpdate(el);
		pressKey('End');
		await waitForUpdate(el);
		expect(el.value).toBe('c');
	});

	it('the space bar selects the option it is pressed on', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('a'));
		await waitForUpdate(el);
		const item = getItems(el)[2];
		item.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(el.value).toBe('c');
	});

	it('the space bar leaves a disabled option alone', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control value="a">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" text="B" disabled></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		const item = getItems(el)[1];
		item.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, composed: true }));
		item.click();
		await waitForUpdate(el);
		expect(el.value).toBe('a');
	});

	it('Enter submits the form the group belongs to', async () => {
		const form = document.createElement('form');
		document.body.appendChild(form);
		el = await fixture<NLDDSegmentedControl>(radioFixture('a'));
		form.appendChild(el);
		form.appendChild(document.createElement('button'));
		await waitForUpdate(el);

		const submitted = vi.fn((e: Event) => e.preventDefault());
		form.addEventListener('submit', submitted);
		getItems(el)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));

		expect(submitted).toHaveBeenCalledTimes(1);
		form.remove();
	});
});


/* ============================================================
   ARIA
   ============================================================ */

describe('nldd-segmented-control – ARIA', () => {
	let el: NLDDSegmentedControl;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('has role="radiogroup" for radio type', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('a'));
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('radiogroup');
	});

	it('has role="group" for checkbox type', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control type="checkbox">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('group');
	});

	it('announces the checked state on the item that is the radio', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('b'));
		await waitForUpdate(el);
		const items = getItems(el);
		for (const item of items) await waitForUpdate(item);
		expect(items.map((item) => item.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
	});
});


/* ============================================================
   Accessibility
   ============================================================ */

describe('nldd-segmented-control – accessibility', () => {
	let el: NLDDSegmentedControl;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('warns when no accessible name is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control>
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('accessible name')
		);
	});

	it('does not warn when accessible-label is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control accessible-label="Weergave">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it('sets aria-label on host from accessible-label', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control accessible-label="Weergave">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('aria-label')).toBe('Weergave');
	});
});


/* ============================================================
   Tooltip
   ============================================================ */

describe('nldd-segmented-control-item – tooltip', () => {
	let el: NLDDSegmentedControlItem | HTMLFormElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('wraps in nldd-tooltip when variant is icon', async () => {
		el = await fixture<NLDDSegmentedControlItem>(`
			<nldd-segmented-control-item variant="icon" text="Zoom in" icon="zoom-in"></nldd-segmented-control-item>
		`);
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip');
		expect(tooltip).not.toBeNull();
		expect(tooltip!.getAttribute('text')).toBe('Zoom in');
	});

	it('shows the tooltip on focus in radio mode, where the focus is on the item', async () => {
		el = await fixture<NLDDSegmentedControlItem>(`
			<nldd-segmented-control-item variant="icon" text="Zoom in" icon="zoom-in"></nldd-segmented-control-item>
		`);
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip') as HTMLElement & { updateComplete: Promise<boolean> };
		const bubble = tooltip.shadowRoot!.querySelector('.tooltip') as HTMLElement;

		(el as NLDDSegmentedControlItem).focus();
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

	it('does not wrap in nldd-tooltip when variant is text', async () => {
		el = await fixture<NLDDSegmentedControlItem>(`
			<nldd-segmented-control-item variant="text" text="Label"></nldd-segmented-control-item>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-tooltip')).toBeNull();
	});

	it('does not wrap in nldd-tooltip when variant is icon-and-text', async () => {
		el = await fixture<NLDDSegmentedControlItem>(`
			<nldd-segmented-control-item variant="icon-and-text" text="Vet" icon="bold"></nldd-segmented-control-item>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-tooltip')).toBeNull();
	});

	it('renders both icon and text and keeps the text accessible for variant icon-and-text', async () => {
		el = await fixture<NLDDSegmentedControlItem>(`
			<nldd-segmented-control-item variant="icon-and-text" text="Vet" icon="bold"></nldd-segmented-control-item>
		`);
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.segmented-control__item-icon nldd-icon');
		const text = el.shadowRoot!.querySelector('.segmented-control__item-text')!;
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('name')).toBe('bold');
		expect(text.textContent?.trim()).toBe('Vet');
		// The visible text stays readable, and the item carries the name it is
		// announced by: it is the radio.
		expect(text.getAttribute('aria-hidden')).toBeNull();
		expect(el.getAttribute('aria-label')).toBe('Vet');
	});

	it('shows the icon-placeholder for variant icon without an icon', async () => {
		el = await fixture<NLDDSegmentedControlItem>(`
			<nldd-segmented-control-item variant="icon" text="Vet"></nldd-segmented-control-item>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon[name="icon-placeholder"]')).not.toBeNull();
	});

	it('icon-and-text with text but no icon shows the placeholder', async () => {
		el = await fixture<NLDDSegmentedControlItem>(`
			<nldd-segmented-control-item variant="icon-and-text" text="Vet"></nldd-segmented-control-item>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon[name="icon-placeholder"]')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.segmented-control__item-text')!.textContent?.trim()).toBe('Vet');
	});

	it('icon-and-text without an icon or text shows the placeholder', async () => {
		el = await fixture<NLDDSegmentedControlItem>(`
			<nldd-segmented-control-item variant="icon-and-text"></nldd-segmented-control-item>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon[name="icon-placeholder"]')).not.toBeNull();
	});

	it('participates in FormData via form-associated API (radio)', async () => {
		const form = await fixture<HTMLFormElement>(`
			<form>
				<nldd-segmented-control value="b" name="opt" accessible-label="Optie">
					<nldd-segmented-control-item value="a" text="Alpha"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="b" text="Beta"></nldd-segmented-control-item>
				</nldd-segmented-control>
			</form>
		`);
		el = form;
		const sc = form.querySelector('nldd-segmented-control')!;
		await waitForUpdate(sc);
		expect(new FormData(form).get('opt')).toBe('b');
	});

	it('resets to the HTML-declared initial value when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>(`
			<form>
				<nldd-segmented-control value="a" name="opt" accessible-label="Optie">
					<nldd-segmented-control-item value="a" text="Alpha"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="b" text="Beta"></nldd-segmented-control-item>
				</nldd-segmented-control>
			</form>
		`);
		el = form;
		const sc = form.querySelector<NLDDSegmentedControl>('nldd-segmented-control')!;
		await waitForUpdate(sc);
		sc.value = 'b';
		await waitForUpdate(sc);
		form.reset();
		expect(sc.value).toBe('a');
	});

});

describe('nldd-segmented-control – focus()', () => {
	let el: NLDDSegmentedControl;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('focus() lands on the selected item', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control value="b">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" text="B"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		await waitForUpdate(items[1]);
		el.focus();
		expect(deepActiveElement()).toBe(items[1]);
	});

	it('focus() falls back to the first enabled item when nothing is selected', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control>
				<nldd-segmented-control-item value="a" text="A" disabled></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" text="B"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		await waitForUpdate(items[1]);
		el.focus();
		expect(deepActiveElement()).toBe(items[1]);
	});

	it('leaves an aria-label the consumer put on the group', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control aria-label="Weergave">
				<nldd-segmented-control-item value="a" text="A"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('aria-label')).toBe('Weergave');
	});
});

describe('nldd-segmented-control – place in the group', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	async function settle(control: NLDDSegmentedControl): Promise<NLDDSegmentedControlItem[]> {
		await waitForUpdate(control);
		const items = getItems(control);
		for (const item of items) await waitForUpdate(item);
		return items;
	}

	it('in radio mode tells each item its place and keeps one stop for Tab', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('b'));
		const items = await settle(el as NLDDSegmentedControl);

		expect(items.map((item) => item.getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
		expect(items.map((item) => item.getAttribute('aria-setsize'))).toEqual(['3', '3', '3']);
		expect(items.map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
	});

	it('moves the stop for Tab to the item that gets selected', async () => {
		el = await fixture<NLDDSegmentedControl>(radioFixture('b'));
		const control = el as NLDDSegmentedControl;
		await settle(control);

		control.value = 'c';
		const items = await settle(control);

		expect(items.map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
	});

	it('in checkbox mode leaves every item in the tab order and uncounted', async () => {
		el = await fixture<NLDDSegmentedControl>(`
			<nldd-segmented-control type="checkbox" name="opmaak">
				<nldd-segmented-control-item value="a" text="Alpha"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="b" text="Beta"></nldd-segmented-control-item>
			</nldd-segmented-control>
		`);
		const items = await settle(el as NLDDSegmentedControl);

		expect(items.map((item) => getInput(item).hasAttribute('aria-setsize'))).toEqual([false, false]);
		expect(items.map((item) => getInput(item).hasAttribute('tabindex'))).toEqual([false, false]);
	});
});
