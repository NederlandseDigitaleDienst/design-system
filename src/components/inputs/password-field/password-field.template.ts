import { html, nothing, TemplateResult } from 'lit';
import type { NLDDPasswordField } from './password-field.js';
import './../../content/icon/icon.js';
import './../../actions/button/button.js';

function renderValidationIcon(component: NLDDPasswordField): TemplateResult | typeof nothing {
	if (component.invalid) {
		return html`
			<div class="password-field__validation-icon-area">
				<nldd-icon class="password-field__validation-icon"
					icon="invalid"
					aria-hidden="true"
				></nldd-icon>
			</div>
		`;
	}
	if (component.valid) {
		return html`
			<div class="password-field__validation-icon-area">
				<nldd-icon class="password-field__validation-icon"
					icon="valid"
					aria-hidden="true"
				></nldd-icon>
			</div>
		`;
	}
	return nothing;
}

function renderVisibilityToggle(component: NLDDPasswordField): TemplateResult {
	const buttonSize = component.size === 'sm' ? 'xs' : 'sm';
	const label = component.masked ? component.showButtonText : component.hideButtonText;
	const accessibleLabel = component.masked ? component.showButtonAccessibleLabel : component.hideButtonAccessibleLabel;

	return html`
		<div class="password-field__visibility-toggle-button">
			<nldd-button
				size=${buttonSize}
				type="button"
				text=${label}
				accessible-label=${accessibleLabel}
				?disabled=${component.disabled}
				@click=${component._handleToggle}
				@pointerdown=${(e: Event) => e.preventDefault()}
			></nldd-button>
		</div>
	`;
}

export function passwordFieldTemplate(component: NLDDPasswordField): TemplateResult {
	return html`
		<div class="password-field">
			<input class="password-field__input ${component.masked ? 'is-masked' : ''}"
				pattern=${component.pattern || nothing}
				minlength=${component.minlength ?? nothing}
				maxlength=${component.maxlength ?? nothing}
				id=${component.inputId || nothing}
				type=${component.masked ? 'password' : 'text'}
				.value=${component.value}
				placeholder=${component.placeholder || nothing}
				?disabled=${component.disabled}
				?readonly=${component.readonly}
				?required=${component.required}
				name=${component.name || nothing}
				autocomplete=${component.autocomplete || nothing}
				spellcheck="false"
				aria-label=${component.accessibleLabel || nothing}
				aria-invalid=${component.invalid ? 'true' : nothing}
				@keydown=${component._handleKeydown}
				@input=${component._handleInput}
				@change=${component._handleChange}
			/>
			<div class="password-field__input-fade"></div>
			${renderValidationIcon(component)}
			${renderVisibilityToggle(component)}
		</div>
	`;
}
