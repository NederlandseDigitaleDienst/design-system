/**
 * Nederlandse Digitale Dienst Form Section Component (Lit + TypeScript)
 *
 * A part of a form: a header, and the fields under it in the rhythm of a form.
 * The section owns the distances: between the header and the fields, between
 * the fields, and, in an nldd-form, between one section and the next. What
 * stands in the header is yours, such as an nldd-title, with a text under it
 * or a button beside it, and so is the space between those.
 *
 * A section is no group. A question that takes more than one control is an
 * nldd-form-field with `group`; a section holds questions, and its title is a
 * heading, which a screen reader user can jump to. Give that nldd-title the
 * `heading-level` that fits the page.
 *
 * Outside a form, use an nldd-container.
 *
 * @element nldd-form-section
 * @keywords formuliersectie
 *
 * @slot header - What stands above the fields, such as an nldd-title with a `heading-level`.
 * @slot - The fields of this part of the form.
 *
 * @example
 * <nldd-form>
 *   <nldd-form-section>
 *     <nldd-title slot="header" text="Persoonsgegevens" heading-level="2"></nldd-title>
 *     <nldd-form-field label="Voornaam">...</nldd-form-field>
 *     <nldd-form-field label="Achternaam">...</nldd-form-field>
 *   </nldd-form-section>
 *   <nldd-form-actions>...</nldd-form-actions>
 * </nldd-form>
 */
import { LitElement } from 'lit';
import { customElement } from '../../../utilities/custom-element.js';
import { formSectionStyles } from './form-section.styles.js';
import { formSectionTemplate } from './form-section.template.js';

@customElement('nldd-form-section')
export class NLDDFormSection extends LitElement {
	static override styles = formSectionStyles;

	override render() {
		return formSectionTemplate(this);
	}

	/** Hides the header, and the distance under it, while nothing is in its slot. */
	_onHeaderSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		(slot.parentElement as HTMLElement).hidden = slot.assignedElements().length === 0;
	};
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-form-section': NLDDFormSection;
	}
}
