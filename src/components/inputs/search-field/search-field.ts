/**
 * Nederlandse Digitale Dienst Search Field Component (Lit + TypeScript)
 *
 * A search input with a leading search icon, an optional dismiss button,
 * and an optional search button.
 *
 * @element nldd-search-field
 * @attr {string} size - Field size: 'sm' | 'md' (default: 'md')
 * @attr {string} width - Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container.
 * @attr {string} placeholder - Placeholder text for the input
 * @attr {string} accessible-label - Accessible name (aria-label) of the native input. Falls back to `placeholder`, and keeps it when a value is typed. That works while the placeholder names the field ('Zoek een gebruiker'); set this when the placeholder is an example instead ('bijv. Jansen').
 * @attr {boolean} show-search-button - When set, shows a search button on the right
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 * @attr {boolean} disabled - Disabled state
 * @attr {string} name - Input name for form submission
 * @attr {string} value - The search value
 * @attr {boolean} required - Required state
 * @attr {number} minlength - Fewest characters the value may have.
 * @attr {number} maxlength - Most characters the value may have.
 * @attr {string} pattern - Regular expression the value has to match, as the native `pattern`.
 * @attr {boolean} no-spellcheck - Disables browser spellchecking on the inner input
 *
 * @fires input - When the input value changes; detail: { value: string }
 * @fires change - When the input value is committed; detail: { value: string }
 * @fires search - When search is submitted via Enter or the search button; detail: { value: string }
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { searchFieldStyles } from './search-field.styles.js';
import { searchFieldTemplate } from './search-field.template.js';
import { nlddSearchFieldTranslations } from './search-field.i18n.js';
import type { NLDDSearchFieldTranslations } from './search-field.i18n.js';
import './../../actions/icon-button/icon-button.js';
import './../../actions/button/button.js';
import './../../content/icon/icon.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';

export type SearchFieldSize = 'sm' | 'md';

@customElement('nldd-search-field')
export class NLDDSearchField extends DescribedBy(FormAssociated(LitElement)) {

	static override styles = searchFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	/** Counts for the implicit-submission rule: a single-line field where Enter
	 *  would submit the form. See utilities/implicit-submission.ts. */
	static blocksImplicitSubmission = true;


	private _initialValue = '';

	@property({ reflect: true, converter: reflectNonDefault<SearchFieldSize>('md') })
	size: SearchFieldSize = 'md';

	/** Optional fixed width (any CSS length). When unset, the field stretches to fill its container. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';

	@query('.search-field__input')
	_input!: HTMLInputElement;

	@property({ type: String })
	placeholder = 'Zoeken';

	/** Accessible label forwarded as aria-label to the native input.
	 *  Use to describe what is being searched, e.g. "Zoek een document".
	 *  When not set, the placeholder value is used as aria-label automatically.
	 *  Set an explicit accessible-label when a value is already present and the
	 *  placeholder is no longer visible, to ensure screen readers still have context. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Boolean, reflect: true, attribute: 'show-search-button' })
	showSearchButton = false;

	/** Override one or more translation keys. Unset keys fall back to Dutch. */
	@property({ type: Object })
	translations: Partial<NLDDSearchFieldTranslations> = {};


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

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: String })
	value = '';


	@property({ type: Boolean, reflect: true })
	required = false;

	/** Fewest characters the value may have, as the native `minlength`. */
	@property({ type: Number, reflect: true })
	minlength?: number;

	/** Most characters the value may have, as the native `maxlength`. */
	@property({ type: Number, reflect: true })
	maxlength?: number;

	/** Regular expression the value has to match, as the native `pattern`. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	pattern = '';

	@property({ type: Boolean, reflect: true, attribute: 'no-spellcheck' })
	noSpellcheck = false;

	override firstUpdated(): void {
		this._initialValue = this.value;
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('width')) {
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('width', w)) {
				this.style.setProperty('--_width', w);
			} else {
				this.style.removeProperty('--_width');
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

	// — i18n ——————————————————————————————————————————————————————————————————

	public _t(key: keyof NLDDSearchFieldTranslations): string {
		return this.translations[key] ?? nlddSearchFieldTranslations[key];
	}

	// — Handlers ————————————————————————————————————————————————————————————

	// The native input/change events are composed, so without stopPropagation
	// they escape the shadow root and a consumer listening for `input` on the
	// host gets two events per keystroke: ours, carrying detail.value, and the
	// native one right behind it, where `detail` is the UIEvent number 0. A
	// handler that reads `e.detail?.value` then ends on undefined and, if it
	// writes that back to `value`, wipes the field as you type. Same guard as
	// text-field and password-field.
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

	public _handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Enter') {
			this._dispatchSearch();
		}
	}

	public _handleClear(): void {
		this.value = '';
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value: '' },
			bubbles: true,
			composed: true,
		}));
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: '' },
			bubbles: true,
			composed: true,
		}));
		this._input?.focus();
	}

	public _handleSearch(): void {
		this._dispatchSearch();
	}

	private _dispatchSearch(): void {
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('search', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	/**
	 * Delegates focus to the inner native `<input>`, so consumers can call
	 * `searchFieldEl.focus()` without reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		this._input?.focus(options);
	}

	override render() {
		return searchFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-search-field': NLDDSearchField;
	}
}
