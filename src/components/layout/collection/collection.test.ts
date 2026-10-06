import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './collection.js';

describe('nldd-collection', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-collection></nldd-collection>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to grid layout', async () => {
		el = await fixture('<nldd-collection></nldd-collection>');
		await waitForUpdate(el);
		// The default (grid) is kept out of the DOM; the property is the source of truth.
		expect((el as unknown as { layout: string }).layout).toBe('grid');
		expect(el.hasAttribute('layout')).toBe(false);
	});

	it('renders load-more button when show-load-more is set on grid layout', async () => {
		el = await fixture(`
			<nldd-collection layout="grid" show-load-more max-items="2">
				<div>Item 1</div>
				<div>Item 2</div>
				<div>Item 3</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-button')).not.toBeNull();
	});

	it('reads gap as a step of the spacing scale', async () => {
		el = await fixture('<nldd-collection gap="16"><div>Item</div></nldd-collection>');
		await waitForUpdate(el);

		// The token, not the number. Writing "16" through was the old bug: not a
		// length, so the declaration fell away and the gap became zero in silence.
		// A plain gap fills all three breakpoints, which is what the styles read.
		expect(el.style.getPropertyValue('--_collection-sm-gap')).toBe('var(--primitives-space-16)');
		expect(el.style.getPropertyValue('--_collection-md-gap')).toBe('var(--primitives-space-16)');
		expect(el.style.getPropertyValue('--_collection-lg-gap')).toBe('var(--primitives-space-16)');
	});

	it('lets a breakpoint gap override the plain one', async () => {
		el = await fixture(
			'<nldd-collection gap="8" lg-gap="32"><div>Item</div></nldd-collection>',
		);
		await waitForUpdate(el);

		expect(el.style.getPropertyValue('--_collection-sm-gap')).toBe('var(--primitives-space-8)');
		expect(el.style.getPropertyValue('--_collection-md-gap')).toBe('var(--primitives-space-8)');
		expect(el.style.getPropertyValue('--_collection-lg-gap')).toBe('var(--primitives-space-32)');
	});

	// The breakpoint blocks swap --_collection-gap between the three, so writing a plain gap
	// to --_collection-gap itself would beat them from the style attribute and the 32 below
	// would never reach the screen.
	it('renders the breakpoint gap beside a plain one, per container width', async () => {
		const wrapper = (width: string) =>
			`<div style="container-type: inline-size; container-name: layout-container; width: ${width};`
			+ ' --primitives-space-8: 8px; --primitives-space-32: 32px;">'
			+ '<nldd-collection gap="8" md-gap="32"><div>Item</div></nldd-collection></div>';

		el = await fixture(wrapper('800px'));
		let collection = el.querySelector('nldd-collection')!;
		await waitForUpdate(collection);
		let items = collection.shadowRoot!.querySelector('.collection__items')!;
		expect(getComputedStyle(items).gap).toBe('32px');

		cleanup(el);
		el = await fixture(wrapper('320px'));
		collection = el.querySelector('nldd-collection')!;
		await waitForUpdate(collection);
		items = collection.shadowRoot!.querySelector('.collection__items')!;
		expect(getComputedStyle(items).gap).toBe('8px');
	});

	it('refuses anything that is not a step rather than collapsing', async () => {
		// A number off the scale: var(--primitives-space-23) does not exist, so
		// writing it would be the silent zero this is here to stop.
		el = await fixture('<nldd-collection gap="23"><div>Item</div></nldd-collection>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_collection-sm-gap')).toBe('');

		// And a length, which is a value beside the scale rather than on it.
		cleanup(el);
		el = await fixture('<nldd-collection gap="23px"><div>Item</div></nldd-collection>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_collection-sm-gap')).toBe('');
	});

	it('lays lanes out in columns of the item width', async () => {
		el = await fixture(`
			<nldd-collection layout="lanes" item-width="200px" style="width: 640px;">
				<div>Item 1</div>
				<div>Item 2</div>
				<div>Item 3</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);
		const items = el.shadowRoot!.querySelector('.collection__items')!;
		const columns = getComputedStyle(items).gridTemplateColumns.split(' ');

		expect(columns.length).toBe(3);
	});

	it('keeps the load-more button on lanes', async () => {
		// Where grid keeps it and horizontal-scroll does not: lanes pages like a
		// grid, which is also why its fallback is one.
		el = await fixture(`
			<nldd-collection layout="lanes" show-load-more max-items="2">
				<div>Item 1</div>
				<div>Item 2</div>
				<div>Item 3</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('nldd-button')).not.toBeNull();
	});

	it('does not render load-more button on horizontal-scroll layout', async () => {
		el = await fixture(`
			<nldd-collection layout="horizontal-scroll" show-load-more>
				<div>Item 1</div>
				<div>Item 2</div>
				<div>Item 3</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-button')).toBeNull();
	});

	it('renders scroll navigation when horizontal content overflows', async () => {
		el = await fixture(`
			<nldd-collection layout="horizontal-scroll" style="width: 200px;">
				<div style="width: 300px; flex-shrink: 0;">Item 1</div>
				<div style="width: 300px; flex-shrink: 0;">Item 2</div>
				<div style="width: 300px; flex-shrink: 0;">Item 3</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);
		await waitForUpdate(el); // wait for ResizeObserver/scroll-listener to settle
		expect(el.shadowRoot!.querySelectorAll('nldd-icon-button').length).toBe(2);
		expect(el.hasAttribute('scrollable')).toBe(true);
	});

	it('hides the scroll navigation when horizontal content fits', async () => {
		el = await fixture(`
			<nldd-collection layout="horizontal-scroll" style="width: 1000px;">
				<div style="width: 100px;">Item 1</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);
		await waitForUpdate(el); // wait for ResizeObserver/scroll-listener to settle
		expect(el.shadowRoot!.querySelectorAll('nldd-icon-button').length).toBe(0);
		expect(el.shadowRoot!.querySelector('.collection__footer')!.hasAttribute('hidden')).toBe(true);
		expect(el.hasAttribute('scrollable')).toBe(false);
	});

	it('updates overflow state when items are added at runtime (no resize needed)', async () => {
		el = await fixture(`
			<nldd-collection layout="horizontal-scroll" style="width: 200px;">
				<div style="width: 100px; flex-shrink: 0;">Item 1</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);
		await waitForUpdate(el); // wait for ResizeObserver/scroll-listener to settle
		expect(el.hasAttribute('scrollable')).toBe(false);
		for (let i = 0; i < 3; i++) {
			const item = document.createElement('div');
			item.style.cssText = 'width: 300px; flex-shrink: 0;';
			item.textContent = 'Extra';
			el.appendChild(item);
		}
		await waitForUpdate(el);
		await waitForUpdate(el); // wait for ResizeObserver/scroll-listener to settle
		expect(el.hasAttribute('scrollable')).toBe(true);
		expect(el.shadowRoot!.querySelectorAll('nldd-icon-button').length).toBe(2);
	});

	it('fires load-more event when button is clicked', async () => {
		el = await fixture(`
			<nldd-collection layout="grid" show-load-more max-items="2">
				<div>Item 1</div>
				<div>Item 2</div>
				<div>Item 3</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);
		await waitForUpdate(el); // wait for slotchange to trigger re-render
		let fired = false;
		el.addEventListener('load-more', () => { fired = true; });
		el.shadowRoot!.querySelector('nldd-button')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
		expect(fired).toBe(true);
	});

	it('horizontal-scroll items get tabindex=0 when content overflows', async () => {
		el = await fixture(`
			<nldd-collection layout="horizontal-scroll" style="width: 200px;">
				<div style="width: 300px; flex-shrink: 0;">Item 1</div>
				<div style="width: 300px; flex-shrink: 0;">Item 2</div>
				<div style="width: 300px; flex-shrink: 0;">Item 3</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);
		await waitForUpdate(el); // wait for ResizeObserver/scroll-listener to settle
		const itemsEl = el.shadowRoot!.querySelector<HTMLElement>('.collection__items')!;
		expect(itemsEl.getAttribute('tabindex')).toBe('0');
		expect(itemsEl.getAttribute('aria-label')).toBe('Collectie');
	});

	it('horizontal-scroll items skip tabindex when content fits', async () => {
		el = await fixture(`
			<nldd-collection layout="horizontal-scroll" style="width: 1000px;">
				<div style="width: 100px;">Item 1</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);
		await waitForUpdate(el); // wait for ResizeObserver/scroll-listener to settle
		const itemsEl = el.shadowRoot!.querySelector<HTMLElement>('.collection__items')!;
		expect(itemsEl.hasAttribute('tabindex')).toBe(false);
	});

	it('grid layout never gets tabindex regardless of overflow', async () => {
		el = await fixture(`
			<nldd-collection layout="grid">
				<div>Item 1</div>
			</nldd-collection>
		`);
		await waitForUpdate(el);
		const itemsEl = el.shadowRoot!.querySelector<HTMLElement>('.collection__items')!;
		expect(itemsEl.hasAttribute('tabindex')).toBe(false);
	});

	it('the gap attribute fills every breakpoint, and clearing it gives them back', async () => {
		el = await fixture('<nldd-collection gap="8"><div>Item 1</div></nldd-collection>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_collection-md-gap')).toBe('var(--primitives-space-8)');
		// Clearing it restores the responsive default (no inline override).
		(el as HTMLElement & { gap?: string }).gap = '';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_collection-md-gap')).toBe('');
	});

	// The arrows used to step by a fixed item + gap. From the end of the strip,
	// which is not a whole number of items, that remainder never went away and
	// every item stayed clipped. They snap to item edges now.
	const scrollFixture = `
		<div style="width: 300px;">
			<nldd-collection layout="horizontal-scroll" item-width="200px" style="--_collection-gap: 24px;">
				<div style="width: 200px; height: 40px;"></div>
				<div style="width: 200px; height: 40px;"></div>
				<div style="width: 200px; height: 40px;"></div>
			</nldd-collection>
		</div>
	`;

	// Item start positions in scroll coordinates, the same thing _scrollBy aims at.
	function itemStarts(collection: HTMLElement): number[] {
		const items = collection.shadowRoot!.querySelector('.collection__items') as HTMLElement;
		const slot = items.querySelector('slot') as HTMLSlotElement;
		const left = items.getBoundingClientRect().left;
		return slot.assignedElements().map(item =>
			Math.round(item.getBoundingClientRect().left - left + items.scrollLeft),
		);
	}

	it('springt met de pijl naar de volgende itemgrens', async () => {
		el = await fixture(scrollFixture);
		const collection = el.querySelector('nldd-collection') as HTMLElement;
		await waitForUpdate(collection);
		const items = collection.shadowRoot!.querySelector('.collection__items') as HTMLElement;
		expect(items.scrollWidth).toBeGreaterThan(items.clientWidth);
		const starts = itemStarts(collection);
		let target: number | undefined;
		items.scrollTo = ((options: ScrollToOptions) => { target = options.left; }) as typeof items.scrollTo;
		(collection as unknown as { _scrollBy(d: 1 | -1): void })._scrollBy(1);
		expect(target).toBe(starts[1]);
	});

	it('landt terug op een itemgrens vanaf een positie die daar niet op ligt', async () => {
		el = await fixture(scrollFixture);
		const collection = el.querySelector('nldd-collection') as HTMLElement;
		await waitForUpdate(collection);
		const items = collection.shadowRoot!.querySelector('.collection__items') as HTMLElement;
		const starts = itemStarts(collection);
		// Halfway through the second item, as after a scroll that stopped at the
		// end. Smooth scrolling would animate the assignment and mandatory snapping
		// would pull it straight back to a boundary, so both are off here: this is
		// exactly the position a browser (Safari) does end up in after a
		// programmatic scroll.
		items.style.scrollBehavior = 'auto';
		items.style.scrollSnapType = 'none';
		items.scrollLeft = starts[1] + 30;
		expect(items.scrollLeft).toBeGreaterThan(starts[1]);
		let target: number | undefined;
		items.scrollTo = ((options: ScrollToOptions) => { target = options.left; }) as typeof items.scrollTo;
		(collection as unknown as { _scrollBy(d: 1 | -1): void })._scrollBy(-1);
		expect(target).toBe(starts[1]);
	});

	// A disabled button cannot hold focus: the browser drops it to the body and
	// the next Tab starts back at the top of the page.
	it('verlegt de focus naar de andere pijl als de gefocuste pijl uitvalt', async () => {
		el = await fixture(scrollFixture);
		const collection = el.querySelector('nldd-collection') as HTMLElement;
		await waitForUpdate(collection);
		const items = collection.shadowRoot!.querySelector('.collection__items') as HTMLElement;
		const [previous, next] = collection.shadowRoot!.querySelectorAll<HTMLElement>('nldd-icon-button');

		next.focus();
		expect(collection.shadowRoot!.activeElement).toBe(next);

		// Scrolling to the end disables the next button.
		items.style.scrollBehavior = 'auto';
		items.scrollLeft = items.scrollWidth;
		items.dispatchEvent(new Event('scroll'));
		await waitForUpdate(collection);
		await (collection as unknown as { updateComplete: Promise<unknown> }).updateComplete;

		expect((next as HTMLElement & { disabled: boolean }).disabled).toBe(true);
		expect(collection.shadowRoot!.activeElement).toBe(previous);
	});
});
