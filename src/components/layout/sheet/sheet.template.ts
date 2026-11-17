/* eslint-disable lit-a11y/click-events-have-key-events -- native dialog handles keyboard via @cancel */
import { html } from 'lit';
import type { NLDDSheet } from './sheet.js';

export function sheetTemplate(component: NLDDSheet) {
	return html`
		<dialog class="sheet"
			aria-label=${component._resolvedAccessibleLabel}
			aria-modal="true"
			@pointerdown=${component._modalOverlay.handlePointerDown}
			@pointerup=${component._modalOverlay.handlePointerUp}
			@click=${component._modalOverlay.handleClick}
			@cancel=${component._modalOverlay.handleCancel}
			@close=${component._modalOverlay.handleClose}
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
