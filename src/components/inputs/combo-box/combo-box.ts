/**
 * Nederlandse Digitale Dienst Combo Box Component (Lit + TypeScript)
 *
 * A text input with autocomplete dropdown via nldd-menu.
 * Add a slotted nldd-menu with nldd-menu-item children to provide options.
 *
 * The slotted nldd-menu keeps its default focus behavior (menu container receives focus)
 * so that typing keeps focus on the input. The picker button moves focus
 * to the menu explicitly on activation.
 *
 * Note: Only nldd-menu-item type="button" is supported. Radio and checkbox
 * types are not supported in this context.
 *
 * @element nldd-combo-box
 * @attr {string} value - The selected form value
 * @attr {string} text - The text shown in the input. May differ from `value` (e.g. value="nl" → text="Nederland"). Set this when pre-populating an existing record. If left empty and `value` matches a slotted menu item, the matching item's `text` is used automatically.
 * @attr {string} placeholder - Placeholder text for the input
 * @attr {string} size - Size: 'sm' | 'md' (default: 'md')
 * @attr {boolean} valid - Marks the field as valid
 * @attr {boolean} invalid - Marks the field as invalid
 * @attr {boolean} disabled - Disabled state
 * @attr {boolean} readonly - Read-only state: the value stays readable, selectable and in the tab order, but the menu does not open and there is nothing to clear. The input drops its combobox role and the aria that goes with it, so assistive technology is not told about a list it cannot open. Use this where the value belongs to the record rather than to the form, e.g. the product an asset is an instance of.
 * @attr {boolean} allow-custom - Allow committing free-typed values that match no option (Enter/blur). Default false: only menu options are accepted. Typing an option's label in full picks that option, ignoring case and the spaces around it; with two such labels, the first one.
 * @attr {boolean} no-filter - Leaves the options as they are while typing, for a list your server already filtered per keystroke. Without it the field hides options that do not contain the typed text, which also hides a server match on, say, an e-mail address.
 * @attr {string} name - Input name for form submission
 * @attr {string} autocomplete - Browser autofill hint. Default 'off' to prevent the native autofill panel from competing with the menu dropdown. Set to a valid token (e.g. 'country', 'organization') when browser autofill is desired.
 * @attr {string} accessible-label - Accessible label forwarded as aria-label to the input. Required for screen reader accessibility.
 * @attr {number} max-items - Maximum visible items before scrolling (default: 8)
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 * @attr {boolean} no-spellcheck - Disables browser spellchecking on the inner input
 * @attr {string} width - Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container.
 * @attr {boolean} required - Required state
 * @attr {string} pattern - Regular expression the value has to match, as the native `pattern`.
 * @attr {number} minlength - Fewest characters the value may have.
 * @attr {number} maxlength - Most characters the value may have.
 *
 * @note Free-text values: only when `allow-custom` is set. Then a typed value that
 *       matches no menu option is emitted as-is via the `change` event on Enter or blur
 *       (consumers validate emitted values). Without it, such a value is discarded and
 *       the input reverts to the current value. Only text the user typed is committed:
 *       the label of a chosen option stays a label, and typing an option's label in full
 *       picks that option and its value.
 *
 * Options can arrive after the keystroke, from a server you query per
 * keystroke. Slot them into the menu when they come in: if the user is still
 * in the field and the keystroke found nothing to show, the menu opens then.
 * After Escape, or once the user left the field, it stays shut.
 *
 * @slot - An nldd-menu element with nldd-menu-item and nldd-menu-divider children
 *
 * @fires input - When the input value changes; detail: { value: string }
 * @fires change - When an option is selected or a custom value is committed; detail: { value: string }
 *
 * @example
 * ```html
 * <nldd-combo-box
 * 	placeholder="Zoek een land"
 * 	name="country"
 * >
 *   <nldd-menu>
 *     <nldd-menu-item text="Nederland" value="nl"></nldd-menu-item>
 *     <nldd-menu-item text="België" value="be"></nldd-menu-item>
 *   </nldd-menu>
 * </nldd-combo-box>
 * ```
 */
import { LitElement } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { comboBoxStyles } from './combo-box.styles.js';
import { comboBoxTemplate } from './combo-box.template.js';
import { nlddComboBoxTranslations } from './combo-box.i18n.js';
import type { NLDDComboBoxTranslations } from './combo-box.i18n.js';
import type { NLDDMenu, NLDDMenuItem } from '../../actions/menu/menu.js';
import '../../actions/menu/menu.js';
import '../../actions/icon-button/icon-button.js';
import '../../content/icon/icon.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { translate } from '../../../utilities/translations.js';

export type ComboBoxSize = 'sm' | 'md';

@customElement('nldd-combo-box')
export class NLDDComboBox extends DescribedBy(FormAssociated(LitElement)) {

	static override styles = comboBoxStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	/** Counts for the implicit-submission rule: a single-line field where Enter
	 *  would submit the form. See utilities/implicit-submission.ts. */
	static blocksImplicitSubmission = true;


	private _initialValue = '';
	private _initialText = '';

	@property({ type: String })
	value = '';

	/**
	 * The text shown in the input. May differ from `value` (the form-submission value).
	 *
	 * Updated automatically on user input and menu select. When the consumer sets `value`
	 * without setting `text`, the matching slotted `nldd-menu-item`'s `text` is used as
	 * the display label. Set `text` explicitly to opt out of auto-derivation (e.g. for
	 * custom display formats like `${item.text} (${item.id})`).
	 */
	// Not reflected: `text` mirrors the live input value and changes on every
	// keystroke, so reflecting it would write an attribute per character for no
	// benefit (no styling or consumer reads the mirrored attribute).
	@property({ type: String })
	text = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	placeholder = '';

	@property({ reflect: true, converter: reflectNonDefault<ComboBoxSize>('md') })
	size: ComboBoxSize = 'md';

	@property({ type: Boolean, reflect: true })
	valid = false;

	@property({ type: Boolean, reflect: true })
	invalid = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: Boolean, reflect: true })
	readonly = false;

	/** Allow committing free-typed values that don't match any menu option (on
	 *  Enter or blur). Default false: the input only accepts menu options, and a
	 *  non-matching typed value is discarded (reverted to the current value). */
	@property({ type: Boolean, reflect: true, attribute: 'allow-custom' })
	allowCustom = false;

	/** Leaves the options as they are while typing: the list was filtered already, by a server. */
	@property({ type: Boolean, reflect: true, attribute: 'no-filter' })
	noFilter = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	/** Browser autofill hint. Use AutoFill tokens (e.g. 'country', 'organization')
	 *  or 'off' to disable. Default 'off' to prevent the native autofill panel
	 *  from competing with the menu dropdown. */
	@property({ type: String })
	autocomplete: AutoFill | (string & {}) = 'off';

	/** Maximum number of visible menu items before scrolling. Defaults to 8. */
	@property({ type: Number, attribute: 'max-items' })
	maxItems = 8;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Object })
	translations: Partial<NLDDComboBoxTranslations> = {};

	@property({ type: Boolean, reflect: true, attribute: 'no-spellcheck' })
	noSpellcheck = false;

	/** Optional fixed width (any CSS length). When unset, the field stretches to fill its container. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';

	@state()
	_isOpen = false;

	/** ID of the currently highlighted menu item for aria-activedescendant. */
	@state()
	_highlightedId = '';

	private static _idCounter = 0;
	readonly _menuId = `nldd-combo-box-menu-${NLDDComboBox._idCounter++}`;

	private _menu: NLDDMenu | null = null;
	private _resizeObserver: ResizeObserver | null = null;
	/** Watches the options in the menu, which a consumer can slot in at any time. */
	private _menuObserver: MutationObserver | null = null;
	/** A keystroke wanted the menu open but there was nothing to show yet.
	 *  Options that arrive after it, from a server answering per keystroke,
	 *  open it then. Escape, leaving the field or opening the menu clear it. */
	private _openPending = false;
	/** What the user typed since the last commit, or null when the text in the
	 *  field came from somewhere else: a choice from the menu, a value set from
	 *  outside, the label derived from it. Only typed text is a custom value. */
	private _typedText: string | null = null;

	@query('.combo-box__input')
	_input!: HTMLInputElement;

	// — i18n ——————————————————————————————————————————————————————————————————


	@property({ type: Boolean, reflect: true })
	required = false;

	/** Regular expression the value has to match, as the native `pattern`. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	pattern = '';

	/** Fewest characters the value may have, as the native `minlength`. */
	@property({ type: Number, reflect: true })
	minlength?: number;

	/** Most characters the value may have, as the native `maxlength`. */
	@property({ type: Number, reflect: true })
	maxlength?: number;

	public _t(key: keyof NLDDComboBoxTranslations): string {
		return translate(this.translations, nlddComboBoxTranslations, key);
	}

	// — Lifecycle ————————————————————————————————————————————————————————————

	override firstUpdated(): void {
		if (import.meta.env?.DEV && !this.accessibleLabel) {
			console.warn('<nldd-combo-box>: No accessible-label provided. Add an accessible-label attribute for screen reader accessibility.');
		}
		this._initialValue = this.value;
		this._initialText = this.text;
	}

	override willUpdate(changedProperties: Map<string, unknown>): void {
		// Auto-derive text from a matching slotted menu item when value changes
		// alone. If text also changed in the same update cycle the consumer
		// was explicit — don't overwrite it.
		if (changedProperties.has('value') && !changedProperties.has('text')) {
			this._deriveTextFromMenu();
		}
		// A new value, from a choice, a commit or the consumer, settles the text:
		// whatever stands in the field now is not something left to commit.
		if (changedProperties.has('value')) this._typedText = null;
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('maxItems') && this._menu) {
			this._menu.maxItems = this.maxItems;
		}
		if (changedProperties.has('width')) {
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('width', w)) {
				this.style.setProperty('--_combo-box-width', w);
			} else {
				this.style.removeProperty('--_combo-box-width');
			}
		}
		if (changedProperties.has('value') || changedProperties.has('text')) {
			this.commitFormValue();
		}
	}

	override formValue(): FormValue {
		return this.value;
	}

	/** The display label rides along in the restore state, so bfcache and state
	 *  restore can rehydrate the input text (value "nl" → display "Nederland"). */
	override formState(): FormValue {
		const state = new FormData();
		state.append('value', this.value);
		state.append('display', this.text);
		return state;
	}

	formResetCallback(): void {
		this.value = this._initialValue;
		this.text = this._initialText;
	}


	formStateRestoreCallback(state: File | string | FormData | null): void {
		if (state instanceof FormData) {
			this.value = String(state.get('value') ?? '');
			this.text = String(state.get('display') ?? '');
		} else if (typeof state === 'string') {
			// Fallback for older session state without separate display label.
			this.value = state;
			this.text = state;
		}
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver(() => this._updateMenuWidth());
		this._resizeObserver.observe(this);
		window.addEventListener('scroll', this._handleScrollOrResize, true);
		window.addEventListener('resize', this._handleScrollOrResize);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;
		window.removeEventListener('scroll', this._handleScrollOrResize, true);
		window.removeEventListener('resize', this._handleScrollOrResize);
		this._menuObserver?.disconnect();
		this._menuObserver = null;
		if (this._menu) {
			this._menu.removeEventListener('toggle', this._handleMenuToggle);
			this._menu.removeEventListener('select', this._handleMenuSelect);
			this._menu.removeEventListener('keydown', this._handleMenuKeydown);
			this._menu = null;
		}
	}

	// — Slot —————————————————————————————————————————————————————————————————

	public _onSlotChange(): void {
		const slot = this.shadowRoot?.querySelector('slot');
		const menu = slot?.assignedElements({ flatten: true })
			.find(el => el.tagName.toLowerCase() === 'nldd-menu') as NLDDMenu | undefined;

		if (!menu || menu === this._menu) return;

		this._menu = menu;
		menu.id = this._menuId;
		menu.anchorElement = this;
		menu.placement = 'bottom-start';
		menu.maxItems = this.maxItems;
		menu.variant = 'listbox';
		// Focus stays on the input — default menu behavior (no auto-focus-item).
		menu.addEventListener('toggle', this._handleMenuToggle);
		menu.addEventListener('select', this._handleMenuSelect);
		menu.addEventListener('keydown', this._handleMenuKeydown);
		this._menuObserver?.disconnect();
		// The menu's own filter() writes `hidden` on every keystroke, so this fires
		// while typing too; the handler returns early unless there is something to decide.
		this._menuObserver = new MutationObserver(this._handleMenuItemsChange);
		this._menuObserver.observe(menu, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
		this._updateMenuWidth();

		// First time the menu is wired up, derive a missing text from the
		// matching item. Covers the common case where the consumer renders
		// <nldd-combo-box value="nl"> with the menu as a child — value is set
		// before the menu exists, so the willUpdate hook's first run has no
		// menu to walk.
		if (this.value && !this.text) {
			this._deriveTextFromMenu();
		}
	}

	/**
	 * Walk slotted menu items and set `text` from the first item whose `value`
	 * (or `text`, when value is unset) matches the current `value`. No-op when
	 * the menu isn't wired yet or no item matches.
	 */
	private _deriveTextFromMenu(): void {
		if (!this._menu) return;
		// A cleared value clears the display too: leaving the old label
		// visible would show a choice the form no longer carries.
		if (!this.value) {
			this.text = '';
			return;
		}
		for (const item of this._ownMenuItems()) {
			if ((item.value || item.text) === this.value) {
				this.text = item.text;
				return;
			}
		}
	}

	// — Menu width & position ————————————————————————————————————————————————

	private _updateMenuWidth(): void {
		if (!this._menu) return;
		const rect = this.getBoundingClientRect();
		this._menu.width = `${rect.width}px`;
	}

	private _handleScrollOrResize = (): void => {
		if (!this._isOpen) return;
		this._updateMenuWidth();
		this._menu?.reposition();
	};

	// — Menu management ——————————————————————————————————————————————————————

	private _handleMenuToggle = (e: Event): void => {
		this._isOpen = (e as ToggleEvent).newState === 'open';
		if (!this._isOpen) {
			this._highlightedId = '';
		} else {
			// However it opened, there is nothing left to open later.
			this._openPending = false;
			// The menu clears its highlight on open; seat it on the first option by
			// default so it's the active descendant and Enter picks it, unless
			// something is already highlighted.
			requestAnimationFrame(() => {
				if (this._menu && !this._menu.getHighlighted()) this._menu.moveHighlight('next');
				this._highlightedId = this._menu?.getHighlightedId() ?? '';
			});
		}
	};

	private _handleMenuSelect = (e: Event): void => {
		const item = e.target as NLDDMenuItem;
		this._typedText = null;
		this.text = item.text;
		this.value = item.value || item.text;
		this._highlightedId = '';
		this._closeMenu();
		this._menu?.filter('');
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
		this._input?.focus();
	};

	private _updateActiveDescendant(): void {
		this._highlightedId = this._menu?.getHighlightedId() ?? '';
	}

	/**
	 * Open the menu. Focus always stays on the input — highlight moves via
	 * aria-activedescendant rather than by moving focus to items.
	 */
	public _openMenu(): void {
		if (!this._menu || this._isOpen) return;
		// Read-only keeps the value where it is: no list to pick a different one
		// from, however you asked for it (arrow key, typing, the picker button).
		if (this.readonly) return;
		// With allow-custom the typed text is itself a valid value, so a menu
		// with nothing left to offer stays closed — the "nothing found" empty
		// state would wrongly suggest the input is invalid.
		if (this.allowCustom && !this._hasVisibleMenuItems()) return;
		if (!('showPopover' in this._menu)) {
			console.warn('<nldd-combo-box>: Popover API is not supported in this browser. The dropdown will not open.');
			return;
		}
		this._updateMenuWidth();
		(this._menu as HTMLElement).showPopover();
	}

	/**
	 * The menu decides whether to open on a keystroke. Options that arrive later
	 * get the same decision: they open a menu the keystroke could not open, and
	 * with allow-custom a menu whose options all went away closes again, as it
	 * would on typing. Only while the user is still in the field.
	 */
	private _handleMenuItemsChange = (): void => {
		if (!this._menu || this.shadowRoot?.activeElement !== this._input) return;
		if (this._menu.matches(':popover-open')) {
			if (this.allowCustom && !this._hasVisibleMenuItems()) this._closeMenu();
			return;
		}
		if (this._openPending && this._hasVisibleMenuItems()) {
			this._openPending = false;
			this._openMenu();
		}
	};

	/**
	 * The items that belong to the wired menu itself. A nested nldd-menu
	 * submenu's items are left out, so they cannot match before the intended
	 * top-level item when values or labels overlap.
	 */
	private _ownMenuItems(): NLDDMenuItem[] {
		if (!this._menu) return [];
		return Array.from(this._menu.querySelectorAll<NLDDMenuItem>('nldd-menu-item'))
			.filter(item => item.closest('nldd-menu') === this._menu);
	}

	/** Top-level menu items that survived the current filter. */
	private _hasVisibleMenuItems(): boolean {
		return this._ownMenuItems().some(item => !item.hidden);
	}

	public _closeMenu(): void {
		if (!this._menu || !this._isOpen) return;
		(this._menu as HTMLElement).hidePopover();
	}

	private _pickerPointerdownWhileOpen = false;

	public _toggleMenu(): void {
		if (this._pickerPointerdownWhileOpen) {
			this._pickerPointerdownWhileOpen = false;
			return;
		}
		if (this._isOpen) {
			this._closeMenu();
			this._input?.focus();
		} else {
			this._openMenu();
			this._input?.focus();
		}
	}

	public _handlePickerPointerdown(): void {
		if (this._isOpen) {
			this._pickerPointerdownWhileOpen = true;
		}
	}

	// — Handlers ————————————————————————————————————————————————————————————

	/**
	 * Handles Tab in the menu. The menu is a popover on the top layer — Tab
	 * would move focus to the next focusable element in DOM order, which may
	 * not be the next logical element. Instead, close the menu and return
	 * focus to the input so the user can Tab forward from there.
	 */
	private _handleMenuKeydown = (e: KeyboardEvent): void => {
		if (e.key !== 'Tab') return;
		e.preventDefault();
		this._closeMenu();
		this._input?.focus();
	};

	public _handleInput(e: Event): void {
		const input = e.target as HTMLInputElement;
		this.text = input.value;
		this._typedText = input.value;
		this._menu?.filter(this.text, { hide: !this.noFilter });
		this._updateActiveDescendant();
		// The reverse of the allow-custom guard in _openMenu: typing until
		// nothing matches closes an already-open menu instead of leaving the
		// empty state hanging under a perfectly valid custom value.
		if (this.allowCustom && this._isOpen && !this._hasVisibleMenuItems()) {
			this._closeMenu();
		}
		if (!this._isOpen) this._openMenu();
		this._openPending = this.text !== '' && !this._menu?.matches(':popover-open');
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value: this.text },
			bubbles: true,
			composed: true,
		}));
	}

	public _handleClear(): void {
		this.text = '';
		this.value = '';
		this._menu?.filter('');
		this._closeMenu();
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value: '' },
			bubbles: true,
			composed: true,
		}));
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: '' },
			bubbles: true,
			composed: true,
		}));
		this._input?.focus();
	}

	/** On blur: with allow-custom, accept a custom typed value; otherwise discard a
	 *  non-matching typed value by reverting the input to the current value. */
	public _handleBlur(e: FocusEvent): void {
		// Read-only text cannot have been typed, so there is nothing to revert or
		// commit. Without this, leaving a read-only field that shows a label
		// without a matching menu option wipes the label: the revert below reads
		// the text back from the value, and finds nothing.
		this._openPending = false;
		if (this.readonly) return;
		const relatedTarget = e.relatedTarget as Node | null;
		const focusMovedIntoMenu = !!relatedTarget && !!this._menu?.contains(relatedTarget);
		if (!focusMovedIntoMenu) {
			this._closeMenu();
		}
		if (!this.allowCustom) {
			// Don't revert while focus is moving into the menu (a click on a filtered
			// option): that would reflow the filtered list back to full mid-click. The
			// selection completes via _handleMenuSelect, which sets text/value itself.
			if (!focusMovedIntoMenu) this._revertTextToValue();
			return;
		}
		if (this._hasTypedCustomText()) this._commitTypedText();
	}

	/**
	 * With allow-custom, only text the user typed becomes the value. `text`
	 * differing from `value` is not the sign of that: it is the normal state after
	 * every choice from the menu ("Nederland" for "nl"), and committing it would
	 * send the label to the server instead of the value.
	 */
	private _hasTypedCustomText(): boolean {
		return this._typedText !== null && this.text === this._typedText && this.text !== '' && this.text !== this.value;
	}

	private _commitTypedText(): void {
		// Typing an option's label in full means that option: its value goes to
		// the form, not the label.
		const typed = this.text.trim().toLowerCase();
		const option = this._ownMenuItems().find(item => item.text.trim().toLowerCase() === typed);
		if (option) this.text = option.text;
		const value = option ? option.value || option.text : this.text;
		this._typedText = null;
		// The label of the option that was already chosen: nothing changed.
		if (value === this.value) return;
		this.value = value;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	/** Restore the input text to the current value's display label, discarding any
	 *  free text the user typed (used when allow-custom is off). */
	private _revertTextToValue(): void {
		// Discard the just-typed text up front, then let _deriveTextFromMenu fill in
		// the matching option's label. When the value matches no option (removed, or
		// not in the menu), the text stays empty rather than lingering as the
		// discarded non-matching entry — matching how value-set derivation behaves.
		this.text = '';
		this._deriveTextFromMenu();
		this._menu?.filter('');
	}

	public _handleKeydown(e: KeyboardEvent): void {
		// Whatever arrives after Escape does not open the menu: the user said stop.
		if (e.key === 'Escape') this._openPending = false;
		// Read-only takes no keys of its own: no menu to open, nothing to commit.
		// Enter still belongs to the form, the way it would from a read-only input.
		if (this.readonly) {
			if (e.key === 'Enter') submitOnEnter(this, e);
			return;
		}
		if (!this._isOpen) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				this._openMenu();
			} else if (e.key === 'Enter' && this.allowCustom && this._hasTypedCustomText()) {
				// With allow-custom the menu closes as soon as nothing matches
				// (see _handleInput), so the Enter-commit must also work while
				// the menu is closed.
				e.preventDefault();
				// The Enter committed a value; it is not also a submit. Without
				// this a combo box in a form submits the form on the same press
				// that picks the option.
				e.stopPropagation();
				this._commitTypedText();
			} else if (e.key === 'Enter') {
				// Nothing to commit: no menu open, and either free text is not allowed
				// or there is none that differs from the value. This Enter is not ours,
				// so it goes to the form the way the browser would have sent it if the
				// input were not in a shadow root.
				submitOnEnter(this, e);
			}
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				this._menu?.moveHighlight('next');
				this._updateActiveDescendant();
				break;
			case 'ArrowUp':
				e.preventDefault();
				this._menu?.moveHighlight('prev');
				this._updateActiveDescendant();
				break;
			case 'Enter': {
				e.preventDefault();
				// Consumed by the open menu, so it must not travel on to a
				// surrounding form as a submit.
				e.stopPropagation();
				const highlighted = this._menu?.getHighlighted();
				if (highlighted) {
					highlighted.select();
				} else if (this.allowCustom) {
					this._closeMenu();
					if (this._hasTypedCustomText()) this._commitTypedText();
				} else {
					// No option highlighted and free text not allowed: discard it.
					this._closeMenu();
					this._revertTextToValue();
				}
				break;
			}
			case 'Escape':
				// Only while the menu is open, and then it goes no further: the key
				// closed this menu, and a sheet or window behind it must not read
				// the same press as its own cue to close. With the menu shut,
				// Escape is not ours and travels on. Enter above says the same.
				if (!this._isOpen) return;
				e.preventDefault();
				e.stopPropagation();
				this._closeMenu();
				break;
		}
	}

	/**
	 * Delegates focus to the inner native `<input>`, so consumers can call
	 * `comboBoxEl.focus()` without reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		this._input?.focus(options);
	}

	override render() {
		return comboBoxTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-combo-box': NLDDComboBox;
	}
}
