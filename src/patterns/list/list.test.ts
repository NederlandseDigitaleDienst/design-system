import { describe, it, expect, afterEach, vi } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './list.html?raw';
import actions from './list.actions.html?raw';
import tree from './list.tree.html?raw';
import empty from './list.empty.html?raw';
import '../../components/index.js';

describe('patroon: lijst', () => {
	let root: HTMLElement;

	afterEach(() => {
		root?.remove();
		vi.restoreAllMocks();
	});

	const mount = async (source: string) => {
		root = document.createElement('div');
		root.innerHTML = source;
		document.body.append(root);
		const list = root.querySelector('nldd-list')!;
		await waitForUpdate(list);
		for (const el of root.querySelectorAll('nldd-list-item, nldd-list-item-segment')) await waitForUpdate(el as HTMLElement);
		return list;
	};

	for (const [name, source] of [['standaard', markup], ['meerdere acties', actions], ['boom', tree]]) {
		it(`zet alles in een cel en nest geen control in een control (${name})`, async () => {
			const warn = vi.spyOn(console, 'warn');
			await mount(source);
			expect(warn.mock.calls.filter(([message]) => String(message).includes('nldd-list-item'))).toEqual([]);
		});
	}

	it('maakt met één actie de hele rij de link', async () => {
		await mount(markup);
		for (const item of root.querySelectorAll('nldd-list-item')) {
			expect(item.shadowRoot!.querySelector('a')?.getAttribute('href')).toBe(item.getAttribute('href'));
		}
	});

	it('zet extra acties in een menu dat de rij noemt', async () => {
		await mount(actions);
		for (const item of root.querySelectorAll('nldd-list-item')) {
			// De rij zelf is geen control: het segment opent de aanvraag, de knop het menu.
			expect(item.hasAttribute('href') || item.hasAttribute('button')).toBe(false);
			expect(item.querySelector('nldd-list-item-segment')!.shadowRoot!.querySelector('a')).not.toBeNull();
			const [, acties] = item.querySelectorAll('nldd-list-item-segment');
			expect(acties.querySelector('nldd-icon-cell[icon="ellipsis"]')).not.toBeNull();
			// "Meer" is in twintig rijen twintig keer hetzelfde, dus de knop noemt de rij.
			expect(acties.getAttribute('accessible-label')).toMatch(/^Acties voor Aanvraag A-/);
			// Het menu hangt aan dat segment en staat buiten de lijst.
			const menu = root.querySelector(`nldd-menu[anchor="${acties.id}"]`)!;
			expect(menu).not.toBeNull();
			expect(menu.closest('nldd-list')).toBeNull();
		}
	});

	it('laat in een boom de chevron openklappen en de rij zelf iets anders doen', async () => {
		await mount(tree);
		const takken = [...root.querySelectorAll('nldd-list > nldd-list-item')];
		expect(takken.length).toBeGreaterThan(1);
		for (const tak of takken) {
			expect(tak.hasAttribute('href')).toBe(false);
			const [chevron, label] = tak.querySelectorAll(':scope > nldd-list-item-segment');
			expect(chevron.hasAttribute('disclosure')).toBe(true);
			expect(label.shadowRoot!.querySelector('a')).not.toBeNull();
			expect(tak.querySelector(':scope > nldd-list-item[slot="children"]')).not.toBeNull();
		}
	});

	it('toont de lege toestand van de lijst zelf als er geen rijen zijn', async () => {
		const list = await mount(empty);
		const slot = (name: string) => list.shadowRoot!.querySelector<HTMLSlotElement>(`slot[name="${name}"]`)!;
		expect(slot('empty').hidden).toBe(false);
		expect(slot('no-results').hidden).toBe(true);
	});
});
