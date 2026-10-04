import { html, nothing, TemplateResult } from 'lit';
import type { NLDDStepper } from './stepper.js';
import './../../actions/icon-button/icon-button.js';

export function stepperTemplate(component: NLDDStepper): TemplateResult {
	const atMin = component.value <= component.min;
	const atMax = component.value >= component.max;

	return html`
		<div class="stepper"
			role="spinbutton"
			tabindex=${component.disabled ? nothing : '0'}
			aria-valuenow=${component.value}
			aria-valuemin=${isFinite(component.min) ? component.min : nothing}
			aria-valuemax=${isFinite(component.max) ? component.max : nothing}
			aria-label=${component.accessibleLabel || component._t('components.stepper.to-adjust-value-action')}
			aria-disabled=${component.disabled ? 'true' : nothing}
			@keydown=${component._handleKeydown}
		>
			<nldd-icon-button
				appearance="neutral-tinted"
				size=${component.size}
				icon="minus"
				text=${component._t('components.stepper.decrement-action')}
				tooltip-timing="never"
				no-highlight-border
				?disabled=${component.disabled || atMin}
				aria-hidden="true"
				tabindex="-1"
				@click=${component._decrement}
			></nldd-icon-button>
			<div class="stepper__divider"
				aria-hidden="true"
			></div>
			<nldd-icon-button
				appearance="neutral-tinted"
				size=${component.size}
				icon="plus"
				text=${component._t('components.stepper.increment-action')}
				tooltip-timing="never"
				no-highlight-border
				?disabled=${component.disabled || atMax}
				aria-hidden="true"
				tabindex="-1"
				@click=${component._increment}
			></nldd-icon-button>
		</div>
	`;
}
