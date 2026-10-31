import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { EditorView, placeholder as cmPlaceholder } from '@codemirror/view';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { FormAssociated, type FormValue } from '../form-associated-mixin.js';
import { reflectNonDefault } from '../reflect-non-default.js';
import { DescribedBy } from '../described-by-mixin.js';
import { NLDDCodeMirrorElement } from './codemirror-element.js';
import { reflectWhenSet } from '../reflect-when-set.js';

/**
 * Shared base for the CodeMirror editors that are form controls
 * (nldd-code-editor, nldd-text-editor). nldd-code-viewer is not one, so this
 * sits between NLDDCodeMirrorElement and the two editors.
 *
 * It owns what a form control needs and both editors did the same way: the
 * value and its `input`/`change` events, editable and read-only, the
 * placeholder, the textbox attributes (label, id, aria-readonly,
 * aria-required), form association and reset, a press on the padding that
 * starts editing, and the warning for a missing label. A subclass adds its own
 * extensions after `inputExtensions()` and can shape three things:
 * `docToValue()`, `contentAttributes()` and `beforeChangeCheck()`.
 */
export abstract class NLDDCodeMirrorInput extends DescribedBy(FormAssociated(NLDDCodeMirrorElement)) {
	static override shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	@property({ type: String })
	value = '';

	@property({ type: String, attribute: 'input-id', reflect: true, converter: reflectWhenSet })
	inputId = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	placeholder = '';

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: Boolean, reflect: true })
	readonly = false;

	@property({ type: Boolean, reflect: true })
	required = false;

	@property({ type: Number })
	rows = 6;

	@property({ type: String, attribute: 'accessible-label', reflect: true, converter: reflectWhenSet })
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

	private _initialValue = '';
	private _valueAtFocus = '';

	private _editableCompartment = new Compartment();
	private _placeholderCompartment = new Compartment();
	private _attrsCompartment = new Compartment();

	/** The custom property the visible row count goes into, named after the tag. */
	protected abstract readonly rowsProperty: string;

	/** The value for a document. Default: the document itself. */
	protected docToValue(doc: string): string {
		return doc;
	}

	/** Attributes of the content element beyond label, id, aria-readonly and
	 *  aria-required. Default: none. */
	protected contentAttributes(): Record<string, string> {
		return {};
	}

	/** Runs on blur, before the value is compared with the one at focus, so a
	 *  subclass can settle the document first. Default: nothing. */
	protected beforeChangeCheck(_view: EditorView): void {}

	/** The extensions every input needs. A subclass puts these in its own
	 *  `buildExtensions()`, next to what is its own. */
	protected inputExtensions(): Extension[] {
		return [
			this._placeholderCompartment.of(this._placeholderExtension()),
			this._editableCompartment.of(this._editableExtension()),
			this._attrsCompartment.of(this._attrsExtension()),
			EditorView.updateListener.of((u) => {
				if (u.docChanged) this._onDocChanged();
			}),
			EditorView.domEventHandlers({
				focus: () => {
					this._valueAtFocus = this.value;
				},
				blur: (_event, view) => {
					this.beforeChangeCheck(view);
					if (this.value !== this._valueAtFocus) this._emitChange();
				},
			}),
		];
	}

	private _editableExtension(): Extension {
		// Readonly stays focusable and selectable (read and copy); disabled is inert.
		return [EditorView.editable.of(!this.disabled), EditorState.readOnly.of(this.disabled || this.readonly)];
	}

	private _placeholderExtension(): Extension {
		return this.placeholder ? cmPlaceholder(this.placeholder) : [];
	}

	private _attrsExtension(): Extension {
		const attrs: Record<string, string> = { ...this.contentAttributes() };
		if (this.accessibleLabel) attrs['aria-label'] = this.accessibleLabel;
		if (this.inputId) attrs['id'] = this.inputId;
		// Not editable either way, so it is read-only to assistive tech (WCAG 4.1.2).
		if (this.readonly || this.disabled) attrs['aria-readonly'] = 'true';
		if (this.required) attrs['aria-required'] = 'true';
		return EditorView.contentAttributes.of(attrs);
	}

	/** Build the textbox attributes again, after something `contentAttributes()`
	 *  reads has changed. */
	protected refreshContentAttributes(): void {
		this.reconfigure(this._attrsCompartment, this._attrsExtension());
	}

	override firstUpdated(): void {
		this._initialValue = this.value;
		this.style.setProperty(this.rowsProperty, String(this.rows));
		this.mountEditor(this.docToValue(this.value));
		this.onEditorMounted();
	}

	/* Runs on the initial mount and on every re-mount after a detach/reattach
	 * (e.g. Vue <KeepAlive>): the view and its scroller are rebuilt, so the
	 * padding forwarder goes on again. A subclass calls super first. */
	protected override onEditorMounted(): void {
		// A press on the scroller's own padding (outside .cm-content) doesn't place
		// a caret; forward it to the nearest line so the padding is clickable too.
		this.view?.scrollDOM.addEventListener('pointerdown', this._onScrollerPointerDown);
		this.commitFormValue();
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('rows')) {
			this.style.setProperty(this.rowsProperty, String(this.rows));
		}
		if (this.view) {
			if (changed.has('value')) {
				// Only an outside change goes into the document: the echo of the user's
				// own typing already matches it. Such a change while focused must not look
				// like an edit on the next blur, so the baseline moves along.
				if (this.docToValue(this.doc) !== this.value) {
					this.setDoc(this.docToValue(this.value));
					this._valueAtFocus = this.value;
				}
				this.commitFormValue();
			}
			if (changed.has('disabled') || changed.has('readonly')) {
				this.reconfigure(this._editableCompartment, this._editableExtension());
			}
			if (changed.has('placeholder')) {
				this.reconfigure(this._placeholderCompartment, this._placeholderExtension());
			}
			if (['accessibleLabel', 'inputId', 'disabled', 'readonly', 'required'].some((name) => changed.has(name))) {
				this.refreshContentAttributes();
			}
		}
	}

	private _onDocChanged(): void {
		const text = this.docToValue(this.doc);
		if (text === this.value) return;
		this.value = text;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value: text },
			bubbles: true,
			composed: true,
		}));
	}

	private _emitChange(): void {
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	private _onScrollerPointerDown = (event: PointerEvent): void => {
		// Only the scroller's own padding, not the content or a gutter inside it.
		if (event.target !== this.view?.scrollDOM) return;
		this.focusFromPoint(event.clientX, event.clientY);
		event.preventDefault();
	};

	override formValue(): FormValue {
		return this.value;
	}

	formResetCallback(): void {
		this.value = this._initialValue;
	}

	formStateRestoreCallback(state: File | string | FormData | null): void {
		if (typeof state === 'string') this.value = state;
	}

	/** CodeMirror builds the textbox; the host is only its container. */
	override describedTarget(): Element | null {
		return this.shadowRoot?.querySelector('.cm-content') ?? null;
	}
}
