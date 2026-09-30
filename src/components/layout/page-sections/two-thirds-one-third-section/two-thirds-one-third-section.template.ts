import { html, TemplateResult } from 'lit';
import type { NLDDTwoThirdsOneThirdSection } from './two-thirds-one-third-section.js';

export function twoThirdsOneThirdSectionTemplate(component: NLDDTwoThirdsOneThirdSection): TemplateResult {
	return html`
		<section class="two-thirds-one-third-section">
			<div class="two-thirds-one-third-section__body">
				<header class="two-thirds-one-third-section__header"
					hidden
				>
					<slot
						name="header"
						@slotchange=${component._onSlotChange}
					></slot>
				</header>
				<div class="two-thirds-one-third-section__columns">
					<div class="two-thirds-one-third-section__left-column">
						<slot></slot>
						<slot name="left"></slot>
					</div>
					<div class="two-thirds-one-third-section__right-column">
						<slot name="right"></slot>
					</div>
				</div>
				<footer class="two-thirds-one-third-section__footer"
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
