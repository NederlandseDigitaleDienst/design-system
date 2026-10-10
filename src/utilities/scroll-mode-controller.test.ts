import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, waitForUpdate } from '../test-utils.js';
import '../components/layout/app-view/app-view.js';
import '../components/layout/page/page.js';
import '../components/layout/split-views/stacked-split-view/stacked-split-view.js';
import type { NLDDAppView } from '../components/layout/app-view/app-view.js';

/**
 * An app may define nldd-page (or a split view) before nldd-app-view: importing
 * nldd-sidebar-section defines the page, and a route can load before its shell.
 * The app-view is then in the DOM but not upgraded when the layer connects.
 * These tests make an upgraded app-view look like that for a moment, by giving
 * it a plain element prototype, and give its own back afterwards, the way the
 * definition arriving later would.
 */
describe('scroll mode: a provider defined after its layers', () => {
	let wrap: HTMLElement;

	afterEach(() => {
		if (wrap) cleanup(wrap.firstElementChild!);
	});

	const mountLate = async (layer: string) => {
		wrap = document.createElement('div');
		document.body.append(wrap);
		const appView = document.createElement('nldd-app-view') as NLDDAppView;
		wrap.append(appView);
		await waitForUpdate(appView);
		const own = Object.getPrototypeOf(appView);
		Object.setPrototypeOf(appView, HTMLElement.prototype);
		// An app-view that has not upgraded has not published its mode either.
		appView.style.removeProperty('--context-scroll-mode');
		appView.innerHTML = layer;
		Object.setPrototypeOf(appView, own);
		const child = appView.firstElementChild as HTMLElement;
		await waitForUpdate(child);
		return { appView, child };
	};

	it('registers a page once the app-view is defined, and takes its mode', async () => {
		const { appView, child } = await mountLate('<nldd-page><p>Inhoud</p></nldd-page>');
		await expect.poll(() => (child as unknown as { _scrollProvider: unknown })._scrollProvider).toBe(appView);
		await expect.poll(() => child.dataset.scroll).toBe('root');
	});

	it('registers a split view once the app-view is defined, and takes its mode', async () => {
		const { child } = await mountLate('<nldd-stacked-split-view></nldd-stacked-split-view>');
		await expect.poll(() => child.dataset.scroll).toBe('root');
	});

	it('leaves a layer alone that left the DOM before the app-view was defined', async () => {
		wrap = document.createElement('div');
		document.body.append(wrap);
		const appView = document.createElement('nldd-app-view') as NLDDAppView;
		wrap.append(appView);
		await waitForUpdate(appView);
		const own = Object.getPrototypeOf(appView);
		Object.setPrototypeOf(appView, HTMLElement.prototype);
		appView.innerHTML = '<nldd-page><p>Inhoud</p></nldd-page>';
		const page = appView.firstElementChild as HTMLElement;
		page.remove();
		Object.setPrototypeOf(appView, own);
		await new Promise((resolve) => setTimeout(resolve));
		expect((page as unknown as { _scrollProvider: unknown })._scrollProvider).toBeNull();
	});
});
