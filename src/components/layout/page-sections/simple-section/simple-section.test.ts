import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../../test-utils.js';
import './simple-section.js';

describe('nldd-simple-section', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-simple-section></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a section element in the shadow DOM', async () => {
		el = await fixture('<nldd-simple-section></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.simple-section')).not.toBeNull();
	});

	it('reflects width property to attribute', async () => {
		el = await fixture('<nldd-simple-section></nldd-simple-section>');
		await waitForUpdate(el);
		(el as any).width = 'full';
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('full');
	});

	it('reflects the alignment attributes and leaves the defaults out of the DOM', async () => {
		el = await fixture('<nldd-simple-section></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.hasAttribute('horizontal-alignment')).toBe(false);
		expect(el.hasAttribute('vertical-alignment')).toBe(false);

		(el as unknown as { horizontalAlignment: string }).horizontalAlignment = 'center';
		(el as unknown as { verticalAlignment: string }).verticalAlignment = 'bottom';
		await waitForUpdate(el);
		expect(el.getAttribute('horizontal-alignment')).toBe('center');
		expect(el.getAttribute('vertical-alignment')).toBe('bottom');
	});

	it('lines the children up in the main, where they land', async () => {
		el = await fixture('<nldd-simple-section horizontal-alignment="center" vertical-alignment="center"></nldd-simple-section>');
		await waitForUpdate(el);
		const main = el.shadowRoot!.querySelector('.simple-section__main') as HTMLElement;
		const stijl = getComputedStyle(main);
		expect(stijl.justifyContent).toBe('center');
		expect(stijl.alignItems).toBe('center');
	});
});

// PageSectionMixin is shared by every page section; simple-section is the
// representative host under test here.
describe('PageSectionMixin (via nldd-simple-section)', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('paints no background by default (inherit)', async () => {
		el = await fixture('<nldd-simple-section></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.style.backgroundColor).toBe('');
		expect(
			el.style.getPropertyValue('--context-parent-background-color'),
		).toBe('');
	});

	it('paints and cascades the base surface', async () => {
		el = await fixture('<nldd-simple-section background="base"></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.style.backgroundColor).toBe(
			'var(--semantics-surfaces-base-background-color)',
		);
		expect(
			el.style.getPropertyValue('--context-parent-background-color'),
		).toBe('var(--semantics-surfaces-base-background-color)');
	});

	it('paints the tinted surface', async () => {
		el = await fixture('<nldd-simple-section background="tinted"></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.style.backgroundColor).toBe(
			'var(--semantics-surfaces-tinted-background-color)',
		);
	});

	it('strips block padding with padding-block="0"', async () => {
		el = await fixture('<nldd-simple-section padding-block="0"></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_padding-top')).toBe('0');
		expect(el.style.getPropertyValue('--_padding-bottom')).toBe('0');
	});

	it('maps a numeric padding-block to the space token', async () => {
		el = await fixture('<nldd-simple-section padding-block="24"></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_padding-top')).toBe(
			'var(--primitives-space-24)',
		);
		expect(el.style.getPropertyValue('--_padding-bottom')).toBe(
			'var(--primitives-space-24)',
		);
	});

	it('lets padding-bottom override only the bottom edge', async () => {
		el = await fixture(
			'<nldd-simple-section padding-block="24" padding-bottom="0"></nldd-simple-section>',
		);
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_padding-top')).toBe(
			'var(--primitives-space-24)',
		);
		expect(el.style.getPropertyValue('--_padding-bottom')).toBe('0');
	});

	it('applies height as the host min-height', async () => {
		el = await fixture('<nldd-simple-section height="400px"></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.style.minHeight).toBe('400px');
	});

	it('ignores an invalid height', async () => {
		el = await fixture('<nldd-simple-section height="not-a-length"></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.style.minHeight).toBe('');
	});

	it('maps responsive sm-padding-block to the sm scope vars only', async () => {
		el = await fixture('<nldd-simple-section sm-padding-block="0"></nldd-simple-section>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_sm-padding-top')).toBe('0');
		expect(el.style.getPropertyValue('--_sm-padding-bottom')).toBe('0');
		// Base scope is left untouched (falls back to the responsive default).
		expect(el.style.getPropertyValue('--_padding-top')).toBe('');
	});

	it('lets lg-padding-bottom override only the lg bottom edge', async () => {
		el = await fixture(
			'<nldd-simple-section lg-padding-block="24" lg-padding-bottom="0"></nldd-simple-section>',
		);
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_lg-padding-top')).toBe(
			'var(--primitives-space-24)',
		);
		expect(el.style.getPropertyValue('--_lg-padding-bottom')).toBe('0');
	});
});
