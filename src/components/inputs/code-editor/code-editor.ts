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
import { type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { EditorView, keymap, drawSelection, lineNumbers as cmLineNumbers } from '@codemirror/view';
import { Compartment, type Extension } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { NLDDCodeMirrorInput } from '../../../utilities/codemirror/codemirror-input.js';
import { nlddCodeMirrorTheme } from '../../../utilities/codemirror/theme.js';
import { loadLanguage } from '../../../utilities/codemirror/languages.js';
import { codeEditorStyles } from './code-editor.styles.js';
import { codeEditorTemplate } from './code-editor.template.js';

export type ResizeMode = 'none' | 'vertical' | 'auto';
export type CodeEditorAppearance = 'input-field' | 'simple';

@customElement('nldd-code-editor')
export class NLDDCodeEditor extends NLDDCodeMirrorInput {

	static override styles = codeEditorStyles;

	@property({ type: Boolean, reflect: true })
	wrap = false;

	@property({ reflect: true, converter: reflectNonDefault<ResizeMode>('auto') })
	resize: ResizeMode = 'auto';

	@property({ reflect: true, converter: reflectNonDefault<CodeEditorAppearance>('simple') })
	appearance: CodeEditorAppearance = 'simple';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	language = '';

	@property({ type: Boolean, reflect: true, attribute: 'line-numbers' })
	lineNumbers = false;

	@query('.code-editor')
	private _container!: HTMLElement;

	protected readonly rowsProperty = '--_code-editor-rows';

	// Compartments let us reconfigure single concerns without rebuilding state.
	private _wrapCompartment = new Compartment();
	private _lineNumbersCompartment = new Compartment();
	private _languageCompartment = new Compartment();

	protected getEditorParent(): HTMLElement | null | undefined {
		return this._container;
	}

	protected buildExtensions(): Extension[] {
		return [
			nlddCodeMirrorTheme,
			history(),
			drawSelection(),
			keymap.of([...defaultKeymap, ...historyKeymap]),
			...this.inputExtensions(),
			this._wrapCompartment.of(this.wrap ? EditorView.lineWrapping : []),
			this._lineNumbersCompartment.of(this._lineNumbersExtension()),
			this._languageCompartment.of([]),
		];
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

	// CodeMirror's content is a bare contenteditable; give it the textbox
	// semantics a native <textarea> had, so screen readers announce it (WCAG 4.1.2).
	protected override contentAttributes(): Record<string, string> {
		return { 'role': 'textbox', 'aria-multiline': 'true' };
	}

	/* Runs on the initial mount and on every re-mount after a detach/reattach
	 * (e.g. Vue <KeepAlive>): the view is rebuilt, so the language goes on again. */
	protected override onEditorMounted(): void {
		super.onEditorMounted();
		if (this.language) void this._applyLanguage();
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (!this.view) return;
		if (changed.has('wrap')) {
			this.reconfigure(this._wrapCompartment, this.wrap ? EditorView.lineWrapping : []);
		}
		if (changed.has('lineNumbers')) {
			this.reconfigure(this._lineNumbersCompartment, this._lineNumbersExtension());
		}
		if (changed.has('language')) {
			void this._applyLanguage();
		}
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

	override render() {
		return codeEditorTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-code-editor': NLDDCodeEditor;
	}
}
