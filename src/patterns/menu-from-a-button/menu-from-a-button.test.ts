import { describe, it, expect, afterEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './menu-from-a-button.html?raw';
import choice from './menu-from-a-button.choice.html?raw';
import '../../components/index.js';

describe('patroon: menu bij een knop', () => {
	let root: HTMLElement;

	afterEach(() => {
		root?.remove();
	});

	const mount = async (source: string) => {
		root = document.createElement('div');
		root.innerHTML = source;
		document.body.append(root);
		const button = root.querySelector('nldd-button')!;
		await waitForUpdate(button);
		return button;
	};

	it('zegt de knop al vóór het openen dat er een menu achter zit', async () => {
		const button = await mount(markup);
		const inner = button.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-haspopup')).toBe('menu');
		expect(inner.getAttribute('aria-expanded')).toBe('false');
	});

	it('opent het menu uit de popup-slot zonder eigen bedrading', async () => {
		const button = await mount(markup);
		const menu = button.querySelector('nldd-menu')!;
		button.shadowRoot!.querySelector<HTMLElement>('button')!.click();
		await waitForUpdate(button);
		expect(menu.matches(':popover-open')).toBe(true);
		expect(button.shadowRoot!.querySelector('button')!.getAttribute('aria-expanded')).toBe('true');
	});

	it('zet de destructieve actie als laatste, achter een scheidingslijn', async () => {
		const button = await mount(markup);
		const children = [...button.querySelector('nldd-menu')!.children];
		expect(children[children.length - 1].hasAttribute('destructive')).toBe(true);
		expect(children[children.length - 2].tagName).toBe('NLDD-MENU-DIVIDER');
	});

	it('laat een keuze voorlezen als keuze, met zijn stand', async () => {
		const button = await mount(choice);
		const [datum, naam] = button.querySelectorAll('nldd-menu-item[type="radio"]');
		await waitForUpdate(datum as HTMLElement);
		await waitForUpdate(naam as HTMLElement);
		const role = (item: Element) => item.shadowRoot!.querySelector('button')!;
		expect(role(datum).getAttribute('role')).toBe('menuitemradio');
		expect(role(datum).getAttribute('aria-checked')).toBe('true');
		expect(role(naam).getAttribute('aria-checked')).toBe('false');
	});
});
