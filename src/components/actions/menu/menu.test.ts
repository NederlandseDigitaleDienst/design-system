import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, installUniversalReset } from '../../../test-utils.js';
import './menu.js';
import '../button/button.js';

function getButton(el: Element): HTMLElement {
	return el.shadowRoot?.querySelector('button') as HTMLElement;
}

describe('nldd-menu', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-menu></nldd-menu>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders slotted menu items', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Item 1"></nldd-menu-item>
				<nldd-menu-item text="Item 2"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		expect(el.querySelectorAll('nldd-menu-item').length).toBe(2);
	});

	it('renders slotted divider', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Item 1"></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item text="Item 2"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		expect(el.querySelector('nldd-menu-divider')).not.toBeNull();
	});

	it('wraps around at bottom with ArrowDown', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Item 1"></nldd-menu-item>
				<nldd-menu-item text="Item 2"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-item');
		const spy = vi.spyOn(getButton(items[0]), 'focus');
		getButton(items[items.length - 1]).focus();
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		expect(spy).toHaveBeenCalled();
	});

	it('wraps around at top with ArrowUp', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Item 1"></nldd-menu-item>
				<nldd-menu-item text="Item 2"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-item');
		const spy = vi.spyOn(getButton(items[items.length - 1]), 'focus');
		getButton(items[0]).focus();
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
		expect(spy).toHaveBeenCalled();
	});

	it('focuses first item with ArrowDown when nothing focused', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Item 1"></nldd-menu-item>
				<nldd-menu-item text="Item 2"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-item');
		const spy = vi.spyOn(getButton(items[0]), 'focus');
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		expect(spy).toHaveBeenCalled();
	});

	it('focuses last item with ArrowUp when nothing focused', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Item 1"></nldd-menu-item>
				<nldd-menu-item text="Item 2"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-item');
		const spy = vi.spyOn(getButton(items[items.length - 1]), 'focus');
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
		expect(spy).toHaveBeenCalled();
	});

	it('focuses first item with Home', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Item 1"></nldd-menu-item>
				<nldd-menu-item text="Item 2"></nldd-menu-item>
				<nldd-menu-item text="Item 3"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-item');
		const spy = vi.spyOn(getButton(items[0]), 'focus');
		getButton(items[items.length - 1]).focus();
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
		expect(spy).toHaveBeenCalled();
	});

	it('focuses last item with End', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Item 1"></nldd-menu-item>
				<nldd-menu-item text="Item 2"></nldd-menu-item>
				<nldd-menu-item text="Item 3"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-item');
		const spy = vi.spyOn(getButton(items[items.length - 1]), 'focus');
		getButton(items[0]).focus();
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		expect(spy).toHaveBeenCalled();
	});

	it('pins --_width, --_min-width and --_max-width to an explicit width, and clears all three when unset', async () => {
		el = await fixture('<nldd-menu width="320px"><nldd-menu-item text="Item"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_width')).toBe('320px');
		expect(el.style.getPropertyValue('--_min-width')).toBe('320px');
		expect(el.style.getPropertyValue('--_max-width')).toBe('320px');
		(el as unknown as { width: string }).width = '';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_width')).toBe('');
		expect(el.style.getPropertyValue('--_min-width')).toBe('');
		expect(el.style.getPropertyValue('--_max-width')).toBe('');
	});
});

describe('nldd-menu-item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-menu-item></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('reflects text attribute', async () => {
		el = await fixture('<nldd-menu-item text="Bewerk"></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('text')).toBe('Bewerk');
	});

	it('renders an icon-cell when the icon attribute is set', async () => {
		el = await fixture('<nldd-menu-item text="Save" icon="file"></nldd-menu-item>');
		await waitForUpdate(el);
		// Target the content icon by its value, so this stays unambiguous even if
		// the item later also renders a check icon-cell (checkbox/radio types).
		const iconCell = el.shadowRoot!.querySelector('nldd-icon-cell[icon="file"]');
		expect(iconCell).not.toBeNull();
	});

	it('does not render an icon-cell when the icon attribute is missing', async () => {
		el = await fixture('<nldd-menu-item text="Save"></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-cell')).toBeNull();
	});

	it('reflects details attribute', async () => {
		el = await fixture('<nldd-menu-item details="Cmd+S"></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('details')).toBe('Cmd+S');
	});

	it('defaults type to button', async () => {
		el = await fixture('<nldd-menu-item></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('type')).toBe('button');
	});

	it('reflects type checkbox', async () => {
		el = await fixture('<nldd-menu-item type="checkbox"></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('type')).toBe('checkbox');
	});

	it('reflects type radio', async () => {
		el = await fixture('<nldd-menu-item type="radio"></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('type')).toBe('radio');
	});

	it('defaults selected to false', async () => {
		el = await fixture('<nldd-menu-item></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.hasAttribute('selected')).toBe(false);
	});

	it('reflects selected attribute', async () => {
		el = await fixture('<nldd-menu-item type="checkbox" selected></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.hasAttribute('selected')).toBe(true);
	});

	it('defaults disabled to false', async () => {
		el = await fixture('<nldd-menu-item></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.hasAttribute('disabled')).toBe(false);
	});

	it('reflects disabled attribute', async () => {
		el = await fixture('<nldd-menu-item disabled></nldd-menu-item>');
		await waitForUpdate(el);
		expect(el.hasAttribute('disabled')).toBe(true);
	});

	it('dispatches select event on click', async () => {
		el = await fixture('<nldd-menu-item text="Item"></nldd-menu-item>');
		await waitForUpdate(el);
		let fired = false;
		el.addEventListener('select', () => { fired = true; });
		getButton(el)?.click();
		expect(fired).toBe(true);
	});

	it('does not dispatch select when disabled', async () => {
		el = await fixture('<nldd-menu-item text="Item" disabled></nldd-menu-item>');
		await waitForUpdate(el);
		let fired = false;
		el.addEventListener('select', () => { fired = true; });
		getButton(el)?.click();
		expect(fired).toBe(false);
	});

	// A menu role promises there is a menu around you. An item on its own cannot
	// make that true, so it stays a plain button until a menu claims it. The
	// overflow declaration inside an nldd-toolbar-item is exactly such an item.
	it('carries no menu role until a menu claims it', async () => {
		el = await fixture('<nldd-menu-item text="Item"></nldd-menu-item>');
		await waitForUpdate(el);
		expect(getButton(el).hasAttribute('role')).toBe(false);
	});

	it('renders role menuitem for default type inside a menu', async () => {
		el = await fixture('<nldd-menu open><nldd-menu-item text="Item"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const item = el.querySelector('nldd-menu-item') as HTMLElement;
		await waitForUpdate(item);
		expect(getButton(item).getAttribute('role')).toBe('menuitem');
	});

	it('renders role menuitemcheckbox for type checkbox inside a menu', async () => {
		el = await fixture('<nldd-menu open><nldd-menu-item type="checkbox" text="Item"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const item = el.querySelector('nldd-menu-item') as HTMLElement;
		await waitForUpdate(item);
		expect(getButton(item).getAttribute('role')).toBe('menuitemcheckbox');
	});

	it('renders role menuitemradio for type radio inside a menu', async () => {
		el = await fixture('<nldd-menu open><nldd-menu-item type="radio" text="Item"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const item = el.querySelector('nldd-menu-item') as HTMLElement;
		await waitForUpdate(item);
		expect(getButton(item).getAttribute('role')).toBe('menuitemradio');
	});

	it('sets aria-checked for checkbox type inside a menu', async () => {
		el = await fixture('<nldd-menu open><nldd-menu-item type="checkbox" selected text="Item"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const item = el.querySelector('nldd-menu-item') as HTMLElement;
		await waitForUpdate(item);
		expect(getButton(item).getAttribute('aria-checked')).toBe('true');
	});

	it('leaves aria-checked off an unclaimed checkbox item', async () => {
		el = await fixture('<nldd-menu-item type="checkbox" selected text="Item"></nldd-menu-item>');
		await waitForUpdate(el);
		expect(getButton(el).hasAttribute('aria-checked')).toBe(false);
	});

	it('does not set aria-checked for default type', async () => {
		el = await fixture('<nldd-menu-item text="Item"></nldd-menu-item>');
		await waitForUpdate(el);
		expect(getButton(el).getAttribute('aria-checked')).toBeNull();
	});
});

describe('nldd-menu-item href (link items)', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const action = (item: Element): HTMLElement => item.shadowRoot?.querySelector('.menu__item') as HTMLElement;

	it('renders a button item with an href as an anchor link', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="Profiel" href="/profiel"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const item = el.querySelector('nldd-menu-item')!;
		const a = action(item);
		expect(a.tagName).toBe('A');
		expect(a.getAttribute('href')).toBe('/profiel');
		expect(a.getAttribute('role')).toBe('menuitem');
		expect(item.shadowRoot!.querySelector('button.menu__item')).toBeNull();
		expect(a.querySelector('nldd-text-cell')?.getAttribute('text')).toBe('Profiel');
	});

	it('sets aria-current="page" on a selected link item', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="Home" href="/" selected></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		expect(action(el.querySelector('nldd-menu-item')!).getAttribute('aria-current')).toBe('page');
	});

	it('ignores href for checkbox and radio items (stays a button)', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="A" type="checkbox" href="/a"></nldd-menu-item>
				<nldd-menu-item text="B" type="radio" href="/b"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-item');
		expect(action(items[0]).tagName).toBe('BUTTON');
		expect(action(items[1]).tagName).toBe('BUTTON');
	});

	it('ignores href on a submenu opener (stays a button)', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Parent" href="/parent">
					<nldd-menu>
						<nldd-menu-item text="Child"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const parent = el.querySelector('nldd-menu-item')!;
		await (parent as { updateComplete?: Promise<unknown> }).updateComplete;
		expect(action(parent).tagName).toBe('BUTTON');
	});

	it('renders a disabled href item as a disabled button, not a link', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="X" href="/x" disabled></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const a = action(el.querySelector('nldd-menu-item')!);
		expect(a.tagName).toBe('BUTTON');
		expect(a.hasAttribute('disabled')).toBe(true);
	});

	it('sanitizes a dangerous href: a javascript: URL falls back to a button with no link', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="X" href="javascript:alert(1)"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const item = el.querySelector('nldd-menu-item')!;
		// Blocked protocol → no anchor renders, so the payload never reaches an href.
		expect(item.shadowRoot!.querySelector('a.menu__item')).toBeNull();
		expect(action(item).tagName).toBe('BUTTON');
		expect(item.shadowRoot!.querySelector('[href]')).toBeNull();
	});

	it('fires select when a link item is activated', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="Profiel" href="#profiel"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const item = el.querySelector('nldd-menu-item')!;
		let fired = false;
		item.addEventListener('select', () => { fired = true; });
		const a = action(item);
		a.addEventListener('click', e => e.preventDefault(), { once: true }); // keep the test from navigating
		a.click();
		expect(fired).toBe(true);
	});
});

describe('nldd-menu-item shortcut (display only)', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const shortcutEl = (item: Element) => item.shadowRoot?.querySelector('nldd-keyboard-shortcut');

	it('renders a keyboard-shortcut hint when shortcut is set', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="Bewerk" shortcut="Cmd+E"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const ks = shortcutEl(el.querySelector('nldd-menu-item')!);
		expect(ks).not.toBeNull();
		expect(ks!.getAttribute('keys')).toBe('Cmd+E');
	});

	it('passes per-OS overrides through to the hint', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="Opslaan" shortcut="Ctrl+S" shortcut-mac="Cmd+S"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const ks = shortcutEl(el.querySelector('nldd-menu-item')!)!;
		expect(ks.getAttribute('keys')).toBe('Ctrl+S');
		expect(ks.getAttribute('mac-keys')).toBe('Cmd+S');
	});

	it('renders no hint without a shortcut', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="Plain"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		expect(shortcutEl(el.querySelector('nldd-menu-item')!)).toBeNull();
	});

	it('shows the hint on a link item as well', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="Zoek" href="#zoek" shortcut="Cmd+F"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const item = el.querySelector('nldd-menu-item')!;
		expect(item.shadowRoot!.querySelector('a.menu__item')).not.toBeNull();
		expect(shortcutEl(item)!.getAttribute('keys')).toBe('Cmd+F');
	});
});

describe('nldd-menu filter', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('sets query attribute on matching items and clears on non-matching', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Aardappelen"></nldd-menu-item>
				<nldd-menu-item text="Broccoli"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		(el as unknown as { filter(q: string): void }).filter('aa');
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-item');
		expect(items[0].getAttribute('query')).toBe('aa');
		expect(items[0].hasAttribute('hidden')).toBe(false);
		expect(items[1].hasAttribute('hidden')).toBe(true);
		expect((items[1] as unknown as { query: string }).query).toBe('');
		expect(items[1].hasAttribute('query')).toBe(false);
	});

	it('clears all queries when query is empty', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Aardappelen"></nldd-menu-item>
				<nldd-menu-item text="Broccoli"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const menu = el as unknown as { filter(q: string): void };
		menu.filter('aa');
		await waitForUpdate(el);
		menu.filter('');
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-item');
		items.forEach(i => {
			expect(i.getAttribute('query') ?? '').toBe('');
			expect(i.hasAttribute('hidden')).toBe(false);
		});
	});

	// For a list a server already filtered: hiding what does not contain the
	// typed text would throw away a match the server made on something else.
	it('hides nothing with hide: false, and still marks the query', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Aardappelen"></nldd-menu-item>
				<nldd-menu-item text="Broccoli"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		(el as unknown as { filter(q: string, o: { hide: boolean }): void }).filter('aa', { hide: false });
		await waitForUpdate(el);
		const items = el.querySelectorAll('nldd-menu-item');
		items.forEach(i => expect(i.hasAttribute('hidden')).toBe(false));
		expect(items[0].getAttribute('query')).toBe('aa');
	});
});

describe('nldd-menu empty state', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders default nldd-inline-dialog with i18n text when no items', async () => {
		el = await fixture('<nldd-menu></nldd-menu>');
		await waitForUpdate(el);
		const dialog = el.shadowRoot!.querySelector('nldd-inline-dialog');
		expect(dialog).not.toBeNull();
		expect(dialog!.getAttribute('text')).toBe('Geen opties beschikbaar');
	});

	it('empty-text attribute overrides the i18n default', async () => {
		el = await fixture('<nldd-menu empty-text="Niets gevonden"></nldd-menu>');
		await waitForUpdate(el);
		const dialog = el.shadowRoot!.querySelector('nldd-inline-dialog');
		expect(dialog!.getAttribute('text')).toBe('Niets gevonden');
	});

	it('empty-supporting-text populates the inline-dialog', async () => {
		el = await fixture('<nldd-menu empty-supporting-text="Probeer iets anders."></nldd-menu>');
		await waitForUpdate(el);
		const dialog = el.shadowRoot!.querySelector('nldd-inline-dialog');
		expect(dialog!.getAttribute('supporting-text')).toBe('Probeer iets anders.');
	});

	it('slotted content replaces the default dialog', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-inline-dialog slot="empty" text="Custom"></nldd-inline-dialog>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="empty"]')!;
		const assigned = slot.assignedElements();
		expect(assigned.length).toBe(1);
		expect(assigned[0].getAttribute('text')).toBe('Custom');
	});

	it('does not render empty container when items are present', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Item"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.menu__empty')).toBeNull();
	});

	it('is not empty when every item is present but disabled', async () => {
		// Regression: a menu whose items are all disabled still shows them (grayed),
		// so it must not fall back to the "no options" empty state. Emptiness counts
		// shown items, not navigable ones: disabled items are skipped for keyboard
		// nav but are still on screen. (A toolbar overflow of disabled controls hit
		// this once the clones started propagating disabled state correctly.)
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Inspringen vergroten" disabled></nldd-menu-item>
				<nldd-menu-item text="Inspringen verkleinen" disabled></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.menu__empty')).toBeNull();
	});

	it('keeps role="menu" static on the item list, with the empty-state outside it', async () => {
		// role="menu" lives on .menu__list (which only owns menu-items) and stays
		// present even when empty — the empty-state is a sibling in .menu__main,
		// outside the role, so ARIA's required-children rule is never violated and
		// the role no longer has to be dropped.
		el = await fixture('<nldd-menu></nldd-menu>');
		await waitForUpdate(el);
		const sr = el.shadowRoot!;
		expect(sr.querySelector('.menu')!.hasAttribute('role')).toBe(false); // the frame carries no role
		expect(sr.querySelector('.menu__list')!.getAttribute('role')).toBe('menu'); // present even when empty
		expect(sr.querySelector('.menu__empty')!.closest('[role="menu"]')).toBeNull(); // empty-state is outside the role
	});
});

describe('nldd-menu header / footer slots', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const withHeaderFooter = `
		<nldd-menu>
			<div slot="header"><span>Anouk</span></div>
			<nldd-menu-item text="Profiel"></nldd-menu-item>
			<nldd-menu-item text="Instellingen"></nldd-menu-item>
			<button slot="footer" class="signout">Uitloggen</button>
		</nldd-menu>
	`;

	it('renders header/footer content outside role="menu"', async () => {
		el = await fixture(withHeaderFooter);
		await waitForUpdate(el);
		const sr = el.shadowRoot!;
		const header = sr.querySelector('.menu__header')!;
		const footer = sr.querySelector('.menu__footer')!;
		expect(header.hasAttribute('hidden')).toBe(false);
		expect(footer.hasAttribute('hidden')).toBe(false);
		// Neither region sits inside the item list's role="menu".
		expect(header.closest('[role="menu"]')).toBeNull();
		expect(footer.closest('[role="menu"]')).toBeNull();
		// The role="menu" list owns only the menu-items.
		const listItems = sr.querySelector('.menu__list slot') as HTMLSlotElement;
		expect(listItems.assignedElements().every((e) => e.tagName.toLowerCase() === 'nldd-menu-item')).toBe(true);
	});

	it('collapses the header/footer region when the slot is empty', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="X"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const sr = el.shadowRoot!;
		expect(sr.querySelector('.menu__header')!.hasAttribute('hidden')).toBe(true);
		expect(sr.querySelector('.menu__footer')!.hasAttribute('hidden')).toBe(true);
	});

	it('arrow navigation targets menu-items only, skipping the header/footer', async () => {
		el = await fixture(withHeaderFooter);
		await waitForUpdate(el);
		const firstItemButton = getButton(el.querySelector('nldd-menu-item')!);
		const spy = vi.spyOn(firstItemButton, 'focus');
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		// The first ArrowDown lands on the first menu-item, never the header content.
		expect(spy).toHaveBeenCalled();
	});

	it('keeps footer controls and items in the tab order (no roving tabindex)', async () => {
		el = await fixture(withHeaderFooter);
		await waitForUpdate(el);
		const signout = el.querySelector('.signout') as HTMLButtonElement;
		const itemButton = getButton(el.querySelector('nldd-menu-item')!);
		// The menu uses ordinary focusables (not roving tabindex=-1), so a footer
		// button and the menu-items are all Tab-reachable in DOM order.
		expect(signout.tabIndex).toBe(0);
		expect(itemButton.tabIndex).toBe(0);
	});

	it('does not render header/footer for a submenu (root-only)', async () => {
		el = await fixture(`
			<nldd-menu>
				<div slot="header"><span>Header</span></div>
				<nldd-menu-item text="X"></nldd-menu-item>
				<button slot="footer">Footer</button>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		// As the root it renders both regions.
		expect(el.shadowRoot!.querySelector('.menu__header')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.menu__footer')).not.toBeNull();
		// Force it into the "is a submenu" state the open flow sets (_parentItem is
		// reactive @state, so it re-renders), then the root-only regions drop out.
		const menu = el as unknown as { _parentMenu: unknown; _parentItem: unknown; updateComplete: Promise<unknown> };
		menu._parentMenu = document.createElement('nldd-menu');
		menu._parentItem = document.createElement('nldd-menu-item');
		await menu.updateComplete;
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.menu__header')).toBeNull();
		expect(el.shadowRoot!.querySelector('.menu__footer')).toBeNull();
	});

	it('suppresses a first group\'s top divider even though a header makes it not :first-child', async () => {
		el = await fixture(`
			<nldd-menu>
				<div slot="header"><strong>Header</strong></div>
				<nldd-menu-group text="Thema">
					<nldd-menu-item text="Systeem"></nldd-menu-item>
				</nldd-menu-group>
				<nldd-menu-item text="Log uit"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		(el as unknown as { filter(q: string): void }).filter(''); // runs _updateDividerVisibility
		await waitForUpdate(el);
		const group = el.querySelector('nldd-menu-group')!;
		expect(el.firstElementChild).not.toBe(group); // the header div is the first light-DOM child
		expect(group.hasAttribute('data-no-top-divider')).toBe(true); // still treated as the first item
	});

	it('keeps a group top divider when items precede it (with a header)', async () => {
		el = await fixture(`
			<nldd-menu>
				<div slot="header"><strong>Header</strong></div>
				<nldd-menu-item text="Profiel"></nldd-menu-item>
				<nldd-menu-group text="Thema">
					<nldd-menu-item text="Systeem"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		(el as unknown as { filter(q: string): void }).filter('');
		await waitForUpdate(el);
		expect(el.querySelector('nldd-menu-group')!.hasAttribute('data-no-top-divider')).toBe(false);
	});
});

describe('nldd-menu-divider', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-menu-divider></nldd-menu-divider>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});
});

describe('nldd-menu-group', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-menu-group text="Bestand"></nldd-menu-group>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders the text in the title element', async () => {
		el = await fixture('<nldd-menu-group text="Bestand"></nldd-menu-group>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.menu__group-title');
		expect(title?.textContent).toBe('Bestand');
	});

	it('wraps slotted items in a role="group" container labeled by the title', async () => {
		el = await fixture(`
			<nldd-menu-group text="Bestand">
				<nldd-menu-item text="Open"></nldd-menu-item>
			</nldd-menu-group>
		`);
		await waitForUpdate(el);
		const groupContainer = el.shadowRoot!.querySelector('[role="group"]');
		const title = el.shadowRoot!.querySelector('.menu__group-title');
		expect(groupContainer).not.toBeNull();
		expect(title?.id).toBeTruthy();
		expect(groupContainer?.getAttribute('aria-labelledby')).toBe(title!.id);
	});

	it('hides the title from AT to prevent double-announcement', async () => {
		// The title doubles as the group's accessible name via aria-labelledby.
		// aria-hidden still allows label references to read its text content,
		// so the group label survives while standalone announcement does not.
		el = await fixture('<nldd-menu-group text="Bestand"></nldd-menu-group>');
		await waitForUpdate(el);
		const title = el.shadowRoot!.querySelector('.menu__group-title');
		expect(title?.getAttribute('aria-hidden')).toBe('true');
	});

	it('hides itself when all its items are filtered out', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-group text="Bestand">
					<nldd-menu-item text="Open"></nldd-menu-item>
					<nldd-menu-item text="Save"></nldd-menu-item>
				</nldd-menu-group>
				<nldd-menu-group text="Bewerken">
					<nldd-menu-item text="Knip"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const [groupA, groupB] = el.querySelectorAll('nldd-menu-group');
		(el as unknown as { filter: (q: string) => void }).filter('knip');
		await waitForUpdate(el);
		expect(groupA.hasAttribute('hidden')).toBe(true);
		expect(groupB.hasAttribute('hidden')).toBe(false);
	});

	it('shows empty groups again when filter is cleared', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-group text="Bestand">
					<nldd-menu-item text="Open"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const group = el.querySelector('nldd-menu-group')!;
		(el as unknown as { filter: (q: string) => void }).filter('xx');
		await waitForUpdate(el);
		expect(group.hasAttribute('hidden')).toBe(true);
		(el as unknown as { filter: (q: string) => void }).filter('');
		await waitForUpdate(el);
		expect(group.hasAttribute('hidden')).toBe(false);
	});

	it('hides an explicit divider that sits directly before a group', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Recent"></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-group text="Mappen">
					<nldd-menu-item text="Documenten"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const divider = el.querySelector('nldd-menu-divider')!;
		// filter() calls _updateDividerVisibility as part of its post-update
		// pass. An empty query runs the visibility logic without actually
		// hiding any items, so we can assert the group→divider suppression
		// path directly (a divider sitting immediately above a group is
		// hidden because the group already renders its own auto-divider).
		(el as unknown as { filter: (q: string) => void }).filter('');
		await waitForUpdate(el);
		expect(divider.hasAttribute('hidden')).toBe(true);
	});
});

describe('nldd-menu-item with submenu', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('detects a child nldd-menu as a submenu', async () => {
		el = await fixture(`
			<nldd-menu-item text="Bestand">
				<nldd-menu>
					<nldd-menu-item text="Open"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-item>
		`);
		await waitForUpdate(el);
		expect((el as unknown as { _hasSubmenu: boolean })._hasSubmenu).toBe(true);
	});

	it('renders aria-haspopup="menu" on the inner button when a submenu is present', async () => {
		el = await fixture(`
			<nldd-menu-item text="Bestand">
				<nldd-menu>
					<nldd-menu-item text="Open"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-item>
		`);
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button')!;
		expect(button.getAttribute('aria-haspopup')).toBe('menu');
		expect(button.getAttribute('aria-expanded')).toBe('false');
	});

	it('does not render aria-haspopup when no submenu is present', async () => {
		el = await fixture('<nldd-menu-item text="Plain"></nldd-menu-item>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button')!;
		expect(button.hasAttribute('aria-haspopup')).toBe(false);
	});

	it('renders a chevron-right indicator when a submenu is present', async () => {
		el = await fixture(`
			<nldd-menu-item text="Bestand">
				<nldd-menu>
					<nldd-menu-item text="Open"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-item>
		`);
		await waitForUpdate(el);
		const indicator = el.shadowRoot!.querySelector('nldd-icon-cell[icon="chevron-right"]');
		expect(indicator).not.toBeNull();
	});

	it('dispatches submenu-open instead of select when clicked', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const item = el.querySelector(':scope > nldd-menu-item') as HTMLElement;
		let selectFired = false;
		let submenuOpenFired = false;
		el.addEventListener('select', () => { selectFired = true; });
		el.addEventListener('submenu-open', () => { submenuOpenFired = true; });
		item.shadowRoot!.querySelector('button')!.click();
		expect(submenuOpenFired).toBe(true);
		expect(selectFired).toBe(false);
	});

	it('marks the item as expanded while its submenu is open', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const item = el.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const button = item.shadowRoot!.querySelector('button')!;
		// Trigger submenu-open via click; the parent menu's listener wires it up.
		button.click();
		await waitForUpdate(item);
		expect(button.getAttribute('aria-expanded')).toBe('true');
	});

	it('ArrowRight on a focused item-with-submenu opens its submenu', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const item = el.querySelector(':scope > nldd-menu-item') as HTMLElement;
		// _getFocusedIndex looks for the data-focused attribute, normally set
		// by the menu-item's focusin handler. Test env focus() is unreliable
		// at firing focusin synchronously — set it directly.
		item.setAttribute('data-focused', '');
		let opened = false;
		el.addEventListener('submenu-open', () => { opened = true; });
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		await waitForUpdate(el);
		expect(opened).toBe(true);
	});

	it('ArrowRight on a focused item without a submenu is a no-op', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Plain"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const item = el.querySelector(':scope > nldd-menu-item') as HTMLElement;
		item.setAttribute('data-focused', '');
		let opened = false;
		el.addEventListener('submenu-open', () => { opened = true; });
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		await waitForUpdate(el);
		expect(opened).toBe(false);
	});

	it('renders aria-controls on the opener pointing at its submenu id', async () => {
		el = await fixture(`
			<nldd-menu-item text="Bestand">
				<nldd-menu id="explicit-submenu-id">
					<nldd-menu-item text="Open"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-item>
		`);
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button')!;
		expect(button.getAttribute('aria-controls')).toBe('explicit-submenu-id');
	});

	it('auto-generates an id on a submenu when none is set so aria-controls works', async () => {
		el = await fixture(`
			<nldd-menu-item text="Bestand">
				<nldd-menu>
					<nldd-menu-item text="Open"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-item>
		`);
		await waitForUpdate(el);
		const submenu = el.querySelector('nldd-menu')!;
		expect(submenu.id).toMatch(/^nldd-menu-/);
		const button = el.shadowRoot!.querySelector('button')!;
		expect(button.getAttribute('aria-controls')).toBe(submenu.id);
	});

	it('ArrowRight moves focus to the first visible item in the opened submenu', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
						<nldd-menu-item text="Save"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const item = el.querySelector(':scope > nldd-menu-item') as HTMLElement;
		item.setAttribute('data-focused', '');
		const firstSubmenuItem = item.querySelectorAll('nldd-menu-item')[0] as HTMLElement;
		const focusSpy = vi.spyOn(firstSubmenuItem, 'focus');
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		// The handler schedules focus via requestAnimationFrame once submenu-open
		// has been processed synchronously by the parent menu.
		await new Promise(r => requestAnimationFrame(() => r(null)));
		expect(focusSpy).toHaveBeenCalled();
	});

	it('ArrowLeft on an open submenu returns focus to the parent item', async () => {
		el = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(el);
		const item = el.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const submenu = item.querySelector(':scope > nldd-menu') as HTMLElement;
		// Open via the synthetic submenu-open so the parent wires _parentMenu / _parentItem.
		item.dispatchEvent(new CustomEvent('submenu-open', {
			detail: { submenu, item },
			bubbles: true,
		}));
		await waitForUpdate(el);
		const focusSpy = vi.spyOn(item, 'focus');
		submenu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		expect(focusSpy).toHaveBeenCalled();
	});

	it('Escape on an open submenu returns focus to the parent item, not the root anchor', async () => {
		// Without the _isSubmenu branch in _handleKeydown, Escape would focus
		// the root anchor, dropping the user out of the chain entirely.
		el = await fixture<HTMLElement>(`
			<div>
				<button id="esc-test-anchor"></button>
				<nldd-menu anchor="esc-test-anchor">
					<nldd-menu-item text="Bestand">
						<nldd-menu>
							<nldd-menu-item text="Open"></nldd-menu-item>
						</nldd-menu>
					</nldd-menu-item>
				</nldd-menu>
			</div>
		`);
		const root = el.querySelector('nldd-menu') as HTMLElement;
		await waitForUpdate(root);
		const item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const submenu = item.querySelector(':scope > nldd-menu') as HTMLElement;
		const anchor = el.querySelector('#esc-test-anchor') as HTMLElement;
		item.dispatchEvent(new CustomEvent('submenu-open', {
			detail: { submenu, item },
			bubbles: true,
		}));
		await waitForUpdate(el);
		const itemFocusSpy = vi.spyOn(item, 'focus');
		const anchorFocusSpy = vi.spyOn(anchor, 'focus');
		submenu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(itemFocusSpy).toHaveBeenCalled();
		expect(anchorFocusSpy).not.toHaveBeenCalled();
	});

	it('warns when a nldd-menu child is added after mount', async () => {
		// Submenu attachment is resolved once at firstUpdated. A late addition
		// would silently miss aria-controls / chevron / hover-open — surface
		// it via console.warn so consumers don't chase the symptom.
		el = await fixture('<nldd-menu-item text="Bestand"></nldd-menu-item>');
		await waitForUpdate(el);
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const late = document.createElement('nldd-menu');
		el.appendChild(late);
		// MutationObserver delivers asynchronously — wait a microtask tick.
		await new Promise(r => setTimeout(r, 0));
		expect(warn).toHaveBeenCalled();
		expect(warn.mock.calls[0][0]).toMatch(/added after mount/);
	});
});

describe('nldd-menu typeahead and event lifecycle', () => {
	it('typeahead jumps to the next item starting with the typed character', async () => {
		const menu = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Apple"></nldd-menu-item>
				<nldd-menu-item text="Banana"></nldd-menu-item>
				<nldd-menu-item text="Cherry"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(menu);
		const items = menu.querySelectorAll(':scope > nldd-menu-item') as NodeListOf<HTMLElement>;
		items[0].setAttribute('data-focused', '');
		// Spy on focus() of items — the typeahead handler calls .focus() on
		// the matched item. Verifying this works regardless of whether the
		// popover is actually open (which test fixtures don't trigger).
		let focused: HTMLElement | null = null;
		items.forEach(item => {
			item.focus = () => { focused = item; };
		});
		menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', bubbles: true }));
		await waitForUpdate(menu);
		expect(focused).toBe(items[2]);
		cleanup(menu);
	});

	it('typeahead accumulates characters within the buffer window', async () => {
		const menu = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Apple"></nldd-menu-item>
				<nldd-menu-item text="Slack"></nldd-menu-item>
				<nldd-menu-item text="Slate"></nldd-menu-item>
				<nldd-menu-item text="Sun"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(menu);
		const items = menu.querySelectorAll(':scope > nldd-menu-item') as NodeListOf<HTMLElement>;
		items[0].setAttribute('data-focused', '');
		let focused: HTMLElement | null = null;
		items.forEach(item => {
			item.focus = () => { focused = item; };
		});
		// Press 'S' — single char, cycles past Apple → Slack
		menu.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
		await waitForUpdate(menu);
		expect(focused).toBe(items[1]); // Slack

		// Press 'l' immediately after — buffer becomes "sl", matches Slack & Slate.
		// Multi-char starts at currentIndex (Slack=1) which still matches → stay.
		focused = null;
		items[1].setAttribute('data-focused', '');
		menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'l', bubbles: true }));
		await waitForUpdate(menu);
		expect(focused).toBe(items[1]); // Slack still matches "sl"
		cleanup(menu);
	});

	it('typeahead buffer resets after the idle window', async () => {
		const menu = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Slack"></nldd-menu-item>
				<nldd-menu-item text="Sun"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(menu);
		const items = menu.querySelectorAll(':scope > nldd-menu-item') as NodeListOf<HTMLElement>;
		items[0].setAttribute('data-focused', '');
		let focused: HTMLElement | null = null;
		items.forEach(item => {
			item.focus = () => { focused = item; };
		});
		// Type 's' — cycles past Slack → Sun
		menu.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
		await waitForUpdate(menu);
		expect(focused).toBe(items[1]); // Sun

		// Wait for the buffer to reset, then type 's' again — should cycle, not extend.
		items[0].removeAttribute('data-focused');
		items[1].setAttribute('data-focused', '');
		focused = null;
		await new Promise(r => setTimeout(r, 600));
		menu.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
		await waitForUpdate(menu);
		expect(focused).toBe(items[0]); // wrap to Slack
		cleanup(menu);
	});

	it('dispatches submenu-close when an opened submenu closes', async () => {
		const menu = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(menu);
		const item = menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const submenu = item.querySelector(':scope > nldd-menu') as HTMLElement;
		// Open via the synthetic submenu-open event.
		item.dispatchEvent(new CustomEvent('submenu-open', {
			detail: { submenu, item },
			bubbles: true,
		}));
		await waitForUpdate(menu);
		let closeFired = false;
		menu.addEventListener('submenu-close', () => { closeFired = true; });
		(submenu as HTMLElement & { hidePopover: () => void }).hidePopover();
		await waitForUpdate(menu);
		expect(closeFired).toBe(true);
		cleanup(menu);
	});

	it('dispatches submenu-close exactly once when the same submenu is re-opened before closing', async () => {
		// Regression: _handleSubmenuOpen used to register a fresh `toggle`
		// listener on every call. Hover-opening then clicking the same opener
		// (or rapid double-click) would stack listeners and fire submenu-close
		// twice on the eventual close.
		const menu = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(menu);
		const item = menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const submenu = item.querySelector(':scope > nldd-menu') as HTMLElement;
		const dispatchOpen = () => item.dispatchEvent(new CustomEvent('submenu-open', {
			detail: { submenu, item },
			bubbles: true,
		}));
		dispatchOpen();
		dispatchOpen();
		dispatchOpen();
		await waitForUpdate(menu);
		let closeCount = 0;
		menu.addEventListener('submenu-close', () => { closeCount += 1; });
		(submenu as HTMLElement & { hidePopover: () => void }).hidePopover();
		await waitForUpdate(menu);
		expect(closeCount).toBe(1);
		cleanup(menu);
	});
});

describe('nldd-menu safe-triangle internals', () => {
	type PolygonHelper = (
		p: { x: number, y: number },
		vertices: Array<{ x: number, y: number }>,
	) => boolean;

	// Static helper — reach via the constructor so the test stays honest about
	// it being callable without an instance.
	const pointInPolygon = (
		(customElements.get('nldd-menu') as unknown as { _pointInPolygon: PolygonHelper })._pointInPolygon
	).bind(customElements.get('nldd-menu')) as PolygonHelper;

	it('identifies a point inside a convex wedge as inside', () => {
		// Triangle apex at (0,0), base on x=100 between y=-50..50.
		const wedge = [
			{ x: 0, y: 0 },
			{ x: 100, y: -50 },
			{ x: 100, y: 50 },
		];
		expect(pointInPolygon({ x: 50, y: 0 }, wedge)).toBe(true);
		expect(pointInPolygon({ x: 80, y: 10 }, wedge)).toBe(true);
	});

	it('identifies a point outside a convex wedge as outside', () => {
		const wedge = [
			{ x: 0, y: 0 },
			{ x: 100, y: -50 },
			{ x: 100, y: 50 },
		];
		expect(pointInPolygon({ x: -10, y: 0 }, wedge)).toBe(false);
		expect(pointInPolygon({ x: 50, y: 60 }, wedge)).toBe(false);
		expect(pointInPolygon({ x: 110, y: 0 }, wedge)).toBe(false);
	});

	it('handles a four-point wedge (apex band + far edge) symmetrically', () => {
		// Mirrors the actual safe-triangle shape — apex with ±1px band, far
		// edge on the submenu side. The wedge widens linearly with x, so at
		// the midpoint the vertical span is roughly half the far edge.
		const wedge = [
			{ x: 0, y: -1 },
			{ x: 100, y: -50 },
			{ x: 100, y: 50 },
			{ x: 0, y: 1 },
		];
		expect(pointInPolygon({ x: 50, y: 0 }, wedge)).toBe(true);
		expect(pointInPolygon({ x: 50, y: 20 }, wedge)).toBe(true);
		expect(pointInPolygon({ x: 90, y: 40 }, wedge)).toBe(true);
		// Outside the widening wedge at the midpoint.
		expect(pointInPolygon({ x: 50, y: 40 }, wedge)).toBe(false);
		expect(pointInPolygon({ x: 50, y: -40 }, wedge)).toBe(false);
	});
});

describe('nldd-menu drill-in chain', () => {
	const NLDDMenuCtor = customElements.get('nldd-menu') as CustomElementConstructor;
	let drillInSpy: ReturnType<typeof vi.spyOn>;

	function openSubmenu(parent: HTMLElement, item: HTMLElement, submenu: HTMLElement): void {
		item.dispatchEvent(new CustomEvent('submenu-open', {
			detail: { submenu, item },
			bubbles: true,
		}));
		void parent; // grouping arg, no further use
	}

	beforeEach(() => {
		// Force every menu instance into drill-in mode regardless of viewport.
		drillInSpy = vi.spyOn(NLDDMenuCtor.prototype as unknown as { _drillInMode: boolean }, '_drillInMode', 'get');
		drillInSpy.mockReturnValue(true);
	});

	afterEach(() => {
		drillInSpy.mockRestore();
		// Defensive isolation: if an assertion threw before a test's own
		// cleanup(root), drill-in submenus reparented to <body> would leak
		// into later tests. Sweep any stragglers.
		document.querySelectorAll('nldd-menu').forEach(m => m.remove());
	});

	it('select on a level-3 item collapses the entire chain (3 levels)', async () => {
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="L1">
					<nldd-menu>
						<nldd-menu-item text="L2">
							<nldd-menu>
								<nldd-menu-item text="L3"></nldd-menu-item>
							</nldd-menu>
						</nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);

		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;
		const l2Item = l2Menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l3Menu = l2Item.querySelector(':scope > nldd-menu') as HTMLElement;
		const l3Item = l3Menu.querySelector(':scope > nldd-menu-item') as HTMLElement;

		// Open root → L2 → L3.
		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(root, l1Item, l2Menu);
		await waitForUpdate(root);
		openSubmenu(l2Menu, l2Item, l3Menu);
		await waitForUpdate(root);

		// In drill-in: only the deepest level is open; ancestors are hidden.
		expect(l3Menu.matches(':popover-open')).toBe(true);
		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(root.matches(':popover-open')).toBe(false);

		// Selecting the deepest item should collapse all levels at once.
		l3Item.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true }));
		await waitForUpdate(root);

		expect(l3Menu.matches(':popover-open')).toBe(false);
		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(root.matches(':popover-open')).toBe(false);

		cleanup(root);
	});

	it('chain state is fully reset after a select — re-opening the same chain works', async () => {
		// Regression: an earlier version captured `_parentMenu` AFTER
		// hidePopover, and synchronous toggle dispatch had already nulled
		// it via the parent's cleanup. The walk skipped grandparents,
		// leaving stale `_activeSubmenu` / cleanup / toggle listeners on
		// root. The next open of the same chain would then accumulate a
		// second toggle listener on L2; closing L2 fired both the stale
		// and the fresh cleanup, corrupting `_activeSubmenu` tracking
		// from that point on.
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="L1">
					<nldd-menu>
						<nldd-menu-item text="L2">
							<nldd-menu>
								<nldd-menu-item text="L3"></nldd-menu-item>
							</nldd-menu>
						</nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);

		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;
		const l2Item = l2Menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l3Menu = l2Item.querySelector(':scope > nldd-menu') as HTMLElement;
		const l3Item = l3Menu.querySelector(':scope > nldd-menu-item') as HTMLElement;

		const rootInternals = root as unknown as {
			_activeSubmenu: HTMLElement | null;
			_activeSubmenuCleanup: ((skipReshow: boolean) => void) | null;
		};
		const l2Internals = l2Menu as unknown as {
			_parentMenu: HTMLElement | null;
		};

		// Session 1 — open chain to L3, then select.
		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		l1Item.dispatchEvent(new CustomEvent('submenu-open', { detail: { submenu: l2Menu, item: l1Item }, bubbles: true }));
		await waitForUpdate(root);
		l2Item.dispatchEvent(new CustomEvent('submenu-open', { detail: { submenu: l3Menu, item: l2Item }, bubbles: true }));
		await waitForUpdate(root);

		l3Item.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true }));
		await waitForUpdate(root);

		// After select-chain-close, every level should have shed its
		// parent reference and the root should have no active submenu.
		expect(rootInternals._activeSubmenu).toBe(null);
		expect(rootInternals._activeSubmenuCleanup).toBe(null);
		expect(l2Internals._parentMenu).toBe(null);

		// Session 2 — same chain again. If session 1 left a stale toggle
		// listener on L2, the eventual close in this session would double-
		// fire and corrupt root's tracking. Verify a clean second cycle.
		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		l1Item.dispatchEvent(new CustomEvent('submenu-open', { detail: { submenu: l2Menu, item: l1Item }, bubbles: true }));
		await waitForUpdate(root);

		expect(l2Menu.matches(':popover-open')).toBe(true);
		expect(l2Internals._parentMenu).toBe(root);
		expect(rootInternals._activeSubmenu).toBe(l2Menu);

		// Close L2 (back-button equivalent) — root should re-show cleanly,
		// and exactly one cleanup should run (no stale duplicate firing).
		(l2Menu as HTMLElement & { hidePopover: () => void }).hidePopover();
		await waitForUpdate(root);

		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(root.matches(':popover-open')).toBe(true);
		expect(rootInternals._activeSubmenu).toBe(null);
		expect(l2Internals._parentMenu).toBe(null);

		cleanup(root);
	});

	it('anchor click collapses the chain after 2 drill-in navigations — twice', async () => {
		// Repro: clicking the "Open menu" anchor while two levels deep in a
		// drill-in chain should collapse everything. The user reported it
		// stops working after the 2nd navigation / on a repeat cycle.
		const root = await fixture<HTMLElement>(`
			<div>
				<button id="anch">Open menu</button>
				<nldd-menu anchor="anch">
					<nldd-menu-item text="L1">
						<nldd-menu>
							<nldd-menu-item text="L2">
								<nldd-menu>
									<nldd-menu-item text="L3"></nldd-menu-item>
								</nldd-menu>
							</nldd-menu-item>
						</nldd-menu>
					</nldd-menu-item>
				</nldd-menu>
			</div>
		`);
		await waitForUpdate(root);

		const anch = root.querySelector('#anch') as HTMLButtonElement;
		const menu = root.querySelector('nldd-menu') as HTMLElement & { showPopover(): void };
		const l1Item = menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;
		const l2Item = l2Menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l3Menu = l2Item.querySelector(':scope > nldd-menu') as HTMLElement;
		const rootInternals = menu as unknown as { _activeSubmenu: HTMLElement | null };

		const navigateTwice = async () => {
			menu.showPopover();
			await waitForUpdate(root);
			openSubmenu(menu, l1Item, l2Menu);   // navigation 1
			await waitForUpdate(root);
			openSubmenu(l2Menu, l2Item, l3Menu); // navigation 2
			await waitForUpdate(root);
			expect(l3Menu.matches(':popover-open')).toBe(true);
		};

		// Cycle 1.
		await navigateTwice();
		anch.click(); // anchor "Open menu" toggle → must collapse the chain
		await waitForUpdate(root);
		expect(l3Menu.matches(':popover-open')).toBe(false);
		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(menu.matches(':popover-open')).toBe(false);
		expect(rootInternals._activeSubmenu).toBe(null);

		// Cycle 2 — the "after the 2nd time" repeat the user described.
		await navigateTwice();
		anch.click();
		await waitForUpdate(root);
		expect(l3Menu.matches(':popover-open')).toBe(false);
		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(menu.matches(':popover-open')).toBe(false);
		expect(rootInternals._activeSubmenu).toBe(null);

		cleanup(root);
	});

	it('anchor click collapses the chain even when chain links are stale', async () => {
		// The recurring "anchor click doesn't close" bug: real interaction
		// leaves _activeSubmenu / _parentMenu stale, so the old
		// parent-walk collapse silently bailed and the click fell through
		// to showPopover() (bounce). _collapseChain is registry-driven and
		// must survive deliberately corrupted links.
		const root = await fixture<HTMLElement>(`
			<div>
				<button id="anch2">Open menu</button>
				<nldd-menu anchor="anch2">
					<nldd-menu-item text="L1">
						<nldd-menu>
							<nldd-menu-item text="L2">
								<nldd-menu>
									<nldd-menu-item text="L3"></nldd-menu-item>
								</nldd-menu>
							</nldd-menu-item>
						</nldd-menu>
					</nldd-menu-item>
				</nldd-menu>
			</div>
		`);
		await waitForUpdate(root);
		const anch = root.querySelector('#anch2') as HTMLButtonElement;
		const menu = root.querySelector('nldd-menu') as HTMLElement & { showPopover(): void };
		const l1Item = menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;
		const l2Item = l2Menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l3Menu = l2Item.querySelector(':scope > nldd-menu') as HTMLElement;

		menu.showPopover();
		await waitForUpdate(root);
		openSubmenu(menu, l1Item, l2Menu);
		await waitForUpdate(root);
		openSubmenu(l2Menu, l2Item, l3Menu);
		await waitForUpdate(root);
		expect(l3Menu.matches(':popover-open')).toBe(true);

		// Corrupt every parent/active link the old walk depended on.
		const wipe = (m: HTMLElement) => Object.assign(m as unknown as Record<string, unknown>, {
			_activeSubmenu: null, _parentMenu: null, _activeSubmenuCleanup: null,
		});
		wipe(menu); wipe(l2Menu); wipe(l3Menu);

		anch.click(); // registry-driven collapse must still work
		await waitForUpdate(root);

		expect(l3Menu.matches(':popover-open')).toBe(false);
		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(menu.matches(':popover-open')).toBe(false);
		expect((menu as unknown as { _openChain: unknown[] })._openChain.length).toBe(0);

		cleanup(root);
	});

	it('anchor click after a pointer-collapse never reopens', async () => {
		// Closing from deep in a drill-in submenu: the submenu's
		// pointerdown/tap collapses the chain, then the trailing click
		// reaches the root. The gesture marker (_collapsedByPointerGesture)
		// suppresses the click-driven reopen — timing-independent, so it
		// works on touch where pointerup→click can lag arbitrarily.
		const root = await fixture<HTMLElement>(`
			<div>
				<button id="anch3">Open menu</button>
				<nldd-menu anchor="anch3">
					<nldd-menu-item text="L1">
						<nldd-menu>
							<nldd-menu-item text="L2"></nldd-menu-item>
						</nldd-menu>
					</nldd-menu-item>
				</nldd-menu>
			</div>
		`);
		await waitForUpdate(root);
		const anch = root.querySelector('#anch3') as HTMLButtonElement;
		const menu = root.querySelector('nldd-menu') as HTMLElement & { showPopover(): void };
		const l1Item = menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;

		menu.showPopover();
		await waitForUpdate(root);
		openSubmenu(menu, l1Item, l2Menu);
		await waitForUpdate(root);
		expect(l2Menu.matches(':popover-open')).toBe(true);

		// The submenu's capture pointerdown handler collapses the chain and
		// marks the gesture (mouse path = synchronous, like the real flow).
		anch.dispatchEvent(new PointerEvent('pointerdown', {
			bubbles: true, composed: true, pointerType: 'mouse',
		}));
		await waitForUpdate(root);
		expect(l2Menu.matches(':popover-open')).toBe(false);

		anch.click();
		await waitForUpdate(root);

		expect(menu.matches(':popover-open')).toBe(false); // did NOT reopen
		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect((menu as unknown as { _openChain: unknown[] })._openChain.length).toBe(0);

		cleanup(root);
	});

	it('root-only drill-in: anchor click closes (no bounce) and a later click reopens', async () => {
		// Contract for a root drill-in menu with no submenu. The anchor
		// click must close it via the click handler's collapse-and-return
		// branch (no bounce), and a later anchor click must still open it.
		// (A "set the gesture marker on the root early-return regardless"
		// change would make the close click return before collapsing and
		// the open click return before showing — this locks both.)
		const root = await fixture<HTMLElement>(`
			<div>
				<button id="anch4">Open menu</button>
				<nldd-menu anchor="anch4">
					<nldd-menu-item text="Only"></nldd-menu-item>
				</nldd-menu>
			</div>
		`);
		await waitForUpdate(root);
		const anch = root.querySelector('#anch4') as HTMLButtonElement;
		const menu = root.querySelector('nldd-menu') as HTMLElement & { showPopover(): void };

		menu.showPopover();
		await waitForUpdate(root);
		expect(menu.matches(':popover-open')).toBe(true);

		anch.click(); // close
		await waitForUpdate(root);
		expect(menu.matches(':popover-open')).toBe(false);

		// A fresh anchor click opens it again.
		anch.click();
		await waitForUpdate(root);
		expect(menu.matches(':popover-open')).toBe(true);

		cleanup(root);
	});

	it('pointerdown outside the chain collapses every level', async () => {
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="L1">
					<nldd-menu>
						<nldd-menu-item text="L2">
							<nldd-menu>
								<nldd-menu-item text="L3"></nldd-menu-item>
							</nldd-menu>
						</nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);

		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;
		const l2Item = l2Menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l3Menu = l2Item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(root, l1Item, l2Menu);
		await waitForUpdate(root);
		openSubmenu(l2Menu, l2Item, l3Menu);
		await waitForUpdate(root);

		expect(l3Menu.matches(':popover-open')).toBe(true);

		// Click somewhere clearly outside the chain — a fresh element appended
		// to the body works as the pointerdown target.
		const outside = document.createElement('div');
		document.body.appendChild(outside);
		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		await waitForUpdate(root);

		expect(l3Menu.matches(':popover-open')).toBe(false);
		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(root.matches(':popover-open')).toBe(false);

		outside.remove();
		cleanup(root);
	});

	it('a touch SCROLL started outside the chain leaves it open', async () => {
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="L1">
					<nldd-menu>
						<nldd-menu-item text="L2"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);
		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(root, l1Item, l2Menu);
		await waitForUpdate(root);
		expect(l2Menu.matches(':popover-open')).toBe(true);

		const outside = document.createElement('div');
		document.body.appendChild(outside);

		// touch pointerdown outside → deferred (no immediate close)
		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, pointerType: 'touch', clientX: 10, clientY: 10 }));
		await waitForUpdate(root);
		expect(l2Menu.matches(':popover-open')).toBe(true);

		// move past the 8px threshold → recognized as a scroll, chain untouched
		document.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'touch', clientX: 10, clientY: 70 }));
		document.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', clientX: 10, clientY: 70 }));
		await waitForUpdate(root);

		expect(l2Menu.matches(':popover-open')).toBe(true);
		expect(root.matches(':popover-open')).toBe(false); // still hidden behind, chain intact

		outside.remove();
		cleanup(root);
	});

	it('a touch TAP outside the chain collapses every level', async () => {
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="L1">
					<nldd-menu>
						<nldd-menu-item text="L2"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);
		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(root, l1Item, l2Menu);
		await waitForUpdate(root);
		expect(l2Menu.matches(':popover-open')).toBe(true);

		const outside = document.createElement('div');
		document.body.appendChild(outside);

		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, pointerType: 'touch', clientX: 10, clientY: 10 }));
		// pointerup with negligible move → tap → chain-close
		document.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', clientX: 11, clientY: 12 }));
		await waitForUpdate(root);

		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(root.matches(':popover-open')).toBe(false);

		outside.remove();
		cleanup(root);
	});

	it('opening a deeper level hides the parent without collapsing the chain', async () => {
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="L1">
					<nldd-menu>
						<nldd-menu-item text="L2"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);

		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		expect(root.matches(':popover-open')).toBe(true);

		openSubmenu(root, l1Item, l2Menu);
		await waitForUpdate(root);

		// Drill-in: parent level is hidden but the chain link is intact —
		// the deeper level still references the parent via _parentMenu, and
		// closing the deeper level (without select-chain-close) re-shows
		// the parent.
		expect(l2Menu.matches(':popover-open')).toBe(true);
		expect(root.matches(':popover-open')).toBe(false);
		expect((l2Menu as unknown as { _parentMenu: HTMLElement | null })._parentMenu).toBe(root);

		// Closing L2 (back-button equivalent) re-shows the parent.
		(l2Menu as HTMLElement & { hidePopover: () => void }).hidePopover();
		await waitForUpdate(root);
		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(root.matches(':popover-open')).toBe(true);

		cleanup(root);
	});

	it('does not leak the reparented submenu when the parent is removed mid-open', async () => {
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="L1">
					<nldd-menu>
						<nldd-menu-item text="L2"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);

		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(root, l1Item, l2Menu);
		await waitForUpdate(root);

		// Drill-in reparents the submenu to <body>.
		expect(l2Menu.parentElement).toBe(document.body);

		// Simulate SPA navigation / story teardown: the original parent
		// (the menu-item that hosted the submenu) leaves the DOM while
		// the submenu is still open and detached to <body>.
		l1Item.remove();
		expect(l1Item.isConnected).toBe(false);

		// Closing the submenu now has nowhere to restore it to — it must
		// be removed, not left orphaned in <body>.
		(l2Menu as HTMLElement & { hidePopover: () => void }).hidePopover();
		await waitForUpdate(l2Menu);
		expect(l2Menu.isConnected).toBe(false);
		expect(document.body.contains(l2Menu)).toBe(false);

		cleanup(root);
	});

	it('resolves the drill-in side from available space, content-independent', async () => {
		// Anchor near the top of the viewport → more space below.
		const anchor = document.createElement('button');
		anchor.style.cssText = 'position:fixed;left:8px;top:8px;width:40px;height:24px;';
		document.body.appendChild(anchor);

		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="L1">
					<nldd-menu>
						<nldd-menu-item text="A"></nldd-menu-item>
						<nldd-menu-item text="B"></nldd-menu-item>
						<nldd-menu-item text="C"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);

		const resolve = (root as unknown as {
			_resolveDrillInPlacement: (a: Element) => string;
		})._resolveDrillInPlacement.bind(root);

		expect(resolve(anchor)).toBe('bottom-start');

		// Opening a (larger) submenu must not change the resolved side —
		// the resolver reads only the anchor rect + viewport, never
		// content size, so a bigger submenu can't flip the stack.
		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;
		openSubmenu(root, l1Item, l2Menu);
		await waitForUpdate(root);
		expect(resolve(anchor)).toBe('bottom-start');

		anchor.remove();
		cleanup(root);
	});

	it('resolves to the top side when there is more space above the anchor', async () => {
		const anchor = document.createElement('button');
		anchor.style.cssText = 'position:fixed;left:8px;bottom:4px;width:40px;height:24px;';
		document.body.appendChild(anchor);

		const root = await fixture<HTMLElement>(`
			<nldd-menu><nldd-menu-item text="A"></nldd-menu-item></nldd-menu>
		`);
		await waitForUpdate(root);

		const resolve = (root as unknown as {
			_resolveDrillInPlacement: (a: Element) => string;
		})._resolveDrillInPlacement.bind(root);

		expect(resolve(anchor)).toBe('top-start');

		anchor.remove();
		cleanup(root);
	});

	it('clicking the anchor while a submenu is open collapses the whole chain in one click', async () => {
		const anchor = document.createElement('button');
		anchor.id = 'drillin-anchor';
		anchor.textContent = 'Open menu';
		document.body.appendChild(anchor);

		const root = await fixture<HTMLElement>(`
			<nldd-menu anchor="drillin-anchor">
				<nldd-menu-item text="L1">
					<nldd-menu>
						<nldd-menu-item text="L2"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);
		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(root, l1Item, l2Menu);
		await waitForUpdate(root);

		// Drill-in: submenu shows, root hidden behind it.
		expect(l2Menu.matches(':popover-open')).toBe(true);
		expect(root.matches(':popover-open')).toBe(false);

		// Real gesture: pointerdown collapses the chain via
		// _handleDocumentPointerdown, then the same gesture's click
		// reaches _handleDocumentClick with _activeSubmenu already
		// cleared. The root must NOT be re-shown — the whole menu stays
		// closed after a single click.
		anchor.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		await waitForUpdate(root);
		anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
		await waitForUpdate(root);

		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(root.matches(':popover-open')).toBe(false);

		anchor.remove();
		cleanup(root);
	});

	it('keyboard activation of the anchor (click, no pointerdown) also collapses the chain', async () => {
		const anchor = document.createElement('button');
		anchor.id = 'drillin-anchor-kbd';
		anchor.textContent = 'Open menu';
		document.body.appendChild(anchor);

		const root = await fixture<HTMLElement>(`
			<nldd-menu anchor="drillin-anchor-kbd">
				<nldd-menu-item text="L1">
					<nldd-menu>
						<nldd-menu-item text="L2"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);
		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(root, l1Item, l2Menu);
		await waitForUpdate(root);
		expect(l2Menu.matches(':popover-open')).toBe(true);

		// Enter/Space on the button fires `click` with no preceding
		// pointerdown — handled by the _activeSubmenu guard in
		// _handleDocumentClick.
		anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
		await waitForUpdate(root);

		expect(l2Menu.matches(':popover-open')).toBe(false);
		expect(root.matches(':popover-open')).toBe(false);

		anchor.remove();
		cleanup(root);
	});
});

describe('nldd-menu drill-in status announcements (WCAG 4.1.3)', () => {
	const NLDDMenuCtor = customElements.get('nldd-menu') as CustomElementConstructor;
	let drillInSpy: ReturnType<typeof vi.spyOn>;

	function openSubmenu(item: HTMLElement, submenu: HTMLElement): void {
		item.dispatchEvent(new CustomEvent('submenu-open', {
			detail: { submenu, item },
			bubbles: true,
		}));
	}

	function liveText(menu: HTMLElement): string {
		const region = menu.shadowRoot?.querySelector<HTMLElement>('.menu__live-region');
		return region?.textContent ?? '';
	}

	// _announce clears then sets on a double rAF; three frames is a safe
	// margin since the call already ran synchronously before we await.
	function flushAnnounce(): Promise<void> {
		return new Promise(resolve => {
			let n = 0;
			const step = () => (++n >= 3 ? resolve() : requestAnimationFrame(step));
			requestAnimationFrame(step);
		});
	}

	function forceDrillIn(value: boolean): void {
		drillInSpy = vi.spyOn(
			NLDDMenuCtor.prototype as unknown as { _drillInMode: boolean },
			'_drillInMode',
			'get',
		);
		drillInSpy.mockReturnValue(value);
	}

	afterEach(() => {
		drillInSpy?.mockRestore();
		// Drill-in reparents submenus to <body>; sweep any stragglers if an
		// assertion threw before the test's own cleanup(root).
		document.querySelectorAll('nldd-menu').forEach(m => m.remove());
	});

	it('announces the entered submenu on drill-in open', async () => {
		forceDrillIn(true);
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);
		const item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const submenu = item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(item, submenu);
		await waitForUpdate(root);
		await flushAnnounce();

		expect(liveText(submenu)).toBe('Submenu: Bestand');
		// Nothing leaks onto the (now hidden) parent's region.
		expect(liveText(root)).toBe('');

		cleanup(root);
	});

	it('announces returning to the root on back-button click', async () => {
		forceDrillIn(true);
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);
		const item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const submenu = item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(item, submenu);
		await waitForUpdate(root);

		const backButton = submenu.shadowRoot?.querySelector<HTMLElement>('.menu__back-button');
		expect(backButton).not.toBeNull();
		backButton!.click();
		await waitForUpdate(root);
		await flushAnnounce();

		// Root has no parent item, so the destination is the plain back word.
		expect(liveText(root)).toBe('Terug');

		cleanup(root);
	});

	it('announces the destination level on ArrowLeft from a deeper submenu', async () => {
		forceDrillIn(true);
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Recent">
							<nldd-menu>
								<nldd-menu-item text="Project A"></nldd-menu-item>
							</nldd-menu>
						</nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);
		const l1Item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l2Menu = l1Item.querySelector(':scope > nldd-menu') as HTMLElement;
		const l2Item = l2Menu.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const l3Menu = l2Item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(l1Item, l2Menu);
		await waitForUpdate(root);
		openSubmenu(l2Item, l3Menu);
		await waitForUpdate(root);

		// ArrowLeft from the deepest level → back to L2, whose parent item
		// ("Bestand") titles that view.
		l3Menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		await waitForUpdate(root);
		await flushAnnounce();

		expect(liveText(l2Menu)).toBe('Terug naar Bestand');

		cleanup(root);
	});

	it('does not announce in cascade mode (no view swap)', async () => {
		forceDrillIn(false);
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);
		const item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const submenu = item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);
		openSubmenu(item, submenu);
		await waitForUpdate(root);
		await flushAnnounce();

		// Cascade keeps both views visible — no view-change to announce.
		expect(liveText(root)).toBe('');
		expect(liveText(submenu)).toBe('');

		cleanup(root);
	});

	it('re-announces the same submenu after navigating back to it', async () => {
		// Guards the pending-scoped dedupe: an identical message must still
		// be announced again for a later, genuine transition.
		forceDrillIn(true);
		const root = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="Bestand">
					<nldd-menu>
						<nldd-menu-item text="Open"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(root);
		const item = root.querySelector(':scope > nldd-menu-item') as HTMLElement;
		const submenu = item.querySelector(':scope > nldd-menu') as HTMLElement;

		(root as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(root);

		openSubmenu(item, submenu);
		await waitForUpdate(root);
		await flushAnnounce();
		expect(liveText(submenu)).toBe('Submenu: Bestand');

		submenu.shadowRoot!.querySelector<HTMLElement>('.menu__back-button')!.click();
		await waitForUpdate(root);
		await flushAnnounce();
		expect(liveText(root)).toBe('Terug');

		openSubmenu(item, submenu);
		await waitForUpdate(root);
		await flushAnnounce();
		expect(liveText(submenu)).toBe('Submenu: Bestand');

		cleanup(root);
	});
});

describe('nldd-menu close-on-resize', () => {
	it('hides an open menu when the window dispatches a resize event', async () => {
		const menu = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="A"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(menu);
		(menu as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(menu);
		expect(menu.matches(':popover-open')).toBe(true);

		window.dispatchEvent(new Event('resize'));
		await waitForUpdate(menu);
		expect(menu.matches(':popover-open')).toBe(false);

		cleanup(menu);
	});

	it('does not respond to resize while closed (listener wired only on open)', async () => {
		const menu = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="A"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(menu);
		expect(menu.matches(':popover-open')).toBe(false);

		// No-op: the resize listener is added on open, removed on close, so
		// resizes outside the open window must not throw or change state.
		window.dispatchEvent(new Event('resize'));
		await waitForUpdate(menu);
		expect(menu.matches(':popover-open')).toBe(false);

		cleanup(menu);
	});
});

describe('nldd-menu touch-scroll press suppression', () => {
	function touchEvent(type: string, target: EventTarget, x: number, y: number): TouchEvent {
		const touch = new Touch({ identifier: 0, target, clientX: x, clientY: y });
		return new TouchEvent(type, {
			bubbles: true,
			composed: true,
			touches: type === 'touchend' || type === 'touchcancel' ? [] : [touch],
			changedTouches: [touch],
		});
	}

	it('sets scroll-active once the touch moves past the threshold and clears on touchend', async () => {
		const menu = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="A"></nldd-menu-item>
				<nldd-menu-item text="B"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(menu);
		(menu as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(menu);

		const scroller = menu.shadowRoot!.querySelector('.menu')!;

		scroller.dispatchEvent(touchEvent('touchstart', scroller, 100, 100));
		expect(menu.hasAttribute('scroll-active')).toBe(false);

		// Small jitter below the 8px threshold — still a tap, not a scroll.
		scroller.dispatchEvent(touchEvent('touchmove', scroller, 103, 104));
		expect(menu.hasAttribute('scroll-active')).toBe(false);

		// Past the threshold — now a scroll.
		scroller.dispatchEvent(touchEvent('touchmove', scroller, 100, 130));
		expect(menu.hasAttribute('scroll-active')).toBe(true);

		scroller.dispatchEvent(touchEvent('touchend', scroller, 100, 130));
		expect(menu.hasAttribute('scroll-active')).toBe(false);

		cleanup(menu);
	});

	it('a pure tap (no significant move) never sets scroll-active', async () => {
		const menu = await fixture<HTMLElement>(`
			<nldd-menu>
				<nldd-menu-item text="A"></nldd-menu-item>
			</nldd-menu>
		`);
		await waitForUpdate(menu);
		(menu as HTMLElement & { showPopover: () => void }).showPopover();
		await waitForUpdate(menu);

		const scroller = menu.shadowRoot!.querySelector('.menu')!;
		scroller.dispatchEvent(touchEvent('touchstart', scroller, 50, 50));
		scroller.dispatchEvent(touchEvent('touchmove', scroller, 51, 52));
		scroller.dispatchEvent(touchEvent('touchend', scroller, 51, 52));
		expect(menu.hasAttribute('scroll-active')).toBe(false);

		cleanup(menu);
	});

	// — Drag selection (press one item, release on another) ————————————————

	describe('drag selection', () => {
		// Open a standalone menu and return its two items with their on-screen
		// center coordinates (needs real layout, which the browser test runner
		// provides — elementFromPoint resolves the release target).
		async function openTwoItemMenu() {
			const menu = await fixture<HTMLElement>(`
				<nldd-menu>
					<nldd-menu-item text="Alpha"></nldd-menu-item>
					<nldd-menu-item text="Beta"></nldd-menu-item>
				</nldd-menu>
			`);
			await waitForUpdate(menu);
			(menu as HTMLElement & { showPopover: () => void }).showPopover();
			await waitForUpdate(menu);
			const [itemA, itemB] = Array.from(menu.querySelectorAll('nldd-menu-item')) as HTMLElement[];
			const center = (el: HTMLElement) => {
				const r = el.getBoundingClientRect();
				return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
			};
			return { menu, itemA, itemB, center };
		}

		function press(item: HTMLElement, button = 0) {
			item.dispatchEvent(new PointerEvent('pointerdown', { button, bubbles: true, composed: true }));
		}
		function release(x: number, y: number) {
			document.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true, composed: true, clientX: x, clientY: y }));
		}

		it('selects the item under the release, not the one pressed', async () => {
			const { menu, itemA, itemB, center } = await openTwoItemMenu();
			let aFired = false;
			let bFired = false;
			itemA.addEventListener('select', () => { aFired = true; });
			itemB.addEventListener('select', () => { bFired = true; });

			press(itemA);
			const b = center(itemB);
			release(b.x, b.y);

			expect(bFired).toBe(true);
			expect(aFired).toBe(false);
			cleanup(menu);
		});

		it('does not fire when press and release land on the same item', async () => {
			const { menu, itemA, center } = await openTwoItemMenu();
			let aFired = false;
			itemA.addEventListener('select', () => { aFired = true; });

			press(itemA);
			const a = center(itemA);
			release(a.x, a.y);

			// Same-item release is the no-drag path; the button's own click
			// handler owns it, drag-release stays out of the way.
			expect(aFired).toBe(false);
			cleanup(menu);
		});

		it('does not select a disabled item under the release', async () => {
			const menu = await fixture<HTMLElement>(`
				<nldd-menu>
					<nldd-menu-item text="Alpha"></nldd-menu-item>
					<nldd-menu-item text="Beta" disabled></nldd-menu-item>
				</nldd-menu>
			`);
			await waitForUpdate(menu);
			(menu as HTMLElement & { showPopover: () => void }).showPopover();
			await waitForUpdate(menu);
			const [itemA, itemB] = Array.from(menu.querySelectorAll('nldd-menu-item')) as HTMLElement[];
			let bFired = false;
			itemB.addEventListener('select', () => { bFired = true; });

			itemA.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true, composed: true }));
			const r = itemB.getBoundingClientRect();
			document.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true, composed: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));

			expect(bFired).toBe(false);
			cleanup(menu);
		});

		it('ignores a non-left-button press', async () => {
			const { menu, itemA, itemB, center } = await openTwoItemMenu();
			let bFired = false;
			itemB.addEventListener('select', () => { bFired = true; });

			press(itemA, 2); // right button — no drag tracking starts
			const b = center(itemB);
			release(b.x, b.y);

			expect(bFired).toBe(false);
			cleanup(menu);
		});
	});
});

describe('nldd-menu _menuItemFromPoint', () => {
	let el: HTMLElement;
	const fromPoint = (m: HTMLElement, x: number, y: number) =>
		(m as unknown as { _menuItemFromPoint(x: number, y: number): Element | null })._menuItemFromPoint(x, y);

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('resolves the menu-item under the pointer', async () => {
		el = await fixture('<nldd-menu><nldd-menu-item text="A"></nldd-menu-item></nldd-menu>');
		await waitForUpdate(el);
		const item = el.querySelector('nldd-menu-item')!;
		vi.spyOn(document, 'elementFromPoint').mockReturnValue(item);
		expect(fromPoint(el, 5, 5)).toBe(item);
	});

	it('returns null when nothing is at the point', async () => {
		el = await fixture('<nldd-menu></nldd-menu>');
		await waitForUpdate(el);
		vi.spyOn(document, 'elementFromPoint').mockReturnValue(null);
		expect(fromPoint(el, 0, 0)).toBeNull();
	});

	it('returns null when the element is not a menu-item and has no shadow root', async () => {
		el = await fixture('<nldd-menu></nldd-menu>');
		await waitForUpdate(el);
		vi.spyOn(document, 'elementFromPoint').mockReturnValue(document.createElement('div'));
		expect(fromPoint(el, 0, 0)).toBeNull();
	});
});

describe('nldd-menu-group en nldd-menu-divider onder een universele reset', () => {
	let el: HTMLElement;
	let removeReset: () => void;

	afterEach(() => {
		removeReset();
		if (el) cleanup(el);
	});

	it('behoudt de groepsdivider, marge en padding', async () => {
		removeReset = installUniversalReset();
		// Flex column mimics .menu__list: the host is a flex item, so the
		// wrapper's margin becomes interior space instead of collapsing out.
		el = await fixture(`
			<div style="display: flex; flex-direction: column; --primitives-space-4: 4px; --primitives-space-6: 6px; --semantics-dividers-thickness: 1px; --semantics-dividers-color: black;">
				<span></span>
				<nldd-menu-group text="Thema"></nldd-menu-group>
			</div>
		`);
		const group = el.querySelector('nldd-menu-group') as HTMLElement;
		await waitForUpdate(group);
		const title = group.shadowRoot!.querySelector('.menu__group-title')!;
		// margin (4) + divider (1) + padding-top (6) all survive the reset.
		const offset = title.getBoundingClientRect().top - group.getBoundingClientRect().top;
		expect(offset).toBe(11);
	});

	it('behoudt de ruimte rond de divider', async () => {
		removeReset = installUniversalReset();
		el = await fixture(`
			<div style="--primitives-space-4: 4px;">
				<nldd-menu-divider></nldd-menu-divider>
			</div>
		`);
		const divider = el.querySelector('nldd-menu-divider') as HTMLElement;
		await waitForUpdate(divider);
		// The line's margin stays interior thanks to the flow-root host, even
		// in plain block flow.
		const line = divider.shadowRoot!.querySelector('.menu__divider')!;
		const offset = line.getBoundingClientRect().top - divider.getBoundingClientRect().top;
		expect(offset).toBe(4);
	});
});

describe('nldd-menu anchor popup semantics', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	/** Settle the menu's deferred seed and the anchor's re-render after it. */
	async function settle(button: HTMLElement & { updateComplete?: Promise<boolean> }) {
		await waitForUpdate(button);
		await Promise.resolve();
		await button.updateComplete;
	}

	it('seeds aria-haspopup on a slotted-in anchor before any interaction', async () => {
		el = await fixture(`
			<nldd-button text="Acties">
				<nldd-menu slot="popup">
					<nldd-menu-item text="Bewerken"></nldd-menu-item>
				</nldd-menu>
			</nldd-button>
		`);
		const button = el as HTMLElement & { popupType?: string };
		await settle(button);
		expect(button.popupType).toBe('menu');
		expect(getButton(button).getAttribute('aria-haspopup')).toBe('menu');
		// popupType also drives whether aria-expanded is rendered at all, so a
		// button without `expandable` used to have neither before its first open.
		expect(getButton(button).getAttribute('aria-expanded')).toBe('false');
	});

	it('seeds listbox rather than menu for a listbox variant', async () => {
		el = await fixture(`
			<nldd-button text="Kies">
				<nldd-menu slot="popup" variant="listbox">
					<nldd-menu-item text="Een"></nldd-menu-item>
				</nldd-menu>
			</nldd-button>
		`);
		const button = el as HTMLElement & { popupType?: string };
		await settle(button);
		expect(button.popupType).toBe('listbox');
	});

	it('leaves a popup type the consumer chose alone', async () => {
		el = await fixture(`
			<nldd-button text="Acties" popup-type="dialog">
				<nldd-menu slot="popup">
					<nldd-menu-item text="Bewerken"></nldd-menu-item>
				</nldd-menu>
			</nldd-button>
		`);
		const button = el as HTMLElement & { popupType?: string };
		await settle(button);
		expect(button.popupType).toBe('dialog');
	});

	it('seeds a button reached through the anchor attribute too', async () => {
		// The reason this lives in nldd-menu and not in the button: with
		// `anchor="id"` the button knows nothing about the menu, so only the
		// menu can tell it what kind of popup it opens.
		el = await fixture(`
			<div>
				<nldd-button id="acties-knop" text="Acties"></nldd-button>
				<nldd-menu anchor="acties-knop">
					<nldd-menu-item text="Bewerken"></nldd-menu-item>
				</nldd-menu>
			</div>
		`);
		const button = el.querySelector('nldd-button') as HTMLElement & {
			popupType?: string;
			updateComplete: Promise<boolean>;
		};
		await waitForUpdate(el.querySelector('nldd-menu') as HTMLElement);
		await Promise.resolve();
		await button.updateComplete;
		expect(button.popupType).toBe('menu');
		expect(getButton(button).getAttribute('aria-haspopup')).toBe('menu');
	});

	it('seeds an anchor assigned after the menu first rendered', async () => {
		el = await fixture(`
			<div>
				<nldd-button id="later" text="Acties"></nldd-button>
				<nldd-menu>
					<nldd-menu-item text="Bewerken"></nldd-menu-item>
				</nldd-menu>
			</div>
		`);
		const menu = el.querySelector('nldd-menu') as HTMLElement & {
			anchorElement: Element | null;
			updateComplete: Promise<boolean>;
		};
		const button = el.querySelector('nldd-button') as HTMLElement & {
			popupType?: string;
			updateComplete: Promise<boolean>;
		};
		await waitForUpdate(menu);
		await Promise.resolve();
		expect(button.popupType).toBeFalsy();
		menu.anchorElement = button;
		await menu.updateComplete;
		await button.updateComplete;
		expect(button.popupType).toBe('menu');
	});
	// Something other than the menu can close the popover: a modal dialog empties
	// the top layer. Safari fires no toggle for that, so the menu keeps thinking
	// it is open, the anchor keeps popoverTargetAction on 'hide', and the next
	// click asks to close a popover that is already closed. That is a
	// no-op: een dode knop.
	//
	// A popover's toggle event arrives as its own task, not synchronously. This
	// test grijpt precies dat venster: direct na hidePopover() is de popover
	// closed while the menu has not had its toggle yet. No await between the
	// steps, or that task would repair the state after all.
	it('leidt de ankerstaat af uit de popover zelf, niet uit een toggle die uitbleef', async () => {
		const el = await fixture<HTMLElement>(`
			<div>
				<nldd-button id="anchor-resync" text="Meer"></nldd-button>
				<nldd-menu anchor="anchor-resync">
					<nldd-menu-item text="Een"></nldd-menu-item>
				</nldd-menu>
			</div>
		`);
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		const anchor = el.querySelector('#anchor-resync') as HTMLElement & {
			expanded?: boolean;
			popoverTargetAction?: string;
		};

		menu.showPopover();
		await waitForUpdate(el);
		expect(anchor.expanded).toBe(true);
		expect(anchor.popoverTargetAction).toBe('hide');

		menu.hidePopover();
		expect(menu.matches(':popover-open')).toBe(false);
		// The menu has not had its toggle yet: the anchor still says open.
		expect(anchor.popoverTargetAction).toBe('hide');

		anchor.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		expect(anchor.popoverTargetAction).toBe('show');
		expect(anchor.expanded).toBe(false);
		cleanup(el);
	});
});

describe('nldd-menu check-mark column', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const open = async (menu: HTMLElement) => {
		(menu as HTMLElement & { showPopover(): void }).showPopover();
		await waitForUpdate(menu);
		await Promise.all(Array.from(menu.querySelectorAll('nldd-menu-item'), (item) => (item as unknown as { updateComplete: Promise<unknown> }).updateComplete));
	};
	const checkCell = (item: Element) => item.shadowRoot!.querySelector('nldd-icon-cell[size="24"]');
	const textLeft = (item: Element) => item.shadowRoot!.querySelector('nldd-text-cell')!.getBoundingClientRect().left;

	it('gives every item the column when one is a radio, so the text lines up', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-group text="Taal">
					<nldd-menu-item type="radio" text="Nederlands" selected></nldd-menu-item>
					<nldd-menu-item type="radio" text="English"></nldd-menu-item>
				</nldd-menu-group>
				<nldd-menu-group text="Demo">
					<nldd-menu-item text="Demo resetten"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-menu>
		`);
		await open(el);
		const [nl, en, reset] = Array.from(el.querySelectorAll('nldd-menu-item'));

		expect(checkCell(reset)).not.toBeNull();
		expect(checkCell(reset)!.getAttribute('icon') || null).toBeNull();
		expect(checkCell(nl)!.getAttribute('icon')).toBe('check-mark');
		expect(textLeft(reset)).toBe(textLeft(en));
		// A plain item stays a plain item: no checked state is announced.
		expect(reset.shadowRoot!.querySelector('[aria-checked]')).toBeNull();
	});

	it('leaves the column out of a menu without checkable items', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Bewerk"></nldd-menu-item>
				<nldd-menu-item text="Verwijder"></nldd-menu-item>
			</nldd-menu>
		`);
		await open(el);

		for (const item of el.querySelectorAll('nldd-menu-item')) {
			expect(checkCell(item)).toBeNull();
		}
	});

	it('adds the column when an item becomes a checkbox while the menu is open', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item text="Bewerk"></nldd-menu-item>
				<nldd-menu-item text="Toon zijbalk"></nldd-menu-item>
			</nldd-menu>
		`);
		await open(el);
		const [edit, sidebar] = Array.from(el.querySelectorAll('nldd-menu-item')) as Array<HTMLElement & { type: string; updateComplete: Promise<unknown> }>;
		expect(checkCell(edit)).toBeNull();

		sidebar.type = 'checkbox';
		await sidebar.updateComplete;
		await (edit as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		expect(checkCell(edit)).not.toBeNull();
	});

	it('lets a submenu decide for its own items', async () => {
		el = await fixture(`
			<nldd-menu>
				<nldd-menu-item type="checkbox" text="Toon zijbalk"></nldd-menu-item>
				<nldd-menu-item text="Exporteer">
					<nldd-menu>
						<nldd-menu-item text="Als PDF"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-item>
			</nldd-menu>
		`);
		await open(el);
		const opener = el.querySelectorAll(':scope > nldd-menu-item')[1];
		const nested = el.querySelector('nldd-menu nldd-menu nldd-menu-item')!;

		expect(checkCell(opener)).not.toBeNull();
		expect(checkCell(nested)).toBeNull();
	});
});
