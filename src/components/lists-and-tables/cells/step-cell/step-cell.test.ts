import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, adoptedCss } from '../../../../test-utils.js';
import type { NLDDStepCell } from './step-cell.js';
import './step-cell.js';
import { loadTokens } from '../../../../test-tokens.js';
import '../../list/list.js';
import '../../list-item/list-item.js';
import '../spacer-cell/spacer-cell.js';
import '../text-cell/text-cell.js';

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
	it('adopts a @container rule for hide-below (md → max-width 40rem)', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell hide-below="md"></nldd-step-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('max-width: 40rem');
		expect(adoptedCss(el)).toContain('display: none');
		expect(el.shadowRoot!.querySelector('style')).toBeNull();
	});

	it('adopts a @container rule for hide-above (md → min-width 63rem)', async () => {
		el = await fixture<NLDDStepCell>('<nldd-step-cell hide-above="md"></nldd-step-cell>');
		await waitForUpdate(el);
		expect(adoptedCss(el)).toContain('min-width: 63rem');
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

describe('nldd-step-cell – where the dot stands', () => {
	let root: HTMLElement;
	let removeTokens: () => void;

	beforeEach(() => {
		removeTokens = loadTokens();
	});

	afterEach(() => {
		if (root) cleanup(root);
		removeTokens();
		vi.restoreAllMocks();
	});

	const TEXT = 'Aanvraag A-1042 voor dakisolatie is in behandeling genomen. Het team neemt contact op als er iets ontbreekt, en anders volgt het besluit binnen zes weken.';

	const row = async (stepAttrs: string): Promise<{ cell: HTMLElement; item: HTMLElement }> => {
		root = await fixture<HTMLElement>(`
			<nldd-list dividers="never" accessible-label="Verloop" style="width: 320px">
				<nldd-list-item>
					<nldd-step-cell ${stepAttrs}></nldd-step-cell>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
					<nldd-text-cell vertical-alignment="top" text="Ingediend" supporting-text="${TEXT}"></nldd-text-cell>
				</nldd-list-item>
			</nldd-list>
		`);
		const item = root.querySelector('nldd-list-item') as HTMLElement;
		const cell = root.querySelector('nldd-step-cell') as HTMLElement;
		await waitForUpdate(item);
		await waitForUpdate(cell);
		return { cell, item };
	};

	const centerOf = (el: Element) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
	const dotCenter = (cell: HTMLElement) => centerOf(cell.shadowRoot!.querySelector('.step-cell__marker')!);


	// The lane spans the row edge to edge; the row itself reserves a divider's
	// worth of space below that, so measure against the lane.
	const lane = (cell: HTMLElement) => cell.shadowRoot!.querySelector('.step-cell')!.getBoundingClientRect();

	it('stands in the middle of the row by default', async () => {
		const { cell } = await row('');
		const box = lane(cell);
		expect(Math.abs(dotCenter(cell) - (box.top + box.height / 2))).toBeLessThan(1);
	});

	const againstPadding = (cell: HTMLElement) => {
		const padding = parseFloat(getComputedStyle(cell).paddingTop);
		const half = parseFloat(getComputedStyle(cell).getPropertyValue('--_step-cell-lane-size')) / 2;
		return Math.abs(dotCenter(cell) - lane(cell).top - (padding + half));
	};

	it('stands against the top padding with vertical-alignment="top", as a whole dot would', async () => {
		const { cell } = await row('vertical-alignment="top"');
		expect(againstPadding(cell)).toBeLessThan(1);
	});

	it('puts a minor dot on the same line as a major one', async () => {
		const major = dotCenter((await row('vertical-alignment="top"')).cell);
		cleanup(root);
		const minor = dotCenter((await row('vertical-alignment="top" level="minor"')).cell);
		expect(minor).toBeCloseTo(major, 0);
	});

	it('mirrors top with vertical-alignment="bottom"', async () => {
		const top = await row('vertical-alignment="top"');
		const fromTop = dotCenter(top.cell) - lane(top.cell).top;
		cleanup(root);
		const bottom = await row('vertical-alignment="bottom"');
		const fromBottom = lane(bottom.cell).bottom - dotCenter(bottom.cell);
		expect(Math.abs(fromBottom - fromTop)).toBeLessThan(1);
	});

	it('runs the track to the middle of the dot', async () => {
		const { cell } = await row('vertical-alignment="top"');
		const topLine = cell.shadowRoot!.querySelector('.step-cell__top-line')!.getBoundingClientRect();
		const bottomLine = cell.shadowRoot!.querySelector('.step-cell__bottom-line')!.getBoundingClientRect();
		expect(topLine.bottom).toBeCloseTo(dotCenter(cell), 0);
		expect(bottomLine.top).toBeCloseTo(dotCenter(cell), 0);
	});

	it('puts the middle of the dot marker-offset below the top of the content', async () => {
		const { cell } = await row('marker-offset="20px" vertical-alignment="bottom"');
		const padding = parseFloat(getComputedStyle(cell).paddingTop);
		expect(Math.abs(dotCenter(cell) - lane(cell).top - (padding + 20))).toBeLessThan(1);
	});

	it('falls back to vertical-alignment for an invalid marker-offset', async () => {
		const { cell } = await row('marker-offset="hoog" vertical-alignment="top"');
		expect(cell.hasAttribute('data-marker-offset')).toBe(false);
		expect(againstPadding(cell)).toBeLessThan(1);
		expect(cell.matches(':state(invalid-marker-offset)')).toBe(true);
	});

	it('falls back for marker-offset="auto", which is not a length', async () => {
		const { cell } = await row('marker-offset="auto" vertical-alignment="top"');
		expect(cell.hasAttribute('data-marker-offset')).toBe(false);
		expect(cell.matches(':state(invalid-marker-offset)')).toBe(true);
	});

	it('takes a percentage of the content height in marker-offset: 50% is the middle', async () => {
		const middle = dotCenter((await row('')).cell);
		cleanup(root);
		const { cell } = await row('marker-offset="50%"');
		expect(Math.abs(dotCenter(cell) - middle)).toBeLessThan(1);
	});

	it('puts marker-offset="0%" on the top of the content', async () => {
		const { cell } = await row('marker-offset="0%"');
		const padding = parseFloat(getComputedStyle(cell).paddingTop);
		expect(Math.abs(dotCenter(cell) - lane(cell).top - padding)).toBeLessThan(1);
	});

	it('takes a calc() of lengths in marker-offset', async () => {
		const { cell } = await row('marker-offset="calc(1rem - 2px)"');
		expect(cell.hasAttribute('data-marker-offset')).toBe(true);
	});
});

describe('nldd-step-cell theme color', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('follows the steps color a theme sets, like nldd-step-bar', async () => {
		el = await fixture('<div style="--semantics-steps-progress-color: rgb(200, 0, 0)"><nldd-step-cell></nldd-step-cell></div>');
		const cell = el.querySelector<NLDDStepCell>('nldd-step-cell')!;
		await waitForUpdate(cell);
		const probe = document.createElement('span');
		probe.style.color = 'var(--_step-cell-track-color)';
		cell.shadowRoot!.append(probe);
		expect(getComputedStyle(probe).color).toBe('rgb(200, 0, 0)');
	});
});
