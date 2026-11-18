import { describe, it, expect, afterEach } from 'vitest';
import { LitElement, html } from 'lit';
import { OverflowMenu } from './overflow-menu.js';
import '../components/navigation/menu-bar/menu-bar.js';
import '../components/navigation/document-tab-bar/document-tab-bar.js';
import '../components/actions/toolbar/toolbar.js';
import '../components/actions/button/button.js';
import '../components/layout/sheet/sheet.js';
import { deepActiveElement } from './deep-active-element.js';

const frames = async (n = 3): Promise<void> => {
	for (let i = 0; i < n; i++) await new Promise((resolve) => requestAnimationFrame(resolve));
};

class OverflowHost extends LitElement {
	toggles: boolean[] = [];
	overflow = new OverflowMenu(this, { id: 'test-overflow', onToggle: (open) => this.toggles.push(open) });
	override render() {
		return html`<button>Meer</button>`;
	}
}
customElements.define('test-overflow-host', OverflowHost);

let container: HTMLElement;

afterEach(() => {
	container?.remove();
	document.querySelectorAll('dialog').forEach((dialog) => dialog.remove());
});

async function mountHost(): Promise<OverflowHost> {
	container = document.createElement('div');
	container.innerHTML = '<test-overflow-host></test-overflow-host>';
	document.body.append(container);
	const host = container.firstElementChild as OverflowHost;
	await host.updateComplete;
	return host;
}

describe('OverflowMenu', () => {
	it('keeps its menu in the host shadow root, and takes it along on disconnect', async () => {
		const host = await mountHost();
		const menu = host.overflow.menu!;
		expect(menu.parentNode).toBe(host.shadowRoot);
		expect(document.body.querySelector(':scope > nldd-menu')).toBeNull();
		host.remove();
		expect(host.overflow.menu).toBeNull();
		expect(menu.isConnected).toBe(false);
		container.append(host);
		expect(host.overflow.menu?.parentNode).toBe(host.shadowRoot);
	});

	it('opens from its button and reports each toggle', async () => {
		const host = await mountHost();
		const button = host.shadowRoot!.querySelector('button')!;
		host.overflow.replace([Object.assign(document.createElement('nldd-menu-item'), { text: 'Dakisolatie' })]);
		host.overflow.anchorTo(button);
		expect(button.popoverTargetElement).toBe(host.overflow.menu);
		expect(button.popoverTargetAction).toBe('show');
		button.click();
		await frames();
		expect(host.overflow.open).toBe(true);
		host.overflow.hide();
		await frames();
		expect(host.overflow.open).toBe(false);
		expect(host.toggles).toEqual([true, false]);
	});

	it('refills once it has closed, so a chosen entry keeps its blink', async () => {
		const host = await mountHost();
		const entry = (text: string): HTMLElement => Object.assign(document.createElement('nldd-menu-item'), { text });
		const chosen = entry('Opsomming');
		host.overflow.replace([chosen]);
		host.overflow.menu!.showPopover();
		await frames();
		host.overflow.replace([entry('Genummerd')]);
		expect(chosen.isConnected).toBe(true);
		host.overflow.hide();
		await frames();
		expect([...host.overflow.menu!.children].map((item) => (item as HTMLElement & { text: string }).text)).toEqual(['Genummerd']);
	});

	it('checks a copy at once when its original is checked while the menu is open', async () => {
		const host = await mountHost();
		const originals = ['Geen', 'Opsomming'].map((text) => {
			const item = document.createElement('nldd-menu-item');
			item.setAttribute('type', 'radio');
			item.setAttribute('text', text);
			container.append(item);
			return item;
		});
		originals[0].setAttribute('selected', '');
		host.overflow.mirror(originals);
		host.overflow.menu!.showPopover();
		await frames();
		const copies = [...host.overflow.menu!.children];
		originals[0].removeAttribute('selected');
		originals[1].setAttribute('selected', '');
		host.overflow.mirror(originals);
		expect([...host.overflow.menu!.children]).toEqual(copies);
		expect(copies.map((copy) => copy.hasAttribute('selected'))).toEqual([false, true]);
	});

	it('carries a changed label over to its copy while the menu is open', async () => {
		const host = await mountHost();
		const original = document.createElement('span');
		original.textContent = 'Dakisolatie';
		container.append(original);
		host.overflow.mirror([original]);
		host.overflow.menu!.showPopover();
		await frames();
		const [copy] = host.overflow.menu!.children;
		original.textContent = 'Warmtepomp';
		host.overflow.mirror([original]);
		expect(host.overflow.menu!.firstElementChild).toBe(copy);
		expect(copy.textContent).toBe('Warmtepomp');
	});

	it('refills at once while closed', async () => {
		const host = await mountHost();
		host.overflow.replace([Object.assign(document.createElement('nldd-menu-item'), { text: 'Geen' })]);
		expect(host.overflow.menu!.children).toHaveLength(1);
	});

	it('keeps a select in the menu, and sends a copy’s on from its original', async () => {
		const host = await mountHost();
		const original = document.createElement('nldd-menu-item');
		original.setAttribute('text', 'Warmtepomp');
		container.append(original);
		const onHost: Event[] = [];
		const onOriginal: Event[] = [];
		host.addEventListener('select', (event) => onHost.push(event));
		original.addEventListener('select', (event) => onOriginal.push(event));

		host.overflow.mirror([original]);
		const copy = host.overflow.menu!.querySelector('nldd-menu-item')!;
		expect(copy).not.toBe(original);
		copy.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { value: 'x' } }));
		expect(onOriginal.map((event) => (event as CustomEvent).detail)).toEqual([{ value: 'x' }]);
		expect(onHost).toEqual([]);
	});

	it('gives focus back to the button of the menu when a sheet opened from it closes', async () => {
		// #450: the sheet remembered the copy in the menu, which was out of view
		// once the menu closed, and focus fell to the body.
		container = document.createElement('div');
		container.innerHTML = `
			<div style="width: 160px">
				<nldd-toolbar>
					<nldd-toolbar-item slot="end">
						<nldd-button text="Filter met een lange naam"></nldd-button>
						<nldd-menu-item slot="overflow" text="Filter"></nldd-menu-item>
					</nldd-toolbar-item>
				</nldd-toolbar>
			</div>
			<nldd-sheet accessible-label="Filter"><nldd-button text="Sluit"></nldd-button></nldd-sheet>
		`;
		document.body.append(container);
		const toolbar = container.querySelector('nldd-toolbar') as HTMLElement & { _overflowMenu: OverflowMenu };
		const sheet = container.querySelector('nldd-sheet') as HTMLElement & { show(): void; hide(): void };
		container.querySelector('nldd-menu-item[slot="overflow"]')!.addEventListener('select', () => sheet.show());
		await frames(6);

		const button = toolbar.shadowRoot!.querySelector<HTMLElement>('.toolbar__overflow-button nldd-icon-button')!;
		const menu = toolbar._overflowMenu.menu!;
		const copy = menu.querySelector<HTMLElement>('nldd-menu-item')!;
		expect(copy).not.toBeNull();
		button.focus();
		menu.showPopover();
		await frames();
		expect(toolbar._overflowMenu.open).toBe(true);
		copy.focus();
		copy.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true }));
		await frames();
		const closed = new Promise((resolve) => sheet.addEventListener('close', resolve, { once: true }));
		sheet.hide();
		await closed;
		await frames();
		const active = deepActiveElement();
		expect(active === button || button.shadowRoot!.contains(active)).toBe(true);
	});

	it('does the same for an item of a menu bar', async () => {
		container = document.createElement('div');
		container.innerHTML = `
			<nldd-menu-bar style="width: 150px">${['Aanvragen', 'Dossiers', 'Instellingen', 'Berichten', 'Hulp'].map((text) => `<nldd-menu-bar-item text="${text}"></nldd-menu-bar-item>`).join('')}</nldd-menu-bar>
			<nldd-sheet accessible-label="Hulp"><nldd-button text="Sluit"></nldd-button></nldd-sheet>
		`;
		document.body.append(container);
		const bar = container.querySelector('nldd-menu-bar') as unknown as HTMLElement & { _overflowMenu: OverflowMenu; _toggleOverflowMenu(): void };
		const sheet = container.querySelector('nldd-sheet') as HTMLElement & { show(): void; hide(): void };
		container.querySelector('nldd-menu-bar-item:last-child')!.addEventListener('click', () => sheet.show());
		await frames(6);
		const button = bar.shadowRoot!.querySelector<HTMLElement>('.menu-bar__overflow-button nldd-menu-bar-item')!;
		button.focus();
		bar._toggleOverflowMenu();
		await frames();
		const entries = [...bar._overflowMenu.menu!.querySelectorAll<HTMLElement>('nldd-menu-item')];
		const entry = entries.find((item) => item.getAttribute('text') === 'Hulp')!;
		entry.focus();
		entry.click();
		await frames();
		const closed = new Promise((resolve) => sheet.addEventListener('close', resolve, { once: true }));
		sheet.hide();
		await closed;
		await frames();
		const active = deepActiveElement();
		expect(active === button || button.shadowRoot!.contains(active)).toBe(true);
	});
});

/** The bars that hide what does not fit, each with its menu open. */
const bars = [
	{
		name: 'nldd-menu-bar',
		markup: `<nldd-menu-bar style="width: 150px">${['Aanvragen', 'Dossiers', 'Instellingen', 'Berichten', 'Hulp'].map((text) => `<nldd-menu-bar-item text="${text}"></nldd-menu-bar-item>`).join('')}</nldd-menu-bar>`,
		open: (bar: HTMLElement) => (bar as unknown as { _toggleOverflowMenu(): void })._toggleOverflowMenu(),
	},
	{
		name: 'nldd-document-tab-bar',
		markup: `<nldd-document-tab-bar style="display: block; width: 200px">${['A-1042', 'A-1043', 'D-318', 'D-319', 'D-320'].map((text, i) => `<nldd-document-tab-bar-item text="${text}" ${i === 0 ? 'selected' : ''}></nldd-document-tab-bar-item>`).join('')}</nldd-document-tab-bar>`,
		open: (bar: HTMLElement) => (bar.shadowRoot!.querySelector('.document-tab-bar__overflow-button nldd-icon-button')!.shadowRoot!.querySelector('button') as HTMLElement).click(),
	},
];

describe.each(bars)('$name in a modal dialog', ({ markup, open }) => {
	it('has a menu whose items take focus', async () => {
		const dialog = document.createElement('dialog');
		dialog.innerHTML = markup;
		document.body.append(dialog);
		dialog.showModal();
		const bar = dialog.firstElementChild as HTMLElement & { updateComplete: Promise<boolean> };
		await bar.updateComplete;
		await frames(5);
		open(bar);
		await frames(5);
		const menu = bar.shadowRoot!.querySelector('nldd-menu')!;
		expect(menu.matches(':popover-open')).toBe(true);
		const item = menu.querySelector('nldd-menu-item') as HTMLElement & { updateComplete: Promise<boolean> };
		await item.updateComplete;
		item.focus();
		// Inert, a menu outside the dialog takes no focus.
		expect(item.matches(':focus-within')).toBe(true);
	});
});

describe('nldd-document-tab-bar', () => {
	it('selects the tab picked from its menu, and only that one', async () => {
		container = document.createElement('div');
		container.innerHTML = bars[1]!.markup;
		document.body.append(container);
		const bar = container.firstElementChild as HTMLElement & { updateComplete: Promise<boolean> };
		await bar.updateComplete;
		await frames(5);
		bars[1]!.open(bar);
		await frames(5);
		const changes: Event[] = [];
		bar.addEventListener('tab-change', (event) => changes.push(event));
		const entry = bar.shadowRoot!.querySelector('nldd-menu nldd-menu-item') as HTMLElement & { updateComplete: Promise<boolean> };
		await entry.updateComplete;
		(entry.shadowRoot!.querySelector('.menu__item') as HTMLElement).click();
		await frames(3);
		const selected = [...bar.querySelectorAll('nldd-document-tab-bar-item')].filter((item) => (item as unknown as { selected: boolean }).selected);
		expect(selected).toHaveLength(1);
		expect(changes).toHaveLength(1);
	});
});
