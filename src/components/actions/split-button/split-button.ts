/**
 * Nederlandse Digitale Dienst Split Button Component (Lit + TypeScript)
 *
 * A split button combines a primary action with a chevron that opens its
 * alternatives. The main button performs the default action; the chevron opens
 * a menu or popover of variants of that same action.
 *
 * The overlay is required. Put an `nldd-menu` or `nldd-popover` in the `popup`
 * slot, as on nldd-button and nldd-icon-button:
 *
 * ```html
 * <nldd-split-button text="Bewaar">
 *   <nldd-menu slot="popup">
 *     <nldd-menu-item text="Opslaan als…"></nldd-menu-item>
 *   </nldd-menu>
 * </nldd-split-button>
 * ```
 *
 * The split button has no other slots, so an overlay without `slot="popup"`
 * works too. When both hold one, the one in `popup` wins. For an overlay that
 * lives elsewhere, point `popovertarget` at it instead.
 *
 * The chevron is the overlay's invoker: it anchors it, opens and closes it, and
 * takes `aria-expanded` and `aria-haspopup` from it, exactly as an
 * nldd-icon-button with a slotted overlay does. Its accessible name says which
 * action it belongs to ("Meer opties voor Bewaar").
 *
 * The API is narrower than nldd-button on purpose: a split button is an action
 * with variants, so it has no supporting text, no end icon and no link target.
 * Its label always stays on one line, without an ellipsis: keep it short.
 *
 * @element nldd-split-button
 * @attr {string} size - Button size: 'xs' | 'sm' | 'md' | 'lg' (default: 'md')
 * @attr {string} appearance - Visual style: 'neutral-tinted' (default) | 'neutral-base' | 'accent-filled' | 'primary' | 'secondary' | 'inherit-tinted' | 'inherit-filled'. 'primary' is 'accent-filled' and 'secondary' is 'neutral-tinted'. The inherit appearances are for a colored surface. There are no transparent appearances: the split button needs a surface of its own to show it is one control.
 * @attr {boolean} disabled - Disabled state. Avoid it: let the action run and say afterwards what is missing; the design guidelines say why.
 * @attr {boolean} loading - Loading state of the main action, as on nldd-button. The chevron stays available.
 * @attr {string} loading-text - What the screen reader announces while `loading` is on, as on nldd-button.
 * @attr {string} width - Width mode: 'full' (stretches to container) or any CSS length; the main action button fills the available space
 * @attr {string} text - Button text for the primary action
 * @attr {string} icon - Icon name shown before the text on the primary action button
 * @attr {string} type - What the main action does in a form: 'button' (default) | 'submit' | 'reset'. Ignored when `href` is set.
 * @attr {string} form - Id of the form the main action submits or resets, for a split button outside it. Takes an `nldd-form` as well as a plain `<form>`, as on nldd-button.
 * @attr {string} href - Turns the main action into a link, as on nldd-button.
 * @attr {string} download - Saves the file `href` points at instead of opening it, as on nldd-button. Only used with `href`.
 * @attr {string} popovertarget - ID of an `nldd-menu` or `nldd-popover` elsewhere in this tree that the chevron opens, for an overlay that cannot be a child. A slotted overlay wins.
 * @attr {string} shortcut - Keyboard shortcut hint for the primary action, shown right after its text, e.g. 'Cmd+S'. Forwarded to the inner nldd-button; display only, wire up the handling in your app.
 * @attr {string} shortcut-mac - Override of `shortcut` on macOS, where the keys differ (falls back to `shortcut`).
 * @attr {string} shortcut-windows - Override of `shortcut` on Windows (falls back to `shortcut`).
 * @attr {string} shortcut-linux - Override of `shortcut` on Linux (falls back to `shortcut`).
 * @attr {object} translations - Translations; unset keys fall back to Dutch
 *
 * @slot popup - The `nldd-menu` or `nldd-popover` the chevron opens.
 * @slot - Fallback for the overlay when it has no `slot="popup"`. Anything that is not an `nldd-menu` or `nldd-popover` does nothing here.
 *
 * @fires action-click - Fired when the main button is clicked
 */
import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { internalsOf } from '../../../utilities/element-state.js';
import { ownerForm } from '../../../utilities/owner-form.js';
import { popoverTargetOf } from '../../../utilities/popover-target.js';
import { translate } from '../../../utilities/translations.js';
import { splitButtonStyles } from './split-button.styles.js';
import { splitButtonTemplate } from './split-button.template.js';
import { nlddSplitButtonTranslations } from './split-button.i18n.js';
import type { NLDDSplitButtonTranslations } from './split-button.i18n.js';
import type { NLDDIconButton } from '../icon-button/icon-button.js';
import './../button/button.js';
import './../icon-button/icon-button.js';
import '../../actions/menu/menu.js';

export type Size = 'xs' | 'sm' | 'md' | 'lg';

export type SplitButtonAppearance =
	| 'neutral-tinted'
	| 'neutral-base'
	| 'accent-filled'
	| 'primary'
	| 'secondary'
	| 'inherit-tinted'
	| 'inherit-filled';

@customElement('nldd-split-button')
export class NLDDSplitButton extends LitElement {
	static override styles = splitButtonStyles;

	/** Form-associated, so a submit split button finds the form it sits in:
	 *  its action button is in this shadow root and has no form owner. */
	static formAssociated = true;
	private _internals = internalsOf(this);

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	@property({ reflect: true, converter: reflectNonDefault<SplitButtonAppearance>('neutral-tinted') })
	appearance: SplitButtonAppearance = 'neutral-tinted';

	@property({ type: Boolean, reflect: true })
	disabled = false;

	/** Loading state of the main action. The chevron stays available. */
	@property({ type: Boolean, reflect: true })
	loading = false;

	/** What the screen reader announces while `loading` is on. */
	@property({ attribute: 'loading-text' })
	loadingText = '';

	/** Width mode: 'full' (stretch to container) or any CSS length. The main action button fills the available space. */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	width = '';

	/** Button text for the primary action. */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	/** Icon name shown before the text on the primary action button. */
	@property({ type: String })
	icon = '';

	/** What the main action does in a form. Ignored when `href` is set. */
	@property({ reflect: true, converter: reflectNonDefault<'button' | 'submit' | 'reset'>('button') })
	type: 'button' | 'submit' | 'reset' = 'button';

	/** Turns the main action into a link. */
	@property()
	href?: string;

	/** Saves the file `href` points at instead of opening it. */
	@property()
	download?: string;

	/** ID of an overlay elsewhere in this tree that the chevron opens. */
	@property()
	popovertarget?: string;

	/** Direct reference to that overlay, for one in another tree. */
	@property({ attribute: false })
	popoverTargetElement: Element | null = null;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	shortcut = '';

	@property({ reflect: true, attribute: 'shortcut-mac', converter: reflectNonDefault<string>('') })
	shortcutMac = '';

	@property({ reflect: true, attribute: 'shortcut-windows', converter: reflectNonDefault<string>('') })
	shortcutWindows = '';

	@property({ reflect: true, attribute: 'shortcut-linux', converter: reflectNonDefault<string>('') })
	shortcutLinux = '';

	@property({ type: Object })
	translations: Partial<NLDDSplitButtonTranslations> = {};

	// — i18n —————————————————————————————————————————————————————————————————

	public _t(key: keyof NLDDSplitButtonTranslations, vars?: Record<string, string | number>): string {
		return translate(this.translations, nlddSplitButtonTranslations, key, vars);
	}

	/** The appearance for the two buttons inside: they take the aliases'
	 *  meaning, not the alias, so 'secondary' is never a fall-through there. */
	public _buttonAppearance(): string {
		if (this.appearance === 'primary') return 'accent-filled';
		if (this.appearance === 'secondary') return 'neutral-tinted';
		return this.appearance;
	}

	// — Popover target ———————————————————————————————————————————————————————

	/** The overlay `popovertarget` names, for the chevron. Looked up in the tree
	 *  of this host: in the chevron's own tree the id would find nothing. */
	public _popoverTarget(): Element | null {
		return popoverTargetOf(this, this.popovertarget, this.popoverTargetElement);
	}

	// — Handlers —————————————————————————————————————————————————————————————

	public _handleActionClick(e: MouseEvent): void {
		if (this.disabled || this.loading) return;
		e.stopPropagation();
		this.dispatchEvent(new CustomEvent('action-click', { bubbles: true, composed: true }));
		if (this.href) return;
		const form = ownerForm(this, this._internals);
		if (this.type === 'submit') form?.requestSubmit();
		else if (this.type === 'reset') form?.reset();
	}

	// — Lifecycle ————————————————————————————————————————————————————————————

	override firstUpdated(): void {
		// Capture, so it runs before the chevron's own click handler reads its
		// target, for a keyboard click as well: an overlay rendered after this
		// split button was not there on its last render.
		this.renderRoot.querySelector('.split-button__popup-button')?.addEventListener('click', this._refreshPopoverTarget, true);
	}

	private _refreshPopoverTarget = (): void => {
		const chevron = this.renderRoot.querySelector<NLDDIconButton>('.split-button__popup-button nldd-icon-button');
		if (chevron) chevron.popoverTargetElement = this._popoverTarget();
	};

	override willUpdate(changed: PropertyValues<this>): void {
		if (changed.has('width')) {
			// 'full' is CSS on the host. A CSS length goes into local variables
			// only, so a width the app sets on the host itself still wins. Set
			// before the render, so an explicit width never shows at auto first.
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('width', w)) {
				this.style.setProperty('--_split-button-host-width', w);
				this.style.setProperty('--_split-button-width', '100%');
			} else {
				this.style.removeProperty('--_split-button-host-width');
				this.style.removeProperty('--_split-button-width');
			}
		}
	}

	override render() {
		return splitButtonTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-split-button': NLDDSplitButton;
	}
}
