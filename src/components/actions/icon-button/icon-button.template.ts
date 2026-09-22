import { html, nothing } from 'lit';
import type { NLDDIconButton } from './icon-button.js';
import { linkRel } from '../../../utilities/link-rel.js';
import '../../content/tooltip/tooltip.js';

function renderContent(component: NLDDIconButton) {
	return html`
		<span class="icon-button__icon-area">
			<span class="icon-button__icon">
				${component.icon
					? html`<nldd-icon name=${component.icon}></nldd-icon>`
					: html`<slot name="icon" @slotchange=${component._onIconSlotChange}>
							<nldd-icon name="icon-placeholder"></nldd-icon>
						</slot>`}
			</span>
			${component.expandable ? html`
				<span class="icon-button__disclosure-icon">
					<nldd-icon name="chevron-down-small"></nldd-icon>
				</span>
			` : nothing}
		</span>
		${component.text ? html`
			<span class="icon-button__text">${component.text}</span>
		` : ''}
	`;
}

export function template(this: NLDDIconButton) {
	// A new-tab link is a change of context, so announce it (WCAG 2.1 SC 3.2.2).
	// The control always carries an aria-label, which wins the accessible-name
	// cascade, so fold the hint into it rather than into a hidden span (which it
	// would override). Only the <a> path (href) can open a new tab.
	const opensInNewTabHint = this.href && this.target === '_blank'
		? this._t('components.icon-button.opens-in-new-tab-label')
		: '';
	const baseLabel = this.accessibleLabel || this.text || '';
	const label = [baseLabel, opensInNewTabHint].filter(Boolean).join(', ') || nothing;
	const content = renderContent(this);

	// Tooltip text: accessible-label always, or text when not visible (non-lg).
	// The new-tab hint is screen-reader only, so it stays out of the visual tooltip.
	const tooltipText = this.accessibleLabel
		|| ((this.size !== 'lg' || this.hideLgText) ? this.text : '');

	// `expandable` (disclosure widget signal) or `popup-type` (popup container
	// signal) both require aria-expanded to always be present so screen
	// readers know the current open/closed state. Without one of these, only
	// open=true forwards aria-expanded — keeps plain buttons free of
	// irrelevant ARIA attributes.
	const isDisclosure = this.expandable || !!this.popupType;
	const ariaExpanded = isDisclosure ? String(this.expanded) : (this.expanded ? 'true' : nothing);

	// Loading: an activity indicator overlays the (opacity-hidden) icon. It is
	// rendered OUTSIDE the <button>/<a> AND the optional tooltip wrapper — a
	// Shadow DOM sibling overlaid via the host's position:relative — so its
	// role="status" live region functions reliably (a live region nested inside
	// an interactive element is unreliable in some AT) and announces "Laden".
	// aria-busy stays on the control as supplementary state. `instant` so it
	// shows the moment loading starts. Sizes: xs:16, sm:20, md:24, lg:28.
	const ariaBusy = this.loading ? 'true' : nothing;
	const loadingSize = this.size === 'xs' ? '16'
		: this.size === 'sm' ? '20'
		: this.size === 'lg' ? '28'
		: '24';
	const loadingIndicator = this.loading
		? html`
			<div class="icon-button__activity-indicator">
				<nldd-activity-indicator
					timing="instant"
					size=${loadingSize}
				></nldd-activity-indicator>
			</div>
		`
		: nothing;

	const renderButton = () => {
		if (this.href) {
			const resolvedRel = linkRel(this.rel, this.target);
			return html`
				<a class="icon-button"
					href=${this.href}
					target=${this.target || nothing}
					rel=${resolvedRel || nothing}
					aria-disabled=${this.disabled ? 'true' : nothing}
					aria-label=${label}
					aria-haspopup=${this.popupType || nothing}
					aria-expanded=${ariaExpanded}
					aria-busy=${ariaBusy}
					tabindex=${this.noTab ? '-1' : nothing}
					@pointerdown=${this._popup.handlePointerdown}
					@click=${this._handleClick}
				>
					${content}
				</a>
			`;
		}

		// .popoverTargetElement / .popoverTargetAction are bound unguarded: in
		// browsers without Popover-invoker IDL support Lit sets a harmless
		// expando and the cross-shadow association just doesn't take effect —
		// but those browsers don't support the Popover API at all, so the menu
		// this button drives is non-functional regardless. No capability check.
		return html`
			<button class="icon-button"
				type=${this.type}
				?disabled=${this.disabled}
				aria-disabled=${this.disabled ? 'true' : nothing}
				aria-label=${label}
				aria-haspopup=${this.popupType || nothing}
				aria-expanded=${ariaExpanded}
				aria-busy=${ariaBusy}
				tabindex=${this.noTab ? '-1' : nothing}
				popovertarget=${this.popovertarget || nothing}
				.popoverTargetElement=${this.popoverTargetElement}
				.popoverTargetAction=${this.popoverTargetAction}
				@pointerdown=${this._popup.handlePointerdown}
				@click=${this._handleClick}
			>
				${content}
			</button>
		`;
	};

	// The indicator is a sibling of the control (and of the tooltip wrapper),
	// overlaid via the host's position:relative — keeping its live region out
	// of any interactive ancestor.
	const control = tooltipText && this.tooltipTiming !== 'never'
		? html`
			<nldd-tooltip text=${tooltipText} timing=${this.tooltipTiming}>
				${renderButton()}
			</nldd-tooltip>
		`
		: renderButton();

	// A single slotted nldd-menu / nldd-popover that this button invokes. Named
	// slot so it never lands in the icon slot; it renders nothing in flow (a
	// popover is display:none until shown in the top layer). See _handleClick.
	const popupSlot = html`<slot name="popup" @slotchange=${this._popup.handleSlotChange}></slot>`;

	return html`${control}${loadingIndicator}${popupSlot}`;
}
