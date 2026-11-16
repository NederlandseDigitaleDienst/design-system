import { html, TemplateResult } from 'lit';
import type { NLDDAccordionItem } from './accordion-item.js';

export function accordionItemTemplate(component: NLDDAccordionItem): TemplateResult {
	return html`
		<details class="accordion-item"
			?open=${component.open}
			@toggle=${component._onToggle}
		>
			<summary class="accordion-item__title-bar">
				<span class="accordion-item__title">
					${component.text}
				</span>
				<span class="accordion-item__disclosure-icon"
					aria-hidden="true"
				>
					<nldd-icon icon="chevron-down"></nldd-icon>
				</span>
			</summary>
			<div class="accordion-item__content">
				<slot></slot>
			</div>
		</details>
	`;
}
