import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { NLDDMenuItem } from './menu-item.js';

/** How far a finger moves before a press counts as a scroll. */
export const TOUCH_SCROLL_THRESHOLD_PX = 8;

/**
 * The menu-item under a point, piercing shadow boundaries.
 * `document.elementFromPoint` stops at the outermost shadow host, so a menu
 * nested inside another component's shadow DOM (nldd-split-button, say) would
 * resolve to that host and never find the item. Descending the shadow roots
 * restores it and is a no-op for light-DOM menus.
 */
export function menuItemFromPoint(x: number, y: number): NLDDMenuItem | null {
	let root: Document | ShadowRoot = document;
	// A backstop against pathologically deep shadow nesting; real menus are at
	// most a few roots deep.
	const MAX_PIERCE_DEPTH = 20;
	for (let depth = 0; depth < MAX_PIERCE_DEPTH; depth++) {
		const el: Element | null = root.elementFromPoint(x, y);
		if (!el) return null;
		const item = el.closest('nldd-menu-item') as NLDDMenuItem | null;
		if (item) return item;
		if (!el.shadowRoot) return null;
		root = el.shadowRoot;
	}
	return null;
}

/** What the gestures need from their menu. */
export interface MenuPointerHost extends ReactiveControllerHost, HTMLElement {
	/** Whether the menu is open now. */
	readonly _isMenuOpen: boolean;
}

/**
 * The pointer gestures of a menu, each with its own coordinates and listeners:
 *
 * 1. **Press, drag and release.** A native `<select>` lets you press on one
 *    option, drag to another and release to pick that one. Click events don't
 *    fire across two elements, so the release is caught on document and, when
 *    it lands on another enabled item, that item is selected. The click on the
 *    pressed item still owns a press without a drag.
 * 2. **No press flash while scrolling.** On touch, pressing an item sets
 *    :active and the sticky :hover lands on it, so the press highlight shows.
 *    When the gesture turns into a scroll of a cramped menu, :active lingers
 *    until the browser recognizes the pan. Past the threshold the host gets
 *    `scroll-active`, and the styles drop the press highlight while it is set.
 *    A tap never moves that far, so it keeps its brief feedback.
 * 3. **A tap beside the menu.** An outside touch is also how a page scroll
 *    begins, so the menu only hears of it once the finger lifts without
 *    having moved past the threshold.
 */
export class MenuPointerController implements ReactiveController {
	private _pressedItem: NLDDMenuItem | null = null;
	private _touchStart = { x: 0, y: 0 };
	private _outsideStart = { x: 0, y: 0 };
	private _onOutsideTap: (() => void) | null = null;

	constructor(private readonly _host: MenuPointerHost) {
		_host.addController(this);
	}

	hostConnected(): void {
		this._host.addEventListener('pointerdown', this._handlePointerdown);
	}

	hostDisconnected(): void {
		this._host.removeEventListener('pointerdown', this._handlePointerdown);
		document.removeEventListener('pointerup', this._handleRelease, true);
		this._pressedItem = null;
		this.stopOutsideTap();
	}

	// 1. Press, drag and release.

	private _handlePointerdown = (event: PointerEvent): void => {
		if (event.button !== 0) return;
		const item = (event.target as Element | null)?.closest('nldd-menu-item') as NLDDMenuItem | null;
		if (!item || item.disabled) return;
		this._pressedItem = item;
		document.addEventListener('pointerup', this._handleRelease, { capture: true, once: true });
	};

	private _handleRelease = (event: PointerEvent): void => {
		const pressed = this._pressedItem;
		this._pressedItem = null;
		// The menu may have closed in between (light-dismiss, a shortcut), and
		// the point could then be an item of another menu that just opened.
		if (!pressed || !this._host._isMenuOpen) return;
		const released = menuItemFromPoint(event.clientX, event.clientY);
		if (!released || released === pressed || released.disabled) return;
		// The browser dispatches no click when press and release land on two
		// targets, so there is no double select to suppress.
		released._handleClick();
	};

	// 2. No press flash while scrolling. Bound in the template on `.menu`.

	/** @internal */
	touchStart = (event: TouchEvent): void => {
		const t = event.touches[0];
		if (!t) return;
		this._touchStart = { x: t.clientX, y: t.clientY };
		this._host.removeAttribute('scroll-active');
	};

	/** @internal */
	touchMove = (event: TouchEvent): void => {
		if (this._host.hasAttribute('scroll-active')) return;
		const t = event.touches[0];
		if (!t) return;
		if (Math.hypot(t.clientX - this._touchStart.x, t.clientY - this._touchStart.y) > TOUCH_SCROLL_THRESHOLD_PX) {
			this._host.setAttribute('scroll-active', '');
		}
	};

	/** @internal */
	touchEnd = (): void => {
		this._host.removeAttribute('scroll-active');
	};

	// 3. A tap beside the menu.

	/** Follow a touch that started outside the menu, and call `onTap` once it
	 *  ends as a tap. A scroll in between drops it. */
	trackOutsideTap(event: PointerEvent, onTap: () => void): void {
		this.stopOutsideTap();
		this._outsideStart = { x: event.clientX, y: event.clientY };
		this._onOutsideTap = onTap;
		document.addEventListener('pointermove', this._handleOutsideMove, true);
		document.addEventListener('pointerup', this._handleOutsideEnd, true);
		document.addEventListener('pointercancel', this._handleOutsideCancel, true);
	}

	stopOutsideTap(): void {
		this._onOutsideTap = null;
		document.removeEventListener('pointermove', this._handleOutsideMove, true);
		document.removeEventListener('pointerup', this._handleOutsideEnd, true);
		document.removeEventListener('pointercancel', this._handleOutsideCancel, true);
	}

	private _handleOutsideMove = (e: PointerEvent): void => {
		if (Math.hypot(e.clientX - this._outsideStart.x, e.clientY - this._outsideStart.y) > TOUCH_SCROLL_THRESHOLD_PX) {
			this.stopOutsideTap();
		}
	};

	private _handleOutsideEnd = (): void => {
		const onTap = this._onOutsideTap;
		this.stopOutsideTap();
		onTap?.();
	};

	private _handleOutsideCancel = (): void => {
		this.stopOutsideTap();
	};
}
