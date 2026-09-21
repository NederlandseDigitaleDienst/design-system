/**
 * Nederlandse Digitale Dienst Time Picker Component (Lit + TypeScript)
 *
 * Two columns, hours and minutes, that slide like a wheel past the selection in
 * the middle. The component works on its own (inline on a page, in a filter
 * panel) and also sits in the popover of nldd-time-field. Values are always
 * 24-hour `HH:mm`.
 *
 * Scrolling is choosing: whatever comes to rest in the middle is the value. The
 * keyboard drives that same selection, because that is what a wheel is: hour and
 * minute are each a spinbutton. The columns underneath are aria-hidden, so the
 * same values are not read out twice.
 *
 * @element nldd-time-picker
 *
 * @attr {string} value - The chosen time as `HH:mm` (24-hour).
 * @attr {string} min - Earliest allowed time as `HH:mm`. Also the base that `step` counts from.
 * @attr {string} max - Latest allowed time as `HH:mm`.
 * @attr {number} step - Step in minutes (default 1). Decides which minutes are in the column.
 * @attr {number} rows - Height of the columns in rows (default 7, minimum 3). The chosen value always sits in the middle, so an odd number shows whole rows and an even number cuts off half a row at the top and bottom.
 * @attr {string} width - Width: `full` fills the container, or pass your own CSS length.
 * @attr {string} accessible-label - Accessible name of the picker.
 * @attr {object} translations - Translations; unspecified keys fall back to Dutch.
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @fires input - On every change: scrolling, the arrow keys. detail: { value } with `HH:mm`.
 * @fires change - When the choice is confirmed: a click on a value or on the selection, or Enter. detail: { value } with `HH:mm`. Scrolling only fires `input`, because otherwise a field showing the picker in a popover would commit as soon as you stopped scrolling.
 */

import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { timePickerStyles } from './time-picker.styles.js';
import { timePickerTemplate } from './time-picker.template.js';
import { nlddTimePickerTranslations, type NLDDTimePickerTranslations } from './time-picker.i18n.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';

const LAST_MINUTE_OF_DAY = 23 * 60 + 59;

export function toMinutes(time: string): number {
	const [hours, minutes] = time.split(':');
	return Number(hours) * 60 + Number(minutes);
}

export function fromMinutes(total: number): string {
	return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function isTime(value: string): boolean {
	return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

@customElement('nldd-time-picker')
export class NLDDTimePicker extends DescribedBy(LitElement) {

	static override styles = timePickerStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	@property({ type: String })
	value = '';

	@property({ type: String })
	min = '';

	@property({ type: String })
	max = '';

	@property({ type: Number })
	step = 1;

	@property({ type: Number, reflect: true })
	rows = 7;

	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Object })
	translations: Partial<NLDDTimePickerTranslations> = {};

	/**
	 * Where scrolling has landed, per column, for as long as it is not recorded.
	 * Kept apart from `value`, which only records once scrolling comes to rest.
	 * Were the selection to show the recorded value, digits would slide past
	 * behind it while the number in the selection stayed put, and then it lies
	 * about where you are.
	 */
	@state()
	private _scrolledTo: { hours: number | null; minutes: number | null } = { hours: null, minutes: null };


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

	public _t(key: keyof NLDDTimePickerTranslations): string {
		return this.translations[key] ?? nlddTimePickerTranslations[key];
	}

	public get _label(): string {
		return this.accessibleLabel || this._t('components.time-picker.default-label');
	}

	private get _minMinutes(): number {
		return isTime(this.min) ? toMinutes(this.min) : 0;
	}

	private get _maxMinutes(): number {
		return isTime(this.max) ? toMinutes(this.max) : LAST_MINUTE_OF_DAY;
	}

	private get _stepMinutes(): number {
		return Math.max(1, Math.round(this.step));
	}

	/** Every valid time: from `min` (or midnight) in increments of `step`, up to
	 *  and including `max`. One list, because the two columns are projections of
	 *  it. That way an hour can never appear in its column without a valid minute
	 *  to go with it. */
	private get _slots(): number[] {
		const out: number[] = [];
		for (let m = this._minMinutes; m <= this._maxMinutes; m += this._stepMinutes) out.push(m);
		return out;
	}

	/** The hours for which at least one valid minute exists. */
	public get _hours(): number[] {
		return [...new Set(this._slots.map((m) => Math.floor(m / 60)))];
	}

	/** The minutes within the chosen hour. Without a chosen hour, those of the
	 *  first hour, so the column never looks empty before anything is picked. */
	public get _minutes(): number[] {
		const hour = this._selected === null ? this._hours[0] : Math.floor(this._selected / 60);
		return this._slots.filter((m) => Math.floor(m / 60) === hour).map((m) => m % 60);
	}

	/** The chosen time in minutes, or null while there is no valid value. */
	private get _selected(): number | null {
		if (!isTime(this.value)) return null;
		const minutes = toMinutes(this.value);
		return minutes >= this._minMinutes && minutes <= this._maxMinutes ? minutes : null;
	}

	public get _selectedHour(): number | null {
		return this._selected === null ? null : Math.floor(this._selected / 60);
	}

	public get _selectedMinute(): number | null {
		return this._selected === null ? null : this._selected % 60;
	}

	/** The number now standing in the selection: whatever lies in the middle while
	 *  scrolling, and otherwise simply the chosen value. */
	public get _centeredHour(): number | null {
		return this._scrolledTo.hours ?? this._selectedHour;
	}

	public get _centeredMinute(): number | null {
		return this._scrolledTo.minutes ?? this._selectedMinute;
	}

	/**
	 * Pick an hour or a minute. The hour holds on to the chosen minute when it
	 * fits inside it, so moving the hour keeps you on the same minute instead of
	 * jumping back to the start every time. When it does not fit (because of
	 * `min`, `max` or a step that does not work out), the first possible minute
	 * in that hour.
	 */
	public _select(column: 'hours' | 'minutes', number: number, commit = false): void {
		const slots = this._slots;
		if (slots.length === 0) return;
		let next: number;
		if (column === 'hours') {
			const wanted = this._selected === null ? null : this._selected % 60;
			const inHour = slots.filter((m) => Math.floor(m / 60) === number);
			if (inHour.length === 0) return;
			next = wanted !== null && inHour.includes(number * 60 + wanted)
				? number * 60 + wanted
				: inHour[0];
		} else {
			const hour = this._selected === null ? this._hours[0] : Math.floor(this._selected / 60);
			next = hour * 60 + number;
			if (!slots.includes(next)) return;
		}
		const changed = fromMinutes(next) !== this.value;
		this.value = fromMinutes(next);
		if (changed) this._emit('input');
		// change is the confirmation, not the change: a field showing the picker in
		// a popover records on it, and that must not happen the moment you stop
		// scrolling.
		if (commit) this._emit('change');
	}

	private _emit(type: 'input' | 'change'): void {
		this.dispatchEvent(new CustomEvent(type, {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	/**
	 * Arrow keys within a column, plus Home and End. The column is a single tab
	 * stop (roving tabindex), so Tab takes you to the next column instead of to
	 * the next value.
	 */
	public _handleKeydown(e: KeyboardEvent, column: 'hours' | 'minutes'): void {
		const numbers = column === 'hours' ? this._hours : this._minutes;
		if (numbers.length === 0) return;
		const current = column === 'hours' ? this._selectedHour : this._selectedMinute;
		const index = current === null ? -1 : numbers.indexOf(current);
		// Enter and space confirm what stands in the selection, the way a click does.
		// With the arrow keys you are still adjusting.
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			this._emit('change');
			return;
		}
		// Horizontal switches column, vertical moves the value: that way the arrows
		// move in the direction you see them point. Same split as the segments of a
		// native <input type="time">.
		if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
			e.preventDefault();
			this._focusColumn(e.key === 'ArrowLeft' ? 'hours' : 'minutes');
			return;
		}
		let next: number | null;
		switch (e.key) {
			case 'ArrowDown':
				next = numbers[Math.min(index + 1, numbers.length - 1)];
				break;
			case 'ArrowUp':
				next = numbers[index <= 0 ? 0 : index - 1];
				break;
			case 'Home':
				next = numbers[0];
				break;
			case 'End':
				next = numbers[numbers.length - 1];
				break;
			default:
				return;
		}
		e.preventDefault();
		if (next !== null) this._select(column, next);
	}

	/** Move focus to the spinbutton of the other column. */
	private _focusColumn(column: 'hours' | 'minutes'): void {
		this.shadowRoot
			?.querySelectorAll<HTMLElement>('.time-picker__value')[column === 'hours' ? 0 : 1]
			?.focus();
	}

	/**
	 * While we scroll ourselves (on opening, or after a choice) the scrolling must
	 * not pick something again: that would overwrite the choice just made with
	 * whatever happens to pass by.
	 */
	private _scrollingSelf = false;
	private _scrollTimers: Record<'hours' | 'minutes', number> = { hours: 0, minutes: 0 };
	private _selfScrollTimer = 0;

	/**
	 * Focus lands on the hour, the way nldd-date-picker focuses a day. The host
	 * itself forwards nowhere, so an overlay that focuses this picker would leave
	 * the arrow keys dead until the user tabbed into the selection themselves.
	 */
	override focus(options?: FocusOptions): void {
		const hour = this.shadowRoot?.querySelector<HTMLElement>('.time-picker__value');
		if (hour) hour.focus(options);
		else super.focus(options);
	}

	override disconnectedCallback(): void {
		// A settle timer that outlives the element still runs _select on it, which
		// dispatches input and change from something no longer in the document.
		clearTimeout(this._scrollTimers.hours);
		clearTimeout(this._scrollTimers.minutes);
		clearTimeout(this._selfScrollTimer);
		super.disconnectedCallback();
	}

	/**
	 * Scrolling is choosing: whatever comes to rest in the middle is the value.
	 * There is a `scrollend` event, but not everywhere, so this waits until
	 * scrolling has been still for 120ms. Short enough to feel immediate, long
	 * enough not to pick halfway through a swipe.
	 */
	public _handleScroll(e: Event, column: 'hours' | 'minutes'): void {
		if (this._scrollingSelf) return;
		// Clearing the timers on disconnect is not enough on its own: a scroll event
		// the browser had already queued still arrives afterwards and would set a
		// fresh one on an element that is no longer in the document.
		if (!this.isConnected) return;
		const el = e.currentTarget as HTMLElement;
		// The selection follows every movement, the value only records once at rest.
		const centered = this._centeredOption(el);
		if (centered !== null) this._scrolledTo = { ...this._scrolledTo, [column]: centered };
		// As an attribute and not as reactive state: this happens every scroll
		// frame, and re-rendering eighty values per frame is a waste.
		this.toggleAttribute('data-scrolling', true);
		clearTimeout(this._scrollTimers[column]);
		this._scrollTimers[column] = window.setTimeout(() => {
			this._selectCentred(column, el);
			this.toggleAttribute('data-scrolling', false);
		}, 120);
	}

	/** The number of the option closest to the middle of the column. */
	private _centeredOption(el: HTMLElement): number | null {
		const center = el.scrollTop + el.clientHeight / 2;
		let best: HTMLElement | null = null;
		let bestDistance = Infinity;
		for (const option of el.querySelectorAll<HTMLElement>('.time-picker__list-item')) {
			const distance = Math.abs(option.offsetTop + option.offsetHeight / 2 - center);
			if (distance < bestDistance) {
				bestDistance = distance;
				best = option;
			}
		}
		return best === null ? null : Number(best.textContent);
	}

	/** Records whatever came to rest in the middle. */
	private _selectCentred(column: 'hours' | 'minutes', el: HTMLElement): void {
		const centered = this._centeredOption(el);
		if (centered !== null) this._select(column, centered);
	}

	/**
	 * Put the chosen value in the middle of the view. The column is seven values
	 * tall, so `center` lands it on the fourth row with three above and three
	 * below.
	 *
	 * Public because a hidden element cannot be scrolled: with the picker in a
	 * popover it has no dimensions yet when the value is set, and scrollIntoView
	 * does nothing. The field therefore calls this as soon as the popover
	 * opens.
	 */
	public scrollSelectedIntoView(): void {
		this._scrollingSelf = true;
		for (const name of ['hours', 'minutes'] as const) {
			const column = this.shadowRoot?.querySelector<HTMLElement>(`[data-column="${name}"]`);
			const option = column?.querySelector<HTMLElement>('[data-selected]');
			if (!column || !option) continue;
			// Doing the math ourselves instead of scrollIntoView: that negotiates with
			// the snap points and with every scrollable ancestor, and does so
			// differently per browser. This is the exact inverse of _centeredOption, so
			// what we put down is also what we read back later.
			column.scrollTop = option.offsetTop + option.offsetHeight / 2 - column.clientHeight / 2;
		}
		// A little longer than the debounce above, so the scroll events from this
		// movement have all been ignored before we listen again.
		this._selfScrollTimer = window.setTimeout(() => { this._scrollingSelf = false; }, 200);
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('rows')) {
			// Odd or even makes no difference: the chosen value is centered, so with
			// an odd count you see whole rows and with an even one half a row runs off
			// the top and bottom. At least 3, because with 1 you only see the chosen
			// value and there is nothing to scroll.
			this.style.setProperty('--_rows', String(Math.max(3, Math.round(this.rows))));
		}
		if (changed.has('width')) {
			const w = this.width;
			if (w === 'full') this.style.setProperty('--_width', '100%');
			else if (w && CSS.supports('width', w)) this.style.setProperty('--_width', w);
			else this.style.removeProperty('--_width');
		}
		if (changed.has('value') || changed.has('min') || changed.has('max') || changed.has('step')) {
			// The selection follows the value again: it was just set from outside or
			// recorded, and in both cases it lines up with the middle.
			this._scrolledTo = { hours: null, minutes: null };
			this.scrollSelectedIntoView();
		}
	}

	/** The group is the widget; hour and minute are spinbuttons inside it. */
	override describedTarget(): Element | null {
		return this.shadowRoot?.querySelector('[role="group"]') ?? null;
	}

	override render() {
		return timePickerTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-time-picker': NLDDTimePicker;
	}
}
