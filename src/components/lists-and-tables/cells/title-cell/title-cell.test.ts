import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../../test-utils.js';
import './title-cell.js';

describe('nldd-title-cell', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-title-cell></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to size 5', async () => {
		el = await fixture('<nldd-title-cell></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('5');
	});

	it('reflects size attribute', async () => {
		el = await fixture('<nldd-title-cell size="2"></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('2');
	});

	it('defaults to full width', async () => {
		el = await fixture('<nldd-title-cell></nldd-title-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { width: string }).width).toBe('full');
		expect(el.hasAttribute('width')).toBe(false);
	});

	it('reflects width attribute', async () => {
		el = await fixture('<nldd-title-cell width="fit-content"></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('fit-content');
	});

	it('sets inline width style for explicit CSS length', async () => {
		el = await fixture('<nldd-title-cell width="120px"></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_title-cell-width')).toBe('120px');
	});

	it('sets --_title-cell-min-width custom property', async () => {
		el = await fixture('<nldd-title-cell min-width="80px"></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_title-cell-min-width')).toBe('80px');
	});

	it('sets --_title-cell-max-width custom property', async () => {
		el = await fixture('<nldd-title-cell max-width="300px"></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_title-cell-max-width')).toBe('300px');
	});

	it('sets --_title-cell-min-height custom property', async () => {
		el = await fixture('<nldd-title-cell min-height="44px"></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_title-cell-min-height')).toBe('44px');
	});

	it('defaults to left horizontal alignment', async () => {
		el = await fixture('<nldd-title-cell></nldd-title-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { horizontalAlignment: string }).horizontalAlignment).toBe('left');
		expect(el.hasAttribute('horizontal-alignment')).toBe(false);
	});

	it('reflects horizontal-alignment attribute', async () => {
		el = await fixture('<nldd-title-cell horizontal-alignment="right"></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('horizontal-alignment')).toBe('right');
	});

	it('defaults to center vertical alignment', async () => {
		el = await fixture('<nldd-title-cell></nldd-title-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { verticalAlignment: string }).verticalAlignment).toBe('center');
		expect(el.hasAttribute('vertical-alignment')).toBe(false);
	});

	it('reflects vertical-alignment top', async () => {
		el = await fixture('<nldd-title-cell vertical-alignment="top"></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('vertical-alignment')).toBe('top');
	});

	it('reflects vertical-alignment bottom', async () => {
		el = await fixture('<nldd-title-cell vertical-alignment="bottom"></nldd-title-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('vertical-alignment')).toBe('bottom');
	});

	it('renders text in shadow DOM', async () => {
		el = await fixture('<nldd-title-cell text="My title"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title).not.toBeNull();
		expect(title!.textContent?.trim()).toBe('My title');
	});

	it('renders overline in shadow DOM', async () => {
		el = await fixture('<nldd-title-cell overline="Overline"></nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__overline');
		expect(p).not.toBeNull();
		expect(p!.textContent?.trim()).toBe('Overline');
	});

	it('renders supporting-text in shadow DOM', async () => {
		el = await fixture('<nldd-title-cell supporting-text="Supporting"></nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__supporting-text');
		expect(p).not.toBeNull();
		expect(p!.textContent?.trim()).toBe('Supporting');
	});

	it('hides title wrapper when text is empty and no slotted content', async () => {
		el = await fixture('<nldd-title-cell></nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__title') as HTMLElement;
		expect(p).not.toBeNull();
		expect(p.hasAttribute('hidden')).toBe(true);
	});

	it('hides overline wrapper when overline is empty and no slotted content', async () => {
		el = await fixture('<nldd-title-cell></nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__overline') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(true);
	});

	it('hides supporting-text wrapper when empty and no slotted content', async () => {
		el = await fixture('<nldd-title-cell></nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__supporting-text') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(true);
	});

	// — Slot fallback —

	it('shows title wrapper when content is slotted into default slot', async () => {
		el = await fixture('<nldd-title-cell><span>Slotted title</span></nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__title') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(false);
	});

	it('shows wrapper when content is slotted into overline slot', async () => {
		el = await fixture('<nldd-title-cell><span slot="overline">Custom overline</span></nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__overline') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(false);
	});

	it('shows wrapper when content is slotted into supporting-text slot', async () => {
		el = await fixture('<nldd-title-cell><span slot="supporting-text">Custom support</span></nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__supporting-text') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(false);
	});

	it('ignores whitespace-only slotted text for visibility', async () => {
		el = await fixture('<nldd-title-cell>   \n\t  </nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__title') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(true);
	});

	it('whitespace-only slot assignment does not suppress attribute fallback', async () => {
		// Mimics the self-closing custom-element trap: trailing whitespace
		// becomes a default-slot text node, which would normally hide the slot's
		// fallback content. The fallback-as-sibling pattern keeps it visible.
		el = await fixture('<nldd-title-cell text="Visible">   \n\t  </nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__title') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(false);
		expect(p.textContent?.trim()).toBe('Visible');
	});

	it('slotted content takes precedence over attribute for visibility', async () => {
		el = await fixture('<nldd-title-cell text="Attribute"><span>Slotted</span></nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__title') as HTMLElement;
		const slot = p.querySelector('slot:not([name])') as HTMLSlotElement;
		expect(p.hasAttribute('hidden')).toBe(false);
		expect(slot.assignedNodes().length).toBeGreaterThan(0);
	});

	it('slot works with heading-level (h2 contains slot)', async () => {
		el = await fixture('<nldd-title-cell heading-level="2"><span>Heading content</span></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title') as HTMLElement;
		expect(title.tagName.toLowerCase()).toBe('h2');
		expect(title.querySelector('slot')).not.toBeNull();
	});

	it('updates visibility when slotted content is added dynamically', async () => {
		el = await fixture('<nldd-title-cell></nldd-title-cell>');
		await waitForUpdate(el);
		const p = el.shadowRoot!.querySelector('.title-cell__title') as HTMLElement;
		expect(p.hasAttribute('hidden')).toBe(true);

		const span = document.createElement('span');
		span.textContent = 'Late slot';
		el.appendChild(span);
		await waitForUpdate(el);
		expect(p.hasAttribute('hidden')).toBe(false);
	});

	it('renders a <p> by default (no heading-level)', async () => {
		el = await fixture('<nldd-title-cell text="Title"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title).not.toBeNull();
		expect(title!.tagName.toLowerCase()).toBe('p');
	});

	it('renders an <h1> when heading-level="1"', async () => {
		el = await fixture('<nldd-title-cell text="Title" heading-level="1"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title!.tagName.toLowerCase()).toBe('h1');
	});

	it('renders an <h2> when heading-level="2"', async () => {
		el = await fixture('<nldd-title-cell text="Title" heading-level="2"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title!.tagName.toLowerCase()).toBe('h2');
	});

	it('renders an <h6> when heading-level="6"', async () => {
		el = await fixture('<nldd-title-cell text="Title" heading-level="6"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title!.tagName.toLowerCase()).toBe('h6');
	});

	it('falls back to <p> when heading-level="0"', async () => {
		el = await fixture('<nldd-title-cell text="Title" heading-level="0"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title!.tagName.toLowerCase()).toBe('p');
	});

	it('falls back to <p> when heading-level="7"', async () => {
		el = await fixture('<nldd-title-cell text="Title" heading-level="7"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title!.tagName.toLowerCase()).toBe('p');
	});

	// — markdown bold —

	it('renders **bold** markers as <b> elements in text', async () => {
		el = await fixture('<nldd-title-cell text="Hello **world**"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title!.querySelector('b')?.textContent).toBe('world');
		expect(title!.textContent?.trim()).toBe('Hello world');
	});

	it('renders **bold** markers in overline and supporting-text', async () => {
		el = await fixture('<nldd-title-cell overline="Over **line**" text="T" supporting-text="Sub **title**"></nldd-title-cell>');
		await waitForUpdate(el);
		const overline = el.shadowRoot!.querySelector('.title-cell__overline');
		const supporting = el.shadowRoot!.querySelector('.title-cell__supporting-text');
		expect(overline!.querySelector('b')?.textContent).toBe('line');
		expect(supporting!.querySelector('b')?.textContent).toBe('title');
	});

	// — query / query-mark-mode —

	it('query: predictive mode bolds the remainder of text (default)', async () => {
		el = await fixture('<nldd-title-cell text="Aardappelen" query="aa"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		const bold = title!.querySelector('b');
		expect(bold?.textContent).toBe('rdappelen');
		expect(title!.textContent?.trim()).toBe('Aardappelen');
	});

	it('query: match mode bolds the query substring', async () => {
		el = await fixture('<nldd-title-cell text="Aardappelen" query="aa" query-mark-mode="match"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title!.querySelector('b')?.textContent).toBe('Aa');
	});

	it('query applies across text, overline and supporting-text', async () => {
		el = await fixture('<nldd-title-cell overline="Groente" text="Aardappelen" supporting-text="appelsoort" query="app"></nldd-title-cell>');
		await waitForUpdate(el);
		const overline = el.shadowRoot!.querySelector('.title-cell__overline');
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		const supporting = el.shadowRoot!.querySelector('.title-cell__supporting-text');
		expect(overline!.querySelector('b')).toBeNull();
		expect(title!.querySelectorAll('b').length).toBeGreaterThan(0);
		expect(supporting!.querySelectorAll('b').length).toBeGreaterThan(0);
	});

	it('query: query not present in text renders plain', async () => {
		el = await fixture('<nldd-title-cell text="Aardappelen" query="zz"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title!.querySelector('b')).toBeNull();
	});

	it('query-mark-mode defaults to predictive', async () => {
		el = await fixture('<nldd-title-cell text="Aardappelen"></nldd-title-cell>');
		await waitForUpdate(el);
		expect((el as HTMLElement & { queryMarkMode: string }).queryMarkMode).toBe('predictive');
	});

	it('query works with heading-level', async () => {
		el = await fixture('<nldd-title-cell text="Aardappelen" heading-level="2" query="aa"></nldd-title-cell>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.title-cell__title');
		expect(title!.tagName.toLowerCase()).toBe('h2');
		expect(title!.querySelector('b')?.textContent).toBe('rdappelen');
	});

	it('query: does not modify slotted content', async () => {
		el = await fixture('<nldd-title-cell query="aa"><span>Aardappelen</span></nldd-title-cell>');
		await waitForUpdate(el);
		const span = el.querySelector('span');
		// Slotted content lives in light DOM, untouched by renderQueryMark.
		expect(span!.querySelector('b')).toBeNull();
		expect(span!.textContent).toBe('Aardappelen');
	});
});
