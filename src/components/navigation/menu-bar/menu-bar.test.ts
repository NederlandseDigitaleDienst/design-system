import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, nextFrames, until } from '../../../test-utils.js';
import type { NLDDMenuBar } from './menu-bar.js';
import './menu-bar.js';

describe('nldd-menu-bar', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		document.querySelectorAll('nldd-menu').forEach(m => m.remove());
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-menu-bar></nldd-menu-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
		expect(el).toBeInstanceOf(customElements.get('nldd-menu-bar'));
	});

	it('renders slotted menu-bar-items', async () => {
		el = await fixture(`
			<nldd-menu-bar>
				<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="About"></nldd-menu-bar-item>
			</nldd-menu-bar>
		`);
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-bar-item');
		expect(items.length).toBe(2);
	});

	it('renders nav landmark', async () => {
		el = await fixture('<nldd-menu-bar accessible-label="Hoofdnavigatie"></nldd-menu-bar>');
		await waitForUpdate(el);
		const nav = el.shadowRoot!.querySelector('nav');
		expect(nav).not.toBeNull();
		expect(nav!.getAttribute('aria-label')).toBe('Hoofdnavigatie');
	});

	it('renders nav without aria-label when accessible-label is empty', async () => {
		el = await fixture('<nldd-menu-bar></nldd-menu-bar>');
		await waitForUpdate(el);
		const nav = el.shadowRoot!.querySelector('nav');
		expect(nav).not.toBeNull();
		expect(nav!.hasAttribute('aria-label')).toBe(false);
	});

	it('renders overflow button in shadow DOM', async () => {
		el = await fixture('<nldd-menu-bar></nldd-menu-bar>');
		await waitForUpdate(el);
		const overflowButton = el.shadowRoot!.querySelector('.menu-bar__overflow-button');
		expect(overflowButton).not.toBeNull();
	});

	it('uses default Dutch translation for overflow text', async () => {
		el = await fixture('<nldd-menu-bar></nldd-menu-bar>');
		await waitForUpdate(el);
		const overflowItem = el.shadowRoot!.querySelector('.menu-bar__overflow-button nldd-menu-bar-item');
		expect(overflowItem!.getAttribute('text')).toBe('Meer opties');
	});

	it('accepts custom overflow-text attribute', async () => {
		el = await fixture('<nldd-menu-bar overflow-text="More"></nldd-menu-bar>');
		await waitForUpdate(el);
		const overflowItem = el.shadowRoot!.querySelector('.menu-bar__overflow-button nldd-menu-bar-item');
		expect(overflowItem!.getAttribute('text')).toBe('More');
	});

	it('accepts custom translations', async () => {
		el = await fixture('<nldd-menu-bar></nldd-menu-bar>');
		(el as NLDDMenuBar).translations = {
			'components.menu-bar.overflow-action': 'More options',
		};
		await waitForUpdate(el);
		const overflowItem = el.shadowRoot!.querySelector('.menu-bar__overflow-button nldd-menu-bar-item');
		expect(overflowItem!.getAttribute('text')).toBe('More options');
	});

	it('toggles the overflow popover open/closed via the trigger', async () => {
		el = await fixture('<nldd-menu-bar><nldd-menu-bar-item text="A"></nldd-menu-bar-item></nldd-menu-bar>');
		await waitForUpdate(el);

		const trigger = el.shadowRoot!.querySelector(
			'.menu-bar__overflow-button nldd-menu-bar-item',
		) as HTMLElement;
		expect(trigger).not.toBeNull();

		// Explicit-toggle path (mirrors menu-bar-item._toggleMenu): open.
		(el as unknown as { _toggleOverflowMenu(): void })._toggleOverflowMenu();
		await waitForUpdate(el);
		const menu = document.querySelector('nldd-menu') as HTMLElement;
		expect(menu).not.toBeNull();
		expect(menu.matches(':popover-open')).toBe(true);
		// Anchored to the always-visible trigger, not the display-toggled wrapper.
		expect((menu as unknown as { anchorElement: Element | null }).anchorElement)
			.toBe(trigger);

		// Toggling again closes it.
		(el as unknown as { _toggleOverflowMenu(): void })._toggleOverflowMenu();
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(false);
	});

	it('goes on after Meer opties when Tab leaves its menu, and back to it with Shift+Tab', async () => {
		el = await fixture(`
			<div>
				<nldd-menu-bar>
					<nldd-menu-bar-item text="Aanvragen" href="#a"></nldd-menu-bar-item>
					<nldd-menu-bar-item text="Dossiers" href="#d"></nldd-menu-bar-item>
				</nldd-menu-bar>
				<button id="zoeken">Zoeken</button>
			</div>
		`);
		const bar = el.querySelector('nldd-menu-bar') as HTMLElement;
		await waitForUpdate(bar);
		await nextFrames();
		// What the overflow pass would do in a bar too narrow for both. It runs
		// again when the menu closes, so the second open marks them again.
		const overflow = () => {
			for (const item of bar.querySelectorAll('nldd-menu-bar-item')) {
				(item as HTMLElement).style.display = 'none';
				item.setAttribute('data-overflow', 'true');
			}
			(bar.shadowRoot!.querySelector('.menu-bar__overflow-button') as HTMLElement).style.display = 'block';
		};
		overflow();
		const trigger = bar.shadowRoot!.querySelector('.menu-bar__overflow-button nldd-menu-bar-item') as HTMLElement;
		const toggle = () => (bar as unknown as { _toggleOverflowMenu(): void })._toggleOverflowMenu();
		const tab = (target: Element, shiftKey = false) => target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, composed: true, cancelable: true }));

		toggle();
		await waitForUpdate(bar);
		const menu = (bar as unknown as { _overflowMenu: HTMLElement })._overflowMenu;
		const items = Array.from(menu.querySelectorAll(':scope > nldd-menu-item')) as HTMLElement[];
		await waitForUpdate(items[1]);
		items[1].focus();
		tab(items[1]);
		expect(menu.matches(':popover-open')).toBe(false);
		expect(document.activeElement).toBe(el.querySelector('#zoeken'));

		await new Promise(r => setTimeout(r, 150));
		await nextFrames();
		overflow();
		toggle();
		await waitForUpdate(bar);
		// The menu is filled anew each time it opens.
		const first = menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		await waitForUpdate(first);
		first.focus();
		tab(first, true);
		expect(menu.matches(':popover-open')).toBe(false);
		expect(trigger.matches(':focus-within') || bar.shadowRoot!.activeElement === trigger).toBe(true);
	});

	it('reopens after a close (reopen guard does not permanently block)', async () => {
		el = await fixture('<nldd-menu-bar><nldd-menu-bar-item text="A"></nldd-menu-bar-item></nldd-menu-bar>');
		await waitForUpdate(el);
		const toggle = () =>
			(el as unknown as { _toggleOverflowMenu(): void })._toggleOverflowMenu();

		toggle();
		await waitForUpdate(el);
		const menu = document.querySelector('nldd-menu') as HTMLElement;
		expect(menu.matches(':popover-open')).toBe(true);

		menu.hidePopover(); // simulate light-dismiss
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(false);

		// Past the guard window, the trigger can reopen it.
		await new Promise(r => setTimeout(r, 150));
		toggle();
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('renders an expandable overflowed item as a real nested submenu (not flattened)', async () => {
		el = await fixture(`
			<nldd-menu-bar>
				<nldd-menu-bar-item text="Mijn DigID" expandable>
					<nldd-menu>
						<nldd-menu-item text="Mijn gegevens"></nldd-menu-item>
						<nldd-menu-divider></nldd-menu-divider>
						<nldd-menu-item text="Uitloggen"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-bar-item>
			</nldd-menu-bar>
		`);
		await waitForUpdate(el);
		// _updateOverflow runs a frame after connect and resets display and
		// data-overflow on every item, so let that pass finish before simulating
		// the overflowed state it would have produced. Marking the item up front
		// races that reset and wins or loses on how fast the machine is.
		await nextFrames();
		const item = el.querySelector('nldd-menu-bar-item') as HTMLElement;
		item.style.display = 'none';
		item.setAttribute('data-overflow', 'true');

		(el as unknown as { _toggleOverflowMenu(): void })._toggleOverflowMenu();
		await waitForUpdate(el);
		const overflowMenu = (el as unknown as { _overflowMenu: HTMLElement })._overflowMenu;

		// The parent is a single direct menu-item (no flat divider-separated
		// siblings at the overflow root, no dead label).
		const directItems = overflowMenu.querySelectorAll(':scope > nldd-menu-item');
		expect(directItems.length).toBe(1);
		expect(overflowMenu.querySelectorAll(':scope > nldd-menu-divider').length).toBe(0);
		const parent = directItems[0] as HTMLElement & { _hasSubmenu?: boolean };
		expect(parent.getAttribute('text')).toBe('Mijn DigID');

		// It owns a real nested nldd-menu submenu with the cloned children.
		const submenu = parent.querySelector(':scope > nldd-menu') as HTMLElement;
		expect(submenu).toBeTruthy();
		expect(parent._hasSubmenu).toBe(true); // interactive opener, not a dead label
		const childTexts = [...submenu.querySelectorAll('nldd-menu-item')]
			.map(i => i.getAttribute('text'));
		expect(childTexts).toEqual(['Mijn gegevens', 'Uitloggen']);
		expect(submenu.querySelectorAll('nldd-menu-divider').length).toBe(1);
	});

	it('selecting a nested submenu leaf delegates to the original and does not jump off-screen', async () => {
		el = await fixture(`
			<nldd-menu-bar>
				<nldd-menu-bar-item text="Mijn DigID" expandable>
					<nldd-menu>
						<nldd-menu-item text="Mijn gegevens"></nldd-menu-item>
						<nldd-menu-item text="Instellingen"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-bar-item>
			</nldd-menu-bar>
		`);
		await waitForUpdate(el);
		// _updateOverflow runs a frame after connect and resets display and
		// data-overflow on every item, so let that pass finish before simulating
		// the overflowed state it would have produced. It also settles the slot
		// assignment that _toggleOverflowMenu reads synchronously.
		await nextFrames();
		const item = el.querySelector('nldd-menu-bar-item') as HTMLElement;
		item.style.display = 'none';
		item.setAttribute('data-overflow', 'true');
		(el as unknown as { _toggleOverflowMenu(): void })._toggleOverflowMenu();
		await waitForUpdate(el);

		let originalSelectFired = false;
		el.querySelector('nldd-menu-item[text="Mijn gegevens"]')!
			.addEventListener('select', () => { originalSelectFired = true; });

		const overflowMenu = (el as unknown as { _overflowMenu: HTMLElement })._overflowMenu;
		const clone = [...overflowMenu.querySelectorAll('nldd-menu-item')]
			.find(mi => mi.getAttribute('text') === 'Mijn gegevens') as HTMLElement;
		expect(clone).toBeTruthy();
		(clone.shadowRoot!.querySelector('button') as HTMLButtonElement).click();
		await waitForUpdate(el);

		// Delegation reaches the original (select bubbles to the consumer)…
		expect(originalSelectFired).toBe(true);
		// …and NO nldd-menu is left open: the popover closed on select and
		// the original hidden expandable parent's own submenu did NOT open
		// against a 0-rect anchor (the off-screen bug).
		const anyOpen = [...document.querySelectorAll('nldd-menu')]
			.some(m => m.matches(':popover-open'));
		expect(anyOpen).toBe(false);
	});
});

describe('nldd-menu-bar – compact propagation', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		document.querySelectorAll('nldd-menu').forEach(m => m.remove());
	});

	it('propagates compact attribute to slotted items', async () => {
		el = await fixture(`
			<nldd-menu-bar compact>
				<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="About"></nldd-menu-bar-item>
			</nldd-menu-bar>
		`);
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-bar-item');
		expect(items[0].hasAttribute('compact')).toBe(true);
		expect(items[1].hasAttribute('compact')).toBe(true);
	});

	it('removes compact attribute from items when compact is removed', async () => {
		el = await fixture(`
			<nldd-menu-bar compact>
				<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>
			</nldd-menu-bar>
		`);
		await waitForUpdate(el);
		expect(el.querySelector('nldd-menu-bar-item')!.hasAttribute('compact')).toBe(true);

		(el as NLDDMenuBar).compact = false;
		await waitForUpdate(el);
		expect(el.querySelector('nldd-menu-bar-item')!.hasAttribute('compact')).toBe(false);
	});
});

describe('nldd-menu-bar – overflow detection', () => {
	// Visual regression via Storybook stories: Menu Bar > NarrowContainer, ManyItems.
	// See also Top Navigation Bar > ManyGlobalItems and SmallViewport.
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		document.querySelectorAll('nldd-menu').forEach(m => m.remove());
		vi.restoreAllMocks();
	});

	it('hides items that overflow and shows overflow button', async () => {
		el = await fixture(`
			<nldd-menu-bar>
				<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="About"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Contact"></nldd-menu-bar-item>
			</nldd-menu-bar>
		`);
		await waitForUpdate(el);

		// Mock layout: container 200px, each item 100px, overflow button 44px
		vi.spyOn(el, 'clientWidth', 'get').mockReturnValue(200);
		const items = el.querySelectorAll('nldd-menu-bar-item');
		items.forEach(item => {
			vi.spyOn(item, 'offsetWidth', 'get').mockReturnValue(100);
		});
		const overflowButton = el.shadowRoot!.querySelector('.menu-bar__overflow-button') as HTMLElement;
		vi.spyOn(overflowButton, 'offsetWidth', 'get').mockReturnValue(44);

		// Call _updateOverflow directly to bypass RAF timing
		(el as any)._updateOverflow();

		// First item fits (100 < 200-44=156), second doesn't (200 > 156)
		expect(items[0].style.display).not.toBe('none');
		expect(items[1].hasAttribute('data-overflow')).toBe(true);
		expect(items[2].hasAttribute('data-overflow')).toBe(true);
		expect(overflowButton.style.display).toBe('inline-block');
	});

	it('keeps an overflowed link a link, with aria-current on the current page', async () => {
		el = await fixture(`
			<nldd-menu-bar>
				<nldd-menu-bar-item text="Home" href="/home"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="About" href="/about" current></nldd-menu-bar-item>
			</nldd-menu-bar>
		`);
		await waitForUpdate(el);
		await nextFrames();
		const items = el.querySelectorAll<HTMLElement>('nldd-menu-bar-item');
		items.forEach(item => {
			item.style.display = 'none';
			item.setAttribute('data-overflow', 'true');
		});
		(el as any)._toggleOverflowMenu();
		await waitForUpdate(el);

		const menuItems = (el as any)._overflowMenu.querySelectorAll('nldd-menu-item') as NodeListOf<HTMLElement>;
		expect(menuItems.length).toBe(2);
		await waitForUpdate(menuItems[1]);
		const home = menuItems[0].shadowRoot!.querySelector('a')!;
		const about = menuItems[1].shadowRoot!.querySelector('a')!;
		expect(home.getAttribute('href')).toBe('/home');
		expect(home.hasAttribute('aria-current')).toBe(false);
		expect(about.getAttribute('aria-current')).toBe('page');

		// The original hears the click with its modifier keys, so a router that
		// leaves a Cmd-click to the browser can tell.
		let heard: MouseEvent | null = null;
		items[0].addEventListener('click', e => { heard = e as MouseEvent; });
		home.addEventListener('click', e => e.preventDefault(), { once: true });
		home.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, metaKey: true }));
		expect(heard!.metaKey).toBe(true);

		// A router on the original item can still cancel the navigation.
		items[1].addEventListener('click', e => e.preventDefault());
		const click = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
		about.dispatchEvent(click);
		expect(click.defaultPrevented).toBe(true);
	});

	it('hides all items when none fit', async () => {
		el = await fixture(`
			<nldd-menu-bar>
				<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="About"></nldd-menu-bar-item>
			</nldd-menu-bar>
		`);
		await waitForUpdate(el);

		// Mock layout: container 80px, each item 100px, overflow button 44px
		// Available: 80 - 44 = 36px, first item (100px) doesn't fit
		vi.spyOn(el, 'clientWidth', 'get').mockReturnValue(80);
		const items = el.querySelectorAll('nldd-menu-bar-item');
		items.forEach(item => {
			vi.spyOn(item, 'offsetWidth', 'get').mockReturnValue(100);
		});
		const overflowButton = el.shadowRoot!.querySelector('.menu-bar__overflow-button') as HTMLElement;
		vi.spyOn(overflowButton, 'offsetWidth', 'get').mockReturnValue(44);

		(el as any)._updateOverflow();

		expect(items[0].hasAttribute('data-overflow')).toBe(true);
		expect(items[1].hasAttribute('data-overflow')).toBe(true);
		expect(overflowButton.style.display).toBe('inline-block');
	});

	it('hides overflow button when all items fit', async () => {
		el = await fixture(`
			<nldd-menu-bar>
				<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="About"></nldd-menu-bar-item>
			</nldd-menu-bar>
		`);
		await waitForUpdate(el);

		// Mock layout: container 500px, each item 100px, overflow button 44px
		vi.spyOn(el, 'clientWidth', 'get').mockReturnValue(500);
		const items = el.querySelectorAll('nldd-menu-bar-item');
		items.forEach(item => {
			vi.spyOn(item, 'offsetWidth', 'get').mockReturnValue(100);
		});
		const overflowButton = el.shadowRoot!.querySelector('.menu-bar__overflow-button') as HTMLElement;
		vi.spyOn(overflowButton, 'offsetWidth', 'get').mockReturnValue(44);

		(el as any)._updateOverflow();

		expect(items[0].hasAttribute('data-overflow')).toBe(false);
		expect(items[1].hasAttribute('data-overflow')).toBe(false);
		expect(overflowButton.style.display).toBe('none');
	});
});


describe('nldd-menu-bar – overflow detection with real layout', () => {
	// The block above mocks clientWidth and offsetWidth and calls _updateOverflow
	// directly, so it covers the arithmetic. These run the whole path instead —
	// the ResizeObserver, the frame it schedules and real measurements — and
	// assert the contract rather than pixel values, so the item's padding or
	// font can change without touching the test.
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		document.querySelectorAll('nldd-menu').forEach(m => m.remove());
	});

	const markup = (width: number) => `
		<nldd-menu-bar style="width: ${width}px;">
			<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="About"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Contact"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Support"></nldd-menu-bar-item>
		</nldd-menu-bar>
	`;

	const itemsOf = () => [...el.querySelectorAll('nldd-menu-bar-item')] as HTMLElement[];
	const buttonOf = () =>
		el.shadowRoot!.querySelector('.menu-bar__overflow-button') as HTMLElement;
	const overflowed = () => itemsOf().map(item => item.hasAttribute('data-overflow'));

	/** Render wide enough for everything, then narrow until items drop off. */
	async function narrowUntilOverflow(): Promise<void> {
		el = await fixture(markup(2000));
		await waitForUpdate(el);
		await until(() => buttonOf().style.display === 'none');
		// Half of what the items need together forces a cutoff wherever their
		// own width happens to put it, so no measurement is hard-coded.
		const total = itemsOf().reduce((sum, item) => sum + item.offsetWidth, 0);
		el.style.width = `${Math.round(total / 2)}px`;
		await until(() => overflowed().some(Boolean));
	}

	it('leaves every item in place when they all fit', async () => {
		el = await fixture(markup(2000));
		await waitForUpdate(el);
		await until(() => buttonOf().style.display === 'none');

		expect(overflowed()).toEqual([false, false, false, false]);
		expect(itemsOf().every(item => item.style.display !== 'none')).toBe(true);
		expect(buttonOf().style.display).toBe('none');
	});

	it('hides the items that no longer fit once the container narrows', async () => {
		await narrowUntilOverflow();

		const hidden = overflowed();
		expect(hidden.some(Boolean)).toBe(true);
		expect(buttonOf().style.display).toBe('inline-block');
		// The hidden ones are the last ones: nothing visible sits after a hidden item.
		expect(hidden.indexOf(true)).toBe(hidden.lastIndexOf(false) + 1);
		// display and the attribute say the same thing about every item.
		itemsOf().forEach((item, i) => {
			expect(item.style.display === 'none').toBe(hidden[i]);
		});
	});

	it('puts the items back when the container grows again', async () => {
		await narrowUntilOverflow();

		el.style.width = '2000px';
		await until(() => !overflowed().some(Boolean));

		expect(itemsOf().every(item => item.style.display !== 'none')).toBe(true);
		expect(buttonOf().style.display).toBe('none');
	});

	it('defers the recalc while the overflow menu is open, and flushes it on close', async () => {
		await narrowUntilOverflow();

		(el as unknown as { _toggleOverflowMenu(): void })._toggleOverflowMenu();
		await waitForUpdate(el);
		const menu = document.querySelector('nldd-menu') as HTMLElement;
		await until(() => menu.matches(':popover-open'));

		// Widening would normally put the items back. While the menu is open it
		// must not: nldd-menu is anchored to the trigger inside the overflow
		// button, and relaying out underneath it sends the menu off-screen.
		const before = itemsOf().map(item => item.style.display);
		el.style.width = '2000px';
		await nextFrames();
		await nextFrames();
		expect(itemsOf().map(item => item.style.display)).toEqual(before);

		menu.hidePopover();
		await until(() => !overflowed().some(Boolean));
		expect(itemsOf().every(item => item.style.display !== 'none')).toBe(true);
	});
});
