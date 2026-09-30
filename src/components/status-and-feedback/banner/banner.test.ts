import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, installUniversalReset } from '../../../test-utils.js';
import type { NLDDBanner } from './banner.js';
import './banner.js';

describe('nldd-banner', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-banner></nldd-banner>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to variant="neutral"', async () => {
		el = await fixture('<nldd-banner></nldd-banner>');
		await waitForUpdate(el);
		expect((el as unknown as { variant: string }).variant).toBe('neutral');
		expect(el.hasAttribute('variant')).toBe(false);
	});

	it('renders text and supporting-text', async () => {
		el = await fixture('<nldd-banner text="Titel" supporting-text="Toelichting"></nldd-banner>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.banner__text')!.textContent).toBe('Titel');
		expect(el.shadowRoot!.querySelector('.banner__supporting-text')!.textContent).toBe('Toelichting');
	});

	it('renders text as h2 when heading-level=2', async () => {
		el = await fixture('<nldd-banner text="Titel" heading-level="2"></nldd-banner>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('h2.banner__text')).not.toBeNull();
	});

	it('renders text as p when heading-level is absent', async () => {
		el = await fixture('<nldd-banner text="Titel"></nldd-banner>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('p.banner__text')).not.toBeNull();
	});


	/* ============================================================
	   Variants & icons
	   ============================================================ */

	it.each([
		['neutral', 'info-circle-filled'],
		['success', 'check-circle-filled'],
		['warning', 'exclamation-triangle-filled'],
		['critical', 'exclamation-circle-filled'],
		['accent', 'info-circle-filled'],
	])('variant="%s" uses default icon "%s"', async (variant, expectedIcon) => {
		el = await fixture(`<nldd-banner variant="${variant}"></nldd-banner>`);
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.banner__icon nldd-icon');
		expect(icon!.getAttribute('icon')).toBe(expectedIcon);
	});

	it('icon attribute overrides the default', async () => {
		el = await fixture('<nldd-banner variant="success" icon="star"></nldd-banner>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.banner__icon nldd-icon');
		expect(icon!.getAttribute('icon')).toBe('star');
	});


	/* ============================================================
	   ARIA semantics
	   ============================================================ */

	it('document.createElement does not throw (no attributes set in the constructor)', () => {
		// The Custom Elements spec forbids a constructor from adding attributes;
		// document.createElement (used by frameworks like Vue) throws
		// NotSupportedError if it does. Setting role/aria must wait for connect.
		expect(() => document.createElement('nldd-banner')).not.toThrow();
		const el = document.createElement('nldd-banner');
		expect(el.hasAttribute('role')).toBe(false); // not yet connected
	});

	it.each(['neutral', 'success', 'warning', 'accent'] as const)('variant="%s" gets role="status" and aria-live="polite"', async (variant) => {
		el = await fixture(`<nldd-banner variant="${variant}"></nldd-banner>`);
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('status');
		expect(el.getAttribute('aria-live')).toBe('polite');
	});

	it('critical variant gets role="alert" without aria-live', async () => {
		el = await fixture('<nldd-banner variant="critical"></nldd-banner>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('alert');
		expect(el.hasAttribute('aria-live')).toBe(false);
	});

	it('switches role/aria-live when variant changes', async () => {
		el = await fixture<NLDDBanner>('<nldd-banner variant="success"></nldd-banner>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('status');
		(el as unknown as NLDDBanner).variant = 'critical';
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('alert');
		expect(el.hasAttribute('aria-live')).toBe(false);
	});

	it('always sets aria-atomic="true" so live-region updates announce the whole banner', async () => {
		el = await fixture('<nldd-banner variant="success"></nldd-banner>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-atomic')).toBe('true');
		(el as unknown as NLDDBanner).variant = 'critical';
		await waitForUpdate(el);
		expect(el.getAttribute('aria-atomic')).toBe('true');
	});


	/* ============================================================
	   Dismissible
	   ============================================================ */

	it('does not render a dismiss button by default', async () => {
		el = await fixture('<nldd-banner></nldd-banner>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.banner__dismiss-button')).toBeNull();
	});

	it('renders a dismiss button when dismissible is set', async () => {
		el = await fixture('<nldd-banner dismissible></nldd-banner>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.banner__dismiss-button nldd-icon-button')).not.toBeNull();
	});

	it('fires a dismiss event when the dismiss button is clicked', async () => {
		el = await fixture('<nldd-banner dismissible></nldd-banner>');
		await waitForUpdate(el);
		let fired = false;
		el.addEventListener('dismiss', () => { fired = true; });
		const btn = el.shadowRoot!.querySelector<HTMLElement>('.banner__dismiss-button nldd-icon-button')!;
		btn.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
		expect(fired).toBe(true);
	});

	/* ============================================================
	   Slot detection — hidden flags driven by slotchange listeners
	   ============================================================ */

	it('hides the content area when the default slot is empty', async () => {
		el = await fixture('<nldd-banner text="Hi"></nldd-banner>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector<HTMLElement>('.banner__content')!;
		expect(content.hasAttribute('hidden')).toBe(true);
	});

	it('shows the content area when meaningful default-slot content is present', async () => {
		el = await fixture('<nldd-banner text="Hi"><p>Body copy</p></nldd-banner>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector<HTMLElement>('.banner__content')!;
		expect(content.hasAttribute('hidden')).toBe(false);
	});

	it('shows the actions area when slot="actions" has content', async () => {
		el = await fixture('<nldd-banner text="Hi"><nldd-button slot="actions" text="OK"></nldd-button></nldd-banner>');
		await waitForUpdate(el);
		const actions = el.shadowRoot!.querySelector<HTMLElement>('.banner__actions')!;
		expect(actions.hasAttribute('hidden')).toBe(false);
	});

	it('reacts to runtime slot mutations (added child flips the hidden flag)', async () => {
		el = await fixture('<nldd-banner text="Hi"></nldd-banner>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector<HTMLElement>('.banner__content')!;
		expect(content.hasAttribute('hidden')).toBe(true);
		const child = document.createElement('p');
		child.textContent = 'Body copy added late';
		el.appendChild(child);
		await waitForUpdate(el);
		expect(content.hasAttribute('hidden')).toBe(false);
	});

	it('reattaches slot listeners after a disconnect + reconnect', async () => {
		el = await fixture('<nldd-banner text="Hi"></nldd-banner>');
		await waitForUpdate(el);
		const parent = el.parentElement!;
		parent.removeChild(el);
		parent.appendChild(el);
		await waitForUpdate(el);
		// Add content after the reconnect; the new listener should pick it up.
		const child = document.createElement('p');
		child.textContent = 'Late content after reconnect';
		el.appendChild(child);
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector<HTMLElement>('.banner__content')!;
		expect(content.hasAttribute('hidden')).toBe(false);
	});

	// The tokens come from variables.css, which the test environment does not
	// load, so they are supplied here. What is under test is the wiring: which
	// token each size reads, not the value it happens to hold.
	it('krimpt padding en icoon bij size="sm"', async () => {
		el = await fixture(`
			<div style="--components-banner-sm-padding: 8px; --components-banner-sm-icon-size: 24px;">
				<nldd-banner size="sm" text="Let op"></nldd-banner>
			</div>
		`);
		const banner = el.querySelector('nldd-banner') as HTMLElement;
		await waitForUpdate(banner);
		const box = banner.shadowRoot!.querySelector<HTMLElement>('.banner')!;
		const icon = banner.shadowRoot!.querySelector<HTMLElement>('.banner__icon')!;
		expect(getComputedStyle(box).padding).toBe('8px');
		expect(getComputedStyle(icon).width).toBe('24px');
	});

	it('geeft de sluit-knop dezelfde maat als de banner', async () => {
		el = await fixture('<nldd-banner size="sm" text="Let op" dismissible></nldd-banner>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('nldd-icon-button')!;
		expect(button.getAttribute('size')).toBe('sm');
	});

	it('houdt md als standaard, zonder size-attribuut op de host', async () => {
		el = await fixture(`
			<div style="--components-banner-md-padding: 12px; --components-banner-md-icon-size: 32px;">
				<nldd-banner text="Let op"></nldd-banner>
			</div>
		`);
		const banner = el.querySelector('nldd-banner') as HTMLElement;
		await waitForUpdate(banner);
		const icon = banner.shadowRoot!.querySelector<HTMLElement>('.banner__icon')!;
		expect(banner.hasAttribute('size')).toBe(false);
		expect(getComputedStyle(icon).width).toBe('32px');
	});
});

describe('nldd-banner onder een universele reset', () => {
	let el: HTMLElement;
	let removeReset: () => void;

	afterEach(() => {
		removeReset();
		if (el) cleanup(el);
	});

	it('behoudt de padding rond de inhoud', async () => {
		removeReset = installUniversalReset();
		el = await fixture(`
			<div style="--components-banner-md-padding: 12px;">
				<nldd-banner text="Let op"></nldd-banner>
			</div>
		`);
		const banner = el.querySelector('nldd-banner') as HTMLElement;
		await waitForUpdate(banner);
		const icon = banner.shadowRoot!.querySelector('.banner__icon')!;
		const offset = icon.getBoundingClientRect().left - banner.getBoundingClientRect().left;
		expect(offset).toBe(12);
	});
});
