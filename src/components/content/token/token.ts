/**
 * Nederlandse Digitale Dienst Token Component (Lit + TypeScript)
 *
 * A self-contained piece of data the user is handling: a person in an address field,
 * an active filter value. Alone among the three it can be operated, so it is
 * optionally dismissable or interactive through a contextual menu.
 *
 * For something you only read, reach for `nldd-tag` (a trait someone assigned) or
 * `nldd-badge` (a state or a count the system keeps).
 *
 * @element nldd-token
 *
 * @attr {string} text - Token text; falls back to the default slot when unset.
 * @attr {'none' | 'dismiss' | 'menu'} control - Control type (default: 'none')
 * @attr {string} dismiss-text - Accessible label for the dismiss button. Unset, it names the token: `Verwijder "{text}"`, so a row of tokens does not read as a row of identical buttons.
 * @attr {string} menu-text - Accessible label for the menu button. Unset, it is `Toon opties voor "{text}"`.
 * @attr {boolean} roving - Inside a roving-focus container (e.g. nldd-token-field): the host is the single tab stop, so the trailing control is not separately tabbable.
 * @attr {boolean} expanded - Reflects whether the token's menu is open (control="menu"); managed by the token.
 * @attr {boolean} disabled - Disabled state
 *
 * @slot - Token text
 * @slot menu - An nldd-menu that the token opens from its menu button (control="menu").
 *
 * @fires dismiss - When the dismiss button is clicked
 */
import { LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { tokenStyles } from './token.styles.js';
import { tokenTemplate } from './token.template.js';
import type { NLDDMenu } from '../../actions/menu/menu.js';
import './../../actions/icon-button/icon-button.js';

export type TokenControl = 'none' | 'dismiss' | 'menu';

@customElement('nldd-token')
export class NLDDToken extends LitElement {
	static override styles = tokenStyles;

	/** Token text. Falls back to the default slot when unset, so slotted or richer
	 *  content keeps working. */
	@property({ type: String })
	text = '';

	@property({ reflect: true, converter: reflectNonDefault<TokenControl>('none') })
	control: TokenControl = 'none';

	@property({ type: String, attribute: 'dismiss-text' })
	dismissText = '';

	@property({ type: String, attribute: 'menu-text' })
	menuText = '';

	/** Inside a roving-focus container (e.g. nldd-token-field): the host carries the
	 *  single tab stop and manages focus itself, so the trailing control (dismiss or
	 *  menu) is taken out of the tab order — it stays reachable by mouse and by the
	 *  host's own key handlers. */
	@property({ type: Boolean, reflect: true })
	roving = false;

	@property({ type: Boolean, reflect: true })
	expanded = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	/** Text of the default slot, kept current for the control labels. */
	@state()
	private _slotText = '';

	private _textObserver = new MutationObserver(() => this._readSlotText());

	private _readSlotText(): void {
		this._slotText = [...this.childNodes]
			.filter((node) => !(node instanceof Element && node.hasAttribute('slot')))
			.map((node) => node.textContent)
			.join('')
			.replace(/\s+/g, ' ')
			.trim();
	}

	get _dismissLabel(): string {
		const label = this.text || this._slotText;
		return this.dismissText || (label ? `Verwijder "${label}"` : 'Verwijder');
	}

	get _menuLabel(): string {
		const label = this.text || this._slotText;
		return this.menuText || (label ? `Toon opties voor "${label}"` : 'Toon opties');
	}

	_handleDismiss(e: Event): void {
		e.stopPropagation();
		if (this.disabled) return;
		this.dispatchEvent(new CustomEvent('dismiss', {
			bubbles: true,
			composed: true,
		}));
	}

	@query('.token__menu-action nldd-icon-button')
	private _menuButton?: HTMLElement;

	private _menu: NLDDMenu | null = null;
	private _pointerdownWhileOpen = false;

	/** Wire a slotted nldd-menu: anchor it to the chevron button and mirror its open
	 *  state onto `expanded`. The menu closes itself on select and on light-dismiss. */
	_onMenuSlotChange(e: Event): void {
		const menu = (e.target as HTMLSlotElement)
			.assignedElements({ flatten: true })
			.find((el) => el.tagName.toLowerCase() === 'nldd-menu') as NLDDMenu | undefined;
		if (!menu || menu === this._menu) return;
		this._menu?.removeEventListener('toggle', this._handleMenuToggle);
		this._menu = menu;
		menu.variant = 'menu';
		menu.placement = 'bottom-start';
		menu.anchorElement = this._menuButton ?? this;
		menu.addEventListener('toggle', this._handleMenuToggle);
	}

	private _handleMenuToggle = (e: Event): void => {
		const open = (e as ToggleEvent).newState === 'open';
		this.expanded = open;
		// Closing via the menu (Escape or a selection) leaves focus in the now-hidden
		// popover, so hand it back to the chevron. An outside click already moved focus
		// to its target — leave that.
		if (!open) {
			const active = document.activeElement;
			if (!active || active === document.body || this.contains(active)) this._menuButton?.focus();
		}
	};

	/** Pointerdown on an open menu's button light-dismisses the popover before the
	 *  click fires; flag it so the trailing click doesn't immediately reopen it. */
	_handleMenuButtonPointerdown(): void {
		if (this._menu?.matches(':popover-open')) this._pointerdownWhileOpen = true;
	}

	_handleMenuClick(): void {
		if (this.disabled) return;
		if (this._pointerdownWhileOpen) {
			this._pointerdownWhileOpen = false;
			return;
		}
		const menu = this._menu;
		if (!menu || !('showPopover' in menu) || menu.matches(':popover-open')) return;
		menu.anchorElement = this._menuButton ?? this;
		menu.showPopover();
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('keydown', this._handleHostKeydown);
		this._readSlotText();
		this._textObserver.observe(this, { childList: true, characterData: true, subtree: true });
	}

	override disconnectedCallback(): void {
		this.removeEventListener('keydown', this._handleHostKeydown);
		this._textObserver.disconnect();
		super.disconnectedCallback();
	}

	/** When the token host itself is focused (a roving container such as
	 *  nldd-token-field), Enter / Space / ArrowDown open its menu, like a menu button.
	 *  Ignores events from the chevron, a real button that opens the menu natively. */
	private _handleHostKeydown = (e: KeyboardEvent): void => {
		if (this.control !== 'menu' || this.disabled) return;
		if (e.composedPath()[0] !== this) return;
		if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
			e.preventDefault();
			this._handleMenuClick();
		}
	};

	/** Force the focus ring so the whole token reads as focused when it is focused
	 *  programmatically (a token-field's roving keyboard navigation). Safari does not
	 *  mark a tabindex=-1 host :focus-visible on a scripted focus, so ask for it
	 *  explicitly; Chrome ignores the option and relies on its own keyboard heuristic. */
	override focus(options?: FocusOptions): void {
		// focusVisible isn't in lib.dom's FocusOptions yet; cast keeps the runtime option.
		super.focus({ ...options, focusVisible: true } as FocusOptions);
	}

	override render() {
		return tokenTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-token': NLDDToken;
	}
}
