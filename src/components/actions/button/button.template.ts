import { html, nothing } from 'lit';
import type { NLDDButton } from './button.js';
import { linkRel } from '../../../utilities/link-rel.js';

interface TemplateHelpers {
	handleClick: (e: MouseEvent) => void;
}

function renderContent(component: NLDDButton) {
	// `button__text` falls back to the slot on falsy `text`. The property
	// defaults to '', so `text=""` and an absent attribute are indistinguishable
	// — both intentionally render the slot rather than an empty label.
	return html`
		<span class="button__content">
			${component.startIcon ? html`
				<span class="button__start-icon">
					<nldd-icon name=${component.startIcon}></nldd-icon>
				</span>
			` : html`<slot name="start-icon"></slot>`}
			<span class="button__text-area">
				<span class="button__text">${component.text ? component.text : html`<slot name="text"></slot>`}</span>
				${component.supportingText ? html`<span class="button__supporting-text">${component.supportingText}</span>` : nothing}
			</span>
			${component.endIcon ? html`
				<span class="button__end-icon">
					<nldd-icon name=${component.endIcon}></nldd-icon>
				</span>
			` : html`<slot name="end-icon"></slot>`}
		</span>
		${component.expandable ? html`
			<nldd-icon class="button__disclosure-icon"
				name="chevron-down-small"
			></nldd-icon>
		` : nothing}
	`;
}

export function template(this: NLDDButton, helpers: TemplateHelpers) {
	const content = renderContent(this);

	const buttonClass = ['button',
		this.supportingText ? 'has-supporting-text' : '',
	].filter(Boolean).join(' ');

	// `expandable` (disclosure widget signal) or `popup-type` (popup container
	// signal) both require aria-expanded to always be present so screen
	// readers know the current open/closed state. Without one of these, only
	// open=true forwards aria-expanded — keeps plain buttons free of
	// irrelevant ARIA attributes.
	const isDisclosure = this.expandable || !!this.popupType;
	const ariaExpanded = isDisclosure ? String(this.expanded) : (this.expanded ? 'true' : nothing);

	// A new-tab link is a change of context, so announce it (WCAG 2.1 SC 3.2.2).
	// Only the <a> path (href) can open a new tab.
	const opensInNewTabHint = this.href && this.target === '_blank'
		? this._t('components.button.opens-in-new-tab-label')
		: '';

	// `supporting-text` renders in a sibling span next to the text; the
	// accessible-name flat-string algorithm concatenates them without a
	// separator ("OpslaanAlle wijzigingen"). With no explicit accessible-label,
	// join them with a comma so screen readers announce the two apart. Filtering
	// empties keeps a name when only supporting-text is set — otherwise an
	// icon-less button would be nameless. (Slotted text can't be read here —
	// those consumers should set accessible-label.)
	const baseAriaLabel = this.accessibleLabel
		|| (this.supportingText ? [this.text, this.supportingText].filter(Boolean).join(', ') : '');
	// aria-label wins the accessible-name cascade, so when one is set the new-tab
	// hint must live inside it; otherwise `nothing` leaves the name content-derived
	// and the visually-hidden span below appends the hint (it also reaches slotted
	// text, which can't be read into a string here).
	const ariaLabel = baseAriaLabel
		? [baseAriaLabel, opensInNewTabHint].filter(Boolean).join(', ')
		: nothing;
	const renderOpensInNewTabHint = !!opensInNewTabHint && !baseAriaLabel;

	// Loading: an activity indicator overlays the (opacity-hidden) content. It
	// sits OUTSIDE the <button>/<a> (a sibling, overlaid via the host's
	// position:relative) so its role="status" live region can announce "Laden"
	// without joining the button's content-derived accessible name. aria-busy
	// stays on the control as supplementary state. `instant` so it shows the
	// moment loading starts. Sizes: xs:16, sm:20, md:24.
	const ariaBusy = this.loading ? 'true' : nothing;
	const loadingIndicator = this.loading
		? html`
			<div class="button__activity-indicator">
				<nldd-activity-indicator
					timing="instant"
					size=${this.size === 'xs' ? '16' : this.size === 'sm' ? '20' : this.size === 'lg' ? '28' : '24'}
				></nldd-activity-indicator>
			</div>
		`
		: nothing;

	// A single slotted nldd-menu / nldd-popover that this button invokes. Kept in
	// a named slot so it never lands in the text/icon slots; it renders nothing
	// in flow (a popover is display:none until shown in the top layer). See
	// _handleClick.
	const popupSlot = html`<slot name="popup" @slotchange=${this._popup.handleSlotChange}></slot>`;

	if (this.href) {
		const resolvedRel = linkRel(this.rel, this.target);
		return html`
			<a class=${buttonClass}
				href=${this.href}
				target=${this.target || nothing}
				rel=${resolvedRel || nothing}
				aria-disabled=${this.disabled ? 'true' : nothing}
				aria-label=${ariaLabel}
				aria-haspopup=${this.popupType || nothing}
				aria-expanded=${ariaExpanded}
				aria-busy=${ariaBusy}
				tabindex=${this.noTab ? '-1' : nothing}
				@pointerdown=${this._popup.handlePointerdown}
				@click=${helpers.handleClick}
			>
				${content}
				${renderOpensInNewTabHint ? html`<span class="button__opens-in-new-tab-hint">${opensInNewTabHint}</span>` : nothing}
			</a>
			${loadingIndicator}
			${popupSlot}
		`;
	}

	// .popoverTargetElement / .popoverTargetAction are bound unguarded: in
	// browsers without Popover-invoker IDL support Lit sets a harmless expando
	// and the cross-shadow association just doesn't take effect — but those
	// browsers don't support the Popover API at all, so the menu this button
	// drives is non-functional regardless. No per-binding capability check.
	return html`
		<button class=${buttonClass}
			type=${this.type}
			?disabled=${this.disabled}
			aria-disabled=${this.disabled ? 'true' : nothing}
			aria-label=${ariaLabel}
			aria-haspopup=${this.popupType || nothing}
			aria-expanded=${ariaExpanded}
			aria-busy=${ariaBusy}
			tabindex=${this.noTab ? '-1' : nothing}
			popovertarget=${this.popovertarget || nothing}
			.popoverTargetElement=${this.popoverTargetElement}
			.popoverTargetAction=${this.popoverTargetAction}
			@pointerdown=${this._popup.handlePointerdown}
			@click=${helpers.handleClick}
		>
			${content}
		</button>
		${loadingIndicator}
		${popupSlot}
	`;
}
