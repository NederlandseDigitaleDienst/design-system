import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import './title.js';

describe('nldd-title', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-title></nldd-title>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to size 3', async () => {
		el = await fixture('<nldd-title></nldd-title>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('3');
	});

	it('reflects size attribute', async () => {
		el = await fixture('<nldd-title size="1"></nldd-title>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('1');
	});

	it('renders slotted title content', async () => {
		el = await fixture('<nldd-title><h1>Paginatitel</h1></nldd-title>');
		await waitForUpdate(el);
		expect(el.querySelector('h1')?.textContent?.trim()).toBe('Paginatitel');
		expect(el.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!.assignedElements().length).toBeGreaterThan(0);
	});

	it('renders slotted overline content', async () => {
		el = await fixture('<nldd-title><p slot="overline">Overline</p></nldd-title>');
		await waitForUpdate(el);
		expect(el.querySelector('[slot="overline"]')?.textContent?.trim()).toBe('Overline');
		expect(el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="overline"]')!.assignedElements().length).toBeGreaterThan(0);
	});

	it('renders slotted supporting-text content', async () => {
		el = await fixture('<nldd-title><p slot="supporting-text">Ondertitel</p></nldd-title>');
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('slot[name="supporting-text"]') as HTMLSlotElement;
		expect(slot.assignedElements().map((node) => node.textContent)).toEqual(['Ondertitel']);
	});

	it('renders what is slotted at the end of the title line', async () => {
		el = await fixture('<nldd-title><button slot="end">Actie</button></nldd-title>');
		await waitForUpdate(el);
		expect(el.querySelector('[slot="end"]')?.textContent?.trim()).toBe('Actie');
		expect(el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="end"]')!.assignedElements().length).toBeGreaterThan(0);
	});

	it('color="inherit" follows the surrounding text color, the default does not', async () => {
		// The vitest page does not load variables.css, so define the token the
		// default path resolves against — otherwise both paths would inherit.
		el = await fixture(`
			<div>
				<style>:root { --semantics-content-color: rgb(99, 99, 99); }</style>
				<div style="color: rgb(10, 20, 30);">
					<nldd-title color="inherit"><h2 id="inherit-title">A</h2></nldd-title>
					<nldd-title><h2 id="default-title">B</h2></nldd-title>
				</div>
			</div>
		`);
		const titles = el.querySelectorAll('nldd-title');
		await waitForUpdate(titles[0] as HTMLElement);
		await waitForUpdate(titles[1] as HTMLElement);
		expect(getComputedStyle(el.querySelector('#inherit-title')!).color).toBe('rgb(10, 20, 30)');
		expect(getComputedStyle(el.querySelector('#default-title')!).color).toBe('rgb(99, 99, 99)');
	});

	// getComputedStyle resolves ch to px, so assert the measure is capped and
	// scales with the font rather than checking for the literal '32ch'.
	it('begrenst de regellengte van de kop', async () => {
		el = await fixture('<nldd-title size="2"><h2>Een kop</h2></nldd-title>');
		await waitForUpdate(el);
		const heading = el.querySelector('h2')!;
		const style = getComputedStyle(heading);
		expect(style.maxWidth).not.toBe('none');
		expect(parseFloat(style.maxWidth)).toBeGreaterThan(parseFloat(style.fontSize) * 10);
	});

	it('balanceert de regels van de kop', async () => {
		el = await fixture('<nldd-title><h3>Een kop</h3></nldd-title>');
		await waitForUpdate(el);
		expect(getComputedStyle(el.querySelector('h3')!).textWrap).toBe('balance');
	});
});

describe('nldd-title – text and heading-level', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const text = () => el.shadowRoot!.querySelector('.title__text');

	it('renders text as a paragraph without heading-level', async () => {
		el = await fixture('<nldd-title text="Een grote ondertitel"></nldd-title>');
		await waitForUpdate(el);
		expect(text()?.localName).toBe('p');
		expect(text()?.textContent?.trim()).toBe('Een grote ondertitel');
	});

	it('renders text as the heading heading-level names', async () => {
		el = await fixture('<nldd-title text="Paginatitel" heading-level="2"></nldd-title>');
		await waitForUpdate(el);
		expect(text()?.localName).toBe('h2');
	});

	it('keeps size and heading-level apart', async () => {
		el = await fixture('<nldd-title size="1" text="Paginatitel" heading-level="3"></nldd-title>');
		await waitForUpdate(el);
		expect(text()?.localName).toBe('h3');
		expect(el.getAttribute('size')).toBe('1');
	});

	it('renders a paragraph for a heading-level outside 1–6', async () => {
		el = await fixture('<nldd-title text="Paginatitel" heading-level="7"></nldd-title>');
		await waitForUpdate(el);
		expect(text()?.localName).toBe('p');
	});

	it('lets content in the default slot take the place of text', async () => {
		el = await fixture('<nldd-title text="Tekst"><h1>Slot</h1></nldd-title>');
		await waitForUpdate(el);
		expect(text()).toBeNull();
		expect(el.querySelector('h1')?.textContent).toBe('Slot');
	});

	it('does not let whitespace in the slot hide text', async () => {
		el = await fixture(`<nldd-title text="Tekst">
		</nldd-title>`);
		await waitForUpdate(el);
		expect(text()?.textContent?.trim()).toBe('Tekst');
	});

	it('gives text the same measure, wrapping and color handling as a slotted heading', async () => {
		el = await fixture(`
			<div>
				<style>:root { --semantics-content-color: rgb(99, 99, 99); }</style>
				<div style="color: rgb(10, 20, 30);">
					<nldd-title id="inherit" color="inherit" text="A" heading-level="2"></nldd-title>
					<nldd-title id="default" size="2" text="B" heading-level="2"></nldd-title>
				</div>
			</div>
		`);
		const inherit = el.querySelector('#inherit') as HTMLElement;
		const standard = el.querySelector('#default') as HTMLElement;
		await waitForUpdate(inherit);
		await waitForUpdate(standard);
		const inheritText = getComputedStyle(inherit.shadowRoot!.querySelector('.title__text')!);
		const standardText = getComputedStyle(standard.shadowRoot!.querySelector('.title__text')!);
		expect(inheritText.color).toBe('rgb(10, 20, 30)');
		expect(standardText.color).toBe('rgb(99, 99, 99)');
		expect(standardText.marginTop).toBe('0px');
		expect(standardText.textWrap).toBe('balance');
		expect(parseFloat(standardText.maxWidth)).toBeGreaterThan(parseFloat(standardText.fontSize) * 10);
	});
});

describe('nldd-title – overline and supporting-text', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	const part = (name: string) => el.shadowRoot!.querySelector(`.title__${name}`);

	it('renders overline and supporting-text from their attributes', async () => {
		el = await fixture('<nldd-title text="Begripsbepalingen" overline="Hoofdstuk 1" supporting-text="Ingangsdatum: 1 januari 2024"></nldd-title>');
		await waitForUpdate(el);
		expect(part('overline')?.textContent).toBe('Hoofdstuk 1');
		expect(part('supporting-text')?.textContent).toBe('Ingangsdatum: 1 januari 2024');
	});

	it('orders overline, title and supporting-text from top to bottom', async () => {
		el = await fixture('<nldd-title text="Titel" overline="Boven" supporting-text="Onder"></nldd-title>');
		await waitForUpdate(el);
		const top = (name: string) => part(name)!.getBoundingClientRect().top;
		expect(top('overline')).toBeLessThan(top('text'));
		expect(top('text')).toBeLessThan(top('supporting-text'));
	});

	it('lets a filled slot take the place of each attribute', async () => {
		el = await fixture(`
			<nldd-title overline="Attribuut" supporting-text="Attribuut">
				<span slot="overline">Slot</span>
				<span slot="supporting-text">Slot</span>
			</nldd-title>
		`);
		await waitForUpdate(el);
		expect(part('overline')).toBeNull();
		expect(part('supporting-text')).toBeNull();
	});

	it('warns once per page about the old subtitle slot', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture('<nldd-title text="Titel"><p slot="subtitle">Oud</p></nldd-title>');
		await waitForUpdate(el);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain('slot="supporting-text"');
		cleanup(el);

		el = await fixture('<nldd-title text="Titel"><p slot="subtitle">Oud</p></nldd-title>');
		await waitForUpdate(el);
		expect(warn).toHaveBeenCalledTimes(1);
	});
});

describe('nldd-title – custom-size', () => {
	let el: HTMLElement;
	let removeTokens: () => void;

	beforeEach(() => {
		removeTokens = loadTokens();
	});

	afterEach(() => {
		if (el) cleanup(el);
		removeTokens();
		vi.restoreAllMocks();
	});

	const title = async (attrs: string): Promise<HTMLElement> => {
		el = await fixture(`<nldd-title text="Mijn Dienst" ${attrs}></nldd-title>`);
		await waitForUpdate(el);
		return el;
	};

	const textStyle = () => getComputedStyle(el.shadowRoot!.querySelector('.title__text')!);

	it('writes each breakpoint value into its own variable', async () => {
		await title('sm-custom-size="120px" md-custom-size="160px" lg-custom-size="200px"');
		expect(el.style.getPropertyValue('--_title-sm-custom-size')).toBe('120px');
		expect(el.style.getPropertyValue('--_title-md-custom-size')).toBe('160px');
		expect(el.style.getPropertyValue('--_title-lg-custom-size')).toBe('200px');
		for (const breakpoint of ['sm', 'md', 'lg']) {
			expect(el.hasAttribute(`data-${breakpoint}-custom-size`)).toBe(true);
		}
	});

	it('ignores a custom-size without a breakpoint', async () => {
		await title('custom-size="200px"');
		expect(el.hasAttribute('data-lg-custom-size')).toBe(false);
		expect(textStyle().fontSize).not.toBe('200px');
	});

	it('leaves a breakpoint without a value to the scale', async () => {
		await title('lg-custom-size="200px"');
		expect(el.hasAttribute('data-lg-custom-size')).toBe(true);
		expect(el.hasAttribute('data-sm-custom-size')).toBe(false);
		expect(el.style.getPropertyValue('--_title-sm-custom-size')).toBe('');
	});

	it('takes the typography of size 1, whatever size says', async () => {
		await title('size="6" sm-custom-size="200px" md-custom-size="200px" lg-custom-size="200px"');
		const { fontWeight, fontFamily } = textStyle();
		cleanup(el);
		await title('size="1"');
		expect(fontWeight).toBe(textStyle().fontWeight);
		expect(fontFamily).toBe(textStyle().fontFamily);
	});

	it('never goes below size 1, and says so', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await title('size="1"');
		const sizeOne = textStyle().fontSize;
		cleanup(el);
		await title('sm-custom-size="10px" md-custom-size="10px" lg-custom-size="10px"');
		expect(textStyle().fontSize).toBe(sizeOne);
		expect(warn.mock.calls.some((call: unknown[]) => String(call[0]).includes('smaller than size 1'))).toBe(true);
	});

	it('keeps the scale for a value that is not a length, and says so', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await title('lg-custom-size="huge"');
		expect(el.hasAttribute('data-lg-custom-size')).toBe(false);
		expect(warn.mock.calls.some((call: unknown[]) => String(call[0]).includes('"huge" is not a size the title can use'))).toBe(true);
	});

	it('takes no size keyword, which cannot go inside the floor', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		for (const value of ['larger', 'xx-large', 'inherit']) {
			await title(`lg-custom-size="${value}"`);
			expect(el.hasAttribute('data-lg-custom-size'), value).toBe(false);
			cleanup(el);
		}
		el = undefined as unknown as HTMLElement;
		expect(warn.mock.calls.filter((call: unknown[]) => String(call[0]).includes('is not a size the title can use'))).toHaveLength(3);
	});

	it('takes a percentage or em and still keeps the size 1 floor', async () => {
		await title('lg-custom-size="1%" md-custom-size="1%" sm-custom-size="0.1em"');
		expect(el.hasAttribute('data-lg-custom-size')).toBe(true);
		const custom = textStyle().fontSize;
		cleanup(el);
		await title('size="1"');
		expect(custom).toBe(textStyle().fontSize);
	});

	it('goes back to the scale when the attribute is removed', async () => {
		await title('sm-custom-size="200px" md-custom-size="200px" lg-custom-size="200px"');
		expect(textStyle().fontSize).toBe('200px');
		for (const breakpoint of ['sm', 'md', 'lg']) el.removeAttribute(`${breakpoint}-custom-size`);
		await waitForUpdate(el);
		expect(el.hasAttribute('data-lg-custom-size')).toBe(false);
		expect(textStyle().fontSize).not.toBe('200px');
	});
});
