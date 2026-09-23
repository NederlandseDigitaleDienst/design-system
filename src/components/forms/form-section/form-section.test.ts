import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup } from '../../../test-utils.js';
import './form-section.js';
import type { NLDDFormSection } from './form-section.js';

/**
 * NLDDFormSection extends HTMLElement (not Lit), so waitForUpdate does not cover
 * its connectedCallback DOM mutation: that runs synchronously on connect, and the
 * MutationObserver callback (for late children) is a microtask. Use awaitMicrotask
 * for "wait for the observer".
 */
const awaitMicrotask = () => new Promise(resolve => setTimeout(resolve, 0));

describe('nldd-form-section', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-form-section></nldd-form-section>');
		// Light DOM: no shadowRoot, but a rendered <fieldset>.
		expect(el.shadowRoot).toBeNull();
		expect(el.querySelector('fieldset.form-section')).not.toBeNull();
	});

	it('rendert fieldset + legend bij text', async () => {
		el = await fixture('<nldd-form-section text="Persoonsgegevens"></nldd-form-section>');
		const fieldset = el.querySelector('fieldset.form-section');
		expect(fieldset).not.toBeNull();
		const legend = el.querySelector<HTMLLegendElement>('legend.form-section__header');
		expect(legend?.textContent).toContain('Persoonsgegevens');
		expect(legend?.hidden).toBe(false);
	});

	it('legend is hidden zonder text en zonder supporting-text', async () => {
		el = await fixture('<nldd-form-section></nldd-form-section>');
		const legend = el.querySelector<HTMLLegendElement>('legend.form-section__header')!;
		expect(legend).not.toBeNull();
		// No content, so hidden and .form-section__main counts as first-child
		// en z'n margin-top collapseert.
		expect(legend.hidden).toBe(true);
		expect(legend.textContent).toBe('');
	});

	it('rendert supporting-text als <span> binnen legend', async () => {
		el = await fixture('<nldd-form-section text="Persoonsgegevens" supporting-text="Vul je gegevens in."></nldd-form-section>');
		const legend = el.querySelector('legend.form-section__header')!;
		const supportingText = legend.querySelector('.form-section__supporting-text');
		// The supporting text has to sit inside the legend so a screen reader reads it as part of the group label
		expect(supportingText).not.toBeNull();
		expect(supportingText?.textContent).toContain('Vul je gegevens in.');
	});

	it('rendert legend met enkel supporting-text als text leeg is', async () => {
		// Edge case: supporting text only. Render a legend anyway so a screen reader
		// gets a group label.
		el = await fixture('<nldd-form-section supporting-text="Beschrijving"></nldd-form-section>');
		const legend = el.querySelector<HTMLLegendElement>('legend.form-section__header')!;
		expect(legend).not.toBeNull();
		expect(legend.hidden).toBe(false);
		expect(legend.querySelector('.form-section__title')).toBeNull();
		expect(legend.querySelector('.form-section__supporting-text')?.textContent).toContain('Beschrijving');
	});

	it('migreert children naar .form-section__main', async () => {
		el = await fixture('<nldd-form-section text="Group"><div data-testid="child">Inhoud</div></nldd-form-section>');
		const main = el.querySelector('.form-section__main')!;
		const child = main.querySelector('[data-testid="child"]');
		expect(child).not.toBeNull();
		expect(child?.textContent).toBe('Inhoud');
	});

	it('legend is direct child van fieldset (vereist door SR a11y)', async () => {
		el = await fixture('<nldd-form-section text="Persoonsgegevens"></nldd-form-section>');
		const fieldset = el.querySelector('fieldset.form-section')!;
		const legend = fieldset.querySelector('legend.form-section__header')!;
		// HTML spec plus screen reader requirement: <legend> has to be a direct child of <fieldset>
		expect(legend.parentElement).toBe(fieldset);
		expect(fieldset.firstElementChild).toBe(legend);
	});

	it('title én supporting text staan samen IN dezelfde legend', async () => {
		el = await fixture('<nldd-form-section text="Persoonsgegevens" supporting-text="Vul je gegevens in."></nldd-form-section>');
		const legend = el.querySelector('legend.form-section__header')!;
		const title = legend.querySelector('.form-section__title');
		const supportingText = legend.querySelector('.form-section__supporting-text');
		// Both have to sit inside one legend so a screen reader reads them together as the group label
		expect(title?.textContent).toContain('Persoonsgegevens');
		expect(supportingText?.textContent).toContain('Vul je gegevens in.');
	});

	it('attribute-wijziging re-rendert legend', async () => {
		el = await fixture('<nldd-form-section text="Oud"></nldd-form-section>');
		expect(el.querySelector('.form-section__title')?.textContent).toBe('Oud');

		(el as NLDDFormSection).text = 'Nieuw';
		expect(el.querySelector('.form-section__title')?.textContent).toBe('Nieuw');
	});

	it('dynamisch toegevoegde children landen in .form-section__main', async () => {
		el = await fixture('<nldd-form-section></nldd-form-section>');
		const main = el.querySelector('.form-section__main')!;
		expect(main.children.length).toBe(0);

		const late = document.createElement('div');
		late.dataset.testid = 'late';
		el.appendChild(late);

		// MutationObserver fires async (microtask)
		await awaitMicrotask();

		expect(main.querySelector('[data-testid="late"]')).not.toBeNull();
	});
});
