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

	const chevronOf = (host: HTMLElement) =>
		host.shadowRoot!.querySelector<HTMLElement>('.split-button__popup-button nldd-icon-button')!;
	const innerButtonOf = async (chevron: HTMLElement) => {
		await (chevron as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		return chevron.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
	};

	it('opens a menu in the popup slot from the chevron', async () => {
		el = await fixture(`
			<nldd-split-button text="Opslaan">
				<nldd-menu slot="popup">
					<nldd-menu-item text="Opslaan als…"></nldd-menu-item>
				</nldd-menu>
			</nldd-split-button>
		`);
		await waitForUpdate(el);
		const menu = el.querySelector<HTMLElement>('nldd-menu')!;
		(await innerButtonOf(chevronOf(el))).click();
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('opens a menu without slot="popup" as a fallback', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"><nldd-menu><nldd-menu-item text="A"></nldd-menu-item></nldd-menu></nldd-split-button>');
		await waitForUpdate(el);
		const menu = el.querySelector<HTMLElement>('nldd-menu')!;
		(await innerButtonOf(chevronOf(el))).click();
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('takes the menu in the popup slot when both slots hold one', async () => {
		el = await fixture(`
			<nldd-split-button text="Opslaan">
				<nldd-menu id="fallback"><nldd-menu-item text="A"></nldd-menu-item></nldd-menu>
				<nldd-menu id="popup" slot="popup"><nldd-menu-item text="B"></nldd-menu-item></nldd-menu>
			</nldd-split-button>
		`);
		await waitForUpdate(el);
		(await innerButtonOf(chevronOf(el))).click();
		await waitForUpdate(el);
		expect(el.querySelector('#popup')!.matches(':popover-open')).toBe(true);
		expect(el.querySelector('#fallback')!.matches(':popover-open')).toBe(false);
	});

	it('anchors the menu to the chevron, which takes aria-expanded from it', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"><nldd-menu slot="popup"><nldd-menu-item text="A"></nldd-menu-item></nldd-menu></nldd-split-button>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as unknown as HTMLElement & { anchorElement: Element | null };
		const chevron = chevronOf(el);
		expect(menu.anchorElement).toBe(chevron);
		(await innerButtonOf(chevron)).click();
		await waitForUpdate(el);
		await waitForUpdate(chevron);
		expect((await innerButtonOf(chevron)).getAttribute('aria-expanded')).toBe('true');
	});

	it('keeps the slotted menu in the light DOM', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"><nldd-menu slot="popup"><nldd-menu-item text="A"></nldd-menu-item></nldd-menu></nldd-split-button>');
		await waitForUpdate(el);
		expect(el.querySelector('nldd-menu nldd-menu-item')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('nldd-menu')).toBeNull();
	});

	it('wires an nldd-menu added after first render', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"></nldd-split-button>');
		await waitForUpdate(el);
		const menu = document.createElement('nldd-menu');
		menu.slot = 'popup';
		menu.appendChild(Object.assign(document.createElement('nldd-menu-item'), { text: 'Later' }));
		el.appendChild(menu);
		await waitForUpdate(el);
		(await innerButtonOf(chevronOf(el))).click();
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('opens a menu elsewhere through popovertarget and anchors it to the chevron', async () => {
		el = await fixture(`
			<div>
				<nldd-split-button text="Opslaan" popovertarget="opties"></nldd-split-button>
				<nldd-menu id="opties"><nldd-menu-item text="A"></nldd-menu-item></nldd-menu>
			</div>
		`);
		const split = el.querySelector<HTMLElement>('nldd-split-button')!;
		await waitForUpdate(split);
		const menu = el.querySelector('#opties') as unknown as HTMLElement & { anchorElement: Element | null };
		const chevron = chevronOf(split);
		(await innerButtonOf(chevron)).click();
		await waitForUpdate(split);
		expect(menu.matches(':popover-open')).toBe(true);
		expect(menu.anchorElement).toBe(chevron);
	});

	it('says which action the chevron belongs to', async () => {
		el = await fixture('<nldd-split-button text="Bewaar"><nldd-menu slot="popup"></nldd-menu></nldd-split-button>');
		await waitForUpdate(el);
		expect(chevronOf(el).getAttribute('text')).toBe('Meer opties voor Bewaar');
	});

	it('puts a CSS length in local variables only, so the app can still set a width', async () => {
		el = await fixture('<nldd-split-button text="Opslaan" width="240px"></nldd-split-button>');
		await waitForUpdate(el);
		expect(el.style.width).toBe('');
		expect(el.style.getPropertyValue('--_split-button-host-width')).toBe('240px');
		expect(el.getBoundingClientRect().width).toBe(240);
		el.style.width = '300px';
		expect(el.getBoundingClientRect().width).toBe(300);
	});

	it('treats width="full" as the width of its container', async () => {
		el = await fixture('<div style="width: 400px"><nldd-split-button text="Opslaan" width="full"></nldd-split-button></div>');
		const split = el.querySelector<HTMLElement>('nldd-split-button')!;
		await waitForUpdate(split);
		expect(split.getBoundingClientRect().width).toBe(400);
	});

	it('keeps the label on one line', async () => {
		el = await fixture('<div style="width: 120px"><nldd-split-button text="Bewaar en sluit het dossier"><nldd-menu slot="popup"></nldd-menu></nldd-split-button></div>');
		const split = el.querySelector<HTMLElement>('nldd-split-button')!;
		await waitForUpdate(split);
		const action = split.shadowRoot!.querySelector('nldd-button')!;
		await (action as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		const text = action.shadowRoot!.querySelector<HTMLElement>('.button__text')!;
		expect(getComputedStyle(text).whiteSpace).toBe('nowrap');
		// No ellipsis: the split button grows to fit its label instead.
		expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
	});

	it('gives the buttons inside the meaning of an alias, not the alias', async () => {
		el = await fixture('<nldd-split-button text="Opslaan" appearance="secondary"></nldd-split-button>');
		await waitForUpdate(el);
		expect((el.shadowRoot!.querySelector('nldd-button') as unknown as { appearance: string }).appearance).toBe('neutral-tinted');
		expect((chevronOf(el) as unknown as { appearance: string }).appearance).toBe('neutral-tinted');
	});
});

describe('nldd-split-button – main action', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const actionOf = async (host: HTMLElement) => {
		const button = host.shadowRoot!.querySelector<HTMLElement>('nldd-button')!;
		await (button as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		return button.shadowRoot!.querySelector<HTMLElement>('.button')!;
	};

	it('fires action-click', async () => {
		el = await fixture('<nldd-split-button text="Bewaar"></nldd-split-button>');
		await waitForUpdate(el);
		let fired = 0;
		el.addEventListener('action-click', () => { fired++; });
		(await actionOf(el)).click();
		expect(fired).toBe(1);
	});

	it('submits the form it sits in with type="submit"', async () => {
		el = await fixture('<form><nldd-split-button text="Bewaar" type="submit"></nldd-split-button></form>');
		const form = el as unknown as HTMLFormElement;
		let submitted = 0;
		form.addEventListener('submit', (e) => { e.preventDefault(); submitted++; });
		const split = form.querySelector<HTMLElement>('nldd-split-button')!;
		await waitForUpdate(split);
		(await actionOf(split)).click();
		expect(submitted).toBe(1);
	});

	it('submits the form its form attribute names', async () => {
		el = await fixture('<div><form id="aanvraag"></form><nldd-split-button text="Bewaar" type="submit" form="aanvraag"></nldd-split-button></div>');
		const form = el.querySelector('form')!;
		let submitted = 0;
		form.addEventListener('submit', (e) => { e.preventDefault(); submitted++; });
		const split = el.querySelector<HTMLElement>('nldd-split-button')!;
		await waitForUpdate(split);
		(await actionOf(split)).click();
		expect(submitted).toBe(1);
	});

	it('does not submit while loading', async () => {
		el = await fixture('<form><nldd-split-button text="Bewaar" type="submit" loading></nldd-split-button></form>');
		const form = el as unknown as HTMLFormElement;
		let submitted = 0;
		form.addEventListener('submit', (e) => { e.preventDefault(); submitted++; });
		const split = form.querySelector<HTMLElement>('nldd-split-button')!;
		await waitForUpdate(split);
		(await actionOf(split)).click();
		expect(submitted).toBe(0);
	});

	it('renders the main action as a link with href and download', async () => {
		el = await fixture('<nldd-split-button text="Download PDF" href="/aanvraag.pdf" download></nldd-split-button>');
		await waitForUpdate(el);
		const link = await actionOf(el);
		expect(link.tagName).toBe('A');
		expect(link.getAttribute('href')).toBe('/aanvraag.pdf');
		expect(link.hasAttribute('download')).toBe(true);
	});
});

describe('nldd-split-button – slotted popup overlay', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const chevronButton = async (host: HTMLElement) => {
		const chevron = host.shadowRoot!.querySelector<HTMLElement>('.split-button__popup-button nldd-icon-button')!;
		await (chevron as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		return chevron.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
	};

	it('releases the overlay when the slot empties', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"><nldd-menu slot="popup"></nldd-menu></nldd-split-button>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as unknown as HTMLElement & { anchorElement: Element | null };
		expect(menu.anchorElement).not.toBeNull();
		menu.remove();
		await waitForUpdate(el);
		expect(menu.anchorElement).toBeNull();
	});

	it('opens the menu on a keyboard click after a pointer gesture that never became a click', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"><nldd-menu slot="popup"></nldd-menu></nldd-split-button>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		const button = await chevronButton(el);
		menu.showPopover();
		button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		menu.hidePopover();
		button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 0 }));
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('opens the menu again after the chevron closed it', async () => {
		el = await fixture('<nldd-split-button text="Opslaan"><nldd-menu slot="popup"><nldd-menu-item text="Opslaan als"></nldd-menu-item></nldd-menu></nldd-split-button>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		const button = await chevronButton(el);
		const press = async (lightDismiss: boolean) => {
			button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
			if (lightDismiss) menu.hidePopover();
			button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));
			await waitForUpdate(el);
		};
		await press(false);
		expect(menu.matches(':popover-open')).toBe(true);
		await press(true);
		expect(menu.matches(':popover-open')).toBe(false);
		await press(false);
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

	it('forwards the shortcut to the main action', async () => {
		el = await fixture('<nldd-split-button text="Bewaar" shortcut="Ctrl+S" shortcut-mac="Cmd+S"></nldd-split-button>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('nldd-button')!;
		expect(button.getAttribute('shortcut')).toBe('Ctrl+S');
		expect(button.getAttribute('shortcut-mac')).toBe('Cmd+S');
	});
});
