/**
 * Nederlandse Digitale Dienst Modal Dialog Component (Lit + TypeScript)
 *
 * A modal window with overlay backdrop, based on the native <dialog> element.
 * Internally renders an <nldd-inline-dialog> for the visual structure.
 *
 * Use it only when there is no way back, and give it a real choice: a dialog
 * with one button offers nothing to decide, so tell the user with an
 * nldd-notification or an inline message instead. In a destructive dialog the
 * safe way out comes first, as the primary button. Work that needs the page
 * as context, such as editing, belongs in an nldd-sheet. The design guidelines
 * say why. A dialog that opens with one action says so in development.
 *
 * Open and close it with `open`, bound to your state together with the close
 * event: the dialog clears `open` itself when the user closes it. show() and
 * hide() do the same for code without a binding. Keep the dialog in the DOM
 * rather than mounting it when it opens, or the animations are skipped.
 *
 * @element nldd-modal-dialog
 *
 * @attr {'alert'} variant - Forwarded to nldd-inline-dialog; 'alert' forces icon and color
 * @attr {'left'|'center'} horizontal-alignment - Forwarded to nldd-inline-dialog. Unset derives it there: slotted content aligns left, a bare message stays centered.
 * @attr {string} text - Forwarded to nldd-inline-dialog; main text
 * @attr {string} supporting-text - Forwarded to nldd-inline-dialog; supporting text
 * @attr {string} icon - Forwarded to nldd-inline-dialog; absent when not set
 * @attr {string} accessible-label - Accessible name for the dialog (aria-label); falls back to text
 * @attr {boolean} open - Whether the dialog is open. Set it to open or close the dialog, as an alternative to show() and hide(). The dialog clears it itself when it closes another way (Escape, the backdrop), so bind it together with the close event.
 *
 * @slot - Optional custom content, forwarded to nldd-inline-dialog. Puts no space between its children, as a sheet or card does not: the app decides the distance. Put an nldd-spacer between different components, and a group of the same, such as form fields, in an nldd-container with layout="stack" and a gap.
 * @slot actions - nldd-button elements, each with `slot="actions"`, forwarded to nldd-inline-dialog. The dialog puts them in a button group of its own, which sets the gap, the order and the stacking, so no element goes around them. A component of your own that renders a set of them returns a fragment, which adds nothing to the DOM.
 * @slot notifications - Where the notifications area lands while this overlay is open, so a notification is not left inert behind it. Filled by the package; leave it alone.
 *
 * @fires open - When the dialog is opened
 * @fires close - When the dialog is fully closed. Does not bubble: overlays nest, and a listener on one dialog asking about that dialog should not also hear the form it opened.
 *
 * @method show() - Opens the modal dialog
 * @method hide() - Closes the modal dialog with a closing animation
 */
import { LitElement } from 'lit';

import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { modalDialogStyles } from './modal-dialog.styles.js';
import { modalDialogTemplate } from './modal-dialog.template.js';
import { ModalOverlay } from '../../../utilities/modal-overlay.js';
import type { InlineDialogVariant, InlineDialogHorizontalAlignment } from '../inline-dialog/inline-dialog.js';
import '../inline-dialog/inline-dialog.js';

@customElement('nldd-modal-dialog')
export class NLDDModalDialog extends LitElement {
	static override styles = modalDialogStyles;

	@property({ reflect: true, converter: reflectNonDefault<InlineDialogVariant | ''>('') })
	variant: InlineDialogVariant | '' = '';

	@property({ reflect: true, attribute: 'horizontal-alignment', converter: reflectNonDefault<InlineDialogHorizontalAlignment | ''>('') })
	horizontalAlignment: InlineDialogHorizontalAlignment | '' = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	icon = '';

	/** Accessible name for the dialog — forwarded as aria-label. Falls back to text. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Boolean, reflect: true })
	open = false;

	_modalOverlay = new ModalOverlay(this, { animatedClose: true });

	show(): void {
		this._modalOverlay.show();
	}

	hide(): void {
		this._modalOverlay.hide();
	}

	override render() {
		return modalDialogTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-modal-dialog': NLDDModalDialog;
	}
}
