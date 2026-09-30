import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDDocumentTabBar, NLDDDocumentTabBarItem } from './document-tab-bar.js';
import './document-tab-bar.js';

function threeTabBar(): string {
	return `
		<nldd-document-tab-bar accessible-label="Documenten">
			<nldd-document-tab-bar-item selected text="Artikel 1" supporting-text="Wet A"></nldd-document-tab-bar-item>
			<nldd-document-tab-bar-item text="Artikel 2" supporting-text="Wet B"></nldd-document-tab-bar-item>
			<nldd-document-tab-bar-item text="Artikel 3" supporting-text="Wet C"></nldd-document-tab-bar-item>
		</nldd-document-tab-bar>
	`;
}

function getItems(el: NLDDDocumentTabBar): NLDDDocumentTabBarItem[] {
	return Array.from(el.querySelectorAll('nldd-document-tab-bar-item'));
}

function clickItem(item: Element) {
	item.shadowRoot!.querySelector('.document-tab-bar__item-tab')!.dispatchEvent(
		new MouseEvent('click', { bubbles: true, composed: true })
	);
}

function clickDismiss(item: Element) {
	item.shadowRoot!.querySelector('.document-tab-bar__item-dismiss-button')!.dispatchEvent(
		new MouseEvent('click', { bubbles: true, composed: true })
	);
}

function pressKey(target: Element, key: string) {
	target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
}


/* ============================================================
   nldd-document-tab-bar-item – render
   ============================================================ */

describe('nldd-document-tab-bar-item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-document-tab-bar-item></nldd-document-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders supporting text when provided', async () => {
		el = await fixture('<nldd-document-tab-bar-item text="Artikel 1" supporting-text="Wet A"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);
		const supportingText = el.shadowRoot!.querySelector('.document-tab-bar__item-supporting-text');
		expect(supportingText).not.toBeNull();
		expect(supportingText!.textContent?.trim()).toBe('Wet A');
	});

	it('does not render supporting text when not provided', async () => {
		el = await fixture('<nldd-document-tab-bar-item text="Artikel 1"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.document-tab-bar__item-supporting-text')).toBeNull();
	});

	it('renders short-title in short slot', async () => {
		el = await fixture('<nldd-document-tab-bar-item text="Artikel 1" short-text="Art. 1"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.document-tab-bar__item-short-text')!.textContent?.trim()).toBe('Art. 1');
	});

	it('falls back to title in short slot when short-title not provided', async () => {
		el = await fixture('<nldd-document-tab-bar-item text="Artikel 1"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.document-tab-bar__item-short-text')!.textContent?.trim()).toBe('Artikel 1');
	});

	it('falls back to supporting-text when short-supporting-text is not provided', async () => {
		el = await fixture('<nldd-document-tab-bar-item text="Artikel 1" supporting-text="Wet A"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.document-tab-bar__item-short-supporting-text')!.textContent?.trim()).toBe('Wet A');
	});

	it('sets role="none" on host', async () => {
		el = await fixture('<nldd-document-tab-bar-item text="Artikel 1"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('none');
	});

	it('sets role="tab" on inner element', async () => {
		el = await fixture('<nldd-document-tab-bar-item text="Artikel 1"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="tab"]')).not.toBeNull();
	});
});


/* ============================================================
   nldd-document-tab-bar-item – short mode
   ============================================================ */

describe('nldd-document-tab-bar-item – short mode', () => {
	let el: NLDDDocumentTabBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	function setItemWidth(item: HTMLElement, width: number) {
		// jsdom returns 0 from getBoundingClientRect; stub it for the seam that
		// _updateIsShort reads. Each test sets a different width.
		Object.defineProperty(item, 'getBoundingClientRect', {
			configurable: true,
			value: () => ({ width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) }),
		});
	}

	it('toggles _isShort and the tooltip timing gate via the threshold CSS var', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);
		const item = getItems(el)[0] as NLDDDocumentTabBarItem;

		// Override the threshold so we don't depend on the production 200px.
		item.style.setProperty('--_short-text-threshold', '100px');

		// Below threshold → short mode active.
		setItemWidth(item, 50);
		(item as unknown as { _updateIsShort: () => void })._updateIsShort();
		await waitForUpdate(item);
		expect((item as unknown as { _isShort: boolean })._isShort).toBe(true);
		const tooltip = item.shadowRoot!.querySelector('nldd-tooltip')!;
		expect((tooltip as unknown as { timing: string }).timing).toBe('delay');

		// Above threshold → tooltip suppressed (full text already inline).
		setItemWidth(item, 150);
		(item as unknown as { _updateIsShort: () => void })._updateIsShort();
		await waitForUpdate(item);
		expect((item as unknown as { _isShort: boolean })._isShort).toBe(false);
		expect(tooltip.getAttribute('timing')).toBe('never');
	});
});


/* ============================================================
   nldd-document-tab-bar-item – events
   ============================================================ */

describe('nldd-document-tab-bar-item – events', () => {
	let el: NLDDDocumentTabBarItem;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('fires select event on click', async () => {
		el = await fixture<NLDDDocumentTabBarItem>('<nldd-document-tab-bar-item text="Artikel 1"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('select', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		clickItem(el);

		expect(detail).toBeDefined();
		expect(detail.item).toBe(el);
	});

	it('does not set selected on itself after click', async () => {
		el = await fixture<NLDDDocumentTabBarItem>('<nldd-document-tab-bar-item text="Artikel 1"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);

		clickItem(el);
		await waitForUpdate(el);

		expect(el.selected).toBe(false);
	});

	it('fires dismiss event on dismiss button click', async () => {
		el = await fixture<NLDDDocumentTabBarItem>('<nldd-document-tab-bar-item text="Artikel 1"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('dismiss', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		clickDismiss(el);

		expect(detail).toBeDefined();
		expect(detail.item).toBe(el);
	});

	it('dismiss does not fire select', async () => {
		el = await fixture<NLDDDocumentTabBarItem>('<nldd-document-tab-bar-item text="Artikel 1"></nldd-document-tab-bar-item>');
		await waitForUpdate(el);

		let selectFired = false;
		el.addEventListener('select', () => { selectFired = true; });
		clickDismiss(el);

		expect(selectFired).toBe(false);
	});
});


/* ============================================================
   nldd-document-tab-bar – render & ARIA
   ============================================================ */

describe('nldd-document-tab-bar', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-document-tab-bar accessible-label="Docs"></nldd-document-tab-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a div container by default', async () => {
		el = await fixture(threeTabBar());
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.document-tab-bar')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('nav')).toBeNull();
	});

	it('sets role="tablist" on items container', async () => {
		el = await fixture(threeTabBar());
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.document-tab-bar__items')!.getAttribute('role')).toBe('tablist');
	});

	it('does not set role on host', async () => {
		el = await fixture(threeTabBar());
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBeNull();
	});
});


/* ============================================================
   nldd-document-tab-bar – accessible label
   ============================================================ */

describe('nldd-document-tab-bar – accessible label', () => {
	let el: NLDDDocumentTabBar;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('falls back to "Tabbladen" when no accessible-label is provided', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDDocumentTabBar>('<nldd-document-tab-bar></nldd-document-tab-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.document-tab-bar__items')!.getAttribute('aria-label')).toBe('Tabbladen');
	});

	it('warns once when no accessible-label is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDDocumentTabBar>('<nldd-document-tab-bar></nldd-document-tab-bar>');
		await waitForUpdate(el);
		expect(warnSpy).toHaveBeenCalledOnce();
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('accessible-label'));
	});

	it('does not warn when accessible-label is provided', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDDocumentTabBar>('<nldd-document-tab-bar accessible-label="Documenten"></nldd-document-tab-bar>');
		await waitForUpdate(el);
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it('forwards accessible-label to container aria-label', async () => {
		el = await fixture<NLDDDocumentTabBar>('<nldd-document-tab-bar accessible-label="Mijn documenten"></nldd-document-tab-bar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.document-tab-bar__items')!.getAttribute('aria-label')).toBe('Mijn documenten');
	});
});


/* ============================================================
   nldd-document-tab-bar – item selection
   ============================================================ */

describe('nldd-document-tab-bar – item selection', () => {
	let el: NLDDDocumentTabBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('deselects other items when one is selected', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		expect(items[0].selected).toBe(true);

		clickItem(items[1]);
		await waitForUpdate(el);

		expect(items[0].selected).toBe(false);
		expect(items[1].selected).toBe(true);
	});

	it('dispatches tabchange event with item detail', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('tabchange', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

		clickItem(getItems(el)[1]);
		await waitForUpdate(el);

		expect(detail).toBeDefined();
		expect(detail.item).toBe(getItems(el)[1]);
	});

	it('select event does not bubble past the tab bar', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		let selectBubbled = false;
		document.addEventListener('select', () => { selectBubbled = true; }, { once: true });

		clickItem(getItems(el)[0]);
		await waitForUpdate(el);

		expect(selectBubbled).toBe(false);
	});
});


/* ============================================================
   nldd-document-tab-bar – dismiss
   ============================================================ */

describe('nldd-document-tab-bar – dismiss', () => {
	let el: NLDDDocumentTabBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('dispatches tabdismiss with item and nextItem', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('tabdismiss', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

		const items = getItems(el);
		clickDismiss(items[0]);
		await waitForUpdate(el);

		expect(detail.item).toBe(items[0]);
	});

	it('selects right neighbor when selected item is dismissed', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		expect(items[0].selected).toBe(true);

		let detail: any;
		el.addEventListener('tabdismiss', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

		clickDismiss(items[0]);
		await waitForUpdate(el);

		expect(detail.nextItem).toBe(items[1]);
		expect(items[1].selected).toBe(true);
	});

	it('selects left neighbor when rightmost selected item is dismissed', async () => {
		el = await fixture<NLDDDocumentTabBar>(`
			<nldd-document-tab-bar accessible-label="Docs">
				<nldd-document-tab-bar-item text="A"></nldd-document-tab-bar-item>
				<nldd-document-tab-bar-item selected text="B"></nldd-document-tab-bar-item>
			</nldd-document-tab-bar>
		`);
		await waitForUpdate(el);

		const items = getItems(el);
		let detail: any;
		el.addEventListener('tabdismiss', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

		clickDismiss(items[1]);
		await waitForUpdate(el);

		expect(detail.nextItem).toBe(items[0]);
		expect(items[0].selected).toBe(true);
	});

	it('nextItem is null when unselected item is dismissed', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		let detail: any;
		el.addEventListener('tabdismiss', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

		clickDismiss(getItems(el)[1]);
		await waitForUpdate(el);

		expect(detail.nextItem).toBeNull();
	});

	it('dispatches tabempty when last item is dismissed', async () => {
		el = await fixture<NLDDDocumentTabBar>(`
			<nldd-document-tab-bar accessible-label="Docs">
				<nldd-document-tab-bar-item selected text="A"></nldd-document-tab-bar-item>
			</nldd-document-tab-bar>
		`);
		await waitForUpdate(el);

		let emptyFired = false;
		el.addEventListener('tabempty', () => { emptyFired = true; });

		clickDismiss(getItems(el)[0]);
		await waitForUpdate(el);

		expect(emptyFired).toBe(true);
	});

	it('dismiss event does not bubble past the tab bar', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		let dismissBubbled = false;
		document.addEventListener('dismiss', () => { dismissBubbled = true; }, { once: true });

		clickDismiss(getItems(el)[0]);
		await waitForUpdate(el);

		expect(dismissBubbled).toBe(false);
	});
});


/* ============================================================
   nldd-document-tab-bar – keyboard navigation
   ============================================================ */

describe('nldd-document-tab-bar – keyboard navigation', () => {
	let el: NLDDDocumentTabBar;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('first item has tabindex="0" when no tab is selected', async () => {
		el = await fixture<NLDDDocumentTabBar>(`
			<nldd-document-tab-bar>
				<nldd-document-tab-bar-item text="Artikel 1"></nldd-document-tab-bar-item>
				<nldd-document-tab-bar-item text="Artikel 2"></nldd-document-tab-bar-item>
			</nldd-document-tab-bar>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		const tabA = items[0].shadowRoot!.querySelector('.document-tab-bar__item-tab')!;
		const tabB = items[1].shadowRoot!.querySelector('.document-tab-bar__item-tab')!;
		expect(tabA.getAttribute('tabindex')).toBe('0');
		expect(tabB.getAttribute('tabindex')).toBe('-1');
	});

	it('selected tab has tabindex="0"', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		const inner = items[0].shadowRoot!.querySelector('.document-tab-bar__item-tab')!;
		expect(inner.getAttribute('tabindex')).toBe('0');
	});

	it('non-selected tabs have tabindex="-1"', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		const innerB = items[1].shadowRoot!.querySelector('.document-tab-bar__item-tab')!;
		const innerC = items[2].shadowRoot!.querySelector('.document-tab-bar__item-tab')!;
		expect(innerB.getAttribute('tabindex')).toBe('-1');
		expect(innerC.getAttribute('tabindex')).toBe('-1');
	});

	it('focus moves to next selected tab after dismiss', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		const spy = vi.spyOn(items[1] as HTMLElement, 'focus');
		clickDismiss(items[0]);
		await waitForUpdate(el);
		expect(spy).toHaveBeenCalled();
	});

	it('dismiss button of non-selected tab has tabindex="-1"', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		const dismissBtn = items[1].shadowRoot!.querySelector('.document-tab-bar__item-dismiss-button')!;
		expect(dismissBtn.getAttribute('tabindex')).toBe('-1');
	});

	it('dismiss button of selected tab has tabindex="0"', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		const dismissBtn = items[0].shadowRoot!.querySelector('.document-tab-bar__item-dismiss-button')!;
		expect(dismissBtn.getAttribute('tabindex')).toBe('0');
	});

	it('ArrowRight auto-activates next tab', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		pressKey(items[0], 'ArrowRight');
		await waitForUpdate(el);
		expect(items[1].selected).toBe(true);
		expect(items[0].selected).toBe(false);
	});

	it('ArrowLeft auto-activates previous tab', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		pressKey(items[1], 'ArrowLeft');
		await waitForUpdate(el);
		expect(items[0].selected).toBe(true);
		expect(items[1].selected).toBe(false);
	});

	it('ArrowRight calls focus on next item', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[1] as HTMLElement, 'focus');
		pressKey(items[0], 'ArrowRight');
		expect(spy).toHaveBeenCalled();
	});

	it('ArrowLeft calls focus on previous item', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[0] as HTMLElement, 'focus');
		pressKey(items[1], 'ArrowLeft');
		expect(spy).toHaveBeenCalled();
	});

	it('ArrowRight wraps from last to first', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[0] as HTMLElement, 'focus');
		pressKey(items[2], 'ArrowRight');
		expect(spy).toHaveBeenCalled();
	});

	it('Home calls focus on first item', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[0] as HTMLElement, 'focus');
		pressKey(items[2], 'Home');
		expect(spy).toHaveBeenCalled();
	});

	it('End calls focus on last item', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);

		const items = getItems(el);
		const spy = vi.spyOn(items[2] as HTMLElement, 'focus');
		pressKey(items[0], 'End');
		expect(spy).toHaveBeenCalled();
	});
});


/* ============================================================
   nldd-document-tab-bar – navigation mode
   ============================================================ */

describe('nldd-document-tab-bar – navigation mode', () => {
	let el: NLDDDocumentTabBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders a nav element when navigation is set', async () => {
		el = await fixture<NLDDDocumentTabBar>(`
			<nldd-document-tab-bar navigation accessible-label="Documenten">
				<nldd-document-tab-bar-item text="Artikel 1" href="/artikel-1"></nldd-document-tab-bar-item>
			</nldd-document-tab-bar>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nav')).not.toBeNull();
	});

	it('does not render role="tablist" when navigation is set', async () => {
		el = await fixture<NLDDDocumentTabBar>(`
			<nldd-document-tab-bar navigation accessible-label="Documenten">
				<nldd-document-tab-bar-item text="Artikel 1" href="/artikel-1"></nldd-document-tab-bar-item>
			</nldd-document-tab-bar>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="tablist"]')).toBeNull();
	});

	it('renders an anchor when href is set on item', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);
		const items = getItems(el);
		items[0].href = '/artikel-1';
		await waitForUpdate(el);
		expect(items[0].shadowRoot!.querySelector('a')).not.toBeNull();
	});

	it('sets aria-current="page" on selected item in navigation mode', async () => {
		el = await fixture<NLDDDocumentTabBar>(`
			<nldd-document-tab-bar navigation accessible-label="Documenten">
				<nldd-document-tab-bar-item selected text="Artikel 1" href="/artikel-1"></nldd-document-tab-bar-item>
				<nldd-document-tab-bar-item text="Artikel 2" href="/artikel-2"></nldd-document-tab-bar-item>
			</nldd-document-tab-bar>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		const linkA = items[0].shadowRoot!.querySelector('a')!;
		const linkB = items[1].shadowRoot!.querySelector('a')!;
		expect(linkA.getAttribute('aria-current')).toBe('page');
		expect(linkB.getAttribute('aria-current')).toBeNull();
	});

	it('does not auto-activate on ArrowRight in navigation mode', async () => {
		el = await fixture<NLDDDocumentTabBar>(`
			<nldd-document-tab-bar navigation accessible-label="Documenten">
				<nldd-document-tab-bar-item selected text="Artikel 1" href="/artikel-1"></nldd-document-tab-bar-item>
				<nldd-document-tab-bar-item text="Artikel 2" href="/artikel-2"></nldd-document-tab-bar-item>
			</nldd-document-tab-bar>
		`);
		await waitForUpdate(el);
		const items = getItems(el);
		pressKey(items[0], 'ArrowRight');
		await waitForUpdate(el);
		expect(items[0].selected).toBe(true);
		expect(items[1].selected).toBe(false);
	});
});

describe('nldd-document-tab-bar – translations', () => {
	let el: NLDDDocumentTabBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('uses default Dutch overflow label', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		await waitForUpdate(el);
		const overflowBtn = el.shadowRoot!.querySelector('.document-tab-bar__overflow nldd-icon-button');
		expect(overflowBtn?.getAttribute('text')).toBe('Toon meer tabbladen');
	});

	it('accepts custom translations via property', async () => {
		el = await fixture<NLDDDocumentTabBar>(threeTabBar());
		(el as NLDDDocumentTabBar).translations = {
			'components.document-tab-bar.overflow-action': 'Show more tabs',
		};
		await waitForUpdate(el);
		const overflowBtn = el.shadowRoot!.querySelector('.document-tab-bar__overflow nldd-icon-button');
		expect(overflowBtn?.getAttribute('text')).toBe('Show more tabs');
	});
});
