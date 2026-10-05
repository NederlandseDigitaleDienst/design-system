/**
 * Nederlandse Digitale Dienst Banner Component (Lit + TypeScript)
 *
 * An inline notification with a tinted background per variant. Use for
 * persistent, page-level feedback (e.g. an error summary at the top of
 * a form). Banner is more visually present than nldd-inline-dialog —
 * the tinted color catches the eye. If you need a quieter component,
 * pick a different one rather than overriding the banner's ARIA.
 *
 * Layout: icon left, text + supporting text + optional rich content +
 * actions in the center, optional dismiss button right. Buttons wrap
 * to a second row on narrow viewports via nldd-button-group's flex
 * wrapping.
 *
 * ## ARIA
 * role and aria-live are set automatically from the variant:
 * - critical → role="alert" (interrupts screen reader)
 * - others   → role="status" aria-live="polite"
 * Not overridable — if you need a less prominent component, use one.
 *
 * aria-atomic="true" is also set so that updates to the structured region
 * (icon + heading + supporting-text + actions) are announced as one unit
 * rather than as a partial subtree. Trade-off: any programmatic content
 * mutation re-reads the entire banner. Banners are designed for short,
 * heading-scale copy — if you slot in a paragraph of rich body text and
 * then toggle variant or supporting-text at runtime, AT will re-announce
 * the whole thing. Keep banner content concise, or render long-form
 * messages in a different surface.
 *
 * @element nldd-banner
 *
 * @attr {'neutral'|'accent'|'success'|'warning'|'critical'} variant - Color and default icon (default: 'neutral')
 * @attr {'sm'|'md'} size - Banner size (default: 'md'). 'sm' tightens the padding to 8px, drops the icon to 24px and uses a smaller dismiss button — for a bar that sits between chrome and content rather than a standalone page-level notice. The typography is unchanged.
 * @attr {string} icon - Icon override. Default per variant: neutral → info-circle-filled, accent → info-circle-filled, success → check-circle-filled, warning → exclamation-triangle-filled, critical → exclamation-circle-filled
 * @attr {string} text - Main text (heading or paragraph, depending on heading-level)
 * @attr {string} supporting-text - Supporting text below the heading
 * @attr {1|2|3|4|5|6} heading-level - Renders text as h1–h6; absent renders a p
 * @attr {boolean} dismissible - Show a close button in the top-right; emits `dismiss` when clicked
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @slot - Optional rich content between text and actions (e.g. nldd-rich-text)
 * @slot actions - nldd-button elements, wrapped in a horizontal nldd-button-group
 *
 * @fires dismiss - Fired when the dismiss button is clicked. The consumer is responsible for removing/hiding the banner.
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { bannerStyles } from './banner.styles.js';
import { bannerTemplate } from './banner.template.js';
import { nlddBannerTranslations } from './banner.i18n.js';
import type { NLDDBannerTranslations } from './banner.i18n.js';
import '../../content/icon/icon.js';
import '../../actions/button-group/button-group.js';
import '../../actions/icon-button/icon-button.js';
import { translate } from '../../../utilities/translations.js';

export type BannerVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'critical';
export type BannerSize = 'sm' | 'md';

const DEFAULT_ICONS: Record<BannerVariant, string> = {
	neutral: 'info-circle-filled',
	accent: 'info-circle-filled',
	success: 'check-circle-filled',
	warning: 'exclamation-triangle-filled',
	critical: 'exclamation-circle-filled',
};

@customElement('nldd-banner')
export class NLDDBanner extends LitElement {
	static override styles = bannerStyles;

	@property({ reflect: true, converter: reflectNonDefault<BannerVariant>('neutral') })
	variant: BannerVariant = 'neutral';

	@property({ reflect: true, converter: reflectNonDefault<BannerSize>('md') })
	size: BannerSize = 'md';

	@property({ type: String, reflect: true })
	icon = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ type: Number, reflect: true, attribute: 'heading-level' })
	headingLevel: 1 | 2 | 3 | 4 | 5 | 6 | null = null;

	@property({ type: Boolean, reflect: true })
	dismissible = false;

	/** Override one or more translation keys. Unspecified keys fall back to Dutch. */
	@property({ type: Object })
	translations: Partial<NLDDBannerTranslations> = {};

	@state()
	_hasContent = false;

	@state()
	_hasActions = false;

	/** Stored slot-change listener references so disconnectedCallback can
	 *  remove them. Shadow-DOM slots are GC'd with the host, so leakage is
	 *  cosmetic — but we keep cleanup symmetric with addEventListener. */
	private _syncContent?: () => void;
	private _syncActions?: () => void;


	public _t(key: keyof NLDDBannerTranslations): string {
		return translate(this.translations, nlddBannerTranslations, key);
	}

	get _resolvedIcon(): string {
		return this.icon || DEFAULT_ICONS[this.variant];
	}

	/* The host gets role+aria-live based on variant. Critical interrupts
	 * (assertive); other variants are polite announcements. Not exposed
	 * for override — consumers who need quieter semantics should pick a
	 * different component.
	 *
	 * Note on dynamic variant changes: AT engines vary on whether they
	 * re-announce when a live-region's role / aria-live changes after the
	 * element is already in the AT tree. Constructor-time setup covers
	 * the common case (variant fixed at insertion). Toggling variant at
	 * runtime updates the visual treatment immediately but the new
	 * announcement may not fire on every screen reader. */
	override updated(changed: Map<string, unknown>): void {
		if (changed.has('variant')) this._applyAriaForVariant(this.variant);
	}

	private _applyAriaForVariant(variant: BannerVariant): void {
		if (variant === 'critical') {
			this.setAttribute('role', 'alert');
			this.removeAttribute('aria-live');
		} else {
			this.setAttribute('role', 'status');
			this.setAttribute('aria-live', 'polite');
		}
		// Banner is a structured region (icon + heading + supporting-text +
		// actions). Without aria-atomic some screen readers announce only the
		// changed subtree on updates, producing incomplete announcements.
		this.setAttribute('aria-atomic', 'true');
	}

	/** Re-runs every connectedCallback (i.e. also after a move-and-reinsert),
	 *  unlike firstUpdated which is one-shot. Without this, slotchange after
	 *  a reconnect would never update _hasContent / _hasActions because the
	 *  listeners were torn down in disconnectedCallback and never re-attached. */
	private _attachSlotListeners(): void {
		const contentSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
		const actionsSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="actions"]');
		if (!contentSlot && !actionsSlot) return;
		const hasMeaningfulContent = (slot: HTMLSlotElement | undefined | null): boolean => {
			const nodes = slot?.assignedNodes({ flatten: true }) ?? [];
			return nodes.some((n) =>
				n.nodeType === Node.ELEMENT_NODE
				|| (n.nodeType === Node.TEXT_NODE && (n.textContent?.trim() ?? '') !== ''),
			);
		};
		this._syncContent = () => { this._hasContent = hasMeaningfulContent(contentSlot); };
		this._syncActions = () => { this._hasActions = hasMeaningfulContent(actionsSlot); };
		contentSlot?.addEventListener('slotchange', this._syncContent);
		actionsSlot?.addEventListener('slotchange', this._syncActions);
		this._syncContent();
		this._syncActions();
	}

	override firstUpdated(): void {
		this._attachSlotListeners();
	}

	override connectedCallback(): void {
		super.connectedCallback();
		// role + aria-live must be present by the time the banner enters the DOM so
		// AT announces it. This MUST NOT happen in the constructor: setting
		// attributes there is forbidden by the Custom Elements spec, and
		// document.createElement (used by frameworks like Vue) throws
		// NotSupportedError, aborting the render. connectedCallback runs at
		// insertion — exactly when the attributes are needed — and updated() keeps
		// them in sync on later variant changes.
		this._applyAriaForVariant(this.variant);
		// Re-attach when reconnecting after a previous disconnect; firstUpdated
		// doesn't fire again. Guard on shadowRoot existence so we don't run
		// twice on the very first connect (firstUpdated will handle that one).
		if (this.shadowRoot && !this._syncContent) {
			this._attachSlotListeners();
		}
	}

	override disconnectedCallback(): void {
		const contentSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
		const actionsSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="actions"]');
		if (this._syncContent) contentSlot?.removeEventListener('slotchange', this._syncContent);
		if (this._syncActions) actionsSlot?.removeEventListener('slotchange', this._syncActions);
		this._syncContent = undefined;
		this._syncActions = undefined;
		super.disconnectedCallback();
	}

	public _onDismissClick(): void {
		this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
	}

	override render() {
		return bannerTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-banner': NLDDBanner;
	}
}
