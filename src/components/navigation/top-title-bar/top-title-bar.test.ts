import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDTopTitleBar } from './top-title-bar.js';
import './top-title-bar.js';
import '../../layout/page/page.js';


/* ============================================================
   Smoke tests
   ============================================================ */

describe('nldd-top-title-bar', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-top-title-bar></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders the title', async () => {
		el = await fixture('<nldd-top-title-bar text="Overzicht"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__title')?.textContent?.trim()).toBe('Overzicht');
	});

	it('renders the title as an h1 by default, without a heading-level attribute', async () => {
		el = await fixture('<nldd-top-title-bar text="Overzicht"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__title')?.localName).toBe('h1');
		expect(el.hasAttribute('heading-level')).toBe(false);
	});

	it('renders the heading heading-level names', async () => {
		el = await fixture('<nldd-top-title-bar text="Details" heading-level="2"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__title')?.localName).toBe('h2');
	});

	it('falls back to an h1 for a heading-level outside 1–6', async () => {
		el = await fixture('<nldd-top-title-bar text="Details" heading-level="9"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__title')?.localName).toBe('h1');
	});

	it('renders the supporting text when set', async () => {
		el = await fixture('<nldd-top-title-bar text="Titel" supporting-text="Subtitel"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__supporting-text')?.textContent?.trim()).toBe('Subtitel');
	});

	it('omits the supporting text when not set', async () => {
		el = await fixture('<nldd-top-title-bar text="Titel"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__supporting-text')).toBeNull();
	});

	it('has is-compact class by default when no collapse-anchor is set', async () => {
		el = await fixture('<nldd-top-title-bar text="Titel"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.classList.contains('is-compact')).toBe(true);
	});
});


/* ============================================================
   Toolbar slot
   ============================================================ */

describe('nldd-top-title-bar – toolbar slot', () => {
	let el: NLDDTopTitleBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders the toolbar slot', async () => {
		el = await fixture<NLDDTopTitleBar>(`
			<nldd-top-title-bar text="Titel">
				<nldd-button slot="toolbar" text="Actie"></nldd-button>
			</nldd-top-title-bar>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="toolbar"]');
		expect(slot).not.toBeNull();
		expect(slot!.assignedElements().length).toBe(1);
	});
});


/* ============================================================
   Back button
   ============================================================ */

describe('nldd-top-title-bar – terugknop', () => {
	let el: NLDDTopTitleBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('hides the back button when back-text is not set', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__text-back-button')).toBeNull();
		expect(el.shadowRoot!.querySelector('.top-title-bar__icon-back-button')).toBeNull();
	});

	it('renders both back button variants when back-text is set', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel" back-text="Overzicht"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__text-back-button')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.top-title-bar__icon-back-button')).not.toBeNull();
	});

	it('shows icon back button when is-compact class is set', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel" back-text="Overzicht"></nldd-top-title-bar>');
		await waitForUpdate(el);
		el.classList.add('is-compact');
		await waitForUpdate(el);
		// CSS hides text back and shows icon back — check accessible-label on icon button
		const iconBtn = el.shadowRoot!.querySelector('.top-title-bar__icon-back-button nldd-icon-button');
		expect(iconBtn!.getAttribute('accessible-label')).toBe('Overzicht');
	});

	it('sets href on back buttons when back-href is set', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel" back-text="Overzicht" back-href="/overzicht"></nldd-top-title-bar>');
		await waitForUpdate(el);
		const textBtn = el.shadowRoot!.querySelector('.top-title-bar__text-back-button nldd-button');
		const iconBtn = el.shadowRoot!.querySelector('.top-title-bar__icon-back-button nldd-icon-button');
		expect(textBtn!.getAttribute('href')).toBe('/overzicht');
		expect(iconBtn!.getAttribute('href')).toBe('/overzicht');
	});

	it('fires a back event when _handleBack is called without backHref', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel" back-text="Overzicht"></nldd-top-title-bar>');
		await waitForUpdate(el);
		const listener = vi.fn();
		el.addEventListener('back', listener);
		el._handleBack();
		expect(listener).toHaveBeenCalledOnce();
	});

	it('does not fire a back event when back-href is set', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel" back-text="Overzicht" back-href="/overzicht"></nldd-top-title-bar>');
		await waitForUpdate(el);
		const listener = vi.fn();
		el.addEventListener('back', listener);
		el._handleBack();
		expect(listener).not.toHaveBeenCalled();
	});
});


/* ============================================================
   Dismiss button
   ============================================================ */

describe('nldd-top-title-bar – sluitknop', () => {
	let el: NLDDTopTitleBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('hides the dismiss button when dismiss-text is not set', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__dismiss-button')).toBeNull();
	});

	it('shows the dismiss button when dismiss-text is set', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel" dismiss-text="Sluit"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__dismiss-button')).not.toBeNull();
	});

	it('renders the dismiss text', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel" dismiss-text="Annuleer"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.top-title-bar__dismiss-button nldd-button')?.getAttribute('text')).toBe('Annuleer');
	});

	it('fires a dismiss event when _handleDismiss is called', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel" dismiss-text="Sluit"></nldd-top-title-bar>');
		await waitForUpdate(el);
		const listener = vi.fn();
		el.addEventListener('dismiss', listener);
		el._handleDismiss();
		expect(listener).toHaveBeenCalledOnce();
	});
});


/* ============================================================
   is-compact class / title anchor
   ============================================================ */

describe('nldd-top-title-bar – is-compact', () => {
	let el: NLDDTopTitleBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('has is-compact by default when no collapse-anchor is set', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.classList.contains('is-compact')).toBe(true);
	});

	it('does not auto-compact when neither collapse-anchor nor text is set', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar back-text="Terug"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.classList.contains('is-compact')).toBe(false);
	});

	it('toggles is-compact when text changes while no collapse-anchor is set', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar back-text="Terug"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(el.classList.contains('is-compact')).toBe(false);

		el.text = 'Titel';
		await waitForUpdate(el);
		expect(el.classList.contains('is-compact')).toBe(true);

		el.text = '';
		await waitForUpdate(el);
		expect(el.classList.contains('is-compact')).toBe(false);
	});

	it('stores the anchor element when collapse-anchor id matches', async () => {
		const container = await fixture<HTMLElement>(`
			<div>
				<nldd-top-title-bar text="Titel" collapse-anchor="heading"></nldd-top-title-bar>
				<h1 id="heading">Titel</h1>
			</div>
		`);
		el = container.querySelector('nldd-top-title-bar')!;
		await waitForUpdate(el);
		expect((el as any)._anchorElement).not.toBeNull();
		cleanup(container);
	});

	it('hides its title from assistive technology when anchored', async () => {
		const container = await fixture<HTMLElement>(`
			<div>
				<nldd-top-title-bar text="Titel" collapse-anchor="heading"></nldd-top-title-bar>
				<h1 id="heading">Titel</h1>
			</div>
		`);
		el = container.querySelector('nldd-top-title-bar')!;
		await waitForUpdate(el);
		const group = el.shadowRoot!.querySelector('.top-title-bar__title-group');
		expect(group!.getAttribute('aria-hidden')).toBe('true');
		cleanup(container);
	});

	it('keeps its title exposed without an anchor, because nothing else carries it', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel"></nldd-top-title-bar>');
		await waitForUpdate(el);
		const group = el.shadowRoot!.querySelector('.top-title-bar__title-group');
		expect(group!.hasAttribute('aria-hidden')).toBe(false);
	});

	it('does not set _anchorElement when id does not match', async () => {
		el = await fixture<NLDDTopTitleBar>('<nldd-top-title-bar text="Titel" collapse-anchor="does-not-exist"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect((el as any)._anchorElement).toBeNull();
	});

	it('picks up an anchor that only renders once the page has its data', async () => {
		const container = await fixture<HTMLElement>(`
			<div>
				<nldd-top-title-bar text="Titel" collapse-anchor="late-heading"></nldd-top-title-bar>
			</div>
		`);
		el = container.querySelector('nldd-top-title-bar')!;
		await waitForUpdate(el);
		expect((el as any)._anchorElement).toBeNull();

		const heading = document.createElement('h1');
		heading.id = 'late-heading';
		container.append(heading);
		await waitForUpdate(el);

		expect((el as any)._anchorElement).toBe(heading);
		cleanup(container);
	});

	it('removes scroll listener on disconnect', async () => {
		const container = await fixture<HTMLElement>(`
			<div>
				<nldd-top-title-bar text="Titel" collapse-anchor="heading"></nldd-top-title-bar>
				<h1 id="heading">Titel</h1>
			</div>
		`);
		el = container.querySelector('nldd-top-title-bar')!;
		await waitForUpdate(el);
		const removeSpy = vi.spyOn(window, 'removeEventListener');
		el.remove();
		expect(removeSpy).toHaveBeenCalled();
		removeSpy.mockRestore();
		cleanup(container);
	});
});


/* ============================================================
   collapse-anchor — measured against the bar (root-scroll safe)
   ============================================================ */

describe('nldd-top-title-bar – collapse against the bar', () => {
	let page: HTMLElement;
	let bar: NLDDTopTitleBar;

	afterEach(() => { if (page) cleanup(page); vi.restoreAllMocks(); });

	async function setup() {
		page = await fixture<HTMLElement>(`
			<nldd-page>
				<nldd-top-title-bar slot="header" text="Titel" collapse-anchor="anchor"></nldd-top-title-bar>
				<h1 id="anchor">Titel</h1>
			</nldd-page>
		`);
		bar = page.querySelector('nldd-top-title-bar')!;
		await waitForUpdate(bar);
		return bar;
	}

	it('compacts by comparing the anchor to the bar top, not the page top', async () => {
		bar = await setup();
		const anchor = (bar as unknown as { _anchorElement: HTMLElement })._anchorElement;
		const onScroll = () => (bar as unknown as { _onScroll(): void })._onScroll();

		// The bar is the sticky header line at the viewport top; the page element
		// itself sits lower (in root-scroll it scrolls away under the bar). Old
		// code compared the anchor to the page top and would compact far too early.
		vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);
		vi.spyOn(page, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);

		// Anchor still below the bar → expanded (would be compact against page top).
		const anchorRect = vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({ top: 40 } as DOMRect);
		onScroll();
		expect(bar.classList.contains('is-compact')).toBe(false);

		// Anchor scrolled up to the bar top → compact.
		anchorRect.mockReturnValue({ top: -10 } as DOMRect);
		onScroll();
		expect(bar.classList.contains('is-compact')).toBe(true);
	});

	it('re-points its scroll listener when the page flips scroll mode', async () => {
		bar = await setup();
		const barInternals = bar as unknown as { _activeScrollTarget: EventTarget | null };

		// Page switches to root-scroll: its scroll event target becomes `window`
		// (where viewport scroll actually fires), not document.scrollingElement.
		vi.spyOn(page as unknown as { scrollEventTarget: EventTarget }, 'scrollEventTarget', 'get').mockReturnValue(window);
		page.setAttribute('data-scroll', 'root');

		// Let the bar's MutationObserver on [data-scroll] fire.
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(barInternals._activeScrollTarget).toBe(window);
	});
});
