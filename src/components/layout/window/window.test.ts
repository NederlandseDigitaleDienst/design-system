import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDWindow } from './window.js';
import './window.js';
import '../../navigation/top-title-bar/top-title-bar.js';
import { windowStyles } from './window.styles.js';

describe('nldd-window', () => {
	let el: NLDDWindow;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('bevat een dialog element', async () => {
		el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
		await waitForUpdate(el);
		const dialog = el.shadowRoot!.querySelector('dialog');
		expect(dialog).not.toBeNull();
	});

	// Note: showModal() focus trap, backdrop and Escape are native browser features
	// not fully exercised in the test runner — verify in browser-based tests
	it('opent modaal met show() als standaard', async () => {
		el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		expect(dialog.open).toBe(true);
	});

	it('opent modaal, met een backdrop en de pagina erachter inert', async () => {
		el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		expect(dialog.open).toBe(true);
		expect(dialog.matches(':modal')).toBe(true);
	});

	it('sluit met hide()', async () => {
		el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
		await waitForUpdate(el);
		el.show();
		el.hide();
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		expect(dialog.open).toBe(false);
	});

	it('stuurt open event bij show()', async () => {
		el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
		await waitForUpdate(el);
		let fired = false;
		el.addEventListener('open', () => { fired = true; });
		el.show();
		expect(fired).toBe(true);
	});

	it('stuurt close event bij hide()', async () => {
		el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
		await waitForUpdate(el);
		el.show();
		let fired = false;
		el.addEventListener('close', () => { fired = true; });
		el.hide();
		expect(fired).toBe(true);
	});

	it('stelt aria-label in', async () => {
		el = await fixture<NLDDWindow>('<nldd-window accessible-label="Instellingen"></nldd-window>');
		await waitForUpdate(el);
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		expect(dialog.getAttribute('aria-label')).toBe('Instellingen');
	});

	it('sluit bij cancel event (Escape)', async () => {
		el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		dialog.dispatchEvent(new Event('cancel'));
		expect(dialog.open).toBe(false);
	});

	it('sluit modaal venster bij backdrop click (buiten dialog rect)', async () => {
		el = await fixture<NLDDWindow>('<nldd-window width="200px" height="200px"></nldd-window>');
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		expect(dialog.open).toBe(true);

		const rect = dialog.getBoundingClientRect();

		// Note: in test runners where getBoundingClientRect returns {0,0,0,0},
		// any negative coordinate is "outside" — the test passes but does not
		// fully validate the coordinate logic. Verify in browser-based tests.
		// Press AND release on the backdrop: the drag-guard only dismisses when
		// the pointerdown started there too.
		dialog.dispatchEvent(new PointerEvent('pointerdown', {
			clientX: rect.left - 10,
			clientY: rect.top - 10,
			bubbles: true,
		}));
		const backdropClick = new MouseEvent('click', {
			clientX: rect.left - 10,
			clientY: rect.top - 10,
			bubbles: true,
		});
		dialog.dispatchEvent(backdropClick);
		expect(dialog.open).toBe(false);
	});

	it('sluit niet bij backdrop click met no-light-dismiss', async () => {
		el = await fixture<NLDDWindow>('<nldd-window no-light-dismiss width="200px" height="200px"></nldd-window>');
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		const rect = dialog.getBoundingClientRect();

		dialog.dispatchEvent(new PointerEvent('pointerdown', {
			clientX: rect.left - 10,
			clientY: rect.top - 10,
			bubbles: true,
		}));
		dialog.dispatchEvent(new MouseEvent('click', {
			clientX: rect.left - 10,
			clientY: rect.top - 10,
			bubbles: true,
		}));
		expect(dialog.open).toBe(true);
	});

	it('sluit met no-light-dismiss nog wel op Escape', async () => {
		el = await fixture<NLDDWindow>('<nldd-window no-light-dismiss></nldd-window>');
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		dialog.dispatchEvent(new Event('cancel'));
		expect(dialog.open).toBe(false);
	});

	it('sluit niet wanneer een sleep binnen begint en buiten eindigt', async () => {
		el = await fixture<NLDDWindow>('<nldd-window width="200px" height="200px"></nldd-window>');
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		const rect = dialog.getBoundingClientRect();
		if (rect.width === 0 && rect.height === 0) return;

		// Press inside (e.g. selecting text) ...
		dialog.dispatchEvent(new PointerEvent('pointerdown', {
			clientX: rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2,
			bubbles: true,
		}));
		// ... release on the backdrop: the browser fires the click on the dialog
		// with outside coordinates. Must NOT dismiss.
		dialog.dispatchEvent(new MouseEvent('click', {
			clientX: rect.left - 10,
			clientY: rect.top - 10,
			bubbles: true,
		}));
		expect(dialog.open).toBe(true);
	});

	it('sluit niet bij click binnen dialog rect', async () => {
		el = await fixture<NLDDWindow>('<nldd-window width="200px" height="200px"></nldd-window>');
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		const rect = dialog.getBoundingClientRect();

		// Only meaningful when the dialog has a real rect (browser-based tests).
		// When getBoundingClientRect returns {0,0,0,0}, width/2 = 0 which is
		// on the boundary — skip assertion to avoid false positive.
		if (rect.width === 0 && rect.height === 0) {
			console.warn('Inside-click test skipped: dialog has zero-size rect in this test runner');
			return;
		}

		const insideClick = new MouseEvent('click', {
			clientX: rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2,
			bubbles: true,
		});
		dialog.dispatchEvent(insideClick);
		expect(dialog.open).toBe(true);
	});

	it('sluit bij een dismiss van zijn top-title-bar', async () => {
		el = await fixture<NLDDWindow>(`
			<nldd-window>
				<nldd-top-title-bar dismiss-text="Sluit"></nldd-top-title-bar>
			</nldd-window>
		`);
		await waitForUpdate(el);
		const hideSpy = vi.spyOn(el, 'hide');
		el.querySelector('nldd-top-title-bar')!
			.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
		expect(hideSpy).toHaveBeenCalledOnce();
	});

	it('negeert een dismiss van een genest component (bijv. nldd-token verwijderen)', async () => {
		// Regressie: nldd-token (en nldd-banner, nldd-document-tab-bar) vuren `dismiss`
		// for their own element. Inside a window that must not close the window.
		el = await fixture<NLDDWindow>(`
			<nldd-window>
				<nldd-token control="dismiss">Label</nldd-token>
			</nldd-window>
		`);
		await waitForUpdate(el);
		const hideSpy = vi.spyOn(el, 'hide');
		el.querySelector('nldd-token')!
			.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
		expect(hideSpy).not.toHaveBeenCalled();
	});

	describe('centered position', () => {
		// Force md+ viewport: _applyPositionStyles short-circuits and clears
		// inline styles when window.matchMedia(`(max-width: ${smMax})`) matches.
		// Stub it so the override branch is exercised regardless of test
		// runner viewport.
		let originalMatchMedia: typeof window.matchMedia;
		beforeEach(() => {
			originalMatchMedia = window.matchMedia;
			window.matchMedia = ((query: string) => {
				const list = originalMatchMedia.call(window, query);
				return new Proxy(list, {
					get(target, prop) {
						if (prop === 'matches' && query.includes('max-width')) return false;
						const v = (target as unknown as Record<string, unknown>)[prop as string];
						return typeof v === 'function' ? v.bind(target) : v;
					},
				});
			}) as typeof window.matchMedia;
		});
		afterEach(() => {
			window.matchMedia = originalMatchMedia;
		});

		function dialogOf(window: NLDDWindow): HTMLDialogElement {
			return window.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		}

		it('centered=true: dialog krijgt translate(-50%, -50%) op beide assen', async () => {
			el = await fixture<NLDDWindow>('<nldd-window centered></nldd-window>');
			await waitForUpdate(el);
			el.show();
			await waitForUpdate(el);

			const dialog = dialogOf(el);
			expect(dialog.style.top).toBe('50%');
			expect(dialog.style.left).toBe('50%');
			expect(dialog.style.transform).toContain('-50%');
			expect(dialog.style.transform).toContain(', -50%');
		});

		it('centered + bottom="0": horizontaal centered, verticaal bottom-aligned', async () => {
			el = await fixture<NLDDWindow>('<nldd-window centered bottom="0"></nldd-window>');
			await waitForUpdate(el);
			el.show();
			await waitForUpdate(el);

			const dialog = dialogOf(el);
			expect(dialog.style.bottom).toBe('0px');
			expect(dialog.style.left).toBe('50%');
			// The Y axis is no longer centered (bottom wins), the X axis still is.
			expect(dialog.style.transform).toMatch(/translate\(-50%,\s*0(px)?\)/);
		});

		it('zonder centered en zonder edge-attrs: geen inline override', async () => {
			el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
			await waitForUpdate(el);
			el.show();
			await waitForUpdate(el);

			const dialog = dialogOf(el);
			expect(dialog.style.transform).toBe('');
			// margin: '' (empty), so the UA default centering stays active
			expect(dialog.style.margin).toBe('');
		});
	});

	describe('scheme', () => {
		it('applies color-scheme to host and dialog when scheme="dark"', async () => {
			el = await fixture<NLDDWindow>('<nldd-window scheme="dark" accessible-label="Test"></nldd-window>');
			await waitForUpdate(el);
			expect(el.style.colorScheme).toBe('dark');
			const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
			expect(dialog.style.colorScheme).toBe('dark');
		});

		it('applies color-scheme to host and dialog when scheme="light"', async () => {
			el = await fixture<NLDDWindow>('<nldd-window scheme="light" accessible-label="Test"></nldd-window>');
			await waitForUpdate(el);
			expect(el.style.colorScheme).toBe('light');
			const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
			expect(dialog.style.colorScheme).toBe('light');
		});

		it('clears color-scheme when scheme="inherit"', async () => {
			el = await fixture<NLDDWindow>('<nldd-window scheme="dark" accessible-label="Test"></nldd-window>');
			await waitForUpdate(el);
			expect(el.style.colorScheme).toBe('dark');
			el.setAttribute('scheme', 'inherit');
			await waitForUpdate(el);
			expect(el.style.colorScheme).toBe('');
			const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
			expect(dialog.style.colorScheme).toBe('');
		});
	});
});

describe('nldd-window neemt geen ruimte in de flow', () => {
	// The window is a position:fixed <dialog>, so the host should not be a box of
	// its own. As a block it grows along with its siblings and steals their
	// height.
	it('zet de host op display: contents', () => {
		expect(windowStyles.cssText).toMatch(/:host\s*\{[^}]*display:\s*contents/);
	});

	// The hidden rule comes later and is more specific, so it beats contents.
	it('blijft verbergbaar met hidden', () => {
		expect(windowStyles.cssText).toMatch(/:host\(\[hidden\]\)\s*\{[^}]*display:\s*none/);
	});
});

describe('nldd-window meldt sluiten via elke route', () => {
	let el: NLDDWindow & { show(): void; hide(): void };

	afterEach(() => {
		if (el) cleanup(el);
	});

	function dialogVan(host: NLDDWindow): HTMLDialogElement {
		return host.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
	}

	// hide() cannot be the only source of `close`: anything that closes the
	// dialog directly skips it, and the window would go quiet.
	it('stuurt close wanneer de dialog buiten hide() om sluit', async () => {
		el = await fixture<NLDDWindow & { show(): void; hide(): void }>(
			'<nldd-window accessible-label="Test"></nldd-window>',
		);
		await waitForUpdate(el);
		let aantal = 0;
		el.addEventListener('close', () => { aantal += 1; });
		el.show();
		await waitForUpdate(el);
		const dialog = dialogVan(el);
		dialog.close();
		dialog.dispatchEvent(new Event('close'));
		await waitForUpdate(el);
		expect(aantal).toBe(1);
	});

	// A nested overlay (the nldd-popover datepicker inside an nldd-date-field,
	// say) fires its own `close` with composed + bubbles, which reaches the
	// dialog and hits the same @close listener. Without a target check the
	// window emitted its own close while staying open, and the guard against a
	// double close then swallowed the real one.
	it('emit geen close voor een gebubbelde close uit geneste inhoud', async () => {
		el = await fixture<NLDDWindow & { show(): void; hide(): void }>(
			'<nldd-window accessible-label="Test"><div class="inner"></div></nldd-window>',
		);
		await waitForUpdate(el);
		let aantal = 0;
		el.addEventListener('close', (e) => { if (e.target === el) aantal += 1; });
		el.show();
		await waitForUpdate(el);
		el.querySelector('.inner')!.dispatchEvent(
			new CustomEvent('close', { bubbles: true, composed: true }),
		);
		await waitForUpdate(el);
		expect(aantal).toBe(0);
		expect(dialogVan(el).open).toBe(true);
	});

	it('stuurt close niet twee keer als beide routes samenvallen', async () => {
		el = await fixture<NLDDWindow & { show(): void; hide(): void }>(
			'<nldd-window accessible-label="Test"></nldd-window>',
		);
		await waitForUpdate(el);
		let aantal = 0;
		el.addEventListener('close', () => { aantal += 1; });
		el.show();
		await waitForUpdate(el);
		el.hide();
		dialogVan(el).dispatchEvent(new Event('close'));
		await waitForUpdate(el);
		expect(aantal).toBe(1);
	});
});

describe('nldd-window – backdrop click', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const mount = async (): Promise<HTMLElement> => {
		el = await fixture<HTMLElement>('<nldd-window accessible-label="Test"><button id="inner">Klik</button></nldd-window>');
		await waitForUpdate(el);
		(el as HTMLElement & { show: () => void }).show();
		await waitForUpdate(el);
		return el;
	};

	const dialog = (host: HTMLElement): HTMLDialogElement =>
		host.shadowRoot!.querySelector('dialog') as HTMLDialogElement;

	it('stays open when content is activated programmatically', async () => {
		await mount();
		// A programmatic click carries clientX/clientY 0,0 — outside every dialog
		// rect — so a coordinate-only backdrop check would close the window.
		el.querySelector<HTMLButtonElement>('#inner')!.click();
		await waitForUpdate(el);
		expect(dialog(el).open).toBe(true);
	});

	it('still closes on a real backdrop click', async () => {
		await mount();
		const d = dialog(el);
		// A real backdrop interaction is a press followed by a release, both on
		// the backdrop.
		d.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, clientX: 0, clientY: 0 }));
		d.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, clientX: 0, clientY: 0 }));
		await waitForUpdate(el);
		expect(d.open).toBe(false);
	});
});

describe('nldd-window – accessible name', () => {
	let el: NLDDWindow;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	const label = (host: NLDDWindow) => host.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label');
	const withBar = (attrs: string, text: string) =>
		`<nldd-window ${attrs}><nldd-page><nldd-top-title-bar slot="header" text="${text}"></nldd-top-title-bar></nldd-page></nldd-window>`;

	it('takes the text of its title bar', async () => {
		el = await fixture<NLDDWindow>(withBar('', 'Filters'));
		await waitForUpdate(el);
		expect(label(el)).toBe('Filters');
	});

	it('an accessible-label wins over the title bar', async () => {
		el = await fixture<NLDDWindow>(withBar('accessible-label="Zoekfilters"', 'Filters'));
		await waitForUpdate(el);
		expect(label(el)).toBe('Zoekfilters');
	});

	it('follows a title that changes', async () => {
		el = await fixture<NLDDWindow>(withBar('', 'Filters'));
		const bar = el.querySelector('nldd-top-title-bar') as HTMLElement & { text: string };
		bar.text = 'Sortering';
		await waitForUpdate(bar);
		await waitForUpdate(el);
		expect(label(el)).toBe('Sortering');
	});

	it('picks up a title bar that arrives later', async () => {
		el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
		el.insertAdjacentHTML('beforeend', '<nldd-top-title-bar text="Later"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(label(el)).toBe('Later');
	});

	it('is not named by the title bar of an overlay nested inside it', async () => {
		el = await fixture<NLDDWindow>('<nldd-window><nldd-sheet><nldd-top-title-bar text="Binnen"></nldd-top-title-bar></nldd-sheet></nldd-window>');
		await waitForUpdate(el);
		expect(label(el)).toBe('Venster');
	});

	it('is called Venster without either, and warns when it opens', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDWindow>('<nldd-window></nldd-window>');
		await waitForUpdate(el);
		el.show();
		expect(label(el)).toBe('Venster');
		expect(warn.mock.calls.some(([message]) => String(message).includes('No accessible-label'))).toBe(true);
	});

	it('does not warn when its title bar names it', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDWindow>(withBar('', 'Filters'));
		await waitForUpdate(el);
		el.show();
		expect(warn.mock.calls.some(([message]) => String(message).includes('No accessible-label'))).toBe(false);
	});
});

describe('nldd-window – open attribute', () => {
	let el: NLDDWindow;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const dialog = () => el.shadowRoot!.querySelector('dialog')!;

	it('opens from the first render when open is set', async () => {
		el = await fixture<NLDDWindow>('<nldd-window accessible-label="Test" open></nldd-window>');
		await waitForUpdate(el);
		expect(dialog().open).toBe(true);
	});

	it('opens and closes when open is set and cleared', async () => {
		el = await fixture<NLDDWindow>('<nldd-window accessible-label="Test"></nldd-window>');
		el.open = true;
		await waitForUpdate(el);
		expect(dialog().open).toBe(true);

		const closed = new Promise((resolve) => el.addEventListener('close', resolve, { once: true }));
		el.open = false;
		await closed;
		expect(dialog().open).toBe(false);
	});

	it('reflects show() and hide() in the attribute', async () => {
		el = await fixture<NLDDWindow>('<nldd-window accessible-label="Test"></nldd-window>');
		el.show();
		await waitForUpdate(el);
		expect(el.hasAttribute('open')).toBe(true);
		el.hide();
		await waitForUpdate(el);
		expect(el.hasAttribute('open')).toBe(false);
	});

	it('clears open when it closes another way', async () => {
		el = await fixture<NLDDWindow>('<nldd-window accessible-label="Test" open></nldd-window>');
		await waitForUpdate(el);
		const closed = new Promise((resolve) => el.addEventListener('close', resolve, { once: true }));
		dialog().close();
		await closed;
		await waitForUpdate(el);
		expect(el.open).toBe(false);
		expect(el.hasAttribute('open')).toBe(false);
	});
});

describe('nldd-window – show() before the first render', () => {
	let el: NLDDWindow;

	afterEach(() => {
		if (el) cleanup(el);
	});

	/** Like `fixture`, but returns before the first render: these tests are about
	 *  what happens when a consumer calls show() in that very window. */
	const mountUnrendered = (): NLDDWindow => {
		const wrapper = document.createElement('div');
		wrapper.innerHTML = '<nldd-window accessible-label="Test"></nldd-window>';
		document.body.appendChild(wrapper);
		return wrapper.firstElementChild as NLDDWindow;
	};

	it('still opens when show() is called before the first render', async () => {
		el = mountUnrendered();
		expect(el.shadowRoot?.querySelector('dialog')).toBeFalsy();
		el.show();

		await waitForUpdate(el);
		await el.updateComplete;
		expect(el.shadowRoot!.querySelector('dialog')!.open).toBe(true);
	});

	it('lets a hide() before the first render cancel that pending open', async () => {
		el = mountUnrendered();
		el.show();
		el.hide();

		await waitForUpdate(el);
		await el.updateComplete;
		expect(el.shadowRoot!.querySelector('dialog')!.open).toBe(false);
	});
});
