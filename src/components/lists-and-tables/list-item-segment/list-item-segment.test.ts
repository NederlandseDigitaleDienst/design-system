import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './list-item-segment.js';
import type { NLDDListItemSegment } from './list-item-segment.js';
import '../list-item/list-item.js';
import '../list/list.js';
import '../cells/text-cell/text-cell.js';
import '../cells/icon-cell/icon-cell.js';
import '../cells/spacer-cell/spacer-cell.js';

describe('nldd-list-item-segment', () => {
	let root: HTMLElement;

	afterEach(() => {
		if (root) cleanup(root);
		vi.restoreAllMocks();
	});

	const mount = async (inner: string, listAttrs = ''): Promise<NLDDListItemSegment[]> => {
		root = await fixture<HTMLElement>(
			`<nldd-list ${listAttrs}><nldd-list-item>${inner}</nldd-list-item></nldd-list>`,
		);
		await waitForUpdate(root);
		const actions = Array.from(root.querySelectorAll<NLDDListItemSegment>('nldd-list-item-segment'));
		for (const action of actions) await waitForUpdate(action);
		return actions;
	};

	const control = (action: NLDDListItemSegment): HTMLElement =>
		action.shadowRoot!.querySelector('.list-item-segment') as HTMLElement;

	const CHEVRON = '<nldd-list-item-segment button expanded accessible-label="Uitklappen"><nldd-text-cell text="›"></nldd-text-cell></nldd-list-item-segment>';
	const LABEL = '<nldd-list-item-segment checkbox width="full"><nldd-text-cell text="Ministeries"></nldd-text-cell></nldd-list-item-segment>';

	it('renders a button action', async () => {
		const [a] = await mount('<nldd-list-item-segment button><nldd-text-cell text="X"></nldd-text-cell></nldd-list-item-segment>');
		expect(control(a).tagName).toBe('BUTTON');
		expect(control(a).getAttribute('type')).toBe('button');
	});

	it('renders a link action and lets href win over button and checkbox', async () => {
		const [a] = await mount('<nldd-list-item-segment button checkbox href="/ergens"><nldd-text-cell text="X"></nldd-text-cell></nldd-list-item-segment>');
		expect(control(a).tagName).toBe('A');
		expect(control(a).getAttribute('href')).toBe('/ergens');
		expect(control(a).getAttribute('role')).toBeNull();
	});

	it('renders a checkbox action carrying its state', async () => {
		const [a] = await mount('<nldd-list-item-segment checkbox checked><nldd-text-cell text="X"></nldd-text-cell></nldd-list-item-segment>');
		expect(control(a).getAttribute('role')).toBe('checkbox');
		expect(control(a).getAttribute('aria-checked')).toBe('true');
	});

	it('toggles and fires change when a checkbox action is activated', async () => {
		const [a] = await mount('<nldd-list-item-segment checkbox><nldd-text-cell text="X"></nldd-text-cell></nldd-list-item-segment>');
		const seen: boolean[] = [];
		a.addEventListener('change', (e: Event) => seen.push((e as CustomEvent).detail.checked));
		control(a).click();
		await waitForUpdate(a);
		expect(a.checked).toBe(true);
		expect(control(a).getAttribute('aria-checked')).toBe('true');
		control(a).click();
		await waitForUpdate(a);
		expect(seen).toEqual([true, false]);
	});

	it('emits aria-expanded only when the attribute is present', async () => {
		const [withIt, without] = await mount(
			CHEVRON + '<nldd-list-item-segment button><nldd-text-cell text="X"></nldd-text-cell></nldd-list-item-segment>',
		);
		expect(control(withIt).getAttribute('aria-expanded')).toBe('true');
		expect(control(without).getAttribute('aria-expanded')).toBeNull();
	});

	it('renders without a control — and without a role — when nothing interactive is asked for', async () => {
		const [a] = await mount('<nldd-list-item-segment><nldd-text-cell text="X"></nldd-text-cell></nldd-list-item-segment>');
		expect(control(a).tagName).toBe('DIV');
	});

	it('keeps two independent controls in one row', async () => {
		const actions = await mount(CHEVRON + LABEL);
		expect(actions).toHaveLength(2);
		const hits: string[] = [];
		actions[0].addEventListener('click', () => hits.push('chevron'));
		actions[1].addEventListener('change', () => hits.push('label'));
		control(actions[1]).click();
		await waitForUpdate(actions[1]);
		expect(hits).toEqual(['label']);
		expect(actions[0].querySelector('nldd-text-cell')).not.toBeNull();
	});

	it('nests no control inside the row action (the row stays a plain container)', async () => {
		await mount(CHEVRON + LABEL);
		const item = root.querySelector('nldd-list-item')!;
		expect(item.shadowRoot!.querySelector('.list-item__action')).toBeNull();
	});

	it('degrades to a plain container in a listbox parent, with a warning', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const [a] = await mount(LABEL, 'type="listbox"');
		expect(control(a).tagName).toBe('DIV');
		expect(a.querySelector('nldd-text-cell')).not.toBeNull();
		expect(warn).toHaveBeenCalled();
	});

	it('grows only with width="full"', async () => {
		const actions = await mount(CHEVRON + LABEL);
		expect(getComputedStyle(actions[0]).flexGrow).toBe('0');
		expect(getComputedStyle(actions[1]).flexGrow).toBe('1');
	});

	it('centers content that is narrower than the target-size floor', async () => {
		root = await fixture<HTMLElement>(
			`<nldd-list style="--semantics-controls-md-min-size: 44px">
				<nldd-list-item>
					<nldd-list-item-segment button>
						<nldd-icon-cell size="20"></nldd-icon-cell>
					</nldd-list-item-segment>
				</nldd-list-item>
			</nldd-list>`,
		);
		await waitForUpdate(root);
		const a = root.querySelector<NLDDListItemSegment>('nldd-list-item-segment')!;
		await waitForUpdate(a);
		const box = a.getBoundingClientRect();
		const icon = a.querySelector('nldd-icon-cell')!.getBoundingClientRect();
		// Equal on both sides: the leftover space comes from the floor, not from
		// the author, so hugging the leading edge would read as a mistake.
		expect(Math.round(icon.x - box.x)).toBe(Math.round(box.right - icon.right));
	});

	it('keeps a growing action leading-aligned', async () => {
		const [a] = await mount('<nldd-list-item-segment button width="full"><nldd-text-cell text="X"></nldd-text-cell></nldd-list-item-segment>');
		expect(getComputedStyle(control(a)).justifyContent).toBe('flex-start');
	});

	it('never falls below the row control size', async () => {
		// The design tokens are not loaded in the test environment, so feed the
		// control size and the inset (for the fixed action padding) in
		// explicitly and check the action honours its square floor.
		root = await fixture<HTMLElement>(
			'<nldd-list style="--semantics-controls-md-min-size: 44px; --components-list-item-indicator-inline-inset: 8px"><nldd-list-item><nldd-list-item-segment button></nldd-list-item-segment></nldd-list-item></nldd-list>',
		);
		await waitForUpdate(root);
		const a = root.querySelector<NLDDListItemSegment>('nldd-list-item-segment')!;
		await waitForUpdate(a);
		const box = a.getBoundingClientRect();
		expect(box.width).toBeGreaterThanOrEqual(44);
		expect(box.height).toBeGreaterThanOrEqual(44);
	});
});

describe('nldd-list-item – expanded', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	const mount = async (attrs: string): Promise<HTMLElement> => {
		el = await fixture<HTMLElement>(`<nldd-list><nldd-list-item ${attrs}><nldd-text-cell text="X"></nldd-text-cell></nldd-list-item></nldd-list>`);
		await waitForUpdate(el);
		const item = el.querySelector('nldd-list-item') as HTMLElement;
		await waitForUpdate(item);
		return item;
	};

	const action = (item: HTMLElement): HTMLElement | null =>
		item.shadowRoot!.querySelector('.list-item__action');

	it('puts aria-expanded on a button row', async () => {
		const item = await mount('button expanded');
		expect(action(item)!.getAttribute('aria-expanded')).toBe('true');
	});

	it('puts aria-expanded on a checkbox row', async () => {
		const item = await mount('checkbox');
		expect(action(item)!.getAttribute('aria-expanded')).toBeNull();
		const item2 = await mount('checkbox expanded');
		expect(action(item2)!.getAttribute('aria-expanded')).toBe('true');
	});

	it('warns when expanded has nowhere to live', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await mount('expanded');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('`expanded` needs somewhere to live'));
	});

	it('is happy when a disclosure action carries it, and hands it the state', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<HTMLElement>(
			`<nldd-list type="tree" accessible-label="X">
				<nldd-list-item expanded>
					<nldd-list-item-segment button disclosure accessible-label="Uitklappen"></nldd-list-item-segment>
					<nldd-text-cell text="Tak"></nldd-text-cell>
					<nldd-list-item slot="children"><nldd-text-cell text="Blad"></nldd-text-cell></nldd-list-item>
				</nldd-list-item>
			</nldd-list>`,
		);
		await waitForUpdate(el);
		const item = el.querySelector('nldd-list-item')!;
		const seg = el.querySelector('nldd-list-item-segment')!;
		await waitForUpdate(item);
		await waitForUpdate(seg);
		expect(seg.shadowRoot!.querySelector('.list-item-segment')!.getAttribute('aria-expanded')).toBe('true');
		expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('`expanded` needs somewhere to live'));
	});

	// In a tree, child rows are DOM children of the row, so an unscoped relay
	// pushed the parent's expanded state into the chevron of every collapsed child
	// row as well, which then pointed down while the branch was closed.
	it('laat de expanded-staat niet in geneste rijen lekken', async () => {
		el = await fixture<HTMLElement>(
			`<nldd-list type="tree" accessible-label="X">
				<nldd-list-item>
					<nldd-list-item-segment button disclosure accessible-label="Buiten"></nldd-list-item-segment>
					<nldd-text-cell text="Tak"></nldd-text-cell>
					<nldd-list-item slot="children">
						<nldd-list-item-segment button disclosure accessible-label="Binnen"></nldd-list-item-segment>
						<nldd-text-cell text="Subtak"></nldd-text-cell>
						<nldd-list-item slot="children"><nldd-text-cell text="Blad"></nldd-text-cell></nldd-list-item>
					</nldd-list-item>
				</nldd-list-item>
			</nldd-list>`,
		);
		await waitForUpdate(el);
		const [outer, inner] = [...el.querySelectorAll('nldd-list-item')];
		const [outerSeg, innerSeg] = [...el.querySelectorAll('nldd-list-item-segment')];

		outer.setAttribute('expanded', '');
		await waitForUpdate(outer);
		await waitForUpdate(outerSeg);
		await waitForUpdate(innerSeg);

		expect(outerSeg.classList.contains('is-expanded')).toBe(true);
		expect(inner.hasAttribute('expanded')).toBe(false);
		expect(innerSeg.classList.contains('is-expanded')).toBe(false);
		expect(innerSeg.shadowRoot!.querySelector('.list-item-segment')!.getAttribute('aria-expanded')).not.toBe('true');
	});

	// Without this, every consumer had to turn the chevron themselves, which
	// cannot be done from the component: ::slotted only reaches one level deep.
	it('draait de chevron mee met de rij', async () => {
		el = await fixture<HTMLElement>(
			`<nldd-list type="tree" accessible-label="X">
				<nldd-list-item>
					<nldd-list-item-segment button disclosure accessible-label="Uitklappen">
						<nldd-icon-cell size="20"><nldd-icon icon="chevron-right"></nldd-icon></nldd-icon-cell>
					</nldd-list-item-segment>
					<nldd-text-cell text="Tak"></nldd-text-cell>
					<nldd-list-item slot="children"><nldd-text-cell text="Blad"></nldd-text-cell></nldd-list-item>
				</nldd-list-item>
			</nldd-list>`,
		);
		await waitForUpdate(el);
		const item = el.querySelector('nldd-list-item')!;
		const seg = el.querySelector('nldd-list-item-segment')!;
		const iconCell = el.querySelector('nldd-icon-cell')!;
		await waitForUpdate(seg);
		expect(getComputedStyle(iconCell).rotate).toBe('0deg');

		item.setAttribute('expanded', '');
		await waitForUpdate(item);
		await waitForUpdate(seg);
		expect(seg.classList.contains('is-expanded')).toBe(true);
		expect(getComputedStyle(iconCell).rotate).toBe('90deg');
	});
});

describe('nldd-list-item – padding on the cells', () => {
	let root: HTMLElement;

	afterEach(() => {
		if (root) cleanup(root);
	});

	it('lets a action cover the full row height', async () => {
		root = await fixture<HTMLElement>(
			`<nldd-list style="--components-list-item-md-padding-block: 10px">
				<nldd-list-item>
					<nldd-list-item-segment button width="full">
						<nldd-text-cell text="Ministeries"></nldd-text-cell>
					</nldd-list-item-segment>
				</nldd-list-item>
			</nldd-list>`,
		);
		await waitForUpdate(root);
		const item = root.querySelector('nldd-list-item')!;
		const action = root.querySelector<NLDDListItemSegment>('nldd-list-item-segment')!;
		await waitForUpdate(action);
		// The padding now sits inside the cell, so no dead band above or below the
		// action — it used to be inset by the area padding on both sides.
		expect(action.getBoundingClientRect().height).toBe(item.getBoundingClientRect().height);
	});

	it('stretches with the row when a sibling makes it taller', async () => {
		root = await fixture<HTMLElement>(
			`<nldd-list>
				<nldd-list-item>
					<nldd-list-item-segment button>
						<nldd-text-cell text="kort"></nldd-text-cell>
					</nldd-list-item-segment>
					<nldd-list-item-segment button width="full">
						<nldd-text-cell text="lang" supporting-text="met een tweede regel eronder"></nldd-text-cell>
					</nldd-list-item-segment>
				</nldd-list-item>
			</nldd-list>`,
		);
		await waitForUpdate(root);
		const item = root.querySelector('nldd-list-item')!;
		const actions = root.querySelectorAll<NLDDListItemSegment>('nldd-list-item-segment');
		for (const a of actions) await waitForUpdate(a);
		const rowHeight = item.getBoundingClientRect().height;
		// The taller sibling sets the row height; the short one must follow, or its
		// fill and hit area would float in the middle of the row.
		expect(actions[0].getBoundingClientRect().height).toBe(rowHeight);
		expect(actions[1].getBoundingClientRect().height).toBe(rowHeight);
		expect(rowHeight).toBeGreaterThan(actions[0].querySelector('nldd-text-cell')!.getBoundingClientRect().height - 1);
	});

	it('pushes the row size onto sized cells only', async () => {
		root = await fixture<HTMLElement>(
			`<nldd-list><nldd-list-item size="sm">
				<nldd-text-cell text="A"></nldd-text-cell>
				<nldd-text-cell size="md" text="B"></nldd-text-cell>
				<nldd-icon-cell size="20"></nldd-icon-cell>
				<nldd-spacer-cell size="12"></nldd-spacer-cell>
			</nldd-list-item></nldd-list>`,
		);
		await waitForUpdate(root);
		const item = root.querySelector('nldd-list-item')!;
		await waitForUpdate(item);
		// Read the property: text-cell reflects `size` only when it differs from
		// its 'md' default, so an authored md leaves no attribute behind.
		const cells = item.querySelectorAll<HTMLElement & { size: string }>('nldd-text-cell');
		expect(cells[0].size).toBe('sm');
		expect(cells[1].size).toBe('md');
		// size means pixels here — pushing 'sm' would corrupt them.
		expect(item.querySelector('nldd-icon-cell')!.getAttribute('size')).toBe('20');
		expect(item.querySelector('nldd-spacer-cell')!.getAttribute('size')).toBe('12');
	});
});

describe('nldd-list type="tree"', () => {
	let root: HTMLElement;

	afterEach(() => {
		if (root) cleanup(root);
		vi.restoreAllMocks();
	});

	const TREE = `
		<nldd-list type="tree" accessible-label="Opdrachtgevers">
			<nldd-list-item expanded>
				<nldd-text-cell text="Ministeries"></nldd-text-cell>
				<nldd-list-item slot="children">
					<nldd-text-cell text="Algemene Zaken"></nldd-text-cell>
				</nldd-list-item>
				<nldd-list-item slot="children" expanded="false">
					<nldd-text-cell text="Financiën"></nldd-text-cell>
					<nldd-list-item slot="children">
						<nldd-text-cell text="Belastingdienst"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list-item>
			</nldd-list-item>
		</nldd-list>`;

	const mount = async (markup: string): Promise<HTMLElement> => {
		root = await fixture<HTMLElement>(markup);
		await waitForUpdate(root);
		for (const item of root.querySelectorAll('nldd-list-item')) await waitForUpdate(item);
		await waitForUpdate(root);
		return root;
	};

	const group = (item: Element): HTMLElement | null =>
		item.shadowRoot!.querySelector('.list-item__children');

	it('gives the list a tree role and the rows treeitem', async () => {
		await mount(TREE);
		const list = root as HTMLElement;
		expect(list.shadowRoot!.querySelector('[role="tree"]')).not.toBeNull();
		root.querySelectorAll('nldd-list-item').forEach(item => {
			expect(item.getAttribute('role')).toBe('treeitem');
		});
	});

	it('renders child rows in a role="group", nested to any depth', async () => {
		await mount(TREE);
		const branch = root.querySelector('nldd-list-item')!;
		expect(group(branch)!.getAttribute('role')).toBe('group');
		const nested = branch.querySelectorAll(':scope > nldd-list-item[slot="children"]');
		expect(nested).toHaveLength(2);
		// The grandchild proves the relay reaches past the first level.
		const grandchild = nested[1].querySelector('nldd-list-item')!;
		expect(grandchild.getAttribute('role')).toBe('treeitem');
	});

	it('renders no group at all for a leaf', async () => {
		await mount(TREE);
		const leaf = root.querySelectorAll('nldd-list-item')[1];
		expect(group(leaf)).toBeNull();
	});

	it('hides the group while the branch is collapsed', async () => {
		await mount(TREE);
		const [branch] = root.querySelectorAll('nldd-list-item');
		expect(group(branch)!.hasAttribute('hidden')).toBe(false);
		branch.removeAttribute('expanded');
		(branch as HTMLElement & { expanded?: boolean }).expanded = false;
		await waitForUpdate(branch);
		expect(group(branch)!.hasAttribute('hidden')).toBe(true);
	});

	it('reads a branch without `expanded` as collapsed', async () => {
		await mount(`
			<nldd-list type="tree" accessible-label="X">
				<nldd-list-item>
					<nldd-text-cell text="Tak"></nldd-text-cell>
					<nldd-list-item slot="children"><nldd-text-cell text="Blad"></nldd-text-cell></nldd-list-item>
				</nldd-list-item>
			</nldd-list>`);
		const branch = root.querySelector('nldd-list[type="tree"] > nldd-list-item') as HTMLElement;
		await waitForUpdate(branch);
		expect(group(branch)!.hasAttribute('hidden')).toBe(true);
	});

	it('warns when children are nested outside a tree', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await mount(`
			<nldd-list accessible-label="X">
				<nldd-list-item expanded>
					<nldd-text-cell text="Tak"></nldd-text-cell>
					<nldd-list-item slot="children"><nldd-text-cell text="Blad"></nldd-text-cell></nldd-list-item>
				</nldd-list-item>
			</nldd-list>`);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('only carries meaning in an nldd-list with type="tree"'));
	});

	it('authors no aria-level, -posinset or -setsize — the nesting says it', async () => {
		await mount(TREE);
		root.querySelectorAll('nldd-list-item').forEach(item => {
			expect(item.getAttribute('aria-level')).toBeNull();
			expect(item.getAttribute('aria-posinset')).toBeNull();
			expect(item.getAttribute('aria-setsize')).toBeNull();
		});
	});
});

describe('nldd-list-item-segment – vaste geometrie', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const TOKENS = '--components-list-item-indicator-inline-inset: 8px; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 32px;';

	it('is minimaal een vierkant van de controlmaat van de rij', async () => {
		el = await fixture(`
			<div style="${TOKENS}">
				<nldd-list type="tree" accessible-label="X">
					<nldd-list-item>
						<nldd-list-item-segment button accessible-label="Icoon-only"></nldd-list-item-segment>
						<nldd-text-cell text="Rij"></nldd-text-cell>
					</nldd-list-item>
					<nldd-list-item size="sm">
						<nldd-list-item-segment button accessible-label="Icoon-only sm"></nldd-list-item-segment>
						<nldd-text-cell text="Rij sm"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		await new Promise(resolve => setTimeout(resolve, 60));
		const [md, sm] = [...el.querySelectorAll('nldd-list-item-segment')];
		const mdRect = md.getBoundingClientRect();
		const smRect = sm.getBoundingClientRect();
		expect(mdRect.width).toBeGreaterThanOrEqual(44);
		expect(mdRect.height).toBeGreaterThanOrEqual(44);
		expect(smRect.width).toBeGreaterThanOrEqual(32);
		expect(smRect.height).toBeGreaterThanOrEqual(32);
	});

	it('draagt vaste interne padding gelijk aan de inset', async () => {
		el = await fixture(`
			<div style="${TOKENS}">
				<nldd-list accessible-label="X">
					<nldd-list-item>
						<nldd-text-cell text="Voor"></nldd-text-cell>
						<nldd-list-item-segment button width="full" accessible-label="Groei">
							<nldd-text-cell text="Inhoud"></nldd-text-cell>
						</nldd-list-item-segment>
						<nldd-text-cell text="Na"></nldd-text-cell>
					</nldd-list-item>
				</nldd-list>
			</div>
		`);
		await waitForUpdate(el);
		const action = el.querySelector('nldd-list-item-segment')!;
		const control = action.shadowRoot!.querySelector('.list-item-segment')!;
		const style = getComputedStyle(control);
		expect(style.paddingInlineStart).toBe('8px');
		expect(style.paddingInlineEnd).toBe('8px');
	});
});

describe('nldd-list-item-segment – een uitgezette link', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('carries aria-disabled, because an anchor cannot be disabled natively', async () => {
		el = await fixture('<nldd-list-item><nldd-list-item-segment href="/ergens" disabled><nldd-text-cell text="Uit"></nldd-text-cell></nldd-list-item-segment></nldd-list-item>');
		await waitForUpdate(el);
		const link = el.querySelector('nldd-list-item-segment')!.shadowRoot!.querySelector('a.list-item-segment')!;
		expect(link.getAttribute('aria-disabled')).toBe('true');
	});

	it('blocks the click', async () => {
		el = await fixture('<nldd-list-item><nldd-list-item-segment href="/ergens" disabled><nldd-text-cell text="Uit"></nldd-text-cell></nldd-list-item-segment></nldd-list-item>');
		await waitForUpdate(el);
		const link = el.querySelector('nldd-list-item-segment')!.shadowRoot!.querySelector('a.list-item-segment')!;
		const event = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
		link.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});
});
