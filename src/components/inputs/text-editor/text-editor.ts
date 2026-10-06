/**
 * Nederlandse Digitale Dienst Text Editor Component (Lit + TypeScript)
 *
 * A hybrid markdown editor built on CodeMirror 6 (via NLDDCodeMirrorElement):
 * the document stays plain markdown text, but formatting is shown inline (bold
 * is bold, headings are larger, links are colored) while the syntax markers
 * stay visible, only dimmed — the iA Writer / Kirby approach. No WYSIWYG tree,
 * so the data stays portable.
 *
 * Default `appearance="simple"` is bare (no frame, no focus ring) for use inside
 * a composition (e.g. a message field) that owns its chrome and focus; the
 * caret is a prominent accent. `appearance="input-field"` adds a framed surface + focus
 *
 * Headless: there is no built-in toolbar. A consumer drives formatting via the
 * command methods (toggleBold/toggleItalic/toggleInlineCode/toggleStrikethrough/
 * toggleHeading/toggleBulletList/toggleTaskList/toggleQuote/toggleLink/runCommand
 * to toggle, and
 * setHeading/setList for picker-style "set" semantics), reads the active formats
 * with getState(), listens to the nldd-text-editor-state event to render toggle
 * states, and forwards padding clicks with focusFromPoint(). Cmd/Ctrl+B/I/E/K are
 * bound out of the box. Commands keep focus on the editor. An inline toggle wraps
 * the selected text (whitespace at its edges stays outside the markers), unwraps
 * a run the caret is in, and with the caret at the very end of a run steps out
 * of it. Bold that a typed space has broken (`**woord **`) keeps its styling
 * while the caret is inside; the space moves outside the markers when the caret
 * leaves. insertAtCursor(text) puts text at the caret and replaceRange(from, to,
 * text) writes at the same clean offsets getSelection() reads. An @-mention typeahead
 * (mentionSource) collapses to an atomic token, further typeahead lists on their
 * own trigger (typeaheads) write what you tell them to, and a W3C-style annotation overlay
 * (annotations) marks ranges with a dashed underline, light tint and a count badge
 * without touching the underlying text.
 *
 * @element nldd-text-editor
 *
 * @attr {string} value - Editor content (markdown)
 * @attr {string} placeholder - Placeholder text shown while empty
 * @attr {string} input-id - Sets the id on the editable element. Set automatically by nldd-form-field.
 * @attr {boolean} disabled - Disabled state
 * @attr {string} name - Field name for form submission
 * @attr {boolean} readonly - Readonly state (focusable and selectable, not editable)
 * @attr {boolean} required - Required state
 * @attr {boolean} no-spellcheck - Turns spellchecking off. It is on by default, like the other text fields, and leaves out what is not running text: inline code and code blocks, the address of a link and a bare URL (the link text is checked), and mentions. Autocorrect and autocapitalize follow the user's own settings, as in the other fields, also with `no-spellcheck`. Two limits come from the browser: text that was already there is checked once you edit near it, not when the editor opens (the editor lives in a shadow root; Firefox only checks around the caret), and markup that changes how a line is built, such as starting a list item, hides the underlines on that line until you type on.
 * @attr {boolean} wrap - Wrap long lines (default true; prose wraps)
 * @attr {number} rows - Minimum visible rows (the floor in every resize mode). Default: 6.
 * @attr {string} resize - 'none' (fixed) | 'vertical' (drag) | 'auto' (grow, default)
 * @attr {string} appearance - 'simple' (default, bare) | 'input-field' (framed surface)
 * @attr {string} accessible-label - Accessible label forwarded to the editor. Set automatically by nldd-form-field.
 *
 * @prop {MentionSource} mentionSource - Consumer-supplied @-mention candidate source (property only). Without it, @-typeahead is inert.
 * @prop {string} mentionQuery - What may follow the `@` of a mention, as a regular expression source (property only). Default: letters with any accent, digits, `_`, `.`, `+` and `-`. Allow one space to search on a full name, as in `@sam jansen`.
 * @prop {Function} mentionEmptyText - What to say when the @-list has no candidates, called with the typed query (property only). Without it the list says "Typ om te zoeken" or "Niets gevonden", both translatable. Return null to close the list without a word.
 * @prop {Typeahead[]} typeaheads - Your own typeahead lists next to the @-mention (property only): each a trigger character (`#`, `:`, `/`), a `source` that returns candidates for the text typed after it, an optional `query` (a regular expression for what may follow the trigger, such as a space in a full name), an optional `emptyText` (what to say when there are no candidates, instead of the translated default) and an optional `insert` that decides what a choice writes (by default the trigger, the text and a space). Lists on one trigger are merged in order. A candidate is `{ id, text, supportingText? }` and can carry an `avatar` (its row then takes two lines, the supporting text under the text), an `icon` or a `symbol` for its row.
 * @attr {boolean} annotatable - Enable the annotation overlay (off by default). Annotations only render when this is set.
 * @prop {Annotation[]} annotations - Consumer-supplied annotation overlay (property only). Anchored by offset and mapped through edits; the text stays clean. Requires `annotatable`. Assign a NEW array to apply changes (Lit dirty-checks by identity, so in-place mutation like `.push()` won't re-render): `editor.annotations = [...editor.annotations, next]`.
 * @attr {object} translations - Override the editor's assistive-tech strings (the open-in-new-tab link badge and the annotation count badge). Unset keys fall back to Dutch.
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @fires input - When the content changes (detail: { value })
 * @fires change - When the content is committed on blur (detail: { value })
 * @fires nldd-text-editor-state - When the selection or content changes (detail: TextEditorState), for toolbar toggle state
 * @fires nldd-text-editor-mention - When an @-mention is inserted (detail: MentionInsertedDetail with id, text, from, to; clean offsets, like getSelection())
 * @fires nldd-text-editor-typeahead - When a candidate from one of the `typeaheads` is chosen (detail: TypeaheadChosenDetail with trigger, candidate, from, to; clean offsets)
 * @fires nldd-text-editor-annotation-click - When an annotation's count badge is clicked (detail: { ids: string[], rect: DOMRect }); rect is the badge's viewport box so a consumer can anchor its own note UI to it
 */
import { relabel } from './text-editor.labels.js';
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import {
	EditorView,
	keymap,
	drawSelection,
	dropCursor,
	placeholder as cmPlaceholder,
} from '@codemirror/view';
import { Compartment, EditorState, Prec, Transaction, type Extension } from '@codemirror/state';
import { defaultKeymap, deleteCharBackward, deleteCharForward, history, historyKeymap, undo as cmUndo, redo as cmRedo, undoDepth, redoDepth } from '@codemirror/commands';
import { NLDDCodeMirrorElement } from '../../../utilities/codemirror/codemirror-element.js';
import { nlddCodeMirrorTheme } from '../../../utilities/codemirror/theme.js';
import { markdownEditing, mentionRangeAt, mentionRangeEndingAt, mentionRangeStartingAt } from './text-editor.markdown.js';
import {
	typeaheads as typeaheadExtension,
	mentionInsert,
	mentionToken,
	type MentionSource,
	type MentionInsertedDetail,
	type Typeahead,
	type TypeaheadChoice,
} from './text-editor.mentions.js';
import { repairHeldEmphasis } from './text-editor.emphasis.js';
import { spellcheck, leaveDeletionToBrowser } from './text-editor.spellcheck.js';
import { annotations as annotationExtension, setAnnotations, pasteAnnotations, currentAnnotations, type Annotation } from './text-editor.annotations.js';
import { orderedListRenumber } from './text-editor.ordered-list.js';
import { dragToMove, dragMovePlugin } from './text-editor.drag.js';
import { linkOpenBadge } from './text-editor.links.js';
import { stableCursor } from './text-editor.cursor.js';
import {
	toggleInlineWrap,
	indentListItems as cmIndentListItems,
	outdentListItems as cmOutdentListItems,
	canIndentListItem as cmCanIndent,
	canOutdentListItem as cmCanOutdent,
	toggleHeading as cmToggleHeading,
	setHeading as cmSetHeading,
	toggleBulletList as cmToggleBulletList,
	toggleTaskList as cmToggleTaskList,
	setList as cmSetList,
	toggleQuote as cmToggleQuote,
	toggleLink as cmToggleLink,
	toggleCodeBlock as cmToggleCodeBlock,
	clearListMarkerBackward,
	readActiveFormats,
	EMPTY_FORMATS,
	type HeadingLevel,
	type ListType,
	type TextEditorState,
	type TextEditorActiveFormats,
} from './text-editor.commands.js';
import { textEditorStyles } from './text-editor.styles.js';
import { textEditorTemplate } from './text-editor.template.js';
import { stripSentinels, docToClean, cleanToDoc, sentinelPositions } from './text-editor.annotation-sentinels.js';
import { nlddTextEditorTranslations, type NLDDTextEditorTranslations } from './text-editor.i18n.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { translate } from '../../../utilities/translations.js';

export type ResizeMode = 'none' | 'vertical' | 'auto';
export type TextEditorAppearance = 'input-field' | 'simple';
export type { HeadingLevel, ListType, TextEditorState, TextEditorActiveFormats } from './text-editor.commands.js';
export type {
	MentionCandidate,
	MentionSource,
	MentionInsertedDetail,
	Typeahead,
	TypeaheadCandidate,
	TypeaheadSource,
	TypeaheadChosenDetail,
	TypeaheadTrigger,
} from './text-editor.mentions.js';
export { DEFAULT_TYPEAHEAD_QUERY } from './text-editor.mentions.js';
export type { Annotation } from './text-editor.annotations.js';

@customElement('nldd-text-editor')
export class NLDDTextEditor extends DescribedBy(FormAssociated(NLDDCodeMirrorElement)) {

	static override shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	static override styles = textEditorStyles;

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

	/** Turns spellchecking off. On by default, without code, URLs and mentions. */
	@property({ type: Boolean, reflect: true, attribute: 'no-spellcheck' })
	noSpellcheck = false;

	@property({ type: Boolean, reflect: true })
	wrap = true;

	@property({ type: Number })
	rows = 6;

	@property({ reflect: true, converter: reflectNonDefault<ResizeMode>('auto') })
	resize: ResizeMode = 'auto';

	@property({ reflect: true, converter: reflectNonDefault<TextEditorAppearance>('simple') })
	appearance: TextEditorAppearance = 'simple';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** Consumer-supplied @-mention source: called with the text typed after `@`
	 *  and returns (a promise of) candidates. Property only (set via JS); without
	 *  it, @-typeahead is inert. */
	@property({ attribute: false })
	mentionSource?: MentionSource;

	/** What may follow the `@` of a mention, as a regular expression without
	 *  anchors or capturing groups. Property only. Without it: letters with any
	 *  accent, digits, `_`, `.`, `+` and `-`. Allow one space to search on a full
	 *  name: `'[\\p{L}\\p{M}\\p{N}_.+-]*(?: [\\p{L}\\p{M}\\p{N}_.+-]+)?'`. */
	@property({ attribute: false })
	mentionQuery?: string;

	/** What to say when the @-list has no candidates. Without it: "Typ om te
	 *  zoeken" or "Niets gevonden" (translatable). Called with the typed query;
	 *  return null to close without a word. Property only. */
	@property({ attribute: false })
	mentionEmptyText?: (query: string) => string | null | undefined;

	/** Your own typeahead lists next to the @-mention, each on its own trigger
	 *  character. Property only. Read on every keystroke, so a new array takes
	 *  effect at once. */
	@property({ attribute: false })
	typeaheads: Typeahead[] = [];

	/** The built-in mention as a typeahead: the `@` list fed by `mentionSource`,
	 *  writing the token. One object, so a choice can be told apart from a
	 *  consumer's own `@` list and fire the mention event. */
	private readonly _mentionTypeahead: Typeahead = ((host: NLDDTextEditor): Typeahead => ({
		trigger: '@',
		source: (query) => host.mentionSource?.(query) ?? [],
		insert: mentionInsert,
		get query() {
			return host.mentionQuery;
		},
		get emptyText() {
			return host.mentionEmptyText;
		},
	}))(this);

	/** Whether the annotation overlay is enabled. Off by default; set the
	 *  `annotatable` attribute to turn it on (so the comment affordance and the
	 *  overlay only appear when the consumer opts in). */
	@property({ type: Boolean, reflect: true })
	annotatable = false;

	/** Consumer-supplied annotations (W3C-style overlay). Property only (set via
	 *  JS). Render only when `annotatable` is on. The text stays clean; these
	 *  render as a light tint and a count badge, anchored by offset and mapped
	 *  through edits.
	 *
	 *  IMPORTANT: assign a NEW array to apply changes. Lit dirty-checks this
	 *  property by identity, so mutating the existing array in place
	 *  (`editor.annotations.push(next)`, `editor.annotations[0].end = 9`, …) does
	 *  NOT trigger a re-render. Always replace it:
	 *  `editor.annotations = [...editor.annotations, next]`. */
	@property({ attribute: false })
	annotations: Annotation[] = [];

	/** Override translation keys for the editor's assistive-tech strings (the
	 *  open-in-new-tab link badge and the annotation count badge). Unset keys fall
	 *  back to Dutch. */
	@property({ type: Object })
	translations: Partial<NLDDTextEditorTranslations> = {};

	@query('.text-editor')
	private _container!: HTMLElement;

	private _editableCompartment = new Compartment();
	private _wrapCompartment = new Compartment();
	private _placeholderCompartment = new Compartment();
	private _attrsCompartment = new Compartment();
	private _spellcheckCompartment = new Compartment();
	private _historyCompartment = new Compartment();


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

	/** Resolve a translation key, applying `{name}` placeholder substitution from
	 *  `vars`. Consumer overrides via `translations` win; unset keys fall back to the
	 *  Dutch defaults. */
	public _t(key: keyof NLDDTextEditorTranslations, vars?: Record<string, string | number>): string {
		return translate(this.translations, nlddTextEditorTranslations, key, vars);
	}

	private _labels: string | null = null;

	/** The translated texts the document's widgets draw, as one string. */
	private _labelSignature(): string {
		return [
			'components.text-editor.open-in-new-tab-label',
			'components.text-editor.annotation-count-label',
			'components.text-editor.annotation-singular-lowercase',
			'components.text-editor.annotation-plural-lowercase',
		].map((key) => this._t(key as keyof NLDDTextEditorTranslations)).join('\n');
	}

	protected buildExtensions(): Extension[] {
		return [
			nlddCodeMirrorTheme,
			markdownEditing,
			typeaheadExtension(
				() => this._typeaheadLists(),
				(choice) => this._onTypeaheadChosen(choice),
				(query) => this._t(query ? 'components.text-editor.typeahead-no-results-text' : 'components.text-editor.typeahead-start-typing-text'),
			),
			// Prec.low so this transaction filter runs *before* the annotation filter
			// (filters run low-precedence first), letting the annotation map through the
			// renumber changes too — otherwise a marker growing from 1 to 11 drifts a
			// token on that line.
			Prec.low(orderedListRenumber),
			// The label fns read `this._t` lazily, so a newly rendered badge always uses
			// the current `translations`; overriding them before mount localizes the
			// assistive-tech strings.
			annotationExtension((count, quote) =>
				this._t('components.text-editor.annotation-count-label', {
					count,
					noun: this._t(
						count === 1
							? 'components.text-editor.annotation-singular-lowercase'
							: 'components.text-editor.annotation-plural-lowercase',
					),
					quote,
				}),
			),
			// Prec.highest so the badge nests inside a heading/bold run and scales with
			// it, like the mention and annotation, instead of staying at the base size.
			Prec.highest(linkOpenBadge((url) => this._t('components.text-editor.open-in-new-tab-label', { url }))),
			this._historyCompartment.of(history()),
			drawSelection(),
			// Draws the caret in drawSelection's place, on a side that does not depend on
			// the direction it arrived from unless that direction means something (a
			// widget, a line wrap). See text-editor.cursor.ts.
			stableCursor,
			dropCursor(),
			dragToMove,
			// Prec.highest so this beats the markdown language's deleteMarkupBackward,
			// which would otherwise leave alignment whitespace when a non-first list
			// marker is backspaced. Falls through (returns false) off a list marker.
			Prec.highest(keymap.of([{ key: 'Backspace', run: clearListMarkerBackward }])),
			keymap.of([
				{ key: 'Mod-b', run: (view) => { toggleInlineWrap(view, '**', 'StrongEmphasis'); return true; } },
				{ key: 'Mod-i', run: (view) => { toggleInlineWrap(view, '*', 'Emphasis'); return true; } },
				{ key: 'Mod-e', run: (view) => { toggleInlineWrap(view, '`', 'InlineCode'); return true; } },
				{ key: 'Mod-k', run: (view) => { cmToggleLink(view); return true; } },
				// A mention deletes in two steps: the first Backspace/Delete next to it
				// selects the whole token, the second removes it.
				{ key: 'Backspace', run: (view) => this._selectMentionBeforeDelete(view, -1) },
				{ key: 'Delete', run: (view) => this._selectMentionBeforeDelete(view, 1) },
				// Cmd/Ctrl+] and +[ nest and un-nest list items. defaultKeymap binds them
				// to indentMore/indentLess, whose four-space indent turns plain text into
				// an indented code block. Consumed here in every case: off a list item
				// they do nothing, which beats a code block nobody asked for.
				{ key: 'Mod-]', run: (view) => { cmIndentListItems(view); return true; } },
				{ key: 'Mod-[', run: (view) => { cmOutdentListItems(view); return true; } },
				// The browser deletes where the editor has nothing to add, so the
				// spelling marks on the line stay (see leaveDeletionToBrowser).
				{ key: 'Backspace', run: (view) => !leaveDeletionToBrowser(view, 'Backspace') && deleteCharBackward(view), shift: deleteCharBackward },
				{ key: 'Delete', run: (view) => !leaveDeletionToBrowser(view, 'Delete') && deleteCharForward(view) },
				...defaultKeymap.filter((binding) => binding.key !== 'Backspace' && binding.key !== 'Delete'),
				...historyKeymap,
			]),
			this._placeholderCompartment.of(this._placeholderExtension()),
			this._wrapCompartment.of(this.wrap ? EditorView.lineWrapping : []),
			this._editableCompartment.of(this._editableExtension()),
			this._attrsCompartment.of(this._attrsExtension()),
			this._spellcheckCompartment.of(this.noSpellcheck ? [] : spellcheck()),
			EditorView.updateListener.of((u) => {
				if (u.docChanged) this._onDocChanged();
				if (u.docChanged || u.selectionSet) this._emitState();
			}),
			EditorView.domEventHandlers({
				focus: () => {
					this._valueAtFocus = this.value;
				},
				blur: (_event, view) => {
					// An emphasis held together while it was being typed is closed
					// properly first, so the committed value renders the way it looked.
					repairHeldEmphasis(view);
					if (this.value !== this._valueAtFocus) this._emitChange();
				},
				// Triple-click selects the whole paragraph (the doc line), like macOS.
				// CM's own triple-click stops at the visual line, which under wrapping is
				// just one wrapped row.
				mousedown: (event, view) => {
					if (event.detail < 3) return false;
					const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
					if (pos === null) return false;
					const line = view.state.doc.lineAt(pos);
					view.dispatch({ selection: { anchor: line.from, head: line.to } });
					event.preventDefault();
					return true;
				},
				// Native Cmd/Ctrl+X/C/V go through these DOM events, not the toolbar's
				// methods, so mirror the annotation-carrying logic here too.
				cut: (_event, view) => {
					const { from, to } = view.state.selection.main;
					this._cutBuffer = from === to
						? null
						: { text: stripSentinels(view.state.sliceDoc(from, to)), anns: this._annotationsInSelection() };
					return false; // let CodeMirror perform the actual cut (clipboard + delete)
				},
				copy: () => {
					this._cutBuffer = null; // a plain copy must not carry a pending cut's annotations
					return false;
				},
				paste: (event) => {
					const raw = event.clipboardData?.getData('text/plain');
					if (raw === undefined) return false; // no clipboard data — let CodeMirror handle it
					this._pasteText(stripSentinels(raw));
					event.preventDefault();
					return true;
				},
			}),
		];
	}

	private _editableExtension(): Extension {
		const editable = !this.disabled;
		const readOnly = this.disabled || this.readonly;
		return [EditorView.editable.of(editable), EditorState.readOnly.of(readOnly)];
	}

	private _placeholderExtension(): Extension {
		return this.placeholder ? cmPlaceholder(this.placeholder) : [];
	}

	/**
	 * A browser checks text when it changes, not when `spellcheck` does: turned
	 * off, the red underlines stayed until the text under them was edited, and
	 * turned on, they only came with new words. Drawing the content anew makes
	 * the browser look again. The state stays as it is, history and selection
	 * included, so this is only the picture.
	 */
	private _redrawForSpellcheck(): void {
		const view = this.view;
		if (!view) return;
		const focused = view.hasFocus;
		view.setState(view.state);
		if (focused) view.focus();
	}

	private _attrsExtension(): Extension {
		// Autocorrect and autocapitalize follow the user's own settings, as on an
		// <input> or a <textarea>, also with no-spellcheck: CodeMirror's "off" is
		// not what a text field does. And with them off, CodeMirror turns the
		// period macOS puts after a double space back into a space by writing the
		// line anew, which cost the spelling marks on it.
		const attrs: Record<string, string> = { autocorrect: 'on', autocapitalize: 'sentences' };
		if (this.accessibleLabel) attrs['aria-label'] = this.accessibleLabel;
		if (this.inputId) attrs['id'] = this.inputId;
		return EditorView.contentAttributes.of(attrs);
	}

	override firstUpdated(): void {
		this._initialValue = this.value;
		this.style.setProperty('--_text-editor-rows', String(this.rows));
		// The sentinels are the overlay's own; a value that carries one (an editor
		// whose text was round-tripped through another) hands it back stripped.
		this.mountEditor(stripSentinels(this.value));
		this.onEditorMounted();
	}

	/* Runs on the initial mount and on every re-mount after a detach/reattach
	 * (e.g. Vue <KeepAlive>): the view — with its scroller and content DOM — is
	 * rebuilt, so the click forwarders and annotation state must be (re)applied. */
	protected override onEditorMounted(): void {
		// A press on the scroller's own padding (outside .cm-content) doesn't
		// place a caret; forward it to the nearest line.
		this.view?.scrollDOM.addEventListener('pointerdown', this._onScrollerPointerDown);
		// Clicking a mention selects the whole token (capture, to beat CM's own
		// caret placement).
		this.view?.contentDOM.addEventListener('pointerdown', this._onMentionPointerDown, true);
		// Clicking an annotation's count badge opens it (the consumer decides how);
		// the tinted text itself stays plain-clickable for caret placement.
		this.view?.contentDOM.addEventListener('click', this._onAnnotationBadgeClick);
		this._syncAnnotations();
		this.commitFormValue();
		this._checkAccessibleLabel();
		// Emit one state snapshot on mount so a consumer's toolbar initializes to the
		// real state (e.g. undo/redo disabled with no history yet) instead of its
		// default, without waiting for the first edit or selection change.
		this._emitState();
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('rows')) {
			this.style.setProperty('--_text-editor-rows', String(this.rows));
		}
		if (this.view) {
			// A render after setTranslations() or a new `translations`: the labels
			// drawn inside the document follow when their text changed.
			const labels = this._labelSignature();
			if (labels !== this._labels) {
				if (this._labels !== null) this.view.dispatch({ effects: relabel.of(null) });
				this._labels = labels;
			}
			if (changed.has('value')) {
				// Only push an external value change into the document; a value that just
				// mirrors the current (sentinel-stripped) doc must not trigger a rewrite,
				// which would strip the sentinels the filter then re-adds (caret churn).
				if (stripSentinels(this.doc) !== this.value) this.setDoc(stripSentinels(this.value));
				this.commitFormValue();
			}
			if (changed.has('disabled') || changed.has('readonly')) {
				this.reconfigure(this._editableCompartment, this._editableExtension());
			}
			if (changed.has('wrap')) {
				this.reconfigure(this._wrapCompartment, this.wrap ? EditorView.lineWrapping : []);
			}
			if (changed.has('placeholder')) {
				this.reconfigure(this._placeholderCompartment, this._placeholderExtension());
			}
			if (changed.has('accessibleLabel') || changed.has('inputId')) {
				this.reconfigure(this._attrsCompartment, this._attrsExtension());
			}
			if (changed.has('noSpellcheck')) {
				this.reconfigure(this._spellcheckCompartment, this.noSpellcheck ? [] : spellcheck());
				this._redrawForSpellcheck();
			}
			if (changed.has('annotations') || changed.has('annotatable')) {
				this._syncAnnotations();
			}
		}
		this._checkAccessibleLabel();
	}

	private _syncAnnotations(): void {
		// Annotations only render when the consumer opts in via `annotatable`.
		// addToHistory:false keeps this consumer-driven re-anchoring (and the sentinel
		// changes the filter appends) out of the text-edit undo stack — otherwise the
		// first undo after load would strip the annotations instead of a real edit.
		this.view?.dispatch({
			effects: setAnnotations.of(this.annotatable ? this.annotations : []),
			annotations: Transaction.addToHistory.of(false),
		});
	}

	// Two-step mention deletion: select the token on the first key, remove on the
	// second. dir -1 = Backspace (token ends at the caret), +1 = Delete (starts).
	private _selectMentionBeforeDelete(view: EditorView, dir: -1 | 1): boolean {
		const sel = view.state.selection.main;
		// A non-empty selection (e.g. an already-selected mention) → let the default
		// command delete it.
		if (!sel.empty) return false;
		const range =
			dir < 0 ? mentionRangeEndingAt(view.state, sel.head) : mentionRangeStartingAt(view.state, sel.head);
		if (!range) return false; // not next to a mention → normal backspace/delete
		view.dispatch({ selection: { anchor: range.from, head: range.to } });
		return true;
	}


	/* # Headless command API */

	toggleBold(): void {
		if (this.view) toggleInlineWrap(this.view, '**', 'StrongEmphasis');
	}

	toggleItalic(): void {
		if (this.view) toggleInlineWrap(this.view, '*', 'Emphasis');
	}

	toggleInlineCode(): void {
		if (this.view) toggleInlineWrap(this.view, '`', 'InlineCode');
	}

	toggleStrikethrough(): void {
		if (this.view) toggleInlineWrap(this.view, '~~', 'Strikethrough');
	}

	toggleHeading(level: HeadingLevel): void {
		if (this.view) cmToggleHeading(this.view, level);
	}

	/** Set the block to a heading level (0 = paragraph) without toggling — for a
	 *  picker where choosing a level always applies it. */
	setHeading(level: HeadingLevel): void {
		if (this.view) cmSetHeading(this.view, level);
	}

	toggleBulletList(): void {
		if (this.view) cmToggleBulletList(this.view);
	}

	/** Turn the selected lines into GFM task items (`- [ ] `), or back into
	 *  bullets when they all are tasks. Checking a box is not a command. */
	toggleTaskList(): void {
		if (this.view) cmToggleTaskList(this.view);
	}

	/** Set the list type, replacing any existing list ('none' strips it) — for an
	 *  exclusive list picker. A task keeps its checkbox only within its own type:
	 *  switching to bullet or ordered takes the box along with the marker. */
	setList(type: ListType): void {
		if (this.view) cmSetList(this.view, type);
	}

	toggleQuote(): void {
		if (this.view) cmToggleQuote(this.view);
	}

	toggleLink(href = ''): void {
		if (this.view) cmToggleLink(this.view, href);
	}

	toggleCodeBlock(): void {
		if (this.view) cmToggleCodeBlock(this.view);
	}

	/** Nest the selected list item(s) under the preceding item at the same level.
	 *  Only list items move, and only as far as that parent's content column — so a
	 *  first or standalone item can't be over-indented into an indented code block. */
	indent(): void {
		if (this.view) cmIndentListItems(this.view);
	}

	/** Un-nest the selected list item(s) by one level — the inverse of indent(). */
	outdent(): void {
		if (this.view) cmOutdentListItems(this.view);
	}

	/** Undo the last change. History is built in, so Cmd/Ctrl+Z works too. */
	undo(): void {
		if (this.view) {
			cmUndo(this.view);
			this.view.focus();
		}
	}

	/** Redo the last undone change (Cmd/Ctrl+Shift+Z / Ctrl+Y also work). */
	redo(): void {
		if (this.view) {
			cmRedo(this.view);
			this.view.focus();
		}
	}

	/** Drop the undo/redo history, leaving the document untouched. Use after a
	 *  consumer-driven discard so a later undo can't step back into the
	 *  thrown-away edits. Reconfiguring the history compartment off and back on
	 *  re-initializes it with empty stacks. */
	clearHistory(): void {
		const view = this.view;
		if (!view) return;
		view.dispatch({ effects: this._historyCompartment.reconfigure([]) });
		view.dispatch({ effects: this._historyCompartment.reconfigure(history()) });
		this._emitState();
	}

	/** Text and annotations of the last cut, so a same-editor paste can move the
	 *  annotations along with their text. Cleared by copy and by a matching paste. */
	private _cutBuffer: { text: string; anns: { id: string; from: number; to: number }[] } | null = null;

	/** The annotations lying fully inside the current selection, offset relative to
	 *  the selection's clean start. */
	private _annotationsInSelection(): { id: string; from: number; to: number }[] {
		if (!this.view) return [];
		const { from, to } = this.view.state.selection.main;
		const doc = this.view.state.doc.toString();
		const cleanFrom = docToClean(doc, from);
		const cleanTo = docToClean(doc, to);
		return currentAnnotations(this.view.state)
			.filter((a) => a.from >= cleanFrom && a.to <= cleanTo)
			.map((a) => ({ id: a.id, from: a.from - cleanFrom, to: a.to - cleanFrom }));
	}

	/** Copy the current selection to the clipboard, sentinel-free. No-op when the
	 *  selection is empty or the clipboard is unavailable (e.g. permission denied). */
	async copy(): Promise<void> {
		if (!this.view) return;
		const { from, to } = this.view.state.selection.main;
		if (from === to) return;
		const text = stripSentinels(this.view.state.sliceDoc(from, to));
		// A copy is a plain-text copy: forget any pending cut so its annotations don't
		// bleed onto the next paste.
		this._cutBuffer = null;
		try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked */ }
		// The await can outlive the element (disconnect destroys the view), so guard.
		this.view?.focus();
	}

	/** Cut the current selection to the clipboard and remove it from the document.
	 *  Its annotations are remembered so a paste back into this editor moves them
	 *  along. No-op when the selection is empty. */
	async cut(): Promise<void> {
		// Cut mutates (it removes the selection), so it's a no-op on a read-only editor.
		if (!this.view || this.view.state.readOnly) return;
		const { from, to } = this.view.state.selection.main;
		if (from === to) return;
		const text = stripSentinels(this.view.state.sliceDoc(from, to));
		this._cutBuffer = { text, anns: this._annotationsInSelection() };
		try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked */ }
		if (!this.view) return;
		this.view.dispatch(this.view.state.replaceSelection(''));
		this.view.focus();
	}

	/** Paste clipboard text at the caret, replacing any selection. Sentinels that
	 *  rode in from another editor are stripped. When the text matches a cut made in
	 *  this editor, its annotations travel with it (a move); otherwise it's plain
	 *  text. No-op when the clipboard is empty or unreadable. */
	async paste(): Promise<void> {
		if (!this.view) return;
		let raw: string;
		try { raw = await navigator.clipboard.readText(); } catch { return; /* clipboard blocked */ }
		this._pasteText(stripSentinels(raw));
		this.view?.focus();
	}

	/** Puts `text` at the caret, in place of the selection when there is one, and
	 *  leaves the caret after it, with focus on the editor. Plain text: markdown
	 *  in it stays as written and is styled like anything typed. Does nothing on
	 *  a read-only editor. */
	insertAtCursor(text: string): void {
		if (!this.view || this.view.state.readOnly) return;
		const clean = stripSentinels(text);
		if (clean) this.view.dispatch({ ...this.view.state.replaceSelection(clean), userEvent: 'input' });
		this.view.focus();
	}

	/** Replaces the text between two offsets with `text`, and leaves the caret
	 *  after it. The offsets are CLEAN, the same coordinates `getSelection()` and
	 *  the annotations speak, so a consumer can act on what it read there. Both
	 *  are clamped into the text, and `to` below `from` counts as an insert at
	 *  `from`. Does nothing on a read-only editor. */
	replaceRange(from: number, to: number, text: string): void {
		if (!this.view || this.view.state.readOnly) return;
		const doc = this.view.state.doc.toString();
		const sentinels = sentinelPositions(doc);
		const cleanLength = doc.length - sentinels.length;
		const start = Math.max(0, Math.min(from, cleanLength));
		const end = Math.max(start, Math.min(to, cleanLength));
		const insert = stripSentinels(text);
		const docFrom = cleanToDoc(sentinels, start);
		const docTo = cleanToDoc(sentinels, end);
		this.view.dispatch({
			changes: { from: docFrom, to: docTo, insert },
			selection: { anchor: docFrom + insert.length },
			userEvent: 'input',
		});
		this.view.focus();
	}

	/** Insert `text` at the selection, re-attaching the cut annotations when it matches
	 *  a cut made in this editor (a move, one-shot). Shared by the toolbar's paste()
	 *  and the native Cmd/Ctrl+V handler. */
	private _pasteText(text: string): void {
		// Paste mutates; refuse it on a read-only editor (covers the toolbar paste()
		// and the native Cmd/Ctrl+V handler that both funnel through here).
		if (!this.view || !text || this.view.state.readOnly) return;
		const buffer = this._cutBuffer;
		// Normalize line endings on both sides: a Windows/other-app clipboard may hand
		// back CRLF where the cut buffer holds LF, and an exact compare would then miss
		// the match and silently drop the carried annotations.
		const sameText = (a: string, b: string): boolean => a.replace(/\r\n/g, '\n') === b.replace(/\r\n/g, '\n');
		const carry = !!(buffer && sameText(buffer.text, text) && buffer.anns.length > 0);
		const at = docToClean(this.view.state.doc.toString(), this.view.state.selection.main.from);
		// input.paste, like CodeMirror's own paste: history groups it as one step and
		// a transaction filter can tell a paste from typing.
		const spec = { ...this.view.state.replaceSelection(text), userEvent: 'input.paste' };
		this.view.dispatch(carry ? { ...spec, effects: pasteAnnotations.of({ at, anns: buffer!.anns }) } : spec);
		// One-shot: a second paste of the same cut would duplicate the ids, so drop it.
		if (carry) this._cutBuffer = null;
	}

	/** Escape hatch: run a command by name, so a toolbar can carry the name in its
	 *  markup instead of a method reference. Every method above is reachable.
	 *
	 *  Toggles (no payload): `bold`, `italic`, `inlineCode`, `strikethrough`,
	 *  `bulletList`, `taskList`, `quote`, `codeBlock`, `heading` (payload: the
	 *  level, default 1), `link` (payload: the href).
	 *  Setters: `setHeading` (payload: the level, 0 for a paragraph), `setList`
	 *  (payload: 'none' | 'bullet' | 'ordered' | 'task').
	 *  The rest: `indent`, `outdent`, `undo`, `redo`, `copy`, `cut`, `paste`.
	 *
	 *  An unknown name warns rather than doing nothing quietly: a typo in a
	 *  toolbar is otherwise invisible. */
	runCommand(name: string, payload?: unknown): void {
		const level = (fallback: HeadingLevel): HeadingLevel => (typeof payload === 'number' ? payload : fallback) as HeadingLevel;
		switch (name) {
			case 'bold': this.toggleBold(); break;
			case 'italic': this.toggleItalic(); break;
			case 'inlineCode': this.toggleInlineCode(); break;
			case 'strikethrough': this.toggleStrikethrough(); break;
			case 'bulletList': this.toggleBulletList(); break;
			case 'taskList': this.toggleTaskList(); break;
			case 'quote': this.toggleQuote(); break;
			case 'codeBlock': this.toggleCodeBlock(); break;
			case 'heading': this.toggleHeading(level(1)); break;
			case 'setHeading': this.setHeading(level(0)); break;
			case 'setList': this.setList(typeof payload === 'string' ? payload as ListType : 'none'); break;
			case 'link': this.toggleLink(typeof payload === 'string' ? payload : ''); break;
			case 'indent': this.indent(); break;
			case 'outdent': this.outdent(); break;
			case 'undo': this.undo(); break;
			case 'redo': this.redo(); break;
			case 'copy': void this.copy(); break;
			case 'cut': void this.cut(); break;
			case 'paste': void this.paste(); break;
			default: console.warn(`<nldd-text-editor>: runCommand('${name}') is not a command.`);
		}
	}

	/** The formats active at the current selection (drives a toolbar's state). */
	getState(): TextEditorState {
		return {
			active: this.view ? readActiveFormats(this.view) : { ...EMPTY_FORMATS },
			empty: this.view ? this.view.state.selection.main.empty : true,
			canIndent: this.view ? cmCanIndent(this.view) : false,
			canOutdent: this.view ? cmCanOutdent(this.view) : false,
			canUndo: this.view ? undoDepth(this.view.state) > 0 : false,
			canRedo: this.view ? redoDepth(this.view.state) > 0 : false,
		};
	}

	/** The current selection in CLEAN (annotation-sentinel-free) coordinates plus
	 *  the quoted text — the anchor a consumer needs to attach a new annotation to
	 *  the selection (e.g. from a toolbar "comment" button). `empty` mirrors
	 *  getState().empty for gating that button.
	 *
	 *  `rect` is the selection's bounding box in viewport coordinates (or the
	 *  caret box when empty), so a consumer can anchor a popover to the selected
	 *  text itself instead of to its own button. Use it as a Floating UI virtual
	 *  anchor: `{ getBoundingClientRect: () => rect, contextElement: editorEl }`.
	 *  It is computed from CodeMirror's layout, so it is correct even when the
	 *  editor is not focused (clicking a toolbar button blurs the editor but the
	 *  selection state survives). `null` when there is no view or the selection
	 *  is scrolled out of sight. */
	getSelection(): { start: number; end: number; quote: string; empty: boolean; rect: DOMRect | null } {
		const view = this.view;
		if (!view) return { start: 0, end: 0, quote: '', empty: true, rect: null };
		const doc = view.state.doc.toString();
		const sel = view.state.selection.main;
		const start = docToClean(doc, sel.from);
		const end = docToClean(doc, sel.to);
		const a = view.coordsAtPos(sel.from);
		const b = view.coordsAtPos(sel.to);
		const rect =
			a && b
				? new DOMRect(
						Math.min(a.left, b.left),
						Math.min(a.top, b.top),
						Math.max(a.right, b.right) - Math.min(a.left, b.left),
						Math.max(a.bottom, b.bottom) - Math.min(a.top, b.top),
					)
				: null;
		return { start, end, quote: stripSentinels(doc).slice(start, end), empty: sel.empty, rect };
	}

	/** The annotations currently in the editor, in CLEAN coordinates, each quote
	 *  re-sliced from the current text — so a consumer can persist positions that
	 *  moved with edits (read this on save, then write the anchors back). */
	getAnnotations(): Annotation[] {
		const view = this.view;
		if (!view) return [];
		const clean = stripSentinels(view.state.doc.toString());
		return currentAnnotations(view.state).map((a) => ({
			id: a.id,
			start: a.from,
			end: a.to,
			quote: clean.slice(a.from, a.to),
		}));
	}

	/** The last state handed out, to keep from repeating it. The event drives a
	 *  toolbar's toggles, and moving the caret within one paragraph leaves every
	 *  one of them where it was: a consumer would re-render its whole bar on every
	 *  arrow key for nothing. */
	private _lastState: TextEditorState | null = null;

	private _emitState(): void {
		const state = this.getState();
		const last = this._lastState;
		if (
			last
			&& last.empty === state.empty
			&& last.canIndent === state.canIndent
			&& last.canOutdent === state.canOutdent
			&& last.canUndo === state.canUndo
			&& last.canRedo === state.canRedo
			&& (Object.keys(state.active) as (keyof TextEditorActiveFormats)[]).every((key) => last.active[key] === state.active[key])
		) return;
		this._lastState = state;
		this.dispatchEvent(new CustomEvent('nldd-text-editor-state', {
			detail: state,
			bubbles: true,
			composed: true,
		}));
	}

	private _typeaheadLists(): Typeahead[] {
		return this.mentionSource ? [this._mentionTypeahead, ...this.typeaheads] : this.typeaheads;
	}

	/** A choice from any list. Offsets in the events are clean, like
	 *  getSelection() and the annotations: the document carries sentinels the
	 *  value never shows. */
	private _onTypeaheadChosen(choice: TypeaheadChoice): void {
		if (!this.view) return;
		const doc = this.view.state.doc.toString();
		const from = docToClean(doc, choice.from);
		if (choice.typeahead === this._mentionTypeahead) {
			const { id, text } = choice.candidate;
			this._emitMention({ id, text, from, to: from + mentionToken(choice.candidate).length });
			return;
		}
		this.dispatchEvent(new CustomEvent('nldd-text-editor-typeahead', {
			detail: { trigger: choice.trigger, candidate: choice.candidate, from, to: docToClean(doc, choice.to) },
			bubbles: true,
			composed: true,
		}));
	}

	private _emitMention(detail: MentionInsertedDetail): void {
		this.dispatchEvent(new CustomEvent('nldd-text-editor-mention', {
			detail,
			bubbles: true,
			composed: true,
		}));
	}


	/* # Internals */

	private _onScrollerPointerDown = (event: PointerEvent): void => {
		if (event.target !== this.view?.scrollDOM) return;
		// No caret to move on a read-only/disabled view — leave the press alone, like
		// the drag path (which early-returns on state.readOnly).
		if (this.view.state.readOnly) return;
		this.focusFromPoint(event.clientX, event.clientY);
		event.preventDefault();
	};

	private _onMentionPointerDown = (event: PointerEvent): void => {
		const token = (event.target as HTMLElement | null)?.closest?.('.cm-md-mention-token');
		if (!token || !this.view) return;
		// Don't dispatch a selection on a read-only/disabled view — matches the drag
		// path, which guards its selection change on state.readOnly.
		if (this.view.state.readOnly) return;
		const range = mentionRangeAt(this.view.state, this.view.posAtDOM(token));
		if (!range) return;
		event.preventDefault();
		event.stopPropagation();
		this.view.dispatch({ selection: { anchor: range.from, head: range.to } });
		this.view.focus();
		// Hand off to the drag machinery: a plain release keeps the mention selected,
		// dragging past the threshold moves the whole token. Left button, no modifiers.
		if (event.button === 0 && !event.shiftKey && !event.altKey && !event.metaKey && !event.ctrlKey) {
			this.view.plugin(dragMovePlugin)?.startFor(event, range.from, range.to);
		}
	};

	/** A click on an annotation's count badge emits nldd-text-editor-annotation-click
	 *  with the id(s) it covers (a merged badge carries several) and the badge's
	 *  viewport rect, so the consumer can anchor its own note UI to the badge. The
	 *  tinted text stays plain-clickable for caret placement. */
	private _onAnnotationBadgeClick = (event: MouseEvent): void => {
		const badge = (event.target as HTMLElement | null)?.closest?.('.cm-annotation-badge') as HTMLElement | null;
		if (!badge) return;
		const ids = (badge.dataset.annotations ?? '').split(' ').filter(Boolean);
		if (!ids.length) return;
		event.preventDefault();
		this.dispatchEvent(new CustomEvent('nldd-text-editor-annotation-click', {
			detail: { ids, rect: badge.getBoundingClientRect() },
			bubbles: true,
			composed: true,
		}));
	};

	private _onDocChanged(): void {
		// The document carries annotation sentinels; the exposed value never does.
		const text = stripSentinels(this.doc);
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

	private _checkAccessibleLabel(): void {
		if (this._accessibleLabelWarned) return;
		if (this.accessibleLabel || this.inputId) return;
		this._accessibleLabelWarned = true;
		console.warn('<nldd-text-editor>: No accessible-label or input-id provided. Use nldd-form-field for labeled usage, or set accessible-label for screen reader accessibility (WCAG SC 4.1.2).');
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
		return textEditorTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-text-editor': NLDDTextEditor;
	}
}
