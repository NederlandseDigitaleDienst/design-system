import { html, nothing, TemplateResult } from 'lit';
import type { NLDDMultiLineTextField } from './multi-line-text-field.js';
import './../../content/icon/icon.js';

function renderValidationIcon(component: NLDDMultiLineTextField): TemplateResult | typeof nothing {
	if (component.invalid) {
		return html`
			<div class="multi-line-text-field__validation-icon-area">
				<nldd-icon class="multi-line-text-field__validation-icon"
					icon="invalid"
					aria-hidden="true"
				></nldd-icon>
			</div>
		`;
	}
	if (component.valid) {
		return html`
			<div class="multi-line-text-field__validation-icon-area">
				<nldd-icon class="multi-line-text-field__validation-icon"
					icon="valid"
					aria-hidden="true"
				></nldd-icon>
			</div>
		`;
	}
	return nothing;
}

export function multiLineTextFieldTemplate(component: NLDDMultiLineTextField): TemplateResult {
	return html`
		<div class="multi-line-text-field">
			<textarea class="multi-line-text-field__input"
				minlength=${component.minlength ?? nothing}
				maxlength=${component.maxlength ?? nothing}
				id=${component.inputId || nothing}
				rows=${component.rows}
				inputmode=${component.keyboard || nothing}
				enterkeyhint=${component.enterKey || nothing}
				.value=${component.value}
				placeholder=${component.placeholder || nothing}
				?disabled=${component.disabled}
				?readonly=${component.readonly}
				?required=${component.required}
				autocomplete=${component.autocomplete || nothing}
				spellcheck=${component.noSpellcheck ? 'false' : 'true'}
				aria-label=${component.accessibleLabel || nothing}
				aria-invalid=${component.invalid ? 'true' : nothing}
				@input=${component._handleInput}
				@change=${component._handleChange}
			></textarea>
			${renderValidationIcon(component)}
		</div>
	`;
}
