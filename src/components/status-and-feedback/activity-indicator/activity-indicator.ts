/**
 * Nederlandse Digitale Dienst Activity Indicator Component (Lit + TypeScript)
 *
 * Layout placeholder that fills its parent and centers an indeterminate
 * activity indicator. By default the indicator is held back for 1000ms so
 * brief loading states don't flash; once the delay passes it fades in. Set
 * `timing="instant"` to skip the delay (the fade-in still plays) — this is
 * what embedding components such as `nldd-button` use for their loading state.
 *
 * The default indicator is a simple icon-sized circle that follows the shared
 * `--context-content-color` channel (set by list-item / table / menu on their
 * content), falling back to `currentColor` wherever that channel is unset
 * (buttons, rich-text, standalone) — so a spinner inside a cell tracks the
 * row's state-aware content color, while embedders relying on currentColor are
 * unaffected. An optional label sits below (hidden unless `show-text` is set).
 * Drop a
 * `<nldd-progress-circle>`, `<nldd-progress-bar>` or any element in the
 * `indicator` slot to override it.
 *
 * Icon alignment: the visible ring already sits at 5/6 of its box (the SVG's
 * r=9 plus a 2-unit stroke in a 24 view-box, the same optical inset a filled
 * icon glyph has), so a standalone spinner lines up with an icon or an
 * `icon-aligned` `nldd-avatar` on the same grid — no extra option needed
 * (unlike `nldd-avatar`, which fills edge-to-edge and opts in via
 * `icon-aligned`).
 *
 * Overlay mode: put content in the default slot and the indicator wraps it — it
 * becomes a `position: relative` container, renders the spinner over a dimming
 * backdrop (opt out with `no-backdrop`), and makes the content `inert` so its
 * controls can't be focused or clicked. Toggle loading with `complete`
 * (`?complete=${!isLoading}`). With no slotted content it stays the standalone
 * placeholder described above.
 *
 * Reconnect behavior: every `connectedCallback` resets the timer and hides
 * the indicator again. If a consumer toggles the element via a conditional
 * render (remove + re-insert) the indicator disappears and re-fades after
 * another delay. Keep the element mounted and toggle visibility / `hidden`
 * instead if you want the timer to run only once.
 *
 * Accessibility: while connected and not `complete` the host is a polite live
 * region (`role="status"`). The label (`text`, or the translated "Laden"
 * fallback) always renders as the region's content — visually hidden when
 * `show-text` is off (the default) — so assistive tech announces the loading
 * state when the indicator appears. Set `complete` (or unmount) to clear it.
 *
 * @element nldd-activity-indicator
 *
 * @attr {string} size - Circle diameter on the icon scale: 16,20,24,28,32,40,44,48,56,64,80,96 (default '32')
 * @attr {boolean} show-text - Show the label under the indicator (default false; the label still feeds the accessible name)
 * @attr {string} text - Label text. Falls back to the translated "Laden" when unset.
 * @attr {'delay'|'instant'} timing - 'delay' (the default) waits 1000ms before showing (anti-flash); 'instant' shows immediately (the fade-in still plays).
 * @attr {boolean} complete - Mark the loader as finished while keeping the element mounted; clears aria-busy and hides the indicator.
 * @attr {boolean} no-backdrop - Overlay mode dims and blurs the wrapped content with a frosted backdrop by default; set this to show only the indicator panel without dimming. No effect in standalone mode.
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @slot - Content to wrap (overlay mode); made inert while loading. Leave empty
 *   for the standalone placeholder.
 * @slot indicator - Optional custom indicator; overrides the default circle (and
 *   its visually-hidden label). Consumers replacing it supply their own indicator
 *   semantics; the host's role="status" still marks the loading region.
 *
 * @migration The custom-indicator override moved from the default slot to the
 *   `indicator` slot, since the default slot now holds wrapped content:
 *   `<nldd-progress-bar slot="indicator">`.
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { activityIndicatorStyles } from './activity-indicator.styles.js';
import { activityIndicatorTemplate } from './activity-indicator.template.js';
import { nlddActivityIndicatorTranslations } from './activity-indicator.i18n.js';
import type { NLDDActivityIndicatorTranslations } from './activity-indicator.i18n.js';
import { translate } from '../../../utilities/translations.js';

/** Delay before the indicator fades in. Brief loading states finish within
 *  this window and the indicator is never shown — avoids a jarring flash. */
const DELAY_MS = 1000;

export type ActivityIndicatorSize =
	'16' | '20' | '24' | '28' | '32' | '40' | '44' | '48' | '56' | '64' | '80' | '96';
export type ActivityIndicatorTiming = 'delay' | 'instant';

@customElement('nldd-activity-indicator')
export class NLDDActivityIndicator extends LitElement {
	static override styles = activityIndicatorStyles;

	@property({ reflect: true, converter: reflectNonDefault<ActivityIndicatorSize>('32') })
	size: ActivityIndicatorSize = '32';

	/** Show the label under the indicator. The label always feeds the
	 *  accessible name (aria-label); this only controls visibility. */
	@property({ type: Boolean, reflect: true, attribute: 'show-text' })
	showText = false;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	/** 'delay' waits {@link DELAY_MS} before showing; 'instant' shows
	 *  immediately. The fade-in plays either way. */
	@property({ reflect: true, converter: reflectNonDefault<ActivityIndicatorTiming>('delay') })
	timing: ActivityIndicatorTiming = 'delay';

	/** Mark the loader as finished while keeping the element mounted.
	 *  Clears aria-busy and hides the indicator. Default false. */
	@property({ type: Boolean, reflect: true })
	complete = false;

	/** Opt out of the dimming backdrop in overlay mode. With wrapped content the
	 *  backdrop is on by default — the content is inert, so it should read as
	 *  inactive — so set `no-backdrop` to show only the indicator panel without
	 *  dimming/blurring the content. No effect in standalone mode (no content to
	 *  dim). */
	@property({ type: Boolean, reflect: true, attribute: 'no-backdrop' })
	noBackdrop = false;

	@property({ type: Object })
	translations: Partial<NLDDActivityIndicatorTranslations> = {};

	@state()
	_visible = false;

	/** Whether the default slot holds wrapped content (overlay mode) instead of
	 *  being empty (standalone placeholder). Drives the host layout and whether
	 *  the content is made inert while loading. */
	@state()
	_hasContent = false;

	private _delayTimeout?: ReturnType<typeof setTimeout>;

	/** Track default-slot content so the component can switch between the
	 *  standalone placeholder and the content-wrapping overlay, and disable the
	 *  wrapped content (via `inert`) while loading. */
	_onContentSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		this._hasContent = slot.assignedElements().length > 0;
	};

	public _t(key: keyof NLDDActivityIndicatorTranslations): string {
		return translate(this.translations, nlddActivityIndicatorTranslations, key);
	}

	/** Accessible name announced while loading. */
	public get _accessibleName(): string {
		return this.text || this._t('components.activity-indicator.loading-label');
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this._syncAria();
		// timing="instant" skips the anti-flash delay. The fade-in still plays:
		// it lives on the indicator wrapper, not on this timer.
		this._visible = this.timing === 'instant';
		if (!this._visible && !this.complete) this._scheduleDelay();
	}

	override willUpdate(changed: Map<string, unknown>): void {
		// role="status" presence tracks `complete` (the label itself is
		// reactive in the template, so it needs no manual sync).
		if (changed.has('complete')) {
			this._syncAria();
		}
		// `timing` can flip after connection (e.g. an embedding control switches
		// to "instant"); re-evaluate the anti-flash delay so it isn't left stuck.
		if (changed.has('timing')) {
			this._clearDelay();
			if (this.timing === 'instant') {
				this._visible = true;
			} else if (!this._visible && !this.complete) {
				this._scheduleDelay();
			}
		}
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._clearDelay();
	}

	private _clearDelay(): void {
		if (this._delayTimeout) {
			clearTimeout(this._delayTimeout);
			this._delayTimeout = undefined;
		}
	}

	private _scheduleDelay(): void {
		this._delayTimeout = setTimeout(() => {
			this._visible = true;
			this._delayTimeout = undefined;
		}, DELAY_MS);
	}

	/** A polite live region (role="status") while loading; cleared when
	 *  complete. The announced text is the visually-hidden label rendered by
	 *  the template — not an aria-label, and without aria-busy, since a busy
	 *  live region would defer the very announcement we want. */
	private _syncAria(): void {
		if (this.complete) {
			this.removeAttribute('role');
		} else {
			this.setAttribute('role', 'status');
		}
	}

	override updated(): void {
		// Reflect derived state as host attributes the styles key off: `loading`
		// drives the indicator + backdrop fade (in AND out); `has-content` switches
		// between the standalone placeholder and the content-wrapping overlay.
		this.toggleAttribute('loading', this._visible && !this.complete);
		this.toggleAttribute('has-content', this._hasContent);
	}

	override render() {
		return activityIndicatorTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-activity-indicator': NLDDActivityIndicator;
	}
}
