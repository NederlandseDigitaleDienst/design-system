import { html, nothing, TemplateResult } from 'lit';
import type { NLDDTimeField } from './time-field.js';
import './../../actions/icon-button/icon-button.js';
import './../../content/icon/icon.js';
import './../../layout/popover/popover.js';
import './../../layout/container/container.js';
import './../../layout/spacer/spacer.js';
import './../../actions/button/button.js';
import './../../navigation/top-title-bar/top-title-bar.js';
import './../time-picker/time-picker.js';

/* eslint-disable lit-a11y/no-autofocus -- Not autofocus on page load: nldd-popover
   reads this attribute to pick its focus target inside an overlay the user just
   opened. Without it focus stops on the popover itself and the arrow keys do
   nothing until you have tabbed into the selection yourself. */

/**
 * The popover pins both its left and its right edge, so an `auto` width
 * collapses and the picker hangs outside a zero-width box. Hence spelled out,
 * from the same token the picker measures its columns with: two columns of one
 * and a half control sizes, plus the colon between them and the container
 * padding.
 */
export const PICKER_POPOVER_WIDTH = 'calc(var(--semantics-controls-md-min-size) * 3 + var(--primitives-space-48) + var(--primitives-space-16) * 2)';

/** One branch for both states: two nearly identical copies drifted apart elsewhere. */
function renderValidationIcon(component: NLDDTimeField): TemplateResult | typeof nothing {
	const name = component.invalid ? 'invalid' : (component.valid ? 'valid' : '');
	if (!name) return nothing;
	return html`
		<div class="time-field__validation-icon-area">
			<span class="time-field__validation-icon">
				<nldd-icon
					icon=${name}
					aria-hidden="true"
				></nldd-icon>
			</span>
		</div>
	`;
}

/**
 * The picker hangs off the button, which sits at the end of the field, so
 * bottom-end lands it under the input. Against the left edge of the screen
 * Floating UI falls back to opening rightward on its own.
 */
function renderPicker(component: NLDDTimeField): TemplateResult | typeof nothing {
	if (component.noPicker) return nothing;
	// Read-only takes the picker away rather than dimming it: a button that can
	// never do anything is a promise the field cannot keep, and the value beside
	// it already says what kind of field this is. Disabled keeps its button,
	// because that one comes back.
	if (component.readonly) return nothing;
	const buttonSize = component.size === 'sm' ? 'xs' : 'sm';
	return html`
		<div class="time-field__picker-button">
			<nldd-icon-button
				variant="neutral-tinted"
				size=${buttonSize}
				icon="clock"
				text=${component._t('components.time-field.to-pick-time-action')}
				tooltip-timing="never"
				?disabled=${component.disabled}
				@click=${component._handlePickerClick}
			></nldd-icon-button>
			<nldd-popover
				accessible-label=${component._pickerLabel}
				placement="bottom-end"
				width=${PICKER_POPOVER_WIDTH}
				@toggle=${component._handlePopoverToggle}
			>
				<nldd-top-title-bar
					text=${component._pickerLabel}
					dismiss-text=${component._t('components.time-field.cancel-action')}
					@dismiss=${component._handlePickerDismiss}
				></nldd-top-title-bar>
				<nldd-container padding="16"
					@keydown=${component._handlePickerKeydown}
					@input=${component._handlePickerInput}
					@change=${component._handlePickerChange}
				>
					<slot name="picker"
						@slotchange=${component._handlePickerSlotChange}
					></slot>
					${component._hasSlottedPicker ? nothing : html`
						<nldd-time-picker
							autofocus
							width="full"
							value=${component._pickerValue || nothing}
							min=${component.min || nothing}
							max=${component.max || nothing}
							step=${component.step}
						></nldd-time-picker>
					`}
					<nldd-spacer size="16"></nldd-spacer>
					<nldd-button
						variant="neutral-tinted"
						size=${component._pickerButtonSize}
						width="full"
						text=${component._t('components.time-field.confirm-action')}
						@click=${component._handlePickerConfirm}
					></nldd-button>
				</nldd-container>
			</nldd-popover>
		</div>
	`;
}

export function timeFieldTemplate(component: NLDDTimeField): TemplateResult {
	return html`
		<div class="time-field">
			<input class="time-field__input"
				id=${component.inputId || nothing}
				type="text"
				inputmode="numeric"
				.value=${component._displayValue}
				placeholder=${component.placeholder || nothing}
				?disabled=${component.disabled}
				?readonly=${component.readonly}
				?required=${component.required}
				autocomplete=${component.autocomplete || nothing}
				aria-label=${component._fieldLabel || nothing}
				aria-invalid=${component.invalid ? 'true' : nothing}
				@keydown=${component._handleInputKeydown}
				@input=${component._handleInput}
				@change=${component._handleChange}
			>
			<div class="time-field__input-fade"></div>
			${renderValidationIcon(component)}
			${renderPicker(component)}
		</div>
	`;
}
