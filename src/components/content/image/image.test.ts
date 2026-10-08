import { describe, it, expect, afterEach, beforeEach, vi, type MockInstance } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDImage } from './image.js';
import './image.js';

describe('nldd-image', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without errors', async () => {
		el = await fixture('<nldd-image src="/foo.jpg" alt="Foo"></nldd-image>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders an internal img with src and alt', async () => {
		el = await fixture('<nldd-image src="/foo.jpg" alt="Foo"></nldd-image>');
		await waitForUpdate(el);
		const img = el.shadowRoot!.querySelector('img')!;
		expect(img.getAttribute('src')).toBe('/foo.jpg');
		expect(img.getAttribute('alt')).toBe('Foo');
	});

	it('defaults loading to lazy and decoding to async', async () => {
		el = await fixture('<nldd-image src="/foo.jpg" alt="Foo"></nldd-image>');
		await waitForUpdate(el);
		const img = el.shadowRoot!.querySelector('img')!;
		expect(img.getAttribute('loading')).toBe('lazy');
		expect(img.getAttribute('decoding')).toBe('async');
	});

	it('forces alt empty and aria-hidden when decorative', async () => {
		el = await fixture('<nldd-image src="/foo.jpg" alt="Ignored" decorative></nldd-image>');
		await waitForUpdate(el);
		const img = el.shadowRoot!.querySelector('img')!;
		expect(img.getAttribute('alt')).toBe('');
		expect(img.getAttribute('aria-hidden')).toBe('true');
	});

	it('omits the figure wrapper when no caption or credit is set', async () => {
		el = await fixture('<nldd-image src="/foo.jpg" alt="Foo"></nldd-image>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('figure')).toBeNull();
	});

	it('renders figure + figcaption when caption is set', async () => {
		el = await fixture('<nldd-image src="/foo.jpg" alt="Foo" caption="Een caption"></nldd-image>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('figure')).not.toBeNull();
		const cap = el.shadowRoot!.querySelector('figcaption')!;
		expect(cap.textContent).toContain('Een caption');
	});

	it('renders credit inside the figcaption', async () => {
		el = await fixture('<nldd-image src="/foo.jpg" alt="Foo" credit="Foto: Rijksoverheid"></nldd-image>');
		await waitForUpdate(el);
		const credit = el.shadowRoot!.querySelector('.image__credit')!;
		expect(credit.textContent).toBe('Foto: Rijksoverheid');
	});

	it('reflects shape attribute', async () => {
		el = await fixture<NLDDImage>('<nldd-image src="/foo.jpg" alt="Foo" shape="circle"></nldd-image>');
		await waitForUpdate(el);
		expect((el as unknown as NLDDImage).shape).toBe('circle');
		expect(el.getAttribute('shape')).toBe('circle');
	});

	it('defaults shape to square', async () => {
		el = await fixture<NLDDImage>('<nldd-image src="/foo.jpg" alt="Foo"></nldd-image>');
		await waitForUpdate(el);
		expect((el as unknown as NLDDImage).shape).toBe('square');
		// The default shape is not reflected — kept out of the DOM.
		expect(el.hasAttribute('shape')).toBe(false);
	});

	it('defaults width to "full" and applies no host max-width', async () => {
		el = await fixture<NLDDImage>('<nldd-image src="/foo.jpg" alt="Foo"></nldd-image>');
		await waitForUpdate(el);
		expect(el.style.maxWidth).toBe('');
		const img = el.shadowRoot!.querySelector('img')!;
		expect(img.hasAttribute('width')).toBe(false);
	});

	it('applies max-width via --_image-max-width custom property and width hint on img when width is numeric', async () => {
		el = await fixture<NLDDImage>('<nldd-image src="/foo.jpg" alt="Foo" width="240"></nldd-image>');
		await waitForUpdate(el);
		// The component routes width through --_image-max-width so consumer CSS can
		// override the host's max-width if needed.
		expect(el.style.getPropertyValue('--_image-max-width')).toBe('240px');
		const img = el.shadowRoot!.querySelector('img')!;
		expect(img.getAttribute('width')).toBe('240');
	});

	it('reflects aspect-ratio as inline style on the media wrapper (colon → slash)', async () => {
		el = await fixture('<nldd-image src="/foo.jpg" alt="Foo" aspect-ratio="16:9"></nldd-image>');
		await waitForUpdate(el);
		const media = el.shadowRoot!.querySelector<HTMLElement>('.image__media')!;
		// Browser normalizes the parsed value with surrounding spaces.
		expect(media.style.aspectRatio.replace(/\s+/g, '')).toBe('16/9');
	});

	it('uses the slotted img as the displayed image instead of the fallback', async () => {
		el = await fixture(`
			<nldd-image>
				<img src="/slotted.jpg" alt="Slotted">
			</nldd-image>
		`);
		await waitForUpdate(el);
		// The fallback img exists in shadow DOM (it's the slot's default content)
		// but the slot's *assigned* nodes are what actually render.
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!;
		const assigned = slot.assignedElements({ flatten: true });
		expect(assigned.length).toBe(1);
		expect(assigned[0].tagName).toBe('IMG');
		expect(assigned[0].getAttribute('src')).toBe('/slotted.jpg');
	});

	it('populates an aria-live status region with the error message + alt on error', async () => {
		// A data URI that loads, so the img doesn't try (and fail) to load a
		// missing URL — that fires `error` in some browsers and races with the
		// "pre-error state is empty" assertion below.
		el = await fixture<NLDDImage>('<nldd-image src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="Beschrijving"></nldd-image>');
		await waitForUpdate(el);
		const status = el.shadowRoot!.querySelector('.image__status');
		expect(status).not.toBeNull();
		expect(status!.getAttribute('aria-live')).toBe('polite');
		expect(status!.textContent).toBe('');
		// Force the error transition by dispatching directly on the internal img.
		const img = el.shadowRoot!.querySelector('img')!;
		img.dispatchEvent(new Event('error'));
		await waitForUpdate(el);
		// Text now contains the translated default + the alt, so SR users get a
		// meaningful announcement on the empty → non-empty transition.
		expect(status!.textContent).toBe('Afbeelding is niet geladen: Beschrijving');
	});

	it('does not announce in the status region for decorative errored images', async () => {
		el = await fixture<NLDDImage>('<nldd-image src="/missing.jpg" alt="Ignored" decorative></nldd-image>');
		await waitForUpdate(el);
		const img = el.shadowRoot!.querySelector('img')!;
		img.dispatchEvent(new Event('error'));
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.image__status')!.textContent).toBe('');
	});

	it('renders the error overlay with icon + alt text when the image errors', async () => {
		el = await fixture<NLDDImage>('<nldd-image src="/missing.jpg" alt="Beschrijving"></nldd-image>');
		await waitForUpdate(el);
		// Force the error state directly (jsdom/headless browsers may or may
		// not fire a real error event for a missing relative URL).
		const img = el.shadowRoot!.querySelector('img')!;
		img.dispatchEvent(new Event('error'));
		await waitForUpdate(el);
		const overlay = el.shadowRoot!.querySelector('.image__error');
		expect(overlay).not.toBeNull();
		// The visible .image__error-text carries the alt; the wrapper deliberately
		// no longer mirrors it via aria-label to avoid a double SR announcement.
		expect(overlay!.hasAttribute('aria-label')).toBe(false);
		expect(el.shadowRoot!.querySelector('.image__error-text')?.textContent).toBe('Beschrijving');
		expect(el.shadowRoot!.querySelector('nldd-icon')).not.toBeNull();
	});

	it('hides the alt text in the error overlay when decorative', async () => {
		el = await fixture<NLDDImage>('<nldd-image src="/missing.jpg" alt="Ignored" decorative></nldd-image>');
		await waitForUpdate(el);
		const img = el.shadowRoot!.querySelector('img')!;
		img.dispatchEvent(new Event('error'));
		await waitForUpdate(el);
		const overlay = el.shadowRoot!.querySelector('.image__error')!;
		expect(el.shadowRoot!.querySelector('.image__error-text')).toBeNull();
		// Overlay is hidden from assistive tech entirely for decorative images:
		// no img role, no label, aria-hidden true.
		expect(overlay.hasAttribute('role')).toBe(false);
		expect(overlay.hasAttribute('aria-label')).toBe(false);
		expect(overlay.getAttribute('aria-hidden')).toBe('true');
	});

	it('passes through srcset and sizes', async () => {
		el = await fixture('<nldd-image src="/foo.jpg" alt="Foo" srcset="/foo-2x.jpg 2x" sizes="100vw"></nldd-image>');
		await waitForUpdate(el);
		const img = el.shadowRoot!.querySelector('img')!;
		expect(img.getAttribute('srcset')).toBe('/foo-2x.jpg 2x');
		expect(img.getAttribute('sizes')).toBe('100vw');
	});

	it('forwards a valid lqip CSV as 7 inline --context-lqip-* CSS variables', async () => {
		// Skip src so the image never errors out and removes the lqip class.
		el = await fixture<NLDDImage>('<nldd-image alt="Foo" lqip="98,154,162,99,99,99,100"></nldd-image>');
		await waitForUpdate(el);
		const media = el.shadowRoot!.querySelector<HTMLElement>('.image__media')!;
		expect(media.style.getPropertyValue('--context-lqip-base')).toBe('98');
		expect(media.style.getPropertyValue('--context-lqip-c1')).toBe('154');
		expect(media.style.getPropertyValue('--context-lqip-c2')).toBe('162');
		expect(media.style.getPropertyValue('--context-lqip-c3')).toBe('99');
		expect(media.style.getPropertyValue('--context-lqip-c4')).toBe('99');
		expect(media.style.getPropertyValue('--context-lqip-c5')).toBe('99');
		expect(media.style.getPropertyValue('--context-lqip-c6')).toBe('100');
		expect(media.classList.contains('image__media--lqip')).toBe(true);
	});

	it('silently ignores a malformed lqip string', async () => {
		// Too few values, out-of-range numbers, non-integers, empty — all
		// should fall through to "no LQIP" instead of throwing or producing
		// half-set CSS vars.
		for (const bad of ['1,2,3', '300,300,300,300,300,300,300', 'foo,1,2,3,4,5,6', '']) {
			el = await fixture<NLDDImage>(`<nldd-image alt="Foo" lqip="${bad}"></nldd-image>`);
			await waitForUpdate(el);
			const media = el.shadowRoot!.querySelector<HTMLElement>('.image__media')!;
			expect(media.style.getPropertyValue('--context-lqip-base')).toBe('');
			expect(media.classList.contains('image__media--lqip')).toBe(false);
			cleanup(el);
		}
	});

	it('sets the loaded host attribute when the image loads', async () => {
		// A data URI rather than a relative URL, which would 404 in the test env
		// and fire a real `error`, racing the synthetic `load` below.
		el = await fixture<NLDDImage>('<nldd-image src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="Foo"></nldd-image>');
		await waitForUpdate(el);
		const img = el.shadowRoot!.querySelector('img')!;
		img.dispatchEvent(new Event('load'));
		await waitForUpdate(el);
		expect(el.hasAttribute('loaded')).toBe(true);
		expect(el.hasAttribute('errored')).toBe(false);
	});

	it('sets the errored host attribute when the image fails to load', async () => {
		el = await fixture<NLDDImage>('<nldd-image src="/missing.jpg" alt="Foo"></nldd-image>');
		await waitForUpdate(el);
		const img = el.shadowRoot!.querySelector('img')!;
		img.dispatchEvent(new Event('error'));
		await waitForUpdate(el);
		expect(el.hasAttribute('errored')).toBe(true);
		expect(el.hasAttribute('loaded')).toBe(false);
	});
});

describe('nldd-image with an inline svg', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('uses the slotted svg instead of the fallback img', async () => {
		el = await fixture(`
			<nldd-image decorative aspect-ratio="6/5">
				<svg viewBox="0 0 120 100"><rect width="120" height="100"></rect></svg>
			</nldd-image>`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!;
		const assigned = slot.assignedElements({ flatten: true });
		expect(assigned.map(n => n.tagName.toLowerCase())).toEqual(['svg']);
	});

	it('sizes the svg to the media box', async () => {
		el = await fixture(`
			<nldd-image decorative aspect-ratio="6/5" style="width: 240px">
				<svg viewBox="0 0 120 100"><rect width="120" height="100"></rect></svg>
			</nldd-image>`);
		await waitForUpdate(el);
		const svg = el.querySelector('svg') as SVGElement;
		expect(getComputedStyle(svg).display).toBe('block');
		expect(svg.getBoundingClientRect().width).toBe(240);
	});
});

describe('nldd-image without an image', () => {
	let el: NLDDImage;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const media = () => el.shadowRoot!.querySelector('.image__media')!;
	const icon = () => media().querySelector('.image__empty-icon nldd-icon');

	it('shows a hidden area with an image icon, 16/9 without an aspect-ratio', async () => {
		el = await fixture<NLDDImage>('<nldd-image style="width: 320px"></nldd-image>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('img')).toBeNull();
		expect(media().getAttribute('aria-hidden')).toBe('true');
		expect(icon()!.getAttribute('icon')).toBe('image');
		expect(Math.round(media().getBoundingClientRect().height)).toBe(180);
		el.aspectRatio = '1:1';
		await waitForUpdate(el);
		expect(Math.round(media().getBoundingClientRect().height)).toBe(320);
	});

	it('keeps the caption and the shape', async () => {
		el = await fixture<NLDDImage>('<nldd-image shape="circle" caption="Bijschrift"></nldd-image>');
		await waitForUpdate(el);
		expect(icon()).not.toBeNull();
		expect(el.shadowRoot!.querySelector('figcaption')!.textContent).toContain('Bijschrift');
	});

	it('is no longer empty once a src arrives', async () => {
		el = await fixture<NLDDImage>('<nldd-image></nldd-image>');
		await waitForUpdate(el);
		el.src = '/foo.jpg';
		el.alt = 'Foo';
		await waitForUpdate(el);
		expect(icon()).toBeNull();
		expect(media().hasAttribute('aria-hidden')).toBe(false);
		expect(el.shadowRoot!.querySelector('img')).not.toBeNull();
	});

	it('is not empty with slotted media, from the first render on', async () => {
		el = await fixture<NLDDImage>('<nldd-image><img src="/bar.jpg" alt="Bar"></nldd-image>');
		await waitForUpdate(el);
		expect(icon()).toBeNull();
		expect(media().classList.contains('image__media--loading')).toBe(false);
	});

	it('is not empty with only an lqip, which shows its preview', async () => {
		el = await fixture<NLDDImage>('<nldd-image lqip="28,28,164,164,106,170,99" aspect-ratio="16/9"></nldd-image>');
		await waitForUpdate(el);
		expect(icon()).toBeNull();
		expect(media().classList.contains('image__media--lqip')).toBe(true);
	});

	it('fills the area while the image loads without an lqip, and clears it once loaded', async () => {
		// The src 404s in the test env. Let that error land first, then put the
		// image back in flight, so nothing races the assertions below.
		el = await fixture<NLDDImage>('<nldd-image src="/missing.jpg" alt="Foo"></nldd-image>');
		await expect.poll(() => el._imageErrored).toBe(true);
		el._imageErrored = false;
		await waitForUpdate(el);
		expect(media().classList.contains('image__media--loading')).toBe(true);
		expect(icon()).toBeNull();
		el._onImageLoad();
		await waitForUpdate(el);
		expect(media().classList.contains('image__media--loading')).toBe(false);
	});
});

describe('nldd-image missing-alt warning', () => {
	let el: HTMLElement;
	let warn: MockInstance<typeof console.warn>;

	/** The alt warnings logged so far, apart from anything else in the console. */
	const altWarnings = () => warn.mock.calls
		.map(([message]) => String(message))
		.filter(message => message.startsWith('<nldd-image>') && message.includes('`alt`'));

	beforeEach(() => {
		warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		warn.mockRestore();
		if (el) cleanup(el);
	});

	it('warns once when an image from src has no alt', async () => {
		el = await fixture<NLDDImage>('<nldd-image src="/foo.jpg"></nldd-image>');
		await waitForUpdate(el);
		(el as unknown as NLDDImage).shape = 'rounded';
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(1);
		expect(altWarnings()[0]).toContain('non-empty `alt`');
	});

	it('warns again when an alt that was added is taken away', async () => {
		el = await fixture<NLDDImage>('<nldd-image src="/foo.jpg"></nldd-image>');
		await waitForUpdate(el);
		const image = el as unknown as NLDDImage;
		image.alt = 'Foo';
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(1);
		image.alt = '';
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(2);
	});

	it('waits for a src before it judges the alt', async () => {
		el = await fixture<NLDDImage>('<nldd-image lqip="98,154,162,99,99,99,100"></nldd-image>');
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(0);
		(el as unknown as NLDDImage).src = '/foo.jpg';
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(1);
	});

	it.each([
		['an image from src with an alt', '<nldd-image src="/foo.jpg" alt="Foo"></nldd-image>'],
		['a decorative image from src', '<nldd-image src="/foo.jpg" decorative></nldd-image>'],
		['a slotted img with an alt', '<nldd-image><img src="/foo.jpg" alt="Foo"></nldd-image>'],
		['a slotted img with an empty alt', '<nldd-image><img src="/foo.jpg" alt=""></nldd-image>'],
		['a slotted img named by aria-label', '<nldd-image><img src="/foo.jpg" aria-label="Foo"></nldd-image>'],
		['a slotted picture around an img with an alt', '<nldd-image><picture><source srcset="/foo.webp" type="image/webp"><img src="/foo.jpg" alt="Foo"></picture></nldd-image>'],
		['a slotted svg named by aria-label', '<nldd-image><svg role="img" aria-label="Foo" viewBox="0 0 10 10"></svg></nldd-image>'],
		['a slotted svg named by aria-labelledby', '<nldd-image><svg role="img" aria-labelledby="foo-title" viewBox="0 0 10 10"><text id="foo-title">Foo</text></svg></nldd-image>'],
		['a slotted svg named by its title', '<nldd-image><svg role="img" viewBox="0 0 10 10"><title>Foo</title></svg></nldd-image>'],
		['a slotted svg hidden with aria-hidden', '<nldd-image><svg aria-hidden="true" viewBox="0 0 10 10"></svg></nldd-image>'],
		['a decorative image with a slotted svg', '<nldd-image decorative><svg viewBox="0 0 10 10"></svg></nldd-image>'],
	])('stays quiet for %s', async (_, markup) => {
		el = await fixture(markup);
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(0);
	});

	it.each([
		['a slotted img without an alt', '<nldd-image alt="Not this one"><img src="/foo.jpg"></nldd-image>'],
		['a slotted picture around an img without an alt', '<nldd-image><picture><img src="/foo.jpg"></picture></nldd-image>'],
		['a slotted svg without role="img"', '<nldd-image><svg aria-label="Foo" viewBox="0 0 10 10"></svg></nldd-image>'],
		['a slotted svg with role="img" and no name', '<nldd-image><svg role="img" viewBox="0 0 10 10"><title> </title></svg></nldd-image>'],
	])('warns for %s, whatever the host alt says', async (_, markup) => {
		el = await fixture(markup);
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(1);
		expect(altWarnings()[0]).toContain('slotted image');
	});

	it('judges slotted media again when the slot content changes', async () => {
		el = await fixture('<nldd-image></nldd-image>');
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(0);

		const bare = document.createElement('img');
		bare.src = '/foo.jpg';
		el.append(bare);
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(1);

		const named = document.createElement('img');
		named.src = '/foo.jpg';
		named.alt = 'Foo';
		bare.replaceWith(named);
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(1);

		named.replaceWith(bare);
		await waitForUpdate(el);
		expect(altWarnings()).toHaveLength(2);
	});

	it('looks through a forwarded slot at the media that fills it', async () => {
		const host = document.createElement('div');
		host.attachShadow({ mode: 'open' }).innerHTML = '<nldd-image><slot></slot></nldd-image>';
		host.innerHTML = '<img src="/foo.jpg" alt="Foo">';
		document.body.append(host);
		try {
			const image = host.shadowRoot!.querySelector('nldd-image')!;
			await waitForUpdate(image);
			expect(altWarnings()).toHaveLength(0);

			host.innerHTML = '<img src="/foo.jpg">';
			await waitForUpdate(image);
			expect(altWarnings()).toHaveLength(1);
		} finally {
			host.remove();
		}
	});
});
