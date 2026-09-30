import { html } from 'lit';
import type { NLDDIconCell } from './icon-cell.js';

export function template(this: NLDDIconCell) {
	// The glyph sits in its own box so a row can rotate it (a chevron that
	// opens) without turning the cell: a transform on the cell changes the box
	// getBoundingClientRect() reports, which is what the row measures to place
	// its divider.
	return html`
		<span
			part="icon"
			class="icon-cell__glyph"
		>
			${this.icon
				? html`<nldd-icon icon=${this.icon}></nldd-icon>`
				: html`<slot></slot>`}
		</span>
	`;
}
