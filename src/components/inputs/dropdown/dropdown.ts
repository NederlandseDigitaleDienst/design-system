/**
 * Nederlandse Digitale Dienst Dropdown Component (Lit + TypeScript)
 *
 * A visual wrapper around a native `<select>` element.
 * The consumer provides a native `<select>` as a slotted child — this way
 * the browser retains full control over form submission, accessibility
 * and keyboard navigation, including `<optgroup>`, `data-*` attributes and
 * dynamic changes to options.
 *
 * A dropdown hides its options, so it is the last resort for a choice from a
 * fixed set. Show a handful of options with nldd-segmented-control,
 * nldd-toggle-button-group or nldd-radio-button-group, and let the user type
 * in nldd-combo-box when there are many, a list of countries included. The
 * design guidelines explain the order.
 *
 * @element nldd-dropdown
 * @attr {string} size - Size: 'xs' | 'sm' | 'md' (default: 'md')
 * @attr {boolean} valid - Marks the field as valid
 * @attr {boolean} invalid - Marks the field as invalid
 * @attr {boolean} disabled - Disabled state; also forwarded to the slotted select
 * @attr {boolean} expanded - Reflects whether the native picker popup is open (driven internally)
 * @attr {string} width - Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container.
 * @attr {string} accessible-label - Accessible name, forwarded as aria-label to the slotted select
 * @attr {boolean} required - Required state, handed to the slotted <select>. A `required` on the <select> itself is left alone.
 *
 * @prop {string} value - The value of the slotted select. Setting it before the select or its option is there applies it once that option arrives, unless someone picks an option first.
 *
 * @slot - A native `<select>` element with `<option>` and/or `<optgroup>` children
 *
 * @fires change - The native change of the slotted select, left to bubble, so a listener on the select, on the dropdown or higher up all hear it. Read the choice from `value`.
 *
 * @example
 * ```html
 * <nldd-dropdown>
 *   <select name="country" aria-label="Land">
 *     <option value="" disabled selected>Selecteer een land</option>
 *     <option value="nl">Nederland</option>
 *     <option value="be">België</option>
 *   </select>
 * </nldd-dropdown>
 * ```
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { dropdownStyles } from './dropdown.styles.js';
import { dropdownTemplate } from './dropdown.template.js';
import { isPointerMode } from '../../../utilities/input-modality.js';
import './../../content/icon/icon.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { setState } from '../../../utilities/element-state.js';
import { deferFocus } from '../../../utilities/defer-focus.js';

export type DropdownSize = 'xs' | 'sm' | 'md';

@customElement('nldd-dropdown')
export class NLDDDropdown extends DescribedBy(LitElement) {
	static override styles = dropdownStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	@property({ reflect: true, converter: reflectNonDefault<DropdownSize>('md') })
	size: DropdownSize = 'md';

	@property({ type: Boolean, reflect: true })
	valid = false;

	@property({ type: Boolean, reflect: true })
	invalid = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: Boolean, reflect: true })
	expanded = false;

	/** Optional fixed width (any CSS length). When unset, the field stretches to fill its container. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';

	/**
	 * Accessible name, forwarded as aria-label to the slotted `<select>`. The
	 * wrapper is not the control, so a name on the wrapper reaches nobody. Leave
	 * it empty and name the `<select>` yourself if you prefer.
	 */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	private _select: HTMLSelectElement | null = null;

	/** A value set before the select or a matching option was there, kept
	 *  until one arrives or someone picks an option. */
	private _pendingValue: string | null = null;

	/** Watches the options of the select while a value is pending. */
	private _optionsObserver: MutationObserver | null = null;

	/**
	 * The value of the slotted `<select>`, so a framework can bind to the
	 * dropdown itself instead of reaching for the select inside it.
	 */
	get value(): string {
		if (this._pendingValue !== null) return this._pendingValue;
		return (this._select ?? this.querySelector('select'))?.value ?? '';
	}

	set value(value: string) {
		this._pendingValue = value;
		this._applyPendingValue(this._select ?? this.querySelector('select'));
	}

	/** Sets the pending value on the select. Without a matching option yet, the
	 *  select keeps its own choice and the value is set when the option comes. */
	private _applyPendingValue(select: HTMLSelectElement | null): void {
		if (!select || this._pendingValue === null) return;
		const value = this._pendingValue;
		if ([...select.options].some((option) => option.value === value)) {
			select.value = value;
			this._clearPendingValue();
		} else if (!this._optionsObserver) {
			this._optionsObserver = new MutationObserver(() => this._applyPendingValue(this._select));
			this._optionsObserver.observe(select, { childList: true, subtree: true });
		}
	}

	private _clearPendingValue(): void {
		this._pendingValue = null;
		this._optionsObserver?.disconnect();
		this._optionsObserver = null;
	}

	/** A choice someone makes wins over a value still waiting for its option. */
	private _handleSelectChange = (): void => {
		this._clearPendingValue();
	};


	@property({ type: Boolean, reflect: true })
	required = false;

	/** The name this wrapper wrote onto the select, so it only takes back its own. */
	private _appliedLabel: string | null = null;

	/** Same for `required`, for the same reason. */
	private _appliedRequired: string | null = null;

	// — Lifecycle ——————————————————————————————————————————————————————————————

	override connectedCallback(): void {
		super.connectedCallback();
		// A framework may set `value` before the element upgrades, which leaves an
		// own property shadowing the accessor. Hand it to the accessor instead.
		if (Object.prototype.hasOwnProperty.call(this, 'value')) {
			const value = (this as { value: string }).value;
			delete (this as { value?: string }).value;
			this.value = value;
		}
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._optionsObserver?.disconnect();
		this._optionsObserver = null;
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('disabled')) {
			this._syncDisabled();
		}
		if (changedProperties.has('invalid')) {
			this._syncAriaInvalid();
		}
		if (changedProperties.has('accessibleLabel')) {
			this._syncAccessibleLabel();
		}
		if (changedProperties.has('required')) {
			this._syncRequired();
		}
		if (changedProperties.has('width')) {
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('width', w)) {
				this.style.setProperty('--_dropdown-width', w);
			} else {
				this.style.removeProperty('--_dropdown-width');
			}
		}
	}

	// — Slot ——————————————————————————————————————————————————————————————————

	public _onSlotChange(): void {
		const slot = this.shadowRoot?.querySelector('slot');
		const select = slot?.assignedElements({ flatten: true })
			.find((el): el is HTMLSelectElement => el.tagName === 'SELECT') ?? null;

		if (this._select && this._select !== select) {
			this._select.removeEventListener('focus', this._handleSelectFocus);
			this._select.removeEventListener('blur', this._handleSelectBlur);
			this._select.removeEventListener('keydown', this._handleSelectKeydown);
			this._select.removeEventListener('toggle', this._handleSelectToggle);
			this._select.removeEventListener('change', this._handleSelectChange);
			this._optionsObserver?.disconnect();
			this._optionsObserver = null;
		}

		this._select = select;

		if (!select) {
			setState(this, 'unnamed-select', false);
			this.expanded = false;
			return;
		}

		setState(this, 'unnamed-select', !this.accessibleLabel && !select.hasAttribute("aria-label") && !select.hasAttribute("aria-labelledby") && !select.labels?.length);

		select.addEventListener('focus', this._handleSelectFocus);
		select.addEventListener('blur', this._handleSelectBlur);
		select.addEventListener('keydown', this._handleSelectKeydown);
		select.addEventListener('toggle', this._handleSelectToggle);
		select.addEventListener('change', this._handleSelectChange);
		this._syncDisabled();
		this._syncAriaInvalid();
		this._syncAccessibleLabel();
		this._syncRequired();
		this._applyPendingValue(select);
	}

	// — Internal helpers ——————————————————————————————————————————————————————

	private _syncDisabled(): void {
		if (!this._select) return;
		this._select.disabled = this.disabled;
	}

	/**
	 * Puts the name on the `<select>`, which is the element assistive software
	 * lands on.
	 *
	 * Only ever takes back a name it wrote itself. Naming the `<select>` directly
	 * is the documented way to do this (see the example at the top of this file),
	 * and without this guard the first slotchange would strip it: the wrapper has
	 * no `accessible-label` of its own then, and "no name here" would be read as
	 * "remove the name there".
	 */
	private _syncAccessibleLabel(): void {
		if (!this._select) return;
		this._appliedLabel = setOwnedAttribute(this._select, 'aria-label', this.accessibleLabel, this._appliedLabel);
	}

	/**
	 * Hands `required` to the `<select>`, which is where the browser reads it.
	 *
	 * Only ever takes back a `required` it wrote itself. Writing it on the
	 * `<select>` is the documented way and stays the more specific one, so a
	 * wrapper without the attribute must not read "nothing required here" as
	 * "drop what is there".
	 *
	 * Written out as `required="required"` and not as an empty value, because an
	 * empty value is how setOwnedAttribute says "remove this" and a boolean
	 * needs something to carry.
	 */
	private _syncRequired(): void {
		if (!this._select) return;
		this._appliedRequired = setOwnedAttribute(
			this._select,
			'required',
			this.required ? 'required' : '',
			this._appliedRequired,
		);
	}

	private _syncAriaInvalid(): void {
		if (!this._select) return;
		if (this.invalid) {
			this._select.setAttribute('aria-invalid', 'true');
		} else {
			this._select.removeAttribute('aria-invalid');
		}
	}

	/**
	 * Suppress the native `:focus-visible` ring on the wrapper when focus
	 * came from a pointer. We can't rely on `:focus-visible` alone for
	 * native <select> because Chrome matches it even on mouse click. The
	 * inverted "set when known-to-be-pointer" form is failure-safe — if
	 * input-modality never reports, the attribute stays off and the
	 * default focus ring shows on every focus (keyboard a11y intact).
	 */
	private _handleSelectFocus = (): void => {
		this.toggleAttribute('is-pointer-focus', isPointerMode());
	};

	private _handleSelectBlur = (): void => {
		this.toggleAttribute('is-pointer-focus', false);
		this.expanded = false;
	};

	/** Any key press while focused promotes to keyboard mode — drop the marker. */
	private _handleSelectKeydown = (): void => {
		this.toggleAttribute('is-pointer-focus', false);
	};

	/**
	 * Native <select> dispatches a `toggle` event with `newState` of 'open' or
	 * 'closed' (Chrome 131+, Firefox 134+, Safari 18+). Older browsers
	 * silently skip this — the visual expanded state is then a no-op.
	 */
	private _handleSelectToggle = (e: Event): void => {
		this.expanded = (e as ToggleEvent).newState === 'open';
	};

	/**
	 * Delegates focus to the slotted `<select>`. The wrapper itself is not
	 * focusable, so without this a label pointing at the dropdown has nowhere
	 * to send focus.
	 */
	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
		// Right after the first render the slot has not reported the <select> yet.
		(this._select ?? this.querySelector('select'))?.focus(options);
	}

	/** The consumer's own <select>, which it slots in the light DOM. */
	override describedTarget(): Element | null {
		return this.querySelector('select');
	}

	override render() {
		return dropdownTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-dropdown': NLDDDropdown;
	}
}
