import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, nextFrames } from '../../../test-utils.js';
import './page.js';
import '../sheet/sheet.js';
import '../split-views/side-by-side-split-view/side-by-side-split-view.js';
import '../split-views/split-view-pane/split-view-pane.js';
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

	describe('is-last main slot marker', () => {
		it('marks the last visible main child with is-last', async () => {
			el = await fixture(`
				<nldd-page>
					<div id="a">A</div>
					<div id="b">B</div>
					<div id="c">C</div>
				</nldd-page>
			`);
			await waitForUpdate(el);

			expect(el.querySelector('#a')!.classList.contains('is-last')).toBe(false);
			expect(el.querySelector('#b')!.classList.contains('is-last')).toBe(false);
			expect(el.querySelector('#c')!.classList.contains('is-last')).toBe(true);
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

			expect(el.querySelector('#b')!.classList.contains('is-last')).toBe(true);
			expect(el.querySelector('#c')!.classList.contains('is-last')).toBe(false);
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

			// `footer` is in a named slot — it should not appear in the main-slot
			// last-pick and thus must not carry is-last.
			expect(el.querySelector('#b')!.classList.contains('is-last')).toBe(true);
			expect(el.querySelector('#footer')!.classList.contains('is-last')).toBe(false);
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

		it('is a region in a pane, so the second page does not claim the document', async () => {
			el = await fixture(`
				<nldd-side-by-side-split-view panes="2">
					<nldd-split-view-pane slot="pane-1"><nldd-page id="een"></nldd-page></nldd-split-view-pane>
					<nldd-split-view-pane slot="pane-2"><nldd-page id="twee"></nldd-page></nldd-split-view-pane>
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
					<nldd-split-view-pane slot="pane-1"><nldd-page landmarks="page"></nldd-page></nldd-split-view-pane>
					<nldd-split-view-pane slot="pane-2"><nldd-page></nldd-page></nldd-split-view-pane>
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

		it('warns about a second page that renders a main, hidden or not', async () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			el = await fixture(`
				<div>
					<nldd-page></nldd-page>
					<nldd-page hidden></nldd-page>
				</div>
			`);
			for (const page of el.querySelectorAll('nldd-page')) await waitForUpdate(page as HTMLElement);
			expect(warn.mock.calls.filter(([message]) => String(message).includes('second page')).length).toBe(1);
			warn.mockRestore();
		});

		it('says nothing when the other pages are regions', async () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			el = await fixture(`
				<nldd-side-by-side-split-view panes="2">
					<nldd-split-view-pane slot="pane-1"><nldd-page landmarks="page"></nldd-page></nldd-split-view-pane>
					<nldd-split-view-pane slot="pane-2"><nldd-page></nldd-page></nldd-split-view-pane>
				</nldd-side-by-side-split-view>
			`);
			for (const page of el.querySelectorAll('nldd-page')) await waitForUpdate(page as HTMLElement);
			expect(warn.mock.calls.filter(([message]) => String(message).includes('second page'))).toEqual([]);
			warn.mockRestore();
		});
	});

});
