import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, waitForUpdate, sectionFixture } from '../../../../test-utils.js';
import './one-third-two-thirds-section.js';

describe('nldd-one-third-two-thirds-section', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await sectionFixture('<nldd-one-third-two-thirds-section></nldd-one-third-two-thirds-section>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a section element in the shadow DOM', async () => {
		el = await sectionFixture('<nldd-one-third-two-thirds-section></nldd-one-third-two-thirds-section>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('section')).not.toBeNull();
	});

	it('renders aside and main columns', async () => {
		el = await sectionFixture('<nldd-one-third-two-thirds-section></nldd-one-third-two-thirds-section>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.one-third-two-thirds-section__left-column')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.one-third-two-thirds-section__right-column')).not.toBeNull();
	});

});
