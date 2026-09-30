/**
 * Nederlandse Digitale Dienst Notification Component (Lit + TypeScript)
 *
 * A short message that arrives over the interface and leaves on its own: a
 * save that worked, a request that failed. Not a banner, which stands in the
 * page and stays there — this one floats, stacks, and goes away.
 *
 * It places itself. Write it wherever it belongs in your code and it moves to
 * one shared area: top right from md, full width across the top below that.
 * Nothing about the position is settable, so notifications from anywhere in an
 * application land in the same place and stack in the same order.
 *
 * A modal overlay is the one thing that moves it. An nldd-sheet, nldd-window or
 * nldd-modal-dialog paints in the browser's top layer, above the whole page and
 * out of reach of any z-index, and while one is open everything outside it is
 * inert. So the area goes in: into the topmost overlay that is open, and back
 * down as they close. A notification already on screen travels with it, and one
 * raised from inside a sheet is readable and reachable where it is raised.
 *
 * ## The stack
 * More than one is a deck, not a list: the front one is readable and the older
 * ones peek out below it, so a burst of messages takes the room of roughly one.
 * The newest is in front. Behind it a notification is a bare surface, cut to
 * the height of the one in front; dismiss the front and it slides up into the
 * place that came free while its message fades in, because it was standing
 * there all along.
 *
 * Under the front notification sits a strip as wide as the deck and as tall as
 * the deck is when it fans out. Pointing at it fans the deck out to fill it,
 * which is the only hint that there is more here than the message you can read;
 * clicking it, or moving focus into the area, lays the whole deck out as a
 * list. Clicking or tabbing away puts it back. The notification itself is not a
 * button: a click on the message you are reading does nothing.
 *
 * ## Timing
 * Only the front of the deck counts down, and only while the deck is closed:
 * open means someone is reading. The rest wait, so nothing disappears from
 * under the one you are reading. `critical` never leaves on its own: a
 * failure is worth reading, and the count-down would take it away while you
 * were. That also keeps this within WCAG 2.2.1, which allows a time limit when
 * what disappears is not essential.
 *
 * The clock pauses while a pointer moves over the notification and while focus
 * is inside it, and resumes where it left off rather than starting over. A
 * pointer that merely happens to rest where the notification appears does not
 * count: it never moved, so nobody is reading.
 *
 * ## ARIA
 * role follows the variant: `critical` becomes role="alert", the rest
 * role="status". Focus never moves on its own. Escape dismisses the
 * notification that focus is in.
 *
 * @element nldd-notification
 *
 * @attr {'neutral'|'accent'|'success'|'warning'|'critical'} variant - What kind of message this is; sets the icon color and the ARIA role (default: 'neutral')
 * @attr {string} icon - Icon override. Default per variant: neutral → info-circle-filled, accent → info-circle-filled, success → check-circle-filled, warning → exclamation-triangle-filled, critical → exclamation-circle-filled
 * @attr {string} text - The message
 * @attr {string} supporting-text - A second line under the message
 * @attr {number} duration - Milliseconds before it leaves once it is front of the deck (default: 10000). `0` keeps it until dismissed, which is what `critical` does regardless.
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @slot actions - At most 2 nldd-button elements, under the text. More than 2 is refused with a DEV warning: a message that needs three choices is a dialog.
 *
 * @fires dismiss - Fired when the notification is dismissed, by the button, by Escape, or by its own clock. The consumer removes it.
 */

import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { notificationStyles } from './notification.styles.js';
import { notificationTemplate } from './notification.template.js';
import { joinArea, leaveArea } from './notifications-area.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddNotificationTranslations } from './notification.i18n.js';
import '../../content/icon/icon.js';
import '../../actions/icon-button/icon-button.js';

export type NotificationVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'critical';

const DEFAULT_ICONS: Record<NotificationVariant, string> = {
	neutral: 'info-circle-filled',
	accent: 'info-circle-filled',
	success: 'check-circle-filled',
	warning: 'exclamation-triangle-filled',
	critical: 'exclamation-circle-filled',
};

const DEFAULT_DURATION = 10000;

@customElement('nldd-notification')
export class NLDDNotification extends withTranslations(LitElement, nlddNotificationTranslations) {
	static override styles = notificationStyles;

	@property({ reflect: true, converter: reflectNonDefault<NotificationVariant>('neutral') })
	variant: NotificationVariant = 'neutral';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	icon = '';

	@property({ type: String, reflect: true })
	text = '';

	@property({ type: String, reflect: true, attribute: 'supporting-text' })
	supportingText = '';

	@property({ reflect: true, converter: reflectNonDefault<number>(DEFAULT_DURATION) })
	duration = DEFAULT_DURATION;

	@state()
	_hasActions = false;

	/** Set by the area: true for the front of the deck, the only one that runs
	 *  its clock. */
	@state()
	private _isFront = false;

	private _timer: number | null = null;

	/** When the running timeout was scheduled, so a pause can work out what is
	 *  left of it. */
	private _timerStartedAt = 0;

	/** Remembered from the events rather than read back from the browser with
	 *  `:hover`: what an engine reports about a stationary pointer over a fixed
	 *  spot differs per engine and per platform. */
	private _pointerInside = false;

	private _focusInside = false;

	/** Moving into the area disconnects and reconnects this element. Without
	 *  this the leave-handler would tear down the very area we are joining. */
	private _moving = false;

	/** What is left of `duration`, so a pause resumes rather than restarts. */
	private _remainingDuration = DEFAULT_DURATION;

	get _resolvedIcon(): string {
		return this.icon || DEFAULT_ICONS[this.variant];
	}

	/** `critical` ignores any duration: a failure stays until it is read. */
	private get _leavesOnItsOwn(): boolean {
		return this.variant !== 'critical' && this.duration > 0;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.setAttribute('role', this.variant === 'critical' ? 'alert' : 'status');
		this._remainingDuration = this.duration;
		this.addEventListener('pointermove', this._onPointerMove);
		this.addEventListener('pointerleave', this._onPointerLeave);
		this.addEventListener('focusin', this._onFocusIn);
		this.addEventListener('focusout', this._onFocusOut);
		this.addEventListener('keydown', this._onKeyDown);
		this.addEventListener('animationend', this._onAnimationEnd);
		// Moving itself has to wait a tick: a framework that just created this
		// element is still holding it, and pulling it out mid-render confuses
		// the very thing that will later remove it.
		queueMicrotask(() => {
			if (!this.isConnected || this._moving) return;
			const area = document.getElementById('nldd-notifications-area');
			if (this.parentElement === area) return;
			this._moving = true;
			joinArea(this, this._t('components.notification.region-label'));
			this._moving = false;
		});
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		if (this._moving) return;
		this._clearTimer();
		this.removeEventListener('pointermove', this._onPointerMove);
		this.removeEventListener('pointerleave', this._onPointerLeave);
		this.removeEventListener('focusin', this._onFocusIn);
		this.removeEventListener('focusout', this._onFocusOut);
		this.removeEventListener('keydown', this._onKeyDown);
		this.removeEventListener('animationend', this._onAnimationEnd);
		// Put back on a page later, it arrives again.
		this.removeAttribute('data-arrived');
		leaveArea(this);
	}

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		if (changed.has('variant')) {
			this.setAttribute('role', this.variant === 'critical' ? 'alert' : 'status');
		}
		if (changed.has('duration')) this._remainingDuration = this.duration;
	}

	/** Called by the area while it carries this notification to another
	 *  parent. A move disconnects the element, and without this the
	 *  notification would read its own disconnect as having been dismissed.
	 *  It also counts as having arrived: the browser starts a CSS animation over
	 *  when its element comes back, and one caught halfway in would slide in
	 *  from off the screen a second time. */
	_setMoving(moving: boolean): void {
		this._moving = moving;
		if (moving) this.toggleAttribute('data-arrived', true);
	}

	/** Called by the area. Starting the clock here rather than on connect is
	 *  the whole point: a notification three deep in the deck is not counting. */
	_setFront(isFront: boolean): void {
		if (this._isFront === isFront) return;
		this._isFront = isFront;
		if (isFront) this._resumeTimer();
		else this._clearTimer();
	}

	_onActionsSlotChange = (e: Event): void => {
		const assigned = (e.target as HTMLSlotElement).assignedElements();
		this._hasActions = assigned.length > 0;
		if (import.meta.env?.DEV && assigned.length > 2) {
			console.warn(
				'[nldd-notification] at most 2 actions: a message that needs three choices '
				+ 'is a decision, and a decision belongs in a dialog that waits for it.',
			);
		}
	};

	/** A move rather than an enter. A notification arrives at a fixed spot on the
	 *  screen, so the browser hit-tests whatever happens to be under the pointer
	 *  and fires a genuine pointerenter without the pointer having moved. Taking
	 *  that as hover parks the clock forever for anyone whose cursor happens to
	 *  rest in that corner, because the pointerleave that would release it never
	 *  comes. A move is someone pointing at it; sitting still is not. */
	private _onPointerMove = (): void => {
		if (this._pointerInside) return;
		this._pointerInside = true;
		this._clearTimer();
	};

	private _onPointerLeave = (): void => {
		this._pointerInside = false;
		this._resumeTimer();
	};

	/** Once in, it stays in: every move to another overlay would otherwise
	 *  replay the arrival. */
	private _onAnimationEnd = (e: AnimationEvent): void => {
		if (e.target !== this || e.animationName !== 'notification-arrive') return;
		this.toggleAttribute('data-arrived', true);
	};

	private _onFocusIn = (): void => {
		this._focusInside = true;
		this._clearTimer();
	};

	private _onFocusOut = (e: FocusEvent): void => {
		// Only when focus really left: moving between the action and the dismiss
		// button is still inside.
		if (this.contains(e.relatedTarget as Node)) return;
		this._focusInside = false;
		this._resumeTimer();
	};

	private _resumeTimer = (): void => {
		if (!this._isFront || !this._leavesOnItsOwn || this._timer !== null) return;
		if (this._pointerInside || this._focusInside) return;
		this._timerStartedAt = Date.now();
		this._timer = window.setTimeout(() => {
			this._timer = null;
			this._dismiss();
		}, this._remainingDuration);
	};

	/** Clears the running timeout and banks what is left of the duration. */
	private _clearTimer(): void {
		if (this._timer === null) return;
		window.clearTimeout(this._timer);
		this._timer = null;
		this._remainingDuration = Math.max(0, this._remainingDuration - (Date.now() - this._timerStartedAt));
	}

	private _onKeyDown = (e: KeyboardEvent): void => {
		if (e.key !== 'Escape') return;
		// Escape dismisses this notification and stops there. Stopping the event is
		// not enough: the close signal a sheet or dialog listens for is the key's
		// default action, and it would take the overlay along. Same as nldd-popover.
		e.preventDefault();
		e.stopPropagation();
		this._dismiss();
	};

	_handleDismiss = (): void => {
		this._dismiss();
	};

	private _dismiss(): void {
		this._clearTimer();
		this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
	}

	override render() {
		return notificationTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-notification': NLDDNotification;
	}
}
