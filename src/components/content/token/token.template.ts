import { html, nothing, TemplateResult } from 'lit';
import type { NLDDToken } from './token.js';

/** A dismiss (✕) or menu (⌄) control is a trailing icon-button; the token itself
 *  stays a plain data representation, never the button. */
export function tokenTemplate(component: NLDDToken): TemplateResult {
	return html`
		<div class="token">
			<span class="token__text">${component.text || html`<slot></slot>`}</span>
			${component.control === 'dismiss' ? html`
				<div class="token__dismiss-action">
					<nldd-icon-button
						size="sm"
						variant="neutral-tinted"
						icon="dismiss-small"
						text=${component._dismissLabel}
						accessible-label=${component._dismissLabel}
						tooltip-timing="never"
						?no-tab=${component.roving}
						?disabled=${component.disabled}
						@click=${component._handleDismiss}
					></nldd-icon-button>
				</div>
			` : nothing}
			${component.control === 'menu' ? html`
				<div class="token__menu-action">
					<nldd-icon-button
						size="sm"
						variant="neutral-tinted"
						icon="chevron-down-small"
						text=${component._menuLabel}
						accessible-label=${component._menuLabel}
						tooltip-timing="never"
						popup-type="menu"
						?no-tab=${component.roving}
						?expanded=${component.expanded}
						?disabled=${component.disabled}
						@pointerdown=${component._handleMenuButtonPointerdown}
						@click=${component._handleMenuClick}
					></nldd-icon-button>
				</div>
			` : nothing}
		</div>
		${component.control === 'menu'
			? html`<slot name="menu" @slotchange=${component._onMenuSlotChange}></slot>`
			: nothing}
	`;
}
