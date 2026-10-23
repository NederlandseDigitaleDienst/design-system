import { describe, it, expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import type { NLDDActivityIndicator } from './activity-indicator.js';
import './activity-indicator.js';

describe('nldd-activity-indicator', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without errors', async () => {
		el = await fixture('<nldd-activity-indicator></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults text to empty (falls back to translated "Laden")', async () => {
		el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect((el as unknown as NLDDActivityIndicator).text).toBe('');
	});

	it('hides the indicator initially so brief loads do not flash (timing="delay")', async () => {
		el = await fixture('<nldd-activity-indicator></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.hasAttribute('loading')).toBe(false);
	});

	it('shows the indicator immediately when timing="instant"', async () => {
		el = await fixture('<nldd-activity-indicator timing="instant"></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.hasAttribute('loading')).toBe(true);
	});

	it('cancels the delay and shows immediately when timing flips to "instant" after connect', async () => {
		vi.useFakeTimers();
		try {
			el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator></nldd-activity-indicator>');
			const litEl = el as HTMLElement & { updateComplete: Promise<boolean> };
			await litEl.updateComplete;
			// default timing → hidden during the delay window
			expect(el.hasAttribute('loading')).toBe(false);
			// flip to instant → visible right away, without waiting out the delay
			(el as unknown as NLDDActivityIndicator).timing = 'instant';
			await litEl.updateComplete;
			expect(el.hasAttribute('loading')).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});

	it('renders the default circle when the slot is empty', async () => {
		el = await fixture('<nldd-activity-indicator timing="instant"></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.activity-indicator__circle')).not.toBeNull();
	});

	it('shows the indicator after the 1000ms delay elapses (timing="delay")', async () => {
		// Timer-dependent tests use vi.useFakeTimers + direct updateComplete
		// instead of waitForUpdate, whose internal setTimeout(0) never fires
		// under fake timers.
		vi.useFakeTimers();
		try {
			el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator></nldd-activity-indicator>');
			const litEl = el as HTMLElement & { updateComplete: Promise<boolean> };
			await litEl.updateComplete;
			expect(el.hasAttribute('loading')).toBe(false);
			await vi.advanceTimersByTimeAsync(1000);
			await litEl.updateComplete;
			expect(el.hasAttribute('loading')).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});

	it('renders the label always (visually hidden by default; visible with show-text)', async () => {
		el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator timing="instant"></nldd-activity-indicator>');
		await waitForUpdate(el);
		const label = () => el.shadowRoot!.querySelector('.activity-indicator__text');
		// Always present (it is the announced live-region content), hidden by default.
		expect(label()).not.toBeNull();
		expect(label()!.classList.contains('activity-indicator__text--visually-hidden')).toBe(true);
		(el as unknown as NLDDActivityIndicator).showText = true;
		await waitForUpdate(el);
		expect(label()!.classList.contains('activity-indicator__text--visually-hidden')).toBe(false);
	});

	it('is a polite live region (role="status", no aria-busy/aria-label) on connect', async () => {
		el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('status');
		expect(el.hasAttribute('aria-busy')).toBe(false);
		expect(el.hasAttribute('aria-label')).toBe(false);
	});

	it('announces the label as visually-hidden live-region content (fallback "Laden")', async () => {
		el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator timing="instant"></nldd-activity-indicator>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector('.activity-indicator__text');
		expect(label?.textContent).toBe('Laden');
		expect(label!.classList.contains('activity-indicator__text--visually-hidden')).toBe(true);
	});

	it('uses text as the announced label content', async () => {
		el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator timing="instant" text="Bezig"></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.activity-indicator__text')?.textContent).toBe('Bezig');
	});

	it('clears role and hides the indicator when complete is set', async () => {
		vi.useFakeTimers();
		try {
			el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator timing="instant"></nldd-activity-indicator>');
			const litEl = el as HTMLElement & { updateComplete: Promise<boolean> };
			await litEl.updateComplete;
			expect(el.hasAttribute('loading')).toBe(true);
			expect(el.getAttribute('role')).toBe('status');
			// Flip complete → indicator goes, role goes.
			(el as unknown as NLDDActivityIndicator).complete = true;
			await litEl.updateComplete;
			expect(el.hasAttribute('loading')).toBe(false);
			expect(el.hasAttribute('role')).toBe(false);
			// And the inverse: clearing complete brings them back.
			(el as unknown as NLDDActivityIndicator).complete = false;
			await litEl.updateComplete;
			expect(el.hasAttribute('loading')).toBe(true);
			expect(el.getAttribute('role')).toBe('status');
		} finally {
			vi.useRealTimers();
		}
	});

	it('fades out when complete is set, and only then gives up its space', async () => {
		const unloadTokens = loadTokens();
		try {
			el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator timing="instant"></nldd-activity-indicator>');
			const indicator = el.shadowRoot!.querySelector<HTMLElement>('.activity-indicator')!;
			await new Promise((resolve) => setTimeout(resolve, 600));
			expect(getComputedStyle(indicator).opacity).toBe('1');
			(el as unknown as NLDDActivityIndicator).complete = true;
			await (el as unknown as NLDDActivityIndicator).updateComplete;
			// display: none waits for the fade (transition-behavior: allow-discrete).
			expect(getComputedStyle(indicator).display).toBe('flex');
			await new Promise((resolve) => setTimeout(resolve, 600));
			expect(getComputedStyle(indicator).display).toBe('none');
		} finally {
			unloadTokens();
		}
	});

	it('connects with complete already set: no role, no indicator', async () => {
		vi.useFakeTimers();
		try {
			el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator complete></nldd-activity-indicator>');
			const litEl = el as HTMLElement & { updateComplete: Promise<boolean> };
			await litEl.updateComplete;
			expect(el.hasAttribute('role')).toBe(false);
			await vi.advanceTimersByTimeAsync(1000);
			await litEl.updateComplete;
			expect(el.hasAttribute('loading')).toBe(false);
		} finally {
			vi.useRealTimers();
		}
	});

	it('resets the delay timer on disconnect + reconnect and re-fires after 1000ms', async () => {
		vi.useFakeTimers();
		try {
			el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator></nldd-activity-indicator>');
			const litEl = el as HTMLElement & { updateComplete: Promise<boolean> };
			await litEl.updateComplete;
			await vi.advanceTimersByTimeAsync(1000);
			await litEl.updateComplete;
			expect(el.hasAttribute('loading')).toBe(true);
			const parent = el.parentElement!;
			parent.removeChild(el);
			parent.appendChild(el);
			await litEl.updateComplete;
			expect(el.hasAttribute('loading')).toBe(false);
			await vi.advanceTimersByTimeAsync(1000);
			await litEl.updateComplete;
			expect(el.hasAttribute('loading')).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});

	it('renders the backdrop automatically in overlay mode', async () => {
		el = await fixture('<nldd-activity-indicator timing="instant"><div>Content</div></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.activity-indicator__backdrop')).not.toBeNull();
	});

	it('blurs the content behind the backdrop', async () => {
		el = await fixture('<nldd-activity-indicator timing="instant"><div>Content</div></nldd-activity-indicator>');
		await waitForUpdate(el);
		const bd = el.shadowRoot!.querySelector('.activity-indicator__backdrop')!;
		// Tests run in real chromium (Playwright), which computes backdrop-filter
		// from the stylesheet — so this resolves to an actual radius, e.g.
		// "blur(3px)". If the rule were dropped it would compute to "none" and
		// this assertion would fail (it can't silently pass on an empty string).
		const filter = getComputedStyle(bd).backdropFilter;
		expect(filter).toMatch(/blur\(\d/);
	});

	it('omits the backdrop in standalone mode (no content)', async () => {
		el = await fixture('<nldd-activity-indicator timing="instant"></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.activity-indicator__backdrop')).toBeNull();
	});

	it('opts out of the backdrop with no-backdrop in overlay mode', async () => {
		el = await fixture('<nldd-activity-indicator timing="instant" no-backdrop><div>Content</div></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.activity-indicator__backdrop')).toBeNull();
	});

	it('reflects the no-backdrop attribute', async () => {
		el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator no-backdrop></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.hasAttribute('no-backdrop')).toBe(true);
		expect((el as unknown as NLDDActivityIndicator).noBackdrop).toBe(true);
	});

	it('keeps the overlay unloaded during the anti-flash delay', async () => {
		el = await fixture('<nldd-activity-indicator><div>Content</div></nldd-activity-indicator>');
		await waitForUpdate(el);
		// The backdrop element is always present in overlay mode; the loading
		// attribute (absent here, during the delay) drives its visibility via CSS.
		expect(el.hasAttribute('loading')).toBe(false);
	});

	it('hides the overlay (clears loading) when complete is set', async () => {
		vi.useFakeTimers();
		try {
			el = await fixture<NLDDActivityIndicator>('<nldd-activity-indicator timing="instant"><div>Content</div></nldd-activity-indicator>');
			const litEl = el as HTMLElement & { updateComplete: Promise<boolean> };
			await litEl.updateComplete;
			// The backdrop stays in the DOM the whole overlay lifetime; the loading
			// attribute drives its CSS-only fade in and out.
			expect(el.shadowRoot!.querySelector('.activity-indicator__backdrop')).not.toBeNull();
			expect(el.hasAttribute('loading')).toBe(true);
			(el as unknown as NLDDActivityIndicator).complete = true;
			await litEl.updateComplete;
			expect(el.shadowRoot!.querySelector('.activity-indicator__backdrop')).not.toBeNull();
			expect(el.hasAttribute('loading')).toBe(false);
		} finally {
			vi.useRealTimers();
		}
	});

	it('sets has-content and makes the wrapped content inert while loading', async () => {
		el = await fixture(`
			<nldd-activity-indicator timing="instant">
				<button>Action</button>
			</nldd-activity-indicator>
		`);
		await waitForUpdate(el);
		expect(el.hasAttribute('has-content')).toBe(true);
		const content = el.shadowRoot!.querySelector('.activity-indicator__content')!;
		expect(content.hasAttribute('inert')).toBe(true);
		expect(content.getAttribute('aria-busy')).toBe('true');
	});

	it('lifts inert from the content when complete', async () => {
		el = await fixture<NLDDActivityIndicator>(`
			<nldd-activity-indicator timing="instant">
				<button>Action</button>
			</nldd-activity-indicator>
		`);
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.activity-indicator__content')!;
		expect(content.hasAttribute('inert')).toBe(true);
		(el as unknown as NLDDActivityIndicator).complete = true;
		await waitForUpdate(el);
		expect(content.hasAttribute('inert')).toBe(false);
		expect(content.getAttribute('aria-busy')).toBe('false');
	});

	it('stays standalone (no has-content, no inert) without slotted content', async () => {
		el = await fixture('<nldd-activity-indicator timing="instant"></nldd-activity-indicator>');
		await waitForUpdate(el);
		expect(el.hasAttribute('has-content')).toBe(false);
		expect(el.shadowRoot!.querySelector('.activity-indicator__content')!.hasAttribute('inert')).toBe(false);
	});

	describe('layout', () => {
		let removeTokens: () => void;
		beforeAll(() => { removeTokens = loadTokens(); });
		afterAll(() => removeTokens());

		it('holds its size during the delay and gives it up once complete', async () => {
			el = await fixture('<div><nldd-activity-indicator show-text style="--_activity-indicator-fade-duration: 0s"></nldd-activity-indicator></div>');
			const indicator = el.querySelector<NLDDActivityIndicator>('nldd-activity-indicator')!;
			await waitForUpdate(indicator);
			expect(indicator.hasAttribute('loading')).toBe(false);
			expect(indicator.getBoundingClientRect().height).toBeGreaterThan(32);
			indicator.complete = true;
			await waitForUpdate(indicator);
			expect(indicator.getBoundingClientRect().height).toBe(0);
		});

		it.each([
			['16', 'xs'],
			['20', 'xs'],
			['24', 'sm'],
			['28', 'sm'],
			['32', 'md'],
			['96', 'md'],
		])('sizes the label to the circle: size %s uses body-%s', async (size, font) => {
			el = await fixture(`<div><nldd-activity-indicator size="${size}" show-text></nldd-activity-indicator><span style="font: var(--primitives-font-body-${font}-regular-flat)">Laden</span></div>`);
			const indicator = el.querySelector<NLDDActivityIndicator>('nldd-activity-indicator')!;
			await waitForUpdate(indicator);
			const label = indicator.shadowRoot!.querySelector('.activity-indicator__text')!;
			const probe = el.querySelector('span')!;
			expect(getComputedStyle(probe).fontSize).not.toBe('');
			expect(getComputedStyle(label).fontSize).toBe(getComputedStyle(probe).fontSize);
		});
	});
});
