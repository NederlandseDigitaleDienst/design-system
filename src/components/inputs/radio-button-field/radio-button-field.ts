/**
 * Nederlandse Digitale Dienst Radio Button Field Component (Lit + TypeScript)
 *
 * A radio button with an inline label. Use inside nldd-radio-button-group,
 * which sets the name and labels the group.
 *
 * Fields that stand on their own group by name, the way native radios do:
 * checking one unchecks the others, the arrow keys move between them and Tab
 * stops at the group once. Put them in a container with role="radiogroup", or
 * a screen reader has nothing to count them from.
 *
 * The field is the radio: it carries the role, the state, the label it is
 * announced by and the focus, and the nldd-radio-button inside only draws the
 * shape. A radio of its own in there would be a second control inside a
 * control, and a group of one to count.
 *
 * Form-associated: the checked field submits its `value` under `name`.
 * Unchecking siblings is the group's job, so exactly one value per group
 * reaches the form.
 *
 * @element nldd-radio-button-field
 * @attr {boolean} checked - Checked state
 * @attr {boolean} disabled - Disabled state
 * @attr {'inherit'} color - 'inherit' draws the control and its label in the color of the text around it, for a field on a colored surface such as the panel of nldd-hero. Passed to the control inside.
 * @attr {string} value - Value for form submission
 * @attr {string} name - Radio group name for form submission; ties the fields of one group together. Set automatically by nldd-radio-button-group.
 * @attr {boolean} required - Required state. What it asks is whether anything in the group is checked, as a native radio does. Set automatically by nldd-radio-button-group.
 * @attr {string} label - Label text for the radio button
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @fires change - When checked state changes; detail: { checked: boolean, value: string }
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { radioButtonFieldStyles } from './radio-button-field.styles.js';
import { radioButtonFieldTemplate } from './radio-button-field.template.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import type { RadioPosition } from '../../../utilities/radio-position.js';
import { RadioGrouping } from '../../../utilities/radio-grouping.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { isKeyboardMode } from '../../../utilities/input-modality.js';

@customElement('nldd-radio-button-field')
export class NLDDRadioButtonField extends DescribedBy(FormAssociated(LitElement)) {

	static override styles = radioButtonFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;


	private _initialChecked = false;

	@property({ type: Boolean, reflect: true })
	checked = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String })
	value = '';

	/** Set by nldd-radio-button-group. Not part of the public API.
	 *  Reflected: form association reads the host's name attribute, and the
	 *  group assigns the property. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: Boolean, reflect: true })
	required = false;

	/** 'inherit' draws the control and its label in the surrounding text color. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	color: '' | 'inherit' = '';

	@property({ type: String })
	label = '';


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

	/** Set by nldd-radio-button-group: this field's place in the group, which it
	 *  cannot count by itself. */
	@state()
	_groupPosition: RadioPosition | null = null;

	/** Set by nldd-radio-button-group. What `required` asks of a radio is
	 *  whether anything in the group is checked, not this one. */
	@state()
	_groupHasSelection = false;

	/** Its place among the fields that share its name, for a field that stands
	 *  outside an nldd-radio-button-group. The group wins where it is there. */
	private _grouping = new RadioGrouping(this);

	/** The place it is announced with: from the group around it, or from the
	 *  radios it shares a name with. */
	get _position(): RadioPosition | null {
		return this._groupPosition ?? this._grouping.position;
	}

	/** Whether anything in its group is checked. Either source saying so is
	 *  enough: they answer for the same set of radios. */
	get _answered(): boolean {
		return this._groupHasSelection || this._grouping.answered;
	}

	/** The aria-label this field wrote on itself, so it only takes back its own. */
	private _appliedLabel: string | null = null;

	/** The field holds the focus, the shape inside shows it. Only for the
	 *  keyboard, as a focus ring is: a click does not draw one. */
	@state()
	_focusRing = false;

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('click', this._onClick);
		this.addEventListener('keydown', this._onKeyDown);
		this.addEventListener('focus', this._onFocus);
		this.addEventListener('blur', this._onBlur);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('click', this._onClick);
		this.removeEventListener('keydown', this._onKeyDown);
		this.removeEventListener('focus', this._onFocus);
		this.removeEventListener('blur', this._onBlur);
	}

	override firstUpdated(): void {
		this._initialChecked = this.checked;
	}

	/** Counting happens before the render, not after it: the place this field is
	 *  given decides what `updated()` writes on it, and a count from there would
	 *  ask for a second render of what was just drawn. */
	override willUpdate(changed: PropertyValues<this>): void {
		if (changed.has('checked') && this.checked) this._grouping.uncheckOthers();
		if (changed.has('name')) this._grouping.regroup();
		else if (changed.has('checked') || changed.has('disabled')) this._grouping.refresh();
	}

	override updated(changed: PropertyValues<this>): void {
		super.updated(changed);
		this._syncHostAria();
	}

	/**
	 * This element is the radio, label and all.
	 *
	 * A native radio in a shadow root of its own is a group of one, which a
	 * screen reader counts as "1 of 1" and Tab stops at one by one. The role on
	 * the element itself puts the whole group back in one tree, and the label it
	 * renders is the name it is announced by.
	 */
	private _syncHostAria(): void {
		this.setAttribute('role', 'radio');
		this.setAttribute('aria-checked', String(this.checked));
		this._appliedLabel = setOwnedAttribute(this, 'aria-label', this.label, this._appliedLabel);
		if (this.disabled) this.setAttribute('aria-disabled', 'true');
		else this.removeAttribute('aria-disabled');

		const position = this._position;
		if (position) {
			this.setAttribute('aria-posinset', String(position.posInSet));
			this.setAttribute('aria-setsize', String(position.setSize));
		} else {
			this.removeAttribute('aria-posinset');
			this.removeAttribute('aria-setsize');
		}
		// A disabled radio is not in the tab order, as a native one is not.
		const tabbable = !this.disabled && position?.tabbable !== false;
		this.setAttribute('tabindex', tabbable ? '0' : '-1');
	}

	/** An unchecked radio contributes nothing to the form. The group calls
	 *  `commitFormValue()` on the siblings it unchecks, so a listener that reads
	 *  the form while `change` is still propagating never sees two values. */
	override formValue(): FormValue {
		return this.checked ? this.value : null;
	}

	formResetCallback(): void {
		this.checked = this._initialChecked;
	}


	formStateRestoreCallback(state: File | string | FormData | null): void {
		this.checked = state !== null;
	}

	/** Checks this field, the way a click or the space bar does. The group hears
	 *  the change and unchecks the others; without a group the fields that share
	 *  its name are unchecked here. */
	public select(): void {
		if (this.disabled || this.checked) return;
		this.checked = true;
		this.commitFormValue();
		this._grouping.uncheckOthers();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { checked: true, value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	private _onClick = (): void => {
		this.select();
	};

	private _onFocus = (): void => {
		this._focusRing = isKeyboardMode();
	};

	private _onBlur = (): void => {
		this._focusRing = false;
	};

	private _onKeyDown = (e: KeyboardEvent): void => {
		if (this.disabled) return;
		// Space checks it and Enter submits the form, as with a native radio.
		if (e.key === ' ') {
			e.preventDefault();
			this.select();
			return;
		}
		if (e.key === 'Enter') {
			submitOnEnter(this, e);
			return;
		}
		// The arrow keys are the group's, and a field that has none moves through
		// the fields it shares a name with, as native radios do.
		if (!this._groupPosition) this._grouping.moveWithArrow(e);
	};

	/** The element assistive software meets is this one, so the description and
	 *  the invalid state belong here rather than on the shape inside. */
	override describedTarget(): Element | null {
		return this;
	}

	override render() {
		return radioButtonFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-radio-button-field': NLDDRadioButtonField;
	}
}
