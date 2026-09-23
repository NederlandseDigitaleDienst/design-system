import { html, nothing, TemplateResult } from 'lit';
import type { NLDDDropdown } from './dropdown.js';
import './../../content/icon/icon.js';

function renderValidationIcon(component: NLDDDropdown): TemplateResult | typeof nothing {
	if (component.invalid) {
		return html`
			<div class="dropdown__validation-icon-area">
				<nldd-icon class="dropdown__validation-icon"
					icon="invalid"
					aria-hidden="true"
				></nldd-icon>
			</div>
		`;
	}
	if (component.valid) {
		return html`
			<div class="dropdown__validation-icon-area">
				<nldd-icon class="dropdown__validation-icon"
					icon="valid"
					aria-hidden="true"
				></nldd-icon>
			</div>
		`;
	}
	return nothing;
}

export function dropdownTemplate(component: NLDDDropdown): TemplateResult {
	return html`
		<div class="dropdown">
			<slot @slotchange=${component._onSlotChange}></slot>
			<span class="dropdown__value">${component._displayValue}</span>
			${renderValidationIcon(component)}
			<div class="dropdown__picker-icon">
				<nldd-icon icon="chevron-up-chevron-down"></nldd-icon>
			</div>
		</div>
	`;
}
