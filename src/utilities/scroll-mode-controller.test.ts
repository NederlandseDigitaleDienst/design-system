import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, waitForUpdate } from '../test-utils.js';
import '../components/layout/shell/shell.js';
import '../components/layout/page/page.js';
import '../components/layout/split-views/stacked-split-view/stacked-split-view.js';
import type { NLDDShell } from '../components/layout/shell/shell.js';

/**
 * An app may define nldd-page (or a split view) before nldd-shell: importing
 * nldd-sidebar-section defines the page, and a route can load before its shell.
 * The shell is then in the DOM but not upgraded when the layer connects.
 * These tests make an upgraded shell look like that for a moment, by giving
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
		const shell = document.createElement('nldd-shell') as NLDDShell;
		wrap.append(shell);
		await waitForUpdate(shell);
		const own = Object.getPrototypeOf(shell);
		Object.setPrototypeOf(shell, HTMLElement.prototype);
		// A shell that has not upgraded has not published its mode either.
		shell.style.removeProperty('--context-scroll-mode');
		shell.innerHTML = layer;
		Object.setPrototypeOf(shell, own);
		const child = shell.firstElementChild as HTMLElement;
		await waitForUpdate(child);
		return { shell, child };
	};

	it('registers a page once the shell is defined, and takes its mode', async () => {
		const { shell, child } = await mountLate('<nldd-page><p>Inhoud</p></nldd-page>');
		await expect.poll(() => (child as unknown as { _scrollProvider: unknown })._scrollProvider).toBe(shell);
		await expect.poll(() => child.dataset.scroll).toBe('root');
	});

	it('registers a split view once the shell is defined, and takes its mode', async () => {
		const { child } = await mountLate('<nldd-stacked-split-view></nldd-stacked-split-view>');
		await expect.poll(() => child.dataset.scroll).toBe('root');
	});

	it('leaves a layer alone that left the DOM before the shell was defined', async () => {
		wrap = document.createElement('div');
		document.body.append(wrap);
		const shell = document.createElement('nldd-shell') as NLDDShell;
		wrap.append(shell);
		await waitForUpdate(shell);
		const own = Object.getPrototypeOf(shell);
		Object.setPrototypeOf(shell, HTMLElement.prototype);
		shell.innerHTML = '<nldd-page><p>Inhoud</p></nldd-page>';
		const page = shell.firstElementChild as HTMLElement;
		page.remove();
		Object.setPrototypeOf(shell, own);
		await new Promise((resolve) => setTimeout(resolve));
		expect((page as unknown as { _scrollProvider: unknown })._scrollProvider).toBeNull();
	});
});
