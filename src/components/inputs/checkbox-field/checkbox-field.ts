/**
 * Nederlandse Digitale Dienst Checkbox Field Component (Lit + TypeScript)
 *
 * A checkbox with an inline label for use in forms.
 *
 * Form-associated: participates in native form submission under `name` with
 * `value` when checked (the inner nldd-checkbox sits in the shadow root and
 * never joins the consumer's form; the field submits on its behalf).
 *
 * @element nldd-checkbox-field
 * @attr {boolean} checked - Checked state
 * @attr {boolean} indeterminate - Indeterminate state
 * @attr {boolean} disabled - Disabled state
 * @attr {'inherit'} color - 'inherit' draws the control and its label in the color of the text around it, for a field on a colored surface such as the panel of nldd-hero. Passed to the control inside.
 * @attr {string} value - Value for form submission
 * @attr {string} name - Name for form submission
 * @attr {string} label - Label text for the checkbox
 * @attr {boolean} required - Required state
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @fires change - When checked state changes; detail: { checked: boolean, value: string }
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { checkboxFieldStyles } from './checkbox-field.styles.js';
import { checkboxFieldTemplate } from './checkbox-field.template.js';
import type { NLDDCheckbox } from '../checkbox/checkbox.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';

@customElement('nldd-checkbox-field')
export class NLDDCheckboxField extends DescribedBy(FormAssociated(LitElement)) {

	static override styles = checkboxFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;


	private _initialChecked = false;

	@property({ type: Boolean, reflect: true })
	checked = false;

	@property({ type: Boolean, reflect: true })
	indeterminate = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String })
	value = 'on';

	/** Reflected: form association reads the host's name attribute, so setting
	 *  the property alone must still register the field with the form. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	/** 'inherit' draws the control and its label in the surrounding text color. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	color: '' | 'inherit' = '';

	@property({ type: String })
	label = '';


	@property({ type: Boolean, reflect: true })
	required = false;


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

	override firstUpdated(): void {
		this._initialChecked = this.checked;
	}


	override formValue(): FormValue {
		return this.checked ? this.value : null;
	}

	formResetCallback(): void {
		this.checked = this._initialChecked;
		this.indeterminate = false;
	}


	formStateRestoreCallback(state: File | string | FormData | null): void {
		this.checked = state !== null;
	}

	public _handleLabelClick(e: Event): void {
		if (this.disabled) return;
		if ((e.target as HTMLElement).closest?.('nldd-checkbox')) return;
		const checkbox = this.shadowRoot?.querySelector('nldd-checkbox') as NLDDCheckbox | null;
		checkbox?.toggle();
	}

	public _handleChange(e: Event): void {
		const { checked } = (e as CustomEvent<{ checked: boolean }>).detail;
		this.checked = checked;
		this.indeterminate = false;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { checked: this.checked, value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	/**
	 * Delegates focus to the inner `<nldd-checkbox>`, which in turn focuses its
	 * native input. Lets consumers call `checkboxFieldEl.focus()` without
	 * reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		this.shadowRoot?.querySelector<NLDDCheckbox>('nldd-checkbox')?.focus(options);
	}

	/** The checkbox it renders knows which element inside itself is the control. */
	override describedTarget(): Element | null {
		return this.shadowRoot?.querySelector('nldd-checkbox') ?? null;
	}

	override render() {
		return checkboxFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-checkbox-field': NLDDCheckboxField;
	}
}
