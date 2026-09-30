import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../../test-utils.js';
import './icon-cell.js';

describe('nldd-icon-cell', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-icon-cell></nldd-icon-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to center vertical alignment', async () => {
		el = await fixture('<nldd-icon-cell></nldd-icon-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { verticalAlignment: string }).verticalAlignment).toBe('center');
		expect(el.hasAttribute('vertical-alignment')).toBe(false);
	});

	it('reflects vertical-alignment attribute', async () => {
		el = await fixture('<nldd-icon-cell vertical-alignment="top"></nldd-icon-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('vertical-alignment')).toBe('top');
	});

	it('defaults to size 24 and reflects it', async () => {
		el = await fixture('<nldd-icon-cell></nldd-icon-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { size: string }).size).toBe('24');
		expect(el.getAttribute('size')).toBe('24');
	});

	it('reflects size attribute', async () => {
		el = await fixture('<nldd-icon-cell size="32"></nldd-icon-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('32');
	});

	it('renders an nldd-icon when the icon attribute is set', async () => {
		el = await fixture('<nldd-icon-cell icon="house"></nldd-icon-cell>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('nldd-icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('icon')).toBe('house');
	});

	it('falls back to the default slot when icon attribute is not set', async () => {
		el = await fixture(`
			<nldd-icon-cell>
				<nldd-icon icon="custom"></nldd-icon>
			</nldd-icon-cell>
		`);
		await waitForUpdate(el);
		// No internally-rendered nldd-icon; slot forwards consumer content.
		expect(el.shadowRoot!.querySelector('nldd-icon')).toBeNull();
		expect(el.shadowRoot!.querySelector('slot')).not.toBeNull();
	});

});
