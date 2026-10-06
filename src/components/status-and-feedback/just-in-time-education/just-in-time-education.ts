/**
 * Nederlandse Digitale Dienst Just in Time Education Component (Lit + TypeScript)
 *
 * A guided-discovery coach mark. Put a control (nldd-search-field, for
 * instance) in the default slot. While `active` is set, the component lifts a
 * callout (title + supporting text + dismiss) into the top layer through the
 * Popover API (`popover="manual"`), anchored to the control with Floating UI.
 * No backdrop, non-modal: the background stays interactive. The control itself
 * stays where it is in the flow.
 *
 * With `dismissable` the component manages closing and fires nldd-close:
 *  - the user performs the suggested interaction on the control -> close{completed}
 *  - the dismiss button -> close{dismissed}
 *  - a click or key press OUTSIDE the coach mark -> close{ignored}
 * Without `dismissable` nothing closes by itself (no button, no outside or slot
 * click); the consumer then decides when to close through `active` or
 * `complete()`. `complete()` always works and closes with close{completed}, for
 * example only once a real search has been submitted.
 *
 * @element nldd-just-in-time-education
 * @attr {boolean} active - Show the coach mark. Driven by the app; false by default.
 * @attr {string} text - Title of the callout.
 * @attr {string} supporting-text - Supporting text under the title.
 * @attr {string} placement - 'auto' | 'top' | 'bottom' | 'left' | 'right' (default 'auto').
 * @attr {boolean} dismissable - Show the dismiss button and allow closing with one click or key press outside the coach mark. False by default: the consumer then manages closing itself.
 * @attr {string} arrow-length - Arrow length, and therefore the distance between card and control, as a CSS length (e.g. `333px`, `30vh`). Empty = the DS default; anything under 40px is clamped.
 * @attr {boolean} no-arrow - Hide the arrow; the card then sits close against the control.
 *
 * @slot - The control the coach mark points at (stays in the normal flow).
 *
 * @fires nldd-close - When the coach mark closes. detail: { reason: 'completed' | 'dismissed' | 'ignored' }.
 *
 * @note Renders through the native Popover API (`popover="manual"`) in the top
 * layer, so it escapes ancestor stacking contexts and `overflow: hidden`
 * clipping. Positioned with Floating UI using `position: absolute` (the default
 * strategy) plus `autoUpdate`: the callout sits in the document flow and
 * scrolls along natively with the page, so scrolling needs no repositioning.
 * The side is picked from the available room (the viewport horizontally, the
 * whole document vertically) on open and on window resize.
 *
 * @note Focus model (dismissable): the callout is a deliberately NON-modal
 * dialog (`role="dialog"`, no `aria-modal`, no focus trap). On open, focus moves
 * into it so the dismiss button is reachable and Escape closes. Tab then leaves
 * the callout on purpose, because the coach mark points at a control the user
 * has to be able to reach, so holding focus would defeat the point.
 * Non-dismissable uses a named `role="region"` (aria-label = the title) and
 * never moves focus; the polite live region announces the tip.
 */

import { LitElement } from 'lit';
import type { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { computePosition, autoUpdate, offset, shift } from '@floating-ui/dom';
import { withTranslations } from '../../../utilities/with-translations.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { isPointerMode } from '../../../utilities/input-modality.js';
import { justInTimeEducationStyles } from './just-in-time-education.styles.js';
import { justInTimeEducationTemplate } from './just-in-time-education.template.js';
import { nlddJustInTimeEducationTranslations } from './just-in-time-education.i18n.js';
import type { NLDDJustInTimeEducationTranslations } from './just-in-time-education.i18n.js';
import '../../actions/icon-button/icon-button.js';

type Placement = 'auto' | 'top' | 'bottom' | 'left' | 'right';
export type JustInTimeEducationCloseReason = 'completed' | 'dismissed' | 'ignored';

let jiteCounter = 0;

@customElement('nldd-just-in-time-education')
export class NLDDJustInTimeEducation extends withTranslations<NLDDJustInTimeEducationTranslations>(LitElement, nlddJustInTimeEducationTranslations) {
	static override styles = justInTimeEducationStyles;

	// Attributes the component owns itself; every OTHER attribute set on the host
	// is forwarded to the slotted control so the wrapper stays transparent to
	// parent-driven attributes (e.g. the `size` an nldd-toolbar pushes onto its
	// direct child). Structural attributes (style/class/id/slot/hidden) and the
	// internal data-arrow-side deliberately stay on the host.
	private static readonly _ownAttributes = new Set([
		'active', 'text', 'supporting-text', 'placement', 'dismissable', 'arrow-length', 'no-arrow', 'translations',
		'data-arrow-side', 'data-arrow-collapsed', 'style', 'class', 'id', 'role', 'slot', 'hidden',
	]);

	@property({ type: Boolean, reflect: true })
	active = false;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ reflect: true, converter: reflectNonDefault<Placement>('auto') })
	placement: Placement = 'auto';

	@property({ type: Boolean, reflect: true })
	dismissable = false;

	@property({ type: String, reflect: true, attribute: 'arrow-length' })
	arrowLength = '';

	@property({ type: Boolean, reflect: true, attribute: 'no-arrow' })
	noArrow = false;

	private _cleanupAutoUpdate: (() => void) | null = null;
	private _attachTimeout: ReturnType<typeof setTimeout> | null = null;
	private _revealTimeout: ReturnType<typeof setTimeout> | null = null;
	private _attributeObserver: MutationObserver | null = null;
	private _boundDocumentInteraction = (e: Event) => this._handleDocumentInteraction(e);
	private _resolvedSide: 'top' | 'bottom' | 'left' | 'right' | null = null;
	private _lastViewportWidth = 0;
	private _lastViewportHeight = 0;
	readonly _arrowMarkerId = `nldd-jite-arrow-${++jiteCounter}`;

	override updated(changed: PropertyValues): void {
		if (changed.has('arrowLength')) {
			// The arrow-length attribute takes any CSS length and feeds the local
			// --_just-in-time-education-arrow-length var; the CSS clamps it (min 40) into --_just-in-time-education-gap. Only
			// a valid length is forwarded — an invalid value (e.g. "d") would poison
			// the max()/calc() that consume it, making --_just-in-time-education-max-width and the arrow gap
			// invalid (the card would lose its width cap and the arrow misrender).
			// Invalid or empty falls back to the DS default by removing the override.
			if (this.arrowLength && CSS.supports('width', this.arrowLength)) {
				this.style.setProperty('--_just-in-time-education-arrow-length', this.arrowLength);
			} else {
				this.style.removeProperty('--_just-in-time-education-arrow-length');
			}
		}
		if (changed.has('active')) {
			if (this.active) this._open();
			else this._closePopover();
		} else if (this.active && (changed.has('placement') || changed.has('text') || changed.has('supportingText') || changed.has('arrowLength') || changed.has('noArrow'))) {
			// Re-place while open when an input that affects the geometry changes;
			// clear the cached side so the placement is decided from scratch.
			this._resolvedSide = null;
			const control = this._getControl();
			const container = this._containerEl;
			if (control && container) this._updatePosition(control, container);
		}
	}

	private get _containerEl(): HTMLElement | null {
		return this.shadowRoot?.querySelector('.just-in-time-education') ?? null;
	}

	private get _cardEl(): HTMLElement | null {
		return this.shadowRoot?.querySelector('.just-in-time-education__main') ?? null;
	}

	private get _announcerEl(): HTMLElement | null {
		return this.shadowRoot?.querySelector('.just-in-time-education__announcer') ?? null;
	}

	private _getControl(): HTMLElement | null {
		const slot = this.shadowRoot?.querySelector('slot');
		const assigned = slot?.assignedElements({ flatten: true });
		return (assigned?.[0] as HTMLElement) ?? null;
	}

	private _getControls(): Element[] {
		const slot = this.shadowRoot?.querySelector('slot');
		return slot?.assignedElements({ flatten: true }) ?? [];
	}

	/** Mirror one host attribute onto the slotted control(s) — or remove it —
	 *  unless the component owns that attribute. */
	private _forwardAttribute(name: string): void {
		if (NLDDJustInTimeEducation._ownAttributes.has(name)) return;
		const present = this.hasAttribute(name);
		const value = this.getAttribute(name) ?? '';
		for (const control of this._getControls()) {
			if (present) control.setAttribute(name, value);
			else control.removeAttribute(name);
		}
	}

	/** Forward every non-owned host attribute to the slotted control(s); run on
	 *  slotchange so a freshly slotted control catches up with what's already set. */
	_handleSlotChange(): void {
		for (const attr of Array.from(this.attributes)) this._forwardAttribute(attr.name);
	}

	private _open(): void {
		const container = this._containerEl;
		if (!container) return;
		if (!container.matches(':popover-open')) {
			// Hold it invisible until Floating UI has placed it, so it fades in at the
			// control instead of flashing at the popover's default position.
			container.removeAttribute('positioned');
			container.showPopover();
		}
		this._startPositioning();
		// Safety net: reveal even if positioning never resolves — no control to anchor
		// to, or the control became invalid before Floating UI placed it — so the
		// visibility gate can't leave the callout stuck hidden while it holds focus. A
		// brief fallback still lets a normal placement fade in at the control first.
		if (!this._getControl()) {
			container.setAttribute('positioned', '');
		} else {
			if (this._revealTimeout) clearTimeout(this._revealTimeout);
			this._revealTimeout = setTimeout(() => {
				this._revealTimeout = null;
				if (this.active) container.setAttribute('positioned', '');
			}, 200);
		}
		// Announce the tip text via a polite live region. Focusing into the callout
		// (dismissable, below) only makes AT read the dialog label and the focused
		// element, not the tip body, so the live region carries the actual message;
		// non-dismissable keeps focus on the control entirely. Cleared on close
		// (below) so re-opening re-announces.
		const announcer = this._announcerEl;
		if (announcer) announcer.textContent = [this.text, this.supportingText].filter(Boolean).join('. ');
		// Outside-click/keystroke dismissal only applies when dismissable. Defer
		// attaching the listeners to the next task so the click or keystroke that
		// opened the coach-mark isn't itself treated as an "outside" action.
		if (!this.dismissable) return;
		// Move focus into the callout so the dismiss button is keyboard-reachable
		// (Tab from here lands on it; Shift+Tab returns to the control) and
		// role="dialog" is announced on focus-enter. Focus returns to the control on
		// close (see _closePopover). The container has tabindex="-1" for this.
		container.classList.toggle('is-pointer-focus', isPointerMode());
		container.focus();
		if (this._attachTimeout) clearTimeout(this._attachTimeout);
		this._attachTimeout = setTimeout(() => {
			this._attachTimeout = null;
			if (!this.active) return;
			document.addEventListener('click', this._boundDocumentInteraction, true);
			document.addEventListener('keydown', this._boundDocumentInteraction, true);
		}, 0);
	}

	private _closePopover(): void {
		const container = this._containerEl;
		// Capture before hiding: was focus inside the callout (e.g. on the dismiss
		// button)? If so, return it to the control so keyboard focus isn't dropped
		// to the body. If the user already moved focus out (engaged the control,
		// clicked away), leave it where they put it.
		const focusWasInside = container?.matches(':focus-within') ?? false;
		if (container?.matches(':popover-open')) container.hidePopover();
		this._stopPositioning();
		const announcer = this._announcerEl;
		if (announcer) announcer.textContent = '';
		if (focusWasInside) this._getControl()?.focus();
		if (this._attachTimeout) {
			clearTimeout(this._attachTimeout);
			this._attachTimeout = null;
		}
		if (this._revealTimeout) {
			clearTimeout(this._revealTimeout);
			this._revealTimeout = null;
		}
		document.removeEventListener('click', this._boundDocumentInteraction, true);
		document.removeEventListener('keydown', this._boundDocumentInteraction, true);
	}

	private _startPositioning(): void {
		const control = this._getControl();
		const container = this._containerEl;
		if (!control || !container) return;
		this._stopPositioning();
		// autoUpdate re-runs on scroll/resize/layout shifts so the container keeps
		// tracking the control. Scrolling only translates the callout; the side is
		// re-decided only when the viewport changes (see _updatePosition).
		// _updatePosition is async and intentionally not awaited: autoUpdate is
		// rAF-debounced, so overlapping runs are rare and harmless — each just writes
		// the latest geometry, and the last write wins.
		this._cleanupAutoUpdate = autoUpdate(control, container, () => this._updatePosition(control, container));
	}

	private _stopPositioning(): void {
		this._cleanupAutoUpdate?.();
		this._cleanupAutoUpdate = null;
		this._resolvedSide = null;
	}

	private async _updatePosition(control: HTMLElement, container: HTMLElement): Promise<void> {
		const styles = getComputedStyle(this);
		const off = parseInt(styles.getPropertyValue('--_just-in-time-education-offset'), 10);
		const pad = parseInt(styles.getPropertyValue('--_just-in-time-education-shift-padding'), 10);

		// The side is chosen by available space, not by scrolling: horizontally
		// against the viewport, vertically against the whole document. Re-decide
		// only when the viewport dimensions change (a window resize); on scroll the
		// dimensions are unchanged, so the cached side stays put and the callout
		// merely translates to keep tracking the control.
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		if (this._resolvedSide === null || viewportWidth !== this._lastViewportWidth || viewportHeight !== this._lastViewportHeight) {
			this._resolvedSide = this._chooseSide(control);
			this._lastViewportWidth = viewportWidth;
			this._lastViewportHeight = viewportHeight;
		}
		const side = this._resolvedSide;

		// The gap padding only sits on the side facing the control (reflected via
		// data-arrow-side), so it changes the container's size per side. Apply it
		// BEFORE the compute: a padding-only change doesn't trigger autoUpdate's
		// ResizeObserver, so the compute must already use the final size — otherwise
		// switching between a vertical and a horizontal side leaves the position
		// wrong until a manual resize.
		if (this.getAttribute('data-arrow-side') !== side) this.setAttribute('data-arrow-side', side);

		// Keep the callout inside the room left as it nears an edge. Vertical
		// (top/bottom): --_just-in-time-education-available-distance is the room for the arrow gap once the
		// card height is reserved, measured against the whole document; the CSS
		// lets the gap fall to 0. Horizontal (left/right): --_just-in-time-education-available-distance is the
		// room to the viewport edge, and the CSS reserves the main width first — so
		// the arrow gap shrinks to 0 first, then the container cap narrows the main.
		// Set BEFORE the compute so the (smaller) padding is already in place.
		const cardHeight = this._cardEl?.getBoundingClientRect().height ?? 0;
		const controlRect = control.getBoundingClientRect();
		let availableDistance = '9999px';
		if (side === 'top') {
			availableDistance = `${Math.max(0, controlRect.top + window.scrollY - cardHeight)}px`;
		} else if (side === 'bottom') {
			availableDistance = `${Math.max(0, document.documentElement.scrollHeight - (controlRect.bottom + window.scrollY) - cardHeight)}px`;
		} else if (side === 'left') {
			availableDistance = `${Math.max(0, controlRect.left)}px`;
		} else if (side === 'right') {
			availableDistance = `${Math.max(0, window.innerWidth - controlRect.right)}px`;
		}
		this.style.setProperty('--_just-in-time-education-available-distance', availableDistance);

		// Top/bottom: shift along the horizontal (main) axis so the card keeps its
		// preferred width near a viewport edge, sliding toward the side with room
		// while the arrow still points at the control's center. Left/right: no shift
		// — it would push the card off the control vertically (sticking to the
		// viewport) instead of letting it sit beside the control.
		const isVertical = side === 'top' || side === 'bottom';

		// Drop the arrow (rather than draw it stunted) when the room would force the
		// gap below its minimum — uniformly for top/bottom and left/right. The gap
		// room is what's left after reserving the card: its height for top/bottom
		// (already folded into availableDistance) or the main's reserved width for
		// left/right (--_just-in-time-education-main-width = --_just-in-time-education-text-width + an optional --_just-in-time-education-dismiss-width).
		// Decided only from edge-room + fixed reserves, never the
		// post-collapse layout, so it can't oscillate. The consumer's own no-arrow
		// already hides it. Set the host hook BEFORE the compute (like
		// data-arrow-side) so the smaller gap is in place; CSS hides the arrow itself.
		const minArrow = parseFloat(styles.getPropertyValue('--primitives-space-40')) || 40;
		let gapRoom = parseFloat(availableDistance);
		if (!isVertical) {
			const mainReserve = (parseFloat(styles.getPropertyValue('--_just-in-time-education-text-width')) || 320)
				+ (this.dismissable ? (parseFloat(styles.getPropertyValue('--_just-in-time-education-dismiss-width')) || 44) : 0);
			gapRoom -= mainReserve;
		}
		const collapsed = !this.noArrow && gapRoom < minArrow;
		this.toggleAttribute('data-arrow-collapsed', collapsed);

		const { x, y } = await computePosition(control, container, {
			placement: side,
			middleware: isVertical ? [offset(off), shift({ padding: pad })] : [offset(off)],
		});
		container.style.left = `${x}px`;
		container.style.top = `${y}px`;
		if (this._revealTimeout) {
			clearTimeout(this._revealTimeout); // placed in time — no need for the fallback
			this._revealTimeout = null;
		}
		container.setAttribute('positioned', ''); // placed — let it fade in (see _open)
		this._updateArrow(control, container, side);
	}

	// Picks the side the callout sits on from the room around the control:
	// horizontally against the viewport edges, vertically against the full
	// document, so scrolling never changes the outcome (only a resize does). A
	// fixed placement is honoured exactly; only 'auto' weighs the room and takes
	// the side with the most of it (ties fall to 'bottom', the conventional spot).
	private _chooseSide(control: HTMLElement): 'top' | 'bottom' | 'left' | 'right' {
		if (this.placement !== 'auto') return this.placement;
		const rect = control.getBoundingClientRect();
		const documentHeight = document.documentElement.scrollHeight;
		const room = {
			top: rect.top + window.scrollY,
			bottom: documentHeight - (rect.bottom + window.scrollY),
			left: rect.left,
			right: window.innerWidth - rect.right,
		};
		let side: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
		for (const candidate of ['top', 'bottom', 'left', 'right'] as const) {
			if (room[candidate] > room[side]) side = candidate;
		}
		return side;
	}

	// Draws a flowing cubic from the card edge to the control edge, inside the
	// transparent (padded) container so it is never clipped. Runs on every
	// reposition (autoUpdate) so the curve re-routes as things move.
	private _updateArrow(control: HTMLElement, container: HTMLElement, placement: string): void {
		const svg = this.shadowRoot?.querySelector<SVGSVGElement>('.just-in-time-education__arrow');
		const path = this.shadowRoot?.querySelector<SVGPathElement>('.just-in-time-education__arrow-path');
		const card = this._cardEl;
		if (!svg || !path || !card) return;
		// Auto-collapsed near an edge: the arrow is hidden, so skip the geometry.
		if (this.hasAttribute('data-arrow-collapsed')) return;

		const containerRect = container.getBoundingClientRect();
		const cardRect = card.getBoundingClientRect();
		const controlRect = control.getBoundingClientRect();
		const cardCenterX = cardRect.left + cardRect.width / 2;
		const cardCenterY = cardRect.top + cardRect.height / 2;
		const controlCenterX = controlRect.left + controlRect.width / 2;
		const controlCenterY = controlRect.top + controlRect.height / 2;
		const side = placement.split('-')[0];

		// S starts on the card edge facing the control. The tip points just shy of
		// the control edge; dir is the direction the arrow travels into the control
		// (perpendicular to that edge).
		const tipGap = 6;
		const arrowLen = 10;
		let sx: number, sy: number, tipX: number, tipY: number, dirX: number, dirY: number;
		if (side === 'top') {
			sx = cardCenterX; sy = cardRect.bottom; tipX = controlCenterX; tipY = controlRect.top - tipGap; dirX = 0; dirY = 1;
		} else if (side === 'bottom') {
			sx = cardCenterX; sy = cardRect.top; tipX = controlCenterX; tipY = controlRect.bottom + tipGap; dirX = 0; dirY = -1;
		} else if (side === 'left') {
			sx = cardRect.right; sy = cardCenterY; tipX = controlRect.left - tipGap; tipY = controlCenterY; dirX = 1; dirY = 0;
		} else {
			sx = cardRect.left; sy = cardCenterY; tipX = controlRect.right + tipGap; tipY = controlCenterY; dirX = -1; dirY = 0;
		}

		// The stroke ends arrowLen short of the tip (along dir), so the dashed line
		// stops at the arrowhead base; the marker (refX=0) fills from there to the
		// tip. Building the curve to this point (not the tip) keeps the end tangent
		// pointing INTO the control, so the arrowhead never flips.
		const ex = tipX - arrowLen * dirX;
		const ey = tipY - arrowLen * dirY;

		// Two cubic segments forming a gentle bow (the "belly"), with tangents
		// perpendicular to both edges and at the midpoint, so the line leaves the
		// card and meets the control at 90 degrees while bowing out in the middle.
		const k = 0.25;
		const dx = ex - sx;
		const dy = ey - sy;
		const vertical = side === 'top' || side === 'bottom';
		const bulge = Math.min(Math.hypot(dx, dy) * 0.18, 9);
		const mx = (sx + ex) / 2 + (vertical ? bulge : 0);
		const my = (sy + ey) / 2 + (vertical ? 0 : bulge);

		let c1x: number, c1y: number, c2x: number, c2y: number;
		let c3x: number, c3y: number, c4x: number, c4y: number;
		if (vertical) {
			c1x = sx; c1y = sy + dy * k; c2x = mx; c2y = my - dy * k;
			c3x = mx; c3y = my + dy * k; c4x = ex; c4y = ey - dy * k;
		} else {
			c1x = sx + dx * k; c1y = sy; c2x = mx - dx * k; c2y = my;
			c3x = mx + dx * k; c3y = my; c4x = ex - dx * k; c4y = ey;
		}

		// Size/place the SVG to the bounding box of the path and the tip.
		const margin = 4;
		const xs = [sx, mx, ex, tipX, c1x, c2x, c3x, c4x];
		const ys = [sy, my, ey, tipY, c1y, c2y, c3y, c4y];
		const minX = Math.min(...xs) - margin;
		const minY = Math.min(...ys) - margin;
		const width = Math.max(...xs) + margin - minX;
		const height = Math.max(...ys) + margin - minY;
		svg.style.left = `${minX - containerRect.left}px`;
		svg.style.top = `${minY - containerRect.top}px`;
		svg.setAttribute('width', `${width}`);
		svg.setAttribute('height', `${height}`);
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
		path.setAttribute('d',
			`M ${sx - minX} ${sy - minY}`
			+ ` C ${c1x - minX} ${c1y - minY}, ${c2x - minX} ${c2y - minY}, ${mx - minX} ${my - minY}`
			+ ` C ${c3x - minX} ${c3y - minY}, ${c4x - minX} ${c4y - minY}, ${ex - minX} ${ey - minY}`,
		);
	}

	/** Route 1: the advised interaction on the slotted control (only when
	 *  dismissable; otherwise the consumer drives completion via complete()).
	 *  A mouse click fires pointerdown then focusin, both landing here; the
	 *  !this.active guard makes the second call a no-op so 'completed' fires once. */
	_handleAdvisedInteraction(): void {
		if (!this.active || !this.dismissable) return;
		this._close('completed');
	}

	/** Route 2: a click/keystroke outside the coach-mark (only when dismissable). */
	private _handleDocumentInteraction(e: Event): void {
		if (!this.active || !this.dismissable) return;
		// Anything inside the coach-mark (the slotted control or the callout) is
		// not an "outside" action. Interaction on the control is the advised
		// interaction, handled by route 1.
		if (e.composedPath().includes(this)) return;
		this._close('ignored');
	}

	/** Route 3: the dismiss button. */
	_handleDismiss(): void {
		this._close('dismissed');
	}

	/** Escape while focus is inside the callout dismisses it (the ARIA non-modal
	 *  dialog expectation). The document capture listener (route 2) treats inside
	 *  events as not-outside and bails, so Escape is handled here. stopPropagation
	 *  keeps it from also closing an ancestor (e.g. a modal the coach-mark sits in). */
	_handleCalloutKeydown(e: KeyboardEvent): void {
		if (e.key !== 'Escape' || !this.dismissable) return;
		e.stopPropagation();
		this._handleDismiss();
	}

	/** Programmatically mark the advised interaction as done (success close). */
	complete(): void {
		if (this.active) this._close('completed');
	}

	private _close(reason: JustInTimeEducationCloseReason): void {
		this.active = false; // triggers updated() -> _closePopover()
		this.dispatchEvent(new CustomEvent('nldd-close', {
			detail: { reason },
			bubbles: true,
			composed: true,
		}));
	}

	override connectedCallback(): void {
		super.connectedCallback();
		// The toolbar sets `size` on its direct child (now us) dynamically, AFTER
		// mount, so we observe attribute changes and forward them; slotchange covers
		// the initial set and any control swap.
		if (!this._attributeObserver) {
			this._attributeObserver = new MutationObserver(records => {
				for (const record of records) {
					if (record.attributeName) this._forwardAttribute(record.attributeName);
				}
			});
		}
		this._attributeObserver.observe(this, { attributes: true });
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._closePopover();
		this._attributeObserver?.disconnect();
	}

	override render() {
		return justInTimeEducationTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-just-in-time-education': NLDDJustInTimeEducation;
	}
}
