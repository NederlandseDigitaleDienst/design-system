/**
 * Nederlandse Digitale Dienst Form Actions Component (Lit + TypeScript)
 *
 * A layout wrapper for the action buttons at the bottom of a form (typically a
 * submit button or a button group). Follows the same responsive layout as
 * `nldd-form-field`: with `label-alignment="right"` or `"left"` the content
 * gets the same indent as the fields above it, thanks to a `::before`
 * pseudo-element that acts as the spacer column where the label would sit.
 *
 * Inherits `label-alignment` automatically from a wrapping `<nldd-form>`: the
 * form propagates its own `label-alignment` as `form-label-alignment` to
 * descendant `nldd-form-actions` (and `nldd-form-field`) through a
 * MutationObserver. An explicit `label-alignment` on the form-actions itself
 * wins through the CSS cascade, and the form code never touches the
 * `label-alignment` attribute of the descendant.
 *
 *     <nldd-form label-alignment="right">
 *         <nldd-form-field>...</nldd-form-field>
 *         <nldd-form-actions>
 *             <nldd-button-group>
 *                 <nldd-button appearance="primary" type="submit" text="Bewaar"></nldd-button>
 *             </nldd-button-group>
 *         </nldd-form-actions>
 *     </nldd-form>
 *
 * @element nldd-form-actions
 *
 * @attr {string} label-alignment - 'top' (default) | 'right' | 'left'. A value of its own always wins over the inherited form-label-alignment.
 * @attr {string} form-label-alignment - Set by a wrapping nldd-form as a fallback. Do not set it yourself in consumer code.
 *
 * @slot - Action elements (button, button-group, and so on)
 */

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formActionsStyles } from './form-actions.styles.js';
import { formActionsTemplate } from './form-actions.template.js';

export type LabelAlignment = 'top' | 'left' | 'right';

@customElement('nldd-form-actions')
export class NLDDFormActions extends LitElement {
	static override styles = formActionsStyles;

	/**
	 * Default is `undefined` (and not `'top'`) so Lit doesn't reflect the
	 * default value to the attribute on first update. See `nldd-form-field` for
	 * the explanation, for the same reason: the form-label-alignment fallback CSS
	 * works on `:not([label-alignment])`.
	 */
	@property({ type: String, reflect: true, attribute: 'label-alignment' })
	labelAlignment: LabelAlignment | undefined = undefined;

	override render() {
		return formActionsTemplate();
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-form-actions': NLDDFormActions;
	}
}
