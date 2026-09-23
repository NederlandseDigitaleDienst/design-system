import { html, nothing, TemplateResult } from 'lit';
import type { NLDDDateField } from './date-field.js';
import './../../actions/icon-button/icon-button.js';
import './../../content/icon/icon.js';
import './../../layout/popover/popover.js';
import './../../layout/container/container.js';
import './../../navigation/top-title-bar/top-title-bar.js';
import './../date-picker/date-picker.js';

/**
 * The popover pins both its left and right edge, so an `auto` width collapses to
 * nothing and the calendar hangs outside a zero-wide box. Stated instead, from
 * the same token the calendar sizes its columns with, plus the container padding
 * on both sides - so the two stay in step if that token ever moves.
 */
export const PICKER_POPOVER_WIDTH = 'calc(var(--semantics-controls-md-min-size) * 7 + var(--primitives-space-16) * 2)';

/** One branch for both states: two near-identical copies drifted apart before. */
function renderValidationIcon(component: NLDDDateField): TemplateResult | typeof nothing {
	const name = component.invalid ? 'invalid' : (component.valid ? 'valid' : '');
	if (!name) return nothing;
	return html`
		<div class="date-field__validation-icon-area">
			<span class="date-field__validation-icon">
				<nldd-icon
					icon=${name}
					aria-hidden="true"
				></nldd-icon>
			</span>
		</div>
	`;
}

/* eslint-disable lit-a11y/no-autofocus -- Not autofocus on page load: nldd-popover
   reads this attribute to pick its focus target inside an overlay the user just
   opened. Without it focus stops on the popover itself and the arrow keys do
   nothing until you have tabbed into the grid yourself. */

/**
 * The calendar is nldd-date-picker in a popover rather than the browser's own.
 * The native one could not be closed in Safari: it ties dismissal to the input,
 * and that input has to be invisible for the button beside it to be the only
 * control.
 *
 * It hangs off the trigger, which sits at the end of the field, so bottom-start
 * would run the calendar out to the right and leave it barely touching the field
 * it belongs to. bottom-end lands it under the input instead; against the left
 * edge of the screen Floating UI falls back to opening rightward on its own.
 */
function renderPicker(component: NLDDDateField): TemplateResult | typeof nothing {
	if (component.noPicker) return nothing;
	// Read-only takes the picker away rather than dimming it: a button that can
	// never do anything is a promise the field cannot keep, and the value beside
	// it already says what kind of field this is. Disabled keeps its button,
	// because that one comes back.
	if (component.readonly) return nothing;
	const buttonSize = component.size === 'sm' ? 'xs' : 'sm';
	return html`
		<div class="date-field__picker-button">
			<nldd-icon-button
				variant="neutral-tinted"
				size=${buttonSize}
				icon="calendar"
				text=${component._t('components.date-field.to-pick-date-action')}
				tooltip-timing="never"
				?disabled=${component.disabled}
				@click=${component._handlePickerClick}
			></nldd-icon-button>
			<nldd-popover
				accessible-label=${component._pickerLabel}
				placement="bottom-end"
				width=${component._pickerPopoverWidth}
				@toggle=${component._handlePopoverToggle}
			>
				<nldd-top-title-bar
					text=${component._pickerLabel}
					dismiss-text=${component._t('components.date-field.cancel-action')}
					@dismiss=${component._handlePickerDismiss}
				></nldd-top-title-bar>
				<nldd-container
					padding="16"
					@change=${component._handlePickerChange}
				>
					<slot
						name="picker"
						@slotchange=${component._handlePickerSlotChange}
					></slot>
					${component._hasSlottedPicker ? nothing : html`
						<nldd-date-picker
							autofocus
							?range=${component.range}
							value=${!component.range ? (component.value || nothing) : nothing}
							start=${component.range ? (component._startValue || nothing) : nothing}
							end=${component.range ? (component._endValue || nothing) : nothing}
							min=${component.min || nothing}
							max=${component.max || nothing}
						></nldd-date-picker>
					`}
				</nldd-container>
			</nldd-popover>
		</div>
	`;
}

/**
 * One input per end. The field keeps a single accessible name for the group and
 * distinguishes the two inputs itself ("Periode, van"), so nldd-form-field can
 * go on setting one label and one id without knowing about periods.
 */
function renderInput(component: NLDDDateField, end: boolean): TemplateResult {
	const label = component.range
		? [component._fieldLabel, component._t(end
			? 'components.date-field.range-to-lowercase-label'
			: 'components.date-field.range-from-lowercase-label')].join(', ')
		: component._fieldLabel;
	return html`
		<input class="date-field__input"
			id=${!end ? (component.inputId || nothing) : nothing}
			type="text"
			inputmode="numeric"
			.value=${end ? component._displayEndValue : component._displayValue}
			placeholder=${component.placeholder || nothing}
			?disabled=${component.disabled}
			?readonly=${component.readonly}
			?required=${component.required}
			autocomplete=${!end ? (component.autocomplete || nothing) : nothing}
			aria-label=${label || nothing}
			aria-invalid=${component.invalid ? 'true' : nothing}
			@keydown=${(e: KeyboardEvent) => component._handleInputKeydown(e, end)}
			@input=${(e: Event) => component._handleInput(e, end)}
			@change=${(e: Event) => component._handleChange(e, end)}
		>
	`;
}

export function dateFieldTemplate(component: NLDDDateField): TemplateResult {
	return html`
		<div class="date-field"
			role=${component.range ? 'group' : nothing}
			aria-label=${component.range ? component._fieldLabel : nothing}
			@focusout=${component._handleFieldBlur}
		>
			${renderInput(component, false)}
			${component.range ? html`
				<span class="date-field__separator"
					aria-hidden="true"
				>
					${component._t('components.date-field.range-to-short-lowercase-label')}
				</span>
				${renderInput(component, true)}
			` : nothing}
			<div class="date-field__input-fade"></div>
			${renderValidationIcon(component)}
			${renderPicker(component)}
		</div>
	`;
}
