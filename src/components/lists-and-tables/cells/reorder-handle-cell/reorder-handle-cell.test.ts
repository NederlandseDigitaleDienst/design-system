import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../../test-utils.js';
import './reorder-handle-cell.js';
import { nlddReorderHandleCellTranslations } from './reorder-handle-cell.i18n.js';

describe('nldd-reorder-handle-cell', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-reorder-handle-cell></nldd-reorder-handle-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders the sm size', async () => {
		el = await fixture('<nldd-reorder-handle-cell size="sm"></nldd-reorder-handle-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('uses the default label when not pressed', async () => {
		el = await fixture('<nldd-reorder-handle-cell></nldd-reorder-handle-cell>');
		await waitForUpdate(el);
		const control = el.shadowRoot!.querySelector('.reorder-handle-cell__control');
		expect(control?.getAttribute('aria-label')).toBe(
			nlddReorderHandleCellTranslations['components.reorder-handle-cell.accessible-label'],
		);
	});

	it('applies a custom translation override', async () => {
		el = await fixture('<nldd-reorder-handle-cell></nldd-reorder-handle-cell>');
		(el as any).translations = {
			'components.reorder-handle-cell.accessible-label': 'Aangepaste sleepgreep',
		};
		await waitForUpdate(el);
		const control = el.shadowRoot!.querySelector('.reorder-handle-cell__control');
		expect(control?.getAttribute('aria-label')).toBe('Aangepaste sleepgreep');
	});
});
