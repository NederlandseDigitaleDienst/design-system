import { html, nothing, TemplateResult } from 'lit';
import type { NLDDSwitchField } from './switch-field.js';
import '../switch/switch.js';

/* eslint-disable lit-a11y/click-events-have-key-events -- label wrapper delegates to inner switch */
export function switchFieldTemplate(component: NLDDSwitchField): TemplateResult {
	return html`
		<div class="switch-field"
			@click=${component._handleLabelClick}
		>
			<div class="switch-field__control">
				<nldd-switch
					color=${component.color || nothing}
					?invalid=${component.invalid}
					?required=${component.required}
					size="sm"
					name=${component.name || nothing}
					value=${component.value}
					?checked=${component.checked}
					?disabled=${component.disabled}
					accessible-label=${component.label || nothing}
					@change=${component._handleChange}
				></nldd-switch>
			</div>
			<span class="switch-field__label">${component.label}</span>
		</div>
	`;
}
