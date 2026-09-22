/**
 * Nederlandse Digitale Dienst Segmented Control Component (Lit + TypeScript)
 *
 * A horizontal group of mutually exclusive (radio) or multi-select (checkbox) options.
 * Exports both NLDDSegmentedControl and NLDDSegmentedControlItem.
 *
 * @element nldd-segmented-control
 * @attr {string} value - Selected value for radio type
 * @prop {string[]} values - Selected values for checkbox type (property binding only, not an attribute)
 * @attr {string} size - Control size: 'sm' | 'md' | 'lg' (default: 'md')
 * @attr {string} type - Selection mode: 'radio' | 'checkbox' (default: 'radio').
 * @attr {string} variant - Content type for all items: 'text' | 'icon' | 'icon-and-text' (default: 'text')
 * @attr {boolean} disabled - Disabled state for all items
 * @attr {string} width - Width mode: 'full' (stretches to container), 'fit-content' (per-item content size), or any CSS length (e.g. '240px')
 * @attr {string} name - Name for form submission
 * @attr {string} accessible-label - Accessible name for the group, set as aria-label
 * @attr {string} accessible-labeled-by - Id of an external label element, set as aria-labelledby on the group
 * @attr {boolean} required - Marks the group as required. Enforced in radio mode; in checkbox mode only announced.
 * @attr {boolean} invalid - Marks the group as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @fires change - When selection changes; detail: { value: string } for radio, detail: { values: string[] } for checkbox
 *
 * @slot - nldd-segmented-control-item elements
 *
 * ---
 *
 * @element nldd-segmented-control-item
 * @attr {string} value - Value for this item
 * @attr {boolean} selected - Whether this item is selected (set by parent)
 * @attr {boolean} disabled - Disabled state
 * @attr {string} text - Text label (shown for variant "text" and "icon-and-text"; used as aria-label and tooltip for variant "icon")
 * @attr {string} icon - Icon name for nldd-icon
 * @attr {string} size - Control size: 'sm' | 'md' | 'lg' (default: 'md'). Set by nldd-segmented-control.
 * @attr {string} variant - Content type: 'text' | 'icon' | 'icon-and-text' (default: 'text'). Set by nldd-segmented-control.
 * @attr {string} input-type - Selection mode: 'radio' | 'checkbox' (default: 'radio'). In radio mode the item is the radio itself, in checkbox mode it renders a native checkbox. Set by nldd-segmented-control.
 * @attr {string} group-name - Name of the group for form submission, put on the native checkbox. Set by nldd-segmented-control.
 * @attr {boolean} required - Required state of the native checkbox. In radio mode the group carries the constraint.
 *
 * @slot icon - Slot for a custom icon (e.g. custom SVG). Only used when icon attribute is not set.
 *
 * @fires item-change - When item is activated; detail: { value: string, checked: boolean }
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { radioPositions, type RadioPosition } from '../../../utilities/radio-position.js';
import {
	segmentedControlStyles,
	segmentedControlItemStyles,
} from './segmented-control.styles.js';
import {
	segmentedControlTemplate,
	segmentedControlItemTemplate,
} from './segmented-control.template.js';
import './../../content/icon/icon.js';
import type { NLDDTooltip } from '../../content/tooltip/tooltip.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';

export type SegmentedControlSize = 'sm' | 'md' | 'lg';
export type SegmentedControlType = 'radio' | 'checkbox';
export type SegmentedControlVariant = 'text' | 'icon' | 'icon-and-text';


// # nldd-segmented-control-item

@customElement('nldd-segmented-control-item')
export class NLDDSegmentedControlItem extends LitElement {

	@property({ type: Boolean, reflect: true })
	required = false;
	static override styles = segmentedControlItemStyles;

	@property({ type: String })
	value = '';

	@property({ type: Boolean, reflect: true })
	selected = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	/** Control size: 'sm' | 'md' | 'lg'. Set by nldd-segmented-control. Not part of the public API. */
	@property({ reflect: true, converter: reflectNonDefault<SegmentedControlSize>('md') })
	size: SegmentedControlSize = 'md';

	/** Set by nldd-segmented-control. Not part of the public API. */
	@property({ reflect: true, attribute: 'variant', converter: reflectNonDefault<SegmentedControlVariant>('text') })
	variant: SegmentedControlVariant = 'text';

	/** Set by nldd-segmented-control. Not part of the public API. */
	@property({ reflect: true, attribute: 'input-type', converter: reflectNonDefault<SegmentedControlType>('radio') })
	inputType: SegmentedControlType = 'radio';

	/** Set by nldd-segmented-control. Not part of the public API.
	 *
	 * The attribute name is stated: without it Lit derives `groupname`, all
	 * lowercase, while the documentation has always promised `group-name`. */
	@property({ type: String, attribute: 'group-name' })
	groupName = '';

	/** Text label for the item. Used as visible text and as aria-label/tooltip for icon variant. */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	/** Icon name for nldd-icon. When not set, the icon slot is used; the icon and
	 *  icon-and-text variants show a placeholder icon when neither is provided. */
	@property({ type: String })
	icon = '';

	/** Set by nldd-segmented-control in radio mode: this item's place in the
	 *  group, which it cannot count by itself. */
	@state()
	_groupPosition: RadioPosition | null = null;

	/** The aria-label this item wrote on itself, so it only takes back its own. */
	private _appliedRadioLabel: string | null = null;

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
	 * The tooltip of the icon variant, which shows itself when focus moves into
	 * it. In radio mode the focus is on this element, outside it, so it hears
	 * about focus and Escape from here.
	 */
	private get _tooltip(): NLDDTooltip | null {
		return this.inputType === 'radio'
			? this.shadowRoot?.querySelector('nldd-tooltip') ?? null
			: null;
	}

	private _onRadioFocus = (): void => {
		this._tooltip?._handleFocusIn();
	};

	private _onRadioBlur = (): void => {
		this._tooltip?._handleTriggerLeave();
	};

	override updated(): void {
		this._syncRadioAria();
	}

	/**
	 * In radio mode this element is the radio.
	 *
	 * A native radio in a shadow root of its own is a group of one: a screen
	 * reader counts it as "1 of 1" and Tab stops at every option. The role on the
	 * element itself puts the whole group back in one tree, under the radiogroup
	 * the control carries. Checkbox mode keeps its native input.
	 */
	private _syncRadioAria(): void {
		if (this.inputType !== 'radio') {
			for (const name of ['role', 'aria-checked', 'aria-disabled', 'aria-posinset', 'aria-setsize', 'tabindex']) {
				this.removeAttribute(name);
			}
			this._appliedRadioLabel = setOwnedAttribute(this, 'aria-label', '', this._appliedRadioLabel);
			return;
		}
		this.setAttribute('role', 'radio');
		this.setAttribute('aria-checked', String(this.selected));
		this._appliedRadioLabel = setOwnedAttribute(this, 'aria-label', this.text, this._appliedRadioLabel);
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
		// A disabled option is not in the tab order, as a native one is not.
		const tabbable = !this.disabled && position?.tabbable !== false;
		this.setAttribute('tabindex', tabbable ? '0' : '-1');
	}

	/** Checked, the way a click or the space bar does it. A radio never
	 *  unchecks itself, so an option that is already selected says nothing. */
	private _select(): void {
		if (this.disabled || this.selected) return;
		this.dispatchEvent(new CustomEvent('item-change', {
			detail: { value: this.value, checked: true },
			bubbles: true,
			composed: true,
		}));
	}

	private _onRadioClick = (): void => {
		if (this.inputType !== 'radio') return;
		this._select();
	};

	private _onRadioKeyDown = (e: KeyboardEvent): void => {
		if (this.inputType !== 'radio' || this.disabled) return;
		// Space is the key a radio answers to itself. The arrow keys and Enter
		// belong to the group: it knows the form.
		if (e.key === ' ') {
			e.preventDefault();
			this._select();
			return;
		}
		// Escape puts the tooltip away without moving focus, as WCAG 1.4.13 asks.
		if (e.key === 'Escape') this._tooltip?._handleTriggerLeave();
	};

	public _handleChange(e: Event): void {
		const input = e.target as HTMLInputElement;
		this.dispatchEvent(new CustomEvent('item-change', {
			detail: { value: this.value, checked: input.checked },
			bubbles: true,
			composed: true,
		}));
	}

	/**
	 * Delegates focus to whichever control this mode renders: the element itself
	 * in radio mode, the native `<input>` in checkbox mode. Lets consumers call
	 * `itemEl.focus()` without reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		if (this.inputType === 'radio') {
			super.focus(options);
			return;
		}
		this.shadowRoot
			?.querySelector<HTMLInputElement>('.segmented-control__item-input')
			?.focus(options);
	}

	override render() {
		return segmentedControlItemTemplate(this);
	}
}


// # nldd-segmented-control

@customElement('nldd-segmented-control')
export class NLDDSegmentedControl extends FormAssociated(LitElement) {

	/**
	 * Marks the group as required: something has to be selected.
	 *
	 * The group carries the constraint, on a radio of its own that is checked as
	 * soon as anything is selected. The items are the radios the user meets, and
	 * they have no input left to read it from. The browser writes the message in
	 * the user's language.
	 *
	 * Only in radio mode. The same attribute on a checkbox means that box has to
	 * be ticked, so a required checkbox group would demand all of them instead of
	 * one. HTML has no way to say "at least one of these", and neither do we:
	 * `aria-required` still goes on the group so assistive software says it, but
	 * nothing enforces it.
	 */
	@property({ type: Boolean, reflect: true })
	required = false;

	/**
	 * Marks the group as invalid.
	 *
	 * Announced and not drawn, and on the group and not on an item: a red ring
	 * around one option would say that option is wrong, while it is the question
	 * that is unanswered. What is wrong belongs in an
	 * nldd-validation-list, in words.
	 */
	@property({ type: Boolean, reflect: true })
	invalid = false;

	private _warnedRequired = false;

	static override styles = segmentedControlStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;


	private _initialValue = '';
	private _initialValues: string[] = [];

	/** Selected value for radio type. */
	@property({ type: String, reflect: true })
	value = '';

	/**
	 * Selected values for checkbox type.
	 * Use property binding: .values=${['New York', 'Amsterdam']}
	 * Does not reflect to an attribute — safe for values containing spaces or special characters.
	 */
	@property({ type: Array, attribute: false })
	values: string[] = [];

	@property({ reflect: true, converter: reflectNonDefault<SegmentedControlSize>('md') })
	size: SegmentedControlSize = 'md';

	@property({ type: String, reflect: true })
	type: SegmentedControlType = 'radio';

	/** Content type applied to all items: text, icon, or icon-and-text. Per-item mixing is not supported. */
	@property({ reflect: true, attribute: 'variant', converter: reflectNonDefault<SegmentedControlVariant>('text') })
	variant: SegmentedControlVariant = 'text';

	@property({ type: Boolean, reflect: true })
	disabled = false;

	/**
	 * Width mode: 'full' (stretch to container, equal-width items),
	 * 'fit-content' (per-item content size), or any CSS length (e.g. '240px',
	 * '50%') which sets the host width with equal-width items. Default is
	 * content-based outer with equal-width items.
	 */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	/** Accessible name for the group (aria-label). */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** ID of an external label element (aria-labelledby). */
	@property({ type: String, attribute: 'accessible-labeled-by' })
	accessibleLabeledBy = '';

	/** The name this group wrote onto its host, so it only takes back its own. */
	private _appliedLabel: string | null = null;

	// — Lifecycle ——————————————————————————————————————————————————————————————

	override connectedCallback(): void {
		super.connectedCallback();
		this.setAttribute('role', this.type === 'checkbox' ? 'group' : 'radiogroup');
		if (this.accessibleLabel) this.setAttribute('aria-label', this.accessibleLabel);
		if (this.accessibleLabeledBy) this.setAttribute('aria-labelledby', this.accessibleLabeledBy);
		this.addEventListener('item-change', this._handleItemChange as EventListener);
		this.addEventListener('keydown', this._handleKeydown);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('item-change', this._handleItemChange as EventListener);
		this.removeEventListener('keydown', this._handleKeydown);
	}

	override firstUpdated(): void {
		this._syncItems();
		this._initialValue = this.value;
		this._initialValues = [...this.values];
		if (import.meta.env?.DEV && !this.accessibleLabel && !this.accessibleLabeledBy) {
			console.warn('<nldd-segmented-control>: No accessible name provided. Add an accessible-label or accessible-labeled-by attribute for screen reader accessibility.');
		}
	}

	override formValue(): FormValue {
		if (this.type !== 'checkbox') return this.value || null;
		if (this.values.length === 0 || !this.name) return null;
		// Submit each selected value under the same name (FormData.getAll)
		const data = new FormData();
		for (const v of this.values) data.append(this.name, v);
		return data;
	}

	formResetCallback(): void {
		this.value = this._initialValue;
		this.values = [...this._initialValues];
	}

	/** The group has no focus of its own, so an invalid submit lands where Tab
	 *  would: on the chosen option, or the first one that is enabled. */
	override validationAnchor(): HTMLElement | undefined {
		const items = this._getItems().filter((item) => !item.disabled);
		return items.find((item) => item.selected) ?? items[0];
	}


	formStateRestoreCallback(state: FormData | string | null): void {
		if (state === null) return;
		if (this.type === 'checkbox' && state instanceof FormData && this.name) {
			this.values = state.getAll(this.name).map(String);
		} else if (typeof state === 'string') {
			this.value = state;
		}
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('width')) {
			// Keyword 'full' is handled by CSS ([width="full"] sets
			// --_width: 100% and switches display to grid). Keyword
			// 'fit-content' only changes grid-auto-columns and leaves the host
			// width alone. A valid CSS length feeds --_width here.
			// Invalid values do nothing.
			const w = this.width;
			const isKeyword = w === 'full' || w === 'fit-content';
			if (w && !isKeyword && CSS.supports('width', w)) {
				this.style.setProperty('--_width', w);
			} else {
				this.style.removeProperty('--_width');
			}
		}
		if (
			changedProperties.has('value') ||
			changedProperties.has('values') ||
			changedProperties.has('size') ||
			changedProperties.has('disabled') ||
			changedProperties.has('type') ||
			changedProperties.has('variant') ||
			changedProperties.has('name')
		) {
			this._syncItems();
		}
		if (
			changedProperties.has('value') ||
			changedProperties.has('values') ||
			changedProperties.has('type') ||
			changedProperties.has('name')
		) {
			this.commitFormValue();
		}
		if (changedProperties.has('type')) {
			this.setAttribute('role', this.type === 'checkbox' ? 'group' : 'radiogroup');
		}
		if (changedProperties.has('accessibleLabel')) {
			this._appliedLabel = setOwnedAttribute(this, 'aria-label', this.accessibleLabel, this._appliedLabel);
		}
		if (changedProperties.has('accessibleLabeledBy')) {
			if (this.accessibleLabeledBy) {
				this.setAttribute('aria-labelledby', this.accessibleLabeledBy);
			} else {
				this.removeAttribute('aria-labelledby');
			}
		}
	}

	// — Items ——————————————————————————————————————————————————————————————————

	private _getItems(): NLDDSegmentedControlItem[] {
		const slot = this.shadowRoot?.querySelector('slot');
		if (!slot) return [];
		return slot
			.assignedElements()
			.filter((el): el is NLDDSegmentedControlItem =>
				el.tagName.toLowerCase() === 'nldd-segmented-control-item'
			);
	}

	private _getSelectedValues(): string[] {
		return this.type === 'checkbox' ? this.values : (this.value ? [this.value] : []);
	}

	private _syncItems(): void {
		const items = this._getItems();
		this.toggleAttribute('aria-required', this.required);
		// Announced, not drawn. See the note on `invalid`.
		if (this.invalid) this.setAttribute('aria-invalid', 'true');
		else this.removeAttribute('aria-invalid');

		if (import.meta.env?.DEV && this.required && this.type === 'checkbox' && !this._warnedRequired) {
			this._warnedRequired = true;
			console.warn(
				`<${this.localName}>: \`required\` on a checkbox group is announced but not enforced. `
				+ 'HTML has no way to say "at least one of these", so the form still submits with nothing '
				+ 'selected. Check it yourself on submit, or use radio mode.',
			);
		}

		const selectedValues = this._getSelectedValues();

		if (this.disabled) {
			items.forEach(item => {
				if (!item.hasAttribute('disabled')) {
					item.setAttribute('group-disabled', '');
					item.disabled = true;
				}
			});
		} else {
			items.forEach(item => {
				if (item.hasAttribute('group-disabled')) {
					item.removeAttribute('group-disabled');
					item.disabled = false;
				}
			});
		}

		items.forEach(item => {
			item.size = this.size;
			item.inputType = this.type;
			item.variant = this.variant;
			item.groupName = this.name || this._autoName;
			item.selected = this.type === 'checkbox'
				? selectedValues.includes(item.value)
				: item.value === this.value;
		});

		// Radio mode only: each item its place in the group, and the group one stop
		// for Tab. Every item renders its input in a shadow root of its own, so the
		// browser would count each as a group of one.
		const positions = this.type === 'radio'
			? radioPositions(items, (item) => item.selected, (item) => item.disabled)
			: [];
		items.forEach((item, index) => {
			item._groupPosition = positions[index] ?? null;
		});
	}

	private static _idCounter = 0;

	private get _autoName(): string {
		if (!this._generatedName) {
			this._generatedName = `nldd-segmented-${NLDDSegmentedControl._idCounter++}`;
		}
		return this._generatedName;
	}

	private _generatedName = '';

	// — Handlers ———————————————————————————————————————————————————————————————

	private _handleItemChange = (e: CustomEvent<{ value: string; checked: boolean }>): void => {
		e.stopPropagation();
		if (this.disabled) return;

		if (this.type === 'checkbox') {
			const current = this.values;
			const updated = e.detail.checked
				? [...current, e.detail.value]
				: current.filter(v => v !== e.detail.value);
			this.values = updated;
			this._syncItems();
			this.commitFormValue();
			this.dispatchEvent(new CustomEvent('change', {
				detail: { values: updated },
				bubbles: true,
				composed: true,
			}));
		} else {
			if (e.detail.value === this.value) return;
			this.value = e.detail.value;
			this._syncItems();
			this.commitFormValue();
			this.dispatchEvent(new CustomEvent('change', {
				detail: { value: this.value },
				bubbles: true,
				composed: true,
			}));
		}
	};

	/**
	 * Handles arrow key navigation for radio type.
	 * For checkbox type, keyboard navigation is intentionally omitted —
	 * each native checkbox input is individually Tab-focusable and
	 * Space-toggleable per the native checkbox interaction pattern.
	 */
	private _handleKeydown = (e: KeyboardEvent): void => {
		if (this.disabled || this.type === 'checkbox') return;

		// Enter on a radio submits the form it belongs to, and the group is what
		// the form knows.
		if (e.key === 'Enter') {
			submitOnEnter(this, e);
			return;
		}

		const items = this._getItems().filter(item => !item.disabled);
		if (items.length === 0) return;

		const currentIndex = items.findIndex(item => item.selected);

		let nextIndex: number;

		switch (e.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				e.preventDefault();
				nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
				break;
			case 'Home':
				e.preventDefault();
				nextIndex = 0;
				break;
			case 'End':
				e.preventDefault();
				nextIndex = items.length - 1;
				break;
			default:
				return;
		}

		if (nextIndex !== currentIndex && items[nextIndex]) {
			this.value = items[nextIndex].value;
			this._syncItems();
			this.commitFormValue();
			items[nextIndex].focus();
			this.dispatchEvent(new CustomEvent('change', {
				detail: { value: this.value },
				bubbles: true,
				composed: true,
			}));
		}
	};

	public _onSlotChange(): void {
		this._syncItems();
	}

	/**
	 * Delegates focus to the selected item, or to the first enabled one when
	 * nothing is selected. Mirrors where the keyboard lands when tabbing into
	 * the control.
	 */
	override focus(options?: FocusOptions): void {
		const items = this._getItems().filter(item => !item.disabled);
		(items.find(item => item.selected) ?? items[0])?.focus(options);
	}

	override render() {
		return segmentedControlTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-segmented-control': NLDDSegmentedControl;
		'nldd-segmented-control-item': NLDDSegmentedControlItem;
	}
}
