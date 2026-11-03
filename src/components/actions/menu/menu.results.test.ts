import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './menu.js';
import '../../inputs/combo-box/combo-box.js';
import '../../inputs/token-field/token-field.js';

/** What the listbox's live region says once the options have settled. */
async function announced(field: HTMLElement): Promise<string> {
	const menu = field.querySelector('nldd-menu')!;
	await new Promise((resolve) => setTimeout(resolve, 700));
	return menu.shadowRoot!.querySelector('.menu__live-region')!.textContent ?? '';
}

async function typeInto(field: HTMLElement, value: string): Promise<void> {
	const input = field.shadowRoot!.querySelector('input')!;
	input.focus();
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	await waitForUpdate(field);
}

const options = `
	<nldd-menu>
		<nldd-menu-item value="nl" text="Nederland"></nldd-menu-item>
		<nldd-menu-item value="no" text="Noorwegen"></nldd-menu-item>
		<nldd-menu-item value="de" text="Duitsland"></nldd-menu-item>
	</nldd-menu>
`;

describe('nldd-menu – the number of options, for a screen reader', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('says how many options a combobox shows after typing, and the empty text at none', async () => {
		el = await fixture(`<nldd-combo-box accessible-label="Land">${options}</nldd-combo-box>`);
		await waitForUpdate(el);
		// The menu matches on "contains", so an n is in all three.
		await typeInto(el, 'n');
		expect(await announced(el)).toBe('3 resultaten');
		await typeInto(el, 'land');
		expect(await announced(el)).toBe('2 resultaten');
		await typeInto(el, 'ned');
		expect(await announced(el)).toBe('1 resultaat');
		await typeInto(el, 'xyz');
		expect(await announced(el)).toBe('Geen opties beschikbaar');
	});

	it('says how many options a token field shows after typing', async () => {
		el = await fixture(`<nldd-token-field accessible-label="Landen">${options}</nldd-token-field>`);
		await waitForUpdate(el);
		await typeInto(el, 'land');
		expect(await announced(el)).toBe('2 resultaten');
	});

	it('says how many options came in after the keystroke, as a server sends them', async () => {
		el = await fixture('<nldd-combo-box accessible-label="Land" no-filter><nldd-menu></nldd-menu></nldd-combo-box>');
		await waitForUpdate(el);
		await typeInto(el, 'ne');
		const menu = el.querySelector('nldd-menu')!;
		menu.innerHTML = '<nldd-menu-item value="nl" text="Nederland"></nldd-menu-item><nldd-menu-item value="np" text="Nepal"></nldd-menu-item>';
		expect(await announced(el)).toBe('2 resultaten');
	});

	it('says only the number it lands on while typing on', async () => {
		el = await fixture(`<nldd-combo-box accessible-label="Land">${options}</nldd-combo-box>`);
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		const region = menu.shadowRoot!.querySelector('.menu__live-region')!;
		const heard: string[] = [];
		new MutationObserver(() => { if (region.textContent) heard.push(region.textContent); })
			.observe(region, { childList: true, characterData: true, subtree: true });
		await typeInto(el, 'n');
		await typeInto(el, 'ne');
		await typeInto(el, 'ned');
		await new Promise((resolve) => setTimeout(resolve, 700));
		expect(heard).toEqual(['1 resultaat']);
	});
});
