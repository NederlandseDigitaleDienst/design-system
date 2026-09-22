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
 *
 * @element nldd-card
 *
 * @attr {'base'|'tinted'} background - Surface color of the card: `base` (default) on a plain page background, `tinted` when the card should stand out against a base surface
 * @attr {string} accessible-label - Accessible name of the card; with `href`/`button` it names the link or button, otherwise the card region
 * @attr {string} href - Makes the whole card a link to this URL (empty = no link)
 * @attr {boolean} button - Makes the whole card a button; ignored when `href` is set
 * @attr {string} target - Link target for href (e.g. '_blank'); adjusts rel automatically and adds an "Opent in nieuw tabblad" announcement for '_blank'
 * @attr {string} rel - Link rel for href; with target '_blank', 'noopener noreferrer' is added to whatever you set
 * @attr {object} translations - Override translation keys (e.g. the "Opent in nieuw tabblad" announcement)
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

export type CardBackground = 'base' | 'tinted';

@customElement('nldd-card')
export class NLDDCard extends withTranslations(LitElement, nlddCardTranslations) {
	static override styles = cardStyles;

	@property({ reflect: true, converter: reflectNonDefault<CardBackground>('base') })
	background: CardBackground = 'base';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel: string | undefined;

	/** When set, the whole card becomes one link to this URL via an overlay anchor.
	 *  Nested interactive content must be raised above it (position: relative;
	 *  z-index: 1) to stay clickable. */
	@property({ type: String, reflect: true })
	href = '';

	/** Makes the whole card a button via an overlay `<button>`: activation (click,
	 *  Enter, Space) surfaces as a composed `click` on the host, so a listener or
	 *  htmx attribute on the card just works. Ignored when `href` is set — a card
	 *  is one action, and a link outranks a button. */
	@property({ type: Boolean, reflect: true })
	button = false;

	@property({ type: String })
	target = '';

	@property({ type: String })
	rel = '';

	private _warnedLabel = false;

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
		this.style.containerType = 'inline-size';
		this.style.containerName = 'layout-container';
	}

	override updated(): void {
		this.classList.toggle('is-action-focused', this._actionFocused);
		// An interactive card with no accessible name is a silent a11y failure —
		// the overlay control has no text. Warn once in dev (like nldd-image does
		// for alt); stay quiet in production.
		if (import.meta.env?.DEV) {
			const missing = (!!this.href || this.button) && !(this.accessibleLabel ?? '').trim();
			if (missing && !this._warnedLabel) {
				this._warnedLabel = true;
				console.warn('<nldd-card>: a card with `href` or `button` needs `accessible-label` so the control has an accessible name.');
			} else if (!missing) {
				this._warnedLabel = false;
			}
		}
	}

	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		const wrapper = slot.parentElement as HTMLElement;
		wrapper.hidden = slot.assignedElements().length === 0;
	};

	override disconnectedCallback() {
		this.removeEventListener('focusin', this._onFocusIn);
		this.removeEventListener('focusout', this._onFocusOut);
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
