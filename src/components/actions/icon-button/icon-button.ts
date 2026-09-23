/**
 * Nederlandse Digitale Dienst Icon Button Component (Lit + TypeScript)
 *
 * @element nldd-icon-button
 * @attr {string} variant - Button variant: 'accent-filled' | 'accent-transparent' | 'neutral-tinted' | 'neutral-transparent' | 'critical-tinted' | 'critical-transparent' | 'inherit-filled' | 'inherit-tinted' | 'primary' | 'secondary' | 'destructive'. The inherit variants derive their colors from currentColor, for buttons on colored surfaces.
 * @attr {string} size - Button size: 'xs' | 'sm' | 'md' | 'lg' (default: 'md')
 * @attr {boolean} hide-lg-text - In lg size, hides the text label and enlarges the icon by one step (28px)
 * @attr {boolean} no-highlight-border - Removes the per-variant highlight border (e.g. when a control group draws a single border instead).
 * @attr {boolean} loading - Loading state (default: false). Shows an activity indicator over the visually hidden icon, sets aria-busy on the inner control and blocks activation, without dropping the button from the tab order (unlike disabled).
 * @attr {boolean} disabled - Disabled state
 * @attr {boolean} no-tab - Takes the button out of the tab order (tabindex="-1"), for a control owned by a roving container (an nldd-token in nldd-token-field, a button in a row of an nldd-list) that manages focus itself. Still mouse- and script-focusable.
 * @attr {string} type - Button type for form submission: 'button' | 'submit' | 'reset' (ignored when href is set)
 * @attr {boolean} expandable - Whether the button opens a menu or popover and shows chevron next to the icon
 * @attr {boolean} expanded - Whether the popover/menu controlled by this button is currently open. Forwarded as aria-expanded on the inner button; toggles the is-expanded visual state.
 * @attr {string} popup-type - Type of popup container this button opens: 'menu' | 'listbox' | 'dialog' | 'tree' | 'grid'. Sets aria-haspopup on the inner button and forces aria-expanded to always be present (true/false) so screen readers know the popup state. An nldd-menu or nldd-popover in the `popup` slot, or anchored to this button, sets it itself from the first render; set it only for another kind of popup.
 * @attr {string} width - Width mode: 'full' (stretches to container) or any CSS length (e.g. '240px')
 * @attr {string} text - Button text, used as aria-label and shown below the icon in lg size
 * @attr {string} icon - Icon name for the nldd-icon element. Defaults to a placeholder icon when neither this attribute nor the icon slot is set.
 * @attr {string} accessible-label - Accessible label for screen readers. Overrides text as aria-label and title tooltip. Use when the visible text alone lacks context for screen readers (e.g. text "Toon", accessible-label "Toon wachtwoord"). The text is still shown visually in lg size regardless.
 * @attr {string} tooltip-timing - Forwarded to the inner nldd-tooltip's `timing`: 'delay' (the default, a 700 ms show-delay), 'instant', or 'never' (suppress the visual tooltip; screen readers still get the aria-label). Use 'never' when the surrounding context already explains the button (e.g. spin buttons in nldd-number-field, the chevron in nldd-split-button).
 * @attr {string} href - When set, renders an <a> element instead of <button>
 * @attr {string} target - Link target (e.g. '_blank'); only used when href is set. With '_blank' the "opens in new tab" announcement is folded into the aria-label for screen readers (WCAG 2.1 SC 3.2.2).
 * @attr {string} rel - Link rel attribute, used with href; with target '_blank', 'noopener noreferrer' is added to whatever you set
 * @attr {object} translations - Override translation keys (e.g. the "opens in new tab" announcement); unset keys fall back to Dutch.
 * @attr {string} popovertarget - ID of a popover element to toggle; forwarded to the inner <button>
 *
 * @slot icon - Slot for a custom icon (e.g. custom SVG). Only used when icon attribute is not set; falls back to a placeholder icon when the slot is empty.
 * @slot popup - A single `nldd-menu` or `nldd-popover` this button invokes. Slotting it auto-anchors the overlay to the button and toggles it on click (no id/anchor wiring). The overlay syncs `expanded` and `aria-haspopup` back onto the button. Add `expandable` for the disclosure chevron. Mirrors nldd-split-button; manual `popovertarget` wiring keeps working without a slotted overlay.
 *
 * @example
 * ```html
 * <nldd-icon-button text="Download" icon="download"></nldd-icon-button>
 * ```
 *
 * @fires click - When button is clicked (not fired when disabled)
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { iconButtonStyles } from './icon-button.styles.js';
import { template } from './icon-button.template.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddIconButtonTranslations } from './icon-button.i18n.js';
import { PopupAnchorController } from '../../../utilities/popup-anchor-controller.js';
import './../../content/icon/icon.js';
import './../../status-and-feedback/activity-indicator/activity-indicator.js';

export type Size = 'xs' | 'sm' | 'md' | 'lg';
export type Variant =
	| 'primary'
	| 'secondary'
	| 'destructive'
	| 'accent-filled'
	| 'accent-transparent'
	| 'neutral-tinted'
	| 'neutral-base'
	| 'neutral-transparent'
	| 'critical-tinted'
	| 'critical-transparent'
	| 'inherit-filled'
	| 'inherit-tinted';
export type ButtonType = 'button' | 'submit' | 'reset';
export type PopupType = 'menu' | 'listbox' | 'dialog' | 'tree' | 'grid';

@customElement('nldd-icon-button')
export class NLDDIconButton extends withTranslations(LitElement, nlddIconButtonTranslations) {
	static override styles = iconButtonStyles;

	// Form-associated so a type="submit"/"reset" icon-button can drive its
	// form. The inner <button> lives in the shadow root and has no form owner
	// across the shadow boundary, so the host element must carry the association.
	static formAssociated = true;
	private _internals = this.attachInternals();

	@property({ reflect: true, converter: reflectNonDefault<Variant>('neutral-tinted') })
	variant: Variant = 'neutral-tinted';

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	/** In lg size, hides the text label and enlarges the icon by one step (28px). */
	@property({ type: Boolean, reflect: true, attribute: 'hide-lg-text' })
	hideLgText = false;

	/**
	 * Loading state. Shows an activity indicator centered over the (visually
	 * hidden) icon, marks the inner control `aria-busy="true"` and blocks
	 * activation — without dropping the control from the tab order (unlike
	 * `disabled`).
	 *
	 * Activation is blocked by stopping the click (as `disabled` does), so a
	 * `click` listener delegated on an ancestor receives nothing while loading.
	 */
	@property({ type: Boolean, reflect: true })
	loading = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	/** Removes the per-variant highlight border (e.g. when nldd-button-bar draws a single group border instead). */
	@property({ type: Boolean, reflect: true, attribute: 'no-highlight-border' })
	noHighlightBorder = false;

	@property({ type: String, reflect: true })
	type: ButtonType = 'button';

	@property({ type: Boolean, reflect: true, attribute: 'expandable' })
	expandable = false;

	@property({ type: Boolean, reflect: true })
	expanded = false;

	/** Take the button out of the tab order (`tabindex="-1"`) — for a control owned by
	 *  a roving container (e.g. an `nldd-token` in `nldd-token-field`) that manages
	 *  focus itself. Still mouse- and script-focusable. */
	@property({ type: Boolean, reflect: true, attribute: 'no-tab' })
	noTab = false;

	/**
	 * Type of popup container this button opens. Sets `aria-haspopup` on the
	 * inner button and forces `aria-expanded` to always be present (true/false)
	 * so screen readers can announce both the popup type and its current state.
	 */
	@property({ type: String, reflect: true, attribute: 'popup-type' })
	popupType?: PopupType;

	/** Width mode: 'full' (stretch to container) or any CSS length. */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	width = '';

	@property({ type: String })
	popovertarget: string | undefined = undefined;

	/**
	 * Direct element reference to the popover this button invokes — IDL-only
	 * counterpart to `popovertarget` that works across shadow boundaries.
	 * Use this when the popover lives in a different tree (e.g. an
	 * `nldd-menu` reparented to `<body>`) so the browser still recognizes
	 * this button as the popover's invoker and excludes it from the popover
	 * light-dismiss algorithm. Set programmatically; not reflected to an
	 * HTML attribute (the attribute form is `popovertarget`, ID-based).
	 */
	@property({ attribute: false })
	popoverTargetElement: Element | null = null;

	/**
	 * Action the browser performs when the button is clicked, mirroring the
	 * standard `popovertargetaction` attribute. Defaults to `'toggle'`. Use
	 * `'show'` when a separate handler owns the close path (e.g. the
	 * consumer toggles the popover programmatically) so the browser's
	 * default action doesn't double-fire.
	 */
	@property({ attribute: false })
	popoverTargetAction: 'toggle' | 'show' | 'hide' = 'toggle';

	/** Button text, used as aria-label and shown below the icon in lg size. */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	/** Icon name for the nldd-icon element. When not set, the icon slot is used,
	 *  falling back to a placeholder icon when that slot is also empty. */
	@property({ type: String })
	icon = '';

	/** Accessible label for screen readers. Overrides text as aria-label and title tooltip.
	 *  The text is still shown visually in lg size regardless. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** Forwarded to the inner nldd-tooltip's `timing`. Use `'never'` to
	 * suppress the visual tooltip; aria-label still describes the button. */
	@property({ reflect: true, attribute: 'tooltip-timing', converter: reflectNonDefault<'delay' | 'instant' | 'never'>('delay') })
	tooltipTiming: 'delay' | 'instant' | 'never' = 'delay';

	/** When set, renders an <a> element instead of <button>. */
	@property({ type: String, reflect: true })
	href: string | undefined = undefined;

	/** Link target (e.g. '_blank'). Only used when href is set. */
	@property({ type: String })
	target: string | undefined = undefined;

	/**
	 * Link rel attribute. Only used when href is set.
	 * With target '_blank', 'noopener noreferrer' is added to it.
	 */
	@property({ type: String })
	rel: string | undefined = undefined;

	/** Whether an icon is present via attribute or slot. */
	private get _hasIcon(): boolean {
		if (this.icon) return true;
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="icon"]');
		return (slot?.assignedElements().length ?? 0) > 0;
	}

	private _warnedA11y = false;

	/** Shared wiring for an overlay slotted into `popup`: anchors it to this
	 * button and turns clicks into open/close. Not private: the template module
	 * binds its handlers. */
	_popup = new PopupAnchorController(this);

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('width')) {
			const w = this.width;
			// 'full' switches host to block + 100% via CSS attribute selector.
			// A valid CSS length is applied as inline style.width on the host.
			// In either case the inner button stretches via --_width, so
			// a custom width on the host translates to a wide button instead
			// of leaving the size-based square. Invalid values do nothing.
			const isFull = w === 'full';
			const isValidLength = !!w && !isFull && CSS.supports('width', w);
			this.style.width = isValidLength ? w : '';
			if (isFull || isValidLength) {
				this.style.setProperty('--_width', '100%');
			} else {
				this.style.removeProperty('--_width');
			}
		}
		const inaccessible = this._hasIcon && !this.text && !this.accessibleLabel;
		if (import.meta.env?.DEV && inaccessible && !this._warnedA11y) {
			this._warnedA11y = true;
			console.warn('<nldd-icon-button>: icon is set without text or accessible-label. This produces an inaccessible button (WCAG SC 4.1.2). Add a text or accessible-label attribute.');
		} else if (!inaccessible) {
			this._warnedA11y = false;
		}
	}

	protected _handleClick(e: MouseEvent): void {
		if (this.disabled || this.loading) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		// A slotted overlay makes this button its invoker: toggle it and stop —
		// a popup button neither submits a form nor navigates.
		if (this._popup.handleClick(e)) {
			e.preventDefault();
			return;
		}
		// A link icon-button has no form behavior. Otherwise drive the
		// associated form ourselves: the shadow <button type="submit"|"reset">
		// can't reach the light-DOM form across the shadow boundary.
		//
		// Limitation: we call requestSubmit() without a submitter, so
		// SubmitEvent.submitter is null. A form handler that branches on
		// event.submitter to tell multiple submit buttons apart won't see this
		// element. There is no fix via requestSubmit(submitter): the inner shadow
		// <button> is not a form descendant (throws NotFoundError) and this host
		// is not a "submit button" per spec (throws TypeError) — both verified.
		// Consumers that need to distinguish submitters should use a hidden field
		// or separate forms.
		if (this.href) return;
		if (this.type === 'submit') this._internals.form?.requestSubmit();
		else if (this.type === 'reset') this._internals.form?.reset();
	}

	/**
	 * Delegates focus to the inner `<button>` (or `<a>` when `href` is set), so
	 * consumers can call `iconButtonEl.focus()` without reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		this.shadowRoot?.querySelector<HTMLElement>('.icon-button')?.focus(options);
	}

	// Stable reference (not an inline arrow) so Lit does not re-add the slot
	// listener every render; mirrors the other @slotchange handlers.
	_onIconSlotChange(): void {
		this.requestUpdate();
	}

	override render() {
		return template.call(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-icon-button': NLDDIconButton;
	}
}
