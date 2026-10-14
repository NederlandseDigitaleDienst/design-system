import { html, TemplateResult } from 'lit';

export function template(): TemplateResult {
	return html`
		<slot></slot>
	`;
}
