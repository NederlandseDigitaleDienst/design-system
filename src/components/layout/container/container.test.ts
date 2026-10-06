import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, installUniversalReset } from '../../../test-utils.js';
import './container.js';

describe('nldd-container', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-container></nldd-container>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('does not reflect a layout attribute by default (stack is the implicit default)', async () => {
		el = await fixture('<nldd-container></nldd-container>');
		await waitForUpdate(el);
		// No default attribute pollution; stack comes from the .container__inner default style.
		expect(el.hasAttribute('layout')).toBe(false);
		// :host is only the external contract; padding sits on .container, layout on .container__inner.
		expect(getComputedStyle(el).display).toBe('block');
		const inner = el.shadowRoot!.querySelector('.container__inner') as HTMLElement;
		expect(getComputedStyle(inner).display).toBe('flex');
		expect(getComputedStyle(inner).flexDirection).toBe('column');
	});

	it('layout=row sets flex-direction: row on the inner', async () => {
		el = await fixture('<nldd-container layout="row"></nldd-container>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('.container__inner') as HTMLElement;
		expect(getComputedStyle(inner).flexDirection).toBe('row');
		expect(getComputedStyle(inner).flexWrap).toBe('nowrap');
	});

	it('layout=wrap sets row-reverse-style + flex-wrap on the inner', async () => {
		el = await fixture('<nldd-container layout="wrap"></nldd-container>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('.container__inner') as HTMLElement;
		expect(getComputedStyle(inner).flexDirection).toBe('row');
		expect(getComputedStyle(inner).flexWrap).toBe('wrap');
	});

	it('layout=grid switches the inner to display: grid', async () => {
		el = await fixture('<nldd-container layout="grid"></nldd-container>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('.container__inner') as HTMLElement;
		expect(getComputedStyle(inner).display).toBe('grid');
	});

	it('layout=columns keeps the inner as block (multicol)', async () => {
		el = await fixture('<nldd-container layout="columns"></nldd-container>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('.container__inner') as HTMLElement;
		expect(getComputedStyle(inner).display).toBe('block');
		expect(el.getAttribute('layout')).toBe('columns');
	});

	it('layout=lanes uses native grid lanes where supported, multicol fallback otherwise', async () => {
		el = await fixture('<nldd-container layout="lanes"><div>a</div></nldd-container>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('.container__inner') as HTMLElement;
		// native CSS grid lanes where supported, CSS multicol (block) fallback otherwise.
		expect(['block', 'grid-lanes']).toContain(getComputedStyle(inner).display);
		expect(el.getAttribute('layout')).toBe('lanes');
		// slotted children avoid breaking across columns (both branches).
		const child = el.querySelector('div') as HTMLElement;
		expect(getComputedStyle(child).breakInside).toBe('avoid');
	});

	it('column-count="4" sets the --_container-column-count var on the inner', async () => {
		el = await fixture('<nldd-container layout="grid" column-count="4"></nldd-container>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('.container__inner') as HTMLElement;
		expect(getComputedStyle(inner).getPropertyValue('--_container-column-count').trim()).toBe('4');
		expect(getComputedStyle(inner).getPropertyValue('--_container-track-min').trim()).toBe('0');
	});

	it('reflects column-count + per-viewport variants as integer attributes', async () => {
		el = await fixture('<nldd-container column-count="4" sm-column-count="1" md-column-count="2" lg-column-count="4"></nldd-container>');
		await waitForUpdate(el);
		expect(el.getAttribute('column-count')).toBe('4');
		expect(el.getAttribute('sm-column-count')).toBe('1');
		expect(el.getAttribute('md-column-count')).toBe('2');
		expect(el.getAttribute('lg-column-count')).toBe('4');
	});

	it('writes --_container-padding-* longhands from padding attr', async () => {
		el = await fixture('<nldd-container padding="16"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-padding-top')).toBe('var(--primitives-space-16)');
		expect(el.style.getPropertyValue('--_container-padding-right')).toBe('var(--primitives-space-16)');
		expect(el.style.getPropertyValue('--_container-padding-bottom')).toBe('var(--primitives-space-16)');
		expect(el.style.getPropertyValue('--_container-padding-left')).toBe('var(--primitives-space-16)');
	});

	it('per-side padding overrides axis and all', async () => {
		el = await fixture('<nldd-container padding="16" padding-block="8" padding-top="32"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-padding-top')).toBe('var(--primitives-space-32)');
		expect(el.style.getPropertyValue('--_container-padding-bottom')).toBe('var(--primitives-space-8)');
		expect(el.style.getPropertyValue('--_container-padding-right')).toBe('var(--primitives-space-16)');
		expect(el.style.getPropertyValue('--_container-padding-left')).toBe('var(--primitives-space-16)');
	});

	it('writes scoped --_container-sm-padding-* from sm-padding attr', async () => {
		el = await fixture('<nldd-container sm-padding="8"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-sm-padding-top')).toBe('var(--primitives-space-8)');
		expect(el.style.getPropertyValue('--_container-sm-padding-left')).toBe('var(--primitives-space-8)');
	});

	// The three breakpoint vars are what the styles read; a plain gap fills each
	// one the consumer left open.
	it('writes the plain gap into every breakpoint var', async () => {
		el = await fixture('<nldd-container gap="12"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-sm-gap')).toBe('var(--primitives-space-12)');
		expect(el.style.getPropertyValue('--_container-md-gap')).toBe('var(--primitives-space-12)');
		expect(el.style.getPropertyValue('--_container-lg-gap')).toBe('var(--primitives-space-12)');
	});

	it('keeps a breakpoint gap set beside a plain one', async () => {
		el = await fixture('<nldd-container gap="12" md-gap="32"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-sm-gap')).toBe('var(--primitives-space-12)');
		expect(el.style.getPropertyValue('--_container-md-gap')).toBe('var(--primitives-space-32)');
	});

	it('writes responsive --_container-sm-gap', async () => {
		el = await fixture('<nldd-container sm-gap="4"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-sm-gap')).toBe('var(--primitives-space-4)');
	});

	it('maps horizontal-alignment to justify-content for layout=row', async () => {
		el = await fixture('<nldd-container layout="row" horizontal-alignment="center"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-justify-content')).toBe('center');
		expect(el.style.getPropertyValue('--_container-align-items')).toBe('');
	});

	it('maps horizontal-alignment to align-items for layout=stack (default)', async () => {
		el = await fixture('<nldd-container horizontal-alignment="right"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-align-items')).toBe('flex-end');
		expect(el.style.getPropertyValue('--_container-justify-content')).toBe('');
	});

	it('maps vertical-alignment to align-items for layout=row', async () => {
		el = await fixture('<nldd-container layout="row" vertical-alignment="bottom"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-align-items')).toBe('flex-end');
	});

	it('treats layout=wrap like layout=row for alignment-axis mapping', async () => {
		el = await fixture('<nldd-container layout="wrap" horizontal-alignment="center"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-justify-content')).toBe('center');
	});

	it('maps grid vertical-alignment to align-items (per-cell), not justify-content', async () => {
		el = await fixture('<nldd-container layout="grid" vertical-alignment="center"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-align-items')).toBe('center');
		expect(el.style.getPropertyValue('--_container-justify-content')).toBe('');
	});

	it('maps grid horizontal-alignment to both justify-items and justify-content', async () => {
		el = await fixture('<nldd-container layout="grid" horizontal-alignment="center"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-justify-items')).toBe('center');
		expect(el.style.getPropertyValue('--_container-justify-content')).toBe('center');
	});

	it('bridges order attr on a slotted child to --_container-slot-order inline custom prop', async () => {
		el = await fixture('<nldd-container layout="row"><div order="3"></div></nldd-container>');
		await waitForUpdate(el);
		const child = el.querySelector('div') as HTMLElement;
		expect(child.style.getPropertyValue('--_container-slot-order')).toBe('3');
	});

	it('bridges sm-order / md-order / lg-order independently', async () => {
		el = await fixture('<nldd-container layout="row"><div order="1" sm-order="5" md-order="2" lg-order="9"></div></nldd-container>');
		await waitForUpdate(el);
		const child = el.querySelector('div') as HTMLElement;
		expect(child.style.getPropertyValue('--_container-slot-order')).toBe('1');
		expect(child.style.getPropertyValue('--_container-slot-sm-order')).toBe('5');
		expect(child.style.getPropertyValue('--_container-slot-md-order')).toBe('2');
		expect(child.style.getPropertyValue('--_container-slot-lg-order')).toBe('9');
	});

	it('accepts negative order values', async () => {
		el = await fixture('<nldd-container layout="row"><div order="-1"></div></nldd-container>');
		await waitForUpdate(el);
		const child = el.querySelector('div') as HTMLElement;
		expect(child.style.getPropertyValue('--_container-slot-order')).toBe('-1');
	});

	it('puts a width length in a custom property and leaves the keywords to CSS', async () => {
		el = await fixture('<nldd-container width="480px" min-width="280px" max-width="640px"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-width')).toBe('480px');
		expect(el.style.getPropertyValue('--_container-min-width')).toBe('280px');
		expect(el.style.getPropertyValue('--_container-max-width')).toBe('640px');

		el.setAttribute('width', 'fit-content');
		await waitForUpdate(el);
		// A keyword is a selector, not a value: nothing lands inline.
		expect(el.style.getPropertyValue('--_container-width')).toBe('');
		expect(el.getAttribute('width')).toBe('fit-content');
	});

	it('clears a width that is not a length, so the default rule applies again', async () => {
		el = await fixture('<nldd-container width="480px"></nldd-container>');
		await waitForUpdate(el);
		el.setAttribute('width', 'nogal breed');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-width')).toBe('');
		expect(el.getAttribute('width')).toBe('');
	});

	it('removes the inline custom prop when a width attribute is cleared', async () => {
		el = await fixture('<nldd-container max-width="640px"></nldd-container>');
		await waitForUpdate(el);
		el.removeAttribute('max-width');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-max-width')).toBe('');
	});

	it('removes the inline custom prop when the order attribute is cleared', async () => {
		el = await fixture('<nldd-container layout="row"><div order="3"></div></nldd-container>');
		await waitForUpdate(el);
		const child = el.querySelector('div') as HTMLElement;
		child.removeAttribute('order');
		await new Promise(r => requestAnimationFrame(() => r(null)));
		expect(child.style.getPropertyValue('--_container-slot-order')).toBe('');
	});

	it('accepts 0 as padding value', async () => {
		el = await fixture('<nldd-container padding="0"></nldd-container>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_container-padding-top')).toBe('0');
	});
});

describe('nldd-container onder een universele reset', () => {
	let el: HTMLElement;
	let removeReset: () => void;

	afterEach(() => {
		removeReset();
		if (el) cleanup(el);
	});

	it('behoudt de padding rond slotted content', async () => {
		removeReset = installUniversalReset();
		el = await fixture(`
			<div style="--primitives-space-16: 16px;">
				<nldd-container padding="16">
					<p>Inhoud</p>
				</nldd-container>
			</div>
		`);
		const container = el.querySelector('nldd-container') as HTMLElement;
		await waitForUpdate(container);
		const content = container.querySelector('p')!;
		const offset = content.getBoundingClientRect().left - container.getBoundingClientRect().left;
		expect(offset).toBe(16);
	});
});

// With a dozen padding attributes, "padding/gap is not a step" tells you the
// value was wrong but not which attribute to go and fix.
describe('nldd-container – a warning names the attribute it came from', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	const warnFor = async (markup: string) => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(markup);
		await waitForUpdate(el);
		return warn.mock.calls.map(call => String(call[0])).join('\n');
	};

	it('names lg-padding-right, not padding/gap', async () => {
		const message = await warnFor('<nldd-container lg-padding-right="17"></nldd-container>');
		expect(message).toContain('lg-padding-right="17"');
	});

	it('names the shorthand when the value came from the shorthand', async () => {
		const message = await warnFor('<nldd-container padding-block="17"></nldd-container>');
		expect(message).toContain('padding-block="17"');
	});

	it('names the breakpoint gap', async () => {
		const message = await warnFor('<nldd-container md-gap="17"></nldd-container>');
		expect(message).toContain('md-gap="17"');
	});
});
