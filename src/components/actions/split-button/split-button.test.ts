import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import '../../../assets/styles/variables.css';
import './split-button.js';
import '../../actions/menu/menu.js';

describe('nldd-split-button', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-split-button></nldd-split-button>');
		await waitForUpdate(el);

		expect(el.shadowRoot).not.toBeNull();
	});

	it('without a slotted menu, chevron click dispatches menu-click', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"></nldd-split-button>');
		await waitForUpdate(el);

		let fired = false;
		el.addEventListener('menu-click', () => { fired = true; });

		const trigger = el.shadowRoot!.querySelector<HTMLElement>('.split-button__popup-button nldd-icon-button')!;
		trigger.click();
		await waitForUpdate(el);

		expect(fired).toBe(true);
	});

	it('with a slotted nldd-menu, chevron click opens it instead of firing menu-click', async () => {
		el = await fixture(`
			<nldd-split-button text="Opslaan">
				<nldd-menu>
					<nldd-menu-item text="Opslaan als…"></nldd-menu-item>
					<nldd-menu-item text="Verwijderen"></nldd-menu-item>
				</nldd-menu>
			</nldd-split-button>
		`);
		await waitForUpdate(el);

		let menuClickFired = false;
		el.addEventListener('menu-click', () => { menuClickFired = true; });

		const menu = el.querySelector<HTMLElement>('nldd-menu')!;
		const trigger = el.shadowRoot!.querySelector<HTMLElement>('.split-button__popup-button nldd-icon-button')!;
		trigger.click();
		await waitForUpdate(el);

		expect(menuClickFired).toBe(false);
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('keeps the slotted menu and its items in the light DOM (no moving)', async () => {
		el = await fixture(`
			<nldd-split-button text="Opslaan">
				<nldd-menu>
					<nldd-menu-item text="A"></nldd-menu-item>
					<nldd-menu-item text="B"></nldd-menu-item>
				</nldd-menu>
			</nldd-split-button>
		`);
		await waitForUpdate(el);

		const menu = el.querySelector('nldd-menu')!;
		expect(menu.querySelectorAll('nldd-menu-item').length).toBe(2);
		// Nothing is moved into the split-button's shadow DOM.
		expect(el.shadowRoot!.querySelector('nldd-menu')).toBeNull();
	});

	it('wires an nldd-menu added after first render', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"></nldd-split-button>');
		await waitForUpdate(el);

		const menu = document.createElement('nldd-menu');
		const item = document.createElement('nldd-menu-item');
		item.setAttribute('text', 'Later');
		menu.appendChild(item);
		el.appendChild(menu);
		await waitForUpdate(el);

		// The wired menu and its item stay in the split-button's light DOM
		// (the architecture pierces shadow boundaries instead of moving nodes).
		expect(el.querySelector('nldd-menu nldd-menu-item')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('nldd-menu')).toBeNull();

		let menuClickFired = false;
		el.addEventListener('menu-click', () => { menuClickFired = true; });
		const trigger = el.shadowRoot!.querySelector<HTMLElement>('.split-button__popup-button nldd-icon-button')!;
		trigger.click();
		await waitForUpdate(el);

		expect(menuClickFired).toBe(false);
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('applies an explicit width to the host and --_split-button-width', async () => {
		el = await fixture('<nldd-split-button text="Opslaan" width="240px"></nldd-split-button>');
		await waitForUpdate(el);
		expect((el as HTMLElement).style.width).toBe('240px');
		expect((el as HTMLElement).style.getPropertyValue('--_split-button-width')).toBe('100%');
	});

	it('treats width="full" as 100% via --_split-button-width without an inline width', async () => {
		el = await fixture('<nldd-split-button text="Opslaan" width="full"></nldd-split-button>');
		await waitForUpdate(el);
		expect((el as HTMLElement).style.getPropertyValue('--_split-button-width')).toBe('100%');
		expect((el as HTMLElement).style.width).toBe('');
	});

	it('anchors a declaratively-slotted menu to the popup button', async () => {
		el = await fixture(`
			<nldd-split-button text="Opslaan">
				<nldd-menu><nldd-menu-item text="A"></nldd-menu-item></nldd-menu>
			</nldd-split-button>
		`);
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as unknown as { anchorElement: Element | null };
		const wrapper = el.shadowRoot!.querySelector('.split-button__popup-button');
		expect(menu.anchorElement).toBe(wrapper);
	});
});

describe('nldd-split-button – slotted popup overlay', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('releases the previous overlay when the slot empties', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"><nldd-menu></nldd-menu></nldd-split-button>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		const wrapper = el.shadowRoot!.querySelector('.split-button__popup-button');
		expect((menu as unknown as { anchorElement: Element | null }).anchorElement).toBe(wrapper);
		menu.remove();
		await waitForUpdate(el);
		expect((menu as unknown as { anchorElement: Element | null }).anchorElement).toBeNull();
	});

	it('opens the menu on a keyboard click after a pointer gesture that never became a click', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"><nldd-menu></nldd-menu></nldd-split-button>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		const wrapper = el.shadowRoot!.querySelector('.split-button__popup-button')!;
		menu.showPopover();
		await waitForUpdate(el);
		wrapper.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		menu.hidePopover();
		await waitForUpdate(el);
		// The chevron is an nldd-icon-button; split-button binds @click on that host.
		wrapper.querySelector('nldd-icon-button')!.dispatchEvent(
			new MouseEvent('click', { bubbles: true, composed: true, detail: 0 })
		);
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});
});

describe('nldd-split-button – on a colored surface', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('draws the inherit-tinted surface once: the split-button has it, its action button is clear', async () => {
		el = await fixture('<nldd-split-button text="Opslaan" appearance="inherit-tinted" style="color: rgb(255, 255, 255)"></nldd-split-button>');
		await waitForUpdate(el);

		const root = el.shadowRoot!;
		expect(getComputedStyle(root.querySelector('.split-button')!).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		const action = root.querySelector('nldd-button')!;
		await (action as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		expect(getComputedStyle(action.shadowRoot!.querySelector('.button')!).backgroundColor).toBe('rgba(0, 0, 0, 0)');
	});

	it('gives the inherit-filled split-button a surface of its own', async () => {
		el = await fixture('<nldd-split-button text="Opslaan" appearance="inherit-filled" style="color: rgb(255, 255, 255)"></nldd-split-button>');
		await waitForUpdate(el);

		expect(getComputedStyle(el.shadowRoot!.querySelector('.split-button')!).backgroundColor).toBe('rgb(255, 255, 255)');
	});
});
