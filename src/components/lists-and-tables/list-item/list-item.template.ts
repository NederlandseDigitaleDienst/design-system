import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { linkRel } from '../../../utilities/link-rel.js';

// One flat slot: cells and segments line up in source order, and the
// first/last child IS the row edge (the edge rules in the styles key off
// that). The divider is a sibling of the action so it anchors to the row
// block, not to the widened action box.
const content = html`<slot></slot>`;
const divider = html`<div class="list-item__divider"></div>`;

export const template = (
	button: boolean,
	href: string | undefined,
	target: string | undefined,
	rel: string | undefined,
	opensInNewTabLabel?: string,
	actionTabindex?: string,
	isHighlighted = false,
	checkbox = false,
	radio = false,
	checked = false,
	expanded?: boolean,
	showChildren = false,
	hasCheckedSegment = false,
	disabled = false,
) => {
	const ariaExpanded = expanded === undefined ? nothing : String(expanded);
	// The branch's child rows. `role="group"` is what makes the nesting the
	// hierarchy: assistive technology derives level, position and set size from
	// it, so none of those are authored. Hidden while collapsed — an
	// aria-expanded="false" node with reachable children contradicts itself.
	const children = showChildren
		? html`<div class="list-item__children"
			role="group"
			?hidden=${expanded !== true}
		><slot name="children"></slot></div>`
		: html`<slot name="children" hidden></slot>`;
	// `is-highlighted` paints the listbox active-option highlight (separate from
	// selected). Only the list sets `_highlighted`, and only in listbox mode.
	const blockClass = classMap({
		'list-item': true,
		'is-highlighted': isHighlighted,
		'is-action-checked': hasCheckedSegment,
	});
	if (href) {
		return html`<div class=${blockClass}>
			<a class="list-item__action"
				href=${href}
				target=${target ?? nothing}
				rel=${linkRel(rel, target) || nothing}
				aria-disabled=${disabled ? 'true' : nothing}
				aria-expanded=${ariaExpanded}
				tabindex=${actionTabindex ?? nothing}
			>${content}${
				opensInNewTabLabel ? html`<span class="list-item__opens-in-new-tab-hint">${opensInNewTabLabel}</span>` : nothing
			}</a>
			${divider}
		</div>${children}`;
	}
	if (checkbox) {
		// The row itself carries the checkbox semantics. A real <input> nested in
		// the action would be interactive content inside a <button> (invalid HTML,
		// and AT would announce the button, not the checked state), and a <label>
		// here could not reach a slotted input — label association walks the DOM
		// tree, which a slot's assigned nodes are not part of.
		return html`<div class=${blockClass}>
			<button class="list-item__action"
				type="button"
				role="checkbox"
				?disabled=${disabled}
				aria-checked=${String(checked)}
				aria-expanded=${ariaExpanded}
				tabindex=${actionTabindex ?? nothing}
			>${content}</button>
			${divider}
		</div>${children}`;
	}
	if (radio) {
		// Same reasoning as the checkbox row: the semantics live on the row's own
		// action, so a real <input type="radio"> is not nested in it. A radio
		// belongs to a group, which the parent nldd-list carries as
		// role="radiogroup"; without one the row is a radio with no set to be
		// part of, and AT says so.
		return html`<div class=${blockClass}>
			<button class="list-item__action"
				type="button"
				role="radio"
				?disabled=${disabled}
				aria-checked=${String(checked)}
				tabindex=${actionTabindex ?? nothing}
			>${content}</button>
			${divider}
		</div>${children}`;
	}
	if (button) {
		return html`<div class=${blockClass}>
			<button class="list-item__action"
				type="button"
				?disabled=${disabled}
				aria-expanded=${ariaExpanded}
				tabindex=${actionTabindex ?? nothing}
			>${content}</button>
			${divider}
		</div>${children}`;
	}
	return html`<div class=${blockClass}>
		${content}
		${divider}
	</div>${children}`;
};
