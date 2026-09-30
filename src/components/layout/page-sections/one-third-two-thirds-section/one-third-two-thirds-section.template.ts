import { html, TemplateResult } from 'lit';
import type { NLDDOneThirdTwoThirdsSection } from './one-third-two-thirds-section.js';

export function oneThirdTwoThirdsSectionTemplate(component: NLDDOneThirdTwoThirdsSection): TemplateResult {
	return html`
		<section class="one-third-two-thirds-section">
			<div class="one-third-two-thirds-section__body">
				<header class="one-third-two-thirds-section__header"
					hidden
				>
					<slot
						name="header"
						@slotchange=${component._onSlotChange}
					></slot>
				</header>
				<div class="one-third-two-thirds-section__columns">
					<div class="one-third-two-thirds-section__left-column">
						<slot name="left"></slot>
					</div>
					<div class="one-third-two-thirds-section__right-column">
						<slot></slot>
						<slot name="right"></slot>
					</div>
				</div>
				<footer class="one-third-two-thirds-section__footer"
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
