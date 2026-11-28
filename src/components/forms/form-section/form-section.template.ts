import { html, TemplateResult } from 'lit';
import type { NLDDFormSection } from './form-section.js';

export function formSectionTemplate(component: NLDDFormSection): TemplateResult {
	return html`
		<div class="form-section">
			<div class="form-section__header"
				hidden
			>
				<slot
					name="header"
					@slotchange=${component._onHeaderSlotChange}
				></slot>
			</div>
			<div class="form-section__main">
				<slot></slot>
			</div>
		</div>
	`;
}
