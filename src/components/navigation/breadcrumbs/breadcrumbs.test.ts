import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './breadcrumbs.js';

describe('nldd-breadcrumbs', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders a nav landmark with the default aria-label', async () => {
		el = await fixture(`
			<nldd-breadcrumbs>
				<nldd-breadcrumbs-item text="Home" href="/"></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item text="Here" current></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>
		`);
		await waitForUpdate(el);
		const nav = el.shadowRoot!.querySelector('nav');
		expect(nav).not.toBeNull();
		expect(nav!.getAttribute('aria-label')).toBe('Kruimelpad');
	});

	it('renders every item into the list', async () => {
		el = await fixture(`
			<nldd-breadcrumbs>
				<nldd-breadcrumbs-item text="Home" href="/"></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item text="Documentatie" href="/docs/"></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item text="Here" current></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!;
		expect(slot.assignedElements().length).toBe(3);
	});

	it('lets the items wrap so the trail fits any width', async () => {
		el = await fixture(`
			<nldd-breadcrumbs>
				<nldd-breadcrumbs-item text="Home" href="/"></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item text="Here" current></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>
		`);
		await waitForUpdate(el);
		const items = el.shadowRoot!.querySelector('.breadcrumbs__items')!;
		expect(getComputedStyle(items).flexWrap).toBe('wrap');
	});
});

describe('nldd-breadcrumbs-item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-breadcrumbs-item text="Home"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('sets role="listitem" on the host', async () => {
		el = await fixture('<nldd-breadcrumbs-item text="Home"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('listitem');
	});

	it('does not overwrite a consumer-provided role', async () => {
		el = await fixture('<nldd-breadcrumbs-item role="treeitem" text="Home"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('treeitem');
	});

	it('renders as a link when href is set', async () => {
		el = await fixture('<nldd-breadcrumbs-item href="/docs/" text="Docs"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		const a = el.shadowRoot!.querySelector('a');
		expect(a).not.toBeNull();
		expect(a!.getAttribute('href')).toBe('/docs/');
	});

	it('renders plain text and sets aria-current on the host when current', async () => {
		el = await fixture('<nldd-breadcrumbs-item current text="Here" href="/here/"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')).toBeNull();
		expect(el.getAttribute('aria-current')).toBe('page');
	});

	it('clears aria-current when current is toggled off', async () => {
		el = await fixture('<nldd-breadcrumbs-item current text="Here"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-current')).toBe('page');
		el.removeAttribute('current');
		await waitForUpdate(el);
		expect(el.hasAttribute('aria-current')).toBe(false);
	});

	it('renders a chevron-right separator after every item', async () => {
		el = await fixture('<nldd-breadcrumbs-item text="Home" href="/"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		const sep = el.shadowRoot!.querySelector('.breadcrumbs__separator');
		expect(sep).not.toBeNull();
		expect(sep?.querySelector('nldd-icon')?.getAttribute('icon')).toBe('chevron-right-small');
	});
});
