import { describe, it, expect, afterEach, vi } from 'vitest';
import { page } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate } from '../../../../test-utils.js';
import type { NLDDNavigationSplitView } from './navigation-split-view.js';
import './navigation-split-view.js';
import '../split-view-pane/split-view-pane.js';

async function setWidth(el: NLDDNavigationSplitView, width: number) {
	vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect);
	el._updateLayout();
	await waitForUpdate(el);
}

// All four panes slotted
async function fixtureAllPanes(width = 1280) {
	const el = await fixture<NLDDNavigationSplitView>(`
		<nldd-navigation-split-view>
			<nldd-split-view-pane slot="primary-sidebar"></nldd-split-view-pane>
			<nldd-split-view-pane slot="secondary-sidebar"></nldd-split-view-pane>
			<nldd-split-view-pane slot="main" has-content></nldd-split-view-pane>
			<nldd-split-view-pane slot="inspector"></nldd-split-view-pane>
		</nldd-navigation-split-view>
	`);
	await setWidth(el, width);
	return el;
}


/* ============================================================
   Smoke tests
   ============================================================ */

describe('nldd-navigation-split-view', () => {
	let el: NLDDNavigationSplitView;

	afterEach(() => { cleanup(el); vi.restoreAllMocks(); });

	it('renders without error', async () => {
		el = await fixture('<nldd-navigation-split-view></nldd-navigation-split-view>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults inspector-auto-hidden to false', async () => {
		el = await fixture('<nldd-navigation-split-view></nldd-navigation-split-view>');
		await waitForUpdate(el);
		expect(el.inspectorAutoHidden).toBe(false);
	});
});


/* ============================================================
   Primary sidebar — deprecated 'sidebar' slot alias
   ============================================================ */

/* ============================================================
   Inspector sheet
   ============================================================ */

describe('nldd-navigation-split-view – inspector sheet', () => {
	let el: NLDDNavigationSplitView;

	afterEach(() => { cleanup(el); vi.restoreAllMocks(); });

	it('sets inspector-auto-hidden when inspector does not fit', async () => {
		el = await fixtureAllPanes(640);
		expect(el.inspectorAutoHidden).toBe(true);
	});

	it('renders inspector dialog when inspector-auto-hidden', async () => {
		el = await fixtureAllPanes(640);
		expect(el.shadowRoot!.querySelector('.navigation-split-view__inspector-sheet')).not.toBeNull();
	});

	it('showInspectorSheet() opens the dialog', async () => {
		el = await fixtureAllPanes(640);
		await el.showInspectorSheet();
		const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>('.navigation-split-view__inspector-sheet')!;
		expect(dialog.open).toBe(true);
	});

	it('hideInspectorSheet() adds is-closing class', async () => {
		el = await fixtureAllPanes(640);
		await el.showInspectorSheet();
		el.hideInspectorSheet();
		const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>('.navigation-split-view__inspector-sheet')!;
		expect(dialog.classList.contains('is-closing')).toBe(true);
	});

	it('does not set inspector-auto-hidden when no inspector slotted', async () => {
		el = await fixture<NLDDNavigationSplitView>(`
			<nldd-navigation-split-view>
				<nldd-split-view-pane slot="main" has-content></nldd-split-view-pane>
			</nldd-navigation-split-view>
		`);
		await setWidth(el, 1280);
		expect(el.inspectorAutoHidden).toBe(false);
	});
});


/* ============================================================
   Single column + seam dividers
   ============================================================ */

describe('nldd-navigation-split-view – single column', () => {
	let el: NLDDNavigationSplitView;

	afterEach(() => { cleanup(el); vi.restoreAllMocks(); });

	it('reports isSingleColumn only when collapsed to full-stack', async () => {
		el = await fixtureAllPanes(1280);
		expect(el.isSingleColumn).toBe(false);
		await setWidth(el, 320);
		expect(el.isSingleColumn).toBe(true);
	});

	it('dispatches a bubbling single-column-change event when the column count flips', async () => {
		el = await fixtureAllPanes(1280);
		const seen: boolean[] = [];
		el.addEventListener('nldd-single-column-change', (e) => {
			seen.push((e as CustomEvent<{ singleColumn: boolean }>).detail.singleColumn);
		});
		await setWidth(el, 320);   // → full-stack
		await setWidth(el, 1280);  // → spatial
		expect(seen).toEqual([true, false]);
	});

	it('renders no seam divider when only one pane is visible (full-stack)', async () => {
		el = await fixture<NLDDNavigationSplitView>(`
			<nldd-navigation-split-view>
				<nldd-split-view-pane slot="primary-sidebar" has-content></nldd-split-view-pane>
				<nldd-split-view-pane slot="main"></nldd-split-view-pane>
			</nldd-navigation-split-view>
		`);
		await setWidth(el, 320);
		expect(el.classList.contains('full-stack')).toBe(true);
		expect(el.shadowRoot!.querySelectorAll('nldd-split-view-divider').length).toBe(0);
	});

	it('renders a seam divider between two visible panes', async () => {
		el = await fixture<NLDDNavigationSplitView>(`
			<nldd-navigation-split-view>
				<nldd-split-view-pane slot="primary-sidebar" has-content></nldd-split-view-pane>
				<nldd-split-view-pane slot="main" has-content></nldd-split-view-pane>
			</nldd-navigation-split-view>
		`);
		await setWidth(el, 1280);
		expect(el.shadowRoot!.querySelectorAll('nldd-split-view-divider').length).toBe(1);
	});
});


/* ============================================================
   Sheet height at sm
   ============================================================ */

// A bottom sheet is content-sized, and the slotted pane's `flex-basis: 0` used
// to fix that content height at 0: the dialog opened as a bare backdrop while
// its content stayed focusable. Only below 641px, because md/lg give the sheet
// a definite height. Needs a real viewport, since the breakpoint is a media
// query and setWidth() only mocks the element's own box.
describe('nldd-navigation-split-view – sheet height at sm', () => {
	let el: NLDDNavigationSplitView;

	afterEach(async () => {
		cleanup(el);
		vi.restoreAllMocks();
		await page.viewport(1280, 800);
	});

	// variables.css is not loaded in the test environment, so the sheet's
	// max-height calc() would be invalid and resolve to none. Supply just the
	// one token it needs, so the cap is real here too.
	const INSET = 'style="--semantics-sheets-bottom-top-inset: 48px"';

	async function fixtureSheet(attr: string, slot: string) {
		await page.viewport(390, 800);
		const el = await fixture<NLDDNavigationSplitView>(`
			<nldd-navigation-split-view ${attr} ${INSET}>
				<nldd-split-view-pane slot="${slot}" has-content>
					<div style="height: 200px"></div>
				</nldd-split-view-pane>
				<nldd-split-view-pane slot="main" has-content></nldd-split-view-pane>
			</nldd-navigation-split-view>
		`);
		await waitForUpdate(el);
		return el;
	}

	it('opens the sidebar sheet at its content height, not zero', async () => {
		el = await fixtureSheet('primary-sidebar-as-sheet', 'primary-sidebar');
		await el.showPrimarySidebarSheet();
		const sheet = el.shadowRoot!.querySelector('.navigation-split-view__primary-sidebar-sheet')!;
		expect(sheet.getBoundingClientRect().height).toBeGreaterThanOrEqual(200);
	});

	it('opens the inspector sheet at its content height, not zero', async () => {
		el = await fixtureSheet('inspector-as-sheet', 'inspector');
		await el.showInspectorSheet();
		const sheet = el.shadowRoot!.querySelector('.navigation-split-view__inspector-sheet')!;
		expect(sheet.getBoundingClientRect().height).toBeGreaterThanOrEqual(200);
	});

	it('caps a sheet taller than the viewport at its max-height', async () => {
		await page.viewport(390, 800);
		el = await fixture<NLDDNavigationSplitView>(`
			<nldd-navigation-split-view primary-sidebar-as-sheet ${INSET}>
				<nldd-split-view-pane slot="primary-sidebar" has-content>
					<div style="height: 4000px"></div>
				</nldd-split-view-pane>
				<nldd-split-view-pane slot="main" has-content></nldd-split-view-pane>
			</nldd-navigation-split-view>
		`);
		await waitForUpdate(el);
		await el.showPrimarySidebarSheet();
		const sheet = el.shadowRoot!.querySelector('.navigation-split-view__primary-sidebar-sheet')!;
		expect(sheet.getBoundingClientRect().height).toBeLessThan(800);
	});
});
