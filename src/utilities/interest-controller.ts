/**
 * Opens a slotted `nldd-popover` on interest in a control instead of on its
 * activation: when the pointer rests on it, when it gets keyboard focus, or on
 * a long press on touch. The control keeps its own click, which is the point:
 * a reaction badge that toggles a reaction can still show who reacted.
 *
 * The counterpart of PopupAnchorController, as the `interest` slot is the
 * counterpart of `popup`, and `interestfor` of `popovertarget` on the platform.
 *
 * The popover becomes a description of the control, like a tooltip with rich
 * content: focus stays where it is, and what it shows is read with the
 * control. What a hover opens cannot be reached with the keyboard, so its
 * content is information only, never a link or a button.
 *
 * The overlay is a child of the host, so the DOM counts the popover as part of
 * the host for pointerenter and pointerleave. Moving from the control onto the
 * popover therefore keeps it open with nothing more than the hide delay to
 * cross the gap between them.
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { NLDDPopover } from '../components/layout/popover/popover.js';
import { isTouchMode } from './input-modality.js';

/** Same rhythm as nldd-tooltip: a pointer passing over does not open it. */
const SHOW_DELAY_MS = 700;
/** Long enough to cross the gap between the control and the popover. */
const HIDE_DELAY_MS = 300;
/** As a long press on iOS and Android. */
const LONG_PRESS_MS = 500;
/** A finger that moves further than this is scrolling, not pressing. */
const LONG_PRESS_SLOP_PX = 10;

export class InterestController implements ReactiveController {
	private _host: ReactiveControllerHost & HTMLElement;
	private _overlay: NLDDPopover | null = null;

	private _hovered = false;
	private _focused = false;
	private _pressed = false;
	/** Escape closed it: hover and focus do not bring it back until both leave. */
	private _dismissed = false;
	/** A long press opened it: the click that ends the press is not an activation. */
	private _swallowClick = false;

	private _showTimer: ReturnType<typeof setTimeout> | null = null;
	private _hideTimer: ReturnType<typeof setTimeout> | null = null;
	private _pressTimer: ReturnType<typeof setTimeout> | null = null;
	private _pressStart: { x: number; y: number } | null = null;

	constructor(host: ReactiveControllerHost & HTMLElement) {
		this._host = host;
		host.addController(this);
	}

	/** The slotted popover, or null when none is slotted. */
	get overlay(): NLDDPopover | null {
		return this._overlay;
	}

	hostConnected(): void {
		const host = this._host;
		host.addEventListener('pointerenter', this._onPointerEnter);
		host.addEventListener('pointerleave', this._onPointerLeave);
		host.addEventListener('focusin', this._onFocusIn);
		host.addEventListener('focusout', this._onFocusOut);
		host.addEventListener('pointerdown', this._onPointerDown);
		host.addEventListener('pointermove', this._onPointerMove);
		host.addEventListener('pointerup', this._cancelPress);
		host.addEventListener('pointercancel', this._cancelPress);
		host.addEventListener('contextmenu', this._onContextMenu);
		// Capture: the click has to be stopped before the control acts on it.
		host.addEventListener('click', this._onClick, true);
	}

	hostDisconnected(): void {
		const host = this._host;
		host.removeEventListener('pointerenter', this._onPointerEnter);
		host.removeEventListener('pointerleave', this._onPointerLeave);
		host.removeEventListener('focusin', this._onFocusIn);
		host.removeEventListener('focusout', this._onFocusOut);
		host.removeEventListener('pointerdown', this._onPointerDown);
		host.removeEventListener('pointermove', this._onPointerMove);
		host.removeEventListener('pointerup', this._cancelPress);
		host.removeEventListener('pointercancel', this._cancelPress);
		host.removeEventListener('contextmenu', this._onContextMenu);
		host.removeEventListener('click', this._onClick, true);
		this._reset();
		this._listenWhileOpen(false);
	}

	/** Bind to the interest slot's `slotchange`. */
	handleSlotChange = (event: Event): void => {
		const slot = event.target as HTMLSlotElement;
		const overlay = (slot.assignedElements({ flatten: true }).find((el) => el.matches('nldd-popover')) as NLDDPopover | undefined) ?? null;
		this.setOverlay(overlay);
	};

	setOverlay(overlay: NLDDPopover | null): void {
		if (overlay === this._overlay) return;
		const previous = this._overlay;
		if (previous) {
			previous.removeEventListener('close', this._onOverlayClose);
			previous._interest = false;
			if (previous.anchorElement === this._host) previous.anchorElement = null;
		}
		this._reset();
		this._overlay = overlay;
		if (overlay) {
			// Before the anchor: the popover reads it when it sets up the anchor.
			overlay._interest = true;
			overlay.anchorElement = this._host;
			overlay.addEventListener('close', this._onOverlayClose);
		}
		// The host describes its control with the popover: by element, since
		// the control sits in a shadow root where an id would not find it.
		this._host.requestUpdate();
	}

	// — Open and close ————————————————————————————————————————————————————————

	private get _wanted(): boolean {
		return !this._dismissed && (this._hovered || this._focused || this._pressed);
	}

	private get _isOpen(): boolean {
		return this._overlay?.matches(':popover-open') ?? false;
	}

	private get _disabled(): boolean {
		return Boolean((this._host as HTMLElement & { disabled?: boolean }).disabled);
	}

	/** Another overlay of this control is open (the menu in its popup slot):
	 *  that one has the user's attention. */
	private get _otherOverlayOpen(): boolean {
		return Array.from(this._host.children).some((child) => child !== this._overlay
			&& child.matches('nldd-menu, nldd-popover') && child.matches(':popover-open'));
	}

	private _update(): void {
		this._clearTimer('_hideTimer');
		if (this._wanted) {
			if (this._isOpen || this._otherOverlayOpen) return;
			this._overlay?.show();
			this._listenWhileOpen(true);
		} else if (this._isOpen) {
			this._overlay?.hide();
		}
	}

	private _scheduleHide(): void {
		this._clearTimer('_hideTimer');
		this._hideTimer = setTimeout(() => {
			this._hideTimer = null;
			this._update();
		}, HIDE_DELAY_MS);
	}

	private _close(): void {
		this._hovered = false;
		this._focused = false;
		this._pressed = false;
		this._clearTimer('_showTimer');
		this._update();
	}

	private _reset(): void {
		this._hovered = false;
		this._focused = false;
		this._pressed = false;
		this._dismissed = false;
		this._swallowClick = false;
		this._clearTimer('_showTimer');
		this._clearTimer('_hideTimer');
		this._clearTimer('_pressTimer');
	}

	private _clearTimer(name: '_showTimer' | '_hideTimer' | '_pressTimer'): void {
		const timer = this[name];
		if (timer) clearTimeout(timer);
		this[name] = null;
	}

	private _listenWhileOpen(on: boolean): void {
		const method = on ? 'addEventListener' : 'removeEventListener';
		// On the document: focus is not in the popover, so a listener on it
		// would never hear the Escape that WCAG 1.4.13 asks for.
		document[method]('keydown', this._onDocumentKeydown as EventListener, true);
		document[method]('pointerdown', this._onDocumentPointerdown as EventListener, true);
	}

	private _onOverlayClose = (): void => {
		this._listenWhileOpen(false);
		// Closed another way (the backdrop of the bottom sheet): start over.
		this._hovered = false;
		this._pressed = false;
		this._clearTimer('_hideTimer');
	};

	// — Hover ———————————————————————————————————————————————————————————————

	private _onPointerEnter = (event: PointerEvent): void => {
		if (!this._overlay || event.pointerType === 'touch' || this._disabled) return;
		this._clearTimer('_hideTimer');
		if (this._hovered) return;
		// Back from the gap onto the popover, or onto the control while it shows.
		if (this._isOpen) {
			this._hovered = true;
			return;
		}
		this._clearTimer('_showTimer');
		this._showTimer = setTimeout(() => {
			this._showTimer = null;
			this._hovered = true;
			this._update();
		}, SHOW_DELAY_MS);
	};

	private _onPointerLeave = (event: PointerEvent): void => {
		if (event.pointerType === 'touch') return;
		this._clearTimer('_showTimer');
		this._dismissed = this._dismissed && this._focused;
		if (!this._hovered) return;
		this._hovered = false;
		if (!this._wanted) this._scheduleHide();
	};

	// — Focus ———————————————————————————————————————————————————————————————

	private _onFocusIn = (): void => {
		// A tap focuses a button on some platforms; that is no keyboard intent.
		if (!this._overlay || this._focused || isTouchMode() || this._disabled) return;
		this._focused = true;
		this._update();
	};

	private _onFocusOut = (event: FocusEvent): void => {
		const related = event.relatedTarget as Node | null;
		if (related && (this._host.contains(related) || this._host.shadowRoot?.contains(related))) return;
		this._focused = false;
		this._dismissed = this._dismissed && this._hovered;
		this._update();
	};

	// — Long press ————————————————————————————————————————————————————————————

	private _onPointerDown = (event: PointerEvent): void => {
		if (!this._overlay || event.pointerType !== 'touch' || this._disabled) return;
		if (this._overlay.contains(event.target as Node)) return;
		this._swallowClick = false;
		this._pressStart = { x: event.clientX, y: event.clientY };
		this._clearTimer('_pressTimer');
		this._pressTimer = setTimeout(() => {
			this._pressTimer = null;
			this._pressStart = null;
			this._swallowClick = true;
			this._dismissed = false;
			this._pressed = true;
			this._update();
		}, LONG_PRESS_MS);
	};

	private _onPointerMove = (event: PointerEvent): void => {
		if (!this._pressStart) return;
		const dx = event.clientX - this._pressStart.x;
		const dy = event.clientY - this._pressStart.y;
		if (Math.hypot(dx, dy) > LONG_PRESS_SLOP_PX) this._cancelPress();
	};

	private _cancelPress = (): void => {
		this._clearTimer('_pressTimer');
		this._pressStart = null;
	};

	/** Android opens the context menu on a long press, and iOS a link preview. */
	private _onContextMenu = (event: Event): void => {
		if (this._pressTimer || this._swallowClick) event.preventDefault();
	};

	// — Activation ——————————————————————————————————————————————————————————

	private _onClick = (event: MouseEvent): void => {
		if (!this._overlay) return;
		// A click inside the popover is no activation of the control, though the
		// popover is its child in the DOM.
		if (event.composedPath().includes(this._overlay)) return;
		if (this._swallowClick) {
			this._swallowClick = false;
			event.preventDefault();
			event.stopImmediatePropagation();
			return;
		}
		// The control does what it does; the description has served its purpose,
		// and would otherwise stay on top of what the click opened.
		this._close();
	};

	// — While open ————————————————————————————————————————————————————————————

	private _onDocumentKeydown = (event: KeyboardEvent): void => {
		if (event.key !== 'Escape' || !this._isOpen) return;
		// The key stops here: in a dialog, the first press takes the popover and
		// the second the dialog.
		event.preventDefault();
		event.stopPropagation();
		this._dismissed = true;
		this._pressed = false;
		this._update();
	};

	private _onDocumentPointerdown = (event: PointerEvent): void => {
		if (!this._isOpen) return;
		if (event.composedPath().includes(this._host)) return;
		this._close();
	};
}
