import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, nextFrames } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import './page.js';
import '../sheet/sheet.js';
import '../../navigation/top-title-bar/top-title-bar.js';
import '../split-views/side-by-side-split-view/side-by-side-split-view.js';
import '../split-views/bar-split-view/bar-split-view.js';

describe('nldd-page', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-page></nldd-page>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('reflects sticky-header attribute', async () => {
		el = await fixture('<nldd-page sticky-header></nldd-page>');
		await waitForUpdate(el);
		expect(el.hasAttribute('sticky-header')).toBe(true);
	});

	it('reflects sticky-footer attribute', async () => {
		el = await fixture('<nldd-page sticky-footer></nldd-page>');
		await waitForUpdate(el);
		expect(el.hasAttribute('sticky-footer')).toBe(true);
	});

	it('reflects tinted attribute', async () => {
		el = await fixture('<nldd-page background="tinted"></nldd-page>');
		await waitForUpdate(el);
		expect(el.getAttribute('background')).toBe('tinted');
	});

	it('renders a page__scroll wrapper', async () => {
		el = await fixture('<nldd-page></nldd-page>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.page__scroll')).not.toBeNull();
	});

	it('pads the scroll wrapper by the header height when sticky-header is set', async () => {
		el = await fixture('<nldd-page sticky-header><div slot="header" style="height: 48px;">Header</div></nldd-page>');
		await waitForUpdate(el);
		// ResizeObserver fires asynchronously — wait for it to settle
		await new Promise(r => setTimeout(r, 100));
		const scroll = el.shadowRoot!.querySelector('.page__scroll') as HTMLElement;
		expect(getComputedStyle(scroll).paddingTop).toBe('48px');
	});

	it('holds the padding at the header height it had at scroll top, so a collapsing bar cannot drag the content up', async () => {
		el = await fixture(`
			<nldd-page sticky-header style="height: 200px;">
				<div slot="header" id="header" style="height: 60px;">Header</div>
				<div style="height: 900px;">Content</div>
			</nldd-page>
		`);
		await waitForUpdate(el);
		await new Promise(r => setTimeout(r, 100));
		const scroll = el.shadowRoot!.querySelector('.page__scroll') as HTMLElement;
		expect(getComputedStyle(scroll).paddingTop).toBe('60px');

		scroll.scrollTop = 200;
		el.querySelector<HTMLElement>('#header')!.style.height = '30px';
		await nextFrames();
		await nextFrames();

		expect(getComputedStyle(scroll).paddingTop).toBe('60px');
	});

	it('lets the insets follow a collapsing header down while the reserved space stays put', async () => {
		el = await fixture(`
			<nldd-page sticky-header style="height: 200px;">
				<div slot="header" id="header" style="height: 60px;">Header</div>
				<div id="probe" style="position: sticky; top: var(--context-inset-top, 0px);">Probe</div>
				<div style="height: 900px;">Content</div>
			</nldd-page>
		`);
		await waitForUpdate(el);
		await new Promise(r => setTimeout(r, 100));
		const scroll = el.shadowRoot!.querySelector('.page__scroll') as HTMLElement;
		const probeTop = () => getComputedStyle(el.querySelector('#probe')!).top;
		expect(probeTop()).toBe('60px');

		scroll.scrollTop = 200;
		el.querySelector<HTMLElement>('#header')!.style.height = '30px';
		await nextFrames();
		await nextFrames();

		// The two measurements part company here, which is the whole reason there
		// are two. The bar is 30px now, so that is what sticky content has to
		// clear, while the padding keeps the space the content started under.
		expect(probeTop()).toBe('30px');
		expect(getComputedStyle(scroll).paddingTop).toBe('60px');
	});

	it('does not run its observer into an undelivered-notification loop', async () => {
		const errors: string[] = [];
		const onError = (event: ErrorEvent) => {
			if (!event.message.includes('ResizeObserver')) return;
			errors.push(event.message);
			event.preventDefault();
		};
		window.addEventListener('error', onError);
		try {
			el = await fixture(`
				<nldd-page sticky-header sticky-footer style="height: 300px;">
					<div slot="header" style="height: 48px;">Header</div>
					<div style="height: 900px;">Content</div>
					<div slot="footer" style="height: 32px;">Footer</div>
				</nldd-page>
			`);
			await waitForUpdate(el);
			await nextFrames();
			await nextFrames();
			await nextFrames();
		} finally {
			window.removeEventListener('error', onError);
		}
		expect(errors).toEqual([]);
	});

	describe('layer heights for sticky content', () => {
		/* A custom property hands on its calc() untouched, so the value only
		   resolves where it lands. This probe is what a consumer writes anyway:
		   something sticky inside the page, clearing whatever is above it. */
		const stickyProbe = '<div id="probe" style="position: sticky; top: var(--context-inset-top, 0px); bottom: var(--context-inset-bottom, 0px);">Probe</div>';
		const probeTop = (el: HTMLElement) =>
			getComputedStyle(el.querySelector('#probe')!).top;
		const probeBottom = (el: HTMLElement) =>
			getComputedStyle(el.querySelector('#probe')!).bottom;

		it('adds its own sticky header to the layers above, so content inside can clear it', async () => {
			el = await fixture(`
				<nldd-page sticky-header style="--context-scroll-mode: root; --context-inset-top: 60px;">
					<div slot="header" style="height: 50px;">Header</div>
					${stickyProbe}
				</nldd-page>
			`);
			await waitForUpdate(el);
			await new Promise(r => setTimeout(r, 100));
			expect(probeTop(el)).toBe('110px');
		});

		it('counts only its own header while it owns the scroller, since the bars above sit outside it', async () => {
			el = await fixture(`
				<nldd-page sticky-header style="--context-inset-top: 60px;">
					<div slot="header" style="height: 50px;">Header</div>
					${stickyProbe}
				</nldd-page>
			`);
			await waitForUpdate(el);
			await new Promise(r => setTimeout(r, 100));
			expect(probeTop(el)).toBe('50px');
		});

		it('adds nothing for a header that is not sticky: it scrolls away and leaves no layer', async () => {
			el = await fixture(`
				<nldd-page style="--context-scroll-mode: root; --context-inset-top: 60px;">
					<div slot="header" style="height: 50px;">Header</div>
					${stickyProbe}
				</nldd-page>
			`);
			await waitForUpdate(el);
			await new Promise(r => setTimeout(r, 100));
			expect(probeTop(el)).toBe('60px');
		});

		it('publishes a sticky footer the same way', async () => {
			el = await fixture(`
				<nldd-page sticky-footer style="--context-scroll-mode: root; --context-inset-bottom: 20px;">
					<div slot="footer" style="height: 40px;">Footer</div>
					${stickyProbe}
				</nldd-page>
			`);
			await waitForUpdate(el);
			await new Promise(r => setTimeout(r, 100));
			expect(probeBottom(el)).toBe('60px');
		});

		it('sticks its own footer to the inset it came in with, not above itself', async () => {
			el = await fixture(`
				<nldd-page sticky-footer style="--context-scroll-mode: root; --context-inset-bottom: 20px;">
					<div slot="footer" style="height: 40px;">Footer</div>
				</nldd-page>
			`);
			await waitForUpdate(el);
			await new Promise(r => setTimeout(r, 100));
			const footer = el.shadowRoot!.querySelector('.page__footer') as HTMLElement;
			expect(getComputedStyle(footer).bottom).toBe('20px');
		});
	});

	describe('scroll height for sticky content', () => {
		const probe = '<div id="probe" style="max-height: var(--context-scroller-height, 100dvh);">Probe</div>';

		it('publishes the scroller height while the page owns the scroller', async () => {
			el = await fixture(`
				<nldd-page sticky-header style="height: 400px;">
					<div slot="header" style="height: 50px;">Header</div>
					${probe}
				</nldd-page>
			`);
			await waitForUpdate(el);
			await new Promise(r => setTimeout(r, 100));
			const scroll = el.shadowRoot!.querySelector('.page__scroll') as HTMLElement;
			expect(getComputedStyle(el.querySelector('#probe')!).maxHeight).toBe(
				`${scroll.clientHeight}px`,
			);
		});

		it('leaves it to the viewport in root mode, where the document scrolls', async () => {
			el = await fixture(`
				<nldd-page sticky-header style="--context-scroll-mode: root;">
					<div slot="header" style="height: 50px;">Header</div>
					${probe}
				</nldd-page>
			`);
			await waitForUpdate(el);
			await new Promise(r => setTimeout(r, 100));
			expect(Math.round(parseFloat(getComputedStyle(el.querySelector('#probe')!).maxHeight)))
				.toBe(window.innerHeight);
		});
	});

	describe('root scroll mode', () => {
		it('reflects --context-scroll-mode: root to [data-scroll] and targets the document scroller', async () => {
			el = await fixture('<nldd-page sticky-header style="--context-scroll-mode: root;"></nldd-page>');
			await waitForUpdate(el);
			expect(el.dataset.scroll).toBe('root');
			const page = el as unknown as { scrollTarget: HTMLElement };
			expect(page.scrollTarget).toBe(document.scrollingElement);
		});

		it('exposes window as the scrollEventTarget in root mode (viewport scroll fires there, not on document.scrollingElement)', async () => {
			el = await fixture('<nldd-page sticky-header style="--context-scroll-mode: root;"></nldd-page>');
			await waitForUpdate(el);
			const page = el as unknown as { scrollEventTarget: EventTarget };
			expect(page.scrollEventTarget).toBe(window);
		});

		it('exposes the inner scroll wrapper as the scrollEventTarget in nested mode', async () => {
			el = await fixture('<nldd-page sticky-header></nldd-page>');
			await waitForUpdate(el);
			const page = el as unknown as { scrollEventTarget: EventTarget };
			expect(page.scrollEventTarget).toBe(el.shadowRoot!.querySelector('.page__scroll'));
		});

		it('defaults to nested (no --context-scroll-mode): scrollTarget is the inner wrapper', async () => {
			el = await fixture('<nldd-page sticky-header></nldd-page>');
			await waitForUpdate(el);
			expect(el.dataset.scroll).not.toBe('root');
			const page = el as unknown as { scrollTarget: HTMLElement };
			expect(page.scrollTarget).toBe(el.shadowRoot!.querySelector('.page__scroll'));
		});

		it('does not pad the scroll wrapper in root mode (the sticky header sits in flow)', async () => {
			el = await fixture('<nldd-page sticky-header style="--context-scroll-mode: root;"><div slot="header" style="height:48px;">H</div></nldd-page>');
			await waitForUpdate(el);
			await new Promise(r => setTimeout(r, 100));
			const scroll = el.shadowRoot!.querySelector('.page__scroll') as HTMLElement;
			expect(getComputedStyle(scroll).paddingTop).toBe('0px');
		});
	});

	describe('data-growing main slot marker', () => {
		const growing = () => [...el.querySelectorAll('[data-growing]')].map((child) => child.id);

		it('marks the last visible main child when none has grow', async () => {
			el = await fixture(`
				<nldd-page>
					<div id="a">A</div>
					<div id="b">B</div>
					<div id="c">C</div>
				</nldd-page>
			`);
			await waitForUpdate(el);
			expect(growing()).toEqual(['c']);
		});

		it('skips hidden children when picking the last', async () => {
			el = await fixture(`
				<nldd-page>
					<div id="a">A</div>
					<div id="b">B</div>
					<div id="c" hidden>C</div>
				</nldd-page>
			`);
			await waitForUpdate(el);
			expect(growing()).toEqual(['b']);
		});

		it('ignores siblings in named slots', async () => {
			el = await fixture(`
				<nldd-page>
					<div id="a">A</div>
					<div id="b">B</div>
					<div id="footer" slot="footer">Footer</div>
				</nldd-page>
			`);
			await waitForUpdate(el);
			expect(growing()).toEqual(['b']);
		});

		it('marks the children with grow instead of the last, and never writes grow', async () => {
			el = await fixture(`
				<nldd-page>
					<div id="a">A</div>
					<div id="b" grow>B</div>
					<div id="c">C</div>
				</nldd-page>
			`);
			await waitForUpdate(el);
			expect(growing()).toEqual(['b']);
			expect(el.querySelector('#c')!.hasAttribute('grow')).toBe(false);
		});

		it('follows a grow or hidden that changes after slotting', async () => {
			el = await fixture(`
				<nldd-page>
					<div id="a">A</div>
					<div id="b">B</div>
				</nldd-page>
			`);
			await waitForUpdate(el);
			el.querySelector('#a')!.setAttribute('grow', '');
			await expect.poll(growing).toEqual(['a']);
			el.querySelector('#a')!.removeAttribute('grow');
			el.querySelector('#b')!.setAttribute('hidden', '');
			await expect.poll(growing).toEqual(['a']);
		});
	});


	/* ============================================================
	   Landmarks
	   ============================================================ */

	describe('landmarks', () => {
		const tags = (page: HTMLElement) => ({
			outer: page.shadowRoot!.querySelector('.page')!.localName,
			body: page.shadowRoot!.querySelector('.page__main')!.localName,
		});

		it('is the page on its own: header, main and footer carry the document landmarks', async () => {
			el = await fixture('<nldd-page></nldd-page>');
			await waitForUpdate(el);
			expect(tags(el)).toEqual({ outer: 'div', body: 'main' });
			expect(el.shadowRoot!.querySelector('header.page__header')).not.toBeNull();
			expect(el.shadowRoot!.querySelector('footer.page__footer')).not.toBeNull();
		});

		it('keeps measuring its header after a switch to region, which renders new chrome', async () => {
			el = await fixture(`
				<nldd-page sticky-header style="height: 300px;">
					<div slot="header" style="height: 40px;">Header</div>
					<div style="height: 2000px;"></div>
				</nldd-page>
			`);
			await waitForUpdate(el);
			await nextFrames();
			el.setAttribute('landmarks', 'region');
			await waitForUpdate(el);
			expect(tags(el).outer).toBe('section');
			el.querySelector<HTMLElement>('[slot="header"]')!.style.height = '90px';
			await nextFrames();
			await nextFrames();
			expect(el.style.getPropertyValue('--_page-header-height')).toBe('90px');
		});

		it('is a region in a pane, so the second page does not claim the document', async () => {
			el = await fixture(`
				<nldd-side-by-side-split-view panes="2">
					<nldd-page slot="pane-1" id="een"></nldd-page>
					<nldd-page slot="pane-2" id="twee"></nldd-page>
				</nldd-side-by-side-split-view>
			`);
			for (const page of el.querySelectorAll('nldd-page')) await waitForUpdate(page as HTMLElement);
			for (const page of el.querySelectorAll('nldd-page')) {
				expect(tags(page as HTMLElement)).toEqual({ outer: 'section', body: 'div' });
			}
		});

		it('keeps the page in the main slot of a bar split view, which places no page beside it', async () => {
			el = await fixture(`
				<nldd-bar-split-view>
					<nldd-page slot="main"></nldd-page>
				</nldd-bar-split-view>
			`);
			const page = el.querySelector('nldd-page') as HTMLElement;
			await waitForUpdate(page);
			expect(tags(page)).toEqual({ outer: 'div', body: 'main' });
		});

		it('is a region inside an overlay, which is not the document', async () => {
			el = await fixture('<nldd-sheet><nldd-page></nldd-page></nldd-sheet>');
			const page = el.querySelector('nldd-page') as HTMLElement;
			await waitForUpdate(page);
			expect(tags(page)).toEqual({ outer: 'section', body: 'div' });
		});

		it('lets landmarks="page" promote the pane that holds the primary content', async () => {
			el = await fixture(`
				<nldd-side-by-side-split-view panes="2">
					<nldd-page slot="pane-1" landmarks="page"></nldd-page>
					<nldd-page slot="pane-2"></nldd-page>
				</nldd-side-by-side-split-view>
			`);
			const [een, twee] = [...el.querySelectorAll('nldd-page')] as HTMLElement[];
			await waitForUpdate(een);
			await waitForUpdate(twee);
			expect(tags(een)).toEqual({ outer: 'div', body: 'main' });
			expect(tags(twee)).toEqual({ outer: 'section', body: 'div' });
		});

		it('lets landmarks="region" step down outside a pane', async () => {
			el = await fixture('<nldd-page landmarks="region"></nldd-page>');
			await waitForUpdate(el);
			expect(tags(el)).toEqual({ outer: 'section', body: 'div' });
		});

		it('names the region with accessible-label, and the main when it is the page', async () => {
			el = await fixture('<nldd-page landmarks="region" accessible-label="Dossier 2024-001"></nldd-page>');
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.page')!.getAttribute('aria-label')).toBe('Dossier 2024-001');
			expect(el.shadowRoot!.querySelector('.page__main')!.hasAttribute('aria-label')).toBe(false);
			cleanup(el);

			el = await fixture('<nldd-page accessible-label="Dossiers"></nldd-page>');
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.page__main')!.getAttribute('aria-label')).toBe('Dossiers');
			expect(el.shadowRoot!.querySelector('.page')!.hasAttribute('aria-label')).toBe(false);
		});

		it('leaves an unnamed region without a landmark rather than an unnamed one', async () => {
			el = await fixture('<nldd-page landmarks="region"></nldd-page>');
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.page')!.hasAttribute('aria-label')).toBe(false);
		});

		it('states a second page that renders a main, hidden or not', async () => {
			el = await fixture(`
				<div>
					<nldd-page></nldd-page>
					<nldd-page hidden></nldd-page>
				</div>
			`);
			for (const page of el.querySelectorAll('nldd-page')) await waitForUpdate(page as HTMLElement);
			expect([...el.querySelectorAll('nldd-page')].map((page) => page.matches(':state(second-main)'))).toEqual([false, true]);
		});

		it('is no second main when the other pages are regions', async () => {
			el = await fixture(`
				<nldd-side-by-side-split-view panes="2">
					<nldd-page slot="pane-1" landmarks="page"></nldd-page>
					<nldd-page slot="pane-2"></nldd-page>
				</nldd-side-by-side-split-view>
			`);
			for (const page of el.querySelectorAll('nldd-page')) await waitForUpdate(page as HTMLElement);
			expect(el.querySelector('nldd-page:state(second-main)')).toBeNull();
		});
	});

});

describe('nldd-page – sticky bars and focus', () => {
	let wrapper: HTMLElement;
	let unloadTokens: () => void;

	afterEach(() => {
		if (wrapper) cleanup(wrapper);
		unloadTokens?.();
	});

	const page = async () => {
		unloadTokens = loadTokens();
		wrapper = await fixture(`
			<div style="height: 400px; display: flex">
				<nldd-page sticky-header sticky-footer data-scroll="nested">
					<div slot="header" style="height: 56px">Kop</div>
					${Array.from({ length: 30 }, (_, i) => `<button style="display: block; height: 32px">Optie ${i}</button>`).join('')}
					<div slot="footer" style="height: 64px"><button>Toepassen</button></div>
				</nldd-page>
			</div>
		`);
		const el = wrapper.querySelector('nldd-page') as HTMLElement & { updateComplete: Promise<boolean> };
		await el.updateComplete;
		await nextFrames();
		await nextFrames();
		return el;
	};

	it('scrolls a focused element clear of the footer and of the header', async () => {
		const el = await page();
		const buttons = [...el.querySelectorAll<HTMLButtonElement>(':scope > button')];
		const footer = el.shadowRoot!.querySelector('.page__footer')!;
		const header = el.shadowRoot!.querySelector('.page__header')!;
		// The nearest scroll an arrow key or Tab does for the next row, not the
		// centering a programmatic focus() does in Chromium.
		buttons[15].scrollIntoView({ block: 'nearest' });
		await nextFrames();
		expect(buttons[15].getBoundingClientRect().bottom).toBeLessThanOrEqual(footer.getBoundingClientRect().top + 0.5);
		buttons[3].scrollIntoView({ block: 'nearest' });
		await nextFrames();
		expect(buttons[3].getBoundingClientRect().top).toBeGreaterThanOrEqual(header.getBoundingClientRect().bottom - 0.5);
	});

	it('drops the fade above the footer once scrolled to the end', async () => {
		const el = await page();
		const footer = el.shadowRoot!.querySelector('.page__footer')!;
		expect(footer.classList.contains('is-at-end')).toBe(false);
		el.querySelector<HTMLButtonElement>(':scope > button:last-of-type')!.focus();
		await nextFrames();
		await nextFrames();
		expect(footer.classList.contains('is-at-end')).toBe(true);
	});

	it('keeps an anchor clear of a title bar that turns compact on the way', async () => {
		unloadTokens = loadTokens();
		wrapper = await fixture(`
			<div style="height: 400px; display: flex">
				<nldd-page sticky-header data-scroll="nested">
					<nldd-top-title-bar slot="header" text="Aanvraag A-1042" collapse-anchor="titel"></nldd-top-title-bar>
					<h1 id="titel">Aanvraag A-1042</h1>
					<div style="height: 800px"></div>
					<h2 id="anker">Dakisolatie</h2>
					<div style="height: 800px"></div>
				</nldd-page>
			</div>
		`);
		const el = wrapper.querySelector('nldd-page') as HTMLElement & { updateComplete: Promise<boolean> };
		await el.updateComplete;
		await nextFrames();
		await nextFrames();
		const bar = el.querySelector('nldd-top-title-bar')!;
		expect(bar.offsetHeight).toBe(0);
		el.querySelector('#anker')!.scrollIntoView({ block: 'start' });
		await nextFrames();
		await nextFrames();
		expect(bar.classList.contains('is-compact')).toBe(true);
		const header = el.shadowRoot!.querySelector('.page__header')!;
		expect(el.querySelector('#anker')!.getBoundingClientRect().top).toBeGreaterThanOrEqual(header.getBoundingClientRect().bottom - 0.5);
	});

	describe('a scroller without anything to focus', () => {
		const scroller = (page: Element) => page.shadowRoot!.querySelector('.page__scroll')!;
		const settle = () => new Promise(r => setTimeout(r, 100));

		it('takes a tab stop when it scrolls and holds only text', async () => {
			wrapper = await fixture(`
				<nldd-page sticky-header style="display:flex;height: 200px;">
					<button slot="header">Terug</button>
					<div style="height: 900px;">Tekst</div>
				</nldd-page>`);
			await settle();
			expect(scroller(wrapper).getAttribute('tabindex')).toBe('0');
		});

		it('takes none when it holds a link', async () => {
			wrapper = await fixture(`
				<nldd-page sticky-header style="display:flex;height: 200px;">
					<div style="height: 900px;"><a href="#x">Link</a></div>
				</nldd-page>`);
			await settle();
			expect(scroller(wrapper).hasAttribute('tabindex')).toBe(false);
		});

		// An anchor without href reports a tabIndex of 0, and content that is
		// inert or not shown takes no focus either.
		it.each([
			['an anchor without href', '<a>Anker</a>'],
			['inert content', '<div inert><button>Knop</button></div>'],
			['content that is not shown', '<div style="display:none"><button>Knop</button></div>'],
		])('takes one when it holds only %s', async (_, inner) => {
			wrapper = await fixture(`
				<nldd-page sticky-header style="display:flex;height: 200px;">
					<div style="height: 900px;">${inner}</div>
				</nldd-page>`);
			await settle();
			expect(scroller(wrapper).getAttribute('tabindex')).toBe('0');
		});

		it('puts the tab stop on the host when the host scrolls, without a sticky header', async () => {
			wrapper = await fixture(`
				<nldd-page style="display:block;height: 200px;">
					<div style="height: 900px;">Tekst</div>
				</nldd-page>`);
			await settle();
			expect(wrapper.getAttribute('tabindex')).toBe('0');
			expect(scroller(wrapper).hasAttribute('tabindex')).toBe(false);
			wrapper.querySelector('div')!.style.height = '10px';
			await settle();
			expect(wrapper.hasAttribute('tabindex')).toBe(false);
		});

		it('leaves a tabindex from the markup on the host alone', async () => {
			wrapper = await fixture('<nldd-page tabindex="-1" style="display:block;height: 200px;"><div>Tekst</div></nldd-page>');
			await settle();
			expect(wrapper.getAttribute('tabindex')).toBe('-1');
		});

		it('takes none when it does not scroll', async () => {
			wrapper = await fixture('<nldd-page sticky-header style="display:flex;height: 200px;"><div>Tekst</div></nldd-page>');
			await settle();
			expect(scroller(wrapper).hasAttribute('tabindex')).toBe(false);
		});
	});
});

describe('nldd-page – stand-alone, moved in the DOM', () => {
	let el: HTMLElement;
	afterEach(() => cleanup(el));

	it('reads the scroll mode where it lands, and again on a resize', async () => {
		el = await fixture(`<div>
			<div id="a" style="--context-scroll-mode: nested"><nldd-page><div>Inhoud</div></nldd-page></div>
			<div id="b" style="--context-scroll-mode: root"></div>
		</div>`);
		const page = el.querySelector('nldd-page') as HTMLElement;
		await waitForUpdate(page);
		await nextFrames();
		// Nested is the default, which the page does not write.
		expect(page.dataset.scroll ?? 'nested').toBe('nested');
		const b = el.querySelector('#b') as HTMLElement;
		b.appendChild(page);
		await nextFrames();
		expect(page.dataset.scroll).toBe('root');
		b.style.setProperty('--context-scroll-mode', 'nested');
		window.dispatchEvent(new Event('resize'));
		await nextFrames();
		expect(page.dataset.scroll).toBe('nested');
	});
});

describe('nldd-page – steps with parent', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const STEPS = `
		<div>
			<nldd-page id="opdracht">
				<nldd-top-title-bar slot="header" text="Opdracht" dismiss-text="Sluit"></nldd-top-title-bar>
				<nldd-button id="opener" text="Opdrachtgever toevoegen"></nldd-button>
			</nldd-page>
			<nldd-page id="kiezer" parent="opdracht" hidden>
				<nldd-top-title-bar slot="header" text="Opdrachtgever kiezen" dismiss-text="Sluit"></nldd-top-title-bar>
				<nldd-text-field id="zoek" accessible-label="Zoek"></nldd-text-field>
			</nldd-page>
			<nldd-page id="contact" parent="kiezer" hidden>
				<nldd-top-title-bar slot="header" text="Contactpersoon"></nldd-top-title-bar>
			</nldd-page>
		</div>
	`;

	type Page = HTMLElement & { hidden: boolean; parent: string };
	type Bar = HTMLElement & { _backText: string; updateComplete: Promise<boolean> };
	const page = (id: string) => el.querySelector<Page>(`#${id}`)!;
	const bar = (id: string) => page(id).querySelector<Bar>('nldd-top-title-bar')!;
	/** What an app does: show one page, hide the pages beside it. */
	const view = (id: string) => {
		for (const other of el.querySelectorAll<Page>('nldd-page')) other.hidden = other.id !== id;
	};
	const pressBack = async (id: string) => {
		await bar(id).updateComplete;
		bar(id).shadowRoot!.querySelector<HTMLElement>('.top-title-bar__text-back-button nldd-button')!.click();
		await waitForUpdate(page(id));
	};

	async function setup() {
		await import('../../navigation/top-title-bar/top-title-bar.js');
		await import('../../actions/button/button.js');
		await import('../../inputs/text-field/text-field.js');
		el = await fixture(STEPS);
		await waitForUpdate(page('kiezer'));
	}

	it('gives the title bar of a step the title of its parent as back text', async () => {
		await setup();
		expect(bar('kiezer')._backText).toBe('Opdracht');
		expect(bar('contact')._backText).toBe('Opdrachtgever kiezen');
		expect(bar('opdracht')._backText).toBe('');
	});

	it('follows the title of the parent while the step is in view', async () => {
		await setup();
		view('kiezer');
		await waitForUpdate(page('kiezer'));
		bar('opdracht').setAttribute('text', 'Opdracht A-1042');
		await waitForUpdate(page('kiezer'));
		expect(bar('kiezer')._backText).toBe('Opdracht A-1042');

		(bar('opdracht') as Bar & { text: string }).text = 'Opdracht A-1043';
		await bar('opdracht').updateComplete;
		await waitForUpdate(page('kiezer'));
		expect(bar('kiezer')._backText).toBe('Opdracht A-1043');
	});

	it('follows a parent title bar added later, also inside a wrapper', async () => {
		await setup();
		page('opdracht').querySelector('nldd-top-title-bar')!.remove();
		page('opdracht').setAttribute('accessible-label', 'Opdracht bewerken');
		view('kiezer');
		await waitForUpdate(page('kiezer'));
		expect(bar('kiezer')._backText).toBe('Opdracht bewerken');

		page('opdracht').insertAdjacentHTML('afterbegin', '<div slot="header"><nldd-top-title-bar text="Opdracht"></nldd-top-title-bar></div>');
		await waitForUpdate(page('kiezer'));
		expect(bar('kiezer')._backText).toBe('Opdracht');
	});

	it('follows an accessible-label set as a property on a parent without a title bar', async () => {
		await setup();
		page('opdracht').querySelector('nldd-top-title-bar')!.remove();
		view('kiezer');
		await waitForUpdate(page('kiezer'));
		(page('opdracht') as Page & { accessibleLabel: string }).accessibleLabel = 'Opdracht bewerken';
		await waitForUpdate(page('opdracht'));
		expect(bar('kiezer')._backText).toBe('Opdracht bewerken');
	});

	it('lets the back of a step through to the app, which reads parent off the page', async () => {
		await setup();
		view('kiezer');
		await waitForUpdate(page('kiezer'));
		const seen: string[] = [];
		el.addEventListener('back', (event) => seen.push((event.target as HTMLElement).closest<Page>('nldd-page')!.parent));
		await pressBack('kiezer');
		expect(seen).toEqual(['opdracht']);
		expect(page('kiezer').hidden).toBe(false);
	});

	it('drops the back text when the parent leaves', async () => {
		await setup();
		page('opdracht').remove();
		await waitForUpdate(page('kiezer'));
		expect(bar('kiezer')._backText).toBe('');
	});

	it('follows a parent that changes or goes', async () => {
		await setup();
		page('contact').parent = 'opdracht';
		await waitForUpdate(page('contact'));
		expect(bar('contact')._backText).toBe('Opdracht');
		page('contact').removeAttribute('parent');
		await waitForUpdate(page('contact'));
		expect(bar('contact')._backText).toBe('');
	});

	it('keeps a back-text the consumer set', async () => {
		await setup();
		bar('kiezer').setAttribute('back-text', 'Terug');
		await bar('kiezer').updateComplete;
		expect(bar('kiezer')._backText).toBe('Terug');
	});

	it('falls back to the accessible-label of a parent without a title bar', async () => {
		await setup();
		page('opdracht').querySelector('nldd-top-title-bar')!.remove();
		page('opdracht').setAttribute('accessible-label', 'Opdracht bewerken');
		view('kiezer');
		await waitForUpdate(page('kiezer'));
		expect(bar('kiezer')._backText).toBe('Opdracht bewerken');
	});

	it('does not sync on a text attribute in the content of a page beside it', async () => {
		await setup();
		view('kiezer');
		await waitForUpdate(page('kiezer'));
		const spy = vi.spyOn(page('kiezer') as Page & { _syncBackText(): void }, '_syncBackText');
		page('opdracht').insertAdjacentHTML('beforeend', '<span text="a"></span>');
		page('opdracht').querySelector('span')!.setAttribute('text', 'b');
		await waitForUpdate(page('kiezer'));
		const afterChild = spy.mock.calls.length;
		page('opdracht').querySelector('span')!.setAttribute('text', 'c');
		await waitForUpdate(page('kiezer'));
		expect(spy.mock.calls.length).toBe(afterChild);
	});

	it('leaves a page without parent without a parent attribute', async () => {
		await setup();
		expect(page('opdracht').hasAttribute('parent')).toBe(false);
	});

	it('follows a page a framework shows by removing hidden', async () => {
		await setup();
		page('opdracht').querySelector('nldd-top-title-bar')!.setAttribute('text', 'Opdracht bewerken');
		page('opdracht').hidden = true;
		page('kiezer').hidden = false;
		await waitForUpdate(page('kiezer'));
		expect(bar('kiezer')._backText).toBe('Opdracht bewerken');
	});

	it('names a sheet after the title bar of the step in view', async () => {
		await import('../../navigation/top-title-bar/top-title-bar.js');
		el = await fixture(`<nldd-sheet>${STEPS.replace(/<\/?div>/g, '')}</nldd-sheet>`);
		const sheet = el as HTMLElement & { _resolvedAccessibleLabel: string };
		await waitForUpdate(sheet);
		expect(sheet._resolvedAccessibleLabel).toBe('Opdracht');
		view('kiezer');
		await waitForUpdate(sheet);
		expect(sheet._resolvedAccessibleLabel).toBe('Opdrachtgever kiezen');
	});
});
