import { html, nothing } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import type { NLDDTopTitleBar } from './top-title-bar.js';
import '../../actions/button/button.js';
import '../../actions/icon-button/icon-button.js';

// SAFETY: the only tags unsafeStatic ever sees. A heading-level outside the map
// falls back to h1, so no tag name is derived from input.
const HEADING_TAGS: Record<number, ReturnType<typeof unsafeStatic>> = {
	1: unsafeStatic('h1'),
	2: unsafeStatic('h2'),
	3: unsafeStatic('h3'),
	4: unsafeStatic('h4'),
	5: unsafeStatic('h5'),
	6: unsafeStatic('h6'),
};

export function topTitleBarTemplate(component: NLDDTopTitleBar) {
	const showBack = !!component.backText;
	const headingTag = HEADING_TAGS[component.headingLevel] ?? HEADING_TAGS[1];

	return html`
		<div class="top-title-bar">
			<div class="top-title-bar__start">
				${showBack ? html`
					<div class="top-title-bar__back-button">
						<div class="top-title-bar__text-back-button">
							<nldd-button
								variant="accent-transparent"
								start-icon="chevron-left"
								text=${component.backText}
								href=${component.backHref || nothing}
								single-line
								@click=${component._handleBack}
							></nldd-button>
						</div>
						<div class="top-title-bar__icon-back-button">
							<nldd-icon-button
								variant="accent-transparent"
								icon="chevron-left"
								text=${component.backText}
								accessible-label=${component.backText || nothing}
								href=${component.backHref || nothing}
								@click=${component._handleBack}
							></nldd-icon-button>
						</div>
						<div class="top-title-bar__divider"></div>
					</div>
				` : nothing}
				<div class="top-title-bar__title-group"
					aria-hidden=${component._hasAnchor ? 'true' : nothing}
				>
					${staticHtml`<${headingTag} class="top-title-bar__title">${component.text}</${headingTag}>`}
					${component.supportingText ? html`
						<p class="top-title-bar__supporting-text">${component.supportingText}</p>
					` : nothing}
				</div>
			</div>
			<div class="top-title-bar__end"
				?hidden=${!component.dismissText && !component._hasToolbarItems}
			>
				<slot name="toolbar" @slotchange=${component._onToolbarSlotChange}></slot>
				${component.dismissText ? html`
					<div class="top-title-bar__dismiss-button">
						<nldd-button
							variant="accent-transparent"
							text=${component.dismissText}
							@click=${component._handleDismiss}
						></nldd-button>
					</div>
				` : nothing}
			</div>
		</div>
	`;
}
