/**
 * Nederlandse Digitale Dienst Checkbox Component (Lit + TypeScript)
 *
 * @element nldd-checkbox
 * @attr {boolean} checked - Checked state
 * @attr {boolean} disabled - Disabled state
 * @attr {'inherit'} color - 'inherit' draws the control in the color of the text around it, with the mark in the surface color (`--context-parent-background-color`) or else `--semantics-content-contrast-color`, white or black against the text color. For a control on a colored surface, such as the panel of nldd-hero, where the accent would not stand out. Without it the control uses the accent.
 * @attr {boolean} no-tab - Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable.
 * @attr {boolean} decorative - Renders the box without the input: no focus, no
 *   name/value, nothing announced. For a control that owns the state elsewhere,
 *   such as a list row that is itself the checkbox; putting a real input in
 *   there would nest a control inside a control.
 * @attr {boolean} indeterminate - Indeterminate state (takes precedence over checked visually)
 * @attr {string} value - Value for form submission
 * @attr {string} name - Name for form submission
 * @attr {string} accessible-label - Accessible label forwarded as aria-label to the native input.
 * @attr {boolean} required - Required state
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *   Note: aria-labelledby is not supported as IDREF resolution cannot cross shadow DOM boundaries.
 *
 * @fires change - Fired when the checkbox state changes; detail: { checked: boolean, value: string }
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { checkboxStyles } from './checkbox.styles.js';
import { checkboxTemplate } from './checkbox.template.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';

@customElement('nldd-checkbox')
export class NLDDCheckbox extends DescribedBy(FormAssociated(LitElement)) {
	static override styles = checkboxStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	private _initialChecked = false;

	@property({ type: Boolean, reflect: true })
	checked = false;

	@property({ type: Boolean, reflect: true })
	decorative = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;
	/** Take the control out of the tab order (`tabindex="-1"`) — for a control
	 *  owned by a roving container (an `nldd-list` sets it on the rows that are
	 *  not the current one) that manages focus itself. Still mouse- and
	 *  script-focusable. */
	@property({ type: Boolean, reflect: true, attribute: 'no-tab' })
	noTab = false;


	@property({ type: Boolean, reflect: true })
	indeterminate = false;

	@property({ type: String })
	value = 'on';

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	/** 'inherit' draws the control in the surrounding text color. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	color = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';


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

	public toggle(): void {
		if (this.disabled) return;
		this.checked = !this.checked;
		this.indeterminate = false;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { checked: this.checked, value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	public _handleChange(e: Event): void {
		const input = e.target as HTMLInputElement;
		this.checked = input.checked;
		this.indeterminate = input.indeterminate;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { checked: this.checked, value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	/**
	 * Delegates focus to the inner native checkbox `<input>`, so consumers can
	 * call `checkboxEl.focus()` without reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		this.shadowRoot?.querySelector<HTMLInputElement>('.checkbox__input')?.focus(options);
	}

	override render() {
		return checkboxTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-checkbox': NLDDCheckbox;
	}
}
