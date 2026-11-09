import { html, nothing, TemplateResult } from 'lit';
import type { NLDDSwatchPicker, NLDDSwatchPickerItem } from './swatch-picker.js';
import '../../content/tooltip/tooltip.js';

export function swatchPickerTemplate(component: NLDDSwatchPicker): TemplateResult {
	// The group carries `required`, on a hidden radio of its own that is checked
	// as soon as a swatch is chosen: the swatches are ARIA radios and have no
	// input to read it from. The name puts it in a group, without which a radio
	// never reports a missing value.
	return html`
		<input class="swatch-picker__validation-input"
			type="radio"
			name="nldd-validation"
			hidden
			?required=${component.required}
			?disabled=${component.disabled}
			.checked=${!!component.value}
		>
		<div class="swatch-picker">
			<slot @slotchange=${component._onSlotChange}></slot>
		</div>
	`;
}

export function swatchPickerItemTemplate(component: NLDDSwatchPickerItem): TemplateResult {
	return html`
		<nldd-tooltip
			text=${component._name || nothing}
			placement="top"
			timing="instant"
		>
			<span class="swatch-picker__item">
				${component.image
					? html`<img class="swatch-picker__item-image" src=${component.image} srcset=${component.imageSrcset || nothing} alt="">`
					: nothing}
				<span class="swatch-picker__item-indicator"
					aria-hidden="true"
				>
					<span class="swatch-picker__item-indicator-icon">
						<nldd-icon icon="check-mark-small"></nldd-icon>
					</span>
				</span>
			</span>
		</nldd-tooltip>
	`;
}
