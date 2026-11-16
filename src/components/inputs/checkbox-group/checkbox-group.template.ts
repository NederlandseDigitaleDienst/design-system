import { html, TemplateResult } from 'lit';
import type { NLDDCheckboxGroup } from './checkbox-group.js';

export function checkboxGroupTemplate(component: NLDDCheckboxGroup): TemplateResult {
	return html`
		<div class="checkbox-group">
			<slot @slotchange=${component._onSlotChange}></slot>
		</div>
	`;
}
