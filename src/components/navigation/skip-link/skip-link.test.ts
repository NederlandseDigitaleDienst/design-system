import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { page } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './skip-link.js';

describe('nldd-skip-link', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-skip-link></nldd-skip-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
		expect(el).toBeInstanceOf(customElements.get('nldd-skip-link'));
	});

	it('toont default tekst uit i18n', async () => {
		el = await fixture('<nldd-skip-link></nldd-skip-link>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.skip-link__control');
		expect(button!.textContent!.trim()).toBe('Sla over');
	});

	it('toont custom tekst via text attribuut', async () => {
		el = await fixture('<nldd-skip-link text="Ga naar inhoud"></nldd-skip-link>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.skip-link__control');
		expect(button!.textContent!.trim()).toBe('Ga naar inhoud');
	});

	it('rendert een button element zonder href', async () => {
		el = await fixture('<nldd-skip-link></nldd-skip-link>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.skip-link__control');
		expect(button!.tagName).toBe('BUTTON');
	});

	it('rendert een anchor element met href', async () => {
		el = await fixture('<nldd-skip-link href="#main"></nldd-skip-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('.skip-link__control');
		expect(anchor!.tagName).toBe('A');
		expect(anchor!.getAttribute('href')).toBe('#main');
	});

	it('rendert button wanneer href een javascript: URI is', async () => {
		el = await fixture('<nldd-skip-link href="javascript:void(0)"></nldd-skip-link>');
		await waitForUpdate(el);
		const control = el.shadowRoot!.querySelector('.skip-link__control');
		expect(control!.tagName).toBe('BUTTON');
	});

	it('rendert button wanneer href een javascript:alert URI is', async () => {
		el = await fixture('<nldd-skip-link href="javascript:alert(1)"></nldd-skip-link>');
		await waitForUpdate(el);
		const control = el.shadowRoot!.querySelector('.skip-link__control');
		expect(control!.tagName).toBe('BUTTON');
	});

	it('focust volgende sibling bij klik zonder href', async () => {
		el = await fixture('<div><nldd-skip-link></nldd-skip-link><main tabindex="-1">Content</main></div>');
		const skipLink = el.querySelector('nldd-skip-link')!;
		await waitForUpdate(skipLink);
		const btn = skipLink.shadowRoot!.querySelector('button') as HTMLButtonElement;
		btn.click();
		expect(document.activeElement).toBe(el.querySelector('main'));
	});
});

/* WCAG 1.4.10 (Reflow) and 1.4.4 (Resize text): at 320 CSS px the page may not
   scroll sideways, not even at 200% text size. The skip link is on every page,
   and while it was hidden with opacity alone it kept the full width of its
   label, which counts for the page. The label here is long enough to run past
   320px in any font, since a test document loads neither the tokens nor
   RijksSans. */
describe('nldd-skip-link op 320 px', () => {
	const TEXT = 'Ga direct naar de hoofdinhoud van deze pagina en sla de navigatie over';
	let el: HTMLElement;
	let eigen: { width: number; height: number };

	const layouts: Record<string, string> = {
		'een host over de volle breedte': `<div><nldd-skip-link text="${TEXT}"></nldd-skip-link><main tabindex="-1">x</main></div>`,
		'een host met een marge ernaast': `<div style="margin-left: 250px"><nldd-skip-link text="${TEXT}"></nldd-skip-link><main tabindex="-1">x</main></div>`,
		'een lege host in een flex-rij': `<div style="display: flex"><nldd-skip-link text="${TEXT}"></nldd-skip-link><main tabindex="-1">x</main></div>`,
	};

	beforeEach(async () => {
		eigen = { width: window.innerWidth, height: window.innerHeight };
		await page.viewport(320, 800);
	});

	afterEach(async () => {
		if (el) cleanup(el);
		await page.viewport(eigen.width, eigen.height);
	});

	for (const [naam, html] of Object.entries(layouts)) {
		it(`${naam}: verborgen maakt de pagina niet breder`, async () => {
			el = await fixture(html);
			await waitForUpdate(el.querySelector('nldd-skip-link') as HTMLElement);
			expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
		});
	}

	it('gefocust past het label binnen het scherm', async () => {
		el = await fixture(layouts['een host over de volle breedte']);
		const link = el.querySelector('nldd-skip-link') as HTMLElement;
		await waitForUpdate(link);
		const control = link.shadowRoot!.querySelector('.skip-link__control') as HTMLElement;
		control.focus();
		await waitForUpdate(link);

		// The label's own right edge, not the block's: the block can stay within
		// the host while the text runs past it.
		expect(control.getBoundingClientRect().right).toBeLessThanOrEqual(320);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
	});
});
