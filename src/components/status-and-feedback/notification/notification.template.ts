import { html, nothing, type TemplateResult } from 'lit';
import type { NLDDNotification } from './notification.js';

export function notificationTemplate(component: NLDDNotification): TemplateResult {
	return html`
		<div class="notification">
			<div class="notification__icon"
				aria-hidden="true"
			>
				<nldd-icon icon=${component._resolvedIcon}></nldd-icon>
			</div>
			<div class="notification__main">
				${component.text ? html`
					<p class="notification__text">
						${component.text}
					</p>
				` : nothing}
				${component.supportingText ? html`
					<p class="notification__supporting-text">
						${component.supportingText}
					</p>
				` : nothing}
				<div class="notification__actions"
					?hidden=${!component._hasActions}
				>
					<slot name="actions" @slotchange=${component._onActionsSlotChange}></slot>
				</div>
			</div>
			<div class="notification__dismiss-button">
				<nldd-icon-button
					icon="dismiss-small"
					size="sm"
					variant="neutral-transparent"
					tooltip-timing="never"
					accessible-label=${component._t('components.notification.dismiss-action')}
					@click=${component._handleDismiss}
				></nldd-icon-button>
			</div>
		</div>
	`;
}
