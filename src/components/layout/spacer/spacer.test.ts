import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './spacer.js';

describe('nldd-spacer', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-spacer></nldd-spacer>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('reflects size attribute', async () => {
		el = await fixture('<nldd-spacer size="32"></nldd-spacer>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('32');
	});

	it('reflects direction attribute', async () => {
		el = await fixture('<nldd-spacer direction="horizontal"></nldd-spacer>');
		await waitForUpdate(el);
		expect(el.getAttribute('direction')).toBe('horizontal');
	});

	it('reflects sm-size attribute', async () => {
		el = await fixture('<nldd-spacer sm-size="16"></nldd-spacer>');
		await waitForUpdate(el);
		expect(el.getAttribute('sm-size')).toBe('16');
	});

	it('reflects md-size attribute', async () => {
		el = await fixture('<nldd-spacer md-size="24"></nldd-spacer>');
		await waitForUpdate(el);
		expect(el.getAttribute('md-size')).toBe('24');
	});

	it('reflects lg-size attribute', async () => {
		el = await fixture('<nldd-spacer lg-size="32"></nldd-spacer>');
		await waitForUpdate(el);
		expect(el.getAttribute('lg-size')).toBe('32');
	});

	it('accepts a combination of base size and per-breakpoint overrides', async () => {
		el = await fixture('<nldd-spacer size="16" lg-size="32"></nldd-spacer>');
		await waitForUpdate(el);
		expect((el as unknown as { size: string }).size).toBe('16');
		expect(el.getAttribute('lg-size')).toBe('32');
	});
});
