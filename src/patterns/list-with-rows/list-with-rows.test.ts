import { describe, it, expect, afterEach, vi } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './list-with-rows.html?raw';
import actions from './list-with-rows.actions.html?raw';
import empty from './list-with-rows.empty.html?raw';
import '../../components/index.js';

describe('patroon: lijst met rijen', () => {
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

	for (const [name, source] of [['standaard', markup], ['meerdere acties', actions]]) {
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

	it('geeft met meer acties elke actie een eigen control, en de rij geen', async () => {
		await mount(actions);
		for (const item of root.querySelectorAll('nldd-list-item')) {
			expect(item.hasAttribute('href') || item.hasAttribute('button')).toBe(false);
			const [link, edit] = item.querySelectorAll('nldd-list-item-segment');
			expect(link.shadowRoot!.querySelector('a')).not.toBeNull();
			expect(edit.shadowRoot!.querySelector('button')?.getAttribute('aria-label')).toMatch(/^Bewerk /);
		}
	});

	it('toont de lege toestand van de lijst zelf als er geen rijen zijn', async () => {
		const list = await mount(empty);
		const slot = (name: string) => list.shadowRoot!.querySelector<HTMLSlotElement>(`slot[name="${name}"]`)!;
		expect(slot('empty').hidden).toBe(false);
		expect(slot('no-results').hidden).toBe(true);
	});
});
