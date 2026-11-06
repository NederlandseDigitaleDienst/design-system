import { describe, it, expect, afterEach, beforeAll, afterAll, beforeEach } from 'vitest';
// The token the measure comes from lives there, not in the test environment.
import '../../../assets/styles/variables.css';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import './text.js';
import '../title/title.js';
import '../rich-text/rich-text.js';
import richTextCss from '../rich-text/rich-text.css?raw';

describe('nldd-text', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-text>Tekst</nldd-text>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	// The defaults are the ones the tokens already call default, so writing them
	// out would put attributes on every element that say nothing.
	it('reflecteert de standaardwaarden niet als attribuut', async () => {
		el = await fixture('<nldd-text>Tekst</nldd-text>');
		await waitForUpdate(el);
		expect(el.hasAttribute('size')).toBe(false);
		expect(el.hasAttribute('weight')).toBe(false);
		expect(el.hasAttribute('line-height')).toBe(false);
		expect(el.hasAttribute('color')).toBe(false);
		expect(el.hasAttribute('horizontal-alignment')).toBe(false);
	});

	it('reflecteert wat je wel zet', async () => {
		el = await fixture(
			'<nldd-text size="lg" weight="bold" line-height="loose" color="secondary" horizontal-alignment="center">Tekst</nldd-text>',
		);
		await waitForUpdate(el);
		const text = el as HTMLElement & {
			size: string;
			weight: string;
			lineHeight: string;
			color: string;
			horizontalAlignment: string;
		};
		expect(text.size).toBe('lg');
		expect(text.weight).toBe('bold');
		expect(text.lineHeight).toBe('loose');
		expect(text.color).toBe('secondary');
		expect(text.horizontalAlignment).toBe('center');
	});

	it('zet de tekst in de default slot', async () => {
		el = await fixture('<nldd-text>Toegewezen aan Yara</nldd-text>');
		await waitForUpdate(el);
		expect(el.shadowRoot?.querySelector('slot')).not.toBeNull();
		expect(el.textContent?.trim()).toBe('Toegewezen aan Yara');
	});

	it('a line stops at the measure, the same characters at every size', async () => {
		el = await fixture('<div style="width: 2000px"><nldd-text>Een regel</nldd-text><nldd-text size="sm">Een regel</nldd-text></div>');
		await waitForUpdate(el);
		const [md, sm] = Array.from(el.querySelectorAll('nldd-text'));
		// 40em against the size each one sets, so the px differ and the em do not.
		expect(Math.round(md.getBoundingClientRect().width)).toBe(720);
		expect(Math.round(sm.getBoundingClientRect().width)).toBe(640);
	});

	// pretty keeps a single word off the last line. It is inherited, so the
	// slotted text takes it from the host.
	it('wraps the slotted text with text-wrap: pretty', async () => {
		el = await fixture('<nldd-text><span>Toegewezen aan Yara</span></nldd-text>');
		await waitForUpdate(el);
		expect(getComputedStyle(el.querySelector('span')!).textWrapStyle).toBe('pretty');
	});


	it('styles inline elements like nldd-rich-text', async () => {
		el = await fixture('<nldd-text>Zet <code>no-picker</code>, lees <a href="#x">de voorwaarden</a> en let op <mark>dit</mark> en <em>dat</em>.</nldd-text>');
		await waitForUpdate(el);
		const code = getComputedStyle(el.querySelector('code')!);
		expect(code.fontFamily).toMatch(/mono/i);
		expect(code.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		expect(getComputedStyle(el.querySelector('mark')!).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		expect(getComputedStyle(el.querySelector('a')!).textDecorationLine).toBe('underline');
		expect(getComputedStyle(el.querySelector('em')!).fontStyle).toBe('italic');
	});
});

// nldd-text promises its inline elements look as they do in nldd-rich-text.
// The two are written apart (a document stylesheet against ::slotted), so this
// renders the same line in both and compares what the browser computes.
describe('nldd-text – inline elements match nldd-rich-text', () => {
	const line = `Aanvraag <strong>A-1042</strong> is <em>in behandeling</em>. Zet <code>no-picker</code>,
		lees <a href="#">de voorwaarden</a>, let op <mark>de datum</mark>, <q>citaat</q>,
		<a href="#" data-mention>Anouk de Vries</a> en <span data-mention>Bram Jansen</span>.`;
	const elements = ['strong', 'em', 'code', 'a:not([data-mention])', 'mark', 'q', 'a[data-mention]', 'span[data-mention]'];
	const properties = [
		'color', 'font-family', 'font-size', 'font-weight', 'font-style',
		'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'border-top-left-radius', 'box-shadow', 'background-color',
		'text-decoration-line', 'text-underline-offset', 'white-space', 'cursor',
	];
	const pseudoProperties = ['content', 'width', 'height', 'mask-image', 'background-color'];

	let style: HTMLStyleElement;
	let rich: HTMLElement;
	let text: HTMLElement;

	beforeAll(async () => {
		style = document.createElement('style');
		style.textContent = richTextCss;
		document.head.append(style);
		rich = await fixture(`<nldd-rich-text><p>${line}</p></nldd-rich-text>`);
		text = await fixture(`<nldd-text>${line}</nldd-text>`);
	});

	afterAll(() => {
		cleanup(rich);
		cleanup(text);
		style.remove();
	});

	it.each(elements)('%s', (selector) => {
		const a = rich.querySelector(selector)!;
		const b = text.querySelector(selector)!;
		for (const property of properties) {
			expect([property, getComputedStyle(b).getPropertyValue(property)])
				.toEqual([property, getComputedStyle(a).getPropertyValue(property)]);
		}
		for (const pseudo of ['::before', '::after']) {
			for (const property of pseudoProperties) {
				expect([pseudo, property, getComputedStyle(b, pseudo).getPropertyValue(property)])
					.toEqual([pseudo, property, getComputedStyle(a, pseudo).getPropertyValue(property)]);
			}
		}
	});
});

describe('nldd-text – display sizes and custom size', () => {
	let el: HTMLElement;
	let removeTokens: () => void;

	beforeEach(() => {
		removeTokens = loadTokens();
	});

	afterEach(() => {
		if (el) cleanup(el);
		removeTokens();
	});

	const text = async (attrs: string): Promise<HTMLElement> => {
		el = await fixture(`<nldd-text ${attrs}>240</nldd-text>`);
		await waitForUpdate(el);
		return el;
	};

	const titleStyle = async (size: number) => {
		const title = await fixture<HTMLElement>(`<nldd-title size="${size}" text="240" heading-level="2"></nldd-title>`);
		const style = getComputedStyle(title.shadowRoot!.querySelector('.title__text')!);
		const result = { fontSize: style.fontSize, fontWeight: style.fontWeight, fontFamily: style.fontFamily, lineHeight: style.lineHeight };
		cleanup(title);
		return result;
	};

	it.each([1, 3, 6])('takes the typography of title size %i at the same display size', async (size) => {
		const title = await titleStyle(size);
		await text(`size="display-${size}"`);
		const { fontSize, fontWeight, fontFamily, lineHeight } = getComputedStyle(el);
		expect({ fontSize, fontWeight, fontFamily, lineHeight }).toEqual(title);
	});

	it('leaves weight and line-height to the display size', async () => {
		await text('size="display-1"');
		const own = getComputedStyle(el).fontWeight;
		cleanup(el);
		await text('size="display-1" weight="regular" line-height="loose"');
		expect(getComputedStyle(el).fontWeight).toBe(own);
	});

	it('writes each breakpoint value into its own variable', async () => {
		await text('sm-custom-size="120px" md-custom-size="160px" lg-custom-size="200px"');
		expect(el.style.getPropertyValue('--_text-sm-custom-size')).toBe('120px');
		expect(el.style.getPropertyValue('--_text-md-custom-size')).toBe('160px');
		expect(el.style.getPropertyValue('--_text-lg-custom-size')).toBe('200px');
	});

	it('grows past display-1 with the typography of display-1', async () => {
		const display1 = await titleStyle(1);
		await text('sm-custom-size="200px" md-custom-size="200px" lg-custom-size="200px"');
		const style = getComputedStyle(el);
		expect(style.fontSize).toBe('200px');
		expect(style.fontWeight).toBe(display1.fontWeight);
		expect(style.fontFamily).toBe(display1.fontFamily);
	});

	it('never goes below display-1', async () => {
		const display1 = await titleStyle(1);
		await text('sm-custom-size="10px" md-custom-size="10px" lg-custom-size="10px"');
		expect(getComputedStyle(el).fontSize).toBe(display1.fontSize);
		expect(el.matches(':state(custom-size-below-floor)')).toBe(true);
	});

	it('keeps its size for a value that is not a length', async () => {
		await text('lg-custom-size="huge"');
		expect(el.hasAttribute('data-lg-custom-size')).toBe(false);
		expect(el.matches(':state(invalid-custom-size)')).toBe(true);
	});
});
