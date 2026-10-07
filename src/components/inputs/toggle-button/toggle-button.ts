/**
 * Nederlandse Digitale Dienst Toggle Button Component (Lit + TypeScript)
 *
 * A selectable button that toggles between selected and unselected.
 * Available as a button (aria-pressed), a checkbox, or a radio.
 *
 * The label stays the same in both states: the state is in aria-pressed (or
 * checked) and in the fill, so a screen reader says "Favoriet, pressed". A label
 * that changes with the state ("Volgen", then "Ontvolgen") says what the
 * button does next; that is an nldd-button whose text you change, not a toggle.
 *
 * In radio mode the button itself is the radio: it carries the role, the state
 * and its place in the group. A native radio in a shadow root of its own would
 * be a group of one, counted as "1 of 1" and stopped at by Tab.
 *
 * @element nldd-toggle-button
 *
 * @attr {'button' | 'checkbox' | 'radio'} type - What the button is: a button with aria-pressed, a native checkbox, or a radio (default: 'button')
 * @attr {'neutral-tinted' | 'neutral-base' | 'neutral-transparent' | 'accent-transparent'} appearance - Visual style, color included (default: 'neutral-tinted'). Selected is filled in each of them; the transparent ones are for a toggle among transparent buttons, and with a selected-icon they stay quiet when on.
 * @attr {'xs' | 'sm' | 'md' | 'lg'} size - Button size (default: 'md')
 * @attr {boolean} selected - Selected state
 * @attr {boolean} disabled - Disabled state
 * @attr {boolean} no-tab - Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable.
 * @attr {string} value - Value for form submission (checkbox/radio)
 * @attr {string} name - Name for form submission (checkbox/radio)
 * @attr {string} text - Button text
 * @attr {string} icon - Icon name for nldd-icon
 * @attr {string} selected-icon - Icon shown instead of `icon` while selected, such as `check-mark` for `plus` or `heart-filled` for `heart`. The appearances with a surface fill it when on, as without one. The transparent appearances have no surface to fill: with a selected-icon they stay quiet when on and the change of shape says it is on; without one, or with `variant="text"` where the icon does not render, they fill, so the state always shows.
 * @attr {'text' | 'icon' | 'icon-and-text'} variant - What renders: text, icon, or both. Unset → auto-detect from text/icon attributes.
 * @attr {string} accessible-label - Accessible label; required for icon-only usage
 * @attr {boolean} required - Required state. Set by nldd-toggle-button-group.
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @slot icon - Slot for a custom icon (e.g. custom SVG). Only used when icon attribute is not set.
 *
 * @fires change - When selection changes; detail: { selected: boolean, value: string }
 */

import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import type { RadioPosition } from '../../../utilities/radio-position.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { toggleButtonStyles } from './toggle-button.styles.js';
import { toggleButtonTemplate } from './toggle-button.template.js';
import './../../content/icon/icon.js';
import type { NLDDTooltip } from '../../content/tooltip/tooltip.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';

export type ToggleButtonType = 'button' | 'checkbox' | 'radio';
export type ToggleButtonAppearance = 'neutral-tinted' | 'neutral-base' | 'neutral-transparent' | 'accent-transparent';
export type ToggleButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ToggleButtonVariant = 'text' | 'icon' | 'icon-and-text';

@customElement('nldd-toggle-button')
export class NLDDToggleButton extends DescribedBy(FormAssociated(LitElement)) {


	@property({ type: Boolean, reflect: true })
	required = false;
	static override styles = toggleButtonStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;


	private _initialSelected = false;

	@property({ type: String, reflect: true })
	type: ToggleButtonType = 'button';

	@property({ reflect: true, converter: reflectNonDefault<ToggleButtonAppearance>('neutral-tinted') })
	appearance: ToggleButtonAppearance = 'neutral-tinted';

	@property({ reflect: true, converter: reflectNonDefault<ToggleButtonSize>('md') })
	size: ToggleButtonSize = 'md';

	@property({ type: Boolean, reflect: true })
	selected = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;
	/** Take the control out of the tab order (`tabindex="-1"`) — for a control
	 *  owned by a roving container (an `nldd-list` sets it on the rows that are
	 *  not the current one) that manages focus itself. Still mouse- and
	 *  script-focusable. */
	@property({ type: Boolean, reflect: true, attribute: 'no-tab' })
	noTab = false;


	@property({ type: String })
	value = 'on';

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	/** Button text. */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	/** Icon name for the nldd-icon element. When not set, the icon slot is used; the
	 *  icon and icon-and-text variants show a placeholder icon when neither is provided. */
	@property({ type: String })
	icon = '';

	/** Icon shown instead of `icon` while selected. On the transparent
	 *  appearances it replaces the fill, so it is reflected for the styles. */
	@property({ reflect: true, attribute: 'selected-icon', converter: reflectNonDefault<string>('') })
	selectedIcon = '';

	@property({ reflect: true, converter: reflectNonDefault<ToggleButtonVariant | ''>('') })
	variant: ToggleButtonVariant | '' = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** Whether an icon is present via attribute or slot. */
	get _hasIcon(): boolean {
		if (this.icon) return true;
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="icon"]');
		if (slot && slot.assignedElements().length > 0) return true;
		/* On the first render the shadow slot doesn't exist yet, so fall
		 * back to a light-DOM check so the initial render can see slotted
		 * content. The slotchange handler triggers re-renders for later
		 * changes. */
		return this.querySelector(':scope > [slot="icon"]') !== null;
	}

	private _warnedA11y = false;
	private _warnedEmptyIcon = false;


	/**
	 * Marks the control as invalid.
	 *
	 * Announced and not drawn. What is wrong belongs in an
	 * nldd-validation-list, in words: a red ring around a single
	 * checkbox or radio would say the option is wrong, while it is the question
	 * that is unanswered. `aria-invalid` still goes on the control, because
	 * choosing not to show something is not a reason to keep quiet about it.
	 */
	@property({ type: Boolean, reflect: true })
	invalid = false;

	/** Set by nldd-toggle-button-group in radio mode: this button's place in the
	 *  group, which it cannot count by itself. */
	@state()
	_groupPosition: RadioPosition | null = null;

	/** Set by nldd-toggle-button-group. What `required` asks of a radio is
	 *  whether anything in the group is selected, not this one. */
	@state()
	_groupHasSelection = false;

	/** The aria-label this button wrote on itself, so it only takes back its own. */
	private _appliedRadioLabel: string | null = null;

	override firstUpdated(): void {
		this._initialSelected = this.selected;
	}

	override updated(changed: PropertyValues): void {
		/* A button needs an accessible name. That name comes from either
		 * the visible text or the explicit accessible-label. Without
		 * either, the button is anonymous to assistive tech. */
		const inaccessible = !this.text && !this.accessibleLabel;
		if (import.meta.env?.DEV && inaccessible && !this._warnedA11y) {
			this._warnedA11y = true;
			console.warn('<nldd-toggle-button>: Provide a text or accessible-label attribute for accessibility.');
		} else if (!inaccessible) {
			this._warnedA11y = false;
		}
		/* variant="icon" with no icon attribute and no slotted icon falls back
		 * to a placeholder — flag the likely misconfiguration during development. */
		if (import.meta.env?.DEV && this.variant === 'icon' && !this._hasIcon && !this._warnedEmptyIcon) {
			this._warnedEmptyIcon = true;
			console.warn('<nldd-toggle-button variant="icon">: No icon attribute or slot="icon" content provided. A placeholder icon is shown.');
		} else if (this._hasIcon || this.variant !== 'icon') {
			this._warnedEmptyIcon = false;
		}
		if (changed.has('selected') || changed.has('value') || changed.has('type')) {
			this.commitFormValue();
		}
		this._syncRadioAria();
	}

	/**
	 * In radio mode this element is the radio.
	 *
	 * A native radio in a shadow root of its own is a group of one: a screen
	 * reader counts it as "1 of 1" and Tab stops at every option. The role on the
	 * element itself puts the group back in one tree. The other two types keep
	 * the control they render: a checkbox input, or a button with aria-pressed.
	 */
	private _syncRadioAria(): void {
		if (this.type !== 'radio') {
			for (const name of ['role', 'aria-checked', 'aria-disabled', 'aria-posinset', 'aria-setsize', 'tabindex']) {
				this.removeAttribute(name);
			}
			this._appliedRadioLabel = setOwnedAttribute(this, 'aria-label', '', this._appliedRadioLabel);
			return;
		}
		this.setAttribute('role', 'radio');
		this.setAttribute('aria-checked', String(this.selected));
		this._appliedRadioLabel = setOwnedAttribute(this, 'aria-label', this.accessibleLabel || this.text, this._appliedRadioLabel);
		if (this.disabled) this.setAttribute('aria-disabled', 'true');
		else this.removeAttribute('aria-disabled');

		const position = this._groupPosition;
		if (position) {
			this.setAttribute('aria-posinset', String(position.posInSet));
			this.setAttribute('aria-setsize', String(position.setSize));
		} else {
			this.removeAttribute('aria-posinset');
			this.removeAttribute('aria-setsize');
		}
		const tabbable = !this.disabled && !this.noTab && position?.tabbable !== false;
		this.setAttribute('tabindex', tabbable ? '0' : '-1');
	}

	private _onRadioClick = (): void => {
		if (this.type !== 'radio') return;
		this.toggle();
	};

	private _onRadioKeyDown = (e: KeyboardEvent): void => {
		if (this.type !== 'radio' || this.disabled) return;
		// The keys a native radio answers to. The arrow keys belong to the group.
		if (e.key === ' ') {
			e.preventDefault();
			this.toggle();
			return;
		}
		if (e.key === 'Enter') {
			submitOnEnter(this, e);
			return;
		}
		// Escape puts the tooltip away without moving focus, as WCAG 1.4.13 asks.
		if (e.key === 'Escape') this._tooltip?._handleTriggerLeave();
	};

	override formValue(): FormValue {
		// Only checkbox/radio variants participate in form submission.
		const submits = this.type === 'checkbox' || this.type === 'radio';
		return submits && this.selected ? this.value : null;
	}

	formResetCallback(): void {
		this.selected = this._initialSelected;
	}


	formStateRestoreCallback(state: File | string | FormData | null): void {
		this.selected = state !== null;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('click', this._onRadioClick);
		this.addEventListener('keydown', this._onRadioKeyDown);
		this.addEventListener('focus', this._onRadioFocus);
		this.addEventListener('blur', this._onRadioBlur);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('click', this._onRadioClick);
		this.removeEventListener('keydown', this._onRadioKeyDown);
		this.removeEventListener('focus', this._onRadioFocus);
		this.removeEventListener('blur', this._onRadioBlur);
	}

	/**
	 * The tooltip of an icon-only button, which shows itself when focus moves
	 * into it. In radio mode the focus is on this element, outside it, so it
	 * hears about focus and Escape from here.
	 */
	private get _tooltip(): NLDDTooltip | null {
		return this.type === 'radio'
			? this.shadowRoot?.querySelector('nldd-tooltip') ?? null
			: null;
	}

	private _onRadioFocus = (): void => {
		this._tooltip?._handleFocusIn();
	};

	private _onRadioBlur = (): void => {
		this._tooltip?._handleTriggerLeave();
	};

	_handleButtonClick(): void {
		if (this.disabled) return;
		this._toggle();
	}

	_handleInputChange(e: Event): void {
		const input = e.target as HTMLInputElement;
		this.selected = input.checked;
		this._dispatchChange();
	}

	private _toggle(): void {
		this.selected = !this.selected;
		this._dispatchChange();
	}

	private _dispatchChange(): void {
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { selected: this.selected, value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	/**
	 * Toggle selected state programmatically.
	 * For type="radio", the button can only be selected, never deselected (native behavior).
	 */
	toggle(): void {
		if (this.disabled) return;
		if (this.type === 'radio' && this.selected) return;
		this._toggle();
	}

	/**
	 * Delegates focus to whichever control this type renders: the `<input>` for
	 * `checkbox` and `radio`, the `<button>` for `button`. Only one of the two
	 * exists at a time. Lets consumers call `toggleButtonEl.focus()` without
	 * reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		// In radio mode this element is the control, and it is focusable itself.
		if (this.type === 'radio') {
			super.focus(options);
			return;
		}
		this.shadowRoot
			?.querySelector<HTMLElement>('.toggle-button__input, button.toggle-button')
			?.focus(options);
	}

	/** The button is the control, not the input that carries the value. */
	override describedTarget(): Element | null {
		return this.shadowRoot?.querySelector('button.toggle-button') ?? null;
	}

	override render() {
		return toggleButtonTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-toggle-button': NLDDToggleButton;
	}
}
