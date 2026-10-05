/**
 * Nederlandse Digitale Dienst Code Editor Component (Lit + TypeScript)
 *
 * A monospace editor for code, YAML, JSON and other technical content, built
 * on CodeMirror 6 (via NLDDCodeMirrorElement). Visually pairs with
 * nldd-code-viewer for a matching read-only surface.
 *
 * Default `appearance="simple"` is a bare, flush editor (no frame, no focus ring)
 * for use inside an nldd-form-field or a consumer composition that owns its own
 * chrome and focus treatment; the caret is rendered as a prominent accent as
 * the focus cue. `appearance="input-field"` adds the framed surface (border ring, tinted
 * fill, inner padding, radius) and a focus ring for standalone use.
 *
 * The simple variant has no surrounding space of its own: let a layout
 * container own the spacing and forward clicks with `focusFromPoint()` so
 * clicking the padding still starts editing.
 *
 * Optional `language` enables lazy syntax highlighting; `line-numbers` adds a
 * gutter (click a number to move the caret to that line).
 *
 * @element nldd-code-editor
 *
 * @attr {string} value - Editor content
 * @attr {string} placeholder - Placeholder text shown while empty
 * @attr {string} input-id - Sets the id on the editable element. Set automatically by nldd-form-field.
 * @attr {boolean} disabled - Disabled state
 * @attr {string} name - Field name for form submission
 * @attr {boolean} readonly - Readonly state (focusable and selectable, not editable)
 * @attr {boolean} required - Required state
 * @attr {boolean} wrap - Wrap long lines instead of horizontal scroll
 * @attr {number} rows - Minimum visible rows (the floor in every resize mode). Default: 6.
 * @attr {string} resize - 'none' (fixed) | 'vertical' (drag) | 'auto' (grow, default)
 * @attr {string} appearance - 'simple' (default, bare) | 'input-field' (framed surface)
 * @attr {string} language - Highlight grammar (yaml, json, javascript, typescript, css, html, xml, bash, markdown, rust, gherkin, toml, sql, python). Empty disables highlighting.
 * @attr {boolean} line-numbers - Show a line-number gutter
 * @attr {string} accessible-label - Accessible label forwarded to the editor. Set automatically by nldd-form-field.
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @fires input - When the content changes (detail: { value })
 * @fires change - When the content is committed on blur (detail: { value })
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import {
	EditorView,
	keymap,
	drawSelection,
	lineNumbers as cmLineNumbers,
	placeholder as cmPlaceholder,
} from '@codemirror/view';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { NLDDCodeMirrorElement } from '../../../utilities/codemirror/codemirror-element.js';
import { nlddCodeMirrorTheme } from '../../../utilities/codemirror/theme.js';
import { loadLanguage } from '../../../utilities/codemirror/languages.js';
import { codeEditorStyles } from './code-editor.styles.js';
import { codeEditorTemplate } from './code-editor.template.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';

export type ResizeMode = 'none' | 'vertical' | 'auto';
export type CodeEditorAppearance = 'input-field' | 'simple';

@customElement('nldd-code-editor')
export class NLDDCodeEditor extends DescribedBy(FormAssociated(NLDDCodeMirrorElement)) {

	static override shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	static override styles = codeEditorStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	private _initialValue = '';
	private _valueAtFocus = '';
	private _accessibleLabelWarned = false;

	@property({ type: String })
	value = '';

	@property({ type: String, attribute: 'input-id' })
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

	@property({ type: Boolean, reflect: true })
	wrap = false;

	@property({ type: Number })
	rows = 6;

	@property({ reflect: true, converter: reflectNonDefault<ResizeMode>('auto') })
	resize: ResizeMode = 'auto';

	@property({ reflect: true, converter: reflectNonDefault<CodeEditorAppearance>('simple') })
	appearance: CodeEditorAppearance = 'simple';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	language = '';

	@property({ type: Boolean, reflect: true, attribute: 'line-numbers' })
	lineNumbers = false;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@query('.code-editor')
	private _container!: HTMLElement;

	// Compartments let us reconfigure single concerns without rebuilding state.
	private _editableCompartment = new Compartment();
	private _wrapCompartment = new Compartment();
	private _lineNumbersCompartment = new Compartment();
	private _placeholderCompartment = new Compartment();
	private _attrsCompartment = new Compartment();
	private _languageCompartment = new Compartment();


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

	protected getEditorParent(): HTMLElement | null | undefined {
		return this._container;
	}

	protected buildExtensions(): Extension[] {
		return [
			nlddCodeMirrorTheme,
			history(),
			drawSelection(),
			keymap.of([...defaultKeymap, ...historyKeymap]),
			this._placeholderCompartment.of(this._placeholderExtension()),
			this._wrapCompartment.of(this.wrap ? EditorView.lineWrapping : []),
			this._lineNumbersCompartment.of(this._lineNumbersExtension()),
			this._editableCompartment.of(this._editableExtension()),
			this._attrsCompartment.of(this._attrsExtension()),
			this._languageCompartment.of([]),
			EditorView.updateListener.of((u) => {
				if (u.docChanged) this._onDocChanged();
			}),
			EditorView.domEventHandlers({
				focus: () => {
					this._valueAtFocus = this.value;
				},
				blur: () => {
					if (this.value !== this._valueAtFocus) this._emitChange();
				},
			}),
		];
	}

	private _editableExtension(): Extension {
		// Readonly stays focusable/selectable (read + copy); disabled is inert.
		const editable = !this.disabled;
		const readOnly = this.disabled || this.readonly;
		return [EditorView.editable.of(editable), EditorState.readOnly.of(readOnly)];
	}

	private _placeholderExtension(): Extension {
		return this.placeholder ? cmPlaceholder(this.placeholder) : [];
	}

	private _lineNumbersExtension(): Extension {
		if (!this.lineNumbers) return [];
		// Clicking a line number moves the caret to the start of that line.
		return cmLineNumbers({
			domEventHandlers: {
				mousedown: (view, line) => {
					view.dispatch({ selection: { anchor: line.from } });
					view.focus();
					return true;
				},
			},
		});
	}

	private _attrsExtension(): Extension {
		// CodeMirror's content is a bare contenteditable; give it the textbox
		// semantics a native <textarea> had — role, multiline, and the readonly/
		// required state — so screen readers announce it correctly (WCAG 4.1.2).
		const attrs: Record<string, string> = {
			'role': 'textbox',
			'aria-multiline': 'true',
		};
		if (this.accessibleLabel) attrs['aria-label'] = this.accessibleLabel;
		if (this.inputId) attrs['id'] = this.inputId;
		// disabled makes the field inert (contenteditable=false); readonly keeps it
		// focusable but non-editable. Either way it's not editable, so reflect
		// aria-readonly. aria-required mirrors the required constraint.
		if (this.readonly || this.disabled) attrs['aria-readonly'] = 'true';
		if (this.required) attrs['aria-required'] = 'true';
		return EditorView.contentAttributes.of(attrs);
	}

	override firstUpdated(): void {
		this._initialValue = this.value;
		this.style.setProperty('--_rows', String(this.rows));
		this.mountEditor(this.value);
		this.onEditorMounted();
	}

	/* Runs on the initial mount and on every re-mount after a detach/reattach
	 * (e.g. Vue <KeepAlive>): the view — and its scrollDOM — is rebuilt, so the
	 * padding-click forwarder and language must be (re)applied here. */
	protected override onEditorMounted(): void {
		// A press on the scroller's own padding (outside .cm-content) doesn't
		// place a caret; forward it to the nearest line so the padding is
		// clickable too. CM attaches its own handlers to the content, not the
		// scroller, so this is a plain listener on the scroller element.
		this.view?.scrollDOM.addEventListener('pointerdown', this._onScrollerPointerDown);
		this.commitFormValue();
		if (this.language) void this._applyLanguage();
		this._checkAccessibleLabel();
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('rows')) {
			this.style.setProperty('--_rows', String(this.rows));
		}
		if (this.view) {
			if (changed.has('value')) {
				const docWas = this.doc;
				this.setDoc(this.value);
				this.commitFormValue();
				// A programmatic value change while focused must not look like a user edit
				// on the next blur: if setDoc actually moved the doc (i.e. this wasn't the
				// echo of the user's own typing, where the doc already equals value),
				// advance the focus-time baseline too.
				if (docWas !== this.value) this._valueAtFocus = this.value;
			}
			if (changed.has('disabled') || changed.has('readonly')) {
				this.reconfigure(this._editableCompartment, this._editableExtension());
			}
			// readonly/required/disabled also drive the content's aria-readonly/
			// aria-required, so refresh the attrs compartment when they change.
			if (changed.has('disabled') || changed.has('readonly') || changed.has('required')) {
				this.reconfigure(this._attrsCompartment, this._attrsExtension());
			}
			if (changed.has('wrap')) {
				this.reconfigure(this._wrapCompartment, this.wrap ? EditorView.lineWrapping : []);
			}
			if (changed.has('lineNumbers')) {
				this.reconfigure(this._lineNumbersCompartment, this._lineNumbersExtension());
			}
			if (changed.has('placeholder')) {
				this.reconfigure(this._placeholderCompartment, this._placeholderExtension());
			}
			if (changed.has('accessibleLabel') || changed.has('inputId')) {
				this.reconfigure(this._attrsCompartment, this._attrsExtension());
			}
			if (changed.has('language')) {
				void this._applyLanguage();
			}
		}
		this._checkAccessibleLabel();
	}

	private async _applyLanguage(): Promise<void> {
		const lang = this.language;
		if (!lang) {
			this.reconfigure(this._languageCompartment, []);
			return;
		}
		const pending = loadLanguage(lang);
		if (!pending) {
			this.reconfigure(this._languageCompartment, []);
			return;
		}
		try {
			const support = await pending;
			// The attribute may have changed while the grammar was loading.
			if (this.language === lang) this.reconfigure(this._languageCompartment, support);
		} catch {
			this.reconfigure(this._languageCompartment, []);
		}
	}

	private _onDocChanged(): void {
		const text = this.doc;
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
		// Only the scroller's own padding — not the content/gutter inside it.
		// pointerdown covers mouse, touch and pen in one event.
		if (event.target !== this.view?.scrollDOM) return;
		this.focusFromPoint(event.clientX, event.clientY);
		event.preventDefault();
	};

	/* Ran from updated(), not firstUpdated(): a parent nldd-form-field sets
	 * input-id slightly after our first render, so checking earlier triggers
	 * a spurious warning for the standard form-field usage. We re-check on
	 * every update and warn once if the missing label is still missing. */
	private _checkAccessibleLabel(): void {
		if (this._accessibleLabelWarned) return;
		if (this.accessibleLabel || this.inputId) return;
		this._accessibleLabelWarned = true;
		console.warn('<nldd-code-editor>: No accessible-label or input-id provided. Use nldd-form-field for labeled usage, or set accessible-label for screen reader accessibility (WCAG SC 4.1.2).');
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

	/** CodeMirror builds the textbox; the host is only its container. */
	override describedTarget(): Element | null {
		return this.shadowRoot?.querySelector('.cm-content') ?? null;
	}

	override render() {
		return codeEditorTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-code-editor': NLDDCodeEditor;
	}
}
