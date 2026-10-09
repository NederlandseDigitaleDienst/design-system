import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './simple-section/simple-section.js';
import './hero/hero.js';
import './full-bleed-section/full-bleed-section.js';
import './one-half-one-half-section/one-half-one-half-section.js';
import './one-third-two-thirds-section/one-third-two-thirds-section.js';
import './two-thirds-one-third-section/two-thirds-one-third-section.js';
import './sidebar-section/sidebar-section.js';
import '../page/page.js';

const SECTIONS = [
	'nldd-simple-section',
	'nldd-hero',
	'nldd-full-bleed-section',
	'nldd-one-half-one-half-section',
	'nldd-one-third-two-thirds-section',
	'nldd-two-thirds-one-third-section',
	'nldd-sidebar-section',
];

describe('page sections: grow', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	for (const tag of SECTIONS) {
		it(`${tag} takes the height a page has left when it is the last section`, async () => {
			el = await fixture(`
				<nldd-page style="height: 800px">
					<nldd-simple-section>A</nldd-simple-section>
					<${tag}>B</${tag}>
				</nldd-page>
			`);
			await waitForUpdate(el);
			const section = el.querySelector(`${tag}:last-of-type`) as HTMLElement;
			await waitForUpdate(section);
			await expect.poll(() => section.hasAttribute('data-growing')).toBe(true);
			expect(getComputedStyle(section).flexGrow).toBe('1');
		});

		it(`${tag} grows with grow, outside a page too`, async () => {
			el = await fixture(`<${tag} grow>B</${tag}>`);
			await waitForUpdate(el);
			expect(getComputedStyle(el).flexGrow).toBe('1');
		});
	}

	it('lets the section with grow take the height instead of the last one', async () => {
		el = await fixture(`
			<nldd-page style="height: 800px">
				<nldd-simple-section id="a" grow>A</nldd-simple-section>
				<nldd-simple-section id="b">B</nldd-simple-section>
			</nldd-page>
		`);
		await waitForUpdate(el);
		const a = el.querySelector('#a') as HTMLElement;
		const b = el.querySelector('#b') as HTMLElement;
		await expect.poll(() => a.hasAttribute('data-growing')).toBe(true);
		expect(getComputedStyle(a).flexGrow).toBe('1');
		expect(getComputedStyle(b).flexGrow).toBe('0');
		expect(a.getBoundingClientRect().height).toBeGreaterThan(b.getBoundingClientRect().height);
	});

	it('puts no attributes on a section that the author did not set', async () => {
		el = await fixture('<nldd-page><nldd-hero></nldd-hero><nldd-simple-section>A</nldd-simple-section></nldd-page>');
		await waitForUpdate(el);
		for (const tag of ['nldd-hero', 'nldd-simple-section']) {
			const section = el.querySelector(tag) as HTMLElement;
			await waitForUpdate(section);
			expect(section.hasAttribute('width')).toBe(false);
			expect(section.hasAttribute('background')).toBe(false);
		}
		expect(el.querySelector('nldd-hero')!.hasAttribute('media-aspect-ratio')).toBe(false);
		const section = el.querySelector('nldd-simple-section') as HTMLElement & { background: string; width: string };
		section.background = 'tinted';
		section.width = 'full';
		await waitForUpdate(section);
		expect(section.getAttribute('background')).toBe('tinted');
		expect(section.getAttribute('width')).toBe('full');
	});
});
