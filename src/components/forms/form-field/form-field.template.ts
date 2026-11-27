/* eslint-disable lit-a11y/click-events-have-key-events -- label delegates to inner input */
import { html, nothing, TemplateResult } from 'lit';
import { renderBold } from '../../../utilities/render-marked.js';
import type { NLDDFormField } from './form-field.js';

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

	const labelContent = html`
		<span class="form-field__label-text">${renderBold(component.label)}</span>
		${component.optional ? renderOptional(component._t('components.form-field.optional-label')) : nothing}
	`;

	// A group has no control to label or to focus: its label is the name of the
	// group, which the field gives itself.
	const headerEl = html`
		<div class="form-field__header ${isHeaderEmpty ? 'is-empty' : ''}">
			${hasLabel && component.group ? html`
				<span class="form-field__label">
					${labelContent}
				</span>
			` : nothing}
			${hasLabel && !component.group ? html`
				<label class="form-field__label"
					@click=${(e: Event) => component._focusInput(e)}
				>
					${labelContent}
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
				<slot name="help-text">
					${component.helpText ? html`
						<p class="form-field__help-text">
							${renderBold(component.helpText)}
						</p>
					` : nothing}
				</slot>
			</div>
		</div>
	`;
}
