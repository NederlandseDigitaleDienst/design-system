/**
 * Nederlandse Digitale Dienst Multi-line Text Field Component (Lit + TypeScript)
 *
 * @element nldd-multi-line-text-field
 *
 * @attr {string} value - The textarea value
 * @attr {string} placeholder - Placeholder text
 * @attr {string} input-id - Sets the id on the native textarea. Set automatically by nldd-form-field.
 * @attr {string} size - 'md' (default) | 'sm'. Set automatically by nldd-form-field.
 * @attr {boolean} invalid - Marks the field as invalid
 * @attr {boolean} valid - Marks the field as valid
 * @attr {boolean} disabled - Disabled state
 * @attr {string} name - Textarea name for form submission
 * @attr {boolean} readonly - Readonly state
 * @attr {boolean} required - Required state
 * @attr {string} autocomplete - Autocomplete hint
 * @attr {string} keyboard - Which virtual keyboard a phone or tablet raises, forwarded as `inputmode`: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'. It changes nothing about what the field accepts, and nothing at all on a desktop.
 * @attr {string} enter-key - What the Enter key of the virtual keyboard says, forwarded as `enterkeyhint`: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'. In a field where Enter starts a new line, leave it alone.
 * @attr {number} rows - Initial visible rows (minimum height). Default: 3.
 * @attr {string} resize - 'none' | 'vertical' | 'auto' (default). 'auto' grows with content (native field-sizing), no manual handle.
 * @attr {string} accessible-label - Accessible label forwarded to the inner textarea. Set automatically by nldd-form-field.
 * @attr {boolean} no-spellcheck - Disables browser spellchecking on the inner textarea
 * @attr {string} width - Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container.
 * @attr {number} minlength - Fewest characters the value may have.
 * @attr {number} maxlength - Most characters the value may have.
 *
 * @fires input - When value changes
 * @fires change - When value is committed (blur)
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { multiLineTextFieldStyles } from './multi-line-text-field.styles.js';
import { multiLineTextFieldTemplate } from './multi-line-text-field.template.js';
import type { Keyboard, EnterKey } from '../text-field/text-field.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';

export type ResizeMode = 'none' | 'vertical' | 'auto';

export type { Keyboard, EnterKey } from '../text-field/text-field.js';

@customElement('nldd-multi-line-text-field')
export class NLDDMultiLineTextField extends DescribedBy(FormAssociated(LitElement)) {

	static override shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	static override styles = multiLineTextFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;


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

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: Boolean, reflect: true })
	readonly = false;

	@property({ type: Boolean, reflect: true })
	required = false;

	@property({ type: String })
	autocomplete = '';

	/** Which on-screen keyboard to raise, forwarded as `inputmode`. */
	@property({ type: String, reflect: true })
	keyboard?: Keyboard;

	/** What the Enter key says, forwarded as `enterkeyhint`. */
	@property({ type: String, reflect: true, attribute: 'enter-key' })
	enterKey?: EnterKey;

	@property({ type: Number })
	rows = 3;

	@property({ reflect: true, converter: reflectNonDefault<ResizeMode>('auto') })
	resize: ResizeMode = 'auto';

	/** Accessible label forwarded to the inner <textarea>. Set automatically by nldd-form-field. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';


	@property({ type: Boolean, reflect: true, attribute: 'no-spellcheck' })
	noSpellcheck = false;

	/** Optional fixed width (any CSS length). When unset, the field stretches to fill its container. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';


	@query('.multi-line-text-field__input')
	private _textarea!: HTMLTextAreaElement;


	/** Fewest characters the value may have, as the native `minlength`. */
	@property({ type: Number, reflect: true })
	minlength?: number;

	/** Most characters the value may have, as the native `maxlength`. */
	@property({ type: Number, reflect: true })
	maxlength?: number;

	override firstUpdated(): void {
		this._initialValue = this.value;
		if (import.meta.env?.DEV && !this.accessibleLabel && !this.inputId) {
			console.warn('<nldd-multi-line-text-field>: No accessible-label or input-id provided. Use nldd-form-field for labeled usage, or set accessible-label for screen reader accessibility.');
		}
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('width')) {
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('width', w)) {
				this.style.setProperty('--_multi-line-text-field-width', w);
			} else {
				this.style.removeProperty('--_multi-line-text-field-width');
			}
		}
		if (changed.has('rows')) {
			// Expose rows to CSS so the resize="auto" min-height can floor the field
			// at the configured number of lines (field-sizing: content otherwise
			// ignores the rows attribute and lets it shrink to one line).
			this.style.setProperty('--_multi-line-text-field-rows', String(this.rows));
		}
		if (changed.has('resize') && this.resize === 'auto' && this._textarea) {
			// Manual resize sets inline width/height on the textarea, which would
			// override field-sizing: content. Clear them when switching to auto.
			this._textarea.style.width = '';
			this._textarea.style.height = '';
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

	public _handleInput(e: Event): void {
		e.stopPropagation();
		const textarea = e.target as HTMLTextAreaElement;
		this.value = textarea.value;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	public _handleChange(e: Event): void {
		e.stopPropagation();
		const textarea = e.target as HTMLTextAreaElement;
		this.value = textarea.value;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	override render() {
		return multiLineTextFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-multi-line-text-field': NLDDMultiLineTextField;
	}
}
