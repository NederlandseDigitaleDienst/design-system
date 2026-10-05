/**
 * Nederlandse Digitale Dienst Token Field Component (Lit + TypeScript)
 *
 * A multi-select input that looks like a normal input field: chosen values show
 * as dismissible tokens in a wrapping row, followed by an inline text input that
 * stretches to fill the remaining space and wraps to a new line (growing the
 * field) when it no longer fits. Options are supplied as a slotted nldd-menu,
 * exactly like nldd-combo-box; the menu filters as you type, with a chevron picker
 * button, arrow-key roving across the tokens and ElementInternals form participation.
 *
 * Options can arrive after the keystroke, from a server you query per
 * keystroke. Slot them into the menu when they come in: if the user is still
 * in the field and the keystroke found nothing to show, the menu opens then.
 * After Escape, or once the user left the field, it stays shut.
 *
 * @element nldd-token-field
 * @attr {string} values - Initial token values as a comma-separated string (e.g. "nl, be, de"). Not reflected; the live value is the `.values` array property. Values can't contain commas.
 * @attr {string} placeholder - Placeholder shown in the input
 * @attr {string} type - Input type forwarded to the inner input (e.g. 'email')
 * @attr {string} autocomplete - Autocomplete hint forwarded to the inner input
 * @attr {string} accessible-label - Accessible label forwarded as aria-label to the input
 * @attr {boolean} allow-custom - Allow free-typed values (not just menu options). Typing an option's label in full adds that option, with its value, ignoring case and the spaces around it; with two such labels, the first one.
 * @attr {boolean} no-filter - Leaves the options as they are while typing, for a list your server already filtered per keystroke. Without it the field hides options that do not contain the typed text, which also hides a server match on, say, an e-mail address.
 * @attr {boolean} valid - Marks the field valid (shows the valid icon)
 * @attr {boolean} invalid - Marks the field invalid (shows the invalid icon)
 * @attr {boolean} no-spellcheck - Disables browser spellchecking on the inner input
 * @attr {boolean} readonly - Readonly: static tokens, no input/picker, read-only surface
 * @attr {boolean} required - Marks the field required (invalid when it has no tokens)
 * @attr {boolean} disabled - Disabled state
 * @attr {string} token-control - Trailing control per token: 'dismiss' (default, a ✕ that removes it) or 'menu' (a ⌄ opening a per-token action menu supplied by the template prototypes)
 * @attr {string} name - Name for form submission
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @slot - An nldd-menu with nldd-menu-item options; each item's `value`/`text` supplies a token's value and its display label.
 * @slot template - `nldd-token` prototypes supplying each token's action menu when token-control="menu": a keyless one is the shared default, a `data-value="X"` one overrides value X. Only the prototype's nested `nldd-menu` is used today; its other props are ignored.
 *
 * @fires change - When the selected values change; detail: { values: string[] }
 * @fires input - When the input text changes; detail: { value: string }
 * @fires token-action - When a token's menu action is chosen (token-control="menu"); detail: { value: string, action: string }
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { tokenFieldStyles } from './token-field.styles.js';
import { tokenFieldTemplate } from './token-field.template.js';
import { nlddTokenFieldTranslations, type NLDDTokenFieldTranslations } from './token-field.i18n.js';
import type { NLDDMenu, NLDDMenuItem } from '../../actions/menu/menu.js';
import '../../actions/menu/menu.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { translate } from '../../../utilities/translations.js';

/** Trailing control rendered on each token. */
export type TokenFieldControl = 'dismiss' | 'menu';

@customElement('nldd-token-field')
export class NLDDTokenField extends DescribedBy(FormAssociated(LitElement)) {

	static override styles = tokenFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	/** Counts for the implicit-submission rule: a single-line field where Enter
	 *  would submit the form. See utilities/implicit-submission.ts. */
	static blocksImplicitSubmission = true;

	private _initialValues: string[] = [];

	// Property order matches the story controls (values kept high, above
	// placeholder, per the text-field convention). No `size` axis yet — the field
	// is md-only for now; a sm variant lands later.
	/** Selected token values. The attribute is a comma-separated string used to seed
	 *  the initial values (like native `<input value>`); it is not reflected, so the
	 *  live source is always the `.values` array property. Values can't contain
	 *  commas — set those via the property. */
	@property({
		converter: {
			fromAttribute: (value: string | null): string[] =>
				value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [],
			toAttribute: (): null => null,
		},
	})
	get values(): string[] {
		return this._values;
	}

	set values(next: string[]) {
		// A multi-select holds a *set* of values. Dedupe on every assignment so the
		// keyed token render can never get a duplicate key (which silently drops a
		// token) and the submitted form value stays one entry per value.
		const unique = next ? next.filter((v, i) => next.indexOf(v) === i) : [];
		const old = this._values;
		this._values = unique;
		this.requestUpdate('values', old);
	}

	private _values: string[] = [];

	@property({ type: String })
	placeholder = '';

	/** Input type forwarded to the inner input (e.g. 'email' for the right mobile
	 *  keyboard). Values are still handled as plain strings. */
	@property({ type: String })
	type = 'text';

	@property({ type: String })
	autocomplete = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** Allow committing free-typed values (not just menu options): a typed value
	 *  becomes a token on Enter, a trailing comma, or blur. Also governs whether
	 *  the input stays visible when no options remain. */
	@property({ type: Boolean, reflect: true, attribute: 'allow-custom' })
	allowCustom = false;

	/** Leaves the options as they are while typing: the list was filtered already, by a server. */
	@property({ type: Boolean, reflect: true, attribute: 'no-filter' })
	noFilter = false;

	@property({ type: Boolean, reflect: true })
	valid = false;

	@property({ type: Boolean, reflect: true })
	invalid = false;

	@property({ type: Boolean, reflect: true, attribute: 'no-spellcheck' })
	noSpellcheck = false;

	/** Readonly: shows the tokens as static (no dismiss control, no input, no
	 *  picker) with the read-only surface treatment. */
	@property({ type: Boolean, reflect: true })
	readonly = false;

	@property({ type: Boolean, reflect: true })
	required = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	/** Trailing control on each token: 'dismiss' shows a ✕ that removes it; 'menu'
	 *  shows a ⌄ that opens a per-token action menu built from the `token-menu`
	 *  template. Choosing an action fires `token-action` for the app to handle. */
	@property({ attribute: 'token-control' })
	tokenControl: TokenFieldControl = 'dismiss';

	@property({ type: String })
	name = '';

	@property({ type: Object })
	translations: Partial<NLDDTokenFieldTranslations> = {};

	/** The current text in the inline input; drives the menu filter. */
	@state()
	_text = '';

	/** Whether the option menu is currently open (drives aria-expanded). */
	@state()
	_isOpen = false;

	/** ID of the highlighted menu item, mirrored to aria-activedescendant. */
	@state()
	_highlightedId = '';

	/** Which token carries the roving tabindex — the token group's single tab stop
	 *  when the input is hidden (all values in, no custom, no options left). */
	@state()
	_rovingIndex = 0;

	private static _idCounter = 0;
	readonly _menuId = `nldd-token-field-menu-${NLDDTokenField._idCounter++}`;

	private _menu: NLDDMenu | null = null;
	private _resizeObserver: ResizeObserver | null = null;
	/** Watches the slotted menu for options added/removed after the initial slot
	 *  change (e.g. a framework populating them asynchronously), so the field
	 *  re-evaluates whether to show the input/picker and re-resolves token labels. */
	private _menuObserver: MutationObserver | null = null;
	/** A keystroke wanted the menu open but there was nothing to show yet.
	 *  Options that arrive after it, from a server answering per keystroke,
	 *  open it then. Escape, leaving the field or opening the menu clear it. */
	private _openPending = false;
	/** Watches the light-DOM `[slot="template"]` prototypes for changes (menu items,
	 *  their attributes, or an added/removed prototype) and invalidates the cloned
	 *  per-token menus so they re-clone. These components run on live sites, not just
	 *  static demos, so the prototypes can change at runtime. */
	private _templateObserver: MutationObserver | null = null;
	/** True between a picker pointerdown-while-open and its trailing click, so the
	 *  click (which follows the native light-dismiss) doesn't reopen the menu. */
	private _pickerPointerdownWhileOpen = false;

	public _t(key: keyof NLDDTokenFieldTranslations): string {
		return translate(this.translations, nlddTokenFieldTranslations, key);
	}

	// — Lifecycle ————————————————————————————————————————————————————————————

	override connectedCallback(): void {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver(() => this._updateMenuWidth());
		this._resizeObserver.observe(this);
		window.addEventListener('scroll', this._handleScrollOrResize, true);
		window.addEventListener('resize', this._handleScrollOrResize);
		this.addEventListener('focusout', this._handleFocusOut);
		this._templateObserver = new MutationObserver((records) => this._onTemplateMutation(records));
		this._templateObserver.observe(this, {
			childList: true, subtree: true, attributes: true, characterData: true,
		});
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;
		this._menuObserver?.disconnect();
		this._menuObserver = null;
		this._templateObserver?.disconnect();
		this._templateObserver = null;
		window.removeEventListener('scroll', this._handleScrollOrResize, true);
		window.removeEventListener('resize', this._handleScrollOrResize);
		this.removeEventListener('focusout', this._handleFocusOut);
		if (this._menu) {
			this._menu.removeEventListener('toggle', this._handleMenuToggle);
			this._menu.removeEventListener('select', this._handleMenuSelect);
			this._menu.removeEventListener('keydown', this._handleMenuKeydown);
			this._menu = null;
		}
	}

	override firstUpdated(): void {
		this._initialValues = [...this.values];
		this.commitFormValue();
		// Give the host a lasting accessible name and grouping via ElementInternals.
		// The input carries aria-label, but it is removed when every value is chosen
		// (no custom, no options left) — exactly the state roving token navigation
		// makes a first-class tab stop — so without this the field would lose its name.
		this.internals.role = 'group';
		this.internals.ariaLabel = this.accessibleLabel || null;
	}

	/** The index a token was just removed from through a field interaction (its ✕, a
	 *  menu action the app handled, or Backspace/Delete). Set at the interaction — when
	 *  focus is still reliably in the field, unlike at willUpdate time after a closing
	 *  menu has moved it — and consumed in updated() to focus the token that shifted in
	 *  (or the input). Null for background/programmatic value changes. */
	private _removalFocusIndex: number | null = null;

	override willUpdate(changed: Map<string, unknown>): void {
		// React to a values change BEFORE render, so the reactive state this
		// touches (_highlightedId, via _syncMenuItems' active-descendant sync when
		// hiding a token's highlighted option moves the highlight) folds into this
		// same update. The identical work in updated() sets state after the update
		// completed, which trips Lit's change-in-update warning.
		//
		// A token added or removed changes which options are still available:
		// re-run the text filter (unhides options freed by a removed token) and
		// re-hide the ones now selected. Close the menu if nothing is left to add.
		if (changed.has('values')) {
			this._rovingIndex = Math.max(0, Math.min(this._rovingIndex, this.values.length - 1));
			for (const key of [...this._tokenMenuCache.keys()]) {
				if (!this.values.includes(key)) this._tokenMenuCache.delete(key);
			}
			this.commitFormValue();
			if (this._menu) {
				this._syncMenuItems();
				if (!this._showInput) this._closeMenu();
			}
		}
		if (changed.has('required')) this._updateValidity();
		if (changed.has('readonly') && this.readonly) this._closeMenu();
		if (changed.has('accessibleLabel')) this.internals.ariaLabel = this.accessibleLabel || null;
	}

	override updated(): void {
		// The input narrows/widens as tokens come and go; keep the open menu's
		// pinned width in step with it. This reads layout (getBoundingClientRect),
		// so it must run after render, not in willUpdate().
		if (this._isOpen) this._updateMenuWidth();

		// Keep focus in the field after a token was removed while it held focus.
		// Deferred past this update: _focusAfterRemoval sets _rovingIndex (to move the
		// roving tab stop), which must schedule its own update rather than mutate state
		// mid-update (Lit's change-in-update warning).
		if (this._removalFocusIndex !== null) {
			const index = this._removalFocusIndex;
			this._removalFocusIndex = null;
			void this.updateComplete.then(() => this._focusAfterRemoval(index));
		}
	}

	// — Form participation ————————————————————————————————————————————————————

	/** Submit one entry per value under `name` (like a multi-select), so a form
	 *  receives `name=value` repeated for each token. */
	override formValue(): FormValue {
		if (!this.name) return null;
		const data = new FormData();
		for (const value of this.values) data.append(this.name, value);
		return data;
	}

	override commitFormValue(): void {
		super.commitFormValue();
		this._updateValidity();
	}

	/** A required field with no tokens is invalid (valueMissing). */
	private _updateValidity(): void {
		if (this.required && this.values.length === 0) {
			this.internals.setValidity(
				{ valueMissing: true },
				this._t('components.token-field.required-error-text'),
				this._input ?? this,
			);
		} else {
			this.internals.setValidity({});
		}
	}

	formResetCallback(): void {
		this.values = [...this._initialValues];
	}


	private get _input(): HTMLInputElement | null {
		return this.shadowRoot?.querySelector<HTMLInputElement>('.token-field__input') ?? null;
	}

	/** The input + picker wrapper — the menu's anchor, so the menu lines up under
	 *  the whole area (including the picker), not just the input. */
	private get _inputArea(): HTMLElement | null {
		return this.shadowRoot?.querySelector<HTMLElement>('.token-field__input-area') ?? null;
	}

	/** Programmatic focus goes to the inner input, or — when it is hidden (all values
	 *  in, no custom, no options left) — to the token holding the roving tabindex. */
	override focus(options?: FocusOptions): void {
		if (this._input) this._input.focus(options);
		else this._focusTokenAt(this._rovingIndex);
	}

	/** When focus leaves the field entirely, reset the roving tab stop to the first
	 *  token, so tabbing back in from a preceding component always starts there.
	 *  Deferred a microtask because focusout fires before the matching focusin, so
	 *  the incoming focus target has settled by the time this runs. A focused token
	 *  (or the slotted menu) retargets document.activeElement to a node the field
	 *  contains, so moves within the field don't reset. */
	private _handleFocusOut = (): void => {
		queueMicrotask(() => {
			if (this.isConnected && !this.contains(document.activeElement)) this._rovingIndex = 0;
		});
	};

	/** A token's display label: the matching slotted menu-item's text, else the
	 *  raw value (covers values whose option is not currently present). */
	/** Slotted menu options not yet selected — what the picker could still add. */
	private get _availableOptionCount(): number {
		let n = 0;
		// Scope to the options menu (a direct-child nldd-menu); this deliberately
		// skips nldd-menu-items inside the token-menu template prototypes.
		for (const el of this.querySelectorAll(':scope > nldd-menu nldd-menu-item')) {
			const item = el as NLDDMenuItem;
			const v = item.value || item.text; // property, not attribute: consumers (Vue) set the property
			if (v && !this.values.includes(v)) n++;
		}
		return n;
	}

	/** Hide the input entirely when there is nothing left to do: no options remain
	 *  and free text is not allowed. Readonly fields never show the input. */
	public get _showInput(): boolean {
		return !this.readonly && (this.allowCustom || this._availableOptionCount > 0);
	}

	/** Whether an options menu is slotted — drives the picker button. Free-text-only
	 *  fields (e.g. e-mail addresses) have no menu and get no picker. */
	public get _hasMenu(): boolean {
		return this._menu !== null;
	}

	/** Show the picker only while there are still options left to pick. Once every
	 *  menu item sits in the field there is nothing to open, so it disappears.
	 *  Readonly fields never show the picker. */
	public get _showPicker(): boolean {
		return !this.readonly && this._hasMenu && this._availableOptionCount > 0;
	}

	public _labelFor(value: string): string {
		// Scope to the options menu (a direct-child nldd-menu); this deliberately
		// skips nldd-menu-items inside the token-menu template prototypes.
		for (const el of this.querySelectorAll(':scope > nldd-menu nldd-menu-item')) {
			const item = el as NLDDMenuItem;
			if ((item.value || item.text) === value) {
				return item.text || item.textContent?.trim() || value;
			}
		}
		return value;
	}

	/** Cloned action menu per value, so each token's menu stays stable across
	 *  re-renders (a fresh clone every render would drop its open/focus state). Pruned
	 *  when a value leaves; see willUpdate. */
	private _tokenMenuCache = new Map<string, HTMLElement>();

	/** The action menu for a value's token (token-control="menu"): a clone of the
	 *  matching `nldd-token[slot="template"][data-value]` prototype's `nldd-menu`, else
	 *  the shared keyless prototype's. Cloned once per value and reused. Only the
	 *  prototype's nested menu is read today; its other props are ignored. */
	public _tokenMenuFor(value: string): HTMLElement | null {
		const cached = this._tokenMenuCache.get(value);
		if (cached) return cached;
		const clone = this._cloneTokenMenu(value);
		if (clone) this._tokenMenuCache.set(value, clone);
		return clone;
	}

	private _cloneTokenMenu(value: string): HTMLElement | null {
		let shared: Element | null = null;
		let match: Element | null = null;
		for (const proto of this.querySelectorAll('nldd-token[slot="template"]')) {
			if ((proto as HTMLElement).dataset.value === value) { match = proto; break; }
			if (!proto.hasAttribute('data-value')) shared ??= proto;
		}
		const source = (match ?? shared)?.querySelector('nldd-menu[slot="menu"]');
		return source ? (source.cloneNode(true) as HTMLElement) : null;
	}

	/** A change to any `[slot="template"]` prototype (its menu items, their attributes,
	 *  or an added/removed prototype) invalidates the cloned per-token menus, so they
	 *  re-clone on the next render. The field only ever *reads* the prototypes — it
	 *  mutates the options menu and its own shadow DOM — so filtering to template-scoped
	 *  mutations keeps this from looping with the field's own option hiding. */
	private _onTemplateMutation(records: MutationRecord[]): void {
		const touchesTemplate = records.some((r) => {
			if ((r.target as Element).closest?.('[slot="template"]')) return true;
			return [...r.addedNodes, ...r.removedNodes].some(
				(n) => n.nodeType === Node.ELEMENT_NODE && (n as Element).matches?.('[slot="template"]'),
			);
		});
		if (!touchesTemplate) return;
		this._tokenMenuCache.clear();
		this.requestUpdate();
	}

	public _addValue(value: string): void {
		if (!value || this.values.includes(value)) return; // dedupe
		this.values = [...this.values, value];
		this._emitChange();
	}

	public _removeValue(value: string): void {
		if (!this.values.includes(value)) return;
		this.values = this.values.filter((v) => v !== value);
		this._emitChange();
	}

	private _emitChange(): void {
		this.commitFormValue();
		this.dispatchEvent(
			new CustomEvent('change', {
				detail: { values: [...this.values] },
				bubbles: true,
				composed: true,
			}),
		);
	}

	// — Input handlers ———————————————————————————————————————————————————————

	public _handleInput(e: Event): void {
		this._text = (e.target as HTMLInputElement).value;
		// A comma commits the text before it as a token (typed or pasted) — the
		// Enter-equivalent for free text. Only meaningful with custom values.
		if (this.allowCustom && this._text.includes(',')) {
			this._commitCommaSeparated();
			return;
		}
		this._syncMenuItems();
		if (!this._isOpen) this._openMenu();
		this._openPending = this._text !== '' && !this._menu?.matches(':popover-open');
		this.dispatchEvent(
			new CustomEvent('input', {
				detail: { value: this._text },
				bubbles: true,
				composed: true,
			}),
		);
	}

	/** Split the input on commas: every complete segment becomes a token; the
	 *  trailing segment (after the last comma) stays in the input to keep typing.
	 *  Emits a single change for the batch. */
	private _commitCommaSeparated(): void {
		const parts = this._text.split(',');
		const remainder = parts.pop() ?? '';
		const next = [...this.values];
		for (const part of parts) {
			const value = part.trim() ? this._valueForTypedText(part) : '';
			if (value && !next.includes(value)) next.push(value);
		}
		if (next.length !== this.values.length) {
			this.values = next;
			this._emitChange();
		}
		this._text = remainder;
		if (this._input) this._input.value = remainder;
		this._syncMenuItems();
		this.dispatchEvent(
			new CustomEvent('input', {
				detail: { value: this._text },
				bubbles: true,
				composed: true,
			}),
		);
	}

	/** Close the menu when focus leaves the field for anything but the menu. */
	public _handleBlur(e: FocusEvent): void {
		this._openPending = false;
		const related = e.relatedTarget as Node | null;
		if (related && this._menu?.contains(related)) return;
		// Commit any free-typed text when focus leaves, so a value typed without
		// pressing Enter/comma isn't silently dropped — it becomes a visible token
		// and joins the form value. Only with custom values allowed; commit without
		// re-focusing so the focus move isn't fought. `_commitValue` closes the
		// menu, so only close it ourselves when nothing was committed.
		if (this.allowCustom && this._text.trim()) this._commitValue(this._valueForTypedText(this._text), false);
		else this._closeMenu();
	}

	public _handleKeydown(e: KeyboardEvent): void {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (!this._isOpen) {
					this._syncMenuItems();
					this._openMenu();
				} else {
					this._menu?.moveHighlight('next');
					this._updateActiveDescendant();
				}
				break;
			case 'ArrowUp':
				if (!this._isOpen) return;
				e.preventDefault();
				this._menu?.moveHighlight('prev');
				this._updateActiveDescendant();
				break;
			case 'Enter': {
				// A highlighted option wins; otherwise commit the typed text as a
				// custom token. Works whether the menu is open or not — with no
				// matching options the menu is closed, but Enter should still add
				// the free-text value. preventDefault only when we actually act, so
				// a no-op Enter can still submit an enclosing form.
				const highlighted = this._isOpen ? (this._menu?.getHighlighted() ?? null) : null;
				if (highlighted) {
					e.preventDefault();
					highlighted.select(); // routes through _handleMenuSelect
				} else if (this.allowCustom && this._text.trim()) {
					e.preventDefault();
					this._commitValue(this._valueForTypedText(this._text));
				} else {
					// Nothing here to act on, so this Enter is not ours. Hand it to the
					// form, which is what the sentence above promises and what the
					// browser would have done if the input were not in a shadow root.
					submitOnEnter(this, e);
				}
				break;
			}
			case 'Escape':
				// Whatever arrives after this does not open the menu: the user said stop.
				this._openPending = false;
				// See nldd-combo-box: the key closed this menu and goes no further,
				// so a sheet behind it does not close on the same press.
				if (!this._isOpen) return;
				e.preventDefault();
				e.stopPropagation();
				this._closeMenu();
				break;
			case 'ArrowLeft':
				// At the very start of the input, step left into the tokens.
				if (this._caretAtStart() && this._tokens.length > 0) {
					e.preventDefault();
					this._focusTokenAt(this._tokens.length - 1);
				}
				break;
			case 'Backspace':
				// Empty input: step focus onto the last token first; a second
				// Backspace (now on the focused token) deletes it.
				if (this._text === '' && this._tokens.length > 0) {
					e.preventDefault();
					this._focusTokenAt(this._tokens.length - 1);
				}
				break;
		}
	}

	private _caretAtStart(): boolean {
		const input = this._input;
		if (!input) return false;
		// type="email" / "number" etc. don't expose a caret (selectionStart is null),
		// so an empty value is the only reliable "at the start" signal for those.
		if (input.selectionStart === null) return input.value === '';
		return input.selectionStart === 0 && input.selectionEnd === 0;
	}

	// — Token roving navigation ————————————————————————————————————————————————

	private get _tokens(): HTMLElement[] {
		return Array.from(this.shadowRoot?.querySelectorAll<HTMLElement>('nldd-token') ?? []);
	}

	/** Focus the token at `index` (clamped); focus the input when there are none. */
	private _focusTokenAt(index: number): void {
		const tokens = this._tokens;
		if (tokens.length === 0) {
			this._input?.focus();
			return;
		}
		const clamped = Math.max(0, Math.min(index, tokens.length - 1));
		this._rovingIndex = clamped;
		tokens[clamped].focus();
	}

	/** After removing the token at `index`, move focus to the token that shifted into
	 *  its slot (the one that was to its right). If the last token was removed, hand
	 *  focus to the input, or to the new last token when the input is hidden. */
	private _focusAfterRemoval(index: number): void {
		if (this._tokens.length === 0) {
			this._input?.focus();
			return;
		}
		if (index < this._tokens.length) this._focusTokenAt(index);
		else if (this._showInput) this._input?.focus();
		else this._focusTokenAt(this._tokens.length - 1);
	}

	/** Arrow keys move between tokens; ArrowRight past the last returns to the
	 *  input; Backspace/Delete removes the token and steps focus onto the next one.
	 *  A disabled field is inert — no roving, no keyboard removal. */
	public _handleTokenKeydown(e: KeyboardEvent, index: number): void {
		if (this.disabled) return;
		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				this._focusTokenAt(index - 1);
				break;
			case 'ArrowRight':
				e.preventDefault();
				if (index >= this._tokens.length - 1) this._input?.focus();
				else this._focusTokenAt(index + 1);
				break;
			case 'Home':
				e.preventDefault();
				this._focusTokenAt(0);
				break;
			case 'End':
				e.preventDefault();
				this._focusTokenAt(this._tokens.length - 1);
				break;
			case 'Backspace':
			case 'Delete':
				// Remove the token and mark its slot; updated() then steps focus onto the
				// token that took this one's place (or the input), so repeated Backspace
				// walks the row and focus never drops to the body.
				e.preventDefault();
				this._removeValue(this.values[index]);
				this._removalFocusIndex = index;
				break;
		}
	}

	/** Clicking empty space in the field (not a token or the picker) focuses the
	 *  input, or — when it is hidden — the last token, so a click after the tokens
	 *  lets you rove them with the arrow keys. The menu opens deliberately via the
	 *  picker, typing, or ArrowDown, not by clicking the field. */
	public _handleFieldClick(e: Event): void {
		const target = e.target as HTMLElement;
		if (target.closest('nldd-token') || target.closest('.token-field__picker')) return;
		if (this._showInput) this._input?.focus();
		else this._focusTokenAt(this._tokens.length - 1);
	}

	/** The ✕ dismiss control: remove the value and mark its slot so updated() steps
	 *  focus onto the token that takes its place (or the input). */
	public _handleTokenDismiss(value: string, index: number): void {
		this._removeValue(value);
		this._removalFocusIndex = index;
	}

	/** A token's menu action was chosen (token-control="menu"): report which token
	 *  and which action and let the app decide what happens (remove, edit, …). The
	 *  token owns closing the menu and returning focus to its chevron. When the app
	 *  handles the action synchronously by removing this token, mark its slot so
	 *  updated() re-homes focus (the closing menu has left focus adrift by then). */
	public _handleTokenAction(e: Event, value: string): void {
		const item = e.target as NLDDMenuItem;
		const action = item.value || item.text;
		const index = this.values.indexOf(value);
		this.dispatchEvent(new CustomEvent('token-action', {
			detail: { value, action },
			bubbles: true,
			composed: true,
		}));
		if (index !== -1 && !this.values.includes(value)) this._removalFocusIndex = index;
	}

	/**
	 * The picker (a real button) toggles the menu. Because it opens on `click`
	 * (after the gesture's pointerdown), the auto-popover isn't light-dismissed by
	 * the opening gesture. When the menu is already open, this same gesture's
	 * pointerdown light-dismisses it; the flag makes the trailing click a no-op so
	 * it doesn't flicker back open. Mirrors the combo-box picker.
	 */
	public _handlePickerPointerdown(): void {
		if (this._isOpen) this._pickerPointerdownWhileOpen = true;
	}

	public _togglePicker(): void {
		this._input?.focus();
		if (this._pickerPointerdownWhileOpen) {
			this._pickerPointerdownWhileOpen = false;
			return;
		}
		if (this._isOpen) {
			this._closeMenu();
		} else {
			this._syncMenuItems();
			this._openMenu();
		}
	}

	// — Menu wiring ——————————————————————————————————————————————————————————

	public _onSlotChange(): void {
		this.requestUpdate(); // re-render token labels when options change

		const slot = this.shadowRoot?.querySelector('slot');
		const menu = slot
			?.assignedElements({ flatten: true })
			.find((el) => el.tagName.toLowerCase() === 'nldd-menu') as NLDDMenu | undefined;
		if (!menu) return;

		if (menu === this._menu) return;

		this._menu = menu;
		menu.id = this._menuId;
		menu.anchorElement = this;
		menu.placement = 'bottom-start';
		menu.variant = 'listbox';
		menu.addEventListener('toggle', this._handleMenuToggle);
		menu.addEventListener('select', this._handleMenuSelect);
		menu.addEventListener('keydown', this._handleMenuKeydown);
		this._updateMenuWidth();
		this._hideSelectedMenuItems();

		// Options may be added/removed after this (async framework rendering).
		// Watch child changes only — not attributes — so the field's own hidden/
		// query toggles on items don't loop. childList picks up added menu-items.
		this._menuObserver?.disconnect();
		this._menuObserver = new MutationObserver(() => {
			this._hideSelectedMenuItems();
			this._handleMenuItemsChange();
			this.requestUpdate();
		});
		this._menuObserver.observe(menu, { childList: true, subtree: true });
	}

	/** Pin the menu to the native input's width (its anchor) so it lines up under
	 *  the input and never extends past it. */
	private _updateMenuWidth(): void {
		if (!this._menu) return;
		const rect = (this._inputArea ?? this._input ?? this).getBoundingClientRect();
		this._menu.width = `${rect.width}px`;
	}

	private _handleScrollOrResize = (): void => {
		if (!this._isOpen) return;
		this._updateMenuWidth();
		this._menu?.reposition();
	};

	private _handleMenuToggle = (e: Event): void => {
		this._isOpen = (e as ToggleEvent).newState === 'open';
		if (!this._isOpen) {
			this._highlightedId = '';
		} else {
			// However it opened, there is nothing left to open later.
			this._openPending = false;
			requestAnimationFrame(() => {
				// The menu clears its highlight on open; seat it on the first option
				// by default so that option is the active descendant and Enter picks
				// it — unless something is already highlighted.
				if (this._menu && !this._menu.getHighlighted()) this._menu.moveHighlight('next');
				this._updateActiveDescendant();
			});
		}
	};

	private _handleMenuSelect = (e: Event): void => {
		const item = e.target as NLDDMenuItem;
		this._commitValue(item.value || item.text);
	};

	/**
	 * Tab inside the menu (a top-layer popover) would move focus to an arbitrary
	 * next element in DOM order. Instead close the menu and return focus to the
	 * input so Tab continues from there — same handling as the combo-box.
	 */
	private _handleMenuKeydown = (e: KeyboardEvent): void => {
		if (e.key !== 'Tab') return;
		e.preventDefault();
		this._closeMenu();
		this._input?.focus();
	};

	/**
	 * Typing an option's label in full means that option: its value becomes the
	 * token, not the label, so the form sends what a choice from the menu would.
	 * Anything else typed is a custom value as it stands.
	 */
	private _valueForTypedText(text: string): string {
		const typed = text.trim();
		const option = Array.from(this._menu?.querySelectorAll<NLDDMenuItem>('nldd-menu-item') ?? [])
			.find((item) => item.closest('nldd-menu') === this._menu && item.text.trim().toLowerCase() === typed.toLowerCase());
		return option ? option.value || option.text : typed;
	}

	/**
	 * Add a value, clear the input, and close the menu — focus returns to the empty
	 * input. The menu only reopens on a deliberate action (typing, ArrowDown, or the
	 * picker), so a focused empty field behaves the same whether it was just focused
	 * or a value was just committed.
	 */
	private _commitValue(value: string, refocus = true): void {
		this._addValue(value);
		this._resetInputText();
		this._closeMenu();
		// On blur we commit but must NOT pull focus back — the user is leaving the
		// field (e.g. onto a submit button); re-focusing would fight that move.
		if (!refocus) return;
		// After the last value the input disappears (no custom, no options left); put
		// focus on the last token instead of dropping it to the body.
		void this.updateComplete.then(() => {
			if (this._showInput) this._input?.focus();
			else this._focusTokenAt(this._tokens.length - 1);
		});
	}

	public _openMenu(): void {
		if (!this._menu || this.disabled) return;
		if (!('showPopover' in this._menu)) return;
		// Nothing to show (all options selected / filtered out) — don't open an
		// empty menu. Callers sync the items first, so the count is current.
		if (this._visibleOptionCount === 0) return;
		// Guard on the real popover state, not `_isOpen`: the popover toggle event
		// that drives `_isOpen` is async, so right after a menu-item hides the
		// popover `_isOpen` is still stale-true — guarding on it would wrongly skip
		// the reopen. `:popover-open` also prevents the throw on double-show.
		if ((this._menu as HTMLElement).matches(':popover-open')) return;
		// Anchor to the input + picker wrapper so the menu lines up under the whole
		// field row (including the picker), wherever it sits after the tokens.
		this._menu.anchorElement = this._inputArea ?? this._input ?? this;
		this._updateMenuWidth();
		(this._menu as HTMLElement).showPopover();
	}

	/**
	 * The menu decides whether to open on a keystroke. Options that arrive later
	 * get the same decision: they open a menu the keystroke could not open, and a
	 * menu whose options all went away closes again, as it would on typing. Only
	 * while the user is still in the field.
	 */
	private _handleMenuItemsChange(): void {
		if (!this._menu || this.shadowRoot?.activeElement !== this._input) return;
		if (this._menu.matches(':popover-open')) {
			if (this._visibleOptionCount === 0) this._closeMenu();
			return;
		}
		if (this._openPending && this._visibleOptionCount > 0) {
			this._openPending = false;
			this._openMenu();
		}
	}

	public _closeMenu(): void {
		if (!this._menu) return;
		if (!(this._menu as HTMLElement).matches(':popover-open')) return;
		(this._menu as HTMLElement).hidePopover();
	}

	private _updateActiveDescendant(): void {
		this._highlightedId = this._menu?.getHighlightedId() ?? '';
	}

	private _resetInputText(): void {
		this._text = '';
		if (this._input) this._input.value = '';
	}

	/** Options currently shown in the menu (matching the filter and not already
	 *  selected). Zero means there is nothing worth opening the menu for. */
	private get _visibleOptionCount(): number {
		if (!this._menu) return 0;
		return this._menu.querySelectorAll('nldd-menu-item:not([hidden])').length;
	}

	/** Apply the text filter, then hide options already selected. Used after
	 *  typing, selecting, and whenever `values` changes. */
	private _syncMenuItems(): void {
		if (!this._menu) return;
		this._menu.filter(this._text, { hide: !this.noFilter });
		this._hideSelectedMenuItems();
		this._updateActiveDescendant();
		// Don't leave an empty menu open. Without options the empty-state dialog is
		// noise — especially with allow-custom, where the user just types instead.
		if (this._isOpen && this._visibleOptionCount === 0) this._closeMenu();
	}

	/** Hide every option whose value is already a token. The text filter unhides
	 *  matches, so this runs after it. Moves the highlight off an item it hides. */
	private _hideSelectedMenuItems(): void {
		if (!this._menu) return;
		const selected = new Set(this.values);
		let reseat = false;
		for (const el of this._menu.querySelectorAll('nldd-menu-item')) {
			const item = el as NLDDMenuItem;
			if (selected.has(item.value || item.text)) {
				if (item.hasAttribute('highlighted')) reseat = true;
				item.setAttribute('hidden', '');
			}
		}
		if (reseat) this._menu.moveHighlight('next');
	}

	/**
	 * The input is the control while it is there. It is not always: the field
	 * rests as a list of what you picked and grows an input when you go to add
	 * something, so in that resting state the list is what you meet.
	 */
	override describedTarget(): Element | null {
		const root = this.shadowRoot;
		return root?.querySelector('input.token-field__input') ?? root?.querySelector('.token-field__list') ?? null;
	}

	override render() {
		return tokenFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-token-field': NLDDTokenField;
	}
}
