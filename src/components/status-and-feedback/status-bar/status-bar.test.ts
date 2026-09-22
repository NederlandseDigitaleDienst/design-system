import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDStatusBar } from './status-bar.js';
import './status-bar.js';

describe('nldd-status-bar', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	/* WCAG 1.4.4: text up to 200% without losing content. The bar is 24px and the
	   text follows the reader's own size, so a fixed height cut the line off. The
	   height is a token, and a test document has no variables.css, so it comes
	   along here. */
	it('kapt zijn tekst niet af als de tekstgrootte omhoog gaat', async () => {
		const root = document.documentElement;
		const eigen = root.style.fontSize;
		root.style.fontSize = '32px'; // 200%
		try {
			el = await fixture('<nldd-status-bar variant="warning" text="Storing" style="--components-status-bar-height: 24px"></nldd-status-bar>');
			await waitForUpdate(el);
			const bar = el.shadowRoot!.querySelector('.status-bar') as HTMLElement;
			const text = el.shadowRoot!.querySelector('.status-bar__text') as HTMLElement;
			expect(bar.getBoundingClientRect().height).toBeGreaterThanOrEqual(text.getBoundingClientRect().height);
			// And still one line, cut off with an ellipsis where it is too long.
			expect(getComputedStyle(text).whiteSpace).toBe('nowrap');
			expect(getComputedStyle(text).textOverflow).toBe('ellipsis');
		} finally {
			root.style.fontSize = eigen;
		}
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-status-bar></nldd-status-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to variant="neutral"', async () => {
		el = await fixture('<nldd-status-bar></nldd-status-bar>');
		await waitForUpdate(el);
		expect((el as unknown as { variant: string }).variant).toBe('neutral');
		expect(el.hasAttribute('variant')).toBe(false);
	});

	it('reflects the variant property to the attribute', async () => {
		el = await fixture('<nldd-status-bar></nldd-status-bar>');
		await waitForUpdate(el);
		(el as NLDDStatusBar).variant = 'warning';
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('warning');
	});

	it('renders text', async () => {
		el = await fixture('<nldd-status-bar text="Gepland onderhoud"></nldd-status-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.status-bar__text')!.textContent).toBe('Gepland onderhoud');
	});

	it('upgrades via document.createElement (the Vue/React path) with the live-region role', async () => {
		// Vue, React and other createElement-based renderers build autonomous custom
		// elements with document.createElement, which throws NotSupportedError if the
		// constructor adds attributes. This is the exact path the parser-based
		// fixture() helper does NOT exercise, so it guards a real regression: the
		// aria setup must live in connectedCallback, not the constructor.
		el = document.createElement('nldd-status-bar');
		const wrapper = document.createElement('div');
		wrapper.appendChild(el);
		document.body.appendChild(wrapper);
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
		expect(el.getAttribute('role')).toBe('status');
		expect(el.getAttribute('aria-live')).toBe('polite');
	});


	/* ============================================================
	   Render modes (static / link / button)
	   ============================================================ */

	it('renders a static div without href or button', async () => {
		el = await fixture('<nldd-status-bar text="Status"></nldd-status-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('div.status-bar')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('a, button')).toBeNull();
	});

	it('does not render a chevron when static', async () => {
		el = await fixture('<nldd-status-bar text="Status"></nldd-status-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.status-bar__action-icon')).toBeNull();
	});

	it('renders an <a> with chevron when href is set', async () => {
		el = await fixture('<nldd-status-bar text="Status" href="/status"></nldd-status-bar>');
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a.status-bar');
		expect(link).not.toBeNull();
		expect(link!.getAttribute('href')).toBe('/status');
		expect(el.shadowRoot!.querySelector('.status-bar__action-icon nldd-icon')).not.toBeNull();
	});

	it('renders a <button type="button"> with chevron when button is set', async () => {
		el = await fixture('<nldd-status-bar text="Status" button></nldd-status-bar>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button.status-bar');
		expect(button).not.toBeNull();
		expect(button!.getAttribute('type')).toBe('button');
		expect(el.shadowRoot!.querySelector('.status-bar__action-icon nldd-icon')).not.toBeNull();
	});

	it('href wins over button when both are set', async () => {
		el = await fixture('<nldd-status-bar text="Status" href="/status" button></nldd-status-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a.status-bar')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('button')).toBeNull();
	});

	it('passes target through and auto-secures rel for _blank', async () => {
		el = await fixture('<nldd-status-bar text="Status" href="https://example.org" target="_blank"></nldd-status-bar>');
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a.status-bar')!;
		expect(link.getAttribute('target')).toBe('_blank');
		expect(link.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('adds noopener noreferrer to a rel of your own with target="_blank"', async () => {
		el = await fixture('<nldd-status-bar text="Status" href="https://example.org" target="_blank" rel="external"></nldd-status-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a.status-bar')!.getAttribute('rel')).toBe('external noopener noreferrer');
	});

	it('omits rel without target="_blank"', async () => {
		el = await fixture('<nldd-status-bar text="Status" href="/status"></nldd-status-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a.status-bar')!.hasAttribute('rel')).toBe(false);
	});


	/* ============================================================
	   ARIA semantics
	   ============================================================ */

	it.each(['neutral', 'accent', 'success', 'warning'] as const)('variant="%s" gets role="status" and aria-live="polite"', async (variant) => {
		el = await fixture(`<nldd-status-bar variant="${variant}"></nldd-status-bar>`);
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('status');
		expect(el.getAttribute('aria-live')).toBe('polite');
	});

	it('variant="critical" gets role="alert" without aria-live', async () => {
		el = await fixture('<nldd-status-bar variant="critical"></nldd-status-bar>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('alert');
		expect(el.hasAttribute('aria-live')).toBe(false);
	});

	it('sets aria-atomic="true"', async () => {
		el = await fixture('<nldd-status-bar></nldd-status-bar>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-atomic')).toBe('true');
	});

	it('updates role when variant changes at runtime', async () => {
		el = await fixture('<nldd-status-bar variant="neutral"></nldd-status-bar>');
		await waitForUpdate(el);
		(el as NLDDStatusBar).variant = 'critical';
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('alert');
		expect(el.hasAttribute('aria-live')).toBe(false);
	});

	it('restores role="status" and aria-live when switching away from critical', async () => {
		el = await fixture('<nldd-status-bar variant="critical"></nldd-status-bar>');
		await waitForUpdate(el);
		(el as NLDDStatusBar).variant = 'accent';
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('status');
		expect(el.getAttribute('aria-live')).toBe('polite');
	});

	it('keeps aria-atomic="true" across a variant change', async () => {
		el = await fixture('<nldd-status-bar variant="neutral"></nldd-status-bar>');
		await waitForUpdate(el);
		(el as NLDDStatusBar).variant = 'critical';
		await waitForUpdate(el);
		expect(el.getAttribute('aria-atomic')).toBe('true');
		(el as NLDDStatusBar).variant = 'success';
		await waitForUpdate(el);
		expect(el.getAttribute('aria-atomic')).toBe('true');
	});
});
