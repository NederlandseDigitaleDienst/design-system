import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { groupForOverflow } from './toolbar.js';
import '../button/button.js';

describe('nldd-toolbar', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	// ## Smoke tests

	it('renders without error', async () => {
		el = await fixture('<nldd-toolbar></nldd-toolbar>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to md size', async () => {
		el = await fixture('<nldd-toolbar></nldd-toolbar>');
		await waitForUpdate(el);
		expect((el as unknown as { size: string }).size).toBe('md');
		expect(el.hasAttribute('size')).toBe(false);
	});

	it('reflects size attribute', async () => {
		el = await fixture('<nldd-toolbar size="sm"></nldd-toolbar>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('sm');
	});

	it('defaults show-item-labels to false', async () => {
		el = await fixture('<nldd-toolbar></nldd-toolbar>');
		await waitForUpdate(el);
		expect(el.hasAttribute('show-item-labels')).toBe(false);
	});

	it('reflects show-item-labels attribute', async () => {
		el = await fixture('<nldd-toolbar show-item-labels></nldd-toolbar>');
		await waitForUpdate(el);
		expect(el.hasAttribute('show-item-labels')).toBe(true);
	});

	it('registers nldd-toolbar-item and nldd-toolbar-title as custom elements', () => {
		expect(customElements.get('nldd-toolbar-item')).toBeDefined();
		expect(customElements.get('nldd-toolbar-title')).toBeDefined();
	});

	// ## Priority-based collapsing order

	it('collapses end items before start items (end has lower priority area order)', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Start" priority="1">
					<nldd-icon-button aria-label="Start"></nldd-icon-button>
					<nldd-menu-item slot="overflow" text="Start"></nldd-menu-item>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="end" label="End" priority="1">
					<nldd-icon-button aria-label="End"></nldd-icon-button>
					<nldd-menu-item slot="overflow" text="End"></nldd-menu-item>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _getPrioritizedItems: () => { label: string }[] };
		const prioritized = toolbar._getPrioritizedItems();
		expect(prioritized[0].label).toBe('End');
		expect(prioritized[1].label).toBe('Start');
	});

	it('collapses lower priority number items first', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="High" priority="5">
					<nldd-icon-button aria-label="High"></nldd-icon-button>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="start" label="Low" priority="1">
					<nldd-icon-button aria-label="Low"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _getPrioritizedItems: () => { label: string; priority: number }[] };
		const prioritized = toolbar._getPrioritizedItems();
		expect(prioritized[0].label).toBe('Low');
		expect(prioritized[1].label).toBe('High');
	});

	// ## Children building

	it('builds start children from slot="start"', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Item A">
					<nldd-icon-button aria-label="A"></nldd-icon-button>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="start" label="Item B">
					<nldd-icon-button aria-label="B"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _startChildren: { label: string }[] };
		expect(toolbar._startChildren.length).toBe(2);
		expect(toolbar._startChildren[0].label).toBe('Item A');
	});

	it('builds center children from slot="center"', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-title slot="center" text="Titel"></nldd-toolbar-title>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _centerChildren: { type: string }[] };
		expect(toolbar._centerChildren.length).toBe(1);
		expect(toolbar._centerChildren[0].type).toBe('title');
	});

	it('builds end children from slot="end"', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="end" label="End Item">
					<nldd-icon-button aria-label="End"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _endChildren: { label: string }[] };
		expect(toolbar._endChildren.length).toBe(1);
		expect(toolbar._endChildren[0].label).toBe('End Item');
	});

	// ## Title rendering

	it('item renders its own label in its shadow root', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Bewerken">
					<nldd-icon-button aria-label="Bewerken"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const item = el.querySelector('nldd-toolbar-item')!;
		const label = item.shadowRoot?.querySelector('.toolbar__item-label');
		expect(label?.textContent).toBe('Bewerken');
	});

	it('title renders text and supporting text in its shadow root', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-title slot="center" text="Titel" supporting-text="Subtitel"></nldd-toolbar-title>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const title = el.querySelector('nldd-toolbar-title')!;
		expect(title.shadowRoot?.querySelector('.toolbar__title')?.textContent).toBe('Titel');
		expect(title.shadowRoot?.querySelector('.toolbar__supporting-text')?.textContent).toBe('Subtitel');
	});

	it('centers title text when align="center" (overriding the inherited-text reset)', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-title slot="center" text="Titel" align="center"></nldd-toolbar-title>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const title = el.querySelector('nldd-toolbar-title')!;
		const titleText = title.shadowRoot!.querySelector('.toolbar__title') as HTMLElement;
		expect(getComputedStyle(titleText).textAlign).toBe('center');
	});

	it('maps title min-width to --_title-group-min-width', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-title slot="center" text="Titel" min-width="300px"></nldd-toolbar-title>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const title = el.querySelector('nldd-toolbar-title') as HTMLElement;
		expect(title.style.getPropertyValue('--_title-group-min-width')).toBe('300px');
	});

	it('maps title width and max-width to custom properties', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-title slot="center" text="Titel" width="40%" max-width="480px"></nldd-toolbar-title>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const title = el.querySelector('nldd-toolbar-title')!;
		expect(title.style.getPropertyValue('--_title-width')).toBe('40%');
		expect(title.style.getPropertyValue('--_title-max-width')).toBe('480px');
	});

	// ## Overflow items

	it('separates overflow items from toolbar-item children', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Item">
					<nldd-icon-button aria-label="Item"></nldd-icon-button>
					<nldd-menu-item slot="overflow" text="Item overflow"></nldd-menu-item>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _startChildren: { overflowItems: Element[] }[] };
		expect(toolbar._startChildren[0].overflowItems.length).toBe(1);
	});

	it('builds pinned overflow items from slot="overflow"', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-menu-item slot="overflow" text="Altijd zichtbaar"></nldd-menu-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _pinnedOverflowItems: Element[] };
		expect(toolbar._pinnedOverflowItems.length).toBe(1);
	});

	it('resolves the overflow menu id within its own shadow root', async () => {
		el = await fixture(`
			<div>
				<nldd-toolbar>
					<nldd-menu-item slot="overflow" text="Een"></nldd-menu-item>
				</nldd-toolbar>
				<nldd-toolbar>
					<nldd-menu-item slot="overflow" text="Twee"></nldd-menu-item>
				</nldd-toolbar>
			</div>
		`);
		await waitForUpdate(el);
		// The menu lives in the toolbar's own shadow root, so its id only has to
		// be unique there — but it does have to resolve, because the trigger
		// anchors the menu by id.
		[...el.querySelectorAll('nldd-toolbar')].forEach((toolbar) => {
			const menu = (toolbar as unknown as { _menu: Element })._menu;
			const root = menu.getRootNode() as ShadowRoot;
			expect(root.getElementById(menu.id)).toBe(menu);
		});
	});

	// ## Size propagation

	it('propagates size to toolbar item children', async () => {
		el = await fixture(`
			<nldd-toolbar size="sm">
				<nldd-toolbar-item slot="start" label="Item">
					<nldd-icon-button aria-label="Item"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const button = el.querySelector('nldd-icon-button');
		expect(button?.getAttribute('size')).toBe('sm');
	});

	it('does not propagate size to overflow slot children', async () => {
		el = await fixture(`
			<nldd-toolbar size="sm">
				<nldd-toolbar-item slot="start" label="Item">
					<nldd-icon-button aria-label="Item"></nldd-icon-button>
					<nldd-menu-item slot="overflow" text="Overflow"></nldd-menu-item>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const menuItem = el.querySelector('nldd-menu-item');
		expect(menuItem?.getAttribute('size')).toBeNull();
	});

	it('propagates lg size to toolbar item children', async () => {
		el = await fixture(`
			<nldd-toolbar size="lg">
				<nldd-toolbar-item slot="start" label="Item">
					<nldd-icon-button aria-label="Item"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const button = el.querySelector('nldd-icon-button');
		expect(button?.getAttribute('size')).toBe('lg');
	});

	it('renders the overflow button at the toolbar size', async () => {
		el = await fixture(`
			<nldd-toolbar size="lg">
				<nldd-toolbar-item slot="start" label="Item">
					<nldd-icon-button aria-label="Item"></nldd-icon-button>
					<nldd-menu-item slot="overflow" text="Item"></nldd-menu-item>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const overflowButton = el.shadowRoot?.querySelector('.toolbar__overflow-button nldd-icon-button');
		expect(overflowButton?.getAttribute('size')).toBe('lg');
	});

	it('reflects an explicit priority to the attribute but keeps the default 0 attribute-less', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="end" label="A"><nldd-icon-button aria-label="A"></nldd-icon-button></nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const item = el.querySelector('nldd-toolbar-item') as HTMLElement & { priority: number; updateComplete: Promise<boolean> };
		// Default 0 does not pollute the DOM.
		expect(item.hasAttribute('priority')).toBe(false);
		// An explicit property value reflects, so it is visible and the toolbar's
		// attribute observer sees runtime changes.
		item.priority = 2;
		await item.updateComplete;
		expect(item.getAttribute('priority')).toBe('2');
		// Back to the default removes the attribute again.
		item.priority = 0;
		await item.updateComplete;
		expect(item.hasAttribute('priority')).toBe(false);
	});

	it('reads a priority set as a DOM property (framework binding), not only the attribute', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="end" label="A"><nldd-icon-button aria-label="A"></nldd-icon-button></nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const item = el.querySelector('nldd-toolbar-item') as HTMLElement & { priority: number; updateComplete: Promise<boolean> };
		item.priority = 5; // property only — no attribute, the way Vue/React bind it
		await item.updateComplete;

		const tb = el as unknown as {
			_buildChildren(): void;
			_endChildren: { type: string; priority?: number; hasPriority?: boolean }[];
		};
		tb._buildChildren();
		const child = tb._endChildren.find(c => c.type === 'item');
		// The toolbar reads el.priority (the property), so a framework binding that
		// never touches the attribute still lands. (Reflection then mirrors it back
		// to the attribute — covered by the reflect test above.)
		expect(child?.priority).toBe(5);
		expect(child?.hasPriority).toBe(true);
	});

	it('forwards a select from an overflow clone to the original item', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Item A">
					<nldd-icon-button aria-label="A"></nldd-icon-button>
					<nldd-menu-item slot="overflow" text="A"></nldd-menu-item>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);

		const original = el.querySelector('nldd-menu-item[slot="overflow"]')!;
		let fired = false;
		original.addEventListener('select', () => { fired = true; });

		// The test env has no real layout, so force the item into overflow and
		// build the clone menu directly.
		const tb = el as unknown as {
			_createMenu(): void;
			_syncMenuItems(): void;
			_getPrioritizedItems(): { id: number; overflowItems: Element[] }[];
			_overflowIds: Set<number>;
			_menu: HTMLElement;
		};
		tb._createMenu();
		const child = tb._getPrioritizedItems().find(c => c.overflowItems.length > 0)!;
		tb._overflowIds = new Set([child.id]);
		tb._syncMenuItems();

		const clone = tb._menu.querySelector('nldd-menu-item');
		expect(clone).not.toBeNull();
		clone!.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true }));

		expect(fired).toBe(true);
	});

	// ## MutationObserver

	it('rebuilds children when a new item is added', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Item A">
					<nldd-icon-button aria-label="A"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);

		const toolbar = el as unknown as { _startChildren: unknown[]; _buildChildren: () => void };
		expect(toolbar._startChildren.length).toBe(1);

		const spy = vi.spyOn(toolbar, '_buildChildren');
		const newItem = document.createElement('nldd-toolbar-item');
		newItem.setAttribute('label', 'Item B');
		newItem.setAttribute('slot', 'start');
		el.appendChild(newItem);

		await new Promise(resolve => setTimeout(resolve, 50));
		expect(spy).toHaveBeenCalled();
	});

	it('preserves children when a descendant selected attribute changes', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Item">
					<button selected>Toggle</button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);

		const toolbar = el as unknown as { _startChildren: unknown[] };
		expect(toolbar._startChildren.length).toBe(1);

		const button = el.querySelector('button')!;
		button.removeAttribute('selected');
		await waitForUpdate(el);

		expect(toolbar._startChildren.length).toBe(1);

		// The item host keeps its original slot assignment and stays projected
		// into the parent's named slot — it is not lost on a descendant change.
		const item = el.querySelector('nldd-toolbar-item')!;
		expect(item.getAttribute('slot')).toBe('start');
		const slot = el.shadowRoot?.querySelector('slot[name="start"]');
		expect(slot).not.toBeNull();
	});

	// ## _computeSpacerZeros

	it('returns both zeros true when start and end are both empty', async () => {
		el = await fixture('<nldd-toolbar></nldd-toolbar>');
		await waitForUpdate(el);
		const toolbar = el as unknown as {
			_computeSpacerZeros: (h: number, g: number, o: number, s: number, c: number, e: number) => { leftZero: boolean; rightZero: boolean };
		};
		const result = toolbar._computeSpacerZeros(800, 8, 0, 0, 200, 0);
		expect(result.leftZero).toBe(true);
		expect(result.rightZero).toBe(true);
	});

	it('returns leftZero true when start overflows into center', async () => {
		el = await fixture('<nldd-toolbar></nldd-toolbar>');
		await waitForUpdate(el);
		const toolbar = el as unknown as {
			_computeSpacerZeros: (h: number, g: number, o: number, s: number, c: number, e: number) => { leftZero: boolean; rightZero: boolean };
		};
		const result = toolbar._computeSpacerZeros(800, 8, 0, 500, 200, 100);
		expect(result.leftZero).toBe(true);
	});

	// ## Menu sync

	it('creates a menu element on connectedCallback', async () => {
		el = await fixture('<nldd-toolbar></nldd-toolbar>');
		await waitForUpdate(el);
		const toolbar = el as unknown as { _menu: Element | null };
		expect(toolbar._menu).not.toBeNull();
		expect(toolbar._menu?.tagName.toLowerCase()).toBe('nldd-menu');
		toolbar._menu?.remove();
	});

	it('keeps the overflow menu inside its own shadow root, not on body', async () => {
		// A body-level menu goes inert when the toolbar sits inside a modal
		// dialog (e.g. a sheet): visible in the top layer, but unclickable.
		el = await fixture('<nldd-toolbar></nldd-toolbar>');
		await waitForUpdate(el);
		const toolbar = el as unknown as { _menu: Element | null };
		expect(toolbar._menu?.getRootNode()).toBe(el.shadowRoot);
	});

	it('removes menu on disconnectedCallback', async () => {
		el = await fixture('<nldd-toolbar></nldd-toolbar>');
		await waitForUpdate(el);
		const toolbar = el as unknown as { _menu: Element | null };
		const menu = toolbar._menu;
		expect(menu).not.toBeNull();
		cleanup(el);
		el = null as unknown as HTMLElement;
		expect(toolbar._menu).toBeNull();
	});

	// ## Fluid item detection

	it('marks item as fluid when min-width attribute is set', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Fluid" min-width="120px">
					<nldd-icon-button aria-label="Fluid"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _startChildren: { isFluid: boolean }[] };
		expect(toolbar._startChildren[0].isFluid).toBe(true);
	});

	it('marks item as fluid when max-width attribute is set', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Capped" max-width="480px">
					<nldd-icon-button aria-label="Capped"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _startChildren: { isFluid: boolean; maxWidth: string }[] };
		expect(toolbar._startChildren[0].isFluid).toBe(true);
		expect(toolbar._startChildren[0].maxWidth).toBe('480px');
	});

	it('does not mark item as fluid without min-width, max-width or width', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Normal">
					<nldd-icon-button aria-label="Normal"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _startChildren: { isFluid: boolean }[] };
		expect(toolbar._startChildren[0].isFluid).toBe(false);
	});

	it('treats a menu-group as an overflow item', async () => {
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Opmaak">
					<nldd-icon-button aria-label="Opmaak"></nldd-icon-button>
					<nldd-menu-group slot="overflow" text="Opmaak">
						<nldd-menu-item text="Vet"></nldd-menu-item>
					</nldd-menu-group>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const toolbar = el as unknown as { _startChildren: { overflowItems: Element[] }[] };
		const overflow = toolbar._startChildren[0].overflowItems;
		expect(overflow.length).toBe(1);
		expect(overflow[0].tagName.toLowerCase()).toBe('nldd-menu-group');
	});

	it('overflows same-priority items together (whole groups)', async () => {
		el = await fixture(`
			<nldd-toolbar style="display:block;width:120px" label="T">
				<nldd-toolbar-item slot="start" priority="1"><div style="width:50px;height:24px"></div><nldd-menu-item slot="overflow" text="A"></nldd-menu-item></nldd-toolbar-item>
				<nldd-toolbar-item slot="start" priority="1"><div style="width:50px;height:24px"></div><nldd-menu-item slot="overflow" text="B"></nldd-menu-item></nldd-toolbar-item>
				<nldd-toolbar-item slot="start" priority="2"><div style="width:50px;height:24px"></div><nldd-menu-item slot="overflow" text="C"></nldd-menu-item></nldd-toolbar-item>
				<nldd-toolbar-item slot="start" priority="2"><div style="width:50px;height:24px"></div><nldd-menu-item slot="overflow" text="D"></nldd-menu-item></nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		(el as unknown as { _measureAndUpdate(): void })._measureAndUpdate();
		const items = [...el.querySelectorAll('nldd-toolbar-item')] as HTMLElement[];
		const byPriority: Record<string, HTMLElement[]> = {};
		for (const item of items) {
			const p = item.getAttribute('priority')!;
			if (!byPriority[p]) byPriority[p] = [];
			byPriority[p].push(item);
		}
		for (const group of Object.values(byPriority)) {
			const hiddenCount = group.filter(i => i.hidden).length;
			expect(hiddenCount === 0 || hiddenCount === group.length).toBe(true);
		}
		expect(items.some(i => i.hidden)).toBe(true);
	});

	it('groups only explicit priorities for overflow (no priority attribute = individual)', () => {
		// Partial fixture cast to the item type: groupForOverflow only reads
		// type/priority/hasPriority, so the remaining ToolbarChild fields are
		// intentionally omitted. If that type gains a required field this cast hides
		// it — revisit when the groupForOverflow input changes.
		const item = (id: number, priority: number, hasPriority: boolean) =>
			({ type: 'item', id, priority, hasPriority }) as unknown as Parameters<typeof groupForOverflow>[0][number];
		const ids = (groups: ReturnType<typeof groupForOverflow>) => groups.map(g => g.map(c => c.id));
		// No priority attribute → each item is its own group (overflows individually).
		expect(ids(groupForOverflow([item(1, 0, false), item(2, 0, false)]))).toEqual([[1], [2]]);
		// Shared explicit priority → one group; a different priority → its own group.
		expect(ids(groupForOverflow([item(1, 1, true), item(2, 1, true), item(3, 2, true)]))).toEqual([[1, 2], [3]]);
		// Explicit and default-0 are never merged.
		expect(ids(groupForOverflow([item(1, 0, false), item(2, 1, true), item(3, 1, true)]))).toEqual([[1], [2, 3]]);
		// Same explicit priority groups across positions (non-adjacent).
		expect(ids(groupForOverflow([item(1, 1, true), item(2, 2, true), item(3, 1, true)]))).toEqual([[1, 3], [2]]);
	});
});

describe('nldd-toolbar centered title layout', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// Let the ResizeObserver-driven measurement pass (scheduled from updated() via
	// updateComplete.then) run and its state re-render settle.
	const settle = async (host: HTMLElement): Promise<void> => {
		await (host as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
		await (host as unknown as { updateComplete: Promise<unknown> }).updateComplete;
	};

	const mount = async (inner: string): Promise<HTMLElement> => {
		el = await fixture<HTMLElement>(`<nldd-toolbar size="md" style="width:360px">${inner}</nldd-toolbar>`);
		await waitForUpdate(el);
		await settle(el);
		return el;
	};

	const centerOnly = (host: HTMLElement): boolean =>
		(host as unknown as { _centerOnly: boolean })._centerOnly;

	const titleCenterOffset = (host: HTMLElement): number => {
		const box = host.getBoundingClientRect();
		const p = host.querySelector('nldd-toolbar-title')!.shadowRoot!.querySelector('.toolbar__title')!;
		const pr = p.getBoundingClientRect();
		return pr.left + pr.width / 2 - box.left;
	};

	const TITLE = '<nldd-toolbar-title slot="center" align="center" text="boodschappen"></nldd-toolbar-title>';
	const HIDDEN_START = '<nldd-toolbar-item slot="start" style="display:none"><nldd-icon-button icon="chevron-left" text="Terug"></nldd-icon-button></nldd-toolbar-item>';

	it('treats a display:none-only start/end as center-only (routes to the centered layout)', async () => {
		await mount(HIDDEN_START + TITLE);
		expect(centerOnly(el)).toBe(true);
		expect(el.shadowRoot!.querySelector('.toolbar__center-fill')).not.toBeNull();
	});

	it('is not center-only when a real start item is present', async () => {
		await mount('<nldd-toolbar-item slot="start"><nldd-icon-button icon="chevron-left" text="Terug"></nldd-icon-button></nldd-toolbar-item>' + TITLE);
		expect(centerOnly(el)).toBe(false); // a rendered start item still balances via the spacers
	});

	it('promotes a lone centered title to solo-fluid despite a hidden start item', async () => {
		await mount(HIDDEN_START + TITLE);
		const title = el.querySelector('nldd-toolbar-title')!;
		expect(title.hasAttribute('solo-fluid')).toBe(true);
	});

	it('actually centers a lone title (hidden start) — the reported bug', async () => {
		await mount(HIDDEN_START + TITLE);
		expect(titleCenterOffset(el)).toBeCloseTo(180, -1); // ±5px of the 360px toolbar's center
	});

	it('centers a lone title with no start/end at all', async () => {
		await mount(TITLE);
		expect(titleCenterOffset(el)).toBeCloseTo(180, -1);
	});
});

describe('nldd-toolbar solo fluid item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const settle = async (host: HTMLElement): Promise<void> => {
		await (host as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
		await (host as unknown as { updateComplete: Promise<unknown> }).updateComplete;
	};

	const mount = async (inner: string): Promise<HTMLElement> => {
		el = await fixture<HTMLElement>(`<nldd-toolbar size="md" style="width:360px">${inner}</nldd-toolbar>`);
		await waitForUpdate(el);
		await settle(el);
		return el;
	};

	const FLUID = '<nldd-toolbar-item slot="start" width="100%" min-width="80px"><nldd-search-field placeholder="Zoeken"></nldd-search-field></nldd-toolbar-item>';
	const HIDDEN_END = '<nldd-toolbar-item slot="end" style="display:none"><nldd-button text="Filter"></nldd-button></nldd-toolbar-item>';

	const itemWidth = (host: HTMLElement): number =>
		host.querySelector('nldd-toolbar-item')!.getBoundingClientRect().width;

	it('lets a lone fluid item fill the row', async () => {
		await mount(FLUID);
		expect(itemWidth(el)).toBeCloseTo(360, -1);
	});

	it('lets a fluid item fill the row despite a display:none sibling', async () => {
		await mount(FLUID + HIDDEN_END);
		// Without counting real rendering the flexible spacer stays in the row and
		// caps the fluid item at half the toolbar (180px).
		expect(itemWidth(el)).toBeCloseTo(360, -1);
	});

	it('does not treat two rendered items as solo fluid', async () => {
		el = await fixture<HTMLElement>('<nldd-toolbar size="md" style="width:600px"><nldd-toolbar-item slot="start"><nldd-button text="Een"></nldd-button></nldd-toolbar-item><nldd-toolbar-item slot="end"><nldd-button text="Twee"></nldd-button></nldd-toolbar-item></nldd-toolbar>');
		await waitForUpdate(el);
		await settle(el);
		expect((el as unknown as { _soloFluid: boolean })._soloFluid).toBe(false);
		expect(el.shadowRoot!.querySelector('.toolbar__flexible-spacer')).not.toBeNull();
	});
});

/* ============================================================
   Re-measuring when a control changes width

   What decides the layout is the width a control needs, and that changes for
   reasons no attribute filter catches. A `text` that gets shorter is the one
   that bit: the mutation observer saw it and filed it under "a visible control
   changed, no toolbar work needed", so the freed space stayed reserved and an
   item that had been pushed into the overflow menu stayed there.
   ============================================================ */

function frames(n = 10): Promise<void> {
	return new Promise(resolve => {
		let left = n;
		const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
		requestAnimationFrame(tick);
	});
}

describe('nldd-toolbar – re-measures on a width change', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('measures again when a control inside an item gets narrower', async () => {
		el = await fixture(`
			<nldd-toolbar label="Balk" style="width: 340px">
				<nldd-toolbar-item slot="start">
					<nldd-button id="name" text="Een behoorlijk lange naam"></nldd-button>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="start"><nldd-button text="Tweede knop"></nldd-button></nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		await frames(10);

		const toolbar = el as unknown as { _measureAndUpdate: () => void };
		const measure = vi.spyOn(toolbar, '_measureAndUpdate');

		el.querySelector('#name')!.setAttribute('text', 'Kort');
		await frames(14);

		expect(measure).toHaveBeenCalled();
	});

	it('settles instead of measuring on and on', async () => {
		el = await fixture(`
			<nldd-toolbar label="Balk" style="width: 340px">
				<nldd-toolbar-item slot="start">
					<nldd-button id="name2" text="Een behoorlijk lange naam"></nldd-button>
				</nldd-toolbar-item>
				<nldd-toolbar-item slot="start"><nldd-button text="Tweede knop"></nldd-button></nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		await frames(10);

		const toolbar = el as unknown as { _measureAndUpdate: () => void };
		const measure = vi.spyOn(toolbar, '_measureAndUpdate');

		el.querySelector('#name2')!.setAttribute('text', 'Kort');
		await frames(20);
		const afterChange = measure.mock.calls.length;

		await frames(20);
		expect(measure.mock.calls.length).toBe(afterChange);
		expect(afterChange).toBeLessThanOrEqual(3);
	});
});
