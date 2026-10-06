import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, installUniversalReset } from '../../../../test-utils.js';
import './cell.js';

describe('nldd-cell', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-cell></nldd-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to fit-content width', async () => {
		el = await fixture('<nldd-cell></nldd-cell>');
		await waitForUpdate(el);
		// The default (fit-content) is kept out of the DOM; the property is the source of truth.
		expect((el as unknown as { width: string }).width).toBe('fit-content');
		expect(el.hasAttribute('width')).toBe(false);
	});

	it('reflects width attribute', async () => {
		el = await fixture('<nldd-cell width="full"></nldd-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('full');
	});

	it('sets inline width style for explicit CSS length', async () => {
		el = await fixture('<nldd-cell width="120px"></nldd-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_cell-width')).toBe('120px');
	});

	it('sets --_cell-min-width custom property', async () => {
		el = await fixture('<nldd-cell min-width="80px"></nldd-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_cell-min-width')).toBe('80px');
	});

	it('sets --_cell-max-width custom property', async () => {
		el = await fixture('<nldd-cell max-width="200px"></nldd-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_cell-max-width')).toBe('200px');
	});

	it('sets --_cell-min-height custom property', async () => {
		el = await fixture('<nldd-cell min-height="44px"></nldd-cell>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_cell-min-height')).toBe('44px');
	});

	it('defaults to center vertical alignment', async () => {
		el = await fixture('<nldd-cell></nldd-cell>');
		await waitForUpdate(el);
		expect((el as unknown as { verticalAlignment: string }).verticalAlignment).toBe('center');
		expect(el.hasAttribute('vertical-alignment')).toBe(false);
	});

	it('reflects vertical-alignment top', async () => {
		el = await fixture('<nldd-cell vertical-alignment="top"></nldd-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('vertical-alignment')).toBe('top');
	});

	it('reflects vertical-alignment bottom', async () => {
		el = await fixture('<nldd-cell vertical-alignment="bottom"></nldd-cell>');
		await waitForUpdate(el);
		expect(el.getAttribute('vertical-alignment')).toBe('bottom');
	});
});

describe('nldd-cell onder een universele reset', () => {
	let el: HTMLElement;
	let removeReset: () => void;

	afterEach(() => {
		removeReset();
		if (el) cleanup(el);
	});

	it('behoudt de padding-block uit de rij-context', async () => {
		removeReset = installUniversalReset();
		el = await fixture(`
			<div style="--context-cell-padding-block: 12px;">
				<nldd-cell>
					<span>Inhoud</span>
				</nldd-cell>
			</div>
		`);
		const cell = el.querySelector('nldd-cell') as HTMLElement;
		await waitForUpdate(cell);
		const content = cell.querySelector('span')!;
		const offset = content.getBoundingClientRect().top - cell.getBoundingClientRect().top;
		expect(offset).toBe(12);
	});
});
