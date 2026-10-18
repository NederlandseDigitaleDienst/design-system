import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDLink } from './link.js';
import './link.js';

describe('nldd-link', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-link></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults size to inherit, and leaves the attribute off', async () => {
		el = await fixture('<nldd-link href="#" text="Go home"></nldd-link>');
		await waitForUpdate(el);
		expect((el as NLDDLink).size).toBe('inherit');
		expect(el.hasAttribute('size')).toBe(false);
		// The bare host and an explicit size="inherit" share every rule, so both
		// stay inline and wrap in running text.
		expect(getComputedStyle(el).display).toBe('inline');
	});

	it('renders text from text attribute', async () => {
		el = await fixture('<nldd-link href="#" text="Go home"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.textContent).toContain('Go home');
	});

	it('sets href on inner anchor', async () => {
		el = await fixture('<nldd-link href="/about" text="About"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.getAttribute('href')).toBe('/about');
	});

	it('defaults rel to noopener noreferrer for target=_blank', async () => {
		el = await fixture('<nldd-link href="https://example.com" target="_blank" text="External"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('merges custom rel with noopener noreferrer for target=_blank', async () => {
		el = await fixture('<nldd-link href="https://example.com" target="_blank" rel="nofollow" text="External"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		const rel = anchor.getAttribute('rel')!.split(/\s+/);
		expect(rel).toContain('nofollow');
		expect(rel).toContain('noopener');
		expect(rel).toContain('noreferrer');
	});

	it('does not add safety attrs when target is not _blank', async () => {
		el = await fixture('<nldd-link href="/local" rel="nofollow" text="Local"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.getAttribute('rel')).toBe('nofollow');
	});

	it('announces "opens in new tab" via a visually-hidden hint when target=_blank', async () => {
		el = await fixture('<nldd-link href="/overzicht" target="_blank" text="External"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.querySelector('.link__link-hint')?.textContent).toBe(', opent in nieuw tabblad');
		// The name stays content-derived (visible text + hint), so no aria-label override.
		expect(anchor.hasAttribute('aria-label')).toBe(false);
	});

	it('folds the new-tab hint into aria-label when accessible-label is set', async () => {
		el = await fixture('<nldd-link href="/overzicht" target="_blank" accessible-label="Externe site" text="External"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.getAttribute('aria-label')).toBe('Externe site, opent in nieuw tabblad');
		// A hidden span would lose to aria-label, so it isn't rendered.
		expect(anchor.querySelector('.link__link-hint')).toBeNull();
	});

	it('omits the new-tab hint when target is not _blank', async () => {
		el = await fixture('<nldd-link href="/local" text="Local"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.querySelector('.link__link-hint')).toBeNull();
		expect(anchor.hasAttribute('aria-label')).toBe(false);
	});

	it('suppresses the new-tab hint when disabled (the anchor does not navigate)', async () => {
		el = await fixture('<nldd-link href="/overzicht" target="_blank" disabled text="External"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.querySelector('.link__link-hint')).toBeNull();
	});

	it('overrides the new-tab wording via the translations property', async () => {
		el = await fixture('<nldd-link href="/overzicht" target="_blank" text="External"></nldd-link>');
		(el as NLDDLink).translations = { 'components.link.opens-in-new-tab-lowercase-label': 'opens in a new tab' };
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.link__link-hint')?.textContent).toBe(', opens in a new tab');
	});

	it('says a link to another website goes there', async () => {
		el = await fixture('<nldd-link href="https://open.overheid.nl/" text="Lees de startnotitie"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.link__link-hint')?.textContent).toBe(', andere website');
	});

	it('makes one sentence of another website in a new tab', async () => {
		el = await fixture('<nldd-link href="https://open.overheid.nl/" target="_blank" text="Lees de startnotitie"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelectorAll('.link__link-hint')).toHaveLength(1);
		expect(el.shadowRoot!.querySelector('.link__link-hint')?.textContent).toBe(', andere website, opent in nieuw tabblad');
	});

	it('removes href and adds role="link" + tabindex=0 when disabled', async () => {
		el = await fixture('<nldd-link href="#" text="Disabled" disabled></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.hasAttribute('href')).toBe(false);
		expect(anchor.getAttribute('role')).toBe('link');
		expect(anchor.getAttribute('tabindex')).toBe('0');
		expect(anchor.getAttribute('aria-disabled')).toBe('true');
	});

	it('blocks programmatic click when disabled', async () => {
		el = await fixture('<nldd-link href="#" text="Disabled" disabled></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		anchor.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});

	// — Inherit / inline mode —

	it('has no size attribute by default (inherit mode)', async () => {
		el = await fixture('<nldd-link href="#" text="Inline"></nldd-link>');
		await waitForUpdate(el);
		expect(el.hasAttribute('size')).toBe(false);
	});

	it('inherit mode uses display: inline so text wraps in flow', async () => {
		el = await fixture('<nldd-link href="#" text="Inline"></nldd-link>');
		await waitForUpdate(el);
		expect(getComputedStyle(el).display).toBe('inline');
	});

	it('explicit size="inherit" behaves identically to no size', async () => {
		el = await fixture('<nldd-link href="#" size="inherit" text="Inline"></nldd-link>');
		await waitForUpdate(el);
		expect(getComputedStyle(el).display).toBe('inline');
	});

	it('sized mode uses display: inline-flex for icon alignment', async () => {
		el = await fixture('<nldd-link href="#" size="md" text="Sized"></nldd-link>');
		await waitForUpdate(el);
		expect(getComputedStyle(el).display).toBe('inline-flex');
	});

	it('inherit mode renders start-icon (whitespace provides spacing)', async () => {
		el = await fixture('<nldd-link href="#" text="With icon" start-icon="download"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.link__start-icon')).not.toBeNull();
	});

	it('inherit mode renders end-icon (whitespace provides spacing)', async () => {
		el = await fixture('<nldd-link href="#" text="With icon" end-icon="arrow-right"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.link__end-icon')).not.toBeNull();
	});

	it('sized mode renders icons as before', async () => {
		el = await fixture('<nldd-link href="#" size="md" text="With icon" start-icon="download"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.link__start-icon')).not.toBeNull();
	});
});

describe('nldd-link no-tab', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('takes the link out of the tab order', async () => {
		el = await fixture<NLDDLink>('<nldd-link href="/x" text="X" no-tab></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('tabindex')).toBe('-1');
	});

	it('wins over the tab stop a disabled link keeps', async () => {
		el = await fixture<NLDDLink>('<nldd-link href="/x" text="X" disabled no-tab></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('tabindex')).toBe('-1');
	});

	it('is in the tab order by default (no tabindex attribute)', async () => {
		el = await fixture<NLDDLink>('<nldd-link href="/x" text="X"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.hasAttribute('tabindex')).toBe(false);
	});
});
