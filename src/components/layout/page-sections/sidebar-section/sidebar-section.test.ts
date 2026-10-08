import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../../test-utils.js';
import './sidebar-section.js';
import '../../../status-and-feedback/inline-dialog/inline-dialog.js';
import type { NLDDSidebarSection } from './sidebar-section.js';
import { loadTokens } from '../../../../test-tokens.js';

describe('nldd-sidebar-section', () => {
	let el: NLDDSidebarSection;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const make = async (attrs = ''): Promise<NLDDSidebarSection> => {
		el = await fixture<NLDDSidebarSection>(`
			<nldd-sidebar-section ${attrs}>
				<p>Hoofdinhoud</p>
				<div slot="sidebar">Zijbalk-inhoud</div>
			</nldd-sidebar-section>
		`);
		await waitForUpdate(el);
		return el;
	};

	const raf = (): Promise<void> => new Promise(r => requestAnimationFrame(() => r()));

	// Drive the ResizeObserver by setting the host's own width, then wait for the
	// collapsed state to settle (collapses below 1008px, expands at/above).
	const setWidth = async (px: number, expectCollapsed = px < 1008): Promise<void> => {
		el.style.width = `${px}px`;
		for (let i = 0; i < 40 && el.collapsed !== expectCollapsed; i++) await raf();
		await el.updateComplete;
	};

	const dialog = () =>
		el.shadowRoot!.querySelector('.sidebar-section__sheet')!.shadowRoot!.querySelector('dialog');

	it('renders without error', async () => {
		await make();
		expect(el.shadowRoot).not.toBeNull();
	});

	// Same growth contract as simple-section: only the last (visible) section in
	// a page fills the leftover height, and the chain host -> main passes it on,
	// so an inline-dialog empty state can fill and center.
	it('grows as last section and passes the height down to the main column', async () => {
		el = await fixture<NLDDSidebarSection>(`
			<div style="display: flex; height: 600px; flex-direction: column;">
				<nldd-sidebar-section class="is-last">
					<nldd-inline-dialog text="Leeg"></nldd-inline-dialog>
				</nldd-sidebar-section>
			</div>
		`);
		const section = el.querySelector('nldd-sidebar-section') as NLDDSidebarSection;
		await waitForUpdate(section);
		expect(getComputedStyle(section).flexGrow).toBe('1');
		expect(Math.round(section.getBoundingClientRect().height)).toBe(600);
		const main = section.shadowRoot!.querySelector('.sidebar-section__main')!;
		const mainStyle = getComputedStyle(main);
		expect(mainStyle.display).toBe('flex');
		expect(mainStyle.flexDirection).toBe('column');
		// The empty-state dialog takes the leftover height inside the main.
		const dialogEl = section.querySelector('nldd-inline-dialog')!;
		expect(dialogEl.getBoundingClientRect().height).toBeGreaterThan(400);
	});

	it('does not grow when it is not the last section', async () => {
		el = await fixture<NLDDSidebarSection>('<nldd-sidebar-section><p>Kort</p></nldd-sidebar-section><footer>na</footer>');
		const section = (el.tagName.toLowerCase() === 'nldd-sidebar-section' ? el : el.querySelector('nldd-sidebar-section')) as NLDDSidebarSection;
		await waitForUpdate(section);
		expect(getComputedStyle(section).flexGrow).toBe('0');
	});

	it('renders the main slot content', async () => {
		await make();
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('.sidebar-section__main > slot:not([name])');
		expect(slot!.assignedElements().length).toBe(1);
	});

	it('not collapsed (lg): the sidebar is a sticky box and the sheet holds no slot', async () => {
		await make();
		await setWidth(1200);
		const box = el.shadowRoot!.querySelector<HTMLSlotElement>('.sidebar-section__sidebar-box > slot[name="sidebar"]');
		expect(box).not.toBeNull();
		expect(box!.assignedElements().length).toBe(1);
		expect(el.shadowRoot!.querySelector('.sidebar-section__sheet slot[name="sidebar"]')).toBeNull();
		expect(el.hasAttribute('collapsed')).toBe(false);
	});

	it('the box takes the surface of the section around it, edged by a divider line', async () => {
		const unloadTokens = loadTokens();
		await make('background="tinted"');
		await setWidth(1200, false);
		const box = el.shadowRoot!.querySelector('.sidebar-section__sidebar-box')!;
		const tinted = getComputedStyle(el).backgroundColor;
		expect(getComputedStyle(box).backgroundColor).toBe(tinted);
		el.background = 'base';
		await el.updateComplete;
		expect(getComputedStyle(box).backgroundColor).toBe(getComputedStyle(el).backgroundColor);
		expect(getComputedStyle(box).backgroundColor).not.toBe(tinted);
		const divider = document.createElement('div');
		divider.style.color = 'var(--semantics-dividers-color)';
		document.body.append(divider);
		expect(getComputedStyle(box).boxShadow).toContain(getComputedStyle(divider).color);
		divider.remove();
		unloadTokens();
	});

	it('the sticky box clears the layers above and below it, and caps its height on what is left', async () => {
		// What a page with a sticky header publishes: 60px of chrome above the
		// page plus its own 50px bar, and a 20px sticky footer below.
		el = await fixture<NLDDSidebarSection>(`
			<nldd-sidebar-section style="--primitives-space-24: 24px; --context-inset-top: 110px; --context-inset-bottom: 20px;">
				<p>Hoofdinhoud</p>
				<div slot="sidebar">Zijbalk-inhoud</div>
			</nldd-sidebar-section>
		`);
		await waitForUpdate(el);
		await setWidth(1200);
		const box = el.shadowRoot!.querySelector('.sidebar-section__sidebar-box') as HTMLElement;
		const styles = getComputedStyle(box);
		expect(styles.top).toBe('134px');
		expect(styles.bottom).toBe('44px');
		// Whatever the viewport has left between the two, so the whole sidebar is
		// reachable however far the page has scrolled.
		expect(Math.round(parseFloat(styles.maxHeight))).toBe(window.innerHeight - 134 - 44);
	});

	it('caps its height on the scroller it sticks in, not on the window', async () => {
		// What a page that owns its scroller publishes: the bars around it are
		// outside that box, so the height to cap on is the scroller's, not the
		// viewport's.
		el = await fixture<NLDDSidebarSection>(`
			<nldd-sidebar-section style="--primitives-space-24: 24px; --context-inset-top: 50px; --context-scroller-height: 700px;">
				<p>Hoofdinhoud</p>
				<div slot="sidebar">Zijbalk-inhoud</div>
			</nldd-sidebar-section>
		`);
		await waitForUpdate(el);
		await setWidth(1200);
		const box = el.shadowRoot!.querySelector('.sidebar-section__sidebar-box') as HTMLElement;
		const styles = getComputedStyle(box);
		expect(styles.top).toBe('74px');
		expect(Math.round(parseFloat(styles.maxHeight))).toBe(700 - 74 - 24);
	});

	it('collapsed (sm/md): the sidebar moves into the sheet and reflects [collapsed]', async () => {
		await make();
		await setWidth(500);
		expect(el.shadowRoot!.querySelector('.sidebar-section__sidebar-box')).toBeNull();
		expect(el.hasAttribute('collapsed')).toBe(true);
		const sheetSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('.sidebar-section__sheet slot[name="sidebar"]');
		expect(sheetSlot!.assignedElements().length).toBe(1);
	});

	it('collapsed: renders a default title bar with the sidebar-label and a Sluit button', async () => {
		await make();
		await setWidth(500);
		const bar = el.shadowRoot!.querySelector('nldd-top-title-bar');
		expect(bar).not.toBeNull();
		expect(bar!.getAttribute('text')).toBe('Zijbalk');
		expect(bar!.getAttribute('dismiss-text')).toBe('Sluit');
	});

	it('collapsed: the default title bar uses the overridden sidebar-label', async () => {
		await make('sidebar-label="Filters"');
		await setWidth(500);
		expect(el.shadowRoot!.querySelector('nldd-top-title-bar')!.getAttribute('text')).toBe('Filters');
	});

	it('not collapsed (lg): no sheet title bar is rendered', async () => {
		await make();
		await setWidth(1200);
		expect(el.shadowRoot!.querySelector('nldd-top-title-bar')).toBeNull();
	});

	it('the sheet-top-title-bar slot overrides the default title bar', async () => {
		el = await fixture<NLDDSidebarSection>(`
			<nldd-sidebar-section>
				<p>Hoofdinhoud</p>
				<div slot="sidebar">Zijbalk-inhoud</div>
				<div slot="sheet-top-title-bar" id="custom-bar">Eigen balk</div>
			</nldd-sidebar-section>
		`);
		await waitForUpdate(el);
		await setWidth(500);
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="sheet-top-title-bar"]');
		expect(slot).not.toBeNull();
		const assigned = slot!.assignedElements();
		expect(assigned.length).toBe(1);
		expect(assigned[0].id).toBe('custom-bar');
	});

	it('no-collapse: a narrow section stacks the sidebar instead of moving it to the sheet', async () => {
		await make('no-collapse');
		await setWidth(500, false);
		expect(el.collapsed).toBe(false);
		expect(el.shadowRoot!.querySelector('.sidebar-section__sidebar-box')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('nldd-top-title-bar')).toBeNull();
	});

	it('no-collapse toggled at runtime un-collapses a narrow section', async () => {
		await make();
		await setWidth(500);
		expect(el.collapsed).toBe(true);
		el.noCollapse = true;
		for (let i = 0; i < 20 && el.collapsed !== false; i++) await raf();
		expect(el.collapsed).toBe(false);
		expect(el.shadowRoot!.querySelector('.sidebar-section__sidebar-box')).not.toBeNull();
	});

	it('show() opens the sheet when collapsed', async () => {
		await make();
		await setWidth(500);
		el.show();
		await waitForUpdate(el);
		expect(dialog()!.open).toBe(true);
	});

	it('show() is a no-op on lg', async () => {
		await make();
		await setWidth(1200);
		el.show();
		await waitForUpdate(el);
		expect(dialog()!.open).toBe(false);
	});

	it('toggle() opens the sheet when collapsed', async () => {
		await make();
		await setWidth(500);
		el.toggle();
		await waitForUpdate(el);
		expect(dialog()!.open).toBe(true);
	});

	it('sidebar-label defaults to the i18n value', async () => {
		await make();
		await setWidth(1200);
		expect(el.shadowRoot!.querySelector('.sidebar-section__sidebar')!.getAttribute('aria-label')).toBe('Zijbalk');
	});

	it('sidebar-label is overridable', async () => {
		await make('sidebar-label="Filters"');
		await setWidth(1200);
		expect(el.shadowRoot!.querySelector('.sidebar-section__sidebar')!.getAttribute('aria-label')).toBe('Filters');
	});

	it('a CSS-length width feeds the body max-width', async () => {
		await make('width="200px"');
		expect(el.style.getPropertyValue('--_sidebar-section-max-width')).toBe('200px');
	});

	it('sticky-top / sticky-bottom feed the sticky insets', async () => {
		await make('sticky-top="80px" sticky-bottom="24px"');
		expect(el.style.getPropertyValue('--_sidebar-section-sticky-top')).toBe('80px');
		expect(el.style.getPropertyValue('--_sidebar-section-sticky-bottom')).toBe('24px');
	});
});
