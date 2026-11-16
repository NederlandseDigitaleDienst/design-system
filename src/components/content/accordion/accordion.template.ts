import { html, TemplateResult } from 'lit';
import type { NLDDAccordion } from './accordion.js';

export function accordionTemplate(component: NLDDAccordion): TemplateResult {
	return html`
		<div class="accordion">
			<slot @slotchange=${component._onSlotChange}></slot>
		</div>
	`;
}
