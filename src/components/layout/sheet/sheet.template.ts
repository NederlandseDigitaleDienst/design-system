/* eslint-disable lit-a11y/click-events-have-key-events -- native dialog handles keyboard via @cancel */
import { html } from 'lit';
import type { NLDDSheet } from './sheet.js';

export function sheetTemplate(component: NLDDSheet) {
	return html`
		<dialog class="sheet"
			aria-label=${component._resolvedAccessibleLabel}
			aria-modal="true"
			@pointerdown=${component._modal.handlePointerDown}
			@pointerup=${component._modal.handlePointerUp}
			@click=${component._modal.handleClick}
			@cancel=${component._modal.handleCancel}
			@close=${component._modal.handleClose}
		>
			<div class="sheet__body">
				<slot></slot>
			</div>
			<!-- Inside the dialog, so it escapes the inertness a modal imposes on
			     everything outside it. Plumbing, not consumer API. -->
			<slot name="notifications"></slot>
		</dialog>
	`;
}
