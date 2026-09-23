import { html, TemplateResult } from 'lit';
import type { NLDDSimpleSection } from './simple-section.js';

export function simpleSectionTemplate(component: NLDDSimpleSection): TemplateResult {
	return html`
		<section class="simple-section">
			<div class="simple-section__body">
				<header class="simple-section__header"
					hidden
				>
					<slot
						name="header"
						@slotchange=${component._onSlotChange}
					></slot>
				</header>
				<div class="simple-section__main">
					<slot></slot>
				</div>
				<footer class="simple-section__footer"
					hidden
				>
					<slot
						name="footer"
						@slotchange=${component._onSlotChange}
					></slot>
				</footer>
			</div>
		</section>
	`;
}
