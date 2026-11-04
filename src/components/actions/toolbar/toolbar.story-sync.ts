/**
 * Story helper: keeps an nldd-segmented-control or nldd-tab-bar in an
 * nldd-toolbar-item in step with its alternatives in the item's `overflow`
 * slot, both ways, the way an app does. A menu item does not check itself: the
 * app sets `selected`, and the toolbar copies that into its overflow menu. The
 * n-th menu item stands for the n-th segment or tab.
 *
 * Installed once per page; the listeners sit on the document, so every story
 * that renders a toolbar gets it. The text editor's toolbar story wires its own
 * controls to the editor, so it is left alone.
 */

type Segmented = HTMLElement & { type: string; value: string; values: string[] };

const alternativesOf = (toolbarItem: Element): HTMLElement[] =>
	Array.from(toolbarItem.querySelectorAll<HTMLElement>(':scope > nldd-menu-item[slot="overflow"], :scope > [slot="overflow"] nldd-menu-item'));

type Tab = HTMLElement & { current: boolean };

const segmentsOf = (control: Element): HTMLElement[] =>
	Array.from(control.querySelectorAll<HTMLElement>('nldd-segmented-control-item'));

const tabsOf = (bar: Element): Tab[] => Array.from(bar.querySelectorAll<Tab>('nldd-tab-bar-item'));

/** Checks the menu item that stands for the current tab. */
function mirrorTabs(bar: Element, toolbarItem: Element): void {
	const tabs = tabsOf(bar);
	alternativesOf(toolbarItem).forEach((item, index) => {
		(item as HTMLElement & { selected: boolean }).selected = !!tabs[index]?.current;
	});
}

const ownToolbar = (el: Element): boolean => !el.closest('.demo-editor');

const isChosen = (control: Segmented, value: string | null): boolean =>
	value !== null && (control.type === 'checkbox' ? (control.values ?? []).includes(value) : control.value === value);

/** Checks the menu items that stand for a chosen segment. */
function mirror(control: Segmented, toolbarItem: Element): void {
	const segments = segmentsOf(control);
	alternativesOf(toolbarItem).forEach((item, index) => {
		(item as HTMLElement & { selected: boolean }).selected = isChosen(control, segments[index]?.getAttribute('value') ?? null);
	});
}

let installed = false;

export function syncToolbarOverflow(): void {
	if (installed) return;
	installed = true;

	document.addEventListener('change', (event) => {
		const control = event.target as Segmented;
		if (control?.tagName !== 'NLDD-SEGMENTED-CONTROL') return;
		const toolbarItem = control.closest('nldd-toolbar-item');
		if (toolbarItem && ownToolbar(toolbarItem)) mirror(control, toolbarItem);
	});

	document.addEventListener('tabchange', (event) => {
		const bar = event.target as Element & { navigation: boolean };
		const toolbarItem = bar?.closest?.('nldd-toolbar-item');
		if (!toolbarItem || !ownToolbar(toolbarItem)) return;
		// A navigation bar leaves `current` to the app, which sets it on the route change.
		if (bar.navigation) {
			const item = (event as CustomEvent<{ item: Tab }>).detail.item;
			tabsOf(bar).forEach((tab) => { tab.current = tab === item; });
		}
		// After the bar has moved `current` to the tab.
		queueMicrotask(() => mirrorTabs(bar, toolbarItem));
	});

	// The toolbar sends a `select` on a copy in its menu on to the original.
	document.addEventListener('select', (event) => {
		const item = event.target as HTMLElement;
		if (item?.tagName !== 'NLDD-MENU-ITEM') return;
		const toolbarItem = item.closest('nldd-toolbar-item');
		const bar = toolbarItem?.querySelector('nldd-tab-bar');
		if (toolbarItem && bar && ownToolbar(toolbarItem)) {
			const index = alternativesOf(toolbarItem).indexOf(item);
			if (index < 0) return;
			tabsOf(bar).forEach((tab, i) => { tab.current = i === index; });
			mirrorTabs(bar, toolbarItem);
			return;
		}
		const control = toolbarItem?.querySelector<Segmented>('nldd-segmented-control');
		if (!toolbarItem || !control || !ownToolbar(toolbarItem)) return;
		const index = alternativesOf(toolbarItem).indexOf(item);
		const value = segmentsOf(control)[index]?.getAttribute('value');
		if (index < 0 || !value) return;
		if (control.type === 'checkbox') {
			const values = control.values ?? [];
			control.values = values.includes(value) ? values.filter((other) => other !== value) : [...values, value];
		} else {
			control.value = value;
		}
		mirror(control, toolbarItem);
	});
}
