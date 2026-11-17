import { describe, it, expect, afterEach } from 'vitest';
import { LitElement, html } from 'lit';
import { OverflowMenu } from './overflow-menu.js';
import '../components/navigation/menu-bar/menu-bar.js';
import '../components/navigation/document-tab-bar/document-tab-bar.js';
import '../components/actions/toolbar/toolbar.js';

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
