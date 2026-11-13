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

	it('has no size of its own by default, and writes none to the DOM', async () => {
		el = await fixture('<nldd-title></nldd-title>');
		await waitForUpdate(el);
		expect((el as unknown as { size?: string }).size).toBeUndefined();
		expect(el.hasAttribute('size')).toBe(false);
	});

	it('reflects size attribute', async () => {
		el = await fixture('<nldd-title size="display-1"></nldd-title>');
		await waitForUpdate(el);
		expect((el as unknown as { size?: string }).size).toBe('display-1');
		expect(el.getAttribute('size')).toBe('display-1');
	});

	it('hyphenates only long words, for the text and a slotted title alike', async () => {
		el = await fixture('<div><nldd-title id="text" text="Overheidsinformatie"></nldd-title><nldd-title id="slotted"><h1>Overheidsinformatie</h1></nldd-title></div>');
		await waitForUpdate(el);
		const own = el.querySelector('#text')!.shadowRoot!.querySelector('.title__text')!;
		const slotted = el.querySelector('#slotted h1')!;
		for (const node of [own, slotted]) {
			const style = getComputedStyle(node);
			expect(style.hyphens).toBe('auto');
			expect(style.getPropertyValue('hyphenate-limit-chars')).toBe('12 5 5');
		}
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

	it('follows the context, not the CSS color around it', async () => {
		// The vitest page does not load variables.css, so define the token the
		// default path resolves against — otherwise both paths would inherit.
		el = await fixture(`
			<div>
				<style>:root { --semantics-content-color: rgb(99, 99, 99); --context-content-color: var(--semantics-content-color); }</style>
				<div style="color: rgb(10, 20, 30);">
					<nldd-title style="--context-content-color: rgb(1, 2, 3);"><h2 id="context-title">A</h2></nldd-title>
					<nldd-title><h2 id="default-title">B</h2></nldd-title>
				</div>
			</div>
		`);
		const titles = el.querySelectorAll('nldd-title');
		await waitForUpdate(titles[0] as HTMLElement);
		await waitForUpdate(titles[1] as HTMLElement);
		expect(getComputedStyle(el.querySelector('#context-title')!).color).toBe('rgb(1, 2, 3)');
		expect(getComputedStyle(el.querySelector('#default-title')!).color).toBe('rgb(99, 99, 99)');
	});

	// getComputedStyle resolves ch to px, so assert the measure is capped and
	// scales with the font rather than checking for the literal '32ch'.
	it('begrenst de regellengte van de kop', async () => {
		el = await fixture('<nldd-title size="display-2"><h2>Een kop</h2></nldd-title>');
		await waitForUpdate(el);
		const heading = el.querySelector('h2')!;
		const style = getComputedStyle(heading);
		expect(style.maxWidth).not.toBe('none');
		expect(parseFloat(style.maxWidth)).toBeGreaterThan(parseFloat(style.fontSize) * 10);
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
		el = await fixture('<nldd-title size="display-1" text="Paginatitel" heading-level="3"></nldd-title>');
		await waitForUpdate(el);
		expect(text()?.localName).toBe('h3');
		expect(el.getAttribute('size')).toBe('display-1');
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
				<style>:root { --semantics-content-color: rgb(99, 99, 99); --context-content-color: var(--semantics-content-color); }</style>
				<div style="color: rgb(10, 20, 30);">
					<nldd-title id="context" style="--context-content-color: rgb(1, 2, 3);" text="A" heading-level="2"></nldd-title>
					<nldd-title id="default" size="display-2" text="B" heading-level="2"></nldd-title>
				</div>
			</div>
		`);
		const context = el.querySelector('#context') as HTMLElement;
		const standard = el.querySelector('#default') as HTMLElement;
		await waitForUpdate(context);
		await waitForUpdate(standard);
		const contextText = getComputedStyle(context.shadowRoot!.querySelector('.title__text')!);
		const standardText = getComputedStyle(standard.shadowRoot!.querySelector('.title__text')!);
		expect(contextText.color).toBe('rgb(1, 2, 3)');
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
		el = await fixture(`<nldd-title text="Mijn Dienst" heading-level="1" ${attrs}></nldd-title>`);
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

	it('takes the typography of display-1, whatever size says', async () => {
		await title('size="display-6" sm-custom-size="200px" md-custom-size="200px" lg-custom-size="200px"');
		const { fontWeight, fontFamily } = textStyle();
		cleanup(el);
		await title('size="display-1"');
		expect(fontWeight).toBe(textStyle().fontWeight);
		expect(fontFamily).toBe(textStyle().fontFamily);
	});

	it('never goes below display-1', async () => {
		await title('size="display-1"');
		const sizeOne = textStyle().fontSize;
		cleanup(el);
		await title('sm-custom-size="10px" md-custom-size="10px" lg-custom-size="10px"');
		expect(textStyle().fontSize).toBe(sizeOne);
		expect(el.matches(':state(custom-size-below-floor)')).toBe(true);
	});

	it('keeps the scale for a value that is not a length', async () => {
		await title('lg-custom-size="huge"');
		expect(el.hasAttribute('data-lg-custom-size')).toBe(false);
		expect(el.matches(':state(invalid-custom-size)')).toBe(true);
	});

	it('takes no size keyword, which cannot go inside the floor', async () => {
		for (const value of ['larger', 'xx-large', 'inherit']) {
			await title(`lg-custom-size="${value}"`);
			expect(el.hasAttribute('data-lg-custom-size'), value).toBe(false);
			expect(el.matches(':state(invalid-custom-size)')).toBe(true);
			cleanup(el);
		}
		el = undefined as unknown as HTMLElement;
	});

	it('takes a percentage or em and still keeps the display-1 floor', async () => {
		await title('lg-custom-size="1%" md-custom-size="1%" sm-custom-size="0.1em"');
		expect(el.hasAttribute('data-lg-custom-size')).toBe(true);
		const custom = textStyle().fontSize;
		cleanup(el);
		await title('size="display-1"');
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

describe('nldd-title – size from heading-level', () => {
	let el: HTMLElement;
	let removeTokens: () => void;

	beforeEach(() => {
		removeTokens = loadTokens();
	});

	afterEach(() => {
		if (el) cleanup(el);
		removeTokens();
	});

	const fontSize = async (attrs: string): Promise<number> => {
		el = await fixture(`<nldd-title text="Mijn Dienst" ${attrs}></nldd-title>`);
		await waitForUpdate(el);
		const size = parseFloat(getComputedStyle(el.shadowRoot!.querySelector('.title__text')!).fontSize);
		cleanup(el);
		return size;
	};

	it('takes the display size of its heading-level', async () => {
		const sizes: number[] = [];
		for (const level of [1, 2, 3, 4, 5, 6]) {
			const size = await fontSize(`heading-level="${level}"`);
			expect(size, `h${level}`).toBe(await fontSize(`heading-level="3" size="display-${level}"`));
			sizes.push(size);
		}
		expect([...sizes].sort((a, b) => b - a)).toEqual(sizes);
		expect(new Set(sizes).size).toBe(6);
	});

	it('is body text without a level, whatever its size', async () => {
		const body = await fontSize('');
		expect(body).toBe(await fontSize('size="display-1"'));
		expect(body).toBe(await fontSize('sm-custom-size="80px" md-custom-size="80px" lg-custom-size="80px"'));
		expect(body).toBeLessThan(await fontSize('heading-level="3"'));
		el = await fixture('<nldd-title text="Mijn Dienst"></nldd-title>');
		expect(el.shadowRoot!.querySelector('.title__text')!.tagName).toBe('P');
	});

	it('lets size win over heading-level', async () => {
		expect(await fontSize('heading-level="1" size="display-5"')).toBe(await fontSize('heading-level="5"'));
		expect(await fontSize('heading-level="1" size="display-3"')).toBe(await fontSize('heading-level="3"'));
	});

	it('follows heading-level when size holds a value from before display-n', async () => {
		expect(await fontSize('heading-level="2" size="5"')).toBe(await fontSize('heading-level="2"'));
	});

	it('sizes the overline and supporting text by size, not by heading-level, when both are set', async () => {
		const sizes = async (attrs: string) => {
			el = await fixture(`<nldd-title text="Mijn Dienst" overline="Team Uitvoering" supporting-text="Aanvraag A-1042" ${attrs}></nldd-title>`);
			await waitForUpdate(el);
			const font = (selector: string) => getComputedStyle(el.shadowRoot!.querySelector(selector)!).fontSize;
			const result = { overline: font('.title__overline'), supporting: font('.title__supporting-text') };
			cleanup(el);
			return result;
		};
		expect(await sizes('heading-level="1" size="display-6"')).toEqual(await sizes('heading-level="6"'));
	});

	it('takes its level from a heading in the default slot', async () => {
		el = await fixture('<nldd-title><h2>Mijn Dienst</h2></nldd-title>');
		await waitForUpdate(el);
		expect(el.getAttribute('data-level')).toBe('2');
		const slotted = parseFloat(getComputedStyle(el.querySelector('h2')!).fontSize);
		cleanup(el);
		expect(slotted).toBe(await fontSize('heading-level="2"'));
	});

	it('lets heading-level win over the slotted heading, and drops the level with the heading', async () => {
		el = await fixture('<nldd-title heading-level="4"><h2>Mijn Dienst</h2></nldd-title>');
		await waitForUpdate(el);
		expect(el.getAttribute('data-level')).toBe('4');
		el.removeAttribute('heading-level');
		el.querySelector('h2')!.replaceWith(document.createTextNode('Mijn Dienst'));
		await waitForUpdate(el);
		expect(el.hasAttribute('data-level')).toBe(false);
	});
});
