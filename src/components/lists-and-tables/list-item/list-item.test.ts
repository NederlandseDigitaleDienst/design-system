import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement, installUniversalReset, nextFrames } from '../../../test-utils.js';
import { _resetInputModalityForTesting, getInputModality } from '../../../utilities/input-modality.js';
import './list-item.js';
import type { NLDDListItem } from './list-item.js';
import '../list/list.js';
import '../cells/text-cell/text-cell.js';
import '../cells/spacer-cell/spacer-cell.js';
import '../list-item-segment/list-item-segment.js';
import '../cells/icon-cell/icon-cell.js';
import '../cells/cell/cell.js';
import '../../content/avatar/avatar.js';
import '../../content/tag/tag.js';
import '../../inputs/radio-button/radio-button.js';

describe('nldd-list-item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-list-item></nldd-list-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to md size', async () => {
		el = await fixture('<nldd-list-item></nldd-list-item>');
		await waitForUpdate(el);
		expect((el as unknown as { size: string }).size).toBe('md');
		expect(el.hasAttribute('size')).toBe(false);
	});

	it('reflects selected attribute', async () => {
		el = await fixture('<nldd-list-item selected></nldd-list-item>');
		await waitForUpdate(el);
		expect(el.hasAttribute('selected')).toBe(true);
	});

	it('renders a div by default', async () => {
		el = await fixture('<nldd-list-item></nldd-list-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('div.list-item')).not.toBeNull();
	});

	it('renders a button when button is set', async () => {
		el = await fixture('<nldd-list-item button></nldd-list-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button.list-item__action')).not.toBeNull();
	});

	it('renders an anchor when href is set', async () => {
		el = await fixture('<nldd-list-item href="/test"></nldd-list-item>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a.list-item__action');
		expect(anchor).not.toBeNull();
		expect(anchor?.getAttribute('href')).toBe('/test');
	});

	it('href wins over button when both are set', async () => {
		el = await fixture('<nldd-list-item button href="/test"></nldd-list-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a.list-item__action')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('button')).toBeNull();
	});

	it('forwards target and rel to the anchor', async () => {
		el = await fixture('<nldd-list-item href="/test" target="_blank" rel="noopener noreferrer"></nldd-list-item>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a.list-item__action');
		expect(anchor?.getAttribute('target')).toBe('_blank');
		expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('omits target and rel when not set', async () => {
		el = await fixture('<nldd-list-item href="/test"></nldd-list-item>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a.list-item__action');
		expect(anchor?.hasAttribute('target')).toBe(false);
		expect(anchor?.hasAttribute('rel')).toBe(false);
	});

	it('injects a visually hidden "opens in new tab" announcement into the link when target="_blank"', async () => {
		el = await fixture('<nldd-list-item href="/test" target="_blank"></nldd-list-item>');
		await waitForUpdate(el);
		const hint = el.shadowRoot!.querySelector('a.list-item__action .list-item__opens-in-new-tab-hint');
		expect(hint).not.toBeNull();
		expect(hint?.textContent).toBe('Opent in nieuw tabblad');
	});

	it('does not add the new-tab announcement for same-tab links', async () => {
		el = await fixture('<nldd-list-item href="/test"></nldd-list-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.list-item__opens-in-new-tab-hint')).toBeNull();
	});

	it('lets the consumer override the new-tab announcement via translations', async () => {
		el = await fixture('<nldd-list-item href="/test" target="_blank"></nldd-list-item>');
		(el as unknown as { translations: Record<string, string> }).translations = {
			'components.list-item.opens-in-new-tab-label': 'opens in a new tab',
		};
		await waitForUpdate(el);
		const hint = el.shadowRoot!.querySelector('.list-item__opens-in-new-tab-hint');
		expect(hint?.textContent).toBe('opens in a new tab');
	});

	it('sets is-boxed class when inside a box list', async () => {
		const wrapper = await fixture(`
			<nldd-list variant="box-tinted">
				<nldd-list-item></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(wrapper);
		el = wrapper.querySelector('nldd-list-item')!;
		await waitForUpdate(el);
		expect(el.classList.contains('is-boxed')).toBe(true);
	});

	it('does not set is-boxed class when inside a simple list', async () => {
		const wrapper = await fixture(`
			<nldd-list variant="simple">
				<nldd-list-item></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(wrapper);
		el = wrapper.querySelector('nldd-list-item')!;
		await waitForUpdate(el);
		expect(el.classList.contains('is-boxed')).toBe(false);
	});

	it('renders all content in one flat slot (start/end slots are gone)', async () => {
		const wrapper = await fixture(`
			<nldd-list variant="simple">
				<nldd-list-item>
					<nldd-text-cell text="Inhoud"></nldd-text-cell>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(wrapper);
		el = wrapper.querySelector('nldd-list-item')!;
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('slot[name="start"]')).toBeNull();
		expect(el.shadowRoot!.querySelector('slot[name="end"]')).toBeNull();
		expect(el.shadowRoot!.querySelector('.list-item slot:not([name])')).not.toBeNull();
	});


	it('matches [selected]:focus-within when focused on the action', async () => {
		// The :host([selected]:focus-within) CSS rule promotes a selected item
		// to the highlighted state on focus. Verify the selector semantics
		// (which the CSS then keys off of).
		el = await fixture('<nldd-list-item button selected></nldd-list-item>');
		await waitForUpdate(el);
		const action = el.shadowRoot!.querySelector<HTMLButtonElement>('.list-item__action')!;

		expect(el.matches('[selected]:focus-within')).toBe(false);
		action.focus();
		await waitForUpdate(el);
		expect(el.matches('[selected]:focus-within')).toBe(true);
		action.blur();
		await waitForUpdate(el);
		expect(el.matches('[selected]:focus-within')).toBe(false);
	});


	it('forces focus on the action on click (Safari/Firefox workaround)', async () => {
		el = await fixture('<nldd-list-item button></nldd-list-item>');
		await waitForUpdate(el);
		const action = el.shadowRoot!.querySelector<HTMLButtonElement>('.list-item__action')!;
		action.click();
		await waitForUpdate(el);
		expect(el.shadowRoot!.activeElement).toBe(action);
	});


	// — Mouse-focus suppression ————————————————————————————————————————————

	describe('is-pointer-focus', () => {
		beforeEach(() => {
			_resetInputModalityForTesting();
			getInputModality(); // re-register document listeners
		});

		it('adds is-pointer-focus class on mouse focus', async () => {
			el = await fixture('<nldd-list-item button></nldd-list-item>');
			await waitForUpdate(el);
			document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' }));
			const action = el.shadowRoot!.querySelector('.list-item__action') as HTMLElement;
			action.focus();
			await waitForUpdate(el);
			expect(action.classList.contains('is-pointer-focus')).toBe(true);
		});

		it('does not add is-pointer-focus class on keyboard focus', async () => {
			el = await fixture('<nldd-list-item button></nldd-list-item>');
			await waitForUpdate(el);
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
			const action = el.shadowRoot!.querySelector('.list-item__action') as HTMLElement;
			action.focus();
			await waitForUpdate(el);
			expect(action.classList.contains('is-pointer-focus')).toBe(false);
		});

		it('removes is-pointer-focus class on blur', async () => {
			el = await fixture('<nldd-list-item button></nldd-list-item>');
			await waitForUpdate(el);
			document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' }));
			const action = el.shadowRoot!.querySelector('.list-item__action') as HTMLElement;
			action.focus();
			await waitForUpdate(el);
			action.blur();
			await waitForUpdate(el);
			expect(action.classList.contains('is-pointer-focus')).toBe(false);
		});
	});


	// — Parent type sync: content (default) ——————————————————————————————————

	it('content parent: role="listitem", no aria-selected', async () => {
		const wrapper = await fixture(`
			<nldd-list>
				<nldd-list-item selected></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(wrapper);
		el = wrapper.querySelector('nldd-list-item')!;
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('listitem');
		expect(el.hasAttribute('aria-selected')).toBe(false);
	});


	// — Parent type sync: navigation —————————————————————————————————————————

	it('current puts aria-current="page" on the inner action', async () => {
		el = await fixture<NLDDListItem>(`
			<nldd-list type="navigation" aria-label="Menu">
				<nldd-list-item href="/racks" current><nldd-text-cell text="Racks"></nldd-text-cell></nldd-list-item>
			</nldd-list>
		`);
		const item = el.querySelector('nldd-list-item') as NLDDListItem;
		await waitForUpdate(item);
		expect(item.shadowRoot?.querySelector('a')?.getAttribute('aria-current')).toBe('page');
	});

	it('current reflects, so the styles can key off it', async () => {
		el = await fixture<NLDDListItem>('<nldd-list-item current><nldd-text-cell text="Racks"></nldd-text-cell></nldd-list-item>');
		const item = (el.tagName === 'NLDD-LIST-ITEM' ? el : el.querySelector('nldd-list-item')) as NLDDListItem;
		await waitForUpdate(item);
		expect(item.hasAttribute('current')).toBe(true);
		item.current = false;
		await waitForUpdate(item);
		expect(item.hasAttribute('current')).toBe(false);
	});

	it('navigation parent: aria-current="page" on inner anchor when selected', async () => {
		const wrapper = await fixture(`
			<nldd-list type="navigation">
				<nldd-list-item id="a" href="/a" selected></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(wrapper);
		el = wrapper.querySelector('#a') as HTMLElement;
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a.list-item__action');
		expect(anchor?.getAttribute('aria-current')).toBe('page');
	});

	it('navigation parent: aria-current="page" on inner button when selected', async () => {
		const wrapper = await fixture(`
			<nldd-list type="navigation">
				<nldd-list-item id="a" button selected></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(wrapper);
		el = wrapper.querySelector('#a') as HTMLElement;
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('button.list-item__action');
		expect(button?.getAttribute('aria-current')).toBe('page');
	});

	it('navigation parent: removes aria-current when selected is toggled off', async () => {
		const wrapper = await fixture(`
			<nldd-list type="navigation">
				<nldd-list-item id="a" href="/a" selected></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(wrapper);
		el = wrapper.querySelector('#a') as HTMLElement;
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a.list-item__action');
		expect(anchor?.getAttribute('aria-current')).toBe('page');

		el.removeAttribute('selected');
		await waitForUpdate(el);
		expect(anchor?.hasAttribute('aria-current')).toBe(false);
	});


	// — Parent type sync: switching at runtime ————————————————————————————————

	it('re-syncs ARIA when parent list type changes', async () => {
		const wrapper = await fixture(`
			<nldd-list>
				<nldd-list-item id="a" href="/a" selected></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(wrapper);
		el = wrapper.querySelector('#a') as HTMLElement;
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a.list-item__action');
		expect(anchor?.hasAttribute('aria-current')).toBe(false);

		wrapper.setAttribute('type', 'navigation');
		// MutationObserver fires async — wait a tick
		await waitForUpdate(wrapper);
		await waitForUpdate(el);
		expect(anchor?.getAttribute('aria-current')).toBe('page');
	});

	it('focus() delegates to the inner .list-item__action', async () => {
		const el = await fixture<HTMLElement>('<nldd-list-item href="#">Item</nldd-list-item>');
		await waitForUpdate(el);
		el.focus();
		const action = el.shadowRoot!.querySelector('.list-item__action');
		expect(deepActiveElement()).toBe(action);
		cleanup(el);
	});

	it('shows press feedback on pointerdown and clears it on pointercancel (touch-scroll)', async () => {
		el = await fixture('<nldd-list-item button>Item</nldd-list-item>');
		await waitForUpdate(el);
		const action = el.shadowRoot!.querySelector('.list-item__action')!;
		el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
		expect(action.classList.contains('is-pressed')).toBe(true);
		// A touch that becomes a scroll fires pointercancel — the press must clear.
		el.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, composed: true }));
		expect(action.classList.contains('is-pressed')).toBe(false);
	});

	it('clears press feedback when the button is let go outside the row', async () => {
		el = await fixture('<nldd-list-item button text="Rij"></nldd-list-item>');
		await waitForUpdate(el);
		const action = el.shadowRoot!.querySelector('.list-item__action')!;
		el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
		expect(action.classList.contains('is-pressed')).toBe(true);
		// Let go somewhere else entirely: the row never sees this event.
		document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));
		expect(action.classList.contains('is-pressed')).toBe(false);
	});

	it('clears press feedback on pointerup', async () => {
		el = await fixture('<nldd-list-item button>Item</nldd-list-item>');
		await waitForUpdate(el);
		const action = el.shadowRoot!.querySelector('.list-item__action')!;
		el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
		expect(action.classList.contains('is-pressed')).toBe(true);
		el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));
		expect(action.classList.contains('is-pressed')).toBe(false);
	});
});

describe('nldd-list-item – checkbox row', () => {
	let el: NLDDListItem;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const mount = async (attrs = ''): Promise<NLDDListItem> => {
		el = await fixture<NLDDListItem>(`<nldd-list><nldd-list-item ${attrs}><nldd-text-cell text="AI"></nldd-text-cell></nldd-list-item></nldd-list>`)
			.then((list) => list.querySelector('nldd-list-item') as NLDDListItem);
		await waitForUpdate(el);
		return el;
	};

	const action = (item: NLDDListItem): HTMLElement =>
		item.shadowRoot!.querySelector('.list-item__action') as HTMLElement;

	it('renders the action as a checkbox with its state', async () => {
		await mount('checkbox');
		expect(action(el).tagName).toBe('BUTTON');
		expect(action(el).getAttribute('role')).toBe('checkbox');
		expect(action(el).getAttribute('aria-checked')).toBe('false');
	});

	it('reflects checked into aria-checked', async () => {
		await mount('checkbox checked');
		expect(action(el).getAttribute('aria-checked')).toBe('true');
	});

	it('toggles and fires change when the row is activated', async () => {
		await mount('checkbox');
		const seen: boolean[] = [];
		el.addEventListener('change', (e: Event) => seen.push((e as CustomEvent).detail.checked));
		action(el).click();
		await waitForUpdate(el);
		expect(el.checked).toBe(true);
		expect(action(el).getAttribute('aria-checked')).toBe('true');
		action(el).click();
		await waitForUpdate(el);
		expect(el.checked).toBe(false);
		expect(seen).toEqual([true, false]);
	});

	it('lets href win over checkbox', async () => {
		await mount('checkbox href="/ergens"');
		expect(action(el).tagName).toBe('A');
		expect(action(el).getAttribute('role')).toBeNull();
	});
});

describe('nldd-list-item – radio row', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('is a radio carrying its own checked state', async () => {
		el = await fixture('<nldd-list-item radio checked><nldd-text-cell text="Error"></nldd-text-cell></nldd-list-item>');
		await waitForUpdate(el);
		const action = el.shadowRoot!.querySelector('.list-item__action')!;
		expect(action.getAttribute('role')).toBe('radio');
		expect(action.getAttribute('aria-checked')).toBe('true');
	});

	it('becomes checked on activation and says so once', async () => {
		el = await fixture('<nldd-list-item radio><nldd-text-cell text="Error"></nldd-text-cell></nldd-list-item>');
		await waitForUpdate(el);
		const changes: boolean[] = [];
		el.addEventListener('change', (e) => changes.push((e as CustomEvent).detail.checked));
		const action = el.shadowRoot!.querySelector('.list-item__action') as HTMLElement;
		action.click();
		await waitForUpdate(el);
		expect(el.hasAttribute('checked')).toBe(true);
		// Picking what you already picked is not a change, and not a way to
		// unpick it either.
		action.click();
		await waitForUpdate(el);
		expect(el.hasAttribute('checked')).toBe(true);
		expect(changes).toEqual([true]);
	});

	it('leaves the choice to href and checkbox, which both outrank it', async () => {
		el = await fixture('<nldd-list-item radio checkbox><nldd-text-cell text="Error"></nldd-text-cell></nldd-list-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.list-item__action')!.getAttribute('role')).toBe('checkbox');
	});
});

describe('nldd-list-item – checked action selects the row', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const blockOf = (item: Element) =>
		item.shadowRoot!.querySelector('.list-item') as HTMLElement;

	it('paints the whole row when a checkbox action is checked', async () => {
		el = await fixture<HTMLElement>(
			`<nldd-list type="tree" accessible-label="X">
				<nldd-list-item>
					<nldd-list-item-segment button disclosure accessible-label="Klap uit"></nldd-list-item-segment>
					<nldd-list-item-segment checkbox width="full" accessible-label="Kies">
						<nldd-text-cell text="Ministeries"></nldd-text-cell>
					</nldd-list-item-segment>
				</nldd-list-item>
			</nldd-list>`,
		);
		await waitForUpdate(el);
		const item = el.querySelector('nldd-list-item')!;
		const action = el.querySelector('nldd-list-item-segment[checkbox]')!;
		expect(blockOf(item).classList.contains('is-action-checked')).toBe(false);

		// setAttribute, not click: consumers check rows programmatically too.
		action.setAttribute('checked', '');
		await waitForUpdate(item as NLDDListItem);
		expect(blockOf(item).classList.contains('is-action-checked')).toBe(true);

		action.removeAttribute('checked');
		await waitForUpdate(item as NLDDListItem);
		expect(blockOf(item).classList.contains('is-action-checked')).toBe(false);
	});

	it('does not light up an ancestor row for a checked nested row', async () => {
		el = await fixture<HTMLElement>(
			`<nldd-list type="tree" accessible-label="X">
				<nldd-list-item expanded>
					<nldd-list-item-segment checkbox width="full" accessible-label="Ouder">
						<nldd-text-cell text="Tak"></nldd-text-cell>
					</nldd-list-item-segment>
					<nldd-list-item slot="children">
						<nldd-list-item-segment checkbox checked width="full" accessible-label="Kind">
							<nldd-text-cell text="Blad"></nldd-text-cell>
						</nldd-list-item-segment>
					</nldd-list-item>
				</nldd-list-item>
			</nldd-list>`,
		);
		await waitForUpdate(el);
		const [outer, inner] = [...el.querySelectorAll('nldd-list-item')];
		await waitForUpdate(inner as NLDDListItem);
		expect(blockOf(inner).classList.contains('is-action-checked')).toBe(true);
		expect(blockOf(outer).classList.contains('is-action-checked')).toBe(false);
	});
});

describe('nldd-list-item – widened geometry', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const settle = () => new Promise(resolve => setTimeout(resolve, 60));

	it('keeps content on the same grid for plain and interactive rows', async () => {
		el = await fixture(`
			<div style="padding: 40px; width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item><nldd-text-cell text="Plain"></nldd-text-cell></nldd-list-item>
					<nldd-list-item button><nldd-text-cell text="Actie"></nldd-text-cell></nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		const [plain, action] = [...el.querySelectorAll('nldd-text-cell')];
		expect(action.getBoundingClientRect().left).toBeCloseTo(plain.getBoundingClientRect().left, 1);
	});

	it('marks rows with an action as is-interactive', async () => {
		el = await fixture(`
			<nldd-list accessible-label="X">
				<nldd-list-item><nldd-text-cell text="Plain"></nldd-text-cell></nldd-list-item>
				<nldd-list-item button><nldd-text-cell text="Knop"></nldd-text-cell></nldd-list-item>
				<nldd-list-item>
					<nldd-list-item-segment button accessible-label="Action"></nldd-list-item-segment>
					<nldd-text-cell text="Segmentrij"></nldd-text-cell>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		await settle();
		const [plain, button, actionRow] = [...el.querySelectorAll('nldd-list-item')];
		expect(plain.classList.contains('is-interactive')).toBe(false);
		expect(button.classList.contains('is-interactive')).toBe(true);
		expect(actionRow.classList.contains('is-interactive')).toBe(true);
	});

	it('makes the painted overhang clickable on a row-wide action', async () => {
		el = await fixture(`
			<div style="padding: 40px; width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item button><nldd-text-cell text="Actie"></nldd-text-cell></nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		const item = el.querySelector('nldd-list-item')!;
		const cell = el.querySelector('nldd-text-cell')!;
		const cellRect = cell.getBoundingClientRect();
		// 4px into the overhang, left of the content grid.
		const hit = document.elementFromPoint(cellRect.left - 4, cellRect.top + cellRect.height / 2);
		expect(hit === item || item.contains(hit as Node)).toBe(true);
	});

	it('moves a leading action out to the row edge, without making it wider', async () => {
		el = await fixture(`
			<div style="padding: 40px; width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px;">
				<nldd-list type="tree" accessible-label="X">
					<nldd-list-item>
						<nldd-list-item-segment button disclosure accessible-label="Klap"></nldd-list-item-segment>
						<nldd-text-cell text="Rij"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const row = el.querySelector('nldd-list-item')!;
		const action = el.querySelector('nldd-list-item-segment')!;
		const rowRect = row.getBoundingClientRect();
		const actionRect = action.getBoundingClientRect();
		// The action starts at the row's own (widened) edge — exactly where a
		// row-wide action's fill and hit area would start...
		expect(Math.round(actionRect.left - rowRect.left)).toBe(0);
		// ...and it shifted there rather than grown: the footprint stays the
		// control size, so its trailing edge moves out by the same 8px.
		expect(Math.round(actionRect.width)).toBe(44);
		expect(Math.round(actionRect.right - rowRect.left)).toBe(44);
	});

	it('puts the text of a leading action on the same grid as a plain row', async () => {
		el = await fixture(`
			<div style="padding: 40px; width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px;">
				<nldd-list accessible-label="X">
					<nldd-list-item><nldd-text-cell text="Plain"></nldd-text-cell></nldd-list-item>
					<nldd-list-item>
						<nldd-list-item-segment button width="full" accessible-label="Actie">
							<nldd-text-cell text="Action"></nldd-text-cell>
						</nldd-list-item-segment>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const [plainCell, actionCell] = [...el.querySelectorAll('nldd-text-cell')];
		expect(actionCell!.getBoundingClientRect().left)
			.toBeCloseTo(plainCell!.getBoundingClientRect().left, 1);
	});

	it('lets a trailing action absorb the end edge only', async () => {
		el = await fixture(`
			<div style="padding: 40px; width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-text-cell text="Rij"></nldd-text-cell>
						<nldd-list-item-segment button accessible-label="Meer"></nldd-list-item-segment>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const row = el.querySelector('nldd-list-item')!;
		const action = el.querySelector('nldd-list-item-segment')!;
		expect(Math.round(row.getBoundingClientRect().right - action.getBoundingClientRect().right)).toBe(0);
		expect(Math.round(action.getBoundingClientRect().width)).toBe(44);
	});

	it('still sees its trailing action on a branch row with child rows', async () => {
		el = await fixture(`
			<div style="padding: 40px; width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px;">
				<nldd-list type="tree" accessible-label="X">
					<nldd-list-item expanded>
						<nldd-list-item-segment button disclosure accessible-label="Klap"></nldd-list-item-segment>
						<nldd-list-item-segment button width="full" accessible-label="Kies">
							<nldd-text-cell text="Tak"></nldd-text-cell>
						</nldd-list-item-segment>
						<nldd-list-item slot="children">
							<nldd-text-cell text="Blad"></nldd-text-cell>
						</nldd-list-item>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const branch = el.querySelector('nldd-list-item')!;
		// The child rows sit in the `children` slot and must not be mistaken for
		// the row's own last child — otherwise the trailing action stops short
		// of the row edge while the child rows below it do reach it.
		expect(branch.classList.contains('has-trailing-segment')).toBe(true);
		const actions = branch.querySelectorAll(':scope > nldd-list-item-segment');
		const trailing = actions[actions.length - 1]!;
		expect(Math.round(branch.getBoundingClientRect().right - trailing.getBoundingClientRect().right)).toBe(0);
	});

	it('leaves a mid-row action on the grid', async () => {
		el = await fixture(`
			<div style="padding: 40px; width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-text-cell text="Rij"></nldd-text-cell>
						<nldd-list-item-segment button accessible-label="Midden"></nldd-list-item-segment>
						<nldd-text-cell text="Achter"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const action = el.querySelector('nldd-list-item-segment')!;
		// No edge to absorb: the plain control-size footprint.
		expect(Math.round(action.getBoundingClientRect().width)).toBe(44);
	});
});

describe('nldd-list-item – divider markers', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const settle = () => new Promise(resolve => setTimeout(resolve, 80));

	it('runs the divider from a divider-start cell', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-spacer-cell size="40"></nldd-spacer-cell>
						<nldd-text-cell divider-start text="Vanaf hier"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		const inset = parseFloat(item.style.getPropertyValue('--_divider-inset-start'));
		expect(inset).toBeGreaterThanOrEqual(40);
		expect(item.style.getPropertyValue('--_divider-inset-end')).toBe('');
	});

	// A row that opens with an icon already lines the divider up with the text, so
	// every list does that consistently without having to set markers.
	it('laat de divider vanzelf bij de tekst beginnen na een leidend icoon', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-icon-cell size="20"><nldd-icon icon="star"></nldd-icon></nldd-icon-cell>
						<nldd-spacer-cell size="40"></nldd-spacer-cell>
						<nldd-text-cell text="Met icoon"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		const inset = parseFloat(item.style.getPropertyValue('--_divider-inset-start'));
		expect(inset).toBeGreaterThanOrEqual(40);
	});

	// The marker overrides the derivation: on the icon cell you get the full line back.
	it('geeft de volle lijn terug met divider-start op de icoon-cel', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-icon-cell divider-start size="20"><nldd-icon icon="star"></nldd-icon></nldd-icon-cell>
						<nldd-spacer-cell size="40"></nldd-spacer-cell>
						<nldd-text-cell text="Met icoon"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		const inset = parseFloat(item.style.getPropertyValue('--_divider-inset-start'));
		expect(inset).toBeLessThan(40);
	});

	// An avatar has no cell of its own, so it arrives in a plain nldd-cell; it
	// should inset the divider the way a leading icon does.
	it('laat de divider inspringen bij een leidende avatar in een gewone cel', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-cell width="fit-content"><nldd-avatar name="Bart" style="width: 32px; height: 32px"></nldd-avatar></nldd-cell>
						<nldd-spacer-cell size="40"></nldd-spacer-cell>
						<nldd-text-cell text="Met avatar"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		expect(parseFloat(item.style.getPropertyValue('--_divider-inset-start'))).toBeGreaterThan(0);
	});

	// Any single glyph-sized thing counts, not just an avatar.
	it('laat de divider inspringen bij een leidende radio in een gewone cel', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-cell width="fit-content"><nldd-radio-button name="x" value="a" style="width: 24px; height: 24px"></nldd-radio-button></nldd-cell>
						<nldd-spacer-cell size="40"></nldd-spacer-cell>
						<nldd-text-cell text="Met radio"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		expect(parseFloat(item.style.getPropertyValue('--_divider-inset-start'))).toBeGreaterThan(0);
	});

	// The text can sit inside a segment; the divider still starts there.
	it('laat de divider inspringen wanneer de tekst in een segment zit', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-cell width="fit-content"><nldd-avatar name="Bart" style="width: 32px; height: 32px"></nldd-avatar></nldd-cell>
						<nldd-spacer-cell size="40"></nldd-spacer-cell>
						<nldd-list-item-segment button width="full">
							<nldd-text-cell text="In een action"></nldd-text-cell>
						</nldd-list-item-segment>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		// At the text, not at the action's padding edge.
		const block = item.shadowRoot!.querySelector('.list-item')!.getBoundingClientRect();
		const text = item.querySelector('nldd-text-cell')!.getBoundingClientRect();
		const inset = parseFloat(item.style.getPropertyValue('--_divider-inset-start'));
		expect(inset).toBeCloseTo(text.left - block.left, 0);
	});

	// The action can open with an icon of its own; the text after it is the mark.
	it('slaat een icoon aan het begin van een segment over', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-cell width="fit-content"><nldd-avatar name="Bart" style="width: 32px; height: 32px"></nldd-avatar></nldd-cell>
						<nldd-spacer-cell size="40"></nldd-spacer-cell>
						<nldd-list-item-segment button width="full">
							<nldd-icon-cell size="20"><nldd-icon icon="star"></nldd-icon></nldd-icon-cell>
							<nldd-spacer-cell size="40"></nldd-spacer-cell>
							<nldd-text-cell text="Na het icoon"></nldd-text-cell>
						</nldd-list-item-segment>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		const block = item.shadowRoot!.querySelector('.list-item')!.getBoundingClientRect();
		const text = item.querySelector('nldd-text-cell')!.getBoundingClientRect();
		expect(parseFloat(item.style.getPropertyValue('--_divider-inset-start'))).toBeCloseTo(
			text.left - block.left,
			0,
		);
	});

	// A cell holding more than one thing is not a glyph cell.
	it('springt ook in bij een leidende cel met meer dan een ding erin', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-cell width="fit-content">
							<nldd-avatar name="Bart" size="32"></nldd-avatar>
							<nldd-tag size="sm" text="Nieuw"></nldd-tag>
						</nldd-cell>
						<nldd-text-cell text="Twee dingen"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		// What comes before it does not matter: the line starts at the text.
		expect(parseFloat(item.style.getPropertyValue('--_divider-inset-start'))).toBeGreaterThan(0);
	});

	// The text opens the row, so the derived start coincides with the content edge:
	// dezelfde volle lijn, uitgedrukt als inspringing nul.
	it('houdt de volle lijn als de rij met zijn tekst opent', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-text-cell text="Geen icoon"></nldd-text-cell>
						<nldd-icon-cell size="20"><nldd-icon icon="chevron-right"></nldd-icon></nldd-icon-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		expect(parseFloat(item.style.getPropertyValue('--_divider-inset-start'))).toBe(0);
	});

	// A tree indents with spacers, so the dividers indent along with it.
	it('begint bij de tekst voorbij de inspring-spacers', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-16: 16px; --primitives-space-32: 32px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-spacer-cell size="16"></nldd-spacer-cell>
						<nldd-spacer-cell size="32"></nldd-spacer-cell>
						<nldd-text-cell text="Blad zonder chevron"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		expect(parseFloat(item.style.getPropertyValue('--_divider-inset-start'))).toBeGreaterThanOrEqual(48);
	});

	// De marker weghalen leidt opnieuw af in plaats van te wissen: dezelfde cel,
	// on its own now, rather than by hand.
	it('valt terug op de afgeleide start als de marker weg is', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-spacer-cell size="40"></nldd-spacer-cell>
						<nldd-text-cell divider-start text="Vanaf hier"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		el.querySelector('[divider-start]')!.removeAttribute('divider-start');
		await settle();
		expect(parseFloat(item.style.getPropertyValue('--_divider-inset-start'))).toBeGreaterThanOrEqual(40);
	});

	// Nothing to derive it from, so the vars disappear.
	it('wist de vars als de rij geen tekst- of titel-cel heeft', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-spacer-cell size="40"></nldd-spacer-cell>
						<nldd-icon-cell divider-start size="20"><nldd-icon icon="star"></nldd-icon></nldd-icon-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		el.querySelector('[divider-start]')!.removeAttribute('divider-start');
		await settle();
		expect(item.style.getPropertyValue('--_divider-inset-start')).toBe('');
	});

	it('falls back to full width when start lies past the last end', async () => {
		el = await fixture(`
			<div style="width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px; --primitives-space-40: 40px; --semantics-dividers-thickness: 1px;">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-text-cell divider-end text="Eind"></nldd-text-cell>
						<nldd-text-cell divider-start text="Start te laat" width="full"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await settle();
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		expect(item.style.getPropertyValue('--_divider-inset-start')).toBe('');
		expect(item.style.getPropertyValue('--_divider-inset-end')).toBe('');
	});
});

describe('nldd-list-item – nested widening', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('does not stack the widened inset per nesting level', async () => {
		el = await fixture(`
			<div style="padding: 40px; width: 400px; --components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px;">
				<nldd-list type="tree" accessible-label="X">
					<nldd-list-item expanded>
						<nldd-list-item-segment checkbox width="full" accessible-label="Ouder">
							<nldd-text-cell text="Tak"></nldd-text-cell>
						</nldd-list-item-segment>
						<nldd-list-item slot="children" expanded>
							<nldd-list-item-segment checkbox width="full" accessible-label="Kind">
								<nldd-text-cell text="Subtak"></nldd-text-cell>
							</nldd-list-item-segment>
							<nldd-list-item slot="children">
								<nldd-list-item-segment checkbox width="full" accessible-label="Kleinkind">
									<nldd-text-cell text="Blad"></nldd-text-cell>
								</nldd-list-item-segment>
							</nldd-list-item>
						</nldd-list-item>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await new Promise(resolve => setTimeout(resolve, 60));
		const [outer, middle, inner] = [...el.querySelectorAll('nldd-list-item')];
		// Every level's widened box spans the same inline range: the children
		// group re-insets the parent's widened strip, so nesting never stacks.
		const outerRect = outer.getBoundingClientRect();
		expect(Math.round(middle.getBoundingClientRect().left)).toBe(Math.round(outerRect.left));
		expect(Math.round(inner.getBoundingClientRect().left)).toBe(Math.round(outerRect.left));
		expect(Math.round(middle.getBoundingClientRect().right)).toBe(Math.round(outerRect.right));
		expect(Math.round(inner.getBoundingClientRect().right)).toBe(Math.round(outerRect.right));
	});
});

describe('nldd-list-item – row-wide disclosure', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('turns a chevron cell marked disclosure with its own expanded state', async () => {
		el = await fixture(`
			<nldd-list type="tree" accessible-label="X">
				<nldd-list-item button expanded>
					<nldd-icon-cell disclosure size="20"></nldd-icon-cell>
					<nldd-text-cell text="Tak"></nldd-text-cell>
					<nldd-list-item slot="children"><nldd-text-cell text="Blad"></nldd-text-cell></nldd-list-item>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const row = el.querySelector<NLDDListItem>('nldd-list-item')!;
		const chevron = row.querySelector('nldd-icon-cell[disclosure]')!;
		// The whole row is the control here — no disclosure action in sight.
		expect(getComputedStyle(chevron).rotate).toBe('90deg');

		row.expanded = false;
		await waitForUpdate(row);
		expect(getComputedStyle(chevron).rotate).toBe('0deg');
	});
});

describe('nldd-list-item – nested press', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('does not flash a branch row when a child row is pressed', async () => {
		el = await fixture(`
			<nldd-list type="tree" accessible-label="X">
				<nldd-list-item button expanded>
					<nldd-text-cell text="Tak"></nldd-text-cell>
					<nldd-list-item slot="children" button>
						<nldd-text-cell text="Blad"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const [branch, leaf] = [...el.querySelectorAll<NLDDListItem>('nldd-list-item')];
		await waitForUpdate(leaf!);
		leaf!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
		// The child's pointer event travels through the branch — only the child
		// may show the press.
		expect(leaf!.shadowRoot!.querySelector('.list-item__action')!.classList.contains('is-pressed')).toBe(true);
		expect(branch!.shadowRoot!.querySelector('.list-item__action')!.classList.contains('is-pressed')).toBe(false);
	});
});

describe('nldd-list-item onder een universele reset', () => {
	let el: HTMLElement;
	let removeReset: () => void;

	afterEach(() => {
		removeReset();
		if (el) cleanup(el);
	});

	it('behoudt de negatieve inline-marge van een interactieve rij', async () => {
		removeReset = installUniversalReset();
		el = await fixture(`
			<div style="--components-list-item-indicator-inline-inset: 8px;">
				<nldd-list-item button>
					Rij
				</nldd-list-item>
			</div>
		`);
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		await waitForUpdate(item);
		expect(item.classList.contains('is-interactive')).toBe(true);
		expect(getComputedStyle(item).marginLeft).toBe('-8px');
	});
});

describe('nldd-list-item divider met verborgen cellen', () => {
	// A row that shows different cells per width sets divider-start on both
	// variants. The hidden one has an empty rect, which measures as inset 0: the
	// line would then start at the edge of the row rather than at the text.
	it('negeert een divider-start op een cel die niet gerenderd wordt', async () => {
		const el = await fixture(`
			<nldd-list>
				<nldd-list-item>
					<nldd-cell><nldd-icon icon="info"></nldd-icon></nldd-cell>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
					<nldd-text-cell divider-start style="display: none" text="Verborgen"></nldd-text-cell>
					<nldd-text-cell divider-start text="Zichtbaar"></nldd-text-cell>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		const zichtbaar = el.querySelectorAll('nldd-text-cell')[1] as HTMLElement;
		const block = item.shadowRoot!.querySelector('.list-item') as HTMLElement;
		// Two frames, not one: the inset is measured in a frame of its own, so a
		// single one only gets us to the measurement rather than past it.
		await nextFrames();

		const inset = parseFloat(item.style.getPropertyValue('--_divider-inset-start'));
		const verwacht = zichtbaar.getBoundingClientRect().left - block.getBoundingClientRect().left;
		expect(inset).toBeGreaterThan(0);
		expect(Math.abs(inset - verwacht)).toBeLessThan(1);
		cleanup(el);
	});
});

describe('nldd-list-item divider zonder eigen marker', () => {
	// Without an explicit divider-start the row derives one. If it only ever
	// offered the first text cell and that one is hidden per breakpoint, the
	// measurement would come up empty and the line would fall back to the full
	// width, even though a later cell in the same row is on screen.
	it('leidt de start af uit de eerste cel die wel gerenderd wordt', async () => {
		const el = await fixture(`
			<nldd-list>
				<nldd-list-item>
					<nldd-cell><nldd-icon icon="info"></nldd-icon></nldd-cell>
					<nldd-spacer-cell size="12"></nldd-spacer-cell>
					<nldd-text-cell style="display: none" text="Verborgen"></nldd-text-cell>
					<nldd-text-cell text="Zichtbaar"></nldd-text-cell>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		const zichtbaar = el.querySelectorAll('nldd-text-cell')[1] as HTMLElement;
		const block = item.shadowRoot!.querySelector('.list-item') as HTMLElement;
		await nextFrames();

		const inset = parseFloat(item.style.getPropertyValue('--_divider-inset-start'));
		const verwacht = zichtbaar.getBoundingClientRect().left - block.getBoundingClientRect().left;
		expect(inset).toBeGreaterThan(0);
		expect(Math.abs(inset - verwacht)).toBeLessThan(1);
		cleanup(el);
	});
});

describe('nldd-list-item – current from a segment', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('marks the row as current when one of its segments is', async () => {
		el = await fixture(`
			<nldd-list-item>
				<nldd-list-item-segment button disclosure accessible-label="Vouw"></nldd-list-item-segment>
				<nldd-list-item-segment href="/nu" current><nldd-text-cell text="Nu"></nldd-text-cell></nldd-list-item-segment>
			</nldd-list-item>
		`);
		await waitForUpdate(el);
		expect(el.hasAttribute('data-current')).toBe(true);
	});

	it('lets the row go back to normal when the segment stops being current', async () => {
		el = await fixture(`
			<nldd-list-item>
				<nldd-list-item-segment href="/nu" current><nldd-text-cell text="Nu"></nldd-text-cell></nldd-list-item-segment>
			</nldd-list-item>
		`);
		await waitForUpdate(el);
		el.querySelector('nldd-list-item-segment')!.removeAttribute('current');
		await waitForUpdate(el);
		expect(el.hasAttribute('data-current')).toBe(false);
	});

	it('ignores a current segment in a nested row', async () => {
		el = await fixture(`
			<nldd-list-item>
				<nldd-text-cell text="Tak"></nldd-text-cell>
				<nldd-list-item slot="children">
					<nldd-list-item-segment href="/kind" current><nldd-text-cell text="Kind"></nldd-text-cell></nldd-list-item-segment>
				</nldd-list-item>
			</nldd-list-item>
		`);
		await waitForUpdate(el);
		expect(el.hasAttribute('data-current')).toBe(false);
		expect(el.querySelector('nldd-list-item')!.hasAttribute('data-current')).toBe(true);
	});
});

describe('nldd-list-item – een aangevinkte rij', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const fill = (row: Element) =>
		getComputedStyle(row).getPropertyValue('--_background-color').trim();

	it('paints like a selected row', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item id="ticked" checkbox checked><nldd-text-cell text="Aan"></nldd-text-cell></nldd-list-item>
				<nldd-list-item id="picked" button selected><nldd-text-cell text="Gekozen"></nldd-text-cell></nldd-list-item>
				<nldd-list-item id="plain" checkbox><nldd-text-cell text="Uit"></nldd-text-cell></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const ticked = fill(el.querySelector('#ticked')!);
		expect(ticked).toBe(fill(el.querySelector('#picked')!));
		expect(ticked).not.toBe(fill(el.querySelector('#plain')!));
	});

	it('needs the checkbox: `checked` on a row that is not one paints nothing', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item id="odd" button checked><nldd-text-cell text="Raar"></nldd-text-cell></nldd-list-item>
				<nldd-list-item id="plain" button><nldd-text-cell text="Uit"></nldd-text-cell></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		expect(fill(el.querySelector('#odd')!)).toBe(fill(el.querySelector('#plain')!));
	});
});

describe('nldd-list-item – disabled', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('switches a button row off', async () => {
		el = await fixture('<nldd-list-item button disabled><nldd-text-cell text="Uit"></nldd-text-cell></nldd-list-item>');
		await waitForUpdate(el);
		const control = el.shadowRoot!.querySelector('button.list-item__action')!;
		expect(control.hasAttribute('disabled')).toBe(true);
	});

	it('blocks the click on a link row, which cannot be disabled natively', async () => {
		el = await fixture('<nldd-list-item href="/ergens" disabled><nldd-text-cell text="Uit"></nldd-text-cell></nldd-list-item>');
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('a.list-item__action')!;
		expect(link.getAttribute('aria-disabled')).toBe('true');
		const event = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
		link.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});

	it('does not toggle a disabled checkbox row', async () => {
		el = await fixture('<nldd-list-item checkbox disabled><nldd-text-cell text="Uit"></nldd-text-cell></nldd-list-item>');
		await waitForUpdate(el);
		const control = el.shadowRoot!.querySelector('button.list-item__action')!;
		control.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect((el as NLDDListItem).checked).toBe(false);
	});

	it('is skipped by the arrow keys', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item button><nldd-text-cell text="Een"></nldd-text-cell></nldd-list-item>
				<nldd-list-item button disabled><nldd-text-cell text="Uit"></nldd-text-cell></nldd-list-item>
				<nldd-list-item button><nldd-text-cell text="Twee"></nldd-text-cell></nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const rows = [...el.querySelectorAll('nldd-list-item')] as (NLDDListItem & { updateComplete: Promise<boolean> })[];
		await Promise.all(rows.map(r => r.updateComplete));
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await waitForUpdate(el);
		await Promise.all(rows.map(r => r.updateComplete));
		const tabindex = (row: Element) =>
			row.shadowRoot!.querySelector('.list-item__action')!.getAttribute('tabindex');
		expect(tabindex(rows[1])).not.toBe('0');
		expect(tabindex(rows[2])).toBe('0');
	});

	it('leaves a row whose only segment is disabled out of the arrow order', async () => {
		el = await fixture(`
			<nldd-list>
				<nldd-list-item button><nldd-text-cell text="Een"></nldd-text-cell></nldd-list-item>
				<nldd-list-item>
					<nldd-list-item-segment button disabled accessible-label="Uit"><nldd-text-cell text="Uit"></nldd-text-cell></nldd-list-item-segment>
				</nldd-list-item>
			</nldd-list>
		`);
		await waitForUpdate(el);
		const rows = [...el.querySelectorAll('nldd-list-item')] as NLDDListItem[];
		expect(rows[1]._isRovingStop).toBe(false);
	});
});

describe('nldd-list-item – what goes in a row', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	const strayWarnings = (warn: { mock: { calls: unknown[][] } }) =>
		warn.mock.calls.filter(([message]) => String(message).includes('sits directly in a row'));

	const mount = async (content: string) => {
		el = await fixture(`<nldd-list><nldd-list-item button>${content}</nldd-list-item></nldd-list>`);
		const row = el.querySelector('nldd-list-item') as HTMLElement;
		await waitForUpdate(row);
		await nextFrames();
	};

	it('warns about bare text in a row', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await mount('Dossier 2024-001');
		expect(strayWarnings(warn)).toHaveLength(1);
		expect(String(strayWarnings(warn)[0][0])).toContain('bare text ("Dossier 2024-001")');
	});

	it('warns about an element that is not a cell or a segment', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await mount('<span>Dossier</span>');
		expect(strayWarnings(warn)).toHaveLength(1);
		expect(String(strayWarnings(warn)[0][0])).toContain('<span>');
	});

	it('does not warn about cells, segments or whitespace', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await mount(`
			<nldd-text-cell text="Dossier"></nldd-text-cell>
			<nldd-cell></nldd-cell>
		`);
		expect(strayWarnings(warn)).toHaveLength(0);
		cleanup(el);
		el = await fixture(`<nldd-list><nldd-list-item>
			<nldd-list-item-segment button><nldd-text-cell text="Dossier"></nldd-text-cell></nldd-list-item-segment>
		</nldd-list-item></nldd-list>`);
		await waitForUpdate(el.querySelector('nldd-list-item') as HTMLElement);
		await nextFrames();
		expect(strayWarnings(warn)).toHaveLength(0);
	});

	const nestedWarnings = (warn: { mock: { calls: unknown[][] } }) =>
		warn.mock.calls.filter(([message]) => String(message).includes('is its own control'));

	it('warns about a control inside a row that is its own control', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(`<nldd-list><nldd-list-item href="/dossier">
			<nldd-text-cell text="Dossier"></nldd-text-cell>
			<nldd-cell><nldd-icon-button icon="delete" accessible-label="Verwijder"></nldd-icon-button></nldd-cell>
		</nldd-list-item></nldd-list>`);
		await waitForUpdate(el.querySelector('nldd-list-item') as HTMLElement);
		await nextFrames();
		expect(nestedWarnings(warn)).toHaveLength(1);
		expect(String(nestedWarnings(warn)[0][0])).toContain('<nldd-icon-button>');
	});

	it('warns about a segment in a row that is its own control', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(`<nldd-list><nldd-list-item button>
			<nldd-list-item-segment button><nldd-text-cell text="Dossier"></nldd-text-cell></nldd-list-item-segment>
		</nldd-list-item></nldd-list>`);
		await waitForUpdate(el.querySelector('nldd-list-item') as HTMLElement);
		await nextFrames();
		expect(nestedWarnings(warn)).toHaveLength(1);
	});

	it('does not warn about a decorative glyph, or controls in a row without an action', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(`<nldd-list>
			<nldd-list-item checkbox>
				<nldd-cell><nldd-checkbox decorative></nldd-checkbox></nldd-cell>
				<nldd-text-cell text="Dossier"></nldd-text-cell>
			</nldd-list-item>
			<nldd-list-item>
				<nldd-list-item-segment href="/dossier"><nldd-text-cell text="Dossier"></nldd-text-cell></nldd-list-item-segment>
				<nldd-list-item-segment button><nldd-icon-cell icon="delete"></nldd-icon-cell></nldd-list-item-segment>
			</nldd-list-item>
		</nldd-list>`);
		const rows = [...el.querySelectorAll('nldd-list-item')] as HTMLElement[];
		await Promise.all(rows.map((row) => waitForUpdate(row)));
		await nextFrames();
		expect(nestedWarnings(warn)).toHaveLength(0);
	});

	it('warns once per row', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await mount('Eerste');
		const row = el.querySelector('nldd-list-item') as HTMLElement;
		row.append(document.createTextNode(' tweede'));
		await nextFrames();
		expect(strayWarnings(warn)).toHaveLength(1);
	});
});
