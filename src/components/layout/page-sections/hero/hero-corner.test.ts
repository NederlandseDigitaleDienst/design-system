import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, nextFrames } from '../../../../test-utils.js';
import { loadTokens } from '../../../../test-tokens.js';
import './hero.js';

const MEDIA = '<img slot="media" src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 4 3\'%3E%3Crect width=\'4\' height=\'3\'/%3E%3C/svg%3E" alt="">';

describe('nldd-hero – corner', () => {
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

	const hero = async (attrs: string, width = 1200, media = MEDIA): Promise<HTMLElement> => {
		el = await fixture(`<nldd-hero ${attrs} style="width: ${width}px">${media}<p>Aanvraag A-1042</p></nldd-hero>`);
		await waitForUpdate(el);
		return el;
	};

	const radii = (part: '.hero__media' | '.hero__main' | '.hero__body') => {
		const style = getComputedStyle(el.shadowRoot!.querySelector(part)!);
		return {
			'top-left': parseFloat(style.borderTopLeftRadius),
			'top-right': parseFloat(style.borderTopRightRadius),
			'bottom-left': parseFloat(style.borderBottomLeftRadius),
			'bottom-right': parseFloat(style.borderBottomRightRadius),
		};
	};

	const rounded = (part: '.hero__media' | '.hero__main' | '.hero__body') =>
		Object.entries(radii(part)).filter(([, radius]) => radius > 0).map(([corner]) => corner);

	it('stays rectangular without corner', async () => {
		await hero('layout="contained"');
		expect(el.hasAttribute('data-media-corner')).toBe(false);
		expect(rounded('.hero__media')).toEqual([]);
		expect(rounded('.hero__main')).toEqual([]);
	});

	it('rounds one media corner and the panel corner facing the image', async () => {
		await hero('corner layout="contained"');
		expect(rounded('.hero__media')).toEqual(['top-right']);
		expect(rounded('.hero__main')).toEqual(['top-right']);
	});

	it('takes 2X the ribbon width on lg, and half that on the panel', async () => {
		await hero('corner layout="contained"');
		const ribbon = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--semantics-brand-ribbon-lg-width'));
		expect(radii('.hero__media')['top-right']).toBe(ribbon * 2);
		expect(radii('.hero__main')['top-right']).toBe(ribbon);
	});

	it('chooses the media corner from main-position', async () => {
		const expected: Record<string, string> = {
			'bottom-left': 'top-right',
			'bottom-right': 'bottom-left',
			'top-left': 'top-right',
			'top-right': 'top-left',
			'left': 'top-right',
			'right': 'top-left',
		};
		for (const [position, corner] of Object.entries(expected)) {
			await hero(`corner layout="contained" main-position="${position}"`);
			expect(el.getAttribute('data-media-corner'), position).toBe(corner);
			cleanup(el);
		}
	});

	it('takes a corner of its own choosing', async () => {
		await hero('corner="bottom-left" layout="contained" main-position="top-right"');
		expect(rounded('.hero__media')).toEqual(['bottom-left']);
	});

	it('takes a corner with spaces around it', async () => {
		await hero('corner=" bottom-left " layout="contained" main-position="top-right"');
		expect(el.getAttribute('data-media-corner')).toBe('bottom-left');
	});

	it('takes auto as the hero choosing', async () => {
		await hero('corner="auto" layout="contained"');
		expect(el.getAttribute('data-media-corner')).toBe('top-right');
		expect(el.matches(':state(corner-unknown)')).toBe(false);
	});

	it('treats an inherited key as an unknown main-position', async () => {
		await hero('corner layout="contained" main-position="constructor"');
		expect(el.getAttribute('data-media-corner')).toBe('top-right');
	});

	it('writes no panel corner when the panel has none', async () => {
		await hero('corner layout="contained" main-position="left"');
		expect(el.hasAttribute('data-main-corner')).toBe(false);
	});

	it('falls back to choosing the corner for an unknown value', async () => {
		await hero('corner="middle" layout="contained"');
		expect(el.getAttribute('data-media-corner')).toBe('top-right');
		expect(el.matches(':state(corner-unknown)')).toBe(true);
	});

	it('puts the panel against the edge of the image in contained', async () => {
		await hero('corner layout="contained" main-width="50%"');
		const media = el.shadowRoot!.querySelector('.hero__media')!.getBoundingClientRect();
		const main = el.shadowRoot!.querySelector('.hero__main')!.getBoundingClientRect();
		expect(main.left).toBe(media.left);
		expect(main.bottom).toBe(media.bottom);
		expect(main.width).toBeCloseTo(media.width / 2, 0);
	});

	it('keeps the section gap around the panel without corner', async () => {
		await hero('layout="contained"');
		const media = el.shadowRoot!.querySelector('.hero__media')!.getBoundingClientRect();
		const main = el.shadowRoot!.querySelector('.hero__main')!.getBoundingClientRect();
		expect(main.left).toBeGreaterThan(media.left);
	});

	it('leaves a panel along a full side or across the image square', async () => {
		await hero('corner layout="contained" main-position="left"');
		expect(rounded('.hero__main')).toEqual([]);
		cleanup(el);
		await hero('corner layout="contained" main-width="full"');
		expect(rounded('.hero__main')).toEqual([]);
		// The strip covers both bottom corners, so the media corner moves up.
		expect(rounded('.hero__media')).toEqual(['top-right']);
	});

	it('stays rectangular in overlap and says so', async () => {
		await hero('corner main-position="bottom-right"');
		expect(el.hasAttribute('data-media-corner')).toBe(false);
		expect(rounded('.hero__media')).toEqual([]);
		expect(el.matches(':state(corner-unsupported)')).toBe(true);
	});

	it('stays rectangular with a centered panel and says so', async () => {
		await hero('corner layout="contained" main-position="top-center"');
		expect(el.hasAttribute('data-media-corner')).toBe(false);
		expect(el.matches(':state(corner-unsupported)')).toBe(true);
	});

	it('moves a bottom corner to the top on mobile and keeps the panel square', async () => {
		await hero('corner layout="contained" main-position="bottom-right"', 375);
		expect(rounded('.hero__media')).toEqual(['top-left']);
		expect(rounded('.hero__main')).toEqual([]);
	});

	it('rounds the hero itself without media', async () => {
		await hero('corner', 1200, '');
		expect(rounded('.hero__body')).toEqual(['top-right']);
		expect(rounded('.hero__main')).toEqual(['top-right']);
	});

	it('rounds the hero without media in overlap', async () => {
		await hero('corner layout="overlap"', 1200, '');
		expect(rounded('.hero__body')).toEqual(['top-right']);
		expect(el.matches(':state(corner-unsupported)')).toBe(false);
	});

	it('takes half the radius without media', async () => {
		el = await fixture(`<nldd-hero corner style="width: 1200px"><p style="height: 400px">Aanvraag A-1042</p></nldd-hero>`);
		await waitForUpdate(el);
		await nextFrames();
		const ribbon = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--semantics-brand-ribbon-lg-width'));
		expect(radii('.hero__body')['top-right']).toBe(ribbon);
	});

	it('never takes more than a third of the height without media', async () => {
		await hero('corner', 1200, '');
		await nextFrames();
		const body = el.shadowRoot!.querySelector('.hero__body')!.getBoundingClientRect();
		const ribbon = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--semantics-brand-ribbon-lg-width'));
		expect(body.height / 3).toBeLessThan(ribbon);
		expect(radii('.hero__body')['top-right']).toBeCloseTo(body.height / 3, 0);
	});

	it('never takes more than a third of a low image', async () => {
		await hero('corner layout="contained" media-height="90px"');
		await nextFrames();
		const media = el.shadowRoot!.querySelector('.hero__media')!.getBoundingClientRect();
		const ribbon = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--semantics-brand-ribbon-lg-width'));
		expect(Math.min(media.width, media.height) / 3).toBeLessThan(ribbon * 2);
		expect(radii('.hero__media')['top-right']).toBeCloseTo(Math.min(media.width, media.height) / 3, 0);
	});

	it('chooses a top corner without media, away from the side of the text', async () => {
		const expected: Record<string, string> = {
			'bottom-left': 'top-right',
			'left': 'top-right',
			'top-left': 'top-right',
			'bottom-right': 'top-left',
			'right': 'top-left',
			'top-right': 'top-left',
		};
		for (const [position, corner] of Object.entries(expected)) {
			await hero(`corner="auto" main-position="${position}"`, 1200, '');
			expect(el.getAttribute('data-media-corner'), position).toBe(corner);
			cleanup(el);
		}
	});

	it('recomputes the corners when media is slotted after the first render', async () => {
		await hero('corner layout="contained"', 1200, '');
		expect(el.getAttribute('data-main-corner')).toBeNull();
		el.insertAdjacentHTML('afterbegin', MEDIA);
		await waitForUpdate(el);
		expect(el.getAttribute('data-main-corner')).toBe('top-right');
		expect(rounded('.hero__media')).toEqual(['top-right']);
	});

	it('drops the corner when the attribute is removed', async () => {
		await hero('corner layout="contained"');
		el.removeAttribute('corner');
		await waitForUpdate(el);
		expect(el.hasAttribute('data-media-corner')).toBe(false);
		expect(rounded('.hero__media')).toEqual([]);
	});

	it('states that the chosen corner sits under the panel', async () => {
		await hero('corner="bottom-left" layout="contained" main-position="bottom-left"');
		expect(el.matches(':state(corner-covered)')).toBe(true);
	});

	it('covers nothing when the hero chooses the corner', async () => {
		await hero('corner layout="contained" main-width="full"');
		expect(el.matches(':state(corner-covered)')).toBe(false);
	});
	it('zet het paneel op mobiel onder de afbeelding, even breed', async () => {
		await hero('corner="top-left" layout="contained" main-position="bottom-left"', 375);
		const media = el.shadowRoot!.querySelector('.hero__media')!.getBoundingClientRect();
		const main = el.shadowRoot!.querySelector('.hero__main')!.getBoundingClientRect();
		expect(main.top).toBeCloseTo(media.bottom, 0);
		expect(main.left).toBeCloseTo(media.left, 0);
		expect(main.right).toBeCloseTo(media.right, 0);
	});

	it('laat het paneel op mobiel zonder corner over de afbeelding vallen', async () => {
		await hero('layout="contained" main-position="bottom-left"', 375);
		const media = el.shadowRoot!.querySelector('.hero__media')!.getBoundingClientRect();
		const main = el.shadowRoot!.querySelector('.hero__main')!.getBoundingClientRect();
		expect(main.top).toBeLessThan(media.bottom);
		expect(main.left).toBeGreaterThan(media.left);
	});
	it('geeft het paneel meer padding langs de twee kanten van zijn afgeronde hoek', async () => {
		await hero('corner="top-left" layout="contained" main-position="bottom-right"');
		expect(el.getAttribute('data-main-corner')).toBe('top-left');
		const style = getComputedStyle(el.shadowRoot!.querySelector('.hero__main')!);
		const [top, right, bottom, left] = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(parseFloat);
		expect(top).toBeGreaterThan(bottom);
		expect(left).toBeGreaterThan(right);
	});
	it('laat een paneel langs de rand van de hoek niet over de boog lopen', async () => {
		await hero('corner layout="contained" main-position="top-right" main-width="90%"');
		expect(el.getAttribute('data-media-corner')).toBe('top-left');
		const media = el.shadowRoot!.querySelector('.hero__media')!;
		const main = el.shadowRoot!.querySelector('.hero__main')!.getBoundingClientRect();
		const radius = parseFloat(getComputedStyle(media).borderTopLeftRadius);
		expect(main.left).toBeGreaterThan(media.getBoundingClientRect().left + radius);
	});

	it('laat het paneel doorlopen als de hoek aan de overkant zit', async () => {
		await hero('corner="bottom-left" layout="contained" main-position="top-right" main-width="90%"');
		const media = el.shadowRoot!.querySelector('.hero__media')!.getBoundingClientRect();
		const main = el.shadowRoot!.querySelector('.hero__main')!.getBoundingClientRect();
		expect(main.width).toBeCloseTo(media.width * 0.9, 0);
	});
});
