import { html, TemplateResult } from 'lit';
import type { NLDDOneHalfOneHalfSection } from './one-half-one-half-section.js';

export function oneHalfOneHalfSectionTemplate(component: NLDDOneHalfOneHalfSection): TemplateResult {
	return html`
		<section class="one-half-one-half-section">
			<div class="one-half-one-half-section__body">
				<header class="one-half-one-half-section__header"
					hidden
				>
					<slot
						name="header"
						@slotchange=${component._onSlotChange}
					></slot>
				</header>
				<div class="one-half-one-half-section__columns">
					<div class="one-half-one-half-section__left-column">
						<slot></slot>
						<slot name="left"></slot>
					</div>
					<div class="one-half-one-half-section__right-column">
						<slot name="right"></slot>
					</div>
				</div>
				<footer class="one-half-one-half-section__footer"
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
