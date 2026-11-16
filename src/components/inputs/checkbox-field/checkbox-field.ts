/**
 * Nederlandse Digitale Dienst Checkbox Field Component (Lit + TypeScript)
 *
 * A checkbox with an inline label for use in forms.
 *
 * Options that belong under this one are nldd-checkbox-fields of their own,
 * each with `slot="children"`, as rows nest in nldd-list-item. They indent to
 * line up with the label, and are a group named after this option. This
 * checkbox then follows them: checked when all of them are, indeterminate
 * when some are, and unchecked when none are. Checking or unchecking it does
 * the same to every option under it that is not disabled, nor under a
 * disabled one; those fire no `change` of their own then, so listen on this
 * one or higher up. When a disabled option keeps it indeterminate and the
 * rest are already checked, a click unchecks them instead. Its own `change`
 * fires when they change its state, so a box further up follows too. In an
 * nldd-checkbox-group, the options under it belong to the group as well.
 *
 * Form-associated: participates in native form submission under `name` with
 * `value` when checked (the inner nldd-checkbox sits in the shadow root and
 * never joins the consumer's form; the field submits on its behalf).
 *
 * @element nldd-checkbox-field
 * @attr {boolean} checked - Checked state
 * @attr {boolean} indeterminate - Indeterminate state
 * @attr {boolean} disabled - Disabled state
 * @attr {'content'} color - 'content' draws the control and its label in the color of the text around it, for a field on a colored surface such as the panel of nldd-hero. Passed to the control inside.
 * @attr {string} value - Value for form submission
 * @attr {string} name - Name for form submission
 * @attr {string} label - Label text for the checkbox
 * @attr {boolean} required - Required state. In an nldd-checkbox-group, set by the group, it asks for at least one checked box in the group, not for this one.
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @slot children - nldd-checkbox-field elements with the options under this one.
 *
 * @fires change - When checked state changes; detail: { checked: boolean, value: string }
 */
import { LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { FormAssociated, uncheckedValidity, type FormValue, type OwnValidity } from '../../../utilities/form-associated-mixin.js';
import { checkboxFieldStyles } from './checkbox-field.styles.js';
import { checkboxFieldTemplate } from './checkbox-field.template.js';
import type { NLDDCheckbox } from '../checkbox/checkbox.js';
import type { NLDDCheckboxGroup } from '../checkbox-group/checkbox-group.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { deferFocus } from '../../../utilities/defer-focus.js';

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

	/** 'content' draws the control and its label in the surrounding text color. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	color: '' | 'content' = '';

	@property({ type: String })
	label = '';


	@property({ type: Boolean, reflect: true })
	required = false;

	/** In an nldd-checkbox-group, where `required` is about the group and no
	 *  single box is announced as required. */
	get _inGroup(): boolean {
		return this._group !== null;
	}

	/** Set by nldd-checkbox-group: whether any box in the group is checked,
	 *  which is what `required` asks there. */
	@state()
	_groupHasSelection = false;


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

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('change', this._handleChildChange);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('change', this._handleChildChange);
	}

	/** The options right under this one, not those further down. */
	@state()
	_childFields: NLDDCheckboxField[] = [];

	public _handleChildrenSlotChange(e: Event): void {
		const slot = e.target as HTMLSlotElement;
		this._childFields = slot.assignedElements()
			.filter((el): el is NLDDCheckboxField => el.localName === 'nldd-checkbox-field');
		this._followChildren(false);
		// The group sees only its own children arrive, not the options under them.
		this._group?._onSlotChange();
	}

	/** The nldd-checkbox-group around this field, if any. */
	private get _group(): NLDDCheckboxGroup | null {
		return this.closest('nldd-checkbox-group');
	}

	/** Also when the app sets `checked` or a form resets it: the group answers
	 *  `required` again, which it cannot see by itself. */
	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		if (this.hasUpdated && changed.has('checked')) this._group?._optionChanged();
	}

	/** A change of an option right under this one; one further down reaches
	 *  this through the option it belongs to. */
	private _handleChildChange = (e: Event): void => {
		const target = e.target as Element;
		if (target === this || target.localName !== 'nldd-checkbox-field') return;
		if (!this._childFields.includes(target as NLDDCheckboxField)) return;
		this._followChildren(true);
	};

	/** Checked when all options under this one are, indeterminate when some
	 *  are, unchecked when none are. */
	private _followChildren(announce: boolean): void {
		const fields = this._childFields;
		if (fields.length === 0) return;
		const all = fields.every((field) => field.checked);
		const some = fields.some((field) => field.checked || field.indeterminate);
		const indeterminate = !all && some;
		if (all === this.checked && indeterminate === this.indeterminate) return;
		this.checked = all;
		this.indeterminate = indeterminate;
		this.commitFormValue();
		if (announce) this._dispatchChange();
	}

	/** Whether setting the options under this one would change any of them. */
	private _wouldChange(checked: boolean): boolean {
		return this._childFields.some((field) => !field.disabled && (field._childFields.length > 0
			? field._wouldChange(checked)
			: field.checked !== checked));
	}

	/** Gives every option under this one, at any depth, this state, except
	 *  those that are disabled and everything under them. */
	private _setChildren(checked: boolean): void {
		if (this._childFields.length === 0) return;
		this._childFields.forEach((field) => {
			// A disabled option keeps its state, and so does everything under it.
			if (field.disabled) return;
			field.checked = checked;
			field.indeterminate = false;
			// Depth first, so each box follows options that are settled.
			field._setChildren(checked);
			field.commitFormValue();
		});
		this._followChildren(false);
	}

	private _dispatchChange(): void {
		this.dispatchEvent(new CustomEvent('change', {
			detail: { checked: this.checked, value: this.value },
			bubbles: true,
			composed: true,
		}));
	}


	override formValue(): FormValue {
		return this.checked ? this.value : null;
	}

	/** The checkbox that carries `required` sits in a shadow root of its own,
	 *  where the form cannot see it. */
	override ownValidity(): OwnValidity | null {
		return uncheckedValidity({ required: this.required, checked: this.checked || this._groupHasSelection, disabled: this.disabled });
	}

	formResetCallback(): void {
		this.checked = this._initialChecked;
		this.indeterminate = false;
		// The options under this one reset too, in their own callbacks.
		if (this._childFields.length > 0) queueMicrotask(() => this._followChildren(false));
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
		let { checked } = (e as CustomEvent<{ checked: boolean }>).detail;
		// Partial because of an option it cannot change: checking would do
		// nothing, so the click clears what it can.
		if (checked && this._childFields.length > 0 && !this._wouldChange(true)) checked = false;
		this.checked = checked;
		this.indeterminate = false;
		this._setChildren(checked);
		// The box toggled itself; render even when this field ends where it was.
		this.requestUpdate();
		this.commitFormValue();
		this._dispatchChange();
	}

	/**
	 * Delegates focus to the inner `<nldd-checkbox>`, which in turn focuses its
	 * native input. Lets consumers call `checkboxFieldEl.focus()` without
	 * reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
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
