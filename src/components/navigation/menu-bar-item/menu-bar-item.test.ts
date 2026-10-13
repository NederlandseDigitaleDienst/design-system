import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import './menu-bar-item.js';
import '../../content/avatar/avatar.js';

describe('nldd-menu-bar-item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-menu-bar-item text="Test"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
		expect(el).toBeInstanceOf(customElements.get('nldd-menu-bar-item'));
	});

	it('renders text from attribute', async () => {
		el = await fixture('<nldd-menu-bar-item text="Hello"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.menu-bar-item__text');
		expect(content!.textContent!.trim()).toBe('Hello');
	});

	it('does not set current on click', async () => {
		el = await fixture('<nldd-menu-bar-item text="Test"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		el.click();
		await waitForUpdate(el);
		expect(el.hasAttribute('current')).toBe(false);
	});

	it('opens the slotted nldd-menu on click when expandable', async () => {
		el = await fixture(`
			<nldd-menu-bar-item text="NL" expandable>
				<nldd-menu>
					<nldd-menu-item text="Nederlands"></nldd-menu-item>
					<nldd-menu-item text="English"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-bar-item>
		`);
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as HTMLElement & { matches(s: string): boolean };
		expect(menu).not.toBeNull();
		expect(menu.matches(':popover-open')).toBe(false);
		el.click();
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('does not fire select when expandable with a slotted menu', async () => {
		el = await fixture(`
			<nldd-menu-bar-item text="NL" expandable>
				<nldd-menu>
					<nldd-menu-item text="Nederlands"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-bar-item>
		`);
		await waitForUpdate(el);
		let fired = false;
		el.addEventListener('select', () => { fired = true; });
		el.click();
		await waitForUpdate(el);
		expect(fired).toBe(false);
	});

	it('fires select when expandable but no slotted menu', async () => {
		el = await fixture('<nldd-menu-bar-item text="More" expandable></nldd-menu-bar-item>');
		await waitForUpdate(el);
		let fired = false;
		el.addEventListener('select', () => { fired = true; });
		el.click();
		await waitForUpdate(el);
		expect(fired).toBe(true);
	});

	it('renders as link when href is set', async () => {
		el = await fixture('<nldd-menu-bar-item text="Home" href="/home"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a.menu-bar-item');
		expect(link).not.toBeNull();
		expect(link!.getAttribute('href')).toBe('/home');
	});

	it('renders as button when no href', async () => {
		el = await fixture('<nldd-menu-bar-item text="Action"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button.menu-bar-item');
		expect(button).not.toBeNull();
	});

	it('renders icon when icon attribute is set', async () => {
		el = await fixture('<nldd-menu-bar-item text="Search" icon="magnifier"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.menu-bar-item__icon');
		expect(icon).not.toBeNull();
	});

	it('renders disclosure icon when expandable', async () => {
		el = await fixture('<nldd-menu-bar-item text="More" expandable></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const disclosure = el.shadowRoot!.querySelector('.menu-bar-item__disclosure-icon');
		expect(disclosure).not.toBeNull();
	});

	it('dispatches select event on button click', async () => {
		el = await fixture('<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('select', ((e: CustomEvent) => {
			detail = e.detail;
		}) as EventListener);
		el.click();
		await waitForUpdate(el);
		expect(detail).toBeDefined();
		expect(detail.item).toBe(el);
	});

	it('does not dispatch select when disabled', async () => {
		el = await fixture('<nldd-menu-bar-item text="Home" disabled></nldd-menu-bar-item>');
		await waitForUpdate(el);
		let fired = false;
		el.addEventListener('select', () => { fired = true; });
		el.click();
		await waitForUpdate(el);
		expect(fired).toBe(false);
	});

	it('delegates focus to inner button', async () => {
		el = await fixture('<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		el.focus();
		const button = el.shadowRoot!.querySelector('button');
		expect(el.shadowRoot!.activeElement).toBe(button);
	});

	it('reflects content-priority attribute', async () => {
		el = await fixture('<nldd-menu-bar-item text="Zoeken" icon="magnifier" content-priority="icon"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('content-priority')).toBe('icon');
	});

	it('reflects compact attribute', async () => {
		el = await fixture('<nldd-menu-bar-item text="Zoeken" icon="magnifier" compact></nldd-menu-bar-item>');
		await waitForUpdate(el);
		expect(el.hasAttribute('compact')).toBe(true);
	});

	it('sets aria-label when content-priority="icon" and compact', async () => {
		el = await fixture('<nldd-menu-bar-item text="Zoeken" icon="magnifier" content-priority="icon" compact></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button');
		expect(button!.getAttribute('aria-label')).toBe('Zoeken');
	});

	it('does not set aria-label when content-priority="icon" without compact', async () => {
		el = await fixture('<nldd-menu-bar-item text="Zoeken" icon="magnifier" content-priority="icon"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button');
		expect(button!.hasAttribute('aria-label')).toBe(false);
	});
});

describe('nldd-menu-bar-item – URL sanitization', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('does not render link for javascript: href', async () => {
		el = await fixture('<nldd-menu-bar-item text="Link" href="javascript:alert(1)"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a');
		expect(link).toBeNull();
		const button = el.shadowRoot!.querySelector('button');
		expect(button).not.toBeNull();
	});

	it('renders link for valid href', async () => {
		el = await fixture('<nldd-menu-bar-item text="Link" href="/page"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a');
		expect(link).not.toBeNull();
		expect(link!.getAttribute('href')).toBe('/page');
	});
});

describe('nldd-menu-bar-item – icon slot', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const iconArea = () => el.shadowRoot!.querySelector('.menu-bar-item__icon') as HTMLElement;
	const text = () => el.shadowRoot!.querySelector('.menu-bar-item__text') as HTMLElement;

	it('shows no icon area without an icon or a slotted one', async () => {
		el = await fixture('<nldd-menu-bar-item text="Account"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		expect(iconArea().hidden).toBe(true);
		expect(el.hasAttribute('data-has-icon')).toBe(false);
	});

	it('puts a slotted element in the place of the icon, at the size of an icon', async () => {
		// The size of the icon area is a token, which a test document does not have by itself.
		const unloadTokens = loadTokens();
		try {
			el = await fixture('<nldd-menu-bar-item text="Account" icon="person"><span slot="icon" id="mine"></span></nldd-menu-bar-item>');
			await waitForUpdate(el);
			expect(iconArea().hidden).toBe(false);
			expect(el.hasAttribute('data-has-icon')).toBe(true);
			const slotted = el.querySelector('#mine')!.getBoundingClientRect();
			expect(Math.round(slotted.width)).toBe(20);
			expect(Math.round(slotted.height)).toBe(20);
		} finally {
			unloadTokens();
		}
		// The slotted element wins over the icon name, which is only the fallback.
		const slot = el.shadowRoot!.querySelector('slot[name="icon"]') as HTMLSlotElement;
		expect(slot.assignedElements().length).toBe(1);
	});

	it('keeps only the slotted icon in compact mode with content-priority="icon", named by the text', async () => {
		el = await fixture('<nldd-menu-bar-item text="Account" content-priority="icon" compact><span slot="icon"></span></nldd-menu-bar-item>');
		await waitForUpdate(el);
		expect(iconArea().hidden).toBe(false);
		expect(Math.round(text().getBoundingClientRect().width)).toBeLessThanOrEqual(1);
		expect(el.shadowRoot!.querySelector('.menu-bar-item')!.getAttribute('aria-label')).toBe('Account');
	});

	it('hides the slotted icon in compact mode with content-priority="text"', async () => {
		el = await fixture('<nldd-menu-bar-item text="Account" content-priority="text" compact><span slot="icon"></span></nldd-menu-bar-item>');
		await waitForUpdate(el);
		expect(getComputedStyle(iconArea()).display).toBe('none');
		expect(text().getBoundingClientRect().width).toBeGreaterThan(1);
	});

	it('leaves a slotted avatar to center its own shape, so icon-aligned sits in the middle', async () => {
		const unloadTokens = loadTokens();
		try {
			el = await fixture('<nldd-menu-bar-item text="Account"><nldd-avatar slot="icon" name="Anouk de Vries" decorative icon-aligned></nldd-avatar></nldd-menu-bar-item>');
			await waitForUpdate(el);
			const avatar = el.querySelector('nldd-avatar') as HTMLElement;
			await waitForUpdate(avatar);
			const host = avatar.getBoundingClientRect();
			const shape = avatar.shadowRoot!.querySelector('.avatar')!.getBoundingClientRect();
			expect(Math.round(host.height)).toBe(20);
			expect(shape.height).toBeLessThan(host.height);
			expect(Math.abs((shape.top + shape.height / 2) - (host.top + host.height / 2))).toBeLessThan(0.6);
		} finally {
			unloadTokens();
		}
	});

	it('follows a slotted icon that arrives or leaves later', async () => {
		el = await fixture('<nldd-menu-bar-item text="Account"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const avatar = document.createElement('span');
		avatar.slot = 'icon';
		el.append(avatar);
		await expect.poll(() => el.hasAttribute('data-has-icon')).toBe(true);
		expect(iconArea().hidden).toBe(false);
		avatar.remove();
		await expect.poll(() => el.hasAttribute('data-has-icon')).toBe(false);
		await waitForUpdate(el);
		expect(iconArea().hidden).toBe(true);
	});
	it('belooft geen menu als het een navigatie-submenu opent', async () => {
		el = await fixture(`
			<nldd-menu-bar-item text="Onderwerpen" expandable>
				<nldd-menu variant="navigation">
					<nldd-menu-item text="Dakisolatie" href="#dakisolatie"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-bar-item>
		`);
		await waitForUpdate(el);
		const control = el.shadowRoot!.querySelector('.menu-bar-item')!;
		expect(control.hasAttribute('aria-haspopup')).toBe(false);
		expect(control.getAttribute('aria-expanded')).toBe('false');
	});

	it('laat een compact item zonder icoon zijn tekst houden, zonder aria-label of tooltip', async () => {
		el = await fixture('<nldd-menu-bar-item text="Zoeken" content-priority="icon" compact></nldd-menu-bar-item>');
		await waitForUpdate(el);
		// Nothing to fall back on, so the text stays visible and is the name.
		expect(el.shadowRoot!.querySelector('.menu-bar-item')!.hasAttribute('aria-label')).toBe(false);
		expect(el.shadowRoot!.querySelector('nldd-tooltip')!.getAttribute('text')).toBeNull();
	});

	it('toont de tekst als tooltip zodra alleen het icoon zichtbaar is', async () => {
		el = await fixture('<nldd-menu-bar-item text="Zoeken" icon="search" content-priority="icon"></nldd-menu-bar-item>');
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip')!;
		expect(tooltip.getAttribute('text')).toBeNull();
		// The wrapper takes no box and adds no description: the control already
		// carries the text as its name, and a second copy would be read twice.
		expect(getComputedStyle(tooltip).display).toBe('contents');
		const control = el.shadowRoot!.querySelector('.menu-bar-item')!;
		expect(control.hasAttribute('aria-describedby')).toBe(false);

		el.toggleAttribute('compact', true);
		await waitForUpdate(el);
		expect(tooltip.getAttribute('text')).toBe('Zoeken');
		expect(control.hasAttribute('aria-describedby')).toBe(false);
		// Same control as before: turning compact must not replace it.
		expect(el.shadowRoot!.querySelector('nldd-tooltip')).toBe(tooltip);
	});
});
