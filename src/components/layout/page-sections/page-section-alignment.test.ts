import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './one-half-one-half-section/one-half-one-half-section.js';
import './two-thirds-one-third-section/two-thirds-one-third-section.js';
import './one-third-two-thirds-section/one-third-two-thirds-section.js';

const SECTIONS = ['one-half-one-half-section', 'two-thirds-one-third-section', 'one-third-two-thirds-section'];

describe('page sections with columns: vertical-alignment', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	/** The vertical center of the shorter right column, relative to the columns. */
	const rightCenter = async (block: string, alignment: string, width: number) => {
		el = await fixture(`
			<nldd-${block} vertical-alignment="${alignment}" style="width: ${width}px">
				<div slot="left" style="height: 300px">Lang</div>
				<div slot="right" style="height: 100px">Kort</div>
			</nldd-${block}>
		`);
		await waitForUpdate(el);
		const columns = el.shadowRoot!.querySelector(`.${block}__columns`)!.getBoundingClientRect();
		const right = el.querySelector('[slot="right"]')!.getBoundingClientRect();
		return { offset: Math.round(right.top + right.height / 2 - columns.top), height: Math.round(columns.height) };
	};

	for (const block of SECTIONS) {
		it(`nldd-${block} centers the shorter column with center, and keeps it on top by default`, async () => {
			const centered = await rightCenter(block, 'center', 1200);
			expect(centered.offset).toBe(150);
			const top = await rightCenter(block, 'top', 1200);
			expect(top.offset).toBe(50);
			const bottom = await rightCenter(block, 'bottom', 1200);
			expect(bottom.offset).toBe(250);
		});
	}

	it('leaves stacked columns alone', async () => {
		const stacked = await rightCenter('two-thirds-one-third-section', 'center', 600);
		expect(stacked.height).toBeGreaterThanOrEqual(400);
		const right = el.querySelector('[slot="right"]')!.getBoundingClientRect();
		const columns = el.shadowRoot!.querySelector('.two-thirds-one-third-section__columns')!.getBoundingClientRect();
		expect(Math.round(right.width)).toBe(Math.round(columns.width));
	});
});
