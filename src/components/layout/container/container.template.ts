import { html, TemplateResult } from 'lit';
import type { NLDDContainer } from './container.js';

export function containerTemplate(component: NLDDContainer): TemplateResult {
	// Three layers: the host is only the external contract (a consumer reset
	// beats normal :host declarations per CSS Scoping, so no padding there),
	// .container carries the padding and is the query container (container-type:
	// inline-size), and .container__inner holds the layout (display, grid,
	// flex, columns) — the CSS spec forbids an element from matching its own
	// container queries, so the layout rules live on a descendant.
	return html`
		<div class="container ${component._isSizedByContent ? 'is-sized-by-content' : ''}">
			<div class="container__inner">
				<slot @slotchange=${component._onSlotChange}></slot>
			</div>
		</div>
	`;
}
