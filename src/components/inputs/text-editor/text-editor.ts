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
 * bound out of the box.
 *
 * With `syntax="hidden"` a task item (`- [ ]`, `- [x]`) reads as a box in the
 * place of its bullet, and like every other mark shows its markdown on the line
 * the caret is on. A click on the box checks or unchecks it without moving the
 * caret. Cmd/Ctrl+Enter does the same for the tasks on the lines of the
 * selection, in both syntax modes. The box is no tab stop: Tab leaves the
 * editor. A screen reader reads "Taak, open" or "Taak, afgerond" in its place.
 *
 * A code block that names its language after the backticks is highlighted in
 * it, as in nldd-code-viewer; the grammar loads with the first such block. Its
 * opening line is the head of the block, with a "Kopieer" button at the right
 * edge that copies the code without its fences and says "Gekopieerd" or
 * "Kopiëren mislukt", as the code viewer does. In an editable editor the button
 * is no tab stop (select and copy is the keyboard route); read-only or disabled
 * it can be focused. Without a secure context there is no button. Commands keep focus on the editor. An inline toggle wraps
 * the selected text (whitespace at its edges stays outside the markers), unwraps
 * a run the caret is in, and with the caret at the very end of a run steps out
 * of it. Bold that a typed space has broken (`**woord **`) keeps its styling
 * while the caret is inside; the space moves outside the markers when the caret
 * leaves. insertAtCursor(text) puts text at the caret and replaceRange(from, to,
 * text) writes at the same clean offsets getSelection() reads. An @-mention typeahead
 * (mentionSource) collapses to an atomic token, further typeahead lists on their
 * own trigger (typeaheads) write what you tell them to, and a W3C-style annotation overlay
 * (annotations) marks ranges with a light tint and a count badge without touching
 * the underlying text.
 *
 * To show the value, render the markdown into nldd-rich-text, which uses the
 * same type, bold and code as the editor. A mention is stored as
 * `[@Name](user:id)`: turn it into `<a href="…" data-mention>Name</a>` (or a
 * `span` when there is no page for the person), without the `@`. A link reads
 * as the same token there; a span keeps the color and the icon without the tint.
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
 * @attr {string} syntax - 'visible' (default): every formatting mark stays in view, dimmed, a bullet as the character you typed (`-`, `*` or `+`). 'hidden': the marks of bold, italic, strikethrough, inline code, links and the `#` of a heading are hidden and come back where the caret or the selection touches that construct, so the text reads closer to the result while what you edit is still the markdown. A bullet reads as a dot, and shows its character on the line the caret is on. A quote reads as a line on the left; with the caret anywhere in it, its `>` marks show instead, in the same place. A `---` line reads as a divider until the caret is on it, and a code block loses its closing ``` line until the caret is in it, since its own tint and edge already say what it is. Its opening line stays as the head of the block, with only the backticks hidden: the language as a label on the left, the copy button on the right. The numbers of a numbered list stay, in the color of the text: they are content. Read-only and disabled hide every mark, which makes a clean read view. The value is plain markdown either way.
 * @attr {string} accessible-label - Accessible label forwarded to the editor. Set automatically by nldd-form-field.
 *
 * @prop {MentionSource} mentionSource - Consumer-supplied @-mention candidate source (property only). Without it, @-typeahead is inert.
 * @prop {string} mentionQuery - What may follow the `@` of a mention, as a regular expression source (property only). Default: letters with any accent, digits, `_`, `.`, `+` and `-`. Allow one space to search on a full name, as in `@sam jansen`.
 * @prop {Function} mentionEmptyText - What to say when the @-list has no candidates, called with the typed query (property only). Without it the list says "Typ om te zoeken" or "Niets gevonden", both translatable. Return null to close the list without a word.
 * @prop {Typeahead[]} typeaheads - Your own typeahead lists next to the @-mention (property only): each a trigger character (`#`, `:`, `/`), a `source` that returns candidates for the text typed after it, an optional `query` (a regular expression for what may follow the trigger, such as a space in a full name), an optional `emptyText` (what to say when there are no candidates, instead of the translated default) and an optional `insert` that decides what a choice writes (by default the trigger, the text and a space). Lists on one trigger are merged in order. A candidate is `{ id, text, supportingText? }` and can carry an `avatar` (its row then takes two lines, the supporting text under the text), an `icon` or a `symbol` for its row.
 * @attr {boolean} annotatable - Enable the annotation overlay (off by default). Annotations only render when this is set.
 * @prop {Annotation[]} annotations - Consumer-supplied annotation overlay (property only). Anchored by offset and mapped through edits; the text stays clean. Requires `annotatable`. Assign a NEW array to apply changes (Lit dirty-checks by identity, so in-place mutation like `.push()` won't re-render): `editor.annotations = [...editor.annotations, next]`.
 * @attr {object} translations - Override the editor's assistive-tech strings (the open-in-new-tab link badge, the annotation count badge, the label of a task's box and the copy button of a code block). Unset keys fall back to Dutch.
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
import { type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { EditorView, drawSelection, dropCursor } from '@codemirror/view';
import { Compartment, Prec, Transaction, type Extension } from '@codemirror/state';
import { history, undo as cmUndo, redo as cmRedo, undoDepth, redoDepth } from '@codemirror/commands';
import { NLDDCodeMirrorInput } from '../../../utilities/codemirror/codemirror-input.js';
import { nlddCodeMirrorTheme } from '../../../utilities/codemirror/theme.js';
import { markdownEditing } from './text-editor.markdown.js';
import { mentionInsert, mentionToken, mentionRangeAt } from './text-editor.mention.js';
import {
	hasInvalidQuery,
	typeaheads as typeaheadExtension,
	type MentionSource,
	type MentionInsertedDetail,
	type Typeahead,
	type TypeaheadChoice,
} from './text-editor.mentions.js';
import { repairHeldEmphasis } from './text-editor.emphasis.js';
import { spellcheck } from './text-editor.spellcheck.js';
import { annotations as annotationExtension, setAnnotations, currentAnnotations, type Annotation } from './text-editor.annotations.js';
import { AnnotationClipboard } from './text-editor.clipboard.js';
import { textEditorKeymap } from './text-editor.keymap.js';
import { orderedListRenumber } from './text-editor.ordered-list.js';
import { dragToMove, dragMovePlugin } from './text-editor.drag.js';
import { linkOpenBadge } from './text-editor.links.js';
import { stableCursor } from './text-editor.cursor.js';
import { focusSelectionGuard } from './text-editor.focus-selection.js';
import { hiddenSyntax } from './text-editor.hidden-syntax.js';
import { lineHighSelection } from './text-editor.selection.js';
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
import { translate } from '../../../utilities/translations.js';
import { tasks } from './text-editor.tasks.js';
import { codeCopy } from './text-editor.code-copy.js';
import { setState } from '../../../utilities/element-state.js';

export type ResizeMode = 'none' | 'vertical' | 'auto';
export type TextEditorAppearance = 'input-field' | 'simple';
export type TextEditorSyntax = 'visible' | 'hidden';
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
export class NLDDTextEditor extends NLDDCodeMirrorInput {

	static override styles = textEditorStyles;

	/** Turns spellchecking off. On by default, without code, URLs and mentions. */
	@property({ type: Boolean, reflect: true, attribute: 'no-spellcheck' })
	noSpellcheck = false;

	@property({ type: Boolean, reflect: true })
	wrap = true;

	@property({ reflect: true, converter: reflectNonDefault<ResizeMode>('auto') })
	resize: ResizeMode = 'auto';

	@property({ reflect: true, converter: reflectNonDefault<TextEditorAppearance>('simple') })
	appearance: TextEditorAppearance = 'simple';

	@property({ reflect: true, converter: reflectNonDefault<TextEditorSyntax>('visible') })
	syntax: TextEditorSyntax = 'visible';

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

	protected readonly rowsProperty = '--_text-editor-rows';

	private _wrapCompartment = new Compartment();
	private _spellcheckCompartment = new Compartment();
	private _historyCompartment = new Compartment();
	private _syntaxCompartment = new Compartment();

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
			'components.text-editor.task-open-label',
			'components.text-editor.task-done-label',
			'components.text-editor.code-copy-action',
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
			// A copy button on the head of each code block. See text-editor.code-copy.ts.
			codeCopy({
				copy: () => this._t('components.text-editor.code-copy-action'),
				success: () => this._t('components.text-editor.code-copy-success-text'),
				failure: () => this._t('components.text-editor.code-copy-failure-text'),
			}),
			// Checking a task by click and Cmd/Ctrl+Enter. See text-editor.tasks.ts.
			tasks({
				open: () => this._t('components.text-editor.task-open-label'),
				done: () => this._t('components.text-editor.task-done-label'),
			}),
			this._historyCompartment.of(history()),
			drawSelection(),
			// As tall as the line, like the tokens. See text-editor.selection.ts.
			lineHighSelection,
			// Draws the caret in drawSelection's place, on a side that does not depend on
			// the direction it arrived from unless that direction means something (a
			// widget, a line wrap). See text-editor.cursor.ts.
			stableCursor,
			// Safari can stretch the selection to the start when focus comes back
			// from a toolbar. See text-editor.focus-selection.ts.
			focusSelectionGuard(),
			dropCursor(),
			dragToMove,
			textEditorKeymap,
			...this.inputExtensions(),
			this._wrapCompartment.of(this.wrap ? EditorView.lineWrapping : []),
			this._spellcheckCompartment.of(this.noSpellcheck ? [] : spellcheck()),
			this._syntaxCompartment.of(this.syntax === 'hidden' ? hiddenSyntax() : []),
			EditorView.updateListener.of((u) => {
				if (u.docChanged || u.selectionSet) this._emitState();
			}),
			EditorView.domEventHandlers({
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
					this._clipboard.rememberCut(view);
					return false; // let CodeMirror perform the actual cut (clipboard + delete)
				},
				copy: () => {
					this._clipboard.forget();
					return false;
				},
				paste: (event, view) => {
					const raw = event.clipboardData?.getData('text/plain');
					if (raw === undefined) return false; // no clipboard data — let CodeMirror handle it
					this._clipboard.paste(view, raw);
					event.preventDefault();
					return true;
				},
			}),
		];
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

	// Autocorrect and autocapitalize follow the user's own settings, as on an
	// <input> or a <textarea>, also with no-spellcheck: CodeMirror's "off" is
	// not what a text field does. And with them off, CodeMirror turns the
	// period macOS puts after a double space back into a space by writing the
	// line anew, which cost the spelling marks on it.
	protected override contentAttributes(): Record<string, string> {
		return { autocorrect: 'on', autocapitalize: 'sentences' };
	}

	/** The document carries annotation sentinels; the value never does. A value
	 *  that carries one (text round-tripped through another editor) hands it
	 *  back stripped, too. */
	protected override docToValue(doc: string): string {
		return stripSentinels(doc);
	}

	/** An emphasis held together while it was being typed is closed properly
	 *  first, so the committed value renders the way it looked. */
	protected override beforeChangeCheck(view: EditorView): void {
		repairHeldEmphasis(view);
	}

	/* Runs on the initial mount and on every re-mount after a detach/reattach
	 * (e.g. Vue <KeepAlive>): the view — with its scroller and content DOM — is
	 * rebuilt, so the click forwarders and annotation state must be (re)applied. */
	protected override onEditorMounted(): void {
		super.onEditorMounted();
		// Clicking a mention selects the whole token (capture, to beat CM's own
		// caret placement).
		this.view?.contentDOM.addEventListener('pointerdown', this._onMentionPointerDown, true);
		// Clicking an annotation's count badge opens it (the consumer decides how);
		// the tinted text itself stays plain-clickable for caret placement.
		this.view?.contentDOM.addEventListener('click', this._onAnnotationBadgeClick);
		this._syncAnnotations();
		// Emit one state snapshot on mount so a consumer's toolbar initializes to the
		// real state (e.g. undo/redo disabled with no history yet) instead of its
		// default, without waiting for the first edit or selection change.
		this._emitState();
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (changed.has('typeaheads')) setState(this, 'invalid-typeahead-query', hasInvalidQuery(this.typeaheads));
		if (!this.view) return;
		// A render after setTranslations() or a new `translations`: the labels
		// drawn inside the document follow when their text changed.
		const labels = this._labelSignature();
		if (labels !== this._labels) {
			if (this._labels !== null) this.view.dispatch({ effects: relabel.of(null) });
			this._labels = labels;
		}
		if (changed.has('wrap')) {
			this.reconfigure(this._wrapCompartment, this.wrap ? EditorView.lineWrapping : []);
		}
		if (changed.has('syntax')) {
			this.reconfigure(this._syntaxCompartment, this.syntax === 'hidden' ? hiddenSyntax() : []);
		}
		if (changed.has('noSpellcheck')) {
			this.reconfigure(this._spellcheckCompartment, this.noSpellcheck ? [] : spellcheck());
			this._redrawForSpellcheck();
		}
		if (changed.has('annotations') || changed.has('annotatable')) {
			this._syncAnnotations();
		}
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

	/** Carries the annotations of a cut along to a paste of the same text. */
	private _clipboard = new AnnotationClipboard();

	/** Copy the current selection to the clipboard, sentinel-free. No-op when the
	 *  selection is empty or the clipboard is unavailable (e.g. permission denied). */
	async copy(): Promise<void> {
		if (!this.view) return;
		if (this.view.state.selection.main.empty) return;
		const text = this._clipboard.selectedText(this.view);
		this._clipboard.forget();
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
		if (this.view.state.selection.main.empty) return;
		const text = this._clipboard.selectedText(this.view);
		this._clipboard.rememberCut(this.view);
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
		if (this.view) this._clipboard.paste(this.view, raw);
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
			default: setState(this, 'unknown-command', true);
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

	override render() {
		return textEditorTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-text-editor': NLDDTextEditor;
	}
}
