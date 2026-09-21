/**
 * Nederlandse Digitale Dienst Date Field Component (Lit + TypeScript)
 *
 * A text field for a date, with an optional calendar in a popover. The value is
 * always ISO (yyyy-mm-dd); on screen it shows the Dutch notation (dd-mm-yyyy).
 * Typing is not masked: input is accepted generously and normalized only when
 * the field is left.
 *
 * Error messages belong to nldd-form-field, not here. This field reflects only
 * `invalid` / `valid`, like nldd-text-field.
 *
 * @element nldd-date-field
 *
 * @attr {string} value - The date as ISO (yyyy-mm-dd). With `range` an ISO 8601 interval: `yyyy-mm-dd/yyyy-mm-dd`. Empty when there is no valid date.
 * @attr {boolean} range - Pick a period: two inputs and a calendar in range mode.
 * @attr {string} min - Earliest allowed date as ISO (yyyy-mm-dd).
 * @attr {string} max - Latest allowed date as ISO (yyyy-mm-dd).
 * @attr {boolean} no-picker - Hides the calendar button. It is shown by default.
 * @attr {string} placeholder - Placeholder text. Do not put a format here; use the supporting label of nldd-form-field for that.
 * @attr {string} input-id - Sets the id on the internal input. Set automatically by nldd-form-field.
 * @attr {string} size - 'md' (default) | 'sm'. Set automatically by nldd-form-field.
 * @attr {boolean} invalid - Marks the field as invalid.
 * @attr {boolean} valid - Marks the field as valid.
 * @attr {boolean} disabled - Disabled state.
 * @attr {boolean} readonly - Read-only state.
 * @attr {boolean} required - Required state.
 * @attr {string} name - Name for form submission.
 * @attr {string} autocomplete - Autocomplete hint, for example 'bday'.
 * @attr {string} accessible-label - Accessible label for the internal input. Set automatically by nldd-form-field.
 * @attr {string} width - Width. By default exactly wide enough for a date plus the icons; 'full' fills the container; 'fit-content' drops the room for the validation icon and grows again as soon as the field turns valid or invalid; or pass your own CSS length.
 * @attr {object} translations - Translations; unspecified keys fall back to Dutch.
 *
 * @slot picker - Your own nldd-date-picker instead of the default calendar. The field keeps setting `value`, `min`, `max` and `range`; use the slot for what only a calendar knows: `week-numbers`, `first-day-of-week`, `is-date-unavailable` and its own translations.
 *
 * @fires input - On every change. detail: { value } with the ISO date, or '' while there is no valid date.
 * @fires change - When the value is committed. detail: { value } with the ISO date, or ''.
 */

import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { toIso, resolveDateBound } from '../../../utilities/resolve-date-bound.js';
import { dateFieldStyles } from './date-field.styles.js';
import { dateFieldTemplate, PICKER_POPOVER_WIDTH } from './date-field.template.js';
import { nlddDateFieldTranslations } from './date-field.i18n.js';
import type { NLDDDateFieldTranslations } from './date-field.i18n.js';
import type { NLDDDatePicker } from './../date-picker/date-picker.js';
import type { NLDDPopover } from './../../layout/popover/popover.js';
import './../../actions/icon-button/icon-button.js';
import './../../content/icon/icon.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';

/**
 * Read a typed date generously. Deliberately not a mask: reformatting per
 * keystroke moves the caret, breaks backspace mid-value and confuses screen
 * readers, so we accept what people type and normalize once on commit.
 * Accepts 12-3-2026, 12/03/2026, 12.03.2026, 12032026 and ISO yyyy-mm-dd.
 */
function parseDate(raw: string): string | null {
	const trimmed = raw.trim();
	if (trimmed === '') return null;
	// A leading four-digit group can only be a year, so ISO is checked first.
	const iso = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(trimmed);
	if (iso) return toIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));
	const dutch = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(trimmed);
	if (dutch) return toIso(Number(dutch[3]), Number(dutch[2]), Number(dutch[1]));
	const bare = /^(\d{2})(\d{2})(\d{4})$/.exec(trimmed);
	if (bare) return toIso(Number(bare[3]), Number(bare[2]), Number(bare[1]));
	return null;
}

/** ISO 8601 writes an interval as start/end, so the value needs no invention. */
const RANGE_SEPARATOR = '/';

/** ISO to the Dutch notation shown on screen. */
function formatDisplay(iso: string): string {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!match) return '';
	return `${match[3]}-${match[2]}-${match[1]}`;
}

@customElement('nldd-date-field')
export class NLDDDateField extends DescribedBy(FormAssociated(LitElement)) {

	static override shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	static override styles = dateFieldStyles;

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

	@property({ type: Boolean, reflect: true })
	range = false;

	@property({ type: String })
	min = '';

	@property({ type: String })
	max = '';

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


	/** Optional fixed width. Without a value the field fills its container. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';

	/** Override one or more translation keys. Keys left out fall back to Dutch. */
	@property({ type: Object })
	translations: Partial<NLDDDateFieldTranslations> = {};

	/** What the user sees and types. Kept apart from `value`, which stays ISO. */
	@state()
	private _display = '';

	/** The same, for the end of a period. */
	@state()
	private _displayEnd = '';

	/**
	 * The two ends of `value` while range is on. `value` stays the single source
	 * of truth - one shape in markup, as a property and in form data - and these
	 * are only the halves it is composed from.
	 */
	public get _startValue(): string {
		return this.range ? (this.value.split(RANGE_SEPARATOR)[0] ?? '') : this.value;
	}

	public get _endValue(): string {
		return this.range ? (this.value.split(RANGE_SEPARATOR)[1] ?? '') : '';
	}

	private _setRange(start: string, end: string): void {
		this.value = start === '' && end === '' ? '' : `${start}${RANGE_SEPARATOR}${end}`;
	}

	/**
	 * Put the earlier date first when both ends are filled. Typing a period
	 * backwards ("van 2027 t/m 2026") otherwise stays backwards, while the calendar
	 * always sorts a dragged range - so the two input methods disagreed. Returns
	 * whether it swapped, so the caller emits change only when something moved.
	 */
	private _sortRange(): boolean {
		if (!this.range) return false;
		const start = this._startValue;
		const end = this._endValue;
		if (!start || !end || start <= end) return false;
		this._setRange(end, start);
		return true;
	}

	/**
	 * Sort on leaving the whole field, not per change: swapping mid-edit would move
	 * a value you just typed in one input into the other.
	 *
	 * relatedTarget stays inside the shadow tree while focus moves between the two
	 * inputs or to the calendar button, so only null or an element outside the
	 * field means focus truly left.
	 */
	public _handleFieldBlur(e: FocusEvent): void {
		const next = e.relatedTarget as Node | null;
		if (next && this.shadowRoot?.contains(next)) return;
		if (this._sortRange()) this._emit('change');
	}

	/**
	 * A typed date the calendar would refuse must not commit either. min/max are
	 * forwarded to the calendar, which blocks out-of-range days, but typed input
	 * bypassed that check, so a value the picker cannot produce slipped through.
	 * The bounds may be relative (today, today+3m), so they are resolved first.
	 * ISO strings compare lexically, so `<` / `>` are the date order.
	 */
	private _withinBounds(iso: string): boolean {
		const min = this.min ? resolveDateBound(this.min) : '';
		const max = this.max ? resolveDateBound(this.max) : '';
		if (min && iso < min) return false;
		if (max && iso > max) return false;
		return true;
	}

	/** The parsed date, or '' when it is unparseable or out of bounds. Both cases
	 *  leave the raw text standing so the user can see and fix what they wrote. */
	private _commit(parsed: string | null): string {
		return parsed && this._withinBounds(parsed) ? parsed : '';
	}

	/**
	 * Whether a consumer put their own calendar in the slot. Kept as state rather
	 * than read during render: the built-in calendar has to disappear the moment
	 * one is slotted, or both would be in the popover at once.
	 */
	@state()
	_hasSlottedPicker = false;

	private get _slottedPicker(): NLDDDatePicker | null {
		const slot = this.shadowRoot?.querySelector('slot[name="picker"]') as HTMLSlotElement | null;
		const found = slot?.assignedElements({ flatten: true })
			.find((el): el is NLDDDatePicker => el.localName === 'nldd-date-picker');
		return found ?? null;
	}

	public _handlePickerSlotChange(): void {
		this._hasSlottedPicker = this._slottedPicker !== null;
	}

	/**
	 * The field owns what a form owns - the value, the bounds, whether this is a
	 * period - and writes those onto a slotted calendar every render, so a
	 * consumer cannot set them to something the field would disagree with. What
	 * only a calendar knows (week numbers, first day of the week, which dates are
	 * unavailable, its own translations) is left untouched: that is the point of
	 * slotting one.
	 */
	private _syncSlottedPicker(): void {
		const picker = this._slottedPicker;
		if (!picker) return;
		picker.range = this.range;
		picker.min = this.min;
		picker.max = this.max;
		if (this.range) {
			picker.start = this._startValue;
			picker.end = this._endValue;
		} else {
			picker.value = this.value;
		}
		// nldd-popover reads this to pick its focus target inside the overlay.
		picker.toggleAttribute('autofocus', true);
	}

	override firstUpdated(): void {
		this._initialValue = this.value;
		this._handlePickerSlotChange();
	}

	override willUpdate(changed: PropertyValues): void {
		// Reformat only when `value` moved on its own (set by a consumer, a form
		// reset, the picker). While typing, the parse of `_display` already equals
		// `value`, so the text is left exactly as entered.
		if (!changed.has('value') && !changed.has('range')) return;
		if (changed.has('range')) {
			// value keeps one shape per mode. Entering range mode with a bare date
			// makes it the interval's start; leaving it collapses to that start.
			if (this.range && this.value && !this.value.includes(RANGE_SEPARATOR)) {
				this.value = `${this.value}${RANGE_SEPARATOR}`;
			} else if (!this.range && this.value.includes(RANGE_SEPARATOR)) {
				this.value = this.value.split(RANGE_SEPARATOR)[0] ?? '';
			}
		}
		if ((parseDate(this._display) ?? '') !== this._startValue) {
			this._display = this._startValue === '' ? '' : formatDisplay(this._startValue);
		}
		if ((parseDate(this._displayEnd) ?? '') !== this._endValue) {
			this._displayEnd = this._endValue === '' ? '' : formatDisplay(this._endValue);
		}
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('width')) {
			const w = this.width;
			// Unlike a text field, the default here is an intrinsic width that fits a
			// date plus its icons - so 'full' has to say 100% explicitly instead of
			// falling back to that default.
			if (w === 'full') {
				this.style.setProperty('--_width', '100%');
			} else if (w === 'fit-content') {
				// Caught before CSS.supports, which would accept it as the keyword and
				// hand the width to the content of the shadow root. It is the default
				// calculation we want, only without the room the styles hold for a
				// validation icon — so the override comes off and the styles do the rest.
				this.style.removeProperty('--_width');
			} else if (w && CSS.supports('width', w)) {
				this.style.setProperty('--_width', w);
			} else {
				this.style.removeProperty('--_width');
			}
		}
		// The popover resolves a string anchor with document.getElementById, which
		// cannot see into a shadow root, so the trigger is handed over directly.
		const popover = this._popover;
		const trigger = this._pickerTrigger;
		if (popover && trigger && popover.anchorElement !== trigger) {
			popover.anchorElement = trigger;
		}
		this._syncSlottedPicker();
	}

	formResetCallback(): void {
		this.value = this._initialValue;
	}


	formStateRestoreCallback(state: File | string | FormData | null): void {
		if (typeof state === 'string') this.value = state;
	}

	// — i18n —————————————————————————————————————————————————————————————————

	public _t(key: keyof NLDDDateFieldTranslations): string {
		return this.translations[key] ?? nlddDateFieldTranslations[key];
	}

	/**
	 * The field's accessible name, with a fallback so the input is never nameless.
	 * nldd-form-field sets accessible-label to the field's label, so this fallback
	 * only fires standalone, where there is otherwise no name at all (WCAG 4.1.2).
	 */
	public get _fieldLabel(): string {
		return this.accessibleLabel
			|| this._t(this.range ? 'components.date-field.default-range-label' : 'components.date-field.default-label');
	}

	// — Picker ———————————————————————————————————————————————————————————————

	/**
	 * The calendar is nldd-date-picker in a popover, not the browser's own. The
	 * native showPicker() has no closing counterpart and fires no open or close
	 * events, and Safari ties dismissal to the input itself - which has to be
	 * invisible for the button beside it to be the only control. There it could
	 * not be closed at all.
	 */
	@state()
	_pickerOpen = false;

	private get _pickerTrigger(): HTMLElement | null {
		return this.shadowRoot?.querySelector('.date-field__picker-button nldd-icon-button') ?? null;
	}

	private get _popover(): NLDDPopover | null {
		return this.shadowRoot?.querySelector('nldd-popover') ?? null;
	}

	/**
	 * One name for the dialog, used both as its accessible name and as the sheet's
	 * visible title. The field's own label says more than "Datum kiezen" ever
	 * could - a sheet headed "Geboortedatum" tells you what you are answering.
	 */
	public get _pickerLabel(): string {
		return this.accessibleLabel || this._t('components.date-field.to-pick-date-action');
	}

	public _handlePickerClick(): void {
		if (this._pickerOpen) this._popover?.hide();
		else this._popover?.show();
	}

	/**
	 * Where focus should land once the popover has closed. Set by whatever closes
	 * it, read on the close toggle. The popover restores focus to the pre-open
	 * element itself - and Safari, which does not focus a button on click, restores
	 * to the text input rather than the calendar button - so leaving it to the
	 * popover lands focus in the wrong place. We take over, but only after its
	 * restoration has run, or ours would be the one overwritten.
	 */
	private _focusOnClose: 'trigger' | 'end' | null = null;

	/**
	 * Move focus to where the close intent asked for, with the caret at the end of
	 * the end field for a period so an edit continues where the choice was made.
	 * Run on a microtask after the close toggle: the popover (and Safari, which does
	 * not focus a button on click) restores focus during that event, so only running
	 * after its synchronous work wins. A microtask rather than a frame - it beats the
	 * same restoration but is not throttled while the tab is unfocused.
	 */
	private _applyCloseFocus(): void {
		const intent = this._focusOnClose;
		this._focusOnClose = null;
		if (intent === 'trigger') {
			this._pickerTrigger?.focus();
			return;
		}
		if (intent === 'end') {
			const end = this.shadowRoot?.querySelectorAll('.date-field__input')[1] as HTMLInputElement | undefined;
			if (!end) return;
			end.focus();
			const caret = end.value.length;
			end.setSelectionRange(caret, caret);
		}
	}

	public _handlePickerDismiss(e: Event): void {
		e.stopPropagation();
		// Same as after a choice: put focus back on the calendar button. Without it
		// Cancel, Escape and an outside click leave focus on the text input, which
		// is inconsistent with the change path.
		this._focusOnClose = 'trigger';
		this._popover?.hide();
	}

	/**
	 * The popover width, bound in the template. A reactive @state, not a direct
	 * mutation of the popover: lit dirty-checks its own binding, so setting
	 * popover.width from the outside was never undone on a later render, and a
	 * popover once widened for a slotted picker stayed wide after that picker
	 * was gone. Owning the value here lets lit reset it.
	 */
	@state()
	_pickerPopoverWidth = PICKER_POPOVER_WIDTH;

	public _handlePopoverToggle(e: Event): void {
		this._pickerOpen = (e as ToggleEvent).newState === 'open';
		if (!this._pickerOpen) {
			// The popover restores focus to the pre-open element during this same
			// event; take it from there on the next microtask, after that restoration
			// has run, so the caret ends where the intent asked.
			queueMicrotask(() => this._applyCloseFocus());
			return;
		}
		// Clicking the button blurs an input within the shadow tree, so the field
		// blur never sorts a backwards period. Sort here too, so the calendar opens
		// on the range the way it will be stored.
		if (this._sortRange()) this._emit('change');
		this._fitPopoverToSlottedPicker();
	}

	/**
	 * The popover pins both its inline edges, so it cannot size to its own
	 * content: `auto` and `max-content` both collapse it to zero width. The
	 * built-in calendar has a known width, but a slotted one need not - week
	 * numbers add a whole column - so that one is measured once it is on screen.
	 * Falls back to the built-in width when there is no slotted picker, so it
	 * never stays stuck at a stale measured value.
	 */
	private _fitPopoverToSlottedPicker(): void {
		const picker = this._slottedPicker;
		if (!picker) {
			this._pickerPopoverWidth = PICKER_POPOVER_WIDTH;
			return;
		}
		const width = picker.getBoundingClientRect().width;
		if (width > 0) this._pickerPopoverWidth = `calc(${Math.ceil(width)}px + var(--primitives-space-16) * 2)`;
	}

	/**
	 * The picker speaks ISO already, so there is nothing to convert. A finished
	 * period lands the caret at the end of the end field - you just settled the
	 * second date, so that is where an edit continues - while a single date is final
	 * in one click and returns to the calendar button.
	 */
	public _handlePickerChange(e: Event): void {
		e.stopPropagation();
		const detail = (e as CustomEvent).detail as { value?: string; start?: string; end?: string };
		if (this.range) {
			if (typeof detail?.start !== 'string' || typeof detail?.end !== 'string') return;
			this._setRange(detail.start, detail.end);
			this._focusOnClose = 'end';
		} else {
			if (typeof detail?.value !== 'string') return;
			this.value = detail.value;
			this._focusOnClose = 'trigger';
		}
		this._popover?.hide();
		this._emit('change');
	}

	// — Actions ——————————————————————————————————————————————————————————————

	/**
	 * Backspace on an empty end field steps back to the end of the start field, so
	 * a whole period can be cleared in one run of backspaces instead of reaching for
	 * the mouse to move between the two inputs.
	 */
	public _handleInputKeydown(e: KeyboardEvent, end: boolean): void {
		// Enter first: the browser would have submitted the form from here if
		// this input were not in a shadow root.
		if (submitOnEnter(this, e)) return;
		if (!this.range || !end || e.key !== 'Backspace') return;
		const input = e.target as HTMLInputElement;
		if (input.value !== '') return;
		const start = this.shadowRoot?.querySelector('.date-field__input') as HTMLInputElement | null;
		if (!start) return;
		e.preventDefault();
		start.focus();
		const caret = start.value.length;
		start.setSelectionRange(caret, caret);
	}

	public _handleInput(e: Event, end = false): void {
		e.stopPropagation();
		const text = (e.target as HTMLInputElement).value;
		// `value` holds a real, in-range date or nothing at all, never a half-typed
		// string and never a date the calendar would refuse.
		const parsed = this._commit(parseDate(text));
		if (end) this._displayEnd = text;
		else this._display = text;
		if (this.range) this._setRange(end ? this._startValue : parsed, end ? parsed : this._endValue);
		else this.value = parsed;
		this._emit('input');
	}

	public _handleChange(e: Event, end = false): void {
		e.stopPropagation();
		const text = (e.target as HTMLInputElement).value;
		const committed = this._commit(parseDate(text));
		// Normalize on commit: 12/3/2026 settles as 12-03-2026. Text that is
		// unparseable or out of bounds is left standing so the user can fix it.
		const shown = committed ? formatDisplay(committed) : text;
		if (end) this._displayEnd = shown;
		else this._display = shown;
		if (this.range) this._setRange(end ? this._startValue : committed, end ? committed : this._endValue);
		else this.value = committed;
		this._emit('change');
	}

	override formValue(): FormValue {
		return this.value;
	}

	private _emit(type: 'input' | 'change'): void {
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent(type, {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	public get _displayValue(): string {
		return this._display;
	}

	public get _displayEndValue(): string {
		return this._displayEnd;
	}

	override render() {
		return dateFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-date-field': NLDDDateField;
	}
}
