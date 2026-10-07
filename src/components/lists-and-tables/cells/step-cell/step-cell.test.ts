import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, adoptedCss } from '../../../../test-utils.js';
import type { NLDDStepCell } from './step-cell.js';
import './step-cell.js';

describe('nldd-step-cell', () => {
	let el: NLDDStepCell;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const marker = () => el.shadowRoot!.querySelector('.step-cell__marker');

	it('tekent bij position="only" geen lijn boven en geen lijn eronder', async () => {
		el = await fixture('<nldd-step-cell position="only"></nldd-step-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.step-cell__top-line')).toBeNull();
		expect(el.shadowRoot!.querySelector('.step-cell__bottom-line')).toBeNull();
		expect(el.shadowRoot!.querySelector('.step-cell__marker')).not.toBeNull();
	});

	it('renders without error', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell></nldd-step-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot).not.toBeNull();
	});

	it('stays a bare marker without content', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell></nldd-step-cell>');
		await waitForUpdate(el);

		expect(marker()!.textContent?.trim()).toBe('');
	});

	it('renders a number in the marker', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell size="md" text="2"></nldd-step-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('.step-cell__text')?.textContent?.trim()).toBe('2');
	});

	it('renders an icon in the marker, which wins from text', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell size="md" text="2" icon="check-mark"></nldd-step-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('nldd-icon')?.getAttribute('icon')).toBe('check-mark');
		expect(el.shadowRoot!.querySelector('.step-cell__text')).toBeNull();
	});

	it('takes slotted content in the marker', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell size="md"><nldd-icon icon="check-mark"></nldd-icon></nldd-step-cell>');
		await waitForUpdate(el);

		expect(marker()!.querySelector('slot')).not.toBeNull();
	});

	it('accepts the current step', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell status="current"></nldd-step-cell>');
		await waitForUpdate(el);

		expect(el.getAttribute('status')).toBe('current');
		expect(marker()).not.toBeNull();
	});

	it('reflects the direction so the track can flip its traveled half', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell status="current" direction="up"></nldd-step-cell>');
		await waitForUpdate(el);

		// The colors themselves are asserted in the browser: the design tokens
		// are not loaded here, so every background computes to transparent.
		expect(el.getAttribute('direction')).toBe('up');
		expect(el.shadowRoot!.querySelector('.step-cell__top-line')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.step-cell__bottom-line')).not.toBeNull();
	});

	it('leaves the direction attribute off by default', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell status="current"></nldd-step-cell>');
		await waitForUpdate(el);

		expect(el.hasAttribute('direction')).toBe(false);
	});

	it('reflects level so the styles can size the marker', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell></nldd-step-cell>');
		await waitForUpdate(el);
		expect(el.hasAttribute('level')).toBe(false);

		el.level = 'minor';
		await waitForUpdate(el);

		expect(el.getAttribute('level')).toBe('minor');
	});

	it('keeps a minor marker empty, whatever content it is given', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell status="past" size="md" level="minor" text="2" icon="check-mark">x</nldd-step-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('.step-cell__text')).toBeNull();
		expect(el.shadowRoot!.querySelector('.step-cell__icon')).toBeNull();
		expect(el.shadowRoot!.querySelector('slot')).toBeNull();
	});

	it('keeps every marker empty in the dot variant', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell status="past" text="2"></nldd-step-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('.step-cell__text')).toBeNull();
		expect(el.shadowRoot!.querySelector('slot')).toBeNull();
	});

	// The row reserves a divider's worth of space below itself, so a line that
	// stops at the cell's edge breaks the track at every row boundary. Measured
	// on the declaration, not on two stacked rows: the row's padding bleed only
	// settles after a layout pass, which makes a pixel comparison flaky here.
	it('laat de neergaande lijnen over de rijgrens doorlopen', async () => {
		// The token itself comes from variables.css, which the test page doesn't
		// load, so set it here: what's being checked is that the line reaches past
		// the cell by exactly that thickness.
		el = await fixture<NLDDStepCell>('<nldd-step-cell position="first"></nldd-step-cell>');
		el.style.setProperty('--semantics-dividers-thickness', '1px');
		await waitForUpdate(el);
		const onder = el.shadowRoot!.querySelector('.step-cell__bottom-line')!;
		expect(getComputedStyle(onder).bottom).toBe('-1px');

		el = await fixture<NLDDStepCell>('<nldd-step-cell level="none"></nldd-step-cell>');
		el.style.setProperty('--semantics-dividers-thickness', '1px');
		await waitForUpdate(el);
		const vol = el.shadowRoot!.querySelector('.step-cell__full-line')!;
		expect(getComputedStyle(vol).bottom).toBe('-1px');
	});

	it('renders a full line for status=none', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell level="none"></nldd-step-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('.step-cell__full-line')).not.toBeNull();
		expect(marker()).toBeNull();
	});

	// Named breakpoints are static CSS in the adopted stylesheet, so no <style>
	// is injected and a consumer needs no 'unsafe-inline' in its style-src.
	it('adopts a @container rule for hide-below (md → max-width 640px)', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell hide-below="md"></nldd-step-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('max-width: 640px');
		expect(adoptedCss(el)).toContain('display: none');
		expect(el.shadowRoot!.querySelector('style')).toBeNull();
	});

	it('adopts a @container rule for hide-above (md → min-width 1008px)', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell hide-above="md"></nldd-step-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('min-width: 1008px');
	});
});

describe('nldd-step-cell line', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const lines = (cell: HTMLElement) => ({
		top: !!cell.shadowRoot!.querySelector('.step-cell__top-line'),
		bottom: !!cell.shadowRoot!.querySelector('.step-cell__bottom-line'),
	});

	// The tokens do not load here, so the fixture sets the two colors on the
	// cell itself: without them both halves resolve to nothing and are equal.
	const COLORS = 'style="--_step-cell-track-color: rgb(1, 2, 3); --_step-cell-future-fill-color: rgb(4, 5, 6)"';

	const half = (cell: HTMLElement, which: 'top' | 'bottom') => {
		const line = cell.shadowRoot!.querySelector(`.step-cell__${which}-line`) as HTMLElement;
		const color = getComputedStyle(line).backgroundColor;
		return color === 'rgb(1, 2, 3)' ? 'covered' : color === 'rgb(4, 5, 6)' ? 'open' : color;
	};

	it('follows the position when it is left alone', async () => {
		el = await fixture('<nldd-step-cell position="first"></nldd-step-cell>');
		await waitForUpdate(el);
		expect(lines(el)).toEqual({ top: false, bottom: true });
	});

	it('keeps the half it does not name, as track still ahead', async () => {
		el = await fixture(`<nldd-step-cell position="between" line="top" ${COLORS}></nldd-step-cell>`);
		await waitForUpdate(el);
		expect(lines(el)).toEqual({ top: true, bottom: true });
		expect(half(el, 'top')).toBe('covered');
		expect(half(el, 'bottom')).toBe('open');
	});

	it('draws a half the position leaves out when it calls it covered', async () => {
		el = await fixture('<nldd-step-cell position="first" line="both"></nldd-step-cell>');
		await waitForUpdate(el);
		expect(lines(el)).toEqual({ top: true, bottom: true });
	});

	it('covers neither half on `none`, and takes none away', async () => {
		el = await fixture(`<nldd-step-cell position="between" line="none" ${COLORS}></nldd-step-cell>`);
		await waitForUpdate(el);
		expect(lines(el)).toEqual({ top: true, bottom: true });
		expect(half(el, 'top')).toBe('open');
		expect(half(el, 'bottom')).toBe('open');
	});

	it('leaves a half out that neither the position nor the line asks for', async () => {
		el = await fixture('<nldd-step-cell position="last" line="none"></nldd-step-cell>');
		await waitForUpdate(el);
		expect(lines(el)).toEqual({ top: true, bottom: false });
	});

	it('covers both halves of a current step that opens a group', async () => {
		el = await fixture(`<nldd-step-cell status="current" line="both" ${COLORS}></nldd-step-cell>`);
		await waitForUpdate(el);
		expect(half(el, 'top')).toBe('covered');
		expect(half(el, 'bottom')).toBe('covered');
	});

	it('leaves the half below a plain current step open', async () => {
		el = await fixture(`<nldd-step-cell status="current" ${COLORS}></nldd-step-cell>`);
		await waitForUpdate(el);
		expect(half(el, 'top')).toBe('covered');
		expect(half(el, 'bottom')).toBe('open');
	});
});

describe('nldd-step-cell marker', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const marker = (cell: HTMLElement) =>
		cell.shadowRoot!.querySelector('.step-cell__marker') as HTMLElement;

	it('stands halfway down the row', async () => {
		el = await fixture('<nldd-step-cell size="md" style="height: 100px"></nldd-step-cell>');
		await waitForUpdate(el);
		expect(getComputedStyle(marker(el)).top).toBe('50px');
	});

	it('is met by both line ends', async () => {
		el = await fixture('<nldd-step-cell size="md" position="between" style="height: 100px"></nldd-step-cell>');
		await waitForUpdate(el);
		const top = el.shadowRoot!.querySelector('.step-cell__top-line') as HTMLElement;
		const bottom = el.shadowRoot!.querySelector('.step-cell__bottom-line') as HTMLElement;
		expect(Math.round(top.getBoundingClientRect().height)).toBe(50);
		expect(getComputedStyle(bottom).top).toBe('50px');
	});
});

describe('nldd-step-cell with only a line', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const COLORS = 'style="--_step-cell-track-color: rgb(1, 2, 3); --_step-cell-future-fill-color: rgb(4, 5, 6)"';

	const fullLine = (cell: HTMLElement) =>
		getComputedStyle(cell.shadowRoot!.querySelector('.step-cell__full-line') as HTMLElement).backgroundColor;

	it('draws the line as covered by default', async () => {
		el = await fixture(`<nldd-step-cell level="none" ${COLORS}></nldd-step-cell>`);
		await waitForUpdate(el);
		expect(fullLine(el)).toBe('rgb(1, 2, 3)');
	});

	it('draws it as still ahead on `line="none"`', async () => {
		el = await fixture(`<nldd-step-cell level="none" line="none" ${COLORS}></nldd-step-cell>`);
		await waitForUpdate(el);
		expect(fullLine(el)).toBe('rgb(4, 5, 6)');
	});

	it('draws nothing at all on `position="only"`, where the track has ended', async () => {
		el = await fixture(`<nldd-step-cell level="none" position="only" ${COLORS}></nldd-step-cell>`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.step-cell__full-line')).toBeNull();
	});

	it('has no marker', async () => {
		el = await fixture('<nldd-step-cell level="none"></nldd-step-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.step-cell__marker')).toBeNull();
	});
});

describe('nldd-step-cell current without a dot', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const COLORS = 'style="--_step-cell-track-color: rgb(1, 2, 3); --_step-cell-future-fill-color: rgb(4, 5, 6)"';

	const fullLine = (cell: HTMLElement) =>
		getComputedStyle(cell.shadowRoot!.querySelector('.step-cell__full-line') as HTMLElement).backgroundColor;

	it('leans the way the timeline runs: still ahead going down', async () => {
		el = await fixture(`<nldd-step-cell level="none" status="current" ${COLORS}></nldd-step-cell>`);
		await waitForUpdate(el);
		expect(fullLine(el)).toBe('rgb(4, 5, 6)');
	});

	it('and behind you going up', async () => {
		el = await fixture(`<nldd-step-cell level="none" status="current" direction="up" ${COLORS}></nldd-step-cell>`);
		await waitForUpdate(el);
		expect(fullLine(el)).toBe('rgb(1, 2, 3)');
	});
});
