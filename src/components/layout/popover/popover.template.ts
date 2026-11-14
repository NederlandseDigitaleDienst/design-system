import { html, TemplateResult } from 'lit';

export function popoverTemplate(): TemplateResult {
	return html`<div class="popover__scroller"><slot></slot></div>`;
}
