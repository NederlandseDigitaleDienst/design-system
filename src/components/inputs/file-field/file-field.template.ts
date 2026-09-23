import { html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDFileField } from './file-field.js';
import '../../actions/button/button.js';
import '../../actions/icon-button/icon-button.js';
import '../../content/icon/icon.js';

function renderValidationIcon(component: NLDDFileField): TemplateResult | typeof nothing {
	if (!component.invalid && !component.valid) return nothing;

	return html`
		<div class="file-field__validation-icon-area">
			<nldd-icon class="file-field__validation-icon"
				icon=${component.invalid ? 'invalid' : 'valid'}
				aria-hidden="true"
			></nldd-icon>
		</div>
	`;
}

export function fileFieldTemplate(component: NLDDFileField): TemplateResult {
	const buttonSize = component.size === 'sm' ? 'xs' : 'sm';
	const hasFiles = component.files.length > 0;

	return html`
		<div class="file-field">
			<input class="file-field__input"
				type="file"
				id=${component.inputId || nothing}
				accept=${component.accept || nothing}
				?multiple=${component.multiple}
				?disabled=${component.disabled}
				?required=${component.required}
				aria-label=${component.accessibleLabel || nothing}
				@change=${component._handleInputChange}
			>
			<div class="file-field__choose-button">
				<nldd-button
					variant="neutral-tinted"
					size=${component.size}
					text=${component._chooseLabel()}
					accessible-label=${component._chooseAccessibleLabel() || nothing}
					?disabled=${component.disabled}
					@click=${component._handleChoose}
				></nldd-button>
			</div>
			<span class=${classMap({ 'file-field__value': true, 'is-empty': !hasFiles })}>
				${component._valueLabel()}
			</span>
			${hasFiles ? html`
				<div class="file-field__clear-button">
					<nldd-icon-button
						variant="neutral-transparent"
						size=${buttonSize}
						icon="dismiss"
						text=${component._t('components.file-field.clear-action')}
						?disabled=${component.disabled}
						@click=${component._handleClear}
					></nldd-icon-button>
				</div>
			` : nothing}
			${renderValidationIcon(component)}
		</div>
	`;
}
