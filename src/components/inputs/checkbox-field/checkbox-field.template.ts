import { html, nothing, TemplateResult } from 'lit';
import type { NLDDCheckboxField } from './checkbox-field.js';
import '../checkbox/checkbox.js';

/* eslint-disable lit-a11y/click-events-have-key-events -- label wrapper delegates to inner checkbox */
export function checkboxFieldTemplate(component: NLDDCheckboxField): TemplateResult {
	return html`
		<div class="checkbox-field"
			@click=${component._handleLabelClick}
		>
			<div class="checkbox-field__control">
				<nldd-checkbox
					color=${component.color || nothing}
					?invalid=${component.invalid}
					?required=${component.required && !component._inGroup}
					?checked=${component.checked}
					?indeterminate=${component.indeterminate}
					?disabled=${component.disabled}
					name=${component.name || nothing}
					value=${component.value}
					accessible-label=${component.label || nothing}
					@change=${component._handleChange}
				></nldd-checkbox>
			</div>
			<span class="checkbox-field__label"
				id="label"
			>
				${component.label}
			</span>
		</div>
		<div class="checkbox-field__children"
			role=${component._childFields.length > 0 ? 'group' : nothing}
			aria-labelledby=${component._childFields.length > 0 ? 'label' : nothing}
		>
			<slot
				name="children"
				@slotchange=${component._handleChildrenSlotChange}
			></slot>
		</div>
	`;
}
