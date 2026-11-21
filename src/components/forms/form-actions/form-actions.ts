/**
 * Nederlandse Digitale Dienst Form Actions Component (Lit + TypeScript)
 *
 * A layout wrapper for the action buttons at the bottom of a form (typically a
 * submit button or a button group). Follows the same responsive layout as
 * `nldd-form-field`: with `label-alignment="right"` or `"left"` the content
 * gets the same indent as the fields above it, thanks to a `::before`
 * pseudo-element that acts as the spacer column where the label would sit.
 *
 * Inherits `label-alignment` from a wrapping `nldd-form`. A `label-alignment`
 * of its own wins.
 *
 * @element nldd-form-actions
 * @keywords formulierknoppen
 *
 * @attr {'top'|'right'|'left'} label-alignment - 'top' (default) | 'right' | 'left'. A value of its own wins over the one of a wrapping nldd-form.
 *
 * @slot - Action elements (button, button-group, and so on)
 *
 * @example
 * ```html
 * <nldd-form label-alignment="right">
 *     <nldd-form-field>...</nldd-form-field>
 *     <nldd-form-actions>
 *         <nldd-button-group>
 *             <nldd-button appearance="primary" type="submit" text="Bewaar"></nldd-button>
 *         </nldd-button-group>
 *     </nldd-form-actions>
 * </nldd-form>
 * ```
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { syncFormLabelAlignment } from '../../../utilities/form-label-alignment.js';
import { formActionsStyles } from './form-actions.styles.js';
import { formActionsTemplate } from './form-actions.template.js';

export type LabelAlignment = 'top' | 'left' | 'right';

@customElement('nldd-form-actions')
export class NLDDFormActions extends LitElement {
	static override styles = formActionsStyles;

	/**
	 * Default is `undefined` (and not `'top'`) so Lit doesn't reflect the
	 * default value to the attribute on first update. See `nldd-form-field` for
	 * the explanation, for the same reason: the inherited alignment
	 * applies on `:not([label-alignment])`.
	 */
	@property({ type: String, reflect: true, attribute: 'label-alignment' })
	labelAlignment: LabelAlignment | undefined = undefined;

	override connectedCallback() {
		super.connectedCallback();
		syncFormLabelAlignment(this);
	}

	override render() {
		return formActionsTemplate();
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-form-actions': NLDDFormActions;
	}
}
