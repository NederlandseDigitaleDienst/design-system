import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './modal-dialog.js';
import type { NLDDModalDialog } from './modal-dialog.js';

describe('nldd-modal-dialog', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) {
			const dialog = (el as NLDDModalDialog).shadowRoot?.querySelector('dialog');
			if (dialog?.open) dialog.close();
			cleanup(el);
		}
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	/** Like `fixture`, but returns before the first render: these tests are about
	 *  what happens when a consumer calls show() in that very window. */
	const mountUnrendered = (): NLDDModalDialog => {
		const wrapper = document.createElement('div');
		wrapper.innerHTML = '<nldd-modal-dialog></nldd-modal-dialog>';
		document.body.appendChild(wrapper);
		return wrapper.firstElementChild as NLDDModalDialog;
	};

	it('still opens when show() is called before the first render', async () => {
		const dialogEl = mountUnrendered();
		el = dialogEl;
		expect(dialogEl.shadowRoot?.querySelector('dialog')).toBeFalsy();
		dialogEl.show();

		await waitForUpdate(dialogEl);
		await dialogEl.updateComplete;
		expect(dialogEl.shadowRoot!.querySelector('dialog')!.open).toBe(true);
	});

	it('lets a hide() before the first render cancel that pending open', async () => {
		const dialogEl = mountUnrendered();
		el = dialogEl;
		dialogEl.show();
		dialogEl.hide();

		await waitForUpdate(dialogEl);
		await dialogEl.updateComplete;
		expect(dialogEl.shadowRoot!.querySelector('dialog')!.open).toBe(false);
	});

	it('sets role="alertdialog" when variant is alert', async () => {
		el = await fixture('<nldd-modal-dialog variant="alert"></nldd-modal-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('dialog')!.getAttribute('role')).toBe('alertdialog');
	});

	it('does not set role attribute when no variant is set', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('dialog')!.getAttribute('role')).toBeNull();
	});

	it('renders a native dialog element', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('dialog')).not.toBeNull();
	});

	it('renders an nldd-inline-dialog inside the native dialog', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-inline-dialog')).not.toBeNull();
	});

	/* An overlay that ends its opening animation on a transform keeps that
	 * transform, and an element inside it that positions itself against the
	 * viewport (a CodeMirror completion popup) then resolves against the
	 * overlay instead and lands beside the page. `backwards` leaves nothing
	 * behind, `both` did. */
	it('keeps no transform once it has opened', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		(el as NLDDModalDialog).show();
		await (el as NLDDModalDialog).updateComplete;
		await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
		expect(getComputedStyle(dialog).transform).toBe('none');
	});

	it('does not throw when show() is called on an already-open dialog', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		(el as NLDDModalDialog).show();
		expect(() => (el as NLDDModalDialog).show()).not.toThrow();
	});

	it('opens the native dialog on show()', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		(el as NLDDModalDialog).show();
		expect(el.shadowRoot!.querySelector('dialog')!.open).toBe(true);
	});

	it('fires open event on show()', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		const listener = vi.fn();
		el.addEventListener('open', listener);
		(el as NLDDModalDialog).show();
		expect(listener).toHaveBeenCalledOnce();
	});

	it('adds is-closing class on hide()', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		(el as NLDDModalDialog).show();
		(el as NLDDModalDialog).hide();
		expect(el.shadowRoot!.querySelector('dialog')!.classList.contains('is-closing')).toBe(true);
	});

	it('does nothing when hide() is called on a closed dialog', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		expect(() => (el as NLDDModalDialog).hide()).not.toThrow();
	});

	it('forwards text attribute to nldd-inline-dialog', async () => {
		el = await fixture('<nldd-modal-dialog text="Bevestiging vereist"></nldd-modal-dialog>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('nldd-inline-dialog');
		expect(inner?.getAttribute('text')).toBe('Bevestiging vereist');
	});

	it('forwards supporting-text attribute to nldd-inline-dialog', async () => {
		el = await fixture('<nldd-modal-dialog supporting-text="Ondersteunende tekst"></nldd-modal-dialog>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('nldd-inline-dialog');
		expect(inner?.getAttribute('supporting-text')).toBe('Ondersteunende tekst');
	});

	it('forwards variant attribute to nldd-inline-dialog', async () => {
		el = await fixture('<nldd-modal-dialog variant="alert"></nldd-modal-dialog>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('nldd-inline-dialog');
		expect(inner?.getAttribute('variant')).toBe('alert');
	});

	it('forwards icon attribute to nldd-inline-dialog', async () => {
		el = await fixture('<nldd-modal-dialog icon="check-mark-circle"></nldd-modal-dialog>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('nldd-inline-dialog');
		expect(inner?.getAttribute('icon')).toBe('check-mark-circle');
	});

	it('forwards horizontal-alignment to nldd-inline-dialog', async () => {
		el = await fixture('<nldd-modal-dialog horizontal-alignment="left"></nldd-modal-dialog>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('nldd-inline-dialog');
		expect(inner?.getAttribute('horizontal-alignment')).toBe('left');
	});

	it('leaves horizontal-alignment off the inner dialog when unset, so it derives its own', async () => {
		el = await fixture('<nldd-modal-dialog text="Weet u het zeker?"></nldd-modal-dialog>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('nldd-inline-dialog');
		expect(inner?.hasAttribute('horizontal-alignment')).toBe(false);
	});

	it('a modal with slotted content aligns left without being told to', async () => {
		el = await fixture(`
			<nldd-modal-dialog text="Map hernoemen">
				<nldd-text-field label="Naam"></nldd-text-field>
			</nldd-modal-dialog>
		`);
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('nldd-inline-dialog')!;
		await waitForUpdate(inner as HTMLElement);
		expect(inner.shadowRoot!.querySelector('.inline-dialog')!.classList.contains('inline-dialog--left-aligned')).toBe(true);
	});

	it('sets aria-label from accessible-label', async () => {
		el = await fixture('<nldd-modal-dialog accessible-label="Bevestig actie" text="Weet u het zeker?"></nldd-modal-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Bevestig actie');
	});

	it('falls back to text for aria-label when no accessible-label', async () => {
		el = await fixture('<nldd-modal-dialog text="Bevestiging vereist"></nldd-modal-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Bevestiging vereist');
	});

	it('focuses the dialog on show()', async () => {
		el = await fixture('<nldd-modal-dialog text="Bevestiging vereist"></nldd-modal-dialog>');
		await waitForUpdate(el);
		(el as NLDDModalDialog).show();
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		expect(document.activeElement === dialog || el.shadowRoot!.activeElement === dialog).toBe(true);
	});

	it('inner nldd-inline-dialog receives heading-level="2"', async () => {
		el = await fixture('<nldd-modal-dialog text="Test"></nldd-modal-dialog>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('nldd-inline-dialog');
		expect(inner?.getAttribute('heading-level')).toBe('2');
	});

	it('respects autofocus attribute on slotted content', async () => {
		el = await fixture('<nldd-modal-dialog><button slot="actions" autofocus>OK</button></nldd-modal-dialog>');
		await waitForUpdate(el);
		(el as NLDDModalDialog).show();
		const button = el.querySelector<HTMLElement>('button')!;
		expect(document.activeElement === button).toBe(true);
	});

	// Note: getBoundingClientRect() returns all-zeros in JSDOM. The padding-click
	// test passes because (0, 0) lies on the degenerate [0,0]×[0,0] rect; the
	// backdrop-click test passes because (-10, -10) lies outside it. The logic
	// is correct under real layout — these assertions exercise the in-rect /
	// outside-rect branch boundaries, not realistic geometry.
	it('does not close when clicking on the dialog padding', async () => {
		el = await fixture('<nldd-modal-dialog text="Test"></nldd-modal-dialog>');
		await waitForUpdate(el);
		(el as NLDDModalDialog).show();
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		const rect = dialog.getBoundingClientRect();
		// Press and release inside the dialog rect (i.e., on padding)
		const inside = {
			bubbles: true, composed: true,
			clientX: rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2,
		};
		dialog.dispatchEvent(new PointerEvent('pointerdown', inside));
		dialog.dispatchEvent(new MouseEvent('click', inside));
		expect(dialog.classList.contains('is-closing')).toBe(false);
		expect(dialog.open).toBe(true);
	});

	it('closes when clicking on the backdrop (outside dialog rect)', async () => {
		el = await fixture('<nldd-modal-dialog text="Test"></nldd-modal-dialog>');
		await waitForUpdate(el);
		(el as NLDDModalDialog).show();
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		const rect = dialog.getBoundingClientRect();
		// Press AND release outside the dialog rect: the drag-guard only
		// dismisses when the pointerdown started on the backdrop too.
		const outside = {
			bubbles: true, composed: true,
			clientX: rect.left - 10,
			clientY: rect.top - 10,
		};
		dialog.dispatchEvent(new PointerEvent('pointerdown', outside));
		dialog.dispatchEvent(new MouseEvent('click', outside));
		expect(dialog.classList.contains('is-closing')).toBe(true);
	});

	it('does not close on a drag that starts inside and releases on the backdrop', async () => {
		el = await fixture('<nldd-modal-dialog text="Test"></nldd-modal-dialog>');
		await waitForUpdate(el);
		(el as NLDDModalDialog).show();
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		const rect = dialog.getBoundingClientRect();
		// Press inside the dialog (selecting text, dragging a control)...
		dialog.dispatchEvent(new PointerEvent('pointerdown', {
			bubbles: true, composed: true,
			clientX: rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2,
		}));
		// ...release on the backdrop: the browser fires the click on the dialog
		// with coordinates outside its rect.
		dialog.dispatchEvent(new MouseEvent('click', {
			bubbles: true, composed: true,
			clientX: rect.left - 10,
			clientY: rect.top - 10,
		}));
		expect(dialog.classList.contains('is-closing')).toBe(false);
		expect(dialog.open).toBe(true);
	});

	it('prevents default on cancel event and calls hide()', async () => {
		el = await fixture('<nldd-modal-dialog></nldd-modal-dialog>');
		await waitForUpdate(el);
		(el as NLDDModalDialog).show();
		const hideSpy = vi.spyOn(el as NLDDModalDialog, 'hide');
		const event = new Event('cancel', { cancelable: true });
		const preventSpy = vi.spyOn(event, 'preventDefault');
		el.shadowRoot!.querySelector('dialog')!.dispatchEvent(event);
		expect(preventSpy).toHaveBeenCalled();
		expect(hideSpy).toHaveBeenCalledOnce();
	});
});

describe('nldd-modal-dialog – close fallback', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// The same trap as nldd-sheet: a background tab pauses CSS animations, so
	// animationend never arrives. Without the timer the dialog stayed open and
	// `_closing`, and ignored every hide() after that.
	it('sluit ook wanneer animationend nooit komt', async () => {
		el = await fixture<HTMLElement>('<nldd-modal-dialog text="Test"></nldd-modal-dialog>');
		await waitForUpdate(el);
		const modal = el as HTMLElement & { show: () => void; hide: () => void };
		modal.show();
		await waitForUpdate(el);
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		expect(dialog.open).toBe(true);

		const realAdd = dialog.addEventListener.bind(dialog);
		dialog.addEventListener = ((type: string, ...rest: unknown[]) => {
			if (type === 'animationend') return;
			return (realAdd as (...a: unknown[]) => void)(type, ...rest);
		}) as typeof dialog.addEventListener;
		// The reduced-motion branch closes right away when animationName is 'none',
		// so show it a real animation and only the timer is left.
		const realGetComputed = window.getComputedStyle.bind(window);
		const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation(((elt: Element, ...rest: unknown[]) => {
			const style = (realGetComputed as (...a: unknown[]) => CSSStyleDeclaration)(elt, ...rest);
			if (elt === dialog) {
				return new Proxy(style, {
					get: (target, prop) => (prop === 'animationName' ? 'modal-dialog-out' : Reflect.get(target, prop)),
				});
			}
			return style;
		}) as typeof window.getComputedStyle);

		modal.hide();
		expect(dialog.open).toBe(true);
		await new Promise(r => setTimeout(r, 1200));
		spy.mockRestore();
		expect(dialog.open).toBe(false);
	}, 5000);
});
