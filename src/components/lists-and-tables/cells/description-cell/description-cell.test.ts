import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../../test-utils.js';
import './description-cell.js';

describe('nldd-description-cell', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-description-cell></nldd-description-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to full width', async () => {
		el = await fixture('<nldd-description-cell></nldd-description-cell>');
		await waitForUpdate(el);
		// The default (full) is kept out of the DOM; the property is the source of truth.
		expect((el as unknown as { width: string }).width).toBe('full');
		expect(el.hasAttribute('width')).toBe(false);
	});

	it('reflects width attribute', async () => {
		el = await fixture('<nldd-description-cell width="fit-content"></nldd-description-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('fit-content');
	});

	it('sets inline width style for explicit CSS length', async () => {
		el = await fixture('<nldd-description-cell width="200px"></nldd-description-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_description-cell-width')).toBe('200px');
	});

	it('sets --_description-cell-min-width custom property', async () => {
		el = await fixture('<nldd-description-cell min-width="80px"></nldd-description-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_description-cell-min-width')).toBe('80px');
	});

	it('sets --_description-cell-max-width custom property', async () => {
		el = await fixture('<nldd-description-cell max-width="300px"></nldd-description-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_description-cell-max-width')).toBe('300px');
	});

	it('sets --_description-cell-min-height custom property', async () => {
		el = await fixture('<nldd-description-cell min-height="44px"></nldd-description-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_description-cell-min-height')).toBe('44px');
	});

	it('defaults to center vertical alignment', async () => {
		el = await fixture('<nldd-description-cell></nldd-description-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { verticalAlignment: string }).verticalAlignment).toBe('center');
		expect(el.hasAttribute('vertical-alignment')).toBe(false);
	});

	it('reflects vertical-alignment top', async () => {
		el = await fixture('<nldd-description-cell vertical-alignment="top"></nldd-description-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('vertical-alignment')).toBe('top');
	});

	it('reflects vertical-alignment bottom', async () => {
		el = await fixture('<nldd-description-cell vertical-alignment="bottom"></nldd-description-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('vertical-alignment')).toBe('bottom');
	});

	it('renders slotted title content', async () => {
		el = await fixture('<nldd-description-cell><p slot="title">Label</p></nldd-description-cell>');
		await waitForUpdate(el);
		expect(el.querySelector('[slot="title"]')?.textContent?.trim()).toBe('Label');
	});

	it('renders slotted description content', async () => {
		el = await fixture('<nldd-description-cell><p slot="description">Description</p></nldd-description-cell>');
		await waitForUpdate(el);
		expect(el.querySelector('[slot="description"]')?.textContent?.trim()).toBe('Description');
	});
});
