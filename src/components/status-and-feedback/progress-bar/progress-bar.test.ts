import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDProgressBar, NLDDProgressBarSegmentIndicator } from './progress-bar.js';
import { INDETERMINATE_TRANSITION_MS } from './progress-bar.js';
// Raw CSS source for the token cross-check at the bottom of this file. Vite
// transforms ?raw imports into string literals at build time, so no HTTP
// request is needed at runtime.
import variablesCss from '../../../assets/styles/variables.css?raw';
import './progress-bar.js';

describe('nldd-progress-bar', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});


	/* ============================================================
	   Smoke + defaults
	   ============================================================ */

	it('renders without errors', async () => {
		el = await fixture('<nldd-progress-bar></nldd-progress-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to variant="progress", max=100, size="md", color="accent"', async () => {
		el = await fixture<NLDDProgressBar>('<nldd-progress-bar></nldd-progress-bar>');
		await waitForUpdate(el);
		const bar = el as unknown as NLDDProgressBar;
		expect(bar.variant).toBe('progress');
		expect(bar.max).toBe(100);
		expect(bar.size).toBe('md');
		expect(bar.color).toBe('accent');
	});


	/* ============================================================
	   Caption rendering
	   ============================================================ */

	it('renders text and value when provided', async () => {
		el = await fixture('<nldd-progress-bar text="Uploaden" value="60"></nldd-progress-bar>');
		await waitForUpdate(el);
		const text = el.shadowRoot!.querySelector('.progress-bar__text')!;
		const value = el.shadowRoot!.querySelector('.progress-bar__supporting-text')!;
		expect(text.textContent).toBe('Uploaden');
		expect(value.textContent).toBe('60%');
	});

	it('omits caption when value-display="none"', async () => {
		el = await fixture('<nldd-progress-bar value="40" value-display="none"></nldd-progress-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.progress-bar__caption')).toBeNull();
	});

	it('value-display="inline" (default) shows the value in the caption without a label', async () => {
		el = await fixture('<nldd-progress-bar value="40"></nldd-progress-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.progress-bar__caption')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.progress-bar__supporting-text')!.textContent).toBe('40%');
	});

	it('value-display="tooltip" renders no inline caption value (supporting-text absent)', async () => {
		el = await fixture('<nldd-progress-bar value="40" text="x" value-display="tooltip"></nldd-progress-bar>');
		await waitForUpdate(el);
		// The caption still renders (text is set) but carries no inline value span.
		expect(el.shadowRoot!.querySelector('.progress-bar__caption')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.progress-bar__supporting-text')).toBeNull();
	});

	it('value-format="absolute" shows raw number', async () => {
		el = await fixture('<nldd-progress-bar value="60" max="100" text="x" value-format="absolute"></nldd-progress-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.progress-bar__supporting-text')!.textContent).toBe('60');
	});

	it('value-format="fraction" shows value / max', async () => {
		el = await fixture('<nldd-progress-bar value="60" max="100" text="x" value-format="fraction"></nldd-progress-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.progress-bar__supporting-text')!.textContent).toBe('60 / 100');
	});

	it('value-text overrides the formatted value', async () => {
		el = await fixture('<nldd-progress-bar value="60" text="x" value-text="Bijna klaar"></nldd-progress-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.progress-bar__supporting-text')!.textContent).toBe('Bijna klaar');
	});


	/* ============================================================
	   ARIA semantics
	   ============================================================ */

	it('sets role="progressbar" with aria-valuemin and aria-valuemax', async () => {
		el = await fixture('<nldd-progress-bar max="200" value="50"></nldd-progress-bar>');
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.getAttribute('role')).toBe('progressbar');
		expect(track.getAttribute('aria-valuemin')).toBe('0');
		expect(track.getAttribute('aria-valuemax')).toBe('200');
		expect(track.getAttribute('aria-valuenow')).toBe('50');
	});

	it('omits aria-valuenow when indeterminate (role=progressbar implies busy)', async () => {
		el = await fixture('<nldd-progress-bar indeterminate></nldd-progress-bar>');
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.hasAttribute('aria-valuenow')).toBe(false);
		// aria-busy intentionally omitted: progressbar role already implies it
		// when aria-valuenow is absent.
		expect(track.hasAttribute('aria-busy')).toBe(false);
	});

	it('single-value aria-valuetext reads "X% voltooid"', async () => {
		el = await fixture('<nldd-progress-bar value="60"></nldd-progress-bar>');
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.getAttribute('aria-valuetext')).toBe('60% voltooid');
	});

	it('indeterminate aria-valuetext reads "Aan het laden"', async () => {
		el = await fixture('<nldd-progress-bar indeterminate></nldd-progress-bar>');
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.getAttribute('aria-valuetext')).toBe('Aan het laden');
	});

	it('accessible-label overrides aria-valuetext', async () => {
		el = await fixture('<nldd-progress-bar value="60" accessible-label="Custom label"></nldd-progress-bar>');
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.getAttribute('aria-valuetext')).toBe('Custom label');
	});


	/* ============================================================
	   Multi-segment
	   ============================================================ */

	it('reads sum of segment values as aria-valuenow', async () => {
		el = await fixture(`
			<nldd-progress-bar max="100">
				<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="20"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.getAttribute('aria-valuenow')).toBe('50');
	});

	it('progress variant without names: aria-valuetext is "X% voltooid"', async () => {
		el = await fixture(`
			<nldd-progress-bar variant="progress" max="100">
				<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="20"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.getAttribute('aria-valuetext')).toBe('50% voltooid');
	});

	it('progress variant with names: aria-valuetext enumerates + sums', async () => {
		el = await fixture(`
			<nldd-progress-bar variant="progress" max="100">
				<nldd-progress-bar-segment-indicator value="30" name="Upload"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="20" name="Verwerken"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.getAttribute('aria-valuetext')).toBe('Upload: 30%, Verwerken: 20%. Totaal 50% voltooid.');
	});

	it('distribution variant without names: aria-valuetext is plain percentages', async () => {
		el = await fixture(`
			<nldd-progress-bar variant="distribution" max="100">
				<nldd-progress-bar-segment-indicator value="40"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.getAttribute('aria-valuetext')).toBe('40%, 30%, 30%');
	});

	it('distribution variant with names: aria-valuetext enumerates names', async () => {
		el = await fixture(`
			<nldd-progress-bar variant="distribution" max="500">
				<nldd-progress-bar-segment-indicator value="200" name="Foto's"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="150" name="Video's"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="150" name="Vrij"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.getAttribute('aria-valuetext')).toBe("Foto's: 40%, Video's: 30%, Vrij: 30%");
	});


	/* ============================================================
	   Segment width computation
	   ============================================================ */

	it('sets --context-progress-bar-segment-indicator-width on each segment', async () => {
		el = await fixture(`
			<nldd-progress-bar max="100">
				<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="20"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const segments = el.querySelectorAll<HTMLElement>('nldd-progress-bar-segment-indicator');
		expect(segments[0]!.style.getPropertyValue('--context-progress-bar-segment-indicator-width')).toBe('30%');
		expect(segments[1]!.style.getPropertyValue('--context-progress-bar-segment-indicator-width')).toBe('20%');
	});

	it('hides segments with value <= 0', async () => {
		el = await fixture(`
			<nldd-progress-bar max="100">
				<nldd-progress-bar-segment-indicator value="50"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="0"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const segments = el.querySelectorAll<HTMLElement>('nldd-progress-bar-segment-indicator');
		expect(segments[0]!.hidden).toBe(false);
		expect(segments[1]!.hidden).toBe(true);
	});

	it('normalizes segment widths when sum exceeds max', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(`
			<nldd-progress-bar max="100">
				<nldd-progress-bar-segment-indicator value="100"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="50"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const segments = el.querySelectorAll<HTMLElement>('nldd-progress-bar-segment-indicator');
		// 100 / 150 ≈ 66.67%
		expect(segments[0]!.style.getPropertyValue('--context-progress-bar-segment-indicator-width')).toMatch(/^66\.6/);
		// 50 / 150 ≈ 33.33%
		expect(segments[1]!.style.getPropertyValue('--context-progress-bar-segment-indicator-width')).toMatch(/^33\.3/);
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it('re-syncs when a segment value changes', async () => {
		el = await fixture(`
			<nldd-progress-bar max="100">
				<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const segment = el.querySelector<NLDDProgressBarSegmentIndicator>('nldd-progress-bar-segment-indicator')!;
		segment.value = 70;
		await waitForUpdate(el);
		expect((segment as unknown as HTMLElement).style.getPropertyValue('--context-progress-bar-segment-indicator-width')).toBe('70%');
	});


	/* ============================================================
	   Indeterminate
	   ============================================================ */

	it('renders an indeterminate indicator when indeterminate and no segments', async () => {
		el = await fixture('<nldd-progress-bar indeterminate></nldd-progress-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.progress-bar__indeterminate-indicator')).not.toBeNull();
	});

	it('does not render the indicator when there are segments', async () => {
		el = await fixture(`
			<nldd-progress-bar indeterminate>
				<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.progress-bar__indeterminate-indicator')).toBeNull();
	});


	/* ============================================================
	   Internal single segment
	   ============================================================ */

	it('renders an internal segment when value is set and no children', async () => {
		el = await fixture('<nldd-progress-bar value="60" color="success"></nldd-progress-bar>');
		await waitForUpdate(el);
		const internal = el.shadowRoot!.querySelector<HTMLElement>('nldd-progress-bar-segment-indicator');
		expect(internal).not.toBeNull();
		expect(internal!.getAttribute('color')).toBe('success');
		expect(internal!.style.getPropertyValue('--context-progress-bar-segment-indicator-width')).toBe('60%');
	});

	it('does not render internal segment when slotted children exist', async () => {
		el = await fixture(`
			<nldd-progress-bar value="60">
				<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-progress-bar-segment-indicator')).toBeNull();
	});


	/* ============================================================
	   Tooltip
	   ============================================================ */

	it('auto-generates tooltip with name + percentage for slotted segments', async () => {
		el = await fixture(`
			<nldd-progress-bar max="100">
				<nldd-progress-bar-segment-indicator value="30" name="Upload"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="20" name="Verwerken"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const seg = el.querySelector<NLDDProgressBarSegmentIndicator>('nldd-progress-bar-segment-indicator')!;
		expect(seg._autoTooltipText).toBe('Upload: 30%');
	});

	it('auto-generates tooltip without name as just percentage', async () => {
		el = await fixture(`
			<nldd-progress-bar max="100">
				<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="20"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const seg = el.querySelector<NLDDProgressBarSegmentIndicator>('nldd-progress-bar-segment-indicator')!;
		expect(seg._autoTooltipText).toBe('30%');
	});

	it('tooltip follows value-format="absolute"', async () => {
		el = await fixture(`
			<nldd-progress-bar max="500" value-format="absolute">
				<nldd-progress-bar-segment-indicator value="200" name="Foto's"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="100" name="Video's"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const seg = el.querySelector<NLDDProgressBarSegmentIndicator>('nldd-progress-bar-segment-indicator')!;
		expect(seg._autoTooltipText).toBe("Foto's: 200");
	});

	it('tooltip follows value-format="fraction"', async () => {
		el = await fixture(`
			<nldd-progress-bar max="100" value-format="fraction">
				<nldd-progress-bar-segment-indicator value="30" name="Upload"></nldd-progress-bar-segment-indicator>
				<nldd-progress-bar-segment-indicator value="20" name="Verwerken"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const seg = el.querySelector<NLDDProgressBarSegmentIndicator>('nldd-progress-bar-segment-indicator')!;
		expect(seg._autoTooltipText).toBe('Upload: 30 / 100');
	});

	it('suppresses auto-tooltip on single slotted segment when caption is shown', async () => {
		el = await fixture(`
			<nldd-progress-bar max="100" text="Uploaden">
				<nldd-progress-bar-segment-indicator value="30" name="Upload"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const seg = el.querySelector<NLDDProgressBarSegmentIndicator>('nldd-progress-bar-segment-indicator')!;
		expect(seg._autoTooltipText).toBe('');
	});

	it('shows auto-tooltip on single slotted segment in tooltip mode', async () => {
		el = await fixture(`
			<nldd-progress-bar max="100" value-display="tooltip">
				<nldd-progress-bar-segment-indicator value="30" name="Upload"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const seg = el.querySelector<NLDDProgressBarSegmentIndicator>('nldd-progress-bar-segment-indicator')!;
		expect(seg._autoTooltipText).toBe('Upload: 30%');
	});

	it('segment tooltip-text attribute overrides auto-generated text', async () => {
		el = await fixture(`
			<nldd-progress-bar max="500">
				<nldd-progress-bar-segment-indicator value="200" name="Foto's" tooltip-text="200 GB van 500 GB"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const seg = el.querySelector<NLDDProgressBarSegmentIndicator>('nldd-progress-bar-segment-indicator')!;
		expect(seg._effectiveTooltip).toBe('200 GB van 500 GB');
	});

	it('renders an nldd-tooltip around the tooltip-area', async () => {
		el = await fixture<NLDDProgressBarSegmentIndicator>(
			'<nldd-progress-bar-segment-indicator value="30" tooltip-text="Hover me"></nldd-progress-bar-segment-indicator>',
		);
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip');
		expect(tooltip).not.toBeNull();
		expect(tooltip!.getAttribute('text')).toBe('Hover me');
		expect(tooltip!.querySelector('.progress-bar__segment-indicator-tooltip-area')).not.toBeNull();
	});

	it('internal segment tooltip is suppressed when caption is shown', async () => {
		el = await fixture('<nldd-progress-bar value="60" text="Uploaden"></nldd-progress-bar>');
		await waitForUpdate(el);
		const internal = el.shadowRoot!.querySelector<NLDDProgressBarSegmentIndicator>('nldd-progress-bar-segment-indicator')!;
		expect(internal._autoTooltipText).toBe('');
	});

	it('internal segment gets a tooltip in tooltip mode', async () => {
		el = await fixture('<nldd-progress-bar value="60" value-display="tooltip"></nldd-progress-bar>');
		await waitForUpdate(el);
		const internal = el.shadowRoot!.querySelector<NLDDProgressBarSegmentIndicator>('nldd-progress-bar-segment-indicator')!;
		expect(internal._autoTooltipText).toBe('60%');
	});


	/* ============================================================
	   Indeterminate transitions (race conditions + cleanup)
	   ============================================================ */

	it('rapid indeterminate toggle resets exit-phase when re-entering', async () => {
		el = await fixture<NLDDProgressBar>('<nldd-progress-bar value="60" indeterminate></nldd-progress-bar>');
		await waitForUpdate(el);
		const bar = el as unknown as NLDDProgressBar;
		// indeterminate true → false → true within 500ms
		bar.indeterminate = false;
		await waitForUpdate(el);
		bar.indeterminate = true;
		await waitForUpdate(el);
		// Exit timer must be canceled, no stale fading-out state
		expect((bar as unknown as { _indeterminateExiting: boolean })._indeterminateExiting).toBe(false);
		expect((bar as unknown as { _indeterminateEntering: boolean })._indeterminateEntering).toBe(true);
	});

	it('rounds aria-valuenow to avoid float screenreader output', async () => {
		el = await fixture(`
			<nldd-progress-bar max="3">
				<nldd-progress-bar-segment-indicator value="1"></nldd-progress-bar-segment-indicator>
			</nldd-progress-bar>
		`);
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-bar__track')!;
		expect(track.getAttribute('aria-valuenow')).toBe('1');
	});

	it('cleans up timers and observer on disconnect without throwing', async () => {
		const fresh = await fixture<NLDDProgressBar>('<nldd-progress-bar value="60" indeterminate></nldd-progress-bar>');
		await waitForUpdate(fresh);
		const bar = fresh as unknown as NLDDProgressBar;
		bar.indeterminate = false;
		await waitForUpdate(fresh);
		// Disconnect mid-transition. The actual assertion is that the cancel
		// paths in disconnectedCallback don't throw — we can't easily prove
		// the timeout never fires, but we can prove the teardown is clean.
		expect(() => cleanup(fresh)).not.toThrow();
	});
});

describe('nldd-progress-bar-segment-indicator', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without errors', async () => {
		el = await fixture('<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults color to "accent"', async () => {
		el = await fixture<NLDDProgressBarSegmentIndicator>('<nldd-progress-bar-segment-indicator value="30"></nldd-progress-bar-segment-indicator>');
		await waitForUpdate(el);
		expect((el as unknown as NLDDProgressBarSegmentIndicator).color).toBe('accent');
	});

	/* ============================================================
	   JS timer ↔ CSS transition token cross-check
	   ============================================================ */

	it('INDETERMINATE_TRANSITION_MS matches --primitives-transition-duration-slow', () => {
		// The crossfade JS timer drives _beginIndeterminate{Exit,Enter}; the
		// CSS transitions read --primitives-transition-duration-slow. If the
		// two drift, the indicator fades while the segment is already done
		// growing (or vice versa). Parse the token straight out of the raw
		// CSS source so the test doesn't depend on the global stylesheet
		// being loaded into the document.
		const match = /--primitives-transition-duration-slow\s*:\s*(\d+)ms/.exec(variablesCss);
		expect(match, 'token declaration not found in variables.css').not.toBeNull();
		const tokenMs = Number(match![1]);
		expect(tokenMs).toBe(INDETERMINATE_TRANSITION_MS);
	});
});
