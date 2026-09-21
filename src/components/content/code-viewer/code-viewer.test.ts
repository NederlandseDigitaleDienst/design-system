import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, nextFrames } from '../../../test-utils.js';
import type { NLDDCodeViewer } from './code-viewer.js';
import './code-viewer.js';

describe('nldd-code-viewer', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-code-viewer>hello</nldd-code-viewer>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('mount een read-only CodeMirror editor', async () => {
		el = await fixture('<nldd-code-viewer>hello</nldd-code-viewer>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.cm-editor')).not.toBeNull();
		const content = el.shadowRoot!.querySelector('.cm-content') as HTMLElement;
		expect(content.getAttribute('contenteditable')).toBe('false');
	});

	it('toont slot content in de editor', async () => {
		el = await fixture('<nldd-code-viewer>example content</nldd-code-viewer>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content')!;
		expect(content.textContent).toContain('example content');
	});

	it('kondigt de read-only content niet aan als een editable textbox', async () => {
		el = await fixture('<nldd-code-viewer>x</nldd-code-viewer>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content')!;
		expect(content.getAttribute('role')).toBe('code'); // not CodeMirror's default "textbox"
	});

	it('laat de textbox-attributen van CodeMirror niet op role="code" staan', async () => {
		el = await fixture('<nldd-code-viewer>x</nldd-code-viewer>');
		await waitForUpdate(el);
		const viewer = el as NLDDCodeViewer;
		const expectNoTextboxAttrs = () => {
			const content = el.shadowRoot!.querySelector('.cm-content')!;
			expect(content.hasAttribute('aria-multiline')).toBe(false);
			expect(content.hasAttribute('aria-readonly')).toBe(false);
		};
		expectNoTextboxAttrs();

		el.textContent = 'y';
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.cm-content')!.textContent).toContain('y');
		expectNoTextboxAttrs();

		viewer.wrap = true;
		await waitForUpdate(el);
		expectNoTextboxAttrs();
	});

	// Regression: a detach/reattach — as Vue <KeepAlive> does when switching a
	// v-if panel back into view — destroyed the CodeMirror view on disconnect
	// but never re-mounted it (Lit's firstUpdated is one-shot), so the viewer
	// came back blank until a page reload. The base class now re-mounts from the
	// preserved document on reconnect.
	it('rebuilds the view with its content after a detach/reattach', async () => {
		el = await fixture('<nldd-code-viewer language="yaml">a: 1\nb: 2</nldd-code-viewer>');
		await waitForUpdate(el);
		const parent = el.parentElement!;
		const marker = document.createComment('placeholder');

		// Detach (disconnectedCallback → destroyEditor), then reattach.
		parent.replaceChild(marker, el);
		expect(el.shadowRoot!.querySelector('.cm-content')).toBeNull();
		parent.replaceChild(el, marker);
		await waitForUpdate(el);

		const content = el.shadowRoot!.querySelector('.cm-content')!;
		expect(content.textContent).toContain('a: 1');
		expect(content.textContent).toContain('b: 2');
	});

	it('reflects the wrap attribute', async () => {
		el = await fixture('<nldd-code-viewer wrap>x</nldd-code-viewer>');
		await waitForUpdate(el);
		expect(el.hasAttribute('wrap')).toBe(true);
	});

	it('rendert inhoud plain zonder taal', async () => {
		el = await fixture('<nldd-code-viewer>const x = 1;</nldd-code-viewer>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content')!;
		expect(content.textContent).toContain('const x = 1;');
	});

	it('highlight de inhoud met een bekende taal (CM tokens)', async () => {
		el = await fixture('<nldd-code-viewer language="json">{"foo": 1, "bar": true}</nldd-code-viewer>');
		await (el as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content')!;
		expect(content.textContent).toContain('"foo"');
		// CodeMirror wraps highlighted tokens in <span> nodes; plain text has none.
		expect(content.querySelectorAll('span').length).toBeGreaterThan(0);
	});

	it('onbekende taal: rendert plain zonder fout', async () => {
		el = await fixture('<nldd-code-viewer language="not-a-real-language">plain text</nldd-code-viewer>');
		await (el as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.cm-content')!;
		expect(content.textContent).toContain('plain text');
	});


	/* ============================================================
	   Container (variant)
	   ============================================================ */

	it('defaults to variant="box-tinted"', async () => {
		el = await fixture('<nldd-code-viewer>x</nldd-code-viewer>');
		await waitForUpdate(el);
		// Both defaults are kept out of the DOM; the properties are the source of truth.
		expect((el as unknown as { variant: string }).variant).toBe('box-tinted');
		expect(el.hasAttribute('variant')).toBe(false);
	});

	it('reflects variant attribute', async () => {
		el = await fixture('<nldd-code-viewer variant="simple">x</nldd-code-viewer>');
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('simple');
		expect((el as { variant?: string }).variant).toBe('simple');
	});

	it('variant="simple" zeroes the box CSS — corner-radius and padding', async () => {
		el = await fixture('<nldd-code-viewer variant="simple">x</nldd-code-viewer>');
		await waitForUpdate(el);
		const block = el.shadowRoot!.querySelector<HTMLElement>('.code-viewer')!;
		const cs = getComputedStyle(block);
		expect(parseFloat(cs.borderTopLeftRadius)).toBe(0);
		expect(parseFloat(cs.paddingTop)).toBe(0);
		expect(parseFloat(cs.paddingLeft)).toBe(0);
		expect(cs.backgroundColor).toBe('rgba(0, 0, 0, 0)');
	});

	it('reflects a non-default variant value', async () => {
		// 'box-tinted' is the default and is kept out of the DOM (covered above);
		// the other two must reflect, since the styles select on them.
		el = await fixture('<nldd-code-viewer variant="box-base">x</nldd-code-viewer>');
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('box-base');
	});


	/* ============================================================
	   Copy button
	   ============================================================ */

	it('renders the copy button by default', async () => {
		el = await fixture('<nldd-code-viewer>x</nldd-code-viewer>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.code-viewer__copy-button')).not.toBeNull();
	});

	it('no-copy hides the copy button', async () => {
		el = await fixture('<nldd-code-viewer no-copy>x</nldd-code-viewer>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.code-viewer__copy-button')).toBeNull();
	});

	it('clicking copy writes the raw slot text to the clipboard', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		const originalClipboard = navigator.clipboard;
		Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
		try {
			el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>hello world</nldd-code-viewer>');
			await waitForUpdate(el);
			(el as unknown as NLDDCodeViewer)._onCopyClick();
			await waitForUpdate(el);
			expect(writeText).toHaveBeenCalledWith('hello world');
		} finally {
			Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
		}
	});

	it('success state swaps icon to check-mark and opens the tooltip', async () => {
		const originalClipboard = navigator.clipboard;
		Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
		try {
			el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>x</nldd-code-viewer>');
			await waitForUpdate(el);
			await (el as unknown as NLDDCodeViewer)._onCopyClick();
			await waitForUpdate(el);
			expect((el as unknown as NLDDCodeViewer)._copyState).toBe('success');
			const iconBtn = el.shadowRoot!.querySelector('.code-viewer__copy-button nldd-icon-button');
			expect(iconBtn!.getAttribute('icon')).toBe('check-mark');
			const tooltip = el.shadowRoot!.querySelector('.code-viewer__copy-button nldd-tooltip');
			expect(tooltip!.hasAttribute('open')).toBe(true);
		} finally {
			Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
		}
	});

	it('failure state keeps the copy icon and opens the tooltip with failure text', async () => {
		const originalClipboard = navigator.clipboard;
		Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) }, configurable: true });
		try {
			el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>x</nldd-code-viewer>');
			await waitForUpdate(el);
			await (el as unknown as NLDDCodeViewer)._onCopyClick();
			await waitForUpdate(el);
			expect((el as unknown as NLDDCodeViewer)._copyState).toBe('failure');
			const iconBtn = el.shadowRoot!.querySelector('.code-viewer__copy-button nldd-icon-button');
			expect(iconBtn!.getAttribute('icon')).toBe('copy');
			const tooltip = el.shadowRoot!.querySelector('.code-viewer__copy-button nldd-tooltip');
			expect(tooltip!.getAttribute('text')).toBe('Kopiëren mislukt');
		} finally {
			Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
		}
	});

	it('resets to idle after the feedback duration', async () => {
		const originalClipboard = navigator.clipboard;
		Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
		vi.useFakeTimers();
		try {
			el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>x</nldd-code-viewer>');
			const litEl = el as HTMLElement & { updateComplete: Promise<boolean> };
			await litEl.updateComplete;
			await (el as unknown as NLDDCodeViewer)._onCopyClick();
			await litEl.updateComplete;
			expect((el as unknown as NLDDCodeViewer)._copyState).toBe('success');
			await vi.advanceTimersByTimeAsync(2100);
			await litEl.updateComplete;
			expect((el as unknown as NLDDCodeViewer)._copyState).toBe('idle');
		} finally {
			vi.useRealTimers();
			Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
		}
	});

	it('tooltip dismiss (Escape) resets copy state to idle and cancels the timer', async () => {
		const originalClipboard = navigator.clipboard;
		Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
		vi.useFakeTimers();
		try {
			el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>x</nldd-code-viewer>');
			const litEl = el as HTMLElement & { updateComplete: Promise<boolean> };
			await litEl.updateComplete;
			await (el as unknown as NLDDCodeViewer)._onCopyClick();
			await litEl.updateComplete;
			expect((el as unknown as NLDDCodeViewer)._copyState).toBe('success');
			const tooltip = el.shadowRoot!.querySelector('.code-viewer__copy-button nldd-tooltip')!;
			tooltip.dispatchEvent(new CustomEvent('nldd-tooltip-dismiss', { bubbles: true, composed: true }));
			await litEl.updateComplete;
			expect((el as unknown as NLDDCodeViewer)._copyState).toBe('idle');
			expect(tooltip.hasAttribute('open')).toBe(false);
			await vi.advanceTimersByTimeAsync(2100);
			await litEl.updateComplete;
			expect((el as unknown as NLDDCodeViewer)._copyState).toBe('idle');
		} finally {
			vi.useRealTimers();
			Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
		}
	});

	// Off a secure context navigator.clipboard is undefined, so the copy button
	// would be a dead button that only ever flashes "Kopiëren mislukt". It must
	// not render at all when the Clipboard API can't work.
	it('hides the copy button on a non-secure context (no clipboard)', async () => {
		const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'isSecureContext');
		Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
		try {
			el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>x</nldd-code-viewer>');
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.code-viewer__copy-button')).toBeNull();
			// The reserved actions space is dropped too (internal attribute).
			expect(el.hasAttribute('copy-unavailable')).toBe(true);
		} finally {
			if (originalDescriptor) Object.defineProperty(window, 'isSecureContext', originalDescriptor);
		}
	});

	it('hides the copy button when navigator.clipboard is undefined even in a secure context', async () => {
		const originalClipboard = navigator.clipboard;
		Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
		try {
			el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>x</nldd-code-viewer>');
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.code-viewer__copy-button')).toBeNull();
			expect(el.hasAttribute('copy-unavailable')).toBe(true);
		} finally {
			Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
		}
	});

	it('renders the copy button when the clipboard is available (secure context)', async () => {
		// The test browser is a secure context with a real clipboard; assert the
		// positive case so the two hide-cases above are meaningful.
		el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>x</nldd-code-viewer>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.code-viewer__copy-button')).not.toBeNull();
		expect(el.hasAttribute('copy-unavailable')).toBe(false);
	});


	/* ============================================================
	   Reactive slot text (character-data mutations)
	   ============================================================ */

	// A framework that patches an existing text node in place ({{ reactiveString }})
	// mutates characterData without swapping the node, so no slotchange fires. The
	// viewer's MutationObserver must catch it and re-read the content.
	it('updates when a slotted text node mutates in place (no slotchange)', async () => {
		el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>before</nldd-code-viewer>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.cm-content')!.textContent).toContain('before');

		// Mutate the existing text node's data — no add/remove, so no slotchange.
		const textNode = el.firstChild as Text;
		textNode.data = 'after';
		await waitForUpdate(el);

		const content = el.shadowRoot!.querySelector('.cm-content')!;
		expect(content.textContent).toContain('after');
		expect(content.textContent).not.toContain('before');
	});


	/* ============================================================
	   Detach / reattach with changed slot content
	   ============================================================ */

	// The base re-mounts from getRemountDoc() on reconnect; the viewer overrides it
	// to read the live slot, so content swapped while detached shows on reattach
	// (rather than the stale doc captured on disconnect).
	it('reflects slot content changed while detached, on reattach', async () => {
		el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>original</nldd-code-viewer>');
		await waitForUpdate(el);
		const parent = el.parentElement!;
		const marker = document.createComment('placeholder');

		parent.replaceChild(marker, el);
		// Swap the light-DOM content while detached (observers are disconnected).
		el.textContent = 'replaced';
		parent.replaceChild(el, marker);
		await waitForUpdate(el);

		const content = el.shadowRoot!.querySelector('.cm-content')!;
		expect(content.textContent).toContain('replaced');
		expect(content.textContent).not.toContain('original');
	});


	/* ============================================================
	   Scrollable region a11y (ResizeObserver)
	   ============================================================ */

	// A long unwrapped line overflows horizontally; the scroller becomes the
	// focusable, labeled scroll region (WCAG 2.1.1).
	it('marks the scroller focusable + labeled when content overflows', async () => {
		el = await fixture<NLDDCodeViewer>(
			`<nldd-code-viewer style="width: 120px">${'x'.repeat(400)}</nldd-code-viewer>`,
		);
		await waitForUpdate(el);
		await nextFrames();
		const scroller = el.shadowRoot!.querySelector('.cm-scroller')!;
		expect(scroller.getAttribute('tabindex')).toBe('0');
		expect(scroller.getAttribute('role')).toBe('region');
		expect(scroller.getAttribute('aria-label')).toBe('Code');
		expect((el as unknown as NLDDCodeViewer)._isScrollable).toBe(true);
	});

	// Regression (fix 1): a width:0 ResizeObserver tick — as forceScrollLayerRepaint
	// produces during a color-scheme flip — must NOT strip the scroll region's
	// a11y attributes off an overflowing block.
	it('keeps the scroll region a11y attributes across a width:0 resize tick', async () => {
		el = await fixture<NLDDCodeViewer>(
			`<nldd-code-viewer style="width: 120px">${'x'.repeat(400)}</nldd-code-viewer>`,
		);
		await waitForUpdate(el);
		await nextFrames();
		const scroller = el.shadowRoot!.querySelector('.cm-scroller') as HTMLElement;
		expect(scroller.getAttribute('role')).toBe('region');

		// Simulate the transient reflow: hide → force layout → show. This fires the
		// ResizeObserver with a 0-width contentRect, which the guard must ignore.
		const prevDisplay = scroller.style.display;
		scroller.style.display = 'none';
		void scroller.offsetHeight;
		scroller.style.display = prevDisplay;
		await nextFrames();

		// Still reachable — attributes intact.
		expect(scroller.getAttribute('tabindex')).toBe('0');
		expect(scroller.getAttribute('role')).toBe('region');
		expect((el as unknown as NLDDCodeViewer)._isScrollable).toBe(true);
	});

	// A direct _updateScrollable() while the scroller measures 0×0 (no layout) must
	// be a no-op, not a strip — this is the unit-level guard behind fix 1.
	it('_updateScrollable ignores a 0-width measurement', async () => {
		el = await fixture<NLDDCodeViewer>(
			`<nldd-code-viewer style="width: 120px">${'x'.repeat(400)}</nldd-code-viewer>`,
		);
		await waitForUpdate(el);
		await nextFrames();
		// _updateScrollable/_isScrollable are private on the class; reach them via a
		// plain structural type (intersecting with the class would collapse to never).
		const viewer = el as unknown as { _updateScrollable(): void; _isScrollable: boolean };
		const scroller = el.shadowRoot!.querySelector('.cm-scroller') as HTMLElement;
		expect(scroller.getAttribute('role')).toBe('region');

		// Zero out layout, then call the recompute directly: it must bail rather
		// than flip _isScrollable false and strip the attributes.
		scroller.style.display = 'none';
		viewer._updateScrollable();
		scroller.style.display = '';
		expect(viewer._isScrollable).toBe(true);
		expect(scroller.getAttribute('role')).toBe('region');
	});


	/* ============================================================
	   Sizing (wrap vs horizontal scroll)
	   ============================================================ */

	// wrap breaks long lines instead of scrolling, so the scroller never overflows
	// and stays out of the tab order.
	it('wrap keeps the scroller non-scrollable (no horizontal overflow)', async () => {
		el = await fixture<NLDDCodeViewer>(
			`<nldd-code-viewer wrap style="width: 120px">${'x'.repeat(400)}</nldd-code-viewer>`,
		);
		await waitForUpdate(el);
		await nextFrames();
		const scroller = el.shadowRoot!.querySelector('.cm-scroller') as HTMLElement;
		expect((el as unknown as NLDDCodeViewer)._isScrollable).toBe(false);
		expect(scroller.hasAttribute('tabindex')).toBe(false);
		expect(scroller.hasAttribute('role')).toBe(false);
	});


	/* ============================================================
	   Programmatic focus (fix 6)
	   ============================================================ */

	// A read-only viewer's focus() must land on the labeled scroll region
	// (.cm-scroller), the same target a keyboard tab reaches — not the
	// non-editable .cm-content the base focus() would target.
	it('focus() targets the scroller when the content is scrollable', async () => {
		el = await fixture<NLDDCodeViewer>(
			`<nldd-code-viewer style="width: 120px">${'x'.repeat(400)}</nldd-code-viewer>`,
		);
		await waitForUpdate(el);
		await nextFrames();
		(el as unknown as { focus(): void }).focus();
		const scroller = el.shadowRoot!.querySelector('.cm-scroller');
		expect(el.shadowRoot!.activeElement).toBe(scroller);
	});

	// Nothing to focus when the content doesn't overflow (the scroller isn't
	// focusable), so focus() is a no-op rather than landing on .cm-content.
	it('focus() is a no-op when the content is not scrollable', async () => {
		el = await fixture<NLDDCodeViewer>('<nldd-code-viewer>x</nldd-code-viewer>');
		await waitForUpdate(el);
		(el as unknown as { focus(): void }).focus();
		expect(el.shadowRoot!.activeElement).toBeNull();
	});
});
