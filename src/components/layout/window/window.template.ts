/* eslint-disable lit-a11y/click-events-have-key-events -- native dialog handles keyboard via @cancel */
import { html, TemplateResult } from 'lit';
import type { NLDDWindow } from './window.js';

export function windowTemplate(component: NLDDWindow): TemplateResult {
	return html`
		<dialog class="window"
			aria-label=${component._resolvedAccessibleLabel}
			aria-modal="true"
			@pointerdown=${component._modal.handlePointerDown}
			@pointerup=${component._modal.handlePointerUp}
			@click=${component._modal.handleClick}
			@cancel=${component._modal.handleCancel}
			@close=${component._modal.handleClose}
		>
			<div class="window__body">
				<slot></slot>
			</div>
			<!-- Inside the dialog, so it escapes the inertness a modal imposes on
			     everything outside it. Plumbing, not consumer API. -->
			<slot name="notifications"></slot>
		</dialog>
	`;
}
