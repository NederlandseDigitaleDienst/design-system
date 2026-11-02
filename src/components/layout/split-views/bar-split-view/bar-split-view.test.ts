import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../../test-utils.js';
import './bar-split-view.js';
import type { NLDDBarSplitView } from './bar-split-view.js';

// jsdom returns 0 for getBoundingClientRect().width, so the component always
// initializes at the 'sm' breakpoint in tests. Breakpoint-specific rendering
// (e.g. dividers on md/lg) is tested by setting _currentBreakpoint directly.
// The ResizeObserver must be disconnected first to prevent it from resetting
// the breakpoint back to 'sm' on the next observation cycle.

async function setBreakpoint(el: HTMLElement, bp: 'sm' | 'md' | 'lg') {
	(el as any)._resizeObserver?.disconnect();
	(el as NLDDBarSplitView)._currentBreakpoint = bp;
	await waitForUpdate(el);
}

describe('nldd-bar-split-view', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-bar-split-view></nldd-bar-split-view>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('always renders main pane', async () => {
		el = await fixture('<nldd-bar-split-view></nldd-bar-split-view>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.bar-split-view__main')).not.toBeNull();
	});

	it('renders no bar wrappers when no bar children are slotted', async () => {
		el = await fixture('<nldd-bar-split-view></nldd-bar-split-view>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelectorAll('.bar-split-view__bar').length).toBe(0);
	});

	it('renders a bar wrapper for each slotted bar child', async () => {
		el = await fixture(`
			<nldd-bar-split-view>
				<div slot="toolbar">Toolbar</div>
				<div slot="main">Main</div>
				<div slot="status">Status</div>
			</nldd-bar-split-view>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelectorAll('.bar-split-view__bar').length).toBe(2);
	});

	it('renders no dividers when no bars are present, even on md', async () => {
		el = await fixture('<nldd-bar-split-view><div slot="main">Main</div></nldd-bar-split-view>');
		await setBreakpoint(el, 'md');
		expect(el.shadowRoot!.querySelectorAll('.bar-split-view__divider').length).toBe(0);
	});

	it('sorts children by the active breakpoint order attribute', async () => {
		el = await fixture(`
			<nldd-bar-split-view>
				<div slot="toolbar" sm-order="2" md-order="1">Toolbar</div>
				<div slot="main"    sm-order="1" md-order="2">Main</div>
			</nldd-bar-split-view>
		`);
		await waitForUpdate(el);

		// On sm (jsdom default): main (sm-order=1) should be rendered before toolbar (sm-order=2)
		const slots = Array.from(el.shadowRoot!.querySelectorAll('slot'));
		const slotNames = slots.map(s => s.getAttribute('name'));
		expect(slotNames.indexOf('main')).toBeLessThan(slotNames.indexOf('toolbar'));
	});

	it('ignores children without a slot attribute', async () => {
		el = await fixture(`
			<nldd-bar-split-view>
				<div>No slot</div>
				<div slot="main">Main</div>
			</nldd-bar-split-view>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelectorAll('slot[name=""]').length).toBe(0);
	});
	it('falls back to DOM order when no order attributes are set', async () => {
		el = await fixture(`
			<nldd-bar-split-view>
				<div slot="toolbar">Toolbar</div>
				<div slot="main">Main</div>
				<div slot="status">Status</div>
			</nldd-bar-split-view>
		`);
		await waitForUpdate(el);

		const slots = Array.from(el.shadowRoot!.querySelectorAll('slot'));
		const slotNames = slots.map(s => s.getAttribute('name'));
		expect(slotNames).toEqual(['toolbar', 'main', 'status']);
	});

	it('hides a bar with only="md" on sm viewports', async () => {
		el = await fixture(`
			<nldd-bar-split-view>
				<div slot="toolbar" only="md">Toolbar</div>
				<div slot="main">Main</div>
			</nldd-bar-split-view>
		`);
		// jsdom width is 0 → sm breakpoint
		await waitForUpdate(el);
		const slots = Array.from(el.shadowRoot!.querySelectorAll('slot'));
		const slotNames = slots.map(s => s.getAttribute('name'));
		expect(slotNames).not.toContain('toolbar');
	});

	it('shows a bar with only="sm" on sm viewports', async () => {
		el = await fixture(`
			<nldd-bar-split-view>
				<div slot="toolbar" only="sm">Toolbar</div>
				<div slot="main">Main</div>
			</nldd-bar-split-view>
		`);
		await waitForUpdate(el);
		const slots = Array.from(el.shadowRoot!.querySelectorAll('slot'));
		const slotNames = slots.map(s => s.getAttribute('name'));
		expect(slotNames).toContain('toolbar');
	});

	it('hides a bar with above="md" on sm viewports', async () => {
		el = await fixture(`
			<nldd-bar-split-view>
				<div slot="toolbar" above="md">Toolbar</div>
				<div slot="main">Main</div>
			</nldd-bar-split-view>
		`);
		await waitForUpdate(el);
		const slots = Array.from(el.shadowRoot!.querySelectorAll('slot'));
		const slotNames = slots.map(s => s.getAttribute('name'));
		expect(slotNames).not.toContain('toolbar');
	});

	it('shows a bar with above="md" on md viewports', async () => {
		el = await fixture(`
			<nldd-bar-split-view>
				<div slot="toolbar" above="md">Toolbar</div>
				<div slot="main">Main</div>
			</nldd-bar-split-view>
		`);
		await setBreakpoint(el, 'md');
		const slots = Array.from(el.shadowRoot!.querySelectorAll('slot'));
		const slotNames = slots.map(s => s.getAttribute('name'));
		expect(slotNames).toContain('toolbar');
	});

	it('hides a bar with below="sm" on md viewports', async () => {
		el = await fixture(`
			<nldd-bar-split-view>
				<div slot="mobile-bar" below="sm">Mobile</div>
				<div slot="main">Main</div>
			</nldd-bar-split-view>
		`);
		await setBreakpoint(el, 'md');
		const slots = Array.from(el.shadowRoot!.querySelectorAll('slot'));
		const slotNames = slots.map(s => s.getAttribute('name'));
		expect(slotNames).not.toContain('mobile-bar');
	});

	it('shows a bar with below="sm" on sm viewports', async () => {
		el = await fixture(`
			<nldd-bar-split-view>
				<div slot="mobile-bar" below="sm">Mobile</div>
				<div slot="main">Main</div>
			</nldd-bar-split-view>
		`);
		await waitForUpdate(el);
		const slots = Array.from(el.shadowRoot!.querySelectorAll('slot'));
		const slotNames = slots.map(s => s.getAttribute('name'));
		expect(slotNames).toContain('mobile-bar');
	});

	describe('dividers — only where main meets an adjacent bar', () => {
		const dividerCount = (host: HTMLElement) =>
			host.shadowRoot!.querySelectorAll('.bar-split-view__divider').length;

		it('draws a divider between main and a single bar above it', async () => {
			el = await fixture(`
				<nldd-bar-split-view>
					<div slot="toolbar">Toolbar</div>
					<div slot="main">Main</div>
				</nldd-bar-split-view>
			`);
			await waitForUpdate(el);
			expect(dividerCount(el)).toBe(1);
		});

		it('draws a divider on both sides of main when bars sit above and below', async () => {
			el = await fixture(`
				<nldd-bar-split-view>
					<div slot="toolbar">Toolbar</div>
					<div slot="main">Main</div>
					<div slot="status">Status</div>
				</nldd-bar-split-view>
			`);
			await waitForUpdate(el);
			expect(dividerCount(el)).toBe(2);
		});

		it('never draws a divider between two stacked bars', async () => {
			el = await fixture(`
				<nldd-bar-split-view>
					<div slot="toolbar">Toolbar</div>
					<div slot="document-tabs">Tabs</div>
					<div slot="main">Main</div>
				</nldd-bar-split-view>
			`);
			await waitForUpdate(el);
			// toolbar↕tabs is a bar↕bar seam (no divider); only tabs↕main draws one.
			expect(dividerCount(el)).toBe(1);
		});

		it('groups multiple bars per side behind a single seam divider', async () => {
			el = await fixture(`
				<nldd-bar-split-view>
					<div slot="toolbar">Toolbar</div>
					<div slot="document-tabs">Tabs</div>
					<div slot="main">Main</div>
					<div slot="status">Status</div>
					<div slot="mobile-bar">Mobile</div>
				</nldd-bar-split-view>
			`);
			await waitForUpdate(el);
			// Above main: toolbar,tabs → one seam (tabs↕main). Below main:
			// status,mobile → one seam (main↕status). Bar↕bar seams: none.
			expect(dividerCount(el)).toBe(2);
		});

		it('places the divider directly adjacent to the main pane', async () => {
			el = await fixture(`
				<nldd-bar-split-view>
					<div slot="toolbar">Toolbar</div>
					<div slot="document-tabs">Tabs</div>
					<div slot="main">Main</div>
				</nldd-bar-split-view>
			`);
			await waitForUpdate(el);
			const wrapper = el.shadowRoot!.querySelector('.bar-split-view')!;
			const children = Array.from(wrapper.children);
			const dividerIndex = children.findIndex(c => c.classList.contains('bar-split-view__divider'));
			const mainIndex = children.findIndex(c => c.classList.contains('bar-split-view__main'));
			expect(dividerIndex).toBe(mainIndex - 1);
		});

		it('draws the same dividers on sm and md (breakpoint-independent)', async () => {
			el = await fixture(`
				<nldd-bar-split-view>
					<div slot="toolbar">Toolbar</div>
					<div slot="main">Main</div>
					<div slot="status">Status</div>
				</nldd-bar-split-view>
			`);
			await waitForUpdate(el); // jsdom width 0 → sm
			expect(dividerCount(el)).toBe(2);
			await setBreakpoint(el, 'md');
			expect(dividerCount(el)).toBe(2);
		});
	});
});


/* ============================================================
   Root-scroll mode — sticky bar insets (_updateInsets)
   ============================================================ */

describe('nldd-bar-split-view – root-scroll sticky insets', () => {
	let el: NLDDBarSplitView;

	afterEach(() => { if (el) cleanup(el); });

	// Drive the shared ScrollModeController into (or out of) root mode by writing
	// the inherited var it reads, then re-reading — which re-runs the onChange
	// (_updateInsets). In root mode the bars become stacked sticky bars.
	async function setRootScroll(host: NLDDBarSplitView, on: boolean) {
		host.style.setProperty('--context-scroll-mode', on ? 'root' : 'nested');
		(host as unknown as { _scrollMode: { read(): void } })._scrollMode.read();
		await waitForUpdate(host);
	}

	const blockChildren = (host: NLDDBarSplitView) =>
		Array.from(host.shadowRoot!.querySelector('.bar-split-view')!.children) as HTMLElement[];

	// Two top bars (40px + 30px) and one bottom bar (24px) around main, so the
	// stacking, direction and cumulative-height maths are all observable.
	async function fixtureBars() {
		const host = await fixture<NLDDBarSplitView>(`
			<nldd-bar-split-view>
				<div slot="toolbar" style="height: 40px">Toolbar</div>
				<div slot="tabs" style="height: 30px">Tabs</div>
				<div slot="main" style="height: 200px">Main</div>
				<div slot="status" style="height: 24px">Status</div>
			</nldd-bar-split-view>
		`);
		await waitForUpdate(host);
		return host;
	}

	it('leaves bar insets and layer vars unset in nested mode', async () => {
		el = await fixtureBars();
		const main = el.shadowRoot!.querySelector<HTMLElement>('.bar-split-view__main')!;
		for (const bar of el.shadowRoot!.querySelectorAll<HTMLElement>('.bar-split-view__bar')) {
			expect(bar.style.top).toBe('');
			expect(bar.style.bottom).toBe('');
		}
		expect(main.style.getPropertyValue('--context-inset-top')).toBe('');
		expect(main.style.getPropertyValue('--context-inset-bottom')).toBe('');
	});

	it('stacks top bars from the top and bottom bars from the bottom in root mode', async () => {
		el = await fixtureBars();
		await setRootScroll(el, true);
		expect(el.dataset.scroll).toBe('root'); // precondition: mode actually flipped

		const topBars = el.shadowRoot!.querySelectorAll<HTMLElement>('.bar-split-view__bar--top');
		const bottomBar = el.shadowRoot!.querySelector<HTMLElement>('.bar-split-view__bar--bottom')!;

		// First top bar sticks at the inherited base (0); the second stacks below it.
		expect(topBars[0].style.top).toBe('0px');
		expect(topBars[0].style.bottom).toBe('');
		expect(topBars[1].style.top).toBe(`${topBars[0].offsetHeight}px`);

		// Bottom bar sticks at the bottom base (0), with its top inset cleared.
		expect(bottomBar.style.bottom).toBe('0px');
		expect(bottomBar.style.top).toBe('');
	});

	it('publishes the cumulative layer heights as --context-inset-top/bottom on main', async () => {
		el = await fixtureBars();
		await setRootScroll(el, true);

		const children = blockChildren(el);
		const main = el.shadowRoot!.querySelector<HTMLElement>('.bar-split-view__main')!;
		const mainIndex = children.indexOf(main);
		// Everything above/below main (bars AND the seam dividers) contributes.
		const expectedTop = children.slice(0, mainIndex).reduce((sum, c) => sum + c.offsetHeight, 0);
		const expectedBottom = children.slice(mainIndex + 1).reduce((sum, c) => sum + c.offsetHeight, 0);

		expect(expectedTop).toBeGreaterThan(0);
		expect(expectedBottom).toBeGreaterThan(0);
		expect(main.style.getPropertyValue('--context-inset-top')).toBe(`${expectedTop}px`);
		expect(main.style.getPropertyValue('--context-inset-bottom')).toBe(`${expectedBottom}px`);
	});

	it('offsets the first bars by the inherited base layer heights (nested bars compose)', async () => {
		el = await fixtureBars();
		el.style.setProperty('--context-inset-top', '100px');
		el.style.setProperty('--context-inset-bottom', '50px');
		await setRootScroll(el, true);

		const topBar = el.shadowRoot!.querySelector<HTMLElement>('.bar-split-view__bar--top')!;
		const bottomBar = el.shadowRoot!.querySelector<HTMLElement>('.bar-split-view__bar--bottom')!;
		expect(topBar.style.top).toBe('100px');
		expect(bottomBar.style.bottom).toBe('50px');
	});

	it('clears the insets and layer vars again when leaving root mode', async () => {
		el = await fixtureBars();
		await setRootScroll(el, true);
		await setRootScroll(el, false);

		const main = el.shadowRoot!.querySelector<HTMLElement>('.bar-split-view__main')!;
		for (const bar of el.shadowRoot!.querySelectorAll<HTMLElement>('.bar-split-view__bar')) {
			expect(bar.style.top).toBe('');
			expect(bar.style.bottom).toBe('');
		}
		expect(main.style.getPropertyValue('--context-inset-top')).toBe('');
		expect(main.style.getPropertyValue('--context-inset-bottom')).toBe('');
	});
});
