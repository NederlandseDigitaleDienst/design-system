import { describe, it, expect, afterEach } from 'vitest';
// The token the measure comes from lives there, not in the test environment.
import '../../../assets/styles/variables.css';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text.js';

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
