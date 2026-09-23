import { html, nothing, TemplateResult } from 'lit';
import type { NLDDCheckbox } from './checkbox.js';
import './../../content/icon/icon.js';

export function checkboxTemplate(component: NLDDCheckbox): TemplateResult {
	// Decorative: the box only. Something else owns the interaction and the
	// state — a whole row that is itself the control, say — and an input here
	// would be a second control inside it.
	if (component.decorative) {
		return html`
			<div class="checkbox__box" aria-hidden="true">
				<nldd-icon class="checkbox__check-icon" icon="check-mark-small"></nldd-icon>
				<nldd-icon class="checkbox__indeterminate-icon" icon="minus-extra-small"></nldd-icon>
			</div>
		`;
	}
	return html`
		<input class="checkbox__input"
			?required=${component.required}
			type="checkbox"
			.checked=${component.checked}
			.indeterminate=${component.indeterminate}
			?disabled=${component.disabled}
			name=${component.name || ''}
			value=${component.value}
			aria-label=${component.accessibleLabel || nothing}
			tabindex=${component.noTab ? '-1' : nothing}
			@change=${component._handleChange}
		>
		<div class="checkbox__box"
			aria-hidden="true"
		>
			<nldd-icon class="checkbox__check-icon"
				icon="check-mark-small"
			></nldd-icon>
			<nldd-icon class="checkbox__indeterminate-icon"
				icon="minus-extra-small"
			></nldd-icon>
		</div>
	`;
}
