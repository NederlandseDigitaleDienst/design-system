import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, adoptedCss } from '../../../../test-utils.js';
import type { NLDDTimelineTrackCell } from './timeline-track-cell.js';
import './timeline-track-cell.js';

describe('nldd-timeline-track-cell', () => {
	let el: NLDDTimelineTrackCell;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const marker = () => el.shadowRoot!.querySelector('.timeline-track-cell__marker');

	it('tekent bij position="only" geen lijn boven en geen lijn eronder', async () => {
		el = await fixture('<nldd-timeline-track-cell position="only"></nldd-timeline-track-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.timeline-track-cell__top-line')).toBeNull();
		expect(el.shadowRoot!.querySelector('.timeline-track-cell__bottom-line')).toBeNull();
		expect(el.shadowRoot!.querySelector('.timeline-track-cell__marker')).not.toBeNull();
	});

	it('renders without error', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell></nldd-timeline-track-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot).not.toBeNull();
	});

	it('stays a bare marker without content', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell></nldd-timeline-track-cell>');
		await waitForUpdate(el);

		expect(marker()!.textContent?.trim()).toBe('');
	});

	it('renders a number in the marker', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell size="md" text="2"></nldd-timeline-track-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('.timeline-track-cell__text')?.textContent?.trim()).toBe('2');
	});

	it('renders an icon in the marker, which wins from text', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell size="md" text="2" icon="check-mark"></nldd-timeline-track-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('nldd-icon')?.getAttribute('icon')).toBe('check-mark');
		expect(el.shadowRoot!.querySelector('.timeline-track-cell__text')).toBeNull();
	});

	it('takes slotted content in the marker', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell size="md"><nldd-icon icon="check-mark"></nldd-icon></nldd-timeline-track-cell>');
		await waitForUpdate(el);

		expect(marker()!.querySelector('slot')).not.toBeNull();
	});

	it('accepts the current step', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell status="current"></nldd-timeline-track-cell>');
		await waitForUpdate(el);

		expect(el.getAttribute('status')).toBe('current');
		expect(marker()).not.toBeNull();
	});

	it('reflects the direction so the track can flip its traveled half', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell status="current" direction="up"></nldd-timeline-track-cell>');
		await waitForUpdate(el);

		// The colors themselves are asserted in the browser: the design tokens
		// are not loaded here, so every background computes to transparent.
		expect(el.getAttribute('direction')).toBe('up');
		expect(el.shadowRoot!.querySelector('.timeline-track-cell__top-line')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.timeline-track-cell__bottom-line')).not.toBeNull();
	});

	it('leaves the direction attribute off by default', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell status="current"></nldd-timeline-track-cell>');
		await waitForUpdate(el);

		expect(el.hasAttribute('direction')).toBe(false);
	});

	it('reflects variant so the styles can size the marker', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell></nldd-timeline-track-cell>');
		await waitForUpdate(el);
		expect(el.hasAttribute('variant')).toBe(false);

		el.variant = 'minor';
		await waitForUpdate(el);

		expect(el.getAttribute('variant')).toBe('minor');
	});

	it('keeps a minor marker empty, whatever content it is given', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell status="past" size="md" variant="minor" text="2" icon="check-mark">x</nldd-timeline-track-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('.timeline-track-cell__text')).toBeNull();
		expect(el.shadowRoot!.querySelector('.timeline-track-cell__icon')).toBeNull();
		expect(el.shadowRoot!.querySelector('slot')).toBeNull();
	});

	it('keeps every marker empty in the dot variant', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell status="past" text="2"></nldd-timeline-track-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('.timeline-track-cell__text')).toBeNull();
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
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell position="first"></nldd-timeline-track-cell>');
		el.style.setProperty('--semantics-dividers-thickness', '1px');
		await waitForUpdate(el);
		const onder = el.shadowRoot!.querySelector('.timeline-track-cell__bottom-line')!;
		expect(getComputedStyle(onder).bottom).toBe('-1px');

		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell variant="none"></nldd-timeline-track-cell>');
		el.style.setProperty('--semantics-dividers-thickness', '1px');
		await waitForUpdate(el);
		const vol = el.shadowRoot!.querySelector('.timeline-track-cell__full-line')!;
		expect(getComputedStyle(vol).bottom).toBe('-1px');
	});

	it('renders a full line for status=none', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell variant="none"></nldd-timeline-track-cell>');
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('.timeline-track-cell__full-line')).not.toBeNull();
		expect(marker()).toBeNull();
	});

	// Named breakpoints are static CSS in the adopted stylesheet, so no <style>
	// is injected and a consumer needs no 'unsafe-inline' in its style-src.
	it('adopts a @container rule for hide-below (md → max-width 640px)', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell hide-below="md"></nldd-timeline-track-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('max-width: 640px');
		expect(adoptedCss(el)).toContain('display: none');
		expect(el.shadowRoot!.querySelector('style')).toBeNull();
	});

	it('adopts a @container rule for hide-above (md → min-width 1008px)', async () => {
		el = await fixture<NLDDTimelineTrackCell>('<nldd-timeline-track-cell hide-above="md"></nldd-timeline-track-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('min-width: 1008px');
	});
});

describe('nldd-timeline-track-cell line', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const lines = (cell: HTMLElement) => ({
		top: !!cell.shadowRoot!.querySelector('.timeline-track-cell__top-line'),
		bottom: !!cell.shadowRoot!.querySelector('.timeline-track-cell__bottom-line'),
	});

	// The tokens do not load here, so the fixture carries the two colors itself:
	// without them both halves resolve to nothing and every color is equal.
	const COLORS = 'style="--components-timeline-track-cell-color: rgb(1, 2, 3); --components-timeline-track-cell-future-background-color: rgb(4, 5, 6)"';

	const half = (cell: HTMLElement, which: 'top' | 'bottom') => {
		const line = cell.shadowRoot!.querySelector(`.timeline-track-cell__${which}-line`) as HTMLElement;
		const color = getComputedStyle(line).backgroundColor;
		return color === 'rgb(1, 2, 3)' ? 'covered' : color === 'rgb(4, 5, 6)' ? 'open' : color;
	};

	it('follows the position when it is left alone', async () => {
		el = await fixture('<nldd-timeline-track-cell position="first"></nldd-timeline-track-cell>');
		await waitForUpdate(el);
		expect(lines(el)).toEqual({ top: false, bottom: true });
	});

	it('keeps the half it does not name, as track still ahead', async () => {
		el = await fixture(`<nldd-timeline-track-cell position="between" line="top" ${COLORS}></nldd-timeline-track-cell>`);
		await waitForUpdate(el);
		expect(lines(el)).toEqual({ top: true, bottom: true });
		expect(half(el, 'top')).toBe('covered');
		expect(half(el, 'bottom')).toBe('open');
	});

	it('draws a half the position leaves out when it calls it covered', async () => {
		el = await fixture('<nldd-timeline-track-cell position="first" line="both"></nldd-timeline-track-cell>');
		await waitForUpdate(el);
		expect(lines(el)).toEqual({ top: true, bottom: true });
	});

	it('covers neither half on `none`, and takes none away', async () => {
		el = await fixture(`<nldd-timeline-track-cell position="between" line="none" ${COLORS}></nldd-timeline-track-cell>`);
		await waitForUpdate(el);
		expect(lines(el)).toEqual({ top: true, bottom: true });
		expect(half(el, 'top')).toBe('open');
		expect(half(el, 'bottom')).toBe('open');
	});

	it('leaves a half out that neither the position nor the line asks for', async () => {
		el = await fixture('<nldd-timeline-track-cell position="last" line="none"></nldd-timeline-track-cell>');
		await waitForUpdate(el);
		expect(lines(el)).toEqual({ top: true, bottom: false });
	});

	it('covers both halves of a current step that opens a group', async () => {
		el = await fixture(`<nldd-timeline-track-cell status="current" line="both" ${COLORS}></nldd-timeline-track-cell>`);
		await waitForUpdate(el);
		expect(half(el, 'top')).toBe('covered');
		expect(half(el, 'bottom')).toBe('covered');
	});

	it('leaves the half below a plain current step open', async () => {
		el = await fixture(`<nldd-timeline-track-cell status="current" ${COLORS}></nldd-timeline-track-cell>`);
		await waitForUpdate(el);
		expect(half(el, 'top')).toBe('covered');
		expect(half(el, 'bottom')).toBe('open');
	});
});

describe('nldd-timeline-track-cell marker', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const marker = (cell: HTMLElement) =>
		cell.shadowRoot!.querySelector('.timeline-track-cell__marker') as HTMLElement;

	it('stands halfway down the row', async () => {
		el = await fixture('<nldd-timeline-track-cell size="md" style="height: 100px"></nldd-timeline-track-cell>');
		await waitForUpdate(el);
		expect(getComputedStyle(marker(el)).top).toBe('50px');
	});

	it('is met by both line ends', async () => {
		el = await fixture('<nldd-timeline-track-cell size="md" position="between" style="height: 100px"></nldd-timeline-track-cell>');
		await waitForUpdate(el);
		const top = el.shadowRoot!.querySelector('.timeline-track-cell__top-line') as HTMLElement;
		const bottom = el.shadowRoot!.querySelector('.timeline-track-cell__bottom-line') as HTMLElement;
		expect(Math.round(top.getBoundingClientRect().height)).toBe(50);
		expect(getComputedStyle(bottom).top).toBe('50px');
	});
});

describe('nldd-timeline-track-cell with only a line', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const COLORS = 'style="--components-timeline-track-cell-color: rgb(1, 2, 3); --components-timeline-track-cell-future-background-color: rgb(4, 5, 6)"';

	const fullLine = (cell: HTMLElement) =>
		getComputedStyle(cell.shadowRoot!.querySelector('.timeline-track-cell__full-line') as HTMLElement).backgroundColor;

	it('draws the line as covered by default', async () => {
		el = await fixture(`<nldd-timeline-track-cell variant="none" ${COLORS}></nldd-timeline-track-cell>`);
		await waitForUpdate(el);
		expect(fullLine(el)).toBe('rgb(1, 2, 3)');
	});

	it('draws it as still ahead on `line="none"`', async () => {
		el = await fixture(`<nldd-timeline-track-cell variant="none" line="none" ${COLORS}></nldd-timeline-track-cell>`);
		await waitForUpdate(el);
		expect(fullLine(el)).toBe('rgb(4, 5, 6)');
	});

	it('draws nothing at all on `position="only"`, where the track has ended', async () => {
		el = await fixture(`<nldd-timeline-track-cell variant="none" position="only" ${COLORS}></nldd-timeline-track-cell>`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.timeline-track-cell__full-line')).toBeNull();
	});

	it('has no marker', async () => {
		el = await fixture('<nldd-timeline-track-cell variant="none"></nldd-timeline-track-cell>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.timeline-track-cell__marker')).toBeNull();
	});
});

describe('nldd-timeline-track-cell current without a dot', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const COLORS = 'style="--components-timeline-track-cell-color: rgb(1, 2, 3); --components-timeline-track-cell-future-background-color: rgb(4, 5, 6)"';

	const fullLine = (cell: HTMLElement) =>
		getComputedStyle(cell.shadowRoot!.querySelector('.timeline-track-cell__full-line') as HTMLElement).backgroundColor;

	it('leans the way the timeline runs: still ahead going down', async () => {
		el = await fixture(`<nldd-timeline-track-cell variant="none" status="current" ${COLORS}></nldd-timeline-track-cell>`);
		await waitForUpdate(el);
		expect(fullLine(el)).toBe('rgb(4, 5, 6)');
	});

	it('and behind you going up', async () => {
		el = await fixture(`<nldd-timeline-track-cell variant="none" status="current" direction="up" ${COLORS}></nldd-timeline-track-cell>`);
		await waitForUpdate(el);
		expect(fullLine(el)).toBe('rgb(1, 2, 3)');
	});
});
