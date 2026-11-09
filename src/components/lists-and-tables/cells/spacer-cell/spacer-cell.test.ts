import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../../test-utils.js';
import './spacer-cell.js';

describe('nldd-spacer-cell', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-spacer-cell></nldd-spacer-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to size 16, without writing the default to the DOM', async () => {
		el = await fixture('<nldd-spacer-cell></nldd-spacer-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { size: string }).size).toBe('16');
		expect(el.hasAttribute('size')).toBe(false);
	});

	it('reflects size attribute', async () => {
		el = await fixture('<nldd-spacer-cell size="24"></nldd-spacer-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('24');
	});
});
