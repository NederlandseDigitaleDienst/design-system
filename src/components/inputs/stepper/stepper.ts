/**
 * Nederlandse Digitale Dienst Stepper Component (Lit + TypeScript)
 *
 * A numeric control with increment and decrement buttons.
 *
 * @element nldd-stepper
 * @related nldd-number-field
 * @attr {'xs'|'sm'|'md'} size - Size: 'xs' | 'sm' | 'md' (default: 'md')
 * @attr {string} accessible-label - Accessible name for the spinbutton; falls back to a generic label
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 * @attr {string} name - Name for form submission; the value is submitted under this name
 * @attr {number} value - Current value
 * @attr {number} min - Minimum value (default: 0)
 * @attr {number} max - Maximum value (default: Infinity)
 * @attr {number} step - Step size (default: 1)
 * @attr {boolean} disabled - Disabled state
 * @attr {object} translations - Translations; unspecified keys fall back to Dutch
 *
 * @fires change - When the value changes; detail: { value: number }
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { stepperStyles } from './stepper.styles.js';
import { stepperTemplate } from './stepper.template.js';
import { nlddStepperTranslations } from './stepper.i18n.js';
import './../../actions/icon-button/icon-button.js';
import './../../content/icon/icon.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { deferFocus } from '../../../utilities/defer-focus.js';

export type StepperSize = 'xs' | 'sm' | 'md';

@customElement('nldd-stepper')
export class NLDDStepper extends DescribedBy(FormAssociated(withTranslations(LitElement, nlddStepperTranslations))) {

	static override styles = stepperStyles;

	static formProperties = ['value'];

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;



	@property({ reflect: true, converter: reflectNonDefault<StepperSize>('md') })
	size: StepperSize = 'md';

	/**
	 * Accessible name for the spinbutton. Without one it falls back to a generic
	 * "adjust the value", which says what the control does but not which value,
	 * so give it the name of the field whenever there is one.
	 */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

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

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: Number })
	value = 0;

	@property({ type: Number })
	min = 0;

	@property({ type: Number })
	max = Infinity;

	@property({ type: Number })
	step = 1;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	override formValue(): FormValue {
		return String(this.value);
	}

	override formStateRestoreCallback(state: File | string | FormData | null): void {
		if (typeof state !== 'string') return;
		const parsed = parseFloat(state);
		if (!isNaN(parsed)) this.value = Math.max(this.min, Math.min(this.max, parsed));
	}


	// — Actions ——————————————————————————————————————————————————————————————

	public _decrement(): void {
		if (this.disabled) return;
		const newValue = Math.max(this.min, this.value - this.step);
		if (newValue !== this.value) {
			this.value = newValue;
			this._dispatchChange();
		}
	}

	public _increment(): void {
		if (this.disabled) return;
		const newValue = Math.min(this.max, this.value + this.step);
		if (newValue !== this.value) {
			this.value = newValue;
			this._dispatchChange();
		}
	}

	public _handleKeydown(e: KeyboardEvent): void {
		switch (e.key) {
			case 'ArrowUp':
			case 'ArrowRight':
				e.preventDefault();
				this._increment();
				break;
			case 'ArrowDown':
			case 'ArrowLeft':
				e.preventDefault();
				this._decrement();
				break;
			case 'Home':
				e.preventDefault();
				if (isFinite(this.min)) {
					this.value = this.min;
					this._dispatchChange();
				}
				break;
			case 'End':
				e.preventDefault();
				if (isFinite(this.max)) {
					this.value = this.max;
					this._dispatchChange();
				}
				break;
		}
	}

	private _dispatchChange(): void {
		this.emitFormEvent('change', { value: this.value });
	}

	/**
	 * Delegates focus to the spinbutton, the element that carries the tabindex
	 * and the keyboard handling. The two icon buttons are `tabindex="-1"` on
	 * purpose, so the stepper is one stop rather than three. Does nothing while
	 * disabled, because the spinbutton drops its tabindex then.
	 */
	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
		this.shadowRoot?.querySelector<HTMLElement>('.stepper')?.focus(options);
	}

	/** The spinbutton is the control; the buttons beside it are shortcuts to it. */
	override describedTarget(): Element | null {
		return this.shadowRoot?.querySelector('[role="spinbutton"]') ?? null;
	}

	override render() {
		return stepperTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-stepper': NLDDStepper;
	}
}
