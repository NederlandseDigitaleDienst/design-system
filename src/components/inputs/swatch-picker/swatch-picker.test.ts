import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './swatch-picker.js';
import type { NLDDSwatchPicker, NLDDSwatchPickerItem } from './swatch-picker.js';

describe('nldd-swatch-picker', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const picker = (attrs = '') => `
		<nldd-swatch-picker accessible-label="Kleur" ${attrs}>
			<nldd-swatch-picker-item color="rood" value="rood"></nldd-swatch-picker-item>
			<nldd-swatch-picker-item custom-color="#7a1f3d" text="Huisstijl" value="huisstijl"></nldd-swatch-picker-item>
			<nldd-swatch-picker-item image="/eiken.jpg" image-srcset="/eiken.jpg 1x, /eiken@2x.jpg 2x" text="Eiken" value="eiken"></nldd-swatch-picker-item>
		</nldd-swatch-picker>
	`;

	const settle = async () => {
		const group = el.matches('nldd-swatch-picker') ? el : el.querySelector('nldd-swatch-picker')!;
		await waitForUpdate(group as HTMLElement);
		for (const item of group.querySelectorAll('nldd-swatch-picker-item')) await waitForUpdate(item as HTMLElement);
	};

	const items = () => [...el.querySelectorAll('nldd-swatch-picker-item')] as NLDDSwatchPickerItem[];

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-swatch-picker></nldd-swatch-picker>');
		expect(el.shadowRoot).not.toBeNull();
	});

	it('is een radiogroep met ARIA-radio\'s die hun plek kennen', async () => {
		el = await fixture(picker('value="huisstijl"'));
		await settle();
		expect(el.getAttribute('role')).toBe('radiogroup');
		expect(el.getAttribute('aria-label')).toBe('Kleur');
		expect(items().map((item) => item.getAttribute('role'))).toEqual(['radio', 'radio', 'radio']);
		expect(items().map((item) => item.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
		expect(items().map((item) => item.getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
		expect(items()[0].getAttribute('aria-setsize')).toBe('3');
		expect(items().map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
	});

	it('noemt een categoriekleur naar de vertaling, en de rest naar text', async () => {
		el = await fixture(picker());
		await settle();
		expect(items().map((item) => item.getAttribute('aria-label'))).toEqual(['Rood', 'Huisstijl', 'Eiken']);
		const tooltip = items()[0].shadowRoot!.querySelector('nldd-tooltip')!;
		expect(tooltip.getAttribute('text')).toBe('Rood');
	});

	it('neemt een vertaling over voor de naam van een categoriekleur', async () => {
		el = await fixture(picker());
		await settle();
		items()[0].translations = { 'components.swatch-picker-item.rood-text': 'Red' };
		await waitForUpdate(items()[0]);
		expect(items()[0].getAttribute('aria-label')).toBe('Red');
	});

	it('zet een custom-color op het staaltje en een afbeelding met srcset erin', async () => {
		el = await fixture(picker());
		await settle();
		expect(items()[1].style.getPropertyValue('--_swatch-picker-item-custom-color')).toBe('#7a1f3d');
		const img = items()[2].shadowRoot!.querySelector('img')!;
		expect(img.getAttribute('src')).toBe('/eiken.jpg');
		expect(img.getAttribute('srcset')).toBe('/eiken.jpg 1x, /eiken@2x.jpg 2x');
		expect(img.getAttribute('alt')).toBe('');
	});

	it('kiest met een klik en meldt change', async () => {
		el = await fixture(picker());
		await settle();
		const onChange = vi.fn();
		el.addEventListener('change', onChange);
		items()[2].click();
		await settle();
		expect((el as NLDDSwatchPicker).value).toBe('eiken');
		expect(items()[2].selected).toBe(true);
		expect(onChange).toHaveBeenCalledOnce();
		expect(onChange.mock.calls[0][0].detail).toEqual({ value: 'eiken' });
	});

	it('kiest met de pijltjes en slaat een uitgeschakeld staaltje over', async () => {
		el = await fixture(picker('value="rood"'));
		await settle();
		items()[1].disabled = true;
		await settle();
		items()[0].focus();
		items()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		await settle();
		expect((el as NLDDSwatchPicker).value).toBe('eiken');
		expect(document.activeElement).toBe(items()[2]);
	});

	it('doet niets bij een klik als de groep uitgeschakeld is', async () => {
		el = await fixture(picker('value="rood" disabled'));
		await settle();
		expect(items().every((item) => item.disabled)).toBe(true);
		items()[1].click();
		await settle();
		expect((el as NLDDSwatchPicker).value).toBe('rood');
	});

	it('gaat mee met een formulier en zet zich terug bij reset', async () => {
		el = await fixture(`<form>${picker('name="kleur" value="rood"')}</form>`);
		await settle();
		const form = el as HTMLFormElement;
		items()[1].click();
		await settle();
		expect(new FormData(form).get('kleur')).toBe('huisstijl');
		form.reset();
		await settle();
		expect((el.querySelector('nldd-swatch-picker') as NLDDSwatchPicker).value).toBe('rood');
	});

	it('is ongeldig zonder keuze als hij required is', async () => {
		el = await fixture(`<form>${picker('name="kleur" required')}</form>`);
		await settle();
		expect((el as HTMLFormElement).checkValidity()).toBe(false);
		items()[0].click();
		await settle();
		expect((el as HTMLFormElement).checkValidity()).toBe(true);
	});

	it('geeft de focus aan het gekozen staaltje', async () => {
		el = await fixture(picker('value="eiken"'));
		await settle();
		(el as NLDDSwatchPicker).focus();
		expect(document.activeElement).toBe(items()[2]);
	});

	it('zet zijn size op elk staaltje', async () => {
		el = await fixture(picker('size="sm"'));
		await settle();
		expect(items().map((item) => item.size)).toEqual(['sm', 'sm', 'sm']);
		expect(items().map((item) => item.getAttribute('size'))).toEqual(['sm', 'sm', 'sm']);
	});
	it('houdt de naam na een klik met de muis tot de muis eraf gaat', async () => {
		el = await fixture(picker());
		await settle();
		const item = items()[0];
		const tooltip = item.shadowRoot!.querySelector('nldd-tooltip') as HTMLElement & { open: boolean };
		item.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true }));
		item.click();
		expect(tooltip.open).toBe(true);
		item.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
		expect(tooltip.open).toBe(false);
	});

	it('toont de naam na een tik even en verbergt hem daarna', async () => {
		el = await fixture(picker());
		await settle();
		vi.useFakeTimers();
		try {
			const item = items()[1];
			const tooltip = item.shadowRoot!.querySelector('nldd-tooltip') as HTMLElement & { open: boolean };
			item.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true }));
			item.click();
			expect(tooltip.open).toBe(true);
			vi.advanceTimersByTime(1499);
			expect(tooltip.open).toBe(true);
			vi.advanceTimersByTime(1);
			expect(tooltip.open).toBe(false);
		} finally {
			vi.useRealTimers();
		}
	});

	it('laat de naam na een klik los bij scrollen', async () => {
		el = await fixture(picker());
		await settle();
		const item = items()[0];
		const tooltip = item.shadowRoot!.querySelector('nldd-tooltip') as HTMLElement & { open: boolean };
		item.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true }));
		item.click();
		expect(tooltip.open).toBe(true);
		document.dispatchEvent(new Event('scroll'));
		expect(tooltip.open).toBe(false);
	});

	it('laat een klik op de naam door naar de kleur eronder', async () => {
		el = await fixture(picker());
		await settle();
		const tooltip = items()[0].shadowRoot!.querySelector('nldd-tooltip')!;
		const popover = tooltip.shadowRoot!.querySelector('.tooltip')!;
		expect(getComputedStyle(popover).pointerEvents).toBe('none');
	});

	it('sluit de naam van de vorige kleur als je een andere kiest', async () => {
		el = await fixture(picker());
		await settle();
		vi.useFakeTimers();
		try {
			const [first, second] = items();
			const tooltipOf = (item: NLDDSwatchPickerItem) =>
				item.shadowRoot!.querySelector('nldd-tooltip') as HTMLElement & { open: boolean };
			first.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true }));
			first.click();
			second.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true }));
			second.click();
			expect(tooltipOf(first).open).toBe(false);
			expect(tooltipOf(second).open).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});
});
