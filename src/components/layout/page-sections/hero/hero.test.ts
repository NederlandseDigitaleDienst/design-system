import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../../test-utils.js';
import './hero.js';
import { loadTokens } from '../../../../test-tokens.js';

const MEDIA = '<img slot="media" src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 4 3\'%3E%3Crect width=\'4\' height=\'3\'/%3E%3C/svg%3E" alt="">';

describe('nldd-hero', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-hero></nldd-hero>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to main-position="bottom-left" and main-width="1/2"', async () => {
		el = await fixture('<nldd-hero></nldd-hero>');
		await waitForUpdate(el);
		const h = el as unknown as { mainPosition: string; mainWidth: string; mainBackground: string };
		expect(h.mainPosition).toBe('bottom-left');
		expect(h.mainWidth).toBe('1/2');
		expect(h.mainBackground).toBe('accent');
		expect(el.hasAttribute('main-position')).toBe(false);
		expect(el.hasAttribute('main-width')).toBe(false);
		expect(el.hasAttribute('main-background')).toBe(false);
	});

	it('is rectangular — sets no corner data attributes', async () => {
		el = await fixture(`<nldd-hero main-position="top-left">${MEDIA}</nldd-hero>`);
		await waitForUpdate(el);
		expect(el.hasAttribute('data-media-corner')).toBe(false);
		expect(el.hasAttribute('data-main-corner')).toBe(false);
	});


	/* ============================================================
	   Media slot
	   ============================================================ */

	it('hides the media area and marks the host without media', async () => {
		el = await fixture('<nldd-hero></nldd-hero>');
		await waitForUpdate(el);
		expect(el.hasAttribute('data-has-media')).toBe(false);
		expect(el.shadowRoot!.querySelector('.hero__media')!.hasAttribute('hidden')).toBe(true);
	});

	it('shows the media area with slotted media', async () => {
		el = await fixture(`<nldd-hero>${MEDIA}</nldd-hero>`);
		await waitForUpdate(el);
		expect(el.hasAttribute('data-has-media')).toBe(true);
		expect(el.shadowRoot!.querySelector('.hero__media')!.hasAttribute('hidden')).toBe(false);
	});

	it('updates when media is added at runtime', async () => {
		el = await fixture('<nldd-hero></nldd-hero>');
		await waitForUpdate(el);
		const img = document.createElement('img');
		img.setAttribute('slot', 'media');
		img.setAttribute('src', 'data:,');
		img.setAttribute('alt', '');
		el.appendChild(img);
		await waitForUpdate(el);
		expect(el.hasAttribute('data-has-media')).toBe(true);
	});

	it('removes data-has-media when the slotted media is removed', async () => {
		el = await fixture(`<nldd-hero>${MEDIA}</nldd-hero>`);
		await waitForUpdate(el);
		expect(el.hasAttribute('data-has-media')).toBe(true);
		el.querySelector('img[slot="media"]')!.remove();
		await waitForUpdate(el);
		expect(el.hasAttribute('data-has-media')).toBe(false);
	});


	/* ============================================================
	   Width (max-width) inline style
	   ============================================================ */

	const IMG = '<img slot="media" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="">';

	const geometry = async (attrs: string, width: number) => {
		el = await fixture(`<nldd-hero ${attrs} style="width: ${width}px">${IMG}<p>Tekst</p></nldd-hero>`);
		await waitForUpdate(el);
		await expect.poll(() => el.hasAttribute('data-has-media')).toBe(true);
		const media = el.shadowRoot!.querySelector('.hero__media')!.getBoundingClientRect();
		const main = el.shadowRoot!.querySelector('.hero__main')!.getBoundingClientRect();
		return { media, main };
	};

	it('keeps the panel a section gap from the edges of the image on wide screens', async () => {
		const unloadTokens = loadTokens();
		try {
			const { media, main } = await geometry('', 1200);
			expect(Math.round(main.left - media.left)).toBe(32);
			expect(Math.round(media.bottom - main.bottom)).toBe(32);
		} finally {
			unloadTokens();
		}
	});

	it('lays a full-width panel across the image, a gap from its sides', async () => {
		const unloadTokens = loadTokens();
		try {
			const { media, main } = await geometry('main-width="full"', 1200);
			expect(Math.round(main.left - media.left)).toBe(32);
			expect(Math.round(media.right - main.right)).toBe(32);
			expect(main.bottom).toBeLessThan(media.bottom);
		} finally {
			unloadTokens();
		}
	});

	it('centers the panel with bottom-center', async () => {
		const unloadTokens = loadTokens();
		try {
			const { media, main } = await geometry('main-position="bottom-center"', 1200);
			expect(Math.round(main.left - media.left)).toBe(Math.round(media.right - main.right));
		} finally {
			unloadTokens();
		}
	});

	it('puts the image first on sm, with the panel indented and overlapping it, also for a top position', async () => {
		const unloadTokens = loadTokens();
		try {
			const { media, main } = await geometry('main-position="top-left"', 400);
			expect(main.top).toBeGreaterThan(media.top);
			expect(Math.round(media.bottom - main.top)).toBe(16);
			expect(Math.round(main.left - media.left)).toBe(16);
			expect(Math.round(media.right - main.right)).toBe(16);
		} finally {
			unloadTokens();
		}
	});

	it('gives the image a fixed height with media-height, on wide screens and on sm', async () => {
		const unloadTokens = loadTokens();
		try {
			let { media } = await geometry('media-height="320px"', 1200);
			expect(Math.round(media.height)).toBe(320);
			({ media } = await geometry('media-height="200px"', 400));
			expect(Math.round(media.height)).toBe(200);
		} finally {
			unloadTokens();
		}
	});

	it('falls back to the aspect ratio for an invalid media-height', async () => {
		el = await fixture('<nldd-hero media-height="nogal hoog"></nldd-hero>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_hero-media-height')).toBe('');
	});

	it('ignores height, which would stretch the hero, and says so in development', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		try {
			el = await fixture('<nldd-hero height="900px"></nldd-hero>');
			await waitForUpdate(el);
			expect(el.style.minHeight).toBe('');
			expect(warn.mock.calls.some(([message]) => String(message).includes('media-height'))).toBe(true);
		} finally {
			warn.mockRestore();
		}
	});

	it('has half the section padding on top and the full padding below, unless padding-top is set', async () => {
		const unloadTokens = loadTokens();
		try {
			el = await fixture('<nldd-hero style="width: 1200px"></nldd-hero>');
			await waitForUpdate(el);
			const hero = el.shadowRoot!.querySelector('.hero')!;
			expect(getComputedStyle(hero).paddingTop).toBe('24px');
			expect(getComputedStyle(hero).paddingBottom).toBe('48px');
			el.setAttribute('padding-top', '48');
			await waitForUpdate(el);
			expect(getComputedStyle(hero).paddingTop).toBe('48px');
		} finally {
			unloadTokens();
		}
	});

	it('width="full" sets no --_hero-max-width inline style', async () => {
		el = await fixture('<nldd-hero width="full"></nldd-hero>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_hero-max-width')).toBe('');
	});

	it('a CSS-length width feeds --_hero-max-width inline', async () => {
		el = await fixture('<nldd-hero width="600px"></nldd-hero>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_hero-max-width')).toBe('600px');
	});

	it('an invalid width sets no --_hero-max-width', async () => {
		el = await fixture('<nldd-hero width="not-a-length"></nldd-hero>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_hero-max-width')).toBe('');
	});

	it.each(['clamp(300px, 50%, 600px)', 'min(600px, 100%)', 'max(320px, 40vw)'])(
		'accepts the CSS math function width "%s"', async (value) => {
			el = await fixture(`<nldd-hero width="${value}"></nldd-hero>`);
			await waitForUpdate(el);
			expect(el.style.getPropertyValue('--_hero-max-width')).not.toBe('');
		});


	/* ============================================================
	   Media via attributes (media-src / media-aspect-ratio)
	   ============================================================ */

	it('media-src renders an internal img and marks the host with media', async () => {
		el = await fixture('<nldd-hero media-src="data:," media-alt=""></nldd-hero>');
		await waitForUpdate(el);
		expect(el.hasAttribute('data-has-media')).toBe(true);
		const img = el.shadowRoot!.querySelector('.hero__media img');
		expect(img).not.toBeNull();
		expect(img!.getAttribute('src')).toBe('data:,');
	});

	it('slotted media wins over media-src (no internal img)', async () => {
		el = await fixture(`<nldd-hero media-src="data:,">${MEDIA}</nldd-hero>`);
		await waitForUpdate(el);
		expect(el.hasAttribute('data-has-media')).toBe(true);
		expect(el.shadowRoot!.querySelector('.hero__media img')).toBeNull();
	});

	it('media-aspect-ratio feeds --_hero-media-aspect-ratio inline', async () => {
		el = await fixture('<nldd-hero media-aspect-ratio="16/9"></nldd-hero>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_hero-media-aspect-ratio')).toBe('16/9');
	});

	it('media-aspect-ratio accepts colon notation', async () => {
		el = await fixture('<nldd-hero media-aspect-ratio="16:9"></nldd-hero>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_hero-media-aspect-ratio')).toBe('16/9');
	});

	it('an invalid media-aspect-ratio sets no inline var', async () => {
		el = await fixture('<nldd-hero media-aspect-ratio="not-a-ratio"></nldd-hero>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_hero-media-aspect-ratio')).toBe('');
	});

	it('clearing media-aspect-ratio reverts to the default ratio', async () => {
		el = await fixture('<nldd-hero media-aspect-ratio="16/9"></nldd-hero>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_hero-media-aspect-ratio')).toBe('16/9');
		el.removeAttribute('media-aspect-ratio');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_hero-media-aspect-ratio')).toBe('');
	});
});
