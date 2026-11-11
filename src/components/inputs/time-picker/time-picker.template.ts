import { html, nothing, TemplateResult } from 'lit';
import type { NLDDTimePicker } from './time-picker.js';

/* eslint-disable lit-a11y/click-events-have-key-events -- The values in a column
   are clickable but carry no keyboard path of their own: the column is
   aria-hidden scenery and the spinbuttons in the selection are the control. A
   listener here would put the same values in the tab order twice. */

function pad(number: number): string {
	return String(number).padStart(2, '0');
}

/**
 * One column of values. Scenery as far as the screen reader is concerned: the
 * meaning and the controls live in the selection, so no roles and no tab stops
 * here, otherwise the same values appear in it twice. Plain elements and not
 * buttons, because a focusable element inside an aria-hidden subtree is not
 * allowed: clicking one would move focus into a part the screen reader cannot
 * see.
 */
function renderColumn(
	component: NLDDTimePicker,
	column: 'hours' | 'minutes',
	numbers: number[],
	selected: number | null,
): TemplateResult {
	return html`
		<div class="time-picker__list"
			role="presentation"
			aria-hidden="true"
			data-column=${column}
			@keydown=${(e: KeyboardEvent) => component._handleKeydown(e, column)}
			@scroll=${(e: Event) => component._handleScroll(e, column)}
			@scrollend=${(e: Event) => component._handleScrollEnd(e, column)}
			@wheel=${component._takeOver}
			@touchstart=${component._takeOver}
			@pointerdown=${component._takeOver}
		>
			${numbers.map((number) => {
				const isSelected = number === selected;
				return html`
					<div class="time-picker__list-item"
						data-selected=${isSelected ? 'true' : nothing}
						@click=${() => component._select(column, number, true)}
					>
						${pad(number)}
					</div>
				`;
			})}
		</div>
	`;
}

/**
 * A value in the selection, as a spinbutton. The selection covers the columns opaquely,
 * so this is the digit you read. What lies underneath needs no styling of its
 * own, it is hidden anyway. The columns are aria-hidden, and a spinbutton is
 * exactly what a wheel is. Separate tab stops for hour and minute, so Tab
 * switches between the two and the arrows move the value.
 */
function renderSelectionValue(
	component: NLDDTimePicker,
	column: 'hours' | 'minutes',
	value: number | null,
	label: string,
): TemplateResult {
	const numbers = column === 'hours' ? component._hours : component._minutes;
	return html`
		<span class="time-picker__value"
			role="spinbutton"
			tabindex="0"
			aria-label=${label}
			aria-valuenow=${value ?? nothing}
			aria-valuemin=${numbers[0] ?? nothing}
			aria-valuemax=${numbers[numbers.length - 1] ?? nothing}
			aria-valuetext=${value === null ? nothing : pad(value)}
			@keydown=${(e: KeyboardEvent) => component._handleKeydown(e, column)}
		>
			${value === null ? '' : pad(value)}
		</span>
	`;
}

export function timePickerTemplate(component: NLDDTimePicker): TemplateResult {
	return html`
		<div class="time-picker"
			role="group"
			aria-label=${component._label}
		>
			<div class="time-picker__selection">
				${renderSelectionValue(component, 'hours', component._centeredHour, component._t('components.time-picker.hours-label'))}
				<span class="time-picker__value-separator"
					aria-hidden="true"
				>
					:
				</span>
				${renderSelectionValue(component, 'minutes', component._centeredMinute, component._t('components.time-picker.minutes-label'))}
			</div>
			${renderColumn(
				component,
				'hours',
				component._hours,
				component._selectedHour,
			)}
			<span class="time-picker__gap"
				aria-hidden="true"
			></span>
			${renderColumn(
				component,
				'minutes',
				component._minutes,
				component._selectedMinute,
			)}
		</div>
	`;
}
