/**
 * Nederlandse Digitale Dienst Date Picker Component (Lit + TypeScript)
 *
 * A calendar for picking a date or a period. The component works on its own
 * (inline on a page, in a filter panel) and also sits in the popover of
 * nldd-date-field.
 *
 * Values are always ISO (yyyy-mm-dd). With `range` the user picks a start and
 * an end date in two steps.
 *
 * @element nldd-date-picker
 *
 * @attr {string} value - The chosen date as ISO (yyyy-mm-dd). Only without `range`.
 * @attr {string} start - Start of the period as ISO. Only with `range`.
 * @attr {string} end - End of the period as ISO. Only with `range`.
 * @attr {boolean} range - Pick a period instead of a single date.
 * @attr {string} min - Earliest allowed date: ISO, or `today` with an offset (`today-18y`).
 * @attr {string} max - Latest allowed date: ISO, or `today` with an offset (`today+1y`).
 * @attr {number} first-day-of-week - First day of the week, 0 is Sunday. Default 1 (Monday).
 * @attr {boolean} week-numbers - Shows ISO week numbers in a column on the left.
 * @attr {string} width - Width: `full` (fills the container) or a CSS length (e.g. `560px`). Empty (default) is the intrinsic width of seven day cells; the cells stretch along with the width you pass.
 * @attr {string} accessible-label - Accessible name of the calendar.
 * @attr {object} translations - Translations; unspecified keys fall back to Dutch.
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @prop {(iso: string) => boolean} isDateUnavailable - Marks individual dates as not selectable, for example weekends or public holidays.
 *
 * @fires change - When a date or a complete period has been chosen. detail: { value } or { start, end }.
 * @fires input - Also on the intermediate step of a period, when only the start date is set.
 */

import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { breakpoints } from '../../../assets/styles/breakpoints.js';
import { isPointerMode } from '../../../utilities/input-modality.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { resolveDateBound, toIso } from '../../../utilities/resolve-date-bound.js';
import { datePickerStyles } from './date-picker.styles.js';
import { datePickerTemplate } from './date-picker.template.js';
import { nlddDatePickerTranslations, MONTH_KEYS, WEEKDAY_KEYS } from './date-picker.i18n.js';
import type { NLDDDatePickerTranslations } from './date-picker.i18n.js';
import './../../actions/icon-button/icon-button.js';
import './../../actions/button/button.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';

/**
 * All arithmetic runs on UTC-midnight Dates and ISO strings. UTC keeps a DST
 * transition from swallowing or repeating a day, and ISO strings compare
 * lexicographically, so a bounds check is a plain string comparison.
 */
function parseIso(iso: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!match) return null;
	const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
	return Number.isNaN(date.getTime()) ? null : date;
}

function isoOf(date: Date): string {
	return toIso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()) ?? '';
}

function addDays(iso: string, days: number): string {
	const date = parseIso(iso);
	if (!date) return iso;
	date.setUTCDate(date.getUTCDate() + days);
	return isoOf(date);
}

/** Clamped, like the bound resolver: 31 March plus a month is 30 April. */
function addMonths(iso: string, months: number): string {
	const date = parseIso(iso);
	if (!date) return iso;
	const day = date.getUTCDate();
	const total = date.getUTCFullYear() * 12 + date.getUTCMonth() + months;
	const year = Math.floor(total / 12);
	const month = ((total % 12) + 12) % 12 + 1;
	const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
	return toIso(year, month, Math.min(day, lastDay)) ?? iso;
}

function todayIso(): string {
	const now = new Date();
	return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate()) ?? '';
}

function firstOfMonth(iso: string): string {
	return `${iso.slice(0, 7)}-01`;
}

function lastOfMonth(iso: string): string {
	const date = parseIso(iso);
	if (!date) return iso;
	return toIso(date.getUTCFullYear(), date.getUTCMonth() + 1, new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()) ?? iso;
}

function weekdayOf(iso: string): number {
	return parseIso(iso)?.getUTCDay() ?? 0;
}

function startOfWeek(iso: string, firstDayOfWeek: number): string {
	const offset = (weekdayOf(iso) - firstDayOfWeek + 7) % 7;
	return addDays(iso, -offset);
}

/** Same month and day in another year, clamped: 29 February is not every year. */
function withYear(iso: string, year: number): string {
	const month = Number(iso.slice(5, 7));
	const day = Number(iso.slice(8, 10));
	const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
	return toIso(year, month, Math.min(day, lastDay)) ?? iso;
}

function withMonth(iso: string, month: number): string {
	const year = Number(iso.slice(0, 4));
	const day = Number(iso.slice(8, 10));
	// 31 January to February keeps the day it can reach, the same way withYear
	// handles 29 February in a common year.
	const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
	return toIso(year, month, Math.min(day, lastDay)) ?? iso;
}

function clampIso(iso: string, min: string, max: string): string {
	if (min && iso < min) return min;
	if (max && iso > max) return max;
	return iso;
}

@customElement('nldd-date-picker')
export class NLDDDatePicker extends DescribedBy(withTranslations<NLDDDatePickerTranslations>(
	LitElement,
	nlddDatePickerTranslations,
)) {
	static override styles = datePickerStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	@property({ type: String })
	value = '';

	@property({ type: String })
	start = '';

	@property({ type: String })
	end = '';

	/** Width: 'full' or a CSS length. Empty is the intrinsic seven-cell width. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	width = '';

	@property({ type: Boolean, reflect: true })
	range = false;

	@property({ type: String })
	min = '';

	@property({ type: String })
	max = '';

	@property({ type: Number, attribute: 'first-day-of-week' })
	firstDayOfWeek = 1;

	@property({ type: Boolean, reflect: true, attribute: 'week-numbers' })
	weekNumbers = false;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** Marks individual dates as unselectable - weekends, holidays, dates already booked. */
	@property({ attribute: false })
	isDateUnavailable?: (iso: string) => boolean;

	/** The date carrying the roving tabindex. */
	@state()
	_focused = '';

	/** First of the displayed month. */
	@state()
	_view = '';

	/** During a range selection: the date the user picked first. */
	@state()
	_anchor = '';

	/** Pointer preview of the range being drawn. Visual only - never announced. */
	@state()
	_hover = '';

	@state()
	_announcement = '';

	@state()
	_monthMenuOpen = false;

	@state()
	_yearMenuOpen = false;

	/**
	 * Stacked layout: the paging controls move below the grid and grow to md. Not
	 * compact: everything gets roomier, tuned for fingers and narrow viewports.
	 * Driven from JS rather than a media query because the two layouts are not the
	 * same buttons in another place - side by side they are one bar, below they
	 * split into "Vandaag" on the left and the month arrows on the right, and CSS
	 * cannot regroup a component's children.
	 *
	 * Coarse pointers count too, not just narrow screens: a touch tablet has room
	 * for the wide layout but the same need for larger targets.
	 */
	@state()
	_stacked = false;

	private _stackedQuery?: MediaQueryList;

	private _handleStackedChange = (): void => {
		this._stacked = Boolean(this._stackedQuery?.matches);
	};

	public async _handleMonthMenuToggle(e: Event): Promise<void> {
		this._monthMenuOpen = (e as ToggleEvent).newState === 'open';
		if (this._monthMenuOpen) await this._openMenuOnSelection('.date-picker__month-menu');
	}

	public async _handleYearMenuToggle(e: Event): Promise<void> {
		this._yearMenuOpen = (e as ToggleEvent).newState === 'open';
		if (this._yearMenuOpen) await this._openMenuOnSelection('.date-picker__year-menu');
	}

	private async _openMenuOnSelection(selector: string): Promise<void> {
		// The menu sets its own focus after its update resolves, so waiting for that
		// first is what keeps it from overwriting the line below.
		const menu = this.shadowRoot?.querySelector(selector) as (HTMLElement & { updateComplete?: Promise<unknown> }) | null;
		await menu?.updateComplete;
		// The year list runs to a hundred years or more, and the menu starts on its
		// first item - so an arrow key walks a century back from the year you are
		// actually looking at. Move to the entry in view instead, and scroll it into
		// sight. The month list is shorter but wants the same behavior.
		const focusSelected = (): void => {
			const selected = menu?.querySelector<HTMLElement>('nldd-menu-item[selected]');
			if (!selected || this.shadowRoot?.activeElement === selected) return;
			// Both of these scroll every scrollable ancestor by default, and the page
			// is one of them - opening the menu would shift what is behind it.
			selected.scrollIntoView({ block: 'nearest' });
			selected.focus({ preventScroll: true });
		};
		requestAnimationFrame(focusSelected);
		// The menu finishes its own opening sequence after that frame and takes focus
		// back, so that one hand-over is redirected rather than raced with a longer
		// delay. Properly this belongs in nldd-menu: any menu with a current value
		// should open on it.
		menu?.addEventListener('focusin', (event) => {
			if (event.target === menu) focusSelected();
		}, { once: true });
	}

	/** Set when the keyboard moved focus, so only then is focus pulled to a cell. */
	private _restoreFocus = false;


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

	override connectedCallback(): void {
		super.connectedCallback();
		if (!this._focused) this._focused = this._initialFocus();
		if (!this._view) this._view = firstOfMonth(this._focused);
		this._stackedQuery = window.matchMedia(`(max-width: ${breakpoints.smMax}), (pointer: coarse)`);
		this._stacked = this._stackedQuery.matches;
		this._stackedQuery.addEventListener('change', this._handleStackedChange);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		document.removeEventListener('pointerup', this._onDocumentPointerUp);
		this._stackedQuery?.removeEventListener('change', this._handleStackedChange);
	}

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		// A consumer setting a value moves the calendar to it, but typing in a
		// connected field should not yank the month away mid-selection, so the view
		// only follows when the new value sits outside the month on screen.
		if (changed.has('value') || changed.has('start') || changed.has('end')) {
			const anchorDate = this.range ? (this.start || this.end) : this.value;
			if (anchorDate && firstOfMonth(anchorDate) !== this._view) {
				this._view = firstOfMonth(anchorDate);
				this._focused = anchorDate;
			}
		}
	}

	override updated(changed: PropertyValues): void {
		// Mirrored to an attribute so the host's own rules can key on it; consumers
		// are not meant to set it.
		this.toggleAttribute('stacked', this._stacked);

		if (changed.has('width')) {
			const w = this.width;
			// `full` says 100% explicitly; anything else flows through CSS.supports
			// so a typo falls back to the intrinsic width instead of breaking layout.
			if (w === 'full') {
				this.style.setProperty('--_width', '100%');
			} else if (w && CSS.supports('width', w)) {
				this.style.setProperty('--_width', w);
			} else {
				this.style.removeProperty('--_width');
			}
		}

		// Two associations the menu cannot make itself here. It resolves a string
		// anchor with document.getElementById, which cannot see into a shadow root,
		// so the element is handed over directly. And it leaves the native invoker
		// link to the anchor component - nldd-button sets that up via `expandable` -
		// which a plain button does not do, so without this the title never opens
		// anything.
		for (const part of ['month', 'year'] as const) {
			const menu = this.shadowRoot?.querySelector(`.date-picker__${part}-menu`) as (HTMLElement & { anchorElement?: Element | null }) | null;
			const title = this.shadowRoot?.querySelector(`.date-picker__title-${part}-button`) as HTMLButtonElement | null;
			if (!menu || !title) continue;
			if (menu.anchorElement !== title) menu.anchorElement = title;
			if (title.popoverTargetElement !== menu) title.popoverTargetElement = menu;
		}

		if (!this._restoreFocus) return;
		this._restoreFocus = false;
		this._focusedCell()?.focus();
	}

	private _focusedCell(): HTMLElement | null {
		return this.shadowRoot?.querySelector('.date-picker__day[tabindex="0"]') ?? null;
	}

	/**
	 * Focus lands on the day carrying the roving tabindex - the chosen date, or
	 * today when there is none. Without this an overlay that focuses the calendar
	 * would land on its host, which forwards nowhere, leaving the arrow keys dead
	 * until the user has tabbed into the grid themselves.
	 */
	override focus(options?: FocusOptions): void {
		const cell = this._focusedCell();
		if (cell) cell.focus(options);
		else super.focus(options);
	}

	private _initialFocus(): string {
		const preferred = (this.range ? this.start : this.value) || todayIso();
		return clampIso(preferred, this._min, this._max);
	}

	// — Bounds ———————————————————————————————————————————————————————————————

	public get _min(): string {
		return resolveDateBound(this.min);
	}

	public get _max(): string {
		return resolveDateBound(this.max);
	}

	/** Out of bounds means unreachable; unavailable means visible but not selectable. */
	public _isOutOfBounds(iso: string): boolean {
		const min = this._min;
		const max = this._max;
		return Boolean((min && iso < min) || (max && iso > max));
	}

	public _isUnavailable(iso: string): boolean {
		if (this._isOutOfBounds(iso)) return true;
		return this.isDateUnavailable?.(iso) ?? false;
	}

	// — Grid —————————————————————————————————————————————————————————————————

	/** Weekday numbers in display order, honouring first-day-of-week. */
	public get _weekdays(): number[] {
		return Array.from({ length: 7 }, (_, i) => (this.firstDayOfWeek + i) % 7);
	}

	/**
	 * Six weeks of real dates, including the days either side of the month. Those
	 * neighbors are selectable and jump the calendar to their own month, which
	 * beats paging for a date a few days over the boundary. Every cell announces
	 * its full date, so a 1st from the next month can never be mistaken for this
	 * one.
	 *
	 * Always six rows: a month that needs five would otherwise resize the calendar
	 * as you page through it, which in a popover moves everything below it.
	 */
	public get _weeks(): string[][] {
		const lead = (weekdayOf(this._view) - this.firstDayOfWeek + 7) % 7;
		const start = addDays(this._view, -lead);
		return Array.from({ length: 6 }, (_, week) =>
			Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
	}

	public _isOutsideMonth(iso: string): boolean {
		return iso.slice(0, 7) !== this._view.slice(0, 7);
	}

	/**
	 * The ISO week of the row, taken from its Thursday. ISO weeks are anchored on
	 * Thursday, so reading it off any other day would give the wrong number for
	 * rows that do not start on Monday.
	 */
	public _weekNumber(week: string[]): number {
		const thursday = week.find((iso) => weekdayOf(iso) === 4) ?? week[0];
		const date = parseIso(thursday);
		if (!date) return 0;
		const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
		firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
		return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
	}

	public get _viewYear(): number {
		return Number(this._view.slice(0, 4));
	}

	public get _viewMonth(): number {
		return Number(this._view.slice(5, 7));
	}

	/**
	 * Months offered in the title menu, bounded by min and max the way the year
	 * list is. Without this the menu lists twelve months while a bound quietly
	 * clamps eleven of them back to the one you were already on.
	 *
	 * The arrows page the view past a bound (only the focused day is clamped), so
	 * the month on screen is not necessarily one you can choose. It is left out
	 * when it falls outside, and the menu then shows no selection - which is the
	 * truth: you are looking at a month this calendar will not accept.
	 */
	public get _months(): number[] {
		const minYear = this._min ? Number(this._min.slice(0, 4)) : null;
		const maxYear = this._max ? Number(this._max.slice(0, 4)) : null;
		// Paged a whole year past a bound: no month of this view year is
		// choosable, so there is nothing to offer. Comparing only the month
		// numbers here would fall back to all twelve, one falsely selected.
		if (minYear !== null && this._viewYear < minYear) return [];
		if (maxYear !== null && this._viewYear > maxYear) return [];
		const first = minYear === this._viewYear ? Number(this._min.slice(5, 7)) : 1;
		const last = maxYear === this._viewYear ? Number(this._max.slice(5, 7)) : 12;
		if (last < first) return [];
		return Array.from({ length: last - first + 1 }, (_, i) => first + i);
	}

	/**
	 * Years offered in the title menu. Bounded by min and max where they are set,
	 * because those already say which years can be reached; without them a window
	 * wide enough for a birthdate on one side and for planning on the other.
	 */
	public get _years(): number[] {
		const current = Number(todayIso().slice(0, 4));
		// A bound is a hard edge and stays where it is. The default window is an
		// arbitrary one, so it stretches to whatever year the arrows reached rather
		// than leaving the menu without a selection.
		const first = this._min ? Number(this._min.slice(0, 4)) : Math.min(current - 120, this._viewYear);
		const last = this._max ? Number(this._max.slice(0, 4)) : Math.max(current + 20, this._viewYear);
		if (last < first) return [];
		return Array.from({ length: last - first + 1 }, (_, i) => first + i);
	}

	public _handleMonthSelect(month: number): void {
		this._view = firstOfMonth(clampIso(withMonth(this._view, month), this._min, this._max));
		this._focused = clampIso(withMonth(this._focused, month), this._min, this._max);
		this._restoreFocus = Boolean(this._focusedCell());
		this._closeMenu('.date-picker__month-menu');
	}

	public _handleYearSelect(year: number): void {
		this._view = firstOfMonth(clampIso(withYear(this._view, year), this._min, this._max));
		this._focused = clampIso(withYear(this._focused, year), this._min, this._max);
		this._restoreFocus = Boolean(this._focusedCell());
		this._closeMenu('.date-picker__year-menu');
	}

	/**
	 * Radio items keep their menu open, which is right when you are ticking
	 * several - but here one month or one year is the whole answer.
	 */
	private _closeMenu(selector: string): void {
		const menu = this.shadowRoot?.querySelector(selector) as (HTMLElement & { hidePopover?: () => void }) | null;
		if (menu?.matches(':popover-open')) menu.hidePopover?.();
	}

	/**
	 * Dutch writes month names in lower case, so the capital here is the ordinary
	 * sentence-initial one of a heading, not a proper noun. The translation itself
	 * stays lower case because it is reused mid-sentence in the day labels.
	 */
	public get _monthLabel(): string {
		return this._t(`components.date-picker.${MONTH_KEYS[this._viewMonth - 1]}-capitalize` as keyof NLDDDatePickerTranslations);
	}

	// — Cell state ———————————————————————————————————————————————————————————

	public _isSelected(iso: string): boolean {
		if (!this.range) return iso === this.value;
		// Both ends of the preview, not just the committed ones: while drawing, the
		// day under the pointer is the end date and has to look like it, or the band
		// runs to a day that carries no mark at all.
		const [from, to] = this._previewSpan();
		if (from && to) return iso === from || iso === to;
		return iso === this.start || iso === this.end;
	}

	/**
	 * How the range band runs through this day. Derived from one span so the
	 * pointer preview and a committed period draw identically, and so the band
	 * stops at the middle of the first and last day instead of filling their whole
	 * cell - the fill marks the end, the band only connects the days between.
	 */
	public _bandFor(iso: string): 'none' | 'full' | 'start' | 'end' {
		if (!this.range) return 'none';
		const [from, to] = this._previewSpan();
		if (!from || !to || from === to) return 'none';
		if (iso > from && iso < to) return 'full';
		if (iso === from) return 'start';
		if (iso === to) return 'end';
		return 'none';
	}

	/** Strictly between the ends, including the pointer preview while drawing. */
	public _isInRange(iso: string): boolean {
		return this._bandFor(iso) === 'full';
	}

	private _previewSpan(): [string, string] {
		if (this.start && this.end) return [this.start, this.end];
		if (this._anchor && this._hover) {
			return this._anchor < this._hover ? [this._anchor, this._hover] : [this._hover, this._anchor];
		}
		return ['', ''];
	}

	public _isToday(iso: string): boolean {
		return iso === todayIso();
	}

	/**
	 * The date on its own, without the markers a cell carries. The announcements
	 * use this: taking the whole cell label turned them into "vrijdag 10 juli 2026,
	 * begin van de periode tot en met ...", which drops the cell's status halfway
	 * through the sentence.
	 */
	public _dateText(iso: string): string {
		const date = parseIso(iso);
		if (!date) return '';
		const weekday = this._t(`components.date-picker.${WEEKDAY_KEYS[date.getUTCDay()]}-lowercase` as keyof NLDDDatePickerTranslations);
		const month = this._t(`components.date-picker.${MONTH_KEYS[date.getUTCMonth()]}-lowercase` as keyof NLDDDatePickerTranslations);
		return this._t('components.date-picker.date-label', {
			weekday,
			day: date.getUTCDate(),
			month,
			year: date.getUTCFullYear(),
		});
	}

	public _dayLabel(iso: string): string {
		const date = parseIso(iso);
		if (!date) return '';
		const parts = [this._dateText(iso)];
		if (this._isToday(iso)) parts.push(this._t('components.date-picker.today-lowercase'));
		const awaitingSecond = this.range && this._anchor !== '' && this.end === '';
		if (awaitingSecond && iso === this._anchor) {
			parts.push(this._t('components.date-picker.range-anchor-lowercase-label'));
		} else {
			if (this.range && iso === this.start) parts.push(this._t('components.date-picker.range-start-lowercase-label'));
			if (this.range && iso === this.end) parts.push(this._t('components.date-picker.range-end-lowercase-label'));
		}
		if (this._isInRange(iso)) parts.push(this._t('components.date-picker.in-range-lowercase-label'));
		if (this._isUnavailable(iso)) parts.push(this._t('components.date-picker.unavailable-lowercase-label'));
		return parts.join(', ');
	}

	// — Navigation ———————————————————————————————————————————————————————————

	public _shiftView(months: number): void {
		const next = addMonths(this._view, months);
		this._view = next;
		// Keep the roving tabindex on an equivalent day in the new month so the
		// keyboard does not jump back to the 1st on every month change. Only the
		// tabindex: focus stays on the arrow that was activated, so paging twice
		// is pressing the same control twice. Keyboard paging from inside the
		// grid (PageUp/PageDown) runs through _moveFocus, which does re-focus.
		const day = Math.min(Number(this._focused.slice(8, 10)), Number(lastOfMonth(next).slice(8, 10)));
		this._focused = clampIso(`${next.slice(0, 7)}-${String(day).padStart(2, '0')}`, this._min, this._max);
	}

	private _moveFocus(iso: string): void {
		const target = clampIso(iso, this._min, this._max);
		this._focused = target;
		if (firstOfMonth(target) !== this._view) this._view = firstOfMonth(target);
		// Only reached from the keydown handler, so the ring is certain here. Stated
		// rather than asked of the modality module, which depends on that keydown
		// having reached the document listener before focus moves - an ordering this
		// component has no reason to rely on.
		this._focusFromKeyboard = true;
		this._restoreFocus = true;
	}

	public _handleKeydown(e: KeyboardEvent): void {
		const iso = this._focused;
		let next: string;
		switch (e.key) {
			case 'ArrowLeft': next = addDays(iso, -1); break;
			case 'ArrowRight': next = addDays(iso, 1); break;
			case 'ArrowUp': next = addDays(iso, -7); break;
			case 'ArrowDown': next = addDays(iso, 7); break;
			case 'Home': next = startOfWeek(iso, this.firstDayOfWeek); break;
			case 'End': next = addDays(startOfWeek(iso, this.firstDayOfWeek), 6); break;
			case 'PageUp': next = addMonths(iso, e.shiftKey ? -12 : -1); break;
			case 'PageDown': next = addMonths(iso, e.shiftKey ? 12 : 1); break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				this._select(iso);
				return;
			default:
				return;
		}
		e.preventDefault();
		this._moveFocus(next);
	}

	// — Selection ————————————————————————————————————————————————————————————

	public _handleDayClick(iso: string): void {
		// A drag ends with a click on the day it was released over; that day was
		// already handled on pointerup, so this one would start a second range.
		if (this._suppressClick) {
			this._suppressClick = false;
			return;
		}
		this._select(iso);
	}

	public _handleDayHover(iso: string): void {
		if (this.range && this._anchor) this._hover = iso;
	}

	/**
	 * A day focused by pointer should not show a ring. Browsers treat programmatic
	 * focus as focus-visible, and opening the calendar with the mouse focuses a day,
	 * so the ring would appear without anyone using the keyboard. Arrow keys switch
	 * the modality back, so navigating reveals it again.
	 *
	 * If this never runs the class is simply absent and the ring shows - the
	 * accessible outcome is the default.
	 */
	/** Set by keyboard navigation; consumed by the focus it causes. */
	private _focusFromKeyboard = false;

	public _handleDayFocusIn(e: FocusEvent): void {
		const fromPointer = this._focusFromKeyboard ? false : isPointerMode();
		this._focusFromKeyboard = false;
		(e.target as HTMLElement)?.classList?.toggle('is-pointer-focus', fromPointer);
	}

	public _handleDayFocusOut(e: FocusEvent): void {
		(e.target as HTMLElement)?.classList?.remove('is-pointer-focus');
	}

	public _handleGridLeave(): void {
		if (this._dragOrigin) return;
		this._hover = '';
	}

	// — Dragging —————————————————————————————————————————————————————————————

	/** Where the pointer went down; empty when no drag is in progress. */
	private _dragOrigin = '';

	/** Set once the pointer has actually moved to another day. */
	private _dragged = false;

	private _suppressClick = false;

	/**
	 * Dragging is for pointer devices only. On touch a horizontal drag across a
	 * calendar is indistinguishable from scrolling the page, and taking the
	 * gesture would leave a sheet you cannot scroll. Tapping twice still works
	 * everywhere, so nothing is lost.
	 */
	public _handleDayPointerDown(iso: string, e: PointerEvent): void {
		// Cleared here rather than trusting the click to consume it. After a drag the
		// click fires on the nearest common ancestor of the day it started on and the
		// day it ended on - the grid, not a day - so the day handler never runs and a
		// leftover flag would swallow the next real click instead.
		this._suppressClick = false;
		if (!this.range || e.pointerType === 'touch') return;
		if (this._isUnavailable(iso)) return;
		this._dragOrigin = iso;
		this._dragged = false;
		document.addEventListener('pointerup', this._onDocumentPointerUp);
	}

	public _handleGridPointerMove(e: PointerEvent): void {
		if (!this._dragOrigin) return;
		const iso = this._dayUnderPointer(e);
		if (!iso || iso === this._dragOrigin) return;
		// The range only starts once the pointer has left the day it went down on,
		// so a plain click still runs through the click handler untouched.
		if (!this._dragged) {
			this._dragged = true;
			this._beginRange(this._dragOrigin);
		}
		this._hover = iso;
	}

	private _dayUnderPointer(e: PointerEvent): string {
		const element = this.shadowRoot?.elementFromPoint(e.clientX, e.clientY);
		return element?.closest('.date-picker__day')?.getAttribute('data-date') ?? '';
	}

	private _onDocumentPointerUp = (e: PointerEvent): void => {
		document.removeEventListener('pointerup', this._onDocumentPointerUp);
		const origin = this._dragOrigin;
		this._dragOrigin = '';
		if (!this._dragged) return;
		this._dragged = false;
		this._suppressClick = true;

		const iso = this._dayUnderPointer(e);
		// Released off the grid or on a blocked day: keep the start and wait for a
		// second click rather than inventing an end date.
		if (!iso || this._isUnavailable(iso)) return;
		// Dragging backwards means the range runs the other way. That is not the
		// ambiguous case the restart rule guards against - here the direction was
		// spelled out by the gesture - so the ends are simply sorted.
		this._commitRange(origin, iso);
	};

	private _select(iso: string): void {
		if (this._isUnavailable(iso)) return;
		this._focused = iso;
		// Choosing a neighboring month's day brings that month into view, so the
		// selection stays visible instead of sitting on a day that scrolls away.
		if (this._isOutsideMonth(iso)) this._view = firstOfMonth(iso);

		if (!this.range) {
			this.value = iso;
			this._announce(this._t('components.date-picker.date-selected-text', { date: this._dateText(iso) }));
			this._emit('change', { value: iso });
			return;
		}

		// No anchor, or a finished range: this click starts a new one.
		if (!this._anchor || (this.start && this.end)) {
			this._beginRange(iso);
			return;
		}

		// Picking before the anchor completes the period backwards rather than
		// starting over. The hover preview already draws the band that way, and
		// dragging backwards already reverses, so restarting here would be the one
		// behavior contradicting what the calendar just showed. Beginning again is
		// still one click away, since a finished period restarts on the next click.
		this._commitRange(this._anchor, iso);
	}

	/** Any blocked day between two ends, inclusive. The endpoints are checked
	 *  before we get here; this is the interior the endpoint checks miss. */
	private _rangeHasUnavailable(from: string, to: string): boolean {
		const [start, end] = from < to ? [from, to] : [to, from];
		for (let day = start; day <= end; day = addDays(day, 1)) {
			if (this._isUnavailable(day)) return true;
		}
		return false;
	}

	private _commitRange(from: string, to: string): void {
		// A range may not span a blocked day. Both ends can be available while a
		// booked day sits between them, and committing that would fire change with
		// a period that visibly contains an unavailable date. Keep the anchor so
		// the user can pick a different end.
		if (this._rangeHasUnavailable(from, to)) {
			this._announce(this._t('components.date-picker.range-blocked-text'));
			return;
		}
		this.start = from < to ? from : to;
		this.end = from < to ? to : from;
		this._anchor = '';
		this._hover = '';
		this._announce(this._t('components.date-picker.range-selected-text', {
			start: this._dateText(this.start),
			end: this._dateText(this.end),
		}));
		this._emit('change', { start: this.start, end: this.end });
	}

	private _beginRange(iso: string): void {
		this._anchor = iso;
		this.start = iso;
		this.end = '';
		this._hover = '';
		this._announce(this._t('components.date-picker.range-anchor-text', { date: this._dateText(iso) }));
		this._emit('input', { start: iso, end: '' });
	}

	private _announce(message: string): void {
		this._announcement = message;
	}

	private _emit(type: 'input' | 'change', detail: Record<string, string>): void {
		this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
	}

	/**
	 * Whether today can be reached at all. Outside the bounds the button is a lie:
	 * it would clamp to the nearest allowed date, so on a birthdate calendar
	 * "Vandaag" would quietly jump eighteen years back.
	 */
	public get _todayReachable(): boolean {
		return !this._isOutOfBounds(todayIso());
	}

	/**
	 * Jumps the calendar back to the current month without choosing anything.
	 * Navigation and selection are kept apart: someone who paged away to look
	 * around wants a way back, not a date they did not ask for.
	 */
	public _handleToday(): void {
		const today = todayIso();
		this._view = firstOfMonth(today);
		this._focused = today;
	}

	/** The grid is the widget; focus roves over the days inside it. */
	override describedTarget(): Element | null {
		return this.shadowRoot?.querySelector('[role="grid"]') ?? null;
	}

	override render() {
		return datePickerTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-date-picker': NLDDDatePicker;
	}
}
