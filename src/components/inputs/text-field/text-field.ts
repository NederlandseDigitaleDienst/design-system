/**
 * Nederlandse Digitale Dienst Text Field Component (Lit + TypeScript)
 *
 * @element nldd-text-field
 *
 * @attr {string} value - The input value
 * @attr {string} placeholder - Placeholder text
 * @attr {string} input-id - Sets the id on the native input. Set automatically by nldd-form-field.
 * @attr {string} size - 'md' (default) | 'sm'. Set automatically by nldd-form-field.
 * @attr {boolean} invalid - Marks the field as invalid
 * @attr {boolean} valid - Marks the field as valid
 * @attr {boolean} disabled - Disabled state
 * @attr {string} type - Input type: 'text' | 'email' | 'tel' | 'url'
 * @attr {string} keyboard - Which virtual keyboard a phone or tablet raises, forwarded as `inputmode`: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'. It changes nothing about what the field accepts, and nothing at all on a desktop. Reach for it where the value is digits but not a quantity you would step (a house number, a postcode, a rack unit): 'numeric'. The keyboard for 'tel', 'email' and 'url' already follows from `type`.
 * @attr {string} enter-key - What the Enter key of the virtual keyboard says, forwarded as `enterkeyhint`: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'. It only labels the key; what Enter does is still up to the form, and on a desktop it changes nothing.
 * @attr {string} name - Input name for form submission
 * @attr {boolean} readonly - Readonly state
 * @attr {boolean} required - Required state
 * @attr {string} autocomplete - Autocomplete hint
 * @attr {string} accessible-label - Accessible label forwarded to the inner input. Set automatically by nldd-form-field.
 * @attr {boolean} no-spellcheck - Disables browser spellchecking on the inner input
 * @attr {string} width - Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container.
 * @attr {string} pattern - Regular expression the value has to match, as the native `pattern`.
 * @attr {number} minlength - Fewest characters the value may have.
 * @attr {number} maxlength - Most characters the value may have.
 *
 * @fires input - When input value changes
 * @fires change - When input value is committed
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { textFieldStyles } from './text-field.styles.js';
import { textFieldTemplate } from './text-field.template.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';

export type InputType = 'text' | 'email' | 'tel' | 'url';

/** The tokens `inputmode` and `enterkeyhint` accept. Arrays, so one list types
 *  the property and answers at runtime: a value outside it is dropped by the
 *  browser without a word, which is a typo you only find on a phone. */
export const KEYBOARDS = ['none', 'text', 'decimal', 'numeric', 'tel', 'search', 'email', 'url'] as const;
export const ENTER_KEYS = ['enter', 'done', 'go', 'next', 'previous', 'search', 'send'] as const;

export type Keyboard = (typeof KEYBOARDS)[number];

export type EnterKey = (typeof ENTER_KEYS)[number];

/** The keyboard each `type` already asks for. Setting `keyboard` to something
 *  else contradicts the type, which is worth saying out loud in dev. */
const KEYBOARD_IMPLIED_BY_TYPE: Partial<Record<InputType, Keyboard>> = {
	email: 'email',
	tel: 'tel',
	url: 'url',
};

@customElement('nldd-text-field')
export class NLDDTextField extends DescribedBy(FormAssociated(LitElement)) {

	static override shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	static override styles = textFieldStyles;

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
	invalid = false;

	@property({ type: Boolean, reflect: true })
	valid = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String })
	type: InputType = 'text';

	/** Which on-screen keyboard to raise, forwarded as `inputmode`. */
	@property({ type: String, reflect: true })
	keyboard?: Keyboard;

	/** What the Enter key says, forwarded as `enterkeyhint`. */
	@property({ type: String, reflect: true, attribute: 'enter-key' })
	enterKey?: EnterKey;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: Boolean, reflect: true })
	readonly = false;

	@property({ type: Boolean, reflect: true })
	required = false;

	@property({ type: String })
	autocomplete = '';

	/** Accessible label forwarded to the inner <input>. Set automatically by nldd-form-field. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';


	@property({ type: Boolean, reflect: true, attribute: 'no-spellcheck' })
	noSpellcheck = false;

	/** Optional fixed width (any CSS length). When unset, the field stretches to fill its container. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';


	@query('.text-field__input')
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

	private _warnedKeyboard = false;

	override updated(changed: PropertyValues): void {
		if (changed.has('keyboard') || changed.has('type')) this._warnKeyboardVsType();
		if (changed.has('keyboard')) this._warnUnknownToken('keyboard', this.keyboard, KEYBOARDS);
		if (changed.has('enterKey')) this._warnUnknownToken('enter-key', this.enterKey, ENTER_KEYS);
		if (changed.has('width')) {
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('width', w)) {
				this.style.setProperty('--_text-field-width', w);
			} else {
				this.style.removeProperty('--_text-field-width');
			}
		}
	}

	/** A token the browser does not know is dropped silently, and the field falls
	 *  back to the default keyboard. */
	private _warnUnknownToken(attribute: string, value: string | undefined, allowed: readonly string[]): void {
		if (!import.meta.env?.DEV || !value || allowed.includes(value)) return;
		console.warn(`<nldd-text-field>: ${attribute}="${value}" is not a value the browser knows. Use one of: ${allowed.join(', ')}.`);
	}

	/** A `type` other than text already asks for its own keyboard. Overriding it
	 *  with a different one gives a field that says "email" and shows digits,
	 *  which is never what was meant. */
	private _warnKeyboardVsType(): void {
		const implied = KEYBOARD_IMPLIED_BY_TYPE[this.type];
		const contradicts = !!this.keyboard && !!implied && this.keyboard !== implied;
		if (import.meta.env?.DEV && contradicts && !this._warnedKeyboard) {
			this._warnedKeyboard = true;
			console.warn(`<nldd-text-field>: keyboard="${this.keyboard}" contradicts type="${this.type}", which already raises the ${implied} keyboard. Drop one of the two.`);
		} else if (!contradicts) {
			this._warnedKeyboard = false;
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

	public blur(): void {
		this._input?.blur();
	}

	/**
	 * Delegates focus to the inner native `<input>`, so consumers can call
	 * `textFieldEl.focus()` without reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		this._input?.focus(options);
	}

	override render() {
		return textFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-text-field': NLDDTextField;
	}
}
