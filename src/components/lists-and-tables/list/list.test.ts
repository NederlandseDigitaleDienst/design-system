import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './list.js';
import '../list-item/list-item.js';
import '../cells/text-cell/text-cell.js';
import '../cells/icon-cell/icon-cell.js';
import '../list-item-segment/list-item-segment.js';
import '../cells/cell/cell.js';
import '../../actions/button/button.js';
import '../../actions/icon-button/icon-button.js';
import '../../inputs/combo-box/combo-box.js';
import '../../actions/menu/menu.js';
import '../../status-and-feedback/inline-dialog/inline-dialog.js';

describe('nldd-list', () => {

	it('type="radiogroup": the items region is the group and the rows step aside for their radios', async () => {
		el = await fixture(`
			<nldd-list type="radiogroup" accessible-label="Niveau">
				<nldd-list-item radio checked><nldd-text-cell text="Alles"></nldd-text-cell></nldd-list-item>
				<nldd-list-item radio><nldd-text-cell text="Fouten"></nldd-text-cell></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.list__items')!.getAttribute('role')).toBe('radiogroup');
		const rows = el.querySelectorAll('nldd-list-item');
		expect(rows[0].getAttribute('role')).toBe('none');
		expect(
			rows[0].shadowRoot!.querySelector('.list-item__action')!.getAttribute('aria-checked'),
		).toBe('true');
	});

	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-list></nldd-list>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to simple appearance', async () => {
		el = await fixture('<nldd-list></nldd-list>');
		await waitForUpdate(el);
		expect((el as unknown as { appearance: string }).appearance).toBe('simple');
		expect(el.hasAttribute('appearance')).toBe(false);
	});

	it('reflects appearance attribute', async () => {
		el = await fixture('<nldd-list appearance="box-tinted"></nldd-list>');
		await waitForUpdate(el);
		expect(el.getAttribute('appearance')).toBe('box-tinted');
	});

	it('drops is-boxed on items when the list appearance switches box -> simple', async () => {
		el = await fixture('<nldd-list appearance="box-tinted"><nldd-list-item>A</nldd-list-item></nldd-list>');
		const item = el.querySelector('nldd-list-item')!;
		await waitForUpdate(el);
		await (item as { updateComplete: Promise<unknown> }).updateComplete;
		expect(item.classList.contains('is-boxed')).toBe(true);

		el.setAttribute('appearance', 'simple');
		await waitForUpdate(el);
		expect(item.classList.contains('is-boxed')).toBe(false);
	});

	it('reflects a non-default dividers value', async () => {
		el = await fixture('<nldd-list dividers="never"></nldd-list>');
		await waitForUpdate(el);
		expect(el.getAttribute('dividers')).toBe('never');
	});

	it('sets --context-list-divider-display when dividers="never"', async () => {
		el = await fixture('<nldd-list dividers="never"></nldd-list>');
		await waitForUpdate(el);
		expect(getComputedStyle(el).getPropertyValue('--context-list-divider-display').trim()).toBe('none');
	});

	it('hides the dividers with dividers="on-touch" where the pointer is fine', async () => {
		// The runner is a desktop browser, so this is the half of the behavior it
		// can observe: no touch, no lines. The other half needs a coarse pointer.
		expect(matchMedia('(pointer: coarse)').matches).toBe(false);
		el = await fixture('<nldd-list dividers="on-touch"></nldd-list>');
		await waitForUpdate(el);
		expect(el.getAttribute('dividers')).toBe('on-touch');
		expect(getComputedStyle(el).getPropertyValue('--context-list-divider-display').trim()).toBe('none');
	});


	// — Drag: keyboard (direct arrow-reorder) ——————————————————————————————

	it('ArrowDown on a drag handle fires nldd-reorder with the target index', async () => {
		el = await fixture(`
			<nldd-list reorderable>
				<nldd-list-item><span reorderable-only tabindex="0">handle</span></nldd-list-item>
				<nldd-list-item><span reorderable-only tabindex="0">handle</span></nldd-list-item>
				<nldd-list-item><span reorderable-only tabindex="0">handle</span></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);

		const handle = el.querySelectorAll('[reorderable-only]')[0] as HTMLElement;

		let reorderDetail: { fromIndex: number; toIndex: number } | null = null;
		el.addEventListener('nldd-reorder', (e: Event) => {
			reorderDetail = (e as CustomEvent).detail;
		});

		handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		await waitForUpdate(el);

		expect(reorderDetail).not.toBeNull();
		expect(reorderDetail!.fromIndex).toBe(0);
		expect(reorderDetail!.toIndex).toBe(1);
	});

	it('ArrowUp on the first item is a no-op', async () => {
		el = await fixture(`
			<nldd-list reorderable>
				<nldd-list-item><span reorderable-only tabindex="0">handle</span></nldd-list-item>
				<nldd-list-item><span reorderable-only tabindex="0">handle</span></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);

		const handle = el.querySelectorAll('[reorderable-only]')[0] as HTMLElement;
		let fired = false;
		el.addEventListener('nldd-reorder', () => { fired = true; });

		handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(fired).toBe(false);
	});

	it('ArrowDown on the last item is a no-op', async () => {
		el = await fixture(`
			<nldd-list reorderable>
				<nldd-list-item><span reorderable-only tabindex="0">handle</span></nldd-list-item>
				<nldd-list-item><span reorderable-only tabindex="0">handle</span></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);

		const handles = el.querySelectorAll('[reorderable-only]');
		const lastHandle = handles[handles.length - 1] as HTMLElement;
		let fired = false;
		el.addEventListener('nldd-reorder', () => { fired = true; });

		lastHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(fired).toBe(false);
	});

	it('does nothing when the keydown path has no drag handle', async () => {
		el = await fixture(`
			<nldd-list reorderable>
				<nldd-list-item><span tabindex="0">no handle</span></nldd-list-item>
				<nldd-list-item><span tabindex="0">no handle</span></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);

		const span = el.querySelectorAll('span[tabindex]')[0] as HTMLElement;
		let fired = false;
		el.addEventListener('nldd-reorder', () => { fired = true; });

		span.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(fired).toBe(false);
	});


	// — Drag: pointer ————————————————————————————————————————————————————————

	it('fires nldd-reorder with correct indices after pointer drag', async () => {
		el = await fixture(`
			<nldd-list reorderable>
				<nldd-list-item><span reorderable-only>handle</span></nldd-list-item>
				<nldd-list-item><span reorderable-only>handle</span></nldd-list-item>
				<nldd-list-item><span reorderable-only>handle</span></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);

		const handle = el.querySelectorAll('[reorderable-only]')[0] as HTMLElement;

		let reorderDetail: { fromIndex: number; toIndex: number } | null = null;
		el.addEventListener('nldd-reorder', (e: Event) => {
			reorderDetail = (e as CustomEvent).detail;
		});

		handle.dispatchEvent(new PointerEvent('pointerdown', { clientY: 10, pointerId: 1, bubbles: true, composed: true }));
		await waitForUpdate(el);

		el.dispatchEvent(new PointerEvent('pointermove', { clientY: 100, pointerId: 1, bubbles: true, composed: true }));
		await waitForUpdate(el);

		el.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true, composed: true }));
		await waitForUpdate(el);

		expect(reorderDetail).not.toBeNull();
		expect(reorderDetail!.fromIndex).toBe(0);
	});

	it('pointer cancel cleans up is-dragging class and removes placeholder', async () => {
		el = await fixture(`
			<nldd-list reorderable>
				<nldd-list-item><span reorderable-only>handle</span></nldd-list-item>
				<nldd-list-item><span reorderable-only>handle</span></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);

		const handle = el.querySelectorAll('[reorderable-only]')[0] as HTMLElement;
		const firstItem = el.querySelectorAll('nldd-list-item')[0];

		handle.dispatchEvent(new PointerEvent('pointerdown', { clientY: 10, pointerId: 1, bubbles: true, composed: true }));
		await waitForUpdate(el);

		expect(firstItem.classList.contains('is-dragging')).toBe(true);

		el.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, bubbles: true, composed: true }));
		await waitForUpdate(el);

		expect(firstItem.classList.contains('is-dragging')).toBe(false);
		expect(el.querySelector('.nldd-list-drag-placeholder')).toBeNull();
	});


	// — Type: content (default) ——————————————————————————————————————————————

	it('defaults to type="list" with role="list" on .list__items', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		expect((el as unknown as { type: string }).type).toBe('list');
		expect(el.hasAttribute('type')).toBe(false);
		const itemsEl = el.shadowRoot!.querySelector('.list__items');
		expect(itemsEl?.getAttribute('role')).toBe('list');
		expect(el.hasAttribute('role')).toBe(false);
	});

	it('keeps role="list" on .list__items when empty, hiding it instead', async () => {
		// The empty-state (non-listitem nldd-inline-dialog) is now a SIBLING of
		// .list__items inside .list__main, so .list__items only ever holds items.
		// The role can stay set unconditionally — .list__items is hidden when empty,
		// so an empty role="list" is never exposed to AT.
		el = await fixture('<nldd-list></nldd-list>');
		await waitForUpdate(el);
		const itemsEl = el.shadowRoot!.querySelector('.list__items');
		expect(itemsEl?.getAttribute('role')).toBe('list');
		expect(itemsEl?.hasAttribute('hidden')).toBe(true);
	});

	it('.list__empty is a sibling of .list__items inside .list__main', async () => {
		el = await fixture('<nldd-list></nldd-list>');
		await waitForUpdate(el);
		const main = el.shadowRoot!.querySelector('.list__main')!;
		const items = main.querySelector(':scope > .list__items');
		const empty = main.querySelector(':scope > .list__empty');
		expect(items).not.toBeNull();
		expect(empty).not.toBeNull();
		// Empty is no longer nested inside the items container.
		expect(items!.querySelector('.list__empty')).toBeNull();
	});


	// — Type: navigation ——————————————————————————————————————————————————————

	it('navigation: host gets role="navigation" and a default aria-label', async () => {
		el = await fixture('<nldd-list type="navigation"></nldd-list>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('navigation');
		expect(el.getAttribute('aria-label')).toBe('Navigatie');
	});

	it('navigation: respects a consumer-provided aria-label', async () => {
		el = await fixture('<nldd-list type="navigation" aria-label="Hoofdmenu"></nldd-list>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-label')).toBe('Hoofdmenu');
	});

	it('navigation: switching back to content removes role and auto-label', async () => {
		el = await fixture('<nldd-list type="navigation"></nldd-list>');
		await waitForUpdate(el);
		expect(el.hasAttribute('aria-label')).toBe(true);

		el.setAttribute('type', 'list');
		await waitForUpdate(el);
		expect(el.hasAttribute('role')).toBe(false);
		expect(el.hasAttribute('aria-label')).toBe(false);
	});

	it('navigation: keeps consumer-set aria-label when switching back to list', async () => {
		// Edge case: auto-label was applied, consumer then overrode it, then
		// type flipped back. We should not wipe the consumer's label.
		el = await fixture('<nldd-list type="navigation"></nldd-list>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-label')).toBe('Navigatie');

		el.setAttribute('aria-label', 'Mijn menu');
		el.setAttribute('type', 'list');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-label')).toBe('Mijn menu');
		expect(el.hasAttribute('data-nldd-auto-label')).toBe(false);
	});


	// — Type / reorderable conflict ———————————————————————————————————————————

	it('does not set reorderable on items when type is not list', async () => {
		el = await fixture(`
			<nldd-list type="navigation" reorderable>
				<nldd-list-item id="a"></nldd-list-item>
				<nldd-list-item id="b"></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		expect(el.querySelector('#a')?.hasAttribute('reorderable')).toBe(false);
		expect(el.querySelector('#b')?.hasAttribute('reorderable')).toBe(false);
	});


	// — Empty slot ————————————————————————————————————————————————————————————

	it('empty slot: hidden when items are present', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item></nldd-list-item>
				<div slot="empty">No results</div>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const empty = el.shadowRoot!.querySelector<HTMLElement>('.list__empty')!;
		expect(empty.hasAttribute('hidden')).toBe(true);
	});

	it('empty slot: visible when there are no items', async () => {
		el = await fixture(`
			<nldd-list>
				<div slot="empty">No results</div>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const empty = el.shadowRoot!.querySelector<HTMLElement>('.list__empty')!;
		expect(empty.hasAttribute('hidden')).toBe(false);
	});

	it('empty slot: visible when all items are [hidden]', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item hidden></nldd-list-item>
				<nldd-list-item hidden></nldd-list-item>
				<div slot="empty">No results</div>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const empty = el.shadowRoot!.querySelector<HTMLElement>('.list__empty')!;
		expect(empty.hasAttribute('hidden')).toBe(false);
	});

	it('empty slot: toggles when an item is hidden at runtime', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item id="a"></nldd-list-item>
				<div slot="empty">No results</div>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const empty = el.shadowRoot!.querySelector<HTMLElement>('.list__empty')!;
		expect(empty.hasAttribute('hidden')).toBe(true);

		el.querySelector('#a')!.setAttribute('hidden', '');
		await waitForUpdate(el);
		expect(empty.hasAttribute('hidden')).toBe(false);
	});


	// — Empty state ————————————————————————————————————————————————————————

	it('empty: says nothing of its own, because the words are the app\'s', async () => {
		el = await fixture('<nldd-list></nldd-list>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-inline-dialog')).toBeNull();
	});

	it('empty: takes itself off the page when the slot is unfilled', async () => {
		el = await fixture('<nldd-list appearance="box-tinted"></nldd-list>');
		await waitForUpdate(el);
		expect(getComputedStyle(el).display).toBe('none');
	});

	it('empty: stays on the page once the slot says something', async () => {
		el = await fixture('<nldd-list appearance="box-tinted"><nldd-inline-dialog slot="empty" text="Niets gevonden"></nldd-inline-dialog></nldd-list>');
		await waitForUpdate(el);
		expect(getComputedStyle(el).display).not.toBe('none');
	});

	it('empty: warns in DEV about a list that renders a blank area', async () => {
		const warnings: string[] = [];
		const original = console.warn;
		console.warn = (...args: unknown[]) => { warnings.push(String(args[0])); };
		try {
			el = await fixture('<nldd-list></nldd-list>');
			await waitForUpdate(el);
		} finally {
			console.warn = original;
		}
		expect(warnings.some(warning => /slot="empty"/.test(warning))).toBe(true);
	});

	it('empty: stays quiet when the slot is filled', async () => {
		const warnings: string[] = [];
		const original = console.warn;
		console.warn = (...args: unknown[]) => { warnings.push(String(args[0])); };
		try {
			el = await fixture('<nldd-list><nldd-inline-dialog slot="empty" text="Niets gevonden"></nldd-inline-dialog></nldd-list>');
			await waitForUpdate(el);
		} finally {
			console.warn = original;
		}
		expect(warnings.some(warning => /slot="empty"/.test(warning))).toBe(false);
	});

	// The warning asks about the state the list is actually in. Rows that are all
	// hidden are the no-results state, and a slot that covers it has answered.
	it('no-results: stays quiet when only that slot is filled', async () => {
		const warnings: string[] = [];
		const original = console.warn;
		console.warn = (...args: unknown[]) => { warnings.push(String(args[0])); };
		try {
			el = await fixture('<nldd-list><nldd-inline-dialog slot="no-results" text="Niets gevonden"></nldd-inline-dialog><nldd-list-item hidden>A</nldd-list-item></nldd-list>');
			await waitForUpdate(el);
		} finally {
			console.warn = original;
		}
		expect(warnings.some(warning => /blank area/.test(warning))).toBe(false);
	});

	it('no-results: asks for that slot, not the empty one', async () => {
		const warnings: string[] = [];
		const original = console.warn;
		console.warn = (...args: unknown[]) => { warnings.push(String(args[0])); };
		try {
			el = await fixture('<nldd-list><nldd-list-item hidden>A</nldd-list-item></nldd-list>');
			await waitForUpdate(el);
		} finally {
			console.warn = original;
		}
		expect(warnings.some(warning => /slot="no-results"/.test(warning))).toBe(true);
	});

	it('empty default: slotted content replaces the default dialog', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-inline-dialog slot="empty" text="Custom"></nldd-inline-dialog>
			</nldd-list>
		`);
		await waitForUpdate(el);
		// Only the slotted dialog should be visible (slot fallback suppressed)
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="empty"]')!;
		const assigned = slot.assignedElements();
		expect(assigned.length).toBe(1);
		expect(assigned[0].getAttribute('text')).toBe('Custom');
	});

	it('toolbar slot: hidden when empty', async () => {
		el = await fixture('<nldd-list></nldd-list>');
		await waitForUpdate(el);
		const toolbar = el.shadowRoot!.querySelector<HTMLElement>('.list__toolbar')!;
		expect(toolbar.hasAttribute('hidden')).toBe(true);
	});

	// With rows, because a toolbar belongs to them: an empty list hides it (see
	// "empty and no-results" below).
	it('toolbar slot: visible when filled, for any type', async () => {
		el = await fixture('<nldd-list type="navigation"><div slot="toolbar">Filters</div><nldd-list-item>A</nldd-list-item></nldd-list>');
		await waitForUpdate(el);
		const toolbar = el.shadowRoot!.querySelector<HTMLElement>('.list__toolbar')!;
		expect(toolbar.hasAttribute('hidden')).toBe(false);
	});

	it('marks the first and last visible items with is-first / is-last', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item>A</nldd-list-item>
				<nldd-list-item>B</nldd-list-item>
				<nldd-list-item>C</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const items = [...el.querySelectorAll('nldd-list-item')];
		expect(items[0].classList.contains('is-first')).toBe(true);
		expect(items[2].classList.contains('is-last')).toBe(true);
		expect(items[1].classList.contains('is-first')).toBe(false);
		expect(items[1].classList.contains('is-last')).toBe(false);
		// Hiding the first row promotes the next visible one to is-first.
		items[0].setAttribute('hidden', '');
		await waitForUpdate(el);
		expect(items[0].classList.contains('is-first')).toBe(false);
		expect(items[1].classList.contains('is-first')).toBe(true);
	});

	it('tree: is-last follows the deepest child of an expanded branch', async () => {
		el = await fixture(`
			<nldd-list type="tree">
				<nldd-list-item button>A</nldd-list-item>
				<nldd-list-item button expanded>
					B
					<nldd-list-item slot="children" button>B1</nldd-list-item>
					<nldd-list-item slot="children" button>B2</nldd-list-item>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const branch = el.querySelectorAll('nldd-list-item')[1];
		const children = [...branch.querySelectorAll('nldd-list-item')];
		expect(branch.classList.contains('is-last')).toBe(false);
		expect(children[1].classList.contains('is-last')).toBe(true);
		// Collapsing hands is-last back to the branch: its children stop painting.
		branch.removeAttribute('expanded');
		await waitForUpdate(el);
		expect(branch.classList.contains('is-last')).toBe(true);
		expect(children[1].classList.contains('is-last')).toBe(false);
	});

	it('tree: arrow navigation walks the rows of an open branch', async () => {
		el = await fixture(`
			<nldd-list type="tree">
				<nldd-list-item button expanded>
					A
					<nldd-list-item slot="children" button>A1</nldd-list-item>
				</nldd-list-item>
				<nldd-list-item button>B</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		// querySelectorAll walks into the branch, so pick the rows apart by role.
		const branch = el.querySelector('nldd-list-item')!;
		const child = branch.querySelector('nldd-list-item')!;
		const leaf = [...el.querySelectorAll('nldd-list-item')].find(
			row => row !== branch && row !== child,
		)!;
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		await waitForUpdate(el);
		// Down from the branch lands on its child, not on the next top-level row.
		expect(child._rovingActive).toBe(true);
		expect(leaf._rovingActive).toBe(false);
	});

	it('tree: arrow navigation works without the attribute', async () => {
		el = await fixture(`
			<nldd-list type="tree">
				<nldd-list-item button>A</nldd-list-item>
				<nldd-list-item button>B</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const rows = [...el.querySelectorAll('nldd-list-item')];
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(rows[1]._rovingActive).toBe(true);
	});

	it('tree: a row without its own control is a roving stop on the host', async () => {
		el = await fixture(`
			<nldd-list type="tree">
				<nldd-list-item>
					<nldd-list-item-segment button disclosure><nldd-icon-cell icon="chevron-right"></nldd-icon-cell></nldd-list-item-segment>
					<nldd-text-cell text="A"></nldd-text-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-list-item-segment button disclosure><nldd-icon-cell icon="chevron-right"></nldd-icon-cell></nldd-list-item-segment>
					<nldd-text-cell text="B"></nldd-text-cell>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const rows = [...el.querySelectorAll('nldd-list-item')];
		expect(rows[0].getAttribute('tabindex')).toBe('0');
		// No tabindex at all on the others, not -1: a shadow host with a tabindex
		// is a focus scope, and Chromium skips such a scope when tabbing back if
		// the host isn't tabbable — which made every row inside a branch
		// unreachable with Shift+Tab.
		expect(rows[1].hasAttribute('tabindex')).toBe(false);
		// Within the current row Tab reaches the segment; elsewhere not.
		const controls = rows.map(row => row.querySelector('nldd-list-item-segment')!
			.shadowRoot!.querySelector('.list-item-segment')!);
		expect(controls[0].getAttribute('tabindex')).toBe('0');
		expect(controls[1].getAttribute('tabindex')).toBe('-1');
	});

	it('tree: ArrowRight opens a closed branch through its own disclosure control', async () => {
		el = await fixture(`
			<nldd-list type="tree">
				<nldd-list-item button>
					A
					<nldd-list-item slot="children" button>A1</nldd-list-item>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const branch = el.querySelector('nldd-list-item')!;
		let clicks = 0;
		branch.addEventListener('click', () => { clicks += 1; });
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
		await waitForUpdate(el);
		// The list activates the control; writing `expanded` stays the consumer's.
		expect(clicks).toBe(1);
		expect(branch.expanded).toBe(undefined);
	});

	it('tree: Enter and Space open the row from the row itself', async () => {
		el = await fixture(`
			<nldd-list type="tree">
				<nldd-list-item>
					<nldd-list-item-segment button disclosure><nldd-icon-cell icon="chevron-right"></nldd-icon-cell></nldd-list-item-segment>
					<nldd-text-cell text="A"></nldd-text-cell>
					<nldd-list-item slot="children"><nldd-text-cell text="A1"></nldd-text-cell></nldd-list-item>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const branch = el.querySelector('nldd-list-item')!;
		const chevron = branch.querySelector('nldd-list-item-segment')!;
		let clicks = 0;
		chevron.addEventListener('click', () => { clicks += 1; });
		branch.focus();

		for (const key of ['Enter', ' ']) {
			const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true });
			branch.dispatchEvent(event);
			await waitForUpdate(el);
			expect(event.defaultPrevented).toBe(true);
		}
		expect(clicks).toBe(2);

		// From the action itself the button handles both keys; acting here too
		// would toggle twice.
		const fromAction = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true });
		chevron.dispatchEvent(fromAction);
		await waitForUpdate(el);
		expect(clicks).toBe(2);
	});

	it('tree: Enter follows the row, Space folds it', async () => {
		el = await fixture(`
			<nldd-list type="tree">
				<nldd-list-item>
					<nldd-list-item-segment button disclosure><nldd-icon-cell icon="chevron-right"></nldd-icon-cell></nldd-list-item-segment>
					<nldd-list-item-segment button width="full"><nldd-text-cell text="A"></nldd-text-cell></nldd-list-item-segment>
					<nldd-list-item slot="children"><nldd-text-cell text="A1"></nldd-text-cell></nldd-list-item>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const branch = el.querySelector('nldd-list-item')!;
		const [chevron, label] = [...branch.querySelectorAll('nldd-list-item-segment')];
		let folds = 0;
		let opens = 0;
		chevron.addEventListener('click', () => { folds += 1; });
		label.addEventListener('click', () => { opens += 1; });
		branch.focus();

		const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true });
		branch.dispatchEvent(enter);
		await waitForUpdate(el);
		expect(enter.defaultPrevented).toBe(true);
		expect(opens).toBe(1);
		expect(folds).toBe(0);

		const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, composed: true, cancelable: true });
		branch.dispatchEvent(space);
		await waitForUpdate(el);
		expect(folds).toBe(1);
		expect(opens).toBe(1);
	});

	it('tree: opening a branch keeps focus on the row', async () => {
		el = await fixture(`
			<nldd-list type="tree">
				<nldd-list-item>
					<nldd-list-item-segment button disclosure><nldd-icon-cell icon="chevron-right"></nldd-icon-cell></nldd-list-item-segment>
					<nldd-text-cell text="A"></nldd-text-cell>
					<nldd-list-item slot="children"><nldd-text-cell text="A1"></nldd-text-cell></nldd-list-item>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const branch = el.querySelector('nldd-list-item')!;
		branch.focus();
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
		await waitForUpdate(el);
		// The click on the chevron pulls focus into that action; the row takes it
		// back, because the row is the roving tab stop and carries the ring.
		expect(document.activeElement).toBe(branch);
	});

	it('tree: ArrowRight steps into an open branch, ArrowLeft steps back out', async () => {
		el = await fixture(`
			<nldd-list type="tree">
				<nldd-list-item button expanded>
					A
					<nldd-list-item slot="children" button>A1</nldd-list-item>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const branch = el.querySelector('nldd-list-item')!;
		const child = branch.querySelector('nldd-list-item')!;
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(child._rovingActive).toBe(true);
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(branch._rovingActive).toBe(true);
	});

	it('search-bar-end slot: hidden when empty (listbox)', async () => {
		el = await fixture('<nldd-list type="listbox"></nldd-list>');
		await waitForUpdate(el);
		const end = el.shadowRoot!.querySelector<HTMLElement>('.list__search-bar-end')!;
		expect(end.hasAttribute('hidden')).toBe(true);
	});

	it('search-bar-end slot: visible when filled', async () => {
		el = await fixture('<nldd-list type="listbox"><button slot="search-bar-end">Filter</button></nldd-list>');
		await waitForUpdate(el);
		const end = el.shadowRoot!.querySelector<HTMLElement>('.list__search-bar-end')!;
		expect(end.hasAttribute('hidden')).toBe(false);
	});

	it('accessible-label labels the inner role=list (type=list)', async () => {
		el = await fixture('<nldd-list accessible-label="Mijn meldingen"></nldd-list>');
		await waitForUpdate(el);
		const items = el.shadowRoot!.querySelector('.list__items')!;
		expect(items.getAttribute('aria-label')).toBe('Mijn meldingen');
	});

	it('accessible-label labels the search input (type=listbox)', async () => {
		el = await fixture('<nldd-list type="listbox" accessible-label="Zoek een gemeente"></nldd-list>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('.list__search-field-input')!;
		expect(input.getAttribute('aria-label')).toBe('Zoek een gemeente');
	});
});

describe('nldd-list – arrow navigation (roving tabindex)', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const MARKUP = `
		<nldd-list>
			<nldd-list-item button text="Een"></nldd-list-item>
			<nldd-list-item button text="Twee"></nldd-list-item>
			<nldd-list-item button text="Drie"></nldd-list-item>
		</nldd-list>
	`;

	// The list pushes roving state onto items in a microtask, which the items
	// then render. waitForUpdate(list) drains the list's own update + a macrotask,
	// but NOT the items' follow-up render, so this helper additionally awaits each
	// item's updateComplete (and returns them) before any tabindex is asserted.
	async function settle(list: HTMLElement) {
		await waitForUpdate(list);
		const items = [...list.querySelectorAll('nldd-list-item')] as (HTMLElement & { updateComplete: Promise<boolean> })[];
		await Promise.all(items.map(i => i.updateComplete));
		return items;
	}

	const tabindexOf = (item: Element) =>
		item.shadowRoot!.querySelector<HTMLElement>('.list-item__action')!.getAttribute('tabindex');

	const arrow = (key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

	it('makes the list a single tab stop: the first item is 0, the rest -1', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		expect(tabindexOf(items[0])).toBe('0');
		expect(tabindexOf(items[1])).toBe('-1');
		expect(tabindexOf(items[2])).toBe('-1');
	});

	it('needs no attribute: a plain list is already one tab stop', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		expect(tabindexOf(items[0])).toBe('0');
		items.slice(1).forEach(i => expect(tabindexOf(i)).toBe('-1'));
	});

	it('ArrowDown/ArrowUp move the roving tab stop and wrap around', async () => {
		el = await fixture(MARKUP);
		await settle(el);
		arrow('ArrowDown');
		let items = await settle(el);
		expect(tabindexOf(items[1])).toBe('0');
		expect(tabindexOf(items[0])).toBe('-1');
		// Wrap forward: Drie -> Een (three -> one).
		arrow('ArrowDown');
		await settle(el);
		arrow('ArrowDown');
		items = await settle(el);
		expect(tabindexOf(items[0])).toBe('0');
		// Wrap backward: Een -> Drie (one -> three).
		arrow('ArrowUp');
		items = await settle(el);
		expect(tabindexOf(items[2])).toBe('0');
	});

	it('Home and End jump to the first and last item', async () => {
		el = await fixture(MARKUP);
		await settle(el);
		arrow('End');
		let items = await settle(el);
		expect(tabindexOf(items[2])).toBe('0');
		arrow('Home');
		items = await settle(el);
		expect(tabindexOf(items[0])).toBe('0');
	});

	it('leaves the arrow keys to a reorderable list (it moves rows with them)', async () => {
		el = await fixture(`
			<nldd-list reorderable>
				<nldd-list-item button text="Een"></nldd-list-item>
				<nldd-list-item button text="Twee"></nldd-list-item>
			</nldd-list>
		`);
		const items = await settle(el);
		items.forEach(i => expect(tabindexOf(i)).toBeNull());
	});

	it('skips non-interactive items (no button/href) in the roving order', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item button text="Een"></nldd-list-item>
				<nldd-list-item text="Tussenkop"></nldd-list-item>
				<nldd-list-item button text="Twee"></nldd-list-item>
			</nldd-list>
		`);
		const items = await settle(el);
		// The non-interactive middle item has no action element, so it never
		// becomes a roving tab stop.
		expect(items[1].shadowRoot!.querySelector('.list-item__action')).toBeNull();
		expect(tabindexOf(items[0])).toBe('0');
		expect(tabindexOf(items[2])).toBe('-1');
		// ArrowDown from the first interactive item lands on the next interactive
		// item, skipping the non-interactive one.
		arrow('ArrowDown');
		const after = await settle(el);
		expect(tabindexOf(after[2])).toBe('0');
		expect(tabindexOf(after[0])).toBe('-1');
	});

	it('advertises the arrow keys via aria-keyshortcuts + aria-description while active', async () => {
		el = await fixture(MARKUP);
		await settle(el);
		expect(el.getAttribute('aria-keyshortcuts')).toBe('ArrowUp ArrowDown Home End');
		expect(el.getAttribute('aria-description')).toBe('Gebruik de pijltjestoetsen om door de lijst te navigeren.');

		// A reorderable list means something else by the same keys, so it makes no
		// such promise.
		el.setAttribute('reorderable', '');
		await settle(el);
		expect(el.hasAttribute('aria-keyshortcuts')).toBe(false);
		expect(el.hasAttribute('aria-description')).toBe(false);
	});

	it('makes no promise of arrow keys in a list with nothing to operate', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item><nldd-text-cell text="Een"></nldd-text-cell></nldd-list-item>
				<nldd-list-item><nldd-text-cell text="Twee"></nldd-text-cell></nldd-list-item>
			</nldd-list>
		`);
		await settle(el);
		expect(el.hasAttribute('aria-keyshortcuts')).toBe(false);
		expect(el.hasAttribute('aria-description')).toBe(false);
	});

	it('stops at a row whose only control sits in a cell', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item>
					<nldd-text-cell text="Een"></nldd-text-cell>
					<nldd-cell width="fit-content"><nldd-icon-button icon="ellipsis" accessible-label="Acties"></nldd-icon-button></nldd-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-text-cell text="Twee"></nldd-text-cell>
					<nldd-cell width="fit-content"><nldd-icon-button icon="ellipsis" accessible-label="Acties"></nldd-icon-button></nldd-cell>
				</nldd-list-item>
			</nldd-list>
		`);
		const items = await settle(el);
		const buttons = [...el.querySelectorAll('nldd-icon-button')] as (HTMLElement & { noTab: boolean })[];
		// The row is the tab stop, so its own button keeps one and the other row's
		// button is closed off.
		expect(items[0].getAttribute('tabindex')).toBe('0');
		expect(buttons[0].noTab).toBe(false);
		expect(buttons[1].noTab).toBe(true);

		arrow('ArrowDown');
		const after = await settle(el);
		expect(after[1].getAttribute('tabindex')).toBe('0');
		expect(buttons[0].noTab).toBe(true);
		expect(buttons[1].noTab).toBe(false);
	});

	it('takes a native control in a cell out of the tab order and gives it back', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item>
					<nldd-cell><button type="button">Een</button></nldd-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-cell><button type="button">Twee</button></nldd-cell>
				</nldd-list-item>
			</nldd-list>
		`);
		await settle(el);
		const buttons = [...el.querySelectorAll('button')];
		expect(buttons[0].hasAttribute('tabindex')).toBe(false);
		expect(buttons[1].getAttribute('tabindex')).toBe('-1');

		arrow('ArrowDown');
		await settle(el);
		expect(buttons[0].getAttribute('tabindex')).toBe('-1');
		expect(buttons[1].hasAttribute('tabindex')).toBe(false);
	});

	it('keeps a tab stop the consumer closed off themselves', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item>
					<nldd-cell><button type="button" tabindex="-1">Een</button></nldd-cell>
					<nldd-cell><nldd-icon-button icon="ellipsis" accessible-label="Acties" no-tab></nldd-icon-button></nldd-cell>
				</nldd-list-item>
				<nldd-list-item button text="Twee"></nldd-list-item>
			</nldd-list>
		`);
		await settle(el);
		// The first row is the current one, so its controls would be tabbable —
		// except that the consumer said otherwise, and that is a decision.
		expect(el.querySelector('button')!.getAttribute('tabindex')).toBe('-1');
		expect((el.querySelector('nldd-icon-button') as HTMLElement & { noTab: boolean }).noTab).toBe(true);
	});

	it('stops at a checkbox row', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item checkbox text="Een"></nldd-list-item>
				<nldd-list-item checkbox text="Twee"></nldd-list-item>
			</nldd-list>
		`);
		const items = await settle(el);
		expect(tabindexOf(items[0])).toBe('0');
		expect(tabindexOf(items[1])).toBe('-1');
		arrow('ArrowDown');
		const after = await settle(el);
		expect(tabindexOf(after[1])).toBe('0');
	});

	it('skips a row that holds nothing to operate', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item button text="Een"></nldd-list-item>
				<nldd-list-item><nldd-text-cell text="Tussenkop"></nldd-text-cell></nldd-list-item>
				<nldd-list-item button text="Twee"></nldd-list-item>
			</nldd-list>
		`);
		await settle(el);
		arrow('ArrowDown');
		const items = await settle(el);
		expect(tabindexOf(items[2])).toBe('0');
	});

	it('gives every control its tab stop back when the arrows go to reordering', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item>
					<nldd-cell><button type="button">Een</button></nldd-cell>
				</nldd-list-item>
				<nldd-list-item>
					<nldd-cell><button type="button">Twee</button></nldd-cell>
				</nldd-list-item>
			</nldd-list>
		`);
		await settle(el);
		expect(el.querySelectorAll('button')[1].getAttribute('tabindex')).toBe('-1');

		el.setAttribute('reorderable', '');
		await settle(el);
		[...el.querySelectorAll('button')].forEach((button) => {
			expect(button.hasAttribute('tabindex')).toBe(false);
		});
	});
});

describe('nldd-list – listbox', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const MARKUP = `
		<nldd-list type="listbox">
			<nldd-list-item button selected><nldd-text-cell text="Aardappelen"></nldd-text-cell></nldd-list-item>
			<nldd-list-item button><nldd-text-cell text="Broccoli"></nldd-text-cell></nldd-list-item>
			<nldd-list-item button><nldd-text-cell text="Courgette"></nldd-text-cell></nldd-list-item>
		</nldd-list>
	`;

	// The list pushes _highlighted onto items in a microtask, then the items render.
	// waitForUpdate(list) drains the list + a macrotask but not the items'
	// follow-up render, so additionally await each item's updateComplete.
	async function settle(list: HTMLElement) {
		await waitForUpdate(list);
		const items = [...list.querySelectorAll('nldd-list-item')] as (HTMLElement & { updateComplete: Promise<boolean> })[];
		await Promise.all(items.map(i => i.updateComplete));
		// The active-option highlight + aria-activedescendant only show while the
		// search input is focused (listbox virtual focus), so focus it for these tests.
		el.shadowRoot?.querySelector<HTMLInputElement>('.list__search-field-input')?.focus();
		await waitForUpdate(list);
		await Promise.all(items.map(i => i.updateComplete));
		return items;
	}

	const searchInput = () => el.shadowRoot!.querySelector<HTMLInputElement>('.list__search-field-input')!;
	const itemsEl = () => el.shadowRoot!.querySelector('.list__items')!;
	const keydown = (key: string) => searchInput().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

	it('sets role="listbox" on .list__items and role="option" on items', async () => {
		el = await fixture(MARKUP);
		await settle(el);
		expect(itemsEl().getAttribute('role')).toBe('listbox');
		// The host carries no widget role — the listbox role lives on .list__items.
		expect(el.hasAttribute('role')).toBe(false);
		const items = el.querySelectorAll('nldd-list-item');
		items.forEach(i => expect(i.getAttribute('role')).toBe('option'));
	});

	it('reflects selected as aria-selected on the option', async () => {
		el = await fixture(MARKUP);
		await settle(el);
		const items = el.querySelectorAll('nldd-list-item');
		expect(items[0].getAttribute('aria-selected')).toBe('true');
		expect(items[1].getAttribute('aria-selected')).toBe('false');
	});

	it('renders the search input with role="combobox" and aria-controls pointing at .list__items', async () => {
		el = await fixture(MARKUP);
		await settle(el);
		const input = searchInput();
		expect(input).not.toBeNull();
		expect(input.getAttribute('role')).toBe('combobox');
		expect(input.getAttribute('aria-expanded')).toBe('true');
		expect(input.getAttribute('aria-controls')).toBe(itemsEl().id);
		expect(itemsEl().id).toBeTruthy();
	});

	it('sets aria-expanded="false" when no options are visible (popup hidden)', async () => {
		el = await fixture(MARKUP);
		await settle(el);
		// Three options visible: the listbox popup is shown.
		expect(searchInput().getAttribute('aria-expanded')).toBe('true');
		// Consumer filters to no matches by hiding every option; .list__items is
		// hidden, so per the APG combobox pattern the input must report collapsed.
		el.querySelectorAll('nldd-list-item').forEach(i => i.setAttribute('hidden', ''));
		await settle(el);
		expect(searchInput().getAttribute('aria-expanded')).toBe('false');
	});

	it('assigns an id to options that lack one and seeds the first as active', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		items.forEach(i => expect(i.id).toBeTruthy());
		// First visible option is active on first render; aria-activedescendant
		// points at it.
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(items[0].id);
	});

	it('ArrowDown moves the active option and updates aria-activedescendant', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		keydown('ArrowDown');
		await settle(el);
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(items[1].id);
		expect(items[1].shadowRoot!.querySelector('.list-item.is-highlighted')).not.toBeNull();
		expect(items[0].shadowRoot!.querySelector('.list-item.is-highlighted')).toBeNull();
	});

	it('ArrowUp from the first option wraps to the last', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		keydown('ArrowUp');
		await settle(el);
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(items[2].id);
	});

	it('Home and End jump to the first and last option', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		keydown('End');
		await settle(el);
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(items[2].id);
		keydown('Home');
		await settle(el);
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(items[0].id);
	});

	it('Enter activates the active option by clicking its inner action', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		keydown('ArrowDown'); // active = items[1]
		await settle(el);
		let clicked = false;
		items[1].addEventListener('click', () => { clicked = true; });
		keydown('Enter');
		expect(clicked).toBe(true);
	});

	it('dispatches a composed, bubbling input event with { value } on search input', async () => {
		el = await fixture(MARKUP);
		await settle(el);
		let detailValue: string | null = null;
		el.addEventListener('input', (e: Event) => { detailValue = (e as CustomEvent).detail.value; });
		const input = searchInput();
		input.value = 'bro';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		expect(detailValue).toBe('bro');
	});

	it('resets the active option to the first visible one after [hidden] filtering', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		// Simulate a consumer filter that hides the first option.
		items[0].setAttribute('hidden', '');
		await settle(el);
		// Active falls back to the first VISIBLE option (now items[1]).
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(items[1].id);
		expect(items[1].shadowRoot!.querySelector('.list-item.is-highlighted')).not.toBeNull();
	});

	it('with an empty search and no visible options, clears aria-activedescendant and keeps the empty state and .list__main hidden', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		items.forEach(i => i.setAttribute('hidden', ''));
		await settle(el);
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(null);
		// An empty search has no "no results" meaning yet → the empty state is
		// suppressed and .list__main collapses, so only the search field shows.
		const empty = el.shadowRoot!.querySelector<HTMLElement>('.list__empty')!;
		expect(empty.hasAttribute('hidden')).toBe(true);
		const main = el.shadowRoot!.querySelector<HTMLElement>('.list__main')!;
		expect(main.hasAttribute('hidden')).toBe(true);
		// .list__items keeps role="listbox" but is hidden (no visible options).
		expect(itemsEl().getAttribute('role')).toBe('listbox');
		expect(itemsEl().hasAttribute('hidden')).toBe(true);
	});

	it('shows the empty state when a search query is present but nothing matches', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		// A query with no matches: set the search value, then the consumer hides all.
		const input = searchInput();
		input.value = 'zzz';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		items.forEach(i => i.setAttribute('hidden', ''));
		await settle(el);
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(null);

		const empty = el.shadowRoot!.querySelector<HTMLElement>('.list__empty')!;
		const main = el.shadowRoot!.querySelector<HTMLElement>('.list__main')!;
		// Nothing in [slot="empty"] is nothing to show: a bare box under the
		// search field reads as a skeleton that never loaded. The field stays.
		expect(empty.hasAttribute('hidden')).toBe(true);
		expect(main.hasAttribute('hidden')).toBe(true);
		expect(getComputedStyle(el).display).not.toBe('none');

		const dialog = document.createElement('nldd-inline-dialog');
		dialog.setAttribute('slot', 'empty');
		dialog.setAttribute('text', 'Niets gevonden');
		el.appendChild(dialog);
		await settle(el);

		expect(empty.hasAttribute('hidden')).toBe(false);
		expect(main.hasAttribute('hidden')).toBe(false);
	});

	it('Escape clears the search value and refires input', async () => {
		el = await fixture(MARKUP);
		await settle(el);
		const input = searchInput();
		input.value = 'bro';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		await settle(el);
		let cleared: string | null = null;
		el.addEventListener('input', (e: Event) => { cleared = (e as CustomEvent).detail.value; });
		keydown('Escape');
		await settle(el);
		expect(cleared).toBe('');
		expect(input.value).toBe('');
	});

	it('sets the inner action tabindex to -1 so only the search input is a tab stop', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		items.forEach(i => {
			const action = i.shadowRoot!.querySelector<HTMLElement>('.list-item__action')!;
			expect(action.getAttribute('tabindex')).toBe('-1');
		});
	});

	it('height sets a max-height and scroll on .list__items', async () => {
		el = await fixture('<nldd-list type="listbox" height="200px"><nldd-list-item button><nldd-text-cell text="Een"></nldd-text-cell></nldd-list-item></nldd-list>');
		await settle(el);
		const items = itemsEl() as HTMLElement;
		expect(getComputedStyle(items).maxHeight).toBe('200px');
		expect(getComputedStyle(items).overflowY).toBe('auto');
	});

	it('ignores an invalid height (no cap)', async () => {
		el = await fixture('<nldd-list type="listbox" height="not-a-length"><nldd-list-item button><nldd-text-cell text="Een"></nldd-text-cell></nldd-list-item></nldd-list>');
		await settle(el);
		expect(el.style.getPropertyValue('--_list-max-height')).toBe('');
	});

	it('does not run roving arrow-navigation in listbox mode', async () => {
		el = await fixture('<nldd-list type="listbox" arrow-navigation><nldd-list-item button><nldd-text-cell text="Een"></nldd-text-cell></nldd-list-item></nldd-list>');
		await settle(el);
		// arrow-navigation is superseded by the listbox keyboard: no aria-keyshortcuts.
		expect(el.hasAttribute('aria-keyshortcuts')).toBe(false);
	});

	it('hides the active highlight + aria-activedescendant when the input blurs', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(items[0].id);
		searchInput().blur();
		await waitForUpdate(el);
		await Promise.all(items.map(i => i.updateComplete));
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(null);
		expect(items[0].shadowRoot!.querySelector('.list-item.is-highlighted')).toBeNull();
	});

	it('clicking an option moves the active descendant there (resumes on refocus)', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		// Click the third option; the click moves focus out of the input.
		items[2].shadowRoot!.querySelector<HTMLElement>('.list-item__action')!.click();
		// Refocusing resumes the highlight at the clicked option, not the first.
		searchInput().focus();
		await waitForUpdate(el);
		await Promise.all(items.map(i => i.updateComplete));
		expect(searchInput().getAttribute('aria-activedescendant')).toBe(items[2].id);
		expect(items[2].shadowRoot!.querySelector('.list-item.is-highlighted')).not.toBeNull();
		expect(items[0].shadowRoot!.querySelector('.list-item.is-highlighted')).toBeNull();
	});

	it('keeps focus on the search input after Enter activates an option', async () => {
		el = await fixture(MARKUP);
		const items = await settle(el);
		let clicked = false;
		items[0].addEventListener('click', () => { clicked = true; });
		keydown('Enter');
		await waitForUpdate(el);
		expect(clicked).toBe(true);
		expect(el.shadowRoot!.activeElement).toBe(searchInput());
	});
});

describe('nldd-list — the warning about a control the row cannot reach', () => {
	let el: HTMLElement;

	// Filled on connect, not in the constructor: the parser sets the attributes
	// only after it has run that.
	class TestControl extends HTMLElement {
		connectedCallback() {
			if (this.shadowRoot) return;
			this.attachShadow({ mode: 'open' }).innerHTML = this.getAttribute('shadow') ?? '';
		}
	}
	if (!customElements.get('test-control')) customElements.define('test-control', TestControl);

	const mount = async (row: string) => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(`<nldd-list accessible-label="X"><nldd-list-item>${row}</nldd-list-item></nldd-list>`);
		await waitForUpdate(el);
		return warn.mock.calls.flat().filter(arg => String(arg).includes('keeps its tab stop'));
	};

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('warns for a custom element that keeps a tab stop of its own', async () => {
		const warnings = await mount('<test-control shadow="<button>X</button>"></test-control>');
		expect(warnings).toHaveLength(1);
	});

	it('stays silent for a control parked at a negative tabindex', async () => {
		const warnings = await mount('<test-control shadow="<div tabindex=-1></div>"></test-control>');
		expect(warnings).toHaveLength(0);
	});

	it('stays silent for a control that is not rendered', async () => {
		const warnings = await mount('<test-control style="display: none" shadow="<button>X</button>"></test-control>');
		expect(warnings).toHaveLength(0);
	});

	it('stays silent for a segment, which the row manages over its own channel', async () => {
		const warnings = await mount('<nldd-list-item-segment href="/a"><nldd-text-cell text="A"></nldd-text-cell></nldd-list-item-segment>');
		expect(warnings).toHaveLength(0);
	});
});

describe('nldd-list type="form"', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const formList = (extra = '') => `
		<nldd-list type="form" accessible-label="Properties">
			<nldd-list-item>
				<nldd-text-cell width="full" text="Due date"></nldd-text-cell>
				<nldd-cell><input id="due" value="2026-08-23"></nldd-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-text-cell width="full" text="Created"></nldd-text-cell>
				<nldd-text-cell text="Jul 24"></nldd-text-cell>
			</nldd-list-item>
			${extra}
		</nldd-list>
	`;

	it('keeps role="list" on .list__items', async () => {
		el = await fixture(formList());
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.list__items')!.getAttribute('role')).toBe('list');
		expect(el.hasAttribute('role')).toBe(false);
	});

	it('promises no arrow keys', async () => {
		el = await fixture(formList());
		await waitForUpdate(el);
		expect(el.hasAttribute('aria-keyshortcuts')).toBe(false);
		expect(el.hasAttribute('aria-description')).toBe(false);
	});

	it('leaves every row without a tab stop, so Tab reaches the controls', async () => {
		el = await fixture(formList());
		await waitForUpdate(el);
		const rows = [...el.querySelectorAll('nldd-list-item')];
		expect(rows.map((row) => row.getAttribute('tabindex'))).toEqual([null, null]);
		expect(el.querySelector('#due')!.hasAttribute('tabindex')).toBe(false);
	});

	it('does not move on an arrow key', async () => {
		el = await fixture(formList());
		await waitForUpdate(el);
		const before = document.activeElement;
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await waitForUpdate(el);
		expect(document.activeElement).toBe(before);
	});

	it('warns about a row that is an action itself', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(formList('<nldd-list-item button><nldd-text-cell text="Delete"></nldd-text-cell></nldd-list-item>'));
		await waitForUpdate(el);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('type="form"'));
		warn.mockRestore();
	});
});

describe('nldd-list roving and the controls in a row', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const rovingList = () => `
		<nldd-list accessible-label="Tasks">
			<nldd-list-item>
				<nldd-text-cell width="full" text="One"></nldd-text-cell>
				<nldd-cell><input id="field" value="typed"></nldd-cell>
			</nldd-list-item>
			<nldd-list-item button>
				<nldd-text-cell width="full" text="Two"></nldd-text-cell>
			</nldd-list-item>
		</nldd-list>
	`;

	it('stands down while the key comes from a control the row holds', async () => {
		el = await fixture(rovingList());
		await waitForUpdate(el);
		const rows = [...el.querySelectorAll('nldd-list-item')];
		const field = el.querySelector('#field') as HTMLInputElement;
		field.focus();
		await waitForUpdate(el);
		field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(document.activeElement).toBe(field);
		expect(rows[1].hasAttribute('tabindex')).toBe(false);
	});

	it('stands down for a control the roving cannot park either', async () => {
		// A combo box carries no `no-tab` and is no native tab stop, so it is not
		// in _rovingControls at all — the very control that needs the keys most.
		el = await fixture(`
			<nldd-list accessible-label="Tasks">
				<nldd-list-item>
					<nldd-text-cell width="full" text="Assigned to"></nldd-text-cell>
					<nldd-cell><nldd-combo-box text="Yara"></nldd-combo-box></nldd-cell>
				</nldd-list-item>
				<nldd-list-item button><nldd-text-cell text="Two"></nldd-text-cell></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const combo = el.querySelector('nldd-combo-box')!;
		const input = combo.shadowRoot!.querySelector('input') as HTMLInputElement;
		input.focus();
		await waitForUpdate(el);
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(document.activeElement).toBe(combo);
	});

	it('still answers an arrow key from a segment, which is what the row is', async () => {
		el = await fixture(`
			<nldd-list accessible-label="Tasks">
				<nldd-list-item>
					<nldd-list-item-segment button accessible-label="One">
						<nldd-text-cell width="full" text="One"></nldd-text-cell>
					</nldd-list-item-segment>
				</nldd-list-item>
				<nldd-list-item button><nldd-text-cell text="Two"></nldd-text-cell></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const rows = [...el.querySelectorAll('nldd-list-item')];
		const segment = el.querySelector('nldd-list-item-segment')!;
		segment.shadowRoot!.querySelector('button')!
			.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect((rows[1] as unknown as { _rovingActive: boolean })._rovingActive).toBe(true);
	});

	it('still answers an arrow key from the row itself', async () => {
		el = await fixture(rovingList());
		await waitForUpdate(el);
		const rows = [...el.querySelectorAll('nldd-list-item')];
		rows[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect((rows[1] as unknown as { _rovingActive: boolean })._rovingActive).toBe(true);
	});

	it('Escape from a control lands on its row and stops there', async () => {
		el = await fixture(rovingList());
		await waitForUpdate(el);
		const rows = [...el.querySelectorAll('nldd-list-item')];
		const field = el.querySelector('#field') as HTMLInputElement;
		field.focus();
		await waitForUpdate(el);
		const outer = vi.fn();
		document.addEventListener('keydown', outer);
		const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true });
		field.dispatchEvent(event);
		await waitForUpdate(el);
		document.removeEventListener('keydown', outer);
		expect(document.activeElement).toBe(rows[0]);
		expect(event.defaultPrevented).toBe(true);
		expect(outer).not.toHaveBeenCalled();
	});

	it('leaves the first Escape to a control showing a popover', async () => {
		el = await fixture(`
			<nldd-list accessible-label="Tasks">
				<nldd-list-item>
					<nldd-text-cell width="full" text="One"></nldd-text-cell>
					<nldd-cell>
						<span id="control"><input id="field2"><div id="pop" popover>menu</div></span>
					</nldd-cell>
				</nldd-list-item>
				<nldd-list-item button><nldd-text-cell text="Two"></nldd-text-cell></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const field = el.querySelector('#field2') as HTMLInputElement;
		const pop = el.querySelector('#pop') as HTMLElement & { showPopover(): void; hidePopover(): void };
		field.focus();
		pop.showPopover();
		await waitForUpdate(el);
		// A control closes its own menu in its own handler and lets the key travel
		// on, so the list has to read the popover on the way in, not on the way out.
		field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true }));
		pop.hidePopover();
		await waitForUpdate(el);
		expect(document.activeElement).toBe(field);
		field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true }));
		await waitForUpdate(el);
		expect(document.activeElement).toBe(el.querySelectorAll('nldd-list-item')[0]);
	});

	it('leaves Escape alone on the row, so what holds the list gets it', async () => {
		el = await fixture(rovingList());
		await waitForUpdate(el);
		const rows = [...el.querySelectorAll('nldd-list-item')];
		const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true });
		rows[0].dispatchEvent(event);
		await waitForUpdate(el);
		expect(event.defaultPrevented).toBe(false);
	});

	it('parks the row controls once focus leaves the list', async () => {
		el = await fixture(`<div>${rovingList()}<button id="after">after</button></div>`);
		const list = el.querySelector('nldd-list')!;
		await waitForUpdate(list);
		const field = el.querySelector('#field') as HTMLInputElement;
		field.focus();
		await waitForUpdate(list);
		expect(field.getAttribute('tabindex')).not.toBe('-1');
		(el.querySelector('#after') as HTMLElement).focus();
		list.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
		await new Promise((resolve) => { queueMicrotask(() => resolve(null)); });
		await waitForUpdate(list);
		expect(field.getAttribute('tabindex')).toBe('-1');
	});
});

// Two ways to show nothing, and they are not the same state. Rows filtered away
// is "no results": the search field and the toolbar are the way back, so they
// stay. No rows at all is "empty": there is nothing to search or filter, so the
// controls go with them — except in a listbox, where the search field is what
// the rows come from.
describe('nldd-list – empty and no-results', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const display = (list: Element) => getComputedStyle(list).display;
	const shown = (node: Element | null) => !!node && node.getClientRects().length > 0;
	const surface = (list: Element) => shown((list as HTMLElement & { shadowRoot: ShadowRoot })
		.shadowRoot.querySelector('.list__main'));
	const row = '<nldd-list-item><nldd-text-cell text="Appel"></nldd-text-cell></nldd-list-item>';
	const hiddenRow = '<nldd-list-item hidden><nldd-text-cell text="Appel"></nldd-text-cell></nldd-list-item>';
	const toolbar = '<nldd-button slot="toolbar" text="Sorteer"></nldd-button>';
	const emptyState = '<nldd-inline-dialog slot="empty" text="Nog geen assets"></nldd-inline-dialog>';
	const noResults = '<nldd-inline-dialog slot="no-results" text="Niets gevonden"></nldd-inline-dialog>';

	const mount = async (inner: string) => {
		el = await fixture(`<nldd-list appearance="box">${inner}</nldd-list>`);
		await waitForUpdate(el);
		return el;
	};

	it('takes itself off the page when it has no rows and nothing to say', async () => {
		await mount(toolbar);
		expect(display(el)).toBe('none');
	});

	it('hides the toolbar with the rows it belongs to', async () => {
		await mount(toolbar + emptyState);
		expect(display(el)).not.toBe('none');
		expect(shown(el.querySelector('[slot="empty"]'))).toBe(true);
		expect(shown(el.querySelector('[slot="toolbar"]'))).toBe(false);
	});

	it('keeps the toolbar when rows exist but are filtered away', async () => {
		await mount(toolbar + noResults + hiddenRow);
		expect(shown(el.querySelector('[slot="no-results"]'))).toBe(true);
		expect(shown(el.querySelector('[slot="toolbar"]'))).toBe(true);
	});

	it('falls back to the empty state when no-results is not given', async () => {
		await mount(toolbar + emptyState + hiddenRow);
		expect(shown(el.querySelector('[slot="empty"]'))).toBe(true);
		expect(shown(el.querySelector('[slot="toolbar"]'))).toBe(true);
	});

	it('says the one that fits when both are given', async () => {
		await mount(toolbar + emptyState + noResults + hiddenRow);
		expect(shown(el.querySelector('[slot="no-results"]'))).toBe(true);
		expect(shown(el.querySelector('[slot="empty"]'))).toBe(false);
	});

	it('draws no bare box when the filter matches nothing and nothing was said', async () => {
		await mount(toolbar + hiddenRow);
		expect(display(el)).not.toBe('none');
		expect(shown(el.querySelector('[slot="toolbar"]'))).toBe(true);
		expect(surface(el)).toBe(false);
	});

	it('keeps a listbox and its search field when no options arrived at all', async () => {
		el = await fixture(`<nldd-list type="listbox" appearance="box">${noResults}</nldd-list>`);
		await waitForUpdate(el);
		expect(display(el)).not.toBe('none');
		expect(shown(el.shadowRoot!.querySelector('.list__search-field-input'))).toBe(true);
	});

	it('says nothing in a listbox until a query asks the question', async () => {
		el = await fixture(`<nldd-list type="listbox" appearance="box">${emptyState}</nldd-list>`);
		await waitForUpdate(el);
		expect(shown(el.querySelector('[slot="empty"]'))).toBe(false);

		const field = el.shadowRoot!.querySelector<HTMLInputElement>('.list__search-field-input')!;
		field.value = 'zzz';
		field.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect(shown(el.querySelector('[slot="empty"]'))).toBe(true);
	});

	it('keeps a listbox search field when a query matches nothing', async () => {
		el = await fixture(`<nldd-list type="listbox" appearance="box">${noResults}${row}</nldd-list>`);
		await waitForUpdate(el);
		const field = el.shadowRoot!.querySelector<HTMLInputElement>('.list__search-field-input')!;
		field.value = 'zzz';
		field.dispatchEvent(new Event('input', { bubbles: true }));
		el.querySelector('nldd-list-item')!.setAttribute('hidden', '');
		await waitForUpdate(el);

		expect(shown(field)).toBe(true);
		expect(shown(el.querySelector('[slot="no-results"]'))).toBe(true);
	});
});
