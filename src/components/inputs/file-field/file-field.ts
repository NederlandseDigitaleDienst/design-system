/**
 * Nederlandse Digitale Dienst File Field Component (Lit + TypeScript)
 *
 * A file picker that reads as one control: an nldd-button flush in the corner of
 * a tinted surface, the chosen file next to it, and a dismiss button to clear it
 * again. It wraps a hidden native `<input type="file">`, which is what makes the
 * picker open at all — a file dialog only opens from a user gesture on a real
 * input.
 *
 * The surface deliberately does not look like an input field. A border with
 * field semantics promises you can type into it; here you can only press a
 * button, so it uses button and surface colors instead of
 * `--semantics-input-fields-*`. The button keeps its own tinted background and
 * therefore sits a shade darker in the surface, which is what marks it as the
 * thing to press.
 *
 * Several files are summarized, not listed: "3 bestanden" with a single cross
 * that clears all of them. Every pick replaces the whole FileList, and rebuilding
 * it to add or drop one file means going through DataTransfer, which does not
 * deduplicate (even the same File object twice yields two entries) — and a File
 * has no id, so deduplicating would come down to guessing from name, size and
 * last-modified. A list with a cross per file would promise an edit the platform
 * does not support. A page that does want to show the files renders its own list
 * from the `File[]` in the change event.
 *
 * @element nldd-file-field
 * @attr {string} size - Field size: 'md' (default) | 'sm'. Set automatically by nldd-form-field.
 * @attr {string} accept - Comma-separated list of accepted file types, forwarded to the input (e.g. ".pdf,image/*")
 * @attr {boolean} multiple - Allows choosing more than one file
 * @attr {string} accessible-label - Accessible label forwarded to the inner input. Set automatically by nldd-form-field.
 * @attr {string} input-id - Sets the id on the native input. Set automatically by nldd-form-field.
 * @attr {boolean} valid - Marks the field as valid; shows a check icon on the right, like nldd-dropdown
 * @attr {boolean} invalid - Marks the field as invalid; shows an alert icon on the right, like nldd-dropdown
 * @attr {boolean} disabled - Disabled state
 * @attr {string} name - Name for form submission
 * @attr {boolean} required - Marks the field required (invalid while no file is chosen)
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @prop {File[]} files - The chosen files. Read-only: browsers forbid setting a file input's value, so there is no `value` attribute and no way to preselect a file.
 *
 * @fires change - When the chosen files change, including a clear; detail: { files: File[] }
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { fileFieldStyles } from './file-field.styles.js';
import { fileFieldTemplate } from './file-field.template.js';
import { nlddFileFieldTranslations, type NLDDFileFieldTranslations } from './file-field.i18n.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { translate } from '../../../utilities/translations.js';

@customElement('nldd-file-field')
export class NLDDFileField extends DescribedBy(FormAssociated(LitElement)) {

	static override styles = fileFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	// Property order matches the story controls.
	@property({ reflect: true, converter: reflectNonDefault<'md' | 'sm'>('md') })
	size: 'md' | 'sm' = 'md';

	@property({ type: String, reflect: true })
	accept = '';

	@property({ type: Boolean, reflect: true })
	multiple = false;

	/** Accessible label forwarded to the inner <input>. Set automatically by nldd-form-field. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: String, attribute: 'input-id' })
	inputId = '';


	@property({ type: Boolean, reflect: true })
	valid = false;

	@property({ type: Boolean, reflect: true })
	invalid = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: Boolean, reflect: true })
	required = false;

	@property({ type: Object })
	translations: Partial<NLDDFileFieldTranslations> = {};

	/** The chosen files. Mirrors the input's FileList; there is no setter, because
	 *  browsers refuse a programmatic file selection. */
	@state()
	private _files: File[] = [];

	get files(): File[] {
		return this._files;
	}

	@query('.file-field__input')
	private _input!: HTMLInputElement;

	/** @internal */
	public _t(key: keyof NLDDFileFieldTranslations, vars?: Record<string, string | number>): string {
		return translate(this.translations, nlddFileFieldTranslations, key, vars);
	}

	/** @internal */
	public _chooseLabel(): string {
		return this.multiple
			? this._t('components.file-field.to-choose-files-action')
			: this._t('components.file-field.to-choose-file-action');
	}

	/**
	 * The native input carries the field's label but is hidden, so it is not in
	 * the accessibility tree. The button is what you tab to, and on its own it
	 * only says "choose a file" — for which field is the part that matters.
	 *
	 * @internal
	 */
	public _chooseAccessibleLabel(): string {
		if (!this.accessibleLabel) return '';
		return `${this._chooseLabel()}, ${this.accessibleLabel}`;
	}

	/** @internal */
	public _valueLabel(): string {
		if (this._files.length === 0) return this._t('components.file-field.no-file-chosen-text');
		if (this._files.length === 1) return this._files[0].name;
		return this._t('components.file-field.file-count-text', { count: this._files.length });
	}

	override willUpdate(changed: PropertyValues): void {
		if (changed.has('required')) this._updateValidity();
		if (changed.has('accessibleLabel')) this.internals.ariaLabel = this.accessibleLabel || null;
	}

	/** @internal */
	public _handleChoose(): void {
		this._input?.click();
	}

	/** @internal */
	public _handleInputChange(e: Event): void {
		e.stopPropagation();
		const input = e.target as HTMLInputElement;
		this._files = input.files ? Array.from(input.files) : [];
		this._commit();
	}

	/** @internal */
	public _handleClear(): void {
		// Clearing the input as well as the array: the element keeps the previous
		// FileList otherwise, so choosing the same file again would fire no change.
		if (this._input) this._input.value = '';
		this._files = [];
		this._commit();
		// Focus would land on the body when the cross unmounts with the last file.
		void this.updateComplete.then(() => this.focus());
	}

	private _commit(): void {
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { files: this._files },
			bubbles: true,
			composed: true,
		}));
	}


	// — Form participation ————————————————————————————————————————————————————

	/** Submit one entry per file under `name`, the way a native multiple file
	 *  input does. A single file is submitted as itself, so a form with one file
	 *  reads back as a File rather than as FormData wrapping one. */
	override formValue(): FormValue {
		if (!this.name || this._files.length === 0) return null;
		if (this._files.length === 1) return this._files[0];
		const data = new FormData();
		for (const file of this._files) data.append(this.name, file);
		return data;
	}

	override commitFormValue(): void {
		super.commitFormValue();
		this._updateValidity();
	}

	/** A required field without a file is invalid (valueMissing). */
	private _updateValidity(): void {
		if (this.required && this._files.length === 0) {
			this.internals.setValidity(
				{ valueMissing: true },
				this._t('components.file-field.required-error-text'),
				this._input ?? this,
			);
		} else {
			this.internals.setValidity({});
		}
	}

	formResetCallback(): void {
		if (this._input) this._input.value = '';
		this._files = [];
		this.commitFormValue();
	}

	/**
	 * Delegates focus to the choose button rather than the hidden input: an input
	 * that is `display: none` cannot take focus, and the button is what a user
	 * sees as the control.
	 */
	override focus(options?: FocusOptions): void {
		const button = this.shadowRoot?.querySelector('nldd-button') as HTMLElement | null;
		button?.focus(options);
	}

	/** The file input is display:none and therefore not in the accessibility tree.
	 *  What a screen reader meets is the button, so the description goes there. */
	override describedTarget(): Element | null {
		return this.shadowRoot?.querySelector('nldd-button') ?? null;
	}

	override render() {
		return fileFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-file-field': NLDDFileField;
	}
}
