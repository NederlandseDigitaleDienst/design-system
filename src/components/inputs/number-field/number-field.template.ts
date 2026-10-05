import { html, nothing, TemplateResult } from 'lit';
import type { NLDDNumberField } from './number-field.js';
import './../../actions/icon-button/icon-button.js';

export function numberFieldTemplate(component: NLDDNumberField): TemplateResult {
	const canDecrease = component.value > component.min;
	const canIncrease = component.value < component.max;
	const iconButtonSize = component.size === 'sm' ? 'xs' : 'sm';

	return html`
		<div class="number-field"
			role="group"
			aria-label=${component._t('components.number-field.to-adjust-value-action')}
		>
			${!component.hideSpinButtons ? html`
				<div class="number-field__decrement-button">
					<nldd-icon-button
						appearance="neutral-tinted"
						size=${iconButtonSize}
						icon="minus"
						text=${component._t('components.number-field.decrement-action')}
						tooltip-timing="never"
						?disabled=${component.disabled || !canDecrease}
						@click=${component._handleDecrease}
					></nldd-icon-button>
				</div>
			` : nothing}
			<input class="number-field__input"
				type="number"
				inputmode=${Number.isInteger(component.step) ? 'numeric' : 'decimal'}
				aria-label=${component.accessibleLabel || nothing}
				.value=${String(component.value)}
				min=${component.min}
				max=${component.max}
				step=${component.step}
				?disabled=${component.disabled}
				name=${component.name || nothing}
				@keydown=${component._handleKeydown}
				@input=${component._handleInput}
				@change=${component._handleChange}
			>
			${!component.hideSpinButtons ? html`
				<div class="number-field__increment-button">
					<nldd-icon-button
						appearance="neutral-tinted"
						size=${iconButtonSize}
						icon="plus"
						text=${component._t('components.number-field.increment-action')}
						tooltip-timing="never"
						?disabled=${component.disabled || !canIncrease}
						@click=${component._handleIncrease}
					></nldd-icon-button>
				</div>
			` : nothing}
		</div>
	`;
}
