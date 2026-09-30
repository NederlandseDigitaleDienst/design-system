import { html, nothing, TemplateResult } from 'lit';
import type { NLDDSwitch } from './switch.js';
import './../../content/icon/icon.js';

export function switchTemplate(component: NLDDSwitch): TemplateResult {
	return html`
		<input class="switch__input"
			?required=${component.required}
			type="checkbox"
			role="switch"
			.checked=${component.checked}
			aria-checked=${component.checked}
			?disabled=${component.disabled}
			value=${component.value}
			aria-label=${component.accessibleLabel || nothing}
			tabindex=${component.noTab ? '-1' : nothing}
			@change=${component._handleChange}
			@pointerdown=${component._handlePointerDown}
			@pointermove=${component._handlePointerMove}
			@pointerup=${component._handlePointerUp}
			@pointercancel=${component._handlePointerCancel}
			@click=${component._handleClick}
		>
		<div class="switch__track"
			aria-hidden="true"
		>
			<div class="switch__thumb">
				<div class="switch__check">
					<nldd-icon icon="check-mark-small"></nldd-icon>
				</div>
			</div>
		</div>
	`;
}
