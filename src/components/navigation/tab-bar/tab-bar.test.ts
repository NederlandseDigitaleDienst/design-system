import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDTabBar, NLDDTabBarItem } from './tab-bar.js';
import './tab-bar.js';

function threeTabBar(): string {
	return `
		<nldd-tab-bar>
			<nldd-tab-bar-item text="Tab A"></nldd-tab-bar-item>
			<nldd-tab-bar-item current text="Tab B"></nldd-tab-bar-item>
			<nldd-tab-bar-item text="Tab C"></nldd-tab-bar-item>
		</nldd-tab-bar>
	`;
}

function getItems(el: NLDDTabBar): NLDDTabBarItem[] {
	return Array.from(el.querySelectorAll('nldd-tab-bar-item'));
}

function clickInner(item: Element) {
	const inner = item.shadowRoot!.querySelector('[role="tab"]') as HTMLElement;
	inner.click();
}

function pressKey(target: Element, key: string) {
	target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
}


/* ============================================================
   nldd-tab-bar-item – render
   ============================================================ */

describe('nldd-tab-bar-item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-tab-bar-item></nldd-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a button by default', async () => {
		el = await fixture('<nldd-tab-bar-item text="Tab"></nldd-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="tab"]')!.tagName.toLowerCase()).toBe('button');
	});

	it('renders an anchor when href is provided', async () => {
		el = await fixture('<nldd-tab-bar-item href="/page">Tab</nldd-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="tab"]')!.tagName.toLowerCase()).toBe('a');
	});

	it('does not render an anchor for unsafe hrefs', async () => {
		el = await fixture('<nldd-tab-bar-item href="javascript:void(0)">Tab</nldd-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="tab"]')!.tagName.toLowerCase()).toBe('button');
	});
});


/* ============================================================
   nldd-tab-bar-item – content variant detection
   ============================================================ */

describe('nldd-tab-bar-item – content variant detection', () => {
	let el: NLDDTabBarItem;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('sets variant to icon-and-text when both text and icon are present', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item text="Tab">
				<svg slot="icon"></svg>
			</nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('icon-and-text');
	});

	it('sets variant to text when only text attribute is present', async () => {
		el = await fixture<NLDDTabBarItem>('<nldd-tab-bar-item text="Tab"></nldd-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('text');
	});

	it('sets variant to icon when only an icon slot is filled', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item>
				<svg slot="icon"></svg>
			</nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('icon');
	});

	it('respects explicit variant="text" even when both text and icon are present', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item variant="text" text="Tab">
				<svg slot="icon"></svg>
			</nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('text');
	});

	it('respects explicit variant="icon" even when both text and icon are present', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item variant="icon" text="Tab">
				<svg slot="icon"></svg>
			</nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('icon');
	});

	it('reflects size="lg" and resolves a variant attribute that drives the lg layout', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item size="lg" text="Tab" icon="home"></nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('lg');
		expect(el.getAttribute('variant')).toBe('icon-and-text');
	});

	it('keeps both icon and text visible at size="lg" with variant="icon-and-text"', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item size="lg" variant="icon-and-text" text="Tab" icon="home"></nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		const iconEl = el.shadowRoot!.querySelector('.tab-bar__item-icon')!;
		const textEl = el.shadowRoot!.querySelector('.tab-bar__item-text')!;
		expect(getComputedStyle(iconEl).display).not.toBe('none');
		expect(getComputedStyle(textEl).display).not.toBe('none');
	});

	it('keeps the item text on one line and truncates it with an ellipsis', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item variant="text" text="Een lange tablabel die niet in de balk past"></nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		const cs = getComputedStyle(el.shadowRoot!.querySelector('.tab-bar__item-text')!);
		expect(cs.whiteSpace).toBe('nowrap');
		expect(cs.textOverflow).toBe('ellipsis');
	});

	it('caps the bar at its container and truncates only the overflowing tab', async () => {
		// Real layout assertion in a narrow container: the bar must not exceed it,
		// the long tab truncates, and short tabs keep their own (content) width
		// instead of all shrinking proportionally (the grid-track behavior).
		const host = document.createElement('div');
		host.style.width = '320px';
		document.body.appendChild(host);
		host.innerHTML = `
			<nldd-tab-bar variant="text">
				<nldd-tab-bar-item text="Home" current></nldd-tab-bar-item>
				<nldd-tab-bar-item text="Profiel"></nldd-tab-bar-item>
				<nldd-tab-bar-item text="Een hele lange tablabel die echt niet in deze smalle balk past"></nldd-tab-bar-item>
			</nldd-tab-bar>`;
		const bar = host.querySelector('nldd-tab-bar') as HTMLElement & { updateComplete: Promise<boolean> };
		const items = [...host.querySelectorAll('nldd-tab-bar-item')] as (HTMLElement & { updateComplete: Promise<boolean> })[];
		await bar.updateComplete;
		await Promise.all(items.map(i => i.updateComplete));
		await new Promise(r => setTimeout(r, 0));

		const textOf = (item: Element) => item.shadowRoot!.querySelector('.tab-bar__item-text') as HTMLElement;
		expect(bar.getBoundingClientRect().width).toBeLessThanOrEqual(321);
		// Overflowing tab: rendered text is clipped.
		const long = textOf(items[2]);
		expect(long.scrollWidth).toBeGreaterThan(long.clientWidth);
		// Short tab keeps its content width: its text is not clipped.
		const home = textOf(items[0]);
		expect(home.scrollWidth).toBeLessThanOrEqual(home.clientWidth + 1);

		host.remove();
	});

	it('hides the icon at size="lg" with variant="text"', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item size="lg" variant="text" text="Tab" icon="home"></nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		const iconEl = el.shadowRoot!.querySelector('.tab-bar__item-icon')!;
		const textEl = el.shadowRoot!.querySelector('.tab-bar__item-text')!;
		expect(getComputedStyle(iconEl).display).toBe('none');
		expect(getComputedStyle(textEl).display).not.toBe('none');
	});

	it('hides the text at size="lg" with variant="icon"', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item size="lg" variant="icon" text="Tab" icon="home"></nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		const iconEl = el.shadowRoot!.querySelector('.tab-bar__item-icon')!;
		const textEl = el.shadowRoot!.querySelector('.tab-bar__item-text')!;
		expect(getComputedStyle(textEl).display).toBe('none');
		expect(getComputedStyle(iconEl).display).not.toBe('none');
	});

	it('uses the icon attribute for variant detection (icon-and-text)', async () => {
		el = await fixture<NLDDTabBarItem>('<nldd-tab-bar-item text="Home" icon="house"></nldd-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('icon-and-text');
	});

	it('renders nldd-icon when icon attribute is set (no slot fallback)', async () => {
		el = await fixture<NLDDTabBarItem>('<nldd-tab-bar-item text="Home" icon="house"></nldd-tab-bar-item>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.tab-bar__item-icon nldd-icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('icon')).toBe('house');
		expect(el.shadowRoot!.querySelector('.tab-bar__item-icon slot')).toBeNull();
	});

	it('variant="icon-and-text" with text but no icon shows the placeholder', async () => {
		el = await fixture<NLDDTabBarItem>('<nldd-tab-bar-item variant="icon-and-text" text="Home"></nldd-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon[icon="icon-placeholder"]')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.tab-bar__item-text')!.textContent?.trim()).toBe('Home');
	});

	it('variant="text" without an icon shows no placeholder', async () => {
		el = await fixture<NLDDTabBarItem>('<nldd-tab-bar-item variant="text" text="Home"></nldd-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon[icon="icon-placeholder"]')).toBeNull();
	});
});


/* ============================================================
   nldd-tab-bar-item – icon variant accessibility
   ============================================================ */

describe('nldd-tab-bar-item – icon variant accessibility', () => {
	let el: NLDDTabBarItem;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('sets aria-label from text attribute when variant is icon', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item variant="icon" text="Home">
				<svg slot="icon"></svg>
			</nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="tab"]')!.getAttribute('aria-label')).toBe('Home');
	});

	it('wraps in nldd-tooltip when variant is icon', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item variant="icon" text="Home">
				<svg slot="icon"></svg>
			</nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip');
		expect(tooltip).not.toBeNull();
		expect(tooltip!.getAttribute('text')).toBe('Home');
	});

	it('does not set aria-label when variant is icon-and-text', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item text="Home">
				<svg slot="icon"></svg>
			</nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="tab"]')!.getAttribute('aria-label')).toBeNull();
	});

	it('does not wrap in nldd-tooltip when variant is text', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item variant="text" text="Home">
				<svg slot="icon"></svg>
			</nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-tooltip')).toBeNull();
	});

	it('applies icon-only affordances at size="lg" with variant="icon"', async () => {
		el = await fixture<NLDDTabBarItem>(`
			<nldd-tab-bar-item size="lg" variant="icon" text="Home">
				<svg slot="icon"></svg>
			</nldd-tab-bar-item>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="tab"]')!.getAttribute('aria-label')).toBe('Home');
		expect(el.shadowRoot!.querySelector('nldd-tooltip')!.getAttribute('text')).toBe('Home');
	});
});


/* ============================================================
   nldd-tab-bar-item – events
   ============================================================ */

describe('nldd-tab-bar-item – events', () => {
	let el: NLDDTabBarItem;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('fires select event on click', async () => {
		el = await fixture<NLDDTabBarItem>('<nldd-tab-bar-item text="Tab"></nldd-tab-bar-item>');
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('select', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

		el.shadowRoot!.querySelector('[role="tab"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

		expect(detail).toBeDefined();
		expect(detail.item).toBe(el);
	});

	it('does not mark itself current after click', async () => {
		el = await fixture<NLDDTabBarItem>('<nldd-tab-bar-item text="Tab"></nldd-tab-bar-item>');
		await waitForUpdate(el);

		el.shadowRoot!.querySelector('[role="tab"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
		await waitForUpdate(el);

		expect(el.current).toBe(false);
	});
});


/* ============================================================
   nldd-tab-bar – render & ARIA
   ============================================================ */

describe('nldd-tab-bar', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-tab-bar></nldd-tab-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a div container by default (not nav)', async () => {
		el = await fixture(threeTabBar());
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.tab-bar')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('nav')).toBeNull();
	});

	it('sets role="tablist" on tab-bar__items', async () => {
		el = await fixture(threeTabBar());
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.tab-bar__items')!.getAttribute('role')).toBe('tablist');
	});

	it('does not set role on host', async () => {
		el = await fixture(threeTabBar());
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBeNull();
	});
});


/* ============================================================
   nldd-tab-bar – accessible label
   ============================================================ */

describe('nldd-tab-bar – accessible label', () => {
	let el: NLDDTabBar;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('falls back to "Tabs" when no accessible-label is provided', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDTabBar>('<nldd-tab-bar></nldd-tab-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.tab-bar__items')!.getAttribute('aria-label')).toBe('Tabs');
	});

	it('warns once when no accessible-label is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDTabBar>('<nldd-tab-bar></nldd-tab-bar>');
		await waitForUpdate(el);
		expect(warnSpy).toHaveBeenCalledOnce();
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('accessible-label'));
	});

	it('does not warn when accessible-label is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDTabBar>('<nldd-tab-bar accessible-label="Navigatie"></nldd-tab-bar>');
		await waitForUpdate(el);
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it('forwards accessible-label to the tablist aria-label', async () => {
		el = await fixture<NLDDTabBar>('<nldd-tab-bar accessible-label="Hoofdnavigatie"></nldd-tab-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.tab-bar__items')!.getAttribute('aria-label')).toBe('Hoofdnavigatie');
	});
});


/* ============================================================
   nldd-tab-bar – item selection
   ============================================================ */

describe('nldd-tab-bar – item selection', () => {
	let el: NLDDTabBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('clears current on the other items', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		expect(items[1].hasAttribute('current')).toBe(true);

		clickInner(items[2]);
		await waitForUpdate(el);

		expect(items[1].hasAttribute('current')).toBe(false);
		expect(items[2].hasAttribute('current')).toBe(true);
	});

	it('dispatches tabchange event with item detail', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('tabchange', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

		clickInner(getItems(el)[0]);
		await waitForUpdate(el);

		expect(detail).toBeDefined();
		expect(detail.item).toBe(getItems(el)[0]);
	});

	it('select event does not bubble past the tab bar', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);

		let selectBubbled = false;
		document.addEventListener('select', () => { selectBubbled = true; }, { once: true });

		clickInner(getItems(el)[0]);
		await waitForUpdate(el);

		expect(selectBubbled).toBe(false);
	});
});


/* ============================================================
   nldd-tab-bar – variant propagation
   ============================================================ */

describe('nldd-tab-bar – variant propagation', () => {
	let el: NLDDTabBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('propagates variant="text" to all items as default', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar variant="text">
				<nldd-tab-bar-item><svg slot="icon"></svg>Home</nldd-tab-bar-item>
				<nldd-tab-bar-item><svg slot="icon"></svg>Zoeken</nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		getItems(el).forEach(item => {
			expect(item.getAttribute('variant')).toBe('text');
		});
	});

	it('propagates variant="icon" to all items as default', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar variant="icon">
				<nldd-tab-bar-item><svg slot="icon"></svg>Home</nldd-tab-bar-item>
				<nldd-tab-bar-item><svg slot="icon"></svg>Zoeken</nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		getItems(el).forEach(item => {
			expect(item.getAttribute('variant')).toBe('icon');
		});
	});

	it('item-level variant overrides parent variant', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar variant="text">
				<nldd-tab-bar-item><svg slot="icon"></svg>Home</nldd-tab-bar-item>
				<nldd-tab-bar-item variant="icon"><svg slot="icon"></svg>Zoeken</nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		expect(items[0].getAttribute('variant')).toBe('text');
		expect(items[1].getAttribute('variant')).toBe('icon');
	});

	it('parent size="lg" propagates to items', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar size="lg">
				<nldd-tab-bar-item><svg slot="icon"></svg>Home</nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		expect(getItems(el)[0].getAttribute('size')).toBe('lg');
	});

	it('parent size overrides a size set on the item (no per-item override)', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar size="lg">
				<nldd-tab-bar-item size="md"><svg slot="icon"></svg>Home</nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		expect(getItems(el)[0].getAttribute('size')).toBe('lg');
	});

	it('resets item size to md when the parent size changes back', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar size="lg">
				<nldd-tab-bar-item text="Home" icon="home"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		expect(getItems(el)[0].getAttribute('size')).toBe('lg');
		el.size = 'md';
		await waitForUpdate(el);
		// md is the default, so it is kept out of the DOM; the property is the source of truth.
		expect((getItems(el)[0] as unknown as { size: string }).size).toBe('md');
		expect(getItems(el)[0].hasAttribute('size')).toBe(false);
	});
});


/* ============================================================
   nldd-tab-bar – centered
   ============================================================ */

describe('nldd-tab-bar – centered', () => {
	let el: NLDDTabBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('reflects centered attribute on host', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar centered>
				<nldd-tab-bar-item text="Home"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		expect(el.hasAttribute('centered')).toBe(true);
	});
});


/* ============================================================
   nldd-tab-bar – keyboard navigation
   ============================================================ */

describe('nldd-tab-bar – keyboard navigation', () => {
	let el: NLDDTabBar;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('first enabled item has tabindex="0" when no tab is current', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar>
				<nldd-tab-bar-item text="A"></nldd-tab-bar-item>
				<nldd-tab-bar-item text="B"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		const innerA = items[0].shadowRoot!.querySelector('[role="tab"]')!;
		const innerB = items[1].shadowRoot!.querySelector('[role="tab"]')!;
		expect(innerA.getAttribute('tabindex')).toBe('0');
		expect(innerB.getAttribute('tabindex')).toBe('-1');
	});

	it('the current tab has tabindex="0"', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		const inner = items[1].shadowRoot!.querySelector('[role="tab"]')!;
		expect(inner.getAttribute('tabindex')).toBe('0');
	});

	it('the tabs that are not current have tabindex="-1"', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		const innerA = items[0].shadowRoot!.querySelector('[role="tab"]')!;
		const innerC = items[2].shadowRoot!.querySelector('[role="tab"]')!;
		expect(innerA.getAttribute('tabindex')).toBe('-1');
		expect(innerC.getAttribute('tabindex')).toBe('-1');
	});

	it('ArrowRight auto-activates next tab', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		pressKey(items[1], 'ArrowRight');
		await waitForUpdate(el);
		expect(items[2].current).toBe(true);
		expect(items[1].current).toBe(false);
	});

	it('ArrowLeft auto-activates previous tab', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		pressKey(items[1], 'ArrowLeft');
		await waitForUpdate(el);
		expect(items[0].current).toBe(true);
		expect(items[1].current).toBe(false);
	});

	it('ArrowRight calls focus on next item', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[1] as HTMLElement, 'focus');
		pressKey(items[0], 'ArrowRight');
		expect(spy).toHaveBeenCalled();
	});

	it('ArrowLeft calls focus on previous item', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[0] as HTMLElement, 'focus');
		pressKey(items[1], 'ArrowLeft');
		expect(spy).toHaveBeenCalled();
	});

	it('ArrowRight wraps from last to first', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[0] as HTMLElement, 'focus');
		pressKey(items[2], 'ArrowRight');
		expect(spy).toHaveBeenCalled();
	});

	it('ArrowLeft wraps from first to last', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[2] as HTMLElement, 'focus');
		pressKey(items[0], 'ArrowLeft');
		expect(spy).toHaveBeenCalled();
	});

	it('Home calls focus on first item', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[0] as HTMLElement, 'focus');
		pressKey(items[2], 'Home');
		expect(spy).toHaveBeenCalled();
	});

	it('End calls focus on last item', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[2] as HTMLElement, 'focus');
		pressKey(items[0], 'End');
		expect(spy).toHaveBeenCalled();
	});

});


/* ============================================================
   nldd-tab-bar – disabled
   ============================================================ */

describe('nldd-tab-bar – disabled', () => {
	let el: NLDDTabBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	function innerTab(item: NLDDTabBarItem): HTMLElement {
		return item.shadowRoot!.querySelector('[role="tab"]') as HTMLElement;
	}

	it('reflects the disabled attribute on the host', async () => {
		el = await fixture<NLDDTabBar>(threeTabBar());
		await waitForUpdate(el);
		expect(el.hasAttribute('disabled')).toBe(false);

		el.disabled = true;
		await waitForUpdate(el);
		expect(el.hasAttribute('disabled')).toBe(true);
	});

	it('marks every tab aria-disabled and drops them all from the tab order', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar disabled>
				<nldd-tab-bar-item text="A"></nldd-tab-bar-item>
				<nldd-tab-bar-item current text="B"></nldd-tab-bar-item>
				<nldd-tab-bar-item text="C"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		for (const item of getItems(el)) {
			const tab = innerTab(item);
			expect(tab.getAttribute('aria-disabled')).toBe('true');
			// Even the current tab, which would otherwise be the roving entry point.
			expect(tab.getAttribute('tabindex')).toBe('-1');
		}
	});

	it('does not change selection or fire tabchange when a disabled tab is clicked', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar disabled>
				<nldd-tab-bar-item current text="A"></nldd-tab-bar-item>
				<nldd-tab-bar-item text="B"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);

		let fired = false;
		el.addEventListener('tabchange', () => { fired = true; });

		const items = getItems(el);
		clickInner(items[1]);
		await waitForUpdate(el);

		expect(fired).toBe(false);
		expect(items[0].current).toBe(true);
		expect(items[1].current).toBe(false);
	});

	it('ignores arrow-key navigation while disabled', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar disabled>
				<nldd-tab-bar-item current text="A"></nldd-tab-bar-item>
				<nldd-tab-bar-item text="B"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);

		const items = getItems(el);
		pressKey(items[0], 'ArrowRight');
		await waitForUpdate(el);

		expect(items[0].current).toBe(true);
		expect(items[1].current).toBe(false);
	});

	it('restores the tab order and interactivity when re-enabled', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar disabled>
				<nldd-tab-bar-item current text="A"></nldd-tab-bar-item>
				<nldd-tab-bar-item text="B"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);

		el.disabled = false;
		await waitForUpdate(el);

		const items = getItems(el);
		expect(innerTab(items[0]).getAttribute('aria-disabled')).toBeNull();
		// Selected tab is the roving entry point again.
		expect(innerTab(items[0]).getAttribute('tabindex')).toBe('0');

		clickInner(items[1]);
		await waitForUpdate(el);
		expect(items[1].current).toBe(true);
		expect(items[0].current).toBe(false);
	});

	it('disables link items in navigation mode (aria-disabled, no select on click)', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar navigation disabled accessible-label="Navigatie">
				<nldd-tab-bar-item text="Home" href="/home" current></nldd-tab-bar-item>
				<nldd-tab-bar-item text="Profiel" href="/profiel"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);

		const items = getItems(el);
		const link = items[1].shadowRoot!.querySelector('a')!;
		expect(link.getAttribute('aria-disabled')).toBe('true');
		expect(link.getAttribute('tabindex')).toBe('-1');

		let selectFired = false;
		el.addEventListener('select', () => { selectFired = true; });
		// A disabled link must swallow its own activation (preventDefault + no select).
		const clickEvent = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
		link.dispatchEvent(clickEvent);
		expect(selectFired).toBe(false);
		expect(clickEvent.defaultPrevented).toBe(true);
	});
});


/* ============================================================
   nldd-tab-bar – navigation mode
   ============================================================ */

describe('nldd-tab-bar – navigation mode', () => {
	let el: NLDDTabBar;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('renders a nav element when navigation is set', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar navigation accessible-label="Navigatie">
				<nldd-tab-bar-item text="Home" href="/home" current></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nav')).not.toBeNull();
	});

	it('does not render role="tablist" when navigation is set', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar navigation accessible-label="Navigatie">
				<nldd-tab-bar-item text="Home" href="/home"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="tablist"]')).toBeNull();
	});

	it('sets aria-current="page" on the current link item in navigation mode', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar navigation accessible-label="Navigatie">
				<nldd-tab-bar-item text="Home" href="/home" current></nldd-tab-bar-item>
				<nldd-tab-bar-item text="Profiel" href="/profiel"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		const linkA = items[0].shadowRoot!.querySelector('a')!;
		const linkB = items[1].shadowRoot!.querySelector('a')!;
		expect(linkA.getAttribute('aria-current')).toBe('page');
		expect(linkB.getAttribute('aria-current')).toBeNull();
	});

	it('does not self-select on click in navigation mode (the consumer owns selection)', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar navigation accessible-label="Navigatie">
				<nldd-tab-bar-item text="Home" href="/home" current></nldd-tab-bar-item>
				<nldd-tab-bar-item text="Profiel" href="/profiel"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		// The item fires `select` on click; in navigation mode the bar must NOT flip
		// selection itself — a click that doesn't navigate (guard/popover) would
		// otherwise leave the wrong tab looking current.
		items[1].dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { item: items[1] } }));
		await waitForUpdate(el);
		expect(items[1].hasAttribute('current')).toBe(false);
		expect(items[0].hasAttribute('current')).toBe(true);
	});

	it('does not set aria-selected on link items in navigation mode', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar navigation accessible-label="Navigatie">
				<nldd-tab-bar-item text="Home" href="/home" current></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		const link = items[0].shadowRoot!.querySelector('a')!;
		expect(link.getAttribute('aria-selected')).toBeNull();
	});

	it('does not auto-activate on ArrowRight in navigation mode', async () => {
		el = await fixture<NLDDTabBar>(`
			<nldd-tab-bar navigation accessible-label="Navigatie">
				<nldd-tab-bar-item text="Home" href="/home" current></nldd-tab-bar-item>
				<nldd-tab-bar-item text="Profiel" href="/profiel"></nldd-tab-bar-item>
			</nldd-tab-bar>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		pressKey(items[0], 'ArrowRight');
		await waitForUpdate(el);
		expect(items[0].current).toBe(true);
		expect(items[1].current).toBe(false);
	});
});

describe('nldd-tab-bar-item selected -> current', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('warns about the old attribute, which does nothing', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(`
			<nldd-tab-bar accessible-label="X">
				<nldd-tab-bar-item text="Home" selected></nldd-tab-bar-item>
			</nldd-tab-bar>`);
		await waitForUpdate(el);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('`selected` is now `current`'));
		const item = el.querySelector('nldd-tab-bar-item') as HTMLElement & { current: boolean };
		expect(item.current).toBe(false);
	});
});
