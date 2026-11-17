/**
 * The one place that knows how a control opens an overlay (`nldd-menu`,
 * `nldd-popover`): which overlay it is, where it stands, and how a press turns
 * into open or close.
 *
 * The delicate part is the pointerdown. The browser light-dismisses an open
 * auto popover on pointerdown, before the click lands, so a click handler that
 * only sees "the overlay is closed" opens again what the same gesture just
 * closed (the "flashes closed then reopens" bug). The invoker takes a snapshot
 * on pointerdown, and the click reads it. A manual popover (the bottom sheet of
 * nldd-popover on a small screen) is not dismissed by the press, so there the
 * click closes it.
 *
 * Every control that opens an overlay goes through here: a button with an
 * overlay in its `popup` slot, a term, a token, a menu bar item, the picker
 * button of a combo box. What differs between them is configuration: where the
 * overlay comes from, what it anchors to, and, for a control that does more
 * than open and close, its own open and close.
 */

/** What an overlay tells its invoker. `nldd-menu` and `nldd-popover` both
 *  implement it; another popover element is opened with the Popover API. */
export interface InvokableOverlay extends HTMLElement {
	anchorElement: Element | null;
	/** Whether the overlay is open for its invoker. A drill-in menu counts as
	 *  open while one of its submenus shows and the root itself is hidden. */
	invokerIsOpen?(): boolean;
	/** Opens it as its invoker would: with its own animation and focus. */
	invokerOpen?(): void;
	/** Closes it as its invoker would, including any submenus. */
	invokerClose?(): void;
	/** Whether a press on the trigger opens it again rather than closing it,
	 *  as for a menu still confirming a choice. */
	invokerPressReopens?(): boolean;
	/** The invoker has handled its click: forget a gesture marker kept for it. */
	invokerGestureEnd?(): void;
}

const OVERLAY_SELECTOR = 'nldd-menu, nldd-popover';

export interface OverlayInvokerOptions {
	/** Element the overlay positions against; defaults to the host. A callback,
	 *  so a target that only resolves after the first render still works: call
	 *  `anchor()` once it exists. Return null to leave positioning alone. */
	anchorFor?: () => Element | null;
	/** Runs after the overlay is swapped, for behavior layered on top. */
	onChange?: (overlay: InvokableOverlay | null, previous: InvokableOverlay | null) => void;
	/** Whether the overlay is open for this control. Defaults to whether it is
	 *  open at all; a control that shares its overlay with others (a term)
	 *  counts it open only while it stands at this control. */
	isOpen?: (overlay: InvokableOverlay) => boolean;
	/** Opens the overlay, for a control that does more on open (a combo box
	 *  filters its list first). Defaults to the overlay's own open. */
	open?: (overlay: InvokableOverlay) => void;
	/** Closes the overlay. Defaults to the overlay's own close. */
	close?: (overlay: InvokableOverlay) => void;
}

export function isOverlayOpen(overlay: InvokableOverlay): boolean {
	return overlay.invokerIsOpen ? overlay.invokerIsOpen() : overlay.matches(':popover-open');
}

/** A manual popover stays open on a press outside it, its invoker included. */
function isLightDismissed(overlay: Element): boolean {
	return overlay.getAttribute('popover') !== 'manual';
}

export class OverlayInvoker {
	private _anchorFor: () => Element | null;
	private _options: OverlayInvokerOptions;
	private _overlay: InvokableOverlay | null = null;
	private _wasOpenOnPointerdown = false;

	constructor(host: HTMLElement, options: OverlayInvokerOptions = {}) {
		this._anchorFor = options.anchorFor ?? (() => host);
		this._options = options;
	}

	/** The overlay this control opens, or null. */
	get overlay(): InvokableOverlay | null {
		return this._overlay;
	}

	/** Whether the overlay is open for this control. */
	get isOpen(): boolean {
		return this._overlay ? this._isOpenFor(this._overlay) : false;
	}

	private _isOpenFor(overlay: InvokableOverlay): boolean {
		return this._options.isOpen ? this._options.isOpen(overlay) : isOverlayOpen(overlay);
	}

	/** Bind to a slot's `slotchange`: adopts the first `nldd-menu` or
	 *  `nldd-popover` in it. Flattened, so a component can forward its own slot
	 *  into this one (nldd-split-button hands its popup to the chevron). */
	handleSlotChange = (event: Event): void => {
		const slot = event.target as HTMLSlotElement;
		const overlay = slot.assignedElements({ flatten: true }).find((el) => el.matches(OVERLAY_SELECTOR));
		this.setOverlay((overlay as InvokableOverlay | undefined) ?? null);
	};

	/** Adopt an overlay (or none). Lets go of the previous one first: left
	 *  anchored, a removed overlay keeps positioning against this control and
	 *  writing its state onto it, and the pair can never be collected. */
	setOverlay(overlay: InvokableOverlay | null): void {
		if (overlay === this._overlay) return;
		const previous = this._overlay;
		if (previous && previous.anchorElement === this._anchorFor()) previous.anchorElement = null;
		this._overlay = overlay;
		this._wasOpenOnPointerdown = false;
		this.anchor();
		this._options.onChange?.(overlay, previous);
	}

	/** (Re-)anchor the overlay. Call once the anchor target exists when it
	 *  resolves later than the overlay. */
	anchor(): void {
		const target = this._anchorFor();
		if (this._overlay && target && this._overlay.anchorElement !== target) this._overlay.anchorElement = target;
	}

	/** Bind to the trigger's `pointerdown`. Covers mouse, touch and pen. A press
	 *  inside the overlay is not a press on the trigger, even where the overlay
	 *  sits inside it (a menu in a menu bar item). */
	handlePointerdown = (event?: Event): void => {
		const overlay = this._overlay;
		if (!overlay || event?.composedPath().includes(overlay)) {
			this._wasOpenOnPointerdown = false;
			return;
		}
		this._wasOpenOnPointerdown = this._isOpenFor(overlay) && isLightDismissed(overlay) && !overlay.invokerPressReopens?.();
	};

	/**
	 * Call from the trigger's click handler: opens the overlay, or closes it.
	 * Returns true when there is an overlay, so the click is spent: a popup
	 * control neither submits a form nor navigates.
	 *
	 * Only a pointer-driven click (detail > 0) has a pointerdown before it. A
	 * keyboard click ignores the snapshot, which could be left over from a
	 * gesture that ended without a click (a drag off the control, a scroll).
	 */
	handleClick(event: MouseEvent): boolean {
		const overlay = this._overlay;
		const closedByPress = event.detail > 0 && this._wasOpenOnPointerdown;
		this._wasOpenOnPointerdown = false;
		if (!overlay) return false;
		overlay.invokerGestureEnd?.();
		if (closedByPress) return true;
		if (this._isOpenFor(overlay)) this.close();
		else this.open();
		return true;
	}

	/** Opens the overlay, unless it is open already. */
	open(): void {
		const overlay = this._overlay;
		if (!overlay || this._isOpenFor(overlay)) return;
		this.anchor();
		if (this._options.open) this._options.open(overlay);
		else if (overlay.invokerOpen) overlay.invokerOpen();
		else overlay.showPopover();
	}

	/** Closes the overlay, unless it is closed already. */
	close(): void {
		const overlay = this._overlay;
		if (!overlay || !this._isOpenFor(overlay)) return;
		if (this._options.close) this._options.close(overlay);
		else if (overlay.invokerClose) overlay.invokerClose();
		else overlay.hidePopover();
	}
}

/**
 * Whether `trigger` opens `overlay` as a native popover invoker
 * (`popovertarget` or `popoverTargetElement`). The browser then toggles it as
 * the click's default action, and no script should toggle it again.
 */
export function invokesNatively(trigger: Element, overlay: Element): boolean {
	const named = trigger.getAttribute('popovertarget') ?? (trigger as { popovertarget?: string }).popovertarget;
	if (named && overlay.id && named === overlay.id) return true;
	return (trigger as { popoverTargetElement?: Element | null }).popoverTargetElement === overlay;
}

/**
 * Makes an element outside any design-system control the invoker of
 * `overlay`: a plain `<button>` that an overlay names with `anchor="id"`.
 * Listens on the document, so the element may come and go, and calls the
 * invoker for presses that land on it and not in the overlay. A trigger that
 * is a native invoker of the overlay is left to the browser.
 *
 * Returns the function that stops listening.
 */
export function watchTrigger(invoker: OverlayInvoker, trigger: () => Element | null): () => void {
	const landsOnTrigger = (event: Event): boolean => {
		const overlay = invoker.overlay;
		const element = trigger();
		if (!overlay || !element) return false;
		const path = event.composedPath();
		return path.includes(element) && !path.includes(overlay) && !invokesNatively(element, overlay);
	};
	// Capture, so the snapshot is taken before the browser's light dismiss.
	const onPointerdown = (event: PointerEvent): void => {
		if (landsOnTrigger(event)) invoker.handlePointerdown(event);
	};
	// A click the app called off opens nothing, as with popovertarget.
	const onClick = (event: MouseEvent): void => {
		if (!event.defaultPrevented && landsOnTrigger(event)) invoker.handleClick(event);
	};
	document.addEventListener('pointerdown', onPointerdown, true);
	document.addEventListener('click', onClick);
	return () => {
		document.removeEventListener('pointerdown', onPointerdown, true);
		document.removeEventListener('click', onClick);
	};
}

/** A trigger an overlay writes its state onto: a design-system control
 *  exposes properties for it, a plain element takes ARIA attributes. */
type Trigger = Element & {
	expanded?: boolean;
	popupType?: string;
	popoverTargetAction?: 'toggle' | 'show' | 'hide';
};

export interface TriggerState {
	open: boolean;
	/** The `aria-haspopup` the overlay asks for: 'menu', 'listbox', 'dialog',
	 *  or '' for a disclosure that promises no popup. */
	popupType: string;
	/** The overlay's id, for `aria-controls`. */
	controls?: string;
}

export interface TriggerAriaOptions {
	/** Write ARIA attributes on a trigger that has no properties for it (a
	 *  plain element). Off for a menu: a combo box field anchors its listbox and
	 *  carries its own combobox ARIA. */
	attributes: boolean;
	/** Point a native invoker's `popoverTargetAction` explicitly at what a
	 *  click should do. `toggle` re-reads the state at click time and would
	 *  reopen a menu light-dismissed a moment before. */
	popoverTargetAction?: boolean;
}

/**
 * Writes an overlay's state onto the element it hangs off: expanded, the
 * popup type and the link to the overlay. The overlay says what it is and
 * whether it is open; this decides how a trigger shows that.
 *
 * `aria-haspopup` is set from the first sync, not from the first open: it is
 * a static property of the trigger ("this button opens a menu"), and a screen
 * reader user tabbing a row of identical buttons needs it before anything was
 * opened. A popup type the consumer chose is left alone; one this wrote follows
 * the overlay when it changes.
 */
export class TriggerAria {
	private _trigger: Trigger | null = null;
	private _seededPopupType: string | null = null;

	constructor(private readonly _options: TriggerAriaOptions) {}

	sync(trigger: Element | null, state: TriggerState): void {
		if (trigger !== this._trigger) this._release(state.controls);
		this._trigger = trigger as Trigger | null;
		const element = this._trigger;
		if (!element) return;
		const { attributes } = this._options;

		// A control renders its own aria-expanded from the property, on the real
		// inner button, and flips its expanded visual with it. An attribute on
		// the host would land on the custom element and be gone after a render.
		if ('expanded' in element) element.expanded = state.open;
		else if (attributes) element.setAttribute('aria-expanded', state.open ? 'true' : 'false');

		if ('popupType' in element) {
			if (!element.popupType || element.popupType === this._seededPopupType) {
				element.popupType = state.popupType;
				this._seededPopupType = state.popupType || null;
			}
		} else if (attributes && state.popupType && !element.hasAttribute('aria-haspopup')) {
			element.setAttribute('aria-haspopup', state.popupType);
		}

		if (attributes && state.controls && !element.hasAttribute('aria-controls')) {
			element.setAttribute('aria-controls', state.controls);
		}

		if (this._options.popoverTargetAction && 'popoverTargetAction' in element) {
			element.popoverTargetAction = state.open ? 'hide' : 'show';
		}
	}

	/**
	 * Takes everything off the trigger, for an overlay that leaves the page. In
	 * a single-page app the overlay can go while its trigger stays, and an
	 * `aria-controls` pointing at an element that no longer exists fails WCAG
	 * 4.1.2. A control that keeps its expanded state is reset too, or it stays
	 * stuck in its expanded look.
	 */
	clear(trigger: Element | null, controls: string | undefined): void {
		const element = (trigger ?? this._trigger) as Trigger | null;
		this._trigger = null;
		this._seededPopupType = null;
		if (!element) return;
		if ('expanded' in element) element.expanded = false;
		if (!this._options.attributes) return;
		element.removeAttribute('aria-expanded');
		element.removeAttribute('aria-haspopup');
		if (controls && element.getAttribute('aria-controls') === controls) element.removeAttribute('aria-controls');
	}

	/** Takes the state off a trigger the overlay leaves, so it does not linger
	 *  as a toggle for a screen reader, nor in its expanded look. */
	private _release(controls: string | undefined): void {
		const previous = this._trigger;
		this._trigger = null;
		this._seededPopupType = null;
		if (!previous) return;
		if ('expanded' in previous) {
			previous.expanded = false;
			return;
		}
		if (!this._options.attributes) return;
		previous.removeAttribute('aria-expanded');
		if (controls && previous.getAttribute('aria-controls') === controls) previous.removeAttribute('aria-controls');
	}
}

/**
 * The popover a component's inner button invokes, from `popovertarget` or
 * `popoverTargetElement` on the host.
 *
 * An id written on the inner button is looked up in the component's own
 * shadow root, where the popover never is, so the button opened nothing. The
 * id is looked up here in the tree of the host instead, and the inner button
 * gets the element. The element wins when both are set.
 *
 * Look it up again on click: a popover rendered after the button is not there
 * yet on the button's first render.
 */
export function popoverTargetOf(host: Element, id: string | undefined, element: Element | null): Element | null {
	if (element) return element;
	if (!id) return null;
	const root = host.getRootNode() as Document | ShadowRoot;
	return root.getElementById?.(id) ?? null;
}

type AnchorableOverlay = Element & { anchorElement: Element | null };

/** The overlay each host anchored, so it can let go again. */
const anchoredBy = new WeakMap<Element, AnchorableOverlay>();

/**
 * Positions an `nldd-menu` or `nldd-popover` that `popovertarget` points at
 * against the control that opens it, so the overlay needs no `anchor` of its
 * own. The browser already opens and closes it; this adds where it stands and
 * the ARIA link back to the control, as a slotted overlay gets.
 *
 * An overlay with an `anchor` id, or anchored to another element, is
 * left alone: someone chose where it goes. Pass `null` to let go, as on
 * disconnect or when `popovertarget` changes.
 */
export function anchorPopoverTarget(host: Element, target: Element | null): void {
	const previous = anchoredBy.get(host);
	const next = target?.matches('nldd-menu, nldd-popover') && !target.getAttribute('anchor')
		? target as AnchorableOverlay
		: null;
	if (previous && previous !== next && previous.anchorElement === host) previous.anchorElement = null;
	if (next && (next.anchorElement === null || next.anchorElement === host)) {
		next.anchorElement = host;
		anchoredBy.set(host, next);
	} else {
		anchoredBy.delete(host);
	}
}
