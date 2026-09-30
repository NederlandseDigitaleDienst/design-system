import { html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDDatePicker } from './date-picker.js';
import { WEEKDAY_KEYS, MONTH_KEYS } from './date-picker.i18n.js';
import type { NLDDDatePickerTranslations } from './date-picker.i18n.js';
import './../../actions/icon-button/icon-button.js';
import './../../actions/button/button.js';
import './../../actions/button-bar/button-bar.js';
import './../../actions/menu/menu.js';

const TITLE_ID = 'date-picker-title';

/**
 * One part of the heading. With a single reachable month or year the chevron and
 * its menu are dropped: a menu that opens to confirm the only thing you already
 * know is worse than no menu, and the affordance promises a choice that is not
 * there.
 */
function renderTitlePart(
	component: NLDDDatePicker,
	part: 'month' | 'year',
	label: string,
	choices: number,
	expanded: boolean,
): TemplateResult {
	if (choices < 2) return html`<span class="date-picker__title-label">${label}</span>`;
	return html`
		<button class="date-picker__title-${part}-button"
			type="button"
			aria-haspopup="menu"
			aria-expanded=${expanded ? 'true' : 'false'}
		>
			${label}
			<span class="date-picker__title-picker-icon">
				<nldd-icon
					icon="chevron-down-small"
					aria-hidden="true"
				></nldd-icon>
			</span>
		</button>
	`;
}

/**
 * The month heading is a live region: without it a keyboard user paging through
 * months hears only day numbers change and never learns which month they are in.
 */
function renderHeader(component: NLDDDatePicker): TemplateResult {
	const months = component._months;
	const years = component._years;
	return html`
		<div class="date-picker__header">
			<h2 class="date-picker__title"
				id=${TITLE_ID}
				aria-live="polite"
			>
				${renderTitlePart(component, 'month', component._monthLabel, months.length, component._monthMenuOpen)}
				${renderTitlePart(component, 'year', String(component._viewYear), years.length, component._yearMenuOpen)}
			</h2>
			${months.length < 2 ? nothing : html`
				<nldd-menu class="date-picker__month-menu"
					accessible-label=${component._t('components.date-picker.choose-month-action')}
					width="176px"
					@toggle=${component._handleMonthMenuToggle}
				>
					${months.map((month) => html`
						<nldd-menu-item
							type="radio"
							text=${component._t(`components.date-picker.${MONTH_KEYS[month - 1]}-capitalize` as keyof NLDDDatePickerTranslations)}
							?selected=${month === component._viewMonth}
							@click=${() => component._handleMonthSelect(month)}
						></nldd-menu-item>
					`)}
				</nldd-menu>
			`}
			${years.length < 2 ? nothing : html`
				<nldd-menu class="date-picker__year-menu"
					accessible-label=${component._t('components.date-picker.choose-year-action')}
					max-items="8"
					width="136px"
					@toggle=${component._handleYearMenuToggle}
				>
					${years.map((year) => html`
						<nldd-menu-item
							type="radio"
							text=${String(year)}
							?selected=${year === component._viewYear}
							@click=${() => component._handleYearSelect(year)}
						></nldd-menu-item>
					`)}
				</nldd-menu>
			`}
			${component._stacked ? nothing : html`
				<div class="date-picker__pagination">
					${renderPagination(component, 'sm', 'neutral-base')}
				</div>
			`}
		</div>
	`;
}

/** The month arrows. "Vandaag" is a shortcut, not paging, and sits in the footer. */
function renderPagination(component: NLDDDatePicker, size: string, variant: string): TemplateResult {
	return html`
		<nldd-button-bar
			size=${size}
			variant=${variant}
		>
			<nldd-icon-button
				icon="chevron-left"
				text=${component._t('components.date-picker.view-previous-month-action')}
				tooltip-timing="never"
				@click=${() => component._shiftView(-1)}
			></nldd-icon-button>
			<nldd-button-bar-divider></nldd-button-bar-divider>
			<nldd-icon-button
				icon="chevron-right"
				text=${component._t('components.date-picker.view-next-month-action')}
				tooltip-timing="never"
				@click=${() => component._shiftView(1)}
			></nldd-icon-button>
		</nldd-button-bar>
	`;
}

/**
 * "Vandaag" sits bottom-left in both layouts. The header has room for a title
 * that spells out its month only once that button is out of it, and a shortcut
 * to today is not paging anyway. Stacked adds the month arrows bottom-right.
 */
function renderFooter(component: NLDDDatePicker, withPagination: boolean): TemplateResult {
	return html`
		<div class="date-picker__footer">
			<div class="date-picker__footer-start">
				${component._todayReachable ? html`
					<nldd-button
						size=${withPagination ? 'md' : 'sm'}
						variant="neutral-tinted"
						text=${component._t('components.date-picker.view-today-action')}
						@click=${component._handleToday}
					></nldd-button>
				` : nothing}
			</div>
			<div class="date-picker__footer-end">
				${withPagination ? renderPagination(component, 'md', 'neutral-tinted') : nothing}
			</div>
		</div>
	`;
}

/** `abbr` carries the full weekday so a screen reader is not left with "ma". */
function renderColumnHeaders(component: NLDDDatePicker): TemplateResult {
	return html`
		<tr>
			${component.weekNumbers ? html`
				<th class="date-picker__week-header-cell"
					scope="col"
					abbr=${component._t('components.date-picker.week-number-column-label')}
				>
					${component._t('components.date-picker.week-number-column-short-label')}
				</th>
			` : nothing}
			${component._weekdays.map((day) => html`
				<th class="date-picker__weekday-header-cell"
					scope="col"
					abbr=${component._t(`components.date-picker.${WEEKDAY_KEYS[day]}-lowercase` as keyof NLDDDatePickerTranslations)}
				>
					${component._t(`components.date-picker.${WEEKDAY_KEYS[day]}-short-lowercase` as keyof NLDDDatePickerTranslations)}
				</th>
			`)}
		</tr>
	`;
}

/**
 * Unavailable days are aria-disabled rather than disabled: the roving tabindex
 * has to be able to land on them, otherwise arrowing across a blocked stretch
 * silently skips days and the calendar feels broken.
 */
function renderDay(component: NLDDDatePicker, iso: string): TemplateResult {
	const unavailable = component._isUnavailable(iso);
	const selected = component._isSelected(iso);
	const band = component._bandFor(iso);
	return html`
		<td class="date-picker__day-cell"
			aria-selected=${selected ? 'true' : nothing}
		>
			<button class=${classMap({
				'date-picker__day': true,
				'is-selected': selected,
				'is-in-range': component._isInRange(iso),
				'is-range-start': band === 'start',
				'is-range-end': band === 'end',
				'is-today': component._isToday(iso),
				'is-outside-month': component._isOutsideMonth(iso),
				'is-unavailable': unavailable,
			})}
				type="button"
				data-date=${iso}
				tabindex=${iso === component._focused ? '0' : '-1'}
				aria-label=${component._dayLabel(iso)}
				aria-disabled=${unavailable ? 'true' : nothing}
				aria-current=${component._isToday(iso) ? 'date' : nothing}
				@click=${() => component._handleDayClick(iso)}
				@pointerdown=${(e: PointerEvent) => component._handleDayPointerDown(iso, e)}
				@mouseenter=${() => component._handleDayHover(iso)}
			>
				${band === 'none' ? nothing : html`<span class=${classMap({
					'date-picker__day-range-indicator': true,
					'is-start': band === 'start',
					'is-end': band === 'end',
				})}></span>`}
				<span class="date-picker__day-indicator"></span>
				<span class="date-picker__day-number">
					${Number(iso.slice(8, 10))}
				</span>
			</button>
		</td>
	`;
}

export function datePickerTemplate(component: NLDDDatePicker): TemplateResult {
	return html`
		<div class="date-picker">
			${renderHeader(component)}
			<table class="date-picker__calendar"
				role="grid"
				aria-label=${component.accessibleLabel || nothing}
				aria-labelledby=${component.accessibleLabel ? nothing : TITLE_ID}
				@keydown=${component._handleKeydown}
				@focusin=${component._handleDayFocusIn}
				@focusout=${component._handleDayFocusOut}
				@pointermove=${component._handleGridPointerMove}
				@mouseleave=${component._handleGridLeave}
			>
				<thead>
					${renderColumnHeaders(component)}
				</thead>
				<tbody>
					${component._weeks.map((week) => html`
						<tr>
							${component.weekNumbers ? html`
								<th class="date-picker__week-cell"
									scope="row"
									aria-label=${component._t('components.date-picker.week-number-label', { week: component._weekNumber(week) })}
								>
									${component._weekNumber(week)}
								</th>
							` : nothing}
							${week.map((iso) => renderDay(component, iso))}
						</tr>
					`)}
				</tbody>
			</table>
			${component._stacked || component._todayReachable
				? renderFooter(component, component._stacked)
				: nothing}
			<div class="date-picker__announcer"
				role="status"
				aria-live="polite"
			>
				${component._announcement}
			</div>
		</div>
	`;
}
