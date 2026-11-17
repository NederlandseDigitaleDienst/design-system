import { describe, it, expect, afterEach, vi } from 'vitest';
import { invokesNatively, OverlayInvoker, TriggerAria, watchTrigger, type InvokableOverlay } from './overlay-invoker.js';

const press = (el: Element) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
const pointerClick = () => new MouseEvent('click', { bubbles: true, composed: true, detail: 1 });
const keyboardClick = () => new MouseEvent('click', { bubbles: true, composed: true, detail: 0 });

let cleanups: (() => void)[] = [];
afterEach(() => {
	for (const cleanup of cleanups) cleanup();
	cleanups = [];
	document.body.replaceChildren();
});

/** A trigger and a plain auto popover, as the browser has them. */
function setup(mode: 'auto' | 'manual' = 'auto') {
	const trigger = document.createElement('button');
	trigger.textContent = 'Acties';
	const overlay = document.createElement('div') as unknown as InvokableOverlay;
	overlay.setAttribute('popover', mode);
	overlay.anchorElement = null;
	document.body.append(trigger, overlay);
	cleanups.push(() => overlay.matches(':popover-open') && overlay.hidePopover());
	const invoker = new OverlayInvoker(trigger);
	invoker.setOverlay(overlay);
	return { trigger, overlay, invoker };
}

describe('OverlayInvoker', () => {
	it('anchors the overlay to its host and lets go of it again', () => {
		const { trigger, overlay, invoker } = setup();
		expect(overlay.anchorElement).toBe(trigger);
		invoker.setOverlay(null);
		expect(overlay.anchorElement).toBeNull();
	});

	it('opens on a click and closes on the next', () => {
		const { overlay, invoker } = setup();
		invoker.handleClick(keyboardClick());
		expect(overlay.matches(':popover-open')).toBe(true);
		invoker.handleClick(keyboardClick());
		expect(overlay.matches(':popover-open')).toBe(false);
	});

	it('does not reopen what the same press closed', () => {
		const { trigger, overlay, invoker } = setup();
		overlay.showPopover();
		invoker.handlePointerdown(new PointerEvent('pointerdown'));
		press(trigger);
		// The browser light-dismisses on that press, before the click.
		overlay.hidePopover();
		expect(invoker.handleClick(pointerClick())).toBe(true);
		expect(overlay.matches(':popover-open')).toBe(false);
	});

	it('ignores a snapshot left by a press that never became a click on a keyboard click', () => {
		const { overlay, invoker } = setup();
		overlay.showPopover();
		invoker.handlePointerdown(new PointerEvent('pointerdown'));
		overlay.hidePopover();
		invoker.handleClick(keyboardClick());
		expect(overlay.matches(':popover-open')).toBe(true);
	});

	it('closes a manual popover on a press of its trigger, which the browser leaves open', () => {
		const { overlay, invoker } = setup('manual');
		overlay.showPopover();
		invoker.handlePointerdown(new PointerEvent('pointerdown'));
		invoker.handleClick(pointerClick());
		expect(overlay.matches(':popover-open')).toBe(false);
	});

	it('takes a press inside the overlay for no press on the trigger', () => {
		const { overlay, invoker } = setup();
		const inside = document.createElement('span');
		overlay.append(inside);
		overlay.showPopover();
		const event = new PointerEvent('pointerdown', { bubbles: true, composed: true });
		inside.addEventListener('pointerdown', (e) => invoker.handlePointerdown(e), { once: true });
		inside.dispatchEvent(event);
		// No snapshot, so this click toggles as usual: it closes.
		invoker.handleClick(pointerClick());
		expect(overlay.matches(':popover-open')).toBe(false);
	});

	it('returns false without an overlay, so the control falls through', () => {
		const invoker = new OverlayInvoker(document.createElement('button'));
		expect(invoker.handleClick(pointerClick())).toBe(false);
	});

	it('uses the open and close a control gives it', () => {
		const trigger = document.createElement('button');
		const overlay = document.createElement('div') as unknown as InvokableOverlay;
		overlay.setAttribute('popover', 'auto');
		document.body.append(trigger, overlay);
		const open = vi.fn((o: InvokableOverlay) => o.showPopover());
		const close = vi.fn((o: InvokableOverlay) => o.hidePopover());
		const invoker = new OverlayInvoker(trigger, { open, close });
		invoker.setOverlay(overlay);
		invoker.handleClick(keyboardClick());
		invoker.handleClick(keyboardClick());
		expect(open).toHaveBeenCalledTimes(1);
		expect(close).toHaveBeenCalledTimes(1);
	});

	it('counts an overlay open elsewhere as closed when the control says so', () => {
		const { overlay } = setup();
		const other = document.createElement('button');
		document.body.append(other);
		overlay.anchorElement = other;
		overlay.showPopover();
		const mine = document.createElement('button');
		document.body.append(mine);
		const invoker = new OverlayInvoker(mine, {
			anchorFor: () => null,
			isOpen: (o) => o.matches(':popover-open') && o.anchorElement === mine,
			open: (o) => {
				if (o.matches(':popover-open')) o.hidePopover();
				o.anchorElement = mine;
				o.showPopover();
			},
		});
		invoker.setOverlay(overlay);
		invoker.handlePointerdown(new PointerEvent('pointerdown'));
		invoker.handleClick(pointerClick());
		expect(overlay.matches(':popover-open')).toBe(true);
		expect(overlay.anchorElement).toBe(mine);
	});

	it('uses the overlay\'s own open state, close and gesture end', () => {
		const { overlay, invoker } = setup();
		const close = vi.fn();
		const gestureEnd = vi.fn();
		overlay.invokerIsOpen = () => true;
		overlay.invokerClose = close;
		overlay.invokerGestureEnd = gestureEnd;
		invoker.handleClick(keyboardClick());
		expect(gestureEnd).toHaveBeenCalled();
		expect(close).toHaveBeenCalled();
	});

	it('reopens on a press while the overlay says a press reopens it', () => {
		const { overlay, invoker } = setup();
		overlay.showPopover();
		overlay.invokerPressReopens = () => true;
		invoker.handlePointerdown(new PointerEvent('pointerdown'));
		overlay.hidePopover();
		invoker.handleClick(pointerClick());
		expect(overlay.matches(':popover-open')).toBe(true);
	});
});

describe('watchTrigger', () => {
	it('makes a plain element a toggle for the overlay', () => {
		const { trigger, overlay } = setup();
		const invoker = new OverlayInvoker(overlay, { anchorFor: () => null });
		invoker.setOverlay(overlay);
		cleanups.push(watchTrigger(invoker, () => trigger));
		trigger.click();
		expect(overlay.matches(':popover-open')).toBe(true);
		trigger.click();
		expect(overlay.matches(':popover-open')).toBe(false);
	});

	it('opens nothing on a click the app called off', () => {
		const { trigger, overlay } = setup();
		const invoker = new OverlayInvoker(overlay, { anchorFor: () => null });
		invoker.setOverlay(overlay);
		cleanups.push(watchTrigger(invoker, () => trigger));
		trigger.addEventListener('click', (event) => event.preventDefault());
		trigger.click();
		expect(overlay.matches(':popover-open')).toBe(false);
	});

	it('leaves a native invoker to the browser', () => {
		const { trigger, overlay } = setup();
		const open = vi.fn();
		const invoker = new OverlayInvoker(overlay, { anchorFor: () => null, open });
		invoker.setOverlay(overlay);
		trigger.popoverTargetElement = overlay;
		cleanups.push(watchTrigger(invoker, () => trigger));
		trigger.dispatchEvent(keyboardClick());
		expect(open).not.toHaveBeenCalled();
	});

	it('stops listening when asked', () => {
		const { trigger, overlay } = setup();
		const invoker = new OverlayInvoker(overlay, { anchorFor: () => null });
		invoker.setOverlay(overlay);
		watchTrigger(invoker, () => trigger)();
		trigger.click();
		expect(overlay.matches(':popover-open')).toBe(false);
	});
});

describe('invokesNatively', () => {
	it('knows a trigger that names the overlay by id or by element', () => {
		const overlay = document.createElement('div');
		overlay.id = 'acties';
		const byId = document.createElement('button');
		byId.setAttribute('popovertarget', 'acties');
		const byElement = document.createElement('button');
		// The browser only reflects an element that is in the same tree.
		overlay.setAttribute('popover', '');
		document.body.append(overlay, byElement);
		byElement.popoverTargetElement = overlay;
		expect(invokesNatively(byId, overlay)).toBe(true);
		expect(invokesNatively(byElement, overlay)).toBe(true);
		expect(invokesNatively(document.createElement('button'), overlay)).toBe(false);
	});
});

describe('TriggerAria', () => {
	it('writes attributes on a plain element and takes them off when it leaves', () => {
		const aria = new TriggerAria({ attributes: true });
		const first = document.createElement('span');
		const second = document.createElement('span');
		aria.sync(first, { open: true, popupType: 'dialog', controls: 'uitleg' });
		expect(first.getAttribute('aria-expanded')).toBe('true');
		expect(first.getAttribute('aria-haspopup')).toBe('dialog');
		expect(first.getAttribute('aria-controls')).toBe('uitleg');
		aria.sync(second, { open: false, popupType: 'dialog', controls: 'uitleg' });
		expect(first.hasAttribute('aria-expanded')).toBe(false);
		expect(first.hasAttribute('aria-controls')).toBe(false);
		expect(second.getAttribute('aria-expanded')).toBe('false');
	});

	it('writes nothing on a plain element without attributes', () => {
		const aria = new TriggerAria({ attributes: false });
		const field = document.createElement('div');
		aria.sync(field, { open: true, popupType: 'listbox' });
		expect(field.attributes.length).toBe(0);
	});

	it('sets the properties of a control, and follows a popup type it wrote but not one the consumer chose', () => {
		const aria = new TriggerAria({ attributes: false, popoverTargetAction: true });
		const control = Object.assign(document.createElement('div'), { expanded: false, popupType: '', popoverTargetAction: 'toggle' });
		aria.sync(control, { open: true, popupType: 'menu' });
		expect(control.expanded).toBe(true);
		expect(control.popupType).toBe('menu');
		expect(control.popoverTargetAction).toBe('hide');
		aria.sync(control, { open: false, popupType: 'listbox' });
		expect(control.popupType).toBe('listbox');
		expect(control.popoverTargetAction).toBe('show');

		const chosen = Object.assign(document.createElement('div'), { expanded: false, popupType: 'dialog' });
		aria.sync(chosen, { open: false, popupType: 'menu' });
		expect(chosen.popupType).toBe('dialog');
	});

	it('takes the expanded state off a control the overlay moves away from', () => {
		const aria = new TriggerAria({ attributes: false });
		const first = Object.assign(document.createElement('div'), { expanded: false, popupType: '' });
		const second = Object.assign(document.createElement('div'), { expanded: false, popupType: '' });
		aria.sync(first, { open: true, popupType: 'menu' });
		aria.sync(second, { open: true, popupType: 'menu' });
		expect(first.expanded).toBe(false);
		expect(second.expanded).toBe(true);
	});

	it('clears everything from a trigger whose overlay leaves the page', () => {
		const aria = new TriggerAria({ attributes: true });
		const trigger = document.createElement('span');
		aria.sync(trigger, { open: true, popupType: 'dialog', controls: 'uitleg' });
		aria.clear(trigger, 'uitleg');
		expect(trigger.hasAttribute('aria-expanded')).toBe(false);
		expect(trigger.hasAttribute('aria-haspopup')).toBe(false);
		expect(trigger.hasAttribute('aria-controls')).toBe(false);
	});
});
