import { html, nothing, TemplateResult } from 'lit';
import type { NLDDHero } from './hero.js';

export function heroTemplate(component: NLDDHero): TemplateResult {
	// Internal media image from media-src, only when nothing is slotted (the
	// slot wins, mirroring nldd-image / nldd-identity).
	const mediaImage = component.mediaSrc && !component._slotHasMedia
		? html`<img
				src=${component.mediaSrc}
				srcset=${component.mediaSrcset || nothing}
				sizes=${component.mediaSizes || nothing}
				alt=${component.mediaAlt}
				loading="eager"
				decoding="async"
			>`
		: nothing;
	return html`
		<section class="hero">
			<div class="hero__body">
				<div class="hero__media"
					?hidden=${!component._hasMedia}
				>
					<slot name="media" @slotchange=${component._onMediaSlotChange}></slot>
					${mediaImage}
				</div>
				<div class="hero__main">
					<slot></slot>
				</div>
			</div>
		</section>
	`;
}
