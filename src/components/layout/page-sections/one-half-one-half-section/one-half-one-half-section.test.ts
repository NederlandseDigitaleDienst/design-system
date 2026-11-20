import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, waitForUpdate, sectionFixture } from '../../../../test-utils.js';
import './one-half-one-half-section.js';

describe('nldd-one-half-one-half-section', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await sectionFixture('<nldd-one-half-one-half-section></nldd-one-half-one-half-section>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a section element in the shadow DOM', async () => {
		el = await sectionFixture('<nldd-one-half-one-half-section></nldd-one-half-one-half-section>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('section')).not.toBeNull();
	});

	it('renders main and aside columns', async () => {
		el = await sectionFixture('<nldd-one-half-one-half-section></nldd-one-half-one-half-section>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.one-half-one-half-section__left-column')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.one-half-one-half-section__right-column')).not.toBeNull();
	});

	it('lays out by the page, also in a narrower container between them', async () => {
		const box = await sectionFixture(`
			<div style="container: layout-container / inline-size; width: 300px;">
				<nldd-one-half-one-half-section></nldd-one-half-one-half-section>
			</div>
		`, 1400);
		el = box;
		const section = box.querySelector('nldd-one-half-one-half-section')!;
		await waitForUpdate(section);
		const columns = section.shadowRoot!.querySelector('.one-half-one-half-section__columns')!;
		expect(getComputedStyle(columns).flexDirection).toBe('row');
	});

});
