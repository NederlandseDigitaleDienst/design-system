import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { NLDDJustInTimeEducation } from './just-in-time-education.js';

export function justInTimeEducationTemplate(component: NLDDJustInTimeEducation): TemplateResult {
	return html`
		<slot
			@slotchange=${component._handleSlotChange}
			@focusin=${component._handleAdvisedInteraction}
			@pointerdown=${component._handleAdvisedInteraction}
		></slot>
		<div class="just-in-time-education__announcer"
			aria-live="polite"
			aria-atomic="true"
		></div>
		<div class="just-in-time-education"
			popover="manual"
			role=${component.dismissable ? 'dialog' : 'region'}
			tabindex=${component.dismissable ? '-1' : nothing}
			aria-label=${component.text || component._t('components.just-in-time-education.accessible-label')}
			@keydown=${component._handleCalloutKeydown}
		>
			<div class="just-in-time-education__main">
				<div class="just-in-time-education__text-area">
					${component.text ? html`
						<p class="just-in-time-education__text">
							${component.text}
						</p>
					` : nothing}
					${component.supportingText ? html`
						<p class="just-in-time-education__supporting-text">
							${component.supportingText}
						</p>
					` : nothing}
				</div>
				${component.dismissable ? html`
					<div class="just-in-time-education__dismiss-button">
						<nldd-icon-button
							icon="dismiss"
							appearance="neutral-transparent"
							size="md"
							accessible-label=${component._t('components.just-in-time-education.dismiss-action')}
							@click=${component._handleDismiss}
						></nldd-icon-button>
					</div>
				` : nothing}
			</div>
			${component.noArrow ? nothing : html`
				<svg class="just-in-time-education__arrow"
					aria-hidden="true"
				>
					<defs>
						<marker
							id=${component._arrowMarkerId}
							markerWidth="10"
							markerHeight="12"
							refX="0"
							refY="5.78"
							orient="auto"
							markerUnits="userSpaceOnUse"
						>
							<path class="just-in-time-education__arrow-head"
								d="M0,0 L10,5.78 L0,11.55 Z"
							></path>
						</marker>
					</defs>
					<path class="just-in-time-education__arrow-path"
						marker-end=${`url(#${component._arrowMarkerId})`}
					></path>
				</svg>
			`}
		</div>
	`;
}
