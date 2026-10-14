import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './visually-hidden.js';

describe('nldd-visually-hidden', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-visually-hidden>Toepassen</nldd-visually-hidden>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('neemt geen ruimte in en laat niets zien', async () => {
		el = await fixture('<div style="width: 300px"><span>Ervoor</span><nldd-visually-hidden>Een lange tekst die niet op het scherm hoort</nldd-visually-hidden><span>Erna</span></div>');
		const hidden = el.querySelector('nldd-visually-hidden') as HTMLElement;
		await waitForUpdate(hidden);
		const box = hidden.getBoundingClientRect();
		expect(box.width).toBeLessThanOrEqual(1);
		expect(box.height).toBeLessThanOrEqual(1);
		expect(getComputedStyle(hidden).clipPath).toBe('inset(50%)');
		expect(el.scrollWidth).toBeLessThanOrEqual(300);
	});

	it('blijft in de toegankelijkheidsboom: niet verborgen en de tekst staat er', async () => {
		el = await fixture('<table><thead><tr><th scope="col"><nldd-visually-hidden>Toepassen</nldd-visually-hidden></th></tr></thead></table>');
		const hidden = el.querySelector('nldd-visually-hidden') as HTMLElement;
		await waitForUpdate(hidden);
		const style = getComputedStyle(hidden);
		expect(style.display).not.toBe('none');
		expect(style.visibility).toBe('visible');
		expect(hidden.hasAttribute('aria-hidden')).toBe(false);
		expect(el.querySelector('th')!.textContent!.trim()).toBe('Toepassen');
	});
});
