/* eslint-disable lit-a11y/click-events-have-key-events -- native dialog handles keyboard via @cancel */
import { html, nothing } from 'lit';
import type { NLDDModalDialog } from './modal-dialog.js';

export function modalDialogTemplate(component: NLDDModalDialog) {
	return html`
		<dialog class="modal-dialog"
			role=${component.variant === 'alert' ? 'alertdialog' : nothing}
			aria-label=${component.accessibleLabel || component.text || nothing}
			aria-modal="true"
			@pointerdown=${component._handleDialogPointerDown}
			@click=${component._handleBackdropClick}
			@cancel=${component._handleCancel}
		>
			<nldd-inline-dialog
				variant=${component.variant || nothing}
				icon=${component.icon || nothing}
				text=${component.text || nothing}
				supporting-text=${component.supportingText || nothing}
				horizontal-alignment=${component.horizontalAlignment || nothing}
				heading-level="2"
			>
				<slot></slot>
				<slot
					slot="actions"
					name="actions"
				></slot>
			</nldd-inline-dialog>
			<!-- Inside the dialog, so it escapes the inertness a modal imposes on
			     everything outside it. Plumbing, not consumer API. -->
			<slot name="notifications"></slot>
		</dialog>
	`;
}
