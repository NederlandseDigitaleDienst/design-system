import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './page-footer.js';
import '../../navigation/breadcrumbs/breadcrumbs.js';

describe('nldd-page-footer', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('exposes the contentinfo landmark on the host', async () => {
		// VoiceOver/Safari doesn't traverse a shadow-root <footer> as a
		// landmark, so the role goes on the host instead of the inner div.
		el = await fixture('<nldd-page-footer></nldd-page-footer>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('contentinfo');
	});

	it('respects a consumer-provided role attribute', async () => {
		el = await fixture('<nldd-page-footer role="region"></nldd-page-footer>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('region');
	});

	it('hides all wrapper slots when no content is provided', async () => {
		el = await fixture('<nldd-page-footer></nldd-page-footer>');
		await waitForUpdate(el);
		const breadcrumbs = el.shadowRoot!.querySelector('.page-footer__breadcrumbs') as HTMLElement;
		const main = el.shadowRoot!.querySelector('.page-footer__main') as HTMLElement;
		const legal = el.shadowRoot!.querySelector('.page-footer__legal-bar') as HTMLElement;
		expect(breadcrumbs.hidden).toBe(true);
		expect(main.hidden).toBe(true);
		expect(legal.hidden).toBe(true);
		// Empty footer drops the gray band — only the lintje shows. See
		// :host([empty]) in the styles.
		expect(el.hasAttribute('empty')).toBe(true);
	});

	it('clears empty once any row has content', async () => {
		el = await fixture(`
			<nldd-page-footer>
				<div>Main content</div>
			</nldd-page-footer>
		`);
		await waitForUpdate(el);
		expect(el.hasAttribute('empty')).toBe(false);
	});

	it('reveals the breadcrumbs and legal-bar wrappers when their slots have content', async () => {
		el = await fixture(`
			<nldd-page-footer>
				<nldd-page-footer-legal-bar slot="legal-bar">
					<nldd-page-footer-legal-bar-item slot="end" text="Privacy" href="/privacy/"></nldd-page-footer-legal-bar-item>
				</nldd-page-footer-legal-bar>
			</nldd-page-footer>
		`);
		await waitForUpdate(el);
		const legal = el.shadowRoot!.querySelector('.page-footer__legal-bar') as HTMLElement;
		expect(legal.hidden).toBe(false);
	});

	it('shows two dividers when all three slots are populated', async () => {
		el = await fixture(`
			<nldd-page-footer>
				<nldd-breadcrumbs slot="breadcrumbs">
					<nldd-breadcrumbs-item text="Home" href="/"></nldd-breadcrumbs-item>
				</nldd-breadcrumbs>
				<p>Main content</p>
				<nldd-page-footer-legal-bar slot="legal-bar">
					<nldd-page-footer-legal-bar-item slot="end" text="Privacy" href="/privacy/"></nldd-page-footer-legal-bar-item>
				</nldd-page-footer-legal-bar>
			</nldd-page-footer>
		`);
		await waitForUpdate(el);
		const dividers = Array.from(el.shadowRoot!.querySelectorAll('.page-footer__divider')) as HTMLElement[];
		expect(dividers).toHaveLength(2);
		expect(dividers.every(d => !d.hidden)).toBe(true);
	});

	it('hides dividers when only one row is present', async () => {
		el = await fixture(`
			<nldd-page-footer>
				<nldd-page-footer-legal-bar slot="legal-bar">
					<nldd-page-footer-legal-bar-item slot="end" text="Privacy" href="/privacy/"></nldd-page-footer-legal-bar-item>
				</nldd-page-footer-legal-bar>
			</nldd-page-footer>
		`);
		await waitForUpdate(el);
		const dividers = Array.from(el.shadowRoot!.querySelectorAll('.page-footer__divider')) as HTMLElement[];
		expect(dividers.every(d => d.hidden)).toBe(true);
	});

	it('sets single-slot when only one row is visible', async () => {
		el = await fixture(`
			<nldd-page-footer>
				<nldd-page-footer-legal-bar slot="legal-bar">
					<nldd-page-footer-legal-bar-item slot="end" text="Privacy" href="/privacy/"></nldd-page-footer-legal-bar-item>
				</nldd-page-footer-legal-bar>
			</nldd-page-footer>
		`);
		await waitForUpdate(el);
		expect(el.hasAttribute('single-slot')).toBe(true);
	});

	it('feeds a CSS-length width to the body max-width and clears it for full/default', async () => {
		el = await fixture('<nldd-page-footer width="480px"></nldd-page-footer>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_page-footer-max-width')).toBe('480px');
		// 'full' is handled by CSS (:host([width="full"]) sets none) — inline var cleared.
		(el as HTMLElement & { width: string }).width = 'full';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_page-footer-max-width')).toBe('');
		expect(el.getAttribute('width')).toBe('full');
		// back to default: no override.
		(el as HTMLElement & { width: string }).width = '';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_page-footer-max-width')).toBe('');
	});

	it('sets single-slot when only the default (main) slot is populated', async () => {
		el = await fixture(`
			<nldd-page-footer>
				<div>Main content</div>
			</nldd-page-footer>
		`);
		await waitForUpdate(el);
		expect(el.hasAttribute('single-slot')).toBe(true);
	});

	it('clears single-slot when multiple rows are visible', async () => {
		el = await fixture(`
			<nldd-page-footer>
				<nldd-breadcrumbs slot="breadcrumbs">
					<nldd-breadcrumbs-item text="Home" href="/"></nldd-breadcrumbs-item>
				</nldd-breadcrumbs>
				<nldd-page-footer-legal-bar slot="legal-bar">
					<nldd-page-footer-legal-bar-item slot="end" text="Privacy" href="/privacy/"></nldd-page-footer-legal-bar-item>
				</nldd-page-footer-legal-bar>
			</nldd-page-footer>
		`);
		await waitForUpdate(el);
		expect(el.hasAttribute('single-slot')).toBe(false);
	});

	it('sets id="page-footer" on the host for skip-link targets', async () => {
		el = await fixture('<nldd-page-footer></nldd-page-footer>');
		await waitForUpdate(el);
		expect(el.id).toBe('page-footer');
	});

	it('does not overwrite a consumer-provided host id', async () => {
		el = await fixture('<nldd-page-footer id="my-footer"></nldd-page-footer>');
		await waitForUpdate(el);
		expect(el.id).toBe('my-footer');
	});
});

describe('nldd-page-footer-legal-bar', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders a nav landmark with the default aria-label', async () => {
		el = await fixture(`
			<nldd-page-footer-legal-bar>
				<nldd-page-footer-legal-bar-item slot="end" text="Privacy" href="/privacy/"></nldd-page-footer-legal-bar-item>
			</nldd-page-footer-legal-bar>
		`);
		await waitForUpdate(el);
		const nav = el.shadowRoot!.querySelector('nav');
		expect(nav).not.toBeNull();
		expect(nav!.getAttribute('aria-label')).toBe('Juridische links');
	});

	it('hides the start wrapper when no start items are slotted', async () => {
		el = await fixture(`
			<nldd-page-footer-legal-bar>
				<nldd-page-footer-legal-bar-item slot="end" text="Privacy" href="/privacy/"></nldd-page-footer-legal-bar-item>
			</nldd-page-footer-legal-bar>
		`);
		await waitForUpdate(el);
		const start = el.shadowRoot!.querySelector('.page-footer__legal-bar-start') as HTMLElement;
		const end = el.shadowRoot!.querySelector('.page-footer__legal-bar-end') as HTMLElement;
		expect(start.hidden).toBe(true);
		expect(end.hidden).toBe(false);
	});

	it('hides the nav landmark when both start and end are empty', async () => {
		el = await fixture('<nldd-page-footer-legal-bar></nldd-page-footer-legal-bar>');
		await waitForUpdate(el);
		const nav = el.shadowRoot!.querySelector('nav') as HTMLElement;
		expect(nav.hidden).toBe(true);
	});
});

describe('nldd-page-footer-legal-bar-item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders as a link when href is set', async () => {
		el = await fixture('<nldd-page-footer-legal-bar-item href="/privacy/" text="Privacy"></nldd-page-footer-legal-bar-item>');
		await waitForUpdate(el);
		const a = el.shadowRoot!.querySelector('a');
		expect(a).not.toBeNull();
		expect(a!.getAttribute('href')).toBe('/privacy/');
		expect(a!.textContent).toBe('Privacy');
	});

	it('renders plain text when no href is set', async () => {
		el = await fixture('<nldd-page-footer-legal-bar-item text="© 2026"></nldd-page-footer-legal-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')).toBeNull();
		const span = el.shadowRoot!.querySelector('.page-footer__legal-bar-item');
		expect(span?.textContent?.trim()).toBe('© 2026');
	});

	it('falls back to the default slot when no text attribute is set', async () => {
		el = await fixture('<nldd-page-footer-legal-bar-item>Disclaimer</nldd-page-footer-legal-bar-item>');
		await waitForUpdate(el);
		// Slotted content lives in the light DOM; el.textContent walks both trees.
		expect(el.textContent?.trim()).toBe('Disclaimer');
	});
});
