import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import formCss from '../form/form.css?raw';
import './form-section.js';
import '../form/form.js';
import '../../content/title/title.js';

/** The header wrapper in the shadow root. */
const headerOf = (el: Element) => el.shadowRoot!.querySelector<HTMLElement>('.form-section__header')!;

describe('nldd-form-section', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-form-section></nldd-form-section>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('is no group: it renders no fieldset and takes no role', async () => {
		el = await fixture('<nldd-form-section><nldd-title slot="header" text="Adres" heading-level="2"></nldd-title></nldd-form-section>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('fieldset, legend')).toBeNull();
		expect(el.getAttribute('role')).toBeNull();
	});

	it('shows the header only while something is in its slot', async () => {
		el = await fixture('<nldd-form-section><p>Veld</p></nldd-form-section>');
		await waitForUpdate(el);
		expect(headerOf(el).hidden).toBe(true);
		el.insertAdjacentHTML('afterbegin', '<nldd-title slot="header" text="Adres" heading-level="2"></nldd-title>');
		await waitForUpdate(el);
		expect(headerOf(el).hidden).toBe(false);
		el.querySelector('nldd-title')!.remove();
		await waitForUpdate(el);
		expect(headerOf(el).hidden).toBe(true);
	});

	it('keeps its children in the light DOM, where a form finds their inputs', async () => {
		el = await fixture('<nldd-form-section><input name="a"></nldd-form-section>');
		await waitForUpdate(el);
		expect(el.querySelector('input')!.parentElement).toBe(el);
	});

	it('puts the distances of a form between the header, the fields and the next section', async () => {
		const unloadTokens = loadTokens();
		const style = document.createElement('style');
		style.textContent = formCss;
		document.head.append(style);
		try {
			el = await fixture(`
				<nldd-form novalidate>
					<nldd-form-section>
						<nldd-title slot="header" text="Adres" heading-level="2"></nldd-title>
						<input name="a">
						<input type="hidden" name="skip">
						<input name="b">
					</nldd-form-section>
					<nldd-form-section>
						<input name="c">
					</nldd-form-section>
				</nldd-form>
			`);
			const [first, second] = el.querySelectorAll('nldd-form-section');
			await waitForUpdate(first as HTMLElement);
			const top = (selector: string) => el.querySelector(selector)!.getBoundingClientRect().top;
			const bottom = (selector: string) => el.querySelector(selector)!.getBoundingClientRect().bottom;
			expect(top('[name="a"]') - bottom('nldd-title')).toBe(8);
			// The hidden input has no box, so it adds no gap of its own.
			expect(top('[name="b"]') - bottom('[name="a"]')).toBe(16);
			expect(second.getBoundingClientRect().top - first.getBoundingClientRect().bottom).toBe(24);
		} finally {
			style.remove();
			unloadTokens();
		}
	});
});
