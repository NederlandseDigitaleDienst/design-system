import { html, nothing } from 'lit';
import { linkRel } from '../../../utilities/link-rel.js';

export type ListItemSegmentControl = 'link' | 'button' | 'checkbox' | 'plain';

export function template(
	control: ListItemSegmentControl,
	href: string | undefined,
	target: string | undefined,
	rel: string | undefined,
	checked: boolean,
	expanded: boolean | undefined,
	current: boolean,
	disabled: boolean,
	accessibleLabel: string,
	actionTabindex?: string,
	popupType?: string,
	popovertarget?: string,
	popoverTargetElement?: Element | null,
	popoverTargetAction?: 'toggle' | 'show' | 'hide',
) {
	const content = html`<slot></slot>`;
	// A control that opens a popup always carries aria-expanded, open or not:
	// without it a screen reader hears a plain button and cannot tell there is
	// anything to open. Elsewhere an absent attribute means "discloses nothing".
	const ariaExpanded = expanded === undefined
		? (popupType ? 'false' : nothing)
		: String(expanded);
	const ariaCurrent = current ? 'page' : nothing;
	const label = accessibleLabel || nothing;

	if (control === 'link') {
		return html`<a class="list-item-segment"
			href=${href ?? nothing}
			target=${target ?? nothing}
			rel=${linkRel(rel, target) || nothing}
			aria-disabled=${disabled ? 'true' : nothing}
			aria-expanded=${ariaExpanded}
			aria-current=${ariaCurrent}
			aria-label=${label}
			tabindex=${actionTabindex ?? nothing}
		>${content}</a>`;
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
