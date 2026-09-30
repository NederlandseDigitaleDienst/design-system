import { html, nothing, TemplateResult } from 'lit';
import type { NLDDTextField } from './text-field.js';
import './../../content/icon/icon.js';

function renderValidationIcon(component: NLDDTextField): TemplateResult | typeof nothing {
	if (component.invalid) {
		return html`
			<div class="text-field__validation-icon-area">
				<nldd-icon class="text-field__validation-icon"
					icon="invalid"
					aria-hidden="true"
				></nldd-icon>
			</div>
		`;
	}
	if (component.valid) {
		return html`
			<div class="text-field__validation-icon-area">
				<nldd-icon class="text-field__validation-icon"
					icon="valid"
					aria-hidden="true"
				></nldd-icon>
			</div>
		`;
	}
	return nothing;
}

export function textFieldTemplate(component: NLDDTextField): TemplateResult {
	return html`
		<div class="text-field">
			<input class="text-field__input"
				pattern=${component.pattern || nothing}
				minlength=${component.minlength ?? nothing}
				maxlength=${component.maxlength ?? nothing}
				id=${component.inputId || nothing}
				type=${component.type}
				inputmode=${component.keyboard || nothing}
				enterkeyhint=${component.enterKey || nothing}
				.value=${component.value}
				placeholder=${component.placeholder || nothing}
				?disabled=${component.disabled}
				?readonly=${component.readonly}
				?required=${component.required}
				name=${component.name || nothing}
				autocomplete=${component.autocomplete || nothing}
				spellcheck=${component.noSpellcheck ? 'false' : 'true'}
				aria-label=${component.accessibleLabel || nothing}
				aria-invalid=${component.invalid ? 'true' : nothing}
				@keydown=${component._handleKeydown}
				@input=${component._handleInput}
				@change=${component._handleChange}
			/>
			<div class="text-field__input-fade"></div>
			${renderValidationIcon(component)}
		</div>
	`;
}
