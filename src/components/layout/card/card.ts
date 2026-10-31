/**
 * Nederlandse Digitale Dienst Card Component (Lit + TypeScript)
 *
 * A visually bounded card with optional header, body and footer sections. The
 * card is elevated by default. Padding is left to nested containers.
 *
 * With `href` the whole card becomes a link (an overlay anchor across the
 * card), with `button` a button (an overlay button that fires a plain, composed
 * `click`, so a click listener or htmx attribute on the card itself works
 * directly, and Enter/Space work natively). `href` wins when both are set.
 * Nested interactive content, footer buttons for instance, has to be lifted
 * above it with `position: relative; z-index: 1` to stay clickable.
 * A card that is a link or button steps its surface and border one shade up
 * on hover and one more while pressed, as a neutral-base button does; content
 * lifted above the overlay does not set it off. On a touch screen there is no
 * hover, and a touch that turns into a scroll lets go of the pressed shade.
 *
 * @element nldd-card
 *
 * @attr {'base'|'tinted'|'accent-tinted'} background - Surface color of the card: `base` (default) on a plain page background, `tinted` when the card should stand out against a base surface, `accent-tinted` for a tint of the theme's accent with the contrast of `tinted`
 * @attr {string} accessible-label - Accessible name of the card; with `href`/`button` it names the link or button, otherwise the card region
 * @attr {object} translations - Override translation keys (e.g. the "opent in nieuw tabblad" announcement)
 * @attr {string} href - Makes the whole card a link to this URL (empty = no link)
 * @attr {string} target - Link target for href (e.g. '_blank'); adjusts rel automatically and adds an "opent in nieuw tabblad" announcement for '_blank'. An `href` to another origin than the page (another website, a subdomain too) adds a visually hidden "andere website", in one sentence with the new-tab announcement when both apply; there is no way to switch it off.
 * @attr {string} download - Saves the file the link points at instead of opening it; only used with href. Without a value the browser takes the name from the URL, with one that is the file name. A browser ignores it for a URL on another origin and opens the file there. Adds a visually hidden "downloadt bestand" for screen readers. Leave `target` off: a download opens no tab.
 * @attr {string} rel - Link rel for href; with target '_blank', 'noopener noreferrer' is added to whatever you set
 * @attr {boolean} button - Makes the whole card a button; ignored when `href` is set
 *
 * @slot header - Header content (e.g. nldd-title)
 * @slot - Body content
 * @slot footer - Footer content (e.g. nldd-button-group), always at the bottom
 */

import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { cardStyles } from './card.styles.js';
import { cardTemplate } from './card.template.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddCardTranslations } from './card.i18n.js';
import { reflectWhenSet } from '../../../utilities/reflect-when-set.js';
import '../../../utilities/dev-checks-trigger.js';

export type CardBackground = 'base' | 'tinted' | 'accent-tinted';

@customElement('nldd-card')
export class NLDDCard extends withTranslations(LitElement, nlddCardTranslations) {
	static override styles = cardStyles;

	@property({ reflect: true, converter: reflectNonDefault<CardBackground>('base') })
	background: CardBackground = 'base';

	@property({ type: String, attribute: 'accessible-label', reflect: true, converter: reflectWhenSet })
	accessibleLabel: string | undefined;

	/** When set, the whole card becomes one link to this URL via an overlay anchor.
	 *  Nested interactive content must be raised above it (position: relative;
	 *  z-index: 1) to stay clickable. */
	@property({ type: String, reflect: true })
	href = '';

	@property({ type: String })
	target = '';

	/** Saves the file instead of opening it; only used when href is set. Empty
	 *  for the name from the URL, a name to save it under. */
	@property({ type: String })
	download: string | undefined = undefined;

	@property({ type: String })
	rel = '';

	/** Makes the whole card a button via an overlay `<button>`: activation (click,
	 *  Enter, Space) surfaces as a composed `click` on the host, so a listener or
	 *  htmx attribute on the card just works. Ignored when `href` is set — a card
	 *  is one action, and a link outranks a button. */
	@property({ type: Boolean, reflect: true })
	button = false;


	/** True while the card's own overlay control holds keyboard focus. Drives the
	 *  focus ring from JS rather than from `:has(… :focus-visible)` in CSS:
	 *  Safari does not re-evaluate a dynamic pseudo-class inside `:has()`, so the
	 *  ring stayed away there while it worked in Chromium. */
	@state()
	private _actionFocused = false;

	private _onFocusIn = (e: FocusEvent): void => {
		// composedPath()[0], not e.target: the control lives in the shadow root, so
		// the event is retargeted to the host by the time it reaches this listener.
		const focused = e.composedPath()[0] as Element | undefined;
		this._actionFocused = !!focused?.matches?.('.card__action:focus-visible');
	};

	private _onFocusOut = (): void => {
		this._actionFocused = false;
	};

	/**
	 * The pressed shade, set by the card rather than by `:active`. A touch that
	 * turns into a scroll then clears it, since the browser fires
	 * `pointercancel` for that pointer, where `:active` could flash or linger
	 * while the page moves. Only a press on the card's own overlay counts, not
	 * one on content lifted above it. An attribute and not a class, so a
	 * framework that owns the card's `class` cannot wipe it mid-press.
	 */
	private _onPointerDown = (e: PointerEvent): void => {
		if (e.button > 0) return;
		const target = e.composedPath()[0] as Element | undefined;
		if (!target?.matches?.('.card__action')) return;
		this.toggleAttribute('data-action-pressed', true);
		window.addEventListener('pointerup', this._clearPressed);
		window.addEventListener('pointercancel', this._clearPressed);
	};

	private _clearPressed = (): void => {
		window.removeEventListener('pointerup', this._clearPressed);
		window.removeEventListener('pointercancel', this._clearPressed);
		this.removeAttribute('data-action-pressed');
	};

	override connectedCallback() {
		super.connectedCallback();
		// Set container-type/name as inline style on the host. Doing this from
		// a `:host` rule inside the shadow DOM works in Chromium but Safari
		// does not always recognize the host as a container for slotted
		// descendants — a known engine inconsistency.
		//
		// We don't clear these on disconnect: a DOM move (disconnect →
		// reconnect) would just re-set them, and there's no scenario where the
		// styles being absent is meaningful. They are effectively part of the
		// element's identity, written once and kept.
		this.addEventListener('focusin', this._onFocusIn);
		this.addEventListener('focusout', this._onFocusOut);
		this.addEventListener('pointerdown', this._onPointerDown);
		this.style.containerType = 'inline-size';
		this.style.containerName = 'layout-container';
	}

	override updated(): void {
		this.toggleAttribute('data-action-focused', this._actionFocused);
	}

	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		const wrapper = slot.parentElement as HTMLElement;
		wrapper.hidden = slot.assignedElements().length === 0;
	};

	override disconnectedCallback() {
		this.removeEventListener('focusin', this._onFocusIn);
		this.removeEventListener('focusout', this._onFocusOut);
		this.removeEventListener('pointerdown', this._onPointerDown);
		this._clearPressed();
		super.disconnectedCallback();
	}

	override render() {
		return cardTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-card': NLDDCard;
	}
}
