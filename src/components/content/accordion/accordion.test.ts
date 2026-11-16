import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest';
import { fixture, cleanup } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import type { NLDDAccordion } from './accordion.js';
import type { NLDDAccordionItem } from '../accordion-item/accordion-item.js';
import './accordion.js';
import '../accordion-item/accordion-item.js';

const items = (count: number, open: number[] = []) => Array.from({ length: count }, (_, index) => `
	<nldd-accordion-item text="Vraag ${index + 1}"${open.includes(index) ? ' open' : ''}><p>Antwoord</p></nldd-accordion-item>
`).join('');

describe('nldd-accordion', () => {
	let el: NLDDAccordion;
	let removeTokens: () => void;

	beforeAll(() => {
		removeTokens = loadTokens();
	});

	afterAll(() => removeTokens());

	afterEach(() => {
		if (el) cleanup(el);
	});

	const all = () => Array.from(el.querySelectorAll('nldd-accordion-item')) as NLDDAccordionItem[];
	const details = (item: NLDDAccordionItem) => item.shadowRoot!.querySelector('details')!;
	const summary = (item: NLDDAccordionItem) => item.shadowRoot!.querySelector('summary')!;
	const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

	it('renders without errors', async () => {
		el = await fixture(`<nldd-accordion>${items(2)}</nldd-accordion>`);
		expect(el.shadowRoot).not.toBeNull();
		expect(all()[0].shadowRoot).not.toBeNull();
	});

	it('builds each item on a native details that starts closed', async () => {
		el = await fixture(`<nldd-accordion>${items(2, [1])}</nldd-accordion>`);
		const [first, second] = all();
		expect(details(first).open).toBe(false);
		expect(details(second).open).toBe(true);
		expect(summary(first).textContent).toContain('Vraag 1');
	});

	it('keeps open in step with a click on the title and fires toggle', async () => {
		el = await fixture(`<nldd-accordion>${items(1)}</nldd-accordion>`);
		const [item] = all();
		let toggles = 0;
		item.addEventListener('toggle', () => toggles++);
		summary(item).click();
		await settle();
		await item.updateComplete;
		expect(item.open).toBe(true);
		expect(item.hasAttribute('open')).toBe(true);
		expect(toggles).toBe(1);
	});

	it('lets several items be open without exclusive', async () => {
		el = await fixture(`<nldd-accordion>${items(2)}</nldd-accordion>`);
		const [first, second] = all();
		summary(first).click();
		summary(second).click();
		await settle();
		expect(first.open).toBe(true);
		expect(second.open).toBe(true);
	});

	it('closes the other item with exclusive, also when opened from the property', async () => {
		el = await fixture(`<nldd-accordion exclusive>${items(3)}</nldd-accordion>`);
		const [first, second, third] = all();
		summary(first).click();
		await settle();
		summary(second).click();
		await settle();
		expect(first.open).toBe(false);
		expect(second.open).toBe(true);
		third.open = true;
		await third.updateComplete;
		await settle();
		expect(second.open).toBe(false);
		expect(third.open).toBe(true);
	});

	it('keeps only the first open item with exclusive, as details sharing a name do', async () => {
		el = await fixture(`<nldd-accordion exclusive>${items(3, [1, 2])}</nldd-accordion>`);
		const [, second, third] = all();
		expect(second.open).toBe(true);
		expect(third.open).toBe(false);
	});

	it('leaves the items of a nested accordion alone', async () => {
		el = await fixture(`
			<nldd-accordion exclusive>
				<nldd-accordion-item text="Buiten" open>
					<nldd-accordion exclusive>${items(1)}</nldd-accordion>
				</nldd-accordion-item>
			</nldd-accordion>
		`);
		const [outer, inner] = all();
		summary(inner).click();
		await settle();
		expect(inner.open).toBe(true);
		expect(outer.open).toBe(true);
	});

	it('joins the items into one block, with a line between them', async () => {
		el = await fixture(`<nldd-accordion>${items(2)}</nldd-accordion>`);
		const [first, second] = all();
		expect(getComputedStyle(details(first)).borderTopStyle).toBe('none');
		expect(getComputedStyle(details(second)).borderTopStyle).toBe('solid');
		expect(getComputedStyle(summary(first)).borderTopLeftRadius).not.toBe('0px');
		expect(getComputedStyle(summary(second)).borderTopLeftRadius).toBe('0px');
		expect(getComputedStyle(summary(second)).borderBottomLeftRadius).not.toBe('0px');
	});

	it('paints nothing square over the rounded corners of the block', async () => {
		el = await fixture(`<nldd-accordion>${items(2, [1])}</nldd-accordion>`);
		for (const item of all()) {
			expect(getComputedStyle(details(item)).backgroundColor).toBe('rgba(0, 0, 0, 0)');
		}
	});

	it('makes the title bar as high as a control and sticks it to the top', async () => {
		el = await fixture(`<nldd-accordion>${items(1)}</nldd-accordion>`);
		const bar = summary(all()[0]);
		expect(bar.getBoundingClientRect().height).toBe(44);
		expect(getComputedStyle(bar).position).toBe('sticky');
	});
});
