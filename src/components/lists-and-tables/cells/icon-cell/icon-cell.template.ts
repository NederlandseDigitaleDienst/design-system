import { html } from 'lit';
import type { NLDDIconCell } from './icon-cell.js';

export function template(this: NLDDIconCell) {
	return html`
		${this.icon
			? html`<nldd-icon icon=${this.icon}></nldd-icon>`
			: html`<slot></slot>`}
	`;
}
