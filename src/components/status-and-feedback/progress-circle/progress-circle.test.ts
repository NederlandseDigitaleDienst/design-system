import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDProgressCircle } from './progress-circle.js';
import { INDETERMINATE_TRANSITION_MS } from './progress-circle.js';
import { getStrokeWidthPx, getBorderErodeRadius } from './progress-circle.template.js';
import { progressCircleStyles } from './progress-circle.styles.js';
import variablesCss from '../../../assets/styles/variables.css?raw';
import './progress-circle.js';

describe('nldd-progress-circle', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without errors', async () => {
		el = await fixture('<nldd-progress-circle></nldd-progress-circle>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
		expect(el.shadowRoot!.querySelector('svg')).not.toBeNull();
	});

	it('defaults to variant="progress", max=100, size="28", color="accent"', async () => {
		el = await fixture<NLDDProgressCircle>('<nldd-progress-circle></nldd-progress-circle>');
		await waitForUpdate(el);
		const bar = el as unknown as NLDDProgressCircle;
		expect(bar.variant).toBe('progress');
		expect(bar.max).toBe(100);
		expect(bar.size).toBe('28');
		expect(bar.color).toBe('accent');
	});

	it('renders a label below when text is set', async () => {
		el = await fixture('<nldd-progress-circle value="60" text="Uploaden"></nldd-progress-circle>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector('.progress-circle__text')!;
		expect(label.textContent).toBe('Uploaden');
	});

	it('omits the label when no text is set', async () => {
		el = await fixture('<nldd-progress-circle value="60"></nldd-progress-circle>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.progress-circle__text')).toBeNull();
	});

	it('sets role=progressbar with valuemin/valuemax/valuenow', async () => {
		el = await fixture('<nldd-progress-circle max="200" value="50"></nldd-progress-circle>');
		await waitForUpdate(el);
		const wrapper = el.shadowRoot!.querySelector('.progress-circle__circle')!;
		expect(wrapper.getAttribute('role')).toBe('progressbar');
		expect(wrapper.getAttribute('aria-valuemin')).toBe('0');
		expect(wrapper.getAttribute('aria-valuemax')).toBe('200');
		expect(wrapper.getAttribute('aria-valuenow')).toBe('50');
	});

	it('single-value aria-valuetext reads "X% voltooid"', async () => {
		el = await fixture('<nldd-progress-circle value="60"></nldd-progress-circle>');
		await waitForUpdate(el);
		const wrapper = el.shadowRoot!.querySelector('.progress-circle__circle')!;
		expect(wrapper.getAttribute('aria-valuetext')).toBe('60% voltooid');
	});

	it('indeterminate omits aria-valuenow and reads loading text', async () => {
		el = await fixture('<nldd-progress-circle indeterminate></nldd-progress-circle>');
		await waitForUpdate(el);
		const wrapper = el.shadowRoot!.querySelector('.progress-circle__circle')!;
		// aria-valuenow must be ABSENT (not empty) — some screenreaders read "" as "0 percent".
		expect(wrapper.hasAttribute('aria-valuenow')).toBe(false);
		expect(wrapper.getAttribute('aria-valuetext')).toBe('Aan het laden');
		expect(el.shadowRoot!.querySelector('.progress-circle__indeterminate-indicator')).not.toBeNull();
	});

	it('renders one segment circle per slotted segment', async () => {
		el = await fixture(`
			<nldd-progress-circle max="100">
				<nldd-progress-circle-segment-indicator value="30" color="success"></nldd-progress-circle-segment-indicator>
				<nldd-progress-circle-segment-indicator value="20" color="accent"></nldd-progress-circle-segment-indicator>
			</nldd-progress-circle>
		`);
		await waitForUpdate(el);
		const segments = el.shadowRoot!.querySelectorAll('.progress-circle__segment-indicator');
		expect(segments.length).toBe(2);
	});

	it('distribution variant reads aria-valuetext as enumerated percentages', async () => {
		el = await fixture(`
			<nldd-progress-circle variant="distribution" max="500">
				<nldd-progress-circle-segment-indicator value="200" name="Foto's"></nldd-progress-circle-segment-indicator>
				<nldd-progress-circle-segment-indicator value="150" name="Video's"></nldd-progress-circle-segment-indicator>
			</nldd-progress-circle>
		`);
		await waitForUpdate(el);
		const wrapper = el.shadowRoot!.querySelector('.progress-circle__circle')!;
		expect(wrapper.getAttribute('aria-valuetext')).toBe("Foto's: 40%, Video's: 30%");
	});

	it('accessible-label overrides aria-valuetext', async () => {
		el = await fixture('<nldd-progress-circle value="60" accessible-label="Custom"></nldd-progress-circle>');
		await waitForUpdate(el);
		const wrapper = el.shadowRoot!.querySelector('.progress-circle__circle')!;
		expect(wrapper.getAttribute('aria-valuetext')).toBe('Custom');
	});

	it('value-display="inline" shows the value as text below the label', async () => {
		el = await fixture('<nldd-progress-circle value="60" text="Uploaden" value-display="inline"></nldd-progress-circle>');
		await waitForUpdate(el);
		const value = el.shadowRoot!.querySelector('.progress-circle__supporting-text');
		expect(value).not.toBeNull();
		expect(value!.textContent).toBe('60%');
	});

	it('value-display="tooltip" (default) wraps the circle in a tooltip and shows no inline value', async () => {
		el = await fixture('<nldd-progress-circle value="60"></nldd-progress-circle>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-tooltip')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.progress-circle__supporting-text')).toBeNull();
	});

	it('value-display="none" renders neither a tooltip nor an inline value', async () => {
		el = await fixture('<nldd-progress-circle value="60" value-display="none"></nldd-progress-circle>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-tooltip')).toBeNull();
		expect(el.shadowRoot!.querySelector('.progress-circle__supporting-text')).toBeNull();
	});

	it('value-text overrides the inline displayed value', async () => {
		el = await fixture('<nldd-progress-circle value="60" text="x" value-display="inline" value-text="Bijna klaar"></nldd-progress-circle>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.progress-circle__supporting-text')!.textContent).toBe('Bijna klaar');
	});

	it('applies a per-color highlight-border filter to the track and segments', async () => {
		el = await fixture('<nldd-progress-circle value="60" color="accent"></nldd-progress-circle>');
		await waitForUpdate(el);
		const track = el.shadowRoot!.querySelector('.progress-circle__track')!;
		const seg = el.shadowRoot!.querySelector('.progress-circle__segment-indicator')!;
		// Filter ids carry a per-instance suffix, so match by prefix.
		expect(track.getAttribute('filter')).toMatch(/^url\(#progress-circle-border-track-/);
		expect(seg.getAttribute('filter')).toMatch(/^url\(#progress-circle-border-accent-/);
		// matching filter defs (with a flood) exist for the track and the used color
		expect(el.shadowRoot!.querySelector('[id^="progress-circle-border-track-"] feFlood')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('[id^="progress-circle-border-accent-"] feFlood')).not.toBeNull();
	});

	// A flood color written as a literal style attribute is an inline style, and a
	// strict style-src drops it: the ring would lose its border without a word.
	// The two fixed colors come from the stylesheet; the per-segment one is set
	// through the CSSOM, which the policy leaves alone.
	it('takes the track flood color from the stylesheet rather than a style attribute', async () => {
		el = await fixture('<nldd-progress-circle value="60" color="accent"></nldd-progress-circle>');
		await waitForUpdate(el);
		const flood = el.shadowRoot!.querySelector('[id^="progress-circle-border-track-"] feFlood')!;
		expect(flood.classList.contains('progress-circle__flood--track')).toBe(true);
		expect(flood.getAttribute('style')).toBeNull();
	});

	it('takes the indeterminate flood color from the stylesheet rather than a style attribute', async () => {
		el = await fixture('<nldd-progress-circle indeterminate></nldd-progress-circle>');
		await waitForUpdate(el);
		const flood = el.shadowRoot!.querySelector('[id^="progress-circle-border-indeterminate-"] feFlood')!;
		expect(flood.classList.contains('progress-circle__flood--indeterminate')).toBe(true);
		expect(flood.getAttribute('style')).toBeNull();
	});

	it('scopes the highlight-border filter ids per instance so two circles do not collide', async () => {
		const a = await fixture('<nldd-progress-circle value="60" color="accent"></nldd-progress-circle>');
		const b = await fixture('<nldd-progress-circle value="60" color="accent"></nldd-progress-circle>');
		await waitForUpdate(a);
		await waitForUpdate(b);
		const fa = a.shadowRoot!.querySelector('.progress-circle__track')!.getAttribute('filter');
		const fb = b.shadowRoot!.querySelector('.progress-circle__track')!.getAttribute('filter');
		expect(fa).not.toBeNull();
		expect(fa).not.toBe(fb);
		cleanup(a);
		cleanup(b);
	});
});

describe('nldd-progress-circle-segment-indicator', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without errors', async () => {
		el = await fixture('<nldd-progress-circle-segment-indicator value="30"></nldd-progress-circle-segment-indicator>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('reflects value, color, and name attributes', async () => {
		el = await fixture(
			'<nldd-progress-circle-segment-indicator value="40" color="success" name="Foto\'s"></nldd-progress-circle-segment-indicator>',
		);
		await waitForUpdate(el);
		const seg = el as unknown as { value: number; color: string; name: string };
		expect(seg.value).toBe(40);
		expect(seg.color).toBe('success');
		expect(seg.name).toBe("Foto's");
		expect(el.getAttribute('value')).toBe('40');
		expect(el.getAttribute('color')).toBe('success');
		expect(el.getAttribute('name')).toBe("Foto's");
	});

	it('renders no visible content (data-only element — parent renders the SVG arc)', async () => {
		el = await fixture('<nldd-progress-circle-segment-indicator value="50"></nldd-progress-circle-segment-indicator>');
		await waitForUpdate(el);
		// Lit leaves marker comments in the shadow root for empty templates;
		// what matters is that there are no actual elements.
		expect(el.shadowRoot!.querySelector('*')).toBeNull();
	});

	it('is included in the parent\'s _buildArcs output', async () => {
		const parent = await fixture(`
			<nldd-progress-circle variant="distribution" max="500">
				<nldd-progress-circle-segment-indicator value="200" color="success" name="Foto's"></nldd-progress-circle-segment-indicator>
				<nldd-progress-circle-segment-indicator value="150" color="accent" name="Video's"></nldd-progress-circle-segment-indicator>
			</nldd-progress-circle>
		`);
		await waitForUpdate(parent);
		const arcs = (parent as unknown as { _buildArcs(): Array<{ length: number; offset: number; color: string }> })._buildArcs();
		expect(arcs.length).toBe(2);
		expect(arcs[0].color).toBe('success');
		expect(arcs[1].color).toBe('accent');
		// Arc lengths are positive and the second arc's offset comes after the first's start.
		expect(arcs[0].length).toBeGreaterThan(0);
		expect(arcs[1].length).toBeGreaterThan(0);
		expect(arcs[1].offset).toBeGreaterThan(arcs[0].offset);
		cleanup(parent);
	});

	it('zero-value segment still gets pushed (with length 0) so CSS transitions can animate later', async () => {
		const parent = await fixture(`
			<nldd-progress-circle max="100">
				<nldd-progress-circle-segment-indicator value="0" color="accent"></nldd-progress-circle-segment-indicator>
				<nldd-progress-circle-segment-indicator value="40" color="success"></nldd-progress-circle-segment-indicator>
			</nldd-progress-circle>
		`);
		await waitForUpdate(parent);
		const arcs = (parent as unknown as { _buildArcs(): Array<{ length: number; offset: number; color: string }> })._buildArcs();
		expect(arcs.length).toBe(2);
		expect(arcs[0].length).toBe(0);
		expect(arcs[1].length).toBeGreaterThan(0);
		cleanup(parent);
	});

	/* ============================================================
	   Stroke-width JS ↔ CSS cross-check
	   ============================================================ */

	it('INDETERMINATE_TRANSITION_MS matches --primitives-transition-duration-slow', () => {
		// Mirror of the progress-bar cross-check; same approach (parse the
		// token from the raw CSS source so we don't depend on the global
		// stylesheet being loaded).
		const match = /--primitives-transition-duration-slow\s*:\s*(\d+)ms/.exec(variablesCss);
		expect(match, 'token declaration not found in variables.css').not.toBeNull();
		const tokenMs = Number(match![1]);
		expect(tokenMs).toBe(INDETERMINATE_TRANSITION_MS);
	});

	it('getStrokeWidthPx(size) matches every per-size --_progress-circle-stroke-width rule in the stylesheet', () => {
		// Parse the real CSS (not a hand-kept copy) so a JS↔CSS drift is caught:
		// every `--_progress-circle-stroke-width: calc(<stroke>px * 100 / <size>)` must equal getStrokeWidthPx(<size>).
		const rules = [...progressCircleStyles.cssText.matchAll(/--_progress-circle-stroke-width:\s*calc\((\d+)px\s*\*\s*100\s*\/\s*(\d+)\)/g)];
		expect(rules.length).toBeGreaterThanOrEqual(12);
		for (const [, strokePx, size] of rules) {
			expect(getStrokeWidthPx(Number(size)), `size=${size}`).toBe(Number(strokePx));
		}
	});

	it('getBorderErodeRadius(size) returns 100 / size (a 1px edge in viewBox user units)', () => {
		expect(getBorderErodeRadius(100)).toBe(1);
		expect(getBorderErodeRadius(50)).toBe(2);
		expect(getBorderErodeRadius(16)).toBe(6.25);
		expect(getBorderErodeRadius(28)).toBeCloseTo(100 / 28, 5);
	});
});
