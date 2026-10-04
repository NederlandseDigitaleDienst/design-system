/**
 * Nederlandse Digitale Dienst Number Field Component (Lit + TypeScript)
 *
 * A numeric input field with decrement and increment buttons.
 *
 * @element nldd-number-field
 * @attr {number} value - Current value
 * @attr {number} min - Minimum value (default: -Infinity)
 * @attr {number} max - Maximum value (default: Infinity)
 * @attr {number} step - Step size (default: 1)
 * @attr {string} size - Size: 'sm' | 'md' (default: 'md')
 * @attr {boolean} disabled - Disabled state
 * @attr {string} name - Name for form submission
 * @attr {object} translations - Translations; unspecified keys fall back to Dutch
 * @attr {string} width - Width mode: 'full' (stretches to container) or any CSS length (e.g. '240px')
 * @attr {boolean} hide-spin-buttons - When set, hides the decrement and increment buttons
 * @attr {string} accessible-label - Accessible label (aria-label) forwarded to the native input
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @fires input - When the value changes (typing, +/- button, or on-commit correction); detail: { value: number }
 * @fires change - When the value is committed (blur/Enter or +/- button), clamped to [min, max]; empty input falls back to the last valid value. When the committed value differs from the typed value, a matching input event is fired immediately before this one. detail: { value: number }
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
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


	private _initialValue = 0;

	@property({ type: Number })
	value = 0;

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

	/** Last value inside [min, max]; used as fallback when the input is cleared.
	 *  Initialized to the clamped `value` in firstUpdated — the 0 default is only
	 *  relevant before the first render, which no user-facing handler can reach. */
	private _lastValidValue = 0;


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
		if (import.meta.env?.DEV && !this.accessibleLabel) {
			console.warn('<nldd-number-field>: No accessible-label provided. Add an accessible-label attribute so screen readers can announce the input\'s purpose.');
		}
		this._lastValidValue = this._clamp(this.value);
		this._initialValue = this._lastValidValue;
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('width')) {
			const w = this.width;
			// Keyword 'full' handled via CSS attribute selectors; a valid CSS
			// length is forwarded to --_width. Invalid values are dropped.
			if (w && w !== 'full' && CSS.supports('width', w)) {
				this.style.setProperty('--_width', w);
			} else {
				this.style.removeProperty('--_width');
			}
		}
		if (changedProperties.has('value')) {
			this.commitFormValue();
		}
	}

	override formValue(): FormValue {
		return String(this.value);
	}

	formResetCallback(): void {
		this.value = this._initialValue;
	}


	formStateRestoreCallback(state: File | string | FormData | null): void {
		if (typeof state !== 'string') return;
		const parsed = parseFloat(state);
		if (!isNaN(parsed)) this.value = this._clamp(parsed);
	}

	// — i18n —————————————————————————————————————————————————————————————————

	public _t(key: keyof NLDDNumberFieldTranslations): string {
		return translate(this.translations, nlddNumberFieldTranslations, key);
	}

	// — Actions ——————————————————————————————————————————————————————————————

	public _handleDecrease(): void {
		if (this.disabled) return;
		this._commitValue(this.value - this.step);
	}

	public _handleIncrease(): void {
		if (this.disabled) return;
		this._commitValue(this.value + this.step);
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
		const parsed = parseFloat(input.value);
		if (isNaN(parsed)) return;
		this.value = parsed;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	/** Fires on blur or Enter. Clamps the value and falls back to the last valid value when empty. */
	public _handleChange(e: Event): void {
		if (this.disabled) return;
		const input = e.target as HTMLInputElement;
		const parsed = parseFloat(input.value);
		const finalValue = isNaN(parsed) ? this._lastValidValue : this._clamp(parsed);
		this._commitValue(finalValue, input);
	}

	private _commitValue(newValue: number, input?: HTMLInputElement): void {
		const clampedValue = this._clamp(newValue);
		const changed = clampedValue !== this.value;
		this.value = clampedValue;
		this._lastValidValue = clampedValue;
		// Force the input DOM to match the committed value — Lit's property binding
		// may not re-sync when the user typed an out-of-range value that parses to
		// the same number after clamping (e.g. empty → fallback).
		if (input) input.value = String(clampedValue);
		if (!changed) return;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
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
		this.shadowRoot?.querySelector<HTMLInputElement>('.number-field__input')?.focus(options);
	}

	override render() {
		return numberFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-number-field': NLDDNumberField;
	}
}
