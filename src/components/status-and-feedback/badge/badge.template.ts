import { html, nothing } from 'lit';
import type { NLDDBadge } from './badge.js';

export function template(component: NLDDBadge) {
	const modifiers = [];
	if (component._isDot) modifiers.push('badge--dot');
	if (component._isIconOnly) modifiers.push('badge--icon-only');
	const classes = ['badge', ...modifiers].join(' ');
	// A badge without text or an icon-only badge has nothing to read, so it carries
	// its own label. Unless it is decorative: then the words beside it already say
	// what the color says, and announcing it again is noise.
	const needsAriaImg = !component.decorative && (component._isDot || component._isIconOnly);

	return html`
		<span class=${classes}
			role=${needsAriaImg ? 'img' : nothing}
			aria-label=${needsAriaImg ? component._ariaLabel : nothing}
			aria-hidden=${component.decorative ? 'true' : nothing}
		>
			${component.pulse ? html`<span class="badge__pulse"></span>` : ''}
			${component.icon ? html`
				<span class="badge__icon">
					<nldd-icon icon=${component.icon}></nldd-icon>
				</span>
			` : ''}
			${component._hasText ? html`<span class="badge__text">${component._displayValue}</span>` : ''}
		</span>
	`;
}
