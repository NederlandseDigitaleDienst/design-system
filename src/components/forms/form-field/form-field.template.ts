/* eslint-disable lit-a11y/click-events-have-key-events -- label delegates to inner input */
import { html, nothing, TemplateResult } from 'lit';
import { renderBold } from '../../../utilities/render-marked.js';
import type { NLDDFormField } from './form-field.js';
import type { NLDDFormFieldHelpText } from './form-field.js';

/* ============================================================
   nldd-form-field
   ============================================================ */

function renderOptional(label: string): TemplateResult {
	return html`<span class="form-field__optional">${label}</span>`;
}

export function formFieldTemplate(component: NLDDFormField): TemplateResult {
	const hasLabel = Boolean(component.label);
	const hasSupportingLabel = Boolean(component.supportingLabel);
	const isHeaderEmpty = !hasLabel && !hasSupportingLabel;

	const headerEl = html`
		<div class="form-field__header ${isHeaderEmpty ? 'is-empty' : ''}">
			${hasLabel ? html`
				<label class="form-field__label"
					@click=${(e: Event) => component._focusInput(e)}
				>
					<span>${renderBold(component.label)}</span>
					${component.optional ? renderOptional(component.optionalLabel) : nothing}
				</label>
			` : nothing}
			${hasSupportingLabel ? html`
				<span class="form-field__supporting-label">${renderBold(component.supportingLabel)}</span>
			` : nothing}
		</div>
	`;

	return html`
		<div class="form-field">
			${headerEl}
			<div class="form-field__main">
				<slot></slot>
				<slot name="help"></slot>
			</div>
		</div>
	`;
}

/* ============================================================
   nldd-form-field-help-text
   ============================================================ */

export function formFieldHelpTextTemplate(_component: NLDDFormFieldHelpText): TemplateResult {
	return html`
		<p class="form-field__help-text">
			<slot></slot>
		</p>
	`;
}
