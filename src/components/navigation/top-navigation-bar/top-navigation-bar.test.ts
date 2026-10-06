import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDTopNavigationBar } from './top-navigation-bar.js';
import './top-navigation-bar.js';

function navWithGlobalItems(): string {
	return `
		<nldd-top-navigation-bar website-title="DigID">
			<nldd-menu-bar slot="global">
				<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="About"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Contact"></nldd-menu-bar-item>
			</nldd-menu-bar>
		</nldd-top-navigation-bar>
	`;
}

function navWithUtility(): string {
	return `
		<nldd-top-navigation-bar website-title="DigID">
			<nldd-menu-bar slot="utility">
				<nldd-menu-bar-item text="Zoeken" icon="magnifier"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Account" icon="person" expandable></nldd-menu-bar-item>
			</nldd-menu-bar>
		</nldd-top-navigation-bar>
	`;
}

describe('nldd-top-navigation-bar', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-top-navigation-bar></nldd-top-navigation-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
		expect(el).toBeInstanceOf(customElements.get('nldd-top-navigation-bar'));
	});

	it('width="full" sets no --_max-width inline style', async () => {
		el = await fixture('<nldd-top-navigation-bar width="full"></nldd-top-navigation-bar>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_max-width')).toBe('');
	});

	it('a CSS-length width feeds --_max-width inline', async () => {
		el = await fixture('<nldd-top-navigation-bar width="800px"></nldd-top-navigation-bar>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_max-width')).toBe('800px');
	});

	it('an invalid width sets no --_max-width', async () => {
		el = await fixture('<nldd-top-navigation-bar width="not-a-length"></nldd-top-navigation-bar>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_max-width')).toBe('');
	});

	it('caps each bar to the content width and never overflows (page-section layout)', async () => {
		el = await fixture(navWithGlobalItems());
		await waitForUpdate(el);
		// variables.css tokens are not loaded in the unit-test page; inject the few
		// this layout reads (values mirror variables.css) so the var() lengths resolve.
		el.style.setProperty('--semantics-page-sections-sm-margin-inline', '16px');
		el.style.setProperty('--semantics-page-sections-md-margin-inline', '40px');
		el.style.setProperty('--semantics-page-sections-lg-margin-inline', '56px');
		el.style.setProperty('--semantics-page-sections-body-max-width', '1280px');
		el.style.setProperty('--components-menu-bar-item-inline-padding', '8px');
		const sr = el.shadowRoot!;
		const host = el.getBoundingClientRect();
		const logoBar = sr.querySelector('.top-navigation-bar__logo-bar')!.getBoundingClientRect();
		const mainBar = sr.querySelector('.top-navigation-bar__main-bar')!.getBoundingClientRect();
		// the wrapper inline margin insets every bar from the host edge
		expect(logoBar.left).toBeGreaterThan(host.left);
		expect(logoBar.right).toBeLessThan(host.right);
		// logo bar and main bar cap + center to the same content box
		expect(Math.abs(logoBar.left - mainBar.left)).toBeLessThanOrEqual(1);
		expect(Math.abs(logoBar.right - mainBar.right)).toBeLessThanOrEqual(1);
		// the menu negative inline margin must not force a horizontal scrollbar
		expect(el.scrollWidth).toBeLessThanOrEqual(el.clientWidth + 1);
	});

	it('renders logo by default', async () => {
		el = await fixture('<nldd-top-navigation-bar></nldd-top-navigation-bar>');
		await waitForUpdate(el);
		const logoBar = el.shadowRoot!.querySelector('.top-navigation-bar__logo-bar');
		expect(logoBar).not.toBeNull();
	});

	it('renders utility slot items inside the slotted menu-bar', async () => {
		el = await fixture(navWithUtility());
		await waitForUpdate(el);
		const utilityMenuBar = el.querySelector('nldd-menu-bar[slot="utility"]');
		expect(utilityMenuBar).not.toBeNull();
		expect(utilityMenuBar!.querySelectorAll('nldd-menu-bar-item').length).toBe(2);
	});

	it('renders menu-bar-end for utility slot', async () => {
		el = await fixture(navWithUtility());
		await waitForUpdate(el);
		const menuBarEnd = el.shadowRoot!.querySelector('.top-navigation-bar__menu-bar-end');
		expect(menuBarEnd).not.toBeNull();
	});
});

describe('nldd-top-navigation-bar – menu item selection', () => {
	let el: NLDDTopNavigationBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('deselects other items when one is current', async () => {
		el = await fixture<NLDDTopNavigationBar>(navWithGlobalItems());
		await waitForUpdate(el);

		const items = el.querySelectorAll('nldd-menu-bar[slot="global"] > nldd-menu-bar-item');
		(items[0] as HTMLElement).click();
		await waitForUpdate(el);
		expect(items[0].hasAttribute('current')).toBe(true);

		(items[1] as HTMLElement).click();
		await waitForUpdate(el);
		expect(items[0].hasAttribute('current')).toBe(false);
		expect(items[1].hasAttribute('current')).toBe(true);
	});

	it('dispatches itemselect event on item click', async () => {
		el = await fixture<NLDDTopNavigationBar>(navWithGlobalItems());
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('itemselect', ((e: CustomEvent) => {
			detail = e.detail;
		}) as EventListener);

		const items = el.querySelectorAll('nldd-menu-bar[slot="global"] > nldd-menu-bar-item');
		(items[1] as HTMLElement).click();
		await waitForUpdate(el);

		expect(detail).toBeDefined();
		expect(detail.item).toBe(items[1]);
	});

	it('does not set current when itemselect is prevented', async () => {
		el = await fixture<NLDDTopNavigationBar>(navWithGlobalItems());
		await waitForUpdate(el);

		el.addEventListener('itemselect', ((e: CustomEvent) => {
			e.preventDefault();
		}) as EventListener);

		const items = el.querySelectorAll('nldd-menu-bar[slot="global"] > nldd-menu-bar-item');
		(items[1] as HTMLElement).click();
		await waitForUpdate(el);

		expect(items[1].hasAttribute('current')).toBe(false);
	});
});

describe('nldd-top-navigation-bar – compact breakpoint', () => {
	let el: NLDDTopNavigationBar;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('sets compact on slotted menu-bars at small breakpoint', async () => {
		el = await fixture<NLDDTopNavigationBar>(navWithGlobalItems());
		await waitForUpdate(el);

		// Mock container width below smMax (640px)
		const container = el.shadowRoot!.querySelector('.top-navigation-bar') as HTMLElement;
		vi.spyOn(container, 'clientWidth', 'get').mockReturnValue(400);

		(el as any)._syncCompactAttribute();
		await waitForUpdate(el);

		const menuBars = el.querySelectorAll('nldd-menu-bar');
		expect(menuBars.length).toBeGreaterThan(0);
		for (const bar of menuBars) {
			expect(bar.hasAttribute('compact')).toBe(true);
		}
	});

	it('removes compact from slotted menu-bars above small breakpoint', async () => {
		el = await fixture<NLDDTopNavigationBar>(navWithGlobalItems());
		await waitForUpdate(el);

		const container = el.shadowRoot!.querySelector('.top-navigation-bar') as HTMLElement;
		vi.spyOn(container, 'clientWidth', 'get').mockReturnValue(900);

		(el as any)._syncCompactAttribute();
		await waitForUpdate(el);

		const menuBars = el.querySelectorAll('nldd-menu-bar');
		expect(menuBars.length).toBeGreaterThan(0);
		for (const bar of menuBars) {
			expect(bar.hasAttribute('compact')).toBe(false);
		}
	});
});

describe('nldd-top-navigation-bar – menu sheet async guards', () => {
	let el: NLDDTopNavigationBar;

	afterEach(() => {
		if (el) cleanup(el);
		document.querySelectorAll('nldd-sheet').forEach(s => s.remove());
	});

	it('does not create sheet after disconnect during async load', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar website-title="Test">
				<nldd-menu-bar slot="global">
					<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>
				</nldd-menu-bar>
			</nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);

		// Trigger menu button click (starts async load)
		const menuButton = el.shadowRoot!.querySelector('.top-navigation-bar__menu-button nldd-menu-bar-item') as HTMLElement;
		if (menuButton) {
			const clickPromise = (el as any)._onMenuButtonClick();
			// Disconnect before load resolves
			cleanup(el);
			el = null as any;
			await clickPromise.catch(() => {});
			// Sheet should not be appended to body
			expect(document.querySelector('nldd-sheet')).toBeNull();
		}
	});
});

describe('nldd-top-navigation-bar – menu sheet items', () => {
	let el: NLDDTopNavigationBar;

	afterEach(() => {
		if (el) cleanup(el);
		document.querySelectorAll('nldd-sheet').forEach(s => s.remove());
	});

	it('renders non-link items as real buttons and link items as anchors', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar website-title="Test">
				<nldd-menu-bar slot="global">
					<nldd-menu-bar-item text="Home" href="/home"></nldd-menu-bar-item>
					<nldd-menu-bar-item text="Zoeken"></nldd-menu-bar-item>
				</nldd-menu-bar>
			</nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);

		// Opens the sheet (loads deps) and syncs the list items into it.
		await (el as any)._onMenuButtonClick();
		const list = (el as any)._globalMenuSheetList as HTMLElement;
		const listItems = Array.from(list.querySelectorAll('nldd-list-item')) as HTMLElement[];
		expect(listItems.length).toBe(2);
		await Promise.all(listItems.map(li => (li as any).updateComplete));

		const [linkItem, buttonItem] = listItems;

		// Link item → anchor, no bogus type attribute
		expect(linkItem.getAttribute('href')).toBe('/home');
		expect(linkItem.getAttribute('type')).toBeNull();
		expect(linkItem.shadowRoot!.querySelector('a.list-item__action')).not.toBeNull();

		// Non-link item → real <button type="button">, opted in via `button`
		expect(buttonItem.hasAttribute('button')).toBe(true);
		expect(buttonItem.getAttribute('type')).toBeNull();
		const btn = buttonItem.shadowRoot!.querySelector('button.list-item__action') as HTMLButtonElement;
		expect(btn).not.toBeNull();
		expect(btn.getAttribute('type')).toBe('button');
	});
});

describe('nldd-top-navigation-bar – menu sheet drill-down', () => {
	let el: NLDDTopNavigationBar;

	afterEach(() => {
		if (el) cleanup(el);
		document.querySelectorAll('nldd-sheet').forEach(s => s.remove());
	});

	const drillFixture = `
		<nldd-top-navigation-bar website-title="Test">
			<nldd-menu-bar slot="global">
				<nldd-menu-bar-item text="Home" href="/home"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Onderwerpen" expandable>
					<nldd-menu>
						<nldd-menu-item text="Zorg"></nldd-menu-item>
						<nldd-menu-item text="Wonen"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-bar-item>
			</nldd-menu-bar>
		</nldd-top-navigation-bar>
	`;

	async function openSheet(host: NLDDTopNavigationBar): Promise<HTMLElement> {
		// Call the menu-button handler directly rather than dispatching a DOM
		// click: it's async (it lazy-loads the sheet's dependencies) and returns a
		// promise we can await; a synthetic click gives no handle to await on.
		await (host as any)._onMenuButtonClick();
		const list = (host as any)._globalMenuSheetList as HTMLElement;
		await Promise.all(
			Array.from(list.querySelectorAll('nldd-list-item')).map(li => (li as any).updateComplete),
		);
		return list;
	}

	const labels = (list: HTMLElement): (string | null | undefined)[] =>
		Array.from(list.querySelectorAll('nldd-list-item'))
			.map(r => r.querySelector('nldd-text-cell')?.getAttribute('text'));

	it('shows a chevron on parent rows, drills into the submenu, and walks back', async () => {
		el = await fixture<NLDDTopNavigationBar>(drillFixture);
		await waitForUpdate(el);
		const list = await openSheet(el);
		const titleBar = (el as any)._globalMenuSheetTitleBar as HTMLElement;
		expect(titleBar).not.toBeNull();

		// Root: a link row + a submenu row with a chevron, no back button.
		expect(labels(list)).toEqual(['Home', 'Onderwerpen']);
		expect(titleBar.getAttribute('text')).toBe('Menu');
		expect(titleBar.hasAttribute('back-text')).toBe(false);
		const parentRow = list.querySelectorAll('nldd-list-item')[1] as HTMLElement;
		expect(parentRow.hasAttribute('button')).toBe(true);
		expect(parentRow.querySelector('nldd-icon-cell')?.getAttribute('icon')).toBe('chevron-right-small');

		// Drill in → submenu items, title becomes the parent, back points home.
		parentRow.shadowRoot!.querySelector<HTMLButtonElement>('button.list-item__action')!.click();
		await waitForUpdate(el);
		expect(labels(list)).toEqual(['Zorg', 'Wonen']);
		expect(titleBar.getAttribute('text')).toBe('Onderwerpen');
		expect(titleBar.getAttribute('back-text')).toBe('Menu');

		// Back → root again.
		titleBar.dispatchEvent(new CustomEvent('back', { bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(labels(list)).toEqual(['Home', 'Onderwerpen']);
		expect(titleBar.hasAttribute('back-text')).toBe(false);
	});

	it('returns focus to the opener row when walking back (APG)', async () => {
		el = await fixture<NLDDTopNavigationBar>(drillFixture);
		await waitForUpdate(el);
		const list = await openSheet(el);
		// Drill into "Onderwerpen" (the second row).
		(list.querySelectorAll('nldd-list-item')[1] as HTMLElement)
			.shadowRoot!.querySelector<HTMLButtonElement>('button.list-item__action')!.click();
		await waitForUpdate(el);
		// Walk back to the root level.
		const titleBar = (el as any)._globalMenuSheetTitleBar as HTMLElement;
		expect(titleBar).not.toBeNull();
		titleBar.dispatchEvent(new CustomEvent('back', { bubbles: true, composed: true }));
		await waitForUpdate(el);
		await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
		// Focus lands on the "Onderwerpen" opener row, not the first ("Home") row.
		const rows = Array.from(list.querySelectorAll('nldd-list-item')) as HTMLElement[];
		expect(rows[1].matches(':focus-within')).toBe(true);
		expect(rows[0].matches(':focus-within')).toBe(false);
	});

	it('forwards a submenu leaf selection (without throwing on the closed popover)', async () => {
		el = await fixture<NLDDTopNavigationBar>(drillFixture);
		await waitForUpdate(el);
		const list = await openSheet(el);

		(list.querySelectorAll('nldd-list-item')[1] as HTMLElement)
			.shadowRoot!.querySelector<HTMLButtonElement>('button.list-item__action')!.click();
		await waitForUpdate(el);

		const zorgItem = el.querySelector('nldd-menu-item')!; // first submenu item
		let selected = false;
		zorgItem.addEventListener('select', () => { selected = true; });

		const zorgRow = list.querySelectorAll('nldd-list-item')[0] as HTMLElement;
		await (zorgRow as any).updateComplete;
		zorgRow.shadowRoot!.querySelector<HTMLButtonElement>('button.list-item__action')!.click();

		expect(selected).toBe(true);
	});
});

describe('nldd-top-navigation-bar – back button', () => {
	let el: NLDDTopNavigationBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders back button when back-text="Terug" is set', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar back-text="Terug"></nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);
		const backBtn = el.shadowRoot!.querySelector('nldd-menu-bar-item[icon="chevron-left"]');
		expect(backBtn).not.toBeNull();
	});

	it('dispatches back-click when back button without href is clicked', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar back-text="Terug"></nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);

		let fired = false;
		el.addEventListener('back-click', () => { fired = true; });

		const backBtn = el.shadowRoot!.querySelector('nldd-menu-bar-item[icon="chevron-left"]') as HTMLElement;
		backBtn?.click();
		expect(fired).toBe(true);
	});

	it('renders back button with href when back-href is set', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar back-href="/home" back-text="Home"></nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);
		const backItem = el.shadowRoot!.querySelector('nldd-menu-bar-item[icon="chevron-left"]') as HTMLElement;
		expect(backItem).not.toBeNull();
		expect(backItem.getAttribute('href')).toBe('/home');
	});
});

describe('nldd-top-navigation-bar – href sanitization', () => {
	let el: NLDDTopNavigationBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders logo as non-link when logo-href is a javascript: URI', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar logo-href="javascript:alert(1)"></nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a.top-navigation-bar__logo');
		expect(link).toBeNull();
	});

	it('renders title as non-link when website-href is a javascript: URI', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar website-title="Test" website-href="javascript:void(0)"></nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a.top-navigation-bar__website-title');
		expect(link).toBeNull();
	});

	it('renders logo link with safe href and aria-label', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar logo-href="/"></nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a.top-navigation-bar__logo');
		expect(link).not.toBeNull();
		expect(link!.getAttribute('href')).toBe('/');
		expect(link!.getAttribute('aria-label')).toBeTruthy();
	});

	it('renders logo+wordmark as combined link when both logo-title and logo-href are set', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar logo-title="DigID" logo-href="/"></nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a.top-navigation-bar__logo-and-wordmark');
		expect(link).not.toBeNull();
		expect(link!.getAttribute('href')).toBe('/');
		const logo = link!.querySelector('.top-navigation-bar__logo');
		expect(logo!.getAttribute('aria-hidden')).toBe('true');
		const wordmark = link!.querySelector('.top-navigation-bar__wordmark-title');
		expect(wordmark!.textContent!.trim()).toBe('DigID');
	});

	it('renders logo+wordmark as non-link when logo-href is a javascript: URI', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar logo-title="DigID" logo-href="javascript:alert(1)"></nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a.top-navigation-bar__logo-and-wordmark');
		expect(link).toBeNull();
	});
});

describe('nldd-top-navigation-bar – i18n', () => {
	let el: NLDDTopNavigationBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('applies default Dutch accessible-label to slotted global menu-bar', async () => {
		el = await fixture<NLDDTopNavigationBar>(navWithGlobalItems());
		await waitForUpdate(el);
		const menuBar = el.querySelector('nldd-menu-bar[slot="global"]')!;
		expect(menuBar.getAttribute('accessible-label')).toBe('Hoofdnavigatie');
	});

	it('does not override consumer-provided accessible-label on slotted menu-bar', async () => {
		el = await fixture<NLDDTopNavigationBar>(`
			<nldd-top-navigation-bar>
				<nldd-menu-bar slot="global" accessible-label="Custom label">
					<nldd-menu-bar-item text="Home"></nldd-menu-bar-item>
				</nldd-menu-bar>
			</nldd-top-navigation-bar>
		`);
		await waitForUpdate(el);
		const menuBar = el.querySelector('nldd-menu-bar[slot="global"]')!;
		expect(menuBar.getAttribute('accessible-label')).toBe('Custom label');
	});

	it('applies custom translations to slotted menu-bar', async () => {
		el = await fixture<NLDDTopNavigationBar>(navWithGlobalItems());
		await waitForUpdate(el);
		(el as NLDDTopNavigationBar).translations = {
			'components.top-navigation-bar.global-menu-bar-label': 'Main navigation',
		};
		await waitForUpdate(el);
		const menuBar = el.querySelector('nldd-menu-bar[slot="global"]')!;
		expect(menuBar.getAttribute('accessible-label')).toBe('Main navigation');
	});
});

// Beside the ribbon on a narrow screen the wordmark is centred against it, and
// only what does not fit grows downward: centring a taller wordmark would push
// its first line off the top of the viewport, where the ribbon starts.
describe('nldd-top-navigation-bar – wordmark beside the ribbon', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const tokens = '--semantics-brand-ribbon-sm-width: 40px; --semantics-brand-ribbon-lg-width: 48px; --primitives-space-12: 12px;';

	const mount = async (width: string, attrs: string) => {
		el = await fixture(
			`<div style="width: ${width}; ${tokens}">`
			+ `<nldd-top-navigation-bar ${attrs.includes('logo-title') ? '' : 'logo-title="Nederlandse Digitale Dienst"'} ${attrs}></nldd-top-navigation-bar></div>`,
		);
		const bar = el.querySelector('nldd-top-navigation-bar') as NLDDTopNavigationBar;
		await waitForUpdate(bar);
		const q = (selector: string) => bar.shadowRoot!.querySelector(selector)!.getBoundingClientRect();
		return { bar, logo: q('.top-navigation-bar__logo'), content: q('.top-navigation-bar__wordmark-content') };
	};

	it('centres a wordmark that fits against the ribbon', async () => {
		const { logo, content } = await mount('375px', '');
		const midden = (r: DOMRect) => r.top + r.height / 2;
		expect(content.height).toBeLessThan(logo.height);
		expect(Math.abs(midden(content) - midden(logo))).toBeLessThan(1);
	});

	it('keeps 12px from the top and grows downward when it does not fit', async () => {
		const { logo, content } = await mount(
			'375px',
			'logo-subtitle="Ministerie van Economische Zaken en Klimaat" logo-supporting-text1="Directie Digitale Overheid"',
		);
		expect(content.height).toBeGreaterThan(logo.height);
		expect(Math.round(content.top - logo.top)).toBe(12);
	});

	// Room under the text would raise the whole bar for nothing.
	it('leaves no room under the text it grew for', async () => {
		const { bar, content } = await mount(
			'375px',
			'logo-subtitle="Ministerie van Economische Zaken en Klimaat" logo-supporting-text1="Directie Digitale Overheid"',
		);
		const wordmark = bar.shadowRoot!.querySelector('.top-navigation-bar__wordmark')!.getBoundingClientRect();
		expect(Math.round(wordmark.bottom)).toBe(Math.round(content.bottom));
	});

	// A grid item is at least as wide as its longest word, and the wordmark sits
	// in one of the two tracks that keep the ribbon centred. One long name used
	// to shove the ribbon 137px off centre and the page 43px past the screen.
	it('breaks a long word rather than pushing the ribbon off centre', async () => {
		const { bar, logo } = await mount('375px', 'logo-title="Rijksinstituutvoorvolksgezondheidenmilieuhygiene"');
		const wrapper = el.getBoundingClientRect();
		const midden = (r: DOMRect) => r.left + r.width / 2;

		expect(Math.abs(midden(logo) - midden(wrapper))).toBeLessThan(1);
		expect(el.scrollWidth).toBeLessThanOrEqual(el.clientWidth);

		// It wrapped instead. Measured against a short title in the same run,
		// because the test browser has no RijksSans and lines it differently.
		const lang = bar.shadowRoot!.querySelector('.top-navigation-bar__wordmark-title')!.getBoundingClientRect();
		cleanup(el);
		const kort = await mount('375px', 'logo-title="Dienst"');
		const kortTitle = kort.bar.shadowRoot!.querySelector('.top-navigation-bar__wordmark-title')!.getBoundingClientRect();
		expect(lang.height).toBeGreaterThan(kortTitle.height * 1.5);
	});

	// The ribbon width is declared per breakpoint on the block, not inside the
	// logo: a wordmark that measures itself against the ribbon read the sm width
	// at every size, so on lg it reserved 80px beside a 96px ribbon.
	it('measures the wordmark against the ribbon of the breakpoint it is in', async () => {
		const { bar } = await mount('1200px', '');
		const shadow = bar.shadowRoot!;
		const wordmark = getComputedStyle(shadow.querySelector('.top-navigation-bar__wordmark')!);
		const logo = getComputedStyle(shadow.querySelector('.top-navigation-bar__logo')!);
		expect(wordmark.minHeight).toBe(logo.height);
		expect(logo.height).toBe('96px');
	});
});

// Pulling the page down shows the ribbon carrying on above it. It has to end
// at the top of the page: ending right above the logo put it over a status bar
// that sits above the navigation bar.
describe('nldd-top-navigation-bar ribbon above the page', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('ends at the top of the page, also with a bar above it', async () => {
		window.scrollTo(0, 0);
		el = await fixture(`
			<div>
				<div style="height: 24px;"></div>
				<nldd-top-navigation-bar></nldd-top-navigation-bar>
			</div>
		`);
		const bar = el.querySelector('nldd-top-navigation-bar')!;
		await waitForUpdate(bar);
		const logo = bar.shadowRoot!.querySelector('.top-navigation-bar__logo')!;
		const logoTop = logo.getBoundingClientRect().top + window.scrollY;
		expect(logoTop).toBeGreaterThanOrEqual(24);
		expect(bar.style.getPropertyValue('--_logo-offset')).toBe(`${Math.round(logoTop)}px`);
	});

	// Chrome paints nothing above the page, so only the fixed piece would show
	// and a hard pull would open a gap between it and the logo.
	it('is not drawn outside WebKit', async () => {
		el = await fixture(`<nldd-top-navigation-bar></nldd-top-navigation-bar>`);
		const logo = el.shadowRoot!.querySelector('.top-navigation-bar__logo')!;
		expect(getComputedStyle(logo, '::before').content).toBe('none');
		expect(getComputedStyle(logo, '::after').content).toBe('none');
	});
});
