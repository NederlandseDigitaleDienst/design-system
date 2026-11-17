/* eslint-disable lit-a11y/click-events-have-key-events -- native dialog handles keyboard via @cancel */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { LitElement, html } from 'lit';
import { ModalOverlay, type ModalOverlayOptions } from './modal-overlay.js';
import '../components/navigation/top-title-bar/top-title-bar.js';

let options: ModalOverlayOptions = {};

class TestModalOverlay extends LitElement {
	static override properties = { open: { type: Boolean, reflect: true } };
	open = false;
	_modalOverlay = new ModalOverlay(this, options);
	show(): void {
		this._modalOverlay.show();
	}
	hide(): void {
		this._modalOverlay.hide();
	}
	override render() {
		return html`<dialog
			style="inset: 100px; width: 200px; height: 200px; margin: 0; padding: 0"
			@pointerdown=${this._modalOverlay.handlePointerDown}
			@pointerup=${this._modalOverlay.handlePointerUp}
			@click=${this._modalOverlay.handleClick}
			@cancel=${this._modalOverlay.handleCancel}
			@close=${this._modalOverlay.handleClose}
		><slot></slot></dialog>`;
	}
}
customElements.define('test-modal-overlay', TestModalOverlay);

async function mount(opts: ModalOverlayOptions = {}, inner = ''): Promise<TestModalOverlay> {
	options = opts;
	const el = document.createElement('test-modal-overlay') as TestModalOverlay;
	el.innerHTML = inner;
	document.body.append(el);
	await el.updateComplete;
	return el;
}

const dialogOf = (el: TestModalOverlay) => el.shadowRoot!.querySelector('dialog')!;

/** A press, a release and the click they make, all at one point. */
function gesture(target: Element, down: [number, number], up = down): void {
	target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, clientX: down[0], clientY: down[1] }));
	target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, clientX: up[0], clientY: up[1] }));
	target.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, clientX: up[0], clientY: up[1] }));
}

afterEach(() => {
	for (const el of document.querySelectorAll('test-modal-overlay')) {
		const dialog = (el as TestModalOverlay).shadowRoot?.querySelector('dialog');
		if (dialog?.open) dialog.close();
	}
	document.body.replaceChildren();
});

describe('ModalOverlay', () => {
	it('opens modal, sets open and fires open', async () => {
		const el = await mount();
		const onOpen = vi.fn();
		el.addEventListener('open', onOpen);
		el.show();
		expect(dialogOf(el).matches(':modal')).toBe(true);
		expect(el.open).toBe(true);
		expect(onOpen).toHaveBeenCalledOnce();
	});

	it('follows open set from outside', async () => {
		const el = await mount();
		el.open = true;
		await el.updateComplete;
		expect(dialogOf(el).open).toBe(true);
		el.open = false;
		await el.updateComplete;
		expect(dialogOf(el).open).toBe(false);
	});

	it('fires close once per open cycle, whatever closed it', async () => {
		const el = await mount();
		const onClose = vi.fn();
		el.addEventListener('close', onClose);
		el.show();
		el.hide();
		await new Promise((resolve) => setTimeout(resolve));
		expect(onClose).toHaveBeenCalledOnce();
		el.show();
		await el.updateComplete;
		const closed = new Promise((resolve) => dialogOf(el).addEventListener('close', resolve, { once: true }));
		dialogOf(el).close();
		await closed;
		expect(onClose).toHaveBeenCalledTimes(2);
		expect(el.open).toBe(false);
	});

	it('ignores the close event of a dialog that was opened again', async () => {
		const el = await mount();
		const onClose = vi.fn();
		el.show();
		el.hide();
		el.show();
		el.addEventListener('close', onClose);
		// The browser queues the close event of the first hide() until now.
		await new Promise((resolve) => setTimeout(resolve));
		expect(onClose).not.toHaveBeenCalled();
		expect(dialogOf(el).open).toBe(true);
		expect(el.open).toBe(true);
	});

	it('stays closed when it renders between a close of its own and the close event', async () => {
		const el = await mount();
		el.show();
		await el.updateComplete;
		const closed = new Promise((resolve) => dialogOf(el).addEventListener('close', resolve, { once: true }));
		dialogOf(el).close();
		el.requestUpdate();
		await el.updateComplete;
		await closed;
		await el.updateComplete;
		expect(dialogOf(el).open).toBe(false);
		expect(el.open).toBe(false);
	});

	it('stays closed when hidden before its first render, after open was set', async () => {
		options = {};
		const el = document.createElement('test-modal-overlay') as TestModalOverlay;
		el.open = true;
		document.body.append(el);
		el.hide();
		await el.updateComplete;
		expect(dialogOf(el).open).toBe(false);
		expect(el.open).toBe(false);
	});

	it('ignores the close of a nested component', async () => {
		const el = await mount({}, '<span></span>');
		const onClose = vi.fn();
		el.addEventListener('close', (e) => e.target === el && onClose());
		el.show();
		el.querySelector('span')!.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
		expect(onClose).not.toHaveBeenCalled();
		expect(dialogOf(el).open).toBe(true);
	});

	it('plays the closing animation and can be opened again while it runs', async () => {
		const el = await mount({ animatedClose: true });
		el.show();
		el.hide();
		expect(dialogOf(el).classList.contains('is-closing')).toBe(true);
		el.show();
		expect(dialogOf(el).classList.contains('is-closing')).toBe(false);
		expect(dialogOf(el).open).toBe(true);
		expect(el.open).toBe(true);
	});

	it('fires open twice and close not at all when it is opened again during its close', async () => {
		vi.useFakeTimers();
		try {
			const el = await mount({ animatedClose: true });
			const events: string[] = [];
			el.addEventListener('open', () => events.push('open'));
			el.addEventListener('close', () => events.push('close'));
			el.show();
			el.hide();
			el.show();
			// Past the fallback of the close that was called off.
			vi.advanceTimersByTime(1000);
			expect(events).toEqual(['open', 'open']);
			expect(dialogOf(el).open).toBe(true);
			el.hide();
			vi.advanceTimersByTime(1000);
			expect(events).toEqual(['open', 'open', 'close']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('runs beforeOpen again when it is opened during its close', async () => {
		const beforeOpen = vi.fn();
		const el = await mount({ animatedClose: true, beforeOpen });
		el.show();
		el.hide();
		el.show();
		expect(beforeOpen).toHaveBeenCalledTimes(2);
		el.show();
		expect(beforeOpen).toHaveBeenCalledTimes(2);
	});

	it('finishes a close whose animation never ends', async () => {
		vi.useFakeTimers();
		try {
			const el = await mount({ animatedClose: true });
			el.show();
			el.hide();
			vi.advanceTimersByTime(1000);
			expect(dialogOf(el).open).toBe(false);
		} finally {
			vi.useRealTimers();
		}
	});

	it('leaves no animationend listener behind when another route ends the close', async () => {
		vi.useFakeTimers();
		try {
			const el = await mount({ animatedClose: true });
			const dialog = dialogOf(el);
			const added = vi.spyOn(dialog, 'addEventListener');
			const removed = vi.spyOn(dialog, 'removeEventListener');
			el.show();
			el.hide();
			vi.advanceTimersByTime(1000);
			const listener = added.mock.calls.find(([type]) => type === 'animationend')![1];
			expect(removed).toHaveBeenCalledWith('animationend', listener);
		} finally {
			vi.useRealTimers();
		}
	});

	it('closes on Escape through the host\'s hide()', async () => {
		const el = await mount();
		el.show();
		const hide = vi.spyOn(el, 'hide');
		const cancel = new Event('cancel', { cancelable: true });
		dialogOf(el).dispatchEvent(cancel);
		expect(cancel.defaultPrevented).toBe(true);
		expect(hide).toHaveBeenCalledOnce();
	});

	it('closes when the press and the release are both on the backdrop', async () => {
		const el = await mount();
		el.show();
		gesture(dialogOf(el), [10, 10]);
		expect(dialogOf(el).open).toBe(false);
	});

	it('stays open on a drag between the content and the backdrop', async () => {
		const el = await mount();
		el.show();
		gesture(dialogOf(el), [150, 150], [10, 10]);
		expect(dialogOf(el).open).toBe(true);
		gesture(dialogOf(el), [10, 10], [150, 150]);
		expect(dialogOf(el).open).toBe(true);
	});

	it('stays open on a click without a gesture of its own', async () => {
		const el = await mount();
		el.show();
		gesture(dialogOf(el), [150, 150]);
		dialogOf(el).dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));
		expect(dialogOf(el).open).toBe(true);
	});

	it('stays open on the backdrop when light dismiss is off', async () => {
		const el = await mount({ lightDismiss: () => false });
		el.show();
		gesture(dialogOf(el), [10, 10]);
		expect(dialogOf(el).open).toBe(true);
	});

	it('closes on the dismiss of a title bar inside, and of nothing else', async () => {
		const el = await mount({ titleBarDismiss: true }, '<nldd-top-title-bar text="Filters"></nldd-top-title-bar><span></span>');
		el.show();
		const outer = vi.fn();
		document.body.addEventListener('dismiss', outer);
		el.querySelector('span')!.dispatchEvent(new Event('dismiss', { bubbles: true, composed: true }));
		expect(dialogOf(el).open).toBe(true);
		el.querySelector('nldd-top-title-bar')!.dispatchEvent(new Event('dismiss', { bubbles: true, composed: true }));
		expect(dialogOf(el).open).toBe(false);
		expect(outer).toHaveBeenCalledOnce();
		document.body.removeEventListener('dismiss', outer);
	});

	it('focuses an autofocus element inside, else the dialog', async () => {
		const withInput = await mount({}, '<input autofocus>');
		withInput.show();
		expect(document.activeElement).toBe(withInput.querySelector('input'));
		withInput.hide();
		const bare = await mount();
		bare.show();
		expect(bare.shadowRoot!.activeElement).toBe(dialogOf(bare));
	});

	it('hands focus back to the opener on close', async () => {
		const opener = document.createElement('button');
		document.body.append(opener);
		opener.focus();
		const el = await mount();
		el.show();
		el.hide();
		expect(document.activeElement).toBe(opener);
	});

	it('runs beforeOpen on every open, before the dialog opens', async () => {
		let wasOpen: boolean | null = null;
		const el: TestModalOverlay = await mount({ beforeOpen: () => { wasOpen = dialogOf(el).open; } });
		el.show();
		expect(wasOpen).toBe(false);
	});

	it('waits for the first render to open, and a hide() before it cancels that', async () => {
		options = {};
		const early = document.createElement('test-modal-overlay') as TestModalOverlay;
		document.body.append(early);
		early.show();
		await early.updateComplete;
		await Promise.resolve();
		expect(dialogOf(early).open).toBe(true);

		const cancelled = document.createElement('test-modal-overlay') as TestModalOverlay;
		document.body.append(cancelled);
		cancelled.show();
		cancelled.hide();
		await cancelled.updateComplete;
		await Promise.resolve();
		expect(dialogOf(cancelled).open).toBe(false);
	});
});
