import { describe, it, expect, afterEach, vi } from 'vitest';
// The tokens themselves, because `tile` leans on two of them: the spacer that a
// fixed size resolves to, and the contrast color the glyph flips to.
import '../../../assets/styles/variables.css';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './icon.js';
import type { NLDDIcon } from './icon.js';

describe('nldd-icon', () => {
	let el: NLDDIcon;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture<NLDDIcon>('<nldd-icon></nldd-icon>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('reflects size attribute', async () => {
		el = await fixture<NLDDIcon>('<nldd-icon size="32"></nldd-icon>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('32');
	});

	it('reflects color attribute (functional)', async () => {
		el = await fixture<NLDDIcon>('<nldd-icon color="critical"></nldd-icon>');
		await waitForUpdate(el);
		expect(el.getAttribute('color')).toBe('critical');
	});

	it('reflects color attribute (rijkskleur)', async () => {
		el = await fixture<NLDDIcon>('<nldd-icon color="lintblauw"></nldd-icon>');
		await waitForUpdate(el);
		expect(el.getAttribute('color')).toBe('lintblauw');
	});

	it('paints a custom color, and the SVG fill follows it', async () => {
		el = await fixture<NLDDIcon>('<nldd-icon custom-color="rgb(0, 0, 255)"></nldd-icon>');
		await waitForUpdate(el);
		expect(getComputedStyle(el).color).toBe('rgb(0, 0, 255)');
		const painted = el.shadowRoot!.querySelector('svg [fill="currentColor"], svg path');
		expect(getComputedStyle(painted as Element).fill).toBe('rgb(0, 0, 255)');
	});

	it('a custom color wins over a named one', async () => {
		el = await fixture<NLDDIcon>('<nldd-icon color="critical" custom-color="rgb(0, 128, 0)"></nldd-icon>');
		await waitForUpdate(el);
		expect(getComputedStyle(el).color).toBe('rgb(0, 128, 0)');
	});

	it('defaults size and color to empty (inherit)', async () => {
		el = await fixture<NLDDIcon>('<nldd-icon></nldd-icon>');
		await waitForUpdate(el);
		expect(el.size).toBe('full');
		expect(el.color).toBe('');
	});

	it('inherits parent color, and the SVG fill resolves to it through currentColor', async () => {
		const wrapper = await fixture<HTMLElement>('<div style="color: rgb(255, 0, 0);"><nldd-icon></nldd-icon></div>');
		const icon = wrapper.querySelector('nldd-icon') as NLDDIcon;
		await waitForUpdate(icon);
		// Host inherits the parent color.
		expect(getComputedStyle(icon).color).toBe('rgb(255, 0, 0)');
		// And the SVG paint actually uses it: the icon SVG paints with
		// fill="currentColor", which must resolve through the shadow boundary
		// to the inherited color — not break into the default black.
		const painted = icon.shadowRoot!.querySelector('svg [fill="currentColor"], svg path');
		expect(painted).not.toBeNull();
		expect(getComputedStyle(painted as Element).fill).toBe('rgb(255, 0, 0)');
		cleanup(wrapper);
	});
});

describe('nldd-icon – relative sizes', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const mount = async (attrs: string, wrapper = 'div style="width: 40px; font-size: 12px"'): Promise<HTMLElement> => {
		el = await fixture<HTMLElement>(`<${wrapper}><nldd-icon icon="check" ${attrs}></nldd-icon></${wrapper.split(' ')[0]}>`);
		const icon = el.querySelector('nldd-icon') as HTMLElement;
		await waitForUpdate(icon);
		return icon;
	};

	it('fills the container by default', async () => {
		const icon = await mount('');
		expect(Math.round(icon.getBoundingClientRect().width)).toBe(40);
	});

	it('size="full" names that same default', async () => {
		const icon = await mount('size="full"');
		expect(Math.round(icon.getBoundingClientRect().width)).toBe(40);
	});

	it('size="inherit" follows the surrounding text, and sits on its line', async () => {
		const icon = await mount('size="inherit"');
		expect(Math.round(icon.getBoundingClientRect().width)).toBe(12);
	});

	it('a fixed size still wins over both', async () => {
		// The spacer tokens are not loaded in the test environment, so feed the
		// one this size resolves to.
		const icon = await mount('size="16"', 'div style="width: 40px; --primitives-space-16: 16px"');
		expect(Math.round(icon.getBoundingClientRect().width)).toBe(16);
	});

	// — tile ————————————————————————————————————————————————————————————————

	const tile = 'div style="width: 40px; height: 40px; color: rgb(17, 17, 17)"';

	it('tile: the size measures the tile and the glyph is four fifths of it', async () => {
		const icon = await mount('tile', tile);
		expect(Math.round(icon.getBoundingClientRect().width)).toBe(40);
		expect(Math.round(icon.getBoundingClientRect().height)).toBe(40);
		const glyph = icon.shadowRoot!.querySelector('svg') as SVGElement;
		expect(Math.round(glyph.getBoundingClientRect().width)).toBe(32);
	});

	it('tile: stays square in a container that is not', async () => {
		const icon = await mount('tile', 'div style="width: 200px; height: 120px"');
		const rect = icon.getBoundingClientRect();
		expect(Math.round(rect.width)).toBe(200);
		expect(Math.round(rect.height)).toBe(200);
	});

	it('tile: stays square in a row with a taller neighbor', async () => {
		const row = await fixture<HTMLElement>('<div style="display: flex"><span style="height: 48px"></span><nldd-icon name="house" size="24" tile></nldd-icon></div>');
		const icon = row.querySelector('nldd-icon') as NLDDIcon;
		await waitForUpdate(icon);
		const { width, height } = icon.getBoundingClientRect();
		expect(Math.round(width)).toBe(24);
		expect(Math.round(height)).toBe(24);
		cleanup(row);
	});

	it('tile: sits on the line with its bottom, as an icon without one does', async () => {
		const line = await fixture<HTMLElement>(
			'<div style="font: 16px/1.5 sans-serif"><span>Text <nldd-icon name="house" size="inherit"></nldd-icon> and <nldd-icon name="house" size="inherit" tile></nldd-icon></span></div>'
		);
		const [bare, tiled] = line.querySelectorAll('nldd-icon') as NodeListOf<NLDDIcon>;
		await waitForUpdate(tiled);
		const height = line.getBoundingClientRect().height;
		expect(tiled.getBoundingClientRect().bottom).toBeCloseTo(bare.getBoundingClientRect().bottom, 0);
		bare.remove();
		expect(line.getBoundingClientRect().height).toBe(height);
		cleanup(line);
	});

	it('tile: the color paints the tile, not the glyph', async () => {
		const icon = await mount('tile custom-color="rgb(17, 17, 17)"', tile);
		expect(getComputedStyle(icon).backgroundColor).toBe('rgb(17, 17, 17)');
	});

	it('tile: the glyph takes whatever contrasts with the tile', async () => {
		const onDark = await mount('tile custom-color="rgb(17, 17, 17)"', tile);
		expect(getComputedStyle(onDark.shadowRoot!.querySelector('svg')!).color).toBe('rgb(255, 255, 255)');
		cleanup(el);

		const onLight = await mount('tile custom-color="rgb(238, 238, 238)"', tile);
		expect(getComputedStyle(onLight.shadowRoot!.querySelector('svg')!).color).toBe('rgb(0, 0, 0)');
	});

	it('without tile the color is still the glyph\'s, and nothing is painted', async () => {
		const icon = await mount('custom-color="rgb(17, 17, 17)"', tile);
		expect(getComputedStyle(icon).backgroundColor).toBe('rgba(0, 0, 0, 0)');
		expect(getComputedStyle(icon.shadowRoot!.querySelector('svg')!).color).toBe('rgb(17, 17, 17)');
	});
});

describe('nldd-icon – icon attribute', () => {
	let el: NLDDIcon;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('draws the icon named in icon, not the placeholder', async () => {
		const placeholder = await fixture<NLDDIcon>('<nldd-icon></nldd-icon>');
		await waitForUpdate(placeholder);
		const placeholderSvg = placeholder.shadowRoot!.innerHTML;
		cleanup(placeholder);

		el = await fixture<NLDDIcon>('<nldd-icon icon="heart"></nldd-icon>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('svg')).not.toBeNull();
		expect(el.shadowRoot!.innerHTML).not.toBe(placeholderSvg);
	});

	it('ignores the old name attribute', async () => {
		el = await fixture<NLDDIcon>('<nldd-icon name="heart"></nldd-icon>');
		await waitForUpdate(el);
		expect(el.icon).toBe('circle-dashed');
		expect(el.matches(':state(unknown-icon)')).toBe(false);
	});
});
