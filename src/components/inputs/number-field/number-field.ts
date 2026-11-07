/**
 * Nederlandse Digitale Dienst Number Field Component (Lit + TypeScript)
 *
 * A numeric input field with decrement and increment buttons.
 *
 * @element nldd-number-field
 * @attr {number} value - Current value. Leave it out for an empty field, which submits an empty string and takes `min` and `max` as no reason to be invalid: only `required` asks for a value, as with a native number input. As a property, `null` is empty.
 * @attr {number} min - Minimum value (default: -Infinity)
 * @attr {number} max - Maximum value (default: Infinity)
 * @attr {number} step - Step size (default: 1)
 * @attr {string} size - Size: 'sm' | 'md' (default: 'md')
 * @attr {boolean} disabled - Disabled state
 * @attr {boolean} required - A value has to be filled in. An empty field is then invalid.
 * @attr {string} name - Name for form submission
 * @attr {object} translations - Translations; unspecified keys fall back to Dutch
 * @attr {string} width - Width mode: 'full' (stretches to container) or any CSS length (e.g. '240px')
 * @attr {boolean} hide-spin-buttons - When set, hides the decrement and increment buttons
 * @attr {string} accessible-label - Accessible label (aria-label) forwarded to the native input
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @fires input - When the value changes (typing, +/- button, or on-commit correction); detail: { value: number | null }, null when the field is empty
 * @fires change - When the value is committed (blur/Enter or +/- button), clamped to [min, max]; an emptied field stays empty and commits null. From empty, + and - start at `min`, or at 0 when that lies within the range. When the committed value differs from the typed value, a matching input event is fired immediately before this one. detail: { value: number | null }
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { numberFieldStyles } from './number-field.styles.js';
import { numberFieldTemplate } from './number-field.template.js';
import { nlddNumberFieldTranslations } from './number-field.i18n.js';
import type { NLDDNumberFieldTranslations } from './number-field.i18n.js';
import './../../actions/icon-button/icon-button.js';
import './../../content/icon/icon.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { translate } from '../../../utilities/translations.js';
import { deferFocus } from '../../../utilities/defer-focus.js';

export type NumberFieldSize = 'sm' | 'md';

@customElement('nldd-number-field')
export class NLDDNumberField extends DescribedBy(FormAssociated(LitElement)) {

	static override styles = numberFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	/** Counts for the implicit-submission rule: a single-line field where Enter
	 *  would submit the form. See utilities/implicit-submission.ts. */
	static blocksImplicitSubmission = true;


	private _initialValue: number | null = null;

	/** The value, or null for an empty field. An empty or unreadable attribute is empty too. */
	@property({ converter: { fromAttribute: emptyOrNumber, toAttribute: (value: number | null) => value } })
	value: number | null = null;

	@property({ type: Number })
	min = -Infinity;

	@property({ type: Number })
	max = Infinity;

	@property({ type: Number })
	step = 1;

	@property({ reflect: true, converter: reflectNonDefault<NumberFieldSize>('md') })
	size: NumberFieldSize = 'md';

	@property({ type: Boolean, reflect: true })
	disabled = false;

	/** A value has to be filled in. An empty field is then invalid. */
	@property({ type: Boolean, reflect: true })
	required = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	/** Width mode: 'full' (stretch to container) or any CSS length. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';

	@property({ type: Boolean, reflect: true, attribute: 'hide-spin-buttons' })
	hideSpinButtons = false;

	/** Accessible label forwarded as aria-label to the native input. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** Override one or more translation keys. Unspecified keys fall back to Dutch. */
	@property({ type: Object })
	translations: Partial<NLDDNumberFieldTranslations> = {};


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

	/** The value last committed or set from outside: what `change` compares with.
	 *  Typing already moves `value`, so comparing with that would leave a typed
	 *  number without its `change`. */
	private _committed: number | null = null;
	private _typing = false;

	override firstUpdated(): void {
		this._initialValue = this.value === null ? null : this._clamp(this.value);
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('width')) {
			const w = this.width;
			// Keyword 'full' handled via CSS attribute selectors; a valid CSS
			// length is forwarded to --_number-field-width. Invalid values are dropped.
			if (w && w !== 'full' && CSS.supports('width', w)) {
				this.style.setProperty('--_number-field-width', w);
			} else {
				this.style.removeProperty('--_number-field-width');
			}
		}
		if (changedProperties.has('value')) {
			if (!this._typing) this._committed = this.value;
			this.commitFormValue();
		}
	}

	override formValue(): FormValue {
		return this.value === null ? '' : String(this.value);
	}

	formResetCallback(): void {
		this.value = this._initialValue;
	}


	formStateRestoreCallback(state: File | string | FormData | null): void {
		if (typeof state !== 'string') return;
		const parsed = emptyOrNumber(state);
		this.value = parsed === null ? null : this._clamp(parsed);
	}

	// — i18n —————————————————————————————————————————————————————————————————

	public _t(key: keyof NLDDNumberFieldTranslations): string {
		return translate(this.translations, nlddNumberFieldTranslations, key);
	}

	// — Actions ——————————————————————————————————————————————————————————————

	public _handleDecrease(): void {
		if (this.disabled) return;
		this._commitValue(this.value === null ? this._startValue() : this.value - this.step);
	}

	public _handleIncrease(): void {
		if (this.disabled) return;
		this._commitValue(this.value === null ? this._startValue() : this.value + this.step);
	}

	/** Where + and - begin in an empty field: `min`, or 0 when that lies within the range. */
	private _startValue(): number {
		return Number.isFinite(this.min) ? this.min : this._clamp(0);
	}

	/** Fires while the user types. The value may be outside [min, max]; clamping happens on change. */
	/** Enter submits the form this field belongs to, the way the browser would
	 *  if the input were not in a shadow root. */
	public _handleKeydown(e: KeyboardEvent): void {
		submitOnEnter(this, e);
	}

	public _handleInput(e: Event): void {
		if (this.disabled) return;
		const input = e.target as HTMLInputElement;
		// A number input reads as empty while it holds no number yet ("-", "1e"),
		// so only a field that really is empty clears the value.
		const parsed = input.value === '' && !input.validity.badInput ? null : parseFloat(input.value);
		if (parsed !== null && isNaN(parsed)) return;
		if (parsed === this.value) return;
		this._typing = true;
		this.value = parsed;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	/** Fires on blur or Enter. Clamps the value; an emptied field stays empty. */
	public _handleChange(e: Event): void {
		if (this.disabled) return;
		const input = e.target as HTMLInputElement;
		const parsed = parseFloat(input.value);
		this._commitValue(isNaN(parsed) ? null : parsed, input);
	}

	private _commitValue(newValue: number | null, input?: HTMLInputElement): void {
		const clampedValue = newValue === null ? null : this._clamp(newValue);
		const corrected = clampedValue !== this.value;
		const changed = clampedValue !== this._committed;
		this.value = clampedValue;
		this._committed = clampedValue;
		this._typing = false;
		// Force the input DOM to match the committed value — Lit's property binding
		// may not re-sync when the user typed an out-of-range value that parses to
		// the same number after clamping, or text that is no number.
		if (input) input.value = clampedValue === null ? '' : String(clampedValue);
		if (!changed && !corrected) return;
		this.commitFormValue();
		if (corrected) {
			this.dispatchEvent(new CustomEvent('input', {
				detail: { value: this.value },
				bubbles: true,
				composed: true,
			}));
		}
		if (!changed) return;
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	private _clamp(value: number): number {
		return Math.max(this.min, Math.min(this.max, value));
	}

	/**
	 * Delegates focus to the inner native `<input>`, so consumers can call
	 * `numberFieldEl.focus()` without reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
		this.shadowRoot?.querySelector<HTMLInputElement>('.number-field__input')?.focus(options);
	}

	override render() {
		return numberFieldTemplate(this);
	}
}

/** An attribute or restored state as a number, or null when it is empty or no number. */
function emptyOrNumber(value: string | null): number | null {
	if (value === null || value.trim() === '') return null;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? null : parsed;
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-number-field': NLDDNumberField;
	}
}
