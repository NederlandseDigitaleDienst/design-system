/**
 * Nederlandse Digitale Dienst Password Field Component (Lit + TypeScript)
 *
 * A password input field with visibility toggle and validation states.
 *
 * @element nldd-password-field
 *
 * @attr {string} value - The input value
 * @attr {string} placeholder - Placeholder text
 * @attr {string} input-id - Sets the id on the native input. Set automatically by nldd-form-field.
 * @attr {string} size - 'md' (default) | 'sm'. Set automatically by nldd-form-field.
 * @attr {boolean} valid - Marks the field as valid
 * @attr {boolean} invalid - Marks the field as invalid
 * @attr {boolean} disabled - Disabled state
 * @attr {boolean} masked - Whether the password is masked (default: true)
 * @attr {string} show-button-text - Visible toggle button text when masked (default: 'Toon')
 * @attr {string} hide-button-text - Visible toggle button text when unmasked (default: 'Verberg')
 * @attr {string} show-button-accessible-label - aria-label for toggle when masked (default: 'Toon wachtwoord')
 * @attr {string} hide-button-accessible-label - aria-label for toggle when unmasked (default: 'Verberg wachtwoord')
 * @attr {boolean} readonly - Readonly state
 * @attr {boolean} required - Required state
 * @attr {string} name - Input name for form submission
 * @attr {string} autocomplete - Autocomplete hint
 * @attr {string} accessible-label - Accessible label forwarded to the inner input. Set automatically by nldd-form-field.
 * @attr {string} width - Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container.
 * @attr {string} pattern - Regular expression the value has to match, as the native `pattern`.
 * @attr {number} minlength - Fewest characters the value may have.
 * @attr {number} maxlength - Most characters the value may have.
 *
 * @fires input - When the input value changes ({ detail: { value } })
 * @fires change - When the input value is committed ({ detail: { value } })
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { passwordFieldStyles } from './password-field.styles.js';
import { passwordFieldTemplate } from './password-field.template.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';

@customElement('nldd-password-field')
export class NLDDPasswordField extends DescribedBy(FormAssociated(LitElement)) {

	static override shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	static override styles = passwordFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	/** Counts for the implicit-submission rule: a single-line field where Enter
	 *  would submit the form. See utilities/implicit-submission.ts. */
	static blocksImplicitSubmission = true;


	private _initialValue = '';

	@property({ reflect: true, converter: reflectNonDefault<'md' | 'sm'>('md') })
	size: 'md' | 'sm' = 'md';

	@property({ type: String })
	value = '';

	@property({ type: String, attribute: 'input-id' })
	inputId = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	placeholder = '';

	@property({ type: Boolean, reflect: true })
	valid = false;

	@property({ type: Boolean, reflect: true })
	invalid = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: Boolean, reflect: true })
	masked = true;

	/** Visible button label when the field is masked. Override for localisation. */
	@property({ type: String, attribute: 'show-button-text' })
	showButtonText = 'Toon';

	/** Visible button label when the field is unmasked. Override for localisation. */
	@property({ type: String, attribute: 'hide-button-text' })
	hideButtonText = 'Verberg';

	/** Accessible aria-label for the toggle button when the field is masked. Override for localisation. */
	@property({ type: String, attribute: 'show-button-accessible-label' })
	showButtonAccessibleLabel = 'Toon wachtwoord';

	/** Accessible aria-label for the toggle button when the field is unmasked. Override for localisation. */
	@property({ type: String, attribute: 'hide-button-accessible-label' })
	hideButtonAccessibleLabel = 'Verberg wachtwoord';

	@property({ type: Boolean, reflect: true })
	readonly = false;

	@property({ type: Boolean, reflect: true })
	required = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: String })
	autocomplete = '';

	/** Accessible label forwarded to the inner <input>. Set automatically by nldd-form-field. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';


	/** Optional fixed width (any CSS length). When unset, the field stretches to fill its container. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';

	@query('.password-field__input')
	private _input!: HTMLInputElement;


	/** Regular expression the value has to match, as the native `pattern`. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	pattern = '';

	/** Fewest characters the value may have, as the native `minlength`. */
	@property({ type: Number, reflect: true })
	minlength?: number;

	/** Most characters the value may have, as the native `maxlength`. */
	@property({ type: Number, reflect: true })
	maxlength?: number;

	override firstUpdated(): void {
		this._initialValue = this.value;
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('width')) {
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('width', w)) {
				this.style.setProperty('--_password-field-width', w);
			} else {
				this.style.removeProperty('--_password-field-width');
			}
		}
	}

	override formValue(): FormValue {
		return this.value;
	}

	formResetCallback(): void {
		this.value = this._initialValue;
	}


	formStateRestoreCallback(state: File | string | FormData | null): void {
		if (typeof state === 'string') this.value = state;
	}

	/** Enter submits the form this field belongs to, the way the browser would
	 *  if the input were not in a shadow root. */
	public _handleKeydown(e: KeyboardEvent): void {
		submitOnEnter(this, e);
	}

	public _handleInput(e: Event): void {
		e.stopPropagation();
		const input = e.target as HTMLInputElement;
		this.value = input.value;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	public _handleChange(e: Event): void {
		e.stopPropagation();
		const input = e.target as HTMLInputElement;
		this.value = input.value;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	public _handleToggle(): void {
		this.masked = !this.masked;
	}

	public focus(): void {
		this._input?.focus();
	}

	public blur(): void {
		this._input?.blur();
	}

	override render() {
		return passwordFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-password-field': NLDDPasswordField;
	}
}
