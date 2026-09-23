/**
 * Nederlandse Digitale Dienst Popover Component (Lit + TypeScript)
 *
 * A non-modal floating panel anchored to a trigger element. Built on the native
 * Popover API (popover="auto") with Floating UI for positioning. The browser
 * handles opening, toggling and light dismiss; this component only handles
 * positioning and focus.
 *
 * The recommended use is through popovertarget, so the browser owns the toggle:
 *
 *     <nldd-button id="info-trigger" popovertarget="info-popover">Info</nldd-button>
 *     <nldd-popover id="info-popover" anchor="info-trigger" accessible-label="Info">
 *         <nldd-container>
 *             <p>Content of the popover.</p>
 *         </nldd-container>
 *     </nldd-popover>
 *
 * To open it from your own state instead, bind `open` together with the close
 * event: the popover clears `open` itself on light dismiss, Escape or a click on
 * its anchor. It needs that anchor to open against.
 *
 * For a custom focus target inside the popover, put `autofocus` on the child you
 * want. Without it the popover host itself takes focus.
 *
 * @element nldd-popover
 *
 * @attr {string} width - Width as a CSS length (default: 320px through --components-popover-default-width). A content-based size (`fit-content`, `min-content`, `max-content`, `auto`) is refused: the popover is an inline-size container so slotted components can adapt to it, and its width cannot then come from that same content. Such a value is ignored, with a warning in DEV.
 * @attr {boolean} sm-full-height - On an sm viewport (where the popover renders as a bottom sheet) fills the whole available height instead of shrinking to its content. No effect on md and up (anchored mode). Opt-in for content-heavy cases such as search results or long detail views; content-sized is the default, following the Apple and Material convention.
 * @attr {string} anchor - ID of the trigger element, used for positioning
 * @attr {string} placement - Floating UI placement (default: 'bottom-start')
 * @attr {string} top - CSS top position. When set (on its own, or together with other edge attributes or `centered`) Floating UI's anchor positioning is skipped and the popover stands free on the screen. The `anchor` is still needed for the ARIA link on the trigger. No effect on sm, where the bottom sheet wins.
 * @attr {string} right - CSS right position. See `top` for the semantics.
 * @attr {string} bottom - CSS bottom position. See `top` for the semantics.
 * @attr {string} left - CSS left position. See `top` for the semantics.
 * @attr {boolean} centered - Centers both axes on the viewport. Overridable per axis: `centered top="0"` is centered horizontally, aligned to the top. Mirrors CSS `place-items: center` with `align-items`/`justify-items` overrides.
 * @attr {string} accessible-label - (required) Accessible name (aria-label). Falls back to the i18n default ('Popover') when unset — always give a unique, describing name.
 * @attr {string} role - ARIA role (default: 'dialog'). For informational content (a tooltip callout, a rich-text help panel) without a dialog interaction pattern, set `role="region"`. For menu-style triggers, `role="menu"` plus `aria-haspopup="menu"` on the anchor. The popover never overwrites a role that was set explicitly.
 * @attr {object} translations - Override translation keys; unset keys fall back to the Dutch default.
 * @attr {boolean} open - Whether the popover is open. Set it to open or close the popover, as an alternative to show() and hide(); opening needs an anchor, and without one it stays unset. The popover clears it itself when it closes another way (Escape, a click outside), so bind it together with the close event.
 *
 * @prop {Element|null} anchorElement - Programmatic anchor (takes precedence over the anchor attribute)
 *
 * @slot - Free content (an nldd-container with a form or info, for instance)
 *
 * @fires open - When the popover opens
 * @fires close - When the popover closes. Does not bubble: overlays nest, and a listener on the sheet or window around this one should not hear it close.
 *
 * @method show() - Opens the popover
 * @method hide() - Closes the popover
 * @method toggle() - Toggles the popover
 * @method reposition() - Recalculates the position relative to the anchor
 */

import { LitElement, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { computePosition, flip, shift, size, autoUpdate, type Placement } from '@floating-ui/dom';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { popoverStyles } from './popover.styles.js';
import { popoverTemplate } from './popover.template.js';
import { nlddPopoverTranslations, type NLDDPopoverTranslations } from './popover.i18n.js';
import { isPointerMode } from '../../../utilities/input-modality.js';
import { breakpoints } from '../../../assets/styles/breakpoints.js';

@customElement('nldd-popover')
export class NLDDPopover extends LitElement {
	static override styles = popoverStyles;

	@property({ type: String, reflect: true })
	width: string | undefined;

	@property({ type: Boolean, reflect: true, attribute: 'sm-full-height' })
	smFullHeight = false;

	@property({ type: String, reflect: true })
	anchor = '';

	@property({ attribute: false })
	anchorElement: Element | null = null;

	@property({ reflect: true, converter: reflectNonDefault<Placement>('bottom-start') })
	placement: Placement = 'bottom-start';

	// Default `undefined` (not '') so Lit doesn't reflect an empty value:
	// `<nldd-popover>` would otherwise carry `top="" left="" right="" bottom=""`
	// in the DOM, which is noisy and could trip `[top]` attribute selectors in
	// consumer stylesheets. The hasOverride checks treat both as falsy.
	@property({ type: String, reflect: true })
	top: string | undefined = undefined;

	@property({ type: String, reflect: true })
	right: string | undefined = undefined;

	@property({ type: String, reflect: true })
	bottom: string | undefined = undefined;

	@property({ type: String, reflect: true })
	left: string | undefined = undefined;

	@property({ type: Boolean, reflect: true })
	centered = false;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/**
	 * Override one or more translation keys.
	 * Unset keys fall back to the Dutch default.
	 */
	@property({ type: Object })
	translations: Partial<NLDDPopoverTranslations> = {};

	@property({ type: Boolean, reflect: true })
	open = false;

	private _isOpen = false;
	private _hasWarnedLabel = false;
	private _previousFocus: HTMLElement | null = null;
	private _pointerdownOnAnchorWhileOpen = false;
	/** Cleanup function from Floating UI's autoUpdate, only active while open. */
	private _cleanupAutoUpdate: (() => void) | null = null;
	private _smQuery: MediaQueryList | null = null;
	private _wasOnSm = false;
	private _previousAnchorEl: Element | null = null;

	/** Widths that come from the content instead of from a length. The popover is
	 *  an inline-size query container so slotted components can adapt to it, and
	 *  containment exists precisely to forbid a box from depending on its own
	 *  contents in that axis. CSS resolves the cycle by making the box zero wide,
	 *  which is invisible on screen and hard to trace back; better to say no. */
	private static readonly CONTENT_WIDTHS = /^(auto|fit-content|min-content|max-content)\b/;

	override connectedCallback(): void {
		super.connectedCallback();
		this.style.containerType = 'inline-size';
		this.style.containerName = 'layout-container';
		if (!this.hasAttribute('popover')) this.setAttribute('popover', '');
		if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '-1');
		if (!this.hasAttribute('role')) this.setAttribute('role', 'dialog');
		this.addEventListener('beforetoggle', this._handleBeforeToggle);
		this.addEventListener('toggle', this._handleToggle);
		this.addEventListener('keydown', this._handleKeydown);
		document.addEventListener('pointerdown', this._handleDocumentPointerdown, true);
		document.addEventListener('pointercancel', this._handlePointerCancel, true);
		document.addEventListener('click', this._handleDocumentClickCapture, true);
		document.addEventListener('click', this._handleDocumentClick);
		this._smQuery = window.matchMedia(`(max-width: ${breakpoints.smMax})`);
		this._wasOnSm = this._smQuery.matches;
		this._smQuery.addEventListener('change', this._handleViewportChange);
		// Seed aria-expanded/aria-haspopup on the anchor so a screen reader
		// announces the trigger as a toggle control right away, not only after the
		// first open. Deferred to a microtask: an anchor referenced by id may not
		// be in the DOM yet at connectedCallback time. The warning about a missing
		// accessible-label rides along in the same deferred tick, so it also fires
		// for popovertarget usage, where our component never calls show().
		Promise.resolve().then(() => {
			this._updateAnchorAria(false);
			this._warnIfMissingLabel();
		});
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('beforetoggle', this._handleBeforeToggle);
		this.removeEventListener('toggle', this._handleToggle);
		this.removeEventListener('keydown', this._handleKeydown);
		document.removeEventListener('pointerdown', this._handleDocumentPointerdown, true);
		document.removeEventListener('pointercancel', this._handlePointerCancel, true);
		document.removeEventListener('click', this._handleDocumentClickCapture, true);
		document.removeEventListener('click', this._handleDocumentClick);
		this._smQuery?.removeEventListener('change', this._handleViewportChange);
		this._smQuery = null;
		// Stop the autoUpdate listeners when the popover is removed while still
		// open, which would otherwise leak memory and leave dangling listeners.
		this._cleanupAutoUpdate?.();
		this._cleanupAutoUpdate = null;
		// Strip ALL aria-* from the anchor, not just aria-expanded. In SPA flows
		// (v-if, conditional render) the popover can disappear while the anchor
		// stays. A leftover aria-controls pointing at an element that no longer
		// exists is a WCAG 4.1.2 failure (Name, Role, Value).
		const anchorEl = this._getAnchorEl();
		if (anchorEl) {
			// Reset the IDL prop too (control anchors), else a popover removed
			// while open leaves the trigger stuck in its is-expanded state.
			const control = anchorEl as HTMLElement & { expanded?: boolean };
			if ('expanded' in control) control.expanded = false;
			anchorEl.removeAttribute('aria-expanded');
			anchorEl.removeAttribute('aria-haspopup');
			if (this.id && anchorEl.getAttribute('aria-controls') === this.id) {
				anchorEl.removeAttribute('aria-controls');
			}
		}
		this._previousAnchorEl = null;
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('open')) {
			const showing = this.matches(':popover-open');
			// _isOpen is what the last toggle reported: an `open` that only echoes
			// that report is not a request to open.
			if (this.open && !showing && !this._isOpen) {
				this.show();
				// No anchor to open against: say so in the attribute, too.
				if (!this.matches(':popover-open')) this.open = false;
			} else if (!this.open && showing) {
				(this as HTMLElement).hidePopover();
			}
		}
		// Set width via the CSS variable so media-query overrides (bottom
		// sheet on sm) keep working. Inline `style.width` would beat them.
		if (changed.has('width')) {
			const contentSized = NLDDPopover.CONTENT_WIDTHS.test((this.width ?? '').trim());
			if (contentSized && import.meta.env?.DEV) {
				console.warn(
					`[nldd-popover] width="${this.width}" is not supported and is ignored: `
					+ 'the popover is an inline-size query container, so its width cannot come '
					+ 'from its own content. Give it a CSS length instead.',
				);
			}
			if (this.width && !contentSized) {
				this.style.setProperty('--components-popover-default-width', this.width);
			} else {
				this.style.removeProperty('--components-popover-default-width');
			}
		}
		if (changed.has('accessibleLabel') || changed.has('translations')) {
			this.setAttribute('aria-label', this._resolvedAccessibleLabel);
		}
		// Anchor change at runtime: strip aria-* from the old trigger and put it on
		// the new one. Without this the old trigger keeps stale aria-expanded and
		// aria-controls for a screen reader.
		if (changed.has('anchor') || changed.has('anchorElement')) {
			this._updateAnchorAria(this._isOpen);
		}
		// Position-override changes at runtime: re-apply or clear inline edges
		// + transform, so the popover follows dynamic values.
		if (
			changed.has('top') || changed.has('left')
			|| changed.has('right') || changed.has('bottom')
			|| changed.has('centered')
		) {
			if (!this.top && !this.centered) this.style.removeProperty('top');
			if (!this.left && !this.centered) this.style.removeProperty('left');
			if (!this.right) this.style.removeProperty('right');
			if (!this.bottom) this.style.removeProperty('bottom');
			if (this._isOpen) this.reposition();
		}
	}

	// — i18n ——————————————————————————————————————————————————————————————————

	private _t(key: keyof NLDDPopoverTranslations): string {
		return this.translations[key] ?? nlddPopoverTranslations[key];
	}

	get _resolvedAccessibleLabel(): string {
		return this.accessibleLabel || this._t('components.popover.accessible-label');
	}

	// — Public API ————————————————————————————————————————————————————————————

	show(): void {
		this._warnIfMissingLabel();
		const anchorEl = this._getAnchorEl();
		if (!anchorEl) {
			if (import.meta.env?.DEV) console.warn('<nldd-popover>: anchor element not found. Set anchor=ID or anchorElement before calling show().');
			return;
		}
		(this as HTMLElement).showPopover();
	}

	private _warnIfMissingLabel(): void {
		// Dev only, so an end user's production console stays clean.
		if (!import.meta.env?.DEV) return;
		if (this.accessibleLabel || this._hasWarnedLabel) return;
		this._hasWarnedLabel = true;
		console.warn(`<nldd-popover>: No accessible-label provided. Screen readers will announce this popover as "${this._t('components.popover.accessible-label')}". Set accessible-label to a unique, descriptive name.`);
	}

	hide(): void {
		if (!this._isOpen) return;
		(this as HTMLElement).hidePopover();
	}

	toggle(): void {
		if (this._isOpen) this.hide();
		else this.show();
	}

	/**
	 * Restore the inline transition after a breakpoint-suppressed tick. Force
	 * a layout flush first (`void offsetHeight`) so the just-applied position
	 * styles commit before transitions resume — otherwise the cleared
	 * `transition: ''` would re-enable animations on those exact properties
	 * and you'd still see the slide we were trying to suppress.
	 */
	private _restoreTransition(): void {
		void this.offsetHeight;
		this.style.transition = '';
	}

	/** Recomputes the position relative to the anchor. Called automatically on open. */
	async reposition(): Promise<void> {
		if (!this._isOpen) return;

		// Suppress transitions when crossing the sm/md breakpoint. Without
		// this, the bottom-sheet's `transition: transform ...` rule animates
		// the swap between the centered-md `translate(-50%, 0)` transform
		// and the sm `translateY(...)` bottom-sheet transform — producing
		// a visible left/right slide on resize. We only suppress on the
		// crossing tick; user-driven open/close on sm continues to animate.
		// Each path below calls _restoreTransition() before returning.
		const isSm = this._smQuery?.matches ?? false;
		const crossedBreakpoint = isSm !== this._wasOnSm;
		this._wasOnSm = isSm;
		if (crossedBreakpoint) this.style.transition = 'none';

		// On sm viewport the popover renders as a bottom sheet via CSS; clear
		// any inline positioning Floating UI may have set previously so the
		// CSS rules take effect.
		if (isSm) {
			this.style.removeProperty('top');
			this.style.removeProperty('left');
			this.style.removeProperty('right');
			this.style.removeProperty('bottom');
			this.style.removeProperty('transform');
			this.style.removeProperty('--_max-height');
			if (crossedBreakpoint) this._restoreTransition();
			return;
		}

		// Position-override: skip Floating UI and place the popover at the
		// consumer-specified coordinates. The anchor stays necessary for ARIA but
		// not for positioning, as with a freely placed search popover that belongs
		// centered at the top rather than under its trigger.
		//
		// `centered` centers both axes (left/top: 50%, transform: translate -50%
		// per axis). An explicit edge attribute (top/left/right/bottom) overrides
		// that axis, so `centered top="0"` is centered horizontally and aligned to
		// the top. Mirrors CSS `place-items: center` with overrides.
		const hasOverride = this.top || this.left || this.right || this.bottom || this.centered;
		if (hasOverride) {
			const yCenter = this.centered && !this.top && !this.bottom;
			const xCenter = this.centered && !this.left && !this.right;

			if (this.top) this.style.setProperty('top', this.top);
			else if (yCenter) this.style.setProperty('top', '50%');
			if (this.bottom) this.style.setProperty('bottom', this.bottom);

			if (this.left) this.style.setProperty('left', this.left);
			else if (xCenter) this.style.setProperty('left', '50%');
			if (this.right) this.style.setProperty('right', this.right);

			if (xCenter || yCenter) {
				this.style.setProperty('transform',
					`translate(${xCenter ? '-50%' : '0'}, ${yCenter ? '-50%' : '0'})`);
			} else {
				this.style.removeProperty('transform');
			}
			if (crossedBreakpoint) this._restoreTransition();
			return;
		}

		// Drop a centering transform left over from an override that has since
		// been removed. The branch above only clears it while it is still being
		// taken, so a popover that loses `centered` at runtime — a responsive one
		// switching from centered to anchored on a breakpoint change — would keep
		// its `translate(-50%, …)` and land half its width off the anchor, partly
		// off screen. Floating UI positions purely via left/top, so there is never
		// a transform to preserve here.
		this.style.removeProperty('transform');

		const anchorEl = this._getAnchorEl();
		if (!anchorEl) return;

		// No fallback: --semantics-overlays-inset has to exist, which CI validates.
		// parseFloat handles the leading whitespace getPropertyValue sometimes
		// returns. With the token missing, NaN propagates so the mistake is
		// visible instead of quietly resolving to a fallback.
		const inset = parseFloat(getComputedStyle(this).getPropertyValue('--semantics-overlays-inset'));

		const { x, y } = await computePosition(anchorEl, this, {
			placement: this.placement,
			middleware: [
				flip({ padding: inset }),
				shift({ padding: inset }),
				size({
					padding: inset,
					apply: ({ availableHeight }: { availableHeight: number }) => {
						this.style.setProperty('--_max-height', `${availableHeight}px`);
					},
				}),
			],
		});

		Object.assign(this.style, {
			left: `${x}px`,
			top: `${y}px`,
		});

		if (crossedBreakpoint) this._restoreTransition();
	}

	// — Anchor ————————————————————————————————————————————————————————————————

	private _getAnchorEl(): Element | null {
		if (this.anchorElement) return this.anchorElement;
		if (this.anchor) return document.getElementById(this.anchor);
		return null;
	}

	private _updateAnchorAria(open: boolean): void {
		const anchorEl = this._getAnchorEl();
		// Anchor changed (e.g. anchorElement property switched, or anchor
		// attribute updated): strip aria-expanded and any aria-controls from the
		// previous one, so it does not linger as a toggle for a screen reader.
		if (this._previousAnchorEl && this._previousAnchorEl !== anchorEl) {
			this._previousAnchorEl.removeAttribute('aria-expanded');
			if (this._previousAnchorEl.getAttribute('aria-controls') === this.id) {
				this._previousAnchorEl.removeAttribute('aria-controls');
			}
		}
		if (!anchorEl) {
			this._previousAnchorEl = null;
			return;
		}
		// Prefer IDL props when the anchor is a control that exposes them (e.g.
		// nldd-button / nldd-icon-button): the control renders aria-expanded /
		// aria-haspopup on its real inner <button> from these props, and also
		// flips its is-expanded visual (chevron). Raw setAttribute on the host
		// would land on the custom element, not the inner control, and get reset
		// on the next render. Fall back to attributes for plain element anchors.
		const control = anchorEl as HTMLElement & { expanded?: boolean; popupType?: string };
		if ('expanded' in control) {
			control.expanded = open;
		} else {
			anchorEl.setAttribute('aria-expanded', open ? 'true' : 'false');
		}
		// aria-haspopup belongs on the trigger from the first render, not only
		// after the first open. Never overwritten when the host carries its own
		// value (for example 'menu' instead of 'dialog' for combinations).
		if ('popupType' in control) {
			if (!control.popupType) control.popupType = 'dialog';
		} else if (!anchorEl.hasAttribute('aria-haspopup')) {
			anchorEl.setAttribute('aria-haspopup', 'dialog');
		}
		// aria-controls ties the trigger explicitly to the popover element. The
		// ARIA Authoring Practices ask for it on dialog triggers and it improves
		// screen reader context. Only set when this popover has an id and the
		// anchor does not already point somewhere else.
		if (this.id && !anchorEl.hasAttribute('aria-controls')) {
			anchorEl.setAttribute('aria-controls', this.id);
		}
		this._previousAnchorEl = anchorEl;
	}

	// — Event handlers ————————————————————————————————————————————————————————

	private _handleViewportChange = (): void => {
		// Track the breakpoint even while closed — otherwise the next show()
		// would see a "crossing" (current vs stale `_wasOnSm`) that didn't
		// actually happen during an open state, and the spurious
		// `transition: none` would suppress the opening animation. When open,
		// reposition() owns the update (it needs the pre-change value to
		// compute crossedBreakpoint correctly), so we only sync here when
		// the popover is closed.
		if (this._isOpen) {
			this.reposition();
		} else {
			this._wasOnSm = this._smQuery?.matches ?? false;
		}
	};

	/**
	 * On a small screen this popover is a bottom sheet with a dimmed backdrop, and
	 * a backdrop that lets the tap through is a promise it does not keep: the page
	 * underneath is not inert, so one tap both dismissed the sheet and activated
	 * whatever sat under the dimming. Every native bottom sheet absorbs that tap.
	 *
	 * The anchor is left alone. Tapping the control that opened the sheet should
	 * keep closing it, which is what the handler below already arranges.
	 */
	private _swallowNextClick = false;

	private _shouldAbsorbTap(event: Event, anchorEl: Element | null): boolean {
		if (!this._isOpen) return false;
		if (!(this._smQuery?.matches ?? false)) return false;
		const path = event.composedPath();
		if (path.includes(this)) return false;
		if (anchorEl && path.includes(anchorEl)) return false;
		return true;
	}

	private _handleDocumentPointerdown = (event: PointerEvent): void => {
		// A fresh gesture: clear a flag a previous tap set but never spent. A tap
		// that turns into a scroll or drag ends without a click, so the flag would
		// otherwise linger and swallow the next unrelated click anywhere on the page.
		this._swallowNextClick = false;
		if (!this._isOpen) return;
		const anchorEl = this._getAnchorEl();
		if (this._shouldAbsorbTap(event, anchorEl)) {
			event.preventDefault();
			event.stopPropagation();
			this._swallowNextClick = true;
			(this as HTMLElement).hidePopover();
			return;
		}
		if (!anchorEl) return;
		if (!event.composedPath().includes(anchorEl)) return;
		this._pointerdownOnAnchorWhileOpen = true;
	};

	/** A gesture the browser canceled (a tap that became a scroll or drag) never
	 *  produces the click that would spend the flag, so clear it here too. */
	private _handlePointerCancel = (): void => {
		this._swallowNextClick = false;
	};

	/** Swallows the click that follows an absorbed tap, so it cannot activate
	 *  what sat under the backdrop. */
	private _handleDocumentClickCapture = (event: MouseEvent): void => {
		if (!this._swallowNextClick) return;
		this._swallowNextClick = false;
		event.preventDefault();
		event.stopPropagation();
	};

	private _handleDocumentClick = (event: MouseEvent): void => {
		// Driven mode: when a consumer supplies anchorElement (e.g. a button that
		// slots this popover) it owns the open/close lifecycle — don't self-toggle.
		// This also fixes nesting: with the popover slotted inside its anchor, the
		// anchor is an ancestor of every content click, so self-toggling here would
		// close the popover on its own interactive content. Native light-dismiss
		// still handles outside clicks; the driver handles the reopen race. The
		// recommended id-anchored / popovertarget usage keeps self-toggling.
		if (this.anchorElement) return;
		const anchorEl = this._getAnchorEl();
		if (!anchorEl) return;
		const path = event.composedPath();
		if (!path.includes(anchorEl)) return;
		// If the anchor uses popovertarget pointing at this popover, the
		// browser's default activation behavior already toggles us. Running
		// our own toggle here would invert the state right after, leaving
		// the popover in the wrong final state.
		const popovertarget = anchorEl.getAttribute('popovertarget');
		if (popovertarget && this.id && popovertarget === this.id) return;
		// Native light-dismiss fires on pointerdown and closes the popover
		// before the click arrives. Without this guard the click would
		// immediately reopen it.
		if (this._pointerdownOnAnchorWhileOpen) {
			this._pointerdownOnAnchorWhileOpen = false;
			return;
		}
		if (this._isOpen) {
			(this as HTMLElement).hidePopover();
		} else {
			(this as HTMLElement).showPopover();
		}
	};

	// On the desktop (Floating UI) layout a popover paints at its default position the
	// instant it opens, before the async reposition runs — a flash in the wrong place.
	// Clearing `positioned` here (beforetoggle fires before the popover is shown) keeps
	// it hidden via CSS until reposition() has placed it. (The sm bottom-sheet is
	// CSS-animated, so its hide rule is scoped to md; this is harmless there.)
	private _handleBeforeToggle = (event: Event): void => {
		if ((event as ToggleEvent).newState === 'open') this.removeAttribute('positioned');
	};

	private _handleToggle = async (event: Event): Promise<void> => {
		const toggleEvent = event as ToggleEvent;
		this._isOpen = toggleEvent.newState === 'open';
		this.open = this._isOpen;

		this._updateAnchorAria(this._isOpen);

		if (toggleEvent.newState !== 'open') {
			// Stop scroll/resize tracking, no longer needed once closed.
			this._cleanupAutoUpdate?.();
			this._cleanupAutoUpdate = null;
			this._returnFocus();
			this.dispatchEvent(new CustomEvent('close', { bubbles: false, composed: true }));
			return;
		}

		this._previousFocus = (document.activeElement as HTMLElement | null) ?? this._getAnchorEl() as HTMLElement | null;
		await this.reposition();
		this.setAttribute('positioned', ''); // placed — reveal it (see _handleBeforeToggle)
		// Start scroll/resize/layout-change tracking. Floating UI's autoUpdate
		// listens for ancestor scroll, window resize and a ResizeObserver on the
		// anchor, which covers a window resize within a viewport breakpoint,
		// dynamic content shifts and popovers in scrollable containers, not just
		// document scroll. On an sm viewport (bottom sheet, position: fixed)
		// reposition() is a no-op, so there is no work.
		const anchorEl = this._getAnchorEl();
		if (anchorEl) {
			this._cleanupAutoUpdate = autoUpdate(anchorEl, this, () => this.reposition());
		}
		await this.updateComplete;
		this._manageFocus();
		this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
	};

	private _handleKeydown = (event: KeyboardEvent): void => {
		// Escape closes this popover and stops there. Left to the browser, one
		// press walks the whole stack: the close signal takes this popover, and a
		// dialog behind it — a sheet, a window — takes the same key and goes too.
		// Only what is on top should answer. Same shape as nldd-menu.
		if (event.key === 'Escape') {
			if (!this.matches(':popover-open')) return;
			event.preventDefault();
			event.stopPropagation();
			this.hide();
			(this._getAnchorEl() as HTMLElement | null)?.focus();
			return;
		}
		if (event.key !== 'Tab') return;
		const focusables = this._getFocusables();
		// document.activeElement only returns the shadow host (nldd-button, say),
		// not the inner <button>. Our focusables list holds that inner element,
		// found by walking shadow roots. composedPath()[0] gives the element that
		// actually has focus, which matches what _getFocusables returns.
		const focused = (event.composedPath()[0] as HTMLElement | null)
			?? (document.activeElement as HTMLElement | null);
		const idx = focused ? focusables.indexOf(focused) : -1;
		// idx === -1 means the container itself holds focus, which is where it
		// lands on open. Forward from there, and backward out of the popover.
		const atStart = event.shiftKey && idx <= 0;
		const atEnd = !event.shiftKey && idx === focusables.length - 1;
		if (focusables.length === 0 || atStart || atEnd) {
			event.preventDefault();
			this.hide();
			return;
		}

		// The container itself holds focus: where it lands on open, and where a
		// click on the popover's dead chrome puts it (tabindex="-1" makes the
		// host mouse-focusable). This is the one hop we move ourselves, because
		// Safari does not tab into the contents of a top-layer element — with the
		// container focused it skips the whole popover and lands on whatever
		// follows it in the document, while the popover stays open. Entering at
		// the first focusable also serves the chrome-click case: after clicking
		// somewhere in the popover you expect Tab to start at its top, not to
		// resume from wherever focus happened to be.
		if (idx === -1) {
			event.preventDefault();
			// focusVisible is advisory (ignored where unsupported), but where it
			// works it gives this scripted hop the ring a keyboard hop deserves.
			focusables[0]?.focus({ focusVisible: true } as FocusOptions);
			return;
		}
		// Between elements the browser moves focus itself. A focus the browser
		// moves on a key press matches :focus-visible unconditionally; a focus WE
		// move only inherits the ring state of the element we left. Intercepting
		// every Tab therefore meant one mouse click anywhere started a chain in
		// which no Tab stop ever showed a focus ring again.
	};

	// — Focus ————————————————————————————————————————————————————————————————

	private _manageFocus(): void {
		this.classList.toggle('is-pointer-focus', isPointerMode());
		const autofocusEl = this.querySelector<HTMLElement>('[autofocus]');
		if (autofocusEl) {
			autofocusEl.focus();
			return;
		}
		this.focus();
	}

	private _returnFocus(): void {
		const target = this._previousFocus ?? (this._getAnchorEl() as HTMLElement | null);
		this._previousFocus = null;
		target?.focus();
	}

	private _getFocusables(): HTMLElement[] {
		const selector = [
			'a[href]',
			'button:not([disabled])',
			'input:not([disabled])',
			'select:not([disabled])',
			'textarea:not([disabled])',
			'[tabindex]:not([tabindex="-1"])',
			'[contenteditable=""]',
			'[contenteditable="true"]',
			'details > summary:first-of-type',
		].join(',');

		// Walk in document order, descending into shadow roots inline so a
		// custom element's internal <button> appears in the right place among the
		// surrounding light-DOM focusables (shadow content first, then light
		// children, which matches the tab order for most use cases).
		// Edge case: a shadow tree with markup before a <slot> is not mirrored
		// perfectly, but that is rare in popover content.
		//
		// Performance: getClientRects() forces layout per element. For rich popover
		// content with many focusables that is an O(n) layout flush. It only runs
		// on a Tab keydown (rare, not a hot path), and caching could let the
		// visibility snapshot go stale. A deliberate trade of micro-performance
		// for correctness.
		const result: HTMLElement[] = [];
		const visit = (root: ParentNode): void => {
			for (const child of Array.from(root.children)) {
				const el = child as HTMLElement;
				// tabIndex < 0 excludes elements that are focusable but not tabbable: a
				// roving-tabindex widget (grid, toolbar, tree) puts all of its items on
				// -1 except one. Without this check the list counts dozens the browser
				// skips, tab-out never believes it is at the end, and the user tabs out
				// of the popover while it stays open.
				if (el.matches?.(selector) && !el.hasAttribute('disabled') && el.tabIndex >= 0) {
					// getClientRects().length === 0 catches display:none and
					// visibility:hidden on the element or an ancestor (including the
					// shadow host), which is sturdier than offsetParent inside shadow.
					if (el.getClientRects().length > 0) result.push(el);
				}
				if (el.shadowRoot) visit(el.shadowRoot);
				visit(el);
			}
		};
		visit(this);
		// The DOM-order walk above is the tab order only when every focusable sits
		// at tabindex 0. A positive tabindex jumps the queue: 1 comes before 2
		// before any 0, and equal values keep document order. We move focus
		// ourselves now (Safari never tabbed into the top layer), so we owe that
		// ordering rather than leaving it to the browser. A stable sort keeps
		// document order within each tabindex bucket.
		return result
			.map((el, i) => ({ el, i, order: el.tabIndex > 0 ? el.tabIndex : Infinity }))
			.sort((a, b) => a.order - b.order || a.i - b.i)
			.map((entry) => entry.el);
	}

	override render() {
		return popoverTemplate();
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-popover': NLDDPopover;
	}
}
