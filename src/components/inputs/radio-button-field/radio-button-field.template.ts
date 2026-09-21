import { html, TemplateResult } from 'lit';
import type { NLDDRadioButtonField } from './radio-button-field.js';
import '../radio-button/radio-button.js';

export function radioButtonFieldTemplate(component: NLDDRadioButtonField): TemplateResult {
	// The field itself is the radio: it carries the role, the state and the
	// label it is announced by. The radio button inside only draws the shape,
	// and the input only answers `required` for the form, which a radio asks of
	// its whole group. The name is for the platform: a radio without one is in no
	// group, and a radio in no group never reports a missing value. It is hidden,
	// since rendered it would be a radio inside the element that is the radio, and
	// hidden it still reports.
	return html`
		<div class="radio-button-field">
			<input class="radio-button-field__validation-input"
				type="radio"
				name="nldd-validation"
				hidden
				?required=${component.required}
				?disabled=${component.disabled}
				.checked=${component._answered}
			>
			<div class="radio-button-field__control">
				<nldd-radio-button
					decorative
					?checked=${component.checked}
					?disabled=${component.disabled}
					?focus-ring=${component._focusRing}
				></nldd-radio-button>
			</div>
			<span class="radio-button-field__label">
				${component.label}
			</span>
		</div>
	`;
}
