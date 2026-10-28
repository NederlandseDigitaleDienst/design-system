/**
 * Nederlandse Digitale Dienst Time Field Component (Lit + TypeScript)
 *
 * A text field for a time. The value is always 24-hour `HH:mm`, which is how
 * Dutch shows it too, so unlike nldd-date-field there is nothing to convert.
 * Typing is not masked: input is accepted generously and normalized only when
 * the field is left. Error messages belong to nldd-form-field, not here. This
 * field reflects only `invalid` / `valid`, like nldd-text-field.
 *
 * `value` holds a valid time or nothing, so an empty field and one with text
 * that is no time both read as ''. `validity` tells them apart: `badInput` for
 * text that is no time, `rangeUnderflow` / `rangeOverflow` for a time outside
 * `min` / `max`. A form does not submit then, and nldd-form marks the field
 * invalid. Without a submit, as in a filter that applies at once, the moment is
 * yours: `field.invalid = !field.validity.valid` on `change`, with a message of
 * your own in the nldd-form-field.
 *
 * What you do in the picker is a preview until you leave it. The field shows
 * the time right away but commits it on close. "Klaar" and Enter keep the
 * choice, and so does a click outside once you have picked something. Cancel
 * and Escape put the old time back. On an empty field the wheels open at `min`,
 * or otherwise at the current time rounded to `step`, which does not fill in
 * the field yet.
 *
 * @element nldd-time-field
 *
 * @attr {string} value - The time as `HH:mm` (24-hour). Empty when there is no valid time.
 * @attr {string} min - Earliest allowed time as `HH:mm`. Also the base that `step` counts from.
 * @attr {string} max - Latest allowed time as `HH:mm`.
 * @attr {number} step - Step in minutes (default 1). Decides which times are valid, what rounding snaps to, and how far the arrow keys jump.
 * @attr {boolean} no-picker - Hides the picker button. It is shown by default.
 * @attr {string} placeholder - Placeholder text. Do not put a format here; use the supporting label of nldd-form-field for that.
 * @attr {string} input-id - Sets the id on the internal input. Set automatically by nldd-form-field.
 * @attr {string} size - 'md' (default) | 'sm'. Set automatically by nldd-form-field.
 * @attr {boolean} invalid - Marks the field as invalid.
 * @attr {boolean} valid - Marks the field as valid.
 * @attr {boolean} disabled - Disabled state.
 * @attr {boolean} readonly - Read-only state.
 * @attr {boolean} required - Required state.
 * @attr {string} name - Name for form submission.
 * @attr {string} autocomplete - Autocomplete hint.
 * @attr {string} accessible-label - Accessible label for the internal input. Set automatically by nldd-form-field.
 * @attr {string} width - Width. By default exactly wide enough for a time plus the validation icon; 'full' fills the container; 'fit-content' drops the room for the validation icon and grows again as soon as the field turns valid or invalid; or pass your own CSS length.
 * @attr {object} translations - Translations; unspecified keys fall back to Dutch.
 *
 * @slot picker - Your own nldd-time-picker instead of the default one. The field keeps setting `value`, `min`, `max` and `step`; use the slot for what only a picker knows, such as its own translations.
 *
 * @fires input - On every change. detail: { value } with `HH:mm`, or '' while there is no valid time.
 * @fires change - When the value is committed: on leaving the field, and on closing the picker in a way that keeps the choice. detail: { value } with `HH:mm`, or ''.
 */

import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { NLDDPopover } from '../../layout/popover/popover.js';
import type { NLDDTimePicker } from '../time-picker/time-picker.js';
import { FormAssociated, type FormValue, type OwnValidity } from '../../../utilities/form-associated-mixin.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { timeFieldStyles } from './time-field.styles.js';
import { timeFieldTemplate } from './time-field.template.js';
import { nlddTimeFieldTranslations, type NLDDTimeFieldTranslations } from './time-field.i18n.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { translate } from '../../../utilities/translations.js';
import {
	checkText,
	commitText,
	parseTime,
	resolveRules,
	shift,
	startingPoint,
	type TimeProblem,
	type TimeRules,
} from './time-field.times.js';

export { parseTime, roundToStep } from './time-field.times.js';

@customElement('nldd-time-field')
export class NLDDTimeField extends DescribedBy(FormAssociated(LitElement)) {

	static override shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	static override styles = timeFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	/** Counts for the implicit-submission rule: a single-line field where Enter
	 *  would submit the form. See utilities/implicit-submission.ts. */
	static blocksImplicitSubmission = true;

	private _initialValue = '';

	@property({ reflect: true, converter: reflectNonDefault<'md' | 'sm'>('md') })
	size: 'md' | 'sm' = 'md';

	@property({ type: String })
	value = '';

	@property({ type: String })
	min = '';

	@property({ type: String })
	max = '';

	@property({ type: Number })
	step = 1;

	@property({ type: Boolean, reflect: true, attribute: 'no-picker' })
	noPicker = false;

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

	@property({ type: Boolean, reflect: true })
	readonly = false;

	@property({ type: Boolean, reflect: true })
	required = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: String })
	autocomplete = '';

	/** Accessible label for the inner input. Set automatically by nldd-form-field. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';


	/** Optional fixed width. Without a value the field is exactly wide enough. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';

	/** Override one or more translation keys. Keys left out fall back to Dutch. */
	@property({ type: Object })
	translations: Partial<NLDDTimeFieldTranslations> = {};

	/**
	 * Whether a fine pointer is in use. The picker already sets its row height
	 * with a media query, but a button's size is an attribute and so cannot be
	 * chosen in CSS. Hence the same question once more here, in JS.
	 *
	 * Created lazily and shared between all fields: calling matchMedia while the
	 * module loads breaks in an environment without window.
	 */
	private static _finePointerQuery: MediaQueryList | null = null;

	private static _getFinePointerQuery(): MediaQueryList {
		NLDDTimeField._finePointerQuery ??= matchMedia('(pointer: fine)');
		return NLDDTimeField._finePointerQuery;
	}

	@state()
	private _finePointer = false;

	private _handlePointerChange = (): void => {
		this._finePointer = NLDDTimeField._getFinePointerQuery().matches;
	};

	/** Size of the buttons in the popover: a finger needs the full control size,
	 *  a mouse does not. Same split as the rows of the picker. */
	public get _pickerButtonSize(): 'sm' | 'md' {
		return this._finePointer ? 'sm' : 'md';
	}

	override connectedCallback(): void {
		super.connectedCallback();
		const query = NLDDTimeField._getFinePointerQuery();
		this._finePointer = query.matches;
		query.addEventListener('change', this._handlePointerChange);
	}

	override disconnectedCallback(): void {
		NLDDTimeField._getFinePointerQuery().removeEventListener('change', this._handlePointerChange);
		// Normally _settlePicker takes this one off, but that runs on the popover's
		// toggle event. Disappear from the DOM with the picker open and no toggle
		// arrives, leaving a listener on document that holds on to a detached field
		// and keeps swallowing Escape for the rest of the session.
		document.removeEventListener('keydown', this._handlePickerEscape, true);
		super.disconnectedCallback();
	}

	/** What the user sees and types. Kept apart from `value`, which only ever
	 *  carries a valid time or nothing. */
	@state()
	_display = '';

	public _t(key: keyof NLDDTimeFieldTranslations): string {
		return translate(this.translations, nlddTimeFieldTranslations, key);
	}

	public get _fieldLabel(): string {
		return this.accessibleLabel || this._t('components.time-field.default-label');
	}

	public get _displayValue(): string {
		return this._display;
	}

	private get _rules(): TimeRules {
		return resolveRules(this.min, this.max, this.step);
	}

	/** The time a text commits to, or '' when it is unreadable or out of bounds.
	 *  In both cases the raw text stays put, so the user sees and can repair what
	 *  they wrote. */
	private _commit(text: string, round = false): string {
		return commitText(text, this._rules, round);
	}

	public _handleInput(e: Event): void {
		e.stopPropagation();
		const text = (e.target as HTMLInputElement).value;
		this._display = text;
		this.value = this._commit(text);
		this._emit('input');
	}

	public _handleChange(e: Event): void {
		e.stopPropagation();
		const input = e.target as HTMLInputElement;
		const committed = this._commit(input.value, true);
		// Normalize on commit: 9u30 ends up as 09:30. Text that is unreadable or
		// out of bounds stays put so it can be repaired.
		const shown = committed || input.value;
		this._display = shown;
		// We write the input ourselves. Lit skips a DOM write as soon as the new
		// text equals what it last rendered, and that is exactly the case when
		// someone retypes an already normalized value differently: 09:30 becomes
		// 930, which rounds back to 09:30. Without this line 930 stayed on screen
		// while `value` had long been 09:30.
		input.value = shown;
		this.value = committed;
		this._emit('change');
	}

	/**
	 * Arrow up and down move by `step`. With nothing there yet, the first press is
	 * the current time rounded to the step, or `min` when there is one. Starting
	 * at midnight would be a long climb from any realistic goal, and the calendar
	 * does the same: it opens on today as long as there is no date.
	 */
	public _handleInputKeydown(e: KeyboardEvent): void {
		// Enter first: the browser would have submitted the form from here if
		// this input were not in a shadow root.
		if (submitOnEnter(this, e)) return;
		if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
		if (this.disabled || this.readonly) return;
		e.preventDefault();
		const rules = this._rules;
		const current = this.value || parseTime(this._display);
		const next = current
			? shift(current, e.key === 'ArrowUp' ? 1 : -1, rules)
			: startingPoint(rules, new Date());
		// The text is set as well: retyped text that commits to the same value
		// (1700 for 17:00) has to settle into the notation even when value stays.
		this._display = next;
		this.value = next;
		this._emit('input');
		this._emit('change');
	}

	/**
	 * Whether a consumer put their own picker in the slot. As state, not read
	 * during render: the built-in picker has to disappear the moment something is
	 * slotted, otherwise both sit in the popover.
	 */
	@state()
	_hasSlottedPicker = false;

	private get _slottedPicker(): NLDDTimePicker | null {
		const slot = this.shadowRoot?.querySelector('slot[name="picker"]') as HTMLSlotElement | null;
		const found = slot?.assignedElements({ flatten: true })
			.find((el): el is NLDDTimePicker => el.localName === 'nldd-time-picker');
		return found ?? null;
	}

	public _handlePickerSlotChange(): void {
		this._hasSlottedPicker = this._slottedPicker !== null;
	}

	@state()
	_pickerOpen = false;

	private get _pickerTrigger(): HTMLElement | null {
		return this.shadowRoot?.querySelector('.time-field__picker-button nldd-icon-button') ?? null;
	}

	private get _popover(): NLDDPopover | null {
		return this.shadowRoot?.querySelector('nldd-popover') ?? null;
	}

	/** One name for the dialog, both as the accessible name and as the visible
	 *  title of the sheet. The field's own label says more than "Tijd kiezen" ever
	 *  can: a sheet headed "Starttijd" tells you what you are filling in. */
	public get _pickerLabel(): string {
		return this.accessibleLabel || this._t('components.time-field.to-pick-time-action');
	}

	public _handlePickerClick(): void {
		if (this._pickerOpen) this._popover?.hide();
		else this._popover?.show();
	}

	/** Where focus goes once the popover is closed. The popover restores focus to
	 *  the element from before it opened, and Safari does not focus a button on
	 *  click, so there it lands on the input instead of the button. We take over,
	 *  but only after that restore, otherwise ours gets overwritten. */
	private _focusTriggerOnClose = false;

	/** The value from before opening, and the last thing done in the picker.
	 *  Together they decide on close whether what stands in the selection stays
	 *  or falls back. The last action counts: an Escape that did not close the
	 *  popover is undone by scrolling on, and "Klaar" after it still confirms. */
	private _valueBeforePicker = '';
	private _pickerState: 'untouched' | 'touched' | 'confirmed' | 'cancelled' = 'untouched';

	/**
	 * Where the wheels open while the field is empty: `min` if there is one, and
	 * otherwise the current time rounded to the step. The same starting point the
	 * arrow keys use. An empty picker would show two columns on 00 with a colon
	 * between them, and then you scroll up from midnight to a time you already
	 * know.
	 *
	 * This does not set `value`: the field stays empty until you scroll or pick
	 * "Klaar".
	 */
	@state()
	private _pickerSeed = '';

	public get _pickerValue(): string {
		return this.value || this._pickerSeed;
	}

	/** Escape is canceling, a click beside it is not. The popover only reports
	 *  that it closed, so we catch the key ourselves, before the browser acts. */
	private _handlePickerEscape = (e: KeyboardEvent): void => {
		if (e.key === 'Escape') this._pickerState = 'cancelled';
	};

	public _handlePopoverToggle(e: Event): void {
		this._pickerOpen = (e as ToggleEvent).newState === 'open';
		if (this._pickerOpen) this._openPicker();
		else this._settlePicker();
		if (this._pickerOpen || !this._focusTriggerOnClose) return;
		this._focusTriggerOnClose = false;
		// Microtask, not rAF: this beats that same restore but does not get
		// throttled while the tab has no focus.
		queueMicrotask(() => this._pickerTrigger?.focus());
	}

	private _openPicker(): void {
		this._valueBeforePicker = this.value;
		this._pickerState = 'untouched';
		this._pickerSeed = this.value || startingPoint(this._rules, new Date());
		document.addEventListener('keydown', this._handlePickerEscape, true);
		// Only now does the picker have dimensions: while the popover was closed it
		// could not scroll the chosen value into view and the column sat at the top.
		// Wait for both renders, because the picker is only handed its starting
		// point above.
		void this.updateComplete.then(async () => {
			const picker = this._slottedPicker ?? this.shadowRoot?.querySelector('nldd-time-picker');
			if (!picker) return;
			await picker.updateComplete;
			picker.scrollSelectedIntoView();
		});
	}

	/**
	 * What happened while scrolling is a proposal, not an answer: the field shows
	 * it already, but only records it once you leave the picker in a way that
	 * keeps the choice. "Klaar" always does, a click beside it only when something
	 * has been chosen. Annuleer and Escape put the old value back.
	 *
	 * That way a picker opened by accident costs you nothing, and "Annuleer" is
	 * not a button that merely closes.
	 */
	private _settlePicker(): void {
		document.removeEventListener('keydown', this._handlePickerEscape, true);
		if (this._pickerState === 'untouched' || this._pickerState === 'cancelled') {
			if (this.value === this._valueBeforePicker) return;
			this.value = this._valueBeforePicker;
			this._emit('input');
			return;
		}
		// "Klaar" without touching anything: the starting point is what stands in
		// the selection, and that is exactly what you are confirming.
		if (!this.value && this._pickerSeed) {
			this.value = this._pickerSeed;
			this._emit('input');
		}
		if (this.value !== this._valueBeforePicker) this._emit('change');
	}

	/**
	 * The picker reports every change as `input` and only a confirmation as
	 * `change`. Scrolling therefore hands over the new time but does not close the
	 * popover: otherwise it snaps shut the moment you stop scrolling and you never
	 * saw the second column.
	 */
	public _handlePickerInput(e: Event): void {
		e.stopPropagation();
		const detail = (e as CustomEvent).detail as { value?: string };
		if (typeof detail?.value !== 'string') return;
		this._pickerState = 'touched';
		this.value = detail.value;
		this._emit('input');
	}

	/**
	 * Recording a value does not close the popover. A time has two parts, so
	 * setting the hour is half an answer. Closing on that and you would never
	 * reach the minutes. The calendar is different, because there one day is the
	 * whole answer. The field therefore reports its own `change` only on close.
	 */
	public _handlePickerChange(e: Event): void {
		e.stopPropagation();
		const detail = (e as CustomEvent).detail as { value?: string };
		if (typeof detail?.value !== 'string') return;
		this._pickerState = 'touched';
		this.value = detail.value;
	}

	public _handlePickerConfirm(e: Event): void {
		e.stopPropagation();
		this._pickerState = 'confirmed';
		this._closePicker();
	}

	/**
	 * Enter on a value in the selection does what Enter in a dialog always does: the
	 * default action, and here that is "Klaar". With the arrow keys you are still
	 * adjusting, so this is the key that says you are done.
	 *
	 * We skip the button underneath, because the browser already gives it a click
	 * on Enter.
	 */
	public _handlePickerKeydown(e: KeyboardEvent): void {
		if (e.key !== 'Enter') return;
		if ((e.target as HTMLElement | null)?.closest('nldd-button')) return;
		e.preventDefault();
		this._pickerState = 'confirmed';
		this._closePicker();
	}

	private _closePicker(): void {
		this._focusTriggerOnClose = true;
		this._popover?.hide();
	}

	public _handlePickerDismiss(e: Event): void {
		e.stopPropagation();
		this._pickerState = 'cancelled';
		// Same as after a choice: focus back on the button. Without this, Annuleer,
		// Escape and a click beside it leave focus on the input.
		this._focusTriggerOnClose = true;
		this._popover?.hide();
	}

	override formValue(): FormValue {
		return this.value;
	}

	/**
	 * What `value` cannot say. It holds a valid time or nothing, so text that is
	 * no time, a time outside min/max and an empty field all read as ''. The
	 * field tells them apart for the form; when to show it stays the caller's.
	 */
	override ownValidity(): OwnValidity | null {
		const problem = checkText(this._display, this._rules);
		return problem ? { flags: { [problem.flag]: true }, message: this._problemMessage(problem) } : null;
	}

	private _problemMessage(problem: TimeProblem): string {
		switch (problem.flag) {
			case 'badInput':
				return this._t('components.time-field.bad-input-error-text');
			case 'rangeUnderflow':
				return this._t('components.time-field.range-underflow-error-text').replace('{time}', problem.bound);
			case 'rangeOverflow':
				return this._t('components.time-field.range-overflow-error-text').replace('{time}', problem.bound);
		}
	}

	formResetCallback(): void {
		// The text as well: text that is no time leaves value empty, so a reset to
		// an empty value would not change value and the text would stay.
		this._display = this._initialValue;
		this.value = this._initialValue;
		this.commitFormValue();
	}

	formStateRestoreCallback(state: File | string | FormData | null): void {
		if (typeof state === 'string') this.value = state;
	}

	private _emit(type: 'input' | 'change'): void {
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent(type, {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	override firstUpdated(): void {
		this._initialValue = this.value;
		this.commitFormValue();
	}

	override willUpdate(changed: PropertyValues): void {
		// The one place the text follows `value`: set from outside, by a reset, by
		// the picker. Not while typing: there the text already commits to the
		// value, so it is left exactly as entered, and so is text outside the
		// bounds, which commits to nothing.
		if (changed.has('value') && this._commit(this._display) !== this.value) {
			this._display = this.value;
		}
	}

	override updated(changed: PropertyValues): void {
		const popover = this._popover;
		const trigger = this._pickerTrigger;
		if (popover && trigger && popover.anchorElement !== trigger) {
			popover.anchorElement = trigger;
		}
		if (changed.has('width')) {
			const w = this.width;
			// Unlike a text field the default here is an intrinsic width that fits a
			// time plus the icon, so 'full' has to say 100% explicitly instead of
			// falling back on that default.
			if (w === 'full') {
				this.style.setProperty('--_time-field-width', '100%');
			} else if (w === 'fit-content') {
				// Caught before CSS.supports, which would accept it as the keyword and
				// hand the width to the content of the shadow root. It is the default
				// calculation we want, only without the room the styles hold for a
				// validation icon — so the override comes off and the styles do the rest.
				this.style.removeProperty('--_time-field-width');
			} else if (w && CSS.supports('width', w)) {
				this.style.setProperty('--_time-field-width', w);
			} else {
				this.style.removeProperty('--_time-field-width');
			}
		}
	}

	override render() {
		return timeFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-time-field': NLDDTimeField;
	}
}
