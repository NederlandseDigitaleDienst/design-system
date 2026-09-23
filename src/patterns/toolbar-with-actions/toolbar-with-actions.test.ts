import { describe, it, expect, afterEach, vi } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './toolbar-with-actions.html?raw';
import tabs from './toolbar-with-actions.tabs.html?raw';
import '../../components/index.js';

describe('patroon: werkbalk met acties', () => {
	let root: HTMLElement;

	afterEach(() => {
		root?.remove();
		vi.restoreAllMocks();
	});

	const mount = async (source: string) => {
		root = document.createElement('div');
		root.innerHTML = source;
		document.body.append(root);
		const toolbar = root.querySelector('nldd-toolbar')!;
		await waitForUpdate(toolbar);
		for (const item of root.querySelectorAll('nldd-toolbar-item')) await waitForUpdate(item as HTMLElement);
		return toolbar;
	};

	for (const [name, source] of [['standaard', markup], ['met tabbalk', tabs]]) {
		it(`geeft elk item een alternatief in het overloopmenu (${name})`, async () => {
			const warn = vi.spyOn(console, 'warn');
			await mount(source);
			for (const item of root.querySelectorAll('nldd-toolbar-item')) {
				expect(item.querySelector(':scope > [slot="overflow"]')).not.toBeNull();
			}
			expect(warn.mock.calls.filter(([message]) => String(message).includes('nldd-toolbar-item'))).toEqual([]);
		});
	}

	it('geeft de primaire actie de hoogste priority', async () => {
		await mount(markup);
		const items = [...root.querySelectorAll('nldd-toolbar-item')];
		const priority = (item: Element) => Number(item.getAttribute('priority') ?? 0);
		const primary = items.find((item) => item.querySelector('nldd-button[variant="primary"]'))!;
		expect(Math.max(...items.map(priority))).toBe(priority(primary));
	});

	it('spiegelt de tabs als radio-items, met de actieve tab geselecteerd', async () => {
		await mount(tabs);
		const tabTexts = [...root.querySelectorAll('nldd-tab-bar-item')].map((tab) => [tab.getAttribute('text'), tab.hasAttribute('current')]);
		const menuTexts = [...root.querySelectorAll('nldd-menu-group[slot="overflow"] nldd-menu-item')]
			.map((item) => [item.getAttribute('text'), item.hasAttribute('selected')]);
		expect(menuTexts).toEqual(tabTexts);
		expect(root.querySelectorAll('nldd-menu-group[slot="overflow"] nldd-menu-item:not([type="radio"])').length).toBe(0);
	});
});
