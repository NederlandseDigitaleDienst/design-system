import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDShell } from './shell.js';
import './shell.js';
import type { NLDDNavigationSplitView } from '../split-views/navigation-split-view/navigation-split-view.js';
import '../split-views/navigation-split-view/navigation-split-view.js';
import '../split-views/bar-split-view/bar-split-view.js';
import '../split-views/split-view-pane/split-view-pane.js';
import '../page/page.js';
import '../sheet/sheet.js';
import '../../status-and-feedback/modal-dialog/modal-dialog.js';

describe('nldd-shell', () => {
	let el: NLDDShell;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-shell></nldd-shell>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders the shell container', async () => {
		el = await fixture('<nldd-shell></nldd-shell>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.shell')).not.toBeNull();
	});

	it('renders slotted content', async () => {
		el = await fixture('<nldd-shell><div id="child"></div></nldd-shell>');
		await waitForUpdate(el);
		expect(el.querySelector('#child')).not.toBeNull();
	});

	it('defaults background to "base"', async () => {
		el = await fixture('<nldd-shell></nldd-shell>');
		await waitForUpdate(el);
		expect((el as unknown as { background: string }).background).toBe('base');
		expect(el.hasAttribute('background')).toBe(false);
	});

	it('reflects background="tinted" attribute', async () => {
		el = await fixture('<nldd-shell background="tinted"></nldd-shell>');
		await waitForUpdate(el);
		expect(el.getAttribute('background')).toBe('tinted');
	});

	it('setting background property reflects to attribute', async () => {
		el = await fixture('<nldd-shell></nldd-shell>');
		await waitForUpdate(el);
		el.background = 'tinted';
		await waitForUpdate(el);
		expect(el.getAttribute('background')).toBe('tinted');
	});

	describe('document.body background ownership', () => {
		// Track every fixture so a mid-test failure can't leave a detached
		// instance still listed as `_bodyBackgroundOwner` inside the module.
		const instances: NLDDShell[] = [];
		async function track(html: string): Promise<NLDDShell> {
			const el = await fixture<NLDDShell>(html);
			instances.push(el);
			return el;
		}

		afterEach(() => {
			while (instances.length > 0) {
				const inst = instances.pop()!;
				if (inst.isConnected) cleanup(inst);
			}
			document.body.style.removeProperty('background-color');
		});

		it('writes the body background on connect', async () => {
			el = await track('<nldd-shell></nldd-shell>');
			await waitForUpdate(el);
			expect(document.body.style.backgroundColor).not.toBe('');
		});

		it('clears the body background on disconnect when sole owner', async () => {
			el = await track('<nldd-shell></nldd-shell>');
			await waitForUpdate(el);
			cleanup(el);
			el = undefined as unknown as NLDDShell;
			expect(document.body.style.backgroundColor).toBe('');
		});

		it('does not erase a surviving instance when an older one disconnects', async () => {
			const first = await track('<nldd-shell></nldd-shell>');
			await waitForUpdate(first);
			const second = await track('<nldd-shell background="tinted"></nldd-shell>');
			await waitForUpdate(second);

			// `second` is the most recent writer; its background sits on body.
			const ownedBySecond = document.body.style.backgroundColor;
			expect(ownedBySecond).not.toBe('');

			// Disconnecting the older instance must not clear the surviving one's
			// background — that was the multi-instance regression.
			cleanup(first);
			expect(document.body.style.backgroundColor).toBe(ownedBySecond);

			// Then disconnecting the actual owner clears it.
			cleanup(second);
			expect(document.body.style.backgroundColor).toBe('');
		});
	});

	describe('overscroll-behavior on documentElement and body', () => {
		const instances: NLDDShell[] = [];
		async function track(html: string): Promise<NLDDShell> {
			const el = await fixture<NLDDShell>(html);
			instances.push(el);
			return el;
		}

		afterEach(() => {
			while (instances.length > 0) {
				const inst = instances.pop()!;
				if (inst.isConnected) cleanup(inst);
			}
			document.documentElement.style.removeProperty('overscroll-behavior');
			document.body.style.removeProperty('overscroll-behavior');
		});

		// The lock belongs to nested mode: there an nldd-page scrolls and the
		// document must not rubber-band along. A bare-page app scrolls the
		// document itself, so it keeps the native bounce — hence the split view
		// in these fixtures, sized to two columns.
		const NESTED_APP = `
			<nldd-shell>
				<nldd-navigation-split-view>
					<nldd-split-view-pane slot="primary-sidebar" has-content></nldd-split-view-pane>
					<nldd-split-view-pane slot="main" has-content></nldd-split-view-pane>
				</nldd-navigation-split-view>
			</nldd-shell>
		`;

		async function trackNested(): Promise<NLDDShell> {
			const app = await track(NESTED_APP);
			const nav = app.querySelector('nldd-navigation-split-view') as NLDDNavigationSplitView;
			vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ width: 1280 } as DOMRect);
			nav._updateLayout();
			await waitForUpdate(app);
			return app;
		}

		it('locks overscroll on connect and clears on last disconnect', async () => {
			el = await trackNested();
			expect(document.documentElement.style.overscrollBehavior).toBe('none');
			expect(document.body.style.overscrollBehavior).toBe('none');

			cleanup(el);
			el = undefined as unknown as NLDDShell;
			expect(document.documentElement.style.overscrollBehavior).toBe('');
			expect(document.body.style.overscrollBehavior).toBe('');
		});

		it('keeps the lock while another instance is still connected', async () => {
			const first = await trackNested();
			const second = await trackNested();

			cleanup(first);
			expect(document.body.style.overscrollBehavior).toBe('none');

			cleanup(second);
			expect(document.body.style.overscrollBehavior).toBe('');
		});
	});
});


/* ============================================================
   Derived scroll mode (Phase 3 — auto root/nested)
   ============================================================ */

describe('nldd-shell – derived scroll mode', () => {
	let el: NLDDShell;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	async function setNavWidth(nav: NLDDNavigationSplitView, width: number) {
		vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect);
		nav._updateLayout();
		await waitForUpdate(el);
	}

	it('derives root when its split view collapses to one column, nested when it expands', async () => {
		el = await fixture<NLDDShell>(`
			<nldd-shell>
				<nldd-navigation-split-view>
					<nldd-split-view-pane slot="primary-sidebar" has-content></nldd-split-view-pane>
					<nldd-split-view-pane slot="main" has-content></nldd-split-view-pane>
				</nldd-navigation-split-view>
			</nldd-shell>
		`);
		const nav = el.querySelector('nldd-navigation-split-view') as NLDDNavigationSplitView;

		await setNavWidth(nav, 320);   // sidebar + main can't fit → one column
		expect(el.style.getPropertyValue('--context-scroll-mode')).toBe('root');

		await setNavWidth(nav, 1280);  // both fit → multi-column
		expect(el.style.getPropertyValue('--context-scroll-mode')).toBe('nested');

		await setNavWidth(nav, 320);
		expect(el.style.getPropertyValue('--context-scroll-mode')).toBe('root');
	});

	it('re-derives when a split view is swapped in after the shell connected', async () => {
		// A consumer that renders its split view behind a condition (a loading
		// state, an error takeover, an empty state) leaves the shell with no
		// split view to derive from, and no split view means `root`. When the
		// split view comes back it measures itself, and on a wide viewport that
		// equals its own starting state — so without the first-measurement
		// announcement it stays silent and every pane keeps scrolling as one
		// document until you reload.
		el = await fixture<NLDDShell>(`
			<nldd-shell>
				<nldd-page></nldd-page>
			</nldd-shell>
		`);
		expect(el.style.getPropertyValue('--context-scroll-mode')).toBe('root');

		el.innerHTML = `
			<nldd-navigation-split-view>
				<nldd-split-view-pane slot="primary-sidebar" has-content></nldd-split-view-pane>
				<nldd-split-view-pane slot="main" has-content></nldd-split-view-pane>
			</nldd-navigation-split-view>
		`;
		const nav = el.querySelector('nldd-navigation-split-view') as NLDDNavigationSplitView;
		await setNavWidth(nav, 1280);

		expect(el.style.getPropertyValue('--context-scroll-mode')).toBe('nested');
	});

	it('falls back to root when the split view is taken away again', async () => {
		el = await fixture<NLDDShell>(`
			<nldd-shell>
				<nldd-navigation-split-view>
					<nldd-split-view-pane slot="primary-sidebar" has-content></nldd-split-view-pane>
					<nldd-split-view-pane slot="main" has-content></nldd-split-view-pane>
				</nldd-navigation-split-view>
			</nldd-shell>
		`);
		const nav = el.querySelector('nldd-navigation-split-view') as NLDDNavigationSplitView;
		await setNavWidth(nav, 1280);
		expect(el.style.getPropertyValue('--context-scroll-mode')).toBe('nested');

		el.innerHTML = '<nldd-page></nldd-page>';
		await waitForUpdate(el);

		expect(el.style.getPropertyValue('--context-scroll-mode')).toBe('root');
	});

	it('pushes the derived mode down to a nested nldd-page', async () => {
		el = await fixture<NLDDShell>(`
			<nldd-shell>
				<nldd-navigation-split-view>
					<nldd-split-view-pane slot="main" has-content>
						<nldd-page></nldd-page>
					</nldd-split-view-pane>
				</nldd-navigation-split-view>
			</nldd-shell>
		`);
		const nav = el.querySelector('nldd-navigation-split-view') as NLDDNavigationSplitView;
		const page = el.querySelector('nldd-page') as HTMLElement;

		await setNavWidth(nav, 320);   // full-stack → the whole app is one column
		expect(page.dataset.scroll).toBe('root');
	});

	it('propagates root through bar-split-view › nav-split-view › bar-split-view nesting', async () => {
		el = await fixture<NLDDShell>(`
			<nldd-shell>
				<nldd-bar-split-view>
					<nldd-split-view-pane slot="main">
						<nldd-navigation-split-view>
							<nldd-split-view-pane slot="main" has-content>
								<nldd-bar-split-view>
									<nldd-split-view-pane slot="main">
										<nldd-page></nldd-page>
									</nldd-split-view-pane>
								</nldd-bar-split-view>
							</nldd-split-view-pane>
						</nldd-navigation-split-view>
					</nldd-split-view-pane>
				</nldd-bar-split-view>
			</nldd-shell>
		`);
		const nav = el.querySelector('nldd-navigation-split-view') as NLDDNavigationSplitView;
		// [0] = outer bar-split-view, [1] = the one nested inside the nav pane.
		const innerBar = el.querySelectorAll('nldd-bar-split-view')[1] as HTMLElement;
		const page = el.querySelector('nldd-page') as HTMLElement;

		await setNavWidth(nav, 320);   // collapse the nav → the whole app is one column

		expect(el.style.getPropertyValue('--context-scroll-mode')).toBe('root');
		// The mode reaches every layer regardless of nesting depth: the outer bar,
		// the deeply-nested inner bar, and the page all flip to root.
		expect(innerBar.dataset.scroll).toBe('root');
		expect(page.dataset.scroll).toBe('root');
	});

	it('hands the current derived mode to a layer that registers after derivation (navigation re-mount)', async () => {
		el = await fixture<NLDDShell>(`
			<nldd-shell>
				<nldd-navigation-split-view>
					<nldd-split-view-pane slot="main" has-content></nldd-split-view-pane>
				</nldd-navigation-split-view>
			</nldd-shell>
		`);
		const nav = el.querySelector('nldd-navigation-split-view') as NLDDNavigationSplitView;
		await setNavWidth(nav, 320);   // shell derives root before the new layer exists
		expect(el.style.getPropertyValue('--context-scroll-mode')).toBe('root');

		// A layer registering now (e.g. a page re-mounted on navigation) must be
		// handed the current mode immediately — not left to self-read a var that
		// can be stale mid-remount (the Chrome-only "stuck nested" bug).
		const received: (string | undefined)[] = [];
		const shell = el as unknown as { registerScrollConsumer(c: { readScrollMode(m?: string): void }): void };
		shell.registerScrollConsumer({ readScrollMode: (m) => received.push(m) });
		expect(received).toEqual(['root']);
	});

	// An overlay scrolls itself and starts at its own top edge. A page inside one
	// must therefore keep its own scroller and its own zero, however the app
	// around it scrolls: in root mode it would otherwise stick its header against
	// the document, offset by an app bar that stands outside the overlay, and
	// paint it over the first field.
	it('keeps a page inside a sheet out of root mode, and resets the insets', async () => {
		el = await fixture<NLDDShell>(`
			<nldd-shell>
				<nldd-navigation-split-view>
					<nldd-split-view-pane slot="main" has-content style="--context-inset-top: 60px;">
						<nldd-page id="in-pane"></nldd-page>
						<nldd-sheet accessible-label="Edit">
							<nldd-page id="in-sheet" sticky-header></nldd-page>
						</nldd-sheet>
					</nldd-split-view-pane>
				</nldd-navigation-split-view>
			</nldd-shell>
		`);
		const nav = el.querySelector('nldd-navigation-split-view') as NLDDNavigationSplitView;
		const inPane = el.querySelector('#in-pane') as HTMLElement;
		const inSheet = el.querySelector('#in-sheet') as HTMLElement;

		await setNavWidth(nav, 320);   // full-stack → the app scrolls the document

		expect(inPane.dataset.scroll).toBe('root');
		expect(getComputedStyle(inPane).getPropertyValue('--context-inset-top').trim()).toBe('60px');

		// Nested is the default, so the page leaves [data-scroll] off rather than
		// writing it: what counts is that it never flips to root and keeps its own
		// scroller.
		expect(inSheet.dataset.scroll).not.toBe('root');
		expect((inSheet as unknown as { scrollTarget: HTMLElement }).scrollTarget)
			.toBe(inSheet.shadowRoot!.querySelector('.page__scroll'));
		expect(getComputedStyle(inSheet).getPropertyValue('--context-scroll-mode').trim()).toBe('nested');
		expect(getComputedStyle(inSheet).getPropertyValue('--context-inset-top').trim()).toBe('0px');
	});

	it('keeps a page inside a modal dialog out of root mode', async () => {
		el = await fixture<NLDDShell>(`
			<nldd-shell>
				<nldd-navigation-split-view>
					<nldd-split-view-pane slot="main" has-content>
						<nldd-modal-dialog accessible-label="Confirm">
							<nldd-page id="in-dialog" sticky-header></nldd-page>
						</nldd-modal-dialog>
					</nldd-split-view-pane>
				</nldd-navigation-split-view>
			</nldd-shell>
		`);
		const nav = el.querySelector('nldd-navigation-split-view') as NLDDNavigationSplitView;
		const inDialog = el.querySelector('#in-dialog') as HTMLElement;

		await setNavWidth(nav, 320);

		expect(inDialog.dataset.scroll).not.toBe('root');
		expect(getComputedStyle(inDialog).getPropertyValue('--context-scroll-mode').trim()).toBe('nested');
	});

	// A bare-page app is a single column at every width, so the document scrolls:
	// nested scrolling would cost the rubber-band and the collapsing browser
	// toolbar on iOS for nothing.
	it('scrolls the document for a bare-page app (no horizontal split view)', async () => {
		el = await fixture<NLDDShell>(`
			<nldd-shell>
				<nldd-page></nldd-page>
			</nldd-shell>
		`);
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--context-scroll-mode')).toBe('root');
		expect(el.querySelector('nldd-page')!.dataset.scroll).toBe('root');
	});
});
