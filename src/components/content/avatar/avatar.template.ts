import { html, nothing, TemplateResult } from 'lit';
import type { NLDDAvatar } from './avatar.js';
import { linkRel } from '../../../utilities/link-rel.js';
import '../tooltip/tooltip.js';

export function avatarTemplate(component: NLDDAvatar): TemplateResult {
	const showImage = Boolean(component.src) && !component._imageFailed;
	const initials = component.resolvedInitials;
	const showInitials = !showImage && initials !== '';
	const showIcon = !showImage && !showInitials;
	// A new-tab link is a change of context, so announce it (WCAG 2.1 SC 3.2.2).
	const opensInNewTabHint = component.href && component.target === '_blank'
		? component._t('components.avatar.opens-in-new-tab-label')
		: '';
	// The control shows no text of its own, so its name comes from
	// accessible-label (or the name it already carries), plus the new-tab hint.
	const controlLabel = [component.accessibleLabel || component.name, opensInNewTabHint]
		.filter(Boolean).join(', ') || nothing;
	// sizes="auto" (valid because the image is lazy) resolves srcset against the
	// avatar's real rendered width; without a fixed size we can't know it here,
	// and the browser would otherwise assume 100vw and pick a huge candidate.
	const content = html`
		${showImage ? html`
			<img class="avatar__image"
				src=${component.src}
				srcset=${component.srcset || nothing}
				sizes=${component.size ? `${component.size}px` : 'auto'}
				alt=""
				loading="lazy"
				decoding="async"
				@error=${component._onImageError}
			>
		` : nothing}
		${showInitials ? html`
			<span class="avatar__initials"
				aria-hidden="true"
			>${initials}</span>
		` : nothing}
		${showIcon ? html`
			<nldd-icon class="avatar__icon"
				name=${component.resolvedIcon}
			></nldd-icon>
		` : nothing}
	`;

	// The shape itself becomes the control, rather than an overlay: an avatar is
	// small and rounded, so a rectangular overlay would take clicks (and paint a
	// focus ring) outside it.
	const shape = component.href
		? html`
			<a class="avatar avatar--interactive"
				href=${component.href}
				target=${component.target || nothing}
				rel=${linkRel(component.rel, component.target) || nothing}
				aria-label=${controlLabel}
				tabindex=${component.noTab ? '-1' : nothing}
			>${content}</a>
		`
		: component.button
			? html`
				<button class="avatar avatar--interactive"
					type="button"
					aria-label=${controlLabel}
					tabindex=${component.noTab ? '-1' : nothing}
				>${content}</button>
			`
			: html`<div class="avatar">${content}</div>`;

	// The name as a tooltip, like nldd-icon-button does for its label: an avatar
	// shows no text, so without this the name is readable by assistive software
	// and by nobody else. Decorative avatars have nothing to say here.
	const tooltipText = component.decorative ? '' : (component.accessibleLabel || component.name);

	return tooltipText && component.tooltipTiming !== 'never'
		? html`
			<nldd-tooltip text=${tooltipText} timing=${component.tooltipTiming}>
				${shape}
			</nldd-tooltip>
		`
		: shape;
}
