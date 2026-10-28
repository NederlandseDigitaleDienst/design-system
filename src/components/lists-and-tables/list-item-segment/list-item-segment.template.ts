import { html, nothing } from 'lit';
import { linkRel } from '../../../utilities/link-rel.js';

export type ListItemSegmentControl = 'link' | 'button' | 'checkbox' | 'plain';

export function template(
	control: ListItemSegmentControl,
	href: string | undefined,
	target: string | undefined,
	rel: string | undefined,
	download: string | undefined,
	checked: boolean,
	expanded: boolean | undefined,
	current: string | undefined,
	disabled: boolean,
	accessibleLabel: string,
	actionTabindex?: string,
	popupType?: string,
	popovertarget?: string,
	popoverTargetElement?: Element | null,
	popoverTargetAction?: 'toggle' | 'show' | 'hide',
	linkHint = '',
) {
	const content = html`<slot></slot>`;
	// A control that opens a popup always carries aria-expanded, open or not:
	// without it a screen reader hears a plain button and cannot tell there is
	// anything to open. Elsewhere an absent attribute means "discloses nothing".
	const ariaExpanded = expanded === undefined
		? (popupType ? 'false' : nothing)
		: String(expanded);
	const ariaCurrent = current ?? nothing;
	const label = accessibleLabel || nothing;
	// accessible-label replaces the content as the link's name, so the link hint
	// goes into it; otherwise the hint follows the content in a hidden span.
	const linkLabel = accessibleLabel ? [accessibleLabel, linkHint].filter(Boolean).join(', ') : nothing;

	if (control === 'link') {
		return html`<a class="list-item-segment"
			href=${href ?? nothing}
			target=${target ?? nothing}
			rel=${linkRel(rel, target) || nothing}
			download=${download ?? nothing}
			aria-disabled=${disabled ? 'true' : nothing}
			aria-expanded=${ariaExpanded}
			aria-current=${ariaCurrent}
			aria-label=${linkLabel}
			tabindex=${actionTabindex ?? nothing}
		>${content}${linkHint && !accessibleLabel ? html`<span class="list-item-segment__link-hint">, ${linkHint}</span>` : nothing}</a>`;
	}

	if (control === 'checkbox' || control === 'button') {
		return html`<button class="list-item-segment"
			type="button"
			aria-haspopup=${popupType || nothing}
			popovertarget=${popovertarget ?? nothing}
			.popoverTargetElement=${popoverTargetElement ?? null}
			.popoverTargetAction=${popoverTargetAction ?? 'toggle'}
			role=${control === 'checkbox' ? 'checkbox' : nothing}
			aria-checked=${control === 'checkbox' ? String(checked) : nothing}
			aria-expanded=${ariaExpanded}
			aria-current=${ariaCurrent}
			aria-label=${label}
			?disabled=${disabled}
			tabindex=${actionTabindex ?? nothing}
		>${content}</button>`;
	}

	// Plain: no control at all. Used in a listbox parent, where an `option` may
	// not contain interactive descendants — the cells still render, so the row
	// looks unchanged, it just isn't operable.
	return html`<div class="list-item-segment">${content}</div>`;
}
