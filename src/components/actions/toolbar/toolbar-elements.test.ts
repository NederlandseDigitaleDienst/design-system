import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './toolbar.js';
import '../menu/menu.js';

describe('nldd-toolbar-item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error and exposes a shadow root', async () => {
		el = await fixture('<nldd-toolbar-item label="Item"><button>X</button></nldd-toolbar-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
		// The slotted control is projected into the item's own box.
		expect(el.shadowRoot!.querySelector('slot')).not.toBeNull();
	});

	it('keeps its sizing and priority properties from attributes', async () => {
		el = await fixture('<nldd-toolbar-item min-width="120px" max-width="240px" width="40%" priority="2"></nldd-toolbar-item>');
		await waitForUpdate(el);
		const item = el as unknown as { minWidth: string; maxWidth: string; width: string; priority: number };
		expect(item.minWidth).toBe('120px');
		expect(item.maxWidth).toBe('240px');
		expect(item.width).toBe('40%');
		expect(item.priority).toBe(2);
	});
});

describe('nldd-toolbar-title', () => {

	it('maakt merk en naam één link met href, en laat de action erbuiten', async () => {
		el = await fixture('<nldd-toolbar-title text="Titel" href="/"><span slot="action">A</span></nldd-toolbar-title>');
		const link = el.shadowRoot!.querySelector('.toolbar__title-link') as HTMLAnchorElement;
		expect(link).not.toBeNull();
		expect(link.getAttribute('href')).toBe('/');
		expect(link.querySelector('slot[name="media"]')).not.toBeNull();
		expect(link.querySelector('slot[name="action"]')).toBeNull();
		expect(el.shadowRoot!.querySelector('slot[name="action"]')).not.toBeNull();
	});

	it('is zonder href geen link', async () => {
		el = await fixture('<nldd-toolbar-title text="Titel"></nldd-toolbar-title>');
		expect(el.shadowRoot!.querySelector('.toolbar__title-link')).toBeNull();
		expect(el.shadowRoot!.querySelector('slot[name="media"]')).not.toBeNull();
	});

	it('toont een media-slot voor de titel', async () => {
		el = await fixture('<nldd-toolbar-title text="Titel"><img slot="media" alt="Merk"></nldd-toolbar-title>');
		const slot = el.shadowRoot!.querySelector('slot[name="media"]') as HTMLSlotElement;
		expect(slot).not.toBeNull();
		expect(slot.assignedElements().length).toBe(1);
	});

	it('staat een media-slot zonder titeltekst toe', async () => {
		el = await fixture('<nldd-toolbar-title><img slot="media" alt="Merk"></nldd-toolbar-title>');
		expect(el.shadowRoot!.querySelector('.toolbar__title')).toBeNull();
		const slot = el.shadowRoot!.querySelector('slot[name="media"]') as HTMLSlotElement;
		expect(slot.assignedElements().length).toBe(1);
	});
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error and shows its text and supporting text', async () => {
		el = await fixture('<nldd-toolbar-title text="Titel" supporting-text="Onder"></nldd-toolbar-title>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
		expect(el.shadowRoot!.textContent).toContain('Titel');
		expect(el.shadowRoot!.textContent).toContain('Onder');
	});

	it('maps min-width / width / max-width onto the title CSS variables (_reflectSizeVar)', async () => {
		el = await fixture('<nldd-toolbar-title text="T" min-width="200px" width="50%" max-width="300px"></nldd-toolbar-title>');
		await waitForUpdate(el);
		const style = (el as HTMLElement).style;
		expect(style.getPropertyValue('--_title-group-min-width')).toBe('200px');
		expect(style.getPropertyValue('--_title-width')).toBe('50%');
		expect(style.getPropertyValue('--_title-max-width')).toBe('300px');
	});

	it('removes the title CSS variables when the size attributes are cleared (_reflectSizeVar)', async () => {
		el = await fixture('<nldd-toolbar-title text="T" min-width="200px" width="50%" max-width="300px"></nldd-toolbar-title>');
		await waitForUpdate(el);
		const style = (el as HTMLElement).style;
		expect(style.getPropertyValue('--_title-width')).toBe('50%');
		const title = el as unknown as { minWidth: string; width: string; maxWidth: string };
		title.minWidth = '';
		title.width = '';
		title.maxWidth = '';
		await waitForUpdate(el);
		expect(style.getPropertyValue('--_title-group-min-width')).toBe('');
		expect(style.getPropertyValue('--_title-width')).toBe('');
		expect(style.getPropertyValue('--_title-max-width')).toBe('');
	});

	it('renders a slotted action control after the title text', async () => {
		el = await fixture('<nldd-toolbar-title text="Titel"><button slot="action" id="act">A</button></nldd-toolbar-title>');
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('slot[name="action"]') as HTMLSlotElement | null;
		expect(slot).not.toBeNull();
		const assigned = slot!.assignedElements();
		expect(assigned).toHaveLength(1);
		expect(assigned[0].id).toBe('act');
	});
});

/* ============================================================
   The overflow declaration is not a menu item yet

   What sits in the overflow slot declares what belongs in the overflow menu.
   The toolbar clones it into the real menu when it collapses; the declaration
   itself stays in the light DOM, hidden, and never becomes a menu item. It
   used to render role="menuitem" there anyway, with no menu around it, which
   axe-core reports as aria-required-parent.
   ============================================================ */

describe('nldd-toolbar-item – overflow declaration', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('leaves the declared overflow item without a menu role', async () => {
		el = await fixture(`
			<nldd-toolbar label="Labels">
				<nldd-toolbar-item slot="start">
					<button type="button">Nieuw label</button>
					<nldd-menu-item slot="overflow" text="Nieuw label"></nldd-menu-item>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const source = el.querySelector('nldd-menu-item') as HTMLElement;
		await waitForUpdate(source);
		const button = source.shadowRoot!.querySelector('.menu__item')!;
		expect(button.hasAttribute('role')).toBe(false);
	});

	it('leaves a declared radio item without a menu role, group or not', async () => {
		el = await fixture(`
			<nldd-toolbar label="Weergave">
				<nldd-toolbar-item slot="start">
					<button type="button">Sorteren</button>
					<nldd-menu-group slot="overflow" text="Sorteren">
						<nldd-menu-item type="radio" text="Naam" value="name"></nldd-menu-item>
					</nldd-menu-group>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el);
		const source = el.querySelector('nldd-menu-item') as HTMLElement;
		await waitForUpdate(source);
		const button = source.shadowRoot!.querySelector('.menu__item')!;
		expect(button.hasAttribute('role')).toBe(false);
		expect(button.hasAttribute('aria-checked')).toBe(false);
	});
});

describe('nldd-toolbar-item – overflow alternative', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	const overflowWarnings = (warn: { mock: { calls: unknown[][] } }) =>
		warn.mock.calls.filter(([message]) => String(message).includes('nothing in slot="overflow"'));

	it('warns at load when an item has no alternative in the overflow menu', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start">
					<nldd-icon-button icon="search" accessible-label="Zoeken"></nldd-icon-button>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el.querySelector('nldd-toolbar-item') as HTMLElement);
		expect(overflowWarnings(warn)).toHaveLength(1);
		expect(String(overflowWarnings(warn)[0][0])).toContain('("Zoeken")');
	});

	it('does not warn when the item has an alternative', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start">
					<nldd-icon-button icon="search" accessible-label="Zoeken"></nldd-icon-button>
					<nldd-menu-item slot="overflow" text="Zoeken" icon="search"></nldd-menu-item>
				</nldd-toolbar-item>
			</nldd-toolbar>
		`);
		await waitForUpdate(el.querySelector('nldd-toolbar-item') as HTMLElement);
		expect(overflowWarnings(warn)).toHaveLength(0);
	});

	it('warns once per item', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(`
			<nldd-toolbar>
				<nldd-toolbar-item slot="start" label="Een"></nldd-toolbar-item>
				<nldd-toolbar-item slot="start" label="Twee"></nldd-toolbar-item>
			</nldd-toolbar>
		`);
		const items = [...el.querySelectorAll('nldd-toolbar-item')] as HTMLElement[];
		await Promise.all(items.map((item) => waitForUpdate(item)));
		(items[0] as HTMLElement & { priority: number }).priority = 3;
		await waitForUpdate(items[0]);
		expect(overflowWarnings(warn).map(([message]) => String(message).match(/\("(\w+)"\)/)?.[1])).toEqual(['Een', 'Twee']);
	});
});
