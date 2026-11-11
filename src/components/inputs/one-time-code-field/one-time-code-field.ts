/**
 * Nederlandse Digitale Dienst One-Time Code Field Component (Lit + TypeScript)
 *
 * A field for a code someone receives once and types over: by text message,
 * by email, from an authenticator app or on a letter. It shows a box per
 * character, but it is one native input underneath, so pasting the whole code,
 * the code a phone offers from a text message (`autocomplete="one-time-code"`),
 * a screen reader and voice control all work as on any other field.
 *
 * The characters are monospace, so 0 and O, or 1, l and I, read apart.
 *
 * Typing fills the boxes from the left. The arrow keys, Home, End and a click
 * move the caret from box to box. In a filled box it stands after the
 * character: Backspace empties that box, without moving the rest up, so you
 * type the right one straight in. A pasted code drops whatever is not part of
 * one, so "123 456" or "123-456" becomes "123456", and a whole code replaces
 * what was there. From a pasted sentence, such as a text message, the field
 * takes the last word that is as long as the code, so "Your code is 123456"
 * fills in "123456". Once every box is full
 * the field fires `complete`, and again after a correction that leaves it
 * full. Submitting then is up to your app: send the form, or wait for a
 * button, but never both, or a correction submits twice.
 *
 * Not for a PIN or a password, which must not be readable on screen: use
 * `nldd-password-field`. Put the field in an `nldd-form-field`, whose label
 * says where the code comes from ("Code uit de sms").
 *
 * @element nldd-one-time-code-field
 *
 * @attr {string} size - 'sm' | 'md' (default) | 'lg'. 'lg' has boxes 56px tall with larger characters, for a page where the code is the only thing to do, such as signing in. Where the boxes do not fit the width, the field steps down a size, to md and then sm: a code never wraps onto a second line. Where not even sm fits, the field shows the code in a text field of its own size.
 * @attr {boolean} centered - Puts the boxes in the middle of the row, as on a sign-in page where the code is the only field. The field keeps the full width of the row, so it still sees when the boxes no longer fit and steps down a size; centering it from outside, with the alignment of its parent, would shrink it to its boxes and take that away.
 * @attr {number} length - How many characters the code has (default: 6).
 * @attr {string} format - The shape of a code that is printed in groups, such as '###-###' or '#### ####': each `#` is a box, anything else a separator you see but a screen reader does not hear. The number of `#` is then the length, so `format` wins over `length`. The value never holds a separator: '123-234' is submitted as '123234'. Leave it out for a code without groups, as most codes from a text message are.
 * @attr {string} accessible-label - Accessible label forwarded to the inner input. Set automatically by nldd-form-field.
 * @attr {boolean} invalid - Marks the field as invalid
 * @attr {boolean} readonly - Readonly state
 * @attr {boolean} disabled - Disabled state
 * @attr {string} input-id - Sets the id on the native input. Set automatically by nldd-form-field.
 * @attr {string} name - Input name for form submission
 * @attr {string} value - The code
 * @attr {string} type - What the code holds: 'numeric' (default, digits only, raises the number keyboard) | 'alphanumeric' (letters and digits)
 * @attr {boolean} uppercase - Turns letters into capitals as they are typed or pasted, in the boxes and in the value. Only with `type="alphanumeric"`, and only for a code where case does not matter, as with most activation codes. Leave it off for a code that tells "a" from "A", such as some recovery codes: a value turned into capitals would no longer match.
 * @attr {boolean} required - Required state. A code that is not complete counts as invalid too.
 *
 * @fires input - When the code changes; detail: { value: string }
 * @fires change - When the code is committed; detail: { value: string }
 * @fires complete - When every box is filled; detail: { value: string }
 */
import { LitElement, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { deferFocus } from '../../../utilities/defer-focus.js';
import { oneTimeCodeFieldStyles } from './one-time-code-field.styles.js';
import { oneTimeCodeFieldTemplate } from './one-time-code-field.template.js';

export type OneTimeCodeType = 'numeric' | 'alphanumeric';

export type OneTimeCodeSize = 'sm' | 'md' | 'lg';

const DEFAULT_LENGTH = 6;

/** A box in the format; any other part is a separator. */
export const BOX = Symbol('box');

export type FormatPart = typeof BOX | string;

/** Characters that are not part of a code of this type. */
const NOT_IN_CODE: Record<OneTimeCodeType, RegExp> = {
	numeric: /[^0-9]/g,
	alphanumeric: /[^0-9A-Za-z]/g,
};

const IN_CODE: Record<OneTimeCodeType, string> = {
	numeric: '[0-9]',
	alphanumeric: '[0-9A-Za-z]',
};

@customElement('nldd-one-time-code-field')
export class NLDDOneTimeCodeField extends DescribedBy(FormAssociated(LitElement)) {
	static override shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	static override styles = oneTimeCodeFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	/** Counts for the implicit-submission rule: a single-line field where Enter
	 *  would submit the form. See utilities/implicit-submission.ts. */
	static blocksImplicitSubmission = true;

	private _initialValue = '';

	@property({ reflect: true, converter: reflectNonDefault<OneTimeCodeSize>('md') })
	size: OneTimeCodeSize = 'md';

	@property({ type: Boolean, reflect: true })
	centered = false;

	@property({ reflect: true, converter: reflectNonDefault<number>(DEFAULT_LENGTH) })
	length = DEFAULT_LENGTH;

	@property({ reflect: true, converter: reflectNonDefault('') })
	format = '';

	/** Accessible label forwarded to the inner <input>. Set automatically by nldd-form-field. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Boolean, reflect: true })
	invalid = false;

	@property({ type: Boolean, reflect: true })
	readonly = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String, attribute: 'input-id' })
	inputId = '';

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: String })
	value = '';

	@property({ reflect: true, converter: reflectNonDefault<OneTimeCodeType>('numeric') })
	type: OneTimeCodeType = 'numeric';

	@property({ type: Boolean, reflect: true })
	uppercase = false;

	@property({ type: Boolean, reflect: true })
	required = false;

	/** Whether the inner input has focus, to show where the next character goes. */
	@state()
	_focused = false;

	/**
	 * One character per box, '' for an empty one. The field keeps the boxes
	 * itself: a native input cannot hold a gap, and Backspace has to empty a
	 * box without moving the rest. `value` is these characters without the gaps.
	 */
	@state()
	_chars: string[] = [];

	/** The box the caret is in. */
	@state()
	_box = 0;

	/** The last complete code `complete` fired for, so the same code fires once. */
	private _completed = '';

	/** Set while a touch focuses the field, so the focus keeps the box that was pressed. */
	private _pressedBox: number | null = null;

	@query('.one-time-code-field__input')
	private _input!: HTMLInputElement;

	/** The format as boxes and the separators between them, or null without a usable format. */
	get formatParts(): FormatPart[] | null {
		if (!this.format?.includes('#')) return null;
		return (this.format.match(/#|[^#]+/g) ?? []).map((part) => (part === '#' ? BOX : part));
	}

	/** The length: the boxes in the format, or else `length` as a whole number of at least one. */
	get boxes(): number {
		const parts = this.formatParts;
		if (parts) return parts.filter((part) => part === BOX).length;
		const length = Math.floor(Number(this.length));
		return Number.isFinite(length) && length > 0 ? length : DEFAULT_LENGTH;
	}

	/** The `pattern` the native input checks: exactly `boxes` characters of the type. */
	get pattern(): string {
		return `${IN_CODE[this.type] ?? IN_CODE.numeric}{${this.boxes}}`;
	}

	/** The character in a box, '' when it is empty. */
	charAt(index: number): string {
		return this._chars[index] ?? '';
	}

	/**
	 * The box with the focus ring, or -1 while the field has no focus. A
	 * readonly field gets the ring too, since the boxes are its only focus
	 * indicator, but no caret.
	 */
	get activeBox(): number {
		if (!this._focused) return -1;
		return Math.min(this._box, this.boxes - 1);
	}

	/** Keeps what belongs in a code, up to the length. */
	private _clean(raw: string): string {
		const code = raw.replace(NOT_IN_CODE[this.type] ?? NOT_IN_CODE.numeric, '').slice(0, this.boxes);
		return this.uppercase ? code.toUpperCase() : code;
	}

	/**
	 * The code in a pasted text: the last word as long as the code, so a
	 * sentence around it, or a phone number before it, falls away. Without such
	 * a word the whole text is cleaned, as when typed.
	 */
	private _codeIn(raw: string): string {
		const pattern = NOT_IN_CODE[this.type] ?? NOT_IN_CODE.numeric;
		const words = raw.split(/\s+/).map((part) => part.replace(pattern, ''));
		const word = words.reverse().find((part) => part.length === this.boxes);
		return this._clean(word ?? raw);
	}

	/** The boxes for a value set from outside, filled from the left. */
	private _charsOf(value: string): string[] {
		return Array.from({ length: this.boxes }, (_, index) => value[index] ?? '');
	}

	override willUpdate(changed: PropertyValues): void {
		if (['value', 'type', 'length', 'format', 'uppercase'].some((key) => changed.has(key))) {
			const clean = this._clean(this.value ?? '');
			if (clean !== this.value) this.value = clean;
			const own = this._chars.join('');
			if (this.value !== own || this._chars.length !== this.boxes) this._chars = this._charsOf(this.value);
		}
	}

	override firstUpdated(): void {
		this._initialValue = this.value;
	}

	private _resizeObserver?: ResizeObserver;

	override connectedCallback(): void {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver(() => this._fit());
		this._resizeObserver.observe(this);
	}

	override disconnectedCallback(): void {
		this._resizeObserver?.disconnect();
		super.disconnectedCallback();
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (['size', 'length', 'format'].some((key) => changed.has(key))) this._fit();
	}

	/** Steps down from `size` until the boxes fit the width, so a code never
	 *  wraps. Where not even sm fits, the input itself shows as a text field in
	 *  the size of `size`. The boxes are measured at their full width for this. */
	private _fit(): void {
		const boxes = this.shadowRoot?.querySelector<HTMLElement>('.one-time-code-field__boxes');
		const available = this.clientWidth;
		if (!boxes || available === 0) return;
		const sizes: OneTimeCodeSize[] = ['lg', 'md', 'sm'];
		// An unknown size renders as md, so it steps down from there.
		const start = sizes.includes(this.size) ? sizes.indexOf(this.size) : sizes.indexOf('md');
		this.removeAttribute('data-fit');
		boxes.style.minWidth = 'max-content';
		let fits = false;
		for (const size of sizes.slice(start)) {
			if (size !== this.size) this.setAttribute('data-fit', size);
			if (boxes.getBoundingClientRect().width <= available + 0.5) {
				fits = true;
				break;
			}
		}
		boxes.style.removeProperty('min-width');
		if (!fits) this.setAttribute('data-fit', 'field');
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

	/** The first empty box, or the last one when every box is filled. */
	private get _nextBox(): number {
		const empty = this._chars.indexOf('');
		return empty === -1 ? this.boxes - 1 : empty;
	}

	private _moveTo(box: number): void {
		this._box = Math.max(0, Math.min(box, this.boxes - 1));
	}

	/** The box under a point, or the nearest one. The text in the input is not laid out over the boxes, so a press finds its box here. */
	private _boxAt(x: number): number {
		const boxes = [...(this.shadowRoot?.querySelectorAll('.one-time-code-field__box') ?? [])];
		let nearest = 0;
		let distance = Infinity;
		boxes.forEach((box, index) => {
			const { left, right } = box.getBoundingClientRect();
			const away = x < left ? left - x : x > right ? x - right : 0;
			if (away < distance) {
				distance = away;
				nearest = index;
			}
		});
		return nearest;
	}

	/**
	 * A press puts the caret in that box. With a mouse the field takes the
	 * focus itself, so the browser never places a caret of its own; a touch
	 * keeps the browser's focus, which is what raises the keyboard.
	 */
	public _handlePointerDown(e: PointerEvent): void {
		if (this._asField) return;
		const box = this._boxAt(e.clientX);
		this._pressedBox = box;
		this._moveTo(box);
		if (e.pointerType !== 'mouse' || this.disabled) return;
		e.preventDefault();
		this._input.focus();
	}

	public _handleFocus(): void {
		this._focused = true;
		if (this._asField) return;
		// Tabbing in lands in the first empty box, where the next character goes.
		if (this._pressedBox === null) this._moveTo(this._nextBox);
		this._pressedBox = null;
		this._keepNativeCaretAtEnd();
	}

	public _handleBlur(): void {
		this._focused = false;
		this._pressedBox = null;
	}

	/** The native caret means nothing here; at the end it never selects a part of the code. */
	public _keepNativeCaretAtEnd(): void {
		const input = this._input;
		if (!input || this._asField || this.shadowRoot?.activeElement !== input) return;
		const end = input.value.length;
		if (input.selectionStart !== end || input.selectionEnd !== end) input.setSelectionRange(end, end);
	}

	/**
	 * Typing writes the box the caret is in when it is empty, and the next one
	 * when it is filled, so the caret after a character reads as in any field.
	 * Backspace empties the box, or the one before it when it is already empty;
	 * nothing moves up. A paste of a whole code replaces it, a part fills from
	 * the caret on.
	 */
	public _handleBeforeInput(e: InputEvent): void {
		if (this.readonly || this.disabled) return;
		if (this._asField) {
			this._beforeFieldInput(e);
			return;
		}
		switch (e.inputType) {
			case 'insertText': {
				e.preventDefault();
				const typed = this._clean(e.data ?? '');
				if (typed) this._write(typed, false);
				return;
			}
			case 'insertFromPaste':
			case 'insertFromDrop':
			case 'insertReplacementText': {
				e.preventDefault();
				const text = this._codeIn(e.dataTransfer?.getData('text/plain') ?? e.data ?? '');
				if (text) this._write(text, true);
				return;
			}
			case 'deleteContentBackward':
			case 'deleteWordBackward':
			case 'deleteSoftLineBackward':
			case 'deleteHardLineBackward': {
				e.preventDefault();
				const box = this.activeBox < 0 ? this._box : this.activeBox;
				const target = this.charAt(box) ? box : box - 1;
				if (target < 0) return;
				this._setChars(this._chars.map((char, index) => (index === target ? '' : char)), target);
				return;
			}
			case 'deleteContentForward': {
				e.preventDefault();
				this._setChars(this._chars.map((char, index) => (index === this._box ? '' : char)), this._box);
				return;
			}
			default:
				// Composition, dictation and the like change the input itself: read it back in _handleInput.
		}
	}

	/**
	 * As a text field the input edits like any other: select, move and delete
	 * where you like. Only what cannot be in the code is kept out, and a pasted
	 * code is cut out of the text around it.
	 */
	private _beforeFieldInput(e: InputEvent): void {
		const input = this._input;
		if (e.inputType === 'insertText') {
			if (!this._clean(e.data ?? '')) e.preventDefault();
			return;
		}
		if (['insertFromPaste', 'insertFromDrop', 'insertReplacementText'].includes(e.inputType)) {
			e.preventDefault();
			const text = this._codeIn(e.dataTransfer?.getData('text/plain') ?? e.data ?? '');
			if (text.length === this.boxes) input.value = text;
			else input.setRangeText(text, input.selectionStart ?? 0, input.selectionEnd ?? 0, 'end');
			this._syncFromField();
		}
	}

	/** Reads the text field back into the code, keeping the caret where it was. */
	private _syncFromField(): void {
		const input = this._input;
		const caret = input.selectionStart ?? input.value.length;
		const clean = this._clean(input.value);
		if (input.value !== clean) {
			const at = this._clean(input.value.slice(0, caret)).length;
			input.value = clean;
			input.setSelectionRange(at, at);
		}
		this._setChars(this._charsOf(clean), Math.min(clean.length, this.boxes - 1));
	}

	private get _asField(): boolean {
		return this.getAttribute('data-fit') === 'field';
	}

	/** Writes characters from the caret on; a whole code at once replaces what was there. */
	private _write(text: string, pasted: boolean): void {
		if (pasted && text.length === this.boxes) {
			this._setChars(text.split(''), this.boxes - 1);
			return;
		}
		const chars = [...this._chars];
		let box = this.charAt(this._box) && !pasted ? this._box + 1 : this._box;
		if (box >= this.boxes) box = this.boxes - 1;
		for (const char of text) {
			if (box >= this.boxes) break;
			chars[box] = char;
			box++;
		}
		this._setChars(chars, box);
	}

	public _handleKeydown(e: KeyboardEvent): void {
		submitOnEnter(this, e);
		if (this._asField || e.altKey || e.ctrlKey || e.metaKey) return;
		const moves: Record<string, () => number> = {
			ArrowLeft: () => this._box - 1,
			ArrowRight: () => Math.min(this._box + 1, this._nextBox),
			Home: () => 0,
			End: () => this._nextBox,
		};
		const move = moves[e.key];
		if (!move) return;
		e.preventDefault();
		this._moveTo(move());
	}

	/** Input that did not come through beforeinput, such as a code a phone fills in: take it from the start. */
	public _handleInput(e: Event): void {
		e.stopPropagation();
		if (this._asField) {
			this._syncFromField();
			return;
		}
		const clean = this._clean(this._input.value);
		this._setChars(this._charsOf(clean), Math.min(clean.length, this.boxes - 1));
	}

	private _setChars(chars: string[], box: number): void {
		this._chars = chars;
		this._moveTo(box);
		const value = chars.join('');
		const input = this._input;
		if (input.value !== value) input.value = value;
		this._keepNativeCaretAtEnd();
		const changed = value !== this.value;
		this.value = value;
		this.commitFormValue();
		if (!changed) return;
		this.dispatchEvent(new CustomEvent('input', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
		if (chars.includes('') || value.length < this.boxes) this._completed = '';
		else if (value !== this._completed) {
			this._completed = value;
			this.dispatchEvent(new CustomEvent('complete', {
				detail: { value },
				bubbles: true,
				composed: true,
			}));
		}
	}

	public _handleChange(e: Event): void {
		e.stopPropagation();
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

	/** Delegates focus to the inner native `<input>`. */
	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
		this._input?.focus(options);
	}

	override render() {
		return oneTimeCodeFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-one-time-code-field': NLDDOneTimeCodeField;
	}
}
