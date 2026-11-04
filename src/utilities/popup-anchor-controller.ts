/**
 * Shared wiring for a control that invokes a slotted overlay (`nldd-menu` /
 * `nldd-popover`): it adopts the overlay from a slot, anchors it, and turns the
 * control's clicks into open/close.
 *
 * A controller rather than a mixin, because the parts that differ between
 * nldd-button, nldd-icon-button and nldd-split-button are configuration, not
 * subclassing: the anchor target (the host, or an inner wrapper) is a callback,
 * and the click handling is a method the control calls from its own handler,
 * which then falls through to its own form / link / event behavior. Split-button
 * layers `toggle` tracking on top via `onChange`, which composition allows and
 * inheritance would fight.
 *
 * The delicate part it centralises is the pointerdown snapshot. The browser
 * light-dismisses an open popover on pointerdown, which is *before* the click
 * lands, so a click handler that only sees "the overlay is closed" would
 * immediately re-open what the same gesture just dismissed (the "flashes closed
 * then reopens" bug). Snapshotting on pointerdown keeps the two apart.
 */
import type { NLDDMenu } from '../components/actions/menu/menu.js';
import type { NLDDPopover } from '../components/layout/popover/popover.js';

/** A floating overlay a control can anchor and toggle from a slot. Both expose
 *  `anchorElement` and bail on their own anchor-click toggle once it is set, so
 *  the control drives them uniformly via showPopover(). */
export type Overlay = (NLDDMenu | NLDDPopover) & { anchorElement: Element | null };

const OVERLAY_SELECTOR = 'nldd-menu, nldd-popover';

export interface PopupAnchorOptions {
	/** Element the overlay positions against; defaults to the host. A callback,
	 *  so a target that only resolves after the first render (an inner element
	 *  behind @query) still works — call `anchor()` once it exists. */
	anchorFor?: () => Element | null;
	/** Runs after the slotted overlay is swapped, for behavior layered on top
	 *  (e.g. tracking `toggle` to drive a chevron's expanded state). */
	onChange?: (overlay: Overlay | null, previous: Overlay | null) => void;
}

export class PopupAnchorController {
	private _anchorFor: () => Element | null;
	private _onChange?: (overlay: Overlay | null, previous: Overlay | null) => void;
	private _overlay: Overlay | null = null;
	private _wasOpenOnPointerdown = false;

	constructor(host: HTMLElement, options: PopupAnchorOptions = {}) {
		this._anchorFor = options.anchorFor ?? (() => host);
		this._onChange = options.onChange;
	}

	/** The slotted overlay, or null when none is slotted. */
	get overlay(): Overlay | null {
		return this._overlay;
	}

	/** Bind to the popup slot's `slotchange`. */
	handleSlotChange = (event: Event): void => {
		const slot = event.target as HTMLSlotElement;
		// Flattened, so a component can forward its own slot into this one
		// (nldd-split-button hands its popup to the chevron this way).
		const overlay = (slot.assignedElements({ flatten: true }).find((el) => el.matches(OVERLAY_SELECTOR)) as Overlay | undefined) ?? null;
		this.setOverlay(overlay);
	};

	/** Adopt an overlay (or none). Releases the previous one first: left
	 *  anchored, a removed overlay keeps positioning against this control and
	 *  syncing `expanded` onto it, and the pair can never be collected. */
	setOverlay(overlay: Overlay | null): void {
		if (overlay === this._overlay) return;
		const previous = this._overlay;
		if (previous) previous.anchorElement = null;
		this._overlay = overlay;
		this.anchor();
		this._onChange?.(overlay, previous);
	}

	/** (Re-)anchor the current overlay. Call once the anchor target exists when
	 *  it resolves later than the first `slotchange`. */
	anchor(): void {
		const target = this._anchorFor();
		if (this._overlay && target) this._overlay.anchorElement = target;
	}

	/** Bind to the invoker's `pointerdown`. Snapshots the open state before the
	 *  browser's light-dismiss runs. Covers mouse, touch and pen — `mousedown`
	 *  alone would skip touch, where no mousedown precedes the synthetic click. */
	handlePointerdown = (): void => {
		const overlay = this._overlay;
		if (!overlay) {
			this._wasOpenOnPointerdown = false;
			return;
		}
		this._wasOpenOnPointerdown = '_shownForInvoker' in overlay ? overlay._shownForInvoker() : overlay.matches(':popover-open');
	};

	/** Call from the control's click handler. Returns true when the click was
	 *  consumed (an overlay is slotted, so the control is its invoker and
	 *  neither submits a form nor navigates); false to fall through. */
	handleClick(event: MouseEvent): boolean {
		if (!this._overlay) return false;
		// Only a pointer-driven click (detail > 0) has a preceding pointerdown; a
		// keyboard click must ignore the snapshot, which would otherwise be left
		// over from an earlier gesture that ended without a click (drag off the
		// control, touch scroll) and swallow the activation. The :popover-open
		// guard keeps showPopover() from throwing on an already-open overlay.
		const wasOpen = event.detail > 0 && this._wasOpenOnPointerdown;
		this._wasOpenOnPointerdown = false;
		if ('_endInvokerGesture' in this._overlay) this._overlay._endInvokerGesture();
		if (!wasOpen && !this._overlay.matches(':popover-open')) this._overlay.showPopover();
		return true;
	}
}
