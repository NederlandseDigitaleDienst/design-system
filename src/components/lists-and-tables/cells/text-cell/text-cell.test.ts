import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, adoptedCss } from '../../../../test-utils.js';
import './text-cell.js';

describe('nldd-text-cell', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-text-cell></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to md size', async () => {
		el = await fixture('<nldd-text-cell></nldd-text-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { size: string }).size).toBe('md');
		expect(el.hasAttribute('size')).toBe(false);
	});

	it('reflects size attribute', async () => {
		el = await fixture('<nldd-text-cell size="sm"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('sm');
	});

	it('defaults to the content color', async () => {
		el = await fixture('<nldd-text-cell></nldd-text-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { color: string }).color).toBe('content');
		expect(el.hasAttribute('color')).toBe(false);
	});

	it('reflects color attribute', async () => {
		el = await fixture('<nldd-text-cell color="secondary"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('color')).toBe('secondary');
	});

	it('defaults to full width', async () => {
		el = await fixture('<nldd-text-cell></nldd-text-cell>');
		await waitForUpdate(el);
		// The default (full) is kept out of the DOM; the property is the source of truth.
		expect((el as unknown as { width: string }).width).toBe('full');
		expect(el.hasAttribute('width')).toBe(false);
	});

	it('reflects width attribute', async () => {
		el = await fixture('<nldd-text-cell width="fit-content"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('fit-content');
	});

	it('sets inline width style for explicit CSS length', async () => {
		el = await fixture('<nldd-text-cell width="120px"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_text-cell-width')).toBe('120px');
	});

	it('sets --_text-cell-min-width custom property', async () => {
		el = await fixture('<nldd-text-cell min-width="80px"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_text-cell-min-width')).toBe('80px');
	});

	it('sets --_text-cell-max-width custom property', async () => {
		el = await fixture('<nldd-text-cell max-width="200px"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_text-cell-max-width')).toBe('200px');
	});

	it('sets --_text-cell-min-height custom property', async () => {
		el = await fixture('<nldd-text-cell min-height="44px"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_text-cell-min-height')).toBe('44px');
	});

	it('accepts CSS length units other than px', async () => {
		el = await fixture('<nldd-text-cell min-width="5rem"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_text-cell-min-width')).toBe('5rem');
	});

	// A custom length is written at runtime, but into a stylesheet the shadow
	// root adopts rather than a <style> element: the CSSOM is not what a CSP
	// judges, so this path needs no 'unsafe-inline' either.
	it('adopts a @container rule for a custom hide-below length', async () => {
		el = await fixture('<nldd-text-cell hide-below="320px"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('max-width: 320px');
		expect(adoptedCss(el)).toContain('display: none');
		expect(el.shadowRoot!.querySelector('style')).toBeNull();
	});

	it('adopts a @container rule for a custom hide-above length', async () => {
		el = await fixture('<nldd-text-cell hide-above="480px"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('min-width: 480px');
		expect(el.shadowRoot!.querySelector('style')).toBeNull();
	});

	it('drops the adopted rule again when the attribute goes away', async () => {
		el = await fixture('<nldd-text-cell hide-below="320px"></nldd-text-cell>');
		await waitForUpdate(el);
		el.removeAttribute('hide-below');
		await waitForUpdate(el);
		expect(adoptedCss(el)).not.toContain('max-width: 320px');
	});

	// A named breakpoint is static CSS in the adopted stylesheet rather than an
	// injected <style>: that is what lets a consumer keep 'unsafe-inline' out of
	// its style-src.
	it('resolves a named breakpoint for hide-below (lg → max-width 1007px)', async () => {
		el = await fixture('<nldd-text-cell hide-below="lg"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('max-width: 1007px');
	});

	it('resolves a named breakpoint for hide-below (md → max-width 640px)', async () => {
		el = await fixture('<nldd-text-cell hide-below="md"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('max-width: 640px');
	});

	it('resolves a named breakpoint for hide-above (md → min-width 1008px)', async () => {
		el = await fixture('<nldd-text-cell hide-above="md"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('min-width: 1008px');
	});

	it('injects no <style> for a named breakpoint', async () => {
		el = await fixture('<nldd-text-cell hide-below="md"></nldd-text-cell>');
		await waitForUpdate(el);
		const injected = Array.from(el.shadowRoot!.querySelectorAll('style')).find((s) =>
			s.textContent?.includes('@container'),
		);
		expect(injected).toBeUndefined();
	});

	it('scopes the static rules to the cells-container', async () => {
		el = await fixture('<nldd-text-cell hide-below="md"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('cells-container');
	});

	it('hides below md inside a narrow cells-container', async () => {
		el = await fixture(
			'<div style="container-type: inline-size; container-name: cells-container; width: 320px;">'
			+ '<nldd-text-cell hide-below="md" text="Test"></nldd-text-cell></div>',
		);
		const cell = el.querySelector('nldd-text-cell')!;
		await waitForUpdate(cell);
		expect(getComputedStyle(cell).display).toBe('none');
	});

	it('stays visible from md up inside a wide cells-container', async () => {
		el = await fixture(
			'<div style="container-type: inline-size; container-name: cells-container; width: 800px;">'
			+ '<nldd-text-cell hide-below="md" text="Test"></nldd-text-cell></div>',
		);
		const cell = el.querySelector('nldd-text-cell')!;
		await waitForUpdate(cell);
		expect(getComputedStyle(cell).display).not.toBe('none');
	});

	// The static sheet is adopted whatever the attribute says, so what proves the
	// open edge is a no-op is the cell staying visible where md would hide it.
	it('treats hide-below="sm" as a no-op (nothing below sm)', async () => {
		el = await fixture(
			'<div style="container-type: inline-size; container-name: cells-container; width: 320px;">'
			+ '<nldd-text-cell hide-below="sm" text="Test"></nldd-text-cell></div>',
		);
		const cell = el.querySelector('nldd-text-cell')!;
		await waitForUpdate(cell);
		expect(getComputedStyle(cell).display).not.toBe('none');
	});

	it('hides below a custom length inside a narrower cells-container', async () => {
		el = await fixture(
			'<div style="container-type: inline-size; container-name: cells-container; width: 320px;">'
			+ '<nldd-text-cell hide-below="480px" text="Test"></nldd-text-cell></div>',
		);
		const cell = el.querySelector('nldd-text-cell')!;
		await waitForUpdate(cell);
		expect(getComputedStyle(cell).display).toBe('none');
	});

	it('stays visible above a custom length', async () => {
		el = await fixture(
			'<div style="container-type: inline-size; container-name: cells-container; width: 800px;">'
			+ '<nldd-text-cell hide-below="480px" text="Test"></nldd-text-cell></div>',
		);
		const cell = el.querySelector('nldd-text-cell')!;
		await waitForUpdate(cell);
		expect(getComputedStyle(cell).display).not.toBe('none');
	});

	it('defaults to left horizontal alignment', async () => {
		el = await fixture('<nldd-text-cell></nldd-text-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { horizontalAlignment: string }).horizontalAlignment).toBe('left');
		expect(el.hasAttribute('horizontal-alignment')).toBe(false);
	});

	it('reflects horizontal-alignment attribute', async () => {
		el = await fixture('<nldd-text-cell horizontal-alignment="right"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('horizontal-alignment')).toBe('right');
	});

	it('defaults to center vertical alignment', async () => {
		el = await fixture('<nldd-text-cell></nldd-text-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { verticalAlignment: string }).verticalAlignment).toBe('center');
		expect(el.hasAttribute('vertical-alignment')).toBe(false);
	});

	it('reflects vertical-alignment top', async () => {
		el = await fixture('<nldd-text-cell vertical-alignment="top"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('vertical-alignment')).toBe('top');
	});

	it('reflects vertical-alignment bottom', async () => {
		el = await fixture('<nldd-text-cell vertical-alignment="bottom"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('vertical-alignment')).toBe('bottom');
	});

	it('renders text in shadow DOM', async () => {
		el = await fixture('<nldd-text-cell text="Hallo"></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text');
		expect(p).not.toBeNull();
		expect(p!.textContent?.trim()).toBe('Hallo');
	});

	it('renders overline in shadow DOM', async () => {
		el = await fixture('<nldd-text-cell overline="Overline"></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__overline');
		expect(p).not.toBeNull();
		expect(p!.textContent?.trim()).toBe('Overline');
	});

	it('renders supporting-text in shadow DOM', async () => {
		el = await fixture('<nldd-text-cell supporting-text="Supporting"></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__supporting-text');
		expect(p).not.toBeNull();
		expect(p!.textContent?.trim()).toBe('Supporting');
	});

	it('hides text wrapper when text is empty and no slotted content', async () => {
		el = await fixture('<nldd-text-cell></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text') as HTMLElement;
		expect(p).not.toBeNull();
		expect(p.hasAttribute('hidden')).toBe(true);
	});

	it('hides overline wrapper when overline is empty and no slotted content', async () => {
		el = await fixture('<nldd-text-cell></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__overline') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(true);
	});

	it('hides supporting-text wrapper when empty and no slotted content', async () => {
		el = await fixture('<nldd-text-cell></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__supporting-text') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(true);
	});

	// — Slot fallback —

	it('shows wrapper when content is slotted into default slot', async () => {
		el = await fixture('<nldd-text-cell><nldd-tag>Nieuw</nldd-tag></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(false);
	});

	it('shows wrapper when content is slotted into overline slot', async () => {
		el = await fixture('<nldd-text-cell><span slot="overline">Custom <em>overline</em></span></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__overline') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(false);
	});

	it('shows wrapper when content is slotted into supporting-text slot', async () => {
		el = await fixture('<nldd-text-cell><span slot="supporting-text">Custom <em>support</em></span></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__supporting-text') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(false);
	});

	it('ignores whitespace-only slotted text for visibility', async () => {
		el = await fixture('<nldd-text-cell>   \n\t  </nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(true);
	});

	it('attribute renders as fallback when slot is empty', async () => {
		el = await fixture('<nldd-text-cell text="Fallback"></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text') as HTMLElement;
		expect(p).not.toBeNull();
		// Fallback is rendered as a sibling of the slot inside the wrapper —
		// not inside the slot — so that whitespace-only slot assignments don't
		// suppress it.
		expect(p.textContent?.trim()).toBe('Fallback');
		const slot = p.querySelector('slot:not([name])') as HTMLSlotElement;
		expect(slot.assignedNodes().length).toBe(0);
	});

	it('whitespace-only slot assignment does not suppress attribute fallback', async () => {
		// Mimics the self-closing custom-element trap: trailing whitespace
		// becomes a default-slot text node, which would normally hide the slot's
		// fallback content. The fallback-as-sibling pattern keeps it visible.
		el = await fixture('<nldd-text-cell text="Visible">   \n\t  </nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(false);
		expect(p.textContent?.trim()).toBe('Visible');
	});

	it('slotted content takes precedence over attribute for visibility', async () => {
		el = await fixture('<nldd-text-cell text="Attribute text"><span>Slotted text</span></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text') as HTMLElement;
		const slot = p.querySelector('slot:not([name])') as HTMLSlotElement;
		expect(p.hasAttribute('hidden')).toBe(false);
		expect(slot.assignedNodes().length).toBeGreaterThan(0);
	});

	it('updates visibility when slotted content is added dynamically', async () => {
		el = await fixture('<nldd-text-cell></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(true);

		const span = document.createElement('span');
		span.textContent = 'Late slot';
		el.appendChild(span);
		await waitForUpdate(el);
		expect(p.hasAttribute('hidden')).toBe(false);
	});

	it('renders **bold** markers as <b> elements', async () => {
		el = await fixture('<nldd-text-cell text="Hello **world**"></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text');
		expect(p).not.toBeNull();
		expect(p!.querySelector('b')?.textContent).toBe('world');
		expect(p!.textContent?.trim()).toBe('Hello world');
	});

	it('renders unbalanced ** as plain text', async () => {
		el = await fixture('<nldd-text-cell text="Hello **world"></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text');
		expect(p!.querySelector('b')).toBeNull();
		expect(p!.textContent?.trim()).toBe('Hello **world');
	});

	it('renders plain text without bold when no ** markers', async () => {
		el = await fixture('<nldd-text-cell text="No bold here"></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text');
		expect(p!.querySelector('b')).toBeNull();
		expect(p!.textContent?.trim()).toBe('No bold here');
	});

	// — query / query-mark-mode —

	it('query: predictive mode bolds the remainder of text (default)', async () => {
		el = await fixture('<nldd-text-cell text="Aardappelen" query="aa"></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text');
		const bold = p!.querySelector('b');
		expect(bold?.textContent).toBe('rdappelen');
		expect(p!.textContent?.trim()).toBe('Aardappelen');
	});

	it('query: match mode bolds the query substring', async () => {
		el = await fixture('<nldd-text-cell text="Aardappelen" query="aa" query-mark-mode="match"></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text');
		const bold = p!.querySelector('b');
		expect(bold?.textContent).toBe('Aa');
		expect(p!.textContent?.trim()).toBe('Aardappelen');
	});

	it('query applies across text, overline and supporting-text', async () => {
		el = await fixture('<nldd-text-cell overline="Groente" text="Aardappelen" supporting-text="appelsoort" query="app"></nldd-text-cell>');
		await waitForUpdate(el);
		const overline = el.shadowRoot!.querySelector('.text-cell__overline');
		const text = el.shadowRoot!.querySelector('.text-cell__text');
		const supporting = el.shadowRoot!.querySelector('.text-cell__supporting-text');
		// overline "Groente" does not contain "app" → no marking
		expect(overline!.querySelector('b')).toBeNull();
		// text "Aardappelen" contains "app" → predictive mode bolds remainder
		expect(text!.querySelectorAll('b').length).toBeGreaterThan(0);
		// supporting-text "appelsoort" contains "app" → bolding applied
		expect(supporting!.querySelectorAll('b').length).toBeGreaterThan(0);
	});

	it('query: empty query leaves text untouched (falls back to **bold** rendering)', async () => {
		el = await fixture('<nldd-text-cell text="Hello **world**" query=""></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text');
		expect(p!.querySelector('b')?.textContent).toBe('world');
	});

	it('query: query not present in text renders plain (no bold)', async () => {
		el = await fixture('<nldd-text-cell text="Aardappelen" query="zz"></nldd-text-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.text-cell__text');
		expect(p!.querySelector('b')).toBeNull();
	});

	it('query-mark-mode defaults to predictive', async () => {
		el = await fixture('<nldd-text-cell text="Aardappelen" query="aa"></nldd-text-cell>');
		await waitForUpdate(el);
		expect((el as HTMLElement & { queryMarkMode: string }).queryMarkMode).toBe('predictive');
	});

	it('query: does not modify slotted content', async () => {
		el = await fixture('<nldd-text-cell query="aa"><span>Aardappelen</span></nldd-text-cell>');
		await waitForUpdate(el);
		const span = el.querySelector('span');
		// Slotted content lives in light DOM, untouched by renderQueryMark.
		expect(span!.querySelector('b')).toBeNull();
		expect(span!.textContent).toBe('Aardappelen');
	});

	// The open edges resolve to nothing: the attribute is there but nothing is
	// ever hidden. That looks like a working value, so
	// het zegt het één keer hardop.
	it('waarschuwt bij een hide-below die nooit iets verbergt', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const el = await fixture('<nldd-text-cell hide-below="sm" text="Test"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('never hides anything'));
		warn.mockRestore();
		cleanup(el);
	});

	it('waarschuwt niet bij een hide-below die wel werkt', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const el = await fixture('<nldd-text-cell hide-below="md" text="Test"></nldd-text-cell>');
		await waitForUpdate(el);
		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
		cleanup(el);
	});
});

describe('nldd-text-cell fit-content in een krappe rij', () => {
	// fit-content betekent min(max-content, max(min-content, beschikbaar)). Met
	// flex-shrink: 0 held the cell at its full content width, however narrow the row
	// ook werd, en duwde hij alles erachter het beeld uit.
	it('krimpt mee en duwt de cel erachter niet weg', async () => {
		const el = await fixture(`
			<div style="display: flex; width: 200px;">
				<nldd-text-cell width="fit-content" text="Cloud en platform technologie"></nldd-text-cell>
				<nldd-cell id="achteraan" style="width: 40px; flex-shrink: 0;"></nldd-cell>
			</div>
		`);
		await waitForUpdate(el);
		const cel = el.querySelector('nldd-text-cell')!;
		const achteraan = el.querySelector('#achteraan')!;
		expect(cel.getBoundingClientRect().width).toBeLessThanOrEqual(160);
		expect(Math.round(achteraan.getBoundingClientRect().right))
			.toBeLessThanOrEqual(Math.round(el.getBoundingClientRect().right) + 1);
		cleanup(el);
	});

	// Even a word longer than the row does not run out of it: the text has
	// overflow-wrap: anywhere, dus hij breekt desnoods midden in het woord.
	it('loopt ook met een lang woord niet buiten de rij', async () => {
		const el = await fixture(`
			<div style="display: flex; width: 60px;">
				<nldd-text-cell width="fit-content" text="Informatiebeveiliging"></nldd-text-cell>
			</div>
		`);
		await waitForUpdate(el);
		const cel = el.querySelector('nldd-text-cell')!;
		expect(Math.round(cel.getBoundingClientRect().width)).toBeLessThanOrEqual(60);
		cleanup(el);
	});
});
