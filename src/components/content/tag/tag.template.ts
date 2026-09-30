import { html, nothing } from 'lit';
import type { NLDDTag } from './tag.js';

export function template(component: NLDDTag) {
	const variant = component._effectiveVariant;
	// variant=icon always renders the icon area so the icon-placeholder
	// fallback inside the slot can show when no icon is provided.
	const showIcon = variant === 'icon' || (variant === 'icon-and-text' && component._hasIcon);
	const showText = (variant === 'text' || variant === 'icon-and-text') && component._hasText;
	// icon-only needs an explicit accessible name — the visible text is gone,
	// so the screen reader has nothing to announce without role="img" +
	// aria-label. Hidden slot/text isn't projected into the a11y tree.
	const iconOnly = variant === 'icon' && component._hasIcon && !!component.accessibleLabel;
	return html`
		<span class="tag"
			role=${iconOnly ? 'img' : nothing}
			aria-label=${iconOnly ? component.accessibleLabel : nothing}
		>
			${showIcon ? html`
				<span class="tag__icon">
					${component.icon
						? html`<nldd-icon icon=${component.icon}></nldd-icon>`
						: html`<slot name="icon">${variant === 'icon' ? html`<nldd-icon icon="icon-placeholder"></nldd-icon>` : nothing}</slot>`}
				</span>
			` : nothing}
			${showText ? html`
				<span class="tag__text">
					${component.text ? component.text : html`<slot></slot>`}
				</span>
			` : nothing}
		</span>
	`;
}
